/**
 * CoreFlow360 - Database Maintenance
 * Tools for database optimization and maintenance
 */

import { db, dbUtils } from './client'
import { performanceMetrics } from '@/lib/cache/metrics-cache'

/**
 * Database maintenance operations
 */
export const dbMaintenance = {
  /**
   * Clean up old data
   */
  async cleanup(
    options: {
      daysToKeep?: number
      tables?: string[]
      dryRun?: boolean
    } = {}
  ) {
    const { daysToKeep = 90, tables, dryRun = false } = options
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    console.log(`CLEAN Cleaning old data (cutoff: ${cutoffDate.toISOString()})...`)
    console.log(`Tables: ${tables?.join(', ') || 'all'}, Dry run: ${dryRun}`)

    const cleanupTasks = [
      {
        name: 'Old activities',
        table: 'Activity',
        execute: async () => {
          if (dryRun) {
            return await db.activity.count({
              where: { createdAt: { lt: cutoffDate } },
            })
          }
          const result = await db.activity.deleteMany({
            where: { createdAt: { lt: cutoffDate } },
          })
          return result.count
        },
      },
      {
        name: 'Old audit logs',
        table: 'AuditLog',
        execute: async () => {
          if (dryRun) {
            return await db.auditLog.count({
              where: { createdAt: { lt: cutoffDate } },
            })
          }
          const result = await db.auditLog.deleteMany({
            where: { createdAt: { lt: cutoffDate } },
          })
          return result.count
        },
      },
      {
        name: 'Expired sessions',
        table: 'Session',
        execute: async () => {
          if (dryRun) {
            return await db.session.count({
              where: { expires: { lt: new Date() } },
            })
          }
          const result = await db.session.deleteMany({
            where: { expires: { lt: new Date() } },
          })
          return result.count
        },
      },
      {
        name: 'Old conversion events',
        table: 'ConversionEvent',
        execute: async () => {
          const oldCutoff = new Date()
          oldCutoff.setDate(oldCutoff.getDate() - daysToKeep * 2) // Keep conversion data longer

          if (dryRun) {
            return await db.conversionEvent.count({
              where: { createdAt: { lt: oldCutoff } },
            })
          }
          const result = await db.conversionEvent.deleteMany({
            where: { createdAt: { lt: oldCutoff } },
          })
          return result.count
        },
      },
    ]

    const results = []
    for (const task of cleanupTasks) {
      if (tables && !tables.includes(task.table)) continue

      try {
        const count = await task.execute()
        results.push({ ...task, deleted: count })
        
      } catch (error) {
        
        results.push({ ...task, error: error.message })
      }
    }

    return results
  },

  /**
   * Optimize database tables
   */
  async optimize(tables?: string[]) {
    

    try {
      // Run VACUUM and ANALYZE
      await dbUtils.vacuum(tables)

      // Update statistics
      if (tables) {
        for (const table of tables) {
          await db.$executeRawUnsafe(`ANALYZE "${table}"`)
        }
      } else {
        await db.$executeRaw`ANALYZE`
      }

      
    } catch (error) {
      
      throw error
    }
  },

  /**
   * Check database health
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    checks: Array<{
      name: string
      status: 'pass' | 'fail'
      value?: unknown
      message?: string
    }>
  }> {
    const checks = []
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'

    // Connection check
    try {
      const isConnected = await dbUtils.healthCheck()
      checks.push({
        name: 'database_connection',
        status: isConnected ? 'pass' : 'fail',
        message: isConnected ? 'Connected' : 'Cannot connect to database',
      })

      if (!isConnected) {
        overallStatus = 'unhealthy'
      }
    } catch (error) {
      checks.push({
        name: 'database_connection',
        status: 'fail',
        message: error.message,
      })
      overallStatus = 'unhealthy'
    }

    // Pool stats check
    try {
      const poolStats = await dbUtils.getPoolStats()
      if (poolStats) {
        checks.push({
          name: 'connection_pool',
          status: 'pass',
          value: poolStats,
        })

        // Check for pool exhaustion
        if (poolStats.active / poolStats.total > 0.9) {
          overallStatus = 'degraded'
        }
      }
    } catch (error) {
      checks.push({
        name: 'connection_pool',
        status: 'fail',
        message: error.message,
      })
      if (overallStatus === 'healthy') overallStatus = 'degraded'
    }

    // Query performance check
    try {
      const start = Date.now()
      await db.$queryRaw`SELECT COUNT(*) FROM "User"`
      const duration = Date.now() - start

      checks.push({
        name: 'query_performance',
        status: duration < 1000 ? 'pass' : 'fail',
        value: `${duration}ms`,
        message: duration < 1000 ? 'Good performance' : 'Slow query detected',
      })

      if (duration > 1000 && overallStatus === 'healthy') {
        overallStatus = 'degraded'
      }
    } catch (error) {
      checks.push({
        name: 'query_performance',
        status: 'fail',
        message: error.message,
      })
      if (overallStatus === 'healthy') overallStatus = 'degraded'
    }

    // Index usage check
    try {
      const indexStats = await db.$queryRaw<unknown[]>`
        SELECT 
          schemaname,
          tablename,
          attname,
          n_distinct,
          correlation
        FROM pg_stats 
        WHERE schemaname = 'public'
        ORDER BY schemaname, tablename, attname
        LIMIT 10
      `

      checks.push({
        name: 'index_statistics',
        status: 'pass',
        value: indexStats.length,
      })
    } catch (error) {
      checks.push({
        name: 'index_statistics',
        status: 'fail',
        message: error.message,
      })
    }

    // Slow queries check
    try {
      const slowQueries = await db.$queryRaw<unknown[]>`
        SELECT 
          query,
          calls,
          total_time,
          mean_time
        FROM pg_stat_statements 
        WHERE mean_time > 100
        ORDER BY mean_time DESC 
        LIMIT 5
      `

      checks.push({
        name: 'slow_queries',
        status: slowQueries.length === 0 ? 'pass' : 'fail',
        value: slowQueries.length,
        message:
          slowQueries.length > 0
            ? `${slowQueries.length} slow queries detected`
            : 'No slow queries',
      })

      if (slowQueries.length > 5 && overallStatus === 'healthy') {
        overallStatus = 'degraded'
      }
    } catch (error) {
      // pg_stat_statements might not be enabled
      checks.push({
        name: 'slow_queries',
        status: 'fail',
        message: 'pg_stat_statements not available',
      })
    }

    return { status: overallStatus, checks }
  },

  /**
   * Generate database statistics report
   */
  async generateStatsReport() {
    

    try {
      const [tableStats, indexStats, queryStats, poolStats] = await Promise.all([
        this.getTableStats(),
        this.getIndexStats(),
        this.getQueryStats(),
        dbUtils.getPoolStats(),
      ])

      return {
        timestamp: new Date(),
        tables: tableStats,
        indexes: indexStats,
        queries: queryStats,
        connectionPool: poolStats,
      }
    } catch (error) {
      
      throw error
    }
  },

  /**
   * Get table statistics
   */
  async getTableStats() {
    const stats = await db.$queryRaw<unknown[]>`
      SELECT 
        schemaname,
        tablename,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes,
        n_live_tup as live_tuples,
        n_dead_tup as dead_tuples,
        last_vacuum,
        last_autovacuum,
        last_analyze,
        last_autoanalyze
      FROM pg_stat_user_tables
      ORDER BY n_live_tup DESC
    `

    return stats
  },

  /**
   * Get index statistics
   */
  async getIndexStats() {
    const stats = await db.$queryRaw<unknown[]>`
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_tup_read,
        idx_tup_fetch,
        idx_scan
      FROM pg_stat_user_indexes
      WHERE idx_scan > 0
      ORDER BY idx_scan DESC
    `

    return stats
  },

  /**
   * Get query statistics (if pg_stat_statements is available)
   */
  async getQueryStats() {
    try {
      const stats = await db.$queryRaw<unknown[]>`
        SELECT 
          query,
          calls,
          total_time,
          min_time,
          max_time,
          mean_time,
          stddev_time
        FROM pg_stat_statements 
        ORDER BY total_time DESC 
        LIMIT 20
      `

      return stats
    } catch (error) {
      
      return []
    }
  },

  /**
   * Backup database
   */
  async backup(
    options: {
      path?: string
      compress?: boolean
      schemaOnly?: boolean
    } = {}
  ) {
    const { path, compress = true, schemaOnly = false } = options

    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not configured')
    }

    const url = new URL(process.env.DATABASE_URL)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = path || `backup-${timestamp}.sql${compress ? '.gz' : ''}`

    const command = [
      'pg_dump',
      `-h ${url.hostname}`,
      `-p ${url.port || 5432}`,
      `-U ${url.username}`,
      `-d ${url.pathname.slice(1)}`,
      schemaOnly ? '--schema-only' : '--data-only',
      compress ? `| gzip > ${filename}` : `> ${filename}`,
    ].join(' ')

    

    try {
      const { exec } = require('child_process')
      await new Promise((resolve, reject) => {
        exec(
          command,
          { env: { ...process.env, PGPASSWORD: url.password } },
          (error, stdout, stderr) => {
            if (error) {
              reject(error)
            } else {
              resolve(stdout)
            }
          }
        )
      })

      
      return filename
    } catch (error) {
      
      throw error
    }
  },
}
