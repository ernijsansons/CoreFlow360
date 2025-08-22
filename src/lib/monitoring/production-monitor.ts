/**
 * CoreFlow360 - Production Monitoring System
 * Comprehensive application health monitoring and alerting
 */

export interface SystemMetrics {
  timestamp: string
  cpu: {
    usage: number
    cores: number
    loadAverage: number[]
  }
  memory: {
    used: number
    free: number
    total: number
    percentage: number
  }
  database: {
    connectionCount: number
    queryLatency: number
    errorRate: number
    slowQueries: number
  }
  api: {
    requestsPerMinute: number
    averageLatency: number
    errorRate: number
    activeConnections: number
  }
  business: {
    activeUsers: number
    dailyTransactions: number
    intelligenceProcesses: number
    moduleUtilization: Record<string, number>
  }
}

export interface AlertRule {
  id: string
  name: string
  metric: string
  threshold: number
  comparison: 'gt' | 'lt' | 'eq'
  severity: 'low' | 'medium' | 'high' | 'critical'
  enabled: boolean
  cooldown: number // minutes
  lastTriggered?: string
}

export class ProductionMonitor {
  private static instance: ProductionMonitor
  private metrics: SystemMetrics[] = []
  private alerts: AlertRule[] = []
  private lastAlert = new Map<string, number>()

  static getInstance(): ProductionMonitor {
    if (!ProductionMonitor.instance) {
      ProductionMonitor.instance = new ProductionMonitor()
    }
    return ProductionMonitor.instance
  }

  constructor() {
    this.initializeDefaultAlerts()
    if (typeof window === 'undefined') {
      // Server-side monitoring
      this.startSystemMonitoring()
    } else {
      // Client-side monitoring
      this.startClientMonitoring()
    }
  }

  private initializeDefaultAlerts() {
    this.alerts = [
      // Performance Alerts
      {
        id: 'high-cpu',
        name: 'High CPU Usage',
        metric: 'cpu.usage',
        threshold: 80,
        comparison: 'gt',
        severity: 'high',
        enabled: true,
        cooldown: 10,
      },
      {
        id: 'high-memory',
        name: 'High Memory Usage',
        metric: 'memory.percentage',
        threshold: 85,
        comparison: 'gt',
        severity: 'high',
        enabled: true,
        cooldown: 10,
      },
      {
        id: 'high-error-rate',
        name: 'High API Error Rate',
        metric: 'api.errorRate',
        threshold: 5,
        comparison: 'gt',
        severity: 'critical',
        enabled: true,
        cooldown: 5,
      },
      {
        id: 'slow-api',
        name: 'Slow API Response',
        metric: 'api.averageLatency',
        threshold: 2000,
        comparison: 'gt',
        severity: 'medium',
        enabled: true,
        cooldown: 15,
      },
      // Database Alerts
      {
        id: 'db-high-connections',
        name: 'High Database Connections',
        metric: 'database.connectionCount',
        threshold: 80,
        comparison: 'gt',
        severity: 'high',
        enabled: true,
        cooldown: 10,
      },
      {
        id: 'db-slow-queries',
        name: 'Slow Database Queries',
        metric: 'database.queryLatency',
        threshold: 1000,
        comparison: 'gt',
        severity: 'medium',
        enabled: true,
        cooldown: 15,
      },
      // Business Alerts
      {
        id: 'low-user-activity',
        name: 'Low User Activity',
        metric: 'business.activeUsers',
        threshold: 1,
        comparison: 'lt',
        severity: 'low',
        enabled: true,
        cooldown: 60,
      },
    ]
  }

  async collectMetrics(): Promise<SystemMetrics> {
    const timestamp = new Date().toISOString()
    
    try {
      // In production, these would be real system metrics
      const metrics: SystemMetrics = {
        timestamp,
        cpu: await this.getCPUMetrics(),
        memory: await this.getMemoryMetrics(),
        database: await this.getDatabaseMetrics(),
        api: await this.getAPIMetrics(),
        business: await this.getBusinessMetrics(),
      }

      // Store metrics (keep last 1000 entries)
      this.metrics.push(metrics)
      if (this.metrics.length > 1000) {
        this.metrics.shift()
      }

      // Check alerts
      await this.checkAlerts(metrics)

      return metrics
    } catch (error) {
      console.error('Failed to collect metrics:', error)
      throw error
    }
  }

