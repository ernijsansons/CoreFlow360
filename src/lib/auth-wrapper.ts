/**
 * Auth wrapper to handle build-time and runtime auth safely
 */

import { auth as nextAuth } from './auth'

export async function getSession() {
  // Skip auth during build time or in Edge runtime
  if (process.env.NEXT_PHASE === 'phase-production-build' || 
      process.env.BUILDING_FOR_VERCEL === '1' ||
      process.env.VERCEL_ENV === 'production' ||
      process.env.CI ||
      typeof globalThis.EdgeRuntime !== 'undefined') {
    return null
  }

  try {
    return await nextAuth()
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}

export { signIn, signOut } from './auth'