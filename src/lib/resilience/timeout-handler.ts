/**
 * CoreFlow360 - Request Timeout and Retry Handler
 * Handles timeouts, retries, and request cancellation
 */

export interface TimeoutConfig {
  timeout: number // Timeout in milliseconds
  retries: number // Number of retry attempts
  retryDelay: number // Base delay between retries in ms
  exponentialBackoff: boolean // Use exponential backoff
  maxRetryDelay: number // Maximum delay between retries
  retryCondition?: (error: Error) => boolean // Custom retry condition
}

export interface TimeoutError extends Error {
  name: 'TimeoutError'
  timeout: number
  operation: string
}

export interface RetryableError extends Error {
  name: 'RetryableError'
  attempt: number
  maxAttempts: number
  lastError: Error
}

/**
 * Default timeout configurations for different operation types
 */
export const timeoutConfigs = {
  database: {
    timeout: 30000, // 30 seconds
    retries: 3,
    retryDelay: 1000,
    exponentialBackoff: true,
    maxRetryDelay: 10000,
    retryCondition: (error: Error) =>
      error.message.toLowerCase().includes('connection') ||
      error.message.toLowerCase().includes('timeout') ||
      error.message.toLowerCase().includes('pool'),
  },

  external_api: {
    timeout: 15000, // 15 seconds
    retries: 3,
    retryDelay: 2000,
    exponentialBackoff: true,
    maxRetryDelay: 30000,
    retryCondition: (error: Error) => {
      // Retry on network errors and 5xx status codes
      const message = error.message.toLowerCase()
      return (
        message.includes('fetch') ||
        message.includes('network') ||
        message.includes('timeout') ||
        message.includes('5')
      ) // 5xx status codes
    },
  },

  payment: {
    timeout: 45000, // 45 seconds for payment operations
    retries: 2,
    retryDelay: 5000,
    exponentialBackoff: true,
    maxRetryDelay: 30000,
    retryCondition: (error: Error) => {
      const message = error.message.toLowerCase()
      return (
        message.includes('network') ||
        message.includes('timeout') ||
        message.includes('connection') ||
        message.includes('temporary')
      )
    },
  },

  ai_request: {
    timeout: 60000, // 60 seconds for AI requests
    retries: 2,
    retryDelay: 3000,
    exponentialBackoff: true,
    maxRetryDelay: 20000,
    retryCondition: (error: Error) => {
      const message = error.message.toLowerCase()
      return (
        message.includes('rate_limit') ||
        message.includes('service_unavailable') ||
        message.includes('timeout') ||
        message.includes('overloaded')
      )
    },
  },

  file_upload: {
    timeout: 120000, // 2 minutes for file uploads
    retries: 1,
    retryDelay: 5000,
    exponentialBackoff: false,
    maxRetryDelay: 5000,
    retryCondition: (error: Error) =>
      error.message.toLowerCase().includes('network') ||
      error.message.toLowerCase().includes('connection'),
  },
} as const

/**
 * Create a timeout error
 */
function createTimeoutError(timeout: number, operation: string): TimeoutError {
  const error = new Error(`Operation '${operation}' timed out after ${timeout}ms`) as TimeoutError
  error.name = 'TimeoutError'
  error.timeout = timeout
  error.operation = operation
  return error
}

/**
 * Create a retryable error
 */
function createRetryableError(
  attempt: number,
  maxAttempts: number,
  lastError: Error
): RetryableError {
  const error = new Error(
    `Operation failed after ${attempt}/${maxAttempts} attempts: ${lastError.message}`
  ) as RetryableError
  error.name = 'RetryableError'
  error.attempt = attempt
  error.maxAttempts = maxAttempts
  error.lastError = lastError
  return error
}

/**
 * Execute operation with timeout
 */
export async function withTimeout<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  timeout: number,
  operationName: string = 'operation'
): Promise<T> {
  const controller = new AbortController()

  const timeoutId = setTimeout(() => {
    controller.abort()
  }, timeout)

  try {
    const result = await operation(controller.signal)
    clearTimeout(timeoutId)
    return result
  } catch (error) {
    clearTimeout(timeoutId)

    if (controller.signal.aborted) {
      throw createTimeoutError(timeout, operationName)
    }
    throw error
  }
}

