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
  RefreshCw
} from 'lucide-react'

interface ExecutiveMetric {
  id: string
  title: string
  value: string
  change: number
  changeLabel: string
  icon: React.ComponentType<any>
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
      const mappedMetrics: ExecutiveMetric[] = data.metrics.map((metric: any) => ({
        id: metric.id,
        title: metric.title,
        value: metric.value,
        change: metric.change,
        changeLabel: metric.changeLabel,
        icon: getIconForMetric(metric.id),
        gradient: metric.gradient,
        aiInsight: metric.aiInsight,
        actionable: metric.actionable
      }))
      
      setExecutiveMetrics(mappedMetrics)
      setRecommendations(data.recommendations || [])
      setLastUpdated(new Date())
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      setError('Failed to load dashboard data')
      
      // Fallback to mock data
      setExecutiveMetrics(getMockMetrics())
      setRecommendations(getMockRecommendations())
    } finally {
      setLoading(false)
    }
  }
  
  // Get icon component based on metric ID
  const getIconForMetric = (metricId: string): React.ComponentType<any> => {
    switch (metricId) {
      case 'revenue': return DollarSign
      case 'growth': return TrendingUp
      case 'deals': return Target
      case 'performance': return Zap
      default: return DollarSign
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
      actionable: 'Focus on enterprise segment - 3x higher LTV'
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
      actionable: 'Scale sales team now - optimal timing detected'
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
      actionable: 'Expedite Johnson Corp deal - ready to close'
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
      actionable: 'Deploy AI to 3 more departments this quarter'
    }
  ]
  
  const getMockRecommendations = (): AIRecommendation[] => [
    {
      id: '1',
      type: 'opportunity',
      title: 'Close Johnson Corp Deal',
      impact: '$180K ARR',
      action: 'Decision maker ready - schedule final call',
      confidence: 94
    },
    {
      id: '2',
      type: 'action',
      title: 'Scale Customer Success',
      impact: '12% churn reduction',
      action: 'Hire 2 CS reps - ROI positive in 45 days',
      confidence: 87
    },
    {
      id: '3',
      type: 'risk',
      title: 'Monitor TechFlow Account',
      impact: '$240K at risk',
      action: 'Executive check-in needed within 5 days',
      confidence: 82
    }
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
        url: window.location.href
      })
    }
  }

  const refreshData = () => {
    fetchDashboardData()
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading executive dashboard...</p>
        </div>
      </div>
    )
  }
  
  // Show error state with fallback
  if (error && executiveMetrics.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg transition-colors"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-bold">Executive Command</h1>
          <p className="text-gray-400 text-sm">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleVoiceCommand}
            className={`p-3 rounded-full transition-all ${
              isListening 
                ? 'bg-red-500/20 border border-red-500' 
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <Mic className={`w-5 h-5 ${isListening ? 'text-red-500' : 'text-gray-300'}`} />
          </button>
          <button
            onClick={refreshData}
            className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-all"
          >
            <RefreshCw className="w-5 h-5 text-gray-300" />
          </button>
          <button
            onClick={shareMetrics}
            className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-all"
          >
            <Share className="w-5 h-5 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Main Metric Display */}
      <div className="relative px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMetric}
            className="p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-all"
          >
            <ChevronLeft className="w-6 h-6 text-gray-300" />
          </button>
          
          <div className="text-center">
            <div className="flex space-x-2 justify-center mb-2">
              {executiveMetrics.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentMetric ? 'bg-white' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
            <p className="text-gray-400 text-sm">{currentMetric + 1} of {executiveMetrics.length}</p>
          </div>

          <button
            onClick={nextMetric}
            className="p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-all"
          >
            <ChevronRight className="w-6 h-6 text-gray-300" />
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
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r ${currentMetricData.gradient} p-6 shadow-2xl`}>
              <IconComponent className="w-12 h-12 text-white mx-auto" />
            </div>

            <h2 className="text-lg text-gray-400 mb-2">{currentMetricData.title}</h2>
            
            <div className="mb-4">
              <div className="text-5xl font-bold mb-2">{currentMetricData.value}</div>
              <div className={`flex items-center justify-center text-lg ${
                currentMetricData.change >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                <TrendingUp className={`w-5 h-5 mr-1 ${currentMetricData.change < 0 ? 'rotate-180' : ''}`} />
                {Math.abs(currentMetricData.change)}% {currentMetricData.changeLabel}
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-2xl p-4 mb-4">
              <p className="text-cyan-400 text-sm font-medium mb-1">AI Insight:</p>
              <p className="text-white text-sm mb-3">{currentMetricData.aiInsight}</p>
              <p className="text-emerald-400 text-sm font-medium mb-1">Recommended Action:</p>
              <p className="text-white text-sm">{currentMetricData.actionable}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* AI Recommendations */}
      <div className="px-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-yellow-500" />
          AI Recommendations
        </h3>
        
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl border-l-4 ${
                rec.type === 'opportunity' 
                  ? 'bg-emerald-500/10 border-emerald-500' 
                  : rec.type === 'risk'
                  ? 'bg-red-500/10 border-red-500'
                  : 'bg-blue-500/10 border-blue-500'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-white">{rec.title}</h4>
                <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                  {rec.confidence}% confident
                </span>
              </div>
              <p className="text-gray-300 text-sm mb-2">{rec.impact}</p>
              <p className="text-gray-400 text-xs">{rec.action}</p>
              
              <button className="mt-3 text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-all">
                Take Action
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Swipe Instructions */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <p className="text-gray-500 text-xs text-center">
          Swipe left/right or use arrows to navigate metrics
        </p>
      </div>
    </div>
  )
}