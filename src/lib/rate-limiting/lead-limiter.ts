/**
 * CoreFlow360 - Rate Limiting System
 * Advanced rate limiting for lead ingestion and call processing
 */

import { Redis } from 'ioredis'

// Skip initialization during build
const isBuildTime = () => process.env.VERCEL || process.env.CI || process.env.NEXT_PHASE === 'phase-production-build' || process.env.VERCEL_ENV === 'preview'

// Lazy Redis connection
let redis: Redis | null = null

function getRedisConnection(): Redis | null {
  if (isBuildTime()) {
    return null
  }
  
  if (!redis) {
    redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_RATE_LIMIT_DB || '1'),
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 50,
      lazyConnect: true,
      enableOfflineQueue: false
    })
  }
  
  return redis
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  retryAfter: number
}

interface RateLimitConfig {
  max: number
  window: number // in seconds
  burst?: number // allow burst above limit
}

/**
 * Lead ingestion rate limiter
 */
export const rateLimiter = {
  /**
   * Check rate limit for lead webhook requests
   */
  async checkLimit(
    clientKey: string, 
    config: RateLimitConfig = { max: 100, window: 60 }
  ): Promise<RateLimitResult> {
    const key = `rate_limit:leads:${clientKey}`
    const now = Date.now()
    const window = config.window * 1000 // Convert to milliseconds
    const windowStart = now - window

    const connection = getRedisConnection()
    if (!connection) {
      // Fallback when Redis not available - allow requests
      return {
        allowed: true,
        remaining: config.max,
        resetTime: now + window,
        retryAfter: 0
      }
    }

    try {
      // Use Redis pipeline for atomic operations
      const pipeline = connection.pipeline()
      
      // Remove old entries
      pipeline.zremrangebyscore(key, 0, windowStart)
      
      // Count current requests in window
      pipeline.zcard(key)
      
      // Add current request
      pipeline.zadd(key, now, `${now}-${Math.random()}`)
      
      // Set expiry
      pipeline.expire(key, config.window)
      
      const results = await pipeline.exec()
      
      if (!results) {
        throw new Error('Redis pipeline failed')
      }

      const currentCount = results[1][1] as number
      const allowed = currentCount < config.max

      // Handle burst capacity
      if (!allowed && config.burst && currentCount < (config.max + config.burst)) {
        // Allow burst but with shorter window
        const burstKey = `rate_limit:burst:leads:${clientKey}`
        const burstCount = await connection.incr(burstKey)
        await connection.expire(burstKey, 10) // 10 second burst window
        
        if (burstCount <= config.burst) {
          return {
            allowed: true,
            remaining: config.burst - burstCount,
            resetTime: now + (10 * 1000),
            retryAfter: 0
          }
        }
      }

      const resetTime = now + window
      const retryAfter = allowed ? 0 : Math.ceil((windowStart + window - now) / 1000)

      return {
        allowed,
        remaining: Math.max(0, config.max - currentCount - 1),
        resetTime,
        retryAfter
      }

    } catch (error) {
      console.error('Rate limit check error:', error)
      // Fail open - allow request if Redis is down
      return {
        allowed: true,
        remaining: config.max,
        resetTime: now + (config.window * 1000),
        retryAfter: 0
      }
    }
  },

  /**
   * Check call limits with tiered restrictions
   */
  async checkCallLimit(
    tenantId: string,
    priority: number = 3
  ): Promise<RateLimitResult> {
    const configs = {
      // Per-minute limits
      minute: { max: parseInt(process.env.VOICE_CALLS_PER_MINUTE || '10'), window: 60 },
      // Per-hour limits  
      hour: { max: parseInt(process.env.VOICE_CALLS_PER_HOUR || '100'), window: 3600 },
      // Daily limits
      day: { max: parseInt(process.env.VOICE_CALLS_PER_DAY || '1000'), window: 86400 }
    }

    // Priority adjustments (higher priority = more lenient limits)
    const priorityMultiplier = priority <= 2 ? 1.5 : 1.0

    try {
      // Check all time windows
      const [minuteResult, hourResult, dayResult] = await Promise.all([
        this.checkTenantLimit(tenantId, 'minute', {
          ...configs.minute,
          max: Math.floor(configs.minute.max * priorityMultiplier)
        }),
        this.checkTenantLimit(tenantId, 'hour', {
          ...configs.hour, 
          max: Math.floor(configs.hour.max * priorityMultiplier)
        }),
        this.checkTenantLimit(tenantId, 'day', {
          ...configs.day,
          max: Math.floor(configs.day.max * priorityMultiplier)
        })
      ])

      // Return most restrictive result
      const results = [minuteResult, hourResult, dayResult]
      const blockedResult = results.find(r => !r.allowed)
      
      return blockedResult || minuteResult

    } catch (error) {
      console.error('Call rate limit check error:', error)
      // Fail closed for calls - don't allow if error
      return {
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 60000,
        retryAfter: 60
      }
    }
  },

  /**
   * Check tenant-specific limits
   */
  async checkTenantLimit(
    tenantId: string,
    window: 'minute' | 'hour' | 'day',
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const key = `rate_limit:calls:${tenantId}:${window}`
    const now = Date.now()
    const windowMs = config.window * 1000
    const windowStart = now - windowMs

    const connection = getRedisConnection()
    if (!connection) {
      // Fallback when Redis not available
      return {
        allowed: true,
        remaining: config.max,
        resetTime: now + windowMs,
        retryAfter: 0
      }
    }

    const pipeline = connection.pipeline()
    
    // Remove old entries
    pipeline.zremrangebyscore(key, 0, windowStart)
    
    // Count current calls
    pipeline.zcard(key)
    
    // Add current call attempt
    pipeline.zadd(key, now, `${now}-${Math.random()}`)
    
    // Set expiry
    pipeline.expire(key, config.window)
    
    const results = await pipeline.exec()
    
    if (!results) {
      throw new Error('Redis pipeline failed')
    }

    const currentCount = results[1][1] as number
    const allowed = currentCount < config.max

    return {
      allowed,
      remaining: Math.max(0, config.max - currentCount - 1),
      resetTime: now + windowMs,
      retryAfter: allowed ? 0 : Math.ceil((windowStart + windowMs - now) / 1000)
    }
  },

  /**
   * Get current rate limit status
   */
  async getStatus(tenantId: string) {
    const now = Date.now()
    
    const connection = getRedisConnection()
    if (!connection) {
      return {
        minute: {
          current: 0,
          limit: parseInt(process.env.VOICE_CALLS_PER_MINUTE || '10'),
          remaining: parseInt(process.env.VOICE_CALLS_PER_MINUTE || '10')
        },
        hour: {
          current: 0,
          limit: parseInt(process.env.VOICE_CALLS_PER_HOUR || '100'),
          remaining: parseInt(process.env.VOICE_CALLS_PER_HOUR || '100')
        },
        day: {
          current: 0,
          limit: parseInt(process.env.VOICE_CALLS_PER_DAY || '1000'),
          remaining: parseInt(process.env.VOICE_CALLS_PER_DAY || '1000')
        }
      }
    }
    
    const [minuteCount, hourCount, dayCount] = await Promise.all([
      connection.zcount(`rate_limit:calls:${tenantId}:minute`, now - 60000, now),
      connection.zcount(`rate_limit:calls:${tenantId}:hour`, now - 3600000, now), 
      connection.zcount(`rate_limit:calls:${tenantId}:day`, now - 86400000, now)
    ])

    return {
      minute: {
        current: minuteCount,
        limit: parseInt(process.env.VOICE_CALLS_PER_MINUTE || '10'),
        remaining: Math.max(0, parseInt(process.env.VOICE_CALLS_PER_MINUTE || '10') - minuteCount)
      },
      hour: {
        current: hourCount,
        limit: parseInt(process.env.VOICE_CALLS_PER_HOUR || '100'),
        remaining: Math.max(0, parseInt(process.env.VOICE_CALLS_PER_HOUR || '100') - hourCount)
      },
      day: {
        current: dayCount,
        limit: parseInt(process.env.VOICE_CALLS_PER_DAY || '1000'),
        remaining: Math.max(0, parseInt(process.env.VOICE_CALLS_PER_DAY || '1000') - dayCount)
      }
    }
  },

  /**
   * Adaptive rate limiting based on success rates
   */
  async checkAdaptiveLimit(tenantId: string): Promise<RateLimitResult> {
    try {
      // Get recent call success rate
      const successRate = await this.getCallSuccessRate(tenantId)
      
      // Adjust limits based on success rate
      let multiplier = 1.0
      if (successRate > 0.9) multiplier = 1.2      // Increase limit for high success
      else if (successRate > 0.7) multiplier = 1.0  // Normal limit
      else if (successRate > 0.5) multiplier = 0.8  // Reduce limit for poor success  
      else multiplier = 0.5                          // Heavily restrict for very poor success

      return await this.checkCallLimit(tenantId, 3)
      
    } catch (error) {
      console.error('Adaptive rate limit check error:', error)
      // Fall back to standard rate limiting
      return await this.checkCallLimit(tenantId)
    }
  },

  /**
   * Get call success rate for adaptive limiting
   */
  async getCallSuccessRate(tenantId: string): Promise<number> {
    const key = `call_success:${tenantId}`
    
    const connection = getRedisConnection()
    if (!connection) {
      return 1.0 // Default to perfect if no Redis
    }
    
    const results = await connection.hmget(key, 'successful', 'total')
    
    const successful = parseInt(results[0] || '0')
    const total = parseInt(results[1] || '0')
    
    return total > 0 ? successful / total : 1.0 // Default to perfect if no data
  },

  /**
   * Update call success metrics
   */
  async recordCallResult(tenantId: string, success: boolean): Promise<void> {
    const key = `call_success:${tenantId}`
    
    const connection = getRedisConnection()
    if (!connection) {
      return
    }
    
    const pipeline = connection.pipeline()
    
    if (success) {
      pipeline.hincrby(key, 'successful', 1)
    }
    pipeline.hincrby(key, 'total', 1)
    pipeline.expire(key, 86400) // 24 hour window for success rate
    
    await pipeline.exec()
  }
}

