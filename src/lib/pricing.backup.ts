/**
 * CoreFlow360 - Progressive Pricing Engine
 * Multi-business discount system with intelligent pricing
 */

export interface PricingTier {
  name: string
  basePrice: number
  perUserPrice: number
  maxUsers?: number
  features: string[]
  popular?: boolean
}

export interface ModulePricing {
  moduleKey: string
  name: string
  basePrice: number
  perUserPrice: number
  category: 'core' | 'advanced' | 'industry' | 'integration'
  dependencies?: string[]
}

export interface BusinessSubscription {
  tenantId: string
  businessName: string
  userCount: number
  selectedModules: string[]
  billingOrder: number // 1st, 2nd, 3rd business etc.
  discountRate: number
  monthlyTotal: number
  industry: string
}

export interface PricingCalculation {
  basePrice: number
  modulesPricing: ModulePricing[]
  userCount: number
  discountRate: number
  discountAmount: number
  finalPrice: number
  savings: number
  billingOrder: number
  recommendedUpgrades?: string[]
  bundleRecommendation?: string
}

// Base pricing tiers
export const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Starter',
    basePrice: 29,
    perUserPrice: 7,
    maxUsers: 10,
    features: [
      'CRM & Customer Management',
      'Basic Project Management',
      'Financial Tracking',
      'AI Assistant',
      'Mobile Access',
      '5GB Storage',
    ],
  },
  {
    name: 'Professional',
    basePrice: 59,
    perUserPrice: 12,
    maxUsers: 50,
    popular: true,
    features: [
      'Everything in Starter',
      'Advanced Analytics',
      'Workflow Automation',
      'API Access',
      'Custom Reports',
      'Multi-department Support',
      '50GB Storage',
      'Priority Support',
    ],
  },
  {
    name: 'Enterprise',
    basePrice: 99,
    perUserPrice: 18,
    features: [
      'Everything in Professional',
      'Advanced AI Features',
      'Industry-specific Modules',
      'Custom Integrations',
      'White-label Options',
      'Dedicated Success Manager',
      'Unlimited Storage',
      'SSO & Advanced Security',
      '99.9% SLA',
    ],
  },
]

// Module pricing
export const MODULE_PRICING: ModulePricing[] = [
  // Core Modules
  {
    moduleKey: 'crm',
    name: 'CRM & Customer Management',
    basePrice: 15,
    perUserPrice: 3,
    category: 'core',
  },
  {
    moduleKey: 'accounting',
    name: 'Financial Management',
    basePrice: 20,
    perUserPrice: 4,
    category: 'core',
  },
  {
    moduleKey: 'projects',
    name: 'Project Management',
    basePrice: 18,
    perUserPrice: 3,
    category: 'core',
  },

  // Advanced Modules
  {
    moduleKey: 'inventory',
    name: 'Inventory Management',
    basePrice: 25,
    perUserPrice: 5,
    category: 'advanced',
    dependencies: ['accounting'],
  },
  {
    moduleKey: 'hr',
    name: 'Human Resources',
    basePrice: 22,
    perUserPrice: 4,
    category: 'advanced',
  },
  {
    moduleKey: 'manufacturing',
    name: 'Manufacturing Operations',
    basePrice: 35,
    perUserPrice: 7,
    category: 'advanced',
    dependencies: ['inventory', 'projects'],
  },

  // Industry-specific Modules
  {
    moduleKey: 'legal',
    name: 'Legal Practice Management',
    basePrice: 40,
    perUserPrice: 8,
    category: 'industry',
  },
  {
    moduleKey: 'healthcare',
    name: 'Healthcare Management',
    basePrice: 45,
    perUserPrice: 9,
    category: 'industry',
  },
  {
    moduleKey: 'construction',
    name: 'Construction Management',
    basePrice: 38,
    perUserPrice: 7,
    category: 'industry',
    dependencies: ['projects', 'inventory'],
  },

  // Integration Modules
  {
    moduleKey: 'api_plus',
    name: 'Advanced API & Integrations',
    basePrice: 30,
    perUserPrice: 2,
    category: 'integration',
  },
  {
    moduleKey: 'ai_premium',
    name: 'Premium AI Features',
    basePrice: 25,
    perUserPrice: 3,
    category: 'integration',
  },
]

