/**
 * CoreFlow360 - Real-Time Analytics Dashboard
 * Live business intelligence with real-time data visualization
 */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  ShoppingCart,
  Clock,
  Zap,
  AlertCircle,
  CheckCircle,
  Wifi,
  WifiOff,
  RefreshCw,
  Play,
  Pause,
  Settings,
  Maximize,
  Filter,
  Calendar,
  Download
} from 'lucide-react'

interface RealTimeMetric {
  id: string
  name: string
  value: number
  change: number
  changePercent: number
  trend: 'up' | 'down' | 'stable'
  timestamp: Date
  color: string
  icon: React.ComponentType<any>
  unit?: string
  format?: 'number' | 'currency' | 'percentage'
}

interface LiveEvent {
  id: string
  type: 'sale' | 'signup' | 'login' | 'error' | 'alert'
  title: string
  description: string
  value?: number
  timestamp: Date
  severity: 'info' | 'success' | 'warning' | 'error'
  businessId?: string
  businessName?: string
}

interface ChartDataPoint {
  timestamp: Date
  value: number
  label?: string
}

const mockRealTimeMetrics: RealTimeMetric[] = [
  {
    id: 'revenue',
    name: 'Revenue',
    value: 45280,
    change: 2340,
    changePercent: 5.4,
    trend: 'up',
    timestamp: new Date(),
    color: 'text-green-600 bg-green-50',
    icon: DollarSign,
    format: 'currency'
  },
  {
    id: 'customers',
    name: 'Active Customers',
    value: 1247,
    change: -12,
    changePercent: -0.9,
    trend: 'down',
    timestamp: new Date(),
    color: 'text-blue-600 bg-blue-50',
    icon: Users,
    format: 'number'
  },
  {
    id: 'orders',
    name: 'Orders Today',
    value: 89,
    change: 15,
    changePercent: 20.3,
    trend: 'up',
    timestamp: new Date(),
    color: 'text-purple-600 bg-purple-50',
    icon: ShoppingCart,
    format: 'number'
  },
  {
    id: 'conversion',
    name: 'Conversion Rate',
    value: 3.2,
    change: 0.3,
    changePercent: 10.3,
    trend: 'up',
    timestamp: new Date(),
    color: 'text-orange-600 bg-orange-50',
    icon: TrendingUp,
    unit: '%',
    format: 'percentage'
  }
]

const mockLiveEvents: LiveEvent[] = [
  {
    id: '1',
    type: 'sale',
    title: 'New Sale',
    description: 'Premium subscription purchased by TechFlow Solutions',
    value: 299,
    timestamp: new Date(Date.now() - 30000),
    severity: 'success',
    businessId: 'tech-flow',
    businessName: 'TechFlow Solutions'
  },
  {
    id: '2',
    type: 'signup',
    title: 'New Customer',
    description: 'GreenTech Manufacturing completed onboarding',
    timestamp: new Date(Date.now() - 120000),
    severity: 'info',
    businessId: 'green-tech',
    businessName: 'GreenTech Manufacturing'
  },
  {
    id: '3',
    type: 'alert',
    title: 'Performance Alert',
    description: 'High response time detected on API endpoints',
    timestamp: new Date(Date.now() - 300000),
    severity: 'warning'
  },
  {
    id: '4',
    type: 'error',
    title: 'System Error',
    description: 'Database connection timeout (resolved)',
    timestamp: new Date(Date.now() - 600000),
    severity: 'error'
  }
]

