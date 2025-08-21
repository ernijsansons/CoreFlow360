/**
 * CoreFlow360 - Authentication Context
 * Manages user authentication state and permissions
 */

'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  UserSession,
  UserRole,
  Permission,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canAccessRole,
} from '@/types/auth'

interface AuthContextType {
  user: UserSession | null
  loading: boolean
  error: string | null

  // Authentication methods
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>

  // Permission checks
  hasPermission: (permission: Permission) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
  hasAllPermissions: (permissions: Permission[]) => boolean
  canAccessRole: (targetRole: UserRole) => boolean

  // User preferences
  updatePreferences: (preferences: Partial<UserSession['preferences']>) => Promise<void>

  // Module access
  hasModule: (module: string) => boolean
  hasAllModules: (modules: string[]) => boolean
  hasAnyModule: (modules: string[]) => boolean
}

const defaultAuthValue: AuthContextType = {
  user: null,
  loading: false,
  error: null,
  login: async () => {},
  logout: async () => {},
  refreshSession: async () => {},
  hasPermission: () => false,
  hasAnyPermission: () => false,
  hasAllPermissions: () => false,
  canAccessRole: () => false,
  updatePreferences: async () => {},
  hasModule: () => false,
  hasAllModules: () => false,
  hasAnyModule: () => false,
}

const AuthContext = createContext<AuthContextType>(defaultAuthValue)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize session from localStorage or API
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true)
        setError(null)

        // Check for existing session
        const storedSession = localStorage.getItem('userSession')
        if (storedSession) {
          const session = JSON.parse(storedSession) as UserSession
          // Validate session with API
          // const validated = await validateSession(session.id)
          setUser(session)
        }

        // In production, validate with API
        // const response = await fetch('/api/auth/session')
        // if (response.ok) {
        //   const session = await response.json()
        //   setUser(session)
        // }
      } catch (err) {
        setError('Failed to initialize authentication')
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = useCallback(async (_email: string, _password: string) => {
    try {
      setLoading(true)
      setError(null)

      // Demo login - in production, this would call the API
      const demoUser: UserSession = {
        id: 'demo-user-1',
        email,
        name: email.split('@')[0],
        role: email.includes('admin')
          ? UserRole.ORG_ADMIN
          : email.includes('super')
            ? UserRole.SUPER_ADMIN
            : email.includes('manager')
              ? UserRole.DEPARTMENT_MANAGER
              : UserRole.USER,
        permissions: [], // Will be set based on role
        tenantId: 'demo-tenant',
        activeModules: ['crm', 'accounting', 'projects'],
        preferences: {
          theme: 'dark',
          language: 'en',
          timezone: 'UTC',
          notifications: {
            email: true,
            sms: false,
            inApp: true,
            desktop: true,
            frequency: 'realtime',
            categories: ['urgent', 'deals', 'tasks'],
          },
          dashboard: {
            layout: 'grid',
            widgets: ['revenue', 'tasks', 'deals', 'team'],
            customWidgets: [],
            refreshInterval: 300,
          },
          aiAssistant: {
            enabled: true,
            automationLevel: 'medium',
            suggestions: true,
            voiceCommands: false,
            naturalLanguageSearch: true,
          },
        },
        mfaEnabled: false,
        lastActivity: new Date(),
      }

      // Set permissions based on role
      const { ROLE_PERMISSIONS } = await import('@/types/auth')
      demoUser.permissions = ROLE_PERMISSIONS[demoUser.role]

      // Store session
      localStorage.setItem('userSession', JSON.stringify(demoUser))
      setUser(demoUser)

      // In production:
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // })
      // const session = await response.json()
      // setUser(session)
    } catch (err) {
      setError('Invalid credentials')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      setLoading(true)
      localStorage.removeItem('userSession')
      setUser(null)

      // In production:
      // await fetch('/api/auth/logout', { method: 'POST' })
    } catch (err) {
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshSession = useCallback(async () => {
    if (!user) return

    try {
      // In production, refresh from API
      // const response = await fetch('/api/auth/refresh')
      // const session = await response.json()
      // setUser(session)

      // For demo, just update last activity
      const updatedUser = { ...user, lastActivity: new Date() }
      localStorage.setItem('userSession', JSON.stringify(updatedUser))
      setUser(updatedUser)
    } catch (err) {}
  }, [user])

  const updatePreferences = useCallback(
    async (preferences: Partial<UserSession['preferences']>) => {
      if (!user) return

      try {
        const updatedUser = {
          ...user,
          preferences: {
            ...user.preferences,
            ...preferences,
          },
        }

        localStorage.setItem('userSession', JSON.stringify(updatedUser))
        setUser(updatedUser)

        // In production:
        // await fetch('/api/user/preferences', {
        //   method: 'PATCH',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(preferences)
        // })
      } catch (err) {
        throw err
      }
    },
    [user]
  )

  // Permission check methods
  const hasPermissionCheck = useCallback(
    (permission: Permission): boolean => {
      if (!user) return false
      return hasPermission(user.permissions, permission)
    },
    [user]
  )

  const hasAnyPermissionCheck = useCallback(
    (permissions: Permission[]): boolean => {
      if (!user) return false
      return hasAnyPermission(user.permissions, permissions)
    },
    [user]
  )

  const hasAllPermissionsCheck = useCallback(
    (permissions: Permission[]): boolean => {
      if (!user) return false
      return hasAllPermissions(user.permissions, permissions)
    },
    [user]
  )

  const canAccessRoleCheck = useCallback(
    (targetRole: UserRole): boolean => {
      if (!user) return false
      return canAccessRole(user.role, targetRole)
    },
    [user]
  )

  // Module access methods
  const hasModule = useCallback(
    (module: string): boolean => {
      if (!user) return false
      return user.activeModules.includes(module)
    },
    [user]
  )

  const hasAllModules = useCallback(
    (modules: string[]): boolean => {
      if (!user) return false
      return modules.every((module) => user.activeModules.includes(module))
    },
    [user]
  )

  const hasAnyModule = useCallback(
    (modules: string[]): boolean => {
      if (!user) return false
      return modules.some((module) => user.activeModules.includes(module))
    },
    [user]
  )

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
    refreshSession,
    hasPermission: hasPermissionCheck,
    hasAnyPermission: hasAnyPermissionCheck,
    hasAllPermissions: hasAllPermissionsCheck,
    canAccessRole: canAccessRoleCheck,
    updatePreferences,
    hasModule,
    hasAllModules,
    hasAnyModule,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook for using auth context
export function useAuth() {
  const context = useContext(AuthContext)
  return context
}

// Convenience hooks for common checks
export function usePermission(permission: Permission): boolean {
  const { hasPermission } = useAuth()
  return hasPermission(permission)
}

export function useRole(): UserRole | null {
  const { user } = useAuth()
  return user?.role || null
}

export function useIsAdmin(): boolean {
  const { user } = useAuth()
  return user?.role === UserRole.ORG_ADMIN || user?.role === UserRole.SUPER_ADMIN
}

export function useIsSuperAdmin(): boolean {
  const { user } = useAuth()
  return user?.role === UserRole.SUPER_ADMIN
}
