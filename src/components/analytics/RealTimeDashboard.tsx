/**
 * CoreFlow360 - Real-Time Analytics Dashboard
 * Live dashboard with WebSocket streaming data
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  BarChart3,
  Zap,
  Wifi,
  WifiOff,
  Clock,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Signal,
  Eye,
  MessageSquare,
  Heart,
} from 'lucide-react'
import useWebSocketAnalytics, {
  type AnalyticsData,
  type RealtimeEvent,
} from '@/hooks/useWebSocketAnalytics'
import { formatDistanceToNow } from 'date-fns'

interface MetricCard {
  title: string
  value: string | number
  change?: number
  trend?: 'up' | 'down' | 'stable'
  icon: React.ElementType
  color: string
  unit?: string
  live?: boolean
}

export default function RealTimeDashboard() {
  const {
    isConnected,
    isConnecting,
    error,
    metrics,
    analyticsData,
    realtimeEvents,
    connect,
    disconnect,
    reconnect,
    trackEvent,
    clearEvents,
  } = useWebSocketAnalytics({
    subscriptions: ['dashboard:metrics', 'analytics:revenue', 'analytics:users', 'events:realtime'],
    onConnect: () => {},
    onDisconnect: () => {},
    _onError: (error) => {},
  })

  const [lastUpdateTime, setLastUpdateTime] = useState(new Date())
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)

  // Update last update time when data changes
  useEffect(() => {
    if (analyticsData) {
      setLastUpdateTime(new Date())
    }
  }, [analyticsData])

  // Generate metric cards from analytics data
  const generateMetricCards = (): MetricCard[] => {
    if (!analyticsData) return []

    return [
      {
        title: 'Revenue',
        value: analyticsData.revenue.totalRevenue,
        change: analyticsData.revenue.change,
        trend: analyticsData.revenue.trend,
        icon: DollarSign,
        color: 'text-green-400',
        unit: 'USD',
        live: true,
      },
      {
        title: 'Active Users',
        value: analyticsData.users.activeUsers,
        change: analyticsData.users.userGrowth,
        trend: 'up',
        icon: Users,
        color: 'text-blue-400',
        live: true,
      },
      {
        title: 'Response Time',
        value: analyticsData.performance.responseTime.toFixed(0),
        trend: analyticsData.performance.responseTime < 300 ? 'up' : 'down',
        icon: Zap,
        color: 'text-purple-400',
        unit: 'ms',
        live: true,
      },
      {
        title: 'Conversion Rate',
        value: (analyticsData.revenue.conversionRate * 100).toFixed(1),
        change: 2.3,
        trend: 'up',
        icon: TrendingUp,
        color: 'text-orange-400',
        unit: '%',
        live: true,
      },
      {
        title: 'System Health',
        value: analyticsData.systemHealth.score.toFixed(0),
        trend: analyticsData.systemHealth.status === 'healthy' ? 'up' : 'down',
        icon: CheckCircle,
        color: analyticsData.systemHealth.status === 'healthy' ? 'text-green-400' : 'text-red-400',
        unit: '/100',
        live: true,
      },
      {
        title: 'Error Rate',
        value: (analyticsData.performance.errorRate * 100).toFixed(2),
        trend: analyticsData.performance.errorRate < 0.5 ? 'up' : 'down',
        icon: AlertCircle,
        color: analyticsData.performance.errorRate < 0.5 ? 'text-green-400' : 'text-red-400',
        unit: '%',
        live: true,
      },
    ]
  }

  const metricCards = generateMetricCards()

  const formatValue = (value: string | number, unit?: string) => {
    if (typeof value === 'string') return value

    if (unit === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value)
    }

    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }

    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }

    return value.toLocaleString()
  }

  const getConnectionStatus = () => {
    if (isConnecting)
      return { color: 'text-yellow-400', icon: RefreshCw, text: 'Connecting...', animate: true }
    if (isConnected) return { color: 'text-green-400', icon: Wifi, text: 'Live', animate: false }
    if (error) return { color: 'text-red-400', icon: WifiOff, text: 'Error', animate: false }
    return { color: 'text-gray-400', icon: WifiOff, text: 'Offline', animate: false }
  }

  const connectionStatus = getConnectionStatus()

  const handleMetricClick = (title: string) => {
    setSelectedMetric(selectedMetric === title ? null : title)
    trackEvent('metric_clicked', { metric: title, timestamp: new Date() })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 flex items-center text-3xl font-bold text-white">
            <Activity className="mr-3 h-8 w-8 text-violet-400" />
            Real-Time Analytics
          </h1>
          <p className="text-gray-400">Live business intelligence with WebSocket streaming</p>
        </div>

        {/* Connection Status */}
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 ${connectionStatus.color}`}>
            <connectionStatus.icon
              className={`h-5 w-5 ${connectionStatus.animate ? 'animate-spin' : ''}`}
            />
            <span className="font-medium">{connectionStatus.text}</span>
          </div>

          {error && (
            <button
              onClick={reconnect}
              className="rounded-lg bg-red-600/20 px-3 py-1 text-sm text-red-400 transition-colors hover:bg-red-600/30"
            >
              Retry
            </button>
          )}
        </div>
      </div>

      {/* Connection Metrics */}
      {isConnected && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-gray-700/50 bg-gray-800/40 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Messages</span>
              <MessageSquare className="h-4 w-4 text-blue-400" />
            </div>
            <div className="font-bold text-white">{metrics.messagesReceived}</div>
          </div>

          <div className="rounded-lg border border-gray-700/50 bg-gray-800/40 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Latency</span>
              <Signal className="h-4 w-4 text-green-400" />
            </div>
            <div className="font-bold text-white">{metrics.latency || 0}ms</div>
          </div>

          <div className="rounded-lg border border-gray-700/50 bg-gray-800/40 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Subscriptions</span>
              <Eye className="h-4 w-4 text-purple-400" />
            </div>
            <div className="font-bold text-white">{metrics.subscriptions.length}</div>
          </div>

          <div className="rounded-lg border border-gray-700/50 bg-gray-800/40 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Last Update</span>
              <Clock className="h-4 w-4 text-yellow-400" />
            </div>
            <div className="text-xs font-bold text-white">
              {metrics.lastUpdate
                ? formatDistanceToNow(metrics.lastUpdate, { addSuffix: true })
                : 'Never'}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-4">
          <div className="flex items-center space-x-2 text-red-400">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Connection Error</span>
          </div>
          <p className="mt-1 text-sm text-red-300">{error}</p>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-4">
        {/* Live Metrics */}
        <div className="xl:col-span-3">
          <div className="rounded-xl border border-gray-700/50 bg-gray-800/40 p-6 backdrop-blur-sm">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Live Metrics</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Heart className="h-4 w-4 animate-pulse text-red-400" />
                <span>Real-time</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {metricCards.map((metric, index) => (
                <motion.div
                  key={metric.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative cursor-pointer rounded-lg border p-4 transition-all ${
                    selectedMetric === metric.title
                      ? 'border-violet-500/50 bg-violet-500/10'
                      : 'border-gray-700/50 bg-gray-700/20 hover:border-gray-600/50'
                  }`}
                  onClick={() => handleMetricClick(metric.title)}
                >
                  {/* Live indicator */}
                  {metric.live && isConnected && (
                    <div className="absolute top-2 right-2">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                    </div>
                  )}

                  <div className="mb-3 flex items-center justify-between">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gray-600/50 ${metric.color}`}
                    >
                      <metric.icon className="h-5 w-5" />
                    </div>
                    {metric.change !== undefined && (
                      <div
                        className={`flex items-center text-sm ${
                          metric.trend === 'up'
                            ? 'text-green-400'
                            : metric.trend === 'down'
                              ? 'text-red-400'
                              : 'text-gray-400'
                        }`}
                      >
                        {metric.trend === 'up' ? (
                          <TrendingUp className="mr-1 h-4 w-4" />
                        ) : metric.trend === 'down' ? (
                          <TrendingDown className="mr-1 h-4 w-4" />
                        ) : (
                          <BarChart3 className="mr-1 h-4 w-4" />
                        )}
                        {Math.abs(metric.change)}%
                      </div>
                    )}
                  </div>

                  <div className="mb-2">
                    <div className="text-2xl font-bold text-white">
                      {formatValue(metric.value, metric.unit)}
                      {metric.unit && !['USD'].includes(metric.unit) && (
                        <span className="ml-1 text-sm text-gray-400">{metric.unit}</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">{metric.title}</div>
                  </div>

                  {/* Real-time pulse animation */}
                  {metric.live && isConnected && (
                    <motion.div
                      className="absolute inset-0 rounded-lg border-2 border-green-400/30"
                      animate={{
                        opacity: [0, 0.5, 0],
                        scale: [1, 1.02, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.3,
                      }}
                    />
                  )}
                </motion.div>
              ))}
            </div>

            {!isConnected && (
              <div className="py-8 text-center">
                <WifiOff className="mx-auto mb-4 h-12 w-12 text-gray-600" />
                <div className="mb-2 text-lg text-gray-400">Not Connected</div>
                <div className="mb-4 text-sm text-gray-500">Connect to view real-time metrics</div>
                <button
                  onClick={connect}
                  disabled={isConnecting}
                  className="rounded-lg bg-violet-600 px-4 py-2 text-white transition-colors hover:bg-violet-700 disabled:opacity-50"
                >
                  {isConnecting ? 'Connecting...' : 'Connect'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Real-time Events Feed */}
        <div className="rounded-xl border border-gray-700/50 bg-gray-800/40 p-6 backdrop-blur-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Live Events</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">{realtimeEvents.length}</span>
              <button
                onClick={clearEvents}
                className="p-1 text-gray-400 transition-colors hover:text-gray-300"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-96 space-y-3 overflow-y-auto">
            <AnimatePresence>
              {realtimeEvents
                .slice(-10)
                .reverse()
                .map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-lg border border-gray-600/30 bg-gray-700/20 p-3"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <span className="text-sm font-medium text-white">
                        {event.type.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                      </span>
                    </div>

                    {event.data && (
                      <div className="text-xs text-gray-400">
                        {typeof event.data === 'object'
                          ? JSON.stringify(event.data, null, 2).slice(0, 100) +
                            (JSON.stringify(event.data).length > 100 ? '...' : '')
                          : String(event.data)}
                      </div>
                    )}

                    <div className="mt-2 flex items-center justify-between">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                      <span className="text-xs text-gray-500">Live</span>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>

            {realtimeEvents.length === 0 && (
              <div className="py-8 text-center">
                <Activity className="mx-auto mb-2 h-8 w-8 text-gray-600" />
                <div className="text-sm text-gray-500">
                  {isConnected ? 'Waiting for events...' : 'Connect to see live events'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      {selectedMetric && analyticsData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-gray-700/50 bg-gray-800/40 p-6 backdrop-blur-sm"
        >
          <h3 className="mb-4 text-lg font-semibold text-white">
            Detailed Analytics: {selectedMetric}
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-gray-700/20 p-4">
              <div className="mb-1 text-sm text-gray-400">Current Value</div>
              <div className="text-xl font-bold text-white">
                {metricCards.find((m) => m.title === selectedMetric)?.value}
              </div>
            </div>

            <div className="rounded-lg bg-gray-700/20 p-4">
              <div className="mb-1 text-sm text-gray-400">Last Updated</div>
              <div className="text-xl font-bold text-white">
                {formatDistanceToNow(lastUpdateTime, { addSuffix: true })}
              </div>
            </div>

            <div className="rounded-lg bg-gray-700/20 p-4">
              <div className="mb-1 text-sm text-gray-400">Status</div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                <span className="font-medium text-green-400">Live</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
