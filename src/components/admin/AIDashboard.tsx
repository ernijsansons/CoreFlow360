'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CpuChipIcon,
  ChartBarIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  BeakerIcon,
  BoltIcon,
  DocumentArrowDownIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  CogIcon,
  FireIcon,
  SparklesIcon,
  BrainIcon,
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
} from 'recharts'
import { toast } from 'react-hot-toast'

interface AIModel {
  id: string
  name: string
  type: 'classification' | 'regression' | 'generation' | 'analysis' | 'prediction'
  version: string
  status: 'training' | 'ready' | 'updating' | 'error'
  accuracy?: number
  lastTrained: Date
  performance: {
    inferenceTime: number
    accuracy: number
    precision?: number
    recall?: number
    f1Score?: number
  }
}

interface CustomModel {
  id: string
  name: string
  architecture: string
  status: 'draft' | 'training' | 'trained' | 'deployed' | 'retired'
  metrics: {
    accuracy: number
    loss: number
    validationAccuracy: number
    validationLoss: number
  }
}

interface AIAnalytics {
  models: AIModel[]
  customModels: CustomModel[]
  recentPredictions: number
  averageConfidence: number
  modelPerformance: Record<
    string,
    {
      requests: number
      accuracy: number
      avgResponseTime: number
    }
  >
  systemHealth: {
    status: string
    queueSize: number
    processingLoad: number
    errorRate: number
  }
  insights: Array<{
    type: string
    insight: string
    confidence: number
    recommendation: string
  }>
}

const COLORS = {
  primary: '#6366f1',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  purple: '#8b5cf6',
  pink: '#ec4899',
}

const STATUS_COLORS = {
  EXCELLENT: 'text-green-600 bg-green-100',
  GOOD: 'text-blue-600 bg-blue-100',
  WARNING: 'text-yellow-600 bg-yellow-100',
  CRITICAL: 'text-red-600 bg-red-100',
  ready: 'text-green-600 bg-green-100',
  training: 'text-yellow-600 bg-yellow-100',
  updating: 'text-blue-600 bg-blue-100',
  error: 'text-red-600 bg-red-100',
  trained: 'text-green-600 bg-green-100',
  deployed: 'text-purple-600 bg-purple-100',
  draft: 'text-gray-600 bg-gray-100',
}

const MODEL_TYPE_ICONS = {
  classification: ChartBarIcon,
  regression: LineChart,
  generation: SparklesIcon,
  analysis: EyeIcon,
  prediction: CpuChipIcon,
}

