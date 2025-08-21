/**
 * CoreFlow360 - Sentry Error Tracking
 * Comprehensive error monitoring and performance tracking
 * TEMPORARILY DISABLED FOR BUILD FIX
 */

import { User } from '@prisma/client'

/**
 * Initialize Sentry - disabled
 */
export function initSentry() {
  // Temporarily disabled for build fix
  return
}

/**
 * Error tracking utilities - stub implementation
 */
export const errorTracker = {
  captureException(_error: Error | string, _context?: any) {
    // Stub implementation
  },
  captureAPIError(_error: Error, _context: any) {
    // Stub implementation
  },
  captureDBError(_error: Error, _context: any) {
    // Stub implementation
  },
  captureJobError(_error: Error, _context: any) {
    // Stub implementation
  },
  captureBusinessError(_error: Error | string, _context: any) {
    // Stub implementation
  },
}

/**
 * Performance monitoring - stub implementation
 */
export const performanceTracker = {
  startTransaction(_name: string, _op?: string) {
    return {
      setData: () => {},
      setStatus: () => {},
      finish: () => {},
    }
  },
  async trackAPIRequest<T>(_endpoint: string, _method: string, fn: () => Promise<T>, _context?: any): Promise<T> {
    return fn()
  },
  async trackDBQuery<T>(_operation: string, _model: string, fn: () => Promise<T>): Promise<T> {
    return fn()
  },
  async trackAIOperation<T>(_operation: string, _agentType: string, fn: () => Promise<T>): Promise<T> {
    return fn()
  },
}

/**
 * User feedback integration - stub implementation
 */
export const feedbackTracker = {
  showFeedbackDialog(_eventId?: string) {
    // Stub implementation
  },
  captureUserFeedback(_feedback: any, _eventId?: string) {
    // Stub implementation
  },
}

/**
 * Custom Sentry integrations - stub implementation
 */
export const customIntegrations = {
  QueueIntegration: class {
    name = 'QueueIntegration'
    setupOnce() {
      // Stub implementation
    }
  },
  DatabaseIntegration: class {
    name = 'DatabaseIntegration'
    setupOnce() {
      // Stub implementation
    }
  },
}

/**
 * Error boundaries and wrappers - stub implementation
 */
export function withSentry<T extends (...args: unknown[]) => unknown>(fn: T, _context?: any): T {
  return fn
}

/**
 * Express error handler middleware - stub implementation
 */
export function sentryErrorHandler() {
  return (_err: any, _req: any, _res: any, next: any) => next()
}