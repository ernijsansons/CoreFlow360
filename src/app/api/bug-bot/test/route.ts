/**
 * CoreFlow360 - Bug Bot Test API
 * Simple endpoint to test bug bot functionality
 */

import { NextRequest, NextResponse } from 'next/server'
import { bugBot } from '@/lib/bug-bot/bug-bot'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Report a test bug
    const bug = await bugBot.reportBug({
      title: body.title || 'Test Bug',
      description: body.description || 'This is a test bug for demonstration purposes',
      severity: body.severity || 'MEDIUM',
      category: body.category || 'BUSINESS_LOGIC',
      tags: body.tags || ['test', 'demo'],
      technicalDetails: {
        errorMessage: body.errorMessage || 'Test error message',
        componentName: body.componentName || 'TestComponent',
      },
      businessImpact: {
        affectedUsers: body.affectedUsers || 1,
        revenueImpact: body.revenueImpact || 'LOW',
        customerImpact: body.customerImpact || 'Minimal impact for testing',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Test bug reported successfully',
      bug,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to report test bug',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get bug statistics
    const statistics = await bugBot.getBugStatistics()
    const activeBugs = await bugBot.getActiveBugs()

    return NextResponse.json({
      success: true,
      statistics,
      activeBugs: activeBugs.slice(0, 5), // Return first 5 bugs
      totalActiveBugs: activeBugs.length,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get bug statistics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
