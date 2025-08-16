/**
 * CoreFlow360 - Optimized Dashboard Stats API
 * High-performance dashboard data with advanced caching and query optimization
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { handleError, ErrorContext } from "@/lib/errors/error-handler"
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit"
import { successResponse, authErrorResponse } from "@/lib/api-response"
import { cacheDashboardStats } from "@/lib/cache/application-cache"

interface DashboardStats {
  overview: {
    totalCustomers: number
    totalDeals: number
    totalRevenue: number
    activeProjects: number
    monthlyGrowth: {
      customers: number
      deals: number
      revenue: number
    }
  }
  recentActivity: {
    customers: Array<{
      id: string
      name: string
      company: string
      status: string
      createdAt: string
    }>
    deals: Array<{
      id: string
      title: string
      value: number
      status: string
      customer: string
    }>
  }
  performance: {
    conversionRate: number
    avgDealSize: number
    topPerformers: Array<{
      userId: string
      name: string
      dealCount: number
      totalValue: number
    }>
  }
  aiInsights: {
    churRisk: Array<{
      customerId: string
      customerName: string
      riskScore: number
    }>
    opportunityScore: Array<{
      customerId: string
      customerName: string
      score: number
    }>
  }
}

async function getHandler(request: NextRequest) {
  return withRateLimit(request, async () => {
    const context: ErrorContext = {
      endpoint: '/api/dashboard/stats',
      method: 'GET',
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
      requestId: request.headers.get('x-request-id') || undefined
    }

    try {
      const session = await auth()
      if (!session?.user?.tenantId) {
        return authErrorResponse("Authentication required")
      }

      context.userId = session.user.id
      context.tenantId = session.user.tenantId

      // Date ranges for comparison
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

      // Use application-level caching with automatic cache key generation
      const stats = await cacheDashboardStats(
        session.user.tenantId,
        'current', // timeframe
        async () => {
          return await generateDashboardStats(session.user.tenantId, startOfMonth, startOfLastMonth, endOfLastMonth)
        }
      )

      return successResponse({
        ...stats,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      return handleError(error, context)
    }
  }, RATE_LIMITS.dashboard)
}

// Extract dashboard stats generation into a separate function for better readability
async function generateDashboardStats(
  tenantId: string,
  startOfMonth: Date,
  startOfLastMonth: Date,
  endOfLastMonth: Date
): Promise<DashboardStats> {

  // Optimized parallel queries using Promise.all to avoid sequential waits
      const [
        customerStats,
        dealStats,
        projectStats,
        recentCustomers,
        recentDeals,
        aiInsights
      ] = await Promise.all([
        // Customer statistics with growth calculation
        prisma.$transaction([
          prisma.customer.count({
            where: { tenantId }
          }),
          prisma.customer.count({
            where: {
              tenantId,
              createdAt: { gte: startOfMonth }
            }
          }),
          prisma.customer.count({
            where: {
              tenantId,
              createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }
            }
          })
        ]),

        // Deal statistics with revenue aggregation
        prisma.$transaction([
          prisma.deal.count({
            where: { tenantId }
          }),
          prisma.deal.aggregate({
            where: { 
              tenantId,
              status: 'WON'
            },
            _sum: { value: true }
          }),
          prisma.deal.count({
            where: {
              tenantId,
              createdAt: { gte: startOfMonth }
            }
          }),
          prisma.deal.aggregate({
            where: {
              tenantId,
              status: 'WON',
              createdAt: { gte: startOfMonth }
            },
            _sum: { value: true }
          }),
          prisma.deal.aggregate({
            where: {
              tenantId,
              status: 'WON',
              createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }
            },
            _sum: { value: true }
          })
        ]),

        // Active projects count
        prisma.project.count({
          where: {
            tenantId,
            status: { in: ['PLANNING', 'IN_PROGRESS'] }
          }
        }),

        // Recent customers - optimized with specific select fields
        prisma.customer.findMany({
          where: { tenantId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            company: true,
            status: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }),

        // Recent deals with customer information
        prisma.deal.findMany({
          where: { tenantId },
          select: {
            id: true,
            title: true,
            value: true,
            status: true,
            customer: {
              select: {
                firstName: true,
                lastName: true,
                company: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }),

        // AI insights for high-risk customers and opportunities
        prisma.$transaction([
          prisma.customer.findMany({
            where: {
              tenantId,
              aiChurnRisk: { gt: 0.7 }
            },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              company: true,
              aiChurnRisk: true
            },
            orderBy: { aiChurnRisk: 'desc' },
            take: 5
          }),
          prisma.customer.findMany({
            where: {
              tenantId,
              aiLifetimeValue: { gt: 10000 }
            },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              company: true,
              aiLifetimeValue: true
            },
            orderBy: { aiLifetimeValue: 'desc' },
            take: 5
          })
        ])
      ])

      // Calculate performance metrics
      const totalDeals = dealStats[0]
      const totalRevenue = dealStats[1]._sum.value || 0
      const avgDealSize = totalDeals > 0 ? totalRevenue / totalDeals : 0

      // Calculate growth percentages
      const currentMonthCustomers = customerStats[1]
      const lastMonthCustomers = customerStats[2]
      const customerGrowth = lastMonthCustomers > 0 
        ? ((currentMonthCustomers - lastMonthCustomers) / lastMonthCustomers) * 100 
        : 0

      const currentMonthDeals = dealStats[2]
      const currentMonthRevenue = dealStats[3]._sum.value || 0
      const lastMonthRevenue = dealStats[4]._sum.value || 0
      const revenueGrowth = lastMonthRevenue > 0 
        ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0

  // Top performers calculation (would be more complex in production)
  const topPerformers = await prisma.user.findMany({
    where: {
      tenantId,
      assignedDeals: {
        some: {
          status: 'WON',
          createdAt: { gte: startOfMonth }
        }
      }
    },
        select: {
          id: true,
          name: true,
          assignedDeals: {
            where: {
              status: 'WON',
              createdAt: { gte: startOfMonth }
            },
            select: {
              value: true
            }
          }
        },
        take: 5
      })

      // Build response
      const stats: DashboardStats = {
        overview: {
          totalCustomers: customerStats[0],
          totalDeals: totalDeals,
          totalRevenue: totalRevenue,
          activeProjects: projectStats,
          monthlyGrowth: {
            customers: customerGrowth,
            deals: currentMonthDeals,
            revenue: revenueGrowth
          }
        },
        recentActivity: {
          customers: recentCustomers.map(customer => ({
            id: customer.id,
            name: `${customer.firstName} ${customer.lastName}`.trim(),
            company: customer.company || 'N/A',
            status: customer.status,
            createdAt: customer.createdAt.toISOString()
          })),
          deals: recentDeals.map(deal => ({
            id: deal.id,
            title: deal.title,
            value: deal.value || 0,
            status: deal.status,
            customer: deal.customer?.company || 
                     `${deal.customer?.firstName} ${deal.customer?.lastName}`.trim()
          }))
        },
        performance: {
          conversionRate: totalDeals > 0 ? (dealStats[1]._sum.value || 0) / totalDeals * 100 : 0,
          avgDealSize: avgDealSize,
          topPerformers: topPerformers.map(user => ({
            userId: user.id,
            name: user.name || 'Unknown',
            dealCount: user.assignedDeals.length,
            totalValue: user.assignedDeals.reduce((sum, deal) => sum + (deal.value || 0), 0)
          }))
        },
        aiInsights: {
          churRisk: aiInsights[0].map(customer => ({
            customerId: customer.id,
            customerName: customer.company || `${customer.firstName} ${customer.lastName}`.trim(),
            riskScore: customer.aiChurnRisk || 0
          })),
          opportunityScore: aiInsights[1].map(customer => ({
            customerId: customer.id,
            customerName: customer.company || `${customer.firstName} ${customer.lastName}`.trim(),
            score: customer.aiLifetimeValue || 0
          }))
        }
      }

  return stats
}

export const GET = getHandler