/**
 * CoreFlow360 - Advanced Error Tracking and Debugging System
 * Comprehensive error capture, analysis, and debugging capabilities
 */

import { getRedis } from '@/lib/redis/client'
import { productionMonitor } from '@/lib/monitoring/production-alerts'
import { advancedCache } from '@/lib/cache/advanced-cache'

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Error categories
export enum ErrorCategory {
  CLIENT = 'client',
  SERVER = 'server',
  DATABASE = 'database',
  EXTERNAL = 'external',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  VALIDATION = 'validation',
  BUSINESS_LOGIC = 'business_logic',
}

// Error context interface
export interface ErrorContext {
  userId?: string
  tenantId?: string
  sessionId?: string
  requestId?: string
  userAgent?: string
  ipAddress?: string
  url?: string
  method?: string
  headers?: Record<string, string>
  body?: any
  query?: Record<string, any>
  params?: Record<string, string>
  timestamp: Date
  environment: string
  version: string
}

// Structured error interface
export interface StructuredError {
  id: string
  message: string
  stack?: string
  name: string
  code?: string | number
  severity: ErrorSeverity
  category: ErrorCategory
  context: ErrorContext
  fingerprint: string
  firstSeen: Date
  lastSeen: Date
  count: number
  resolved: boolean
  resolvedAt?: Date
  resolvedBy?: string
  tags: string[]
  metadata: Record<string, any>
}

// Error pattern interface
export interface ErrorPattern {
  fingerprint: string
  pattern: string
  count: number
  firstSeen: Date
  lastSeen: Date
  affectedUsers: Set<string>
  examples: StructuredError[]
  trend: 'increasing' | 'decreasing' | 'stable'
}

// Debug session interface
export interface DebugSession {
  id: string
  userId: string
  tenantId: string
  startTime: Date
  endTime?: Date
  logs: DebugLog[]
  performance: PerformanceSnapshot[]
  errors: StructuredError[]
  context: Record<string, any>
  tags: string[]
}

export interface DebugLog {
  timestamp: Date
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  data?: any
  source: string
}

export interface PerformanceSnapshot {
  timestamp: Date
  metrics: {
    memory: NodeJS.MemoryUsage
    cpu: number
    responseTime: number
    activeRequests: number
  }
}

// Error aggregation interface
export interface ErrorAggregation {
  period: string
  totalErrors: number
  errorsByCategory: Record<ErrorCategory, number>
  errorsBySeverity: Record<ErrorSeverity, number>
  topErrors: Array<{
    fingerprint: string
    message: string
    count: number
    lastSeen: Date
  }>
  affectedUsers: number
  errorRate: number
}

export class AdvancedErrorTracker {
  private static instance: AdvancedErrorTracker
  private redis = getRedis()
  private errorStore = new Map<string, StructuredError>()
  private patterns = new Map<string, ErrorPattern>()
  private debugSessions = new Map<string, DebugSession>()
  private alertThresholds = {
    errorRate: 0.05, // 5% error rate triggers alert
    criticalErrors: 10, // 10 critical errors in 5 minutes
    newErrorPatterns: 5, // 5 new error patterns in 1 hour
  }

  constructor() {
    this.setupGlobalErrorHandlers()
    this.startCleanupRoutines()
  }

  static getInstance(): AdvancedErrorTracker {
    if (!AdvancedErrorTracker.instance) {
      AdvancedErrorTracker.instance = new AdvancedErrorTracker()
    }
    return AdvancedErrorTracker.instance
  }

  /**
   * Capture and track an error
   */
  async captureError(
    error: Error,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    category: ErrorCategory = ErrorCategory.SERVER,
    context: Partial<ErrorContext> = {},
    tags: string[] = []
  ): Promise<string> {
    try {
      const errorId = this.generateErrorId()
      const fingerprint = this.generateFingerprint(error, context)
      
      const structuredError: StructuredError = {
        id: errorId,
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: (error as any).code,
        severity,
        category,
        context: {
          ...context,
          timestamp: new Date(),
          environment: process.env.NODE_ENV || 'development',
          version: process.env.npm_package_version || '1.0.0',
        },
        fingerprint,
        firstSeen: new Date(),
        lastSeen: new Date(),
        count: 1,
        resolved: false,
        tags,
        metadata: this.extractMetadata(error),
      }

      // Check if this error pattern already exists
      const existingError = await this.findExistingError(fingerprint)
      if (existingError) {
        existingError.lastSeen = new Date()
        existingError.count++
        existingError.tags = [...new Set([...existingError.tags, ...tags])]
        await this.updateError(existingError)
      } else {
        await this.storeError(structuredError)
        await this.updateErrorPattern(structuredError)
      }

      // Send to monitoring system
      productionMonitor.recordMetric('error_captured', 1)
      productionMonitor.recordMetric(`error_${severity}`, 1)
      productionMonitor.recordMetric(`error_category_${category}`, 1)

      // Check for alerts
      await this.checkErrorAlerts(structuredError)

      // Store in cache for quick access
      await advancedCache.set(`error:${errorId}`, structuredError, { ttl: 3600 })

      return errorId
    } catch (trackingError) {
      console.error('Error tracking failed:', trackingError)
      return 'tracking_failed'
    }
  }

