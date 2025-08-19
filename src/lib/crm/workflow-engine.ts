/**
 * CoreFlow360 - CRM Workflow Engine
 * Automated triggers and actions for CRM events
 */

import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { createNotification } from '@/lib/notifications'
// import { AIOrchestrator } from '@/ai/orchestration/AIOrchestrator' // TODO: Implement AI orchestrator

export interface WorkflowTrigger {
  id: string
  name: string
  description: string
  event: CRMEvent
  conditions: WorkflowCondition[]
  actions: WorkflowAction[]
  enabled: boolean
  tenantId: string
  createdAt: Date
  updatedAt: Date
}

export interface WorkflowCondition {
  field: string
  operator:
    | 'equals'
    | 'not_equals'
    | 'greater_than'
    | 'less_than'
    | 'contains'
    | 'not_contains'
    | 'is_empty'
    | 'is_not_empty'
  value?: unknown
  logic?: 'AND' | 'OR'
}

export interface WorkflowAction {
  type:
    | 'send_email'
    | 'create_task'
    | 'update_field'
    | 'create_notification'
    | 'ai_analysis'
    | 'webhook'
    | 'assign_to_user'
  config: Record<string, unknown>
  delay?: number // Delay in minutes
}

export enum CRMEvent {
  // Lead Events
  LEAD_CREATED = 'lead_created',
  LEAD_UPDATED = 'lead_updated',
  LEAD_SCORE_CHANGED = 'lead_score_changed',
  LEAD_CONVERTED = 'lead_converted',
  LEAD_INACTIVE = 'lead_inactive',

  // Customer Events
  CUSTOMER_CREATED = 'customer_created',
  CUSTOMER_UPDATED = 'customer_updated',
  CUSTOMER_LIFECYCLE_CHANGED = 'customer_lifecycle_changed',
  CUSTOMER_CHURNED = 'customer_churned',

  // Deal Events
  DEAL_CREATED = 'deal_created',
  DEAL_UPDATED = 'deal_updated',
  DEAL_STAGE_CHANGED = 'deal_stage_changed',
  DEAL_WON = 'deal_won',
  DEAL_LOST = 'deal_lost',
  DEAL_STALLED = 'deal_stalled',

  // Activity Events
  ACTIVITY_CREATED = 'activity_created',
  ACTIVITY_COMPLETED = 'activity_completed',
  ACTIVITY_OVERDUE = 'activity_overdue',

  // Communication Events
  EMAIL_RECEIVED = 'email_received',
  EMAIL_OPENED = 'email_opened',
  EMAIL_CLICKED = 'email_clicked',
  CALL_COMPLETED = 'call_completed',
  MEETING_SCHEDULED = 'meeting_scheduled',
  MEETING_COMPLETED = 'meeting_completed',
}

export class CRMWorkflowEngine {
  private aiOrchestrator: AIOrchestrator

  constructor() {
    this.aiOrchestrator = new AIOrchestrator()
  }

  /**
   * Process a CRM event and trigger applicable workflows
   */
  async processEvent(
    event: CRMEvent,
    entityId: string,
    entityData: unknown,
    tenantId: string,
    userId: string
  ): Promise<void> {
    try {
      // Get active workflows for this event
      const workflows = await this.getActiveWorkflows(event, tenantId)

      // Process each workflow
      for (const workflow of workflows) {
        if (await this.evaluateConditions(workflow.conditions, entityData)) {
          await this.executeActions(workflow.actions, {
            event,
            entityId,
            entityData,
            tenantId,
            userId,
            workflowId: workflow.id,
          })
        }
      }
    } catch (error) {
      
      throw error
    }
  }

  /**
   * Get active workflows for a specific event
   */
  private async getActiveWorkflows(event: CRMEvent, tenantId: string): Promise<WorkflowTrigger[]> {
    // In a real implementation, this would fetch from database
    // For now, return predefined workflows
    return this.getDefaultWorkflows(tenantId).filter((w) => w.event === event && w.enabled)
  }

