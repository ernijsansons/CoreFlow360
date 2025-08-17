/**
 * CoreFlow360 - Lead Pipeline Monitoring & Analytics API
 * Real-time monitoring and analytics for the lead ingestion pipeline
 */

import { NextRequest, NextResponse } from 'next/server'
import { queueMonitor } from '@/lib/queues/lead-processor'
import { rateLimiter, callLimiter } from '@/lib/rate-limiting/lead-limiter'
import { LeadPipelineErrorHandler } from '@/lib/error-handling/lead-pipeline-errors'
import { db } from '@/lib/db'
import { Redis } from 'ioredis'

// Lazy Redis connection
let redis: Redis | null = null

function getRedis(): Redis | null {
  // Skip during build
  if (process.env.VERCEL || process.env.CI || process.env.NEXT_PHASE === 'phase-production-build' || process.env.VERCEL_ENV === 'preview') {
    return null
  }
  
  if (!redis) {
    redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      lazyConnect: true,
      enableOfflineQueue: false
    })
  }
  
  return redis
}

/**
 * GET /api/admin/lead-pipeline
 * Get comprehensive pipeline status and metrics
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const metric = url.searchParams.get('metric')
    const timeWindow = parseInt(url.searchParams.get('timeWindow') || '3600000') // 1 hour default
    const tenantId = url.searchParams.get('tenantId')

    // Route to specific metrics
    switch (metric) {
      case 'queue-status':
        return NextResponse.json(await getQueueStatus())
      
      case 'rate-limits':
        return NextResponse.json(await getRateLimitStatus(tenantId))
      
      case 'error-stats':
        return NextResponse.json(await getErrorStats(timeWindow))
      
      case 'lead-stats':
        return NextResponse.json(await getLeadStats(timeWindow, tenantId))
      
      case 'call-stats':
        return NextResponse.json(await getCallStats(timeWindow, tenantId))
      
      case 'system-health':
        return NextResponse.json(await getSystemHealth())
      
      default:
        return NextResponse.json(await getComprehensiveMetrics(timeWindow, tenantId))
    }
    
  } catch (error) {
    console.error('Pipeline monitoring error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pipeline metrics' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/lead-pipeline
 * Administrative actions for pipeline management
 */
