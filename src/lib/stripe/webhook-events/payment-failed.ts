/**
 * CoreFlow360 - Payment Failed Handler
 */

import Stripe from 'stripe'
import { prisma } from '@/lib/db'
import { publishModuleEvent } from '@/services/events/subscription-aware-event-bus'

export async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    if (!invoice.subscription) return

    // Find legacy tenant subscription
    const legacySubscription = await prisma.legacyTenantSubscription.findFirst({
      where: { stripeSubscriptionId: invoice.subscription as string },
    })

    if (!legacySubscription) return

    // Create billing event for failed payment
    await createFailedPaymentBillingEvent(invoice, legacySubscription.tenantId)

    // Update tenant status if too many failures
    if (invoice.attempt_count >= 3) {
      await updateTenantStatusOnFailure(legacySubscription.tenantId, legacySubscription.id)
    }

    // Publish payment failure event
    await publishModuleEvent('subscription', 'payment.failed', legacySubscription.tenantId, {
      invoiceId: invoice.id,
      amountDue: invoice.total / 100,
      attemptCount: invoice.attempt_count,
    })
  } catch (error) {}
}

async function createFailedPaymentBillingEvent(invoice: Stripe.Invoice, tenantId: string) {
  await prisma.subscriptionBillingEvent.create({
    data: {
      tenantId,
      bundleSubscriptionId: invoice.subscription as string,
      eventType: 'payment_failed',
      eventSource: 'stripe',
      amount: (invoice.amount_due || 0) / 100,
      currency: invoice.currency,
      billingPeriodStart: new Date(invoice.period_start * 1000),
      billingPeriodEnd: new Date(invoice.period_end * 1000),
      paymentStatus: 'failed',
      stripeInvoiceId: invoice.id,
      failureReason: 'Payment failed',
      retryCount: invoice.attempt_count - 1,
      nextRetryAt: invoice.next_payment_attempt
        ? new Date(invoice.next_payment_attempt * 1000)
        : null,
      metadata: JSON.stringify({
        attempt_count: invoice.attempt_count,
        failure_message: 'stripe_payment_failed',
      }),
    },
  })
}

async function updateTenantStatusOnFailure(tenantId: string, subscriptionId: string) {
  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      subscriptionStatus: 'PAYMENT_FAILED',
    },
  })

  await prisma.legacyTenantSubscription.update({
    where: { id: subscriptionId },
    data: {
      status: 'paused',
    },
  })
}
