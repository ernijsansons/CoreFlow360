/**
 * CoreFlow360 - Module Selection with AI Component
 * Third step in user onboarding - intelligent module selection with pricing and Stripe integration
 */

'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingCart,
  Users,
  DollarSign,
  Calendar,
  BarChart3,
  MessageSquare,
  Package,
  FileText,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Star,
  Sparkles,
  TrendingUp,
  Target,
  Brain,
  Plus,
  Minus,
  Crown,
  Gift
} from 'lucide-react'
import { GlowingButton } from '@/components/ui/GlowingButton'
import { CompanyInfo } from './CompanySetupWizard'
import { UserRole } from './WelcomeRoleSelection'
import { useTrackEvent } from '@/components/analytics/AnalyticsProvider'

export interface ModuleConfig {
  id: string
  name: string
  description: string
  longDescription: string
  icon: any
  color: string
  gradient: string
  basePrice: number
  features: string[]
  aiCapabilities: string[]
  popularity: number
  category: 'core' | 'sales' | 'operations' | 'analytics' | 'collaboration'
  recommendedFor: string[]
  requiredModules?: string[]
}

interface ModuleSelectionWithAIProps {
  onModulesSelected: (modules: string[], totalPrice: number) => void
  onBack: () => void
  userRole: UserRole
  companyInfo: CompanyInfo
  userEmail?: string
}

const availableModules: ModuleConfig[] = [
  {
    id: 'crm',
    name: 'CRM & Sales',
    description: 'Customer relationship management and sales pipeline',
    longDescription: 'Complete CRM solution with AI-powered lead scoring, automated follow-ups, and sales forecasting.',
    icon: Users,
    color: 'text-blue-400',
    gradient: 'from-blue-500 to-cyan-600',
    basePrice: 12,
    features: ['Contact Management', 'Deal Pipeline', 'Sales Automation', 'Lead Scoring'],
    aiCapabilities: ['Predictive Lead Scoring', 'Sales Forecasting', 'Customer Insights'],
    popularity: 95,
    category: 'core',
    recommendedFor: ['sales', 'consulting', 'technology', 'manufacturing']
  },
  {
    id: 'accounting',
    name: 'Accounting & Finance',
    description: 'Financial management and accounting automation',
    longDescription: 'Comprehensive accounting suite with AI-driven expense categorization and financial forecasting.',
    icon: DollarSign,
    color: 'text-green-400',
    gradient: 'from-green-500 to-emerald-600',
    basePrice: 15,
    features: ['General Ledger', 'Invoicing', 'Expense Tracking', 'Financial Reports'],
    aiCapabilities: ['Expense Categorization', 'Cash Flow Prediction', 'Anomaly Detection'],
    popularity: 88,
    category: 'core',
    recommendedFor: ['finance', 'retail', 'consulting', 'manufacturing']
  },
  {
    id: 'project',
    name: 'Project Management',
    description: 'Project planning, tracking, and team collaboration',
    longDescription: 'Advanced project management with AI-powered resource allocation and timeline optimization.',
    icon: Target,
    color: 'text-purple-400',
    gradient: 'from-purple-500 to-violet-600',
    basePrice: 10,
    features: ['Task Management', 'Gantt Charts', 'Resource Planning', 'Time Tracking'],
    aiCapabilities: ['Resource Optimization', 'Risk Prediction', 'Timeline Estimation'],
    popularity: 82,
    category: 'operations',
    recommendedFor: ['construction', 'technology', 'consulting', 'education']
  },
  {
    id: 'inventory',
    name: 'Inventory Management',
    description: 'Stock control, warehouse management, and supply chain',
    longDescription: 'Smart inventory system with AI-powered demand forecasting and automated reordering.',
    icon: Package,
    color: 'text-orange-400',
    gradient: 'from-orange-500 to-red-600',
    basePrice: 8,
    features: ['Stock Management', 'Warehouse Control', 'Purchase Orders', 'Supplier Management'],
    aiCapabilities: ['Demand Forecasting', 'Optimal Reordering', 'Supply Chain Insights'],
    popularity: 75,
    category: 'operations',
    recommendedFor: ['retail', 'manufacturing', 'healthcare']
  },
  {
    id: 'hr',
    name: 'Human Resources',
    description: 'Employee management, payroll, and performance tracking',
    longDescription: 'Complete HR suite with AI-powered recruitment assistance and performance analytics.',
    icon: Users,
    color: 'text-pink-400',
    gradient: 'from-pink-500 to-rose-600',
    basePrice: 11,
    features: ['Employee Records', 'Payroll Management', 'Leave Management', 'Performance Reviews'],
    aiCapabilities: ['Resume Screening', 'Performance Prediction', 'Salary Benchmarking'],
    popularity: 70,
    category: 'core',
    recommendedFor: ['technology', 'healthcare', 'education', 'manufacturing']
  },
  {
    id: 'analytics',
    name: 'Business Intelligence',
    description: 'Advanced analytics, reporting, and data visualization',
    longDescription: 'Comprehensive BI platform with AI-driven insights and predictive analytics.',
    icon: BarChart3,
    color: 'text-cyan-400',
    gradient: 'from-cyan-500 to-blue-600',
    basePrice: 18,
    features: ['Interactive Dashboards', 'Custom Reports', 'Data Visualization', 'KPI Tracking'],
    aiCapabilities: ['Trend Analysis', 'Predictive Modeling', 'Automated Insights'],
    popularity: 65,
    category: 'analytics',
    recommendedFor: ['finance', 'retail', 'technology', 'consulting']
  },
  {
    id: 'marketing',
    name: 'Marketing Automation',
    description: 'Email campaigns, lead nurturing, and marketing analytics',
    longDescription: 'AI-powered marketing platform with automated campaigns and customer journey optimization.',
    icon: TrendingUp,
    color: 'text-yellow-400',
    gradient: 'from-yellow-500 to-orange-600',
    basePrice: 14,
    features: ['Email Campaigns', 'Lead Nurturing', 'Social Media Management', 'Marketing Analytics'],
    aiCapabilities: ['Campaign Optimization', 'Customer Segmentation', 'Content Personalization'],
    popularity: 60,
    category: 'sales',
    recommendedFor: ['retail', 'technology', 'consulting']
  },
  {
    id: 'support',
    name: 'Customer Support',
    description: 'Help desk, ticketing system, and customer service',
    longDescription: 'Intelligent customer support system with AI-powered ticket routing and response suggestions.',
    icon: MessageSquare,
    color: 'text-indigo-400',
    gradient: 'from-indigo-500 to-purple-600',
    basePrice: 9,
    features: ['Ticket Management', 'Knowledge Base', 'Live Chat', 'Customer Portal'],
    aiCapabilities: ['Smart Routing', 'Response Suggestions', 'Sentiment Analysis'],
    popularity: 55,
    category: 'collaboration',
    recommendedFor: ['technology', 'retail', 'healthcare']
  }
]

