import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { securityMiddleware, sanitizeInput, validateApiKey, validateCsrfToken } from '@/middleware/security'
import { NextRequest } from 'next/server'

describe('Security Middleware', () => {
  let mockRequest: NextRequest

  beforeEach(() => {
    // Create a mock request
    mockRequest = new NextRequest('http://localhost:3000/api/test', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'user-agent': 'test-agent',
        'x-forwarded-for': '127.0.0.1'
      }
    })
  })

  describe('CSRF Protection', () => {
    it('should reject requests without CSRF token', async () => {
      const response = await securityMiddleware(mockRequest)
      expect(response.status).toBe(403)
    })

    it('should accept requests with valid CSRF token', async () => {
      // Add valid CSRF token
      mockRequest.headers.set('x-csrf-token', 'valid-token')
      mockRequest.cookies.set('csrf-token', 'valid-token')
      
      const response = await securityMiddleware(mockRequest)
      expect(response.status).toBe(200)
    })

    it('should reject requests with mismatched CSRF tokens', async () => {
      mockRequest.headers.set('x-csrf-token', 'token1')
      mockRequest.cookies.set('csrf-token', 'token2')
      
      const response = await securityMiddleware(mockRequest)
      expect(response.status).toBe(403)
    })

    it('should skip CSRF check for webhook endpoints', async () => {
      const webhookRequest = new NextRequest('http://localhost:3000/api/stripe/webhook', {
        method: 'POST',
        headers: { 'content-type': 'application/json' }
      })
      
      const response = await securityMiddleware(webhookRequest)
      expect(response.status).toBe(200)
    })
  })

  describe('Rate Limiting', () => {
    it('should apply rate limiting to API endpoints', async () => {
      // Make multiple requests to trigger rate limiting
      const requests = Array(101).fill(null).map(() => 
        securityMiddleware(mockRequest)
      )
      
      const responses = await Promise.all(requests)
      const rateLimited = responses.filter(r => r.status === 429)
      
      expect(rateLimited.length).toBeGreaterThan(0)
    })

    it('should apply stricter rate limiting to auth endpoints', async () => {
      const authRequest = new NextRequest('http://localhost:3000/api/auth/signin', {
        method: 'POST',
        headers: { 'content-type': 'application/json' }
      })
      
      // Make multiple auth requests
      const requests = Array(6).fill(null).map(() => 
        securityMiddleware(authRequest)
      )
      
      const responses = await Promise.all(requests)
      const rateLimited = responses.filter(r => r.status === 429)
      
      expect(rateLimited.length).toBeGreaterThan(0)
    })
  })

  describe('Security Headers', () => {
    it('should set security headers', async () => {
      const response = await securityMiddleware(mockRequest)
      
      expect(response.headers.get('X-Frame-Options')).toBe('SAMEORIGIN')
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
      expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block')
      expect(response.headers.get('Strict-Transport-Security')).toContain('max-age=63072000')
    })

    it('should set Content Security Policy', async () => {
      const response = await securityMiddleware(mockRequest)
      const csp = response.headers.get('Content-Security-Policy')
      
      expect(csp).toContain("default-src 'self'")
      expect(csp).toContain("script-src 'self'")
      expect(csp).toContain("frame-ancestors 'none'")
    })
  })
})

describe('Input Sanitization', () => {
  describe('String Sanitization', () => {
    it('should remove null bytes and control characters', () => {
      const input = 'test\x00string\x1Fwith\x7Fcontrol'
      const sanitized = sanitizeInput(input)
      expect(sanitized).toBe('teststringwithcontrol')
    })

    it('should prevent script injection', () => {
      const input = '<script>alert("xss")</script>Hello'
      const sanitized = sanitizeInput(input)
      expect(sanitized).not.toContain('<script>')
      expect(sanitized).toContain('Hello')
    })

    it('should prevent javascript protocol injection', () => {
      const input = 'javascript:alert("xss")'
      const sanitized = sanitizeInput(input)
      expect(sanitized).not.toContain('javascript:')
    })

    it('should prevent event handler injection', () => {
      const input = 'onclick=alert("xss")'
      const sanitized = sanitizeInput(input)
      expect(sanitized).not.toContain('onclick=')
    })

    it('should encode special characters', () => {
      const input = '<script>&"\'/'
      const sanitized = sanitizeInput(input)
      expect(sanitized).toContain('&lt;')
      expect(sanitized).toContain('&amp;')
      expect(sanitized).toContain('&quot;')
      expect(sanitized).toContain('&#x27;')
      expect(sanitized).toContain('&#x2F;')
    })
  })

  describe('Object Sanitization', () => {
    it('should sanitize nested objects', () => {
      const input = {
        name: '<script>alert("xss")</script>',
        email: 'test@example.com',
        data: {
          description: 'javascript:alert("xss")'
        }
      }
      
      const sanitized = sanitizeInput(input)
      expect(sanitized.name).not.toContain('<script>')
      expect(sanitized.email).toBe('test@example.com')
      expect(sanitized.data.description).not.toContain('javascript:')
    })

    it('should sanitize arrays', () => {
      const input = [
        '<script>alert("xss")</script>',
        'normal text',
        { key: 'javascript:alert("xss")' }
      ]
      
      const sanitized = sanitizeInput(input)
      expect(sanitized[0]).not.toContain('<script>')
      expect(sanitized[1]).toBe('normal text')
      expect(sanitized[2].key).not.toContain('javascript:')
    })
  })
})

describe('API Key Validation', () => {
  it('should validate correct API key format', () => {
    const apiKey = process.env.TEST_API_KEY || 'cf360_test123_random456_signature789'
    const result = validateApiKey(apiKey)
    expect(result.valid).toBe(true)
    expect(result.tenantId).toBe('test123')
  })

  it('should reject invalid API key format', () => {
    const invalidKeys = [
      'invalid_key',
      'cf360_',
      'cf360_tenant',
      'cf360_tenant_random',
      'cf360_tenant_random_signature_extra'
    ]
    
    invalidKeys.forEach(key => {
      const result = validateApiKey(key)
      expect(result.valid).toBe(false)
    })
  })

  it('should reject API keys with invalid tenant ID format', () => {
    const apiKey = process.env.TEST_INVALID_API_KEY || 'cf360_test@123_random456_signature789'
    const result = validateApiKey(apiKey)
    expect(result.valid).toBe(false)
  })
})

describe('CSRF Token Validation', () => {
  it('should validate matching tokens', () => {
    const token = process.env.TEST_CSRF_TOKEN || 'test-token-123'
    const result = validateCsrfToken(token, token)
    expect(result).toBe(true)
  })

  it('should reject mismatched tokens', () => {
    const result = validateCsrfToken('token1', 'token2')
    expect(result).toBe(false)
  })

  it('should reject empty tokens', () => {
    expect(validateCsrfToken('', 'token')).toBe(false)
    expect(validateCsrfToken('token', '')).toBe(false)
    expect(validateCsrfToken('', '')).toBe(false)
  })
})
