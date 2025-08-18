/**
 * CoreFlow360 - Freemium Access Middleware
 * Enforce module access restrictions for freemium users
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export interface FreemiumUser {
  id: string
  userId: string
  tenantId: string
  selectedAgent: string
  dailyUsageCount: number
  dailyLimit: number
  hasAccess: boolean
}

export interface ModuleAccessResult {
  hasAccess: boolean
  reason?: string
  remainingUsage?: number
  upgradeRequired?: boolean
  selectedAgent?: string
  userPlan: 'free' | 'starter' | 'business' | 'enterprise'
}

/**
 * Check if user has access to a specific module
 */
export async function checkModuleAccess(
  userId: string,
  requiredModule: string,
  tenantId?: string
): Promise<ModuleAccessResult> {
  try {
    console.log(`🔐 Checking module access for user ${userId}, module: ${requiredModule}`)

    // First check if user is freemium
    const freemiumUser = await prisma.freemiumUser.findUnique({
      where: { userId },
      include: {
        tenant: {
          include: {
            tenantSubscriptions: {
              where: { status: { in: ['ACTIVE', 'TRIAL', 'FREE'] } },
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        }
      }
    })

    // If not a freemium user, check their actual subscription
    if (!freemiumUser) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          tenant: {
            include: {
              tenantSubscriptions: {
                where: { status: { in: ['ACTIVE', 'TRIAL', 'BUSINESS', 'ENTERPRISE'] } },
                orderBy: { createdAt: 'desc' },
                take: 1
              }
            }
          }
        }
      })

      if (!user || !user.tenant.tenantSubscriptions.length) {
        return {
          hasAccess: false,
          reason: 'No active subscription found',
          upgradeRequired: true,
          userPlan: 'free'
        }
      }

      const subscription = user.tenant.tenantSubscriptions[0]
      
      // Determine user plan and access
      if (subscription.status === 'ACTIVE' || subscription.status === 'TRIAL') {
        return {
          hasAccess: true,
          userPlan: subscription.subscriptionTier?.toLowerCase() as any || 'starter'
        }
      }
    }

    // Handle freemium user access
    if (freemiumUser) {
      // Check if they're accessing their selected agent
      if (requiredModule === freemiumUser.selectedAgent) {
        // Check daily usage limits
        if (freemiumUser.dailyUsageCount >= freemiumUser.dailyLimit) {
          return {
            hasAccess: false,
            reason: 'Daily usage limit reached',
            remainingUsage: 0,
            upgradeRequired: true,
            selectedAgent: freemiumUser.selectedAgent,
            userPlan: 'free'
          }
        }

        return {
          hasAccess: true,
          remainingUsage: freemiumUser.dailyLimit - freemiumUser.dailyUsageCount,
          selectedAgent: freemiumUser.selectedAgent,
          userPlan: 'free'
        }
      } else {
        // Trying to access a different module
        return {
          hasAccess: false,
          reason: `Free plan includes ${getModuleName(freemiumUser.selectedAgent)} only`,
          upgradeRequired: true,
          selectedAgent: freemiumUser.selectedAgent,
          userPlan: 'free'
        }
      }
    }

    // Default fallback - no access
    return {
      hasAccess: false,
      reason: 'Unable to determine subscription status',
      upgradeRequired: true,
      userPlan: 'free'
    }

  } catch (error) {
    console.error('❌ Error checking module access:', error)
    return {
      hasAccess: false,
      reason: 'Access check failed',
      upgradeRequired: true,
      userPlan: 'free'
    }
  }
}

/**
 * Middleware factory for protecting API routes
 */
