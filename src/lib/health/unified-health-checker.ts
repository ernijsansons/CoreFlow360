/**
 * Unified Health Check System
 * Consolidates health check logic to eliminate 150+ lines of duplication
 */

import { NextRequest } from 'next/server'

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy'
  responseTime: number
  error?: string
  details?: Record<string, any>
}

export interface SystemHealthReport {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'shutting_down'
  timestamp: string
  version: string
  environment: string
  uptime: number
  services: Record<string, HealthCheckResult>
  system?: {
    memory: { used: number; total: number; percentage: number }
    cpu: { usage: number; cores: number; loadAverage: number[] }
    disk: { used: number; total: number; percentage: number }
  }
  performance?: {
    responseTime: number
    requestsPerSecond?: number
    errorRate?: number
    [key: string]: any
  }
  metrics?: Record<string, any>
}

export interface HealthCheckOptions {
  includeSystem?: boolean
  includeMetrics?: boolean
  includePerformance?: boolean
  timeout?: number
  detailed?: boolean
}

/**
 * Unified Health Check Manager
 * Eliminates duplication across health check endpoints
 */
export class UnifiedHealthChecker {
  private static instance: UnifiedHealthChecker
  private checkers: Map<string, () => Promise<HealthCheckResult>> = new Map()
  private startTime = Date.now()

  static getInstance(): UnifiedHealthChecker {
    if (!UnifiedHealthChecker.instance) {
      UnifiedHealthChecker.instance = new UnifiedHealthChecker()
    }
    return UnifiedHealthChecker.instance
  }

  /**
   * Register a health check function
   */
  registerCheck(name: string, checker: () => Promise<HealthCheckResult>): void {
    this.checkers.set(name, checker)
  }

  /**
   * Remove a health check
   */
  unregisterCheck(name: string): void {
    this.checkers.delete(name)
  }

  /**
   * Run all registered health checks
   */
  async runAllChecks(options: HealthCheckOptions = {}): Promise<SystemHealthReport> {
    const startTime = Date.now()
    const { timeout = 5000, includeSystem = false, includeMetrics = false, includePerformance = false } = options

    // Run all health checks in parallel with timeout
    const checkPromises = Array.from(this.checkers.entries()).map(async ([name, checker]) => {
      try {
        const result = await Promise.race([
          checker(),
          this.createTimeoutPromise(timeout, name)
        ])
        return [name, result] as [string, HealthCheckResult]
      } catch (error: any) {
        return [name, {
          status: 'unhealthy' as const,
          responseTime: Date.now() - startTime,
          error: error.message || 'Health check failed'
        }] as [string, HealthCheckResult]
      }
    })

    const checkResults = await Promise.all(checkPromises)
    const services = Object.fromEntries(checkResults)

    // Determine overall health status
    const overallStatus = this.calculateOverallStatus(services)

    const report: SystemHealthReport = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || '2.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      services,
      performance: {
        responseTime: Date.now() - startTime
      }
    }

    // Add optional system metrics
    if (includeSystem) {
      report.system = await this.getSystemMetrics()
    }

    // Add optional performance metrics
    if (includePerformance) {
      report.performance = {
        ...report.performance,
        ...(await this.getPerformanceMetrics())
      }
    }

    // Add optional detailed metrics
    if (includeMetrics) {
      report.metrics = await this.getDetailedMetrics()
    }

