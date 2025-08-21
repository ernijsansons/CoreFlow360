/**
 * CoreFlow360 - CRM Workflow Types
 * Shared types for workflow engine (client-safe)
 */

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

export type CRMEvent =
  | 'lead_created'
  | 'lead_updated'
  | 'lead_converted'
  | 'lead_qualified'
  | 'customer_created'
  | 'customer_updated'
  | 'customer_lifecycle_changed'
  | 'deal_created'
  | 'deal_updated'
  | 'deal_stage_changed'
  | 'deal_won'
  | 'deal_lost'
  | 'activity_created'
  | 'activity_completed'
  | 'activity_overdue'
  | 'email_sent'
  | 'email_received'
  | 'email_opened'
  | 'email_clicked'
  | 'note_added'
  | 'tag_added'
  | 'tag_removed'

export interface WorkflowExecution {
  id: string
  workflowId: string
  triggeredBy: string
  triggeredAt: Date
  status: 'pending' | 'running' | 'completed' | 'failed'
  error?: string
  completedAt?: Date
}

export interface WorkflowMetrics {
  totalExecutions: number
  successfulExecutions: number
  failedExecutions: number
  averageExecutionTime: number
  lastExecutionAt?: Date
}