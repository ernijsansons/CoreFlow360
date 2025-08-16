/**
 * CoreFlow360 - Query Cache
 * Caching layer for database queries
 */

import { redis, CACHE_TTL } from '@/lib/redis/client'
import crypto from 'crypto'

interface CacheOptions {
  ttl?: number
  key?: string
  tags?: string[]
}

/**
 * Create a cache key from query parameters
 */
function createCacheKey(prefix: string, params: any): string {
  const sorted = JSON.stringify(params, Object.keys(params).sort())
  const hash = crypto.createHash('md5').update(sorted).digest('hex')
  return `query:${prefix}:${hash}`
}

/**
 * Cached query executor
 */
export async function cachedQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const cacheKey = options.key || createCacheKey(queryName, { queryName })
  const ttl = options.ttl || CACHE_TTL.MEDIUM
  
  // Try to get from cache
  const cached = await redis.get<T>(cacheKey)
  if (cached !== null) {
    return cached
  }
  
  // Execute query
  const result = await queryFn()
  
  // Cache result
  await redis.set(cacheKey, result, ttl)
  
  // Add to cache tags for invalidation
  if (options.tags) {
    for (const tag of options.tags) {
      await redis.sadd(`cache:tag:${tag}`, cacheKey)
      await redis.expire(`cache:tag:${tag}`, CACHE_TTL.DAY)
    }
  }
  
  return result
}

/**
 * Invalidate cached queries by tag
 */
export async function invalidateByTag(tag: string): Promise<void> {
  const keys = await redis.smembers(`cache:tag:${tag}`)
  if (keys.length > 0) {
    await redis.del(...keys)
    await redis.del(`cache:tag:${tag}`)
  }
}

/**
 * Cached Prisma query wrapper
 */
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    ttl?: number
    keyPrefix?: string
    tags?: string[]
  } = {}
): T {
  return (async (...args: Parameters<T>) => {
    // Create cache key from function name and arguments
    const key = createCacheKey(
      options.keyPrefix || fn.name || 'query',
      args
    )
    
    return cachedQuery(
      key,
      () => fn(...args),
      {
        ttl: options.ttl,
        key,
        tags: options.tags
      }
    )
  }) as T
}

/**
 * Common query cache patterns
 */
export const queryCache = {
  /**
   * Cache user by ID
   */
  async user(userId: string, queryFn: () => Promise<any>) {
    return cachedQuery(
      'user',
      queryFn,
      {
        key: `user:${userId}`,
        ttl: CACHE_TTL.MEDIUM,
        tags: ['user', `user:${userId}`]
      }
    )
  },
  
  /**
   * Cache tenant data
   */
  async tenant(tenantId: string, queryFn: () => Promise<any>) {
    return cachedQuery(
      'tenant',
      queryFn,
      {
        key: `tenant:${tenantId}`,
        ttl: CACHE_TTL.LONG,
        tags: ['tenant', `tenant:${tenantId}`]
      }
    )
  },
  
  /**
   * Cache customer list
   */
  async customerList(params: any, queryFn: () => Promise<any>) {
    return cachedQuery(
      'customers',
      queryFn,
      {
        key: createCacheKey('customers', params),
        ttl: CACHE_TTL.SHORT,
        tags: ['customers', `tenant:${params.tenantId}`]
      }
    )
  },
  
  /**
   * Cache metrics data
   */
  async metrics(params: any, queryFn: () => Promise<any>) {
    return cachedQuery(
      'metrics',
      queryFn,
      {
        key: createCacheKey('metrics', params),
        ttl: params.realtime ? 30 : CACHE_TTL.MEDIUM,
        tags: ['metrics', `tenant:${params.tenantId}`]
      }
    )
  },
  
  /**
   * Cache subscription data
   */
  async subscription(userId: string, queryFn: () => Promise<any>) {
    return cachedQuery(
      'subscription',
      queryFn,
      {
        key: `subscription:${userId}`,
        ttl: CACHE_TTL.MEDIUM,
        tags: ['subscription', `user:${userId}`]
      }
    )
  }
}

/**
 * Batch invalidation patterns
 */
export const cacheInvalidation = {
  /**
   * Invalidate all user-related caches
   */
  async user(userId: string) {
    await invalidateByTag(`user:${userId}`)
  },
  
  /**
   * Invalidate all tenant-related caches
   */
  async tenant(tenantId: string) {
    await invalidateByTag(`tenant:${tenantId}`)
  },
  
  /**
   * Invalidate customer caches for a tenant
   */
  async customers(tenantId: string) {
    await invalidateByTag('customers')
    await invalidateByTag(`tenant:${tenantId}`)
  },
  
  /**
   * Invalidate subscription caches
   */
  async subscription(userId: string) {
    await invalidateByTag('subscription')
    await invalidateByTag(`user:${userId}`)
  }
}

/**
 * Cache warmer for frequently accessed data
 */
export const cacheWarmer = {
  /**
   * Warm tenant cache
   */
  async warmTenant(tenantId: string, dataFetcher: () => Promise<any>) {
    const data = await dataFetcher()
    await redis.set(`tenant:${tenantId}`, data, CACHE_TTL.LONG)
  },
  
  /**
   * Warm user sessions
   */
  async warmUserSessions(userIds: string[], sessionFetcher: (userId: string) => Promise<any>) {
    const promises = userIds.map(async (userId) => {
      const session = await sessionFetcher(userId)
      if (session) {
        await redis.set(`session:${userId}`, session, CACHE_TTL.LONG)
      }
    })
    
    await Promise.all(promises)
  },
  
  /**
   * Warm metric caches
   */
  async warmMetrics(tenantIds: string[], metricsFetcher: (tenantId: string) => Promise<any>) {
    const promises = tenantIds.map(async (tenantId) => {
      const metrics = await metricsFetcher(tenantId)
      await redis.set(
        createCacheKey('metrics', { tenantId, period: 'daily' }),
        metrics,
        CACHE_TTL.MEDIUM
      )
    })
    
    await Promise.all(promises)
  }
}