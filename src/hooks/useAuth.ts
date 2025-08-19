/**
 * CoreFlow360 - Authentication Hook
 * Provides consistent authentication state and methods across the application
 */

import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { api, ApiError } from '@/lib/api-client'

export interface AuthUser {
  id: string
  email: string
  name: string
  tenantId: string
  role: string
  permissions?: string[]
}

export interface UseAuthReturn {
  user: AuthUser | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  checkPermission: (permission: string) => boolean
}

/**
 * Custom hook for authentication
 */
export function useAuth(): UseAuthReturn {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  // Derive user from session
  const user: AuthUser | null = session?.user
    ? {
        id: session.user.id!,
        email: session.user.email!,
        name: session.user.name!,
        tenantId: session.user.tenantId!,
        role: session.user.role || 'USER',
        permissions: session.user.permissions,
      }
    : null

  const loading = status === 'loading'
  const isAuthenticated = status === 'authenticated' && !!user

  /**
   * Login method
   */
  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        setError(null)

        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })

        if (result?.error) {
          setError(
            result.error === 'CredentialsSignin' ? 'Invalid email or password' : result.error
          )
          return false
        }

        if (result?.ok) {
          // Refresh the session to get latest data
          await update()
          return true
        }

        return false
      } catch (err) {
        setError('An unexpected error occurred during login')
        return false
      }
    },
    [update]
  )

  /**
   * Logout method
   */
  const logout = useCallback(async () => {
    try {
      setError(null)

      // Call logout API endpoint if needed
      try {
        await api.post('/api/auth/logout', {})
      } catch (err) {
        // Ignore logout API errors - we'll still sign out locally
      }

      // Sign out from NextAuth
      await signOut({
        redirect: false,
      })

      // Redirect to login
      router.push('/login')
    } catch (err) {
      setError('Failed to logout')
    }
  }, [router])

  /**
   * Refresh session
   */
  const refreshSession = useCallback(async () => {
    try {
      await update()
    } catch (err) {
      setError('Failed to refresh session')
    }
  }, [update])

  /**
   * Check if user has a specific permission
   */
  const checkPermission = useCallback(
    (permission: string): boolean => {
      if (!user?.permissions) return false

      // Check for wildcard permissions
      const parts = permission.split(':')
      const resource = parts[0]

      return user.permissions.some((p) => p === permission || p === `${resource}:*` || p === '*')
    },
    [user]
  )

  /**
   * Handle authentication errors globally
   */
  useEffect(() => {
    const handleAuthError = (event: CustomEvent) => {
      if (event.detail?.statusCode === 401) {
        // Session expired or invalid
        signOut({ redirect: false })
        router.push('/login?error=session_expired')
      }
    }

    window.addEventListener('auth:error' as unknown, handleAuthError)
    return () => {
      window.removeEventListener('auth:error' as unknown, handleAuthError)
    }
  }, [router])

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    refreshSession,
    checkPermission,
  }
}

/**
 * Hook to require authentication
 * Redirects to login if not authenticated
 */
export function useRequireAuth(redirectTo: string = '/login') {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(`${redirectTo}?callbackUrl=${encodeURIComponent(window.location.pathname)}`)
    }
  }, [isAuthenticated, loading, router, redirectTo])

  return { isAuthenticated, loading }
}

/**
 * Hook to check specific permissions
 */
export function usePermission(permission: string | string[]) {
  const { checkPermission, isAuthenticated } = useAuth()

  const hasPermission =
    isAuthenticated &&
    (Array.isArray(permission)
      ? permission.some((p) => checkPermission(p))
      : checkPermission(permission))

  return hasPermission
}
