/**
 * CoreFlow360 - Request Signature Middleware
 *
 * Automatic HMAC-SHA256 signature validation for critical API endpoints
 */

import { NextRequest, NextResponse } from 'next/server'
import { withRequestSigning } from '@/lib/security/request-signing'

// Critical API endpoints that require request signing
const SIGNED_ENDPOINTS = [
  '/api/admin/',
  '/api/voice/webhook',
  '/api/stripe/webhook',
  '/api/intelligence/',
  '/api/crm/engagement/',
  '/api/subscriptions/checkout',
  '/api/customers/',
  '/api/metrics/',
]

// High-value endpoints with stricter validation
const HIGH_SECURITY_ENDPOINTS = [
  '/api/admin/users',
  '/api/admin/tenants',
  '/api/stripe/webhook',
  '/api/subscriptions/checkout',
  '/api/voice/webhook',
]

/**
 * Check if endpoint requires signature validation
 */
function requiresSignature(pathname: string): boolean {
  return SIGNED_ENDPOINTS.some((endpoint) => pathname.startsWith(endpoint))
}

/**
 * Check if endpoint requires high security validation
 */
function requiresHighSecurity(pathname: string): boolean {
  return HIGH_SECURITY_ENDPOINTS.some((endpoint) => pathname.startsWith(endpoint))
}

/**
 * Request signature validation middleware
 */
export async function requestSignatureMiddleware(req: NextRequest): Promise<NextResponse | null> {
  const { pathname } = new URL(req.url)

  // Skip if endpoint doesn't require signing
  if (!requiresSignature(pathname)) {
    return null // Continue to next middleware
  }

  // Skip in development if explicitly disabled
  if (process.env.NODE_ENV === 'development' && process.env.DISABLE_REQUEST_SIGNING === 'true') {
    return null
  }

  try {
    // Configure signing based on security level
    const signingConfig = requiresHighSecurity(pathname)
      ? {
          timestampTolerance: 60, // 1 minute for high security
          algorithm: 'sha512' as const,
          includeBody: true,
        }
      : {
          timestampTolerance: 300, // 5 minutes for standard
          algorithm: 'sha256' as const,
          includeBody: req.method !== 'GET',
        }

    // Create signed middleware handler
    const signedHandler = withRequestSigning(signingConfig)

    // Dummy handler that just returns success - actual validation happens in signedHandler
    const dummyHandler = async () => NextResponse.next()

    // Execute signature validation
    const response = await signedHandler(req, dummyHandler)

    // If validation failed, return the error response
    if (response.status === 401 || response.status === 500) {
      console.warn(`🚫 Request signature validation failed for ${pathname}:`, {
        status: response.status,
        method: req.method,
        userAgent: req.headers.get('user-agent'),
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      })

      return response
    }

    // Log successful validation for audit
    console.log(`✅ Request signature validated for ${pathname}`, {
      method: req.method,
      securityLevel: requiresHighSecurity(pathname) ? 'high' : 'standard',
    })

    return null // Continue to next middleware
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Authentication system unavailable',
        code: 'AUTH_UNAVAILABLE',
      },
      { status: 503 }
    )
  }
}

/**
 * Helper to add signature validation to API route handlers
 */
export function withSignatureValidation<T extends unknown[]>(
  handler: (...args: T) => Promise<Response>,
  options?: {
    highSecurity?: boolean
    skipInDevelopment?: boolean
  }
) {
  return async (...args: T): Promise<Response> => {
    const req = args[0] as NextRequest

    // Skip in development if requested
    if (
      options?.skipInDevelopment &&
      process.env.NODE_ENV === 'development' &&
      process.env.DISABLE_REQUEST_SIGNING === 'true'
    ) {
      return handler(...args)
    }

    const signingConfig = options?.highSecurity
      ? {
          timestampTolerance: 60,
          algorithm: 'sha512' as const,
          includeBody: true,
        }
      : undefined

    const signedHandler = withRequestSigning(signingConfig)

    return signedHandler(req, async (validatedReq) => {
      // Replace original request with validated request
      const newArgs = [validatedReq, ...args.slice(1)] as T
      return handler(...newArgs)
    })
  }
}

/**
 * Development utility to generate test signatures
 */
export function generateTestSignature(
  method: string,
  url: string,
  body?: string
): { headers: Record<string, string>; signature: string } {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Test signature generation only available in development')
  }

  const { RequestSigner } = require('@/lib/security/request-signing')
  const signer = new RequestSigner({
    secretKey: process.env.API_SIGNING_SECRET || 'dev-secret-key',
  })

  return signer.signRequest(method, url, body)
}
