/**
 * Real-time Monitoring Dashboard Component
 * Free monitoring dashboard for system health and performance
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  Database,
  Cpu,
  MemoryStick,
  Globe,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Zap,
} from 'lucide-react'

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  uptime: number
  services: {
    database: { status: string; responseTime?: number; error?: string }
    ai: { status: string; responseTime?: number; error?: string }
  }
  performance: {
    memory: {
      used: number
      total: number
      percentage: number
    }
    requests: {
      total: number
      averageResponseTime: number
      errorRate: number
    }
  }
  features: {
    ai: boolean
    analytics: boolean
    auditLogging: boolean
  }
}

interface MonitoringMetrics {
  uptime: string
  totalRequests: number
  avgResponseTime: number
  errorRate: number
  activeUsers: number
  systemHealth: 'healthy' | 'degraded' | 'unhealthy'
}

export function MonitoringDashboard() {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [metrics, setMetrics] = useState<MonitoringMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => {
    fetchHealthData()
    // Refresh every 30 seconds
    const interval = setInterval(fetchHealthData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchHealthData = async () => {
    try {
      const response = await fetch('/api/health?detailed=true&metrics=true')
      const healthData = await response.json()
      setHealth(healthData)

      // Transform data for metrics display
      setMetrics({
        uptime: formatUptime(healthData.uptime),
        totalRequests: healthData.performance?.requests?.total || 0,
        avgResponseTime: healthData.performance?.requests?.averageResponseTime || 0,
        errorRate: healthData.performance?.requests?.errorRate || 0,
        activeUsers: Math.floor(Math.random() * 50) + 10, // Simulated for demo
        systemHealth: healthData.status,
      })

      setLastUpdated(new Date())
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
    }
  }

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  const getStatusColor = (_status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-400'
      case 'degraded':
        return 'text-yellow-400'
      case 'unhealthy':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return CheckCircle
      case 'degraded':
        return AlertTriangle
      case 'unhealthy':
        return XCircle
      default:
        return Activity
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-xl bg-gray-900 p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-1/3 rounded bg-gray-700"></div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 rounded bg-gray-700"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-gray-900 p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="mb-2 text-2xl font-bold text-white">System Health Dashboard</h2>
          <p className="text-gray-400">
            Real-time monitoring • Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={fetchHealthData}
          className="rounded-lg bg-violet-600 px-4 py-2 text-white transition-colors hover:bg-violet-700"
        >
          Refresh
        </button>
      </div>

      {/* System Status Overview */}
      {health && (
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <StatusCard
            title="Overall Health"
            status={health.status}
            icon={getStatusIcon(health.status)}
            description={`System is ${health.status}`}
          />
          <StatusCard
            title="Database"
            status={health.services.database.status}
            icon={Database}
            description={
              health.services.database.error ||
              `Response: ${health.services.database.responseTime || 0}ms`
            }
          />
          <StatusCard
            title="AI Services"
            status={health.services.ai.status}
            icon={Cpu}
            description={health.features.ai ? 'AI features enabled' : 'AI not configured'}
          />
        </div>
      )}

      {/* Performance Metrics */}
      {metrics && (
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Uptime" value={metrics.uptime} icon={Clock} color="text-green-400" />
          <MetricCard
            title="Total Requests"
            value={metrics.totalRequests.toLocaleString()}
            icon={Activity}
            color="text-blue-400"
          />
          <MetricCard
            title="Avg Response Time"
            value={`${metrics.avgResponseTime}ms`}
            icon={Zap}
            color="text-yellow-400"
          />
          <MetricCard
            title="Active Users"
            value={metrics.activeUsers.toString()}
            icon={Users}
            color="text-purple-400"
          />
        </div>
      )}

      {/* Detailed Performance */}
      {health && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Memory Usage */}
          <div className="rounded-lg bg-gray-800 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-white">Memory Usage</h3>
              <MemoryStick className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Used</span>
                <span className="text-white">
                  {(health.performance.memory.used / 1024 / 1024).toFixed(1)} MB
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total</span>
                <span className="text-white">
                  {(health.performance.memory.total / 1024 / 1024).toFixed(1)} MB
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-700">
                <div
                  className={`h-2 rounded-full ${
                    health.performance.memory.percentage > 80
                      ? 'bg-red-500'
                      : health.performance.memory.percentage > 60
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(health.performance.memory.percentage, 100)}%` }}
                ></div>
              </div>
              <div className="text-right text-sm text-gray-400">
                {health.performance.memory.percentage}%
              </div>
            </div>
          </div>

          {/* Feature Status */}
          <div className="rounded-lg bg-gray-800 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-white">Feature Status</h3>
              <Globe className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <FeatureStatus name="AI Orchestration" enabled={health.features.ai} />
              <FeatureStatus name="Analytics" enabled={health.features.analytics} />
              <FeatureStatus name="Audit Logging" enabled={health.features.auditLogging} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusCard({
  title,
  status,
  icon: Icon,
  description,
}: {
  title: string
  status: string
  icon: unknown
  description: string
}) {
  const statusColor =
    status === 'healthy' || status === 'configured'
      ? 'text-green-400'
      : status === 'degraded'
        ? 'text-yellow-400'
        : 'text-red-400'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg bg-gray-800 p-6"
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold text-white">{title}</h3>
        <Icon className={`h-5 w-5 ${statusColor}`} />
      </div>
      <div className={`text-sm font-medium ${statusColor} mb-1 capitalize`}>
        {status.replace('_', ' ')}
      </div>
      <div className="text-xs text-gray-400">{description}</div>
    </motion.div>
  )
}

function MetricCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string
  value: string
  icon: unknown
  color: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg bg-gray-800 p-6"
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold text-white">{title}</h3>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </motion.div>
  )
}

function FeatureStatus({ name, enabled }: { name: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-300">{name}</span>
      <div className={`flex items-center ${enabled ? 'text-green-400' : 'text-gray-500'}`}>
        {enabled ? <CheckCircle className="mr-1 h-4 w-4" /> : <XCircle className="mr-1 h-4 w-4" />}
        <span className="text-sm">{enabled ? 'Enabled' : 'Disabled'}</span>
      </div>
    </div>
  )
}
