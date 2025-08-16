/**
 * CoreFlow360 - Enhanced Database Configuration
 * Production-optimized Prisma client with advanced connection pooling
 */

import { PrismaClient, Prisma } from '@prisma/client'
import { config, database, isDevelopment, isProduction } from '@/lib/config/environment'

// Connection pool configuration based on environment
const getConnectionPoolConfig = () => {
  const baseConfig = {
    // Connection pool size (number of connections)
    connection_limit: isProduction ? 25 : 10,
    // Maximum time to wait for a connection from pool (in seconds)
    pool_timeout: 10,
    // Idle timeout before closing unused connections (in seconds)
    idle_in_transaction_session_timeout: 30,
    // Statement timeout to prevent long-running queries (in milliseconds)
    statement_timeout: isProduction ? 30000 : 60000, // 30s prod, 60s dev
    // Lock timeout to prevent deadlocks (in milliseconds)
    lock_timeout: 10000, // 10 seconds
    // SSL mode for production
    sslmode: isProduction ? 'require' : 'prefer',
  }

  // Additional production configurations
  if (isProduction) {
    return {
      ...baseConfig,
      // Enable prepared statements for better performance
      prepare: true,
      // Connection retry configuration
      connect_timeout: 30,
      // Keep-alive settings
      keepalives: 1,
      keepalives_idle: 30,
      keepalives_interval: 10,
      keepalives_count: 3,
      // Performance settings
      tcp_user_timeout: 30000,
      // Security
      ssl: true,
      sslcert: process.env.DATABASE_SSL_CERT,
      sslkey: process.env.DATABASE_SSL_KEY,
      sslrootcert: process.env.DATABASE_SSL_CA,
    }
  }

  return baseConfig
}

// Build connection URL with pool configuration
const buildConnectionUrl = (baseUrl: string): string => {
  if (!baseUrl.includes('postgresql://')) {
    return baseUrl // Return as-is for SQLite or other databases
  }

  const url = new URL(baseUrl)
  const poolConfig = getConnectionPoolConfig()

  // Add pool configuration as query parameters
  Object.entries(poolConfig).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value))
    }
  })

  // Add application name for monitoring
  url.searchParams.set('application_name', `coreflow360-${process.env.NODE_ENV || 'development'}`)

  // Add schema if not present
  if (!url.searchParams.has('schema')) {
    url.searchParams.set('schema', 'public')
  }

  return url.toString()
}

// Enhanced Prisma client configuration
const prismaConfig: Prisma.PrismaClientOptions = {
  // Comprehensive logging configuration
  log: isDevelopment 
    ? [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'info' }
      ]
    : [
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' }
      ],
  
  // Error formatting
  errorFormat: isDevelopment ? 'pretty' : 'minimal',
  
  // Datasource configuration
  datasources: {
    db: {
      url: buildConnectionUrl(database.url)
    }
  }
}

// Query performance monitoring
interface QueryMetrics {
  count: number
  totalDuration: number
  slowQueries: Array<{
    query: string
    duration: number
    timestamp: Date
  }>
}

const queryMetrics: QueryMetrics = {
  count: 0,
  totalDuration: 0,
  slowQueries: []
}

// Create enhanced Prisma client
function createEnhancedPrismaClient(): PrismaClient {
  const client = new PrismaClient(prismaConfig)
  
  // Query performance monitoring
  client.$on('query', async (e) => {
    queryMetrics.count++
    queryMetrics.totalDuration += e.duration
    
    // Track slow queries (> 1 second)
    if (e.duration > 1000) {
      queryMetrics.slowQueries.push({
        query: e.query,
        duration: e.duration,
        timestamp: new Date()
      })
      
      // Keep only last 100 slow queries
      if (queryMetrics.slowQueries.length > 100) {
        queryMetrics.slowQueries.shift()
      }
      
      if (isDevelopment) {
        console.warn(`⚠️ Slow query detected (${e.duration}ms):`, e.query)
      }
    }
  })
  
  // Error tracking
  client.$on('error', (e) => {
    console.error('❌ Database Error:', {
      message: e.message,
      target: e.target,
      timestamp: new Date().toISOString()
    })
  })
  
  // Warning tracking
  client.$on('warn', (e) => {
    console.warn('⚠️ Database Warning:', {
      message: e.message,
      timestamp: new Date().toISOString()
    })
  })
  
  return client
}

// Global variable to prevent multiple instances
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  connectionStartTime: number
}

// Initialize enhanced Prisma client
export const prisma = globalForPrisma.prisma ?? createEnhancedPrismaClient()

if (!globalForPrisma.connectionStartTime) {
  globalForPrisma.connectionStartTime = Date.now()
}

// Prevent multiple instances in development
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

