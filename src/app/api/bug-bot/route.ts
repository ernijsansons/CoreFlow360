/**
 * CoreFlow360 - Bug Bot API Routes
 * Handle bug reporting, management, and monitoring
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { z } from 'zod'
import { bugBot, type BugReport } from '@/lib/bug-bot/bug-bot'
import { rateLimit } from '@/lib/rate-limiting/rate-limiter'
import { logger } from '@/lib/logging/logger'

// ============================================================================
// SCHEMAS
// ============================================================================

const BugReportSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  category: z.enum([
    'UI_UX', 'API', 'DATABASE', 'PERFORMANCE', 'SECURITY', 
    'INTEGRATION', 'AUTHENTICATION', 'PAYMENT', 'AI_ML', 
    'CONSCIOUSNESS', 'BUSINESS_LOGIC', 'INFRASTRUCTURE'
  ]).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  tags: z.array(z.string()).optional(),
  technicalDetails: z.object({
    errorMessage: z.string().optional(),
    stackTrace: z.string().optional(),
    componentName: z.string().optional(),
    apiEndpoint: z.string().optional(),
    databaseQuery: z.string().optional(),
    performanceMetrics: z.object({
      responseTime: z.number().optional(),
      memoryUsage: z.number().optional(),
      cpuUsage: z.number().optional()
    }).optional()
  }).optional(),
  businessImpact: z.object({
    affectedUsers: z.number().optional(),
    revenueImpact: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    featureImpact: z.array(z.string()).optional(),
    customerImpact: z.string().optional()
  }).optional(),
  reproductionSteps: z.array(z.string()).optional(),
  expectedBehavior: z.string().optional(),
  actualBehavior: z.string().optional(),
  metadata: z.object({
    userId: z.string().optional(),
    tenantId: z.string().optional(),
    sessionId: z.string().optional(),
    userAgent: z.string().optional(),
    url: z.string().optional(),
    environment: z.enum(['development', 'staging', 'production']).optional(),
    browser: z.string().optional(),
    os: z.string().optional(),
    screenResolution: z.string().optional(),
    networkType: z.string().optional()
  }).optional()
})

const BugUpdateSchema = z.object({
  status: z.enum([
    'NEW', 'TRIAGED', 'IN_PROGRESS', 'REVIEW', 'TESTING', 
    'RESOLVED', 'VERIFIED', 'CLOSED', 'DUPLICATE', 'WONT_FIX'
  ]).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  tags: z.array(z.string()).optional(),
  resolution: z.object({
    description: z.string(),
    fixType: z.enum(['HOTFIX', 'PATCH', 'FEATURE_UPDATE', 'CONFIGURATION']),
    codeChanges: z.array(z.string()).optional(),
    testingSteps: z.array(z.string()),
    rollbackPlan: z.string().optional()
  }).optional()
})

// ============================================================================
// API ROUTES
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const clientIP = request.ip || headers().get('x-forwarded-for') || 'unknown'
    
    // Rate limiting
    const rateLimitResult = await rateLimit(request, {
      requests: 50,
      window: 60
    })

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          resetTime: rateLimitResult.resetTime
        },
        { status: 429 }
      )
    }

    const body = await request.json()
    const url = new URL(request.url)
    const endpoint = url.pathname.split('/').pop()

    switch (endpoint) {
      case 'report':
        return await handleBugReport(body)
      
      case 'update':
        return await handleBugUpdate(body)
      
      case 'start':
        return await handleStartBot()
      
      case 'stop':
        return await handleStopBot()
      
      case 'status':
        return await handleBotStatus()
      
      default:
        return NextResponse.json(
          { error: 'Invalid endpoint' },
          { status: 404 }
        )
    }

  } catch (error) {
    logger.error('Bug bot API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const clientIP = request.ip || headers().get('x-forwarded-for') || 'unknown'
    
    // Rate limiting
    const rateLimitResult = await rateLimit(request, {
      requests: 100,
      window: 60
    })

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          resetTime: rateLimitResult.resetTime
        },
        { status: 429 }
      )
    }

    const url = new URL(request.url)
    const endpoint = url.pathname.split('/').pop()
    const searchParams = url.searchParams

    switch (endpoint) {
      case 'bugs':
        return await handleGetBugs(searchParams)
      
      case 'bug':
        const bugId = searchParams.get('id')
        if (!bugId) {
          return NextResponse.json(
            { error: 'Bug ID is required' },
            { status: 400 }
          )
        }
        return await handleGetBug(bugId)
      
      case 'statistics':
        return await handleGetStatistics()
      
      case 'active':
        return await handleGetActiveBugs()
      
      default:
        return NextResponse.json(
          { error: 'Invalid endpoint' },
          { status: 404 }
        )
    }

  } catch (error) {
    logger.error('Bug bot API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// HANDLERS
// ============================================================================

async function handleBugReport(body: any) {
  try {
    // Validate request body
    const validatedData = BugReportSchema.parse(body)

    // Add metadata from request
    const headersList = headers()
    const userAgent = headersList.get('user-agent')
    const referer = headersList.get('referer')

    const enhancedData = {
      ...validatedData,
      metadata: {
        ...validatedData.metadata,
        userAgent: userAgent || undefined,
        url: referer || undefined,
        timestamp: new Date()
      }
    }

    // Report bug
    const bugReport = await bugBot.reportBug(enhancedData)

    logger.info('Bug reported successfully', { 
      bugId: bugReport.id,
      severity: bugReport.severity,
      category: bugReport.category
    })

    return NextResponse.json({
      success: true,
      bug: bugReport,
      message: 'Bug reported successfully'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      )
    }

    logger.error('Failed to report bug:', error)
    throw error
  }
}

async function handleBugUpdate(body: any) {
  try {
    const { bugId, ...updateData } = body

    if (!bugId) {
      return NextResponse.json(
        { error: 'Bug ID is required' },
        { status: 400 }
      )
    }

    // Validate update data
    const validatedData = BugUpdateSchema.parse(updateData)

    // Get existing bug
    const existingBug = await bugBot.getBugById(bugId)
    if (!existingBug) {
      return NextResponse.json(
        { error: 'Bug not found' },
        { status: 404 }
      )
    }

    // Update bug
    const updatedBug: BugReport = {
      ...existingBug,
      ...validatedData,
      updatedAt: new Date()
    }

    // Store updated bug
    await bugBot['storeBugReport'](updatedBug)

    logger.info('Bug updated successfully', { 
      bugId,
      status: updatedBug.status,
      priority: updatedBug.priority
    })

    return NextResponse.json({
      success: true,
      bug: updatedBug,
      message: 'Bug updated successfully'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      )
    }

    logger.error('Failed to update bug:', error)
    throw error
  }
}

async function handleStartBot() {
  try {
    await bugBot.start()

    return NextResponse.json({
      success: true,
      message: 'Bug bot started successfully'
    })

  } catch (error) {
    logger.error('Failed to start bug bot:', error)
    throw error
  }
}

async function handleStopBot() {
  try {
    await bugBot.stop()

    return NextResponse.json({
      success: true,
      message: 'Bug bot stopped successfully'
    })

  } catch (error) {
    logger.error('Failed to stop bug bot:', error)
    throw error
  }
}

async function handleBotStatus() {
  try {
    const activeBugs = await bugBot.getActiveBugs()
    const statistics = await bugBot.getBugStatistics()

    return NextResponse.json({
      success: true,
      status: {
        isRunning: true, // This would be a property of the bug bot
        activeBugsCount: activeBugs.length,
        statistics
      }
    })

  } catch (error) {
    logger.error('Failed to get bot status:', error)
    throw error
  }
}

async function handleGetBugs(searchParams: URLSearchParams) {
  try {
    const status = searchParams.get('status')
    const severity = searchParams.get('severity')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get bugs from database (simplified)
    const bugs = await bugBot.getActiveBugs()

    // Apply filters
    let filteredBugs = bugs

    if (status) {
      filteredBugs = filteredBugs.filter(bug => bug.status === status)
    }

    if (severity) {
      filteredBugs = filteredBugs.filter(bug => bug.severity === severity)
    }

    if (category) {
      filteredBugs = filteredBugs.filter(bug => bug.category === category)
    }

    // Apply pagination
    const paginatedBugs = filteredBugs.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      bugs: paginatedBugs,
      pagination: {
        total: filteredBugs.length,
        limit,
        offset,
        hasMore: offset + limit < filteredBugs.length
      }
    })

  } catch (error) {
    logger.error('Failed to get bugs:', error)
    throw error
  }
}

async function handleGetBug(bugId: string) {
  try {
    const bug = await bugBot.getBugById(bugId)

    if (!bug) {
      return NextResponse.json(
        { error: 'Bug not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      bug
    })

  } catch (error) {
    logger.error('Failed to get bug:', error)
    throw error
  }
}

async function handleGetStatistics() {
  try {
    const statistics = await bugBot.getBugStatistics()

    return NextResponse.json({
      success: true,
      statistics
    })

  } catch (error) {
    logger.error('Failed to get statistics:', error)
    throw error
  }
}

async function handleGetActiveBugs() {
  try {
    const activeBugs = await bugBot.getActiveBugs()

    return NextResponse.json({
      success: true,
      bugs: activeBugs,
      count: activeBugs.length
    })

  } catch (error) {
    logger.error('Failed to get active bugs:', error)
    throw error
  }
}
