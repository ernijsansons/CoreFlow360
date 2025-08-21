/**
 * CoreFlow360 - Telemetry Middleware
 *
 * Automatic request tracing and business metrics collection for all API endpoints
 */

import { NextRequest, NextResponse } from 'next/server'
import { telemetry } from '@/lib/telemetry/opentelemetry'
import { v4 as uuidv4 } from 'uuid'

export interface TelemetryConfig {
  enabled: boolean
  traceRequests: boolean
  collectMetrics: boolean
  excludePaths: string[]
  highSecurityEndpoints: string[]
}

const defaultConfig: TelemetryConfig = {
  enabled: process.env.NODE_ENV !== 'test',
  traceRequests: true,
  collectMetrics: true,
  excludePaths: ['/health', '/_next/', '/favicon.ico', '/robots.txt', '/sitemap.xml'],
  highSecurityEndpoints: ['/api/admin', '/api/stripe', '/api/voice', '/api/consciousness'],
}

/**
 * Telemetry middleware for automatic request tracing
 */
export function withTelemetry(
  handler: (req: NextRequest, ...args: unknown[]) => Promise<NextResponse>,
  config: Partial<TelemetryConfig> = {}
) {
  const telemetryConfig = { ...defaultConfig, ...config }

  return async (req: NextRequest, ...args: unknown[]): Promise<NextResponse> => {
    // Skip telemetry if disabled or excluded path
    if (!telemetryConfig.enabled || shouldSkipTelemetry(req.url, telemetryConfig)) {
      return handler(req, ...args)
    }

    const startTime = Date.now()
    const requestId = req.headers.get('x-request-id') || uuidv4()
    const pathname = new URL(req.url).pathname
    const method = req.method

    // Extract business context
    const metadata = {
      method,
      endpoint: pathname,
      userId: req.headers.get('x-user-id') || 'anonymous',
      tenantId: req.headers.get('x-tenant-id') || 'default',
      userAgent: req.headers.get('user-agent') || 'unknown',
      ip:
        req.headers.get('x-forwarded-for')?.split(',')[0] ||
        req.headers.get('x-real-ip') ||
        'unknown',
    }

    // Add request ID to headers for downstream tracing
    const headers = new Headers(req.headers)
    headers.set('x-request-id', requestId)
    headers.set('x-trace-start-time', startTime.toString())

    const requestWithHeaders = new NextRequest(req, { headers })

    try {
      const response = await telemetry.traceApiRequest(
        `api.${pathname.replace(/^\/api\//, '').replace(/\//g, '.')}`,
        () => handler(requestWithHeaders, ...args),
        metadata
      )

      // Add telemetry headers to response
      response.headers.set('x-request-id', requestId)
      response.headers.set('x-processing-time', (Date.now() - startTime).toString())

      // Add trace context for client debugging (non-production only)
      if (process.env.NODE_ENV === 'development') {
        const traceContext = telemetry.getCurrentTraceContext()
        if (traceContext) {
          response.headers.set('x-trace-id', traceContext.traceId)
          response.headers.set('x-span-id', traceContext.spanId)
        }
      }

      // Record success metrics
      telemetry.recordMetric('apiRequestCount', 1, {
        method,
        endpoint: pathname,
        status: response.status.toString(),
        tenant: metadata.tenantId,
      })

      return response
    } catch (error) {
      // Record error metrics
      telemetry.recordMetric('apiRequestCount', 1, {
        method,
        endpoint: pathname,
        status: 'error',
        tenant: metadata.tenantId,
      })

      telemetry.recordMetric('errorRate', 1, {
        endpoint: pathname,
        error: error.constructor.name,
      })

      throw error
    }
  }
}

/**
 * Business operation tracing wrapper
 */
export function traceBusinessOperation<T>(
  operationName: string,
  operation: () => Promise<T>,
  context: {
    entityType?: string
    entityId?: string
    operationType?: string
    tenantId?: string
    userId?: string
  }
): Promise<T> {
  return telemetry.traceBusinessOperation(operationName, operation, context)
}

/**
 * Database operation tracing wrapper
 */
export function traceDatabaseOperation<T>(
  operationName: string,
  query: () => Promise<T>,
  context: {
    table?: string
    operation_type: 'select' | 'insert' | 'update' | 'delete'
    tenantId?: string
  }
): Promise<T> {
  return telemetry.traceDatabaseOperation(operationName, query, context)
}

/**
 * External API call tracing wrapper
 */
