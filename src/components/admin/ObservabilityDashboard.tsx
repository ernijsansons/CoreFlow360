'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  EyeIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  MapIcon,
  CpuChipIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  FireIcon,
  BoltIcon,
  DocumentArrowDownIcon,
  BeakerIcon,
  LightBulbIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon
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
  Scatter
} from 'recharts'
import { toast } from 'react-hot-toast'

interface ObservabilityData {
  dashboard: {
    metrics: Array<{
      id: string
      timestamp: Date
      name: string
      value: number
      unit: string
      source: string
      tags: Record<string, string>
    }>
    logs: Array<{
      id: string
      timestamp: Date
      level: 'debug' | 'info' | 'warn' | 'error'
      message: string
      service: string
      source: string
      metadata: Record<string, any>
    }>
    traces: Array<{
      id: string
      traceId: string
      operation: string
      service: string
      startTime: Date
      duration?: number
      status: 'success' | 'error' | 'timeout'
      tags: Record<string, string>
    }>
    alerts: Array<{
      id: string
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
      status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED'
      title: string
      description: string
      timestamp: Date
      source: string
    }>
    businessMetrics?: Array<{
      category: string
      name: string
      value: number
      timestamp: Date
    }>
    predictions?: Array<{
      type: string
      confidence: number
      prediction: string
      timeframe: string
    }>
  }
  systemHealth: {
    overall: string
    services: Record<string, {
      status: string
      errorRate: number
      avgResponseTime: number
      requestCount: number
    }>
    recommendations: string[]
  }
  metrics?: {
    summary: any
    recent: any[]
    trends: any
  }
  logs?: {
    summary: any
    recent: any[]
    levelDistribution: any[]
  }
  traces?: {
    summary: any
    recent: any[]
    performance: any
  }
  alerts?: {
    summary: any
    recent: any[]
    trends: any
  }
  businessInsights?: {
    kpis: any[]
    trends: any
    predictions: any[]
  }
}

const COLORS = {
  primary: '#6366f1',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  debug: '#8b5cf6',
  critical: '#dc2626'
}

const STATUS_COLORS = {
  'EXCELLENT': 'text-green-600 bg-green-100',
  'GOOD': 'text-blue-600 bg-blue-100',
  'WARNING': 'text-yellow-600 bg-yellow-100',
  'CRITICAL': 'text-red-600 bg-red-100',
  'HEALTHY': 'text-green-600 bg-green-100',
  'UNHEALTHY': 'text-red-600 bg-red-100',
  'OPEN': 'text-red-600 bg-red-100',
  'ACKNOWLEDGED': 'text-yellow-600 bg-yellow-100',
  'RESOLVED': 'text-green-600 bg-green-100'
}

const LOG_LEVEL_COLORS = {
  debug: 'text-purple-600 bg-purple-100',
  info: 'text-blue-600 bg-blue-100',
  warn: 'text-yellow-600 bg-yellow-100',
  error: 'text-red-600 bg-red-100'
}

