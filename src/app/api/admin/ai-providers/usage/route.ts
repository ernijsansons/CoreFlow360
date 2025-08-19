/**
 * AI Provider Usage Analytics API
 * GET /api/admin/ai-providers/usage
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTenantFromSession } from '@/lib/auth/tenant-utils'
import { aiProviderDB } from '@/lib/ai/ai-provider-db'

export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantFromSession(request)

    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url)
    const providerId = searchParams.get('provider')
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined

    try {
      // Get usage statistics from database
      const usageStats = await aiProviderDB.getUsageStats(tenantId, providerId || undefined, startDate, endDate)

      // Get additional aggregate data for the dashboard
      const summaryData = {
        totalRequests: Object.values(usageStats).reduce((sum: number, stats: any) => sum + stats.requests, 0),
        totalTokens: Object.values(usageStats).reduce((sum: number, stats: any) => sum + stats.tokens, 0),
        totalCost: Object.values(usageStats).reduce((sum: number, stats: any) => sum + stats.cost, 0),
        avgResponseTime: Object.values(usageStats).length > 0 
          ? Object.values(usageStats).reduce((sum: number, stats: any) => sum + stats.avgResponseTime, 0) / Object.values(usageStats).length
          : 0,
        activeProviders: Object.values(usageStats).filter((stats: any) => stats.enabled).length,
        totalProviders: Object.keys(usageStats).length,
      }

      return NextResponse.json({
        success: true,
        usage: usageStats,
        summary: summaryData,
        filters: {
          providerId,
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
        }
      })

    } catch (dbError) {
      console.error('Database error:', dbError)
      
      // Fallback to empty usage data if database fails
      return NextResponse.json({
        success: true,
        usage: {},
        summary: {
          totalRequests: 0,
          totalTokens: 0,
          totalCost: 0,
          avgResponseTime: 0,
          activeProviders: 0,
          totalProviders: 0,
        },
        warning: 'Database unavailable - no usage data available'
      })
    }

  } catch (error) {
    console.error('Usage stats error:', error)
    
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to get usage statistics' },
      { status: 500 }
    )
  }
}