/**
 * CoreFlow360 - Advanced Tenant Validation Middleware
 *
 * Comprehensive tenant isolation validation with security monitoring
 * and audit logging for all tenant-aware operations.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Cache for tenant validation results
const tenantValidationCache = new Map<
  string,
  {
    isValid: boolean
    expiresAt: number
    tenantData?: unknown
  }
>()

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const MAX_CACHE_SIZE = 1000

export interface TenantValidationContext {
  userTenantId?: string
  requestedTenantSlug?: string
  userId?: string
  userRole?: string
  ip?: string
  userAgent?: string
  pathname: string
  method: string
}

export interface TenantValidationResult {
  isValid: boolean
  tenant?: unknown
  reason?: string
  securityViolation?: boolean
  shouldLog?: boolean
}

/**
 * Enhanced tenant validation with comprehensive security checks
 */
export class TenantValidator {
  /**
   * Validate tenant access with security monitoring
   */
  static async validateTenantAccess(
    context: TenantValidationContext
  ): Promise<TenantValidationResult> {
    try {
      // Handle requests without tenant context (public routes)
      if (!context.userTenantId && !context.requestedTenantSlug) {
        return { isValid: true }
      }

      // Direct tenant ID access (API routes typically)
      if (context.userTenantId && !context.requestedTenantSlug) {
        return await this.validateDirectTenantAccess(context.userTenantId, context)
      }

      // Subdomain-based tenant access
      if (context.requestedTenantSlug) {
        return await this.validateSubdomainTenantAccess(context)
      }

      return {
        isValid: false,
        reason: 'No tenant context provided',
        securityViolation: true,
        shouldLog: true,
      }
    } catch (error) {
      return {
        isValid: false,
        reason: 'Validation error occurred',
        securityViolation: true,
        shouldLog: true,
      }
    }
  }

  /**
   * Validate direct tenant access (for API routes)
   */
  private static async validateDirectTenantAccess(
    tenantId: string,
    context: TenantValidationContext
  ): Promise<TenantValidationResult> {
    const cacheKey = this.generateCacheKey('direct', tenantId)
    const cached = this.getCachedResult(cacheKey)

    if (cached) {
      return { isValid: cached.isValid, tenant: cached.tenantData }
    }

    try {
      const tenant = await prisma.tenant.findUnique({
        where: {
          id: tenantId,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
          subscriptionStatus: true,
          enabledModules: true,
        },
      })

      if (!tenant) {
        this.setCachedResult(cacheKey, { isValid: false })
        return {
          isValid: false,
          reason: 'Tenant not found or inactive',
          securityViolation: true,
          shouldLog: true,
        }
      }

      // Check subscription status
      if (tenant.subscriptionStatus === 'CANCELLED' || tenant.subscriptionStatus === 'SUSPENDED') {
        return {
          isValid: false,
          reason: `Tenant subscription is ${tenant.subscriptionStatus}`,
          securityViolation: false,
          shouldLog: true,
        }
      }

      this.setCachedResult(cacheKey, { isValid: true, tenantData: tenant })
      return { isValid: true, tenant }
    } catch (error) {
      return {
        isValid: false,
        reason: 'Database validation failed',
        securityViolation: true,
        shouldLog: true,
      }
    }
  }

  /**
   * Validate subdomain-based tenant access
   */
  private static async validateSubdomainTenantAccess(
    context: TenantValidationContext
  ): Promise<TenantValidationResult> {
    const { userTenantId, requestedTenantSlug } = context
    const cacheKey = this.generateCacheKey('subdomain', `${userTenantId}:${requestedTenantSlug}`)
    const cached = this.getCachedResult(cacheKey)

    if (cached) {
      return { isValid: cached.isValid, tenant: cached.tenantData }
    }

    try {
      // Find tenant by slug
      const tenant = await prisma.tenant.findUnique({
        where: {
          slug: requestedTenantSlug,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
          subscriptionStatus: true,
          enabledModules: true,
        },
      })

      if (!tenant) {
        this.setCachedResult(cacheKey, { isValid: false })
        return {
          isValid: false,
          reason: 'Tenant not found by slug',
          securityViolation: true,
          shouldLog: true,
        }
      }

      // Verify user belongs to this tenant
      if (userTenantId && tenant.id !== userTenantId) {
        await this.logSecurityViolation(context, 'CROSS_TENANT_ACCESS_ATTEMPT', {
          userTenantId,
          requestedTenantId: tenant.id,
          requestedSlug: requestedTenantSlug,
        })

        this.setCachedResult(cacheKey, { isValid: false })
        return {
          isValid: false,
          reason: 'Cross-tenant access attempted',
          securityViolation: true,
          shouldLog: true,
        }
      }

      // Check subscription status
      if (tenant.subscriptionStatus === 'CANCELLED' || tenant.subscriptionStatus === 'SUSPENDED') {
        return {
          isValid: false,
          reason: `Tenant subscription is ${tenant.subscriptionStatus}`,
          securityViolation: false,
          shouldLog: true,
        }
      }

      this.setCachedResult(cacheKey, { isValid: true, tenantData: tenant })
      return { isValid: true, tenant }
    } catch (error) {
      return {
        isValid: false,
        reason: 'Database validation failed',
        securityViolation: true,
        shouldLog: true,
      }
    }
  }

