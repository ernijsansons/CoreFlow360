/**
 * CoreFlow360 - Analytics Queue Processor
 * Handles analytics and metrics processing
 */

import { Worker, Job } from 'bullmq'
import { prisma } from '@/lib/prisma'
import { businessMetrics, performanceMetrics } from '@/lib/cache/metrics-cache'
import { cacheInvalidation } from '@/lib/cache/query-cache'

export interface AnalyticsJobData {
  type: 'user_activity' | 'conversion' | 'performance' | 'aggregation'
  userId?: string
  tenantId?: string
  event: string
  data: Record<string, any>
  timestamp?: Date
}

/**
 * Process analytics job
 */
async function processAnalyticsJob(job: Job<AnalyticsJobData>) {
  const startTime = Date.now()
  
  try {
    console.log(`📊 Processing analytics job ${job.id}:`, job.data.type)
    
    switch (job.data.type) {
      case 'user_activity':
        await processUserActivity(job.data)
        break
        
      case 'conversion':
        await processConversionEvent(job.data)
        break
        
      case 'performance':
        await processPerformanceMetric(job.data)
        break
        
      case 'aggregation':
        await processAggregation(job.data)
        break
        
      default:
        throw new Error(`Unknown analytics job type: ${job.data.type}`)
    }
    
    const duration = Date.now() - startTime
    console.log(`✅ Analytics job ${job.id} completed in ${duration}ms`)
    
    return { success: true, duration }
  } catch (error) {
    console.error(`❌ Analytics job ${job.id} failed:`, error)
    throw error
  }
}

/**
 * Process user activity
 */
async function processUserActivity(data: AnalyticsJobData) {
  const { userId, event, data: eventData, timestamp = new Date() } = data
  
  if (!userId) throw new Error('User ID required for activity tracking')
  
  // Track in metrics cache
  await businessMetrics.trackUserActivity(userId, event, eventData)
  
  // Store in database
  await prisma.userActivity.create({
    data: {
      userId,
      event,
      metadata: eventData,
      timestamp
    }
  })
  
  // Update user stats
  await prisma.user.update({
    where: { id: userId },
    data: {
      lastActiveAt: timestamp
    }
  })
}

/**
 * Process conversion event
 */
async function processConversionEvent(data: AnalyticsJobData) {
  const { userId, tenantId, event, data: eventData } = data
  
  // Track in metrics
  await businessMetrics.trackConversion(
    event,
    eventData.value || 1,
    { userId, tenantId, ...eventData }
  )
  
  // Store conversion event
  await prisma.conversionEvent.create({
    data: {
      userId: userId!,
      tenantId,
      eventType: event,
      triggerType: eventData.triggerType,
      actionTaken: eventData.actionTaken,
      metadata: eventData
    }
  })
  
  // Update conversion funnel stats
  if (tenantId) {
    await updateConversionFunnel(tenantId, event, eventData)
  }
}

/**
 * Process performance metric
 */
async function processPerformanceMetric(data: AnalyticsJobData) {
  const { event, data: metricData } = data
  
  switch (event) {
    case 'api_response':
      await performanceMetrics.trackResponseTime(
        metricData.endpoint,
        metricData.duration,
        metricData.statusCode
      )
      break
      
    case 'db_query':
      await performanceMetrics.trackQueryTime(
        metricData.operation,
        metricData.duration,
        metricData.success
      )
      break
      
    case 'cache_operation':
      await performanceMetrics.trackCacheHit(
        metricData.cacheType,
        metricData.hit
      )
      break
  }
}

/**
 * Process aggregation job
 */
async function processAggregation(data: AnalyticsJobData) {
  const { tenantId, event } = data
  
  if (!tenantId) throw new Error('Tenant ID required for aggregation')
  
  switch (event) {
    case 'daily_metrics':
      await aggregateDailyMetrics(tenantId)
      break
      
    case 'user_engagement':
      await aggregateUserEngagement(tenantId)
      break
      
    case 'revenue_metrics':
      await aggregateRevenueMetrics(tenantId)
      break
  }
  
  // Invalidate related caches
  await cacheInvalidation.tenant(tenantId)
}

/**
 * Update conversion funnel
 */
async function updateConversionFunnel(
  tenantId: string,
  event: string,
  data: any
) {
  const funnelStage = getFunnelStage(event)
  if (!funnelStage) return
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  await prisma.conversionFunnel.upsert({
    where: {
      tenantId_date: {
        tenantId,
        date: today
      }
    },
    update: {
      [funnelStage]: {
        increment: 1
      },
      ...(data.value && funnelStage === 'conversions' ? {
        revenue: {
          increment: data.value
        }
      } : {})
    },
    create: {
      tenantId,
      date: today,
      [funnelStage]: 1,
      ...(data.value && funnelStage === 'conversions' ? {
        revenue: data.value
      } : {})
    }
  })
}

