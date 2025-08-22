/**
 * CoreFlow360 - Real-time Performance Analytics Dashboard
 * Enterprise-grade performance monitoring with real-time metrics and insights
 */

import { getRedis } from '@/lib/redis/client'
// import { productionMonitor } from '@/lib/monitoring/production-alerts'
import { advancedCache } from '@/lib/cache/advanced-cache'

// Performance metric types
export interface PerformanceMetric {
  id: string
  name: string
  value: number
  unit: string
  timestamp: Date
  tags: Record<string, string>
  threshold?: {
    warning: number
    critical: number
  }
}

export interface PerformanceAlert {
  id: string
  metric: string
  level: 'warning' | 'critical'
  value: number
  threshold: number
  timestamp: Date
  resolved: boolean
  resolvedAt?: Date
}

export interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical'
  score: number // 0-100
  components: {
    database: ComponentHealth
    redis: ComponentHealth
    cache: ComponentHealth
    api: ComponentHealth
    frontend: ComponentHealth
    external: ComponentHealth
  }
  lastUpdated: Date
}

export interface ComponentHealth {
  status: 'healthy' | 'warning' | 'critical' | 'unknown'
  score: number // 0-100
  metrics: {
    responseTime: number
    errorRate: number
    uptime: number
    throughput?: number
  }
  issues: string[]
}

export interface PerformanceTrend {
  metric: string
  period: '1h' | '24h' | '7d' | '30d'
  data: Array<{
    timestamp: Date
    value: number
    trend: 'up' | 'down' | 'stable'
    change: number
  }>
  summary: {
    average: number
    min: number
    max: number
    p95: number
    p99: number
  }
}

export interface UserExperience {
  pageLoadTime: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  cumulativeLayoutShift: number
  firstInputDelay: number
  timeToInteractive: number
  userSatisfactionScore: number // 0-100
}

// Dashboard configuration
const DASHBOARD_CONFIG = {
  refreshInterval: 5000, // 5 seconds
  retentionPeriods: {
    realtime: 300, // 5 minutes
    shortTerm: 86400, // 24 hours
    mediumTerm: 604800, // 7 days
    longTerm: 2592000, // 30 days
  },
  alertThresholds: {
    responseTime: { warning: 500, critical: 2000 }, // milliseconds
    errorRate: { warning: 0.01, critical: 0.05 }, // percentage
    cpuUsage: { warning: 70, critical: 90 }, // percentage
    memoryUsage: { warning: 80, critical: 95 }, // percentage
    diskUsage: { warning: 80, critical: 95 }, // percentage
    uptime: { warning: 0.99, critical: 0.95 }, // percentage
  },
  sampleRates: {
    highFrequency: 1000, // 1 second
    mediumFrequency: 5000, // 5 seconds
    lowFrequency: 30000, // 30 seconds
  },
}

export class PerformanceDashboard {
  private static instance: PerformanceDashboard
  private redis = getRedis()
  private metricsBuffer = new Map<string, PerformanceMetric[]>()
  private activeAlerts = new Map<string, PerformanceAlert>()
  private isCollecting = false
  private collectionInterval?: NodeJS.Timeout

  constructor() {
    this.startMetricsCollection()
  }

  static getInstance(): PerformanceDashboard {
    if (!PerformanceDashboard.instance) {
      PerformanceDashboard.instance = new PerformanceDashboard()
    }
    return PerformanceDashboard.instance
  }

  /**
   * Get current system health overview
   */
  async getSystemHealth(): Promise<SystemHealth> {
    try {
      const cached = await advancedCache.get<SystemHealth>('system_health')
      if (cached) return cached

      const components = await this.getComponentsHealth()
      const overallScore = this.calculateOverallScore(components)
      const overall = this.determineOverallStatus(overallScore)

      const health: SystemHealth = {
        overall,
        score: overallScore,
        components,
        lastUpdated: new Date(),
      }

      // Cache for 30 seconds
      await advancedCache.set('system_health', health, { ttl: 30 })
      return health
    } catch (error) {
      console.error('Get system health error:', error)
      return this.getDefaultSystemHealth()
    }
  }

