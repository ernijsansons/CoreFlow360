/**
 * CoreFlow360 - Anomaly Detection Dashboard
 * Real-time monitoring dashboard for business anomaly detection
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle,
  Clock,
  Bell,
  Shield,
  BarChart3,
  Eye,
  MessageSquare,
  Users,
  DollarSign,
  Zap,
  Brain,
  Target,
  RefreshCw
} from 'lucide-react'
import useAnomalyMonitoring from '@/hooks/useAnomalyMonitoring'
import { formatDistanceToNow } from 'date-fns'

export default function AnomalyDashboard() {
  const {
    dashboardData,
    isLoading,
    error,
    acknowledgeAlert,
    resolveAlert,
    refreshData
  } = useAnomalyMonitoring()

  const [selectedAlert, setSelectedAlert] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshData()
    setIsRefreshing(false)
  }

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'revenue': return DollarSign
      case 'users': return Users
      case 'conversions': return Target
      case 'engagement': return Activity
      case 'performance': return BarChart3
      case 'system': return Shield
      default: return Activity
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-400/10 border-red-500/30'
      case 'high': return 'text-orange-400 bg-orange-400/10 border-orange-500/30'
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-500/30'
      case 'low': return 'text-blue-400 bg-blue-400/10 border-blue-500/30'
      default: return 'text-gray-400 bg-gray-400/10 border-gray-500/30'
    }
  }

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400'
      case 'warning': return 'text-yellow-400'
      case 'critical': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 mx-auto mb-4"
          >
            <Brain className="w-full h-full text-violet-400" />
          </motion.div>
          <div className="text-gray-400 text-lg">Initializing anomaly detection...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-center p-8 bg-gray-800/40 rounded-xl border border-gray-700/50">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <div className="text-red-400 text-lg mb-2">Monitoring Error</div>
          <div className="text-gray-400 mb-4">{error}</div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <Brain className="w-8 h-8 mr-3 text-violet-400" />
            Anomaly Detection Center
          </h1>
          <p className="text-gray-400">
            AI-powered business intelligence and anomaly monitoring
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-300 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {dashboardData && (
        <>
          {/* System Health Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">System Health</h3>
                <div className={`flex items-center space-x-2 ${getHealthStatusColor(dashboardData.systemHealth.status)}`}>
                  <Shield className="w-5 h-5" />
                  <span className="font-medium capitalize">{dashboardData.systemHealth.status}</span>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Health Score</span>
                  <span className="text-white font-bold">{dashboardData.systemHealth.score}/100</span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${dashboardData.systemHealth.score}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-2 rounded-full ${
                      dashboardData.systemHealth.score >= 80 ? 'bg-green-500' :
                      dashboardData.systemHealth.score >= 60 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                {dashboardData.systemHealth.issues.map((issue, index) => (
                  <div key={index} className="text-sm text-gray-400">
                    • {issue}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Alert Counts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Active Alerts</h3>
              <div className="space-y-3">
                {[
                  { label: 'Critical', count: dashboardData.alertCounts.critical, color: 'text-red-400' },
                  { label: 'High', count: dashboardData.alertCounts.high, color: 'text-orange-400' },
                  { label: 'Medium', count: dashboardData.alertCounts.medium, color: 'text-yellow-400' },
                  { label: 'Low', count: dashboardData.alertCounts.low, color: 'text-blue-400' }
                ].map((alert) => (
                  <div key={alert.label} className="flex items-center justify-between">
                    <span className="text-gray-400">{alert.label}</span>
                    <span className={`font-bold ${alert.color}`}>{alert.count}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Metrics Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Monitored Metrics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Metrics</span>
                  <span className="text-white font-bold">{dashboardData.metrics.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Recent Anomalies</span>
                  <span className="text-violet-400 font-bold">{dashboardData.recentAnomalies.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Detection Rate</span>
                  <span className="text-green-400 font-bold">99.2%</span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid xl:grid-cols-3 gap-8">
            {/* Active Alerts */}
            <div className="xl:col-span-2">
              <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-red-400" />
                  Active Alerts ({dashboardData.activeAlerts.length})
                </h3>

                <div className="space-y-4">
                  {dashboardData.activeAlerts.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                      <div className="text-gray-400 text-lg">No active alerts</div>
                      <div className="text-gray-500 text-sm">All systems are operating normally</div>
                    </div>
                  ) : (
                    dashboardData.activeAlerts.map((alert, index) => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-lg border transition-all cursor-pointer ${
                          selectedAlert === alert.id
                            ? 'border-violet-500/50 bg-violet-500/10'
                            : `border-gray-700/50 ${getSeverityColor(alert.severity)}`
                        }`}
                        onClick={() => setSelectedAlert(selectedAlert === alert.id ? null : alert.id)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              alert.severity === 'critical' ? 'bg-red-500' :
                              alert.severity === 'high' ? 'bg-orange-500' :
                              alert.severity === 'medium' ? 'bg-yellow-500' :
                              'bg-blue-500'
                            }`} />
                            <div>
                              <h4 className="text-white font-medium">{alert.metricName.replace('_', ' ').toUpperCase()}</h4>
                              <p className="text-gray-400 text-sm">{alert.businessImpact}</p>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-gray-400">
                              Score: <span className="text-white">{(alert.anomalyResult.anomalyScore * 100).toFixed(1)}%</span>
                            </span>
                            <span className="text-gray-400">
                              Value: <span className="text-white">{alert.anomalyResult.value.toLocaleString()}</span>
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {!alert.acknowledged && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  acknowledgeAlert(alert.id)
                                }}
                                className="px-2 py-1 text-xs bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30 transition-colors"
                              >
                                Acknowledge
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                const resolution = prompt('Enter resolution:')
                                if (resolution) resolveAlert(alert.id, resolution)
                              }}
                              className="px-2 py-1 text-xs bg-green-600/20 text-green-400 rounded hover:bg-green-600/30 transition-colors"
                            >
                              Resolve
                            </button>
                          </div>
                        </div>

                        {selectedAlert === alert.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-gray-700/50"
                          >
                            <div className="space-y-3">
                              <div>
                                <h5 className="text-white font-medium mb-2">Analysis</h5>
                                <p className="text-gray-400 text-sm">{alert.anomalyResult.explanation}</p>
                              </div>
                              
                              <div>
                                <h5 className="text-white font-medium mb-2">Recommended Actions</h5>
                                <ul className="space-y-1">
                                  {alert.recommendedActions.map((action, i) => (
                                    <li key={i} className="text-gray-400 text-sm">• {action}</li>
                                  ))}
                                </ul>
                              </div>

                              {alert.acknowledged && (
                                <div className="bg-blue-600/10 border border-blue-500/30 rounded p-2">
                                  <div className="text-blue-400 text-sm">
                                    Acknowledged by {alert.acknowledgedBy} {formatDistanceToNow(alert.acknowledgedAt!, { addSuffix: true })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Recent Anomalies & Metrics */}
            <div className="space-y-6">
              {/* Recent Anomalies */}
              <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-violet-400" />
                  Recent Anomalies
                </h3>

                <div className="space-y-3">
                  {dashboardData.recentAnomalies.slice(0, 5).map((anomaly, index) => (
                    <motion.div
                      key={`${anomaly.timestamp.getTime()}_${index}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 bg-gray-700/20 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white text-sm font-medium">
                          Value: {anomaly.value.toLocaleString()}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(anomaly.severity)}`}>
                          {anomaly.severity}
                        </span>
                      </div>
                      <div className="text-gray-400 text-xs">
                        Score: {(anomaly.anomalyScore * 100).toFixed(1)}% • 
                        {formatDistanceToNow(anomaly.timestamp, { addSuffix: true })}
                      </div>
                    </motion.div>
                  ))}

                  {dashboardData.recentAnomalies.length === 0 && (
                    <div className="text-center py-6">
                      <Activity className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                      <div className="text-gray-500 text-sm">No recent anomalies</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Monitored Metrics */}
              <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-green-400" />
                  Monitored Metrics
                </h3>

                <div className="space-y-3">
                  {dashboardData.metrics.map((metric, index) => {
                    const Icon = getMetricIcon(metric.type)
                    return (
                      <motion.div
                        key={metric.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-gray-700/20 rounded-lg hover:bg-gray-700/30 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-600/50 rounded-lg flex items-center justify-center">
                            <Icon className="w-4 h-4 text-gray-300" />
                          </div>
                          <div>
                            <div className="text-white text-sm font-medium">
                              {metric.name.replace('_', ' ').toUpperCase()}
                            </div>
                            <div className="text-gray-400 text-xs">{metric.description}</div>
                          </div>
                        </div>
                        
                        <div className={`w-2 h-2 rounded-full ${
                          metric.businessContext.kpi ? 'bg-green-500' : 'bg-gray-500'
                        }`} />
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}