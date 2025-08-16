/**
 * CoreFlow360 - DLQ Metrics API
 * Get Dead Letter Queue metrics and statistics
 */

import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/auth'
import { deadLetterQueue } from '@/lib/webhook-dlq/dead-letter-queue'

export async function GET(request: NextRequest) {
  try {
    // Require admin permission
    await requirePermission('admin:webhook-dlq')
    
    const metrics = await deadLetterQueue.getMetrics()
    
    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Failed to get DLQ metrics:', error)
    
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to get DLQ metrics' },
      { status: 500 }
    )
  }
}