/**
 * CoreFlow360 - Database Caching Layer
 * Intelligent caching for frequently accessed database queries
 */

import { PrismaClient, User, Tenant, TenantSubscription } from '@prisma/client'
import { redis, userCache, sessionCache, cacheKey } from './redis'

export class DatabaseCache {
  constructor(private prisma: PrismaClient) {}

  // User caching with intelligent cache invalidation
  async getUser(userId: string, tenantId: string): Promise<User | null> {
    return redis.cache(
      cacheKey('user', userId),
      async () => {
        return await this.prisma.user.findUnique({
          where: { id: userId, tenantId },
          include: {
            tenant: true,
            department: true
          }
        })
      },
      { tenantId, ttl: 300 }
    )
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return redis.cache(
      cacheKey('user-email', email),
      async () => {
        return await this.prisma.user.findUnique({
          where: { email },
          include: {
            tenant: true,
            department: true
          }
        })
      },
      { ttl: 300 }
    )
  }

  async updateUser(userId: string, data: any, tenantId: string): Promise<User> {
    // Update in database
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data,
      include: {
        tenant: true,
        department: true
      }
    })

    // Invalidate related cache entries
    await this.invalidateUserCache(userId, updatedUser.email, tenantId)
    
    // Update cache with fresh data
    await redis.set(
      cacheKey('user', userId),
      updatedUser,
      { tenantId, ttl: 300 }
    )

    return updatedUser
  }

  // Tenant caching
  async getTenant(tenantId: string): Promise<Tenant | null> {
    return redis.cache(
      cacheKey('tenant', tenantId),
      async () => {
        return await this.prisma.tenant.findUnique({
          where: { id: tenantId },
          include: {
            subscription: true,
            users: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true
              }
            }
          }
        })
      },
      { tenantId, ttl: 600 }
    )
  }

  async getTenantBySlug(slug: string): Promise<Tenant | null> {
    return redis.cache(
      cacheKey('tenant-slug', slug),
      async () => {
        return await this.prisma.tenant.findUnique({
          where: { slug },
          include: {
            subscription: true
          }
        })
      },
      { ttl: 600 }
    )
  }

  // Subscription caching
  async getTenantSubscription(tenantId: string): Promise<TenantSubscription | null> {
    return redis.cache(
      cacheKey('subscription', tenantId),
      async () => {
        return await this.prisma.tenantSubscription.findUnique({
          where: { tenantId }
        })
      },
      { tenantId, ttl: 300 }
    )
  }

  async updateTenantSubscription(
    tenantId: string, 
    data: any
  ): Promise<TenantSubscription> {
    // Update in database
    const updatedSubscription = await this.prisma.tenantSubscription.upsert({
      where: { tenantId },
      create: { tenantId, ...data },
      update: data
    })

    // Invalidate related caches
    await redis.del(cacheKey('subscription', tenantId), { tenantId })
    await redis.del(cacheKey('tenant', tenantId), { tenantId })
    
    // Update cache with fresh data
    await redis.set(
      cacheKey('subscription', tenantId),
      updatedSubscription,
      { tenantId, ttl: 300 }
    )

    return updatedSubscription
  }

  // Department and organizational structure caching
  async getTenantDepartments(tenantId: string) {
    return redis.cache(
      cacheKey('departments', tenantId),
      async () => {
        return await this.prisma.department.findMany({
          where: { tenantId },
          include: {
            users: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        })
      },
      { tenantId, ttl: 300 }
    )
  }

  // Customer data caching (high-frequency access)
  async getCustomers(tenantId: string, limit: number = 50, offset: number = 0) {
    const cacheKeyStr = cacheKey('customers', tenantId, limit, offset)
    
    return redis.cache(
      cacheKeyStr,
      async () => {
        return await this.prisma.customer.findMany({
          where: { tenantId },
          take: limit,
          skip: offset,
          include: {
            deals: {
              select: {
                id: true,
                title: true,
                value: true,
                stage: true,
                probability: true
              }
            }
          },
          orderBy: { updatedAt: 'desc' }
        })
      },
      { tenantId, ttl: 180 }
    )
  }

  async getCustomer(customerId: string, tenantId: string) {
    return redis.cache(
      cacheKey('customer', customerId),
      async () => {
        return await this.prisma.customer.findUnique({
          where: { id: customerId, tenantId },
          include: {
            deals: true,
            projects: true,
            invoices: true,
            communications: {
              orderBy: { createdAt: 'desc' },
              take: 10
            }
          }
        })
      },
      { tenantId, ttl: 300 }
    )
  }

  // Deal pipeline caching
  async getActiveDeals(tenantId: string) {
    return redis.cache(
      cacheKey('active-deals', tenantId),
      async () => {
        return await this.prisma.deal.findMany({
          where: { 
            tenantId,
            stage: { not: 'CLOSED_WON' }
          },
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { expectedCloseDate: 'asc' }
        })
      },
      { tenantId, ttl: 120 }
    )
  }

  // Analytics and reporting caching
  async getTenantStats(tenantId: string) {
    return redis.cache(
      cacheKey('tenant-stats', tenantId),
      async () => {
        const [
          totalUsers,
          activeUsers,
          totalCustomers,
          activeDeals,
          totalRevenue,
          openProjects
        ] = await Promise.all([
          this.prisma.user.count({ where: { tenantId } }),
          this.prisma.user.count({ 
            where: { 
              tenantId, 
              status: 'ACTIVE',
              lastLoginAt: { 
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
              }
            } 
          }),
          this.prisma.customer.count({ where: { tenantId } }),
          this.prisma.deal.count({ 
            where: { 
              tenantId, 
              stage: { not: 'CLOSED_LOST' }
            } 
          }),
          this.prisma.deal.aggregate({
            where: { 
              tenantId, 
              stage: 'CLOSED_WON' 
            },
            _sum: { value: true }
          }),
          this.prisma.project.count({ 
            where: { 
              tenantId, 
              status: { in: ['ACTIVE', 'IN_PROGRESS'] }
            } 
          })
        ])

        return {
          users: {
            total: totalUsers,
            active: activeUsers,
            activeRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0
          },
          customers: {
            total: totalCustomers
          },
          deals: {
            active: activeDeals
          },
          revenue: {
            total: totalRevenue._sum.value || 0
          },
          projects: {
            open: openProjects
          }
        }
      },
      { tenantId, ttl: 600 }
    )
  }

  // Cache invalidation helpers
  async invalidateUserCache(userId: string, email: string, tenantId: string) {
    await Promise.all([
      redis.del(cacheKey('user', userId), { tenantId }),
      redis.del(cacheKey('user-email', email)),
      redis.invalidatePattern(cacheKey('departments', '*'), { tenantId }),
      redis.invalidatePattern(cacheKey('tenant-stats', '*'), { tenantId })
    ])
  }

  async invalidateTenantCache(tenantId: string) {
    await redis.invalidateTenant(tenantId)
  }

  async invalidateCustomerCache(customerId: string, tenantId: string) {
    await Promise.all([
      redis.del(cacheKey('customer', customerId), { tenantId }),
      redis.invalidatePattern(cacheKey('customers', '*'), { tenantId }),
      redis.invalidatePattern(cacheKey('active-deals', '*'), { tenantId }),
      redis.invalidatePattern(cacheKey('tenant-stats', '*'), { tenantId })
    ])
  }

  async invalidateDealCache(tenantId: string) {
    await Promise.all([
      redis.invalidatePattern(cacheKey('active-deals', '*'), { tenantId }),
      redis.invalidatePattern(cacheKey('customers', '*'), { tenantId }),
      redis.invalidatePattern(cacheKey('tenant-stats', '*'), { tenantId })
    ])
  }

  // Batch operations for performance
  async getMultipleUsers(userIds: string[], tenantId: string): Promise<(User | null)[]> {
    const cacheKeys = userIds.map(id => cacheKey('user', id))
    const cachedUsers = await redis.mget(cacheKeys, { tenantId })
    
    const missingIndices: number[] = []
    const missingIds: string[] = []
    
    cachedUsers.forEach((user, index) => {
      if (user === null) {
        missingIndices.push(index)
        missingIds.push(userIds[index])
      }
    })
    
    if (missingIds.length > 0) {
      // Fetch missing users from database
      const freshUsers = await this.prisma.user.findMany({
        where: { 
          id: { in: missingIds },
          tenantId 
        },
        include: {
          tenant: true,
          department: true
        }
      })
      
      // Update cache with fresh data
      const cacheUpdates = freshUsers.map(user => ({
        key: cacheKey('user', user.id),
        value: user,
        ttl: 300
      }))
      
      await redis.mset(cacheUpdates, { tenantId })
      
      // Merge cached and fresh data
      const userMap = new Map(freshUsers.map(user => [user.id, user]))
      missingIndices.forEach((index, i) => {
        const userId = missingIds[i]
        cachedUsers[index] = userMap.get(userId) || null
      })
    }
    
    return cachedUsers
  }

  // Preload commonly accessed data
  async preloadTenantData(tenantId: string) {
    // Preload in parallel
    await Promise.all([
      this.getTenant(tenantId),
      this.getTenantSubscription(tenantId),
      this.getTenantDepartments(tenantId),
      this.getActiveDeals(tenantId),
      this.getTenantStats(tenantId)
    ])
  }
}

// Create a cached database instance
export function createCachedDb(prisma: PrismaClient) {
  return new DatabaseCache(prisma)
}

export default DatabaseCache