/**
 * CoreFlow360 - Comprehensive Logging System
 * Structured logging with security, audit trails, and observability
 */

import pino, { Logger as PinoLogger } from 'pino'
import { AsyncLocalStorage } from 'async_hooks'

// Request context for correlation IDs
const requestContext = new AsyncLocalStorage<{
  requestId: string
  tenantId?: string
  userId?: string
  sessionId?: string
  userAgent?: string
  ip?: string
}>()

// Log levels
export enum LogLevel {
  TRACE = 10,
  DEBUG = 20,
  INFO = 30,
  WARN = 40,
  ERROR = 50,
  FATAL = 60
}

// Log categories for organization
export enum LogCategory {
  SECURITY = 'security',
  AUDIT = 'audit',
  PERFORMANCE = 'performance',
  BUSINESS = 'business',
  SYSTEM = 'system',
  API = 'api',
  DATABASE = 'database',
  CACHE = 'cache',
  AUTH = 'auth',
  PAYMENT = 'payment',
  AI = 'ai',
  ERROR = 'error'
}

interface LogContext {
  requestId?: string
  tenantId?: string
  userId?: string
  sessionId?: string
  component?: string
  operation?: string
  duration?: number
  metadata?: Record<string, any>
}

interface SecurityLogData {
  event: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  source_ip?: string
  user_agent?: string
  affected_resource?: string
  attempted_action?: string
  result: 'success' | 'failure' | 'blocked'
  risk_score?: number
}

interface AuditLogData {
  action: string
  resource_type: string
  resource_id?: string
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  change_summary?: string
  compliance_tags?: string[]
}

interface PerformanceLogData {
  operation: string
  duration_ms: number
  memory_usage?: number
  cpu_usage?: number
  cache_hit_rate?: number
  db_query_count?: number
  external_calls?: number
}

interface BusinessLogData {
  event: string
  entity_type?: string
  entity_id?: string
  business_context?: Record<string, any>
  metrics?: Record<string, number>
}

class CoreFlowLogger {
  private logger: PinoLogger
  private isProduction: boolean

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production'
    
    // Configure Pino logger
    this.logger = pino({
      level: process.env.LOG_LEVEL || (this.isProduction ? 'info' : 'debug'),
      name: 'coreflow360',
      
      // Production configuration
      ...(this.isProduction && {
        redact: {
          paths: [
            'password',
            'token',
            'secret',
            'authorization',
            'cookie',
            'credit_card',
            'ssn',
            'req.headers.authorization',
            'req.headers.cookie',
            'res.headers["set-cookie"]'
          ],
          remove: true
        },
        serializers: {
          req: pino.stdSerializers.req,
          res: pino.stdSerializers.res,
          err: pino.stdSerializers.err
        }
      }),

      // Development configuration  
      ...(!this.isProduction && {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
            singleLine: false
          }
        }
      }),

      // Base fields
      base: {
        service: 'coreflow360',
        version: process.env.npm_package_version || '2.0.0',
        environment: process.env.NODE_ENV || 'development',
        hostname: process.env.HOSTNAME || 'localhost'
      },

      // Timestamp
      timestamp: pino.stdTimeFunctions.isoTime,

