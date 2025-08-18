/**
 * CoreFlow360 - Database Configuration
 * Build-safe Prisma client
 */

import { PrismaClient, Prisma } from '@prisma/client'

// Global variable to prevent multiple Prisma instances
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client with lazy configuration
function createPrismaClient(): PrismaClient {
  // Get database URL
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/db'
  
  // During build phase, use minimal configuration
  if (process.env.NEXT_PHASE === 'phase-production-build' ||
      process.env.BUILDING_FOR_VERCEL === '1' ||
      process.env.CI === 'true') {
    return new PrismaClient({
      datasources: {
        db: { url: databaseUrl }
      },
      log: []
    })
  }

  // Runtime configuration
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isProduction = process.env.NODE_ENV === 'production'

  return new PrismaClient({
    datasources: {
      db: { url: databaseUrl }
    },
    log: isDevelopment 
      ? [
          { emit: 'event', level: 'query' },
          { emit: 'event', level: 'error' },
          { emit: 'event', level: 'warn' }
        ]
      : [{ emit: 'event', level: 'error' }],
    errorFormat: isDevelopment ? 'pretty' : 'minimal'
  })
}

// Export prisma instance
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// Store in global only in non-production
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Type exports
export type { Prisma }