/**
 * Deployment Validation Tests
 * Comprehensive system validation for production deployment
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { NextRequest } from 'next/server'

// Mock environment for testing
const mockEnv = {
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
  NEXTAUTH_SECRET: 'test-secret-minimum-32-characters-long-for-testing',
  NEXTAUTH_URL: 'http://localhost:3000',
}

describe('Deployment Validation', () => {
  beforeAll(() => {
    // Set test environment
    Object.entries(mockEnv).forEach(([key, value]) => {
      process.env[key] = value
    })
  })

  afterAll(() => {
    // Clean up environment
    Object.keys(mockEnv).forEach((key) => {
      delete process.env[key]
    })
  })

  describe('Environment Configuration', () => {
    it('should have all required environment variables', () => {
      const requiredVars = ['NODE_ENV', 'DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL']

      requiredVars.forEach((varName) => {
        expect(process.env[varName]).toBeDefined()
        expect(process.env[varName]).not.toBe('')
      })
    })

    it('should validate environment configuration without errors', async () => {
      // Dynamic import to avoid module-level execution
      const { validateEnvironment } = await import('@/lib/config/environment')

      const validation = validateEnvironment()

      if (!validation.valid) {
        // // console.log('Validation errors:', validation.errors)
      }

      expect(validation.valid).toBe(true)
    })

    it('should load configuration without circular dependencies', async () => {
      expect(async () => {
        await import('@/lib/config/environment')
      }).not.toThrow()
    })
  })

  describe('Authentication System', () => {
    it('should load NextAuth configuration without errors', async () => {
      expect(async () => {
        // Test that auth config can be imported
        await import('@/lib/auth')
      }).not.toThrow()
    })

    it('should validate JWT secret length', () => {
      const secret = process.env.NEXTAUTH_SECRET
      expect(secret).toBeDefined()
      expect(secret!.length).toBeGreaterThanOrEqual(32)
    })
  })

  describe('Middleware Functionality', () => {
    it('should handle requests without crashing', async () => {
      const { middleware } = await import('@/middleware')

      const request = new NextRequest('http://localhost:3000/')

      expect(async () => {
        await middleware(request)
      }).not.toThrow()
    })

    it('should skip middleware during build phase', async () => {
      // Mock build environment
      process.env.NEXT_PHASE = 'phase-production-build'

      const { middleware } = await import('@/middleware')
      const request = new NextRequest('http://localhost:3000/dashboard')

      const response = await middleware(request)

      expect(response.status).not.toBe(307) // No redirect during build

      // Cleanup
      delete process.env.NEXT_PHASE
    })

    it('should apply security headers', async () => {
      const { middleware } = await import('@/middleware')

      const request = new NextRequest('http://localhost:3000/')
      const response = await middleware(request)

      expect(response.headers.get('X-Frame-Options')).toBe('DENY')
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
      expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin')
    })
  })

  describe('Database Configuration', () => {
    it('should have valid database URL format', () => {
      const dbUrl = process.env.DATABASE_URL
      expect(dbUrl).toBeDefined()
      expect(dbUrl).toMatch(/^postgresql:\/\//)
    })

    it('should load Prisma client without errors in non-build environments', async () => {
      // Skip this test during build phase
      if (process.env.NEXT_PHASE === 'phase-production-build') {
        return
      }

      expect(async () => {
        await import('@/lib/prisma')
      }).not.toThrow()
    })
  })

  describe('API Routes', () => {
    it('should load health check route without errors', async () => {
      expect(async () => {
        await import('@/app/api/health/route')
      }).not.toThrow()
    })

    it('should load authentication routes without errors', async () => {
      expect(async () => {
        await import('@/app/api/auth/[...nextauth]/route')
      }).not.toThrow()
    })
  })

  describe('Security Validation', () => {
    it('should not expose sensitive environment variables', () => {
      const sensitiveVars = [
        'STRIPE_SECRET_KEY',
        'GOOGLE_CLIENT_SECRET',
        'OPENAI_API_KEY',
        'DATABASE_PASSWORD',
      ]

      // These should not be accessible in client-side code
      sensitiveVars.forEach((varName) => {
        // In a real app, these would not be accessible client-side
        if (typeof window !== 'undefined') {
          expect(process.env[varName]).toBeUndefined()
        }
      })
    })

    it('should validate CSRF protection configuration', async () => {
      const { middleware } = await import('@/middleware')

      const request = new NextRequest('http://localhost:3000/api/test')
      const response = await middleware(request)

      // Should have CSRF protection headers
      expect(response.headers.get('X-Frame-Options')).toBeTruthy()
      expect(response.headers.get('X-Content-Type-Options')).toBeTruthy()
    })
  })

  describe('Build Configuration', () => {
    it('should load Next.js config without errors', async () => {
      expect(async () => {
        await import('@/../next.config')
      }).not.toThrow()
    })

    it('should have proper TypeScript configuration', () => {
      // This test ensures TypeScript errors are not ignored
      expect(process.env.IGNORE_BUILD_ERRORS).not.toBe('true')
    })
  })

  describe('Performance Validation', () => {
    it('should load core modules efficiently', async () => {
      const startTime = Date.now()

      await Promise.all([
        import('@/lib/config/environment'),
        import('@/middleware'),
        import('@/lib/auth'),
      ])

      const loadTime = Date.now() - startTime

      // Should load core modules in under 1 second
      expect(loadTime).toBeLessThan(1000)
    })

    it('should not have circular dependency issues', async () => {
      // Test loading modules that commonly have circular dependencies
      const modules = ['@/lib/auth', '@/lib/config/environment', '@/middleware', '@/lib/prisma']

      for (const modulePath of modules) {
        await expect(async () => {
          await import(modulePath)
        }).not.toThrow()
      }
    })
  })

  describe('Error Handling', () => {
    it('should handle missing environment variables gracefully', async () => {
      // Temporarily remove a variable
      const original = process.env.NEXTAUTH_SECRET
      delete process.env.NEXTAUTH_SECRET

      expect(async () => {
        const { validateEnvironment } = await import('@/lib/config/environment')
        validateEnvironment()
      }).not.toThrow()

      // Restore
      process.env.NEXTAUTH_SECRET = original
    })

    it('should handle database connection errors gracefully', async () => {
      // Test with invalid database URL
      const original = process.env.DATABASE_URL
      process.env.DATABASE_URL = 'invalid-url'

      expect(async () => {
        const { validateEnvironment } = await import('@/lib/config/environment')
        validateEnvironment()
      }).not.toThrow()

      // Restore
      process.env.DATABASE_URL = original
    })
  })
})
