/**
 * CoreFlow360 - Unified Pricing Engine
 * Single source of truth for all pricing calculations
 */

import { z } from 'zod'
import { prisma } from './db'

// Progressive Multi-Business Pricing Model
export const PROGRESSIVE_DISCOUNTS = {
  1: 0,    // First business - no discount
  2: 0.20, // Second business - 20% off
  3: 0.35, // Third business - 35% off
  4: 0.45, // Fourth business - 45% off
  5: 0.50, // Fifth+ businesses - 50% off (maximum discount)
};

export function calculateProgressivePrice(
  basePrice: number,
  businessCount: number,
  usersPerBusiness: number
): { totalPrice: number; savings: number; discountRate: number } {
  const discount = PROGRESSIVE_DISCOUNTS[Math.min(businessCount, 5)] || 0.50;
  const fullPrice = basePrice + (usersPerBusiness * 12); // $12 per user
  const discountedPrice = fullPrice * (1 - discount);
  const savings = fullPrice - discountedPrice;
  
  return {
    totalPrice: discountedPrice,
    savings: savings,
    discountRate: discount
  };
}

// Pricing calculation request schema
const PricingRequestSchema = z.object({
  modules: z.array(z.string()).min(1, 'At least one module required'),
  userCount: z
    .number()
    .int()
    .min(1, 'User count must be at least 1')
    .max(10000, 'User count too high'),
  billingCycle: z.enum(['monthly', 'annual']).default('monthly'),
  tenantId: z.string().optional(),
  billingOrder: z.number().int().min(1).default(1),
  industry: z.string().optional(),
  applyDiscounts: z.boolean().default(true),
  includeSetupFees: z.boolean().default(true),
})

// Pricing calculation result
export interface PricingCalculation {
  basePrice: number
  userPrice: number
  setupFees: number
  subtotal: number
  discounts: Discount[]
  totalDiscount: number
  finalPrice: number
  monthlyPrice: number
  annualPrice: number
  breakdown: ModuleBreakdown[]
  recommendations: string[]
  warnings: string[]
}

export interface Discount {
  type: 'bundle' | 'volume' | 'progressive' | 'annual'
  name: string
  amount: number
  percentage: number
  description: string
}

export interface ModuleBreakdown {
  moduleKey: string
  moduleName: string
  basePrice: number
  perUserPrice: number
  userCount: number
  subtotal: number
  setupFee: number
}

export class UnifiedPricingEngine {
  private static instance: UnifiedPricingEngine

  private constructor() {}

  static getInstance(): UnifiedPricingEngine {
    if (!UnifiedPricingEngine.instance) {
      UnifiedPricingEngine.instance = new UnifiedPricingEngine()
    }
    return UnifiedPricingEngine.instance
  }

  /**
   * Calculate pricing for a subscription request
   */
  async calculatePricing(
    request: z.infer<typeof PricingRequestSchema>
  ): Promise<PricingCalculation> {
    // Validate request
    const validatedRequest = PricingRequestSchema.parse(request)

    // Get module definitions
    const moduleDefinitions = await this.getModuleDefinitions(validatedRequest.modules)

    // Validate dependencies
    await this.validateModuleDependencies(moduleDefinitions, validatedRequest.modules)

    // Calculate base pricing
    const breakdown = this.calculateModuleBreakdown(moduleDefinitions, validatedRequest.userCount)

    // Calculate setup fees
    const setupFees = validatedRequest.includeSetupFees
      ? breakdown.reduce((sum, module) => sum + module.setupFee, 0)
      : 0

    // Calculate subtotal
    const subtotal = breakdown.reduce((sum, module) => sum + module.subtotal, 0) + setupFees

    // Apply discounts
    const discounts = await this.calculateDiscounts(validatedRequest, subtotal, breakdown)
    const totalDiscount = discounts.reduce((sum, discount) => sum + discount.amount, 0)

    // Calculate final price
    const finalPrice = Math.max(0, subtotal - totalDiscount)

    // Calculate monthly/annual prices
    const monthlyPrice = validatedRequest.billingCycle === 'annual' ? finalPrice / 12 : finalPrice
    const annualPrice = validatedRequest.billingCycle === 'annual' ? finalPrice : finalPrice * 12

    // Generate recommendations
    const recommendations = this.generateRecommendations(validatedRequest, breakdown)

    // Generate warnings
    const warnings = this.generateWarnings(validatedRequest, breakdown)

    return {
      basePrice: breakdown.reduce((sum, module) => sum + module.basePrice, 0),
      userPrice: breakdown.reduce((sum, module) => sum + module.perUserPrice * module.userCount, 0),
      setupFees,
      subtotal,
      discounts,
      totalDiscount,
      finalPrice,
      monthlyPrice,
      annualPrice,
      breakdown,
      recommendations,
      warnings,
    }
  }

