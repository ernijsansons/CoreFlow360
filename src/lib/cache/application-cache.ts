/**
 * CoreFlow360 - Application-Level Caching Strategies
 * High-level caching patterns for common business operations
 */

import { unifiedCache } from './unified-redis'
import { z } from 'zod'

export interface CacheKey {
  pattern: string
  ttl: number
  tags: string[]
}

export const CACHE_KEYS = {
  // Customer data caching
  CUSTOMER_BY_ID: {
    pattern: 'customer:{{id}}',
    ttl: 300, // 5 minutes
    tags: ['customer']
  },
  CUSTOMER_LIST: {
    pattern: 'customers:{{tenantId}}:{{page}}:{{limit}}:{{search}}:{{status}}',
    ttl: 180, // 3 minutes
    tags: ['customer', 'list']
  },
  CUSTOMER_METRICS: {
    pattern: 'metrics:customers:{{tenantId}}',
    ttl: 600, // 10 minutes
    tags: ['metrics', 'customer']
  },

  // Dashboard stats caching
  DASHBOARD_STATS: {
    pattern: 'dashboard:stats:{{tenantId}}:{{timeframe}}',
    ttl: 300, // 5 minutes
    tags: ['dashboard', 'stats']
  },
  DASHBOARD_CHARTS: {
    pattern: 'dashboard:charts:{{tenantId}}:{{chartType}}:{{timeframe}}',
    ttl: 900, // 15 minutes
    tags: ['dashboard', 'charts']
  },

  // Analytics caching
  CRM_ANALYTICS: {
    pattern: 'analytics:crm:{{tenantId}}:{{timeframe}}',
    ttl: 1800, // 30 minutes
    tags: ['analytics', 'crm']
  },
  PERFORMANCE_METRICS: {
    pattern: 'metrics:performance:{{tenantId}}:{{metricType}}',
    ttl: 600, // 10 minutes
    tags: ['metrics', 'performance']
  },

  // User session caching
  USER_SESSION: {
    pattern: 'session:{{userId}}',
    ttl: 3600, // 1 hour
    tags: ['session', 'user']
  },
  USER_PERMISSIONS: {
    pattern: 'permissions:{{userId}}:{{tenantId}}',
    ttl: 1800, // 30 minutes
    tags: ['permissions', 'user']
  },

  // Subscription and module caching
  SUBSCRIPTION_DATA: {
    pattern: 'subscription:{{tenantId}}',
    ttl: 1800, // 30 minutes
    tags: ['subscription']
  },
  MODULE_ACCESS: {
    pattern: 'modules:access:{{tenantId}}:{{userId}}',
    ttl: 900, // 15 minutes
    tags: ['modules', 'access']
  },

  // AI and processing results
  AI_INSIGHTS: {
    pattern: 'ai:insights:{{tenantId}}:{{type}}',
    ttl: 3600, // 1 hour
    tags: ['ai', 'insights']
  },
  PROCESSED_DATA: {
    pattern: 'processed:{{type}}:{{hash}}',
    ttl: 7200, // 2 hours
    tags: ['processed']
  }
} as const

/**
 * Build cache key from pattern and variables
 */
function buildCacheKey(pattern: string, variables: Record<string, string | number>): string {
  return pattern.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = variables[key]
    if (value === undefined) {
      throw new Error(`Missing variable '${key}' for cache key pattern: ${pattern}`)
    }
    return String(value)
  })
}

/**
 * Application-level cache manager with business logic
 */
export class ApplicationCache {
  /**
   * Cache customer data with automatic invalidation
   */
  async cacheCustomer<T>(customerId: string, tenantId: string, factory: () => Promise<T>): Promise<T> {
    const key = buildCacheKey(CACHE_KEYS.CUSTOMER_BY_ID.pattern, { id: customerId })
    
    return unifiedCache.cache(key, factory, {
      ttl: CACHE_KEYS.CUSTOMER_BY_ID.ttl,
      tenantId,
      namespace: 'app',
      tags: CACHE_KEYS.CUSTOMER_BY_ID.tags
    })
  }

