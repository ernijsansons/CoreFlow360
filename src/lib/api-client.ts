/**
 * CoreFlow360 - API Client with CSRF Protection
 * Centralized fetch wrapper with authentication, CSRF protection, and error handling
 */

import { ClientCSRF } from '@/lib/csrf-client'

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: any
  params?: Record<string, any>
  timeout?: number
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    type: string
    message: string
    code: string
    details?: any
    requestId?: string
  }
  meta?: any
  timestamp: string
}

/**
 * Enhanced fetch wrapper with CSRF protection, error handling, and request cancellation
 */
export async function apiFetch<T = any>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const controller = new AbortController()
  const { body, params, timeout = 30000, ...fetchOptions } = options

  // Add query parameters
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString
    }
  }

  // Set up timeout
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    // Prepare headers with CSRF protection
    const headers = ClientCSRF.addToHeaders({
      'Content-Type': 'application/json',
      ...fetchOptions.headers
    })

    // Prepare request options
    const requestOptions: RequestInit = {
      ...fetchOptions,
      headers,
      signal: controller.signal,
      credentials: 'include' // Include cookies for auth
    }

    // Add body if present
    if (body !== undefined) {
      requestOptions.body = JSON.stringify(body)
    }

    // Make the request
    const response = await fetch(url, requestOptions)
    clearTimeout(timeoutId)

    // Parse response
    const responseData = await response.json()

    // Handle non-2xx responses
    if (!response.ok) {
      // Emit auth error event for 401 responses
      if (response.status === 401) {
        window.dispatchEvent(new CustomEvent('auth:error', {
          detail: { statusCode: 401, url }
        }))
      }
      
      // Check if response follows our standard error format
      if (responseData.error) {
        throw new ApiError(
          responseData.error.message || 'Request failed',
          response.status,
          responseData.error.code,
          responseData.error.details
        )
      }
      // Fallback for non-standard error responses
      throw new ApiError(
        responseData.message || responseData.error || 'Request failed',
        response.status,
        'UNKNOWN_ERROR',
        responseData
      )
    }

    // Ensure response follows our standard format
    if (typeof responseData.success === 'boolean') {
      return responseData as ApiResponse<T>
    }

    // Wrap non-standard successful responses
    return {
      success: true,
      data: responseData,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    clearTimeout(timeoutId)

    // Handle abort errors
    if (error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408, 'TIMEOUT_ERROR')
    }

    // Re-throw ApiErrors
    if (error instanceof ApiError) {
      throw error
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError('Network error', 0, 'NETWORK_ERROR')
    }

    // Handle other errors
    throw new ApiError(
      error.message || 'Unknown error occurred',
      500,
      'UNKNOWN_ERROR',
      error
    )
  }
}

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
  get: <T = any>(url: string, options?: ApiRequestOptions) =>
    apiFetch<T>(url, { ...options, method: 'GET' }),

  post: <T = any>(url: string, body?: any, options?: ApiRequestOptions) =>
    apiFetch<T>(url, { ...options, method: 'POST', body }),

  put: <T = any>(url: string, body?: any, options?: ApiRequestOptions) =>
    apiFetch<T>(url, { ...options, method: 'PUT', body }),

  patch: <T = any>(url: string, body?: any, options?: ApiRequestOptions) =>
    apiFetch<T>(url, { ...options, method: 'PATCH', body }),

  delete: <T = any>(url: string, options?: ApiRequestOptions) =>
    apiFetch<T>(url, { ...options, method: 'DELETE' })
}

/**
 * Create a cancellable request
 */
export function createCancellableRequest<T = any>(
  requestFn: () => Promise<T>
): {
  promise: Promise<T>
  cancel: () => void
} {
  const controller = new AbortController()
  
  const wrappedFn = async () => {
    try {
      return await requestFn()
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new ApiError('Request cancelled', 499, 'CANCELLED')
      }
      throw error
    }
  }

  return {
    promise: wrappedFn(),
    cancel: () => controller.abort()
  }
}

/**
 * Retry failed requests with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number
    delay?: number
    backoffMultiplier?: number
    shouldRetry?: (error: any) => boolean
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoffMultiplier = 2,
    shouldRetry = (error) => {
      if (error instanceof ApiError) {
        // Retry on network errors and 5xx errors
        return error.statusCode === 0 || error.statusCode >= 500
      }
      return false
    }
  } = options

  let lastError: any
  let currentDelay = delay

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (attempt === maxAttempts || !shouldRetry(error)) {
        throw error
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, currentDelay))
      currentDelay *= backoffMultiplier
    }
  }

  throw lastError
}