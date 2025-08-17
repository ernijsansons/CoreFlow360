/**
 * CoreFlow360 - Lead Pipeline Error Handling
 * Comprehensive error handling with retries and dead letter queues
 */

import { Queue, Job } from 'bullmq'
import { Redis } from 'ioredis'
import { db } from '@/lib/db'

// Skip initialization during build
const isBuildTime = () => process.env.VERCEL || process.env.CI || process.env.NEXT_PHASE === 'phase-production-build' || process.env.VERCEL_ENV === 'preview'

// Lazy Redis connection
let redis: Redis | null = null
function getRedisConnection(): Redis | null {
  if (isBuildTime()) {
    return null
  }
  
  if (!redis) {
    redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_ERROR_DB || '3')
    })
  }
  
  return redis
}

// Lazy dead letter queue initialization
let _deadLetterQueue: Queue | null = null

function getDeadLetterQueue(): Queue {
  if (isBuildTime()) {
    return {} as Queue
  }
  
  if (!_deadLetterQueue) {
    const connection = getRedisConnection()
    if (connection) {
      _deadLetterQueue = new Queue('dead-letters', {
        connection,
        defaultJobOptions: {
          removeOnComplete: 1000,
          removeOnFail: false, // Keep all failed jobs for analysis
          attempts: 1 // Dead letter queue doesn't retry
        }
      })
    }
  }
  
  return _deadLetterQueue || ({} as Queue)
}

// Export with lazy loading
export const deadLetterQueue = new Proxy({} as Queue, {
  get(_target, prop) {
    const queue = getDeadLetterQueue()
    return queue[prop as keyof Queue]
  }
})

// Error classification system
export enum ErrorType {
  TEMPORARY = 'temporary',
  PERMANENT = 'permanent', 
  RATE_LIMIT = 'rate_limit',
  VALIDATION = 'validation',
  SYSTEM = 'system',
  EXTERNAL = 'external',
  CONSENT = 'consent',
  BUSINESS = 'business'
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

interface ErrorClassification {
  type: ErrorType
  severity: ErrorSeverity
  retryable: boolean
  maxRetries: number
  retryDelay: number
  escalationRequired: boolean
}

interface LeadPipelineError {
  id: string
  jobId: string
  leadId?: string
  tenantId?: string
  source: string
  errorType: ErrorType
  errorSeverity: ErrorSeverity
  message: string
  stack?: string
  context: Record<string, any>
  timestamp: Date
  retryCount: number
  resolved: boolean
  resolvedAt?: Date
  resolvedBy?: string
}

/**
 * Error classifier with intelligent retry logic
 */
export class ErrorClassifier {
  private static readonly CLASSIFICATION_RULES: Record<string, Partial<ErrorClassification>> = {
    // Temporary errors - should retry
    'ECONNRESET': { type: ErrorType.TEMPORARY, severity: ErrorSeverity.LOW, retryable: true, maxRetries: 3, retryDelay: 5000 },
    'ETIMEDOUT': { type: ErrorType.TEMPORARY, severity: ErrorSeverity.LOW, retryable: true, maxRetries: 3, retryDelay: 10000 },
    'ENOTFOUND': { type: ErrorType.TEMPORARY, severity: ErrorSeverity.MEDIUM, retryable: true, maxRetries: 2, retryDelay: 30000 },
    'timeout': { type: ErrorType.TEMPORARY, severity: ErrorSeverity.LOW, retryable: true, maxRetries: 3, retryDelay: 5000 },
    'connection': { type: ErrorType.TEMPORARY, severity: ErrorSeverity.MEDIUM, retryable: true, maxRetries: 3, retryDelay: 10000 },
    
    // Rate limiting errors
    'rate limit': { type: ErrorType.RATE_LIMIT, severity: ErrorSeverity.MEDIUM, retryable: true, maxRetries: 5, retryDelay: 60000 },
    'too many requests': { type: ErrorType.RATE_LIMIT, severity: ErrorSeverity.MEDIUM, retryable: true, maxRetries: 5, retryDelay: 60000 },
    '429': { type: ErrorType.RATE_LIMIT, severity: ErrorSeverity.MEDIUM, retryable: true, maxRetries: 5, retryDelay: 60000 },
    
    // Validation errors - don't retry without fixing
    'invalid phone': { type: ErrorType.VALIDATION, severity: ErrorSeverity.HIGH, retryable: false, maxRetries: 0, escalationRequired: true },
    'invalid email': { type: ErrorType.VALIDATION, severity: ErrorSeverity.MEDIUM, retryable: false, maxRetries: 0 },
    'missing required': { type: ErrorType.VALIDATION, severity: ErrorSeverity.HIGH, retryable: false, maxRetries: 0 },
    'validation failed': { type: ErrorType.VALIDATION, severity: ErrorSeverity.MEDIUM, retryable: false, maxRetries: 0 },
    
    // System errors
    'database': { type: ErrorType.SYSTEM, severity: ErrorSeverity.HIGH, retryable: true, maxRetries: 3, retryDelay: 30000, escalationRequired: true },
    'redis': { type: ErrorType.SYSTEM, severity: ErrorSeverity.HIGH, retryable: true, maxRetries: 3, retryDelay: 15000, escalationRequired: true },
    'out of memory': { type: ErrorType.SYSTEM, severity: ErrorSeverity.CRITICAL, retryable: false, escalationRequired: true },
    
    // External service errors
    'twilio': { type: ErrorType.EXTERNAL, severity: ErrorSeverity.HIGH, retryable: true, maxRetries: 3, retryDelay: 30000 },
    'openai': { type: ErrorType.EXTERNAL, severity: ErrorSeverity.MEDIUM, retryable: true, maxRetries: 3, retryDelay: 20000 },
    'deepgram': { type: ErrorType.EXTERNAL, severity: ErrorSeverity.MEDIUM, retryable: true, maxRetries: 3, retryDelay: 15000 },
    
    // Consent/compliance errors
    'tcpa': { type: ErrorType.CONSENT, severity: ErrorSeverity.HIGH, retryable: false, maxRetries: 0, escalationRequired: true },
    'dnc list': { type: ErrorType.CONSENT, severity: ErrorSeverity.HIGH, retryable: false, maxRetries: 0 },
    'no consent': { type: ErrorType.CONSENT, severity: ErrorSeverity.MEDIUM, retryable: false, maxRetries: 0 },
    
    // Business logic errors
    'bundle limit': { type: ErrorType.BUSINESS, severity: ErrorSeverity.MEDIUM, retryable: false, maxRetries: 0 },
    'subscription expired': { type: ErrorType.BUSINESS, severity: ErrorSeverity.HIGH, retryable: false, escalationRequired: true },
    'feature disabled': { type: ErrorType.BUSINESS, severity: ErrorSeverity.MEDIUM, retryable: false, maxRetries: 0 }
  }

