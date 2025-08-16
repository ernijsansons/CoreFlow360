/**
 * CoreFlow360 - Module Selection Dashboard
 * Professional UI for selecting and managing ERP modules with Stripe integration
 */

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Module {
  moduleKey: string
  name: string
  description: string
  category: string
  pricing: {
    basePrice: number
    perUserPrice: number
    setupFee: number | null
  }
  features: {
    aiCapabilities: Record<string, boolean>
    featureFlags: Record<string, boolean>
  }
  constraints: {
    minUserCount: number
    maxUserCount?: number
    enterpriseOnly: boolean
  }
  dependencies: string[]
  isPopular?: boolean
}

interface Bundle {
  bundleKey: string
  name: string
  description: string
  isPopular: boolean
  pricing: {
    perUserPrice: number
    calculatedPrice?: number
    savings?: number
    savingsPercentage?: number
  }
  modules: {
    included: Array<{
      moduleKey: string
      name: string
      category: string
    }>
  }
}

interface ModuleSelectionDashboardProps {
  tenantId?: string
  currentModules?: string[]
  userCount?: number
  onModuleChange?: (modules: string[]) => void
  onCheckout?: (selection: any) => void
}

const ModuleSelectionDashboard: React.FC<ModuleSelectionDashboardProps> = ({
  tenantId,
  currentModules = [],
  userCount = 1,
  onModuleChange,
  onCheckout
}) => {
  const [selectedModules, setSelectedModules] = useState<string[]>(currentModules)
  const [availableModules, setAvailableModules] = useState<Module[]>([])
  const [availableBundles, setAvailableBundles] = useState<Bundle[]>([])
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null)
  const [pricingCalculation, setPricingCalculation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'modules' | 'bundles'>('bundles')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

  // Fetch available modules and bundles
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch modules
        const modulesResponse = await fetch('/api/pricing/modules')
        const modulesData = await modulesResponse.json()
        setAvailableModules(modulesData.modules || [])

        // Fetch bundles
        const bundlesResponse = await fetch(`/api/pricing/bundles?userCount=${userCount}`)
        const bundlesData = await bundlesResponse.json()
        setAvailableBundles(bundlesData.bundles || [])

      } catch (error) {
        console.error('Error fetching pricing data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userCount])

  // Calculate pricing when selection changes
  useEffect(() => {
    const calculatePricing = async () => {
      if (selectedModules.length === 0) {
        setPricingCalculation(null)
        return
      }

      try {
        const response = await fetch('/api/pricing/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            modules: selectedModules,
            userCount,
            billingCycle,
            applyBundleDiscounts: true
          })
        })

        const calculation = await response.json()
        setPricingCalculation(calculation)
      } catch (error) {
        console.error('Error calculating pricing:', error)
      }
    }

    if (selectedModules.length > 0) {
      calculatePricing()
    }
  }, [selectedModules, userCount, billingCycle])

  const handleModuleToggle = (moduleKey: string) => {
    const newSelection = selectedModules.includes(moduleKey)
      ? selectedModules.filter(m => m !== moduleKey)
      : [...selectedModules, moduleKey]
    
    setSelectedModules(newSelection)
    setSelectedBundle(null) // Clear bundle selection when manually selecting modules
    onModuleChange?.(newSelection)
  }

  const handleBundleSelect = (bundleKey: string) => {
    const bundle = availableBundles.find(b => b.bundleKey === bundleKey)
    if (bundle) {
      const bundleModules = bundle.modules.included.map(m => m.moduleKey)
      setSelectedModules(bundleModules)
      setSelectedBundle(bundleKey)
      onModuleChange?.(bundleModules)
    }
  }

  const handleCheckout = () => {
    const selection = {
      modules: selectedModules,
      bundle: selectedBundle,
      userCount,
      billingCycle,
      pricing: pricingCalculation,
      tenantId
    }
    
    onCheckout?.(selection)
  }

  const handleDirectStripeCheckout = async () => {
    if (selectedModules.length === 0 || !pricingCalculation) {
      alert('Please select at least one module first')
      return
    }

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: tenantId || `demo-${Date.now()}`,
          modules: selectedModules,
          bundleKey: selectedBundle || undefined,
          userCount,
          billingCycle,
          customerEmail: 'demo@coreflow360.com', // In production, get from form
          customerName: 'Demo User',
          companyName: 'Demo Company',
          successUrl: `${window.location.origin}/subscription/success`,
          cancelUrl: `${window.location.origin}/subscription/cancelled`
        })
      })

      const data = await response.json()

      if (data.success && data.sessionUrl) {
        window.location.href = data.sessionUrl
      } else {
        throw new Error(data.error || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert(`Checkout failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'core': '⚡',
      'advanced': '🚀',
      'industry': '🏭',
      'integration': '🔗'
    }
    return icons[category] || '📦'
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Choose Your ERP Modules
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Build your perfect ERP solution with our modular pricing. Pay only for what you need, upgrade as you grow.
        </p>
      </div>

      {/* View Toggle */}
      <div className="flex justify-center">
        <div className="bg-gray-100 p-1 rounded-lg flex">
          <button
            onClick={() => setView('bundles')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              view === 'bundles'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            💎 Popular Bundles
          </button>
          <button
            onClick={() => setView('modules')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              view === 'modules'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🧩 Individual Modules
          </button>
        </div>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center">
        <div className="bg-gray-100 p-1 rounded-lg flex">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              billingCycle === 'annual'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Annual <span className="text-green-600 text-sm">(Save 10%)</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'bundles' ? (
          <motion.div
            key="bundles"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {availableBundles.map((bundle) => (
              <motion.div
                key={bundle.bundleKey}
                whileHover={{ scale: 1.02 }}
                className={`relative bg-white rounded-xl shadow-lg border-2 cursor-pointer transition-all ${
                  selectedBundle === bundle.bundleKey
                    ? 'border-blue-500 shadow-blue-200'
                    : 'border-gray-200 hover:border-blue-300'
                } ${bundle.isPopular ? 'ring-2 ring-purple-500 ring-opacity-20' : ''}`}
                onClick={() => handleBundleSelect(bundle.bundleKey)}
              >
                {bundle.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      🔥 Most Popular
                    </span>
                  </div>
                )}
                
                <div className="p-6 space-y-4">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900">{bundle.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{bundle.description}</p>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">
                      {formatPrice(bundle.pricing.perUserPrice)}
                    </div>
                    <div className="text-sm text-gray-500">per user per month</div>
                    {bundle.pricing.savings && (
                      <div className="text-green-600 font-medium">
                        Save {formatPrice(bundle.pricing.savings)} ({bundle.pricing.savingsPercentage}%)
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Included Modules:</div>
                    {bundle.modules.included.map((module) => (
                      <div key={module.moduleKey} className="flex items-center text-sm text-gray-600">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        {module.name}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="modules"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {availableModules.map((module) => (
              <motion.div
                key={module.moduleKey}
                whileHover={{ scale: 1.02 }}
                className={`bg-white rounded-xl shadow-lg border-2 cursor-pointer transition-all ${
                  selectedModules.includes(module.moduleKey)
                    ? 'border-blue-500 shadow-blue-200'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => handleModuleToggle(module.moduleKey)}
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getCategoryIcon(module.category)}</span>
                      <div>
                        <h3 className="font-bold text-gray-900">{module.name}</h3>
                        <span className="text-xs text-gray-500 capitalize">{module.category}</span>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selectedModules.includes(module.moduleKey)
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedModules.includes(module.moduleKey) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600">{module.description}</p>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatPrice(module.pricing.perUserPrice)}
                    </div>
                    <div className="text-sm text-gray-500">per user per month</div>
                    {module.pricing.setupFee && (
                      <div className="text-xs text-gray-400">
                        + {formatPrice(module.pricing.setupFee)} setup fee
                      </div>
                    )}
                  </div>

                  {module.constraints.enterpriseOnly && (
                    <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs text-center">
                      Enterprise Only
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pricing Summary */}
      {pricingCalculation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">Pricing Summary</h3>
              <div className="text-sm text-gray-600">
                {selectedModules.length} module{selectedModules.length !== 1 ? 's' : ''} • {userCount} user{userCount !== 1 ? 's' : ''} • {billingCycle} billing
              </div>
              
              {pricingCalculation.discounts?.length > 0 && (
                <div className="space-y-1">
                  {pricingCalculation.discounts.map((discount: any, index: number) => (
                    <div key={index} className="text-sm text-green-600">
                      ✓ {discount.description}: -{formatPrice(discount.amount)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="text-right space-y-2">
              <div className="text-3xl font-bold text-gray-900">
                {formatPrice(billingCycle === 'annual' ? pricingCalculation.totalAnnualPrice : pricingCalculation.totalMonthlyPrice)}
              </div>
              <div className="text-sm text-gray-500">
                {billingCycle === 'annual' ? 'per year' : 'per month'}
              </div>
              {pricingCalculation.billingDetails.setupFeesTotal > 0 && (
                <div className="text-sm text-gray-600">
                  + {formatPrice(pricingCalculation.billingDetails.setupFeesTotal)} one-time setup
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              {onCheckout && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCheckout}
                  className="flex-1 border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-blue-50 transition-all"
                >
                  Custom Checkout
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDirectStripeCheckout}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
              >
                Subscribe Now 🚀
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default ModuleSelectionDashboard