  /**
   * Cache customer list with pagination and filtering
   */
  async cacheCustomerList<T>(
    tenantId: string,
    page: number,
    limit: number,
    search: string = '',
    status: string = '',
    factory: () => Promise<T>
  ): Promise<T> {
    const key = buildCacheKey(CACHE_KEYS.CUSTOMER_LIST.pattern, {
      tenantId,
      page,
      limit,
      search: search || 'none',
      status: status || 'all'
    })

    return unifiedCache.cache(key, factory, {
      ttl: CACHE_KEYS.CUSTOMER_LIST.ttl,
      tenantId,
      namespace: 'app',
      tags: CACHE_KEYS.CUSTOMER_LIST.tags
    })
  }

  /**
   * Cache dashboard statistics with tenant isolation
   */
  async cacheDashboardStats<T>(
    tenantId: string,
    timeframe: string,
    factory: () => Promise<T>
  ): Promise<T> {
    const key = buildCacheKey(CACHE_KEYS.DASHBOARD_STATS.pattern, { tenantId, timeframe })

    return unifiedCache.cache(key, factory, {
      ttl: CACHE_KEYS.DASHBOARD_STATS.ttl,
      tenantId,
      namespace: 'app',
      tags: CACHE_KEYS.DASHBOARD_STATS.tags
    })
  }

  /**
   * Cache CRM analytics with longer TTL for expensive computations
   */
  async cacheCRMAnalytics<T>(
    tenantId: string,
    timeframe: string,
    factory: () => Promise<T>
  ): Promise<T> {
    const key = buildCacheKey(CACHE_KEYS.CRM_ANALYTICS.pattern, { tenantId, timeframe })

    return unifiedCache.cache(key, factory, {
      ttl: CACHE_KEYS.CRM_ANALYTICS.ttl,
      tenantId,
      namespace: 'app',
      tags: CACHE_KEYS.CRM_ANALYTICS.tags
    })
  }

  /**
   * Cache user session data
   */
  async cacheUserSession<T>(userId: string, factory: () => Promise<T>): Promise<T> {
    const key = buildCacheKey(CACHE_KEYS.USER_SESSION.pattern, { userId })

    return unifiedCache.cache(key, factory, {
      ttl: CACHE_KEYS.USER_SESSION.ttl,
      namespace: 'session',
      tags: CACHE_KEYS.USER_SESSION.tags
    })
  }

  /**
   * Cache user permissions with tenant context
   */
  async cacheUserPermissions<T>(
    userId: string,
    tenantId: string,
    factory: () => Promise<T>
  ): Promise<T> {
    const key = buildCacheKey(CACHE_KEYS.USER_PERMISSIONS.pattern, { userId, tenantId })

    return unifiedCache.cache(key, factory, {
      ttl: CACHE_KEYS.USER_PERMISSIONS.ttl,
      tenantId,
      namespace: 'auth',
      tags: CACHE_KEYS.USER_PERMISSIONS.tags
    })
  }

  /**
   * Cache subscription data with automatic refresh
   */
  async cacheSubscriptionData<T>(tenantId: string, factory: () => Promise<T>): Promise<T> {
    const key = buildCacheKey(CACHE_KEYS.SUBSCRIPTION_DATA.pattern, { tenantId })

    return unifiedCache.cache(key, factory, {
      ttl: CACHE_KEYS.SUBSCRIPTION_DATA.ttl,
      tenantId,
      namespace: 'subscription',
      tags: CACHE_KEYS.SUBSCRIPTION_DATA.tags
    })
  }

  /**
   * Cache AI processing results with content-based keys
   */
  async cacheAIResults<T>(
    type: string,
    contentHash: string,
    factory: () => Promise<T>
  ): Promise<T> {
    const key = buildCacheKey(CACHE_KEYS.PROCESSED_DATA.pattern, { type, hash: contentHash })

    return unifiedCache.cache(key, factory, {
      ttl: CACHE_KEYS.PROCESSED_DATA.ttl,
      namespace: 'ai',
      tags: CACHE_KEYS.PROCESSED_DATA.tags
    })
  }

