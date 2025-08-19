/**
 * CoreFlow360 - Usage Tracking API
 * Track freemium user activity and enforce limits
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const trackUsageSchema = z.object({
  userId: z.string(),
  tenantId: z.string(),
  action: z.enum([
    'ai_query',
    'report_generated',
    'data_export',
    'automation_run',
    'insight_generated',
  ]),
  module: z.string().optional(),
  metadata: z.object({}).passthrough().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, tenantId, action, module, metadata } = trackUsageSchema.parse(body)

    // Get freemium user data
    const freemiumUser = await prisma.freemiumUser.findUnique({
      where: { userId },
    })

    if (!freemiumUser) {
      return NextResponse.json({ error: 'User is not on freemium plan' }, { status: 404 })
    }

    // Check if user has reached daily limit
    if (freemiumUser.dailyUsageCount >= freemiumUser.dailyLimit) {
      // Log limit reached event
      await prisma.conversionEvent.create({
        data: {
          tenantId,
          userId,
          eventType: 'usage_limit',
          triggerType: 'automatic',
          triggerContext: JSON.stringify({
            action,
            module,
            dailyUsageCount: freemiumUser.dailyUsageCount,
            dailyLimit: freemiumUser.dailyLimit,
            metadata,
          }),
          userPlan: 'free',
          currentModule: module || freemiumUser.selectedAgent,
          actionTaken: 'blocked',
          sessionId: request.headers.get('x-session-id') || undefined,
        },
      })

      return NextResponse.json(
        {
          success: false,
          error: 'Daily usage limit reached',
          data: {
            dailyUsageCount: freemiumUser.dailyUsageCount,
            dailyLimit: freemiumUser.dailyLimit,
            resetTime: getNextResetTime(),
            upgradeMessage: 'Upgrade to remove all limits and get unlimited AI assistance!',
            upgradeUrl: '/pricing',
          },
        },
        { status: 429 }
      )
    }

    // Reset counters if needed (new day)
    const today = new Date().toDateString()
    const lastResetDate = new Date(freemiumUser.lastResetDate).toDateString()

    const isNewDay = today !== lastResetDate
    const isNewWeek = (isNewWeek = isStartOfWeek(new Date(), new Date(freemiumUser.lastResetDate)))
    const isNewMonth = new Date().getMonth() !== new Date(freemiumUser.lastResetDate).getMonth()

    // Increment usage counters
    const updatedFreemiumUser = await prisma.freemiumUser.update({
      where: { userId },
      data: {
        dailyUsageCount: isNewDay ? 1 : freemiumUser.dailyUsageCount + 1,
        weeklyUsageCount: isNewWeek ? 1 : freemiumUser.weeklyUsageCount + 1,
        monthlyUsageCount: isNewMonth ? 1 : freemiumUser.monthlyUsageCount + 1,
        lastResetDate: isNewDay ? new Date() : freemiumUser.lastResetDate,
        lastUsageAt: new Date(),
        lastActiveAt: new Date(),
        daysActive: isNewDay ? freemiumUser.daysActive + 1 : freemiumUser.daysActive,
      },
    })

    // Log the usage event
    await prisma.conversionEvent.create({
      data: {
        tenantId,
        userId,
        eventType: 'feature_usage',
        triggerType: 'automatic',
        triggerContext: JSON.stringify({
          action,
          module: module || freemiumUser.selectedAgent,
          usageCount: updatedFreemiumUser.dailyUsageCount,
          metadata,
        }),
        userPlan: 'free',
        currentModule: module || freemiumUser.selectedAgent,
        actionTaken: 'used',
        sessionId: request.headers.get('x-session-id') || undefined,
      },
    })

    // Check if user should be shown upgrade prompt
    const shouldPromptUpgrade = shouldShowUpgradePrompt(updatedFreemiumUser)
    let upgradePromptData = null

    if (shouldPromptUpgrade) {
      // Update prompt count
      await prisma.freemiumUser.update({
        where: { userId },
        data: {
          upgradePromptedCount: updatedFreemiumUser.upgradePromptedCount + 1,
          lastUpgradePrompt: new Date(),
        },
      })

      upgradePromptData = {
        triggerType: getUpgradeTriggerType(updatedFreemiumUser),
        message: getUpgradeMessage(updatedFreemiumUser),
        valueProposition: getValueProposition(updatedFreemiumUser),
        urgency: getUrgencyMessage(updatedFreemiumUser),
      }

      // Log upgrade prompt event
      await prisma.conversionEvent.create({
        data: {
          tenantId,
          userId,
          eventType: 'upgrade_prompt',
          triggerType: 'automatic',
          triggerContext: JSON.stringify({
            promptData: upgradePromptData,
            usageCount: updatedFreemiumUser.dailyUsageCount,
            daysActive: updatedFreemiumUser.daysActive,
          }),
          userPlan: 'free',
          currentModule: module || freemiumUser.selectedAgent,
          actionTaken: 'shown',
          promptDisplayedAt: new Date(),
        },
      })
    }

    const usagePercentage = Math.round(
      (updatedFreemiumUser.dailyUsageCount / updatedFreemiumUser.dailyLimit) * 100
    )
    const remainingUsage = Math.max(
      0,
      updatedFreemiumUser.dailyLimit - updatedFreemiumUser.dailyUsageCount
    )

    return NextResponse.json({
      success: true,
      message: 'Usage tracked successfully',
      data: {
        action,
        module: module || freemiumUser.selectedAgent,
        usage: {
          daily: {
            used: updatedFreemiumUser.dailyUsageCount,
            limit: updatedFreemiumUser.dailyLimit,
            remaining: remainingUsage,
            percentage: usagePercentage,
          },
          weekly: {
            used: updatedFreemiumUser.weeklyUsageCount,
          },
          monthly: {
            used: updatedFreemiumUser.monthlyUsageCount,
          },
        },
        status: {
          isNearLimit: usagePercentage >= 80,
          hasReachedLimit: updatedFreemiumUser.dailyUsageCount >= updatedFreemiumUser.dailyLimit,
          resetTime: getNextResetTime(),
        },
        upgradePrompt: upgradePromptData,
        daysActive: updatedFreemiumUser.daysActive,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Failed to track usage' }, { status: 500 })
  }
}

// Helper functions
function getNextResetTime(): string {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  return tomorrow.toISOString()
}

function isStartOfWeek(currentDate: Date, lastDate: Date): boolean {
  const current = new Date(currentDate)
  const last = new Date(lastDate)

  // Get the start of the week (Sunday) for both dates
  const currentWeekStart = new Date(current)
  currentWeekStart.setDate(current.getDate() - current.getDay())
  currentWeekStart.setHours(0, 0, 0, 0)

  const lastWeekStart = new Date(last)
  lastWeekStart.setDate(last.getDate() - last.getDay())
  lastWeekStart.setHours(0, 0, 0, 0)

  return currentWeekStart.getTime() !== lastWeekStart.getTime()
}

function shouldShowUpgradePrompt(freemiumUser: unknown): boolean {
  // Don't prompt too frequently
  if (freemiumUser.lastUpgradePrompt) {
    const hoursSinceLastPrompt =
      (new Date().getTime() - new Date(freemiumUser.lastUpgradePrompt).getTime()) / (1000 * 60 * 60)
    if (hoursSinceLastPrompt < 6) return false // Wait at least 6 hours
  }

  // Don't prompt if declined too many times recently
  if (freemiumUser.upgradeDeclinedCount >= 5) return false

  // Prompt at 50% usage
  if (freemiumUser.dailyUsageCount === Math.floor(freemiumUser.dailyLimit * 0.5)) return true

  // Prompt at 80% usage
  if (freemiumUser.dailyUsageCount === Math.floor(freemiumUser.dailyLimit * 0.8)) return true

  // Prompt if user has been active for 3+ days
  if (freemiumUser.daysActive >= 3 && freemiumUser.upgradePromptedCount === 0) return true

  // Prompt if weekly usage is high
  if (freemiumUser.weeklyUsageCount >= 30 && freemiumUser.upgradePromptedCount < 2) return true

  return false
}

function getUpgradeTriggerType(freemiumUser: unknown): string {
  const usagePercentage = (freemiumUser.dailyUsageCount / freemiumUser.dailyLimit) * 100

  if (usagePercentage >= 80) return 'usage_limit'
  if (freemiumUser.daysActive >= 7) return 'success_story'
  if (freemiumUser.weeklyUsageCount >= 30) return 'value_demonstration'
  return 'feature_limit'
}

function getUpgradeMessage(freemiumUser: unknown): string {
  const usagePercentage = (freemiumUser.dailyUsageCount / freemiumUser.dailyLimit) * 100

  if (usagePercentage >= 80) {
    return "You're getting amazing results! Upgrade to remove all limits."
  }

  if (freemiumUser.daysActive >= 7) {
    return 'Scale your success with our full AI workforce!'
  }

  if (freemiumUser.weeklyUsageCount >= 30) {
    return 'Your AI agent has identified significant opportunities. Unlock the full potential!'
  }

  return 'Unlock more AI power to accelerate your business growth!'
}

function getValueProposition(_freemiumUser: unknown): string[] {
  return [
    'Get 3 AI employees instead of 1',
    'Unlock cross-module intelligence',
    '10x faster business insights',
    '24/7 AI business optimization',
    'Priority response speeds',
  ]
}

function getUrgencyMessage(freemiumUser: unknown): string {
  if (freemiumUser.daysActive >= 14) {
    return 'Join 89% of users who upgrade within 30 days'
  }

  if (freemiumUser.weeklyUsageCount >= 40) {
    return "Don't leave money on the table - upgrade today!"
  }

  return 'Limited time: See results in 24 hours or money back'
}
