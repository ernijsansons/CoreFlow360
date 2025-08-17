/**
 * CoreFlow360 - Stripe Checkout Creation
 * Create Stripe checkout sessions for module subscriptions
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { stripe } from '@/lib/stripe/stripe'
import { db } from '@/lib/db'

const CheckoutRequestSchema = z.object({
  tenantId: z.string().min(1, "Tenant ID is required"),
  modules: z.array(z.string()).min(1, "At least one module is required"),
  bundleKey: z.string().optional(),
  userCount: z.number().min(1, "User count must be at least 1"),
  billingCycle: z.enum(['monthly', 'annual']).default('monthly'),
  customerEmail: z.string().email("Valid email is required"),
  customerName: z.string().min(1, "Customer name is required"),
  companyName: z.string().min(1, "Company name is required"),
  successUrl: z.string().url("Valid success URL is required"),
  cancelUrl: z.string().url("Valid cancel URL is required")
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CheckoutRequestSchema.parse(body)
    
    const {
      tenantId,
      modules,
      bundleKey,
      userCount,
      billingCycle,
      customerEmail,
      customerName,
      companyName,
      successUrl,
      cancelUrl
    } = validatedData

    // Get or create Stripe customer
    const stripeCustomer = await getOrCreateStripeCustomer({
      email: customerEmail,
      name: customerName,
      companyName,
      tenantId
    })

    // Calculate pricing
    const pricingResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/pricing/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        modules,
        userCount,
        billingCycle,
        applyBundleDiscounts: !!bundleKey,
        includeSetupFees: true
      })
    })

    const pricing = await pricingResponse.json()

    if (!pricing.totalMonthlyPrice) {
      return NextResponse.json(
        { error: 'Failed to calculate pricing' },
        { status: 400 }
      )
    }

    // Create line items for Stripe
    const lineItems = await createStripeLineItems({
      pricing,
      modules,
      bundleKey,
      userCount,
      billingCycle
    })

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomer.id,
      mode: 'subscription',
      line_items: lineItems,
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      tax_id_collection: {
        enabled: true
      },
      subscription_data: {
        metadata: {
          tenant_id: tenantId,
          modules: modules.join(','),
          bundle_key: bundleKey || '',
          user_count: userCount.toString(),
          billing_cycle: billingCycle
        }
      },
      metadata: {
        tenant_id: tenantId,
        action: 'subscription_creation',
        modules: modules.join(','),
        user_count: userCount.toString()
      },
      // Add setup fees as one-time items if needed
      ...(pricing.billingDetails.setupFeesTotal > 0 && {
        invoice_creation: {
          enabled: true,
          invoice_data: {
            description: `CoreFlow360 Setup - ${companyName}`,
            metadata: {
              tenant_id: tenantId,
              setup_fees: 'true'
            }
          }
        }
      })
    })

    // Store pending subscription in database
    await storePendingSubscription({
      tenantId,
      stripeCustomerId: stripeCustomer.id,
      checkoutSessionId: session.id,
      modules,
      bundleKey,
      userCount,
      billingCycle,
      pricing
    })

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      sessionUrl: session.url,
      customerId: stripeCustomer.id,
      estimatedTotal: billingCycle === 'annual' 
        ? pricing.totalAnnualPrice 
        : pricing.totalMonthlyPrice,
      currency: 'USD',
      metadata: {
        tenantId,
        modules,
        userCount,
        billingCycle
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid request data', 
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create checkout session' 
      },
      { status: 500 }
    )
  }
}

async function getOrCreateStripeCustomer(customerData: {
  email: string
  name: string
  companyName: string
  tenantId: string
}): Promise<Stripe.Customer> {
  const { email, name, companyName, tenantId } = customerData

  // Check if customer already exists
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1
  })

  if (existingCustomers.data.length > 0) {
    const customer = existingCustomers.data[0]
    
    // Update customer metadata if needed
    if (customer.metadata.tenant_id !== tenantId) {
      await stripe.customers.update(customer.id, {
        metadata: {
          ...customer.metadata,
          tenant_id: tenantId
        }
      })
    }
    
    return customer
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    name,
    description: `CoreFlow360 Customer - ${companyName}`,
    metadata: {
      tenant_id: tenantId,
      company_name: companyName,
      created_via: 'module_selection_dashboard'
    }
  })

  return customer
}

async function createStripeLineItems({
  pricing,
  modules,
  bundleKey,
  userCount,
  billingCycle
}: {
  pricing: any
  modules: string[]
  bundleKey?: string
  userCount: number
  billingCycle: 'monthly' | 'annual'
}): Promise<Stripe.Checkout.SessionCreateParams.LineItem[]> {
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []

  if (bundleKey) {
    // Bundle subscription
    const bundleResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/pricing/bundles`)
    const bundleData = await bundleResponse.json()
    const bundle = bundleData.bundles?.find((b: any) => b.bundleKey === bundleKey)
    
    if (bundle) {
      const priceAmount = Math.round((bundle.pricing.perUserPrice * userCount) * 100) // Convert to cents
      
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: bundle.name,
            description: bundle.description,
            metadata: {
              bundle_key: bundleKey,
              modules: modules.join(','),
              type: 'bundle'
            }
          },
          recurring: {
            interval: billingCycle === 'annual' ? 'year' : 'month'
          },
          unit_amount: priceAmount
        },
        quantity: 1
      })
    }
  } else {
    // Individual modules
    for (const breakdown of pricing.breakdown) {
      const priceAmount = Math.round(breakdown.subtotal * 100) // Convert to cents
      
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: breakdown.moduleName,
            description: `${breakdown.moduleName} module for ${userCount} users`,
            metadata: {
              module_key: breakdown.moduleKey,
              type: 'module'
            }
          },
          recurring: {
            interval: billingCycle === 'annual' ? 'year' : 'month'
          },
          unit_amount: priceAmount
        },
        quantity: 1
      })
    }
  }

  // Add setup fees as one-time payment if needed
  if (pricing.billingDetails.setupFeesTotal > 0) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Setup & Configuration',
          description: 'One-time setup and configuration fee',
          metadata: {
            type: 'setup_fee'
          }
        },
        unit_amount: Math.round(pricing.billingDetails.setupFeesTotal * 100)
      },
      quantity: 1
    })
  }

  return lineItems
}

async function storePendingSubscription(data: {
  tenantId: string
  stripeCustomerId: string
  checkoutSessionId: string
  modules: string[]
  bundleKey?: string
  userCount: number
  billingCycle: 'monthly' | 'annual'
  pricing: any
}): Promise<void> {
  try {
    // Store in database for webhook processing
    await db.subscriptionEvent.create({
      data: {
        // We'll need to create a temporary subscription record or use a different approach
        tenantSubscriptionId: 'pending', // Placeholder - will be updated by webhook
        eventType: 'checkout_session_created',
        newState: JSON.stringify({
          stripe_customer_id: data.stripeCustomerId,
          checkout_session_id: data.checkoutSessionId,
          modules: data.modules,
          bundle_key: data.bundleKey,
          user_count: data.userCount,
          billing_cycle: data.billingCycle,
          pricing: data.pricing
        }),
        effectiveDate: new Date(),
        metadata: JSON.stringify({
          tenant_id: data.tenantId,
          status: 'pending_payment'
        })
      }
    })
  } catch (error) {
    // Failed to store pending subscription - webhook will handle it
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'POST to this endpoint to create a Stripe checkout session',
    schema: {
      tenantId: 'string',
      modules: 'string[]',
      bundleKey: 'string (optional)',
      userCount: 'number',
      billingCycle: 'monthly | annual',
      customerEmail: 'string (email)',
      customerName: 'string',
      companyName: 'string',
      successUrl: 'string (url)',
      cancelUrl: 'string (url)'
    }
  })
}