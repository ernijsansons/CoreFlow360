/**
 * Sentry Configuration (Free Tier)
 * Error tracking and performance monitoring
 */

// Sentry configuration for free tier (5k errors/month)
export const SENTRY_CONFIG = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: process.env.NODE_ENV === 'development',
  integrations: [
    // Add Sentry integrations here when Sentry is installed
  ],
  beforeSend(event: unknown) {
    // Filter out non-critical errors in production
    if (process.env.NODE_ENV === 'production') {
      // Don't send network errors
      if (event.exception?.values?.[0]?.type === 'NetworkError') {
        return null
      }

      // Don't send development-only errors
      if (event.tags?.environment === 'development') {
        return null
      }
    }

    return event
  },
  beforeSendTransaction(event: unknown) {
    // Sample transactions to stay within free tier limits
    return event
  },
}

// Error boundary helper
export class ErrorBoundaryLogger {
  static logError(error: Error, errorInfo?: unknown) {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
    }

    // Send to analytics
    if (typeof window !== 'undefined') {
      if (window.gtag) {
        window.gtag('event', 'exception', {
          description: error.message,
          fatal: false,
          error_boundary: true,
        })
      }

      if (window.va) {
        window.va('track', 'error_boundary', {
          error_message: error.message,
          error_stack: error.stack,
          component_stack: errorInfo?.componentStack,
        })
      }
    }
  }
}

// Performance monitoring utilities
export class PerformanceLogger {
  static logWebVital(name: string, value: number, id: string) {
    // Log to analytics
    if (typeof window !== 'undefined') {
      if (window.gtag) {
        window.gtag('event', name, {
          event_category: 'Web Vitals',
          value: Math.round(name === 'CLS' ? value * 1000 : value),
          event_label: id,
          non_interaction: true,
        })
      }

      if (window.va) {
        window.va('track', 'web-vital', {
          name,
          value,
          id,
        })
      }
    }

    // Web vitals are tracked via analytics only
  }

  static logApiCall(url: string, method: string, duration: number, status?: number) {
    // Track API performance
    if (typeof window !== 'undefined') {
      if (window.gtag) {
        window.gtag('event', 'api_call', {
          event_category: 'Performance',
          event_label: `${method} ${url}`,
          value: Math.round(duration),
          custom_parameters: {
            status,
            method,
            url,
          },
        })
      }

      if (window.va) {
        window.va('track', 'api_performance', {
          url,
          method,
          duration,
          status,
        })
      }
    }

    // Log slow API calls
    if (duration > 1000) {
    }
  }
}

// User feedback collection
export class FeedbackCollector {
  static collectUserFeedback(feedback: {
    type: 'bug' | 'feature' | 'general'
    message: string
    email?: string
    url?: string
  }) {
    // Track feedback submission
    if (typeof window !== 'undefined') {
      if (window.gtag) {
        window.gtag('event', 'feedback_submitted', {
          event_category: 'User Feedback',
          event_label: feedback.type,
        })
      }

      if (window.va) {
        window.va('track', 'feedback_submitted', {
          type: feedback.type,
          has_email: !!feedback.email,
          url: feedback.url,
        })
      }
    }

    // In production, send to feedback collection service
    return true
  }
}

// Uptime monitoring (for external services like UptimeRobot)
export class UptimeMonitor {
  static async ping(): Promise<{ status: 'ok' | 'error'; timestamp: number }> {
    try {
      const response = await fetch('/api/health')
      return {
        status: response.ok ? 'ok' : 'error',
        timestamp: Date.now(),
      }
    } catch (error) {
      return {
        status: 'error',
        timestamp: Date.now(),
      }
    }
  }
}

// Feature flag tracking
export class FeatureTracker {
  static trackFeatureUsage(feature: string, enabled: boolean, context?: Record<string, unknown>) {
    if (typeof window !== 'undefined') {
      if (window.gtag) {
        window.gtag('event', 'feature_flag', {
          event_category: 'Feature Usage',
          event_label: feature,
          custom_parameters: {
            enabled,
            ...context,
          },
        })
      }

      if (window.va) {
        window.va('track', 'feature_usage', {
          feature,
          enabled,
          ...context,
        })
      }
    }
  }
}

// Export monitoring utilities
export const monitoring = {
  ErrorBoundaryLogger,
  PerformanceLogger,
  FeedbackCollector,
  UptimeMonitor,
  FeatureTracker,
}

// Environment-specific configuration
export const getMonitoringConfig = () => ({
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  sentryEnabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  analyticsEnabled: !!process.env.NEXT_PUBLIC_GA_TRACKING_ID,
  debugMode: process.env.NODE_ENV === 'development',
  errorReportingEnabled: process.env.NODE_ENV === 'production',
})
