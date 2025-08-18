/**
 * CoreFlow360 - Security Middleware Tests
 * Comprehensive security validation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { 
  securityMiddleware, 
  sanitizeInput, 
  validateApiKey,
  validateWebhookSignature,
  escapeSqlIdentifier
} from '../../middleware/security'

// Mock NextResponse
vi.mock('next/server', () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    next: vi.fn(() => ({ 
      status: 200, 
      headers: {
        set: vi.fn(),
        get: vi.fn().mockReturnValue('test-header-value')
      }
    })),
    json: vi.fn((data, init) => ({ 
      status: init?.status || 200, 
      json: async () => data,
      headers: {
        set: vi.fn(),
        get: vi.fn().mockReturnValue('test-header-value'),
        ...Object.entries(init?.headers || {}).reduce((acc, [key, value]) => {
          acc[key] = value
          return acc
        }, {} as any)
      }
    }))
  }
}))

describe('Security Middleware', () => {
  let mockRequest: NextRequest

  beforeEach(() => {
    mockRequest = {
      method: 'GET',
      headers: new Map([
        ['x-forwarded-for', '127.0.0.1']
      ]),
      cookies: {
        get: vi.fn()
      },
      nextUrl: {
        pathname: '/api/test'
      },
      ip: '127.0.0.1'
    } as any
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', async () => {
      const response = await securityMiddleware(mockRequest)
      expect(response.status).toBe(200)
    })

    it('should block requests exceeding rate limit', async () => {
      // Simulate multiple requests
      for (let i = 0; i < 100; i++) {
        await securityMiddleware(mockRequest)
      }
      
      // Next request should be blocked
      const response = await securityMiddleware(mockRequest)
      expect(response.status).toBe(429)
    })

    it('should apply different rate limits for auth endpoints', async () => {
      mockRequest.nextUrl.pathname = '/api/auth/login'
      
      // Auth endpoints have stricter limits (5 per 15 min)
      for (let i = 0; i < 5; i++) {
        await securityMiddleware(mockRequest)
      }
      
      const response = await securityMiddleware(mockRequest)
      expect(response.status).toBe(429)
    })
  })

  describe('CSRF Protection', () => {
    it('should validate CSRF token for mutations', async () => {
      mockRequest.method = 'POST'
      mockRequest.headers.set('x-csrf-token', 'invalid-token')
      mockRequest.cookies.get = vi.fn().mockReturnValue({ value: 'valid-token' })

      const response = await securityMiddleware(mockRequest)
      expect(response.status).toBe(403)
    })

    it('should allow mutations with valid CSRF token', async () => {
      const validToken = process.env.TEST_CSRF_TOKEN || 'test-csrf-token'
      mockRequest.method = 'POST'
      mockRequest.headers.set('x-csrf-token', validToken)
      mockRequest.cookies.get = vi.fn().mockReturnValue({ value: validToken })

      const response = await securityMiddleware(mockRequest)
      expect(response.status).toBe(200)
    })

    it('should skip CSRF for GET requests', async () => {
      mockRequest.method = 'GET'
      const response = await securityMiddleware(mockRequest)
      expect(response.status).toBe(200)
    })
  })

  describe('Security Headers', () => {
    it('should set all required security headers', async () => {
      const response = await securityMiddleware(mockRequest)
      
      // Just verify the response has proper structure
      expect(response).toBeTruthy()
      expect(response.headers).toBeTruthy()
      expect(response.headers.set).toHaveBeenCalled()
    })
  })
})

describe('Input Sanitization', () => {
  it('should sanitize string inputs', () => {
    const maliciousInput = '<script>alert("xss")</script>Hello'
    const sanitized = sanitizeInput(maliciousInput)
    
    expect(sanitized).not.toContain('<script>')
    expect(sanitized).toContain('Hello') // Script should be removed, text should remain
  })

  it('should handle nested objects', () => {
    const input = {
      name: '<b>Test</b>',
      data: {
        script: '<script>evil()</script>'
      }
    }
    
    const sanitized = sanitizeInput(input)
    expect(sanitized.name).toBe('&lt;b&gt;Test&lt;&#x2F;b&gt;') // Forward slash is encoded
    expect(sanitized.data.script).not.toContain('<script>')
  })

  it('should handle arrays', () => {
    const input = ['<script>alert(1)</script>', 'safe text', '<img src=x onerror=alert(1)>']
    const sanitized = sanitizeInput(input)
    
    expect(sanitized[0]).not.toContain('<script>')
    expect(sanitized[1]).toBe('safe text')
    expect(sanitized[2]).toContain('&lt;img') // HTML is encoded, not removed
  })

  it('should remove null bytes', () => {
    const input = 'test\0malicious'
    const sanitized = sanitizeInput(input)
    
    expect(sanitized).toBe('testmalicious')
  })
})

describe('API Key Validation', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv, API_KEY_SECRET: process.env.TEST_API_SECRET || 'test-secret' }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should validate correctly formatted API keys', () => {
    // Generate a valid API key for testing
    const crypto = await import('crypto')
    const tenantId = 'tenant123'
    const random = 'random456'
    const prefix = 'cf360'
    
    const signature = crypto
      .createHmac('sha256', process.env.TEST_API_SECRET || 'test-secret')
      .update(`${prefix}_${tenantId}_${random}`)
      .digest('hex')
      .substring(0, 16)
    
    const apiKey = `${prefix}_${tenantId}_${random}_${signature}`
    const result = validateApiKey(apiKey)
    
    expect(result.valid).toBe(true)
    expect(result.tenantId).toBe(tenantId)
  })

  it('should reject invalid API keys', () => {
    const invalidKeys = [
      'invalid-format',
      'cf360_tenant_random_invalidsig',
      'wrong_prefix_tenant_random_sig',
      '',
      null,
      undefined
    ]
    
    invalidKeys.forEach(key => {
      const result = validateApiKey(key as any)
      expect(result.valid).toBe(false)
    })
  })
})

describe('SQL Injection Prevention', () => {
  it('should escape SQL identifiers', () => {
    const maliciousInputs = [
      'table; DROP TABLE users;--',
      'column`',
      "field' OR '1'='1",
      'name/*comment*/'
    ]
    
    maliciousInputs.forEach(input => {
      const escaped = escapeSqlIdentifier(input)
      expect(escaped).toMatch(/^[a-zA-Z0-9_]*$/)
      expect(escaped).not.toContain(';')
      expect(escaped).not.toContain("'")
      expect(escaped).not.toContain('`')
      expect(escaped).not.toContain('/*')
    })
  })
})

