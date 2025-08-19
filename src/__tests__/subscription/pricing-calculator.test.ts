/**
 * CoreFlow360 - Pricing Calculator Test Suite
 * Tests pricing calculations for all module and bundle combinations
 */

import { describe, it, expect } from 'vitest'

describe('Pricing Calculator Test Suite', () => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  describe('Individual Module Pricing', () => {
    const testCases = [
      { modules: ['crm'], userCount: 10, expectedMonthly: 70 },
      { modules: ['accounting'], userCount: 10, expectedMonthly: 80 },
      { modules: ['hr'], userCount: 10, expectedMonthly: 90 },
      { modules: ['inventory'], userCount: 10, expectedMonthly: 100 },
      { modules: ['projects'], userCount: 10, expectedMonthly: 110 },
      { modules: ['marketing'], userCount: 10, expectedMonthly: 120 },
    ]

    testCases.forEach(({ modules, userCount, expectedMonthly }) => {
      it(`should calculate correct price for ${modules[0]} with ${userCount} users`, async () => {
        const response = await fetch(`${API_BASE_URL}/api/pricing/calculate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            modules,
            userCount,
            billingCycle: 'monthly',
            applyBundleDiscounts: false,
          }),
        })

        const pricing = await response.json()

        expect(pricing.totalMonthlyPrice).toBe(expectedMonthly)
        expect(pricing.breakdown).toHaveLength(1)
        expect(pricing.breakdown[0].moduleKey).toBe(modules[0])
      })
    })
  })

  describe('Multiple Module Pricing', () => {
    it('should calculate correct price for multiple modules', async () => {
      const response = await fetch(`${API_BASE_URL}/api/pricing/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modules: ['crm', 'accounting'],
          userCount: 10,
          billingCycle: 'monthly',
          applyBundleDiscounts: true,
        }),
      })

      const pricing = await response.json()

      // Should match starter bundle price (120)
      expect(pricing.totalMonthlyPrice).toBe(120)
      expect(pricing.discounts).toBeDefined()
      expect(pricing.discounts.length).toBeGreaterThan(0)
    })

    it('should apply volume discounts for large user counts', async () => {
      const response = await fetch(`${API_BASE_URL}/api/pricing/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modules: ['crm'],
          userCount: 100,
          billingCycle: 'monthly',
          applyBundleDiscounts: false,
        }),
      })

      const pricing = await response.json()

      // Should be less than linear scaling (100 * 7 = 700)
      expect(pricing.totalMonthlyPrice).toBeLessThan(700)
      expect(pricing.discounts).toBeDefined()
      expect(pricing.discounts.some((d: any) => d.type === 'volume')).toBe(true)
    })
  })

  describe('Bundle Pricing', () => {
    const bundles = [
      { key: 'starter', modules: ['crm', 'accounting'], expectedPrice: 120 },
      { key: 'professional', modules: ['crm', 'accounting', 'hr', 'projects'], expectedPrice: 300 },
      {
        key: 'enterprise',
        modules: ['crm', 'accounting', 'hr', 'inventory', 'projects', 'marketing'],
        expectedPrice: 450,
      },
    ]

    bundles.forEach(({ key, modules, expectedPrice }) => {
      it(`should apply ${key} bundle pricing correctly`, async () => {
        const response = await fetch(`${API_BASE_URL}/api/pricing/calculate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            modules,
            userCount: 10,
            billingCycle: 'monthly',
            applyBundleDiscounts: true,
          }),
        })

        const pricing = await response.json()

        expect(pricing.totalMonthlyPrice).toBe(expectedPrice)
        expect(pricing.appliedBundle).toBe(key)
      })
    })
  })

  describe('Annual Billing Discount', () => {
    it('should apply 10% discount for annual billing', async () => {
      const response = await fetch(`${API_BASE_URL}/api/pricing/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modules: ['crm'],
          userCount: 10,
          billingCycle: 'annual',
          applyBundleDiscounts: false,
        }),
      })

      const pricing = await response.json()

      const monthlyTotal = 70
      const expectedAnnual = monthlyTotal * 12 * 0.9 // 10% discount

      expect(pricing.totalAnnualPrice).toBe(expectedAnnual)
      expect(pricing.billingDetails.annualDiscount).toBe(monthlyTotal * 12 * 0.1)
    })
  })

  describe('Setup Fees', () => {
    it('should include setup fees when requested', async () => {
      const response = await fetch(`${API_BASE_URL}/api/pricing/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modules: ['projects'], // Has $500 setup fee
          userCount: 10,
          billingCycle: 'monthly',
          includeSetupFees: true,
        }),
      })

      const pricing = await response.json()

      expect(pricing.billingDetails.setupFeesTotal).toBe(500)
      expect(pricing.billingDetails.totalFirstMonth).toBe(110 + 500)
    })

    it('should not include setup fees when not requested', async () => {
      const response = await fetch(`${API_BASE_URL}/api/pricing/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modules: ['projects'],
          userCount: 10,
          billingCycle: 'monthly',
          includeSetupFees: false,
        }),
      })

      const pricing = await response.json()

      expect(pricing.billingDetails.setupFeesTotal).toBe(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty module list', async () => {
      const response = await fetch(`${API_BASE_URL}/api/pricing/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modules: [],
          userCount: 10,
          billingCycle: 'monthly',
        }),
      })

      expect(response.status).toBe(400)
    })

    it('should handle invalid module names', async () => {
      const response = await fetch(`${API_BASE_URL}/api/pricing/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modules: ['invalid-module'],
          userCount: 10,
          billingCycle: 'monthly',
        }),
      })

      const pricing = await response.json()

      expect(pricing.error).toBeDefined()
    })

    it('should handle very large user counts', async () => {
      const response = await fetch(`${API_BASE_URL}/api/pricing/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modules: ['crm'],
          userCount: 10000,
          billingCycle: 'monthly',
        }),
      })

      const pricing = await response.json()

      expect(pricing.totalMonthlyPrice).toBeGreaterThan(0)
      expect(pricing.totalMonthlyPrice).toBeLessThan(70000) // Should have significant volume discount
    })

    it('should handle minimum user count', async () => {
      const response = await fetch(`${API_BASE_URL}/api/pricing/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modules: ['crm'],
          userCount: 1,
          billingCycle: 'monthly',
        }),
      })

      const pricing = await response.json()

      expect(pricing.totalMonthlyPrice).toBe(7)
    })
  })

  describe('Quote Generation', () => {
    it('should generate a quote with all details', async () => {
      const response = await fetch(`${API_BASE_URL}/api/pricing/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modules: ['crm', 'accounting'],
          userCount: 25,
          billingCycle: 'annual',
          customerInfo: {
            company: 'Test Company',
            email: 'test@example.com',
            name: 'Test User',
          },
        }),
      })

      const quote = await response.json()

      expect(quote.quoteNumber).toBeDefined()
      expect(quote.validUntil).toBeDefined()
      expect(quote.pricing).toBeDefined()
      expect(quote.customerInfo.company).toBe('Test Company')
    })
  })
})
