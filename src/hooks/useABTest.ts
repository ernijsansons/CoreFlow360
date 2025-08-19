'use client'

import { useEffect, useState } from 'react'
import { abTestManager } from '@/lib/ab-testing/ab-test-manager'
import { Variant } from '@/lib/ab-testing/experiments'

export function useABTest(experimentId: string) {
  const [variant, setVariant] = useState<Variant | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!abTestManager) {
      setLoading(false)
      return
    }

    // Get variant assignment
    const assignedVariant = abTestManager.getVariant(experimentId)
    setVariant(assignedVariant)
    setLoading(false)
  }, [experimentId])

  const trackConversion = (conversionType: string, value?: number) => {
    if (abTestManager) {
      abTestManager.trackConversion(experimentId, conversionType, value)
    }
  }

  const trackMetric = (metric: string, value: unknown) => {
    if (abTestManager) {
      abTestManager.trackMetric(experimentId, metric, value)
    }
  }

  return {
    variant,
    loading,
    isControl: variant?.id === 'control',
    config: variant?.config || {},
    trackConversion,
    trackMetric,
  }
}
