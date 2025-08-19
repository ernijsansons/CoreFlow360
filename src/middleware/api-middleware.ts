/**
 * CoreFlow360 - Comprehensive API Middleware
 * Combines validation, rate limiting, security, and monitoring
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateRequest, ValidationConfig } from './validation'
import { rateLimit, rateLimitTiers, applySecurityHeaders, trackApiMetrics } from './rate-limit'
import { z } from 'zod'

export interface ApiMiddlewareConfig {
  validation?: ValidationConfig
  rateLimit?: keyof typeof rateLimitTiers | false
  requireAuth?: boolean
  requireTenant?: boolean
  allowedRoles?: string[]
  cors?: boolean
  tracking?: boolean
}

/**
 * Comprehensive API middleware wrapper
 */
export function withApiMiddleware<T extends (...args: unknown[]) => Promise<NextResponse>>(
  config: ApiMiddlewareConfig,
  handler: T
): T {
  return (async (request: NextRequest, context?: unknown) => {
    const startTime = Date.now()

    try {
      // 1. Apply rate limiting
      if (config.rateLimit !== false) {
        const rateLimitConfig = rateLimitTiers[config.rateLimit || 'api']
        const rateLimitResponse = await rateLimit(rateLimitConfig)(request)
        if (rateLimitResponse) {
          return applySecurityHeaders(rateLimitResponse)
        }
      }

      // 2. Validate request
      if (config.validation) {
        const validationResponse = await validateRequest(config.validation)(request, context)
        if (validationResponse) {
          return applySecurityHeaders(validationResponse)
        }
      }

      // 3. Check authentication
      if (config.requireAuth) {
        const authResponse = await checkAuthentication(request)
        if (authResponse) {
          return applySecurityHeaders(authResponse)
        }
      }

      // 4. Check tenant context
      if (config.requireTenant) {
        const tenantResponse = await checkTenantContext(request)
        if (tenantResponse) {
          return applySecurityHeaders(tenantResponse)
        }
      }

      // 5. Check role permissions
      if (config.allowedRoles && config.allowedRoles.length > 0) {
        const roleResponse = await checkRolePermissions(request, config.allowedRoles)
        if (roleResponse) {
          return applySecurityHeaders(roleResponse)
        }
      }

      // 6. Call the actual handler
      const response = await handler(request, context)

      // 7. Apply security headers
      const secureResponse = applySecurityHeaders(response)

      // 8. Track metrics
      if (config.tracking !== false) {
        return await trackApiMetrics(request, secureResponse, startTime)
      }

      return secureResponse
    } catch (error) {
      const errorResponse = NextResponse.json(
        {
          error: 'Internal server error',
          message:
            process.env.NODE_ENV === 'development'
              ? (error as Error).message
              : 'An unexpected error occurred',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      )

      return applySecurityHeaders(errorResponse)
    }
  }) as T
}

/**
 * Check authentication
 */
async function checkAuthentication(request: NextRequest): Promise<NextResponse | null> {
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      {
        error: 'Authentication required',
        message: 'Please provide a valid authentication token',
        code: 'AUTH_REQUIRED',
      },
      { status: 401 }
    )
  }

  const token = authHeader.substring(7)

  // Validate token (implement your JWT validation)
  try {
    // const decoded = jwt.verify(token, process.env.JWT_SECRET)
    // Add user info to request headers for downstream use
    // request.headers.set('x-user-id', decoded.userId)
    // request.headers.set('x-user-role', decoded.role)

    // For demo purposes
    request.headers.set('x-user-id', 'demo-user-1')
    request.headers.set('x-user-role', 'admin')

    return null
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Invalid token',
        message: 'The provided authentication token is invalid or expired',
        code: 'INVALID_TOKEN',
      },
      { status: 401 }
    )
  }
}

/**
 * Check tenant context
 */
async function checkTenantContext(request: NextRequest): Promise<NextResponse | null> {
  const tenantId = request.headers.get('x-tenant-id')

  if (!tenantId) {
    return NextResponse.json(
      {
        error: 'Tenant context required',
        message: 'Please provide a tenant ID in the x-tenant-id header',
        code: 'TENANT_REQUIRED',
      },
      { status: 400 }
    )
  }

  // Validate tenant exists and user has access
  // const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } })
  // if (!tenant) { return error }

  return null
}

/**
 * Check role permissions
 */
async function checkRolePermissions(
  request: NextRequest,
  allowedRoles: string[]
): Promise<NextResponse | null> {
  const userRole = request.headers.get('x-user-role')

  if (!userRole || !allowedRoles.includes(userRole)) {
    return NextResponse.json(
      {
        error: 'Insufficient permissions',
        message: 'You do not have permission to access this resource',
        code: 'FORBIDDEN',
      },
      { status: 403 }
    )
  }

  return null
}

/**
 * Pre-configured middleware combinations
 */
export const apiMiddleware = {
  // Public endpoints (no auth required)
  public: (validation?: ValidationConfig) =>
    withApiMiddleware({ validation, rateLimit: 'api' }, (handler) => handler),

  // Authenticated endpoints
  authenticated: (validation?: ValidationConfig) =>
    withApiMiddleware({ validation, rateLimit: 'api', requireAuth: true }, (handler) => handler),

  // Tenant-scoped endpoints
  tenantScoped: (validation?: ValidationConfig) =>
    withApiMiddleware(
      {
        validation,
        rateLimit: 'api',
        requireAuth: true,
        requireTenant: true,
      },
      (handler) => handler
    ),

  // Admin only endpoints
  adminOnly: (validation?: ValidationConfig) =>
    withApiMiddleware(
      {
        validation,
        rateLimit: 'api',
        requireAuth: true,
        allowedRoles: ['admin', 'super_admin'],
      },
      (handler) => handler
    ),

  // Write operations (stricter rate limit)
  write: (validation?: ValidationConfig) =>
    withApiMiddleware(
      {
        validation,
        rateLimit: 'write',
        requireAuth: true,
        requireTenant: true,
      },
      (handler) => handler
    ),

  // Expensive operations
  expensive: (validation?: ValidationConfig) =>
    withApiMiddleware(
      {
        validation,
        rateLimit: 'expensive',
        requireAuth: true,
      },
      (handler) => handler
    ),
}

/**
 * Error handler wrapper
 */
export function withErrorHandler<T extends (...args: unknown[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args)
    } catch (error) {
      // Check if it's a known error type
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: 'Validation error',
            message: 'Invalid request data',
            details: error.errors,
          },
          { status: 400 }
        )
      }

      if (error instanceof Error && error.message.includes('Unique constraint')) {
        return NextResponse.json(
          {
            error: 'Duplicate entry',
            message: 'This resource already exists',
          },
          { status: 409 }
        )
      }

      // Generic error response
      return NextResponse.json(
        {
          error: 'Internal server error',
          message:
            process.env.NODE_ENV === 'development'
              ? (error as Error).message
              : 'An unexpected error occurred',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      )
    }
  }) as T
}
