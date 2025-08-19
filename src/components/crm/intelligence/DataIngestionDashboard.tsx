'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CloudArrowDownIcon,
  ServerIcon,
  GlobeAltIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PlayIcon,
  PauseIcon,
  PlusIcon,
  TrashIcon,
  CogIcon,
  BoltIcon,
  SignalIcon,
  DocumentTextIcon,
  NewspaperIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  DocumentMagnifyingGlassIcon,
  CpuChipIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

interface DataSource {
  id: string
  name: string
  type: string
  status: 'ACTIVE' | 'PAUSED' | 'ERROR' | 'INITIALIZING'

  // Performance Metrics
  totalIngested: number
  successRate: number
  errorCount: number
  avgProcessingTime: number
  dataQualityScore: number

  // Timing
  lastIngestion: string | null
  nextIngestion: string | null

  // Configuration
  hasApiKey: boolean
  hasEndpoint: boolean
  hasWebhook: boolean
  pollInterval?: number
  configKeys: string[]
}

interface IngestionJob {
  id: string
  sourceId: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  createdAt: string
  processingTime?: number
  problemsDetected?: number
  error?: string
}

interface IngestionStatistics {
  totalSources: number
  activeSources: number
  totalIngested: number
  totalJobs: number
  completedJobs: number
  failedJobs: number
  avgProcessingTime: number
  avgSuccessRate: number
}

const SOURCE_TYPE_ICONS: Record<string, React.ComponentType<unknown>> = {
  SOCIAL_MEDIA: ChatBubbleLeftRightIcon,
  NEWS_ARTICLE: NewspaperIcon,
  JOB_POSTING: BriefcaseIcon,
  FINANCIAL_REPORT: DocumentTextIcon,
  REGULATORY_FILING: DocumentMagnifyingGlassIcon,
  EMAIL: EnvelopeIcon,
  CALL: PhoneIcon,
  MEETING: BuildingOfficeIcon,
  TECHNOLOGY_CHANGE: CpuChipIcon,
  WEBSITE_BEHAVIOR: ComputerDesktopIcon,
}

