/**
 * CoreFlow360 - API Key Validation Utilities
 * Comprehensive validation for API keys and related data
 */

import { z } from 'zod'
import {
  CreateAPIKeyRequest,
  UpdateAPIKeyRequest,
  RotateAPIKeyRequest,
  APIKeyValidationResult,
  ValidationError,
  ValidationWarning,
  APIKeyStatus,
  VendorCategory,
} from '@/types/api-keys'

// Common validation schemas
const apiKeyPatterns = {
  openai: /^sk-[A-Za-z0-9]{48}$/,
  anthropic: /^sk-ant-api03-[A-Za-z0-9_-]{95}$/,
  google: /^AIza[A-Za-z0-9_-]{35}$/,
  aws: /^[A-Z0-9]{20}$/,
  stripe: /^sk_(test_|live_)[A-Za-z0-9]{24}$/,
  github: /^ghp_[A-Za-z0-9]{36}$/,
  generic: /^[A-Za-z0-9_-]{8,128}$/,
}

// Service-specific validation rules
const serviceValidation = {
  openai: {
    name: 'OpenAI',
    keyPattern: apiKeyPatterns.openai,
    category: 'AI_ML' as VendorCategory,
    requiredPermissions: ['ai:use'],
    maxRotationDays: 90,
    recommendedRotationDays: 30,
  },
  anthropic: {
    name: 'Anthropic Claude',
    keyPattern: apiKeyPatterns.anthropic,
    category: 'AI_ML' as VendorCategory,
    requiredPermissions: ['ai:use'],
    maxRotationDays: 90,
    recommendedRotationDays: 30,
  },
  google_ai: {
    name: 'Google AI',
    keyPattern: apiKeyPatterns.google,
    category: 'AI_ML' as VendorCategory,
    requiredPermissions: ['ai:use'],
    maxRotationDays: 180,
    recommendedRotationDays: 60,
  },
  stripe: {
    name: 'Stripe',
    keyPattern: apiKeyPatterns.stripe,
    category: 'PAYMENT' as VendorCategory,
    requiredPermissions: ['payment:process'],
    maxRotationDays: 365,
    recommendedRotationDays: 90,
  },
  aws: {
    name: 'Amazon Web Services',
    keyPattern: apiKeyPatterns.aws,
    category: 'STORAGE' as VendorCategory,
    requiredPermissions: ['storage:access'],
    maxRotationDays: 90,
    recommendedRotationDays: 30,
  },
  github: {
    name: 'GitHub',
    keyPattern: apiKeyPatterns.github,
    category: 'INTEGRATION' as VendorCategory,
    requiredPermissions: ['integration:github'],
    maxRotationDays: 365,
    recommendedRotationDays: 180,
  },
}

// Validation schemas
export const createAPIKeySchema = z.object({
  service: z
    .string()
    .min(1, 'Service is required')
    .max(50, 'Service name too long')
    .regex(/^[a-z_]+$/, 'Service must be lowercase with underscores only'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z0-9\s_-]+$/, 'Name contains invalid characters'),
  description: z.string().max(500, 'Description too long').optional(),
  key: z.string().min(8, 'API key too short').max(200, 'API key too long'),
  rotationDays: z
    .number()
    .int('Rotation days must be an integer')
    .min(1, 'Rotation days must be at least 1')
    .max(365, 'Rotation days cannot exceed 365')
    .optional()
    .default(90),
  expiresAt: z.date().optional(),
  vendorId: z.string().min(1, 'Vendor ID is required'),
})

export const updateAPIKeySchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z0-9\s_-]+$/, 'Name contains invalid characters')
    .optional(),
  description: z.string().max(500, 'Description too long').optional(),
  key: z.string().min(8, 'API key too short').max(200, 'API key too long').optional(),
  rotationDays: z
    .number()
    .int('Rotation days must be an integer')
    .min(1, 'Rotation days must be at least 1')
    .max(365, 'Rotation days cannot exceed 365')
    .optional(),
  expiresAt: z.date().optional(),
  status: z
    .enum([
      'ACTIVE',
      'INACTIVE',
      'EXPIRED',
      'ROTATION_REQUIRED',
      'COMPROMISED',
      'PENDING_VALIDATION',
    ])
    .optional(),
})