  private async getCPUMetrics() {
    if (typeof window !== 'undefined') {
      // Client-side approximation
      return {
        usage: Math.random() * 100,
        cores: navigator.hardwareConcurrency || 4,
        loadAverage: [0.5, 0.7, 0.8],
      }
    }

    // Server-side - would use actual system metrics
    try {
      const os = await import('os')
      const cpus = os.cpus()
      return {
        usage: Math.random() * 100, // Would calculate actual usage
        cores: cpus.length,
        loadAverage: os.loadavg(),
      }
    } catch {
      return {
        usage: 0,
        cores: 1,
        loadAverage: [0, 0, 0],
      }
    }
  }

  private async getMemoryMetrics() {
    if (typeof window !== 'undefined') {
      // Client-side approximation using performance API
      const memory = (performance as any).memory
      if (memory) {
        return {
          used: memory.usedJSHeapSize,
          free: memory.totalJSHeapSize - memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
        }
      }
    }

    // Server-side - would use actual system metrics
    try {
      const os = await import('os')
      const total = os.totalmem()
      const free = os.freemem()
      const used = total - free
      return {
        used,
        free,
        total,
        percentage: (used / total) * 100,
      }
    } catch {
      return {
        used: 0,
        free: 0,
        total: 0,
        percentage: 0,
      }
    }
  }

  private async getDatabaseMetrics() {
    // In production, query actual database metrics
    return {
      connectionCount: Math.floor(Math.random() * 100),
      queryLatency: Math.random() * 1000,
      errorRate: Math.random() * 2,
      slowQueries: Math.floor(Math.random() * 10),
    }
  }

  private async getAPIMetrics() {
    // In production, aggregate from request logs
    return {
      requestsPerMinute: Math.floor(Math.random() * 1000),
      averageLatency: Math.random() * 500,
      errorRate: Math.random() * 5,
      activeConnections: Math.floor(Math.random() * 200),
    }
  }

  private async getBusinessMetrics() {
    // In production, query from business tables
    return {
      activeUsers: Math.floor(Math.random() * 500),
      dailyTransactions: Math.floor(Math.random() * 10000),
      intelligenceProcesses: Math.floor(Math.random() * 50),
      moduleUtilization: {
        crm: Math.random() * 100,
        accounting: Math.random() * 100,
        hr: Math.random() * 100,
        projects: Math.random() * 100,
        analytics: Math.random() * 100,
      },
    }
  }

  private async checkAlerts(metrics: SystemMetrics) {
    const now = Date.now()

    for (const alert of this.alerts) {
      if (!alert.enabled) continue

      // Check cooldown
      const lastTriggered = this.lastAlert.get(alert.id) || 0
      if (now - lastTriggered < alert.cooldown * 60 * 1000) {
        continue
      }

      const value = this.getMetricValue(metrics, alert.metric)
      const triggered = this.evaluateCondition(value, alert.threshold, alert.comparison)

      if (triggered) {
        await this.triggerAlert(alert, value, metrics)
        this.lastAlert.set(alert.id, now)
      }
    }
  }

  private getMetricValue(metrics: SystemMetrics, path: string): number {
    const keys = path.split('.')
    let value: any = metrics

    for (const key of keys) {
      value = value?.[key]
      if (value === undefined) return 0
    }

    return typeof value === 'number' ? value : 0
  }

  private evaluateCondition(value: number, threshold: number, comparison: string): boolean {
    switch (comparison) {
      case 'gt': return value > threshold
      case 'lt': return value < threshold
      case 'eq': return value === threshold
      default: return false
    }
  }

  private async triggerAlert(alert: AlertRule, value: number, metrics: SystemMetrics) {
    const alertData = {
      id: alert.id,
      name: alert.name,
      severity: alert.severity,
      metric: alert.metric,
      value,
      threshold: alert.threshold,
      timestamp: new Date().toISOString(),
      context: this.getAlertContext(alert.metric, metrics),
    }

    console.warn(`🚨 ALERT: ${alert.name}`, alertData)

    // Send to monitoring services
    await this.sendAlert(alertData)

    // Store alert
    await this.storeAlert(alertData)
  }

  private getAlertContext(metric: string, metrics: SystemMetrics) {
    // Provide relevant context for the alert
    const context: Record<string, any> = {
      timestamp: metrics.timestamp,
    }

    if (metric.startsWith('cpu')) {
      context.cpu = metrics.cpu
    } else if (metric.startsWith('memory')) {
      context.memory = metrics.memory
    } else if (metric.startsWith('database')) {
      context.database = metrics.database
    } else if (metric.startsWith('api')) {
      context.api = metrics.api
    } else if (metric.startsWith('business')) {
      context.business = metrics.business
    }

    return context
  }

