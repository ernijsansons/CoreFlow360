/**
 * CoreFlow360 - Current Subscription API
 * Get current subscription details for the authenticated tenant
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { handleError, handleAuthError, ErrorContext } from '@/lib/error-handler'
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { getAccessibleModules } from '@/lib/modules/access-control'

export async function GET(request: NextRequest) {
  return withRateLimit(request, async () => {
    const context: ErrorContext = {
      endpoint: '/api/subscriptions/current',
      method: 'GET',
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
      requestId: request.headers.get('x-request-id') || undefined
    }

    try {
      const session = await auth()
      if (!session?.user?.tenantId) {
        return handleAuthError('Authentication required', context)
      }

      context.userId = session.user.id
      context.tenantId = session.user.tenantId

      // Get current subscription
      const subscription = await prisma.tenantSubscription.findFirst({
        where: {
          tenantId: session.user.tenantId,
          status: 'ACTIVE'
        },
        include: {
          bundle: true,
          usageMetrics: {
            where: {
              recordedAt: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)) // Today
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      if (!subscription) {
        return NextResponse.json({
          success: false,
          error: 'No active subscription found'
        }, { status: 404 })
      }

      // Get active modules
      const activeModules = await getAccessibleModules(session.user.tenantId)

      // Calculate usage metrics
      const apiCallsUsed = subscription.usageMetrics
        .filter(m => m.metricType.endsWith('_api_calls'))
        .reduce((sum, m) => sum + m.value, 0)

      // Get user count
      const userCount = await prisma.user.count({
        where: {
          tenantId: session.user.tenantId,
          isActive: true
        }
      })

      // Get storage usage (mock for now)
      const storageUsed = Math.round(Math.random() * 50) // TODO: Implement real storage tracking

      // Format response
      const subscriptionData = {
        id: subscription.id,
        status: subscription.status,
        tier: subscription.bundle.tier,
        bundle: {
          id: subscription.bundle.id,
          name: subscription.bundle.name,
          category: subscription.bundle.category,
          basePrice: subscription.bundle.basePrice,
          perUserPrice: subscription.bundle.perUserPrice
        },
        users: subscription.users,
        price: subscription.price,
        billingCycle: subscription.billingCycle.toLowerCase(),
        startDate: subscription.startDate.toISOString(),
        endDate: subscription.endDate.toISOString(),
        nextBillingDate: subscription.nextBillingDate?.toISOString() || subscription.endDate.toISOString(),
        trialEndsAt: subscription.trialEndsAt?.toISOString(),
        activeModules,
        usage: {
          api_calls: {
            used: apiCallsUsed,
            limit: getLimitForTier(subscription.bundle.tier, 'api_calls')
          },
          storage: {
            used: storageUsed,
            limit: getLimitForTier(subscription.bundle.tier, 'storage')
          },
          users: {
            used: userCount,
            limit: getLimitForTier(subscription.bundle.tier, 'users')
          }
        }
      }

      return NextResponse.json({
        success: true,
        data: subscriptionData
      })

    } catch (error) {
      return handleError(error, context)
    }
  }, RATE_LIMITS.api)
}

// Helper function to get limits based on tier
function getLimitForTier(tier: string, resource: string): number {
  const limits: Record<string, Record<string, number>> = {
    starter: {
      api_calls: 1000,
      storage: 10,
      users: 5
    },
    professional: {
      api_calls: 10000,
      storage: 100,
      users: 50
    },
    enterprise: {
      api_calls: 100000,
      storage: 1000,
      users: 500
    },
    ultimate: {
      api_calls: -1, // Unlimited
      storage: -1,
      users: -1
    }
  }

  return limits[tier]?.[resource] || limits.starter[resource]
}