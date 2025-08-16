/**
 * CoreFlow360 - Twilio Voice Webhook Handler
 * Main webhook endpoint for all Twilio voice events
 */

import { NextRequest, NextResponse } from 'next/server'
import { VoiceResponse } from 'twilio/lib/twiml/VoiceResponse'
import { twilioClient } from '@/lib/voice/twilio-client'
import { scriptManager } from '@/lib/voice/industry-scripts'
import { db } from '@/lib/db/client'
import { validatePhoneNumber } from 'libphonenumber-js'
import { withSignatureValidation } from '@/middleware/request-signature'

interface CallData {
  CallSid: string
  From: string
  To: string
  CallStatus: 'initiated' | 'ringing' | 'answered' | 'completed'
  Direction: 'inbound' | 'outbound'
  AnsweredBy?: 'human' | 'machine_start' | 'machine_end_beep' | 'machine_end_silence' | 'fax' | 'unknown'
}

/**
 * POST /api/voice/webhook
 * Handle incoming Twilio webhook events
 */
async function postHandler(request: NextRequest) {
  try {
    const formData = await request.formData()
    const callData: CallData = {
      CallSid: formData.get('CallSid') as string,
      From: formData.get('From') as string,
      To: formData.get('To') as string,
      CallStatus: formData.get('CallStatus') as any,
      Direction: formData.get('Direction') as any,
      AnsweredBy: formData.get('AnsweredBy') as any
    }
    
    console.log('📞 Voice webhook received:', callData)
    
    // Route to appropriate handler based on event type
    const response = await routeWebhookEvent(request, callData, formData)
    
    return new NextResponse(response.toString(), {
      headers: {
        'Content-Type': 'text/xml',
        'Cache-Control': 'no-cache'
      }
    })
    
  } catch (error) {
    console.error('Voice webhook error:', error)
    
    // Return error TwiML
    const twiml = new VoiceResponse()
    twiml.say('We apologize, but there was a technical issue. Please try calling back later.')
    twiml.hangup()
    
    return new NextResponse(twiml.toString(), {
      status: 500,
      headers: { 'Content-Type': 'text/xml' }
    })
  }
}

/**
 * Route webhook events to appropriate handlers
 */
async function routeWebhookEvent(
  request: NextRequest,
  callData: CallData,
  formData: FormData
): Promise<VoiceResponse> {
  const action = request.nextUrl.searchParams.get('action') || 'answer'
  
  switch (action) {
    case 'answer':
      return await handleCallAnswer(callData, formData)
    
    case 'amd-status':
      return await handleAnsweringMachineDetection(callData, formData)
    
    case 'gather-complete':
      return await handleGatherComplete(callData, formData)
    
    case 'recording-complete':
      return await handleRecordingComplete(callData, formData)
    
    case 'call-status':
      return await handleCallStatusUpdate(callData, formData)
    
    case 'human-check':
      return await handleHumanCheck(callData, formData)
    
    default:
      return await handleCallAnswer(callData, formData)
  }
}

/**
 * Handle call answered event
 */
async function handleCallAnswer(callData: CallData, formData: FormData): Promise<VoiceResponse> {
  console.log(`📞 Call ${callData.CallSid} answered by ${callData.AnsweredBy || 'unknown'}`)
  
  // Find lead/customer info
  const leadInfo = await findLeadByPhone(callData.From)
  
  // Select appropriate script
  const script = scriptManager.selectScript({
    industry: leadInfo?.industry,
    leadSource: leadInfo?.source,
    serviceType: leadInfo?.serviceType
  })
  
  // Customize script for this specific lead
  const customizedScript = leadInfo ? scriptManager.customizeScript(script, {
    companyName: leadInfo.companyName,
    contactName: leadInfo.contactName,
    specificNeed: leadInfo.specificNeed,
    referralSource: leadInfo.referralSource
  }) : script
  
  // Store call record
  await createCallRecord(callData, leadInfo?.id, script.id)
  
  // Handle machine detection
  if (callData.AnsweredBy) {
    return twilioClient.createMachineDetectionResponse(
      callData.AnsweredBy === 'human' ? 'human' :
      callData.AnsweredBy.startsWith('machine') ? 'machine' :
      callData.AnsweredBy === 'fax' ? 'fax' : 'unknown'
    )
  }
  
  // Create initial response with AI streaming
  const twiml = new VoiceResponse()
  
  // Welcome message
  twiml.say({
    voice: 'alice',
    language: 'en-US'
  }, customizedScript.openingMessage)
  
  // Connect to WebSocket for AI conversation
  twiml.connect().stream({
    url: `wss://${request.headers.get('host')}/api/voice/stream?script=${script.id}&callSid=${callData.CallSid}`,
    name: 'ai-conversation'
  })
  
  return twiml
}

