/**
 * CoreFlow360 - Subscription Updated Handler
 */

import Stripe from 'stripe'
import { prisma } from '@/lib/db'
import { moduleManager } from '@/services/subscription/module-manager'
import { publishModuleEvent } from '@/services/events/subscription-aware-event-bus'
import { extractTenantId } from '../webhook-signature'

export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const tenantId = extractTenantId({ data: { object: subscription } } as Stripe.Event)
    if (!tenantId) {
      return
    }

    // Update tenant subscription status
    await updateTenantStatus(subscription)

    // Update legacy tenant subscription
    await updateLegacySubscription(subscription)

    // Handle status changes
    if (subscription.status === 'canceled') {
      await handleCancellation(subscription, tenantId)
    }

    // Log subscription event
    await logUpdateEvent(subscription)

    // Create billing event if status changed
    if (subscription.status === 'canceled') {
      await createCancellationBillingEvent(subscription, tenantId)
    }
  } catch (error) {}
}

async function updateTenantStatus(subscription: Stripe.Subscription) {
  await prisma.tenant.updateMany({
    where: {
      stripeSubscriptionId: subscription.id,
    },
    data: {
      subscriptionStatus:
        subscription.status === 'active'
          ? 'ACTIVE'
          : subscription.status === 'canceled'
            ? 'CANCELLED'
            : 'PENDING',
    },
  })
}

async function updateLegacySubscription(subscription: Stripe.Subscription) {
  await prisma.legacyTenantSubscription.updateMany({
    where: {
      stripeSubscriptionId: subscription.id,
    },
    data: {
      status:
        subscription.status === 'active'
          ? 'active'
          : subscription.status === 'canceled'
            ? 'cancelled'
            : 'pending',
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      nextBillingDate: new Date(subscription.current_period_end * 1000),
      updatedAt: new Date(),
    },
  })
}

async function handleCancellation(_subscription: Stripe.Subscription, _tenantId: string) {
  // Deactivate all modules
  const legacySubscription = await prisma.legacyTenantSubscription.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  })

  if (legacySubscription) {
    const activeModules = JSON.parse(legacySubscription.activeModules)
    for (const moduleKey of Object.keys(activeModules)) {
      await moduleManager.deactivateModule(legacySubscription.tenantId, moduleKey)
    }

    // Update bundle subscriptions
    await prisma.tenantBundleSubscription.updateMany({
      where: {
        tenantId: legacySubscription.tenantId,
        externalServiceId: subscription.id,
      },
      data: {
        status: 'cancelled',
        endDate: new Date(),
        deactivatedAt: new Date(),
        cancellationReason: 'stripe_cancellation',
      },
    })

    // Publish cancellation event
    await publishModuleEvent(
      'subscription',
      'subscription.cancelled',
      legacySubscription.tenantId,
      { reason: 'stripe_cancellation', subscriptionId: subscription.id }
    )
  }
}

async function logUpdateEvent(subscription: Stripe.Subscription) {
  const legacySubscription = await prisma.legacyTenantSubscription.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  })

  if (legacySubscription) {
    await prisma.subscriptionEvent.create({
      data: {
        tenantSubscriptionId: legacySubscription.id,
        eventType: subscription.status === 'canceled' ? 'cancelled' : 'updated',
        newState: JSON.stringify({
          subscription_id: subscription.id,
          status: subscription.status,
          current_period_start: subscription.current_period_start,
          current_period_end: subscription.current_period_end,
        }),
        effectiveDate: new Date(),
      },
    })
  }
}

async function createCancellationBillingEvent(subscription: Stripe.Subscription, tenantId: string) {
  await prisma.subscriptionBillingEvent.create({
    data: {
      tenantId,
      bundleSubscriptionId: subscription.id,
      eventType: 'cancelled',
      eventSource: 'stripe',
      amount: 0,
      currency: subscription.currency,
      billingPeriodStart: new Date(subscription.current_period_start * 1000),
      billingPeriodEnd: new Date(subscription.current_period_end * 1000),
      paymentStatus: 'cancelled',
      metadata: JSON.stringify({
        cancellation_reason: subscription.cancellation_details?.reason,
        cancelled_at: subscription.canceled_at,
      }),
    },
  })
}