export default function ObservabilityDashboard() {
  const [data, setData] = useState<ObservabilityData | null>(null)
  const [selectedView, setSelectedView] = useState<'overview' | 'metrics' | 'logs' | 'traces' | 'alerts' | 'business'>('overview')
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30) // seconds
  const [selectedService, setSelectedService] = useState<string>('')
  const [logLevel, setLogLevel] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadObservabilityData()
    
    // Auto-refresh setup
    let interval: NodeJS.Timer | null = null
    if (autoRefresh) {
      interval = setInterval(loadObservabilityData, refreshInterval * 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval, selectedService, logLevel])

  const loadObservabilityData = async () => {
    try {
      const params = new URLSearchParams({
        includeTraces: 'true',
        includeMetrics: 'true',
        includeLogs: 'true',
        includeAlerts: 'true'
      })
      
      if (selectedService) params.set('service', selectedService)
      if (logLevel) params.set('logLevel', logLevel)

      const response = await fetch(`/api/observability/analytics?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setData(result)
      } else {
        throw new Error(result.error || 'Failed to load data')
      }
      
    } catch (error) {
      console.error('Failed to load observability data:', error)
      toast.error('Failed to load observability data')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: string, actionData?: any) => {
    try {
      const response = await fetch('/api/observability/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          data: actionData
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success(`Action "${action}" completed successfully`)
        if (action !== 'export') {
          await loadObservabilityData() // Refresh data
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

  const handleExport = async () => {
    try {
      const result = await handleAction('export', { format: 'json' })
      
      const blob = new Blob([JSON.stringify(result.result.data, null, 2)], {
        type: 'application/json'
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `observability-data-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      
    } catch (error) {
      // Error already handled in handleAction
    }
  }

  const handleGenerateInsights = async () => {
    try {
      const result = await handleAction('analyze')
      
      // Show insights in a toast or modal
      const insights = result.result.insights.slice(0, 3)
      insights.forEach((insight: any, index: number) => {
        setTimeout(() => {
          toast.success(`Insight: ${insight.insight}`, { duration: 5000 })
        }, index * 1000)
      })
      
    } catch (error) {
      // Error already handled
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'EXCELLENT':
      case 'HEALTHY':
      case 'RESOLVED':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />
      case 'GOOD':
        return <CheckCircleIcon className="w-5 h-5 text-blue-600" />
      case 'WARNING':
      case 'ACKNOWLEDGED':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
      case 'CRITICAL':
      case 'UNHEALTHY':
      case 'OPEN':
        return <XCircleIcon className="w-5 h-5 text-red-600" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-600" />
    }
  }

  const getHealthColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'EXCELLENT':
      case 'HEALTHY':
        return 'text-green-600'
      case 'GOOD':
        return 'text-blue-600'
      case 'WARNING':
        return 'text-yellow-600'
      case 'CRITICAL':
      case 'UNHEALTHY':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const filteredLogs = data?.logs?.recent?.filter(log => 
    (!searchQuery || log.message.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (!selectedService || log.service === selectedService)
  ) || []

  const filteredTraces = data?.traces?.recent?.filter(trace => 
    (!searchQuery || trace.operation.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (!selectedService || trace.service === selectedService)
  ) || []

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading observability dashboard...</p>
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
              <EyeIcon className="w-10 h-10 text-indigo-600 mr-4" />
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Observability Command Center
                </h1>
                <p className="text-lg text-gray-600">
                  Real-time system monitoring, logging, and intelligence
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`p-2 rounded-lg transition-colors ${
                    autoRefresh 
                      ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {autoRefresh ? <PlayIcon className="w-4 h-4" /> : <PauseIcon className="w-4 h-4" />}
                </button>
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                  className="ml-2 px-3 py-1 border rounded-md text-sm"
                  disabled={!autoRefresh}
                >
                  <option value="10">10s</option>
                  <option value="30">30s</option>
                  <option value="60">1m</option>
                  <option value="300">5m</option>
                </select>
              </div>
              <button
                onClick={handleGenerateInsights}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <LightBulbIcon className="w-4 h-4 mr-2" />
                AI Insights
              </button>
              <button
                onClick={() => loadObservabilityData()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
              >
                <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
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
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-3 bg-indigo-100 rounded-lg mr-4">
                  <CpuChipIcon className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">System Health</h3>
                  <p className="text-gray-600">Overall system status and health metrics</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${getHealthColor(data.systemHealth.overall)}`}>
                  {data.systemHealth.overall}
                </div>
                <div className="flex items-center justify-end">
                  {getStatusIcon(data.systemHealth.overall)}
                  <span className="ml-2 text-gray-600">
                    {Object.keys(data.systemHealth.services).length} services monitored
                  </span>
                </div>
              </div>
            </div>
            
            {/* Service Health Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
              {Object.entries(data.systemHealth.services).map(([service, health]) => (
                <div key={service} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 truncate">{service}</span>
                    {getStatusIcon(health.status)}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Error Rate: {health.errorRate.toFixed(1)}%</div>
                    <div>Avg Response: {health.avgResponseTime.toFixed(0)}ms</div>
                    <div>Requests: {health.requestCount}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <ChartBarIcon className="w-8 h-8 text-blue-600" />
              <span className="text-3xl font-bold text-gray-900">
                {data.metrics?.summary?.totalMetrics || 0}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Total Metrics</h3>
            <p className="text-sm text-gray-600">
              {data.metrics?.summary?.activeServices || 0} active services
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <DocumentTextIcon className="w-8 h-8 text-green-600" />
              <span className="text-3xl font-bold text-gray-900">
                {data.logs?.summary?.totalLogs || 0}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Log Entries</h3>
            <p className="text-sm text-gray-600">
              Error rate: {data.logs?.summary?.errorRate?.toFixed(1) || 0}%
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <MapIcon className="w-8 h-8 text-purple-600" />
              <span className="text-3xl font-bold text-gray-900">
                {data.traces?.summary?.totalTraces || 0}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Active Traces</h3>
            <p className="text-sm text-gray-600">
              Avg: {data.traces?.summary?.avgDuration?.toFixed(0) || 0}ms
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
              <span className="text-3xl font-bold text-gray-900">
                {data.alerts?.summary?.open || 0}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Open Alerts</h3>
            <p className="text-sm text-gray-600">
              {data.alerts?.summary?.critical || 0} critical
            </p>
          </motion.div>
        </div>

        {/* View Selector */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { id: 'overview', name: 'Overview', icon: EyeIcon },
              { id: 'metrics', name: 'Metrics', icon: ChartBarIcon },
              { id: 'logs', name: 'Logs', icon: DocumentTextIcon },
              { id: 'traces', name: 'Traces', icon: MapIcon },
              { id: 'alerts', name: 'Alerts', icon: ExclamationTriangleIcon },
              { id: 'business', name: 'Business', icon: LightBulbIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedView(tab.id as any)}
                className={`flex items-center px-4 py-2 rounded-md transition-all ${
                  selectedView === tab.id
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        {(selectedView === 'logs' || selectedView === 'traces') && (
          <div className="mb-6 bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={`Search ${selectedView}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Services</option>
                {Object.keys(data.systemHealth.services).map(service => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
              {selectedView === 'logs' && (
                <select
                  value={logLevel}
                  onChange={(e) => setLogLevel(e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Levels</option>
                  <option value="error">Error</option>
                  <option value="warn">Warning</option>
                  <option value="info">Info</option>
                  <option value="debug">Debug</option>
                </select>
              )}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {selectedView === 'overview' && (
              <>
                {/* System Trends */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">System Trends</h3>
                  {data.metrics?.trends && (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={data.metrics.trends.hourly}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="count" 
                          stroke={COLORS.primary}
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Log Level Distribution */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Log Level Distribution</h3>
                  {data.logs?.levelDistribution && (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={data.logs.levelDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="count"
                          label={({ level, percentage }) => `${level}: ${percentage.toFixed(1)}%`}
                        >
                          {data.logs.levelDistribution.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.level as keyof typeof COLORS] || COLORS.info} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </>
            )}

            {selectedView === 'metrics' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Recent Metrics</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {data.metrics?.recent?.map((metric: any) => (
                    <div key={metric.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{metric.name}</div>
                        <div className="text-sm text-gray-600">
                          Source: {metric.source} | {new Date(metric.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          {metric.value} {metric.unit}
                        </div>
                        {metric.tags && Object.keys(metric.tags).length > 0 && (
                          <div className="text-xs text-gray-500">
                            {Object.entries(metric.tags).map(([key, value]) => (
                              <span key={key} className="inline-block bg-gray-200 rounded px-2 py-1 mr-1">
                                {key}: {value as string}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedView === 'logs' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">
                  Log Entries 
                  {searchQuery && <span className="text-sm text-gray-500"> (filtered: {filteredLogs.length})</span>}
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredLogs.map((log: any) => (
                    <div key={log.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <span className={`inline-flex px-2 py-1 rounded text-xs font-medium mr-2 ${
                              LOG_LEVEL_COLORS[log.level as keyof typeof LOG_LEVEL_COLORS]
                            }`}>
                              {log.level.toUpperCase()}
                            </span>
                            <span className="text-sm font-medium text-gray-900">{log.service}</span>
                          </div>
                          <p className="text-sm text-gray-700 mb-1">{log.message}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedView === 'traces' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">
                  Recent Traces
                  {searchQuery && <span className="text-sm text-gray-500"> (filtered: {filteredTraces.length})</span>}
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredTraces.map((trace: any) => (
                    <div key={trace.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <span className={`inline-flex px-2 py-1 rounded text-xs font-medium mr-2 ${
                            trace.status === 'success' ? 'bg-green-100 text-green-700' :
                            trace.status === 'error' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {trace.status.toUpperCase()}
                          </span>
                          <span className="font-medium text-gray-900">{trace.operation}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {trace.duration?.toFixed(2) || 0}ms
                          </div>
                          <div className="text-xs text-gray-500">{trace.service}</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Trace ID: {trace.traceId} | {new Date(trace.startTime).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedView === 'alerts' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Active Alerts</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {data.alerts?.recent?.map((alert: any) => (
                    <div key={alert.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className={`inline-flex px-2 py-1 rounded text-xs font-medium mr-2 ${
                              alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                              alert.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                              alert.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {alert.severity}
                            </span>
                            <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                              STATUS_COLORS[alert.status as keyof typeof STATUS_COLORS]
                            }`}>
                              {alert.status}
                            </span>
                          </div>
                          <h4 className="font-medium text-gray-900 mb-1">{alert.title}</h4>
                          <p className="text-sm text-gray-600 mb-1">{alert.description}</p>
                          <p className="text-xs text-gray-500">
                            Source: {alert.source} | {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedView === 'business' && data.businessInsights && (
              <>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Business KPIs</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.businessInsights.kpis?.map((kpi: any, index: number) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{kpi.name}</h4>
                            <p className="text-sm text-gray-600">{kpi.category}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-gray-900">{kpi.value}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(kpi.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {data.businessInsights.predictions && data.businessInsights.predictions.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-semibold mb-4">AI Predictions</h3>
                    <div className="space-y-3">
                      {data.businessInsights.predictions.map((prediction: any, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{prediction.type}</span>
                            <span className="text-sm text-gray-600">
                              {(prediction.confidence * 100).toFixed(0)}% confidence
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{prediction.prediction}</p>
                          <p className="text-xs text-gray-500 mt-1">Timeframe: {prediction.timeframe}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* System Recommendations */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <LightBulbIcon className="w-5 h-5 mr-2 text-yellow-600" />
                Recommendations
              </h3>
              <div className="space-y-3">
                {data.systemHealth.recommendations.length > 0 ? (
                  data.systemHealth.recommendations.map((rec, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">{rec}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No recommendations at this time</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button 
                  onClick={handleGenerateInsights}
                  className="w-full px-4 py-2 text-left text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <LightBulbIcon className="w-4 h-4 mr-2 inline" />
                  Generate AI Insights
                </button>
                <button 
                  onClick={() => handleAction('trace', { 
                    operation: 'health_check',
                    service: 'observability_dashboard',
                    tags: { source: 'manual' }
                  })}
                  className="w-full px-4 py-2 text-left text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <MapIcon className="w-4 h-4 mr-2 inline" />
                  Create Test Trace
                </button>
                <button 
                  onClick={() => handleAction('alert', {
                    severity: 'LOW',
                    title: 'Test Alert',
                    description: 'This is a test alert from the dashboard',
                    source: 'dashboard'
                  })}
                  className="w-full px-4 py-2 text-left text-sm bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
                >
                  <ExclamationTriangleIcon className="w-4 h-4 mr-2 inline" />
                  Test Alert System
                </button>
                <button 
                  onClick={handleExport}
                  className="w-full px-4 py-2 text-left text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <DocumentArrowDownIcon className="w-4 h-4 mr-2 inline" />
                  Export Data
                </button>
              </div>
            </div>

            {/* Real-time Status */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Real-time Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Auto Refresh</span>
                  <div className={`w-3 h-3 rounded-full ${autoRefresh ? 'bg-green-400' : 'bg-gray-400'}`} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Refresh Interval</span>
                  <span className="text-sm font-medium text-gray-900">{refreshInterval}s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(data.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Data Points</span>
                  <span className="text-sm font-medium text-gray-900">
                    {(data.metrics?.summary?.totalMetrics || 0) + 
                     (data.logs?.summary?.totalLogs || 0) + 
                     (data.traces?.summary?.totalTraces || 0)}
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