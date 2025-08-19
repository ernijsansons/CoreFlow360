/**
 * CoreFlow360 Enhanced Voice Processing Workflows
 *
 * Durable, fault-tolerant Temporal workflows for voice call processing
 * Ensures zero data loss and consistent lead processing regardless of failures
 */

import {
  proxyActivities,
  defineSignal,
  defineQuery,
  setHandler,
  condition,
  uuid4,
  log,
  sleep,
  continueAsNew,
} from '@temporalio/workflow'

// Import activity definitions
import type * as activities from './temporal-activities'

// Proxy activities with appropriate timeouts
const {
  processCallTranscript,
  analyzeCallSentiment,
  extractCustomerInfo,
  updateLeadScore,
  scheduleFollowUp,
  sendNotification,
  createCallRecord,
  updateCallRecord,
  generateCallSummary,
  performQualityCheck,
  triggerIntegrations,
  calculateMetrics,
  storeAnalytics,
  handleCallTransfer,
  processPayment,
  scheduleAppointment,
  sendSMS,
  updateCRM,
  triggerAutomations,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '5 minutes',
  heartbeatTimeout: '30 seconds',
  retryPolicy: {
    initialInterval: '1 second',
    backoffCoefficient: 2,
    maximumInterval: '30 seconds',
    maximumAttempts: 5,
    nonRetryableErrorTypes: ['ValidationError', 'AuthenticationError'],
  },
})

// Workflow signals and queries
export const transcriptSignal = defineSignal<[TranscriptEvent]>('transcript')
export const functionCallSignal = defineSignal<[FunctionCallEvent]>('function-call')
export const callEndSignal = defineSignal<[CallEndEvent]>('call-end')
export const transferSignal = defineSignal<[TransferRequest]>('transfer-request')

export const getCallStatusQuery = defineQuery<CallWorkflowStatus>('call-status')
export const getCallMetricsQuery = defineQuery<CallMetrics>('call-metrics')
export const getLeadScoreQuery = defineQuery<number>('lead-score')

// Workflow interfaces
export interface CallWorkflowInput {
  callId: string
  tenantId: string
  phoneNumber: string
  provider: 'vapi' | 'twilio'
  startTime: Date
  metadata: Record<string, unknown>
}

export interface PostCallWorkflowInput {
  callId: string
  leadId: string
  tenantId: string
}

export interface VoiceLeadWorkflowInput {
  callId: string
  phoneNumber: string
  tenantId: string
  industry?: string
  goal: 'qualification' | 'appointment' | 'follow_up'
  priority: 'low' | 'medium' | 'high'
  customerData?: unknown
  startTime: number
}

export interface TranscriptEvent {
  timestamp: Date
  speaker: 'user' | 'assistant'
  text: string
  confidence: number
  emotions?: EmotionData[]
  keywords?: string[]
}

export interface FunctionCallEvent {
  functionName: string
  parameters: Record<string, unknown>
  timestamp: Date
  confidence?: number
}

export interface CallEndEvent {
  endTime: Date
  duration: number
  status: 'completed' | 'failed' | 'cancelled'
  reason?: string
  summary?: string
}

export interface TransferRequest {
  reason: string
  priority: 'low' | 'medium' | 'high'
  notes: string
  agentType?: string
}

export interface CallWorkflowStatus {
  stage: 'starting' | 'active' | 'processing' | 'completing' | 'completed' | 'failed'
  progress: number
  currentActivity?: string
  leadScore: number
  qualificationStatus: QualificationStatus
  nextActions: string[]
  errorCount: number
}

export interface CallMetrics {
  duration: number
  transcriptLength: number
  averageResponse: number
  sentimentScore: number
  engagementLevel: number
  qualificationScore: number
  functionCalls: number
  transfers: number
}

export interface QualificationStatus {
  overall: number // 1-10 scale
  pain: number
  authority: number
  need: number
  timeline: number
  budget: number
  fit: number
}

export interface EmotionData {
  emotion: string
  intensity: number
  confidence: number
}

/**
 * Enhanced Voice Call Workflow
 * Orchestrates the entire call lifecycle with real-time processing
 */
