import { EventEmitter } from 'events'
import { z } from 'zod'
import {
  RealTimePrivacyMonitor,
  DataSubjectRequestHandler,
  AIPrivacyRiskEngine,
  MultiJurisdictionCompliance,
  AutomatedPrivacyTesting,
} from './index'

export interface PrivacyWorkflow {
  id: string
  name: string
  description: string
  triggerType: 'event' | 'schedule' | 'manual' | 'threshold' | 'api_call'
  triggerConditions: {
    events?: string[]
    schedule?: {
      frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
      time?: string
      dayOfWeek?: number
      dayOfMonth?: number
    }
    thresholds?: Array<{
      metric: string
      operator: 'greater_than' | 'less_than' | 'equals' | 'not_equals'
      value: number | string
    }>
  }
  actions: PrivacyWorkflowAction[]
  dependencies: string[] // Other workflow IDs that must complete first
  priority: 'low' | 'medium' | 'high' | 'critical'
  timeout: number // milliseconds
  retryPolicy: {
    maxRetries: number
    backoffStrategy: 'fixed' | 'exponential' | 'linear'
    initialDelay: number
  }
  notifications: {
    onStart?: string[]
    onSuccess?: string[]
    onFailure?: string[]
    onTimeout?: string[]
  }
  isActive: boolean
  metadata: Record<string, unknown>
}

export interface PrivacyWorkflowAction {
  id: string
  type:
    | 'audit'
    | 'test'
    | 'assessment'
    | 'notification'
    | 'remediation'
    | 'compliance_check'
    | 'data_subject_request'
    | 'custom'
  name: string
  description: string
  parameters: Record<string, unknown>
  expectedDuration: number // milliseconds
  retryable: boolean
  criticalPath: boolean // If true, workflow fails if this action fails
  rollbackAction?: PrivacyWorkflowAction
}

export interface WorkflowExecution {
  id: string
  workflowId: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout'
  startTime: Date
  endTime?: Date
  duration?: number
  triggeredBy: {
    type: 'event' | 'schedule' | 'manual' | 'threshold' | 'api_call'
    source: string
    metadata?: Record<string, unknown>
  }
  actionResults: Array<{
    actionId: string
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
    startTime?: Date
    endTime?: Date
    result?: unknown
    error?: string
  }>
  metrics: {
    totalActions: number
    completedActions: number
    failedActions: number
    skippedActions: number
  }
  logs: Array<{
    timestamp: Date
    level: 'info' | 'warn' | 'error' | 'debug'
    message: string
    metadata?: Record<string, unknown>
  }>
}

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category:
    | 'compliance'
    | 'risk_management'
    | 'incident_response'
    | 'data_subject_rights'
    | 'monitoring'
    | 'testing'
  actions: PrivacyWorkflowAction[]
  defaultTrigger: PrivacyWorkflow['triggerConditions']
  estimatedDuration: number
  requiredPermissions: string[]
  tags: string[]
}

export class PrivacyWorkflowOrchestrator extends EventEmitter {
  private workflows: Map<string, PrivacyWorkflow> = new Map()
  private activeExecutions: Map<string, WorkflowExecution> = new Map()
  private workflowHistory: WorkflowExecution[] = []
  private templates: Map<string, WorkflowTemplate> = new Map()

  // Component instances
  private monitor: RealTimePrivacyMonitor
  private requestHandler: DataSubjectRequestHandler
  private riskEngine: AIPrivacyRiskEngine
  private compliance: MultiJurisdictionCompliance
  private testing: AutomatedPrivacyTesting

  constructor(private tenantId: string) {
    super()

    // Initialize privacy components
    this.monitor = new RealTimePrivacyMonitor(tenantId)
    this.requestHandler = new DataSubjectRequestHandler(tenantId)
    this.riskEngine = new AIPrivacyRiskEngine(tenantId)
    this.compliance = new MultiJurisdictionCompliance(tenantId)
    this.testing = new AutomatedPrivacyTesting(tenantId)

    this.initializeDefaultWorkflows()
    this.initializeWorkflowTemplates()
    this.setupEventListeners()
  }

