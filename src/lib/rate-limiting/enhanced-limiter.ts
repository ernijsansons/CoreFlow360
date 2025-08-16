/**
 * CoreFlow360 - Enhanced Rate Limiter
 * Advanced rate limiting with multiple time windows and Redis support
 */

import { Redis } from '@/lib/cache/unified-redis'

interface RateLimitConfig {
  perSecond?: number
  perMinute?: number
  perHour?: number
  perDay?: number
  burst?: number // Allow burst requests
  penalty?: number // Penalty duration in seconds for violations
}

interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  resetAt: Date
}

interface LimitExceeded {
  window: string
  limit: number
  current: number
  resetAt: Date
}

const RATE_LIMIT_PREFIX = 'ratelimit'

export class EnhancedRateLimiter {
  private redis: Redis | null
  private memoryCache: Map<string, { count: number; resetAt: number }>

  constructor(redis?: Redis) {
    this.redis = redis || null
    this.memoryCache = new Map()
  }

  /**
   * Check if a request is allowed under the rate limit
   */
  async checkLimit(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    // Check if user is penalized
    const penaltyKey = `${RATE_LIMIT_PREFIX}:penalty:${key}`
    const isPenalized = await this.isPenalized(penaltyKey)
    
    if (isPenalized) {
      const penaltyExpiry = await this.getPenaltyExpiry(penaltyKey)
      return {
        allowed: false,
        limit: 0,
        remaining: 0,
        resetAt: new Date(penaltyExpiry)
      }
    }

    // Check if user has exceeded any limits
    const exceededLimits = await this.checkLimits(key, config)
    
    if (exceededLimits.length > 0) {
      // Log rate limit violation
      console.warn(`Rate limit exceeded for ${key}:`, exceededLimits)
      
      // Track rate limit metrics
      this.trackRateLimitMetrics(key, false)
      
      // Apply penalty if configured
      if (config.penalty) {
        await this.applyPenalty(penaltyKey, config.penalty)
      }
      
      return {
        allowed: false,
        limit: exceededLimits[0].limit,
        remaining: 0,
        resetAt: exceededLimits[0].resetAt
      }
    }

    // All checks passed, increment counters
    await this.increment(key, config)
    
    // Track successful request
    this.trackRateLimitMetrics(key, true)
    
    // Calculate remaining requests (use the most restrictive limit)
    const allLimits = [
      ...(config.perSecond ? [{ window: 1, limit: config.perSecond }] : []),
      ...(config.perMinute ? [{ window: 60, limit: config.perMinute }] : []),
      ...(config.perHour ? [{ window: 3600, limit: config.perHour }] : []),
      ...(config.perDay ? [{ window: 86400, limit: config.perDay }] : [])
    ]

    let minRemaining = Infinity
    let activeLimit = 0
    let nextReset = new Date(Date.now() + 86400000) // Default to 1 day

    for (const { window, limit } of allLimits) {
      const count = await this.getCount(key, window)
      const remaining = limit - count
      const resetAt = new Date(Date.now() + window * 1000)
      
      if (remaining < minRemaining) {
        minRemaining = remaining
        activeLimit = limit
        nextReset = resetAt
      }
    }

    return {
      allowed: true,
      limit: activeLimit,
      remaining: Math.max(0, minRemaining),
      resetAt: nextReset
    }
  }

  /**
   * Check all configured limits
   */
  private async checkLimits(key: string, config: RateLimitConfig): Promise<LimitExceeded[]> {
    const exceeded: LimitExceeded[] = []

    // Check per-second limit
    if (config.perSecond) {
      const count = await this.getCount(key, 1)
      if (count >= config.perSecond) {
        exceeded.push({
          window: 'second',
          limit: config.perSecond,
          current: count,
          resetAt: new Date(Date.now() + 1000)
        })
      }
    }

    // Check per-minute limit
    if (config.perMinute) {
      const count = await this.getCount(key, 60)
      if (count >= config.perMinute) {
        exceeded.push({
          window: 'minute',
          limit: config.perMinute,
          current: count,
          resetAt: new Date(Date.now() + 60000)
        })
      }
    }

    // Check per-hour limit
    if (config.perHour) {
      const count = await this.getCount(key, 3600)
      if (count >= config.perHour) {
        exceeded.push({
          window: 'hour',
          limit: config.perHour,
          current: count,
          resetAt: new Date(Date.now() + 3600000)
        })
      }
    }

    // Check per-day limit
    if (config.perDay) {
      const count = await this.getCount(key, 86400)
      if (count >= config.perDay) {
        exceeded.push({
          window: 'day',
          limit: config.perDay,
          current: count,
          resetAt: new Date(Date.now() + 86400000)
        })
      }
    }

    return exceeded
  }

  /**
   * Get current count for a time window
   */
  private async getCount(key: string, windowSeconds: number): Promise<number> {
    const windowKey = `${RATE_LIMIT_PREFIX}:${key}:${windowSeconds}`
    
    try {
      if (this.redis) {
        const count = await this.redis.get(windowKey)
        return count ? parseInt(count, 10) : 0
      } else {
        // Fallback to memory cache
        const cached = this.memoryCache.get(windowKey)
        if (cached && cached.resetAt > Date.now()) {
          return cached.count
        }
        return 0
      }
    } catch (error) {
      console.error('Failed to get rate limit count:', error)
      return 0
    }
  }

