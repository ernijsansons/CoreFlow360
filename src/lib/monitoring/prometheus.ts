/**
 * CoreFlow360 - Prometheus Metrics Collection
 * Production-grade metrics collection and monitoring
 */

import { register, collectDefaultMetrics, Counter, Histogram, Gauge, Summary } from 'prom-client'

// Enable default system metrics
collectDefaultMetrics({
  prefix: 'coreflow360_',
  timeout: 10000,
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5]
})

/**
 * HTTP Request Metrics
 */
export const httpRequestDuration = new Histogram({
  name: 'coreflow360_http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code', 'tenant_id'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10, 30]
})

export const httpRequestTotal = new Counter({
  name: 'coreflow360_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'tenant_id']
})

export const httpRequestSize = new Summary({
  name: 'coreflow360_http_request_size_bytes',
  help: 'HTTP request size in bytes',
  labelNames: ['method', 'route', 'tenant_id'],
  percentiles: [0.5, 0.95, 0.99]
})

export const httpResponseSize = new Summary({
  name: 'coreflow360_http_response_size_bytes',
  help: 'HTTP response size in bytes',
  labelNames: ['method', 'route', 'status_code', 'tenant_id'],
  percentiles: [0.5, 0.95, 0.99]
})

/**
 * Database Metrics
 */
export const dbQueryDuration = new Histogram({
  name: 'coreflow360_db_query_duration_seconds',
  help: 'Database query duration in seconds',
  labelNames: ['operation', 'table', 'tenant_id'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5]
})

export const dbQueryTotal = new Counter({
  name: 'coreflow360_db_queries_total',
  help: 'Total number of database queries',
  labelNames: ['operation', 'table', 'tenant_id', 'status']
})

export const dbConnectionsActive = new Gauge({
  name: 'coreflow360_db_connections_active',
  help: 'Number of active database connections',
  labelNames: ['tenant_id']
})

export const dbConnectionsIdle = new Gauge({
  name: 'coreflow360_db_connections_idle',
  help: 'Number of idle database connections',
  labelNames: ['tenant_id']
})

export const dbPoolSize = new Gauge({
  name: 'coreflow360_db_pool_size',
  help: 'Database connection pool size',
  labelNames: ['tenant_id']
})

/**
 * Cache Metrics
 */
export const cacheHitTotal = new Counter({
  name: 'coreflow360_cache_hits_total',
  help: 'Total number of cache hits',
  labelNames: ['cache_type', 'tenant_id', 'key_pattern']
})

export const cacheMissTotal = new Counter({
  name: 'coreflow360_cache_misses_total',
  help: 'Total number of cache misses',
  labelNames: ['cache_type', 'tenant_id', 'key_pattern']
})

export const cacheOperationDuration = new Histogram({
  name: 'coreflow360_cache_operation_duration_seconds',
  help: 'Cache operation duration in seconds',
  labelNames: ['operation', 'cache_type', 'tenant_id'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1]
})

export const cacheMemoryUsage = new Gauge({
  name: 'coreflow360_cache_memory_usage_bytes',
  help: 'Cache memory usage in bytes',
  labelNames: ['cache_type', 'tenant_id']
})

export const cacheKeyCount = new Gauge({
  name: 'coreflow360_cache_keys_count',
  help: 'Number of keys in cache',
  labelNames: ['cache_type', 'tenant_id']
})

/**
 * Business Metrics
 */
export const userSessionsActive = new Gauge({
  name: 'coreflow360_user_sessions_active',
  help: 'Number of active user sessions',
  labelNames: ['tenant_id']
})

export const userLoginsTotal = new Counter({
  name: 'coreflow360_user_logins_total',
  help: 'Total number of user logins',
  labelNames: ['tenant_id', 'auth_method', 'status']
})

export const apiCallsTotal = new Counter({
  name: 'coreflow360_api_calls_total',
  help: 'Total number of API calls by feature',
  labelNames: ['feature', 'tenant_id', 'user_id']
})

export const subscriptionEvents = new Counter({
  name: 'coreflow360_subscription_events_total',
  help: 'Total number of subscription events',
  labelNames: ['event_type', 'plan', 'tenant_id']
})

export const revenueGenerated = new Counter({
  name: 'coreflow360_revenue_generated_cents',
  help: 'Total revenue generated in cents',
  labelNames: ['plan', 'tenant_id', 'currency']
})

/**
 * AI/ML Metrics
 */
export const aiRequestDuration = new Histogram({
  name: 'coreflow360_ai_request_duration_seconds',
  help: 'AI service request duration in seconds',
  labelNames: ['service', 'model', 'tenant_id'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60]
})

export const aiTokensUsed = new Counter({
  name: 'coreflow360_ai_tokens_used_total',
  help: 'Total number of AI tokens used',
  labelNames: ['service', 'model', 'type', 'tenant_id']
})

export const aiCostAccumulated = new Counter({
  name: 'coreflow360_ai_cost_accumulated_cents',
  help: 'Total AI costs accumulated in cents',
  labelNames: ['service', 'model', 'tenant_id']
})

/**
 * Error Metrics
 */
export const errorsTotal = new Counter({
  name: 'coreflow360_errors_total',
  help: 'Total number of errors',
  labelNames: ['error_type', 'severity', 'component', 'tenant_id']
})

export const circuitBreakerState = new Gauge({
  name: 'coreflow360_circuit_breaker_state',
  help: 'Circuit breaker state (0=closed, 1=open, 2=half-open)',
  labelNames: ['service', 'tenant_id']
})

export const circuitBreakerTrips = new Counter({
  name: 'coreflow360_circuit_breaker_trips_total',
  help: 'Total number of circuit breaker trips',
  labelNames: ['service', 'tenant_id']
})