export async function enhancedVoiceCallWorkflow(
  input: CallWorkflowInput
): Promise<CallWorkflowStatus> {
  const { callId, tenantId, phoneNumber, provider, startTime, metadata } = input

  // Initialize workflow state
  const status: CallWorkflowStatus = {
    stage: 'starting',
    progress: 0,
    leadScore: 0,
    qualificationStatus: {
      overall: 0,
      pain: 0,
      authority: 0,
      need: 0,
      timeline: 0,
      budget: 0,
      fit: 0,
    },
    nextActions: [],
    errorCount: 0,
  }

  const transcripts: TranscriptEvent[] = []
  const functionCalls: FunctionCallEvent[] = []
  let callEnded = false
  let transferRequested = false

  // Set up signal handlers
  setHandler(transcriptSignal, async (event: TranscriptEvent) => {
    log.info('Processing transcript signal', { callId, speaker: event.speaker, text: event.text })
    transcripts.push(event)

    try {
      // Process transcript in real-time
      const analysis = await processCallTranscript({
        callId,
        tenantId,
        transcript: event.text,
        speaker: event.speaker,
        timestamp: event.timestamp,
        context: {
          previousTranscripts: transcripts.slice(-5), // Last 5 for context
          currentScore: status.leadScore,
          callMetadata: metadata,
        },
      })

      // Update qualification status
      status.qualificationStatus = {
        ...status.qualificationStatus,
        ...analysis.qualification,
      }
      status.leadScore = analysis.leadScore
      status.progress = Math.min(95, status.progress + 2)

      // Trigger real-time actions if needed
      if (analysis.urgentActions?.length > 0) {
        for (const action of analysis.urgentActions) {
          await executeUrgentAction(callId, tenantId, action)
        }
      }
    } catch (error) {
      log.error('Transcript processing failed', { callId, error })
      status.errorCount++
    }
  })

  setHandler(functionCallSignal, async (event: FunctionCallEvent) => {
    log.info('Processing function call', { callId, function: event.functionName })
    functionCalls.push(event)

    try {
      // Execute function call with validation
      const result = await executeFunctionCall(callId, tenantId, event)

      // Update workflow state based on function result
      if (event.functionName === 'update_qualification_score') {
        status.leadScore = Math.max(status.leadScore, event.parameters.score || 0)
      } else if (event.functionName === 'schedule_appointment') {
        status.nextActions.push('appointment_scheduled')
      } else if (event.functionName === 'transfer_to_human') {
        transferRequested = true
      }
    } catch (error) {
      log.error('Function call execution failed', { callId, function: event.functionName, error })
      status.errorCount++
    }
  })

  setHandler(callEndSignal, async (event: CallEndEvent) => {
    log.info('Call ending signal received', { callId, status: event.status })
    callEnded = true
    status.stage = 'completing'
    status.progress = 90
  })

  setHandler(transferSignal, async (request: TransferRequest) => {
    log.info('Transfer request received', { callId, reason: request.reason })
    transferRequested = true

    try {
      await handleCallTransfer({
        callId,
        tenantId,
        reason: request.reason,
        priority: request.priority,
        notes: request.notes,
        agentType: request.agentType,
        currentContext: {
          leadScore: status.leadScore,
          qualification: status.qualificationStatus,
          transcripts: transcripts.slice(-10),
        },
      })

      status.nextActions.push('transferred_to_human')
    } catch (error) {
      log.error('Transfer handling failed', { callId, error })
      status.errorCount++
    }
  })

  // Set up query handlers
  setHandler(getCallStatusQuery, (): CallWorkflowStatus => status)
  setHandler(
    getCallMetricsQuery,
    (): CallMetrics => ({
      duration: Math.floor((Date.now() - new Date(startTime).getTime()) / 1000),
      transcriptLength: transcripts.reduce((sum, t) => sum + t.text.length, 0),
      averageResponse: calculateAverageResponse(transcripts),
      sentimentScore: calculateSentimentScore(transcripts),
      engagementLevel: calculateEngagementLevel(transcripts, functionCalls),
      qualificationScore: status.leadScore,
      functionCalls: functionCalls.length,
      transfers: transferRequested ? 1 : 0,
    })
  )
  setHandler(getLeadScoreQuery, (): number => status.leadScore)

  try {
    // Initialize call record
    status.stage = 'starting'
    status.currentActivity = 'creating_call_record'

    await createCallRecord({
      callId,
      tenantId,
      phoneNumber,
      provider,
      startTime,
      metadata,
    })

    status.stage = 'active'
    status.progress = 10
    status.currentActivity = 'monitoring_call'

    // Wait for call to complete or timeout after 1 hour
    const callTimeout = 60 * 60 * 1000 // 1 hour

    await condition(() => callEnded || transferRequested, callTimeout)

    // Final processing
    status.stage = 'processing'
    status.currentActivity = 'final_processing'
    status.progress = 95

    // Generate comprehensive call summary
    const callSummary = await generateCallSummary({
      callId,
      tenantId,
      transcripts,
      functionCalls,
      qualification: status.qualificationStatus,
      leadScore: status.leadScore,
      duration: Math.floor((Date.now() - new Date(startTime).getTime()) / 1000),
    })

    // Update final call record
    await updateCallRecord({
      callId,
      tenantId,
      endTime: new Date(),
      status: transferRequested ? 'transferred' : 'completed',
      summary: callSummary,
      leadScore: status.leadScore,
      qualification: status.qualificationStatus,
      transcriptCount: transcripts.length,
      functionCallCount: functionCalls.length,
    })

    // Store analytics for improvement
    await storeAnalytics({
      callId,
      tenantId,
      provider,
      metrics: {
        duration: Math.floor((Date.now() - new Date(startTime).getTime()) / 1000),
        transcriptLength: transcripts.reduce((sum, t) => sum + t.text.length, 0),
        leadScore: status.leadScore,
        qualificationData: status.qualificationStatus,
        functionCalls: functionCalls.length,
        errorCount: status.errorCount,
      },
    })

    // Trigger integrations and automations
    await triggerIntegrations({
      callId,
      tenantId,
      leadScore: status.leadScore,
      nextActions: status.nextActions,
    })

    status.stage = 'completed'
    status.progress = 100
    status.currentActivity = 'completed'

    log.info('Call workflow completed successfully', {
      callId,
      finalScore: status.leadScore,
      transcripts: transcripts.length,
    })
  } catch (error) {
    status.stage = 'failed'
    status.errorCount++

    log.error('Call workflow failed', { callId, error })

    // Store error for analysis
    await storeAnalytics({
      callId,
      tenantId,
      provider,
      error: error.message,
      metrics: {
        duration: Math.floor((Date.now() - new Date(startTime).getTime()) / 1000),
        transcriptLength: transcripts.reduce((sum, t) => sum + t.text.length, 0),
        leadScore: status.leadScore,
        errorCount: status.errorCount,
      },
    })

    throw error
  }

  return status
}

