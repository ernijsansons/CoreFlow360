/**
 * CoreFlow360 - ML Pipeline Management Hook
 * React hook for managing machine learning model retraining pipeline
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ModelRetrainingPipeline,
  type ModelConfig,
  type RetrainingJob,
} from '@/lib/ml/model-retraining-pipeline'

interface PipelineMetrics {
  models: number
  activeJobs: number
  completedJobs: number
  failedJobs: number
  avgImprovement: number
  lastUpdate: Date
}

interface UseMLPipelineReturn {
  // Pipeline state
  pipeline: ModelRetrainingPipeline | null
  isLoading: boolean
  error: string | null
  metrics: PipelineMetrics | null

  // Models
  models: ModelConfig[]
  selectedModel: ModelConfig | null

  // Jobs
  recentJobs: RetrainingJob[]
  selectedJob: RetrainingJob | null

  // Actions
  registerModel: (config: ModelConfig) => Promise<void>
  startRetraining: (modelId: string, optimize?: boolean) => Promise<string>
  checkDataDrift: (modelId: string) => Promise<boolean>
  monitorPerformance: (modelId: string) => Promise<void>
  selectModel: (modelId: string | null) => void
  selectJob: (jobId: string | null) => void
  refreshData: () => Promise<void>
}

export function useMLPipeline(): UseMLPipelineReturn {
  // State
  const [pipeline, setPipeline] = useState<ModelRetrainingPipeline | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<PipelineMetrics | null>(null)
  const [models, setModels] = useState<ModelConfig[]>([])
  const [selectedModel, setSelectedModel] = useState<ModelConfig | null>(null)
  const [recentJobs, setRecentJobs] = useState<RetrainingJob[]>([])
  const [selectedJob, setSelectedJob] = useState<RetrainingJob | null>(null)

  // Initialize pipeline
  useEffect(() => {
    initializePipeline()
  }, [])

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (!pipeline) return

    const interval = setInterval(() => {
      refreshData()
    }, 30000)

    return () => clearInterval(interval)
  }, [pipeline])

  const initializePipeline = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Initialize the ML pipeline
      const pipelineInstance = new ModelRetrainingPipeline()
      setPipeline(pipelineInstance)

      // Load initial data
      await loadPipelineData(pipelineInstance)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize ML pipeline')
    } finally {
      setIsLoading(false)
    }
  }

  const loadPipelineData = async (pipelineInstance: ModelRetrainingPipeline) => {
    try {
      // Get pipeline metrics
      const pipelineMetrics = pipelineInstance.getPipelineStatus()
      setMetrics({
        ...pipelineMetrics,
        lastUpdate: new Date(),
      })

      // Get all models
      const allModels = pipelineInstance.getAllModels()
      setModels(allModels)

      // Get recent jobs
      const jobs = pipelineInstance.getRecentJobs(20)
      setRecentJobs(jobs)

      // Update selected model if it exists
      if (selectedModel) {
        const updatedModel = pipelineInstance.getModelConfig(selectedModel.id)
        setSelectedModel(updatedModel || null)
      }

      // Update selected job if it exists
      if (selectedJob) {
        const updatedJob = pipelineInstance.getTrainingJob(selectedJob.id)
        setSelectedJob(updatedJob || null)
      }
    } catch (err) {
      setError('Failed to load pipeline data')
    }
  }

  const registerModel = useCallback(
    async (config: ModelConfig) => {
      if (!pipeline) {
        throw new Error('Pipeline not initialized')
      }

      try {
        pipeline.registerModel(config)
        await refreshData()
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Failed to register model'
        setError(error)
        throw new Error(error)
      }
    },
    [pipeline]
  )

  const startRetraining = useCallback(
    async (modelId: string, optimize: boolean = false): Promise<string> => {
      if (!pipeline) {
        throw new Error('Pipeline not initialized')
      }

      try {
        const jobId = await pipeline.startRetraining(modelId, 'manual', optimize)
        await refreshData()
        return jobId
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Failed to start retraining'
        setError(error)
        throw new Error(error)
      }
    },
    [pipeline]
  )

  const checkDataDrift = useCallback(
    async (modelId: string): Promise<boolean> => {
      if (!pipeline) {
        throw new Error('Pipeline not initialized')
      }

      try {
        const hasDrift = await pipeline.checkDataDrift(modelId)
        await refreshData()
        return hasDrift
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Failed to check data drift'
        setError(error)
        throw new Error(error)
      }
    },
    [pipeline]
  )

  const monitorPerformance = useCallback(
    async (modelId: string) => {
      if (!pipeline) {
        throw new Error('Pipeline not initialized')
      }

      try {
        await pipeline.monitorPerformance(modelId)
        await refreshData()
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Failed to monitor performance'
        setError(error)
        throw new Error(error)
      }
    },
    [pipeline]
  )

  const selectModel = useCallback(
    (modelId: string | null) => {
      if (!pipeline || !modelId) {
        setSelectedModel(null)
        return
      }

      const model = pipeline.getModelConfig(modelId)
      setSelectedModel(model || null)
    },
    [pipeline]
  )

  const selectJob = useCallback(
    (jobId: string | null) => {
      if (!pipeline || !jobId) {
        setSelectedJob(null)
        return
      }

      const job = pipeline.getTrainingJob(jobId)
      setSelectedJob(job || null)
    },
    [pipeline]
  )

  const refreshData = useCallback(async () => {
    if (!pipeline) return

    try {
      await loadPipelineData(pipeline)
      setError(null)
    } catch (err) {}
  }, [pipeline, selectedModel, selectedJob])

  return {
    // Pipeline state
    pipeline,
    isLoading,
    error,
    metrics,

    // Models
    models,
    selectedModel,

    // Jobs
    recentJobs,
    selectedJob,

    // Actions
    registerModel,
    startRetraining,
    checkDataDrift,
    monitorPerformance,
    selectModel,
    selectJob,
    refreshData,
  }
}

export default useMLPipeline