// Progressive discount rates based on business order
export const PROGRESSIVE_DISCOUNTS: Record<number, number> = {
  1: 0, // First business - no discount
  2: 0.2, // Second business - 20% off
  3: 0.35, // Third business - 35% off
  4: 0.45, // Fourth business - 45% off
  5: 0.5, // Fifth+ business - 50% off (max discount)
}

// Bundle discounts for multiple modules
export const BUNDLE_DISCOUNTS: Record<
  string,
  { modules: string[]; discount: number; name: string }
> = {
  core_bundle: {
    name: 'Core Business Bundle',
    modules: ['crm', 'accounting', 'projects'],
    discount: 0.15, // 15% off when all three are selected
  },
  manufacturing_bundle: {
    name: 'Manufacturing Suite',
    modules: ['inventory', 'manufacturing', 'projects', 'accounting'],
    discount: 0.25, // 25% off manufacturing-focused modules
  },
  professional_services: {
    name: 'Professional Services Bundle',
    modules: ['crm', 'projects', 'hr', 'accounting'],
    discount: 0.2, // 20% off for service businesses
  },
}

/**
 * Calculate progressive discount rate based on billing order
 */
export function getProgressiveDiscount(billingOrder: number): number {
  return PROGRESSIVE_DISCOUNTS[Math.min(billingOrder, 5)] || 0.5
}

/**
 * Calculate bundle discount if applicable
 */
export function calculateBundleDiscount(selectedModules: string[]): {
  bundleKey?: string
  bundleName?: string
  discount: number
} {
  for (const [bundleKey, bundle] of Object.entries(BUNDLE_DISCOUNTS)) {
    const hasAllModules = bundle.modules.every((module) => selectedModules.includes(module))
    if (hasAllModules) {
      return {
        bundleKey,
        bundleName: bundle.name,
        discount: bundle.discount,
      }
    }
  }
  return { discount: 0 }
}

/**
 * Calculate total pricing for a business subscription
 */
export function calculateBusinessPricing(
  userCount: number,
  selectedModules: string[],
  billingOrder: number = 1,
  industry?: string
): PricingCalculation {
  // Get module pricing
  const modulesPricing = MODULE_PRICING.filter((module) =>
    selectedModules.includes(module.moduleKey)
  )

  // Calculate base pricing (modules + users)
  const modulesBasePrice = modulesPricing.reduce((sum, module) => sum + module.basePrice, 0)
  const modulesUserPrice = modulesPricing.reduce(
    (sum, module) => sum + module.perUserPrice * userCount,
    0
  )
  const basePrice = modulesBasePrice + modulesUserPrice

  // Calculate bundle discount
  const bundleDiscount = calculateBundleDiscount(selectedModules)

  // Calculate progressive discount
  const progressiveDiscountRate = getProgressiveDiscount(billingOrder)

  // Apply highest discount (progressive or bundle)
  const discountRate = Math.max(progressiveDiscountRate, bundleDiscount.discount)
  const discountAmount = basePrice * discountRate
  const finalPrice = basePrice - discountAmount

  // Calculate savings compared to no discount
  const savings = discountAmount

  // Generate recommendations
  const recommendedUpgrades = generateModuleRecommendations(selectedModules, industry)
  const bundleRecommendation = getBundleRecommendation(selectedModules, industry)

  return {
    basePrice,
    modulesPricing,
    userCount,
    discountRate,
    discountAmount,
    finalPrice,
    savings,
    billingOrder,
    recommendedUpgrades,
    bundleRecommendation,
  }
}

/**
 * Calculate total portfolio pricing for multiple businesses
 */
