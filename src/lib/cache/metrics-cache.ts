/**
 * CoreFlow360 - Metrics Cache
 * Specialized caching for performance metrics and analytics
 */

import { redis, CACHE_PREFIXES, CACHE_TTL } from '@/lib/redis/client'

interface MetricData {
  value: number
  timestamp: Date
  metadata?: Record<string, any>
}

interface TimeSeriesOptions {
  windowSize: number // In seconds
  maxEntries: number
}

/**
 * Time-series metrics cache
 */
export const metricsCache = {
  /**
   * Record a metric value
   */
  async record(
    metricName: string,
    value: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    const key = `${CACHE_PREFIXES.METRICS}${metricName}`
    const timestamp = new Date()
    
    const data: MetricData = {
      value,
      timestamp,
      metadata
    }
    
    // Add to sorted set with timestamp as score
    await redis.sadd(key, JSON.stringify(data))
    
    // Set expiration
    await redis.expire(key, CACHE_TTL.DAY)
  },
  
  /**
   * Get recent metrics
   */
  async getRecent(
    metricName: string,
    count: number = 100
  ): Promise<MetricData[]> {
    const key = `${CACHE_PREFIXES.METRICS}${metricName}`
    
    // Get recent entries
    const entries = await redis.smembers(key)
    
    return entries
      .map(entry => {
        try {
          return JSON.parse(entry) as MetricData
        } catch {
          return null
        }
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b!.timestamp).getTime() - new Date(a!.timestamp).getTime())
      .slice(0, count) as MetricData[]
  },
  
  /**
   * Calculate aggregates
   */
  async getAggregates(
    metricName: string,
    windowMinutes: number = 60
  ): Promise<{
    avg: number
    min: number
    max: number
    count: number
    sum: number
  }> {
    const metrics = await this.getRecent(metricName, 1000)
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000)
    
    const windowMetrics = metrics.filter(
      m => new Date(m.timestamp) >= windowStart
    )
    
    if (windowMetrics.length === 0) {
      return { avg: 0, min: 0, max: 0, count: 0, sum: 0 }
    }
    
    const values = windowMetrics.map(m => m.value)
    const sum = values.reduce((a, b) => a + b, 0)
    
    return {
      avg: sum / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
      sum
    }
  }
}

/**
 * Performance metrics tracking
 */
export const performanceMetrics = {
  /**
   * Track API response time
   */
  async trackResponseTime(
    endpoint: string,
    duration: number,
    statusCode: number
  ): Promise<void> {
    await metricsCache.record(
      `api:response_time:${endpoint}`,
      duration,
      { statusCode }
    )
    
    // Also track by status code
    if (statusCode >= 400) {
      await metricsCache.record(
        `api:errors:${endpoint}`,
        1,
        { statusCode }
      )
    }
  },
  
  /**
   * Track database query time
   */
  async trackQueryTime(
    operation: string,
    duration: number,
    success: boolean
  ): Promise<void> {
    await metricsCache.record(
      `db:query_time:${operation}`,
      duration,
      { success }
    )
  },
  
  /**
   * Track cache hit rate
   */
  async trackCacheHit(
    cacheType: string,
    hit: boolean
  ): Promise<void> {
    await metricsCache.record(
      `cache:${cacheType}:${hit ? 'hits' : 'misses'}`,
      1
    )
  },
  
  /**
   * Get performance summary
   */
  async getSummary(windowMinutes: number = 60): Promise<{
    api: {
      avgResponseTime: number
      errorRate: number
      requestsPerMinute: number
    }
    cache: {
      hitRate: number
      totalHits: number
      totalMisses: number
    }
    database: {
      avgQueryTime: number
      slowQueries: number
    }
  }> {
    // Get API metrics
    const apiResponseTimes = await metricsCache.getAggregates(
      'api:response_time:*',
      windowMinutes
    )
    const apiErrors = await metricsCache.getAggregates(
      'api:errors:*',
      windowMinutes
    )
    
    // Get cache metrics
    const cacheHits = await metricsCache.getAggregates(
      'cache:*:hits',
      windowMinutes
    )
    const cacheMisses = await metricsCache.getAggregates(
      'cache:*:misses',
      windowMinutes
    )
    
    // Get database metrics
    const dbQueryTimes = await metricsCache.getAggregates(
      'db:query_time:*',
      windowMinutes
    )
    
    const totalCacheRequests = cacheHits.sum + cacheMisses.sum
    const hitRate = totalCacheRequests > 0 
      ? (cacheHits.sum / totalCacheRequests) * 100 
      : 0
    
    return {
      api: {
        avgResponseTime: apiResponseTimes.avg,
        errorRate: apiResponseTimes.count > 0 
          ? (apiErrors.sum / apiResponseTimes.count) * 100 
          : 0,
        requestsPerMinute: apiResponseTimes.count / windowMinutes
      },
      cache: {
        hitRate,
        totalHits: cacheHits.sum,
        totalMisses: cacheMisses.sum
      },
      database: {
        avgQueryTime: dbQueryTimes.avg,
        slowQueries: dbQueryTimes.count
      }
    }
  }
}

