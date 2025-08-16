/**
 * CoreFlow360 - Sentry Error Tracking
 * Comprehensive error monitoring and performance tracking
 */

import * as Sentry from '@sentry/nextjs'
import { User } from '@prisma/client'

// Sentry configuration
const sentryConfig = {
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
  profilesSampleRate: parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE || '0.1'),
  beforeSend: (event: Sentry.Event, hint: Sentry.EventHint) => {
    // Filter out noisy errors in development
    if (process.env.NODE_ENV === 'development') {
      const error = hint.originalException as Error
      if (
        error?.message?.includes('ResizeObserver loop limit exceeded') ||
        error?.message?.includes('Non-Error promise rejection captured') ||
        error?.message?.includes('Script error')
      ) {
        return null
      }
    }
    
    // Sanitize sensitive data
    if (event.request?.data) {
      const sanitized = sanitizeData(event.request.data)
      event.request.data = sanitized
    }
    
    return event
  },
  beforeSendTransaction: (event: Sentry.TransactionEvent) => {
    // Sample health checks less aggressively
    if (event.transaction?.includes('/api/health')) {
      return Math.random() < 0.01 ? event : null // 1% sampling
    }
    
    return event
  }
}

/**
 * Initialize Sentry
 */
export function initSentry() {
  if (!process.env.SENTRY_DSN) {
    console.warn('⚠️ Sentry DSN not configured, error tracking disabled')
    return
  }
  
  Sentry.init(sentryConfig)
  console.log('✅ Sentry initialized')
}

/**
 * Sanitize sensitive data from error reports
 */
function sanitizeData(data: any): any {
  if (!data || typeof data !== 'object') {
    return data
  }
  
  const sensitiveFields = [
    'password', 'token', 'secret', 'key', 'auth',
    'authorization', 'cookie', 'session', 'csrf',
    'credit_card', 'ssn', 'social_security'
  ]
  
  const sanitized = { ...data }
  
  for (const key in sanitized) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = '[Redacted]'
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeData(sanitized[key])
    }
  }
  
  return sanitized
}

/**
 * Error tracking utilities
 */
export const errorTracker = {
  /**
   * Capture exception with context
   */
  captureException(
    error: Error | string,
    context?: {
      user?: Partial<User>
      tenant?: string
      level?: Sentry.SeverityLevel
      tags?: Record<string, string>
      extra?: Record<string, any>
    }
  ) {
    Sentry.withScope((scope) => {
      if (context?.user) {
        scope.setUser({
          id: context.user.id,
          email: context.user.email,
          username: context.user.name
        })
      }
      
      if (context?.tenant) {
        scope.setTag('tenant', context.tenant)
      }
      
      if (context?.level) {
        scope.setLevel(context.level)
      }
      
      if (context?.tags) {
        Object.entries(context.tags).forEach(([key, value]) => {
          scope.setTag(key, value)
        })
      }
      
      if (context?.extra) {
        Object.entries(context.extra).forEach(([key, value]) => {
          scope.setExtra(key, value)
        })
      }
      
      scope.setContext('runtime', {
        name: 'node',
        version: process.version
      })
      
      if (typeof error === 'string') {
        Sentry.captureMessage(error, context?.level || 'error')
      } else {
        Sentry.captureException(error)
      }
    })
  },
  
  /**
   * Capture API error
   */
  captureAPIError(
    error: Error,
    context: {
      endpoint: string
      method: string
      userId?: string
      tenantId?: string
      statusCode?: number
      requestBody?: any
      queryParams?: any
    }
  ) {
    this.captureException(error, {
      level: 'error',
      tags: {
        component: 'api',
        endpoint: context.endpoint,
        method: context.method,
        status_code: context.statusCode?.toString() || 'unknown'
      },
      extra: {
        endpoint: context.endpoint,
        method: context.method,
        statusCode: context.statusCode,
        requestBody: sanitizeData(context.requestBody),
        queryParams: context.queryParams,
        userId: context.userId,
        tenantId: context.tenantId
      }
    })
  },
  
  /**
   * Capture database error
   */
  captureDBError(
    error: Error,
    context: {
      operation: string
      model?: string
      query?: string
      userId?: string
      tenantId?: string
    }
  ) {
    this.captureException(error, {
      level: 'error',
      tags: {
        component: 'database',
        operation: context.operation,
        model: context.model || 'unknown'
      },
      extra: {
        operation: context.operation,
        model: context.model,
        query: context.query,
        userId: context.userId,
        tenantId: context.tenantId
      }
    })
  },
  
  /**
   * Capture queue job error
   */
  captureJobError(
    error: Error,
    context: {
      jobName: string
      queueName: string
      jobId?: string
      data?: any
      attempt?: number
    }
  ) {
    this.captureException(error, {
      level: 'error',
      tags: {
        component: 'queue',
        queue: context.queueName,
        job: context.jobName
      },
      extra: {
        jobName: context.jobName,
        queueName: context.queueName,
        jobId: context.jobId,
        attempt: context.attempt,
        jobData: sanitizeData(context.data)
      }
    })
  },
  
  /**
   * Capture business logic error
   */
  captureBusinessError(
    error: Error | string,
    context: {
      feature: string
      action: string
      userId?: string
      tenantId?: string
      data?: any
    }
  ) {
    this.captureException(error, {
      level: 'warning',
      tags: {
        component: 'business_logic',
        feature: context.feature,
        action: context.action
      },
      extra: {
        feature: context.feature,
        action: context.action,
        userId: context.userId,
        tenantId: context.tenantId,
        data: sanitizeData(context.data)
      }
    })
  }
}

