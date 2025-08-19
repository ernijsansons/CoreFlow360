/**
 * CoreFlow360 - A/B Testing Framework
 * Comprehensive testing system for continuous UX improvement
 */

'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { useTrackEvent } from '@/components/analytics/AnalyticsProvider'

// A/B Test Configuration
export interface ABTestConfig {
  id: string
  name: string
  description: string
  variants: ABTestVariant[]
  targetAudience?: {
    userRoles?: string[]
    industries?: string[]
    regions?: string[]
    deviceTypes?: ('mobile' | 'desktop' | 'tablet')[]
    percentage?: number // 0-100, percentage of users to include
  }
  metrics: ABTestMetric[]
  startDate: Date
  endDate?: Date
  isActive: boolean
  hypothesis: string
  successCriteria: string[]
}

export interface ABTestVariant {
  id: string
  name: string
  description: string
  weight: number // 0-100, traffic allocation percentage
  config: Record<string, unknown> // Variant-specific configuration
}

export interface ABTestMetric {
  id: string
  name: string
  type: 'conversion' | 'engagement' | 'retention' | 'satisfaction'
  target: number
  unit: string
  description: string
}

// A/B Test Results
export interface ABTestResult {
  testId: string
  variantId: string
  userId: string
  metrics: Record<string, number>
  timestamp: Date
  sessionId: string
  userAgent: string
  deviceType: 'mobile' | 'desktop' | 'tablet'
}

// Current active tests (would come from API in real implementation)
const activeTests: ABTestConfig[] = [
  {
    id: 'onboarding-flow-v2',
    name: 'Enhanced Onboarding Flow',
    description: 'Testing improved onboarding with AI personalization',
    variants: [
      {
        id: 'control',
        name: 'Current Onboarding',
        description: 'Existing 4-step onboarding flow',
        weight: 50,
        config: { steps: 4, aiPersonalization: false },
      },
      {
        id: 'enhanced',
        name: 'AI-Enhanced Onboarding',
        description: 'New 3-step flow with AI recommendations',
        weight: 50,
        config: { steps: 3, aiPersonalization: true, predictiveSetup: true },
      },
    ],
    targetAudience: {
      percentage: 100,
      userRoles: ['admin', 'manager'],
      deviceTypes: ['desktop', 'mobile'],
    },
    metrics: [
      {
        id: 'completion_rate',
        name: 'Onboarding Completion Rate',
        type: 'conversion',
        target: 85,
        unit: '%',
        description: 'Percentage of users who complete the full onboarding',
      },
      {
        id: 'time_to_complete',
        name: 'Time to Complete',
        type: 'engagement',
        target: 300,
        unit: 'seconds',
        description: 'Average time to complete onboarding',
      },
      {
        id: 'user_satisfaction',
        name: 'User Satisfaction Score',
        type: 'satisfaction',
        target: 4.5,
        unit: '/5',
        description: 'Post-onboarding satisfaction rating',
      },
    ],
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-02-01'),
    isActive: true,
    hypothesis: 'AI-personalized onboarding will increase completion rates and satisfaction',
    successCriteria: [
      'Completion rate increases by 10%+',
      'Time to complete decreases by 20%+',
      'Satisfaction score increases by 0.3+ points',
    ],
  },
  {
    id: 'dashboard-layout-test',
    name: 'Dashboard Widget Layout',
    description: 'Testing different widget arrangements for better engagement',
    variants: [
      {
        id: 'grid',
        name: 'Grid Layout',
        description: 'Traditional grid-based widget layout',
        weight: 33,
        config: { layout: 'grid', columns: 3 },
      },
      {
        id: 'masonry',
        name: 'Masonry Layout',
        description: 'Pinterest-style masonry layout',
        weight: 33,
        config: { layout: 'masonry', adaptiveHeight: true },
      },
      {
        id: 'priority',
        name: 'Priority-Based Layout',
        description: 'AI-driven priority-based widget arrangement',
        weight: 34,
        config: { layout: 'priority', aiRanking: true, personalizedOrder: true },
      },
    ],
    targetAudience: {
      percentage: 75,
      userRoles: ['admin', 'manager'],
      deviceTypes: ['desktop'],
    },
    metrics: [
      {
        id: 'widget_interactions',
        name: 'Widget Interactions',
        type: 'engagement',
        target: 15,
        unit: 'clicks/session',
        description: 'Average widget interactions per session',
      },
      {
        id: 'session_duration',
        name: 'Dashboard Session Duration',
        type: 'engagement',
        target: 420,
        unit: 'seconds',
        description: 'Average time spent on dashboard',
      },
      {
        id: 'feature_discovery',
        name: 'Feature Discovery Rate',
        type: 'conversion',
        target: 65,
        unit: '%',
        description: 'Percentage of users who discover new features',
      },
    ],
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-03-15'),
    isActive: true,
    hypothesis: 'Priority-based layout will improve engagement and feature discovery',
    successCriteria: [
      'Widget interactions increase by 25%+',
      'Session duration increases by 30%+',
      'Feature discovery rate increases by 15%+',
    ],
  },
]

