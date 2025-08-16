/**
 * CoreFlow360 - Smart Cache System with Stale-While-Revalidate
 * Intelligent caching for sub-100ms dashboard response times
 */

import { redis } from './unified-redis'
import { z } from 'zod'

// Cache configuration schema
export const CacheConfigSchema = z.object({
  ttl: z.number(), // Time to live in seconds
  staleTtl: z.number(), // Stale time to live in seconds
  revalidateOnStale: z.boolean().default(true),
  backgroundRefresh: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  compression: z.boolean().default(false),
  namespace: z.string().optional()
})

export type CacheConfig = z.infer<typeof CacheConfigSchema>

export interface CachedData<T> {
  data: T
  cachedAt: Date
  expiresAt: Date
  isStale: boolean
  tags: string[]
  version: string
}

export interface CacheMetrics {
  hits: number
  misses: number
  staleHits: number
  refreshes: number
  errors: number
  averageResponseTime: number
  hitRate: number
  staleness: number
}

// Tiered cache durations based on data criticality
export const CACHE_TTL = {
  CRITICAL_METRICS: 30,      // Revenue, active deals (30s)
  PERFORMANCE_DATA: 60,      // Response times, uptime (1min)
  ACTIVITY_FEED: 120,        // Recent activities (2min)
  ANALYTICS: 300,            // Trends, reports (5min)
  USER_PREFERENCES: 1800,    // Layout, settings (30min)
  STATIC_DATA: 3600,         // Configuration, metadata (1hr)
  HEAVY_COMPUTATION: 7200    // Complex calculations (2hr)
} as const

export class SmartCache {
  private refreshQueue: Map<string, Promise<any>> = new Map()
  private metrics: Map<string, CacheMetrics> = new Map()
  private namespace: string

  constructor(namespace: string = 'smart_cache') {
    this.namespace = namespace
  }

  /**
   * Get data with stale-while-revalidate pattern
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    config: Partial<CacheConfig> = {}
  ): Promise<CachedData<T>> {
    const startTime = Date.now()
    const cacheKey = this.buildKey(key, config.namespace)
    const configWithDefaults = this.getDefaultConfig(config)

    try {
      // Try to get from cache
      const cached = await this.getCachedData<T>(cacheKey)
      
      if (cached) {
        const now = new Date()
        const isStale = now > cached.expiresAt
        const isExpired = now.getTime() - cached.expiresAt.getTime() > configWithDefaults.staleTtl * 1000

        // Update metrics
        this.updateMetrics(cacheKey, isStale ? 'stale_hit' : 'hit', Date.now() - startTime)

        if (!isExpired) {
          // Data is still valid (even if stale)
          if (isStale && configWithDefaults.revalidateOnStale) {
            // Start background refresh
            this.backgroundRefresh(cacheKey, fetcher, configWithDefaults)
          }
          
          return {
            ...cached,
            isStale
          }
        }
      }

      // Cache miss or expired - fetch fresh data
      this.updateMetrics(cacheKey, 'miss', Date.now() - startTime)
      
      const freshData = await this.fetchWithDeduplication(cacheKey, fetcher)
      
      // Store in cache
      await this.setData(cacheKey, freshData, configWithDefaults)
      
      return {
        data: freshData,
        cachedAt: new Date(),
        expiresAt: new Date(Date.now() + configWithDefaults.ttl * 1000),
        isStale: false,
        tags: configWithDefaults.tags,
        version: '1.0'
      }

    } catch (error) {
      this.updateMetrics(cacheKey, 'error', Date.now() - startTime)
      console.error('Smart cache error:', error)
      
      // Try to return stale data if available
      const staleData = await this.getCachedData<T>(cacheKey)
      if (staleData) {
        return {
          ...staleData,
          isStale: true
        }
      }
      
      throw error
    }
  }

  /**
   * Set data in cache with configuration
   */
  async set<T>(
    key: string,
    data: T,
    config: Partial<CacheConfig> = {}
  ): Promise<void> {
    const cacheKey = this.buildKey(key, config.namespace)
    const configWithDefaults = this.getDefaultConfig(config)
    
    await this.setData(cacheKey, data, configWithDefaults)
  }

  /**
   * Invalidate cache by key or tags
   */
  async invalidate(keyOrPattern: string, byTags: boolean = false): Promise<number> {
    if (byTags) {
      return await this.invalidateByTags([keyOrPattern])
    } else {
      const cacheKey = this.buildKey(keyOrPattern)
      await redis.del(cacheKey)
      await redis.del(`${cacheKey}:meta`)
      return 1
    }
  }

  /**
   * Invalidate cache by multiple tags
   */
  async invalidateByTags(tags: string[]): Promise<number> {
    let invalidatedCount = 0
    
    for (const tag of tags) {
      const tagKey = `${this.namespace}:tag:${tag}`
      const members = await redis.smembers(tagKey)
      
      if (members.length > 0) {
        // Delete all cache entries with this tag
        const pipeline = redis.pipeline()
        
        for (const member of members) {
          pipeline.del(member)
          pipeline.del(`${member}:meta`)
        }
        
        // Remove the tag set
        pipeline.del(tagKey)
        
        await pipeline.exec()
        invalidatedCount += members.length
      }
    }
    
    return invalidatedCount
  }

