/**
 * Build-safe authentication configuration
 * EMERGENCY FIX: This file ensures auth NEVER initializes during build time
 */

import type { NextAuthConfig } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

// Comprehensive build detection
export const isBuildPhase = () => {
  // Check all possible build indicators
  return !!(
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.BUILDING_FOR_VERCEL === '1' ||
    process.env.CI === 'true' ||
    process.env.VERCEL_ENV === 'production' ||
    process.env.VERCEL === '1' ||
    process.env.NOW_BUILDER === '1' ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    (typeof window === 'undefined' && !process.env.DATABASE_URL)
  )
}

// EMERGENCY: Mock provider for build time - NO database access
const buildTimeProvider = CredentialsProvider({
  name: 'build-time',
  credentials: {},
  async authorize() {
    return null
  },
})

// Real provider for runtime - with lazy loading
const getRuntimeProviders = () => {
  const providers: NextAuthConfig['providers'] = []

  providers.push(
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // EMERGENCY: Double-check we're not in build phase
        if (isBuildPhase()) {
          return null
        }

        try {
          // Lazy load dependencies only at runtime
          const [bcryptjs, { z }, { getPrisma }] = await Promise.all([
            import('bcryptjs'),
            import('zod'),
            import('./db'),
          ])

          const loginSchema = z.object({
            email: z.string().email(),
            password: z.string().min(8),
          })

          const parsed = loginSchema.safeParse(credentials)
          if (!parsed.success) return null

          const { email, password } = parsed.data

          // Use safe database access
          const prisma = getPrisma()
          const user = await prisma.user.findFirst({
            where: { email },
            include: {
              tenant: true,
              department: true,
            },
          })

          if (!user || !user.password) return null

          const isValid = await bcryptjs.compare(password, user.password)
          if (!isValid) return null

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.avatar,
            tenantId: user.tenantId,
            role: user.role,
            departmentId: user.departmentId,
          }
        } catch (error) {
          return null
        }
      },
    })
  )

  return providers
}

// Export config factory with build-time safety
export const createAuthConfig = (): NextAuthConfig => {
  const isBuild = isBuildPhase()

  return {
    providers: isBuild ? [buildTimeProvider] : getRuntimeProviders(),
    secret: process.env.NEXTAUTH_SECRET || 'dev-secret-minimum-32-characters-for-security',
    session: {
      strategy: 'jwt',
      maxAge: 8 * 60 * 60,
    },
    pages: {
      signIn: '/login',
      error: '/auth/error',
    },
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id
          token.tenantId = (user as unknown).tenantId
          token.role = (user as unknown).role
          token.departmentId = (user as unknown).departmentId
        }
        return token
      },
      async session({ session, token }) {
        if (session.user) {
          session.user.id = token.id as string
          session.user.tenantId = token.tenantId as string
          session.user.role = token.role as string
          session.user.departmentId = token.departmentId as string
        }
        return session
      },
    },
    debug: false, // Never debug in production
  }
}
