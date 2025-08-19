/**
 * CoreFlow360 - Batch Event Processing API
 * High-throughput batch processing for analytics events
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { headers } from 'next/headers'
import { rateLimit } from '@/lib/rate-limiting/rate-limiter'
import { eventTracker, BaseEventSchema } from '@/lib/events/enhanced-event-tracker'
import { validateApiKey } from '@/lib/auth/api-key-validation'
import { redis } from '@/lib/cache/unified-redis'

// Batch processing schema
const BatchEventRequestSchema = z.object({
  events: z.array(BaseEventSchema).min(1).max(1000), // Max 1000 events per batch
  batchId: z.string().optional(),
  source: z.enum(['web_app', 'mobile_app', 'server', 'webhook', 'offline_sync']),
  apiKey: z.string().optional(),
  retryAttempt: z.number().optional().default(0),
  processingOptions: z
    .object({
      immediate: z.boolean().optional().default(false),
      deduplication: z.boolean().optional().default(true),
      validation: z.boolean().optional().default(true),
    })
    .optional()
    .default({}),
})

// Deduplication window (1 hour)
const DEDUP_WINDOW_SECONDS = 3600

export async function POST(request: NextRequest) {
  try {
    // Enhanced rate limiting for batch requests
    const clientIP = request.ip || headers().get('x-forwarded-for') || 'unknown'
    const rateLimitResult = await rateLimit(
      `batch_events:${clientIP}`,
      10, // 10 batch requests per minute
      60
    )

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded for batch requests',
          resetTime: rateLimitResult.resetTime,
          remainingRequests: rateLimitResult.remaining,
        },
        { status: 429 }
      )
    }

    // Parse and validate request
    const body = await request.json()
    const validation = BatchEventRequestSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.issues,
        },
        { status: 400 }
      )
    }

    const { events, batchId, source, apiKey, retryAttempt, processingOptions } = validation.data

    // Validate API key for server requests
    if (source === 'server' || apiKey) {
      const isValidApiKey = await validateApiKey(apiKey)
      if (!isValidApiKey) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
      }
    }

    // Generate batch ID if not provided
    const finalBatchId = batchId || `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Check for duplicate batch processing
    if (processingOptions.deduplication) {
      const isDuplicate = await checkBatchDuplication(finalBatchId)
      if (isDuplicate) {
        return NextResponse.json({
          success: true,
          message: 'Batch already processed (deduplication)',
          batchId: finalBatchId,
          eventsProcessed: 0,
          duplicateDetected: true,
        })
      }
    }

    // Deduplication of individual events
    let uniqueEvents = events
    if (processingOptions.deduplication) {
      uniqueEvents = await deduplicateEvents(events)
    }

    // Validation of events (optional for performance)
    let validEvents = uniqueEvents
    if (processingOptions.validation) {
      validEvents = validateEvents(uniqueEvents)
    }

    // Track batch processing start
    await trackBatchProcessingStart(finalBatchId, validEvents.length, source)

    try {
      // Process events with error handling
      const processingResult = await processBatchEvents(validEvents, {
        batchId: finalBatchId,
        source,
        immediate: processingOptions.immediate,
        retryAttempt,
      })

      // Track successful processing
      await trackBatchProcessingComplete(finalBatchId, processingResult)

      // Mark batch as processed for deduplication
      if (processingOptions.deduplication) {
        await markBatchProcessed(finalBatchId)
      }

      return NextResponse.json({
        success: true,
        batchId: finalBatchId,
        eventsReceived: events.length,
        eventsDeduped: events.length - uniqueEvents.length,
        eventsInvalid: uniqueEvents.length - validEvents.length,
        eventsProcessed: processingResult.processed,
        eventsFailed: processingResult.failed,
        processingTime: processingResult.processingTime,
        revenueImpact: processingResult.revenueImpact,
        warnings: processingResult.warnings,
      })
    } catch (processingError) {
      // Handle processing failures
      await trackBatchProcessingError(finalBatchId, processingError)

      // Queue for retry if not a permanent failure
      if (retryAttempt < 3 && !isPermanentError(processingError)) {
        await queueBatchForRetry(finalBatchId, body, retryAttempt + 1)

        return NextResponse.json(
          {
            success: false,
            error: 'Processing failed, queued for retry',
            batchId: finalBatchId,
            retryAttempt: retryAttempt + 1,
            retryScheduled: true,
          },
          { status: 202 }
        )
      }

      throw processingError
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Batch processing failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// GET endpoint for batch status
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const batchId = searchParams.get('batchId')

    if (!batchId) {
      // Return batch processing statistics
      const stats = await getBatchProcessingStats()
      return NextResponse.json(stats)
    }

    // Return specific batch status
    const batchStatus = await getBatchStatus(batchId)

    if (!batchStatus) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
    }

    return NextResponse.json(batchStatus)
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to retrieve batch status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Helper functions
async function checkBatchDuplication(batchId: string): Promise<boolean> {
  const key = `batch_processed:${batchId}`
  const exists = await redis.exists(key)
  return exists === 1
}

async function deduplicateEvents(events: unknown[]): Promise<unknown[]> {
  const uniqueEvents: unknown[] = []
  const seenEventIds = new Set<string>()

  for (const event of events) {
    // Check Redis for recent duplicate
    const dedupKey = `event_dedup:${event.eventId || 'no_id'}`
    const exists = await redis.get(dedupKey)

    if (!exists && !seenEventIds.has(event.eventId)) {
      uniqueEvents.push(event)
      seenEventIds.add(event.eventId)

      // Mark as seen for deduplication window
      await redis.setex(dedupKey, DEDUP_WINDOW_SECONDS, '1')
    }
  }

  return uniqueEvents
}

function validateEvents(events: unknown[]): unknown[] {
  const validEvents: unknown[] = []

  for (const event of events) {
    try {
      const validated = BaseEventSchema.parse(event)
      validEvents.push(validated)
    } catch (error) {}
  }

  return validEvents
}

async function processBatchEvents(
  events: unknown[],
  options: {
    batchId: string
    source: string
    immediate: boolean
    retryAttempt: number
  }
): Promise<{
  processed: number
  failed: number
  processingTime: number
  revenueImpact: number
  warnings: string[]
}> {
  const startTime = Date.now()
  let processed = 0
  let failed = 0
  let revenueImpact = 0
  const warnings: string[] = []

  try {
    // Process in chunks for better performance
    const chunkSize = 100
    const chunks = []

    for (let i = 0; i < events.length; i += chunkSize) {
      chunks.push(events.slice(i, i + chunkSize))
    }

    // Process chunks in parallel
    const chunkPromises = chunks.map(async (chunk, index) => {
      try {
        await eventTracker.trackBatch(chunk)

        // Calculate revenue impact
        const chunkRevenue = chunk.reduce((sum, event) => {
          return sum + (event.properties?.conversionValue || 0)
        }, 0)

        return {
          processed: chunk.length,
          failed: 0,
          revenueImpact: chunkRevenue,
          warnings: [],
        }
      } catch (error) {
        warnings.push(`Chunk ${index} failed: ${error}`)
        return {
          processed: 0,
          failed: chunk.length,
          revenueImpact: 0,
          warnings: [`Chunk ${index} processing failed`],
        }
      }
    })

    const results = await Promise.all(chunkPromises)

    // Aggregate results
    processed = results.reduce((sum, r) => sum + r.processed, 0)
    failed = results.reduce((sum, r) => sum + r.failed, 0)
    revenueImpact = results.reduce((sum, r) => sum + r.revenueImpact, 0)
    warnings.push(...results.flatMap((r) => r.warnings))
  } catch (error) {
    failed = events.length
    warnings.push(`Batch processing failed: ${error}`)
  }

  return {
    processed,
    failed,
    processingTime: Date.now() - startTime,
    revenueImpact,
    warnings,
  }
}

async function trackBatchProcessingStart(
  batchId: string,
  eventCount: number,
  source: string
): Promise<void> {
  await redis.hset(`batch_status:${batchId}`, {
    status: 'processing',
    startTime: Date.now(),
    eventCount,
    source,
  })
}

async function trackBatchProcessingComplete(batchId: string, result: unknown): Promise<void> {
  await redis.hset(`batch_status:${batchId}`, {
    status: 'completed',
    endTime: Date.now(),
    processed: result.processed,
    failed: result.failed,
    processingTime: result.processingTime,
    revenueImpact: result.revenueImpact,
  })

  // Expire after 24 hours
  await redis.expire(`batch_status:${batchId}`, 86400)
}

async function trackBatchProcessingError(batchId: string, error: unknown): Promise<void> {
  await redis.hset(`batch_status:${batchId}`, {
    status: 'failed',
    endTime: Date.now(),
    error: error.message || 'Unknown error',
  })
}

async function markBatchProcessed(batchId: string): Promise<void> {
  const key = `batch_processed:${batchId}`
  await redis.setex(key, DEDUP_WINDOW_SECONDS, '1')
}

async function queueBatchForRetry(
  batchId: string,
  originalRequest: unknown,
  retryAttempt: number
): Promise<void> {
  const retryKey = `batch_retry:${batchId}:${retryAttempt}`
  const retryData = {
    ...originalRequest,
    retryAttempt,
    originalBatchId: batchId,
    queuedAt: Date.now(),
  }

  // Queue for retry in 30 seconds * retry attempt (exponential backoff)
  const delay = 30 * Math.pow(2, retryAttempt - 1)
  await redis.setex(retryKey, delay, JSON.stringify(retryData))
}

async function getBatchStatus(batchId: string): Promise<unknown> {
  const status = await redis.hgetall(`batch_status:${batchId}`)
  return Object.keys(status).length > 0 ? status : null
}

async function getBatchProcessingStats(): Promise<unknown> {
  // Get stats from Redis
  const stats = {
    totalBatchesProcessed: (await redis.get('stats:batches:total')) || '0',
    totalEventsProcessed: (await redis.get('stats:events:total')) || '0',
    averageProcessingTime: (await redis.get('stats:avg_processing_time')) || '0',
    totalRevenueImpact: (await redis.get('stats:revenue:total')) || '0',
    errorRate: (await redis.get('stats:error_rate')) || '0',
    lastProcessedBatch: (await redis.get('stats:last_batch_time')) || '0',
  }

  return stats
}

function isPermanentError(error: unknown): boolean {
  // Define which errors should not be retried
  const permanentErrors = ['ValidationError', 'AuthenticationError', 'PermissionError']

  return permanentErrors.some(
    (errorType) => error.name === errorType || error.message?.includes(errorType)
  )
}

export { POST as default }
