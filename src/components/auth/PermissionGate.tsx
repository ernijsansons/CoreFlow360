/**
 * CoreFlow360 - Permission Gate Component
 * Conditionally renders content based on user permissions
 */

'use client'

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Permission, UserRole } from '@/types/auth'

interface PermissionGateProps {
  children: React.ReactNode
  permissions?: Permission[]
  roles?: UserRole[]
  requireAll?: boolean
  fallback?: React.ReactNode
  showError?: boolean
}

export function PermissionGate({
  children,
  permissions = [],
  roles = [],
  requireAll = false,
  fallback = null,
  showError = false,
}: PermissionGateProps) {
  const { user, hasPermission, hasAnyPermission, hasAllPermissions } = useAuth()

  // Check if user is authenticated
  if (!user) {
    return showError ? (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-600">You must be logged in to view this content.</p>
      </div>
    ) : (
      <>{fallback}</>
    )
  }

  // Check permissions
  let hasRequiredPermissions = true
  if (permissions.length > 0) {
    hasRequiredPermissions = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions)
  }

  // Check roles
  let hasRequiredRole = true
  if (roles.length > 0) {
    hasRequiredRole = roles.includes(user.role)
  }

  // Determine if user has access
  const hasAccess = requireAll
    ? hasRequiredPermissions && hasRequiredRole
    : hasRequiredPermissions || (roles.length > 0 && hasRequiredRole)

  if (!hasAccess) {
    return showError ? (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <p className="text-yellow-800">You don't have permission to view this content.</p>
      </div>
    ) : (
      <>{fallback}</>
    )
  }

  return <>{children}</>
}

// Specialized permission gates for common use cases
export function AdminGate({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <PermissionGate roles={[UserRole.ORG_ADMIN, UserRole.SUPER_ADMIN]} fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

export function SuperAdminGate({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <PermissionGate roles={[UserRole.SUPER_ADMIN]} fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

export function ManagerGate({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <PermissionGate
      roles={[UserRole.DEPARTMENT_MANAGER, UserRole.ORG_ADMIN, UserRole.SUPER_ADMIN]}
      fallback={fallback}
    >
      {children}
    </PermissionGate>
  )
}

// Module-specific gates
export function ModuleGate({
  module,
  children,
  fallback,
}: {
  module: string
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { hasModule } = useAuth()

  if (!hasModule(module)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Feature flag gate (for gradual rollouts)
export function FeatureGate({
  feature,
  children,
  fallback,
}: {
  feature: string
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { user } = useAuth()

  // Check if feature is enabled for user's role or tenant
  // This would check against feature flags in production
  const isEnabled =
    user &&
    (user.role === UserRole.SUPER_ADMIN ||
      // Check feature flags from user preferences or tenant settings
      false)

  if (!isEnabled) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