// A/B Testing Context
interface ABTestingContextType {
  activeTests: ABTestConfig[]
  getVariant: (testId: string) => ABTestVariant | null
  trackConversion: (testId: string, metricId: string, value: number) => void
  trackEvent: (testId: string, eventName: string, properties?: Record<string, unknown>) => void
  isUserInTest: (testId: string) => boolean
  getUserTests: () => string[]
}

const ABTestingContext = createContext<ABTestingContextType | null>(null)

// A/B Testing Provider
interface ABTestingProviderProps {
  children: React.ReactNode
  userId: string
  userRole: string
  industry: string
  deviceType: 'mobile' | 'desktop' | 'tablet'
}

export function ABTestingProvider({
  children,
  userId,
  userRole,
  industry,
  deviceType,
}: ABTestingProviderProps) {
  const [userVariants, setUserVariants] = useState<Record<string, string>>({})
  const [sessionId] = useState(() => Math.random().toString(36).substr(2, 9))
  const { trackEvent } = useTrackEvent()

  // Initialize user variants on mount
  useEffect(() => {
    const variants: Record<string, string> = {}

    activeTests.forEach((test) => {
      if (shouldIncludeUser(test, userRole, industry, deviceType)) {
        const variant = assignUserToVariant(test, userId)
        if (variant) {
          variants[test.id] = variant.id

          // Track test participation
          trackEvent('ab_test_participation', {
            test_id: test.id,
            variant_id: variant.id,
            user_role: userRole,
            industry: industry,
            device_type: deviceType,
          })
        }
      }
    })

    setUserVariants(variants)
  }, [userId, userRole, industry, deviceType, trackEvent])

  const getVariant = (testId: string): ABTestVariant | null => {
    const variantId = userVariants[testId]
    if (!variantId) return null

    const test = activeTests.find((t) => t.id === testId)
    return test?.variants.find((v) => v.id === variantId) || null
  }

  const trackConversion = (testId: string, metricId: string, value: number) => {
    const variant = getVariant(testId)
    if (!variant) return

    // Track conversion for analytics
    trackEvent('ab_test_conversion', {
      test_id: testId,
      variant_id: variant.id,
      metric_id: metricId,
      value: value,
      user_role: userRole,
      industry: industry,
      device_type: deviceType,
      session_id: sessionId,
    })

    // Store result (in real app, would send to API)
    const result: ABTestResult = {
      testId,
      variantId: variant.id,
      userId,
      metrics: { [metricId]: value },
      timestamp: new Date(),
      sessionId,
      userAgent: navigator.userAgent,
      deviceType,
    }

    // Store in localStorage for demo purposes
    const existingResults = JSON.parse(localStorage.getItem('ab_test_results') || '[]')
    existingResults.push(result)
    localStorage.setItem('ab_test_results', JSON.stringify(existingResults))
  }

  const trackTestEvent = (
    testId: string,
    eventName: string,
    properties?: Record<string, unknown>
  ) => {
    const variant = getVariant(testId)
    if (!variant) return

    trackEvent('ab_test_event', {
      test_id: testId,
      variant_id: variant.id,
      event_name: eventName,
      ...properties,
      user_role: userRole,
      industry: industry,
      device_type: deviceType,
      session_id: sessionId,
    })
  }

  const isUserInTest = (testId: string): boolean => {
    return testId in userVariants
  }

  const getUserTests = (): string[] => {
    return Object.keys(userVariants)
  }

  return (
    <ABTestingContext.Provider
      value={{
        activeTests,
        getVariant,
        trackConversion,
        trackEvent: trackTestEvent,
        isUserInTest,
        getUserTests,
      }}
    >
      {children}
    </ABTestingContext.Provider>
  )
}

// Hook to use A/B testing
export function useABTesting(): ABTestingContextType {
  const context = useContext(ABTestingContext)
  if (!context) {
    throw new Error('useABTesting must be used within an ABTestingProvider')
  }
  return context
}

// Utility functions
function shouldIncludeUser(
  test: ABTestConfig,
  userRole: string,
  industry: string,
  deviceType: 'mobile' | 'desktop' | 'tablet'
): boolean {
  const { targetAudience } = test

  if (!targetAudience) return true
  if (!test.isActive) return false
  if (test.endDate && new Date() > test.endDate) return false
  if (new Date() < test.startDate) return false

  // Check role targeting
  if (targetAudience.userRoles && !targetAudience.userRoles.includes(userRole)) {
    return false
  }

  // Check industry targeting
  if (targetAudience.industries && !targetAudience.industries.includes(industry)) {
    return false
  }

  // Check device type targeting
  if (targetAudience.deviceTypes && !targetAudience.deviceTypes.includes(deviceType)) {
    return false
  }

  // Check percentage targeting
  if (targetAudience.percentage && targetAudience.percentage < 100) {
    const hash = hashString(test.id + userRole + industry)
    const userPercentile = hash % 100
    if (userPercentile >= targetAudience.percentage) {
      return false
    }
  }

  return true
}

