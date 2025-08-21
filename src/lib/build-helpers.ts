/**
 * Build-time helpers to prevent errors during Vercel deployment
 */

// Check if we're in build/deployment phase
export const isBuildPhase = () => {
  return !!(
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.BUILDING_FOR_VERCEL === '1' ||
    process.env.CI === 'true' ||
    process.env.VERCEL === '1' ||
    process.env.VERCEL_ENV
  )
}

// Check if database should be skipped
export const shouldSkipDatabase = () => {
  return isBuildPhase() || process.env.DATABASE_SKIP_SEEDING === 'true'
}

// Check if auth should be skipped
export const shouldSkipAuth = () => {
  return isBuildPhase() || process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true'
}

// Get safe environment variable with fallback
export const getEnvSafe = (key: string, fallback: string = ''): string => {
  if (isBuildPhase()) {
    return fallback
  }
  return process.env[key] || fallback
}

// Mock data for build time
export const buildTimeMocks = {
  session: {
    user: {
      id: 'build-user',
      email: 'build@example.com',
      name: 'Build User',
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  tenant: {
    id: 'build-tenant',
    name: 'Build Tenant',
  },
}