  /**
   * Validate module access for tenant
   */
  static async validateModuleAccess(
    tenantId: string,
    moduleId: string,
    context: TenantValidationContext
  ): Promise<TenantValidationResult> {
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { enabledModules: true, subscriptionStatus: true },
      })

      if (!tenant) {
        return {
          isValid: false,
          reason: 'Tenant not found',
          securityViolation: true,
        }
      }

      const enabledModules = tenant.enabledModules ? JSON.parse(tenant.enabledModules) : {}

      if (!enabledModules[moduleId]) {
        await this.logSecurityViolation(context, 'MODULE_ACCESS_DENIED', {
          tenantId,
          moduleId,
          enabledModules: Object.keys(enabledModules),
        })

        return {
          isValid: false,
          reason: `Module '${moduleId}' not enabled for tenant`,
          securityViolation: true,
          shouldLog: true,
        }
      }

      return { isValid: true }
    } catch (error) {
      return {
        isValid: false,
        reason: 'Module validation failed',
        securityViolation: true,
      }
    }
  }

  /**
   * Log security violations for monitoring
   */
  private static async logSecurityViolation(
    context: TenantValidationContext,
    violationType: string,
    details: unknown
  ): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          action: 'SECURITY_EVENT' as unknown,
          entityType: 'TENANT_VALIDATION',
          entityId: context.userTenantId || 'unknown',
          tenantId: context.userTenantId,
          userId: context.userId,
          metadata: JSON.stringify({
            violationType,
            details,
            context: {
              ip: context.ip,
              userAgent: context.userAgent,
              pathname: context.pathname,
              method: context.method,
            },
            timestamp: new Date().toISOString(),
            severity: 'HIGH',
          }),
        },
      })

      // Also log to console for immediate attention
      console.error('🚨 TENANT SECURITY VIOLATION:', {
        type: violationType,
        tenantId: context.userTenantId,
        userId: context.userId,
        ip: context.ip,
        pathname: context.pathname,
        details,
      })
    } catch (error) {}
  }

  /**
   * Cache management for tenant validation
   */
  private static generateCacheKey(type: string, identifier: string): string {
    // Use simple string concatenation for cache keys in Edge Runtime
    // This is safe as it's only used for internal caching, not security
    return `${type}:${identifier}`
  }

  private static getCachedResult(key: string): { isValid: boolean; tenantData?: unknown } | null {
    const cached = tenantValidationCache.get(key)
    if (!cached) return null

    if (Date.now() > cached.expiresAt) {
      tenantValidationCache.delete(key)
      return null
    }

    return cached
  }

  private static setCachedResult(
    key: string,
    result: { isValid: boolean; tenantData?: unknown }
  ): void {
    // Cleanup cache if it gets too large
    if (tenantValidationCache.size >= MAX_CACHE_SIZE) {
      const oldestKey = tenantValidationCache.keys().next().value
      tenantValidationCache.delete(oldestKey)
    }

    tenantValidationCache.set(key, {
      ...result,
      expiresAt: Date.now() + CACHE_TTL,
    })
  }

  /**
   * Clear cache for specific tenant
   */
  static clearTenantCache(tenantId: string): void {
    const keysToDelete: string[] = []
    for (const [key, value] of tenantValidationCache.entries()) {
      if (value.tenantData?.id === tenantId) {
        keysToDelete.push(key)
      }
    }
    keysToDelete.forEach((key) => tenantValidationCache.delete(key))
  }

  /**
   * Get validation statistics
   */
  static getValidationStats(): {
    cacheSize: number
    hitRate: number
    securityViolations: number
  } {
    // This would be implemented with proper metrics tracking
    return {
      cacheSize: tenantValidationCache.size,
      hitRate: 0.85, // Placeholder
      securityViolations: 0, // Placeholder
    }
  }
}

/**
 * Middleware wrapper for tenant validation
 */
export async function tenantValidationMiddleware(
  request: NextRequest
): Promise<NextResponse | null> {
  try {
    // Extract context from request
    const pathname = request.nextUrl.pathname
    const host = request.headers.get('host') || ''
    const subdomain = host.split('.')[0]

    // Skip validation for certain paths
    if (
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/favicon') ||
      pathname.startsWith('/robots.txt')
    ) {
      return null
    }

    // Extract tenant slug from subdomain
    let tenantSlug: string | undefined
    if (
      subdomain &&
      !['www', 'localhost', '127', '192', 'staging', 'app'].includes(subdomain) &&
      !host.includes('vercel.app') &&
      !host.includes('localhost')
    ) {
      tenantSlug = subdomain
    }

    // Get user context from auth (would be injected by auth middleware)
    const authHeader = request.headers.get('authorization')
    const userContext = await extractUserContext(request)

    const context: TenantValidationContext = {
      userTenantId: userContext?.tenantId,
      requestedTenantSlug: tenantSlug,
      userId: userContext?.userId,
      userRole: userContext?.role,
      ip: request.ip || request.headers.get('x-forwarded-for')?.split(',')[0],
      userAgent: request.headers.get('user-agent') || undefined,
      pathname,
      method: request.method,
    }

    // Perform validation
    const result = await TenantValidator.validateTenantAccess(context)

    if (!result.isValid) {
      if (result.securityViolation) {
        // Log security violation

        // Return 403 for security violations
        return new NextResponse('Access Denied', { status: 403 })
      } else {
        // Return 402 for subscription issues
        return new NextResponse('Subscription Required', { status: 402 })
      }
    }

    // Add tenant context to request headers for downstream handlers
    const response = NextResponse.next()
    if (result.tenant) {
      response.headers.set('x-tenant-id', result.tenant.id)
      response.headers.set('x-tenant-slug', result.tenant.slug)
    }

    return null // Continue processing
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

/**
 * Extract user context from request (placeholder implementation)
 */
async function extractUserContext(_request: NextRequest): Promise<{
  userId?: string
  tenantId?: string
  role?: string
} | null> {
  // This would extract from JWT, session, or other auth mechanism
  // Placeholder implementation
  return null
}
