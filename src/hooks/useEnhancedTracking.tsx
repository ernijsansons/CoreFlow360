/**
 * CoreFlow360 - Enhanced Event Tracking React Hook
 * Provides React components with comprehensive event tracking capabilities
 */

'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  eventTracker,
  type EnhancedEvent,
  type UserJourneyEvent,
  type PaymentFlowEvent,
  type AIInteractionEvent,
  type BusinessProcessEvent,
  type EnterpriseEvent,
} from '@/lib/events/enhanced-event-tracker'

export interface TrackingOptions {
  immediate?: boolean
  includePageContext?: boolean
  sessionTracking?: boolean
}

export interface PageViewEvent {
  page: string
  title: string
  referrer?: string
  searchParams?: Record<string, string>
  loadTime?: number
  previousPage?: string
}

export function useEnhancedTracking() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const pageStartTime = useRef<number>(Date.now())
  const previousPage = useRef<string>('')

  // Auto-track page views
  useEffect(() => {
    const loadTime = Date.now() - pageStartTime.current

    const pageViewEvent: PageViewEvent = {
      page: pathname,
      title: typeof document !== 'undefined' ? document.title : pathname,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      searchParams: Object.fromEntries(searchParams.entries()),
      loadTime,
      previousPage: previousPage.current,
    }

    trackPageView(pageViewEvent)
    previousPage.current = pathname
    pageStartTime.current = Date.now()
  }, [pathname, searchParams])

  // Generic event tracking
  const track = useCallback(
    async (
      eventName: string,
      eventType: EnhancedEvent['eventType'],
      properties: Record<string, unknown> = {},
      options: TrackingOptions = {}
    ) => {
      try {
        const event: Partial<EnhancedEvent> = {
          eventName,
          eventType,
          userId: session?.user?.id,
          tenantId: session?.user?.tenantId,
          properties: {
            ...properties,
            ...(options.includePageContext && {
              page: pathname,
              searchParams: Object.fromEntries(searchParams.entries()),
            }),
          },
          metadata: {
            source: 'web_app',
            referrer: typeof document !== 'undefined' ? document.referrer : undefined,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
            device: getDeviceType(),
          },
        }

        await eventTracker.track(event)
      } catch (error) {}
    },
    [session, pathname, searchParams]
  )

  // Page view tracking
  const trackPageView = useCallback(
    async (pageView: PageViewEvent) => {
      await track(
        'page_view',
        'user_journey',
        {
          step: 'page_view',
          completed: true,
          page: pageView.page,
          title: pageView.title,
          loadTime: pageView.loadTime,
          previousPage: pageView.previousPage,
          searchParams: pageView.searchParams,
        },
        { immediate: true }
      )
    },
    [track]
  )

  // User journey tracking
  const trackUserJourney = useCallback(
    async (
      step: string,
      completed: boolean,
      additionalData: Partial<UserJourneyEvent['properties']> = {}
    ) => {
      await eventTracker.trackUserJourney({
        eventName: `journey_${step}`,
        userId: session?.user?.id,
        tenantId: session?.user?.tenantId,
        properties: {
          step,
          completed,
          timeToComplete: additionalData.timeToComplete,
          abandonmentReason: additionalData.abandonmentReason,
          nextStep: additionalData.nextStep,
          conversionValue: additionalData.conversionValue,
          moduleId: additionalData.moduleId,
          featureDiscovered: additionalData.featureDiscovered,
        },
      })
    },
    [session]
  )

  // Onboarding tracking
  const trackOnboardingStep = useCallback(
    async (
      stepNumber: number,
      stepName: string,
      completed: boolean,
      timeSpent?: number,
      data?: Record<string, unknown>
    ) => {
      await trackUserJourney(`onboarding_step_${stepNumber}`, completed, {
        timeToComplete: timeSpent,
        nextStep: completed ? `onboarding_step_${stepNumber + 1}` : undefined,
        moduleId: data?.selectedModule,
        ...data,
      })
    },
    [trackUserJourney]
  )

  // Feature discovery tracking
  const trackFeatureDiscovery = useCallback(
    async (
      featureName: string,
      discoveryMethod: 'navigation' | 'search' | 'recommendation' | 'accident',
      engagement?: 'viewed' | 'clicked' | 'used'
    ) => {
      await trackUserJourney('feature_discovery', true, {
        featureDiscovered: featureName,
        timeToComplete: Date.now() - pageStartTime.current,
        moduleId: featureName.split('_')[0], // Extract module from feature name
      })

      // Additional feature engagement tracking
      if (engagement) {
        await track(`feature_${engagement}`, 'user_journey', {
          feature: featureName,
          discoveryMethod,
          engagement,
        })
      }
    },
    [trackUserJourney, track]
  )

  // Payment flow tracking
  const trackPaymentFlow = useCallback(
    async (
      action: PaymentFlowEvent['properties']['action'],
      amount: number,
      additionalData: Partial<PaymentFlowEvent['properties']> = {}
    ) => {
      await eventTracker.trackPaymentFlow({
        eventName: `payment_${action}`,
        userId: session?.user?.id,
        tenantId: session?.user?.tenantId,
        properties: {
          action,
          amount,
          currency: additionalData.currency || 'USD',
          subscriptionId: additionalData.subscriptionId,
          paymentMethodId: additionalData.paymentMethodId,
          failureReason: additionalData.failureReason,
          retryAttempt: additionalData.retryAttempt,
          billingCycle: additionalData.billingCycle,
          planType: additionalData.planType,
          previousPlan: additionalData.previousPlan,
        },
      })
    },
    [session]
  )

  // AI interaction tracking
  const trackAIInteraction = useCallback(
    async (
      moduleId: string,
      interactionType: AIInteractionEvent['properties']['interactionType'],
      success: boolean,
      responseTime: number,
      additionalData: Partial<AIInteractionEvent['properties']> = {}
    ) => {
      await eventTracker.trackAIInteraction({
        eventName: `ai_${interactionType}_${moduleId}`,
        userId: session?.user?.id,
        tenantId: session?.user?.tenantId,
        properties: {
          moduleId,
          interactionType,
          success,
          responseTime,
          inputTokens: additionalData.inputTokens,
          outputTokens: additionalData.outputTokens,
          cost: additionalData.cost,
          accuracy: additionalData.accuracy,
          userSatisfaction: additionalData.userSatisfaction,
          BUSINESS INTELLIGENCELevel: additionalData.BUSINESS INTELLIGENCELevel,
          crossModuleConnections: additionalData.crossModuleConnections,
        },
      })
    },
    [session]
  )

  // BUSINESS INTELLIGENCE multiplication tracking
  const trackBUSINESS INTELLIGENCEMultiplication = useCallback(
    async (
      primaryModule: string,
      connectedModules: string[],
      intelligenceMultiplier: number,
      businessOutcome?: string
    ) => {
      await trackAIInteraction(primaryModule, 'cross_module', true, 0, {
        crossModuleConnections: connectedModules,
        BUSINESS INTELLIGENCELevel: intelligenceMultiplier,
        accuracy: 1.0, // Assume successful cross-module connection
      })

      // Track the multiplication event
      await track('BUSINESS INTELLIGENCE_multiplication', 'ai_interaction', {
        primaryModule,
        connectedModules,
        intelligenceMultiplier,
        businessOutcome,
        totalModules: connectedModules.length + 1,
      })
    },
    [trackAIInteraction, track]
  )

  // Business process tracking
  const trackBusinessProcess = useCallback(
    async (
      processType: BusinessProcessEvent['properties']['processType'],
      processId: string,
      status: BusinessProcessEvent['properties']['status'],
      additionalData: Partial<BusinessProcessEvent['properties']> = {}
    ) => {
      await eventTracker.trackBusinessProcess({
        eventName: `process_${processType}_${status}`,
        userId: session?.user?.id,
        tenantId: session?.user?.tenantId,
        properties: {
          processType,
          processId,
          status,
          duration: additionalData.duration,
          efficiency: additionalData.efficiency,
          roiImpact: additionalData.roiImpact,
          automationLevel: additionalData.automationLevel,
          stepsCompleted: additionalData.stepsCompleted,
          totalSteps: additionalData.totalSteps,
        },
      })
    },
    [session]
  )

  // Enterprise usage tracking
  const trackEnterpriseUsage = useCallback(
    async (
      action: string,
      collaborationType: EnterpriseEvent['properties']['collaborationType'],
      teamSize: number,
      additionalData: Partial<EnterpriseEvent['properties']> = {}
    ) => {
      await eventTracker.trackEnterpriseUsage({
        eventName: `enterprise_${action}`,
        userId: session?.user?.id,
        tenantId: session?.user?.tenantId,
        properties: {
          teamSize,
          collaborationType,
          action,
          modulesCombined: additionalData.modulesCombined,
          expansionSignal: additionalData.expansionSignal,
          seatUtilization: additionalData.seatUtilization,
          featureAdoption: additionalData.featureAdoption,
          integrationUsage: additionalData.integrationUsage,
        },
      })
    },
    [session]
  )

  // Conversion funnel tracking
  const trackConversionFunnel = useCallback(
    async (
      funnelName: string,
      step: string,
      completed: boolean,
      conversionValue?: number,
      abandonmentReason?: string
    ) => {
      await track(`funnel_${funnelName}_${step}`, 'conversion_funnel', {
        funnel: funnelName,
        step,
        completed,
        conversionValue,
        abandonmentReason,
        timestamp: new Date().toISOString(),
      })
    },
    [track]
  )

  // Error recovery tracking
  const trackErrorRecovery = useCallback(
    async (
      errorType: string,
      errorMessage: string,
      recovered: boolean,
      recoveryMethod?: string
    ) => {
      await track('error_recovery', 'error_recovery', {
        errorType,
        errorMessage,
        recovered,
        recoveryMethod,
        page: pathname,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      })
    },
    [track, pathname]
  )

  // Attribution tracking
  const trackAttribution = useCallback(
    async (source: string, medium: string, campaign?: string, content?: string, term?: string) => {
      await track('attribution', 'attribution', {
        source,
        medium,
        campaign,
        content,
        term,
        landingPage: pathname,
        timestamp: new Date().toISOString(),
      })
    },
    [track, pathname]
  )

  // Session duration tracking
  useEffect(() => {
    const handleBeforeUnload = () => {
      const sessionDuration = Date.now() - pageStartTime.current

      // Track session end
      track('session_end', 'user_journey', {
        sessionDuration,
        pagesViewed: 1, // Would need to track this globally
        lastPage: pathname,
      })
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [track, pathname])

  return {
    // Core tracking
    track,
    trackPageView,

    // User journey
    trackUserJourney,
    trackOnboardingStep,
    trackFeatureDiscovery,

    // Payment and conversion
    trackPaymentFlow,
    trackConversionFunnel,

    // AI and BUSINESS INTELLIGENCE
    trackAIInteraction,
    trackBUSINESS INTELLIGENCEMultiplication,

    // Business processes
    trackBusinessProcess,

    // Enterprise
    trackEnterpriseUsage,

    // System events
    trackErrorRecovery,
    trackAttribution,

    // Session info
    sessionId: eventTracker.getSessionId?.() || 'unknown',
    userId: session?.user?.id,
    tenantId: session?.user?.tenantId,
  }
}

// Utility functions
function getDeviceType(): 'mobile' | 'desktop' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop'

  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

// Higher-order component for automatic tracking
export function withTracking<T extends Record<string, unknown>>(
  Component: React.ComponentType<T>,
  trackingConfig?: {
    trackMount?: boolean
    trackUnmount?: boolean
    trackProps?: (keyof T)[]
  }
) {
  return function TrackedComponent(props: T) {
    const { track } = useEnhancedTracking()

    useEffect(() => {
      if (trackingConfig?.trackMount) {
        track(`component_mount_${Component.name}`, 'user_journey', {
          component: Component.name,
          props: trackingConfig.trackProps?.reduce(
            (acc, key) => {
              acc[key as string] = props[key]
              return acc
            },
            {} as Record<string, unknown>
          ),
        })
      }

      return () => {
        if (trackingConfig?.trackUnmount) {
          track(`component_unmount_${Component.name}`, 'user_journey', {
            component: Component.name,
          })
        }
      }
    }, [track])

    return <Component {...props} />
  }
}

export default useEnhancedTracking
