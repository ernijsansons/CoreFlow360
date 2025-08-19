/**
 * Error Context Utility
 * Eliminates duplication of ErrorContext creation across 20+ API routes
 */

import { NextRequest } from 'next/server'

export interface ErrorContext {
  endpoint: string
  method: string
  userAgent?: string
  ip?: string
  requestId?: string
  tenantId?: string
  userId?: string
  timestamp: string
  userContext?: {
    id: string
    role: string
    tenantId: string
    permissions: string[]
  }
}

export interface ErrorContextOptions {
  includeUserAgent?: boolean
  includeIp?: boolean
  includeUserContext?: boolean
  customFields?: Record<string, unknown>
}

/**
 * Creates a standardized error context from a NextRequest
 * @param request - The Next.js request object
 * @param endpoint - The API endpoint path
 * @param options - Additional context options
 * @returns Standardized ErrorContext object
 */
export function createErrorContext(
  request: NextRequest,
  endpoint: string,
  options: ErrorContextOptions = {}
): ErrorContext {
  const {
    includeUserAgent = true,
    includeIp = true,
    includeUserContext = false,
    customFields = {},
  } = options

  // Extract IP address from various headers
  const getClientIp = (req: NextRequest): string | undefined => {
    const forwarded = req.headers.get('x-forwarded-for')
    const realIp = req.headers.get('x-real-ip')
    const clientIp = req.headers.get('x-client-ip')

    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }

    return realIp || clientIp || req.ip || undefined
  }

  const baseContext: ErrorContext = {
    endpoint: endpoint.startsWith('/') ? endpoint : `/${endpoint}`,
    method: request.method,
    timestamp: new Date().toISOString(),
    requestId: request.headers.get('x-request-id') || crypto.randomUUID(),
    ...customFields,
  }

  // Add optional fields based on options
  if (includeUserAgent) {
    baseContext.userAgent = request.headers.get('user-agent') || undefined
  }

  if (includeIp) {
    baseContext.ip = getClientIp(request)
  }

  // Extract tenant and user IDs from headers if available
  const tenantId = request.headers.get('x-tenant-id')
  const userId = request.headers.get('x-user-id')

  if (tenantId) baseContext.tenantId = tenantId
  if (userId) baseContext.userId = userId

  return baseContext
}

/**
 * Creates error context with user session information
 * @param request - The Next.js request object
 * @param endpoint - The API endpoint path
 * @param userSession - User session data
 * @returns ErrorContext with user information
 */
export function createErrorContextWithUser(
  request: NextRequest,
  endpoint: string,
  userSession: {
    id: string
    role: string
    tenantId: string
    permissions: string[]
  }
): ErrorContext {
  const context = createErrorContext(request, endpoint, {
    includeUserContext: true,
  })

  context.userId = userSession.id
  context.tenantId = userSession.tenantId
  context.userContext = userSession

  return context
}

/**
 * Creates a minimal error context for high-performance scenarios
 * @param request - The Next.js request object
 * @param endpoint - The API endpoint path
 * @returns Minimal ErrorContext
 */
export function createMinimalErrorContext(
  request: NextRequest,
  endpoint: string
): Pick<ErrorContext, 'endpoint' | 'method' | 'timestamp' | 'requestId'> {
  return {
    endpoint: endpoint.startsWith('/') ? endpoint : `/${endpoint}`,
    method: request.method,
    timestamp: new Date().toISOString(),
    requestId: request.headers.get('x-request-id') || crypto.randomUUID(),
  }
}

/**
 * Enhances an existing error context with additional information
 * @param existingContext - The existing error context
 * @param additionalData - Additional data to merge
 * @returns Enhanced ErrorContext
 */
export function enhanceErrorContext(
  existingContext: ErrorContext,
  additionalData: Partial<ErrorContext>
): ErrorContext {
  return {
    ...existingContext,
    ...additionalData,
    timestamp: new Date().toISOString(), // Update timestamp
  }
}

/**
 * Creates error context for webhook endpoints
 * @param request - The Next.js request object
 * @param webhookType - Type of webhook (stripe, twilio, etc.)
 * @returns Webhook-specific ErrorContext
 */
export function createWebhookErrorContext(request: NextRequest, webhookType: string): ErrorContext {
  const webhookSignature =
    request.headers.get('stripe-signature') ||
    request.headers.get('x-hub-signature') ||
    request.headers.get('webhook-signature')

  return createErrorContext(request, `/api/webhook/${webhookType}`, {
    customFields: {
      webhookType,
      hasSignature: !!webhookSignature,
      contentType: request.headers.get('content-type'),
    },
  })
}

/**
 * Validates if an ErrorContext has required fields
 * @param context - The error context to validate
 * @returns Boolean indicating if context is valid
 */
export function isValidErrorContext(context: unknown): context is ErrorContext {
  return (
    context &&
    typeof context.endpoint === 'string' &&
    typeof context.method === 'string' &&
    typeof context.timestamp === 'string'
  )
}

/**
 * Sanitizes error context by removing sensitive information
 * @param context - The error context to sanitize
 * @returns Sanitized ErrorContext
 */
export function sanitizeErrorContext(context: ErrorContext): ErrorContext {
  const sanitized = { ...context }

  // Remove potentially sensitive information
  if (sanitized.userAgent) {
    // Keep only browser info, remove detailed version numbers
    sanitized.userAgent = sanitized.userAgent.replace(/\d+\.\d+\.\d+/g, 'x.x.x')
  }

  // Mask IP address for privacy
  if (sanitized.ip) {
    const ipParts = sanitized.ip.split('.')
    if (ipParts.length === 4) {
      sanitized.ip = `${ipParts[0]}.${ipParts[1]}.xxx.xxx`
    }
  }

  return sanitized
}
