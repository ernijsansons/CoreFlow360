/**
 * CoreFlow360 - Webhook to Calls Integration Tests
 * End-to-end flow testing from lead ingestion to AI voice calls
 */

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
  jest,
} from '@jest/globals'
import { createServer } from 'http'
import request from 'supertest'
import { db } from '@/lib/db'
import { leadProcessor } from '@/lib/queues/lead-processor'
import { twilioClient } from '@/lib/voice/twilio-client'
import { NextApiRequest, NextApiResponse } from 'next'
import { createMocks } from 'node-mocks-http'
import WebSocket from 'ws'

// Mock external services
jest.mock('@/lib/voice/twilio-client')
jest.mock('@/lib/voice/openai-realtime')

const mockTwilioClient = twilioClient as jest.Mocked<typeof twilioClient>

describe('Webhook to Calls Integration', () => {
  let server: any
  let wsServer: WebSocket.Server
  const testPort = 3001
  const wsPort = 8082

  beforeAll(async () => {
    // Setup test WebSocket server
    wsServer = new WebSocket.Server({ port: wsPort })

    // Clean database
    await db.lead.deleteMany({ where: { phone: { contains: '+1555' } } })
    await db.callLog.deleteMany({ where: { toNumber: { contains: '+1555' } } })
  })

  afterAll(async () => {
    wsServer.close()
  })

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock successful Twilio responses
    mockTwilioClient.initiateCall.mockResolvedValue({
      success: true,
      callSid: 'CA' + Math.random().toString(36).substr(2, 14),
      status: 'queued',
      estimatedDuration: 60,
    })

    mockTwilioClient.getCallStatus.mockResolvedValue({
      callSid: 'CA123456789',
      status: 'completed',
      duration: 45,
      startTime: new Date(Date.now() - 45000),
      endTime: new Date(),
    })
  })

  describe('Facebook Lead Webhook -> Voice Call Flow', () => {
    it('should process Facebook webhook and initiate voice call', async () => {
      const facebookPayload = {
        object: 'page',
        entry: [
          {
            id: '123456789',
            time: Date.now(),
            changes: [
              {
                value: {
                  form_id: '987654321',
                  leadgen_id: 'lead_123',
                  created_time: Date.now(),
                  page_id: '123456789',
                  adgroup_id: '456789123',
                },
                field: 'leadgen',
              },
            ],
          },
        ],
      }

      // Mock Facebook API response for lead details
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          name: 'John Doe',
          email: 'john@example.com',
          phone_number: '+15551234567',
          custom_questions: [
            { question: 'Service needed?', answer: 'AC repair' },
            { question: 'Property type?', answer: 'Single family home' },
          ],
        }),
      })

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: facebookPayload,
        headers: {
          'x-hub-signature-256': 'sha256=valid_signature',
        },
      })

      // Import and call webhook handler
      const { POST } = await import('@/app/api/leads/webhook/route')
      const response = await POST(req as any)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.processed).toBe(true)

      // Wait for queue processing
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Verify lead created in database
      const lead = await db.lead.findFirst({
        where: { phone: '+15551234567' },
      })

      expect(lead).toBeDefined()
      expect(lead!.name).toBe('John Doe')
      expect(lead!.email).toBe('john@example.com')
      expect(lead!.source).toBe('facebook')
      expect(lead!.status).toBe('QUALIFIED')

      // Verify call initiated
      expect(mockTwilioClient.initiateCall).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '+15551234567',
          leadId: lead!.id,
          script: expect.objectContaining({
            id: expect.any(String),
            greeting: expect.stringContaining('CoreFlow360'),
          }),
        })
      )

      // Verify call log created
      const callLog = await db.callLog.findFirst({
        where: {
          leadId: lead!.id,
          toNumber: '+15551234567',
        },
      })

      expect(callLog).toBeDefined()
      expect(callLog!.status).toBe('QUEUED')
      expect(callLog!.callType).toBe('OUTBOUND_AUTO')
    })

    it('should handle malformed Facebook webhook', async () => {
      const invalidPayload = {
        object: 'invalid',
        entry: [],
      }

      const { req } = createMocks<NextApiRequest>({
        method: 'POST',
        body: invalidPayload,
      })

      const { POST } = await import('@/app/api/leads/webhook/route')
      const response = await POST(req as any)

      expect(response.status).toBe(400)
    })

    it('should handle duplicate webhooks idempotently', async () => {
      const payload = {
        object: 'page',
        entry: [
          {
            id: '123',
            time: Date.now(),
            changes: [
              {
                value: {
                  leadgen_id: 'duplicate_lead_123',
                  form_id: '987',
                  created_time: Date.now(),
                },
                field: 'leadgen',
              },
            ],
          },
        ],
      }

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          name: 'Jane Doe',
          phone_number: '+15559876543',
        }),
      })

      const { POST } = await import('@/app/api/leads/webhook/route')

      // Send same webhook twice
      const { req: req1 } = createMocks({ method: 'POST', body: payload })
      const { req: req2 } = createMocks({ method: 'POST', body: payload })

      const response1 = await POST(req1 as any)
      const response2 = await POST(req2 as any)

      expect(response1.status).toBe(200)
      expect(response2.status).toBe(200)

      // Should only create one lead
      const leads = await db.lead.findMany({
        where: { phone: '+15559876543' },
      })

      expect(leads).toHaveLength(1)

      // Should only initiate one call
      expect(mockTwilioClient.initiateCall).toHaveBeenCalledTimes(1)
    })
  })

  describe('Multi-Source Lead Processing', () => {
    it('should process Zapier webhook and initiate call', async () => {
      const zapierPayload = {
        source: 'google_ads',
        lead: {
          name: 'Bob Smith',
          email: 'bob@example.com',
          phone: '+15557890123',
          campaign: 'HVAC Summer 2024',
          keywords: 'ac repair near me',
        },
      }

      const { req } = createMocks({
        method: 'POST',
        body: zapierPayload,
        headers: { 'x-zapier-webhook-id': 'zap_123' },
      })

      const { POST } = await import('@/app/api/leads/webhook/route')
      const response = await POST(req as any)

      expect(response.status).toBe(200)

      await new Promise((resolve) => setTimeout(resolve, 500))

      const lead = await db.lead.findFirst({
        where: { phone: '+15557890123' },
      })

      expect(lead).toBeDefined()
      expect(lead!.source).toBe('google_ads')
      expect(mockTwilioClient.initiateCall).toHaveBeenCalled()
    })

    it('should process manual form submission', async () => {
      const formPayload = {
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        phone: '+15556547890',
        service: 'heating_maintenance',
        preferred_time: 'morning',
        message: 'Need annual maintenance',
      }

      const { req } = createMocks({
        method: 'POST',
        body: formPayload,
        headers: { 'content-type': 'application/json' },
      })

      const { POST } = await import('@/app/api/leads/webhook/route')
      const response = await POST(req as any)

      expect(response.status).toBe(200)

      await new Promise((resolve) => setTimeout(resolve, 500))

      const lead = await db.lead.findFirst({
        where: { phone: '+15556547890' },
      })

      expect(lead).toBeDefined()
      expect(lead!.source).toBe('website_form')
      expect(lead!.preferredContactTime).toBe('morning')
      expect(mockTwilioClient.initiateCall).toHaveBeenCalled()
    })
  })

  describe('Call Status Updates', () => {
    it('should handle Twilio status callbacks', async () => {
      // First create a lead and call
      const lead = await db.lead.create({
        data: {
          tenantId: 'tenant-123',
          name: 'Test User',
          phone: '+15551237890',
          email: 'test@example.com',
          source: 'test',
          status: 'NEW',
        },
      })

      const callLog = await db.callLog.create({
        data: {
          tenantId: 'tenant-123',
          twilioCallSid: 'CA987654321',
          leadId: lead.id,
          toNumber: '+15551237890',
          fromNumber: '+15559876543',
          status: 'QUEUED',
          callType: 'OUTBOUND_AUTO',
        },
      })

      // Simulate Twilio status callback
      const statusPayload = {
        CallSid: 'CA987654321',
        CallStatus: 'in-progress',
        CallDuration: '0',
        From: '+15559876543',
        To: '+15551237890',
      }

      const { req } = createMocks({
        method: 'POST',
        body: statusPayload,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
      })

      const { POST } = await import('@/app/api/voice/twilio/status/route')
      const response = await POST(req as any)

      expect(response.status).toBe(200)

      // Verify call status updated
      const updatedCall = await db.callLog.findUnique({
        where: { id: callLog.id },
      })

      expect(updatedCall!.status).toBe('IN_PROGRESS')
      expect(updatedCall!.startedAt).toBeDefined()
    })

    it('should handle call completion and update lead status', async () => {
      const lead = await db.lead.create({
        data: {
          tenantId: 'tenant-123',
          name: 'Test User 2',
          phone: '+15551234321',
          email: 'test2@example.com',
          source: 'test',
          status: 'QUALIFIED',
        },
      })

      const callLog = await db.callLog.create({
        data: {
          tenantId: 'tenant-123',
          twilioCallSid: 'CA123987456',
          leadId: lead.id,
          toNumber: '+15551234321',
          fromNumber: '+15559876543',
          status: 'IN_PROGRESS',
          callType: 'OUTBOUND_AUTO',
          startedAt: new Date(Date.now() - 60000),
        },
      })

      // Simulate call completion
      const completionPayload = {
        CallSid: 'CA123987456',
        CallStatus: 'completed',
        CallDuration: '45',
        From: '+15559876543',
        To: '+15551234321',
      }

      const { req } = createMocks({
        method: 'POST',
        body: completionPayload,
      })

      const { POST } = await import('@/app/api/voice/twilio/status/route')
      const response = await POST(req as any)

      expect(response.status).toBe(200)

      // Verify call completed
      const completedCall = await db.callLog.findUnique({
        where: { id: callLog.id },
      })

      expect(completedCall!.status).toBe('COMPLETED')
      expect(completedCall!.endedAt).toBeDefined()
      expect(completedCall!.duration).toBe(45)

      // Verify lead status updated
      const updatedLead = await db.lead.findUnique({
        where: { id: lead.id },
      })

      expect(updatedLead!.status).toBe('CONTACTED')
      expect(updatedLead!.lastContactedAt).toBeDefined()
    })
  })

  describe('Performance and Reliability', () => {
    it('should handle high-volume webhook processing', async () => {
      const webhooks = []

      // Create 100 concurrent webhook requests
      for (let i = 0; i < 100; i++) {
        const payload = {
          object: 'page',
          entry: [
            {
              id: `entry-${i}`,
              time: Date.now(),
              changes: [
                {
                  value: {
                    leadgen_id: `lead_${i}`,
                    form_id: '123',
                  },
                  field: 'leadgen',
                },
              ],
            },
          ],
        }

        global.fetch = jest.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            name: `Test User ${i}`,
            phone_number: `+155512${String(i).padStart(5, '0')}`,
          }),
        })

        const { req } = createMocks({
          method: 'POST',
          body: payload,
        })

        webhooks.push(
          import('@/app/api/leads/webhook/route').then((module) => module.POST(req as any))
        )
      }

      const startTime = Date.now()
      const results = await Promise.all(webhooks)
      const endTime = Date.now()

      // All webhooks should succeed
      results.forEach((response) => {
        expect(response.status).toBe(200)
      })

      // Should process 100 webhooks quickly
      expect(endTime - startTime).toBeLessThan(5000) // 5 seconds

      // Wait for queue processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Verify calls were initiated
      expect(mockTwilioClient.initiateCall).toHaveBeenCalledTimes(100)
    })

    it('should handle queue failures gracefully', async () => {
      // Mock queue failure
      const originalProcess = leadProcessor.processLead
      leadProcessor.processLead = jest.fn().mockRejectedValue(new Error('Queue failure'))

      const payload = {
        object: 'page',
        entry: [
          {
            id: '123',
            changes: [
              {
                value: { leadgen_id: 'failed_lead' },
                field: 'leadgen',
              },
            ],
          },
        ],
      }

      const { req } = createMocks({
        method: 'POST',
        body: payload,
      })

      const { POST } = await import('@/app/api/leads/webhook/route')
      const response = await POST(req as any)

      // Webhook should still succeed
      expect(response.status).toBe(200)

      // Restore original function
      leadProcessor.processLead = originalProcess
    })

    it('should respect rate limits and retry logic', async () => {
      // Mock rate limit error from Twilio
      mockTwilioClient.initiateCall
        .mockRejectedValueOnce(new Error('Rate limit exceeded'))
        .mockResolvedValueOnce({
          success: true,
          callSid: 'CA123',
          status: 'queued',
        })

      const payload = {
        object: 'page',
        entry: [
          {
            id: '123',
            changes: [
              {
                value: {
                  leadgen_id: 'rate_limit_lead',
                  form_id: '123',
                },
                field: 'leadgen',
              },
            ],
          },
        ],
      }

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          name: 'Rate Limit Test',
          phone_number: '+15558889999',
        }),
      })

      const { req } = createMocks({
        method: 'POST',
        body: payload,
      })

      const { POST } = await import('@/app/api/leads/webhook/route')
      const response = await POST(req as any)

      expect(response.status).toBe(200)

      // Wait for retry processing
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Should have been retried and succeeded
      expect(mockTwilioClient.initiateCall).toHaveBeenCalledTimes(2)
    })
  })

  describe('Data Validation and Security', () => {
    it('should validate webhook signatures', async () => {
      const payload = {
        object: 'page',
        entry: [],
      }

      const { req } = createMocks({
        method: 'POST',
        body: payload,
        headers: {
          'x-hub-signature-256': 'sha256=invalid_signature',
        },
      })

      const { POST } = await import('@/app/api/leads/webhook/route')
      const response = await POST(req as any)

      expect(response.status).toBe(401)
    })

    it('should sanitize input data', async () => {
      const maliciousPayload = {
        object: 'page',
        entry: [
          {
            id: '<script>alert("xss")</script>',
            changes: [
              {
                value: {
                  leadgen_id: 'safe_lead',
                  form_id: '123',
                },
                field: 'leadgen',
              },
            ],
          },
        ],
      }

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          name: '<script>alert("xss")</script>',
          phone_number: '+15557777777',
        }),
      })

      const { req } = createMocks({
        method: 'POST',
        body: maliciousPayload,
      })

      const { POST } = await import('@/app/api/leads/webhook/route')
      const response = await POST(req as any)

      expect(response.status).toBe(200)

      await new Promise((resolve) => setTimeout(resolve, 500))

      const lead = await db.lead.findFirst({
        where: { phone: '+15557777777' },
      })

      // Data should be sanitized
      expect(lead!.name).not.toContain('<script>')
      expect(lead!.name).toBe('alert("xss")')
    })

    it('should handle invalid phone numbers', async () => {
      const payload = {
        object: 'page',
        entry: [
          {
            id: '123',
            changes: [
              {
                value: {
                  leadgen_id: 'invalid_phone_lead',
                  form_id: '123',
                },
                field: 'leadgen',
              },
            ],
          },
        ],
      }

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          name: 'Invalid Phone User',
          phone_number: 'invalid-phone-number',
        }),
      })

      const { req } = createMocks({
        method: 'POST',
        body: payload,
      })

      const { POST } = await import('@/app/api/leads/webhook/route')
      const response = await POST(req as any)

      expect(response.status).toBe(200)

      await new Promise((resolve) => setTimeout(resolve, 500))

      // Lead should be created but marked as invalid
      const lead = await db.lead.findFirst({
        where: { name: 'Invalid Phone User' },
      })

      expect(lead).toBeDefined()
      expect(lead!.status).toBe('INVALID')

      // No call should be initiated
      expect(mockTwilioClient.initiateCall).not.toHaveBeenCalled()
    })
  })
})
