/**
 * CoreFlow360 - AI-Powered Business Analytics
 * Advanced predictive analytics and cross-business intelligence
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  Zap,
  BarChart3,
  PieChart,
  Activity,
  Users,
  DollarSign,
  Calendar,
  ArrowRight,
  Lightbulb,
  Sparkles,
  Eye,
  Clock,
  Award,
  Flag,
  Settings,
  RefreshCw,
} from 'lucide-react'

interface BusinessMetric {
  id: string
  name: string
  current: number
  predicted: number
  confidence: number
  trend: 'up' | 'down' | 'stable'
  impact: 'high' | 'medium' | 'low'
}

interface AIInsight {
  id: string
  type: 'opportunity' | 'risk' | 'prediction' | 'recommendation'
  title: string
  description: string
  impact: number // 1-100
  confidence: number // 0-1
  priority: 'high' | 'medium' | 'low'
  actionItems: string[]
  businessIds?: string[]
  category: 'financial' | 'operational' | 'growth' | 'customer'
  timestamp: Date
}

interface BusinessPrediction {
  businessId: string
  businessName: string
  timeframe: '1_month' | '3_months' | '6_months' | '1_year'
  predictions: {
    revenue: { current: number; predicted: number; confidence: number }
    customers: { current: number; predicted: number; confidence: number }
    churn: { current: number; predicted: number; confidence: number }
    profitability: { current: number; predicted: number; confidence: number }
  }
  riskFactors: string[]
  opportunities: string[]
  healthScore: number
}

interface CrossBusinessAnalysis {
  performanceRanking: {
    businessId: string
    businessName: string
    score: number
    trend: 'improving' | 'declining' | 'stable'
  }[]
  synergies: {
    businessIds: string[]
    businessNames: string[]
    synergyType: 'customer_overlap' | 'resource_sharing' | 'cross_selling' | 'operational'
    potentialValue: number
    description: string
  }[]
  riskCorrelations: {
    risk: string
    affectedBusinesses: string[]
    severity: 'high' | 'medium' | 'low'
    mitigation: string[]
  }[]
}

// Mock data - in production this would come from AI models
const mockInsights: AIInsight[] = [
  {
    id: '1',
    type: 'opportunity',
    title: 'Cross-selling Opportunity Identified',
    description:
      'TechFlow Solutions customers show 78% interest overlap with GreenTech Manufacturing products. Implementing cross-selling could increase revenue by $120K annually.',
    impact: 85,
    confidence: 0.82,
    priority: 'high',
    actionItems: [
      'Create joint marketing campaign',
      'Train sales teams on cross-selling',
      'Develop customer transition incentives',
      'Set up referral tracking system',
    ],
    businessIds: ['tech-flow', 'green-tech'],
    category: 'growth',
    timestamp: new Date(),
  },
  {
    id: '2',
    type: 'risk',
    title: 'Customer Churn Risk Rising',
    description:
      'Urban Consulting Group shows increasing churn signals. Customer satisfaction scores dropped 12% in the last quarter, with 23% of enterprise clients at risk.',
    impact: 72,
    confidence: 0.91,
    priority: 'high',
    actionItems: [
      'Conduct customer satisfaction survey',
      'Implement proactive customer success outreach',
      'Review pricing and value proposition',
      'Enhance service delivery processes',
    ],
    businessIds: ['urban-consulting'],
    category: 'customer',
    timestamp: new Date(),
  },
  {
    id: '3',
    type: 'prediction',
    title: 'Revenue Growth Acceleration Expected',
    description:
      'AI models predict 34% revenue growth for RetailMax Plus in Q2 based on seasonal trends, new product launches, and market expansion.',
    impact: 68,
    confidence: 0.76,
    priority: 'medium',
    actionItems: [
      'Scale inventory for anticipated demand',
      'Hire additional customer support staff',
      'Prepare marketing campaigns for peak season',
      'Optimize supply chain logistics',
    ],
    businessIds: ['retail-max'],
    category: 'financial',
    timestamp: new Date(),
  },
  {
    id: '4',
    type: 'recommendation',
    title: 'Operational Efficiency Opportunity',
    description:
      'Cross-business resource sharing analysis reveals potential 18% cost reduction by consolidating IT infrastructure and shared services across all businesses.',
    impact: 76,
    confidence: 0.88,
    priority: 'medium',
    actionItems: [
      'Conduct detailed infrastructure audit',
      'Create shared services roadmap',
      'Negotiate enterprise software licenses',
      'Implement centralized IT management',
    ],
    businessIds: ['tech-flow', 'green-tech', 'urban-consulting', 'retail-max'],
    category: 'operational',
    timestamp: new Date(),
  },
]

const mockPredictions: BusinessPrediction[] = [
  {
    businessId: 'tech-flow',
    businessName: 'TechFlow Solutions',
    timeframe: '6_months',
    predictions: {
      revenue: { current: 1200000, predicted: 1450000, confidence: 0.84 },
      customers: { current: 520, predicted: 650, confidence: 0.79 },
      churn: { current: 3.2, predicted: 2.8, confidence: 0.71 },
      profitability: { current: 37.5, predicted: 42.1, confidence: 0.73 },
    },
    riskFactors: ['Increased competition', 'Key client contract renewal'],
    opportunities: ['New market expansion', 'Product line extension', 'Partnership opportunities'],
    healthScore: 92,
  },
  {
    businessId: 'green-tech',
    businessName: 'GreenTech Manufacturing',
    timeframe: '6_months',
    predictions: {
      revenue: { current: 850000, predicted: 980000, confidence: 0.77 },
      customers: { current: 340, predicted: 385, confidence: 0.82 },
      churn: { current: 4.1, predicted: 3.6, confidence: 0.69 },
      profitability: { current: 32.9, predicted: 35.8, confidence: 0.75 },
    },
    riskFactors: ['Supply chain disruptions', 'Raw material cost increases'],
    opportunities: ['Sustainability trend growth', 'Government incentives', 'B2B market expansion'],
    healthScore: 85,
  },
]

export function AIBusinessAnalytics() {
  const [activeTab, setActiveTab] = useState<'insights' | 'predictions' | 'cross_analysis'>(
    'insights'
  )
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    '1_month' | '3_months' | '6_months' | '1_year'
  >('6_months')
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'financial' | 'operational' | 'growth' | 'customer'
  >('all')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [insights, setInsights] = useState<AIInsight[]>(mockInsights)

  const filteredInsights = insights.filter(
    (insight) => selectedCategory === 'all' || insight.category === selectedCategory
  )

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsRefreshing(false)
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <Lightbulb className="h-5 w-5 text-green-600" />
      case 'risk':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'prediction':
        return <Brain className="h-5 w-5 text-blue-600" />
      case 'recommendation':
        return <Target className="h-5 w-5 text-purple-600" />
      default:
        return <Eye className="h-5 w-5 text-gray-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'low':
        return 'bg-green-50 border-green-200 text-green-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50'
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 p-2">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              AI Business Analytics
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Predictive insights and cross-business intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as unknown)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
          >
            <option value="all">All Categories</option>
            <option value="financial">Financial</option>
            <option value="operational">Operational</option>
            <option value="growth">Growth</option>
            <option value="customer">Customer</option>
          </select>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-8 px-6">
            {[
              {
                id: 'insights',
                label: 'AI Insights',
                icon: Sparkles,
                count: filteredInsights.length,
              },
              {
                id: 'predictions',
                label: 'Business Predictions',
                icon: TrendingUp,
                count: mockPredictions.length,
              },
              { id: 'cross_analysis', label: 'Cross-Business Analysis', icon: BarChart3, count: 3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as unknown)}
                className={`flex items-center space-x-2 border-b-2 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
                <span className="ml-2 rounded-full bg-gray-100 px-2 py-1 text-xs dark:bg-gray-700">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-4">
          {filteredInsights.map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <div className="mb-2 flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {insight.title}
                      </h3>
                      <span
                        className={`rounded-full border px-2 py-1 text-xs font-medium ${getPriorityColor(insight.priority)}`}
                      >
                        {insight.priority} priority
                      </span>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {insight.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                      {insight.description}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="mb-2 flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Impact:</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {insight.impact}%
                    </span>
                  </div>
                  <div
                    className={`rounded-full px-2 py-1 text-xs font-medium ${getConfidenceColor(insight.confidence)}`}
                  >
                    {Math.round(insight.confidence * 100)}% confidence
                  </div>
                </div>
              </div>

              {/* Action Items */}
              <div className="mb-4">
                <h4 className="mb-2 font-medium text-gray-900 dark:text-white">
                  Recommended Actions:
                </h4>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {insight.actionItems.map((action, actionIndex) => (
                    <div key={actionIndex} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-600" />
                      <span className="text-gray-700 dark:text-gray-300">{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Affected Businesses */}
              {insight.businessIds && (
                <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Affects:</span>
                    <div className="flex space-x-2">
                      {insight.businessIds.map((businessId) => (
                        <span
                          key={businessId}
                          className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-700"
                        >
                          {businessId.replace('-', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button className="flex items-center space-x-1 text-sm font-medium text-purple-600 hover:text-purple-700">
                    <span>View Details</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Business Predictions Tab */}
      {activeTab === 'predictions' && (
        <div className="space-y-6">
          {/* Timeframe Selector */}
          <div className="flex items-center justify-center">
            <div className="rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
              {[
                { value: '1_month', label: '1 Month' },
                { value: '3_months', label: '3 Months' },
                { value: '6_months', label: '6 Months' },
                { value: '1_year', label: '1 Year' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedTimeframe(option.value as unknown)}
                  className={`rounded-md px-4 py-2 font-medium transition-colors ${
                    selectedTimeframe === option.value
                      ? 'bg-white text-purple-600 shadow-sm dark:bg-gray-600'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Predictions Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {mockPredictions.map((prediction, index) => (
              <motion.div
                key={prediction.businessId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800"
              >
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {prediction.businessName}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {prediction.healthScore}%
                    </span>
                  </div>
                </div>

                {/* Prediction Metrics */}
                <div className="mb-6 grid grid-cols-2 gap-4">
                  {Object.entries(prediction.predictions).map(([key, pred]) => {
                    const change = ((pred.predicted - pred.current) / pred.current) * 100
                    const isPositive = change > 0

                    return (
                      <div key={key} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                        <p className="mb-1 text-sm text-gray-600 capitalize dark:text-gray-400">
                          {key.replace('_', ' ')}
                        </p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              {key === 'revenue'
                                ? formatCurrency(pred.predicted)
                                : key === 'churn' || key === 'profitability'
                                  ? `${pred.predicted.toFixed(1)}%`
                                  : pred.predicted.toLocaleString()}
                            </p>
                            <div
                              className={`flex items-center space-x-1 text-sm ${
                                isPositive ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {isPositive ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : (
                                <TrendingDown className="h-4 w-4" />
                              )}
                              <span>
                                {isPositive ? '+' : ''}
                                {change.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                          <div
                            className={`rounded px-2 py-1 text-xs font-medium ${getConfidenceColor(pred.confidence)}`}
                          >
                            {Math.round(pred.confidence * 100)}%
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Risk Factors & Opportunities */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 flex items-center font-medium text-gray-900 dark:text-white">
                      <AlertTriangle className="mr-1 h-4 w-4 text-red-500" />
                      Risk Factors
                    </h4>
                    <div className="space-y-1">
                      {prediction.riskFactors.map((risk, riskIndex) => (
                        <p key={riskIndex} className="text-sm text-gray-600 dark:text-gray-400">
                          • {risk}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-2 flex items-center font-medium text-gray-900 dark:text-white">
                      <Lightbulb className="mr-1 h-4 w-4 text-green-500" />
                      Opportunities
                    </h4>
                    <div className="space-y-1">
                      {prediction.opportunities.map((opportunity, oppIndex) => (
                        <p key={oppIndex} className="text-sm text-gray-600 dark:text-gray-400">
                          • {opportunity}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Cross-Business Analysis Tab */}
      {activeTab === 'cross_analysis' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
              Performance Ranking
            </h3>
            <div className="space-y-3">
              {[
                { name: 'TechFlow Solutions', score: 92, trend: 'improving' },
                { name: 'GreenTech Manufacturing', score: 85, trend: 'stable' },
                { name: 'Urban Consulting Group', score: 78, trend: 'declining' },
                { name: 'RetailMax Plus', score: 73, trend: 'improving' },
              ].map((business, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-gray-500">#{index + 1}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {business.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {business.score}%
                    </span>
                    <div
                      className={`rounded-full p-1 ${
                        business.trend === 'improving'
                          ? 'bg-green-50 text-green-600'
                          : business.trend === 'declining'
                            ? 'bg-red-50 text-red-600'
                            : 'bg-gray-50 text-gray-600'
                      }`}
                    >
                      {business.trend === 'improving' ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : business.trend === 'declining' ? (
                        <TrendingDown className="h-4 w-4" />
                      ) : (
                        <Activity className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
              Synergy Opportunities
            </h3>
            <div className="space-y-4">
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-semibold text-green-800 dark:text-green-200">
                    Cross-selling Opportunity
                  </h4>
                  <span className="font-bold text-green-600">$120K potential</span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  TechFlow & GreenTech customer overlap suggests strong cross-selling potential
                </p>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                    Resource Sharing
                  </h4>
                  <span className="font-bold text-blue-600">18% cost reduction</span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Consolidate IT infrastructure across all businesses
                </p>
              </div>

              <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200">
                    Market Expansion
                  </h4>
                  <span className="font-bold text-purple-600">35% growth potential</span>
                </div>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Leverage Urban Consulting's network for Tech & Manufacturing expansion
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
