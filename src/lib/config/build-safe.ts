/**
 * Build-safe configuration
 * This file provides safe defaults during build time
 */

// Check if we're in build phase
export function isBuildPhase(): boolean {
  return !!(
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.BUILDING_FOR_VERCEL === '1' ||
    process.env.VERCEL_ENV === 'production' ||
    process.env.CI === 'true' ||
    !process.env.DATABASE_URL
  )
}

// Safe environment access
export function getEnvVar(key: string, defaultValue = ''): string {
  if (isBuildPhase()) {
    return defaultValue
  }
  return process.env[key] || defaultValue
}

// Safe boolean environment access
export function getEnvBool(key: string, defaultValue = false): boolean {
  if (isBuildPhase()) {
    return defaultValue
  }
  const value = process.env[key]
  return value === 'true' || value === '1'
}

// Safe number environment access
export function getEnvNumber(key: string, defaultValue = 0): number {
  if (isBuildPhase()) {
    return defaultValue
  }
  const value = process.env[key]
  return value ? parseInt(value, 10) : defaultValue
}