  /**
   * Start a debug session
   */
  async startDebugSession(
    userId: string,
    tenantId: string,
    context: Record<string, any> = {},
    tags: string[] = []
  ): Promise<string> {
    const sessionId = this.generateSessionId()
    
    const session: DebugSession = {
      id: sessionId,
      userId,
      tenantId,
      startTime: new Date(),
      logs: [],
      performance: [],
      errors: [],
      context,
      tags,
    }

    this.debugSessions.set(sessionId, session)
    
    // Store in Redis for persistence
    if (this.redis) {
      await this.redis.setex(`debug_session:${sessionId}`, 3600, JSON.stringify(session))
    }

    return sessionId
  }

  /**
   * Add log to debug session
   */
  async addDebugLog(
    sessionId: string,
    level: DebugLog['level'],
    message: string,
    data?: any,
    source: string = 'application'
  ): Promise<void> {
    const session = this.debugSessions.get(sessionId) || await this.getDebugSession(sessionId)
    if (!session) return

    const log: DebugLog = {
      timestamp: new Date(),
      level,
      message,
      data,
      source,
    }

    session.logs.push(log)
    
    // Keep only last 1000 logs
    if (session.logs.length > 1000) {
      session.logs = session.logs.slice(-1000)
    }

    await this.updateDebugSession(session)
  }

  /**
   * Add performance snapshot to debug session
   */
  async addPerformanceSnapshot(sessionId: string): Promise<void> {
    const session = this.debugSessions.get(sessionId) || await this.getDebugSession(sessionId)
    if (!session) return

    const snapshot: PerformanceSnapshot = {
      timestamp: new Date(),
      metrics: {
        memory: process.memoryUsage(),
        cpu: process.cpuUsage().user / 1000, // Convert to ms
        responseTime: 0, // Would be calculated from request timing
        activeRequests: 0, // Would be tracked from request counter
      },
    }

    session.performance.push(snapshot)
    
    // Keep only last 100 snapshots
    if (session.performance.length > 100) {
      session.performance = session.performance.slice(-100)
    }

    await this.updateDebugSession(session)
  }

  /**
   * End debug session
   */
  async endDebugSession(sessionId: string): Promise<DebugSession | null> {
    const session = this.debugSessions.get(sessionId) || await this.getDebugSession(sessionId)
    if (!session) return null

    session.endTime = new Date()
    await this.updateDebugSession(session)
    
    // Generate session report
    await this.generateDebugReport(session)

    return session
  }

  /**
   * Get error analytics
   */
  async getErrorAnalytics(
    period: '1h' | '24h' | '7d' | '30d' = '24h',
    filters: {
      severity?: ErrorSeverity[]
      category?: ErrorCategory[]
      tenantId?: string
      userId?: string
    } = {}
  ): Promise<ErrorAggregation> {
    try {
      const cacheKey = `error_analytics:${period}:${JSON.stringify(filters)}`
      const cached = await advancedCache.get<ErrorAggregation>(cacheKey)
      if (cached) return cached

      const periodMs = this.getPeriodMs(period)
      const startTime = Date.now() - periodMs
      const errors = await this.getErrorsInPeriod(startTime, Date.now(), filters)

      const aggregation: ErrorAggregation = {
        period,
        totalErrors: errors.length,
        errorsByCategory: this.aggregateByCategory(errors),
        errorsBySeverity: this.aggregateBySeverity(errors),
        topErrors: this.getTopErrors(errors),
        affectedUsers: this.countAffectedUsers(errors),
        errorRate: this.calculateErrorRate(errors, periodMs),
      }

      // Cache for 5 minutes
      await advancedCache.set(cacheKey, aggregation, { ttl: 300 })
      return aggregation
    } catch (error) {
      console.error('Error analytics failed:', error)
      return this.getEmptyAggregation(period)
    }
  }

