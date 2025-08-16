/**
 * CoreFlow360 - Session Cache
 * Redis-based session caching for improved auth performance
 */

import { redis, CACHE_PREFIXES, CACHE_TTL } from '@/lib/redis/client'
import { User, Subscription } from '@prisma/client'

interface CachedSession {
  user: User
  subscription?: Subscription
  permissions: string[]
  lastAccessed: Date
}

/**
 * Session cache operations
 */
export const sessionCache = {
  /**
   * Get cached session
   */
  async get(sessionToken: string): Promise<CachedSession | null> {
    const key = `${CACHE_PREFIXES.SESSION}${sessionToken}`
    return await redis.get<CachedSession>(key)
  },
  
  /**
   * Set cached session
   */
  async set(sessionToken: string, session: CachedSession): Promise<boolean> {
    const key = `${CACHE_PREFIXES.SESSION}${sessionToken}`
    // Cache for 1 hour, refresh on access
    return await redis.set(key, session, CACHE_TTL.LONG)
  },
  
  /**
   * Update last accessed time
   */
  async touch(sessionToken: string): Promise<boolean> {
    const key = `${CACHE_PREFIXES.SESSION}${sessionToken}`
    const session = await redis.get<CachedSession>(key)
    
    if (!session) return false
    
    session.lastAccessed = new Date()
    return await redis.set(key, session, CACHE_TTL.LONG)
  },
  
  /**
   * Delete cached session
   */
  async delete(sessionToken: string): Promise<boolean> {
    const key = `${CACHE_PREFIXES.SESSION}${sessionToken}`
    const deleted = await redis.del(key)
    return deleted > 0
  },
  
  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId: string): Promise<string[]> {
    const key = `${CACHE_PREFIXES.USER}sessions:${userId}`
    return await redis.smembers(key)
  },
  
  /**
   * Add session to user's active sessions
   */
  async addUserSession(userId: string, sessionToken: string): Promise<void> {
    const key = `${CACHE_PREFIXES.USER}sessions:${userId}`
    await redis.sadd(key, sessionToken)
    await redis.expire(key, CACHE_TTL.DAY)
  },
  
  /**
   * Remove session from user's active sessions
   */
  async removeUserSession(userId: string, sessionToken: string): Promise<void> {
    const key = `${CACHE_PREFIXES.USER}sessions:${userId}`
    await redis.del(sessionToken) // Note: This might need adjustment based on Redis client API
  }
}

/**
 * User cache operations
 */
export const userCache = {
  /**
   * Get cached user data
   */
  async get(userId: string): Promise<User | null> {
    const key = `${CACHE_PREFIXES.USER}${userId}`
    return await redis.get<User>(key)
  },
  
  /**
   * Set cached user data
   */
  async set(userId: string, user: User): Promise<boolean> {
    const key = `${CACHE_PREFIXES.USER}${userId}`
    return await redis.set(key, user, CACHE_TTL.MEDIUM)
  },
  
  /**
   * Invalidate user cache
   */
  async invalidate(userId: string): Promise<void> {
    const key = `${CACHE_PREFIXES.USER}${userId}`
    await redis.del(key)
    
    // Also invalidate related caches
    const sessions = await sessionCache.getUserSessions(userId)
    for (const session of sessions) {
      await sessionCache.delete(session)
    }
  }
}

/**
 * Tenant cache operations
 */
export const tenantCache = {
  /**
   * Get cached tenant data
   */
  async get(tenantId: string): Promise<any | null> {
    const key = `${CACHE_PREFIXES.TENANT}${tenantId}`
    return await redis.get(key)
  },
  
  /**
   * Set cached tenant data
   */
  async set(tenantId: string, tenant: any): Promise<boolean> {
    const key = `${CACHE_PREFIXES.TENANT}${tenantId}`
    return await redis.set(key, tenant, CACHE_TTL.LONG)
  },
  
  /**
   * Get tenant settings
   */
  async getSettings(tenantId: string): Promise<Record<string, any>> {
    const key = `${CACHE_PREFIXES.TENANT}settings:${tenantId}`
    return await redis.hash.getAll(key) || {}
  },
  
  /**
   * Set tenant setting
   */
  async setSetting(tenantId: string, setting: string, value: any): Promise<boolean> {
    const key = `${CACHE_PREFIXES.TENANT}settings:${tenantId}`
    const result = await redis.hash.set(key, setting, value)
    await redis.expire(key, CACHE_TTL.DAY)
    return result
  },
  
  /**
   * Invalidate tenant cache
   */
  async invalidate(tenantId: string): Promise<void> {
    const keys = [
      `${CACHE_PREFIXES.TENANT}${tenantId}`,
      `${CACHE_PREFIXES.TENANT}settings:${tenantId}`
    ]
    await redis.del(...keys)
  }
}

/**
 * Subscription cache operations
 */
export const subscriptionCache = {
  /**
   * Get cached subscription
   */
  async get(userId: string): Promise<Subscription | null> {
    const key = `${CACHE_PREFIXES.SUBSCRIPTION}${userId}`
    return await redis.get<Subscription>(key)
  },
  
  /**
   * Set cached subscription
   */
  async set(userId: string, subscription: Subscription): Promise<boolean> {
    const key = `${CACHE_PREFIXES.SUBSCRIPTION}${userId}`
    return await redis.set(key, subscription, CACHE_TTL.MEDIUM)
  },
  
  /**
   * Get active modules for user
   */
  async getActiveModules(userId: string): Promise<string[]> {
    const key = `${CACHE_PREFIXES.SUBSCRIPTION}modules:${userId}`
    return await redis.smembers(key)
  },
  
  /**
   * Set active modules for user
   */
  async setActiveModules(userId: string, modules: string[]): Promise<void> {
    const key = `${CACHE_PREFIXES.SUBSCRIPTION}modules:${userId}`
    await redis.del(key)
    if (modules.length > 0) {
      await redis.sadd(key, ...modules)
      await redis.expire(key, CACHE_TTL.MEDIUM)
    }
  },
  
  /**
   * Invalidate subscription cache
   */
  async invalidate(userId: string): Promise<void> {
    const keys = [
      `${CACHE_PREFIXES.SUBSCRIPTION}${userId}`,
      `${CACHE_PREFIXES.SUBSCRIPTION}modules:${userId}`
    ]
    await redis.del(...keys)
  }
}

/**
 * Feature flag cache
 */
export const featureFlagCache = {
  /**
   * Check if feature is enabled for tenant
   */
  async isEnabled(tenantId: string, feature: string): Promise<boolean | null> {
    const key = `${CACHE_PREFIXES.FEATURE_FLAG}${tenantId}:${feature}`
    const value = await redis.get<boolean>(key)
    return value
  },
  
  /**
   * Set feature flag status
   */
  async set(tenantId: string, feature: string, enabled: boolean): Promise<void> {
    const key = `${CACHE_PREFIXES.FEATURE_FLAG}${tenantId}:${feature}`
    await redis.set(key, enabled, CACHE_TTL.LONG)
  },
  
  /**
   * Get all feature flags for tenant
   */
  async getAll(tenantId: string): Promise<Record<string, boolean>> {
    const pattern = `${CACHE_PREFIXES.FEATURE_FLAG}${tenantId}:*`
    // Note: This would need actual implementation based on Redis scan
    return {}
  }
}