/**
 * CoreFlow360 - Metrics Collection Middleware
 * Automatically collects HTTP request metrics for monitoring
 */

import { NextRequest, NextResponse } from 'next/server'
import { metricsCollector } from '@/lib/monitoring/prometheus'

interface MetricsConfig {
  collectHttpMetrics: boolean
  collectErrorMetrics: boolean
  collectPerformanceMetrics: boolean
  excludePaths: string[]
  includePaths?: string[]
}

const defaultConfig: MetricsConfig = {
  collectHttpMetrics: true,
  collectErrorMetrics: true,
  collectPerformanceMetrics: true,
  excludePaths: ['/metrics', '/health', '/_next', '/favicon.ico', '/robots.txt', '/sitemap.xml'],
}

/**
 * HTTP metrics collection middleware
 */
export function withMetrics(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config: Partial<MetricsConfig> = {}
) {
  const finalConfig = { ...defaultConfig, ...config }

  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now()
    const pathname = request.nextUrl.pathname
    const method = request.method

    // Check if this path should be excluded from metrics
    const shouldExclude = finalConfig.excludePaths.some((path) => pathname.startsWith(path))

    if (shouldExclude) {
      return handler(request)
    }

    // Check if this path should be included (if includePaths is specified)
    if (finalConfig.includePaths && finalConfig.includePaths.length > 0) {
      const shouldInclude = finalConfig.includePaths.some((path) => pathname.startsWith(path))
      if (!shouldInclude) {
        return handler(request)
      }
    }

    // Extract tenant ID from headers or session
    const tenantId =
      request.headers.get('x-tenant-id') ||
      request.cookies.get('tenant-id')?.value ||
      extractTenantFromPath(pathname)

    // Get request size
    const requestSize = getRequestSize(request)

    let response: NextResponse
    let error: Error | null = null

    try {
      // Execute the handler
      response = await handler(request)
    } catch (err) {
      error = err as Error

      // Create error response
      response = NextResponse.json({ error: 'Internal server error' }, { status: 500 })

      // Record error metrics
      if (finalConfig.collectErrorMetrics) {
        metricsCollector.recordError(
          error.name || 'UnknownError',
          'high',
          'api',
          tenantId || undefined
        )
      }
    }

    // Calculate metrics
    const duration = Date.now() - startTime
    const responseSize = getResponseSize(response)
    const statusCode = response.status

    // Normalize route for metrics (remove dynamic segments)
    const normalizedRoute = normalizeRoute(pathname)

    // Record HTTP metrics
    if (finalConfig.collectHttpMetrics) {
      metricsCollector.recordHttpRequest(
        method,
        normalizedRoute,
        statusCode,
        duration,
        requestSize,
        responseSize,
        tenantId || undefined
      )
    }

    // Record performance metrics for slow requests
    if (finalConfig.collectPerformanceMetrics && duration > 1000) {
      // > 1 second
    }

    // Add metrics headers for debugging (in development)
    if (process.env.NODE_ENV === 'development') {
      response.headers.set('X-Response-Time', `${duration}ms`)
      response.headers.set('X-Request-Size', `${requestSize}`)
      response.headers.set('X-Response-Size', `${responseSize}`)
      if (tenantId) {
        response.headers.set('X-Tenant-ID', tenantId)
      }
    }

    return response
  }
}

/**
 * Extract tenant ID from URL path
 */
function extractTenantFromPath(pathname: string): string | null {
  // Try to extract tenant from various path patterns
  const patterns = [
    /^\/api\/tenant\/([^\/]+)/, // /api/tenant/:id
    /^\/api\/([^\/]+)\/tenant/, // /api/:tenant/...
    /^\/tenant\/([^\/]+)/, // /tenant/:id
    /^\/([^\/]+)\/api/, // /:tenant/api/...
  ]

  for (const pattern of patterns) {
    const match = pathname.match(pattern)
    if (match) {
      return match[1]
    }
  }

  return null
}

/**
 * Get request body size
 */
function getRequestSize(request: NextRequest): number {
  const contentLength = request.headers.get('content-length')
  if (contentLength) {
    return parseInt(contentLength, 10)
  }

  // Estimate size from headers
  let headerSize = 0
  request.headers.forEach((value, key) => {
    headerSize += key.length + value.length + 4 // +4 for ": " and "\r\n"
  })

  return headerSize
}

/**
 * Get response body size
 */
function getResponseSize(response: NextResponse): number {
  const contentLength = response.headers.get('content-length')
  if (contentLength) {
    return parseInt(contentLength, 10)
  }

  // Estimate size from headers
  let headerSize = 0
  response.headers.forEach((value, key) => {
    headerSize += key.length + value.length + 4
  })

  return headerSize
}

/**
 * Normalize route for metrics (remove dynamic segments)
 */
