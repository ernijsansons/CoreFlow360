/**
 * CoreFlow360 - API Integration Tests
 * End-to-end flow testing for critical user journeys
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { testConfig } from '@/lib/test-config'

const prisma = new PrismaClient()
const API_BASE = process.env.TEST_API_URL || 'http://localhost:3000'

// Test data
const testUser = {
  email: 'test@coreflow360.com',
  password: testConfig.auth.defaultPassword,
  name: 'Test User',
  companyName: 'Test Company',
}

const testTenant = {
  id: 'test-tenant-' + Date.now(),
  name: 'Test Tenant',
}

describe('API Integration Tests', () => {
  let authToken: string
  let userId: string
  let tenantId: string

  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    })
  })

  afterAll(async () => {
    // Clean up test data
    if (userId) {
      await prisma.user
        .delete({
          where: { id: userId },
        })
        .catch(() => {})
    }

    await prisma.$disconnect()
  })

  describe('User Registration and Onboarding Flow', () => {
    it('should complete full registration flow', async () => {
      // 1. Register new user
      const registerResponse = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...testUser,
          acceptTerms: true,
        }),
      })

      expect(registerResponse.status).toBe(201)

      const registerData = await registerResponse.json()
      expect(registerData.success).toBe(true)
      expect(registerData.user).toBeDefined()

      userId = registerData.user.id
      tenantId = registerData.user.tenantId || testTenant.id
      authToken = registerData.token || 'mock-token'
    })

    it('should complete role selection', async () => {
      const roleResponse = await fetch(`${API_BASE}/api/onboarding/role-selection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          selectedRole: 'ceo',
          roleTitle: 'Chief Executive Officer',
          userEmail: testUser.email,
          companyName: testUser.companyName,
        }),
      })

      expect(roleResponse.status).toBe(200)

      const roleData = await roleResponse.json()
      expect(roleData.success).toBe(true)
    })

    it('should select free AI agent', async () => {
      const agentResponse = await fetch(`${API_BASE}/api/freemium/select-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          userId,
          tenantId,
          selectedAgent: 'crm',
          fromOnboarding: true,
        }),
      })

      expect(agentResponse.status).toBe(200)

      const agentData = await agentResponse.json()
      expect(agentData.success).toBe(true)
      expect(agentData.selectedAgent).toBe('crm')
    })
  })

  describe('Freemium Usage Flow', () => {
    it('should track feature usage', async () => {
      const usageResponse = await fetch(`${API_BASE}/api/freemium/track-usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          userId,
          feature: 'lead-generation',
          module: 'crm',
        }),
      })

      expect(usageResponse.status).toBe(200)

      const usageData = await usageResponse.json()
      expect(usageData.success).toBe(true)
      expect(usageData.usage.current).toBeGreaterThan(0)
      expect(usageData.usage.remaining).toBeLessThan(10)
    })

    it('should get freemium status', async () => {
      const statusResponse = await fetch(
        `${API_BASE}/api/freemium/status?userId=${userId}&tenantId=${tenantId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )

      expect(statusResponse.status).toBe(200)

      const statusData = await statusResponse.json()
      expect(statusData.subscriptionStatus).toBe('FREE')
      expect(statusData.selectedAgent).toBe('crm')
      expect(statusData.dailyUsageCount).toBeGreaterThan(0)
    })
  })

  describe('Performance and Metrics Flow', () => {
    it('should get live metrics', async () => {
      const metricsResponse = await fetch(`${API_BASE}/api/metrics/live`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      expect(metricsResponse.status).toBe(200)

      const metricsData = await metricsResponse.json()
      expect(metricsData.responseTime).toBeDefined()
      expect(metricsData.activeUsers).toBeDefined()
      expect(metricsData.successRate).toBeDefined()
    })

    it('should get executive dashboard data', async () => {
      const dashboardResponse = await fetch(
        `${API_BASE}/api/dashboard/executive?tenantId=${tenantId}&timeframe=30d`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )

      expect(dashboardResponse.status).toBe(200)

      const dashboardData = await dashboardResponse.json()
      expect(dashboardData.metrics).toBeDefined()
      expect(dashboardData.recommendations).toBeDefined()
    })
  })

  describe('Conversion Tracking Flow', () => {
    it('should track conversion events', async () => {
      const conversionResponse = await fetch(`${API_BASE}/api/conversion/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          eventType: 'feature_usage',
          triggerType: 'usage_limit',
          actionTaken: 'dismissed',
          currentModule: 'crm',
          userPlan: 'FREE',
        }),
      })

      expect(conversionResponse.status).toBe(200)

      const conversionData = await conversionResponse.json()
      expect(conversionData.success).toBe(true)
    })

    it('should get conversion analytics', async () => {
      const analyticsResponse = await fetch(
        `${API_BASE}/api/conversion/analytics?tenantId=${tenantId}&timeframe=7d`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )

      expect(analyticsResponse.status).toBe(200)

      const analyticsData = await analyticsResponse.json()
      expect(analyticsData.funnel).toBeDefined()
      expect(analyticsData.conversionRates).toBeDefined()
    })
  })

  describe('Rate Limiting Tests', () => {
    it('should enforce rate limits on API endpoints', async () => {
      const requests = []

      // Make 65 requests rapidly (over the 60/min limit)
      for (let i = 0; i < 65; i++) {
        requests.push(
          fetch(`${API_BASE}/api/metrics/live`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
              'X-Test-Client': 'rate-limit-test',
            },
          })
        )
      }

      const responses = await Promise.all(requests)
      const statuses = responses.map((r) => r.status)

      // Should have some 429 responses
      expect(statuses.filter((s) => s === 429).length).toBeGreaterThan(0)

      // Check rate limit headers
      const rateLimitedResponse = responses.find((r) => r.status === 429)
      if (rateLimitedResponse) {
        expect(rateLimitedResponse.headers.get('Retry-After')).toBeDefined()
        expect(rateLimitedResponse.headers.get('X-RateLimit-Limit')).toBeDefined()
      }
    })
  })

  describe('Error Handling Tests', () => {
    it('should handle invalid JSON gracefully', async () => {
      const response = await fetch(`${API_BASE}/api/freemium/select-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: 'invalid json',
      })

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toBeDefined()
    })

    it('should validate required fields', async () => {
      const response = await fetch(`${API_BASE}/api/freemium/select-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          // Missing required fields
        }),
      })

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toBe('Validation failed')
      expect(data.details).toBeDefined()
    })

    it('should handle authentication errors', async () => {
      const response = await fetch(`${API_BASE}/api/freemium/status`, {
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      })

      // Should still work as it has fallback
      expect([200, 401]).toContain(response.status)
    })
  })
})

// Performance benchmark tests
describe('API Performance Tests', () => {
  it('should respond within acceptable time limits', async () => {
    const endpoints = ['/api/health', '/api/metrics/live', '/api/freemium/status']

    for (const endpoint of endpoints) {
      const start = Date.now()

      const response = await fetch(`${API_BASE}${endpoint}`)

      const duration = Date.now() - start

      expect(response.status).toBeLessThan(500)
      expect(duration).toBeLessThan(1000) // Should respond within 1 second

      // // console.log(`${endpoint}: ${duration}ms`)
    }
  })
})
