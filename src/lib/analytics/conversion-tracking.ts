'use client'

import { useTrackEvent } from '@/components/analytics/AnalyticsProvider'

export interface ConversionEvent {
  event: string
  properties: Record<string, unknown>
  timestamp: number
  userId?: string
  sessionId: string
}

export interface ConversionFunnel {
  step: string
  count: number
  conversionRate?: number
  dropOffRate?: number
}

class ConversionTracker {
  private events: ConversionEvent[] = []
  private sessionId: string
  private userId?: string
  private eventListeners: Array<{ element: unknown; event: string; handler: unknown }> = []
  private intervals: number[] = []

  constructor() {
    this.sessionId = this.generateSessionId()
    this.initializeTracking()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private initializeTracking() {
    // Track page views
    this.trackPageView()

    // Track scroll depth
    this.trackScrollDepth()

    // Track time on page
    this.trackTimeOnPage()

    // Track click events
    this.trackClicks()

    // Track form interactions
    this.trackFormInteractions()
  }

  trackPageView() {
    this.track('page_view', {
      url: window.location.href,
      title: document.title,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    })
  }

  trackScrollDepth() {
    let maxScroll = 0
    const scrollMilestones = [25, 50, 75, 100]
    const trackedMilestones: number[] = []

    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      )

      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent
      }