    return report
  }

  /**
   * Run a specific health check
   */
  async runCheck(name: string): Promise<HealthCheckResult | null> {
    const checker = this.checkers.get(name)
    if (!checker) {
      return null
    }

    try {
      return await checker()
    } catch (error: any) {
      return {
        status: 'unhealthy',
        responseTime: 0,
        error: error.message || 'Health check failed'
      }
    }
  }

  /**
   * Get a simple health status (for basic endpoints)
   */
  async getSimpleHealth(): Promise<{ status: string; timestamp: string }> {
    const checks = await this.runAllChecks({ timeout: 2000 })
    return {
      status: checks.status,
      timestamp: checks.timestamp
    }
  }

  /**
   * Create standardized health check response
   */
  createHealthResponse(report: SystemHealthReport, request?: NextRequest) {
    const statusCode = this.getStatusCode(report.status)
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Health-Status': report.status,
      'X-Response-Time': String(report.performance?.responseTime || 0)
    }

    // Add CORS headers if needed
    if (request) {
      headers['Access-Control-Allow-Origin'] = '*'
      headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
    }

    return {
      statusCode,
      headers,
      body: report
    }
  }

  /**
   * Initialize default health checks
   */
  initializeDefaultChecks(): void {
    // Database health check
    this.registerCheck('database', this.createDatabaseCheck())
    
    // Redis health check
    this.registerCheck('redis', this.createRedisCheck())
    
    // Configuration health check
    this.registerCheck('configuration', this.createConfigurationCheck())
    
    // AI services health check
    this.registerCheck('ai', this.createAIServicesCheck())
  }

  /**
   * Database health checker factory
   */
  private createDatabaseCheck(): () => Promise<HealthCheckResult> {
    return async () => {
      const startTime = Date.now()
      
      try {
        const { checkDatabaseHealth } = await import('@/lib/db')
        const isHealthy = await checkDatabaseHealth()
        
        return {
          status: isHealthy ? 'healthy' : 'unhealthy',
          responseTime: Date.now() - startTime,
          details: {
            connected: isHealthy,
            pool: 'active'
          }
        }
      } catch (error: any) {
        return {
          status: 'unhealthy',
          responseTime: Date.now() - startTime,
          error: 'Database connection failed',
          details: {
            connected: false,
            error: error.message
          }
        }
      }
    }
  }

  /**
   * Redis health checker factory
   */
  private createRedisCheck(): () => Promise<HealthCheckResult> {
    return async () => {
      const startTime = Date.now()
      
      try {
        const { redis } = await import('@/lib/redis')
        const response = await redis.ping()
        
        return {
          status: response === 'PONG' ? 'healthy' : 'unhealthy',
          responseTime: Date.now() - startTime,
          details: {
            response,
            connected: true
          }
        }
      } catch (error: any) {
        return {
          status: 'unhealthy',
          responseTime: Date.now() - startTime,
          error: 'Redis connection failed',
          details: {
            connected: false,
            error: error.message
          }
        }
      }
    }
  }

  /**
   * Configuration health checker factory
   */
  private createConfigurationCheck(): () => Promise<HealthCheckResult> {
    return async () => {
      const startTime = Date.now()
      
      try {
        const { isConfigValid, getConfigErrors } = await import('@/lib/config')
        const isValid = isConfigValid()
        const errors = isValid ? [] : getConfigErrors()
        
        return {
          status: isValid ? 'healthy' : 'unhealthy',
          responseTime: Date.now() - startTime,
          details: {
            valid: isValid,
            errors: errors.length > 0 ? errors : undefined
          }
        }
      } catch (error: any) {
        return {
          status: 'unhealthy',
          responseTime: Date.now() - startTime,
          error: 'Configuration validation failed'
        }
      }
    }
  }

  /**
   * AI services health checker factory
   */
  private createAIServicesCheck(): () => Promise<HealthCheckResult> {
    return async () => {
      const startTime = Date.now()
      
      try {
        // Simple AI service connectivity check
        const hasOpenAI = !!process.env.OPENAI_API_KEY
        const hasAnthropic = !!process.env.ANTHROPIC_API_KEY
        
        const status = hasOpenAI || hasAnthropic ? 'healthy' : 'degraded'
        
        return {
          status,
          responseTime: Date.now() - startTime,
          details: {
            openai: hasOpenAI,
            anthropic: hasAnthropic,
            available: hasOpenAI || hasAnthropic
          }
        }
      } catch (error: any) {
        return {
          status: 'unhealthy',
          responseTime: Date.now() - startTime,
          error: 'AI services check failed'
        }
      }
    }
  }

  /**
   * Calculate overall system status
   */
  private calculateOverallStatus(services: Record<string, HealthCheckResult>): SystemHealthReport['status'] {
    const statuses = Object.values(services).map(s => s.status)
    
    if (statuses.some(s => s === 'unhealthy')) {
      const unhealthyCount = statuses.filter(s => s === 'unhealthy').length
      return unhealthyCount > statuses.length / 2 ? 'unhealthy' : 'degraded'
    }
    
    if (statuses.some(s => s === 'degraded')) {
      return 'degraded'
    }
    
    return 'healthy'
  }

  /**
   * Get system-level metrics
   */
  private async getSystemMetrics() {
    try {
      const os = await import('os')
      
      const totalMemory = os.totalmem()
      const freeMemory = os.freemem()
      const usedMemory = totalMemory - freeMemory
      
      return {
        memory: {
          used: Math.round(usedMemory / 1024 / 1024), // MB
          total: Math.round(totalMemory / 1024 / 1024), // MB
          percentage: Number((usedMemory / totalMemory).toFixed(2))
        },
        cpu: {
          usage: 0, // Would need additional calculation
          cores: os.cpus().length,
          loadAverage: os.loadavg()
        },
        disk: {
          used: 0, // Would need filesystem stats
          total: 0,
          percentage: 0
        }
      }
    } catch (error) {
      return undefined
    }
  }

  /**
   * Get performance metrics
   */
  private async getPerformanceMetrics() {
    try {
      const { PerformanceMonitor } = await import('@/utils/performance')
      const monitor = PerformanceMonitor.getInstance()
      
      return {
        requestsPerSecond: monitor.getRequestsPerSecond(),
        errorRate: monitor.getErrorRate(),
        averageResponseTime: monitor.getAverageResponseTime()
      }
    } catch (error) {
      return {}
    }
  }

  /**
   * Get detailed metrics
   */
  private async getDetailedMetrics() {
    try {
      const metrics: Record<string, any> = {}
      
      // Add Redis metrics if available
      try {
        const { redis } = await import('@/lib/redis')
        metrics.cache = {
          hitRate: redis.getHitRate?.() || 0,
          stats: redis.getStats?.() || {}
        }
      } catch (error) {
        // Redis not available
      }
      
      return metrics
    } catch (error) {
      return {}
    }
  }

  /**
   * Create timeout promise for health checks
   */
  private createTimeoutPromise(timeout: number, checkName: string): Promise<HealthCheckResult> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Health check '${checkName}' timed out after ${timeout}ms`))
      }, timeout)
    })
  }

  /**
   * Get HTTP status code for health status
   */
  private getStatusCode(status: SystemHealthReport['status']): number {
    switch (status) {
      case 'healthy': return 200
      case 'degraded': return 200 // Still operational
      case 'unhealthy': return 503
      case 'shutting_down': return 503
      default: return 500
    }
  }
}

/**
 * Convenience function to get health checker instance
 */
export function getHealthChecker(): UnifiedHealthChecker {
  return UnifiedHealthChecker.getInstance()
}

/**
 * Initialize health checker with default checks
 */
export function initializeHealthChecker(): UnifiedHealthChecker {
  const checker = UnifiedHealthChecker.getInstance()
  checker.initializeDefaultChecks()
  return checker
}

/**
 * Create a health check endpoint handler
 */
export function createHealthEndpoint(options: HealthCheckOptions = {}) {
  return async (request: NextRequest) => {
    const checker = getHealthChecker()
    const report = await checker.runAllChecks(options)
    const response = checker.createHealthResponse(report, request)
    
    return new Response(JSON.stringify(response.body), {
      status: response.statusCode,
      headers: response.headers
    })
  }
}

/**
 * Middleware for adding health check headers to all responses
 */
export function healthCheckMiddleware() {
  return async (request: NextRequest) => {
    const checker = getHealthChecker()
    const simpleHealth = await checker.getSimpleHealth()
    
    // Add health status to response headers
    return {
      'X-Health-Status': simpleHealth.status,
      'X-Health-Timestamp': simpleHealth.timestamp
    }
  }
}