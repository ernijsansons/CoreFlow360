/**
 * CoreFlow360 - Protected Route Component
 * Ensures authentication before accessing protected pages
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { Brain, Lock } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Brain className="mx-auto mb-4 h-16 w-16 animate-pulse text-purple-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading your workspace...</p>
        </motion.div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Lock className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">Redirecting to login...</p>
        </motion.div>
      </div>
    )
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-md rounded-lg bg-white p-6 text-center shadow-lg dark:bg-gray-800"
        >
          <Lock className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            Access Denied
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            You don't have permission to access this page. This area requires {requiredRole}{' '}
            privileges.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
          >
            Return to Dashboard
          </button>
        </motion.div>
      </div>
    )
  }

  return <>{children}</>
}
