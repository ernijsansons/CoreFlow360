/**
 * CoreFlow360 - Shared API Type Definitions
 * Central location for all API request/response types
 */

// Base API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: ApiMeta
  timestamp: string
}

export interface ApiError {
  type: string
  message: string
  code: string
  details?: any
  requestId?: string
}

export interface ApiMeta {
  page?: number
  limit?: number
  totalCount?: number
  totalPages?: number
  hasNext?: boolean
  hasPrev?: boolean
  [key: string]: any
}

// Pagination
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: ApiMeta & {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Authentication Types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  companyName: string
  industryType: string
  invitationCode?: string
}

export interface AuthResponse {
  user: {
    id: string
    email: string
    name: string
    tenantId: string
    role: string
    permissions?: string[]
  }
  tenant?: {
    id: string
    name: string
    slug: string
    industryType: string
  }
  token?: string
}

// Customer Types
export interface Customer {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  company?: string
  address?: string
  status: CustomerStatus
  source: string
  aiScore: number
  aiChurnRisk: number
  aiLifetimeValue: number
  totalRevenue: number
  lastInteraction?: string
  assignee?: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  industryType?: string
  industryData?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export type CustomerStatus = 
  | 'LEAD' 
  | 'PROSPECT' 
  | 'CUSTOMER' 
  | 'CHAMPION' 
  | 'AT_RISK' 
  | 'CHURNED'

export interface CreateCustomerRequest {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  address?: string
  company?: string
  industryType?: string
  industryData?: Record<string, any>
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {
  status?: CustomerStatus
  assigneeId?: string
}

export interface CustomerFilters extends PaginationParams {
  search?: string
  status?: CustomerStatus | 'ALL'
  assigneeId?: string
  dateFrom?: string
  dateTo?: string
}

// Subscription Types
export interface Subscription {
  id: string
  status: SubscriptionStatus
  tier: SubscriptionTier
  bundle: Bundle
  users: number
  price: number
  billingCycle: BillingCycle
  startDate: string
  endDate: string
  nextBillingDate?: string
  trialEndsAt?: string
  activeModules: string[]
  usage: {
    [key: string]: {
      used: number
      limit: number
    }
  }
}

export type SubscriptionStatus = 
  | 'ACTIVE' 
  | 'TRIAL' 
  | 'PAST_DUE' 
  | 'CANCELLED' 
  | 'EXPIRED'

export type SubscriptionTier = 
  | 'starter' 
  | 'professional' 
  | 'enterprise' 
  | 'ultimate'

export type BillingCycle = 'monthly' | 'annual'

export interface Bundle {
  id: string
  name: string
  category: string
  basePrice: number
  perUserPrice: number
}

// Feedback Types
export interface FeedbackRequest {
  type: FeedbackType
  title: string
  description: string
  priority?: FeedbackPriority
  category?: string
  userEmail?: string
  metadata?: Record<string, any>
  attachments?: string[]
  // Bug report specific
  reproductionSteps?: string
  expectedBehavior?: string
  actualBehavior?: string
  browserInfo?: string
  screenshot?: string
}

export type FeedbackType = 
  | 'feature_request' 
  | 'bug_report' 
  | 'general_feedback' 
  | 'testimonial'

export type FeedbackPriority = 
  | 'low' 
  | 'medium' 
  | 'high' 
  | 'critical'

export interface FeedbackResponse {
  id: string
  status: string
  estimatedResponseTime: string
}

// Module Types
export interface Module {
  id: string
  name: string
  description: string
  category: ModuleCategory
  accessible: boolean
  enabled: boolean
  features: string[]
  usage?: ModuleUsage
}

export type ModuleCategory = 
  | 'crm' 
  | 'accounting' 
  | 'hr' 
  | 'inventory' 
  | 'projects' 
  | 'ai_enhancement'

export interface ModuleUsage {
  used: number
  limit: number
  period: string
}

// Pricing Types
export interface PricingCalculationRequest {
  bundles: string[]
  users: number
  annual: boolean
  businessCount?: number
  region?: string
  promoCode?: string
  customAddons: Array<{
    type: string
    quantity: number
  }>
}

export interface PricingCalculationResponse {
  total: number
  subtotal: number
  discount: number
  discountPercentage: number
  breakdown: Array<{
    bundle: string
    bundleName: string
    subtotal: number
    userPrice: number
    basePrice: number
    effectiveUsers: number
  }>
  addons: Array<{
    type: string
    quantity: number
    unitPrice: number
    total: number
  }>
  savings: {
    annual: number
    volume: number
    promo: number
    multiBundle: number
  }
  warnings: string[]
  recommendations: string[]
  metadata: {
    calculatedAt: string
    validUntil: string
    currency: string
    taxIncluded: boolean
  }
}

// Survey Types
export interface SurveyResponse {
  surveyId: string
  surveyTitle: string
  responses: Record<string, any>
  userId?: string
  userEmail?: string
  completedAt?: string
  timeSpent?: number
  metadata?: Record<string, any>
}

// Interview Types
export interface InterviewRequest {
  interviewType: InterviewType
  preferredDates: string[]
  preferredTimes: string[]
  timezone: string
  contactEmail: string
  contactPhone?: string
  company?: string
  role?: string
  experience?: string
  specificTopics?: string
  availabilityNotes?: string
}

export type InterviewType = 
  | 'user_interview' 
  | 'feature_feedback' 
  | 'industry_expert'

// Audit Log Types
export interface AuditLog {
  id: string
  action: AuditAction
  entityType: string
  entityId: string
  oldValues?: any
  newValues?: any
  metadata?: Record<string, any>
  userId: string
  tenantId: string
  createdAt: string
}

export type AuditAction = 
  | 'CREATE' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'VIEW' 
  | 'EXPORT' 
  | 'IMPORT'