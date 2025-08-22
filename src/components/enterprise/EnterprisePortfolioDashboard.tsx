'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Building2, 
  TrendingUp, 
  PieChart, 
  BarChart3, 
  Target, 
  Shield, 
  Globe, 
  Users, 
  DollarSign, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  Zap, 
  Brain, 
  Settings, 
  Download, 
  Filter,
  Search,
  Plus,
  Eye,
  TrendingDown,
  Award,
  Briefcase,
  LineChart,
  RefreshCw,
  Bell,
  Star,
  Calendar,
  BookOpen,
  Layers
} from 'lucide-react'

interface EnterprisePortfolio {
  id: string
  enterpriseName: string
  totalBusinesses: number
  totalRevenue: number
  totalEmployees: number
  portfolioValue: number
  performanceScore: number
  riskScore: number
  diversificationIndex: number
  subPortfolios: SubPortfolio[]
  consolidatedMetrics: ConsolidatedMetrics
  aiInsights: AIInsights
}

interface SubPortfolio {
  id: string
  name: string
  businessCount: number
  totalRevenue: number
  performanceScore: number
  riskLevel: string
  strategicFocus: string
}

interface ConsolidatedMetrics {
  totalRevenue: number
  totalProfit: number
  roe: number
  roic: number
  ebitdaMargin: number
  revenueGrowthRate: number
  profitGrowthRate: number
}

interface AIInsights {
  portfolioOptimization: AIRecommendation[]
  riskAssessment: RiskInsight[]
  growthOpportunities: GrowthOpportunity[]
  confidenceScore: number
}

interface AIRecommendation {
  id: string
  type: string
  priority: string
  recommendation: string
  expectedImpact: number
  implementationTimeline: string
}

interface RiskInsight {
  riskType: string
  riskLevel: string
  probability: number
  impact: number
  description: string
}

interface GrowthOpportunity {
  opportunityType: string
  description: string
  estimatedValue: number
  timeToRealization: string
  probabilityOfSuccess: number
}

interface EnterprisePortfolioDashboardProps {
  className?: string
}