  /**
   * Get performance metrics for a specific time period
   */
  async getMetrics(
    metricNames: string[],
    period: '1h' | '24h' | '7d' | '30d' = '24h',
    groupBy: 'minute' | 'hour' | 'day' = 'hour'
  ): Promise<Record<string, PerformanceMetric[]>> {
    try {
      const cacheKey = `metrics_${metricNames.join(',')}_${period}_${groupBy}`
      const cached = await advancedCache.get<Record<string, PerformanceMetric[]>>(cacheKey)
      if (cached) return cached

      const metrics: Record<string, PerformanceMetric[]> = {}
      
      for (const metricName of metricNames) {
        metrics[metricName] = await this.getMetricHistory(metricName, period, groupBy)
      }

      // Cache for 1 minute for frequent access
      await advancedCache.set(cacheKey, metrics, { ttl: 60 })
      return metrics
    } catch (error) {
      console.error('Get metrics error:', error)
      return {}
    }
  }

  /**
   * Get performance trends with analysis
   */
  async getPerformanceTrends(
    metricNames: string[],
    period: '1h' | '24h' | '7d' | '30d' = '24h'
  ): Promise<PerformanceTrend[]> {
    try {
      const trends: PerformanceTrend[] = []
      
      for (const metricName of metricNames) {
        const data = await this.getMetricHistory(metricName, period)
        const trend = this.calculateTrend(data)
        const summary = this.calculateSummaryStats(data)
        
        trends.push({
          metric: metricName,
          period,
          data: trend,
          summary,
        })
      }

      return trends
    } catch (error) {
      console.error('Get performance trends error:', error)
      return []
    }
  }

  /**
   * Get current active alerts
   */
  async getActiveAlerts(): Promise<PerformanceAlert[]> {
    return Array.from(this.activeAlerts.values()).filter(alert => !alert.resolved)
  }

  /**
   * Get user experience metrics
   */
  async getUserExperienceMetrics(): Promise<UserExperience> {
    try {
      const cached = await advancedCache.get<UserExperience>('user_experience')
      if (cached) return cached

      // Collect Web Vitals and performance metrics
      const metrics = await this.collectUserExperienceMetrics()
      
      // Cache for 5 minutes
      await advancedCache.set('user_experience', metrics, { ttl: 300 })
      return metrics
    } catch (error) {
      console.error('Get user experience metrics error:', error)
      return this.getDefaultUserExperience()
    }
  }

  /**
   * Record a performance metric
   */
  async recordMetric(
    name: string,
    value: number,
    unit: string = 'ms',
    tags: Record<string, string> = {},
    threshold?: { warning: number; critical: number }
  ): Promise<void> {
    try {
      const metric: PerformanceMetric = {
        id: this.generateMetricId(),
        name,
        value,
        unit,
        timestamp: new Date(),
        tags,
        threshold,
      }

      // Add to buffer
      if (!this.metricsBuffer.has(name)) {
        this.metricsBuffer.set(name, [])
      }
      this.metricsBuffer.get(name)!.push(metric)

      // Check for alerts
      await this.checkAlerts(metric)

      // Store in Redis for real-time access
      if (this.redis) {
        await this.redis.zadd(
          `metrics:${name}`,
          Date.now(),
          JSON.stringify(metric)
        )
        
        // Clean up old metrics (keep last 24 hours)
        const cutoff = Date.now() - DASHBOARD_CONFIG.retentionPeriods.shortTerm * 1000
        await this.redis.zremrangebyscore(`metrics:${name}`, '-inf', cutoff)
      }

      // Report to production monitor
//       productionMonitor.recordMetric(name, value)
    } catch (error) {
      console.error('Record metric error:', error)
    }
  }

  /**
   * Get real-time dashboard data
   */
  async getRealTimeDashboard(): Promise<{
    systemHealth: SystemHealth
    recentMetrics: Record<string, PerformanceMetric[]>
    activeAlerts: PerformanceAlert[]
    userExperience: UserExperience
    quickStats: {
      avgResponseTime: number
      requestsPerSecond: number
      errorRate: number
      uptime: number
    }
  }> {
    try {
      const [systemHealth, activeAlerts, userExperience, quickStats] = await Promise.all([
        this.getSystemHealth(),
        this.getActiveAlerts(),
        this.getUserExperienceMetrics(),
        this.getQuickStats(),
      ])

      // Get recent metrics (last 5 minutes)
      const recentMetrics = await this.getRecentMetrics(['response_time', 'error_rate', 'throughput'])

      return {
        systemHealth,
        recentMetrics,
        activeAlerts,
        userExperience,
        quickStats,
      }
    } catch (error) {
      console.error('Get real-time dashboard error:', error)
      throw error
    }
  }

