/**
 * Standardized Error Handling Test Utilities
 * Provides consistent error testing patterns across the test suite
 */

import { expect } from 'vitest'

/**
 * Standard error types used in tests
 */
export enum TestErrorType {
  VALIDATION = 'ValidationError',
  AUTHENTICATION = 'AuthenticationError',
  AUTHORIZATION = 'AuthorizationError',
  NOT_FOUND = 'NotFoundError',
  CONFLICT = 'ConflictError',
  RATE_LIMIT = 'RateLimitError',
  INTERNAL = 'InternalError'
}

/**
 * Standard error messages for consistent testing
 */
export const TestErrorMessages = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden: Insufficient permissions',
  NOT_FOUND: 'Resource not found',
  VALIDATION_FAILED: 'Validation failed',
  RATE_LIMITED: 'Rate limit exceeded',
  TENANT_MISMATCH: 'Unauthorized: Cannot access resource from different tenant',
  MISSING_REQUIRED_FIELD: (field: string) => `${field} is required`,
  INVALID_FORMAT: (field: string) => `Invalid ${field} format`,
  DUPLICATE_ENTRY: (resource: string) => `${resource} already exists`
}

/**
 * Test helper for async functions that should throw
 */
export async function expectAsyncError(
  asyncFn: () => Promise<any>,
  expectedError: string | RegExp
) {
  await expect(asyncFn()).rejects.toThrow(expectedError)
}

/**
 * Test helper for sync functions that should throw
 */
export function expectSyncError(
  syncFn: () => any,
  expectedError: string | RegExp
) {
  expect(syncFn).toThrow(expectedError)
}

/**
 * Creates a standardized error object for testing
 */
export function createTestError(
  type: TestErrorType,
  message: string,
  statusCode?: number
) {
  const error = new Error(message)
  error.name = type
  if (statusCode) {
    (error as any).statusCode = statusCode
  }
  return error
}

/**
 * Validates error response structure
 */
export function validateErrorResponse(
  response: any,
  expectedStatus: number,
  expectedMessage?: string | RegExp
) {
  expect(response.status).toBe(expectedStatus)
  
  if (expectedMessage) {
    if (typeof expectedMessage === 'string') {
      expect(response.error).toBe(expectedMessage)
    } else {
      expect(response.error).toMatch(expectedMessage)
    }
  }
}

/**
 * Mock error handler for consistent error responses
 */
export function createMockErrorHandler() {
  return {
    handleError: (error: Error) => {
      if (error.name === TestErrorType.VALIDATION) {
        return { status: 400, error: error.message }
      }
      if (error.name === TestErrorType.AUTHENTICATION) {
        return { status: 401, error: error.message }
      }
      if (error.name === TestErrorType.AUTHORIZATION) {
        return { status: 403, error: error.message }
      }
      if (error.name === TestErrorType.NOT_FOUND) {
        return { status: 404, error: error.message }
      }
      if (error.name === TestErrorType.CONFLICT) {
        return { status: 409, error: error.message }
      }
      if (error.name === TestErrorType.RATE_LIMIT) {
        return { status: 429, error: error.message }
      }
      return { status: 500, error: 'Internal server error' }
    }
  }
}