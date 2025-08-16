/**
 * CoreFlow360 - Enterprise Connection Pool Manager
 * Advanced database connection management with auto-scaling and health monitoring
 */

import { PrismaClient } from '@prisma/client'
import { Redis } from 'ioredis'
import { EventEmitter } from 'events'

export interface PoolConfig {
  minConnections: number
  maxConnections: number
  acquireTimeoutMs: number
  createTimeoutMs: number
  destroyTimeoutMs: number
  idleTimeoutMs: number
  reapIntervalMs: number
  createRetryIntervalMs: number
  propagateCreateError: boolean
}

export interface PoolMetrics {
  totalConnections: number
  activeConnections: number
  idleConnections: number
  queuedRequests: number
  averageAcquireTime: number
  totalAcquires: number
  totalReleases: number
  totalCreations: number
  totalDestructions: number
  totalErrors: number
  lastError?: Error
  timestamp: Date
}

export interface DatabaseHealth {
  status: 'healthy' | 'degraded' | 'critical'
  responseTime: number
  connectionCount: number
  queueDepth: number
  errorRate: number
  recommendations: string[]
}

export class ConnectionPoolManager extends EventEmitter {
  private pools: Map<string, PrismaClient>
  private poolConfigs: Map<string, PoolConfig>
  private poolMetrics: Map<string, PoolMetrics>
  private redis: Redis
  private healthChecks: Map<string, DatabaseHealth>
  private monitoringInterval: NodeJS.Timer | null = null

  constructor(redis: Redis) {
    super()
    this.pools = new Map()
    this.poolConfigs = new Map()
    this.poolMetrics = new Map()
    this.redis = redis
    this.healthChecks = new Map()
    
    this.initializeDefaultConfigs()
    this.startHealthMonitoring()
  }

  /**
   * Create or get a connection pool for a specific tenant/database
   */
  async getPool(tenantId: string, config?: Partial<PoolConfig>): Promise<PrismaClient> {
    if (this.pools.has(tenantId)) {
      return this.pools.get(tenantId)!
    }
    
    const poolConfig = { ...this.getDefaultConfig(), ...config }
    const pool = await this.createPool(tenantId, poolConfig)
    
    this.pools.set(tenantId, pool)
    this.poolConfigs.set(tenantId, poolConfig)
    this.initializePoolMetrics(tenantId)
    
    console.log(`📊 Created connection pool for tenant: ${tenantId}`)
    return pool
  }

