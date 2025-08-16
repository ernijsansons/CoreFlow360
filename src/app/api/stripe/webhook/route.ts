/**
 * CoreFlow360 - Stripe Webhook Handler
 * Process Stripe subscription events and update module activations
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { verifyWebhookSignature } from '@/lib/stripe/webhook-signature'
import { handleCheckoutCompleted } from '@/lib/stripe/webhook-events/checkout-completed'
import { handleSubscriptionCreated } from '@/lib/stripe/webhook-events/subscription-created'
import { handleSubscriptionUpdated } from '@/lib/stripe/webhook-events/subscription-updated'
import { handleSubscriptionDeleted } from '@/lib/stripe/webhook-events/subscription-deleted'
import { handlePaymentSucceeded } from '@/lib/stripe/webhook-events/payment-succeeded'
import { handlePaymentFailed } from '@/lib/stripe/webhook-events/payment-failed'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')!

    // Verify webhook signature
    const verificationResult = await verifyWebhookSignature(
      body,
      signature,
      endpointSecret,
      stripe
    )

    if (!verificationResult.success || !verificationResult.event) {
      return NextResponse.json(
        { error: verificationResult.error || 'Invalid signature' },
        { status: 400 }
      )
    }

    const event = verificationResult.event

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
        
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
        
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        // Unhandled event type - no action needed
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Stripe webhook endpoint - POST only',
    supportedEvents: [
      'checkout.session.completed',
      'customer.subscription.created',
      'customer.subscription.updated', 
      'customer.subscription.deleted',
      'invoice.payment_succeeded',
      'invoice.payment_failed'
    ]
  })
}