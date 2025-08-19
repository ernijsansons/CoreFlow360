/**
 * CoreFlow360 - Stripe Webhook Handler
 * Handles subscription lifecycle events from Stripe
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { constructWebhookEvent } from '@/lib/stripe/stripe'
import { prisma } from '@/lib/db'
import { handleError, ErrorContext } from '@/lib/error-handler'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const context: ErrorContext = {
    endpoint: '/api/stripe/webhooks',
    method: 'POST',
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
    requestId: request.headers.get('x-request-id') || undefined,
  }

  try {
    const body = await request.text()
    const signature = headers().get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
    }

    // Construct webhook event
    const event = await constructWebhookEvent(body, signature)

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
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    return handleError(error, context)
  }
}

/**
 * Handle successful checkout completion
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (!session.customer || !session.subscription) {
    return
  }

  const tenantId = session.metadata?.tenantId
  if (!tenantId) {
    return
  }

  // Update tenant subscription with Stripe IDs
  await prisma.tenantSubscription.updateMany({
    where: {
      tenantId,
      status: 'PENDING',
    },
    data: {
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
      status: 'ACTIVE',
    },
  })
}

/**
 * Handle subscription creation
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  const tenantId = subscription.metadata?.tenantId

  if (!tenantId) {
    return
  }

  // Ensure subscription exists in database
  const existingSubscription = await prisma.tenantSubscription.findFirst({
    where: {
      stripeSubscriptionId: subscription.id,
    },
  })

  if (!existingSubscription) {
    // Get bundle information from metadata or subscription items
    const bundleId = subscription.metadata?.bundleId

    if (!bundleId) {
      return
    }

    const bundle = await prisma.bundle.findUnique({
      where: { id: bundleId },
    })

    if (!bundle) {
      return
    }

    await prisma.tenantSubscription.create({
      data: {
        tenantId,
        bundleId,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        status: 'ACTIVE',
        billingCycle:
          subscription.items.data[0].price.recurring?.interval === 'year' ? 'ANNUAL' : 'MONTHLY',
        users: parseInt(subscription.metadata?.users || '1'),
        price: (subscription.items.data[0].price.unit_amount || 0) / 100,
        startDate: new Date(subscription.current_period_start * 1000),
        endDate: new Date(subscription.current_period_end * 1000),
        nextBillingDate: new Date(subscription.current_period_end * 1000),
      },
    })
  }
}

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const updates: unknown = {
    status: mapStripeStatus(subscription.status),
    startDate: new Date(subscription.current_period_start * 1000),
    endDate: new Date(subscription.current_period_end * 1000),
    nextBillingDate: new Date(subscription.current_period_end * 1000),
  }

  // Update price if changed
  if (subscription.items.data[0]?.price.unit_amount) {
    updates.price = subscription.items.data[0].price.unit_amount / 100
  }

  // Update billing cycle if changed
  if (subscription.items.data[0]?.price.recurring?.interval) {
    updates.billingCycle =
      subscription.items.data[0].price.recurring.interval === 'year' ? 'ANNUAL' : 'MONTHLY'
  }

  // Update cancellation date if subscription is cancelled
  if (subscription.canceled_at) {
    updates.cancelledAt = new Date(subscription.canceled_at * 1000)
  }

  await prisma.tenantSubscription.updateMany({
    where: {
      stripeSubscriptionId: subscription.id,
    },
    data: updates,
  })
}

/**
 * Handle subscription deletion
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await prisma.tenantSubscription.updateMany({
    where: {
      stripeSubscriptionId: subscription.id,
    },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
    },
  })
}

/**
 * Handle successful invoice payment
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return

  // Record successful payment
  const subscription = await prisma.tenantSubscription.findFirst({
    where: {
      stripeSubscriptionId: invoice.subscription as string,
    },
  })

  if (subscription) {
    await prisma.subscriptionInvoice.upsert({
      where: {
        stripeInvoiceId: invoice.id,
      },
      create: {
        subscriptionId: subscription.id,
        invoiceNumber: invoice.number || `INV-${Date.now()}`,
        stripeInvoiceId: invoice.id,
        amount: (invoice.amount_paid || 0) / 100,
        currency: invoice.currency.toUpperCase(),
        status: 'paid',
        dueDate: new Date(invoice.due_date ? invoice.due_date * 1000 : Date.now()),
        paidAt: new Date(
          invoice.status_transitions.paid_at
            ? invoice.status_transitions.paid_at * 1000
            : Date.now()
        ),
      },
      update: {
        status: 'paid',
        paidAt: new Date(
          invoice.status_transitions.paid_at
            ? invoice.status_transitions.paid_at * 1000
            : Date.now()
        ),
      },
    })

    // Update last billed date
    await prisma.tenantSubscription.update({
      where: { id: subscription.id },
      data: {
        lastBilledAt: new Date(),
      },
    })
  }
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return

  // Update invoice status
  const subscription = await prisma.tenantSubscription.findFirst({
    where: {
      stripeSubscriptionId: invoice.subscription as string,
    },
  })

  if (subscription) {
    await prisma.subscriptionInvoice.upsert({
      where: {
        stripeInvoiceId: invoice.id,
      },
      create: {
        subscriptionId: subscription.id,
        invoiceNumber: invoice.number || `INV-${Date.now()}`,
        stripeInvoiceId: invoice.id,
        amount: (invoice.amount_due || 0) / 100,
        currency: invoice.currency.toUpperCase(),
        status: 'failed',
        dueDate: new Date(invoice.due_date ? invoice.due_date * 1000 : Date.now()),
      },
      update: {
        status: 'failed',
      },
    })

    // Consider suspending subscription after multiple failed payments
    const failedInvoices = await prisma.subscriptionInvoice.count({
      where: {
        subscriptionId: subscription.id,
        status: 'failed',
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    })

    if (failedInvoices >= 3) {
      await prisma.tenantSubscription.update({
        where: { id: subscription.id },
        data: {
          status: 'SUSPENDED',
        },
      })
    }
  }
}

/**
 * Map Stripe subscription status to our status
 */
function mapStripeStatus(stripeStatus: string): string {
  switch (stripeStatus) {
    case 'active':
      return 'ACTIVE'
    case 'past_due':
      return 'SUSPENDED'
    case 'canceled':
    case 'cancelled':
      return 'CANCELLED'
    case 'unpaid':
      return 'SUSPENDED'
    case 'trialing':
      return 'TRIAL'
    default:
      return 'SUSPENDED'
  }
}
