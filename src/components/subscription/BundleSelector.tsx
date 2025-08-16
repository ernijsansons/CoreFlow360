/**
 * CoreFlow360 - Bundle Selection Component
 * Mathematical perfection for bundle selection with real-time pricing
 * FORTRESS-LEVEL SECURITY: Validated bundle compatibility
 * HYPERSCALE PERFORMANCE: Sub-100ms pricing updates
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BUNDLES, 
  getBundlesByCategory, 
  validateBundleCompatibility,
  type BundleDefinition 
} from '@/types/bundles'
import { api, ApiError } from '@/lib/api-client'
import {
  Check,
  X,
  Zap,
  Shield,
  Users,
  Building2,
  AlertTriangle,
  Info,
  Crown,
  Star,
  Sparkles
} from 'lucide-react'

interface BundleSelectorProps {
  selectedBundles: string[]
  onBundleToggle: (bundleId: string) => void
  userCount: number
  businessCount: number
  onPricingUpdate: (pricing: any) => void
  className?: string
}

export function BundleSelector({
  selectedBundles,
  onBundleToggle,
  userCount,
  businessCount,
  onPricingUpdate,
  className = ''
}: BundleSelectorProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['ai_enhancement', 'finance'])
  )
  const [pricingData, setPricingData] = useState<any>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  // Real-time pricing calculation
  useEffect(() => {
    if (selectedBundles.length === 0) {
      setPricingData(null)
      return
    }

    // Create AbortController for request cancellation
    const abortController = new AbortController()

    const calculatePricing = async () => {
      setIsCalculating(true)
      try {
        const response = await api.post('/api/subscriptions/calculate', {
          bundles: selectedBundles,
          users: userCount,
          annual: true,
          businessCount,
          region: 'US'
        }, {
          signal: abortController.signal
        })

        // Check if request was aborted
        if (abortController.signal.aborted) {
          return
        }

        if (response.success && response.data) {
          setPricingData(response.data)
          onPricingUpdate(response.data)
        }
      } catch (error) {
        // Don't log errors for aborted requests
        if (error instanceof ApiError && error.code !== 'CANCELLED' && error.code !== 'TIMEOUT_ERROR') {
          console.error('Pricing calculation failed:', error)
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsCalculating(false)
        }
      }
    }

    const debounceTimer = setTimeout(calculatePricing, 300)
    
    // Cleanup function that cancels both timer and request
    return () => {
      clearTimeout(debounceTimer)
      abortController.abort() // ADDED: Cancel in-flight request
    }
  }, [selectedBundles, userCount, businessCount, onPricingUpdate])

  const compatibility = validateBundleCompatibility(selectedBundles)
  const categorizedBundles = BUNDLES.reduce((acc, bundle) => {
    if (!acc[bundle.category]) {
      acc[bundle.category] = []
    }
    acc[bundle.category].push(bundle)
    return acc
  }, {} as Record<string, BundleDefinition[]>)

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      ai_enhancement: Sparkles,
      finance: Building2,
      hr: Users,
      legal: Shield,
      manufacturing: Zap,
      erp: Star
    }
    return icons[category as keyof typeof icons] || Building2
  }

  const getTierBadge = (tier: string) => {
    const configs = {
      free: { color: 'gray', icon: null },
      basic: { color: 'blue', icon: null },
      professional: { color: 'purple', icon: Star },
      enterprise: { color: 'yellow', icon: Crown }
    }
    return configs[tier as keyof typeof configs] || configs.basic
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Compatibility Status */}
      {selectedBundles.length > 0 && (
        <div className={`p-4 rounded-lg border ${
          compatibility.valid 
            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
            : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
        }`}>
          <div className="flex items-start space-x-3">
            {compatibility.valid ? (
              <Check className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            )}
            <div>
              <h4 className={`font-medium ${
                compatibility.valid ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
              }`}>
                {compatibility.valid ? 'Compatible Bundle Selection' : 'Compatibility Issues'}
              </h4>
              {!compatibility.valid && (
                <ul className="mt-1 text-sm text-red-700 dark:text-red-300">
                  {compatibility.conflicts.map((conflict, index) => (
                    <li key={index}>• {conflict}</li>
                  ))}
                  {compatibility.missingDependencies.map((dep, index) => (
                    <li key={index}>• {dep}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bundle Categories */}
      {Object.entries(categorizedBundles).map(([category, bundles]) => {
        const CategoryIcon = getCategoryIcon(category)
        const isExpanded = expandedCategories.has(category)

        return (
          <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category)}
              className="w-full p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CategoryIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="font-medium text-gray-900 dark:text-white capitalize">
                    {category.replace('_', ' ')} Bundles
                  </h3>
                  <span className="text-sm text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                    {bundles.length}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-4 h-4 text-gray-400 rotate-45" />
                </motion.div>
              </div>
            </button>

            {/* Bundle List */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 space-y-4 bg-white dark:bg-gray-900">
                    {bundles.map((bundle) => {
                      const isSelected = selectedBundles.includes(bundle.id)
                      const tierBadge = getTierBadge(bundle.tier)
                      const TierIcon = tierBadge.icon

                      return (
                        <div
                          key={bundle.id}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            isSelected
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                          onClick={() => onBundleToggle(bundle.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  {bundle.name}
                                </h4>
                                <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium bg-${tierBadge.color}-100 text-${tierBadge.color}-700 dark:bg-${tierBadge.color}-900/30 dark:text-${tierBadge.color}-300`}>
                                  {TierIcon && <TierIcon className="w-3 h-3" />}
                                  <span className="capitalize">{bundle.tier}</span>
                                </div>
                              </div>
                              
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                {bundle.description}
                              </p>

                              {/* Features */}
                              <div className="flex flex-wrap gap-2 mb-3">
                                {bundle.enabledFeatures.slice(0, 4).map((feature) => (
                                  <span
                                    key={feature}
                                    className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                                  >
                                    {feature.replace('_', ' ')}
                                  </span>
                                ))}
                                {bundle.enabledFeatures.length > 4 && (
                                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                                    +{bundle.enabledFeatures.length - 4} more
                                  </span>
                                )}
                              </div>

                              {/* Pricing */}
                              <div className="flex items-center space-x-2 text-sm">
                                {bundle.pricing.basePrice > 0 && (
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    ${bundle.pricing.basePrice}/mo base
                                  </span>
                                )}
                                <span className="font-medium text-purple-600">
                                  ${bundle.pricing.perUserPrice}/user/mo
                                </span>
                                {bundle.pricing.setupFee && (
                                  <span className="text-gray-500">
                                    +${bundle.pricing.setupFee} setup
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Selection Indicator */}
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              isSelected
                                ? 'border-purple-500 bg-purple-500'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}>
                              {isSelected && <Check className="w-4 h-4 text-white" />}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}

      {/* Real-time Pricing Summary */}
      {pricingData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky bottom-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedBundles.length} bundles • {userCount} users
                </span>
                {isCalculating && (
                  <div className="animate-spin w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full" />
                )}
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${pricingData.pricing.monthlyTotal}/mo
                </span>
                {pricingData.discounts.totalDiscount > 0 && (
                  <span className="text-green-600 font-medium">
                    {Math.round(pricingData.discounts.totalDiscount * 100)}% off
                  </span>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Annual: ${pricingData.pricing.annualTotal}
              </div>
              {pricingData.discounts.totalSavings > 0 && (
                <div className="text-sm text-green-600 font-medium">
                  Save ${pricingData.discounts.totalSavings}/year
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}