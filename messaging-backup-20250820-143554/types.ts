/**
 * CoreFlow360 Pricing System Types
 *
 * TypeScript definitions for revolutionary intelligence multiplication pricing.
 */

// Department configuration for pricing
export interface DepartmentPricing {
  id: string
  name: string
  basePrice: number
  color: string
  icon: string
  description: string
  capabilities: string[]
  multiplier: number // Intelligence multiplication factor
  dependencies?: string[] // Required departments
  synergies?: string[] // Departments that enhance this one
}

// Pricing tiers with intelligence levels
export interface PricingTier {
  id: string
  name: string
  description: string
  priceMultiplier: number // Applied to base department prices
  features: string[]
  maxUsers?: number
  support: 'basic' | 'priority' | 'dedicated'
  aiCapabilities: 'standard' | 'advanced' | 'unlimited'
}

// Intelligence multiplication calculation
export interface IntelligenceMultiplier {
  baseDepartments: number // Number of selected departments
  connectionCount: number // Synaptic connections between departments
  synergyBonus: number // Additional multiplier from department synergies
  complexityFactor: number // Exponential growth factor
  totalMultiplier: number // Final intelligence multiplication
  comparisonToLinear: number // How much better than linear addition
}

// Complete pricing calculation result
export interface PricingCalculation {
  selectedDepartments: string[]
  selectedTier: PricingTier
  basePrice: number // Sum of department base prices
  tierAdjustedPrice: number // After tier multiplier
  intelligenceMultiplier: IntelligenceMultiplier
  synergyDiscount: number // Discount for multiple departments
  finalPrice: number // Monthly price
  annualPrice: number // Annual with discount
  annualSavings: number // Savings from annual billing
}

// ROI calculation and projections
export interface ROICalculation {
  monthlyInvestment: number
  projectedMonthlySavings: number
  automationEfficiencyGains: number // Time saved through automation
  intelligenceMultipliedOutput: number // Productivity increase
  paybackPeriodMonths: number
  twelveMonthROI: number // Percentage return
  threeYearROI: number // Long-term return
  breakEvenMonth: number
}

// Cost comparison with traditional software
export interface CostComparison {
  coreflow360Monthly: number
  traditionalToolsMonthly: number // Separate tools for each department
  monthlySavings: number
  annualSavings: number
  threeYearSavings: number
  additionalBenefits: string[] // Non-monetary benefits
}

// Company size-based pricing adjustments
export interface CompanyPricingProfile {
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
  employeeRange: [number, number]
  recommendedTier: string
  priceAdjustment: number // Discount/premium based on size
  supportLevel: 'standard' | 'priority' | 'white-glove'
  customFeatures?: string[]
}

// Pricing calculator configuration
export interface PricingCalculatorConfig {
  showVisualization: boolean
  animateTransitions: boolean
  defaultSelections: string[] // Pre-selected departments
  companyProfile?: CompanyPricingProfile
  customization: {
    colors: Record<string, string>
    currency: 'USD' | 'EUR' | 'GBP'
    billingPeriods: ('monthly' | 'annual' | 'custom')[]
  }
}

// Pricing event for analytics
export interface PricingEvent {
  type:
    | 'department_selected'
    | 'department_deselected'
    | 'tier_changed'
    | 'calculation_complete'
    | 'cta_clicked'
  timestamp: number
  data: {
    departmentId?: string
    tierId?: string
    finalPrice?: number
    departments?: string[]
    multiplier?: number
  }
  userSession: string
}

// Promotional pricing and discounts
export interface PromotionalPricing {
  id: string
  name: string
  description: string
  discountType: 'percentage' | 'fixed' | 'tier_upgrade'
  discountValue: number
  conditions: {
    minDepartments?: number
    requiredTier?: string
    companySize?: string[]
    timeLimit?: Date
  }
  isActive: boolean
}

// Dynamic pricing based on usage/value
export interface DynamicPricing {
  basePrice: number
  usageMultiplier: number // Based on actual platform usage
  valueMultiplier: number // Based on measured ROI/results
  loyaltyDiscount: number // Long-term customer discount
  volumeDiscount: number // Enterprise volume pricing
  finalAdjustedPrice: number
}

// Billing and subscription management
export interface SubscriptionDetails {
  id: string
  selectedDepartments: DepartmentPricing[]
  tier: PricingTier
  billingPeriod: 'monthly' | 'annual'
  startDate: Date
  nextBillingDate: Date
  status: 'active' | 'paused' | 'cancelled' | 'trial'
  trialEndsAt?: Date
  autoRenew: boolean
  paymentMethod: string
}

// Pricing analytics and insights
export interface PricingAnalytics {
  conversionRate: number // Visitors to paid customers
  averageDealSize: number // Average monthly commitment
  mostPopularDepartments: string[]
  mostPopularTier: string
  dropOffPoints: string[] // Where users leave pricing flow
  priceElasticity: number // How price changes affect demand
}

// Custom enterprise pricing
export interface EnterprisePricing {
  customDepartments: DepartmentPricing[] // Custom-built departments
  volumeDiscounts: number[] // Tiered volume pricing
  contractLength: 12 | 24 | 36 // Months
  supportSLA: {
    responseTime: string
    uptime: string
    dedicatedSupport: boolean
  }
  customIntegrations: string[]
  onboardingIncluded: boolean
  trainingIncluded: boolean
}

// A/B testing for pricing
export interface PricingExperiment {
  id: string
  name: string
  description: string
  variants: {
    control: PricingCalculatorConfig
    variant: PricingCalculatorConfig
  }
  metrics: {
    conversionRate: number
    averageOrderValue: number
    userEngagement: number
  }
  isActive: boolean
  sampleSize: number
  confidenceLevel: number
}
