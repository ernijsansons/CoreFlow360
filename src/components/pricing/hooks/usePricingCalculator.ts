/**
 * usePricingCalculator Hook
 * 
 * React hook for managing pricing calculator state, department selections,
 * and intelligence multiplication calculations.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  DepartmentPricing, 
  PricingTier, 
  PricingCalculation,
  ROICalculation,
  CostComparison,
  PricingEvent
} from '../types'
import { 
  calculatePricing, 
  calculateROI, 
  calculateCostComparison,
  validatePricingConfiguration 
} from '../utils/pricingCalculations'

interface UsePricingCalculatorOptions {
  departments: DepartmentPricing[]
  tiers: PricingTier[]
  defaultTier?: string
  defaultDepartments?: string[]
  companyRevenue?: number
  billingPeriod?: 'monthly' | 'annual'
  onPricingChange?: (calculation: PricingCalculation) => void
  onEvent?: (event: PricingEvent) => void
  enableAnalytics?: boolean
}

interface UsePricingCalculatorReturn {
  // State
  selectedDepartments: DepartmentPricing[]
  selectedTier: PricingTier
  billingPeriod: 'monthly' | 'annual'
  
  // Calculations
  pricingCalculation: PricingCalculation | null
  roiCalculation: ROICalculation | null
  costComparison: CostComparison | null
  
  // Actions
  toggleDepartment: (departmentId: string) => void
  selectDepartments: (departmentIds: string[]) => void
  clearDepartments: () => void
  selectAllDepartments: () => void
  selectTier: (tierId: string) => void
  setBillingPeriod: (period: 'monthly' | 'annual') => void
  
  // Utilities
  isDepartmentSelected: (departmentId: string) => boolean
  canSelectDepartment: (departmentId: string) => boolean
  getRecommendedDepartments: () => string[]
  getValidationErrors: () => string[]
  
  // Analytics
  trackEvent: (eventType: string, data?: any) => void
  
  // State queries
  isValid: boolean
  hasSelections: boolean
  totalDepartments: number
  intelligenceMultiplier: number
}

export const usePricingCalculator = (
  options: UsePricingCalculatorOptions
): UsePricingCalculatorReturn => {
  const {
    departments,
    tiers,
    defaultTier = tiers[0]?.id,
    defaultDepartments = [],
    companyRevenue = 1000000,
    billingPeriod: defaultBillingPeriod = 'monthly',
    onPricingChange,
    onEvent,
    enableAnalytics = false
  } = options
  
  // Core state
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<Set<string>>(
    new Set(defaultDepartments)
  )
  const [selectedTierId, setSelectedTierId] = useState<string>(defaultTier)
  const [billingPeriod, setBillingPeriodState] = useState<'monthly' | 'annual'>(defaultBillingPeriod)
  
  // Session tracking for analytics
  const [sessionId] = useState(() => `pricing_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  
  // Derived state
  const selectedDepartments = useMemo(() => 
    departments.filter(dept => selectedDepartmentIds.has(dept.id)),
    [departments, selectedDepartmentIds]
  )
  
  const selectedTier = useMemo(() => 
    tiers.find(tier => tier.id === selectedTierId) || tiers[0],
    [tiers, selectedTierId]
  )
  
  // Calculations
  const pricingCalculation = useMemo((): PricingCalculation | null => {
    if (selectedDepartments.length === 0) return null
    
    try {
      return calculatePricing(selectedDepartments, selectedTier, billingPeriod)
    } catch (error) {
      console.error('Pricing calculation error:', error)
      return null
    }
  }, [selectedDepartments, selectedTier, billingPeriod])
  
  const roiCalculation = useMemo((): ROICalculation | null => {
    if (!pricingCalculation) return null
    
    try {
      return calculateROI(pricingCalculation, companyRevenue)
    } catch (error) {
      console.error('ROI calculation error:', error)
      return null
    }
  }, [pricingCalculation, companyRevenue])
  
  const costComparison = useMemo((): CostComparison | null => {
    if (!pricingCalculation) return null
    
    try {
      return calculateCostComparison(selectedDepartments, pricingCalculation)
    } catch (error) {
      console.error('Cost comparison error:', error)
      return null
    }
  }, [selectedDepartments, pricingCalculation])
  
  // Validation
  const { isValid, errors } = useMemo(() => 
    validatePricingConfiguration(selectedDepartments, selectedTier),
    [selectedDepartments, selectedTier]
  )
  
  // Analytics tracking
  const trackEvent = useCallback((eventType: string, data: any = {}) => {
    if (!enableAnalytics) return
    
    const event: PricingEvent = {
      type: eventType as any,
      timestamp: Date.now(),
      data: {
        ...data,
        departmentIds: Array.from(selectedDepartmentIds),
        tierId: selectedTierId,
        finalPrice: pricingCalculation?.finalPrice,
        multiplier: pricingCalculation?.intelligenceMultiplier.totalMultiplier
      },
      userSession: sessionId
    }
    
    onEvent?.(event)
  }, [enableAnalytics, selectedDepartmentIds, selectedTierId, pricingCalculation, sessionId, onEvent])
  
  // Department management actions
  const toggleDepartment = useCallback((departmentId: string) => {
    const newSelection = new Set(selectedDepartmentIds)
    
    if (newSelection.has(departmentId)) {
      newSelection.delete(departmentId)
      trackEvent('department_deselected', { departmentId })
    } else {
      newSelection.add(departmentId)
      trackEvent('department_selected', { departmentId })
    }
    
    setSelectedDepartmentIds(newSelection)
  }, [selectedDepartmentIds, trackEvent])
  
  const selectDepartments = useCallback((departmentIds: string[]) => {
    setSelectedDepartmentIds(new Set(departmentIds))
    trackEvent('departments_bulk_selected', { departmentIds })
  }, [trackEvent])
  
  const clearDepartments = useCallback(() => {
    setSelectedDepartmentIds(new Set())
    trackEvent('departments_cleared')
  }, [trackEvent])
  
  const selectAllDepartments = useCallback(() => {
    const allIds = departments.map(d => d.id)
    setSelectedDepartmentIds(new Set(allIds))
    trackEvent('all_departments_selected', { departmentIds: allIds })
  }, [departments, trackEvent])
  
  const selectTier = useCallback((tierId: string) => {
    const oldTierId = selectedTierId
    setSelectedTierId(tierId)
    trackEvent('tier_changed', { oldTierId, newTierId: tierId })
  }, [selectedTierId, trackEvent])
  
  const setBillingPeriod = useCallback((period: 'monthly' | 'annual') => {
    const oldPeriod = billingPeriod
    setBillingPeriodState(period)
    trackEvent('billing_period_changed', { oldPeriod, newPeriod: period })
  }, [billingPeriod, trackEvent])
  
  // Utility functions
  const isDepartmentSelected = useCallback((departmentId: string) => 
    selectedDepartmentIds.has(departmentId),
    [selectedDepartmentIds]
  )
  
  const canSelectDepartment = useCallback((departmentId: string) => {
    const department = departments.find(d => d.id === departmentId)
    if (!department) return false
    
    // Check if all dependencies are selected
    if (department.dependencies) {
      return department.dependencies.every(depId => selectedDepartmentIds.has(depId))
    }
    
    return true
  }, [departments, selectedDepartmentIds])
  
  const getRecommendedDepartments = useCallback((): string[] => {
    // Business logic for recommending departments based on selections
    const selected = Array.from(selectedDepartmentIds)
    const recommendations: string[] = []
    
    // If sales is selected, recommend marketing
    if (selected.includes('sales') && !selected.includes('marketing')) {
      recommendations.push('marketing')
    }
    
    // If marketing is selected, recommend sales
    if (selected.includes('marketing') && !selected.includes('sales')) {
      recommendations.push('sales')
    }
    
    // If either sales or marketing selected, recommend finance for ROI tracking
    if ((selected.includes('sales') || selected.includes('marketing')) && !selected.includes('finance')) {
      recommendations.push('finance')
    }
    
    // Operations pairs well with HR
    if (selected.includes('operations') && !selected.includes('hr')) {
      recommendations.push('hr')
    }
    
    return recommendations
  }, [selectedDepartmentIds])
  
  const getValidationErrors = useCallback(() => errors, [errors])
  
  // Notify parent of pricing changes
  useEffect(() => {
    if (pricingCalculation) {
      onPricingChange?.(pricingCalculation)
      trackEvent('calculation_complete', {
        finalPrice: pricingCalculation.finalPrice,
        multiplier: pricingCalculation.intelligenceMultiplier.totalMultiplier,
        departmentCount: selectedDepartments.length
      })
    }
  }, [pricingCalculation, onPricingChange, trackEvent, selectedDepartments.length])
  
  // Track initial load
  useEffect(() => {
    trackEvent('pricing_calculator_loaded', {
      defaultDepartments,
      defaultTier
    })
  }, []) // Only run once on mount
  
  return {
    // State
    selectedDepartments,
    selectedTier,
    billingPeriod,
    
    // Calculations
    pricingCalculation,
    roiCalculation,
    costComparison,
    
    // Actions
    toggleDepartment,
    selectDepartments,
    clearDepartments,
    selectAllDepartments,
    selectTier,
    setBillingPeriod,
    
    // Utilities
    isDepartmentSelected,
    canSelectDepartment,
    getRecommendedDepartments,
    getValidationErrors,
    
    // Analytics
    trackEvent,
    
    // State queries
    isValid,
    hasSelections: selectedDepartments.length > 0,
    totalDepartments: departments.length,
    intelligenceMultiplier: pricingCalculation?.intelligenceMultiplier.totalMultiplier || 1
  }
}

export default usePricingCalculator