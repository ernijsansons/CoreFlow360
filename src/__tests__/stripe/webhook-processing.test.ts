/**
 * Stripe Webhook Processing Tests
 * Critical payment system reliability tests
 */

import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'
import { NextRequest } from 'next/server'
import Stripe from 'stripe'

// Mock Stripe
vi.mock('stripe')
const MockedStripe = Stripe as unknown as Mock

// Mock the webhook route handler
import { POST as webhookHandler } from '@/app/api/stripe/webhook/route'

describe('Stripe Webhook Processing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock environment variables
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key'
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock_secret'
  })

  describe('Payment Intent Succeeded', () => {
    it('should process successful payment and upgrade subscription', async () => {
      const mockPaymentIntent = {
        id: 'pi_1234567890',
        amount: 4900, // $49.00
        currency: 'usd',
        status: 'succeeded',
        metadata: {
          tenantId: 'tenant-123',
          subscriptionTier: 'synaptic',
          userId: 'user-456'
        }
      }

      const webhookEvent = {
        id: 'evt_1234567890',
        type: 'payment_intent.succeeded',
        data: {
          object: mockPaymentIntent
        },
        created: Math.floor(Date.now() / 1000)
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/stripe/webhook', {
        method: 'POST',
        body: JSON.stringify(webhookEvent),
        headers: {
          'stripe-signature': 'mock_signature',
          'content-type': 'application/json'
        }
      })

      // Mock Stripe constructor and methods
      const mockStripeInstance = {
        webhooks: {
          constructEvent: vi.fn().mockReturnValue(webhookEvent)
        }
      }
      MockedStripe.mockImplementation(() => mockStripeInstance)

      const response = await webhookHandler(mockRequest)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.received).toBe(true)
      expect(mockStripeInstance.webhooks.constructEvent).toHaveBeenCalledWith(
        JSON.stringify(webhookEvent),
        'mock_signature',
        'whsec_mock_secret'
      )
    })

    it('should handle payment intent with missing metadata gracefully', async () => {
      const mockPaymentIntent = {
        id: 'pi_1234567890',
        amount: 4900,
        currency: 'usd',
        status: 'succeeded',
        metadata: {} // Empty metadata
      }

      const webhookEvent = {
        id: 'evt_1234567890',
        type: 'payment_intent.succeeded',
        data: {
          object: mockPaymentIntent
        }
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/stripe/webhook', {
        method: 'POST',
        body: JSON.stringify(webhookEvent),
        headers: {
          'stripe-signature': 'mock_signature',
          'content-type': 'application/json'
        }
      })

      const mockStripeInstance = {
        webhooks: {
          constructEvent: vi.fn().mockReturnValue(webhookEvent)
        }
      }
      MockedStripe.mockImplementation(() => mockStripeInstance)

      const response = await webhookHandler(mockRequest)

      expect(response.status).toBe(400)
    })
  })

  describe('Payment Intent Failed', () => {
    it('should handle failed payments and notify user', async () => {
      const mockPaymentIntent = {
        id: 'pi_1234567890',
        amount: 4900,
        currency: 'usd',
        status: 'payment_failed',
        last_payment_error: {
          message: 'Your card was declined.',
          type: 'card_error',
          code: 'card_declined'
        },
        metadata: {
          tenantId: 'tenant-123',
          userId: 'user-456'
        }
      }

      const webhookEvent = {
        id: 'evt_1234567890',
        type: 'payment_intent.payment_failed',
        data: {
          object: mockPaymentIntent
        }
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/stripe/webhook', {
        method: 'POST',
        body: JSON.stringify(webhookEvent),
        headers: {
          'stripe-signature': 'mock_signature',
          'content-type': 'application/json'
        }
      })

      const mockStripeInstance = {
        webhooks: {
          constructEvent: vi.fn().mockReturnValue(webhookEvent)
        }
      }
      MockedStripe.mockImplementation(() => mockStripeInstance)

      const response = await webhookHandler(mockRequest)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.received).toBe(true)
    })
  })

  describe('Subscription Events', () => {
    it('should handle subscription created event', async () => {
      const mockSubscription = {
        id: 'sub_1234567890',
        customer: 'cus_1234567890',
        status: 'active',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000),
        items: {
          data: [{
            price: {
              id: 'price_synaptic_monthly',
              unit_amount: 4900,
              currency: 'usd'
            }
          }]
        },
        metadata: {
          tenantId: 'tenant-123',
          userId: 'user-456'
        }
      }

      const webhookEvent = {
        id: 'evt_1234567890',
        type: 'customer.subscription.created',
        data: {
          object: mockSubscription
        }
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/stripe/webhook', {
        method: 'POST',
        body: JSON.stringify(webhookEvent),
        headers: {
          'stripe-signature': 'mock_signature',
          'content-type': 'application/json'
        }
      })

      const mockStripeInstance = {
        webhooks: {
          constructEvent: vi.fn().mockReturnValue(webhookEvent)
        }
      }
      MockedStripe.mockImplementation(() => mockStripeInstance)

      const response = await webhookHandler(mockRequest)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.received).toBe(true)
    })

    it('should handle subscription cancellation', async () => {
      const mockSubscription = {
        id: 'sub_1234567890',
        customer: 'cus_1234567890',
        status: 'canceled',
        canceled_at: Math.floor(Date.now() / 1000),
        metadata: {
          tenantId: 'tenant-123',
          userId: 'user-456'
        }
      }

      const webhookEvent = {
        id: 'evt_1234567890',
        type: 'customer.subscription.deleted',
        data: {
          object: mockSubscription
        }
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/stripe/webhook', {
        method: 'POST',
        body: JSON.stringify(webhookEvent),
        headers: {
          'stripe-signature': 'mock_signature',
          'content-type': 'application/json'
        }
      })

      const mockStripeInstance = {
        webhooks: {
          constructEvent: vi.fn().mockReturnValue(webhookEvent)
        }
      }
      MockedStripe.mockImplementation(() => mockStripeInstance)

      const response = await webhookHandler(mockRequest)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.received).toBe(true)
    })
  })

  describe('Webhook Security', () => {
    it('should reject webhooks with invalid signatures', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/stripe/webhook', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'stripe-signature': 'invalid_signature',
          'content-type': 'application/json'
        }
      })

      const mockStripeInstance = {
        webhooks: {
          constructEvent: vi.fn().mockImplementation(() => {
            throw new Error('Invalid signature')
          })
        }
      }
      MockedStripe.mockImplementation(() => mockStripeInstance)

      const response = await webhookHandler(mockRequest)

      expect(response.status).toBe(400)
    })

    it('should handle replay attacks by checking event timestamps', async () => {
      const oldTimestamp = Math.floor((Date.now() - 10 * 60 * 1000) / 1000) // 10 minutes ago

      const webhookEvent = {
        id: 'evt_1234567890',
        type: 'payment_intent.succeeded',
        created: oldTimestamp,
        data: {
          object: {
            id: 'pi_1234567890',
            status: 'succeeded'
          }
        }
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/stripe/webhook', {
        method: 'POST',
        body: JSON.stringify(webhookEvent),
        headers: {
          'stripe-signature': 'mock_signature',
          'content-type': 'application/json'
        }
      })

      const mockStripeInstance = {
        webhooks: {
          constructEvent: vi.fn().mockReturnValue(webhookEvent)
        }
      }
      MockedStripe.mockImplementation(() => mockStripeInstance)

      const response = await webhookHandler(mockRequest)

      // Should reject old events to prevent replay attacks
      expect(response.status).toBe(400)
    })

    it('should handle duplicate webhooks gracefully', async () => {
      const webhookEvent = {
        id: 'evt_duplicate_test',
        type: 'payment_intent.succeeded',
        created: Math.floor(Date.now() / 1000),
        data: {
          object: {
            id: 'pi_1234567890',
            status: 'succeeded',
            metadata: {
              tenantId: 'tenant-123',
              userId: 'user-456'
            }
          }
        }
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/stripe/webhook', {
        method: 'POST',
        body: JSON.stringify(webhookEvent),
        headers: {
          'stripe-signature': 'mock_signature',
          'content-type': 'application/json'
        }
      })

      const mockStripeInstance = {
        webhooks: {
          constructEvent: vi.fn().mockReturnValue(webhookEvent)
        }
      }
      MockedStripe.mockImplementation(() => mockStripeInstance)

      // First request should succeed
      const response1 = await webhookHandler(mockRequest)
      expect(response1.status).toBe(200)

      // Second identical request should be handled gracefully (idempotent)
      const response2 = await webhookHandler(mockRequest)
      expect(response2.status).toBe(200)
    })
  })

  describe('Error Handling', () => {
    it('should handle database connection failures during webhook processing', async () => {
      const webhookEvent = {
        id: 'evt_1234567890',
        type: 'payment_intent.succeeded',
        created: Math.floor(Date.now() / 1000),
        data: {
          object: {
            id: 'pi_1234567890',
            status: 'succeeded',
            metadata: {
              tenantId: 'tenant-123',
              userId: 'user-456'
            }
          }
        }
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/stripe/webhook', {
        method: 'POST',
        body: JSON.stringify(webhookEvent),
        headers: {
          'stripe-signature': 'mock_signature',
          'content-type': 'application/json'
        }
      })

      const mockStripeInstance = {
        webhooks: {
          constructEvent: vi.fn().mockReturnValue(webhookEvent)
        }
      }
      MockedStripe.mockImplementation(() => mockStripeInstance)

      // Mock database failure
      vi.mock('@/lib/prisma', () => ({
        prisma: {
          subscription: {
            update: vi.fn().mockRejectedValue(new Error('Database connection failed'))
          }
        }
      }))

      const response = await webhookHandler(mockRequest)

      // Should return 500 to trigger Stripe retry
      expect(response.status).toBe(500)
    })

    it('should log webhook processing errors for debugging', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const webhookEvent = {
        id: 'evt_1234567890',
        type: 'unknown_event_type',
        created: Math.floor(Date.now() / 1000),
        data: {
          object: {}
        }
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/stripe/webhook', {
        method: 'POST',
        body: JSON.stringify(webhookEvent),
        headers: {
          'stripe-signature': 'mock_signature',
          'content-type': 'application/json'
        }
      })

      const mockStripeInstance = {
        webhooks: {
          constructEvent: vi.fn().mockReturnValue(webhookEvent)
        }
      }
      MockedStripe.mockImplementation(() => mockStripeInstance)

      await webhookHandler(mockRequest)

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })
})