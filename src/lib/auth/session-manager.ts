/**
 * CoreFlow360 - Session Manager
 * Handles session creation, validation, and management for all auth providers
 */

import { prisma } from '@/lib/db'
import { redis } from '@/lib/redis'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'
import { telemetry } from '@/lib/telemetry/opentelemetry'

export interface SessionData {
  userId: string
  tenantId: string
  email: string
  role: string
  authProvider: string
  authProviderId?: string
  metadata?: Record<string, unknown>
}

export interface Session extends SessionData {
  id: string
  token: string
  expiresAt: Date
  createdAt: Date
  lastAccessedAt: Date
}

const SESSION_PREFIX = 'session:'
const SESSION_TTL = 60 * 60 * 24 * 7 // 7 days in seconds

export class SessionManager {
  /**
   * Create a new session
   */
  async createSession(data: SessionData): Promise<string> {
    return telemetry.traceBusinessOperation(
      'session.create',
      async () => {
        const sessionId = uuidv4()
        const token = this.generateSecureToken()
        const now = new Date()
        const expiresAt = new Date(now.getTime() + SESSION_TTL * 1000)

        const session: Session = {
          id: sessionId,
          token,
          ...data,
          createdAt: now,
          expiresAt,
          lastAccessedAt: now,
        }

        // Store in Redis
        await redis.setex(`${SESSION_PREFIX}${token}`, SESSION_TTL, JSON.stringify(session))

        // Store in database for audit trail
        await prisma.userSession.create({
          data: {
            id: sessionId,
            userId: data.userId,
            tenantId: data.tenantId,
            token: this.hashToken(token), // Store hashed token
            authProvider: data.authProvider,
            authProviderId: data.authProviderId,
            ipAddress: data.metadata?.ipAddress,
            userAgent: data.metadata?.userAgent,
            metadata: data.metadata,
            expiresAt,
            isActive: true,
          },
        })

        // Update user's last login
        await prisma.user.update({
          where: { id: data.userId },
          data: { lastLoginAt: now },
        })

        telemetry.recordEvent('session_created', {
          userId: data.userId,
          tenantId: data.tenantId,
          authProvider: data.authProvider,
          sessionId,
        })

        return token
      },
      {
        entityType: 'session',
        operationType: 'create',
        userId: data.userId,
        tenantId: data.tenantId,
      }
    )
  }

  /**
   * Validate and get session
   */
  async validateSession(token: string): Promise<Session | null> {
    try {
      // Get from Redis
      const sessionData = await redis.get(`${SESSION_PREFIX}${token}`)
      if (!sessionData) {
        return null
      }

      const session: Session = JSON.parse(sessionData)

      // Check if expired
      if (new Date() > new Date(session.expiresAt)) {
        await this.invalidateSession(token)
        return null
      }

      // Update last accessed time
      session.lastAccessedAt = new Date()
      await redis.setex(`${SESSION_PREFIX}${token}`, SESSION_TTL, JSON.stringify(session))

      // Update database record
      await prisma.userSession.updateMany({
        where: {
          userId: session.userId,
          isActive: true,
        },
        data: {
          lastAccessedAt: session.lastAccessedAt,
        },
      })

      return session
    } catch (error) {
      return null
    }
  }

  /**
   * Invalidate session
   */
  async invalidateSession(token: string): Promise<void> {
    try {
      // Get session data first
      const sessionData = await redis.get(`${SESSION_PREFIX}${token}`)
      if (sessionData) {
        const session: Session = JSON.parse(sessionData)

        // Remove from Redis
        await redis.del(`${SESSION_PREFIX}${token}`)

        // Mark as inactive in database
        await prisma.userSession.updateMany({
          where: {
            userId: session.userId,
            isActive: true,
          },
          data: {
            isActive: false,
            loggedOutAt: new Date(),
          },
        })

        telemetry.recordEvent('session_invalidated', {
          userId: session.userId,
          tenantId: session.tenantId,
          sessionId: session.id,
        })
      }
    } catch (error) {}
  }

  /**
   * Invalidate all sessions for a user
   */
  async invalidateUserSessions(userId: string): Promise<void> {
    try {
      // Get all active sessions from database
      const sessions = await prisma.userSession.findMany({
        where: {
          userId,
          isActive: true,
        },
      })

      // Remove from Redis
      const pipeline = redis.pipeline()
      for (const session of sessions) {
        // We need to scan Redis for sessions since we only store hashed tokens
        // In production, consider maintaining a user->sessions mapping
      }
      await pipeline.exec()

      // Mark all as inactive
      await prisma.userSession.updateMany({
        where: {
          userId,
          isActive: true,
        },
        data: {
          isActive: false,
          loggedOutAt: new Date(),
        },
      })

      telemetry.recordEvent('user_sessions_invalidated', {
        userId,
        sessionCount: sessions.length,
      })
    } catch (error) {}
  }

  /**
   * Get active sessions for a user
   */
  async getUserSessions(userId: string): Promise<
    Array<{
      id: string
      authProvider: string
      createdAt: Date
      lastAccessedAt: Date
      ipAddress?: string
      userAgent?: string
    }>
  > {
    const sessions = await prisma.userSession.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        authProvider: true,
        createdAt: true,
        lastAccessedAt: true,
        ipAddress: true,
        userAgent: true,
      },
      orderBy: {
        lastAccessedAt: 'desc',
      },
    })

    return sessions
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<void> {
    try {
      const result = await prisma.userSession.updateMany({
        where: {
          isActive: true,
          expiresAt: { lt: new Date() },
        },
        data: {
          isActive: false,
        },
      })

      if (result.count > 0) {
        telemetry.recordEvent('expired_sessions_cleaned', {
          count: result.count,
        })
      }
    } catch (error) {}
  }

  /**
   * Generate secure token
   */
  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('base64url')
  }

  /**
   * Hash token for storage
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex')
  }

  /**
   * Extend session expiry
   */
  async extendSession(token: string, additionalSeconds?: number): Promise<boolean> {
    try {
      const sessionData = await redis.get(`${SESSION_PREFIX}${token}`)
      if (!sessionData) {
        return false
      }

      const session: Session = JSON.parse(sessionData)
      const extension = additionalSeconds || SESSION_TTL
      const newExpiry = new Date(Date.now() + extension * 1000)

      session.expiresAt = newExpiry
      session.lastAccessedAt = new Date()

      await redis.setex(`${SESSION_PREFIX}${token}`, extension, JSON.stringify(session))

      await prisma.userSession.updateMany({
        where: {
          userId: session.userId,
          isActive: true,
        },
        data: {
          expiresAt: newExpiry,
          lastAccessedAt: session.lastAccessedAt,
        },
      })

      return true
    } catch (error) {
      return false
    }
  }
}

// Global session manager instance
export const sessionManager = new SessionManager()

// Convenience functions
export const createSession = (data: SessionData) => sessionManager.createSession(data)
export const validateSession = (token: string) => sessionManager.validateSession(token)
export const invalidateSession = (token: string) => sessionManager.invalidateSession(token)
export const invalidateUserSessions = (userId: string) =>
  sessionManager.invalidateUserSessions(userId)
export const getUserSessions = (userId: string) => sessionManager.getUserSessions(userId)

// Run cleanup job periodically
if (process.env.NODE_ENV !== 'test') {
  setInterval(
    () => {
      sessionManager.cleanupExpiredSessions().catch(console.error)
    },
    60 * 60 * 1000
  ) // Every hour
}
