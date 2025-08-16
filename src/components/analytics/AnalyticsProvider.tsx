/**
 * Analytics Provider - Integrates all free analytics tools
 * Inspired by Linear, Stripe, and other successful SaaS analytics setups
 */

'use client'

import { createContext, useContext, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { analytics, trackWebVitals } from '@/lib/analytics'
import { sessionTracker, performanceTracker } from '@/lib/monitoring'

interface AnalyticsContextType {
  track: (eventName: string, properties?: Record<string, any>) => void
  identify: (userId: string, traits?: Record<string, any>) => void
  pageView: (url: string) => void
}

const AnalyticsContext = createContext<AnalyticsContextType>({
  track: () => {},
  identify: () => {},
  pageView: () => {}
})

export function useAnalytics() {
  return useContext(AnalyticsContext)
}

interface AnalyticsProviderProps {
  children: React.ReactNode
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname()

  // Track page views on route changes
  useEffect(() => {
    analytics.pageView(pathname)
    sessionTracker.trackPageView()
  }, [pathname])

  // Track web vitals for performance monitoring
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Dynamic import of web-vitals for client-side only
      import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
        onCLS(trackWebVitals)
        onFID(trackWebVitals)
        onFCP(trackWebVitals)
        onLCP(trackWebVitals)
        onTTFB(trackWebVitals)
      })
    }
  }, [])

  const contextValue: AnalyticsContextType = {
    track: analytics.track,
    identify: analytics.identify,
    pageView: analytics.pageView
  }

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  )
}

// Higher-order component for tracking page visits
export function withPageTracking<P extends object>(
  Component: React.ComponentType<P>,
  pageName: string
) {
  return function TrackedComponent(props: P) {
    const { track } = useAnalytics()
    
    useEffect(() => {
      track('page_visited', { page_name: pageName })
    }, [track])

    return <Component {...props} />
  }
}

// Hook for tracking user interactions
export function useTrackEvent() {
  const { track } = useAnalytics()
  
  return {
    // Subscription events
    trackModuleSelection: (moduleName: string, price: number) => {
      track('module_selected', { 
        module_name: moduleName, 
        price: price,
        category: 'subscription' 
      })
    },
    
    trackPricingCalculation: (totalPrice: number, modules: string[]) => {
      track('pricing_calculated', {
        total_price: totalPrice,
        modules: modules.join(','),
        module_count: modules.length,
        category: 'subscription'
      })
    },

    trackTrialStart: (plan: string) => {
      track('trial_started', { 
        plan: plan,
        category: 'conversion'
      })
    },

    // AI interaction events
    trackAIUsage: (taskType: string, modules: string[]) => {
      track('ai_orchestration_used', {
        task_type: taskType,
        modules: modules.join(','),
        module_count: modules.length,
        category: 'ai_interaction'
      })
    },

    trackDemoCompletion: (demoType: string) => {
      track('demo_completed', {
        demo_type: demoType,
        category: 'engagement'
      })
    },

    // Feature usage
    trackFeatureUsage: (feature: string, module?: string) => {
      track('feature_used', {
        feature: feature,
        module: module || 'core',
        category: 'user_engagement'
      })
    },

    // Support and help
    trackSupportRequest: (type: string) => {
      track('support_requested', {
        support_type: type,
        category: 'support'
      })
    },

    // Generic event tracking
    trackEvent: (eventName: string, properties?: Record<string, any>) => {
      track(eventName, properties)
    }
  }
}

// Component for tracking button clicks
export function TrackingButton({ 
  children, 
  eventName, 
  eventProperties,
  className,
  onClick,
  ...props 
}: {
  children: React.ReactNode
  eventName: string
  eventProperties?: Record<string, any>
  className?: string
  onClick?: () => void
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { track } = useAnalytics()

  const handleClick = () => {
    track(eventName, eventProperties)
    if (onClick) onClick()
  }

  return (
    <button 
      className={className} 
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
}

// Component for tracking link clicks
export function TrackingLink({ 
  children, 
  href,
  eventName, 
  eventProperties,
  className,
  ...props 
}: {
  children: React.ReactNode
  href: string
  eventName: string
  eventProperties?: Record<string, any>
  className?: string
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { track } = useAnalytics()

  const handleClick = () => {
    track(eventName, { 
      link_url: href, 
      ...eventProperties 
    })
  }

  return (
    <a 
      href={href}
      className={className} 
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  )
}