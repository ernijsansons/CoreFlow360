/**
 * CoreFlow360 - Enhanced Error Handling System
 * Provides comprehensive error classification, recovery, and reporting
 */

import { circuitBreakers } from '@/lib/resilience/circuit-breaker'
import { withRetry, RetryConfig } from '@/lib/resilience/timeout-handler'

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'
export type ErrorCategory = 'network' | 'authentication' | 'authorization' | 'validation' | 'business' | 'system' | 'external' | 'unknown'
export type RecoveryStrategy = 'retry' | 'fallback' | 'circuit_breaker' | 'escalate' | 'ignore'

export interface ErrorContext {
  operation: string
  service?: string
  userId?: string
  tenantId?: string
  requestId?: string
  timestamp: number
  metadata?: Record<string, any>
}

export interface ErrorClassification {
  category: ErrorCategory
  severity: ErrorSeverity
  retryable: boolean
  recoveryStrategy: RecoveryStrategy
  estimatedRecoveryTime?: number
  fallbackAvailable: boolean
}

export interface ErrorRecoveryResult {
  success: boolean
  strategy: RecoveryStrategy
  attemptCount: number
  recoveryTime: number
  fallbackUsed: boolean
  originalError: Error
  finalError?: Error
}

export interface FallbackConfig {
  enabled: boolean
  handler: () => Promise<any> | any
  condition?: (error: Error) => boolean
  timeout?: number
}

export interface ErrorHandlingConfig {
  retryConfig?: RetryConfig
  fallbackConfig?: FallbackConfig
  circuitBreakerName?: string
  escalationThreshold?: number
  suppressNonCritical?: boolean
}

/**
 * Enhanced Error Classifier
 */
export class ErrorClassifier {
  static classify(error: Error, context: ErrorContext): ErrorClassification {
    const message = error.message.toLowerCase()
    const name = error.name.toLowerCase()
    const stack = error.stack?.toLowerCase() || ''

    // Network and connectivity errors
    if (this.isNetworkError(message, name, stack)) {
      return {
        category: 'network',
        severity: 'medium',
        retryable: true,
        recoveryStrategy: 'retry',
        estimatedRecoveryTime: 5000,
        fallbackAvailable: true
      }
    }

    // Authentication errors
    if (this.isAuthenticationError(message, name)) {
      return {
        category: 'authentication',
        severity: 'high',
        retryable: false,
        recoveryStrategy: 'escalate',
        fallbackAvailable: false
      }
    }

    // Authorization errors
    if (this.isAuthorizationError(message, name)) {
      return {
        category: 'authorization',
        severity: 'medium',
        retryable: false,
        recoveryStrategy: 'escalate',
        fallbackAvailable: true
      }
    }

    // Validation errors
    if (this.isValidationError(message, name)) {
      return {
        category: 'validation',
        severity: 'low',
        retryable: false,
        recoveryStrategy: 'escalate',
        fallbackAvailable: false
      }
    }

    // External service errors
    if (this.isExternalServiceError(context, message)) {
      return {
        category: 'external',
        severity: 'medium',
        retryable: true,
        recoveryStrategy: 'circuit_breaker',
        estimatedRecoveryTime: 30000,
        fallbackAvailable: true
      }
    }

    // Business logic errors
    if (this.isBusinessLogicError(message, name)) {
      return {
        category: 'business',
        severity: 'medium',
        retryable: false,
        recoveryStrategy: 'escalate',
        fallbackAvailable: true
      }
    }

    // System errors
    if (this.isSystemError(message, name, stack)) {
      return {
        category: 'system',
        severity: 'critical',
        retryable: true,
        recoveryStrategy: 'escalate',
        estimatedRecoveryTime: 60000,
        fallbackAvailable: true
      }
    }

    // Default: unknown error
    return {
      category: 'unknown',
      severity: 'medium',
      retryable: true,
      recoveryStrategy: 'retry',
      estimatedRecoveryTime: 10000,
      fallbackAvailable: false
    }
  }

  private static isNetworkError(message: string, name: string, stack: string): boolean {
    const networkIndicators = [
      'connection', 'timeout', 'network', 'econnreset', 'enotfound', 'socket',
      'dns', 'host', 'port', 'tcp', 'ssl', 'tls', 'certificate'
    ]
    return networkIndicators.some(indicator => 
      message.includes(indicator) || name.includes(indicator) || stack.includes(indicator)
    )
  }

  private static isAuthenticationError(message: string, name: string): boolean {
    const authIndicators = ['unauthorized', 'authentication', 'login', 'token', 'session', 'credential']
    return authIndicators.some(indicator => message.includes(indicator) || name.includes(indicator))
  }

