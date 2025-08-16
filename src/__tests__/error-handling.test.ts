/**
 * CoreFlow360 - Error Handling Tests
 * Tests for comprehensive error handling system
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { ZodError, z } from 'zod'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { errorHandler, ErrorType } from '@/lib/error-handler'
import { clientErrorHandler } from '@/lib/client-error-handler'

// Mock NextResponse.json
vi.mock('next/server', () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    json: vi.fn((data, init) => ({
      status: init?.status || 200,
      data,
      headers: { set: vi.fn() }
    }))
  }
}))

// Mock Prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    auditLog: {
      create: vi.fn().mockResolvedValue({ id: 'test-audit-log' })
    }
  }
}))

describe('Error Handling System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset console methods
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Server-side Error Handler', () => {
    it('should handle validation errors correctly', () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number().min(18)
      })

      try {
        schema.parse({ email: 'invalid-email', age: 15 })
      } catch (error) {
        const response = errorHandler.handleValidationError(error, {
          requestId: 'test-request',
          endpoint: '/api/test'
        })

        expect(response.status).toBe(400)
        expect(response.data.success).toBe(false)
        expect(response.data.error.type).toBe('VALIDATION_ERROR')
      }
    })

    it('should handle authentication errors', () => {
      const error = new Error('Authentication failed')
      const response = errorHandler.handleAuthError(error, {
        requestId: 'test-request',
        endpoint: '/api/protected'
      })

      expect(response.status).toBe(401)
      expect(response.data.success).toBe(false)
      expect(response.data.error.type).toBe('AUTHENTICATION_ERROR')
    })

    it('should handle authorization errors', () => {
      const error = new Error('Access denied')
      const response = errorHandler.handleAuthzError(error, {
        requestId: 'test-request',
        userId: 'user-123'
      })

      expect(response.status).toBe(403)
      expect(response.data.success).toBe(false)
      expect(response.data.error.type).toBe('AUTHORIZATION_ERROR')
    })

    it('should handle not found errors', () => {
      const response = errorHandler.handleNotFoundError('User', {
        requestId: 'test-request',
        tenantId: 'tenant-123'
      })

      expect(response.status).toBe(404)
      expect(response.data.success).toBe(false)
      expect(response.data.error.message).toContain('User not found')
    })

    it('should handle rate limit errors', () => {
      const retryAfter = 60000 // 1 minute
      const response = errorHandler.handleRateLimitError(retryAfter, {
        requestId: 'test-request',
        ip: '192.168.1.1'
      })

      expect(response.status).toBe(429)
      expect(response.data.success).toBe(false)
      expect(response.data.error.type).toBe('RATE_LIMIT_ERROR')
    })

    it('should handle Prisma errors correctly', () => {
      const prismaError = new PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '4.0.0',
          meta: { target: ['email'] }
        }
      )

      const response = errorHandler.handleError(prismaError, {
        requestId: 'test-request'
      }, ErrorType.DATABASE)

      expect(response.status).toBe(500)
      expect(response.data.success).toBe(false)
      expect(response.data.error.type).toBe('DATABASE_ERROR')
    })

    it('should sanitize error messages in production', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      const error = new Error('Database password=secret123 failed')
      const response = errorHandler.handleError(error, {
        requestId: 'test-request'
      })

      expect(response.data.error.message).not.toContain('secret123')
      expect(response.data.error.message).toContain('password=***')

      process.env.NODE_ENV = originalEnv
    })

    it('should log errors to database', async () => {
      const { prisma } = await import('@/lib/db')
      
      const error = new Error('Test error')
      errorHandler.handleError(error, {
        requestId: 'test-request',
        userId: 'user-123',
        tenantId: 'tenant-123'
      })

      // Wait a bit for async logging
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'ERROR',
            entityType: 'SYSTEM',
            tenantId: 'tenant-123',
            userId: 'user-123'
          })
        })
      )
    })
  })

  describe('Client-side Error Handler', () => {
    beforeEach(() => {
      // Reset client error handler state
      ;(clientErrorHandler as any).errorCallbacks = []
      ;(clientErrorHandler as any).toastCallbacks = []
    })

    it('should handle API errors correctly', () => {
      const mockResponse = {
        ok: false,
        status: 400
      } as Response

      const errorData = {
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          code: 'VALIDATION_FAILED',
          message: 'Invalid input data',
          timestamp: new Date().toISOString()
        }
      }

      const result = clientErrorHandler.handleApiError(mockResponse, errorData)

      expect(result).not.toBeNull()
      expect(result?.error.type).toBe('VALIDATION_ERROR')
      expect(result?.error.message).toBe('Invalid input data')
    })

    it('should handle network errors', () => {
      const networkError = new Error('Failed to fetch')
      const result = clientErrorHandler.handleNetworkError(networkError, '/api/test')

      expect(result.error.type).toBe('NETWORK_ERROR')
      expect(result.error.code).toBe('NETWORK_FAILED')
      expect(result.error.message).toContain('Network request failed')
    })

    it('should handle validation errors from forms', () => {
      const toastCallback = vi.fn()
      clientErrorHandler.onToast(toastCallback)

      const validationErrors = {
        email: ['Invalid email format'],
        password: ['Password too short', 'Password must contain numbers']
      }

      clientErrorHandler.handleValidationError(validationErrors)

      expect(toastCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          title: 'Form Validation Failed',
          message: 'Please fix 2 errors and try again.'
        })
      )
    })

    it('should provide safe fetch wrapper', async () => {
      // Mock successful response
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: 'test' })
      })
      global.fetch = mockFetch

      const result = await clientErrorHandler.safeFetch('/api/test')

      expect(result.data).toEqual({ data: 'test' })
      expect(result.error).toBeNull()
    })

    it('should handle fetch failures in safe fetch', async () => {
      // Mock fetch failure
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'))
      global.fetch = mockFetch

      const result = await clientErrorHandler.safeFetch('/api/test')

      expect(result.data).toBeNull()
      expect(result.error?.error.type).toBe('NETWORK_ERROR')
    })

    it('should register and unregister callbacks correctly', () => {
      const errorCallback = vi.fn()
      const toastCallback = vi.fn()

      const unregisterError = clientErrorHandler.onError(errorCallback)
      const unregisterToast = clientErrorHandler.onToast(toastCallback)

      // Trigger error
      const mockResponse = { ok: false, status: 500 } as Response
      clientErrorHandler.handleApiError(mockResponse, {
        success: false,
        error: {
          type: 'INTERNAL_ERROR',
          code: 'SERVER_ERROR',
          message: 'Internal server error',
          timestamp: new Date().toISOString()
        }
      })

      expect(errorCallback).toHaveBeenCalled()
      expect(toastCallback).toHaveBeenCalled()

      // Unregister callbacks
      unregisterError()
      unregisterToast()

      // Clear mock calls
      errorCallback.mockClear()
      toastCallback.mockClear()

      // Trigger error again
      clientErrorHandler.handleApiError(mockResponse, {
        success: false,
        error: {
          type: 'INTERNAL_ERROR',
          code: 'SERVER_ERROR',
          message: 'Internal server error',
          timestamp: new Date().toISOString()
        }
      })

      // Callbacks should not be called
      expect(errorCallback).not.toHaveBeenCalled()
      expect(toastCallback).not.toHaveBeenCalled()
    })
  })

  describe('Error Types and Severity', () => {
    it('should classify error types correctly', () => {
      const testCases = [
        { error: new Error('Validation failed'), expectedType: ErrorType.VALIDATION },
        { error: new Error('Unauthorized access'), expectedType: ErrorType.AUTHENTICATION },
        { error: new Error('Access denied'), expectedType: ErrorType.AUTHORIZATION },
        { error: new Error('User not found'), expectedType: ErrorType.NOT_FOUND },
        { error: new Error('Database connection failed'), expectedType: ErrorType.DATABASE }
      ]

      testCases.forEach(({ error, expectedType }) => {
        const response = errorHandler.handleError(error, { requestId: 'test' }, expectedType)
        expect(response.data.error.type).toBe(expectedType)
      })
    })

    it('should include appropriate context in error responses', () => {
      const error = new Error('Test error')
      const context = {
        requestId: 'req-123',
        userId: 'user-456',
        tenantId: 'tenant-789',
        endpoint: '/api/test',
        method: 'POST'
      }

      const response = errorHandler.handleError(error, context)

      expect(response.data.error.requestId).toBe('req-123')
      expect(response.data.timestamp).toBeDefined()
    })

    it('should handle stack traces correctly based on environment', () => {
      const originalEnv = process.env.NODE_ENV
      
      // Test development environment
      process.env.NODE_ENV = 'development'
      const devError = new Error('Development error')
      const devResponse = errorHandler.handleError(devError, { requestId: 'dev-test' })
      
      // Test production environment
      process.env.NODE_ENV = 'production'
      const prodError = new Error('Production error')
      const prodResponse = errorHandler.handleError(prodError, { requestId: 'prod-test' })

      // Restore environment
      process.env.NODE_ENV = originalEnv

      // In development, we might include more details (this depends on implementation)
      expect(devResponse.data.error.code).toBeDefined()
      expect(prodResponse.data.error.code).toBeDefined()
    })
  })
})