  /**
   * Get module definitions from database
   */
  private async getModuleDefinitions(moduleKeys: string[]) {
    const modules = await prisma.moduleDefinition.findMany({
      where: {
        moduleKey: { in: moduleKeys },
        isActive: true,
      },
    })

    if (modules.length !== moduleKeys.length) {
      const foundModules = modules.map((m) => m.moduleKey)
      const missingModules = moduleKeys.filter((key) => !foundModules.includes(key))
      throw new Error(`Invalid modules: ${missingModules.join(', ')}`)
    }

    return modules
  }

  /**
   * Validate module dependencies
   */
  private async validateModuleDependencies(modules: unknown[], selectedModules: string[]) {
    const errors: string[] = []

    for (const mod of modules) {
      const dependencies = JSON.parse(mod.dependencies || '[]') as string[]
      const conflicts = JSON.parse(mod.conflicts || '[]') as string[]

      // Check dependencies
      for (const dependency of dependencies) {
        if (!selectedModules.includes(dependency)) {
          errors.push(`Module '${mod.moduleKey}' requires '${dependency}'`)
        }
      }

      // Check conflicts
      for (const conflict of conflicts) {
        if (selectedModules.includes(conflict)) {
          errors.push(`Module '${mod.moduleKey}' conflicts with '${conflict}'`)
        }
      }
    }

    if (errors.length > 0) {
      throw new Error(`Dependency validation failed: ${errors.join(', ')}`)
    }
  }

  /**
   * Calculate module breakdown
   */
  private calculateModuleBreakdown(modules: unknown[], userCount: number): ModuleBreakdown[] {
    return modules.map((mod) => {
      const basePrice = parseFloat(mod.basePrice)
      const perUserPrice = parseFloat(mod.perUserPrice)
      const setupFee = parseFloat(mod.setupFee || '0')

      // Use consistent pricing formula: max(basePrice, perUserPrice * userCount)
      const subtotal = Math.max(basePrice, perUserPrice * userCount)

      return {
        moduleKey: mod.moduleKey,
        moduleName: mod.name,
        basePrice,
        perUserPrice,
        userCount,
        subtotal,
        setupFee,
      }
    })
  }

  /**
   * Calculate applicable discounts
   */
  private async calculateDiscounts(
    request: z.infer<typeof PricingRequestSchema>,
    subtotal: number,
    breakdown: ModuleBreakdown[]
  ): Promise<Discount[]> {
    const discounts: Discount[] = []

    if (!request.applyDiscounts) {
      return discounts
    }

    // Bundle discounts
    const bundleDiscount = this.calculateBundleDiscount(request.modules, subtotal)
    if (bundleDiscount) {
      discounts.push(bundleDiscount)
    }

    // Volume discounts
    const volumeDiscount = this.calculateVolumeDiscount(request.userCount, subtotal)
    if (volumeDiscount) {
      discounts.push(volumeDiscount)
    }

    // Progressive discounts (for multi-business)
    const progressiveDiscount = this.calculateProgressiveDiscount(request.billingOrder, subtotal)
    if (progressiveDiscount) {
      discounts.push(progressiveDiscount)
    }

    // Annual billing discount
    if (request.billingCycle === 'annual') {
      discounts.push({
        type: 'annual',
        name: 'Annual Billing Discount',
        amount: subtotal * 0.1, // 10% discount
        percentage: 0.1,
        description: '10% discount for annual billing',
      })
    }

    return discounts
  }

  /**
   * Calculate bundle discount
   */
  private calculateBundleDiscount(modules: string[], subtotal: number): Discount | null {
    const bundles = {
      core_bundle: {
        name: 'Core Business Bundle',
        modules: ['crm', 'accounting', 'projects'],
        discount: 0.15,
      },
      manufacturing_bundle: {
        name: 'Manufacturing Suite',
        modules: ['inventory', 'manufacturing', 'projects', 'accounting'],
        discount: 0.25,
      },
      professional_services: {
        name: 'Professional Services Bundle',
        modules: ['crm', 'projects', 'hr', 'accounting'],
        discount: 0.2,
      },
    }

    for (const [key, bundle] of Object.entries(bundles)) {
      if (bundle.modules.every((module) => modules.includes(module))) {
        return {
          type: 'bundle',
          name: bundle.name,
          amount: subtotal * bundle.discount,
          percentage: bundle.discount,
          description: `${bundle.discount * 100}% discount for ${bundle.name}`,
        }
      }
    }

    return null
  }