/**
 * Call-specific rate limiter with intelligent queuing
 */
export const callLimiter = {
  /**
   * Check if call should be queued or processed immediately
   */
  async shouldQueue(
    tenantId: string, 
    priority: number,
    leadData: any
  ): Promise<{
    shouldQueue: boolean
    queuePosition?: number
    estimatedDelay?: number
    reason?: string
  }> {
    try {
      const connection = getRedisConnection()
      if (!connection) {
        return {
          shouldQueue: false,
          reason: 'redis_unavailable'
        }
      }
      
      // Check current queue depth
      const queueDepth = await connection.llen(`call_queue:${tenantId}`)
      
      // Check active calls
      const activeCalls = await connection.scard(`active_calls:${tenantId}`)
      
      // Get tenant limits
      const maxConcurrent = parseInt(process.env.VOICE_MAX_CONCURRENT_CALLS || '5')
      const maxQueue = parseInt(process.env.VOICE_MAX_QUEUE_SIZE || '50')
      
      // Priority calls get preferential treatment
      if (priority <= 2) {
        if (activeCalls < maxConcurrent) {
          return { shouldQueue: false }
        }
        
        // High priority can jump queue
        if (queueDepth < maxQueue) {
          return {
            shouldQueue: true,
            queuePosition: Math.floor(queueDepth / 2), // Jump to front half
            estimatedDelay: Math.floor(queueDepth / 2) * 30, // 30 seconds per call
            reason: 'high_priority_queued'
          }
        }
      }
      
      // Normal priority processing
      if (activeCalls < maxConcurrent && queueDepth === 0) {
        return { shouldQueue: false }
      }
      
      if (queueDepth >= maxQueue) {
        return {
          shouldQueue: true,
          queuePosition: -1,
          estimatedDelay: -1,
          reason: 'queue_full'
        }
      }
      
      return {
        shouldQueue: true,
        queuePosition: queueDepth,
        estimatedDelay: queueDepth * 45, // 45 seconds average call time
        reason: 'queue_processing'
      }
      
    } catch (error) {
      console.error('Queue check error:', error)
      // Default to queuing on error
      return {
        shouldQueue: true,
        queuePosition: 999,
        estimatedDelay: 300,
        reason: 'error_default_queue'
      }
    }
  },

  /**
   * Add call to processing queue
   */
  async enqueueCall(tenantId: string, callData: any): Promise<string> {
    const queueKey = `call_queue:${tenantId}`
    const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const connection = getRedisConnection()
    if (!connection) {
      throw new Error('Redis not available for enqueue')
    }
    
    await connection.lpush(queueKey, JSON.stringify({
      id: callId,
      ...callData,
      queuedAt: Date.now()
    }))
    
    return callId
  },

  /**
   * Process next call in queue
   */
  async dequeueCall(tenantId: string): Promise<any | null> {
    const queueKey = `call_queue:${tenantId}`
    
    const connection = getRedisConnection()
    if (!connection) {
      return null
    }
    
    const callData = await connection.rpop(queueKey)
    
    if (!callData) return null
    
    try {
      return JSON.parse(callData)
    } catch {
      return null
    }
  },

  /**
   * Track active call
   */
  async trackActiveCall(tenantId: string, callSid: string): Promise<void> {
    const activeKey = `active_calls:${tenantId}`
    
    const connection = getRedisConnection()
    if (!connection) {
      return
    }
    
    await connection.sadd(activeKey, callSid)
    await connection.expire(activeKey, 3600) // 1 hour max call duration
  },

  /**
   * Remove active call tracking
   */
  async removeActiveCall(tenantId: string, callSid: string): Promise<void> {
    const activeKey = `active_calls:${tenantId}`
    
    const connection = getRedisConnection()
    if (!connection) {
      return
    }
    
    await connection.srem(activeKey, callSid)
  }
}

