'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { abTestManager } from '@/lib/ab-testing/ab-test-manager'

interface ABTestContextType {
  experiments: Record<string, any>
  isReady: boolean
  refreshExperiments: () => void
}

const ABTestContext = createContext<ABTestContextType>({
  experiments: {},
  isReady: false,
  refreshExperiments: () => {}
})

export function ABTestProvider({ children }: { children: React.ReactNode }) {
  const [experiments, setExperiments] = useState<Record<string, any>>({})
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (abTestManager) {
      const assignments = abTestManager.getActiveAssignments()
      setExperiments(assignments)
      setIsReady(true)
    }
  }, [])

  const refreshExperiments = () => {
    if (abTestManager) {
      const assignments = abTestManager.getActiveAssignments()
      setExperiments(assignments)
    }
  }

  return (
    <ABTestContext.Provider value={{ experiments, isReady, refreshExperiments }}>
      {children}
    </ABTestContext.Provider>
  )
}

export function useABTestContext() {
  return useContext(ABTestContext)
}