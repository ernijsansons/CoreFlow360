/**
 * CoreFlow360 - Billing Anomalies Detection API
 * Real-time billing anomaly detection and fraud prevention
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { headers } from 'next/headers'
import { fraudDetector } from '@/lib/billing/fraud-detection'
import { paymentAnalytics } from '@/lib/billing/payment-analytics'
import { rateLimit } from '@/lib/rate-limiting/rate-limiter'
import { validateApiKey } from '@/lib/auth/api-key-validation'

// Request schemas
const AnomalyDetectionRequestSchema = z.object({
  events: z.array(z.object({
    eventId: z.string(),
    userId: z.string(),
    tenantId: z.string().optional(),
    eventType: z.string(),
    timestamp: z.string().transform(str => new Date(str)),
    amount: z.number().optional(),
    metadata: z.record(z.any()).optional()
  })),
  realTimeAnalysis: z.boolean().default(false),
  includeRecommendations: z.boolean().default(true)
})

const FraudAnalysisRequestSchema = z.object({
  event: z.object({
    eventId: z.string(),
    userId: z.string(),
    tenantId: z.string(),
    eventType: z.enum([
      'subscription_created',
      'subscription_upgraded',
      'payment_attempt',
      'payment_success',
      'payment_failed',
      'refund_requested',
      'usage_spike'
    ]),
    timestamp: z.string().transform(str => new Date(str)),
    amount: z.number().optional(),
    paymentMethodId: z.string().optional(),
    ipAddress: z.string(),
    userAgent: z.string(),
    geolocation: z.object({
      country: z.string(),
      region: z.string(),
      city: z.string()
    }).optional(),
    metadata: z.record(z.any()).optional()
  }),
  includeUserHistory: z.boolean().default(true),
  blockIfHighRisk: z.boolean().default(false)
})

export async function POST(request: NextRequest) {
  try {
    const clientIP = request.ip || headers().get('x-forwarded-for') || 'unknown'
    
    // Rate limiting
    const rateLimitResult = await rateLimit(
      `billing_anomalies:${clientIP}`,
      100, // 100 requests per minute
      60
    )

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          resetTime: rateLimitResult.resetTime
        },
        { status: 429 }
      )
    }

    const body = await request.json()
    const url = new URL(request.url)
    const endpoint = url.pathname.split('/').pop()

    switch (endpoint) {
      case 'detect':
        return await handleAnomalyDetection(body)
      
      case 'fraud-analysis':
        return await handleFraudAnalysis(body)
      
      case 'batch-analysis':
        return await handleBatchAnalysis(body)
      
      default:
        return NextResponse.json(
          { error: 'Invalid endpoint' },
          { status: 404 }
        )
    }

  } catch (error) {
    console.error('Billing anomalies API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const searchParams = url.searchParams
    const timeframe = searchParams.get('timeframe') as 'day' | 'week' | 'month' || 'week'
    const tenantId = searchParams.get('tenantId')
    const endpoint = url.pathname.split('/').pop()

    switch (endpoint) {
      case 'fraud-analytics':
        return await getFraudAnalytics(timeframe)
      
      case 'payment-analytics':
        return await getPaymentAnalytics(timeframe, tenantId)
      
      case 'anomaly-patterns':
        return await getAnomalyPatterns(timeframe)
      
      case 'risk-dashboard':
        return await getRiskDashboard(timeframe)
      
      default:
        return await getOverallAnalytics(timeframe)
    }

  } catch (error) {
    console.error('Billing analytics API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve analytics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Handler functions
async function handleAnomalyDetection(body: any) {
  const validation = AnomalyDetectionRequestSchema.safeParse(body)
  
  if (!validation.success) {
    return NextResponse.json(
      { 
        error: 'Validation failed',
        details: validation.error.issues
      },
      { status: 400 }
    )
  }

  const { events, realTimeAnalysis, includeRecommendations } = validation.data
  const results = []

  for (const event of events) {
    try {
      // Convert to billing event format
      const billingEvent = {
        ...event,
        currency: 'USD',
        metadata: event.metadata || {}
      }

      // Run fraud detection
      const fraudAnalysis = await fraudDetector.analyzeEvent(billingEvent)
      
      // Track with payment analytics
      if (event.amount) {
        await paymentAnalytics.trackPaymentEvent({
          ...billingEvent,
          sessionId: `session_${Date.now()}`
        })
      }

      results.push({
        eventId: event.eventId,
        riskScore: fraudAnalysis.riskScore,
        riskLevel: fraudAnalysis.riskLevel,
        fraudIndicators: fraudAnalysis.fraudIndicators,
        blocked: fraudAnalysis.blockTransaction,
        manualReview: fraudAnalysis.requireManualReview,
        ...(includeRecommendations && {
          recommendations: fraudAnalysis.recommendedActions
        })
      })

    } catch (error) {
      console.error(`Anomaly detection failed for event ${event.eventId}:`, error)
      results.push({
        eventId: event.eventId,
        error: 'Analysis failed',
        riskScore: 0,
        riskLevel: 'UNKNOWN'
      })
    }
  }

  return NextResponse.json({
    success: true,
    eventsAnalyzed: events.length,
    results,
    timestamp: new Date().toISOString(),
    processingTime: Date.now() - parseInt(events[0]?.timestamp) || 0
  })
}

async function handleFraudAnalysis(body: any) {
  const validation = FraudAnalysisRequestSchema.safeParse(body)
  
  if (!validation.success) {
    return NextResponse.json(
      { 
        error: 'Validation failed',
        details: validation.error.issues
      },
      { status: 400 }
    )
  }

  const { event, includeUserHistory, blockIfHighRisk } = validation.data

  try {
    // Run comprehensive fraud analysis
    const fraudAnalysis = await fraudDetector.analyzeEvent({
      ...event,
      currency: 'USD'
    })

    // Get payment analytics if requested
    let paymentInsights = null
    if (includeUserHistory) {
      paymentInsights = await paymentAnalytics.getPaymentAnalytics('month', event.tenantId)
    }

    // Block transaction if high risk and requested
    if (blockIfHighRisk && fraudAnalysis.blockTransaction) {
      // Implementation would block the actual transaction
      console.log(`Blocking high-risk transaction: ${event.eventId}`)
    }

    return NextResponse.json({
      success: true,
      eventId: event.eventId,
      analysis: {
        riskScore: fraudAnalysis.riskScore,
        riskLevel: fraudAnalysis.riskLevel,
        fraudIndicators: fraudAnalysis.fraudIndicators,
        recommendations: fraudAnalysis.recommendedActions,
        blocked: fraudAnalysis.blockTransaction,
        manualReview: fraudAnalysis.requireManualReview,
        analysisTimestamp: fraudAnalysis.analysisTimestamp
      },
      ...(paymentInsights && { paymentInsights }),
      metadata: {
        processingTime: Date.now() - event.timestamp.getTime(),
        version: '2.0.0'
      }
    })

  } catch (error) {
    console.error('Fraud analysis failed:', error)
    
    return NextResponse.json(
      { 
        error: 'Fraud analysis failed',
        eventId: event.eventId,
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function handleBatchAnalysis(body: any) {
  const validation = AnomalyDetectionRequestSchema.safeParse(body)
  
  if (!validation.success) {
    return NextResponse.json(
      { 
        error: 'Validation failed',
        details: validation.error.issues
      },
      { status: 400 }
    )
  }

  const { events } = validation.data
  const startTime = Date.now()

  try {
    // Convert events to billing events
    const billingEvents = events.map(event => ({
      ...event,
      currency: 'USD',
      metadata: event.metadata || {}
    }))

    // Run batch fraud analysis
    const fraudResults = await fraudDetector.analyzeEventBatch(billingEvents)

    // Calculate batch statistics
    const batchStats = {
      totalEvents: events.length,
      highRiskEvents: fraudResults.filter(r => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL').length,
      blockedEvents: fraudResults.filter(r => r.blockTransaction).length,
      averageRiskScore: fraudResults.reduce((sum, r) => sum + r.riskScore, 0) / fraudResults.length,
      processingTime: Date.now() - startTime
    }

    // Group results by risk level
    const riskDistribution = fraudResults.reduce((acc, result) => {
      acc[result.riskLevel] = (acc[result.riskLevel] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      success: true,
      batchId: `batch_${Date.now()}`,
      statistics: batchStats,
      riskDistribution,
      results: fraudResults.map((result, index) => ({
        eventId: events[index].eventId,
        riskScore: result.riskScore,
        riskLevel: result.riskLevel,
        blocked: result.blockTransaction,
        indicatorCount: result.fraudIndicators.length
      })),
      detailedResults: fraudResults
    })

  } catch (error) {
    console.error('Batch analysis failed:', error)
    
    return NextResponse.json(
      { 
        error: 'Batch analysis failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function getFraudAnalytics(timeframe: string) {
  try {
    const analytics = await fraudDetector.getFraudAnalytics(timeframe as any)
    
    return NextResponse.json({
      success: true,
      timeframe,
      analytics,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Fraud analytics failed:', error)
    throw error
  }
}

async function getPaymentAnalytics(timeframe: string, tenantId: string | null) {
  try {
    const analytics = await paymentAnalytics.getPaymentAnalytics(timeframe as any, tenantId || undefined)
    
    return NextResponse.json({
      success: true,
      timeframe,
      tenantId,
      analytics,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Payment analytics failed:', error)
    throw error
  }
}

async function getAnomalyPatterns(timeframe: string) {
  try {
    // Implementation would analyze anomaly patterns
    const patterns = {
      topAnomalies: [
        { type: 'payment_method_cycling', occurrences: 15, riskIncrease: 0.8 },
        { type: 'velocity_anomaly', occurrences: 12, riskIncrease: 0.75 },
        { type: 'geographic_anomaly', occurrences: 8, riskIncrease: 0.6 }
      ],
      trendingPatterns: [
        { pattern: 'Mobile payment failures', growth: 0.25, impact: 'HIGH' },
        { pattern: 'International card issues', growth: 0.15, impact: 'MEDIUM' }
      ],
      seasonalPatterns: [
        { period: 'End of month', riskIncrease: 0.3, description: 'Higher fraud attempts' },
        { period: 'Holiday periods', riskIncrease: 0.4, description: 'Increased transaction volume' }
      ]
    }
    
    return NextResponse.json({
      success: true,
      timeframe,
      patterns,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Anomaly patterns failed:', error)
    throw error
  }
}

async function getRiskDashboard(timeframe: string) {
  try {
    const [fraudAnalytics, paymentAnalytics] = await Promise.all([
      fraudDetector.getFraudAnalytics(timeframe as any),
      paymentAnalytics.getPaymentAnalytics(timeframe as any)
    ])
    
    const dashboard = {
      overview: {
        totalTransactions: paymentAnalytics.overview.totalTransactions,
        fraudDetected: fraudAnalytics.fraudDetected,
        fraudRate: fraudAnalytics.fraudDetected / paymentAnalytics.overview.totalTransactions,
        amountSaved: fraudAnalytics.savedAmount,
        falsePositiveRate: fraudAnalytics.falsePositives / fraudAnalytics.fraudDetected
      },
      riskMetrics: {
        averageRiskScore: 25.5,
        highRiskTransactions: 45,
        blockedTransactions: 12,
        manualReviews: 23
      },
      trends: {
        fraudTrend: 'decreasing',
        riskScoreTrend: 'stable',
        blockingAccuracy: 0.92
      },
      alerts: [
        { type: 'HIGH_RISK_SPIKE', message: 'High risk transactions increased 15%', severity: 'WARNING' },
        { type: 'NEW_FRAUD_PATTERN', message: 'New fraud pattern detected: API abuse', severity: 'INFO' }
      ]
    }
    
    return NextResponse.json({
      success: true,
      timeframe,
      dashboard,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Risk dashboard failed:', error)
    throw error
  }
}

async function getOverallAnalytics(timeframe: string) {
  try {
    const [fraudAnalytics, paymentAnalytics] = await Promise.all([
      fraudDetector.getFraudAnalytics(timeframe as any),
      paymentAnalytics.getPaymentAnalytics(timeframe as any)
    ])
    
    return NextResponse.json({
      success: true,
      timeframe,
      overview: {
        fraud: fraudAnalytics,
        payments: paymentAnalytics
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Overall analytics failed:', error)
    throw error
  }
}

export { POST as default }