export default function DataIngestionDashboard() {
  const [sources, setSources] = useState<DataSource[]>([])
  const [jobs, setJobs] = useState<IngestionJob[]>([])
  const [statistics, setStatistics] = useState<IngestionStatistics | null>(null)
  const [selectedView, setSelectedView] = useState<'overview' | 'sources' | 'jobs'>('overview')
  const [loading, setLoading] = useState(true)
  const [showAddSource, setShowAddSource] = useState(false)

  useEffect(() => {
    loadDashboardData()

    // Refresh data every 30 seconds
    const interval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load sources
      const sourcesResponse = await fetch('/api/intelligence/ingestion/sources')
      const sourcesData = await sourcesResponse.json()

      if (sourcesData.success) {
        setSources(sourcesData.sources || [])
        setStatistics(sourcesData.statistics)
      }

      // Load recent jobs
      const webhookResponse = await fetch('/api/intelligence/ingestion/webhook?includeJobs=true')
      const webhookData = await webhookResponse.json()

      if (webhookData.success && webhookData.activeJobs) {
        setJobs(webhookData.activeJobs)
      }
    } catch (error) {
      toast.error('Failed to load ingestion data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-700 bg-green-100 border-green-300'
      case 'PAUSED':
        return 'text-yellow-700 bg-yellow-100 border-yellow-300'
      case 'ERROR':
        return 'text-red-700 bg-red-100 border-red-300'
      case 'INITIALIZING':
        return 'text-blue-700 bg-blue-100 border-blue-300'
      default:
        return 'text-gray-700 bg-gray-100 border-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />
      case 'PAUSED':
        return <PauseIcon className="h-4 w-4 text-yellow-600" />
      case 'ERROR':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
      case 'INITIALIZING':
        return <ClockIcon className="h-4 w-4 text-blue-600" />
      default:
        return <ClockIcon className="h-4 w-4 text-gray-600" />
    }
  }

  const getSourceTypeIcon = (type: string) => {
    const IconComponent = SOURCE_TYPE_ICONS[type] || ServerIcon
    return <IconComponent className="h-5 w-5" />
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600" />
          <p className="text-gray-600">Loading ingestion dashboard...</p>
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
              <CloudArrowDownIcon className="mr-4 h-10 w-10 text-purple-600" />
              <div>
                <h1 className="mb-2 text-4xl font-bold text-gray-900">
                  Data Ingestion Control Center
                </h1>
                <p className="text-lg text-gray-600">
                  Real-time data pipeline management and monitoring
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddSource(true)}
                className="flex items-center rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Source
              </button>
              <button
                onClick={loadDashboardData}
                className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
              >
                <BoltIcon className="mr-2 inline h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-white p-6 shadow-lg"
            >
              <div className="mb-4 flex items-center justify-between">
                <ServerIcon className="h-8 w-8 text-blue-600" />
                <span className="text-3xl font-bold text-gray-900">{statistics.totalSources}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Total Sources</h3>
              <p className="text-sm text-gray-600">{statistics.activeSources} active</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl bg-white p-6 shadow-lg"
            >
              <div className="mb-4 flex items-center justify-between">
                <CloudArrowDownIcon className="h-8 w-8 text-green-600" />
                <span className="text-3xl font-bold text-gray-900">
                  {statistics.totalIngested.toLocaleString()}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Data Points</h3>
              <p className="text-sm text-gray-600">Successfully ingested</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl bg-white p-6 shadow-lg"
            >
              <div className="mb-4 flex items-center justify-between">
                <ChartBarIcon className="h-8 w-8 text-purple-600" />
                <span className="text-3xl font-bold text-gray-900">
                  {statistics.avgSuccessRate.toFixed(1)}%
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Success Rate</h3>
              <p className="text-sm text-gray-600">Average across all sources</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl bg-white p-6 shadow-lg"
            >
              <div className="mb-4 flex items-center justify-between">
                <ClockIcon className="h-8 w-8 text-orange-600" />
                <span className="text-3xl font-bold text-gray-900">
                  {statistics.avgProcessingTime.toFixed(0)}ms
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Avg Processing</h3>
              <p className="text-sm text-gray-600">Time per data point</p>
            </motion.div>
          </div>
        )}

        {/* View Selector */}
        <div className="mb-6">
          <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
            {[
              { id: 'overview', name: 'Overview', icon: ChartBarIcon },
              { id: 'sources', name: 'Data Sources', icon: ServerIcon },
              { id: 'jobs', name: 'Ingestion Jobs', icon: GlobeAltIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedView(tab.id as unknown)}
                className={`flex items-center rounded-md px-4 py-2 transition-all ${
                  selectedView === tab.id
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="mr-2 h-4 w-4" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {selectedView === 'overview' && (
              <div className="space-y-6">
                {/* Pipeline Status */}
                <div className="rounded-xl bg-white p-6 shadow-lg">
                  <h3 className="mb-4 flex items-center text-xl font-semibold">
                    <SignalIcon className="mr-2 h-6 w-6 text-purple-600" />
                    Pipeline Status
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {sources.slice(0, 6).map((source) => (
                      <div key={source.id} className="rounded-lg border border-gray-200 p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center">
                            {getSourceTypeIcon(source.type)}
                            <h4 className="ml-2 font-medium text-gray-900">{source.name}</h4>
                          </div>
                          <span
                            className={`rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor(source.status)}`}
                          >
                            {source.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>
                            <span className="block">Success Rate</span>
                            <span className="font-medium">{source.successRate.toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="block">Ingested</span>
                            <span className="font-medium">{source.totalIngested}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="rounded-xl bg-white p-6 shadow-lg">
                  <h3 className="mb-4 text-xl font-semibold">Recent Ingestion Activity</h3>
                  <div className="space-y-3">
                    {jobs.slice(0, 8).map((job) => (
                      <div
                        key={job.id}
                        className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                      >
                        <div className="flex items-center">
                          <div
                            className={`mr-3 h-2 w-2 rounded-full ${
                              job.status === 'COMPLETED'
                                ? 'bg-green-500'
                                : job.status === 'FAILED'
                                  ? 'bg-red-500'
                                  : job.status === 'PROCESSING'
                                    ? 'bg-blue-500'
                                    : 'bg-yellow-500'
                            }`}
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Job {job.id.split('_')[1]}
                            </p>
                            <p className="text-xs text-gray-600">
                              {job.status} • {job.problemsDetected || 0} problems detected
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {new Date(job.createdAt).toLocaleTimeString()}
                          </p>
                          {job.processingTime && (
                            <p className="text-xs text-gray-500">{job.processingTime}ms</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedView === 'sources' && (
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="mb-4 text-xl font-semibold">Data Sources</h3>
                <div className="space-y-4">
                  {sources.map((source) => (
                    <motion.div
                      key={source.id}
                      whileHover={{ scale: 1.01 }}
                      className="rounded-lg border border-gray-200 p-4"
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex items-center">
                          {getSourceTypeIcon(source.type)}
                          <div className="ml-3">
                            <h4 className="font-semibold text-gray-900">{source.name}</h4>
                            <p className="text-sm text-gray-600">{source.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex items-center rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor(source.status)}`}
                          >
                            {getStatusIcon(source.status)}
                            <span className="ml-1">{source.status}</span>
                          </span>
                          <button className="text-gray-400 hover:text-gray-600">
                            <CogIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="block text-gray-500">Data Quality</span>
                          <p className="font-medium text-green-600">{source.dataQualityScore}%</p>
                        </div>
                        <div>
                          <span className="block text-gray-500">Success Rate</span>
                          <p className="font-medium">{source.successRate.toFixed(1)}%</p>
                        </div>
                        <div>
                          <span className="block text-gray-500">Total Ingested</span>
                          <p className="font-medium">{source.totalIngested.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="block text-gray-500">Errors</span>
                          <p className="font-medium text-red-600">{source.errorCount}</p>
                        </div>
                      </div>

                      {source.lastIngestion && (
                        <div className="mt-3 text-xs text-gray-500">
                          Last ingestion: {new Date(source.lastIngestion).toLocaleString()}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {selectedView === 'jobs' && (
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="mb-4 text-xl font-semibold">Ingestion Jobs</h3>
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div key={job.id} className="rounded-lg border border-gray-200 p-4">
                      <div className="mb-3 flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Job {job.id}</h4>
                          <p className="text-sm text-gray-600">Source: {job.sourceId}</p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            job.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-700'
                              : job.status === 'FAILED'
                                ? 'bg-red-100 text-red-700'
                                : job.status === 'PROCESSING'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {job.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="block text-gray-500">Problems Detected</span>
                          <p className="font-medium">{job.problemsDetected || 0}</p>
                        </div>
                        <div>
                          <span className="block text-gray-500">Processing Time</span>
                          <p className="font-medium">{job.processingTime || 0}ms</p>
                        </div>
                        <div>
                          <span className="block text-gray-500">Created</span>
                          <p className="font-medium">
                            {new Date(job.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>

                      {job.error && (
                        <div className="mt-3 rounded bg-red-50 p-2 text-sm text-red-600">
                          Error: {job.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* System Health */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h3 className="mb-4 flex items-center text-lg font-semibold">
                <CheckCircleIcon className="mr-2 h-5 w-5 text-green-600" />
                System Health
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pipeline Status</span>
                  <span className="text-sm font-medium text-green-600">Healthy</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Sources</span>
                  <span className="text-sm font-medium">
                    {sources.filter((s) => s.status === 'ACTIVE').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Error Rate</span>
                  <span className="text-sm font-medium text-green-600">&lt; 1%</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowAddSource(true)}
                  className="w-full rounded-lg bg-purple-50 px-4 py-2 text-left text-sm text-purple-700 transition-colors hover:bg-purple-100"
                >
                  <PlusIcon className="mr-2 inline h-4 w-4" />
                  Add Data Source
                </button>
                <button className="w-full rounded-lg bg-blue-50 px-4 py-2 text-left text-sm text-blue-700 transition-colors hover:bg-blue-100">
                  <CogIcon className="mr-2 inline h-4 w-4" />
                  Configure Webhooks
                </button>
                <button className="w-full rounded-lg bg-green-50 px-4 py-2 text-left text-sm text-green-700 transition-colors hover:bg-green-100">
                  <ChartBarIcon className="mr-2 inline h-4 w-4" />
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
