/**
 * CoreFlow360 - Automation Workflow Types
 * Type definitions for the natural language automation system
 */

export interface WorkflowNode {
  id: string
  type: WorkflowNodeType
  label: string
  description?: string
  position: { x: number; y: number }
  data: WorkflowNodeData
  inputs?: NodeConnection[]
  outputs?: NodeConnection[]
}

export enum WorkflowNodeType {
  // Triggers
  TRIGGER_WEBHOOK = 'TRIGGER_WEBHOOK',
  TRIGGER_EMAIL = 'TRIGGER_EMAIL',
  TRIGGER_FORM_SUBMIT = 'TRIGGER_FORM_SUBMIT',
  TRIGGER_CRM_EVENT = 'TRIGGER_CRM_EVENT',
  TRIGGER_TIME_BASED = 'TRIGGER_TIME_BASED',
  TRIGGER_FILE_UPLOAD = 'TRIGGER_FILE_UPLOAD',

  // Actions
  ACTION_SEND_EMAIL = 'ACTION_SEND_EMAIL',
  ACTION_CREATE_TASK = 'ACTION_CREATE_TASK',
  ACTION_UPDATE_CRM = 'ACTION_UPDATE_CRM',
  ACTION_SEND_SMS = 'ACTION_SEND_SMS',
  ACTION_CREATE_INVOICE = 'ACTION_CREATE_INVOICE',
  ACTION_ASSIGN_USER = 'ACTION_ASSIGN_USER',
  ACTION_WEBHOOK_CALL = 'ACTION_WEBHOOK_CALL',
  ACTION_UPDATE_DATABASE = 'ACTION_UPDATE_DATABASE',
  ACTION_GENERATE_DOCUMENT = 'ACTION_GENERATE_DOCUMENT',
  ACTION_SCHEDULE_MEETING = 'ACTION_SCHEDULE_MEETING',

  // Logic
  LOGIC_CONDITION = 'LOGIC_CONDITION',
  LOGIC_DELAY = 'LOGIC_DELAY',
  LOGIC_LOOP = 'LOGIC_LOOP',
  LOGIC_SPLIT = 'LOGIC_SPLIT',
  LOGIC_MERGE = 'LOGIC_MERGE',
  LOGIC_FILTER = 'LOGIC_FILTER',

  // Integrations
  INTEGRATION_SLACK = 'INTEGRATION_SLACK',
  INTEGRATION_TEAMS = 'INTEGRATION_TEAMS',
  INTEGRATION_ZAPIER = 'INTEGRATION_ZAPIER',
  INTEGRATION_GOOGLE_SHEETS = 'INTEGRATION_GOOGLE_SHEETS',
  INTEGRATION_DROPBOX = 'INTEGRATION_DROPBOX',
}

export interface WorkflowNodeData {
  // Common fields
  title: string
  configuration: Record<string, unknown>

  // Trigger specific
  triggerConditions?: TriggerCondition[]

  // Action specific
  actionParameters?: ActionParameter[]

  // Logic specific
  conditions?: LogicCondition[]
  delayAmount?: number
  delayUnit?: 'minutes' | 'hours' | 'days'

  // Integration specific
  integrationConfig?: IntegrationConfig
}

export interface NodeConnection {
  id: string
  label: string
  type: 'input' | 'output'
  dataType: 'any' | 'string' | 'number' | 'boolean' | 'object' | 'array'
  required?: boolean
}

export interface TriggerCondition {
  field: string
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'not_empty'
  value: unknown
  description?: string
}

export interface ActionParameter {
  name: string
  value: unknown
  type: 'static' | 'dynamic' | 'template'
  source?: string // For dynamic values
}

export interface LogicCondition {
  field: string
  operator: ComparisonOperator
  value: unknown
  logicalOperator?: 'AND' | 'OR'
}

export type ComparisonOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'is_empty'
  | 'is_not_empty'
  | 'starts_with'
  | 'ends_with'

