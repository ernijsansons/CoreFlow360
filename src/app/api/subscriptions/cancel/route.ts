/**
 * Cancel Subscription API
 * POST /api/subscriptions/cancel
 */

import { NextRequest, NextResponse } from 'next/server'
import { subscriptionManager } from '@/lib/subscription/subscription-manager'
import { getTenantFromSession } from '@/lib/auth/tenant-utils'
import { z } from 'zod'

const cancelSchema = z.object({
  reason: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Get tenant from authenticated session
    const tenantId = await getTenantFromSession(request)

    const body = await request.json()
    const { reason } = cancelSchema.parse(body)

    // Cancel subscription
    const result = await subscriptionManager.cancelSubscription(tenantId, reason)

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error cancelling subscription:', error)
    
    // Handle authentication/authorization errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}