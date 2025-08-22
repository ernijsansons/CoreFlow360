/**
 * CoreFlow360 - Advanced Rate Limiting System
 * Enterprise-grade rate limiting with tenant quotas, burst handling, and smart throttling
 */

import { getRedis } from '@/lib/redis/client'
import { advancedCache, CACHE_CONFIGS } from '@/lib/cache/advanced-cache'
import { productionMonitor } from '@/lib/monitoring/production-alerts'

// Rate limiting configurations
interface RateLimitConfig {
  requests: number // Max requests
  window: number // Time window in seconds
  burst?: number // Burst allowance
  backoff?: boolean // Enable exponential backoff
  skipSuccessfulRequests?: boolean // Only count failed requests
  skipFailedRequests?: boolean // Only count successful requests
  keyGenerator?: (identifier: string) => string // Custom key generation
  onLimitReached?: (identifier: string, limit: RateLimitConfig) => void
}

interface TenantQuota {
  apiCalls: number // API calls per month
  dataExport: number // Data export requests per day
  aiRequests: number // AI/ML requests per hour
  fileUploads: number // File uploads per day
  webhooks: number // Webhook calls per hour
  customFields?: Record<string, number> // Custom quota fields
}

interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  resetTime: number
  retryAfter?: number
  quotaExceeded?: boolean
  quotaType?: string
}

interface UsageMetrics {
  current: number
  limit: number
  percentage: number
  resetTime: number
  burst?: {
    used: number
    available: number
  }
}

// Subscription tier quotas
const SUBSCRIPTION_QUOTAS: Record<string, TenantQuota> = {
  FREE: {
    apiCalls: 1000, // per month
    dataExport: 5, // per day
    aiRequests: 10, // per hour
    fileUploads: 50, // per day
    webhooks: 100, // per hour
  },
  STARTER: {
    apiCalls: 10000,
    dataExport: 50,
    aiRequests: 100,
    fileUploads: 500,
    webhooks: 1000,
  },
  PROFESSIONAL: {
    apiCalls: 100000,
    dataExport: 500,
    aiRequests: 1000,
    fileUploads: 5000,
    webhooks: 10000,
  },
  ENTERPRISE: {
    apiCalls: 1000000,
    dataExport: 5000,
    aiRequests: 10000,
    fileUploads: 50000,
    webhooks: 100000,
  },
  UNLIMITED: {
    apiCalls: Number.MAX_SAFE_INTEGER,
    dataExport: Number.MAX_SAFE_INTEGER,
    aiRequests: Number.MAX_SAFE_INTEGER,
    fileUploads: Number.MAX_SAFE_INTEGER,
    webhooks: Number.MAX_SAFE_INTEGER,
  },
}

// Rate limit configurations for different endpoints
const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  // Authentication endpoints
  AUTH_LOGIN: {
    requests: 5,
    window: 900, // 15 minutes
    burst: 2,
    backoff: true,
    onLimitReached: (id) => console.warn(`Auth rate limit reached for ${id}`),
  },
  AUTH_REGISTER: {
    requests: 3,
    window: 3600, // 1 hour
    burst: 1,
    backoff: true,
  },
  AUTH_PASSWORD_RESET: {
    requests: 3,
    window: 3600, // 1 hour
    burst: 0,
  },

  // API endpoints
  API_READ: {
    requests: 1000,
    window: 3600, // 1 hour
    burst: 200,
    skipFailedRequests: true,
  },
  API_WRITE: {
    requests: 100,
    window: 3600, // 1 hour
    burst: 20,
  },
  API_DELETE: {
    requests: 10,
    window: 3600, // 1 hour
    burst: 2,
  },

  // AI/ML endpoints
  AI_CHAT: {
    requests: 50,
    window: 3600, // 1 hour
    burst: 10,
    skipSuccessfulRequests: true, // Only count failed AI requests
  },
  AI_GENERATION: {
    requests: 20,
    window: 3600, // 1 hour
    burst: 5,
  },
  AI_ANALYSIS: {
    requests: 100,
    window: 3600, // 1 hour
    burst: 20,
  },

  // File operations
  FILE_UPLOAD: {
    requests: 10,
    window: 900, // 15 minutes
    burst: 3,
  },
  FILE_DOWNLOAD: {
    requests: 100,
    window: 3600, // 1 hour
    burst: 20,
  },

  // Data operations
  DATA_EXPORT: {
    requests: 5,
    window: 86400, // 24 hours
    burst: 1,
  },
  DATA_IMPORT: {
    requests: 10,
    window: 86400, // 24 hours
    burst: 2,
  },

  // Webhooks
  WEBHOOK_RECEIVE: {
    requests: 1000,
    window: 3600, // 1 hour
    burst: 200,
  },
  WEBHOOK_SEND: {
    requests: 500,
    window: 3600, // 1 hour
    burst: 100,
  },

  // Admin operations
  ADMIN_OPERATIONS: {
    requests: 50,
    window: 3600, // 1 hour
    burst: 10,
  },

  // Search operations
  SEARCH: {
    requests: 200,
    window: 3600, // 1 hour
    burst: 50,
  },

  // Analytics
  ANALYTICS: {
    requests: 500,
    window: 3600, // 1 hour
    burst: 100,
  },
}