/**
 * Global rate limiting utilities
 */
export const globalLimiter = {
  /**
   * System-wide emergency brake
   */
  async checkSystemLoad(): Promise<{ healthy: boolean; reason?: string }> {
    try {
      const connection = getRedisConnection()
      if (!connection) {
        return { healthy: true, reason: 'redis_unavailable' }
      }
      
      // Check Redis memory usage
      const memoryInfo = await connection.memory('usage')
      const memoryUsage = memoryInfo / (1024 * 1024) // Convert to MB
      const maxMemory = parseInt(process.env.REDIS_MAX_MEMORY_MB || '512')
      
      if (memoryUsage > maxMemory * 0.9) {
        return { healthy: false, reason: 'redis_memory_high' }
      }
      
      // Check total active calls across all tenants
      const totalActive = await connection.eval(`
        local total = 0
        for i, key in ipairs(redis.call('KEYS', 'active_calls:*')) do
          total = total + redis.call('SCARD', key)
        end
        return total
      `, 0) as number
      
      const maxSystemCalls = parseInt(process.env.VOICE_SYSTEM_MAX_CALLS || '100')
      
      if (totalActive > maxSystemCalls) {
        return { healthy: false, reason: 'system_overload' }
      }
      
      return { healthy: true }
      
    } catch (error) {
      console.error('System load check error:', error)
      return { healthy: false, reason: 'check_error' }
    }
  },

  /**
   * Enable emergency mode
   */
  async enableEmergencyMode(reason: string, duration: number = 300): Promise<void> {
    const key = 'system:emergency_mode'
    
    const connection = getRedisConnection()
    if (!connection) {
      console.warn('Cannot enable emergency mode - Redis unavailable')
      return
    }
    
    await connection.setex(key, duration, JSON.stringify({
      enabled: true,
      reason,
      enabledAt: Date.now()
    }))
    
    console.warn(`🚨 Emergency mode enabled: ${reason}`)
  },

  /**
   * Check if system is in emergency mode
   */
  async isEmergencyMode(): Promise<boolean> {
    const key = 'system:emergency_mode'
    
    const connection = getRedisConnection()
    if (!connection) {
      return false
    }
    
    const result = await connection.get(key)
    return !!result
  }
}