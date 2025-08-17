/**
 * CoreFlow360 - Twilio Voice Client
 * Elite-level telephony integration for outbound calls
 */

import twilio from 'twilio'
import { VoiceResponse } from 'twilio/lib/twiml/VoiceResponse'
import { CallInstance } from 'twilio/lib/rest/api/v2010/account/call'
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js'

// Alias for compatibility
const validatePhoneNumber = isValidPhoneNumber

interface TwilioConfig {
  accountSid: string
  authToken: string
  phoneNumber: string
  webhookUrl: string
}

interface CallOptions {
  to: string
  from?: string
  url?: string
  method?: 'GET' | 'POST'
  fallbackUrl?: string
  timeout?: number
  record?: boolean
  machineDetection?: 'Enable' | 'DetectMessageEnd'
  asyncAmd?: boolean
  asyncAmdStatusCallback?: string
}

interface CallStatus {
  sid: string
  status: 'queued' | 'initiated' | 'ringing' | 'answered' | 'completed' | 'failed'
  duration?: number
  startTime?: Date
  endTime?: Date
  recording?: string
  cost?: number
}

export class TwilioVoiceClient {
  private client: twilio.Twilio
  private config: TwilioConfig
  
  constructor(config?: Partial<TwilioConfig>) {
    // Build-time detection
    const isBuildTime = process.env.VERCEL_ENV || process.env.CI || process.env.NEXT_PHASE === 'phase-production-build'
    
    this.config = {
      accountSid: process.env.TWILIO_ACCOUNT_SID || (isBuildTime ? 'build-placeholder' : ''),
      authToken: process.env.TWILIO_AUTH_TOKEN || (isBuildTime ? 'build-placeholder' : ''),
      phoneNumber: process.env.TWILIO_PHONE_NUMBER || (isBuildTime ? '+1234567890' : ''),
      webhookUrl: process.env.TWILIO_WEBHOOK_URL || (isBuildTime ? 'https://example.com' : ''),
      ...config
    }
    
    if (!isBuildTime && (!this.config.accountSid || !this.config.authToken)) {
      throw new Error('Twilio credentials not configured')
    }
    
    this.client = twilio(this.config.accountSid, this.config.authToken)
  }
  
  /**
   * Initiate outbound call with AI conversation
   */
  async initiateCall(options: CallOptions): Promise<CallInstance> {
    // Validate phone number
    if (!this.isValidPhoneNumber(options.to)) {
      throw new Error(`Invalid phone number: ${options.to}`)
    }
    
    const callOptions = {
      to: this.formatPhoneNumber(options.to),
      from: options.from || this.config.phoneNumber,
      url: options.url || `${this.config.webhookUrl}/answer`,
      method: options.method || 'POST' as const,
      fallbackUrl: options.fallbackUrl,
      timeout: options.timeout || 30,
      record: options.record !== false,
      machineDetection: options.machineDetection || 'Enable' as const,
      asyncAmd: options.asyncAmd || true,
      asyncAmdStatusCallback: options.asyncAmdStatusCallback || `${this.config.webhookUrl}/amd-status`,
      recordingStatusCallback: `${this.config.webhookUrl}/recording-status`,
      statusCallback: `${this.config.webhookUrl}/call-status`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      statusCallbackMethod: 'POST'
    }
    
    try {
      const call = await this.client.calls.create(callOptions)
      
      console.log(`📞 Call initiated: ${call.sid} to ${options.to}`)
      
      return call
    } catch (error) {
      console.error('Failed to initiate call:', error)
      throw new Error(`Call initiation failed: ${error.message}`)
    }
  }
  
  /**
   * Create TwiML response for answered call
   */
  createAnswerResponse(options: {
    welcomeMessage?: string
    voiceUrl?: string
    recordCall?: boolean
    gatherInput?: boolean
  } = {}): VoiceResponse {
    const twiml = new VoiceResponse()
    
    // Welcome message
    if (options.welcomeMessage) {
      twiml.say({
        voice: 'alice',
        language: 'en-US'
      }, options.welcomeMessage)
    }
    
    // Start recording if enabled
    if (options.recordCall !== false) {
      twiml.record({
        action: `${this.config.webhookUrl}/recording-complete`,
        method: 'POST',
        maxLength: parseInt(process.env.VOICE_MAX_CALL_DURATION || '600'),
        recordingStatusCallback: `${this.config.webhookUrl}/recording-status`
      })
    }
    
    // Connect to WebSocket for real-time AI
    if (options.voiceUrl) {
      twiml.connect().stream({
        url: options.voiceUrl,
        name: 'voice-stream'
      })
    }
    
    // Gather input if needed
    if (options.gatherInput) {
      const gather = twiml.gather({
        input: ['speech', 'dtmf'],
        timeout: 5,
        speechTimeout: 'auto',
        action: `${this.config.webhookUrl}/gather-complete`,
        method: 'POST'
      })
      
      gather.say('I\'m listening. Please speak your response.')
    }
    
    return twiml
  }
  