function assignUserToVariant(test: ABTestConfig, userId: string): ABTestVariant | null {
  // Use deterministic assignment based on user ID and test ID
  const hash = hashString(userId + test.id)
  const bucket = hash % 100

  let cumulative = 0
  for (const variant of test.variants) {
    cumulative += variant.weight
    if (bucket < cumulative) {
      return variant
    }
  }

  // Fallback to first variant
  return test.variants[0] || null
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

// Hook for specific test variants
export function useABTestVariant<T extends Record<string, unknown>>(
  testId: string,
  defaultConfig: T
): T {
  const { getVariant } = useABTesting()
  const variant = getVariant(testId)

  if (!variant) {
    return defaultConfig
  }

  return { ...defaultConfig, ...variant.config } as T
}

// Component for A/B test variants
interface ABTestVariantProps<T> {
  testId: string
  variants: Record<string, React.ComponentType<T>>
  fallback: React.ComponentType<T>
  props: T
}

export function ABTestVariant<T extends Record<string, unknown>>({
  testId,
  variants,
  fallback: Fallback,
  props,
}: ABTestVariantProps<T>) {
  const { getVariant } = useABTesting()
  const variant = getVariant(testId)

  if (!variant || !variants[variant.id]) {
    return <Fallback {...props} />
  }

  const VariantComponent = variants[variant.id]
  return <VariantComponent {...props} />
}

// A/B Test Analytics Hook
export function useABTestAnalytics() {
  const { activeTests } = useABTesting()

  const getTestResults = (testId: string): ABTestResult[] => {
    const allResults = JSON.parse(localStorage.getItem('ab_test_results') || '[]')
    return allResults.filter((result: ABTestResult) => result.testId === testId)
  }

  const calculateConversionRate = (testId: string, metricId: string): Record<string, number> => {
    const results = getTestResults(testId)
    const test = activeTests.find((t) => t.id === testId)

    if (!test) return {}

    const conversionRates: Record<string, number> = {}

    test.variants.forEach((variant) => {
      const variantResults = results.filter((r) => r.variantId === variant.id)
      const conversions = variantResults.filter((r) => r.metrics[metricId] > 0).length
      const total = variantResults.length

      conversionRates[variant.id] = total > 0 ? (conversions / total) * 100 : 0
    })

    return conversionRates
  }

  const getTestSummary = (testId: string) => {
    const results = getTestResults(testId)
    const test = activeTests.find((t) => t.id === testId)

    if (!test) return null

    const summary = {
      totalParticipants: results.length,
      variantBreakdown: {} as Record<string, number>,
      metrics: {} as Record<string, Record<string, number>>,
    }

    // Calculate variant breakdown
    test.variants.forEach((variant) => {
      summary.variantBreakdown[variant.id] = results.filter(
        (r) => r.variantId === variant.id
      ).length
    })

    // Calculate metrics for each variant
    test.metrics.forEach((metric) => {
      summary.metrics[metric.id] = calculateConversionRate(testId, metric.id)
    })

    return summary
  }

  return {
    getTestResults,
    calculateConversionRate,
    getTestSummary,
    activeTests,
  }
}

// Feature Flag System (built on top of A/B testing)
export interface FeatureFlag {
  id: string
  name: string
  description: string
  enabled: boolean
  rolloutPercentage: number
  targetAudience?: {
    userRoles?: string[]
    industries?: string[]
  }
}

const featureFlags: FeatureFlag[] = [
  {
    id: 'advanced-ai-insights',
    name: 'Advanced AI Insights',
    description: 'Enable GPT-4 powered advanced business insights',
    enabled: true,
    rolloutPercentage: 25,
    targetAudience: {
      userRoles: ['admin', 'manager'],
    },
  },
  {
    id: 'voice-commands',
    name: 'Voice Commands',
    description: 'Enable voice-activated navigation and commands',
    enabled: true,
    rolloutPercentage: 10,
  },
  {
    id: 'dark-mode-v2',
    name: 'Enhanced Dark Mode',
    description: 'New dark mode with better contrast and colors',
    enabled: false,
    rolloutPercentage: 50,
  },
]

export function useFeatureFlag(flagId: string): boolean {
  const { trackEvent } = useTrackEvent()
  const [userId] = useState(() => 'user_' + Math.random().toString(36).substr(2, 9))

  const flag = featureFlags.find((f) => f.id === flagId)
  if (!flag || !flag.enabled) return false

  // Check rollout percentage
  const hash = hashString(userId + flagId)
  const userPercentile = hash % 100
  const isEnabled = userPercentile < flag.rolloutPercentage

  // Track feature flag usage
  useEffect(() => {
    if (isEnabled) {
      trackEvent('feature_flag_enabled', {
        flag_id: flagId,
        rollout_percentage: flag.rolloutPercentage,
      })
    }
  }, [isEnabled, flagId, flag.rolloutPercentage, trackEvent])

  return isEnabled
}
