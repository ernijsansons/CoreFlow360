'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  EyeIcon,
  ClockIcon,
  MapPinIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  ArrowTrendingDownIcon as TrendingDownIcon,
  BellIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  CameraIcon,
  MicrophoneIcon,
  StopIcon,
  PlayIcon,
  ArrowRightIcon,
  FlagIcon,
} from '@heroicons/react/24/outline'

interface RepActivity {
  id: string
  repId: string
  repName: string
  status: 'active_visit' | 'traveling' | 'idle' | 'offline'
  currentLocation: {
    latitude: number
    longitude: number
    address: string
    timestamp: string
  }
  currentVisit?: {
    customerId: string
    customerName: string
    visitStarted: string
    visitDuration: number
    activitiesCompleted: number
    notesQuality: number
    performanceScore: number
  }
  todayMetrics: {
    visitsCompleted: number
    visitsPlanned: number
    customerFaceTime: number // minutes
    travelTime: number // minutes
    idleTime: number // minutes
    milesTravel: number
    efficiency: number // 0-1
    revenueGenerated: number
  }
  behaviorPatterns: {
    avgVisitDuration: number
    visitQuality: number
    punctuality: number // 0-1
    notesTaking: number // 0-1
    followUpSpeed: number // 0-1
  }
  alerts: Array<{
    type: 'efficiency' | 'behavior' | 'opportunity' | 'compliance'
    message: string
    severity: 'low' | 'medium' | 'high'
    timestamp: string
  }>
}

interface EfficiencyInsight {
  repId: string
  repName: string
  insight: string
  category: 'time_waste' | 'travel_optimization' | 'visit_quality' | 'follow_up'
  impact: 'high' | 'medium' | 'low'
  recommendation: string
  potentialSavings: {
    timeMinutes?: number
    revenue?: number
    efficiency?: number
  }
}

interface ManagerEfficiencyDashboardProps {
  managerId: string
  tenantId: string
  teamMembers: string[]
  className?: string
}

