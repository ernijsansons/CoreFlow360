/**
 * CoreFlow360 - Enterprise Observability & Intelligence Platform
 * Advanced monitoring, alerting, and predictive analytics orchestration
 */

import { EventEmitter } from 'events'
import { Redis } from 'ioredis'
import { OpenAI } from 'openai'
import { performance } from 'perf_hooks'

export interface ObservabilityConfig {
  metrics: {
    enabled: boolean
    collectionInterval: number
    retentionPeriod: number
    batchSize: number
  }
  logging: {
    enabled: boolean
    logLevel: 'debug' | 'info' | 'warn' | 'error'
    structuredLogging: boolean
    logAggregation: boolean
  }
  tracing: {
    enabled: boolean
    samplingRate: number
    enableDistributedTracing: boolean
    traceRetention: number
  }
  alerting: {
    enabled: boolean
    enableMLAnomalyDetection: boolean
    alertChannels: string[]
    escalationRules: EscalationRule[]
  }
  analytics: {
    enabled: boolean
    enablePredictiveAnalytics: boolean
    enableBusinessIntelligence: boolean
    analysisInterval: number
  }
}

export interface MetricPoint {
  id: string
  timestamp: Date
  name: string
  value: number
  unit: string
  tags: Record<string, string>
  labels: Record<string, string>
  source: string
  tenantId?: string
}

export interface LogEntry {
  id: string
  timestamp: Date
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  source: string
  service: string
  tenantId?: string
  userId?: string
  traceId?: string
  spanId?: string
  metadata: Record<string, any>
  structured: Record<string, any>
}

export interface TraceSpan {
  id: string
  traceId: string
  parentSpanId?: string
  operation: string
  service: string
  startTime: Date
  endTime?: Date
  duration?: number
  status: 'success' | 'error' | 'timeout'
  tags: Record<string, string>
  logs: LogEntry[]
  metadata: Record<string, any>
}

export interface Alert {
  id: string
  timestamp: Date
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED' | 'ESCALATED'
  type: 'THRESHOLD' | 'ANOMALY' | 'PREDICTION' | 'BUSINESS_RULE'
  title: string
  description: string
  source: string
  metric?: string
  currentValue?: number
  threshold?: number
  tenantId?: string
  assignee?: string
  escalationLevel: number
  metadata: Record<string, any>
}

export interface EscalationRule {
  id: string
  name: string
  condition: string
  timeWindow: number
  actions: Array<{
    type: 'email' | 'slack' | 'webhook' | 'sms'
    target: string
    template: string
  }>
  enabled: boolean
}

export interface AnalyticsInsight {
  id: string
  type: 'TREND' | 'ANOMALY' | 'PREDICTION' | 'CORRELATION' | 'BUSINESS_METRIC'
  category: 'PERFORMANCE' | 'SECURITY' | 'BUSINESS' | 'INFRASTRUCTURE'
  severity: 'INFO' | 'WARNING' | 'CRITICAL'
  title: string
  description: string
  confidence: number
  impact: string
  recommendations: string[]
  data: Record<string, any>
  timestamp: Date
  tenantId?: string
}

export interface BusinessMetric {
  id: string
  name: string
  category: 'REVENUE' | 'GROWTH' | 'ENGAGEMENT' | 'EFFICIENCY' | 'QUALITY'
  value: number
  target?: number
  unit: string
  trend: 'UP' | 'DOWN' | 'STABLE'
  changePercent: number
  timestamp: Date
  tenantId?: string
  breakdown: Record<string, number>
}

export class ObservabilityOrchestrator extends EventEmitter {
  private config: ObservabilityConfig
  private redis: Redis
  private openai: OpenAI
  private metrics: Map<string, MetricPoint[]>
  private logs: Map<string, LogEntry[]>
  private traces: Map<string, TraceSpan[]>
  private alerts: Map<string, Alert>
  private insights: AnalyticsInsight[]
  private businessMetrics: Map<string, BusinessMetric[]>
  private anomalyDetector: AnomalyDetector
  private predictiveAnalyzer: PredictiveAnalyzer
  private isRunning: boolean = false
  private collectionInterval: NodeJS.Timer | null = null
  private analysisInterval: NodeJS.Timer | null = null