/**
 * Execute operation with retries and exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: TimeoutConfig,
  operationName: string = 'operation'
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= config.retries + 1; attempt++) {
    try {
      return await withTimeout((signal) => operation(), config.timeout, operationName)
    } catch (error) {
      lastError = error as Error

      // Don't retry on the last attempt
      if (attempt === config.retries + 1) {
        break
      }

      // Check if error is retryable
      if (config.retryCondition && !config.retryCondition(lastError)) {
        break
      }

      // Calculate delay
      let delay = config.retryDelay
      if (config.exponentialBackoff) {
        delay = Math.min(config.retryDelay * Math.pow(2, attempt - 1), config.maxRetryDelay)
      }

      // Add jitter to prevent thundering herd
      delay = delay + Math.random() * 1000

      console.warn(
        `Retrying operation '${operationName}' (attempt ${attempt}/${config.retries + 1}) after ${delay}ms:`,
        lastError?.message
      )

      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw createRetryableError(config.retries + 1, config.retries + 1, lastError!)
}

/**
 * HTTP request wrapper with timeout and retry
 */
export async function resilientFetch(
  url: string,
  init: RequestInit = {},
  config: TimeoutConfig = timeoutConfigs.external_api,
  operationName: string = 'fetch'
): Promise<Response> {
  return withRetry(
    async () => {
      const response = await withTimeout(
        (signal) => fetch(url, { ...init, signal }),
        config.timeout,
        operationName
      )

      // Check for HTTP errors
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
        // Add response body for debugging
        try {
          const body = await response.text()
          error.message += ` - ${body.substring(0, 200)}`
        } catch {
          // Ignore if can't read response body
        }
        throw error
      }

      return response
    },
    config,
    operationName
  )
}

/**
 * Database operation wrapper with timeout and retry
 */
export async function resilientDbOperation<T>(
  operation: () => Promise<T>,
  operationName: string = 'database_operation'
): Promise<T> {
  return withRetry(operation, timeoutConfigs.database, operationName)
}

/**
 * External API call wrapper
 */
export async function resilientApiCall<T>(
  operation: () => Promise<T>,
  operationName: string = 'api_call'
): Promise<T> {
  return withRetry(operation, timeoutConfigs.external_api, operationName)
}

/**
 * Payment operation wrapper
 */
export async function resilientPaymentOperation<T>(
  operation: () => Promise<T>,
  operationName: string = 'payment_operation'
): Promise<T> {
  return withRetry(operation, timeoutConfigs.payment, operationName)
}

/**
 * AI request wrapper
 */
export async function resilientAiRequest<T>(
  operation: () => Promise<T>,
  operationName: string = 'ai_request'
): Promise<T> {
  return withRetry(operation, timeoutConfigs.ai_request, operationName)
}

/**
 * File upload wrapper
 */
export async function resilientFileUpload<T>(
  operation: () => Promise<T>,
  operationName: string = 'file_upload'
): Promise<T> {
  return withRetry(operation, timeoutConfigs.file_upload, operationName)
}

/**
 * Decorator for adding timeout and retry to methods
 */
export function withTimeoutAndRetry(
  configType: keyof typeof timeoutConfigs,
  operationName?: string
) {
  return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const opName = operationName || `${target.constructor.name}.${propertyKey}`

    descriptor.value = async function (...args: unknown[]) {
      return withRetry(() => originalMethod.apply(this, args), timeoutConfigs[configType], opName)
    }

    return descriptor
  }
}

/**
 * Promise race with timeout
 */
export async function raceWithTimeout<T>(
  promise: Promise<T>,
  timeout: number,
  operationName: string = 'operation'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(createTimeoutError(timeout, operationName)), timeout)
    ),
  ])
}

/**
 * Batch operations with individual timeouts
 */
export async function batchWithTimeout<T>(
  operations: Array<() => Promise<T>>,
  timeout: number,
  operationName: string = 'batch_operation'
): Promise<Array<T | Error>> {
  const promises = operations.map((operation, index) =>
    withTimeout((signal) => operation(), timeout, `${operationName}_${index}`).catch(
      (error) => error
    )
  )

  return Promise.all(promises)
}

/**
 * Execute with deadline (absolute timeout)
 */
export async function withDeadline<T>(
  operation: () => Promise<T>,
  deadline: Date,
  operationName: string = 'operation'
): Promise<T> {
  const remaining = deadline.getTime() - Date.now()

  if (remaining <= 0) {
    throw createTimeoutError(0, operationName)
  }

  return withTimeout((signal) => operation(), remaining, operationName)
}
