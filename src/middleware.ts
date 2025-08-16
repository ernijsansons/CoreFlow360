/**
 * CoreFlow360 - Multi-tenant middleware
 * Route protection, subdomain detection, and tenant isolation
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { apiVersioningMiddleware } from '@/middleware/versioning'
import { sanitizationMiddleware } from '@/middleware/sanitization'

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

// Treat all API routes as self-managed; middleware should not gate them
const isApiPath = (pathname: string) => pathname.startsWith('/api')

// Admin-only routes
const ADMIN_ROUTES = [
  '/admin',
  '/super-admin'
]

export default auth(async (req) => {
  const { pathname } = req.nextUrl
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )
  const isApiRoute = isApiPath(pathname)
  const isAdminRoute = ADMIN_ROUTES.some(route => 
    pathname.startsWith(route)
  )

  // Handle API routes
  if (isApiRoute) {
    // Apply sanitization to API requests with body
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const sanitizationResponse = await sanitizationMiddleware(req)
      if (sanitizationResponse) {
        req = sanitizationResponse.request || req
      }
    }
    
    // Apply API versioning
    const versioningResponse = apiVersioningMiddleware(req)
    if (versioningResponse) {
      return versioningResponse
    }
    return NextResponse.next()
  }

  // Extract subdomain for tenant detection
  const host = req.headers.get('host') || ''
  const subdomain = host.split('.')[0]
  let tenantSlug = null
  
  // Check for tenant subdomain (not www, localhost, or staging)
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
      // TODO: Validate that user's tenant matches subdomain
      // This would require a database lookup, so we'll handle it in the app
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
    
    // Add security headers
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    
    // Only add HSTS in production
    if (process.env.NODE_ENV === 'production') {
      response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    }
    
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
  
  // Add security headers to all responses
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // Only add HSTS in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  
  return response
})

export const config = {
  matcher: [
    // Match all paths except static files and images
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ]
}