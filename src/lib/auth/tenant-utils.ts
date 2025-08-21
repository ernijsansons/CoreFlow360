/**
 * Tenant Utilities for Secure Multi-tenancy
 * CRITICAL: All API routes must use getTenantFromSession() to enforce tenant isolation
 */

import { auth } from '@/lib/auth'
import { NextRequest } from 'next/server'
import { headers } from 'next/headers'

/**
 * SECURITY CRITICAL: Get tenant ID from authenticated session
 * This function ensures that users can only access data from their own tenant
 * 
 * @param request - Next.js request object (optional for API routes)
 * @returns Promise<string> - Tenant ID from session
 * @throws Error if no valid session or tenant ID found
 */
export async function getTenantFromSession(request?: NextRequest): Promise<string> {
  // Build-time check to prevent authentication during static generation
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV) {
    throw new Error('Build-time: Authentication not available during static generation')
  }

  try {
    // Get session from server
    const session = await auth()
    
    if (!session?.user?.id) {
      throw new Error('Unauthorized: No valid session found')
    }

    // For now, derive tenant from user ID or organization
    // In production, this should come from the user's organization/tenant relationship in the database
    const tenantId = session.user.tenantId || session.user.organizationId || `tenant_${session.user.id}`
    
    if (!tenantId) {
      throw new Error('Unauthorized: No tenant association found')
    }

    return tenantId
  } catch (error) {
    console.error('Failed to get tenant from session:', error)
    throw new Error('Unauthorized: Invalid tenant access')
  }
}

/**
 * SECURITY: Validate that a resource belongs to the current tenant
 * 
 * @param resourceTenantId - Tenant ID associated with the resource
 * @param sessionTenantId - Tenant ID from the user's session
 * @throws Error if tenant mismatch detected
 */
export function validateTenantAccess(resourceTenantId: string, sessionTenantId: string): void {
  if (resourceTenantId !== sessionTenantId) {
    throw new Error('Forbidden: Access denied to resource outside your tenant')
  }
}

/**
 * Get user ID from session
 * 
 * @returns Promise<string> - User ID from session
 * @throws Error if no valid session found
 */
export async function getUserFromSession(): Promise<{ id: string; email?: string }> {
  // Build-time check to prevent authentication during static generation
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV) {
    throw new Error('Build-time: Authentication not available during static generation')
  }

  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error('Unauthorized: No valid session found')
  }

  return {
    id: session.user.id,
    email: session.user.email || undefined
  }
}

/**
 * Middleware helper to extract tenant from request headers
 * Used for API routes that need tenant context
 */
export async function getTenantFromHeaders(): Promise<string | null> {
  try {
    const headersList = headers()
    const tenantHeader = headersList.get('x-tenant-id')
    
    if (tenantHeader) {
      // Validate that the header tenant matches the session tenant
      const sessionTenant = await getTenantFromSession()
      if (tenantHeader !== sessionTenant) {
        throw new Error('Tenant mismatch between header and session')
      }
      return tenantHeader
    }
    
    return null
  } catch (error) {
    console.error('Failed to get tenant from headers:', error)
    return null
  }
}