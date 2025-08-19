/**
 * CoreFlow360 - API Validation Schemas
 * Comprehensive validation schemas for all API endpoints
 */

import { z } from 'zod'

// Common schemas
export const uuidSchema = z.string().uuid()
export const emailSchema = z.string().email()
export const dateSchema = z.string().datetime()
export const tenantIdSchema = z.string().min(1)

// Pagination schemas
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// User role enum
export const userRoleSchema = z.enum([
  'super_admin',
  'org_admin',
  'department_manager',
  'team_lead',
  'user',
])

// Subscription status enum
export const subscriptionStatusSchema = z.enum([
  'FREE',
  'TRIAL',
  'STARTER',
  'BUSINESS',
  'ENTERPRISE',
  'CANCELLED',
  'SUSPENDED',
])

// Module names
export const moduleNameSchema = z.enum([
  'crm',
  'sales',
  'finance',
  'operations',
  'analytics',
  'hr',
  'accounting',
  'projects',
  'inventory',
  'custom',
])

// ===== Authentication Schemas =====
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8),
  rememberMe: z.boolean().optional(),
})

export const registerSchema = z.object({
  email: emailSchema,
  password: z.string().min(8).max(100),
  name: z.string().min(2).max(100),
  companyName: z.string().min(2).max(100).optional(),
  role: userRoleSchema.optional(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
})

// ===== Freemium Management Schemas =====
export const selectAgentSchema = z.object({
  agentType: z.enum(['crm', 'sales', 'finance', 'operations', 'analytics', 'hr']),
  tenantId: tenantIdSchema.optional(),
  userId: z.string().optional(),
})

export const trackUsageSchema = z.object({
  feature: z.string().min(1),
  module: moduleNameSchema,
  tenantId: tenantIdSchema.optional(),
  metadata: z.record(z.any()).optional(),
})

export const upgradeEligibilitySchema = z.object({
  currentPlan: subscriptionStatusSchema,
  targetPlan: subscriptionStatusSchema,
  tenantId: tenantIdSchema.optional(),
})

// ===== Onboarding Schemas =====
export const roleSelectionSchema = z.object({
  selectedRole: z.enum(['admin', 'manager', 'user', 'ceo', 'cfo', 'cto', 'sales', 'operations']),
  roleTitle: z.string().optional(),
  userEmail: emailSchema.optional(),
  companyName: z.string().optional(),
  timestamp: dateSchema.optional(),
  aiAgent: z.string().optional(),
  focusAreas: z.array(z.string()).optional(),
})

export const completeStepSchema = z.object({
  stepId: z.string().min(1),
  stepTitle: z.string().optional(),
  selectedRole: z.string().optional(),
  currentStepIndex: z.number().min(0).optional(),
  totalSteps: z.number().min(1).optional(),
  estimatedTime: z.string().optional(),
  isCompleted: z.boolean(),
  allStepsCompleted: z.array(z.string()).optional(),
})

// ===== Conversion Tracking Schemas =====
export const conversionEventSchema = z.object({
  eventType: z.enum([
    'upgrade_prompt',
    'feature_usage',
    'agent_selected',
    'role_selected',
    'onboarding_started',
    'onboarding_completed',
    'upgrade_completed',
  ]),
  triggerType: z.enum([
    'feature_limit',
    'usage_limit',
    'success_story',
    'time_based',
    'value_demonstration',
    'module_gate',
    'role_selection',
  ]),
  actionTaken: z.enum(['converted', 'dismissed', 'delayed', 'clicked', 'started']),
  currentModule: z.string().optional(),
  userPlan: z.string().optional(),
  conversionValue: z.number().optional(),
  triggerContext: z.string().optional(), // JSON string
})

// ===== Customer Management Schemas =====
export const createCustomerSchema = z.object({
  name: z.string().min(1).max(100),
  email: emailSchema,
  phone: z.string().optional(),
  company: z.string().optional(),
  industry: z.string().optional(),
  status: z.enum(['active', 'inactive', 'lead', 'prospect']).default('lead'),
  tenantId: tenantIdSchema.optional(),
  metadata: z.record(z.any()).optional(),
})

export const updateCustomerSchema = createCustomerSchema.partial()

// ===== Subscription Management Schemas =====
export const activateModuleSchema = z.object({
  module: moduleNameSchema,
  modules: z.array(moduleNameSchema).optional(),
  tenantId: tenantIdSchema.optional(),
  tier: z.string().optional(),
})

export const deactivateModuleSchema = z.object({
  module: moduleNameSchema,
  tenantId: tenantIdSchema.optional(),
  reason: z.string().optional(),
})

export const updateSubscriptionSchema = z.object({
  planId: z.string().min(1),
  modules: z.array(moduleNameSchema).optional(),
  billingCycle: z.enum(['monthly', 'yearly']).optional(),
  seats: z.number().min(1).optional(),
  tenantId: tenantIdSchema.optional(),
})

// ===== Performance Metrics Schemas =====
export const performanceMetricSchema = z.object({
  responseTime: z.number().min(0),
  successRate: z.number().min(0).max(100),
  errorRate: z.number().min(0).max(100),
  throughput: z.number().min(0),
  activeUsers: z.number().min(0),
  cpuUsage: z.number().min(0).max(100).optional(),
  memoryUsage: z.number().min(0).max(100).optional(),
  tenantId: tenantIdSchema.optional(),
})

// ===== Dashboard Schemas =====
export const dashboardQuerySchema = z.object({
  tenantId: tenantIdSchema.optional(),
  timeframe: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
  modules: z.array(moduleNameSchema).optional(),
  metrics: z.array(z.string()).optional(),
})

// ===== AI/ML Schemas =====
export const aiInsightRequestSchema = z.object({
  context: z.object({
    module: moduleNameSchema,
    dataType: z.string(),
    timeRange: z
      .object({
        start: dateSchema,
        end: dateSchema,
      })
      .optional(),
  }),
  query: z.string().optional(),
  tenantId: tenantIdSchema.optional(),
})

// ===== Error Response Schema =====
export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  code: z.string().optional(),
  statusCode: z.number().optional(),
  details: z
    .array(
      z.object({
        field: z.string(),
        message: z.string(),
      })
    )
    .optional(),
})

// ===== Success Response Schemas =====
export const successResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
})

export const paginatedResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: z.array(dataSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
      hasNext: z.boolean(),
      hasPrev: z.boolean(),
    }),
  })

// ===== Request ID Schema =====
export const requestIdSchema = z.object({
  'x-request-id': z.string().uuid().optional(),
  'x-tenant-id': tenantIdSchema.optional(),
  'x-user-id': z.string().optional(),
})

// Type exports
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type SelectAgentInput = z.infer<typeof selectAgentSchema>
export type TrackUsageInput = z.infer<typeof trackUsageSchema>
export type ConversionEventInput = z.infer<typeof conversionEventSchema>
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>
export type PerformanceMetricInput = z.infer<typeof performanceMetricSchema>
export type DashboardQuery = z.infer<typeof dashboardQuerySchema>
export type ErrorResponse = z.infer<typeof errorResponseSchema>
export type SuccessResponse = z.infer<typeof successResponseSchema>