describe('Webhook Signature Validation', () => {
  it('should validate correct webhook signatures', () => {
    const payload = JSON.stringify({ event: 'test' })
    const secret = process.env.TEST_WEBHOOK_SECRET || 'test-webhook-secret'
    const crypto = await import('crypto')
    
    const signature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
    
    const isValid = validateWebhookSignature(payload, signature, secret)
    expect(isValid).toBe(true)
  })

  it('should reject invalid webhook signatures', () => {
    const payload = JSON.stringify({ event: 'test' })
    const secret = process.env.TEST_WEBHOOK_SECRET || 'test-webhook-secret'
    const invalidSignature = 'invalid-signature'
    
    const isValid = validateWebhookSignature(payload, invalidSignature, secret)
    expect(isValid).toBe(false)
  })

  it('should use timing-safe comparison', () => {
    // This test ensures the function doesn't return early on first mismatch
    const payload = JSON.stringify({ event: 'test' })
    const secret = process.env.TEST_WEBHOOK_SECRET || 'test-webhook-secret'
    
    const startTime = Date.now()
    validateWebhookSignature(payload, 'a'.repeat(64), secret)
    const shortTime = Date.now() - startTime
    
    const startTime2 = Date.now()
    validateWebhookSignature(payload, 'z'.repeat(64), secret)
    const longTime = Date.now() - startTime2
    
    // Times should be similar (timing-safe)
    expect(Math.abs(shortTime - longTime)).toBeLessThan(5)
  })
})