/**
 * CoreFlow360 - Odoo-Style Pricing Calculator
 * Implements competitive pricing with intelligent bundling
 */

import { Bundle, BillingCycle } from '@prisma/client'

export interface PricingTier {
  name: string
  basePrice: number
  perUserPrice: number
  minUsers: number
  maxUsers?: number
  features: string[]
  aiCredits: number
  storageGB: number
  apiCalls: number
}

export interface BundleDiscount {
  bundleCount: number
  discountPercent: number
}

export interface PricingResult {
  basePrice: number
  userPrice: number
  totalMonthly: number
  totalAnnual: number
  savings: number
  recommendedBundles?: string[]
  appliedDiscounts: string[]
}

// Pricing tiers matching Odoo's competitive pricing
export const PRICING_TIERS: Record<string, PricingTier> = {
  starter: {
    name: 'Starter',
    basePrice: 0,
    perUserPrice: 7.25,
    minUsers: 1,
    maxUsers: 5,
    features: ['core_crm', 'basic_sales', 'basic_finance'],
    aiCredits: 100,
    storageGB: 10,
    apiCalls: 1000
  },
  professional: {
    name: 'Professional',
    basePrice: 0,
    perUserPrice: 18,
    minUsers: 5,
    maxUsers: 50,
    features: ['advanced_crm', 'sales_automation', 'full_finance', 'hr_basics'],
    aiCredits: 1000,
    storageGB: 100,
    apiCalls: 10000
  },
  enterprise: {
    name: 'Enterprise',
    basePrice: 0,
    perUserPrice: 36,
    minUsers: 20,
    features: ['all_features', 'custom_workflows', 'api_access', 'priority_support'],
    aiCredits: 10000,
    storageGB: 1000,
    apiCalls: 100000
  },
  ultimate: {
    name: 'Ultimate AI-First',
    basePrice: 0,
    perUserPrice: 58,
    minUsers: 50,
    features: ['all_features', 'ai_agents', 'custom_ai', 'white_label', 'dedicated_support'],
    aiCredits: -1, // Unlimited
    storageGB: -1, // Unlimited
    apiCalls: -1 // Unlimited
  }
}

// Bundle categories and their base modules
export const BUNDLE_CATEGORIES = {
  finance: ['accounting', 'invoicing', 'expenses', 'payments'],
  hr: ['employees', 'recruitment', 'payroll', 'time_tracking'],
  sales: ['crm', 'sales', 'pos', 'quotes'],
  operations: ['inventory', 'manufacturing', 'purchase', 'quality'],
  marketing: ['email_marketing', 'social_media', 'campaigns', 'surveys'],
  services: ['project', 'timesheet', 'field_service', 'helpdesk'],
  productivity: ['documents', 'sign', 'planning', 'approvals'],
  ai_enhancement: ['ai_insights', 'predictive_analytics', 'automation', 'nlp']
}

// Discount structure for multiple bundles
export const BUNDLE_DISCOUNTS: BundleDiscount[] = [
  { bundleCount: 2, discountPercent: 10 },
  { bundleCount: 3, discountPercent: 15 },
  { bundleCount: 4, discountPercent: 20 },
  { bundleCount: 5, discountPercent: 25 },
  { bundleCount: 6, discountPercent: 30 }
]