  constructor(config: ObservabilityConfig, redis: Redis, openaiApiKey?: string) {
    super()
    this.config = config
    this.redis = redis
    this.openai = new OpenAI({ apiKey: openaiApiKey })
    
    this.metrics = new Map()
    this.logs = new Map()
    this.traces = new Map()
    this.alerts = new Map()
    this.insights = []
    this.businessMetrics = new Map()
    
    this.anomalyDetector = new AnomalyDetector(this.redis)
    this.predictiveAnalyzer = new PredictiveAnalyzer(this.openai)
    
    this.initialize()
  }

  /**
   * Start observability orchestration
   */
  async start(): Promise<void> {
    if (this.isRunning) return
    
    console.log('👁️ Starting Enterprise Observability Platform')
    this.isRunning = true
    
    // Start metrics collection
    if (this.config.metrics.enabled) {
      this.startMetricsCollection()
    }
    
    // Start analytics processing
    if (this.config.analytics.enabled) {
      this.startAnalyticsProcessing()
    }
    
    // Start alerting engine
    if (this.config.alerting.enabled) {
      this.startAlertingEngine()
    }
    
    console.log('✅ Observability Platform started successfully')
    this.emit('started')
  }

  /**
   * Collect metric data point
   */
  async collectMetric(metric: Omit<MetricPoint, 'id' | 'timestamp'>): Promise<void> {
    const metricPoint: MetricPoint = {
      id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...metric
    }
    
    // Store in memory
    const key = `${metric.source}:${metric.name}`
    if (!this.metrics.has(key)) {
      this.metrics.set(key, [])
    }
    
    const metricHistory = this.metrics.get(key)!
    metricHistory.push(metricPoint)
    
    // Keep only recent metrics
    const cutoff = new Date(Date.now() - this.config.metrics.retentionPeriod * 1000)
    this.metrics.set(key, metricHistory.filter(m => m.timestamp > cutoff))
    
    // Store in Redis for persistence
    await this.redis.zadd(
      `metrics:${key}`,
      metricPoint.timestamp.getTime(),
      JSON.stringify(metricPoint)
    )
    
    // Remove old entries
    await this.redis.zremrangebyscore(
      `metrics:${key}`,
      0,
      cutoff.getTime()
    )
    
    // Check for threshold alerts
    await this.checkThresholdAlerts(metricPoint)
    
    // Check for anomalies if enabled
    if (this.config.alerting.enableMLAnomalyDetection) {
      await this.checkAnomalies(metricPoint)
    }
    
    this.emit('metricCollected', metricPoint)
  }

  /**
   * Log structured entry
   */
  async log(entry: Omit<LogEntry, 'id' | 'timestamp'>): Promise<void> {
    const logEntry: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...entry
    }
    
    // Store in memory
    const key = `${entry.service}:${entry.source}`
    if (!this.logs.has(key)) {
      this.logs.set(key, [])
    }
    
    const logHistory = this.logs.get(key)!
    logHistory.push(logEntry)
    
    // Keep only recent logs (last 1000 per service)
    if (logHistory.length > 1000) {
      this.logs.set(key, logHistory.slice(-1000))
    }
    
    // Store in Redis with TTL
    await this.redis.setex(
      `log:${logEntry.id}`,
      86400, // 24 hours
      JSON.stringify(logEntry)
    )
    
    // Add to log stream
    await this.redis.xadd(
      `logs:${key}`,
      '*',
      'data', JSON.stringify(logEntry)
    )
    
    // Trim stream to keep last 10000 entries
    await this.redis.xtrim(`logs:${key}`, 'MAXLEN', '~', '10000')
    
    // Check for error patterns
    if (entry.level === 'error') {
      await this.analyzeErrorPatterns(logEntry)
    }
    
