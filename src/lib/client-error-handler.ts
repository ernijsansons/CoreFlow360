/**
 * CoreFlow360 - Client-Side Error Handler
 * Handles errors for client-side API calls and user interactions
 */

'use client'

export interface ApiError {
  success: false
  error: {
    type: string
    code: string
    message: string
    details?: Record<string, unknown>
    timestamp: string
    requestId?: string
  }
  supportInfo?: {
    contactUrl: string
    documentationUrl?: string
  }
}

export interface ErrorToast {
  id: string
  type: 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

class ClientErrorHandler {
  private static instance: ClientErrorHandler
  private errorCallbacks: ((error: ApiError) => void)[] = []
  private toastCallbacks: ((toast: ErrorToast) => void)[] = []

  private constructor() {}

  static getInstance(): ClientErrorHandler {
    if (!ClientErrorHandler.instance) {
      ClientErrorHandler.instance = new ClientErrorHandler()
    }
    return ClientErrorHandler.instance
  }

  /**
   * Handle API response errors
   */
  handleApiError(response: Response, data?: unknown): ApiError | null {
    if (response.ok) return null

    // Try to parse error response
    let errorData: ApiError | null = null
    try {
      if (data && data.error) {
        errorData = data as ApiError
      } else {
        // Create generic error
        errorData = {
          success: false,
          error: {
            type: 'HTTP_ERROR',
            code: `HTTP_${response.status}`,
            message: this.getStatusMessage(response.status),
            timestamp: new Date().toISOString(),
          },
        }
      }
    } catch (e) {
      // Fallback error
      errorData = {
        success: false,
        error: {
          type: 'PARSE_ERROR',
          code: 'RESPONSE_PARSE_FAILED',
          message: 'Failed to parse error response',
          timestamp: new Date().toISOString(),
        },
      }
    }

    // Notify error callbacks
    this.errorCallbacks.forEach((callback) => {
      try {
        callback(errorData!)
      } catch (e) {}
    })

    // Create user-friendly toast
    this.showErrorToast(errorData, response.status)

    return errorData
  }

  /**
   * Handle network/fetch errors
   */
  handleNetworkError(error: Error, url?: string): ApiError {
    const errorData: ApiError = {
      success: false,
      error: {
        type: 'NETWORK_ERROR',
        code: 'NETWORK_FAILED',
        message: 'Network request failed. Please check your connection.',
        details: {
          originalMessage: error.message,
          url,
        },
        timestamp: new Date().toISOString(),
      },
    }

    // Notify error callbacks
    this.errorCallbacks.forEach((callback) => {
      try {
        callback(errorData)
      } catch (e) {}
    })

    // Show network error toast
    this.showErrorToast(errorData, 0)

    return errorData
  }

  /**
   * Handle validation errors from forms
   */
  handleValidationError(errors: Record<string, string[]>): void {
    const errorCount = Object.keys(errors).length
    const toast: ErrorToast = {
      id: `validation-${Date.now()}`,
      type: 'error',
      title: 'Form Validation Failed',
      message: `Please fix ${errorCount} error${errorCount > 1 ? 's' : ''} and try again.`,
      duration: 5000,
    }

    this.showToast(toast)
  }

  /**
   * Show error toast to user
   */
  private showErrorToast(error: ApiError, statusCode: number): void {
    const toast: ErrorToast = {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: this.getToastType(statusCode),
      title: this.getErrorTitle(error.error.type, statusCode),
      message: error.error.message,
      duration: this.getToastDuration(statusCode),
    }

    // Add action for certain error types
    if (statusCode === 401) {
      toast.action = {
        label: 'Sign In',
        onClick: () => (window.location.href = '/login'),
      }
    } else if (statusCode === 402 && error.error.type === 'SUBSCRIPTION_LIMIT') {
      toast.action = {
        label: 'Upgrade',
        onClick: () => (window.location.href = '/pricing'),
      }
    } else if (statusCode >= 500) {
      toast.action = {
        label: 'Retry',
        onClick: () => window.location.reload(),
      }
    }

    this.showToast(toast)
  }