/**
 * Performance monitoring
 */
export const performanceTracker = {
  /**
   * Start transaction
   */
  startTransaction(name: string, op?: string): Sentry.Transaction {
    return Sentry.startTransaction({
      name,
      op: op || 'function'
    })
  },
  
  /**
   * Track API request
   */
  async trackAPIRequest<T>(
    endpoint: string,
    method: string,
    fn: () => Promise<T>,
    context?: {
      userId?: string
      tenantId?: string
    }
  ): Promise<T> {
    const transaction = this.startTransaction(`${method} ${endpoint}`, 'http.request')
    
    transaction.setData('endpoint', endpoint)
    transaction.setData('method', method)
    
    if (context?.userId) {
      transaction.setData('userId', context.userId)
    }
    
    if (context?.tenantId) {
      transaction.setData('tenantId', context.tenantId)
    }
    
    try {
      const result = await fn()
      transaction.setStatus('ok')
      return result
    } catch (error) {
      transaction.setStatus('internal_error')
      throw error
    } finally {
      transaction.finish()
    }
  },
  
  /**
   * Track database query
   */
  async trackDBQuery<T>(
    operation: string,
    model: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const transaction = this.startTransaction(`${model}.${operation}`, 'db.query')
    
    transaction.setData('operation', operation)
    transaction.setData('model', model)
    
    try {
      const result = await fn()
      transaction.setStatus('ok')
      return result
    } catch (error) {
      transaction.setStatus('internal_error')
      throw error
    } finally {
      transaction.finish()
    }
  },
  
  /**
   * Track AI operation
   */
  async trackAIOperation<T>(
    operation: string,
    agentType: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const transaction = this.startTransaction(`ai.${operation}`, 'ai.inference')
    
    transaction.setData('operation', operation)
    transaction.setData('agentType', agentType)
    
    try {
      const result = await fn()
      transaction.setStatus('ok')
      return result
    } catch (error) {
      transaction.setStatus('internal_error')
      throw error
    } finally {
      transaction.finish()
    }
  }
}

/**
 * User feedback integration
 */
export const feedbackTracker = {
  /**
   * Show user feedback dialog (client-side only)
   */
  showFeedbackDialog(eventId?: string) {
    if (typeof window !== 'undefined') {
      Sentry.showReportDialog({ eventId })
    }
  },
  
  /**
   * Capture user feedback
   */
  captureUserFeedback(
    feedback: {
      name: string
      email: string
      comments: string
    },
    eventId?: string
  ) {
    Sentry.captureUserFeedback({
      event_id: eventId || Sentry.lastEventId() || '',
      name: feedback.name,
      email: feedback.email,
      comments: feedback.comments
    })
  }
}

/**
 * Custom Sentry integrations
 */
export const customIntegrations = {
  /**
   * Queue job tracking integration
   */
  QueueIntegration: class implements Sentry.Integration {
    name = 'QueueIntegration'
    
    setupOnce() {
      // This would integrate with the queue system to automatically
      // track job performance and errors
    }
  },
  
  /**
   * Database tracking integration
   */
  DatabaseIntegration: class implements Sentry.Integration {
    name = 'DatabaseIntegration'
    
    setupOnce() {
      // This would integrate with Prisma to automatically
      // track query performance and errors
    }
  }
}

/**
 * Error boundaries and wrappers
 */
export function withSentry<T extends (...args: any[]) => any>(
  fn: T,
  context?: {
    component?: string
    operation?: string
  }
): T {
  return ((...args: Parameters<T>): ReturnType<T> => {
    try {
      const result = fn(...args)
      
      // Handle async functions
      if (result instanceof Promise) {
        return result.catch((error) => {
          errorTracker.captureException(error, {
            tags: {
              component: context?.component || 'unknown',
              operation: context?.operation || 'unknown'
            }
          })
          throw error
        }) as ReturnType<T>
      }
      
      return result
    } catch (error) {
      errorTracker.captureException(error as Error, {
        tags: {
          component: context?.component || 'unknown',
          operation: context?.operation || 'unknown'
        }
      })
      throw error
    }
  }) as T
}

/**
 * Express error handler middleware
 */
export function sentryErrorHandler() {
  return Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Only capture 500+ errors
      return error.status >= 500
    }
  })
}

// Initialize Sentry if not already done
if (typeof window === 'undefined' && process.env.SENTRY_DSN) {
  initSentry()
}