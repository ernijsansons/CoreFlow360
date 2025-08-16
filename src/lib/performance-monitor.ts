/**
 * CoreFlow360 - Performance Monitoring System
 * Real-time performance tracking and alerting for API endpoints
 */

export interface PerformanceMetrics {
  endpoint: string
  method: string
  responseTime: number
  statusCode: number
  timestamp: Date
  userId?: string
  tenantId?: string
  requestSize?: number
  responseSize?: number
  cacheHit?: boolean
  databaseQueries?: number
  externalCalls?: number
  memoryUsage?: number
  cpuUsage?: number
}

export interface PerformanceThresholds {
  responseTime: number // milliseconds
  errorRate: number // percentage
  throughput: number // requests per second
  memoryUsage: number // MB
  cpuUsage: number // percentage
}

export interface PerformanceAlert {
  type: 'response_time' | 'error_rate' | 'throughput' | 'memory' | 'cpu'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  metrics: PerformanceMetrics
  threshold: PerformanceThresholds
  timestamp: Date
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetrics[] = []
  private alerts: PerformanceAlert[] = []
  private thresholds: PerformanceThresholds = {
    responseTime: 1000, // 1 second
    errorRate: 5, // 5%
    throughput: 1000, // 1000 req/s
    memoryUsage: 512, // 512 MB
    cpuUsage: 80 // 80%
  }
  private listeners = new Set<(alert: PerformanceAlert) => void>()

  private constructor() {
    this.startPeriodicCleanup()
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  /**
   * Record performance metrics
   */
  recordMetrics(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics)
    this.checkThresholds(metrics)
    
    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }
  }

  /**
   * Check if metrics exceed thresholds
   */
  private checkThresholds(metrics: PerformanceMetrics): void {
    const alerts: PerformanceAlert[] = []

    // Check response time
    if (metrics.responseTime > this.thresholds.responseTime) {
      alerts.push({
        type: 'response_time',
        severity: this.getSeverity(metrics.responseTime, this.thresholds.responseTime),
        message: `Response time ${metrics.responseTime}ms exceeds threshold ${this.thresholds.responseTime}ms`,
        metrics,
        threshold: this.thresholds,
        timestamp: new Date()
      })
    }

    // Check error rate (if status code indicates error)
    if (metrics.statusCode >= 400) {
      const errorRate = this.calculateErrorRate(metrics.endpoint)
      if (errorRate > this.thresholds.errorRate) {
        alerts.push({
          type: 'error_rate',
          severity: this.getSeverity(errorRate, this.thresholds.errorRate),
          message: `Error rate ${errorRate.toFixed(2)}% exceeds threshold ${this.thresholds.errorRate}%`,
          metrics,
          threshold: this.thresholds,
          timestamp: new Date()
        })
      }
    }

    // Check throughput
    const throughput = this.calculateThroughput(metrics.endpoint)
    if (throughput > this.thresholds.throughput) {
      alerts.push({
        type: 'throughput',
        severity: this.getSeverity(throughput, this.thresholds.throughput),
        message: `Throughput ${throughput.toFixed(2)} req/s exceeds threshold ${this.thresholds.throughput} req/s`,
        metrics,
        threshold: this.thresholds,
        timestamp: new Date()
      })
    }

    // Check memory usage
    if (metrics.memoryUsage && metrics.memoryUsage > this.thresholds.memoryUsage) {
      alerts.push({
        type: 'memory',
        severity: this.getSeverity(metrics.memoryUsage, this.thresholds.memoryUsage),
        message: `Memory usage ${metrics.memoryUsage}MB exceeds threshold ${this.thresholds.memoryUsage}MB`,
        metrics,
        threshold: this.thresholds,
        timestamp: new Date()
      })
    }

    // Check CPU usage
    if (metrics.cpuUsage && metrics.cpuUsage > this.thresholds.cpuUsage) {
      alerts.push({
        type: 'cpu',
        severity: this.getSeverity(metrics.cpuUsage, this.thresholds.cpuUsage),
        message: `CPU usage ${metrics.cpuUsage}% exceeds threshold ${this.thresholds.cpuUsage}%`,
        metrics,
        threshold: this.thresholds,
        timestamp: new Date()
      })
    }

    // Trigger alerts
    alerts.forEach(alert => {
      this.alerts.push(alert)
      this.notifyListeners(alert)
    })
  }

  /**
   * Calculate error rate for an endpoint
   */
  private calculateErrorRate(endpoint: string): number {
    const recentMetrics = this.metrics.filter(m => 
      m.endpoint === endpoint && 
      m.timestamp > new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
    )
    
    if (recentMetrics.length === 0) return 0
    
    const errorCount = recentMetrics.filter(m => m.statusCode >= 400).length
    return (errorCount / recentMetrics.length) * 100
  }

  /**
   * Calculate throughput for an endpoint
   */
  private calculateThroughput(endpoint: string): number {
    const recentMetrics = this.metrics.filter(m => 
      m.endpoint === endpoint && 
      m.timestamp > new Date(Date.now() - 60 * 1000) // Last minute
    )
    
    return recentMetrics.length / 60 // requests per second
  }

  /**
   * Determine alert severity based on threshold exceedance
   */
  private getSeverity(value: number, threshold: number): 'low' | 'medium' | 'high' | 'critical' {
    const ratio = value / threshold
    
    if (ratio >= 3) return 'critical'
    if (ratio >= 2) return 'high'
    if (ratio >= 1.5) return 'medium'
    return 'low'
  }

  /**
   * Subscribe to performance alerts
   */
  subscribe(listener: (alert: PerformanceAlert) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * Notify all listeners of an alert
   */
  private notifyListeners(alert: PerformanceAlert): void {
    this.listeners.forEach(listener => {
      try {
        listener(alert)
      } catch (error) {
        console.error('Performance alert listener error:', error)
      }
    })
  }

  /**
   * Get performance summary for an endpoint
   */
  getEndpointSummary(endpoint: string, timeWindow: number = 5 * 60 * 1000): {
    totalRequests: number
    averageResponseTime: number
    errorRate: number
    throughput: number
    p95ResponseTime: number
    p99ResponseTime: number
  } {
    const recentMetrics = this.metrics.filter(m => 
      m.endpoint === endpoint && 
      m.timestamp > new Date(Date.now() - timeWindow)
    )
    
    if (recentMetrics.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        errorRate: 0,
        throughput: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0
      }
    }

    const responseTimes = recentMetrics.map(m => m.responseTime).sort((a, b) => a - b)
    const errorCount = recentMetrics.filter(m => m.statusCode >= 400).length
    
    return {
      totalRequests: recentMetrics.length,
      averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
      errorRate: (errorCount / recentMetrics.length) * 100,
      throughput: recentMetrics.length / (timeWindow / 1000),
      p95ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.95)],
      p99ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.99)]
    }
  }

  /**
   * Get all alerts
   */
  getAlerts(severity?: 'low' | 'medium' | 'high' | 'critical'): PerformanceAlert[] {
    if (severity) {
      return this.alerts.filter(alert => alert.severity === severity)
    }
    return this.alerts
  }

  /**
   * Clear old alerts
   */
  clearOldAlerts(maxAge: number = 24 * 60 * 60 * 1000): void {
    const cutoff = new Date(Date.now() - maxAge)
    this.alerts = this.alerts.filter(alert => alert.timestamp > cutoff)
  }

  /**
   * Update thresholds
   */
  updateThresholds(thresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds }
  }

  /**
   * Start periodic cleanup
   */
  private startPeriodicCleanup(): void {
    setInterval(() => {
      this.clearOldAlerts()
    }, 60 * 60 * 1000) // Clean up every hour
  }
}

