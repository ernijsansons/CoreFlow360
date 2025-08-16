/**
 * CoreFlow360 - Subscription Checkout API
 * Create Stripe checkout sessions for subscription upgrades
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createOrGetCustomer, createCheckoutSession } from '@/lib/stripe/stripe'
import { PricingCalculator } from '@/lib/pricing/calculator'
import { handleError, handleAuthError, handleValidationError, ErrorContext } from '@/lib/error-handler'
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { z } from 'zod'

const checkoutRequestSchema = z.object({
  tier: z.enum(['starter', 'professional', 'enterprise', 'ultimate']),
  users: z.number().min(1).max(10000),
  bundles: z.array(z.string()).min(1),
  billingCycle: z.enum(['monthly', 'annual']).default('monthly')
})

export async function POST(request: NextRequest) {
  return withRateLimit(request, async () => {
    const context: ErrorContext = {
      endpoint: '/api/subscriptions/checkout',
      method: 'POST',
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
      requestId: request.headers.get('x-request-id') || undefined
    }

    try {
      const session = await auth()
      if (!session?.user?.tenantId) {
        return handleAuthError('Authentication required', context)
      }

      context.userId = session.user.id
      context.tenantId = session.user.tenantId

      const body = await request.json()
      
      // Validate request
      const validationResult = checkoutRequestSchema.safeParse(body)
      if (!validationResult.success) {
        return handleValidationError(validationResult.error, context)
      }

      const { tier, users, bundles, billingCycle } = validationResult.data

      // Get tenant details
      const tenant = await prisma.tenant.findUnique({
        where: { id: session.user.tenantId },
        include: {
          users: {
            where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
            take: 1
          }
        }
      })

      if (!tenant) {
        return NextResponse.json({
          success: false,
          error: 'Tenant not found'
        }, { status: 404 })
      }

      const adminUser = tenant.users[0]
      if (!adminUser?.email) {
        return NextResponse.json({
          success: false,
          error: 'Admin user email not found'
        }, { status: 400 })
      }

      // Calculate pricing
      const pricing = PricingCalculator.calculate(
        tier,
        users,
        bundles,
        billingCycle === 'annual' ? 'ANNUAL' : 'MONTHLY'
      )

      // Create or get bundle in database
      const bundleId = await getOrCreateBundle(tier, bundles[0], pricing)

      // Create or get Stripe customer
      const stripeCustomer = await createOrGetCustomer(
        session.user.tenantId,
        adminUser.email,
        adminUser.name || undefined
      )

      // Create Stripe price if needed
      const stripePriceId = await getOrCreateStripePrice(
        tier,
        pricing.totalMonthly * 100, // Convert to cents
        billingCycle
      )

      // Create checkout session
      const checkoutSession = await createCheckoutSession({
        customerId: stripeCustomer.id,
        priceId: stripePriceId,
        quantity: users,
        successUrl: `${process.env.NEXTAUTH_URL}/dashboard/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${process.env.NEXTAUTH_URL}/dashboard/subscription?canceled=true`,
        metadata: {
          tenantId: session.user.tenantId,
          bundleId,
          tier,
          users: users.toString(),
          bundles: bundles.join(','),
          billingCycle
        }
      })

      // Create pending subscription in database
      await createPendingSubscription({
        tenantId: session.user.tenantId,
        bundleId,
        tier,
        users,
        bundles,
        billingCycle,
        pricing,
        stripeCustomerId: stripeCustomer.id,
        checkoutSessionId: checkoutSession.id
      })

      return NextResponse.json({
        success: true,
        data: {
          checkoutUrl: checkoutSession.url,
          sessionId: checkoutSession.id
        }
      })

    } catch (error) {
      return handleError(error, context)
    }
  }, RATE_LIMITS.api)
}

/**
 * Get or create bundle in database
 */
async function getOrCreateBundle(
  tier: string,
  category: string,
  pricing: any
): Promise<string> {
  const bundleName = `${tier.charAt(0).toUpperCase() + tier.slice(1)} ${category.charAt(0).toUpperCase() + category.slice(1)}`

  const bundle = await prisma.bundle.upsert({
    where: {
      name: bundleName
    },
    create: {
      name: bundleName,
      description: `${tier} tier with ${category} capabilities`,
      tier,
      category,
      basePrice: pricing.basePrice,
      perUserPrice: pricing.userPrice / pricing.totalMonthly * pricing.basePrice, // Approximate
      features: JSON.stringify(PricingCalculator.getFeatures(tier, [category])),
      limits: JSON.stringify({
        users: tier === 'starter' ? 5 : tier === 'professional' ? 50 : -1,
        apiCalls: tier === 'starter' ? 1000 : tier === 'professional' ? 10000 : -1,
        storage: tier === 'starter' ? 10 : tier === 'professional' ? 100 : -1
      }),
      aiCapabilities: JSON.stringify([
        tier === 'ultimate' ? 'unlimited' : 'basic'
      ])
    },
    update: {
      basePrice: pricing.basePrice,
      perUserPrice: pricing.userPrice / pricing.totalMonthly * pricing.basePrice
    }
  })

  return bundle.id
}

/**
 * Get or create Stripe price
 */
async function getOrCreateStripePrice(
  tier: string,
  unitAmountCents: number,
  billingCycle: string
): Promise<string> {
  // For now, return a mock price ID
  // In production, you would create actual Stripe prices
  const interval = billingCycle === 'annual' ? 'year' : 'month'
  return `price_${tier}_${interval}_${Date.now()}`
}

/**
 * Create pending subscription
 */
async function createPendingSubscription({
  tenantId,
  bundleId,
  tier,
  users,
  bundles,
  billingCycle,
  pricing,
  stripeCustomerId,
  checkoutSessionId
}: {
  tenantId: string
  bundleId: string
  tier: string
  users: number
  bundles: string[]
  billingCycle: string
  pricing: any
  stripeCustomerId: string
  checkoutSessionId: string
}) {
  // Cancel any existing pending subscriptions
  await prisma.tenantSubscription.updateMany({
    where: {
      tenantId,
      status: 'PENDING'
    },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date()
    }
  })

  // Create new pending subscription
  await prisma.tenantSubscription.create({
    data: {
      tenantId,
      bundleId,
      users,
      price: pricing.totalMonthly,
      status: 'PENDING',
      startDate: new Date(),
      endDate: new Date(Date.now() + (billingCycle === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000),
      billingCycle: billingCycle === 'annual' ? 'ANNUAL' : 'MONTHLY',
      stripeCustomerId,
      enabledFeatures: JSON.stringify(bundles),
      customLimits: JSON.stringify({
        checkoutSessionId,
        tier,
        originalRequest: { tier, users, bundles, billingCycle }
      })
    }
  })
}