  /**
   * Warm cache for multiple keys
   */
  async warm<T>(
    entries: Array<{
      key: string
      fetcher: () => Promise<T>
      config?: Partial<CacheConfig>
    }>
  ): Promise<void> {
    const promises = entries.map(async ({ key, fetcher, config }) => {
      try {
        await this.get(key, fetcher, config)
      } catch (error) {
        console.error(`Cache warming failed for key ${key}:`, error)
      }
    })
    
    await Promise.all(promises)
  }

  /**
   * Get cache metrics
   */
  getMetrics(key?: string): CacheMetrics | Map<string, CacheMetrics> {
    if (key) {
      return this.metrics.get(this.buildKey(key)) || this.getEmptyMetrics()
    }
    return this.metrics
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.clear()
  }

  /**
   * Get cache status for debugging
   */
  async getStatus(): Promise<{
    namespace: string
    totalKeys: number
    refreshQueueSize: number
    metrics: Map<string, CacheMetrics>
    memoryUsage: any
  }> {
    const pattern = `${this.namespace}:*`
    const keys = await redis.keys(pattern)
    
    return {
      namespace: this.namespace,
      totalKeys: keys.length,
      refreshQueueSize: this.refreshQueue.size,
      metrics: this.metrics,
      memoryUsage: process.memoryUsage()
    }
  }

  /**
   * Private helper methods
   */
  private buildKey(key: string, namespace?: string): string {
    const ns = namespace || this.namespace
    return `${ns}:${key}`
  }

  private getDefaultConfig(config: Partial<CacheConfig>): CacheConfig {
    return {
      ttl: config.ttl || CACHE_TTL.ANALYTICS,
      staleTtl: config.staleTtl || (config.ttl || CACHE_TTL.ANALYTICS) * 2,
      revalidateOnStale: config.revalidateOnStale ?? true,
      backgroundRefresh: config.backgroundRefresh ?? true,
      tags: config.tags || [],
      priority: config.priority || 'medium',
      compression: config.compression || false,
      namespace: config.namespace
    }
  }

  private async getCachedData<T>(cacheKey: string): Promise<CachedData<T> | null> {
    const [dataStr, metaStr] = await Promise.all([
      redis.get(cacheKey),
      redis.get(`${cacheKey}:meta`)
    ])

    if (!dataStr || !metaStr) {
      return null
    }

    try {
      const data = JSON.parse(dataStr)
      const meta = JSON.parse(metaStr)
      
      return {
        data,
        cachedAt: new Date(meta.cachedAt),
        expiresAt: new Date(meta.expiresAt),
        isStale: false, // Will be calculated by caller
        tags: meta.tags || [],
        version: meta.version || '1.0'
      }
    } catch (error) {
      console.error('Failed to parse cached data:', error)
      return null
    }
  }

  private async setData<T>(
    cacheKey: string,
    data: T,
    config: CacheConfig
  ): Promise<void> {
    const now = new Date()
    const expiresAt = new Date(now.getTime() + config.ttl * 1000)
    const staleExpiresAt = new Date(now.getTime() + config.staleTtl * 1000)

    const meta = {
      cachedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      tags: config.tags,
      version: '1.0',
      priority: config.priority
    }

    const pipeline = redis.pipeline()
    
    // Store data and metadata
    pipeline.setex(cacheKey, config.staleTtl, JSON.stringify(data))
    pipeline.setex(`${cacheKey}:meta`, config.staleTtl, JSON.stringify(meta))
    
    // Add to tag sets for invalidation
    for (const tag of config.tags) {
      const tagKey = `${this.namespace}:tag:${tag}`
      pipeline.sadd(tagKey, cacheKey)
      pipeline.expire(tagKey, config.staleTtl)
    }
    
    await pipeline.exec()
  }

  private async fetchWithDeduplication<T>(
    cacheKey: string,
    fetcher: () => Promise<T>
  ): Promise<T> {
    // Check if fetch is already in progress
    const existingPromise = this.refreshQueue.get(cacheKey)
    if (existingPromise) {
      return existingPromise
    }

    // Start new fetch
    const fetchPromise = fetcher()
    this.refreshQueue.set(cacheKey, fetchPromise)

    try {
      const result = await fetchPromise
      return result
    } finally {
      this.refreshQueue.delete(cacheKey)
    }
  }