  /**
   * Show toast notification
   */
  private showToast(toast: ErrorToast): void {
    this.toastCallbacks.forEach((callback) => {
      try {
        callback(toast)
      } catch (e) {}
    })

    // Fallback to console if no toast system is connected
    if (this.toastCallbacks.length === 0) {
    }
  }

  /**
   * Register error callback
   */
  onError(callback: (error: ApiError) => void): () => void {
    this.errorCallbacks.push(callback)
    return () => {
      const index = this.errorCallbacks.indexOf(callback)
      if (index > -1) {
        this.errorCallbacks.splice(index, 1)
      }
    }
  }

  /**
   * Register toast callback
   */
  onToast(callback: (toast: ErrorToast) => void): () => void {
    this.toastCallbacks.push(callback)
    return () => {
      const index = this.toastCallbacks.indexOf(callback)
      if (index > -1) {
        this.toastCallbacks.splice(index, 1)
      }
    }
  }

  /**
   * Enhanced fetch wrapper with error handling
   */
  async safeFetch(
    url: string,
    options: RequestInit = {}
  ): Promise<{ data: unknown; error: ApiError | null }> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      let data: unknown = null
      try {
        data = await response.json()
      } catch (e) {
        // Response might not be JSON
        data = await response.text()
      }

      const error = this.handleApiError(response, data)

      return {
        data: error ? null : data,
        error,
      }
    } catch (fetchError) {
      const error = this.handleNetworkError(fetchError as Error, url)
      return {
        data: null,
        error,
      }
    }
  }

  /**
   * Helper methods
   */
  private getStatusMessage(status: number): string {
    const messages: Record<number, string> = {
      400: 'Invalid request. Please check your input.',
      401: 'Authentication required. Please sign in.',
      403: "Access denied. You don't have permission for this action.",
      404: 'The requested resource was not found.',
      409: 'Conflict with existing data.',
      422: 'Invalid data provided.',
      429: 'Too many requests. Please wait and try again.',
      500: 'Internal server error. Please try again later.',
      502: 'Service temporarily unavailable.',
      503: 'Service temporarily unavailable.',
      504: 'Request timeout. Please try again.',
    }

    return messages[status] || 'An unexpected error occurred.'
  }

  private getToastType(statusCode: number): 'error' | 'warning' | 'info' {
    if (statusCode >= 500) return 'error'
    if (statusCode >= 400) return 'warning'
    return 'info'
  }

  private getErrorTitle(errorType: string, statusCode: number): string {
    if (statusCode === 401) return 'Authentication Required'
    if (statusCode === 403) return 'Access Denied'
    if (statusCode === 404) return 'Not Found'
    if (statusCode === 409) return 'Conflict'
    if (statusCode === 429) return 'Rate Limited'
    if (statusCode >= 500) return 'Server Error'

    const titleMap: Record<string, string> = {
      VALIDATION_ERROR: 'Validation Error',
      NETWORK_ERROR: 'Connection Error',
      SUBSCRIPTION_LIMIT: 'Subscription Limit',
      EXTERNAL_SERVICE_ERROR: 'Service Unavailable',
    }

    return titleMap[errorType] || 'Error'
  }

  private getToastDuration(statusCode: number): number {
    if (statusCode >= 500) return 8000 // Server errors stay longer
    if (statusCode === 429) return 6000 // Rate limits
    return 5000 // Default
  }
}

// Export singleton instance
export const clientErrorHandler = ClientErrorHandler.getInstance()

// Convenience hook for React components
export function useErrorHandler() {
  return {
    handleApiError: clientErrorHandler.handleApiError.bind(clientErrorHandler),
    handleNetworkError: clientErrorHandler.handleNetworkError.bind(clientErrorHandler),
    handleValidationError: clientErrorHandler.handleValidationError.bind(clientErrorHandler),
    safeFetch: clientErrorHandler.safeFetch.bind(clientErrorHandler),
    onError: clientErrorHandler.onError.bind(clientErrorHandler),
    onToast: clientErrorHandler.onToast.bind(clientErrorHandler),
  }
}

// Enhanced fetch function with error handling
export const safeFetch = clientErrorHandler.safeFetch.bind(clientErrorHandler)
