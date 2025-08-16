/**
 * CoreFlow360 - Unified Redis Cache Implementation
 * Combines the best features of both Redis implementations with fallback support
 */

import Redis from 'ioredis'
import { handleError } from '../error-handler'
import { withPerformanceTracking } from '../monitoring'

export interface CacheOptions {
  ttl?: number // Time to live in seconds
  tenantId?: string // For tenant-specific caching
  prefix?: string // Cache key prefix
  compress?: boolean // Use compression for large values
  tags?: string[] // Cache tags for bulk invalidation
  namespace?: string // Cache namespace for isolation
}

export interface CacheStats {
  hits: number
  misses: number
  sets: number
  deletes: number
  errors: number
  totalKeys: number
  memoryUsage: number
  hitRate: number
}

// In-memory fallback cache with LRU eviction
class MemoryCache {
  private cache = new Map<string, { value: any; expires: number; size: number }>()
  private readonly maxSize = 100 * 1024 * 1024 // 100MB
  private currentSize = 0
  private stats = { hits: 0, misses: 0, sets: 0, deletes: 0, errors: 0 }

  private cleanup() {
    const now = Date.now()
    const keysToDelete: string[] = []

    // Remove expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        keysToDelete.push(key)
      }
    }

    // LRU eviction if over memory limit
    if (this.currentSize > this.maxSize) {
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].expires - b[1].expires)
      
      let sizeToFree = this.currentSize - (this.maxSize * 0.8)
      for (const [key, entry] of entries) {
        if (sizeToFree <= 0) break
        keysToDelete.push(key)
        sizeToFree -= entry.size
      }
    }

    // Delete marked keys
    keysToDelete.forEach(key => {
      const entry = this.cache.get(key)
      if (entry) {
        this.currentSize -= entry.size
        this.cache.delete(key)
        this.stats.deletes++
      }
    })
  }

  set(key: string, value: any, ttlSeconds: number = 3600): boolean {
    try {
      const serialized = JSON.stringify(value)
      const size = Buffer.byteLength(serialized, 'utf8')
      const expires = Date.now() + (ttlSeconds * 1000)

      // Remove old entry if exists
      const oldEntry = this.cache.get(key)
      if (oldEntry) {
        this.currentSize -= oldEntry.size
      }

      this.cache.set(key, { value, expires, size })
      this.currentSize += size
      this.stats.sets++

      this.cleanup()
      return true
    } catch (error) {
      this.stats.errors++
      console.error('Memory cache set error:', error)
      return false
    }
  }

  get(key: string): any | null {
    const entry = this.cache.get(key)
    if (!entry) {
      this.stats.misses++
      return null
    }

    if (Date.now() > entry.expires) {
      this.currentSize -= entry.size
      this.cache.delete(key)
      this.stats.misses++
      return null
    }

    this.stats.hits++
    return entry.value
  }

  del(key: string): boolean {
    const entry = this.cache.get(key)
    if (entry) {
      this.currentSize -= entry.size
      this.cache.delete(key)
      this.stats.deletes++
      return true
    }
    return false
  }

  clear(): void {
    this.cache.clear()
    this.currentSize = 0
    this.stats.deletes += this.cache.size
  }

  getStats(): Partial<CacheStats> {
    const total = this.stats.hits + this.stats.misses
    return {
      ...this.stats,
      totalKeys: this.cache.size,
      memoryUsage: this.currentSize,
      hitRate: total > 0 ? (this.stats.hits / total) * 100 : 0
    }
  }
}

