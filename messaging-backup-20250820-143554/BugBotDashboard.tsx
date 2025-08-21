/**
 * CoreFlow360 - Bug Bot Dashboard
 * Comprehensive bug management interface with real-time monitoring
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bug,
  AlertTriangle,
  CheckCircle,
  Clock,
  Play,
  Pause,
  RefreshCw,
  Filter,
  Search,
  Download,
  Upload,
  Settings,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Shield,
  Database,
  Code,
  Monitor,
  Users,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react'
import { bugBot, type BugReport, type BugCategory, type BugStatus } from '@/lib/bug-bot/bug-bot'

// ============================================================================
// TYPES
// ============================================================================

interface BugStatistics {
  total: number
  byStatus: Record<BugStatus, number>
  bySeverity: Record<string, number>
  byCategory: Record<BugCategory, number>
  averageResolutionTime: number
}

interface BugFilters {
  status?: BugStatus
  severity?: string
  category?: BugCategory
  search?: string
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function BugBotDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [isRunning, setIsRunning] = useState(false)
  const [bugs, setBugs] = useState<BugReport[]>([])
  const [statistics, setStatistics] = useState<BugStatistics | null>(null)
  const [selectedBug, setSelectedBug] = useState<BugReport | null>(null)
  const [filters, setFilters] = useState<BugFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  const [showBugDetails, setShowBugDetails] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    initializeDashboard()
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  }, [])

  useEffect(() => {
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (isRunning) {
        refreshData()
      }
    }, 30000)

    setRefreshInterval(interval)
    return () => clearInterval(interval)
  }, [isRunning])

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  const initializeDashboard = async () => {
    try {
      setIsLoading(true)

      // Start bug bot
      await startBugBot()

      // Load initial data
      await Promise.all([loadBugs(), loadStatistics()])
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const loadBugs = async () => {
    try {
      const response = await fetch('/api/bug-bot/bugs')
      const data = await response.json()

      if (data.success) {
        setBugs(data.bugs)
      }
    } catch (error) {}
  }

  const loadStatistics = async () => {
    try {
      const response = await fetch('/api/bug-bot/statistics')
      const data = await response.json()

      if (data.success) {
        setStatistics(data.statistics)
      }
    } catch (error) {}
  }

  const refreshData = async () => {
    await Promise.all([loadBugs(), loadStatistics()])
  }

  // ============================================================================
  // BUG BOT CONTROLS
  // ============================================================================

  const startBugBot = async () => {
    try {
      const response = await fetch('/api/bug-bot/start', { method: 'POST' })
      const data = await response.json()

      if (data.success) {
        setIsRunning(true)
      }
    } catch (error) {}
  }

  const stopBugBot = async () => {
    try {
      const response = await fetch('/api/bug-bot/stop', { method: 'POST' })
      const data = await response.json()

      if (data.success) {
        setIsRunning(false)
      }
    } catch (error) {}
  }

  // ============================================================================
  // FILTERING
  // ============================================================================

  const filteredBugs = bugs.filter((bug) => {
    if (filters.status && bug.status !== filters.status) return false
    if (filters.severity && bug.severity !== filters.severity) return false
    if (filters.category && bug.category !== filters.category) return false
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      return (
        bug.title.toLowerCase().includes(searchLower) ||
        bug.description.toLowerCase().includes(searchLower) ||
        bug.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      )
    }
    return true
  })

  const updateFilter = (key: keyof BugFilters, value: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const clearFilters = () => {
    setFilters({})
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  const getSeverityColor = (_severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'HIGH':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'LOW':
        return 'text-green-600 bg-green-50 border-green-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusColor = (_status: BugStatus) => {
    switch (status) {
      case 'NEW':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'TRIAGED':
        return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'IN_PROGRESS':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'REVIEW':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'TESTING':
        return 'text-indigo-600 bg-indigo-50 border-indigo-200'
      case 'RESOLVED':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'VERIFIED':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200'
      case 'CLOSED':
        return 'text-gray-600 bg-gray-50 border-gray-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getCategoryIcon = (_category: BugCategory) => {
    switch (category) {
      case 'UI_UX':
        return <Eye className="h-4 w-4" />
      case 'API':
        return <Code className="h-4 w-4" />
      case 'DATABASE':
        return <Database className="h-4 w-4" />
      case 'PERFORMANCE':
        return <Activity className="h-4 w-4" />
      case 'SECURITY':
        return <Shield className="h-4 w-4" />
      case 'AI_ML':
        return <Zap className="h-4 w-4" />
      case 'CONSCIOUSNESS':
        return <Monitor className="h-4 w-4" />
      default:
        return <Bug className="h-4 w-4" />
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bug Bot Dashboard</h1>
            <p className="mt-2 text-gray-600">Automated bug detection and management system</p>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={refreshData}
              className="flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 hover:bg-gray-50"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </button>

            <button
              onClick={isRunning ? stopBugBot : startBugBot}
              className={`flex items-center rounded-lg px-4 py-2 ${
                isRunning
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Stop Bot
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Bot
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="mt-4 flex items-center space-x-4">
          <div
            className={`flex items-center rounded-full px-3 py-1 text-sm ${
              isRunning ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            <div
              className={`mr-2 h-2 w-2 rounded-full ${isRunning ? 'bg-green-500' : 'bg-red-500'}`}
            ></div>
            {isRunning ? 'Bot Running' : 'Bot Stopped'}
          </div>

          <div className="text-sm text-gray-600">{bugs.length} active bugs</div>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Bugs"
            value={statistics.total}
            icon={<Bug className="h-6 w-6" />}
            color="blue"
          />
          <StatCard
            title="Critical Issues"
            value={statistics.bySeverity.CRITICAL || 0}
            icon={<AlertTriangle className="h-6 w-6" />}
            color="red"
          />
          <StatCard
            title="Resolved"
            value={statistics.byStatus.RESOLVED || 0}
            icon={<CheckCircle className="h-6 w-6" />}
            color="green"
          />
          <StatCard
            title="Avg Resolution Time"
            value={`${Math.round(statistics.averageResolutionTime / 60)}h`}
            icon={<Clock className="h-6 w-6" />}
            color="purple"
          />
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <Filter className="mr-2 h-4 w-4" />
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Search</label>
                  <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search bugs..."
                      value={filters.search || ''}
                      onChange={(e) => updateFilter('search', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 pl-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => updateFilter('status', e.target.value || undefined)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="NEW">New</option>
                    <option value="TRIAGED">Triaged</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="REVIEW">Review</option>
                    <option value="TESTING">Testing</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Severity</label>
                  <select
                    value={filters.severity || ''}
                    onChange={(e) => updateFilter('severity', e.target.value || undefined)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Severities</option>
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={filters.category || ''}
                    onChange={(e) => updateFilter('category', e.target.value || undefined)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Categories</option>
                    <option value="UI_UX">UI/UX</option>
                    <option value="API">API</option>
                    <option value="DATABASE">Database</option>
                    <option value="PERFORMANCE">Performance</option>
                    <option value="SECURITY">Security</option>
                    <option value="AI_ML">AI/ML</option>
                    <option value="CONSCIOUSNESS">Consciousness</option>
                    <option value="BUSINESS_LOGIC">Business Logic</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  Clear Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bugs List */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Bugs ({filteredBugs.length})</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredBugs.map((bug) => (
            <BugListItem
              key={bug.id}
              bug={bug}
              onSelect={() => {
                setSelectedBug(bug)
                setShowBugDetails(true)
              }}
            />
          ))}
        </div>

        {filteredBugs.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Bug className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="text-gray-500">No bugs found</p>
          </div>
        )}
      </div>

      {/* Bug Details Modal */}
      <AnimatePresence>
        {showBugDetails && selectedBug && (
          <BugDetailsModal
            bug={selectedBug}
            onClose={() => {
              setShowBugDetails(false)
              setSelectedBug(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: 'blue' | 'red' | 'green' | 'purple'
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`rounded-lg border p-3 ${colorClasses[color]}`}>{icon}</div>
      </div>
    </div>
  )
}

interface BugListItemProps {
  bug: BugReport
  onSelect: () => void
}

function BugListItem({ bug, onSelect }: BugListItemProps) {
  return (
    <div className="cursor-pointer px-6 py-4 hover:bg-gray-50" onClick={onSelect}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <div
              className={`rounded-full border px-2 py-1 text-xs font-medium ${getSeverityColor(bug.severity)}`}
            >
              {bug.severity}
            </div>
            <div
              className={`rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor(bug.status)}`}
            >
              {bug.status.replace('_', ' ')}
            </div>
            <div className="flex items-center text-gray-500">
              {getCategoryIcon(bug.category)}
              <span className="ml-1 text-xs">{bug.category.replace('_', ' ')}</span>
            </div>
          </div>

          <h3 className="mt-2 text-lg font-medium text-gray-900">{bug.title}</h3>
          <p className="mt-1 line-clamp-2 text-gray-600">{bug.description}</p>

          <div className="mt-3 flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {new Date(bug.createdAt).toLocaleDateString()}
            </span>
            {bug.tags.length > 0 && (
              <div className="flex space-x-1">
                {bug.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                    {tag}
                  </span>
                ))}
                {bug.tags.length > 3 && (
                  <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                    +{bug.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <ExternalLink className="h-4 w-4 text-gray-400" />
      </div>
    </div>
  )
}

interface BugDetailsModalProps {
  bug: BugReport
  onClose: () => void
}

function BugDetailsModal({ bug, onClose }: BugDetailsModalProps) {
  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="mx-4 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">Bug Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Basic Information */}
            <div>
              <h3 className="mb-4 text-lg font-medium text-gray-900">Basic Information</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <p className="mt-1 text-gray-900">{bug.title}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-gray-900">{bug.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Severity</label>
                    <div
                      className={`mt-1 inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getSeverityColor(bug.severity)}`}
                    >
                      {bug.severity}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div
                      className={`mt-1 inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor(bug.status)}`}
                    >
                      {bug.status.replace('_', ' ')}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <div className="mt-1 flex items-center">
                    {getCategoryIcon(bug.category)}
                    <span className="ml-2 text-gray-900">{bug.category.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Details */}
            <div>
              <h3 className="mb-4 text-lg font-medium text-gray-900">Technical Details</h3>

              <div className="space-y-4">
                {bug.technicalDetails.errorMessage && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Error Message</label>
                    <p className="mt-1 rounded bg-red-50 p-2 text-sm text-red-600">
                      {bug.technicalDetails.errorMessage}
                    </p>
                  </div>
                )}

                {bug.technicalDetails.componentName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Component</label>
                    <p className="mt-1 text-gray-900">{bug.technicalDetails.componentName}</p>
                  </div>
                )}

                {bug.technicalDetails.apiEndpoint && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">API Endpoint</label>
                    <p className="mt-1 font-mono text-sm text-gray-900">
                      {bug.technicalDetails.apiEndpoint}
                    </p>
                  </div>
                )}

                {bug.aiAnalysis && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">AI Analysis</label>
                    <div className="mt-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Confidence:</span>
                        <span className="text-sm font-medium">
                          {Math.round(bug.aiAnalysis.confidence * 100)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Complexity:</span>
                        <span className="text-sm font-medium">{bug.aiAnalysis.complexity}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Est. Resolution:</span>
                        <span className="text-sm font-medium">
                          {Math.round(bug.aiAnalysis.estimatedResolutionTime / 60)}h
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Business Impact */}
          {bug.businessImpact && (
            <div className="mt-6">
              <h3 className="mb-4 text-lg font-medium text-gray-900">Business Impact</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {bug.businessImpact.affectedUsers && (
                  <div className="rounded-lg bg-gray-50 p-4">
                    <div className="flex items-center">
                      <Users className="mr-2 h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Affected Users</span>
                    </div>
                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {bug.businessImpact.affectedUsers}
                    </p>
                  </div>
                )}

                {bug.businessImpact.revenueImpact && (
                  <div className="rounded-lg bg-gray-50 p-4">
                    <div className="flex items-center">
                      <DollarSign className="mr-2 h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Revenue Impact</span>
                    </div>
                    <div
                      className={`mt-1 inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getSeverityColor(bug.businessImpact.revenueImpact)}`}
                    >
                      {bug.businessImpact.revenueImpact}
                    </div>
                  </div>
                )}

                {bug.businessImpact.customerImpact && (
                  <div className="rounded-lg bg-gray-50 p-4">
                    <div className="flex items-center">
                      <AlertTriangle className="mr-2 h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Customer Impact</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {bug.businessImpact.customerImpact}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {bug.tags.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-4 text-lg font-medium text-gray-900">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {bug.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 border-t border-gray-200 px-6 py-4">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-900">
            Close
          </button>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Edit Bug
          </button>
        </div>
      </motion.div>
    </div>
  )
}