  /**
   * Handle machine detection result
   */
  createMachineDetectionResponse(detectionResult: 'human' | 'machine' | 'fax' | 'unknown'): VoiceResponse {
    const twiml = new VoiceResponse()
    
    switch (detectionResult) {
      case 'human':
        // Proceed with AI conversation
        twiml.say('Hello! I\'m calling from CoreFlow360 regarding your recent inquiry.')
        twiml.connect().stream({
          url: `wss://${process.env.DOMAIN}/api/voice/stream`,
          name: 'ai-conversation'
        })
        break
        
      case 'machine':
        // Leave voicemail
        twiml.pause({ length: 2 }) // Wait for beep
        twiml.say({
          voice: 'alice',
          rate: 'slow'
        }, 'Hi, this is Sarah from CoreFlow360. I\'m following up on your inquiry about our services. Please call us back at your convenience. Thank you!')
        twiml.hangup()
        break
        
      case 'fax':
        // Hang up immediately
        twiml.hangup()
        break
        
      default:
        // Unknown - proceed cautiously
        twiml.pause({ length: 1 })
        twiml.say('Hello? Can you hear me?')
        twiml.gather({
          input: ['speech'],
          timeout: 3,
          action: `${this.config.webhookUrl}/human-check`
        })
        break
    }
    
    return twiml
  }
  
  /**
   * Get call details and status
   */
  async getCallStatus(callSid: string): Promise<CallStatus> {
    try {
      const call = await this.client.calls(callSid).fetch()
      
      return {
        sid: call.sid,
        status: call.status as any,
        duration: call.duration ? parseInt(call.duration) : undefined,
        startTime: call.startTime ? new Date(call.startTime) : undefined,
        endTime: call.endTime ? new Date(call.endTime) : undefined,
        cost: call.price ? parseFloat(call.price) : undefined
      }
    } catch (error) {
      throw new Error(`Failed to fetch call status: ${error.message}`)
    }
  }
  
  /**
   * End active call
   */
  async endCall(callSid: string): Promise<void> {
    try {
      await this.client.calls(callSid).update({
        status: 'completed'
      })
      
      console.log(`📞 Call ended: ${callSid}`)
    } catch (error) {
      throw new Error(`Failed to end call: ${error.message}`)
    }
  }
  
  /**
   * Get recording URL
   */
  async getRecording(recordingSid: string): Promise<string> {
    try {
      const recording = await this.client.recordings(recordingSid).fetch()
      return `https://api.twilio.com${recording.uri.replace('.json', '.mp3')}`
    } catch (error) {
      throw new Error(`Failed to fetch recording: ${error.message}`)
    }
  }
  
  /**
   * Validate phone number format
   */
  private isValidPhoneNumber(phoneNumber: string): boolean {
    try {
      return validatePhoneNumber(phoneNumber, 'US')
    } catch {
      return false
    }
  }
  
  /**
   * Format phone number for Twilio
   */
  private formatPhoneNumber(phoneNumber: string): string {
    try {
      const parsed = parsePhoneNumber(phoneNumber, 'US')
      return parsed.format('E.164')
    } catch {
      throw new Error(`Unable to format phone number: ${phoneNumber}`)
    }
  }
  
  /**
   * Check account balance and limits
   */
  async checkAccountStatus(): Promise<{
    balance: number
    callsRemaining: number
    status: 'active' | 'suspended' | 'trial'
  }> {
    try {
      const account = await this.client.api.accounts(this.config.accountSid).fetch()
      const balance = await this.client.balance.fetch()
      
      return {
        balance: parseFloat(balance.balance),
        callsRemaining: Math.floor(parseFloat(balance.balance) / 0.013), // Approximate
        status: account.status as any
      }
    } catch (error) {
      throw new Error(`Failed to check account status: ${error.message}`)
    }
  }
  
  /**
   * Bulk call initiation for lead lists
   */
  async initiateBulkCalls(
    phoneNumbers: string[],
    options: Omit<CallOptions, 'to'>
  ): Promise<{ successful: string[], failed: { number: string, error: string }[] }> {
    const successful: string[] = []
    const failed: { number: string, error: string }[] = []
    
    // Rate limiting: Max 10 concurrent calls
    const batchSize = 10
    
    for (let i = 0; i < phoneNumbers.length; i += batchSize) {
      const batch = phoneNumbers.slice(i, i + batchSize)
      
      const promises = batch.map(async (phoneNumber) => {
        try {
          const call = await this.initiateCall({
            ...options,
            to: phoneNumber
          })
          successful.push(call.sid)
        } catch (error) {
          failed.push({
            number: phoneNumber,
            error: error.message
          })
        }
      })
      
      await Promise.allSettled(promises)
      
      // Rate limiting delay
      if (i + batchSize < phoneNumbers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    return { successful, failed }
  }
}

// Export lazy-loaded singleton instance
let twilioClientInstance: TwilioVoiceClient | null = null

export const twilioClient = {
  getInstance(): TwilioVoiceClient {
    if (!twilioClientInstance) {
      twilioClientInstance = new TwilioVoiceClient()
    }
    return twilioClientInstance
  }
}