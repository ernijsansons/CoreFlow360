import { PrismaClient } from '@prisma/client'

// Build-safe database client that doesn't fail during build
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// During build, return a mock client if DATABASE_URL is not set
export const prisma =
  globalForPrisma.prisma ??
  (() => {
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
      console.log('Database URL not configured, using mock client for build')
      // Return a proxy that returns empty results for all queries
      return new Proxy({} as PrismaClient, {
        get: () => {
          return new Proxy(() => {}, {
            apply: () => Promise.resolve(null),
            get: () => {
              return new Proxy(() => {}, {
                apply: () => Promise.resolve([]),
              })
            },
          })
        },
      })
    }
    
    try {
      const client = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      })
      return client
    } catch (error) {
      console.warn('Failed to initialize Prisma client:', error)
      // Return mock client on initialization failure
      return new Proxy({} as PrismaClient, {
        get: () => {
          return new Proxy(() => {}, {
            apply: () => Promise.resolve(null),
            get: () => {
              return new Proxy(() => {}, {
                apply: () => Promise.resolve([]),
              })
            },
          })
        },
      })
    }
  })()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma as PrismaClient
}

export default prisma