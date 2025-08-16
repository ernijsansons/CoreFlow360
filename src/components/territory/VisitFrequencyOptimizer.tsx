'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CalendarIcon,
  ChartBarIcon,
  BoltIcon,
  TrendingUpIcon,
  ClockIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { Territory, TerritoryOptimizationSuggestions } from '@/types/territory'

interface VisitFrequencyOptimizerProps {
  territory: Territory
  onOptimize: (territoryId: string, newFrequency: string) => void
  className?: string
}

interface FrequencyAnalysis {
  current: {
    frequency: string
    visitsPerMonth: number
    avgRevenue: number
    conversionRate: number
    cost: number
  }
  recommended: {
    frequency: string
    visitsPerMonth: number
    projectedRevenue: number
    projectedConversion: number
    projectedCost: number
    confidenceScore: number
  }
  impact: {
    revenueIncrease: number
    conversionImprovement: number
    costChange: number
    efficiencyGain: number
    roiImprovement: number
  }
  reasoning: string[]
}

export default function VisitFrequencyOptimizer({
  territory,
  onOptimize,
  className = ''
}: VisitFrequencyOptimizerProps) {
  const [analysis, setAnalysis] = useState<FrequencyAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedFrequency, setSelectedFrequency] = useState<string>(territory.visitFrequency)
  const [showDetails, setShowDetails] = useState(false)

  const frequencyOptions = [
    { value: 'weekly', label: 'Weekly', visits: 4.3 },
    { value: 'biweekly', label: 'Bi-weekly', visits: 2.2 },
    { value: 'monthly', label: 'Monthly', visits: 1 },
    { value: 'quarterly', label: 'Quarterly', visits: 0.33 }
  ]

  useEffect(() => {
    analyzeVisitFrequency()
  }, [territory])

  const analyzeVisitFrequency = async () => {
    try {
      setLoading(true)
      
      // Simulate AI analysis with territory-specific factors
      await new Promise(resolve => setTimeout(resolve, 1500)) // AI processing time
      
      const currentVisits = getCurrentVisitsPerMonth(territory.visitFrequency)
      const recommendedFrequency = calculateOptimalFrequency(territory)
      const recommendedVisits = getCurrentVisitsPerMonth(recommendedFrequency)
      
      const mockAnalysis: FrequencyAnalysis = {
        current: {
          frequency: territory.visitFrequency,
          visitsPerMonth: currentVisits,
          avgRevenue: territory.avgDealValue * territory.leadConversionRate * currentVisits,
          conversionRate: territory.leadConversionRate,
          cost: calculateTerritoryVisitCost(currentVisits)
        },
        recommended: {
          frequency: recommendedFrequency,
          visitsPerMonth: recommendedVisits,
          projectedRevenue: territory.avgDealValue * (territory.leadConversionRate * 1.25) * recommendedVisits,
          projectedConversion: territory.leadConversionRate * 1.15,
          projectedCost: calculateTerritoryVisitCost(recommendedVisits),
          confidenceScore: 0.87
        },
        impact: {
          revenueIncrease: 0.35,
          conversionImprovement: 0.15,
          costChange: 0.25,
          efficiencyGain: 0.12,
          roiImprovement: 0.28
        },
        reasoning: [
          'High lead density (25 leads/sq mile) justifies increased frequency',
          'Competitive activity score of 8/10 requires more presence',
          'Current conversion rate of 32% shows strong territory potential',
          'Customer satisfaction of 4.4/5 indicates receptive market',
          'Market penetration at 25% leaves significant opportunity'
        ]
      }
      
      setAnalysis(mockAnalysis)
      setSelectedFrequency(recommendedFrequency)
      
    } catch (error) {
      console.error('Failed to analyze visit frequency:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCurrentVisitsPerMonth = (frequency: string): number => {
    const option = frequencyOptions.find(opt => opt.value === frequency)
    return option?.visits || 1
  }

  const calculateOptimalFrequency = (territory: Territory): string => {
    // AI logic to determine optimal frequency based on territory characteristics
    const score = 
      (territory.leadConversionRate * 30) + // 30% weight for conversion rate
      (territory.competitiveActivity * 5) + // 5% weight per competitive activity point
      (territory.marketPenetration < 0.3 ? 20 : 0) + // 20% bonus for low penetration
      (territory.priority * 2) + // 2% per priority point
      (territory.customerSatisfaction > 4.0 ? 15 : 0) // 15% bonus for high satisfaction
    
    if (score >= 70) return 'weekly'
    if (score >= 50) return 'biweekly'
    if (score >= 30) return 'monthly'
    return 'quarterly'
  }

  const calculateTerritoryVisitCost = (visitsPerMonth: number): number => {
    const costPerVisit = 150 // Average cost including travel, time, etc.
    return visitsPerMonth * costPerVisit
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${Math.round(value * 100)}%`
  }

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'weekly': return 'bg-green-100 text-green-800 border-green-200'
      case 'biweekly': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'monthly': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'quarterly': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getImpactColor = (value: number) => {
    if (value > 0.2) return 'text-green-600'
    if (value > 0.1) return 'text-blue-600'
    if (value > 0) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">AI analyzing optimal visit frequency...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="text-center text-gray-500">
          Failed to analyze territory visit frequency
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <BoltIcon className="h-5 w-5 mr-2" />
              Visit Frequency Optimizer
            </h3>
            <p className="text-blue-100 text-sm mt-1">AI-powered visit planning for {territory.name}</p>
          </div>
          <div className="text-right">
            <div className="text-white text-sm">Confidence Score</div>
            <div className="text-2xl font-bold text-white">{Math.round(analysis.recommended.confidenceScore * 100)}%</div>
          </div>
        </div>
      </div>

      {/* Current vs Recommended */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Current Performance */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <ClockIcon className="h-4 w-4 mr-2 text-gray-600" />
              Current Performance
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Visit Frequency</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getFrequencyColor(analysis.current.frequency)}`}>
                  {analysis.current.frequency.charAt(0).toUpperCase() + analysis.current.frequency.slice(1)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Visits/Month</span>
                <span className="font-semibold">{analysis.current.visitsPerMonth.toFixed(1)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Monthly Revenue</span>
                <span className="font-semibold">{formatCurrency(analysis.current.avgRevenue)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Conversion Rate</span>
                <span className="font-semibold">{Math.round(analysis.current.conversionRate * 100)}%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Monthly Cost</span>
                <span className="font-semibold">{formatCurrency(analysis.current.cost)}</span>
              </div>
            </div>
          </div>

          {/* Recommended Performance */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 border-2 border-green-200">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <TrendingUpIcon className="h-4 w-4 mr-2 text-green-600" />
              AI Recommendation
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Optimal Frequency</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getFrequencyColor(analysis.recommended.frequency)}`}>
                  {analysis.recommended.frequency.charAt(0).toUpperCase() + analysis.recommended.frequency.slice(1)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Visits/Month</span>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{analysis.recommended.visitsPerMonth.toFixed(1)}</span>
                  {analysis.recommended.visitsPerMonth > analysis.current.visitsPerMonth && (
                    <span className="text-xs text-green-600 font-medium">
                      (+{(analysis.recommended.visitsPerMonth - analysis.current.visitsPerMonth).toFixed(1)})
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Projected Revenue</span>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{formatCurrency(analysis.recommended.projectedRevenue)}</span>
                  <span className={`text-xs font-medium ${getImpactColor(analysis.impact.revenueIncrease)}`}>
                    {formatPercentage(analysis.impact.revenueIncrease)}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Projected Conversion</span>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{Math.round(analysis.recommended.projectedConversion * 100)}%</span>
                  <span className={`text-xs font-medium ${getImpactColor(analysis.impact.conversionImprovement)}`}>
                    {formatPercentage(analysis.impact.conversionImprovement)}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Monthly Cost</span>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{formatCurrency(analysis.recommended.projectedCost)}</span>
                  <span className={`text-xs font-medium ${analysis.impact.costChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatPercentage(analysis.impact.costChange)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Impact Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <ChartBarIcon className="h-4 w-4 mr-2 text-blue-600" />
            Expected Impact
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getImpactColor(analysis.impact.revenueIncrease)}`}>
                {formatPercentage(analysis.impact.revenueIncrease)}
              </div>
              <div className="text-xs text-gray-600">Revenue Increase</div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${getImpactColor(analysis.impact.conversionImprovement)}`}>
                {formatPercentage(analysis.impact.conversionImprovement)}
              </div>
              <div className="text-xs text-gray-600">Conversion Boost</div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${getImpactColor(analysis.impact.efficiencyGain)}`}>
                {formatPercentage(analysis.impact.efficiencyGain)}
              </div>
              <div className="text-xs text-gray-600">Efficiency Gain</div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${getImpactColor(analysis.impact.roiImprovement)}`}>
                {formatPercentage(analysis.impact.roiImprovement)}
              </div>
              <div className="text-xs text-gray-600">ROI Improvement</div>
            </div>
          </div>
        </div>

        {/* AI Reasoning */}
        <div className="mb-6">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-semibold text-gray-900 flex items-center">
              <BoltIcon className="h-4 w-4 mr-2 text-purple-600" />
              AI Analysis Reasoning
            </h4>
            <motion.div
              animate={{ rotate: showDetails ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              ▼
            </motion.div>
          </button>
          
          <motion.div
            initial={false}
            animate={{ height: showDetails ? 'auto' : 0, opacity: showDetails ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2">
              {analysis.reasoning.map((reason, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{reason}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Frequency Selection */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Select Visit Frequency</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {frequencyOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedFrequency(option.value)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedFrequency === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-sm font-medium">{option.label}</div>
                <div className="text-xs text-gray-600">{option.visits} visits/month</div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {selectedFrequency !== territory.visitFrequency && (
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
                <span>Frequency change will take effect next planning cycle</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedFrequency(territory.visitFrequency)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Reset
            </button>
            
            <button
              onClick={() => onOptimize(territory.id, selectedFrequency)}
              disabled={selectedFrequency === territory.visitFrequency}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {selectedFrequency === analysis.recommended.frequency ? 'Apply AI Recommendation' : 'Update Frequency'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}