export const rotateAPIKeySchema = z.object({
  newKey: z.string().min(8, 'API key too short').max(200, 'API key too long'),
  reason: z.string().max(200, 'Reason too long').optional(),
  scheduleRotation: z.boolean().optional().default(false),
  rotationDate: z.date().optional(),
})

/**
 * Validate API key format based on service type
 */
export function validateAPIKeyFormat(service: string, key: string): APIKeyValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  const suggestions: string[] = []

  // Get service validation rules
  const serviceRule = serviceValidation[service as keyof typeof serviceValidation]

  if (!serviceRule) {
    // For unknown services, use generic validation
    if (!apiKeyPatterns.generic.test(key)) {
      errors.push({
        field: 'key',
        code: 'INVALID_FORMAT',
        message: 'API key format is invalid',
        severity: 'ERROR',
      })
    }
  } else {
    // Service-specific validation
    if (!serviceRule.keyPattern.test(key)) {
      errors.push({
        field: 'key',
        code: 'INVALID_SERVICE_FORMAT',
        message: `API key does not match ${serviceRule.name} format`,
        severity: 'ERROR',
      })
      suggestions.push(
        `${serviceRule.name} keys should match pattern: ${serviceRule.keyPattern.toString()}`
      )
    }
  }

  // Check for common security issues
  if (key.includes(' ')) {
    errors.push({
      field: 'key',
      code: 'CONTAINS_SPACES',
      message: 'API key should not contain spaces',
      severity: 'ERROR',
    })
  }

  if (key.length < 16) {
    warnings.push({
      field: 'key',
      code: 'SHORT_KEY',
      message: 'API key is shorter than recommended minimum (16 characters)',
      recommendation: 'Use a longer API key for better security',
    })
  }

  // Check for test vs production keys
  if (key.includes('test') || key.includes('sandbox')) {
    warnings.push({
      field: 'key',
      code: 'TEST_KEY_DETECTED',
      message: 'This appears to be a test/sandbox API key',
      recommendation: 'Ensure you are using production keys in production environment',
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  }
}

/**
 * Calculate security score for an API key
 */
export function calculateSecurityScore(keyData: {
  service: string
  key: string
  daysSinceCreated: number
  daysSinceLastRotation: number
  errorRate: number
  lastUsed?: Date
  rotationDays: number
}): number {
  let score = 100
  const factors: Array<{ factor: string; impact: number; reason: string }> = []

  // Age factor (0-20 points)
  const ageFactor = Math.min(keyData.daysSinceCreated / 365, 1) * 20
  score -= ageFactor
  factors.push({
    factor: 'Age',
    impact: -ageFactor,
    reason: `Key is ${keyData.daysSinceCreated} days old`,
  })

  // Rotation factor (0-25 points)
  const rotationFactor = Math.min(keyData.daysSinceLastRotation / keyData.rotationDays, 1) * 25
  score -= rotationFactor
  factors.push({
    factor: 'Rotation',
    impact: -rotationFactor,
    reason: `${keyData.daysSinceLastRotation} days since last rotation`,
  })

  // Error rate factor (0-20 points)
  const errorFactor = Math.min(keyData.errorRate, 0.5) * 40 // Max 20 points for 50% error rate
  score -= errorFactor
  factors.push({
    factor: 'Error Rate',
    impact: -errorFactor,
    reason: `${(keyData.errorRate * 100).toFixed(1)}% error rate`,
  })

  // Usage factor (0-10 points)
  if (keyData.lastUsed) {
    const daysSinceUsed = Math.floor(
      (Date.now() - keyData.lastUsed.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSinceUsed > 30) {
      const usageFactor = Math.min((daysSinceUsed - 30) / 60, 1) * 10
      score -= usageFactor
      factors.push({
        factor: 'Usage',
        impact: -usageFactor,
        reason: `${daysSinceUsed} days since last use`,
      })
    }
  }

  // Key format factor (0-15 points)
  const formatValidation = validateAPIKeyFormat(keyData.service, keyData.key)
  if (!formatValidation.isValid) {
    score -= 15
    factors.push({
      factor: 'Format',
      impact: -15,
      reason: 'Invalid key format detected',
    })
  } else if (formatValidation.warnings.length > 0) {
    score -= 5
    factors.push({
      factor: 'Format',
      impact: -5,
      reason: 'Key format warnings detected',
    })
  }

  // Bonus points for good practices
  if (keyData.daysSinceLastRotation < keyData.rotationDays * 0.5) {
    score += 5
    factors.push({
      factor: 'Proactive Rotation',
      impact: 5,
      reason: 'Key rotated proactively',
    })
  }

  if (keyData.errorRate < 0.01) {
    score += 5
    factors.push({
      factor: 'Low Error Rate',
      impact: 5,
      reason: 'Excellent error rate performance',
    })
  }

  return Math.max(0, Math.min(100, Math.round(score)))
}

/**
 * Generate security recommendations based on key analysis
 */
export function generateSecurityRecommendations(keyData: {
  service: string
  key: string
  daysSinceCreated: number
  daysSinceLastRotation: number
  errorRate: number
  lastUsed?: Date
  rotationDays: number
  status: APIKeyStatus
}): string[] {
  const recommendations: string[] = []
  const serviceRule = serviceValidation[keyData.service as keyof typeof serviceValidation]

  // Rotation recommendations
  if (keyData.daysSinceLastRotation > keyData.rotationDays) {
    recommendations.push(
      `🔄 Rotate this key immediately - it's ${keyData.daysSinceLastRotation - keyData.rotationDays} days overdue`
    )
  } else if (keyData.daysSinceLastRotation > keyData.rotationDays * 0.8) {
    recommendations.push(
      `⏰ Schedule key rotation soon - due in ${keyData.rotationDays - keyData.daysSinceLastRotation} days`
    )
  }

  // Usage recommendations
  if (keyData.lastUsed) {
    const daysSinceUsed = Math.floor(
      (Date.now() - keyData.lastUsed.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSinceUsed > 60) {
      recommendations.push(`🧹 Consider deactivating - unused for ${daysSinceUsed} days`)
    } else if (daysSinceUsed > 30) {
      recommendations.push(`📊 Review usage - inactive for ${daysSinceUsed} days`)
    }
  }

  // Error rate recommendations
  if (keyData.errorRate > 0.1) {
    recommendations.push(
      `🚨 High error rate (${(keyData.errorRate * 100).toFixed(1)}%) - investigate API issues`
    )
  } else if (keyData.errorRate > 0.05) {
    recommendations.push(
      `⚠️ Monitor error rate (${(keyData.errorRate * 100).toFixed(1)}%) - above normal levels`
    )
  }

  // Service-specific recommendations
  if (serviceRule) {
    if (keyData.rotationDays > serviceRule.recommendedRotationDays) {
      recommendations.push(
        `🔧 Consider shorter rotation period (recommended: ${serviceRule.recommendedRotationDays} days for ${serviceRule.name})`
      )
    }
  }

  // Format recommendations
  const formatValidation = validateAPIKeyFormat(keyData.service, keyData.key)
  if (formatValidation.warnings.length > 0) {
    formatValidation.warnings.forEach((warning) => {
      recommendations.push(`💡 ${warning.recommendation}`)
    })
  }

  // Status-based recommendations
  if (keyData.status === 'INACTIVE') {
    recommendations.push(`🔌 Reactivate key or remove if no longer needed`)
  } else if (keyData.status === 'COMPROMISED') {
    recommendations.push(`🛡️ Generate new key immediately and update all integrations`)
  }

  return recommendations
}

/**
 * Detect usage anomalies in API key patterns
 */
export function detectUsageAnomalies(usageData: {
  requestsLast24h: number
  requestsLast7d: number
  requestsLast30d: number
  errorRateLast24h: number
  errorRateLast7d: number
  avgRequestsPerDay: number
  peakRequestsPerHour: number
}): Array<{ type: string; severity: 'LOW' | 'MEDIUM' | 'HIGH'; description: string }> {
  const anomalies: Array<{
    type: string
    severity: 'LOW' | 'MEDIUM' | 'HIGH'
    description: string
  }> = []

  // Sudden spike in requests
  if (usageData.requestsLast24h > usageData.avgRequestsPerDay * 3) {
    anomalies.push({
      type: 'REQUEST_SPIKE',
      severity: 'MEDIUM',
      description: `Unusual spike: ${usageData.requestsLast24h} requests vs ${usageData.avgRequestsPerDay} average`,
    })
  }

  // Sudden drop in requests
  if (
    usageData.avgRequestsPerDay > 100 &&
    usageData.requestsLast24h < usageData.avgRequestsPerDay * 0.1
  ) {
    anomalies.push({
      type: 'REQUEST_DROP',
      severity: 'MEDIUM',
      description: `Unusual drop: ${usageData.requestsLast24h} requests vs ${usageData.avgRequestsPerDay} average`,
    })
  }

  // High error rate
  if (usageData.errorRateLast24h > 0.2) {
    anomalies.push({
      type: 'HIGH_ERROR_RATE',
      severity: 'HIGH',
      description: `High error rate: ${(usageData.errorRateLast24h * 100).toFixed(1)}% in last 24h`,
    })
  }

  // Error rate spike
  if (
    usageData.errorRateLast24h > usageData.errorRateLast7d * 3 &&
    usageData.errorRateLast24h > 0.05
  ) {
    anomalies.push({
      type: 'ERROR_SPIKE',
      severity: 'MEDIUM',
      description: `Error rate spike: ${(usageData.errorRateLast24h * 100).toFixed(1)}% vs ${(usageData.errorRateLast7d * 100).toFixed(1)}% average`,
    })
  }

  // Unusual peak traffic
  if (usageData.peakRequestsPerHour > usageData.avgRequestsPerDay) {
    anomalies.push({
      type: 'PEAK_TRAFFIC',
      severity: 'LOW',
      description: `High peak traffic: ${usageData.peakRequestsPerHour} requests/hour`,
    })
  }

  return anomalies
}

/**
 * Validate tenant permissions for API key operations
 */
export function validateAPIKeyPermissions(
  userRole: string,
  userPermissions: string[],
  operation: 'read' | 'create' | 'update' | 'delete' | 'rotate',
  service?: string
): { allowed: boolean; reason?: string } {
  // Super admin can do everything
  if (userRole === 'SUPER_ADMIN') {
    return { allowed: true }
  }

  // Regular admins cannot manage API keys
  if (userRole !== 'SUPER_ADMIN') {
    return {
      allowed: false,
      reason: 'API key management requires SUPER_ADMIN role',
    }
  }

  // Check specific service permissions if applicable
  if (service) {
    const serviceRule = serviceValidation[service as keyof typeof serviceValidation]
    if (serviceRule?.requiredPermissions) {
      const hasRequiredPermissions = serviceRule.requiredPermissions.every((permission) =>
        userPermissions.includes(permission)
      )
      if (!hasRequiredPermissions) {
        return {
          allowed: false,
          reason: `Missing required permissions for ${serviceRule.name}: ${serviceRule.requiredPermissions.join(', ')}`,
        }
      }
    }
  }

  return { allowed: true }
}
