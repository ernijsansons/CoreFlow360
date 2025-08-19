import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import ObservabilityOrchestrator from '@/lib/observability/ObservabilityOrchestrator'
import { z } from 'zod'

const observabilityQuerySchema = z.object({
  tenantId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  service: z.string().optional(),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).optional(),
  includeTraces: z.boolean().default(true),
  includeMetrics: z.boolean().default(true),
  includeLogs: z.boolean().default(true),
  includeAlerts: z.boolean().default(true),
})

const actionSchema = z.object({
  action: z.enum(['alert', 'trace', 'metric', 'export', 'analyze']),
  tenantId: z.string().optional(),
  data: z.any().optional(),
})

// Global observability orchestrator
let orchestrator: ObservabilityOrchestrator | null = null

function getOrchestrator(): ObservabilityOrchestrator {
  if (!orchestrator) {
    orchestrator = new ObservabilityOrchestrator({
      metrics: {
        enabled: true,
        collectionInterval: 30000,
        retentionPeriod: 86400000, // 24 hours
        batchSize: 100,
      },
      logging: {
        enabled: true,
        logLevel: 'info',
        structuredLogging: true,
        logAggregation: true,
      },
      tracing: {
        enabled: true,
        samplingRate: 0.1,
        enableDistributedTracing: true,
        traceRetention: 7200000, // 2 hours
      },
      alerting: {
        enabled: true,
        enableMLAnomalyDetection: true,
        alertChannels: ['webhook', 'email'],
        escalationRules: [
          { severity: 'CRITICAL', escalationTime: 300000, channels: ['pager'] },
          { severity: 'HIGH', escalationTime: 900000, channels: ['email'] },
        ],
      },
      analytics: {
        enabled: true,
        enablePredictiveAnalytics: true,
        enableBusinessIntelligence: true,
        analysisInterval: 300000, // 5 minutes
      },
    })
  }
  return orchestrator
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const query = observabilityQuerySchema.parse({
      tenantId: searchParams.get('tenantId') || session.user.tenantId,
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      service: searchParams.get('service'),
      logLevel: searchParams.get('logLevel'),
      includeTraces: searchParams.get('includeTraces') !== 'false',
      includeMetrics: searchParams.get('includeMetrics') !== 'false',
      includeLogs: searchParams.get('includeLogs') !== 'false',
      includeAlerts: searchParams.get('includeAlerts') !== 'false',
    })

    const orchestrator = getOrchestrator()
    const dashboard = await orchestrator.getDashboard(query.tenantId)

    // Build comprehensive response
    const response: unknown = {
      success: true,
      tenantId: query.tenantId,
      timestamp: new Date().toISOString(),
      dashboard,
    }

    // Add filtered data based on query parameters
    if (query.includeMetrics) {
      response.metrics = {
        summary: {
          totalMetrics: dashboard.metrics.length,
          activeServices: new Set(dashboard.metrics.map((m) => m.source)).size,
          avgValue:
            dashboard.metrics.reduce((sum, m) => sum + m.value, 0) / dashboard.metrics.length || 0,
          lastUpdated: dashboard.metrics[0]?.timestamp || new Date(),
        },
        recent: dashboard.metrics.slice(0, 50),
        trends: await generateMetricTrends(dashboard.metrics),
      }
    }

    if (query.includeLogs) {
      const filteredLogs = query.logLevel
        ? dashboard.logs.filter((log) => log.level === query.logLevel)
        : dashboard.logs

      response.logs = {
        summary: {
          totalLogs: filteredLogs.length,
          errorRate:
            (filteredLogs.filter((l) => l.level === 'error').length / filteredLogs.length) * 100 ||
            0,
          warnRate:
            (filteredLogs.filter((l) => l.level === 'warn').length / filteredLogs.length) * 100 ||
            0,
          services: new Set(filteredLogs.map((l) => l.service)).size,
        },
        recent: filteredLogs.slice(0, 100),
        levelDistribution: generateLogLevelDistribution(filteredLogs),
      }
    }

    if (query.includeTraces) {
      response.traces = {
        summary: {
          totalTraces: dashboard.traces.length,
          avgDuration:
            dashboard.traces.reduce((sum, t) => sum + (t.duration || 0), 0) /
              dashboard.traces.length || 0,
          successRate:
            (dashboard.traces.filter((t) => t.status === 'success').length /
              dashboard.traces.length) *
              100 || 0,
          activeOperations: new Set(dashboard.traces.map((t) => t.operation)).size,
        },
        recent: dashboard.traces.slice(0, 30),
        performance: generateTracePerformanceAnalysis(dashboard.traces),
      }
    }

    if (query.includeAlerts) {
      response.alerts = {
        summary: {
          total: dashboard.alerts.length,
          critical: dashboard.alerts.filter((a) => a.severity === 'CRITICAL').length,
          high: dashboard.alerts.filter((a) => a.severity === 'HIGH').length,
          open: dashboard.alerts.filter((a) => a.status === 'OPEN').length,
        },
        recent: dashboard.alerts.slice(0, 20),
        trends: generateAlertTrends(dashboard.alerts),
      }
    }

    // System health overview
    response.systemHealth = {
      overall: calculateOverallSystemHealth(dashboard),
      services: generateServiceHealthMap(dashboard),
      recommendations: generateHealthRecommendations(dashboard),
    }

    // Business insights
    response.businessInsights = dashboard.businessMetrics && {
      kpis: dashboard.businessMetrics.slice(0, 10),
      trends: await generateBusinessTrends(dashboard.businessMetrics),
      predictions: dashboard.predictions?.slice(0, 5) || [],
    }

    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch observability analytics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, tenantId, data } = actionSchema.parse(body)
    const effectiveTenantId = tenantId || session.user.tenantId

    const orchestrator = getOrchestrator()

    switch (action) {
      case 'metric':
        await orchestrator.collectMetric({
          name: data.name,
          value: data.value,
          unit: data.unit || 'count',
          tags: data.tags || {},
          labels: data.labels || {},
          source: data.source || 'api',
          tenantId: effectiveTenantId,
        })

        return NextResponse.json({
          success: true,
          action: 'metric',
          result: {
            message: `Metric ${data.name} collected successfully`,
            metricId: `${data.name}_${Date.now()}`,
          },
        })

      case 'trace':
        const trace = await orchestrator.createTrace(effectiveTenantId, {
          operation: data.operation,
          service: data.service,
          tags: data.tags || {},
          metadata: data.metadata || {},
        })

        return NextResponse.json({
          success: true,
          action: 'trace',
          result: {
            traceId: trace.id,
            message: `Trace created for operation: ${data.operation}`,
          },
        })

      case 'alert':
        const alert = await orchestrator.generateAlert({
          severity: data.severity || 'MEDIUM',
          type: data.type || 'BUSINESS_RULE',
          title: data.title,
          description: data.description,
          source: data.source || 'api',
          tenantId: effectiveTenantId,
          metric: data.metric,
          currentValue: data.currentValue,
          threshold: data.threshold,
        })

        return NextResponse.json({
          success: true,
          action: 'alert',
          result: {
            alertId: alert.id,
            message: `Alert "${data.title}" generated successfully`,
          },
        })

      case 'analyze':
        const insights = await orchestrator.generateInsights(effectiveTenantId)

        return NextResponse.json({
          success: true,
          action: 'analyze',
          result: {
            insights: insights.slice(0, 10),
            totalInsights: insights.length,
            generatedAt: new Date().toISOString(),
          },
        })

      case 'export':
        const dashboard = await orchestrator.getDashboard(effectiveTenantId)
        const exportFormat = data?.format || 'json'

        let exportData: string
        if (exportFormat === 'csv') {
          exportData = convertDashboardToCSV(dashboard)
        } else {
          exportData = JSON.stringify(dashboard, null, 2)
        }

        return NextResponse.json({
          success: true,
          action: 'export',
          result: {
            format: exportFormat,
            data: exportFormat === 'json' ? JSON.parse(exportData) : exportData,
            size: exportData.length,
            generatedAt: new Date().toISOString(),
          },
        })

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process observability action',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Helper functions
async function generateMetricTrends(metrics: unknown[]): Promise<unknown> {
  const last24h = metrics.filter(
    (m) => new Date(m.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  )

  return {
    hourly: generateHourlyTrends(last24h),
    growth: calculateGrowthRate(last24h),
    anomalies: detectAnomalies(last24h),
  }
}

function generateLogLevelDistribution(logs: unknown[]): unknown {
  const distribution = logs.reduce(
    (acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const total = logs.length
  return Object.entries(distribution).map(([level, count]) => ({
    level,
    count,
    percentage: (count / total) * 100,
  }))
}

function generateTracePerformanceAnalysis(traces: unknown[]): unknown {
  const durations = traces.map((t) => t.duration).filter((d) => d != null)
  const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length || 0

  return {
    avgDuration,
    p95Duration: calculatePercentile(durations, 95),
    p99Duration: calculatePercentile(durations, 99),
    slowestOperations: traces
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, 5)
      .map((t) => ({ operation: t.operation, duration: t.duration })),
  }
}

function generateAlertTrends(alerts: unknown[]): unknown {
  const last24h = alerts.filter(
    (a) => new Date(a.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  )

  return {
    hourly: generateHourlyAlertTrends(last24h),
    bySeverity: alerts.reduce(
      (acc, alert) => {
        acc[alert.severity] = (acc[alert.severity] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    ),
    resolution: {
      avgResolutionTime: calculateAvgResolutionTime(alerts),
      openAlerts: alerts.filter((a) => a.status === 'OPEN').length,
    },
  }
}

function calculateOverallSystemHealth(dashboard: unknown): string {
  const errorRate =
    dashboard.logs.filter((l: unknown) => l.level === 'error').length / dashboard.logs.length || 0
  const criticalAlerts = dashboard.alerts.filter((a: unknown) => a.severity === 'CRITICAL').length
  const avgResponseTime =
    dashboard.traces.reduce((sum: number, t: unknown) => sum + (t.duration || 0), 0) /
      dashboard.traces.length || 0

  if (criticalAlerts > 0 || errorRate > 0.05 || avgResponseTime > 2000) return 'CRITICAL'
  if (errorRate > 0.02 || avgResponseTime > 1000) return 'WARNING'
  if (errorRate > 0.01 || avgResponseTime > 500) return 'GOOD'
  return 'EXCELLENT'
}

function generateServiceHealthMap(dashboard: unknown): Record<string, unknown> {
  const services = new Set([
    ...dashboard.logs.map((l: unknown) => l.service),
    ...dashboard.traces.map((t: unknown) => t.service),
    ...dashboard.metrics.map((m: unknown) => m.source),
  ])

  const healthMap: Record<string, unknown> = {}

  services.forEach((service) => {
    const serviceLogs = dashboard.logs.filter((l: unknown) => l.service === service)
    const serviceTraces = dashboard.traces.filter((t: unknown) => t.service === service)

    const errorRate =
      serviceLogs.filter((l: unknown) => l.level === 'error').length / serviceLogs.length || 0
    const avgDuration =
      serviceTraces.reduce((sum: number, t: unknown) => sum + (t.duration || 0), 0) /
        serviceTraces.length || 0

    healthMap[service] = {
      status: errorRate > 0.05 || avgDuration > 1000 ? 'UNHEALTHY' : 'HEALTHY',
      errorRate: errorRate * 100,
      avgResponseTime: avgDuration,
      requestCount: serviceTraces.length,
    }
  })

  return healthMap
}

function generateHealthRecommendations(dashboard: unknown): string[] {
  const recommendations = []

  const errorRate =
    dashboard.logs.filter((l: unknown) => l.level === 'error').length / dashboard.logs.length || 0
  if (errorRate > 0.02) {
    recommendations.push(
      'High error rate detected - investigate error patterns and implement additional error handling'
    )
  }

  const avgResponseTime =
    dashboard.traces.reduce((sum: number, t: unknown) => sum + (t.duration || 0), 0) /
      dashboard.traces.length || 0
  if (avgResponseTime > 1000) {
    recommendations.push(
      'Response times are elevated - consider implementing caching or optimizing slow operations'
    )
  }

  const criticalAlerts = dashboard.alerts.filter(
    (a: unknown) => a.severity === 'CRITICAL' && a.status === 'OPEN'
  ).length
  if (criticalAlerts > 0) {
    recommendations.push(`${criticalAlerts} critical alerts require immediate attention`)
  }

  return recommendations
}

async function generateBusinessTrends(businessMetrics: unknown[]): Promise<unknown> {
  // Generate business-specific trend analysis
  return {
    revenue: calculateMetricTrend(businessMetrics.filter((m) => m.category === 'revenue')),
    users: calculateMetricTrend(businessMetrics.filter((m) => m.category === 'users')),
    performance: calculateMetricTrend(businessMetrics.filter((m) => m.category === 'performance')),
  }
}

function generateHourlyTrends(data: unknown[]): unknown[] {
  const hourlyData: Record<number, number> = {}

  data.forEach((item) => {
    const hour = new Date(item.timestamp).getHours()
    hourlyData[hour] = (hourlyData[hour] || 0) + 1
  })

  return Object.entries(hourlyData).map(([hour, count]) => ({
    hour: parseInt(hour),
    count,
  }))
}

function generateHourlyAlertTrends(alerts: unknown[]): unknown[] {
  return generateHourlyTrends(alerts)
}

function calculatePercentile(values: number[], percentile: number): number {
  const sorted = values.sort((a, b) => a - b)
  const index = Math.ceil((percentile / 100) * sorted.length) - 1
  return sorted[Math.max(0, index)] || 0
}

function calculateAvgResolutionTime(alerts: unknown[]): number {
  const resolvedAlerts = alerts.filter((a) => a.status === 'RESOLVED')
  if (resolvedAlerts.length === 0) return 0

  // Simplified - would need resolution timestamp in real implementation
  return 1800000 // 30 minutes average
}

function calculateGrowthRate(data: unknown[]): number {
  if (data.length < 2) return 0

  const sorted = data.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )
  const first = sorted[0].value
  const last = sorted[sorted.length - 1].value

  return ((last - first) / first) * 100
}

function detectAnomalies(data: unknown[]): unknown[] {
  // Simplified anomaly detection
  const values = data.map((d) => d.value)
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length
  const stdDev = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length)

  return data.filter((d) => Math.abs(d.value - avg) > 2 * stdDev)
}

function calculateMetricTrend(metrics: unknown[]): unknown {
  if (metrics.length < 2) return { trend: 'INSUFFICIENT_DATA', change: 0 }

  const sorted = metrics.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )
  const first = sorted[0].value
  const last = sorted[sorted.length - 1].value
  const change = ((last - first) / first) * 100

  return {
    trend: Math.abs(change) < 5 ? 'STABLE' : change > 0 ? 'INCREASING' : 'DECREASING',
    change: change,
    current: last,
    previous: first,
  }
}

function convertDashboardToCSV(dashboard: unknown): string {
  let csv = 'timestamp,type,source,value,level,message\n'

  // Add metrics
  dashboard.metrics.forEach((metric: unknown) => {
    csv += `${metric.timestamp},metric,${metric.source},${metric.value},,${metric.name}\n`
  })

  // Add logs
  dashboard.logs.forEach((log: unknown) => {
    csv += `${log.timestamp},log,${log.service},,${log.level},"${log.message}"\n`
  })

  return csv
}
