/**
 * CoreFlow360 - Build-Safe Authentication Configuration
 * This file provides auth that works during Vercel build phase
 */

import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import type { NextAuthConfig } from "next-auth"

// Detect if we're in build phase
function isBuilding(): boolean {
  return !!(
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.BUILDING_FOR_VERCEL === '1' ||
    process.env.VERCEL_ENV === 'production' ||
    process.env.CI === 'true' ||
    process.env.VERCEL_BUILD === '1' ||
    (process.env.VERCEL && !process.env.DATABASE_URL)
  )
}

// Minimal build-time configuration
const buildTimeConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async () => null // No auth during build
    })
  ],
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET || "build-time-secret-placeholder-min-32-chars",
  pages: {
    signIn: "/login",
    error: "/auth/error"
  },
  callbacks: {
    jwt: async ({ token }) => token,
    session: async ({ session }) => session
  }
}

// Runtime configuration (lazy loaded)
function getRuntimeConfig(): NextAuthConfig {
  // Only import these at runtime
  const { PrismaAdapter } = require("@auth/prisma-adapter")
  const bcryptjs = require("bcryptjs")
  const { z } = require("zod")
  
  // Lazy load prisma
  const getPrisma = () => {
    const { prisma } = require("./db")
    return prisma
  }

  // Login schema
  const loginSchema = z.object({
    email: z.string().email().transform((val: string) => val.toLowerCase().trim()),
    password: z.string().min(8),
    tenantId: z.string().uuid().optional()
  })

  return {
    adapter: PrismaAdapter(getPrisma()),
    session: {
      strategy: "jwt", // Use JWT to avoid database dependency
      maxAge: 8 * 60 * 60,
      updateAge: 60 * 60
    },
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
      CredentialsProvider({
        name: "credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
          tenantId: { label: "Tenant ID", type: "text" }
        },
        async authorize(credentials) {
          try {
            const { email, password, tenantId } = loginSchema.parse(credentials)
            const prisma = getPrisma()

            const user = await prisma.user.findFirst({
              where: {
                email,
                ...(tenantId && { tenantId })
              },
              include: {
                tenant: true,
                department: true
              }
            })

            if (!user || !user.password) return null
            if (user.status !== 'ACTIVE') return null
            if (!user.tenant || !user.tenant.isActive) return null

            const isPasswordValid = await bcryptjs.compare(password, user.password)
            if (!isPasswordValid) return null

            await prisma.user.update({
              where: { id: user.id },
              data: { lastLoginAt: new Date() }
            })

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.avatar,
              tenantId: user.tenantId,
              role: user.role,
              departmentId: user.departmentId,
              permissions: JSON.parse(user.permissions || '[]')
            }
          } catch (error) {
            console.error('Auth error:', error)
            return null
          }
        }
      }),
      ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET
        })
      ] : [])
    ],
    pages: {
      signIn: "/login",
      signOut: "/logout",
      error: "/auth/error",
      verifyRequest: "/auth/verify-request",
      newUser: "/onboarding"
    },
    callbacks: {
      jwt: async ({ token, user }) => {
        if (user) {
          token.id = user.id
          token.tenantId = user.tenantId
          token.role = user.role
          token.departmentId = user.departmentId
          token.permissions = user.permissions
        }
        return token
      },
      session: async ({ session, token }) => {
        if (token && session.user) {
          session.user.id = token.id as string
          session.user.tenantId = token.tenantId as string
          session.user.role = token.role as string
          session.user.departmentId = token.departmentId as string
          session.user.permissions = token.permissions as string[]
        }
        return session
      }
    }
  }
}

// Create auth instance
let authInstance: ReturnType<typeof NextAuth> | null = null

function getAuthInstance() {
  if (!authInstance) {
    const config = isBuilding() ? buildTimeConfig : getRuntimeConfig()
    authInstance = NextAuth(config)
  }
  return authInstance
}

// Export auth methods
export const auth = () => {
  const instance = getAuthInstance()
  return instance.auth()
}

export const { handlers: { GET, POST } } = (() => {
  try {
    return getAuthInstance()
  } catch (error) {
    console.error('Failed to create auth handlers:', error)
    // Return mock handlers for build time
    return {
      handlers: {
        GET: async () => new Response('Auth not initialized', { status: 503 }),
        POST: async () => new Response('Auth not initialized', { status: 503 })
      }
    }
  }
})()

export const signIn = (...args: Parameters<ReturnType<typeof NextAuth>['signIn']>) => {
  const instance = getAuthInstance()
  return instance.signIn(...args)
}

export const signOut = (...args: Parameters<ReturnType<typeof NextAuth>['signOut']>) => {
  const instance = getAuthInstance()
  return instance.signOut(...args)
}

// Session type exports
export interface ExtendedSession {
  user: {
    id: string
    email?: string | null
    name?: string | null
    image?: string | null
    tenantId: string
    role: string
    departmentId?: string
    permissions: string[]
  }
  expires: string
}

// Helper functions
export async function getServerSession(): Promise<ExtendedSession | null> {
  try {
    const session = await auth()
    return session as ExtendedSession
  } catch {
    return null
  }
}

export async function requireAuth() {
  const session = await getServerSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

export function hasPermission(session: ExtendedSession, permission: string): boolean {
  if (session.user.role === 'SUPER_ADMIN') return true
  if (session.user.role === 'ADMIN') {
    const superAdminOnly = ['system:manage', 'tenant:delete']
    return !superAdminOnly.includes(permission)
  }
  return session.user.permissions.includes(permission)
}

export async function requirePermission(permission: string) {
  const session = await requireAuth()
  if (!hasPermission(session, permission)) {
    throw new Error('Forbidden')
  }
  return session
}

// Password helpers (don't need database)
export async function hashPassword(password: string): Promise<string> {
  const bcryptjs = require("bcryptjs")
  return bcryptjs.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const bcryptjs = require("bcryptjs")
  return bcryptjs.compare(password, hashedPassword)
}