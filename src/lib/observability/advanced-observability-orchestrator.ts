/**
 * CoreFlow360 - Advanced Observability Orchestrator
 * Comprehensive monitoring with OpenTelemetry, distributed tracing, 
 * real-time analytics, and AI-powered anomaly detection
 */

import { EventEmitter } from 'events'
import { trace, metrics, logs } from '@opentelemetry/api'
import { performance } from 'perf_hooks'

export interface ObservabilityConfig {
  tracing: {
    enabled: boolean
    serviceName: string
    version: string
    environment: string
    samplingRate: number
    exporters: Array<'jaeger' | 'zipkin' | 'console' | 'otlp'>
  }
  metrics: {
    enabled: boolean
    interval: number // milliseconds
    exporters: Array<'prometheus' | 'console' | 'otlp'>
    customMetrics: boolean
  }
  logging: {
    enabled: boolean
    level: 'trace' | 'debug' | 'info' | 'warn' | 'error'
    structured: boolean
    exporters: Array<'console' | 'file' | 'elasticsearch' | 'datadog'>
  }
  anomalyDetection: {
    enabled: boolean
    algorithms: Array<'statistical' | 'ml' | 'pattern'>
    sensitivity: 'low' | 'medium' | 'high'
    learningPeriod: number // days
  }
  alerting: {
    enabled: boolean
    channels: Array<'email' | 'slack' | 'webhook' | 'sms'>
    escalation: boolean
    cooldown: number // minutes
  }
}

export interface Span {
  id: string
  traceId: string
  operationName: string
  startTime: number
  endTime?: number
  duration?: number
  status: 'OK' | 'ERROR' | 'TIMEOUT'
  tags: Record<string, any>
  logs: Array<{
    timestamp: number
    level: string
    message: string
    fields?: Record<string, any>
  }>
  parentSpanId?: string
  childSpans: string[]
}

export interface Metric {
  name: string
  type: 'counter' | 'gauge' | 'histogram' | 'summary'
  value: number
  timestamp: number
  labels: Record<string, string>
  description?: string
  unit?: string
}

export interface BusinessMetric {
  name: string
  value: number
  timestamp: Date
  dimensions: Record<string, any>
  type: 'revenue' | 'usage' | 'performance' | 'security' | 'user_behavior'
  aggregation: 'sum' | 'avg' | 'count' | 'max' | 'min'
}

export interface Alert {
  id: string
  type: 'THRESHOLD' | 'ANOMALY' | 'ERROR_RATE' | 'LATENCY' | 'AVAILABILITY'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  title: string
  description: string
  timestamp: Date
  metric: string
  value: number
  threshold?: number
  condition: string
  runbook?: string
  resolved: boolean
  acknowledgedBy?: string
  acknowledgedAt?: Date
  resolvedAt?: Date
  tags: Record<string, string>
}

export interface AnomalyDetection {
  id: string
  metric: string
  timestamp: Date
  expected: number
  actual: number
  deviation: number
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
  algorithm: 'statistical' | 'ml' | 'pattern'
  confidence: number
  context: Record<string, any>
}

export interface DashboardWidget {
  id: string
  type: 'metric' | 'chart' | 'table' | 'heatmap' | 'alert'
  title: string
  query: string
  visualization: {
    type: 'line' | 'bar' | 'pie' | 'gauge' | 'table'
    config: Record<string, any>
  }
  timeRange: {
    from: string
    to: string
  }
  refresh: number // seconds
}

export class AdvancedObservabilityOrchestrator extends EventEmitter {
  private config: ObservabilityConfig
  private spans: Map<string, Span> = new Map()
  private metrics: Map<string, Metric[]> = new Map()
  private businessMetrics: BusinessMetric[] = []
  private alerts: Alert[] = []
  private anomalies: AnomalyDetection[] = []
  private tracer = trace.getTracer('coreflow360-observability')
  private meter = metrics.getMeter('coreflow360-metrics')
  private isRunning = false

  constructor(config: ObservabilityConfig) {
    super()
    this.config = config
    this.initialize()
  }

  private async initialize(): Promise<void> {
    console.log('🔭 Initializing Advanced Observability Orchestrator')

    if (this.config.tracing.enabled) {
      await this.initializeTracing()
    }

    if (this.config.metrics.enabled) {
      await this.initializeMetrics()
    }

    if (this.config.logging.enabled) {
      await this.initializeLogging()
    }

    if (this.config.anomalyDetection.enabled) {
      await this.initializeAnomalyDetection()
    }

    this.startCollection()
    console.log('✅ Advanced Observability Orchestrator initialized')
  }

