/**
 * CoreFlow360 - Conversion Analytics API
 * Comprehensive conversion funnel analytics and insights
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tenantId = searchParams.get('tenantId')
    const timeframe = searchParams.get('timeframe') || '30d'
    const segment = searchParams.get('segment') // 'role', 'agent', 'source'
    const includeDetails = searchParams.get('includeDetails') === 'true'

    console.log(`📊 Getting conversion analytics for ${tenantId || 'global'}, timeframe: ${timeframe}`)

    // Calculate date range
    const endDate = new Date()
    const startDate = getStartDate(timeframe)

    // Get all conversion events in timeframe
    const conversionEvents = await prisma.conversionEvent.findMany({
      where: {
        ...(tenantId && { tenantId }),
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { createdAt: 'desc' },
      ...(includeDetails && {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              createdAt: true
            }
          }
        }
      })
    })

    // Calculate funnel metrics
    const funnelMetrics = calculateFunnelMetrics(conversionEvents)
    
    // Calculate conversion rates
    const conversionRates = calculateConversionRates(conversionEvents)
    
    // Segment analysis
    const segmentAnalysis = segment ? calculateSegmentAnalysis(conversionEvents, segment) : null
    
    // Time series data for trends
    const timeSeriesData = calculateTimeSeriesData(conversionEvents, timeframe)
    
    // Top performing elements
    const topPerformers = calculateTopPerformers(conversionEvents)
    
    // User journey analysis
    const userJourneys = calculateUserJourneys(conversionEvents)

    // Generate insights and recommendations
    const insights = generateConversionInsights(funnelMetrics, conversionRates, timeSeriesData)
    const recommendations = generateConversionRecommendations(funnelMetrics, conversionRates)

    const response = {
      success: true,
      timeframe: {
        period: timeframe,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        daysAnalyzed: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      },
      overview: {
        totalEvents: conversionEvents.length,
        uniqueUsers: new Set(conversionEvents.map(e => e.userId).filter(Boolean)).size,
        conversionRate: conversionRates.overall,
        totalRevenue: conversionEvents
          .filter(e => e.conversionValue)
          .reduce((sum, e) => sum + (e.conversionValue || 0), 0)
      },
      funnel: funnelMetrics,
      conversionRates,
      trends: timeSeriesData,
      segments: segmentAnalysis,
      topPerformers,
      userJourneys: {
        averageTimeToConvert: userJourneys.averageTimeToConvert,
        commonPaths: userJourneys.commonPaths,
        dropoffPoints: userJourneys.dropoffPoints
      },
      insights,
      recommendations,
      metadata: {
        generatedAt: new Date().toISOString(),
        dataQuality: assessDataQuality(conversionEvents),
        sampleSize: conversionEvents.length >= 100 ? 'sufficient' : 'limited'
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Failed to get conversion analytics:', error)
    return NextResponse.json(
      { error: 'Failed to get conversion analytics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, filters, exportFormat } = body

    switch (action) {
      case 'export':
        return await exportConversionData(filters, exportFormat)
      
      case 'cohort_analysis':
        return await generateCohortAnalysis(filters)
      
      case 'attribution_analysis':
        return await generateAttributionAnalysis(filters)
        
      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('❌ Failed to process conversion analytics action:', error)
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    )
  }
}

// Helper functions
function getStartDate(timeframe: string): Date {
  const now = new Date()
  
  switch (timeframe) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    case '1y':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  }
}

function calculateFunnelMetrics(events: any[]) {
  const funnelSteps = [
    'role_selected',
    'agent_selected',
    'feature_usage',
    'upgrade_prompt',
    'upgrade_completed'
  ]

  const stepCounts = funnelSteps.reduce((acc, step) => {
    acc[step] = events.filter(e => e.eventType === step).length
    return acc
  }, {} as Record<string, number>)

  const funnel = funnelSteps.map((step, index) => {
    const count = stepCounts[step] || 0
    const previousCount = index > 0 ? stepCounts[funnelSteps[index - 1]] || 0 : count
    const conversionRate = previousCount > 0 ? (count / previousCount) * 100 : 0

    return {
      step,
      stepName: getStepName(step),
      users: count,
      conversionRate: Math.round(conversionRate * 100) / 100,
      dropoffRate: Math.round((100 - conversionRate) * 100) / 100,
      dropoffUsers: previousCount - count
    }
  })

  return {
    steps: funnel,
    overallConversionRate: funnel.length > 0 ? 
      Math.round((funnel[funnel.length - 1].users / funnel[0].users) * 10000) / 100 : 0
  }
}

function calculateConversionRates(events: any[]) {
  const totalUsers = new Set(events.map(e => e.userId).filter(Boolean)).size
  const convertedUsers = new Set(
    events
      .filter(e => e.actionTaken === 'converted' || e.eventType === 'upgrade_completed')
      .map(e => e.userId)
      .filter(Boolean)
  ).size

  // Conversion rates by different dimensions
  const byEventType = events.reduce((acc, event) => {
    if (!acc[event.eventType]) {
      acc[event.eventType] = { total: 0, converted: 0 }
    }
    acc[event.eventType].total++
    if (event.actionTaken === 'converted') {
      acc[event.eventType].converted++
    }
    return acc
  }, {} as Record<string, any>)

  const byUserPlan = events.reduce((acc, event) => {
    const plan = event.userPlan || 'unknown'
    if (!acc[plan]) {
      acc[plan] = { total: 0, converted: 0 }
    }
    acc[plan].total++
    if (event.actionTaken === 'converted') {
      acc[plan].converted++
    }
    return acc
  }, {} as Record<string, any>)

  return {
    overall: totalUsers > 0 ? Math.round((convertedUsers / totalUsers) * 10000) / 100 : 0,
    byEventType: Object.entries(byEventType).map(([type, data]: [string, any]) => ({
      eventType: type,
      conversionRate: data.total > 0 ? Math.round((data.converted / data.total) * 10000) / 100 : 0,
      totalEvents: data.total,
      conversions: data.converted
    })),
    byUserPlan: Object.entries(byUserPlan).map(([plan, data]: [string, any]) => ({
      userPlan: plan,
      conversionRate: data.total > 0 ? Math.round((data.converted / data.total) * 10000) / 100 : 0,
      totalEvents: data.total,
      conversions: data.converted
    }))
  }
}

function calculateSegmentAnalysis(events: any[], segment: string) {
  const segments = events.reduce((acc, event) => {
    let segmentKey = 'unknown'
    
    switch (segment) {
      case 'role':
        // Extract role from trigger context or user plan
        try {
          const context = JSON.parse(event.triggerContext || '{}')
          segmentKey = context.selectedRole || event.userPlan || 'unknown'
        } catch (e) {
          segmentKey = event.userPlan || 'unknown'
        }
        break
      case 'agent':
        segmentKey = event.currentModule || 'unknown'
        break
      case 'source':
        try {
          const context = JSON.parse(event.triggerContext || '{}')
          segmentKey = context.source || event.triggerType || 'unknown'
        } catch (e) {
          segmentKey = event.triggerType || 'unknown'
        }
        break
    }

    if (!acc[segmentKey]) {
      acc[segmentKey] = { total: 0, converted: 0, revenue: 0 }
    }
    acc[segmentKey].total++
    if (event.actionTaken === 'converted') {
      acc[segmentKey].converted++
      acc[segmentKey].revenue += event.conversionValue || 0
    }
    return acc
  }, {} as Record<string, any>)

  return Object.entries(segments).map(([key, data]: [string, any]) => ({
    segment: key,
    totalEvents: data.total,
    conversions: data.converted,
    conversionRate: data.total > 0 ? Math.round((data.converted / data.total) * 10000) / 100 : 0,
    revenue: data.revenue,
    averageRevenuePerConversion: data.converted > 0 ? Math.round((data.revenue / data.converted) * 100) / 100 : 0
  })).sort((a, b) => b.conversionRate - a.conversionRate)
}

function calculateTimeSeriesData(events: any[], timeframe: string) {
  const groupBy = timeframe === '7d' ? 'hour' : timeframe === '30d' ? 'day' : 'week'
  
  const grouped = events.reduce((acc, event) => {
    const date = new Date(event.createdAt)
    let key = ''
    
    switch (groupBy) {
      case 'hour':
        key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`
        break
      case 'day':
        key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
        break
      case 'week':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = `${weekStart.getFullYear()}-${weekStart.getMonth()}-${weekStart.getDate()}`
        break
    }

    if (!acc[key]) {
      acc[key] = { total: 0, converted: 0, date: date }
    }
    acc[key].total++
    if (event.actionTaken === 'converted') {
      acc[key].converted++
    }
    return acc
  }, {} as Record<string, any>)

  return Object.entries(grouped)
    .map(([key, data]: [string, any]) => ({
      period: key,
      date: data.date.toISOString(),
      totalEvents: data.total,
      conversions: data.converted,
      conversionRate: data.total > 0 ? Math.round((data.converted / data.total) * 10000) / 100 : 0
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

function calculateTopPerformers(events: any[]) {
  // Top converting event types
  const eventTypes = events.reduce((acc, event) => {
    if (!acc[event.eventType]) {
      acc[event.eventType] = { total: 0, converted: 0 }
    }
    acc[event.eventType].total++
    if (event.actionTaken === 'converted') {
      acc[event.eventType].converted++
    }
    return acc
  }, {} as Record<string, any>)

  const topEventTypes = Object.entries(eventTypes)
    .map(([type, data]: [string, any]) => ({
      eventType: type,
      conversionRate: data.total > 0 ? Math.round((data.converted / data.total) * 10000) / 100 : 0,
      totalEvents: data.total,
      conversions: data.converted
    }))
    .sort((a, b) => b.conversionRate - a.conversionRate)
    .slice(0, 5)

  // Top modules/agents
  const modules = events.reduce((acc, event) => {
    const module = event.currentModule || 'unknown'
    if (!acc[module]) {
      acc[module] = { total: 0, converted: 0 }
    }
    acc[module].total++
    if (event.actionTaken === 'converted') {
      acc[module].converted++
    }
    return acc
  }, {} as Record<string, any>)

  const topModules = Object.entries(modules)
    .map(([module, data]: [string, any]) => ({
      module,
      conversionRate: data.total > 0 ? Math.round((data.converted / data.total) * 10000) / 100 : 0,
      totalEvents: data.total,
      conversions: data.converted
    }))
    .sort((a, b) => b.conversionRate - a.conversionRate)
    .slice(0, 5)

  return {
    eventTypes: topEventTypes,
    modules: topModules
  }
}

function calculateUserJourneys(events: any[]) {
  // Group events by user
  const userJourneys = events.reduce((acc, event) => {
    if (!event.userId) return acc
    
    if (!acc[event.userId]) {
      acc[event.userId] = []
    }
    acc[event.userId].push(event)
    return acc
  }, {} as Record<string, any[]>)

  // Calculate average time to convert
  const conversionTimes = Object.values(userJourneys)
    .filter((journey: any[]) => journey.some(e => e.actionTaken === 'converted'))
    .map((journey: any[]) => {
      const firstEvent = journey.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0]
      const conversionEvent = journey.find(e => e.actionTaken === 'converted')
      
      if (firstEvent && conversionEvent) {
        return new Date(conversionEvent.createdAt).getTime() - new Date(firstEvent.createdAt).getTime()
      }
      return null
    })
    .filter(Boolean) as number[]

  const averageTimeToConvert = conversionTimes.length > 0 
    ? Math.round((conversionTimes.reduce((sum, time) => sum + time, 0) / conversionTimes.length) / (1000 * 60 * 60)) // hours
    : 0

  // Common paths (simplified)
  const paths = Object.values(userJourneys).map((journey: any[]) => 
    journey
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map(e => e.eventType)
      .join(' → ')
  )

  const pathCounts = paths.reduce((acc, path) => {
    acc[path] = (acc[path] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const commonPaths = Object.entries(pathCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([path, count]) => ({ path, count }))

  // Drop-off points
  const dropoffPoints = events.reduce((acc, event) => {
    if (event.actionTaken === 'dismissed' || event.actionTaken === 'declined') {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  return {
    averageTimeToConvert,
    commonPaths,
    dropoffPoints: Object.entries(dropoffPoints)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([eventType, count]) => ({ eventType, dropoffs: count }))
  }
}

function generateConversionInsights(funnelMetrics: any, conversionRates: any, timeSeriesData: any[]) {
  const insights = []

  // Funnel insights
  if (funnelMetrics.steps && funnelMetrics.steps.length > 0) {
    const worstStep = funnelMetrics.steps.reduce((worst, step) => 
      step.dropoffRate > worst.dropoffRate ? step : worst
    )
    
    if (worstStep.dropoffRate > 50) {
      insights.push({
        type: 'funnel',
        severity: 'high',
        title: 'High Drop-off Detected',
        description: `${worstStep.dropoffRate}% of users drop off at ${worstStep.stepName || 'unknown step'}`,
        recommendation: `Focus on improving the ${worstStep.stepName || 'unknown step'} experience`
      })
    }
  }

  // Conversion rate insights
  if (conversionRates.overall < 5) {
    insights.push({
      type: 'conversion',
      severity: 'medium',
      title: 'Low Overall Conversion Rate',
      description: `Current conversion rate is ${conversionRates.overall}%`,
      recommendation: 'Consider A/B testing different upgrade prompts and timing'
    })
  }

  // Trend insights
  if (timeSeriesData.length >= 7) {
    const recentData = timeSeriesData.slice(-7)
    const olderData = timeSeriesData.slice(0, 7)
    
    const recentAvg = recentData.reduce((sum, d) => sum + d.conversionRate, 0) / recentData.length
    const olderAvg = olderData.reduce((sum, d) => sum + d.conversionRate, 0) / olderData.length
    
    if (recentAvg < olderAvg * 0.8) {
      insights.push({
        type: 'trend',
        severity: 'high',
        title: 'Declining Conversion Trend',
        description: 'Conversion rates have decreased significantly in recent periods',
        recommendation: 'Investigate recent changes and consider reverting problematic updates'
      })
    }
  }

  return insights
}

function generateConversionRecommendations(funnelMetrics: any, conversionRates: any) {
  const recommendations = []

  // Funnel optimization
  if (funnelMetrics.overallConversionRate < 10) {
    recommendations.push({
      category: 'funnel',
      priority: 'high',
      title: 'Optimize Conversion Funnel',
      description: 'Implement progressive disclosure and reduce friction points',
      expectedImpact: '2-3x conversion rate improvement',
      effort: 'medium'
    })
  }

  // Timing optimization
  recommendations.push({
    category: 'timing',
    priority: 'medium',
    title: 'Optimize Prompt Timing',
    description: 'Show upgrade prompts at moments of highest engagement',
    expectedImpact: '20-30% conversion lift',
    effort: 'low'
  })

  // Personalization
  recommendations.push({
    category: 'personalization',
    priority: 'high',
    title: 'Personalize Upgrade Offers',
    description: 'Tailor messaging based on user role and usage patterns',
    expectedImpact: '40-50% conversion improvement',
    effort: 'high'
  })

  return recommendations
}

function assessDataQuality(events: any[]): string {
  const hasUserIds = events.filter(e => e.userId).length / events.length
  const hasActionTaken = events.filter(e => e.actionTaken).length / events.length
  const hasContext = events.filter(e => e.triggerContext).length / events.length

  const quality = (hasUserIds + hasActionTaken + hasContext) / 3

  if (quality > 0.8) return 'high'
  if (quality > 0.6) return 'medium'
  return 'low'
}

function getStepName(stepId: string): string {
  const names: Record<string, string> = {
    'role_selected': 'Role Selection',
    'agent_selected': 'Agent Selection',
    'feature_usage': 'Feature Usage',
    'upgrade_prompt': 'Upgrade Prompt',
    'upgrade_completed': 'Upgrade Completed'
  }
  return names[stepId] || stepId
}

// Additional helper functions for POST actions
async function exportConversionData(filters: any, format: string) {
  // Implementation for data export
  return NextResponse.json({
    success: true,
    message: 'Export functionality not yet implemented',
    format
  })
}

async function generateCohortAnalysis(filters: any) {
  // Implementation for cohort analysis
  return NextResponse.json({
    success: true,
    message: 'Cohort analysis functionality not yet implemented'
  })
}

async function generateAttributionAnalysis(filters: any) {
  // Implementation for attribution analysis
  return NextResponse.json({
    success: true,
    message: 'Attribution analysis functionality not yet implemented'
  })
}