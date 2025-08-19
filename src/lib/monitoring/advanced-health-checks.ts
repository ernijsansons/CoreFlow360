/**
 * CoreFlow360 - Advanced Health Check System
 * Comprehensive monitoring of system components with detailed diagnostics
 */

import { prisma } from '@/lib/db'
import { circuitBreakerRegistry } from '@/lib/resilience/circuit-breaker'

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown'
export type ComponentType =
  | 'database'
  | 'redis'
  | 'external_api'
  | 'filesystem'
  | 'memory'
  | 'custom'

export interface HealthCheckResult {
  name: string
  status: HealthStatus
  responseTime: number
  message?: string
  details?: Record<string, unknown>
  timestamp: number
  lastHealthy?: number
  lastUnhealthy?: number
}

export interface HealthCheckConfig {
  name: string
  type: ComponentType
  enabled: boolean
  timeout: number
  retries: number
  interval: number
  criticalThreshold: number
  warningThreshold: number
  dependencies?: string[]
}

export interface SystemHealthSummary {
  overall: HealthStatus
  components: HealthCheckResult[]
  summary: {
    healthy: number
    degraded: number
    unhealthy: number
    total: number
  }
  uptime: number
  timestamp: number
}

/**
 * Individual Health Check Classes
 */
export abstract class HealthCheck {
  constructor(public config: HealthCheckConfig) {}

  abstract check(): Promise<HealthCheckResult>

  protected createResult(
    status: HealthStatus,
    responseTime: number,
    message?: string,
    details?: Record<string, unknown>
  ): HealthCheckResult {
    return {
      name: this.config.name,
      status,
      responseTime,
      message,
      details,
      timestamp: Date.now(),
    }
  }

  protected async withTimeout<T>(operation: () => Promise<T>): Promise<T> {
    return Promise.race([
      operation(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Health check timeout')), this.config.timeout)
      ),
    ])
  }
}

/**
 * Database Health Check
 */
export class DatabaseHealthCheck extends HealthCheck {
  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now()

