'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Clock,
  Star,
  Zap,
  Award,
  Activity,
  Calendar,
  MessageSquare,
  Bell,
  Settings,
  ChevronDown,
  Plus,
  Filter,
  Search,
  RefreshCw,
  Eye,
  Heart,
  Share2,
  Bookmark,
} from 'lucide-react'
import GamificationHub from '../ui/GamificationHub'
import { DataFreshnessIndicator } from '../ui/DataFreshnessIndicator'
import {
  cacheDashboardData,
  warmDashboardCache,
  DASHBOARD_CACHE_CONFIGS,
} from '@/lib/cache/smart-cache'
import { paymentAnalytics } from '@/lib/billing/payment-analytics'
import { eventTracker } from '@/lib/events/enhanced-event-tracker'
import { useEnhancedTracking } from '@/hooks/useEnhancedTracking'
import { useSession } from 'next-auth/react'

interface MetricCard {
  id: string
  title: string
  value: string | number
  change: number
  icon: React.ElementType
  color: string
  format: 'number' | 'currency' | 'percentage'
  trend: 'up' | 'down' | 'neutral'
  sparklineData?: number[]
}

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ElementType
  color: string
  onClick: () => void
  popular?: boolean
}

interface ActivityItem {
  id: string
  type: 'achievement' | 'milestone' | 'collaboration' | 'goal'
  title: string
  description: string
  timestamp: Date
  user?: string
  avatar?: string
  points?: number
}

