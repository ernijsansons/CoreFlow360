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
import { paymentAnalytics } from '@/lib/billing/payment-analytics'
import { fraudDetector } from '@/lib/billing/fraud-detection'
import { withIdempotency, extractStripeIdempotencyKey } from '@/middleware/idempotency'
import { createWebhookValidator, WEBHOOK_CONFIGS } from '@/lib/security/webhook-security'
import { withSignatureValidation } from '@/middleware/request-signature'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Create webhook security validator
const webhookValidator = createWebhookValidator(WEBHOOK_CONFIGS.stripe)

// Webhook handler with enhanced security and idempotency protection
async function handleWebhook(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')!

    // Enhanced security validation with timestamp and replay protection
    const securityResult = await webhookValidator.validateWebhook({
      body,
      headers: Object.fromEntries(headersList.entries()),
      method: request.method,
      url: request.url
    })

    if (!securityResult.isValid) {
      console.warn('Stripe webhook security validation failed:', {
        error: securityResult.error,
        metadata: securityResult.metadata,
        userAgent: headersList.get('user-agent'),
        ip: headersList.get('x-forwarded-for') || headersList.get('x-real-ip')
      })
      
      return NextResponse.json(
        { error: securityResult.error || 'Security validation failed' },
        { status: 400 }
      )
    }

    // Fallback to original Stripe signature verification for event parsing
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

    // Enhanced payment event tracking and fraud detection
    await trackPaymentEventWithAnalytics(event, headersList)

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
        // Unhandled event type - still track for analytics
        await trackUnhandledEvent(event)
    }

    return NextResponse.json({ 
      received: true,
      eventId: event.id,
      eventType: event.type 
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Enhanced payment event tracking with fraud detection
async function trackPaymentEventWithAnalytics(event: Stripe.Event, headersList: any) {
  try {
    let userId = ''
    let tenantId = ''
    let amount = 0
    let subscriptionId = ''
    let paymentMethodId = ''
    let eventType = 'payment_processing'
    let failureCode = ''
    let failureMessage = ''

    // Extract relevant data based on event type
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        userId = session.customer as string || ''
        amount = (session.amount_total || 0) / 100 // Convert cents to dollars
        subscriptionId = session.subscription as string || ''
        eventType = 'payment_succeeded'
        break

      case 'customer.subscription.created':
        const subCreated = event.data.object as Stripe.Subscription
        userId = subCreated.customer as string || ''
        subscriptionId = subCreated.id
        amount = (subCreated.items.data[0]?.price.unit_amount || 0) / 100
        eventType = 'subscription_created'
        break

      case 'customer.subscription.updated':
        const subUpdated = event.data.object as Stripe.Subscription
        userId = subUpdated.customer as string || ''
        subscriptionId = subUpdated.id
        amount = (subUpdated.items.data[0]?.price.unit_amount || 0) / 100
        eventType = 'subscription_upgraded'
        break

      case 'customer.subscription.deleted':
        const subDeleted = event.data.object as Stripe.Subscription
        userId = subDeleted.customer as string || ''
        subscriptionId = subDeleted.id
        eventType = 'subscription_cancelled'
        break

      case 'invoice.payment_succeeded':
        const invoiceSuccess = event.data.object as Stripe.Invoice
        userId = invoiceSuccess.customer as string || ''
        amount = (invoiceSuccess.amount_paid || 0) / 100
        subscriptionId = invoiceSuccess.subscription as string || ''
        eventType = 'payment_succeeded'
        break

      case 'invoice.payment_failed':
        const invoiceFailed = event.data.object as Stripe.Invoice
        userId = invoiceFailed.customer as string || ''
        amount = (invoiceFailed.amount_due || 0) / 100
        subscriptionId = invoiceFailed.subscription as string || ''
        eventType = 'payment_failed'
        failureCode = 'stripe_failure'
        failureMessage = 'Payment failed via Stripe'
        break
    }

    // Track with payment analytics
    await paymentAnalytics.trackPaymentEvent({
      eventId: event.id,
      userId,
      tenantId,
      sessionId: `stripe_${event.id}`,
      eventType: eventType as any,
      timestamp: new Date(event.created * 1000),
      amount,
      subscriptionId,
      paymentMethodId,
      stripePaymentIntentId: event.id,
      failureCode: failureCode || undefined,
      failureMessage: failureMessage || undefined,
      metadata: {
        source: 'stripe_webhook',
        userAgent: headersList.get('user-agent') || '',
        ipAddress: headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || ''
      }
    })

    // Run fraud detection for high-value or failed payments
    if (amount >= 100 || eventType === 'payment_failed') {
      await fraudDetector.analyzeEvent({
        eventId: event.id,
        userId,
        tenantId,
        eventType: eventType as any,
        timestamp: new Date(event.created * 1000),
        amount,
        paymentMethodId,
        ipAddress: headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '',
        userAgent: headersList.get('user-agent') || '',
        metadata: {
          stripeEventType: event.type,
          stripeEventId: event.id
        }
      })
    }

  } catch (error) {
    console.error('Payment event tracking failed:', error)
    // Don't fail the webhook for tracking errors
  }
}

async function trackUnhandledEvent(event: Stripe.Event) {
  try {
    // Track unhandled events for potential future implementation
    console.log(`Unhandled Stripe event: ${event.type}`, {
      eventId: event.id,
      eventType: event.type,
      created: event.created
    })
  } catch (error) {
    console.error('Unhandled event tracking failed:', error)
  }
}

// Export POST with signature validation and idempotency middleware
export const POST = withSignatureValidation(
  withIdempotency(handleWebhook, {
    keyHeader: 'stripe-signature',
    keyExtractor: extractStripeIdempotencyKey,
    ttlMinutes: 120, // 2 hours for webhook replay protection
    methods: ['POST']
  }),
  { 
    highSecurity: true,
    skipInDevelopment: false // Always require signatures for payment webhooks
  }
)

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