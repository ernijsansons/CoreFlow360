/**
 * CoreFlow360 - Enterprise Cache Management System
 * Multi-layered intelligent caching with Redis Streams and auto-optimization
 */

import { Redis, Cluster } from 'ioredis'
import { EventEmitter } from 'events'
import { LRUCache } from 'lru-cache'
import { gzipSync, gunzipSync } from 'zlib'

export interface CacheConfig {
  redis: {
    host: string
    port: number
    password?: string
    cluster?: boolean
    maxRetriesPerRequest: number
    retryDelayOnFailover: number
    enableOfflineQueue: boolean
  }
  memory: {
    maxSize: number // Maximum memory cache size in MB
    ttl: number // Default TTL in seconds
    updateAgeOnGet: boolean
  }
  compression: {
    enabled: boolean
    minSize: number // Minimum size to compress (bytes)
    level: number // Compression level 1-9
  }
  strategies: {
    writeThrough: boolean
    writeBack: boolean
    readThrough: boolean
    refreshAhead: boolean
  }
}

export interface CacheEntry<T = unknown> {
  value: T
  metadata: {
    size: number
    compressed: boolean
    createdAt: Date
    lastAccessed: Date
    accessCount: number
    tags: string[]
    version: string
  }
}

export interface CacheMetrics {
  hits: number
  misses: number
  hitRatio: number
  memoryUsage: number
  redisConnections: number
  compressionRatio: number
  averageResponseTime: number
  evictions: number
  errors: number
}

export interface CacheStrategy {
  name: string
  pattern: string
  ttl: number
  maxSize?: number
  compression: boolean
  preload: boolean
  tags: string[]
  invalidationRules: string[]
  refreshStrategy: 'lazy' | 'eager' | 'scheduled'
}

export class CacheManager extends EventEmitter {
  private redis: Redis | Cluster | null = null
  private memoryCache: LRUCache<string, CacheEntry>
  private config: CacheConfig
  private metrics: CacheMetrics
  private strategies: Map<string, CacheStrategy>
  private refreshQueue: Map<string, NodeJS.Timer>
  private isConnected: boolean = false

  constructor(config: CacheConfig) {
    super()
    this.config = config
    this.strategies = new Map()
    this.refreshQueue = new Map()

    // Skip Redis initialization during build
    if (
      !process.env.VERCEL &&
      !process.env.CI &&
      process.env.NEXT_PHASE !== 'phase-production-build' &&
      process.env.VERCEL_ENV !== 'preview'
    ) {
      this.initializeRedis()
    }
    this.initializeMemoryCache()
    this.initializeMetrics()
    this.initializeStrategies()
    this.startMetricsCollection()
  }

  /**
   * Set cache value with intelligent routing
   */
  async set<T>(
    key: string,
    value: T,
    options?: {
      ttl?: number
      tags?: string[]
      compress?: boolean
      strategy?: string
      version?: string
    }
  ): Promise<boolean> {
    const startTime = Date.now()

    try {
      // Apply cache strategy if specified
      const strategy = options?.strategy ? this.strategies.get(options.strategy) : null
      const ttl = options?.ttl || strategy?.ttl || this.config.memory.ttl
      const compress = options?.compress ?? strategy?.compression ?? this.shouldCompress(value)
      const tags = options?.tags || strategy?.tags || []

      // Create cache entry
      const entry: CacheEntry<T> = {
        value,
        metadata: {
          size: this.calculateSize(value),
          compressed: false,
          createdAt: new Date(),
          lastAccessed: new Date(),
          accessCount: 0,
          tags,
          version: options?.version || '1.0',
        },
      }

      // Compress if needed
      let finalValue: unknown = value
      if (compress && entry.metadata.size > this.config.compression.minSize) {
        finalValue = this.compressValue(value)
        entry.metadata.compressed = true
        entry.metadata.size = this.calculateSize(finalValue)
      }

      // Write-through strategy: write to both memory and Redis
      if (this.config.strategies.writeThrough) {
        const [memorySuccess, redisSuccess] = await Promise.allSettled([
          this.setMemory(key, entry, ttl),
          this.setRedis(key, finalValue, ttl, tags),
        ])

        const success = memorySuccess.status === 'fulfilled' && redisSuccess.status === 'fulfilled'
        this.updateMetrics('set', Date.now() - startTime, success)
        return success
      }

      // Write-back strategy: write to memory first, Redis asynchronously
      if (this.config.strategies.writeBack) {
        const memorySuccess = await this.setMemory(key, entry, ttl)

        // Schedule Redis write
        setImmediate(() => this.setRedis(key, finalValue, ttl, tags))

        this.updateMetrics('set', Date.now() - startTime, memorySuccess)
        return memorySuccess
      }

      // Default: write to both sequentially
      const memorySuccess = await this.setMemory(key, entry, ttl)
      const redisSuccess = await this.setRedis(key, finalValue, ttl, tags)

      const success = memorySuccess && redisSuccess
      this.updateMetrics('set', Date.now() - startTime, success)

      // Schedule refresh if needed
      if (success && strategy?.refreshStrategy === 'scheduled') {
        this.scheduleRefresh(key, strategy, ttl)
      }

      return success
    } catch (error) {
      this.updateMetrics('set', Date.now() - startTime, false)
      this.emit('error', { operation: 'set', key, error })
      return false
    }
  }

