/**
 * CoreFlow360 - Advanced Multi-Layer Caching System
 * Enterprise-grade caching with Redis, memory, and intelligent invalidation
 */

import { getRedis } from '@/lib/redis/client'
import { productionMonitor } from '@/lib/monitoring/production-alerts'

// Cache configuration types
interface CacheConfig {
  ttl: number // Time to live in seconds
  maxMemorySize?: number // Max memory cache size in bytes
  compression?: boolean // Enable compression for large objects
  serialization?: 'json' | 'msgpack' // Serialization method
  invalidationStrategy?: 'ttl' | 'tags' | 'manual'
  namespace?: string // Cache namespace for multi-tenancy
}

interface CacheEntry<T = any> {
  data: T
  timestamp: number
  ttl: number
  tags?: string[]
  compressed?: boolean
  size?: number
}

interface CacheStats {
  hits: number
  misses: number
  sets: number
  deletes: number
  memoryUsage: number
  redisConnected: boolean
  hitRate: number
}

// Cache layers
enum CacheLayer {
  MEMORY = 'memory',
  REDIS = 'redis',
  BOTH = 'both'
}

// Default configurations for different use cases
const CACHE_CONFIGS = {
  // Fast access data - user sessions, permissions
  HOT: {
    ttl: 300, // 5 minutes
    maxMemorySize: 10 * 1024 * 1024, // 10MB
    compression: false,
    serialization: 'json' as const,
    invalidationStrategy: 'ttl' as const,
  },
  
  // Frequently accessed data - user profiles, settings
  WARM: {
    ttl: 1800, // 30 minutes
    maxMemorySize: 50 * 1024 * 1024, // 50MB
    compression: true,
    serialization: 'json' as const,
    invalidationStrategy: 'tags' as const,
  },
  
  // Infrequently accessed data - analytics, reports
  COLD: {
    ttl: 3600, // 1 hour
    compression: true,
    serialization: 'json' as const,
    invalidationStrategy: 'manual' as const,
  },
  
  // Database query results
  QUERY: {
    ttl: 600, // 10 minutes
    maxMemorySize: 100 * 1024 * 1024, // 100MB
    compression: true,
    serialization: 'json' as const,
    invalidationStrategy: 'tags' as const,
  },
  
  // API responses
  API: {
    ttl: 180, // 3 minutes
    maxMemorySize: 25 * 1024 * 1024, // 25MB
    compression: true,
    serialization: 'json' as const,
    invalidationStrategy: 'ttl' as const,
  },
} as const