export interface IntegrationConfig {
  service: string
  credentials?: string
  endpoint?: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  parameters?: Record<string, unknown>
}

export interface Workflow {
  id: string
  name: string
  description: string
  isActive: boolean

  // Metadata
  tenantId: string
  createdBy: string
  createdAt: Date
  updatedAt: Date

  // Workflow definition
  nodes: WorkflowNode[]
  connections: WorkflowConnection[]

  // Configuration
  settings: WorkflowSettings

  // Natural language context
  originalDescription: string
  generatedByAI: boolean
  aiConfidence?: number

  // Execution stats
  executionCount: number
  lastExecuted?: Date
  avgExecutionTime?: number
  successRate: number
}

export interface WorkflowConnection {
  id: string
  sourceNodeId: string
  sourceOutputId: string
  targetNodeId: string
  targetInputId: string
  label?: string
  conditions?: ConnectionCondition[]
}

export interface ConnectionCondition {
  field: string
  operator: ComparisonOperator
  value: unknown
}

export interface WorkflowSettings {
  timeout: number // in seconds
  maxRetries: number
  retryDelay: number // in seconds
  onError: 'stop' | 'continue' | 'retry'
  notifications: {
    onSuccess: boolean
    onError: boolean
    recipients: string[]
  }
  logging: {
    enabled: boolean
    level: 'basic' | 'detailed' | 'debug'
  }
}

// Natural Language Processing Types
export interface WorkflowIntent {
  intent: WorkflowIntentType
  confidence: number
  entities: WorkflowEntity[]
  originalText: string
}

export enum WorkflowIntentType {
  CREATE_TASK = 'CREATE_TASK',
  SEND_NOTIFICATION = 'SEND_NOTIFICATION',
  UPDATE_RECORD = 'UPDATE_RECORD',
  CONDITIONAL_ACTION = 'CONDITIONAL_ACTION',
  SCHEDULE_ACTION = 'SCHEDULE_ACTION',
  MULTI_STEP_WORKFLOW = 'MULTI_STEP_WORKFLOW',
  DATA_SYNC = 'DATA_SYNC',
  APPROVAL_PROCESS = 'APPROVAL_PROCESS',
}

export interface WorkflowEntity {
  type: WorkflowEntityType
  value: string
  startIndex: number
  endIndex: number
  confidence: number
}

export enum WorkflowEntityType {
  TRIGGER_TYPE = 'TRIGGER_TYPE',
  ACTION_TYPE = 'ACTION_TYPE',
  PERSON = 'PERSON',
  EMAIL = 'EMAIL',
  DATE_TIME = 'DATE_TIME',
  CONDITION = 'CONDITION',
  FIELD_NAME = 'FIELD_NAME',
  VALUE = 'VALUE',
  INTEGRATION = 'INTEGRATION',
  TEMPLATE = 'TEMPLATE',
}

// AI Processing Types
export interface WorkflowGenerationRequest {
  description: string
  businessContext: {
    industry: string
    companySize: string
    existingSystems: string[]
    userRole: string
  }
  preferences?: {
    complexity: 'simple' | 'advanced'
    executionTiming: 'immediate' | 'scheduled'
    errorHandling: 'basic' | 'comprehensive'
  }
}

export interface WorkflowGenerationResponse {
  workflow: Workflow
  confidence: number
  questions: WorkflowQuestion[]
  suggestions: WorkflowSuggestion[]
  warnings?: WorkflowWarning[]
}

export interface WorkflowQuestion {
  id: string
  question: string
  type: 'text' | 'select' | 'multi_select' | 'boolean' | 'number' | 'date'
  options?: string[]
  required: boolean
  category: 'configuration' | 'integration' | 'timing' | 'error_handling'
  affectedNodeIds: string[]
}

export interface WorkflowSuggestion {
  type: 'optimization' | 'additional_step' | 'integration' | 'error_handling'
  title: string
  description: string
  impact: 'low' | 'medium' | 'high'
  implementationEffort: 'easy' | 'medium' | 'complex'
}

