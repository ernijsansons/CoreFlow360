/**
 * CoreFlow360 - Monitoring System Index
 * Centralized monitoring system initialization and exports
 */

import { productionMonitor } from './production-monitor'
import { alertChannelManager } from './alert-channels'

// Performance tracking (existing)
export { PerformanceTracker, performanceTracker } from './performance-tracking'

export type {
  PerformanceMetric,
  PerformanceThreshold,
  PerformanceAlert,
  PerformanceStats,
  TrackingOptions,
} from './performance-tracking'

// Re-export the main withPerformanceTracking function for convenience
export const withPerformanceTracking =
  performanceTracker.withPerformanceTracking.bind(performanceTracker)

// Initialize monitoring in the browser or server
let isInitialized = false

export const initializeMonitoring = () => {
  if (isInitialized) return

  try {
    // Start production monitoring
    console.log('🔍 Initializing CoreFlow360 monitoring system...')
    
    // Production monitor automatically starts when imported
    const monitor = productionMonitor
    
    // Setup global error handlers if in browser
    if (typeof window !== 'undefined') {
      // Setup error handling
      try {
        const { setupGlobalErrorHandling } = require('../errors/advanced-error-boundary')
        setupGlobalErrorHandling?.()
      } catch (e) {
        console.warn('Could not setup global error handling:', e)
      }
    }

    console.log('✅ Monitoring system initialized successfully')
    isInitialized = true
  } catch (error) {
    console.error('❌ Failed to initialize monitoring system:', error)
  }
}

// Auto-initialize in production
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
  initializeMonitoring()
}

// Export monitoring components
export { productionMonitor } from './production-monitor'
export { alertChannelManager } from './alert-channels'
export { healthCheck } from './production-monitor'

// Export monitoring types
export type { 
  SystemMetrics, 
  AlertRule 
} from './production-monitor'

export type { 
  AlertChannel, 
  AlertMessage 
} from './alert-channels'

// Utility functions
export const getMonitoringStatus = async () => {
  const health = await productionMonitor.getSystemHealth()
  const alerts = productionMonitor.getActiveAlerts()
  const channels = alertChannelManager.getChannels()
  
  return {
    systemHealth: health,
    activeAlerts: alerts.length,
    alertChannels: channels.length,
    enabledChannels: channels.filter(c => c.enabled).length,
    isMonitoringActive: isInitialized
  }
}

export const triggerTestAlert = async () => {
  const testAlert = {
    id: `test_${Date.now()}`,
    name: 'Test Alert',
    metric: 'test.metric',
    value: 100,
    threshold: 50,
    comparison: 'gt' as const,
    severity: 'medium' as const,
    timestamp: new Date().toISOString(),
    context: {
      test: true,
      source: 'manual'
    }
  }

  try {
    const { alertChannelManager } = await import('./alert-channels')
    
    const alertMessage = {
      id: testAlert.id,
      severity: testAlert.severity,
      title: testAlert.name,
      message: `Test alert: ${testAlert.metric} = ${testAlert.value} (threshold: ${testAlert.threshold})`,
      timestamp: testAlert.timestamp,
      metadata: testAlert.context
    }

    const result = await alertChannelManager.sendAlert(alertMessage)
    return {
      success: true,
      result,
      alert: testAlert
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      alert: testAlert
    }
  }
}

// Health check endpoint data
export const getHealthCheckData = async () => {
  return healthCheck()
}

/*
// Integration Examples:
// 
// Performance Tracking:
// import { withPerformanceTracking } from '@/lib/monitoring'
// const result = await withPerformanceTracking(
//   'database.getUserData',
//   () => fetchUserFromDatabase(userId),
//   { includeCpuUsage: true, tags: ['database', 'user'] }
// )
//
// Monitoring Status:
// import { getMonitoringStatus } from '@/lib/monitoring'
// const status = await getMonitoringStatus()
//
// Test Alerts:
// import { triggerTestAlert } from '@/lib/monitoring'
// const result = await triggerTestAlert()
*/
