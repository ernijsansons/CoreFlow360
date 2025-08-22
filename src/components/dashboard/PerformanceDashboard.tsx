/**
 * CoreFlow360 - Performance Dashboard Component
 * Real-time performance monitoring dashboard with charts and metrics
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  SystemHealth, 
  PerformanceAlert, 
  UserExperience,
  PerformanceTrend 
} from '@/lib/analytics/performance-dashboard'

// Dashboard data interface
interface DashboardData {
  systemHealth: SystemHealth
  recentMetrics: Record<string, any[]>
  activeAlerts: PerformanceAlert[]
  userExperience: UserExperience
  quickStats: {
    avgResponseTime: number
    requestsPerSecond: number
    errorRate: number
    uptime: number
  }
}

interface PerformanceDashboardProps {
  refreshInterval?: number
  showAlerts?: boolean
  compact?: boolean
}

export default function PerformanceDashboard({ 
  refreshInterval = 5000, 
  showAlerts = true, 
  compact = false 
}: PerformanceDashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<'1h' | '24h' | '7d' | '30d'>('24h')
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['response_time', 'error_rate', 'throughput'])

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard/performance?type=overview')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      const dashboardData = await response.json()
      setData(dashboardData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  // Set up auto-refresh
  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, refreshInterval)
    return () => clearInterval(interval)
  }, [fetchDashboardData, refreshInterval])

  const getHealthStatusColor = (status: SystemHealth['overall']): string => {
    switch (status) {
      case 'healthy': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getHealthStatusBg = (status: SystemHealth['overall']): string => {
    switch (status) {
      case 'healthy': return 'bg-green-100'
      case 'warning': return 'bg-yellow-100'
      case 'critical': return 'bg-red-100'
      default: return 'bg-gray-100'
    }
  }

  const formatNumber = (num: number, decimals: number = 1): string => {
    return num.toFixed(decimals)
  }

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(2)}%`
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white p-4 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Dashboard</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
              <div className="mt-3">
                <button 
                  onClick={fetchDashboardData}
                  className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-md hover:bg-red-200"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className={`${compact ? 'p-4' : 'p-6'} space-y-6`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Performance Dashboard</h2>
        <div className="flex items-center space-x-4">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as typeof selectedPeriod)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live</span>
          </div>
        </div>
      </div>

      {/* System Health Overview */}
      <div className={`${getHealthStatusBg(data.systemHealth.overall)} p-4 rounded-lg`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
            <p className={`text-2xl font-bold ${getHealthStatusColor(data.systemHealth.overall)}`}>
              {data.systemHealth.overall.toUpperCase()}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{data.systemHealth.score}</div>
            <div className="text-sm text-gray-600">Overall Score</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Avg Response Time</div>
          <div className="text-2xl font-bold text-blue-600">
            {formatDuration(data.quickStats.avgResponseTime)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Requests/sec</div>
          <div className="text-2xl font-bold text-green-600">
            {formatNumber(data.quickStats.requestsPerSecond)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Error Rate</div>
          <div className="text-2xl font-bold text-red-600">
            {formatPercentage(data.quickStats.errorRate / 100)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Uptime</div>
          <div className="text-2xl font-bold text-purple-600">
            {formatPercentage(data.quickStats.uptime / 100)}
          </div>
        </div>
      </div>

      {/* Components Health */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Component Health</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(data.systemHealth.components).map(([name, component]) => (
            <div key={name} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium capitalize">{name.replace('_', ' ')}</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  component.status === 'healthy' ? 'bg-green-100 text-green-800' :
                  component.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  component.status === 'critical' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {component.status}
                </span>
              </div>
              <div className="text-lg font-bold text-gray-900">{component.score}/100</div>
              <div className="text-xs text-gray-500 space-y-1">
                <div>Response: {formatDuration(component.metrics.responseTime)}</div>
                <div>Errors: {formatPercentage(component.metrics.errorRate)}</div>
                <div>Uptime: {formatPercentage(component.metrics.uptime)}</div>
              </div>
              {component.issues.length > 0 && (
                <div className="mt-2 text-xs text-red-600">
                  {component.issues.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* User Experience Metrics */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Experience</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-600">Page Load</div>
            <div className="text-lg font-bold text-blue-600">
              {formatDuration(data.userExperience.pageLoadTime)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">FCP</div>
            <div className="text-lg font-bold text-green-600">
              {formatDuration(data.userExperience.firstContentfulPaint)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">LCP</div>
            <div className="text-lg font-bold text-yellow-600">
              {formatDuration(data.userExperience.largestContentfulPaint)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">CLS</div>
            <div className="text-lg font-bold text-purple-600">
              {formatNumber(data.userExperience.cumulativeLayoutShift, 3)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">FID</div>
            <div className="text-lg font-bold text-red-600">
              {formatDuration(data.userExperience.firstInputDelay)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Score</div>
            <div className="text-lg font-bold text-indigo-600">
              {Math.round(data.userExperience.userSatisfactionScore)}/100
            </div>
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      {showAlerts && data.activeAlerts.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Alerts</h3>
          <div className="space-y-3">
            {data.activeAlerts.map((alert) => (
              <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                alert.level === 'critical' ? 'bg-red-50 border-red-400' : 'bg-yellow-50 border-yellow-400'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900">{alert.metric}</div>
                    <div className="text-sm text-gray-600">
                      Current: {formatNumber(alert.value)} | Threshold: {formatNumber(alert.threshold)}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Metrics Chart Placeholder */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Metrics</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-gray-500 text-center">
            <div className="text-lg font-medium">Chart Coming Soon</div>
            <div className="text-sm">Real-time metrics visualization</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {new Date(data.systemHealth.lastUpdated).toLocaleString()}
        {' • '}
        Auto-refresh every {refreshInterval / 1000}s
      </div>
    </div>
  )
}