const EnterprisePortfolioDashboard: React.FC<EnterprisePortfolioDashboardProps> = ({
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PORTFOLIOS' | 'ANALYTICS' | 'OPTIMIZATION' | 'RISK' | 'SYNERGIES'>('OVERVIEW')
  const [portfolioData, setPortfolioData] = useState<EnterprisePortfolio | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>('')
  const [timeframe, setTimeframe] = useState<'1M' | '3M' | '6M' | '1Y' | '2Y'>('1Y')
  const [analytics, setAnalytics] = useState<any>(null)

  useEffect(() => {
    loadPortfolioData()
  }, [])

  const loadPortfolioData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/enterprise/portfolio?portfolioId=enterprise-001')
      const data = await response.json()
      
      if (data.success) {
        setPortfolioData(data.data)
      }
    } catch (error) {
      console.error('Failed to load portfolio data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAnalytics = async (endpoint: string) => {
    try {
      const response = await fetch(`/api/enterprise/analytics?endpoint=${endpoint}&portfolioId=enterprise-001&timeframe=${timeframe}`)
      const data = await response.json()
      
      if (data.success) {
        setAnalytics(data.data)
      }
    } catch (error) {
      console.error(`Failed to load ${endpoint} analytics:`, error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'high': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const renderOverview = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Portfolio Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(portfolioData?.portfolioValue || 0)}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">+8.3% from last quarter</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Businesses</p>
              <p className="text-2xl font-bold text-gray-900">{portfolioData?.totalBusinesses || 0}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <Briefcase className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Plus className="w-4 h-4 text-blue-500 mr-1" />
            <span className="text-blue-600">2 acquisitions this quarter</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Annual Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(portfolioData?.totalRevenue || 0)}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">{formatPercentage(portfolioData?.consolidatedMetrics?.revenueGrowthRate || 0)} growth</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Performance Score</p>
              <p className={`text-2xl font-bold ${getPerformanceColor(portfolioData?.performanceScore || 0)}`}>
                {portfolioData?.performanceScore || 0}/100
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-full">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Star className="w-4 h-4 text-yellow-500 mr-1" />
            <span className="text-yellow-600">Top 15% in industry</span>
          </div>
        </div>
      </div>

      {/* Portfolio Health & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Portfolio Health</h3>
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Financial Health</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">87%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Operational Efficiency</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '82%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">82%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Risk Management</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '79%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">79%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Diversification</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${(portfolioData?.diversificationIndex || 0) * 100}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{Math.round((portfolioData?.diversificationIndex || 0) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
            <div className="flex items-center">
              <Brain className="w-5 h-5 text-purple-600 mr-2" />
              <span className="text-sm text-purple-600">
                {Math.round((portfolioData?.aiInsights?.confidenceScore || 0) * 100)}% confidence
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            {portfolioData?.aiInsights?.portfolioOptimization?.slice(0, 3).map((insight, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium mr-2 ${
                        insight.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                        insight.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {insight.priority}
                      </span>
                      <span className="text-xs text-gray-500">{insight.type}</span>
                    </div>
                    <p className="text-sm text-gray-700">{insight.recommendation}</p>
                  </div>
                  <div className="text-right ml-3">
                    <p className="text-sm font-medium text-green-600">
                      {formatCurrency(insight.expectedImpact)}
                    </p>
                    <p className="text-xs text-gray-500">{insight.implementationTimeline}</p>
                  </div>
                </div>
              </div>
            ))}
            
            <button className="w-full mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium">
              View All AI Recommendations →
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Portfolio Performance */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Sub-Portfolio Performance</h3>
          <div className="flex items-center space-x-2">
            <select 
              value={timeframe} 
              onChange={(e) => setTimeframe(e.target.value as any)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1"
            >
              <option value="1M">1 Month</option>
              <option value="3M">3 Months</option>
              <option value="6M">6 Months</option>
              <option value="1Y">1 Year</option>
              <option value="2Y">2 Years</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioData?.subPortfolios?.map((portfolio) => (
            <div key={portfolio.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{portfolio.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(portfolio.riskLevel)}`}>
                  {portfolio.riskLevel}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Businesses:</span>
                  <span className="font-medium">{portfolio.businessCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Revenue:</span>
                  <span className="font-medium">{formatCurrency(portfolio.totalRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Performance:</span>
                  <span className={`font-medium ${getPerformanceColor(portfolio.performanceScore)}`}>
                    {portfolio.performanceScore}/100
                  </span>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-gray-500 mb-2">Strategic Focus:</p>
                <p className="text-sm text-gray-700">{portfolio.strategicFocus}</p>
              </div>
              
              <button className="w-full mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center">
                View Details <ArrowUpRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Risk Assessment</h3>
          <AlertTriangle className="w-5 h-5 text-orange-600" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioData?.aiInsights?.riskAssessment?.slice(0, 3).map((risk, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{risk.riskType}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(risk.riskLevel)}`}>
                  {risk.riskLevel}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Probability:</span>
                  <span className="font-medium">{formatPercentage(risk.probability)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Impact:</span>
                  <span className="font-medium">{formatCurrency(risk.impact)}</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mt-3">{risk.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Growth Opportunities */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Growth Opportunities</h3>
          <Zap className="w-5 h-5 text-green-600" />
        </div>
        
        <div className="space-y-4">
          {portfolioData?.aiInsights?.growthOpportunities?.map((opportunity, index) => (
            <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h4 className="font-medium text-gray-900 mr-3">{opportunity.opportunityType}</h4>
                    <span className="text-sm text-green-600 font-medium">
                      {formatPercentage(opportunity.probabilityOfSuccess)} success rate
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{opportunity.description}</p>
                  <p className="text-xs text-gray-500">Time to realization: {opportunity.timeToRealization}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-lg font-bold text-green-600">{formatCurrency(opportunity.estimatedValue)}</p>
                  <p className="text-xs text-gray-500">Estimated Value</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )

  const renderPortfolios = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Portfolio Management</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Add Portfolio
          </button>
        </div>
        
        <div className="space-y-4">
          {portfolioData?.subPortfolios?.map((portfolio) => (
            <div key={portfolio.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <h4 className="text-lg font-semibold text-gray-900 mr-4">{portfolio.name}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(portfolio.riskLevel)}`}>
                    {portfolio.riskLevel} Risk
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Businesses</p>
                  <p className="text-xl font-bold text-gray-900">{portfolio.businessCount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(portfolio.totalRevenue)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Performance</p>
                  <p className={`text-xl font-bold ${getPerformanceColor(portfolio.performanceScore)}`}>
                    {portfolio.performanceScore}/100
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Growth Rate</p>
                  <p className="text-xl font-bold text-green-600">+18.2%</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-2">Strategic Focus:</p>
                <p className="text-gray-700">{portfolio.strategicFocus}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )

  const renderAnalytics = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Advanced Analytics</h3>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => loadAnalytics('performance')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="text-center p-4 border rounded-lg">
            <p className="text-2xl font-bold text-blue-600">15.6%</p>
            <p className="text-sm text-gray-600">Annualized Return</p>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <p className="text-2xl font-bold text-green-600">1.22</p>
            <p className="text-sm text-gray-600">Sharpe Ratio</p>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">12.8%</p>
            <p className="text-sm text-gray-600">Volatility</p>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <p className="text-2xl font-bold text-purple-600">8.2%</p>
            <p className="text-sm text-gray-600">Max Drawdown</p>
          </div>
        </div>
        
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Performance Chart</p>
            <p className="text-sm text-gray-400">Load analytics to view detailed charts</p>
          </div>
        </div>
      </div>
    </motion.div>
  )

  const tabs = [
    { id: 'OVERVIEW', label: 'Overview', icon: BarChart3 },
    { id: 'PORTFOLIOS', label: 'Portfolios', icon: Layers },
    { id: 'ANALYTICS', label: 'Analytics', icon: PieChart },
    { id: 'OPTIMIZATION', label: 'Optimization', icon: Target },
    { id: 'RISK', label: 'Risk Management', icon: Shield },
    { id: 'SYNERGIES', label: 'Synergies', icon: Zap }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Loading enterprise portfolio data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gray-50 min-h-screen ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {portfolioData?.enterpriseName || 'Enterprise Portfolio'}
              </h1>
              <p className="text-gray-600 mt-2">
                Multi-portfolio management and advanced business intelligence
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Download className="w-5 h-5" />
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Generate Report
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm border">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'OVERVIEW' && renderOverview()}
          {activeTab === 'PORTFOLIOS' && renderPortfolios()}
          {activeTab === 'ANALYTICS' && renderAnalytics()}
          {activeTab === 'OPTIMIZATION' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg p-6 shadow-sm border"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Optimization</h3>
              <p className="text-gray-600">AI-powered portfolio optimization features coming soon...</p>
            </motion.div>
          )}
          {activeTab === 'RISK' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg p-6 shadow-sm border"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Management</h3>
              <p className="text-gray-600">Advanced risk management tools coming soon...</p>
            </motion.div>
          )}
          {activeTab === 'SYNERGIES' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg p-6 shadow-sm border"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cross-Portfolio Synergies</h3>
              <p className="text-gray-600">Synergy tracking and optimization features coming soon...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default EnterprisePortfolioDashboard