/**
 * CoreFlow360 - Bayesian A/B Testing Hook
 * React hook for managing A/B tests with Bayesian analysis
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { BayesianAnalyzer, type BayesianResult, type BayesianConfig } from '@/lib/testing/bayesian-analysis'
import { eventTracker } from '@/lib/events/enhanced-event-tracker'

interface TestVariant {
  id: string
  name: string
  visitors: number
  conversions: number
  conversionRate: number
}

interface ABTest {
  id: string
  name: string
  description: string
  status: 'draft' | 'running' | 'paused' | 'completed'
  variants: TestVariant[]
  startDate: Date
  endDate?: Date
  config: BayesianConfig
}

interface UseBayesianTestingReturn {
  tests: ABTest[]
  currentAnalysis: BayesianResult | null
  isAnalyzing: boolean
  createTest: (test: Omit<ABTest, 'id' | 'status' | 'startDate'>) => Promise<string>
  updateTest: (testId: string, updates: Partial<ABTest>) => Promise<void>
  startTest: (testId: string) => Promise<void>
  stopTest: (testId: string) => Promise<void>
  analyzeTest: (testId: string) => Promise<BayesianResult>
  recordConversion: (testId: string, variantId: string, userId: string) => Promise<void>
  recordVisitor: (testId: string, variantId: string, userId: string) => Promise<void>
  getTestRecommendation: (testId: string) => Promise<{
    action: 'continue' | 'stop_winner' | 'stop_inconclusive'
    winningVariant?: string
    confidence: number
    reasoning: string
  }>
}

export function useBayesianTesting(): UseBayesianTestingReturn {
  const [tests, setTests] = useState<ABTest[]>([])
  const [currentAnalysis, setCurrentAnalysis] = useState<BayesianResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzer] = useState(() => new BayesianAnalyzer())

  // Load tests from storage/API
  useEffect(() => {
    loadTests()
  }, [])

  const loadTests = async () => {
    try {
      // In production, this would load from your API
      const stored = localStorage.getItem('coreflow_ab_tests')
      if (stored) {
        const parsedTests = JSON.parse(stored, (key, value) => {
          if (key === 'startDate' || key === 'endDate') {
            return value ? new Date(value) : undefined
          }
          return value
        })
        setTests(parsedTests)
      }
    } catch (error) {
      console.error('Failed to load A/B tests:', error)
    }
  }

  const saveTests = async (updatedTests: ABTest[]) => {
    try {
      // In production, this would save to your API
      localStorage.setItem('coreflow_ab_tests', JSON.stringify(updatedTests))
      setTests(updatedTests)
    } catch (error) {
      console.error('Failed to save A/B tests:', error)
    }
  }

  const createTest = useCallback(async (testData: Omit<ABTest, 'id' | 'status' | 'startDate'>): Promise<string> => {
    const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const newTest: ABTest = {
      ...testData,
      id: testId,
      status: 'draft',
      startDate: new Date(),
      variants: testData.variants.map(v => ({
        ...v,
        visitors: 0,
        conversions: 0,
        conversionRate: 0
      }))
    }

    const updatedTests = [...tests, newTest]
    await saveTests(updatedTests)

    // Track test creation
    await eventTracker.track({
      type: 'ab_test_created',
      category: 'testing',
      properties: {
        testId,
        variantCount: newTest.variants.length,
        testName: newTest.name
      }
    })

    return testId
  }, [tests])

  const updateTest = useCallback(async (testId: string, updates: Partial<ABTest>) => {
    const updatedTests = tests.map(test => 
      test.id === testId ? { ...test, ...updates } : test
    )
    await saveTests(updatedTests)
  }, [tests])

  const startTest = useCallback(async (testId: string) => {
    await updateTest(testId, { 
      status: 'running',
      startDate: new Date()
    })

    // Track test start
    await eventTracker.track({
      type: 'ab_test_started',
      category: 'testing',
      properties: { testId }
    })
  }, [updateTest])

  const stopTest = useCallback(async (testId: string) => {
    await updateTest(testId, { 
      status: 'completed',
      endDate: new Date()
    })

    // Track test completion
    await eventTracker.track({
      type: 'ab_test_stopped',
      category: 'testing',
      properties: { testId }
    })
  }, [updateTest])

  const recordVisitor = useCallback(async (testId: string, variantId: string, userId: string) => {
    const test = tests.find(t => t.id === testId)
    if (!test || test.status !== 'running') return

    const updatedVariants = test.variants.map(variant => {
      if (variant.id === variantId) {
        const newVisitors = variant.visitors + 1
        return {
          ...variant,
          visitors: newVisitors,
          conversionRate: newVisitors > 0 ? variant.conversions / newVisitors : 0
        }
      }
      return variant
    })

    await updateTest(testId, { variants: updatedVariants })

    // Track visitor
    await eventTracker.track({
      type: 'ab_test_visitor',
      category: 'testing',
      properties: {
        testId,
        variantId,
        userId
      }
    })
  }, [tests, updateTest])

  const recordConversion = useCallback(async (testId: string, variantId: string, userId: string) => {
    const test = tests.find(t => t.id === testId)
    if (!test || test.status !== 'running') return

    const updatedVariants = test.variants.map(variant => {
      if (variant.id === variantId) {
        const newConversions = variant.conversions + 1
        return {
          ...variant,
          conversions: newConversions,
          conversionRate: variant.visitors > 0 ? newConversions / variant.visitors : 0
        }
      }
      return variant
    })

    await updateTest(testId, { variants: updatedVariants })

    // Track conversion
    await eventTracker.track({
      type: 'ab_test_conversion',
      category: 'testing',
      properties: {
        testId,
        variantId,
        userId,
        conversionValue: 1
      }
    })
  }, [tests, updateTest])

  const analyzeTest = useCallback(async (testId: string): Promise<BayesianResult> => {
    const test = tests.find(t => t.id === testId)
    if (!test) throw new Error('Test not found')

    setIsAnalyzing(true)
    
    try {
      // Prepare data for Bayesian analysis
      const testResults = test.variants.map(variant => ({
        variant: variant.id,
        visitors: variant.visitors,
        conversions: variant.conversions,
        conversionRate: variant.conversionRate
      }))

      // Run Bayesian analysis
      const analysis = analyzer.analyze(testId, testResults)
      setCurrentAnalysis(analysis)

      // Track analysis
      await eventTracker.track({
        type: 'ab_test_analyzed',
        category: 'testing',
        properties: {
          testId,
          confidence: analysis.analysis.confidence,
          recommendedAction: analysis.analysis.recommendedAction,
          significanceReached: analysis.analysis.significanceReached
        }
      })

      return analysis
    } finally {
      setIsAnalyzing(false)
    }
  }, [tests, analyzer])

  const getTestRecommendation = useCallback(async (testId: string) => {
    const analysis = await analyzeTest(testId)
    const { analysis: bayesianAnalysis } = analysis

    let reasoning = ''
    let winningVariant: string | undefined

    // Find the variant with highest probability to beat control
    const bestVariant = Object.entries(bayesianAnalysis.probabilityToBeatControl)
      .reduce((best, [variant, prob]) => 
        prob > best.prob ? { variant, prob } : best, 
        { variant: '', prob: 0 }
      )

    if (bestVariant.variant) {
      winningVariant = bestVariant.variant
    }

    switch (bayesianAnalysis.recommendedAction) {
      case 'continue':
        reasoning = `Test needs more data. Current sample size: ${analysis.results.reduce((sum, r) => sum + r.visitors, 0)} visitors. ` +
                   `Continue until statistical significance is reached or maximum sample size is met.`
        break
      case 'stop_winner':
        reasoning = `Statistical significance reached with ${(bayesianAnalysis.confidence * 100).toFixed(1)}% confidence. ` +
                   `Variant ${winningVariant} shows clear improvement over control.`
        break
      case 'stop_inconclusive':
        reasoning = `Maximum sample size reached but no clear winner emerged. ` +
                   `Consider redesigning the test with larger effect sizes or different variations.`
        break
    }

    return {
      action: bayesianAnalysis.recommendedAction,
      winningVariant,
      confidence: bayesianAnalysis.confidence,
      reasoning
    }
  }, [analyzeTest])

  return {
    tests,
    currentAnalysis,
    isAnalyzing,
    createTest,
    updateTest,
    startTest,
    stopTest,
    analyzeTest,
    recordConversion,
    recordVisitor,
    getTestRecommendation
  }
}

export default useBayesianTesting