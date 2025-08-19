/**
 * CoreFlow360 - Cross-Module Workflows
 * Implement conditional workflows that span multiple modules based on subscriptions
 */

import {
  publishModuleEvent,
  subscribeToModuleEvents,
} from '@/services/events/subscription-aware-event-bus'
import { moduleManager } from '@/services/subscription/module-manager'
import SubscriptionAwareAIOrchestrator from '@/ai/orchestration/subscription-aware-orchestrator'
import { TaskType } from '@/ai/orchestration/ai-agent-orchestrator'

export interface CrossModuleWorkflow {
  id: string
  name: string
  description: string
  requiredModules: string[]
  triggerEvents: WorkflowTrigger[]
  steps: WorkflowStep[]
  conditions: WorkflowCondition[]
  isActive: boolean
}

export interface WorkflowTrigger {
  eventType: string
  sourceModule: string
  conditions?: Record<string, unknown>
}

export interface WorkflowStep {
  id: string
  name: string
  type: 'ai_analysis' | 'data_sync' | 'notification' | 'approval' | 'external_api'
  module: string
  action: string
  parameters: Record<string, unknown>
  nextSteps: string[]
  fallbackSteps?: string[]
}

export interface WorkflowCondition {
  field: string
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'exists'
  value: unknown
  moduleSource: string
}

export interface WorkflowExecution {
  id: string
  workflowId: string
  tenantId: string
  status: 'running' | 'completed' | 'failed' | 'paused'
  currentStep: string
  context: Record<string, unknown>
  startedAt: Date
  completedAt?: Date
  error?: string
}

export class CrossModuleWorkflowEngine {
  private workflows: Map<string, CrossModuleWorkflow> = new Map()
  private activeExecutions: Map<string, WorkflowExecution> = new Map()
  private aiOrchestrator?: SubscriptionAwareAIOrchestrator

  constructor(aiOrchestrator?: SubscriptionAwareAIOrchestrator) {
    this.aiOrchestrator = aiOrchestrator
    this.initializeDefaultWorkflows()
    this.setupEventSubscriptions()
  }