  /**
   * Increment counter for all configured windows
   */
  private async increment(key: string, config: RateLimitConfig): Promise<void> {
    const windows = [
      ...(config.perSecond ? [1] : []),
      ...(config.perMinute ? [60] : []),
      ...(config.perHour ? [3600] : []),
      ...(config.perDay ? [86400] : [])
    ]

    for (const window of windows) {
      const windowKey = `${RATE_LIMIT_PREFIX}:${key}:${window}`
      
      try {
        if (this.redis) {
          // Use Redis INCR with expiry
          await this.redis.incr(windowKey)
          await this.redis.expire(windowKey, window)
        } else {
          // Fallback to memory cache
          const cached = this.memoryCache.get(windowKey) || { count: 0, resetAt: 0 }
          
          if (cached.resetAt <= Date.now()) {
            // Reset if expired
            cached.count = 1
            cached.resetAt = Date.now() + window * 1000
          } else {
            cached.count++
          }
          
          this.memoryCache.set(windowKey, cached)
        }
      } catch (error) {
        console.error('Failed to increment rate limit counter:', error)
      }
    }
  }

  /**
   * Check if user is penalized
   */
  private async isPenalized(penaltyKey: string): Promise<boolean> {
    try {
      if (this.redis) {
        const exists = await this.redis.exists(penaltyKey)
        return exists > 0
      } else {
        const cached = this.memoryCache.get(penaltyKey)
        return cached ? cached.resetAt > Date.now() : false
      }
    } catch (error) {
      console.error('Failed to check penalty status:', error)
      return false
    }
  }

  /**
   * Get penalty expiry time
   */
  private async getPenaltyExpiry(penaltyKey: string): Promise<number> {
    try {
      if (this.redis) {
        const ttl = await this.redis.ttl(penaltyKey)
        return Date.now() + ttl * 1000
      } else {
        const cached = this.memoryCache.get(penaltyKey)
        return cached ? cached.resetAt : Date.now()
      }
    } catch (error) {
      console.error('Failed to get penalty expiry:', error)
      return Date.now()
    }
  }

  /**
   * Apply penalty to user
   */
  private async applyPenalty(penaltyKey: string, durationSeconds: number): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.setex(penaltyKey, durationSeconds, '1')
      } else {
        this.memoryCache.set(penaltyKey, {
          count: 1,
          resetAt: Date.now() + durationSeconds * 1000
        })
      }
    } catch (error) {
      console.error('Failed to apply penalty:', error)
    }
  }

  /**
   * Track rate limit metrics for monitoring
   */
  private trackRateLimitMetrics(key: string, allowed: boolean) {
    // Extract user/endpoint info from key
    const [userId, endpoint] = key.split(':')
    
    // You could send these metrics to your monitoring system
    // For now, just log them
    if (!allowed) {
      console.log(`[RATE_LIMIT_METRIC] blocked request - user: ${userId}, endpoint: ${endpoint}`)
    }
  }

  /**
   * Clear all rate limit data for a key
   */
  async clear(key: string): Promise<void> {
    try {
      // Clear from Redis
      if (this.redis) {
        const pattern = `${RATE_LIMIT_PREFIX}:${key}:*`
        const keys = await this.redis.keys(pattern)
        if (keys.length > 0) {
          await this.redis.del(...keys)
        }
      }
      
      // Clear from memory cache
      const cacheKeys = Array.from(this.memoryCache.keys())
      cacheKeys
        .filter(k => k.startsWith(key))
        .forEach(k => this.memoryCache.delete(k))
    } catch (error) {
      console.error('Failed to clear rate limit data:', error)
    }
  }

  /**
   * Get rate limit status for a key (without incrementing)
   */
  async getStatus(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const exceededLimits = await this.checkLimits(key, config)
    
    if (exceededLimits.length > 0) {
      return {
        allowed: false,
        limit: exceededLimits[0].limit,
        remaining: 0,
        resetAt: exceededLimits[0].resetAt
      }
    }

    // Calculate remaining for the most restrictive limit
    const allLimits = [
      ...(config.perSecond ? [{ window: 1, limit: config.perSecond }] : []),
      ...(config.perMinute ? [{ window: 60, limit: config.perMinute }] : []),
      ...(config.perHour ? [{ window: 3600, limit: config.perHour }] : []),
      ...(config.perDay ? [{ window: 86400, limit: config.perDay }] : [])
    ]

    let minRemaining = Infinity
    let activeLimit = 0
    let nextReset = new Date(Date.now() + 86400000)

    for (const { window, limit } of allLimits) {
      const count = await this.getCount(key, window)
      const remaining = limit - count
      const resetAt = new Date(Date.now() + window * 1000)
      
      if (remaining < minRemaining) {
        minRemaining = remaining
        activeLimit = limit
        nextReset = resetAt
      }
    }

    return {
      allowed: true,
      limit: activeLimit,
      remaining: Math.max(0, minRemaining),
      resetAt: nextReset
    }
  }
}

// Export singleton instance
export const rateLimiter = new EnhancedRateLimiter()