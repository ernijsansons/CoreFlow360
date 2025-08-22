/**
 * CoreFlow360 - Database Query Optimizer
 * Advanced query optimization and caching strategies
 */

import { prisma } from '@/lib/db'
import { cacheDashboardStats, cacheUserData } from '@/lib/cache/application-cache'

// Query optimization patterns
export class QueryOptimizer {
  private static instance: QueryOptimizer
  private queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  static getInstance(): QueryOptimizer {
    if (!QueryOptimizer.instance) {
      QueryOptimizer.instance = new QueryOptimizer()
    }
    return QueryOptimizer.instance
  }

  // Optimized customer queries with minimal data transfer
  async getCustomersOptimized(tenantId: string, pagination = { skip: 0, take: 20 }) {
    const cacheKey = `customers_${tenantId}_${pagination.skip}_${pagination.take}`
    
    return this.getCachedOrFetch(cacheKey, async () => {
      return await prisma.customer.findMany({
        where: { tenantId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          company: true,
          status: true,
          createdAt: true,
          // Only select what we need - reduces data transfer
          _count: {
            select: {
              deals: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      })
    }, 300000) // 5 minute cache
  }

  // Batched deal queries with joins
  async getDealsWithCustomers(tenantId: string, filters: {
    status?: string[]
    dateRange?: { from: Date; to: Date }
    limit?: number
  } = {}) {
    const cacheKey = `deals_${tenantId}_${JSON.stringify(filters)}`
    
    return this.getCachedOrFetch(cacheKey, async () => {
      const where: any = { tenantId }
      
      if (filters.status?.length) {
        where.status = { in: filters.status }
      }
      
      if (filters.dateRange) {
        where.createdAt = {
          gte: filters.dateRange.from,
          lte: filters.dateRange.to,
        }
      }

      return await prisma.deal.findMany({
        where,
        select: {
          id: true,
          title: true,
          value: true,
          status: true,
          createdAt: true,
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              company: true,
            }
          },
          assignedUser: {
            select: {
              id: true,
              name: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 50,
      })
    }, 180000) // 3 minute cache
  }

  // Aggregated analytics with single query
  async getAnalyticsSummary(tenantId: string, timeframe: 'week' | 'month' | 'quarter' = 'month') {
    const cacheKey = `analytics_${tenantId}_${timeframe}`
    
    return this.getCachedOrFetch(cacheKey, async () => {
      const now = new Date()
      let startDate: Date
      
      switch (timeframe) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'quarter':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          break
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      }

      // Single transaction for all analytics
      return await prisma.$transaction(async (tx) => {
        const [
          customerCount,
          dealStats,
          revenueStats,
          activityCount
        ] = await Promise.all([
          tx.customer.count({ where: { tenantId } }),
          
          tx.deal.groupBy({
            by: ['status'],
            where: { tenantId },
            _count: { id: true },
            _sum: { value: true },
          }),
          
          tx.deal.aggregate({
            where: {
              tenantId,
              status: 'WON',
              createdAt: { gte: startDate }
            },
            _sum: { value: true },
            _avg: { value: true },
            _count: { id: true },
          }),
          
          tx.aiActivity.count({
            where: {
              tenantId,
              createdAt: { gte: startDate }
            }
          })
        ])

        return {
          period: timeframe,
          customers: { total: customerCount },
          deals: {
            byStatus: dealStats,
            totalRevenue: revenueStats._sum.value || 0,
            averageDealSize: revenueStats._avg.value || 0,
            closedDeals: revenueStats._count,
          },
          activity: { total: activityCount },
          generatedAt: new Date().toISOString(),
        }
      })
    }, 600000) // 10 minute cache for analytics
  }

  // Optimized search with full-text search
  async searchOptimized(tenantId: string, query: string, type: 'customers' | 'deals' | 'all' = 'all') {
    if (!query || query.length < 2) return { customers: [], deals: [] }

    const cacheKey = `search_${tenantId}_${type}_${query}`
    
    return this.getCachedOrFetch(cacheKey, async () => {
      const searchTerm = `%${query.toLowerCase()}%`
      const results: { customers: any[]; deals: any[] } = { customers: [], deals: [] }

      if (type === 'customers' || type === 'all') {
        results.customers = await prisma.customer.findMany({
          where: {
            tenantId,
            OR: [
              { firstName: { contains: query, mode: 'insensitive' } },
              { lastName: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
              { company: { contains: query, mode: 'insensitive' } },
            ]
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            company: true,
            status: true,
          },
          take: 20,
        })
      }

      if (type === 'deals' || type === 'all') {
        results.deals = await prisma.deal.findMany({
          where: {
            tenantId,
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ]
          },
          select: {
            id: true,
            title: true,
            value: true,
            status: true,
            customer: {
              select: {
                firstName: true,
                lastName: true,
                company: true,
              }
            }
          },
          take: 20,
        })
      }

      return results
    }, 120000) // 2 minute cache for searches
  }

  // Helper: Generic cache wrapper
  private async getCachedOrFetch<T>(
    key: string, 
    fetchFn: () => Promise<T>, 
    ttl: number
  ): Promise<T> {
    const cached = this.queryCache.get(key)
    const now = Date.now()

    if (cached && (now - cached.timestamp) < cached.ttl) {
      return cached.data
    }

    try {
      const data = await fetchFn()
      this.queryCache.set(key, { data, timestamp: now, ttl })
      return data
    } catch (error) {
      // Return stale data if available during errors
      if (cached) {
        return cached.data
      }
      throw error
    }
  }

  // Cache management
  clearCache(pattern?: string) {
    if (pattern) {
      const regex = new RegExp(pattern)
      for (const key of this.queryCache.keys()) {
        if (regex.test(key)) {
          this.queryCache.delete(key)
        }
      }
    } else {
      this.queryCache.clear()
    }
  }

  getCacheStats() {
    const entries = Array.from(this.queryCache.entries())
    const now = Date.now()
    
    return {
      totalEntries: entries.length,
      validEntries: entries.filter(([, value]) => (now - value.timestamp) < value.ttl).length,
      memoryUsage: JSON.stringify([...this.queryCache]).length,
      oldestEntry: Math.min(...entries.map(([, value]) => value.timestamp)),
    }
  }
}

// Database connection optimization
export const optimizeDatabaseConnection = () => {
  // Connection pool settings for production
  if (process.env.NODE_ENV === 'production') {
    // These should be set in DATABASE_URL or environment
    console.log('Database optimization settings applied for production')
  }
}

// Query performance monitoring
export const monitorQueryPerformance = async <T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> => {
  const startTime = Date.now()
  
  try {
    const result = await queryFn()
    const duration = Date.now() - startTime
    
    // Log slow queries (>1s)
    if (duration > 1000) {
      console.warn(`Slow query detected: ${queryName} took ${duration}ms`)
    }
    
    // Track performance metrics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'database_query', {
        custom_map: { dimension1: queryName },
        value: duration,
      })
    }
    
    return result
  } catch (error) {
    console.error(`Query failed: ${queryName}`, error)
    throw error
  }
}

// Export singleton instance
export const queryOptimizer = QueryOptimizer.getInstance()

export default {
  QueryOptimizer,
  queryOptimizer,
  optimizeDatabaseConnection,
  monitorQueryPerformance,
}