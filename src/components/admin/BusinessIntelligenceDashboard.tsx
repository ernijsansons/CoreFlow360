'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChartBarIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  ArrowTrendingDownIcon as TrendingDownIcon,
  LightBulbIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  SparklesIcon,
  DocumentArrowDownIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  CalendarIcon,
  BoltIcon,
  ScaleIcon,
  UserGroupIcon,
  CubeIcon,
  FireIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Legend
} from 'recharts'
import { toast } from 'react-hot-toast'

interface BusinessDashboard {
  overview: {
    kpis: Array<{
      id: string
      name: string
      category: string
      value: number
      unit: string
      trends: {
        hourly: number
        daily: number
        weekly: number
        monthly: number
      }
      targets?: {
        current: number
        target: number
        threshold: number
      }
    }>
    healthScore: number
    trendSummary: {
      positive: number
      negative: number
      neutral: number
    }
    criticalInsights: Array<{
      id: string
      type: string
      title: string
      description: string
      impact: string
      confidence: number
    }>
    forecastSummary: {
      horizon: number
      confidence: number
      trendDirection: 'up' | 'down' | 'stable'
      keyPredictions: any[]
    }
  }
  analytics: {
    revenueAnalysis: any
    costAnalysis: any
    efficiencyMetrics: any
    riskAssessment: any
    customerAnalysis: any
    operationalMetrics: any
  }
  forecasts: Array<{
    id: string
    metricId: string
    horizon: number
    predictions: Array<{
      timestamp: Date
      predictedValue: number
      confidence: number
      upperBound: number
      lowerBound: number
    }>
    accuracy: number
    scenarios: Array<{
      name: string
      probability: number
      predictions: Array<{
        timestamp: Date
        value: number
      }>
    }>
  }>
  insights: Array<{
    id: string
    type: string
    category: string
    title: string
    description: string
    impact: string
    confidence: number
    recommendations: Array<{
      action: string
      priority: number
      estimatedImpact: string
      effort: string
      timeline: string
    }>
    status: string
  }>
  recommendations: Array<{
    category: string
    priority: number
    title: string
    description: string
    expectedROI: string
    implementationTime: string
    resources: string[]
  }>
  alerts: Array<{
    severity: string
    type: string
    message: string
    timestamp: Date
  }>
  summary: {
    healthScore: number
    totalKPIs: number
    criticalInsights: number
    activeForecast: number
    pendingRecommendations: number
  }
}

const COLORS = {
  primary: '#6366f1',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  purple: '#8b5cf6',
  pink: '#ec4899',
  indigo: '#4f46e5',
  cyan: '#06b6d4'
}

const CATEGORY_COLORS = {
  revenue: COLORS.success,
  costs: COLORS.error,
  efficiency: COLORS.info,
  growth: COLORS.purple,
  risk: COLORS.warning,
  satisfaction: COLORS.pink,
  performance: COLORS.cyan
}

const IMPACT_COLORS = {
  critical: 'text-red-600 bg-red-100',
  high: 'text-orange-600 bg-orange-100',
  medium: 'text-yellow-600 bg-yellow-100',
  low: 'text-blue-600 bg-blue-100'
}

const CATEGORY_ICONS = {
  revenue: CurrencyDollarIcon,
  costs: ScaleIcon,
  efficiency: BoltIcon,
  growth: TrendingUpIcon,
  risk: ExclamationTriangleIcon,
  satisfaction: UserGroupIcon,
  performance: ChartBarIcon
}

