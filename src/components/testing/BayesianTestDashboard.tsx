/**
 * CoreFlow360 - Bayesian A/B Testing Dashboard
 * Advanced statistical analysis dashboard for A/B tests
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  Target,
  Users,
  BarChart3,
  Play,
  Pause,
  Square,
  Clock,
  Award,
  AlertCircle,
  CheckCircle,
  Activity,
  Zap,
  Brain
} from 'lucide-react'
import useBayesianTesting from '@/hooks/useBayesianTesting'
import { BayesianResult } from '@/lib/testing/bayesian-analysis'

interface TestCard {
  id: string
  name: string
  status: 'draft' | 'running' | 'paused' | 'completed'
  variants: number
  visitors: number
  conversions: number
  confidence?: number
  winner?: string
}

export default function BayesianTestDashboard() {
  const {
    tests,
    currentAnalysis,
    isAnalyzing,
    analyzeTest,
    startTest,
    stopTest,
    getTestRecommendation
  } = useBayesianTesting()

  const [selectedTest, setSelectedTest] = useState<string | null>(null)
  const [recommendation, setRecommendation] = useState<any>(null)

  // Calculate aggregate statistics
  const stats = {
    totalTests: tests.length,
    runningTests: tests.filter(t => t.status === 'running').length,
    completedTests: tests.filter(t => t.status === 'completed').length,
    totalVisitors: tests.reduce((sum, test) => 
      sum + test.variants.reduce((varSum, variant) => varSum + variant.visitors, 0), 0
    ),
    totalConversions: tests.reduce((sum, test) => 
      sum + test.variants.reduce((varSum, variant) => varSum + variant.conversions, 0), 0
    )
  }

  const handleAnalyzeTest = async (testId: string) => {
    try {
      await analyzeTest(testId)
      const rec = await getTestRecommendation(testId)
      setRecommendation(rec)
      setSelectedTest(testId)
    } catch (error) {
      console.error('Failed to analyze test:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-400 bg-green-400/10'
      case 'completed': return 'text-blue-400 bg-blue-400/10'
      case 'paused': return 'text-yellow-400 bg-yellow-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`
  const formatNumber = (value: number) => value.toLocaleString()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Bayesian A/B Testing
          </h1>
          <p className="text-gray-400">
            Advanced statistical analysis for data-driven decisions
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-violet-400">
            <Brain className="w-5 h-5" />
            <span className="text-sm font-medium">AI-Powered Analysis</span>
          </div>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {[
          {
            label: 'Total Tests',
            value: stats.totalTests,
            icon: Target,
            color: 'text-blue-400'
          },
          {
            label: 'Running Tests',
            value: stats.runningTests,
            icon: Play,
            color: 'text-green-400'
          },
          {
            label: 'Completed Tests',
            value: stats.completedTests,
            icon: CheckCircle,
            color: 'text-purple-400'
          },
          {
            label: 'Total Visitors',
            value: formatNumber(stats.totalVisitors),
            icon: Users,
            color: 'text-orange-400'
          },
          {
            label: 'Total Conversions',
            value: formatNumber(stats.totalConversions),
            icon: TrendingUp,
            color: 'text-green-400'
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg bg-gray-700/50 flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {stat.value}
            </div>
            <div className="text-gray-400 text-sm">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid xl:grid-cols-3 gap-8">
        {/* Test List */}
        <div className="xl:col-span-2">
          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Active Tests</h3>
            
            <div className="space-y-4">
              {tests.map((test, index) => (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    selectedTest === test.id
                      ? 'border-violet-500/50 bg-violet-500/10'
                      : 'border-gray-700/50 bg-gray-700/20 hover:border-gray-600/50'
                  }`}
                  onClick={() => setSelectedTest(test.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-white font-medium">{test.name}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(test.status)}`}>
                        {test.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {test.status === 'running' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            stopTest(test.id)
                          }}
                          className="p-1 text-orange-400 hover:text-orange-300 transition-colors"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      )}
                      {test.status === 'paused' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            startTest(test.id)
                          }}
                          className="p-1 text-green-400 hover:text-green-300 transition-colors"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAnalyzeTest(test.id)
                        }}
                        disabled={isAnalyzing}
                        className="p-1 text-violet-400 hover:text-violet-300 transition-colors disabled:opacity-50"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Variants:</span>
                      <div className="text-white font-medium">{test.variants.length}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Visitors:</span>
                      <div className="text-white font-medium">
                        {formatNumber(test.variants.reduce((sum, v) => sum + v.visitors, 0))}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Conversions:</span>
                      <div className="text-white font-medium">
                        {formatNumber(test.variants.reduce((sum, v) => sum + v.conversions, 0))}
                      </div>
                    </div>
                  </div>

                  {test.status === 'running' && (
                    <div className="mt-3 pt-3 border-t border-gray-700/50">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">
                          Started {new Date(test.startDate).toLocaleDateString()}
                        </span>
                        <div className="flex items-center text-green-400">
                          <Activity className="w-3 h-3 mr-1" />
                          Live
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

              {tests.length === 0 && (
                <div className="text-center py-12">
                  <Target className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <div className="text-gray-400 text-lg mb-2">No tests yet</div>
                  <div className="text-gray-500 text-sm">
                    Create your first A/B test to get started
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Analysis Panel */}
        <div className="space-y-6">
          {/* Bayesian Analysis Results */}
          {currentAnalysis && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-violet-400" />
                Bayesian Analysis
              </h3>

              <div className="space-y-4">
                {/* Recommended Action */}
                <div className="p-4 rounded-lg bg-gray-700/30">
                  <div className="flex items-center mb-2">
                    {currentAnalysis.analysis.recommendedAction === 'stop_winner' ? (
                      <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                    ) : currentAnalysis.analysis.recommendedAction === 'continue' ? (
                      <Clock className="w-5 h-5 text-yellow-400 mr-2" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-orange-400 mr-2" />
                    )}
                    <span className="text-white font-medium">
                      {currentAnalysis.analysis.recommendedAction === 'stop_winner' ? 'Declare Winner' :
                       currentAnalysis.analysis.recommendedAction === 'continue' ? 'Continue Test' :
                       'Stop - Inconclusive'}
                    </span>
                  </div>
                  <div className="text-gray-300 text-sm">
                    Confidence: {formatPercent(currentAnalysis.analysis.confidence)}
                  </div>
                </div>

                {/* Variant Performance */}
                <div className="space-y-3">
                  <h4 className="text-white font-medium">Variant Performance</h4>
                  {currentAnalysis.results.map((result, index) => (
                    <div key={result.variant} className="p-3 rounded-lg bg-gray-700/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">
                          {index === 0 ? 'Control' : `Variant ${result.variant}`}
                        </span>
                        <span className="text-gray-300 text-sm">
                          {formatPercent(result.conversionRate)}
                        </span>
                      </div>
                      
                      {index > 0 && (
                        <div className="text-sm">
                          <div className="text-gray-400 mb-1">
                            Probability to beat control:
                          </div>
                          <div className="text-green-400 font-medium">
                            {formatPercent(currentAnalysis.analysis.probabilityToBeatControl[result.variant] || 0)}
                          </div>
                        </div>
                      )}

                      <div className="mt-2 text-xs text-gray-500">
                        {formatNumber(result.visitors)} visitors, {formatNumber(result.conversions)} conversions
                      </div>
                    </div>
                  ))}
                </div>

                {/* Credible Intervals */}
                <div className="space-y-3">
                  <h4 className="text-white font-medium">Credible Intervals (95%)</h4>
                  {Object.entries(currentAnalysis.analysis.credibleIntervals).map(([variant, interval]) => (
                    <div key={variant} className="p-3 rounded-lg bg-gray-700/20">
                      <div className="text-white text-sm font-medium mb-1">
                        {variant === currentAnalysis.results[0].variant ? 'Control' : `Variant ${variant}`}
                      </div>
                      <div className="text-gray-300 text-sm">
                        {formatPercent(interval.lower)} - {formatPercent(interval.upper)}
                      </div>
                      <div className="text-gray-400 text-xs">
                        Mean: {formatPercent(interval.mean)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Recommendation */}
          {recommendation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                AI Recommendation
              </h3>

              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${
                  recommendation.action === 'stop_winner' ? 'bg-green-600/20 border border-green-500/30' :
                  recommendation.action === 'continue' ? 'bg-yellow-600/20 border border-yellow-500/30' :
                  'bg-orange-600/20 border border-orange-500/30'
                }`}>
                  <div className="flex items-center mb-2">
                    <Award className="w-5 h-5 mr-2 text-yellow-400" />
                    <span className="text-white font-medium">
                      {recommendation.action === 'stop_winner' ? 'Stop Test - Winner Found' :
                       recommendation.action === 'continue' ? 'Continue Testing' :
                       'Stop Test - Inconclusive'}
                    </span>
                  </div>
                  
                  {recommendation.winningVariant && (
                    <div className="text-sm text-gray-300 mb-2">
                      Winner: Variant {recommendation.winningVariant}
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-300 mb-3">
                    Confidence: {formatPercent(recommendation.confidence)}
                  </div>
                  
                  <div className="text-sm text-gray-400">
                    {recommendation.reasoning}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {!currentAnalysis && !isAnalyzing && (
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <div className="text-gray-400 text-lg mb-2">Select a test</div>
                <div className="text-gray-500 text-sm">
                  Choose a test to view Bayesian analysis
                </div>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <div className="text-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 mx-auto mb-4"
                >
                  <Brain className="w-full h-full text-violet-400" />
                </motion.div>
                <div className="text-gray-400 text-lg mb-2">Analyzing...</div>
                <div className="text-gray-500 text-sm">
                  Running Bayesian statistical analysis
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}