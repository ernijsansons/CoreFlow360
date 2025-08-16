/**
 * CoreFlow360 - Request/Response Logging Middleware
 * Comprehensive API request and response logging
 */

import { NextRequest, NextResponse } from 'next/server'
import { errorTracker, performanceTracker } from '@/lib/monitoring/sentry'
import { analyticsJobs } from '@/lib/queue/processors/analytics.processor'
import crypto from 'crypto'

interface LogContext {
  requestId: string
  method: string
  url: string
  userAgent?: string
  ip?: string
  userId?: string
  tenantId?: string
  sessionId?: string
}

interface RequestLog {
  requestId: string
  timestamp: string
  method: string
  url: string
  headers: Record<string, string>
  query: Record<string, string>
  body?: any
  userAgent?: string
  ip?: string
  userId?: string
  tenantId?: string
  sessionId?: string
}

interface ResponseLog {
  requestId: string
  timestamp: string
  statusCode: number
  headers: Record<string, string>
  body?: any
  responseTime: number
  error?: string
}

// Sensitive headers to redact
const SENSITIVE_HEADERS = [
  'authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
  'x-auth-token'
]

// Paths to exclude from detailed logging
const EXCLUDE_PATHS = [
  '/api/health',
  '/api/metrics',
  '/favicon.ico',
  '/_next/',
  '/static/'
]

// Body size limit for logging (50KB)
const MAX_BODY_SIZE = 50 * 1024

/**
 * Sanitize headers by redacting sensitive information
 */
function sanitizeHeaders(headers: Headers): Record<string, string> {
  const sanitized: Record<string, string> = {}
  
  headers.forEach((value, key) => {
    if (SENSITIVE_HEADERS.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]'
    } else {
      sanitized[key] = value
    }
  })
  
  return sanitized
}

/**
 * Sanitize request/response body
 */
function sanitizeBody(body: any): any {
  if (!body || typeof body !== 'object') {
    return body
  }
  
  const sensitiveFields = [
    'password', 'token', 'secret', 'key', 'auth',
    'credit_card', 'ssn', 'social_security',
    'stripe_token', 'payment_method'
  ]
  
  const sanitized = Array.isArray(body) ? [...body] : { ...body }
  
  const sanitizeObject = (obj: any): any => {
    if (!obj || typeof obj !== 'object') {
      return obj
    }
    
    for (const key in obj) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        obj[key] = '[REDACTED]'
      } else if (typeof obj[key] === 'object') {
        obj[key] = sanitizeObject(obj[key])
      }
    }
    
    return obj
  }
  
  return sanitizeObject(sanitized)
}

/**
 * Check if path should be excluded from logging
 */
function shouldExcludePath(pathname: string): boolean {
  return EXCLUDE_PATHS.some(excluded => pathname.startsWith(excluded))
}

/**
 * Extract user context from request
 */
function extractUserContext(request: NextRequest): {
  userId?: string
  tenantId?: string
  sessionId?: string
} {
  return {
    userId: request.headers.get('x-user-id') || undefined,
    tenantId: request.headers.get('x-tenant-id') || undefined,
    sessionId: request.headers.get('x-session-id') || undefined
  }
}

/**
 * Get client IP address
 */
function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    request.ip ||
    'unknown'
  )
}

/**
 * Logger utility
 */
class APILogger {
  private logs: Map<string, RequestLog> = new Map()
  