  /**
   * Evaluate workflow conditions
   */
  private async evaluateConditions(conditions: WorkflowCondition[], data: unknown): Promise<boolean> {
    if (!conditions || conditions.length === 0) return true

    let result = true
    let currentLogic = 'AND'

    for (const condition of conditions) {
      const conditionResult = this.evaluateCondition(condition, data)

      if (currentLogic === 'AND') {
        result = result && conditionResult
      } else {
        result = result || conditionResult
      }

      currentLogic = condition.logic || 'AND'
    }

    return result
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(condition: WorkflowCondition, data: unknown): boolean {
    const fieldValue = this.getFieldValue(data, condition.field)

    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value
      case 'not_equals':
        return fieldValue !== condition.value
      case 'greater_than':
        return fieldValue > condition.value
      case 'less_than':
        return fieldValue < condition.value
      case 'contains':
        return String(fieldValue).includes(String(condition.value))
      case 'not_contains':
        return !String(fieldValue).includes(String(condition.value))
      case 'is_empty':
        return !fieldValue || fieldValue === ''
      case 'is_not_empty':
        return !!fieldValue && fieldValue !== ''
      default:
        return false
    }
  }

  /**
   * Get nested field value from object
   */
  private getFieldValue(data: unknown, field: string): unknown {
    const fields = field.split('.')
    let value = data

    for (const f of fields) {
      value = value?.[f]
    }

    return value
  }

  /**
   * Execute workflow actions
   */
  private async executeActions(
    actions: WorkflowAction[],
    context: {
      event: CRMEvent
      entityId: string
      entityData: unknown
      tenantId: string
      userId: string
      workflowId: string
    }
  ): Promise<void> {
    for (const action of actions) {
      // Apply delay if specified
      if (action.delay) {
        await this.scheduleAction(action, context, action.delay)
        continue
      }

      // Execute action immediately
      await this.executeAction(action, context)
    }
  }

  /**
   * Execute a single action
   */
  private async executeAction(action: WorkflowAction, context: unknown): Promise<void> {
    try {
      switch (action.type) {
        case 'send_email':
          await this.sendEmailAction(action.config, context)
          break

        case 'create_task':
          await this.createTaskAction(action.config, context)
          break

        case 'update_field':
          await this.updateFieldAction(action.config, context)
          break

        case 'create_notification':
          await this.createNotificationAction(action.config, context)
          break

        case 'ai_analysis':
          await this.aiAnalysisAction(action.config, context)
          break

        case 'webhook':
          await this.webhookAction(action.config, context)
          break

        case 'assign_to_user':
          await this.assignToUserAction(action.config, context)
          break

        default:
          
      }
    } catch (error) {
      console.error('Workflow action execution failed:', error)
      throw error
    }
  }

  /**
   * Schedule an action for later execution
   */
  private async scheduleAction(
    action: WorkflowAction,
    context: unknown,
    delayMinutes: number
  ): Promise<void> {
    // In a real implementation, this would use a job queue like Bull or similar
    setTimeout(
      () => {
        this.executeAction(action, context)
      },
      delayMinutes * 60 * 1000
    )
  }

  /**
   * Action: Send Email
   */
  private async sendEmailAction(config: unknown, context: unknown): Promise<void> {
    const { to, subject, template, cc, bcc } = config

    // Replace template variables
    const processedSubject = this.replaceTemplateVariables(subject, context)
    const processedTemplate = this.replaceTemplateVariables(template, context)

    await sendEmail({
      to: this.resolveEmailRecipients(to, context),
      cc: cc ? this.resolveEmailRecipients(cc, context) : undefined,
      bcc: bcc ? this.resolveEmailRecipients(bcc, context) : undefined,
      subject: processedSubject,
      html: processedTemplate,
    })
  }

  /**
   * Action: Create Task
   */
  private async createTaskAction(config: unknown, context: unknown): Promise<void> {
    const { title, description, assignTo, dueInDays, priority } = config

    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + (dueInDays || 1))

