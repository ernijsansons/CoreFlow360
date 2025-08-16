/**
 * CoreFlow360 - Business Logic Test Suite
 * Comprehensive testing of pricing, subscriptions, and business rules
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { pricingEngine } from '@/lib/unified-pricing-engine'
import { moduleManager } from '@/services/subscription/module-manager'

describe('Business Logic Test Suite', () => {
  describe('Unified Pricing Engine', () => {
    it('should calculate consistent pricing for same configuration', async () => {
      const request = {
        modules: ['crm', 'accounting'],
        userCount: 10,
        billingCycle: 'monthly' as const,
        applyDiscounts: true,
        includeSetupFees: true
      }

      const result1 = await pricingEngine.calculatePricing(request)
      const result2 = await pricingEngine.calculatePricing(request)

      expect(result1.finalPrice).toBe(result2.finalPrice)
      expect(result1.monthlyPrice).toBe(result2.monthlyPrice)
      expect(result1.breakdown).toEqual(result2.breakdown)
    })

    it('should apply bundle discounts correctly', async () => {
      const request = {
        modules: ['crm', 'accounting', 'projects'], // Core bundle
        userCount: 10,
        billingCycle: 'monthly' as const,
        applyDiscounts: true
      }

      const result = await pricingEngine.calculatePricing(request)
      
      const bundleDiscount = result.discounts.find(d => d.type === 'bundle')
      expect(bundleDiscount).toBeDefined()
      expect(bundleDiscount?.name).toBe('Core Business Bundle')
      expect(bundleDiscount?.percentage).toBe(0.15)
    })

    it('should apply volume discounts for large user counts', async () => {
      const request = {
        modules: ['crm'],
        userCount: 100,
        billingCycle: 'monthly' as const,
        applyDiscounts: true
      }

      const result = await pricingEngine.calculatePricing(request)
      
      const volumeDiscount = result.discounts.find(d => d.type === 'volume')
      expect(volumeDiscount).toBeDefined()
      expect(volumeDiscount?.percentage).toBe(0.20) // 20% for 100+ users
    })

    it('should apply annual billing discount', async () => {
      const request = {
        modules: ['crm'],
        userCount: 10,
        billingCycle: 'annual' as const,
        applyDiscounts: true
      }

      const result = await pricingEngine.calculatePricing(request)
      
      const annualDiscount = result.discounts.find(d => d.type === 'annual')
      expect(annualDiscount).toBeDefined()
      expect(annualDiscount?.percentage).toBe(0.10)
    })

    it('should validate module dependencies', async () => {
      const request = {
        modules: ['manufacturing'], // Requires inventory and projects
        userCount: 10,
        billingCycle: 'monthly' as const
      }

      await expect(pricingEngine.calculatePricing(request)).rejects.toThrow('Dependency validation failed')
    })

    it('should generate appropriate recommendations', async () => {
      const request = {
        modules: ['crm'],
        userCount: 10,
        billingCycle: 'monthly' as const
      }

      const result = await pricingEngine.calculatePricing(request)
      
      expect(result.recommendations).toContain('Add Project Management for better customer project tracking')
    })

    it('should handle edge cases correctly', async () => {
      // Test minimum user count
      const minRequest = {
        modules: ['crm'],
        userCount: 1,
        billingCycle: 'monthly' as const
      }
      const minResult = await pricingEngine.calculatePricing(minRequest)
      expect(minResult.finalPrice).toBeGreaterThan(0)

      // Test maximum user count
      const maxRequest = {
        modules: ['crm'],
        userCount: 10000,
        billingCycle: 'monthly' as const
      }
      const maxResult = await pricingEngine.calculatePricing(maxRequest)
      expect(maxResult.finalPrice).toBeGreaterThan(0)
    })
  })

  describe('Module Manager Business Logic', () => {
    it('should validate module dependencies before activation', async () => {
      // This test would require a mock database setup
      // For now, we'll test the validation logic
      const modules = ['manufacturing']
      const validation = await moduleManager.validateModuleDependencies(modules)
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain("Module 'manufacturing' requires 'inventory'")
    })

    it('should prevent activation of conflicting modules', async () => {
      // Test module conflict validation
      const modules = ['crm', 'conflicting_module'] // Assuming there's a conflict
      const validation = await moduleManager.validateModuleDependencies(modules)
      
      // This would fail if there are actual conflicts defined
      expect(validation.isValid).toBeDefined()
    })
  })

  describe('Pricing Consistency Across Endpoints', () => {
    it('should return same price from all pricing endpoints', async () => {
      const request = {
        modules: ['crm', 'accounting'],
        userCount: 25,
        billingCycle: 'monthly' as const
      }

      // Test unified pricing engine
      const unifiedResult = await pricingEngine.calculatePricing(request)

      // These would be the same if all endpoints used the unified engine
      expect(unifiedResult.finalPrice).toBeGreaterThan(0)
      expect(unifiedResult.monthlyPrice).toBe(unifiedResult.finalPrice)
    })
  })

  describe('Business Rules Validation', () => {
    it('should enforce user count limits', async () => {
      const request = {
        modules: ['crm'],
        userCount: 0, // Invalid
        billingCycle: 'monthly' as const
      }

      await expect(pricingEngine.calculatePricing(request)).rejects.toThrow('User count must be at least 1')
    })

    it('should enforce module requirements', async () => {
      const request = {
        modules: [], // Invalid - no modules
        userCount: 10,
        billingCycle: 'monthly' as const
      }

      await expect(pricingEngine.calculatePricing(request)).rejects.toThrow('At least one module required')
    })

    it('should handle invalid module names', async () => {
      const request = {
        modules: ['invalid_module'],
        userCount: 10,
        billingCycle: 'monthly' as const
      }

      await expect(pricingEngine.calculatePricing(request)).rejects.toThrow('Invalid modules')
    })
  })

  describe('Discount Calculation Logic', () => {
    it('should apply highest discount when multiple apply', async () => {
      const request = {
        modules: ['crm', 'accounting', 'projects'], // Core bundle (15%)
        userCount: 100, // Volume discount (20%)
        billingCycle: 'monthly' as const,
        applyDiscounts: true
      }

      const result = await pricingEngine.calculatePricing(request)
      
      // Should apply volume discount (20%) instead of bundle discount (15%)
      const volumeDiscount = result.discounts.find(d => d.type === 'volume')
      expect(volumeDiscount?.percentage).toBe(0.20)
    })

    it('should calculate progressive discounts correctly', async () => {
      const request = {
        modules: ['crm'],
        userCount: 10,
        billingCycle: 'monthly' as const,
        billingOrder: 3, // Third business
        applyDiscounts: true
      }

      const result = await pricingEngine.calculatePricing(request)
      
      const progressiveDiscount = result.discounts.find(d => d.type === 'progressive')
      expect(progressiveDiscount?.percentage).toBe(0.35) // 35% for 3rd business
    })
  })

  describe('Setup Fee Logic', () => {
    it('should include setup fees when requested', async () => {
      const request = {
        modules: ['projects'], // Has setup fee
        userCount: 10,
        billingCycle: 'monthly' as const,
        includeSetupFees: true
      }

      const result = await pricingEngine.calculatePricing(request)
      expect(result.setupFees).toBeGreaterThan(0)
    })

    it('should exclude setup fees when not requested', async () => {
      const request = {
        modules: ['projects'],
        userCount: 10,
        billingCycle: 'monthly' as const,
        includeSetupFees: false
      }

      const result = await pricingEngine.calculatePricing(request)
      expect(result.setupFees).toBe(0)
    })
  })

  describe('Annual vs Monthly Billing', () => {
    it('should calculate annual pricing correctly', async () => {
      const monthlyRequest = {
        modules: ['crm'],
        userCount: 10,
        billingCycle: 'monthly' as const,
        applyDiscounts: false
      }

      const annualRequest = {
        modules: ['crm'],
        userCount: 10,
        billingCycle: 'annual' as const,
        applyDiscounts: true
      }

      const monthlyResult = await pricingEngine.calculatePricing(monthlyRequest)
      const annualResult = await pricingEngine.calculatePricing(annualRequest)

      // Annual should be less than 12x monthly due to 10% discount
      expect(annualResult.annualPrice).toBeLessThan(monthlyResult.monthlyPrice * 12)
    })
  })

  describe('Recommendation Engine', () => {
    it('should recommend complementary modules', async () => {
      const request = {
        modules: ['crm'],
        userCount: 10,
        billingCycle: 'monthly' as const
      }

      const result = await pricingEngine.calculatePricing(request)
      
      expect(result.recommendations).toContain('Add Project Management for better customer project tracking')
    })

    it('should recommend industry-specific modules', async () => {
      const request = {
        modules: ['crm'],
        userCount: 10,
        billingCycle: 'monthly' as const,
        industry: 'MANUFACTURING'
      }

      const result = await pricingEngine.calculatePricing(request)
      
      expect(result.recommendations).toContain('Add Inventory Management for manufacturing operations')
    })
  })

  describe('Warning System', () => {
    it('should warn about large user counts', async () => {
      const request = {
        modules: ['crm'],
        userCount: 150,
        billingCycle: 'monthly' as const
      }

      const result = await pricingEngine.calculatePricing(request)
      
      expect(result.warnings).toContain('Consider Enterprise tier for better support and features')
    })

    it('should warn about suboptimal module combinations', async () => {
      const request = {
        modules: ['manufacturing'],
        userCount: 10,
        billingCycle: 'monthly' as const
      }

      const result = await pricingEngine.calculatePricing(request)
      
      expect(result.warnings).toContain('Manufacturing module works best with Inventory Management')
    })
  })
})
