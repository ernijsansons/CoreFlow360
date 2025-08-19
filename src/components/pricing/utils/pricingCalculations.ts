/**
 * CoreFlow360 Pricing Calculation Utilities
 *
 * Core mathematical functions for intelligence multiplication pricing,
 * ROI calculations, and cost comparisons.
 */

import {
  DepartmentPricing,
  PricingTier,
  IntelligenceMultiplier,
  PricingCalculation,
  ROICalculation,
  CostComparison,
} from '../types'

/**
 * Calculate intelligence multiplication factor
 *
 * Traditional software: 1+1+1+1+1 = 5 (linear addition)
 * CoreFlow360: 1×2×3×4×5 = 120 (exponential multiplication)
 */
export function calculateIntelligenceMultiplier(
  departments: DepartmentPricing[]
): IntelligenceMultiplier {
  if (departments.length === 0) {
    return {
      baseDepartments: 0,
      connectionCount: 0,
      synergyBonus: 0,
      complexityFactor: 1,
      totalMultiplier: 1,
      comparisonToLinear: 1,
    }
  }

  const baseDepartments = departments.length

  // Connection count: n(n-1)/2 for full mesh network
  const connectionCount = baseDepartments > 1 ? (baseDepartments * (baseDepartments - 1)) / 2 : 0

  // Base multiplication from department multipliers
  const departmentMultiplier = departments.reduce((product, dept) => {
    return product * (1 + (dept.multiplier - 1) * 0.8) // Diminishing returns
  }, 1)

  // Synergy bonus from department combinations
  const synergyBonus = calculateSynergyBonus(departments)

  // Complexity factor: exponential growth with ceiling
  const complexityFactor = Math.min(
    Math.pow(1.2, connectionCount), // 1.2^connections
    10 // Cap at 10x to prevent infinite growth
  )

  const totalMultiplier = departmentMultiplier * (1 + synergyBonus) * complexityFactor
  const comparisonToLinear = totalMultiplier / baseDepartments

  return {
    baseDepartments,
    connectionCount,
    synergyBonus,
    complexityFactor,
    totalMultiplier,
    comparisonToLinear,
  }
}

/**
 * Calculate synergy bonuses between departments
 */
export function calculateSynergyBonus(departments: DepartmentPricing[]): number {
  if (departments.length < 2) return 0

  const departmentIds = departments.map((d) => d.id)
  let totalSynergy = 0

  // Predefined synergy mappings
  const synergyMap: Record<string, Record<string, number>> = {
    sales: {
      marketing: 0.25, // Sales + Marketing = powerful lead conversion
      finance: 0.15, // Sales + Finance = revenue optimization
      operations: 0.1, // Sales + Operations = delivery excellence
      hr: 0.05, // Sales + HR = team performance
    },
    marketing: {
      sales: 0.25, // Marketing + Sales = conversion powerhouse
      finance: 0.1, // Marketing + Finance = ROI optimization
      operations: 0.05, // Marketing + Operations = campaign delivery
      hr: 0.1, // Marketing + HR = employer branding
    },
    finance: {
      sales: 0.15, // Finance + Sales = revenue intelligence
      marketing: 0.1, // Finance + Marketing = marketing ROI
      operations: 0.2, // Finance + Operations = cost optimization
      hr: 0.15, // Finance + HR = workforce analytics
    },
    operations: {
      sales: 0.1, // Operations + Sales = delivery promise
      marketing: 0.05, // Operations + Marketing = brand delivery
      finance: 0.2, // Operations + Finance = operational efficiency
      hr: 0.25, // Operations + HR = workforce optimization
    },
    hr: {
      sales: 0.05, // HR + Sales = sales team performance
      marketing: 0.1, // HR + Marketing = employer brand
      finance: 0.15, // HR + Finance = workforce cost analysis
      operations: 0.25, // HR + Operations = operational workforce
    },
  }

  // Calculate pairwise synergies
  for (let i = 0; i < departmentIds.length; i++) {
    for (let j = i + 1; j < departmentIds.length; j++) {
      const dept1 = departmentIds[i]
      const dept2 = departmentIds[j]

      const synergy1 = synergyMap[dept1]?.[dept2] || 0
      const synergy2 = synergyMap[dept2]?.[dept1] || 0

      totalSynergy += Math.max(synergy1, synergy2)
    }
  }

  return totalSynergy
}

