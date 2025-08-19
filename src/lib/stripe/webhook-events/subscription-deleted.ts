/**
 * CoreFlow360 - Subscription Deleted Handler
 */

import Stripe from 'stripe'
import { prisma } from '@/lib/db'
import { moduleManager } from '@/services/subscription/module-manager'
import { publishModuleEvent } from '@/services/events/subscription-aware-event-bus'

export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    // Find legacy tenant subscription
    const legacySubscription = await prisma.legacyTenantSubscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    })

    if (!legacySubscription) {
      return
    }

    // Update tenant status
    await prisma.tenant.update({
      where: { id: legacySubscription.tenantId },
      data: {
        subscriptionStatus: 'CANCELLED',
      },
    })

    // Deactivate all modules
    const activeModules = JSON.parse(legacySubscription.activeModules)
    for (const moduleKey of Object.keys(activeModules)) {
      await moduleManager.deactivateModule(legacySubscription.tenantId, moduleKey)
    }

    // Update legacy subscription status
    await prisma.legacyTenantSubscription.update({
      where: { id: legacySubscription.id },
      data: {
        status: 'cancelled',
        activeModules: JSON.stringify({}),
        updatedAt: new Date(),
      },
    })

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
        cancellationReason: 'stripe_deletion',
      },
    })

    // Log event
    await prisma.subscriptionEvent.create({
      data: {
        tenantSubscriptionId: legacySubscription.id,
        eventType: 'cancelled',
        newState: JSON.stringify({
          reason: 'stripe_deletion',
          subscription_id: subscription.id,
        }),
        effectiveDate: new Date(),
      },
    })

    // Create billing event
    await prisma.subscriptionBillingEvent.create({
      data: {
        tenantId: legacySubscription.tenantId,
        bundleSubscriptionId: subscription.id,
        eventType: 'cancelled',
        eventSource: 'stripe',
        amount: 0,
        currency: subscription.currency,
        billingPeriodStart: new Date(subscription.current_period_start * 1000),
        billingPeriodEnd: new Date(subscription.current_period_end * 1000),
        paymentStatus: 'cancelled',
        metadata: JSON.stringify({
          cancellation_reason: 'stripe_deletion',
          cancelled_at: subscription.canceled_at,
        }),
      },
    })

    // Publish cancellation event
    await publishModuleEvent(
      'subscription',
      'subscription.cancelled',
      legacySubscription.tenantId,
      { reason: 'stripe_deletion', subscriptionId: subscription.id }
    )
  } catch (error) {}
}
