/**
 * CoreFlow360 - Cache Invalidation Helpers
 * Consistent cache invalidation patterns for all entities
 */

import { redis } from './unified-redis'

export interface CacheInvalidationOptions {
  tenantId: string
  userId?: string
}

/**
 * Invalidate all cache entries related to customers
 */
export async function invalidateCustomerCache(
  customerId: string | null,
  options: CacheInvalidationOptions
) {
  const promises: Promise<any>[] = []
  
  // Invalidate customer list caches
  promises.push(
    redis.invalidatePattern(`customers:${options.tenantId}:*`),
    redis.del(`customers:count:${options.tenantId}`)
  )
  
  // Invalidate specific customer cache if ID provided
  if (customerId) {
    promises.push(
      redis.del(`customer:${customerId}`, { tenantId: options.tenantId }),
      redis.del(`customer:${customerId}:deals`, { tenantId: options.tenantId }),
      redis.del(`customer:${customerId}:projects`, { tenantId: options.tenantId })
    )
  }
  
  // Invalidate metrics cache
  promises.push(
    redis.del(`metrics:crm:${options.tenantId}`),
    redis.del(`dashboard:crm:${options.tenantId}`)
  )
  
  await Promise.all(promises)
}

/**
 * Invalidate all cache entries related to deals
 */
export async function invalidateDealCache(
  dealId: string | null,
  customerId: string | null,
  options: CacheInvalidationOptions
) {
  const promises: Promise<any>[] = []
  
  // Invalidate deal list caches
  promises.push(
    redis.invalidatePattern(`deals:${options.tenantId}:*`),
    redis.del(`deals:count:${options.tenantId}`)
  )
  
  // Invalidate specific deal cache if ID provided
  if (dealId) {
    promises.push(
      redis.del(`deal:${dealId}`, { tenantId: options.tenantId })
    )
  }
  
  // Invalidate customer's deals cache if customer ID provided
  if (customerId) {
    promises.push(
      redis.del(`customer:${customerId}:deals`, { tenantId: options.tenantId })
    )
  }
  
  // Invalidate metrics cache
  promises.push(
    redis.del(`metrics:deals:${options.tenantId}`),
    redis.del(`dashboard:deals:${options.tenantId}`)
  )
  
  await Promise.all(promises)
}

/**
 * Invalidate all cache entries related to projects
 */
export async function invalidateProjectCache(
  projectId: string | null,
  customerId: string | null,
  options: CacheInvalidationOptions
) {
  const promises: Promise<any>[] = []
  
  // Invalidate project list caches
  promises.push(
    redis.invalidatePattern(`projects:${options.tenantId}:*`),
    redis.del(`projects:count:${options.tenantId}`)
  )
  
  // Invalidate specific project cache if ID provided
  if (projectId) {
    promises.push(
      redis.del(`project:${projectId}`, { tenantId: options.tenantId })
    )
  }
  
  // Invalidate customer's projects cache if customer ID provided
  if (customerId) {
    promises.push(
      redis.del(`customer:${customerId}:projects`, { tenantId: options.tenantId })
    )
  }
  
  // Invalidate metrics cache
  promises.push(
    redis.del(`metrics:projects:${options.tenantId}`),
    redis.del(`dashboard:projects:${options.tenantId}`)
  )
  
  await Promise.all(promises)
}

/**
 * Invalidate all cache entries related to users
 */
export async function invalidateUserCache(
  userId: string,
  options: CacheInvalidationOptions
) {
  const promises: Promise<any>[] = []
  
  // Invalidate user-specific caches
  promises.push(
    redis.del(`user:${userId}`, { tenantId: options.tenantId }),
    redis.del(`user:${userId}:permissions`, { tenantId: options.tenantId }),
    redis.del(`user:${userId}:preferences`, { tenantId: options.tenantId })
  )
  
  // Invalidate user list caches
  promises.push(
    redis.invalidatePattern(`users:${options.tenantId}:*`),
    redis.del(`users:count:${options.tenantId}`)
  )
  
  await Promise.all(promises)
}

/**
 * Invalidate all cache entries for a tenant
 */
export async function invalidateTenantCache(tenantId: string) {
  await redis.invalidateTenant(tenantId)
}

/**
 * Invalidate session-related caches
 */
export async function invalidateSessionCache(
  sessionId: string,
  userId: string,
  tenantId: string
) {
  const promises: Promise<any>[] = []
  
  promises.push(
    redis.del(`session:${sessionId}`),
    redis.del(`user:${userId}:sessions`),
    redis.del(`user:${userId}:active-sessions`, { tenantId })
  )
  
  await Promise.all(promises)
}

/**
 * Invalidate subscription-related caches
 */
export async function invalidateSubscriptionCache(
  tenantId: string,
  subscriptionId?: string
) {
  const promises: Promise<any>[] = []
  
  promises.push(
    redis.del(`subscription:current:${tenantId}`),
    redis.del(`subscription:usage:${tenantId}`),
    redis.del(`subscription:modules:${tenantId}`)
  )
  
  if (subscriptionId) {
    promises.push(
      redis.del(`subscription:${subscriptionId}`)
    )
  }
  
  await Promise.all(promises)
}

/**
 * Helper to invalidate multiple cache patterns at once
 */
export async function invalidateMultiplePatterns(
  patterns: string[],
  options: CacheInvalidationOptions
) {
  const promises = patterns.map(pattern => 
    redis.invalidatePattern(`${pattern}:${options.tenantId}:*`)
  )
  
  await Promise.all(promises)
}