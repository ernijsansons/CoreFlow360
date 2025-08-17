/**
 * CoreFlow360 - Lead Processing Queue System
 * High-performance BullMQ-based queue for voice call processing
 */

import { Queue, Worker, Job, QueueEvents } from 'bullmq'
import { Redis } from 'ioredis'
import { twilioClient } from '@/lib/voice/twilio-client'
import { scriptManager } from '@/lib/voice/industry-scripts'
import { db } from '@/lib/db'
import { rateLimiter } from '@/lib/rate-limiting/call-limiter'

// Skip Redis initialization during build time
const isBuildTime = () => process.env.VERCEL || process.env.CI || process.env.NEXT_PHASE === 'phase-production-build' || process.env.VERCEL_ENV === 'preview'

// Lazy Redis connection factory
let redis: Redis | null = null
function getRedisConnection(): Redis | null {
  if (isBuildTime()) {
    return null
  }
  
  if (!redis) {
    redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: null, // Required by BullMQ
      retryDelayOnFailover: 100,
      enableOfflineQueue: false,
      lazyConnect: true,
      // Connection pooling for high throughput
      family: 4,
      keepAlive: 30000,
      db: parseInt(process.env.REDIS_DB || '0')
    })
  }
  
  return redis
}

// Lazy queue configuration
function getQueueConfig() {
  if (isBuildTime()) {
    return {}
  }
  
  const connection = getRedisConnection()
  if (!connection) {
    return {}
  }
  
  return {
    connection,
    defaultJobOptions: {
      removeOnComplete: 100,  // Keep last 100 completed jobs
      removeOnFail: 50,       // Keep last 50 failed jobs
      attempts: 3,
      backoff: {
        type: 'exponential' as const,
        delay: 10000
      }
    }
  }
}

// Lazy queue initialization
let _leadQueue: Queue | null = null
let _callStatusQueue: Queue | null = null

// Lead processing queue - handles call initiation
export function getLeadQueue(): Queue {
  if (isBuildTime()) {
    return {} as Queue
  }
  
  if (!_leadQueue) {
    _leadQueue = new Queue('lead-processor', getQueueConfig())
  }
  return _leadQueue
}

// Call status queue - handles call lifecycle events  
export function getCallStatusQueue(): Queue {
  if (isBuildTime()) {
    return {} as Queue
  }
  
  if (!_callStatusQueue) {
    _callStatusQueue = new Queue('call-status', getQueueConfig())
  }
  return _callStatusQueue
}

// Export for backward compatibility with lazy loading
export const leadQueue = new Proxy({} as Queue, {
  get(_target, prop) {
    const queue = getLeadQueue()
    return queue[prop as keyof Queue]
  }
})

export const callStatusQueue = new Proxy({} as Queue, {
  get(_target, prop) {
    const queue = getCallStatusQueue()
    return queue[prop as keyof Queue]
  }
})

// Retry queue - handles failed calls with intelligent retry logic
let _retryQueue: Queue | null = null

export function getRetryQueue(): Queue {
  if (isBuildTime()) {
    return {} as Queue
  }
  
  if (!_retryQueue) {
    _retryQueue = new Queue('call-retry', getQueueConfig())
  }
  return _retryQueue
}

export const retryQueue = new Proxy({} as Queue, {
  get(_target, prop) {
    const queue = getRetryQueue()
    return queue[prop as keyof Queue]
  }
})

// Queue events for monitoring
let _queueEvents: QueueEvents | null = null

function getQueueEvents(): QueueEvents | null {
  if (isBuildTime()) {
    return null
  }
  
  if (!_queueEvents) {
    const connection = getRedisConnection()
    if (connection) {
      _queueEvents = new QueueEvents('lead-processor', { connection })
    }
  }
  return _queueEvents
}

const queueEvents = getQueueEvents()

interface LeadJobData {
  leadId: string
  leadData: {
    source: string
    contactName: string
    phone: string
    industry?: string
    serviceType?: string
    urgency?: string
    customFields?: Record<string, any>
  }
  priority: number
  bundleLevel: string
  tenantId: string
  attemptNumber?: number
  originalJobId?: string
}

interface CallStatusJobData {
  callSid: string
  callStatus: string
  callDuration?: number
  outcome?: string
  leadId: string
  tenantId: string
}

interface RetryJobData {
  originalJobData: LeadJobData
  failureReason: string
  nextRetryAt: Date
  retryStrategy: 'immediate' | 'delayed' | 'backoff' | 'smart'
}

/**
 * Lead processing worker - processes incoming leads for voice calls
 */
let _leadWorker: Worker | null = null