/**
 * System Metrics
 */
export const memoryUsage = new Gauge({
  name: 'coreflow360_memory_usage_bytes',
  help: 'Memory usage in bytes',
  labelNames: ['type']
})

export const cpuUsage = new Gauge({
  name: 'coreflow360_cpu_usage_percent',
  help: 'CPU usage percentage',
  labelNames: ['core']
})

export const diskUsage = new Gauge({
  name: 'coreflow360_disk_usage_bytes',
  help: 'Disk usage in bytes',
  labelNames: ['mount_point', 'type']
})

export const networkBytesTotal = new Counter({
  name: 'coreflow360_network_bytes_total',
  help: 'Total network bytes transferred',
  labelNames: ['direction', 'interface']
})

/**
 * Custom Business Intelligence Metrics
 */
export const customerSatisfactionScore = new Gauge({
  name: 'coreflow360_customer_satisfaction_score',
  help: 'Customer satisfaction score (1-10)',
  labelNames: ['tenant_id', 'survey_type']
})

export const featureUsage = new Counter({
  name: 'coreflow360_feature_usage_total',
  help: 'Total feature usage events',
  labelNames: ['feature', 'action', 'tenant_id', 'user_role']
})

export const dataProcessingVolume = new Counter({
  name: 'coreflow360_data_processing_volume_bytes',
  help: 'Total volume of data processed',
  labelNames: ['operation', 'data_type', 'tenant_id']
})

/**
 * Metrics Collection Helper Functions
 */

export class MetricsCollector {
  private static instance: MetricsCollector

  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector()
    }
    return MetricsCollector.instance
  }

  /**
   * Record HTTP request metrics
   */
  recordHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
    requestSize: number,
    responseSize: number,
    tenantId?: string
  ): void {
    const labels = {
      method,
      route,
      status_code: statusCode.toString(),
      tenant_id: tenantId || 'unknown'
    }

    httpRequestDuration.observe(labels, duration / 1000)
    httpRequestTotal.inc(labels)
    httpRequestSize.observe({ method, route, tenant_id: tenantId || 'unknown' }, requestSize)
    httpResponseSize.observe(labels, responseSize)
  }

  /**
   * Record database query metrics
   */
  recordDbQuery(
    operation: string,
    table: string,
    duration: number,
    success: boolean,
    tenantId?: string
  ): void {
    const labels = {
      operation,
      table,
      tenant_id: tenantId || 'unknown',
      status: success ? 'success' : 'error'
    }

    dbQueryDuration.observe({ operation, table, tenant_id: tenantId || 'unknown' }, duration / 1000)
    dbQueryTotal.inc(labels)
  }

  /**
   * Record cache metrics
   */
  recordCacheOperation(
    operation: 'hit' | 'miss' | 'set' | 'delete',
    cacheType: string,
    duration: number,
    keyPattern?: string,
    tenantId?: string
  ): void {
    const labels = {
      cache_type: cacheType,
      tenant_id: tenantId || 'unknown',
      key_pattern: keyPattern || 'unknown'
    }

    if (operation === 'hit') {
      cacheHitTotal.inc(labels)
    } else if (operation === 'miss') {
      cacheMissTotal.inc(labels)
    }

    cacheOperationDuration.observe({
      operation,
      cache_type: cacheType,
      tenant_id: tenantId || 'unknown'
    }, duration / 1000)
  }

  /**
   * Record AI service metrics
   */
  recordAiRequest(
    service: string,
    model: string,
    duration: number,
    tokensUsed: number,
    costCents: number,
    tenantId?: string
  ): void {
    const labels = {
      service,
      model,
      tenant_id: tenantId || 'unknown'
    }

    aiRequestDuration.observe(labels, duration / 1000)
    aiTokensUsed.inc({ ...labels, type: 'total' }, tokensUsed)
    aiCostAccumulated.inc(labels, costCents)
  }

  /**
   * Record error metrics
   */
  recordError(
    errorType: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    component: string,
    tenantId?: string
  ): void {
    errorsTotal.inc({
      error_type: errorType,
      severity,
      component,
      tenant_id: tenantId || 'unknown'
    })
  }

  /**
   * Update system metrics
   */
  updateSystemMetrics(): void {
    const memUsage = process.memoryUsage()
    memoryUsage.set({ type: 'heap_used' }, memUsage.heapUsed)
    memoryUsage.set({ type: 'heap_total' }, memUsage.heapTotal)
    memoryUsage.set({ type: 'external' }, memUsage.external)
    memoryUsage.set({ type: 'rss' }, memUsage.rss)

    const cpuUsed = process.cpuUsage()
    cpuUsage.set({ core: 'user' }, cpuUsed.user / 1000000) // Convert to seconds
    cpuUsage.set({ core: 'system' }, cpuUsed.system / 1000000)
  }

  /**
   * Get all metrics
   */
  async getMetrics(): Promise<string> {
    this.updateSystemMetrics()
    return register.metrics()
  }

  /**
   * Get metrics as JSON
   */
  async getMetricsAsJson(): Promise<any[]> {
    this.updateSystemMetrics()
    return register.getMetricsAsJSON()
  }

  /**
   * Clear all metrics (useful for testing)
   */
  clearMetrics(): void {
    register.clear()
  }
}

// Export singleton instance
export const metricsCollector = MetricsCollector.getInstance()

// Auto-update system metrics every 30 seconds
if (typeof window === 'undefined') { // Server-side only
  setInterval(() => {
    metricsCollector.updateSystemMetrics()
  }, 30000)
}

export { register }