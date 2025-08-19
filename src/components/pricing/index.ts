/**
 * CoreFlow360 Pricing Components
 *
 * Revolutionary pricing components that demonstrate intelligence multiplication
 * rather than traditional feature addition pricing models.
 */

export { default as IntelligenceMultiplicationCalculator } from './IntelligenceMultiplicationCalculator'

// Additional pricing components (to be implemented)
export type {
  PricingTier,
  DepartmentPricing,
  IntelligenceMultiplier,
  ROICalculation,
} from './types'

// Pricing utilities
export * from './utils/pricingCalculations'
export * from './hooks/usePricingCalculator'