  /**
   * Export performance data for analysis
   */
  async exportData(
    startDate: Date,
    endDate: Date,
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    try {
      const metrics = await this.getMetricsInRange(startDate, endDate)
      const alerts = await this.getAlertsInRange(startDate, endDate)
      
      const data = {
        exportDate: new Date(),
        period: { startDate, endDate },
        metrics,
        alerts,
        summary: this.generateExportSummary(metrics, alerts),
      }

      if (format === 'csv') {
        return this.convertToCSV(data)
      }

      return JSON.stringify(data, null, 2)
    } catch (error) {
      console.error('Export data error:', error)
      throw error
    }
  }

  // Private methods

  private startMetricsCollection(): void {
    if (this.isCollecting) return

    this.isCollecting = true
    this.collectionInterval = setInterval(async () => {
      await this.collectSystemMetrics()
    }, DASHBOARD_CONFIG.sampleRates.mediumFrequency)
  }

  private async collectSystemMetrics(): Promise<void> {
    try {
      // Collect various system metrics
      await Promise.all([
        this.collectResponseTimeMetrics(),
        this.collectErrorRateMetrics(),
        this.collectResourceUtilizationMetrics(),
        this.collectThroughputMetrics(),
      ])
    } catch (error) {
      console.error('Collect system metrics error:', error)
    }
  }

  private async collectResponseTimeMetrics(): Promise<void> {
    // Simulate response time collection - in real implementation,
    // this would collect from actual API endpoints
    const responseTime = Math.random() * 1000 + 100 // 100-1100ms
    await this.recordMetric(
      'response_time',
      responseTime,
      'ms',
      { component: 'api', endpoint: 'general' },
      DASHBOARD_CONFIG.alertThresholds.responseTime
    )
  }

  private async collectErrorRateMetrics(): Promise<void> {
    // Simulate error rate collection
    const errorRate = Math.random() * 0.02 // 0-2%
    await this.recordMetric(
      'error_rate',
      errorRate,
      'percentage',
      { component: 'api' },
      DASHBOARD_CONFIG.alertThresholds.errorRate
    )
  }

  private async collectResourceUtilizationMetrics(): Promise<void> {
    // Simulate resource utilization
    const cpuUsage = Math.random() * 100
    const memoryUsage = Math.random() * 100
    
    await Promise.all([
      this.recordMetric(
        'cpu_usage',
        cpuUsage,
        'percentage',
        { resource: 'cpu' },
        DASHBOARD_CONFIG.alertThresholds.cpuUsage
      ),
      this.recordMetric(
        'memory_usage',
        memoryUsage,
        'percentage',
        { resource: 'memory' },
        DASHBOARD_CONFIG.alertThresholds.memoryUsage
      ),
    ])
  }

  private async collectThroughputMetrics(): Promise<void> {
    // Simulate throughput collection
    const requestsPerSecond = Math.random() * 100 + 10
    await this.recordMetric(
      'throughput',
      requestsPerSecond,
      'rps',
      { component: 'api' }
    )
  }

  private async collectUserExperienceMetrics(): Promise<UserExperience> {
    // In a real implementation, this would collect actual Web Vitals
    return {
      pageLoadTime: Math.random() * 2000 + 500,
      firstContentfulPaint: Math.random() * 1000 + 200,
      largestContentfulPaint: Math.random() * 3000 + 1000,
      cumulativeLayoutShift: Math.random() * 0.2,
      firstInputDelay: Math.random() * 100 + 10,
      timeToInteractive: Math.random() * 4000 + 1000,
      userSatisfactionScore: Math.random() * 30 + 70, // 70-100
    }
  }