export default function ModernDashboard() {
  const { data: session } = useSession()
  const { track, trackUserJourney } = useEnhancedTracking()
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d')
  const [showGamification, setShowGamification] = useState(false)
  const [metrics, setMetrics] = useState<MetricCard[]>([])
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [notifications, setNotifications] = useState(3)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [dashboardData, setDashboardData] = useState<{
    data: unknown
    cachedAt: Date
    expiresAt: Date
    isStale: boolean
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const timeRanges = [
    { id: '1d', label: 'Today' },
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' },
  ]

  const mockMetrics: MetricCard[] = [
    {
      id: 'revenue',
      title: 'Revenue',
      value: 145820,
      change: 12.5,
      icon: DollarSign,
      color: 'text-green-400',
      format: 'currency',
      trend: 'up',
      sparklineData: [100, 120, 115, 145, 160, 155, 175],
    },
    {
      id: 'deals',
      title: 'Active Deals',
      value: 47,
      change: 8.3,
      icon: Target,
      color: 'text-blue-400',
      format: 'number',
      trend: 'up',
      sparklineData: [35, 42, 38, 45, 52, 48, 47],
    },
    {
      id: 'team_productivity',
      title: 'Team Productivity',
      value: 94.2,
      change: -2.1,
      icon: TrendingUp,
      color: 'text-violet-400',
      format: 'percentage',
      trend: 'down',
      sparklineData: [88, 91, 95, 97, 92, 96, 94.2],
    },
    {
      id: 'customer_satisfaction',
      title: 'Customer Satisfaction',
      value: 4.8,
      change: 0.3,
      icon: Star,
      color: 'text-yellow-400',
      format: 'number',
      trend: 'up',
      sparklineData: [4.2, 4.5, 4.3, 4.6, 4.7, 4.9, 4.8],
    },
  ]

  const quickActions: QuickAction[] = [
    {
      id: 'new_deal',
      title: 'New Deal',
      description: 'Create a new sales opportunity',
      icon: Plus,
      color: 'bg-gradient-to-r from-green-600 to-emerald-600',
      onClick: () => console.log('Create task'),
      popular: true,
    },
    {
      id: 'schedule_meeting',
      title: 'Schedule Meeting',
      description: 'Book time with your team',
      icon: Calendar,
      color: 'bg-gradient-to-r from-blue-600 to-cyan-600',
      onClick: () => console.log('Schedule meeting'),
    },
    {
      id: 'generate_report',
      title: 'Generate Report',
      description: 'Create performance insights',
      icon: BarChart3,
      color: 'bg-gradient-to-r from-purple-600 to-violet-600',
      onClick: () => console.log('Generate report'),
      popular: true,
    },
    {
      id: 'ai_assistant',
      title: 'AI Assistant',
      description: 'Get intelligent recommendations',
      icon: Zap,
      color: 'bg-gradient-to-r from-orange-600 to-red-600',
      onClick: () => console.log('AI assistant'),
    },
  ]

  const mockActivity: ActivityItem[] = [
    {
      id: '1',
      type: 'achievement',
      title: 'Achievement Unlocked: Team Player',
      description: 'You completed 50 collaborative projects',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      points: 300,
    },
    {
      id: '2',
      type: 'milestone',
      title: 'Sales Milestone Reached',
      description: '$500K revenue target achieved for Q1',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      user: 'Sarah Chen',
    },
    {
      id: '3',
      type: 'collaboration',
      title: 'New Team Member',
      description: 'Marcus Johnson joined your project team',
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      user: 'Marcus Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus',
    },
    {
      id: '4',
      type: 'goal',
      title: 'Daily Goal Completed',
      description: 'Completed all productivity goals for today',
      timestamp: new Date(Date.now() - 1000 * 60 * 180),
      points: 100,
    },
  ]

  // Load live dashboard data with caching
  const loadDashboardData = async (refresh: boolean = false) => {
    if (!session?.user?.tenantId) return

    try {
      setIsRefreshing(true)
      setError(null)

      // Track dashboard view
      await trackUserJourney('dashboard_view', true, {
        timeToComplete: Date.now() - performance.now(),
      })

      // Fetch live data with intelligent caching
      const [metricsData, analyticsData, activityData] = await Promise.all([
        cacheDashboardData(
          `metrics:${session.user.tenantId}:${selectedTimeRange}`,
          async () => {
            // Fetch real metrics from payment analytics
            const analytics = await paymentAnalytics.getPaymentAnalytics(
              selectedTimeRange === '1d' ? 'day' : selectedTimeRange === '7d' ? 'week' : 'month',
              session.user.tenantId
            )

            return {
              revenue: analytics.overview.totalRevenue,
              deals: Math.floor(analytics.overview.totalTransactions / 10), // Estimate active deals
              customers: Math.floor(
                analytics.overview.totalRevenue / analytics.overview.averageTransactionValue
              ),
              conversion: analytics.overview.conversionRate * 100,
              mrr: analytics.overview.mrr,
              churn: analytics.overview.churnRate * 100,
            }
          },
          DASHBOARD_CACHE_CONFIGS.REVENUE_METRICS
        ),

        cacheDashboardData(
          `analytics:${session.user.tenantId}:${selectedTimeRange}`,
          async () => {
            // Fetch analytics data
            const analytics = await eventTracker.getAnalytics(
              selectedTimeRange === '1d' ? 'hour' : 'day'
            )
            return analytics
          },
          DASHBOARD_CACHE_CONFIGS.ANALYTICS_REPORTS
        ),

        cacheDashboardData(
          `activity:${session.user.tenantId}:recent`,
          async () => {
            // Fetch recent activity - would come from real activity feed
            return [
              {
                id: '1',
                type: 'achievement',
                title: 'Payment Successfully Processed',
                description: `$${Math.floor(Math.random() * 1000 + 100)} payment received`,
                timestamp: new Date(Date.now() - Math.random() * 3600000),
                points: 50,
              },
              {
                id: '2',
                type: 'milestone',
                title: 'Revenue Milestone Reached',
                description: 'Monthly revenue target achieved',
                timestamp: new Date(Date.now() - Math.random() * 7200000),
                points: 100,
              },
            ]
          },
          DASHBOARD_CACHE_CONFIGS.USER_ACTIVITY
        ),
      ])

      // Convert to MetricCard format
      const liveMetrics: MetricCard[] = [
        {
          id: 'revenue',
          title: 'Revenue',
          value: metricsData.data.revenue,
          change: 12.5, // Calculate from historical data
          icon: DollarSign,
          color: 'text-green-400',
          format: 'currency',
          trend: 'up',
          sparklineData: [100, 120, 115, 145, 160, 155, 175], // Would come from historical data
        },
        {
          id: 'deals',
          title: 'Active Deals',
          value: metricsData.data.deals,
          change: 8.3,
          icon: Target,
          color: 'text-blue-400',
          format: 'number',
          trend: 'up',
          sparklineData: [35, 42, 38, 45, 52, 48, 47],
        },
        {
          id: 'customers',
          title: 'Customers',
          value: metricsData.data.customers,
          change: 15.2,
          icon: Users,
          color: 'text-purple-400',
          format: 'number',
          trend: 'up',
          sparklineData: [200, 220, 215, 240, 260, 255, 280],
        },
        {
          id: 'conversion',
          title: 'Conversion Rate',
          value: metricsData.data.conversion,
          change: -2.1,
          icon: TrendingUp,
          color: 'text-orange-400',
          format: 'percentage',
          trend: 'down',
          sparklineData: [15, 18, 16, 20, 22, 19, 17],
        },
      ]

      setMetrics(liveMetrics)
      setRecentActivity(activityData.data)

      // Store cached data info for freshness indicator
      setDashboardData({
        data: { metrics: liveMetrics, activity: activityData.data },
        cachedAt: metricsData.cachedAt,
        expiresAt: metricsData.expiresAt,
        isStale: metricsData.isStale,
      })

      // Track successful data load
      await track('dashboard_data_loaded', 'user_journey', {
        timeframe: selectedTimeRange,
        metricsCount: liveMetrics.length,
        activityCount: activityData.data.length,
        fromCache: !refresh,
      })
    } catch (error) {
      
      setError('Failed to load dashboard data')

      // Fallback to mock data
      setMetrics(mockMetrics)
      setRecentActivity(mockActivity)

      // Track error
      await track('dashboard_load_error', 'error_recovery', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timeframe: selectedTimeRange,
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  // Load data on mount and when timeframe changes
  useEffect(() => {
    loadDashboardData()
  }, [selectedTimeRange, session?.user?.tenantId])

  // Warm cache on component mount
  useEffect(() => {
    if (session?.user?.tenantId) {
      warmDashboardCache(session.user.tenantId)
    }
  }, [session?.user?.tenantId])

  // Handle manual refresh
  const handleRefresh = async () => {
    await loadDashboardData(true)
  }

  const formatValue = (value: string | number, format: string) => {
    if (typeof value === 'string') return value

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value)
      case 'percentage':
        return `${value.toFixed(1)}%`
      default:
        return value.toLocaleString()
    }
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return `${Math.floor(diffMins / 1440)}d ago`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-gray-800/50 bg-gray-900/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Good morning, <span className="gradient-text-ai">Alex</span> 👋
              </h1>
              <p className="text-gray-400">
                You're crushing your goals today! Keep up the momentum.
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Time Range Selector */}
              <div className="relative">
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="rounded-xl border border-gray-700/50 bg-gray-800/50 px-4 py-2 text-white focus:border-violet-500 focus:outline-none"
                >
                  {timeRanges.map((range) => (
                    <option key={range.id} value={range.id}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gamification Toggle */}
              <button
                onClick={() => setShowGamification(!showGamification)}
                className={`rounded-xl p-3 transition-all ${
                  showGamification
                    ? 'border border-violet-500/30 bg-violet-600/20 text-violet-400'
                    : 'border border-gray-700/50 bg-gray-800/50 text-gray-400 hover:text-gray-300'
                }`}
              >
                <Award className="h-5 w-5" />
              </button>

              {/* Notifications */}
              <button className="relative rounded-xl border border-gray-700/50 bg-gray-800/50 p-3 text-gray-400 transition-colors hover:text-gray-300">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                  >
                    {notifications}
                  </motion.div>
                )}
              </button>

              {/* Settings */}
              <button className="rounded-xl border border-gray-700/50 bg-gray-800/50 p-3 text-gray-400 transition-colors hover:text-gray-300">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Data Freshness Indicator */}
        {dashboardData && (
          <div className="mb-6">
            <DataFreshnessIndicator
              cachedAt={dashboardData.cachedAt}
              expiresAt={dashboardData.expiresAt}
              isStale={dashboardData.isStale}
              isRefreshing={isRefreshing}
              onRefresh={handleRefresh}
              variant="detailed"
              className="border-gray-700/50 bg-gray-800/30"
            />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-900/20 p-4 text-red-400">
            <p>{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-2 text-red-300 underline hover:text-red-200"
            >
              Try again
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {showGamification ? (
            <motion.div
              key="gamification"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <GamificationHub />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Key Metrics */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric, index) => (
                  <motion.div
                    key={metric.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative overflow-hidden rounded-2xl border border-gray-700/50 bg-gray-800/40 p-6 backdrop-blur-sm transition-all hover:border-gray-600/50"
                  >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
                    </div>

                    <div className="relative">
                      <div className="mb-4 flex items-center justify-between">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gray-700/50 ${metric.color}`}
                        >
                          <metric.icon className="h-6 w-6" />
                        </div>
                        <div
                          className={`flex items-center text-sm ${
                            metric.trend === 'up'
                              ? 'text-green-400'
                              : metric.trend === 'down'
                                ? 'text-red-400'
                                : 'text-gray-400'
                          }`}
                        >
                          <TrendingUp
                            className={`mr-1 h-4 w-4 ${
                              metric.trend === 'down' ? 'rotate-180' : ''
                            }`}
                          />
                          {Math.abs(metric.change)}%
                        </div>
                      </div>

                      <div className="mb-2">
                        <div className="mb-1 text-2xl font-bold text-white">
                          {formatValue(metric.value, metric.format)}
                        </div>
                        <div className="text-sm text-gray-400">{metric.title}</div>
                        {showAIInsights && aiInsights?.metrics.find(m => m.id === metric.id)?.insights && (
                          <div className="mt-2 text-xs text-gray-500">
                            {aiInsights.metrics.find(m => m.id === metric.id)?.insights[0]}
                          </div>
                        )}
                      </div>

                      {/* Mini Sparkline */}
                      {metric.sparklineData && (
                        <div className="flex h-8 items-end space-x-1 opacity-60 transition-opacity group-hover:opacity-100">
                          {metric.sparklineData.map((value, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ height: 0 }}
                              animate={{
                                height: `${(value / Math.max(...metric.sparklineData!)) * 100}%`,
                              }}
                              transition={{ delay: index * 0.1 + idx * 0.05 }}
                              className={`flex-1 bg-gradient-to-t ${
                                metric.trend === 'up'
                                  ? 'from-green-600 to-green-400'
                                  : metric.trend === 'down'
                                    ? 'from-red-600 to-red-400'
                                    : 'from-gray-600 to-gray-400'
                              } min-h-[2px] rounded-sm`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="grid gap-8 xl:grid-cols-3">
                {/* Quick Actions */}
                <div className="xl:col-span-2">
                  <div className="rounded-2xl border border-gray-700/50 bg-gray-800/40 p-6 backdrop-blur-sm">
                    <h3 className="mb-6 text-lg font-semibold text-white">Quick Actions</h3>

                    <div className="grid gap-4 md:grid-cols-2">
                      {quickActions.map((action, index) => (
                        <motion.button
                          key={action.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={action.onClick}
                          className="group relative overflow-hidden rounded-2xl p-6 text-left transition-all hover:scale-[1.02] focus:ring-2 focus:ring-violet-500/50 focus:outline-none"
                        >
                          <div className={`absolute inset-0 ${action.color}`} />
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />

                          {action.popular && (
                            <div className="absolute top-3 right-3">
                              <div className="rounded-full border border-yellow-400/30 bg-yellow-500/20 px-2 py-1 text-xs font-medium text-yellow-400">
                                Popular
                              </div>
                            </div>
                          )}

                          <div className="relative">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                              <action.icon className="h-6 w-6 text-white" />
                            </div>

                            <h4 className="mb-2 font-semibold text-white">{action.title}</h4>
                            <p className="text-sm text-white/80">{action.description}</p>
                          </div>

                          <div className="absolute inset-0 bg-white/5 opacity-0 transition-opacity group-hover:opacity-100" />
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Performance Chart Placeholder */}
                  <div className="mt-8 rounded-2xl border border-gray-700/50 bg-gray-800/40 p-6 backdrop-blur-sm">
                    <div className="mb-6 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">Performance Overview</h3>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 transition-colors hover:text-white">
                          <RefreshCw className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 transition-colors hover:text-white">
                          <Filter className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex h-64 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/10 to-cyan-600/10">
                      <div className="text-center">
                        <BarChart3 className="mx-auto mb-4 h-12 w-12 text-violet-400" />
                        <div className="mb-2 text-lg font-medium text-gray-300">
                          Interactive Chart
                        </div>
                        <div className="text-sm text-gray-400">
                          Real-time performance analytics with AI insights
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="rounded-2xl border border-gray-700/50 bg-gray-800/40 p-6 backdrop-blur-sm">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                    <button className="text-violet-400 transition-colors hover:text-violet-300">
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start rounded-xl bg-gray-700/20 p-4 transition-colors hover:bg-gray-700/30"
                      >
                        <div
                          className={`mr-3 flex h-10 w-10 items-center justify-center rounded-xl ${
                            activity.type === 'achievement'
                              ? 'bg-yellow-600/20 text-yellow-400'
                              : activity.type === 'milestone'
                                ? 'bg-green-600/20 text-green-400'
                                : activity.type === 'collaboration'
                                  ? 'bg-blue-600/20 text-blue-400'
                                  : 'bg-violet-600/20 text-violet-400'
                          }`}
                        >
                          {activity.type === 'achievement' && <Award className="h-5 w-5" />}
                          {activity.type === 'milestone' && <Target className="h-5 w-5" />}
                          {activity.type === 'collaboration' && <Users className="h-5 w-5" />}
                          {activity.type === 'goal' && <Star className="h-5 w-5" />}
                        </div>

                        <div className="flex-1">
                          <div className="mb-1 flex items-center justify-between">
                            <h4 className="text-sm font-medium text-white">{activity.title}</h4>
                            <span className="text-xs text-gray-500">
                              {getTimeAgo(activity.timestamp)}
                            </span>
                          </div>
                          <p className="mb-2 text-xs text-gray-400">{activity.description}</p>

                          <div className="flex items-center justify-between">
                            {activity.user && (
                              <div className="flex items-center">
                                {activity.avatar && (
                                  <img
                                    src={activity.avatar}
                                    alt={activity.user}
                                    className="mr-2 h-5 w-5 rounded-full"
                                  />
                                )}
                                <span className="text-xs text-gray-500">{activity.user}</span>
                              </div>
                            )}

                            {activity.points && (
                              <div className="flex items-center text-xs text-yellow-400">
                                <Star className="mr-1 h-3 w-3" />+{activity.points}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <button className="mt-4 w-full py-3 text-sm font-medium text-violet-400 transition-colors hover:text-violet-300">
                    View All Activity
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
