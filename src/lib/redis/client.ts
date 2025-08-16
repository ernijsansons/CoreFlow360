/**
 * CoreFlow360 - Redis Client Configuration
 * Centralized Redis connection and utilities
 */

import { Redis } from 'ioredis'

// Redis connection options
const redisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryStrategy: (times: number) => {
    // Exponential backoff with max 3 seconds
    return Math.min(times * 50, 3000)
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  connectTimeout: 10000,
  lazyConnect: true // Don't connect until first command
}

// Create singleton Redis client
let redisClient: Redis | null = null

/**
 * Get or create Redis client instance
 */
export function getRedisClient(): Redis | null {
  if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
    console.warn('Redis not configured - caching disabled')
    return null
  }
  
  if (!redisClient) {
    try {
      if (process.env.REDIS_URL) {
        redisClient = new Redis(process.env.REDIS_URL)
      } else {
        redisClient = new Redis(redisOptions)
      }
      
      // Event handlers
      redisClient.on('connect', () => {
        console.log('Redis client connected')
      })
      
      redisClient.on('error', (error) => {
        console.error('Redis client error:', error)
      })
      
      redisClient.on('close', () => {
        console.log('Redis client connection closed')
      })
      
      // Ping to verify connection
      redisClient.ping().catch((error) => {
        console.error('Redis ping failed:', error)
        redisClient = null
      })
    } catch (error) {
      console.error('Failed to create Redis client:', error)
      return null
    }
  }
  
  return redisClient
}

/**
 * Close Redis connection
 */
export async function closeRedis() {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
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
  ANALYTICS: 'analytics:'
} as const

/**
 * Default TTL values (in seconds)
 */
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
  WEEK: 604800 // 7 days
} as const

/**
 * Safe Redis operations with error handling
 */
export const redis = {
  /**
   * Get value with automatic JSON parsing
   */
  async get<T = any>(key: string): Promise<T | null> {
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
      console.error(`Redis GET error for key ${key}:`, error)
      return null
    }
  },
  
  /**
   * Set value with automatic JSON stringification
   */
  async set(key: string, value: any, ttl?: number): Promise<boolean> {
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
      console.error(`Redis SET error for key ${key}:`, error)
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
      console.error('Redis DEL error:', error)
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
      console.error('Redis EXISTS error:', error)
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
      console.error(`Redis EXPIRE error for key ${key}:`, error)
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
      console.error(`Redis INCR error for key ${key}:`, error)
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
      console.error(`Redis SADD error for key ${key}:`, error)
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
      console.error(`Redis SMEMBERS error for key ${key}:`, error)
      return []
    }
  },
  
  /**
   * Hash operations
   */
  hash: {
    async set(key: string, field: string, value: any): Promise<boolean> {
      const client = getRedisClient()
      if (!client) return false
      
      try {
        const serialized = typeof value === 'string' ? value : JSON.stringify(value)
        await client.hset(key, field, serialized)
        return true
      } catch (error) {
        console.error(`Redis HSET error for ${key}:${field}:`, error)
        return false
      }
    },
    
    async get<T = any>(key: string, field: string): Promise<T | null> {
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
        console.error(`Redis HGET error for ${key}:${field}:`, error)
        return null
      }
    },
    
    async getAll<T = any>(key: string): Promise<Record<string, T>> {
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
        console.error(`Redis HGETALL error for ${key}:`, error)
        return {}
      }
    }
  }
}