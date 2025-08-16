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
  LightBulbIcon
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
  Cell
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
  info: '#3b82f6'
}

const STATUS_COLORS = {
  'EXCELLENT': 'text-green-600 bg-green-100',
  'GOOD': 'text-blue-600 bg-blue-100',
  'FAIR': 'text-yellow-600 bg-yellow-100',
  'POOR': 'text-red-600 bg-red-100',
  'HEALTHY': 'text-green-600 bg-green-100',
  'WARNING': 'text-yellow-600 bg-yellow-100',
  'CRITICAL': 'text-red-600 bg-red-100'
}

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [selectedView, setSelectedView] = useState<'overview' | 'database' | 'cache' | 'system'>('overview')
  const [loading, setLoading] = useState(true)
  const [optimizing, setOptimizing] = useState(false)
  const [trends, setTrends] = useState<any>(null)

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
          system: data.system
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
      console.error('Failed to load performance data:', error)
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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'optimize',
          autoApply: true
        })
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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'warmup'
        })
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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'export',
          format: 'json'
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        const blob = new Blob([JSON.stringify(data.result.data, null, 2)], {
          type: 'application/json'
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
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />
      case 'GOOD':
        return <CheckCircleIcon className="w-5 h-5 text-blue-600" />
      case 'FAIR':
      case 'WARNING':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
      case 'POOR':
      case 'CRITICAL':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-600" />
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading performance dashboard...</p>
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
              <ChartBarIcon className="w-10 h-10 text-indigo-600 mr-4" />
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
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
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center"
              >
                <FireIcon className="w-4 h-4 mr-2" />
                Warmup
              </button>
              <button
                onClick={handleOptimize}
                disabled={optimizing}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-50"
              >
                {optimizing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <BoltIcon className="w-4 h-4 mr-2" />
                )}
                {optimizing ? 'Optimizing...' : 'Auto-Optimize'}
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

        {/* Health Score Card */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-indigo-100 rounded-lg mr-4">
                  <ShieldCheckIcon className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">System Health Score</h3>
                  <p className="text-gray-600">Overall system performance rating</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-4xl font-bold ${getHealthColor(metrics.overview.healthScore)}`}>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <ClockIcon className="w-8 h-8 text-blue-600" />
              <span className="text-3xl font-bold text-gray-900">
                {metrics.overview.averageResponseTime.toFixed(0)}ms
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Avg Response Time</h3>
            <p className="text-sm text-gray-600">P95: {metrics.overview.p95ResponseTime.toFixed(0)}ms</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <ArrowTrendingUpIcon className="w-8 h-8 text-green-600" />
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
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
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
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <ServerIcon className="w-8 h-8 text-purple-600" />
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
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { id: 'overview', name: 'Overview', icon: ChartBarIcon },
              { id: 'database', name: 'Database', icon: ServerIcon },
              { id: 'cache', name: 'Cache', icon: CpuChipIcon },
              { id: 'system', name: 'System', icon: CogIcon }
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

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {selectedView === 'overview' && (
              <>
                {/* Response Time Trend */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Response Time Trend</h3>
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
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">System Resource Usage</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600">CPU Usage</span>
                          <span className="text-sm font-medium">{metrics.system.cpuUsage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${metrics.system.cpuUsage}%` }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600">Memory Usage</span>
                          <span className="text-sm font-medium">{metrics.system.memoryUsage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{ width: `${metrics.system.memoryUsage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600">Disk Usage</span>
                          <span className="text-sm font-medium">{metrics.system.diskUsage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full transition-all"
                            style={{ width: `${metrics.system.diskUsage}%` }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600">Network Latency</span>
                          <span className="text-sm font-medium">{metrics.system.networkLatency.toFixed(1)}ms</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full transition-all"
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
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Database Performance</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[metrics.database.performance.status]}`}>
                    {metrics.database.performance.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Connection Pool</h4>
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
                          <span className="font-medium">{metrics.database.poolUtilization.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Query Performance</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Avg Query Time</span>
                          <span className="font-medium">{metrics.database.avgQueryTime.toFixed(0)}ms</span>
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
                      <div className="p-4 bg-red-50 rounded-lg">
                        <h4 className="font-medium text-red-900 mb-2">Bottlenecks</h4>
                        <ul className="space-y-1">
                          {metrics.database.performance.bottlenecks.map((bottleneck, index) => (
                            <li key={index} className="text-sm text-red-700">• {bottleneck}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {metrics.database.performance.optimizations.length > 0 && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Optimizations</h4>
                        <ul className="space-y-1">
                          {metrics.database.performance.optimizations.map((optimization, index) => (
                            <li key={index} className="text-sm text-blue-700">• {optimization}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {selectedView === 'cache' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Cache Performance</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[metrics.cache.performance.status]}`}>
                    {metrics.cache.performance.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Cache Stats</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Hit Ratio</span>
                          <span className="font-medium text-green-600">{metrics.cache.hitRatio.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Entries</span>
                          <span className="font-medium">{metrics.cache.totalEntries.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Memory Usage</span>
                          <span className="font-medium">{(metrics.cache.memoryUsage / 1024 / 1024).toFixed(1)}MB</span>
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
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Recommendations</h4>
                        <ul className="space-y-1">
                          {metrics.cache.performance.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-blue-700">• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {selectedView === 'system' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">System Health</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[metrics.system.health.overall]}`}>
                    {metrics.system.health.overall}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {Object.entries(metrics.system.health.resources).map(([resource, status]) => (
                      <div key={resource} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 capitalize">{resource}</h4>
                          <span className={`px-2 py-1 rounded text-sm font-medium ${STATUS_COLORS[status as keyof typeof STATUS_COLORS]}`}>
                            {status}
                          </span>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between text-sm">
                            <span>Usage</span>
                            <span>{metrics.system[`${resource}Usage` as keyof typeof metrics.system]?.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                (metrics.system[`${resource}Usage` as keyof typeof metrics.system] as number) > 80 ? 'bg-red-500' :
                                (metrics.system[`${resource}Usage` as keyof typeof metrics.system] as number) > 60 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${metrics.system[`${resource}Usage` as keyof typeof metrics.system]}%` }}
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
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-red-600" />
                Recent Alerts
              </h3>
              <div className="space-y-3">
                {alerts.length > 0 ? (
                  alerts.map((alert) => (
                    <div key={alert.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                            alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                            alert.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                            alert.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {alert.severity}
                          </div>
                          <p className="text-sm font-medium text-gray-900 mt-1">
                            {alert.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
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
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <LightBulbIcon className="w-5 h-5 mr-2 text-yellow-600" />
                Optimization Recommendations
              </h3>
              <div className="space-y-3">
                {recommendations.length > 0 ? (
                  recommendations.map((rec) => (
                    <div key={rec.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                          rec.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                          rec.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                          rec.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {rec.priority}
                        </div>
                        {rec.automated && (
                          <div className="inline-flex px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                            AUTO
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {rec.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        Impact: {rec.expectedImpact}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No recommendations available</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button 
                  onClick={handleWarmup}
                  className="w-full px-4 py-2 text-left text-sm bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <FireIcon className="w-4 h-4 mr-2 inline" />
                  System Warmup
                </button>
                <button 
                  onClick={() => toast('Feature coming soon!')}
                  className="w-full px-4 py-2 text-left text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <BeakerIcon className="w-4 h-4 mr-2 inline" />
                  Run Diagnostics
                </button>
                <button 
                  onClick={handleExport}
                  className="w-full px-4 py-2 text-left text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <DocumentArrowDownIcon className="w-4 h-4 mr-2 inline" />
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