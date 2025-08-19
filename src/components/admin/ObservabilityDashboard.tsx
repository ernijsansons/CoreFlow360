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
  MagnifyingGlassIcon,
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
      metadata: Record<string, unknown>
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
    services: Record<
      string,
      {
        status: string
        errorRate: number
        avgResponseTime: number
        requestCount: number
      }
    >
    recommendations: string[]
  }
  metrics?: {
    summary: unknown
    recent: unknown[]
    trends: unknown
  }
  logs?: {
    summary: unknown
    recent: unknown[]
    levelDistribution: unknown[]
  }
  traces?: {
    summary: unknown
    recent: unknown[]
    performance: unknown
  }
  alerts?: {
    summary: unknown
    recent: unknown[]
    trends: unknown
  }
  businessInsights?: {
    kpis: unknown[]
    trends: unknown
    predictions: unknown[]
  }
}

const COLORS = {
  primary: '#6366f1',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  debug: '#8b5cf6',
  critical: '#dc2626',
}

const STATUS_COLORS = {
  EXCELLENT: 'text-green-600 bg-green-100',
  GOOD: 'text-blue-600 bg-blue-100',
  WARNING: 'text-yellow-600 bg-yellow-100',
  CRITICAL: 'text-red-600 bg-red-100',
  HEALTHY: 'text-green-600 bg-green-100',
  UNHEALTHY: 'text-red-600 bg-red-100',
  OPEN: 'text-red-600 bg-red-100',
  ACKNOWLEDGED: 'text-yellow-600 bg-yellow-100',
  RESOLVED: 'text-green-600 bg-green-100',
}

const LOG_LEVEL_COLORS = {
  debug: 'text-purple-600 bg-purple-100',
  info: 'text-blue-600 bg-blue-100',
  warn: 'text-yellow-600 bg-yellow-100',
  error: 'text-red-600 bg-red-100',
}