  private async backgroundRefresh<T>(
    cacheKey: string,
    fetcher: () => Promise<T>,
    config: CacheConfig
  ): Promise<void> {
    // Don't start background refresh if one is already running
    if (this.refreshQueue.has(cacheKey)) {
      return
    }

    // Start background refresh
    setTimeout(async () => {
      try {
        this.updateMetrics(cacheKey, 'refresh', 0)
        const freshData = await this.fetchWithDeduplication(cacheKey, fetcher)
        await this.setData(cacheKey, freshData, config)
      } catch (error) {
        console.error('Background refresh failed:', error)
        this.updateMetrics(cacheKey, 'error', 0)
      }
    }, 0) // Next tick
  }

  private updateMetrics(
    key: string,
    event: 'hit' | 'miss' | 'stale_hit' | 'refresh' | 'error',
    responseTime: number
  ): void {
    const metrics = this.metrics.get(key) || this.getEmptyMetrics()
    
    switch (event) {
      case 'hit':
        metrics.hits++
        break
      case 'miss':
        metrics.misses++
        break
      case 'stale_hit':
        metrics.staleHits++
        metrics.staleness++
        break
      case 'refresh':
        metrics.refreshes++
        break
      case 'error':
        metrics.errors++
        break
    }
    
    // Update average response time
    const totalRequests = metrics.hits + metrics.misses + metrics.staleHits
    if (totalRequests > 0) {
      metrics.averageResponseTime = (
        (metrics.averageResponseTime * (totalRequests - 1) + responseTime) / totalRequests
      )
      metrics.hitRate = (metrics.hits + metrics.staleHits) / totalRequests
    }
    
    this.metrics.set(key, metrics)
  }

  private getEmptyMetrics(): CacheMetrics {
    return {
      hits: 0,
      misses: 0,
      staleHits: 0,
      refreshes: 0,
      errors: 0,
      averageResponseTime: 0,
      hitRate: 0,
      staleness: 0
    }
  }
}

// Dashboard-specific cache configurations
export const DASHBOARD_CACHE_CONFIGS = {
  REVENUE_METRICS: {
    ttl: CACHE_TTL.CRITICAL_METRICS,
    staleTtl: CACHE_TTL.CRITICAL_METRICS * 4,
    tags: ['revenue', 'dashboard', 'critical'],
    priority: 'high' as const
  },
  
  USER_ACTIVITY: {
    ttl: CACHE_TTL.ACTIVITY_FEED,
    staleTtl: CACHE_TTL.ACTIVITY_FEED * 3,
    tags: ['activity', 'dashboard'],
    priority: 'medium' as const
  },
  
  ANALYTICS_REPORTS: {
    ttl: CACHE_TTL.ANALYTICS,
    staleTtl: CACHE_TTL.ANALYTICS * 2,
    tags: ['analytics', 'reports'],
    priority: 'medium' as const
  },
  
  PERFORMANCE_METRICS: {
    ttl: CACHE_TTL.PERFORMANCE_DATA,
    staleTtl: CACHE_TTL.PERFORMANCE_DATA * 3,
    tags: ['performance', 'monitoring'],
    priority: 'high' as const
  },
  
  USER_PREFERENCES: {
    ttl: CACHE_TTL.USER_PREFERENCES,
    staleTtl: CACHE_TTL.USER_PREFERENCES * 2,
    tags: ['user', 'preferences'],
    priority: 'low' as const
  }
} as const

// Pre-configured cache instances
export const dashboardCache = new SmartCache('dashboard')
export const analyticsCache = new SmartCache('analytics')
export const performanceCache = new SmartCache('performance')

// Utility function for dashboard data caching
export async function cacheDashboardData<T>(
  key: string,
  fetcher: () => Promise<T>,
  type: keyof typeof DASHBOARD_CACHE_CONFIGS = 'ANALYTICS_REPORTS'
): Promise<CachedData<T>> {
  return dashboardCache.get(key, fetcher, DASHBOARD_CACHE_CONFIGS[type])
}

// Warm critical dashboard cache
export async function warmDashboardCache(tenantId: string): Promise<void> {
  const entries = [
    {
      key: `kpis:${tenantId}`,
      fetcher: async () => {
        // Implementation would fetch real KPIs
        return {
          revenue: 150000,
          customers: 1250,
          conversion: 0.15,
          churn: 0.05
        }
      },
      config: DASHBOARD_CACHE_CONFIGS.REVENUE_METRICS
    },
    {
      key: `activity:${tenantId}`,
      fetcher: async () => {
        // Implementation would fetch real activity
        return [
          { type: 'payment', amount: 99, timestamp: new Date() },
          { type: 'signup', user: 'user123', timestamp: new Date() }
        ]
      },
      config: DASHBOARD_CACHE_CONFIGS.USER_ACTIVITY
    },
    {
      key: `performance:${tenantId}`,
      fetcher: async () => {
        // Implementation would fetch real performance metrics
        return {
          responseTime: 45,
          uptime: 99.9,
          errorRate: 0.001
        }
      },
      config: DASHBOARD_CACHE_CONFIGS.PERFORMANCE_METRICS
    }
  ]
  
  await dashboardCache.warm(entries)
}

export default SmartCache