/**
 * CoreFlow360 - Event Tracking API Endpoint
 * High-performance event ingestion with validation and real-time processing
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { headers } from 'next/headers'
import { rateLimit } from '@/lib/rate-limiting/rate-limiter'
import { eventTracker, BaseEventSchema } from '@/lib/events/enhanced-event-tracker'
import { validateApiKey } from '@/lib/auth/api-key-validation'

// Request validation schema
const TrackEventRequestSchema = z.object({
  events: z.array(BaseEventSchema).min(1).max(100), // Max 100 events per request
  source: z.enum(['web_app', 'mobile_app', 'server', 'webhook']).optional(),
  apiKey: z.string().optional(),
})

const SingleEventRequestSchema = z.object({
  event: BaseEventSchema,
  source: z.enum(['web_app', 'mobile_app', 'server', 'webhook']).optional(),
  apiKey: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = request.ip || headers().get('x-forwarded-for') || 'unknown'
    const rateLimitResult = await rateLimit(
      `events:${clientIP}`,
      1000, // 1000 events per minute per IP
      60
    )

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          resetTime: rateLimitResult.resetTime,
          remainingRequests: rateLimitResult.remaining,
        },
        { status: 429 }
      )
    }

    // Parse request body
    const body = await request.json()

    // Validate API key for server-to-server requests
    if (body.source === 'server' || body.apiKey) {
      const isValidApiKey = await validateApiKey(body.apiKey)
      if (!isValidApiKey) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
      }
    }

    // Handle batch events
    if (body.events) {
      const validation = TrackEventRequestSchema.safeParse(body)

      if (!validation.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: validation.error.issues,
          },
          { status: 400 }
        )
      }

      // Process batch
      await eventTracker.trackBatch(validation.data.events)

      return NextResponse.json({
        success: true,
        eventsProcessed: validation.data.events.length,
        message: 'Events tracked successfully',
      })
    }

    // Handle single event
    if (body.event) {
      const validation = SingleEventRequestSchema.safeParse(body)

      if (!validation.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: validation.error.issues,
          },
          { status: 400 }
        )
      }

      // Process single event
      await eventTracker.track(validation.data.event)

      return NextResponse.json({
        success: true,
        eventsProcessed: 1,
        message: 'Event tracked successfully',
      })
    }

    return NextResponse.json({ error: 'No events provided' }, { status: 400 })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// GET endpoint for health check and basic analytics
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const timeframe = (searchParams.get('timeframe') as 'hour' | 'day' | 'week') || 'day'

    // Get analytics
    const analytics = await eventTracker.getAnalytics(timeframe)

    return NextResponse.json({
      status: 'healthy',
      analytics,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to retrieve analytics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}
