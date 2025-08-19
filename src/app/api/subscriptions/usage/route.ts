/**
 * Record Usage Metrics API
 * POST /api/subscriptions/usage
 * GET /api/subscriptions/usage
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTenantFromSession, getUserFromSession } from '@/lib/auth/tenant-utils'
import { subscriptionManager } from '@/lib/subscription/subscription-manager'
import { z } from 'zod'

const recordUsageSchema = z.object({
  metricType: z.enum(['users', 'storage', 'api_calls', 'ai_operations']),
  value: z.number().min(0),
})

// POST - Record usage
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { metricType, value } = recordUsageSchema.parse(body)
    
    const tenantId = await getTenantFromSession(request)

    await subscriptionManager.recordUsage(tenantId, metricType, value)

    return NextResponse.json({
      success: true,
      message: 'Usage recorded successfully',
      metric: {
        type: metricType,
        value,
        recordedAt: new Date().toISOString(),
      },
    })

  } catch (error) {
    console.error('Error recording usage:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid usage data', details: error.errors },
        { status: 400 }
      )
    }

    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to record usage' },
      { status: 500 }
    )
  }
}

// GET - Check usage limits
export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantFromSession(request)

    const usageLimits = await subscriptionManager.checkUsageLimits(tenantId)

    return NextResponse.json({
      ...usageLimits,
      tenantId,
      checkedAt: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Error checking usage limits:', error)
    
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check usage limits' },
      { status: 500 }
    )
  }
}