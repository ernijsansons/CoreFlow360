/**
 * Create Subscription API
 * POST /api/subscriptions/create
 */

import { NextRequest, NextResponse } from 'next/server'
import { subscriptionManager } from '@/lib/subscription/subscription-manager'
import { getTenantFromSession, getUserFromSession } from '@/lib/auth/tenant-utils'
import { z } from 'zod'

const createSchema = z.object({
  tier: z.enum(['starter', 'professional', 'enterprise']),
  billingCycle: z.enum(['monthly', 'annual']).default('monthly'),
  users: z.number().min(1).default(1),
})

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Get tenant from authenticated session
    const tenantId = await getTenantFromSession(request)
    const user = await getUserFromSession()

    const body = await request.json()
    const data = createSchema.parse(body)
    
    const email = user.email || 'user@example.com'

    // Check if subscription already exists
    const existing = await subscriptionManager.getCurrentSubscription(tenantId)
    if (existing) {
      return NextResponse.json(
        { error: 'Subscription already exists. Please upgrade instead.' },
        { status: 409 }
      )
    }

    // Create subscription
    const subscription = await subscriptionManager.createSubscription(
      tenantId,
      email,
      data
    )

    return NextResponse.json({
      subscription,
      message: 'Subscription created successfully. You have 14 days free trial.',
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating subscription:', error)
    
    // Handle authentication/authorization errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid subscription data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create subscription' },
      { status: 500 }
    )
  }
}