/**
 * Post-Call Processing Workflow
 * Handles follow-up actions after call completion
 */
export async function postCallProcessingWorkflow(input: PostCallWorkflowInput): Promise<void> {
  const { callId, leadId, tenantId } = input

  try {
    log.info('Starting post-call processing', { callId, leadId })

    // Quality check
    const qualityResult = await performQualityCheck({
      callId,
      tenantId,
      leadId,
    })

    // Update lead scoring based on quality analysis
    if (qualityResult.scoreAdjustment) {
      await updateLeadScore({
        leadId,
        tenantId,
        adjustment: qualityResult.scoreAdjustment,
        reason: 'post_call_quality_analysis',
      })
    }

    // Schedule appropriate follow-up
    if (qualityResult.recommendedFollowUp) {
      await scheduleFollowUp({
        leadId,
        tenantId,
        type: qualityResult.recommendedFollowUp.type,
        scheduledFor: qualityResult.recommendedFollowUp.scheduledFor,
        message: qualityResult.recommendedFollowUp.message,
      })
    }

    // Send notifications to relevant team members
    if (qualityResult.notifications?.length > 0) {
      for (const notification of qualityResult.notifications) {
        await sendNotification({
          tenantId,
          userId: notification.userId,
          type: notification.type,
          message: notification.message,
          callId,
          leadId,
        })
      }
    }

    // Update CRM with enriched data
    await updateCRM({
      leadId,
      tenantId,
      callId,
      qualityData: qualityResult,
    })

    // Trigger marketing automations if qualified
    if (qualityResult.marketingTriggers?.length > 0) {
      await triggerAutomations({
        leadId,
        tenantId,
        triggers: qualityResult.marketingTriggers,
      })
    }

    log.info('Post-call processing completed', { callId, leadId })
  } catch (error) {
    log.error('Post-call processing failed', { callId, leadId, error })

    // Schedule retry after delay
    await sleep('5 minutes')
    await continueAsNew<typeof postCallProcessingWorkflow>(input)
  }
}

/**
 * Enhanced Voice Lead Workflow
 * Comprehensive lead processing with industry-specific logic
 */
export async function enhancedVoiceLeadWorkflow(input: VoiceLeadWorkflowInput): Promise<string> {
  const { callId, phoneNumber, tenantId, industry, goal, priority, customerData, startTime } = input

  try {
    log.info('Starting enhanced voice lead workflow', { callId, industry, goal })

    // Extract and enrich customer information
    const enrichedCustomer = await extractCustomerInfo({
      phoneNumber,
      tenantId,
      industry,
      existingData: customerData,
    })

    // Analyze call with industry-specific context
    const analysis = await analyzeCallSentiment({
      callId,
      tenantId,
      industry,
      goal,
      customerContext: enrichedCustomer,
    })

    // Calculate comprehensive lead score
    const leadScore = await updateLeadScore({
      leadId: `${callId}_lead`,
      tenantId,
      phoneNumber,
      analysis,
      industry,
      goal,
      priority,
    })

    // Determine and execute next actions
    const nextActions = determineNextActions(analysis, leadScore, goal)

    for (const action of nextActions) {
      switch (action.type) {
        case 'schedule_appointment':
          await scheduleAppointment({
            leadId: `${callId}_lead`,
            tenantId,
            serviceType: action.serviceType,
            urgency: action.urgency,
            preferredTime: action.preferredTime,
          })
          break

        case 'send_followup_sms':
          await sendSMS({
            phoneNumber,
            tenantId,
            message: action.message,
            scheduleFor: action.scheduleFor,
          })
          break

        case 'process_payment':
          if (action.paymentData) {
            await processPayment({
              leadId: `${callId}_lead`,
              tenantId,
              amount: action.paymentData.amount,
              paymentMethod: action.paymentData.method,
            })
          }
          break
      }
    }

    // Store comprehensive metrics
    await calculateMetrics({
      callId,
      tenantId,
      industry,
      goal,
      leadScore,
      actions: nextActions.length,
      processingTime: Date.now() - startTime,
    })

    log.info('Enhanced voice lead workflow completed', {
      callId,
      leadScore,
      actionsExecuted: nextActions.length,
    })

    return `${callId}_lead`
  } catch (error) {
    log.error('Enhanced voice lead workflow failed', { callId, error })
    throw error
  }
}

