/**
 * CoreFlow360 Activity Interceptors
 *
 * Interceptors for monitoring and enhancing activity execution in Temporal workflows
 */

import {
  ActivityInboundCallsInterceptor,
  ActivityExecuteInput,
  Context,
  ActivityInfo,
} from '@temporalio/activity'

/**
 * Activity execution monitoring interceptor
 */
export class VoiceActivityInboundInterceptor implements ActivityInboundCallsInterceptor {
  async execute(input: ActivityExecuteInput, next: unknown): Promise<unknown> {
    const { activityType } = input.info
    const startTime = Date.now()
    const activityId = input.info.activityId

    console.log(`🎯 Executing activity: ${activityType}`, {
      activityId,
      workflowId: input.info.workflowExecution.workflowId,
      attempt: input.info.attempt,
      heartbeatTimeout: input.info.heartbeatTimeout,
      scheduleToCloseTimeout: input.info.scheduleToCloseTimeout,
    })

    // Set up heartbeat for long-running activities
    const heartbeatInterval = this.getHeartbeatInterval(activityType)
    let heartbeatTimer: NodeJS.Timeout | undefined

    if (heartbeatInterval > 0) {
      heartbeatTimer = setInterval(() => {
        try {
          Context.current().heartbeat(`Activity ${activityType} in progress`)
        } catch (error) {
          
        }
      }, heartbeatInterval)
    }

    try {
      // Record activity start
      await this.recordActivityStart(activityType, input.info, input.args)

      const result = await next(input)

      const duration = Date.now() - startTime
      console.log(`✅ Activity completed: ${activityType}`, {
        activityId,
        duration: `${duration}ms`,
        attempt: input.info.attempt,
      })

      // Record successful completion
      await this.recordActivityCompletion(activityType, input.info, duration, 'success')

      return result
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`❌ Activity failed: ${activityType}`, {
        activityId,
        duration: `${duration}ms`,
        attempt: input.info.attempt,
        error: error.message,
        errorType: error.name,
      })

      // Classify error for retry logic
      const errorClassification = this.classifyError(error)
      console.log(`🔍 Error classification: ${errorClassification}`, {
        activityType,
        activityId,
        shouldRetry: this.shouldRetryActivity(errorClassification, input.info.attempt),
      })

      // Record failure
      await this.recordActivityCompletion(activityType, input.info, duration, 'failed', error)

      throw error
    } finally {
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer)
      }
    }
  }

  private getHeartbeatInterval(activityType: string): number {
    // Return heartbeat interval in milliseconds based on activity type
    const intervals: Record<string, number> = {
      processCallTranscript: 10000, // 10 seconds
      analyzeCallSentiment: 15000, // 15 seconds
      generateCallSummary: 5000, // 5 seconds
      performQualityCheck: 20000, // 20 seconds
      storeAnalytics: 0, // No heartbeat needed
      sendNotification: 0, // No heartbeat needed
    }

    return intervals[activityType] || 30000 // Default 30 seconds
  }

  private classifyError(
    error: unknown
  ): 'transient' | 'permanent' | 'timeout' | 'authentication' | 'validation' {
    const errorMessage = error.message?.toLowerCase() || ''
    const errorName = error.name?.toLowerCase() || ''

    // Timeout errors
    if (errorMessage.includes('timeout') || errorName.includes('timeout')) {
      return 'timeout'
    }

    // Authentication errors
    if (
      errorMessage.includes('auth') ||
      errorMessage.includes('unauthorized') ||
      errorMessage.includes('forbidden') ||
      error.status === 401 ||
      error.status === 403
    ) {
      return 'authentication'
    }

    // Validation errors
    if (
      errorMessage.includes('validation') ||
      errorMessage.includes('invalid') ||
      errorName.includes('validation') ||
      error.status === 400
    ) {
      return 'validation'
    }

    // Network/transient errors
    if (
      errorMessage.includes('network') ||
      errorMessage.includes('connection') ||
      errorMessage.includes('enotfound') ||
      errorMessage.includes('econnreset') ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ECONNRESET' ||
      error.status >= 500
    ) {
      return 'transient'
    }

    // Default to permanent
    return 'permanent'
  }

  private shouldRetryActivity(errorClassification: string, attempt: number): boolean {
    const maxAttempts = {
      transient: 5,
      timeout: 3,
      authentication: 1,
      validation: 1,
      permanent: 1,
    }

    return attempt < (maxAttempts[errorClassification] || 1)
  }

  private async recordActivityStart(
    activityType: string,
    activityInfo: ActivityInfo,
    args: unknown[]
  ): Promise<void> {
    const record = {
      activity_type: activityType,
      activity_id: activityInfo.activityId,
      workflow_id: activityInfo.workflowExecution.workflowId,
      workflow_run_id: activityInfo.workflowExecution.runId,
      attempt: activityInfo.attempt,
      started_at: new Date().toISOString(),
      args_count: args?.length || 0,
      scheduled_to_start_timeout: activityInfo.scheduleToStartTimeout,
      start_to_close_timeout: activityInfo.startToCloseTimeout,
      heartbeat_timeout: activityInfo.heartbeatTimeout,
    }

    // In production, store in database or send to monitoring system
    
  }

  private async recordActivityCompletion(
    activityType: string,
    activityInfo: ActivityInfo,
    duration: number,
    status: 'success' | 'failed',
    error?: unknown
  ): Promise<void> {
    const record = {
      activity_type: activityType,
      activity_id: activityInfo.activityId,
      workflow_id: activityInfo.workflowExecution.workflowId,
      workflow_run_id: activityInfo.workflowExecution.runId,
      attempt: activityInfo.attempt,
      status,
      duration_ms: duration,
      completed_at: new Date().toISOString(),
      error_type: error?.name,
      error_message: error?.message,
      error_classification: error ? this.classifyError(error) : undefined,
    }

    // Performance analysis
    const performanceThresholds = {
      processCallTranscript: 30000, // 30 seconds
      analyzeCallSentiment: 45000, // 45 seconds
      generateCallSummary: 15000, // 15 seconds
      performQualityCheck: 60000, // 1 minute
      storeAnalytics: 5000, // 5 seconds
      sendNotification: 10000, // 10 seconds
    }

    const threshold = performanceThresholds[activityType] || 30000
    if (duration > threshold) {
      console.warn('⚠️ Activity Performance Warning:', {
        ...record,
        threshold_ms: threshold,
        performance_ratio: (duration / threshold).toFixed(2),
      })
    }

    

    // In production, would send metrics to monitoring system
    await this.sendMetricsToMonitoring(record)
  }

  private async sendMetricsToMonitoring(record: unknown): Promise<void> {
    // Mock implementation - would integrate with actual monitoring
    try {
      // Example integrations:
      // - Prometheus metrics
      // - DataDog custom metrics
      // - CloudWatch metrics
      // - Grafana dashboards

      const metrics = {
        timestamp: Date.now(),
        service: 'voice-processing',
        activity_type: record.activity_type,
        duration: record.duration_ms,
        status: record.status,
        attempt: record.attempt,
        workflow_id: record.workflow_id,
      }

      // Mock sending to metrics backend
      
    } catch (error) {
      
      // Don't throw - monitoring failures shouldn't fail activities
    }
  }
}

