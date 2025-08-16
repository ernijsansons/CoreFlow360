'use client'

/**
 * CoreFlow360 - Authentication Error Boundary
 * Handles authentication errors gracefully with retry and fallback options
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { signOut } from 'next-auth/react'
import { AlertCircle, RefreshCw, LogOut } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  retryCount: number
}

export class AuthErrorBoundary extends Component<Props, State> {
  private maxRetries = 3
  private retryDelay = 1000 // Start with 1 second

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to error reporting service
    console.error('Auth Error Boundary caught error:', error, errorInfo)
    
    // Send to monitoring service (e.g., Sentry)
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack
          }
        },
        tags: {
          component: 'AuthErrorBoundary'
        }
      })
    }

    this.setState({ errorInfo })
  }

  handleRetry = async () => {
    const { retryCount } = this.state
    
    if (retryCount < this.maxRetries) {
      // Exponential backoff
      const delay = this.retryDelay * Math.pow(2, retryCount)
      
      this.setState({ 
        hasError: false, 
        error: null, 
        errorInfo: null,
        retryCount: retryCount + 1 
      })
      
      // Force re-render after delay
      setTimeout(() => {
        window.location.reload()
      }, delay)
    }
  }

  handleSignOut = async () => {
    try {
      await signOut({ 
        callbackUrl: '/login?error=session_expired',
        redirect: true 
      })
    } catch (error) {
      // If sign out fails, force redirect
      window.location.href = '/login?error=signout_failed'
    }
  }

  isAuthError = (error: Error | null): boolean => {
    if (!error) return false
    
    const authErrorMessages = [
      'unauthorized',
      'authentication',
      'session expired',
      'invalid token',
      'forbidden',
      'tenant is not active'
    ]
    
    const errorMessage = error.message.toLowerCase()
    return authErrorMessages.some(msg => errorMessage.includes(msg))
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const { error, retryCount } = this.state
      const isAuthError = this.isAuthError(error)
      const canRetry = retryCount < this.maxRetries

      // Use custom fallback if provided
      if (this.props.fallback) {
        return <>{this.props.fallback}</>
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            
            <h2 className="mt-4 text-center text-2xl font-bold text-gray-900">
              {isAuthError ? 'Authentication Error' : 'Something went wrong'}
            </h2>
            
            <p className="mt-2 text-center text-sm text-gray-600">
              {isAuthError 
                ? 'Your session may have expired or you may not have access to this resource.'
                : 'An unexpected error occurred. Please try again.'}
            </p>

            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 p-3 bg-gray-100 rounded text-xs">
                <summary className="cursor-pointer font-semibold">
                  Error Details
                </summary>
                <pre className="mt-2 whitespace-pre-wrap break-words">
                  {error.message}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="mt-6 space-y-3">
              {isAuthError ? (
                <button
                  onClick={this.handleSignOut}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign In Again
                </button>
              ) : canRetry ? (
                <button
                  onClick={this.handleRetry}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry ({this.maxRetries - retryCount} attempts left)
                </button>
              ) : (
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Go to Homepage
                </button>
              )}
              
              {!isAuthError && (
                <button
                  onClick={() => window.location.href = '/support'}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Contact Support
                </button>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Convenience hook for using auth error boundary
export function useAuthErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { throwError: setError }
}

// HOC for wrapping components with auth error boundary
export function withAuthErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return (props: P) => (
    <AuthErrorBoundary fallback={fallback}>
      <Component {...props} />
    </AuthErrorBoundary>
  )
}