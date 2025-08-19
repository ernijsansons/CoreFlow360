/**
 * CoreFlow360 - Enterprise Query Optimization Engine
 * Advanced database performance optimization with intelligent caching and query analysis
 */

import { PrismaClient, Prisma } from '@prisma/client'
import { Redis } from 'ioredis'
import { performance } from 'perf_hooks'
import { EventEmitter } from 'events'

export interface QueryMetrics {
  queryHash: string
  executionTime: number
  resultSize: number
  cacheHit: boolean
  timestamp: Date
  tenantId: string
  operation: string
  table: string
}

export interface OptimizationRule {
  id: string
  name: string
  description: string
  condition: (query: string, params: unknown) => boolean
  optimization: (query: string, params: unknown) => { query: string; params: unknown }
  enabled: boolean
  priority: number
}

export interface CacheStrategy {
  pattern: string
  ttl: number
  tags: string[]
  invalidationRules: string[]
  compression: boolean
  preload: boolean
}

export class QueryOptimizer extends EventEmitter {
  private redis: Redis
  private queryMetrics: Map<string, QueryMetrics[]>
  private optimizationRules: OptimizationRule[]
  private cacheStrategies: Map<string, CacheStrategy>
  private queryAnalysis: Map<string, unknown>
  private isEnabled: boolean = true

  constructor(redis: Redis) {
    super()
    this.redis = redis
    this.queryMetrics = new Map()
    this.optimizationRules = []
    this.cacheStrategies = new Map()
    this.queryAnalysis = new Map()

    this.initializeOptimizationRules()
    this.initializeCacheStrategies()
    this.startMetricsCollection()
  }

  /**
   * Optimize and execute a database query with caching
   */
  async optimizeQuery<T>(
    operation: string,
    queryFn: () => Promise<T>,
    options: {
      tenantId: string
      cacheKey?: string
      cacheTTL?: number
      tags?: string[]
      skipCache?: boolean
      forceRefresh?: boolean
    }
  ): Promise<T> {
    const startTime = performance.now()
    const queryHash = this.generateQueryHash(operation, options)

    try {
      // Check cache first (unless skipped or force refresh)
      if (!options.skipCache && !options.forceRefresh) {
        const cached = await this.getCachedResult<T>(queryHash, options.cacheKey)
        if (cached !== null) {
          this.recordMetrics(
            queryHash,
            performance.now() - startTime,
            0,
            true,
            options.tenantId,
            operation
          )
          return cached
        }
      }

      // Apply query optimizations
      const optimizedQuery = this.applyOptimizationRules(operation, options)

      // Execute the query
      const result = await queryFn()
      const executionTime = performance.now() - startTime

      // Cache the result
      if (!options.skipCache) {
        await this.cacheResult(queryHash, result, options)
      }

      // Record metrics
      const resultSize = this.calculateResultSize(result)
      this.recordMetrics(queryHash, executionTime, resultSize, false, options.tenantId, operation)

      // Emit performance event
      this.emit('queryExecuted', {
        queryHash,
        operation,
        executionTime,
        resultSize,
        cached: false,
        tenantId: options.tenantId,
      })

      return result
    } catch (error) {
      const executionTime = performance.now() - startTime
      this.recordMetrics(
        queryHash,
        executionTime,
        0,
        false,
        options.tenantId,
        operation,
        error as Error
      )

      this.emit('queryError', {
        queryHash,
        operation,
        error,
        executionTime,
        tenantId: options.tenantId,
      })

      throw error
    }
  }

  /**
   * Batch optimize multiple queries with intelligent grouping
   */
  async optimizeBatchQueries<T>(
    queries: Array<{
      operation: string
      queryFn: () => Promise<unknown>
      options: {
        tenantId: string
        cacheKey?: string
        cacheTTL?: number
        tags?: string[]
      }
    }>
  ): Promise<T[]> {
    // Group queries by tenant and similar patterns
    const groupedQueries = this.groupQueriesForOptimization(queries)

    // Execute groups concurrently with connection pooling
    const results = await Promise.all(groupedQueries.map((group) => this.executeBatchGroup(group)))

    return results.flat()
  }

