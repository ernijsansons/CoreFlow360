/**
 * CoreFlow360 - API Route Middleware Configuration
 * Apply rate limiting and security to API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, rateLimitTiers, applySecurityHeaders } from '@/middleware/rate-limit'

// API routes that need different rate limits
const RATE_LIMIT_CONFIG: Record<string, keyof typeof rateLimitTiers> = {
  // Auth endpoints - strict limits
  '/api/auth/login': 'auth',
  '/api/auth/register': 'auth',
  '/api/auth/reset-password': 'auth',

  // Write operations - moderate limits
  '/api/customers': 'write',
  '/api/deals': 'write',
  '/api/projects': 'write',
  '/api/freemium/select-agent': 'write',
  '/api/onboarding': 'write',
  '/api/conversion/track': 'write',

  // Read operations - relaxed limits
  '/api/dashboard': 'read',
  '/api/metrics': 'read',
  '/api/performance': 'read',

  // Expensive operations - very strict limits
  '/api/ai/insights': 'expensive',
  '/api/reports/generate': 'expensive',
  '/api/export': 'expensive',

  // WebSocket endpoints
  '/api/ws': 'websocket',

  // Default for all other API routes
  '*': 'api',
}

/**
 * Get rate limit tier for a given path
 */
function getRateLimitTier(pathname: string): keyof typeof rateLimitTiers {
  // Check exact match first
  if (RATE_LIMIT_CONFIG[pathname]) {
    return RATE_LIMIT_CONFIG[pathname]
  }

  // Check prefix matches
  for (const [path, tier] of Object.entries(RATE_LIMIT_CONFIG)) {
    if (path !== '*' && pathname.startsWith(path)) {
      return tier
    }
  }

  // Return default
  return RATE_LIMIT_CONFIG['*'] || 'api'
}

/**
 * API middleware for rate limiting and security
 */
export async function apiMiddleware(request: NextRequest): Promise<NextResponse | void> {
  const pathname = request.nextUrl.pathname

  // Skip middleware for health check
  if (pathname === '/api/health') {
    return
  }

  // Get appropriate rate limit tier
  const rateLimitTier = getRateLimitTier(pathname)
  const rateLimitConfig = rateLimitTiers[rateLimitTier]

  // Apply rate limiting
  const rateLimitResponse = await rateLimit(rateLimitConfig)(request)
  if (rateLimitResponse) {
    return applySecurityHeaders(rateLimitResponse)
  }

  // Request is within rate limits, continue
  return
}

/**
 * Wrap API route handler with middleware
 */
export function withApiMiddleware(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Apply middleware
    const middlewareResponse = await apiMiddleware(request)
    if (middlewareResponse) {
      return middlewareResponse
    }

    // Call actual handler
    try {
      const response = await handler(request)
      return applySecurityHeaders(response)
    } catch (error) {
      const errorResponse = NextResponse.json(
        {
          error: 'Internal server error',
          message:
            process.env.NODE_ENV === 'development'
              ? (error as Error).message
              : 'An unexpected error occurred',
        },
        { status: 500 }
      )

      return applySecurityHeaders(errorResponse)
    }
  }
}