  /**
   * Initialize pre-built cross-module workflows
   */
  private initializeDefaultWorkflows(): void {
    // Lead to Hire Workflow (CRM + HR)
    this.workflows.set('lead-to-hire', {
      id: 'lead-to-hire',
      name: 'Lead to Hire Workflow',
      description: 'Track conversion from sales leads to potential hires',
      requiredModules: ['crm', 'hr'],
      triggerEvents: [
        {
          eventType: 'deal.won',
          sourceModule: 'crm',
          conditions: { deal_value: { $gt: 50000 }, customer_type: 'enterprise' },
        },
      ],
      steps: [
        {
          id: 'analyze-growth-needs',
          name: 'Analyze Growth Requirements',
          type: 'ai_analysis',
          module: 'hr',
          action: 'predict_hiring_needs',
          parameters: { context: 'deal_expansion' },
          nextSteps: ['create-job-requisition'],
        },
        {
          id: 'create-job-requisition',
          name: 'Create Job Requisition',
          type: 'data_sync',
          module: 'hr',
          action: 'create_requisition',
          parameters: { auto_approve: false },
          nextSteps: ['notify-hiring-manager'],
        },
        {
          id: 'notify-hiring-manager',
          name: 'Notify Hiring Manager',
          type: 'notification',
          module: 'hr',
          action: 'send_notification',
          parameters: { template: 'growth_opportunity' },
          nextSteps: [],
        },
      ],
      conditions: [],
      isActive: true,
    })

    // Quote to Cash Workflow (CRM + Accounting)
    this.workflows.set('quote-to-cash', {
      id: 'quote-to-cash',
      name: 'Quote to Cash Workflow',
      description: 'Automate the process from quote approval to payment collection',
      requiredModules: ['crm', 'accounting'],
      triggerEvents: [
        {
          eventType: 'quote.accepted',
          sourceModule: 'crm',
        },
      ],
      steps: [
        {
          id: 'create-invoice',
          name: 'Create Invoice',
          type: 'data_sync',
          module: 'accounting',
          action: 'create_invoice_from_quote',
          parameters: { auto_send: true },
          nextSteps: ['track-payment'],
        },
        {
          id: 'track-payment',
          name: 'Track Payment Status',
          type: 'ai_analysis',
          module: 'accounting',
          action: 'predict_payment_timeline',
          parameters: { customer_history: true },
          nextSteps: ['payment-reminder'],
          fallbackSteps: ['escalate-collections'],
        },
        {
          id: 'payment-reminder',
          name: 'Send Payment Reminder',
          type: 'notification',
          module: 'accounting',
          action: 'send_payment_reminder',
          parameters: { days_after: 7 },
          nextSteps: [],
        },
      ],
      conditions: [],
      isActive: true,
    })

    // Inventory Demand Forecasting (CRM + Inventory + Projects)
    this.workflows.set('demand-forecasting', {
      id: 'demand-forecasting',
      name: 'Intelligent Demand Forecasting',
      description: 'Use CRM deals and project data to forecast inventory needs',
      requiredModules: ['crm', 'inventory', 'projects'],
      triggerEvents: [
        {
          eventType: 'deal.pipeline_updated',
          sourceModule: 'crm',
        },
        {
          eventType: 'project.milestone_reached',
          sourceModule: 'projects',
        },
      ],
      steps: [
        {
          id: 'analyze-demand-patterns',
          name: 'Analyze Demand Patterns',
          type: 'ai_analysis',
          module: 'inventory',
          action: 'forecast_demand',
          parameters: {
            include_crm_pipeline: true,
            include_project_requirements: true,
            forecast_period: 90,
          },
          nextSteps: ['generate-purchase-recommendations'],
        },
        {
          id: 'generate-purchase-recommendations',
          name: 'Generate Purchase Recommendations',
          type: 'ai_analysis',
          module: 'inventory',
          action: 'optimize_purchasing',
          parameters: { cost_optimization: true },
          nextSteps: ['notify-procurement'],
        },
        {
          id: 'notify-procurement',
          name: 'Notify Procurement Team',
          type: 'notification',
          module: 'inventory',
          action: 'send_procurement_alert',
          parameters: { urgency_threshold: 'medium' },
          nextSteps: [],
        },
      ],
      conditions: [
        {
          field: 'confidence_score',
          operator: 'greater_than',
          value: 0.75,
          moduleSource: 'inventory',
        },
      ],
      isActive: true,
    })

    // Employee Performance to Sales Correlation (HR + CRM)
    this.workflows.set('performance-sales-correlation', {
      id: 'performance-sales-correlation',
      name: 'Performance-Sales Correlation Analysis',
      description: 'Correlate employee performance reviews with sales outcomes',
      requiredModules: ['hr', 'crm'],
      triggerEvents: [
        {
          eventType: 'performance.reviewed',
          sourceModule: 'hr',
        },
      ],
      steps: [
        {
          id: 'correlate-performance-sales',
          name: 'Correlate Performance with Sales',
          type: 'ai_analysis',
          module: 'crm',
          action: 'analyze_performance_impact',
          parameters: { time_window: 90 },
          nextSteps: ['generate-insights'],
        },
        {
          id: 'generate-insights',
          name: 'Generate Performance Insights',
          type: 'ai_analysis',
          module: 'hr',
          action: 'generate_coaching_recommendations',
          parameters: { include_sales_data: true },
          nextSteps: ['notify-manager'],
        },
        {
          id: 'notify-manager',
          name: 'Notify Sales Manager',
          type: 'notification',
          module: 'hr',
          action: 'send_performance_insights',
          parameters: { confidential: true },
          nextSteps: [],
        },
      ],
      conditions: [],
      isActive: true,
    })
  }

  /**
   * Set up event subscriptions for workflow triggers
   */
  private async setupEventSubscriptions(): void {
    for (const workflow of this.workflows.values()) {
      for (const trigger of workflow.triggerEvents) {
        const subscriptionId = await subscribeToModuleEvents(
          '*', // Listen for all tenants
          trigger.sourceModule,
          workflow.requiredModules[0], // Primary target module
          [trigger.eventType],
          async (event) => {
            await this.handleWorkflowTrigger(workflow.id, event.tenantId, event)
          }
        )
      }
    }
  }

  /**
   * Handle workflow trigger events
   */
  private async handleWorkflowTrigger(
    workflowId: string,
    tenantId: string,
    triggerEvent: Record<string, unknown>
  ): Promise<void> {
    try {
      const workflow = this.workflows.get(workflowId)
      if (!workflow || !workflow.isActive) {
        return
      }

      // Check if tenant has required module subscriptions
      const hasRequiredModules = await this.validateWorkflowSubscription(workflow, tenantId)
      if (!hasRequiredModules) {
        console.log(
          `⚠️ Workflow ${workflowId} blocked for tenant ${tenantId} - insufficient modules`
        )
        await this.logWorkflowBlocked(
          workflowId,
          tenantId,
          'insufficient_modules',
          workflow.requiredModules
        )
        return
      }

      // Check workflow conditions
      const conditionsMet = await this.evaluateWorkflowConditions(
        workflow.conditions,
        triggerEvent,
        tenantId
      )
      if (!conditionsMet) {
        return
      }

      // Start workflow execution
      await this.startWorkflowExecution(workflow, tenantId, triggerEvent)
    } catch (error) {}
  }