      // Custom formatters
      formatters: {
        level(label: string) {
          return { level: label }
        },
        log(object: any) {
          const context = requestContext.getStore()
          return {
            ...object,
            ...(context && {
              request_id: context.requestId,
              tenant_id: context.tenantId,
              user_id: context.userId,
              session_id: context.sessionId
            })
          }
        }
      }
    })

    // Handle uncaught exceptions
    this.logger.info('Logger initialized')
  }

  /**
   * Set request context for correlation
   */
  withContext<T>(context: {
    requestId: string
    tenantId?: string
    userId?: string
    sessionId?: string
    userAgent?: string
    ip?: string
  }, fn: () => T): T {
    return requestContext.run(context, fn)
  }

  /**
   * Get current request context
   */
  getContext() {
    return requestContext.getStore()
  }

  /**
   * Generic logging method
   */
  private log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    data?: any,
    context?: LogContext
  ) {
    const logData = {
      category,
      message,
      ...context,
      ...(data && { data }),
      timestamp: new Date().toISOString()
    }

    switch (level) {
      case LogLevel.TRACE:
        this.logger.trace(logData, message)
        break
      case LogLevel.DEBUG:
        this.logger.debug(logData, message)
        break
      case LogLevel.INFO:
        this.logger.info(logData, message)
        break
      case LogLevel.WARN:
        this.logger.warn(logData, message)
        break
      case LogLevel.ERROR:
        this.logger.error(logData, message)
        break
      case LogLevel.FATAL:
        this.logger.fatal(logData, message)
        break
    }
  }

  /**
   * Security logging
   */
  security(message: string, data: SecurityLogData, context?: LogContext) {
    this.log(LogLevel.WARN, LogCategory.SECURITY, message, data, {
      ...context,
      component: 'security'
    })

    // Send critical security events to monitoring
    if (data.severity === 'critical') {
      this.sendToMonitoring('security_alert', { message, ...data })
    }
  }

  /**
   * Audit logging for compliance
   */
  audit(message: string, data: AuditLogData, context?: LogContext) {
    this.log(LogLevel.INFO, LogCategory.AUDIT, message, {
      ...data,
      audit_timestamp: new Date().toISOString(),
      compliance_required: true
    }, {
      ...context,
      component: 'audit'
    })
  }

  /**
   * Performance logging
   */
  performance(message: string, data: PerformanceLogData, context?: LogContext) {
    const logLevel = data.duration_ms > 5000 ? LogLevel.WARN : LogLevel.INFO
    
    this.log(logLevel, LogCategory.PERFORMANCE, message, {
      ...data,
      performance_threshold_exceeded: data.duration_ms > 1000
    }, {
      ...context,
      component: 'performance',
      duration: data.duration_ms
    })
  }

  /**
   * Business event logging
   */
  business(message: string, data: BusinessLogData, context?: LogContext) {
    this.log(LogLevel.INFO, LogCategory.BUSINESS, message, data, {
      ...context,
      component: 'business'
    })
  }

  /**
   * API request/response logging
   */
  api(message: string, data: {
    method: string
    url: string
    status_code: number
    duration_ms: number
    request_size?: number
    response_size?: number
    user_agent?: string
    ip?: string
  }, context?: LogContext) {
    const logLevel = data.status_code >= 500 ? LogLevel.ERROR :
                    data.status_code >= 400 ? LogLevel.WARN : LogLevel.INFO

    this.log(logLevel, LogCategory.API, message, data, {
      ...context,
      component: 'api',
      operation: `${data.method} ${data.url}`,
      duration: data.duration_ms
    })
  }

  /**
   * Database operation logging
   */
  database(message: string, data: {
    operation: string
    table: string
    duration_ms: number
    rows_affected?: number
    query_hash?: string
    success: boolean
    error?: string
  }, context?: LogContext) {
    const logLevel = !data.success ? LogLevel.ERROR :
                    data.duration_ms > 1000 ? LogLevel.WARN : LogLevel.DEBUG

    this.log(logLevel, LogCategory.DATABASE, message, data, {
      ...context,
      component: 'database',
      operation: `${data.operation}:${data.table}`,
      duration: data.duration_ms
    })
  }

  /**
   * Cache operation logging
   */
  cache(message: string, data: {
    operation: 'hit' | 'miss' | 'set' | 'delete' | 'evict'
    cache_type: string
    key_pattern?: string
    ttl?: number
    size?: number
    duration_ms?: number
  }, context?: LogContext) {
    this.log(LogLevel.DEBUG, LogCategory.CACHE, message, data, {
      ...context,
      component: 'cache',
      operation: `cache:${data.operation}`,
      duration: data.duration_ms
    })
  }

  /**
   * Authentication/Authorization logging
   */
  auth(message: string, data: {
    event: 'login' | 'logout' | 'register' | 'password_change' | 'permission_check' | 'token_refresh'
    result: 'success' | 'failure'
    method?: string
    ip?: string
    user_agent?: string
    failure_reason?: string
    risk_score?: number
  }, context?: LogContext) {
    const logLevel = data.result === 'failure' ? LogLevel.WARN : LogLevel.INFO

    this.log(logLevel, LogCategory.AUTH, message, data, {
      ...context,
      component: 'auth'
    })

    // Security monitoring for auth events
    if (data.result === 'failure') {
      this.security(`Authentication failure: ${message}`, {
        event: data.event,
        severity: 'medium',
        source_ip: data.ip,
        user_agent: data.user_agent,
        result: 'failure',
        risk_score: data.risk_score
      }, context)
    }
  }

  /**
   * Payment transaction logging
   */
  payment(message: string, data: {
    transaction_id?: string
    amount?: number
    currency?: string
    payment_method?: string
    status: 'pending' | 'completed' | 'failed' | 'refunded'
    gateway?: string
    error_code?: string
  }, context?: LogContext) {
    const logLevel = data.status === 'failed' ? LogLevel.ERROR : LogLevel.INFO

    this.log(logLevel, LogCategory.PAYMENT, message, {
      ...data,
      // Redact sensitive payment data
      payment_method: data.payment_method ? 'REDACTED' : undefined
    }, {
      ...context,
      component: 'payment'
    })

    // Audit log for financial transactions
    if (data.transaction_id) {
      this.audit(`Payment transaction: ${data.status}`, {
        action: 'payment_transaction',
        resource_type: 'payment',
        resource_id: data.transaction_id,
        new_values: {
          status: data.status,
          amount: data.amount,
          currency: data.currency
        },
        compliance_tags: ['PCI_DSS', 'financial_audit']
      }, context)
    }
  }

  /**
   * AI/ML operation logging
   */
  ai(message: string, data: {
    model: string
    operation: string
    tokens_used?: number
    cost_cents?: number
    duration_ms: number
    success: boolean
    error?: string
    input_size?: number
    output_size?: number
  }, context?: LogContext) {
    const logLevel = !data.success ? LogLevel.ERROR : LogLevel.INFO

    this.log(logLevel, LogCategory.AI, message, data, {
      ...context,
      component: 'ai',
      operation: `ai:${data.operation}`,
      duration: data.duration_ms
    })
  }

  /**
   * Error logging with stack traces
   */
  error(message: string, error: Error, context?: LogContext, metadata?: Record<string, any>) {
    this.log(LogLevel.ERROR, LogCategory.ERROR, message, {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        ...metadata
      }
    }, {
      ...context,
      component: 'error'
    })
  }

  /**
   * Fatal error logging
   */
  fatal(message: string, error?: Error, context?: LogContext) {
    this.log(LogLevel.FATAL, LogCategory.ERROR, message, error && {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    }, {
      ...context,
      component: 'fatal'
    })
  }

  /**
   * Standard log levels
   */
  trace(message: string, data?: any, context?: LogContext) {
    this.log(LogLevel.TRACE, LogCategory.SYSTEM, message, data, context)
  }

  debug(message: string, data?: any, context?: LogContext) {
    this.log(LogLevel.DEBUG, LogCategory.SYSTEM, message, data, context)
  }

  info(message: string, data?: any, context?: LogContext) {
    this.log(LogLevel.INFO, LogCategory.SYSTEM, message, data, context)
  }

  warn(message: string, data?: any, context?: LogContext) {
    this.log(LogLevel.WARN, LogCategory.SYSTEM, message, data, context)
  }

  /**
   * Send critical alerts to monitoring systems
   */
  private sendToMonitoring(alertType: string, data: any) {
    // In production, this would integrate with monitoring services
    if (process.env.MONITORING_WEBHOOK) {
      fetch(process.env.MONITORING_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alert_type: alertType,
          timestamp: new Date().toISOString(),
          service: 'coreflow360',
          data
        })
      }).catch(err => {
        this.logger.error('Failed to send monitoring alert', err)
      })
    }
  }

  /**
   * Create child logger with additional context
   */
  child(context: Record<string, any>) {
    return {
      ...this,
      logger: this.logger.child(context)
    }
  }

  /**
   * Flush logs (useful for testing and shutdown)
   */
  async flush() {
    return new Promise<void>((resolve) => {
      // Pino automatically flushes, but we can add custom flush logic here
      setTimeout(resolve, 100)
    })
  }
}

