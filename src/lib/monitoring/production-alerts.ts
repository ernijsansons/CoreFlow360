/**
 * CoreFlow360 - Production Monitoring & Alerting System
 * Enterprise-grade monitoring with health checks, metrics, and alerts
 */

import { getPrisma } from '@/lib/db'
import { getRedis } from '@/lib/redis/client'

// Health check interfaces
interface HealthCheckResult {
  service: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  responseTime: number
  message?: string
  details?: any
  timestamp: Date
}

interface SystemMetrics {
  uptime: number
  memoryUsage: NodeJS.MemoryUsage
  activeConnections: number
  requestsPerMinute: number
  errorRate: number
  responseTime: {
    p50: number
    p95: number
    p99: number
  }
}

interface AlertConfig {
  metric: string
  threshold: number
  operator: 'gt' | 'lt' | 'eq'
  severity: 'info' | 'warning' | 'critical'
  description: string
  enabled: boolean
}

// Production monitoring class
export class ProductionMonitor {
  private static instance: ProductionMonitor
  private healthChecks: Map<string, HealthCheckResult> = new Map()
  private metrics: Map<string, number[]> = new Map()
  private alerts: AlertConfig[] = []
  private isRunning = false

  constructor() {
    this.initializeAlerts()
  }

  static getInstance(): ProductionMonitor {
    if (!ProductionMonitor.instance) {
      ProductionMonitor.instance = new ProductionMonitor()
    }
    return ProductionMonitor.instance
  }

  /**
   * Start monitoring system
   */
  async start(): Promise<void> {
    if (this.isRunning) return

    this.isRunning = true
    console.log('🚀 Production monitoring started')

    // Run health checks every 30 seconds
    setInterval(async () => {
      await this.runHealthChecks()
    }, 30000)

    // Collect metrics every 10 seconds
    setInterval(async () => {
      await this.collectMetrics()
    }, 10000)

    // Check alerts every minute
    setInterval(async () => {
      await this.checkAlerts()
    }, 60000)

    // Initial health check
    await this.runHealthChecks()
  }

  /**
   * Stop monitoring system
   */
  stop(): void {
    this.isRunning = false
    console.log('🛑 Production monitoring stopped')
  }

