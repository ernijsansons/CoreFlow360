/**
 * CoreFlow360 - Analytics Integration (Free Tools)
 * Google Analytics 4, Vercel Analytics, and custom event tracking
 */

// Google Analytics 4 (Free)
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID

// Google Analytics events
export const gtag = (...args: any[]) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args)
  }
}

// Page view tracking
export const pageview = (url: string) => {
  gtag('config', GA_TRACKING_ID, {
    page_path: url,
  })
}

// Custom event tracking
export const event = ({ action, category, label, value }: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  })
}

// Business-specific event tracking
export const trackBusinessEvents = {
  // Subscription events
  moduleSelected: (moduleName: string, price: number) => {
    event({
      action: 'module_selected',
      category: 'subscription',
      label: moduleName,
      value: price
    })
  },

  pricingCalculated: (totalPrice: number, modules: string[]) => {
    event({
      action: 'pricing_calculated', 
      category: 'subscription',
      label: modules.join(','),
      value: totalPrice
    })
  },

  trialStarted: (plan: string) => {
    event({
      action: 'trial_started',
      category: 'conversion',
      label: plan
    })
  },

  subscriptionCreated: (plan: string, value: number) => {
    // Google Analytics conversion event
    gtag('event', 'purchase', {
      transaction_id: Date.now().toString(),
      value: value,
      currency: 'USD',
      items: [{
        item_id: plan,
        item_name: `CoreFlow360 ${plan}`,
        category: 'subscription',
        price: value,
        quantity: 1
      }]
    })
  },

  // AI interaction events
  aiOrchestrationUsed: (taskType: string, modules: string[]) => {
    event({
      action: 'ai_orchestration_used',
      category: 'ai_interaction',
      label: `${taskType}_${modules.join(',')}`
    })
  },

  demoCompleted: (demoType: string) => {
    event({
      action: 'demo_completed',
      category: 'engagement',
      label: demoType
    })
  },

  // User engagement
  featureUsed: (feature: string, module: string) => {
    event({
      action: 'feature_used',
      category: 'user_engagement',
      label: `${module}_${feature}`
    })
  },

  supportRequested: (type: string) => {
    event({
      action: 'support_requested',
      category: 'support',
      label: type
    })
  }
}

// Vercel Analytics (Free) - Auto-enabled with NEXT_PUBLIC_VERCEL_ANALYTICS=1
export const vercelAnalytics = {
  track: (eventName: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.va) {
      window.va('track', eventName, properties)
    }
  }
}

// PostHog (Free tier - 1M events/month)
export const posthog = {
  capture: (eventName: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture(eventName, properties)
    }
  },

  identify: (userId: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.identify(userId, properties)
    }
  }
}

// Combined analytics tracking
export const analytics = {
  pageView: (url: string) => {
    pageview(url)
    vercelAnalytics.track('pageview', { path: url })
  },

  track: (eventName: string, properties?: Record<string, any>) => {
    // Google Analytics
    event({
      action: eventName,
      category: properties?.category || 'general',
      label: properties?.label,
      value: properties?.value
    })

    // Vercel Analytics  
    vercelAnalytics.track(eventName, properties)

    // PostHog
    posthog.capture(eventName, properties)
  },

  identify: (userId: string, traits?: Record<string, any>) => {
    // PostHog identification
    posthog.identify(userId, traits)

    // Google Analytics user properties
    gtag('config', GA_TRACKING_ID, {
      user_id: userId,
      custom_map: traits
    })
  }
}

// Performance tracking (Web Vitals)
export const trackWebVitals = (metric: any) => {
  const { id, name, value, label } = metric
  
  // Send to Google Analytics
  gtag('event', name, {
    event_category: label === 'web-vital' ? 'Web Vitals' : 'Next.js custom metric',
    value: Math.round(name === 'CLS' ? value * 1000 : value),
    event_label: id,
    non_interaction: true,
  })

  // Send to Vercel Analytics
  vercelAnalytics.track('web-vital', {
    name,
    value,
    id
  })
}

// Error tracking integration with Sentry
export const trackError = (error: Error, context?: Record<string, any>) => {
  // Send to Google Analytics
  event({
    action: 'exception',
    category: 'error',
    label: error.message
  })

  // Send to Vercel Analytics
  vercelAnalytics.track('error', {
    message: error.message,
    stack: error.stack,
    ...context
  })

  // Sentry will automatically capture if configured
  console.error('Tracked error:', error, context)
}

// Cohort analysis helpers
export const trackUserJourney = {
  onboardingStarted: () => analytics.track('onboarding_started'),
  onboardingCompleted: (step: number) => analytics.track('onboarding_completed', { step }),
  firstModuleActivated: (module: string) => analytics.track('first_module_activated', { module }),
  firstAiInteraction: (type: string) => analytics.track('first_ai_interaction', { type }),
  becamePaidUser: (plan: string, daysToConvert: number) => {
    analytics.track('became_paid_user', { plan, daysToConvert })
  }
}

// A/B testing helpers (for future use)
export const abTest = {
  track: (testName: string, variant: string, converted?: boolean) => {
    analytics.track('ab_test', {
      test_name: testName,
      variant,
      converted: converted || false
    })
  }
}

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    va: (action: string, ...args: any[]) => void
    posthog: {
      capture: (event: string, properties?: any) => void
      identify: (userId: string, properties?: any) => void
    }
  }
}