/**
 * CoreFlow360 - Metrics API Endpoint
 * Exposes Prometheus metrics and monitoring data
 */

import { NextRequest, NextResponse } from 'next/server'
import { metricsCollector } from '@/lib/monitoring/prometheus'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * GET /api/metrics
 * Returns Prometheus metrics in text format
 */
export async function GET(request: NextRequest) {
  try {
    // Security: Only allow metrics access from authorized sources
    const authHeader = request.headers.get('authorization')
    const monitoringToken = process.env.MONITORING_TOKEN
    
    // Check for monitoring token
    if (monitoringToken && authHeader === `Bearer ${monitoringToken}`) {
      // Authorized monitoring system
    }
    // Check for admin session
    else {
      const session = await getServerSession(authOptions)
      if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Unauthorized - Admin access required' },
          { status: 401 }
        )
      }
    }

    // Get metrics format from query params
    const url = new URL(request.url)
    const format = url.searchParams.get('format') || 'prometheus'
    const include = url.searchParams.get('include')?.split(',') || []
    const exclude = url.searchParams.get('exclude')?.split(',') || []

    if (format === 'json') {
      // Return metrics as JSON
      const metrics = await metricsCollector.getMetricsAsJson()
      
      // Filter metrics if requested
      let filteredMetrics = metrics
      
      if (include.length > 0) {
        filteredMetrics = metrics.filter(metric => 
          include.some(pattern => metric.name.includes(pattern))
        )
      }
      
      if (exclude.length > 0) {
        filteredMetrics = filteredMetrics.filter(metric => 
          !exclude.some(pattern => metric.name.includes(pattern))
        )
      }

      return NextResponse.json({
        timestamp: new Date().toISOString(),
        metrics: filteredMetrics,
        metadata: {
          total_metrics: metrics.length,
          filtered_metrics: filteredMetrics.length,
          node_version: process.version,
          uptime: process.uptime(),
          memory_usage: process.memoryUsage(),
          cpu_usage: process.cpuUsage()
        }
      })
    }

    // Return Prometheus format (default)
    const metricsText = await metricsCollector.getMetrics()
    
    return new NextResponse(metricsText, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })

  } catch (error) {
    console.error('Error retrieving metrics:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve metrics' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/metrics
 * Accept custom metrics from clients
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { metric, value, labels = {}, timestamp } = body

    // Validate required fields
    if (!metric || value === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: metric, value' },
        { status: 400 }
      )
    }

    // Add tenant context
    const tenantId = session.user.tenantId || 'unknown'
    const userId = session.user.id

    // Record custom metrics based on type
    switch (metric) {
      case 'user_action':
        metricsCollector.recordCustomAction(
          labels.action || 'unknown',
          labels.feature || 'unknown',
          tenantId,
          userId
        )
        break

      case 'performance_timing':
        if (labels.operation && typeof value === 'number') {
          metricsCollector.recordPerformanceTiming(
            labels.operation,
            labels.component || 'client',
            value,
            tenantId
          )
        }
        break

      case 'error_report':
        metricsCollector.recordError(
          labels.error_type || 'client_error',
          labels.severity || 'medium',
          labels.component || 'client',
          tenantId
        )
        break

      case 'feature_usage':
        metricsCollector.recordFeatureUsage(
          labels.feature || 'unknown',
          labels.action || 'use',
          tenantId,
          session.user.role || 'user'
        )
        break

      default:
        return NextResponse.json(
          { error: `Unknown metric type: ${metric}` },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      metric,
      recorded_at: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error recording custom metric:', error)
    return NextResponse.json(
      { error: 'Failed to record metric' },
      { status: 500 }
    )
  }
}

// Add custom metric recording methods to MetricsCollector
declare module '@/lib/monitoring/prometheus' {
  interface MetricsCollector {
    recordCustomAction(action: string, feature: string, tenantId: string, userId: string): void
    recordPerformanceTiming(operation: string, component: string, duration: number, tenantId: string): void
    recordFeatureUsage(feature: string, action: string, tenantId: string, userRole: string): void
  }
}

// Extend the metrics collector with custom methods
Object.assign(metricsCollector, {
  recordCustomAction(action: string, feature: string, tenantId: string, userId: string) {
    const { apiCallsTotal } = require('@/lib/monitoring/prometheus')
    apiCallsTotal.inc({
      feature: `${feature}_${action}`,
      tenant_id: tenantId,
      user_id: userId
    })
  },

  recordPerformanceTiming(operation: string, component: string, duration: number, tenantId: string) {
    const { httpRequestDuration } = require('@/lib/monitoring/prometheus')
    httpRequestDuration.observe({
      method: 'CLIENT',
      route: operation,
      status_code: '200',
      tenant_id: tenantId
    }, duration / 1000)
  },

  recordFeatureUsage(feature: string, action: string, tenantId: string, userRole: string) {
    const { featureUsage } = require('@/lib/monitoring/prometheus')
    featureUsage.inc({
      feature,
      action,
      tenant_id: tenantId,
      user_role: userRole
    })
  }
})