export class AdvancedRateLimiter {
  private static instance: AdvancedRateLimiter
  private redis = getRedis()
  private memoryStore = new Map<string, { count: number; resetTime: number; burst: number }>()

  constructor() {
    this.startCleanupRoutine()
  }

  static getInstance(): AdvancedRateLimiter {
    if (!AdvancedRateLimiter.instance) {
      AdvancedRateLimiter.instance = new AdvancedRateLimiter()
    }
    return AdvancedRateLimiter.instance
  }

  /**
   * Check rate limit for an identifier and endpoint
   */
  async checkRateLimit(
    identifier: string,
    endpoint: string,
    customConfig?: Partial<RateLimitConfig>
  ): Promise<RateLimitResult> {
    const config = { ...RATE_LIMIT_CONFIGS[endpoint], ...customConfig }
    if (!config) {
      throw new Error(`No rate limit configuration found for endpoint: ${endpoint}`)
    }

    const key = config.keyGenerator 
      ? config.keyGenerator(identifier) 
      : `rate_limit:${endpoint}:${identifier}`

    try {
      if (this.redis && this.redis.status === 'ready') {
        return await this.checkRateLimitRedis(key, config)
      } else {
        return this.checkRateLimitMemory(key, config)
      }
    } catch (error) {
      console.error('Rate limit check error:', error)
      // Fail open - allow request if rate limiter fails
      return {
        allowed: true,
        limit: config.requests,
        remaining: config.requests,
        resetTime: Date.now() + (config.window * 1000),
      }
    }
  }

  /**
   * Check tenant quota usage
   */
  async checkTenantQuota(
    tenantId: string,
    quotaType: keyof TenantQuota,
    subscriptionTier: string = 'FREE'
  ): Promise<RateLimitResult> {
    const quota = SUBSCRIPTION_QUOTAS[subscriptionTier.toUpperCase()]
    if (!quota) {
      throw new Error(`Unknown subscription tier: ${subscriptionTier}`)
    }

    const limit = quota[quotaType]
    if (limit === Number.MAX_SAFE_INTEGER) {
      // Unlimited quota
      return {
        allowed: true,
        limit,
        remaining: limit,
        resetTime: 0,
      }
    }

    const window = this.getQuotaWindow(quotaType)
    const key = `quota:${quotaType}:${tenantId}:${this.getWindowKey(window)}`

    try {
      const usage = await this.getUsage(key)
      const remaining = Math.max(0, limit - usage)
      const allowed = usage < limit

      if (!allowed) {
        // Log quota exceeded event
        await this.logQuotaEvent(tenantId, quotaType, usage, limit)
      }

      // Update usage if request is allowed
      if (allowed) {
        await this.incrementUsage(key, window)
      }

      return {
        allowed,
        limit,
        remaining,
        resetTime: this.getResetTime(window),
        quotaExceeded: !allowed,
        quotaType,
      }
    } catch (error) {
      console.error('Quota check error:', error)
      // Fail open for quota checks too
      return {
        allowed: true,
        limit,
        remaining: limit,
        resetTime: this.getResetTime(window),
      }
    }
  }

