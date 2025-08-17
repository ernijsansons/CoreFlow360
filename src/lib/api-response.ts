/**
 * CoreFlow360 - Standardized API Response Helpers
 * Ensures consistent response format across all API endpoints
 */

import { NextResponse } from 'next/server'
import { AppError } from './errors/base-error'

export interface StandardApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    type: string
    message: string
    code: string
    details?: any
    requestId?: string
  }
  meta?: {
    page?: number
    limit?: number
    totalCount?: number
    totalPages?: number
    hasNext?: boolean
    hasPrev?: boolean
  }
  timestamp: string
}

/**
 * Create a successful API response
 */
export function successResponse<T>(
  data: T,
  meta?: any,
  status: number = 200
): NextResponse<StandardApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    meta,
    timestamp: new Date().toISOString()
  }, { status })
}

/**
 * Create an error API response
 */
export function errorResponse(
  error: AppError | Error | string,
  requestId?: string,
  status?: number
): NextResponse<StandardApiResponse<never>> {
  let errorData: StandardApiResponse<never>['error']
  let statusCode = status || 500

  if (error instanceof AppError) {
    errorData = {
      type: error.code,
      message: error.message,
      code: error.code,
      details: error.details,
      requestId
    }
    statusCode = status || error.statusCode
  } else if (error instanceof Error) {
    errorData = {
      type: 'INTERNAL_ERROR',
      message: error.message,
      code: 'INTERNAL_ERROR',
      requestId
    }
  } else {
    errorData = {
      type: 'UNKNOWN_ERROR',
      message: String(error),
      code: 'UNKNOWN_ERROR',
      requestId
    }
  }

  return NextResponse.json({
    success: false,
    error: errorData,
    timestamp: new Date().toISOString()
  }, { status: statusCode })
}

/**
 * Create a paginated successful response
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: {
    page: number
    limit: number
    totalCount: number
  },
  additionalMeta?: any
): NextResponse<StandardApiResponse<T[]>> {
  const totalPages = Math.ceil(pagination.totalCount / pagination.limit)
  
  return successResponse(data, {
    ...additionalMeta,
    page: pagination.page,
    limit: pagination.limit,
    totalCount: pagination.totalCount,
    totalPages,
    hasNext: pagination.page < totalPages,
    hasPrev: pagination.page > 1
  })
}

/**
 * Create a created resource response (201)
 */
export function createdResponse<T>(
  data: T,
  message?: string
): NextResponse<StandardApiResponse<T>> {
  return successResponse(data, { message: message || 'Resource created successfully' }, 201)
}

/**
 * Create a no content response (204)
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 })
}

/**
 * Create a validation error response
 */
export function validationErrorResponse(
  errors: any,
  message: string = 'Validation failed'
): NextResponse<StandardApiResponse<never>> {
  return NextResponse.json({
    success: false,
    error: {
      type: 'VALIDATION_ERROR',
      message,
      code: 'VALIDATION_ERROR',
      details: errors
    },
    timestamp: new Date().toISOString()
  }, { status: 400 })
}

/**
 * Create an authentication error response
 */
export function authErrorResponse(
  message: string = 'Authentication required'
): NextResponse<StandardApiResponse<never>> {
  return NextResponse.json({
    success: false,
    error: {
      type: 'AUTHENTICATION_ERROR',
      message,
      code: 'AUTH_REQUIRED'
    },
    timestamp: new Date().toISOString()
  }, { status: 401 })
}

/**
 * Create an authorization error response
 */
export function forbiddenResponse(
  message: string = 'Access forbidden'
): NextResponse<StandardApiResponse<never>> {
  return NextResponse.json({
    success: false,
    error: {
      type: 'AUTHORIZATION_ERROR',
      message,
      code: 'FORBIDDEN'
    },
    timestamp: new Date().toISOString()
  }, { status: 403 })
}

/**
 * Create a not found error response
 */
export function notFoundResponse(
  resource: string = 'Resource'
): NextResponse<StandardApiResponse<never>> {
  return NextResponse.json({
    success: false,
    error: {
      type: 'NOT_FOUND_ERROR',
      message: `${resource} not found`,
      code: 'NOT_FOUND'
    },
    timestamp: new Date().toISOString()
  }, { status: 404 })
}

/**
 * Create a rate limit error response
 */
export function rateLimitResponse(
  retryAfter?: number
): NextResponse<StandardApiResponse<never>> {
  const headers = new Headers()
  if (retryAfter) {
    headers.set('Retry-After', String(retryAfter))
  }

  return NextResponse.json({
    success: false,
    error: {
      type: 'RATE_LIMIT_ERROR',
      message: 'Too many requests',
      code: 'RATE_LIMITED',
      details: { retryAfter }
    },
    timestamp: new Date().toISOString()
  }, { status: 429, headers })
}

/**
 * Grouped API response methods for convenient access
 */
export const api = {
  success: successResponse,
  error: errorResponse,
  paginated: paginatedResponse,
  created: createdResponse,
  noContent: noContentResponse,
  validationError: validationErrorResponse,
  unauthorized: authErrorResponse,
  forbidden: forbiddenResponse,
  notFound: notFoundResponse,
  rateLimit: rateLimitResponse
}