  /**
   * Log request
   */
  async logRequest(request: NextRequest): Promise<string> {
    const requestId = crypto.randomUUID()
    const pathname = request.nextUrl.pathname
    
    // Skip logging for excluded paths
    if (shouldExcludePath(pathname)) {
      return requestId
    }
    
    const userContext = extractUserContext(request)
    
    // Clone request to read body
    let body: any = null
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        const contentType = request.headers.get('content-type')
        
        if (contentType?.includes('application/json')) {
          const text = await request.clone().text()
          if (text.length < MAX_BODY_SIZE) {
            body = JSON.parse(text)
          } else {
            body = { _note: 'Body too large for logging', size: text.length }
          }
        } else if (contentType?.includes('application/x-www-form-urlencoded')) {
          const formData = await request.clone().formData()
          body = Object.fromEntries(formData.entries())
        }
      } catch (error) {
        body = { _error: 'Failed to parse body', error: error.message }
      }
    }
    
    const requestLog: RequestLog = {
      requestId,
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      headers: sanitizeHeaders(request.headers),
      query: Object.fromEntries(request.nextUrl.searchParams.entries()),
      body: sanitizeBody(body),
      userAgent: request.headers.get('user-agent') || undefined,
      ip: getClientIP(request),
      ...userContext
    }
    
    this.logs.set(requestId, requestLog)
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📥 ${request.method} ${pathname}`, {
        requestId,
        ip: requestLog.ip,
        userAgent: requestLog.userAgent,
        ...(userContext.userId && { userId: userContext.userId })
      })
    }
    
    return requestId
  }
  
  /**
   * Log response
   */
  async logResponse(
    requestId: string,
    response: NextResponse,
    responseTime: number,
    error?: Error
  ) {
    const requestLog = this.logs.get(requestId)
    if (!requestLog) {
      return
    }
    
    // Skip logging for excluded paths
    if (shouldExcludePath(new URL(requestLog.url).pathname)) {
      this.logs.delete(requestId)
      return
    }
    
    // Clone response to read body
    let body: any = null
    try {
      const contentType = response.headers.get('content-type')
      
      if (contentType?.includes('application/json')) {
        const text = await response.clone().text()
        if (text.length < MAX_BODY_SIZE) {
          body = JSON.parse(text)
        } else {
          body = { _note: 'Response too large for logging', size: text.length }
        }
      }
    } catch (err) {
      body = { _error: 'Failed to parse response body' }
    }
    
    const responseLog: ResponseLog = {
      requestId,
      timestamp: new Date().toISOString(),
      statusCode: response.status,
      headers: sanitizeHeaders(response.headers),
      body: sanitizeBody(body),
      responseTime,
      error: error?.message
    }
    
    // Log to console
    const logLevel = response.status >= 500 ? 'error' : 
                     response.status >= 400 ? 'warn' : 'info'
    
    if (process.env.NODE_ENV === 'development' || logLevel === 'error') {
      const logMethod = logLevel === 'error' ? console.error :
                       logLevel === 'warn' ? console.warn : console.log
      
      logMethod(`📤 ${requestLog.method} ${new URL(requestLog.url).pathname}`, {
        requestId,
        status: response.status,
        responseTime: `${responseTime}ms`,
        ip: requestLog.ip,
        ...(error && { error: error.message })
      })
    }
    
    // Send to analytics queue for processing
    if (requestLog.userId || requestLog.tenantId) {
      await this.sendToAnalytics(requestLog, responseLog)
    }
    
    // Track errors in Sentry
    if (error || response.status >= 500) {
      errorTracker.captureAPIError(
        error || new Error(`HTTP ${response.status}`),
        {
          endpoint: new URL(requestLog.url).pathname,
          method: requestLog.method,
          userId: requestLog.userId,
          tenantId: requestLog.tenantId,
          statusCode: response.status,
          requestBody: requestLog.body,
          queryParams: requestLog.query
        }
      )
    }
    
    // Clean up
    this.logs.delete(requestId)
  }
  
  /**
   * Send analytics to queue
   */
  private async sendToAnalytics(requestLog: RequestLog, responseLog: ResponseLog) {
    try {
      await analyticsJobs.trackActivity(
        requestLog.userId!,
        'api_request',
        {
          endpoint: new URL(requestLog.url).pathname,
          method: requestLog.method,
          statusCode: responseLog.statusCode,
          responseTime: responseLog.responseTime,
          userAgent: requestLog.userAgent,
          ip: requestLog.ip
        }
      )
      
      // Track performance metrics
      await analyticsJobs.trackPerformance('api_response', {
        endpoint: new URL(requestLog.url).pathname,
        duration: responseLog.responseTime,
        statusCode: responseLog.statusCode,
        success: responseLog.statusCode < 400
      })
    } catch (error) {
      console.error('Failed to send analytics:', error)
    }
  }
  
  /**
   * Get request logs for debugging
   */
  getActiveLogs(): RequestLog[] {
    return Array.from(this.logs.values())
  }
  
  /**
   * Clear old logs
   */
  cleanup() {
    const cutoff = Date.now() - 5 * 60 * 1000 // 5 minutes
    
    for (const [id, log] of this.logs.entries()) {
      if (new Date(log.timestamp).getTime() < cutoff) {
        this.logs.delete(id)
      }
    }
  }
}

// Singleton logger instance
export const apiLogger = new APILogger()

// Clean up old logs periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    apiLogger.cleanup()
  }, 60000) // Every minute
}

/**
 * Logging middleware factory
 */
export function withLogging(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now()
    
    // Log request
    const requestId = await apiLogger.logRequest(request)
    
    try {
      // Execute handler with performance tracking
      const response = await performanceTracker.trackAPIRequest(
        request.nextUrl.pathname,
        request.method,
        () => handler(request),
        extractUserContext(request)
      )
      
      const responseTime = Date.now() - startTime
      
      // Add request ID to response headers
      response.headers.set('X-Request-ID', requestId)
      
      // Log response
      await apiLogger.logResponse(requestId, response, responseTime)
      
      return response
    } catch (error) {
      const responseTime = Date.now() - startTime
      const errorResponse = NextResponse.json(
        { 
          error: 'Internal Server Error',
          requestId,
          message: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      )
      
      errorResponse.headers.set('X-Request-ID', requestId)
      
      // Log error response
      await apiLogger.logResponse(requestId, errorResponse, responseTime, error as Error)
      
      return errorResponse
    }
  }
}

/**
 * Express-style logging middleware
 */
export function createLoggingMiddleware() {
  return withLogging
}

/**
 * Log structured data
 */
export const structuredLogger = {
  info(message: string, data?: any) {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...data
    }))
  },
  
  warn(message: string, data?: any) {
    console.warn(JSON.stringify({
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      ...data
    }))
  },
  
  error(message: string, error?: Error, data?: any) {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : undefined,
      timestamp: new Date().toISOString(),
      ...data
    }))
  }
}