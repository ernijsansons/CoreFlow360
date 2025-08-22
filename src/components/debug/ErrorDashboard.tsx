/**
 * CoreFlow360 - Error Tracking Dashboard
 * Advanced error monitoring and debugging interface
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { ErrorSeverity, ErrorCategory } from '@/lib/debugging/error-tracker'

// Error interfaces
interface StructuredError {
  id: string
  message: string
  stack?: string
  name: string
  code?: string | number
  severity: ErrorSeverity
  category: ErrorCategory
  context: any
  fingerprint: string
  firstSeen: Date
  lastSeen: Date
  count: number
  resolved: boolean
  resolvedAt?: Date
  resolvedBy?: string
  tags: string[]
  metadata: Record<string, any>
}

interface ErrorAnalytics {
  period: string
  totalErrors: number
  errorsByCategory: Record<ErrorCategory, number>
  errorsBySeverity: Record<ErrorSeverity, number>
  topErrors: Array<{
    fingerprint: string
    message: string
    count: number
    lastSeen: Date
  }>
  affectedUsers: number
  errorRate: number
}

interface ErrorDashboardProps {
  tenantId?: string
  userId?: string
  refreshInterval?: number
}

export default function ErrorDashboard({ 
  tenantId, 
  userId, 
  refreshInterval = 30000 
}: ErrorDashboardProps) {
  const [analytics, setAnalytics] = useState<ErrorAnalytics | null>(null)
  const [errors, setErrors] = useState<StructuredError[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<'1h' | '24h' | '7d' | '30d'>('24h')
  const [selectedSeverity, setSelectedSeverity] = useState<ErrorSeverity[]>([])
  const [selectedCategory, setSelectedCategory] = useState<ErrorCategory[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showResolved, setShowResolved] = useState(false)
  const [selectedError, setSelectedError] = useState<StructuredError | null>(null)

  // Fetch error analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        action: 'analytics',
        period: selectedPeriod,
      })
      
      if (tenantId) params.append('tenantId', tenantId)
      if (userId) params.append('userId', userId)
      if (selectedSeverity.length) params.append('severity', selectedSeverity.join(','))
      if (selectedCategory.length) params.append('category', selectedCategory.join(','))

      const response = await fetch(`/api/debug/errors?${params}`)
      if (!response.ok) throw new Error('Failed to fetch analytics')
      
      const data = await response.json()
      setAnalytics(data)
    } catch (err) {
      console.error('Analytics fetch error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }, [selectedPeriod, tenantId, userId, selectedSeverity, selectedCategory])

  // Fetch errors list
  const fetchErrors = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        action: 'search',
        limit: '20',
        offset: '0',
        resolved: showResolved.toString(),
      })
      
      if (searchQuery) params.append('message', searchQuery)
      if (selectedSeverity.length) params.append('severity', selectedSeverity.join(','))
      if (selectedCategory.length) params.append('category', selectedCategory.join(','))

      const response = await fetch(`/api/debug/errors?${params}`)
      if (!response.ok) throw new Error('Failed to fetch errors')
      
      const data = await response.json()
      setErrors(data.errors.map((error: any) => ({
        ...error,
        firstSeen: new Date(error.firstSeen),
        lastSeen: new Date(error.lastSeen),
        resolvedAt: error.resolvedAt ? new Date(error.resolvedAt) : undefined,
      })))
    } catch (err) {
      console.error('Errors fetch error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }, [searchQuery, selectedSeverity, selectedCategory, showResolved])

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      await Promise.all([fetchAnalytics(), fetchErrors()])
      setError(null)
    } catch (err) {
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [fetchAnalytics, fetchErrors])

  // Set up auto-refresh
  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, refreshInterval)
    return () => clearInterval(interval)
  }, [fetchData, refreshInterval])

  // Resolve error
  const resolveError = async (errorId: string) => {
    try {
      const response = await fetch('/api/debug/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resolve',
          errorId,
        }),
      })

      if (!response.ok) throw new Error('Failed to resolve error')
      
      // Refresh data
      await fetchData()
    } catch (err) {
      console.error('Error resolution failed:', err)
    }
  }

  const getSeverityColor = (severity: ErrorSeverity): string => {
    switch (severity) {
      case ErrorSeverity.LOW: return 'text-blue-600 bg-blue-100'
      case ErrorSeverity.MEDIUM: return 'text-yellow-600 bg-yellow-100'
      case ErrorSeverity.HIGH: return 'text-orange-600 bg-orange-100'
      case ErrorSeverity.CRITICAL: return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getCategoryColor = (category: ErrorCategory): string => {
    const colors = {
      [ErrorCategory.CLIENT]: 'text-purple-600 bg-purple-100',
      [ErrorCategory.SERVER]: 'text-red-600 bg-red-100',
      [ErrorCategory.DATABASE]: 'text-blue-600 bg-blue-100',
      [ErrorCategory.EXTERNAL]: 'text-green-600 bg-green-100',
      [ErrorCategory.SECURITY]: 'text-red-800 bg-red-200',
      [ErrorCategory.PERFORMANCE]: 'text-yellow-600 bg-yellow-100',
      [ErrorCategory.VALIDATION]: 'text-indigo-600 bg-indigo-100',
      [ErrorCategory.BUSINESS_LOGIC]: 'text-teal-600 bg-teal-100',
    }
    return colors[category] || 'text-gray-600 bg-gray-100'
  }

  const formatTimeAgo = (date: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white p-4 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Error Dashboard</h2>
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

      {/* Error Message */}
      {error && (
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
            </div>
          </div>
        </div>
      )}

      {/* Analytics Summary */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Total Errors</div>
            <div className="text-2xl font-bold text-gray-900">{analytics.totalErrors.toLocaleString()}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Error Rate</div>
            <div className="text-2xl font-bold text-red-600">{analytics.errorRate.toFixed(1)}/min</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Affected Users</div>
            <div className="text-2xl font-bold text-orange-600">{analytics.affectedUsers.toLocaleString()}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Critical Errors</div>
            <div className="text-2xl font-bold text-red-800">
              {analytics.errorsBySeverity[ErrorSeverity.CRITICAL] || 0}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search error messages..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
            <select 
              multiple
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(Array.from(e.target.selectedOptions, o => o.value as ErrorSeverity))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              {Object.values(ErrorSeverity).map(severity => (
                <option key={severity} value={severity}>{severity.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select 
              multiple
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(Array.from(e.target.selectedOptions, o => o.value as ErrorCategory))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              {Object.values(ErrorCategory).map(category => (
                <option key={category} value={category}>{category.replace('_', ' ').toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-4 pt-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showResolved}
                onChange={(e) => setShowResolved(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Show resolved</span>
            </label>
          </div>
        </div>
      </div>

      {/* Errors List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Errors</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {errors.map((error) => (
            <div key={error.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(error.severity)}`}>
                      {error.severity.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(error.category)}`}>
                      {error.category.replace('_', ' ').toUpperCase()}
                    </span>
                    {error.resolved && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium text-green-600 bg-green-100">
                        RESOLVED
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      Count: {error.count}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    {error.name}: {error.message}
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>First: {formatTimeAgo(error.firstSeen)}</span>
                    <span>Last: {formatTimeAgo(error.lastSeen)}</span>
                    <span>ID: {error.id}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => setSelectedError(error)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Details
                  </button>
                  {!error.resolved && (
                    <button
                      onClick={() => resolveError(error.id)}
                      className="text-sm text-green-600 hover:text-green-800"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error Detail Modal */}
      {selectedError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Error Details</h3>
              <button
                onClick={() => setSelectedError(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <div className="mt-1 text-sm text-gray-900">{selectedError.message}</div>
                </div>
                
                {selectedError.stack && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stack Trace</label>
                    <pre className="mt-1 text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                      {selectedError.stack}
                    </pre>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Severity</label>
                    <div className="mt-1 text-sm text-gray-900">{selectedError.severity}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <div className="mt-1 text-sm text-gray-900">{selectedError.category}</div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Context</label>
                  <pre className="mt-1 text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                    {JSON.stringify(selectedError.context, null, 2)}
                  </pre>
                </div>
                
                {selectedError.tags.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tags</label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedError.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}