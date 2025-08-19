/**
 * CoreFlow360 - Performance Monitoring Middleware
 * Tracks API response times and performance metrics
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

interface PerformanceMetrics {
  path: string
  method: string
  statusCode: number
  duration: number
  timestamp: number
  userAgent?: string
  ip?: string
}

// In-memory storage for recent metrics (last 1000 requests)
const recentMetrics: PerformanceMetrics[] = []
const MAX_METRICS = 1000

// Performance thresholds (in milliseconds)
const PERFORMANCE_THRESHOLDS = {
  FAST: 100,
  NORMAL: 300,
  SLOW: 1000,
  CRITICAL: 3000,
}

/**
 * Store performance metrics
 */
function storeMetric(metric: PerformanceMetrics) {
  recentMetrics.push(metric)

  // Keep only the last MAX_METRICS entries
  if (recentMetrics.length > MAX_METRICS) {
    recentMetrics.shift()
  }

  // Log slow requests
  if (metric.duration > PERFORMANCE_THRESHOLDS.SLOW) {
  }

  // Log critical performance issues
  if (metric.duration > PERFORMANCE_THRESHOLDS.CRITICAL) {
    console.error(
      `Critical performance issue: ${metric.method} ${metric.path} took ${metric.duration}ms`
    )
  }
}

/**
 * Get performance statistics
 */
export function getPerformanceStats() {
  if (recentMetrics.length === 0) {
    return {
      totalRequests: 0,
      averageResponseTime: 0,
      medianResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      slowRequests: 0,
      criticalRequests: 0,
      requestsByPath: {},
      requestsByStatus: {},
    }
  }

  const sortedByDuration = [...recentMetrics].sort((a, b) => a.duration - b.duration)
  const totalDuration = recentMetrics.reduce((sum, m) => sum + m.duration, 0)

  // Calculate percentiles
  const p95Index = Math.floor(sortedByDuration.length * 0.95)
  const p99Index = Math.floor(sortedByDuration.length * 0.99)
  const medianIndex = Math.floor(sortedByDuration.length / 2)

  // Count slow and critical requests
  const slowRequests = recentMetrics.filter((m) => m.duration > PERFORMANCE_THRESHOLDS.SLOW).length
  const criticalRequests = recentMetrics.filter(
    (m) => m.duration > PERFORMANCE_THRESHOLDS.CRITICAL
  ).length

  // Group by path
  const requestsByPath = recentMetrics.reduce(
    (acc, m) => {
      const key = `${m.method} ${m.path}`
      if (!acc[key]) {
        acc[key] = { count: 0, totalDuration: 0, avgDuration: 0 }
      }
      acc[key].count++
      acc[key].totalDuration += m.duration
      acc[key].avgDuration = acc[key].totalDuration / acc[key].count
      return acc
    },
    {} as Record<string, { count: number; totalDuration: number; avgDuration: number }>
  )

  // Group by status code
  const requestsByStatus = recentMetrics.reduce(
    (acc, m) => {
      const status = m.statusCode.toString()
      acc[status] = (acc[status] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return {
    totalRequests: recentMetrics.length,
    averageResponseTime: Math.round(totalDuration / recentMetrics.length),
    medianResponseTime: sortedByDuration[medianIndex]?.duration || 0,
    p95ResponseTime: sortedByDuration[p95Index]?.duration || 0,
    p99ResponseTime: sortedByDuration[p99Index]?.duration || 0,
    slowRequests,
    criticalRequests,
    requestsByPath,
    requestsByStatus,
  }
}

/**
 * Performance monitoring middleware
 */
export async function performanceMonitoring(
  request: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const startTime = Date.now()
  const path = request.nextUrl.pathname
  const method = request.method

  try {
    // Execute the handler
    const response = await handler()

    // Calculate duration
    const duration = Date.now() - startTime

    // Get additional request info
    const headersList = headers()
    const userAgent = headersList.get('user-agent') || undefined
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || undefined

    // Store metrics
    storeMetric({
      path,
      method,
      statusCode: response.status,
      duration,
      timestamp: Date.now(),
      userAgent,
      ip,
    })

    // Add performance headers to response
    const modifiedResponse = NextResponse.json(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    })

    modifiedResponse.headers.set('X-Response-Time', `${duration}ms`)
    modifiedResponse.headers.set('X-Performance-Category', getPerformanceCategory(duration))

    return modifiedResponse
  } catch (error) {
    // Still track performance for errors
    const duration = Date.now() - startTime

    storeMetric({
      path,
      method,
      statusCode: 500,
      duration,
      timestamp: Date.now(),
    })

    throw error
  }
}

/**
 * Get performance category based on response time
 */
function getPerformanceCategory(duration: number): string {
  if (duration <= PERFORMANCE_THRESHOLDS.FAST) return 'fast'
  if (duration <= PERFORMANCE_THRESHOLDS.NORMAL) return 'normal'
  if (duration <= PERFORMANCE_THRESHOLDS.SLOW) return 'slow'
  return 'critical'
}

/**
 * Clear performance metrics (useful for testing)
 */
export function clearPerformanceMetrics() {
  recentMetrics.length = 0
}
