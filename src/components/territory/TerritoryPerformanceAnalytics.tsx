'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChartBarIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  ArrowTrendingDownIcon as TrendingDownIcon,
  MapIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ClockIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CalendarIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { Territory, TerritoryAnalytics } from '@/types/territory'

interface TerritoryPerformanceAnalyticsProps {
  territories: Territory[]
  userId?: string
  tenantId: string
  className?: string
}

interface PerformanceMetrics {
  territory: Territory
  analytics: TerritoryAnalytics
  trends: {
    revenue: number // % change
    conversion: number // % change
    efficiency: number // % change
    satisfaction: number // % change
  }
  benchmarks: {
    revenuePerVisit: number
    conversionRate: number
    customerSatisfaction: number
    territoryEfficiency: number
  }
  insights: string[]
  recommendations: string[]
}

interface CompetitiveAnalysis {
  territoryId: string
  competitorActivity: number
  marketShare: number
  winRate: number
  threatLevel: 'low' | 'medium' | 'high'
  keyCompetitors: string[]
}

export default function TerritoryPerformanceAnalytics({
  territories,
  userId,
  tenantId,
  className = ''
}: TerritoryPerformanceAnalyticsProps) {
  const [performanceData, setPerformanceData] = useState<PerformanceMetrics[]>([])
  const [competitiveData, setCompetitiveData] = useState<CompetitiveAnalysis[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month')
  const [selectedTerritory, setSelectedTerritory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'competitive' | 'forecasting'>('overview')

  useEffect(() => {
    loadPerformanceAnalytics()
  }, [territories, selectedPeriod, userId])

  const loadPerformanceAnalytics = async () => {
    try {
      setLoading(true)
      
      // Simulate AI-powered analytics processing
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const mockPerformanceData: PerformanceMetrics[] = territories.map(territory => ({
        territory,
        analytics: {
          id: `analytics-${territory.id}`,
          territoryId: territory.id,
          userId: territory.assignedUserId,
          periodStart: '2024-08-01T00:00:00Z',
          periodEnd: '2024-08-31T23:59:59Z',
          periodType: selectedPeriod,
          visitsPlanned: Math.floor(Math.random() * 20) + 10,
          visitsCompleted: Math.floor(Math.random() * 18) + 8,
          totalVisitTime: Math.floor(Math.random() * 1000) + 1500,
          newLeads: Math.floor(Math.random() * 30) + 15,
          qualifiedLeads: Math.floor(Math.random() * 25) + 10,
          leadsConverted: Math.floor(Math.random() * 15) + 5,
          conversionRate: territory.leadConversionRate + (Math.random() * 0.1 - 0.05),
          pipelineValue: Math.floor(Math.random() * 500000) + 300000,
          closedRevenue: Math.floor(Math.random() * 200000) + 100000,
          avgDealSize: territory.avgDealValue + (Math.random() * 20000 - 10000),
          milesTravel: Math.floor(Math.random() * 200) + 200,
          fuelCost: Math.floor(Math.random() * 50) + 75,
          timeUtilization: Math.random() * 0.3 + 0.7,
          newCustomers: Math.floor(Math.random() * 8) + 2,
          customerMeetings: Math.floor(Math.random() * 25) + 15,
          satisfactionScore: territory.customerSatisfaction + (Math.random() * 0.4 - 0.2),
          competitorMentions: Math.floor(Math.random() * 15) + 5,
          lostToCompetitors: Math.floor(Math.random() * 5) + 1,
          competitiveWins: Math.floor(Math.random() * 8) + 2,
          performanceScore: Math.random() * 0.3 + 0.7,
          improvementAreas: [
            'Follow-up response time',
            'Competitive positioning',
            'Territory coverage depth'
          ],
          recommendations: {
            frequency: 'Consider weekly visits for high-potential accounts',
            focus: 'Target enterprise segment for Q4',
            efficiency: 'Optimize route planning to reduce travel time'
          },
          recordedAt: '2024-08-11T12:00:00Z'
        },
        trends: {
          revenue: (Math.random() * 0.6 - 0.1), // -10% to +50%
          conversion: (Math.random() * 0.4 - 0.1), // -10% to +30%
          efficiency: (Math.random() * 0.3 - 0.05), // -5% to +25%
          satisfaction: (Math.random() * 0.2 - 0.05) // -5% to +15%
        },
        benchmarks: {
          revenuePerVisit: Math.floor(Math.random() * 5000) + 8000,
          conversionRate: 0.28,
          customerSatisfaction: 4.2,
          territoryEfficiency: 0.85
        },
        insights: [
          'Territory shows 25% above-average conversion rate',
          'Customer satisfaction trending upward (+12%)',
          'Competitive activity increasing in Q4',
          'High-value prospects concentrated in tech corridor'
        ],
        recommendations: [
          'Increase visit frequency to capitalize on momentum',
          'Focus on enterprise accounts for higher deal values',
          'Implement competitive battle cards for key accounts',
          'Schedule territory deep-dive session with manager'
        ]
      }))

      const mockCompetitiveData: CompetitiveAnalysis[] = territories.map(territory => ({
        territoryId: territory.id,
        competitorActivity: territory.competitiveActivity,
        marketShare: Math.random() * 0.3 + 0.15, // 15-45% market share
        winRate: Math.random() * 0.4 + 0.5, // 50-90% win rate
        threatLevel: territory.competitiveActivity > 7 ? 'high' : territory.competitiveActivity > 4 ? 'medium' : 'low',
        keyCompetitors: ['Salesforce', 'HubSpot', 'Microsoft Dynamics', 'Pipedrive'].slice(0, Math.floor(Math.random() * 3) + 2)
      }))

      setPerformanceData(mockPerformanceData)
      setCompetitiveData(mockCompetitiveData)
      
    } catch (error) {
      console.error('Failed to load performance analytics:', error)
    } finally {
      setLoading(false)
    }
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

  const getTrendIcon = (trend: number) => {
    if (trend > 0.05) return <TrendingUpIcon className="h-4 w-4 text-green-600" />
    if (trend < -0.05) return <TrendingDownIcon className="h-4 w-4 text-red-600" />
    return <span className="h-4 w-4 text-gray-400">→</span>
  }

  const getTrendColor = (trend: number) => {
    if (trend > 0.05) return 'text-green-600'
    if (trend < -0.05) return 'text-red-600'
    return 'text-gray-600'
  }

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-8 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Analyzing territory performance...</p>
            <p className="text-sm text-gray-500 mt-2">Processing analytics • Calculating trends • Generating insights</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header & Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <ChartBarIcon className="h-8 w-8 mr-3 text-blue-600" />
              Territory Performance Analytics
            </h2>
            <p className="text-gray-600 mt-1">AI-powered insights and competitive intelligence</p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Period Selection */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>

            {/* View Mode Toggle */}
            <div className="inline-flex rounded-lg shadow-sm">
              {(['overview', 'detailed', 'competitive', 'forecasting'] as const).map((mode, index) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 text-sm font-medium border ${
                    viewMode === mode
                      ? 'bg-blue-600 text-white border-blue-600 z-10'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  } ${
                    index === 0 ? 'rounded-l-lg' : index === 3 ? 'rounded-r-lg' : ''
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            <button
              onClick={loadPerformanceAnalytics}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Overview Mode */}
        {viewMode === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Overall Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {performanceData.map((data, index) => (
                <motion.div
                  key={data.territory.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">{data.territory.name}</h3>
                    <div className={`px-2 py-1 text-xs rounded-full ${
                      data.analytics.performanceScore > 0.8 ? 'bg-green-100 text-green-800' :
                      data.analytics.performanceScore > 0.6 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {Math.round(data.analytics.performanceScore * 100)}% Performance
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Revenue</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{formatCurrency(data.analytics.closedRevenue)}</span>
                        <div className="flex items-center">
                          {getTrendIcon(data.trends.revenue)}
                          <span className={`text-xs ${getTrendColor(data.trends.revenue)}`}>
                            {formatPercentage(data.trends.revenue)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Conversion Rate</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{Math.round(data.analytics.conversionRate * 100)}%</span>
                        <div className="flex items-center">
                          {getTrendIcon(data.trends.conversion)}
                          <span className={`text-xs ${getTrendColor(data.trends.conversion)}`}>
                            {formatPercentage(data.trends.conversion)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Efficiency</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{Math.round(data.analytics.timeUtilization * 100)}%</span>
                        <div className="flex items-center">
                          {getTrendIcon(data.trends.efficiency)}
                          <span className={`text-xs ${getTrendColor(data.trends.efficiency)}`}>
                            {formatPercentage(data.trends.efficiency)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Satisfaction</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{data.analytics.satisfactionScore.toFixed(1)}/5</span>
                        <div className="flex items-center">
                          {getTrendIcon(data.trends.satisfaction)}
                          <span className={`text-xs ${getTrendColor(data.trends.satisfaction)}`}>
                            {formatPercentage(data.trends.satisfaction)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedTerritory(data.territory.id)}
                    className="w-full mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium"
                  >
                    View Details
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Territory Comparison Chart Placeholder */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Territory Performance Comparison</h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Interactive Performance Chart</p>
                  <p className="text-sm text-gray-400">Revenue, conversion, and efficiency trends</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Competitive Analysis Mode */}
        {viewMode === 'competitive' && (
          <motion.div
            key="competitive"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {competitiveData.map((data) => {
                const territoryData = performanceData.find(p => p.territory.id === data.territoryId)
                if (!territoryData) return null

                return (
                  <div key={data.territoryId} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">{territoryData.territory.name}</h3>
                      <span className={`px-3 py-1 text-sm rounded-full border ${getThreatLevelColor(data.threatLevel)}`}>
                        {data.threatLevel.charAt(0).toUpperCase() + data.threatLevel.slice(1)} Threat
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">{Math.round(data.marketShare * 100)}%</div>
                          <div className="text-xs text-gray-600">Market Share</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">{Math.round(data.winRate * 100)}%</div>
                          <div className="text-xs text-gray-600">Win Rate</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-orange-600">{data.competitorActivity}</div>
                          <div className="text-xs text-gray-600">Activity Level</div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Key Competitors</h4>
                        <div className="flex flex-wrap gap-2">
                          {data.keyCompetitors.map((competitor) => (
                            <span key={competitor} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                              {competitor}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-700 mb-2">Competitive Insights</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• {territoryData.analytics.competitiveWins} wins vs {territoryData.analytics.lostToCompetitors} losses this period</li>
                          <li>• {territoryData.analytics.competitorMentions} competitor mentions in sales calls</li>
                          <li>• {data.threatLevel === 'high' ? 'High competitive pressure requires aggressive response' : 
                               data.threatLevel === 'medium' ? 'Moderate competition - maintain vigilance' : 
                               'Low competitive threat - focus on market expansion'}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* AI Insights & Recommendations */}
        {viewMode === 'detailed' && (
          <motion.div
            key="detailed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {performanceData.map((data) => (
              <div key={data.territory.id} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-6">{data.territory.name} - Detailed Analysis</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* AI Insights */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                      <TrophyIcon className="h-5 w-5 mr-2" />
                      AI Performance Insights
                    </h4>
                    <ul className="space-y-2 text-sm">
                      {data.insights.map((insight, index) => (
                        <li key={index} className="text-blue-800 flex items-start">
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                      <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                      AI Recommendations
                    </h4>
                    <ul className="space-y-2 text-sm">
                      {data.recommendations.map((rec, index) => (
                        <li key={index} className="text-green-800 flex items-start">
                          <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900">{data.analytics.visitsCompleted}/{data.analytics.visitsPlanned}</div>
                    <div className="text-xs text-gray-600">Visits Completed</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900">{data.analytics.newLeads}</div>
                    <div className="text-xs text-gray-600">New Leads</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(data.analytics.avgDealSize)}</div>
                    <div className="text-xs text-gray-600">Avg Deal Size</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900">{Math.round(data.analytics.timeUtilization * 100)}%</div>
                    <div className="text-xs text-gray-600">Time Utilization</div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}