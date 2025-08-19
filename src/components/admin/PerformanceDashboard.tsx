'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChartBarIcon,
  CpuChipIcon,
  ServerIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BoltIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CogIcon,
  PlayIcon,
  DocumentArrowDownIcon,
  FireIcon,
  ShieldCheckIcon,
  BeakerIcon,
  LightBulbIcon,
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
} from 'recharts'
import { toast } from 'react-hot-toast'

interface PerformanceMetrics {
  overview: {
    totalRequests: number
    averageResponseTime: number
    p95ResponseTime: number
    p99ResponseTime: number
    errorRate: number
    throughput: number
    healthScore: number
    status: string
  }
  database: {
    totalConnections: number
    activeConnections: number
    avgQueryTime: number
    slowQueries: number
    poolUtilization: number
    performance: {
      status: string
      bottlenecks: string[]
      optimizations: string[]
    }
  }
  cache: {
    hitRatio: number
    memoryUsage: number
    totalEntries: number
    compressionRatio: number
    evictions: number
    performance: {
      status: string
      efficiency: number
      recommendations: string[]
    }
  }
  system: {
    cpuUsage: number
    memoryUsage: number
    diskUsage: number
    networkLatency: number
    health: {
      overall: string
      resources: {
        cpu: string
        memory: string
        disk: string
        network: string
      }
    }
  }
}

interface PerformanceAlert {
  id: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  type: string
  message: string
  timestamp: string
  resolved: boolean
}

interface Recommendation {
  id: string
  category: string
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  title: string
  expectedImpact: string
  implementationEffort: string
  automated: boolean
}

const COLORS = {
  primary: '#6366f1',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
}

