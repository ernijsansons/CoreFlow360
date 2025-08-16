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
  ComputerDesktopIcon
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

const SOURCE_TYPE_ICONS: Record<string, React.ComponentType<any>> = {
  'SOCIAL_MEDIA': ChatBubbleLeftRightIcon,
  'NEWS_ARTICLE': NewspaperIcon,
  'JOB_POSTING': BriefcaseIcon,
  'FINANCIAL_REPORT': DocumentTextIcon,
  'REGULATORY_FILING': DocumentMagnifyingGlassIcon,
  'EMAIL': EnvelopeIcon,
  'CALL': PhoneIcon,
  'MEETING': BuildingOfficeIcon,
  'TECHNOLOGY_CHANGE': CpuChipIcon,
  'WEBSITE_BEHAVIOR': ComputerDesktopIcon
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
      console.error('Failed to load ingestion data:', error)
      toast.error('Failed to load ingestion data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-700 bg-green-100 border-green-300'
      case 'PAUSED': return 'text-yellow-700 bg-yellow-100 border-yellow-300'
      case 'ERROR': return 'text-red-700 bg-red-100 border-red-300'
      case 'INITIALIZING': return 'text-blue-700 bg-blue-100 border-blue-300'
      default: return 'text-gray-700 bg-gray-100 border-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircleIcon className="w-4 h-4 text-green-600" />
      case 'PAUSED': return <PauseIcon className="w-4 h-4 text-yellow-600" />
      case 'ERROR': return <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
      case 'INITIALIZING': return <ClockIcon className="w-4 h-4 text-blue-600" />
      default: return <ClockIcon className="w-4 h-4 text-gray-600" />
    }
  }

  const getSourceTypeIcon = (type: string) => {
    const IconComponent = SOURCE_TYPE_ICONS[type] || ServerIcon
    return <IconComponent className="w-5 h-5" />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading ingestion dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CloudArrowDownIcon className="w-10 h-10 text-purple-600 mr-4" />
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
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
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Source
              </button>
              <button
                onClick={loadDashboardData}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <BoltIcon className="w-4 h-4 mr-2 inline" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <ServerIcon className="w-8 h-8 text-blue-600" />
                <span className="text-3xl font-bold text-gray-900">
                  {statistics.totalSources}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Total Sources</h3>
              <p className="text-sm text-gray-600">{statistics.activeSources} active</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <CloudArrowDownIcon className="w-8 h-8 text-green-600" />
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
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <ChartBarIcon className="w-8 h-8 text-purple-600" />
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
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <ClockIcon className="w-8 h-8 text-orange-600" />
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
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { id: 'overview', name: 'Overview', icon: ChartBarIcon },
              { id: 'sources', name: 'Data Sources', icon: ServerIcon },
              { id: 'jobs', name: 'Ingestion Jobs', icon: GlobeAltIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedView(tab.id as any)}
                className={`flex items-center px-4 py-2 rounded-md transition-all ${
                  selectedView === tab.id
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {selectedView === 'overview' && (
              <div className="space-y-6">
                {/* Pipeline Status */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <SignalIcon className="w-6 h-6 mr-2 text-purple-600" />
                    Pipeline Status
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sources.slice(0, 6).map((source) => (
                      <div key={source.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            {getSourceTypeIcon(source.type)}
                            <h4 className="font-medium text-gray-900 ml-2">{source.name}</h4>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(source.status)}`}>
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
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Recent Ingestion Activity</h3>
                  <div className="space-y-3">
                    {jobs.slice(0, 8).map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-3 ${
                            job.status === 'COMPLETED' ? 'bg-green-500' :
                            job.status === 'FAILED' ? 'bg-red-500' :
                            job.status === 'PROCESSING' ? 'bg-blue-500' : 'bg-yellow-500'
                          }`} />
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
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Data Sources</h3>
                <div className="space-y-4">
                  {sources.map((source) => (
                    <motion.div
                      key={source.id}
                      whileHover={{ scale: 1.01 }}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          {getSourceTypeIcon(source.type)}
                          <div className="ml-3">
                            <h4 className="font-semibold text-gray-900">{source.name}</h4>
                            <p className="text-sm text-gray-600">{source.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center ${getStatusColor(source.status)}`}>
                            {getStatusIcon(source.status)}
                            <span className="ml-1">{source.status}</span>
                          </span>
                          <button className="text-gray-400 hover:text-gray-600">
                            <CogIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 block">Data Quality</span>
                          <p className="font-medium text-green-600">{source.dataQualityScore}%</p>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Success Rate</span>
                          <p className="font-medium">{source.successRate.toFixed(1)}%</p>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Total Ingested</span>
                          <p className="font-medium">{source.totalIngested.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Errors</span>
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
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Ingestion Jobs</h3>
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div key={job.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">Job {job.id}</h4>
                          <p className="text-sm text-gray-600">Source: {job.sourceId}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          job.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          job.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                          job.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {job.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 block">Problems Detected</span>
                          <p className="font-medium">{job.problemsDetected || 0}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Processing Time</span>
                          <p className="font-medium">{job.processingTime || 0}ms</p>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Created</span>
                          <p className="font-medium">{new Date(job.createdAt).toLocaleTimeString()}</p>
                        </div>
                      </div>

                      {job.error && (
                        <div className="mt-3 p-2 bg-red-50 rounded text-sm text-red-600">
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
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <CheckCircleIcon className="w-5 h-5 mr-2 text-green-600" />
                System Health
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pipeline Status</span>
                  <span className="text-sm font-medium text-green-600">Healthy</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Sources</span>
                  <span className="text-sm font-medium">{sources.filter(s => s.status === 'ACTIVE').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Error Rate</span>
                  <span className="text-sm font-medium text-green-600">&lt; 1%</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowAddSource(true)}
                  className="w-full px-4 py-2 text-left text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <PlusIcon className="w-4 h-4 mr-2 inline" />
                  Add Data Source
                </button>
                <button className="w-full px-4 py-2 text-left text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                  <CogIcon className="w-4 h-4 mr-2 inline" />
                  Configure Webhooks
                </button>
                <button className="w-full px-4 py-2 text-left text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                  <ChartBarIcon className="w-4 h-4 mr-2 inline" />
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