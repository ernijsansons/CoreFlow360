/**
 * CoreFlow360 - Progressive Pricing Calculator
 * Interactive pricing calculator with multi-business discounts
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  calculateBusinessPricing,
  calculatePortfolioPricing,
  calculateROIComparison,
  formatPricing,
  MODULE_PRICING,
  BUNDLE_DISCOUNTS,
  ModulePricing,
  PricingCalculation,
  BusinessSubscription
} from '@/lib/pricing'
import {
  Users,
  Building2,
  Calculator,
  TrendingDown,
  Star,
  Check,
  Plus,
  Minus,
  Zap,
  Target,
  Award,
  Sparkles,
  ArrowRight,
  Info,
  DollarSign,
  Percent,
  Crown
} from 'lucide-react'

interface PricingCalculatorProps {
  onPricingChange?: (calculation: PricingCalculation) => void
  showMultiBusiness?: boolean
  className?: string
}

const INDUSTRIES = [
  'GENERAL',
  'MANUFACTURING',
  'LEGAL',
  'HEALTHCARE',
  'CONSTRUCTION',
  'CONSULTING',
  'RETAIL',
  'FINANCE',
  'REAL_ESTATE'
]

export function PricingCalculator({
  onPricingChange,
  showMultiBusiness = true,
  className = ''
}: PricingCalculatorProps) {
  const [userCount, setUserCount] = useState(5)
  const [selectedModules, setSelectedModules] = useState(['crm', 'accounting'])
  const [industry, setIndustry] = useState('GENERAL')
  const [businesses, setBusinesses] = useState<BusinessSubscription[]>([
    {
      tenantId: '1',
      businessName: 'Primary Business',
      userCount: 5,
      selectedModules: ['crm', 'accounting'],
      billingOrder: 1,
      discountRate: 0,
      monthlyTotal: 0,
      industry: 'GENERAL'
    }
  ])
  const [activeTab, setActiveTab] = useState<'single' | 'portfolio'>('single')
  const [showDetails, setShowDetails] = useState(false)

  // Calculate single business pricing
  const singleBusinessCalculation = calculateBusinessPricing(
    userCount,
    selectedModules,
    1,
    industry
  )

  // Calculate portfolio pricing
  const portfolioCalculation = calculatePortfolioPricing(businesses)

  // Calculate ROI comparison
  const roiComparison = calculateROIComparison(
    activeTab === 'single' ? singleBusinessCalculation.finalPrice : portfolioCalculation.totalFinalPrice,
    activeTab === 'single' ? userCount : businesses.reduce((sum, b) => sum + b.userCount, 0)
  )

  useEffect(() => {
    if (onPricingChange) {
      onPricingChange(singleBusinessCalculation)
    }
  }, [singleBusinessCalculation, onPricingChange])

  const toggleModule = (moduleKey: string) => {
    if (activeTab === 'single') {
      setSelectedModules(prev => 
        prev.includes(moduleKey) 
          ? prev.filter(m => m !== moduleKey)
          : [...prev, moduleKey]
      )
    } else {
      // Update first business in portfolio
      setBusinesses(prev => prev.map((business, index) => 
        index === 0 ? {
          ...business,
          selectedModules: business.selectedModules.includes(moduleKey)
            ? business.selectedModules.filter(m => m !== moduleKey)
            : [...business.selectedModules, moduleKey]
        } : business
      ))
    }
  }

  const addBusiness = () => {
    const newBusiness: BusinessSubscription = {
      tenantId: `${businesses.length + 1}`,
      businessName: `Business ${businesses.length + 1}`,
      userCount: 3,
      selectedModules: ['crm'],
      billingOrder: businesses.length + 1,
      discountRate: 0,
      monthlyTotal: 0,
      industry: 'GENERAL'
    }
    setBusinesses([...businesses, newBusiness])
  }

  const removeBusiness = (index: number) => {
    if (businesses.length > 1) {
      setBusinesses(businesses.filter((_, i) => i !== index))
    }
  }

  const updateBusiness = (index: number, updates: Partial<BusinessSubscription>) => {
    setBusinesses(prev => prev.map((business, i) => 
      i === index ? { ...business, ...updates } : business
    ))
  }

  const getModulesByCategory = () => {
    const categories = MODULE_PRICING.reduce((acc, module) => {
      if (!acc[module.category]) acc[module.category] = []
      acc[module.category].push(module)
      return acc
    }, {} as Record<string, ModulePricing[]>)
    
    return categories
  }

  const modulesByCategory = getModulesByCategory()
  const currentModules = activeTab === 'single' ? selectedModules : businesses[0]?.selectedModules || []

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Pricing Calculator
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Calculate your savings with progressive multi-business discounts
        </p>
      </div>

      {/* Mode Selector */}
      {showMultiBusiness && (
        <div className="flex items-center justify-center">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('single')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'single'
                  ? 'bg-white dark:bg-gray-600 text-purple-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4 inline mr-2" />
              Single Business
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'portfolio'
                  ? 'bg-white dark:bg-gray-600 text-purple-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Crown className="w-4 h-4 inline mr-2" />
              Multi-Business Portfolio
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Configuration */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Business Configuration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Users
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => activeTab === 'single' ? 
                      setUserCount(Math.max(1, userCount - 1)) :
                      updateBusiness(0, { userCount: Math.max(1, businesses[0].userCount - 1) })
                    }
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="flex-1 text-center">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {activeTab === 'single' ? userCount : businesses[0]?.userCount || 5}
                    </span>
                  </div>
                  <button
                    onClick={() => activeTab === 'single' ? 
                      setUserCount(userCount + 1) :
                      updateBusiness(0, { userCount: businesses[0].userCount + 1 })
                    }
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Industry
                </label>
                <select
                  value={activeTab === 'single' ? industry : businesses[0]?.industry || 'GENERAL'}
                  onChange={(e) => activeTab === 'single' ? 
                    setIndustry(e.target.value) :
                    updateBusiness(0, { industry: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  {INDUSTRIES.map(ind => (
                    <option key={ind} value={ind}>
                      {ind.toLowerCase().replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Module Selection */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Select Modules
              </h4>
              
              {Object.entries(modulesByCategory).map(([category, modules]) => (
                <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-3 capitalize">
                    {category} Modules
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {modules.map(module => {
                      const isSelected = currentModules.includes(module.moduleKey)
                      const isDisabled = module.dependencies?.some(dep => !currentModules.includes(dep))
                      
                      return (
                        <motion.button
                          key={module.moduleKey}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => !isDisabled && toggleModule(module.moduleKey)}
                          disabled={isDisabled}
                          className={`p-3 rounded-lg border-2 transition-all text-left ${
                            isSelected
                              ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                              : isDisabled
                              ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 opacity-50 cursor-not-allowed'
                              : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white text-sm">
                                {module.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {formatPricing(module.basePrice)}/mo + {formatPricing(module.perUserPrice)}/user
                              </p>
                              {module.dependencies && (
                                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                  Requires: {module.dependencies.join(', ')}
                                </p>
                              )}
                            </div>
                            <div className="ml-2">
                              {isSelected && <Check className="w-5 h-5 text-purple-600" />}
                            </div>
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio Configuration */}
          {activeTab === 'portfolio' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Business Portfolio
                </h3>
                <button
                  onClick={addBusiness}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Business</span>
                </button>
              </div>

              <div className="space-y-4">
                {businesses.map((business, index) => (
                  <div key={business.tenantId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {index === 0 ? (
                            <Crown className="w-5 h-5 text-yellow-500" />
                          ) : (
                            <Building2 className="w-5 h-5 text-gray-400" />
                          )}
                          <input
                            type="text"
                            value={business.businessName}
                            onChange={(e) => updateBusiness(index, { businessName: e.target.value })}
                            className="font-medium bg-transparent border-none focus:ring-2 focus:ring-purple-500 rounded px-2 py-1"
                          />
                        </div>
                        {index > 0 && (
                          <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                            -{Math.round(portfolioCalculation.businessBreakdown[index]?.discountRate * 100 || 0)}% discount
                          </span>
                        )}
                      </div>
                      {businesses.length > 1 && (
                        <button
                          onClick={() => removeBusiness(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Users
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={business.userCount}
                          onChange={(e) => updateBusiness(index, { userCount: parseInt(e.target.value) || 1 })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Monthly Cost
                        </label>
                        <p className="text-lg font-bold text-gray-900 dark:text-white py-2">
                          {formatPricing(portfolioCalculation.businessBreakdown[index]?.finalPrice || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pricing Summary */}
        <div className="space-y-6">
          {/* Main Price Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl p-6 text-white"
          >
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold mb-2">
                {activeTab === 'single' ? 'Monthly Total' : 'Portfolio Total'}
              </h3>
              <div className="text-4xl font-bold mb-2">
                {formatPricing(
                  activeTab === 'single' 
                    ? singleBusinessCalculation.finalPrice 
                    : portfolioCalculation.totalFinalPrice
                )}
              </div>
              <p className="text-purple-100 text-sm">per month</p>
            </div>

            {/* Discount Badge */}
            {((activeTab === 'single' && singleBusinessCalculation.discountRate > 0) ||
              (activeTab === 'portfolio' && portfolioCalculation.averageDiscountRate > 0)) && (
              <div className="bg-white/20 rounded-lg p-3 text-center mb-4">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <TrendingDown className="w-5 h-5" />
                  <span className="font-semibold">
                    {Math.round((activeTab === 'single' 
                      ? singleBusinessCalculation.discountRate 
                      : portfolioCalculation.averageDiscountRate) * 100)}% Discount Applied
                  </span>
                </div>
                <p className="text-sm text-purple-100">
                  You save {formatPricing(
                    activeTab === 'single' 
                      ? singleBusinessCalculation.savings 
                      : portfolioCalculation.totalMonthlySavings
                  )} per month!
                </p>
              </div>
            )}

            {/* ROI Comparison */}
            <div className="bg-white/10 rounded-lg p-3">
              <h4 className="font-semibold mb-2 text-center">vs Traditional ERP</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>CoreFlow360:</span>
                  <span className="font-semibold">{formatPricing(roiComparison.coreflow360)}</span>
                </div>
                <div className="flex justify-between">
                  <span>NetSuite equiv:</span>
                  <span>{formatPricing(roiComparison.netsuiteEquivalent)}</span>
                </div>
                <div className="flex justify-between border-t border-white/20 pt-2">
                  <span>Monthly Savings:</span>
                  <span className="font-bold text-green-200">
                    {formatPricing(roiComparison.savings)}
                  </span>
                </div>
                <div className="text-center">
                  <span className="inline-flex items-center px-2 py-1 bg-green-500/20 rounded-full text-xs">
                    <Award className="w-3 h-3 mr-1" />
                    {roiComparison.savingsPercent.toFixed(0)}% cheaper
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Progressive Discount Explanation */}
          {activeTab === 'portfolio' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Progressive Discounts
              </h3>
              <div className="space-y-3">
                {[
                  { business: '2nd Business', discount: 20 },
                  { business: '3rd Business', discount: 35 },
                  { business: '4th Business', discount: 45 },
                  { business: '5th+ Business', discount: 50 }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {item.business}
                    </span>
                    <span className="text-sm font-bold text-green-600">
                      {item.discount}% off
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bundle Recommendations */}
          {singleBusinessCalculation.bundleRecommendation && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-l-4 border-yellow-500">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Bundle Recommendation
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Save more with our {BUNDLE_DISCOUNTS[singleBusinessCalculation.bundleRecommendation]?.name}
              </p>
              <button className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
                View Bundle Details
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}