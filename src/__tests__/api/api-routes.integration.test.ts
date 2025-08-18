/**
 * API Routes Integration Tests
 * Comprehensive testing for all API endpoints
 */

import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'
import { NextRequest } from 'next/server'

// Mock authentication
vi.mock('next-auth', () => ({
  getServerSession: vi.fn()
}))

// Mock database
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    customer: { findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
    subscription: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    module: { findMany: vi.fn() },
    aiInsight: { create: vi.fn(), findMany: vi.fn() },
    aiDecision: { create: vi.fn(), findMany: vi.fn() }
  }
}))

import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const mockGetServerSession = getServerSession as Mock

// Helper to create authenticated request
function createAuthenticatedRequest(
  url: string,
  options: RequestInit = {},
  session = {
    user: {
      id: 'user-123',
      email: 'test@example.com',
      tenantId: 'tenant-123',
      role: 'user',
      permissions: ['read', 'write']
    }
  }
) {
  mockGetServerSession.mockResolvedValue(session)
  return new NextRequest(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  })
}

describe('API Routes Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Health Check Endpoints', () => {
    it('GET /api/health - should return health status', async () => {
      const { GET } = await import('@/app/api/health/route')
      const request = new NextRequest('http://localhost:3000/api/health')
      
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('status')
      expect(data).toHaveProperty('timestamp')
      expect(data).toHaveProperty('services')
    })

    it('GET /api/health/detailed - should return detailed health metrics', async () => {
      const { GET } = await import('@/app/api/health/detailed/route')
      const request = new NextRequest('http://localhost:3000/api/health/detailed')
      
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('services')
      expect(data).toHaveProperty('system')
      expect(data).toHaveProperty('performance')
    })
  })

  describe('Authentication Endpoints', () => {
    it('POST /api/auth/register - should create new user', async () => {
      const { POST } = await import('@/app/api/auth/register/route')
      
      prisma.user.findUnique.mockResolvedValue(null) // No existing user
      prisma.user.create.mockResolvedValue({
        id: 'new-user-123',
        email: 'newuser@example.com',
        name: 'New User'
      })

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'newuser@example.com',
          password: process.env.TEST_PASSWORD || 'test-password-123',
          name: 'New User'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toHaveProperty('message', 'User created successfully')
      expect(prisma.user.create).toHaveBeenCalled()
    })

    it('POST /api/auth/register - should reject duplicate email', async () => {
      const { POST } = await import('@/app/api/auth/register/route')
      
      prisma.user.findUnique.mockResolvedValue({
        id: 'existing-user',
        email: 'existing@example.com'
      })

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'existing@example.com',
          password: process.env.TEST_PASSWORD || 'test-password-123',
          name: 'Test User'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })
  })

  describe('Customer Management Endpoints', () => {
    it('GET /api/customers - should return customer list', async () => {
      const { GET } = await import('@/app/api/customers/route')
      
      prisma.customer.findMany.mockResolvedValue([
        { id: 'cust-1', name: 'Customer 1', tenantId: 'tenant-123' },
        { id: 'cust-2', name: 'Customer 2', tenantId: 'tenant-123' }
      ])

      const request = createAuthenticatedRequest('http://localhost:3000/api/customers')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.customers).toHaveLength(2)
      expect(prisma.customer.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-123' }
      })
    })

    it('POST /api/customers - should create new customer', async () => {
      const { POST } = await import('@/app/api/customers/route')
      
      prisma.customer.create.mockResolvedValue({
        id: 'new-cust-123',
        name: 'New Customer',
        email: 'customer@example.com',
        tenantId: 'tenant-123'
      })

      const request = createAuthenticatedRequest('http://localhost:3000/api/customers', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Customer',
          email: 'customer@example.com',
          phone: '+1234567890'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toHaveProperty('id', 'new-cust-123')
      expect(prisma.customer.create).toHaveBeenCalled()
    })

    it('PUT /api/customers/[id] - should update customer', async () => {
      const { PUT } = await import('@/app/api/customers/[id]/route')
      
      prisma.customer.update.mockResolvedValue({
        id: 'cust-123',
        name: 'Updated Customer',
        email: 'updated@example.com',
        tenantId: 'tenant-123'
      })

      const request = createAuthenticatedRequest('http://localhost:3000/api/customers/cust-123', {
        method: 'PUT',
        body: JSON.stringify({
          name: 'Updated Customer',
          email: 'updated@example.com'
        })
      })

      const response = await PUT(request, { params: { id: 'cust-123' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.name).toBe('Updated Customer')
    })
  })

  describe('Consciousness System Endpoints', () => {
    it('GET /api/consciousness/status - should return consciousness status', async () => {
      const { GET } = await import('@/app/api/consciousness/status/route')
      
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        tenantId: 'tenant-123',
        subscription: {
          tier: 'synaptic',
          modules: [
            { moduleId: 'crm', isActive: true },
            { moduleId: 'accounting', isActive: true }
          ]
        }
      })

      const request = createAuthenticatedRequest('http://localhost:3000/api/consciousness/status', {
        method: 'GET'
      }, {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          tenantId: 'tenant-123',
          role: 'user',
          permissions: ['consciousness:read']
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('consciousness')
      expect(data).toHaveProperty('modules')
      expect(data).toHaveProperty('intelligence')
    })

    it('GET /api/consciousness/insights - should return AI insights', async () => {
      const { GET } = await import('@/app/api/consciousness/insights/route')
      
      prisma.aiInsight.findMany.mockResolvedValue([
        {
          id: 'insight-1',
          type: 'pattern',
          description: 'Customer behavior pattern detected',
          confidence: 0.85
        }
      ])

      const request = createAuthenticatedRequest('http://localhost:3000/api/consciousness/insights')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.insights).toHaveLength(1)
      expect(data.insights[0]).toHaveProperty('confidence')
    })
  })

  describe('Subscription Management Endpoints', () => {
    it('GET /api/subscriptions/current - should return current subscription', async () => {
      const { GET } = await import('@/app/api/subscriptions/current/route')
      
      prisma.subscription.findUnique.mockResolvedValue({
        id: 'sub-123',
        tier: 'synaptic',
        status: 'active',
        modules: [{ moduleId: 'crm', isActive: true }]
      })

      const request = createAuthenticatedRequest('http://localhost:3000/api/subscriptions/current')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('tier', 'synaptic')
      expect(data).toHaveProperty('status', 'active')
    })

    it('POST /api/subscriptions/calculate - should calculate pricing', async () => {
      const { POST } = await import('@/app/api/subscriptions/calculate/route')
      
      const request = createAuthenticatedRequest('http://localhost:3000/api/subscriptions/calculate', {
        method: 'POST',
        body: JSON.stringify({
          tier: 'autonomous',
          modules: ['crm', 'accounting', 'hr', 'inventory'],
          users: 50
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('total')
      expect(data).toHaveProperty('breakdown')
    })
  })

  describe('AI Orchestration Endpoints', () => {
    it('POST /api/ai/orchestrate - should process AI request', async () => {
      const { POST } = await import('@/app/api/ai/orchestrate/route')
      
      const request = createAuthenticatedRequest('http://localhost:3000/api/ai/orchestrate', {
        method: 'POST',
        body: JSON.stringify({
          type: 'customer-analysis',
          data: { customerId: 'cust-123' }
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('result')
    })
  })

  describe('Rate Limiting and Security', () => {
    it('should enforce rate limits on API endpoints', async () => {
      const { GET } = await import('@/app/api/customers/route')
      
      // Simulate multiple requests
      const requests = Array(10).fill(null).map(() => 
        createAuthenticatedRequest('http://localhost:3000/api/customers')
      )

      const responses = await Promise.all(requests.map(req => GET(req)))
      
      // Check if rate limit headers are present
      const lastResponse = responses[responses.length - 1]
      expect(lastResponse.headers.get('X-RateLimit-Limit')).toBeDefined()
      expect(lastResponse.headers.get('X-RateLimit-Remaining')).toBeDefined()
    })

    it('should validate request payloads', async () => {
      const { POST } = await import('@/app/api/customers/route')
      
      const request = createAuthenticatedRequest('http://localhost:3000/api/customers', {
        method: 'POST',
        body: JSON.stringify({
          // Missing required fields
          phone: '123'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const { GET } = await import('@/app/api/customers/route')
      
      prisma.customer.findMany.mockRejectedValue(new Error('Database connection failed'))

      const request = createAuthenticatedRequest('http://localhost:3000/api/customers')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
      expect(data.error).not.toContain('Database connection failed') // Don't expose internal errors
    })

    it('should handle unauthorized access', async () => {
      const { GET } = await import('@/app/api/consciousness/status/route')
      
      mockGetServerSession.mockResolvedValue(null) // No session

      const request = new NextRequest('http://localhost:3000/api/consciousness/status')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toHaveProperty('error')
    })
  })

  describe('Webhook Endpoints', () => {
    it('POST /api/stripe/webhook - should process stripe webhooks', async () => {
      const { POST } = await import('@/app/api/stripe/webhook/route')
      
      const webhookPayload = {
        id: 'evt_123',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_123',
            amount: 5000,
            currency: 'usd'
          }
        }
      }

      const request = new NextRequest('http://localhost:3000/api/stripe/webhook', {
        method: 'POST',
        body: JSON.stringify(webhookPayload),
        headers: {
          'stripe-signature': 'test_signature'
        }
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
    })

    it('POST /api/voice/webhook - should process voice webhooks', async () => {
      const { POST } = await import('@/app/api/voice/webhook/route')
      
      const request = new NextRequest('http://localhost:3000/api/voice/webhook', {
        method: 'POST',
        body: JSON.stringify({
          CallSid: 'CA123',
          From: '+1234567890',
          To: '+0987654321'
        })
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
    })
  })
})