export class PricingCalculator {
  /**
   * Calculate pricing for a given configuration
   */
  static calculate(
    tier: string,
    users: number,
    bundles: string[],
    billingCycle: BillingCycle = 'MONTHLY'
  ): PricingResult {
    const tierConfig = PRICING_TIERS[tier]
    if (!tierConfig) {
      throw new Error(`Invalid pricing tier: ${tier}`)
    }

    // Validate user count
    if (users < tierConfig.minUsers) {
      throw new Error(`Minimum ${tierConfig.minUsers} users required for ${tierConfig.name} tier`)
    }
    if (tierConfig.maxUsers && users > tierConfig.maxUsers) {
      throw new Error(`Maximum ${tierConfig.maxUsers} users allowed for ${tierConfig.name} tier`)
    }

    // Calculate base pricing
    const basePrice = tierConfig.basePrice
    const userPrice = tierConfig.perUserPrice * users

    // Calculate bundle discount
    const bundleDiscount = this.getBundleDiscount(bundles.length)
    const discountMultiplier = 1 - (bundleDiscount / 100)

    // Calculate monthly total
    let totalMonthly = (basePrice + userPrice) * discountMultiplier

    // Apply annual discount (20% off)
    const annualDiscount = billingCycle === 'ANNUAL' ? 0.8 : 1
    totalMonthly = totalMonthly * annualDiscount

    // Calculate annual total
    const totalAnnual = totalMonthly * 12

    // Calculate savings
    const listPrice = (basePrice + userPrice) * 12
    const savings = listPrice - totalAnnual

    // Get recommended bundles based on selected ones
    const recommendedBundles = this.getRecommendedBundles(bundles, tier)

    // Build applied discounts list
    const appliedDiscounts: string[] = []
    if (bundleDiscount > 0) {
      appliedDiscounts.push(`${bundleDiscount}% bundle discount`)
    }
    if (billingCycle === 'ANNUAL') {
      appliedDiscounts.push('20% annual discount')
    }

    return {
      basePrice,
      userPrice,
      totalMonthly: Math.round(totalMonthly * 100) / 100,
      totalAnnual: Math.round(totalAnnual * 100) / 100,
      savings: Math.round(savings * 100) / 100,
      recommendedBundles,
      appliedDiscounts
    }
  }

  /**
   * Get bundle discount percentage based on count
   */
  static getBundleDiscount(bundleCount: number): number {
    const discount = BUNDLE_DISCOUNTS.find(d => d.bundleCount <= bundleCount)
    return discount ? discount.discountPercent : 0
  }

  /**
   * Get recommended bundles based on current selection
   */
  static getRecommendedBundles(selectedBundles: string[], tier: string): string[] {
    const recommendations: string[] = []

    // Finance + HR = Recommend Operations
    if (selectedBundles.includes('finance') && selectedBundles.includes('hr')) {
      recommendations.push('operations')
    }

    // Sales = Recommend Marketing
    if (selectedBundles.includes('sales') && !selectedBundles.includes('marketing')) {
      recommendations.push('marketing')
    }

    // Any 3+ bundles = Recommend AI Enhancement
    if (selectedBundles.length >= 3 && !selectedBundles.includes('ai_enhancement')) {
      recommendations.push('ai_enhancement')
    }

    // Enterprise/Ultimate = Recommend Productivity suite
    if (['enterprise', 'ultimate'].includes(tier) && !selectedBundles.includes('productivity')) {
      recommendations.push('productivity')
    }

    return recommendations
  }

  /**
   * Validate bundle selection for a tier
   */
  static validateBundles(tier: string, bundles: string[]): boolean {
    const tierConfig = PRICING_TIERS[tier]
    if (!tierConfig) return false

    // Starter tier has limited bundles
    if (tier === 'starter' && bundles.length > 2) {
      return false
    }

    // Check if bundles exist
    return bundles.every(bundle => Object.keys(BUNDLE_CATEGORIES).includes(bundle))
  }

  /**
   * Get available features for a tier and bundle combination
   */
  static getFeatures(tier: string, bundles: string[]): string[] {
    const tierConfig = PRICING_TIERS[tier]
    if (!tierConfig) return []

    const features = [...tierConfig.features]

    // Add bundle-specific features
    bundles.forEach(bundle => {
      const bundleFeatures = BUNDLE_CATEGORIES[bundle as keyof typeof BUNDLE_CATEGORIES]
      if (bundleFeatures) {
        features.push(...bundleFeatures)
      }
    })

    return [...new Set(features)] // Remove duplicates
  }

  /**
   * Compare pricing across tiers
   */
  static compareTiers(users: number, bundles: string[]): Record<string, PricingResult> {
    const results: Record<string, PricingResult> = {}

    Object.keys(PRICING_TIERS).forEach(tier => {
      try {
        results[tier] = this.calculate(tier, users, bundles, 'ANNUAL')
      } catch (error) {
        // Skip tiers that don't support the user count
      }
    })

    return results
  }
}