/**
 * Calculate complete pricing for selected configuration
 */
export function calculatePricing(
  departments: DepartmentPricing[],
  tier: PricingTier,
  billingPeriod: 'monthly' | 'annual' = 'monthly'
): PricingCalculation {
  // Base price calculation
  const basePrice = departments.reduce((sum, dept) => sum + dept.basePrice, 0)

  // Apply tier multiplier
  const tierAdjustedPrice = basePrice * tier.priceMultiplier

  // Intelligence multiplication
  const intelligenceMultiplier = calculateIntelligenceMultiplier(departments)

  // Multi-department synergy discount (more departments = better unit economics)
  const synergyDiscount =
    departments.length > 1
      ? Math.min(0.15, departments.length * 0.03) // Up to 15% discount
      : 0

  // Final monthly price
  const finalPrice = tierAdjustedPrice * (1 - synergyDiscount)

  // Annual pricing with discount
  const annualDiscountRate = 0.17 // 17% annual discount (2 months free)
  const annualPrice = finalPrice * 12 * (1 - annualDiscountRate)
  const annualSavings = finalPrice * 12 - annualPrice

  return {
    selectedDepartments: departments.map((d) => d.id),
    selectedTier: tier,
    basePrice,
    tierAdjustedPrice,
    intelligenceMultiplier,
    synergyDiscount,
    finalPrice,
    annualPrice,
    annualSavings,
  }
}

/**
 * Calculate ROI projections based on intelligence multiplication
 */
export function calculateROI(
  pricing: PricingCalculation,
  companyRevenue: number = 1000000, // Default $1M annual revenue
  currentEfficiency: number = 0.7 // 70% current operational efficiency
): ROICalculation {
  const monthlyInvestment = pricing.finalPrice
  const { totalMultiplier } = pricing.intelligenceMultiplier

  // Efficiency gains from automation (conservative estimate)
  const efficiencyImprovement = Math.min(0.3, totalMultiplier * 0.05) // Up to 30% improvement
  const newEfficiency = Math.min(0.95, currentEfficiency + efficiencyImprovement)

  // Time savings (assume 40 hours/week baseline)
  const timeSavingsPercentage = efficiencyImprovement * 0.8 // 80% of efficiency gain is time
  const automationEfficiencyGains = timeSavingsPercentage * 40 * 4.33 // Hours per month

  // Revenue impact from improved efficiency
  const monthlyRevenue = companyRevenue / 12
  const additionalRevenue = monthlyRevenue * efficiencyImprovement * 0.3 // Conservative

  // Cost savings from automation
  const laborCostSavings = automationEfficiencyGains * 50 // $50/hour value
  const operationalSavings = monthlyInvestment * totalMultiplier * 0.2 // 20% of multiplied investment

  const projectedMonthlySavings = additionalRevenue + laborCostSavings + operationalSavings

  // Intelligence multiplied output (productivity increase)
  const intelligenceMultipliedOutput = totalMultiplier * 1.5 // 1.5x base productivity per multiplier

  // ROI calculations
  const paybackPeriodMonths = monthlyInvestment / projectedMonthlySavings
  const twelveMonthROI = (projectedMonthlySavings * 12) / (monthlyInvestment * 12) - 1
  const threeYearROI = (projectedMonthlySavings * 36) / (monthlyInvestment * 36) - 1
  const breakEvenMonth = Math.ceil(paybackPeriodMonths)

  return {
    monthlyInvestment,
    projectedMonthlySavings,
    automationEfficiencyGains,
    intelligenceMultipliedOutput,
    paybackPeriodMonths,
    twelveMonthROI,
    threeYearROI,
    breakEvenMonth,
  }
}

