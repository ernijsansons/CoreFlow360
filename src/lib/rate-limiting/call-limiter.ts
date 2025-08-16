/**
 * CoreFlow360 - Call-Specific Rate Limiter
 * Specialized rate limiting for Twilio voice calls with cost controls
 */

import { Redis } from 'ioredis'

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_CALL_LIMIT_DB || '2'),
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 50,
  lazyConnect: true
})

interface CallRateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  retryAfter: number
  costRemaining?: number
  reason?: string
}

interface CallLimitConfig {
  maxCallsPerMinute: number
  maxCallsPerHour: number  
  maxDailyCalls: number
  maxDailyCost: number
  maxConcurrentCalls: number
  costPerCall: number
}

/**
 * Call rate limiter with cost controls and intelligent throttling
 */
export class CallRateLimiter {
  private defaultConfig: CallLimitConfig = {
    maxCallsPerMinute: parseInt(process.env.VOICE_CALLS_PER_MINUTE || '10'),
    maxCallsPerHour: parseInt(process.env.VOICE_CALLS_PER_HOUR || '100'),
    maxDailyCalls: parseInt(process.env.VOICE_CALLS_PER_DAY || '1000'),
    maxDailyCost: parseFloat(process.env.VOICE_DAILY_BUDGET_LIMIT || '100'),
    maxConcurrentCalls: parseInt(process.env.VOICE_MAX_CONCURRENT_CALLS || '5'),
    costPerCall: parseFloat(process.env.VOICE_AVERAGE_COST_PER_CALL || '0.40')
  }

  /**
   * Check if call is allowed based on comprehensive rate limits
   */
  async checkCallLimit(
    tenantId: string, 
    priority: number = 3,
    customConfig?: Partial<CallLimitConfig>
  ): Promise<CallRateLimitResult> {
    const config = { ...this.defaultConfig, ...customConfig }
    
    try {
      // Run all checks in parallel for performance
      const [
        minuteCheck,
        hourCheck, 
        dailyCheck,
        costCheck,
        concurrencyCheck,
        systemCheck
      ] = await Promise.all([
        this.checkTimeBasedLimit(tenantId, 'minute', config.maxCallsPerMinute, priority),
        this.checkTimeBasedLimit(tenantId, 'hour', config.maxCallsPerHour, priority),
        this.checkTimeBasedLimit(tenantId, 'day', config.maxDailyCalls, priority),
        this.checkCostLimit(tenantId, config.maxDailyCost, config.costPerCall),
        this.checkConcurrencyLimit(tenantId, config.maxConcurrentCalls),
        this.checkSystemHealth()
      ])

      // Find the most restrictive result
      const checks = [minuteCheck, hourCheck, dailyCheck, costCheck, concurrencyCheck, systemCheck]
      const blockedCheck = checks.find(check => !check.allowed)
      
      if (blockedCheck) {
        return blockedCheck
      }
      
      // All checks passed - return the most restrictive remaining count
      const minRemaining = Math.min(...checks.map(c => c.remaining))
      
      return {
        allowed: true,
        remaining: minRemaining,
        resetTime: Math.max(...checks.map(c => c.resetTime)),
        retryAfter: 0,
        costRemaining: costCheck.costRemaining
      }
      
    } catch (error) {
      console.error('Call rate limit check error:', error)
      
      // Fail closed for calls - better to miss a call than exceed limits
      return {
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 60000,
        retryAfter: 60,
        reason: 'rate_limit_check_error'
      }
    }
  }

  /**
   * Check time-based rate limits (minute/hour/day)
   */
  private async checkTimeBasedLimit(
    tenantId: string,
    window: 'minute' | 'hour' | 'day',
    maxCalls: number,
    priority: number
  ): Promise<CallRateLimitResult> {
    const windowMs = {
      minute: 60 * 1000,
      hour: 60 * 60 * 1000, 
      day: 24 * 60 * 60 * 1000
    }[window]
    
    const key = `call_limit:${tenantId}:${window}`
    const now = Date.now()
    const windowStart = now - windowMs

    // Priority adjustment - high priority gets 20% more capacity
    const adjustedMax = priority <= 2 ? Math.floor(maxCalls * 1.2) : maxCalls

    const pipeline = redis.pipeline()
    
    // Remove expired entries
    pipeline.zremrangebyscore(key, 0, windowStart)
    
    // Count current calls in window
    pipeline.zcard(key)
    
    // Add current call
    pipeline.zadd(key, now, `${now}-${Math.random()}`)
    
    // Set expiry
    pipeline.expire(key, Math.ceil(windowMs / 1000))
    
    const results = await pipeline.exec()
    if (!results) throw new Error('Redis pipeline failed')

    const currentCount = results[1][1] as number
    const allowed = currentCount < adjustedMax

    return {
      allowed,
      remaining: Math.max(0, adjustedMax - currentCount - 1),
      resetTime: now + windowMs,
      retryAfter: allowed ? 0 : Math.ceil((windowStart + windowMs - now) / 1000),
      reason: allowed ? undefined : `${window}_limit_exceeded`
    }
  }

