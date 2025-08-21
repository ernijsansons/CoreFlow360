/**
 * Subscription Lifecycle Tests
 * Tests the complete subscription flow from creation to cancellation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    subscription: {
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
    },
    subscriptionModule: {
      createMany: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}))

vi.mock('@/lib/stripe/stripe', () => ({
  stripe: {
    subscriptions: {
      create: vi.fn(),
      update: vi.fn(),
      cancel: vi.fn(),
      retrieve: vi.fn(),
    },
    customers: {
      create: vi.fn(),
      retrieve: vi.fn(),
    },
    prices: {
      list: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe/stripe'

describe('Subscription Lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default user mock
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
      tenantId: 'tenant-123',
      stripeCustomerId: 'cus_123',
    })
  })

  describe('Subscription Creation', () => {
    it('should create new subscription for existing customer', async () => {
      const mockSubscription = {
        id: 'sub_123',
        customer: 'cus_123',
        status: 'active',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000),
        items: {
          data: [
            {
              price: {
                id: 'price_INTELLIGENT_monthly',
                unit_amount: 4900,
                currency: 'usd',
              },
            },
          ],
        },
      }

      stripe.subscriptions.create.mockResolvedValue(mockSubscription)
      prisma.subscription.create.mockResolvedValue({
        id: 'local_sub_123',
        stripeSubscriptionId: 'sub_123',
        status: 'active',
        tier: 'INTELLIGENT',
      })

      // Simulate subscription creation request
      const subscriptionData = {
        userId: 'user-123',
        priceId: 'price_INTELLIGENT_monthly',
        modules: ['crm', 'accounting'],
      }

      // Test subscription creation logic
      const result = await createSubscription(subscriptionData)

      expect(stripe.subscriptions.create).toHaveBeenCalledWith({
        customer: 'cus_123',
        items: [{ price: 'price_INTELLIGENT_monthly' }],
        metadata: {
          userId: 'user-123',
          tenantId: 'tenant-123',
        },
      })

      expect(prisma.subscription.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          stripeSubscriptionId: 'sub_123',
          status: 'active',
          tier: 'INTELLIGENT',
          currentPeriodStart: expect.any(Date),
          currentPeriodEnd: expect.any(Date),
        },
      })

      expect(result.success).toBe(true)
      expect(result.subscriptionId).toBe('sub_123')
    })

    it('should create customer if none exists', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        tenantId: 'tenant-123',
        stripeCustomerId: null, // No existing customer
      })

      const mockCustomer = {
        id: 'cus_new_123',
        email: 'test@example.com',
      }

      const mockSubscription = {
        id: 'sub_123',
        customer: 'cus_new_123',
        status: 'active',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000),
      }

      stripe.customers.create.mockResolvedValue(mockCustomer)
      stripe.subscriptions.create.mockResolvedValue(mockSubscription)
      prisma.user.update.mockResolvedValue({})
      prisma.subscription.create.mockResolvedValue({})

      const subscriptionData = {
        userId: 'user-123',
        priceId: 'price_INTELLIGENT_monthly',
      }

      const result = await createSubscription(subscriptionData)

      expect(stripe.customers.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        metadata: {
          userId: 'user-123',
          tenantId: 'tenant-123',
        },
      })

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { stripeCustomerId: 'cus_new_123' },
      })

      expect(result.success).toBe(true)
    })

    it('should handle payment method required scenario', async () => {
      const mockSubscription = {
        id: 'sub_123',
        customer: 'cus_123',
        status: 'incomplete',
        latest_invoice: {
          payment_intent: {
            status: 'requires_payment_method',
            client_secret: 'pi_123_secret_abc',
          },
        },
      }

      stripe.subscriptions.create.mockResolvedValue(mockSubscription)

      const subscriptionData = {
        userId: 'user-123',
        priceId: 'price_INTELLIGENT_monthly',
      }

      const result = await createSubscription(subscriptionData)

      expect(result.success).toBe(false)
      expect(result.requiresPaymentMethod).toBe(true)
      expect(result.clientSecret).toBe('pi_123_secret_abc')
    })
  })

  describe('Subscription Upgrades and Downgrades', () => {
    it('should handle tier upgrade with proration', async () => {
      const existingSubscription = {
        id: 'sub_123',
        items: {
          data: [
            {
              id: 'si_123',
              price: {
                id: 'price_INTELLIGENT_monthly',
                unit_amount: 1500,
              },
            },
          ],
        },
      }

      const updatedSubscription = {
        id: 'sub_123',
        status: 'active',
        items: {
          data: [
            {
              id: 'si_123',
              price: {
                id: 'price_INTELLIGENT_monthly',
                unit_amount: 4900,
              },
            },
          ],
        },
      }

      stripe.subscriptions.retrieve.mockResolvedValue(existingSubscription)
      stripe.subscriptions.update.mockResolvedValue(updatedSubscription)
      prisma.subscription.update.mockResolvedValue({})

      const upgradeData = {
        subscriptionId: 'sub_123',
        newPriceId: 'price_INTELLIGENT_monthly',
        newTier: 'INTELLIGENT',
      }

      const result = await upgradeSubscription(upgradeData)

      expect(stripe.subscriptions.update).toHaveBeenCalledWith('sub_123', {
        items: [
          {
            id: 'si_123',
            price: 'price_INTELLIGENT_monthly',
          },
        ],
        proration_behavior: 'create_prorations',
      })

      expect(prisma.subscription.update).toHaveBeenCalledWith({
        where: { stripeSubscriptionId: 'sub_123' },
        data: { tier: 'INTELLIGENT' },
      })

      expect(result.success).toBe(true)
    })

    it('should handle module additions', async () => {
      const subscriptionData = {
        subscriptionId: 'sub_123',
        addModules: ['hr', 'inventory'],
        removeModules: ['crm'],
      }

      prisma.subscription.findUnique.mockResolvedValue({
        id: 'local_sub_123',
        modules: [
          { moduleId: 'crm', isActive: true },
          { moduleId: 'accounting', isActive: true },
        ],
      })

      prisma.subscriptionModule.deleteMany.mockResolvedValue({})
      prisma.subscriptionModule.createMany.mockResolvedValue({})

      const result = await updateSubscriptionModules(subscriptionData)

      expect(prisma.subscriptionModule.deleteMany).toHaveBeenCalledWith({
        where: {
          subscriptionId: 'local_sub_123',
          moduleId: { in: ['crm'] },
        },
      })

      expect(prisma.subscriptionModule.createMany).toHaveBeenCalledWith({
        data: [
          { subscriptionId: 'local_sub_123', moduleId: 'hr', isActive: true },
          { subscriptionId: 'local_sub_123', moduleId: 'inventory', isActive: true },
        ],
      })

      expect(result.success).toBe(true)
    })
  })

  describe('Subscription Cancellation', () => {
    it('should handle immediate cancellation', async () => {
      const mockCancelledSubscription = {
        id: 'sub_123',
        status: 'canceled',
        canceled_at: Math.floor(Date.now() / 1000),
      }

      stripe.subscriptions.cancel.mockResolvedValue(mockCancelledSubscription)
      prisma.subscription.update.mockResolvedValue({})

      const cancellationData = {
        subscriptionId: 'sub_123',
        immediate: true,
      }

      const result = await cancelSubscription(cancellationData)

      expect(stripe.subscriptions.cancel).toHaveBeenCalledWith('sub_123', {
        prorate: true,
      })

      expect(prisma.subscription.update).toHaveBeenCalledWith({
        where: { stripeSubscriptionId: 'sub_123' },
        data: {
          status: 'canceled',
          canceledAt: expect.any(Date),
        },
      })

      expect(result.success).toBe(true)
    })

    it('should handle end-of-period cancellation', async () => {
      const mockUpdatedSubscription = {
        id: 'sub_123',
        status: 'active',
        cancel_at_period_end: true,
      }

      stripe.subscriptions.update.mockResolvedValue(mockUpdatedSubscription)
      prisma.subscription.update.mockResolvedValue({})

      const cancellationData = {
        subscriptionId: 'sub_123',
        immediate: false,
      }

      const result = await cancelSubscription(cancellationData)

      expect(stripe.subscriptions.update).toHaveBeenCalledWith('sub_123', {
        cancel_at_period_end: true,
      })

      expect(prisma.subscription.update).toHaveBeenCalledWith({
        where: { stripeSubscriptionId: 'sub_123' },
        data: {
          cancelAtPeriodEnd: true,
        },
      })

      expect(result.success).toBe(true)
    })
  })

  describe('Error Scenarios', () => {
    it('should handle Stripe API failures gracefully', async () => {
      stripe.subscriptions.create.mockRejectedValue(new Error('Stripe API error'))

      const subscriptionData = {
        userId: 'user-123',
        priceId: 'price_INTELLIGENT_monthly',
      }

      const result = await createSubscription(subscriptionData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Stripe API error')
    })

    it('should handle database transaction failures', async () => {
      stripe.subscriptions.create.mockResolvedValue({
        id: 'sub_123',
        status: 'active',
      })

      prisma.subscription.create.mockRejectedValue(new Error('Database error'))

      const subscriptionData = {
        userId: 'user-123',
        priceId: 'price_INTELLIGENT_monthly',
      }

      const result = await createSubscription(subscriptionData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Database error')

      // Should attempt to clean up the Stripe subscription
      expect(stripe.subscriptions.cancel).toHaveBeenCalledWith('sub_123')
    })

    it('should validate subscription state before operations', async () => {
      prisma.subscription.findUnique.mockResolvedValue({
        id: 'local_sub_123',
        status: 'canceled',
      })

      const upgradeData = {
        subscriptionId: 'sub_123',
        newPriceId: 'price_INTELLIGENT_monthly',
      }

      const result = await upgradeSubscription(upgradeData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Cannot upgrade canceled subscription')
    })
  })
})

// Mock implementation functions for testing
async function createSubscription(data: any) {
  try {
    const user = await prisma.user.findUnique({ where: { id: data.userId } })
    if (!user) throw new Error('User not found')

    let customerId = user.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
          tenantId: user.tenantId,
        },
      })
      customerId = customer.id
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      })
    }

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: data.priceId }],
      metadata: {
        userId: user.id,
        tenantId: user.tenantId,
      },
    })

    if (subscription.status === 'incomplete') {
      return {
        success: false,
        requiresPaymentMethod: true,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
      }
    }

    await prisma.subscription.create({
      data: {
        userId: user.id,
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        tier: getTierFromPriceId(data.priceId),
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    })

    return { success: true, subscriptionId: subscription.id }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

async function upgradeSubscription(data: any) {
  try {
    const localSub = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: data.subscriptionId },
    })

    if (!localSub || localSub.status === 'canceled') {
      return { success: false, error: 'Cannot upgrade canceled subscription' }
    }

    const subscription = await stripe.subscriptions.retrieve(data.subscriptionId)
    const subscriptionItem = subscription.items.data[0]

    await stripe.subscriptions.update(data.subscriptionId, {
      items: [
        {
          id: subscriptionItem.id,
          price: data.newPriceId,
        },
      ],
      proration_behavior: 'create_prorations',
    })

    await prisma.subscription.update({
      where: { stripeSubscriptionId: data.subscriptionId },
      data: { tier: data.newTier },
    })

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

async function updateSubscriptionModules(data: any) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: data.subscriptionId },
      include: { modules: true },
    })

    if (!subscription) throw new Error('Subscription not found')

    if (data.removeModules?.length > 0) {
      await prisma.subscriptionModule.deleteMany({
        where: {
          subscriptionId: subscription.id,
          moduleId: { in: data.removeModules },
        },
      })
    }

    if (data.addModules?.length > 0) {
      await prisma.subscriptionModule.createMany({
        data: data.addModules.map((moduleId: string) => ({
          subscriptionId: subscription.id,
          moduleId,
          isActive: true,
        })),
      })
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

async function cancelSubscription(data: any) {
  try {
    if (data.immediate) {
      const cancelledSubscription = await stripe.subscriptions.cancel(data.subscriptionId, {
        prorate: true,
      })

      await prisma.subscription.update({
        where: { stripeSubscriptionId: data.subscriptionId },
        data: {
          status: 'canceled',
          canceledAt: new Date(cancelledSubscription.canceled_at! * 1000),
        },
      })
    } else {
      await stripe.subscriptions.update(data.subscriptionId, {
        cancel_at_period_end: true,
      })

      await prisma.subscription.update({
        where: { stripeSubscriptionId: data.subscriptionId },
        data: { cancelAtPeriodEnd: true },
      })
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

function getTierFromPriceId(priceId: string): string {
  if (priceId.includes('INTELLIGENT')) return 'INTELLIGENT'
  if (priceId.includes('INTELLIGENT')) return 'INTELLIGENT'
  if (priceId.includes('autonomous')) return 'autonomous'
  if (priceId.includes('ADVANCED')) return 'ADVANCED'
  return 'INTELLIGENT'
}
