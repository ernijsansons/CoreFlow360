/**
 * CoreFlow360 - Event Sourcing Administration API
 * Admin endpoints for event store management and auditing
 */

import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/auth'
import { withSignatureValidation } from '@/middleware/request-signature'
import { eventStore } from '@/lib/events/event-store'
import { projectionManager } from '@/lib/events/projections'

async function getHandler(request: NextRequest) {
  try {
    // Require admin permission
    await requirePermission('admin:events')

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'query'

    switch (action) {
      case 'query':
        return handleQueryEvents(searchParams)

      case 'stream':
        const aggregateId = searchParams.get('aggregateId')
        const aggregateType = searchParams.get('aggregateType')
        return handleGetEventStream(aggregateId!, aggregateType!)

      case 'statistics':
        const tenantId = searchParams.get('tenantId')
        return handleGetStatistics(tenantId)

      case 'verify':
        const eventId = searchParams.get('eventId')
        return handleVerifyIntegrity(eventId!)

      case 'projections':
        return handleGetProjections()

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      )
    }

    return NextResponse.json({ error: 'Failed to process events request' }, { status: 500 })
  }
}

async function postHandler(request: NextRequest) {
  try {
    // Require admin permission
    await requirePermission('admin:events')

    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'append':
        return handleAppendEvent(data)

      case 'create_snapshot':
        return handleCreateSnapshot(data)

      case 'rebuild_projections':
        return handleRebuildProjections(data)

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      )
    }

    return NextResponse.json({ error: 'Failed to process events request' }, { status: 500 })
  }
}

async function handleQueryEvents(searchParams: URLSearchParams) {
  try {
    const filters: unknown = {}

    // Extract filter parameters
    if (searchParams.get('aggregateType')) filters.aggregateType = searchParams.get('aggregateType')
    if (searchParams.get('eventType')) filters.eventType = searchParams.get('eventType')
    if (searchParams.get('tenantId')) filters.tenantId = searchParams.get('tenantId')
    if (searchParams.get('userId')) filters.userId = searchParams.get('userId')
    if (searchParams.get('correlationId')) filters.correlationId = searchParams.get('correlationId')

    if (searchParams.get('startTime')) {
      filters.startTime = new Date(searchParams.get('startTime')!)
    }
    if (searchParams.get('endTime')) {
      filters.endTime = new Date(searchParams.get('endTime')!)
    }

    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 1000)
    const offset = parseInt(searchParams.get('offset') || '0')

    filters.limit = limit
    filters.offset = offset

    const result = await eventStore.queryEvents(filters)

    return NextResponse.json({
      success: true,
      data: {
        events: result.events,
        pagination: {
          totalCount: result.totalCount,
          hasMore: result.hasMore,
          limit,
          offset,
        },
      },
    })
  } catch (error) {
    return NextResponse.json({ error: `Query failed: ${error.message}` }, { status: 400 })
  }
}

async function handleGetEventStream(aggregateId: string, aggregateType: string) {
  if (!aggregateId || !aggregateType) {
    return NextResponse.json(
      { error: 'aggregateId and aggregateType are required' },
      { status: 400 }
    )
  }

  try {
    const stream = await eventStore.getEventStream(aggregateId, aggregateType)

    return NextResponse.json({
      success: true,
      data: stream,
    })
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to get event stream: ${error.message}` },
      { status: 400 }
    )
  }
}

async function handleGetStatistics(tenantId?: string) {
  try {
    const statistics = await eventStore.getStatistics(tenantId || undefined)

    return NextResponse.json({
      success: true,
      data: statistics,
      tenantId: tenantId || 'all',
    })
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to get statistics: ${error.message}` },
      { status: 400 }
    )
  }
}

