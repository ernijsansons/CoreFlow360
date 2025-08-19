/**
 * CoreFlow360 - ML Pipeline Dashboard
 * Dashboard for managing machine learning model retraining pipeline
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Cpu,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Play,
  Pause,
  Settings,
  Eye,
  BarChart3,
  Zap,
  Target,
  Database,
  Cog,
  AlertCircle,
} from 'lucide-react'
import useMLPipeline from '@/hooks/useMLPipeline'
import { formatDistanceToNow } from 'date-fns'

export default function MLPipelineDashboard() {
  const {
    isLoading,
    error,
    metrics,
    models,
    selectedModel,
    recentJobs,
    selectedJob,
    startRetraining,
    checkDataDrift,
    monitorPerformance,
    selectModel,
    selectJob,
    refreshData,
  } = useMLPipeline()

  const [isStartingJob, setIsStartingJob] = useState<string | null>(null)
  const [isDriftChecking, setIsDriftChecking] = useState<string | null>(null)

  const handleStartRetraining = async (modelId: string, optimize: boolean = false) => {
    try {
      setIsStartingJob(modelId)
      const jobId = await startRetraining(modelId, optimize)
    } catch (error) {
    } finally {
      setIsStartingJob(null)
    }
  }

  const handleCheckDrift = async (modelId: string) => {
    try {
      setIsDriftChecking(modelId)
      const hasDrift = await checkDataDrift(modelId)
    } catch (error) {
    } finally {
      setIsDriftChecking(null)
    }
  }

  const getModelTypeColor = (type: string) => {
    switch (type) {
      case 'classification':
        return 'text-blue-400 bg-blue-400/10'
      case 'regression':
        return 'text-green-400 bg-green-400/10'
      case 'forecasting':
        return 'text-purple-400 bg-purple-400/10'
      case 'clustering':
        return 'text-orange-400 bg-orange-400/10'
      case 'anomaly_detection':
        return 'text-red-400 bg-red-400/10'
      default:
        return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getJobStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-400/10'
      case 'running':
        return 'text-blue-400 bg-blue-400/10'
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10'
      case 'failed':
        return 'text-red-400 bg-red-400/10'
      case 'cancelled':
        return 'text-gray-400 bg-gray-400/10'
      default:
        return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getJobStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle
      case 'running':
        return RefreshCw
      case 'pending':
        return Clock
      case 'failed':
        return AlertTriangle
      case 'cancelled':
        return Pause
      default:
        return Activity
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="mx-auto mb-4 h-12 w-12"
          >
            <Brain className="h-full w-full text-violet-400" />
          </motion.div>
          <div className="text-lg text-gray-400">Initializing ML Pipeline...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 flex items-center text-3xl font-bold text-white">
            <Brain className="mr-3 h-8 w-8 text-violet-400" />
            ML Pipeline Dashboard
          </h1>
          <p className="text-gray-400">
            Automated machine learning model retraining and optimization
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={refreshData}
            className="flex items-center space-x-2 rounded-lg border border-gray-700/50 bg-gray-800/50 px-4 py-2 text-gray-300 transition-colors hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-4">
          <div className="flex items-center space-x-2 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Pipeline Error</span>
          </div>
          <p className="mt-1 text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Pipeline Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {[
            {
              label: 'Models',
              value: metrics.models,
              icon: Database,
              color: 'text-blue-400',
            },
            {
              label: 'Active Jobs',
              value: metrics.activeJobs,
              icon: Activity,
              color: 'text-green-400',
            },
            {
              label: 'Completed',
              value: metrics.completedJobs,
              icon: CheckCircle,
              color: 'text-purple-400',
            },
            {
              label: 'Failed',
              value: metrics.failedJobs,
              icon: AlertCircle,
              color: 'text-red-400',
            },
            {
              label: 'Avg Improvement',
              value: `${metrics.avgImprovement.toFixed(1)}%`,
              icon: TrendingUp,
              color: 'text-orange-400',
            },
          ].map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-lg border border-gray-700/50 bg-gray-800/40 p-4 backdrop-blur-sm"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-gray-400">{metric.label}</span>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </div>
              <div className="text-xl font-bold text-white">{metric.value}</div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-3">
        {/* Models List */}
        <div className="xl:col-span-2">
          <div className="rounded-xl border border-gray-700/50 bg-gray-800/40 p-6 backdrop-blur-sm">
            <h3 className="mb-6 text-lg font-semibold text-white">
              Registered Models ({models.length})
            </h3>

            <div className="space-y-4">
              {models.map((model, index) => (
                <motion.div
                  key={model.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`cursor-pointer rounded-lg border p-4 transition-all ${
                    selectedModel?.id === model.id
                      ? 'border-violet-500/50 bg-violet-500/10'
                      : 'border-gray-700/50 bg-gray-700/20 hover:border-gray-600/50'
                  }`}
                  onClick={() => selectModel(model.id)}
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h4 className="mb-1 font-medium text-white">{model.name}</h4>
                      <div className="mb-2 flex items-center space-x-2">
                        <span
                          className={`rounded px-2 py-1 text-xs font-medium ${getModelTypeColor(model.type)}`}
                        >
                          {model.type}
                        </span>
                        <span className="text-xs text-gray-400">v{model.version}</span>
                        <span className="text-xs text-gray-400">{model.algorithm}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStartRetraining(model.id, false)
                        }}
                        disabled={isStartingJob === model.id}
                        className="p-1 text-blue-400 transition-colors hover:text-blue-300 disabled:opacity-50"
                        title="Start Retraining"
                      >
                        {isStartingJob === model.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStartRetraining(model.id, true)
                        }}
                        disabled={isStartingJob === model.id}
                        className="p-1 text-green-400 transition-colors hover:text-green-300 disabled:opacity-50"
                        title="Start Optimized Retraining"
                      >
                        <Zap className="h-4 w-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCheckDrift(model.id)
                        }}
                        disabled={isDriftChecking === model.id}
                        className="p-1 text-yellow-400 transition-colors hover:text-yellow-300 disabled:opacity-50"
                        title="Check Data Drift"
                      >
                        {isDriftChecking === model.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Target className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Features:</span>
                      <div className="text-white">{model.features.length}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Threshold:</span>
                      <div className="text-white">
                        {(model.performance_threshold * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Frequency:</span>
                      <div className="text-white">{model.retrain_frequency}</div>
                    </div>
                  </div>

                  {selectedModel?.id === model.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 border-t border-gray-700/50 pt-4"
                    >
                      <div className="space-y-3">
                        <div>
                          <h5 className="mb-2 font-medium text-white">Features</h5>
                          <div className="flex flex-wrap gap-1">
                            {model.features.map((feature) => (
                              <span
                                key={feature}
                                className="rounded bg-gray-600/30 px-2 py-1 text-xs text-gray-300"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h5 className="mb-2 font-medium text-white">Hyperparameters</h5>
                          <div className="max-h-32 overflow-y-auto rounded bg-gray-900/50 p-2 font-mono text-xs text-gray-300">
                            {JSON.stringify(model.hyperparameters, null, 2)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}

              {models.length === 0 && (
                <div className="py-8 text-center">
                  <Database className="mx-auto mb-4 h-12 w-12 text-gray-600" />
                  <div className="mb-2 text-lg text-gray-400">No models registered</div>
                  <div className="text-sm text-gray-500">
                    Register ML models to start automated retraining
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-700/50 bg-gray-800/40 p-6 backdrop-blur-sm">
            <h3 className="mb-6 text-lg font-semibold text-white">Recent Training Jobs</h3>

            <div className="max-h-96 space-y-3 overflow-y-auto">
              {recentJobs.slice(0, 10).map((job, index) => {
                const StatusIcon = getJobStatusIcon(job.status)
                return (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`cursor-pointer rounded-lg border p-3 transition-all ${
                      selectedJob?.id === job.id
                        ? 'border-violet-500/50 bg-violet-500/10'
                        : 'border-gray-700/50 bg-gray-700/20 hover:border-gray-600/50'
                    }`}
                    onClick={() => selectJob(job.id)}
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <StatusIcon
                          className={`h-4 w-4 ${job.status === 'running' ? 'animate-spin' : ''}`}
                        />
                        <span className="text-sm font-medium text-white">{job.modelId}</span>
                      </div>
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${getJobStatusColor(job.status)}`}
                      >
                        {job.status}
                      </span>
                    </div>

                    <div className="mb-2 text-xs text-gray-400">
                      Started {formatDistanceToNow(job.started_at, { addSuffix: true })}
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Trigger: {job.trigger}</span>
                      {job.improvement_achieved !== 0 && (
                        <span
                          className={`font-medium ${
                            job.improvement_achieved > 0 ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {job.improvement_achieved > 0 ? '+' : ''}
                          {job.improvement_achieved.toFixed(1)}%
                        </span>
                      )}
                    </div>

                    {selectedJob?.id === job.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 border-t border-gray-700/50 pt-3"
                      >
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Data Points:</span>
                            <span className="text-white">
                              {job.data_points_used.toLocaleString()}
                            </span>
                          </div>

                          {job.completed_at && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">Duration:</span>
                              <span className="text-white">
                                {Math.round(
                                  (job.completed_at.getTime() - job.started_at.getTime()) / 1000
                                )}
                                s
                              </span>
                            </div>
                          )}

                          {job.error_message && (
                            <div className="text-xs text-red-400">Error: {job.error_message}</div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )
              })}

              {recentJobs.length === 0 && (
                <div className="py-8 text-center">
                  <Activity className="mx-auto mb-2 h-8 w-8 text-gray-600" />
                  <div className="text-sm text-gray-500">No training jobs yet</div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border border-gray-700/50 bg-gray-800/40 p-6 backdrop-blur-sm">
            <h3 className="mb-4 text-lg font-semibold text-white">Quick Actions</h3>

            <div className="space-y-3">
              <button
                onClick={() => {
                  // Trigger retraining for all models
                  models.forEach((model) => handleStartRetraining(model.id, false))
                }}
                className="w-full rounded-lg border border-blue-500/30 bg-blue-600/20 p-3 text-blue-400 transition-colors hover:bg-blue-600/30"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Play className="h-4 w-4" />
                  <span>Retrain All Models</span>
                </div>
              </button>

              <button
                onClick={() => {
                  // Check drift for all models
                  models.forEach((model) => handleCheckDrift(model.id))
                }}
                className="w-full rounded-lg border border-yellow-500/30 bg-yellow-600/20 p-3 text-yellow-400 transition-colors hover:bg-yellow-600/30"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Target className="h-4 w-4" />
                  <span>Check All Drift</span>
                </div>
              </button>

              <button
                onClick={() => {
                  // Monitor performance for all models
                  models.forEach((model) => monitorPerformance(model.id))
                }}
                className="w-full rounded-lg border border-green-500/30 bg-green-600/20 p-3 text-green-400 transition-colors hover:bg-green-600/30"
              >
                <div className="flex items-center justify-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Monitor Performance</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
