'use client'

/**
 * Portfolio Intelligence Dashboard
 * 
 * Comprehensive dashboard for multi-business portfolio coordination,
 * cross-business analytics, and intelligent resource allocation.
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BusinessPortfolio {
  id: string
  name: string
  description?: string
  portfolioType: 'STANDARD' | 'ENTERPRISE' | 'HOLDING_COMPANY'
  
  // Portfolio Metrics
  totalBusinesses: number
  totalRevenue: number
  totalEmployees: number
  totalCustomers: number
  portfolioValue: number
  
  // Intelligence Metrics
  intelligenceScore: number // 0-100
  automationLevel: number // 0-100
  synergyRating: number // 0-100
  efficiencyIndex: number // 0-100
  
  // Performance Tracking
  quarterlyGrowth: number
  yearOverYearGrowth: number
  profitMargin: number
}

interface PortfolioIntelligence {
  id: string
  intelligenceType: 'CROSS_SELLING' | 'RESOURCE_SHARING' | 'DATA_INSIGHTS' | 'OPERATIONAL_SYNC'
  category: 'REVENUE' | 'EFFICIENCY' | 'COST_REDUCTION' | 'GROWTH'
  title: string
  description: string
  impact: 'HIGH' | 'MEDIUM' | 'LOW'
  confidenceLevel: number
  affectedBusinesses: string[]
  estimatedValue: number
  status: 'IDENTIFIED' | 'PLANNED' | 'IN_PROGRESS' | 'IMPLEMENTED' | 'DECLINED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
}

interface CrossBusinessMetric {
  id: string
  metricName: string
  metricType: 'REVENUE' | 'EFFICIENCY' | 'CUSTOMER' | 'OPERATIONAL' | 'FINANCIAL'
  currentValue: number
  previousValue: number
  targetValue?: number
  changePercentage: number
  businessBreakdown: { [businessId: string]: number }
  trendAnalysis: any
}

interface PortfolioIntelligenceDashboardProps {
  portfolioId?: string
  className?: string
}

const PortfolioIntelligenceDashboard: React.FC<PortfolioIntelligenceDashboardProps> = ({
  portfolioId = 'demo-portfolio',
  className = ''
}) => {
  const [portfolio, setPortfolio] = useState<BusinessPortfolio | null>(null)
  const [intelligenceInsights, setIntelligenceInsights] = useState<PortfolioIntelligence[]>([])
  const [crossBusinessMetrics, setCrossBusinessMetrics] = useState<CrossBusinessMetric[]>([])
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7D' | '30D' | '90D' | '1Y'>('30D')
  const [selectedView, setSelectedView] = useState<'OVERVIEW' | 'INTELLIGENCE' | 'METRICS' | 'ALLOCATION'>('OVERVIEW')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadPortfolioData()
  }, [portfolioId, selectedTimeframe])

  const loadPortfolioData = async () => {
    setIsLoading(true)
    
    // Mock portfolio data - in production, fetch from API
    const mockPortfolio: BusinessPortfolio = {
      id: portfolioId,
      name: 'TechFlow Business Empire',
      description: 'Multi-business technology and services portfolio',
      portfolioType: 'ENTERPRISE',
      totalBusinesses: 5,
      totalRevenue: 12500000,
      totalEmployees: 287,
      totalCustomers: 8432,
      portfolioValue: 45000000,
      intelligenceScore: 87,
      automationLevel: 74,
      synergyRating: 91,
      efficiencyIndex: 83,
      quarterlyGrowth: 12.5,
      yearOverYearGrowth: 34.2,
      profitMargin: 18.7
    }

    const mockIntelligence: PortfolioIntelligence[] = [
      {
        id: 'intel-001',
        intelligenceType: 'CROSS_SELLING',
        category: 'REVENUE',
        title: 'Cross-Sell HVAC Maintenance to Software Clients',
        description: 'Software business clients have high overlap with HVAC service needs. Estimated 47% conversion opportunity.',
        impact: 'HIGH',
        confidenceLevel: 89,
        affectedBusinesses: ['business-001', 'business-003'],
        estimatedValue: 285000,
        status: 'IDENTIFIED',
        priority: 'HIGH'
      },
      {
        id: 'intel-002',
        intelligenceType: 'RESOURCE_SHARING',
        category: 'EFFICIENCY',
        title: 'Shared Customer Service Team',
        description: 'Consolidate customer service across 3 businesses to reduce costs and improve response times.',
        impact: 'MEDIUM',
        confidenceLevel: 82,
        affectedBusinesses: ['business-001', 'business-002', 'business-004'],
        estimatedValue: 120000,
        status: 'PLANNED',
        priority: 'MEDIUM'
      },
      {
        id: 'intel-003',
        intelligenceType: 'DATA_INSIGHTS',
        category: 'GROWTH',
        title: 'Market Expansion Opportunity',
        description: 'Combined data analysis reveals untapped market in Denver region with 73% success probability.',
        impact: 'HIGH',
        confidenceLevel: 94,
        affectedBusinesses: ['business-002', 'business-005'],
        estimatedValue: 450000,
        status: 'IN_PROGRESS',
        priority: 'URGENT'
      }
    ]

    const mockMetrics: CrossBusinessMetric[] = [
      {
        id: 'metric-001',
        metricName: 'Portfolio Revenue',
        metricType: 'REVENUE',
        currentValue: 12500000,
        previousValue: 11200000,
        targetValue: 15000000,
        changePercentage: 11.6,
        businessBreakdown: {
          'business-001': 4200000,
          'business-002': 3100000,
          'business-003': 2800000,
          'business-004': 1900000,
          'business-005': 500000
        },
        trendAnalysis: { trend: 'UP', strength: 'STRONG' }
      },
      {
        id: 'metric-002',
        metricName: 'Cross-Business Efficiency',
        metricType: 'EFFICIENCY',
        currentValue: 83,
        previousValue: 77,
        targetValue: 90,
        changePercentage: 7.8,
        businessBreakdown: {
          'business-001': 89,
          'business-002': 85,
          'business-003': 81,
          'business-004': 78,
          'business-005': 82
        },
        trendAnalysis: { trend: 'UP', strength: 'MODERATE' }
      }
    ]

    setTimeout(() => {
      setPortfolio(mockPortfolio)
      setIntelligenceInsights(mockIntelligence)
      setCrossBusinessMetrics(mockMetrics)
      setIsLoading(false)
    }, 1000)
  }

  const getIntelligenceIcon = (type: string) => {
    switch (type) {
      case 'CROSS_SELLING': return '🎯'
      case 'RESOURCE_SHARING': return '🔄'
      case 'DATA_INSIGHTS': return '📊'
      case 'OPERATIONAL_SYNC': return '⚡'
      default: return '🧠'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'HIGH': return 'text-green-400 bg-green-500/20'
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/20'
      case 'LOW': return 'text-blue-400 bg-blue-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'HIGH': return 'text-orange-400 bg-orange-500/20 border-orange-500/30'
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'LOW': return 'text-green-400 bg-green-500/20 border-green-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`
    } else {
      return `$${amount.toLocaleString()}`
    }
  }

  if (!portfolio) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading portfolio intelligence...</div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="rounded-2xl border border-gray-700 bg-gradient-to-r from-gray-900 to-black p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">🏢 Portfolio Intelligence Dashboard</h1>
            <p className="text-gray-400">{portfolio.name} • {portfolio.totalBusinesses} Businesses</p>
          </div>
          <div className="flex items-center space-x-4">
            <select 
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as any)}
              className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="7D">Last 7 Days</option>
              <option value="30D">Last 30 Days</option>
              <option value="90D">Last 90 Days</option>
              <option value="1Y">Last Year</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-cyan-400">{portfolio.intelligenceScore}</div>
            <div className="text-sm text-gray-400">Intelligence Score</div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-cyan-500 h-2 rounded-full"
                style={{ width: `${portfolio.intelligenceScore}%` }}
              />
            </div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-400">{portfolio.synergyRating}</div>
            <div className="text-sm text-gray-400">Synergy Rating</div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-purple-500 h-2 rounded-full"
                style={{ width: `${portfolio.synergyRating}%` }}
              />
            </div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">{formatCurrency(portfolio.totalRevenue)}</div>
            <div className="text-sm text-gray-400">Total Revenue</div>
            <div className="text-xs text-green-400 mt-1">
              +{portfolio.quarterlyGrowth}% this quarter
            </div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-400">{portfolio.efficiencyIndex}</div>
            <div className="text-sm text-gray-400">Efficiency Index</div>
            <div className="text-xs text-yellow-400 mt-1">
              {portfolio.automationLevel}% automated
            </div>
          </div>
        </div>

        {/* View Navigation */}
        <div className="flex space-x-2 mt-6">
          {[
            { key: 'OVERVIEW', label: 'Overview', icon: '📊' },
            { key: 'INTELLIGENCE', label: 'Intelligence', icon: '🧠' },
            { key: 'METRICS', label: 'Metrics', icon: '📈' },
            { key: 'ALLOCATION', label: 'Resources', icon: '⚡' }
          ].map((view) => (
            <button
              key={view.key}
              onClick={() => setSelectedView(view.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedView === view.key
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {view.icon} {view.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview View */}
      {selectedView === 'OVERVIEW' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Portfolio Performance */}
          <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
            <h3 className="text-lg font-bold text-white mb-4">📈 Portfolio Performance</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                <div>
                  <div className="text-white font-medium">Total Portfolio Value</div>
                  <div className="text-sm text-gray-400">{formatCurrency(portfolio.portfolioValue)}</div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-medium">+{portfolio.yearOverYearGrowth}%</div>
                  <div className="text-xs text-gray-400">Year over year</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                <div>
                  <div className="text-white font-medium">Profit Margin</div>
                  <div className="text-sm text-gray-400">{portfolio.profitMargin}%</div>
                </div>
                <div className="text-right">
                  <div className="text-cyan-400 font-medium">{portfolio.totalEmployees}</div>
                  <div className="text-xs text-gray-400">Total employees</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                <div>
                  <div className="text-white font-medium">Customer Base</div>
                  <div className="text-sm text-gray-400">{portfolio.totalCustomers.toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-purple-400 font-medium">{portfolio.totalBusinesses}</div>
                  <div className="text-xs text-gray-400">Active businesses</div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Intelligence Insights */}
          <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
            <h3 className="text-lg font-bold text-white mb-4">🧠 Top Intelligence Insights</h3>
            
            <div className="space-y-3">
              {intelligenceInsights.slice(0, 3).map((insight) => (
                <div key={insight.id} className="p-3 bg-black/30 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getIntelligenceIcon(insight.intelligenceType)}</span>
                      <h4 className="font-medium text-white text-sm">{insight.title}</h4>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                      {insight.priority}
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-400 mb-2">{insight.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className={`px-2 py-1 rounded text-xs ${getImpactColor(insight.impact)}`}>
                      {insight.impact} Impact
                    </div>
                    <div className="text-green-400 font-medium text-sm">
                      {formatCurrency(insight.estimatedValue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Intelligence View */}
      {selectedView === 'INTELLIGENCE' && (
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">🧠 Portfolio Intelligence Insights</h3>
            <div className="flex space-x-2">
              <button className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-4 py-2 rounded-lg text-sm hover:from-purple-500 hover:to-cyan-500">
                Generate New Insights
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {intelligenceInsights.map((insight) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-600 rounded-lg p-4 bg-black/20"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getIntelligenceIcon(insight.intelligenceType)}</span>
                    <div>
                      <h4 className="font-medium text-white">{insight.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded text-xs ${getImpactColor(insight.impact)}`}>
                          {insight.impact}
                        </span>
                        <span className="text-xs text-gray-400">
                          {insight.confidenceLevel}% confidence
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded border text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                    {insight.priority}
                  </div>
                </div>

                <p className="text-sm text-gray-300 mb-3">{insight.description}</p>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-gray-400">Estimated Value:</span>
                    <span className="text-green-400 font-medium ml-1">
                      {formatCurrency(insight.estimatedValue)}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-400">Businesses:</span>
                    <span className="text-cyan-400 ml-1">{insight.affectedBusinesses.length}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-600">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded text-xs ${
                      insight.status === 'IMPLEMENTED' ? 'bg-green-500/20 text-green-400' :
                      insight.status === 'IN_PROGRESS' ? 'bg-yellow-500/20 text-yellow-400' :
                      insight.status === 'PLANNED' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {insight.status.replace('_', ' ')}
                    </span>
                    <button className="text-cyan-400 hover:text-cyan-300 text-sm">
                      View Details →
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics View */}
      {selectedView === 'METRICS' && (
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <h3 className="text-lg font-bold text-white mb-6">📈 Cross-Business Metrics</h3>

          <div className="space-y-6">
            {crossBusinessMetrics.map((metric) => (
              <div key={metric.id} className="border border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-white">{metric.metricName}</h4>
                    <span className="text-sm text-gray-400">{metric.metricType}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-cyan-400">
                      {metric.metricType === 'REVENUE' ? formatCurrency(metric.currentValue) : metric.currentValue}
                    </div>
                    <div className={`text-sm ${metric.changePercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {metric.changePercentage >= 0 ? '+' : ''}{metric.changePercentage.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Business Breakdown:</span>
                    <span className="text-white">Target: {
                      metric.targetValue ? 
                        (metric.metricType === 'REVENUE' ? formatCurrency(metric.targetValue) : metric.targetValue) 
                        : 'Not set'
                    }</span>
                  </div>
                  
                  {Object.entries(metric.businessBreakdown).map(([businessId, value], index) => (
                    <div key={businessId} className="flex items-center justify-between py-1">
                      <span className="text-sm text-gray-400">Business {index + 1}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-cyan-500 h-2 rounded-full"
                            style={{ width: `${(value / metric.currentValue) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-white w-16 text-right">
                          {metric.metricType === 'REVENUE' ? formatCurrency(value) : value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resource Allocation View */}
      {selectedView === 'ALLOCATION' && (
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">⚡ Intelligent Resource Allocation</h3>
            <button className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-4 py-2 rounded-lg text-sm hover:from-purple-500 hover:to-cyan-500">
              Optimize Resources
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Active Allocations */}
            <div className="space-y-4">
              <h4 className="font-medium text-white">Active Allocations</h4>
              
              {[
                {
                  id: 'alloc-001',
                  type: 'EMPLOYEE',
                  name: 'Senior Developer',
                  source: 'Tech Business',
                  target: 'HVAC Business',
                  amount: '20 hours/week',
                  value: '$15K/month',
                  efficiency: 92
                },
                {
                  id: 'alloc-002',
                  type: 'BUDGET',
                  name: 'Marketing Campaign',
                  source: 'Portfolio Fund',
                  target: 'All Businesses',
                  amount: '$50K',
                  value: '$200K ROI',
                  efficiency: 87
                }
              ].map((allocation) => (
                <div key={allocation.id} className="border border-gray-600 rounded-lg p-4 bg-black/20">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h5 className="font-medium text-white">{allocation.name}</h5>
                      <div className="text-sm text-gray-400">{allocation.type}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-medium">{allocation.value}</div>
                      <div className="text-xs text-gray-400">{allocation.efficiency}% efficiency</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">From:</span>
                      <span className="text-white">{allocation.source}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">To:</span>
                      <span className="text-white">{allocation.target}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Amount:</span>
                      <span className="text-cyan-400">{allocation.amount}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${allocation.efficiency}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Optimization Recommendations */}
            <div className="space-y-4">
              <h4 className="font-medium text-white">AI Recommendations</h4>
              
              {[
                {
                  id: 'rec-001',
                  title: 'Consolidate IT Support',
                  description: 'Move all IT support to central team for 23% cost reduction',
                  savings: '$18K/month',
                  confidence: 94,
                  impact: 'HIGH'
                },
                {
                  id: 'rec-002',
                  title: 'Cross-Train Sales Team',
                  description: 'Enable sales team to sell across all business lines',
                  savings: '$32K/month',
                  confidence: 87,
                  impact: 'HIGH'
                }
              ].map((rec) => (
                <div key={rec.id} className="border border-purple-600 rounded-lg p-4 bg-purple-900/20">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h5 className="font-medium text-white">{rec.title}</h5>
                      <div className={`text-xs px-2 py-1 rounded mt-1 ${getImpactColor(rec.impact)}`}>
                        {rec.impact} Impact
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-medium">{rec.savings}</div>
                      <div className="text-xs text-gray-400">{rec.confidence}% confidence</div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-3">{rec.description}</p>
                  
                  <div className="flex space-x-2">
                    <button className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-500">
                      Implement
                    </button>
                    <button className="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-500">
                      Schedule
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-white">Loading portfolio intelligence...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default PortfolioIntelligenceDashboard