  /**
   * Get real-time performance analytics
   */
  getPerformanceAnalytics(tenantId?: string): {
    totalQueries: number
    averageExecutionTime: number
    cacheHitRatio: number
    slowQueries: QueryMetrics[]
    topOperations: Array<{ operation: string; count: number; avgTime: number }>
    recommendations: string[]
  } {
    const allMetrics = tenantId
      ? this.getMetricsForTenant(tenantId)
      : Array.from(this.queryMetrics.values()).flat()

    if (allMetrics.length === 0) {
      return {
        totalQueries: 0,
        averageExecutionTime: 0,
        cacheHitRatio: 0,
        slowQueries: [],
        topOperations: [],
        recommendations: [],
      }
    }

    const totalQueries = allMetrics.length
    const averageExecutionTime =
      allMetrics.reduce((sum, m) => sum + m.executionTime, 0) / totalQueries
    const cacheHits = allMetrics.filter((m) => m.cacheHit).length
    const cacheHitRatio = (cacheHits / totalQueries) * 100

    // Identify slow queries (95th percentile)
    const sortedByTime = allMetrics.sort((a, b) => b.executionTime - a.executionTime)
    const slowQueries = sortedByTime.slice(0, Math.ceil(totalQueries * 0.05))

    // Top operations by frequency and performance
    const operationStats = this.calculateOperationStats(allMetrics)

    // Generate recommendations
    const recommendations = this.generatePerformanceRecommendations(allMetrics)

    return {
      totalQueries,
      averageExecutionTime: Math.round(averageExecutionTime * 100) / 100,
      cacheHitRatio: Math.round(cacheHitRatio * 100) / 100,
      slowQueries: slowQueries.slice(0, 10),
      topOperations: operationStats.slice(0, 10),
      recommendations,
    }
  }

  /**
   * Intelligent connection pool optimization
   */
  async optimizeConnectionPool(usage: {
    activeConnections: number
    maxConnections: number
    queuedRequests: number
    averageQueryTime: number
  }): Promise<{
    recommendedPoolSize: number
    recommendedTimeout: number
    shouldScale: boolean
    optimizations: string[]
  }> {
    const { activeConnections, maxConnections, queuedRequests, averageQueryTime } = usage

    // Calculate optimal pool size based on usage patterns
    const utilizationRate = activeConnections / maxConnections
    const queuePressure = queuedRequests > 0

    let recommendedPoolSize = maxConnections
    let shouldScale = false
    const optimizations: string[] = []

    // Scale up recommendations
    if (utilizationRate > 0.8 || queuePressure) {
      recommendedPoolSize = Math.ceil(maxConnections * 1.5)
      shouldScale = true
      optimizations.push('Increase connection pool size to handle high utilization')
    }

    // Scale down recommendations
    if (utilizationRate < 0.3 && queuedRequests === 0) {
      recommendedPoolSize = Math.ceil(maxConnections * 0.7)
      optimizations.push('Reduce connection pool size to optimize resource usage')
    }

    // Timeout optimization
    const recommendedTimeout = Math.max(5000, averageQueryTime * 3)

    if (averageQueryTime > 1000) {
      optimizations.push('Consider query optimization for slow operations')
    }

    if (queuedRequests > 5) {
      optimizations.push('Implement read replicas for read-heavy operations')
    }

    return {
      recommendedPoolSize,
      recommendedTimeout,
      shouldScale,
      optimizations,
    }
  }

  /**
   * Preload cache with frequently accessed data
   */
  async preloadCache(tenantId: string, preloadRules?: string[]): Promise<void> {
    

    const rules =
      preloadRules ||
      Array.from(this.cacheStrategies.keys()).filter(
        (key) => this.cacheStrategies.get(key)?.preload
      )

    const preloadPromises = rules.map(async (rule) => {
      try {
        const strategy = this.cacheStrategies.get(rule)
        if (!strategy) return

        // Execute preload logic based on rule pattern
        await this.executePreloadRule(rule, strategy, tenantId)
      } catch (error) {
        
      }
    })

    await Promise.allSettled(preloadPromises)
    
  }

  // Private methods
  private generateQueryHash(operation: string, options: unknown): string {
    return `query:${operation}:${JSON.stringify(options)}`.replace(/\s+/g, '')
  }

