/**
 * CoreFlow360 - Optimized Database Client
 * Prisma client with connection pooling and performance optimizations
 */

import { PrismaClient, Prisma } from '@prisma/client'
import { performanceMetrics } from '@/lib/cache/metrics-cache'

// Prisma log levels
const logLevels: Prisma.LogLevel[] = 
  process.env.NODE_ENV === 'production' 
    ? ['error', 'warn']
    : ['query', 'error', 'warn']

// Connection pool configuration
const poolConfig = {
  connection_limit: parseInt(process.env.DB_POOL_SIZE || '10'),
  pool_timeout: parseInt(process.env.DB_POOL_TIMEOUT || '20'),
  pool_idle_timeout: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '300'),
  statement_cache_size: parseInt(process.env.DB_STATEMENT_CACHE_SIZE || '100')
}

/**
 * Create optimized Prisma client
 */
function createPrismaClient() {
  const client = new PrismaClient({
    log: logLevels.map(level => ({
      level,
      emit: 'event'
    })),
    datasources: {
      db: {
        url: process.env.DATABASE_URL + `?connection_limit=${poolConfig.connection_limit}&pool_timeout=${poolConfig.pool_timeout}`
      }
    }
  })
  
  // Add query logging in development
  if (process.env.NODE_ENV !== 'production') {
    // @ts-ignore
    client.$on('query', async (e: Prisma.QueryEvent) => {
      console.log(`Query: ${e.query}`)
      console.log(`Duration: ${e.duration}ms`)
      
      // Track slow queries
      if (e.duration > 100) {
        console.warn(`⚠️ Slow query detected (${e.duration}ms):`, e.query)
      }
      
      // Track metrics
      await performanceMetrics.trackQueryTime('query', e.duration, true)
    })
  }
  
  // Error logging
  // @ts-ignore
  client.$on('error', async (e: Prisma.LogEvent) => {
    console.error('Prisma error:', e)
    await performanceMetrics.trackQueryTime('error', 0, false)
  })
  
  // Warning logging
  // @ts-ignore
  client.$on('warn', (e: Prisma.LogEvent) => {
    console.warn('Prisma warning:', e)
  })
  
  return client
}

// Global Prisma client instance
let prisma: PrismaClient

// Create singleton instance
if (process.env.NODE_ENV === 'production') {
  prisma = createPrismaClient()
} else {
  // In development, avoid creating multiple instances
  if (!(global as any).prisma) {
    (global as any).prisma = createPrismaClient()
  }
  prisma = (global as any).prisma
}

/**
 * Enhanced Prisma client with middleware
 */
export const db = prisma.$extends({
  name: 'CoreFlow360DB',
  query: {
    // Add automatic tenant filtering
    $allModels: {
      async findMany({ model, operation, args, query }) {
        // Add tenant filtering if model has tenantId
        if (args.where && !args.where.tenantId && (global as any).currentTenantId) {
          args.where.tenantId = (global as any).currentTenantId
        }
        
        const start = Date.now()
        const result = await query(args)
        const duration = Date.now() - start
        
        // Track metrics
        await performanceMetrics.trackQueryTime(`${model}.${operation}`, duration, true)
        
        return result
      },
      
      async findFirst({ model, operation, args, query }) {
        if (args.where && !args.where.tenantId && (global as any).currentTenantId) {
          args.where.tenantId = (global as any).currentTenantId
        }
        
        const start = Date.now()
        const result = await query(args)
        const duration = Date.now() - start
        
        await performanceMetrics.trackQueryTime(`${model}.${operation}`, duration, true)
        
        return result
      },
      
      async findUnique({ model, operation, args, query }) {
        const start = Date.now()
        const result = await query(args)
        const duration = Date.now() - start
        
        await performanceMetrics.trackQueryTime(`${model}.${operation}`, duration, true)
        
        return result
      },
      
      async create({ model, operation, args, query }) {
        // Auto-add tenantId for create operations
        if (args.data && !args.data.tenantId && (global as any).currentTenantId) {
          args.data.tenantId = (global as any).currentTenantId
        }
        
        const start = Date.now()
        const result = await query(args)
        const duration = Date.now() - start
        
        await performanceMetrics.trackQueryTime(`${model}.${operation}`, duration, true)
        
        return result
      },
      
      async update({ model, operation, args, query }) {
        const start = Date.now()
        const result = await query(args)
        const duration = Date.now() - start
        
        await performanceMetrics.trackQueryTime(`${model}.${operation}`, duration, true)
        
        return result
      },
      
      async delete({ model, operation, args, query }) {
        const start = Date.now()
        const result = await query(args)
        const duration = Date.now() - start
        
        await performanceMetrics.trackQueryTime(`${model}.${operation}`, duration, true)
        
        return result
      }
    }
  },
  
  model: {
    $allModels: {
      // Add soft delete support
      async softDelete<T>(this: T, where: any) {
        const context = Prisma.getExtensionContext(this)
        // @ts-ignore
        return (context as any).update({
          where,
          data: {
            deletedAt: new Date()
          }
        })
      },
      
      // Find with soft delete filter
      async findManyActive<T>(this: T, args?: any) {
        const context = Prisma.getExtensionContext(this)
        // @ts-ignore
        return (context as any).findMany({
          ...args,
          where: {
            ...args?.where,
            deletedAt: null
          }
        })
      },
      
      // Count active records
      async countActive<T>(this: T, args?: any) {
        const context = Prisma.getExtensionContext(this)
        // @ts-ignore
        return (context as any).count({
          ...args,
          where: {
            ...args?.where,
            deletedAt: null
          }
        })
      }
    }
  }
})