  async createWorkflow(workflow: Omit<PrivacyWorkflow, 'id'>): Promise<string> {
    const id = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const fullWorkflow: PrivacyWorkflow = { ...workflow, id }

    this.workflows.set(id, fullWorkflow)

    // Set up triggers
    await this.setupWorkflowTriggers(fullWorkflow)

    this.emit('workflow_created', { workflowId: id, workflow: fullWorkflow })
    return id
  }

  async executeWorkflow(
    workflowId: string,
    triggeredBy: WorkflowExecution['triggeredBy']
  ): Promise<string> {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`)
    }

    if (!workflow.isActive) {
      throw new Error(`Workflow ${workflowId} is not active`)
    }

    // Check dependencies
    const dependenciesComplete = await this.checkWorkflowDependencies(workflow.dependencies)
    if (!dependenciesComplete) {
      throw new Error(`Workflow ${workflowId} dependencies not met`)
    }

    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const execution: WorkflowExecution = {
      id: executionId,
      workflowId,
      status: 'pending',
      startTime: new Date(),
      triggeredBy,
      actionResults: workflow.actions.map((action) => ({
        actionId: action.id,
        status: 'pending',
      })),
      metrics: {
        totalActions: workflow.actions.length,
        completedActions: 0,
        failedActions: 0,
        skippedActions: 0,
      },
      logs: [],
    }

    this.activeExecutions.set(executionId, execution)

    // Start execution in background
    this.runWorkflowExecution(execution, workflow).catch((error) => {
      
    })

    return executionId
  }

  async pauseWorkflow(workflowId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId)
    if (workflow) {
      workflow.isActive = false
      this.emit('workflow_paused', { workflowId })
    }
  }

  async resumeWorkflow(workflowId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId)
    if (workflow) {
      workflow.isActive = true
      await this.setupWorkflowTriggers(workflow)
      this.emit('workflow_resumed', { workflowId })
    }
  }

  async cancelExecution(executionId: string): Promise<void> {
    const execution = this.activeExecutions.get(executionId)
    if (execution && ['pending', 'running'].includes(execution.status)) {
      execution.status = 'cancelled'
      execution.endTime = new Date()
      execution.duration = execution.endTime.getTime() - execution.startTime.getTime()

      this.logExecutionEvent(execution, 'warn', 'Workflow execution cancelled')
      this.activeExecutions.delete(executionId)
      this.workflowHistory.push(execution)

      this.emit('execution_cancelled', { executionId, execution })
    }
  }

  async getWorkflowStatus(workflowId: string): Promise<{
    workflow: PrivacyWorkflow
    activeExecutions: WorkflowExecution[]
    recentExecutions: WorkflowExecution[]
    metrics: {
      totalExecutions: number
      successRate: number
      averageDuration: number
      lastExecution?: Date
    }
  }> {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`)
    }

    const activeExecutions = Array.from(this.activeExecutions.values()).filter(
      (exec) => exec.workflowId === workflowId
    )

    const recentExecutions = this.workflowHistory
      .filter((exec) => exec.workflowId === workflowId)
      .slice(-10)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())

    const allExecutions = [...activeExecutions, ...recentExecutions]
    const completedExecutions = allExecutions.filter((exec) => exec.status === 'completed')

    const metrics = {
      totalExecutions: allExecutions.length,
      successRate:
        allExecutions.length > 0 ? (completedExecutions.length / allExecutions.length) * 100 : 0,
      averageDuration:
        completedExecutions.length > 0
          ? completedExecutions.reduce((sum, exec) => sum + (exec.duration || 0), 0) /
            completedExecutions.length
          : 0,
      lastExecution: allExecutions.length > 0 ? allExecutions[0].startTime : undefined,
    }

    return {
      workflow,
      activeExecutions,
      recentExecutions,
      metrics,
    }
  }

  async createWorkflowFromTemplate(
    templateId: string,
    customizations?: Partial<PrivacyWorkflow>
  ): Promise<string> {
    const template = this.templates.get(templateId)
    if (!template) {
      throw new Error(`Template ${templateId} not found`)
    }

    const workflow: Omit<PrivacyWorkflow, 'id'> = {
      name: template.name,
      description: template.description,
      triggerType: 'manual',
      triggerConditions: template.defaultTrigger,
      actions: template.actions,
      dependencies: [],
      priority: 'medium',
      timeout: template.estimatedDuration * 2, // 2x estimated duration for timeout
      retryPolicy: {
        maxRetries: 3,
        backoffStrategy: 'exponential',
        initialDelay: 5000,
      },
      notifications: {
        onFailure: ['admin@company.com'],
      },
      isActive: true,
      metadata: {
        templateId,
        category: template.category,
        tags: template.tags,
      },
      ...customizations,
    }

    return await this.createWorkflow(workflow)
  }

  getWorkflowTemplates(): WorkflowTemplate[] {
    return Array.from(this.templates.values())
  }

  async getDashboardMetrics(): Promise<{
    totalWorkflows: number
    activeWorkflows: number
    runningExecutions: number
    todayExecutions: number
    successRate: number
    avgExecutionTime: number
    recentActivity: Array<{
      workflowName: string
      status: string
      startTime: Date
      duration?: number
    }>
  }> {
    const totalWorkflows = this.workflows.size
    const activeWorkflows = Array.from(this.workflows.values()).filter((w) => w.isActive).length
    const runningExecutions = this.activeExecutions.size

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayExecutions = this.workflowHistory.filter((exec) => exec.startTime >= today).length

    const completedExecutions = this.workflowHistory.filter((exec) => exec.status === 'completed')
    const successRate =
      this.workflowHistory.length > 0
        ? (completedExecutions.length / this.workflowHistory.length) * 100
        : 0

    const avgExecutionTime =
      completedExecutions.length > 0
        ? completedExecutions.reduce((sum, exec) => sum + (exec.duration || 0), 0) /
          completedExecutions.length
        : 0

    const recentActivity = this.workflowHistory
      .slice(-10)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .map((exec) => {
        const workflow = this.workflows.get(exec.workflowId)
        return {
          workflowName: workflow?.name || 'Unknown Workflow',
          status: exec.status,
          startTime: exec.startTime,
          duration: exec.duration,
        }
      })

    return {
      totalWorkflows,
      activeWorkflows,
      runningExecutions,
      todayExecutions,
      successRate,
      avgExecutionTime,
      recentActivity,
    }
  }

  private async runWorkflowExecution(
    execution: WorkflowExecution,
    workflow: PrivacyWorkflow
  ): Promise<void> {
    execution.status = 'running'
    this.logExecutionEvent(execution, 'info', `Starting workflow execution: ${workflow.name}`)

    // Notify workflow start
    if (workflow.notifications.onStart) {
      await this.sendNotifications(workflow.notifications.onStart, 'workflow_started', {
        execution,
        workflow,
      })
    }

    const startTime = Date.now()
    let workflowTimedOut = false

    // Set up timeout
    const timeoutHandle = setTimeout(() => {
      workflowTimedOut = true
      execution.status = 'timeout'
      this.logExecutionEvent(
        execution,
        'error',
        `Workflow execution timed out after ${workflow.timeout}ms`
      )
    }, workflow.timeout)

    try {
      // Execute actions sequentially
      for (const action of workflow.actions) {
        if (workflowTimedOut) break

        const actionResult = execution.actionResults.find((ar) => ar.actionId === action.id)!
        actionResult.status = 'running'
        actionResult.startTime = new Date()

        this.logExecutionEvent(execution, 'info', `Starting action: ${action.name}`)

        try {
          const result = await this.executeAction(action, execution)

          actionResult.status = 'completed'
          actionResult.endTime = new Date()
          actionResult.result = result
          execution.metrics.completedActions++

          this.logExecutionEvent(execution, 'info', `Completed action: ${action.name}`)
        } catch (error) {
          actionResult.status = 'failed'
          actionResult.endTime = new Date()
          actionResult.error = error.message
          execution.metrics.failedActions++

          this.logExecutionEvent(
            execution,
            'error',
            `Action failed: ${action.name} - ${error.message}`
          )

          // Handle action failure
          if (action.criticalPath) {
            execution.status = 'failed'
            this.logExecutionEvent(
              execution,
              'error',
              'Workflow failed due to critical action failure'
            )
            break
          }

          // Execute rollback if available
          if (action.rollbackAction) {
            try {
              await this.executeAction(action.rollbackAction, execution)
              this.logExecutionEvent(
                execution,
                'info',
                `Rollback completed for action: ${action.name}`
              )
            } catch (rollbackError) {
              this.logExecutionEvent(
                execution,
                'error',
                `Rollback failed for action: ${action.name} - ${rollbackError.message}`
              )
            }
          }
        }
      }

      // Complete workflow execution
      if (!workflowTimedOut && execution.status === 'running') {
        execution.status = execution.metrics.failedActions === 0 ? 'completed' : 'failed'
      }
    } catch (error) {
      execution.status = 'failed'
      this.logExecutionEvent(execution, 'error', `Workflow execution failed: ${error.message}`)
    } finally {
      clearTimeout(timeoutHandle)

      execution.endTime = new Date()
      execution.duration = execution.endTime.getTime() - execution.startTime.getTime()

      // Send notifications
      if (execution.status === 'completed' && workflow.notifications.onSuccess) {
        await this.sendNotifications(workflow.notifications.onSuccess, 'workflow_completed', {
          execution,
          workflow,
        })
      } else if (execution.status === 'failed' && workflow.notifications.onFailure) {
        await this.sendNotifications(workflow.notifications.onFailure, 'workflow_failed', {
          execution,
          workflow,
        })
      } else if (execution.status === 'timeout' && workflow.notifications.onTimeout) {
        await this.sendNotifications(workflow.notifications.onTimeout, 'workflow_timeout', {
          execution,
          workflow,
        })
      }

      this.activeExecutions.delete(execution.id)
      this.workflowHistory.push(execution)

      this.emit('execution_completed', { executionId: execution.id, execution, workflow })
    }
  }

  private async executeAction(
    action: PrivacyWorkflowAction,
    execution: WorkflowExecution
  ): Promise<unknown> {
    switch (action.type) {
      case 'audit':
        return await this.executeAuditAction(action)

      case 'test':
        return await this.executeTestAction(action)

      case 'assessment':
        return await this.executeAssessmentAction(action)

      case 'compliance_check':
        return await this.executeComplianceAction(action)

      case 'data_subject_request':
        return await this.executeDataSubjectRequestAction(action)

      case 'notification':
        return await this.executeNotificationAction(action)

      case 'remediation':
        return await this.executeRemediationAction(action)

      default:
        throw new Error(`Unknown action type: ${action.type}`)
    }
  }

  private async executeAuditAction(action: PrivacyWorkflowAction): Promise<unknown> {
    const { auditType } = action.parameters

    switch (auditType) {
      case 'consent':
        const { ConsentMapper } = await import('./consent-mapper')
        const consentMapper = new ConsentMapper(this.tenantId)
        return await consentMapper.mapConsents()

      case 'data_minimization':
        const { DataMinimizer } = await import('./data-minimizer')
        const dataMinimizer = new DataMinimizer(this.tenantId)
        return await dataMinimizer.auditDataMinimization()

      default:
        throw new Error(`Unknown audit type: ${auditType}`)
    }
  }

  private async executeTestAction(action: PrivacyWorkflowAction): Promise<unknown> {
    const { suiteId } = action.parameters
    return await this.testing.runTestSuite(suiteId)
  }

  private async executeAssessmentAction(_action: PrivacyWorkflowAction): Promise<unknown> {
    return await this.riskEngine.assessPrivacyRisks()
  }

  private async executeComplianceAction(action: PrivacyWorkflowAction): Promise<unknown> {
    const { jurisdictions, dataSubjectLocations, businessLocations, dataProcessing } =
      action.parameters

    return await this.compliance.assessMultiJurisdictionCompliance(
      dataSubjectLocations || ['EU', 'California'],
      businessLocations || ['United States'],
      dataProcessing || ['analytics', 'marketing']
    )
  }

  private async executeDataSubjectRequestAction(action: PrivacyWorkflowAction): Promise<unknown> {
    const { requestType, requestData } = action.parameters

    switch (requestType) {
      case 'submit':
        return await this.requestHandler.submitRequest(requestData)

      case 'process_access':
        return await this.requestHandler.processAccessRequest(requestData.requestId)

      case 'process_deletion':
        return await this.requestHandler.processDeletionRequest(requestData.requestId)

      default:
        throw new Error(`Unknown request type: ${requestType}`)
    }
  }

  private async executeNotificationAction(action: PrivacyWorkflowAction): Promise<unknown> {
    const { recipients, message, urgency } = action.parameters

    // Mock notification - in production, integrate with email/SMS services
    console.log(`📨 Sending notification to ${(recipients as any[]).length} recipients: ${message} (${urgency})`)

    return {
      sent: true,
      recipients: (recipients as any[]).length,
      timestamp: new Date(),
    }
  }

  private async executeRemediationAction(action: PrivacyWorkflowAction): Promise<unknown> {
    const { remediationType, targetIssue } = action.parameters

    // Mock remediation - in production, implement actual fixes
    console.log(`🛠️ Executing remediation: ${remediationType} for ${targetIssue}`)

    return {
      remediated: true,
      type: remediationType,
      timestamp: new Date(),
    }
  }

  private logExecutionEvent(
    execution: WorkflowExecution,
    level: 'info' | 'warn' | 'error' | 'debug',
    message: string,
    metadata?: Record<string, unknown>
  ): void {
    execution.logs.push({
      timestamp: new Date(),
      level,
      message,
      metadata,
    })
  }

  private async sendNotifications(
    recipients: string[],
    eventType: string,
    data: unknown
  ): Promise<void> {
    // Mock notification system - in production, integrate with actual notification services
    console.log(`📬 Notifications sent: ${eventType} to ${recipients.length} recipients`)
  }

  private async setupWorkflowTriggers(workflow: PrivacyWorkflow): Promise<void> {
    if (workflow.triggerType === 'event') {
      workflow.triggerConditions.events?.forEach((event) => {
        this.monitor.on(event, (data) => {
          this.executeWorkflow(workflow.id, {
            type: 'event',
            source: event,
            metadata: data,
          })
        })
      })
    }

    if (workflow.triggerType === 'schedule') {
      // In production, integrate with cron job scheduler
      console.log(
        `⏰ Scheduled workflow ${workflow.name} with frequency: ${workflow.triggerConditions.schedule?.frequency}`
      )
    }
  }

  private async checkWorkflowDependencies(dependencies: string[]): Promise<boolean> {
    // Check if all dependency workflows have completed successfully
    for (const depId of dependencies) {
      const recentExecution = this.workflowHistory
        .filter((exec) => exec.workflowId === depId)
        .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())[0]

      if (!recentExecution || recentExecution.status !== 'completed') {
        return false
      }
    }

    return true
  }

  private setupEventListeners(): void {
    // Listen to privacy events and trigger workflows accordingly
    this.monitor.on('privacy_event', (event) => {
      // Find workflows that should be triggered by this event
      for (const [workflowId, workflow] of this.workflows) {
        if (workflow.isActive && workflow.triggerType === 'event') {
          if (workflow.triggerConditions.events?.includes(event.eventType)) {
            this.executeWorkflow(workflowId, {
              type: 'event',
              source: 'privacy_monitor',
              metadata: event,
            })
          }
        }
      }
    })
  }

  private initializeDefaultWorkflows(): void {
    // Create default privacy workflows
    const defaultWorkflows = [
      {
        name: 'Daily Privacy Health Check',
        description: 'Daily automated privacy compliance health check',
        triggerType: 'schedule' as const,
        triggerConditions: {
          schedule: {
            frequency: 'daily' as const,
            time: '09:00',
          },
        },
        actions: [
          {
            id: 'daily_audit',
            type: 'audit' as const,
            name: 'Run Daily Privacy Audit',
            description: 'Execute consent and data minimization audits',
            parameters: { auditType: 'consent' },
            expectedDuration: 300000,
            retryable: true,
            criticalPath: false,
          },
          {
            id: 'risk_assessment',
            type: 'assessment' as const,
            name: 'Privacy Risk Assessment',
            description: 'Assess current privacy risks using AI',
            parameters: {},
            expectedDuration: 180000,
            retryable: true,
            criticalPath: false,
          },
        ],
        dependencies: [],
        priority: 'medium' as const,
        timeout: 1800000,
        retryPolicy: {
          maxRetries: 2,
          backoffStrategy: 'exponential' as const,
          initialDelay: 60000,
        },
        notifications: {
          onFailure: ['privacy@company.com'],
        },
        isActive: true,
        metadata: { type: 'default', category: 'monitoring' },
      },
    ]

    defaultWorkflows.forEach(async (workflow) => {
      await this.createWorkflow(workflow)
    })
  }

  private initializeWorkflowTemplates(): void {
    const templates: WorkflowTemplate[] = [
      {
        id: 'gdpr_incident_response',
        name: 'GDPR Incident Response',
        description: 'Automated workflow for GDPR data breach incident response',
        category: 'incident_response',
        actions: [
          {
            id: 'assess_breach',
            type: 'assessment',
            name: 'Assess Breach Impact',
            description: 'Evaluate the scope and impact of the data breach',
            parameters: { assessmentType: 'breach_impact' },
            expectedDuration: 600000,
            retryable: false,
            criticalPath: true,
          },
          {
            id: 'notify_authorities',
            type: 'notification',
            name: 'Notify Supervisory Authority',
            description: 'Send breach notification to relevant DPA within 72 hours',
            parameters: {
              recipients: ['dpa@supervisory-authority.eu'],
              urgency: 'critical',
            },
            expectedDuration: 300000,
            retryable: true,
            criticalPath: true,
          },
          {
            id: 'notify_subjects',
            type: 'notification',
            name: 'Notify Data Subjects',
            description: 'Inform affected individuals about the breach',
            parameters: {
              recipients: ['affected_users'],
              urgency: 'high',
            },
            expectedDuration: 900000,
            retryable: true,
            criticalPath: false,
          },
        ],
        defaultTrigger: {
          events: ['breach_detection'],
        },
        estimatedDuration: 1800000,
        requiredPermissions: ['privacy_admin', 'incident_response'],
        tags: ['gdpr', 'incident', 'breach', 'notification'],
      },
      {
        id: 'data_subject_request_automation',
        name: 'Data Subject Request Automation',
        description:
          'Automated processing of data subject access, deletion, and portability requests',
        category: 'data_subject_rights',
        actions: [
          {
            id: 'verify_identity',
            type: 'data_subject_request',
            name: 'Verify Data Subject Identity',
            description: 'Verify the identity of the requesting data subject',
            parameters: { requestType: 'verify_identity' },
            expectedDuration: 300000,
            retryable: true,
            criticalPath: true,
          },
          {
            id: 'process_request',
            type: 'data_subject_request',
            name: 'Process Data Request',
            description: 'Execute the data subject request',
            parameters: { requestType: 'process' },
            expectedDuration: 1200000,
            retryable: true,
            criticalPath: true,
          },
          {
            id: 'notify_completion',
            type: 'notification',
            name: 'Notify Request Completion',
            description: 'Inform data subject that request has been completed',
            parameters: {
              recipients: ['requester'],
              urgency: 'medium',
            },
            expectedDuration: 60000,
            retryable: true,
            criticalPath: false,
          },
        ],
        defaultTrigger: {
          events: ['data_subject_request_submitted'],
        },
        estimatedDuration: 1560000,
        requiredPermissions: ['privacy_admin', 'data_requests'],
        tags: ['data_subject_rights', 'automation', 'gdpr', 'ccpa'],
      },
    ]

    templates.forEach((template) => this.templates.set(template.id, template))
  }
}