export function createModuleAccessMiddleware(requiredModule: string) {
  return async (request: NextRequest, response: NextResponse) => {
    try {
      // Extract user info from request (assuming it's been added by auth middleware)
      const userId = request.headers.get('x-user-id')
      const tenantId = request.headers.get('x-tenant-id')

      if (!userId) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }

      const accessResult = await checkModuleAccess(userId, requiredModule, tenantId || undefined)

      if (!accessResult.hasAccess) {
        // Log access denial
        await logAccessDenial(userId, requiredModule, accessResult.reason || 'Access denied', tenantId)

        return NextResponse.json({
          error: 'Module access restricted',
          details: {
            reason: accessResult.reason,
            userPlan: accessResult.userPlan,
            upgradeRequired: accessResult.upgradeRequired,
            selectedAgent: accessResult.selectedAgent,
            availableModules: accessResult.userPlan === 'free' ? [accessResult.selectedAgent] : []
          },
          upgrade: {
            message: getUpgradeMessage(accessResult.userPlan, requiredModule),
            url: '/pricing',
            benefits: getUpgradeBenefits(accessResult.userPlan)
          }
        }, { status: 403 })
      }

      // Add access info to request headers for use in route handlers
      const newHeaders = new Headers(request.headers)
      newHeaders.set('x-module-access', 'granted')
      newHeaders.set('x-user-plan', accessResult.userPlan)
      newHeaders.set('x-remaining-usage', accessResult.remainingUsage?.toString() || '0')

      return NextResponse.next({
        request: {
          headers: newHeaders
        }
      })

    } catch (error) {
      console.error('❌ Module access middleware error:', error)
      return NextResponse.json(
        { error: 'Access control system error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Express-style middleware for API routes
 */
export function requireModuleAccess(requiredModule: string) {
  return async (req: any, res: any, next: any) => {
    try {
      const userId = req.user?.id || req.userId
      const tenantId = req.user?.tenantId || req.tenantId

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' })
      }

      const accessResult = await checkModuleAccess(userId, requiredModule, tenantId)

      if (!accessResult.hasAccess) {
        await logAccessDenial(userId, requiredModule, accessResult.reason || 'Access denied', tenantId)

        return res.status(403).json({
          error: 'Module access restricted',
          details: {
            reason: accessResult.reason,
            userPlan: accessResult.userPlan,
            upgradeRequired: accessResult.upgradeRequired,
            selectedAgent: accessResult.selectedAgent
          },
          upgrade: {
            message: getUpgradeMessage(accessResult.userPlan, requiredModule),
            url: '/pricing'
          }
        })
      }

      // Add access info to request object
      req.moduleAccess = {
        granted: true,
        userPlan: accessResult.userPlan,
        remainingUsage: accessResult.remainingUsage,
        selectedAgent: accessResult.selectedAgent
      }

      next()
    } catch (error) {
      console.error('❌ Module access error:', error)
      res.status(500).json({ error: 'Access control system error' })
    }
  }
}

/**
 * Track usage after successful API calls
 */
export async function trackModuleUsage(
  userId: string,
  module: string,
  action: string,
  tenantId?: string
): Promise<void> {
  try {
    const freemiumUser = await prisma.freemiumUser.findUnique({
      where: { userId }
    })

    if (!freemiumUser) {
      return // Not a freemium user, no tracking needed
    }

    // Reset counters if new day
    const today = new Date().toDateString()
    const lastResetDate = new Date(freemiumUser.lastResetDate).toDateString()
    const isNewDay = today !== lastResetDate

    // Increment usage
    await prisma.freemiumUser.update({
      where: { userId },
      data: {
        dailyUsageCount: isNewDay ? 1 : freemiumUser.dailyUsageCount + 1,
        lastResetDate: isNewDay ? new Date() : freemiumUser.lastResetDate,
        lastUsageAt: new Date(),
        lastActiveAt: new Date(),
        daysActive: isNewDay ? freemiumUser.daysActive + 1 : freemiumUser.daysActive
      }
    })

    console.log(`📊 Usage tracked for user ${userId}: ${action} in ${module}`)

  } catch (error) {
    console.error('❌ Failed to track module usage:', error)
  }
}

// Helper functions
async function logAccessDenial(userId: string, module: string, reason: string, tenantId?: string): Promise<void> {
  try {
    await prisma.conversionEvent.create({
      data: {
        tenantId: tenantId || 'unknown',
        userId,
        eventType: 'access_denied',
        triggerType: 'automatic',
        triggerContext: JSON.stringify({
          module,
          reason,
          timestamp: new Date().toISOString()
        }),
        userPlan: 'free',
        currentModule: module,
        actionTaken: 'blocked'
      }
    })
  } catch (error) {
    console.error('❌ Failed to log access denial:', error)
  }
}

function getModuleName(moduleKey: string): string {
  const names: Record<string, string> = {
    'sales': 'AI Sales Expert',
    'finance': 'AI Money Detective',
    'crm': 'AI Customer Expert',
    'operations': 'AI Operations Expert',
    'analytics': 'AI Crystal Ball',
    'hr': 'AI People Person'
  }
  return names[moduleKey] || moduleKey.toUpperCase()
}

function getUpgradeMessage(userPlan: string, requestedModule: string): string {
  if (userPlan === 'free') {
    return `Upgrade to access ${getModuleName(requestedModule)} and unlock your full business potential!`
  }
  return 'Upgrade your plan to access this premium feature.'
}

function getUpgradeBenefits(userPlan: string): string[] {
  if (userPlan === 'free') {
    return [
      'Access to 3 AI employees',
      'Unlimited daily actions',
      'Cross-module intelligence',
      'Priority support',
      '30-day money-back guarantee'
    ]
  }
  return [
    'Advanced features',
    'Priority support', 
    'Additional modules'
  ]
}

export default {
  checkModuleAccess,
  createModuleAccessMiddleware,
  requireModuleAccess,
  trackModuleUsage
}