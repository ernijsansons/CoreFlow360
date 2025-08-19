/**
 * CoreFlow360 - Stripe Customer Portal
 * Manage subscriptions through Stripe's customer portal
 */

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { z } from 'zod'
import { prisma } from '@/lib/db'

const CustomerPortalRequestSchema = z.object({
  tenantId: z.string().min(1, 'Tenant ID is required'),
  returnUrl: z.string().url('Valid return URL is required'),
})

export async function POST(request: NextRequest) {
  try {
    // Initialize Stripe client
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-06-20',
    })

    const body = await request.json()
    const validatedData = CustomerPortalRequestSchema.parse(body)

    const { tenantId, returnUrl } = validatedData

    // Get tenant subscription
    const tenantSubscription = await prisma.tenantSubscription.findUnique({
      where: { tenantId },
    })

    if (!tenantSubscription || !tenantSubscription.stripeCustomerId) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
    }

    // Create customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: tenantSubscription.stripeCustomerId,
      return_url: returnUrl,
      configuration: process.env.STRIPE_PORTAL_CONFIG_ID,
    })

    // Log portal access
    await prisma.subscriptionEvent.create({
      data: {
        tenantSubscriptionId: tenantId,
        eventType: 'portal_accessed',
        newState: JSON.stringify({
          portal_session_id: session.id,
          accessed_at: new Date(),
        }),
        effectiveDate: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      portalUrl: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create portal session',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint to create a customer portal session',
    schema: {
      tenantId: 'string',
      returnUrl: 'string (url)',
    },
  })
}