  /**
   * Invalidate all customer-related cache for a tenant
   */
  async invalidateCustomerCache(tenantId: string): Promise<void> {
    await Promise.all([
      unifiedCache.invalidatePattern('customer:*', { tenantId, namespace: 'app' }),
      unifiedCache.invalidatePattern('customers:*', { tenantId, namespace: 'app' }),
      unifiedCache.invalidatePattern('metrics:customers:*', { tenantId, namespace: 'app' })
    ])
  }

  /**
   * Invalidate dashboard cache for a tenant
   */
  async invalidateDashboardCache(tenantId: string): Promise<void> {
    await Promise.all([
      unifiedCache.invalidatePattern('dashboard:*', { tenantId, namespace: 'app' }),
      unifiedCache.invalidatePattern('analytics:*', { tenantId, namespace: 'app' })
    ])
  }

  /**
   * Invalidate user session and permission cache
   */
  async invalidateUserCache(userId: string, tenantId?: string): Promise<void> {
    await Promise.all([
      unifiedCache.invalidatePattern('session:*', { namespace: 'session' }),
      tenantId ? unifiedCache.invalidatePattern('permissions:*', { tenantId, namespace: 'auth' }) : Promise.resolve()
    ])
  }

  /**
   * Invalidate subscription-related cache
   */
  async invalidateSubscriptionCache(tenantId: string): Promise<void> {
    await Promise.all([
      unifiedCache.invalidatePattern('subscription:*', { tenantId, namespace: 'subscription' }),
      unifiedCache.invalidatePattern('modules:*', { tenantId, namespace: 'app' })
    ])
  }

  /**
   * Warm up critical cache entries
   */
  async warmupCache(tenantId: string, userId: string): Promise<void> {
    // This would be called during login or app initialization
    console.log(`Warming up cache for tenant ${tenantId}, user ${userId}`)
    
    // Pre-load critical data that's commonly accessed
    // Implementation would depend on specific application needs
  }

  /**
   * Get comprehensive cache statistics
   */
  getCacheStats() {
    return unifiedCache.getStats()
  }

  /**
   * Perform cache health check
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; details: any }> {
    try {
      const testKey = 'health:check'
      const testValue = { timestamp: Date.now() }
      
      // Test write
      await unifiedCache.set(testKey, testValue, { ttl: 10 })
      
      // Test read
      const retrieved = await unifiedCache.get(testKey)
      
      // Test delete
      await unifiedCache.del(testKey)
      
      const stats = unifiedCache.getStats()
      
      if (retrieved && retrieved.timestamp === testValue.timestamp) {
        return {
          status: stats.hitRate > 50 ? 'healthy' : 'degraded',
          details: {
            hitRate: stats.hitRate,
            totalKeys: stats.totalKeys,
            errors: stats.errors,
            redisAvailable: unifiedCache.isAvailable()
          }
        }
      } else {
        return {
          status: 'unhealthy',
          details: { error: 'Cache read/write test failed' }
        }
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  }
}

// Export singleton instance
export const appCache = new ApplicationCache()

// Convenience functions for common operations
export const cacheCustomer = appCache.cacheCustomer.bind(appCache)
export const cacheCustomerList = appCache.cacheCustomerList.bind(appCache)
export const cacheDashboardStats = appCache.cacheDashboardStats.bind(appCache)
export const cacheCRMAnalytics = appCache.cacheCRMAnalytics.bind(appCache)
export const cacheUserSession = appCache.cacheUserSession.bind(appCache)
export const cacheUserPermissions = appCache.cacheUserPermissions.bind(appCache)
export const cacheSubscriptionData = appCache.cacheSubscriptionData.bind(appCache)
export const cacheAIResults = appCache.cacheAIResults.bind(appCache)

// Cache invalidation helpers
export const invalidateCustomerCache = appCache.invalidateCustomerCache.bind(appCache)
export const invalidateDashboardCache = appCache.invalidateDashboardCache.bind(appCache)
export const invalidateUserCache = appCache.invalidateUserCache.bind(appCache)
export const invalidateSubscriptionCache = appCache.invalidateSubscriptionCache.bind(appCache)