export function calculatePortfolioPricing(businesses: BusinessSubscription[]): {
  totalBasePrice: number
  totalDiscountAmount: number
  totalFinalPrice: number
  totalMonthlySavings: number
  averageDiscountRate: number
  businessBreakdown: PricingCalculation[]
} {
  // Sort businesses by billing order to ensure correct progressive pricing
  const sortedBusinesses = [...businesses].sort((a, b) => a.billingOrder - b.billingOrder)

  const businessBreakdown = sortedBusinesses.map((business) =>
    calculateBusinessPricing(
      business.userCount,
      business.selectedModules,
      business.billingOrder,
      business.industry
    )
  )

  const totalBasePrice = businessBreakdown.reduce((sum, calc) => sum + calc.basePrice, 0)
  const totalDiscountAmount = businessBreakdown.reduce((sum, calc) => sum + calc.discountAmount, 0)
  const totalFinalPrice = businessBreakdown.reduce((sum, calc) => sum + calc.finalPrice, 0)
  const averageDiscountRate = totalDiscountAmount / totalBasePrice

  return {
    totalBasePrice,
    totalDiscountAmount,
    totalFinalPrice,
    totalMonthlySavings: totalDiscountAmount,
    averageDiscountRate,
    businessBreakdown,
  }
}

/**
 * Generate module recommendations based on current selection and industry
 */
function generateModuleRecommendations(selectedModules: string[], industry?: string): string[] {
  const recommendations: string[] = []

  // Core recommendations
  if (selectedModules.includes('crm') && !selectedModules.includes('projects')) {
    recommendations.push('projects') // CRM users often need project management
  }

  if (selectedModules.includes('inventory') && !selectedModules.includes('accounting')) {
    recommendations.push('accounting') // Inventory needs financial tracking
  }

  // Industry-specific recommendations
  if (industry === 'MANUFACTURING' && !selectedModules.includes('inventory')) {
    recommendations.push('inventory')
  }

  if (industry === 'LEGAL' && !selectedModules.includes('legal')) {
    recommendations.push('legal')
  }

  if (industry === 'HEALTHCARE' && !selectedModules.includes('healthcare')) {
    recommendations.push('healthcare')
  }

  // AI recommendations for power users
  if (selectedModules.length >= 4 && !selectedModules.includes('ai_premium')) {
    recommendations.push('ai_premium')
  }

  return recommendations.filter((rec) => !selectedModules.includes(rec))
}

/**
 * Get bundle recommendation based on current selection
 */
function getBundleRecommendation(selectedModules: string[], industry?: string): string | undefined {
  // If they already have a bundle, don't recommend
  const currentBundle = calculateBundleDiscount(selectedModules)
  if (currentBundle.bundleKey) return undefined

  // Recommend core bundle if they have 1-2 core modules
  const coreModules = ['crm', 'accounting', 'projects']
  const selectedCoreModules = coreModules.filter((module) => selectedModules.includes(module))

  if (selectedCoreModules.length >= 1 && selectedCoreModules.length < 3) {
    return 'core_bundle'
  }

  // Industry-specific bundle recommendations
  if (industry === 'MANUFACTURING' && selectedModules.includes('inventory')) {
    return 'manufacturing_bundle'
  }

  if ((industry === 'CONSULTING' || industry === 'LEGAL') && selectedModules.includes('projects')) {
    return 'professional_services'
  }

  return undefined
}

/**
 * Format pricing for display
 */
export function formatPricing(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Calculate ROI compared to traditional ERP solutions
 */
export function calculateROIComparison(
  monthlyPrice: number,
  userCount: number
): {
  coreflow360: number
  netsuiteEquivalent: number
  sapEquivalent: number
  savings: number
  savingsPercent: number
} {
  const coreflow360 = monthlyPrice
  const netsuiteEquivalent = userCount * 129 + 999 // NetSuite typical pricing
  const sapEquivalent = userCount * 150 + 1500 // SAP Business One typical pricing

  const competitorAverage = (netsuiteEquivalent + sapEquivalent) / 2
  const savings = competitorAverage - coreflow360
  const savingsPercent = (savings / competitorAverage) * 100

  return {
    coreflow360,
    netsuiteEquivalent,
    sapEquivalent,
    savings,
    savingsPercent,
  }
}