export default function AIDashboard() {
  const [data, setData] = useState<AIAnalytics | null>(null)
  const [selectedView, setSelectedView] = useState<
    'overview' | 'models' | 'predictions' | 'training' | 'insights'
  >('overview')
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30)
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [predictionInput, setPredictionInput] = useState('')
  const [predictionResult, setPredictionResult] = useState<unknown>(null)
  const [trainingProgress, setTrainingProgress] = useState<Record<string, number>>({})

  useEffect(() => {
    loadAIData()

    let interval: NodeJS.Timer | null = null
    if (autoRefresh) {
      interval = setInterval(loadAIData, refreshInterval * 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  const loadAIData = async () => {
    try {
      const response = await fetch('/api/ai/intelligence?action=analytics')
      const result = await response.json()

      if (result.success) {
        setData(result)
      } else {
        throw new Error(result.error || 'Failed to load data')
      }
    } catch (error) {
      toast.error('Failed to load AI dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleAIAction = async (action: string, actionData?: unknown) => {
    try {
      const response = await fetch('/api/ai/intelligence', {
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
          await loadAIData() // Refresh data
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

  const handlePredict = async () => {
    if (!selectedModel || !predictionInput.trim()) {
      toast.error('Please select a model and provide input')
      return
    }

    try {
      const input = JSON.parse(predictionInput)
      const result = await handleAIAction('predict', {
        modelId: selectedModel,
        input,
        options: {
          confidence: true,
          explanation: true,
          alternatives: 1,
        },
      })

      setPredictionResult(result.result)
    } catch (error) {
      if (error instanceof SyntaxError) {
        toast.error('Invalid JSON input format')
      }
    }
  }

  const handleTrainModel = async () => {
    try {
      const result = await handleAIAction('train', {
        name: 'Custom Business Model',
        architecture: 'INTELLIGENT_network',
        trainingConfig: {
          batchSize: 32,
          epochs: 50,
          learningRate: 0.001,
          validationSplit: 0.2,
          earlyStopping: true,
        },
      })

      // Start monitoring training progress
      const modelId = result.result.modelId
      setTrainingProgress((prev) => ({ ...prev, [modelId]: 0 }))

      // Simulate training progress
      const progressInterval = setInterval(() => {
        setTrainingProgress((prev) => {
          const currentProgress = prev[modelId] || 0
          if (currentProgress >= 100) {
            clearInterval(progressInterval)
            return prev
          }
          return { ...prev, [modelId]: currentProgress + 2 }
        })
      }, 1000)
    } catch (error) {
      // Error already handled
    }
  }

  const handleOptimize = async () => {
    try {
      const result = await handleAIAction('optimize')

      // Show optimization results
      const improvements = result.result.improvements
      if (improvements.length > 0) {
        improvements.slice(0, 3).forEach((improvement: unknown, index: number) => {
          setTimeout(() => {
            toast.success(`${improvement.optimization}: ${improvement.improvement}`, {
              duration: 4000,
            })
          }, index * 1500)
        })
      }
    } catch (error) {
      // Error already handled
    }
  }

  const handleExport = async () => {
    try {
      const result = await handleAIAction('export', { format: 'json' })

      const blob = new Blob([JSON.stringify(result.result.data, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ai-analytics-${new Date().toISOString().split('T')[0]}.json`
      a.click()
    } catch (error) {
      // Error already handled
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'excellent':
      case 'ready':
      case 'trained':
      case 'deployed':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />
      case 'good':
        return <CheckCircleIcon className="h-5 w-5 text-blue-600" />
      case 'warning':
      case 'training':
      case 'updating':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />
      case 'critical':
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />
    }
  }

  const getHealthColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'EXCELLENT':
        return 'text-green-600'
      case 'GOOD':
        return 'text-blue-600'
      case 'WARNING':
        return 'text-yellow-600'
      case 'CRITICAL':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const generateModelPerformanceData = () => {
    if (!data?.modelPerformance) return []

    return Object.entries(data.modelPerformance).map(([modelId, perf]) => ({
      name: modelId.split('_').join(' '),
      accuracy: (perf.accuracy * 100).toFixed(1),
      responseTime: perf.avgResponseTime,
      requests: perf.requests,
    }))
  }

  const generateSystemHealthData = () => {
    if (!data?.systemHealth) return []

    return [
      { name: 'Queue Load', value: data.systemHealth.queueSize, color: COLORS.info },
      { name: 'Processing Load', value: data.systemHealth.processingLoad, color: COLORS.warning },
      { name: 'Error Rate', value: data.systemHealth.errorRate, color: COLORS.error },
      { name: 'Success Rate', value: 100 - data.systemHealth.errorRate, color: COLORS.success },
    ]
  }

  if (loading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600" />
          <p className="text-gray-600">Loading AI dashboard...</p>
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
              <BrainIcon className="mr-4 h-10 w-10 text-indigo-600" />
              <div>
                <h1 className="mb-2 text-4xl font-bold text-gray-900">AI Intelligence Center</h1>
                <p className="text-lg text-gray-600">
                  Advanced AI models, predictions, and intelligent analytics
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
                  <option value="10">10s</option>
                  <option value="30">30s</option>
                  <option value="60">1m</option>
                  <option value="300">5m</option>
                </select>
              </div>
              <button
                onClick={handleOptimize}
                className="flex items-center rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
              >
                <BoltIcon className="mr-2 h-4 w-4" />
                Optimize
              </button>
              <button
                onClick={handleTrainModel}
                className="flex items-center rounded-lg bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-700"
              >
                <RocketLaunchIcon className="mr-2 h-4 w-4" />
                Train Model
              </button>
              <button
                onClick={() => loadAIData()}
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

        {/* System Health Overview */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-white p-6 shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-4 rounded-lg bg-indigo-100 p-3">
                  <CpuChipIcon className="h-8 w-8 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">AI System Health</h3>
                  <p className="text-gray-600">Overall AI infrastructure status and performance</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${getHealthColor(data.systemHealth.status)}`}>
                  {data.systemHealth.status}
                </div>
                <div className="flex items-center justify-end">
                  {getStatusIcon(data.systemHealth.status)}
                  <span className="ml-2 text-gray-600">
                    {data.models.length + data.customModels.length} models active
                  </span>
                </div>
              </div>
            </div>

            {/* System Metrics */}
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-gray-900">Queue Size</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {data.systemHealth.queueSize}
                  </span>
                </div>
                <div className="text-sm text-gray-600">Pending requests</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-gray-900">Processing Load</span>
                  <span className="text-2xl font-bold text-yellow-600">
                    {data.systemHealth.processingLoad.toFixed(0)}%
                  </span>
                </div>
                <div className="text-sm text-gray-600">System utilization</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-gray-900">Error Rate</span>
                  <span className="text-2xl font-bold text-red-600">
                    {data.systemHealth.errorRate.toFixed(1)}%
                  </span>
                </div>
                <div className="text-sm text-gray-600">Failed requests</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-gray-900">Avg Confidence</span>
                  <span className="text-2xl font-bold text-green-600">
                    {(data.averageConfidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="text-sm text-gray-600">Prediction confidence</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Key Metrics Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-white p-6 shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between">
              <CpuChipIcon className="h-8 w-8 text-blue-600" />
              <span className="text-3xl font-bold text-gray-900">
                {data.models.filter((m) => m.status === 'ready').length}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Ready Models</h3>
            <p className="text-sm text-gray-600">{data.models.length} total models</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl bg-white p-6 shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between">
              <RocketLaunchIcon className="h-8 w-8 text-green-600" />
              <span className="text-3xl font-bold text-gray-900">
                {data.customModels.filter((m) => m.status === 'training').length}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Training Models</h3>
            <p className="text-sm text-gray-600">{data.customModels.length} custom models</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl bg-white p-6 shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between">
              <ChartBarIcon className="h-8 w-8 text-purple-600" />
              <span className="text-3xl font-bold text-gray-900">{data.recentPredictions}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Predictions</h3>
            <p className="text-sm text-gray-600">Last 24 hours</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl bg-white p-6 shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between">
              <LightBulbIcon className="h-8 w-8 text-yellow-600" />
              <span className="text-3xl font-bold text-gray-900">
                {data.insights.filter((i) => i.confidence > 0.8).length}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">High-Confidence Insights</h3>
            <p className="text-sm text-gray-600">{data.insights.length} total insights</p>
          </motion.div>
        </div>

        {/* View Selector */}
        <div className="mb-6">
          <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
            {[
              { id: 'overview', name: 'Overview', icon: EyeIcon },
              { id: 'models', name: 'Models', icon: CpuChipIcon },
              { id: 'predictions', name: 'Predictions', icon: SparklesIcon },
              { id: 'training', name: 'Training', icon: RocketLaunchIcon },
              { id: 'insights', name: 'Insights', icon: LightBulbIcon },
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
                {/* Model Performance Chart */}
                <div className="rounded-xl bg-white p-6 shadow-lg">
                  <h3 className="mb-4 text-xl font-semibold">Model Performance Metrics</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={generateModelPerformanceData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="accuracy" fill={COLORS.primary} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* System Health Radar */}
                <div className="rounded-xl bg-white p-6 shadow-lg">
                  <h3 className="mb-4 text-xl font-semibold">System Health Overview</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={generateSystemHealthData()}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) =>
                          `${name}: ${value.toFixed(1)}${name.includes('Rate') ? '%' : ''}`
                        }
                      >
                        {generateSystemHealthData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {selectedView === 'models' && (
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="mb-4 text-xl font-semibold">AI Models</h3>
                <div className="space-y-4">
                  {data.models.map((model) => {
                    const IconComponent = MODEL_TYPE_ICONS[model.type] || CpuChipIcon
                    return (
                      <div
                        key={model.id}
                        className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
                      >
                        <div className="flex items-center">
                          <div className="mr-4 rounded-lg bg-indigo-100 p-2">
                            <IconComponent className="h-6 w-6 text-indigo-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{model.name}</h4>
                            <p className="text-sm text-gray-600">
                              {model.type} | v{model.version} | {model.performance.inferenceTime}ms
                              avg
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                              STATUS_COLORS[model.status as keyof typeof STATUS_COLORS]
                            }`}
                          >
                            {model.status.toUpperCase()}
                          </div>
                          <div className="mt-1 text-sm text-gray-600">
                            Accuracy: {(model.performance.accuracy * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {data.customModels.length > 0 && (
                    <>
                      <h4 className="mt-6 mb-3 text-lg font-semibold text-gray-900">
                        Custom Models
                      </h4>
                      {data.customModels.map((model) => (
                        <div
                          key={model.id}
                          className="flex items-center justify-between rounded-lg bg-purple-50 p-4"
                        >
                          <div className="flex items-center">
                            <div className="mr-4 rounded-lg bg-purple-100 p-2">
                              <BeakerIcon className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{model.name}</h4>
                              <p className="text-sm text-gray-600">
                                {model.architecture} | Training Progress:{' '}
                                {trainingProgress[model.id] || 0}%
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                                STATUS_COLORS[model.status as keyof typeof STATUS_COLORS]
                              }`}
                            >
                              {model.status.toUpperCase()}
                            </div>
                            <div className="mt-1 text-sm text-gray-600">
                              Accuracy: {(model.metrics.accuracy * 100).toFixed(1)}%
                            </div>
                            {trainingProgress[model.id] !== undefined && (
                              <div className="mt-2 h-2 w-24 rounded-full bg-gray-200">
                                <div
                                  className="h-2 rounded-full bg-purple-600 transition-all"
                                  style={{ width: `${trainingProgress[model.id]}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}

            {selectedView === 'predictions' && (
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="mb-4 text-xl font-semibold">Make Prediction</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Select Model
                    </label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full rounded-lg border px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Choose a model...</option>
                      {data.models
                        .filter((m) => m.status === 'ready')
                        .map((model) => (
                          <option key={model.id} value={model.id}>
                            {model.name} ({model.type})
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Input Data (JSON format)
                    </label>
                    <textarea
                      value={predictionInput}
                      onChange={(e) => setPredictionInput(e.target.value)}
                      className="w-full rounded-lg border px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                      rows={4}
                      placeholder='{"key": "value", "data": [1, 2, 3]}'
                    />
                  </div>
                  <button
                    onClick={handlePredict}
                    disabled={!selectedModel || !predictionInput.trim()}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Run Prediction
                  </button>

                  {predictionResult && (
                    <div className="mt-6 rounded-lg bg-green-50 p-4">
                      <h4 className="mb-3 font-semibold text-green-900">Prediction Result</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Prediction:</strong> {JSON.stringify(predictionResult.prediction)}
                        </div>
                        <div>
                          <strong>Confidence:</strong>{' '}
                          {(predictionResult.confidence * 100).toFixed(1)}%
                        </div>
                        <div>
                          <strong>Model Used:</strong> {predictionResult.modelUsed}
                        </div>
                        <div>
                          <strong>Processing Time:</strong> {predictionResult.processingTime}ms
                        </div>
                        {predictionResult.explanation && (
                          <div>
                            <strong>Explanation:</strong> {predictionResult.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedView === 'training' && (
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="mb-4 text-xl font-semibold">Model Training</h3>
                <div className="space-y-4">
                  <div className="rounded-lg bg-blue-50 p-4">
                    <h4 className="mb-2 font-semibold text-blue-900">Quick Train</h4>
                    <p className="mb-3 text-sm text-blue-800">
                      Start training a new custom model with default settings
                    </p>
                    <button
                      onClick={handleTrainModel}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                    >
                      <RocketLaunchIcon className="mr-2 inline h-4 w-4" />
                      Start Training
                    </button>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Training History</h4>
                    {data.customModels.map((model) => (
                      <div
                        key={model.id}
                        className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                      >
                        <div>
                          <div className="font-medium text-gray-900">{model.name}</div>
                          <div className="text-sm text-gray-600">{model.architecture}</div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`inline-flex rounded px-2 py-1 text-xs font-medium ${
                              STATUS_COLORS[model.status as keyof typeof STATUS_COLORS]
                            }`}
                          >
                            {model.status.toUpperCase()}
                          </div>
                          <div className="mt-1 text-sm text-gray-600">
                            Loss: {model.metrics.loss.toFixed(3)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedView === 'insights' && (
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="mb-4 text-xl font-semibold">AI-Generated Insights</h3>
                <div className="space-y-4">
                  {data.insights.map((insight, index) => (
                    <div
                      key={index}
                      className="rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-4"
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex items-center">
                          <LightBulbIcon className="mr-3 h-6 w-6 text-purple-600" />
                          <span
                            className={`inline-flex rounded px-2 py-1 text-xs font-medium ${
                              insight.type === 'performance'
                                ? 'bg-blue-100 text-blue-700'
                                : insight.type === 'accuracy'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {insight.type.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {(insight.confidence * 100).toFixed(0)}% confidence
                        </div>
                      </div>
                      <p className="mb-3 text-gray-800">{insight.insight}</p>
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">Recommendation: </span>
                        <span className="text-gray-700">{insight.recommendation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={handleOptimize}
                  className="w-full rounded-lg bg-purple-50 px-4 py-2 text-left text-sm text-purple-700 transition-colors hover:bg-purple-100"
                >
                  <BoltIcon className="mr-2 inline h-4 w-4" />
                  Optimize All Models
                </button>
                <button
                  onClick={handleTrainModel}
                  className="w-full rounded-lg bg-orange-50 px-4 py-2 text-left text-sm text-orange-700 transition-colors hover:bg-orange-100"
                >
                  <RocketLaunchIcon className="mr-2 inline h-4 w-4" />
                  Train New Model
                </button>
                <button
                  onClick={() =>
                    handleAIAction('analyze', {
                      type: 'trend_analysis',
                      data: [1, 2, 3, 4, 5],
                      parameters: { window: 30 },
                    })
                  }
                  className="w-full rounded-lg bg-blue-50 px-4 py-2 text-left text-sm text-blue-700 transition-colors hover:bg-blue-100"
                >
                  <ChartBarIcon className="mr-2 inline h-4 w-4" />
                  Run Analysis
                </button>
                <button
                  onClick={handleExport}
                  className="w-full rounded-lg bg-green-50 px-4 py-2 text-left text-sm text-green-700 transition-colors hover:bg-green-100"
                >
                  <DocumentArrowDownIcon className="mr-2 inline h-4 w-4" />
                  Export Analytics
                </button>
              </div>
            </div>

            {/* Model Status */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-lg font-semibold">Model Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Ready Models</span>
                  <div className="flex items-center">
                    <div className="mr-2 h-3 w-3 rounded-full bg-green-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {data.models.filter((m) => m.status === 'ready').length}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Training</span>
                  <div className="flex items-center">
                    <div className="mr-2 h-3 w-3 rounded-full bg-yellow-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {data.customModels.filter((m) => m.status === 'training').length}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Deployed</span>
                  <div className="flex items-center">
                    <div className="mr-2 h-3 w-3 rounded-full bg-purple-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {data.customModels.filter((m) => m.status === 'deployed').length}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Errors</span>
                  <div className="flex items-center">
                    <div className="mr-2 h-3 w-3 rounded-full bg-red-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {data.models.filter((m) => m.status === 'error').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time Stats */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-lg font-semibold">Real-time Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Auto Refresh</span>
                  <div
                    className={`h-3 w-3 rounded-full ${autoRefresh ? 'bg-green-400' : 'bg-gray-400'}`}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Refresh Interval</span>
                  <span className="text-sm font-medium text-gray-900">{refreshInterval}s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Predictions</span>
                  <span className="text-sm font-medium text-gray-900">
                    {data.recentPredictions.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
