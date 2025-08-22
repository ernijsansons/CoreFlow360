/**
 * CoreFlow360 - Bundle Optimizer
 * Advanced code splitting and lazy loading for optimal performance
 */

import dynamic from 'next/dynamic'
import React, { ComponentType } from 'react'

// Critical performance thresholds
export const PERFORMANCE_BUDGETS = {
  INITIAL_BUNDLE_SIZE_MB: 0.5,
  ROUTE_CHUNK_SIZE_KB: 100,
  LAZY_LOAD_DELAY_MS: 100,
  TIME_TO_INTERACTIVE_MS: 2000,
} as const

// Dynamic imports with loading states
export const LazyComponents = {
  // Dashboard components - Load on demand
  DashboardCharts: dynamic(() => import('@/components/dashboard/DashboardCharts'), {
    loading: () => React.createElement('div', { className: 'animate-pulse h-64 bg-gray-200 rounded' }),
    ssr: false, // Client-side only for charts
  }),

  // HR Module - Heavy component, lazy load
  HRDashboard: dynamic(() => import('@/components/hr/HRDashboard'), {
    loading: () => React.createElement('div', { className: 'animate-pulse h-96 bg-gray-100 rounded' }),
  }),

  // Accounting components - Load when needed
  InvoiceManager: dynamic(() => import('@/components/accounting/InvoiceManager'), {
    loading: () => React.createElement('div', { className: 'animate-pulse h-80 bg-gray-100 rounded' }),
  }),

  // External service components - Heavy, load async
  CrossBusinessTimeTracker: dynamic(() => import('@/components/cross-business/CrossBusinessTimeTracker'), {
    loading: () => React.createElement('div', { className: 'animate-pulse h-72 bg-blue-50 rounded' }),
  }),

  // AI components - Load when AI features accessed
  AIOrchestrator: dynamic(() => import('@/components/ai/AIOrchestrator'), {
    loading: () => React.createElement('div', { className: 'animate-pulse h-48 bg-purple-50 rounded' }),
    ssr: false,
  }),

  // Analytics - Heavy libraries, defer loading
  Analytics: dynamic(() => import('@/components/analytics/Analytics'), {
    loading: () => React.createElement('div', { className: 'animate-pulse h-64 bg-green-50 rounded' }),
    ssr: false,
  }),
}

// Route-based code splitting
export const LazyRoutes = {
  AdminPanel: dynamic(() => import('@/app/(dashboard)/admin/page'), {
    loading: () => React.createElement('div', { className: 'animate-pulse min-h-screen bg-gray-50' }),
  }),

  SettingsPage: dynamic(() => import('@/app/(dashboard)/settings/page'), {
    loading: () => React.createElement('div', { className: 'animate-pulse min-h-screen bg-gray-50' }),
  }),

  ReportsPage: dynamic(() => import('@/app/(dashboard)/reports/page'), {
    loading: () => React.createElement('div', { className: 'animate-pulse min-h-screen bg-gray-50' }),
  }),
}

// Preload critical routes on hover
export const preloadRoute = (routePath: string) => {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = routePath
    document.head.appendChild(link)
  }
}

// Performance monitoring
export const trackPerformance = (metric: string, value: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'performance_metric', {
      custom_map: { dimension1: metric },
      value: Math.round(value),
    })
  }
}

// Bundle size monitoring
export const monitorBundleSize = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    const metrics = {
      domContentLoaded: navigationTiming.domContentLoadedEventEnd - navigationTiming.navigationStart,
      timeToInteractive: navigationTiming.loadEventEnd - navigationTiming.navigationStart,
      firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
      largestContentfulPaint: performance.getEntriesByName('largest-contentful-paint')[0]?.startTime || 0,
    }

    Object.entries(metrics).forEach(([key, value]) => {
      trackPerformance(key, value)
    })

    return metrics
  }
  return null
}

// Critical resource hints
export const addResourceHints = () => {
  if (typeof window !== 'undefined') {
    // Preconnect to external services
    const preconnects = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
    ]

    preconnects.forEach(url => {
      const link = document.createElement('link')
      link.rel = 'preconnect'
      link.href = url
      link.crossOrigin = 'anonymous'
      document.head.appendChild(link)
    })
  }
}

// Service worker registration for caching
export const registerServiceWorker = async () => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('SW registered:', registration)
      return registration
    } catch (error) {
      console.log('SW registration failed:', error)
      return null
    }
  }
}

// Image optimization helper
export const optimizeImage = (src: string, width: number, quality = 75) => {
  if (src.startsWith('http')) {
    // External image - use Next.js Image optimization
    return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`
  }
  return src
}

// Critical CSS extraction
export const extractCriticalCSS = () => {
  if (typeof window !== 'undefined') {
    const criticalStyles = document.querySelector('style[data-critical]')?.textContent
    return criticalStyles || ''
  }
  return ''
}

export default {
  LazyComponents,
  LazyRoutes,
  preloadRoute,
  trackPerformance,
  monitorBundleSize,
  addResourceHints,
  registerServiceWorker,
  optimizeImage,
  extractCriticalCSS,
  PERFORMANCE_BUDGETS,
}