/**
 * Database utilities
 */
export const dbUtils = {
  /**
   * Execute raw query with metrics
   */
  async $queryRaw<T = unknown>(
    query: TemplateStringsArray | Prisma.Sql,
    ...values: any[]
  ): Promise<T> {
    const start = Date.now()
    
    try {
      const result = await prisma.$queryRaw<T>(query, ...values)
      const duration = Date.now() - start
      
      await performanceMetrics.trackQueryTime('raw_query', duration, true)
      
      return result
    } catch (error) {
      const duration = Date.now() - start
      await performanceMetrics.trackQueryTime('raw_query', duration, false)
      throw error
    }
  },
  
  /**
   * Execute transaction with retry
   */
  async transaction<T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
    options?: {
      maxWait?: number
      timeout?: number
      retries?: number
    }
  ): Promise<T> {
    const maxRetries = options?.retries || 3
    let lastError: any
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        const start = Date.now()
        
        const result = await prisma.$transaction(fn, {
          maxWait: options?.maxWait || 5000,
          timeout: options?.timeout || 10000
        })
        
        const duration = Date.now() - start
        await performanceMetrics.trackQueryTime('transaction', duration, true)
        
        return result
      } catch (error: any) {
        lastError = error
        
        // Check if error is retryable
        if (
          error.code === 'P2034' || // Transaction conflict
          error.code === 'P2024' || // Timed out
          error.message?.includes('deadlock')
        ) {
          console.warn(`Transaction retry ${i + 1}/${maxRetries}:`, error.message)
          
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 100))
          continue
        }
        
        // Non-retryable error
        throw error
      }
    }
    
    throw lastError
  },
  
  /**
   * Batch operations
   */
  async batchCreate<T>(
    model: any,
    data: T[],
    batchSize: number = 100
  ): Promise<number> {
    let created = 0
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize)
      const result = await model.createMany({
        data: batch,
        skipDuplicates: true
      })
      created += result.count
    }
    
    return created
  },
  
  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`
      return true
    } catch {
      return false
    }
  },
  
  /**
   * Get connection pool stats
   */
  async getPoolStats() {
    try {
      const [poolStats] = await prisma.$queryRaw<any[]>`
        SELECT 
          count(*) as total_connections,
          count(*) filter (where state = 'idle') as idle_connections,
          count(*) filter (where state = 'active') as active_connections,
          max(extract(epoch from (now() - state_change))) as max_idle_time
        FROM pg_stat_activity
        WHERE datname = current_database()
      `
      
      return {
        total: parseInt(poolStats.total_connections),
        idle: parseInt(poolStats.idle_connections),
        active: parseInt(poolStats.active_connections),
        maxIdleTime: parseFloat(poolStats.max_idle_time || 0)
      }
    } catch (error) {
      console.error('Failed to get pool stats:', error)
      return null
    }
  },
  
  /**
   * Optimize tables
   */
  async vacuum(tables?: string[]) {
    const tablesToVacuum = tables || [
      'User', 'Customer', 'Deal', 'Project',
      'Invoice', 'Activity', 'AIInsight'
    ]
    
    for (const table of tablesToVacuum) {
      try {
        await prisma.$executeRawUnsafe(`VACUUM ANALYZE "${table}"`)
        console.log(`✅ Vacuumed table: ${table}`)
      } catch (error) {
        console.error(`Failed to vacuum ${table}:`, error)
      }
    }
  }
}

/**
 * Set current tenant for automatic filtering
 */
export function setCurrentTenant(tenantId: string | null) {
  (global as any).currentTenantId = tenantId
}

/**
 * Clear current tenant
 */
export function clearCurrentTenant() {
  delete (global as any).currentTenantId
}

// Export the enhanced client as default
export default db