export function traceExternalApiCall<T>(
  serviceName: string,
  operation: () => Promise<T>,
  context: {
    url: string
    method: string
    timeout?: number
  }
): Promise<T> {
  return telemetry.traceExternalApiCall(serviceName, operation, context)
}

/**
 * Manual span creation for complex operations
 */
export function createSpan(name: string, attributes?: Record<string, unknown>) {
  return telemetry.createSpan({
    name,
    attributes: {
      'service.name': 'coreflow360',
      'service.version': '1.0.0',
      ...attributes,
    },
  })
}

/**
 * Record custom business events
 */
export function recordBusinessEvent(eventName: string, attributes: Record<string, unknown>): void {
  telemetry.recordEvent(eventName, {
    'event.category': 'business',
    'event.source': 'coreflow360',
    ...attributes,
  })
}

/**
 * Record performance metrics
 */
export function recordPerformanceMetric(
  metricName: string,
  value: number,
  attributes?: Record<string, string>
): void {
  telemetry.recordMetric(metricName as unknown, value, attributes)
}

/**
 * Get current trace context for manual propagation
 */
export function getCurrentTraceContext() {
  return telemetry.getCurrentTraceContext()
}

/**
 * Enhanced error tracking with telemetry
 */
export function trackError(
  error: Error,
  context: {
    operation?: string
    entityType?: string
    entityId?: string
    userId?: string
    tenantId?: string
    endpoint?: string
  }
): void {
  recordBusinessEvent('error_occurred', {
    'error.name': error.constructor.name,
    'error.message': error.message,
    'error.stack': error.stack?.slice(0, 1000), // Truncate stack trace
    'operation.name': context.operation || 'unknown',
    'business.entity_type': context.entityType || 'unknown',
    'business.entity_id': context.entityId || 'unknown',
    'user.id': context.userId || 'anonymous',
    'tenant.id': context.tenantId || 'default',
    'http.endpoint': context.endpoint || 'unknown',
  })

  telemetry.recordMetric('errorRate', 1, {
    error_type: error.constructor.name,
    operation: context.operation || 'unknown',
  })
}

/**
 * User activity tracking
 */
export function trackUserActivity(
  activity: string,
  userId: string,
  tenantId: string,
  metadata?: Record<string, unknown>
): void {
  recordBusinessEvent('user_activity', {
    'activity.type': activity,
    'user.id': userId,
    'tenant.id': tenantId,
    'activity.timestamp': new Date().toISOString(),
    ...metadata,
  })

  telemetry.recordMetric('concurrentUsers', 1, {
    tenant: tenantId,
    activity,
  })
}

/**
 * Check if request should skip telemetry
 */
function shouldSkipTelemetry(url: string, config: TelemetryConfig): boolean {
  const pathname = new URL(url).pathname

  return config.excludePaths.some((path) => pathname.startsWith(path) || pathname === path)
}

/**
 * Middleware wrapper for Next.js API routes
 */
export function apiTelemetryMiddleware(
  handler: (req: NextRequest, context?: unknown) => Promise<NextResponse>,
  config?: Partial<TelemetryConfig>
) {
  return withTelemetry(handler, config)
}

/**
 * Express-style middleware for compatibility
 */
export function expressTelemetryMiddleware(config?: Partial<TelemetryConfig>) {
  const telemetryConfig = { ...defaultConfig, ...config }

  return (req: unknown, res: unknown, next: unknown) => {
    if (!telemetryConfig.enabled) {
      return next()
    }

    const startTime = Date.now()
    const requestId = req.headers['x-request-id'] || uuidv4()

    // Add request ID
    req.requestId = requestId
    res.setHeader('x-request-id', requestId)

    // Track request
    recordBusinessEvent('http_request_started', {
      'http.method': req.method,
      'http.url': req.url,
      'http.user_agent': req.headers['user-agent'] || 'unknown',
      'request.id': requestId,
    })

    // Override res.end to capture response
    const originalEnd = res.end
    res.end = function (...args: unknown[]) {
      const duration = Date.now() - startTime

      recordBusinessEvent('http_request_completed', {
        'http.method': req.method,
        'http.url': req.url,
        'http.status_code': res.statusCode,
        'http.response_time_ms': duration,
        'request.id': requestId,
      })

      telemetry.recordMetric('apiRequestDuration', duration, {
        method: req.method,
        status: res.statusCode.toString(),
      })

      res.setHeader('x-processing-time', duration.toString())

      return originalEnd.apply(res, args)
    }

    next()
  }
}
