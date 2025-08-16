/**
 * CoreFlow360 - Anomaly Detection API
 * API endpoint for real-time anomaly detection
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AdvancedAnomalyDetector, DataPointSchema } from '@/lib/anomaly/advanced-anomaly-detector'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { eventTracker } from '@/lib/events/enhanced-event-tracker'

const DetectionRequestSchema = z.object({
  metricName: z.string(),
  dataPoints: z.array(DataPointSchema),
  config: z.object({
    sensitivity: z.number().min(0).max(1).optional(),
    algorithms: z.array(z.string()).optional(),
    businessContext: z.object({
      industry: z.string().optional(),
      businessModel: z.string().optional(),
      seasonality: z.array(z.string()).optional()
    }).optional()
  }).optional()
})

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
    const { metricName, dataPoints, config } = DetectionRequestSchema.parse(body)

    // Initialize detector with custom config if provided
    const detector = new AdvancedAnomalyDetector(config)

    // Load historical data for the metric (in production, from database)
    const historicalData = await loadHistoricalData(metricName, session.user.tenantId)
    if (historicalData.length > 0) {
      detector.addHistoricalData(metricName, historicalData)
    }

    // Detect anomalies
    const anomalies = detector.detectAnomalies(metricName, dataPoints)

    // Detect patterns in anomalies
    const patterns = detector.detectPatterns(anomalies)

    // Generate business insights
    const insights = detector.generateBusinessInsights(metricName, anomalies)

    // Track API usage
    await eventTracker.track({
      type: 'anomaly_detection_api_call',
      category: 'api_usage',
      properties: {
        metricName,
        dataPointsCount: dataPoints.length,
        anomaliesDetected: anomalies.filter(a => a.isAnomaly).length,
        tenantId: session.user.tenantId
      }
    })

    return NextResponse.json({
      anomalies,
      patterns,
      insights,
      metadata: {
        metricName,
        dataPointsAnalyzed: dataPoints.length,
        anomaliesDetected: anomalies.filter(a => a.isAnomaly).length,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Anomaly detection API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
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
    const limit = parseInt(searchParams.get('limit') || '100')

    if (!metricName) {
      return NextResponse.json(
        { error: 'Metric name is required' },
        { status: 400 }
      )
    }

    // Get recent anomalies for the metric (in production, from database)
    const recentAnomalies = await getRecentAnomalies(metricName, session.user.tenantId, limit)

    return NextResponse.json({
      metricName,
      anomalies: recentAnomalies,
      count: recentAnomalies.length
    })

  } catch (error) {
    console.error('Get anomalies API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions (in production, these would query your database)
async function loadHistoricalData(metricName: string, tenantId: string) {
  // Mock historical data - in production, load from database
  const data = []
  const now = new Date()
  
  for (let i = 30; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    let value: number
    
    switch (metricName) {
      case 'daily_revenue':
        value = 25000 + Math.random() * 10000 + Math.sin(i / 7) * 5000
        break
      case 'new_subscriptions':
        value = 50 + Math.random() * 20
        break
      case 'churn_rate':
        value = 2 + Math.random() * 2
        break
      case 'active_users':
        value = 5000 + Math.random() * 1000
        break
      case 'api_response_time':
        value = 200 + Math.random() * 100
        break
      case 'error_rate':
        value = 0.1 + Math.random() * 0.3
        break
      default:
        value = Math.random() * 100
    }
    
    data.push({
      timestamp,
      value,
      metadata: { source: 'historical', tenantId }
    })
  }
  
  return data
}

async function getRecentAnomalies(metricName: string, tenantId: string, limit: number) {
  // Mock recent anomalies - in production, query from database
  return []
}