  /**
   * Get cache value with intelligent fallback
   */
  async get<T>(
    key: string,
    options?: {
      strategy?: string
      fallback?: () => Promise<T>
      refreshIfNearExpiry?: boolean
    }
  ): Promise<T | null> {
    const startTime = Date.now()

    try {
      // Try memory cache first
      const memoryEntry = this.memoryCache.get(key)
      if (memoryEntry) {
        memoryEntry.metadata.lastAccessed = new Date()
        memoryEntry.metadata.accessCount++

        this.updateMetrics('get', Date.now() - startTime, true, 'memory')
        this.emit('hit', { key, source: 'memory', responseTime: Date.now() - startTime })

        return memoryEntry.value as T
      }

      // Try Redis cache
      const redisValue = await this.getRedis(key)
      if (redisValue !== null) {
        // Decompress if needed
        const value = this.isCompressed(redisValue) ? this.decompressValue(redisValue) : redisValue

        // Update memory cache
        const entry: CacheEntry<T> = {
          value: value as T,
          metadata: {
            size: this.calculateSize(value),
            compressed: this.isCompressed(redisValue),
            createdAt: new Date(),
            lastAccessed: new Date(),
            accessCount: 1,
            tags: [],
            version: '1.0',
          },
        }

        this.memoryCache.set(key, entry)

        this.updateMetrics('get', Date.now() - startTime, true, 'redis')
        this.emit('hit', { key, source: 'redis', responseTime: Date.now() - startTime })

        return value as T
      }

      // Cache miss - try fallback if provided
      if (options?.fallback) {
        const value = await options.fallback()

        // Cache the fallback result
        await this.set(key, value, { strategy: options.strategy })

        this.updateMetrics('get', Date.now() - startTime, false)
        this.emit('miss', { key, hadFallback: true, responseTime: Date.now() - startTime })

        return value
      }

      this.updateMetrics('get', Date.now() - startTime, false)
      this.emit('miss', { key, hadFallback: false, responseTime: Date.now() - startTime })

      return null
    } catch (error) {
      this.updateMetrics('get', Date.now() - startTime, false)
      this.emit('error', { operation: 'get', key, error })
      return null
    }
  }

