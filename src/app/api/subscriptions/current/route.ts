/**
 * Get Current Subscription API
 * GET /api/subscriptions/current
 */

import { NextRequest, NextResponse } from 'next/server'
import { subscriptionManager } from '@/lib/subscription/subscription-manager'
import { getTenantFromSession } from '@/lib/auth/tenant-utils'

export async function GET(request: NextRequest) {
  try {
    // SECURITY: Get tenant from authenticated session - prevents cross-tenant data access
    const tenantId = await getTenantFromSession(request)

    const subscription = await subscriptionManager.getCurrentSubscription(tenantId)

    if (!subscription) {
      return NextResponse.json({
        subscription: null,
        message: 'No active subscription found',
      })
    }

    // Get analytics
    const analytics = await subscriptionManager.getSubscriptionAnalytics(tenantId)

    return NextResponse.json({
      subscription,
      analytics,
    })

  } catch (error) {
    console.error('Error fetching subscription:', error)
    
    // Handle authentication/authorization errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}