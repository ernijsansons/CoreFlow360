/**
 * CoreFlow360 - Performance Optimization Utilities
 * Production-grade performance monitoring and optimization
 */

import { Redis } from 'ioredis'
import { LRUCache } from 'lru-cache'

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()
  private readonly maxSamples = 1000

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  startTimer(label: string): () => void {
    const start = performance.now()
    
    return () => {
      const duration = performance.now() - start
      this.recordMetric(label, duration)
    }
  }

  recordMetric(label: string, value: number): void {
    const samples = this.metrics.get(label) || []
    samples.push(value)
    
    // Keep only recent samples
    if (samples.length > this.maxSamples) {
      samples.shift()
    }
    
    this.metrics.set(label, samples)
  }

  getStats(label: string): {
    count: number
    mean: number
    median: number
    p95: number
    p99: number
    min: number
    max: number
  } | null {
    const samples = this.metrics.get(label)
    if (!samples || samples.length === 0) {
      return null
    }

    const sorted = [...samples].sort((a, b) => a - b)
    const count = sorted.length
    const sum = sorted.reduce((a, b) => a + b, 0)
    
    return {
      count,
      mean: sum / count,
      median: sorted[Math.floor(count / 2)],
      p95: sorted[Math.floor(count * 0.95)],
      p99: sorted[Math.floor(count * 0.99)],
      min: sorted[0],
      max: sorted[count - 1]
    }
  }

  getAllStats(): Record<string, unknown> {
    const stats: Record<string, unknown> = {}
    
    for (const [label, _] of this.metrics) {
      stats[label] = this.getStats(label)
    }
    
    return stats
  }

  clear(): void {
    this.metrics.clear()
  }
}

// Multi-level caching strategy
export class CacheManager {
  private memoryCache: LRUCache<string, unknown>
  private redisClient?: Redis
  
  constructor(options?: {
    maxMemoryItems?: number
    ttl?: number
    redis?: Redis
  }) {
    this.memoryCache = new LRUCache({
      max: options?.maxMemoryItems || 1000,
      ttl: options?.ttl || 1000 * 60 * 5, // 5 minutes default
      updateAgeOnGet: true,
      updateAgeOnHas: true
    })
    
    this.redisClient = options?.redis
  }

  async get<T>(key: string): Promise<T | null> {
    // Check memory cache first
    const memoryResult = this.memoryCache.get(key)
    if (memoryResult !== undefined) {
      return memoryResult
    }

    // Check Redis if available
    if (this.redisClient) {
      try {
        const redisResult = await this.redisClient.get(key)
        if (redisResult) {
          const parsed = JSON.parse(redisResult)
          // Populate memory cache
          this.memoryCache.set(key, parsed)
          return parsed
        }
      } catch (error) {
        console.error('Redis get error:', error)
      }
    }

    return null
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    // Set in memory cache
    this.memoryCache.set(key, value, { ttl: ttl ? ttl * 1000 : undefined })

    // Set in Redis if available
    if (this.redisClient) {
      try {
        const serialized = JSON.stringify(value)
        if (ttl) {
          await this.redisClient.setex(key, ttl, serialized)
        } else {
          await this.redisClient.set(key, serialized)
        }
      } catch (error) {
        console.error('Redis set error:', error)
      }
    }
  }

  async delete(key: string): Promise<void> {
    // Delete from memory cache
    this.memoryCache.delete(key)

    // Delete from Redis if available
    if (this.redisClient) {
      try {
        await this.redisClient.del(key)
      } catch (error) {
        console.error('Redis delete error:', error)
      }
    }
  }

  async clear(): Promise<void> {
    // Clear memory cache
    this.memoryCache.clear()

    // Clear Redis if available (be careful with this in production!)
    if (this.redisClient) {
      try {
        await this.redisClient.flushdb()
      } catch (error) {
        console.error('Redis clear error:', error)
      }
    }
  }

  // Cache key generator for consistent naming
  static generateKey(...parts: (string | number)[]): string {
    return parts.join(':')
  }
}

// Database query optimization
export class QueryOptimizer {
  // Generate optimized Prisma includes based on required fields
  static generateIncludes(requiredFields: string[]): Record<string, unknown> {
          const includes: Record<string, unknown> = {}
    
    for (const field of requiredFields) {
      const parts = field.split('.')
      let current = includes
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        if (i === parts.length - 1) {
          current[part] = true
        } else {
          current[part] = current[part] || { include: {} }
          current = current[part].include
        }
      }
    }
    
