/**
 * CoreFlow360 - Enhanced Rate Limiting with Redis Cluster
 * 
 * Distributed rate limiting with sliding window, tenant isolation,
 * and adaptive throttling based on system load.
 */

import { NextRequest } from 'next/server'
import { createHash } from 'crypto'
import { getRedis } from '@/lib/redis/client'
import type { Redis } from 'ioredis'

// Rate limit strategies
export type RateLimitStrategy = 'sliding-window' | 'token-bucket' | 'leaky-bucket' | 'adaptive'

// Rate limit configuration
export interface EnhancedRateLimitConfig {
  strategy: RateLimitStrategy
  limit: number
  window: number // milliseconds
  burst?: number // for token bucket
  adaptiveThreshold?: number // system load threshold for adaptive
  blockDuration?: number // how long to block after limit exceeded
  tenantMultiplier?: Record<string, number> // different limits per tenant tier
  costFunction?: (request: NextRequest) => number // compute request cost
}

// Rate limit result
export interface EnhancedRateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  reset: number
  retryAfter?: number
  blocked?: boolean
  cost?: number
  metadata?: Record<string, any>
}

// Default configurations for different endpoints
export const ENHANCED_RATE_LIMITS = {
  auth: {
    strategy: 'sliding-window' as RateLimitStrategy,
    limit: 5,
    window: 15 * 60 * 1000, // 15 minutes
    blockDuration: 30 * 60 * 1000, // 30 minutes after limit
  },
  api: {
    strategy: 'token-bucket' as RateLimitStrategy,
    limit: 1000,
    window: 60 * 60 * 1000, // 1 hour
    burst: 50, // burst capacity
  },
  ai: {
    strategy: 'adaptive' as RateLimitStrategy,
    limit: 100,
    window: 60 * 1000, // 1 minute
    adaptiveThreshold: 0.8, // reduce limits at 80% CPU
    costFunction: (req: NextRequest) => {
      // AI requests have variable costs
      const body = req.body as any
      if (body?.model === 'gpt-4') return 10
      if (body?.model === 'gpt-3.5-turbo') return 3
      return 1
    }
  },
  upload: {
    strategy: 'leaky-bucket' as RateLimitStrategy,
    limit: 10,
    window: 60 * 60 * 1000, // 1 hour
    blockDuration: 60 * 60 * 1000, // 1 hour block
  },
  webhook: {
    strategy: 'sliding-window' as RateLimitStrategy,
    limit: 1000,
    window: 60 * 1000, // 1 minute
    tenantMultiplier: {
      trial: 0.5,
      basic: 1,
      professional: 2,
      enterprise: 5
    }
  }
}

/**
 * Enhanced rate limiter with Redis cluster support
 */
export class EnhancedRateLimiter {
  private localCache = new Map<string, { count: number; reset: number }>()
  
  /**
   * Get Redis client lazily
   */
  private getRedisClient(): Redis | null {
    return getRedis() as Redis | null
  }
  
  /**
   * Check rate limit
   */
  async check(
    key: string,
    config: EnhancedRateLimitConfig,
    context?: {
      tenantId?: string
      tenantTier?: string
      systemLoad?: number
    }
  ): Promise<EnhancedRateLimitResult> {
    try {
      // Adjust limit based on tenant tier
      let effectiveLimit = config.limit
      if (context?.tenantTier && config.tenantMultiplier?.[context.tenantTier]) {
        effectiveLimit = Math.floor(config.limit * config.tenantMultiplier[context.tenantTier])
      }
      
      // Apply strategy
      switch (config.strategy) {
        case 'sliding-window':
          return await this.slidingWindowCheck(key, effectiveLimit, config.window, config.blockDuration)
        
        case 'token-bucket':
          return await this.tokenBucketCheck(key, effectiveLimit, config.window, config.burst || effectiveLimit)
        
        case 'leaky-bucket':
          return await this.leakyBucketCheck(key, effectiveLimit, config.window)
        
        case 'adaptive':
          return await this.adaptiveCheck(key, effectiveLimit, config.window, {
            threshold: config.adaptiveThreshold || 0.8,
            systemLoad: context?.systemLoad || 0
          })
        
        default:
          return await this.slidingWindowCheck(key, effectiveLimit, config.window)
      }
    } catch (error) {
      console.error('Rate limit check error:', error)
      // Fail open to avoid blocking legitimate traffic
      return {
        allowed: true,
        limit: config.limit,
        remaining: config.limit,
        reset: Date.now() + config.window
      }
    }
  }
  