/**
 * Resource usage monitoring interceptor
 */
export class ResourceMonitoringInterceptor implements ActivityInboundCallsInterceptor {
  async execute(input: ActivityExecuteInput, next: unknown): Promise<unknown> {
    const { activityType } = input.info

    // Monitor resource usage before activity
    const initialMemory = process.memoryUsage()
    const startCpuUsage = process.cpuUsage()

    try {
      const result = await next(input)

      // Monitor resource usage after activity
      const finalMemory = process.memoryUsage()
      const endCpuUsage = process.cpuUsage(startCpuUsage)

      const resourceUsage = {
        activity_type: activityType,
        memory_delta: {
          rss: finalMemory.rss - initialMemory.rss,
          heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
          heapTotal: finalMemory.heapTotal - initialMemory.heapTotal,
          external: finalMemory.external - initialMemory.external,
        },
        cpu_usage: {
          user: endCpuUsage.user,
          system: endCpuUsage.system,
        },
      }

      // Log significant resource usage
      const heapDeltaMB = resourceUsage.memory_delta.heapUsed / (1024 * 1024)
      if (Math.abs(heapDeltaMB) > 10) {
        // More than 10MB change
        console.log('📊 Resource Usage Alert:', {
          ...resourceUsage,
          heap_delta_mb: heapDeltaMB.toFixed(2),
        })
      }

      return result
    } catch (error) {
      // Log resource usage even on failure
      const finalMemory = process.memoryUsage()
      const endCpuUsage = process.cpuUsage(startCpuUsage)

      console.error('❌ Activity interceptor error:', {
        activity_type: activityType,
        memory_delta_mb: (finalMemory.heapUsed - initialMemory.heapUsed) / (1024 * 1024),
        cpu_user_ms: endCpuUsage.user / 1000,
        cpu_system_ms: endCpuUsage.system / 1000,
      })

      throw error
    }
  }
}

