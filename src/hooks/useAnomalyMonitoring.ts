/**
 * CoreFlow360 - Anomaly Monitoring Hook
 * React hook for real-time anomaly detection and alerting
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { BusinessAnomalyMonitor, type AnomalyAlert, type BusinessMetric } from '@/lib/anomaly/business-anomaly-monitor'
import { type AnomalyResult, type DataPoint } from '@/lib/anomaly/advanced-anomaly-detector'
import { useSession } from 'next-auth/react'

interface AnomalyDashboardData {
  activeAlerts: AnomalyAlert[]
  recentAnomalies: AnomalyResult[]
  metrics: BusinessMetric[]
  alertCounts: {
    critical: number
    high: number
    medium: number
    low: number
  }
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical'
    score: number
    issues: string[]
  }
}

interface UseAnomalyMonitoringReturn {
  dashboardData: AnomalyDashboardData | null
  isLoading: boolean
  error: string | null
  monitor: BusinessAnomalyMonitor | null
  acknowledgeAlert: (alertId: string) => Promise<boolean>
  resolveAlert: (alertId: string, resolution: string) => Promise<boolean>
  refreshData: () => Promise<void>
  subscribeToRealTimeUpdates: (callback: (data: AnomalyDashboardData) => void) => () => void
}

export function useAnomalyMonitoring(): UseAnomalyMonitoringReturn {
  const { data: session } = useSession()
  const [dashboardData, setDashboardData] = useState<AnomalyDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [monitor] = useState(() => new BusinessAnomalyMonitor())
  const pollingInterval = useRef<NodeJS.Timeout | null>(null)
  const realtimeCallbacks = useRef<Set<(data: AnomalyDashboardData) => void>>(new Set())

  // Initialize monitoring and load data
  useEffect(() => {
    if (session?.user?.tenantId) {
      initializeMonitoring()
    }
    
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current)
      }
    }
  }, [session?.user?.tenantId])

  const initializeMonitoring = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Load historical data for anomaly detection training
      await loadHistoricalData()
      
      // Load current dashboard data
      await refreshData()
      
      // Start real-time monitoring
      startRealTimeMonitoring()
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize anomaly monitoring')
    } finally {
      setIsLoading(false)
    }
  }

  const loadHistoricalData = async () => {
    if (!session?.user?.tenantId) return

    try {
      // Load historical data for each metric
      const metrics = monitor.getMetrics()
      
      for (const metric of metrics) {
        const historicalData = await fetchHistoricalMetricData(metric.name, 30) // 30 days
        if (historicalData.length > 0) {
          monitor.detector.addHistoricalData(metric.name, historicalData)
        }
      }
    } catch (error) {
      console.error('Failed to load historical data:', error)
    }
  }

  const fetchHistoricalMetricData = async (metricName: string, days: number): Promise<DataPoint[]> => {
    // In production, this would fetch from your metrics API
    // For now, generate mock historical data
    const data: DataPoint[] = []
    const now = new Date()
    
    for (let i = days; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      let value: number
      
      switch (metricName) {
        case 'daily_revenue':
          value = 25000 + Math.random() * 10000 + Math.sin(i / 7) * 5000 // Weekly pattern
          break
        case 'new_subscriptions':
          value = 50 + Math.random() * 20 + Math.sin(i / 7) * 10
          break
        case 'churn_rate':
          value = 2 + Math.random() * 2
          break
        case 'active_users':
          value = 5000 + Math.random() * 1000 + Math.sin(i / 7) * 500
          break
        case 'api_response_time':
          value = 200 + Math.random() * 100
          break
        case 'error_rate':
          value = 0.1 + Math.random() * 0.3
          break
        default:
          value = Math.random() * 100
      }
      
      data.push({
        timestamp,
        value,
        metadata: { source: 'historical', tenantId: session?.user?.tenantId }
      })
    }
    
    return data
  }

  const fetchCurrentMetricData = async (): Promise<{ [metricName: string]: DataPoint[] }> => {
    // In production, this would fetch current metrics from your API
    const metrics = monitor.getMetrics()
    const currentData: { [metricName: string]: DataPoint[] } = {}
    
    for (const metric of metrics) {
      const now = new Date()
      let value: number
      
      switch (metric.name) {
        case 'daily_revenue':
          // Simulate occasional revenue spike/dip
          value = Math.random() < 0.1 ? 50000 : (Math.random() < 0.1 ? 10000 : 25000 + Math.random() * 10000)
          break
        case 'new_subscriptions':
          value = Math.random() < 0.1 ? 100 : (Math.random() < 0.1 ? 10 : 50 + Math.random() * 20)
          break
        case 'churn_rate':
          value = Math.random() < 0.1 ? 8 : (2 + Math.random() * 2)
          break
        case 'active_users':
          value = 5000 + Math.random() * 1000
          break
        case 'api_response_time':
          value = Math.random() < 0.1 ? 2000 : (200 + Math.random() * 100)
          break
        case 'error_rate':
          value = Math.random() < 0.1 ? 3 : (0.1 + Math.random() * 0.3)
          break
        default:
          value = Math.random() * 100
      }
      
      currentData[metric.name] = [{
        timestamp: now,
        value,
        metadata: { source: 'current', tenantId: session?.user?.tenantId }
      }]
    }
    
    return currentData
  }

  const refreshData = useCallback(async () => {
    try {
      // Fetch current metric data
      const currentData = await fetchCurrentMetricData()
      
      // Monitor each metric for anomalies
      const allAnomalies: AnomalyResult[] = []
      for (const [metricName, dataPoints] of Object.entries(currentData)) {
        const anomalies = await monitor.monitorMetric(metricName, dataPoints)
        allAnomalies.push(...anomalies)
      }
      
      // Get active alerts
      const activeAlerts = monitor.getActiveAlerts()
      
      // Calculate alert counts
      const alertCounts = {
        critical: activeAlerts.filter(a => a.severity === 'critical').length,
        high: activeAlerts.filter(a => a.severity === 'high').length,
        medium: activeAlerts.filter(a => a.severity === 'medium').length,
        low: activeAlerts.filter(a => a.severity === 'low').length
      }
      
      // Calculate system health
      const systemHealth = calculateSystemHealth(activeAlerts, allAnomalies)
      
      const newDashboardData: AnomalyDashboardData = {
        activeAlerts,
        recentAnomalies: allAnomalies.filter(a => a.isAnomaly).slice(-10),
        metrics: monitor.getMetrics(),
        alertCounts,
        systemHealth
      }
      
      setDashboardData(newDashboardData)
      
      // Notify real-time subscribers
      realtimeCallbacks.current.forEach(callback => callback(newDashboardData))
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data')
    }
  }, [monitor, session?.user?.tenantId])

  const calculateSystemHealth = (alerts: AnomalyAlert[], anomalies: AnomalyResult[]) => {
    const criticalAlerts = alerts.filter(a => a.severity === 'critical').length
    const highAlerts = alerts.filter(a => a.severity === 'high').length
    const recentCriticalAnomalies = anomalies.filter(a => a.severity === 'critical').length
    
    const issues: string[] = []
    let score = 100
    let status: 'healthy' | 'warning' | 'critical' = 'healthy'
    
    if (criticalAlerts > 0) {
      status = 'critical'
      score -= criticalAlerts * 30
      issues.push(`${criticalAlerts} critical alert${criticalAlerts > 1 ? 's' : ''} active`)
    }
    
    if (highAlerts > 2) {
      status = status === 'healthy' ? 'warning' : status
      score -= highAlerts * 10
      issues.push(`${highAlerts} high severity alerts`)
    }
    
    if (recentCriticalAnomalies > 0) {
      status = status === 'healthy' ? 'warning' : status
      score -= recentCriticalAnomalies * 15
      issues.push(`${recentCriticalAnomalies} critical anomalies detected`)
    }
    
    if (issues.length === 0) {
      issues.push('All systems operating normally')
    }
    
    return {
      status,
      score: Math.max(0, score),
      issues
    }
  }

  const startRealTimeMonitoring = () => {
    // Poll for new data every 30 seconds
    pollingInterval.current = setInterval(refreshData, 30000)
  }

  const acknowledgeAlert = useCallback(async (alertId: string): Promise<boolean> => {
    try {
      const acknowledged = monitor.acknowledgeAlert(alertId, session?.user?.email || 'unknown')
      if (acknowledged) {
        await refreshData() // Refresh to update UI
      }
      return acknowledged
    } catch (error) {
      console.error('Failed to acknowledge alert:', error)
      return false
    }
  }, [monitor, refreshData, session?.user?.email])

  const resolveAlert = useCallback(async (alertId: string, resolution: string): Promise<boolean> => {
    try {
      const resolved = monitor.resolveAlert(alertId, resolution)
      if (resolved) {
        await refreshData() // Refresh to update UI
      }
      return resolved
    } catch (error) {
      console.error('Failed to resolve alert:', error)
      return false
    }
  }, [monitor, refreshData])

  const subscribeToRealTimeUpdates = useCallback((callback: (data: AnomalyDashboardData) => void) => {
    realtimeCallbacks.current.add(callback)
    
    // Return unsubscribe function
    return () => {
      realtimeCallbacks.current.delete(callback)
    }
  }, [])

  return {
    dashboardData,
    isLoading,
    error,
    monitor,
    acknowledgeAlert,
    resolveAlert,
    refreshData,
    subscribeToRealTimeUpdates
  }
}

export default useAnomalyMonitoring