export async function POST(request: NextRequest) {
  try {
    const { action, tenantId, ...params } = await request.json()

    switch (action) {
      case 'pause-queues':
        await queueMonitor.pauseQueues()
        return NextResponse.json({ success: true, message: 'Queues paused' })
      
      case 'resume-queues':
        await queueMonitor.resumeQueues()
        return NextResponse.json({ success: true, message: 'Queues resumed' })
      
      case 'cleanup-jobs':
        await queueMonitor.cleanupJobs()
        return NextResponse.json({ success: true, message: 'Jobs cleaned up' })
      
      case 'pause-tenant-calls':
        if (!tenantId) {
          return NextResponse.json({ error: 'tenantId required' }, { status: 400 })
        }
        await callLimiter.pauseCalling(tenantId, params.reason || 'Admin action', params.duration || 300)
        return NextResponse.json({ success: true, message: `Calling paused for tenant ${tenantId}` })
      
      case 'resume-tenant-calls':
        if (!tenantId) {
          return NextResponse.json({ error: 'tenantId required' }, { status: 400 })
        }
        await callLimiter.resumeCalling(tenantId)
        return NextResponse.json({ success: true, message: `Calling resumed for tenant ${tenantId}` })
      
      case 'emergency-mode':
        await rateLimiter.enableEmergencyMode(params.reason || 'Admin triggered', params.duration || 300)
        return NextResponse.json({ success: true, message: 'Emergency mode enabled' })
      
      case 'resolve-error':
        await LeadPipelineErrorHandler.resolveError(params.errorId, params.resolvedBy || 'admin')
        return NextResponse.json({ success: true, message: 'Error marked as resolved' })
      
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Pipeline admin action error:', error)
    return NextResponse.json(
      { error: 'Failed to execute admin action' },
      { status: 500 }
    )
  }
}

/**
 * Get queue status and performance metrics
 */
async function getQueueStatus() {
  const stats = await queueMonitor.getStats()
  
  return {
    queues: stats,
    performance: {
      throughput: await calculateThroughput(),
      avgProcessingTime: await getAverageProcessingTime(),
      successRate: await getQueueSuccessRate()
    },
    health: {
      redis: stats.redis.status,
      memoryUsage: stats.redis.memory
    }
  }
}

/**
 * Get rate limiting status for tenant or system
 */
async function getRateLimitStatus(tenantId?: string) {
  if (tenantId) {
    return {
      tenant: tenantId,
      limits: await rateLimiter.getStatus(tenantId),
      calling: await callLimiter.getStatus(tenantId),
      paused: await callLimiter.isCallingPaused(tenantId)
    }
  }
  
  // System-wide rate limit status
  const emergencyMode = await rateLimiter.isEmergencyMode()
  
  return {
    system: {
      emergencyMode,
      health: await rateLimiter.checkSystemLoad()
    }
  }
}

/**
 * Get error statistics and trends
 */
async function getErrorStats(timeWindow: number) {
  const stats = await LeadPipelineErrorHandler.getErrorStats(timeWindow)
  
  // Get recent critical errors
  const connection = getRedis()
  const escalations = connection ? await connection.lrange('escalation_queue', 0, 9) : [] // Last 10 escalations
  const recentEscalations = escalations.map(e => JSON.parse(e))
  
  return {
    ...stats,
    escalations: recentEscalations,
    trends: await getErrorTrends(timeWindow)
  }
}

/**
 * Get lead processing statistics
 */
async function getLeadStats(timeWindow: number, tenantId?: string) {
  const now = Date.now()
  const windowStart = new Date(now - timeWindow)
  
  const baseWhere = {
    createdAt: { gte: windowStart },
    ...(tenantId && { tenantId })
  }
  
  const [totalLeads, callsInitiated, successfulCalls] = await Promise.all([
    db.customer.count({ where: baseWhere }),
    db.callLog.count({ 
      where: {
        ...baseWhere,
        status: { not: 'FAILED' }
      }
    }),
    db.callLog.count({
      where: {
        ...baseWhere,
        status: 'COMPLETED',
        outcome: { in: ['QUALIFIED', 'APPOINTMENT'] }
      }
    })
  ])
  
  // Lead source breakdown
  const leadSources = await db.customer.groupBy({
    by: ['source'],
    where: baseWhere,
    _count: true
  })
  
  return {
    total: totalLeads,
    callsInitiated,
    successfulCalls,
    conversionRate: totalLeads > 0 ? (callsInitiated / totalLeads) * 100 : 0,
    successRate: callsInitiated > 0 ? (successfulCalls / callsInitiated) * 100 : 0,
    sources: leadSources.reduce((acc, source) => {
      acc[source.source || 'unknown'] = source._count
      return acc
    }, {} as Record<string, number>)
  }
}

/**
 * Get call performance statistics
 */
async function getCallStats(timeWindow: number, tenantId?: string) {
  const now = Date.now()
  const windowStart = new Date(now - timeWindow)
  
  const baseWhere = {
    startedAt: { gte: windowStart },
    ...(tenantId && { tenantId })
  }
  
  const [
    totalCalls,
    completedCalls,
    failedCalls,
    avgDuration,
    totalCost,
    callsByOutcome
  ] = await Promise.all([
    db.callLog.count({ where: baseWhere }),
    db.callLog.count({ where: { ...baseWhere, status: 'COMPLETED' } }),
    db.callLog.count({ where: { ...baseWhere, status: 'FAILED' } }),
    db.callLog.aggregate({
      where: { ...baseWhere, duration: { not: null } },
      _avg: { duration: true }
    }),
    db.callLog.aggregate({
      where: { ...baseWhere, cost: { not: null } },
      _sum: { cost: true }
    }),
    db.callLog.groupBy({
      by: ['outcome'],
      where: { ...baseWhere, outcome: { not: null } },
      _count: true
    })
  ])
  
  return {
    total: totalCalls,
    completed: completedCalls,
    failed: failedCalls,
    successRate: totalCalls > 0 ? ((totalCalls - failedCalls) / totalCalls) * 100 : 0,
    avgDuration: Math.round(avgDuration._avg.duration || 0),
    totalCost: totalCost._sum.cost || 0,
    avgCostPerCall: totalCalls > 0 ? (totalCost._sum.cost || 0) / totalCalls : 0,
    outcomes: callsByOutcome.reduce((acc, outcome) => {
      acc[outcome.outcome || 'unknown'] = outcome._count
      return acc
    }, {} as Record<string, number>)
  }
}

/**
 * Get overall system health
 */
async function getSystemHealth() {
  const [
    queueStats,
    redisHealth,
    dbHealth,
    errorRate
  ] = await Promise.all([
    queueMonitor.getStats(),
    checkRedisHealth(),
    checkDatabaseHealth(),
    calculateErrorRate()
  ])
  
  // Overall health score (0-100)
  const healthScore = calculateHealthScore({
    redis: redisHealth.healthy ? 100 : 0,
    database: dbHealth.healthy ? 100 : 0,
    queues: queueStats.leadQueue.failed < 10 ? 100 : Math.max(0, 100 - queueStats.leadQueue.failed),
    errorRate: Math.max(0, 100 - (errorRate * 100))
  })
  
  return {
    score: healthScore,
    status: healthScore >= 90 ? 'healthy' : healthScore >= 70 ? 'degraded' : 'unhealthy',
    components: {
      redis: redisHealth,
      database: dbHealth,
      queues: queueStats,
      errorRate
    },
    timestamp: new Date()
  }
}

/**
 * Get comprehensive metrics dashboard
 */
async function getComprehensiveMetrics(timeWindow: number, tenantId?: string) {
  const [
    queueStatus,
    rateLimits,
    errorStats,
    leadStats,
    callStats,
    systemHealth
  ] = await Promise.all([
    getQueueStatus(),
    getRateLimitStatus(tenantId),
    getErrorStats(timeWindow),
    getLeadStats(timeWindow, tenantId),
    getCallStats(timeWindow, tenantId),
    getSystemHealth()
  ])
  
  return {
    overview: {
      timeWindow,
      tenantId,
      timestamp: new Date(),
      health: systemHealth.status
    },
    queues: queueStatus,
    rateLimits,
    errors: errorStats,
    leads: leadStats,
    calls: callStats,
    system: systemHealth
  }
}

/**
 * Helper functions
 */
async function calculateThroughput(): Promise<number> {
  // Get processed jobs in last hour
  const connection = getRedis()
  const processed = connection ? await connection.get('metrics:jobs_processed:hour') || '0' : '0'
  return parseInt(processed)
}

async function getAverageProcessingTime(): Promise<number> {
  // Get average processing time from last 100 jobs
  const connection = getRedis()
  const times = connection ? await connection.lrange('metrics:processing_times', 0, 99) : []
  if (times.length === 0) return 0
  
  const avg = times.reduce((sum, time) => sum + parseInt(time), 0) / times.length
  return Math.round(avg)
}

async function getQueueSuccessRate(): Promise<number> {
  const connection = getRedis()
  const [successful, total] = await Promise.all([
    connection ? connection.get('metrics:successful_jobs:day') || '0' : Promise.resolve('0'),
    connection ? connection.get('metrics:total_jobs:day') || '0' : Promise.resolve('0')
  ])
  
  const successCount = parseInt(successful)
  const totalCount = parseInt(total)
  
  return totalCount > 0 ? (successCount / totalCount) * 100 : 100
}

async function getErrorTrends(timeWindow: number): Promise<any> {
  // Simple hourly error count trend
  const hours = Math.ceil(timeWindow / 3600000)
  const trends = []
  const connection = getRedis()
  
  for (let i = 0; i < Math.min(hours, 24); i++) {
    const hourKey = `error_count:${Date.now() - (i * 3600000)}`
    const count = connection ? await connection.get(hourKey) || '0' : '0'
    trends.unshift({ hour: i, errors: parseInt(count) })
  }
  
  return trends
}

async function checkRedisHealth(): Promise<{ healthy: boolean; latency?: number; memory?: number }> {
  try {
    const connection = getRedis()
    if (!connection) {
      return { healthy: false }
    }
    
    const start = Date.now()
    await connection.ping()
    const latency = Date.now() - start
    
    const memory = await connection.memory('usage')
    
    return {
      healthy: latency < 100, // Consider healthy if latency < 100ms
      latency,
      memory
    }
  } catch (error) {
    return { healthy: false }
  }
}

async function checkDatabaseHealth(): Promise<{ healthy: boolean; latency?: number }> {
  try {
    const start = Date.now()
    await db.$queryRaw`SELECT 1`
    const latency = Date.now() - start
    
    return {
      healthy: latency < 500, // Consider healthy if latency < 500ms
      latency
    }
  } catch (error) {
    return { healthy: false }
  }
}

async function calculateErrorRate(): Promise<number> {
  const connection = getRedis()
  const [errors, total] = await Promise.all([
    connection ? connection.get('metrics:errors:hour') || '0' : Promise.resolve('0'),
    connection ? connection.get('metrics:requests:hour') || '0' : Promise.resolve('0')
  ])
  
  const errorCount = parseInt(errors)
  const totalCount = parseInt(total)
  
  return totalCount > 0 ? errorCount / totalCount : 0
}

function calculateHealthScore(components: Record<string, number>): number {
  const weights = {
    redis: 0.3,
    database: 0.3,
    queues: 0.2,
    errorRate: 0.2
  }
  
  let score = 0
  for (const [component, value] of Object.entries(components)) {
    score += (value * (weights[component] || 0))
  }
  
  return Math.round(score)
}