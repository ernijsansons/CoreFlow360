/**
 * CoreFlow360 - Rate Limiting for Next.js
 * Token bucket algorithm implementation for API rate limiting
 */

import { LRUCache } from 'lru-cache'
import { NextRequest } from 'next/server'
import { 
  enhancedRateLimiter, 
  withEnhancedRateLimit, 
  ENHANCED_RATE_LIMITS,
  EnhancedRateLimitConfig 
} from './security/enhanced-rate-limit'

export type RateLimitOptions = {
  uniqueTokenPerInterval?: number
  interval?: number
}

export type RateLimitResult = {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

// Default rate limit configurations
export const RATE_LIMITS = {
  auth: {
    uniqueTokenPerInterval: 5,
    interval: 15 * 60 * 1000 // 15 minutes
  },
  api: {
    uniqueTokenPerInterval: 100,
    interval: 60 * 1000 // 1 minute
  },
  public: {
    uniqueTokenPerInterval: 30,
    interval: 60 * 1000 // 1 minute
  },
  upload: {
    uniqueTokenPerInterval: 10,
    interval: 60 * 60 * 1000 // 1 hour
  }
} as const

export function rateLimit(options?: RateLimitOptions) {
  const tokenCache = new LRUCache<string, number[]>({
    max: 5000, // Max 5000 unique tokens
    ttl: options?.interval || 60 * 1000, // Default 1 minute
  })

  return {
    check: async (request: NextRequest, token: string): Promise<RateLimitResult> => {
      const limit = options?.uniqueTokenPerInterval || 100
      const interval = options?.interval || 60 * 1000
      const now = Date.now()
      
      // Get the token's request history
      const timestamps = tokenCache.get(token) || []
      const validTimestamps = timestamps.filter(
        timestamp => now - timestamp < interval
      )
      
      // Check if limit exceeded
      if (validTimestamps.length >= limit) {
        return {
          success: false,
          limit,
          remaining: 0,
          reset: Math.min(...validTimestamps) + interval
        }
      }
      
      // Add current request timestamp
      validTimestamps.push(now)
      tokenCache.set(token, validTimestamps)
      
      return {
        success: true,
        limit,
        remaining: limit - validTimestamps.length,
        reset: now + interval
      }
    }
  }
}

// Helper to get rate limit key from request
export function getRateLimitKey(request: NextRequest, prefix: string = 'api'): string {
  // Try to get authenticated user ID from headers (set by middleware)
  const userId = request.headers.get('x-user-id')
  if (userId) {
    const tenantId = request.headers.get('x-tenant-id')
    return tenantId ? `${prefix}:${tenantId}:${userId}` : `${prefix}:user:${userId}`
  }
  
  // Fall back to IP address
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwardedFor?.split(',')[0] || realIp || 'unknown'
  
  return `${prefix}:ip:${ip}`
}

// Rate limiter instances
export const authLimiter = rateLimit(RATE_LIMITS.auth)
export const apiLimiter = rateLimit(RATE_LIMITS.api)
export const publicLimiter = rateLimit(RATE_LIMITS.public)
export const uploadLimiter = rateLimit(RATE_LIMITS.upload)

// Helper function to create rate limit response
export function rateLimitResponse(result: RateLimitResult) {
  return new Response('Too many requests', {
    status: 429,
    headers: {
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': new Date(result.reset).toISOString(),
      'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
      'Content-Type': 'application/json'
    },
    // @ts-ignore - Body is valid
    body: JSON.stringify({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      limit: result.limit,
      remaining: result.remaining,
      reset: new Date(result.reset).toISOString()
    })
  })
}

// Middleware helper for API routes (enhanced version)
export async function withRateLimit(
  request: NextRequest,
  handler: () => Promise<Response>,
  options?: RateLimitOptions
): Promise<Response> {
  // Check if Redis is available for enhanced rate limiting
  if (process.env.REDIS_URL || process.env.REDIS_CLUSTER_NODES) {
    // Use enhanced rate limiting with Redis
    const enhancedConfig: EnhancedRateLimitConfig = {
      strategy: 'sliding-window',
      limit: options?.uniqueTokenPerInterval || RATE_LIMITS.api.uniqueTokenPerInterval,
      window: options?.interval || RATE_LIMITS.api.interval,
    }
    
    // Extract tenant context if available
    const tenantId = request.headers.get('x-tenant-id') || undefined
    const tenantTier = request.headers.get('x-tenant-tier') || undefined
    
    return withEnhancedRateLimit(request, handler, enhancedConfig, {
      tenantId,
      tenantTier
    })
  }
  
  // Fallback to local rate limiting
  const limiter = rateLimit(options || RATE_LIMITS.api)
  const key = getRateLimitKey(request)
  const result = await limiter.check(request, key)
  
  if (!result.success) {
    return rateLimitResponse(result)
  }
  
  // Add rate limit headers to successful responses
  const response = await handler()
  response.headers.set('X-RateLimit-Limit', result.limit.toString())
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
  response.headers.set('X-RateLimit-Reset', new Date(result.reset).toISOString())
  
  return response
}