/**
 * Handle answering machine detection result
 */
async function handleAnsweringMachineDetection(
  callData: CallData, 
  formData: FormData
): Promise<VoiceResponse> {
  const detectionResult = formData.get('AnsweredBy') as string
  
  console.log(`🤖 AMD result for ${callData.CallSid}: ${detectionResult}`)
  
  // Update call record
  await updateCallRecord(callData.CallSid, {
    amdResult: detectionResult,
    answeredAt: new Date()
  })
  
  return twilioClient.createMachineDetectionResponse(
    detectionResult === 'human' ? 'human' :
    detectionResult?.includes('machine') ? 'machine' :
    detectionResult === 'fax' ? 'fax' : 'unknown'
  )
}

/**
 * Handle gather input completion
 */
async function handleGatherComplete(
  callData: CallData,
  formData: FormData
): Promise<VoiceResponse> {
  const speechResult = formData.get('SpeechResult') as string
  const digits = formData.get('Digits') as string
  const confidence = parseFloat(formData.get('Confidence') as string || '0')
  
  console.log(`🎤 Gather complete for ${callData.CallSid}:`, {
    speech: speechResult,
    digits,
    confidence
  })
  
  const twiml = new VoiceResponse()
  
  if (speechResult && confidence > 0.5) {
    // Process speech input
    twiml.say(`I heard you say: ${speechResult}. Let me help you with that.`)
    
    // Continue with AI conversation
    twiml.connect().stream({
      url: `wss://${process.env.DOMAIN}/api/voice/stream?callSid=${callData.CallSid}&lastInput=${encodeURIComponent(speechResult)}`,
      name: 'ai-conversation'
    })
  } else {
    // Low confidence or no input
    twiml.say('I didn\'t quite catch that. Could you please repeat?')
    
    twiml.gather({
      input: ['speech'],
      timeout: 5,
      speechTimeout: 'auto',
      action: `/api/voice/webhook?action=gather-complete`,
      method: 'POST'
    })
  }
  
  return twiml
}

/**
 * Handle recording completion
 */
async function handleRecordingComplete(
  callData: CallData,
  formData: FormData
): Promise<VoiceResponse> {
  const recordingUrl = formData.get('RecordingUrl') as string
  const recordingSid = formData.get('RecordingSid') as string
  const duration = parseInt(formData.get('RecordingDuration') as string || '0')
  
  console.log(`📹 Recording complete for ${callData.CallSid}:`, {
    url: recordingUrl,
    sid: recordingSid,
    duration
  })
  
  // Update call record with recording info
  await updateCallRecord(callData.CallSid, {
    recordingUrl,
    recordingSid,
    recordingDuration: duration
  })
  
  // Continue conversation or end call
  const twiml = new VoiceResponse()
  twiml.say('Thank you for your time. Have a great day!')
  twiml.hangup()
  
  return twiml
}

/**
 * Handle call status updates
 */