/**
 * Data sanitization interceptor
 */
export class DataSanitizationInterceptor implements ActivityInboundCallsInterceptor {
  private sensitiveFields = ['password', 'token', 'key', 'secret', 'credential']

  async execute(input: ActivityExecuteInput, next: unknown): Promise<unknown> {
    const { activityType } = input.info

    // Sanitize input args for logging
    const sanitizedArgs = this.sanitizeData(input.args)

    console.log(`🔒 Activity input sanitized: ${activityType}`, {
      activityId: input.info.activityId,
      argsCount: input.args?.length || 0,
      sanitizedArgsPreview: JSON.stringify(sanitizedArgs).substring(0, 200) + '...',
    })

    try {
      const result = await next(input)

      // Sanitize result for logging if needed
      const sanitizedResult = this.sanitizeData(result)
      console.log(`🔒 Activity result sanitized: ${activityType}`, {
        resultType: typeof result,
        sanitizedResultPreview: JSON.stringify(sanitizedResult).substring(0, 100) + '...',
      })

      return result
    } catch (error) {
      // Sanitize error for logging
      const sanitizedError = {
        name: error.name,
        message: this.sanitizeString(error.message),
        stack: this.sanitizeString(error.stack),
      }

      
      throw error
    }
  }

  private sanitizeData(data: unknown): unknown {
    if (!data) return data

    if (typeof data === 'string') {
      return this.sanitizeString(data)
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeData(item))
    }

    if (typeof data === 'object') {
      const sanitized: unknown = {}
      for (const [key, value] of Object.entries(data)) {
        if (this.isSensitiveField(key)) {
          sanitized[key] = '[REDACTED]'
        } else {
          sanitized[key] = this.sanitizeData(value)
        }
      }
      return sanitized
    }

    return data
  }

  private sanitizeString(str: string): string {
    if (!str) return str

    // Remove common sensitive patterns
    return str
      .replace(/\b[A-Za-z0-9]{20,}\b/g, '[TOKEN_REDACTED]') // Long alphanumeric tokens
      .replace(/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, '[CARD_REDACTED]') // Credit cards
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REDACTED]') // Emails
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN_REDACTED]') // SSNs
  }

  private isSensitiveField(fieldName: string): boolean {
    const lowerField = fieldName.toLowerCase()
    return this.sensitiveFields.some((sensitive) => lowerField.includes(sensitive))
  }
}

/**
 * Combined activity interceptors export
 */
export const activityInterceptors = [
  new DataSanitizationInterceptor(),
  new ResourceMonitoringInterceptor(),
  new VoiceActivityInboundInterceptor(),
]

export default activityInterceptors