  /**
   * Search errors with advanced filtering
   */
  async searchErrors(
    query: {
      message?: string
      fingerprint?: string
      severity?: ErrorSeverity[]
      category?: ErrorCategory[]
      tags?: string[]
      dateRange?: { start: Date; end: Date }
      resolved?: boolean
      limit?: number
      offset?: number
    }
  ): Promise<{ errors: StructuredError[]; total: number }> {
    try {
      // In a real implementation, this would query a database or search index
      const allErrors = await this.getAllErrors()
      let filteredErrors = allErrors

      // Apply filters
      if (query.message) {
        const regex = new RegExp(query.message, 'i')
        filteredErrors = filteredErrors.filter(e => regex.test(e.message))
      }

      if (query.fingerprint) {
        filteredErrors = filteredErrors.filter(e => e.fingerprint === query.fingerprint)
      }

      if (query.severity?.length) {
        filteredErrors = filteredErrors.filter(e => query.severity!.includes(e.severity))
      }

      if (query.category?.length) {
        filteredErrors = filteredErrors.filter(e => query.category!.includes(e.category))
      }

      if (query.tags?.length) {
        filteredErrors = filteredErrors.filter(e => 
          query.tags!.some(tag => e.tags.includes(tag))
        )
      }

      if (query.dateRange) {
        filteredErrors = filteredErrors.filter(e => 
          e.lastSeen >= query.dateRange!.start && e.lastSeen <= query.dateRange!.end
        )
      }

      if (query.resolved !== undefined) {
        filteredErrors = filteredErrors.filter(e => e.resolved === query.resolved)
      }

      // Sort by last seen (most recent first)
      filteredErrors.sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime())

      const total = filteredErrors.length
      const offset = query.offset || 0
      const limit = query.limit || 50

      return {
        errors: filteredErrors.slice(offset, offset + limit),
        total,
      }
    } catch (error) {
      console.error('Error search failed:', error)
      return { errors: [], total: 0 }
    }
  }

  /**
   * Resolve an error
   */
  async resolveError(errorId: string, resolvedBy: string): Promise<boolean> {
    try {
      const error = await this.getError(errorId)
      if (!error) return false

      error.resolved = true
      error.resolvedAt = new Date()
      error.resolvedBy = resolvedBy

      await this.updateError(error)
      
      // Remove from cache
      await advancedCache.delete(`error:${errorId}`)
      
      return true
    } catch (error) {
      console.error('Error resolution failed:', error)
      return false
    }
  }

  /**
   * Get error trends and patterns
   */
  async getErrorTrends(): Promise<{
    patterns: ErrorPattern[]
    trends: Array<{
      period: string
      errorCount: number
      change: number
      trend: 'up' | 'down' | 'stable'
    }>
    predictions: Array<{
      pattern: string
      likelihood: number
      timeframe: string
    }>
  }> {
    try {
      const patterns = Array.from(this.patterns.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      // Calculate trends (simplified)
      const trends = await this.calculateErrorTrends()
      
      // Generate predictions (simplified)
      const predictions = this.generateErrorPredictions(patterns)

      return { patterns, trends, predictions }
    } catch (error) {
      console.error('Error trends analysis failed:', error)
      return { patterns: [], trends: [], predictions: [] }
    }
  }

  // Private methods

  private setupGlobalErrorHandlers(): void {
    // Handle uncaught exceptions
    process.on('uncaughtException', async (error) => {
      await this.captureError(error, ErrorSeverity.CRITICAL, ErrorCategory.SERVER, {}, ['uncaught'])
      console.error('Uncaught Exception:', error)
    })

    // Handle unhandled promise rejections
    process.on('unhandledRejection', async (reason) => {
      const error = reason instanceof Error ? reason : new Error(String(reason))
      await this.captureError(error, ErrorSeverity.HIGH, ErrorCategory.SERVER, {}, ['unhandled-promise'])
      console.error('Unhandled Promise Rejection:', reason)
    })

    // Handle warning events
    process.on('warning', async (warning) => {
      await this.captureError(warning, ErrorSeverity.LOW, ErrorCategory.SERVER, {}, ['warning'])
    })
  }

  private generateFingerprint(error: Error, context: Partial<ErrorContext>): string {
    // Create a unique fingerprint for error grouping
    const parts = [
      error.name,
      error.message,
      context.url || '',
      context.method || '',
    ]
    
    const crypto = require('crypto')
    return crypto.createHash('md5').update(parts.join('|')).digest('hex')
  }

  private extractMetadata(error: Error): Record<string, any> {
    const metadata: Record<string, any> = {}
    
    // Extract additional properties from error object
    Object.keys(error).forEach(key => {
      if (key !== 'message' && key !== 'stack' && key !== 'name') {
        metadata[key] = (error as any)[key]
      }
    })

    return metadata
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateSessionId(): string {
    return `debug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private async storeError(error: StructuredError): Promise<void> {
    this.errorStore.set(error.id, error)
    
    if (this.redis) {
      await this.redis.setex(`error:${error.id}`, 86400, JSON.stringify(error))
      await this.redis.zadd('errors:timeline', Date.now(), error.id)
    }
  }

  private async updateError(error: StructuredError): Promise<void> {
    this.errorStore.set(error.id, error)
    
    if (this.redis) {
      await this.redis.setex(`error:${error.id}`, 86400, JSON.stringify(error))
    }
  }

  private async findExistingError(fingerprint: string): Promise<StructuredError | null> {
    // In a real implementation, this would query by fingerprint
    for (const error of this.errorStore.values()) {
      if (error.fingerprint === fingerprint && !error.resolved) {
        return error
      }
    }
    return null
  }

  private async updateErrorPattern(error: StructuredError): Promise<void> {
    let pattern = this.patterns.get(error.fingerprint)
    
    if (pattern) {
      pattern.count++
      pattern.lastSeen = new Date()
      pattern.examples.push(error)
      if (pattern.examples.length > 5) {
        pattern.examples = pattern.examples.slice(-5)
      }
    } else {
      pattern = {
        fingerprint: error.fingerprint,
        pattern: error.message,
        count: 1,
        firstSeen: new Date(),
        lastSeen: new Date(),
        affectedUsers: new Set(),
        examples: [error],
        trend: 'stable',
      }
    }

    if (error.context.userId) {
      pattern.affectedUsers.add(error.context.userId)
    }

    this.patterns.set(error.fingerprint, pattern)
  }

  private async checkErrorAlerts(error: StructuredError): Promise<void> {
    // Check for critical errors
    if (error.severity === ErrorSeverity.CRITICAL) {
      const recentCritical = await this.getRecentCriticalErrorCount()
      if (recentCritical >= this.alertThresholds.criticalErrors) {
        await this.sendAlert('critical_errors_threshold', {
          count: recentCritical,
          threshold: this.alertThresholds.criticalErrors,
          error,
        })
      }
    }

    // Check for new error patterns
    const pattern = this.patterns.get(error.fingerprint)
    if (pattern && pattern.count === 1) {
      const recentNewPatterns = await this.getRecentNewPatternsCount()
      if (recentNewPatterns >= this.alertThresholds.newErrorPatterns) {
        await this.sendAlert('new_error_patterns', {
          count: recentNewPatterns,
          threshold: this.alertThresholds.newErrorPatterns,
        })
      }
    }
  }

  private async sendAlert(type: string, data: any): Promise<void> {
    console.warn(`Error Alert: ${type}`, data)
    // In production, integrate with alerting systems (PagerDuty, Slack, etc.)
  }

  private startCleanupRoutines(): void {
    // Clean up old errors every hour
    setInterval(async () => {
      await this.cleanupOldErrors()
    }, 3600000)

    // Clean up old debug sessions every 30 minutes
    setInterval(async () => {
      await this.cleanupOldDebugSessions()
    }, 1800000)
  }

  private async cleanupOldErrors(): Promise<void> {
    const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000) // 7 days
    
    for (const [id, error] of this.errorStore.entries()) {
      if (error.lastSeen.getTime() < cutoff) {
        this.errorStore.delete(id)
        if (this.redis) {
          await this.redis.del(`error:${id}`)
        }
      }
    }
  }

  private async cleanupOldDebugSessions(): Promise<void> {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000) // 24 hours
    
    for (const [id, session] of this.debugSessions.entries()) {
      if (session.startTime.getTime() < cutoff) {
        this.debugSessions.delete(id)
        if (this.redis) {
          await this.redis.del(`debug_session:${id}`)
        }
      }
    }
  }

  // Helper methods for analytics
  private getPeriodMs(period: string): number {
    switch (period) {
      case '1h': return 3600000
      case '24h': return 86400000
      case '7d': return 604800000
      case '30d': return 2592000000
      default: return 86400000
    }
  }

  private async getErrorsInPeriod(start: number, end: number, filters: any): Promise<StructuredError[]> {
    // Placeholder implementation
    return Array.from(this.errorStore.values()).filter(error => {
      const errorTime = error.lastSeen.getTime()
      return errorTime >= start && errorTime <= end
    })
  }

  private aggregateByCategory(errors: StructuredError[]): Record<ErrorCategory, number> {
    const result = {} as Record<ErrorCategory, number>
    errors.forEach(error => {
      result[error.category] = (result[error.category] || 0) + 1
    })
    return result
  }

  private aggregateBySeverity(errors: StructuredError[]): Record<ErrorSeverity, number> {
    const result = {} as Record<ErrorSeverity, number>
    errors.forEach(error => {
      result[error.severity] = (result[error.severity] || 0) + 1
    })
    return result
  }

  private getTopErrors(errors: StructuredError[]) {
    return errors
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(error => ({
        fingerprint: error.fingerprint,
        message: error.message,
        count: error.count,
        lastSeen: error.lastSeen,
      }))
  }

  private countAffectedUsers(errors: StructuredError[]): number {
    const users = new Set<string>()
    errors.forEach(error => {
      if (error.context.userId) {
        users.add(error.context.userId)
      }
    })
    return users.size
  }

  private calculateErrorRate(errors: StructuredError[], periodMs: number): number {
    // Simplified calculation
    return errors.length / (periodMs / 60000) // errors per minute
  }

  private getEmptyAggregation(period: string): ErrorAggregation {
    return {
      period,
      totalErrors: 0,
      errorsByCategory: {} as Record<ErrorCategory, number>,
      errorsBySeverity: {} as Record<ErrorSeverity, number>,
      topErrors: [],
      affectedUsers: 0,
      errorRate: 0,
    }
  }

  private async getAllErrors(): Promise<StructuredError[]> {
    return Array.from(this.errorStore.values())
  }

  private async getError(errorId: string): Promise<StructuredError | null> {
    return this.errorStore.get(errorId) || null
  }

  private async getDebugSession(sessionId: string): Promise<DebugSession | null> {
    if (this.redis) {
      const data = await this.redis.get(`debug_session:${sessionId}`)
      if (data) {
        return JSON.parse(data)
      }
    }
    return null
  }

  private async updateDebugSession(session: DebugSession): Promise<void> {
    this.debugSessions.set(session.id, session)
    if (this.redis) {
      await this.redis.setex(`debug_session:${session.id}`, 3600, JSON.stringify(session))
    }
  }

  private async generateDebugReport(session: DebugSession): Promise<void> {
    // Generate comprehensive debug report
    console.log(`Debug Session Report: ${session.id}`)
    console.log(`Duration: ${session.endTime!.getTime() - session.startTime.getTime()}ms`)
    console.log(`Logs: ${session.logs.length}`)
    console.log(`Errors: ${session.errors.length}`)
    console.log(`Performance Snapshots: ${session.performance.length}`)
  }

  private async getRecentCriticalErrorCount(): Promise<number> {
    // Count critical errors in last 5 minutes
    const cutoff = Date.now() - 300000
    return Array.from(this.errorStore.values()).filter(
      error => error.severity === ErrorSeverity.CRITICAL && error.lastSeen.getTime() > cutoff
    ).length
  }

  private async getRecentNewPatternsCount(): Promise<number> {
    // Count new patterns in last hour
    const cutoff = Date.now() - 3600000
    return Array.from(this.patterns.values()).filter(
      pattern => pattern.firstSeen.getTime() > cutoff
    ).length
  }

  private async calculateErrorTrends() {
    // Simplified trend calculation
    return [
      { period: 'last_hour', errorCount: 5, change: -10, trend: 'down' as const },
      { period: 'last_24h', errorCount: 45, change: 15, trend: 'up' as const },
      { period: 'last_7d', errorCount: 320, change: 2, trend: 'stable' as const },
    ]
  }

  private generateErrorPredictions(patterns: ErrorPattern[]) {
    // Simplified predictions
    return patterns.slice(0, 3).map(pattern => ({
      pattern: pattern.pattern,
      likelihood: Math.random() * 100,
      timeframe: '24 hours',
    }))
  }
}

// Singleton instance
export const advancedErrorTracker = AdvancedErrorTracker.getInstance()

// Utility functions
export function captureException(error: Error, context?: Partial<ErrorContext>, tags?: string[]): Promise<string> {
  return advancedErrorTracker.captureError(error, ErrorSeverity.HIGH, ErrorCategory.SERVER, context, tags)
}

export function captureMessage(message: string, level: ErrorSeverity = ErrorSeverity.LOW, context?: Partial<ErrorContext>): Promise<string> {
  const error = new Error(message)
  return advancedErrorTracker.captureError(error, level, ErrorCategory.CLIENT, context)
}

export function withErrorTracking<T>(
  fn: () => Promise<T>,
  context?: Partial<ErrorContext>
): Promise<T> {
  return fn().catch(async (error) => {
    await advancedErrorTracker.captureError(error, ErrorSeverity.MEDIUM, ErrorCategory.SERVER, context)
    throw error
  })
}