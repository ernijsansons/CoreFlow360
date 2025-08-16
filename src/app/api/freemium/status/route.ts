/**
 * CoreFlow360 - Freemium Status API
 * Get comprehensive freemium user status and usage tracking
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { withCache } from '@/middleware/cache'
import { subscriptionCache } from '@/lib/cache/session-cache'
import { queryCache } from '@/lib/cache/query-cache'

const prisma = new PrismaClient()

async function getFreemiumStatus(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      )
    }

    console.log(`📊 Getting freemium status for user: ${userId}`)

    // Get freemium user data with caching
    const freemiumUser = await queryCache.subscription(
      userId,
      () => prisma.freemiumUser.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              role: true
            }
          },
          tenant: {
            select: {
              name: true,
              slug: true
            }
          }
        }
      })
    )

    if (!freemiumUser) {
      return NextResponse.json({
        success: true,
        isFreemiumUser: false,
        message: 'User is not on freemium plan'
      })
    }

    // Check if usage limits need to be reset (daily reset)
    const today = new Date().toDateString()
    const lastResetDate = new Date(freemiumUser.lastResetDate).toDateString()
    
    let updatedFreemiumUser = freemiumUser
    if (today !== lastResetDate) {
      // Reset daily usage count
      updatedFreemiumUser = await prisma.freemiumUser.update({
        where: { userId },
        data: {
          dailyUsageCount: 0,
          lastResetDate: new Date(),
          daysActive: freemiumUser.daysActive + 1
        }
      })
    }

    // Calculate usage statistics
    const usagePercentage = Math.round((updatedFreemiumUser.dailyUsageCount / updatedFreemiumUser.dailyLimit) * 100)
    const remainingUsage = Math.max(0, updatedFreemiumUser.dailyLimit - updatedFreemiumUser.dailyUsageCount)
    const isNearLimit = usagePercentage >= 80
    const hasReachedLimit = updatedFreemiumUser.dailyUsageCount >= updatedFreemiumUser.dailyLimit

    // Get recent conversion events for this user
    const recentEvents = await prisma.conversionEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    // Calculate engagement metrics
    const daysSinceJoined = Math.ceil((new Date().getTime() - new Date(updatedFreemiumUser.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    const averageUsagePerDay = updatedFreemiumUser.daysActive > 0 ? 
      (updatedFreemiumUser.weeklyUsageCount / Math.min(updatedFreemiumUser.daysActive, 7)) : 0

    // Determine upgrade eligibility
    const upgradeRecommendations = getUpgradeRecommendations(updatedFreemiumUser, recentEvents)

    return NextResponse.json({
      success: true,
      isFreemiumUser: true,
      userId: updatedFreemiumUser.userId,
      user: {
        name: updatedFreemiumUser.user?.name,
        email: updatedFreemiumUser.user?.email,
        role: updatedFreemiumUser.user?.role
      },
      tenant: {
        name: updatedFreemiumUser.tenant?.name,
        slug: updatedFreemiumUser.tenant?.slug
      },
      agent: {
        selected: updatedFreemiumUser.selectedAgent,
        name: getAgentName(updatedFreemiumUser.selectedAgent),
        description: getAgentDescription(updatedFreemiumUser.selectedAgent)
      },
      usage: {
        daily: {
          used: updatedFreemiumUser.dailyUsageCount,
          limit: updatedFreemiumUser.dailyLimit,
          remaining: remainingUsage,
          percentage: usagePercentage,
          resetTime: getNextResetTime()
        },
        weekly: {
          used: updatedFreemiumUser.weeklyUsageCount,
          average: Math.round(averageUsagePerDay * 10) / 10
        },
        monthly: {
          used: updatedFreemiumUser.monthlyUsageCount
        }
      },
      status: {
        isNearLimit,
        hasReachedLimit,
        canUseFeatures: !hasReachedLimit,
        statusMessage: hasReachedLimit 
          ? 'Daily limit reached. Upgrade for unlimited access!' 
          : isNearLimit 
          ? 'Approaching daily limit. Consider upgrading.'
          : 'All systems go!'
      },
      engagement: {
        daysActive: updatedFreemiumUser.daysActive,
        daysSinceJoined,
        firstLoginAt: updatedFreemiumUser.firstLoginAt,
        lastActiveAt: updatedFreemiumUser.lastActiveAt,
        averageUsagePerDay: Math.round(averageUsagePerDay * 10) / 10
      },
      upgrade: {
        promptedCount: updatedFreemiumUser.upgradePromptedCount,
        declinedCount: updatedFreemiumUser.upgradeDeclinedCount,
        lastPrompt: updatedFreemiumUser.lastUpgradePrompt,
        recommendations: upgradeRecommendations,
        eligibleForPrompt: shouldShowUpgradePrompt(updatedFreemiumUser, recentEvents)
      },
      recentActivity: recentEvents.map(event => ({
        eventType: event.eventType,
        actionTaken: event.actionTaken,
        createdAt: event.createdAt
      })),
      meta: {
        memberSince: updatedFreemiumUser.createdAt,
        lastUpdated: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Failed to get freemium status:', error)
    return NextResponse.json(
      { error: 'Failed to get freemium status' },
      { status: 500 }
    )
  }
}

// Helper functions
function getAgentName(agentKey: string): string {
  const names: Record<string, string> = {
    'sales': 'AI Sales Expert',
    'finance': 'AI Money Detective', 
    'crm': 'AI Customer Expert',
    'operations': 'AI Operations Expert',
    'analytics': 'AI Crystal Ball',
    'hr': 'AI People Person'
  }
  return names[agentKey] || agentKey.toUpperCase()
}

function getAgentDescription(agentKey: string): string {
  const descriptions: Record<string, string> = {
    'sales': 'Closes deals and finds prospects faster than any human',
    'finance': 'Tracks every penny and predicts cash flow like magic',
    'crm': 'Manages relationships and automates customer success',
    'operations': 'Optimizes workflows and eliminates bottlenecks',
    'analytics': 'Predicts the future with data-driven insights',
    'hr': 'Finds talent and keeps employees happy'
  }
  return descriptions[agentKey] || 'Your AI-powered business assistant'
}

function getNextResetTime(): string {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  return tomorrow.toISOString()
}

function getUpgradeRecommendations(freemiumUser: any, recentEvents: any[]): string[] {
  const recommendations = []
  
  // High usage recommendation
  if (freemiumUser.dailyUsageCount >= freemiumUser.dailyLimit * 0.8) {
    recommendations.push('Upgrade to remove daily limits and get unlimited AI assistance')
  }
  
  // Active user recommendation  
  if (freemiumUser.daysActive >= 7) {
    recommendations.push('You\'re getting great value! Unlock 3 AI employees for just $49/month')
  }
  
  // Feature limitation recommendation
  const hasBeenPrompted = freemiumUser.upgradePromptedCount > 0
  if (hasBeenPrompted) {
    recommendations.push('Access cross-module intelligence to see the full business picture')
  }
  
  return recommendations
}

function shouldShowUpgradePrompt(freemiumUser: any, recentEvents: any[]): boolean {
  // Don't prompt too frequently
  if (freemiumUser.lastUpgradePrompt) {
    const daysSinceLastPrompt = (new Date().getTime() - new Date(freemiumUser.lastUpgradePrompt).getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceLastPrompt < 2) return false
  }
  
  // Don't prompt if declined recently
  if (freemiumUser.upgradeDeclinedCount >= 3) return false
  
  // Prompt if usage is high
  if (freemiumUser.dailyUsageCount >= freemiumUser.dailyLimit * 0.9) return true
  
  // Prompt if user has been active for a week
  if (freemiumUser.daysActive >= 7) return true
  
  return false
}

// Export cached version of the handler
export const GET = withCache({
  ttl: 60, // Cache for 1 minute
  vary: ['userId', 'tenantId']
})(getFreemiumStatus)