// Connection pool health metrics
export async function getConnectionPoolMetrics() {
  try {
    // Get pool statistics using raw query
    const poolStats = await prisma.$queryRaw<Array<{
      state: string
      count: bigint
    }>>`
      SELECT state, count(*) 
      FROM pg_stat_activity 
      WHERE datname = current_database() 
      AND application_name LIKE 'coreflow360-%'
      GROUP BY state
    `
    
    const stats = {
      active: 0,
      idle: 0,
      idleInTransaction: 0,
      total: 0,
      uptime: Date.now() - globalForPrisma.connectionStartTime
    }
    
    poolStats.forEach(row => {
      const count = Number(row.count)
      stats.total += count
      
      switch (row.state) {
        case 'active':
          stats.active = count
          break
        case 'idle':
          stats.idle = count
          break
        case 'idle in transaction':
          stats.idleInTransaction = count
          break
      }
    })
    
    return stats
  } catch (error) {
    // Return empty stats if query fails (e.g., not PostgreSQL)
    return {
      active: 0,
      idle: 0,
      idleInTransaction: 0,
      total: 0,
      uptime: Date.now() - globalForPrisma.connectionStartTime
    }
  }
}

// Get query performance metrics
export function getQueryMetrics() {
  const avgDuration = queryMetrics.count > 0 
    ? queryMetrics.totalDuration / queryMetrics.count 
    : 0
    
  return {
    totalQueries: queryMetrics.count,
    avgDuration: Math.round(avgDuration),
    slowQueriesCount: queryMetrics.slowQueries.length,
    slowQueries: queryMetrics.slowQueries.slice(-10) // Last 10 slow queries
  }
}

// Enhanced health check with detailed metrics
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy'
  message: string
  responseTime?: number
  poolMetrics?: any
  queryMetrics?: any
}> {
  const startTime = Date.now()
  
  try {
    // Test connection with timeout
    await prisma.$queryRaw`SELECT 1`
    
    const responseTime = Date.now() - startTime
    
    // Get pool and query metrics
    const [poolMetrics, queryMetrics] = await Promise.all([
      getConnectionPoolMetrics(),
      Promise.resolve(getQueryMetrics())
    ])
    
    // Determine health status based on metrics
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    let message = 'Database connection successful'
    
    // Check for degraded conditions
    if (responseTime > 1000) {
      status = 'degraded'
      message = 'Database response time is high'
    } else if (poolMetrics.idleInTransaction > 5) {
      status = 'degraded'
      message = 'High number of idle transactions detected'
    } else if (queryMetrics.avgDuration > 500) {
      status = 'degraded'
      message = 'Average query duration is high'
    }
    
    return {
      status,
      message,
      responseTime,
      poolMetrics,
      queryMetrics
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    return {
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Database connection failed',
      responseTime
    }
  }
}

// Transaction with retry logic
export async function withRetry<T>(
  operation: (tx: Prisma.TransactionClient) => Promise<T>,
  options: {
    maxRetries?: number
    retryDelay?: number
    isolationLevel?: Prisma.TransactionIsolationLevel
  } = {}
): Promise<T> {
  const { 
    maxRetries = 3, 
    retryDelay = 100,
    isolationLevel = Prisma.TransactionIsolationLevel.ReadCommitted
  } = options
  
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await prisma.$transaction(operation, {
        isolationLevel,
        maxWait: 5000, // 5 seconds
        timeout: 30000, // 30 seconds
      })
    } catch (error) {
      lastError = error as Error
      
      // Don't retry on certain errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002' || error.code === 'P2025') {
          throw error // Unique constraint or record not found
        }
      }
      
      // Wait before retry with exponential backoff
      if (attempt < maxRetries) {
        await new Promise(resolve => 
          setTimeout(resolve, retryDelay * Math.pow(2, attempt - 1))
        )
      }
    }
  }
  
  throw lastError || new Error('Transaction failed after retries')
}

// Graceful shutdown with connection draining
export async function disconnectDatabase(): Promise<void> {
  try {
    // Log final metrics before shutdown
    console.log('📊 Final database metrics:', {
      pool: await getConnectionPoolMetrics(),
      queries: getQueryMetrics()
    })
    
    await prisma.$disconnect()
  } catch (error) {
    console.error('Error closing database connection:', error)
  }
}

// Handle process termination
const isEdgeRuntime = typeof (globalThis as any).EdgeRuntime !== 'undefined'
if (typeof process !== 'undefined' && typeof process.on === 'function' && !isEdgeRuntime) {
  let isShuttingDown = false
  
  const gracefulShutdown = async (signal: string) => {
    if (isShuttingDown) return
    isShuttingDown = true
    
    console.log(`\n📋 Received ${signal}, starting graceful shutdown...`)
    
    // Give ongoing queries 10 seconds to complete
    setTimeout(() => {
      console.log('⏱️ Shutdown timeout reached, forcing exit')
      process.exit(1)
    }, 10000)
    
    await disconnectDatabase()
    process.exit(0)
  }
  
  process.on('SIGINT', () => gracefulShutdown('SIGINT'))
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
}

// Export utilities
export { prisma as db }
export default prisma