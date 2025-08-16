/**
 * CoreFlow360 - Automation Execution Engine
 * Seamlessly integrates with n8n while providing a simplified interface
 */

import { Workflow, WorkflowExecution, WorkflowExecutionStatus, NodeExecution } from './workflow-types'

export class AutomationExecutor {
  private n8nApiUrl: string
  private n8nApiKey: string
  private redis: any // Redis client for caching and queues

  constructor() {
    this.n8nApiUrl = process.env.N8N_API_URL || 'http://localhost:5678/api/v1'
    this.n8nApiKey = process.env.N8N_API_KEY || ''
  }

  /**
   * Deploy workflow to n8n and activate it
   */
  async deployWorkflow(workflow: Workflow): Promise<{ success: boolean; n8nWorkflowId?: string; error?: string }> {
    try {
      // Convert CoreFlow360 workflow to n8n format
      const n8nWorkflow = this.convertToN8nFormat(workflow)
      
      // Create workflow in n8n
      const createResponse = await fetch(`${this.n8nApiUrl}/workflows`, {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': this.n8nApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(n8nWorkflow)
      })

      if (!createResponse.ok) {
        throw new Error(`Failed to create n8n workflow: ${createResponse.statusText}`)
      }

      const createdWorkflow = await createResponse.json()
      const n8nWorkflowId = createdWorkflow.id

      // Activate the workflow
      const activateResponse = await fetch(`${this.n8nApiUrl}/workflows/${n8nWorkflowId}/activate`, {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': this.n8nApiKey
        }
      })

      if (!activateResponse.ok) {
        throw new Error(`Failed to activate workflow: ${activateResponse.statusText}`)
      }

      return { success: true, n8nWorkflowId }

    } catch (error) {
      console.error('Workflow deployment error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown deployment error'
      }
    }
  }

  /**
   * Execute workflow manually with input data
   */
  async executeWorkflow(
    workflowId: string, 
    inputData: Record<string, any> = {},
    tenantId: string
  ): Promise<WorkflowExecution> {
    const execution: WorkflowExecution = {
      id: this.generateExecutionId(),
      workflowId,
      triggeredBy: 'manual',
      startTime: new Date(),
      status: WorkflowExecutionStatus.RUNNING,
      inputData,
      nodeExecutions: [],
      totalDuration: 0,
      nodeCount: 0,
      tenantId
    }

    try {
      // Trigger n8n workflow execution
      const response = await fetch(`${this.n8nApiUrl}/workflows/${workflowId}/execute`, {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': this.n8nApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: inputData,
          pinData: {}
        })
      })

      if (!response.ok) {
        throw new Error(`Execution failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      // Update execution with results
      execution.endTime = new Date()
      execution.status = result.finished ? WorkflowExecutionStatus.COMPLETED : WorkflowExecutionStatus.FAILED
      execution.totalDuration = execution.endTime.getTime() - execution.startTime.getTime()
      execution.outputData = result.data
      
      // Process node executions
      if (result.executionData) {
        execution.nodeExecutions = this.processNodeExecutions(result.executionData)
        execution.nodeCount = execution.nodeExecutions.length
      }

      // Store execution record
      await this.storeExecution(execution)

      return execution

    } catch (error) {
      execution.status = WorkflowExecutionStatus.FAILED
      execution.endTime = new Date()
      execution.totalDuration = execution.endTime.getTime() - execution.startTime.getTime()
      execution.errors = [{
        nodeId: 'workflow',
        errorType: 'execution',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      }]

      await this.storeExecution(execution)
      return execution
    }
  }

  /**
   * Get workflow execution status
   */
  async getExecutionStatus(executionId: string): Promise<WorkflowExecution | null> {
    try {
      // First check our local storage
      const localExecution = await this.getStoredExecution(executionId)
      if (localExecution) {
        return localExecution
      }

      // If not found locally, check n8n
      const response = await fetch(`${this.n8nApiUrl}/executions/${executionId}`, {
        headers: {
          'X-N8N-API-KEY': this.n8nApiKey
        }
      })

      if (!response.ok) {
        return null
      }

      const n8nExecution = await response.json()
      
      // Convert n8n execution to our format
      return this.convertFromN8nExecution(n8nExecution)

    } catch (error) {
      console.error('Error getting execution status:', error)
      return null
    }
  }

  /**
   * Stop a running workflow execution
   */
  async stopExecution(executionId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.n8nApiUrl}/executions/${executionId}/stop`, {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': this.n8nApiKey
        }
      })

      return response.ok

    } catch (error) {
      console.error('Error stopping execution:', error)
      return false
    }
  }

  /**
   * Get workflow execution history
   */
  async getExecutionHistory(
    workflowId: string, 
    limit: number = 50,
    offset: number = 0
  ): Promise<WorkflowExecution[]> {
    try {
      const response = await fetch(
        `${this.n8nApiUrl}/executions?workflowId=${workflowId}&limit=${limit}&offset=${offset}`,
        {
          headers: {
            'X-N8N-API-KEY': this.n8nApiKey
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to get execution history: ${response.statusText}`)
      }

      const result = await response.json()
      
      // Convert n8n executions to our format
      return result.data.map((execution: any) => this.convertFromN8nExecution(execution))

    } catch (error) {
      console.error('Error getting execution history:', error)
      return []
    }
  }

  /**
   * Convert CoreFlow360 workflow to n8n format
   */
  private convertToN8nFormat(workflow: Workflow): any {
    const n8nNodes = workflow.nodes.map(node => ({
      id: node.id,
      name: node.label,
      type: this.mapNodeTypeToN8n(node.type),
      position: [node.position.x, node.position.y],
      parameters: this.mapNodeDataToN8n(node.data, node.type),
      typeVersion: 1
    }))

    const n8nConnections = this.convertConnectionsToN8n(workflow.connections)

    return {
      name: workflow.name,
      active: workflow.isActive,
      nodes: n8nNodes,
      connections: n8nConnections,
      settings: {
        executionOrder: 'v1',
        saveManualExecutions: true,
        callerPolicy: 'workflowsFromSameOwner',
        errorWorkflow: undefined,
        timezone: 'America/New_York'
      },
      staticData: {},
      meta: {
        coreflow360Id: workflow.id,
        generatedByAI: workflow.generatedByAI,
        originalDescription: workflow.originalDescription
      }
    }
  }

  /**
   * Map CoreFlow360 node types to n8n node types
   */
  private mapNodeTypeToN8n(nodeType: string): string {
    const mapping: Record<string, string> = {
      'TRIGGER_WEBHOOK': 'n8n-nodes-base.webhook',
      'TRIGGER_EMAIL': 'n8n-nodes-base.emailReadImap',
      'TRIGGER_FORM_SUBMIT': 'n8n-nodes-base.webhook',
      'TRIGGER_CRM_EVENT': 'n8n-nodes-base.webhook',
      'TRIGGER_TIME_BASED': 'n8n-nodes-base.cron',
      
      'ACTION_SEND_EMAIL': 'n8n-nodes-base.emailSend',
      'ACTION_CREATE_TASK': 'n8n-nodes-base.httpRequest',
      'ACTION_UPDATE_CRM': 'n8n-nodes-base.httpRequest',
      'ACTION_SEND_SMS': 'n8n-nodes-base.twilioSms',
      'ACTION_WEBHOOK_CALL': 'n8n-nodes-base.httpRequest',
      
      'LOGIC_CONDITION': 'n8n-nodes-base.if',
      'LOGIC_DELAY': 'n8n-nodes-base.wait',
      'LOGIC_FILTER': 'n8n-nodes-base.filter',
      'LOGIC_SPLIT': 'n8n-nodes-base.splitInBatches',
      
      'INTEGRATION_SLACK': 'n8n-nodes-base.slack',
      'INTEGRATION_GOOGLE_SHEETS': 'n8n-nodes-base.googleSheets'
    }

    return mapping[nodeType] || 'n8n-nodes-base.httpRequest'
  }

  /**
   * Map CoreFlow360 node data to n8n parameters
   */
  private mapNodeDataToN8n(data: any, nodeType: string): any {
    // This would contain the logic to map our node configuration
    // to n8n-specific parameters for each node type
    
    switch (nodeType) {
      case 'ACTION_SEND_EMAIL':
        return {
          authentication: 'none',
          smtpHost: 'smtp.gmail.com',
          smtpPort: 587,
          secure: false,
          from: data.fromEmail || 'noreply@coreflow360.com',
          to: data.toEmail || '={{$json["email"]}}',
          subject: data.subject || 'Notification from CoreFlow360',
          text: data.message || 'This is an automated message.',
          attachments: data.attachments || []
        }

      case 'ACTION_CREATE_TASK':
        return {
          authentication: 'none',
          requestMethod: 'POST',
          url: data.apiEndpoint || process.env.COREFLOW360_API_URL + '/api/tasks',
          jsonParameters: true,
          bodyParametersJson: JSON.stringify({
            title: data.taskTitle || '={{$json["title"]}}',
            description: data.taskDescription || '={{$json["description"]}}',
            assignedTo: data.assignedTo || '={{$json["assignedTo"]}}',
            dueDate: data.dueDate || '={{$json["dueDate"]}}'
          }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.COREFLOW360_API_TOKEN}`
          }
        }

      case 'LOGIC_CONDITION':
        return {
          conditions: {
            boolean: [],
            number: data.conditions?.filter((c: any) => 
              ['greater_than', 'less_than', 'equals'].includes(c.operator)
            ).map((c: any) => ({
              value1: `={{$json["${c.field}"]}}`,
              operation: this.mapOperatorToN8n(c.operator),
              value2: c.value
            })) || [],
            string: data.conditions?.filter((c: any) => 
              ['contains', 'equals', 'starts_with'].includes(c.operator)
            ).map((c: any) => ({
              value1: `={{$json["${c.field}"]}}`,
              operation: this.mapOperatorToN8n(c.operator),
              value2: c.value
            })) || []
          },
          combineOperation: 'all'
        }

      case 'LOGIC_DELAY':
        return {
          amount: data.delayAmount || 1,
          unit: data.delayUnit || 'minutes'
        }

      default:
        return data.configuration || {}
    }
  }

  /**
   * Convert connections to n8n format
   */
  private convertConnectionsToN8n(connections: any[]): any {
    const n8nConnections: any = {}

    connections.forEach(conn => {
      if (!n8nConnections[conn.sourceNodeId]) {
        n8nConnections[conn.sourceNodeId] = { main: [[]] }
      }

      n8nConnections[conn.sourceNodeId].main[0].push({
        node: conn.targetNodeId,
        type: 'main',
        index: 0
      })
    })

    return n8nConnections
  }

  /**
   * Map comparison operators to n8n format
   */
  private mapOperatorToN8n(operator: string): string {
    const mapping: Record<string, string> = {
      'equals': 'equal',
      'not_equals': 'notEqual',
      'greater_than': 'larger',
      'less_than': 'smaller',
      'contains': 'contains',
      'not_contains': 'notContains',
      'starts_with': 'startsWith',
      'ends_with': 'endsWith',
      'is_empty': 'isEmpty',
      'is_not_empty': 'isNotEmpty'
    }

    return mapping[operator] || 'equal'
  }

  /**
   * Process n8n execution data into our format
   */
  private processNodeExecutions(executionData: any): NodeExecution[] {
    const nodeExecutions: NodeExecution[] = []

    if (executionData.resultData && executionData.resultData.runData) {
      Object.entries(executionData.resultData.runData).forEach(([nodeId, execData]: [string, any]) => {
        const execution: NodeExecution = {
          nodeId,
          startTime: new Date(execData[0].startTime),
          endTime: new Date(execData[0].executionTime + execData[0].startTime),
          status: execData[0].error ? 'failed' : 'completed',
          inputData: execData[0].data?.main?.[0] || {},
          outputData: execData[0].data?.main?.[0] || {},
          duration: execData[0].executionTime || 0,
          error: execData[0].error?.message
        }
        nodeExecutions.push(execution)
      })
    }

    return nodeExecutions
  }

  /**
   * Convert n8n execution to our format
   */
  private convertFromN8nExecution(n8nExecution: any): WorkflowExecution {
    return {
      id: n8nExecution.id,
      workflowId: n8nExecution.workflowId,
      triggeredBy: n8nExecution.mode || 'unknown',
      startTime: new Date(n8nExecution.startedAt),
      endTime: n8nExecution.stoppedAt ? new Date(n8nExecution.stoppedAt) : undefined,
      status: this.mapN8nStatusToOurs(n8nExecution.finished, n8nExecution.stoppedAt),
      inputData: n8nExecution.data?.startData || {},
      outputData: n8nExecution.data?.resultData || {},
      nodeExecutions: this.processNodeExecutions(n8nExecution.data || {}),
      totalDuration: n8nExecution.stoppedAt ? 
        new Date(n8nExecution.stoppedAt).getTime() - new Date(n8nExecution.startedAt).getTime() : 0,
      nodeCount: Object.keys(n8nExecution.data?.resultData?.runData || {}).length,
      tenantId: '' // Would need to be stored in n8n metadata
    }
  }

  /**
   * Map n8n execution status to ours
   */
  private mapN8nStatusToOurs(finished: boolean, stoppedAt?: string): WorkflowExecutionStatus {
    if (!stoppedAt) return WorkflowExecutionStatus.RUNNING
    if (finished) return WorkflowExecutionStatus.COMPLETED
    return WorkflowExecutionStatus.FAILED
  }

  /**
   * Generate unique execution ID
   */
  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Store execution in database/cache
   */
  private async storeExecution(execution: WorkflowExecution): Promise<void> {
    // In a real implementation, this would store in PostgreSQL
    // For now, we'll store in Redis for caching
    try {
      if (this.redis) {
        await this.redis.setex(
          `execution:${execution.id}`, 
          86400, // 24 hours TTL
          JSON.stringify(execution)
        )
      }
    } catch (error) {
      console.error('Failed to store execution:', error)
    }
  }

  /**
   * Get stored execution
   */
  private async getStoredExecution(executionId: string): Promise<WorkflowExecution | null> {
    try {
      if (this.redis) {
        const stored = await this.redis.get(`execution:${executionId}`)
        return stored ? JSON.parse(stored) : null
      }
      return null
    } catch (error) {
      console.error('Failed to get stored execution:', error)
      return null
    }
  }

  /**
   * Health check for n8n connection
   */
  async healthCheck(): Promise<{ healthy: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.n8nApiUrl}/workflows`, {
        headers: {
          'X-N8N-API-KEY': this.n8nApiKey
        }
      })

      return { healthy: response.ok }
    } catch (error) {
      return { 
        healthy: false, 
        error: error instanceof Error ? error.message : 'Connection failed'
      }
    }
  }

  /**
   * Get n8n system status
   */
  async getSystemStatus(): Promise<{
    activeWorkflows: number
    runningExecutions: number
    queuedExecutions: number
  }> {
    try {
      // This would call n8n's status endpoints
      // For now, return mock data
      return {
        activeWorkflows: 0,
        runningExecutions: 0,
        queuedExecutions: 0
      }
    } catch (error) {
      console.error('Error getting system status:', error)
      return {
        activeWorkflows: 0,
        runningExecutions: 0,
        queuedExecutions: 0
      }
    }
  }
}

export default AutomationExecutor