  /**
   * Get current usage metrics for an identifier
   */
  async getUsageMetrics(
    identifier: string,
    endpoint: string
  ): Promise<UsageMetrics> {
    const config = RATE_LIMIT_CONFIGS[endpoint]
    if (!config) {
      throw new Error(`No configuration found for endpoint: ${endpoint}`)
    }

    const key = `rate_limit:${endpoint}:${identifier}`
    const usage = await this.getUsage(key)
    const burstKey = `${key}:burst`
    const burstUsage = await this.getUsage(burstKey)

    return {
      current: usage,
      limit: config.requests,
      percentage: (usage / config.requests) * 100,
      resetTime: Date.now() + (config.window * 1000),
      burst: config.burst ? {
        used: burstUsage,
        available: config.burst - burstUsage,
      } : undefined,
    }
  }

  /**
   * Reset rate limit for an identifier
   */
  async resetRateLimit(
    identifier: string,
    endpoint: string
  ): Promise<boolean> {
    const key = `rate_limit:${endpoint}:${identifier}`
    
    try {
      if (this.redis) {
        await this.redis.del(key)
        await this.redis.del(`${key}:burst`)
      }
      
      this.memoryStore.delete(key)
      return true
    } catch (error) {
      console.error('Rate limit reset error:', error)
      return false
    }
  }

  /**
   * Get tenant usage summary across all quotas
   */
  async getTenantUsageSummary(
    tenantId: string,
    subscriptionTier: string = 'FREE'
  ): Promise<Record<string, UsageMetrics>> {
    const quota = SUBSCRIPTION_QUOTAS[subscriptionTier.toUpperCase()]
    if (!quota) {
      throw new Error(`Unknown subscription tier: ${subscriptionTier}`)
    }

    const summary: Record<string, UsageMetrics> = {}

    for (const [quotaType, limit] of Object.entries(quota)) {
      const window = this.getQuotaWindow(quotaType as keyof TenantQuota)
      const key = `quota:${quotaType}:${tenantId}:${this.getWindowKey(window)}`
      const usage = await this.getUsage(key)

      summary[quotaType] = {
        current: usage,
        limit,
        percentage: limit === Number.MAX_SAFE_INTEGER ? 0 : (usage / limit) * 100,
        resetTime: this.getResetTime(window),
      }
    }

    return summary
  }

  // Private methods

  private async checkRateLimitRedis(
    key: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const now = Date.now()
    const window = config.window * 1000
    const windowStart = now - window

    // Use Redis pipeline for atomic operations
    const pipeline = this.redis!.pipeline()
    
    // Remove expired entries
    pipeline.zremrangebyscore(key, '-inf', windowStart)
    
    // Count current requests
    pipeline.zcard(key)
    
    // Add current request
    pipeline.zadd(key, now, `${now}-${Math.random()}`)
    
    // Set expiration
    pipeline.expire(key, config.window)

    const results = await pipeline.exec()
    const currentCount = (results?.[1]?.[1] as number) || 0

    // Check burst allowance
    let burstAllowed = false
    if (config.burst && currentCount >= config.requests) {
      const burstKey = `${key}:burst`
      const burstCount = await this.redis!.incr(burstKey)
      await this.redis!.expire(burstKey, config.window)
      
      if (burstCount <= config.burst) {
        burstAllowed = true
      }
    }

    const allowed = currentCount <= config.requests || burstAllowed
    const remaining = Math.max(0, config.requests - currentCount)
    const resetTime = now + window

    // Apply backoff if configured and limit exceeded
    let retryAfter: number | undefined
    if (!allowed && config.backoff) {
      retryAfter = this.calculateBackoff(key, config)
    }

    // Trigger callback if limit reached
    if (!allowed && config.onLimitReached) {
      config.onLimitReached(key, config)
    }

    return {
      allowed,
      limit: config.requests,
      remaining,
      resetTime,
      retryAfter,
    }
  }

  private checkRateLimitMemory(
    key: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const now = Date.now()
    const window = config.window * 1000
    const entry = this.memoryStore.get(key)

    if (!entry || now > entry.resetTime) {
      // Reset or initialize counter
      this.memoryStore.set(key, {
        count: 1,
        resetTime: now + window,
        burst: 0,
      })

      return Promise.resolve({
        allowed: true,
        limit: config.requests,
        remaining: config.requests - 1,
        resetTime: now + window,
      })
    }

    entry.count++
    let allowed = entry.count <= config.requests

    // Check burst allowance
    if (!allowed && config.burst && entry.burst < config.burst) {
      entry.burst++
      allowed = true
    }

    const remaining = Math.max(0, config.requests - entry.count)
    let retryAfter: number | undefined

    if (!allowed && config.backoff) {
      retryAfter = this.calculateBackoff(key, config)
    }

    if (!allowed && config.onLimitReached) {
      config.onLimitReached(key, config)
    }

    return Promise.resolve({
      allowed,
      limit: config.requests,
      remaining,
      resetTime: entry.resetTime,
      retryAfter,
    })
  }

