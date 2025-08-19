/**
 * Authentication wrapper for API routes
 * Eliminates duplication of auth checks across 10+ API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '../auth'
import { validateCsrfToken } from '@/middleware/security'

// Create compatibility function for getServerSession
const getServerSession = async () => {
  return await auth()
}

export interface AuthenticatedSession {
  user: {
    id: string
    email: string
    name: string
    tenantId: string
    role: string
    departmentId: string
    permissions: string[]
  }
  csrfToken?: string
}

export type AuthenticatedHandler = (
  request: NextRequest,
  session: AuthenticatedSession
) => Promise<NextResponse> | NextResponse

export interface AuthWrapperOptions {
  requirePermissions?: string[]
  requireRole?: string
  allowedMethods?: string[]
  rateLimitByUser?: boolean
  skipCsrfCheck?: boolean // For webhook endpoints
}

/**
 * Wraps an API route handler with authentication and authorization
 * @param handler - The API route handler to protect
 * @param options - Additional authorization options
 * @returns Protected API route handler
 */
export function withAuth(handler: AuthenticatedHandler, options: AuthWrapperOptions = {}) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Method validation
      if (options.allowedMethods && !options.allowedMethods.includes(request.method)) {
        return NextResponse.json(
          {
            error: 'Method not allowed',
            allowed: options.allowedMethods,
          },
          { status: 405 }
        )
      }

      // CSRF Protection for mutations
      if (!options.skipCsrfCheck && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
        const csrfToken = request.headers.get('x-csrf-token')
        const sessionToken = request.cookies.get('csrf-token')?.value

        if (!csrfToken || !sessionToken || !validateCsrfToken(csrfToken, sessionToken)) {
          return NextResponse.json(
            {
              error: 'Invalid CSRF token',
              code: 'CSRF_VALIDATION_FAILED',
            },
            { status: 403 }
          )
        }
      }

      // Get session
      const session = await getServerSession()

      // Authentication check
      if (!session?.user) {
        return NextResponse.json(
          {
            error: 'Authentication required',
            code: 'UNAUTHORIZED',
          },
          { status: 401 }
        )
      }

      // Ensure session has required fields
      if (!session.user.id || !session.user.tenantId) {
        return NextResponse.json(
          {
            error: 'Invalid session data',
            code: 'INVALID_SESSION',
          },
          { status: 401 }
        )
      }

      // Role-based authorization
      if (options.requireRole && session.user.role !== options.requireRole) {
        return NextResponse.json(
          {
            error: 'Insufficient role permissions',
            required: options.requireRole,
            current: session.user.role,
            code: 'INSUFFICIENT_ROLE',
          },
          { status: 403 }
        )
      }

      // Permission-based authorization
      if (options.requirePermissions && options.requirePermissions.length > 0) {
        const userPermissions = session.user.permissions || []
        const hasRequiredPermissions = options.requirePermissions.every((permission) =>
          userPermissions.includes(permission)
        )

        if (!hasRequiredPermissions) {
          return NextResponse.json(
            {
              error: 'Insufficient permissions',
              required: options.requirePermissions,
              current: userPermissions,
              code: 'INSUFFICIENT_PERMISSIONS',
            },
            { status: 403 }
          )
        }
      }

      // Add request context
      const enhancedRequest = Object.assign(request, {
        user: session.user,
        tenantId: session.user.tenantId,
        requestId: request.headers.get('x-request-id') || crypto.randomUUID(),
      })

      // Call the protected handler
      return await handler(enhancedRequest, session as AuthenticatedSession)
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Authentication service error',
          code: 'AUTH_SERVICE_ERROR',
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Wrapper for admin-only routes
 */
export function withAdminAuth(handler: AuthenticatedHandler) {
  return withAuth(handler, {
    requireRole: 'admin',
    requirePermissions: ['admin:read', 'admin:write'],
  })
}

/**
 * Wrapper for API routes that require specific permissions
 */
export function withPermissions(permissions: string[]) {
  return (handler: AuthenticatedHandler) => withAuth(handler, { requirePermissions: permissions })
}

/**
 * Wrapper for tenant-scoped routes (most common case)
 */
export function withTenantAuth(handler: AuthenticatedHandler) {
  return withAuth(handler, {
    requirePermissions: ['tenant:read'],
  })
}

/**
 * Type guard to check if session is properly authenticated
 */
export function isAuthenticatedSession(session: unknown): session is AuthenticatedSession {
  return (
    session &&
    session.user &&
    typeof session.user.id === 'string' &&
    typeof session.user.tenantId === 'string' &&
    typeof session.user.role === 'string'
  )
}