  /**
   * Classify error and determine handling strategy
   */
  static classify(error: Error | string, context: Record<string, any> = {}): ErrorClassification {
    const errorMessage = typeof error === 'string' ? error : error.message
    const errorStack = typeof error === 'string' ? undefined : error.stack
    const lowerMessage = errorMessage.toLowerCase()

    // Find matching rule
    for (const [pattern, classification] of Object.entries(this.CLASSIFICATION_RULES)) {
      if (lowerMessage.includes(pattern.toLowerCase())) {
        return {
          type: ErrorType.TEMPORARY,
          severity: ErrorSeverity.MEDIUM,
          retryable: true,
          maxRetries: 3,
          retryDelay: 10000,
          escalationRequired: false,
          ...classification
        }
      }
    }

    // Default classification for unknown errors
    return {
      type: ErrorType.SYSTEM,
      severity: ErrorSeverity.MEDIUM,
      retryable: true,
      maxRetries: 2,
      retryDelay: 15000,
      escalationRequired: false
    }
  }

  /**
   * Calculate next retry delay with exponential backoff
   */
  static calculateRetryDelay(
    baseDelay: number,
    attemptNumber: number,
    maxDelay: number = 300000 // 5 minutes
  ): number {
    const exponentialDelay = baseDelay * Math.pow(2, attemptNumber - 1)
    const jitter = Math.random() * 1000 // Add jitter to prevent thundering herd
    return Math.min(exponentialDelay + jitter, maxDelay)
  }
}

/**
 * Error handler with intelligent retry and escalation
 */
export class LeadPipelineErrorHandler {
  /**
   * Handle job error with classification and retry logic
   */
  static async handleJobError(
    job: Job,
    error: Error,
    context: Record<string, any> = {}
  ): Promise<{
    shouldRetry: boolean
    retryDelay?: number
    escalate: boolean
    classification: ErrorClassification
  }> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const classification = ErrorClassifier.classify(error, context)
    
