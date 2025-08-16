/**
 * CoreFlow360 - DLQ Manual Retry API
 * Manually retry a specific failed webhook event
 */

import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/auth'
import { deadLetterQueue } from '@/lib/webhook-dlq/dead-letter-queue'

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
    
    const success = await deadLetterQueue.manualRetry(eventId)
    
    // Log the manual retry action
    console.log(`Manual DLQ retry initiated by ${session.user.email} for event ${eventId}`)
    
    return NextResponse.json({
      success,
      message: success ? 'Event retry initiated successfully' : 'Event retry failed',
      eventId
    })
  } catch (error) {
    console.error('Failed to retry DLQ event:', error)
    
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
    
    return NextResponse.json(
      { error: 'Failed to retry event' },
      { status: 500 }
    )
  }
}