/**
 * AI Insights Panel Component
 * Displays real-time AI-generated business insights
 */

import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  Target,
  Sparkles,
  ChevronRight,
  RefreshCw,
} from 'lucide-react'
import { AIInsight } from '@/lib/ai/dashboard-insights-generator'

interface AIInsightsPanelProps {
  insights: AIInsight[]
  isLoading?: boolean
  onRefresh?: () => void
  className?: string
}

export function AIInsightsPanel({
  insights,
  isLoading = false,
  onRefresh,
  className = '',
}: AIInsightsPanelProps) {
  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'trend':
        return TrendingUp
      case 'anomaly':
        return AlertCircle
      case 'recommendation':
        return Lightbulb
      case 'prediction':
        return Target
      default:
        return Brain
    }
  }

  const getInsightColor = (type: AIInsight['type'], impact: AIInsight['impact']) => {
    if (type === 'anomaly') {
      return impact === 'critical' ? 'text-red-400 bg-red-900/20' : 'text-orange-400 bg-orange-900/20'
    }
    
    switch (impact) {
      case 'critical':
        return 'text-purple-400 bg-purple-900/20'
      case 'high':
        return 'text-blue-400 bg-blue-900/20'
      case 'medium':
        return 'text-green-400 bg-green-900/20'
      default:
        return 'text-gray-400 bg-gray-800/20'
    }
  }

  const sortedInsights = [...insights].sort((a, b) => {
    const impactOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    return impactOrder[a.impact] - impactOrder[b.impact]
  })

  return (
    <div className={`rounded-2xl border border-gray-700/50 bg-gray-800/40 p-6 backdrop-blur-sm ${className}`}>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20">
            <Sparkles className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI Business Insights</h3>
            <p className="text-xs text-gray-400">Powered by advanced analytics</p>
          </div>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center space-x-2 rounded-lg border border-gray-700/50 bg-gray-800/50 px-3 py-1.5 text-sm text-gray-400 transition-all hover:border-purple-500/50 hover:text-purple-400 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-48 items-center justify-center"
          >
            <div className="text-center">
              <Brain className="mx-auto mb-3 h-8 w-8 animate-pulse text-purple-400" />
              <p className="text-sm text-gray-400">Analyzing business data...</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="insights"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {sortedInsights.map((insight, index) => {
              const Icon = getInsightIcon(insight.type)
              const colorClass = getInsightColor(insight.type, insight.impact)

              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative overflow-hidden rounded-xl border border-gray-700/50 bg-gray-800/50 p-4 transition-all hover:border-gray-600/50"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <h4 className="text-sm font-medium text-white">{insight.title}</h4>
                        {insight.value && (
                          <span className="text-sm font-semibold text-purple-400">
                            {insight.value}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-400">{insight.description}</p>
                      
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs">
                          <span className="text-gray-500">
                            Confidence: {Math.round(insight.confidence * 100)}%
                          </span>
                          {insight.department && (
                            <span className="text-gray-500">
                              Dept: {insight.department}
                            </span>
                          )}
                        </div>
                        
                        <ChevronRight className="h-4 w-4 text-gray-600 opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Impact indicator */}
                  <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b">
                    <div
                      className={`h-full w-full ${
                        insight.impact === 'critical'
                          ? 'bg-gradient-to-b from-purple-500 to-purple-600'
                          : insight.impact === 'high'
                            ? 'bg-gradient-to-b from-blue-500 to-blue-600'
                            : insight.impact === 'medium'
                              ? 'bg-gradient-to-b from-green-500 to-green-600'
                              : 'bg-gradient-to-b from-gray-500 to-gray-600'
                      }`}
                    />
                  </div>
                </motion.div>
              )
            })}

            {insights.length === 0 && (
              <div className="flex h-32 items-center justify-center rounded-xl border border-gray-700/50 bg-gray-800/20">
                <div className="text-center">
                  <Brain className="mx-auto mb-2 h-6 w-6 text-gray-500" />
                  <p className="text-sm text-gray-500">No insights available</p>
                  <p className="text-xs text-gray-600">Configure AI providers to enable insights</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}