export class AdvancedCache {
  private static instance: AdvancedCache
  private memoryCache = new Map<string, CacheEntry>()
  private tagIndex = new Map<string, Set<string>>() // tag -> set of keys
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    memoryUsage: 0,
    redisConnected: false,
    hitRate: 0,
  }
  private cleanupInterval?: NodeJS.Timeout

  constructor() {
    this.startCleanupRoutine()
    this.updateStats()
  }

  static getInstance(): AdvancedCache {
    if (!AdvancedCache.instance) {
      AdvancedCache.instance = new AdvancedCache()
    }
    return AdvancedCache.instance
  }

  /**
   * Get cached data with automatic fallback strategy
   */
  async get<T>(
    key: string,
    config: CacheConfig = CACHE_CONFIGS.WARM,
    layer: CacheLayer = CacheLayer.BOTH
  ): Promise<T | null> {
    const namespacedKey = this.getNamespacedKey(key, config.namespace)
    
    try {
      // Try memory cache first (fastest)
      if (layer === CacheLayer.MEMORY || layer === CacheLayer.BOTH) {
        const memoryResult = this.getFromMemory<T>(namespacedKey)
        if (memoryResult !== null) {
          this.stats.hits++
          return memoryResult
        }
      }

      // Try Redis cache (slower but persistent)
      if (layer === CacheLayer.REDIS || layer === CacheLayer.BOTH) {
        const redisResult = await this.getFromRedis<T>(namespacedKey, config)
        if (redisResult !== null) {
          this.stats.hits++
          
          // Populate memory cache if using both layers
          if (layer === CacheLayer.BOTH && config.maxMemorySize) {
            this.setInMemory(namespacedKey, redisResult, config)
          }
          
          return redisResult
        }
      }

      this.stats.misses++
      return null
    } catch (error) {
      console.error('Cache get error:', error)
      this.stats.misses++
      return null
    }
  }

  /**
   * Set cached data with intelligent layer selection
   */
  async set<T>(
    key: string,
    data: T,
    config: CacheConfig = CACHE_CONFIGS.WARM,
    layer: CacheLayer = CacheLayer.BOTH,
    tags?: string[]
  ): Promise<boolean> {
    const namespacedKey = this.getNamespacedKey(key, config.namespace)
    
    try {
      this.stats.sets++

      // Set in memory cache
      if (layer === CacheLayer.MEMORY || layer === CacheLayer.BOTH) {
        this.setInMemory(namespacedKey, data, config, tags)
      }

      // Set in Redis cache
      if (layer === CacheLayer.REDIS || layer === CacheLayer.BOTH) {
        await this.setInRedis(namespacedKey, data, config, tags)
      }

      // Update tag index
      if (tags) {
        this.updateTagIndex(namespacedKey, tags)
      }

      return true
    } catch (error) {
      console.error('Cache set error:', error)
      return false
    }
  }

  /**
   * Delete cached data
   */
  async delete(
    key: string,
    config?: CacheConfig,
    layer: CacheLayer = CacheLayer.BOTH
  ): Promise<boolean> {
    const namespacedKey = this.getNamespacedKey(key, config?.namespace)
    
    try {
      this.stats.deletes++

      // Delete from memory
      if (layer === CacheLayer.MEMORY || layer === CacheLayer.BOTH) {
        this.memoryCache.delete(namespacedKey)
      }

      // Delete from Redis
      if (layer === CacheLayer.REDIS || layer === CacheLayer.BOTH) {
        const redis = getRedis()
        if (redis) {
          await redis.del(namespacedKey)
        }
      }

      // Clean up tag index
      this.cleanupTagIndex(namespacedKey)

      return true
    } catch (error) {
      console.error('Cache delete error:', error)
      return false
    }
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTags(tags: string[]): Promise<number> {
    let invalidatedCount = 0

    try {
      for (const tag of tags) {
        const keys = this.tagIndex.get(tag)
        if (keys) {
          for (const key of keys) {
            await this.delete(key)
            invalidatedCount++
          }
          this.tagIndex.delete(tag)
        }
      }

      // Also invalidate in Redis using tag-based keys
      const redis = getRedis()
      if (redis) {
        for (const tag of tags) {
          const tagKey = `tag:${tag}`
          const keys = await redis.smembers(tagKey)
          if (keys.length > 0) {
            await redis.del(...keys)
            await redis.del(tagKey)
            invalidatedCount += keys.length
          }
        }
      }

      return invalidatedCount
    } catch (error) {
      console.error('Cache invalidation error:', error)
      return invalidatedCount
    }
  }

  /**
   * Clear all cache data
   */
  async clear(namespace?: string): Promise<boolean> {
    try {
      if (namespace) {
        // Clear specific namespace
        const pattern = `${namespace}:*`
        
        // Clear memory cache
        for (const key of this.memoryCache.keys()) {
          if (key.startsWith(pattern.replace('*', ''))) {
            this.memoryCache.delete(key)
          }
        }

        // Clear Redis cache
        const redis = getRedis()
        if (redis) {
          const keys = await redis.keys(pattern)
          if (keys.length > 0) {
            await redis.del(...keys)
          }
        }
      } else {
        // Clear all cache
        this.memoryCache.clear()
        this.tagIndex.clear()

        const redis = getRedis()
        if (redis) {
          await redis.flushdb()
        }
      }

      return true
    } catch (error) {
      console.error('Cache clear error:', error)
      return false
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    this.updateStats()
    return { ...this.stats }
  }

  /**
   * Warm up cache with frequently accessed data
   */
  async warmup(data: Array<{ key: string; value: any; config?: CacheConfig; tags?: string[] }>): Promise<number> {
    let warmedCount = 0

    try {
      const batchSize = 10
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize)
        
        await Promise.all(
          batch.map(async ({ key, value, config, tags }) => {
            const success = await this.set(key, value, config, CacheLayer.BOTH, tags)
            if (success) warmedCount++
          })
        )
      }

      return warmedCount
    } catch (error) {
      console.error('Cache warmup error:', error)
      return warmedCount
    }
  }

  // Private methods

  private getFromMemory<T>(key: string): T | null {
    const entry = this.memoryCache.get(key)
    if (!entry) return null

    // Check TTL
    if (Date.now() > entry.timestamp + (entry.ttl * 1000)) {
      this.memoryCache.delete(key)
      return null
    }

    return entry.data as T
  }

  private async getFromRedis<T>(key: string, config: CacheConfig): Promise<T | null> {
    try {
      const redis = getRedis()
      if (!redis) return null

      const cached = await redis.get(key)
      if (!cached) return null

      const entry: CacheEntry<T> = JSON.parse(cached)
      
      // Decompress if needed
      if (entry.compressed && config.compression) {
        // Implement decompression logic here
        // entry.data = decompress(entry.data)
      }

      return entry.data
    } catch (error) {
      console.error('Redis get error:', error)
      return null
    }
  }

  private setInMemory<T>(key: string, data: T, config: CacheConfig, tags?: string[]): void {
    // Check memory limit
    if (config.maxMemorySize && this.getMemoryUsage() > config.maxMemorySize) {
      this.evictLRU()
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: config.ttl,
      tags,
      size: this.calculateSize(data),
    }

    this.memoryCache.set(key, entry)
  }

  private async setInRedis<T>(key: string, data: T, config: CacheConfig, tags?: string[]): Promise<void> {
    try {
      const redis = getRedis()
      if (!redis) return

      let processedData = data

      // Compress if needed
      if (config.compression) {
        // Implement compression logic here
        // processedData = compress(data)
      }

      const entry: CacheEntry<T> = {
        data: processedData,
        timestamp: Date.now(),
        ttl: config.ttl,
        tags,
        compressed: config.compression,
      }

      await redis.setex(key, config.ttl, JSON.stringify(entry))

      // Store tags in Redis sets for invalidation
      if (tags) {
        for (const tag of tags) {
          await redis.sadd(`tag:${tag}`, key)
          await redis.expire(`tag:${tag}`, config.ttl)
        }
      }
    } catch (error) {
      console.error('Redis set error:', error)
    }
  }

  private getNamespacedKey(key: string, namespace?: string): string {
    return namespace ? `${namespace}:${key}` : key
  }

  private updateTagIndex(key: string, tags: string[]): void {
    for (const tag of tags) {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set())
      }
      this.tagIndex.get(tag)!.add(key)
    }
  }

  private cleanupTagIndex(key: string): void {
    for (const [tag, keys] of this.tagIndex.entries()) {
      keys.delete(key)
      if (keys.size === 0) {
        this.tagIndex.delete(tag)
      }
    }
  }

  private evictLRU(): void {
    // Simple LRU eviction - remove oldest entries
    const entries = Array.from(this.memoryCache.entries())
    entries.sort(([, a], [, b]) => a.timestamp - b.timestamp)
    
    // Remove oldest 10%
    const toRemove = Math.max(1, Math.floor(entries.length * 0.1))
    for (let i = 0; i < toRemove; i++) {
      const [key] = entries[i]
      this.memoryCache.delete(key)
      this.cleanupTagIndex(key)
    }
  }

  private calculateSize(data: any): number {
    try {
      return JSON.stringify(data).length * 2 // Rough estimate in bytes
    } catch {
      return 0
    }
  }

  private getMemoryUsage(): number {
    let totalSize = 0
    for (const entry of this.memoryCache.values()) {
      totalSize += entry.size || 0
    }
    return totalSize
  }

  private updateStats(): void {
    const redis = getRedis()
    this.stats.redisConnected = !!redis && redis.status === 'ready'
    this.stats.memoryUsage = this.getMemoryUsage()
    this.stats.hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100 
      : 0

    // Report metrics to monitoring
    productionMonitor.recordMetric('cache_hits', this.stats.hits)
    productionMonitor.recordMetric('cache_misses', this.stats.misses)
    productionMonitor.recordMetric('cache_hit_rate', this.stats.hitRate)
    productionMonitor.recordMetric('cache_memory_usage', this.stats.memoryUsage)
  }

  private startCleanupRoutine(): void {
    // Clean expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired()
    }, 5 * 60 * 1000)
  }

  private cleanupExpired(): void {
    const now = Date.now()
    const toDelete: string[] = []

    for (const [key, entry] of this.memoryCache.entries()) {
      if (now > entry.timestamp + (entry.ttl * 1000)) {
        toDelete.push(key)
      }
    }

    for (const key of toDelete) {
      this.memoryCache.delete(key)
      this.cleanupTagIndex(key)
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.memoryCache.clear()
    this.tagIndex.clear()
  }
}

// Singleton instance
export const advancedCache = AdvancedCache.getInstance()

// Export cache configurations for easy use
export { CACHE_CONFIGS, CacheLayer }

// Utility function for cache-aside pattern
export async function cacheAside<T>(
  key: string,
  fetchFunction: () => Promise<T>,
  config: CacheConfig = CACHE_CONFIGS.WARM,
  tags?: string[]
): Promise<T> {
  // Try to get from cache first
  const cached = await advancedCache.get<T>(key, config)
  if (cached !== null) {
    return cached
  }

  // Fetch data and cache it
  const data = await fetchFunction()
  await advancedCache.set(key, data, config, CacheLayer.BOTH, tags)
  return data
}

// Decorator for caching method results
export function cached(config: CacheConfig = CACHE_CONFIGS.WARM, tags?: string[]) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`
      
      return cacheAside(
        cacheKey,
        () => method.apply(this, args),
        config,
        tags
      )
    }

    return descriptor
  }
}