/**
 * Get funnel stage from event
 */
function getFunnelStage(event: string): string | null {
  const stageMap: Record<string, string> = {
    'page_view': 'visitors',
    'signup': 'signups',
    'activation': 'activations',
    'purchase': 'conversions',
    'upgrade': 'conversions'
  }
  
  return stageMap[event] || null
}

/**
 * Aggregate daily metrics
 */
async function aggregateDailyMetrics(tenantId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  // Get all metrics for yesterday
  const activities = await prisma.userActivity.findMany({
    where: {
      user: { tenantId },
      timestamp: {
        gte: yesterday,
        lt: today
      }
    }
  })
  
  // Calculate aggregates
  const activeUsers = new Set(activities.map(a => a.userId)).size
  const totalEvents = activities.length
  const eventTypes = activities.reduce((acc, a) => {
    acc[a.event] = (acc[a.event] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  // Store daily metrics
  await prisma.dailyMetrics.create({
    data: {
      tenantId,
      date: yesterday,
      activeUsers,
      totalEvents,
      eventBreakdown: eventTypes,
      calculatedAt: new Date()
    }
  })
}

/**
 * Aggregate user engagement
 */
async function aggregateUserEngagement(tenantId: string) {
  // Calculate engagement metrics like DAU, WAU, MAU
  const now = new Date()
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  const [dau, wau, mau] = await Promise.all([
    prisma.user.count({
      where: {
        tenantId,
        lastActiveAt: { gte: dayAgo }
      }
    }),
    prisma.user.count({
      where: {
        tenantId,
        lastActiveAt: { gte: weekAgo }
      }
    }),
    prisma.user.count({
      where: {
        tenantId,
        lastActiveAt: { gte: monthAgo }
      }
    })
  ])
  
  await prisma.engagementMetrics.create({
    data: {
      tenantId,
      dau,
      wau,
      mau,
      dauWauRatio: wau > 0 ? dau / wau : 0,
      wauMauRatio: mau > 0 ? wau / mau : 0,
      timestamp: now
    }
  })
}

/**
 * Aggregate revenue metrics
 */
async function aggregateRevenueMetrics(tenantId: string) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  const subscriptions = await prisma.subscription.findMany({
    where: {
      user: { tenantId },
      status: 'ACTIVE',
      createdAt: { gte: startOfMonth }
    }
  })
  
  const mrr = subscriptions.reduce((sum, sub) => sum + (sub.pricePerMonth || 0), 0)
  const newMrr = subscriptions
    .filter(sub => sub.createdAt >= startOfMonth)
    .reduce((sum, sub) => sum + (sub.pricePerMonth || 0), 0)
  
  await prisma.revenueMetrics.create({
    data: {
      tenantId,
      mrr,
      newMrr,
      churnedMrr: 0, // Would calculate from cancelled subs
      netMrr: newMrr,
      activeSubscriptions: subscriptions.length,
      month: startOfMonth
    }
  })
}

/**
 * Create analytics worker
 */
export function createAnalyticsWorker() {
  const worker = new Worker<AnalyticsJobData>(
    'analytics',
    processAnalyticsJob,
    {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_QUEUE_DB || '1')
      },
      concurrency: parseInt(process.env.ANALYTICS_WORKER_CONCURRENCY || '10')
    }
  )
  
  worker.on('completed', (job) => {
    console.log(`📊 Analytics job ${job.id} completed`)
  })
  
  worker.on('failed', (job, err) => {
    console.error(`📊 Analytics job ${job?.id} failed:`, err)
  })
  
  return worker
}

/**
 * Analytics job helpers
 */
export const analyticsJobs = {
  /**
   * Track user activity
   */
  async trackActivity(userId: string, event: string, data: any = {}) {
    const { addJob } = await import('../client')
    
    return addJob('ANALYTICS', 'user-activity', {
      type: 'user_activity',
      userId,
      event,
      data,
      timestamp: new Date()
    })
  },
  
  /**
   * Track conversion
   */
  async trackConversion(params: {
    userId: string
    tenantId?: string
    event: string
    value?: number
    data: any
  }) {
    const { addJob } = await import('../client')
    
    return addJob('ANALYTICS', 'conversion', {
      type: 'conversion',
      ...params
    })
  },
  
  /**
   * Track performance
   */
  async trackPerformance(event: string, data: any) {
    const { addJob } = await import('../client')
    
    return addJob('ANALYTICS', 'performance', {
      type: 'performance',
      event,
      data
    })
  },
  
  /**
   * Schedule aggregation
   */
  async scheduleAggregation(tenantId: string, aggregationType: string) {
    const { addJob } = await import('../client')
    
    return addJob('ANALYTICS', 'aggregation', {
      type: 'aggregation',
      tenantId,
      event: aggregationType,
      data: {}
    }, {
      delay: 60000, // Delay by 1 minute
      priority: 10
    })
  }
}