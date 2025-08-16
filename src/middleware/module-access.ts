/**
 * CoreFlow360 - Module Access Middleware
 * Enforces module access control for API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { checkModuleAccess, recordModuleUsage } from '@/lib/modules/access-control'
import { handleAuthorizationError, handleError, ErrorContext } from '@/lib/error-handler'

export interface ModuleAccessOptions {
  moduleId: string
  feature?: string
  operation?: 'read' | 'write' | 'execute' | 'admin'
  recordUsage?: boolean
  metricType?: string
}

/**
 * Middleware to check module access before executing route handler
 */
export function withModuleAccess(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: ModuleAccessOptions
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const context: ErrorContext = {
      endpoint: request.url,
      method: request.method,
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
      requestId: request.headers.get('x-request-id') || undefined
    }

    try {
      // Get session
      const session = await auth()
      if (!session?.user?.tenantId) {
        return handleAuthorizationError('Authentication required', context)
      }

      context.userId = session.user.id
      context.tenantId = session.user.tenantId

      // Check module access
      const accessCheck = await checkModuleAccess({
        tenantId: session.user.tenantId,
        userId: session.user.id,
        moduleId: options.moduleId,
        feature: options.feature,
        operation: options.operation
      })

      if (!accessCheck.allowed) {
        const message = accessCheck.reason || 'Module access denied'
        const error = new Error(message)
        
        // Add upgrade suggestion to response headers
        const response = handleAuthorizationError(message, context)
        
        if (accessCheck.suggestedUpgrade) {
          response.headers.set('X-Upgrade-Suggestion', accessCheck.suggestedUpgrade)
        }
        if (accessCheck.requiredBundle) {
          response.headers.set('X-Required-Bundle', accessCheck.requiredBundle)
        }
        if (accessCheck.requiredTier) {
          response.headers.set('X-Required-Tier', accessCheck.requiredTier)
        }

        return response
      }

      // Record usage if requested
      if (options.recordUsage) {
        await recordModuleUsage(
          session.user.tenantId,
          options.moduleId,
          options.metricType || 'api_calls',
          1
        )
      }

      // Call the actual handler
      return handler(request)

    } catch (error) {
      return handleError(error, context)
    }
  }
}

/**
 * Batch check multiple module access
 */
export async function checkMultipleModuleAccess(
  request: NextRequest,
  modules: string[]
): Promise<{ allowed: string[]; denied: string[]; session: any }> {
  const session = await auth()
  if (!session?.user?.tenantId) {
    return { allowed: [], denied: modules, session: null }
  }

  const allowed: string[] = []
  const denied: string[] = []

  for (const moduleId of modules) {
    const accessCheck = await checkModuleAccess({
      tenantId: session.user.tenantId,
      userId: session.user.id,
      moduleId
    })

    if (accessCheck.allowed) {
      allowed.push(moduleId)
    } else {
      denied.push(moduleId)
    }
  }

  return { allowed, denied, session }
}

/**
 * Get module access headers for response
 */
export function getModuleAccessHeaders(
  accessibleModules: string[],
  requestedModule?: string
): Record<string, string> {
  const headers: Record<string, string> = {
    'X-Accessible-Modules': accessibleModules.join(','),
    'X-Module-Count': String(accessibleModules.length)
  }

  if (requestedModule && accessibleModules.includes(requestedModule)) {
    headers['X-Module-Access'] = 'granted'
  } else if (requestedModule) {
    headers['X-Module-Access'] = 'denied'
  }

  return headers
}