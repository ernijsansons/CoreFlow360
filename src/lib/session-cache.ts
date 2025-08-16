/**
 * CoreFlow360 - Session Caching Integration
 * Redis-backed session storage for NextAuth.js
 */

import { redis, sessionCache } from './redis'
import type { Adapter } from '@auth/core/adapters'
import type { AdapterUser, AdapterAccount, AdapterSession, VerificationToken } from '@auth/core/adapters'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

export interface CachedSession {
  id: string
  userId: string
  expires: Date
  tenantId: string
  userRole: string
  permissions: string[]
  lastActivity: Date
}

export class SessionCacheManager {
  constructor(private prisma: PrismaClient) {}

  // Generate a secure session token
  private generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  // Session key generation
  private sessionKey(sessionToken: string): string {
    return `session:${sessionToken}`
  }

  private userSessionsKey(userId: string): string {
    return `user-sessions:${userId}`
  }

  // Create cached session
  async createSession(session: {
    userId: string
    expires: Date
    tenantId?: string
  }): Promise<AdapterSession> {
    const sessionToken = this.generateSessionToken()
    const sessionData: CachedSession = {
      id: sessionToken,
      userId: session.userId,
      expires: session.expires,
      tenantId: session.tenantId || '',
      userRole: '',
      permissions: [],
      lastActivity: new Date()
    }

    // Get user data to populate session
    const user = await this.prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        role: true,
        permissions: true,
        tenantId: true
      }
    })

    if (user) {
      sessionData.tenantId = user.tenantId || ''
      sessionData.userRole = user.role
      sessionData.permissions = typeof user.permissions === 'string' 
        ? JSON.parse(user.permissions) 
        : user.permissions || []
    }

    // Calculate TTL (time to live) in seconds
    const ttl = Math.floor((session.expires.getTime() - Date.now()) / 1000)

    // Store in Redis with TTL
    await Promise.all([
      redis.set(this.sessionKey(sessionToken), sessionData, { ttl }),
      // Also track user sessions for cleanup
      redis.set(
        `${this.userSessionsKey(session.userId)}:${sessionToken}`,
        { sessionToken, createdAt: new Date() },
        { ttl }
      )
    ])

    // Also store in database for persistence
    const dbSession = await this.prisma.session.create({
      data: {
        sessionToken,
        userId: session.userId,
        expires: session.expires
      }
    })

    return {
      sessionToken: dbSession.sessionToken,
      userId: dbSession.userId,
      expires: dbSession.expires
    }
  }

  // Get session with caching
  async getSession(sessionToken: string): Promise<(AdapterSession & CachedSession) | null> {
    // Try Redis first
    const cached = await redis.get<CachedSession>(this.sessionKey(sessionToken))
    
    if (cached) {
      // Update last activity
      cached.lastActivity = new Date()
      await redis.set(this.sessionKey(sessionToken), cached, { 
        ttl: Math.floor((cached.expires.getTime() - Date.now()) / 1000) 
      })
      
      return {
        sessionToken,
        userId: cached.userId,
        expires: cached.expires,
        ...cached
      }
    }

    // Fallback to database
    const dbSession = await this.prisma.session.findUnique({
      where: { sessionToken },
      include: {
        user: {
          select: {
            role: true,
            permissions: true,
            tenantId: true
          }
        }
      }
    })

    if (!dbSession) {
      return null
    }

    // Rebuild cache from database
    const sessionData: CachedSession = {
      id: dbSession.sessionToken,
      userId: dbSession.userId,
      expires: dbSession.expires,
      tenantId: dbSession.user.tenantId || '',
      userRole: dbSession.user.role,
      permissions: typeof dbSession.user.permissions === 'string'
        ? JSON.parse(dbSession.user.permissions)
        : dbSession.user.permissions || [],
      lastActivity: new Date()
    }

    // Cache it
    const ttl = Math.floor((dbSession.expires.getTime() - Date.now()) / 1000)
    if (ttl > 0) {
      await redis.set(this.sessionKey(sessionToken), sessionData, { ttl })
    }

    return {
      sessionToken: dbSession.sessionToken,
      userId: dbSession.userId,
      expires: dbSession.expires,
      ...sessionData
    }
  }

  // Update session
  async updateSession(sessionToken: string, updates: Partial<AdapterSession>): Promise<AdapterSession | null> {
    // Update in database
    const updated = await this.prisma.session.update({
      where: { sessionToken },
      data: updates
    })

    // Update cache
    const cached = await redis.get<CachedSession>(this.sessionKey(sessionToken))
    if (cached) {
      const updatedCache: CachedSession = {
        ...cached,
        expires: updates.expires || cached.expires,
        lastActivity: new Date()
      }

      const ttl = Math.floor((updatedCache.expires.getTime() - Date.now()) / 1000)
      if (ttl > 0) {
        await redis.set(this.sessionKey(sessionToken), updatedCache, { ttl })
      }
    }

    return {
      sessionToken: updated.sessionToken,
      userId: updated.userId,
      expires: updated.expires
    }
  }

  // Delete session
  async deleteSession(sessionToken: string): Promise<void> {
    // Get session to find userId for cleanup
    const cached = await redis.get<CachedSession>(this.sessionKey(sessionToken))
    
    await Promise.all([
      // Remove from Redis
      redis.del(this.sessionKey(sessionToken)),
      // Remove from user sessions list
      cached ? redis.del(`${this.userSessionsKey(cached.userId)}:${sessionToken}`) : Promise.resolve(),
      // Remove from database
      this.prisma.session.delete({ 
        where: { sessionToken } 
      }).catch(() => {}) // Ignore if already deleted
    ])
  }

  // Get all sessions for a user
  async getUserSessions(userId: string): Promise<CachedSession[]> {
    const pattern = `${this.userSessionsKey(userId)}:*`
    const sessionKeys = await redis.client?.keys(pattern) || []
    
    if (sessionKeys.length === 0) {
      return []
    }

    const sessionTokens = sessionKeys.map(key => key.split(':').pop()!)
    const sessions = await Promise.all(
      sessionTokens.map(token => this.getSession(token))
    )

    return sessions.filter((s): s is (AdapterSession & CachedSession) => s !== null)
  }

  // Cleanup expired sessions
  async cleanupExpiredSessions(): Promise<number> {
    const cutoff = new Date()
    
    // Clean from database
    const result = await this.prisma.session.deleteMany({
      where: {
        expires: {
          lte: cutoff
        }
      }
    })

    // Redis will handle TTL expiry automatically
    return result.count
  }

  // Invalidate all sessions for a user
  async invalidateUserSessions(userId: string): Promise<void> {
    const sessions = await this.getUserSessions(userId)
    
    await Promise.all(
      sessions.map(session => this.deleteSession(session.sessionToken))
    )
  }

  // Get session statistics
  async getSessionStats(tenantId?: string): Promise<{
    totalSessions: number
    activeSessions: number
    expiredSessions: number
    tenantSessions?: number
  }> {
    const now = new Date()
    
    const whereClause = tenantId ? {
      user: { tenantId }
    } : {}

    const [total, active, expired] = await Promise.all([
      this.prisma.session.count({ where: whereClause }),
      this.prisma.session.count({
        where: {
          ...whereClause,
          expires: { gte: now }
        }
      }),
      this.prisma.session.count({
        where: {
          ...whereClause,
          expires: { lt: now }
        }
      })
    ])

    const stats = {
      totalSessions: total,
      activeSessions: active,
      expiredSessions: expired
    }

    if (tenantId) {
      return { ...stats, tenantSessions: total }
    }

    return stats
  }
}

// Create enhanced adapter with Redis caching
export function createCachedAdapter(prisma: PrismaClient): Adapter {
  const baseAdapter = PrismaAdapter(prisma)
  const sessionManager = new SessionCacheManager(prisma)

  return {
    ...baseAdapter,
    
    createSession: async (session) => {
      return await sessionManager.createSession(session)
    },

    getSession: async (sessionToken) => {
      const session = await sessionManager.getSession(sessionToken)
      return session ? {
        sessionToken: session.sessionToken,
        userId: session.userId,
        expires: session.expires
      } : null
    },

    updateSession: async (session) => {
      return await sessionManager.updateSession(session.sessionToken, session)
    },

    deleteSession: async (sessionToken) => {
      await sessionManager.deleteSession(sessionToken)
    }
  }
}

export default SessionCacheManager