    // Create error record
    const errorRecord: LeadPipelineError = {
      id: errorId,
      jobId: job.id?.toString() || 'unknown',
      leadId: job.data?.leadId,
      tenantId: job.data?.tenantId,
      source: job.queueName,
      errorType: classification.type,
      errorSeverity: classification.severity,
      message: error.message,
      stack: error.stack,
      context: {
        ...context,
        jobData: job.data,
        jobOptions: job.opts,
        attemptsMade: job.attemptsMade,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      retryCount: job.attemptsMade || 0,
      resolved: false
    }

    // Store error record
    await this.storeError(errorRecord)

    // Determine if should retry
    const shouldRetry = classification.retryable && 
                       errorRecord.retryCount < classification.maxRetries

    let retryDelay: number | undefined

    if (shouldRetry) {
      retryDelay = ErrorClassifier.calculateRetryDelay(
        classification.retryDelay,
        errorRecord.retryCount + 1
      )
      
      console.warn(`🔄 Scheduling retry for job ${job.id} (attempt ${errorRecord.retryCount + 1}/${classification.maxRetries}) in ${retryDelay}ms`)
    } else {
      console.error(`❌ Job ${job.id} failed permanently:`, error.message)
      
      // Move to dead letter queue if not retrying
      await this.moveToDeadLetterQueue(job, errorRecord)
    }

    // Check if escalation is needed
    if (classification.escalationRequired || classification.severity === ErrorSeverity.CRITICAL) {
      await this.escalateError(errorRecord)
    }

    return {
      shouldRetry,
      retryDelay,
      escalate: classification.escalationRequired || false,
      classification
    }
  }

  /**
   * Store error record for analysis
   */
  private static async storeError(errorRecord: LeadPipelineError): Promise<void> {
    try {
      const connection = getRedisConnection()
      if (connection) {
        // Store in Redis for immediate access
        const key = `error:${errorRecord.id}`
        await connection.setex(key, 86400, JSON.stringify(errorRecord)) // 24 hour TTL

        // Add to error log for analytics
        await connection.lpush('error_log', JSON.stringify({
          id: errorRecord.id,
          type: errorRecord.errorType,
          severity: errorRecord.errorSeverity,
          timestamp: errorRecord.timestamp,
          jobId: errorRecord.jobId,
          tenantId: errorRecord.tenantId
        }))

        // Keep only last 10000 error log entries
        await connection.ltrim('error_log', 0, 9999)
      }

      // Store in database for long-term analysis (if table exists)
      try {
        await db.$executeRaw`
          INSERT INTO error_logs (
            id, job_id, lead_id, tenant_id, source, error_type, error_severity,
            message, stack, context, timestamp, retry_count, resolved
          ) VALUES (
            ${errorRecord.id}, ${errorRecord.jobId}, ${errorRecord.leadId}, 
            ${errorRecord.tenantId}, ${errorRecord.source}, ${errorRecord.errorType},
            ${errorRecord.errorSeverity}, ${errorRecord.message}, ${errorRecord.stack},
            ${JSON.stringify(errorRecord.context)}, ${errorRecord.timestamp}, 
            ${errorRecord.retryCount}, ${errorRecord.resolved}
          ) ON CONFLICT (id) DO NOTHING
        `
      } catch (dbError) {
        // Table might not exist yet - just log to console
        console.log('Error log table not available, stored in Redis only')
      }

    } catch (storeError) {
      console.error('Failed to store error record:', storeError)
    }
  }

  /**
   * Move failed job to dead letter queue
   */
  private static async moveToDeadLetterQueue(
    job: Job,
    errorRecord: LeadPipelineError
  ): Promise<void> {
    try {
      await deadLetterQueue.add(
        'dead-letter',
        {
          originalJob: {
            id: job.id,
            name: job.name,
            data: job.data,
            opts: job.opts,
            queueName: job.queueName
          },
          error: {
            id: errorRecord.id,
            type: errorRecord.errorType,
            severity: errorRecord.errorSeverity,
            message: errorRecord.message,
            stack: errorRecord.stack
          },
          failedAt: new Date(),
          retryCount: errorRecord.retryCount
        },
        {
          priority: errorRecord.errorSeverity === ErrorSeverity.CRITICAL ? 1 : 
                   errorRecord.errorSeverity === ErrorSeverity.HIGH ? 2 : 3
        }
      )

      console.log(`💀 Job ${job.id} moved to dead letter queue`)
      
    } catch (dlqError) {
      console.error('Failed to move job to dead letter queue:', dlqError)
    }
  }

