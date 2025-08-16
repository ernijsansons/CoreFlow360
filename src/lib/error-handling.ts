/**
 * CoreFlow360 - Standardized Error Handling
 * Consistent error handling patterns across all API components
 */

export interface ApiError {
  message: string
  code?: string
  statusCode?: number
  isNetworkError?: boolean
  timestamp: string
}

export interface ErrorHandlingOptions {
  fallbackData?: any
  retryAttempts?: number
  retryDelay?: number
  showUserError?: boolean
  logError?: boolean
}

/**
 * Standardized API error handler
 */
export class ApiErrorHandler {
  static createError(
    error: unknown,
    context?: string,
    statusCode?: number
  ): ApiError {
    const timestamp = new Date().toISOString()
    
    if (error instanceof Response) {
      return {
        message: `API request failed: ${error.status} ${error.statusText}`,
        code: 'API_ERROR',
        statusCode: error.status,
        isNetworkError: false,
        timestamp
      }
    }
    
    if (error instanceof Error) {
      const isNetworkError = 
        error.message.includes('fetch') ||
        error.message.includes('network') ||
        error.message.includes('Failed to fetch')
        
      return {
        message: context ? `${context}: ${error.message}` : error.message,
        code: 'CLIENT_ERROR',
        statusCode: statusCode || 500,
        isNetworkError,
        timestamp
      }
    }
    
    return {
      message: context ? `${context}: Unknown error` : 'Unknown error occurred',
      code: 'UNKNOWN_ERROR',
      statusCode: statusCode || 500,
      isNetworkError: false,
      timestamp
    }
  }

  static async handleApiCall<T>(
    apiCall: () => Promise<T>,
    options: ErrorHandlingOptions = {}
  ): Promise<{ data: T | null; error: ApiError | null }> {
    const {
      fallbackData = null,
      retryAttempts = 0,
      retryDelay = 1000,
      logError = true
    } = options

    let lastError: ApiError | null = null
    
    for (let attempt = 0; attempt <= retryAttempts; attempt++) {
      try {
        const data = await apiCall()
        return { data, error: null }
      } catch (error) {
        lastError = this.createError(error, 'API call failed')
        
        if (logError) {
          console.error(`API call attempt ${attempt + 1} failed:`, lastError)
        }
        
        // If not the last attempt, wait before retrying
        if (attempt < retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)))
        }
      }
    }
    
    return { data: fallbackData, error: lastError }
  }

  static getErrorMessage(error: ApiError): string {
    if (error.isNetworkError) {
      return 'Network connection issue. Please check your internet connection.'
    }
    
    if (error.statusCode === 401) {
      return 'Authentication required. Please log in again.'
    }
    
    if (error.statusCode === 403) {
      return 'You do not have permission to perform this action.'
    }
    
    if (error.statusCode === 404) {
      return 'The requested resource was not found.'
    }
    
    if (error.statusCode === 429) {
      return 'Too many requests. Please try again in a moment.'
    }
    
    if (error.statusCode && error.statusCode >= 500) {
      return 'Server error. Please try again later.'
    }
    
    return error.message || 'An unexpected error occurred.'
  }

  static isRetryableError(error: ApiError): boolean {
    // Retry on network errors and 5xx server errors
    return error.isNetworkError || (error.statusCode && error.statusCode >= 500)
  }
}

/**
 * React hook for API error handling
 */
export function useApiErrorHandler() {
  const handleError = (error: ApiError) => {
    // You could integrate with toast notifications, error reporting services, etc.
    console.error('API Error:', error)
    
    // Example: Track error with analytics service
    // analytics.track('api_error', {
    //   code: error.code,
    //   message: error.message,
    //   statusCode: error.statusCode
    // })
  }

  return { handleError, getErrorMessage: ApiErrorHandler.getErrorMessage }
}

/**
 * Standardized fetch wrapper with error handling
 */
export async function apiRequest<T>(
  url: string,
  options: RequestInit & ErrorHandlingOptions = {}
): Promise<{ data: T | null; error: ApiError | null }> {
  const {
    fallbackData = null,
    retryAttempts = 1,
    retryDelay = 1000,
    logError = true,
    ...fetchOptions
  } = options

  return ApiErrorHandler.handleApiCall(async () => {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers
      }
    })

    if (!response.ok) {
      throw response
    }

    const data = await response.json()
    return data as T
  }, { fallbackData, retryAttempts, retryDelay, logError })
}

/**
 * Error boundary hook for React components
 */
export function useErrorBoundary() {
  return (error: unknown, context?: string) => {
    const apiError = ApiErrorHandler.createError(error, context)
    console.error('Component Error:', apiError)
    
    // You could integrate with error reporting services here
    // errorReporting.captureException(error, { context, ...apiError })
    
    return apiError
  }
}

/**
 * Common error handling patterns for specific scenarios
 */
export const ErrorPatterns = {
  // For freemium API calls
  freemiumApi: {
    retryAttempts: 2,
    retryDelay: 500,
    fallbackData: {
      subscriptionStatus: 'FREE',
      selectedAgent: 'crm',
      dailyUsageCount: 0,
      dailyLimit: 10
    }
  },

  // For live metrics API calls
  liveMetrics: {
    retryAttempts: 1,
    retryDelay: 1000,
    fallbackData: {
      responseTime: 45,
      activeUsers: 1247,
      successRate: 98.5,
      aiProcessesPerSecond: 180
    }
  },

  // For conversion tracking (fire-and-forget)
  conversionTracking: {
    retryAttempts: 0,
    retryDelay: 0,
    logError: false // Don't spam logs for non-critical tracking
  },

  // For onboarding APIs
  onboarding: {
    retryAttempts: 1,
    retryDelay: 1000,
    fallbackData: null
  }
}