async function handleCallStatusUpdate(
  callData: CallData,
  formData: FormData
): Promise<VoiceResponse> {
  const callDuration = parseInt(formData.get('CallDuration') as string || '0')
  const timestamp = formData.get('Timestamp') as string
  
  console.log(`📊 Call status update ${callData.CallSid}: ${callData.CallStatus}`)
  
  // Update call record
  await updateCallRecord(callData.CallSid, {
    status: callData.CallStatus,
    duration: callDuration,
    endedAt: callData.CallStatus === 'completed' ? new Date() : undefined
  })
  
  // Return empty TwiML (status callbacks don't need response)
  return new VoiceResponse()
}

/**
 * Handle human detection check
 */
async function handleHumanCheck(
  callData: CallData,
  formData: FormData
): Promise<VoiceResponse> {
  const speechResult = formData.get('SpeechResult') as string
  
  const twiml = new VoiceResponse()
  
  if (speechResult && speechResult.length > 0) {
    // Human detected, proceed with conversation
    twiml.say('Great! I can hear you clearly.')
    
    twiml.connect().stream({
      url: `wss://${process.env.DOMAIN}/api/voice/stream?callSid=${callData.CallSid}`,
      name: 'ai-conversation'
    })
  } else {
    // Likely voicemail, leave message
    twiml.pause({ length: 2 })
    twiml.say({
      voice: 'alice',
      rate: 'slow'
    }, 'Hi, this is Sarah from CoreFlow360. I\'m following up on your inquiry about our services. Please call us back at your convenience. Thank you!')
    twiml.hangup()
  }
  
  return twiml
}

/**
 * Find lead information by phone number
 */
async function findLeadByPhone(phoneNumber: string): Promise<{
  id: string
  contactName?: string
  companyName?: string
  industry?: string
  source?: string
  serviceType?: string
  specificNeed?: string
  referralSource?: string
} | null> {
  try {
    // Normalize phone number
    const normalizedPhone = phoneNumber.replace(/\D/g, '')
    
    // Check Customer table first
    const customer = await db.customer.findFirst({
      where: {
        OR: [
          { phone: phoneNumber },
          { phone: normalizedPhone },
          { phone: { endsWith: normalizedPhone.slice(-10) } }
        ]
      },
      select: {
        id: true,
        name: true,
        company: true,
        industry: true,
        customFields: true
      }
    })
    
    if (customer) {
      return {
        id: customer.id,
        contactName: customer.name,
        companyName: customer.company || undefined,
        industry: customer.industry || undefined,
        source: (customer.customFields as any)?.leadSource,
        serviceType: (customer.customFields as any)?.serviceType,
        specificNeed: (customer.customFields as any)?.specificNeed,
        referralSource: (customer.customFields as any)?.referralSource
      }
    }
    
    // Check Lead table if exists
    // TODO: Add lead table query if you have a separate leads table
    
    return null
  } catch (error) {
    console.error('Error finding lead by phone:', error)
    return null
  }
}

/**
 * Create call record
 */
async function createCallRecord(
  callData: CallData,
  leadId?: string,
  scriptId?: string
): Promise<void> {
  try {
    await db.voiceCall.create({
      data: {
        sid: callData.CallSid,
        fromNumber: callData.From,
        toNumber: callData.To,
        direction: callData.Direction,
        status: callData.CallStatus,
        leadId,
        scriptId,
        startedAt: new Date(),
        metadata: {
          answeredBy: callData.AnsweredBy
        }
      }
    })
  } catch (error) {
    console.error('Error creating call record:', error)
  }
}

/**
 * Update call record
 */
async function updateCallRecord(
  callSid: string,
  updates: {
    status?: string
    amdResult?: string
    answeredAt?: Date
    endedAt?: Date
    duration?: number
    recordingUrl?: string
    recordingSid?: string
    recordingDuration?: number
  }
): Promise<void> {
  try {
    await db.voiceCall.update({
      where: { sid: callSid },
      data: {
        ...updates,
        updatedAt: new Date()
      }
    })
  } catch (error) {
    console.error('Error updating call record:', error)
  }
}

// Apply high security signature validation to critical voice webhook
export const POST = withSignatureValidation(postHandler, { 
  highSecurity: true,
  skipInDevelopment: false // Always require signatures for voice webhooks
});