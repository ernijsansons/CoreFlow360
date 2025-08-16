/**
 * CoreFlow360 - Payment Succeeded Handler
 */

import Stripe from 'stripe'
import { PrismaClient } from '@prisma/client'
import { publishModuleEvent } from '@/services/events/subscription-aware-event-bus'

const prisma = new PrismaClient()

export async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    console.log(`💰 Payment succeeded: ${invoice.id}`)
    
    if (!invoice.subscription) return

    // Find legacy tenant subscription
    const legacySubscription = await prisma.legacyTenantSubscription.findFirst({
      where: { stripeSubscriptionId: invoice.subscription as string }
    })

    if (!legacySubscription) return

    // Create billing event
    await createPaymentBillingEvent(invoice, legacySubscription.tenantId)

    // Update bundle subscription billing dates
    await updateBundleSubscriptionDates(invoice, legacySubscription.tenantId)

    // Update legacy subscription billing dates
    await updateLegacySubscriptionDates(invoice, legacySubscription.id)

    // Publish payment success event
    await publishModuleEvent(
      'subscription',
      'payment.succeeded',
      legacySubscription.tenantId,
      {
        invoiceId: invoice.id,
        amount: invoice.amount_paid / 100,
        currency: invoice.currency
      }
    )

    console.log(`✅ Payment processed for tenant ${legacySubscription.tenantId}`)

  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

async function createPaymentBillingEvent(invoice: Stripe.Invoice, tenantId: string) {
  await prisma.subscriptionBillingEvent.create({
    data: {
      tenantId,
      bundleSubscriptionId: invoice.subscription as string,
      eventType: 'renewed',
      eventSource: 'stripe',
      amount: (invoice.amount_paid || 0) / 100,
      currency: invoice.currency,
      billingPeriodStart: new Date(invoice.period_start * 1000),
      billingPeriodEnd: new Date(invoice.period_end * 1000),
      paymentStatus: 'paid',
      paymentMethod: 'card',
      stripeInvoiceId: invoice.id,
      stripeChargeId: invoice.charge as string,
      metadata: JSON.stringify({
        invoice_number: invoice.number,
        receipt_url: invoice.hosted_invoice_url
      })
    }
  })
}

async function updateBundleSubscriptionDates(invoice: Stripe.Invoice, tenantId: string) {
  await prisma.tenantBundleSubscription.updateMany({
    where: {
      tenantId,
      externalServiceId: invoice.subscription as string
    },
    data: {
      lastBillingDate: new Date(),
      nextBillingDate: new Date(invoice.period_end * 1000)
    }
  })
}

async function updateLegacySubscriptionDates(invoice: Stripe.Invoice, subscriptionId: string) {
  await prisma.legacyTenantSubscription.update({
    where: { id: subscriptionId },
    data: {
      currentPeriodStart: new Date(invoice.period_start * 1000),
      currentPeriodEnd: new Date(invoice.period_end * 1000),
      nextBillingDate: new Date(invoice.period_end * 1000)
    }
  })
}