import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import PerformanceOrchestrator from '@/lib/performance/PerformanceOrchestrator'
import { z } from 'zod'

const metricsQuerySchema = z.object({
  tenantId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  metric: z.enum(['overview', 'database', 'cache', 'system']).optional(),
  includeAlerts: z.boolean().default(true),
  includeRecommendations: z.boolean().default(true),
  includeTrends: z.boolean().default(false)
})

const optimizeSchema = z.object({
  tenantId: z.string().optional(),
  categories: z.array(z.enum(['DATABASE', 'CACHE', 'CONNECTION_POOL', 'QUERY'])).optional(),
  autoApply: z.boolean().default(false)
})

// Global performance orchestrator
let orchestrator: PerformanceOrchestrator | null = null

function getOrchestrator(): PerformanceOrchestrator {
  if (!orchestrator) {
    orchestrator = new PerformanceOrchestrator({
      enableQueryOptimization: true,
      enableConnectionPooling: true,
      enableCaching: true,
      enableMetricsCollection: true,
      enableAutoScaling: true,
      enablePerformanceAlerts: true,
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD
      }
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
    const query = {
      tenantId: searchParams.get('tenantId') || session.user.tenantId,
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      metric: searchParams.get('metric'),
      includeAlerts: searchParams.get('includeAlerts') !== 'false',
      includeRecommendations: searchParams.get('includeRecommendations') !== 'false',
      includeTrends: searchParams.get('includeTrends') === 'true'
    }

    console.log('📊 Fetching performance analytics for tenant:', query.tenantId)

    const orchestrator = getOrchestrator()
    const analytics = await orchestrator.getPerformanceAnalytics(query.tenantId)

    // Build response based on requested data
    const response: any = {
      success: true,
      tenantId: query.tenantId,
      timestamp: new Date().toISOString()
    }

    // Always include basic metrics
    if (!query.metric || query.metric === 'overview') {
      response.overview = {
        ...analytics.metrics.overview,
        healthScore: calculateHealthScore(analytics.metrics),
        status: getSystemStatus(analytics.metrics),
        lastUpdated: new Date().toISOString()
      }
    }

    if (!query.metric || query.metric === 'database') {
      response.database = {
        ...analytics.metrics.database,
        performance: {
          status: analytics.metrics.database.avgQueryTime < 100 ? 'EXCELLENT' :
                  analytics.metrics.database.avgQueryTime < 500 ? 'GOOD' :
                  analytics.metrics.database.avgQueryTime < 1000 ? 'FAIR' : 'POOR',
          bottlenecks: identifyDatabaseBottlenecks(analytics.metrics.database),
          optimizations: getDatabaseOptimizations(analytics.metrics.database)
        }
      }
    }

    if (!query.metric || query.metric === 'cache') {
      response.cache = {
        ...analytics.metrics.cache,
        performance: {
          status: analytics.metrics.cache.hitRatio > 80 ? 'EXCELLENT' :
                  analytics.metrics.cache.hitRatio > 60 ? 'GOOD' :
                  analytics.metrics.cache.hitRatio > 40 ? 'FAIR' : 'POOR',
          efficiency: calculateCacheEfficiency(analytics.metrics.cache),
          recommendations: getCacheRecommendations(analytics.metrics.cache)
        }
      }
    }

    if (!query.metric || query.metric === 'system') {
      response.system = {
        ...analytics.metrics.system,
        health: {
          overall: getSystemHealthStatus(analytics.metrics.system),
          resources: {
            cpu: getResourceStatus(analytics.metrics.system.cpuUsage),
            memory: getResourceStatus(analytics.metrics.system.memoryUsage),
            disk: getResourceStatus(analytics.metrics.system.diskUsage),
            network: analytics.metrics.system.networkLatency < 50 ? 'GOOD' : 'DEGRADED'
          }
        }
      }
    }

    // Include alerts if requested
    if (query.includeAlerts) {
      response.alerts = {
        total: analytics.alerts.length,
        critical: analytics.alerts.filter(a => a.severity === 'CRITICAL').length,
        high: analytics.alerts.filter(a => a.severity === 'HIGH').length,
        medium: analytics.alerts.filter(a => a.severity === 'MEDIUM').length,
        recent: analytics.alerts.slice(0, 5).map(alert => ({
          id: alert.id,
          severity: alert.severity,
          type: alert.type,
          message: alert.message,
          timestamp: alert.timestamp,
          resolved: false
        }))
      }
    }

    // Include recommendations if requested
    if (query.includeRecommendations) {
      response.recommendations = {
        total: analytics.recommendations.length,
        high: analytics.recommendations.filter(r => r.priority === 'HIGH').length,
        automated: analytics.recommendations.filter(r => r.automated).length,
        top: analytics.recommendations.slice(0, 5).map(rec => ({
          id: rec.id,
          category: rec.category,
          priority: rec.priority,
          title: rec.title,
          expectedImpact: rec.expectedImpact,
          implementationEffort: rec.implementationEffort,
          automated: rec.automated
        }))
      }
    }

    // Include trends if requested
    if (query.includeTrends) {
      response.trends = {
        responseTime: analytics.trends.responseTime,
        throughput: analytics.trends.throughput,
        errorRate: analytics.trends.errorRate,
        analysis: {
          responseTimeTrend: analyzeTrend(analytics.trends.responseTime),
          throughputTrend: analyzeTrend(analytics.trends.throughput),
          errorRateTrend: analyzeTrend(analytics.trends.errorRate)
        }
      }
    }

    // Performance insights
    response.insights = {
      summary: generatePerformanceSummary(analytics.metrics),
      keyMetrics: {
        responseTime: {
          current: analytics.metrics.overview.averageResponseTime,
          target: 200,
          status: analytics.metrics.overview.averageResponseTime < 200 ? 'ON_TARGET' : 'NEEDS_IMPROVEMENT'
        },
        throughput: {
          current: analytics.metrics.overview.throughput,
          capacity: 1000,
          utilization: (analytics.metrics.overview.throughput / 1000) * 100
        },
        reliability: {
          uptime: 99.9,
          errorRate: analytics.metrics.overview.errorRate,
          target: 1.0
        }
      },
      recommendations: getTopRecommendations(analytics.recommendations)
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Failed to fetch performance analytics:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch performance analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
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
    const action = body.action

    const orchestrator = getOrchestrator()

    switch (action) {
      case 'optimize':
        const optimizeData = optimizeSchema.parse(body)
        console.log('🚀 Starting performance optimization...')
        
        const optimizationResult = await orchestrator.autoOptimize()
        
        return NextResponse.json({
          success: true,
          action: 'optimize',
          result: {
            optimizationsApplied: optimizationResult.optimizationsApplied,
            improvements: optimizationResult.improvements,
            summary: `Applied ${optimizationResult.optimizationsApplied} optimizations`,
            nextSteps: [
              'Monitor performance metrics over the next 15 minutes',
              'Review optimization impact in the analytics dashboard',
              'Consider implementing recommended manual optimizations'
            ]
          },
          timestamp: new Date().toISOString()
        })

      case 'warmup':
        const tenantId = body.tenantId || session.user.tenantId
        console.log(`🔥 Starting warmup for tenant: ${tenantId}`)
        
        await orchestrator.warmup(tenantId)
        
        return NextResponse.json({
          success: true,
          action: 'warmup',
          result: {
            message: `Performance systems warmed up for tenant ${tenantId}`,
            components: ['Cache', 'Connection Pools', 'Query Optimizer'],
            estimatedImprovementTime: '2-5 minutes'
          },
          timestamp: new Date().toISOString()
        })

      case 'export':
        const exportFormat = body.format || 'json'
        const exportData = await orchestrator.exportMetrics({
          tenantId: body.tenantId || session.user.tenantId,
          format: exportFormat
        })
        
        return NextResponse.json({
          success: true,
          action: 'export',
          result: {
            format: exportFormat,
            data: exportFormat === 'json' ? JSON.parse(exportData) : exportData,
            generatedAt: new Date().toISOString()
          }
        })

      case 'alert_test':
        // Test alert system
        await orchestrator.handleAlert({
          id: `test_${Date.now()}`,
          severity: 'MEDIUM',
          type: 'RESPONSE_TIME',
          message: 'Test alert from performance analytics API',
          metric: 'responseTime',
          currentValue: 150,
          threshold: 100,
          timestamp: new Date(),
          tenantId: session.user.tenantId
        })
        
        return NextResponse.json({
          success: true,
          action: 'alert_test',
          result: {
            message: 'Test alert generated successfully',
            alertId: `test_${Date.now()}`
          }
        })

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('❌ Failed to process performance action:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process performance action',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Helper functions
function calculateHealthScore(metrics: any): number {
  const responseTimeScore = metrics.overview.averageResponseTime < 200 ? 100 : 
                          metrics.overview.averageResponseTime < 500 ? 80 :
                          metrics.overview.averageResponseTime < 1000 ? 60 : 40

  const errorRateScore = metrics.overview.errorRate < 1 ? 100 :
                        metrics.overview.errorRate < 2 ? 80 :
                        metrics.overview.errorRate < 5 ? 60 : 40

  const cacheScore = metrics.cache.hitRatio > 80 ? 100 :
                    metrics.cache.hitRatio > 60 ? 80 :
                    metrics.cache.hitRatio > 40 ? 60 : 40

  const poolScore = metrics.database.poolUtilization < 70 ? 100 :
                   metrics.database.poolUtilization < 85 ? 80 :
                   metrics.database.poolUtilization < 95 ? 60 : 40

  return Math.round((responseTimeScore + errorRateScore + cacheScore + poolScore) / 4)
}

function getSystemStatus(metrics: any): string {
  const healthScore = calculateHealthScore(metrics)
  
  if (healthScore >= 90) return 'EXCELLENT'
  if (healthScore >= 75) return 'GOOD'
  if (healthScore >= 60) return 'FAIR'
  return 'POOR'
}

function identifyDatabaseBottlenecks(dbMetrics: any): string[] {
  const bottlenecks = []
  
  if (dbMetrics.avgQueryTime > 500) {
    bottlenecks.push('Slow query execution')
  }
  
  if (dbMetrics.poolUtilization > 85) {
    bottlenecks.push('High connection pool utilization')
  }
  
  if (dbMetrics.slowQueries > 10) {
    bottlenecks.push('Multiple slow queries detected')
  }
  
  return bottlenecks
}

function getDatabaseOptimizations(dbMetrics: any): string[] {
  const optimizations = []
  
  if (dbMetrics.avgQueryTime > 500) {
    optimizations.push('Add database indexes for frequently queried columns')
  }
  
  if (dbMetrics.poolUtilization > 85) {
    optimizations.push('Increase connection pool size')
  }
  
  if (dbMetrics.slowQueries > 10) {
    optimizations.push('Optimize slow query patterns')
  }
  
  return optimizations
}

function calculateCacheEfficiency(cacheMetrics: any): number {
  const hitRatioScore = cacheMetrics.hitRatio
  const evictionScore = cacheMetrics.evictions < 10 ? 100 : 
                       cacheMetrics.evictions < 50 ? 80 :
                       cacheMetrics.evictions < 100 ? 60 : 40
  
  return Math.round((hitRatioScore + evictionScore) / 2)
}

function getCacheRecommendations(cacheMetrics: any): string[] {
  const recommendations = []
  
  if (cacheMetrics.hitRatio < 70) {
    recommendations.push('Increase cache TTL for frequently accessed data')
  }
  
  if (cacheMetrics.evictions > 50) {
    recommendations.push('Increase cache memory allocation')
  }
  
  if (cacheMetrics.compressionRatio < 30) {
    recommendations.push('Enable compression for large cache entries')
  }
  
  return recommendations
}

function getSystemHealthStatus(systemMetrics: any): string {
  const avgUsage = (systemMetrics.cpuUsage + systemMetrics.memoryUsage + systemMetrics.diskUsage) / 3
  
  if (avgUsage < 50) return 'HEALTHY'
  if (avgUsage < 70) return 'GOOD'
  if (avgUsage < 85) return 'WARNING'
  return 'CRITICAL'
}

function getResourceStatus(usage: number): string {
  if (usage < 50) return 'OPTIMAL'
  if (usage < 70) return 'GOOD'
  if (usage < 85) return 'HIGH'
  return 'CRITICAL'
}

function analyzeTrend(trendData: Array<{ timestamp: Date; value: number }>): string {
  if (trendData.length < 2) return 'INSUFFICIENT_DATA'
  
  const first = trendData[0].value
  const last = trendData[trendData.length - 1].value
  const change = ((last - first) / first) * 100
  
  if (Math.abs(change) < 5) return 'STABLE'
  return change > 0 ? 'INCREASING' : 'DECREASING'
}

function generatePerformanceSummary(metrics: any): string {
  const healthScore = calculateHealthScore(metrics)
  const status = getSystemStatus(metrics)
  
  if (status === 'EXCELLENT') {
    return 'System is performing optimally with excellent response times and high reliability.'
  } else if (status === 'GOOD') {
    return 'System is performing well with minor optimization opportunities.'
  } else if (status === 'FAIR') {
    return 'System performance is acceptable but requires attention to prevent degradation.'
  } else {
    return 'System performance requires immediate attention to resolve critical issues.'
  }
}

function getTopRecommendations(recommendations: any[]): Array<{ title: string; impact: string; effort: string }> {
  return recommendations
    .filter(r => r.priority === 'HIGH')
    .slice(0, 3)
    .map(r => ({
      title: r.title,
      impact: r.expectedImpact,
      effort: r.implementationEffort
    }))
}