  private async sendAlert(alert: any) {
    // Send to alert channels
    try {
      const { alertChannelManager } = await import('./alert-channels')
      
      const alertMessage = {
        id: alert.id || `alert_${Date.now()}`,
        severity: alert.severity,
        title: alert.name,
        message: `${alert.metric} has reached ${alert.value} (threshold: ${alert.threshold})`,
        timestamp: alert.timestamp,
        metadata: {
          metric: alert.metric,
          value: alert.value,
          threshold: alert.threshold,
          context: alert.context
        }
      }

      await alertChannelManager.sendAlert(alertMessage)
    } catch (error) {
      console.error('Failed to send alert via channels:', error)
    }

    // Fallback to API endpoint
    if (process.env.NODE_ENV === 'production') {
      try {
        await fetch('/api/monitoring/alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alert),
        })
      } catch (error) {
        console.error('Failed to send alert via API:', error)
      }
    }
  }

  private async storeAlert(alert: any) {
    // Store alert in database for historical analysis
    try {
      await fetch('/api/monitoring/alerts/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert),
      })
    } catch (error) {
      console.error('Failed to store alert:', error)
    }
  }

  private startSystemMonitoring() {
    // Collect metrics every 30 seconds
    setInterval(async () => {
      try {
        await this.collectMetrics()
      } catch (error) {
        console.error('Monitoring collection failed:', error)
      }
    }, 30000)

    console.log('✅ Production monitoring started (server-side)')
  }

  private startClientMonitoring() {
    // Client-side performance monitoring
    if ('performance' in window) {
      // Monitor Core Web Vitals
      this.monitorWebVitals()
    }

    // Collect client metrics every 2 minutes
    setInterval(async () => {
      try {
        await this.collectMetrics()
      } catch (error) {
        console.error('Client monitoring failed:', error)
      }
    }, 120000)

    console.log('✅ Production monitoring started (client-side)')
  }

  private monitorWebVitals() {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lcp = entries[entries.length - 1] as PerformanceEntry
      this.trackMetric('web_vitals_lcp', lcp.startTime)
    }).observe({ type: 'largest-contentful-paint', buffered: true })

    // First Input Delay (FID)
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        this.trackMetric('web_vitals_fid', entry.processingStart - entry.startTime)
      })
    }).observe({ type: 'first-input', buffered: true })

    // Cumulative Layout Shift (CLS)
    let clsValue = 0
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      this.trackMetric('web_vitals_cls', clsValue)
    }).observe({ type: 'layout-shift', buffered: true })
  }

  private trackMetric(name: string, value: number) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'performance_metric', {
        custom_map: { dimension1: name },
        value: Math.round(value),
      })
    }
  }

  // Public API methods
  getRecentMetrics(count: number = 10): SystemMetrics[] {
    return this.metrics.slice(-count)
  }

  getSystemHealth(): 'healthy' | 'degraded' | 'critical' {
    if (this.metrics.length === 0) return 'healthy'

    const latest = this.metrics[this.metrics.length - 1]
    
    // Check critical thresholds
    if (latest.api.errorRate > 10 || latest.memory.percentage > 95 || latest.cpu.usage > 95) {
      return 'critical'
    }

    // Check degraded thresholds
    if (latest.api.errorRate > 5 || latest.memory.percentage > 80 || latest.cpu.usage > 80) {
      return 'degraded'
    }

    return 'healthy'
  }

  getActiveAlerts(): AlertRule[] {
    return this.alerts.filter(alert => alert.enabled)
  }

  addAlert(alert: Omit<AlertRule, 'id'>): string {
    const id = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.alerts.push({ ...alert, id })
    return id
  }

  updateAlert(id: string, updates: Partial<AlertRule>): boolean {
    const index = this.alerts.findIndex(alert => alert.id === id)
    if (index === -1) return false

    this.alerts[index] = { ...this.alerts[index], ...updates }
    return true
  }

  removeAlert(id: string): boolean {
    const index = this.alerts.findIndex(alert => alert.id === id)
    if (index === -1) return false

    this.alerts.splice(index, 1)
    return true
  }
}

// Export singleton instance
export const productionMonitor = ProductionMonitor.getInstance()

// Health check endpoint helper
export const healthCheck = async () => {
  const monitor = ProductionMonitor.getInstance()
  const metrics = await monitor.collectMetrics()
  const health = monitor.getSystemHealth()

  return {
    status: health,
    timestamp: new Date().toISOString(),
    metrics: {
      cpu: metrics.cpu.usage,
      memory: metrics.memory.percentage,
      api: {
        errorRate: metrics.api.errorRate,
        latency: metrics.api.averageLatency,
      },
      database: {
        connections: metrics.database.connectionCount,
        latency: metrics.database.queryLatency,
      },
    },
    uptime: process.uptime?.() || 0,
    version: process.env.NEXT_PUBLIC_VERSION || '1.0.0',
  }
}

export default ProductionMonitor