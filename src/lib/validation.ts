/**
 * CoreFlow360 - Input Validation Utility
 * Comprehensive validation with security checks and sanitization
 */

import { z } from 'zod'
import { sanitizeString, sanitizeHtml } from '../utils/security/sanitization'

// Common validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,128}$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  ALPHANUMERIC_SPACES: /^[a-zA-Z0-9\s]+$/,
  NUMERIC: /^[0-9]+$/,
  DECIMAL: /^[0-9]+(\.[0-9]+)?$/,
} as const

// Validation limits
export const VALIDATION_LIMITS = {
  EMAIL_MAX_LENGTH: 255,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 1000,
  URL_MAX_LENGTH: 2048,
  PHONE_MAX_LENGTH: 20,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
} as const

/**
 * Enhanced email validation with sanitization
 */
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .max(VALIDATION_LIMITS.EMAIL_MAX_LENGTH, 'Email too long')
  .transform((val) => sanitizeString(val.toLowerCase().trim()))
  .refine((val) => !val.includes('<script>'), 'Email contains invalid characters')

/**
 * Enhanced password validation with complexity requirements
 */
export const passwordSchema = z
  .string()
  .min(VALIDATION_LIMITS.PASSWORD_MIN_LENGTH, 'Password too short')
  .max(VALIDATION_LIMITS.PASSWORD_MAX_LENGTH, 'Password too long')
  .regex(
    VALIDATION_PATTERNS.PASSWORD,
    'Password must contain uppercase, lowercase, number, and special character'
  )
  .refine((val) => !val.includes('password'), 'Password too common')
  .refine((val) => !val.includes('123'), 'Password too sequential')

/**
 * Name validation with sanitization
 */
export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(VALIDATION_LIMITS.NAME_MAX_LENGTH, 'Name too long')
  .regex(VALIDATION_PATTERNS.ALPHANUMERIC_SPACES, 'Name contains invalid characters')
  .transform((val) => sanitizeString(val.trim()))

/**
 * URL validation with sanitization
 */
export const urlSchema = z
  .string()
  .url('Invalid URL format')
  .max(VALIDATION_LIMITS.URL_MAX_LENGTH, 'URL too long')
  .refine((val) => val.startsWith('https://'), 'URL must use HTTPS')
  .transform((val) => sanitizeString(val))

/**
 * Phone number validation
 */
export const phoneSchema = z
  .string()
  .regex(VALIDATION_PATTERNS.PHONE, 'Invalid phone number format')
  .max(VALIDATION_LIMITS.PHONE_MAX_LENGTH, 'Phone number too long')
  .transform((val) => val.replace(/\s+/g, ''))

/**
 * UUID validation
 */
export const uuidSchema = z.string().regex(VALIDATION_PATTERNS.UUID, 'Invalid UUID format')

/**
 * Username validation
 */
export const usernameSchema = z
  .string()
  .min(VALIDATION_LIMITS.USERNAME_MIN_LENGTH, 'Username too short')
  .max(VALIDATION_LIMITS.USERNAME_MAX_LENGTH, 'Username too long')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username contains invalid characters')
  .refine((val) => !val.startsWith('admin'), 'Username not allowed')

/**
 * HTML content validation with sanitization
 */
export const htmlContentSchema = z
  .string()
  .max(VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH, 'Content too long')
  .transform((val) => sanitizeHtml(val))
  .refine((val) => !val.includes('<script'), 'Content contains invalid HTML')

/**
 * Numeric validation with range checks
 */
export const numericSchema = (min: number, max: number) =>
  z
    .number()
    .int('Must be a whole number')
    .min(min, `Must be at least ${min}`)
    .max(max, `Must be at most ${max}`)

/**
 * Array validation with length limits
 */
export const arraySchema = <T>(itemSchema: z.ZodType<T>, maxLength: number) =>
  z.array(itemSchema).max(maxLength, `Array too long (max ${maxLength} items)`)

/**
 * Object validation with key restrictions
 */
export const objectSchema = z
  .record(z.unknown())
  .refine((obj) => Object.keys(obj).length <= 100, 'Object has too many properties')
  .refine((obj) => {
    const keys = Object.keys(obj)
    return keys.every((key) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key))
  }, 'Object contains invalid property names')

/**
 * Date validation with range checks
 */
export const dateSchema = z
  .date()
  .min(new Date('1900-01-01'), 'Date too far in the past')
  .max(new Date('2100-12-31'), 'Date too far in the future')

/**
 * Enhanced validation with security checks
 */