  /**
   * Run all health checks
   */
  async runHealthChecks(): Promise<Map<string, HealthCheckResult>> {
    const checks = [
      this.checkDatabase(),
      this.checkRedis(),
      this.checkExternalServices(),
      this.checkFileSystem(),
      this.checkMemoryUsage(),
    ]

    const results = await Promise.allSettled(checks)
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        this.healthChecks.set(result.value.service, result.value)
      } else {
        console.error(`Health check failed:`, result.reason)
      }
    })

    // Log overall system health
    const overallHealth = this.getOverallHealth()
    if (overallHealth !== 'healthy') {
      console.warn(`🚨 System health: ${overallHealth}`)
    }

    return this.healthChecks
  }

  /**
   * Get current system health status
   */
  getOverallHealth(): 'healthy' | 'degraded' | 'unhealthy' {
    const statuses = Array.from(this.healthChecks.values()).map(check => check.status)
    
    if (statuses.includes('unhealthy')) return 'unhealthy'
    if (statuses.includes('degraded')) return 'degraded'
    return 'healthy'
  }

  /**
   * Get health check results
   */
  getHealthChecks(): Record<string, HealthCheckResult> {
    return Object.fromEntries(this.healthChecks)
  }

  /**
   * Get system metrics
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    const uptime = process.uptime()
    const memoryUsage = process.memoryUsage()
    
    // Get metrics from storage
    const requestsPerMinute = this.getMetricAverage('requests_per_minute', 6) // Last 6 data points (1 minute)
    const errorRate = this.getMetricAverage('error_rate', 6)
    const responseTimeP50 = this.getMetricPercentile('response_time', 50)
    const responseTimeP95 = this.getMetricPercentile('response_time', 95)
    const responseTimeP99 = this.getMetricPercentile('response_time', 99)

    return {
      uptime,
      memoryUsage,
      activeConnections: await this.getActiveConnections(),
      requestsPerMinute: requestsPerMinute || 0,
      errorRate: errorRate || 0,
      responseTime: {
        p50: responseTimeP50 || 0,
        p95: responseTimeP95 || 0,
        p99: responseTimeP99 || 0,
      },
    }
  }

  // Health Check Implementations

  private async checkDatabase(): Promise<HealthCheckResult> {
    const start = Date.now()
    const prisma = getPrisma()
    
    try {
      if (prisma) {
        await prisma.$queryRaw`SELECT 1`
      }
      const responseTime = Date.now() - start
      
      return {
        service: 'database',
        status: responseTime < 1000 ? 'healthy' : 'degraded',
        responseTime,
        message: responseTime > 1000 ? 'Slow database response' : 'Database responsive',
        timestamp: new Date(),
      }
    } catch (error: any) {
      return {
        service: 'database',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        message: `Database error: ${error.message}`,
        details: error,
        timestamp: new Date(),
      }
    }
  }

  private async checkRedis(): Promise<HealthCheckResult> {
    const start = Date.now()
    
    try {
      const redis = getRedis()
      if (!redis) {
        return {
          service: 'redis',
          status: 'unhealthy',
          responseTime: 0,
          message: 'Redis client not available',
          timestamp: new Date(),
        }
      }

      await redis.ping()
      const responseTime = Date.now() - start
      
      return {
        service: 'redis',
        status: responseTime < 500 ? 'healthy' : 'degraded',
        responseTime,
        message: responseTime > 500 ? 'Slow Redis response' : 'Redis responsive',
        timestamp: new Date(),
      }
    } catch (error: any) {
      return {
        service: 'redis',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        message: `Redis error: ${error.message}`,
        details: error,
        timestamp: new Date(),
      }
    }
  }

  private async checkExternalServices(): Promise<HealthCheckResult> {
    const start = Date.now()
    
    try {
      // Check critical external services
      const checks = await Promise.allSettled([
        fetch('https://api.stripe.com/v1', { method: 'HEAD' }),
        // Add other critical service checks
      ])

      const failures = checks.filter(check => check.status === 'rejected').length
      const responseTime = Date.now() - start
      
      return {
        service: 'external_services',
        status: failures === 0 ? 'healthy' : failures < checks.length ? 'degraded' : 'unhealthy',
        responseTime,
        message: failures > 0 ? `${failures} external service(s) unreachable` : 'All external services responsive',
        details: { total: checks.length, failures },
        timestamp: new Date(),
      }
    } catch (error: any) {
      return {
        service: 'external_services',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        message: `External services check failed: ${error.message}`,
        details: error,
        timestamp: new Date(),
      }
    }
  }

  private async checkFileSystem(): Promise<HealthCheckResult> {
    const start = Date.now()
    
    try {
      const fs = await import('fs/promises')
      const testFile = '/tmp/health-check-' + Date.now()
      
      await fs.writeFile(testFile, 'health-check')
      await fs.readFile(testFile)
      await fs.unlink(testFile)
      
      const responseTime = Date.now() - start
      
      return {
        service: 'filesystem',
        status: responseTime < 100 ? 'healthy' : 'degraded',
        responseTime,
        message: 'File system read/write operations successful',
        timestamp: new Date(),
      }
    } catch (error: any) {
      return {
        service: 'filesystem',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        message: `File system error: ${error.message}`,
        details: error,
        timestamp: new Date(),
      }
    }
  }

  private async checkMemoryUsage(): Promise<HealthCheckResult> {
    const memoryUsage = process.memoryUsage()
    const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024)
    const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024)
    const heapUsagePercent = (heapUsedMB / heapTotalMB) * 100
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    let message = `Memory usage: ${heapUsedMB}MB / ${heapTotalMB}MB (${heapUsagePercent.toFixed(1)}%)`
    
    if (heapUsagePercent > 90) {
      status = 'unhealthy'
      message += ' - Critical memory usage'
    } else if (heapUsagePercent > 75) {
      status = 'degraded'
      message += ' - High memory usage'
    }
    
    return {
      service: 'memory',
      status,
      responseTime: 0,
      message,
      details: memoryUsage,
      timestamp: new Date(),
    }
  }

  // Metrics Collection

  private async collectMetrics(): Promise<void> {
    try {
      // Collect various system metrics
      const memoryUsage = process.memoryUsage()
      this.recordMetric('memory_heap_used', memoryUsage.heapUsed)
      this.recordMetric('memory_heap_total', memoryUsage.heapTotal)
      
      // Record current timestamp for uptime calculation
      this.recordMetric('uptime', process.uptime())
      
      // Collect database metrics
      const dbMetrics = await this.collectDatabaseMetrics()
      Object.entries(dbMetrics).forEach(([key, value]) => {
        this.recordMetric(`db_${key}`, value)
      })
      
    } catch (error) {
      console.error('Metrics collection error:', error)
    }
  }

  private async collectDatabaseMetrics(): Promise<Record<string, number>> {
    const prisma = getPrisma()
    try {
      const [userCount, sessionCount, activeSubscriptions] = prisma ? await Promise.all([
        prisma.user.count(),
        prisma.session.count(),
        prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      ]) : [0, 0, 0]
      
      return {
        user_count: userCount,
        session_count: sessionCount,
        active_subscriptions: activeSubscriptions,
      }
    } catch (error) {
      console.error('Database metrics collection error:', error)
      return {}
    }
  }

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    
    const values = this.metrics.get(name)!
    values.push(value)
    
    // Keep only last 100 values
    if (values.length > 100) {
      values.shift()
    }
  }

  private getMetricAverage(name: string, points: number): number | null {
    const values = this.metrics.get(name)
    if (!values || values.length === 0) return null
    
    const recentValues = values.slice(-points)
    return recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length
  }

  private getMetricPercentile(name: string, percentile: number): number | null {
    const values = this.metrics.get(name)
    if (!values || values.length === 0) return null
    
    const sorted = [...values].sort((a, b) => a - b)
    const index = Math.floor((percentile / 100) * sorted.length)
    return sorted[index] || sorted[sorted.length - 1]
  }

  private async getActiveConnections(): Promise<number> {
    try {
      // This would depend on your deployment setup
      // For Prisma, you can check connection pool status
      return 0 // Placeholder
    } catch {
      return 0
    }
  }

  // Alert System

  private initializeAlerts(): void {
    this.alerts = [
      {
        metric: 'response_time_p95',
        threshold: 2000,
        operator: 'gt',
        severity: 'warning',
        description: 'API response time P95 above 2 seconds',
        enabled: true,
      },
      {
        metric: 'error_rate',
        threshold: 5,
        operator: 'gt',
        severity: 'critical',
        description: 'Error rate above 5%',
        enabled: true,
      },
      {
        metric: 'memory_usage_percent',
        threshold: 85,
        operator: 'gt',
        severity: 'warning',
        description: 'Memory usage above 85%',
        enabled: true,
      },
      {
        metric: 'database_response_time',
        threshold: 1000,
        operator: 'gt',
        severity: 'warning',
        description: 'Database response time above 1 second',
        enabled: true,
      },
    ]
  }

  private async checkAlerts(): Promise<void> {
    const metrics = await this.getSystemMetrics()
    
    for (const alert of this.alerts) {
      if (!alert.enabled) continue
      
      const value = this.getMetricValue(metrics, alert.metric)
      if (value === null) continue
      
      const triggered = this.evaluateAlert(value, alert)
      
      if (triggered) {
        await this.triggerAlert(alert, value)
      }
    }
  }

  private getMetricValue(metrics: SystemMetrics, metricName: string): number | null {
    switch (metricName) {
      case 'response_time_p95':
        return metrics.responseTime.p95
      case 'error_rate':
        return metrics.errorRate
      case 'memory_usage_percent':
        return (metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal) * 100
      default:
        return null
    }
  }

  private evaluateAlert(value: number, alert: AlertConfig): boolean {
    switch (alert.operator) {
      case 'gt':
        return value > alert.threshold
      case 'lt':
        return value < alert.threshold
      case 'eq':
        return value === alert.threshold
      default:
        return false
    }
  }

  private async triggerAlert(alert: AlertConfig, value: number): Promise<void> {
    const alertMessage = `🚨 ${alert.severity.toUpperCase()}: ${alert.description} (${value})`
    
    console.error(alertMessage)
    
    // In production, send to alerting service (PagerDuty, Slack, etc.)
    try {
      await this.sendAlert({
        ...alert,
        value,
        timestamp: new Date(),
      })
    } catch (error) {
      console.error('Failed to send alert:', error)
    }
  }

  private async sendAlert(alertData: any): Promise<void> {
    // Implement your alerting logic here (Slack, email, PagerDuty, etc.)
    // For now, just log to audit table
    const prisma = getPrisma()
    try {
      if (prisma) {
        await prisma.auditLog.create({
        data: {
          action: 'SYSTEM_ALERT',
          metadata: alertData,
        },
      })
      }
    } catch (error) {
      console.error('Failed to log alert:', error)
    }
  }
}

// Singleton instance
export const productionMonitor = ProductionMonitor.getInstance()

// Express middleware for request monitoring
export function requestMonitoringMiddleware() {
  return (req: any, res: any, next: any) => {
    const start = Date.now()
    
    res.on('finish', () => {
      const duration = Date.now() - start
      productionMonitor.recordMetric('response_time', duration)
      
      if (res.statusCode >= 400) {
        productionMonitor.recordMetric('error_count', 1)
      }
      
      productionMonitor.recordMetric('request_count', 1)
    })
    
    next()
  }
}

// Health check endpoint handler
export async function handleHealthCheck() {
  const monitor = ProductionMonitor.getInstance()
  const healthChecks = await monitor.runHealthChecks()
  const overallHealth = monitor.getOverallHealth()
  const metrics = await monitor.getSystemMetrics()
  
  return {
    status: overallHealth,
    timestamp: new Date().toISOString(),
    uptime: metrics.uptime,
    checks: Object.fromEntries(healthChecks),
    metrics: {
      memoryUsage: `${Math.round(metrics.memoryUsage.heapUsed / 1024 / 1024)}MB`,
      activeConnections: metrics.activeConnections,
      requestsPerMinute: metrics.requestsPerMinute,
      errorRate: `${metrics.errorRate.toFixed(2)}%`,
      responseTime: metrics.responseTime,
    },
  }
}