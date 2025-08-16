/**
 * CoreFlow360 - API Error Wrapper
 * Wraps API route handlers with comprehensive error handling
 */

import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library'
import { getServerSession, ExtendedSession } from '@/lib/auth'
import { errorHandler, ErrorType } from '@/lib/error-handler'
import { validateCSRFMiddleware } from '@/lib/csrf'
import crypto from 'crypto'

export interface ApiContext {
  request: NextRequest
  requestId: string
  session: ExtendedSession | null
  user: ExtendedSession['user'] | null
  tenantId: string | null
}

export type ApiHandler<T = unknown> = (
  context: ApiContext
) => Promise<NextResponse<T>> | NextResponse<T>

export interface ApiWrapperOptions {
  requireAuth?: boolean
  requireTenant?: boolean
  rateLimitKey?: string
  rateLimitMax?: number
  rateLimitWindow?: number
  validateSession?: boolean
}

class ApiWrapper {
  private static rateLimitStore = new Map<string, { requests: number[]; windowStart: number }>()
  private static config = {
    rateLimitWindow: 60000, // 1 minute
    rateLimitMaxRequests: 100
  }
  
  /**
   * Wrap an API route handler with comprehensive error handling
   */
  static wrap(handler: ApiHandler, options: ApiWrapperOptions = {}): (req: NextRequest) => Promise<NextResponse> {
    return async (request: NextRequest) => {
      const requestId = crypto.randomUUID()
      const startTime = Date.now()
      
      let session: ExtendedSession | null = null
      let user: ExtendedSession['user'] | null = null
      let tenantId: string | null = null

      try {
        // Extract basic context
        const method = request.method
        const url = request.url
        const userAgent = request.headers.get('user-agent') || undefined
        const ip = this.getClientIP(request)

        // Create base error context
        const baseErrorContext = {
          requestId,
          endpoint: url,
          method,
          userAgent,
          ip
        }

        // Authentication check
        if (options.requireAuth || options.validateSession) {
          session = await getServerSession()
          
          if (!session && options.requireAuth) {
            return errorHandler.handleError(
              new Error('Authentication required'),
              baseErrorContext,
              ErrorType.AUTHENTICATION
            )
          }

          if (session) {
            user = session.user
            tenantId = user?.tenantId || null
            
            // Add user context to error context
            Object.assign(baseErrorContext, {
              userId: user?.id,
              tenantId
            })
          }
        }

        // CSRF Protection for state-changing operations
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
          const isValidCSRF = await validateCSRFMiddleware(request, process.env.API_KEY_SECRET!)
          
          if (!isValidCSRF) {
            return errorHandler.handleError(
              new Error('CSRF token validation failed'),
              baseErrorContext,
              ErrorType.AUTHORIZATION
            )
          }
        }

        // Tenant validation
        if (options.requireTenant && !tenantId) {
          return errorHandler.handleError(
            new Error('Tenant context required'),
            baseErrorContext,
            ErrorType.AUTHORIZATION
          )
        }

        // Rate limiting (if configured)
        if (options.rateLimitKey) {
          const rateLimitResult = await this.checkRateLimit(
            request,
            options.rateLimitKey,
            options.rateLimitMax || 100,
            options.rateLimitWindow || 60000,
            tenantId,
            user?.id
          )

          if (!rateLimitResult.allowed) {
            return errorHandler.handleRateLimitError(
              rateLimitResult.retryAfter,
              baseErrorContext
            )
          }
        }

        // Create API context
        const context: ApiContext = {
          request,
          requestId,
          session,
          user,
          tenantId
        }

        // Execute the handler
        const result = await handler(context)

        // Log successful request
        this.logRequest({
          requestId,
          method,
          url,
          status: 200,
          duration: Date.now() - startTime,
          userId: user?.id,
          tenantId,
          success: true
        })

        // Add request ID to response headers
        result.headers.set('x-request-id', requestId)
        
        return result

      } catch (error) {
        const duration = Date.now() - startTime
        
        // Enhanced error context with request details
        const errorContext = {
          requestId,
          endpoint: request.url,
          method: request.method,
          userAgent: request.headers.get('user-agent') || undefined,
          ip: this.getClientIP(request),
          userId: user?.id,
          tenantId,
          metadata: {
            duration,
            authenticated: !!session,
            hasUser: !!user,
            hasTenant: !!tenantId
          }
        }

        // Log failed request
        this.logRequest({
          requestId,
          method: request.method,
          url: request.url,
          status: this.getErrorStatus(error),
          duration,
          userId: user?.id,
          tenantId,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        })

        // Handle specific error types
        if (error instanceof ZodError) {
          return errorHandler.handleZodError(error, errorContext)
        }

        if (error instanceof PrismaClientKnownRequestError || error instanceof PrismaClientValidationError) {
          return errorHandler.handlePrismaError(error, errorContext)
        }

        // Determine error type based on error message/properties
        let errorType = ErrorType.INTERNAL
        
        if (error instanceof Error) {
          const message = error.message.toLowerCase()
          
          if (message.includes('unauthorized') || message.includes('authentication')) {
            errorType = ErrorType.AUTHENTICATION
          } else if (message.includes('forbidden') || message.includes('access denied')) {
            errorType = ErrorType.AUTHORIZATION
          } else if (message.includes('not found')) {
            errorType = ErrorType.NOT_FOUND
          } else if (message.includes('validation') || message.includes('invalid')) {
            errorType = ErrorType.VALIDATION
          } else if (message.includes('database') || message.includes('prisma')) {
            errorType = ErrorType.DATABASE
          } else if (message.includes('external') || message.includes('service')) {
            errorType = ErrorType.EXTERNAL_SERVICE
          }
        }

        return errorHandler.handleError(error, errorContext, errorType)
      }
    }
  }

  /**
   * Extract client IP address
   */
  private static getClientIP(request: NextRequest): string {
    // Check various headers for the real IP
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const cfConnectingIP = request.headers.get('cf-connecting-ip')
    
    if (cfConnectingIP) return cfConnectingIP
    if (realIP) return realIP
    if (forwarded) return forwarded.split(',')[0].trim()
    
    return 'unknown'
  }

  /**
   * Simple rate limiting implementation
   */
  private static async checkRateLimit(
    request: NextRequest,
    key: string,
    max: number,
    window: number,
    tenantId?: string | null,
    userId?: string
  ): Promise<{ allowed: boolean; retryAfter: number }> {
    // In production, this would use Redis or similar
    // Simple in-memory rate limiter with LRU cache
    const now = Date.now()
    const identifier = `${key}:${tenantId || 'anonymous'}:${userId || this.getClientIP(request)}`
    
    // Get or create bucket for this identifier
    let bucket = this.rateLimitStore.get(identifier)
    if (!bucket) {
      bucket = { requests: [], windowStart: now }
      this.rateLimitStore.set(identifier, bucket)
    }
    
    // Clean old requests outside the window
    const windowStart = now - this.config.rateLimitWindow
    bucket.requests = bucket.requests.filter(timestamp => timestamp > windowStart)
    
    // Check if we're within limits
    if (bucket.requests.length >= this.config.rateLimitMaxRequests) {
      const oldestRequest = Math.min(...bucket.requests)
      const retryAfter = Math.ceil((oldestRequest + this.config.rateLimitWindow - now) / 1000)
      
      return {
        allowed: false,
        retryAfter: Math.max(retryAfter, 1)
      }
    }
    
    // Add current request
    bucket.requests.push(now)
    bucket.windowStart = windowStart
    
    return {
      allowed: true,
      retryAfter: 0
    }
  }

  /**
   * Get HTTP status code from error
   */
  private static getErrorStatus(error: unknown): number {
    if (error instanceof Error) {
      const message = error.message.toLowerCase()
      
      if (message.includes('unauthorized')) return 401
      if (message.includes('forbidden')) return 403
      if (message.includes('not found')) return 404
      if (message.includes('validation')) return 400
      if (message.includes('conflict')) return 409
    }
    
    return 500
  }

  /**
   * Log request details
   */
  private static logRequest(details: {
    requestId: string
    method: string
    url: string
    status: number
    duration: number
    userId?: string
    tenantId?: string | null
    success: boolean
    error?: string
  }) {
    const logLevel = details.success ? 'info' : 'error'
    const message = `${details.method} ${details.url} - ${details.status} (${details.duration}ms)`
    
    console[logLevel](message, {
      requestId: details.requestId,
      status: details.status,
      duration: details.duration,
      userId: details.userId,
      tenantId: details.tenantId,
      error: details.error
    })
  }
}

// Convenience function for common API wrapper usage
export function withApiWrapper(handler: ApiHandler, options?: ApiWrapperOptions) {
  return ApiWrapper.wrap(handler, options)
}

// Pre-configured wrappers for common scenarios
export const withAuth = (handler: ApiHandler, options: Omit<ApiWrapperOptions, 'requireAuth'> = {}) =>
  withApiWrapper(handler, { ...options, requireAuth: true })

export const withTenant = (handler: ApiHandler, options: Omit<ApiWrapperOptions, 'requireAuth' | 'requireTenant'> = {}) =>
  withApiWrapper(handler, { ...options, requireAuth: true, requireTenant: true })

export const withRateLimit = (handler: ApiHandler, max: number = 100, window: number = 60000, key: string = 'api') =>
  withApiWrapper(handler, { rateLimitKey: key, rateLimitMax: max, rateLimitWindow: window })

export default ApiWrapper