  /**
   * Check daily cost limits
   */
  private async checkCostLimit(
    tenantId: string,
    maxDailyCost: number,
    costPerCall: number
  ): Promise<CallRateLimitResult> {
    const key = `call_cost:${tenantId}:daily`
    const now = Date.now()
    const dayStart = new Date().setHours(0, 0, 0, 0)
    const dayEnd = dayStart + (24 * 60 * 60 * 1000)

    // Get current daily spend
    const currentSpend = await redis.get(key)
    const dailySpend = parseFloat(currentSpend || '0')
    
    // Check if adding this call would exceed budget
    const projectedSpend = dailySpend + costPerCall
    const allowed = projectedSpend <= maxDailyCost

    if (allowed) {
      // Reserve cost for this call
      await redis.setex(key, Math.ceil((dayEnd - now) / 1000), projectedSpend.toString())
    }

    return {
      allowed,
      remaining: Math.floor((maxDailyCost - projectedSpend) / costPerCall),
      resetTime: dayEnd,
      retryAfter: allowed ? 0 : Math.ceil((dayEnd - now) / 1000),
      costRemaining: Math.max(0, maxDailyCost - projectedSpend),
      reason: allowed ? undefined : 'daily_budget_exceeded'
    }
  }

  /**
   * Check concurrent call limits
   */
  private async checkConcurrencyLimit(
    tenantId: string,
    maxConcurrent: number
  ): Promise<CallRateLimitResult> {
    const key = `active_calls:${tenantId}`
    const activeCount = await redis.scard(key)
    
    const allowed = activeCount < maxConcurrent

    return {
      allowed,
      remaining: Math.max(0, maxConcurrent - activeCount - (allowed ? 1 : 0)),
      resetTime: Date.now() + (5 * 60 * 1000), // Assume calls last 5 minutes on average
      retryAfter: allowed ? 0 : 60, // Retry in 1 minute
      reason: allowed ? undefined : 'concurrent_limit_exceeded'
    }
  }

  /**
   * Check system-wide health
   */
  private async checkSystemHealth(): Promise<CallRateLimitResult> {
    // Check if emergency mode is enabled
    const emergencyMode = await redis.get('system:emergency_mode')
    if (emergencyMode) {
      const data = JSON.parse(emergencyMode)
      return {
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + (5 * 60 * 1000),
        retryAfter: 300,
        reason: `emergency_mode:${data.reason}`
      }
    }

    // Check total system load
    const totalActiveCalls = await redis.eval(`
      local total = 0
      for i, key in ipairs(redis.call('KEYS', 'active_calls:*')) do
        total = total + redis.call('SCARD', key)
      end
      return total
    `, 0) as number

    const systemMaxCalls = parseInt(process.env.VOICE_SYSTEM_MAX_CALLS || '100')
    const allowed = totalActiveCalls < systemMaxCalls

    return {
      allowed,
      remaining: Math.max(0, systemMaxCalls - totalActiveCalls - (allowed ? 1 : 0)),
      resetTime: Date.now() + (10 * 60 * 1000),
      retryAfter: allowed ? 0 : 120,
      reason: allowed ? undefined : 'system_overload'
    }
  }

  /**
   * Record call start
   */
  async recordCallStart(tenantId: string, callSid: string, cost: number = 0): Promise<void> {
    const pipeline = redis.pipeline()
    
    // Track active call
    pipeline.sadd(`active_calls:${tenantId}`, callSid)
    pipeline.expire(`active_calls:${tenantId}`, 3600) // 1 hour max
    
    // Track cost if provided
    if (cost > 0) {
      const costKey = `call_cost:${tenantId}:daily`
      pipeline.incrbyfloat(costKey, cost)
      
      // Set expiry to end of day
      const now = Date.now()
      const dayEnd = new Date().setHours(23, 59, 59, 999)
      pipeline.expire(costKey, Math.ceil((dayEnd - now) / 1000))
    }
    
    await pipeline.exec()
  }