// Main unified Redis cache implementation
export class UnifiedRedisCache {
  private redisClient: Redis | null = null
  private memoryCache = new MemoryCache()
  private connected = false
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0,
    totalKeys: 0,
    memoryUsage: 0,
    hitRate: 0
  }
  private statsResetInterval: NodeJS.Timeout | null = null

  constructor() {
    this.init()
    // Reset stats every hour
    this.statsResetInterval = setInterval(() => {
      this.resetStats()
    }, 60 * 60 * 1000)
  }

  private async init() {
    try {
      if (!process.env.REDIS_URL) {
        console.warn('Redis URL not provided, using memory cache only')
        return
      }

      this.redisClient = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        reconnectOnError: () => true,
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 100, 3000)
          return delay
        },
        lazyConnect: true
      })

      this.redisClient.on('connect', () => {
        console.log('Redis connected successfully')
        this.connected = true
      })

      this.redisClient.on('error', (error) => {
        console.error('Redis connection error:', error)
        this.stats.errors++
        this.connected = false
      })

      this.redisClient.on('close', () => {
        console.log('Redis connection closed')
        this.connected = false
      })

      await this.redisClient.connect()
    } catch (error) {
      console.error('Redis initialization error:', error)
      this.connected = false
    }
  }

  private buildKey(key: string, options?: CacheOptions): string {
    const parts: string[] = []
    
    if (options?.namespace) {
      parts.push(options.namespace)
    }
    
    if (options?.tenantId) {
      parts.push(`tenant:${options.tenantId}`)
    }
    
    if (options?.prefix) {
      parts.push(options.prefix)
    }
    
    parts.push(key)
    
    return parts.join(':')
  }

  private isAvailable(): boolean {
    return this.connected && this.redisClient !== null
  }

  private resetStats() {
    const hitRate = this.getHitRate()
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      totalKeys: this.stats.totalKeys,
      memoryUsage: this.stats.memoryUsage,
      hitRate
    }
  }

  /**
   * Get a value from cache with automatic fallback
   */
  async get<T = any>(key: string, options?: CacheOptions): Promise<T | null> {
    return withPerformanceTracking('cache.get', async () => {
      const cacheKey = this.buildKey(key, options)

      // Try Redis first if available
      if (this.isAvailable()) {
        try {
          const value = await this.redisClient!.get(cacheKey)
          if (value) {
            this.stats.hits++
            return JSON.parse(value)
          }
          this.stats.misses++
        } catch (error) {
          this.stats.errors++
          console.error('Redis get error:', error)
        }
      }

      // Fallback to memory cache
      const memValue = this.memoryCache.get(cacheKey)
      if (memValue !== null) {
        this.stats.hits++
        return memValue
      }

      this.stats.misses++
      return null
    })
  }

  /**
   * Set a value in cache with automatic fallback
   */
  async set(key: string, value: any, options?: CacheOptions): Promise<boolean> {
    return withPerformanceTracking('cache.set', async () => {
      const cacheKey = this.buildKey(key, options)
      const ttl = options?.ttl || 3600
      let success = false

      // Try Redis first if available
      if (this.isAvailable()) {
        try {
          const serialized = JSON.stringify(value)
          await this.redisClient!.setex(cacheKey, ttl, serialized)
          this.stats.sets++
          success = true
        } catch (error) {
          this.stats.errors++
          console.error('Redis set error:', error)
        }
      }

      // Always set in memory cache as fallback
      const memSuccess = this.memoryCache.set(cacheKey, value, ttl)
      if (memSuccess && !success) {
        this.stats.sets++
      }

      return success || memSuccess
    })
  }

  /**
   * Delete a value from cache
   */
  async del(key: string, options?: CacheOptions): Promise<boolean> {
    return withPerformanceTracking('cache.del', async () => {
      const cacheKey = this.buildKey(key, options)
      let success = false

      // Try Redis first if available
      if (this.isAvailable()) {
        try {
          await this.redisClient!.del(cacheKey)
          this.stats.deletes++
          success = true
        } catch (error) {
          this.stats.errors++
          console.error('Redis delete error:', error)
        }
      }

      // Always delete from memory cache
      const memSuccess = this.memoryCache.del(cacheKey)
      if (memSuccess && !success) {
        this.stats.deletes++
      }

      return success || memSuccess
    })
  }

  /**
   * Invalidate all keys matching a pattern
   */
  async invalidatePattern(pattern: string, options?: CacheOptions): Promise<number> {
    return withPerformanceTracking('cache.invalidatePattern', async () => {
      const keyPattern = this.buildKey(pattern, options)
      let count = 0

      // Invalidate in Redis if available
      if (this.isAvailable()) {
        try {
          const keys = await this.redisClient!.keys(keyPattern)
          if (keys.length > 0) {
            count = await this.redisClient!.del(...keys)
            this.stats.deletes += count
          }
        } catch (error) {
          this.stats.errors++
          console.error('Redis pattern invalidation error:', error)
        }
      }

      // Memory cache doesn't support pattern matching efficiently
      // Could be implemented if needed

      return count
    })
  }

  /**
   * Invalidate all cache for a tenant
   */
  async invalidateTenant(tenantId: string): Promise<number> {
    return this.invalidatePattern('*', { tenantId })
  }

  /**
   * High-level caching helper with factory function
   */
  async cache<T>(
    key: string, 
    factory: () => Promise<T>, 
    options?: CacheOptions
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key, options)
    if (cached !== null) {
      return cached
    }

    // Generate fresh data
    const fresh = await factory()
    
    // Cache the result
    await this.set(key, fresh, options)
    
    return fresh
  }

  /**
   * Execute an operation with distributed lock
   */
  async withLock<T>(
    lockKey: string,
    operation: () => Promise<T>,
    options: { ttl?: number; timeout?: number } = {}
  ): Promise<T> {
    if (!this.isAvailable()) {
      // If Redis unavailable, execute without lock
      return await operation()
    }

    const { ttl = 30, timeout = 5000 } = options
    const lockValue = `${Date.now()}-${Math.random()}`
    const fullLockKey = this.buildKey(`lock:${lockKey}`)
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      try {
        // Try to acquire lock
        const acquired = await this.redisClient!.set(
          fullLockKey,
          lockValue,
          'PX',
          ttl * 1000,
          'NX'
        )

        if (acquired === 'OK') {
          try {
            return await operation()
          } finally {
            // Release lock using Lua script for atomicity
            await this.redisClient!.eval(
              `
              if redis.call('get', KEYS[1]) == ARGV[1] then
                return redis.call('del', KEYS[1])
              else
                return 0
              end
              `,
              1,
              fullLockKey,
              lockValue
            )
          }
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 50))
      } catch (error) {
        console.error('Lock acquisition error:', error)
        break
      }
    }

    throw new Error(`Failed to acquire lock for ${lockKey} within timeout`)
  }

  /**
   * Clear all cache (use with caution)
   */
  async clear(): Promise<void> {
    if (this.isAvailable()) {
      try {
        await this.redisClient!.flushdb()
      } catch (error) {
        console.error('Redis clear error:', error)
      }
    }
    this.memoryCache.clear()
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const memStats = this.memoryCache.getStats()
    return {
      ...this.stats,
      totalKeys: memStats.totalKeys || 0,
      memoryUsage: memStats.memoryUsage || 0
    }
  }

  /**
   * Get cache hit rate percentage
   */
  getHitRate(): number {
    const total = this.stats.hits + this.stats.misses
    return total > 0 ? (this.stats.hits / total) * 100 : 0
  }

  /**
   * Check if cache is available
   */
  isAvailable(): boolean {
    return this.connected && this.redisClient !== null
  }

  /**
   * Gracefully shutdown cache connections
   */
  async shutdown(): Promise<void> {
    if (this.statsResetInterval) {
      clearInterval(this.statsResetInterval)
    }

    if (this.redisClient) {
      await this.redisClient.quit()
    }
  }
}

// Export singleton instance
export const unifiedCache = new UnifiedRedisCache()

// Re-export for backward compatibility
export const redis = unifiedCache