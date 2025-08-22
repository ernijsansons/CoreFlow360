'use client'

/**
 * ROI Demonstration Tool
 * 
 * Interactive ROI calculator and visualization tool that demonstrates
 * the exponential benefits of multi-business operations with CoreFlow360.
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BusinessInput {
  id: string
  name: string
  industry: string
  currentRevenue: number
  employees: number
  currentSoftwareCost: number
  painPoints: string[]
}

interface ROICalculation {
  businessId: string
  currentState: {
    revenue: number
    costs: number
    efficiency: number
    timeSpent: number
  }
  withCoreFlow: {
    revenue: number
    costs: number
    efficiency: number
    timeSaved: number
    crossBusinessBenefits: number
  }
  improvements: {
    revenueIncrease: number
    costReduction: number
    efficiencyGain: number
    timeRecovered: number
    roi: number
    paybackPeriod: number
  }
}

interface PortfolioROI {
  individualBusinessROI: ROICalculation[]
  portfolioSynergies: {
    crossSelling: number
    sharedResources: number
    dataInsights: number
    operationalEfficiency: number
    totalSynergies: number
  }
  totalPortfolioROI: {
    totalInvestment: number
    totalBenefits: number
    netROI: number
    compoundedGrowth: number
  }
}

interface ROIDemonstrationToolProps {
  onROICalculated?: (roi: PortfolioROI) => void
  className?: string
}

const ROIDemonstrationTool: React.FC<ROIDemonstrationToolProps> = ({
  onROICalculated,
  className = ''
}) => {
  const [businesses, setBusinesses] = useState<BusinessInput[]>([])
  const [currentBusiness, setCurrentBusiness] = useState<BusinessInput>({
    id: '',
    name: '',
    industry: '',
    currentRevenue: 0,
    employees: 0,
    currentSoftwareCost: 0,
    painPoints: []
  })
  const [portfolioROI, setPortfolioROI] = useState<PortfolioROI | null>(null)
  const [activeStep, setActiveStep] = useState(0)
  const [animationPhase, setAnimationPhase] = useState(0)
  const [showComparison, setShowComparison] = useState(false)

  const industryOptions = [
    'HVAC', 'Professional Services', 'Technology', 'Manufacturing', 
    'Construction', 'Healthcare', 'Retail', 'Restaurant', 'Other'
  ]

  const commonPainPoints = {
    'HVAC': [
      'Separate scheduling for each location',
      'Manual inventory tracking',
      'No unified customer database',
      'Inconsistent pricing across locations',
      'Limited technician mobility between locations'
    ],
    'Professional Services': [
      'Client data in separate systems',
      'No cross-selling visibility',
      'Duplicate billing processes',
      'Manual time tracking',
      'Inconsistent client experience'
    ],
    'Technology': [
      'Different tools for each business',
      'No unified analytics',
      'Manual reporting consolidation',
      'Resource allocation inefficiencies',
      'Limited cross-business insights'
    ],
    'Manufacturing': [
      'Supply chain visibility gaps',
      'Inventory optimization challenges',
      'Quality control inconsistencies',
      'Production planning silos',
      'Customer order tracking issues'
    ]
  }

  // Add business to portfolio
  const addBusiness = () => {
    if (currentBusiness.name && currentBusiness.industry) {
      const newBusiness = {
        ...currentBusiness,
        id: `business-${Date.now()}`,
        painPoints: commonPainPoints[currentBusiness.industry as keyof typeof commonPainPoints] || []
      }
      setBusinesses([...businesses, newBusiness])
      setCurrentBusiness({
        id: '',
        name: '',
        industry: '',
        currentRevenue: 0,
        employees: 0,
        currentSoftwareCost: 0,
        painPoints: []
      })
    }
  }

  // Calculate ROI when businesses change
  useEffect(() => {
    if (businesses.length > 0) {
      const roi = calculatePortfolioROI(businesses)
      setPortfolioROI(roi)
      onROICalculated?.(roi)
    }
  }, [businesses])

  const calculatePortfolioROI = (businessList: BusinessInput[]): PortfolioROI => {
    const individualROI = businessList.map(business => calculateBusinessROI(business, businessList.length))
    const synergies = calculatePortfolioSynergies(businessList)
    
    const totalInvestment = businessList.length * 1800 * 12 // Annual CoreFlow360 cost per business
    const totalBenefits = individualROI.reduce((sum, roi) => sum + roi.improvements.revenueIncrease, 0) + synergies.totalSynergies
    const netROI = ((totalBenefits - totalInvestment) / totalInvestment) * 100
    
    // Compound growth calculation (assuming 25% efficiency compounds annually)
    const compoundedGrowth = Math.pow(1.25, Math.min(3, businessList.length)) * 100 - 100

    return {
      individualBusinessROI: individualROI,
      portfolioSynergies: synergies,
      totalPortfolioROI: {
        totalInvestment,
        totalBenefits,
        netROI,
        compoundedGrowth
      }
    }
  }

  const calculateBusinessROI = (business: BusinessInput, portfolioSize: number): ROICalculation => {
    // Current state inefficiencies
    const currentEfficiency = 0.65 // Assume 65% efficiency without unified system
    const timeWastedPerWeek = 15 + (portfolioSize - 1) * 5 // More waste with more businesses
    
    // CoreFlow360 improvements
    const efficiencyGain = 0.20 + (portfolioSize - 1) * 0.05 // 20% base + 5% per additional business
    const newEfficiency = Math.min(0.95, currentEfficiency + efficiencyGain)
    const timeSavedPerWeek = timeWastedPerWeek * 0.8 // 80% time recovery
    
    // Revenue impact calculations
    const revenueMultiplier = 1 + efficiencyGain
    const newRevenue = business.currentRevenue * revenueMultiplier
    const revenueIncrease = newRevenue - business.currentRevenue
    
    // Cost impact
    const coreFlowCost = 1800 * 12 // Annual cost per business
    const currentSoftwareCostAnnual = business.currentSoftwareCost * 12
    const costReduction = currentSoftwareCostAnnual - coreFlowCost
    
    // Cross-business benefits (only if multiple businesses)
    const crossBusinessBenefits = portfolioSize > 1 ? business.currentRevenue * 0.08 * (portfolioSize - 1) : 0
    
    // ROI calculation
    const totalBenefits = revenueIncrease + Math.max(0, costReduction) + crossBusinessBenefits
    const roi = (totalBenefits / coreFlowCost) * 100
    const paybackPeriod = coreFlowCost / (totalBenefits / 12) // months

    return {
      businessId: business.id,
      currentState: {
        revenue: business.currentRevenue,
        costs: currentSoftwareCostAnnual,
        efficiency: currentEfficiency,
        timeSpent: timeWastedPerWeek
      },
      withCoreFlow: {
        revenue: newRevenue,
        costs: coreFlowCost,
        efficiency: newEfficiency,
        timeSaved: timeSavedPerWeek,
        crossBusinessBenefits
      },
      improvements: {
        revenueIncrease,
        costReduction: Math.max(0, costReduction),
        efficiencyGain: efficiencyGain * 100,
        timeRecovered: timeSavedPerWeek,
        roi,
        paybackPeriod
      }
    }
  }

  const calculatePortfolioSynergies = (businessList: BusinessInput[]): PortfolioROI['portfolioSynergies'] => {
    if (businessList.length <= 1) {
      return {
        crossSelling: 0,
        sharedResources: 0,
        dataInsights: 0,
        operationalEfficiency: 0,
        totalSynergies: 0
      }
    }

    const totalRevenue = businessList.reduce((sum, b) => sum + b.currentRevenue, 0)
    
    // Cross-selling opportunities (2-5% of total revenue)
    const crossSelling = totalRevenue * (0.02 + (businessList.length - 2) * 0.01)
    
    // Shared resources (employee optimization, overhead reduction)
    const sharedResources = businessList.reduce((sum, b) => sum + (b.employees * 2000), 0) // $2K per employee
    
    // Data insights and business intelligence
    const dataInsights = totalRevenue * 0.03 // 3% revenue from better insights
    
    // Operational efficiency gains
    const operationalEfficiency = totalRevenue * 0.05 // 5% from streamlined operations
    
    const totalSynergies = crossSelling + sharedResources + dataInsights + operationalEfficiency

    return {
      crossSelling,
      sharedResources,
      dataInsights,
      operationalEfficiency,
      totalSynergies
    }
  }

  const startROIAnimation = () => {
    setAnimationPhase(1)
    setTimeout(() => setAnimationPhase(2), 1000)
    setTimeout(() => setAnimationPhase(3), 2000)
    setTimeout(() => setAnimationPhase(4), 3000)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="rounded-2xl border border-gray-700 bg-gradient-to-r from-gray-900 to-black p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">ROI Demonstration Tool</h2>
            <p className="text-gray-400">Build your business portfolio and see exponential ROI growth</p>
          </div>
          {portfolioROI && (
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">
                {Math.round(portfolioROI.totalPortfolioROI.netROI)}%
              </div>
              <div className="text-sm text-gray-400">Portfolio ROI</div>
            </div>
          )}
        </div>

        {/* Progress Steps */}
        <div className="flex items-center space-x-4">
          {['Add Businesses', 'Calculate ROI', 'View Results', 'Compare Options'].map((step, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index <= activeStep ? 'bg-cyan-500 text-white' : 'bg-gray-700 text-gray-400'
              }`}>
                {index + 1}
              </div>
              <span className={`text-sm ${index <= activeStep ? 'text-white' : 'text-gray-400'}`}>
                {step}
              </span>
              {index < 3 && <div className="w-8 h-px bg-gray-600" />}
            </div>
          ))}
        </div>
      </div>

      {/* Business Input Form */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <h3 className="text-lg font-bold text-white mb-4">🏢 Add Your Businesses</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Business Name</label>
              <input
                type="text"
                value={currentBusiness.name}
                onChange={(e) => setCurrentBusiness(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                placeholder="e.g., Phoenix HVAC Services"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Industry</label>
              <select
                value={currentBusiness.industry}
                onChange={(e) => setCurrentBusiness(prev => ({ ...prev, industry: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="">Select Industry</option>
                {industryOptions.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Annual Revenue</label>
              <input
                type="number"
                value={currentBusiness.currentRevenue || ''}
                onChange={(e) => setCurrentBusiness(prev => ({ ...prev, currentRevenue: parseInt(e.target.value) || 0 }))}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                placeholder="1000000"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Number of Employees</label>
              <input
                type="number"
                value={currentBusiness.employees || ''}
                onChange={(e) => setCurrentBusiness(prev => ({ ...prev, employees: parseInt(e.target.value) || 0 }))}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                placeholder="25"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Current Software Cost (Monthly)</label>
              <input
                type="number"
                value={currentBusiness.currentSoftwareCost || ''}
                onChange={(e) => setCurrentBusiness(prev => ({ ...prev, currentSoftwareCost: parseInt(e.target.value) || 0 }))}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                placeholder="500"
              />
            </div>

            <button
              onClick={addBusiness}
              disabled={!currentBusiness.name || !currentBusiness.industry}
              className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-500 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed"
            >
              Add Business to Portfolio
            </button>
          </div>
        </div>

        {/* Business Portfolio Overview */}
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <h3 className="text-lg font-bold text-white mb-4">📊 Your Business Portfolio</h3>
          
          {businesses.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">No businesses added yet</div>
              <div className="text-sm text-gray-500">Add your first business to see ROI calculations</div>
            </div>
          ) : (
            <div className="space-y-3">
              {businesses.map((business, index) => (
                <motion.div
                  key={business.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-black/30 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">{business.name}</h4>
                    <button
                      onClick={() => setBusinesses(businesses.filter(b => b.id !== business.id))}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Industry:</span>
                      <div className="text-white">{business.industry}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Revenue:</span>
                      <div className="text-white">${(business.currentRevenue / 1000000).toFixed(1)}M</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Employees:</span>
                      <div className="text-white">{business.employees}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Software Cost:</span>
                      <div className="text-white">${business.currentSoftwareCost}/mo</div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {businesses.length > 0 && (
                <div className="mt-4 bg-gradient-to-r from-purple-900/30 to-cyan-900/30 rounded-lg p-4 border border-purple-700">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{businesses.length} Business Portfolio</div>
                    <div className="text-sm text-gray-400">
                      Total Revenue: ${(businesses.reduce((sum, b) => sum + b.currentRevenue, 0) / 1000000).toFixed(1)}M
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ROI Results */}
      {portfolioROI && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Portfolio Summary */}
            <div className="rounded-xl border border-green-700 bg-gradient-to-r from-green-900/30 to-emerald-900/30 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">🚀 Portfolio ROI Summary</h3>
                <button
                  onClick={startROIAnimation}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-500"
                >
                  Animate ROI Growth
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <motion.div
                  className="text-center"
                  animate={animationPhase >= 1 ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-3xl font-bold text-green-400">
                    ${portfolioROI.totalPortfolioROI.totalBenefits.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Total Annual Benefits</div>
                </motion.div>

                <motion.div
                  className="text-center"
                  animate={animationPhase >= 2 ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <div className="text-3xl font-bold text-cyan-400">
                    ${portfolioROI.totalPortfolioROI.totalInvestment.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Total Investment</div>
                </motion.div>

                <motion.div
                  className="text-center"
                  animate={animationPhase >= 3 ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.5, delay: 1 }}
                >
                  <div className="text-3xl font-bold text-purple-400">
                    {Math.round(portfolioROI.totalPortfolioROI.netROI)}%
                  </div>
                  <div className="text-sm text-gray-400">Net ROI</div>
                </motion.div>

                <motion.div
                  className="text-center"
                  animate={animationPhase >= 4 ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.5, delay: 1.5 }}
                >
                  <div className="text-3xl font-bold text-yellow-400">
                    {Math.round(portfolioROI.totalPortfolioROI.compoundedGrowth)}%
                  </div>
                  <div className="text-sm text-gray-400">Compounded Growth</div>
                </motion.div>
              </div>

              <div className="mt-6 bg-black/30 rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">Key Insights:</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Your {businesses.length}-business portfolio generates {Math.round(portfolioROI.totalPortfolioROI.netROI)}% ROI annually</li>
                  <li>• Cross-business synergies add ${portfolioROI.portfolioSynergies.totalSynergies.toLocaleString()} in additional value</li>
                  <li>• Payback period: {(portfolioROI.totalPortfolioROI.totalInvestment / (portfolioROI.totalPortfolioROI.totalBenefits / 12)).toFixed(1)} months</li>
                  <li>• Growth compounds as you add more businesses to your portfolio</li>
                </ul>
              </div>
            </div>

            {/* Individual Business ROI */}
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
              <h3 className="text-lg font-bold text-white mb-4">📈 Individual Business ROI</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                {portfolioROI.individualBusinessROI.map((roi, index) => {
                  const business = businesses[index]
                  return (
                    <div key={roi.businessId} className="border border-gray-600 rounded-lg p-4">
                      <h4 className="font-medium text-white mb-3">{business.name}</h4>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Revenue Increase:</span>
                          <div className="text-green-400 font-medium">
                            +${roi.improvements.revenueIncrease.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-400">Efficiency Gain:</span>
                          <div className="text-cyan-400 font-medium">
                            +{roi.improvements.efficiencyGain.toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-400">Time Saved:</span>
                          <div className="text-purple-400 font-medium">
                            {roi.improvements.timeRecovered}h/week
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-400">ROI:</span>
                          <div className="text-yellow-400 font-medium">
                            {Math.round(roi.improvements.roi)}%
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 bg-black/30 rounded p-2">
                        <div className="text-xs text-gray-400">Cross-business benefits:</div>
                        <div className="text-sm text-green-400">
                          +${roi.withCoreFlow.crossBusinessBenefits.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Portfolio Synergies Breakdown */}
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
              <h3 className="text-lg font-bold text-white mb-4">🔗 Portfolio Synergies</h3>
              
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl mb-2">🎯</div>
                  <div className="text-lg font-bold text-cyan-400">
                    ${portfolioROI.portfolioSynergies.crossSelling.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Cross-Selling</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl mb-2">👥</div>
                  <div className="text-lg font-bold text-purple-400">
                    ${portfolioROI.portfolioSynergies.sharedResources.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Shared Resources</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="text-lg font-bold text-green-400">
                    ${portfolioROI.portfolioSynergies.dataInsights.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Data Insights</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl mb-2">⚡</div>
                  <div className="text-lg font-bold text-yellow-400">
                    ${portfolioROI.portfolioSynergies.operationalEfficiency.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Operational Efficiency</div>
                </div>
              </div>

              <div className="mt-6 bg-gradient-to-r from-purple-900/30 to-cyan-900/30 rounded-lg p-4 border border-purple-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    ${portfolioROI.portfolioSynergies.totalSynergies.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Total Portfolio Synergies</div>
                  <div className="text-xs text-gray-500 mt-1">
                    These benefits only exist with a unified multi-business platform
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Toggle */}
            <div className="text-center">
              <button
                onClick={() => setShowComparison(!showComparison)}
                className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-500 hover:to-cyan-500"
              >
                {showComparison ? 'Hide' : 'Show'} Competitive Comparison
              </button>
            </div>

            {/* Competitive Comparison */}
            {showComparison && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-xl border border-gray-700 bg-gray-900 p-6"
              >
                <h3 className="text-lg font-bold text-white mb-4">⚖️ vs. Traditional Solutions</h3>
                
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="border border-red-700 bg-red-900/20 rounded-lg p-4">
                    <h4 className="font-medium text-red-400 mb-3">Separate Systems</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Cost:</span>
                        <span className="text-red-400">
                          ${(businesses.reduce((sum, b) => sum + b.currentSoftwareCost * 12, 0)).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Synergies:</span>
                        <span className="text-red-400">$0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">ROI:</span>
                        <span className="text-red-400">-15%</span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-yellow-700 bg-yellow-900/20 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-400 mb-3">Enterprise Solution</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Cost:</span>
                        <span className="text-yellow-400">
                          ${(businesses.length * 50000).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Synergies:</span>
                        <span className="text-yellow-400">Limited</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">ROI:</span>
                        <span className="text-yellow-400">150%</span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-green-700 bg-green-900/20 rounded-lg p-4">
                    <h4 className="font-medium text-green-400 mb-3">CoreFlow360</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Cost:</span>
                        <span className="text-green-400">
                          ${portfolioROI.totalPortfolioROI.totalInvestment.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Synergies:</span>
                        <span className="text-green-400">
                          ${portfolioROI.portfolioSynergies.totalSynergies.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">ROI:</span>
                        <span className="text-green-400">
                          {Math.round(portfolioROI.totalPortfolioROI.netROI)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}

export default ROIDemonstrationTool