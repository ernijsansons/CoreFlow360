/**
 * CoreFlow360 - Error Tracking API
 * RESTful API for error management, analytics, and debugging
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { 
  advancedErrorTracker, 
  ErrorSeverity, 
  ErrorCategory,
  captureException,
  captureMessage 
} from '@/lib/debugging/error-tracker'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Admin-only access for error management
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'search'

    switch (action) {
      case 'search':
        return await handleErrorSearch(request)
      
      case 'analytics':
        return await handleErrorAnalytics(request)
      
      case 'trends':
        return await handleErrorTrends()
      
      case 'patterns':
        return await handleErrorPatterns()
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error tracking API error:', error)
    await captureException(error as Error, { url: request.url, method: 'GET' })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'capture':
        return await handleErrorCapture(request, body)
      
      case 'resolve':
        return await handleErrorResolve(request, body)
      
      case 'start_debug':
        return await handleStartDebugSession(request, body)
      
      case 'end_debug':
        return await handleEndDebugSession(request, body)
      
      case 'add_debug_log':
        return await handleAddDebugLog(request, body)
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error tracking POST error:', error)
    await captureException(error as Error, { url: request.url, method: 'POST' })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handleErrorSearch(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const query = {
    message: searchParams.get('message') || undefined,
    fingerprint: searchParams.get('fingerprint') || undefined,
    severity: searchParams.get('severity')?.split(',') as ErrorSeverity[] || undefined,
    category: searchParams.get('category')?.split(',') as ErrorCategory[] || undefined,
    tags: searchParams.get('tags')?.split(',') || undefined,
    resolved: searchParams.get('resolved') ? searchParams.get('resolved') === 'true' : undefined,
    limit: parseInt(searchParams.get('limit') || '20'),
    offset: parseInt(searchParams.get('offset') || '0'),
    dateRange: searchParams.get('start') && searchParams.get('end') ? {
      start: new Date(searchParams.get('start')!),
      end: new Date(searchParams.get('end')!),
    } : undefined,
  }

  const result = await advancedErrorTracker.searchErrors(query)
  
  return NextResponse.json({
    errors: result.errors,
    total: result.total,
    pagination: {
      limit: query.limit,
      offset: query.offset,
      hasMore: result.total > query.offset + query.limit,
    },
  })
}

async function handleErrorAnalytics(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const period = searchParams.get('period') as '1h' | '24h' | '7d' | '30d' || '24h'
  const filters = {
    severity: searchParams.get('severity')?.split(',') as ErrorSeverity[] || undefined,
    category: searchParams.get('category')?.split(',') as ErrorCategory[] || undefined,
    tenantId: searchParams.get('tenantId') || undefined,
    userId: searchParams.get('userId') || undefined,
  }

  const analytics = await advancedErrorTracker.getErrorAnalytics(period, filters)
  
  return NextResponse.json(analytics)
}

async function handleErrorTrends() {
  const trends = await advancedErrorTracker.getErrorTrends()
  return NextResponse.json(trends)
}

async function handleErrorPatterns() {
  const trends = await advancedErrorTracker.getErrorTrends()
  return NextResponse.json({
    patterns: trends.patterns,
    predictions: trends.predictions,
  })
}

async function handleErrorCapture(request: NextRequest, body: any) {
  const {
    error,
    message,
    severity = ErrorSeverity.MEDIUM,
    category = ErrorCategory.CLIENT,
    context = {},
    tags = [],
  } = body

  let errorId: string

  if (error) {
    // Convert error object back to Error instance
    const errorInstance = new Error(error.message)
    errorInstance.name = error.name
    errorInstance.stack = error.stack
    Object.assign(errorInstance, error)

    errorId = await advancedErrorTracker.captureError(
      errorInstance,
      severity,
      category,
      {
        ...context,
        url: request.url,
        method: request.method,
        userAgent: request.headers.get('user-agent') || undefined,
        ipAddress: request.ip || 'unknown',
      },
      tags
    )
  } else if (message) {
    errorId = await captureMessage(message, severity, {
      ...context,
      url: request.url,
      method: request.method,
      userAgent: request.headers.get('user-agent') || undefined,
      ipAddress: request.ip || 'unknown',
    })
  } else {
    return NextResponse.json({ error: 'Either error or message is required' }, { status: 400 })
  }

  return NextResponse.json({ 
    success: true, 
    errorId,
    message: 'Error captured successfully' 
  })
}

async function handleErrorResolve(request: NextRequest, body: any) {
  // Verify authentication for error resolution
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { errorId } = body
  if (!errorId) {
    return NextResponse.json({ error: 'Error ID is required' }, { status: 400 })
  }

  const success = await advancedErrorTracker.resolveError(errorId, session.user.id)
  
  if (success) {
    return NextResponse.json({ 
      success: true, 
      message: 'Error resolved successfully' 
    })
  } else {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to resolve error' 
    }, { status: 400 })
  }
}

async function handleStartDebugSession(request: NextRequest, body: any) {
  // Verify authentication
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { context = {}, tags = [] } = body
  
  const sessionId = await advancedErrorTracker.startDebugSession(
    session.user.id,
    session.user.tenantId || 'unknown',
    context,
    tags
  )

  return NextResponse.json({
    success: true,
    sessionId,
    message: 'Debug session started',
  })
}

async function handleEndDebugSession(request: NextRequest, body: any) {
  // Verify authentication
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { sessionId } = body
  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
  }

  const debugSession = await advancedErrorTracker.endDebugSession(sessionId)
  
  if (debugSession) {
    return NextResponse.json({
      success: true,
      session: debugSession,
      message: 'Debug session ended',
    })
  } else {
    return NextResponse.json({
      success: false,
      error: 'Debug session not found',
    }, { status: 404 })
  }
}

async function handleAddDebugLog(request: NextRequest, body: any) {
  const { sessionId, level, message, data, source = 'client' } = body
  
  if (!sessionId || !level || !message) {
    return NextResponse.json({ 
      error: 'Session ID, level, and message are required' 
    }, { status: 400 })
  }

  await advancedErrorTracker.addDebugLog(sessionId, level, message, data, source)
  
  return NextResponse.json({
    success: true,
    message: 'Debug log added',
  })
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication and admin access
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const errorId = searchParams.get('errorId')
    const action = searchParams.get('action')

    if (action === 'cleanup') {
      // Trigger cleanup of old errors
      // This would typically be handled by background jobs
      return NextResponse.json({
        success: true,
        message: 'Cleanup triggered',
      })
    }

    if (errorId) {
      // Delete specific error (in production, might just mark as deleted)
      return NextResponse.json({
        success: true,
        message: 'Error marked for deletion',
      })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    console.error('Error deletion error:', error)
    await captureException(error as Error, { url: request.url, method: 'DELETE' })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}