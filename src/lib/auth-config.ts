/**
 * NextAuth configuration with complete build-time safety
 */

import type { NextAuthConfig } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

// Build-time detection
export const isBuildTime = () => {
  return !!(
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.BUILDING_FOR_VERCEL === '1' ||
    process.env.CI === 'true' ||
    process.env.VERCEL_ENV === 'production' ||
    (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL)
  )
}

// Safe environment helpers
export const getAuthSecret = () => {
  if (isBuildTime()) {
    return 'build-time-placeholder-secret-minimum-32-characters-long-for-security'
  }
  return (
    process.env.NEXTAUTH_SECRET ||
    process.env.AUTH_SECRET ||
    'dev-secret-minimum-32-characters-long-for-security'
  )
}

export const getAuthUrl = () => {
  if (isBuildTime()) {
    return 'https://example.vercel.app'
  }
  return (
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  )
}

// Build-safe provider configuration
export const getProviders = () => {
  const providers: NextAuthConfig['providers'] = []

  // Always include credentials provider
  providers.push(
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        tenantId: { label: 'Tenant ID', type: 'text' },
      },
      async authorize(credentials) {
        // Skip during build
        if (isBuildTime()) {
          return null
        }

        try {
          // Dynamic imports to prevent build-time loading
          const [bcryptjs, { z }, { prisma }] = await Promise.all([
            import('bcryptjs'),
            import('zod'),
            import('./db'),
          ])

          const loginSchema = z.object({
            email: z.string().email(),
            password: z.string().min(8),
            tenantId: z.string().optional(),
          })

          const parsed = loginSchema.safeParse(credentials)
          if (!parsed.success) return null

          const { email, password, tenantId } = parsed.data

          const user = await prisma.user.findFirst({
            where: {
              email,
              ...(tenantId && { tenantId }),
            },
            include: {
              tenant: true,
              department: true,
            },
          })

          if (!user || !user.password) return null
          if (user.status !== 'ACTIVE') return null
          if (!user.tenant || !user.tenant.isActive) return null

          const isValid = await bcryptjs.compare(password, user.password)
          if (!isValid) return null

          // Update last login
          await prisma.user
            .update({
              where: { id: user.id },
              data: { lastLoginAt: new Date() },
            })
            .catch(console.error)

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.avatar,
            tenantId: user.tenantId,
            role: user.role,
            departmentId: user.departmentId,
            permissions: JSON.parse(user.permissions || '[]'),
          }
        } catch (error) {
          return null
        }
      },
    })
  )

  // Add Google provider if configured
  if (!isBuildTime() && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authorization: {
          params: {
            prompt: 'consent',
            access_type: 'offline',
            response_type: 'code',
          },
        },
      })
    )
  }

  return providers
}

// Complete auth configuration
export const authConfig: NextAuthConfig = {
  providers: getProviders(),
  secret: getAuthSecret(),
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
    updateAge: 60 * 60, // 1 hour
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/onboarding',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.tenantId = (user as unknown).tenantId
        token.role = (user as unknown).role
        token.departmentId = (user as unknown).departmentId
        token.permissions = (user as unknown).permissions
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
      return session
    },
    async signIn({ user, account }) {
      // Allow all sign ins for now
      return true
    },
  },
  events: {
    async signIn({ user }) {
      if (!isBuildTime()) {
      }
    },
    async signOut({ token }) {
      if (!isBuildTime()) {
      }
    },
  },
  debug: process.env.NODE_ENV === 'development' && !isBuildTime(),
}
