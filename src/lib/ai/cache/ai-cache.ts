/**
 * CoreFlow360 - AI Response Cache
 * Caches AI responses for performance optimization
 */

import { LRUCache } from 'lru-cache'
import { AIResult } from '../contexts/ai-flow-context'

export class AICache {
  private cache: LRUCache<string, AIResult>

  constructor(options?: { max?: number; ttl?: number }) {
    this.cache = new LRUCache<string, AIResult>({
      max: options?.max || 1000, // Maximum number of items
      ttl: options?.ttl || 1000 * 60 * 60, // Default 1 hour TTL
      updateAgeOnGet: true,
      updateAgeOnHas: true,
    })
  }

  async get(key: string): Promise<AIResult | null> {
    const cached = this.cache.get(key)
    if (cached) {
      // Update cache hit statistics
      return {
        ...cached,
        cacheHit: true,
      }
    }
    return null
  }

  async set(key: string, value: AIResult, ttl?: number): Promise<void> {
    const options = ttl ? { ttl: ttl * 1000 } : undefined
    this.cache.set(key, value, options)
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key)
  }

  async clear(): Promise<void> {
    this.cache.clear()
  }

  async has(key: string): Promise<boolean> {
    return this.cache.has(key)
  }

  getStats(): {
    size: number
    hits: number
    misses: number
    hitRate: number
  } {
    const calculatedValues = this.cache.calculatedSize || 0
    const size = this.cache.size

    // These would be tracked in a real implementation
    const hits = 0
    const misses = 0
    const hitRate = hits / (hits + misses) || 0

    return {
      size,
      hits,
      misses,
      hitRate,
    }
  }

  // Prune old entries
  prune(): void {
    this.cache.purgeStale()
  }
}