function getLeadWorker(): Worker | null {
  if (isBuildTime()) {
    return null
  }
  
  if (!_leadWorker) {
    const connection = getRedisConnection()
    if (!connection) {
      return null
    }
    
    _leadWorker = new Worker(
      'lead-processor',
      async (job: Job<LeadJobData>) => {
    const startTime = Date.now()
    console.log(`🔄 Processing lead job ${job.id}:`, job.data.leadId)
    
    try {
      // Rate limiting check
      const canCall = await rateLimiter.checkCallLimit(
        job.data.tenantId, 
        job.data.priority
      )
      
      if (!canCall.allowed) {
        // Delay job and retry later
        const delay = canCall.retryAfter * 1000
        await job.moveToDelayed(Date.now() + delay)
        console.log(`⏰ Job ${job.id} delayed by ${delay}ms due to rate limit`)
        return { delayed: true, retryAfter: delay }
      }

      // Load lead data
      const lead = await db.customer.findUnique({
        where: { id: job.data.leadId },
        include: {
          callLogs: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      })

      if (!lead) {
        throw new Error(`Lead not found: ${job.data.leadId}`)
      }

      // Duplicate call check
      const recentCall = lead.callLogs.find(call => 
        call.status !== 'FAILED' && 
        call.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      )

      if (recentCall) {
        console.log(`⚠️ Skipping duplicate call for lead ${job.data.leadId}`)
        return { skipped: true, reason: 'duplicate_call', lastCallSid: recentCall.twilioCallSid }
      }

      // Select appropriate script
      const script = scriptManager.selectScript({
        industry: job.data.leadData.industry,
        serviceType: job.data.leadData.serviceType,
        urgency: job.data.leadData.urgency,
        bundleLevel: job.data.bundleLevel
      })

      // Initiate Twilio call
      const callResult = await twilioClient.getInstance().initiateCall({
        to: job.data.leadData.phone,
        from: process.env.TWILIO_PHONE_NUMBER!,
        script: script.id,
        leadId: job.data.leadId,
        tenantId: job.data.tenantId,
        webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/voice/webhook?action=answer`,
        statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/voice/status`,
        metadata: {
          jobId: job.id,
          priority: job.data.priority,
          source: job.data.leadData.source,
          bundleLevel: job.data.bundleLevel
        }
      })

      // Update job progress
      await job.updateProgress(50)

      // Store call record
      const callRecord = await db.callLog.create({
        data: {
          tenantId: job.data.tenantId,
          twilioCallSid: callResult.sid,
          callDirection: 'OUTBOUND',
          fromNumber: callResult.from,
          toNumber: callResult.to,
          customerId: job.data.leadId,
          status: 'INITIATED',
          scriptId: script.id,
          startedAt: new Date(),
          metadata: {
            jobId: job.id,
            script: script.name,
            priority: job.data.priority,
            source: job.data.leadData.source,
            bundleLevel: job.data.bundleLevel,
            leadData: job.data.leadData
          }
        }
      })

      // Queue call status monitoring
      await callStatusQueue.add(
        'monitor-call-status',
        {
          callSid: callResult.sid,
          callStatus: 'initiated',
          leadId: job.data.leadId,
          tenantId: job.data.tenantId
        },
        {
          delay: 30000, // Check status after 30 seconds
          attempts: 5,
          backoff: { type: 'fixed', delay: 15000 }
        }
      )

      const processingTime = Date.now() - startTime
      console.log(`✅ Lead ${job.data.leadId} call initiated in ${processingTime}ms (SID: ${callResult.sid})`)

      // Update job progress
      await job.updateProgress(100)

      return {
        success: true,
        callSid: callResult.sid,
        callRecordId: callRecord.id,
        scriptUsed: script.name,
        processingTime
      }
      
    } catch (error) {
      console.error(`❌ Lead processing failed for job ${job.id}:`, error)
      
      // Determine if retry is appropriate
      const shouldRetry = await determineRetryStrategy(job, error)
      
      if (shouldRetry.retry) {
        await retryQueue.add(
          'retry-lead-call',
          {
            originalJobData: job.data,
            failureReason: error.message,
            nextRetryAt: shouldRetry.nextRetryAt,
            retryStrategy: shouldRetry.strategy
          },
          {
            delay: shouldRetry.delay,
            attempts: 1 // Retry queue handles its own retry logic
          }
        )
      }

      throw error
    }
  },
      {
        connection,
        concurrency: parseInt(process.env.QUEUE_CONCURRENCY || '10'),
        limiter: {
          max: 100,      // Max 100 jobs per window
          duration: 60000 // 1 minute window
        }
      }
    )
  }
  
  return _leadWorker
}

const leadWorker = getLeadWorker()

/**
 * Call status monitoring worker
 */
let _callStatusWorker: Worker | null = null

function getCallStatusWorker(): Worker | null {
  if (isBuildTime()) {
    return null
  }
  
  if (!_callStatusWorker) {
    const connection = getRedisConnection()
    if (!connection) {
      return null
    }
    
    _callStatusWorker = new Worker(
      'call-status', 
      async (job: Job<CallStatusJobData>) => {
    console.log(`📊 Monitoring call status: ${job.data.callSid}`)
    
    try {
      // Get current call status from Twilio
      const call = await twilioClient.getInstance().getCallStatus(job.data.callSid)
      
      // Update call record
      await db.callLog.update({
        where: { twilioCallSid: job.data.callSid },
        data: {
          status: call.status.toUpperCase(),
          answeredAt: call.dateUpdated ? new Date(call.dateUpdated) : null,
          endedAt: ['completed', 'busy', 'failed', 'no-answer'].includes(call.status) 
            ? new Date() : null,
          duration: call.duration ? parseInt(call.duration) : null,
          cost: call.price ? Math.abs(parseFloat(call.price)) : null
        }
      })

      // If call is still in progress, schedule another check
      if (['queued', 'ringing', 'in-progress'].includes(call.status)) {
        await callStatusQueue.add(
          'monitor-call-status',
          job.data,
          { delay: 30000, attempts: 3 }
        )
      } else {
        console.log(`📞 Call ${job.data.callSid} completed with status: ${call.status}`)
        
        // Trigger post-call processing if needed
        await processCallCompletion(job.data.callSid, call.status, job.data.leadId)
      }
      
      return { callStatus: call.status, updated: true }
      
    } catch (error) {
      console.error(`Call status monitoring error for ${job.data.callSid}:`, error)
      throw error
    }
  },
      {
        connection,
        concurrency: 20
      }
    )
  }
  
  return _callStatusWorker
}

const callStatusWorker = getCallStatusWorker()

/**
 * Retry processing worker with intelligent retry logic
 */
let _retryWorker: Worker | null = null

function getRetryWorker(): Worker | null {
  if (isBuildTime()) {
    return null
  }
  
  if (!_retryWorker) {
    const connection = getRedisConnection()
    if (!connection) {
      return null
    }
    
    _retryWorker = new Worker(
      'call-retry',
      async (job: Job<RetryJobData>) => {
    console.log(`🔄 Processing retry job ${job.id} for lead ${job.data.originalJobData.leadId}`)
    
    try {
      // Enhanced job data for retry
      const retryJobData: LeadJobData = {
        ...job.data.originalJobData,
        attemptNumber: (job.data.originalJobData.attemptNumber || 0) + 1,
        originalJobId: job.data.originalJobData.originalJobId || job.id
      }
      
      // Re-queue with higher priority and retry metadata
      const newJob = await leadQueue.add(
        'process-lead-call',
        retryJobData,
        {
          priority: Math.max(1, job.data.originalJobData.priority - 1), // Higher priority
          attempts: 2, // Fewer attempts for retries
          backoff: { type: 'fixed', delay: 30000 }
        }
      )
      
      console.log(`🔄 Lead ${job.data.originalJobData.leadId} re-queued as job ${newJob.id}`)
      
      return {
        success: true,
        newJobId: newJob.id,
        attemptNumber: retryJobData.attemptNumber
      }
      
    } catch (error) {
      console.error(`Retry processing failed for lead ${job.data.originalJobData.leadId}:`, error)
      throw error
    }
  },
      {
        connection,
        concurrency: 5
      }
    )
  }
  
  return _retryWorker
}

const retryWorker = getRetryWorker()

/**
 * Determine retry strategy based on error type and job history
 */
async function determineRetryStrategy(
  job: Job<LeadJobData>, 
  error: any
): Promise<{
  retry: boolean
  strategy: 'immediate' | 'delayed' | 'backoff' | 'smart'
  delay: number
  nextRetryAt: Date
}> {
  const attemptNumber = job.data.attemptNumber || 0
  
  // Don't retry after 3 attempts
  if (attemptNumber >= 3) {
    return { retry: false, strategy: 'immediate', delay: 0, nextRetryAt: new Date() }
  }
  
  const errorMessage = error.message.toLowerCase()
  
  // Immediate retry for temporary issues
  if (errorMessage.includes('timeout') || errorMessage.includes('connection')) {
    return {
      retry: true,
      strategy: 'immediate',
      delay: 5000, // 5 seconds
      nextRetryAt: new Date(Date.now() + 5000)
    }
  }
  
  // Delayed retry for rate limits
  if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
    return {
      retry: true,
      strategy: 'delayed',
      delay: 60000, // 1 minute
      nextRetryAt: new Date(Date.now() + 60000)
    }
  }
  
  // Smart retry for lead-specific issues
  if (errorMessage.includes('invalid phone') || errorMessage.includes('unreachable')) {
    // Check if we should retry with a different approach
    const lead = await db.customer.findUnique({
      where: { id: job.data.leadId },
      select: { phone: true, customFields: true }
    })
    
    // Don't retry for permanently invalid numbers
    if (errorMessage.includes('invalid phone')) {
      return { retry: false, strategy: 'immediate', delay: 0, nextRetryAt: new Date() }
    }
  }
  
  // Default exponential backoff
  const delay = Math.min(300000, 10000 * Math.pow(2, attemptNumber)) // Max 5 minutes
  
  return {
    retry: true,
    strategy: 'backoff',
    delay,
    nextRetryAt: new Date(Date.now() + delay)
  }
}

