/**
 * CoreFlow360 - AI Conversation Engine with Chain of Thought
 * Advanced AI conversation handler for voice calls with industry expertise
 */

import { WebSocket } from 'ws'
import OpenAI from 'openai'
import { db } from '@/lib/db'
import { scriptManager } from '@/lib/voice/industry-scripts'
import { appointmentBooker } from '@/lib/integrations/calendar-booking'
import { VoiceResponse } from 'twilio/lib/twiml/VoiceResponse'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

// Conversation state types
export enum ConversationState {
  GREETING = 'greeting',
  QUALIFICATION = 'qualification',
  OBJECTION_HANDLING = 'objection_handling',
  INFORMATION_GATHERING = 'information_gathering',
  APPOINTMENT_BOOKING = 'appointment_booking',
  CLOSING = 'closing',
  HUMAN_HANDOFF = 'human_handoff',
  COMPLETED = 'completed',
}

export enum ConversationConfidence {
  VERY_HIGH = 0.9,
  HIGH = 0.7,
  MEDIUM = 0.5,
  LOW = 0.3,
  VERY_LOW = 0.1,
}

interface ConversationContext {
  callSid: string
  leadId: string
  tenantId: string
  industry: string
  scriptId: string
  leadData: {
    name: string
    phone: string
    serviceType?: string
    urgency?: string
    customFields?: Record<string, unknown>
  }
  conversationState: ConversationState
  qualificationScore: number
  confidence: number
  transcript: string[]
  extractedInfo: Record<string, unknown>
  attempts: Record<string, number>
  startedAt: Date
  lastActivity: Date
}

interface AIResponse {
  text: string
  confidence: number
  nextState: ConversationState
  qualificationUpdate?: number
  extractedData?: Record<string, unknown>
  shouldHandoffToHuman?: boolean
  appointmentReady?: boolean
  chainOfThought: ChainOfThoughtStep[]
}

interface ChainOfThoughtStep {
  step: string
  reasoning: string
  confidence: number
  decision: string
}

/**
 * Advanced AI Conversation Engine with Chain of Thought reasoning
 */
export class AIConversationEngine {
  private context: ConversationContext
  private websocket: WebSocket | null = null
  private audioBuffer: Buffer[] = []
  private isProcessing: boolean = false

  constructor(context: ConversationContext) {
    this.context = context
  }

  /**
   * Initialize conversation with Twilio WebSocket
   */
  async initializeConversation(websocket: WebSocket): Promise<void> {
    this.websocket = websocket

    

    // Set up WebSocket handlers
    websocket.on('message', async (data) => {
      await this.handleIncomingAudio(data)
    })

    websocket.on('close', () => {
      
      this.finalizeConversation()
    })

    // Send initial greeting
    await this.sendInitialGreeting()
  }

  /**
   * Handle incoming audio from Twilio
   */
  private async handleIncomingAudio(data: unknown): Promise<void> {
    try {
      const message = JSON.parse(data.toString())

      if (message.event === 'media' && message.media.payload) {
        // Accumulate audio data
        this.audioBuffer.push(Buffer.from(message.media.payload, 'base64'))

        // Process when we have enough audio (every 2 seconds)
        if (this.audioBuffer.length >= 32 && !this.isProcessing) {
          // ~2 seconds at 16kHz
          await this.processAudioBuffer()
        }
      } else if (message.event === 'start') {
        
      }
    } catch (error) {
      
    }
  }

