/**
 * Subscription Manager
 * Handles subscription creation, updates, and billing operations
 */

import { prisma } from '@/lib/db'
import { stripe, createOrGetCustomer, createCheckoutSession, createCustomerPortalSession } from '@/lib/stripe/stripe'
import { z } from 'zod'
import { SubscriptionStatus, BillingCycle } from '@prisma/client'
import { dashboardInsightsGenerator } from '@/lib/ai/dashboard-insights-generator'

// Subscription tiers and pricing
export const SUBSCRIPTION_TIERS = {
  starter: {
    name: 'Starter',
    stripePriceIds: {
      monthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || '',
      annual: process.env.STRIPE_STARTER_ANNUAL_PRICE_ID || '',
    },
    basePrice: 49,
    perUserPrice: 7,
    features: [
      'Up to 10 users',
      'Basic CRM',
      'Email support',
      '1GB storage',
      'Basic reports',
    ],
    limits: {
      users: 10,
      storage: 1024, // MB
      apiCalls: 10000,
      aiOperations: 100,
    },
  },
  professional: {
    name: 'Professional',
    stripePriceIds: {
      monthly: process.env.STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID || '',
      annual: process.env.STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID || '',
    },
    basePrice: 149,
    perUserPrice: 15,
    features: [
      'Up to 50 users',
      'Advanced CRM',
      'Priority support',
      '10GB storage',
      'Advanced analytics',
      'API access',
      'Custom workflows',
    ],
    limits: {
      users: 50,
      storage: 10240, // MB
      apiCalls: 100000,
      aiOperations: 1000,
    },
  },
  enterprise: {
    name: 'Enterprise',
    stripePriceIds: {
      monthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || '',
      annual: process.env.STRIPE_ENTERPRISE_ANNUAL_PRICE_ID || '',
    },
    basePrice: 499,
    perUserPrice: 25,
    features: [
      'Unlimited users',
      'Full feature access',
      'Dedicated support',
      '100GB storage',
      'Custom integrations',
      'Advanced AI features',
      'White labeling',
      'SLA guarantee',
    ],
    limits: {
      users: -1, // Unlimited
      storage: 102400, // MB
      apiCalls: -1, // Unlimited
      aiOperations: 10000,
    },
  },
}

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS

// Validation schemas
const createSubscriptionSchema = z.object({
  tier: z.enum(['starter', 'professional', 'enterprise']),
  billingCycle: z.enum(['monthly', 'annual']).default('monthly'),
  users: z.number().min(1).default(1),
})

const updateSubscriptionSchema = z.object({
  tier: z.enum(['starter', 'professional', 'enterprise']).optional(),
  billingCycle: z.enum(['monthly', 'annual']).optional(),
  users: z.number().min(1).optional(),
})

export class SubscriptionManager {
  /**
   * Get current subscription for a tenant
   */
  async getCurrentSubscription(tenantId: string) {
    const subscription = await prisma.tenantSubscription.findFirst({
      where: {
        tenantId,
        status: {
          in: [SubscriptionStatus.TRIAL, SubscriptionStatus.ACTIVE],
        },
      },
      include: {
        bundle: true,
        modules: {
          include: {
            module: true,
          },
        },
        usageMetrics: {
          orderBy: { createdAt: 'desc' },
          take: 100,
        },
      },
    })

    if (!subscription) {
      return null
    }

    // Calculate current usage
    const usage = await this.calculateCurrentUsage(tenantId, subscription.id)

    // Parse features and limits
    const features = JSON.parse(subscription.enabledFeatures || '[]')
    const limits = subscription.customLimits 
      ? JSON.parse(subscription.customLimits)
      : JSON.parse(subscription.bundle.limits)

    return {
      ...subscription,
      features,
      limits,
      usage,
      isTrialExpired: subscription.trialEndsAt ? new Date() > subscription.trialEndsAt : false,
    }
  }

