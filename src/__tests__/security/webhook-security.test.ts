/**
 * CoreFlow360 - Webhook Security Tests
 * 
 * Comprehensive tests for webhook security validation including
 * timestamp validation, replay attack prevention, and signature verification
 */

import crypto from 'crypto'
import { createWebhookValidator, WEBHOOK_CONFIGS } from '@/lib/security/webhook-security'
import { testConfig } from '@/test-config'

describe('Webhook Security Validation', () => {
  const testSecret = testConfig.security.webhookSecret
  
  describe('Stripe Webhook Security', () => {
    const stripeValidator = createWebhookValidator({
      ...WEBHOOK_CONFIGS.stripe,
      secret: testSecret
    })

    it('should validate valid Stripe webhook with proper timestamp and signature', async () => {
      const timestamp = Math.floor(Date.now() / 1000)
      const body = JSON.stringify({ test: 'data' })
      const signedPayload = timestamp + '.' + body
      const signature = crypto.createHmac('sha256', testSecret).update(signedPayload).digest('hex')
      
      const payload = {
        body,
        headers: {
          'stripe-signature': `t=${timestamp},v1=${signature}`
        },
        method: 'POST',
        url: 'https://example.com/webhook'
      }

      const result = await stripeValidator.validateWebhook(payload)
      expect(result.isValid).toBe(true)
      expect(result.metadata.signatureValid).toBe(true)
      expect(result.metadata.replayProtected).toBe(true)
    })

    it('should reject Stripe webhook with invalid signature', async () => {
      const timestamp = Math.floor(Date.now() / 1000)
      const body = JSON.stringify({ test: 'data' })
      const invalidSignature = 'invalid-signature'
      
      const payload = {
        body,
        headers: {
          'stripe-signature': `t=${timestamp},v1=${invalidSignature}`
        },
        method: 'POST',
        url: 'https://example.com/webhook'
      }

      const result = await stripeValidator.validateWebhook(payload)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Invalid Stripe signature')
    })

    it('should reject Stripe webhook with expired timestamp', async () => {
      const expiredTimestamp = Math.floor(Date.now() / 1000) - 600 // 10 minutes ago
      const body = JSON.stringify({ test: 'data' })
      const signedPayload = expiredTimestamp + '.' + body
      const signature = crypto.createHmac('sha256', testSecret).update(signedPayload).digest('hex')
      
      const payload = {
        body,
        headers: {
          'stripe-signature': `t=${expiredTimestamp},v1=${signature}`
        },
        method: 'POST',
        url: 'https://example.com/webhook'
      }

      const result = await stripeValidator.validateWebhook(payload)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Timestamp outside tolerance')
    })

    it('should detect replay attacks', async () => {
      const timestamp = Math.floor(Date.now() / 1000)
      const body = JSON.stringify({ test: 'data' })
      const signedPayload = timestamp + '.' + body
      const signature = crypto.createHmac('sha256', testSecret).update(signedPayload).digest('hex')
      
      const payload = {
        body,
        headers: {
          'stripe-signature': `t=${timestamp},v1=${signature}`
        },
        method: 'POST',
        url: 'https://example.com/webhook'
      }

      // First request should succeed
      const firstResult = await stripeValidator.validateWebhook(payload)
      expect(firstResult.isValid).toBe(true)

      // Second identical request should be detected as replay attack
      const secondResult = await stripeValidator.validateWebhook(payload)
      expect(secondResult.isValid).toBe(false)
      expect(secondResult.error).toContain('replay attack')
    })
  })

  describe('Vapi Webhook Security', () => {
    const vapiValidator = createWebhookValidator({
      ...WEBHOOK_CONFIGS.vapi,
      secret: testSecret
    })

    it('should validate valid Vapi webhook with proper signature and timestamp', async () => {
      const timestamp = Math.floor(Date.now() / 1000)
      const body = JSON.stringify({ message: { type: 'call-start' } })
      const signature = crypto.createHmac('sha256', testSecret).update(body).digest('hex')
      
      const payload = {
        body,
        headers: {
          'x-vapi-signature': `sha256=${signature}`,
          'x-vapi-timestamp': timestamp.toString()
        },
        method: 'POST',
        url: 'https://example.com/webhook'
      }

      const result = await vapiValidator.validateWebhook(payload)
      expect(result.isValid).toBe(true)
      expect(result.metadata.signatureValid).toBe(true)
    })

    it('should reject Vapi webhook with invalid signature', async () => {
      const timestamp = Math.floor(Date.now() / 1000)
      const body = JSON.stringify({ message: { type: 'call-start' } })
      
      const payload = {
        body,
        headers: {
          'x-vapi-signature': 'sha256=invalid-signature',
          'x-vapi-timestamp': timestamp.toString()
        },
        method: 'POST',
        url: 'https://example.com/webhook'
      }

      const result = await vapiValidator.validateWebhook(payload)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Invalid Vapi signature')
    })
  })

  describe('Twilio Webhook Security', () => {
    const twilioValidator = createWebhookValidator({
      ...WEBHOOK_CONFIGS.twilio,
      secret: testSecret
    })

    it('should validate valid Twilio webhook with proper signature', async () => {
      const url = 'https://example.com/webhook'
      const body = 'CallSid=test&From=%2B1234567890&To=%2B0987654321'
      const data = url + body
      const signature = crypto.createHmac('sha1', testSecret).update(Buffer.from(data, 'utf-8')).digest('base64')
      
      const payload = {
        body,
        headers: {
          'x-twilio-signature': signature,
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        url
      }

      const result = await twilioValidator.validateWebhook(payload)
      expect(result.isValid).toBe(true)
      expect(result.metadata.signatureValid).toBe(true)
    })

    it('should reject Twilio webhook with invalid signature', async () => {
      const url = 'https://example.com/webhook'
      const body = 'CallSid=test&From=%2B1234567890&To=%2B0987654321'
      
      const payload = {
        body,
        headers: {
          'x-twilio-signature': 'invalid-signature',
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        url
      }

      const result = await twilioValidator.validateWebhook(payload)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Invalid Twilio signature')
    })
  })

  describe('Rate Limiting', () => {
    const rateLimitValidator = createWebhookValidator({
      ...WEBHOOK_CONFIGS.generic,
      maxRequestsPerMinute: 2, // Very low limit for testing
      secret: testSecret
    })

    it('should enforce rate limits', async () => {
      const timestamp = Math.floor(Date.now() / 1000)
      const body = JSON.stringify({ test: 'data' })
      const signature = crypto.createHmac('sha256', testSecret).update(body).digest('hex')
      
      const payload = {
        body,
        headers: {
          'x-signature': signature,
          'x-timestamp': timestamp.toString(),
          'x-forwarded-for': '192.168.1.100' // Consistent client IP
        },
        method: 'POST',
        url: 'https://example.com/webhook'
      }

      // First two requests should succeed
      const result1 = await rateLimitValidator.validateWebhook(payload)
      expect(result1.isValid).toBe(true)

      const result2 = await rateLimitValidator.validateWebhook(payload)
      expect(result2.isValid).toBe(true)

      // Third request should be rate limited
      const result3 = await rateLimitValidator.validateWebhook(payload)
      expect(result3.isValid).toBe(false)
      expect(result3.error).toContain('Rate limit exceeded')
      expect(result3.metadata.rateLimited).toBe(true)
    })
  })

  describe('Generic Webhook Security', () => {
    const genericValidator = createWebhookValidator({
      ...WEBHOOK_CONFIGS.generic,
      secret: testSecret
    })

    it('should validate generic webhook with SHA256 signature', async () => {
      const timestamp = Math.floor(Date.now() / 1000)
      const body = JSON.stringify({ event: 'test' })
      const signature = crypto.createHmac('sha256', testSecret).update(body).digest('hex')
      
      const payload = {
        body,
        headers: {
          'x-signature': `sha256=${signature}`,
          'x-timestamp': timestamp.toString()
        },
        method: 'POST',
        url: 'https://example.com/webhook'
      }

      const result = await genericValidator.validateWebhook(payload)
      expect(result.isValid).toBe(true)
      expect(result.metadata.signatureValid).toBe(true)
      expect(result.metadata.replayProtected).toBe(true)
    })
  })

  describe('Error Handling', () => {
    const validator = createWebhookValidator({
      ...WEBHOOK_CONFIGS.generic,
      secret: testSecret
    })

    it('should handle missing timestamp gracefully', async () => {
      const body = JSON.stringify({ test: 'data' })
      const signature = crypto.createHmac('sha256', testSecret).update(body).digest('hex')
      
      const payload = {
        body,
        headers: {
          'x-signature': signature
          // Missing x-timestamp header
        },
        method: 'POST',
        url: 'https://example.com/webhook'
      }

      const result = await validator.validateWebhook(payload)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Missing timestamp')
    })

    it('should handle missing signature gracefully', async () => {
      const timestamp = Math.floor(Date.now() / 1000)
      const body = JSON.stringify({ test: 'data' })
      
      const payload = {
        body,
        headers: {
          'x-timestamp': timestamp.toString()
          // Missing x-signature header
        },
        method: 'POST',
        url: 'https://example.com/webhook'
      }

      const result = await validator.validateWebhook(payload)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Missing signature')
    })
  })
})