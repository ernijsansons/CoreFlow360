/**
 * Custom hook for fetching AI-generated dashboard insights
 */

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { DashboardAIData, AIInsight } from '@/lib/ai/dashboard-insights-generator'

interface UseDashboardInsightsOptions {
  timeRange?: '1d' | '7d' | '30d' | '90d'
  department?: string
  autoRefresh?: boolean
  refreshInterval?: number // in milliseconds
}

interface UseDashboardInsightsReturn {
  insights: DashboardAIData | null
  activities: AIInsight[]
  isLoading: boolean
  error: Error | null
  refresh: () => Promise<void>
  lastUpdated: Date | null
}

export function useDashboardInsights(
  options: UseDashboardInsightsOptions = {}
): UseDashboardInsightsReturn {
  const { data: session } = useSession()
  const {
    timeRange = '7d',
    department,
    autoRefresh = false,
    refreshInterval = 300000, // 5 minutes default
  } = options

  const [insights, setInsights] = useState<DashboardAIData | null>(null)
  const [activities, setActivities] = useState<AIInsight[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchInsights = useCallback(async (forceRefresh = false) => {
    if (!session?.user) return

    setIsLoading(true)
    setError(null)

    try {
      // Fetch dashboard insights
      const queryParams = new URLSearchParams({
        timeRange,
        ...(department && { department }),
        ...(forceRefresh && { refresh: 'true' }),
      })

      const insightsResponse = await fetch(`/api/dashboard/insights?${queryParams}`)
      if (!insightsResponse.ok) {
        throw new Error('Failed to fetch dashboard insights')
      }

      const insightsData: DashboardAIData = await insightsResponse.json()
      setInsights(insightsData)

      // Fetch activity feed
      const activityResponse = await fetch('/api/dashboard/activity?limit=10')
      if (activityResponse.ok) {
        const activityData = await activityResponse.json()
        setActivities(activityData.activities || [])
      }

      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error fetching dashboard insights:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }, [session, timeRange, department])

  // Initial fetch
  useEffect(() => {
    fetchInsights()
  }, [fetchInsights])

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || !session?.user) return

    const intervalId = setInterval(() => {
      fetchInsights(true)
    }, refreshInterval)

    return () => clearInterval(intervalId)
  }, [autoRefresh, refreshInterval, fetchInsights, session])

  const refresh = useCallback(async () => {
    await fetchInsights(true)
  }, [fetchInsights])

  return {
    insights,
    activities,
    isLoading,
    error,
    refresh,
    lastUpdated,
  }
}