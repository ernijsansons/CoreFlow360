/**
 * Customer Analytics API
 * GET /api/customers/analytics
 * Provides AI-powered customer analytics and insights
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTenantFromSession, getUserFromSession } from '@/lib/auth/tenant-utils'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { CustomerStatus } from '@prisma/client'
import { dashboardInsightsGenerator } from '@/lib/ai/dashboard-insights-generator'
import { langChainOrchestrator } from '@/lib/ai/langchain-orchestrator'

const querySchema = z.object({
  timeRange: z.enum(['7d', '30d', '90d', '1y']).optional().default('30d'),
  includeAI: z.string().optional().default('true').transform(val => val === 'true'),
})

export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantFromSession(request)
    const user = await getUserFromSession()

    const searchParams = Object.fromEntries(request.nextUrl.searchParams)
    const { timeRange, includeAI } = querySchema.parse(searchParams)

    // Calculate date range
    const now = new Date()
    const startDate = new Date()
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    // Get customer statistics
    const [totalCustomers, newCustomers, customersByStatus, topCustomers] = await Promise.all([
      // Total customers
      prisma.customer.count({ where: { tenantId } }),
      
      // New customers in time range
      prisma.customer.count({
        where: {
          tenantId,
          createdAt: { gte: startDate },
        },
      }),
      
      // Customers by status
      prisma.customer.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: { status: true },
      }),
      
      // Top customers by revenue
      prisma.customer.findMany({
        where: { tenantId },
        orderBy: { totalRevenue: 'desc' },
        take: 10,
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          company: true,
          totalRevenue: true,
          aiScore: true,
          _count: {
            select: {
              deals: true,
              invoices: true,
            },
          },
        },
      }),
    ])

    // Calculate growth metrics
    const previousPeriodStart = new Date(startDate)
    previousPeriodStart.setDate(previousPeriodStart.getDate() - (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    
    const previousPeriodCustomers = await prisma.customer.count({
      where: {
        tenantId,
        createdAt: {
          gte: previousPeriodStart,
          lt: startDate,
        },
      },
    })

    const growthRate = previousPeriodCustomers > 0
      ? ((newCustomers - previousPeriodCustomers) / previousPeriodCustomers) * 100
      : 100

    // Calculate churn and retention
    const churnedCustomers = await prisma.customer.count({
      where: {
        tenantId,
        status: CustomerStatus.CHURNED,
        updatedAt: { gte: startDate },
      },
    })

    const activeCustomers = totalCustomers - customersByStatus.find(s => s.status === CustomerStatus.CHURNED)?._count.status || 0
    const churnRate = activeCustomers > 0 ? (churnedCustomers / activeCustomers) * 100 : 0
    const retentionRate = 100 - churnRate

    // Get average metrics
    const avgMetrics = await prisma.customer.aggregate({
      where: { tenantId },
      _avg: {
        totalRevenue: true,
        aiScore: true,
        aiLifetimeValue: true,
      },
    })

    const baseAnalytics = {
      overview: {
        totalCustomers,
        newCustomers,
        growthRate,
        churnRate,
        retentionRate,
        avgRevenue: avgMetrics._avg.totalRevenue || 0,
        avgScore: avgMetrics._avg.aiScore || 0,
        avgLifetimeValue: avgMetrics._avg.aiLifetimeValue || 0,
      },
      segmentation: {
        byStatus: customersByStatus.map(s => ({
          status: s.status,
          count: s._count.status,
          percentage: (s._count.status / totalCustomers) * 100,
        })),
      },
      topCustomers,
      timeRange,
    }

    // Add AI insights if requested
    if (includeAI) {
      try {
        const aiPrompt = `Analyze the following customer analytics data and provide actionable insights:

Total Customers: ${totalCustomers}
New Customers (${timeRange}): ${newCustomers}
Growth Rate: ${growthRate.toFixed(1)}%
Churn Rate: ${churnRate.toFixed(1)}%
Average Revenue: $${avgMetrics._avg.totalRevenue?.toFixed(2) || 0}

Customer Status Distribution:
${customersByStatus.map(s => `- ${s.status}: ${s._count.status} (${((s._count.status / totalCustomers) * 100).toFixed(1)}%)`).join('\n')}

Provide:
1. Key insights about customer health
2. Risk factors to watch
3. Growth opportunities
4. Specific recommendations`

        const aiResult = await langChainOrchestrator.orchestrate(aiPrompt, {
          userId: user.id,
          tenantId,
          department: 'sales',
          task: 'customer-analytics',
          priority: 'medium',
        })

        // Parse AI insights
        const insights = {
          summary: aiResult.response,
          keyMetrics: [
            {
              metric: 'Customer Health Score',
              value: retentionRate > 90 ? 'Excellent' : retentionRate > 80 ? 'Good' : retentionRate > 70 ? 'Fair' : 'Needs Attention',
              trend: growthRate > 0 ? 'improving' : 'declining',
            },
            {
              metric: 'Revenue Concentration',
              value: topCustomers[0]?.totalRevenue > avgMetrics._avg.totalRevenue! * 10 ? 'High Risk' : 'Balanced',
              trend: 'stable',
            },
          ],
          recommendations: [
            churnRate > 10 ? 'Implement customer retention program' : null,
            growthRate < 5 ? 'Increase marketing and lead generation efforts' : null,
            'Focus on upselling to existing high-value customers',
            'Develop customer success initiatives for at-risk accounts',
          ].filter(Boolean),
        }

        return NextResponse.json({
          ...baseAnalytics,
          aiInsights: insights,
          generatedAt: new Date().toISOString(),
        })
      } catch (aiError) {
        console.error('AI insights generation failed:', aiError)
        // Return base analytics without AI insights
        return NextResponse.json({
          ...baseAnalytics,
          aiInsights: null,
          aiError: 'Failed to generate AI insights',
        })
      }
    }

    return NextResponse.json(baseAnalytics)

  } catch (error) {
    console.error('Customer analytics error:', error)
    
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate customer analytics' },
      { status: 500 }
    )
  }
}