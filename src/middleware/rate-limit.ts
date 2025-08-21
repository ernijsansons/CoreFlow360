/**
 * CoreFlow360 - Rate Limiting Middleware
 * Prevents abuse and ensures fair API usage across tenants
 */

import rateLimit from './rate-limit-compat'
import { NextRequest, NextResponse } from 'next/server'

// Rate limiter for authentication endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many login attempts from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable X-RateLimit headers
  skipSuccessfulRequests: false,
  keyGenerator: (req) => {
    // Use IP address as key
    return req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  },
})

// Rate limiter for general API endpoints
export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each user to 100 requests per minute
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => {
    // Use authenticated user ID if available, otherwise IP
    const userId = (req as unknown).auth?.user?.id
    if (userId) return `user:${userId}`

    return req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  },
})

// Rate limiter for public endpoints
export const publicRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 requests per minute
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
})

// Rate limiter for file uploads
export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each user to 10 uploads per hour
  message: 'Upload limit exceeded, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
})

// Helper to create tenant-specific rate limiters
export function createTenantRateLimit(options: {
  windowMs: number
  max: number
  message?: string
}) {
  return rateLimit({
    ...options,
    keyGenerator: (req) => {
      const tenantId = (req as unknown).auth?.user?.tenantId
      const userId = (req as unknown).auth?.user?.id

      if (tenantId && userId) {
        return `tenant:${tenantId}:user:${userId}`
      }

      return req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    },
    standardHeaders: true,
    legacyHeaders: false,
  })
}

// Premium tier rate limits (higher limits)
export const premiumApiRateLimit = createTenantRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000, // 1000 requests per minute for premium users
  message: 'Rate limit exceeded for premium tier',
})

// Export types for TypeScript
export type RateLimitInfo = {
  limit: number
  remaining: number
  reset: Date
}
