/**
 * CoreFlow360 - System Metrics Endpoint
 * Detailed system performance and health metrics
 */

import { NextRequest, NextResponse } from 'next/server'
import { performanceMetrics, realtimeMetrics } from '@/lib/cache/metrics-cache'
import { dbUtils } from '@/lib/db/client'
import { queueMonitor } from '@/lib/queue/client'
import { getRedisClient } from '@/lib/redis/client'

interface SystemMetrics {
  timestamp: string
  uptime: number
  performance: {
    api: {
      avgResponseTime: number
      requestsPerMinute: number
      errorRate: number
    }
    database: {
      avgQueryTime: number
      slowQueries: number
      connectionPool: any
    }
    cache: {
      hitRate: number
      totalHits: number
      totalMisses: number
    }
    memory: {
      used: number
      total: number
      percentage: number
      details: NodeJS.MemoryUsage
    }
    queues: {
      stats: any
      totalJobs: number
      failedJobs: number
    }
  }
  business: {
    activeUsers: number
    totalCustomers: number
    totalDeals: number
    monthlyRevenue: number
  }
  system: {
    nodeVersion: string
    platform: string
    cpuCount: number
    environment: string
  }
}

/**
 * GET /api/metrics/system
 * System-wide performance and health metrics
 */
export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()
    
    // Get performance summary
    const perfSummary = await performanceMetrics.getSummary(60) // Last hour
    
    // Get database connection pool stats
    const poolStats = await dbUtils.getPoolStats()
    
    // Get queue statistics
    const queueStats = await queueMonitor.getAllStats()
    const totalJobs = Object.values(queueStats).reduce(
      (sum: number, stats: any) => sum + (stats.completed || 0), 0
    )
    const failedJobs = Object.values(queueStats).reduce(
      (sum: number, stats: any) => sum + (stats.failed || 0), 0
    )
    
    // Memory usage
    const memoryUsage = process.memoryUsage()
    const memoryUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024)
    const memoryTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024)
    const memoryPercentage = (memoryUsedMB / memoryTotalMB) * 100
    
    // Business metrics (lightweight queries)
    let businessMetrics = {
      activeUsers: 0,
      totalCustomers: 0,
      totalDeals: 0,
      monthlyRevenue: 0
    }
    
    try {
      const { db } = await import('@/lib/db/client')
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const [
        activeUserCount,
        customerCount,
        dealCount,
        revenueResult
      ] = await Promise.all([
        db.user.count({
          where: {
            lastActiveAt: {
              gte: thirtyDaysAgo
            }
          }
        }),
        db.customer.count(),
        db.deal.count({
          where: {
            status: {
              in: ['open', 'negotiation', 'proposal']
            }
          }
        }),
        db.invoice.aggregate({
          where: {
            status: 'paid',
            createdAt: {
              gte: thirtyDaysAgo
            }
          },
          _sum: {
            amount: true
          }
        })
      ])
      
      businessMetrics = {
        activeUsers: activeUserCount,
        totalCustomers: customerCount,
        totalDeals: dealCount,
        monthlyRevenue: revenueResult._sum.amount || 0
      }
    } catch (error) {
      console.error('Failed to get business metrics:', error)
    }
    
    const metrics: SystemMetrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      performance: {
        api: {
          avgResponseTime: perfSummary.api.avgResponseTime,
          requestsPerMinute: perfSummary.api.requestsPerMinute,
          errorRate: perfSummary.api.errorRate
        },
        database: {
          avgQueryTime: perfSummary.database.avgQueryTime,
          slowQueries: perfSummary.database.slowQueries,
          connectionPool: poolStats
        },
        cache: {
          hitRate: perfSummary.cache.hitRate,
          totalHits: perfSummary.cache.totalHits,
          totalMisses: perfSummary.cache.totalMisses
        },
        memory: {
          used: memoryUsedMB,
          total: memoryTotalMB,
          percentage: memoryPercentage,
          details: memoryUsage
        },
        queues: {
          stats: queueStats,
          totalJobs,
          failedJobs
        }
      },
      business: businessMetrics,
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        cpuCount: require('os').cpus().length,
        environment: process.env.NODE_ENV || 'development'
      }
    }
    
    return NextResponse.json(metrics, {
      headers: {
        'Cache-Control': 'public, max-age=30', // Cache for 30 seconds
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('System metrics error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve system metrics',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/metrics/system?format=prometheus
 * Prometheus-compatible metrics export
 */
export async function GET_PROMETHEUS(request: NextRequest) {
  const format = request.nextUrl.searchParams.get('format')
  
  if (format !== 'prometheus') {
    return GET(request)
  }
  
  try {
    // Get metrics data
    const perfSummary = await performanceMetrics.getSummary(60)
    const memoryUsage = process.memoryUsage()
    const queueStats = await queueMonitor.getAllStats()
    
    // Format as Prometheus metrics
    const metrics = [
      // System metrics
      `# HELP coreflow360_uptime_seconds Process uptime in seconds`,
      `# TYPE coreflow360_uptime_seconds counter`,
      `coreflow360_uptime_seconds ${process.uptime()}`,
      '',
      
      // Memory metrics
      `# HELP coreflow360_memory_usage_bytes Memory usage in bytes`,
      `# TYPE coreflow360_memory_usage_bytes gauge`,
      `coreflow360_memory_usage_bytes{type="heap_used"} ${memoryUsage.heapUsed}`,
      `coreflow360_memory_usage_bytes{type="heap_total"} ${memoryUsage.heapTotal}`,
      `coreflow360_memory_usage_bytes{type="external"} ${memoryUsage.external}`,
      `coreflow360_memory_usage_bytes{type="rss"} ${memoryUsage.rss}`,
      '',
      
      // API metrics
      `# HELP coreflow360_api_response_time_seconds API response time in seconds`,
      `# TYPE coreflow360_api_response_time_seconds histogram`,
      `coreflow360_api_response_time_seconds ${perfSummary.api.avgResponseTime / 1000}`,
      '',
      
      `# HELP coreflow360_api_requests_per_minute API requests per minute`,
      `# TYPE coreflow360_api_requests_per_minute gauge`,
      `coreflow360_api_requests_per_minute ${perfSummary.api.requestsPerMinute}`,
      '',
      
      `# HELP coreflow360_api_error_rate API error rate percentage`,
      `# TYPE coreflow360_api_error_rate gauge`,
      `coreflow360_api_error_rate ${perfSummary.api.errorRate}`,
      '',
      
      // Database metrics
      `# HELP coreflow360_db_query_time_seconds Database query time in seconds`,
      `# TYPE coreflow360_db_query_time_seconds histogram`,
      `coreflow360_db_query_time_seconds ${perfSummary.database.avgQueryTime / 1000}`,
      '',
      
      // Cache metrics
      `# HELP coreflow360_cache_hit_rate Cache hit rate percentage`,
      `# TYPE coreflow360_cache_hit_rate gauge`,
      `coreflow360_cache_hit_rate ${perfSummary.cache.hitRate}`,
      '',
      
      // Queue metrics
      ...Object.entries(queueStats).flatMap(([queueName, stats]: [string, any]) => [
        `# HELP coreflow360_queue_jobs_total Total jobs in queue`,
        `# TYPE coreflow360_queue_jobs_total gauge`,
        `coreflow360_queue_jobs_total{queue="${queueName}",status="waiting"} ${stats.waiting || 0}`,
        `coreflow360_queue_jobs_total{queue="${queueName}",status="active"} ${stats.active || 0}`,
        `coreflow360_queue_jobs_total{queue="${queueName}",status="completed"} ${stats.completed || 0}`,
        `coreflow360_queue_jobs_total{queue="${queueName}",status="failed"} ${stats.failed || 0}`,
        ''
      ])
    ].join('\n')
    
    return new NextResponse(metrics, {
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    })
  } catch (error) {
    console.error('Prometheus metrics error:', error)
    
    return new NextResponse('# Error generating metrics\n', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain'
      }
    })
  }
}