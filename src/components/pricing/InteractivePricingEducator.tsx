'use client'

/**
 * Interactive Pricing Educator
 * 
 * Comprehensive progressive pricing education system with interactive calculator,
 * ROI demonstrations, and business growth scenarios for CoreFlow360.
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BusinessScenario {
  id: string
  name: string
  description: string
  businessCount: number
  averageRevenue: number
  industry: string
  painPoints: string[]
  expectedGrowth: number
  currentSoftwareCosts: number
}

interface PricingCalculation {
  businessCount: number
  traditionalCost: number
  progressiveCost: number
  savings: number
  savingsPercentage: number
  discountTier: string
  roiProjection: {
    efficiencyGains: number
    timeSavings: number
    crossBusinessSynergies: number
    totalBenefits: number
    netROI: number
    paybackPeriod: number
  }
}

interface EducationModule {
  id: string
  title: string
  description: string
  content: string
  interactive: boolean
  completed: boolean
}

interface InteractivePricingEducatorProps {
  onScenarioSelect?: (scenario: BusinessScenario) => void
  onCalculationComplete?: (calculation: PricingCalculation) => void
  className?: string
}

const InteractivePricingEducator: React.FC<InteractivePricingEducatorProps> = ({
  onScenarioSelect,
  onCalculationComplete,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'scenarios' | 'education' | 'comparison'>('calculator')
  const [businessCount, setBusinessCount] = useState(2)
  const [selectedScenario, setSelectedScenario] = useState<BusinessScenario | null>(null)
  const [currentModule, setCurrentModule] = useState(0)
  const [calculation, setCalculation] = useState<PricingCalculation | null>(null)
  const [animationStep, setAnimationStep] = useState(0)

  // Business scenarios for demonstration
  const businessScenarios: BusinessScenario[] = [
    {
      id: 'hvac-portfolio',
      name: 'HVAC Multi-Location Empire',
      description: 'Growing HVAC business expanding to multiple service areas',
      businessCount: 4,
      averageRevenue: 1200000,
      industry: 'HVAC',
      painPoints: [
        'Separate scheduling systems for each location',
        'No unified customer database',
        'Manual inventory tracking across warehouses',
        'Inconsistent pricing across locations'
      ],
      expectedGrowth: 35,
      currentSoftwareCosts: 2400
    },
    {
      id: 'professional-services',
      name: 'Professional Services Portfolio',
      description: 'Law firm expanding into accounting and consulting services',
      businessCount: 3,
      averageRevenue: 2800000,
      industry: 'Professional Services',
      painPoints: [
        'Client data scattered across different systems',
        'No cross-selling visibility',
        'Duplicate billing and time tracking',
        'Separate reporting for each practice'
      ],
      expectedGrowth: 45,
      currentSoftwareCosts: 3600
    },
    {
      id: 'tech-entrepreneur',
      name: 'Serial Tech Entrepreneur',
      description: 'Technology entrepreneur with SaaS, consulting, and e-commerce businesses',
      businessCount: 5,
      averageRevenue: 1800000,
      industry: 'Technology',
      painPoints: [
        'Different tech stacks for each business',
        'No unified analytics or KPIs',
        'Manual consolidation for investor reports',
        'Lost opportunities for resource sharing'
      ],
      expectedGrowth: 60,
      currentSoftwareCosts: 4200
    },
    {
      id: 'manufacturing-group',
      name: 'Manufacturing & Distribution Group',
      description: 'Manufacturing company with distribution and retail arms',
      businessCount: 6,
      averageRevenue: 5200000,
      industry: 'Manufacturing',
      painPoints: [
        'Supply chain visibility gaps',
        'Inventory optimization challenges',
        'Customer order tracking across channels',
        'Financial consolidation complexity'
      ],
      expectedGrowth: 25,
      currentSoftwareCosts: 7800
    }
  ]

  // Education modules
  const educationModules: EducationModule[] = [
    {
      id: 'progressive-basics',
      title: 'Progressive Pricing Fundamentals',
      description: 'Understanding how progressive pricing rewards business growth',
      content: 'Progressive pricing automatically reduces your per-business cost as you add more businesses to your portfolio. Instead of paying full price for each business, you get increasing discounts that compound your savings.',
      interactive: false,
      completed: false
    },
    {
      id: 'business-count-benefits',
      title: 'Business Count Advantage',
      description: 'How adding businesses creates exponential value',
      content: 'Each additional business doesn\'t just add linear value - it creates network effects. Cross-business insights, shared resources, and unified data create exponential benefits that traditional per-seat pricing can\'t capture.',
      interactive: true,
      completed: false
    },
    {
      id: 'roi-multiplication',
      title: 'ROI Multiplication Effect',
      description: 'Why multi-business operations generate superior returns',
      content: 'Multi-business operations achieve 3-5x higher ROI through operational synergies, cross-selling opportunities, and resource optimization that single-business solutions miss.',
      interactive: true,
      completed: false
    },
    {
      id: 'competitive-advantage',
      title: 'Competitive Advantage',
      description: 'How progressive pricing beats traditional software licensing',
      content: 'Traditional software charges per user or per business, creating cost barriers to growth. Progressive pricing removes these barriers and actually rewards expansion.',
      interactive: false,
      completed: false
    }
  ]

  // Calculate progressive pricing
  useEffect(() => {
    const newCalculation = calculateProgressivePricing(businessCount, selectedScenario)
    setCalculation(newCalculation)
    onCalculationComplete?.(newCalculation)
  }, [businessCount, selectedScenario])

  const calculateProgressivePricing = (count: number, scenario?: BusinessScenario | null): PricingCalculation => {
    // Base pricing per business per month
    const basePricePerBusiness = 150

    // Progressive discount tiers
    const discountTiers = {
      1: { discount: 0, tier: 'Single Business' },
      2: { discount: 20, tier: 'Dual Business (20% off)' },
      3: { discount: 35, tier: 'Portfolio Growth (35% off)' },
      4: { discount: 45, tier: 'Business Empire (45% off)' },
      5: { discount: 50, tier: 'Enterprise Portfolio (50% off)' }
    }

    const tier = count >= 5 ? discountTiers[5] : discountTiers[count as keyof typeof discountTiers]
    const traditionalCost = count * basePricePerBusiness * 12 // Annual cost
    const discountAmount = traditionalCost * (tier.discount / 100)
    const progressiveCost = traditionalCost - discountAmount

    // ROI calculations based on business scenario
    const baseRevenue = scenario ? scenario.averageRevenue * count : count * 1000000
    const efficiencyGains = baseRevenue * 0.08 * count // 8% efficiency per business
    const timeSavings = 40 * count * 52 * 75 // 40 hours/week saved * $75/hour
    const crossBusinessSynergies = baseRevenue * 0.05 * Math.max(0, count - 1) // 5% synergy benefits
    
    const totalBenefits = efficiencyGains + timeSavings + crossBusinessSynergies
    const netROI = (totalBenefits - progressiveCost) / progressiveCost * 100
    const paybackPeriod = progressiveCost / (totalBenefits / 12) // months

    return {
      businessCount: count,
      traditionalCost,
      progressiveCost,
      savings: discountAmount,
      savingsPercentage: tier.discount,
      discountTier: tier.tier,
      roiProjection: {
        efficiencyGains,
        timeSavings,
        crossBusinessSynergies,
        totalBenefits,
        netROI,
        paybackPeriod
      }
    }
  }

  const handleScenarioSelect = (scenario: BusinessScenario) => {
    setSelectedScenario(scenario)
    setBusinessCount(scenario.businessCount)
    onScenarioSelect?.(scenario)
  }

  const ProgressBarAnimation = ({ current, total }: { current: number, total: number }) => (
    <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
      <motion.div
        className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${(current / total) * 100}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  )

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="rounded-2xl border border-gray-700 bg-gradient-to-r from-gray-900 to-black p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Progressive Pricing Education Center</h2>
            <p className="text-gray-400">Discover how progressive pricing rewards your business growth</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-400">
              {calculation ? calculation.savingsPercentage : 0}%
            </div>
            <div className="text-sm text-gray-400">Current Discount</div>
          </div>
        </div>

        {/* Quick Stats */}
        {calculation && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-black/30 rounded-lg p-4">
              <div className="text-xl font-bold text-white">${calculation.savings.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Annual Savings</div>
            </div>
            <div className="bg-black/30 rounded-lg p-4">
              <div className="text-xl font-bold text-white">{Math.round(calculation.roiProjection.netROI)}%</div>
              <div className="text-sm text-gray-400">ROI</div>
            </div>
            <div className="bg-black/30 rounded-lg p-4">
              <div className="text-xl font-bold text-white">{calculation.roiProjection.paybackPeriod.toFixed(1)}</div>
              <div className="text-sm text-gray-400">Payback (Months)</div>
            </div>
            <div className="bg-black/30 rounded-lg p-4">
              <div className="text-xl font-bold text-white">{businessCount}</div>
              <div className="text-sm text-gray-400">Businesses</div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
        {[
          { id: 'calculator', label: 'Interactive Calculator', icon: '🧮' },
          { id: 'scenarios', label: 'Business Scenarios', icon: '🏢' },
          { id: 'education', label: 'Learning Modules', icon: '🎓' },
          { id: 'comparison', label: 'Competitive Analysis', icon: '⚖️' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Interactive Calculator Tab */}
      {activeTab === 'calculator' && (
        <div className="space-y-6">
          {/* Business Count Slider */}
          <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
            <h3 className="text-lg font-bold text-white mb-4">📊 Your Business Portfolio</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-gray-400">Number of Businesses:</label>
                <div className="text-2xl font-bold text-cyan-400">{businessCount}</div>
              </div>
              
              <div className="relative">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={businessCount}
                  onChange={(e) => setBusinessCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                  <span>6</span>
                  <span>7</span>
                  <span>8</span>
                  <span>9</span>
                  <span>10</span>
                </div>
              </div>

              {/* Progressive Benefits Visualization */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-3xl mb-2">📈</div>
                  <div className="text-sm font-medium text-white">Efficiency Gains</div>
                  <div className="text-xs text-gray-400">+{businessCount * 8}% operational efficiency</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🔗</div>
                  <div className="text-sm font-medium text-white">Cross-Business Synergies</div>
                  <div className="text-xs text-gray-400">+{Math.max(0, (businessCount - 1) * 5)}% revenue opportunities</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">💰</div>
                  <div className="text-sm font-medium text-white">Cost Optimization</div>
                  <div className="text-xs text-gray-400">{calculation?.savingsPercentage}% software savings</div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Comparison */}
          {calculation && (
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
              <h3 className="text-lg font-bold text-white mb-4">💸 Pricing Comparison</h3>
              
              <div className="grid gap-6 md:grid-cols-2">
                {/* Traditional Pricing */}
                <div className="border border-red-700 rounded-lg p-4 bg-red-900/20">
                  <h4 className="font-semibold text-red-400 mb-3">❌ Traditional Pricing</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Per Business Cost:</span>
                      <span className="text-white">$150/month</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Businesses:</span>
                      <span className="text-white">{businessCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Discount:</span>
                      <span className="text-red-400">0%</span>
                    </div>
                    <hr className="border-gray-600" />
                    <div className="flex justify-between font-bold">
                      <span className="text-white">Annual Cost:</span>
                      <span className="text-red-400">${calculation.traditionalCost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Progressive Pricing */}
                <div className="border border-green-700 rounded-lg p-4 bg-green-900/20">
                  <h4 className="font-semibold text-green-400 mb-3">✅ Progressive Pricing</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Base Cost:</span>
                      <span className="text-white">${calculation.traditionalCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tier:</span>
                      <span className="text-cyan-400">{calculation.discountTier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Discount:</span>
                      <span className="text-green-400">{calculation.savingsPercentage}%</span>
                    </div>
                    <hr className="border-gray-600" />
                    <div className="flex justify-between font-bold">
                      <span className="text-white">Annual Cost:</span>
                      <span className="text-green-400">${calculation.progressiveCost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Savings Highlight */}
              <div className="mt-6 text-center bg-gradient-to-r from-purple-900/30 to-cyan-900/30 rounded-lg p-4 border border-purple-700">
                <div className="text-3xl font-bold text-cyan-400 mb-2">
                  ${calculation.savings.toLocaleString()}
                </div>
                <div className="text-white">Annual Savings with Progressive Pricing</div>
                <div className="text-sm text-gray-400 mt-1">
                  Save {calculation.savingsPercentage}% compared to traditional per-business pricing
                </div>
              </div>
            </div>
          )}

          {/* ROI Breakdown */}
          {calculation && (
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
              <h3 className="text-lg font-bold text-white mb-4">📈 ROI Projection</h3>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-black/30 rounded-lg p-4">
                  <h4 className="font-medium text-cyan-400 mb-2">Efficiency Gains</h4>
                  <div className="text-xl font-bold text-white">
                    ${calculation.roiProjection.efficiencyGains.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">8% improvement per business</div>
                </div>
                
                <div className="bg-black/30 rounded-lg p-4">
                  <h4 className="font-medium text-purple-400 mb-2">Time Savings</h4>
                  <div className="text-xl font-bold text-white">
                    ${calculation.roiProjection.timeSavings.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">40 hours/week automation</div>
                </div>
                
                <div className="bg-black/30 rounded-lg p-4">
                  <h4 className="font-medium text-green-400 mb-2">Cross-Business Synergies</h4>
                  <div className="text-xl font-bold text-white">
                    ${calculation.roiProjection.crossBusinessSynergies.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">5% per additional business</div>
                </div>
              </div>

              <div className="mt-6 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg p-4 border border-green-700">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-400">
                      {Math.round(calculation.roiProjection.netROI)}% ROI
                    </div>
                    <div className="text-sm text-gray-400">
                      Payback in {calculation.roiProjection.paybackPeriod.toFixed(1)} months
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">
                      ${calculation.roiProjection.totalBenefits.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">Total Annual Benefits</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Business Scenarios Tab */}
      {activeTab === 'scenarios' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">🏢 Real Business Growth Scenarios</h3>
          <p className="text-gray-400">See how progressive pricing benefits different types of business portfolios</p>
          
          <div className="grid gap-6 md:grid-cols-2">
            {businessScenarios.map((scenario) => (
              <motion.div
                key={scenario.id}
                className={`rounded-lg border p-6 cursor-pointer transition-all ${
                  selectedScenario?.id === scenario.id
                    ? 'border-cyan-400 bg-cyan-900/20'
                    : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                }`}
                onClick={() => handleScenarioSelect(scenario)}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">{scenario.name}</h4>
                    <p className="text-sm text-gray-400 mb-3">{scenario.description}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-cyan-400">{scenario.businessCount} businesses</span>
                      <span className="text-green-400">${(scenario.averageRevenue / 1000000).toFixed(1)}M avg revenue</span>
                      <span className="text-purple-400">{scenario.industry}</span>
                    </div>
                  </div>
                  {selectedScenario?.id === scenario.id && (
                    <div className="text-cyan-400 text-xl">✓</div>
                  )}
                </div>

                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-white">Current Pain Points:</h5>
                  <ul className="space-y-1">
                    {scenario.painPoints.slice(0, 2).map((pain, index) => (
                      <li key={index} className="text-xs text-gray-400 flex items-center space-x-2">
                        <span className="text-red-400">•</span>
                        <span>{pain}</span>
                      </li>
                    ))}
                    {scenario.painPoints.length > 2 && (
                      <li className="text-xs text-gray-500">
                        +{scenario.painPoints.length - 2} more challenges
                      </li>
                    )}
                  </ul>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-gray-400">
                    Expected growth: +{scenario.expectedGrowth}%
                  </div>
                  <button className="text-cyan-400 hover:text-cyan-300 text-sm">
                    Select Scenario →
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {selectedScenario && calculation && (
            <div className="mt-6 rounded-xl border border-cyan-700 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 p-6">
              <h4 className="text-lg font-bold text-white mb-4">
                📊 {selectedScenario.name} - Progressive Pricing Impact
              </h4>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">
                    ${calculation.savings.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Annual Savings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {calculation.savingsPercentage}%
                  </div>
                  <div className="text-sm text-gray-400">Discount Tier</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {Math.round(calculation.roiProjection.netROI)}%
                  </div>
                  <div className="text-sm text-gray-400">Projected ROI</div>
                </div>
              </div>

              <div className="mt-4 bg-black/30 rounded-lg p-4">
                <h5 className="font-medium text-white mb-2">How This Business Benefits:</h5>
                <ul className="space-y-1 text-sm">
                  <li className="text-gray-300 flex items-center space-x-2">
                    <span className="text-green-400">✓</span>
                    <span>Unified operations across {selectedScenario.businessCount} businesses</span>
                  </li>
                  <li className="text-gray-300 flex items-center space-x-2">
                    <span className="text-green-400">✓</span>
                    <span>Cross-business insights and resource optimization</span>
                  </li>
                  <li className="text-gray-300 flex items-center space-x-2">
                    <span className="text-green-400">✓</span>
                    <span>{calculation.savingsPercentage}% progressive discount vs traditional pricing</span>
                  </li>
                  <li className="text-gray-300 flex items-center space-x-2">
                    <span className="text-green-400">✓</span>
                    <span>Projected {selectedScenario.expectedGrowth}% business growth acceleration</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Education Modules Tab */}
      {activeTab === 'education' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">🎓 Progressive Pricing Mastery</h3>
            <div className="text-sm text-gray-400">
              Module {currentModule + 1} of {educationModules.length}
            </div>
          </div>

          <ProgressBarAnimation current={currentModule + 1} total={educationModules.length} />

          <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
            <div className="mb-6">
              <h4 className="text-xl font-semibold text-white mb-2">
                {educationModules[currentModule].title}
              </h4>
              <p className="text-gray-400 mb-4">
                {educationModules[currentModule].description}
              </p>
            </div>

            <div className="bg-black/30 rounded-lg p-6 mb-6">
              <p className="text-gray-300 leading-relaxed">
                {educationModules[currentModule].content}
              </p>
            </div>

            {/* Interactive Elements for Specific Modules */}
            {educationModules[currentModule].interactive && (
              <div className="mb-6">
                {educationModules[currentModule].id === 'business-count-benefits' && (
                  <div className="space-y-4">
                    <h5 className="font-medium text-white">Interactive Demo: Business Count Impact</h5>
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map((count) => (
                        <motion.div
                          key={count}
                          className="bg-gray-700 rounded-lg p-3 text-center cursor-pointer"
                          whileHover={{ scale: 1.05, backgroundColor: '#374151' }}
                          onClick={() => setBusinessCount(count)}
                        >
                          <div className="text-sm font-bold text-white">{count}</div>
                          <div className="text-xs text-gray-400">
                            {count === 1 ? '0%' : 
                             count === 2 ? '20%' : 
                             count === 3 ? '35%' : 
                             count === 4 ? '45%' : '50%'} off
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {educationModules[currentModule].id === 'roi-multiplication' && calculation && (
                  <div className="space-y-4">
                    <h5 className="font-medium text-white">ROI Multiplication Visualization</h5>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl mb-2">📊</div>
                        <div className="text-sm text-white">Individual Business ROI</div>
                        <div className="text-lg font-bold text-blue-400">150%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl mb-2">🔗</div>
                        <div className="text-sm text-white">Cross-Business Synergies</div>
                        <div className="text-lg font-bold text-purple-400">+200%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl mb-2">🚀</div>
                        <div className="text-sm text-white">Portfolio ROI</div>
                        <div className="text-lg font-bold text-green-400">
                          {Math.round(calculation.roiProjection.netROI)}%
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentModule(Math.max(0, currentModule - 1))}
                disabled={currentModule === 0}
                className={`px-4 py-2 rounded-lg ${
                  currentModule === 0
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                ← Previous
              </button>

              <button
                onClick={() => setCurrentModule(Math.min(educationModules.length - 1, currentModule + 1))}
                disabled={currentModule === educationModules.length - 1}
                className={`px-4 py-2 rounded-lg ${
                  currentModule === educationModules.length - 1
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:from-purple-500 hover:to-cyan-500'
                }`}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Competitive Analysis Tab */}
      {activeTab === 'comparison' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white">⚖️ Competitive Pricing Analysis</h3>
          
          <div className="grid gap-6 md:grid-cols-3">
            {/* Traditional Competitors */}
            <div className="rounded-lg border border-red-700 bg-red-900/20 p-6">
              <h4 className="font-semibold text-red-400 mb-4">❌ Traditional Competitors</h4>
              <div className="space-y-3">
                <div className="text-sm">
                  <div className="text-white font-medium">Per-User Pricing</div>
                  <div className="text-gray-400">$50-150 per user/month</div>
                </div>
                <div className="text-sm">
                  <div className="text-white font-medium">Multi-Business Cost</div>
                  <div className="text-gray-400">Linear multiplication</div>
                </div>
                <div className="text-sm">
                  <div className="text-white font-medium">Growth Penalty</div>
                  <div className="text-red-400">Costs increase with growth</div>
                </div>
                <div className="text-sm">
                  <div className="text-white font-medium">Integration</div>
                  <div className="text-gray-400">Separate systems</div>
                </div>
              </div>
            </div>

            {/* Enterprise Solutions */}
            <div className="rounded-lg border border-yellow-700 bg-yellow-900/20 p-6">
              <h4 className="font-semibold text-yellow-400 mb-4">⚠️ Enterprise Solutions</h4>
              <div className="space-y-3">
                <div className="text-sm">
                  <div className="text-white font-medium">Custom Pricing</div>
                  <div className="text-gray-400">$100K+ annual contracts</div>
                </div>
                <div className="text-sm">
                  <div className="text-white font-medium">Implementation</div>
                  <div className="text-gray-400">6-18 month rollouts</div>
                </div>
                <div className="text-sm">
                  <div className="text-white font-medium">Flexibility</div>
                  <div className="text-yellow-400">Limited customization</div>
                </div>
                <div className="text-sm">
                  <div className="text-white font-medium">SMB Access</div>
                  <div className="text-gray-400">Not accessible</div>
                </div>
              </div>
            </div>

            {/* CoreFlow360 Progressive */}
            <div className="rounded-lg border border-green-700 bg-green-900/20 p-6">
              <h4 className="font-semibold text-green-400 mb-4">✅ CoreFlow360 Progressive</h4>
              <div className="space-y-3">
                <div className="text-sm">
                  <div className="text-white font-medium">Progressive Discounts</div>
                  <div className="text-green-400">20-50% off with growth</div>
                </div>
                <div className="text-sm">
                  <div className="text-white font-medium">Growth Reward</div>
                  <div className="text-green-400">Costs decrease with scale</div>
                </div>
                <div className="text-sm">
                  <div className="text-white font-medium">Unified Platform</div>
                  <div className="text-green-400">Single system, all businesses</div>
                </div>
                <div className="text-sm">
                  <div className="text-white font-medium">Accessibility</div>
                  <div className="text-green-400">SMB to Enterprise</div>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Calculator */}
          {calculation && (
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
              <h4 className="text-lg font-bold text-white mb-4">💰 5-Year Cost Comparison</h4>
              
              <div className="space-y-4">
                {[
                  { name: 'Traditional SaaS (Per-User)', cost: 180000, color: 'text-red-400' },
                  { name: 'Enterprise Solution', cost: 500000, color: 'text-yellow-400' },
                  { name: 'CoreFlow360 Progressive', cost: calculation.progressiveCost * 5, color: 'text-green-400' }
                ].map((option, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
                    <div>
                      <div className={`font-medium ${option.color}`}>{option.name}</div>
                      <div className="text-sm text-gray-400">5-year total cost</div>
                    </div>
                    <div className={`text-xl font-bold ${option.color}`}>
                      ${option.cost.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg p-4 border border-green-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    ${(180000 - (calculation.progressiveCost * 5)).toLocaleString()}
                  </div>
                  <div className="text-white">5-Year Savings vs Traditional SaaS</div>
                  <div className="text-sm text-gray-400">
                    {Math.round(((180000 - (calculation.progressiveCost * 5)) / 180000) * 100)}% total savings
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default InteractivePricingEducator