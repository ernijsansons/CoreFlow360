/**
 * Authentication Session Security Tests
 * Critical security validation for authentication system
 */

import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { withAuth, withAdminAuth, withPermissions } from '@/lib/auth/withAuth'

// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn()
}))

// Mock security middleware
vi.mock('@/middleware/security', () => ({
  validateCsrfToken: vi.fn((token1: string, token2: string) => token1 === token2)
}))

const mockGetServerSession = getServerSession as Mock

describe('Authentication Security Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('CSRF Protection', () => {
    it('should reject POST requests without CSRF token', async () => {
      const validSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          tenantId: 'tenant-123',
          role: 'user',
          departmentId: 'dept-123',
          permissions: ['read', 'write']
        }
      }

      mockGetServerSession.mockResolvedValue(validSession)

      const mockHandler = vi.fn()
      const protectedHandler = withAuth(mockHandler)

      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST'
      })
      const response = await protectedHandler(request)

      expect(response.status).toBe(403)
      expect(mockHandler).not.toHaveBeenCalled()

      const responseData = await response.json()
      expect(responseData.error).toBe('Invalid CSRF token')
      expect(responseData.code).toBe('CSRF_VALIDATION_FAILED')
    })

    it('should accept POST requests with valid CSRF token', async () => {
      const validSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          tenantId: 'tenant-123',
          role: 'user',
          departmentId: 'dept-123',
          permissions: ['read', 'write']
        }
      }

      mockGetServerSession.mockResolvedValue(validSession)

      const mockHandler = vi.fn().mockImplementation(() => 
        NextResponse.json({ success: true })
      )
      const protectedHandler = withAuth(mockHandler)

      const csrfToken = 'test-csrf-token-123'
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'x-csrf-token': csrfToken
        }
      })
      // Mock cookie
      Object.defineProperty(request, 'cookies', {
        value: {
          get: (name: string) => name === 'csrf-token' ? { value: csrfToken } : null
        }
      })

      const response = await protectedHandler(request)

      expect(response.status).toBe(200)
      expect(mockHandler).toHaveBeenCalled()
    })

    it('should skip CSRF check for GET requests', async () => {
      const validSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          tenantId: 'tenant-123',
          role: 'user',
          departmentId: 'dept-123',
          permissions: ['read']
        }
      }

      mockGetServerSession.mockResolvedValue(validSession)

      const mockHandler = vi.fn().mockImplementation(() => 
        NextResponse.json({ success: true })
      )
      const protectedHandler = withAuth(mockHandler)

      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET'
      })
      const response = await protectedHandler(request)

      expect(response.status).toBe(200)
      expect(mockHandler).toHaveBeenCalled()
    })

    it('should skip CSRF check when skipCsrfCheck option is true', async () => {
      const validSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          tenantId: 'tenant-123',
          role: 'user',
          departmentId: 'dept-123',
          permissions: ['webhook:receive']
        }
      }

      mockGetServerSession.mockResolvedValue(validSession)

      const mockHandler = vi.fn().mockImplementation(() => 
        NextResponse.json({ success: true })
      )
      const webhookHandler = withAuth(mockHandler, { skipCsrfCheck: true })

      const request = new NextRequest('http://localhost:3000/api/webhook', {
        method: 'POST'
      })
      const response = await webhookHandler(request)

      expect(response.status).toBe(200)
      expect(mockHandler).toHaveBeenCalled()
    })
  })

  describe('Session Validation', () => {
    it('should reject requests without valid session', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const mockHandler = vi.fn()
      const protectedHandler = withAuth(mockHandler)

      const request = new NextRequest('http://localhost:3000/api/test')
      const response = await protectedHandler(request)

      expect(response.status).toBe(401)
      expect(mockHandler).not.toHaveBeenCalled()

      const responseData = await response.json()
      expect(responseData.error).toBe('Authentication required')
      expect(responseData.code).toBe('UNAUTHORIZED')
    })

    it('should reject sessions with missing required fields', async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: 'user-123',
          email: 'test@example.com'
          // Missing tenantId
        }
      })

      const mockHandler = vi.fn()
      const protectedHandler = withAuth(mockHandler)

      const request = new NextRequest('http://localhost:3000/api/test')
      const response = await protectedHandler(request)

      expect(response.status).toBe(401)
      expect(mockHandler).not.toHaveBeenCalled()

      const responseData = await response.json()
      expect(responseData.error).toBe('Invalid session data')
      expect(responseData.code).toBe('INVALID_SESSION')
    })

    it('should accept valid sessions with all required fields', async () => {
      const validSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          tenantId: 'tenant-123',
          role: 'user',
          departmentId: 'dept-123',
          permissions: ['read', 'write']
        }
      }

      mockGetServerSession.mockResolvedValue(validSession)

      const mockHandler = vi.fn().mockImplementation(() => 
        NextResponse.json({ success: true })
      )
      const protectedHandler = withAuth(mockHandler)

      const request = new NextRequest('http://localhost:3000/api/test')
      const response = await protectedHandler(request)

      expect(response.status).toBe(200)
      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          user: validSession.user,
          tenantId: validSession.user.tenantId
        }),
        validSession
      )
    })
  })

  describe('Role-Based Access Control (RBAC)', () => {
    it('should enforce admin role requirements', async () => {
      const userSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          tenantId: 'tenant-123',
          role: 'user', // Not admin
          departmentId: 'dept-123',
          permissions: ['read']
        }
      }

      mockGetServerSession.mockResolvedValue(userSession)

      const mockHandler = vi.fn()
      const adminHandler = withAdminAuth(mockHandler)

      const request = new NextRequest('http://localhost:3000/api/admin/test')
      const response = await adminHandler(request)

      expect(response.status).toBe(403)
      expect(mockHandler).not.toHaveBeenCalled()

      const responseData = await response.json()
      expect(responseData.error).toBe('Insufficient role permissions')
      expect(responseData.required).toBe('admin')
      expect(responseData.current).toBe('user')
      expect(responseData.code).toBe('INSUFFICIENT_ROLE')
    })

    it('should allow admin access for admin users', async () => {
      const adminSession = {
        user: {
          id: 'admin-123',
          email: 'admin@example.com',
          name: 'Admin User',
          tenantId: 'tenant-123',
          role: 'admin',
          departmentId: 'dept-123',
          permissions: ['admin:read', 'admin:write']
        }
      }

      mockGetServerSession.mockResolvedValue(adminSession)

      const mockHandler = vi.fn().mockImplementation(() => 
        NextResponse.json({ success: true })
      )
      const adminHandler = withAdminAuth(mockHandler)

      const request = new NextRequest('http://localhost:3000/api/admin/test')
      const response = await adminHandler(request)

      expect(response.status).toBe(200)
      expect(mockHandler).toHaveBeenCalled()
    })
  })

  describe('Permission-Based Access Control', () => {
    it('should enforce specific permission requirements', async () => {
      const limitedSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          tenantId: 'tenant-123',
          role: 'user',
          departmentId: 'dept-123',
          permissions: ['read'] // Missing 'consciousness:write'
        }
      }

      mockGetServerSession.mockResolvedValue(limitedSession)

      const mockHandler = vi.fn()
      const permissionHandler = withPermissions(['consciousness:write'])(mockHandler)

      const request = new NextRequest('http://localhost:3000/api/consciousness/update')
      const response = await permissionHandler(request)

      expect(response.status).toBe(403)
      expect(mockHandler).not.toHaveBeenCalled()

      const responseData = await response.json()
      expect(responseData.error).toBe('Insufficient permissions')
      expect(responseData.required).toEqual(['consciousness:write'])
      expect(responseData.current).toEqual(['read'])
      expect(responseData.code).toBe('INSUFFICIENT_PERMISSIONS')
    })

    it('should allow access when user has required permissions', async () => {
      const authorizedSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          tenantId: 'tenant-123',
          role: 'user',
          departmentId: 'dept-123',
          permissions: ['read', 'consciousness:write']
        }
      }

      mockGetServerSession.mockResolvedValue(authorizedSession)

      const mockHandler = vi.fn().mockImplementation(() => 
        NextResponse.json({ success: true })
      )
      const permissionHandler = withPermissions(['consciousness:write'])(mockHandler)

      const request = new NextRequest('http://localhost:3000/api/consciousness/update')
      const response = await permissionHandler(request)

      expect(response.status).toBe(200)
      expect(mockHandler).toHaveBeenCalled()
    })

    it('should require ALL specified permissions', async () => {
      const partialPermissionSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          tenantId: 'tenant-123',
          role: 'user',
          departmentId: 'dept-123',
          permissions: ['read', 'consciousness:write'] // Missing 'admin:read'
        }
      }

      mockGetServerSession.mockResolvedValue(partialPermissionSession)

      const mockHandler = vi.fn()
      const multiPermissionHandler = withPermissions(['consciousness:write', 'admin:read'])(mockHandler)

      const request = new NextRequest('http://localhost:3000/api/admin/consciousness')
      const response = await multiPermissionHandler(request)

      expect(response.status).toBe(403)
      expect(mockHandler).not.toHaveBeenCalled()
    })
  })

  describe('HTTP Method Validation', () => {
    it('should reject disallowed HTTP methods', async () => {
      const validSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          tenantId: 'tenant-123',
          role: 'user',
          departmentId: 'dept-123',
          permissions: ['read']
        }
      }

      mockGetServerSession.mockResolvedValue(validSession)

      const mockHandler = vi.fn()
      const getOnlyHandler = withAuth(mockHandler, {
        allowedMethods: ['GET']
      })

      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST'
      })
      const response = await getOnlyHandler(request)

      expect(response.status).toBe(405)
      expect(mockHandler).not.toHaveBeenCalled()

      const responseData = await response.json()
      expect(responseData.error).toBe('Method not allowed')
      expect(responseData.allowed).toEqual(['GET'])
    })

    it('should allow specified HTTP methods', async () => {
      const validSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          tenantId: 'tenant-123',
          role: 'user',
          departmentId: 'dept-123',
          permissions: ['read']
        }
      }

      mockGetServerSession.mockResolvedValue(validSession)

      const mockHandler = vi.fn().mockImplementation(() => 
        NextResponse.json({ success: true })
      )
      const multiMethodHandler = withAuth(mockHandler, {
        allowedMethods: ['GET', 'POST']
      })

      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST'
      })
      const response = await multiMethodHandler(request)

      expect(response.status).toBe(200)
      expect(mockHandler).toHaveBeenCalled()
    })
  })

  describe('Tenant Isolation', () => {
    it('should add tenant context to requests', async () => {
      const tenantSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          tenantId: 'tenant-abc',
          role: 'user',
          departmentId: 'dept-123',
          permissions: ['read']
        }
      }

      mockGetServerSession.mockResolvedValue(tenantSession)

      const mockHandler = vi.fn().mockImplementation((request, session) => {
        expect(request.tenantId).toBe('tenant-abc')
        expect(request.user).toEqual(tenantSession.user)
        return NextResponse.json({ success: true })
      })

      const protectedHandler = withAuth(mockHandler)

      const request = new NextRequest('http://localhost:3000/api/test')
      const response = await protectedHandler(request)

      expect(response.status).toBe(200)
      expect(mockHandler).toHaveBeenCalled()
    })

    it('should generate request ID if not provided', async () => {
      const validSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          tenantId: 'tenant-123',
          role: 'user',
          departmentId: 'dept-123',
          permissions: ['read']
        }
      }

      mockGetServerSession.mockResolvedValue(validSession)

      const mockHandler = vi.fn().mockImplementation((request) => {
        expect(request.requestId).toBeDefined()
        expect(typeof request.requestId).toBe('string')
        return NextResponse.json({ success: true })
      })

      const protectedHandler = withAuth(mockHandler)

      const request = new NextRequest('http://localhost:3000/api/test')
      const response = await protectedHandler(request)

      expect(response.status).toBe(200)
    })

    it('should preserve existing request ID', async () => {
      const validSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          tenantId: 'tenant-123',
          role: 'user',
          departmentId: 'dept-123',
          permissions: ['read']
        }
      }

      mockGetServerSession.mockResolvedValue(validSession)

      const expectedRequestId = 'req-123-abc'

      const mockHandler = vi.fn().mockImplementation((request) => {
        expect(request.requestId).toBe(expectedRequestId)
        return NextResponse.json({ success: true })
      })

      const protectedHandler = withAuth(mockHandler)

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-request-id': expectedRequestId
        }
      })
      const response = await protectedHandler(request)

      expect(response.status).toBe(200)
    })
  })

  describe('Error Handling', () => {
    it('should handle auth service errors gracefully', async () => {
      mockGetServerSession.mockRejectedValue(new Error('Auth service unavailable'))

      const mockHandler = vi.fn()
      const protectedHandler = withAuth(mockHandler)

      const request = new NextRequest('http://localhost:3000/api/test')
      const response = await protectedHandler(request)

      expect(response.status).toBe(500)
      expect(mockHandler).not.toHaveBeenCalled()

      const responseData = await response.json()
      expect(responseData.error).toBe('Authentication service error')
      expect(responseData.code).toBe('AUTH_SERVICE_ERROR')
    })

    it('should log authentication errors for monitoring', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      mockGetServerSession.mockRejectedValue(new Error('Database connection failed'))

      const mockHandler = vi.fn()
      const protectedHandler = withAuth(mockHandler)

      const request = new NextRequest('http://localhost:3000/api/test')
      await protectedHandler(request)

      expect(consoleSpy).toHaveBeenCalledWith(
        'Authentication wrapper error:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })

    it('should handle handler errors without exposing auth details', async () => {
      const validSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          tenantId: 'tenant-123',
          role: 'user',
          departmentId: 'dept-123',
          permissions: ['read']
        }
      }

      mockGetServerSession.mockResolvedValue(validSession)

      const mockHandler = vi.fn().mockImplementation(() => {
        throw new Error('Handler error')
      })

      const protectedHandler = withAuth(mockHandler)

      const request = new NextRequest('http://localhost:3000/api/test')
      
      // The auth wrapper should not catch handler errors
      // The handler error should bubble up
      await expect(protectedHandler(request)).rejects.toThrow('Handler error')
    })
  })

  describe('Session Type Guards', () => {
    it('should validate session structure with type guard', async () => {
      // Import the type guard
      const { isAuthenticatedSession } = await import('@/lib/auth/withAuth')

      const validSession = {
        user: {
          id: 'user-123',
          tenantId: 'tenant-123',
          role: 'user'
        }
      }

      const invalidSession = {
        user: {
          id: 'user-123'
          // Missing tenantId and role
        }
      }

      expect(isAuthenticatedSession(validSession)).toBe(true)
      expect(isAuthenticatedSession(invalidSession)).toBe(false)
      expect(isAuthenticatedSession(null)).toBe(false)
      expect(isAuthenticatedSession(undefined)).toBe(false)
    })
  })
})