  private async getCachedResult<T>(queryHash: string, cacheKey?: string): Promise<T | null> {
    try {
      const key = cacheKey || queryHash
      const cached = await this.redis.get(key)

      if (cached) {
        return JSON.parse(cached)
      }

      return null
    } catch (error) {
      
      return null
    }
  }

  private async cacheResult<T>(
    queryHash: string,
    result: T,
    options: { cacheKey?: string; cacheTTL?: number; tags?: string[] }
  ): Promise<void> {
    try {
      const key = options.cacheKey || queryHash
      const ttl = options.cacheTTL || 300 // 5 minutes default

      // Store the result
      await this.redis.setex(key, ttl, JSON.stringify(result))

      // Add tags for cache invalidation
      if (options.tags) {
        for (const tag of options.tags) {
          await this.redis.sadd(`tag:${tag}`, key)
          await this.redis.expire(`tag:${tag}`, ttl + 60)
        }
      }
    } catch (error) {
      
    }
  }

  private recordMetrics(
    queryHash: string,
    executionTime: number,
    resultSize: number,
    cacheHit: boolean,
    tenantId: string,
    operation: string,
    error?: Error
  ): void {
    const metric: QueryMetrics = {
      queryHash,
      executionTime,
      resultSize,
      cacheHit,
      timestamp: new Date(),
      tenantId,
      operation,
      table: this.extractTableName(operation),
    }

    if (!this.queryMetrics.has(tenantId)) {
      this.queryMetrics.set(tenantId, [])
    }

    const tenantMetrics = this.queryMetrics.get(tenantId)!
    tenantMetrics.push(metric)

    // Keep only last 1000 metrics per tenant
    if (tenantMetrics.length > 1000) {
      tenantMetrics.shift()
    }

    // Log slow queries
    if (executionTime > 1000) {
      console.warn(`Slow query detected: ${executionTime}ms`)
    }
  }

  private applyOptimizationRules(operation: string, options: unknown): unknown {
    let optimized = { operation, options }

    for (const rule of this.optimizationRules
      .filter((r) => r.enabled)
      .sort((a, b) => b.priority - a.priority)) {
      if (rule.condition(operation, options)) {
        const result = rule.optimization(optimized.operation, optimized.options)
        optimized = { operation: result.query, options: result.params }
      }
    }

    return optimized
  }

  private calculateResultSize(result: unknown): number {
    if (Array.isArray(result)) {
      return result.length
    }
    if (typeof result === 'object' && result !== null) {
      return Object.keys(result).length
    }
    return 1
  }

  private groupQueriesForOptimization(queries: unknown[]): unknown[][] {
    // Group by tenant and similar operations
    const groups = new Map<string, unknown[]>()

    for (const query of queries) {
      const groupKey = `${query.options.tenantId}:${this.extractOperationType(query.operation)}`
      if (!groups.has(groupKey)) {
        groups.set(groupKey, [])
      }
      groups.get(groupKey)!.push(query)
    }

    return Array.from(groups.values())
  }

  private async executeBatchGroup(group: unknown[]): Promise<unknown[]> {
    // Execute with controlled concurrency
    const maxConcurrent = Math.min(group.length, 10)
    const batches: unknown[][] = []

    for (let i = 0; i < group.length; i += maxConcurrent) {
      batches.push(group.slice(i, i + maxConcurrent))
    }

    const results = []
    for (const batch of batches) {
      const batchResults = await Promise.all(
        batch.map((query) => this.optimizeQuery(query.operation, query.queryFn, query.options))
      )
      results.push(...batchResults)
    }

    return results
  }

  private getMetricsForTenant(tenantId: string): QueryMetrics[] {
    return this.queryMetrics.get(tenantId) || []
  }

  private calculateOperationStats(
    metrics: QueryMetrics[]
  ): Array<{ operation: string; count: number; avgTime: number }> {
    const stats = new Map<string, { count: number; totalTime: number }>()

    for (const metric of metrics) {
      if (!stats.has(metric.operation)) {
        stats.set(metric.operation, { count: 0, totalTime: 0 })
      }

      const stat = stats.get(metric.operation)!
      stat.count++
      stat.totalTime += metric.executionTime
    }

    return Array.from(stats.entries())
      .map(([operation, stat]) => ({
        operation,
        count: stat.count,
        avgTime: stat.totalTime / stat.count,
      }))
      .sort((a, b) => b.count - a.count)
  }