  private async getComponentsHealth(): Promise<SystemHealth['components']> {
    // Simulate component health checks
    return {
      database: {
        status: 'healthy',
        score: 95,
        metrics: {
          responseTime: 50,
          errorRate: 0.001,
          uptime: 0.999,
          throughput: 1000,
        },
        issues: [],
      },
      redis: {
        status: 'healthy',
        score: 98,
        metrics: {
          responseTime: 5,
          errorRate: 0,
          uptime: 1.0,
        },
        issues: [],
      },
      cache: {
        status: 'warning',
        score: 85,
        metrics: {
          responseTime: 10,
          errorRate: 0.002,
          uptime: 0.98,
        },
        issues: ['High cache miss rate'],
      },
      api: {
        status: 'healthy',
        score: 92,
        metrics: {
          responseTime: 200,
          errorRate: 0.005,
          uptime: 0.995,
          throughput: 500,
        },
        issues: [],
      },
      frontend: {
        status: 'healthy',
        score: 88,
        metrics: {
          responseTime: 1500,
          errorRate: 0.01,
          uptime: 0.99,
        },
        issues: [],
      },
      external: {
        status: 'warning',
        score: 75,
        metrics: {
          responseTime: 2000,
          errorRate: 0.02,
          uptime: 0.97,
        },
        issues: ['Third-party API slow response'],
      },
    }
  }

  private calculateOverallScore(components: SystemHealth['components']): number {
    const scores = Object.values(components).map(c => c.score)
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
  }

  private determineOverallStatus(score: number): SystemHealth['overall'] {
    if (score >= 90) return 'healthy'
    if (score >= 70) return 'warning'
    return 'critical'
  }

  private async checkAlerts(metric: PerformanceMetric): Promise<void> {
    if (!metric.threshold) return

    const { warning, critical } = metric.threshold
    let level: 'warning' | 'critical' | null = null

    if (metric.value >= critical) {
      level = 'critical'
    } else if (metric.value >= warning) {
      level = 'warning'
    }

    if (level) {
      const alert: PerformanceAlert = {
        id: this.generateAlertId(),
        metric: metric.name,
        level,
        value: metric.value,
        threshold: level === 'critical' ? critical : warning,
        timestamp: new Date(),
        resolved: false,
      }

      this.activeAlerts.set(alert.id, alert)
      
      // Log alert
      console.warn(`Performance alert: ${metric.name} = ${metric.value} ${metric.unit} (${level} threshold: ${alert.threshold})`)
    }
  }

  private async getMetricHistory(
    metricName: string,
    period: '1h' | '24h' | '7d' | '30d',
    groupBy: 'minute' | 'hour' | 'day' = 'hour'
  ): Promise<PerformanceMetric[]> {
    if (!this.redis) return []

    const periodMs = {
      '1h': 3600000,
      '24h': 86400000,
      '7d': 604800000,
      '30d': 2592000000,
    }[period]

    const startTime = Date.now() - periodMs
    const results = await this.redis.zrangebyscore(`metrics:${metricName}`, startTime, '+inf')
    
    return results.map(result => JSON.parse(result)).filter(Boolean)
  }

  private calculateTrend(data: PerformanceMetric[]): PerformanceTrend['data'] {
    return data.map((point, index) => {
      const prevPoint = data[index - 1]
      let trend: 'up' | 'down' | 'stable' = 'stable'
      let change = 0

      if (prevPoint) {
        change = ((point.value - prevPoint.value) / prevPoint.value) * 100
        if (Math.abs(change) > 5) {
          trend = change > 0 ? 'up' : 'down'
        }
      }

      return {
        timestamp: point.timestamp,
        value: point.value,
        trend,
        change,
      }
    })
  }

  private calculateSummaryStats(data: PerformanceMetric[]): PerformanceTrend['summary'] {
    if (data.length === 0) {
      return { average: 0, min: 0, max: 0, p95: 0, p99: 0 }
    }

    const values = data.map(d => d.value).sort((a, b) => a - b)
    const sum = values.reduce((s, v) => s + v, 0)

    return {
      average: sum / values.length,
      min: values[0],
      max: values[values.length - 1],
      p95: values[Math.floor(values.length * 0.95)] || values[values.length - 1],
      p99: values[Math.floor(values.length * 0.99)] || values[values.length - 1],
    }
  }

