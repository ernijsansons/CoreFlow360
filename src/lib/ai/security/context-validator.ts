/**
 * CoreFlow360 - AI Security Context Validator
 * Validates and creates secure contexts for AI operations
 */

import { SecurityContext } from '@/types/bundles'
import { AIFlowContext } from '../contexts/ai-flow-context'
import crypto from 'crypto'

/**
 * Create a secure context for AI operations
 */
export function createSecurityContext(flowContext: AIFlowContext): SecurityContext {
  return {
    tenantId: flowContext.tenantId,
    userId: flowContext.userId,
    role: flowContext.metadata?.role || 'user',
    permissions: flowContext.metadata?.permissions || [],
    requestId: generateRequestId(),
    timestamp: new Date(),
    ipAddress: flowContext.metadata?.ipAddress || 'unknown',
    userAgent: flowContext.metadata?.userAgent || 'unknown',
    sessionId: flowContext.sessionId,
    dataClassification: flowContext.metadata?.dataClassification || 'internal',
    encryptionRequired: flowContext.metadata?.encryptionRequired !== false,
    auditLog: true,
    rateLimitTier: flowContext.metadata?.rateLimitTier || 'standard'
  }
}

/**
 * Validate security context
 */
export function validateSecurityContext(context: SecurityContext): boolean {
  // Required fields
  if (!context.tenantId || !context.userId || !context.requestId) {
    return false
  }

  // Validate tenant ID format
  if (!isValidTenantId(context.tenantId)) {
    return false
  }

  // Validate user ID format
  if (!isValidUserId(context.userId)) {
    return false
  }

  // Validate timestamp (not future, not too old)
  const now = new Date()
  const contextTime = new Date(context.timestamp)
  const timeDiff = now.getTime() - contextTime.getTime()
  if (timeDiff < 0 || timeDiff > 3600000) { // 1 hour max
    return false
  }

  return true
}

/**
 * Sanitize security context for logging
 */
export function sanitizeContextForLogging(context: SecurityContext): any {
  return {
    tenantId: context.tenantId,
    userId: hashUserId(context.userId),
    role: context.role,
    requestId: context.requestId,
    timestamp: context.timestamp,
    dataClassification: context.dataClassification,
    rateLimitTier: context.rateLimitTier
  }
}

/**
 * Check if user has required permission
 */
export function hasPermission(context: SecurityContext, permission: string): boolean {
  if (context.role === 'admin') {
    return true
  }
  
  return context.permissions.includes(permission)
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`
}

/**
 * Validate tenant ID format
 */
function isValidTenantId(tenantId: string): boolean {
  // Should be a CUID or similar format
  return /^[a-zA-Z0-9]{20,30}$/.test(tenantId)
}

/**
 * Validate user ID format
 */
function isValidUserId(userId: string): boolean {
  // Should be a CUID or similar format
  return /^[a-zA-Z0-9]{20,30}$/.test(userId)
}

/**
 * Hash user ID for privacy
 */
function hashUserId(userId: string): string {
  return crypto.createHash('sha256').update(userId).digest('hex').substring(0, 16)
}

/**
 * Create rate limit key for context
 */
export function createRateLimitKey(context: SecurityContext): string {
  return `ratelimit:${context.tenantId}:${context.userId}:${context.rateLimitTier}`
}

/**
 * Get rate limit for tier
 */
export function getRateLimitForTier(tier: string): { requests: number; window: number } {
  const limits: Record<string, { requests: number; window: number }> = {
    free: { requests: 10, window: 60000 }, // 10 requests per minute
    standard: { requests: 100, window: 60000 }, // 100 requests per minute
    premium: { requests: 1000, window: 60000 }, // 1000 requests per minute
    enterprise: { requests: 10000, window: 60000 } // 10000 requests per minute
  }
  
  return limits[tier] || limits.standard
}