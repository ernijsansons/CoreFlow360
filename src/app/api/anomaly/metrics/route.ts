/**
 * CoreFlow360 - Anomaly Metrics API
 * API endpoints for anomaly detection metrics and monitoring
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { BusinessAnomalyMonitor } from '@/lib/anomaly/business-anomaly-monitor'
import { paymentAnalytics } from '@/lib/billing/payment-analytics'
import { eventTracker } from '@/lib/events/enhanced-event-tracker'

// Global monitor instance
let globalMonitor: BusinessAnomalyMonitor | null = null

function getMonitor(): BusinessAnomalyMonitor {
  if (!globalMonitor) {
    globalMonitor = new BusinessAnomalyMonitor()
  }
  return globalMonitor
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const metricName = searchParams.get('metric')
    const timeframe = searchParams.get('timeframe') || '24h'

    const monitor = getMonitor()

    if (metricName) {
      // Get specific metric data
      const metricData = await getMetricData(metricName, timeframe, session.user.tenantId)
      
      return NextResponse.json({
        metric: metricName,
        timeframe,
        data: metricData,
        timestamp: new Date().toISOString()
      })
    } else {
      // Get all metrics overview
      const metrics = monitor.getMetrics()
      const overview = await Promise.all(
        metrics.map(async (metric) => {
          const data = await getMetricData(metric.name, timeframe, session.user.tenantId)
          return {
            ...metric,
            currentValue: data.length > 0 ? data[data.length - 1].value : 0,
            trend: calculateTrend(data),
            anomalyCount: 0 // Would be calculated from stored anomalies
          }
        })
      )

      return NextResponse.json({
        metrics: overview,
        timeframe,
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    console.error('Get metrics API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { metricName, timeframe = '24h' } = body

    if (!metricName) {
      return NextResponse.json(
        { error: 'Metric name is required' },
        { status: 400 }
      )
    }

    const monitor = getMonitor()
    
    // Get current metric data
    const metricData = await getMetricData(metricName, timeframe, session.user.tenantId)
    
    if (metricData.length === 0) {
      return NextResponse.json(
        { error: 'No data available for metric' },
        { status: 404 }
      )
    }

    // Run anomaly detection
    const anomalies = await monitor.monitorMetric(metricName, metricData)

    // Get business insights
    const insights = monitor.detector?.generateBusinessInsights(metricName, anomalies) || {
      summary: 'Analysis completed',
      impact: 'low' as const,
      actionItems: [],
      riskAssessment: 'Low risk'
    }

    return NextResponse.json({
      metricName,
      timeframe,
      anomalies,
      insights,
      dataPoints: metricData.length,
      anomaliesDetected: anomalies.filter(a => a.isAnomaly).length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Monitor metric API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions
async function getMetricData(metricName: string, timeframe: string, tenantId: string) {
  const now = new Date()
  let hours = 24
  
  switch (timeframe) {
    case '1h': hours = 1; break
    case '6h': hours = 6; break
    case '12h': hours = 12; break
    case '24h': hours = 24; break
    case '7d': hours = 24 * 7; break
    case '30d': hours = 24 * 30; break
  }

  const data = []
  
  // Generate data points based on timeframe
  const intervalMinutes = hours > 24 ? 60 : (hours > 6 ? 30 : 10)
  const totalPoints = (hours * 60) / intervalMinutes

  for (let i = totalPoints; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * intervalMinutes * 60 * 1000)
    let value: number

    // Generate realistic data with patterns and occasional anomalies
    const baseValue = getBaseValue(metricName)
    const pattern = getSeasonalPattern(metricName, timestamp)
    const noise = (Math.random() - 0.5) * 0.2 // ±10% noise
    const anomaly = Math.random() < 0.05 ? (Math.random() - 0.5) * 2 : 0 // 5% chance of anomaly
    
    value = baseValue * (1 + pattern + noise + anomaly)
    value = Math.max(0, value) // Ensure non-negative

    data.push({
      timestamp,
      value,
      metadata: { 
        source: 'api',
        tenantId,
        intervalMinutes
      }
    })
  }

  return data
}

function getBaseValue(metricName: string): number {
  switch (metricName) {
    case 'daily_revenue': return 25000
    case 'new_subscriptions': return 50
    case 'churn_rate': return 2
    case 'active_users': return 5000
    case 'api_response_time': return 200
    case 'error_rate': return 0.1
    default: return 100
  }
}

function getSeasonalPattern(metricName: string, timestamp: Date): number {
  const hour = timestamp.getHours()
  const dayOfWeek = timestamp.getDay()
  
  // Business hours pattern (higher activity during business hours)
  const businessHoursMultiplier = hour >= 9 && hour <= 17 ? 1.2 : 0.8
  
  // Weekend pattern (lower activity on weekends for business metrics)
  const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 0.7 : 1.0
  
  // Weekly pattern
  const weeklyPattern = Math.sin((dayOfWeek / 7) * 2 * Math.PI) * 0.1
  
  // Daily pattern
  const dailyPattern = Math.sin((hour / 24) * 2 * Math.PI) * 0.15
  
  switch (metricName) {
    case 'daily_revenue':
    case 'new_subscriptions':
    case 'active_users':
      return (businessHoursMultiplier * weekendMultiplier - 1) + weeklyPattern + dailyPattern
    case 'api_response_time':
    case 'error_rate':
      // System metrics might have different patterns
      return weeklyPattern + dailyPattern
    case 'churn_rate':
      // Churn might be more random
      return weeklyPattern * 0.5
    default:
      return weeklyPattern + dailyPattern
  }
}

function calculateTrend(data: any[]): 'increasing' | 'decreasing' | 'stable' {
  if (data.length < 2) return 'stable'
  
  const recent = data.slice(-10) // Last 10 points
  const older = data.slice(-20, -10) // Previous 10 points
  
  if (recent.length === 0 || older.length === 0) return 'stable'
  
  const recentAvg = recent.reduce((sum, d) => sum + d.value, 0) / recent.length
  const olderAvg = older.reduce((sum, d) => sum + d.value, 0) / older.length
  
  const change = (recentAvg - olderAvg) / olderAvg
  
  if (change > 0.1) return 'increasing'
  if (change < -0.1) return 'decreasing'
  return 'stable'
}