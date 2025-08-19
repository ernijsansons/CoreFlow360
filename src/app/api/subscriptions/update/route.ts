/**
 * Update Subscription API
 * PUT /api/subscriptions/update
 */

import { NextRequest, NextResponse } from 'next/server'
import { subscriptionManager } from '@/lib/subscription/subscription-manager'
import { getTenantFromSession } from '@/lib/auth/tenant-utils'
import { z } from 'zod'

const updateSchema = z.object({
  tier: z.enum(['starter', 'professional', 'enterprise']).optional(),
  billingCycle: z.enum(['monthly', 'annual']).optional(),
  users: z.number().min(1).optional(),
})

export async function PUT(request: NextRequest) {
  try {
    // SECURITY: Get tenant from authenticated session
    const tenantId = await getTenantFromSession(request)

    const body = await request.json()
    const data = updateSchema.parse(body)

    // Update subscription
    const subscription = await subscriptionManager.updateSubscription(tenantId, data)

    return NextResponse.json({
      subscription,
      message: 'Subscription updated successfully',
    })

  } catch (error) {
    console.error('Error updating subscription:', error)
    
    // Handle authentication/authorization errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid update data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update subscription' },
      { status: 500 }
    )
  }
}