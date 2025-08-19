'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  DollarSign,
  Target,
  Zap,
  ChevronLeft,
  ChevronRight,
  Mic,
  Share,
  RefreshCw,
} from 'lucide-react'

interface ExecutiveMetric {
  id: string
  title: string
  value: string
  change: number
  changeLabel: string
  icon: React.ComponentType<unknown>
  gradient: string
  aiInsight: string
  actionable: string
}

interface AIRecommendation {
  id: string
  type: 'opportunity' | 'risk' | 'action'
  title: string
  impact: string
  action: string
  confidence: number
}

export default function MobileExecutiveDashboard() {
  const [currentMetric, setCurrentMetric] = useState(0)
  const [executiveMetrics, setExecutiveMetrics] = useState<ExecutiveMetric[]>([])
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [isListening, setIsListening] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch executive dashboard data from API
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/dashboard/executive?timeframe=30d')

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const data = await response.json()

      // Map API response to component format
      const mappedMetrics: ExecutiveMetric[] = data.metrics.map((metric: unknown) => ({
        id: metric.id,
        title: metric.title,
        value: metric.value,
        change: metric.change,
        changeLabel: metric.changeLabel,
        icon: getIconForMetric(metric.id),
        gradient: metric.gradient,
        aiInsight: metric.aiInsight,
        actionable: metric.actionable,
      }))

      setExecutiveMetrics(mappedMetrics)
      setRecommendations(data.recommendations || [])
      setLastUpdated(new Date())
    } catch (error) {
      setError('Failed to load dashboard data')

      // Fallback to mock data
      setExecutiveMetrics(getMockMetrics())
      setRecommendations(getMockRecommendations())
    } finally {
      setLoading(false)
    }
  }

  // Get icon component based on metric ID
  const getIconForMetric = (metricId: string): React.ComponentType<unknown> => {
    switch (metricId) {
      case 'revenue':
        return DollarSign
      case 'growth':
        return TrendingUp
      case 'deals':
        return Target
      case 'performance':
        return Zap
      default:
        return DollarSign
    }
  }

  // Fallback mock data
  const getMockMetrics = (): ExecutiveMetric[] => [
    {
      id: 'revenue',
      title: 'Monthly Revenue',
      value: '$847,250',
      change: 23.5,
      changeLabel: 'vs last month',
      icon: DollarSign,
      gradient: 'from-emerald-500 to-green-600',
      aiInsight: 'Revenue accelerating due to enterprise deals',
      actionable: 'Focus on enterprise segment - 3x higher LTV',
    },
    {
      id: 'growth',
      title: 'Growth Rate',
      value: '34.2%',
      change: 8.7,
      changeLabel: 'MoM acceleration',
      icon: TrendingUp,
      gradient: 'from-blue-500 to-cyan-600',
      aiInsight: 'Growth rate exceeding industry benchmark by 2.3x',
      actionable: 'Scale sales team now - optimal timing detected',
    },
    {
      id: 'deals',
      title: 'Pipeline Value',
      value: '$2.1M',
      change: 15.8,
      changeLabel: 'qualified deals',
      icon: Target,
      gradient: 'from-violet-500 to-purple-600',
      aiInsight: '73% close probability on top 5 deals',
      actionable: 'Expedite Johnson Corp deal - ready to close',
    },
    {
      id: 'performance',
      title: 'AI Efficiency',
      value: '97.2%',
      change: 4.1,
      changeLabel: 'task automation',
      icon: Zap,
      gradient: 'from-orange-500 to-red-600',
      aiInsight: 'AI saving 23.7 hours per employee weekly',
      actionable: 'Deploy AI to 3 more departments this quarter',
    },
  ]

  const getMockRecommendations = (): AIRecommendation[] => [
    {
      id: '1',
      type: 'opportunity',
      title: 'Close Johnson Corp Deal',
      impact: '$180K ARR',
      action: 'Decision maker ready - schedule final call',
      confidence: 94,
    },
    {
      id: '2',
      type: 'action',
      title: 'Scale Customer Success',
      impact: '12% churn reduction',
      action: 'Hire 2 CS reps - ROI positive in 45 days',
      confidence: 87,
    },
    {
      id: '3',
      type: 'risk',
      title: 'Monitor TechFlow Account',
      impact: '$240K at risk',
      action: 'Executive check-in needed within 5 days',
      confidence: 82,
    },
  ]

  // Load dashboard data on mount and set up refresh interval
  useEffect(() => {
    fetchDashboardData()

    // Refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  const nextMetric = () => {
    setCurrentMetric((prev) => (prev + 1) % executiveMetrics.length)
  }

  const prevMetric = () => {
    setCurrentMetric((prev) => (prev - 1 + executiveMetrics.length) % executiveMetrics.length)
  }

  const handleVoiceCommand = () => {
    setIsListening(!isListening)
    // Voice command integration would go here
  }

  const shareMetrics = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'CoreFlow360 Performance Update',
        text: `Revenue: ${executiveMetrics[0].value} (${executiveMetrics[0].change}% growth)`,
        url: window.location.href,
      })
    }
  }

  const refreshData = () => {
    fetchDashboardData()
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
          <p className="text-gray-400">Loading executive dashboard...</p>
        </div>
      </div>
    )
  }

  // Show error state with fallback
  if (error && executiveMetrics.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white">
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
            <RefreshCw className="h-8 w-8 text-red-500" />
          </div>
          <p className="mb-4 text-red-400">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="rounded-lg bg-violet-600 px-4 py-2 transition-colors hover:bg-violet-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const currentMetricData = executiveMetrics[currentMetric]
  if (!currentMetricData) return null

  const IconComponent = currentMetricData.icon

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 p-6">
        <div>
          <h1 className="text-2xl font-bold">Executive Command</h1>
          <p className="text-sm text-gray-400">Last updated: {lastUpdated.toLocaleTimeString()}</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleVoiceCommand}
            className={`rounded-full p-3 transition-all ${
              isListening ? 'border border-red-500 bg-red-500/20' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <Mic className={`h-5 w-5 ${isListening ? 'text-red-500' : 'text-gray-300'}`} />
          </button>
          <button
            onClick={refreshData}
            className="rounded-full bg-gray-800 p-3 transition-all hover:bg-gray-700"
          >
            <RefreshCw className="h-5 w-5 text-gray-300" />
          </button>
          <button
            onClick={shareMetrics}
            className="rounded-full bg-gray-800 p-3 transition-all hover:bg-gray-700"
          >
            <Share className="h-5 w-5 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Main Metric Display */}
      <div className="relative px-6 py-8">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={prevMetric}
            className="rounded-full bg-gray-800/50 p-2 transition-all hover:bg-gray-700/50"
          >
            <ChevronLeft className="h-6 w-6 text-gray-300" />
          </button>

          <div className="text-center">
            <div className="mb-2 flex justify-center space-x-2">
              {executiveMetrics.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full transition-all ${
                    index === currentMetric ? 'bg-white' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-400">
              {currentMetric + 1} of {executiveMetrics.length}
            </p>
          </div>

          <button
            onClick={nextMetric}
            className="rounded-full bg-gray-800/50 p-2 transition-all hover:bg-gray-700/50"
          >
            <ChevronRight className="h-6 w-6 text-gray-300" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentMetric}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <div
              className={`mx-auto mb-6 h-24 w-24 rounded-full bg-gradient-to-r ${currentMetricData.gradient} p-6 shadow-2xl`}
            >
              <IconComponent className="mx-auto h-12 w-12 text-white" />
            </div>

            <h2 className="mb-2 text-lg text-gray-400">{currentMetricData.title}</h2>

            <div className="mb-4">
              <div className="mb-2 text-5xl font-bold">{currentMetricData.value}</div>
              <div
                className={`flex items-center justify-center text-lg ${
                  currentMetricData.change >= 0 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                <TrendingUp
                  className={`mr-1 h-5 w-5 ${currentMetricData.change < 0 ? 'rotate-180' : ''}`}
                />
                {Math.abs(currentMetricData.change)}% {currentMetricData.changeLabel}
              </div>
            </div>

            <div className="mb-4 rounded-2xl bg-gray-800/50 p-4">
              <p className="mb-1 text-sm font-medium text-cyan-400">AI Insight:</p>
              <p className="mb-3 text-sm text-white">{currentMetricData.aiInsight}</p>
              <p className="mb-1 text-sm font-medium text-emerald-400">Recommended Action:</p>
              <p className="text-sm text-white">{currentMetricData.actionable}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* AI Recommendations */}
      <div className="px-6">
        <h3 className="mb-4 flex items-center text-lg font-semibold">
          <Zap className="mr-2 h-5 w-5 text-yellow-500" />
          AI Recommendations
        </h3>

        <div className="max-h-60 space-y-3 overflow-y-auto">
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-xl border-l-4 p-4 ${
                rec.type === 'opportunity'
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : rec.type === 'risk'
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-blue-500 bg-blue-500/10'
              }`}
            >
              <div className="mb-2 flex items-start justify-between">
                <h4 className="font-medium text-white">{rec.title}</h4>
                <span className="rounded bg-gray-700 px-2 py-1 text-xs">
                  {rec.confidence}% confident
                </span>
              </div>
              <p className="mb-2 text-sm text-gray-300">{rec.impact}</p>
              <p className="text-xs text-gray-400">{rec.action}</p>

              <button className="mt-3 rounded-full bg-white/10 px-3 py-1 text-xs transition-all hover:bg-white/20">
                Take Action
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Swipe Instructions */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 transform">
        <p className="text-center text-xs text-gray-500">
          Swipe left/right or use arrows to navigate metrics
        </p>
      </div>
    </div>
  )
}