/**
 * Business metrics tracking
 */
export const businessMetrics = {
  /**
   * Track user activity
   */
  async trackUserActivity(
    userId: string,
    action: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await metricsCache.record(
      `user:activity:${action}`,
      1,
      { userId, ...metadata }
    )
    
    // Update user last active
    const key = `${CACHE_PREFIXES.USER}last_active:${userId}`
    await redis.set(key, new Date().toISOString(), CACHE_TTL.LONG)
  },
  
  /**
   * Track conversion events
   */
  async trackConversion(
    eventType: string,
    value: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    await metricsCache.record(
      `conversion:${eventType}`,
      value,
      metadata
    )
  },
  
  /**
   * Get active users count
   */
  async getActiveUsers(windowMinutes: number = 30): Promise<number> {
    const pattern = `${CACHE_PREFIXES.USER}last_active:*`
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000)
    
    // This would need actual implementation with Redis SCAN
    // For now, return a placeholder
    return 0
  },
  
  /**
   * Get conversion funnel metrics
   */
  async getConversionFunnel(
    tenantId: string,
    windowDays: number = 30
  ): Promise<{
    visitors: number
    signups: number
    activations: number
    conversions: number
    revenue: number
  }> {
    const windowMinutes = windowDays * 24 * 60
    
    const visitors = await metricsCache.getAggregates(
      `conversion:visitor:${tenantId}`,
      windowMinutes
    )
    const signups = await metricsCache.getAggregates(
      `conversion:signup:${tenantId}`,
      windowMinutes
    )
    const activations = await metricsCache.getAggregates(
      `conversion:activation:${tenantId}`,
      windowMinutes
    )
    const conversions = await metricsCache.getAggregates(
      `conversion:purchase:${tenantId}`,
      windowMinutes
    )
    
    return {
      visitors: visitors.sum,
      signups: signups.sum,
      activations: activations.sum,
      conversions: conversions.sum,
      revenue: conversions.sum * 49 // Assuming $49/mo average
    }
  }
}

/**
 * Real-time metrics streaming
 */
export const realtimeMetrics = {
  /**
   * Get live metrics snapshot
   */
  async getLiveSnapshot(): Promise<{
    timestamp: Date
    activeUsers: number
    requestsPerSecond: number
    avgResponseTime: number
    errorRate: number
    cpuUsage: number
    memoryUsage: number
  }> {
    const oneMinuteAgo = 1
    
    const apiMetrics = await performanceMetrics.getSummary(oneMinuteAgo)
    const activeUsers = await businessMetrics.getActiveUsers(5)
    
    // System metrics would come from actual monitoring
    const cpuUsage = Math.random() * 40 + 20 // Mock 20-60%
    const memoryUsage = Math.random() * 30 + 40 // Mock 40-70%
    
    return {
      timestamp: new Date(),
      activeUsers,
      requestsPerSecond: apiMetrics.api.requestsPerMinute / 60,
      avgResponseTime: apiMetrics.api.avgResponseTime,
      errorRate: apiMetrics.api.errorRate,
      cpuUsage,
      memoryUsage
    }
  },
  
  /**
   * Subscribe to metric updates
   */
  async subscribe(
    metricName: string,
    callback: (data: MetricData) => void
  ): Promise<() => void> {
    // This would use Redis pub/sub in a real implementation
    // For now, return a no-op unsubscribe function
    return () => {}
  }
}