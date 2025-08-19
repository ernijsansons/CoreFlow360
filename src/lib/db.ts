/**
 * CoreFlow360 - Database Configuration
 * EMERGENCY FIX: Build-safe Prisma client
 */

import { PrismaClient, Prisma } from '@prisma/client'

// Global variable to prevent multiple Prisma instances
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// EMERGENCY: Build phase detection
const isBuildPhase = () => {
  return !!(
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.BUILDING_FOR_VERCEL === '1' ||
    process.env.CI === 'true' ||
    process.env.VERCEL_ENV === 'production' ||
    process.env.VERCEL === '1'
  )
}

// Create Prisma client with lazy configuration
function createPrismaClient(): PrismaClient | null {
  // EMERGENCY: Return null during build phase to prevent connection attempts
  if (isBuildPhase()) {
    return null
  }

  // Get database URL
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/db'

  // Runtime configuration
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isProduction = process.env.NODE_ENV === 'production'

  return new PrismaClient({
    datasources: {
      db: { url: databaseUrl },
    },
    log: isDevelopment
      ? [
          { emit: 'event', level: 'query' },
          { emit: 'event', level: 'error' },
          { emit: 'event', level: 'warn' },
        ]
      : [{ emit: 'event', level: 'error' }],
    errorFormat: isDevelopment ? 'pretty' : 'minimal',
  })
}

// Export prisma instance with build-time protection
export const prisma = isBuildPhase() ? null : (globalForPrisma.prisma ?? createPrismaClient())

// Store in global only in non-production and non-build
if (process.env.NODE_ENV !== 'production' && !isBuildPhase()) {
  globalForPrisma.prisma = prisma
}

// Type exports
export type { Prisma }

// Legacy export for backward compatibility
export const db = prisma

// EMERGENCY: Safe database access function
export const getPrisma = () => {
  if (isBuildPhase()) {
    throw new Error('Database access not available during build phase')
  }
  if (!prisma) {
    throw new Error('Database client not initialized')
  }
  return prisma
}
