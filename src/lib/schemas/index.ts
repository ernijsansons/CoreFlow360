/**
 * CoreFlow360 - Shared Validation Schemas
 * Zod schemas that can be used on both frontend and backend
 */

import { z } from 'zod'

// Common field validations with security limits
export const emailSchema = z.string()
  .email('Invalid email address')
  .max(255, 'Email too long')
  .toLowerCase()
  .transform(val => val.trim())

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password too long')

export const phoneSchema = z.string()
  .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number')
  .max(50, 'Phone number too long')
  .optional()
  .transform(val => val?.trim())

// Customer schemas
export const createCustomerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100, 'First name too long').transform(val => val.trim()),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name too long').transform(val => val.trim()),
  email: emailSchema.optional(),
  phone: phoneSchema,
  address: z.string().max(500, 'Address too long').optional().transform(val => val?.trim()),
  company: z.string().max(200, 'Company name too long').optional().transform(val => val?.trim()),
  industry: z.string().max(50, 'Industry too long').optional().transform(val => val?.trim()),
  status: z.enum(['LEAD', 'PROSPECT', 'CUSTOMER', 'CHAMPION', 'AT_RISK', 'CHURNED']).optional(),
  source: z.string().max(100, 'Source too long').optional().transform(val => val?.trim()),
  assigneeId: z.string().uuid().optional(),
  industryType: z.string().max(50, 'Industry type too long').optional(),
  industryData: z.record(z.string(), z.unknown()).optional(),
})

export const updateCustomerSchema = createCustomerSchema.partial().extend({
  status: z.enum(['LEAD', 'PROSPECT', 'CUSTOMER', 'CHAMPION', 'AT_RISK', 'CHURNED']).optional(),
  assigneeId: z.string().uuid().optional(),
})

// Authentication schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: emailSchema,
  password: passwordSchema,
  companyName: z.string().min(1, 'Company name is required').max(200, 'Company name too long'),
  industryType: z.enum([
    'GENERAL', 'HVAC', 'LEGAL', 'MANUFACTURING', 'HEALTHCARE', 
    'FINANCE', 'REAL_ESTATE', 'CONSTRUCTION', 'CONSULTING', 'RETAIL', 'EDUCATION'
  ]).default('GENERAL'),
  invitationCode: z.string().optional()
})

// Feedback schemas
export const feedbackSchema = z.object({
  type: z.enum(['feature_request', 'bug_report', 'general_feedback', 'testimonial']),
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description too long'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  category: z.string().optional(),
  userEmail: emailSchema.optional(),
  userId: z.string().uuid().optional(),
  tenantId: z.string().uuid().optional(),
  metadata: z.record(z.any()).optional(),
  attachments: z.array(z.string().url()).optional(),
  reproductionSteps: z.string().max(1000).optional(),
  expectedBehavior: z.string().max(500).optional(),
  actualBehavior: z.string().max(500).optional(),
  browserInfo: z.string().max(200).optional(),
  screenshot: z.string().url().optional()
})

// Survey schemas
export const surveyResponseSchema = z.object({
  surveyId: z.string(),
  surveyTitle: z.string(),
  responses: z.record(z.any()),
  userId: z.string().uuid().optional(),
  userEmail: emailSchema.optional(),
  completedAt: z.string().datetime().optional(),
  timeSpent: z.number().positive().optional(),
  metadata: z.record(z.any()).optional()
})

// Interview schemas
export const interviewRequestSchema = z.object({
  interviewType: z.enum(['user_interview', 'feature_feedback', 'industry_expert']),
  preferredDates: z.array(z.string().datetime()),
  preferredTimes: z.array(z.string()),
  timezone: z.string(),
  contactEmail: emailSchema,
  contactPhone: phoneSchema,
  company: z.string().max(200).optional(),
  role: z.string().max(100).optional(),
  experience: z.string().max(500).optional(),
  specificTopics: z.string().max(1000).optional(),
  availabilityNotes: z.string().max(500).optional()
})

// Subscription schemas
export const subscriptionCalculationSchema = z.object({
  bundles: z.array(z.string()).min(1, 'At least one bundle required'),
  users: z.number().int().positive().max(100000, 'Maximum 100,000 users'),
  annual: z.boolean(),
  businessCount: z.number().int().positive().optional(),
  region: z.string().optional(),
  promoCode: z.string().optional(),
  customAddons: z.array(z.object({
    type: z.enum(['storage', 'api_calls', 'ai_operations', 'support']),
    quantity: z.number().positive()
  }))
})

// Pagination schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
})

// Query parameter schemas
export const customerQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  status: z.enum(['ALL', 'LEAD', 'PROSPECT', 'CUSTOMER', 'CHAMPION', 'AT_RISK', 'CHURNED']).optional(),
  assigneeId: z.string().uuid().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional()
})

// Type exports for TypeScript
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type FeedbackInput = z.infer<typeof feedbackSchema>
export type SurveyResponseInput = z.infer<typeof surveyResponseSchema>
export type InterviewRequestInput = z.infer<typeof interviewRequestSchema>
export type SubscriptionCalculationInput = z.infer<typeof subscriptionCalculationSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
export type CustomerQueryInput = z.infer<typeof customerQuerySchema>