/**
 * Performance monitoring middleware
 */
export function withPerformanceMonitoring<T extends any[]>(
  handler: (...args: T) => Promise<Response>,
  endpoint: string
) {
  return async (...args: T): Promise<Response> => {
    const startTime = Date.now()
    const startMemory = process.memoryUsage()
    
    try {
      const response = await handler(...args)
      const endTime = Date.now()
      const endMemory = process.memoryUsage()
      
      // Record metrics
      const monitor = PerformanceMonitor.getInstance()
      monitor.recordMetrics({
        endpoint,
        method: 'GET', // This would be extracted from the request
        responseTime: endTime - startTime,
        statusCode: response.status,
        timestamp: new Date(),
        memoryUsage: (endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024, // MB
        responseSize: parseInt(response.headers.get('content-length') || '0')
      })
      
      return response
    } catch (error) {
      const endTime = Date.now()
      
      // Record error metrics
      const monitor = PerformanceMonitor.getInstance()
      monitor.recordMetrics({
        endpoint,
        method: 'GET',
        responseTime: endTime - startTime,
        statusCode: 500,
        timestamp: new Date(),
        memoryUsage: 0
      })
      
      throw error
    }
  }
}

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitoring() {
  const monitor = PerformanceMonitor.getInstance()
  
  return {
    subscribe: monitor.subscribe.bind(monitor),
    getEndpointSummary: monitor.getEndpointSummary.bind(monitor),
    getAlerts: monitor.getAlerts.bind(monitor),
    updateThresholds: monitor.updateThresholds.bind(monitor)
  }
}













