/**
 * CoreFlow360 - Freemium API Tests
 * Comprehensive test suite for freemium management endpoints
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST as selectAgent } from '@/lib/app/api/freemium/select-agent/route'
import { GET as getStatus } from '@/lib/app/api/freemium/status/route'
import { POST as trackUsage } from '@/lib/app/api/freemium/track-usage/route'
import { PrismaClient } from '@prisma/client'

// Mock Prisma
vi.mock('@prisma/client', () => {
  const mockPrismaClient = {
    freemiumUser: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    },
    subscription: {
      findFirst: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  }

  return {
    PrismaClient: vi.fn(() => mockPrismaClient),
  }
})

describe('Freemium API Tests', () => {
  let prisma: any

  beforeEach(() => {
    prisma = new PrismaClient()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('POST /api/freemium/select-agent', () => {
    it('should allow first-time agent selection', async () => {
      // Mock no existing freemium user
      prisma.freemiumUser.findUnique.mockResolvedValue(null)

      // Mock successful creation
      prisma.freemiumUser.create.mockResolvedValue({
        id: 'freemium-1',
        userId: 'user-1',
        tenantId: 'tenant-1',
        selectedAgent: 'crm',
        dailyUsageCount: 0,
        dailyLimit: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const request = new NextRequest('http://localhost:3000/api/freemium/select-agent', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user-1',
          tenantId: 'tenant-1',
          selectedAgent: 'crm',
          fromOnboarding: true,
        }),
      })

      const response = await selectAgent(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.selectedAgent).toBe('crm')
      expect(data.isFirstSelection).toBe(true)
      expect(prisma.freemiumUser.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          selectedAgent: 'crm',
        }),
      })
    })

    it('should update existing agent selection', async () => {
      // Mock existing freemium user
      prisma.freemiumUser.findUnique.mockResolvedValue({
        id: 'freemium-1',
        userId: 'user-1',
        selectedAgent: 'crm',
        dailyUsageCount: 5,
      })

      // Mock successful update
      prisma.freemiumUser.update.mockResolvedValue({
        id: 'freemium-1',
        userId: 'user-1',
        selectedAgent: 'sales',
        dailyUsageCount: 5,
      })

      const request = new NextRequest('http://localhost:3000/api/freemium/select-agent', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user-1',
          tenantId: 'tenant-1',
          selectedAgent: 'sales',
        }),
      })

      const response = await selectAgent(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.selectedAgent).toBe('sales')
      expect(data.isFirstSelection).toBe(false)
    })

    it('should validate agent type', async () => {
      const request = new NextRequest('http://localhost:3000/api/freemium/select-agent', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user-1',
          tenantId: 'tenant-1',
          selectedAgent: 'invalid-agent',
        }),
      })

      const response = await selectAgent(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBeDefined()
      expect(data.details).toBeDefined()
    })
  })

  describe('GET /api/freemium/status', () => {
    it('should return free user status', async () => {
      // Mock freemium user
      prisma.freemiumUser.findFirst.mockResolvedValue({
        id: 'freemium-1',
        userId: 'user-1',
        selectedAgent: 'crm',
        dailyUsageCount: 3,
        dailyLimit: 10,
        lastActiveAt: new Date(),
      })

      // Mock no paid subscription
      prisma.subscription.findFirst.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/freemium/status?userId=user-1')
      const response = await getStatus(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.subscriptionStatus).toBe('FREE')
      expect(data.selectedAgent).toBe('crm')
      expect(data.dailyUsageCount).toBe(3)
      expect(data.dailyLimit).toBe(10)
      expect(data.canUseFeature).toBe(true)
    })

    it('should return paid user status', async () => {
      // Mock paid subscription
      prisma.subscription.findFirst.mockResolvedValue({
        id: 'sub-1',
        userId: 'user-1',
        status: 'BUSINESS',
        activeModules: ['crm', 'sales', 'finance', 'operations'],
      })

      const request = new NextRequest('http://localhost:3000/api/freemium/status?userId=user-1')
      const response = await getStatus(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.subscriptionStatus).toBe('BUSINESS')
      expect(data.activeModules).toEqual(['crm', 'sales', 'finance', 'operations'])
      expect(data.canUseFeature).toBe(true)
    })

    it('should handle new users without selection', async () => {
      // Mock no freemium user
      prisma.freemiumUser.findFirst.mockResolvedValue(null)

      // Mock no subscription
      prisma.subscription.findFirst.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/freemium/status?userId=user-1')
      const response = await getStatus(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.subscriptionStatus).toBe('FREE')
      expect(data.selectedAgent).toBeNull()
      expect(data.needsAgentSelection).toBe(true)
    })
  })

  describe('POST /api/freemium/track-usage', () => {
    it('should track usage for free users', async () => {
      // Mock freemium user
      prisma.freemiumUser.findUnique.mockResolvedValue({
        id: 'freemium-1',
        userId: 'user-1',
        selectedAgent: 'crm',
        dailyUsageCount: 5,
        dailyLimit: 10,
        lastUsageReset: new Date(),
      })

      // Mock update
      prisma.freemiumUser.update.mockResolvedValue({
        id: 'freemium-1',
        dailyUsageCount: 6,
        dailyLimit: 10,
      })

      const request = new NextRequest('http://localhost:3000/api/freemium/track-usage', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user-1',
          feature: 'lead-generation',
          module: 'crm',
        }),
      })

      const response = await trackUsage(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.usage.current).toBe(6)
      expect(data.usage.limit).toBe(10)
      expect(data.usage.remaining).toBe(4)
    })

    it('should enforce daily limits', async () => {
      // Mock user at limit
      prisma.freemiumUser.findUnique.mockResolvedValue({
        id: 'freemium-1',
        userId: 'user-1',
        selectedAgent: 'crm',
        dailyUsageCount: 10,
        dailyLimit: 10,
        lastUsageReset: new Date(),
      })

      const request = new NextRequest('http://localhost:3000/api/freemium/track-usage', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user-1',
          feature: 'lead-generation',
          module: 'crm',
        }),
      })

      const response = await trackUsage(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.error).toBe('Daily usage limit exceeded')
      expect(data.shouldUpgrade).toBe(true)
    })

    it('should reset daily counts after 24 hours', async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      // Mock user with old usage
      prisma.freemiumUser.findUnique.mockResolvedValue({
        id: 'freemium-1',
        userId: 'user-1',
        selectedAgent: 'crm',
        dailyUsageCount: 10,
        dailyLimit: 10,
        lastUsageReset: yesterday,
      })

      // Mock update with reset
      prisma.freemiumUser.update.mockResolvedValue({
        id: 'freemium-1',
        dailyUsageCount: 1,
        dailyLimit: 10,
        lastUsageReset: new Date(),
      })

      const request = new NextRequest('http://localhost:3000/api/freemium/track-usage', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user-1',
          feature: 'lead-generation',
          module: 'crm',
        }),
      })

      const response = await trackUsage(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.usage.current).toBe(1)
      expect(data.usage.wasReset).toBe(true)
    })
  })
})
