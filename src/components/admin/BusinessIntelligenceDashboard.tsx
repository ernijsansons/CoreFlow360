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
  RocketLaunchIcon,
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
  Legend,
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
      keyPredictions: unknown[]
    }
  }
  analytics: {
    revenueAnalysis: unknown
    costAnalysis: unknown
    efficiencyMetrics: unknown
    riskAssessment: unknown
    customerAnalysis: unknown
    operationalMetrics: unknown
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
  cyan: '#06b6d4',
}

const CATEGORY_COLORS = {
  revenue: COLORS.success,
  costs: COLORS.error,
  efficiency: COLORS.info,
  growth: COLORS.purple,
  risk: COLORS.warning,
  satisfaction: COLORS.pink,
  performance: COLORS.cyan,
}

const IMPACT_COLORS = {
  critical: 'text-red-600 bg-red-100',
  high: 'text-orange-600 bg-orange-100',
  medium: 'text-yellow-600 bg-yellow-100',
  low: 'text-blue-600 bg-blue-100',
}

const CATEGORY_ICONS = {
  revenue: CurrencyDollarIcon,
  costs: ScaleIcon,
  efficiency: BoltIcon,
  growth: TrendingUpIcon,
  risk: ExclamationTriangleIcon,
  satisfaction: UserGroupIcon,
  performance: ChartBarIcon,
}

