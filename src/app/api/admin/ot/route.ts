/**
 * CoreFlow360 - Operational Transform API
 * Real-time collaboration and conflict resolution endpoints
 */

import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/auth'
import { withSignatureValidation } from '@/middleware/request-signature'
import { otEngine, OperationalTransform } from '@/lib/ot/operational-transform'
import { conflictResolver } from '@/lib/ot/conflict-resolution'

async function getHandler(request: NextRequest) {
  try {
    // Require admin permission
    await requirePermission('admin:collaboration')

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'status'

    switch (action) {
      case 'status':
        return handleGetStatus()

      case 'document':
        const docId = searchParams.get('docId')
        const userId = searchParams.get('userId')
        return handleGetDocument(docId!, userId!)

      case 'operations':
        const documentId = searchParams.get('documentId')
        const sinceRevision = parseInt(searchParams.get('sinceRevision') || '0')
        return handleGetOperations(documentId!, sinceRevision)

      case 'conflicts':
        return handleGetConflicts()

      case 'statistics':
        return handleGetStatistics()

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

    return NextResponse.json({ error: 'Failed to process OT request' }, { status: 500 })
  }
}

async function postHandler(request: NextRequest) {
  try {
    // Require admin permission
    await requirePermission('admin:collaboration')

    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'apply_operation':
        return handleApplyOperation(data)

      case 'create_document':
        return handleCreateDocument(data)

      case 'join_document':
        return handleJoinDocument(data)

      case 'leave_document':
        return handleLeaveDocument(data)

      case 'resolve_conflict':
        return handleResolveConflict(data)

      case 'detect_conflicts':
        return handleDetectConflicts(data)

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

    return NextResponse.json({ error: 'Failed to process OT request' }, { status: 500 })
  }
}

async function handleGetStatus() {
  const statistics = otEngine.getStatistics()
  const conflictStats = conflictResolver.getConflictStatistics()

  return NextResponse.json({
    success: true,
    data: {
      operationalTransform: {
        status: 'active',
        ...statistics,
      },
      conflictResolution: {
        status: 'active',
        ...conflictStats,
      },
      health: {
        otEngine: 'healthy',
        conflictResolver: 'healthy',
      },
    },
  })
}

async function handleGetDocument(docId: string, userId: string) {
  if (!docId || !userId) {
    return NextResponse.json({ error: 'docId and userId are required' }, { status: 400 })
  }

  try {
    const documentSync = otEngine.getDocumentSync(docId, userId)

    return NextResponse.json({
      success: true,
      data: documentSync,
    })
  } catch (error) {
    return NextResponse.json({ error: `Failed to get document: ${error.message}` }, { status: 400 })
  }
}

async function handleGetOperations(documentId: string, sinceRevision: number) {
  if (!documentId) {
    return NextResponse.json({ error: 'documentId is required' }, { status: 400 })
  }

  try {
    const operations = otEngine.getOperationsSince(documentId, sinceRevision)

    return NextResponse.json({
      success: true,
      data: {
        operations,
        totalCount: operations.length,
        sinceRevision,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to get operations: ${error.message}` },
      { status: 400 }
    )
  }
}

async function handleGetConflicts() {
  try {
    const statistics = conflictResolver.getConflictStatistics()

    return NextResponse.json({
      success: true,
      data: {
        statistics,
        summary: {
          totalConflicts: statistics.totalConflicts,
          autoResolvedPercentage:
            statistics.totalConflicts > 0
              ? Math.round((statistics.autoResolvedCount / statistics.totalConflicts) * 100)
              : 0,
          manualResolvedPercentage:
            statistics.totalConflicts > 0
              ? Math.round((statistics.manualResolvedCount / statistics.totalConflicts) * 100)
              : 0,
        },
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to get conflicts: ${error.message}` },
      { status: 400 }
    )
  }
}

async function handleGetStatistics() {
  const otStats = otEngine.getStatistics()
  const conflictStats = conflictResolver.getConflictStatistics()

  return NextResponse.json({
    success: true,
    data: {
      operationalTransform: otStats,
      conflictResolution: conflictStats,
      combined: {
        totalActivity: otStats.totalOperations + conflictStats.totalConflicts,
        averageUsersPerDocument:
          otStats.activeDocuments > 0
            ? Math.round((otStats.totalUsers / otStats.activeDocuments) * 100) / 100
            : 0,
        conflictRate:
          otStats.totalOperations > 0
            ? Math.round((conflictStats.totalConflicts / otStats.totalOperations) * 10000) / 100
            : 0,
      },
    },
  })
}

async function handleApplyOperation(data: unknown) {
  try {
    const { documentId, operation } = data

    if (!documentId || !operation) {
      return NextResponse.json({ error: 'documentId and operation are required' }, { status: 400 })
    }

    const result = await otEngine.applyOperation(documentId, operation)

    return NextResponse.json({
      success: result.success,
      data: result,
      message: result.success ? 'Operation applied successfully' : 'Operation failed',
    })
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to apply operation: ${error.message}` },
      { status: 400 }
    )
  }
}

async function handleCreateDocument(data: unknown) {
  try {
    const { docId, type, initialContent } = data

    if (!docId || !type) {
      return NextResponse.json({ error: 'docId and type are required' }, { status: 400 })
    }

    const document = otEngine.getDocument(docId, type, initialContent)

    return NextResponse.json({
      success: true,
      data: document,
      message: 'Document created successfully',
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to create document',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 }
    )
  }
}

async function handleJoinDocument(data: unknown) {
  try {
    const { docId, userId } = data

    if (!docId || !userId) {
      return NextResponse.json({ error: 'docId and userId are required' }, { status: 400 })
    }

    const document = otEngine.joinDocument(docId, userId)

    return NextResponse.json({
      success: true,
      data: document,
      message: 'Joined document successfully',
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to join document',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 }
    )
  }
}

async function handleLeaveDocument(data: unknown) {
  try {
    const { docId, userId } = data

    if (!docId || !userId) {
      return NextResponse.json({ error: 'docId and userId are required' }, { status: 400 })
    }

    otEngine.leaveDocument(docId, userId)

    return NextResponse.json({
      success: true,
      message: 'Left document successfully',
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to leave document',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 }
    )
  }
}

async function handleResolveConflict(data: unknown) {
  try {
    const { conflicts, strategy } = data

    if (!conflicts || !Array.isArray(conflicts)) {
      return NextResponse.json({ error: 'conflicts array is required' }, { status: 400 })
    }

    const result = await conflictResolver.resolveConflicts(conflicts, strategy)

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Conflicts processed successfully',
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to resolve conflicts',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 }
    )
  }
}

async function handleDetectConflicts(data: unknown) {
  try {
    const { entityType, entityId, localChanges, remoteChanges, baseState, context } = data

    if (!entityType || !entityId || !localChanges || !remoteChanges || !baseState || !context) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: entityType, entityId, localChanges, remoteChanges, baseState, context',
        },
        { status: 400 }
      )
    }

    const conflicts = conflictResolver.detectConflicts(
      entityType,
      entityId,
      localChanges,
      remoteChanges,
      baseState,
      context
    )

    return NextResponse.json({
      success: true,
      data: {
        conflicts,
        totalConflicts: conflicts.length,
        autoResolvable: conflicts.filter((c) => c.autoResolvable).length,
        requiresManual: conflicts.filter((c) => !c.autoResolvable).length,
      },
      message: `Detected ${conflicts.length} conflicts`,
    })
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to detect conflicts: ${error.message}` },
      { status: 400 }
    )
  }
}

// Apply high security signature validation to OT endpoints
export const GET = withSignatureValidation(getHandler, {
  highSecurity: true,
  skipInDevelopment: false,
})

export const POST = withSignatureValidation(postHandler, {
  highSecurity: true,
  skipInDevelopment: false,
})
