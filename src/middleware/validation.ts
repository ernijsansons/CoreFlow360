/**
 * CoreFlow360 - API Validation Middleware
 * Request validation using Zod schemas
 */

import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import { errorResponseSchema } from '@/lib/validation/api-schemas'

export interface ValidationConfig {
  body?: z.ZodType
  query?: z.ZodType
  params?: z.ZodType
  headers?: z.ZodType
}

/**
 * Validation middleware factory
 */
export function validateRequest(config: ValidationConfig) {
  return async function validationMiddleware(
    request: NextRequest,
    context?: any
  ): Promise<NextResponse | null> {
    const errors: Array<{ field: string; message: string }> = []

    try {
      // Validate query parameters
      if (config.query) {
        const searchParams = Object.fromEntries(request.nextUrl.searchParams)
        try {
          config.query.parse(searchParams)
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(...formatZodErrors(error, 'query'))
          }
        }
      }

      // Validate request body
      if (config.body) {
        try {
          const body = await request.json()
          config.body.parse(body)
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(...formatZodErrors(error, 'body'))
          } else {
            errors.push({
              field: 'body',
              message: 'Invalid JSON body'
            })
          }
        }
      }

      // Validate route params
      if (config.params && context?.params) {
        try {
          config.params.parse(context.params)
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(...formatZodErrors(error, 'params'))
          }
        }
      }

      // Validate headers
      if (config.headers) {
        const headers = Object.fromEntries(request.headers)
        try {
          config.headers.parse(headers)
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(...formatZodErrors(error, 'headers'))
          }
        }
      }

      // If there are validation errors, return error response
      if (errors.length > 0) {
        const errorResponse = {
          error: 'Validation failed',
          message: 'Invalid request data',
          code: 'VALIDATION_ERROR',
          statusCode: 400,
          details: errors
        }

        return NextResponse.json(errorResponse, { status: 400 })
      }

      // No errors, continue to handler
      return null

    } catch (error) {
      console.error('Validation middleware error:', error)
      
      return NextResponse.json({
        error: 'Internal validation error',
        message: 'Failed to validate request',
        code: 'INTERNAL_ERROR',
        statusCode: 500
      }, { status: 500 })
    }
  }
}

/**
 * Format Zod errors for response
 */
function formatZodErrors(
  error: ZodError,
  prefix: string = ''
): Array<{ field: string; message: string }> {
  return error.errors.map(err => ({
    field: prefix ? `${prefix}.${err.path.join('.')}` : err.path.join('.'),
    message: err.message
  }))
}

/**
 * Wrapper for route handlers with validation
 */
export function withValidation<T extends (...args: any[]) => Promise<NextResponse>>(
  config: ValidationConfig,
  handler: T
): T {
  return (async (request: NextRequest, context?: any) => {
    const validationError = await validateRequest(config)(request, context)
    
    if (validationError) {
      return validationError
    }

    return handler(request, context)
  }) as T
}

/**
 * Parse and validate request data
 */
export async function parseValidatedData<T>(
  request: NextRequest,
  schema: z.ZodType<T>
): Promise<{ data: T | null; error: NextResponse | null }> {
  try {
    const body = await request.json()
    const data = schema.parse(body)
    return { data, error: null }
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = formatZodErrors(error, 'body')
      const errorResponse = NextResponse.json({
        error: 'Validation failed',
        message: 'Invalid request data',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        details: errors
      }, { status: 400 })
      
      return { data: null, error: errorResponse }
    }

    const errorResponse = NextResponse.json({
      error: 'Bad request',
      message: 'Invalid JSON body',
      code: 'INVALID_JSON',
      statusCode: 400
    }, { status: 400 })
    
    return { data: null, error: errorResponse }
  }
}

/**
 * Validate query parameters
 */
export function validateQueryParams<T>(
  request: NextRequest,
  schema: z.ZodType<T>
): { data: T | null; error: NextResponse | null } {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams)
    const data = schema.parse(searchParams)
    return { data, error: null }
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = formatZodErrors(error, 'query')
      const errorResponse = NextResponse.json({
        error: 'Invalid query parameters',
        message: 'Query validation failed',
        code: 'INVALID_QUERY',
        statusCode: 400,
        details: errors
      }, { status: 400 })
      
      return { data: null, error: errorResponse }
    }

    const errorResponse = NextResponse.json({
      error: 'Bad request',
      message: 'Invalid query parameters',
      code: 'BAD_REQUEST',
      statusCode: 400
    }, { status: 400 })
    
    return { data: null, error: errorResponse }
  }
}

/**
 * Combine multiple validators
 */
export function combineValidators(...validators: ValidationConfig[]): ValidationConfig {
  return validators.reduce((acc, validator) => ({
    body: validator.body || acc.body,
    query: validator.query || acc.query,
    params: validator.params || acc.params,
    headers: validator.headers || acc.headers
  }), {})
}

/**
 * Common validation patterns
 */
export const commonValidators = {
  // Require authentication headers
  authenticated: {
    headers: z.object({
      authorization: z.string().startsWith('Bearer '),
      'x-tenant-id': z.string().optional()
    })
  },

  // Pagination query params
  paginated: {
    query: z.object({
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(100).default(20),
      sortBy: z.string().optional(),
      sortOrder: z.enum(['asc', 'desc']).optional()
    })
  },

  // Tenant context
  tenantScoped: {
    headers: z.object({
      'x-tenant-id': z.string().min(1)
    })
  }
}