export class ValidationUtils {
  /**
   * Validate and sanitize input with comprehensive checks
   */
  static validateInput<T>(
    schema: z.ZodType<T>,
    input: unknown,
    context?: string
  ): { success: true; data: T } | { success: false; errors: string[] } {
    try {
      const result = schema.safeParse(input)

      if (result.success) {
        return { success: true, data: result.data }
      } else {
        const errors = result.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`)
        return { success: false, errors }
      }
    } catch (error) {
      return {
        success: false,
        errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      }
    }
  }

  /**
   * Validate multiple fields at once
   */
  static validateMultiple(
    validations: Array<{ field: string; schema: z.ZodType<unknown>; value: unknown }>
  ):
    | { success: true; data: Record<string, unknown> }
    | { success: false; errors: Record<string, string[]> } {
    const results: Record<string, unknown> = {}
    const errors: Record<string, string[]> = {}

    for (const { field, schema, value } of validations) {
      const result = this.validateInput(schema, value, field)

      if ('data' in result && result.success) {
        results[field] = result.data
      } else if ('errors' in result && !result.success) {
        errors[field] = result.errors
      }
    }

    if (Object.keys(errors).length === 0) {
      return { success: true, data: results }
    } else {
      return { success: false, errors }
    }
  }

  /**
   * Check for common security vulnerabilities
   */
  static checkSecurityVulnerabilities(input: string): string[] {
    const vulnerabilities: string[] = []

    // SQL Injection patterns
    const sqlPatterns = [
      /(\b(union|select|insert|update|delete|drop|create|alter)\b)/i,
      /(--|\/\*|\*\/|;)/,
      /(\b(exec|execute|xp_|sp_)\b)/i,
    ]

    // XSS patterns
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    ]

    // Command injection patterns
    const commandPatterns = [
      /(\b(cmd|powershell|bash|sh|exec|system)\b)/i,
      /[;&|`$()]/,
      /(\b(rm|del|format|fdisk)\b)/i,
    ]

    // Check for SQL injection
    if (sqlPatterns.some((pattern) => pattern.test(input))) {
      vulnerabilities.push('Potential SQL injection detected')
    }

    // Check for XSS
    if (xssPatterns.some((pattern) => pattern.test(input))) {
      vulnerabilities.push('Potential XSS attack detected')
    }

    // Check for command injection
    if (commandPatterns.some((pattern) => pattern.test(input))) {
      vulnerabilities.push('Potential command injection detected')
    }

    return vulnerabilities
  }

  /**
   * Sanitize input for safe storage
   */
  static sanitizeInput(input: string): string {
    return sanitizeString(sanitizeHtml(input))
  }

  /**
   * Validate file upload
   */
  static validateFileUpload(
    file: File,
    options: {
      maxSize?: number
      allowedTypes?: string[]
      allowedExtensions?: string[]
    } = {}
  ): { success: true } | { success: false; error: string } {
    const { maxSize = 10 * 1024 * 1024, allowedTypes = [], allowedExtensions = [] } = options

    // Check file size
    if (file.size > maxSize) {
      return { success: false, error: `File too large (max ${maxSize / 1024 / 1024}MB)` }
    }

    // Check MIME type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return { success: false, error: `File type not allowed: ${file.type}` }
    }

    // Check file extension
    if (allowedExtensions.length > 0) {
      const extension = file.name.split('.').pop()?.toLowerCase()
      if (!extension || !allowedExtensions.includes(extension)) {
        return { success: false, error: `File extension not allowed: ${extension}` }
      }
    }

    return { success: true }
  }
}

/**
 * Pre-built validation schemas for common use cases
 */
export const CommonSchemas = {
  // User registration
  userRegistration: z.object({
    email: emailSchema,
    password: passwordSchema,
    firstName: nameSchema,
    lastName: nameSchema,
    username: usernameSchema.optional(),
    phone: phoneSchema.optional(),
  }),

  // User profile update
  userProfileUpdate: z.object({
    firstName: nameSchema.optional(),
    lastName: nameSchema.optional(),
    phone: phoneSchema.optional(),
    bio: htmlContentSchema.optional(),
    website: urlSchema.optional(),
  }),

  // API request with pagination
  paginatedRequest: z.object({
    page: numericSchema(1, 1000).default(1),
    limit: numericSchema(1, 100).default(20),
    sortBy: z.string().max(50).optional(),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
    search: z.string().max(100).optional(),
  }),

  // Subscription calculation
  subscriptionCalculation: z.object({
    bundles: arraySchema(z.string(), 50),
    users: numericSchema(1, 100000),
    annual: z.boolean().default(false),
    businessCount: numericSchema(1, 1000).default(1),
    region: z.string().min(2).max(10).default('US'),
    promoCode: z.string().max(50).optional(),
    customAddons: z
      .array(
        z.object({
          type: z.enum(['storage', 'api_calls', 'ai_operations', 'support']),
          quantity: numericSchema(1, 1000000),
        })
      )
      .optional()
      .default([]),
  }),
}
