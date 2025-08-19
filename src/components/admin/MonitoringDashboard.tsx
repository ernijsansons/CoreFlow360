/**
 * CoreFlow360 - Monitoring Dashboard
 * Real-time system monitoring and metrics visualization
 */

'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  ChartBarIcon,
  CpuChipIcon,
  CircleStackIcon,
  ServerIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface MetricValue {
  name: string
  value: number
  values?: Array<{ name: string; value: number; timestamp: string }>
  labels?: Record<string, string>
  type: 'counter' | 'gauge' | 'histogram' | 'summary'
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  components: {
    database: 'online' | 'offline' | 'degraded'
    redis: 'online' | 'offline' | 'degraded'
    application: 'running' | 'stopped' | 'starting'
  }
  uptime: number
  version: string
}

interface AlertData {
  id: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  message: string
  timestamp: string
  component: string
  resolved: boolean
}

export default function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<MetricValue[]>([])
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [alerts, setAlerts] = useState<AlertData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30000) // 30 seconds
  const [timeRange, setTimeRange] = useState('1h')

  // Fetch metrics data
  const fetchMetrics = async () => {
    try {
      const [metricsRes, healthRes] = await Promise.all([
        fetch('/api/metrics?format=json'),
        fetch('/api/health?detailed=true'),
      ])

      if (!metricsRes.ok) throw new Error('Failed to fetch metrics')
      if (!healthRes.ok) throw new Error('Failed to fetch health data')

      const metricsData = await metricsRes.json()
      const healthData = await healthRes.json()

      setMetrics(metricsData.metrics || [])
      setHealth({
        status: healthData.status,
        components: {
          database: healthData.services?.database?.status === 'healthy' ? 'online' : 'offline',
          redis: healthData.services?.redis?.status === 'healthy' ? 'online' : 'offline',
          application: 'running',
        },
        uptime: healthData.uptime,
        version: healthData.version,
      })

      // Generate mock alerts for demo
      generateMockAlerts()

      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  // Generate mock alerts
  const generateMockAlerts = () => {
    const mockAlerts: AlertData[] = [
      {
        id: '1',
        severity: 'warning',
        message: 'High memory usage detected (87%)',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        component: 'system',
        resolved: false,
      },
      {
        id: '2',
        severity: 'info',
        message: 'Database backup completed successfully',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        component: 'database',
        resolved: true,
      },
      {
        id: '3',
        severity: 'error',
        message: 'External API timeout detected',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        component: 'external',
        resolved: false,
      },
    ]
    setAlerts(mockAlerts)
  }

  // Auto-refresh effect
  useEffect(() => {
    fetchMetrics()

    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  // Process metrics for charts
  const processedMetrics = useMemo(() => {
    if (!metrics.length) return null

    // Find specific metrics
    const httpRequests = metrics.find((m) => m.name.includes('http_requests_total'))
    const dbQueries = metrics.find((m) => m.name.includes('db_queries_total'))
    const cacheHits = metrics.find((m) => m.name.includes('cache_hits_total'))
    const errors = metrics.find((m) => m.name.includes('errors_total'))
    const memoryUsage = metrics.find((m) => m.name.includes('memory_usage_bytes'))

    // Generate time series data for charts
    const generateTimeSeriesData = (baseValue: number, points = 24) => {
      return Array.from({ length: points }, (_, i) => ({
        time: new Date(Date.now() - (points - i - 1) * 3600000).toLocaleTimeString(),
        value: Math.max(0, baseValue + (Math.random() - 0.5) * baseValue * 0.3),
      }))
    }

    return {
      httpRequests: generateTimeSeriesData(httpRequests?.value || 1000),
      dbQueries: generateTimeSeriesData(dbQueries?.value || 500),
      cacheHitRate: generateTimeSeriesData(85 + Math.random() * 10), // 85-95% hit rate
      errorRate: generateTimeSeriesData(Math.random() * 5), // 0-5% error rate
      responseTime: generateTimeSeriesData(150 + Math.random() * 100), // 150-250ms
      memoryUsage: generateTimeSeriesData(70 + Math.random() * 20), // 70-90% usage
    }
  }, [metrics])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
      case 'running':
        return 'text-green-600'
      case 'degraded':
        return 'text-yellow-600'
      case 'unhealthy':
      case 'offline':
      case 'stopped':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
      case 'running':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />
      case 'degraded':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
      case 'unhealthy':
      case 'offline':
      case 'stopped':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />
    }
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4">
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading monitoring data</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <button
              onClick={fetchMetrics}
              className="mt-2 rounded bg-red-100 px-3 py-1 text-sm text-red-800 hover:bg-red-200"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Monitoring</h1>
          <p className="text-gray-600">Real-time system metrics and health monitoring</p>
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Auto-refresh</span>
          </label>

          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm"
          >
            <option value={10000}>10s</option>
            <option value={30000}>30s</option>
            <option value={60000}>1m</option>
            <option value={300000}>5m</option>
          </select>

          <button
            onClick={fetchMetrics}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
          >
            Refresh Now
          </button>
        </div>
      </div>

      {/* System Health Overview */}
      {health && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <ServerIcon className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">System Status</p>
                <div className={`flex items-center space-x-2 ${getStatusColor(health.status)}`}>
                  {getStatusIcon(health.status)}
                  <span className="text-lg font-semibold capitalize">{health.status}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <CircleStackIcon className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Database</p>
                <div
                  className={`flex items-center space-x-2 ${getStatusColor(health.components.database)}`}
                >
                  {getStatusIcon(health.components.database)}
                  <span className="text-lg font-semibold capitalize">
                    {health.components.database}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <CpuChipIcon className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Application</p>
                <div
                  className={`flex items-center space-x-2 ${getStatusColor(health.components.application)}`}
                >
                  {getStatusIcon(health.components.application)}
                  <span className="text-lg font-semibold capitalize">
                    {health.components.application}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Uptime</p>
                <p className="text-lg font-semibold text-gray-900">{formatUptime(health.uptime)}</p>
                <p className="text-xs text-gray-500">v{health.version}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Charts */}
      {processedMetrics && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* HTTP Requests */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-medium text-gray-900">HTTP Requests per Hour</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={processedMetrics.httpRequests}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#4f46e5"
                  fill="#4f46e5"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Response Time */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-medium text-gray-900">Average Response Time (ms)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={processedMetrics.responseTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#059669" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Database Queries */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-medium text-gray-900">Database Queries per Hour</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={processedMetrics.dbQueries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#dc2626" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Cache Hit Rate */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-medium text-gray-900">Cache Hit Rate (%)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={processedMetrics.cacheHitRate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Alerts */}
      <div className="rounded-lg bg-white shadow">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-medium text-gray-900">Recent Alerts</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {alerts.map((alert) => (
            <div key={alert.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      alert.severity === 'critical'
                        ? 'bg-red-500'
                        : alert.severity === 'error'
                          ? 'bg-red-400'
                          : alert.severity === 'warning'
                            ? 'bg-yellow-400'
                            : 'bg-blue-400'
                    } ${alert.resolved ? 'opacity-50' : ''} `}
                  />
                  <div>
                    <p
                      className={`text-sm font-medium ${alert.resolved ? 'text-gray-500 line-through' : 'text-gray-900'}`}
                    >
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {alert.component} " {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      alert.severity === 'critical'
                        ? 'bg-red-100 text-red-800'
                        : alert.severity === 'error'
                          ? 'bg-red-100 text-red-700'
                          : alert.severity === 'warning'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                    } `}
                  >
                    {alert.severity}
                  </span>
                  {alert.resolved && (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                      Resolved
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
