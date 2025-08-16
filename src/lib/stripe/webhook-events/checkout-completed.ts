/**
 * CoreFlow360 - Checkout Session Completed Handler
 */

import Stripe from 'stripe'
import { PrismaClient } from '@prisma/client'
import { moduleManager } from '@/services/subscription/module-manager'
import { publishModuleEvent } from '@/services/events/subscription-aware-event-bus'
import { extractSubscriptionMetadata } from '../webhook-signature'

const prisma = new PrismaClient()

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const metadata = extractSubscriptionMetadata({ 
      data: { object: session } 
    } as Stripe.Event)
    
    const { tenantId, modules, bundleKey, userCount, billingCycle } = metadata

    if (!tenantId) {
      console.error('No tenant ID in checkout session metadata')
      return
    }

    // Update tenant with Stripe details
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: session.subscription as string,
        subscriptionStatus: 'ACTIVE',
        billingEmail: session.customer_email || undefined,
        enabledModules: JSON.stringify(
          modules.reduce((acc: Record<string, boolean>, module: string) => {
            acc[module] = true
            return acc
          }, {})
        )
      }
    })

    // Create legacy tenant subscription for compatibility
    await createLegacySubscription(session, metadata)

    // Create bundle subscription if bundle was selected
    if (bundleKey) {
      await createBundleSubscription(tenantId, bundleKey, session, metadata)
    }

    // Activate modules through module manager
    for (const moduleKey of modules) {
      await moduleManager.activateModule(tenantId, moduleKey)
    }

    // Log subscription event
    await logSubscriptionEvent(tenantId, session, metadata)

    // Create subscription billing event
    await createBillingEvent(tenantId, session, metadata)

    // Publish subscription activation event
    await publishModuleEvent(
      'subscription',
      'subscription.activated',
      tenantId,
      {
        modules,
        bundleKey,
        userCount,
        billingCycle,
        sessionId: session.id
      }
    )

    console.log(`🎉 Subscription activated for tenant ${tenantId}: ${modules.join(', ')}`)

  } catch (error) {
    console.error('Error handling checkout completion:', error)
  }
}

async function createLegacySubscription(
  session: Stripe.Checkout.Session,
  metadata: ReturnType<typeof extractSubscriptionMetadata>
) {
  const { tenantId, modules, bundleKey, userCount, billingCycle } = metadata
  
  await prisma.legacyTenantSubscription.upsert({
    where: { tenantId },
    create: {
      tenantId,
      subscriptionTier: bundleKey || 'custom',
      activeModules: JSON.stringify(
        modules.reduce((acc: Record<string, boolean>, module: string) => {
          acc[module] = true
          return acc
        }, {})
      ),
      pricingPlan: JSON.stringify({
        modules,
        bundleKey,
        userCount,
        billingCycle
      }),
      billingCycle,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
      status: 'active',
      userCount,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + (billingCycle === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000),
      nextBillingDate: new Date(Date.now() + (billingCycle === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000)
    },
    update: {
      subscriptionTier: bundleKey || 'custom',
      activeModules: JSON.stringify(
        modules.reduce((acc: Record<string, boolean>, module: string) => {
          acc[module] = true
          return acc
        }, {})
      ),
      pricingPlan: JSON.stringify({
        modules,
        bundleKey,
        userCount,
        billingCycle
      }),
      billingCycle,
      stripeSubscriptionId: session.subscription as string,
      status: 'active',
      userCount,
      updatedAt: new Date()
    }
  })
}

async function createBundleSubscription(
  tenantId: string,
  bundleKey: string,
  session: Stripe.Checkout.Session,
  metadata: ReturnType<typeof extractSubscriptionMetadata>
) {
  const bundle = await prisma.bundleDefinition.findUnique({
    where: { bundleKey }
  })

  if (bundle) {
    await prisma.tenantBundleSubscription.create({
      data: {
        tenantId,
        bundleId: bundle.id,
        status: 'active',
        subscriptionType: 'paid',
        monthlyPrice: metadata.monthlyPrice,
        userCount: metadata.userCount,
        startDate: new Date(),
        nextBillingDate: new Date(Date.now() + (metadata.billingCycle === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000),
        externalServiceId: session.subscription as string,
        enabledFeatures: JSON.stringify(metadata.modules),
        activatedBy: session.customer_email || 'system',
        activatedAt: new Date()
      }
    })
  }
}

async function logSubscriptionEvent(
  tenantId: string,
  session: Stripe.Checkout.Session,
  metadata: ReturnType<typeof extractSubscriptionMetadata>
) {
  const legacySubscription = await prisma.legacyTenantSubscription.findUnique({
    where: { tenantId }
  })

  if (legacySubscription) {
    await prisma.subscriptionEvent.create({
      data: {
        tenantSubscriptionId: legacySubscription.id,
        eventType: 'created',
        newState: JSON.stringify({
          modules: metadata.modules,
          bundleKey: metadata.bundleKey,
          userCount: metadata.userCount,
          billingCycle: metadata.billingCycle,
          stripeSessionId: session.id
        }),
        effectiveDate: new Date(),
        metadata: JSON.stringify({
          checkout_session_id: session.id,
          stripe_customer_id: session.customer
        })
      }
    })
  }
}

async function createBillingEvent(
  tenantId: string,
  session: Stripe.Checkout.Session,
  metadata: ReturnType<typeof extractSubscriptionMetadata>
) {
  await prisma.subscriptionBillingEvent.create({
    data: {
      tenantId,
      bundleSubscriptionId: session.subscription as string,
      eventType: 'created',
      eventSource: 'stripe',
      amount: (session.amount_total || 0) / 100,
      currency: session.currency || 'USD',
      billingPeriodStart: new Date(),
      billingPeriodEnd: new Date(Date.now() + (metadata.billingCycle === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000),
      paymentStatus: 'paid',
      paymentMethod: 'card',
      stripeInvoiceId: session.invoice as string,
      metadata: JSON.stringify({ session_id: session.id })
    }
  })
}