export default function ManagerEfficiencyDashboard({
  managerId,
  tenantId,
  teamMembers,
  className = '',
}: ManagerEfficiencyDashboardProps) {
  const [repActivities, setRepActivities] = useState<RepActivity[]>([])
  const [efficiencyInsights, setEfficiencyInsights] = useState<EfficiencyInsight[]>([])
  const [selectedRep, setSelectedRep] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<
    'overview' | 'live_tracking' | 'efficiency' | 'coaching'
  >('overview')
  const [coachingMode, setCoachingMode] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRepActivities()
    generateEfficiencyInsights()

    // Real-time updates every 30 seconds
    const interval = setInterval(() => {
      updateRealTimeData()
    }, 30000)

    return () => clearInterval(interval)
  }, [teamMembers])

  const loadRepActivities = async () => {
    try {
      setLoading(true)

      // Simulate loading rep activities
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const mockActivities: RepActivity[] = [
        {
          id: 'rep-1',
          repId: 'user-1',
          repName: 'Alex Morgan',
          status: 'active_visit',
          currentLocation: {
            latitude: 40.7589,
            longitude: -73.9851,
            address: '123 TechFlow Solutions, NYC',
            timestamp: new Date().toISOString(),
          },
          currentVisit: {
            customerId: 'customer-1',
            customerName: 'TechFlow Solutions',
            visitStarted: new Date(Date.now() - 2700000).toISOString(), // 45 minutes ago
            visitDuration: 45,
            activitiesCompleted: 3,
            notesQuality: 85,
            performanceScore: 88,
          },
          todayMetrics: {
            visitsCompleted: 2,
            visitsPlanned: 5,
            customerFaceTime: 135, // 2h 15m
            travelTime: 45,
            idleTime: 20,
            milesTravel: 15.2,
            efficiency: 0.75,
            revenueGenerated: 125000,
          },
          behaviorPatterns: {
            avgVisitDuration: 65,
            visitQuality: 0.88,
            punctuality: 0.92,
            notesTaking: 0.85,
            followUpSpeed: 0.78,
          },
          alerts: [
            {
              type: 'efficiency',
              message: 'Visit duration 15 minutes over optimal - consider time management',
              severity: 'medium',
              timestamp: new Date(Date.now() - 300000).toISOString(),
            },
            {
              type: 'opportunity',
              message: 'Customer showing strong buying signals - suggest closing techniques',
              severity: 'high',
              timestamp: new Date(Date.now() - 600000).toISOString(),
            },
          ],
        },
        {
          id: 'rep-2',
          repId: 'user-2',
          repName: 'Jordan Lee',
          status: 'traveling',
          currentLocation: {
            latitude: 40.7505,
            longitude: -73.9934,
            address: 'En route to DataStream Corp',
            timestamp: new Date().toISOString(),
          },
          todayMetrics: {
            visitsCompleted: 3,
            visitsPlanned: 4,
            customerFaceTime: 180, // 3h
            travelTime: 65,
            idleTime: 5,
            milesTravel: 22.8,
            efficiency: 0.82,
            revenueGenerated: 95000,
          },
          behaviorPatterns: {
            avgVisitDuration: 58,
            visitQuality: 0.91,
            punctuality: 0.95,
            notesTaking: 0.92,
            followUpSpeed: 0.88,
          },
          alerts: [
            {
              type: 'compliance',
              message: 'Remember to log visit notes within 30 minutes of completion',
              severity: 'low',
              timestamp: new Date(Date.now() - 900000).toISOString(),
            },
          ],
        },
        {
          id: 'rep-3',
          repId: 'user-3',
          repName: 'Sam Wilson',
          status: 'idle',
          currentLocation: {
            latitude: 40.7282,
            longitude: -73.7949,
            address: 'Coffee Shop - Queens',
            timestamp: new Date().toISOString(),
          },
          todayMetrics: {
            visitsCompleted: 1,
            visitsPlanned: 4,
            customerFaceTime: 45,
            travelTime: 35,
            idleTime: 75, // 1h 15m idle time
            milesTravel: 12.1,
            efficiency: 0.42,
            revenueGenerated: 0,
          },
          behaviorPatterns: {
            avgVisitDuration: 45,
            visitQuality: 0.65,
            punctuality: 0.72,
            notesTaking: 0.58,
            followUpSpeed: 0.45,
          },
          alerts: [
            {
              type: 'efficiency',
              message: 'Excessive idle time detected - 75 minutes unproductive today',
              severity: 'high',
              timestamp: new Date(Date.now() - 600000).toISOString(),
            },
            {
              type: 'behavior',
              message: 'Below target visits for the day - recommend immediate action',
              severity: 'high',
              timestamp: new Date(Date.now() - 1200000).toISOString(),
            },
          ],
        },
      ]

      setRepActivities(mockActivities)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const generateEfficiencyInsights = async () => {
    // AI-powered efficiency analysis
    const insights: EfficiencyInsight[] = [
      {
        repId: 'user-1',
        repName: 'Alex Morgan',
        insight: 'Visit durations consistently 20% longer than team average',
        category: 'visit_quality',
        impact: 'medium',
        recommendation: 'Implement time boxing techniques and agenda-driven meetings',
        potentialSavings: {
          timeMinutes: 60,
          efficiency: 0.15,
        },
      },
      {
        repId: 'user-3',
        repName: 'Sam Wilson',
        insight: 'High idle time correlation with low productivity days',
        category: 'time_waste',
        impact: 'high',
        recommendation: 'Implement GPS-based accountability and real-time coaching',
        potentialSavings: {
          timeMinutes: 180,
          revenue: 45000,
          efficiency: 0.35,
        },
      },
      {
        repId: 'user-2',
        repName: 'Jordan Lee',
        insight: 'Suboptimal travel routes increasing fuel costs by 25%',
        category: 'travel_optimization',
        impact: 'medium',
        recommendation: 'Use AI route optimization and cluster nearby visits',
        potentialSavings: {
          timeMinutes: 45,
          efficiency: 0.12,
        },
      },
    ]

    setEfficiencyInsights(insights)
  }

  const updateRealTimeData = () => {
    // Update rep locations and metrics in real-time
    setRepActivities((prev) =>
      prev.map((rep) => ({
        ...rep,
        currentLocation: {
          ...rep.currentLocation,
          timestamp: new Date().toISOString(),
        },
        currentVisit: rep.currentVisit
          ? {
              ...rep.currentVisit,
              visitDuration: Math.floor(
                (Date.now() - new Date(rep.currentVisit.visitStarted).getTime()) / 60000
              ),
            }
          : undefined,
      }))
    )
  }

  const sendCoachingMessage = (_repId: string, _message: string) => {
    // Real-time coaching message to rep
    // In production, this would use WebSocket or push notification
  }

  const triggerIntervention = (repId: string, type: 'call' | 'message' | 'alert') => {
    const rep = repActivities.find((r) => r.repId === repId)
    if (!rep) return

    switch (type) {
      case 'call':
        break
      case 'message':
        sendCoachingMessage(repId, 'Please check in - efficiency metrics need attention')
        break
      case 'alert':
        break
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active_visit':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'traveling':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'idle':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'offline':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className={`rounded-lg bg-white p-8 shadow-lg ${className}`}>
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="font-medium text-gray-600">Loading team performance data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="rounded-lg bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="flex items-center text-2xl font-bold text-gray-900">
              <EyeIcon className="mr-3 h-8 w-8 text-red-600" />
              Manager Efficiency Dashboard
            </h2>
            <p className="mt-1 text-gray-600">Real-time team performance monitoring and coaching</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="inline-flex rounded-lg shadow-sm">
              {(['overview', 'live_tracking', 'efficiency', 'coaching'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`border px-4 py-2 text-sm font-medium ${
                    viewMode === mode
                      ? 'border-red-600 bg-red-600 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  } ${mode === 'overview' ? 'rounded-l-lg' : mode === 'coaching' ? 'rounded-r-lg' : ''}`}
                >
                  {mode.charAt(0).toUpperCase() + mode.replace('_', ' ').slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team Overview */}
      {viewMode === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center">
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Reps</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {repActivities.filter((r) => r.status !== 'offline').length}/
                    {repActivities.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center">
                <ClockIcon className="h-6 w-6 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Efficiency</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(
                      (repActivities.reduce((acc, rep) => acc + rep.todayMetrics.efficiency, 0) /
                        repActivities.length) *
                        100
                    )}
                    %
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Revenue Today</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(
                      repActivities.reduce((acc, rep) => acc + rep.todayMetrics.revenueGenerated, 0)
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {repActivities.reduce(
                      (acc, rep) => acc + rep.alerts.filter((a) => a.severity === 'high').length,
                      0
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Rep Performance Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {repActivities.map((rep) => (
              <motion.div
                key={rep.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-lg bg-white shadow-lg"
              >
                {/* Rep Header */}
                <div
                  className={`p-4 ${rep.status === 'idle' ? 'border-b border-red-200 bg-red-50' : 'border-b border-gray-200 bg-gray-50'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{rep.repName}</h3>
                      <div className="mt-1 flex items-center space-x-2">
                        <span
                          className={`rounded-full border px-2 py-1 text-xs ${getStatusColor(rep.status)}`}
                        >
                          {rep.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(rep.currentLocation.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-2xl font-bold ${rep.todayMetrics.efficiency > 0.7 ? 'text-green-600' : rep.todayMetrics.efficiency > 0.5 ? 'text-yellow-600' : 'text-red-600'}`}
                      >
                        {Math.round(rep.todayMetrics.efficiency * 100)}%
                      </div>
                      <div className="text-xs text-gray-500">Efficiency</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-4">
                  {/* Current Activity */}
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-gray-700">Current Location</h4>
                    <p className="text-sm text-gray-600">{rep.currentLocation.address}</p>
                    {rep.currentVisit && (
                      <div className="mt-2 rounded bg-green-50 p-2">
                        <p className="text-sm font-medium text-green-800">
                          {rep.currentVisit.customerName}
                        </p>
                        <p className="text-xs text-green-600">
                          Visit duration: {rep.currentVisit.visitDuration}m • Score:{' '}
                          {rep.currentVisit.performanceScore}/100
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Today's Metrics */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded bg-blue-50 p-2 text-center">
                      <div className="font-bold text-blue-600">
                        {rep.todayMetrics.visitsCompleted}/{rep.todayMetrics.visitsPlanned}
                      </div>
                      <div className="text-xs text-gray-600">Visits</div>
                    </div>
                    <div className="rounded bg-green-50 p-2 text-center">
                      <div className="font-bold text-green-600">
                        {formatDuration(rep.todayMetrics.customerFaceTime)}
                      </div>
                      <div className="text-xs text-gray-600">Customer Time</div>
                    </div>
                    <div className="rounded bg-yellow-50 p-2 text-center">
                      <div className="font-bold text-yellow-600">
                        {formatDuration(rep.todayMetrics.travelTime)}
                      </div>
                      <div className="text-xs text-gray-600">Travel Time</div>
                    </div>
                    <div className="rounded bg-purple-50 p-2 text-center">
                      <div className="font-bold text-purple-600">
                        {formatCurrency(rep.todayMetrics.revenueGenerated)}
                      </div>
                      <div className="text-xs text-gray-600">Revenue</div>
                    </div>
                  </div>

                  {/* Alerts */}
                  {rep.alerts.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-sm font-medium text-gray-700">Active Alerts</h4>
                      <div className="space-y-2">
                        {rep.alerts.slice(0, 2).map((alert, idx) => (
                          <div
                            key={idx}
                            className={`rounded border p-2 text-xs ${getSeverityColor(alert.severity)}`}
                          >
                            <div className="font-medium">
                              {alert.type.replace('_', ' ').toUpperCase()}
                            </div>
                            <div>{alert.message}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="flex items-center justify-between border-t border-gray-200 pt-2">
                    <button
                      onClick={() => setSelectedRep(rep.repId)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View Details
                    </button>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => triggerIntervention(rep.repId, 'message')}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Send Message"
                      >
                        <ChatBubbleLeftRightIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => triggerIntervention(rep.repId, 'call')}
                        className="p-1 text-gray-400 hover:text-green-600"
                        title="Call Rep"
                      >
                        <PhoneIcon className="h-4 w-4" />
                      </button>
                      {rep.alerts.some((a) => a.severity === 'high') && (
                        <button
                          onClick={() => triggerIntervention(rep.repId, 'alert')}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Priority Alert"
                        >
                          <BellIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Efficiency Insights */}
      {viewMode === 'efficiency' && (
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h3 className="mb-6 flex items-center text-lg font-semibold">
            <ChartBarIcon className="mr-2 h-5 w-5 text-orange-600" />
            AI Efficiency Analysis
          </h3>

          <div className="space-y-6">
            {efficiencyInsights.map((insight, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="rounded-lg border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center space-x-3">
                      <h4 className="font-semibold text-gray-900">{insight.repName}</h4>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs ${
                          insight.impact === 'high'
                            ? 'border-red-200 bg-red-100 text-red-800'
                            : insight.impact === 'medium'
                              ? 'border-yellow-200 bg-yellow-100 text-yellow-800'
                              : 'border-blue-200 bg-blue-100 text-blue-800'
                        }`}
                      >
                        {insight.impact.toUpperCase()} IMPACT
                      </span>
                      <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-800">
                        {insight.category.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <p className="mb-3 text-gray-700">{insight.insight}</p>

                    <div className="mb-3 rounded border border-blue-200 bg-blue-50 p-3">
                      <p className="text-sm text-blue-800">
                        <strong>Recommendation:</strong> {insight.recommendation}
                      </p>
                    </div>

                    {insight.potentialSavings && (
                      <div className="flex items-center space-x-4 text-sm">
                        {insight.potentialSavings.timeMinutes && (
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="h-4 w-4 text-green-600" />
                            <span className="text-green-700">
                              Save {insight.potentialSavings.timeMinutes} min/day
                            </span>
                          </div>
                        )}
                        {insight.potentialSavings.revenue && (
                          <div className="flex items-center space-x-1">
                            <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
                            <span className="text-green-700">
                              +{formatCurrency(insight.potentialSavings.revenue)} potential
                            </span>
                          </div>
                        )}
                        {insight.potentialSavings.efficiency && (
                          <div className="flex items-center space-x-1">
                            <TrendingUpIcon className="h-4 w-4 text-green-600" />
                            <span className="text-green-700">
                              +{Math.round(insight.potentialSavings.efficiency * 100)}% efficiency
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex items-center space-x-2">
                    <button
                      onClick={() => sendCoachingMessage(insight.repId, insight.recommendation)}
                      className="rounded bg-blue-100 px-4 py-2 text-sm text-blue-800 hover:bg-blue-200"
                    >
                      Send Coaching
                    </button>
                    <button
                      onClick={() => triggerIntervention(insight.repId, 'call')}
                      className="rounded bg-green-100 px-4 py-2 text-sm text-green-800 hover:bg-green-200"
                    >
                      Discuss Now
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Big Brother Privacy Notice */}
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-center space-x-2 text-red-800">
          <EyeIcon className="h-5 w-5" />
          <span className="text-sm font-medium">Performance Monitoring Active</span>
        </div>
        <p className="mt-1 text-xs text-red-700">
          Real-time location tracking, behavior analysis, and efficiency monitoring enabled for all
          team members. Data is used for coaching, performance improvement, and compliance purposes.
        </p>
      </div>
    </div>
  )
}
