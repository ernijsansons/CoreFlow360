/**
 * CoreFlow360 - Subscription Created Handler
 */

import Stripe from 'stripe'
import { prisma } from '@/lib/db'
import { extractTenantId } from '../webhook-signature'



export async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    console.log(`📝 Subscription created: ${subscription.id}`)
    
    const tenantId = extractTenantId({ data: { object: subscription } } as Stripe.Event)
    if (!tenantId) {
      console.error('No tenant ID in subscription metadata')
      return
    }

    // Update tenant with subscription status
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status === 'active' ? 'ACTIVE' : 'PENDING'
      }
    })

    // Update legacy subscription with Stripe subscription ID
    await prisma.legacyTenantSubscription.updateMany({
      where: { 
        tenantId,
        stripeCustomerId: subscription.customer as string
      },
      data: {
        stripeSubscriptionId: subscription.id,
        status: subscription.status === 'active' ? 'active' : 'pending',
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        nextBillingDate: new Date(subscription.current_period_end * 1000),
        updatedAt: new Date()
      }
    })

    // Get legacy subscription for event logging
    const legacySubscription = await prisma.legacyTenantSubscription.findFirst({
      where: { tenantId }
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
            current_period_start: subscription.current_period_start,
            current_period_end: subscription.current_period_end
          }),
          effectiveDate: new Date()
        }
      })
    }

    console.log(`✅ Subscription ${subscription.id} linked to tenant ${tenantId}`)

  } catch (error) {
    console.error('Error handling subscription creation:', error)
  }
}