/**
 * Create Subscription Checkout Session API
 * POST /api/subscriptions/checkout-session
 */

import { NextRequest, NextResponse } from 'next/server'
import { subscriptionManager, SUBSCRIPTION_TIERS } from '@/lib/subscription/subscription-manager'
import { getTenantFromSession, getUserFromSession } from '@/lib/auth/tenant-utils'
import { z } from 'zod'

const checkoutSchema = z.object({
  tier: z.enum(['starter', 'professional', 'enterprise']),
  billingCycle: z.enum(['monthly', 'annual']).default('monthly'),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
})

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Get tenant from authenticated session
    const tenantId = await getTenantFromSession(request)
    const user = await getUserFromSession()

    const body = await request.json()
    const { tier, billingCycle, successUrl, cancelUrl } = checkoutSchema.parse(body)

    // Ensure subscription exists (in trial)
    let subscription = await subscriptionManager.getCurrentSubscription(tenantId)
    if (!subscription) {
      // Create trial subscription first
      const email = user.email || 'user@example.com'
      subscription = await subscriptionManager.createSubscription(
        tenantId,
        email,
        { tier, billingCycle, users: 1 }
      )
    }

    // Create Stripe checkout session
    const checkoutSession = await subscriptionManager.createCheckoutSession(
      tenantId,
      tier,
      billingCycle,
      successUrl,
      cancelUrl
    )

    return NextResponse.json({
      sessionId: checkoutSession.id,
      sessionUrl: checkoutSession.url,
      subscription: {
        tier,
        billingCycle,
        price: SUBSCRIPTION_TIERS[tier].basePrice + SUBSCRIPTION_TIERS[tier].perUserPrice,
      },
    })

  } catch (error) {
    console.error('Error creating checkout session:', error)
    
    // Handle authentication/authorization errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid checkout data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}