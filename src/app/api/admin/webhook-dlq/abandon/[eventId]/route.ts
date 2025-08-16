/**
 * CoreFlow360 - DLQ Manual Abandon API
 * Manually abandon a specific failed webhook event
 */

import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/auth'
import { deadLetterQueue } from '@/lib/webhook-dlq/dead-letter-queue'
import { z } from 'zod'

const abandonSchema = z.object({
  reason: z.string().min(1, 'Reason is required').max(500, 'Reason too long')
})

interface RouteParams {
  params: {
    eventId: string
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Require admin permission
    const session = await requirePermission('admin:webhook-dlq')
    
    const { eventId } = params
    
    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    const { reason } = abandonSchema.parse(body)
    
    await deadLetterQueue.manualAbandon(eventId, reason)
    
    // Log the manual abandon action
    console.log(`Manual DLQ abandon by ${session.user.email} for event ${eventId}: ${reason}`)
    
    return NextResponse.json({
      success: true,
      message: 'Event abandoned successfully',
      eventId,
      reason
    })
  } catch (error) {
    console.error('Failed to abandon DLQ event:', error)
    
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      )
    }
    
    if (error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to abandon event' },
      { status: 500 }
    )
  }
}