/**
 * Process call completion
 */
async function processCallCompletion(callSid: string, status: string, leadId: string) {
  try {
    // Update lead based on call outcome
    const callLog = await db.callLog.findUnique({
      where: { twilioCallSid: callSid },
      include: { customer: true }
    })
    
    if (!callLog) return
    
    // Determine next action based on call status
    let nextAction = 'none'
    let followUpDelay = 0
    
    switch (status) {
      case 'completed':
        // Successful call - check if follow-up needed
        if (callLog.followUpRequired) {
          nextAction = 'schedule_followup'
          followUpDelay = 24 * 60 * 60 * 1000 // 24 hours
        }
        break
        
      case 'no-answer':
      case 'busy':
        // Schedule retry call
        nextAction = 'retry_call'
        followUpDelay = 4 * 60 * 60 * 1000 // 4 hours
        break
        
      case 'failed':
        // Check if number is valid for future retry
        nextAction = 'investigate_number'
        break
    }
    
    if (nextAction !== 'none') {
      console.log(`📅 Scheduling ${nextAction} for lead ${leadId} in ${followUpDelay}ms`)
    }
    
  } catch (error) {
    console.error('Call completion processing error:', error)
  }
}

/**
 * Queue monitoring and health checks
 */
export const queueMonitor = {
  async getStats() {
    if (isBuildTime()) {
      return {
        leadQueue: { waiting: 0, active: 0, completed: 0, failed: 0 },
        redis: { status: 'unavailable', memory: 0 }
      }
    }
    
    const queue = getLeadQueue()
    const connection = getRedisConnection()
    
    if (!queue || !connection) {
      return {
        leadQueue: { waiting: 0, active: 0, completed: 0, failed: 0 },
        redis: { status: 'unavailable', memory: 0 }
      }
    }
    
    const [waiting, active, completed, failed] = await Promise.all([
      queue.getWaiting(),
      queue.getActive(), 
      queue.getCompleted(),
      queue.getFailed()
    ])
    
    return {
      leadQueue: {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length
      },
      redis: {
        status: connection.status,
        memory: await connection.memory('usage')
      }
    }
  },
  
  async pauseQueues() {
    if (isBuildTime()) return
    
    await Promise.all([
      getLeadQueue()?.pause(),
      getCallStatusQueue()?.pause(),
      getRetryQueue()?.pause()
    ].filter(Boolean))
  },
  
  async resumeQueues() {
    if (isBuildTime()) return
    
    await Promise.all([
      getLeadQueue()?.resume(),
      getCallStatusQueue()?.resume(), 
      getRetryQueue()?.resume()
    ].filter(Boolean))
  },
  
  async cleanupJobs() {
    if (isBuildTime()) return
    
    const queue = getLeadQueue()
    if (queue) {
      await Promise.all([
        queue.clean(24 * 60 * 60 * 1000, 100, 'completed'),
        queue.clean(7 * 24 * 60 * 60 * 1000, 50, 'failed')
      ])
    }
  }
}

// Event listeners for monitoring
if (!isBuildTime() && typeof process !== 'undefined') {
  const events = getQueueEvents()
  if (events) {
    events.on('completed', (jobId, returnvalue) => {
      console.log(`✅ Job ${jobId} completed:`, returnvalue)
    })

    events.on('failed', (jobId, failedReason) => {
      console.error(`❌ Job ${jobId} failed:`, failedReason)
    })

    events.on('stalled', (jobId) => {
      console.warn(`⚠️ Job ${jobId} stalled`)
    })
  }
}

// Graceful shutdown
if (!isBuildTime() && typeof process !== 'undefined' && typeof process.on === 'function') {
  process.on('SIGTERM', async () => {
    console.log('🛑 Shutting down queue workers...')
    const workers = [getLeadWorker(), getCallStatusWorker(), getRetryWorker()].filter(Boolean)
    const connection = getRedisConnection()
    
    if (workers.length > 0) {
      await Promise.all(workers.map(worker => worker!.close()))
    }
    
    if (connection) {
      await connection.disconnect()
    }
  })
}