  /**
   * Start a new workflow execution
   */
  private async startWorkflowExecution(
    workflow: CrossModuleWorkflow,
    tenantId: string,
    triggerEvent: Record<string, unknown>
  ): Promise<string> {
    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`

    const execution: WorkflowExecution = {
      id: executionId,
      workflowId: workflow.id,
      tenantId,
      status: 'running',
      currentStep: workflow.steps[0].id,
      context: {
        triggerEvent: triggerEvent.payload,
        triggerMetadata: triggerEvent.metadata,
      },
      startedAt: new Date(),
    }

    this.activeExecutions.set(executionId, execution)

    console.log(
      `🚀 Started workflow execution: ${workflow.name} (${executionId}) for tenant ${tenantId}`
    )

    // Execute first step
    await this.executeWorkflowStep(execution, workflow.steps[0])

    return executionId
  }

  /**
   * Execute a workflow step
   */
  private async executeWorkflowStep(
    execution: WorkflowExecution,
    step: WorkflowStep
  ): Promise<void> {
    try {
      let result: Record<string, unknown>

      switch (step.type) {
        case 'ai_analysis':
          result = await this.executeAIAnalysisStep(step, execution)
          break
        case 'data_sync':
          result = await this.executeDataSyncStep(step, execution)
          break
        case 'notification':
          result = await this.executeNotificationStep(step, execution)
          break
        case 'approval':
          result = await this.executeApprovalStep(step, execution)
          break
        case 'external_api':
          result = await this.executeExternalAPIStep(step, execution)
          break
        default:
          throw new Error(`Unknown step type: ${step.type}`)
      }

      // Update execution context with step result
      execution.context[step.id] = result

      // Determine next steps
      if (step.nextSteps.length > 0) {
        const workflow = this.workflows.get(execution.workflowId)!
        const nextStep = workflow.steps.find((s) => s.id === step.nextSteps[0])

        if (nextStep) {
          execution.currentStep = nextStep.id
          await this.executeWorkflowStep(execution, nextStep)
        } else {
          await this.completeWorkflowExecution(execution)
        }
      } else {
        await this.completeWorkflowExecution(execution)
      }
    } catch (error) {
      // Try fallback steps if available
      if (step.fallbackSteps && step.fallbackSteps.length > 0) {
        const workflow = this.workflows.get(execution.workflowId)!
        const fallbackStep = workflow.steps.find((s) => s.id === step.fallbackSteps![0])

        if (fallbackStep) {
          await this.executeWorkflowStep(execution, fallbackStep)
          return
        }
      }

      // Mark execution as failed
      execution.status = 'failed'
      execution.error = error instanceof Error ? error.message : String(error)
      execution.completedAt = new Date()
    }
  }

  /**
   * Execute AI analysis step
   */
  private async executeAIAnalysisStep(
    step: WorkflowStep,
    execution: WorkflowExecution
  ): Promise<Record<string, unknown>> {
    if (!this.aiOrchestrator) {
      throw new Error('AI Orchestrator not available')
    }

    // Map action to TaskType
    const taskTypeMap: Record<string, TaskType> = {
      predict_hiring_needs: TaskType.PERFORMANCE_ANALYSIS,
      predict_payment_timeline: TaskType.ANALYZE_CUSTOMER,
      forecast_demand: TaskType.FORECAST_DEMAND,
      analyze_performance_impact: TaskType.PERFORMANCE_ANALYSIS,
      generate_coaching_recommendations: TaskType.RECOMMEND_ACTION,
    }

    const taskType = taskTypeMap[step.action] || TaskType.ANALYZE_CUSTOMER

    const result = await this.aiOrchestrator.orchestrateWithSubscriptionAwareness({
      tenantId: execution.tenantId,
      taskType,
      input: step.parameters,
      context: execution.context,
      requirements: {
        maxExecutionTime: 30000,
        accuracyThreshold: 0.8,
        explainability: true,
        crossModule: true,
      },
    })

    return result
  }

  /**
   * Execute data synchronization step
   */
  private async executeDataSyncStep(
    step: WorkflowStep,
    execution: WorkflowExecution
  ): Promise<Record<string, unknown>> {
    // In production, this would interact with actual module APIs
    const result = {
      action: step.action,
      module: step.module,
      parameters: step.parameters,
      timestamp: new Date(),
      success: true,
    }

    // Publish event about data sync
    await publishModuleEvent(step.module, `workflow.${step.action}`, execution.tenantId, result)

    return result
  }

  /**
   * Execute notification step
   */
  private async executeNotificationStep(
    step: WorkflowStep,
    _execution: WorkflowExecution
  ): Promise<Record<string, unknown>> {
    const result = {
      action: step.action,
      module: step.module,
      parameters: step.parameters,
      recipient: 'determined_by_parameters',
      timestamp: new Date(),
      sent: true,
    }

    return result
  }

  /**
   * Execute approval step
   */
  private async executeApprovalStep(
    step: WorkflowStep,
    execution: WorkflowExecution
  ): Promise<Record<string, unknown>> {
    // Mark execution as paused pending approval
    execution.status = 'paused'

    const result = {
      action: step.action,
      module: step.module,
      status: 'pending_approval',
      timestamp: new Date(),
    }

    return result
  }

  /**
   * Execute external API step
   */
  private async executeExternalAPIStep(
    step: WorkflowStep,
    _execution: WorkflowExecution
  ): Promise<Record<string, unknown>> {
    const result = {
      action: step.action,
      endpoint: step.parameters.endpoint || 'not_specified',
      timestamp: new Date(),
      success: true,
    }

    return result
  }

  /**
   * Complete workflow execution
   */
  private async completeWorkflowExecution(execution: WorkflowExecution): Promise<void> {
    execution.status = 'completed'
    execution.completedAt = new Date()

    // Publish completion event
    await publishModuleEvent('workflows', 'workflow.completed', execution.tenantId, {
      workflowId: execution.workflowId,
      executionId: execution.id,
      duration: execution.completedAt.getTime() - execution.startedAt.getTime(),
      stepsCompleted: Object.keys(execution.context).length,
    })

    // Clean up completed execution after some time
    setTimeout(() => {
      this.activeExecutions.delete(execution.id)
    }, 60000) // Clean up after 1 minute
  }

  /**
   * Validate tenant has required module subscriptions
   */
  private async validateWorkflowSubscription(
    workflow: CrossModuleWorkflow,
    tenantId: string
  ): Promise<boolean> {
    const activeModules = await moduleManager.getActiveModules(tenantId)

    return workflow.requiredModules.every((module) => activeModules.includes(module))
  }

  /**
   * Evaluate workflow conditions
   */
  private async evaluateWorkflowConditions(
    conditions: WorkflowCondition[],
    triggerEvent: Record<string, unknown>,
    _tenantId: string
  ): Promise<boolean> {
    if (conditions.length === 0) return true

    for (const condition of conditions) {
      const fieldValue = this.extractFieldValue(
        condition.field,
        triggerEvent,
        condition.moduleSource
      )
      const conditionMet = this.evaluateCondition(fieldValue, condition.operator, condition.value)

      if (!conditionMet) {
        console.log(
          `❌ Condition not met: ${condition.field} ${condition.operator} ${condition.value}`
        )
        return false
      }
    }

    return true
  }

  /**
   * Helper methods
   */
  private extractFieldValue(
    fieldPath: string,
    data: Record<string, unknown>,
    _moduleSource: string
  ): unknown {
    // Extract nested field values using dot notation
    const parts = fieldPath.split('.')
    let value = data

    for (const part of parts) {
      value = value?.[part]
    }

    return value
  }

  private evaluateCondition(
    fieldValue: unknown,
    operator: string,
    expectedValue: unknown
  ): boolean {
    switch (operator) {
      case 'equals':
        return fieldValue === expectedValue
      case 'greater_than':
        return fieldValue > expectedValue
      case 'less_than':
        return fieldValue < expectedValue
      case 'contains':
        return String(fieldValue).includes(String(expectedValue))
      case 'exists':
        return fieldValue !== undefined && fieldValue !== null
      default:
        return false
    }
  }

  private async logWorkflowBlocked(
    workflowId: string,
    tenantId: string,
    reason: string,
    requiredModules: string[]
  ): Promise<void> {
    // Could store this for upgrade recommendations
    await publishModuleEvent('workflows', 'workflow.blocked', tenantId, {
      workflowId,
      reason,
      requiredModules,
      timestamp: new Date(),
    })
  }

  /**
   * Public API methods
   */
  public async getActiveWorkflows(tenantId: string): Promise<CrossModuleWorkflow[]> {
    const activeModules = await moduleManager.getActiveModules(tenantId)

    return Array.from(this.workflows.values()).filter(
      (workflow) =>
        workflow.isActive &&
        workflow.requiredModules.every((module) => activeModules.includes(module))
    )
  }

  public async getWorkflowExecutions(tenantId: string): Promise<WorkflowExecution[]> {
    return Array.from(this.activeExecutions.values()).filter(
      (execution) => execution.tenantId === tenantId
    )
  }

  public getWorkflowById(workflowId: string): CrossModuleWorkflow | undefined {
    return this.workflows.get(workflowId)
  }
}

// Export singleton instance
export const workflowEngine = new CrossModuleWorkflowEngine()

export { CrossModuleWorkflowEngine }
