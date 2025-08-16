/**
 * CoreFlow360 - Stripe Integration Test Suite
 * Tests Stripe checkout, webhooks, and subscription lifecycle
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import Stripe from 'stripe'

// Mock Stripe
vi.mock('stripe', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      checkout: {
        sessions: {
          create: vi.fn().mockResolvedValue({
            id: 'cs_test_123',
            url: 'https://checkout.stripe.com/test',
            customer: 'cus_test_123'
          })
        }
      },
      customers: {
        list: vi.fn().mockResolvedValue({ data: [] }),
        create: vi.fn().mockResolvedValue({
          id: 'cus_test_123',
          email: 'test@example.com'
        }),
        update: vi.fn().mockResolvedValue({
          id: 'cus_test_123'
        })
      },
      webhooks: {
        constructEvent: vi.fn()
      },
      billingPortal: {
        sessions: {
          create: vi.fn().mockResolvedValue({
            id: 'bps_test_123',
            url: 'https://billing.stripe.com/test'
          })
        }
      },
      subscriptions: {
        retrieve: vi.fn().mockResolvedValue({
          id: 'sub_test_123',
          items: {
            data: []
          },
          current_period_start: Math.floor(Date.now() / 1000),
          current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
        })
      },
      subscriptionItems: {
        createUsageRecord: vi.fn().mockResolvedValue({
          id: 'usage_test_123',
          timestamp: Math.floor(Date.now() / 1000)
        })
      }
    }))
  }
})

describe('Stripe Integration Test Suite', () => {
  let mockStripe: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockStripe = new (Stripe as any)('test_key')
  })

  describe('Checkout Session Creation', () => {
    it('should create a checkout session with correct parameters', async () => {
      const { POST } = await import('@/app/api/stripe/create-checkout/route')
      
      const request = new NextRequest('http://localhost:3000/api/stripe/create-checkout', {
        method: 'POST',
        body: JSON.stringify({
          tenantId: 'test-tenant',
          modules: ['crm', 'accounting'],
          userCount: 10,
          billingCycle: 'monthly',
          customerEmail: 'test@example.com',
          customerName: 'Test User',
          companyName: 'Test Company',
          successUrl: 'http://localhost:3000/success',
          cancelUrl: 'http://localhost:3000/cancel'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.sessionId).toBe('cs_test_123')
      expect(data.sessionUrl).toBe('https://checkout.stripe.com/test')
      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'subscription',
          customer: 'cus_test_123',
          success_url: expect.stringContaining('session_id={CHECKOUT_SESSION_ID}'),
          cancel_url: 'http://localhost:3000/cancel'
        })
      )
    })

    it('should handle bundle subscriptions', async () => {
      const { POST } = await import('@/app/api/stripe/create-checkout/route')
      
      const request = new NextRequest('http://localhost:3000/api/stripe/create-checkout', {
        method: 'POST',
        body: JSON.stringify({
          tenantId: 'test-tenant',
          modules: ['crm', 'accounting'],
          bundleKey: 'starter',
          userCount: 10,
          billingCycle: 'annual',
          customerEmail: 'test@example.com',
          customerName: 'Test User',
          companyName: 'Test Company',
          successUrl: 'http://localhost:3000/success',
          cancelUrl: 'http://localhost:3000/cancel'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.metadata.bundle).toBe('starter')
    })
  })

  describe('Webhook Processing', () => {
    it('should process checkout.session.completed event', async () => {
      const { POST } = await import('@/app/api/stripe/webhook/route')
      
      const event = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            customer: 'cus_test_123',
            subscription: 'sub_test_123',
            metadata: {
              tenant_id: 'test-tenant',
              modules: 'crm,accounting',
              user_count: '10',
              billing_cycle: 'monthly'
            }
          }
        }
      }

      mockStripe.webhooks.constructEvent.mockReturnValue(event)

      const request = new NextRequest('http://localhost:3000/api/stripe/webhook', {
        method: 'POST',
        headers: {
          'stripe-signature': 'test-signature'
        },
        body: JSON.stringify(event)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.received).toBe(true)
    })

    it('should handle subscription cancellation', async () => {
      const { POST } = await import('@/app/api/stripe/webhook/route')
      
      const event = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_test_123',
            customer: 'cus_test_123',
            status: 'canceled',
            metadata: {
              tenant_id: 'test-tenant'
            }
          }
        }
      }

      mockStripe.webhooks.constructEvent.mockReturnValue(event)

      const request = new NextRequest('http://localhost:3000/api/stripe/webhook', {
        method: 'POST',
        headers: {
          'stripe-signature': 'test-signature'
        },
        body: JSON.stringify(event)
      })

      const response = await POST(request)
      
      expect(response.status).toBe(200)
    })

    it('should handle payment failure', async () => {
      const { POST } = await import('@/app/api/stripe/webhook/route')
      
      const event = {
        type: 'invoice.payment_failed',
        data: {
          object: {
            id: 'inv_test_123',
            subscription: 'sub_test_123',
            total: 15000,
            amount_paid: 0,
            attempt_count: 1
          }
        }
      }

      mockStripe.webhooks.constructEvent.mockReturnValue(event)

      const request = new NextRequest('http://localhost:3000/api/stripe/webhook', {
        method: 'POST',
        headers: {
          'stripe-signature': 'test-signature'
        },
        body: JSON.stringify(event)
      })

      const response = await POST(request)
      
      expect(response.status).toBe(200)
    })
  })

  describe('Customer Portal', () => {
    it('should create customer portal session', async () => {
      const { POST } = await import('@/app/api/stripe/customer-portal/route')
      
      const request = new NextRequest('http://localhost:3000/api/stripe/customer-portal', {
        method: 'POST',
        body: JSON.stringify({
          tenantId: 'test-tenant',
          returnUrl: 'http://localhost:3000/dashboard'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.portalUrl).toBe('https://billing.stripe.com/test')
      expect(mockStripe.billingPortal.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          return_url: 'http://localhost:3000/dashboard'
        })
      )
    })
  })

  describe('Usage Reporting', () => {
    it('should report usage metrics to Stripe', async () => {
      const { POST } = await import('@/app/api/stripe/usage-reporting/route')
      
      const request = new NextRequest('http://localhost:3000/api/stripe/usage-reporting', {
        method: 'POST',
        body: JSON.stringify({
          tenantId: 'test-tenant',
          metric: 'api_calls',
          quantity: 1000,
          action: 'increment'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should validate metric types', async () => {
      const { POST } = await import('@/app/api/stripe/usage-reporting/route')
      
      const request = new NextRequest('http://localhost:3000/api/stripe/usage-reporting', {
        method: 'POST',
        body: JSON.stringify({
          tenantId: 'test-tenant',
          metric: 'invalid_metric',
          quantity: 100
        })
      })

      const response = await POST(request)
      
      expect(response.status).toBe(400)
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid webhook signatures', async () => {
      const { POST } = await import('@/app/api/stripe/webhook/route')
      
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature')
      })

      const request = new NextRequest('http://localhost:3000/api/stripe/webhook', {
        method: 'POST',
        headers: {
          'stripe-signature': 'invalid-signature'
        },
        body: JSON.stringify({})
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid signature')
    })

    it('should handle missing required fields', async () => {
      const { POST } = await import('@/app/api/stripe/create-checkout/route')
      
      const request = new NextRequest('http://localhost:3000/api/stripe/create-checkout', {
        method: 'POST',
        body: JSON.stringify({
          tenantId: 'test-tenant'
          // Missing required fields
        })
      })

      const response = await POST(request)
      
      expect(response.status).toBe(400)
    })
  })
})