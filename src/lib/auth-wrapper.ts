/**
 * Auth wrapper to handle build-time and runtime auth safely
 */

import { getServerSession } from './auth'

export async function getSession() {
  // Skip auth during build time
  if (process.env.NEXT_PHASE === 'phase-production-build' || 
      process.env.BUILDING_FOR_VERCEL === '1' ||
      process.env.CI) {
    return null
  }

  // Use the built-in safe getServerSession
  return await getServerSession()
}

export { signIn, signOut } from './auth'