const bundleOffers = [
  {
    id: 'starter',
    name: 'Starter Bundle',
    description: 'Perfect for small businesses getting started',
    modules: ['crm', 'accounting', 'project'],
    discount: 15,
    icon: Gift,
    color: 'text-emerald-400',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'growth',
    name: 'Growth Bundle',
    description: 'Ideal for growing companies with multiple departments',
    modules: ['crm', 'accounting', 'project', 'hr', 'inventory'],
    discount: 25,
    icon: TrendingUp,
    color: 'text-blue-400',
    gradient: 'from-blue-500 to-cyan-600'
  },
  {
    id: 'enterprise',
    name: 'Enterprise Bundle',
    description: 'Complete solution for large organizations',
    modules: ['crm', 'accounting', 'project', 'hr', 'inventory', 'analytics', 'marketing', 'support'],
    discount: 35,
    icon: Crown,
    color: 'text-violet-400',
    gradient: 'from-violet-500 to-purple-600'
  }
]

export function ModuleSelectionWithAI({
  onModulesSelected,
  onBack,
  userRole,
  companyInfo,
  userEmail
}: ModuleSelectionWithAIProps) {
  const [selectedModules, setSelectedModules] = useState<string[]>([])
  const [userCount, setUserCount] = useState(10)
  const [showAIRecommendations, setShowAIRecommendations] = useState(true)
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null)
  const { trackModuleSelection, trackPricingCalculation } = useTrackEvent()

  // AI-powered module recommendations based on company profile
  const aiRecommendedModules = useMemo(() => {
    const industryModules = availableModules.filter(module => 
      module.recommendedFor.includes(companyInfo.industry)
    )
    
    const sizeBasedRecommendations = companyInfo.size === 'startup' || companyInfo.size === 'small' 
      ? ['crm', 'accounting', 'project']
      : companyInfo.size === 'medium'
      ? ['crm', 'accounting', 'project', 'hr', 'inventory']
      : ['crm', 'accounting', 'project', 'hr', 'inventory', 'analytics']

    const recommended = new Set([
      ...industryModules.map(m => m.id),
      ...sizeBasedRecommendations
    ])

    return Array.from(recommended).slice(0, 4)
  }, [companyInfo])

  // Set initial recommendations
  useEffect(() => {
    if (selectedModules.length === 0) {
      setSelectedModules(aiRecommendedModules.slice(0, 3))
    }
  }, [aiRecommendedModules, selectedModules.length])

  // Calculate pricing
  const pricingCalculation = useMemo(() => {
    const moduleTotal = selectedModules.reduce((sum, moduleId) => {
      const module = availableModules.find(m => m.id === moduleId)
      return sum + (module?.basePrice || 0)
    }, 0)

    let discount = 0
    if (selectedBundle) {
      const bundle = bundleOffers.find(b => b.id === selectedBundle)
      discount = bundle?.discount || 0
    }

    const subtotal = moduleTotal * userCount
    const discountAmount = (subtotal * discount) / 100
    const total = subtotal - discountAmount

    return {
      moduleTotal,
      subtotal,
      discount,
      discountAmount,
      total,
      pricePerUser: total / userCount
    }
  }, [selectedModules, userCount, selectedBundle])

  const handleModuleToggle = (moduleId: string) => {
    setSelectedModules(prev => {
      const newModules = prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
      
      trackModuleSelection(moduleId, availableModules.find(m => m.id === moduleId)?.basePrice || 0)
      return newModules
    })
    setSelectedBundle(null) // Clear bundle selection when manually selecting modules
  }

  const handleBundleSelect = (bundleId: string) => {
    const bundle = bundleOffers.find(b => b.id === bundleId)
    if (bundle) {
      setSelectedModules(bundle.modules)
      setSelectedBundle(bundleId)
    }
  }

  const handleContinue = () => {
    trackPricingCalculation(pricingCalculation.total, selectedModules)
    onModulesSelected(selectedModules, pricingCalculation.total)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black p-4">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 pt-8"
        >
          <div className="inline-flex items-center gap-2 bg-violet-900/30 border border-violet-500/50 px-6 py-3 rounded-full mb-8">
            <Brain className="w-5 h-5 text-violet-400" />
            <span className="text-violet-300 font-semibold">AI-Powered Module Selection</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your Perfect Setup
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Based on your {companyInfo.industry} industry and {companyInfo.size} company size, 
            our AI recommends these modules to maximize your productivity.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Module Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Recommendations */}
            <AnimatePresence>
              {showAIRecommendations && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-gradient-to-r from-violet-900/20 to-cyan-900/20 border border-violet-500/30 rounded-2xl p-6 mb-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-6 h-6 text-violet-400" />
                      <h2 className="text-xl font-bold text-white">AI Recommendations</h2>
                    </div>
                    <button
                      onClick={() => setShowAIRecommendations(false)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-gray-300 mb-4">
                    Perfect for {companyInfo.name} - these modules work exceptionally well together for 
                    {userRole === 'admin' ? ' system administrators' : userRole === 'manager' ? ' managers' : ' team members'} 
                    in the {companyInfo.industry} industry.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {aiRecommendedModules.map(moduleId => {
                      const module = availableModules.find(m => m.id === moduleId)
                      if (!module) return null
                      return (
                        <button
                          key={moduleId}
                          onClick={() => handleModuleToggle(moduleId)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                            selectedModules.includes(moduleId)
                              ? 'bg-violet-500 border-violet-500 text-white'
                              : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                          }`}
                        >
                          {module.name}
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bundle Offers */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Bundle Offers</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {bundleOffers.map((bundle) => (
                  <motion.button
                    key={bundle.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleBundleSelect(bundle.id)}
                    className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                      selectedBundle === bundle.id
                        ? 'border-violet-500 bg-violet-500/10'
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 bg-gradient-to-r ${bundle.gradient} bg-opacity-20 rounded-lg`}>
                        <bundle.icon className={`w-5 h-5 ${bundle.color}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{bundle.name}</h3>
                        <p className="text-sm text-gray-400">{bundle.description}</p>
                      </div>
                    </div>
                    <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Save {bundle.discount}%</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">
                      Includes {bundle.modules.length} modules
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Individual Modules */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">All Modules</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {availableModules.map((module) => (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`relative p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                      selectedModules.includes(module.id)
                        ? 'border-violet-500 bg-violet-500/10'
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    }`}
                    onClick={() => handleModuleToggle(module.id)}
                  >
                    {/* AI Recommended Badge */}
                    {aiRecommendedModules.includes(module.id) && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white text-xs px-2 py-1 rounded-full">
                        AI Pick
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 bg-gradient-to-r ${module.gradient} bg-opacity-20 rounded-xl`}>
                          <module.icon className={`w-6 h-6 ${module.color}`} />
                        </div>
                        <div>
                          <h3 className="font-bold text-white">{module.name}</h3>
                          <p className="text-sm text-gray-400">{module.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-white">${module.basePrice}</span>
                        <span className="text-sm text-gray-400">/user/month</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-300 mb-4">{module.longDescription}</p>

                    <div className="space-y-2 mb-4">
                      <h4 className="text-sm font-semibold text-gray-300">Key Features:</h4>
                      <div className="flex flex-wrap gap-1">
                        {module.features.slice(0, 3).map((feature) => (
                          <span key={feature} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-violet-400" />
                        <span className="text-xs text-violet-400">
                          {module.aiCapabilities.length} AI Features
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-400">{module.popularity}%</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Pricing Summary */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 space-y-6">
              <h3 className="text-xl font-bold text-white">Pricing Summary</h3>

              {/* User Count */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Number of Users
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setUserCount(Math.max(1, userCount - 1))}
                    className="p-2 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-gray-300" />
                  </button>
                  <span className="text-xl font-bold text-white min-w-[3rem] text-center">{userCount}</span>
                  <button
                    onClick={() => setUserCount(userCount + 1)}
                    className="p-2 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-gray-300" />
                  </button>
                </div>
              </div>

              {/* Selected Modules */}
              <div>
                <h4 className="font-semibold text-white mb-3">Selected Modules ({selectedModules.length})</h4>
                <div className="space-y-2">
                  {selectedModules.map(moduleId => {
                    const module = availableModules.find(m => m.id === moduleId)
                    if (!module) return null
                    return (
                      <div key={moduleId} className="flex justify-between text-sm">
                        <span className="text-gray-300">{module.name}</span>
                        <span className="text-white">${module.basePrice}/user</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Bundle Discount */}
              {selectedBundle && (
                <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Bundle Discount</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Save {pricingCalculation.discount}%</span>
                    <span className="text-emerald-400">-${pricingCalculation.discountAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Pricing Breakdown */}
              <div className="space-y-2 pt-4 border-t border-gray-800">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Subtotal</span>
                  <span className="text-white">${pricingCalculation.subtotal.toFixed(2)}</span>
                </div>
                {pricingCalculation.discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Discount</span>
                    <span className="text-emerald-400">-${pricingCalculation.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-white">Total per month</span>
                  <span className="text-white">${pricingCalculation.total.toFixed(2)}</span>
                </div>
                <div className="text-center text-sm text-gray-400">
                  ${pricingCalculation.pricePerUser.toFixed(2)} per user per month
                </div>
              </div>

              {/* CTA */}
              <div className="pt-4">
                <GlowingButton
                  onClick={handleContinue}
                  disabled={selectedModules.length === 0}
                  className="w-full"
                >
                  Continue to Setup
                  <ArrowRight className="w-4 h-4 ml-2" />
                </GlowingButton>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12">
          <GlowingButton
            onClick={onBack}
            variant="outline"
            className="px-6 py-3"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Company Setup
          </GlowingButton>

          <div className="text-center">
            <p className="text-sm text-gray-400">
              Start with a 14-day free trial • No credit card required
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}