/**
 * CoreFlow360 - Redis Client Configuration
 * Centralized Redis connection with build-time safety and mock support
 */

import Redis from 'ioredis'
import { EventEmitter } from 'events'

// Build-time detection
const isBuildTime =
  process.env.VERCEL === '1' ||
  process.env.CI === 'true' ||
  process.env.NEXT_PHASE === 'phase-production-build' ||
  process.env.NODE_ENV === 'test' ||
  process.env.BUILDING === 'true'

// Singleton instances
let _redisClient: Redis | null = null
let _mockClient: unknown | null = null

/**
 * In-memory mock Redis client for build time and environments without Redis
 */
class MockRedisClient extends EventEmitter {
  private store = new Map<string, string>()
  private lists = new Map<string, string[]>()
  private sets = new Map<string, Set<string>>()
  private hashes = new Map<string, Map<string, string>>()
  private pubsubChannels = new Map<string, Set<Function>>()

  // Basic operations
  async get(key: string): Promise<string | null> {
    return this.store.get(key) ?? null
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<'OK'> {
    this.store.set(key, value)
    if (mode === 'EX' && duration) {
      setTimeout(() => this.store.delete(key), duration * 1000)
    }
    return 'OK'
  }

  async setex(key: string, seconds: number, value: string): Promise<'OK'> {
    this.store.set(key, value)
    setTimeout(() => this.store.delete(key), seconds * 1000)
    return 'OK'
  }

  async del(...keys: string[]): Promise<number> {
    let deleted = 0
    for (const key of keys) {
      if (this.store.delete(key)) deleted++
      if (this.lists.delete(key)) deleted++
      if (this.sets.delete(key)) deleted++
      if (this.hashes.delete(key)) deleted++
    }
    return deleted
  }

  async exists(...keys: string[]): Promise<number> {
    let count = 0
    for (const key of keys) {
      if (
        this.store.has(key) ||
        this.lists.has(key) ||
        this.sets.has(key) ||
        this.hashes.has(key)
      ) {
        count++
      }
    }
    return count
  }

  async expire(key: string, seconds: number): Promise<number> {
    if (this.store.has(key)) {
      setTimeout(() => this.store.delete(key), seconds * 1000)
      return 1
    }
    return 0
  }

  async incr(key: string): Promise<number> {
    const val = parseInt(this.store.get(key) || '0')
    const newVal = val + 1
    this.store.set(key, newVal.toString())
    return newVal
  }

  // List operations
  async lpush(key: string, ...values: string[]): Promise<number> {
    const list = this.lists.get(key) || []
    list.unshift(...values)
    this.lists.set(key, list)
    return list.length
  }

  async rpush(key: string, ...values: string[]): Promise<number> {
    const list = this.lists.get(key) || []
    list.push(...values)
    this.lists.set(key, list)
    return list.length
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    const list = this.lists.get(key) || []
    return list.slice(start, stop + 1)
  }

  async brpop(_timeout: number, ..._keys: string[]): Promise<[string, string] | null> {
    return null // Mock timeout
  }

  // Set operations
  async sadd(key: string, ...members: string[]): Promise<number> {
    const set = this.sets.get(key) || new Set()
    let added = 0
    for (const member of members) {
      if (!set.has(member)) {
        set.add(member)
        added++
      }
    }
    this.sets.set(key, set)
    return added
  }

  async smembers(key: string): Promise<string[]> {
    const set = this.sets.get(key)
    return set ? Array.from(set) : []
  }

  // Hash operations
  async hset(key: string, field: string, value: string): Promise<number> {
    const hash = this.hashes.get(key) || new Map()
    const isNew = !hash.has(field)
    hash.set(field, value)
    this.hashes.set(key, hash)
    return isNew ? 1 : 0
  }

  async hget(key: string, field: string): Promise<string | null> {
    return this.hashes.get(key)?.get(field) ?? null
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    const hash = this.hashes.get(key)
    if (!hash) return {}
    const result: Record<string, string> = {}
    hash.forEach((value, field) => {
      result[field] = value
    })
    return result
  }

  // Pub/Sub operations
  async publish(channel: string, message: string): Promise<number> {
    const subscribers = this.pubsubChannels.get(channel)
    if (subscribers) {
      subscribers.forEach((callback) => callback(message))
      return subscribers.size
    }
    return 0
  }

  subscribe(channel: string, callback?: Function): void {
    if (!this.pubsubChannels.has(channel)) {
      this.pubsubChannels.set(channel, new Set())
    }
    if (callback) {
      this.pubsubChannels.get(channel)!.add(callback)
    }
    this.emit('subscribe', channel, 1)
  }

  // Connection methods
  async ping(): Promise<'PONG'> {
    return 'PONG'
  }

  async connect(): Promise<void> {}
  async disconnect(): Promise<void> {}
  async quit(): Promise<'OK'> {
    return 'OK'
  }

  status = 'ready'
}

/**
 * Get or create Redis client instance
 */
export function getRedisClient(): Redis | MockRedisClient | null {
  // During build time, always return mock
  if (isBuildTime) {
    if (!_mockClient) {
      _mockClient = new MockRedisClient()
    }
    return _mockClient
  }

  const redisUrl = process.env.REDIS_URL

  // No Redis URL - return mock
  if (!redisUrl) {
    if (!_mockClient) {
      _mockClient = new MockRedisClient()
    }
    return _mockClient
  }

  // Create real Redis client
  if (!_redisClient) {
    try {
      _redisClient = new Redis(redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 3) return null
          return Math.min(times * 100, 3000)
        },
        reconnectOnError: (err) => {
          const targetErrors = ['READONLY', 'ECONNREFUSED', 'ETIMEDOUT']
          return targetErrors.some((e) => err.message.includes(e))
        },
      })

