/**
 * CoreFlow360 - Rate Limiting Compatibility Layer
 * Provides Express-style rate limiting interface for Next.js
 */

import { NextRequest, NextResponse } from 'next/server'

interface RateLimitOptions {
  windowMs: number
  max: number
  message?: string
  standardHeaders?: boolean
  legacyHeaders?: boolean
  skipSuccessfulRequests?: boolean
  keyGenerator?: (req: any) => string
}

// Mock rate limiter for Vercel deployment
// In production, this should use Redis or edge-compatible rate limiting
export default function rateLimit(options: RateLimitOptions) {
  // Return a no-op function for build compatibility
  return (req: any, res: any, next?: any) => {
    if (next) next()
    return Promise.resolve()
  }
}

// Named export for compatibility
export { rateLimit }