/**
 * CoreFlow360 - Enhanced Middleware
 * Includes authentication, security, compression, and performance optimizations
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { apiVersioningMiddleware } from '@/middleware/versioning'
import { securityMiddleware } from '@/middleware/security'
import { compressionMiddleware } from '@/middleware/compression'

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/pricing',
  '/demo',
  '/login',
  '/register',
  '/api/auth/register',
  '/api/health',
  '/terms',
  '/privacy',
  '/auth/error',
  '/auth/verify-request'
]

// API routes are self-managed
const isApiPath = (pathname: string) => pathname.startsWith('/api')

// Admin-only routes
const ADMIN_ROUTES = [
  '/admin',
  '/super-admin'
]

// Performance monitoring
const performanceMetrics = {
  requestCount: 0,
  totalDuration: 0,
  slowRequests: [] as Array<{ path: string; duration: number; timestamp: Date }>
}

export default auth(async (req) => {
  const startTime = Date.now()
  const { pathname } = req.nextUrl
  
  try {
    // Apply security middleware first
    const securityResponse = await securityMiddleware(req)
    if (securityResponse) {
      return securityResponse
    }
    
    const isPublicRoute = PUBLIC_ROUTES.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    )
    const isApiRoute = isApiPath(pathname)
    const isAdminRoute = ADMIN_ROUTES.some(route => 
      pathname.startsWith(route)
    )

    // Handle API routes
    if (isApiRoute) {
      // Apply API versioning
      const versioningResponse = apiVersioningMiddleware(req)
      if (versioningResponse) {
        return await applyCompression(req, versioningResponse)
      }
      
      // Let API routes handle their own auth
      const response = NextResponse.next()
      
      // Add performance headers
      response.headers.set('X-Response-Time', String(Date.now() - startTime))
      
      return await applyCompression(req, response)
    }

    // Extract subdomain for tenant detection
    const host = req.headers.get('host') || ''
    const subdomain = host.split('.')[0]
    let tenantSlug = null
    
    // Check for tenant subdomain
    if (subdomain && 
        !['www', 'localhost', '127', '192', 'staging', 'app'].includes(subdomain) &&
        !host.includes('vercel.app') &&
        !host.includes('localhost')) {
      tenantSlug = subdomain
    }

    // If user is authenticated
    if (req.auth) {
      const user = req.auth.user as any
      
      // Tenant isolation check
      if (tenantSlug && user.tenantId) {
        // Add tenant context to headers
        const response = NextResponse.next()
        response.headers.set('X-Tenant-Slug', tenantSlug)
        response.headers.set('X-Tenant-Id', user.tenantId)
      }

      // Admin route protection
      if (isAdminRoute) {
        if (pathname.startsWith('/super-admin') && user.role !== 'SUPER_ADMIN') {
          return NextResponse.redirect(new URL('/dashboard', req.url))
        }
        
        if (pathname.startsWith('/admin') && 
            !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
          return NextResponse.redirect(new URL('/dashboard', req.url))
        }
      }

      // Redirect authenticated users away from auth pages
      if (['/login', '/register'].includes(pathname)) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }

      const response = NextResponse.next()
      
      // Add user context headers
      response.headers.set('X-User-Id', user.id)
      response.headers.set('X-User-Role', user.role)
      
      // Enhanced security headers
      applySecurityHeaders(response)
      
      // Performance tracking
      trackPerformance(pathname, startTime)
      
      return response
    }

    // User is not authenticated
    if (!isPublicRoute) {
      // Store the attempted URL for redirect after login
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const response = NextResponse.next()
    
    // Apply security headers
    applySecurityHeaders(response)
    
    // Track performance
    trackPerformance(pathname, startTime)
    
    return response
  } catch (error) {
    console.error('Middleware error:', error)
    
    // Return error response
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? error : undefined
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    )
  }
})

/**
 * Apply compression to API responses
 */
async function applyCompression(
  req: NextRequest,
  res: NextResponse
): Promise<NextResponse> {
  // Only compress API responses
  if (!req.nextUrl.pathname.startsWith('/api')) {
    return res
  }
  
  // Skip compression for streaming endpoints
  if (req.nextUrl.pathname.includes('/stream') || 
      req.nextUrl.pathname.includes('/webhook')) {
    return res
  }
  
  try {
    return await compressionMiddleware(req, res)
  } catch (error) {
    console.error('Compression error:', error)
    return res
  }
}

/**
 * Apply security headers to response
 */
function applySecurityHeaders(response: NextResponse) {
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  )
  
  // Cache control for security
  response.headers.set('Cache-Control', 'no-store, max-age=0')
  
  // Remove server info
  response.headers.delete('X-Powered-By')
  response.headers.set('Server', 'CoreFlow360')
  
  // Production-only headers
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security', 
      'max-age=63072000; includeSubDomains; preload'
    )
    
    // Content Security Policy
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https: blob:; " +
      "font-src 'self' data:; " +
      "connect-src 'self' https://api.openai.com https://api.anthropic.com wss:// https://sentry.io; " +
      "frame-ancestors 'none';"
    )
  }
}

/**
 * Track performance metrics
 */
function trackPerformance(pathname: string, startTime: number) {
  const duration = Date.now() - startTime
  
  performanceMetrics.requestCount++
  performanceMetrics.totalDuration += duration
  
  // Track slow requests (> 100ms)
  if (duration > 100) {
    performanceMetrics.slowRequests.push({
      path: pathname,
      duration,
      timestamp: new Date()
    })
    
    // Keep only last 100 slow requests
    if (performanceMetrics.slowRequests.length > 100) {
      performanceMetrics.slowRequests.shift()
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Slow middleware execution: ${pathname} took ${duration}ms`)
    }
  }
}

/**
 * Get performance metrics
 */
export function getMiddlewareMetrics() {
  const avgDuration = performanceMetrics.requestCount > 0
    ? performanceMetrics.totalDuration / performanceMetrics.requestCount
    : 0
    
  return {
    totalRequests: performanceMetrics.requestCount,
    avgDuration: Math.round(avgDuration),
    slowRequestsCount: performanceMetrics.slowRequests.length,
    slowRequests: performanceMetrics.slowRequests.slice(-10)
  }
}

export const config = {
  matcher: [
    // Match all paths except static files and images
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ]
}