    return includes
  }

  // Batch database operations
  static createBatcher<T, R>(
    batchFn: (items: T[]) => Promise<R[]>,
    options?: {
      maxBatchSize?: number
      maxWaitTime?: number
    }
  ) {
    let batch: { item: T; resolve: (value: R) => void; reject: (error: Error) => void }[] = []
    let timeout: NodeJS.Timeout | null = null
    
    const maxBatchSize = options?.maxBatchSize || 100
    const maxWaitTime = options?.maxWaitTime || 10 // ms

    const processBatch = async () => {
      if (batch.length === 0) return
      
      const currentBatch = batch
      batch = []
      
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }

      try {
        const items = currentBatch.map(b => b.item)
        const results = await batchFn(items)
        
        for (let i = 0; i < currentBatch.length; i++) {
          currentBatch[i].resolve(results[i])
        }
      } catch (error) {
        for (const { reject } of currentBatch) {
          reject(error)
        }
      }
    }

    return (item: T): Promise<R> => {
      return new Promise((resolve, reject) => {
        batch.push({ item, resolve, reject })
        
        if (batch.length >= maxBatchSize) {
          processBatch()
        } else if (!timeout) {
          timeout = setTimeout(processBatch, maxWaitTime)
        }
      })
    }
  }
}

// Resource pooling for expensive operations
export class ResourcePool<T> {
  private available: T[] = []
  private inUse: Set<T> = new Set()
  private waiting: ((resource: T) => void)[] = []
  
  constructor(
    private factory: () => T | Promise<T>,
    private destroyer: (resource: T) => void | Promise<void>,
    private options: {
      min: number
      max: number
      idleTimeoutMs?: number
      acquireTimeoutMs?: number
    }
  ) {
    this.initialize()
  }

  private async initialize(): Promise<void> {
    const promises: Promise<void>[] = []
    
    for (let i = 0; i < this.options.min; i++) {
      promises.push(this.createResource())
    }
    
    await Promise.all(promises)
  }

  private async createResource(): Promise<void> {
    if (this.available.length + this.inUse.size >= this.options.max) {
      return
    }
    
    try {
      const resource = await this.factory()
      this.available.push(resource)
      
      if (this.waiting.length > 0) {
        const resolve = this.waiting.shift()!
        const resource = this.available.shift()!
        this.inUse.add(resource)
        resolve(resource)
      }
    } catch (error) {
      console.error('Failed to create resource:', error)
    }
  }

  async acquire(): Promise<T> {
    if (this.available.length > 0) {
      const resource = this.available.shift()!
      this.inUse.add(resource)
      return resource
    }

    if (this.available.length + this.inUse.size < this.options.max) {
      await this.createResource()
      return this.acquire()
    }

    // Wait for a resource to become available
    return new Promise((resolve, reject) => {
      const timeout = this.options.acquireTimeoutMs
      
      if (timeout) {
        const timer = setTimeout(() => {
          const index = this.waiting.indexOf(resolve)
          if (index !== -1) {
            this.waiting.splice(index, 1)
            reject(new Error('Resource acquisition timeout'))
          }
        }, timeout)
        
        const originalResolve = resolve
        resolve = (resource: T) => {
          clearTimeout(timer)
          originalResolve(resource)
        }
      }
      
      this.waiting.push(resolve)
    })
  }

  release(resource: T): void {
    if (!this.inUse.has(resource)) {
      return
    }
    
    this.inUse.delete(resource)
    
    if (this.waiting.length > 0) {
      const resolve = this.waiting.shift()!
      this.inUse.add(resource)
      resolve(resource)
    } else {
      this.available.push(resource)
      
      // Clean up excess resources
      if (this.available.length > this.options.min) {
        const excess = this.available.pop()!
        this.destroyer(excess)
      }
    }
  }

  async destroy(): Promise<void> {
    const allResources = [...this.available, ...this.inUse]
    this.available = []
    this.inUse.clear()
    this.waiting = []
    
    await Promise.all(
      allResources.map(resource => this.destroyer(resource))
    )
  }
}

// Lazy loading helper
export function lazyLoad<T>(
  loader: () => Promise<T>
): () => Promise<T> {
  let promise: Promise<T> | null = null
  
  return () => {
    if (!promise) {
      promise = loader()
    }
    return promise
  }
}

// Debounce with leading and trailing options
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  options?: { leading?: boolean; trailing?: boolean }
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  let lastArgs: Parameters<T> | null = null
  let lastThis: unknown = null
  let result: unknown
  
  const leading = options?.leading ?? false
  const trailing = options?.trailing ?? true

  const invokeFunc = () => {
    if (lastArgs && lastThis) {
      result = func.apply(lastThis, lastArgs)
      lastArgs = null
      lastThis = null
    }
  }

  return function debounced(this: unknown, ...args: Parameters<T>) {
    const isLeading = !timeout && leading
    
    lastArgs = args
    lastThis = this

    if (timeout) {
      clearTimeout(timeout)
    }

    if (isLeading) {
      invokeFunc()
    }

    timeout = setTimeout(() => {
      timeout = null
      if (trailing && lastArgs) {
        invokeFunc()
      }
    }, wait)

    return result
  }
}

// Request deduplication
export function deduplicate<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const pending = new Map<string, Promise<unknown>>()
  
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)
    
    if (pending.has(key)) {
      return pending.get(key)!
    }
    
    const promise = fn(...args)
    pending.set(key, promise)
    
    try {
      const result = await promise
      return result
    } finally {
      pending.delete(key)
    }
  }) as T
}