  /**
   * Calculate volume discount
   */
  private calculateVolumeDiscount(userCount: number, subtotal: number): Discount | null {
    const volumeTiers = {
      10: 0.05, // 5% off for 10+ users
      25: 0.1, // 10% off for 25+ users
      50: 0.15, // 15% off for 50+ users
      100: 0.2, // 20% off for 100+ users
      250: 0.25, // 25% off for 250+ users
    }

    let applicableDiscount = 0
    for (const [tier, discount] of Object.entries(volumeTiers)) {
      if (userCount >= parseInt(tier)) {
        applicableDiscount = Math.max(applicableDiscount, discount)
      }
    }

    if (applicableDiscount > 0) {
      return {
        type: 'volume',
        name: 'Volume Discount',
        amount: subtotal * applicableDiscount,
        percentage: applicableDiscount,
        description: `${applicableDiscount * 100}% volume discount for ${userCount}+ users`,
      }
    }

    return null
  }

  /**
   * Calculate progressive discount for multi-business
   * Enhanced progressive pricing model for business empire growth
   */
  private calculateProgressiveDiscount(billingOrder: number, subtotal: number): Discount | null {
    const progressiveDiscounts = {
      1: 0, // First business - no discount
      2: 0.2, // Second business - 20% off (Smart Start tier)
      3: 0.35, // Third business - 35% off (Business Growth tier)
      4: 0.5, // Fourth business - 50% off (Business Empire tier)
      5: 0.5, // Fifth+ business - 50% off (maintained Empire discount)
    }

    const discount = progressiveDiscounts[Math.min(billingOrder, 5)] || 0.5

    if (discount > 0) {
      const tierName = this.getProgressiveTierName(billingOrder)
      return {
        type: 'progressive',
        name: `Multi-Business ${tierName} Discount`,
        amount: subtotal * discount,
        percentage: discount,
        description: `${discount * 100}% discount for ${billingOrder}${this.getOrdinalSuffix(billingOrder)} business - ${tierName}`,
      }
    }

    return null
  }

  /**
   * Get tier name based on business order
   */
  private getProgressiveTierName(billingOrder: number): string {
    const tierNames = {
      2: 'Smart Start',
      3: 'Business Growth',
      4: 'Business Empire',
      5: 'Empire Max',
    }
    return tierNames[Math.min(billingOrder, 5)] || 'Empire Max'
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    request: z.infer<typeof PricingRequestSchema>,
    breakdown: ModuleBreakdown[]
  ): string[] {
    const recommendations: string[] = []

    // Core recommendations
    if (request.modules.includes('crm') && !request.modules.includes('projects')) {
      recommendations.push('Add Project Management for better customer project tracking')
    }

    if (request.modules.includes('inventory') && !request.modules.includes('accounting')) {
      recommendations.push('Add Accounting for complete inventory financial tracking')
    }

    // Industry-specific recommendations
    if (request.industry === 'MANUFACTURING' && !request.modules.includes('inventory')) {
      recommendations.push('Add Inventory Management for manufacturing operations')
    }

    // AI recommendations
    if (request.modules.length >= 4 && !request.modules.includes('ai_premium')) {
      recommendations.push('Add Premium AI Features for advanced analytics')
    }

    return recommendations
  }

  /**
   * Generate warnings
   */
  private generateWarnings(
    request: z.infer<typeof PricingRequestSchema>,
    breakdown: ModuleBreakdown[]
  ): string[] {
    const warnings: string[] = []

    // User count warnings
    if (request.userCount > 100) {
      warnings.push('Consider Enterprise tier for better support and features')
    }

    // Module combination warnings
    if (request.modules.includes('manufacturing') && !request.modules.includes('inventory')) {
      warnings.push('Manufacturing module works best with Inventory Management')
    }

    return warnings
  }

  /**
   * Helper method for ordinal suffixes
   */
  private getOrdinalSuffix(num: number): string {
    const j = num % 10
    const k = num % 100
    if (j === 1 && k !== 11) return 'st'
    if (j === 2 && k !== 12) return 'nd'
    if (j === 3 && k !== 13) return 'rd'
    return 'th'
  }
}

// Export singleton instance
export const pricingEngine = UnifiedPricingEngine.getInstance()
