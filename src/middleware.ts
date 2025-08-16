/**
 * CoreFlow360 - Multi-tenant middleware
 * Route protection, subdomain detection, and tenant isolation
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { apiVersioningMiddleware } from '@/middleware/versioning'
import { sanitizationMiddleware } from '@/middleware/sanitization'
import { requestSignatureMiddleware } from '@/middleware/request-signature'
import { TenantValidator, TenantValidationContext } from '@/middleware/tenant-validation'
import { ddosProtectionMiddleware } from '@/lib/security/ddos-protection'
import { prisma } from '@/lib/db'

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

// Validate that user's tenant matches the subdomain
async function validateUserTenantAccess(userTenantId: string, tenantSlug: string): Promise<boolean> {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { 
        id: userTenantId,
        slug: tenantSlug,
        isActive: true
      }
    })
    return !!tenant
  } catch (error) {
    console.error('Tenant validation error:', error)
    return false
  }
}

export default auth(async (req) => {
  const { pathname } = req.nextUrl
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )
  const isApiRoute = isApiPath(pathname)
  const isAdminRoute = ADMIN_ROUTES.some(route => 
    pathname.startsWith(route)
  )

  // Apply DDoS protection first (before auth)
  const ddosResponse = await ddosProtectionMiddleware(req)
  if (ddosResponse) {
    return ddosResponse
  }

  // Handle API routes
  if (isApiRoute) {
    // Apply request signature validation first (for critical endpoints)
    const signatureResponse = await requestSignatureMiddleware(req)
    if (signatureResponse) {
      return signatureResponse
    }
    
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
    
    // Enhanced tenant validation with security monitoring
    const tenantContext: TenantValidationContext = {
      userTenantId: user.tenantId,
      requestedTenantSlug: tenantSlug || undefined,
      userId: user.id,
      userRole: user.role,
      ip: req.ip || req.headers.get('x-forwarded-for')?.split(',')[0],
      userAgent: req.headers.get('user-agent') || undefined,
      pathname,
      method: req.method || 'GET'
    }

    const validationResult = await TenantValidator.validateTenantAccess(tenantContext)
    if (!validationResult.isValid) {
      if (validationResult.securityViolation) {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
      if (validationResult.reason?.includes('subscription')) {
        return NextResponse.redirect(new URL('/subscription-required', req.url))
      }
      return NextResponse.redirect(new URL('/unauthorized', req.url))
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
    
    // Add tenant context to response headers for downstream use
    if (validationResult.tenant) {
      response.headers.set('x-tenant-id', validationResult.tenant.id)
      response.headers.set('x-tenant-slug', validationResult.tenant.slug)
    }
    
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