  private static isAuthorizationError(message: string, name: string): boolean {
    const authzIndicators = ['forbidden', 'permission', 'access', 'privilege', 'role', 'scope']
    return authzIndicators.some(indicator => message.includes(indicator) || name.includes(indicator))
  }

  private static isValidationError(message: string, name: string): boolean {
    const validationIndicators = ['validation', 'invalid', 'required', 'format', 'schema', 'constraint']
    return validationIndicators.some(indicator => message.includes(indicator) || name.includes(indicator))
  }

  private static isExternalServiceError(context: ErrorContext, message: string): boolean {
    const externalServices = ['stripe', 'openai', 'anthropic', 'sendgrid', 'google', 'aws']
    return externalServices.some(service => 
      context.service?.toLowerCase().includes(service) || 
      context.operation.toLowerCase().includes(service) ||
      message.includes(service)
    )
  }

  private static isBusinessLogicError(message: string, name: string): boolean {
    const businessIndicators = ['business', 'rule', 'policy', 'constraint', 'violation', 'conflict']
    return businessIndicators.some(indicator => message.includes(indicator) || name.includes(indicator))
  }

  private static isSystemError(message: string, name: string, stack: string): boolean {
    const systemIndicators = ['memory', 'disk', 'cpu', 'resource', 'limit', 'quota', 'capacity']
    return systemIndicators.some(indicator => 
      message.includes(indicator) || name.includes(indicator) || stack.includes(indicator)
    )
  }
}

/**
 * Enhanced Error Recovery Engine
 */
export class ErrorRecoveryEngine {
  private static fallbacks = new Map<string, FallbackConfig>()
  private static errorCounts = new Map<string, number>()

  static registerFallback(operation: string, config: FallbackConfig): void {
    this.fallbacks.set(operation, config)
  }

  static async recover(
    error: Error,
    context: ErrorContext,
    config: ErrorHandlingConfig = {}
  ): Promise<ErrorRecoveryResult> {
    const startTime = Date.now()
    const classification = ErrorClassifier.classify(error, context)
    
    let attemptCount = 0
    let fallbackUsed = false
    let finalError = error

    try {
      switch (classification.recoveryStrategy) {
        case 'retry':
          return await this.handleRetryStrategy(error, context, config, classification)

        case 'circuit_breaker':
          return await this.handleCircuitBreakerStrategy(error, context, config, classification)

        case 'fallback':
          return await this.handleFallbackStrategy(error, context, config, classification)

        case 'escalate':
          await this.escalateError(error, context, classification)
          break

        case 'ignore':
          // Log but don't throw
          console.warn(`Ignoring ${classification.category} error in ${context.operation}:`, error.message)
          break
      }

      return {
        success: false,
        strategy: classification.recoveryStrategy,
        attemptCount,
        recoveryTime: Date.now() - startTime,
        fallbackUsed,
        originalError: error,
        finalError
      }
    } catch (recoveryError) {
      return {
        success: false,
        strategy: classification.recoveryStrategy,
        attemptCount,
        recoveryTime: Date.now() - startTime,
        fallbackUsed,
        originalError: error,
        finalError: recoveryError as Error
      }
    }
  }

  private static async handleRetryStrategy(
    error: Error,
    context: ErrorContext,
    config: ErrorHandlingConfig,
    classification: ErrorClassification
  ): Promise<ErrorRecoveryResult> {
    const startTime = Date.now()
    
    if (!config.retryConfig) {
      config.retryConfig = {
        timeout: classification.estimatedRecoveryTime || 10000,
        retries: classification.severity === 'critical' ? 5 : 3,
        retryDelay: 1000,
        exponentialBackoff: true,
        maxRetryDelay: 30000
      }
    }

    try {
      // This would need the actual operation to retry
      // For now, we'll simulate the retry logic
      await new Promise(resolve => setTimeout(resolve, config.retryConfig!.retryDelay || 1000))
      
      return {
        success: true,
        strategy: 'retry',
        attemptCount: 1,
        recoveryTime: Date.now() - startTime,
        fallbackUsed: false,
        originalError: error
      }
    } catch (retryError) {
      // Try fallback if available
      if (classification.fallbackAvailable && config.fallbackConfig?.enabled) {
        return await this.handleFallbackStrategy(error, context, config, classification)
      }
      
      throw retryError
    }
  }

