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
  Heart
} from 'lucide-react'
import useWebSocketAnalytics, { type AnalyticsData, type RealtimeEvent } from '@/hooks/useWebSocketAnalytics'
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
    clearEvents
  } = useWebSocketAnalytics({
    subscriptions: ['dashboard:metrics', 'analytics:revenue', 'analytics:users', 'events:realtime'],
    onConnect: () => {
      console.log('WebSocket connected!')
    },
    onDisconnect: () => {
      console.log('WebSocket disconnected!')
    },
    onError: (error) => {
      console.error('WebSocket error:', error)
    }
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
        live: true
      },
      {
        title: 'Active Users',
        value: analyticsData.users.activeUsers,
        change: analyticsData.users.userGrowth,
        trend: 'up',
        icon: Users,
        color: 'text-blue-400',
        live: true
      },
      {
        title: 'Response Time',
        value: analyticsData.performance.responseTime.toFixed(0),
        trend: analyticsData.performance.responseTime < 300 ? 'up' : 'down',
        icon: Zap,
        color: 'text-purple-400',
        unit: 'ms',
        live: true
      },
      {
        title: 'Conversion Rate',
        value: (analyticsData.revenue.conversionRate * 100).toFixed(1),
        change: 2.3,
        trend: 'up',
        icon: TrendingUp,
        color: 'text-orange-400',
        unit: '%',
        live: true
      },
      {
        title: 'System Health',
        value: analyticsData.systemHealth.score.toFixed(0),
        trend: analyticsData.systemHealth.status === 'healthy' ? 'up' : 'down',
        icon: CheckCircle,
        color: analyticsData.systemHealth.status === 'healthy' ? 'text-green-400' : 'text-red-400',
        unit: '/100',
        live: true
      },
      {
        title: 'Error Rate',
        value: (analyticsData.performance.errorRate * 100).toFixed(2),
        trend: analyticsData.performance.errorRate < 0.5 ? 'up' : 'down',
        icon: AlertCircle,
        color: analyticsData.performance.errorRate < 0.5 ? 'text-green-400' : 'text-red-400',
        unit: '%',
        live: true
      }
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
        maximumFractionDigits: 0
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
    if (isConnecting) return { color: 'text-yellow-400', icon: RefreshCw, text: 'Connecting...', animate: true }
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
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <Activity className="w-8 h-8 mr-3 text-violet-400" />
            Real-Time Analytics
          </h1>
          <p className="text-gray-400">
            Live business intelligence with WebSocket streaming
          </p>
        </div>

        {/* Connection Status */}
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 ${connectionStatus.color}`}>
            <connectionStatus.icon 
              className={`w-5 h-5 ${connectionStatus.animate ? 'animate-spin' : ''}`} 
            />
            <span className="font-medium">{connectionStatus.text}</span>
          </div>
          
          {error && (
            <button
              onClick={reconnect}
              className="px-3 py-1 bg-red-600/20 text-red-400 rounded-lg text-sm hover:bg-red-600/30 transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </div>

      {/* Connection Metrics */}
      {isConnected && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Messages</span>
              <MessageSquare className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-white font-bold">{metrics.messagesReceived}</div>
          </div>

          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Latency</span>
              <Signal className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-white font-bold">{metrics.latency || 0}ms</div>
          </div>

          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Subscriptions</span>
              <Eye className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-white font-bold">{metrics.subscriptions.length}</div>
          </div>

          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Last Update</span>
              <Clock className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="text-white font-bold text-xs">
              {metrics.lastUpdate ? formatDistanceToNow(metrics.lastUpdate, { addSuffix: true }) : 'Never'}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Connection Error</span>
          </div>
          <p className="text-red-300 text-sm mt-1">{error}</p>
        </div>
      )}

      <div className="grid xl:grid-cols-4 gap-6">
        {/* Live Metrics */}
        <div className="xl:col-span-3">
          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Live Metrics</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Heart className="w-4 h-4 text-red-400 animate-pulse" />
                <span>Real-time</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {metricCards.map((metric, index) => (
                <motion.div
                  key={metric.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative p-4 rounded-lg border transition-all cursor-pointer ${
                    selectedMetric === metric.title
                      ? 'border-violet-500/50 bg-violet-500/10'
                      : 'border-gray-700/50 bg-gray-700/20 hover:border-gray-600/50'
                  }`}
                  onClick={() => handleMetricClick(metric.title)}
                >
                  {/* Live indicator */}
                  {metric.live && isConnected && (
                    <div className="absolute top-2 right-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg bg-gray-600/50 flex items-center justify-center ${metric.color}`}>
                      <metric.icon className="w-5 h-5" />
                    </div>
                    {metric.change !== undefined && (
                      <div className={`flex items-center text-sm ${
                        metric.trend === 'up' ? 'text-green-400' : 
                        metric.trend === 'down' ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {metric.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 mr-1" />
                        ) : metric.trend === 'down' ? (
                          <TrendingDown className="w-4 h-4 mr-1" />
                        ) : (
                          <BarChart3 className="w-4 h-4 mr-1" />
                        )}
                        {Math.abs(metric.change)}%
                      </div>
                    )}
                  </div>

                  <div className="mb-2">
                    <div className="text-2xl font-bold text-white">
                      {formatValue(metric.value, metric.unit)}
                      {metric.unit && !['USD'].includes(metric.unit) && (
                        <span className="text-sm text-gray-400 ml-1">{metric.unit}</span>
                      )}
                    </div>
                    <div className="text-gray-400 text-sm">{metric.title}</div>
                  </div>

                  {/* Real-time pulse animation */}
                  {metric.live && isConnected && (
                    <motion.div
                      className="absolute inset-0 border-2 border-green-400/30 rounded-lg"
                      animate={{
                        opacity: [0, 0.5, 0],
                        scale: [1, 1.02, 1]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.3
                      }}
                    />
                  )}
                </motion.div>
              ))}
            </div>

            {!isConnected && (
              <div className="text-center py-8">
                <WifiOff className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <div className="text-gray-400 text-lg mb-2">Not Connected</div>
                <div className="text-gray-500 text-sm mb-4">
                  Connect to view real-time metrics
                </div>
                <button
                  onClick={connect}
                  disabled={isConnecting}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  {isConnecting ? 'Connecting...' : 'Connect'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Real-time Events Feed */}
        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Live Events</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">{realtimeEvents.length}</span>
              <button
                onClick={clearEvents}
                className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {realtimeEvents.slice(-10).reverse().map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="p-3 bg-gray-700/20 rounded-lg border border-gray-600/30"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-white text-sm font-medium">
                      {event.type.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                  
                  {event.data && (
                    <div className="text-gray-400 text-xs">
                      {typeof event.data === 'object' 
                        ? JSON.stringify(event.data, null, 2).slice(0, 100) + (JSON.stringify(event.data).length > 100 ? '...' : '')
                        : String(event.data)
                      }
                    </div>
                  )}

                  <div className="mt-2 flex items-center justify-between">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs text-gray-500">Live</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {realtimeEvents.length === 0 && (
              <div className="text-center py-8">
                <Activity className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <div className="text-gray-500 text-sm">
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
          className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Detailed Analytics: {selectedMetric}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-700/20 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Current Value</div>
              <div className="text-xl font-bold text-white">
                {metricCards.find(m => m.title === selectedMetric)?.value}
              </div>
            </div>
            
            <div className="p-4 bg-gray-700/20 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Last Updated</div>
              <div className="text-xl font-bold text-white">
                {formatDistanceToNow(lastUpdateTime, { addSuffix: true })}
              </div>
            </div>
            
            <div className="p-4 bg-gray-700/20 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Status</div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-400 font-medium">Live</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}