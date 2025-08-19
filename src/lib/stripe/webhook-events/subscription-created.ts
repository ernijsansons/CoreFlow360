/**
 * CoreFlow360 - Subscription Created Handler
 */

import Stripe from 'stripe'
import { prisma } from '@/lib/db'
import { extractTenantId } from '../webhook-signature'

export async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    // Extract tenant ID from subscription metadata
    const tenantId = subscription.metadata?.tenant_id || extractTenantId({ data: { object: subscription } } as Stripe.Event)
    if (!tenantId) {
      console.error('No tenant ID found in subscription metadata')
      return
    }

    // Extract subscription tier and details from metadata
    const tier = subscription.metadata?.tier || 'starter'
    const users = parseInt(subscription.metadata?.user_count || '1')
    const billingCycle = subscription.metadata?.billing_cycle || 'monthly'

    // Update tenant with subscription status
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status === 'active' ? 'ACTIVE' : 'PENDING',
      },
    })

    // Update or create the modern subscription record
    const existingSubscription = await prisma.subscription.findFirst({
      where: { tenantId }
    })

    if (existingSubscription) {
      await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          status: subscription.status === 'active' ? 'active' : 
                 subscription.status === 'trialing' ? 'trialing' : 'pending',
          tier,
          users,
          billingCycle: billingCycle as 'monthly' | 'annual',
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          nextBillingDate: new Date(subscription.current_period_end * 1000),
          updatedAt: new Date(),
        }
      })
    } else {
      await prisma.subscription.create({
        data: {
          tenantId,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          status: subscription.status === 'active' ? 'active' : 
                 subscription.status === 'trialing' ? 'trialing' : 'pending',
          tier,
          users,
          billingCycle: billingCycle as 'monthly' | 'annual',
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          nextBillingDate: new Date(subscription.current_period_end * 1000),
        }
      })
    }

    // Also update legacy subscription for backward compatibility
    await prisma.legacyTenantSubscription.updateMany({
      where: {
        tenantId,
        stripeCustomerId: subscription.customer as string,
      },
      data: {
        stripeSubscriptionId: subscription.id,
        status: subscription.status === 'active' ? 'active' : 'pending',
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        nextBillingDate: new Date(subscription.current_period_end * 1000),
        updatedAt: new Date(),
      },
    })

    // Get legacy subscription for event logging
    const legacySubscription = await prisma.legacyTenantSubscription.findFirst({
      where: { tenantId },
    })

    if (legacySubscription) {
      // Log event
      await prisma.subscriptionEvent.create({
        data: {
          tenantSubscriptionId: legacySubscription.id,
          eventType: 'created',
          newState: JSON.stringify({
            subscription_id: subscription.id,
            status: subscription.status,
            tier,
            users,
            billing_cycle: billingCycle,
            current_period_start: subscription.current_period_start,
            current_period_end: subscription.current_period_end,
          }),
          effectiveDate: new Date(),
        },
      })
    }

    console.log(`Subscription created for tenant ${tenantId}:`, {
      subscriptionId: subscription.id,
      tier,
      users,
      status: subscription.status
    })
  } catch (error) {
    console.error('Error handling subscription created:', error)
  }
}