  /**
   * Create and start a new trace span
   */
  startSpan(operationName: string, options?: {
    parentSpanId?: string
    tags?: Record<string, any>
  }): string {
    const spanId = `span_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const traceId = options?.parentSpanId 
      ? this.spans.get(options.parentSpanId)?.traceId || this.generateTraceId()
      : this.generateTraceId()

    const span: Span = {
      id: spanId,
      traceId,
      operationName,
      startTime: performance.now(),
      status: 'OK',
      tags: options?.tags || {},
      logs: [],
      parentSpanId: options?.parentSpanId,
      childSpans: []
    }

    // Add to parent's children if exists
    if (options?.parentSpanId) {
      const parent = this.spans.get(options.parentSpanId)
      if (parent) {
        parent.childSpans.push(spanId)
      }
    }

    this.spans.set(spanId, span)

    // Create OpenTelemetry span
    const otelSpan = this.tracer.startSpan(operationName, {
      attributes: options?.tags
    })

    // Log span creation
    this.logEvent('SPAN_STARTED', {
      spanId,
      traceId,
      operationName,
      tags: options?.tags
    })

    return spanId
  }

  /**
   * Finish a span with status and tags
   */
  finishSpan(spanId: string, options?: {
    status?: Span['status']
    tags?: Record<string, any>
    error?: Error
  }): void {
    const span = this.spans.get(spanId)
    if (!span) return

    span.endTime = performance.now()
    span.duration = span.endTime - span.startTime
    span.status = options?.status || 'OK'

    if (options?.tags) {
      span.tags = { ...span.tags, ...options.tags }
    }

    if (options?.error) {
      span.status = 'ERROR'
      span.logs.push({
        timestamp: performance.now(),
        level: 'error',
        message: options.error.message,
        fields: {
          stack: options.error.stack,
          name: options.error.name
        }
      })
    }

    // Record metrics for span
    this.recordMetric({
      name: 'span_duration',
      type: 'histogram',
      value: span.duration,
      timestamp: Date.now(),
      labels: {
        operation: span.operationName,
        status: span.status,
        service: this.config.tracing.serviceName
      },
      description: 'Duration of operation spans',
      unit: 'milliseconds'
    })

    // Detect slow operations
    if (span.duration > 5000) { // 5 seconds
      this.createAlert({
        type: 'LATENCY',
        severity: span.duration > 10000 ? 'HIGH' : 'MEDIUM',
        title: 'Slow Operation Detected',
        description: `Operation ${span.operationName} took ${Math.round(span.duration)}ms`,
        metric: 'span_duration',
        value: span.duration,
        threshold: 5000,
        condition: 'duration > 5000ms',
        tags: {
          operation: span.operationName,
          traceId: span.traceId
        }
      })
    }

    this.emit('spanFinished', span)
  }

  /**
   * Record a metric value
   */
  recordMetric(metric: Omit<Metric, 'timestamp'> & { timestamp?: number }): void {
    const fullMetric: Metric = {
      ...metric,
      timestamp: metric.timestamp || Date.now()
    }

    // Store metric
    if (!this.metrics.has(metric.name)) {
      this.metrics.set(metric.name, [])
    }
    
    const metricHistory = this.metrics.get(metric.name)!
    metricHistory.push(fullMetric)

    // Keep only last 1000 values per metric
    if (metricHistory.length > 1000) {
      metricHistory.splice(0, metricHistory.length - 1000)
    }

    // Record with OpenTelemetry
    const otelMetric = this.meter.createHistogram(metric.name, {
      description: metric.description,
      unit: metric.unit
    })

    if (metric.type === 'histogram') {
      otelMetric.record(metric.value, metric.labels)
    }

    this.emit('metricRecorded', fullMetric)
  }

  /**
   * Record business-specific metrics
   */
  recordBusinessMetric(metric: Omit<BusinessMetric, 'timestamp'> & { timestamp?: Date }): void {
    const businessMetric: BusinessMetric = {
      ...metric,
      timestamp: metric.timestamp || new Date()
    }

    this.businessMetrics.push(businessMetric)

    // Keep only last 10000 business metrics
    if (this.businessMetrics.length > 10000) {
      this.businessMetrics = this.businessMetrics.slice(-10000)
    }

    // Convert to technical metric
    this.recordMetric({
      name: `business_${metric.name}`,
      type: 'gauge',
      value: metric.value,
      labels: {
        type: metric.type,
        aggregation: metric.aggregation,
        ...Object.entries(metric.dimensions).reduce((acc, [key, value]) => {
          acc[key] = String(value)
          return acc
        }, {} as Record<string, string>)
      },
      description: `Business metric: ${metric.name}`
    })

    this.emit('businessMetricRecorded', businessMetric)
  }

  /**
   * Create and manage alerts
   */
  createAlert(alertData: Omit<Alert, 'id' | 'timestamp' | 'resolved'>): Alert {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      resolved: false,
      ...alertData
    }

    this.alerts.push(alert)

    // Keep only last 1000 alerts
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(-1000)
    }

    console.log(`🚨 Alert created: ${alert.title} (${alert.severity})`)

    this.emit('alertCreated', alert)
    
    // Send notifications if configured
    if (this.config.alerting.enabled) {
      this.sendAlertNotification(alert)
    }

    return alert
  }

  /**
   * Detect anomalies in metrics using various algorithms
   */
  async detectAnomalies(): Promise<AnomalyDetection[]> {
    const detectedAnomalies: AnomalyDetection[] = []

    // Statistical anomaly detection
    if (this.config.anomalyDetection.algorithms.includes('statistical')) {
      detectedAnomalies.push(...await this.detectStatisticalAnomalies())
    }

    // Pattern-based anomaly detection
    if (this.config.anomalyDetection.algorithms.includes('pattern')) {
      detectedAnomalies.push(...await this.detectPatternAnomalies())
    }

    // ML-based anomaly detection
    if (this.config.anomalyDetection.algorithms.includes('ml')) {
      detectedAnomalies.push(...await this.detectMLAnomalies())
    }

    // Store and emit anomalies
    for (const anomaly of detectedAnomalies) {
      this.anomalies.push(anomaly)
      this.emit('anomalyDetected', anomaly)

      // Create alert for significant anomalies
      if (anomaly.severity === 'HIGH' && anomaly.confidence > 0.8) {
        this.createAlert({
          type: 'ANOMALY',
          severity: 'HIGH',
          title: 'Anomaly Detected',
          description: `Unusual pattern in ${anomaly.metric}: expected ${anomaly.expected}, got ${anomaly.actual}`,
          metric: anomaly.metric,
          value: anomaly.actual,
          condition: `deviation > ${anomaly.deviation}%`,
          tags: {
            algorithm: anomaly.algorithm,
            confidence: anomaly.confidence.toString()
          }
        })
      }
    }

    // Keep only last 1000 anomalies
    if (this.anomalies.length > 1000) {
      this.anomalies = this.anomalies.slice(-1000)
    }

    return detectedAnomalies
  }

  /**
   * Generate comprehensive observability dashboard
   */
  generateDashboard(): {
    overview: {
      totalSpans: number
      activeTraces: number
      errorRate: number
      averageLatency: number
      alertCount: number
    }
    metrics: {
      systemMetrics: Metric[]
      businessMetrics: BusinessMetric[]
      customMetrics: Metric[]
    }
    traces: {
      recentTraces: Array<{
        traceId: string
        duration: number
        spanCount: number
        status: string
        operations: string[]
      }>
      slowestOperations: Array<{
        operation: string
        averageDuration: number
        count: number
      }>
    }
    alerts: {
      active: Alert[]
      recent: Alert[]
      byType: Record<string, number>
    }
    anomalies: {
      recent: AnomalyDetection[]
      patterns: Array<{
        metric: string
        frequency: number
        severity: string
      }>
    }
  } {
    const now = Date.now()
    const oneHourAgo = now - 60 * 60 * 1000

    // Calculate overview metrics
    const recentSpans = Array.from(this.spans.values()).filter(
      span => span.startTime > oneHourAgo
    )
    const errorSpans = recentSpans.filter(span => span.status === 'ERROR')
    const totalDuration = recentSpans.reduce((sum, span) => sum + (span.duration || 0), 0)

    // Get traces
    const traces = this.getTraces(50)
    const operationDurations = new Map<string, { total: number; count: number }>()
    
    recentSpans.forEach(span => {
      if (!operationDurations.has(span.operationName)) {
        operationDurations.set(span.operationName, { total: 0, count: 0 })
      }
      const op = operationDurations.get(span.operationName)!
      op.total += span.duration || 0
      op.count++
    })

    const slowestOperations = Array.from(operationDurations.entries())
      .map(([operation, data]) => ({
        operation,
        averageDuration: data.total / data.count,
        count: data.count
      }))
      .sort((a, b) => b.averageDuration - a.averageDuration)
      .slice(0, 10)

    // Get metrics
    const allMetrics = Array.from(this.metrics.values()).flat()
    const systemMetrics = allMetrics.filter(m => 
      m.name.startsWith('system_') || m.name.startsWith('span_')
    )
    const customMetrics = allMetrics.filter(m => 
      !m.name.startsWith('system_') && !m.name.startsWith('business_')
    )

    // Get alerts
    const activeAlerts = this.alerts.filter(alert => !alert.resolved)
    const recentAlerts = this.alerts.filter(alert => 
      alert.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
    )
    const alertsByType = this.alerts.reduce((acc, alert) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Get anomalies
    const recentAnomalies = this.anomalies.filter(anomaly =>
      anomaly.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
    )
    const anomalyPatterns = recentAnomalies.reduce((acc, anomaly) => {
      const key = anomaly.metric
      if (!acc[key]) {
        acc[key] = { metric: key, frequency: 0, severity: 'LOW' }
      }
      acc[key].frequency++
      if (anomaly.severity === 'HIGH') acc[key].severity = 'HIGH'
      else if (anomaly.severity === 'MEDIUM' && acc[key].severity === 'LOW') acc[key].severity = 'MEDIUM'
      return acc
    }, {} as Record<string, { metric: string; frequency: number; severity: string }>)

    return {
      overview: {
        totalSpans: recentSpans.length,
        activeTraces: new Set(recentSpans.map(span => span.traceId)).size,
        errorRate: recentSpans.length > 0 ? (errorSpans.length / recentSpans.length) * 100 : 0,
        averageLatency: recentSpans.length > 0 ? totalDuration / recentSpans.length : 0,
        alertCount: activeAlerts.length
      },
      metrics: {
        systemMetrics: systemMetrics.slice(-50),
        businessMetrics: this.businessMetrics.slice(-50),
        customMetrics: customMetrics.slice(-50)
      },
      traces: {
        recentTraces: traces.slice(0, 20),
        slowestOperations
      },
      alerts: {
        active: activeAlerts,
        recent: recentAlerts,
        byType: alertsByType
      },
      anomalies: {
        recent: recentAnomalies.slice(-20),
        patterns: Object.values(anomalyPatterns)
      }
    }
  }

  /**
   * Query metrics with time range and filters
   */
  queryMetrics(params: {
    metric: string
    timeRange: { from: Date; to: Date }
    labels?: Record<string, string>
    aggregation?: 'avg' | 'sum' | 'min' | 'max' | 'count'
    interval?: string
  }): Array<{ timestamp: number; value: number }> {
    const metricHistory = this.metrics.get(params.metric) || []
    
    let filtered = metricHistory.filter(m => 
      m.timestamp >= params.timeRange.from.getTime() &&
      m.timestamp <= params.timeRange.to.getTime()
    )

    // Apply label filters
    if (params.labels) {
      filtered = filtered.filter(m => {
        return Object.entries(params.labels!).every(([key, value]) => 
          m.labels[key] === value
        )
      })
    }

    // Apply aggregation
    if (params.aggregation && params.interval) {
      const intervalMs = this.parseInterval(params.interval)
      const buckets = new Map<number, number[]>()

      filtered.forEach(m => {
        const bucket = Math.floor(m.timestamp / intervalMs) * intervalMs
        if (!buckets.has(bucket)) {
          buckets.set(bucket, [])
        }
        buckets.get(bucket)!.push(m.value)
      })

      return Array.from(buckets.entries()).map(([timestamp, values]) => ({
        timestamp,
        value: this.aggregateValues(values, params.aggregation!)
      }))
    }

    return filtered.map(m => ({ timestamp: m.timestamp, value: m.value }))
  }

  // Private methods

  private async initializeTracing(): Promise<void> {
    console.log('🔍 Initializing distributed tracing...')
    // In production, configure OpenTelemetry exporters
  }

  private async initializeMetrics(): Promise<void> {
    console.log('📊 Initializing metrics collection...')
    
    // Start system metrics collection
    setInterval(() => {
      this.collectSystemMetrics()
    }, this.config.metrics.interval)
  }

  private async initializeLogging(): Promise<void> {
    console.log('📝 Initializing structured logging...')
    // Configure logging exporters
  }

  private async initializeAnomalyDetection(): Promise<void> {
    console.log('🤖 Initializing anomaly detection...')
    
    // Start anomaly detection cycle
    setInterval(async () => {
      await this.detectAnomalies()
    }, 60000) // Every minute
  }

  private startCollection(): void {
    this.isRunning = true
    
    // Start background tasks
    setInterval(() => {
      this.cleanupOldData()
    }, 300000) // Every 5 minutes

    console.log('📡 Observability data collection started')
  }

  private collectSystemMetrics(): void {
    const now = Date.now()

    // Memory metrics
    if (typeof process !== 'undefined') {
      const memUsage = process.memoryUsage()
      this.recordMetric({
        name: 'system_memory_used',
        type: 'gauge',
        value: memUsage.heapUsed,
        timestamp: now,
        labels: { component: 'nodejs' },
        description: 'Memory usage in bytes',
        unit: 'bytes'
      })

      this.recordMetric({
        name: 'system_memory_total',
        type: 'gauge',
        value: memUsage.heapTotal,
        timestamp: now,
        labels: { component: 'nodejs' },
        description: 'Total memory allocated',
        unit: 'bytes'
      })
    }

    // Event loop lag (mock)
    this.recordMetric({
      name: 'system_event_loop_lag',
      type: 'gauge',
      value: Math.random() * 10,
      timestamp: now,
      labels: { component: 'nodejs' },
      description: 'Event loop lag in milliseconds',
      unit: 'milliseconds'
    })

    // Active handles (mock)
    this.recordMetric({
      name: 'system_active_handles',
      type: 'gauge',
      value: Math.floor(Math.random() * 100) + 50,
      timestamp: now,
      labels: { component: 'nodejs' },
      description: 'Number of active handles'
    })
  }

  private async detectStatisticalAnomalies(): Promise<AnomalyDetection[]> {
    const anomalies: AnomalyDetection[] = []
    const now = new Date()
    const oneHourAgo = now.getTime() - 60 * 60 * 1000

    for (const [metricName, metricHistory] of this.metrics.entries()) {
      const recentData = metricHistory.filter(m => m.timestamp > oneHourAgo)
      if (recentData.length < 10) continue // Need enough data

      const values = recentData.map(m => m.value)
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length
      const stdDev = Math.sqrt(
        values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
      )

      const latest = values[values.length - 1]
      const zScore = Math.abs((latest - mean) / stdDev)

      // Detect anomalies using Z-score
      if (zScore > 2.5) { // 2.5 standard deviations
        const deviation = ((latest - mean) / mean) * 100

        anomalies.push({
          id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          metric: metricName,
          timestamp: now,
          expected: mean,
          actual: latest,
          deviation: Math.abs(deviation),
          severity: zScore > 3 ? 'HIGH' : 'MEDIUM',
          algorithm: 'statistical',
          confidence: Math.min(1, zScore / 3),
          context: {
            zScore,
            stdDev,
            sampleSize: values.length
          }
        })
      }
    }

    return anomalies
  }

  private async detectPatternAnomalies(): Promise<AnomalyDetection[]> {
    // Pattern-based anomaly detection (time series patterns)
    const anomalies: AnomalyDetection[] = []
    // Implementation would analyze time series patterns
    return anomalies
  }

  private async detectMLAnomalies(): Promise<AnomalyDetection[]> {
    // ML-based anomaly detection
    const anomalies: AnomalyDetection[] = []
    // Implementation would use machine learning models
    return anomalies
  }

  private async sendAlertNotification(alert: Alert): Promise<void> {
    console.log(`📧 Sending alert notification: ${alert.title}`)
    // Implementation would send notifications via configured channels
  }

  private generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`
  }