  /**
   * Multi-get with batch optimization
   */
  async mget<T>(keys: string[]): Promise<Map<string, T>> {
    const results = new Map<string, T>()
    const startTime = Date.now()

    try {
      // Check memory cache first
      const memoryHits = new Map<string, T>()
      const memoryMisses: string[] = []

      for (const key of keys) {
        const entry = this.memoryCache.get(key)
        if (entry) {
          entry.metadata.lastAccessed = new Date()
          entry.metadata.accessCount++
          memoryHits.set(key, entry.value)
        } else {
          memoryMisses.push(key)
        }
      }

      // Batch get from Redis for memory misses
      let redisResults = new Map<string, T>()
      if (memoryMisses.length > 0) {
        redisResults = await this.mgetRedis(memoryMisses)

        // Update memory cache with Redis hits
        for (const [key, value] of redisResults) {
          const entry: CacheEntry<T> = {
            value,
            metadata: {
              size: this.calculateSize(value),
              compressed: false,
              createdAt: new Date(),
              lastAccessed: new Date(),
              accessCount: 1,
              tags: [],
              version: '1.0',
            },
          }
          this.memoryCache.set(key, entry)
        }
      }

      // Combine results
      for (const [key, value] of memoryHits) {
        results.set(key, value)
      }
      for (const [key, value] of redisResults) {
        results.set(key, value)
      }

      const hitCount = results.size
      const missCount = keys.length - hitCount

      this.metrics.hits += hitCount
      this.metrics.misses += missCount
      this.updateHitRatio()

      this.emit('multiget', {
        keys: keys.length,
        hits: hitCount,
        misses: missCount,
        responseTime: Date.now() - startTime,
      })

      return results
    } catch (error) {
      this.emit('error', { operation: 'mget', keys, error })
      return results
    }
  }

  /**
   * Delete cache entries with tag support
   */
  async delete(key: string | string[]): Promise<boolean> {
    const keys = Array.isArray(key) ? key : [key]
    const startTime = Date.now()

    try {
      // Delete from memory cache
      for (const k of keys) {
        this.memoryCache.delete(k)
      }

      // Delete from Redis
      await this.deleteRedis(keys)

      this.emit('delete', { keys, responseTime: Date.now() - startTime })
      return true
    } catch (error) {
      this.emit('error', { operation: 'delete', keys, error })
      return false
    }
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTags(tags: string[]): Promise<number> {
    const startTime = Date.now()
    let invalidatedCount = 0

    try {
      // Get keys associated with tags from Redis
      const pipeline = this.redis.pipeline()
      for (const tag of tags) {
        pipeline.smembers(`tag:${tag}`)
      }

      const results = await pipeline.exec()
      const keysToInvalidate = new Set<string>()

      if (results) {
        for (const result of results) {
          if (result[1]) {
            const keys = result[1] as string[]
            keys.forEach((key) => keysToInvalidate.add(key))
          }
        }
      }

      // Delete the keys
      if (keysToInvalidate.size > 0) {
        const keysArray = Array.from(keysToInvalidate)
        await this.delete(keysArray)
        invalidatedCount = keysArray.length
      }

      this.emit('invalidate', {
        tags,
        keysInvalidated: invalidatedCount,
        responseTime: Date.now() - startTime,
      })

      return invalidatedCount
    } catch (error) {
      this.emit('error', { operation: 'invalidateByTags', tags, error })
      return 0
    }
  }

  /**
   * Preload cache with common data
   */
  async preload(
    preloadRules: Array<{
      key: string
      loader: () => Promise<unknown>
      strategy?: string
      ttl?: number
    }>
  ): Promise<number> {
    let loadedCount = 0

    const promises = preloadRules.map(async (rule) => {
      try {
        const value = await rule.loader()
        const success = await this.set(rule.key, value, {
          strategy: rule.strategy,
          ttl: rule.ttl,
        })

        if (success) {
          loadedCount++
        }
      } catch (error) {}
    })

    await Promise.allSettled(promises)

    return loadedCount
  }

  /**
   * Get comprehensive cache metrics
   */
  getMetrics(): CacheMetrics & {
    memoryEntries: number
    redisMemoryUsage: number
    strategiesActive: number
    refreshQueueSize: number
  } {
    return {
      ...this.metrics,
      memoryEntries: this.memoryCache.size,
      redisMemoryUsage: 0, // Would need Redis INFO command
      strategiesActive: this.strategies.size,
      refreshQueueSize: this.refreshQueue.size,
    }
  }

  /**
   * Register cache strategy
   */
  registerStrategy(strategy: CacheStrategy): void {
    this.strategies.set(strategy.name, strategy)
  }

  /**
   * Warm up cache for specific tenant
   */
  async warmup(tenantId: string): Promise<void> {
    // Common data to preload
    const preloadRules = [
      {
        key: `tenant:${tenantId}:config`,
        loader: async () => ({ config: 'tenant_config_data' }),
        strategy: 'tenant_config',
        ttl: 3600,
      },
      {
        key: `tenant:${tenantId}:subscriptions`,
        loader: async () => ({ subscriptions: 'subscription_data' }),
        strategy: 'subscription_data',
        ttl: 1800,
      },
    ]

    await this.preload(preloadRules)
  }

  // Private methods
  private initializeRedis(): void {
    // Skip during build
    if (
      process.env.VERCEL ||
      process.env.CI ||
      process.env.NEXT_PHASE === 'phase-production-build' ||
      process.env.VERCEL_ENV === 'preview'
    ) {
      return
    }

    if (this.config.redis.cluster) {
      // Redis Cluster setup
      this.redis = new Cluster(
        [
          {
            host: this.config.redis.host,
            port: this.config.redis.port,
          },
        ],
        {
          maxRetriesPerRequest: this.config.redis.maxRetriesPerRequest,
          retryDelayOnFailover: this.config.redis.retryDelayOnFailover,
          enableOfflineQueue: this.config.redis.enableOfflineQueue,
          lazyConnect: true,
        }
      )
    } else {
      // Single Redis instance
      this.redis = new Redis({
        host: this.config.redis.host,
        port: this.config.redis.port,
        password: this.config.redis.password,
        maxRetriesPerRequest: this.config.redis.maxRetriesPerRequest,
        retryDelayOnFailover: this.config.redis.retryDelayOnFailover,
        enableOfflineQueue: this.config.redis.enableOfflineQueue,
        lazyConnect: true,
      })
    }

    if (this.redis) {
      this.redis.on('connect', () => {
        this.isConnected = true
      })

      this.redis.on('error', (error) => {
        this.emit('redisError', error)
      })
    }
  }

  private initializeMemoryCache(): void {
    this.memoryCache = new LRUCache<string, CacheEntry>({
      maxSize: this.config.memory.maxSize * 1024 * 1024, // Convert MB to bytes
      ttl: this.config.memory.ttl * 1000, // Convert seconds to milliseconds
      updateAgeOnGet: this.config.memory.updateAgeOnGet,
      sizeCalculation: (entry) => entry.metadata.size,
      dispose: (entry, key) => {
        this.metrics.evictions++
        this.emit('eviction', { key, size: entry.metadata.size })
      },
    })
  }

  private initializeMetrics(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      hitRatio: 0,
      memoryUsage: 0,
      redisConnections: 1,
      compressionRatio: 0,
      averageResponseTime: 0,
      evictions: 0,
      errors: 0,
    }
  }