  /**
   * Sliding window rate limiting
   */
  private async slidingWindowCheck(
    key: string,
    limit: number,
    window: number,
    blockDuration?: number
  ): Promise<EnhancedRateLimitResult> {
    const now = Date.now()
    const windowStart = now - window
    
    const redis = this.getRedisClient()
    if (redis) {
      // Check if blocked
      const blockedUntil = await redis.get(`block:${key}`)
      if (blockedUntil && parseInt(blockedUntil) > now) {
        return {
          allowed: false,
          limit,
          remaining: 0,
          reset: parseInt(blockedUntil),
          blocked: true,
          retryAfter: Math.ceil((parseInt(blockedUntil) - now) / 1000)
        }
      }
      
      // Use Redis sorted set for sliding window
      const pipe = redis.pipeline()
      
      // Remove old entries
      pipe.zremrangebyscore(key, '-inf', windowStart)
      
      // Count current window
      pipe.zcard(key)
      
      // Add current request
      pipe.zadd(key, now, `${now}-${Math.random()}`)
      
      // Set expiry
      pipe.expire(key, Math.ceil(window / 1000))
      
      const results = await pipe.exec()
      const count = results?.[1]?.[1] as number || 0
      
      if (count >= limit) {
        // Block if configured
        if (blockDuration) {
          await redis.setex(`block:${key}`, Math.ceil(blockDuration / 1000), now + blockDuration)
        }
        
        return {
          allowed: false,
          limit,
          remaining: 0,
          reset: now + window,
          retryAfter: Math.ceil(window / 1000)
        }
      }
      
      return {
        allowed: true,
        limit,
        remaining: Math.max(0, limit - count - 1),
        reset: now + window
      }
    } else {
      // Fallback to local cache
      return this.localSlidingWindow(key, limit, window, now)
    }
  }
  
  /**
   * Token bucket rate limiting
   */
  private async tokenBucketCheck(
    key: string,
    limit: number,
    window: number,
    burst: number
  ): Promise<EnhancedRateLimitResult> {
    const now = Date.now()
    const refillRate = limit / window // tokens per millisecond
    
    const redis = this.getRedisClient()
    if (redis) {
      const bucketKey = `bucket:${key}`
      
      // Get current bucket state
      const bucketData = await redis.get(bucketKey)
      let tokens = burst
      let lastRefill = now
      
      if (bucketData) {
        const parsed = JSON.parse(bucketData)
        tokens = parsed.tokens
        lastRefill = parsed.lastRefill
        
        // Calculate tokens to add
        const elapsed = now - lastRefill
        const tokensToAdd = elapsed * refillRate
        tokens = Math.min(burst, tokens + tokensToAdd)
      }
      
      if (tokens < 1) {
        const timeToNextToken = (1 - tokens) / refillRate
        return {
          allowed: false,
          limit,
          remaining: 0,
          reset: now + timeToNextToken,
          retryAfter: Math.ceil(timeToNextToken / 1000)
        }
      }
      
      // Consume token
      tokens -= 1
      
      // Save bucket state
      await redis.setex(
        bucketKey,
        Math.ceil(window / 1000),
        JSON.stringify({ tokens, lastRefill: now })
      )
      
      return {
        allowed: true,
        limit,
        remaining: Math.floor(tokens),
        reset: now + window
      }
    } else {
      // Simplified local implementation
      return this.localTokenBucket(key, limit, window, burst, now)
    }
  }
  