// Export singleton logger instance
export const logger = new CoreFlowLogger()

// Convenience exports
export { LogLevel, LogCategory }
export type { 
  LogContext, 
  SecurityLogData, 
  AuditLogData, 
  PerformanceLogData, 
  BusinessLogData 
}

// Export type for child loggers
export type ChildLogger = ReturnType<typeof logger.child>

/**
 * Request logging middleware
 */
export function createRequestLogger() {
  return (req: any, res: any, next: any) => {
    const requestId = req.headers['x-request-id'] || 
                     req.id || 
                     Math.random().toString(36).substring(7)
    
    const context = {
      requestId,
      tenantId: req.headers['x-tenant-id'],
      userId: req.user?.id,
      sessionId: req.sessionID,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress
    }

    // Set request ID header
    res.setHeader('X-Request-ID', requestId)

    // Log request start
    const startTime = Date.now()
    
    logger.withContext(context, () => {
      logger.api('HTTP request started', {
        method: req.method,
        url: req.originalUrl || req.url,
        status_code: 0,
        duration_ms: 0,
        request_size: parseInt(req.headers['content-length']) || 0,
        user_agent: req.headers['user-agent'],
        ip: context.ip
      })
    })

    // Log response
    const originalSend = res.send
    res.send = function(data: any) {
      const duration = Date.now() - startTime
      
      logger.withContext(context, () => {
        logger.api('HTTP request completed', {
          method: req.method,
          url: req.originalUrl || req.url,
          status_code: res.statusCode,
          duration_ms: duration,
          request_size: parseInt(req.headers['content-length']) || 0,
          response_size: Buffer.byteLength(data || '', 'utf8'),
          user_agent: req.headers['user-agent'],
          ip: context.ip
        })
      })

      return originalSend.call(this, data)
    }

    next()
  }
}

export default logger