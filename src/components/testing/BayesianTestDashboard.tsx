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
  Brain,
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
    getTestRecommendation,
  } = useBayesianTesting()

  const [selectedTest, setSelectedTest] = useState<string | null>(null)
  const [recommendation, setRecommendation] = useState<unknown>(null)

  // Calculate aggregate statistics
  const stats = {
    totalTests: tests.length,
    runningTests: tests.filter((t) => t.status === 'running').length,
    completedTests: tests.filter((t) => t.status === 'completed').length,
    totalVisitors: tests.reduce(
      (sum, test) => sum + test.variants.reduce((varSum, variant) => varSum + variant.visitors, 0),
      0
    ),
    totalConversions: tests.reduce(
      (sum, test) =>
        sum + test.variants.reduce((varSum, variant) => varSum + variant.conversions, 0),
      0
    ),
  }

  const handleAnalyzeTest = async (testId: string) => {
    try {
      await analyzeTest(testId)
      const rec = await getTestRecommendation(testId)
      setRecommendation(rec)
      setSelectedTest(testId)
    } catch (error) {}
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-green-400 bg-green-400/10'
      case 'completed':
        return 'text-blue-400 bg-blue-400/10'
      case 'paused':
        return 'text-yellow-400 bg-yellow-400/10'
      default:
        return 'text-gray-400 bg-gray-400/10'
    }
  }

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`
  const formatNumber = (value: number) => value.toLocaleString()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-white">Bayesian A/B Testing</h1>
          <p className="text-gray-400">Advanced statistical analysis for data-driven decisions</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-violet-400">
            <Brain className="h-5 w-5" />
            <span className="text-sm font-medium">AI-Powered Analysis</span>
          </div>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
        {[
          {
            label: 'Total Tests',
            value: stats.totalTests,
            icon: Target,
            color: 'text-blue-400',
          },
          {
            label: 'Running Tests',
            value: stats.runningTests,
            icon: Play,
            color: 'text-green-400',
          },
          {
            label: 'Completed Tests',
            value: stats.completedTests,
            icon: CheckCircle,
            color: 'text-purple-400',
          },
          {
            label: 'Total Visitors',
            value: formatNumber(stats.totalVisitors),
            icon: Users,
            color: 'text-orange-400',
          },
          {
            label: 'Total Conversions',
            value: formatNumber(stats.totalConversions),
            icon: TrendingUp,
            color: 'text-green-400',
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-xl border border-gray-700/50 bg-gray-800/40 p-6 backdrop-blur-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gray-700/50 ${stat.color}`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mb-1 text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-gray-400">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-8 xl:grid-cols-3">
        {/* Test List */}
        <div className="xl:col-span-2">
          <div className="rounded-xl border border-gray-700/50 bg-gray-800/40 p-6 backdrop-blur-sm">
            <h3 className="mb-6 text-lg font-semibold text-white">Active Tests</h3>

            <div className="space-y-4">
              {tests.map((test, index) => (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`cursor-pointer rounded-lg border p-4 transition-all ${
                    selectedTest === test.id
                      ? 'border-violet-500/50 bg-violet-500/10'
                      : 'border-gray-700/50 bg-gray-700/20 hover:border-gray-600/50'
                  }`}
                  onClick={() => setSelectedTest(test.id)}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium text-white">{test.name}</h4>
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${getStatusColor(test.status)}`}
                      >
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
                          className="p-1 text-orange-400 transition-colors hover:text-orange-300"
                        >
                          <Pause className="h-4 w-4" />
                        </button>
                      )}
                      {test.status === 'paused' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            startTest(test.id)
                          }}
                          className="p-1 text-green-400 transition-colors hover:text-green-300"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAnalyzeTest(test.id)
                        }}
                        disabled={isAnalyzing}
                        className="p-1 text-violet-400 transition-colors hover:text-violet-300 disabled:opacity-50"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Variants:</span>
                      <div className="font-medium text-white">{test.variants.length}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Visitors:</span>
                      <div className="font-medium text-white">
                        {formatNumber(test.variants.reduce((sum, v) => sum + v.visitors, 0))}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Conversions:</span>
                      <div className="font-medium text-white">
                        {formatNumber(test.variants.reduce((sum, v) => sum + v.conversions, 0))}
                      </div>
                    </div>
                  </div>

                  {test.status === 'running' && (
                    <div className="mt-3 border-t border-gray-700/50 pt-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">
                          Started {new Date(test.startDate).toLocaleDateString()}
                        </span>
                        <div className="flex items-center text-green-400">
                          <Activity className="mr-1 h-3 w-3" />
                          Live
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

              {tests.length === 0 && (
                <div className="py-12 text-center">
                  <Target className="mx-auto mb-4 h-12 w-12 text-gray-600" />
                  <div className="mb-2 text-lg text-gray-400">No tests yet</div>
                  <div className="text-sm text-gray-500">
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
              className="rounded-xl border border-gray-700/50 bg-gray-800/40 p-6 backdrop-blur-sm"
            >
              <h3 className="mb-6 flex items-center text-lg font-semibold text-white">
                <Brain className="mr-2 h-5 w-5 text-violet-400" />
                Bayesian Analysis
              </h3>

              <div className="space-y-4">
                {/* Recommended Action */}
                <div className="rounded-lg bg-gray-700/30 p-4">
                  <div className="mb-2 flex items-center">
                    {currentAnalysis.analysis.recommendedAction === 'stop_winner' ? (
                      <CheckCircle className="mr-2 h-5 w-5 text-green-400" />
                    ) : currentAnalysis.analysis.recommendedAction === 'continue' ? (
                      <Clock className="mr-2 h-5 w-5 text-yellow-400" />
                    ) : (
                      <AlertCircle className="mr-2 h-5 w-5 text-orange-400" />
                    )}
                    <span className="font-medium text-white">
                      {currentAnalysis.analysis.recommendedAction === 'stop_winner'
                        ? 'Declare Winner'
                        : currentAnalysis.analysis.recommendedAction === 'continue'
                          ? 'Continue Test'
                          : 'Stop - Inconclusive'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-300">
                    Confidence: {formatPercent(currentAnalysis.analysis.confidence)}
                  </div>
                </div>

                {/* Variant Performance */}
                <div className="space-y-3">
                  <h4 className="font-medium text-white">Variant Performance</h4>
                  {currentAnalysis.results.map((result, index) => (
                    <div key={result.variant} className="rounded-lg bg-gray-700/20 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-medium text-white">
                          {index === 0 ? 'Control' : `Variant ${result.variant}`}
                        </span>
                        <span className="text-sm text-gray-300">
                          {formatPercent(result.conversionRate)}
                        </span>
                      </div>

                      {index > 0 && (
                        <div className="text-sm">
                          <div className="mb-1 text-gray-400">Probability to beat control:</div>
                          <div className="font-medium text-green-400">
                            {formatPercent(
                              currentAnalysis.analysis.probabilityToBeatControl[result.variant] || 0
                            )}
                          </div>
                        </div>
                      )}

                      <div className="mt-2 text-xs text-gray-500">
                        {formatNumber(result.visitors)} visitors, {formatNumber(result.conversions)}{' '}
                        conversions
                      </div>
                    </div>
                  ))}
                </div>

                {/* Credible Intervals */}
                <div className="space-y-3">
                  <h4 className="font-medium text-white">Credible Intervals (95%)</h4>
                  {Object.entries(currentAnalysis.analysis.credibleIntervals).map(
                    ([variant, interval]) => (
                      <div key={variant} className="rounded-lg bg-gray-700/20 p-3">
                        <div className="mb-1 text-sm font-medium text-white">
                          {variant === currentAnalysis.results[0].variant
                            ? 'Control'
                            : `Variant ${variant}`}
                        </div>
                        <div className="text-sm text-gray-300">
                          {formatPercent(interval.lower)} - {formatPercent(interval.upper)}
                        </div>
                        <div className="text-xs text-gray-400">
                          Mean: {formatPercent(interval.mean)}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Recommendation */}
          {recommendation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border border-gray-700/50 bg-gray-800/40 p-6 backdrop-blur-sm"
            >
              <h3 className="mb-4 flex items-center text-lg font-semibold text-white">
                <Zap className="mr-2 h-5 w-5 text-yellow-400" />
                AI Recommendation
              </h3>

              <div className="space-y-4">
                <div
                  className={`rounded-lg p-4 ${
                    recommendation.action === 'stop_winner'
                      ? 'border border-green-500/30 bg-green-600/20'
                      : recommendation.action === 'continue'
                        ? 'border border-yellow-500/30 bg-yellow-600/20'
                        : 'border border-orange-500/30 bg-orange-600/20'
                  }`}
                >
                  <div className="mb-2 flex items-center">
                    <Award className="mr-2 h-5 w-5 text-yellow-400" />
                    <span className="font-medium text-white">
                      {recommendation.action === 'stop_winner'
                        ? 'Stop Test - Winner Found'
                        : recommendation.action === 'continue'
                          ? 'Continue Testing'
                          : 'Stop Test - Inconclusive'}
                    </span>
                  </div>

                  {recommendation.winningVariant && (
                    <div className="mb-2 text-sm text-gray-300">
                      Winner: Variant {recommendation.winningVariant}
                    </div>
                  )}

                  <div className="mb-3 text-sm text-gray-300">
                    Confidence: {formatPercent(recommendation.confidence)}
                  </div>

                  <div className="text-sm text-gray-400">{recommendation.reasoning}</div>
                </div>
              </div>
            </motion.div>
          )}

          {!currentAnalysis && !isAnalyzing && (
            <div className="rounded-xl border border-gray-700/50 bg-gray-800/40 p-6 backdrop-blur-sm">
              <div className="py-8 text-center">
                <BarChart3 className="mx-auto mb-4 h-12 w-12 text-gray-600" />
                <div className="mb-2 text-lg text-gray-400">Select a test</div>
                <div className="text-sm text-gray-500">Choose a test to view Bayesian analysis</div>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="rounded-xl border border-gray-700/50 bg-gray-800/40 p-6 backdrop-blur-sm">
              <div className="py-8 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="mx-auto mb-4 h-12 w-12"
                >
                  <Brain className="h-full w-full text-violet-400" />
                </motion.div>
                <div className="mb-2 text-lg text-gray-400">Analyzing...</div>
                <div className="text-sm text-gray-500">Running Bayesian statistical analysis</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