const STATUS_COLORS = {
  EXCELLENT: 'text-green-600 bg-green-100',
  GOOD: 'text-blue-600 bg-blue-100',
  FAIR: 'text-yellow-600 bg-yellow-100',
  POOR: 'text-red-600 bg-red-100',
  HEALTHY: 'text-green-600 bg-green-100',
  WARNING: 'text-yellow-600 bg-yellow-100',
  CRITICAL: 'text-red-600 bg-red-100',
}

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [selectedView, setSelectedView] = useState<'overview' | 'database' | 'cache' | 'system'>(
    'overview'
  )
  const [loading, setLoading] = useState(true)
  const [optimizing, setOptimizing] = useState(false)
  const [trends, setTrends] = useState<unknown>(null)

  useEffect(() => {
    loadPerformanceData()

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadPerformanceData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadPerformanceData = async () => {
    try {
      const response = await fetch('/api/performance/analytics?includeTrends=true')
      const data = await response.json()

      if (data.success) {
        setMetrics({
          overview: data.overview,
          database: data.database,
          cache: data.cache,
          system: data.system,
        })

        if (data.alerts) {
          setAlerts(data.alerts.recent || [])
        }

        if (data.recommendations) {
          setRecommendations(data.recommendations.top || [])
        }

        if (data.trends) {
          setTrends(data.trends)
        }
      }
    } catch (error) {
      toast.error('Failed to load performance data')
    } finally {
      setLoading(false)
    }
  }

  const handleOptimize = async () => {
    setOptimizing(true)

    try {
      const response = await fetch('/api/performance/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'optimize',
          autoApply: true,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Applied ${data.result.optimizationsApplied} optimizations`)
        await loadPerformanceData() // Refresh data
      } else {
        toast.error('Optimization failed')
      }
    } catch (error) {
      toast.error('Optimization failed')
    } finally {
      setOptimizing(false)
    }
  }

  const handleWarmup = async () => {
    try {
      const response = await fetch('/api/performance/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'warmup',
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Performance systems warmed up')
      } else {
        toast.error('Warmup failed')
      }
    } catch (error) {
      toast.error('Warmup failed')
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch('/api/performance/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'export',
          format: 'json',
        }),
      })

      const data = await response.json()

      if (data.success) {
        const blob = new Blob([JSON.stringify(data.result.data, null, 2)], {
          type: 'application/json',
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `performance-metrics-${new Date().toISOString().split('T')[0]}.json`
        a.click()

        toast.success('Performance metrics exported')
      }
    } catch (error) {
      toast.error('Export failed')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'EXCELLENT':
      case 'HEALTHY':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />
      case 'GOOD':
        return <CheckCircleIcon className="h-5 w-5 text-blue-600" />
      case 'FAIR':
      case 'WARNING':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
      case 'POOR':
      case 'CRITICAL':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />
    }
  }

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-blue-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading || !metrics) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600" />
          <p className="text-gray-600">Loading performance dashboard...</p>
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
              <ChartBarIcon className="mr-4 h-10 w-10 text-indigo-600" />
              <div>
                <h1 className="mb-2 text-4xl font-bold text-gray-900">
                  Performance Command Center
                </h1>
                <p className="text-lg text-gray-600">
                  Real-time system performance monitoring and optimization
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleWarmup}
                className="flex items-center rounded-lg bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-700"
              >
                <FireIcon className="mr-2 h-4 w-4" />
                Warmup
              </button>
              <button
                onClick={handleOptimize}
                disabled={optimizing}
                className="flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
              >
                {optimizing ? (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                ) : (
                  <BoltIcon className="mr-2 h-4 w-4" />
                )}
                {optimizing ? 'Optimizing...' : 'Auto-Optimize'}
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

        {/* Health Score Card */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-white p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-4 rounded-lg bg-indigo-100 p-3">
                  <ShieldCheckIcon className="h-8 w-8 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">System Health Score</h3>
                  <p className="text-gray-600">Overall system performance rating</p>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`text-4xl font-bold ${getHealthColor(metrics.overview.healthScore)}`}
                >
                  {metrics.overview.healthScore}/100
                </div>
                <div className="flex items-center">
                  {getStatusIcon(metrics.overview.status)}
                  <span className="ml-2 text-gray-600">{metrics.overview.status}</span>
                </div>
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
              <ClockIcon className="h-8 w-8 text-blue-600" />
              <span className="text-3xl font-bold text-gray-900">
                {metrics.overview.averageResponseTime.toFixed(0)}ms
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Avg Response Time</h3>
            <p className="text-sm text-gray-600">
              P95: {metrics.overview.p95ResponseTime.toFixed(0)}ms
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl bg-white p-6 shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between">
              <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
              <span className="text-3xl font-bold text-gray-900">
                {metrics.overview.throughput.toFixed(0)}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Throughput</h3>
            <p className="text-sm text-gray-600">Requests per second</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl bg-white p-6 shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              <span className="text-3xl font-bold text-gray-900">
                {metrics.overview.errorRate.toFixed(1)}%
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Error Rate</h3>
            <p className="text-sm text-gray-600">Last 24 hours</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl bg-white p-6 shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between">
              <ServerIcon className="h-8 w-8 text-purple-600" />
              <span className="text-3xl font-bold text-gray-900">
                {metrics.cache.hitRatio.toFixed(1)}%
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Cache Hit Rate</h3>
            <p className="text-sm text-gray-600">Cache efficiency</p>
          </motion.div>
        </div>

        {/* View Selector */}
        <div className="mb-6">
          <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
            {[
              { id: 'overview', name: 'Overview', icon: ChartBarIcon },
              { id: 'database', name: 'Database', icon: ServerIcon },
              { id: 'cache', name: 'Cache', icon: CpuChipIcon },
              { id: 'system', name: 'System', icon: CogIcon },
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

        {/* Content Area */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {selectedView === 'overview' && (
              <>
                {/* Response Time Trend */}
                <div className="rounded-xl bg-white p-6 shadow-lg">
                  <h3 className="mb-4 text-xl font-semibold">Response Time Trend</h3>
                  {trends && trends.responseTime && (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={trends.responseTime}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={COLORS.primary}
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* System Overview */}
                <div className="rounded-xl bg-white p-6 shadow-lg">
                  <h3 className="mb-4 text-xl font-semibold">System Resource Usage</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <div className="mb-1 flex justify-between">
                          <span className="text-sm text-gray-600">CPU Usage</span>
                          <span className="text-sm font-medium">
                            {metrics.system.cpuUsage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-blue-500 transition-all"
                            style={{ width: `${metrics.system.cpuUsage}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="mb-1 flex justify-between">
                          <span className="text-sm text-gray-600">Memory Usage</span>
                          <span className="text-sm font-medium">
                            {metrics.system.memoryUsage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-green-500 transition-all"
                            style={{ width: `${metrics.system.memoryUsage}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="mb-1 flex justify-between">
                          <span className="text-sm text-gray-600">Disk Usage</span>
                          <span className="text-sm font-medium">
                            {metrics.system.diskUsage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-yellow-500 transition-all"
                            style={{ width: `${metrics.system.diskUsage}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="mb-1 flex justify-between">
                          <span className="text-sm text-gray-600">Network Latency</span>
                          <span className="text-sm font-medium">
                            {metrics.system.networkLatency.toFixed(1)}ms
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-purple-500 transition-all"
                            style={{ width: `${Math.min(metrics.system.networkLatency, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {selectedView === 'database' && (
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Database Performance</h3>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[metrics.database.performance.status]}`}
                  >
                    {metrics.database.performance.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="rounded-lg bg-gray-50 p-4">
                      <h4 className="mb-2 font-medium text-gray-900">Connection Pool</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Connections</span>
                          <span className="font-medium">{metrics.database.totalConnections}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Active</span>
                          <span className="font-medium">{metrics.database.activeConnections}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Utilization</span>
                          <span className="font-medium">
                            {metrics.database.poolUtilization.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                      <h4 className="mb-2 font-medium text-gray-900">Query Performance</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Avg Query Time</span>
                          <span className="font-medium">
                            {metrics.database.avgQueryTime.toFixed(0)}ms
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Slow Queries</span>
                          <span className="font-medium">{metrics.database.slowQueries}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {metrics.database.performance.bottlenecks.length > 0 && (
                      <div className="rounded-lg bg-red-50 p-4">
                        <h4 className="mb-2 font-medium text-red-900">Bottlenecks</h4>
                        <ul className="space-y-1">
                          {metrics.database.performance.bottlenecks.map((bottleneck, index) => (
                            <li key={index} className="text-sm text-red-700">
                              • {bottleneck}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {metrics.database.performance.optimizations.length > 0 && (
                      <div className="rounded-lg bg-blue-50 p-4">
                        <h4 className="mb-2 font-medium text-blue-900">Optimizations</h4>
                        <ul className="space-y-1">
                          {metrics.database.performance.optimizations.map((optimization, index) => (
                            <li key={index} className="text-sm text-blue-700">
                              • {optimization}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {selectedView === 'cache' && (
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Cache Performance</h3>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[metrics.cache.performance.status]}`}
                  >
                    {metrics.cache.performance.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="rounded-lg bg-gray-50 p-4">
                      <h4 className="mb-2 font-medium text-gray-900">Cache Stats</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Hit Ratio</span>
                          <span className="font-medium text-green-600">
                            {metrics.cache.hitRatio.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Entries</span>
                          <span className="font-medium">
                            {metrics.cache.totalEntries.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Memory Usage</span>
                          <span className="font-medium">
                            {(metrics.cache.memoryUsage / 1024 / 1024).toFixed(1)}MB
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Evictions</span>
                          <span className="font-medium">{metrics.cache.evictions}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {metrics.cache.performance.recommendations.length > 0 && (
                      <div className="rounded-lg bg-blue-50 p-4">
                        <h4 className="mb-2 font-medium text-blue-900">Recommendations</h4>
                        <ul className="space-y-1">
                          {metrics.cache.performance.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-blue-700">
                              • {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {selectedView === 'system' && (
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-semibold">System Health</h3>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[metrics.system.health.overall]}`}
                  >
                    {metrics.system.health.overall}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {Object.entries(metrics.system.health.resources).map(([resource, status]) => (
                      <div key={resource} className="rounded-lg bg-gray-50 p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 capitalize">{resource}</h4>
                          <span
                            className={`rounded px-2 py-1 text-sm font-medium ${STATUS_COLORS[status as keyof typeof STATUS_COLORS]}`}
                          >
                            {status}
                          </span>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between text-sm">
                            <span>Usage</span>
                            <span>
                              {metrics.system[
                                `${resource}Usage` as keyof typeof metrics.system
                              ]?.toFixed(1)}
                              %
                            </span>
                          </div>
                          <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                (metrics.system[
                                  `${resource}Usage` as keyof typeof metrics.system
                                ] as number) > 80
                                  ? 'bg-red-500'
                                  : (metrics.system[
                                        `${resource}Usage` as keyof typeof metrics.system
                                      ] as number) > 60
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                              }`}
                              style={{
                                width: `${metrics.system[`${resource}Usage` as keyof typeof metrics.system]}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Alerts */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h3 className="mb-4 flex items-center text-lg font-semibold">
                <ExclamationTriangleIcon className="mr-2 h-5 w-5 text-red-600" />
                Recent Alerts
              </h3>
              <div className="space-y-3">
                {alerts.length > 0 ? (
                  alerts.map((alert) => (
                    <div key={alert.id} className="rounded-lg bg-gray-50 p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div
                            className={`inline-flex rounded px-2 py-1 text-xs font-medium ${
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
                          </div>
                          <p className="mt-1 text-sm font-medium text-gray-900">{alert.message}</p>
                          <p className="mt-1 text-xs text-gray-500">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No recent alerts</p>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h3 className="mb-4 flex items-center text-lg font-semibold">
                <LightBulbIcon className="mr-2 h-5 w-5 text-yellow-600" />
                Optimization Recommendations
              </h3>
              <div className="space-y-3">
                {recommendations.length > 0 ? (
                  recommendations.map((rec) => (
                    <div key={rec.id} className="rounded-lg bg-gray-50 p-3">
                      <div className="mb-2 flex items-start justify-between">
                        <div
                          className={`inline-flex rounded px-2 py-1 text-xs font-medium ${
                            rec.priority === 'CRITICAL'
                              ? 'bg-red-100 text-red-700'
                              : rec.priority === 'HIGH'
                                ? 'bg-orange-100 text-orange-700'
                                : rec.priority === 'MEDIUM'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {rec.priority}
                        </div>
                        {rec.automated && (
                          <div className="inline-flex rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                            AUTO
                          </div>
                        )}
                      </div>
                      <p className="mb-1 text-sm font-medium text-gray-900">{rec.title}</p>
                      <p className="text-xs text-gray-600">Impact: {rec.expectedImpact}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No recommendations available</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={handleWarmup}
                  className="w-full rounded-lg bg-orange-50 px-4 py-2 text-left text-sm text-orange-700 transition-colors hover:bg-orange-100"
                >
                  <FireIcon className="mr-2 inline h-4 w-4" />
                  System Warmup
                </button>
                <button
                  onClick={() => toast('Feature coming soon!')}
                  className="w-full rounded-lg bg-purple-50 px-4 py-2 text-left text-sm text-purple-700 transition-colors hover:bg-purple-100"
                >
                  <BeakerIcon className="mr-2 inline h-4 w-4" />
                  Run Diagnostics
                </button>
                <button
                  onClick={handleExport}
                  className="w-full rounded-lg bg-blue-50 px-4 py-2 text-left text-sm text-blue-700 transition-colors hover:bg-blue-100"
                >
                  <DocumentArrowDownIcon className="mr-2 inline h-4 w-4" />
                  Export Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
