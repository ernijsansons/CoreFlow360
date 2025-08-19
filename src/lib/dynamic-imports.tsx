/**
 * CoreFlow360 - Dynamic Import Utilities
 * Provides lazy loading and code splitting utilities for better bundle optimization
 */

import dynamic from 'next/dynamic'
import React, { Suspense } from 'react'

interface LoadingComponentProps {
  message?: string
  fullHeight?: boolean
}

/**
 * Default loading component for dynamic imports
 */
const LoadingComponent: React.FC<LoadingComponentProps> = ({
  message = 'Loading...',
  fullHeight = false,
}) => (
  <div
    className={`flex items-center justify-center p-8 ${
      fullHeight ? 'min-h-screen' : 'min-h-[200px]'
    }`}
  >
    <div className="text-center">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
      <p className="mt-2 text-sm text-gray-600">{message}</p>
    </div>
  </div>
)

/**
 * Error boundary component for dynamic imports
 */
class DynamicImportErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ComponentType }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true }
  }

  componentDidCatch(_error: Error, _errorInfo: React.ErrorInfo) {}

  render() {
    if (this.state.hasError) {
      const Fallback =
        this.props.fallback ||
        (() => (
          <div className="rounded-md border border-red-200 bg-red-50 p-4">
            <p className="text-red-600">Failed to load component. Please refresh the page.</p>
          </div>
        ))
      return <Fallback />
    }

    return this.props.children
  }
}

/**
 * Enhanced dynamic import with error boundary and loading state
 */
export function createDynamicComponent<P = {}>(
  importFn: () => Promise<{ default: React.ComponentType<P> }>,
  options: {
    loading?: React.ComponentType<LoadingComponentProps>
    fallback?: React.ComponentType
    ssr?: boolean
    loadingMessage?: string
    fullHeight?: boolean
  } = {}
) {
  const {
    loading: LoadingComp = LoadingComponent,
    fallback,
    ssr = true,
    loadingMessage = 'Loading component...',
    fullHeight = false,
  } = options

  const DynamicComponent = dynamic(importFn, {
    loading: () => <LoadingComp message={loadingMessage} fullHeight={fullHeight} />,
    ssr,
  })

  return function WrappedDynamicComponent(props: P) {
    return (
      <DynamicImportErrorBoundary fallback={fallback}>
        <Suspense fallback={<LoadingComp message={loadingMessage} fullHeight={fullHeight} />}>
          <DynamicComponent {...props} />
        </Suspense>
      </DynamicImportErrorBoundary>
    )
  }
}

/**
 * Pre-configured dynamic imports for common heavy components
 */

// Charts and visualizations
export const DynamicChart = createDynamicComponent(() => import('@/components/analytics/Chart'), {
  loadingMessage: 'Loading chart...',
  ssr: false,
})

export const DynamicDashboard = createDynamicComponent(
  () => import('@/components/dashboard/Dashboard'),
  { loadingMessage: 'Loading dashboard...', fullHeight: true }
)

// Rich text editor
export const DynamicRichTextEditor = createDynamicComponent(
  () => import('@/components/ui/RichTextEditor'),
  { loadingMessage: 'Loading editor...', ssr: false }
)

// File upload component
export const DynamicFileUpload = createDynamicComponent(
  () => import('@/components/ui/FileUpload'),
  { loadingMessage: 'Loading file upload...', ssr: false }
)

// Calendar component
export const DynamicCalendar = createDynamicComponent(() => import('@/components/ui/Calendar'), {
  loadingMessage: 'Loading calendar...',
  ssr: false,
})

// Data grid
export const DynamicDataGrid = createDynamicComponent(() => import('@/components/ui/DataGrid'), {
  loadingMessage: 'Loading data grid...',
  ssr: false,
})

// PDF viewer
export const DynamicPDFViewer = createDynamicComponent(() => import('@/components/ui/PDFViewer'), {
  loadingMessage: 'Loading PDF viewer...',
  ssr: false,
})

// Voice notes component
export const DynamicVoiceNotes = createDynamicComponent(
  () => import('@/components/voice/VoiceNotes'),
  { loadingMessage: 'Loading voice features...', ssr: false }
)

/**
 * Route-based dynamic imports for pages
 */

// Admin pages
export const DynamicAdminDashboard = createDynamicComponent(
  () => import('@/app/admin/dashboard/page'),
  { loadingMessage: 'Loading admin dashboard...', fullHeight: true }
)

// Analytics pages
export const DynamicAnalyticsPage = createDynamicComponent(
  () => import('@/app/(authenticated)/dashboard/analytics/page'),
  { loadingMessage: 'Loading analytics...', fullHeight: true }
)

// Customer management
export const DynamicCustomerManagement = createDynamicComponent(
  () => import('@/app/(authenticated)/dashboard/customers/page'),
  { loadingMessage: 'Loading customer management...', fullHeight: true }
)

/**
 * Utility for creating module-specific dynamic imports
 */
export function createModuleDynamicImport<P = {}>(
  moduleName: string,
  componentPath: string,
  options: Parameters<typeof createDynamicComponent>[1] = {}
) {
  return createDynamicComponent<P>(() => import(`@/modules/${moduleName}/${componentPath}`), {
    loadingMessage: `Loading ${moduleName} module...`,
    ssr: false,
    ...options,
  })
}

/**
 * Preload utility for critical routes
 */
export const preloadComponent = (importFn: () => Promise<unknown>) => {
  // Only preload in browser environment
  if (typeof window !== 'undefined') {
    // Use requestIdleCallback if available, otherwise setTimeout
    const schedulePreload =
      (window as unknown).requestIdleCallback || ((cb: () => void) => setTimeout(cb, 100))

    schedulePreload(() => {
      importFn().catch((error) => {})
    })
  }
}

/**
 * Bundle splitting by feature
 */
export const FeatureBundles = {
  // CRM features
  crm: () => import('@/features/crm'),

  // Analytics features
  analytics: () => import('@/features/analytics'),

  // AI features
  ai: () => import('@/features/ai'),

  // Voice features
  voice: () => import('@/features/voice'),

  // Billing features
  billing: () => import('@/features/billing'),

  // Admin features
  admin: () => import('@/features/admin'),
}

/**
 * Dynamic import with retry logic
 */
export async function importWithRetry<T>(
  importFn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error | null = null

  for (let i = 0; i < retries; i++) {
    try {
      return await importFn()
    } catch (error) {
      lastError = error as Error

      // Don't retry if it's a 404 or similar
      if (error instanceof Error && error.message.includes('404')) {
        throw error
      }

      // Wait before retry
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)))
      }
    }
  }

  throw lastError || new Error('Import failed after retries')
}

/**
 * Progressive enhancement utility
 */
export function withProgressiveEnhancement<P extends object>(
  Component: React.ComponentType<P>,
  EnhancedComponent: React.ComponentType<P>,
  condition: () => boolean = () => true
) {
  return function ProgressiveComponent(props: P) {
    const [shouldEnhance, setShouldEnhance] = React.useState(false)

    React.useEffect(() => {
      // Check if we should load the enhanced version
      if (condition()) {
        setShouldEnhance(true)
      }
    }, [])

    if (shouldEnhance) {
      return <EnhancedComponent {...props} />
    }

    return <Component {...props} />
  }
}

/**
 * Intersection observer for lazy loading
 */
export function useLazyLoad(threshold = 0.1) {
  const [isInView, setIsInView] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold])

  return { ref, isInView }
}
