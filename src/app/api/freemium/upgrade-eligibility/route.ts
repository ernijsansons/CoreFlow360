/**
 * CoreFlow360 - Upgrade Eligibility API
 * Determine if and when users should see upgrade prompts
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const context = searchParams.get('context') // 'feature_limit', 'page_load', 'action_blocked'

    if (!userId) {
      return NextResponse.json({ error: 'userId parameter is required' }, { status: 400 })
    }

    // Get freemium user data with recent conversion events
    const freemiumUser = await prisma.freemiumUser.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
    })

    if (!freemiumUser) {
      return NextResponse.json({
        success: true,
        eligible: false,
        reason: 'User is not on freemium plan',
      })
    }

    // Get recent conversion events
    const recentEvents = await prisma.conversionEvent.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate eligibility based on multiple factors
    const eligibilityCheck = calculateUpgradeEligibility(freemiumUser, recentEvents, context)

    if (!eligibilityCheck.eligible) {
      return NextResponse.json({
        success: true,
        eligible: false,
        reason: eligibilityCheck.reason,
        nextEligibleAt: eligibilityCheck.nextEligibleAt,
        metrics: {
          daysActive: freemiumUser.daysActive,
          dailyUsageCount: freemiumUser.dailyUsageCount,
          upgradePromptedCount: freemiumUser.upgradePromptedCount,
          upgradeDeclinedCount: freemiumUser.upgradeDeclinedCount,
        },
      })
    }

    // Generate personalized upgrade offer
    const upgradeOffer = generateUpgradeOffer(freemiumUser, recentEvents, context)

    // Log eligibility check
    await prisma.conversionEvent.create({
      data: {
        tenantId: freemiumUser.tenantId,
        userId,
        eventType: 'eligibility_check',
        triggerType: 'automatic',
        triggerContext: JSON.stringify({
          context,
          eligible: true,
          triggerReason: eligibilityCheck.reason,
          offerType: upgradeOffer.type,
        }),
        userPlan: 'free',
        currentModule: freemiumUser.selectedAgent,
        actionTaken: 'evaluated',
      },
    })

    return NextResponse.json({
      success: true,
      eligible: true,
      reason: eligibilityCheck.reason,
      confidence: eligibilityCheck.confidence,
      offer: upgradeOffer,
      metrics: {
        daysActive: freemiumUser.daysActive,
        dailyUsageCount: freemiumUser.dailyUsageCount,
        dailyLimit: freemiumUser.dailyLimit,
        usagePercentage: Math.round((freemiumUser.dailyUsageCount / freemiumUser.dailyLimit) * 100),
        upgradePromptedCount: freemiumUser.upgradePromptedCount,
        upgradeDeclinedCount: freemiumUser.upgradeDeclinedCount,
        lastUpgradePrompt: freemiumUser.lastUpgradePrompt,
        memberSince: freemiumUser.createdAt,
      },
      timing: {
        optimalTiming: getOptimalPromptTiming(),
        delayRecommended: false,
        followUpScheduled: false,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check upgrade eligibility' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, action, offerType, context } = body

    if (!userId || !action) {
      return NextResponse.json({ error: 'userId and action are required' }, { status: 400 })
    }

    const freemiumUser = await prisma.freemiumUser.findUnique({
      where: { userId },
    })

    if (!freemiumUser) {
      return NextResponse.json({ error: 'User is not on freemium plan' }, { status: 404 })
    }

    // Update freemium user based on action
    const updateData: unknown = {}

    if (action === 'declined' || action === 'dismissed') {
      updateData.upgradeDeclinedCount = freemiumUser.upgradeDeclinedCount + 1
    }

    if (action === 'delayed') {
      // Set next prompt for 24 hours from now
      updateData.lastUpgradePrompt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.freemiumUser.update({
        where: { userId },
        data: updateData,
      })
    }

    // Log the conversion event
    await prisma.conversionEvent.create({
      data: {
        tenantId: freemiumUser.tenantId,
        userId,
        eventType: action === 'converted' ? 'upgrade_completed' : 'upgrade_prompt_response',
        triggerType: 'manual',
        triggerContext: JSON.stringify({
          offerType,
          context,
          previousPrompts: freemiumUser.upgradePromptedCount,
          previousDeclines: freemiumUser.upgradeDeclinedCount,
        }),
        userPlan: 'free',
        currentModule: freemiumUser.selectedAgent,
        actionTaken: action,
        actionTakenAt: new Date(),
        conversionValue: action === 'converted' ? 49 : undefined, // Starter plan price
      },
    })

    return NextResponse.json({
      success: true,
      message: `Upgrade action '${action}' recorded successfully`,
      nextEligibleAt:
        action === 'declined'
          ? new Date(Date.now() + 48 * 60 * 60 * 1000) // Wait 48 hours after decline
          : action === 'delayed'
            ? new Date(Date.now() + 24 * 60 * 60 * 1000) // Wait 24 hours after delay
            : null,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record upgrade action' }, { status: 500 })
  }
}

// Helper functions
function calculateUpgradeEligibility(
  freemiumUser: unknown,
  recentEvents: unknown[],
  context?: string
) {
  // Check cooldown periods
  if (freemiumUser.lastUpgradePrompt) {
    const hoursSinceLastPrompt =
      (new Date().getTime() - new Date(freemiumUser.lastUpgradePrompt).getTime()) / (1000 * 60 * 60)

    // Different cooldown periods based on last action
    const lastAction = recentEvents.find(
      (e) => e.eventType === 'upgrade_prompt_response'
    )?.actionTaken
    const cooldownHours = getCooldownHours(lastAction, freemiumUser.upgradeDeclinedCount)

    if (hoursSinceLastPrompt < cooldownHours) {
      return {
        eligible: false,
        reason: 'Cooldown period active',
        nextEligibleAt: new Date(
          new Date(freemiumUser.lastUpgradePrompt).getTime() + cooldownHours * 60 * 60 * 1000
        ),
      }
    }
  }

  // Check if user has declined too many times
  if (freemiumUser.upgradeDeclinedCount >= 5) {
    return {
      eligible: false,
      reason: 'Maximum decline threshold reached',
      nextEligibleAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Wait 7 days
    }
  }

  // Context-specific eligibility
  const contextChecks = getContextEligibility(freemiumUser, context)
  if (!contextChecks.eligible) {
    return contextChecks
  }

  // Calculate confidence score (0-100)
  const confidence = calculateConfidenceScore(freemiumUser, recentEvents)

  return {
    eligible: true,
    reason: contextChecks.reason,
    confidence,
  }
}

function getCooldownHours(lastAction?: string, declineCount: number = 0): number {
  switch (lastAction) {
    case 'declined':
      return Math.min(48, 12 + declineCount * 6) // Increase cooldown with each decline
    case 'dismissed':
      return 6
    case 'delayed':
      return 24
    default:
      return 4 // Default minimum cooldown
  }
}

function getContextEligibility(freemiumUser: unknown, context?: string) {
  const usagePercentage = (freemiumUser.dailyUsageCount / freemiumUser.dailyLimit) * 100

  switch (context) {
    case 'feature_limit':
      if (usagePercentage >= 50) {
        return { eligible: true, reason: 'Feature usage approaching limit' }
      }
      break

    case 'action_blocked':
      if (freemiumUser.dailyUsageCount >= freemiumUser.dailyLimit) {
        return { eligible: true, reason: 'Daily limit reached' }
      }
      break

    case 'success_story':
      if (freemiumUser.daysActive >= 7) {
        return { eligible: true, reason: 'User showing consistent engagement' }
      }
      break

    case 'value_demonstration':
      if (freemiumUser.weeklyUsageCount >= 30) {
        return { eligible: true, reason: 'High value user ready for upgrade' }
      }
      break

    default:
      // General eligibility checks
      if (usagePercentage >= 80) {
        return { eligible: true, reason: 'High usage indicates readiness' }
      }
      if (freemiumUser.daysActive >= 3 && freemiumUser.upgradePromptedCount === 0) {
        return { eligible: true, reason: 'New engaged user' }
      }
  }

  return { eligible: false, reason: 'Context criteria not met' }
}

function calculateConfidenceScore(freemiumUser: unknown, recentEvents: unknown[]): number {
  let score = 50 // Base score

  // Usage-based factors
  const usagePercentage = (freemiumUser.dailyUsageCount / freemiumUser.dailyLimit) * 100
  score += Math.min(25, usagePercentage * 0.25) // Up to +25 for high usage

  // Engagement factors
  score += Math.min(15, freemiumUser.daysActive * 2) // Up to +15 for consistent engagement

  // Weekly usage factor
  score += Math.min(10, freemiumUser.weeklyUsageCount * 0.2) // Up to +10 for high weekly usage

  // Subtract for previous declines
  score -= freemiumUser.upgradeDeclinedCount * 5

  // Recent activity boost
  const recentUsage = recentEvents.filter((e) => e.eventType === 'feature_usage').length
  score += Math.min(10, recentUsage)

  return Math.max(0, Math.min(100, Math.round(score)))
}

function generateUpgradeOffer(_freemiumUser: unknown, _recentEvents: unknown[], context?: string) {
  const usagePercentage = (freemiumUser.dailyUsageCount / freemiumUser.dailyLimit) * 100

  // Determine offer type based on user behavior
  let offerType = 'standard'
  let discount = 0
  let urgency = 'medium'

  if (freemiumUser.daysActive >= 14) {
    offerType = 'loyalty'
    discount = 25 // 25% off first month
    urgency = 'low'
  } else if (usagePercentage >= 90) {
    offerType = 'usage_driven'
    discount = 0
    urgency = 'high'
  } else if (freemiumUser.upgradeDeclinedCount >= 2) {
    offerType = 'win_back'
    discount = 15 // 15% off
    urgency = 'medium'
  }

  return {
    type: offerType,
    title: getOfferTitle(offerType, freemiumUser),
    description: getOfferDescription(offerType, freemiumUser),
    discount,
    urgency,
    validUntil: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
    ctaText: getCtaText(offerType),
    socialProof: getSocialProof(offerType),
    valueProps: getValueProps(freemiumUser),
    pricing: {
      original: 49,
      discounted: discount > 0 ? Math.round(49 * (1 - discount / 100)) : 49,
      savings: discount > 0 ? Math.round(49 * (discount / 100)) : 0,
    },
  }
}

function getOfferTitle(_offerType: string, _freemiumUser: unknown): string {
  switch (offerType) {
    case 'loyalty':
      return 'Thank You Offer: 25% Off Your First Month!'
    case 'usage_driven':
      return "You're Crushing It! Upgrade to Keep Going"
    case 'win_back':
      return 'We Miss You - Come Back for 15% Off'
    default:
      return 'Unlock Your Full Business Potential'
  }
}

function getOfferDescription(offerType: string, freemiumUser: unknown): string {
  switch (offerType) {
    case 'loyalty':
      return `After ${freemiumUser.daysActive} days of great results, you've earned this exclusive discount.`
    case 'usage_driven':
      return "Your daily usage shows you're ready for unlimited access. Don't let limits slow you down!"
    case 'win_back':
      return "We've improved our platform based on your feedback. Give us another chance!"
    default:
      return 'Join thousands of businesses growing 3x faster with our full AI workforce.'
  }
}

function getCtaText(offerType: string): string {
  switch (offerType) {
    case 'loyalty':
      return 'Claim My Loyalty Discount'
    case 'usage_driven':
      return 'Remove All Limits Now'
    case 'win_back':
      return 'Try Again with 15% Off'
    default:
      return 'Upgrade to Starter Plan'
  }
}

function getSocialProof(offerType: string): string {
  switch (offerType) {
    case 'loyalty':
      return 'Join 12,000+ businesses already growing with CoreFlow360'
    case 'usage_driven':
      return '94% of high-usage users upgrade within 7 days'
    case 'win_back':
      return '78% of users who try again stay upgraded'
    default:
      return '89% of users upgrade within 30 days'
  }
}

function getValueProps(freemiumUser: unknown): string[] {
  const baseProps = [
    'Get 3 AI employees instead of 1',
    'Unlimited daily actions',
    'Cross-module intelligence',
    'Priority support',
  ]

  // Add personalized value prop based on selected agent
  const agentProps: Record<string, string> = {
    sales: 'Advanced pipeline forecasting',
    finance: 'Automated financial reporting',
    crm: 'Customer lifecycle automation',
    operations: 'Workflow optimization tools',
    analytics: 'Predictive business insights',
    hr: 'Talent acquisition automation',
  }

  if (agentProps[freemiumUser.selectedAgent]) {
    baseProps.splice(2, 0, agentProps[freemiumUser.selectedAgent])
  }

  return baseProps
}

function getOptimalPromptTiming(): string {
  const hour = new Date().getHours()

  if (hour >= 9 && hour <= 11) return 'optimal' // Morning productivity hours
  if (hour >= 14 && hour <= 16) return 'good' // Afternoon decision-making hours
  if (hour >= 19 && hour <= 21) return 'fair' // Evening planning hours

  return 'suboptimal'
}