export default function BusinessIntelligenceDashboard() {
  const [data, setData] = useState<BusinessDashboard | null>(null)
  const [selectedView, setSelectedView] = useState<
    'overview' | 'kpis' | 'forecasts' | 'insights' | 'analytics'
  >('overview')
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
        includeRecommendations: 'true',
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
      toast.error('Failed to load business intelligence data')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: string, actionData?: unknown) => {
    try {
      const response = await fetch('/api/intelligence/business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          data: actionData,
        }),
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
        result.insights.slice(0, 3).forEach((insight: unknown, index: number) => {
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
        type: 'application/json',
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
    if (trend > 5) return <TrendingUpIcon className="h-4 w-4 text-green-600" />
    if (trend < -5) return <TrendingDownIcon className="h-4 w-4 text-red-600" />
    return <span className="inline-block h-4 w-4 rounded-full bg-gray-400" />
  }

  const formatValue = (value: number, unit: string) => {
    if (unit === 'USD') return `$${value.toLocaleString()}`
    if (unit === 'percentage') return `${value.toFixed(1)}%`
    if (unit === 'nps') return value.toFixed(0)
    return value.toLocaleString()
  }

  const generateKPITrendData = (kpi: unknown) => {
    // Generate mock trend data for visualization
    const data = []
    for (let i = 30; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const variation = (Math.random() - 0.5) * 0.1
      data.push({
        date: date.toLocaleDateString(),
        value: kpi.value * (1 + variation),
      })
    }
    return data
  }

  const generateForecastChartData = (forecast: unknown) => {
    if (!forecast.predictions || forecast.predictions.length === 0) return []

    return forecast.predictions.map((pred: unknown) => ({
      date: new Date(pred.timestamp).toLocaleDateString(),
      predicted: pred.predictedValue,
      upper: pred.upperBound,
      lower: pred.lowerBound,
      confidence: pred.confidence * 100,
    }))
  }

  if (loading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600" />
          <p className="text-gray-600">Loading business intelligence...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ChartBarIcon className="mr-4 h-10 w-10 text-indigo-600" />
              <div>
                <h1 className="mb-2 text-4xl font-bold text-gray-900">
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
                  className={`rounded-lg p-2 transition-colors ${
                    autoRefresh
                      ? 'bg-green-100 text-green-600 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {autoRefresh ? (
                    <PlayIcon className="h-4 w-4" />
                  ) : (
                    <PauseIcon className="h-4 w-4" />
                  )}
                </button>
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                  className="ml-2 rounded-md border px-3 py-1 text-sm"
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
                className="flex items-center rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
              >
                <LightBulbIcon className="mr-2 h-4 w-4" />
                Generate Insights
              </button>
              <button
                onClick={() => loadBusinessData()}
                className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                <ArrowPathIcon className="mr-2 h-4 w-4" />
                Refresh
              </button>
              <button
                onClick={handleExport}
                className="flex items-center rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
              >
                <DocumentArrowDownIcon className="mr-2 h-4 w-4" />
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
            className="rounded-xl bg-white p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-4 rounded-lg bg-indigo-100 p-3">
                  <SparklesIcon className="h-8 w-8 text-indigo-600" />
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
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-green-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-green-900">Positive Trends</span>
                  <TrendingUpIcon className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {data.overview.trendSummary.positive}%
                </div>
                <div className="text-sm text-green-700">of key metrics improving</div>
              </div>
              <div className="rounded-lg bg-red-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-red-900">Negative Trends</span>
                  <TrendingDownIcon className="h-5 w-5 text-red-600" />
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {data.overview.trendSummary.negative}%
                </div>
                <div className="text-sm text-red-700">require attention</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-gray-900">Stable Metrics</span>
                  <div className="h-5 w-5 rounded-full bg-gray-400" />
                </div>
                <div className="text-2xl font-bold text-gray-600">
                  {data.overview.trendSummary.neutral}%
                </div>
                <div className="text-sm text-gray-700">performing as expected</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Key Metrics Summary */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-white p-6 shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between">
              <CubeIcon className="h-8 w-8 text-blue-600" />
              <span className="text-3xl font-bold text-gray-900">{data.summary.totalKPIs}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Active KPIs</h3>
            <p className="text-sm text-gray-600">Key performance indicators</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl bg-white p-6 shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between">
              <LightBulbIcon className="h-8 w-8 text-yellow-600" />
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
            className="rounded-xl bg-white p-6 shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between">
              <CalendarIcon className="h-8 w-8 text-purple-600" />
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
            className="rounded-xl bg-white p-6 shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between">
              <RocketLaunchIcon className="h-8 w-8 text-green-600" />
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
          <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
            {[
              { id: 'overview', name: 'Overview', icon: ChartBarIcon },
              { id: 'kpis', name: 'KPIs', icon: CubeIcon },
              { id: 'forecasts', name: 'Forecasts', icon: CalendarIcon },
              { id: 'insights', name: 'Insights', icon: LightBulbIcon },
              { id: 'analytics', name: 'Analytics', icon: SparklesIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedView(tab.id as unknown)}
                className={`flex items-center rounded-md px-4 py-2 transition-all ${
                  selectedView === tab.id
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="mr-2 h-4 w-4" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {selectedView === 'overview' && (
              <>
                {/* Critical Insights */}
                {data.overview.criticalInsights.length > 0 && (
                  <div className="rounded-xl bg-white p-6 shadow-lg">
                    <h3 className="mb-4 flex items-center text-xl font-semibold">
                      <ExclamationTriangleIcon className="mr-2 h-6 w-6 text-red-600" />
                      Critical Business Insights
                    </h3>
                    <div className="space-y-3">
                      {data.overview.criticalInsights.map((insight) => (
                        <div key={insight.id} className="rounded-lg bg-red-50 p-4">
                          <div className="mb-2 flex items-start justify-between">
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
                <div className="rounded-xl bg-white p-6 shadow-lg">
                  <h3 className="mb-4 text-xl font-semibold">Forecast Overview</h3>
                  <div className="mb-4 flex items-center justify-between">
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
                          <TrendingUpIcon className="h-8 w-8 text-green-600" />
                        ) : data.overview.forecastSummary.trendDirection === 'down' ? (
                          <TrendingDownIcon className="h-8 w-8 text-red-600" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-400" />
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
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Key Performance Indicators</h3>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="rounded-md border px-3 py-1 text-sm"
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
                    .filter((kpi) => !selectedCategory || kpi.category === selectedCategory)
                    .map((kpi) => {
                      const IconComponent =
                        CATEGORY_ICONS[kpi.category as keyof typeof CATEGORY_ICONS] || ChartBarIcon
                      return (
                        <div key={kpi.id} className="rounded-lg bg-gray-50 p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center">
                              <div
                                className={`mr-3 rounded-lg p-2`}
                                style={{
                                  backgroundColor: `${CATEGORY_COLORS[kpi.category as keyof typeof CATEGORY_COLORS]}20`,
                                }}
                              >
                                <IconComponent
                                  className="h-5 w-5"
                                  style={{
                                    color:
                                      CATEGORY_COLORS[kpi.category as keyof typeof CATEGORY_COLORS],
                                  }}
                                />
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
                              <div className="mt-1 flex items-center justify-end">
                                {getTrendIcon(kpi.trends.daily)}
                                <span
                                  className={`ml-1 text-sm ${
                                    kpi.trends.daily > 0
                                      ? 'text-green-600'
                                      : kpi.trends.daily < 0
                                        ? 'text-red-600'
                                        : 'text-gray-600'
                                  }`}
                                >
                                  {kpi.trends.daily > 0 ? '+' : ''}
                                  {kpi.trends.daily.toFixed(1)}%
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
                                stroke={
                                  CATEGORY_COLORS[kpi.category as keyof typeof CATEGORY_COLORS]
                                }
                                strokeWidth={2}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>

                          {/* Target progress */}
                          {kpi.targets && (
                            <div className="mt-3">
                              <div className="mb-1 flex justify-between text-xs text-gray-600">
                                <span>Target Progress</span>
                                <span>{((kpi.value / kpi.targets.target) * 100).toFixed(0)}%</span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-gray-200">
                                <div
                                  className="h-2 rounded-full transition-all"
                                  style={{
                                    width: `${Math.min(100, (kpi.value / kpi.targets.target) * 100)}%`,
                                    backgroundColor:
                                      kpi.value >= kpi.targets.target
                                        ? COLORS.success
                                        : COLORS.warning,
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
                  <div key={forecast.id} className="rounded-xl bg-white p-6 shadow-lg">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-xl font-semibold">
                        {data.overview.kpis.find((k) => k.id === forecast.metricId)?.name ||
                          'Forecast'}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">
                          {forecast.horizon} day forecast
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-medium ${
                            forecast.accuracy > 0.8
                              ? 'bg-green-100 text-green-700'
                              : forecast.accuracy > 0.6
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                          }`}
                        >
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
                        <h4 className="mb-2 font-medium text-gray-900">Scenario Analysis</h4>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                          {forecast.scenarios.map((scenario, idx) => (
                            <div key={idx} className="rounded-lg bg-gray-50 p-3">
                              <div className="mb-1 flex items-center justify-between">
                                <span className="font-medium text-gray-900">{scenario.name}</span>
                                <span className="text-sm text-gray-600">
                                  {(scenario.probability * 100).toFixed(0)}%
                                </span>
                              </div>
                              <div className="text-xs text-gray-600">
                                {scenario.predictions.length > 0 && (
                                  <span>
                                    Outcome:{' '}
                                    {scenario.predictions[
                                      scenario.predictions.length - 1
                                    ].value.toFixed(0)}
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
                  .filter((insight) => insight.status === 'new')
                  .map((insight) => (
                    <div key={insight.id} className="rounded-xl bg-white p-6 shadow-lg">
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex items-center">
                          <LightBulbIcon className="mr-3 h-6 w-6 text-yellow-600" />
                          <div>
                            <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                            <div className="mt-1 flex items-center gap-3">
                              <span
                                className={`inline-flex rounded px-2 py-1 text-xs font-medium ${
                                  IMPACT_COLORS[insight.impact as keyof typeof IMPACT_COLORS]
                                }`}
                              >
                                {insight.impact.toUpperCase()} IMPACT
                              </span>
                              <span className="text-sm text-gray-600">
                                {insight.category} • {(insight.confidence * 100).toFixed(0)}%
                                confidence
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="mb-4 text-gray-700">{insight.description}</p>

                      {insight.recommendations.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="font-medium text-gray-900">Recommended Actions:</h5>
                          {insight.recommendations.map((rec, idx) => (
                            <div key={idx} className="rounded-lg bg-blue-50 p-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-blue-900">{rec.action}</p>
                                  <p className="mt-1 text-xs text-blue-700">
                                    Impact: {rec.estimatedImpact} • Effort: {rec.effort} • Timeline:{' '}
                                    {rec.timeline}
                                  </p>
                                </div>
                                <span
                                  className={`ml-3 rounded px-2 py-1 text-xs font-medium ${
                                    rec.priority === 1
                                      ? 'bg-red-100 text-red-700'
                                      : rec.priority === 2
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-green-100 text-green-700'
                                  }`}
                                >
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
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="mb-4 text-xl font-semibold">Deep Analytics</h3>
                <div className="py-12 text-center text-gray-500">
                  <SparklesIcon className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                  <p>Advanced analytics visualization coming soon</p>
                  <p className="mt-2 text-sm">Revenue analysis, cost optimization, and more</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recommendations */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h3 className="mb-4 flex items-center text-lg font-semibold">
                <RocketLaunchIcon className="mr-2 h-5 w-5 text-green-600" />
                Priority Recommendations
              </h3>
              <div className="space-y-3">
                {data.recommendations
                  .filter((rec) => rec.priority === 1)
                  .slice(0, 3)
                  .map((rec, index) => (
                    <div key={index} className="rounded-lg bg-green-50 p-3">
                      <h4 className="font-medium text-green-900">{rec.title}</h4>
                      <p className="mt-1 text-sm text-green-800">{rec.description}</p>
                      <div className="mt-2 text-xs text-green-700">
                        <div>ROI: {rec.expectedROI}</div>
                        <div>Time: {rec.implementationTime}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={handleGenerateInsights}
                  className="w-full rounded-lg bg-purple-50 px-4 py-2 text-left text-sm text-purple-700 transition-colors hover:bg-purple-100"
                >
                  <LightBulbIcon className="mr-2 inline h-4 w-4" />
                  Generate New Insights
                </button>
                <button
                  onClick={() => handleRunSimulation('growth')}
                  disabled={simulationRunning}
                  className="w-full rounded-lg bg-green-50 px-4 py-2 text-left text-sm text-green-700 transition-colors hover:bg-green-100 disabled:opacity-50"
                >
                  <TrendingUpIcon className="mr-2 inline h-4 w-4" />
                  {simulationRunning ? 'Running...' : 'Run Growth Simulation'}
                </button>
                <button
                  onClick={() => handleRunSimulation('volatile')}
                  disabled={simulationRunning}
                  className="w-full rounded-lg bg-yellow-50 px-4 py-2 text-left text-sm text-yellow-700 transition-colors hover:bg-yellow-100 disabled:opacity-50"
                >
                  <FireIcon className="mr-2 inline h-4 w-4" />
                  {simulationRunning ? 'Running...' : 'Run Volatile Simulation'}
                </button>
                <button
                  onClick={handleExport}
                  className="w-full rounded-lg bg-blue-50 px-4 py-2 text-left text-sm text-blue-700 transition-colors hover:bg-blue-100"
                >
                  <DocumentArrowDownIcon className="mr-2 inline h-4 w-4" />
                  Export Report
                </button>
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h3 className="mb-4 flex items-center text-lg font-semibold">
                <ExclamationTriangleIcon className="mr-2 h-5 w-5 text-red-600" />
                Recent Alerts
              </h3>
              <div className="space-y-3">
                {data.alerts.slice(0, 5).map((alert, index) => (
                  <div key={index} className="rounded-lg bg-gray-50 p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div
                          className={`mb-1 inline-flex rounded px-2 py-1 text-xs font-medium ${
                            alert.severity === 'critical'
                              ? 'bg-red-100 text-red-700'
                              : alert.severity === 'high'
                                ? 'bg-orange-100 text-orange-700'
                                : alert.severity === 'medium'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {alert.severity.toUpperCase()}
                        </div>
                        <p className="text-sm text-gray-900">{alert.message}</p>
                        <p className="mt-1 text-xs text-gray-500">
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