  private initializeStrategies(): void {
    // Default strategies
    const defaultStrategies: CacheStrategy[] = [
      {
        name: 'user_session',
        pattern: 'session:*',
        ttl: 3600,
        compression: false,
        preload: false,
        tags: ['user', 'session'],
        invalidationRules: ['user_logout'],
        refreshStrategy: 'lazy',
      },
      {
        name: 'tenant_config',
        pattern: 'tenant:*:config',
        ttl: 7200,
        compression: true,
        preload: true,
        tags: ['tenant', 'config'],
        invalidationRules: ['tenant_update'],
        refreshStrategy: 'eager',
      },
      {
        name: 'dashboard_data',
        pattern: 'dashboard:*',
        ttl: 300,
        compression: true,
        preload: false,
        tags: ['dashboard', 'metrics'],
        invalidationRules: ['data_update'],
        refreshStrategy: 'scheduled',
      },
    ]

    defaultStrategies.forEach((strategy) => {
      this.strategies.set(strategy.name, strategy)
    })
  }

  private async setMemory(key: string, entry: CacheEntry, ttl: number): Promise<boolean> {
    try {
      this.memoryCache.set(key, entry, { ttl: ttl * 1000 })
      return true
    } catch (error) {
      return false
    }
  }

  private async setRedis(
    key: string,
    value: unknown,
    ttl: number,
    tags: string[]
  ): Promise<boolean> {
    try {
      const pipeline = this.redis.pipeline()
      pipeline.setex(key, ttl, JSON.stringify(value))

      // Add to tag sets
      for (const tag of tags) {
        pipeline.sadd(`tag:${tag}`, key)
        pipeline.expire(`tag:${tag}`, ttl + 60)
      }

      await pipeline.exec()
      return true
    } catch (error) {
      return false
    }
  }