  private generatePerformanceRecommendations(metrics: QueryMetrics[]): string[] {
    const recommendations = []

    // Check cache hit ratio
    const cacheHits = metrics.filter((m) => m.cacheHit).length
    const cacheHitRatio = (cacheHits / metrics.length) * 100

    if (cacheHitRatio < 60) {
      recommendations.push('Improve cache hit ratio by optimizing cache strategies')
    }

    // Check for slow queries
    const slowQueries = metrics.filter((m) => m.executionTime > 1000).length
    if (slowQueries > metrics.length * 0.1) {
      recommendations.push('Optimize database indexes for frequently used queries')
    }

    // Check for large result sets
    const largeResults = metrics.filter((m) => m.resultSize > 1000).length
    if (largeResults > metrics.length * 0.2) {
      recommendations.push('Implement pagination for large data sets')
    }

    return recommendations
  }

  private extractTableName(operation: string): string {
    // Extract table name from operation (simplified)
    const match = operation.match(
      /\b(findMany|findFirst|create|update|delete)\s*\(\s*{[^}]*table:\s*["']([^"']+)["']/i
    )
    return match ? match[2] : 'unknown'
  }

  private extractOperationType(operation: string): string {
    if (operation.includes('findMany') || operation.includes('findFirst')) return 'read'
    if (operation.includes('create')) return 'create'
    if (operation.includes('update')) return 'update'
    if (operation.includes('delete')) return 'delete'
    return 'unknown'
  }

  private async executePreloadRule(
    rule: string,
    strategy: CacheStrategy,
    tenantId: string
  ): Promise<void> {
    // Implement preload logic based on rule pattern
    // This would contain specific queries to preload based on usage patterns
    
  }

  private initializeOptimizationRules(): void {
    this.optimizationRules = [
      {
        id: 'limit_large_results',
        name: 'Limit Large Result Sets',
        description: 'Automatically add pagination to queries returning large result sets',
        _condition: (query, params) => !query.includes('take') && !query.includes('limit'),
        optimization: (query, params) => ({
          query: query + ' LIMIT 1000',
          params: { ...params, defaultLimit: 1000 },
        }),
        enabled: true,
        priority: 100,
      },
      {
        id: 'index_hint',
        name: 'Index Hints',
        description: 'Add index hints for frequently used queries',
        condition: (query, params) => query.includes('WHERE') && params.tenantId,
        optimization: (query, params) => ({
          query,
          params: { ...params, useIndex: 'idx_tenant_id' },
        }),
        enabled: true,
        priority: 90,
      },
    ]
  }

  private initializeCacheStrategies(): void {
    const strategies: Array<[string, CacheStrategy]> = [
      [
        'user_session',
        {
          pattern: 'user:*:session',
          ttl: 3600,
          tags: ['user', 'session'],
          invalidationRules: ['user_logout', 'user_update'],
          compression: false,
          preload: true,
        },
      ],
      [
        'customer_data',
        {
          pattern: 'customer:*:profile',
          ttl: 1800,
          tags: ['customer', 'profile'],
          invalidationRules: ['customer_update'],
          compression: true,
          preload: true,
        },
      ],
      [
        'dashboard_metrics',
        {
          pattern: 'metrics:*:dashboard',
          ttl: 300,
          tags: ['metrics', 'dashboard'],
          invalidationRules: ['data_update'],
          compression: true,
          preload: false,
        },
      ],
    ]

    for (const [key, strategy] of strategies) {
      this.cacheStrategies.set(key, strategy)
    }
  }

  private startMetricsCollection(): void {
    // Start background metrics collection and cleanup
    setInterval(() => {
      this.cleanupOldMetrics()
    }, 60000) // Clean up every minute
  }

  private cleanupOldMetrics(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

    for (const [tenantId, metrics] of this.queryMetrics) {
      const filtered = metrics.filter((m) => m.timestamp > oneHourAgo)
      this.queryMetrics.set(tenantId, filtered)
    }
  }
}

export default QueryOptimizer
