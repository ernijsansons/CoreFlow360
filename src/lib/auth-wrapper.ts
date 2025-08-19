/**
 * Auth wrapper to handle build-time and runtime auth safely
 */

import {
  getServerSession as authGetServerSession,
  signIn as authSignIn,
  signOut as authSignOut,
} from './auth-simple'
import type { Session } from 'next-auth'

// Build-time detection
const isBuildTime = () => {
  return !!(
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.BUILDING_FOR_VERCEL === '1' ||
    process.env.CI === 'true' ||
    process.env.VERCEL_ENV === 'production' ||
    (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL)
  )
}

export async function getSession(): Promise<Session | null> {
  // Always return null during build time
  if (isBuildTime()) {
    return null
  }

  try {
    // Attempt to get session
    const session = await authGetServerSession()

    // Validate session object
    if (session && typeof session === 'object' && 'user' in session) {
      return session
    }

    // If session is an error object or invalid, return null
    return null
  } catch (error) {
    // Log error but don't throw - return null instead

    return null
  }
}

export const getServerSession = authGetServerSession
export const signIn = authSignIn
export const signOut = authSignOut