  /**
   * Record call completion
   */
  async recordCallCompletion(
    tenantId: string, 
    callSid: string, 
    actualCost: number = 0,
    success: boolean = true
  ): Promise<void> {
    const pipeline = redis.pipeline()
    
    // Remove from active calls
    pipeline.srem(`active_calls:${tenantId}`, callSid)
    
    // Update actual cost
    if (actualCost > 0) {
      const costKey = `call_cost:${tenantId}:daily`
      pipeline.incrbyfloat(costKey, actualCost)
    }
    
    // Track success metrics for adaptive limiting
    const successKey = `call_success:${tenantId}`
    if (success) {
      pipeline.hincrby(successKey, 'successful', 1)
    }
    pipeline.hincrby(successKey, 'total', 1)
    pipeline.expire(successKey, 86400) // 24 hour window
    
    await pipeline.exec()
  }

  /**
   * Get comprehensive rate limit status
   */
  async getStatus(tenantId: string): Promise<{
    minute: { current: number; limit: number; remaining: number }
    hour: { current: number; limit: number; remaining: number }
    day: { current: number; limit: number; remaining: number }
    cost: { spent: number; limit: number; remaining: number }
    concurrent: { active: number; limit: number; remaining: number }
    success: { rate: number; recent: number }
  }> {
    const now = Date.now()
    
    const [
      minuteCount,
      hourCount,
      dayCount,
      dailyCost,
      activeCount,
      successMetrics
    ] = await Promise.all([
      redis.zcount(`call_limit:${tenantId}:minute`, now - 60000, now),
      redis.zcount(`call_limit:${tenantId}:hour`, now - 3600000, now),
      redis.zcount(`call_limit:${tenantId}:day`, now - 86400000, now),
      redis.get(`call_cost:${tenantId}:daily`),
      redis.scard(`active_calls:${tenantId}`),
      redis.hmget(`call_success:${tenantId}`, 'successful', 'total')
    ])

    const spent = parseFloat(dailyCost || '0')
    const successful = parseInt(successMetrics[0] || '0')
    const total = parseInt(successMetrics[1] || '0')
    const successRate = total > 0 ? successful / total : 1.0

    return {
      minute: {
        current: minuteCount,
        limit: this.defaultConfig.maxCallsPerMinute,
        remaining: Math.max(0, this.defaultConfig.maxCallsPerMinute - minuteCount)
      },
      hour: {
        current: hourCount,
        limit: this.defaultConfig.maxCallsPerHour,
        remaining: Math.max(0, this.defaultConfig.maxCallsPerHour - hourCount)
      },
      day: {
        current: dayCount,
        limit: this.defaultConfig.maxDailyCalls,
        remaining: Math.max(0, this.defaultConfig.maxDailyCalls - dayCount)
      },
      cost: {
        spent,
        limit: this.defaultConfig.maxDailyCost,
        remaining: Math.max(0, this.defaultConfig.maxDailyCost - spent)
      },
      concurrent: {
        active: activeCount,
        limit: this.defaultConfig.maxConcurrentCalls,
        remaining: Math.max(0, this.defaultConfig.maxConcurrentCalls - activeCount)
      },
      success: {
        rate: successRate,
        recent: total
      }
    }
  }

  /**
   * Emergency brake - pause all calling for tenant
   */
  async pauseCalling(tenantId: string, reason: string, duration: number = 300): Promise<void> {
    const key = `call_pause:${tenantId}`
    await redis.setex(key, duration, JSON.stringify({
      paused: true,
      reason,
      pausedAt: Date.now()
    }))
    
    console.warn(`🛑 Calling paused for tenant ${tenantId}: ${reason}`)
  }

  /**
   * Check if calling is paused for tenant
   */
  async isCallingPaused(tenantId: string): Promise<boolean> {
    const key = `call_pause:${tenantId}`
    const result = await redis.get(key)
    return !!result
  }

  /**
   * Resume calling for tenant
   */
  async resumeCalling(tenantId: string): Promise<void> {
    const key = `call_pause:${tenantId}`
    await redis.del(key)
    console.log(`▶️ Calling resumed for tenant ${tenantId}`)
  }
}

// Export singleton instance
export const callRateLimiter = new CallRateLimiter()

// Alias for compatibility
export const rateLimiter = callRateLimiter