      _redisClient.on('error', (error) => {})

      _redisClient.on('connect', () => {})

      // Attempt connection but don't fail if it doesn't work
      _redisClient.connect().catch((error) => {})
    } catch (error) {
      // Fall back to mock
      if (!_mockClient) {
        _mockClient = new MockRedisClient()
      }
      return _mockClient
    }
  }

  return _redisClient
}

/**
 * Get Redis client (convenience alias)
 */
export function getRedis(): Redis | MockRedisClient | null {
  return getRedisClient()
}

/**
 * Check if Redis is available (not mock)
 */
export function isRedisAvailable(): boolean {
  return !isBuildTime && !!process.env.REDIS_URL && !!_redisClient
}

/**
 * Close Redis connection
 */
export async function closeRedis() {
  if (_redisClient) {
    await _redisClient.quit()
    _redisClient = null
  }
}

/**
 * Redis key prefixes for different cache types
 */
export const CACHE_PREFIXES = {
  SESSION: 'session:',
  USER: 'user:',
  TENANT: 'tenant:',
  API_RESPONSE: 'api:',
  METRICS: 'metrics:',
  RATE_LIMIT: 'rl:',
  FEATURE_FLAG: 'ff:',
  SUBSCRIPTION: 'sub:',
  ANALYTICS: 'analytics:',
} as const

/**
 * Default TTL values (in seconds)
 */
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
  WEEK: 604800, // 7 days
} as const

/**
 * Safe Redis operations with error handling
 */
export const redis = {
  /**
   * Get value with automatic JSON parsing
   */
  async get<T = unknown>(key: string): Promise<T | null> {
    const client = getRedisClient()
    if (!client) return null

    try {
      const value = await client.get(key)
      if (!value) return null

      try {
        return JSON.parse(value) as T
      } catch {
        // Return as string if not valid JSON
        return value as unknown as T
      }
    } catch (error) {
      return null
    }
  },

  /**
   * Set value with automatic JSON stringification
   */
  async set(key: string, value: unknown, ttl?: number): Promise<boolean> {
    const client = getRedisClient()
    if (!client) return false

    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value)

      if (ttl) {
        await client.setex(key, ttl, serialized)
      } else {
        await client.set(key, serialized)
      }

      return true
    } catch (error) {
      return false
    }
  },

  /**
   * Delete key(s)
   */
  async del(...keys: string[]): Promise<number> {
    const client = getRedisClient()
    if (!client) return 0

    try {
      return await client.del(...keys)
    } catch (error) {
      return 0
    }
  },

  /**
   * Check if key exists
   */
  async exists(...keys: string[]): Promise<boolean> {
    const client = getRedisClient()
    if (!client) return false

    try {
      const count = await client.exists(...keys)
      return count > 0
    } catch (error) {
      return false
    }
  },

  /**
   * Set expiration on key
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    const client = getRedisClient()
    if (!client) return false

    try {
      const result = await client.expire(key, seconds)
      return result === 1
    } catch (error) {
      return false
    }
  },

  /**
   * Increment counter
   */
  async incr(key: string): Promise<number | null> {
    const client = getRedisClient()
    if (!client) return null

    try {
      return await client.incr(key)
    } catch (error) {
      return null
    }
  },

  /**
   * Add to set
   */
  async sadd(key: string, ...members: string[]): Promise<number> {
    const client = getRedisClient()
    if (!client) return 0

    try {
      return await client.sadd(key, ...members)
    } catch (error) {
      return 0
    }
  },

  /**
   * Get set members
   */
  async smembers(key: string): Promise<string[]> {
    const client = getRedisClient()
    if (!client) return []

    try {
      return await client.smembers(key)
    } catch (error) {
      return []
    }
  },

  /**
   * Hash operations
   */
  hash: {
    async set(key: string, field: string, value: unknown): Promise<boolean> {
      const client = getRedisClient()
      if (!client) return false

      try {
        const serialized = typeof value === 'string' ? value : JSON.stringify(value)
        await client.hset(key, field, serialized)
        return true
      } catch (error) {
        return false
      }
    },

    async get<T = unknown>(key: string, field: string): Promise<T | null> {
      const client = getRedisClient()
      if (!client) return null

      try {
        const value = await client.hget(key, field)
        if (!value) return null

        try {
          return JSON.parse(value) as T
        } catch {
          return value as unknown as T
        }
      } catch (error) {
        return null
      }
    },

    async getAll<T = unknown>(key: string): Promise<Record<string, T>> {
      const client = getRedisClient()
      if (!client) return {}

      try {
        const hash = await client.hgetall(key)
        const result: Record<string, T> = {}

        for (const [field, value] of Object.entries(hash)) {
          try {
            result[field] = JSON.parse(value) as T
          } catch {
            result[field] = value as unknown as T
          }
        }

        return result
      } catch (error) {
        return {}
      }
    },
  },
}