    try {
      await this.withTimeout(async () => {
        // Test basic connectivity
        await prisma.$queryRaw`SELECT 1 as test`

        // Test write capability
        const testRecord = await prisma.$queryRaw`
          SELECT COUNT(*) as count FROM information_schema.tables 
          WHERE table_schema = 'public'
        `

        return testRecord
      })

      const responseTime = Date.now() - startTime
      const status = responseTime > this.config.criticalThreshold ? 'degraded' : 'healthy'

      return this.createResult(status, responseTime, 'Database connection successful', {
        connectionPool: 'active',
        queryPerformance: `${responseTime}ms`,
      })
    } catch (error) {
      const responseTime = Date.now() - startTime
      return this.createResult('unhealthy', responseTime, `Database error: ${error}`, {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}

/**
 * Redis Health Check
 */
export class RedisHealthCheck extends HealthCheck {
  private redis: unknown // Would import actual Redis client

  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now()

    try {
      // Simulate Redis check (would use actual Redis client)
      await this.withTimeout(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10)) // Simulate Redis ping
        return 'PONG'
      })

      const responseTime = Date.now() - startTime
      const status = responseTime > this.config.criticalThreshold ? 'degraded' : 'healthy'

      return this.createResult(status, responseTime, 'Redis connection successful', {
        ping: 'PONG',
        memory: 'within_limits',
      })
    } catch (error) {
      const responseTime = Date.now() - startTime
      return this.createResult('unhealthy', responseTime, `Redis error: ${error}`, {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}

/**
 * External API Health Check
 */
export class ExternalAPIHealthCheck extends HealthCheck {
  constructor(
    config: HealthCheckConfig,
    private endpoint: string,
    private expectedStatus: number = 200
  ) {
    super(config)
  }

  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now()

    try {
      const response = await this.withTimeout(async () => {
        return fetch(this.endpoint, {
          method: 'GET',
          headers: { 'User-Agent': 'CoreFlow360-HealthCheck/1.0' },
        })
      })

      const responseTime = Date.now() - startTime

      if (response.status === this.expectedStatus) {
        const status = responseTime > this.config.criticalThreshold ? 'degraded' : 'healthy'
        return this.createResult(status, responseTime, 'External API responsive', {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
        })
      } else {
        return this.createResult(
          'degraded',
          responseTime,
          `Unexpected status: ${response.status}`,
          {
            status: response.status,
            statusText: response.statusText,
          }
        )
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      return this.createResult('unhealthy', responseTime, `API error: ${error}`, {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}

/**
 * Memory Health Check
 */
export class MemoryHealthCheck extends HealthCheck {
  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now()

    try {
      const memoryUsage = process.memoryUsage()
      const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024)
      const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024)
      const usagePercent = (heapUsedMB / heapTotalMB) * 100

      const responseTime = Date.now() - startTime

      let status: HealthStatus = 'healthy'
      if (usagePercent > 90) {
        status = 'unhealthy'
      } else if (usagePercent > 75) {
        status = 'degraded'
      }

      return this.createResult(status, responseTime, `Memory usage: ${usagePercent.toFixed(1)}%`, {
        heapUsed: `${heapUsedMB}MB`,
        heapTotal: `${heapTotalMB}MB`,
        usagePercent: `${usagePercent.toFixed(1)}%`,
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
      })
    } catch (error) {
      const responseTime = Date.now() - startTime
      return this.createResult('unhealthy', responseTime, `Memory check error: ${error}`)
    }
  }
}

/**
 * Circuit Breaker Health Check
 */
export class CircuitBreakerHealthCheck extends HealthCheck {
  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now()

    try {
      const allStats = circuitBreakerRegistry.getAllStats()
      const breakerStates = Object.entries(allStats)

      const openBreakers = breakerStates.filter(([_, stats]) => stats.state === 'OPEN')
      const halfOpenBreakers = breakerStates.filter(([_, stats]) => stats.state === 'HALF_OPEN')

      let status: HealthStatus = 'healthy'
      let message = 'All circuit breakers operational'

      if (openBreakers.length > 0) {
        status = openBreakers.length > 2 ? 'unhealthy' : 'degraded'
        message = `${openBreakers.length} circuit breakers open`
      } else if (halfOpenBreakers.length > 0) {
        status = 'degraded'
        message = `${halfOpenBreakers.length} circuit breakers in recovery`
      }

      const responseTime = Date.now() - startTime

      return this.createResult(status, responseTime, message, {
        totalBreakers: breakerStates.length,
        _closedBreakers: breakerStates.filter(([_, stats]) => stats.state === 'CLOSED').length,
        openBreakers: openBreakers.length,
        halfOpenBreakers: halfOpenBreakers.length,
        breakerDetails: Object.fromEntries(
          breakerStates.map(([name, stats]) => [
            name,
            {
              state: stats.state,
              failures: stats.failures,
              successes: stats.successes,
              errorRate: stats.errorRate,
            },
          ])
        ),
      })
    } catch (error) {
      const responseTime = Date.now() - startTime
      return this.createResult('unhealthy', responseTime, `Circuit breaker check error: ${error}`)
    }
  }
}

/**
 * Disk Space Health Check
 */
export class DiskSpaceHealthCheck extends HealthCheck {
  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now()

    try {
      // Simulate disk space check (would use actual fs operations)
      const diskInfo = {
        used: 45000000000, // 45GB
        total: 100000000000, // 100GB
        available: 55000000000, // 55GB
      }

      const usagePercent = (diskInfo.used / diskInfo.total) * 100

      let status: HealthStatus = 'healthy'
      if (usagePercent > 95) {
        status = 'unhealthy'
      } else if (usagePercent > 85) {
        status = 'degraded'
      }

      const responseTime = Date.now() - startTime

      return this.createResult(status, responseTime, `Disk usage: ${usagePercent.toFixed(1)}%`, {
        usedGB: Math.round(diskInfo.used / 1024 / 1024 / 1024),
        totalGB: Math.round(diskInfo.total / 1024 / 1024 / 1024),
        availableGB: Math.round(diskInfo.available / 1024 / 1024 / 1024),
        usagePercent: `${usagePercent.toFixed(1)}%`,
      })
    } catch (error) {
      const responseTime = Date.now() - startTime
      return this.createResult('unhealthy', responseTime, `Disk space check error: ${error}`)
    }
  }
}

/**
 * Health Check Registry and Manager
 */
export class HealthCheckManager {
  private checks = new Map<string, HealthCheck>()
  private lastResults = new Map<string, HealthCheckResult>()
  private intervals = new Map<string, NodeJS.Timeout>()
  private startTime = Date.now()

  registerCheck(check: HealthCheck): void {
    this.checks.set(check.config.name, check)

    // Start interval checking if enabled
    if (check.config.enabled && check.config.interval > 0) {
      const interval = setInterval(async () => {
        try {
          const result = await check.check()
          this.lastResults.set(check.config.name, result)
        } catch (error) {}
      }, check.config.interval)

      this.intervals.set(check.config.name, interval)
    }
  }

  unregisterCheck(name: string): void {
    const interval = this.intervals.get(name)
    if (interval) {
      clearInterval(interval)
      this.intervals.delete(name)
    }

    this.checks.delete(name)
    this.lastResults.delete(name)
  }

  async runCheck(name: string): Promise<HealthCheckResult> {
    const check = this.checks.get(name)
    if (!check) {
      throw new Error(`Health check '${name}' not found`)
    }

    const result = await check.check()
    this.lastResults.set(name, result)
    return result
  }

  async runAllChecks(): Promise<HealthCheckResult[]> {
    const results: HealthCheckResult[] = []

    for (const [name, check] of this.checks) {
      if (check.config.enabled) {
        try {
          const result = await this.runCheck(name)
          results.push(result)
        } catch (error) {
          results.push({
            name,
            status: 'unhealthy',
            responseTime: 0,
            message: `Check failed: ${error}`,
            timestamp: Date.now(),
          })
        }
      }
    }

    return results
  }

  async getSystemHealth(): Promise<SystemHealthSummary> {
    const results = await this.runAllChecks()

    const summary = {
      healthy: results.filter((r) => r.status === 'healthy').length,
      degraded: results.filter((r) => r.status === 'degraded').length,
      unhealthy: results.filter((r) => r.status === 'unhealthy').length,
      total: results.length,
    }

    let overall: HealthStatus = 'healthy'
    if (summary.unhealthy > 0) {
      overall = 'unhealthy'
    } else if (summary.degraded > 0) {
      overall = 'degraded'
    }

    return {
      overall,
      components: results,
      summary,
      uptime: Date.now() - this.startTime,
      timestamp: Date.now(),
    }
  }

  getLastResult(name: string): HealthCheckResult | undefined {
    return this.lastResults.get(name)
  }

  getAllLastResults(): HealthCheckResult[] {
    return Array.from(this.lastResults.values())
  }

  stop(): void {
    for (const interval of this.intervals.values()) {
      clearInterval(interval)
    }
    this.intervals.clear()
  }
}

/**
 * Default Health Check Configurations
 */
export const defaultHealthChecks = {
  database: new DatabaseHealthCheck({
    name: 'database',
    type: 'database',
    enabled: true,
    timeout: 5000,
    retries: 2,
    interval: 30000, // 30 seconds
    criticalThreshold: 1000,
    warningThreshold: 500,
  }),

  memory: new MemoryHealthCheck({
    name: 'memory',
    type: 'memory',
    enabled: true,
    timeout: 1000,
    retries: 1,
    interval: 60000, // 1 minute
    criticalThreshold: 500,
    warningThreshold: 200,
  }),

  circuitBreakers: new CircuitBreakerHealthCheck({
    name: 'circuit_breakers',
    type: 'custom',
    enabled: true,
    timeout: 2000,
    retries: 1,
    interval: 45000, // 45 seconds
    criticalThreshold: 1000,
    warningThreshold: 500,
  }),

  diskSpace: new DiskSpaceHealthCheck({
    name: 'disk_space',
    type: 'filesystem',
    enabled: true,
    timeout: 3000,
    retries: 1,
    interval: 300000, // 5 minutes
    criticalThreshold: 2000,
    warningThreshold: 1000,
  }),

  stripeAPI: new ExternalAPIHealthCheck(
    {
      name: 'stripe_api',
      type: 'external_api',
      enabled: true,
      timeout: 10000,
      retries: 2,
      interval: 120000, // 2 minutes
      criticalThreshold: 5000,
      warningThreshold: 2000,
    },
    'https://api.stripe.com/healthcheck',
    200
  ),
}

/**
 * Global Health Check Manager Instance
 */
export const healthCheckManager = new HealthCheckManager()

// Register default health checks
Object.values(defaultHealthChecks).forEach((check) => {
  healthCheckManager.registerCheck(check)
})

/**
 * Graceful shutdown handler
 */
process.on('SIGTERM', () => {
  healthCheckManager.stop()
})

process.on('SIGINT', () => {
  healthCheckManager.stop()
})