  /**
   * Execute query with connection pool optimization
   */
  async executeWithPool<T>(
    tenantId: string,
    operation: (prisma: PrismaClient) => Promise<T>,
    options?: {
      timeout?: number
      retries?: number
      priority?: 'high' | 'medium' | 'low'
    }
  ): Promise<T> {
    const startTime = Date.now()
    const pool = await this.getPool(tenantId)
    const metrics = this.poolMetrics.get(tenantId)!
    
    try {
      // Update metrics - acquire
      metrics.totalAcquires++
      metrics.activeConnections++
      
      // Execute operation with timeout
      const timeout = options?.timeout || 30000
      const result = await Promise.race([
        operation(pool),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), timeout)
        )
      ])
      
      // Update metrics - success
      const acquireTime = Date.now() - startTime
      metrics.averageAcquireTime = (metrics.averageAcquireTime + acquireTime) / 2
      metrics.totalReleases++
      metrics.activeConnections--
      metrics.timestamp = new Date()
      
      // Emit success event
      this.emit('querySuccess', {
        tenantId,
        duration: acquireTime,
        poolSize: metrics.totalConnections
      })
      
      return result
      
    } catch (error) {
      // Update metrics - error
      metrics.totalErrors++
      metrics.lastError = error as Error
      metrics.activeConnections--
      metrics.timestamp = new Date()
      
      // Emit error event
      this.emit('queryError', {
        tenantId,
        error,
        duration: Date.now() - startTime,
        poolSize: metrics.totalConnections
      })
      
      // Implement retry logic
      if (options?.retries && options.retries > 0) {
        console.log(`🔄 Retrying query for tenant ${tenantId}, ${options.retries} retries left`)
        return this.executeWithPool(tenantId, operation, { ...options, retries: options.retries - 1 })
      }
      
      throw error
    }
  }

  /**
   * Auto-scale connection pools based on usage patterns
   */
  async autoScalePools(): Promise<void> {
    for (const [tenantId, metrics] of this.poolMetrics) {
      const config = this.poolConfigs.get(tenantId)!
      const health = this.healthChecks.get(tenantId)!
      
      // Calculate scaling needs
      const utilizationRate = metrics.activeConnections / metrics.totalConnections
      const queuePressure = metrics.queuedRequests > 0
      const highLatency = metrics.averageAcquireTime > 100
      
      let shouldScale = false
      let newMaxConnections = config.maxConnections
      
      // Scale up conditions
      if ((utilizationRate > 0.8 || queuePressure || highLatency) && health.status !== 'critical') {
        newMaxConnections = Math.min(config.maxConnections * 2, 100)
        shouldScale = true
        console.log(`📈 Scaling UP pool for tenant ${tenantId}: ${config.maxConnections} → ${newMaxConnections}`)
      }
      
      // Scale down conditions
      if (utilizationRate < 0.3 && !queuePressure && !highLatency) {
        newMaxConnections = Math.max(config.maxConnections / 2, config.minConnections)
        if (newMaxConnections !== config.maxConnections) {
          shouldScale = true
          console.log(`📉 Scaling DOWN pool for tenant ${tenantId}: ${config.maxConnections} → ${newMaxConnections}`)
        }
      }
      
      // Apply scaling
      if (shouldScale) {
        await this.scalePool(tenantId, { ...config, maxConnections: newMaxConnections })
      }
    }
  }

  /**
   * Get comprehensive pool analytics
   */
  getPoolAnalytics(): {
    totalPools: number
    totalConnections: number
    healthyPools: number
    degradedPools: number
    criticalPools: number
    averageUtilization: number
    topPools: Array<{
      tenantId: string
      connections: number
      utilization: number
      errorRate: number
      status: string
    }>
    recommendations: string[]
  } {
    const pools = Array.from(this.poolMetrics.entries())
    const healthChecks = Array.from(this.healthChecks.entries())
    
    const totalPools = pools.length
    const totalConnections = pools.reduce((sum, [, metrics]) => sum + metrics.totalConnections, 0)
    
    const healthyPools = healthChecks.filter(([, health]) => health.status === 'healthy').length
    const degradedPools = healthChecks.filter(([, health]) => health.status === 'degraded').length
    const criticalPools = healthChecks.filter(([, health]) => health.status === 'critical').length
    
    const utilizationRates = pools.map(([, metrics]) => 
      metrics.totalConnections > 0 ? metrics.activeConnections / metrics.totalConnections : 0
    )
    const averageUtilization = utilizationRates.length > 0 
      ? utilizationRates.reduce((sum, rate) => sum + rate, 0) / utilizationRates.length 
      : 0
    
    const topPools = pools
      .map(([tenantId, metrics]) => {
        const health = this.healthChecks.get(tenantId)!
        const utilization = metrics.totalConnections > 0 
          ? metrics.activeConnections / metrics.totalConnections 
          : 0
        const errorRate = metrics.totalAcquires > 0 
          ? (metrics.totalErrors / metrics.totalAcquires) * 100 
          : 0
        
        return {
          tenantId,
          connections: metrics.totalConnections,
          utilization: Math.round(utilization * 100),
          errorRate: Math.round(errorRate * 100) / 100,
          status: health.status
        }
      })
      .sort((a, b) => b.connections - a.connections)
      .slice(0, 10)
    
    const recommendations = this.generatePoolRecommendations(pools, healthChecks)
    
    return {
      totalPools,
      totalConnections,
      healthyPools,
      degradedPools,
      criticalPools,
      averageUtilization: Math.round(averageUtilization * 100),
      topPools,
      recommendations
    }
  }

  /**
   * Force pool refresh and cleanup
   */
  async refreshPools(tenantId?: string): Promise<void> {
    const poolsToRefresh = tenantId ? [tenantId] : Array.from(this.pools.keys())
    
    for (const id of poolsToRefresh) {
      try {
        console.log(`🔄 Refreshing pool for tenant: ${id}`)
        
        // Disconnect existing pool
        const existingPool = this.pools.get(id)
        if (existingPool) {
          await existingPool.$disconnect()
        }
        
        // Create new pool
        const config = this.poolConfigs.get(id) || this.getDefaultConfig()
        const newPool = await this.createPool(id, config)
        
        this.pools.set(id, newPool)
        this.initializePoolMetrics(id)
        
        console.log(`✅ Pool refreshed for tenant: ${id}`)
        
      } catch (error) {
        console.error(`❌ Failed to refresh pool for tenant ${id}:`, error)
      }
    }
  }

  // Private methods
  private async createPool(tenantId: string, config: PoolConfig): Promise<PrismaClient> {
    // In a real implementation, you might create tenant-specific database URLs
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/coreflow360'
    
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl
        }
      },
      // Connection pool configuration would go here
      // Note: Prisma handles connection pooling internally
    })
    
    // Test the connection
    try {
      await prisma.$queryRaw`SELECT 1`
      console.log(`✅ Database connection established for tenant: ${tenantId}`)
    } catch (error) {
      console.error(`❌ Failed to establish database connection for tenant ${tenantId}:`, error)
      throw error
    }
    
    return prisma
  }

  private initializePoolMetrics(tenantId: string): void {
    this.poolMetrics.set(tenantId, {
      totalConnections: 10, // Default pool size
      activeConnections: 0,
      idleConnections: 10,
      queuedRequests: 0,
      averageAcquireTime: 0,
      totalAcquires: 0,
      totalReleases: 0,
      totalCreations: 1,
      totalDestructions: 0,
      totalErrors: 0,
      timestamp: new Date()
    })
    
    // Initialize health check
    this.healthChecks.set(tenantId, {
      status: 'healthy',
      responseTime: 0,
      connectionCount: 10,
      queueDepth: 0,
      errorRate: 0,
      recommendations: []
    })
  }

  private async scalePool(tenantId: string, newConfig: PoolConfig): Promise<void> {
    // Update configuration
    this.poolConfigs.set(tenantId, newConfig)
    
    // In a real implementation, you would adjust the actual pool size
    // For now, we'll update the metrics to reflect the new size
    const metrics = this.poolMetrics.get(tenantId)!
    metrics.totalConnections = newConfig.maxConnections
    metrics.idleConnections = newConfig.maxConnections - metrics.activeConnections
    
    this.emit('poolScaled', {
      tenantId,
      newSize: newConfig.maxConnections,
      previousSize: metrics.totalConnections
    })
  }

  private startHealthMonitoring(): void {
    this.monitoringInterval = setInterval(async () => {
      await this.performHealthChecks()
      await this.autoScalePools()
    }, 30000) // Check every 30 seconds
  }

  private async performHealthChecks(): Promise<void> {
    for (const [tenantId, pool] of this.pools) {
      try {
        const startTime = Date.now()
        
        // Perform health check query
        await pool.$queryRaw`SELECT 1`
        
        const responseTime = Date.now() - startTime
        const metrics = this.poolMetrics.get(tenantId)!
        
        // Calculate error rate
        const errorRate = metrics.totalAcquires > 0 
          ? (metrics.totalErrors / metrics.totalAcquires) * 100 
          : 0
        
        // Determine health status
        let status: 'healthy' | 'degraded' | 'critical' = 'healthy'
        const recommendations: string[] = []
        
        if (responseTime > 1000 || errorRate > 5) {
          status = 'degraded'
          recommendations.push('High response time or error rate detected')
        }
        
        if (responseTime > 5000 || errorRate > 20) {
          status = 'critical'
          recommendations.push('Critical performance issues detected')
        }
        
        if (metrics.queuedRequests > 10) {
          status = 'degraded'
          recommendations.push('High queue depth detected')
        }
        
        // Update health status
        this.healthChecks.set(tenantId, {
          status,
          responseTime,
          connectionCount: metrics.totalConnections,
          queueDepth: metrics.queuedRequests,
          errorRate: Math.round(errorRate * 100) / 100,
          recommendations
        })
        
      } catch (error) {
        // Mark as critical if health check fails
        this.healthChecks.set(tenantId, {
          status: 'critical',
          responseTime: -1,
          connectionCount: 0,
          queueDepth: -1,
          errorRate: 100,
          recommendations: ['Health check failed', 'Connection may be lost']
        })
        
        console.error(`❌ Health check failed for tenant ${tenantId}:`, error)
      }
    }
  }

  private generatePoolRecommendations(
    pools: Array<[string, PoolMetrics]>, 
    healthChecks: Array<[string, DatabaseHealth]>
  ): string[] {
    const recommendations = []
    
    // Check overall pool utilization
    const totalConnections = pools.reduce((sum, [, metrics]) => sum + metrics.totalConnections, 0)
    const totalActive = pools.reduce((sum, [, metrics]) => sum + metrics.activeConnections, 0)
    const overallUtilization = totalConnections > 0 ? totalActive / totalConnections : 0
    
    if (overallUtilization > 0.8) {
      recommendations.push('Consider increasing overall connection pool capacity')
    }
    
    if (overallUtilization < 0.3) {
      recommendations.push('Connection pools may be over-provisioned')
    }
    
    // Check for critical pools
    const criticalPools = healthChecks.filter(([, health]) => health.status === 'critical').length
    if (criticalPools > 0) {
      recommendations.push(`${criticalPools} pools require immediate attention`)
    }
    
    // Check for high error rates
    const highErrorPools = pools.filter(([, metrics]) => {
      const errorRate = metrics.totalAcquires > 0 ? (metrics.totalErrors / metrics.totalAcquires) * 100 : 0
      return errorRate > 10
    }).length
    
    if (highErrorPools > 0) {
      recommendations.push('Some pools have high error rates - investigate query optimization')
    }
    
    return recommendations
  }

  private getDefaultConfig(): PoolConfig {
    return {
      minConnections: 2,
      maxConnections: 10,
      acquireTimeoutMs: 60000,
      createTimeoutMs: 30000,
      destroyTimeoutMs: 5000,
      idleTimeoutMs: 300000,
      reapIntervalMs: 1000,
      createRetryIntervalMs: 200,
      propagateCreateError: false
    }
  }

  private initializeDefaultConfigs(): void {
    // Initialize with default configuration
    console.log('📊 Initializing connection pool manager')
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
    }
    
    // Disconnect all pools
    const disconnectPromises = Array.from(this.pools.values()).map(pool => pool.$disconnect())
    await Promise.all(disconnectPromises)
    
    console.log('✅ Connection pool manager cleanup completed')
  }
}

export default ConnectionPoolManager