/**
 * CoreFlow360 - Advanced Error Boundary System
 * Production-grade error handling with user experience optimization
 */

'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Mail, Bug } from 'lucide-react'

interface Props {
  children: ReactNode
  fallbackComponent?: React.ComponentType<ErrorBoundaryFallbackProps>
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  level?: 'page' | 'component' | 'critical'
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  errorId: string
}

export interface ErrorBoundaryFallbackProps {
  error?: Error
  errorInfo?: ErrorInfo
  resetError: () => void
  errorId: string
  level: 'page' | 'component' | 'critical'
}

// Enhanced error reporting
const reportError = async (error: Error, errorInfo: ErrorInfo, errorId: string) => {
  const errorReport = {
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    errorId,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    userId: typeof window !== 'undefined' ? localStorage.getItem('userId') : null,
    buildId: process.env.NEXT_PUBLIC_BUILD_ID,
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.group('🚨 Error Boundary Triggered')
    console.error('Error:', error)
    console.error('Error Info:', errorInfo)
    console.error('Error ID:', errorId)
    console.groupEnd()
  }

  // Send to monitoring service in production
  if (process.env.NODE_ENV === 'production') {
    try {
      await fetch('/api/errors/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorReport),
      })
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError)
    }
  }
}

// Default fallback UI components
const CriticalErrorFallback: React.FC<ErrorBoundaryFallbackProps> = ({ 
  error, 
  resetError, 
  errorId 
}) => (
  <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <AlertTriangle className="w-8 h-8 text-red-600" />
      </div>
      
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        System Error
      </h1>
      
      <p className="text-gray-600 mb-6">
        CoreFlow360 encountered a critical error. Our team has been notified and is working on a fix.
      </p>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-500">Error ID: {errorId}</p>
      </div>
      
      <div className="space-y-3">
        <button
          onClick={resetError}
          className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
        
        <button
          onClick={() => window.location.href = '/'}
          className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          Return Home
        </button>
        
        <a
          href={`mailto:support@coreflow360.com?subject=Error Report - ${errorId}&body=Error ID: ${errorId}%0ATime: ${new Date().toISOString()}%0APage: ${window.location.href}`}
          className="w-full bg-blue-100 text-blue-700 py-3 px-4 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
        >
          <Mail className="w-4 h-4" />
          Contact Support
        </a>
      </div>
    </div>
  </div>
)

const PageErrorFallback: React.FC<ErrorBoundaryFallbackProps> = ({ 
  error, 
  resetError, 
  errorId 
}) => (
  <div className="min-h-96 bg-yellow-50 rounded-lg border border-yellow-200 flex items-center justify-center p-8">
    <div className="text-center max-w-md">
      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Bug className="w-6 h-6 text-yellow-600" />
      </div>
      
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Page Error
      </h2>
      
      <p className="text-gray-600 mb-4 text-sm">
        This page encountered an error. You can try refreshing or return to the dashboard.
      </p>
      
      <div className="flex gap-2 justify-center">
        <button
          onClick={resetError}
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors text-sm"
        >
          Retry
        </button>
        <button
          onClick={() => window.history.back()}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors text-sm"
        >
          Go Back
        </button>
      </div>
      
      <p className="text-xs text-gray-400 mt-3">ID: {errorId}</p>
    </div>
  </div>
)

const ComponentErrorFallback: React.FC<ErrorBoundaryFallbackProps> = ({ 
  resetError, 
  errorId 
}) => (
  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
      <AlertTriangle className="w-4 h-4 text-gray-500" />
    </div>
    
    <p className="text-sm text-gray-600 mb-3">
      Component failed to load
    </p>
    
    <button
      onClick={resetError}
      className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition-colors"
    >
      Retry
    </button>
  </div>
)

export class AdvancedErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null

  constructor(props: Props) {
    super(props)

    this.state = {
      hasError: false,
      errorId: '',
    }
  }

  static getDerivedStateFromError(error: Error): State {
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      hasError: true,
      error,
      errorId,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo })
    
    // Report the error
    reportError(error, errorInfo, this.state.errorId)
    
    // Call custom error handler
    this.props.onError?.(error, errorInfo)
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: '',
    })
  }

  render() {
    if (this.state.hasError) {
      const level = this.props.level || 'component'
      
      // Use custom fallback or default based on level
      if (this.props.fallbackComponent) {
        const FallbackComponent = this.props.fallbackComponent
        return (
          <FallbackComponent
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            resetError={this.resetError}
            errorId={this.state.errorId}
            level={level}
          />
        )
      }
      
      // Default fallbacks based on level
      switch (level) {
        case 'critical':
          return (
            <CriticalErrorFallback
              error={this.state.error}
              errorInfo={this.state.errorInfo}
              resetError={this.resetError}
              errorId={this.state.errorId}
              level={level}
            />
          )
        case 'page':
          return (
            <PageErrorFallback
              error={this.state.error}
              errorInfo={this.state.errorInfo}
              resetError={this.resetError}
              errorId={this.state.errorId}
              level={level}
            />
          )
        case 'component':
        default:
          return (
            <ComponentErrorFallback
              error={this.state.error}
              errorInfo={this.state.errorInfo}
              resetError={this.resetError}
              errorId={this.state.errorId}
              level={level}
            />
          )
      }
    }

    return this.props.children
  }
}

// HOC for wrapping components with error boundaries
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  level: Props['level'] = 'component'
) => {
  const WrappedComponent = (props: P) => (
    <AdvancedErrorBoundary level={level}>
      <Component {...props} />
    </AdvancedErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// Async error handler for promises and async operations
export const handleAsyncError = async function <T>(
  operation: () => Promise<T>,
  fallback?: T,
  onError?: (error: Error) => void
): Promise<T | undefined> {
  try {
    return await operation()
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error))
    
    console.error('Async operation failed:', errorObj)
    onError?.(errorObj)
    
    // Report error
    if (process.env.NODE_ENV === 'production') {
      reportError(errorObj, { componentStack: 'Async Operation' }, `ASYNC_${Date.now()}`)
    }
    
    if (fallback !== undefined) {
      return fallback
    }
    
    throw errorObj
  }
}

// Global error handler setup
export const setupGlobalErrorHandling = () => {
  if (typeof window !== 'undefined') {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason)
      
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason))
      reportError(error, { componentStack: 'Unhandled Promise' }, `PROMISE_${Date.now()}`)
    })
    
    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      console.error('Uncaught error:', event.error)
      
      const error = event.error instanceof Error ? event.error : new Error(event.message)
      reportError(error, { componentStack: 'Global Error' }, `GLOBAL_${Date.now()}`)
    })
  }
}

export default AdvancedErrorBoundary