2/**
 * CoreFlow360 - Health Check & Monitoring API
 * Production readiness and system health monitoring
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkDatabaseHealth } from '@/lib/db'
import { isConfigValid, getConfigErrors, getEnvironmentConfig } from '@/lib/config'
import { handleError, ErrorContext } from '@/lib/error-handler'
import { PerformanceMonitor } from '@/utils/performance'
import { gracefulShutdown } from '@/lib/server-config'

const perfMonitor = PerformanceMonitor.getInstance()

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'shutting_down'
  timestamp: string
  version: string
  environment: string
  uptime: number
  services: {
    database: { status: string; responseTime?: number; error?: string }
    redis: { status: string; responseTime?: number; error?: string }
    ai: { status: string; responseTime?: number; error?: string }
    configuration: { status: string; errors?: string[] }
  }
  performance: {
    memory: {
      used: number
      total: number
      percentage: number
    }
    cpu: {
      usage: number
    }
    requests: {
      total: number
      averageResponseTime: number
      errorRate: number
    }
  }
  features: {
    ai: boolean
    analytics: boolean
    auditLogging: boolean
  }
  metrics?: any
}

export async function GET(request: NextRequest): Promise<NextResponse<HealthCheck | { error: string }>> {
  const context: ErrorContext = {
    endpoint: '/api/health',
    method: 'GET',
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
    requestId: request.headers.get('x-request-id') || undefined
  }

  const startTime = Date.now()
  const endTimer = perfMonitor.startTimer('health_check')
  
  try {
    // Check if this is a detailed health check or basic liveness probe
    const detailed = request.nextUrl.searchParams.get('detailed') === 'true'
    const includeMetrics = request.nextUrl.searchParams.get('metrics') === 'true'

    // Check configuration
    const configValid = isConfigValid()
    const configErrors = getConfigErrors()
    const envConfig = getEnvironmentConfig()

    // Check if server is shutting down
    const isShuttingDown = gracefulShutdown.isShutdownInProgress()

    // Basic health response
    const health: HealthCheck = {
      status: isShuttingDown ? 'shutting_down' : 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '2.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      services: {
        database: { status: 'unknown' },
        redis: { status: 'unknown' },
        ai: { status: 'unknown' },
        configuration: { 
          status: configValid ? 'valid' : 'invalid',
          errors: configErrors.length > 0 ? configErrors : undefined
        }
      },
      performance: {
        memory: {
          used: 0,
          total: 0,
          percentage: 0
        },
        cpu: {
          usage: 0
        },
        requests: {
          total: 0,
          averageResponseTime: 0,
          errorRate: 0
        }
      },
      features: {
        ai: envConfig.features.ai,
        analytics: envConfig.features.analytics,
        auditLogging: envConfig.features.auditLogging
      }
    }

    // Database health check using new system
    const dbHealth = await checkDatabaseHealth()
    health.services.database = {
      status: dbHealth.status,
      responseTime: dbHealth.responseTime,
      error: dbHealth.status === 'unhealthy' ? dbHealth.message : undefined
    }

    // Redis health check (if configured)
    if (process.env.REDIS_URL) {
      try {
        const { redis } = await import('@/lib/redis')
        const redisStartTime = Date.now()
        const isHealthy = await redis.ping()
        const redisResponseTime = Date.now() - redisStartTime
        
        if (isHealthy) {
          health.services.redis = {
            status: 'healthy',
            responseTime: redisResponseTime
          }
        } else {
          health.services.redis = {
            status: 'unhealthy',
            error: 'Ping failed'
          }
          health.status = 'degraded'
        }
      } catch (error: any) {
        health.services.redis = {
          status: 'unhealthy',
          error: error.message
        }
        health.status = 'degraded'
      }
    } else {
      health.services.redis = { status: 'not_configured' }
    }

    // AI service health check
    try {
      // Basic check that AI services are accessible
      if (process.env.OPENAI_API_KEY) {
        health.services.ai = { status: 'configured' }
      } else {
        health.services.ai = { status: 'not_configured' }
      }
    } catch (error: any) {
      health.services.ai = {
        status: 'unhealthy',
        error: error.message
      }
      health.status = 'degraded'
    }

    // Performance metrics
    if (detailed) {
      const memUsage = process.memoryUsage()
      
      health.performance.memory = {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
      }

      // Get CPU usage (simplified)
      const cpuUsage = process.cpuUsage()
      health.performance.cpu = {
        usage: Math.round((cpuUsage.user + cpuUsage.system) / 1000) // Convert to ms
      }

      // Request metrics from performance monitor
      const requestStats = perfMonitor.getStats('api_request')
      if (requestStats) {
        health.performance.requests = {
          total: requestStats.count,
          averageResponseTime: Math.round(requestStats.mean),
          errorRate: 0 // Would be calculated from error metrics
        }
      }
    }

    // Include detailed metrics if requested
    if (includeMetrics) {
      health.metrics = perfMonitor.getAllStats()
      
      // Add Redis cache statistics if available
      if (process.env.REDIS_URL) {
        try {
          const { redis } = await import('@/lib/redis')
          const cacheStats = redis.getStats()
          health.metrics.cache = {
            ...cacheStats,
            hitRate: redis.getHitRate(),
            isAvailable: redis.isAvailable()
          }
        } catch (error) {
          health.metrics.cache = { error: 'Failed to get cache stats' }
        }
      }
    }

    // Determine overall health status
    const unhealthyServices = Object.values(health.services).filter(
      service => service.status === 'unhealthy'
    ).length

    if (unhealthyServices > 0) {
      health.status = unhealthyServices >= 2 ? 'unhealthy' : 'degraded'
    }

    // Memory usage critical check
    if (health.performance.memory.percentage > 90) {
      health.status = health.status === 'healthy' ? 'degraded' : 'unhealthy'
    }

    // Response time check
    const responseTime = Date.now() - startTime
    if (responseTime > 5000) { // 5 seconds
      health.status = health.status === 'healthy' ? 'degraded' : 'unhealthy'
    }

    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 
                      health.status === 'shutting_down' ? 503 : 503

    return NextResponse.json(health, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    })

  } catch (error: any) {
    return handleError(error, context)
  } finally {
    endTimer()
  }
}

// Readiness probe endpoint
export async function POST(request: NextRequest): Promise<NextResponse> {
  const context: ErrorContext = {
    endpoint: '/api/health',
    method: 'POST',
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
    requestId: request.headers.get('x-request-id') || undefined
  }

  try {
    // Check critical dependencies are ready
    const dbHealth = await checkDatabaseHealth()
    const configValid = isConfigValid()
    
    if (dbHealth.status === 'healthy' && configValid) {
      return NextResponse.json({ status: 'ready' }, { status: 200 })
    } else {
      return NextResponse.json({ 
        status: 'not ready',
        database: dbHealth.status,
        configuration: configValid ? 'valid' : 'invalid'
      }, { status: 503 })
    }
  } catch (error) {
    return handleError(error, context)
  }
}