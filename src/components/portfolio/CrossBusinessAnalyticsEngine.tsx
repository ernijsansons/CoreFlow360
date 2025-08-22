'use client'

/**
 * Cross-Business Analytics Engine
 * 
 * Advanced analytics engine for multi-business intelligence,
 * pattern recognition, and predictive insights across business portfolios.
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AnalyticsMetric {
  id: string
  name: string
  category: 'REVENUE' | 'EFFICIENCY' | 'CUSTOMER' | 'OPERATIONAL' | 'FINANCIAL'
  value: number
  unit: string
  previousValue: number
  trend: 'UP' | 'DOWN' | 'STABLE'
  changePercentage: number
  businessBreakdown: { [businessId: string]: number }
  benchmark: number
  target: number
}

interface BusinessInsight {
  id: string
  type: 'PATTERN' | 'ANOMALY' | 'PREDICTION' | 'OPPORTUNITY' | 'RISK'
  title: string
  description: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  confidence: number
  affectedBusinesses: string[]
  recommendation: string
  estimatedImpact: number
  timeframe: string
  aiGenerated: boolean
}

interface CrossBusinessPattern {
  id: string
  patternType: 'CORRELATION' | 'SEASONALITY' | 'BEHAVIORAL' | 'OPERATIONAL'
  pattern: string
  description: string
  strength: number // 0-100
  businesses: string[]
  metrics: string[]
  discoveredAt: Date
  actionable: boolean
  businessValue: number
}

interface PredictiveModel {
  id: string
  modelName: string
  modelType: 'REVENUE_FORECAST' | 'DEMAND_PREDICTION' | 'RISK_ASSESSMENT' | 'GROWTH_MODEL'
  accuracy: number
  confidence: number
  lastTrained: Date
  predictions: {
    metric: string
    timeframe: string
    predictedValue: number
    confidenceRange: [number, number]
  }[]
}

interface CrossBusinessAnalyticsEngineProps {
  portfolioId?: string
  timeframe?: '7D' | '30D' | '90D' | '1Y'
  className?: string
}

const CrossBusinessAnalyticsEngine: React.FC<CrossBusinessAnalyticsEngineProps> = ({
  portfolioId = 'demo-portfolio',
  timeframe = '30D',
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'METRICS' | 'INSIGHTS' | 'PATTERNS' | 'PREDICTIONS'>('METRICS')
  const [analyticsMetrics, setAnalyticsMetrics] = useState<AnalyticsMetric[]>([])
  const [businessInsights, setBusinessInsights] = useState<BusinessInsight[]>([])
  const [crossBusinessPatterns, setCrossBusinessPatterns] = useState<CrossBusinessPattern[]>([])
  const [predictiveModels, setPredictiveModels] = useState<PredictiveModel[]>([])
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadAnalyticsData()
  }, [portfolioId, timeframe])

  const loadAnalyticsData = async () => {
    setIsLoading(true)

    // Mock analytics data - in production, fetch from API
    const mockMetrics: AnalyticsMetric[] = [
      {
        id: 'metric-001',
        name: 'Cross-Business Revenue Efficiency',
        category: 'REVENUE',
        value: 1.24,
        unit: 'multiplier',
        previousValue: 1.18,
        trend: 'UP',
        changePercentage: 5.1,
        businessBreakdown: {
          'business-001': 1.45,
          'business-002': 1.32,
          'business-003': 1.18,
          'business-004': 1.08,
          'business-005': 1.52
        },
        benchmark: 1.15,
        target: 1.35
      },
      {
        id: 'metric-002',
        name: 'Customer Lifetime Value Sync',
        category: 'CUSTOMER',
        value: 8742,
        unit: 'USD',
        previousValue: 8120,
        trend: 'UP',
        changePercentage: 7.7,
        businessBreakdown: {
          'business-001': 9200,
          'business-002': 8900,
          'business-003': 8100,
          'business-004': 7800,
          'business-005': 9700
        },
        benchmark: 7500,
        target: 10000
      },
      {
        id: 'metric-003',
        name: 'Operational Synergy Index',
        category: 'OPERATIONAL',
        value: 78.5,
        unit: 'percentage',
        previousValue: 71.2,
        trend: 'UP',
        changePercentage: 10.3,
        businessBreakdown: {
          'business-001': 85,
          'business-002': 82,
          'business-003': 75,
          'business-004': 68,
          'business-005': 83
        },
        benchmark: 65,
        target: 85
      }
    ]

    const mockInsights: BusinessInsight[] = [
      {
        id: 'insight-001',
        type: 'OPPORTUNITY',
        title: 'Customer Base Cross-Pollination Opportunity',
        description: 'Analysis reveals 34% customer overlap between Tech and HVAC businesses with untapped cross-selling potential worth $420K annually.',
        severity: 'HIGH',
        confidence: 87,
        affectedBusinesses: ['business-001', 'business-003'],
        recommendation: 'Implement unified CRM system and launch cross-selling campaign targeting overlapping customer segments.',
        estimatedImpact: 420000,
        timeframe: '3-6 months',
        aiGenerated: true
      },
      {
        id: 'insight-002',
        type: 'ANOMALY',
        title: 'Unusual Resource Utilization Pattern',
        description: 'Consulting business showing 45% higher resource efficiency than expected, potentially indicating process improvement opportunity for other businesses.',
        severity: 'MEDIUM',
        confidence: 92,
        affectedBusinesses: ['business-002'],
        recommendation: 'Document and replicate successful processes across portfolio businesses.',
        estimatedImpact: 180000,
        timeframe: '2-4 months',
        aiGenerated: true
      },
      {
        id: 'insight-003',
        type: 'RISK',
        title: 'Customer Concentration Risk Detected',
        description: 'HVAC business has 67% revenue concentration in top 5 customers, creating portfolio risk exposure.',
        severity: 'HIGH',
        confidence: 94,
        affectedBusinesses: ['business-003'],
        recommendation: 'Diversify customer base through targeted acquisition campaigns and expand service offerings.',
        estimatedImpact: -250000,
        timeframe: '6-12 months',
        aiGenerated: true
      }
    ]

    const mockPatterns: CrossBusinessPattern[] = [
      {
        id: 'pattern-001',
        patternType: 'CORRELATION',
        pattern: 'Tech Investment → Service Quality → Revenue Growth',
        description: 'Every $1 invested in technology across businesses correlates with 3.2x improvement in service quality metrics and 18% revenue growth within 6 months.',
        strength: 89,
        businesses: ['business-001', 'business-002', 'business-003'],
        metrics: ['technology_investment', 'service_quality', 'revenue'],
        discoveredAt: new Date('2024-03-15'),
        actionable: true,
        businessValue: 450000
      },
      {
        id: 'pattern-002',
        patternType: 'SEASONALITY',
        pattern: 'Q4 Cross-Business Demand Surge',
        description: 'All businesses experience synchronized 35% demand increase in Q4, suggesting opportunity for coordinated resource allocation.',
        strength: 76,
        businesses: ['business-001', 'business-002', 'business-003', 'business-004', 'business-005'],
        metrics: ['demand', 'resource_utilization', 'capacity'],
        discoveredAt: new Date('2024-03-10'),
        actionable: true,
        businessValue: 320000
      },
      {
        id: 'pattern-003',
        patternType: 'BEHAVIORAL',
        pattern: 'Customer Referral Network Effect',
        description: 'Customers who use 2+ business services have 4.7x higher referral rate and 68% longer retention.',
        strength: 92,
        businesses: ['business-001', 'business-003', 'business-004'],
        metrics: ['customer_retention', 'referral_rate', 'service_usage'],
        discoveredAt: new Date('2024-03-12'),
        actionable: true,
        businessValue: 285000
      }
    ]

    const mockModels: PredictiveModel[] = [
      {
        id: 'model-001',
        modelName: 'Portfolio Revenue Forecaster',
        modelType: 'REVENUE_FORECAST',
        accuracy: 94.2,
        confidence: 89,
        lastTrained: new Date('2024-03-18'),
        predictions: [
          {
            metric: 'Portfolio Revenue',
            timeframe: 'Next Quarter',
            predictedValue: 3950000,
            confidenceRange: [3750000, 4150000]
          },
          {
            metric: 'Cross-Business Synergies',
            timeframe: 'Next Quarter',
            predictedValue: 245000,
            confidenceRange: [210000, 280000]
          }
        ]
      },
      {
        id: 'model-002',
        modelName: 'Customer Churn Predictor',
        modelType: 'RISK_ASSESSMENT',
        accuracy: 87.5,
        confidence: 92,
        lastTrained: new Date('2024-03-17'),
        predictions: [
          {
            metric: 'High-Risk Customers',
            timeframe: 'Next 30 Days',
            predictedValue: 23,
            confidenceRange: [18, 28]
          },
          {
            metric: 'Churn Prevention Value',
            timeframe: 'Next 30 Days',
            predictedValue: 180000,
            confidenceRange: [160000, 200000]
          }
        ]
      }
    ]

    setTimeout(() => {
      setAnalyticsMetrics(mockMetrics)
      setBusinessInsights(mockInsights)
      setCrossBusinessPatterns(mockPatterns)
      setPredictiveModels(mockModels)
      setIsLoading(false)
    }, 1000)
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'UP': return '📈'
      case 'DOWN': return '📉'
      case 'STABLE': return '➡️'
      default: return '📊'
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'UP': return 'text-green-400'
      case 'DOWN': return 'text-red-400'
      case 'STABLE': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'OPPORTUNITY': return '🎯'
      case 'RISK': return '⚠️'
      case 'ANOMALY': return '🔍'
      case 'PREDICTION': return '🔮'
      case 'PATTERN': return '🧩'
      default: return '💡'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'HIGH': return 'text-orange-400 bg-orange-500/20 border-orange-500/30'
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'LOW': return 'text-green-400 bg-green-500/20 border-green-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  const formatValue = (value: number, unit: string) => {
    if (unit === 'USD') {
      return `$${value.toLocaleString()}`
    } else if (unit === 'percentage') {
      return `${value.toFixed(1)}%`
    } else if (unit === 'multiplier') {
      return `${value.toFixed(2)}x`
    } else {
      return `${value.toLocaleString()} ${unit}`
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

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="rounded-2xl border border-gray-700 bg-gradient-to-r from-gray-900 to-black p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">🧠 Cross-Business Analytics Engine</h1>
            <p className="text-gray-400">Advanced multi-business intelligence and pattern recognition</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">{analyticsMetrics.length}</div>
              <div className="text-xs text-gray-400">Active Metrics</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{businessInsights.length}</div>
              <div className="text-xs text-gray-400">AI Insights</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{crossBusinessPatterns.length}</div>
              <div className="text-xs text-gray-400">Patterns Found</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2">
          {[
            { key: 'METRICS', label: 'Analytics Metrics', icon: '📊' },
            { key: 'INSIGHTS', label: 'AI Insights', icon: '💡' },
            { key: 'PATTERNS', label: 'Business Patterns', icon: '🧩' },
            { key: 'PREDICTIONS', label: 'Predictive Models', icon: '🔮' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Metrics Tab */}
      {activeTab === 'METRICS' && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {analyticsMetrics.map((metric) => (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl border p-6 cursor-pointer transition-all ${
                  selectedMetric === metric.id
                    ? 'border-cyan-500 bg-cyan-900/20'
                    : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                }`}
                onClick={() => setSelectedMetric(metric.id === selectedMetric ? null : metric.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-white text-sm">{metric.name}</h3>
                    <span className="text-xs text-gray-400">{metric.category}</span>
                  </div>
                  <span className={`text-lg ${getTrendColor(metric.trend)}`}>
                    {getTrendIcon(metric.trend)}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="text-2xl font-bold text-cyan-400">
                    {formatValue(metric.value, metric.unit)}
                  </div>
                  
                  <div className={`text-sm flex items-center space-x-2 ${getTrendColor(metric.trend)}`}>
                    <span>{metric.changePercentage >= 0 ? '+' : ''}{metric.changePercentage.toFixed(1)}%</span>
                    <span className="text-gray-400">vs previous period</span>
                  </div>

                  <div className="mt-4 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Target</span>
                      <span className="text-white">{formatValue(metric.target, metric.unit)}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-cyan-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (metric.value / metric.target) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Benchmark: {formatValue(metric.benchmark, metric.unit)}</span>
                      <span className="text-cyan-400">{((metric.value / metric.target) * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>

                {selectedMetric === metric.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-gray-600"
                  >
                    <h4 className="text-sm font-medium text-white mb-3">Business Breakdown</h4>
                    <div className="space-y-2">
                      {Object.entries(metric.businessBreakdown).map(([businessId, value], index) => (
                        <div key={businessId} className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Business {index + 1}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-700 rounded-full h-1">
                              <div 
                                className="bg-cyan-500 h-1 rounded-full"
                                style={{ width: `${(value / Math.max(...Object.values(metric.businessBreakdown))) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-white w-12 text-right">
                              {formatValue(value, metric.unit)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* AI Insights Tab */}
      {activeTab === 'INSIGHTS' && (
        <div className="space-y-4">
          {businessInsights.map((insight) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-gray-700 bg-gray-900 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getInsightIcon(insight.type)}</span>
                  <div>
                    <h3 className="font-medium text-white">{insight.title}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded border text-xs ${getSeverityColor(insight.severity)}`}>
                        {insight.severity}
                      </span>
                      <span className="text-xs text-gray-400">
                        {insight.confidence}% confidence
                      </span>
                      {insight.aiGenerated && (
                        <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                          AI Generated
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${insight.estimatedImpact >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(Math.abs(insight.estimatedImpact))}
                  </div>
                  <div className="text-xs text-gray-400">{insight.timeframe}</div>
                </div>
              </div>

              <p className="text-gray-300 mb-4">{insight.description}</p>

              <div className="bg-black/30 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-white mb-2">💡 Recommendation</h4>
                <p className="text-sm text-gray-300">{insight.recommendation}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-gray-400">Affected Businesses: </span>
                  <span className="text-cyan-400">{insight.affectedBusinesses.length}</span>
                </div>
                <div className="flex space-x-2">
                  <button className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-500">
                    Implement
                  </button>
                  <button className="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-500">
                    Schedule
                  </button>
                  <button className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-500">
                    Dismiss
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Business Patterns Tab */}
      {activeTab === 'PATTERNS' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {crossBusinessPatterns.map((pattern) => (
            <motion.div
              key={pattern.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-gray-700 bg-gray-900 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-medium text-white">{pattern.pattern}</h3>
                  <span className="text-sm text-gray-400">{pattern.patternType}</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-400">
                    {formatCurrency(pattern.businessValue)}
                  </div>
                  <div className="text-xs text-gray-400">Business Value</div>
                </div>
              </div>

              <p className="text-gray-300 mb-4">{pattern.description}</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Pattern Strength</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-cyan-500 h-2 rounded-full"
                        style={{ width: `${pattern.strength}%` }}
                      />
                    </div>
                    <span className="text-sm text-white">{pattern.strength}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Businesses Involved</span>
                  <span className="text-sm text-cyan-400">{pattern.businesses.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Metrics Analyzed</span>
                  <span className="text-sm text-purple-400">{pattern.metrics.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Discovered</span>
                  <span className="text-sm text-white">
                    {pattern.discoveredAt.toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {pattern.actionable && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                        Actionable
                      </span>
                    )}
                  </div>
                  <button className="text-cyan-400 hover:text-cyan-300 text-sm">
                    Analyze Pattern →
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Predictive Models Tab */}
      {activeTab === 'PREDICTIONS' && (
        <div className="space-y-6">
          {predictiveModels.map((model) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-gray-700 bg-gray-900 p-6"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">{model.modelName}</h3>
                  <span className="text-sm text-gray-400">{model.modelType.replace('_', ' ')}</span>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="text-sm">
                      <span className="text-gray-400">Accuracy: </span>
                      <span className="text-green-400">{model.accuracy.toFixed(1)}%</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-400">Confidence: </span>
                      <span className="text-cyan-400">{model.confidence}%</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-400">Last Trained: </span>
                      <span className="text-white">{model.lastTrained.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <button className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-4 py-2 rounded-lg text-sm hover:from-purple-500 hover:to-cyan-500">
                  Retrain Model
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {model.predictions.map((prediction, index) => (
                  <div key={index} className="border border-gray-600 rounded-lg p-4 bg-black/20">
                    <h4 className="font-medium text-white mb-2">{prediction.metric}</h4>
                    <div className="text-sm text-gray-400 mb-3">{prediction.timeframe}</div>
                    
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-cyan-400">
                        {formatCurrency(prediction.predictedValue)}
                      </div>
                      
                      <div className="text-sm text-gray-300">
                        Range: {formatCurrency(prediction.confidenceRange[0])} - {formatCurrency(prediction.confidenceRange[1])}
                      </div>
                      
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full"
                          style={{ width: `${model.confidence}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-white">Loading analytics engine...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default CrossBusinessAnalyticsEngine