  /**
   * Leaky bucket rate limiting
   */
  private async leakyBucketCheck(
    key: string,
    limit: number,
    window: number
  ): Promise<EnhancedRateLimitResult> {
    const now = Date.now()
    const leakRate = limit / window // requests leaked per millisecond
    
    const redis = this.getRedisClient()
    if (redis) {
      const bucketKey = `leaky:${key}`
      
      // Get current bucket state
      const bucketData = await redis.get(bucketKey)
      let volume = 0
      let lastLeak = now
      
      if (bucketData) {
        const parsed = JSON.parse(bucketData)
        volume = parsed.volume
        lastLeak = parsed.lastLeak
        
        // Calculate leaked volume
        const elapsed = now - lastLeak
        const leaked = elapsed * leakRate
        volume = Math.max(0, volume - leaked)
      }
      
      if (volume >= limit) {
        const timeToLeak = (volume - limit + 1) / leakRate
        return {
          allowed: false,
          limit,
          remaining: 0,
          reset: now + timeToLeak,
          retryAfter: Math.ceil(timeToLeak / 1000)
        }
      }
      
      // Add to bucket
      volume += 1
      
      // Save bucket state
      await redis.setex(
        bucketKey,
        Math.ceil(window / 1000),
        JSON.stringify({ volume, lastLeak: now })
      )
      
      return {
        allowed: true,
        limit,
        remaining: Math.floor(limit - volume),
        reset: now + window
      }
    } else {
      // Fallback to sliding window
      return this.localSlidingWindow(key, limit, window, now)
    }
  }
  
  /**
   * Adaptive rate limiting based on system load
   */
  private async adaptiveCheck(
    key: string,
    baseLimit: number,
    window: number,
    options: { threshold: number; systemLoad: number }
  ): Promise<EnhancedRateLimitResult> {
    // Adjust limit based on system load
    let adaptiveLimit = baseLimit
    if (options.systemLoad > options.threshold) {
      // Reduce limit proportionally to load over threshold
      const loadFactor = (1 - options.systemLoad) / (1 - options.threshold)
      adaptiveLimit = Math.max(1, Math.floor(baseLimit * loadFactor))
    }
    
    // Use sliding window with adaptive limit
    const result = await this.slidingWindowCheck(key, adaptiveLimit, window)
    
    return {
      ...result,
      metadata: {
        baseLimit,
        adaptiveLimit,
        systemLoad: options.systemLoad,
        threshold: options.threshold
      }
    }
  }
  
  /**
   * Local sliding window fallback
   */
  private localSlidingWindow(
    key: string,
    limit: number,
    window: number,
    now: number
  ): EnhancedRateLimitResult {
    const cached = this.localCache.get(key)
    
    if (cached && cached.reset > now) {
      if (cached.count >= limit) {
        return {
          allowed: false,
          limit,
          remaining: 0,
          reset: cached.reset,
          retryAfter: Math.ceil((cached.reset - now) / 1000)
        }
      }
      
      cached.count++
      return {
        allowed: true,
        limit,
        remaining: limit - cached.count,
        reset: cached.reset
      }
    }
    
    // New window
    this.localCache.set(key, { count: 1, reset: now + window })
    
    // Clean old entries periodically
    if (Math.random() < 0.01) {
      this.cleanLocalCache(now)
    }
    
    return {
      allowed: true,
      limit,
      remaining: limit - 1,
      reset: now + window
    }
  }
  
  /**
   * Local token bucket fallback
   */
  private localTokenBucket(
    key: string,
    limit: number,
    window: number,
    burst: number,
    now: number
  ): EnhancedRateLimitResult {
    // Simplified implementation using sliding window
    return this.localSlidingWindow(key, burst, window, now)
  }
  
  /**
   * Clean local cache
   */
  private cleanLocalCache(now: number) {
    for (const [key, value] of this.localCache.entries()) {
      if (value.reset < now) {
        this.localCache.delete(key)
      }
    }
  }
  
  /**
   * Reset rate limit for a key
   */
  async reset(key: string): Promise<void> {
    const redis = this.getRedisClient()
    if (redis) {
      await redis.del(key, `bucket:${key}`, `leaky:${key}`, `block:${key}`)
    }
    this.localCache.delete(key)
  }
  
  /**
   * Get current usage for a key
   */
  async getUsage(key: string, window: number): Promise<number> {
    const redis = this.getRedisClient()
    if (redis) {
      const windowStart = Date.now() - window
      const count = await redis.zcount(key, windowStart, '+inf')
      return count
    }
    
    const cached = this.localCache.get(key)
    return cached?.count || 0
  }
}