  /**
   * Process accumulated audio buffer
   */
  private async processAudioBuffer(): Promise<void> {
    if (this.isProcessing) return

    this.isProcessing = true

    try {
      // Combine audio buffers
      const combinedAudio = Buffer.concat(this.audioBuffer)
      this.audioBuffer = []

      // Transcribe with OpenAI Whisper
      const transcription = await this.transcribeAudio(combinedAudio)

      if (transcription && transcription.trim().length > 0) {
        

        // Add to transcript
        this.context.transcript.push(`Customer: ${transcription}`)
        this.context.lastActivity = new Date()

        // Generate AI response using Chain of Thought
        const aiResponse = await this.generateChainOfThoughtResponse(transcription)

        // Update conversation context
        this.updateConversationContext(aiResponse)

        // Send AI response back to customer
        await this.sendAIResponse(aiResponse)

        // Store conversation update
        await this.saveConversationState()
      }
    } catch (error) {
      

      // Send fallback response on error
      await this.sendFallbackResponse()
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Transcribe audio using OpenAI Whisper
   */
  private async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    try {
      // Convert to proper audio format for Whisper
      const audioFile = new File([audioBuffer], 'audio.wav', {
        type: 'audio/wav',
      })

      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: 'en',
        prompt:
          'This is a business phone call about services. The customer may discuss HVAC, auto repair, insurance, or other professional services.',
      })

      return transcription.text
    } catch (error) {
      
      return ''
    }
  }

  /**
   * Generate AI response using Chain of Thought reasoning
   */
  private async generateChainOfThoughtResponse(customerInput: string): Promise<AIResponse> {
    try {
      // Get industry script for context
      const script = await scriptManager.getScript(this.context.scriptId)

      // Build Chain of Thought prompt
      const chainOfThoughtPrompt = this.buildChainOfThoughtPrompt(customerInput, script)

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: chainOfThoughtPrompt.systemPrompt,
          },
          {
            role: 'user',
            content: chainOfThoughtPrompt.userPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      })

      const response = JSON.parse(completion.choices[0].message.content || '{}')

      return {
        text: response.response || 'I understand. Let me help you with that.',
        confidence: response.confidence || 0.5,
        nextState: this.parseNextState(response.next_state),
        qualificationUpdate: response.qualification_score,
        extractedData: response.extracted_data || {},
        shouldHandoffToHuman: response.handoff_to_human || false,
        appointmentReady: response.appointment_ready || false,
        chainOfThought: response.chain_of_thought || [],
      }
    } catch (error) {
      

      // Return fallback response
      return {
        text: 'I apologize, could you please repeat that? I want to make sure I understand your needs correctly.',
        confidence: 0.3,
        nextState: this.context.conversationState,
        chainOfThought: [
          {
            step: 'error_fallback',
            reasoning: 'AI processing failed, using safe fallback response',
            confidence: 0.3,
            decision: 'Request clarification',
          },
        ],
      }
    }
  }

  /**
   * Build comprehensive Chain of Thought prompt
   */
  private buildChainOfThoughtPrompt(
    customerInput: string,
    script: unknown
  ): {
    systemPrompt: string
    userPrompt: string
  } {
    const systemPrompt = `
You are an expert ${this.context.industry} sales representative with deep industry knowledge. 
You are currently in a phone conversation with a potential customer.

INDUSTRY EXPERTISE:
${this.getIndustryExpertise()}

CURRENT CONTEXT:
- Customer: ${this.context.leadData.name}
- Service Type: ${this.context.leadData.serviceType || 'General inquiry'}
- Urgency: ${this.context.leadData.urgency || 'Unknown'}
- Current State: ${this.context.conversationState}
- Current Qualification Score: ${this.context.qualificationScore}/10
- Conversation History: ${this.context.transcript.slice(-5).join('; ')}

CONVERSATION GOALS:
1. Qualify the lead (score 1-10 based on need, budget, authority, timeline)
2. Gather necessary information for service
3. Build rapport and trust
4. Address objections professionally
5. Schedule appointment if qualified
6. Handoff to human if confidence < 0.5

RESPONSE FORMAT:
You must respond with valid JSON containing:
{
  "chain_of_thought": [
    {
      "step": "analyze_customer_input",
      "reasoning": "What did the customer communicate?",
      "confidence": 0.8,
      "decision": "Next action to take"
    },
    {
      "step": "assess_qualification",
      "reasoning": "How qualified is this lead?",
      "confidence": 0.7,
      "decision": "Qualification score update"
    },
    {
      "step": "determine_response",
      "reasoning": "Best response strategy",
      "confidence": 0.9,
      "decision": "Response content"
    }
  ],
  "response": "Your natural, conversational response",
  "confidence": 0.8,
  "next_state": "qualification|objection_handling|appointment_booking|etc",
  "qualification_score": 7,
  "extracted_data": {
    "budget": "$500-1000",
    "timeline": "this week",
    "decision_maker": true
  },
  "handoff_to_human": false,
  "appointment_ready": false
}
`

    const userPrompt = `
CUSTOMER INPUT: "${customerInput}"

Use Chain of Thought reasoning to:
1. ANALYZE what the customer just said
2. ASSESS their qualification level  
3. DETERMINE the best response strategy
4. CRAFT a natural, helpful response

Consider:
- Are they expressing interest, concern, or objection?
- Do they have budget/authority/need/timeline (BANT)?
- What information do we still need?
- Should we schedule appointment or gather more info?
- Is confidence high enough to continue or handoff to human?

Respond with the JSON format specified above.
`

    return { systemPrompt, userPrompt }
  }

  /**
   * Get industry-specific expertise content
   */
  private getIndustryExpertise(): string {
    const expertise = {
      HVAC: `
HVAC EXPERTISE:
- Emergency repairs: heating failures, AC breakdowns, no heat/cooling
- Maintenance: filter changes, tune-ups, seasonal prep
- Replacements: full system replacements, upgrades to high-efficiency
- Common issues: refrigerant leaks, compressor problems, ductwork issues
- Typical costs: Service calls $150-300, repairs $200-800, replacements $3K-8K
- Urgency indicators: "no heat/cooling", "stopped working", "strange noises"
- Qualification factors: homeowner vs renter, system age, previous repairs
`,
      'Auto Repair': `
AUTO REPAIR EXPERTISE:  
- Insurance claims: collision repair, comprehensive coverage
- Common repairs: bodywork, mechanical, electrical
- Process: estimate → approval → repair → inspection
- Typical costs: Minor damage $500-2K, major collision $3K-15K
- Timeline: Simple repairs 2-5 days, complex 1-2 weeks
- Key info needed: claim number, insurance company, vehicle details
- Qualification: insurance approval, deductible amount, preferred shop
`,
      Insurance: `
INSURANCE EXPERTISE:
- Claim types: auto, home, business, liability
- Process: report → investigate → estimate → approve → pay
- Documentation needed: photos, police reports, receipts
- Common issues: coverage questions, claim status, disputes
- Timeline: Simple claims 5-10 days, complex claims 30+ days
- Key factors: policy coverage, deductibles, previous claims
`,
    }

    return (
      expertise[this.context.industry] ||
      `
GENERAL BUSINESS EXPERTISE:
- Understand customer needs and pain points
- Qualify based on budget, authority, need, timeline (BANT)
- Build trust through active listening and expertise
- Handle objections with empathy and solutions
- Focus on value proposition and ROI
`
    )
  }

  /**
   * Parse next conversation state
   */
  private parseNextState(stateString: string): ConversationState {
    const stateMap: Record<string, ConversationState> = {
      greeting: ConversationState.GREETING,
      qualification: ConversationState.QUALIFICATION,
      objection_handling: ConversationState.OBJECTION_HANDLING,
      information_gathering: ConversationState.INFORMATION_GATHERING,
      appointment_booking: ConversationState.APPOINTMENT_BOOKING,
      closing: ConversationState.CLOSING,
      human_handoff: ConversationState.HUMAN_HANDOFF,
      completed: ConversationState.COMPLETED,
    }

    return stateMap[stateString] || this.context.conversationState
  }

  /**
   * Update conversation context based on AI response
   */
  private updateConversationContext(aiResponse: AIResponse): void {
    // Update state
    this.context.conversationState = aiResponse.nextState

    // Update qualification score
    if (aiResponse.qualificationUpdate) {
      this.context.qualificationScore = Math.max(1, Math.min(10, aiResponse.qualificationUpdate))
    }

    // Update confidence
    this.context.confidence = aiResponse.confidence

    // Merge extracted data
    if (aiResponse.extractedData) {
      this.context.extractedInfo = {
        ...this.context.extractedInfo,
        ...aiResponse.extractedData,
      }
    }

    // Add AI response to transcript
    this.context.transcript.push(`AI: ${aiResponse.text}`)

    // Log Chain of Thought for debugging
    if (aiResponse.chainOfThought.length > 0) {
      
      aiResponse.chainOfThought.forEach((step, index) => {
        console.log(
          `  ${index + 1}. ${step.step}: ${step.reasoning} -> ${step.decision} (${step.confidence})`
        )
      })
    }
  }

  /**
   * Send AI response back to customer via Twilio
   */
  private async sendAIResponse(aiResponse: AIResponse): Promise<void> {
    try {
      // Check if we should handoff to human
      if (
        aiResponse.shouldHandoffToHuman ||
        aiResponse.confidence < ConversationConfidence.MEDIUM
      ) {
        await this.handleHumanHandoff()
        return
      }

      // Check if ready for appointment booking
      if (aiResponse.appointmentReady && this.context.qualificationScore >= 7) {
        await this.handleAppointmentBooking()
        return
      }

      // Generate speech from text
      const audioResponse = await this.generateSpeech(aiResponse.text)

      // Send audio back to Twilio
      if (this.websocket && audioResponse) {
        const audioBase64 = audioResponse.toString('base64')

        this.websocket.send(
          JSON.stringify({
            event: 'media',
            streamSid: this.context.callSid,
            media: {
              payload: audioBase64,
            },
          })
        )
      }
    } catch (error) {
      
      await this.sendFallbackResponse()
    }
  }

  /**
   * Generate speech from text using OpenAI TTS
   */
  private async generateSpeech(text: string): Promise<Buffer> {
    try {
      const response = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'alloy', // Professional female voice
        input: text,
        response_format: 'wav',
      })

      const buffer = Buffer.from(await response.arrayBuffer())
      return buffer
    } catch (error) {
      
      throw error
    }
  }

  /**
   * Send initial greeting to start conversation
   */
  private async sendInitialGreeting(): Promise<void> {
    try {
      const script = await scriptManager.getScript(this.context.scriptId)
      const greeting = script.openingMessage.replace(
        '{customerName}',
        this.context.leadData.name.split(' ')[0] // First name only
      )

      // Add to transcript
      this.context.transcript.push(`AI: ${greeting}`)

      // Generate and send speech
      const audioResponse = await this.generateSpeech(greeting)

      if (this.websocket && audioResponse) {
        const audioBase64 = audioResponse.toString('base64')

        this.websocket.send(
          JSON.stringify({
            event: 'media',
            streamSid: this.context.callSid,
            media: {
              payload: audioBase64,
            },
          })
        )
      }
    } catch (error) {
      
    }
  }

  /**
   * Handle human handoff
   */
  private async handleHumanHandoff(): Promise<void> {
    

    // Update state
    this.context.conversationState = ConversationState.HUMAN_HANDOFF

    // Send handoff message
    const handoffMessage =
      'Let me connect you with one of our specialists who can better assist you. Please hold for just a moment.'

    await this.generateSpeech(handoffMessage).then((audio) => {
      if (this.websocket) {
        this.websocket.send(
          JSON.stringify({
            event: 'media',
            streamSid: this.context.callSid,
            media: {
              payload: audio.toString('base64'),
            },
          })
        )
      }
    })

    // TODO: Implement actual human handoff logic
    // This would integrate with your call center system

    await this.saveConversationState()
  }

  /**
   * Handle appointment booking
   */
  private async handleAppointmentBooking(): Promise<void> {
    

    try {
      // Extract available times from customer preferences
      const preferredTime = this.context.extractedInfo.preferredTime || 'morning'
      const urgency = this.context.leadData.urgency || 'medium'

      // Book appointment using integrated calendar system
      const appointment = await appointmentBooker.findAvailableSlot({
        serviceType: this.context.leadData.serviceType,
        urgency: urgency,
        preferredTime: preferredTime,
        customerInfo: this.context.leadData,
      })

      if (appointment) {
        const confirmationMessage = `Perfect! I've scheduled your ${this.context.ledData.serviceType} appointment for ${appointment.date} at ${appointment.time}. You'll receive a confirmation email shortly. Is there anything else I can help you with?`

        await this.generateSpeech(confirmationMessage).then((audio) => {
          if (this.websocket) {
            this.websocket.send(
              JSON.stringify({
                event: 'media',
                streamSid: this.context.callSid,
                media: {
                  payload: audio.toString('base64'),
                },
              })
            )
          }
        })

        // Update context
        this.context.conversationState = ConversationState.CLOSING
        this.context.extractedInfo.appointmentScheduled = true
        this.context.extractedInfo.appointmentDetails = appointment
      } else {
        const unavailableMessage =
          "I apologize, but I don't have any available slots that match your preferences right now. Let me connect you with our scheduling team to find the best time for you."

        await this.generateSpeech(unavailableMessage).then((audio) => {
          if (this.websocket) {
            this.websocket.send(
              JSON.stringify({
                event: 'media',
                streamSid: this.context.callSid,
                media: {
                  payload: audio.toString('base64'),
                },
              })
            )
          }
        })

        await this.handleHumanHandoff()
      }
    } catch (error) {
      

      const errorMessage =
        "I'm having trouble accessing our scheduling system right now. Let me connect you with someone who can help schedule your appointment directly."

      await this.generateSpeech(errorMessage).then((audio) => {
        if (this.websocket) {
          this.websocket.send(
            JSON.stringify({
              event: 'media',
              streamSid: this.context.callSid,
              media: {
                payload: audio.toString('base64'),
              },
            })
          )
        }
      })

      await this.handleHumanHandoff()
    }
  }

  /**
   * Send fallback response when AI fails
   */
  private async sendFallbackResponse(): Promise<void> {
    const fallbackMessage =
      "I apologize, I didn't catch that clearly. Could you please repeat what you just said?"

    try {
      const audio = await this.generateSpeech(fallbackMessage)

      if (this.websocket) {
        this.websocket.send(
          JSON.stringify({
            event: 'media',
            streamSid: this.context.callSid,
            media: {
              payload: audio.toString('base64'),
            },
          })
        )
      }
    } catch (error) {
      
    }
  }

  /**
   * Save current conversation state to database
   */
  private async saveConversationState(): Promise<void> {
    try {
      await db.callLog.update({
        where: { twilioCallSid: this.context.callSid },
        data: {
          qualificationScore: this.context.qualificationScore,
          transcript: this.context.transcript.join('\n'),
          outcome: this.determineCallOutcome(),
          metadata: {
            conversationState: this.context.conversationState,
            confidence: this.context.confidence,
            extractedInfo: this.context.extractedInfo,
            lastActivity: this.context.lastActivity,
          },
        },
      })
    } catch (error) {
      
    }
  }

  /**
   * Determine call outcome based on current state
   */
  private determineCallOutcome(): string {
    if (this.context.qualificationScore >= 8) {
      return this.context.extractedInfo.appointmentScheduled ? 'APPOINTMENT' : 'QUALIFIED'
    } else if (this.context.qualificationScore >= 5) {
      return 'CALLBACK'
    } else if (this.context.conversationState === ConversationState.HUMAN_HANDOFF) {
      return 'CALLBACK'
    } else {
      return 'NOT_QUALIFIED'
    }
  }

  /**
   * Finalize conversation and cleanup
   */
  private async finalizeConversation(): Promise<void> {
    try {
      // Final state update
      this.context.conversationState = ConversationState.COMPLETED
      await this.saveConversationState()

      // Close websocket if still open
      if (this.websocket) {
        this.websocket.close()
        this.websocket = null
      }

      
      
      }`)
    } catch (error) {
      
    }
  }
}

/**
 * Factory function to create conversation engine
 */
export async function createConversationEngine(
  callSid: string,
  leadData: unknown,
  scriptId: string
): Promise<AIConversationEngine> {
  const context: ConversationContext = {
    callSid,
    leadId: leadData.id,
    tenantId: leadData.tenantId,
    industry: leadData.industry || 'General',
    scriptId,
    leadData,
    conversationState: ConversationState.GREETING,
    qualificationScore: 5, // Start neutral
    confidence: 0.8,
    transcript: [],
    extractedInfo: {},
    attempts: {},
    startedAt: new Date(),
    lastActivity: new Date(),
  }

  return new AIConversationEngine(context)
}
