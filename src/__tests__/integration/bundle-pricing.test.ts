/**
 * CoreFlow360 - Bundle Pricing Integration Tests
 * Mathematical perfection validation for pricing calculations
 * FORTRESS-LEVEL SECURITY: Validates pricing integrity
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { NextRequest } from 'next/server'
import { POST, GET } from '@/app/api/subscriptions/calculate/route'

describe('Bundle Pricing Calculator Integration Tests', () => {
  beforeAll(() => {
    // Setup test environment
    process.env.NODE_ENV = 'test'
  })

  describe('Basic Pricing Calculations', () => {
    it('calculates single bundle pricing correctly', async () => {
      const request = new NextRequest('http://localhost:3000/api/subscriptions/calculate', {
        method: 'POST',
        body: JSON.stringify({
          bundles: ['finance_ai_fingpt'],
          users: 5,
          annual: false,
          businessCount: 1,
          region: 'US',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.pricing.monthlyTotal).toBe(75) // 0 base + (15 * 5 users)
      expect(data.data.breakdown).toHaveLength(1)
      expect(data.data.breakdown[0].bundleId).toBe('finance_ai_fingpt')
    })

    it('applies multi-bundle compatibility discount', async () => {
      const request = new NextRequest('http://localhost:3000/api/subscriptions/calculate', {
        method: 'POST',
        body: JSON.stringify({
          bundles: ['finance_ai_fingpt', 'erp_advanced_idurar'],
          users: 5,
          annual: false,
          businessCount: 1,
          region: 'US',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)

      // FinGPT: 0 + (15 * 5) = 75
      // IDURAR: 15 + (10 * 5) = 65
      // Total: 140, with 5% compatibility discount = 133
      expect(data.data.pricing.monthlyTotal).toBe(133)
      expect(data.data.discounts.bundleCompatibilityDiscount).toBe(0.05)
    })

    it('applies volume discounts correctly', async () => {
      const request = new NextRequest('http://localhost:3000/api/subscriptions/calculate', {
        method: 'POST',
        body: JSON.stringify({
          bundles: ['finance_ai_fingpt'],
          users: 25, // Should trigger 10% volume discount
          annual: false,
          businessCount: 1,
          region: 'US',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)

      // Base calculation: 0 + (15 * 25) = 375
      // With 10% volume discount: 375 * 0.9 = 337.5
      expect(data.data.pricing.monthlyTotal).toBe(337.5)
      expect(data.data.discounts.volumeDiscount).toBe(0.1)
    })

    it('applies multi-business discounts', async () => {
      const request = new NextRequest('http://localhost:3000/api/subscriptions/calculate', {
        method: 'POST',
        body: JSON.stringify({
          bundles: ['finance_ai_fingpt'],
          users: 5,
          annual: false,
          businessCount: 3, // Should trigger 35% multi-business discount
          region: 'US',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)

      // Base: 75, with 35% multi-business discount
      expect(data.data.pricing.monthlyTotal).toBe(48.75)
      expect(data.data.discounts.multiBusinessDiscount).toBe(0.35)
    })

    it('applies annual discount', async () => {
      const request = new NextRequest('http://localhost:3000/api/subscriptions/calculate', {
        method: 'POST',
        body: JSON.stringify({
          bundles: ['finance_ai_fingpt'],
          users: 5,
          annual: true,
          businessCount: 1,
          region: 'US',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)

      // Base: 75, with 15% annual discount = 63.75
      expect(data.data.pricing.monthlyTotal).toBe(63.75)
      expect(data.data.discounts.annualDiscount).toBe(0.15)
    })
  })

  describe('Complex Pricing Scenarios', () => {
    it('calculates enterprise bundle with all discounts', async () => {
      const request = new NextRequest('http://localhost:3000/api/subscriptions/calculate', {
        method: 'POST',
        body: JSON.stringify({
          bundles: ['finance_ai_fingpt', 'finance_ai_finrobot', 'erpnext_hr_manufacturing'],
          users: 50, // Volume discount tier
          annual: true,
          businessCount: 5, // Max multi-business discount
          region: 'US',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.breakdown).toHaveLength(3)

      // Should have compound discounts:
      // - Bundle compatibility: 10% (3 bundles)
      // - Volume: 15% (50+ users)
      // - Multi-business: 50% (5+ businesses)
      // - Annual: 15%
      expect(data.data.discounts.bundleCompatibilityDiscount).toBe(0.1)
      expect(data.data.discounts.volumeDiscount).toBe(0.15)
      expect(data.data.discounts.multiBusinessDiscount).toBe(0.5)
      expect(data.data.discounts.annualDiscount).toBe(0.15)

      // Verify compound discount calculation
      const expectedTotalDiscount = 1 - (1 - 0.1) * (1 - 0.15) * (1 - 0.5) * (1 - 0.15)
      expect(data.data.discounts.totalDiscount).toBeCloseTo(expectedTotalDiscount, 4)
    })

    it('generates appropriate recommendations', async () => {
      const request = new NextRequest('http://localhost:3000/api/subscriptions/calculate', {
        method: 'POST',
        body: JSON.stringify({
          bundles: ['finance_ai_fingpt'],
          users: 8,
          annual: false,
          businessCount: 1,
          region: 'US',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      // Check that recommendations are provided
      expect(Array.isArray(data.data.recommendations)).toBe(true)
      expect(data.data.recommendations.length).toBeGreaterThan(0)

      // At least one recommendation should be about annual billing since annual=false
      const hasAnnualRec = data.data.recommendations.some((rec) => rec.includes('annual'))
      expect(hasAnnualRec).toBe(true)
    })
  })

  describe('Validation and Error Handling', () => {
    it('validates minimum user requirements', async () => {
      const request = new NextRequest('http://localhost:3000/api/subscriptions/calculate', {
        method: 'POST',
        body: JSON.stringify({
          bundles: ['erpnext_hr_manufacturing'], // Requires minimum 5 users
          users: 3,
          annual: false,
          businessCount: 1,
          region: 'US',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toContain('minimum 5 users')
    })

    it('validates bundle dependencies', async () => {
      const request = new NextRequest('http://localhost:3000/api/subscriptions/calculate', {
        method: 'POST',
        body: JSON.stringify({
          bundles: ['finance_ai_finrobot'], // Requires finance_ai_fingpt dependency
          users: 5,
          annual: false,
          businessCount: 1,
          region: 'US',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toContain('compatibility issues')
    })

    it('handles invalid input gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/subscriptions/calculate', {
        method: 'POST',
        body: JSON.stringify({
          bundles: [],
          users: -1,
          annual: 'not-a-boolean',
          region: 'INVALID',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid request parameters')
      expect(data.details).toBeDefined()
    })

    it('handles unknown bundle IDs', async () => {
      const request = new NextRequest('http://localhost:3000/api/subscriptions/calculate', {
        method: 'POST',
        body: JSON.stringify({
          bundles: ['unknown_bundle_id'],
          users: 5,
          annual: false,
          businessCount: 1,
          region: 'US',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Unknown bundle')
    })
  })

  describe('Performance and Caching', () => {
    it('calculates pricing within performance budget', async () => {
      const startTime = Date.now()

      const request = new NextRequest('http://localhost:3000/api/subscriptions/calculate', {
        method: 'POST',
        body: JSON.stringify({
          bundles: ['finance_ai_fingpt', 'finance_ai_finrobot', 'erp_advanced_idurar'],
          users: 100,
          annual: true,
          businessCount: 3,
          region: 'US',
        }),
      })

      const response = await POST(request)
      const endTime = Date.now()

      expect(response.status).toBe(200)
      expect(endTime - startTime).toBeLessThan(100) // Sub-100ms requirement
    })

    it('returns metadata with calculation details', async () => {
      const request = new NextRequest('http://localhost:3000/api/subscriptions/calculate', {
        method: 'POST',
        body: JSON.stringify({
          bundles: ['finance_ai_fingpt'],
          users: 5,
          annual: false,
          businessCount: 1,
          region: 'US',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.data.metadata).toBeDefined()
      expect(data.data.metadata.calculatedAt).toBeDefined()
      expect(data.data.metadata.validUntil).toBeDefined()
      expect(data.data.metadata.bundlesAnalyzed).toBe(1)
      expect(data.data.metadata.compatibilityScore).toBe(1.0)
    })
  })

  describe('Health Check', () => {
    it('returns health status', async () => {
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.status).toBe('healthy')
      expect(data.bundlesAvailable).toBe(5)
      expect(data.calculatorVersion).toBe('1.0.0')
    })
  })
})