async function handleVerifyIntegrity(eventId: string) {
  if (!eventId) {
    return NextResponse.json({ error: 'eventId is required' }, { status: 400 })
  }

  try {
    const verification = await eventStore.verifyEventIntegrity(eventId)

    return NextResponse.json({
      success: true,
      data: verification,
    })
  } catch (error) {
    return NextResponse.json({ error: `Verification failed: ${error.message}` }, { status: 400 })
  }
}

async function handleGetProjections() {
  try {
    // Get sample data from projections
    const sampleCustomerId = 'sample-customer-id'
    const sampleTenantId = 'sample-tenant-id'
    const today = new Date()

    const [customerReadModel, voiceAnalytics, securityDashboard] = await Promise.allSettled([
      projectionManager.getCustomerReadModel(sampleCustomerId),
      projectionManager.getVoiceCallAnalytics(sampleTenantId, today),
      projectionManager.getSecurityDashboard(sampleTenantId, today),
    ])

    return NextResponse.json({
      success: true,
      data: {
        projections: {
          customerReadModel: {
            status: customerReadModel.status,
            data: customerReadModel.status === 'fulfilled' ? customerReadModel.value : null,
            error:
              customerReadModel.status === 'rejected' ? customerReadModel.reason?.message : null,
          },
          voiceAnalytics: {
            status: voiceAnalytics.status,
            data: voiceAnalytics.status === 'fulfilled' ? voiceAnalytics.value : null,
            error: voiceAnalytics.status === 'rejected' ? voiceAnalytics.reason?.message : null,
          },
          securityDashboard: {
            status: securityDashboard.status,
            data: securityDashboard.status === 'fulfilled' ? securityDashboard.value : null,
            error:
              securityDashboard.status === 'rejected' ? securityDashboard.reason?.message : null,
          },
        },
        summary: {
          totalProjections: 3,
          healthy: [customerReadModel, voiceAnalytics, securityDashboard].filter(
            (p) => p.status === 'fulfilled'
          ).length,
        },
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to get projections: ${error.message}` },
      { status: 400 }
    )
  }
}

async function handleAppendEvent(data: unknown) {
  try {
    const { aggregateId, aggregateType, eventType, eventData, metadata, expectedVersion } = data

    if (!aggregateId || !aggregateType || !eventType || !eventData) {
      return NextResponse.json(
        { error: 'Missing required fields: aggregateId, aggregateType, eventType, eventData' },
        { status: 400 }
      )
    }

    const event = await eventStore.appendEvent(
      aggregateId,
      aggregateType,
      eventType,
      eventData,
      metadata || {},
      expectedVersion
    )

    return NextResponse.json({
      success: true,
      data: event,
      message: 'Event appended successfully',
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to append event',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 }
    )
  }
}

async function handleCreateSnapshot(data: unknown) {
  try {
    const { aggregateId, aggregateType, version, state } = data

    if (!aggregateId || !aggregateType || version === undefined || !state) {
      return NextResponse.json(
        { error: 'Missing required fields: aggregateId, aggregateType, version, state' },
        { status: 400 }
      )
    }

    const snapshot = await eventStore.createSnapshot(aggregateId, aggregateType, version, state)

    return NextResponse.json({
      success: true,
      data: snapshot,
      message: 'Snapshot created successfully',
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to create snapshot',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 }
    )
  }
}

async function handleRebuildProjections(data: unknown) {
  try {
    const { fromDate } = data

    const startDate = fromDate ? new Date(fromDate) : undefined

    // Start projection rebuild in background
    projectionManager.rebuildProjections(startDate)

    return NextResponse.json({
      success: true,
      message: 'Projection rebuild started',
      fromDate: startDate?.toISOString() || 'beginning',
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to start projection rebuild',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 }
    )
  }
}

// Apply high security signature validation to event sourcing endpoints
export const GET = withSignatureValidation(getHandler, {
  highSecurity: true,
  skipInDevelopment: false,
})

export const POST = withSignatureValidation(postHandler, {
  highSecurity: true,
  skipInDevelopment: false,
})
