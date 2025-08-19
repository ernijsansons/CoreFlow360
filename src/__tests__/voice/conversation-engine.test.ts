/**
 * CoreFlow360 - AI Conversation Engine Unit Tests
 * Test coverage for Chain of Thought reasoning and conversation flow
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { AIConversationEngine } from '@/lib/ai/conversation-engine'
import { ConversationState, ConversationContext } from '@/lib/ai/conversation-engine'
import { industryScripts } from '@/lib/voice/industry-scripts'

// Mock dependencies
jest.mock('@/lib/voice/twilio-client')
jest.mock('@/lib/voice/openai-realtime')
jest.mock('@/lib/db')

describe('AIConversationEngine', () => {
  let conversationEngine: AIConversationEngine
  let mockContext: ConversationContext

  beforeEach(() => {
    jest.clearAllMocks()

    mockContext = {
      callSid: 'CA123456',
      leadId: 'lead-789',
      tenantId: 'tenant-456',
      industry: 'hvac',
      customerInfo: {
        name: 'John Doe',
        phone: '+11234567890',
        source: 'facebook_ad',
      },
      script: industryScripts.hvac,
    }

    conversationEngine = new AIConversationEngine(mockContext)
  })

  describe('State Management', () => {
    it('should initialize with greeting state', () => {
      expect(conversationEngine.getCurrentState()).toBe(ConversationState.GREETING)
      expect(conversationEngine.getConversationHistory()).toHaveLength(0)
    })

    it('should transition states correctly', async () => {
      // Start conversation
      await conversationEngine.startConversation()
      expect(conversationEngine.getCurrentState()).toBe(ConversationState.INTRODUCTION)

      // Process customer response
      await conversationEngine.processCustomerInput('Yes, I need help with my AC')
      expect(conversationEngine.getCurrentState()).toBe(ConversationState.QUALIFICATION)
    })

    it('should maintain conversation history', async () => {
      await conversationEngine.startConversation()
      await conversationEngine.processCustomerInput('I need AC repair')

      const history = conversationEngine.getConversationHistory()
      expect(history).toHaveLength(2)
      expect(history[0].role).toBe('assistant')
      expect(history[1].role).toBe('customer')
      expect(history[1].content).toContain('AC repair')
    })
  })

  describe('Chain of Thought Reasoning', () => {
    it('should analyze customer intent correctly', async () => {
      const response = await conversationEngine.processCustomerInput(
        'My air conditioner is making weird noises and not cooling properly'
      )

      expect(response.intent).toBe('service_request')
      expect(response.confidence).toBeGreaterThan(0.8)
      expect(response.reasoning).toContain('AC issue')
      expect(response.suggestedActions).toContain('schedule_appointment')
    })

    it('should handle ambiguous input with clarification', async () => {
      const response = await conversationEngine.processCustomerInput('Maybe later')

      expect(response.needsClarification).toBe(true)
      expect(response.clarificationQuestion).toBeDefined()
      expect(response.confidence).toBeLessThan(0.5)
    })

    it('should detect urgency correctly', async () => {
      const urgentResponse = await conversationEngine.processCustomerInput(
        "My AC completely stopped working and it's 95 degrees!"
      )

      expect(urgentResponse.urgency).toBe('high')
      expect(urgentResponse.suggestedActions).toContain('emergency_service')
    })
  })

  describe('Qualification Scoring', () => {
    it('should score qualified leads appropriately', async () => {
      await conversationEngine.startConversation()

      // Simulate qualified lead responses
      await conversationEngine.processCustomerInput('Yes, I own the home')
      await conversationEngine.processCustomerInput('The AC is 8 years old')
      await conversationEngine.processCustomerInput('I want to schedule service this week')

      const score = conversationEngine.getQualificationScore()
      expect(score).toBeGreaterThanOrEqual(7)
      expect(score).toBeLessThanOrEqual(10)
    })

    it('should score unqualified leads appropriately', async () => {
      await conversationEngine.startConversation()

      // Simulate unqualified lead responses
      await conversationEngine.processCustomerInput("I'm just browsing")
      await conversationEngine.processCustomerInput('Not interested right now')

      const score = conversationEngine.getQualificationScore()
      expect(score).toBeLessThan(5)
    })

    it('should track qualification criteria', async () => {
      await conversationEngine.processCustomerInput('I own a 2000 sq ft home')
      await conversationEngine.processCustomerInput('My AC is 15 years old and needs replacement')

      const criteria = conversationEngine.getQualificationCriteria()
      expect(criteria.homeowner).toBe(true)
      expect(criteria.systemAge).toBe(15)
      expect(criteria.needsService).toBe(true)
      expect(criteria.budget).toBeUndefined() // Not discussed yet
    })
  })

  describe('Industry-Specific Knowledge', () => {
    it('should use HVAC expertise correctly', async () => {
      const response = await conversationEngine.processCustomerInput(
        "What's the difference between a heat pump and AC?"
      )

      expect(response.content).toContain('heat pump')
      expect(response.content).toContain('cooling and heating')
      expect(response.knowledgeUsed).toContain('hvac_systems')
    })

    it('should handle auto insurance inquiries', async () => {
      const autoContext = { ...mockContext, industry: 'auto_insurance' }
      const autoEngine = new AIConversationEngine(autoContext)

      const response = await autoEngine.processCustomerInput(
        'I just got in an accident, what should I do?'
      )

      expect(response.content).toContain('safety')
      expect(response.content).toContain('police report')
      expect(response.urgency).toBe('high')
    })
  })

  describe('Appointment Booking Integration', () => {
    it('should initiate appointment booking when appropriate', async () => {
      await conversationEngine.processCustomerInput('I need AC service')
      const response = await conversationEngine.processCustomerInput(
        "Yes, I'd like to schedule an appointment"
      )

      expect(response.action).toBe('book_appointment')
      expect(response.nextState).toBe(ConversationState.APPOINTMENT_BOOKING)
    })

    it('should collect appointment preferences', async () => {
      conversationEngine.setState(ConversationState.APPOINTMENT_BOOKING)

      const response = await conversationEngine.processCustomerInput(
        'Tuesday afternoon works best for me'
      )

      expect(response.appointmentPreferences).toEqual({
        dayOfWeek: 'Tuesday',
        timeOfDay: 'afternoon',
      })
    })

    it('should handle calendar conflicts gracefully', async () => {
      conversationEngine.setState(ConversationState.APPOINTMENT_BOOKING)

      // Mock calendar conflict
      const response = await conversationEngine.processCustomerInput('Monday morning')

      expect(response.content).toContain('not available')
      expect(response.alternativeSlots).toBeDefined()
      expect(response.alternativeSlots).toHaveLength(3)
    })
  })

  describe('Fallback to Human', () => {
    it('should fallback when confidence is too low', async () => {
      // Simulate confusing input
      const response = await conversationEngine.processCustomerInput('Xlkjdf qwerty asdf zxcv')

      expect(response.shouldTransferToHuman).toBe(true)
      expect(response.transferReason).toContain('low_confidence')
      expect(response.confidence).toBeLessThan(0.3)
    })

    it('should fallback on explicit request', async () => {
      const response = await conversationEngine.processCustomerInput(
        'I want to speak to a real person'
      )

      expect(response.shouldTransferToHuman).toBe(true)
      expect(response.transferReason).toBe('customer_request')
    })

    it('should fallback after too many clarifications', async () => {
      // Simulate multiple unclear responses
      for (let i = 0; i < 4; i++) {
        await conversationEngine.processCustomerInput("I don't know")
      }

      const response = await conversationEngine.processCustomerInput('Maybe')

      expect(response.shouldTransferToHuman).toBe(true)
      expect(response.transferReason).toContain('max_clarifications')
    })
  })

  describe('Performance and Latency', () => {
    it('should generate responses within 100ms', async () => {
      const startTime = Date.now()

      await conversationEngine.processCustomerInput('I need to schedule AC maintenance')

      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(100)
    })

    it('should handle rapid consecutive inputs', async () => {
      const inputs = [
        'Hello',
        'I need help',
        'My AC is broken',
        "It's making noise",
        'Can you help?',
      ]

      const startTime = Date.now()

      for (const input of inputs) {
        await conversationEngine.processCustomerInput(input)
      }

      const endTime = Date.now()
      const avgTime = (endTime - startTime) / inputs.length

      expect(avgTime).toBeLessThan(50) // Average 50ms per response
    })
  })

  describe('Error Handling', () => {
    it('should handle null/empty input gracefully', async () => {
      const response = await conversationEngine.processCustomerInput('')

      expect(response.content).toContain("didn't catch that")
      expect(response.error).toBeUndefined()
    })

    it('should handle extremely long input', async () => {
      const longInput = 'a'.repeat(10000)
      const response = await conversationEngine.processCustomerInput(longInput)

      expect(response.content).toBeDefined()
      expect(response.warning).toContain('input_truncated')
    })

    it('should recover from processing errors', async () => {
      // Mock an internal error
      jest
        .spyOn(conversationEngine as any, 'generateChainOfThoughtResponse')
        .mockRejectedValueOnce(new Error('Processing error'))

      const response = await conversationEngine.processCustomerInput('Test input')

      expect(response.content).toContain('trouble understanding')
      expect(response.error).toBeUndefined() // Error handled internally
    })
  })

  describe('Conversation Metrics', () => {
    it('should track conversation duration', async () => {
      await conversationEngine.startConversation()

      // Simulate conversation
      await new Promise((resolve) => setTimeout(resolve, 100))
      await conversationEngine.processCustomerInput('Test')

      const metrics = conversationEngine.getConversationMetrics()
      expect(metrics.duration).toBeGreaterThan(100)
      expect(metrics.turnCount).toBe(2)
    })

    it('should calculate average response time', async () => {
      await conversationEngine.startConversation()

      for (let i = 0; i < 5; i++) {
        await conversationEngine.processCustomerInput(`Question ${i}`)
      }

      const metrics = conversationEngine.getConversationMetrics()
      expect(metrics.avgResponseTime).toBeLessThan(100)
      expect(metrics.avgConfidence).toBeGreaterThan(0.5)
    })

    it('should track customer sentiment', async () => {
      await conversationEngine.processCustomerInput('This is terrible service!')
      await conversationEngine.processCustomerInput("I'm very frustrated")

      const metrics = conversationEngine.getConversationMetrics()
      expect(metrics.customerSentiment).toBeLessThan(0) // Negative
      expect(metrics.sentimentTrend).toBe('declining')
    })
  })
})
