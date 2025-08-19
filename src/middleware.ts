/**
 * CoreFlow360 - Edge-compatible middleware
 * EMERGENCY FIX: Route protection without Node.js dependencies
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// EMERGENCY: Build phase detection
const isBuildPhase = () => {
  return !!(
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.BUILDING_FOR_VERCEL === '1' ||
    process.env.CI === 'true' ||
    process.env.VERCEL_ENV === 'production' ||
    process.env.VERCEL === '1'
  )
}

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/pricing',
  '/demo',
  '/login',
  '/register',
  '/api/auth',
  '/api/health',
  '/terms',
  '/privacy',
  '/auth/error',
  '/auth/verify-request',
  '/consciousness',
  '/consciousness-demo',
  '/vs-competitors',
  '/industries',
  '/growth',
  '/content',
  '/migration',
  '/enterprise',
  '/developers',
  '/marketplace',
  '/ai-agent-selection',
  '/marketing',
  '/automation',
]

// Admin-only routes
const ADMIN_ROUTES = ['/admin', '/super-admin']

export async function middleware(request: NextRequest) {
  // Skip middleware during build phase
  if (isBuildPhase()) {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl

  // Allow all static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') || // files with extensions
    pathname.startsWith('/api/auth') // NextAuth routes
  ) {
    return NextResponse.next()
  }

  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  // Get session token safely
  let token = null
  try {
    const { getToken } = await import('next-auth/jwt')
    token = await getToken({
      req: request,
      secret:
        process.env.NEXTAUTH_SECRET ||
        process.env.AUTH_SECRET ||
        'dev-secret-minimum-32-characters-long-for-security',
    })
  } catch (error) {
    // Continue without token on error
  }

  // If user is authenticated
  if (token) {
    // Redirect authenticated users away from auth pages
    if (['/login', '/register'].includes(pathname)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Check admin routes
    if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
      const userRole = token.role as string

      if (pathname.startsWith('/super-admin') && userRole !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }

      if (pathname.startsWith('/admin') && !['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // Add security headers
    const response = NextResponse.next()
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

    return response
  }

  // User is not authenticated
  if (!isPublicRoute && !pathname.startsWith('/api')) {
    // Store the attempted URL for redirect after login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Add security headers to all responses
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  return response
}

export const config = {
  matcher: [
    // Match protected routes only
    '/dashboard/:path*',
    '/admin/:path*',
    '/super-admin/:path*',
    '/settings/:path*',
    '/profile/:path*',
    // Match API routes that need auth (excluding auth endpoints)
    '/api/((?!auth|health|ping).*)',
  ],
}
