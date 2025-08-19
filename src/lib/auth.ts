/**
 * CoreFlow360 - Authentication v2
 * Ultimate production-ready auth with complete error handling
 */

import NextAuth from 'next-auth'
import type { Session } from 'next-auth'
import { createAuthConfig, isBuildPhase } from './auth-build-safe'

// Extended session type
export interface ExtendedSession extends Session {
  user: Session['user'] & {
    id: string
    tenantId?: string
    role?: string
    departmentId?: string
    permissions?: string[]
  }
  csrfToken?: string
}

// Create NextAuth instance with error handling
let authInstance: ReturnType<typeof NextAuth> | null = null

function getAuthInstance() {
  if (isBuildPhase()) {
    // Return mock for build time
    return {
      auth: async () => null,
      handlers: {
        GET: async () => new Response('Build time', { status: 200 }),
        POST: async () => new Response('Build time', { status: 200 }),
      },
      signIn: async () => {
        throw new Error('Build time')
      },
      signOut: async () => {
        throw new Error('Build time')
      },
    } as unknown
  }

  if (!authInstance) {
    try {
      const config = createAuthConfig()
      authInstance = NextAuth(config)
    } catch (error) {
      // Return a mock instance that always returns null/error
      authInstance = {
        auth: async () => null,
        handlers: {
          GET: async () => new Response('Auth service unavailable', { status: 503 }),
          POST: async () => new Response('Auth service unavailable', { status: 503 }),
        },
        signIn: async () => {
          throw new Error('Auth service unavailable')
        },
        signOut: async () => {
          throw new Error('Auth service unavailable')
        },
      } as unknown
    }
  }
  return authInstance
}

// Export auth method with complete error handling
export const auth = async (): Promise<Session | null> => {
  if (isBuildPhase()) {
    return null
  }

  try {
    const instance = getAuthInstance()
    const session = await instance.auth()

    // Validate session structure
    if (session && typeof session === 'object' && 'user' in session) {
      return session
    }

    return null
  } catch (error) {
    return null
  }
}

// Export handlers with error handling
export const handlers = {
  GET: async (req: Request) => {
    try {
      const instance = getAuthInstance()
      return await instance.handlers.GET(req)
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Authentication service error' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  },
  POST: async (req: Request) => {
    try {
      const instance = getAuthInstance()
      return await instance.handlers.POST(req)
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Authentication service error' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  },
}

// Export auth actions with error handling
export const signIn = async (...args: unknown[]) => {
  if (isBuildPhase()) {
    return { error: 'Cannot sign in during build time' }
  }

  try {
    const instance = getAuthInstance()
    return await instance.signIn(...args)
  } catch (error) {
    throw error
  }
}

export const signOut = async (...args: unknown[]) => {
  if (isBuildPhase()) {
    return { success: false }
  }

  try {
    const instance = getAuthInstance()
    return await instance.signOut(...args)
  } catch (error) {
    throw error
  }
}

// Export handlers for route.ts
export const { GET, POST } = handlers

// Re-export for convenience
export { createAuthConfig, isBuildPhase }

// Helper functions
export async function getServerSession(): Promise<ExtendedSession | null> {
  if (isBuildPhase()) {
    return null
  }

  try {
    const session = await auth()
    if (!session) return null

    // Type assertion with validation
    if ('user' in session && session.user) {
      return session as ExtendedSession
    }

    return null
  } catch (error) {
    return null
  }
}

export async function requireAuth(): Promise<ExtendedSession> {
  const session = await getServerSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

export function hasPermission(session: ExtendedSession, permission: string): boolean {
  if (!session.user) return false
  if (session.user.role === 'SUPER_ADMIN') return true
  if (session.user.role === 'ADMIN') {
    const superAdminOnly = ['system:manage', 'tenant:delete']
    return !superAdminOnly.includes(permission)
  }
  return session.user.permissions?.includes(permission) || false
}

export async function requirePermission(permission: string): Promise<ExtendedSession> {
  const session = await requireAuth()
  if (!hasPermission(session, permission)) {
    throw new Error('Forbidden')
  }
  return session
}

// Password utilities with lazy loading
export async function hashPassword(password: string): Promise<string> {
  if (isBuildPhase()) {
    return 'build-time-hash'
  }
  const bcryptjs = await import('bcryptjs')
  return bcryptjs.default.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  if (isBuildPhase()) {
    return false
  }
  const bcryptjs = await import('bcryptjs')
  return bcryptjs.default.compare(password, hashedPassword)
}
