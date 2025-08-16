import NextAuth, { Session } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcryptjs from "bcryptjs"
import { prisma } from "./db"
import { z } from "zod"
import { initializeCSRFProtection } from "./csrf"

// Login schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  tenantId: z.string().optional()
})

// Extended session type
export interface ExtendedSession extends Session {
  user: Session['user'] & {
    id: string
    tenantId: string
    role: string
    departmentId?: string
    permissions: string[]
  }
  csrfToken?: string
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/onboarding"
  },
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
          // Validate credentials
          const { email, password, tenantId } = loginSchema.parse(credentials)

          // Find user with tenant
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

          if (!user || !user.password) {
            console.error('User not found or no password set')
            return null
          }

          // Check if user is active
          if (user.status !== 'ACTIVE') {
            console.error('User account is not active')
            return null
          }

          // Check if tenant is active
          if (!user.tenant || !user.tenant.isActive) {
            console.error('Tenant is not active or not found')
            return null
          }

          // Check if account is locked
          if (user.lockoutUntil && user.lockoutUntil > new Date()) {
            console.error('Account is locked')
            return null
          }

          // Verify password
          const isPasswordValid = await bcryptjs.compare(password, user.password)
          if (!isPasswordValid) {
            // Increment login attempts
            await prisma.user.update({
              where: { id: user.id },
              data: { 
                loginAttempts: { increment: 1 },
                ...(user.loginAttempts >= 4 && {
                  lockoutUntil: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
                })
              }
            })
            console.error('Invalid password')
            return null
          }

          // Reset login attempts and update last login
          await prisma.user.update({
            where: { id: user.id },
            data: {
              loginAttempts: 0,
              lockoutUntil: null,
              lastLoginAt: new Date()
            }
          })

          // Return user data for session
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.avatar,
            tenantId: user.tenantId,
            role: user.role,
            departmentId: user.departmentId,
            permissions: (() => {
              try {
                return JSON.parse(user.permissions || '[]')
              } catch {
                return []
              }
            })()
          }
        } catch (error) {
          console.error('Authorization error:', error)
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
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // For OAuth providers, ensure user is associated with a tenant
      if (account?.provider !== 'credentials') {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { tenant: true }
        })

        if (!existingUser) {
          // For new OAuth users, redirect to tenant selection
          return '/onboarding/select-tenant'
        }

        // Check if tenant is active
        if (!existingUser.tenant || !existingUser.tenant.isActive) {
          console.error('Tenant is not active or not found')
          return false
        }

        // Update last login
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { lastLoginAt: new Date() }
        })
      }

      return true
    },
    async jwt({ token, user, account, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.tenantId = user.tenantId
        token.role = user.role
        token.departmentId = user.departmentId
        token.permissions = user.permissions
      }

      // Update token if session is updated
      if (trigger === 'update' && session) {
        token = { ...token, ...session }
      }

      // Refresh tenant data periodically (every 5 minutes)
      if (token.tenantId && token.iat && Date.now() - token.iat * 1000 > 5 * 60 * 1000) {
        const user = await prisma.user.findUnique({
          where: { id: token.id as string },
          include: { tenant: true }
        })

        if (user && user.tenant && user.tenant.isActive) {
          token.tenantId = user.tenantId
          token.role = user.role
          token.permissions = (() => {
            try {
              return JSON.parse(user.permissions || '[]')
            } catch {
              return []
            }
          })()
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.tenantId = token.tenantId as string
        session.user.role = token.role as string
        session.user.departmentId = token.departmentId as string
        session.user.permissions = token.permissions as string[]
      }

      // Generate CSRF token for the session
      const csrfToken = initializeCSRFProtection(process.env.API_KEY_SECRET!)
      return {
        ...session,
        csrfToken
      } as ExtendedSession
    },
    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after successful login
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      } else if (new URL(url).origin === baseUrl) {
        return url
      }
      return `${baseUrl}/dashboard`
    }
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      // Log sign in event
      if (user.id && user.tenantId) {
        await prisma.auditLog.create({
          data: {
            tenantId: user.tenantId,
            userId: user.id,
            action: 'LOGIN',
            entityType: 'user',
            entityId: user.id,
            metadata: JSON.stringify({
              provider: account?.provider || 'credentials',
              isNewUser
            })
          }
        }).catch(console.error) // Don't fail auth if audit log fails
      }
    },
    async signOut({ token }) {
      // Log sign out event
      if (token?.id && token?.tenantId) {
        await prisma.auditLog.create({
          data: {
            tenantId: token.tenantId as string,
            userId: token.id as string,
            action: 'LOGOUT',
            entityType: 'user',
            entityId: token.id as string
          }
        }).catch(console.error) // Don't fail signout if audit log fails
      }
    }
  },
  debug: process.env.NODE_ENV === 'development'
})

/**
 * Helper function to hash passwords
 */
export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 12)
}

/**
 * Helper function to verify passwords
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcryptjs.compare(password, hashedPassword)
}

/**
 * Get server session with extended user data
 */
export async function getServerSession(): Promise<ExtendedSession | null> {
  const session = await auth()
  if (!session) return null
  
  // Type guard to ensure session has required properties
  if ('user' in session && session.user && 
      'id' in session.user && 
      'tenantId' in session.user && 
      'role' in session.user &&
      'permissions' in session.user) {
    return session as ExtendedSession
  }
  
  return null
}

/**
 * Require authentication middleware
 */
export async function requireAuth() {
  const session = await getServerSession()
  
  if (!session) {
    throw new Error('Unauthorized')
  }
  
  return session
}

/**
 * Check if user has permission
 */
export function hasPermission(session: ExtendedSession, permission: string): boolean {
  if (session.user.role === 'SUPER_ADMIN') return true
  if (session.user.role === 'ADMIN') {
    // Admins have most permissions except super admin actions
    const superAdminOnly = ['system:manage', 'tenant:delete']
    return !superAdminOnly.includes(permission)
  }
  return session.user.permissions.includes(permission)
}

/**
 * Require specific permission
 */
export async function requirePermission(permission: string) {
  const session = await requireAuth()
  
  if (!hasPermission(session, permission)) {
    throw new Error('Forbidden')
  }
  
  return session
}