export function RealTimeAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<RealTimeMetric[]>(mockRealTimeMetrics)
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>(mockLiveEvents)
  const [isConnected, setIsConnected] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('24h')
  const [chartData, setChartData] = useState<Record<string, ChartDataPoint[]>>({})
  const [showFilters, setShowFilters] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Simulate real-time updates
  useEffect(() => {
    if (!isPlaying) return

    intervalRef.current = setInterval(() => {
      // Update metrics
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.value + (Math.random() - 0.5) * metric.value * 0.01,
        change: (Math.random() - 0.5) * 200,
        changePercent: (Math.random() - 0.5) * 10,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        timestamp: new Date()
      })))

      // Add new live event occasionally
      if (Math.random() > 0.7) {
        const eventTypes = ['sale', 'signup', 'login', 'alert'] as const
        const severities = ['info', 'success', 'warning'] as const
        
        const newEvent: LiveEvent = {
          id: Date.now().toString(),
          type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
          title: 'Real-time Event',
          description: `New activity detected at ${new Date().toLocaleTimeString()}`,
          timestamp: new Date(),
          severity: severities[Math.floor(Math.random() * severities.length)]
        }

        setLiveEvents(prev => [newEvent, ...prev.slice(0, 9)])
      }

      // Update chart data
      setChartData(prev => {
        const newData = { ...prev }
        metrics.forEach(metric => {
          if (!newData[metric.id]) newData[metric.id] = []
          
          newData[metric.id].push({
            timestamp: new Date(),
            value: metric.value
          })

          // Keep only last 50 data points
          if (newData[metric.id].length > 50) {
            newData[metric.id] = newData[metric.id].slice(-50)
          }
        })
        return newData
      })
    }, 3000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, metrics])

  // Simple chart rendering
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !chartData.revenue) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const data = chartData.revenue
    if (data.length === 0) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Chart settings
    const padding = 20
    const chartWidth = canvas.width - padding * 2
    const chartHeight = canvas.height - padding * 2

    const minValue = Math.min(...data.map(d => d.value))
    const maxValue = Math.max(...data.map(d => d.value))
    const valueRange = maxValue - minValue || 1

    // Draw chart line
    ctx.strokeStyle = '#10b981'
    ctx.lineWidth = 2
    ctx.beginPath()

    data.forEach((point, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth
      const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Draw data points
    ctx.fillStyle = '#10b981'
    data.forEach((point, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth
      const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight
      
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, 2 * Math.PI)
      ctx.fill()
    })
  }, [chartData])

  const formatValue = (metric: RealTimeMetric): string => {
    switch (metric.format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(metric.value)
      case 'percentage':
        return `${metric.value.toFixed(1)}%`
      default:
        return metric.value.toLocaleString()
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return <DollarSign className="h-4 w-4" />
      case 'signup':
        return <Users className="h-4 w-4" />
      case 'login':
        return <Activity className="h-4 w-4" />
      case 'alert':
        return <AlertCircle className="h-4 w-4" />
      case 'error':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-2">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Real-Time Analytics
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              {isConnected ? (
                <>
                  <Wifi className="h-4 w-4 text-green-600" />
                  <span>Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-600" />
                  <span>Disconnected</span>
                </>
              )}
              <span>•</span>
              <Clock className="h-4 w-4" />
              <span>Updated {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Time Range Selector */}
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>

          {/* Controls */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="rounded-lg border border-gray-300 bg-white p-2 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            <Filter className="h-4 w-4" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`rounded-lg p-2 text-white ${
              isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>

          <button className="rounded-lg border border-gray-300 bg-white p-2 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600">
            <RefreshCw className="h-4 w-4" />
          </button>

          <button className="rounded-lg border border-gray-300 bg-white p-2 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600">
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800"
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-lg p-2 ${metric.color}`}>
                <metric.icon className="h-5 w-5" />
              </div>
              <div className="flex items-center space-x-1">
                {metric.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : metric.trend === 'down' ? (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                ) : (
                  <Activity className="h-4 w-4 text-gray-600" />
                )}
                <span
                  className={`text-sm font-medium ${
                    metric.trend === 'up' ? 'text-green-600' : 
                    metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}
                >
                  {metric.changePercent > 0 ? '+' : ''}{metric.changePercent.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {metric.name}
              </h3>
              <div className="mt-1 flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatValue(metric)}
                </span>
                {metric.unit && (
                  <span className="text-sm text-gray-500">{metric.unit}</span>
                )}
              </div>
              <div className="mt-1 text-sm text-gray-500">
                {metric.change > 0 ? '+' : ''}{metric.change.toLocaleString()} from yesterday
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Live Chart */}
        <div className="lg:col-span-2">
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Revenue Trend
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="h-2 w-2 rounded-full bg-green-600"></div>
                <span>Live data</span>
              </div>
            </div>

            <div className="relative">
              <canvas
                ref={canvasRef}
                width={600}
                height={200}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
              />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-500">Peak</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {chartData.revenue ? Math.max(...chartData.revenue.map(d => d.value)).toLocaleString() : '0'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Average</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {chartData.revenue 
                    ? (chartData.revenue.reduce((sum, d) => sum + d.value, 0) / chartData.revenue.length).toLocaleString()
                    : '0'
                  }
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Data Points</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {chartData.revenue?.length || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Events */}
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Live Events
            </h3>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Zap className="h-3 w-3" />
              <span>{liveEvents.length}</span>
            </div>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {liveEvents.slice(0, 8).map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`rounded-lg border p-3 ${getSeverityColor(event.severity)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium truncate">
                          {event.title}
                        </h4>
                        <span className="text-xs">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="mt-1 text-xs opacity-80">
                        {event.description}
                      </p>
                      {event.value && (
                        <div className="mt-1 text-xs font-medium">
                          ${event.value.toLocaleString()}
                        </div>
                      )}
                      {event.businessName && (
                        <div className="mt-1 text-xs opacity-60">
                          {event.businessName}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {liveEvents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent events</p>
            </div>
          )}
        </div>
      </div>

      {/* System Status */}
      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          System Status
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[
            { name: 'API Response', status: 'healthy', value: '45ms', color: 'green' },
            { name: 'Database', status: 'healthy', value: '12ms', color: 'green' },
            { name: 'Cache Hit Rate', status: 'good', value: '94%', color: 'green' },
            { name: 'Error Rate', status: 'healthy', value: '0.02%', color: 'green' }
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.name}
                </div>
                <div className="text-xs text-gray-500">{item.value}</div>
              </div>
              <CheckCircle className={`h-5 w-5 text-${item.color}-600`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}