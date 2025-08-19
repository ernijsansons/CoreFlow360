/**
 * CoreFlow360 - Checkout Session Completed Handler
 */

import Stripe from 'stripe'
import { prisma } from '@/lib/db'
import { moduleManager } from '@/services/subscription/module-manager'
import { publishModuleEvent } from '@/services/events/subscription-aware-event-bus'
import { extractSubscriptionMetadata } from '../webhook-signature'

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    // Extract metadata from session
    const metadata = session.metadata || {}
    const tenantId = metadata.tenant_id || session.client_reference_id
    
    if (!tenantId) {
      console.error('No tenant ID found in checkout session')
      return
    }

    // Parse subscription details from metadata
    const modules = metadata.modules ? metadata.modules.split(',') : []
    const bundleKey = metadata.bundle_key
    const userCount = parseInt(metadata.user_count || '1')
    const billingCycle = metadata.billing_cycle || 'monthly'

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
        ),
      },
    })

    // Create or update modern subscription record
    const existingSubscription = await prisma.subscription.findFirst({
      where: { tenantId }
    })

    if (existingSubscription) {
      await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          stripeSubscriptionId: session.subscription as string,
          stripeCustomerId: session.customer as string,
          status: 'active',
          tier: bundleKey || 'professional', // Default to professional if no bundle
          users: userCount,
          billingCycle: billingCycle as 'monthly' | 'annual',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(
            Date.now() + (billingCycle === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000
          ),
          nextBillingDate: new Date(
            Date.now() + (billingCycle === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000
          ),
          updatedAt: new Date(),
        }
      })
    } else {
      await prisma.subscription.create({
        data: {
          tenantId,
          stripeSubscriptionId: session.subscription as string,
          stripeCustomerId: session.customer as string,
          status: 'active',
          tier: bundleKey || 'professional',
          users: userCount,
          billingCycle: billingCycle as 'monthly' | 'annual',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(
            Date.now() + (billingCycle === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000
          ),
          nextBillingDate: new Date(
            Date.now() + (billingCycle === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000
          ),
        }
      })
    }

    // Create legacy tenant subscription for compatibility
    await createLegacySubscription(session, {
      tenantId,
      modules,
      bundleKey,
      userCount,
      billingCycle,
      monthlyPrice: (session.amount_total || 0) / 100
    })

    // Create bundle subscription if bundle was selected
    if (bundleKey) {
      await createBundleSubscription(tenantId, bundleKey, session, metadata)
    }

    // Activate modules through module manager
    for (const moduleKey of modules) {
      await moduleManager.activateModule(tenantId, moduleKey)
    }

    // Log subscription event
    await logSubscriptionEvent(tenantId, session, {
      tenantId,
      modules,
      bundleKey,
      userCount,
      billingCycle,
      monthlyPrice: (session.amount_total || 0) / 100
    })

    // Create subscription billing event
    await createBillingEvent(tenantId, session, {
      tenantId,
      modules,
      bundleKey,
      userCount,
      billingCycle,
      monthlyPrice: (session.amount_total || 0) / 100
    })

    // Publish subscription activation event
    await publishModuleEvent('subscription', 'subscription.activated', tenantId, {
      modules,
      bundleKey,
      userCount,
      billingCycle,
      sessionId: session.id,
    })

    console.log(`Checkout completed for tenant ${tenantId}:`, {
      sessionId: session.id,
      subscriptionId: session.subscription,
      modules,
      bundleKey,
      userCount,
      billingCycle,
      amount: (session.amount_total || 0) / 100
    })
  } catch (error) {
    console.error('Error handling checkout completed:', error)
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
        billingCycle,
      }),
      billingCycle,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
      status: 'active',
      userCount,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(
        Date.now() + (billingCycle === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000
      ),
      nextBillingDate: new Date(
        Date.now() + (billingCycle === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000
      ),
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
        billingCycle,
      }),
      billingCycle,
      stripeSubscriptionId: session.subscription as string,
      status: 'active',
      userCount,
      updatedAt: new Date(),
    },
  })
}

async function createBundleSubscription(
  tenantId: string,
  bundleKey: string,
  session: Stripe.Checkout.Session,
  metadata: ReturnType<typeof extractSubscriptionMetadata>
) {
  const bundle = await prisma.bundleDefinition.findUnique({
    where: { bundleKey },
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
        nextBillingDate: new Date(
          Date.now() + (metadata.billingCycle === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000
        ),
        externalServiceId: session.subscription as string,
        enabledFeatures: JSON.stringify(metadata.modules),
        activatedBy: session.customer_email || 'system',
        activatedAt: new Date(),
      },
    })
  }
}

async function logSubscriptionEvent(
  tenantId: string,
  session: Stripe.Checkout.Session,
  metadata: ReturnType<typeof extractSubscriptionMetadata>
) {
  const legacySubscription = await prisma.legacyTenantSubscription.findUnique({
    where: { tenantId },
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
          stripeSessionId: session.id,
        }),
        effectiveDate: new Date(),
        metadata: JSON.stringify({
          checkout_session_id: session.id,
          stripe_customer_id: session.customer,
        }),
      },
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
      billingPeriodEnd: new Date(
        Date.now() + (metadata.billingCycle === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000
      ),
      paymentStatus: 'paid',
      paymentMethod: 'card',
      stripeInvoiceId: session.invoice as string,
      metadata: JSON.stringify({ session_id: session.id }),
    },
  })
}