  private async getQuickStats(): Promise<{
    avgResponseTime: number
    requestsPerSecond: number
    errorRate: number
    uptime: number
  }> {
    // Get recent metrics for quick stats
    const recent = await this.getRecentMetrics(['response_time', 'throughput', 'error_rate'])
    
    return {
      avgResponseTime: this.calculateAverage(recent.response_time || []),
      requestsPerSecond: this.calculateAverage(recent.throughput || []),
      errorRate: this.calculateAverage(recent.error_rate || []) * 100, // Convert to percentage
      uptime: 99.5, // Placeholder - would calculate from actual uptime data
    }
  }

  private async getRecentMetrics(metricNames: string[]): Promise<Record<string, PerformanceMetric[]>> {
    const metrics: Record<string, PerformanceMetric[]> = {}
    const fiveMinutesAgo = Date.now() - 300000 // 5 minutes

    for (const name of metricNames) {
      if (this.redis) {
        const results = await this.redis.zrangebyscore(`metrics:${name}`, fiveMinutesAgo, '+inf')
        metrics[name] = results.map(result => JSON.parse(result)).filter(Boolean)
      } else {
        metrics[name] = this.metricsBuffer.get(name)?.filter(m => 
          m.timestamp.getTime() >= fiveMinutesAgo
        ) || []
      }
    }

    return metrics
  }

  private calculateAverage(metrics: PerformanceMetric[]): number {
    if (metrics.length === 0) return 0
    return metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length
  }

  private generateMetricId(): string {
    return `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getDefaultSystemHealth(): SystemHealth {
    return {
      overall: 'unknown',
      score: 0,
      components: {
        database: { status: 'unknown', score: 0, metrics: { responseTime: 0, errorRate: 0, uptime: 0 }, issues: [] },
        redis: { status: 'unknown', score: 0, metrics: { responseTime: 0, errorRate: 0, uptime: 0 }, issues: [] },
        cache: { status: 'unknown', score: 0, metrics: { responseTime: 0, errorRate: 0, uptime: 0 }, issues: [] },
        api: { status: 'unknown', score: 0, metrics: { responseTime: 0, errorRate: 0, uptime: 0 }, issues: [] },
        frontend: { status: 'unknown', score: 0, metrics: { responseTime: 0, errorRate: 0, uptime: 0 }, issues: [] },
        external: { status: 'unknown', score: 0, metrics: { responseTime: 0, errorRate: 0, uptime: 0 }, issues: [] },
      },
      lastUpdated: new Date(),
    }
  }

  private getDefaultUserExperience(): UserExperience {
    return {
      pageLoadTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0,
      timeToInteractive: 0,
      userSatisfactionScore: 0,
    }
  }

  private async getMetricsInRange(startDate: Date, endDate: Date): Promise<PerformanceMetric[]> {
    // Implementation would fetch metrics from storage within date range
    return []
  }

  private async getAlertsInRange(startDate: Date, endDate: Date): Promise<PerformanceAlert[]> {
    // Implementation would fetch alerts from storage within date range
    return []
  }

  private generateExportSummary(metrics: PerformanceMetric[], alerts: PerformanceAlert[]): any {
    return {
      totalMetrics: metrics.length,
      totalAlerts: alerts.length,
      criticalAlerts: alerts.filter(a => a.level === 'critical').length,
      warningAlerts: alerts.filter(a => a.level === 'warning').length,
    }
  }

  private convertToCSV(data: any): string {
    // Basic CSV conversion - would need more sophisticated implementation
    return JSON.stringify(data)
  }

  destroy(): void {
    this.isCollecting = false
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval)
    }
    this.metricsBuffer.clear()
    this.activeAlerts.clear()
  }
}

// Singleton instance
export const performanceDashboard = PerformanceDashboard.getInstance()

// Utility functions for Web Vitals integration
export function recordWebVital(name: string, value: number, id?: string): void {
  performanceDashboard.recordMetric(
    `web_vital_${name}`,
    value,
    'ms',
    { type: 'web_vital', id: id || 'unknown' }
  )
}

export function recordUserInteraction(action: string, duration: number, success: boolean): void {
  performanceDashboard.recordMetric(
    'user_interaction',
    duration,
    'ms',
    { action, success: success.toString() }
  )
}

export function recordAPICall(endpoint: string, method: string, duration: number, status: number): void {
  performanceDashboard.recordMetric(
    'api_call',
    duration,
    'ms',
    { endpoint, method, status: status.toString() }
  )
}

// Export for dashboard components
export { DASHBOARD_CONFIG }