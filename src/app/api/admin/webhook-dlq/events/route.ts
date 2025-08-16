/**
 * CoreFlow360 - DLQ Events API
 * Get Dead Letter Queue events by status
 */

import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/auth'
import { deadLetterQueue } from '@/lib/webhook-dlq/dead-letter-queue'

export async function GET(request: NextRequest) {
  try {
    // Require admin permission
    await requirePermission('admin:webhook-dlq')
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as 'pending' | 'recovered' | 'abandoned'
    const limit = parseInt(searchParams.get('limit') || '50')
    
    if (!status || !['pending', 'recovered', 'abandoned'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status parameter. Must be: pending, recovered, or abandoned' },
        { status: 400 }
      )
    }
    
    const events = await deadLetterQueue.getEventsByStatus(status, limit)
    
    return NextResponse.json(events)
  } catch (error) {
    console.error('Failed to get DLQ events:', error)
    
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to get DLQ events' },
      { status: 500 }
    )
  }
}