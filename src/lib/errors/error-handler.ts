/**
 * CoreFlow360 - Global Error Handler
 * Centralized error handling with logging and monitoring
 */

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DatabaseError,
  ExternalServiceError,
} from './base-error'

// Error context for enhanced logging
export interface ErrorContext {
  userId?: string
  tenantId?: string
  endpoint?: string
  method?: string
  ip?: string
  userAgent?: string
  requestId?: string
  [key: string]: unknown
}

// Error response format
interface ErrorResponse {
  error: {
    message: string
    code: string
    statusCode: number
    details?: unknown
    requestId?: string
    timestamp: string
  }
}

// Generate correlation ID for tracking
function generateCorrelationId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Log error with context
function logError(error: Error, context?: ErrorContext): string {
  const correlationId = generateCorrelationId()

  // In production, this would go to a logging service
  console.error({
    correlationId,
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error instanceof AppError && { code: error.code, details: error.details }),
    },
    context,
    environment: process.env.NODE_ENV,
  })

  return correlationId
}

// Main error handler
export function handleError(error: unknown, context?: ErrorContext): NextResponse<ErrorResponse> {
  const correlationId = logError(error as Error, context)

  // Handle known error types
  if (error instanceof AppError) {
    return NextResponse.json<ErrorResponse>(
      {
        error: {
          message: error.message,
          code: error.code,
          statusCode: error.statusCode,
          details: error.details,
          requestId: correlationId,
          timestamp: new Date().toISOString(),
        },
      },
      { status: error.statusCode }
    )
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const formattedErrors = error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }))

    return NextResponse.json<ErrorResponse>(
      {
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          statusCode: 400,
          details: { errors: formattedErrors },
          requestId: correlationId,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 400 }
    )
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    let message = 'Database operation failed'
    let statusCode = 500

    switch (error.code) {
      case 'P2002':
        message = 'A unique constraint violation occurred'
        statusCode = 409
        break
      case 'P2025':
        message = 'Record not found'
        statusCode = 404
        break
      case 'P2003':
        message = 'Foreign key constraint violation'
        statusCode = 409
        break
      case 'P2014':
        message = 'Invalid relation data'
        statusCode = 400
        break
    }

    return NextResponse.json<ErrorResponse>(
      {
        error: {
          message,
          code: 'DATABASE_ERROR',
          statusCode,
          details: process.env.NODE_ENV === 'development' ? { prismaCode: error.code } : undefined,
          requestId: correlationId,
          timestamp: new Date().toISOString(),
        },
      },
      { status: statusCode }
    )
  }

  // Handle unknown errors
  const message =
    process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : (error as Error).message || 'Unknown error'

  return NextResponse.json<ErrorResponse>(
    {
      error: {
        message,
        code: 'INTERNAL_ERROR',
        statusCode: 500,
        requestId: correlationId,
        timestamp: new Date().toISOString(),
      },
    },
    { status: 500 }
  )
}

// Specific error handler helpers
export function handleValidationError(
  error: ZodError | string,
  context?: ErrorContext
): NextResponse<ErrorResponse> {
  if (typeof error === 'string') {
    return handleError(new ValidationError(error), context)
  }
  return handleError(error, context)
}

export function handleAuthError(
  message?: string,
  context?: ErrorContext
): NextResponse<ErrorResponse> {
  return handleError(new AuthenticationError(message), context)
}

export function handleAuthorizationError(
  message?: string,
  context?: ErrorContext
): NextResponse<ErrorResponse> {
  return handleError(new AuthorizationError(message), context)
}

export function handleNotFoundError(
  resource: string,
  identifier?: string,
  context?: ErrorContext
): NextResponse<ErrorResponse> {
  return handleError(new NotFoundError(resource, identifier), context)
}

export function handleDatabaseError(
  message: string,
  originalError?: unknown,
  context?: ErrorContext
): NextResponse<ErrorResponse> {
  return handleError(new DatabaseError(message, originalError), context)
}

export function handleExternalServiceError(
  service: string,
  message: string,
  originalError?: unknown,
  context?: ErrorContext
): NextResponse<ErrorResponse> {
  return handleError(new ExternalServiceError(service, message, originalError), context)
}

// Error boundary for async operations
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: ErrorContext
): Promise<T | NextResponse<ErrorResponse>> {
  try {
    return await operation()
  } catch (error) {
    return handleError(error, context)
  }
}
