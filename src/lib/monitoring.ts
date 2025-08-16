/**
 * CoreFlow360 - Production Monitoring Setup (Free Tier)
 * Sentry error tracking, performance monitoring, and uptime checks
 */

import { getConfig } from '@/lib/config'

// Configuration-driven monitoring settings
const getMonitoringConfig = () => {
  try {
    const config = getConfig()
    return {
      sentryDsn: config.SENTRY_DSN,
      environment: config.NODE_ENV,
      monitoringEnabled: config.MONITORING_ENABLED,
      performanceSamplingRate: config.PERFORMANCE_SAMPLING_RATE,
      healthCheckInterval: config.HEALTH_CHECK_INTERVAL,
    }
  } catch {
    // Fallback configuration for development/testing
    return {
      sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      monitoringEnabled: process.env.MONITORING_ENABLED !== 'false',
      performanceSamplingRate: 0.1,
      healthCheckInterval: 30000,
    }
  }
}

// Error tracking interface
interface ErrorContext {
  userId?: string
  tenantId?: string
  feature?: string
  module?: string
  [key: string]: any
}

// Performance monitoring
export class PerformanceTracker {
  private static instance: PerformanceTracker
  private performanceObserver?: PerformanceObserver

  static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker()
    }
    return PerformanceTracker.instance
  }

  init() {
    if (typeof window === 'undefined') return
    
    const config = getMonitoringConfig()
    if (!config.monitoringEnabled) return

    // Track Core Web Vitals
    this.trackWebVitals()
    
    // Track API performance
    this.trackApiPerformance()
    
    // Track React component renders
    this.trackComponentPerformance()
  }

  private trackWebVitals() {
    // Dynamic import for client-side only
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      onCLS(this.sendVital.bind(this))
      onFID(this.sendVital.bind(this))
      onFCP(this.sendVital.bind(this))
      onLCP(this.sendVital.bind(this))
      onTTFB(this.sendVital.bind(this))
    })
  }

  private trackApiPerformance() {
    // Intercept fetch requests
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const start = performance.now()
      try {
        const response = await originalFetch(...args)
        const duration = performance.now() - start
        
        this.trackApiCall({
          url: args[0] as string,
          method: (args[1]?.method || 'GET') as string,
          status: response.status,
          duration,
          success: response.ok
        })
        
        return response
      } catch (error) {
        const duration = performance.now() - start
        this.trackApiCall({
          url: args[0] as string,
          method: (args[1]?.method || 'GET') as string,
          duration,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        throw error
      }
    }
  }

  private trackComponentPerformance() {
    // Track React component render times
    if ('performance' in window && 'PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure' && entry.name.startsWith('⚛️')) {
            this.sendPerformanceMetric({
              name: entry.name,
              duration: entry.duration,
              type: 'react_render'
            })
          }
        }
      })
      
      this.performanceObserver.observe({ entryTypes: ['measure'] })
    }
  }

  private sendVital(vital: any) {
    // Send to multiple analytics platforms
    if (window.gtag) {
      window.gtag('event', vital.name, {
        event_category: 'Web Vitals',
        value: Math.round(vital.name === 'CLS' ? vital.value * 1000 : vital.value),
        non_interaction: true
      })
    }

    if (window.va) {
      window.va('track', 'web-vital', {
        name: vital.name,
        value: vital.value,
        id: vital.id
      })
    }

    // Performance metrics are tracked via analytics only
  }

  private trackApiCall(metrics: {
    url: string
    method: string
    status?: number
    duration: number
    success: boolean
    error?: string
  }) {
    // Track API performance
    if (window.gtag) {
      window.gtag('event', 'api_call', {
        event_category: 'Performance',
        event_label: `${metrics.method} ${metrics.url}`,
        value: Math.round(metrics.duration),
        custom_parameters: {
          status: metrics.status,
          success: metrics.success
        }
      })
    }

    // Send to Vercel Analytics
    if (window.va) {
      window.va('track', 'api_performance', {
        url: metrics.url,
        method: metrics.method,
        duration: metrics.duration,
        status: metrics.status,
        success: metrics.success
      })
    }

    // Log slow API calls
    if (metrics.duration > 1000) {
      this.logError(new Error(`Slow API call: ${metrics.method} ${metrics.url} took ${metrics.duration}ms`), {
        category: 'performance',
        api_url: metrics.url,
        duration: metrics.duration
      })
    }
  }

  private sendPerformanceMetric(metric: {
    name: string
    duration: number
    type: string
  }) {
    if (window.gtag) {
      window.gtag('event', 'performance_metric', {
        event_category: 'Performance',
        event_label: metric.name,
        value: Math.round(metric.duration)
      })
    }
  }

  // Public error logging method
  logError(error: Error, context?: ErrorContext) {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[Error Tracked]', error, context)
    }

    // Send to Google Analytics
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        custom_parameters: context
      })
    }

    // Send to Vercel Analytics
    if (window.va) {
      window.va('track', 'error', {
        message: error.message,
        stack: error.stack,
        ...context
      })
    }

    // In production, would send to Sentry
    // Sentry.captureException(error, { contexts: { custom: context } })
  }

  // Business metrics tracking
  trackBusinessMetric(metric: {
    name: string
    value: number
    category: string
    properties?: Record<string, any>
  }) {
    if (window.gtag) {
      window.gtag('event', metric.name, {
        event_category: metric.category,
        value: metric.value,
        custom_parameters: metric.properties
      })
    }

    if (window.va) {
      window.va('track', metric.name, {
        value: metric.value,
        category: metric.category,
        ...metric.properties
      })
    }
  }
}

