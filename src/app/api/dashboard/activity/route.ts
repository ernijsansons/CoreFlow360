/**
 * Dashboard Activity Feed API
 * GET /api/dashboard/activity
 * Generates AI-powered activity insights
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTenantFromSession, getUserFromSession } from '@/lib/auth/tenant-utils'
import { dashboardInsightsGenerator } from '@/lib/ai/dashboard-insights-generator'
import { z } from 'zod'

const querySchema = z.object({
  limit: z.string().optional().default('10').transform(val => parseInt(val, 10)),
})

export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantFromSession(request)
    const user = await getUserFromSession()

    // Parse query parameters
    const searchParams = Object.fromEntries(request.nextUrl.searchParams)
    const query = querySchema.parse(searchParams)

    // Generate AI activity insights
    const activityInsights = await dashboardInsightsGenerator.generateActivityInsights(
      tenantId,
      user.id,
      query.limit
    )

    return NextResponse.json({
      activities: activityInsights,
      count: activityInsights.length,
      generatedAt: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Activity insights error:', error)
    
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate activity insights' },
      { status: 500 }
    )
  }
}