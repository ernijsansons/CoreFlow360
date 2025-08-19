/**
 * CoreFlow360 - Base Error Classes
 * Consistent error handling across the application
 */

// Base application error class
export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly details?: unknown
  public readonly isOperational: boolean

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: unknown,
    isOperational: boolean = true
  ) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.code = code
    this.details = details
    this.isOperational = isOperational

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor)
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack }),
    }
  }
}

// Validation error (400)
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details)
  }
}

// Authentication error (401)
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
  }
}

// Authorization error (403)
export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR')
  }
}

// Not found error (404)
export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`
    super(message, 404, 'NOT_FOUND')
  }
}

// Conflict error (409)
export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 409, 'CONFLICT_ERROR', details)
  }
}

// Rate limit error (429)
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests', retryAfter?: number) {
    super(message, 429, 'RATE_LIMIT_ERROR', { retryAfter })
  }
}

// Database error
export class DatabaseError extends AppError {
  constructor(message: string, originalError?: unknown) {
    super(
      message,
      500,
      'DATABASE_ERROR',
      originalError,
      false // Database errors are not operational
    )
  }
}

// External service error
export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, originalError?: unknown) {
    super(`${service} error: ${message}`, 502, 'EXTERNAL_SERVICE_ERROR', { service, originalError })
  }
}

// Business logic error
export class BusinessLogicError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 422, 'BUSINESS_LOGIC_ERROR', details)
  }
}

// Tenant error
export class TenantError extends AppError {
  constructor(message: string = 'Invalid tenant') {
    super(message, 403, 'TENANT_ERROR')
  }
}