// Helper functions
async function executeUrgentAction(
  callId: string,
  tenantId: string,
  action: unknown
): Promise<void> {
  switch (action.type) {
    case 'alert_manager':
      await sendNotification({
        tenantId,
        userId: action.managerId,
        type: 'urgent_call_alert',
        message: `Urgent attention needed on call ${callId}: ${action.reason}`,
        callId,
      })
      break

    case 'escalate_pricing':
      // Handle pricing escalation
      break

    case 'offer_discount':
      // Handle automatic discount offering
      break
  }
}

async function executeFunctionCall(
  callId: string,
  tenantId: string,
  event: FunctionCallEvent
): Promise<unknown> {
  const { functionName, parameters } = event

  switch (functionName) {
    case 'update_qualification_score':
      return await updateLeadScore({
        leadId: `${callId}_lead`,
        tenantId,
        adjustment: parameters.score,
        reason: parameters.reasoning || 'real_time_qualification',
      })

    case 'schedule_appointment':
      return await scheduleAppointment({
        leadId: `${callId}_lead`,
        tenantId,
        serviceType: parameters.serviceType,
        preferredDate: parameters.preferredDate,
        preferredTime: parameters.preferredTime,
        urgency: parameters.urgency,
      })

    default:
      throw new Error(`Unknown function: ${functionName}`)
  }
}

function calculateAverageResponse(transcripts: TranscriptEvent[]): number {
  if (transcripts.length < 2) return 0

  const responseTimes: number[] = []
  for (let i = 1; i < transcripts.length; i++) {
    if (transcripts[i - 1].speaker !== transcripts[i].speaker) {
      responseTimes.push(
        transcripts[i].timestamp.getTime() - transcripts[i - 1].timestamp.getTime()
      )
    }
  }

  return responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b) / responseTimes.length : 0
}

function calculateSentimentScore(transcripts: TranscriptEvent[]): number {
  if (!transcripts.length) return 0

  // Simplified sentiment calculation based on emotions
  const emotionScores = transcripts.flatMap((t) => t.emotions || [])
  if (!emotionScores.length) return 0.5

  const positiveEmotions = ['happy', 'excited', 'satisfied', 'confident']
  const positiveScore = emotionScores
    .filter((e) => positiveEmotions.includes(e.emotion))
    .reduce((sum, e) => sum + e.intensity * e.confidence, 0)

  return Math.min(1, positiveScore / emotionScores.length)
}

function calculateEngagementLevel(
  transcripts: TranscriptEvent[],
  functionCalls: FunctionCallEvent[]
): number {
  const transcriptEngagement = transcripts.length * 0.1
  const functionEngagement = functionCalls.length * 0.3
  const conversationFlow =
    transcripts.filter((t, i) => i > 0 && transcripts[i - 1].speaker !== t.speaker).length * 0.2

  return Math.min(1, transcriptEngagement + functionEngagement + conversationFlow)
}

function determineNextActions(analysis: unknown, leadScore: number, goal: string): unknown[] {
  const actions: unknown[] = []

  if (leadScore >= 8 && goal === 'appointment') {
    actions.push({
      type: 'schedule_appointment',
      urgency: 'high',
      serviceType: analysis.serviceNeeded || 'consultation',
    })
  }

  if (leadScore >= 6 && leadScore < 8) {
    actions.push({
      type: 'send_followup_sms',
      message: "Thanks for your time today! I'll send you the information we discussed.",
      scheduleFor: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    })
  }

  if (analysis.paymentInterest && leadScore >= 7) {
    actions.push({
      type: 'process_payment',
      paymentData: {
        amount: analysis.proposedAmount,
        method: 'card',
      },
    })
  }

  return actions
}