  private async getRedis(key: string): Promise<unknown> {
    try {
      const value = await this.redis.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      return null
    }
  }

  private async mgetRedis<T>(keys: string[]): Promise<Map<string, T>> {
    const results = new Map<string, T>()

    try {
      const values = await this.redis.mget(...keys)

      for (let i = 0; i < keys.length; i++) {
        const value = values[i]
        if (value) {
          const parsed = JSON.parse(value)
          const decompressed = this.isCompressed(parsed) ? this.decompressValue(parsed) : parsed
          results.set(keys[i], decompressed)
        }
      }
    } catch (error) {}

    return results
  }

  private async deleteRedis(keys: string[]): Promise<void> {
    try {
      if (keys.length > 0 && this.redis) {
        await this.redis.del(...keys)
      }
    } catch (error) {}
  }

  private shouldCompress(value: unknown): boolean {
    if (!this.config.compression.enabled) {
      return false
    }

    const size = this.calculateSize(value)
    return size > this.config.compression.minSize
  }

  private compressValue(value: unknown): string {
    const json = JSON.stringify(value)
    const compressed = gzipSync(json, { level: this.config.compression.level })
    return `__compressed__${compressed.toString('base64')}`
  }

  private decompressValue(compressedValue: string): unknown {
    const base64Data = compressedValue.replace('__compressed__', '')
    const compressed = Buffer.from(base64Data, 'base64')
    const decompressed = gunzipSync(compressed)
    return JSON.parse(decompressed.toString())
  }

  private isCompressed(value: unknown): boolean {
    return typeof value === 'string' && value.startsWith('__compressed__')
  }

  private calculateSize(value: unknown): number {
    return Buffer.byteLength(JSON.stringify(value), 'utf8')
  }

  private scheduleRefresh(key: string, strategy: CacheStrategy, ttl: number): void {
    // Schedule refresh at 80% of TTL
    const refreshTime = ttl * 0.8 * 1000

    const timer = setTimeout(async () => {
      try {
        // Attempt to refresh the cache entry
        this.emit('refreshNeeded', { key, strategy: strategy.name })
      } catch (error) {
      } finally {
        this.refreshQueue.delete(key)
      }
    }, refreshTime)

    this.refreshQueue.set(key, timer)
  }

  private updateMetrics(
    operation: string,
    responseTime: number,
    success: boolean,
    source?: string
  ): void {
    if (operation === 'get') {
      if (success) {
        this.metrics.hits++
      } else {
        this.metrics.misses++
      }
      this.updateHitRatio()
    }

    if (!success) {
      this.metrics.errors++
    }

    // Update average response time
    this.metrics.averageResponseTime = (this.metrics.averageResponseTime + responseTime) / 2

    // Update memory usage
    this.metrics.memoryUsage = this.memoryCache.calculatedSize || 0
  }

  private updateHitRatio(): void {
    const total = this.metrics.hits + this.metrics.misses
    this.metrics.hitRatio = total > 0 ? (this.metrics.hits / total) * 100 : 0
  }

  private startMetricsCollection(): void {
    setInterval(() => {
      this.emit('metrics', this.getMetrics())
    }, 30000) // Emit metrics every 30 seconds
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    // Clear refresh queue
    for (const timer of this.refreshQueue.values()) {
      clearTimeout(timer)
    }
    this.refreshQueue.clear()

    // Clear memory cache
    this.memoryCache.clear()

    // Disconnect Redis
    await this.redis.quit()
  }
}

export default CacheManager