      scrollMilestones.forEach((milestone) => {
        if (scrollPercent >= milestone && !trackedMilestones.includes(milestone)) {
          trackedMilestones.push(milestone)
          this.track('scroll_depth', {
            percentage: milestone,
            pixelsFromTop: window.scrollY,
          })
        }
      })
    }

    window.addEventListener('scroll', handleScroll)

    // Track final scroll on page unload
    window.addEventListener('beforeunload', () => {
      this.track('final_scroll_depth', {
        maxScrollPercentage: maxScroll,
        finalPixels: window.scrollY,
      })
    })
  }

  trackTimeOnPage() {
    const startTime = Date.now()
    let lastActiveTime = startTime

    // Track active time (when user is actually engaging)
    const trackActivity = () => {
      lastActiveTime = Date.now()
    }

    ;['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach((event) => {
      document.addEventListener(event, trackActivity)
    })

    // Send time data periodically and on exit
    const sendTimeData = () => {
      const totalTime = Date.now() - startTime
      const activeTime = lastActiveTime - startTime

      this.track('time_on_page', {
        totalTimeSeconds: Math.round(totalTime / 1000),
        activeTimeSeconds: Math.round(activeTime / 1000),
        engagementRate: Math.round((activeTime / totalTime) * 100),
      })
    }

    window.addEventListener('beforeunload', sendTimeData)

    // Send intermediate updates every 30 seconds
    setInterval(sendTimeData, 30000)
  }

  trackClicks() {
    const handleClick = (event: Event) => {
      const target = event.target as HTMLElement
      const clickData = {
        tagName: target.tagName,
        className: target.className,
        id: target.id,
        text: target.textContent?.slice(0, 100),
        href: target.getAttribute('href'),
        x: event.clientX,
        y: event.clientY,
      }

      // Track CTA clicks specifically
      if (target.closest('button') || target.closest('a[href]')) {
        const ctaElement = target.closest('button, a[href]') as HTMLElement
        this.track('cta_click', {
          ...clickData,
          ctaText: ctaElement.textContent?.slice(0, 100),
          ctaType: ctaElement.tagName.toLowerCase(),
          section: this.getPageSection(ctaElement),
        })
      }

      // Track any click
      this.track('click', clickData)
    }

    document.addEventListener('click', handleClick)

    // Store for cleanup
    this.eventListeners = this.eventListeners || []
    this.eventListeners.push({ element: document, event: 'click', handler: handleClick })
  }

  trackFormInteractions() {
    // Track form focuses
    document.addEventListener(
      'focus',
      (event) => {
        const target = event.target as HTMLElement
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT'
        ) {
          this.track('form_field_focus', {
            fieldType: target.tagName,
            fieldName: target.getAttribute('name'),
            fieldId: target.id,
            formId: target.closest('form')?.id,
          })
        }
      },
      true
    )

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement
      this.track('form_submit', {
        formId: form.id,
        formAction: form.action,
        formMethod: form.method,
        fieldCount: form.elements.length,
      })
    })
  }

  private getPageSection(element: HTMLElement): string {
    // Determine which section of the page the element is in
    const sections = [
      'hero',
      'social-proof',
      'roi-calculator',
      'features',
      'pricing',
      'testimonials',
      'faq',
    ]

    for (const section of sections) {
      if (
        element.closest(`[data-section="${section}"]`) ||
        element.closest(`.${section}`) ||
        element.closest(`#${section}`)
      ) {
        return section
      }
    }

    return 'unknown'
  }

  track(event: string, properties: Record<string, unknown> = {}) {
    const conversionEvent: ConversionEvent = {
      event,
      properties: {
        ...properties,
        timestamp: Date.now(),
        url: window.location.href,
        sessionId: this.sessionId,
        userId: this.userId,
      },
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
    }

    this.events.push(conversionEvent)

    // Send to analytics service
    this.sendToAnalytics(conversionEvent)

    // Store locally for offline capabilities
    this.storeLocally(conversionEvent)
  }

  private async sendToAnalytics(event: ConversionEvent) {
    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      })
    } catch (error) {}
  }

  private storeLocally(event: ConversionEvent) {
    try {
      const stored = localStorage.getItem('conversion_events') || '[]'
      const events = JSON.parse(stored)
      events.push(event)

      // Keep only last 100 events to avoid storage bloat
      if (events.length > 100) {
        events.splice(0, events.length - 100)
      }

      localStorage.setItem('conversion_events', JSON.stringify(events))
    } catch (error) {}
  }

  // ROI Calculator specific tracking
  trackROICalculation(inputs: unknown, results: unknown) {
    this.track('roi_calculation', {
      employees: inputs.employees,
      currentCost: inputs.currentCost,
      hoursLost: inputs.hoursLost,
      calculatedROI: results.roi,
      annualSavings: results.netSavings,
      calculationTime: Date.now(),
    })
  }

  // Urgency element tracking
  trackUrgencyInteraction(type: 'countdown' | 'spots_remaining' | 'live_counter', value: unknown) {
    this.track('urgency_interaction', {
      urgencyType: type,
      value,
      interactionTime: Date.now(),
    })
  }

  // Social proof tracking
  trackSocialProofView(type: 'testimonial' | 'logo' | 'metric', identifier: string) {
    this.track('social_proof_view', {
      proofType: type,
      identifier,
      viewTime: Date.now(),
    })
  }

  // Conversion funnel tracking
  trackFunnelStep(step: string, metadata: Record<string, unknown> = {}) {
    this.track('funnel_step', {
      step,
      ...metadata,
      stepTime: Date.now(),
    })
  }

  // Get conversion funnel data
  getConversionFunnel(): ConversionFunnel[] {
    const funnelSteps = [
      'page_view',
      'hero_scroll',
      'roi_interaction',
      'cta_click',
      'form_start',
      'form_submit',
      'trial_signup',
    ]

    return funnelSteps.map((step, index) => {
      const stepEvents = this.events.filter((e) => e.event === step)
      const previousStepEvents =
        index > 0 ? this.events.filter((e) => e.event === funnelSteps[index - 1]) : []

      const conversionRate =
        previousStepEvents.length > 0 ? (stepEvents.length / previousStepEvents.length) * 100 : 100

      return {
        step,
        count: stepEvents.length,
        conversionRate: Math.round(conversionRate),
        dropOffRate: Math.round(100 - conversionRate),
      }
    })
  }

  // A/B testing support
  trackVariant(testName: string, variant: string) {
    this.track('ab_test_variant', {
      testName,
      variant,
      assignedAt: Date.now(),
    })
  }

  // Heat map data
  getHeatmapData() {
    return this.events
      .filter((e) => e.event === 'click')
      .map((e) => ({
        x: e.properties.x,
        y: e.properties.y,
        timestamp: e.timestamp,
      }))
  }

  // Export all events
  exportEvents() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      events: this.events,
      summary: {
        totalEvents: this.events.length,
        uniqueEvents: [...new Set(this.events.map((e) => e.event))],
        sessionDuration: this.events.length > 0 ? Date.now() - this.events[0].timestamp : 0,
      },
    }
  }

  // Cleanup method to prevent memory leaks
  cleanup() {
    // Remove all event listeners
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler)
    })
    this.eventListeners = []

    // Clear all intervals
    this.intervals.forEach((intervalId) => {
      clearInterval(intervalId)
    })
    this.intervals = []
  }
}

// Singleton instance
export const conversionTracker = new ConversionTracker()

// React hook for easy component integration
export function useConversionTracking() {
  return {
    track: conversionTracker.track.bind(conversionTracker),
    trackROI: conversionTracker.trackROICalculation.bind(conversionTracker),
    trackUrgency: conversionTracker.trackUrgencyInteraction.bind(conversionTracker),
    trackSocialProof: conversionTracker.trackSocialProofView.bind(conversionTracker),
    trackFunnelStep: conversionTracker.trackFunnelStep.bind(conversionTracker),
    getFunnel: conversionTracker.getConversionFunnel.bind(conversionTracker),
    exportData: conversionTracker.exportEvents.bind(conversionTracker),
  }
}
