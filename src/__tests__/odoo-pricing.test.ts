/**
 * CoreFlow360 - Odoo-Style Pricing Test Suite
 * Comprehensive testing of Odoo-style pricing engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { odooPricingEngine } from '@/lib/odoo-style-pricing-engine'

describe('Odoo-Style Pricing Engine', () => {
  describe('Basic Pricing Calculations', () => {
    it('should calculate standard pricing correctly', async () => {
      const request = {
        modules: ['crm', 'accounting'],
        userCount: 10,
        billingCycle: 'monthly' as const,
        pricingModel: 'standard' as const,
        contractType: 'subscription' as const,
        deploymentType: 'cloud' as const,
        supportLevel: 'standard' as const
      }

      const result = await odooPricingEngine.calculateOdooPricing(request)

      expect(result.basePrice).toBeGreaterThan(0)
      expect(result.netPrice).toBeGreaterThan(0)
      expect(result.modulePricing).toHaveLength(2)
      expect(result.pricingModel).toBe('standard')
      expect(result.contractType).toBe('subscription')
    })

    it('should calculate enterprise pricing correctly', async () => {
      const request = {
        modules: ['crm', 'accounting', 'hr', 'inventory'],
        userCount: 100,
        billingCycle: 'annual' as const,
        pricingModel: 'enterprise' as const,
        contractType: 'subscription' as const,
        deploymentType: 'cloud' as const,
        supportLevel: 'enterprise' as const
      }

      const result = await odooPricingEngine.calculateOdooPricing(request)

      expect(result.basePrice).toBeGreaterThan(0)
      expect(result.netPrice).toBeGreaterThan(0)
      expect(result.modulePricing).toHaveLength(4)
      expect(result.pricingModel).toBe('enterprise')
      expect(result.features.enterprise).toContain('Advanced analytics')
    })
  })

  describe('Volume Discounts', () => {
    it('should apply volume discounts for large user counts', async () => {
      const request = {
        modules: ['crm'],
        userCount: 100,
        billingCycle: 'monthly' as const,
        pricingModel: 'standard' as const
      }

      const result = await odooPricingEngine.calculateOdooPricing(request)
      
      const volumeDiscount = result.discounts.find(d => d.type === 'volume')
      expect(volumeDiscount).toBeDefined()
      expect(volumeDiscount?.percentage).toBe(0.20) // 20% for 100+ users
      expect(volumeDiscount?.amount).toBeGreaterThan(0)
    })

    it('should apply maximum volume discount for 250+ users', async () => {
      const request = {
        modules: ['crm'],
        userCount: 300,
        billingCycle: 'monthly' as const,
        pricingModel: 'standard' as const
      }

      const result = await odooPricingEngine.calculateOdooPricing(request)
      
      const volumeDiscount = result.discounts.find(d => d.type === 'volume')
      expect(volumeDiscount?.percentage).toBe(0.25) // 25% for 250+ users
    })

    it('should not apply volume discount for small user counts', async () => {
      const request = {
        modules: ['crm'],
        userCount: 5,
        billingCycle: 'monthly' as const,
        pricingModel: 'standard' as const
      }

      const result = await odooPricingEngine.calculateOdooPricing(request)
      
      const volumeDiscount = result.discounts.find(d => d.type === 'volume')
      expect(volumeDiscount).toBeUndefined()
    })
  })

  describe('Commitment Discounts', () => {
    it('should apply commitment discount for 12+ months', async () => {
      const request = {
        modules: ['crm'],
        userCount: 10,
        billingCycle: 'monthly' as const,
        pricingModel: 'standard' as const,
        commitmentPeriod: 12
      }

      const result = await odooPricingEngine.calculateOdooPricing(request)
      
      const commitmentDiscount = result.discounts.find(d => d.type === 'commitment')
      expect(commitmentDiscount).toBeDefined()
      expect(commitmentDiscount?.percentage).toBe(0.15) // 15% for 12+ months
    })

    it('should apply maximum commitment discount for 36+ months', async () => {
      const request = {
        modules: ['crm'],
        userCount: 10,
        billingCycle: 'monthly' as const,
        pricingModel: 'standard' as const,
        commitmentPeriod: 48
      }

      const result = await odooPricingEngine.calculateOdooPricing(request)
      
      const commitmentDiscount = result.discounts.find(d => d.type === 'commitment')
      expect(commitmentDiscount?.percentage).toBe(0.25) // 25% for 36+ months
    })
  })

  describe('Billing Cycle Discounts', () => {
    it('should apply annual billing discount', async () => {
      const request = {
        modules: ['crm'],
        userCount: 10,
        billingCycle: 'annual' as const,
        pricingModel: 'standard' as const
      }

      const result = await odooPricingEngine.calculateOdooPricing(request)
      
      const billingDiscount = result.discounts.find(d => d.name.includes('Annual'))
      expect(billingDiscount).toBeDefined()
      expect(billingDiscount?.percentage).toBe(0.15) // 15% for annual billing
    })

    it('should apply quarterly billing discount', async () => {
      const request = {
        modules: ['crm'],
        userCount: 10,
        billingCycle: 'quarterly' as const,
        pricingModel: 'standard' as const
      }

      const result = await odooPricingEngine.calculateOdooPricing(request)
      
      const billingDiscount = result.discounts.find(d => d.name.includes('Quarterly'))
      expect(billingDiscount).toBeDefined()
      expect(billingDiscount?.percentage).toBe(0.05) // 5% for quarterly billing
    })
  })

  describe('Special Discounts', () => {
    it('should apply partner discount', async () => {
      const request = {
        modules: ['crm'],
        userCount: 10,
        billingCycle: 'monthly' as const,
        pricingModel: 'standard' as const,
        partnerDiscount: 0.15
      }

      const result = await odooPricingEngine.calculateOdooPricing(request)
      
      const partnerDiscount = result.discounts.find(d => d.type === 'partner')
      expect(partnerDiscount).toBeDefined()
      expect(partnerDiscount?.percentage).toBe(0.15)
    })

    it('should apply early adopter discount', async () => {
      const request = {
        modules: ['crm'],
        userCount: 10,
        billingCycle: 'monthly' as const,
        pricingModel: 'standard' as const,
        earlyAdopterDiscount: true
      }

      const result = await odooPricingEngine.calculateOdooPricing(request)
      
      const earlyAdopterDiscount = result.discounts.find(d => d.type === 'early_adopter')
      expect(earlyAdopterDiscount).toBeDefined()
      expect(earlyAdopterDiscount?.percentage).toBe(0.15)
    })

    it('should apply loyalty discount', async () => {
      const request = {
        modules: ['crm'],
        userCount: 10,
        billingCycle: 'monthly' as const,
        pricingModel: 'standard' as const,
        loyaltyDiscount: 0.10
      }

      const result = await odooPricingEngine.calculateOdooPricing(request)
      
      const loyaltyDiscount = result.discounts.find(d => d.type === 'loyalty')
      expect(loyaltyDiscount).toBeDefined()
      expect(loyaltyDiscount?.percentage).toBe(0.10)
    })
  })

  describe('Service Pricing', () => {
    it('should include implementation services when requested', async () => {
      const request = {
        modules: ['crm'],
        userCount: 50,
        billingCycle: 'monthly' as const,
        pricingModel: 'standard' as const,
        implementationServices: true
      }

      const result = await odooPricingEngine.calculateOdooPricing(request)
      
      const implementationService = result.servicePricing.find(s => s.serviceType === 'implementation')
      expect(implementationService).toBeDefined()
      expect(implementationService?.price).toBe(15000) // For 50 users
    })

    it('should calculate support fees correctly', async () => {
      const request = {
        modules: ['crm'],
        userCount: 20,
        billingCycle: 'monthly' as const,
        pricingModel: 'standard' as const,
        supportLevel: 'premium' as const
      }

      const result = await odooPricingEngine.calculateOdooPricing(request)
      
      const supportService = result.servicePricing.find(s => s.serviceType === 'support')
      expect(supportService).toBeDefined()
      expect(supportService?.price).toBe(400) // 20 users * 10 * 2 (premium multiplier)
    })
  })

  describe('Billing Breakdown', () => {
    it('should calculate taxes correctly', async () => {
      const request = {
        modules: ['crm'],
        userCount: 10,
        billingCycle: 'monthly' as const,
        pricingModel: 'standard' as const,
        region: 'US'
      }

      const result = await odooPricingEngine.calculateOdooPricing(request)
      
      expect(result.billingBreakdown.taxes).toBeGreaterThan(0)
      expect(result.billingBreakdown.total).toBeGreaterThan(result.billingBreakdown.subtotal)
    })

    it('should generate payment schedule correctly', async () => {
      const request = {
        modules: ['crm'],
        userCount: 10,
        billingCycle: 'quarterly' as const,
        pricingModel: 'standard' as const
      }

      const result = await odooPricingEngine.calculateOdooPricing(request)
      
      expect(result.paymentSchedule).toHaveLength(4) // 4 quarters
      expect(result.paymentSchedule[0].period).toBe('Q1')
    })
  })

  describe('Feature Breakdown', () => {
    it('should include enterprise features for enterprise pricing', async () => {
      const request = {
        modules: ['crm'],
        userCount: 10,
        billingCycle: 'monthly' as const,
        pricingModel: 'enterprise' as const
      }

      const result = await odooPricingEngine.calculateOdooPricing(request)
      
      expect(result.features.enterprise).toContain('Advanced analytics')
      expect(result.features.enterprise).toContain('Custom integrations')
      expect(result.features.enterprise).toContain('White-label options')
    })

    it('should not include enterprise features for standard pricing', async () => {
      const request = {
        modules: ['crm'],
        userCount: 10,
        billingCycle: 'monthly' as const,
        pricingModel: 'standard' as const
      }

      const result = await odooPricingEngine.calculateOdooPricing(request)
      
      expect(result.features.enterprise).toHaveLength(0)
    })
  })

  describe('Limitations and Recommendations', () => {
    it('should generate limitations for large user counts on standard pricing', async () => {
      const request = {
        modules: ['crm'],
        userCount: 150,
        billingCycle: 'monthly' as const,
        pricingModel: 'standard' as const
      }

      const result = await odooPricingEngine.calculateOdooPricing(request)
      
      const userLimitation = result.limitations.find(l => l.type === 'users')
      expect(userLimitation).toBeDefined()
      expect(userLimitation?.current).toBe(150)
      expect(userLimitation?.limit).toBe(100)
    })

    it('should generate cost-saving recommendations', async () => {
      const request = {
        modules: ['crm'],
        userCount: 10,
        billingCycle: 'monthly' as const,
        pricingModel: 'standard' as const
      }

      const result = await odooPricingEngine.calculateOdooPricing(request)
      
      const costSavingRecommendation = result.recommendations.find(r => r.type === 'cost_saving')
      expect(costSavingRecommendation).toBeDefined()
      expect(costSavingRecommendation?.title).toContain('Annual Billing')
    })
  })

  describe('ROI and TCO Calculations', () => {
    it('should calculate ROI correctly', async () => {
      const request = {
        modules: ['crm', 'accounting'],
        userCount: 25,
        billingCycle: 'annual' as const,
        pricingModel: 'standard' as const,
        implementationServices: true
      }

      const result = await odooPricingEngine.calculateOdooPricing(request)
      
      expect(result.roi.implementationCost).toBeGreaterThan(0)
      expect(result.roi.annualSavings).toBeGreaterThan(0)
      expect(result.roi.paybackPeriod).toBeGreaterThan(0)
      expect(result.roi.threeYearROI).toBeGreaterThan(0)
      expect(result.roi.fiveYearROI).toBeGreaterThan(0)
    })

    it('should calculate TCO correctly', async () => {
      const request = {
        modules: ['crm'],
        userCount: 50,
        billingCycle: 'annual' as const,
        pricingModel: 'standard' as const,
        supportLevel: 'premium' as const
      }

      const result = await odooPricingEngine.calculateOdooPricing(request)
      
      expect(result.tco.softwareCosts).toBeGreaterThan(0)
      expect(result.tco.implementationCosts).toBeGreaterThan(0)
      expect(result.tco.maintenanceCosts).toBeGreaterThan(0)
      expect(result.tco.totalTCO).toBeGreaterThan(0)
      expect(result.tco.comparison.savings).toBeGreaterThan(0)
    })
  })

  describe('Competitive Analysis', () => {
    it('should generate competitive analysis', async () => {
      const request = {
        modules: ['crm', 'accounting'],
        userCount: 100,
        billingCycle: 'annual' as const,
        pricingModel: 'enterprise' as const
      }

      const result = await odooPricingEngine.calculateOdooPricing(request)
      
      expect(result.competitiveAnalysis.competitors).toHaveLength(2)
      expect(result.competitiveAnalysis.advantages).toHaveLength(4)
      expect(result.competitiveAnalysis.differentiators).toHaveLength(4)
      
      const odooCompetitor = result.competitiveAnalysis.competitors.find(c => c.name === 'Odoo Enterprise')
      expect(odooCompetitor).toBeDefined()
      expect(odooCompetitor?.pricing).toBeGreaterThan(result.billingBreakdown.annualEquivalent)
    })
  })

  describe('Pricing Terms', () => {
    it('should generate appropriate pricing terms', async () => {
      const request = {
        modules: ['crm'],
        userCount: 10,
        billingCycle: 'annual' as const,
        pricingModel: 'standard' as const,
        supportLevel: 'enterprise' as const
      }

      const result = await odooPricingEngine.calculateOdooPricing(request)
      
      expect(result.terms.contractLength).toBe('12 months')
      expect(result.terms.cancellationPolicy).toBe('30-day notice required')
      expect(result.terms.upgradePolicy).toBe('Pro-rated upgrades available')
      expect(result.terms.supportIncluded).toContain('Dedicated support')
      expect(result.terms.customizations).toContain('API access')
    })
  })

  describe('Edge Cases', () => {
    it('should handle minimum user count', async () => {
      const request = {
        modules: ['crm'],
        userCount: 1,
        billingCycle: 'monthly' as const,
        pricingModel: 'standard' as const
      }

      const result = await odooPricingEngine.calculateOdooPricing(request)
      
      expect(result.netPrice).toBeGreaterThan(0)
      expect(result.modulePricing[0].userCount).toBe(1)
    })

    it('should handle maximum user count', async () => {
      const request = {
        modules: ['crm'],
        userCount: 10000,
        billingCycle: 'monthly' as const,
        pricingModel: 'enterprise' as const
      }

      const result = await odooPricingEngine.calculateOdooPricing(request)
      
      expect(result.netPrice).toBeGreaterThan(0)
      expect(result.modulePricing[0].userCount).toBe(10000)
    })

    it('should handle multiple discount types', async () => {
      const request = {
        modules: ['crm'],
        userCount: 100, // Volume discount
        billingCycle: 'annual' as const, // Billing discount
        pricingModel: 'standard' as const,
        commitmentPeriod: 24, // Commitment discount
        partnerDiscount: 0.10, // Partner discount
        earlyAdopterDiscount: true // Early adopter discount
      }

      const result = await odooPricingEngine.calculateOdooPricing(request)
      
      expect(result.discounts.length).toBeGreaterThan(3)
      expect(result.totalDiscount).toBeGreaterThan(0)
      expect(result.netPrice).toBeLessThan(result.basePrice)
    })
  })

  describe('Validation', () => {
    it('should reject invalid user count', async () => {
      const request = {
        modules: ['crm'],
        userCount: 0,
        billingCycle: 'monthly' as const,
        pricingModel: 'standard' as const
      }

      await expect(odooPricingEngine.calculateOdooPricing(request)).rejects.toThrow()
    })

    it('should reject empty modules array', async () => {
      const request = {
        modules: [],
        userCount: 10,
        billingCycle: 'monthly' as const,
        pricingModel: 'standard' as const
      }

      await expect(odooPricingEngine.calculateOdooPricing(request)).rejects.toThrow()
    })

    it('should reject invalid billing cycle', async () => {
      const request = {
        modules: ['crm'],
        userCount: 10,
        billingCycle: 'invalid' as any,
        pricingModel: 'standard' as const
      }

      await expect(odooPricingEngine.calculateOdooPricing(request)).rejects.toThrow()
    })
  })
})