// Initialize performance tracking
export const performanceTracker = PerformanceTracker.getInstance()

// Health check utilities
export class HealthCheck {
  static async checkApiHealth(): Promise<boolean> {
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      return response.ok
    } catch (error) {
      performanceTracker.logError(error as Error, { feature: 'health_check' })
      return false
    }
  }

  static async checkDatabaseHealth(): Promise<boolean> {
    try {
      const response = await fetch('/api/health/database', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      return response.ok
    } catch (error) {
      performanceTracker.logError(error as Error, { feature: 'database_health' })
      return false
    }
  }

  static async runFullHealthCheck(): Promise<{
    api: boolean
    database: boolean
    overall: boolean
  }> {
    const [api, database] = await Promise.all([
      this.checkApiHealth(),
      this.checkDatabaseHealth()
    ])

    const overall = api && database

    // Track health check results
    performanceTracker.trackBusinessMetric({
      name: 'health_check',
      value: overall ? 1 : 0,
      category: 'system',
      properties: { api, database }
    })

    return { api, database, overall }
  }
}

// User session tracking
export class SessionTracker {
  private sessionStart: number = Date.now()
  private pageViews: number = 0
  private interactions: number = 0

  constructor() {
    if (typeof window !== 'undefined') {
      this.trackSession()
    }
  }

  trackPageView() {
    this.pageViews++
    this.trackSessionMetric()
  }

  trackInteraction() {
    this.interactions++
  }

  trackSessionEnd() {
    const sessionDuration = Date.now() - this.sessionStart
    
    performanceTracker.trackBusinessMetric({
      name: 'session_completed',
      value: sessionDuration,
      category: 'engagement',
      properties: {
        page_views: this.pageViews,
        interactions: this.interactions,
        duration_minutes: Math.round(sessionDuration / 60000)
      }
    })
  }

  private trackSession() {
    // Track session start
    performanceTracker.trackBusinessMetric({
      name: 'session_started',
      value: 1,
      category: 'engagement'
    })

    // Track session end on page unload
    window.addEventListener('beforeunload', () => {
      this.trackSessionEnd()
    })

    // Track session metrics every 30 seconds
    setInterval(() => {
      this.trackSessionMetric()
    }, 30000)
  }

  private trackSessionMetric() {
    const sessionDuration = Date.now() - this.sessionStart
    
    performanceTracker.trackBusinessMetric({
      name: 'session_active',
      value: sessionDuration,
      category: 'engagement',
      properties: {
        page_views: this.pageViews,
        interactions: this.interactions
      }
    })
  }
}

// Real User Monitoring (RUM)
export class RealUserMonitoring {
  static init() {
    if (typeof window === 'undefined') return

    // Track user agent and device info
    this.trackDeviceInfo()
    
    // Track connection quality
    this.trackConnection()
    
    // Track feature usage
    this.trackFeatureUsage()
  }

  private static trackDeviceInfo() {
    const deviceInfo = {
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      cookies_enabled: navigator.cookieEnabled,
      online: navigator.onLine
    }

    performanceTracker.trackBusinessMetric({
      name: 'device_info',
      value: 1,
      category: 'rum',
      properties: deviceInfo
    })
  }

  private static trackConnection() {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      
      performanceTracker.trackBusinessMetric({
        name: 'connection_info',
        value: 1,
        category: 'rum',
        properties: {
          effective_type: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          save_data: connection.saveData
        }
      })
    }
  }

  private static trackFeatureUsage() {
    // Track modern browser features
    const features = {
      service_worker: 'serviceWorker' in navigator,
      push_notifications: 'PushManager' in window,
      web_share: 'share' in navigator,
      payment_request: 'PaymentRequest' in window,
      intersection_observer: 'IntersectionObserver' in window,
      performance_observer: 'PerformanceObserver' in window
    }

    performanceTracker.trackBusinessMetric({
      name: 'browser_features',
      value: 1,
      category: 'rum',
      properties: features
    })
  }
}

// Export singleton instance
export const sessionTracker = new SessionTracker()

// Initialize monitoring in client
if (typeof window !== 'undefined') {
  performanceTracker.init()
  RealUserMonitoring.init()
}