export interface WorkflowWarning {
  type: 'rate_limit' | 'cost' | 'complexity' | 'integration_required'
  message: string
  severity: 'info' | 'warning' | 'error'
  affectedNodeIds?: string[]
}

// Template Types
export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: WorkflowTemplateCategory
  industry?: string
  tags: string[]

  // Template definition
  templateWorkflow: Omit<Workflow, 'id' | 'tenantId' | 'createdBy' | 'createdAt' | 'updatedAt'>

  // Customization
  customizationOptions: TemplateCustomization[]
  requiredIntegrations: string[]

  // Metadata
  popularity: number
  rating: number
  usageCount: number
}

export enum WorkflowTemplateCategory {
  LEAD_MANAGEMENT = 'LEAD_MANAGEMENT',
  CUSTOMER_ONBOARDING = 'CUSTOMER_ONBOARDING',
  INVOICE_MANAGEMENT = 'INVOICE_MANAGEMENT',
  SUPPORT_TICKETS = 'SUPPORT_TICKETS',
  PROJECT_MANAGEMENT = 'PROJECT_MANAGEMENT',
  HR_PROCESSES = 'HR_PROCESSES',
  MARKETING_AUTOMATION = 'MARKETING_AUTOMATION',
  SALES_PIPELINE = 'SALES_PIPELINE',
  COMPLIANCE = 'COMPLIANCE',
  REPORTING = 'REPORTING',
}

export interface TemplateCustomization {
  nodeId: string
  field: string
  label: string
  type: 'text' | 'select' | 'integration' | 'template'
  options?: string[]
  required: boolean
  defaultValue?: unknown
}

// Execution Types
export interface WorkflowExecution {
  id: string
  workflowId: string
  triggeredBy: string
  startTime: Date
  endTime?: Date
  status: WorkflowExecutionStatus

  // Execution data
  inputData: Record<string, unknown>
  outputData?: Record<string, unknown>

  // Node executions
  nodeExecutions: NodeExecution[]

  // Error handling
  errors?: WorkflowExecutionError[]

  // Performance
  totalDuration: number
  nodeCount: number

  // Context
  tenantId: string
}

export enum WorkflowExecutionStatus {
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  TIMEOUT = 'TIMEOUT',
}

export interface NodeExecution {
  nodeId: string
  startTime: Date
  endTime?: Date
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  inputData: Record<string, unknown>
  outputData?: Record<string, unknown>
  error?: string
  duration: number
}

export interface WorkflowExecutionError {
  nodeId: string
  errorType: 'validation' | 'execution' | 'timeout' | 'integration'
  message: string
  details?: Record<string, unknown>
  timestamp: Date
  retryAttempt?: number
}

// Analytics Types
export interface WorkflowAnalytics {
  workflowId: string
  period: {
    start: Date
    end: Date
  }

  // Execution metrics
  totalExecutions: number
  successfulExecutions: number
  failedExecutions: number
  avgExecutionTime: number

  // Performance metrics
  executionTrends: ExecutionTrend[]
  errorAnalysis: ErrorAnalysis[]
  nodePerformance: NodePerformanceMetric[]

  // Usage patterns
  triggerPatterns: TriggerPattern[]
  peakUsageTimes: UsagePattern[]
}

export interface ExecutionTrend {
  date: string
  executions: number
  successRate: number
  avgDuration: number
}

export interface ErrorAnalysis {
  errorType: string
  count: number
  percentage: number
  affectedNodes: string[]
  commonCauses: string[]
}

export interface NodePerformanceMetric {
  nodeId: string
  nodeType: WorkflowNodeType
  avgExecutionTime: number
  successRate: number
  errorRate: number
}

export interface TriggerPattern {
  triggerType: string
  frequency: number
  successRate: number
}

export interface UsagePattern {
  hour: number
  dayOfWeek: number
  executionCount: number
}