/**
 * Compare CoreFlow360 pricing with traditional software stack
 */
export function calculateCostComparison(
  departments: DepartmentPricing[],
  coreflowPricing: PricingCalculation
): CostComparison {
  // Traditional software costs per department (market research)
  const traditionalCosts: Record<string, number> = {
    sales: 150, // Salesforce, HubSpot, etc.
    marketing: 200, // Marketo, Pardot, etc.
    finance: 180, // QuickBooks Enterprise, NetSuite, etc.
    operations: 120, // Monday.com, Asana, etc.
    hr: 100, // BambooHR, Workday, etc.
  }

  const traditionalMonthly = departments.reduce((sum, dept) => {
    return sum + (traditionalCosts[dept.id] || 150) // Default $150 if not found
  }, 0)

  const coreflow360Monthly = coreflowPricing.finalPrice
  const monthlySavings = traditionalMonthly - coreflow360Monthly
  const annualSavings = monthlySavings * 12
  const threeYearSavings = monthlySavings * 36

  const additionalBenefits = [
    'Unified data across all departments',
    'No integration costs or complexity',
    'Single support relationship',
    'Exponential intelligence multiplication',
    'Automated cross-department workflows',
    'Predictive business analytics',
    'No vendor management overhead',
  ]

  return {
    coreflow360Monthly,
    traditionalToolsMonthly: traditionalMonthly,
    monthlySavings,
    annualSavings,
    threeYearSavings,
    additionalBenefits,
  }
}

/**
 * Calculate price elasticity and optimal pricing
 */
export function calculatePriceElasticity(
  basePrice: number,
  demandAtBase: number,
  priceChange: number,
  newDemand: number
): { elasticity: number; isElastic: boolean; optimalPriceAdjustment: number } {
  const percentPriceChange = priceChange / basePrice
  const percentDemandChange = (newDemand - demandAtBase) / demandAtBase

  const elasticity = percentDemandChange / percentPriceChange
  const isElastic = Math.abs(elasticity) > 1

  // Optimal price adjustment for revenue maximization
  const optimalPriceAdjustment = isElastic
    ? -0.1 // Reduce price if elastic
    : 0.05 // Increase price if inelastic

  return {
    elasticity,
    isElastic,
    optimalPriceAdjustment,
  }
}

/**
 * Format currency values for display
 */
export function formatCurrency(
  amount: number,
  currency: 'USD' | 'EUR' | 'GBP' = 'USD',
  showCents: boolean = false
): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  })

  return formatter.format(amount)
}

/**
 * Calculate compound growth for long-term projections
 */
export function calculateCompoundGrowth(
  initialValue: number,
  growthRate: number,
  periods: number
): { finalValue: number; totalGrowth: number; periodValues: number[] } {
  const periodValues: number[] = [initialValue]

  for (let i = 1; i <= periods; i++) {
    const previousValue = periodValues[i - 1]
    const newValue = previousValue * (1 + growthRate)
    periodValues.push(newValue)
  }

  const finalValue = periodValues[periods]
  const totalGrowth = finalValue - initialValue

  return {
    finalValue,
    totalGrowth,
    periodValues,
  }
}

/**
 * Validate pricing configuration
 */
export function validatePricingConfiguration(
  departments: DepartmentPricing[],
  tier: PricingTier
): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check department dependencies
  for (const dept of departments) {
    if (dept.dependencies) {
      const missingDeps = dept.dependencies.filter(
        (depId) => !departments.some((d) => d.id === depId)
      )

      if (missingDeps.length > 0) {
        errors.push(`${dept.name} requires: ${missingDeps.join(', ')}`)
      }
    }
  }

  // Check tier compatibility
  if (tier.maxUsers && tier.maxUsers < departments.length * 5) {
    errors.push(`${tier.name} tier may not support enough users for selected departments`)
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
