/**
 * Dashboard AI Insights API
 * GET /api/dashboard/insights
 * Generates AI-powered dashboard insights using configured providers
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTenantFromSession, getUserFromSession } from '@/lib/auth/tenant-utils'
import { dashboardInsightsGenerator } from '@/lib/ai/dashboard-insights-generator'
import { z } from 'zod'

const querySchema = z.object({
  timeRange: z.enum(['1d', '7d', '30d', '90d']).optional().default('7d'),
  department: z.string().optional(),
  refresh: z.string().optional().transform(val => val === 'true'),
})

export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantFromSession(request)
    const user = await getUserFromSession()

    // Parse query parameters
    const searchParams = Object.fromEntries(request.nextUrl.searchParams)
    const query = querySchema.parse(searchParams)

    // Generate AI insights
    const insights = await dashboardInsightsGenerator.generateDashboardInsights(
      tenantId,
      user.id,
      query.timeRange,
      query.department
    )

    // Add cache headers for performance
    const headers = new Headers()
    if (!query.refresh) {
      headers.set('Cache-Control', 'private, max-age=300') // Cache for 5 minutes
    }

    return NextResponse.json(insights, { headers })

  } catch (error) {
    console.error('Dashboard insights error:', error)
    
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
      { error: 'Failed to generate dashboard insights' },
      { status: 500 }
    )
  }
}