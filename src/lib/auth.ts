/**
 * CoreFlow360 - Authentication Configuration
 * Fixed version that works on Vercel
 */

import NextAuth from "next-auth"
import type { NextAuthConfig, Session } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { JWT } from "next-auth/jwt"

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

// Define auth configuration
const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        tenantId: { label: "Tenant ID", type: "text" }
      },
      async authorize(credentials) {
        // Check if we're in a build environment
        if (process.env.NEXT_PHASE === 'phase-production-build') {
          return null
        }

        try {
          // Only load dependencies when actually authenticating
          const [bcryptjs, { z }, { prisma }] = await Promise.all([
            import("bcryptjs"),
            import("zod"),
            import("./db")
          ])

          const loginSchema = z.object({
            email: z.string().email(),
            password: z.string().min(8),
            tenantId: z.string().optional()
          })

          const parsed = loginSchema.safeParse(credentials)
          if (!parsed.success) return null

          const { email, password, tenantId } = parsed.data

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

          const isValid = await bcryptjs.compare(password, user.password)
          if (!isValid) return null

          // Update last login
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
          }).catch(console.error)

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
          console.error('[Auth] Login error:', error)
          return null
        }
      }
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authorization: {
          params: {
            prompt: 'consent',
            access_type: 'offline',
            response_type: 'code'
          }
        }
      })
    ] : [])
  ],
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
    updateAge: 60 * 60 // 1 hour
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "dev-secret-minimum-32-characters-long-for-security",
  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/login", // Redirect to login on error
    verifyRequest: "/auth/verify-request",
    newUser: "/onboarding"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.tenantId = (user as any).tenantId
        token.role = (user as any).role
        token.departmentId = (user as any).departmentId
        token.permissions = (user as any).permissions
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.tenantId = token.tenantId as string
        session.user.role = token.role as string
        session.user.departmentId = token.departmentId as string
        session.user.permissions = (token.permissions as string[]) || []
      }
      return session as ExtendedSession
    },
    async signIn({ user, account }) {
      // Allow all sign ins for now
      return true
    }
  },
  events: {
    async signIn({ user }) {
      console.log('[Auth] User signed in:', user.email)
    },
    async signOut({ token }) {
      console.log('[Auth] User signed out')
    }
  },
  debug: process.env.NODE_ENV === 'development'
}

// Create NextAuth instance
const nextAuthInstance = NextAuth(authConfig)

// Export auth methods
export const { auth, handlers, signIn, signOut } = nextAuthInstance
export const { GET, POST } = handlers

// Helper functions
export async function getServerSession(): Promise<ExtendedSession | null> {
  try {
    const session = await auth()
    return session as ExtendedSession
  } catch (error) {
    console.error('[Auth] Get session error:', error)
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
  if (!session.user) return false
  if (session.user.role === 'SUPER_ADMIN') return true
  if (session.user.role === 'ADMIN') {
    const superAdminOnly = ['system:manage', 'tenant:delete']
    return !superAdminOnly.includes(permission)
  }
  return session.user.permissions?.includes(permission) || false
}

export async function requirePermission(permission: string) {
  const session = await requireAuth()
  if (!hasPermission(session, permission)) {
    throw new Error('Forbidden')
  }
  return session
}

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  const bcryptjs = await import("bcryptjs")
  return bcryptjs.default.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const bcryptjs = await import("bcryptjs")
  return bcryptjs.default.compare(password, hashedPassword)
}