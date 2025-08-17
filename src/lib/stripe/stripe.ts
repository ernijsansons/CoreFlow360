/**
 * CoreFlow360 - Stripe Integration
 * Handles subscription creation, updates, and billing
 */

import Stripe from 'stripe'

// Initialize Stripe client lazily to avoid build-time errors
let stripeClient: Stripe | null = null

function getStripeClient(): Stripe {
  if (!stripeClient) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables')
    }
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
      typescript: true,
    })
  }
  return stripeClient
}

// Export a proxy object that lazy-loads the Stripe client
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const client = getStripeClient()
    return client[prop as keyof Stripe]
  }
})

// Stripe webhook endpoint secret
export const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

/**
 * Create or retrieve a Stripe customer
 */
export async function createOrGetCustomer(
  tenantId: string,
  email: string,
  name?: string
): Promise<Stripe.Customer> {
  // Check if customer already exists
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  })

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0]
  }

  // Create new customer
  return stripe.customers.create({
    email,
    name,
    metadata: {
      tenantId,
    },
  })
}

/**
 * Create subscription checkout session
 */
export async function createCheckoutSession({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
  quantity = 1,
  metadata = {},
}: {
  customerId: string
  priceId: string
  successUrl: string
  cancelUrl: string
  quantity?: number
  metadata?: Record<string, string>
}): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    subscription_data: {
      metadata,
    },
  })
}

/**
 * Create subscription upgrade session
 */
export async function createUpgradeSession({
  customerId,
  currentSubscriptionId,
  newPriceId,
  successUrl,
  cancelUrl,
  quantity = 1,
  prorationBehavior = 'always_invoice',
}: {
  customerId: string
  currentSubscriptionId: string
  newPriceId: string
  successUrl: string
  cancelUrl: string
  quantity?: number
  prorationBehavior?: 'always_invoice' | 'create_prorations' | 'none'
}): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: newPriceId,
        quantity,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: {
      proration_behavior: prorationBehavior,
    },
  })
}

/**
 * Create customer portal session
 */
export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

/**
 * Get subscription details
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['default_payment_method', 'customer', 'items.data.price'],
  })
}

/**
 * Update subscription
 */
export async function updateSubscription(
  subscriptionId: string,
  updates: Stripe.SubscriptionUpdateParams
): Promise<Stripe.Subscription> {
  return stripe.subscriptions.update(subscriptionId, updates)
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<Stripe.Subscription> {
  if (cancelAtPeriodEnd) {
    return stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })
  } else {
    return stripe.subscriptions.cancel(subscriptionId)
  }
}

/**
 * Create usage record for metered billing
 */
export async function createUsageRecord(
  subscriptionItemId: string,
  quantity: number,
  action: 'increment' | 'set' = 'increment'
): Promise<Stripe.UsageRecord> {
  return stripe.subscriptionItems.createUsageRecord(subscriptionItemId, {
    quantity,
    action,
    timestamp: Math.floor(Date.now() / 1000),
  })
}

/**
 * Get upcoming invoice preview
 */
export async function getUpcomingInvoice(
  customerId: string,
  subscriptionId?: string
): Promise<Stripe.Invoice> {
  const params: Stripe.InvoiceRetrieveUpcomingParams = {
    customer: customerId,
  }

  if (subscriptionId) {
    params.subscription = subscriptionId
  }

  return stripe.invoices.retrieveUpcoming(params)
}

/**
 * Create Stripe price for a product
 */
export async function createPrice({
  productId,
  unitAmount,
  currency = 'usd',
  recurring,
  metadata = {},
}: {
  productId: string
  unitAmount: number
  currency?: string
  recurring?: {
    interval: 'month' | 'year'
    interval_count?: number
  }
  metadata?: Record<string, string>
}): Promise<Stripe.Price> {
  const priceData: Stripe.PriceCreateParams = {
    product: productId,
    unit_amount: unitAmount,
    currency,
    metadata,
  }

  if (recurring) {
    priceData.recurring = recurring
  }

  return stripe.prices.create(priceData)
}

/**
 * Create Stripe product
 */
export async function createProduct({
  name,
  description,
  metadata = {},
}: {
  name: string
  description?: string
  metadata?: Record<string, string>
}): Promise<Stripe.Product> {
  return stripe.products.create({
    name,
    description,
    metadata,
  })
}

/**
 * List customer invoices
 */
export async function getCustomerInvoices(
  customerId: string,
  limit: number = 10
): Promise<Stripe.Invoice[]> {
  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit,
  })

  return invoices.data
}

/**
 * Handle Stripe webhook events
 */
export async function constructWebhookEvent(
  body: string,
  signature: string
): Promise<Stripe.Event> {
  if (!webhookSecret) {
    throw new Error('Stripe webhook secret is not configured')
  }

  return stripe.webhooks.constructEvent(body, signature, webhookSecret)
}