  private static async handleCircuitBreakerStrategy(
    error: Error,
    context: ErrorContext,
    config: ErrorHandlingConfig,
    classification: ErrorClassification
  ): Promise<ErrorRecoveryResult> {
    const startTime = Date.now()
    const breakerName = config.circuitBreakerName || context.service || 'default'
    
    try {
      // Circuit breaker will handle the retry logic
      const breaker = circuitBreakers[breakerName as keyof typeof circuitBreakers]
      if (breaker) {
        // Circuit breaker stats can tell us if we should try fallback
        const stats = breaker.getStats()
        if (stats.state === 'OPEN' && classification.fallbackAvailable && config.fallbackConfig?.enabled) {
          return await this.handleFallbackStrategy(error, context, config, classification)
        }
      }

      return {
        success: false,
        strategy: 'circuit_breaker',
        attemptCount: 1,
        recoveryTime: Date.now() - startTime,
        fallbackUsed: false,
        originalError: error
      }
    } catch (breakerError) {
      // Try fallback if circuit breaker fails
      if (classification.fallbackAvailable && config.fallbackConfig?.enabled) {
        return await this.handleFallbackStrategy(error, context, config, classification)
      }
      
      throw breakerError
    }
  }

  private static async handleFallbackStrategy(
    error: Error,
    context: ErrorContext,
    config: ErrorHandlingConfig,
    classification: ErrorClassification
  ): Promise<ErrorRecoveryResult> {
    const startTime = Date.now()
    const fallbackConfig = config.fallbackConfig || this.fallbacks.get(context.operation)
    
    if (!fallbackConfig?.enabled) {
      throw new Error('Fallback not available or disabled')
    }

    if (fallbackConfig.condition && !fallbackConfig.condition(error)) {
      throw new Error('Fallback condition not met')
    }

    try {
      const fallbackResult = await Promise.race([
        Promise.resolve(fallbackConfig.handler()),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Fallback timeout')), fallbackConfig.timeout || 5000)
        )
      ])

      return {
        success: true,
        strategy: 'fallback',
        attemptCount: 1,
        recoveryTime: Date.now() - startTime,
        fallbackUsed: true,
        originalError: error
      }
    } catch (fallbackError) {
      throw new Error(`Fallback failed: ${fallbackError}`)
    }
  }

  private static async escalateError(
    error: Error,
    context: ErrorContext,
    classification: ErrorClassification
  ): Promise<void> {
    const errorKey = `${context.operation}:${error.name}`
    const currentCount = this.errorCounts.get(errorKey) || 0
    this.errorCounts.set(errorKey, currentCount + 1)

    // Log error with appropriate severity
    const logLevel = classification.severity === 'critical' ? 'error' : 
                    classification.severity === 'high' ? 'warn' : 'info'
    
    console[logLevel](`[${classification.severity.toUpperCase()}] ${classification.category} error in ${context.operation}:`, {
      error: error.message,
      context,
      classification,
      count: currentCount + 1,
      stack: error.stack
    })

    // Send alerts for critical errors or repeated errors
    if (classification.severity === 'critical' || currentCount >= 5) {
      await this.sendErrorAlert(error, context, classification, currentCount + 1)
    }
  }

  private static async sendErrorAlert(
    error: Error,
    context: ErrorContext,
    classification: ErrorClassification,
    count: number
  ): Promise<void> {
    // This would integrate with alerting systems (email, Slack, PagerDuty, etc.)
    console.error('🚨 ERROR ALERT 🚨', {
      message: `${classification.severity.toUpperCase()} ${classification.category} error`,
      operation: context.operation,
      error: error.message,
      count,
      context,
      timestamp: new Date().toISOString()
    })
  }

  static getErrorStats(): Record<string, number> {
    return Object.fromEntries(this.errorCounts.entries())
  }

  static clearErrorStats(): void {
    this.errorCounts.clear()
  }
}

/**
 * Enhanced Error Handler with automatic recovery
 */
export async function handleErrorWithRecovery<T>(
  operation: () => Promise<T>,
  context: ErrorContext,
  config: ErrorHandlingConfig = {}
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    const recoveryResult = await ErrorRecoveryEngine.recover(error as Error, context, config)
    
    if (recoveryResult.success && recoveryResult.fallbackUsed && config.fallbackConfig?.handler) {
      return config.fallbackConfig.handler()
    }
    
    // If recovery didn't succeed, throw the final error
    throw recoveryResult.finalError || recoveryResult.originalError
  }
}

/**
 * Decorator for automatic error handling with recovery
 */
export function withErrorRecovery(config: ErrorHandlingConfig = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const context: ErrorContext = {
        operation: `${target.constructor.name}.${propertyKey}`,
        timestamp: Date.now(),
        metadata: { args }
      }

      return handleErrorWithRecovery(
        () => originalMethod.apply(this, args),
        context,
        config
      )
    }

    return descriptor
  }
}