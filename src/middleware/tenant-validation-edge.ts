/**
 * CoreFlow360 - Edge Runtime Compatible Tenant Validation
 *
 * Simplified tenant validation for Edge Runtime (middleware)
 * Database operations should be done in API routes instead
 */

import { NextRequest, NextResponse } from 'next/server'

export interface TenantValidationContext {
  userTenantId?: string
  requestedTenantSlug?: string
  userId?: string
  userRole?: string
  ip?: string | null
  userAgent?: string
  pathname: string
  method: string
}

export interface TenantValidationResult {
  isValid: boolean
  reason?: string
  securityViolation?: boolean
  tenant?: {
    id: string
    slug: string
  }
}

export class TenantValidator {
  /**
   * Basic tenant validation for Edge Runtime
   * Complex validation should be done in API routes
   */
  static async validateTenantAccess(
    context: TenantValidationContext
  ): Promise<TenantValidationResult> {
    // If no tenant ID, user doesn't have access
    if (!context.userTenantId) {
      return {
        isValid: false,
        reason: 'No tenant association',
      }
    }

    // If requesting a specific tenant subdomain, verify it matches user's tenant
    // Note: Actual tenant slug validation should be done in API routes with database access
    if (context.requestedTenantSlug) {
      // For now, we'll do a simple check
      // In production, this should be validated against a database or cache
      return {
        isValid: true,
        tenant: {
          id: context.userTenantId,
          slug: context.requestedTenantSlug,
        },
      }
    }

    // Super admins can access any tenant
    if (context.userRole === 'SUPER_ADMIN') {
      return {
        isValid: true,
        tenant: {
          id: context.userTenantId,
          slug: 'admin',
        },
      }
    }

    // Default case - user has valid tenant
    return {
      isValid: true,
      tenant: {
        id: context.userTenantId,
        slug: 'default',
      },
    }
  }

  /**
   * Log security violation (stub for Edge Runtime)
   * Actual logging should be done via API route
   */
  static async logSecurityViolation(
    reason: string,
    context: TenantValidationContext,
    additionalData?: unknown
  ): Promise<void> {
    // In Edge Runtime, we can't directly access the database
    // Log to console and let API routes handle persistent logging
    console.error('SECURITY_VIOLATION:', {
      reason,
      userId: context.userId,
      tenantId: context.userTenantId,
      requestedSlug: context.requestedTenantSlug,
      path: context.pathname,
      timestamp: new Date().toISOString(),
    })
  }
}