// Global rate limiter instance with lazy initialization
let _enhancedRateLimiter: EnhancedRateLimiter | null = null

// Lazy-loaded rate limiter to prevent build-time Redis connections
export function getEnhancedRateLimiter(): EnhancedRateLimiter {
  // Skip initialization during build
  if (process.env.VERCEL || process.env.CI || process.env.NEXT_PHASE === 'phase-production-build' || process.env.VERCEL_ENV === 'preview') {
    // Return a mock during build
    return {
      check: async () => ({
        allowed: true,
        limit: 1000,
        remaining: 1000,
        reset: Date.now() + 60000
      }),
      reset: async () => {},
      getUsage: async () => 0
    } as any
  }
  
  if (!_enhancedRateLimiter) {
    _enhancedRateLimiter = new EnhancedRateLimiter()
  }
  return _enhancedRateLimiter
}

// Export for backward compatibility
export const enhancedRateLimiter = new Proxy({} as EnhancedRateLimiter, {
  get(_target, prop) {
    const limiter = getEnhancedRateLimiter()
    return limiter[prop as keyof EnhancedRateLimiter]
  }
})

/**
 * Middleware helper for enhanced rate limiting
 */
export async function withEnhancedRateLimit(
  request: NextRequest,
  handler: () => Promise<Response>,
  config: EnhancedRateLimitConfig,
  context?: {
    tenantId?: string
    tenantTier?: string
  }
): Promise<Response> {
  // Generate rate limit key
  const key = generateRateLimitKey(request, context?.tenantId)
  
  // Check system load for adaptive strategies
  const systemLoad = await getSystemLoad()
  
  // Compute request cost if cost function provided
  const cost = config.costFunction ? config.costFunction(request) : 1
  
  // Check rate limit
  const result = await enhancedRateLimiter.check(key, config, {
    ...context,
    systemLoad
  })
  
  if (!result.allowed) {
    return createRateLimitResponse(result)
  }
  
  // Execute handler
  const response = await handler()
  
  // Add rate limit headers
  addRateLimitHeaders(response, result)
  
  return response
}

/**
 * Generate rate limit key
 */
function generateRateLimitKey(request: NextRequest, tenantId?: string): string {
  const userId = request.headers.get('x-user-id')
  const apiKey = request.headers.get('x-api-key')
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'unknown'
  
  // Hierarchical key generation
  if (apiKey) {
    return `api:${apiKey}`
  }
  
  if (userId && tenantId) {
    return `tenant:${tenantId}:user:${userId}`
  }
  
  if (userId) {
    return `user:${userId}`
  }
  
  // Hash IP for privacy
  const hashedIp = createHash('sha256').update(ip).digest('hex').substring(0, 16)
  return `ip:${hashedIp}`
}

/**
 * Get system load (placeholder - implement based on your monitoring)
 */
async function getSystemLoad(): Promise<number> {
  // In production, this would query your monitoring system
  // For now, return a mock value
  return 0.5
}

/**
 * Create rate limit response
 */
function createRateLimitResponse(result: EnhancedRateLimitResult): Response {
  const body = {
    error: 'Rate limit exceeded',
    message: result.blocked 
      ? 'Your access has been temporarily blocked due to excessive requests'
      : 'Too many requests. Please try again later.',
    limit: result.limit,
    remaining: result.remaining,
    reset: new Date(result.reset).toISOString(),
    retryAfter: result.retryAfter
  }
  
  return new Response(JSON.stringify(body), {
    status: 429,
    headers: {
      'Content-Type': 'application/json',
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': new Date(result.reset).toISOString(),
      'Retry-After': (result.retryAfter || 60).toString()
    }
  })
}

/**
 * Add rate limit headers to response
 */
function addRateLimitHeaders(response: Response, result: EnhancedRateLimitResult): void {
  response.headers.set('X-RateLimit-Limit', result.limit.toString())
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
  response.headers.set('X-RateLimit-Reset', new Date(result.reset).toISOString())
  
  if (result.metadata) {
    response.headers.set('X-RateLimit-Strategy', result.metadata.strategy || 'default')
  }
}