/**
 * CoreFlow360 - Stripe Usage Reporting
 * Report usage-based billing metrics to Stripe
 */

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { z } from 'zod'
import { prisma } from '@/lib/db'

const UsageReportSchema = z.object({
  tenantId: z.string().min(1, "Tenant ID is required"),
  metric: z.enum(['api_calls', 'ai_operations', 'storage_gb', 'active_users']),
  quantity: z.number().positive("Quantity must be positive"),
  timestamp: z.string().datetime().optional(),
  action: z.enum(['increment', 'set']).default('increment')
})

export async function POST(request: NextRequest) {
  try {
    // Initialize Stripe client
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      )
    }
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-06-20'
    })
    
    const body = await request.json()
    const validatedData = UsageReportSchema.parse(body)
    
    const { tenantId, metric, quantity, timestamp, action } = validatedData

    // Get tenant subscription
    const tenantSubscription = await prisma.tenantSubscription.findUnique({
      where: { tenantId }
    })

    if (!tenantSubscription || !tenantSubscription.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

    // Get subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(
      tenantSubscription.stripeSubscriptionId
    )

    // Find the usage-based price item for this metric
    const usageItem = subscription.items.data.find(item => {
      return item.price.metadata?.metric === metric
    })

    if (!usageItem) {
      // Store usage for later billing if no usage-based pricing
      await prisma.subscriptionUsage.create({
        data: {
          tenantSubscriptionId: tenantSubscription.id,
          billingPeriodStart: new Date(),
          billingPeriodEnd: new Date(),
          apiCalls: metric === 'api_calls' ? quantity : 0,
          aiOperations: metric === 'ai_operations' ? quantity : 0,
          storageUsed: metric === 'storage_gb' ? quantity : 0,
          activeUsers: metric === 'active_users' ? quantity : 0,
          metadata: JSON.stringify({
            metric,
            quantity,
            action,
            recorded_at: timestamp || new Date()
          })
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Usage recorded locally (no usage-based pricing configured)',
        tenantId,
        metric,
        quantity
      })
    }

    // Report usage to Stripe
    const usageRecord = await stripe.subscriptionItems.createUsageRecord(
      usageItem.id,
      {
        quantity: Math.round(quantity),
        timestamp: timestamp ? Math.floor(new Date(timestamp).getTime() / 1000) : undefined,
        action: action as 'increment' | 'set'
      }
    )

    // Store usage record locally
    await prisma.subscriptionUsage.create({
      data: {
        tenantSubscriptionId: tenantSubscription.id,
        billingPeriodStart: new Date(subscription.current_period_start * 1000),
        billingPeriodEnd: new Date(subscription.current_period_end * 1000),
        apiCalls: metric === 'api_calls' ? quantity : 0,
        aiOperations: metric === 'ai_operations' ? quantity : 0,
        storageUsed: metric === 'storage_gb' ? quantity : 0,
        activeUsers: metric === 'active_users' ? quantity : 0,
        metadata: JSON.stringify({
          stripe_usage_record_id: usageRecord.id,
          metric,
          quantity,
          action
        })
      }
    })

    return NextResponse.json({
      success: true,
      usageRecordId: usageRecord.id,
      tenantId,
      metric,
      quantity,
      timestamp: new Date(usageRecord.timestamp * 1000).toISOString()
    })

  } catch (error) {
    console.error('Usage reporting error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid request data', 
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to report usage' 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tenantId = searchParams.get('tenantId')

    if (!tenantId) {
      return NextResponse.json({
        message: 'Usage Reporting API - POST to report usage, GET with tenantId for summary',
        schema: {
          tenantId: 'string',
          metric: 'api_calls | ai_operations | storage_gb | active_users',
          quantity: 'number',
          timestamp: 'ISO 8601 datetime (optional)',
          action: 'increment | set (optional)'
        }
      })
    }

    // Get usage summary for tenant
    const tenantSubscription = await prisma.tenantSubscription.findUnique({
      where: { tenantId }
    })

    if (!tenantSubscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      )
    }

    // Get current period usage
    const currentPeriodUsage = await prisma.subscriptionUsage.findMany({
      where: {
        tenantSubscriptionId: tenantSubscription.id,
        billingPeriodStart: {
          gte: tenantSubscription.currentPeriodStart || new Date(0)
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Aggregate usage
    const usageSummary = currentPeriodUsage.reduce((acc, usage) => {
      acc.apiCalls += usage.apiCalls
      acc.aiOperations += usage.aiOperations
      acc.storageUsed = Math.max(acc.storageUsed, usage.storageUsed)
      acc.activeUsers = Math.max(acc.activeUsers, usage.activeUsers)
      return acc
    }, {
      apiCalls: 0,
      aiOperations: 0,
      storageUsed: 0,
      activeUsers: 0
    })

    return NextResponse.json({
      tenantId,
      currentPeriod: {
        start: tenantSubscription.currentPeriodStart,
        end: tenantSubscription.currentPeriodEnd
      },
      usage: usageSummary,
      recordCount: currentPeriodUsage.length
    })

  } catch (error) {
    console.error('Error fetching usage summary:', error)
    return NextResponse.json(
      { error: 'Failed to fetch usage summary' },
      { status: 500 }
    )
  }
}