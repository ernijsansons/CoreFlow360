import NextAuth, { Session } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcryptjs from "bcryptjs"
import { prisma } from "./db"
import { z } from "zod"
import { initializeCSRFProtection } from "./csrf"

// Enhanced login schema with security validations
const loginSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email too long')
    .transform(val => val.toLowerCase().trim()),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain uppercase, lowercase, number, and special character'),
  tenantId: z.string().uuid('Invalid tenant ID format').optional()
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

// Create auth configuration with lazy environment variable access
const authConfig = () => {
  const isProd = process.env.NODE_ENV === 'production'
  const authUrl = process.env.NEXTAUTH_URL
  const domain = isProd && authUrl ? authUrl.replace(/https?:\/\//, '') : undefined
  
  return {
    adapter: PrismaAdapter(prisma),
    session: { 
      strategy: "database",
      maxAge: 8 * 60 * 60, // 8 hours for security
      updateAge: 60 * 60, // Update session every hour
    },
    cookies: {
      sessionToken: {
        name: isProd ? `__Host-next-auth.session-token` : 'next-auth.session-token',
        options: {
          httpOnly: true,
          sameSite: 'strict',
          path: '/',
          secure: isProd,
          domain: domain
        }
      },
      callbackUrl: {
        name: isProd ? `__Host-next-auth.callback-url` : 'next-auth.callback-url',
        options: {
          httpOnly: true,
          sameSite: 'strict',
          path: '/',
          secure: isProd
        }
      },
      csrfToken: {
        name: isProd ? `__Host-next-auth.csrf-token` : 'next-auth.csrf-token',
        options: {
          httpOnly: true,
          sameSite: 'strict',
          path: '/',
          secure: isProd
        }
      }
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
            // Don't log sensitive information - use structured logging
            return null
          }

          // Check if user is active
          if (user.status !== 'ACTIVE') {
            return null
          }

          // Check if tenant is active
          if (!user.tenant || !user.tenant.isActive) {
            return null
          }

          // Check if account is locked
          if (user.lockoutUntil && user.lockoutUntil > new Date()) {
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
          // Log error without sensitive data
          if (process.env.NODE_ENV === 'development') {
            console.error('Authorization error:', error instanceof Error ? error.message : 'Unknown error')
          }
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
      const secret = process.env.API_KEY_SECRET || process.env.NEXTAUTH_SECRET
      if (!secret) {
        throw new Error('No secret available for CSRF token generation')
      }
      const csrfToken = initializeCSRFProtection(secret)
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
  debug: false // Disable debug in all environments for security
  }
}

// Export NextAuth configuration
export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut
} = NextAuth(authConfig())

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