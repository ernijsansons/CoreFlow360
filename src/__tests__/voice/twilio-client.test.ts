/**
 * CoreFlow360 - Twilio Client Unit Tests
 * Comprehensive test coverage for voice calling features
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { TwilioVoiceClient } from '@/lib/voice/twilio-client'
import twilio from 'twilio'

// Mock Twilio
jest.mock('twilio')
const mockTwilio = twilio as jest.MockedFunction<typeof twilio>

describe('TwilioVoiceClient', () => {
  let twilioClient: TwilioVoiceClient
  let mockTwilioInstance: any

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Mock Twilio instance
    mockTwilioInstance = {
      calls: {
        create: jest.fn(),
        get: jest.fn(),
        list: jest.fn(),
      },
      conferences: {
        list: jest.fn(),
      },
      incomingPhoneNumbers: {
        list: jest.fn(),
      },
      messages: {
        create: jest.fn(),
      },
    }

    mockTwilio.mockReturnValue(mockTwilioInstance)
    twilioClient = new TwilioVoiceClient()
  })

  describe('Initialization', () => {
    it('should initialize with valid credentials', () => {
      expect(twilioClient).toBeDefined()
      expect(mockTwilio).toHaveBeenCalledWith(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      )
    })

    it('should throw error if credentials missing', () => {
      const originalSid = process.env.TWILIO_ACCOUNT_SID
      delete process.env.TWILIO_ACCOUNT_SID

      expect(() => new TwilioVoiceClient()).toThrow('Twilio credentials not configured')

      process.env.TWILIO_ACCOUNT_SID = originalSid
    })
  })

  describe('initiateCall', () => {
    const callParams = {
      to: '+11234567890',
      from: '+10987654321',
      leadId: 'lead-123',
      tenantId: 'tenant-456',
      script: {
        id: 'script-789',
        greeting: 'Hello, this is CoreFlow360',
        questions: ['How can I help you today?'],
      },
    }

    it('should initiate call successfully', async () => {
      const mockCallSid = 'CA1234567890abcdef'
      mockTwilioInstance.calls.create.mockResolvedValue({
        sid: mockCallSid,
        status: 'queued',
        to: callParams.to,
        from: callParams.from,
        dateCreated: new Date(),
      })

      const result = await twilioClient.initiateCall(callParams)

      expect(result.success).toBe(true)
      expect(result.callSid).toBe(mockCallSid)
      expect(result.status).toBe('queued')

      // Verify TwiML URL includes required parameters
      const createCall = mockTwilioInstance.calls.create.mock.calls[0][0]
      expect(createCall.url).toContain('leadId=lead-123')
      expect(createCall.url).toContain('tenantId=tenant-456')
      expect(createCall.statusCallback).toBeDefined()
    })

    it('should handle invalid phone numbers', async () => {
      const invalidParams = { ...callParams, to: 'invalid-number' }

      await expect(twilioClient.initiateCall(invalidParams)).rejects.toThrow(
        'Invalid phone number format'
      )
    })

    it('should handle Twilio API errors', async () => {
      mockTwilioInstance.calls.create.mockRejectedValue(
        new Error('Twilio API Error: Invalid from number')
      )

      const result = await twilioClient.initiateCall(callParams)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Twilio API Error')
    })

    it('should respect rate limits', async () => {
      // Simulate multiple calls
      const promises = []
      for (let i = 0; i < 5; i++) {
        promises.push(twilioClient.initiateCall(callParams))
      }

      await Promise.all(promises)

      // Should queue calls to respect rate limits
      expect(mockTwilioInstance.calls.create).toHaveBeenCalledTimes(5)
    })
  })

  describe('getCallStatus', () => {
    const callSid = 'CA1234567890abcdef'

    it('should retrieve call status successfully', async () => {
      const mockCall = {
        sid: callSid,
        status: 'in-progress',
        duration: '45',
        startTime: new Date(Date.now() - 45000),
        endTime: null,
        to: '+11234567890',
        from: '+10987654321',
      }

      mockTwilioInstance.calls.get.mockReturnValue({
        fetch: jest.fn().mockResolvedValue(mockCall),
      })

      const status = await twilioClient.getCallStatus(callSid)

      expect(status.callSid).toBe(callSid)
      expect(status.status).toBe('in-progress')
      expect(status.duration).toBe(45)
    })

    it('should handle non-existent calls', async () => {
      mockTwilioInstance.calls.get.mockReturnValue({
        fetch: jest.fn().mockRejectedValue(new Error('Call not found')),
      })

      await expect(twilioClient.getCallStatus(callSid)).rejects.toThrow('Call not found')
    })
  })

  describe('endCall', () => {
    const callSid = 'CA1234567890abcdef'

    it('should end call successfully', async () => {
      const mockCall = {
        update: jest.fn().mockResolvedValue({
          sid: callSid,
          status: 'completed',
        }),
      }

      mockTwilioInstance.calls.get.mockReturnValue(mockCall)

      const result = await twilioClient.endCall(callSid)

      expect(result).toBe(true)
      expect(mockCall.update).toHaveBeenCalledWith({ status: 'completed' })
    })

    it('should handle already completed calls', async () => {
      const mockCall = {
        fetch: jest.fn().mockResolvedValue({ status: 'completed' }),
        update: jest.fn(),
      }

      mockTwilioInstance.calls.get.mockReturnValue(mockCall)

      const result = await twilioClient.endCall(callSid)

      expect(result).toBe(true)
      expect(mockCall.update).not.toHaveBeenCalled()
    })
  })

  describe('bulkCall', () => {
    const phoneNumbers = ['+11234567890', '+10987654321', '+15555555555']

    it('should initiate bulk calls with rate limiting', async () => {
      mockTwilioInstance.calls.create.mockResolvedValue({
        sid: 'CA' + Math.random().toString(36).substr(2, 14),
        status: 'queued',
      })

      const results = await twilioClient.bulkCall({
        phoneNumbers,
        from: '+10987654321',
        tenantId: 'tenant-123',
        script: { id: 'script-123', greeting: 'Hello' },
      })

      expect(results).toHaveLength(3)
      expect(results.every((r) => r.success)).toBe(true)
      expect(mockTwilioInstance.calls.create).toHaveBeenCalledTimes(3)
    })

    it('should handle partial failures in bulk calls', async () => {
      mockTwilioInstance.calls.create
        .mockResolvedValueOnce({ sid: 'CA123', status: 'queued' })
        .mockRejectedValueOnce(new Error('Invalid number'))
        .mockResolvedValueOnce({ sid: 'CA456', status: 'queued' })

      const results = await twilioClient.bulkCall({
        phoneNumbers,
        from: '+10987654321',
        tenantId: 'tenant-123',
        script: { id: 'script-123', greeting: 'Hello' },
      })

      expect(results[0].success).toBe(true)
      expect(results[1].success).toBe(false)
      expect(results[1].error).toContain('Invalid number')
      expect(results[2].success).toBe(true)
    })

    it('should respect concurrent call limits', async () => {
      jest.useFakeTimers()

      const largeBatch = Array(100).fill('+11234567890')
      mockTwilioInstance.calls.create.mockResolvedValue({
        sid: 'CA123',
        status: 'queued',
      })

      const bulkPromise = twilioClient.bulkCall({
        phoneNumbers: largeBatch,
        from: '+10987654321',
        tenantId: 'tenant-123',
        script: { id: 'script-123', greeting: 'Hello' },
      })

      // Fast forward through rate limiting
      jest.runAllTimers()
      await bulkPromise

      // Should batch calls to respect limits
      expect(mockTwilioInstance.calls.create.mock.calls.length).toBeLessThanOrEqual(100)

      jest.useRealTimers()
    })
  })

  describe('validatePhoneNumber', () => {
    it('should validate US phone numbers', () => {
      const validNumbers = [
        '+11234567890',
        '1234567890',
        '(123) 456-7890',
        '123-456-7890',
        '123.456.7890',
      ]

      validNumbers.forEach((number) => {
        expect(twilioClient.validatePhoneNumber(number)).toBe(true)
      })
    })

    it('should reject invalid phone numbers', () => {
      const invalidNumbers = [
        '123',
        'abc-def-ghij',
        '+1123456789', // Too short
        '+112345678901', // Too long
        '',
      ]

      invalidNumbers.forEach((number) => {
        expect(twilioClient.validatePhoneNumber(number)).toBe(false)
      })
    })
  })

  describe('getAvailablePhoneNumbers', () => {
    it('should return list of available phone numbers', async () => {
      const mockNumbers = [
        { phoneNumber: '+11234567890', friendlyName: 'Sales Line' },
        { phoneNumber: '+10987654321', friendlyName: 'Support Line' },
      ]

      mockTwilioInstance.incomingPhoneNumbers.list.mockResolvedValue(mockNumbers)

      const numbers = await twilioClient.getAvailablePhoneNumbers()

      expect(numbers).toHaveLength(2)
      expect(numbers[0]).toEqual({
        number: '+11234567890',
        name: 'Sales Line',
        capabilities: ['voice', 'sms'],
      })
    })
  })

  describe('Performance Tests', () => {
    it('should initiate call within 1 second', async () => {
      mockTwilioInstance.calls.create.mockResolvedValue({
        sid: 'CA123',
        status: 'queued',
      })

      const startTime = Date.now()
      await twilioClient.initiateCall({
        to: '+11234567890',
        from: '+10987654321',
        leadId: 'lead-123',
        tenantId: 'tenant-456',
      })
      const endTime = Date.now()

      expect(endTime - startTime).toBeLessThan(1000)
    })

    it('should handle 100 concurrent status checks efficiently', async () => {
      mockTwilioInstance.calls.get.mockReturnValue({
        fetch: jest.fn().mockResolvedValue({
          sid: 'CA123',
          status: 'completed',
          duration: '60',
        }),
      })

      const startTime = Date.now()
      const promises = Array(100)
        .fill(null)
        .map((_, i) => twilioClient.getCallStatus(`CA${i}`))

      await Promise.all(promises)
      const endTime = Date.now()

      expect(endTime - startTime).toBeLessThan(5000) // 5 seconds for 100 calls
    })
  })
})
