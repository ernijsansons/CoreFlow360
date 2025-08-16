/**
 * CoreFlow360 - Centralized Error Handling System
 * Provides consistent error responses, logging, and monitoring
 */

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library'
import { prisma } from './db'
import { 
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  ExternalServiceError,
  BusinessLogicError,
  TenantError
} from './errors/base-error'

// Error types for different scenarios
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  RATE_LIMIT = 'RATE_LIMIT_ERROR',
  DATABASE = 'DATABASE_ERROR',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE_ERROR',
  INTERNAL = 'INTERNAL_ERROR',
  CONFIGURATION = 'CONFIGURATION_ERROR'
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error context interface
export interface ErrorContext {
  userId?: string
  tenantId?: string
  requestId?: string
  endpoint?: string
  method?: string
  userAgent?: string
  ip?: string
  metadata?: Record<string, unknown>
}

// Error response interface
export interface ErrorResponse {
  success: false
  error: {
    type: ErrorType
    message: string
    code: string
    details?: Record<string, unknown>
    requestId?: string
  }
  timestamp: string
}

// Error configuration
const ERROR_CONFIG = {
  includeStackTraces: process.env.NODE_ENV === 'development',
  logErrors: true,
  monitorErrors: process.env.NODE_ENV === 'production',
  sanitizeMessages: process.env.NODE_ENV === 'production'
} as const

/**
 * Centralized error handler class
 */
export class ErrorHandler {
  private static instance: ErrorHandler

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  /**
   * Handle and format errors for API responses
   */
  handleError(
    error: unknown,
    context: ErrorContext = {},
    type: ErrorType = ErrorType.INTERNAL
  ): NextResponse {
    const errorInfo = this.extractErrorInfo(error, type)
    const response = this.formatErrorResponse(errorInfo, context)
    
    // Log the error
    if (ERROR_CONFIG.logErrors) {
      this.logError(errorInfo, context)
    }
    
    // Monitor in production
    if (ERROR_CONFIG.monitorErrors) {
      this.monitorError(errorInfo, context)
    }
    
    return NextResponse.json(response, { status: errorInfo.statusCode })
  }

  /**
   * Handle validation errors
   */
  handleValidationError(
    errors: unknown,
    context: ErrorContext = {}
  ): NextResponse {
    return this.handleError(errors, context, ErrorType.VALIDATION)
  }

  /**
   * Handle authentication errors
   */
  handleAuthError(
    error: unknown,
    context: ErrorContext = {}
  ): NextResponse {
    return this.handleError(error, context, ErrorType.AUTHENTICATION)
  }

  /**
   * Handle authorization errors
   */
  handleAuthzError(
    error: unknown,
    context: ErrorContext = {}
  ): NextResponse {
    return this.handleError(error, context, ErrorType.AUTHORIZATION)
  }

  /**
   * Handle not found errors
   */
  handleNotFoundError(
    resource: string,
    context: ErrorContext = {}
  ): NextResponse {
    const error = new NotFoundError(resource)
    return this.handleError(error, context, ErrorType.NOT_FOUND)
  }

  /**
   * Handle rate limit errors
   */
  handleRateLimitError(
    retryAfter: number,
    context: ErrorContext = {}
  ): NextResponse {
    const error = new RateLimitError('Rate limit exceeded', retryAfter)
    const errorInfo = this.extractErrorInfo(error, ErrorType.RATE_LIMIT)
    errorInfo.retryAfter = retryAfter
    
    const response = this.formatErrorResponse(errorInfo, context)
    return NextResponse.json(response, { 
      status: 429,
      headers: {
        'Retry-After': String(Math.ceil(retryAfter / 1000))
      }
    })
  }