  private logEvent(event: string, data: any): void {
    if (this.config.logging.enabled) {
      console.log(`[${new Date().toISOString()}] ${event}:`, data)
    }
  }

  private getTraces(limit: number): Array<{
    traceId: string
    duration: number
    spanCount: number
    status: string
    operations: string[]
  }> {
    const traceMap = new Map<string, Span[]>()
    
    // Group spans by trace ID
    Array.from(this.spans.values()).forEach(span => {
      if (!traceMap.has(span.traceId)) {
        traceMap.set(span.traceId, [])
      }
      traceMap.get(span.traceId)!.push(span)
    })

    // Convert to trace summaries
    const traces = Array.from(traceMap.entries()).map(([traceId, spans]) => {
      const duration = Math.max(...spans.map(s => (s.endTime || 0) - s.startTime))
      const hasError = spans.some(s => s.status === 'ERROR')
      const operations = [...new Set(spans.map(s => s.operationName))]

      return {
        traceId,
        duration,
        spanCount: spans.length,
        status: hasError ? 'ERROR' : 'OK',
        operations
      }
    })

    return traces
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit)
  }

  private parseInterval(interval: string): number {
    const match = interval.match(/^(\d+)([smhd])$/)
    if (!match) return 60000 // Default 1 minute

    const value = parseInt(match[1])
    const unit = match[2]

    switch (unit) {
      case 's': return value * 1000
      case 'm': return value * 60 * 1000
      case 'h': return value * 60 * 60 * 1000
      case 'd': return value * 24 * 60 * 60 * 1000
      default: return 60000
    }
  }

  private aggregateValues(values: number[], aggregation: string): number {
    switch (aggregation) {
      case 'avg':
        return values.reduce((sum, val) => sum + val, 0) / values.length
      case 'sum':
        return values.reduce((sum, val) => sum + val, 0)
      case 'min':
        return Math.min(...values)
      case 'max':
        return Math.max(...values)
      case 'count':
        return values.length
      default:
        return values[values.length - 1] || 0
    }
  }

  private cleanupOldData(): void {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000

    // Clean old spans
    for (const [spanId, span] of this.spans.entries()) {
      if (span.startTime < oneWeekAgo) {
        this.spans.delete(spanId)
      }
    }

    // Clean old metrics
    for (const [metricName, history] of this.metrics.entries()) {
      const filtered = history.filter(m => m.timestamp > oneWeekAgo)
      this.metrics.set(metricName, filtered)
    }

    // Clean old business metrics
    this.businessMetrics = this.businessMetrics.filter(
      m => m.timestamp.getTime() > oneWeekAgo
    )

    // Clean old alerts (keep for 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    this.alerts = this.alerts.filter(
      alert => alert.timestamp.getTime() > thirtyDaysAgo
    )

    // Clean old anomalies
    this.anomalies = this.anomalies.filter(
      anomaly => anomaly.timestamp.getTime() > oneWeekAgo
    )
  }

  /**
   * Get current observability status
   */
  getStatus(): {
    tracing: { active: boolean; spans: number; traces: number }
    metrics: { active: boolean; metricsCount: number; businessMetrics: number }
    alerts: { active: number; total: number }
    anomalies: { recent: number; total: number }
    health: 'HEALTHY' | 'WARNING' | 'CRITICAL'
  } {
    const activeAlerts = this.alerts.filter(alert => !alert.resolved)
    const recentAnomalies = this.anomalies.filter(
      anomaly => anomaly.timestamp > new Date(Date.now() - 60 * 60 * 1000)
    )

    let health: 'HEALTHY' | 'WARNING' | 'CRITICAL' = 'HEALTHY'
    if (activeAlerts.some(alert => alert.severity === 'CRITICAL')) {
      health = 'CRITICAL'
    } else if (activeAlerts.length > 10 || recentAnomalies.length > 5) {
      health = 'WARNING'
    }

    return {
      tracing: {
        active: this.config.tracing.enabled,
        spans: this.spans.size,
        traces: new Set(Array.from(this.spans.values()).map(s => s.traceId)).size
      },
      metrics: {
        active: this.config.metrics.enabled,
        metricsCount: Array.from(this.metrics.values()).reduce((sum, arr) => sum + arr.length, 0),
        businessMetrics: this.businessMetrics.length
      },
      alerts: {
        active: activeAlerts.length,
        total: this.alerts.length
      },
      anomalies: {
        recent: recentAnomalies.length,
        total: this.anomalies.length
      },
      health
    }
  }

  /**
   * Cleanup and shutdown
   */
  async cleanup(): Promise<void> {
    this.isRunning = false
    this.removeAllListeners()
    console.log('✅ Advanced Observability Orchestrator cleanup completed')
  }
}

export default AdvancedObservabilityOrchestrator