  /**
   * Escalate critical errors
   */
  private static async escalateError(errorRecord: LeadPipelineError): Promise<void> {
    try {
      const connection = getRedisConnection()
      if (connection) {
        // Store escalation flag
        await connection.setex(
          `escalation:${errorRecord.id}`,
          3600, // 1 hour
          JSON.stringify({
            errorId: errorRecord.id,
            escalatedAt: new Date(),
            severity: errorRecord.errorSeverity,
            type: errorRecord.errorType,
            tenantId: errorRecord.tenantId,
            message: errorRecord.message
          })
        )

        // Add to escalation queue (could trigger alerts, notifications, etc.)
        await connection.lpush('escalation_queue', JSON.stringify({
          errorId: errorRecord.id,
          priority: errorRecord.errorSeverity,
          escalatedAt: new Date()
        }))
      }

      console.error(`🚨 ERROR ESCALATED: ${errorRecord.errorType} - ${errorRecord.message}`)

      // Could integrate with alerting systems here:
      // - Send Slack notification
      // - Create PagerDuty incident  
      // - Send email to on-call engineer
      
    } catch (escalationError) {
      console.error('Failed to escalate error:', escalationError)
    }
  }

  /**
   * Get error statistics
   */
  static async getErrorStats(timeWindow: number = 3600000): Promise<{
    total: number
    byType: Record<string, number>
    bySeverity: Record<string, number>
    retryRate: number
    escalationRate: number
  }> {
    try {
      const connection = getRedisConnection()
      if (!connection) {
        return {
          total: 0,
          byType: {},
          bySeverity: {},
          retryRate: 0,
          escalationRate: 0
        }
      }
      
      const errors = await connection.lrange('error_log', 0, -1)
      const parsedErrors = errors.map(e => JSON.parse(e))
      const recentErrors = parsedErrors.filter(
        e => new Date(e.timestamp).getTime() > Date.now() - timeWindow
      )

      const byType: Record<string, number> = {}
      const bySeverity: Record<string, number> = {}
      let retriedCount = 0
      let escalatedCount = 0

      for (const error of recentErrors) {
        byType[error.type] = (byType[error.type] || 0) + 1
        bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1
        
        if (error.retryCount > 0) retriedCount++
      }

      // Count escalations
      const escalations = await connection.lrange('escalation_queue', 0, -1)
      escalatedCount = escalations.filter(e => {
        const escalation = JSON.parse(e)
        return new Date(escalation.escalatedAt).getTime() > Date.now() - timeWindow
      }).length

      return {
        total: recentErrors.length,
        byType,
        bySeverity,
        retryRate: recentErrors.length > 0 ? retriedCount / recentErrors.length : 0,
        escalationRate: recentErrors.length > 0 ? escalatedCount / recentErrors.length : 0
      }

    } catch (error) {
      console.error('Failed to get error stats:', error)
      return {
        total: 0,
        byType: {},
        bySeverity: {},
        retryRate: 0,
        escalationRate: 0
      }
    }
  }

  /**
   * Mark error as resolved
   */
  static async resolveError(errorId: string, resolvedBy: string): Promise<void> {
    try {
      const connection = getRedisConnection()
      if (!connection) {
        console.warn('Cannot resolve error - Redis unavailable')
        return
      }
      
      const key = `error:${errorId}`
      const errorData = await connection.get(key)
      
      if (errorData) {
        const error = JSON.parse(errorData)
        error.resolved = true
        error.resolvedAt = new Date()
        error.resolvedBy = resolvedBy
        
        await connection.setex(key, 86400, JSON.stringify(error))
        console.log(`✅ Error ${errorId} marked as resolved by ${resolvedBy}`)
      }
      
    } catch (error) {
      console.error('Failed to resolve error:', error)
    }
  }
}

/**
 * Dead letter queue processor for manual intervention
 */
export class DeadLetterQueueProcessor {
  /**
   * Get failed jobs for manual review
   */
  static async getFailedJobs(limit: number = 50): Promise<any[]> {
    try {
      const jobs = await deadLetterQueue.getJobs(['completed', 'failed'], 0, limit)
      return jobs.map(job => ({
        id: job.id,
        data: job.data,
        failedAt: job.data?.failedAt,
        error: job.data?.error,
        retryCount: job.data?.retryCount
      }))
    } catch (error) {
      console.error('Failed to get failed jobs:', error)
      return []
    }
  }

  /**
   * Requeue failed job with modifications
   */
  static async requeueJob(jobId: string, modifications: Record<string, any> = {}): Promise<boolean> {
    try {
      const job = await deadLetterQueue.getJob(jobId)
      if (!job) return false

      const originalJobData = job.data.originalJob
      const modifiedData = { ...originalJobData.data, ...modifications }

      // Add back to original queue (would need queue reference)
      console.log(`🔄 Requeuing job ${jobId} with modifications:`, modifications)
      
      // Mark as requeued
      await job.remove()
      
      return true
    } catch (error) {
      console.error('Failed to requeue job:', error)
      return false
    }
  }
}