function normalizeRoute(pathname: string): string {
  return (
    pathname
      // Replace UUIDs with :id
      .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, '/:id')
      // Replace numeric IDs with :id
      .replace(/\/\d+/g, '/:id')
      // Replace other dynamic segments
      .replace(/\/[^\/]+\.(jpg|jpeg|png|gif|webp|svg|ico|css|js|json|xml|txt)$/i, '/:file')
      // Truncate very long paths
      .substring(0, 100)
  )
}

/**
 * Custom metrics middleware for specific routes
 */
export class RouteMetricsCollector {
  private routeMetrics = new Map<
    string,
    {
      count: number
      totalDuration: number
      maxDuration: number
      minDuration: number
      errors: number
    }
  >()

  recordRoute(route: string, duration: number, success: boolean) {
    const existing = this.routeMetrics.get(route) || {
      count: 0,
      totalDuration: 0,
      maxDuration: 0,
      minDuration: Infinity,
      errors: 0,
    }

    existing.count++
    existing.totalDuration += duration
    existing.maxDuration = Math.max(existing.maxDuration, duration)
    existing.minDuration = Math.min(existing.minDuration, duration)

    if (!success) {
      existing.errors++
    }

    this.routeMetrics.set(route, existing)
  }

  getRouteMetrics(route: string) {
    const metrics = this.routeMetrics.get(route)
    if (!metrics) return null

    return {
      ...metrics,
      averageDuration: metrics.totalDuration / metrics.count,
      errorRate: metrics.errors / metrics.count,
      successRate: (metrics.count - metrics.errors) / metrics.count,
    }
  }

  getAllMetrics() {
    const result: Record<string, unknown> = {}

    for (const [route, metrics] of this.routeMetrics) {
      result[route] = {
        ...metrics,
        averageDuration: metrics.totalDuration / metrics.count,
        errorRate: metrics.errors / metrics.count,
        successRate: (metrics.count - metrics.errors) / metrics.count,
      }
    }

    return result
  }

  reset() {
    this.routeMetrics.clear()
  }
}

// Global route metrics collector
export const routeMetrics = new RouteMetricsCollector()

/**
 * Business metrics middleware for tracking feature usage
 */
export function withBusinessMetrics(
  handler: (req: NextRequest) => Promise<NextResponse>,
  feature: string
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now()

    try {
      const response = await handler(request)
      const duration = Date.now() - startTime

      // Extract user info from session/token
      const tenantId = request.headers.get('x-tenant-id')
      const userId = request.headers.get('x-user-id')

      // Record feature usage
      if (response.status >= 200 && response.status < 300) {
        metricsCollector.recordFeatureUsage(
          feature,
          request.method.toLowerCase(),
          tenantId || 'unknown',
          'user' // Default role, could be extracted from session
        )
      }

      return response
    } catch (error) {
      // Record feature error
      metricsCollector.recordError(
        `${feature}_error`,
        'medium',
        'business_logic',
        request.headers.get('x-tenant-id') || undefined
      )

      throw error
    }
  }
}

/**
 * Database metrics middleware
 */
export function withDatabaseMetrics<T>(
  operation: () => Promise<T>,
  queryInfo: {
    operation: string
    table: string
    tenantId?: string
  }
): Promise<T> {
  const startTime = Date.now()

  return operation()
    .then((result) => {
      const duration = Date.now() - startTime
      metricsCollector.recordDbQuery(
        queryInfo.operation,
        queryInfo.table,
        duration,
        true,
        queryInfo.tenantId
      )
      return result
    })
    .catch((error) => {
      const duration = Date.now() - startTime
      metricsCollector.recordDbQuery(
        queryInfo.operation,
        queryInfo.table,
        duration,
        false,
        queryInfo.tenantId
      )
      throw error
    })
}

/**
 * Cache metrics middleware
 */
export function withCacheMetrics<T>(
  operation: () => Promise<T>,
  cacheInfo: {
    operation: 'get' | 'set' | 'delete'
    cacheType: string
    keyPattern?: string
    tenantId?: string
  }
): Promise<T> {
  const startTime = Date.now()

  return operation()
    .then((result) => {
      const duration = Date.now() - startTime
      const hitOrMiss =
        cacheInfo.operation === 'get' ? (result ? 'hit' : 'miss') : cacheInfo.operation

      metricsCollector.recordCacheOperation(
        hitOrMiss as 'hit' | 'miss' | 'set' | 'delete',
        cacheInfo.cacheType,
        duration,
        cacheInfo.keyPattern,
        cacheInfo.tenantId
      )
      return result
    })
    .catch((error) => {
      const duration = Date.now() - startTime
      metricsCollector.recordCacheOperation(
        'miss', // Cache errors count as misses
        cacheInfo.cacheType,
        duration,
        cacheInfo.keyPattern,
        cacheInfo.tenantId
      )
      throw error
    })
}