    await prisma.cRMActivity.create({
      data: {
        type: 'task',
        title: this.replaceTemplateVariables(title, context),
        description: this.replaceTemplateVariables(description, context),
        assignedToId: this.resolveUserId(assignTo, context),
        dueDate,
        priority: priority || 'medium',
        status: 'pending',
        tenantId: context.tenantId,
        customerId: context.entityData.customerId || context.entityId,
        metadata: {
          workflowId: context.workflowId,
          triggeredBy: context.event,
        },
      },
    })
  }

  /**
   * Action: Update Field
   */
  private async updateFieldAction(config: unknown, context: unknown): Promise<void> {
    const { field, value, entityType } = config

    const processedValue = this.replaceTemplateVariables(value, context)

    // Update based on entity type
    switch (entityType || context.event.split('_')[0]) {
      case 'lead':
        await prisma.lead.update({
          where: { id: context.entityId },
          data: { [field]: processedValue },
        })
        break

      case 'customer':
        await prisma.customer.update({
          where: { id: context.entityId },
          data: { [field]: processedValue },
        })
        break

      case 'deal':
        await prisma.deal.update({
          where: { id: context.entityId },
          data: { [field]: processedValue },
        })
        break
    }
  }

  /**
   * Action: Create Notification
   */
  private async createNotificationAction(config: unknown, context: unknown): Promise<void> {
    const { title, message, notifyUsers, type } = config

    const users = this.resolveUserIds(notifyUsers, context)

    for (const userId of users) {
      await createNotification({
        userId,
        title: this.replaceTemplateVariables(title, context),
        message: this.replaceTemplateVariables(message, context),
        type: type || 'info',
        metadata: {
          workflowId: context.workflowId,
          entityType: context.event.split('_')[0],
          entityId: context.entityId,
        },
      })
    }
  }

  /**
   * Action: AI Analysis
   */
  private async aiAnalysisAction(config: unknown, context: unknown): Promise<void> {
    const { analysisType, saveToField } = config

    const analysis = await this.aiOrchestrator.analyze({
      type: analysisType,
      data: context.entityData,
      context: {
        event: context.event,
        tenantId: context.tenantId,
      },
    })

    if (saveToField) {
      await this.updateFieldAction(
        {
          field: saveToField,
          value: JSON.stringify(analysis),
          entityType: context.event.split('_')[0],
        },
        context
      )
    }
  }

  /**
   * Action: Webhook
   */
  private async webhookAction(config: unknown, context: unknown): Promise<void> {
    const { url, method, headers, includeData } = config

    const payload = includeData
      ? {
          event: context.event,
          entityId: context.entityId,
          data: context.entityData,
          timestamp: new Date().toISOString(),
        }
      : { event: context.event, entityId: context.entityId }

    await fetch(url, {
      method: method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(payload),
    })
  }

  /**
   * Action: Assign to User
   */
  private async assignToUserAction(config: unknown, context: unknown): Promise<void> {
    const { assignTo, entityType } = config
    const userId = this.resolveUserId(assignTo, context)

    switch (entityType || context.event.split('_')[0]) {
      case 'lead':
        await prisma.lead.update({
          where: { id: context.entityId },
          data: { assignedToId: userId },
        })
        break

      case 'deal':
        await prisma.deal.update({
          where: { id: context.entityId },
          data: { assignedToId: userId },
        })
        break
    }
  }

  /**
   * Replace template variables
   */
  private replaceTemplateVariables(template: string, context: unknown): string {
    if (!template) return ''

    return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, variable) => {
      const value = this.getFieldValue(context.entityData, variable)
      return value !== undefined ? String(value) : match
    })
  }

  /**
   * Resolve email recipients
   */
  private resolveEmailRecipients(recipients: string | string[], context: unknown): string[] {
    if (Array.isArray(recipients)) {
      return recipients
    }

    if (recipients.startsWith('{{') && recipients.endsWith('}}')) {
      const field = recipients.slice(2, -2)
      return [this.getFieldValue(context.entityData, field)]
    }

    return [recipients]
  }

  /**
   * Resolve user ID
   */
  private resolveUserId(assignTo: string, context: unknown): string {
    if (assignTo === 'current_user') {
      return context.userId
    }

    if (assignTo === 'owner') {
      return context.entityData.assignedToId || context.userId
    }

    if (assignTo.startsWith('{{') && assignTo.endsWith('}}')) {
      const field = assignTo.slice(2, -2)
      return this.getFieldValue(context.entityData, field)
    }

    return assignTo
  }

  /**
   * Resolve multiple user IDs
   */
  private resolveUserIds(users: string | string[], context: unknown): string[] {
    if (Array.isArray(users)) {
      return users.map((u) => this.resolveUserId(u, context))
    }

    return [this.resolveUserId(users, context)]
  }

  /**
   * Get default workflows
   */
  private getDefaultWorkflows(tenantId: string): WorkflowTrigger[] {
    return [
      // High-value lead notification
      {
        id: 'wf-001',
        name: 'High-Value Lead Alert',
        description: 'Notify sales manager when high-value lead is created',
        event: CRMEvent.LEAD_CREATED,
        conditions: [{ field: 'aiScore', operator: 'greater_than', value: 80 }],
        actions: [
          {
            type: 'create_notification',
            config: {
              title: 'High-Value Lead Alert',
              message:
                'New lead {{firstName}} {{lastName}} with score {{aiScore}} requires immediate attention',
              notifyUsers: ['sales_manager'],
              type: 'urgent',
            },
          },
          {
            type: 'create_task',
            config: {
              title: 'Contact high-value lead {{firstName}} {{lastName}}',
              description: 'High-value lead requires immediate follow-up',
              assignTo: 'sales_manager',
              dueInDays: 0,
              priority: 'high',
            },
          },
        ],
        enabled: true,
        tenantId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Deal stage progression
      {
        id: 'wf-002',
        name: 'Deal Stage Progression',
        description: 'Update deal probability and notify team on stage change',
        event: CRMEvent.DEAL_STAGE_CHANGED,
        conditions: [],
        actions: [
          {
            type: 'update_field',
            config: {
              field: 'probability',
              value: '{{stage.defaultProbability}}',
              entityType: 'deal',
            },
          },
          {
            type: 'ai_analysis',
            config: {
              analysisType: 'deal_risk_assessment',
              saveToField: 'aiRiskAssessment',
            },
          },
        ],
        enabled: true,
        tenantId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Customer churn prevention
      {
        id: 'wf-003',
        name: 'Churn Prevention',
        description: 'Trigger retention workflow when customer shows churn signals',
        event: CRMEvent.CUSTOMER_LIFECYCLE_CHANGED,
        conditions: [{ field: 'lifecycle', operator: 'equals', value: 'at_risk' }],
        actions: [
          {
            type: 'create_task',
            config: {
              title: 'Retention call for {{name}}',
              description: 'Customer showing churn signals - immediate action required',
              assignTo: 'owner',
              dueInDays: 1,
              priority: 'high',
            },
          },
          {
            type: 'send_email',
            config: {
              to: '{{email}}',
              subject: 'We value your business',
              template: 'retention_email_template',
            },
            delay: 60, // 1 hour delay
          },
        ],
        enabled: true,
        tenantId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Deal win celebration
      {
        id: 'wf-004',
        name: 'Deal Won Celebration',
        description: 'Celebrate and follow up on won deals',
        event: CRMEvent.DEAL_WON,
        conditions: [],
        actions: [
          {
            type: 'create_notification',
            config: {
              title: '🎉 Deal Won!',
              message: '{{name}} closed for {{amount}}',
              notifyUsers: ['all_team'],
              type: 'success',
            },
          },
          {
            type: 'create_task',
            config: {
              title: 'Schedule onboarding for {{customer.name}}',
              description: 'New customer onboarding required',
              assignTo: 'onboarding_team',
              dueInDays: 2,
              priority: 'medium',
            },
          },
        ],
        enabled: true,
        tenantId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Lead nurturing
      {
        id: 'wf-005',
        name: 'Lead Nurturing',
        description: 'Automated follow-up for inactive leads',
        event: CRMEvent.LEAD_INACTIVE,
        conditions: [{ field: 'daysSinceLastContact', operator: 'greater_than', value: 7 }],
        actions: [
          {
            type: 'send_email',
            config: {
              to: '{{email}}',
              subject: 'Just checking in',
              template: 'lead_nurture_template',
            },
          },
          {
            type: 'update_field',
            config: {
              field: 'lastContactDate',
              value: '{{currentDate}}',
              entityType: 'lead',
            },
          },
        ],
        enabled: true,
        tenantId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
  }
}

// Export singleton instance
export const workflowEngine = new CRMWorkflowEngine()
