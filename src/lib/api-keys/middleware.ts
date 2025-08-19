/**
 * CoreFlow360 - API Key Management Middleware
 * Enhanced security middleware for API key operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { z } from 'zod'

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 50 // Max requests per window

interface SecurityValidationResult {
  isValid: boolean
  error?: string
  statusCode?: number
}

/**
 * Rate limiting middleware
 */
export function applyRateLimit(request: NextRequest): SecurityValidationResult {
  const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const key = `api_key_mgmt:${clientIP}`
  const now = Date.now()

  const current = rateLimitStore.get(key)

  if (!current) {
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return { isValid: true }
  }

  if (now > current.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return { isValid: true }
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      isValid: false,
      error: 'Rate limit exceeded. Please try again later.',
      statusCode: 429,
    }
  }

  current.count++
  return { isValid: true }
}

/**
 * Validate super admin session
 */
export async function validateSuperAdminSession(): Promise<SecurityValidationResult> {
  try {
    const session = await getServerSession()

    if (!session) {
      return {
        isValid: false,
        error: 'Authentication required',
        statusCode: 401,
      }
    }

    if (session.user.role !== 'SUPER_ADMIN') {
      return {
        isValid: false,
        error: 'Super Admin privileges required',
        statusCode: 403,
      }
    }

    return { isValid: true }
  } catch (error) {
    return {
      isValid: false,
      error: 'Authentication validation failed',
      statusCode: 500,
    }
  }
}

/**
 * Validate request headers for security
 */
export function validateRequestHeaders(request: NextRequest): SecurityValidationResult {
  const contentType = request.headers.get('content-type')
  const userAgent = request.headers.get('user-agent')
  const origin = request.headers.get('origin')

  // Check content type for POST/PUT requests
  if (['POST', 'PUT'].includes(request.method) && !contentType?.includes('application/json')) {
    return {
      isValid: false,
      error: 'Invalid content type. Expected application/json',
      statusCode: 400,
    }
  }

  // Basic user agent validation
  if (!userAgent || userAgent.length < 10) {
    return {
      isValid: false,
      error: 'Invalid or missing user agent',
      statusCode: 400,
    }
  }

  // CORS validation in production
  if (process.env.NODE_ENV === 'production' && origin) {
    const allowedOrigins = [
      process.env.NEXTAUTH_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    ].filter(Boolean)

    if (!allowedOrigins.includes(origin)) {
      return {
        isValid: false,
        error: 'Origin not allowed',
        statusCode: 403,
      }
    }
  }

  return { isValid: true }
}

/**
 * Validate API key data payload
 */
export function validateAPIKeyPayload(
  data: unknown,
  operation: 'create' | 'update' | 'rotate'
): SecurityValidationResult {
  try {
    // Check for suspicious patterns in API keys
    if (data.key || data.newKey) {
      const keyToValidate = data.key || data.newKey

      // Check for obviously fake keys
      if (
        keyToValidate.includes('test') ||
        keyToValidate.includes('fake') ||
        keyToValidate.includes('example') ||
        keyToValidate === 'your-api-key-here' ||
        keyToValidate.length < 8
      ) {
        return {
          isValid: false,
          error: 'Invalid API key format detected',
          statusCode: 400,
        }
      }

      // Check for potential injection attempts
      if (
        keyToValidate.includes('<') ||
        keyToValidate.includes('>') ||
        keyToValidate.includes('script') ||
        keyToValidate.includes('javascript:')
      ) {
        return {
          isValid: false,
          error: 'Malicious content detected in API key',
          statusCode: 400,
        }
      }
    }

    // Validate description length and content
    if (data.description && data.description.length > 500) {
      return {
        isValid: false,
        error: 'Description too long (max 500 characters)',
        statusCode: 400,
      }
    }

    // Validate name format
    if (data.name) {
      if (data.name.length > 100) {
        return {
          isValid: false,
          error: 'Name too long (max 100 characters)',
          statusCode: 400,
        }
      }

      if (!/^[a-zA-Z0-9\s_-]+$/.test(data.name)) {
        return {
          isValid: false,
          error: 'Name contains invalid characters',
          statusCode: 400,
        }
      }
    }

    return { isValid: true }
  } catch (error) {
    return {
      isValid: false,
      error: 'Payload validation failed',
      statusCode: 400,
    }
  }
}

/**
 * Audit log security event
 */
export async function auditSecurityEvent(
  event: string,
  details: Record<string, unknown>,
  request: NextRequest
) {
  try {
    const session = await getServerSession()
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // In production, this should log to a secure audit system
    console.log('Security Event:', {
      timestamp: new Date().toISOString(),
      event,
      userId: session?.user?.id,
      tenantId: session?.user?.tenantId,
      clientIP,
      userAgent,
      details,
    })

    // TODO: Implement actual audit logging to database or external service
  } catch (error) {}
}

/**
 * Comprehensive security middleware
 */
export async function securityMiddleware(
  request: NextRequest,
  operation: 'create' | 'read' | 'update' | 'delete' | 'rotate'
): Promise<SecurityValidationResult> {
  // Apply rate limiting
  const rateLimitResult = applyRateLimit(request)
  if (!rateLimitResult.isValid) {
    await auditSecurityEvent('RATE_LIMIT_EXCEEDED', { operation }, request)
    return rateLimitResult
  }

  // Validate request headers
  const headersResult = validateRequestHeaders(request)
  if (!headersResult.isValid) {
    await auditSecurityEvent('INVALID_HEADERS', { operation }, request)
    return headersResult
  }

  // Validate super admin session
  const sessionResult = await validateSuperAdminSession()
  if (!sessionResult.isValid) {
    await auditSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', { operation }, request)
    return sessionResult
  }

  // For operations that modify data, validate payload
  if (['create', 'update', 'rotate'].includes(operation) && request.method !== 'GET') {
    try {
      const body = await request.json()
      const payloadResult = validateAPIKeyPayload(body, operation as unknown)
      if (!payloadResult.isValid) {
        await auditSecurityEvent('INVALID_PAYLOAD', { operation, payload: body }, request)
        return payloadResult
      }
    } catch (error) {
      return {
        isValid: false,
        error: 'Invalid JSON payload',
        statusCode: 400,
      }
    }
  }

  // Audit successful security validation
  await auditSecurityEvent('SECURITY_VALIDATION_SUCCESS', { operation }, request)

  return { isValid: true }
}

/**
 * Error response formatter
 */
export function formatErrorResponse(error: string, statusCode: number = 400) {
  return NextResponse.json(
    {
      error,
      timestamp: new Date().toISOString(),
      code: statusCode,
    },
    { status: statusCode }
  )
}

/**
 * Sanitize response data to prevent information leakage
 */
export function sanitizeResponse(data: unknown): unknown {
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeResponse(item))
  }

  if (typeof data === 'object' && data !== null) {
    const sanitized: unknown = {}

    for (const [key, value] of Object.entries(data)) {
      // Remove sensitive fields from responses
      if (
        key === 'encrypted_key' ||
        key === 'password' ||
        key === 'secret' ||
        key.includes('token')
      ) {
        continue
      }

      // Sanitize nested objects
      sanitized[key] = sanitizeResponse(value)
    }

    return sanitized
  }

  return data
}

/**
 * Input sanitization
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return input

  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 1000) // Limit length
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}