  /**
   * Create a new subscription
   */
  async createSubscription(
    tenantId: string,
    email: string,
    params: z.infer<typeof createSubscriptionSchema>
  ) {
    const validated = createSubscriptionSchema.parse(params)
    
    // Check if subscription already exists
    const existing = await this.getCurrentSubscription(tenantId)
    if (existing) {
      throw new Error('Subscription already exists. Please upgrade instead.')
    }

    // Get bundle
    const bundle = await prisma.bundle.findFirst({
      where: {
        tier: validated.tier,
        category: 'erp', // Default to ERP category
      },
    })

    if (!bundle) {
      throw new Error(`Bundle not found for tier: ${validated.tier}`)
    }

    // Calculate price
    const price = this.calculatePrice(
      SUBSCRIPTION_TIERS[validated.tier].basePrice,
      SUBSCRIPTION_TIERS[validated.tier].perUserPrice,
      validated.users,
      validated.billingCycle
    )

    // Create Stripe customer
    const stripeCustomer = await createOrGetCustomer(tenantId, email)

    // Create subscription in database (initially as trial)
    const subscription = await prisma.tenantSubscription.create({
      data: {
        tenantId,
        bundleId: bundle.id,
        users: validated.users,
        price,
        status: SubscriptionStatus.TRIAL,
        billingCycle: validated.billingCycle === 'monthly' ? BillingCycle.MONTHLY : BillingCycle.ANNUAL,
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 day trial
        enabledFeatures: JSON.stringify(SUBSCRIPTION_TIERS[validated.tier].features),
        stripeCustomerId: stripeCustomer.id,
      },
    })

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'subscription_created',
        description: `Started ${validated.tier} subscription trial`,
        tenantId,
        metadata: {
          tier: validated.tier,
          billingCycle: validated.billingCycle,
          users: validated.users,
          price,
        },
      },
    })

    return subscription
  }

  /**
   * Create Stripe checkout session for subscription
   */
  async createCheckoutSession(
    tenantId: string,
    tier: SubscriptionTier,
    billingCycle: 'monthly' | 'annual',
    successUrl: string,
    cancelUrl: string
  ) {
    const subscription = await this.getCurrentSubscription(tenantId)
    if (!subscription) {
      throw new Error('No subscription found')
    }

    if (!subscription.stripeCustomerId) {
      throw new Error('Stripe customer not found')
    }

    const priceId = SUBSCRIPTION_TIERS[tier].stripePriceIds[billingCycle]
    if (!priceId) {
      throw new Error('Stripe price ID not configured')
    }

    const session = await createCheckoutSession({
      customerId: subscription.stripeCustomerId,
      priceId,
      successUrl,
      cancelUrl,
      quantity: subscription.users,
      metadata: {
        tenantId,
        subscriptionId: subscription.id,
        tier,
        billingCycle,
      },
    })

    return session
  }

  /**
   * Create customer portal session
   */
  async createPortalSession(tenantId: string, returnUrl: string) {
    const subscription = await this.getCurrentSubscription(tenantId)
    if (!subscription || !subscription.stripeCustomerId) {
      throw new Error('No active subscription found')
    }

    const session = await createCustomerPortalSession(
      subscription.stripeCustomerId,
      returnUrl
    )

    return session
  }

  /**
   * Update subscription (upgrade/downgrade)
   */
  async updateSubscription(
    tenantId: string,
    updates: z.infer<typeof updateSubscriptionSchema>
  ) {
    const validated = updateSubscriptionSchema.parse(updates)
    const subscription = await this.getCurrentSubscription(tenantId)
    
    if (!subscription) {
      throw new Error('No subscription found')
    }

    // Check if changing tier
    if (validated.tier && validated.tier !== subscription.bundle.tier) {
      // Validate upgrade/downgrade rules
      const currentTierIndex = Object.keys(SUBSCRIPTION_TIERS).indexOf(subscription.bundle.tier)
      const newTierIndex = Object.keys(SUBSCRIPTION_TIERS).indexOf(validated.tier)
      
      if (newTierIndex < currentTierIndex) {
        // Downgrading - check usage
        const usage = await this.calculateCurrentUsage(tenantId, subscription.id)
        const newLimits = SUBSCRIPTION_TIERS[validated.tier].limits
        
        if (usage.users > newLimits.users) {
          throw new Error(`Cannot downgrade: Current users (${usage.users}) exceed ${validated.tier} limit (${newLimits.users})`)
        }
        
        if (usage.storage > newLimits.storage) {
          throw new Error(`Cannot downgrade: Current storage (${usage.storage}MB) exceeds ${validated.tier} limit (${newLimits.storage}MB)`)
        }
      }
    }

    // Get new bundle if tier changed
    let newBundle = subscription.bundle
    if (validated.tier && validated.tier !== subscription.bundle.tier) {
      const bundle = await prisma.bundle.findFirst({
        where: {
          tier: validated.tier,
          category: subscription.bundle.category,
        },
      })
      
      if (!bundle) {
        throw new Error(`Bundle not found for tier: ${validated.tier}`)
      }
      
      newBundle = bundle
    }

    // Calculate new price
    const tier = validated.tier || subscription.bundle.tier as SubscriptionTier
    const users = validated.users || subscription.users
    const billingCycle = validated.billingCycle || 
      (subscription.billingCycle === BillingCycle.MONTHLY ? 'monthly' : 'annual')
    
    const newPrice = this.calculatePrice(
      SUBSCRIPTION_TIERS[tier].basePrice,
      SUBSCRIPTION_TIERS[tier].perUserPrice,
      users,
      billingCycle as 'monthly' | 'annual'
    )

    // Update subscription
    const updated = await prisma.tenantSubscription.update({
      where: { id: subscription.id },
      data: {
        bundleId: newBundle.id,
        users,
        price: newPrice,
        billingCycle: billingCycle === 'monthly' ? BillingCycle.MONTHLY : BillingCycle.ANNUAL,
        enabledFeatures: validated.tier ? JSON.stringify(SUBSCRIPTION_TIERS[tier].features) : undefined,
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'subscription_updated',
        description: `Updated subscription: ${Object.entries(validated).map(([k, v]) => `${k}=${v}`).join(', ')}`,
        tenantId,
        metadata: {
          changes: validated,
          oldTier: subscription.bundle.tier,
          newTier: tier,
          oldPrice: subscription.price,
          newPrice,
        },
      },
    })

    return updated
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(tenantId: string, reason?: string) {
    const subscription = await this.getCurrentSubscription(tenantId)
    if (!subscription) {
      throw new Error('No subscription found')
    }

    // Update status
    await prisma.tenantSubscription.update({
      where: { id: subscription.id },
      data: {
        status: SubscriptionStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    })

    // Cancel in Stripe if exists
    if (subscription.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: true,
        })
      } catch (error) {
        console.error('Failed to cancel Stripe subscription:', error)
      }
    }

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'subscription_cancelled',
        description: `Cancelled subscription${reason ? `: ${reason}` : ''}`,
        tenantId,
        metadata: {
          reason,
          tier: subscription.bundle.tier,
        },
      },
    })

    return { success: true, message: 'Subscription cancelled successfully' }
  }

  /**
   * Record usage metrics
   */
  async recordUsage(
    tenantId: string,
    metricType: 'users' | 'storage' | 'api_calls' | 'ai_operations',
    value: number
  ) {
    const subscription = await this.getCurrentSubscription(tenantId)
    if (!subscription) {
      throw new Error('No subscription found')
    }

    await prisma.usageMetric.create({
      data: {
        metricType,
        value,
        recordedAt: new Date(),
        tenantSubscriptionId: subscription.id,
      },
    })
  }

  /**
   * Calculate current usage
   */
  async calculateCurrentUsage(tenantId: string, subscriptionId: string) {
    const [users, storage, apiCalls, aiOperations] = await Promise.all([
      // Count active users
      prisma.user.count({
        where: {
          tenantId,
          isActive: true,
        },
      }),
      
      // Calculate storage (mock for now)
      Promise.resolve(Math.floor(Math.random() * 1000)),
      
      // Count API calls in last 30 days (from usage metrics)
      prisma.usageMetric.aggregate({
        where: {
          tenantSubscriptionId: subscriptionId,
          metricType: 'api_calls',
          recordedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        _sum: {
          value: true,
        },
      }),
      
      // Count AI operations in last 30 days
      prisma.usageMetric.aggregate({
        where: {
          tenantSubscriptionId: subscriptionId,
          metricType: 'ai_operations',
          recordedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        _sum: {
          value: true,
        },
      }),
    ])

    return {
      users,
      storage,
      apiCalls: apiCalls._sum.value || 0,
      aiOperations: aiOperations._sum.value || 0,
    }
  }

  /**
   * Check usage limits
   */
  async checkUsageLimits(tenantId: string) {
    const subscription = await this.getCurrentSubscription(tenantId)
    if (!subscription) {
      return { allowed: false, reason: 'No active subscription' }
    }

    const usage = await this.calculateCurrentUsage(tenantId, subscription.id)
    const limits = subscription.customLimits 
      ? JSON.parse(subscription.customLimits)
      : JSON.parse(subscription.bundle.limits)

    const violations = []
    
    if (limits.users !== -1 && usage.users > limits.users) {
      violations.push(`User limit exceeded (${usage.users}/${limits.users})`)
    }
    
    if (limits.storage !== -1 && usage.storage > limits.storage) {
      violations.push(`Storage limit exceeded (${usage.storage}MB/${limits.storage}MB)`)
    }
    
    if (limits.apiCalls !== -1 && usage.apiCalls > limits.apiCalls) {
      violations.push(`API call limit exceeded (${usage.apiCalls}/${limits.apiCalls})`)
    }
    
    if (limits.aiOperations !== -1 && usage.aiOperations > limits.aiOperations) {
      violations.push(`AI operation limit exceeded (${usage.aiOperations}/${limits.aiOperations})`)
    }

    return {
      allowed: violations.length === 0,
      violations,
      usage,
      limits,
    }
  }

  /**
   * Calculate subscription price
   */
  private calculatePrice(
    basePrice: number,
    perUserPrice: number,
    users: number,
    billingCycle: 'monthly' | 'annual'
  ): number {
    const monthlyPrice = basePrice + (perUserPrice * users)
    
    if (billingCycle === 'annual') {
      // 20% discount for annual billing
      return Math.round(monthlyPrice * 12 * 0.8)
    }
    
    return monthlyPrice
  }

  /**
   * Get subscription analytics
   */
  async getSubscriptionAnalytics(tenantId: string) {
    const subscription = await this.getCurrentSubscription(tenantId)
    if (!subscription) {
      return null
    }

    const usage = await this.calculateCurrentUsage(tenantId, subscription.id)
    const limits = JSON.parse(subscription.customLimits || subscription.bundle.limits)

    // Calculate usage percentages
    const usagePercentages = {
      users: limits.users === -1 ? 0 : (usage.users / limits.users) * 100,
      storage: limits.storage === -1 ? 0 : (usage.storage / limits.storage) * 100,
      apiCalls: limits.apiCalls === -1 ? 0 : (usage.apiCalls / limits.apiCalls) * 100,
      aiOperations: limits.aiOperations === -1 ? 0 : (usage.aiOperations / limits.aiOperations) * 100,
    }

    // Get historical usage trends
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const usageTrends = await prisma.usageMetric.groupBy({
      by: ['metricType'],
      where: {
        tenantSubscriptionId: subscription.id,
        recordedAt: { gte: thirtyDaysAgo },
      },
      _avg: {
        value: true,
      },
      _max: {
        value: true,
      },
      _count: true,
    })

    return {
      subscription: {
        tier: subscription.bundle.tier,
        status: subscription.status,
        billingCycle: subscription.billingCycle,
        price: subscription.price,
        users: subscription.users,
        startDate: subscription.startDate,
        trialEndsAt: subscription.trialEndsAt,
      },
      usage,
      limits,
      usagePercentages,
      trends: usageTrends,
      recommendations: this.generateUpgradeRecommendations(usagePercentages),
    }
  }

  /**
   * Generate upgrade recommendations based on usage
   */
  private generateUpgradeRecommendations(usagePercentages: Record<string, number>) {
    const recommendations = []
    
    if (usagePercentages.users > 80) {
      recommendations.push({
        type: 'upgrade',
        metric: 'users',
        message: 'You\'re approaching your user limit. Consider upgrading for more users.',
        urgency: 'high',
      })
    }
    
    if (usagePercentages.storage > 90) {
      recommendations.push({
        type: 'upgrade',
        metric: 'storage',
        message: 'Storage usage is critical. Upgrade for more storage space.',
        urgency: 'critical',
      })
    }
    
    if (usagePercentages.aiOperations > 70) {
      recommendations.push({
        type: 'addon',
        metric: 'ai_operations',
        message: 'Consider adding more AI operations to your plan.',
        urgency: 'medium',
      })
    }

    return recommendations
  }
}

// Singleton instance
export const subscriptionManager = new SubscriptionManager()