    this.emit('logCreated', logEntry)
  }

  /**
   * Create distributed trace span
   */
  async createTrace(span: Omit<TraceSpan, 'id' | 'startTime'>): Promise<string> {
    const traceSpan: TraceSpan = {
      id: `span_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: new Date(),
      ...span
    }
    
    // Store in memory
    if (!this.traces.has(span.traceId)) {
      this.traces.set(span.traceId, [])
    }
    
    this.traces.get(span.traceId)!.push(traceSpan)
    
    // Store in Redis
    await this.redis.setex(
      `trace:${traceSpan.id}`,
      3600, // 1 hour
      JSON.stringify(traceSpan)
    )
    
    this.emit('traceStarted', traceSpan)
    return traceSpan.id
  }

  /**
   * Finish trace span
   */
  async finishTrace(spanId: string, status: TraceSpan['status'], metadata?: Record<string, any>): Promise<void> {
    // Find span
    let foundSpan: TraceSpan | null = null
    for (const spans of this.traces.values()) {
      const span = spans.find(s => s.id === spanId)
      if (span) {
        foundSpan = span
        break
      }
    }
    
    if (!foundSpan) {
      console.warn(`Trace span not found: ${spanId}`)
      return
    }
    
    // Update span
    foundSpan.endTime = new Date()
    foundSpan.duration = foundSpan.endTime.getTime() - foundSpan.startTime.getTime()
    foundSpan.status = status
    if (metadata) {
      foundSpan.metadata = { ...foundSpan.metadata, ...metadata }
    }
    
    // Update in Redis
    await this.redis.setex(
      `trace:${spanId}`,
      3600,
      JSON.stringify(foundSpan)
    )
    
    // Analyze trace performance
    if (foundSpan.duration && foundSpan.duration > 5000) {
      await this.generateAlert({
        severity: 'HIGH',
        type: 'THRESHOLD',
        title: 'Slow Operation Detected',
        description: `Operation ${foundSpan.operation} took ${foundSpan.duration}ms`,
        source: foundSpan.service,
        metric: 'operation_duration',
        currentValue: foundSpan.duration,
        threshold: 5000,
        metadata: { spanId, traceId: foundSpan.traceId }
      })
    }
    
    this.emit('traceFinished', foundSpan)
  }

  /**
   * Generate intelligent alert
   */
  async generateAlert(alert: Omit<Alert, 'id' | 'timestamp' | 'status' | 'escalationLevel'>): Promise<Alert> {
    const newAlert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      status: 'OPEN',
      escalationLevel: 0,
      ...alert
    }
    
    this.alerts.set(newAlert.id, newAlert)
    
    // Store in Redis
    await this.redis.setex(
      `alert:${newAlert.id}`,
      86400 * 7, // 7 days
      JSON.stringify(newAlert)
    )
    
    // Add to alerts stream
    await this.redis.xadd(
      'alerts:stream',
      '*',
      'alert', JSON.stringify(newAlert)
    )
    
    // Process alert routing
    await this.processAlertRouting(newAlert)
    
    this.emit('alertGenerated', newAlert)
    return newAlert
  }

  /**
   * Generate analytics insights
   */
  async generateInsights(tenantId?: string): Promise<AnalyticsInsight[]> {
    console.log('🧠 Generating analytics insights...')
    
    const insights: AnalyticsInsight[] = []
    
    try {
      // Performance insights
      const performanceInsights = await this.analyzePerformancePatterns(tenantId)
      insights.push(...performanceInsights)
      
      // Business insights
      if (this.config.analytics.enableBusinessIntelligence) {
        const businessInsights = await this.analyzeBusinessMetrics(tenantId)
        insights.push(...businessInsights)
      }
      
      // Predictive insights
      if (this.config.analytics.enablePredictiveAnalytics) {
        const predictiveInsights = await this.generatePredictiveInsights(tenantId)
        insights.push(...predictiveInsights)
      }
      
      // Security insights
      const securityInsights = await this.analyzeSecurityPatterns(tenantId)
      insights.push(...securityInsights)
      
      // Store insights
      this.insights.unshift(...insights)
      
      // Keep only last 1000 insights
      if (this.insights.length > 1000) {
        this.insights = this.insights.slice(0, 1000)
      }
      
      // Store in Redis
      for (const insight of insights) {
        await this.redis.setex(
          `insight:${insight.id}`,
          86400 * 30, // 30 days
          JSON.stringify(insight)
        )
      }
      
      console.log(`✅ Generated ${insights.length} analytics insights`)
      this.emit('insightsGenerated', insights)
      
      return insights
      
    } catch (error) {
      console.error('Failed to generate insights:', error)
      return []
    }
  }

  /**
   * Track business metric
   */
  async trackBusinessMetric(metric: Omit<BusinessMetric, 'id' | 'timestamp'>): Promise<void> {
    const businessMetric: BusinessMetric = {
      id: `biz_metric_${Date.now()}`,
      timestamp: new Date(),
      ...metric
    }
    
    // Store in memory
    if (!this.businessMetrics.has(metric.name)) {
      this.businessMetrics.set(metric.name, [])
    }
    
    const history = this.businessMetrics.get(metric.name)!
    history.push(businessMetric)
    
    // Keep last 100 data points
    if (history.length > 100) {
      this.businessMetrics.set(metric.name, history.slice(-100))
    }
    
    // Store in Redis
    await this.redis.zadd(
      `business_metrics:${metric.name}`,
      businessMetric.timestamp.getTime(),
      JSON.stringify(businessMetric)
    )
    
    this.emit('businessMetricTracked', businessMetric)
  }

  /**
   * Get comprehensive observability dashboard
   */
  async getDashboard(tenantId?: string): Promise<{
    overview: {
      systemHealth: number
      activeAlerts: number
      criticalAlerts: number
      avgResponseTime: number
      errorRate: number
      throughput: number
    }
    metrics: {
      performance: MetricPoint[]
      business: BusinessMetric[]
      security: MetricPoint[]
    }
    alerts: Alert[]
    insights: AnalyticsInsight[]
    traces: {
      slowOperations: TraceSpan[]
      erroredOperations: TraceSpan[]
      topOperations: Array<{ operation: string; count: number; avgDuration: number }>
    }
    trends: {
      performance: Array<{ timestamp: Date; value: number }>
      business: Array<{ timestamp: Date; value: number }>
      alerts: Array<{ timestamp: Date; count: number }>
    }
  }> {
    // Filter data by tenant if specified
    const filteredAlerts = Array.from(this.alerts.values())
      .filter(alert => !tenantId || alert.tenantId === tenantId)
    
    const filteredInsights = this.insights
      .filter(insight => !tenantId || insight.tenantId === tenantId)
    
    // Calculate system health
    const systemHealth = this.calculateSystemHealth(filteredAlerts)
    
    // Get performance metrics
    const performanceMetrics = this.getLatestMetrics('performance', tenantId)
    const businessMetrics = Array.from(this.businessMetrics.values()).flat()
      .filter(metric => !tenantId || metric.tenantId === tenantId)
    const securityMetrics = this.getLatestMetrics('security', tenantId)
    
    // Get trace analysis
    const traces = Array.from(this.traces.values()).flat()
    const slowOperations = traces
      .filter(span => span.duration && span.duration > 1000)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, 10)
    
    const erroredOperations = traces
      .filter(span => span.status === 'error')
      .slice(0, 10)
    
    // Calculate trends
    const trends = {
      performance: this.calculateTrend('response_time', tenantId),
      business: this.calculateBusinessTrend('revenue', tenantId),
      alerts: this.calculateAlertTrend(tenantId)
    }
    
    return {
      overview: {
        systemHealth,
        activeAlerts: filteredAlerts.filter(a => a.status === 'OPEN').length,
        criticalAlerts: filteredAlerts.filter(a => a.severity === 'CRITICAL').length,
        avgResponseTime: this.calculateAverageResponseTime(tenantId),
        errorRate: this.calculateErrorRate(tenantId),
        throughput: this.calculateThroughput(tenantId)
      },
      metrics: {
        performance: performanceMetrics,
        business: businessMetrics.slice(0, 50),
        security: securityMetrics
      },
      alerts: filteredAlerts.slice(0, 20),
      insights: filteredInsights.slice(0, 10),
      traces: {
        slowOperations,
        erroredOperations,
        topOperations: this.calculateTopOperations(traces)
      },
      trends
    }
  }

  // Private methods
  private async initialize(): Promise<void> {
    console.log('👁️ Initializing Observability Orchestrator')
    
    // Initialize anomaly detector
    await this.anomalyDetector.initialize()
    
    // Load historical data from Redis
    await this.loadHistoricalData()
    
    console.log('✅ Observability Orchestrator initialized')
  }

  private startMetricsCollection(): void {
    this.collectionInterval = setInterval(async () => {
      try {
        await this.collectSystemMetrics()
      } catch (error) {
        console.error('Metrics collection error:', error)
      }
    }, this.config.metrics.collectionInterval)
    
    console.log('📊 Metrics collection started')
  }

  private startAnalyticsProcessing(): void {
    this.analysisInterval = setInterval(async () => {
      try {
        await this.generateInsights()
      } catch (error) {
        console.error('Analytics processing error:', error)
      }
    }, this.config.analytics.analysisInterval)
    
    console.log('🧠 Analytics processing started')
  }

  private startAlertingEngine(): void {
    // Process alert escalations
    setInterval(async () => {
      await this.processAlertEscalations()
    }, 60000) // Every minute
    
    console.log('🚨 Alerting engine started')
  }

  private async collectSystemMetrics(): Promise<void> {
    // Collect system performance metrics
    await this.collectMetric({
      name: 'cpu_usage',
      value: await this.getCPUUsage(),
      unit: 'percentage',
      tags: { type: 'system' },
      labels: { component: 'infrastructure' },
      source: 'system_monitor'
    })
    
    await this.collectMetric({
      name: 'memory_usage',
      value: await this.getMemoryUsage(),
      unit: 'percentage',
      tags: { type: 'system' },
      labels: { component: 'infrastructure' },
      source: 'system_monitor'
    })
    
    await this.collectMetric({
      name: 'response_time',
      value: await this.getAverageResponseTime(),
      unit: 'milliseconds',
      tags: { type: 'performance' },
      labels: { component: 'api' },
      source: 'performance_monitor'
    })
  }

  private async checkThresholdAlerts(metric: MetricPoint): Promise<void> {
    // Define thresholds
    const thresholds: Record<string, { warning: number; critical: number }> = {
      'cpu_usage': { warning: 70, critical: 90 },
      'memory_usage': { warning: 80, critical: 95 },
      'response_time': { warning: 1000, critical: 5000 },
      'error_rate': { warning: 5, critical: 10 }
    }
    
    const threshold = thresholds[metric.name]
    if (!threshold) return
    
    if (metric.value >= threshold.critical) {
      await this.generateAlert({
        severity: 'CRITICAL',
        type: 'THRESHOLD',
        title: `Critical ${metric.name} threshold exceeded`,
        description: `${metric.name} is ${metric.value}${metric.unit} (threshold: ${threshold.critical}${metric.unit})`,
        source: metric.source,
        metric: metric.name,
        currentValue: metric.value,
        threshold: threshold.critical,
        tenantId: metric.tenantId
      })
    } else if (metric.value >= threshold.warning) {
      await this.generateAlert({
        severity: 'HIGH',
        type: 'THRESHOLD',
        title: `Warning ${metric.name} threshold exceeded`,
        description: `${metric.name} is ${metric.value}${metric.unit} (threshold: ${threshold.warning}${metric.unit})`,
        source: metric.source,
        metric: metric.name,
        currentValue: metric.value,
        threshold: threshold.warning,
        tenantId: metric.tenantId
      })
    }
  }

  private async checkAnomalies(metric: MetricPoint): Promise<void> {
    const isAnomaly = await this.anomalyDetector.detectAnomaly(metric)
    
    if (isAnomaly) {
      await this.generateAlert({
        severity: 'MEDIUM',
        type: 'ANOMALY',
        title: `Anomaly detected in ${metric.name}`,
        description: `Unusual pattern detected in ${metric.name}: ${metric.value}${metric.unit}`,
        source: metric.source,
        metric: metric.name,
        currentValue: metric.value,
        tenantId: metric.tenantId,
        metadata: { anomalyType: 'statistical' }
      })
    }
  }

  private async analyzeErrorPatterns(logEntry: LogEntry): Promise<void> {
    // Count recent errors
    const recentErrors = Array.from(this.logs.values())
      .flat()
      .filter(log => 
        log.level === 'error' && 
        log.timestamp > new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
      )
    
    if (recentErrors.length > 10) {
      await this.generateAlert({
        severity: 'HIGH',
        type: 'THRESHOLD',
        title: 'Error rate spike detected',
        description: `${recentErrors.length} errors in the last 5 minutes`,
        source: logEntry.service,
        currentValue: recentErrors.length,
        threshold: 10,
        tenantId: logEntry.tenantId
      })
    }
  }

  private async processAlertRouting(alert: Alert): Promise<void> {
    // Route critical alerts immediately
    if (alert.severity === 'CRITICAL') {
      this.emit('criticalAlert', alert)
    }
    
    // Apply escalation rules
    const applicableRules = this.config.alerting.escalationRules.filter(rule => 
      rule.enabled && this.evaluateRuleCondition(rule.condition, alert)
    )
    
    for (const rule of applicableRules) {
      for (const action of rule.actions) {
        await this.executeAlertAction(action, alert)
      }
    }
  }

  private async processAlertEscalations(): Promise<void> {
    const openAlerts = Array.from(this.alerts.values()).filter(alert => alert.status === 'OPEN')
    
    for (const alert of openAlerts) {
      const age = Date.now() - alert.timestamp.getTime()
      const hoursSinceCreated = age / (1000 * 60 * 60)
      
      // Escalate high severity alerts after 1 hour
      if (alert.severity === 'HIGH' && hoursSinceCreated > 1 && alert.escalationLevel === 0) {
        alert.escalationLevel = 1
        alert.status = 'ESCALATED'
        
        await this.redis.setex(`alert:${alert.id}`, 86400 * 7, JSON.stringify(alert))
        this.emit('alertEscalated', alert)
      }
      
      // Escalate critical alerts after 30 minutes
      if (alert.severity === 'CRITICAL' && hoursSinceCreated > 0.5 && alert.escalationLevel === 0) {
        alert.escalationLevel = 1
        alert.status = 'ESCALATED'
        
        await this.redis.setex(`alert:${alert.id}`, 86400 * 7, JSON.stringify(alert))
        this.emit('alertEscalated', alert)
      }
    }
  }

  private async analyzePerformancePatterns(tenantId?: string): Promise<AnalyticsInsight[]> {
    const insights: AnalyticsInsight[] = []
    
    // Analyze response time trends
    const responseTimeMetrics = this.getLatestMetrics('response_time', tenantId)
    if (responseTimeMetrics.length > 10) {
      const trend = this.calculateTrendDirection(responseTimeMetrics.map(m => m.value))
      
      if (trend === 'INCREASING') {
        insights.push({
          id: `insight_${Date.now()}_1`,
          type: 'TREND',
          category: 'PERFORMANCE',
          severity: 'WARNING',
          title: 'Response Time Degradation',
          description: 'Response times are trending upward over the last hour',
          confidence: 85,
          impact: 'User experience may be affected',
          recommendations: [
            'Check database query performance',
            'Review recent deployments',
            'Monitor system resources'
          ],
          data: { trend, metricCount: responseTimeMetrics.length },
          timestamp: new Date(),
          tenantId
        })
      }
    }
    
    return insights
  }

  private async analyzeBusinessMetrics(tenantId?: string): Promise<AnalyticsInsight[]> {
    const insights: AnalyticsInsight[] = []
    
    // Example business metric analysis
    const revenueMetrics = this.businessMetrics.get('revenue') || []
    if (revenueMetrics.length > 5) {
      const latestRevenue = revenueMetrics[revenueMetrics.length - 1]
      const previousRevenue = revenueMetrics[revenueMetrics.length - 2]
      
      if (latestRevenue && previousRevenue) {
        const changePercent = ((latestRevenue.value - previousRevenue.value) / previousRevenue.value) * 100
        
        if (changePercent > 10) {
          insights.push({
            id: `insight_${Date.now()}_2`,
            type: 'TREND',
            category: 'BUSINESS',
            severity: 'INFO',
            title: 'Revenue Growth Detected',
            description: `Revenue increased by ${changePercent.toFixed(1)}% from previous period`,
            confidence: 95,
            impact: 'Positive business performance indicator',
            recommendations: [
              'Analyze growth drivers',
              'Scale infrastructure if needed',
              'Monitor customer satisfaction'
            ],
            data: { changePercent, currentValue: latestRevenue.value },
            timestamp: new Date(),
            tenantId
          })
        }
      }
    }
    
    return insights
  }

  private async generatePredictiveInsights(tenantId?: string): Promise<AnalyticsInsight[]> {
    const insights: AnalyticsInsight[] = []
    
    try {
      // Use AI to generate predictive insights
      const performanceData = this.getLatestMetrics('performance', tenantId)
      const prediction = await this.predictiveAnalyzer.analyzePerformanceTrends(performanceData)
      
      if (prediction.confidence > 70) {
        insights.push({
          id: `insight_${Date.now()}_3`,
          type: 'PREDICTION',
          category: 'PERFORMANCE',
          severity: prediction.severity as AnalyticsInsight['severity'],
          title: prediction.title,
          description: prediction.description,
          confidence: prediction.confidence,
          impact: prediction.impact,
          recommendations: prediction.recommendations,
          data: prediction.data,
          timestamp: new Date(),
          tenantId
        })
      }
      
    } catch (error) {
      console.error('Predictive analysis error:', error)
    }
    
    return insights
  }

  private async analyzeSecurityPatterns(tenantId?: string): Promise<AnalyticsInsight[]> {
    const insights: AnalyticsInsight[] = []
    
    // Analyze security-related logs
    const securityLogs = Array.from(this.logs.values())
      .flat()
      .filter(log => 
        log.message.toLowerCase().includes('security') ||
        log.message.toLowerCase().includes('auth') ||
        log.message.toLowerCase().includes('login')
      )
      .filter(log => !tenantId || log.tenantId === tenantId)
    
    const failedLogins = securityLogs.filter(log => 
      log.level === 'warn' && log.message.includes('login')
    )
    
    if (failedLogins.length > 5) {
      insights.push({
        id: `insight_${Date.now()}_4`,
        type: 'ANOMALY',
        category: 'SECURITY',
        severity: 'WARNING',
        title: 'Increased Failed Login Attempts',
        description: `${failedLogins.length} failed login attempts detected in recent activity`,
        confidence: 90,
        impact: 'Potential security threat',
        recommendations: [
          'Review authentication logs',
          'Check for brute force attempts',
          'Consider implementing rate limiting'
        ],
        data: { failedLogins: failedLogins.length },
        timestamp: new Date(),
        tenantId
      })
    }
    
    return insights
  }

  // Helper methods for calculations
  private calculateSystemHealth(alerts: Alert[]): number {
    const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' && a.status === 'OPEN').length
    const highAlerts = alerts.filter(a => a.severity === 'HIGH' && a.status === 'OPEN').length
    const mediumAlerts = alerts.filter(a => a.severity === 'MEDIUM' && a.status === 'OPEN').length
    
    let health = 100
    health -= criticalAlerts * 30
    health -= highAlerts * 15
    health -= mediumAlerts * 5
    
    return Math.max(0, Math.min(100, health))
  }

  private getLatestMetrics(category: string, tenantId?: string): MetricPoint[] {
    const allMetrics: MetricPoint[] = []
    
    for (const [key, metrics] of this.metrics) {
      if (key.includes(category)) {
        const filteredMetrics = tenantId 
          ? metrics.filter(m => m.tenantId === tenantId)
          : metrics
        allMetrics.push(...filteredMetrics.slice(-20)) // Last 20 points
      }
    }
    
    return allMetrics.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  }

  private calculateTrend(metricName: string, tenantId?: string): Array<{ timestamp: Date; value: number }> {
    const metrics = this.getLatestMetrics(metricName, tenantId)
    return metrics.map(m => ({ timestamp: m.timestamp, value: m.value }))
  }

  private calculateBusinessTrend(metricName: string, tenantId?: string): Array<{ timestamp: Date; value: number }> {
    const metrics = this.businessMetrics.get(metricName) || []
    const filteredMetrics = tenantId 
      ? metrics.filter(m => m.tenantId === tenantId)
      : metrics
    
    return filteredMetrics
      .slice(-20)
      .map(m => ({ timestamp: m.timestamp, value: m.value }))
  }

  private calculateAlertTrend(tenantId?: string): Array<{ timestamp: Date; count: number }> {
    // Group alerts by hour
    const hourlyAlerts = new Map<string, number>()
    
    for (const alert of this.alerts.values()) {
      if (tenantId && alert.tenantId !== tenantId) continue
      
      const hour = new Date(alert.timestamp)
      hour.setMinutes(0, 0, 0)
      const key = hour.toISOString()
      
      hourlyAlerts.set(key, (hourlyAlerts.get(key) || 0) + 1)
    }
    
    return Array.from(hourlyAlerts.entries())
      .map(([timestamp, count]) => ({ timestamp: new Date(timestamp), count }))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  }

  private calculateTrendDirection(values: number[]): 'INCREASING' | 'DECREASING' | 'STABLE' {
    if (values.length < 2) return 'STABLE'
    
    const first = values[0]
    const last = values[values.length - 1]
    const change = ((last - first) / first) * 100
    
    if (Math.abs(change) < 5) return 'STABLE'
    return change > 0 ? 'INCREASING' : 'DECREASING'
  }

  private calculateTopOperations(traces: TraceSpan[]): Array<{ operation: string; count: number; avgDuration: number }> {
    const operationStats = new Map<string, { count: number; totalDuration: number }>()
    
    for (const trace of traces) {
      if (!trace.duration) continue
      
      const stats = operationStats.get(trace.operation) || { count: 0, totalDuration: 0 }
      stats.count++
      stats.totalDuration += trace.duration
      operationStats.set(trace.operation, stats)
    }
    
    return Array.from(operationStats.entries())
      .map(([operation, stats]) => ({
        operation,
        count: stats.count,
        avgDuration: Math.round(stats.totalDuration / stats.count)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }

  private async getCPUUsage(): Promise<number> {
    // Mock implementation
    return Math.random() * 100
  }

  private async getMemoryUsage(): Promise<number> {
    // Mock implementation
    return Math.random() * 100
  }

  private async getAverageResponseTime(): Promise<number> {
    // Mock implementation
    return 200 + Math.random() * 300
  }

  private calculateAverageResponseTime(tenantId?: string): number {
    const metrics = this.getLatestMetrics('response_time', tenantId)
    if (metrics.length === 0) return 0
    
    return metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length
  }

  private calculateErrorRate(tenantId?: string): number {
    const errorLogs = Array.from(this.logs.values())
      .flat()
      .filter(log => log.level === 'error')
      .filter(log => !tenantId || log.tenantId === tenantId)
    
    const totalLogs = Array.from(this.logs.values())
      .flat()
      .filter(log => !tenantId || log.tenantId === tenantId)
    
    return totalLogs.length > 0 ? (errorLogs.length / totalLogs.length) * 100 : 0
  }

  private calculateThroughput(tenantId?: string): number {
    // Mock implementation - would calculate from request metrics
    return 150 + Math.random() * 50
  }

  private evaluateRuleCondition(condition: string, alert: Alert): boolean {
    // Simple condition evaluation - would implement proper expression parser
    return condition.includes(alert.severity) || condition.includes(alert.type)
  }

  private async executeAlertAction(action: any, alert: Alert): Promise<void> {
    console.log(`Executing alert action: ${action.type} for alert ${alert.id}`)
    // Would implement actual notification channels
  }

  private async loadHistoricalData(): Promise<void> {
    // Load recent metrics, logs, traces from Redis
    console.log('Loading historical observability data...')
  }

  /**
   * Cleanup resources
   */
  async stop(): Promise<void> {
    this.isRunning = false
    
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval)
    }
    
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval)
    }
    
    console.log('✅ Observability Orchestrator stopped')
  }
}

// Helper classes
class AnomalyDetector {
  private redis: Redis

  constructor(redis: Redis) {
    this.redis = redis
  }

  async initialize(): Promise<void> {
    console.log('🤖 Initializing ML anomaly detector')
  }

  async detectAnomaly(metric: MetricPoint): Promise<boolean> {
    // Simple statistical anomaly detection
    // In production, would use more sophisticated ML algorithms
    
    const historicalValues = await this.getHistoricalValues(metric.name, metric.source)
    if (historicalValues.length < 10) return false
    
    const mean = historicalValues.reduce((sum, val) => sum + val, 0) / historicalValues.length
    const variance = historicalValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / historicalValues.length
    const stdDev = Math.sqrt(variance)
    
    // Value is anomalous if it's more than 3 standard deviations from mean
    return Math.abs(metric.value - mean) > 3 * stdDev
  }

  private async getHistoricalValues(metricName: string, source: string): Promise<number[]> {
    const key = `metrics:${source}:${metricName}`
    const results = await this.redis.zrevrange(key, 0, 99, 'WITHSCORES')
    
    const values: number[] = []
    for (let i = 0; i < results.length; i += 2) {
      const data = JSON.parse(results[i])
      values.push(data.value)
    }
    
    return values
  }
}

class PredictiveAnalyzer {
  private openai: OpenAI

  constructor(openai: OpenAI) {
    this.openai = openai
  }

  async analyzePerformanceTrends(metrics: MetricPoint[]): Promise<{
    title: string
    description: string
    confidence: number
    severity: string
    impact: string
    recommendations: string[]
    data: Record<string, any>
  }> {
    if (metrics.length < 5) {
      return {
        title: 'Insufficient Data',
        description: 'Not enough data points for prediction',
        confidence: 0,
        severity: 'INFO',
        impact: 'No impact',
        recommendations: [],
        data: {}
      }
    }

    try {
      const prompt = `
        Analyze these performance metrics and predict potential issues:
        
        ${metrics.slice(-10).map(m => `${m.name}: ${m.value}${m.unit} at ${m.timestamp}`).join('\n')}
        
        Provide a prediction in JSON format with:
        - title: Brief prediction title
        - description: Detailed explanation
        - confidence: 0-100 confidence score
        - severity: INFO, WARNING, or CRITICAL
        - impact: Expected business impact
        - recommendations: Array of actionable recommendations
        - data: Relevant analysis data
      `

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 500
      })

      const result = response.choices[0]?.message?.content
      if (!result) {
        throw new Error('No response from AI')
      }

      return JSON.parse(result)

    } catch (error) {
      console.error('Predictive analysis error:', error)
      return {
        title: 'Analysis Error',
        description: 'Unable to generate prediction',
        confidence: 0,
        severity: 'INFO',
        impact: 'No impact',
        recommendations: [],
        data: {}
      }
    }
  }
}

export default ObservabilityOrchestrator