export default function ObservabilityDashboard() {
  const [data, setData] = useState<ObservabilityData | null>(null)
  const [selectedView, setSelectedView] = useState<
    'overview' | 'metrics' | 'logs' | 'traces' | 'alerts' | 'business'
  >('overview')
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
        includeAlerts: 'true',
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
      toast.error('Failed to load observability data')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: string, actionData?: unknown) => {
    try {
      const response = await fetch('/api/observability/analytics', {
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
        type: 'application/json',
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
      insights.forEach((insight: unknown, index: number) => {
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
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />
      case 'GOOD':
        return <CheckCircleIcon className="h-5 w-5 text-blue-600" />
      case 'WARNING':
      case 'ACKNOWLEDGED':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
      case 'CRITICAL':
      case 'UNHEALTHY':
      case 'OPEN':
        return <XCircleIcon className="h-5 w-5 text-red-600" />
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />
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

  const filteredLogs =
    data?.logs?.recent?.filter(
      (log) =>
        (!searchQuery || log.message.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (!selectedService || log.service === selectedService)
    ) || []

  const filteredTraces =
    data?.traces?.recent?.filter(
      (trace) =>
        (!searchQuery || trace.operation.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (!selectedService || trace.service === selectedService)
    ) || []

  if (loading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600" />
          <p className="text-gray-600">Loading observability dashboard...</p>
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
              <EyeIcon className="mr-4 h-10 w-10 text-indigo-600" />
              <div>
                <h1 className="mb-2 text-4xl font-bold text-gray-900">
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
                onClick={handleGenerateInsights}
                className="flex items-center rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
              >
                <LightBulbIcon className="mr-2 h-4 w-4" />
                AI Insights
              </button>
              <button
                onClick={() => loadObservabilityData()}
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
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {Object.entries(data.systemHealth.services).map(([service, health]) => (
                <div key={service} className="rounded-lg bg-gray-50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="truncate font-medium text-gray-900">{service}</span>
                    {getStatusIcon(health.status)}
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
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
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-white p-6 shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
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
            className="rounded-xl bg-white p-6 shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between">
              <DocumentTextIcon className="h-8 w-8 text-green-600" />
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
            className="rounded-xl bg-white p-6 shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between">
              <MapIcon className="h-8 w-8 text-purple-600" />
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
            className="rounded-xl bg-white p-6 shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              <span className="text-3xl font-bold text-gray-900">
                {data.alerts?.summary?.open || 0}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Open Alerts</h3>
            <p className="text-sm text-gray-600">{data.alerts?.summary?.critical || 0} critical</p>
          </motion.div>
        </div>

        {/* View Selector */}
        <div className="mb-6">
          <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
            {[
              { id: 'overview', name: 'Overview', icon: EyeIcon },
              { id: 'metrics', name: 'Metrics', icon: ChartBarIcon },
              { id: 'logs', name: 'Logs', icon: DocumentTextIcon },
              { id: 'traces', name: 'Traces', icon: MapIcon },
              { id: 'alerts', name: 'Alerts', icon: ExclamationTriangleIcon },
              { id: 'business', name: 'Business', icon: LightBulbIcon },
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

        {/* Search and Filters */}
        {(selectedView === 'logs' || selectedView === 'traces') && (
          <div className="mb-6 rounded-xl bg-white p-4 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                  <input
                    type="text"
                    placeholder={`Search ${selectedView}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border py-2 pr-4 pl-10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="rounded-lg border px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Services</option>
                {Object.keys(data.systemHealth.services).map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
              {selectedView === 'logs' && (
                <select
                  value={logLevel}
                  onChange={(e) => setLogLevel(e.target.value)}
                  className="rounded-lg border px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {selectedView === 'overview' && (
              <>
                {/* System Trends */}
                <div className="rounded-xl bg-white p-6 shadow-lg">
                  <h3 className="mb-4 text-xl font-semibold">System Trends</h3>
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
                <div className="rounded-xl bg-white p-6 shadow-lg">
                  <h3 className="mb-4 text-xl font-semibold">Log Level Distribution</h3>
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
                          {data.logs.levelDistribution.map((entry: unknown, index: number) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[entry.level as keyof typeof COLORS] || COLORS.info}
                            />
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
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="mb-4 text-xl font-semibold">Recent Metrics</h3>
                <div className="max-h-96 space-y-3 overflow-y-auto">
                  {data.metrics?.recent?.map((metric: unknown) => (
                    <div
                      key={metric.id}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                    >
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
                              <span
                                key={key}
                                className="mr-1 inline-block rounded bg-gray-200 px-2 py-1"
                              >
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
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="mb-4 text-xl font-semibold">
                  Log Entries
                  {searchQuery && (
                    <span className="text-sm text-gray-500">
                      {' '}
                      (filtered: {filteredLogs.length})
                    </span>
                  )}
                </h3>
                <div className="max-h-96 space-y-3 overflow-y-auto">
                  {filteredLogs.map((log: unknown) => (
                    <div key={log.id} className="rounded-lg bg-gray-50 p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-1 flex items-center">
                            <span
                              className={`mr-2 inline-flex rounded px-2 py-1 text-xs font-medium ${
                                LOG_LEVEL_COLORS[log.level as keyof typeof LOG_LEVEL_COLORS]
                              }`}
                            >
                              {log.level.toUpperCase()}
                            </span>
                            <span className="text-sm font-medium text-gray-900">{log.service}</span>
                          </div>
                          <p className="mb-1 text-sm text-gray-700">{log.message}</p>
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
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="mb-4 text-xl font-semibold">
                  Recent Traces
                  {searchQuery && (
                    <span className="text-sm text-gray-500">
                      {' '}
                      (filtered: {filteredTraces.length})
                    </span>
                  )}
                </h3>
                <div className="max-h-96 space-y-3 overflow-y-auto">
                  {filteredTraces.map((trace: unknown) => (
                    <div key={trace.id} className="rounded-lg bg-gray-50 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center">
                          <span
                            className={`mr-2 inline-flex rounded px-2 py-1 text-xs font-medium ${
                              trace.status === 'success'
                                ? 'bg-green-100 text-green-700'
                                : trace.status === 'error'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
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
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="mb-4 text-xl font-semibold">Active Alerts</h3>
                <div className="max-h-96 space-y-3 overflow-y-auto">
                  {data.alerts?.recent?.map((alert: unknown) => (
                    <div key={alert.id} className="rounded-lg bg-gray-50 p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center">
                            <span
                              className={`mr-2 inline-flex rounded px-2 py-1 text-xs font-medium ${
                                alert.severity === 'CRITICAL'
                                  ? 'bg-red-100 text-red-700'
                                  : alert.severity === 'HIGH'
                                    ? 'bg-orange-100 text-orange-700'
                                    : alert.severity === 'MEDIUM'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {alert.severity}
                            </span>
                            <span
                              className={`inline-flex rounded px-2 py-1 text-xs font-medium ${
                                STATUS_COLORS[alert.status as keyof typeof STATUS_COLORS]
                              }`}
                            >
                              {alert.status}
                            </span>
                          </div>
                          <h4 className="mb-1 font-medium text-gray-900">{alert.title}</h4>
                          <p className="mb-1 text-sm text-gray-600">{alert.description}</p>
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
                <div className="rounded-xl bg-white p-6 shadow-lg">
                  <h3 className="mb-4 text-xl font-semibold">Business KPIs</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {data.businessInsights.kpis?.map((kpi: unknown, index: number) => (
                      <div key={index} className="rounded-lg bg-gray-50 p-4">
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

                {data.businessInsights.predictions &&
                  data.businessInsights.predictions.length > 0 && (
                    <div className="rounded-xl bg-white p-6 shadow-lg">
                      <h3 className="mb-4 text-xl font-semibold">AI Predictions</h3>
                      <div className="space-y-3">
                        {data.businessInsights.predictions.map(
                          (prediction: unknown, index: number) => (
                            <div key={index} className="rounded-lg bg-gray-50 p-3">
                              <div className="mb-2 flex items-center justify-between">
                                <span className="font-medium text-gray-900">{prediction.type}</span>
                                <span className="text-sm text-gray-600">
                                  {(prediction.confidence * 100).toFixed(0)}% confidence
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{prediction.prediction}</p>
                              <p className="mt-1 text-xs text-gray-500">
                                Timeframe: {prediction.timeframe}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* System Recommendations */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h3 className="mb-4 flex items-center text-lg font-semibold">
                <LightBulbIcon className="mr-2 h-5 w-5 text-yellow-600" />
                Recommendations
              </h3>
              <div className="space-y-3">
                {data.systemHealth.recommendations.length > 0 ? (
                  data.systemHealth.recommendations.map((rec, index) => (
                    <div key={index} className="rounded-lg bg-blue-50 p-3">
                      <p className="text-sm text-blue-800">{rec}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No recommendations at this time</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={handleGenerateInsights}
                  className="w-full rounded-lg bg-purple-50 px-4 py-2 text-left text-sm text-purple-700 transition-colors hover:bg-purple-100"
                >
                  <LightBulbIcon className="mr-2 inline h-4 w-4" />
                  Generate AI Insights
                </button>
                <button
                  onClick={() =>
                    handleAction('trace', {
                      operation: 'health_check',
                      service: 'observability_dashboard',
                      tags: { source: 'manual' },
                    })
                  }
                  className="w-full rounded-lg bg-blue-50 px-4 py-2 text-left text-sm text-blue-700 transition-colors hover:bg-blue-100"
                >
                  <MapIcon className="mr-2 inline h-4 w-4" />
                  Create Test Trace
                </button>
                <button
                  onClick={() =>
                    handleAction('alert', {
                      severity: 'LOW',
                      title: 'Test Alert',
                      description: 'This is a test alert from the dashboard',
                      source: 'dashboard',
                    })
                  }
                  className="w-full rounded-lg bg-yellow-50 px-4 py-2 text-left text-sm text-yellow-700 transition-colors hover:bg-yellow-100"
                >
                  <ExclamationTriangleIcon className="mr-2 inline h-4 w-4" />
                  Test Alert System
                </button>
                <button
                  onClick={handleExport}
                  className="w-full rounded-lg bg-green-50 px-4 py-2 text-left text-sm text-green-700 transition-colors hover:bg-green-100"
                >
                  <DocumentArrowDownIcon className="mr-2 inline h-4 w-4" />
                  Export Data
                </button>
              </div>
            </div>

            {/* Real-time Status */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-lg font-semibold">Real-time Status</h3>
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
