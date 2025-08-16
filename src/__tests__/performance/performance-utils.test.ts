/**
 * CoreFlow360 - Performance Utils Tests
 * Comprehensive performance optimization validation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  PerformanceMonitor,
  CacheManager,
  QueryOptimizer,
  ResourcePool,
  lazyLoad,
  debounce,
  deduplicate
} from '../../utils/performance'

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor

  beforeEach(() => {
    monitor = PerformanceMonitor.getInstance()
    monitor.clear()
  })

  it('should be a singleton', () => {
    const monitor2 = PerformanceMonitor.getInstance()
    expect(monitor).toBe(monitor2)
  })

  it('should track timing metrics', async () => {
    const endTimer = monitor.startTimer('test-operation')
    
    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 10))
    
    endTimer()
    
    const stats = monitor.getStats('test-operation')
    expect(stats).toBeTruthy()
    expect(stats!.count).toBe(1)
    expect(stats!.mean).toBeGreaterThan(0)
  })

  it('should calculate percentiles correctly', () => {
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    
    values.forEach(value => {
      monitor.recordMetric('test-percentiles', value)
    })
    
    const stats = monitor.getStats('test-percentiles')
    expect(stats!.count).toBe(10)
    expect(stats!.median).toBe(5)
    expect(stats!.p95).toBe(10) // 95th percentile
    expect(stats!.min).toBe(1)
    expect(stats!.max).toBe(10)
  })

  it('should limit sample size', () => {
    // Record more than maxSamples
    for (let i = 0; i < 1200; i++) {
      monitor.recordMetric('test-limit', i)
    }
    
    const stats = monitor.getStats('test-limit')
    expect(stats!.count).toBeLessThanOrEqual(1000) // maxSamples = 1000
  })
})

describe('CacheManager', () => {
  let cache: CacheManager

  beforeEach(() => {
    cache = new CacheManager({ maxMemoryItems: 100, ttl: 1000 })
  })

  afterEach(async () => {
    await cache.clear()
  })

  it('should store and retrieve values', async () => {
    const testData = { message: 'Hello, World!' }
    
    await cache.set('test-key', testData)
    const retrieved = await cache.get<typeof testData>('test-key')
    
    expect(retrieved).toEqual(testData)
  })

  it('should handle TTL expiration', async () => {
    await cache.set('ttl-key', 'test-value', 1) // 1 second TTL
    
    const immediate = await cache.get('ttl-key')
    expect(immediate).toBe('test-value')
    
    // Wait for TTL to expire
    await new Promise(resolve => setTimeout(resolve, 1100))
    
    const expired = await cache.get('ttl-key')
    expect(expired).toBeNull()
  })

  it('should delete values', async () => {
    await cache.set('delete-key', 'test-value')
    expect(await cache.get('delete-key')).toBe('test-value')
    
    await cache.delete('delete-key')
    expect(await cache.get('delete-key')).toBeNull()
  })

  it('should generate cache keys consistently', () => {
    const key1 = CacheManager.generateKey('user', 123, 'profile')
    const key2 = CacheManager.generateKey('user', 123, 'profile')
    const key3 = CacheManager.generateKey('user', 456, 'profile')
    
    expect(key1).toBe(key2)
    expect(key1).not.toBe(key3)
    expect(key1).toBe('user:123:profile')
  })
})

describe('QueryOptimizer', () => {
  it('should generate includes from required fields', () => {
    const requiredFields = ['user.profile.name', 'user.settings', 'posts']
    const includes = QueryOptimizer.generateIncludes(requiredFields)
    
    expect(includes).toEqual({
      user: {
        include: {
          profile: { include: { name: true } },
          settings: true
        }
      },
      posts: true
    })
  })

  it('should create batchers with configurable options', async () => {
    const mockBatchFn = vi.fn().mockResolvedValue(['result1', 'result2'])
    const batcher = QueryOptimizer.createBatcher(mockBatchFn, {
      maxBatchSize: 2,
      maxWaitTime: 50
    })
    
    const promise1 = batcher('item1')
    const promise2 = batcher('item2')
    
    const results = await Promise.all([promise1, promise2])
    
    expect(results).toEqual(['result1', 'result2'])
    expect(mockBatchFn).toHaveBeenCalledWith(['item1', 'item2'])
    expect(mockBatchFn).toHaveBeenCalledTimes(1)
  })

  it('should batch operations within time window', async () => {
    const mockBatchFn = vi.fn().mockResolvedValue(['a', 'b', 'c'])
    const batcher = QueryOptimizer.createBatcher(mockBatchFn, {
      maxBatchSize: 10,
      maxWaitTime: 100
    })
    
    const promise1 = batcher('1')
    
    // Add delay then more items
    setTimeout(() => {
      batcher('2')
      batcher('3')
    }, 25)
    
    await promise1
    
    // Wait for batch to process
    await new Promise(resolve => setTimeout(resolve, 150))
    
    expect(mockBatchFn).toHaveBeenCalledWith(['1', '2', '3'])
  })
})

describe('ResourcePool', () => {
  interface TestResource {
    id: string
    active: boolean
  }

  let pool: ResourcePool<TestResource>
  let createCount = 0

  beforeEach(() => {
    createCount = 0
    
    pool = new ResourcePool(
      () => {
        createCount++
        return { id: `resource-${createCount}`, active: true }
      },
      (resource) => {
        resource.active = false
      },
      { min: 2, max: 5, acquireTimeoutMs: 1000 }
    )
  })

  afterEach(async () => {
    await pool.destroy()
  })

  it('should create minimum resources on initialization', async () => {
    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 100))
    
    expect(createCount).toBeGreaterThanOrEqual(2)
  })

  it('should acquire and release resources', async () => {
    const resource = await pool.acquire()
    
    expect(resource).toBeTruthy()
    expect(resource.active).toBe(true)
    
    pool.release(resource)
  })

  it('should reuse released resources', async () => {
    const resource1 = await pool.acquire()
    const originalId = resource1.id
    
    pool.release(resource1)
    
    const resource2 = await pool.acquire()
    expect(resource2.id).toBe(originalId)
    
    pool.release(resource2)
  })

  it('should respect max pool size', async () => {
    const resources: TestResource[] = []
    
    // Acquire max resources
    for (let i = 0; i < 5; i++) {
      resources.push(await pool.acquire())
    }
    
    // This should timeout since pool is at max
    const timeoutPromise = pool.acquire()
    
    let timedOut = false
    setTimeout(() => { timedOut = true }, 1100)
    
    try {
      await timeoutPromise
    } catch (error: any) {
      expect(error.message).toContain('timeout')
      expect(timedOut).toBe(true)
    }
    
    // Clean up
    resources.forEach(resource => pool.release(resource))
  })
})

describe('Utility Functions', () => {
  describe('lazyLoad', () => {
    it('should load resource only once', async () => {
      let loadCount = 0
      const loader = vi.fn().mockImplementation(() => {
        loadCount++
        return Promise.resolve(`loaded-${loadCount}`)
      })
      
      const lazyLoader = lazyLoad(loader)
      
      const result1 = await lazyLoader()
      const result2 = await lazyLoader()
      
      expect(result1).toBe(result2)
      expect(result1).toBe('loaded-1')
      expect(loader).toHaveBeenCalledTimes(1)
    })
  })

  describe('debounce', () => {
    it('should debounce function calls', async () => {
      let callCount = 0
      const fn = vi.fn(() => { callCount++ })
      
      const debouncedFn = debounce(fn, 100)
      
      // Rapid calls
      debouncedFn()
      debouncedFn()
      debouncedFn()
      
      expect(fn).not.toHaveBeenCalled()
      
      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 150))
      
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should support leading edge execution', async () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100, { leading: true })
      
      debouncedFn()
      expect(fn).toHaveBeenCalledTimes(1)
      
      debouncedFn()
      debouncedFn()
      
      // Should still be 1 call (leading edge)
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('deduplicate', () => {
    it('should deduplicate concurrent requests', async () => {
      let callCount = 0
      const asyncFn = vi.fn().mockImplementation(async (value: string) => {
        callCount++
        await new Promise(resolve => setTimeout(resolve, 100))
        return `result-${value}-${callCount}`
      })
      
      const deduplicatedFn = deduplicate(asyncFn)
      
      // Make concurrent calls with same arguments
      const promises = [
        deduplicatedFn('test'),
        deduplicatedFn('test'),
        deduplicatedFn('test')
      ]
      
      const results = await Promise.all(promises)
      
      // All should return same result
      expect(results[0]).toBe(results[1])
      expect(results[1]).toBe(results[2])
      expect(results[0]).toBe('result-test-1')
      
      // Function should only be called once
      expect(asyncFn).toHaveBeenCalledTimes(1)
    })

    it('should allow different arguments to proceed separately', async () => {
      const asyncFn = vi.fn().mockImplementation(async (value: string) => {
        await new Promise(resolve => setTimeout(resolve, 50))
        return `result-${value}`
      })
      
      const deduplicatedFn = deduplicate(asyncFn)
      
      const promises = [
        deduplicatedFn('a'),
        deduplicatedFn('b'),
        deduplicatedFn('a') // Duplicate
      ]
      
      const results = await Promise.all(promises)
      
      expect(results[0]).toBe('result-a')
      expect(results[1]).toBe('result-b')
      expect(results[2]).toBe('result-a') // Same as first
      
      // Function called twice (once for 'a', once for 'b')
      expect(asyncFn).toHaveBeenCalledTimes(2)
    })
  })
})