  private async getUsage(key: string): Promise<number> {
    try {
      if (this.redis) {
        const count = await this.redis.get(key)
        return count ? parseInt(count, 10) : 0
      } else {
        const entry = this.memoryStore.get(key)
        return entry?.count || 0
      }
    } catch (error) {
      console.error('Get usage error:', error)
      return 0
    }
  }

  private async incrementUsage(key: string, window: number): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.incr(key)
        await this.redis.expire(key, window)
      } else {
        const now = Date.now()
        const entry = this.memoryStore.get(key)
        if (entry && now <= entry.resetTime) {
          entry.count++
        } else {
          this.memoryStore.set(key, {
            count: 1,
            resetTime: now + (window * 1000),
            burst: 0,
          })
        }
      }
    } catch (error) {
      console.error('Increment usage error:', error)
    }
  }

  private getQuotaWindow(quotaType: keyof TenantQuota): number {
    switch (quotaType) {
      case 'apiCalls':
        return 30 * 24 * 3600 // 30 days
      case 'dataExport':
      case 'fileUploads':
        return 24 * 3600 // 24 hours
      case 'aiRequests':
      case 'webhooks':
        return 3600 // 1 hour
      default:
        return 3600 // Default to 1 hour
    }
  }

  private getWindowKey(window: number): string {
    const now = Date.now()
    return Math.floor(now / (window * 1000)).toString()
  }

  private getResetTime(window: number): number {
    const now = Date.now()
    const windowMs = window * 1000
    return Math.ceil(now / windowMs) * windowMs
  }

  private calculateBackoff(key: string, config: RateLimitConfig): number {
    // Simple exponential backoff
    const baseDelay = 1000 // 1 second
    const maxDelay = 60000 // 1 minute
    const attempt = 1 // Could track attempts in Redis/memory
    
    return Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
  }

  private async logQuotaEvent(
    tenantId: string,
    quotaType: string,
    usage: number,
    limit: number
  ): Promise<void> {
    try {
      // Log to monitoring system
      productionMonitor.recordMetric('quota_exceeded', 1)
      
      // Could also send to audit log, alert systems, etc.
      console.warn(`Quota exceeded for tenant ${tenantId}: ${quotaType} ${usage}/${limit}`)
    } catch (error) {
      console.error('Quota logging error:', error)
    }
  }

  private startCleanupRoutine(): void {
    // Clean up memory store every 5 minutes
    setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of this.memoryStore.entries()) {
        if (now > entry.resetTime) {
          this.memoryStore.delete(key)
        }
      }
    }, 5 * 60 * 1000)
  }
}

// Singleton instance
export const advancedRateLimiter = AdvancedRateLimiter.getInstance()

// Export configurations for use in middleware
export { RATE_LIMIT_CONFIGS, SUBSCRIPTION_QUOTAS }

// Utility functions for common use cases
export async function checkAPIRateLimit(
  identifier: string,
  method: string = 'GET'
): Promise<RateLimitResult> {
  const endpoint = method === 'GET' ? 'API_READ' : 
                  ['POST', 'PUT', 'PATCH'].includes(method) ? 'API_WRITE' : 
                  method === 'DELETE' ? 'API_DELETE' : 'API_READ'
  
  return advancedRateLimiter.checkRateLimit(identifier, endpoint)
}

export async function checkTenantAPIQuota(
  tenantId: string,
  subscriptionTier: string
): Promise<RateLimitResult> {
  return advancedRateLimiter.checkTenantQuota(tenantId, 'apiCalls', subscriptionTier)
}

// Middleware decorator for automatic rate limiting
export function rateLimited(endpoint: string, config?: Partial<RateLimitConfig>) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (this: any, ...args: any[]) {
      // Extract identifier from context (could be IP, user ID, tenant ID)
      const identifier = this.getIdentifier?.() || 'unknown'
      
      const result = await advancedRateLimiter.checkRateLimit(identifier, endpoint, config)
      
      if (!result.allowed) {
        throw new Error(`Rate limit exceeded. Retry after ${result.retryAfter}ms`)
      }

      return method.apply(this, args)
    }

    return descriptor
  }
}