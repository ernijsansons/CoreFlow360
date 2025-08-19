/**
 * CoreFlow360 - Rate Limiting Middleware Helper
 * Apply rate limiting to API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { rateLimiter } from '@/lib/rate-limiting/enhanced-limiter'
import { api } from '@/lib/api-response'

interface RateLimitOptions {
  // Rate limits
  perSecond?: number
  perMinute?: number
  perHour?: number
  perDay?: number

  // Options
  keyPrefix?: string
  authenticated?: boolean // Require authentication
  byUser?: boolean // Rate limit by user ID instead of IP
  burst?: number // Allow burst requests
  penalty?: number // Penalty duration in seconds
  skipForAdmin?: boolean // Skip rate limiting for admin users
}

/**
 * Get rate limit key based on request and options
 */
async function getRateLimitKey(
  request: NextRequest,
  options: RateLimitOptions
): Promise<string | null> {
  const prefix = options.keyPrefix || 'api'

  if (options.byUser) {
    // Rate limit by user ID
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return null // Can't rate limit without user ID
    }
    return `${prefix}:user:${session.user.id}`
  } else {
    // Rate limit by IP address
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      request.ip ||
      'unknown'
    return `${prefix}:ip:${ip}`
  }
}

/**
 * Apply rate limiting to an API route handler
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: RateLimitOptions = {}
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    try {
      // Check if authentication is required
      if (options.authenticated || options.byUser) {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
          return api.unauthorized('Authentication required')
        }

        // Skip rate limiting for admin users if configured
        if (options.skipForAdmin && session.user.role === 'admin') {
          return handler(request)
        }
      }

      // Get rate limit key
      const key = await getRateLimitKey(request, options)
      if (!key) {
        return api.error('Unable to apply rate limiting')
      }

      // Check rate limit
      const result = await rateLimiter.checkLimit(key, {
        perSecond: options.perSecond,
        perMinute: options.perMinute,
        perHour: options.perHour,
        perDay: options.perDay,
        burst: options.burst,
        penalty: options.penalty,
      })

      // Add rate limit headers to response
      const addRateLimitHeaders = (response: NextResponse) => {
        response.headers.set('X-RateLimit-Limit', result.limit.toString())
        response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
        response.headers.set('X-RateLimit-Reset', result.resetAt.toISOString())
        return response
      }

      if (!result.allowed) {
        // Rate limit exceeded
        const response = NextResponse.json(
          {
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: 'Too many requests. Please try again later.',
              details: {
                limit: result.limit,
                resetAt: result.resetAt.toISOString(),
              },
            },
          },
          { status: 429 }
        )

        return addRateLimitHeaders(response)
      }

      // Execute the handler
      const response = await handler(request)

      // Add rate limit headers to successful response
      return addRateLimitHeaders(response)
    } catch (error) {
      // Don't block the request on rate limiting errors
      return handler(request)
    }
  }
}

/**
 * Rate limit presets for common use cases
 */
export const rateLimitPresets = {
  // Very restrictive - for sensitive operations
  strict: {
    perMinute: 5,
    perHour: 20,
    perDay: 50,
    penalty: 300, // 5 minute penalty
  },

  // Standard API usage
  standard: {
    perSecond: 10,
    perMinute: 100,
    perHour: 1000,
    perDay: 10000,
  },

  // Relaxed - for less sensitive endpoints
  relaxed: {
    perMinute: 200,
    perHour: 2000,
    perDay: 20000,
  },

  // Search endpoints
  search: {
    perSecond: 5,
    perMinute: 50,
    perHour: 500,
    burst: 10,
  },

  // File uploads
  upload: {
    perMinute: 10,
    perHour: 50,
    perDay: 200,
    penalty: 600, // 10 minute penalty
  },

  // Authentication endpoints
  auth: {
    perMinute: 5,
    perHour: 20,
    perDay: 100,
    penalty: 900, // 15 minute penalty
  },
}