  /**
   * Handle Zod validation errors specifically
   */
  handleZodError(error: ZodError, context: ErrorContext = {}): NextResponse {
    const details = {
      issues: error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code
      }))
    }
    
    const errorInfo = {
      type: ErrorType.VALIDATION,
      message: 'Validation failed',
      details,
      statusCode: 400,
      severity: ErrorSeverity.LOW,
      retryAfter: undefined,
      originalError: error
    }
    
    return this.processErrorResponse(errorInfo, context)
  }

  /**
   * Handle Prisma database errors specifically
   */
  handlePrismaError(error: PrismaClientKnownRequestError | PrismaClientValidationError, context: ErrorContext = {}): NextResponse {
    let errorInfo: any
    
    if (error instanceof PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          errorInfo = {
            type: ErrorType.VALIDATION,
            message: 'Duplicate entry detected',
            details: { field: error.meta?.target, code: error.code },
            statusCode: 409,
            severity: ErrorSeverity.LOW
          }
          break
        case 'P2025':
          errorInfo = {
            type: ErrorType.NOT_FOUND,
            message: 'Record not found',
            details: { code: error.code },
            statusCode: 404,
            severity: ErrorSeverity.LOW
          }
          break
        default:
          errorInfo = {
            type: ErrorType.DATABASE,
            message: 'Database operation failed',
            details: { code: error.code, meta: error.meta },
            statusCode: 500,
            severity: ErrorSeverity.HIGH
          }
      }
    } else {
      errorInfo = {
        type: ErrorType.DATABASE,
        message: 'Database validation failed',
        details: { validation: true },
        statusCode: 400,
        severity: ErrorSeverity.MEDIUM
      }
    }
    
    errorInfo.retryAfter = undefined
    errorInfo.originalError = error
    
    return this.processErrorResponse(errorInfo, context)
  }

  /**
   * Process error response with enhanced logic
   */
  private processErrorResponse(errorInfo: any, context: ErrorContext): NextResponse {
    const response = this.formatErrorResponse(errorInfo, context)
    
    // Log the error
    if (ERROR_CONFIG.logErrors) {
      this.logError(errorInfo, context)
    }
    
    // Monitor in production
    if (ERROR_CONFIG.monitorErrors) {
      this.monitorError(errorInfo, context)
    }
    
    return NextResponse.json(response, { status: errorInfo.statusCode })
  }

  /**
   * Extract error information
   */
  private extractErrorInfo(error: unknown, type: ErrorType) {
    // If it's already an AppError, extract its properties
    if (error instanceof AppError) {
      return {
        type,
        message: error.message,
        details: error.details,
        statusCode: error.statusCode,
        severity: this.getErrorSeverity(error),
        retryAfter: error instanceof RateLimitError ? error.details?.retryAfter : undefined,
        originalError: error
      }
    }

    const errorMap = {
      [ErrorType.VALIDATION]: {
        statusCode: 400,
        defaultMessage: 'Invalid request data',
        severity: ErrorSeverity.LOW
      },
      [ErrorType.AUTHENTICATION]: {
        statusCode: 401,
        defaultMessage: 'Authentication required',
        severity: ErrorSeverity.MEDIUM
      },
      [ErrorType.AUTHORIZATION]: {
        statusCode: 403,
        defaultMessage: 'Access denied',
        severity: ErrorSeverity.MEDIUM
      },
      [ErrorType.NOT_FOUND]: {
        statusCode: 404,
        defaultMessage: 'Resource not found',
        severity: ErrorSeverity.LOW
      },
      [ErrorType.RATE_LIMIT]: {
        statusCode: 429,
        defaultMessage: 'Too many requests',
        severity: ErrorSeverity.MEDIUM
      },
      [ErrorType.DATABASE]: {
        statusCode: 500,
        defaultMessage: 'Database operation failed',
        severity: ErrorSeverity.HIGH
      },
      [ErrorType.EXTERNAL_SERVICE]: {
        statusCode: 502,
        defaultMessage: 'External service unavailable',
        severity: ErrorSeverity.HIGH
      },
      [ErrorType.INTERNAL]: {
        statusCode: 500,
        defaultMessage: 'Internal server error',
        severity: ErrorSeverity.CRITICAL
      },
      [ErrorType.CONFIGURATION]: {
        statusCode: 500,
        defaultMessage: 'Configuration error',
        severity: ErrorSeverity.CRITICAL
      }
    }

    const config = errorMap[type]
    const message = this.extractMessage(error, config.defaultMessage)
    const details = this.extractDetails(error)

    return {
      type,
      message,
      details,
      statusCode: config.statusCode,
      severity: config.severity,
      retryAfter: undefined as number | undefined,
      originalError: error
    }
  }

  /**
   * Extract error message
   */
  private extractMessage(error: unknown, defaultMessage: string): string {
    if (error instanceof Error) {
      return ERROR_CONFIG.sanitizeMessages 
        ? this.sanitizeErrorMessage(error.message)
        : error.message
    }
    
    if (typeof error === 'string') {
      return ERROR_CONFIG.sanitizeMessages 
        ? this.sanitizeErrorMessage(error)
        : error
    }
    
    return defaultMessage
  }

  /**
   * Extract error details
   */
  private extractDetails(error: unknown): Record<string, unknown> | undefined {
    if (error instanceof Error && ERROR_CONFIG.includeStackTraces) {
      return {
        stack: error.stack,
        name: error.name
      }
    }
    
    if (typeof error === 'object' && error !== null) {
      return error as Record<string, unknown>
    }
    
    return undefined
  }



  /**
   * Format error response
   */
  private formatErrorResponse(
    errorInfo: ReturnType<typeof this.extractErrorInfo>,
    context: ErrorContext
  ): ErrorResponse {
    const response: ErrorResponse = {
      success: false,
      error: {
        type: errorInfo.type,
        message: errorInfo.message,
        code: `${errorInfo.type}_${errorInfo.statusCode}`,
        requestId: context.requestId
      },
      timestamp: new Date().toISOString()
    }

    // Add details if available and in development
    if (errorInfo.details && ERROR_CONFIG.includeStackTraces) {
      response.error.details = errorInfo.details
    }

    return response
  }

  /**
   * Log error to database and console
   */
  private async logError(
    errorInfo: ReturnType<typeof this.extractErrorInfo>,
    context: ErrorContext
  ): Promise<void> {
    const logData = {
      type: errorInfo.type,
      message: errorInfo.message,
      severity: errorInfo.severity,
      statusCode: errorInfo.statusCode,
      userId: context.userId,
      tenantId: context.tenantId,
      requestId: context.requestId,
      endpoint: context.endpoint,
      method: context.method,
      userAgent: context.userAgent,
      ip: context.ip,
      metadata: context.metadata,
      stack: errorInfo.details?.stack,
      timestamp: new Date()
    }

    // Console logging
    console.error('ERROR:', {
      ...logData,
      originalError: errorInfo.originalError
    })

    // Database logging (async, don't block response)
    try {
      await prisma.auditLog.create({
        data: {
          action: 'ERROR',
          entityType: 'SYSTEM',
          entityId: context.requestId || 'unknown',
          oldValues: null,
          newValues: JSON.stringify(logData),
          metadata: JSON.stringify({
            errorType: errorInfo.type,
            severity: errorInfo.severity,
            endpoint: context.endpoint,
            method: context.method
          }),
          tenantId: context.tenantId || 'system',
          userId: context.userId
        }
      })
    } catch (dbError) {
      console.error('Failed to log error to database:', dbError)
    }
  }

  /**
   * Get status code for error type
   */
  private getStatusCode(type: ErrorType): number {
    const statusMap = {
      [ErrorType.VALIDATION]: 400,
      [ErrorType.AUTHENTICATION]: 401,
      [ErrorType.AUTHORIZATION]: 403,
      [ErrorType.NOT_FOUND]: 404,
      [ErrorType.RATE_LIMIT]: 429,
      [ErrorType.DATABASE]: 500,
      [ErrorType.EXTERNAL_SERVICE]: 502,
      [ErrorType.INTERNAL]: 500,
      [ErrorType.CONFIGURATION]: 500
    }
    return statusMap[type] || 500
  }

  /**
   * Get error code
   */
  private getErrorCode(error: unknown): string {
    if (error instanceof Error) {
      return error.name || 'UNKNOWN_ERROR'
    }
    return 'UNKNOWN_ERROR'
  }

  /**
   * Get error details
   */
  private getErrorDetails(error: unknown, context: ErrorContext): Record<string, unknown> | undefined {
    if (error instanceof Error && ERROR_CONFIG.includeStackTraces) {
      return {
        stack: error.stack,
        name: error.name,
        ...context.metadata
      }
    }
    return context.metadata
  }

  /**
   * Sanitize error message
   */
  private sanitizeErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return ERROR_CONFIG.sanitizeMessages 
        ? this.sanitizeMessage(error.message)
        : error.message
    }
    
    if (typeof error === 'string') {
      return ERROR_CONFIG.sanitizeMessages 
        ? this.sanitizeMessage(error)
        : error
    }
    
    return 'An unexpected error occurred'
  }

  /**
   * Sanitize message for production
   */
  private sanitizeMessage(message: string): string {
    return message
      .replace(/password[=:]\s*\S+/gi, 'password=***')
      .replace(/token[=:]\s*\S+/gi, 'token=***')
      .replace(/key[=:]\s*\S+/gi, 'key=***')
      .replace(/secret[=:]\s*\S+/gi, 'secret=***')
      .replace(/api[_-]?key[=:]\s*\S+/gi, 'api_key=***')
  }

  /**
   * Get error severity
   */
  private getErrorSeverity(error: AppError): ErrorSeverity {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      return ErrorSeverity.LOW
    }
    if (error instanceof AuthenticationError || error instanceof AuthorizationError || error instanceof RateLimitError) {
      return ErrorSeverity.MEDIUM
    }
    if (error instanceof DatabaseError || error instanceof ExternalServiceError) {
      return ErrorSeverity.HIGH
    }
    if (error instanceof BusinessLogicError || error instanceof TenantError) {
      return ErrorSeverity.MEDIUM
    }
    return ErrorSeverity.CRITICAL
  }

  /**
   * Monitor errors in production
   */
  private monitorError(
    errorInfo: ReturnType<typeof this.extractErrorInfo>,
    context: ErrorContext
  ): void {
    // In production, this would integrate with monitoring services
    // like Sentry, DataDog, or New Relic
    
    if (errorInfo.severity === ErrorSeverity.CRITICAL) {
      // Send immediate alert for critical errors
      console.error('CRITICAL ERROR ALERT:', {
        type: errorInfo.type,
        message: errorInfo.message,
        endpoint: context.endpoint,
        tenantId: context.tenantId,
        timestamp: new Date().toISOString()
      })
    }
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance()

// Convenience functions for common error scenarios
export const handleValidationError = (errors: unknown, context?: ErrorContext) => {
  if (errors instanceof ZodError) {
    return errorHandler.handleZodError(errors, context)
  }
  if (typeof errors === 'string') {
    return errorHandler.handleError(new ValidationError(errors), context)
  }
  return errorHandler.handleValidationError(errors, context)
}

export const handleAuthError = (error: unknown, context?: ErrorContext) => {
  if (typeof error === 'string') {
    return errorHandler.handleError(new AuthenticationError(error), context)
  }
  return errorHandler.handleAuthError(error, context)
}

export const handleAuthzError = (error: unknown, context?: ErrorContext) => {
  if (typeof error === 'string') {
    return errorHandler.handleError(new AuthorizationError(error), context)
  }
  return errorHandler.handleAuthzError(error, context)
}

// Alias for compatibility
export const handleAuthorizationError = handleAuthzError

export const handleNotFoundError = (resource: string, context?: ErrorContext) =>
  errorHandler.handleNotFoundError(resource, context)



export const handleRateLimitError = (retryAfter: number, context?: ErrorContext) =>
  errorHandler.handleRateLimitError(retryAfter, context)

export const handleDatabaseError = (message: string, originalError?: unknown, context?: ErrorContext) =>
  errorHandler.handleError(new DatabaseError(message, originalError), context)

export const handleExternalServiceError = (service: string, message: string, originalError?: unknown, context?: ErrorContext) =>
  errorHandler.handleError(new ExternalServiceError(service, message, originalError), context)

export const handleBusinessLogicError = (message: string, details?: any, context?: ErrorContext) =>
  errorHandler.handleError(new BusinessLogicError(message, details), context)

export const handleTenantError = (message?: string, context?: ErrorContext) =>
  errorHandler.handleError(new TenantError(message), context)

export const handleError = (error: unknown, context?: ErrorContext, type?: ErrorType) =>
  errorHandler.handleError(error, context, type)