export default function BusinessIntelligenceDashboard() {
  const [data, setData] = useState<BusinessDashboard | null>(null)
  const [selectedView, setSelectedView] = useState<'overview' | 'kpis' | 'forecasts' | 'insights' | 'analytics'>('overview')
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(60)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d')
  const [simulationRunning, setSimulationRunning] = useState(false)

  useEffect(() => {
    loadBusinessData()
    
    let interval: NodeJS.Timer | null = null
    if (autoRefresh) {
      interval = setInterval(loadBusinessData, refreshInterval * 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval, selectedCategory])

  const loadBusinessData = async () => {
    try {
      const params = new URLSearchParams({
        includeForecasts: 'true',
        includeInsights: 'true',
        includeRecommendations: 'true'
      })
      
      if (selectedCategory) params.set('categories', selectedCategory)

      const response = await fetch(`/api/intelligence/business?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setData(result)
      } else {
        throw new Error(result.error || 'Failed to load data')
      }
      
    } catch (error) {
      console.error('Failed to load business intelligence data:', error)
      toast.error('Failed to load business intelligence data')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: string, actionData?: any) => {
    try {
      const response = await fetch('/api/intelligence/business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          data: actionData
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success(`Action "${action}" completed successfully`)
        if (action !== 'export') {
          await loadBusinessData()
        }
      } else {
        throw new Error(result.error)
      }
      
      return result
      
    } catch (error) {
      toast.error(`Action "${action}" failed`)
      throw error
    }
  }

  const handleGenerateInsights = async () => {
    try {
      const result = await handleAction('insights')
      
      if (result.insights && result.insights.length > 0) {
        result.insights.slice(0, 3).forEach((insight: any, index: number) => {
          setTimeout(() => {
            toast.success(`New Insight: ${insight.title}`, { duration: 5000 })
          }, index * 1500)
        })
      }
      
    } catch (error) {
      // Error already handled
    }
  }

  const handleRunSimulation = async (scenario: string) => {
    setSimulationRunning(true)
    try {
      await handleAction('simulate', { scenario })
      toast.success(`${scenario} scenario simulation completed`)
    } catch (error) {
      // Error already handled
    } finally {
      setSimulationRunning(false)
    }
  }

  const handleExport = async () => {
    try {
      const result = await handleAction('export', { format: 'json' })
      
      const blob = new Blob([JSON.stringify(result.result.data, null, 2)], {
        type: 'application/json'
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `business-intelligence-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      
    } catch (error) {
      // Error already handled
    }
  }

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-blue-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getHealthStatus = (score: number) => {
    if (score >= 90) return 'EXCELLENT'
    if (score >= 75) return 'GOOD'
    if (score >= 60) return 'FAIR'
    return 'NEEDS ATTENTION'
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 5) return <TrendingUpIcon className="w-4 h-4 text-green-600" />
    if (trend < -5) return <TrendingDownIcon className="w-4 h-4 text-red-600" />
    return <span className="w-4 h-4 inline-block bg-gray-400 rounded-full" />
  }

  const formatValue = (value: number, unit: string) => {
    if (unit === 'USD') return `$${value.toLocaleString()}`
    if (unit === 'percentage') return `${value.toFixed(1)}%`
    if (unit === 'nps') return value.toFixed(0)
    return value.toLocaleString()
  }

  const generateKPITrendData = (kpi: any) => {
    // Generate mock trend data for visualization
    const data = []
    for (let i = 30; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const variation = (Math.random() - 0.5) * 0.1
      data.push({
        date: date.toLocaleDateString(),
        value: kpi.value * (1 + variation)
      })
    }
    return data
  }

  const generateForecastChartData = (forecast: any) => {
    if (!forecast.predictions || forecast.predictions.length === 0) return []
    
    return forecast.predictions.map((pred: any) => ({
      date: new Date(pred.timestamp).toLocaleDateString(),
      predicted: pred.predictedValue,
      upper: pred.upperBound,
      lower: pred.lowerBound,
      confidence: pred.confidence * 100
    }))
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading business intelligence...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ChartBarIcon className="w-10 h-10 text-indigo-600 mr-4" />
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Business Intelligence Center
                </h1>
                <p className="text-lg text-gray-600">
                  Predictive analytics, intelligent insights, and strategic recommendations
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`p-2 rounded-lg transition-colors ${
                    autoRefresh 
                      ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {autoRefresh ? <PlayIcon className="w-4 h-4" /> : <PauseIcon className="w-4 h-4" />}
                </button>
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                  className="ml-2 px-3 py-1 border rounded-md text-sm"
                  disabled={!autoRefresh}
                >
                  <option value="30">30s</option>
                  <option value="60">1m</option>
                  <option value="300">5m</option>
                  <option value="900">15m</option>
                </select>
              </div>
              <button
                onClick={handleGenerateInsights}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <LightBulbIcon className="w-4 h-4 mr-2" />
                Generate Insights
              </button>
              <button
                onClick={() => loadBusinessData()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
              >
                <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Business Health Score */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-indigo-100 rounded-lg mr-4">
                  <SparklesIcon className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Business Health Score</h3>
                  <p className="text-gray-600">Overall business performance and outlook</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-4xl font-bold ${getHealthColor(data.overview.healthScore)}`}>
                  {data.overview.healthScore}/100
                </div>
                <div className="text-gray-600">{getHealthStatus(data.overview.healthScore)}</div>
              </div>
            </div>
            
            {/* Trend Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-green-900">Positive Trends</span>
                  <TrendingUpIcon className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">{data.overview.trendSummary.positive}%</div>
                <div className="text-sm text-green-700">of key metrics improving</div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-red-900">Negative Trends</span>
                  <TrendingDownIcon className="w-5 h-5 text-red-600" />
                </div>
                <div className="text-2xl font-bold text-red-600">{data.overview.trendSummary.negative}%</div>
                <div className="text-sm text-red-700">require attention</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">Stable Metrics</span>
                  <div className="w-5 h-5 bg-gray-400 rounded-full" />
                </div>
                <div className="text-2xl font-bold text-gray-600">{data.overview.trendSummary.neutral}%</div>
                <div className="text-sm text-gray-700">performing as expected</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Key Metrics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <CubeIcon className="w-8 h-8 text-blue-600" />
              <span className="text-3xl font-bold text-gray-900">
                {data.summary.totalKPIs}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Active KPIs</h3>
            <p className="text-sm text-gray-600">Key performance indicators</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <LightBulbIcon className="w-8 h-8 text-yellow-600" />
              <span className="text-3xl font-bold text-gray-900">
                {data.summary.criticalInsights}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Critical Insights</h3>
            <p className="text-sm text-gray-600">Require immediate attention</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <CalendarIcon className="w-8 h-8 text-purple-600" />
              <span className="text-3xl font-bold text-gray-900">
                {data.summary.activeForecast}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Active Forecasts</h3>
            <p className="text-sm text-gray-600">Predictive models running</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <RocketLaunchIcon className="w-8 h-8 text-green-600" />
              <span className="text-3xl font-bold text-gray-900">
                {data.summary.pendingRecommendations}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Priority Actions</h3>
            <p className="text-sm text-gray-600">Recommendations pending</p>
          </motion.div>
        </div>

        {/* View Selector */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { id: 'overview', name: 'Overview', icon: ChartBarIcon },
              { id: 'kpis', name: 'KPIs', icon: CubeIcon },
              { id: 'forecasts', name: 'Forecasts', icon: CalendarIcon },
              { id: 'insights', name: 'Insights', icon: LightBulbIcon },
              { id: 'analytics', name: 'Analytics', icon: SparklesIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedView(tab.id as any)}
                className={`flex items-center px-4 py-2 rounded-md transition-all ${
                  selectedView === tab.id
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {selectedView === 'overview' && (
              <>
                {/* Critical Insights */}
                {data.overview.criticalInsights.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <ExclamationTriangleIcon className="w-6 h-6 mr-2 text-red-600" />
                      Critical Business Insights
                    </h3>
                    <div className="space-y-3">
                      {data.overview.criticalInsights.map((insight) => (
                        <div key={insight.id} className="p-4 bg-red-50 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-red-900">{insight.title}</h4>
                            <span className="text-sm text-red-700">
                              {(insight.confidence * 100).toFixed(0)}% confidence
                            </span>
                          </div>
                          <p className="text-sm text-red-800">{insight.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Forecast Summary */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Forecast Overview</h3>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-sm text-gray-600">Forecast Horizon</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {data.overview.forecastSummary.horizon} days
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Overall Confidence</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {(data.overview.forecastSummary.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Trend Direction</div>
                      <div className="flex items-center">
                        {data.overview.forecastSummary.trendDirection === 'up' ? (
                          <TrendingUpIcon className="w-8 h-8 text-green-600" />
                        ) : data.overview.forecastSummary.trendDirection === 'down' ? (
                          <TrendingDownIcon className="w-8 h-8 text-red-600" />
                        ) : (
                          <div className="w-8 h-8 bg-gray-400 rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Mini forecast chart */}
                  {data.forecasts.length > 0 && (
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={generateForecastChartData(data.forecasts[0])}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="upper" 
                          stroke="none" 
                          fill={COLORS.info} 
                          fillOpacity={0.1}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="lower" 
                          stroke="none" 
                          fill={COLORS.info} 
                          fillOpacity={0.1}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="predicted" 
                          stroke={COLORS.primary} 
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </>
            )}

            {selectedView === 'kpis' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Key Performance Indicators</h3>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-1 border rounded-md text-sm"
                  >
                    <option value="">All Categories</option>
                    <option value="revenue">Revenue</option>
                    <option value="costs">Costs</option>
                    <option value="efficiency">Efficiency</option>
                    <option value="growth">Growth</option>
                    <option value="satisfaction">Satisfaction</option>
                  </select>
                </div>
                
                <div className="space-y-4">
                  {data.overview.kpis
                    .filter(kpi => !selectedCategory || kpi.category === selectedCategory)
                    .map((kpi) => {
                      const IconComponent = CATEGORY_ICONS[kpi.category as keyof typeof CATEGORY_ICONS] || ChartBarIcon
                      return (
                        <div key={kpi.id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <div className={`p-2 rounded-lg mr-3`} style={{ backgroundColor: `${CATEGORY_COLORS[kpi.category as keyof typeof CATEGORY_COLORS]}20` }}>
                                <IconComponent className="w-5 h-5" style={{ color: CATEGORY_COLORS[kpi.category as keyof typeof CATEGORY_COLORS] }} />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{kpi.name}</h4>
                                <p className="text-sm text-gray-600">{kpi.category}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-gray-900">
                                {formatValue(kpi.value, kpi.unit)}
                              </div>
                              <div className="flex items-center justify-end mt-1">
                                {getTrendIcon(kpi.trends.daily)}
                                <span className={`ml-1 text-sm ${
                                  kpi.trends.daily > 0 ? 'text-green-600' : 
                                  kpi.trends.daily < 0 ? 'text-red-600' : 
                                  'text-gray-600'
                                }`}>
                                  {kpi.trends.daily > 0 ? '+' : ''}{kpi.trends.daily.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Mini trend chart */}
                          <ResponsiveContainer width="100%" height={60}>
                            <LineChart data={generateKPITrendData(kpi)}>
                              <Line 
                                type="monotone" 
                                dataKey="value" 
                                stroke={CATEGORY_COLORS[kpi.category as keyof typeof CATEGORY_COLORS]}
                                strokeWidth={2}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                          
                          {/* Target progress */}
                          {kpi.targets && (
                            <div className="mt-3">
                              <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>Target Progress</span>
                                <span>{((kpi.value / kpi.targets.target) * 100).toFixed(0)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="h-2 rounded-full transition-all"
                                  style={{ 
                                    width: `${Math.min(100, (kpi.value / kpi.targets.target) * 100)}%`,
                                    backgroundColor: kpi.value >= kpi.targets.target ? COLORS.success : COLORS.warning
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                </div>
              </div>
            )}

            {selectedView === 'forecasts' && (
              <div className="space-y-6">
                {data.forecasts.map((forecast) => (
                  <div key={forecast.id} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold">
                        {data.overview.kpis.find(k => k.id === forecast.metricId)?.name || 'Forecast'}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">
                          {forecast.horizon} day forecast
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          forecast.accuracy > 0.8 ? 'bg-green-100 text-green-700' :
                          forecast.accuracy > 0.6 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {(forecast.accuracy * 100).toFixed(0)}% accuracy
                        </span>
                      </div>
                    </div>
                    
                    {/* Forecast chart */}
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart data={generateForecastChartData(forecast)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="upper" 
                          stackId="1"
                          stroke="none" 
                          fill={COLORS.info} 
                          fillOpacity={0.2}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="lower" 
                          stackId="1"
                          stroke="none" 
                          fill={COLORS.info} 
                          fillOpacity={0.2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="predicted" 
                          stroke={COLORS.primary} 
                          strokeWidth={3}
                          dot={{ fill: COLORS.primary }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                    
                    {/* Scenarios */}
                    {forecast.scenarios && forecast.scenarios.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Scenario Analysis</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {forecast.scenarios.map((scenario, idx) => (
                            <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-gray-900">{scenario.name}</span>
                                <span className="text-sm text-gray-600">
                                  {(scenario.probability * 100).toFixed(0)}%
                                </span>
                              </div>
                              <div className="text-xs text-gray-600">
                                {scenario.predictions.length > 0 && (
                                  <span>
                                    Outcome: {scenario.predictions[scenario.predictions.length - 1].value.toFixed(0)}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {selectedView === 'insights' && (
              <div className="space-y-4">
                {data.insights
                  .filter(insight => insight.status === 'new')
                  .map((insight) => (
                    <div key={insight.id} className="bg-white rounded-xl shadow-lg p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <LightBulbIcon className="w-6 h-6 mr-3 text-yellow-600" />
                          <div>
                            <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                                IMPACT_COLORS[insight.impact as keyof typeof IMPACT_COLORS]
                              }`}>
                                {insight.impact.toUpperCase()} IMPACT
                              </span>
                              <span className="text-sm text-gray-600">
                                {insight.category} • {(insight.confidence * 100).toFixed(0)}% confidence
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-4">{insight.description}</p>
                      
                      {insight.recommendations.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="font-medium text-gray-900">Recommended Actions:</h5>
                          {insight.recommendations.map((rec, idx) => (
                            <div key={idx} className="p-3 bg-blue-50 rounded-lg">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-blue-900">{rec.action}</p>
                                  <p className="text-xs text-blue-700 mt-1">
                                    Impact: {rec.estimatedImpact} • Effort: {rec.effort} • Timeline: {rec.timeline}
                                  </p>
                                </div>
                                <span className={`ml-3 px-2 py-1 rounded text-xs font-medium ${
                                  rec.priority === 1 ? 'bg-red-100 text-red-700' :
                                  rec.priority === 2 ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  P{rec.priority}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}

            {selectedView === 'analytics' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Deep Analytics</h3>
                <div className="text-center py-12 text-gray-500">
                  <SparklesIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>Advanced analytics visualization coming soon</p>
                  <p className="text-sm mt-2">Revenue analysis, cost optimization, and more</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recommendations */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <RocketLaunchIcon className="w-5 h-5 mr-2 text-green-600" />
                Priority Recommendations
              </h3>
              <div className="space-y-3">
                {data.recommendations
                  .filter(rec => rec.priority === 1)
                  .slice(0, 3)
                  .map((rec, index) => (
                    <div key={index} className="p-3 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900">{rec.title}</h4>
                      <p className="text-sm text-green-800 mt-1">{rec.description}</p>
                      <div className="mt-2 text-xs text-green-700">
                        <div>ROI: {rec.expectedROI}</div>
                        <div>Time: {rec.implementationTime}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button 
                  onClick={handleGenerateInsights}
                  className="w-full px-4 py-2 text-left text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <LightBulbIcon className="w-4 h-4 mr-2 inline" />
                  Generate New Insights
                </button>
                <button 
                  onClick={() => handleRunSimulation('growth')}
                  disabled={simulationRunning}
                  className="w-full px-4 py-2 text-left text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                >
                  <TrendingUpIcon className="w-4 h-4 mr-2 inline" />
                  {simulationRunning ? 'Running...' : 'Run Growth Simulation'}
                </button>
                <button 
                  onClick={() => handleRunSimulation('volatile')}
                  disabled={simulationRunning}
                  className="w-full px-4 py-2 text-left text-sm bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors disabled:opacity-50"
                >
                  <FireIcon className="w-4 h-4 mr-2 inline" />
                  {simulationRunning ? 'Running...' : 'Run Volatile Simulation'}
                </button>
                <button 
                  onClick={handleExport}
                  className="w-full px-4 py-2 text-left text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <DocumentArrowDownIcon className="w-4 h-4 mr-2 inline" />
                  Export Report
                </button>
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-red-600" />
                Recent Alerts
              </h3>
              <div className="space-y-3">
                {data.alerts.slice(0, 5).map((alert, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className={`inline-flex px-2 py-1 rounded text-xs font-medium mb-1 ${
                          alert.severity === 'critical' ? 'bg-red-100 text-red-700' :
                          alert.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                          alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {alert.severity.toUpperCase()}
                        </div>
                        <p className="text-sm text-gray-900">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}