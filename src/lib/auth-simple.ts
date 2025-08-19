/**
 * Simplified auth exports for build-time compatibility
 */

import type { Session } from 'next-auth'

// Mock functions for build time
export async function getServerSession(): Promise<Session | null> {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return null
  }
  const { getServerSession: realGetServerSession } = await import('./auth')
  return realGetServerSession()
}

export async function signIn(...args: unknown[]) {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return { error: 'Build time' }
  }
  const { signIn: realSignIn } = await import('./auth')
  return realSignIn(...args)
}

export async function signOut(...args: unknown[]) {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return { success: false }
  }
  const { signOut: realSignOut } = await import('./auth')
  return realSignOut(...args)
}
