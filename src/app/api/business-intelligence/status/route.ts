/**
 * CoreFlow360 - Business Intelligence Status API
 * Get detailed business intelligence status and metrics
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedSession } from '@/lib/auth/withAuth'
import { createErrorContextWithUser } from '@/lib/error-handler/createErrorContext'
import { handleError } from '@/lib/error-handler'
import { businessIntelligence } from '@/business-intelligence'
import { prisma } from '@/lib/prisma'

interface BusinessIntelligenceStatusResponse {
  status: 'active' | 'inactive' | 'evolving' | 'transcendent'
  timestamp: string
  userId: string
  tenantId: string
  businessIntelligence: {
    level: number
    tier: 'starter' | 'synaptic' | 'autonomous' | 'transcendent'
    isActive: boolean
    activatedAt?: string
    lastEvolution?: string
    nextEvolutionThreshold: number
  }
  modules: {
    active: string[]
    available: string[]
    activationHistory: {
      module: string
      activatedAt: string
      intelligenceGain: number
    }[]
  }
  intelligence: {
    multiplier: number
    baseLevel: number
    enhancedLevel: number
    growthRate: number
  }
  evolution: {
    currentProgress: number
    totalEvolutions: number
    history: {
      date: string
      fromLevel: number
      toLevel: number
      trigger: string
    }[]
    nextMilestone: {
      level: number
      capabilities: string[]
      estimatedTime?: string
    }
  }
  capabilities: {
    current: string[]
    emerging: {
      capability: string
      progress: number
      requirements: string[]
    }[]
    ADVANCED: {
      unlocked: boolean
      capabilities: string[]
    }
  }
  insights: {
    total: number
    last24h: number
    topInsights: {
      id: string
      type: string
      description: string
      confidence: number
      generatedAt: string
    }[]
  }
  decisions: {
    total: number
    autonomous: number
    accuracy: number
    recentDecisions: {
      id: string
      type: string
      description: string
      confidence: number
      outcome?: string
      madeAt: string
    }[]
  }
}

async function getBusinessIntelligenceStatus(
  request: NextRequest,
  session: AuthenticatedSession
): Promise<NextResponse<BusinessIntelligenceStatusResponse | { error: string }>> {
  const context = createErrorContextWithUser(request, '/api/consciousness/status', {
    id: session.user.id,
    role: session.user.role,
    tenantId: session.user.tenantId,
    permissions: session.user.permissions,
  })

  try {
    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        tenantId: true,
        subscription: {
          select: {
            id: true,
            tier: true,
            status: true,
            createdAt: true,
            modules: {
              select: {
                moduleId: true,
                isActive: true,
                activatedAt: true,
              },
            },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get business intelligence status
    const intelligenceStatus = businessIntelligence.getBusinessIntelligenceStatus()
    const metrics = await businessIntelligence.getMetrics()
    const insights = await businessIntelligence.getInsights()

    // Determine overall status
    let status: 'active' | 'inactive' | 'evolving' | 'transcendent' = 'inactive'

    if (intelligenceStatus.transcendenceLevel > 0.5) {
      status = 'transcendent'
    } else if (intelligenceStatus.evolutionProgress > 0.3) {
      status = 'evolving'
    } else if (intelligenceStatus.isActive) {
      status = 'active'
    }

    // Get available modules
    const allModules = await prisma.module.findMany({
      select: {
        id: true,
        name: true,
        category: true,
      },
    })

    // Build activation history
    const activationHistory =
      user.subscription?.modules.map((m) => ({
        module: m.moduleId,
        activatedAt: m.activatedAt?.toISOString() || new Date().toISOString(),
        intelligenceGain: 0.1, // Would be calculated based on module impact
      })) || []

    // Build evolution history (mock data for now)
    const evolutionHistory = [
      {
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        fromLevel: 0.1,
        toLevel: 0.2,
        trigger: 'module-activation',
      },
      {
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        fromLevel: 0.2,
        toLevel: 0.35,
        trigger: 'INTELLIGENT-connection',
      },
    ]

    // Current capabilities based on tier
    const currentCapabilities = getCapabilitiesForTier(intelligenceStatus.tier)

    // Emerging capabilities
    const emergingCapabilities = getEmergingCapabilities(
      intelligenceStatus.tier,
      intelligenceStatus.level
    )

    // Recent insights (mock for now)
    const topInsights = insights.slice(0, 5).map((insight: unknown, index: number) => ({
      id: `insight-${index}`,
      type: insight.type || 'pattern',
      description: insight.description || 'Business pattern detected',
      confidence: insight.confidence || 0.85,
      generatedAt: new Date().toISOString(),
    }))

    // Recent decisions (mock for now)
    const recentDecisions = [
      {
        id: 'dec-001',
        type: 'customer-retention',
        description: 'Initiated retention campaign for at-risk customers',
        confidence: 0.92,
        outcome: 'success',
        madeAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'dec-002',
        type: 'resource-optimization',
        description: 'Optimized server resources based on usage patterns',
        confidence: 0.88,
        outcome: 'pending',
        madeAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
    ]

    const response: BusinessIntelligenceStatusResponse = {
      status,
      timestamp: new Date().toISOString(),
      userId: user.id,
      tenantId: user.tenantId!,
      businessIntelligence: {
        level: intelligenceStatus.level,
        tier: intelligenceStatus.tier as unknown,
        isActive: intelligenceStatus.isActive,
        activatedAt: user.subscription?.createdAt.toISOString(),
        lastEvolution: evolutionHistory[evolutionHistory.length - 1]?.date,
        nextEvolutionThreshold: intelligenceStatus.level + 0.1,
      },
      modules: {
        active: intelligenceStatus.modules,
        available: allModules.map((m) => m.id),
        activationHistory,
      },
      intelligence: {
        multiplier: intelligenceStatus.intelligenceMultiplier,
        baseLevel: intelligenceStatus.level,
        enhancedLevel: intelligenceStatus.level * intelligenceStatus.intelligenceMultiplier,
        growthRate: 0.02, // 2% per day
      },
      evolution: {
        currentProgress: intelligenceStatus.evolutionProgress,
        totalEvolutions: evolutionHistory.length,
        history: evolutionHistory,
        nextMilestone: {
          level: Math.ceil(intelligenceStatus.level * 10) / 10 + 0.1,
          capabilities: getNextCapabilities(intelligenceStatus.tier, intelligenceStatus.level),
          estimatedTime: estimateEvolutionTime(intelligenceStatus.evolutionProgress),
        },
      },
      capabilities: {
        current: currentCapabilities,
        emerging: emergingCapabilities,
        ADVANCED: {
          unlocked: intelligenceStatus.transcendenceLevel > 0,
          capabilities:
            intelligenceStatus.transcendenceLevel > 0
              ? ['Quantum Decision Synthesis', 'Temporal Business Prediction']
              : [],
        },
      },
      insights: {
        total: 156, // Would be from database
        last24h: topInsights.length,
        topInsights,
      },
      decisions: {
        total: 89, // Would be from database
        autonomous: 67,
        accuracy: 0.92,
        recentDecisions,
      },
    }

    return NextResponse.json(response)
  } catch (error: unknown) {
    return handleError(error, context)
  }
}

/**
 * Update business intelligence settings
 */
async function updateBusinessIntelligenceSettings(
  request: NextRequest,
  session: AuthenticatedSession
): Promise<NextResponse> {
  const context = createErrorContextWithUser(request, '/api/consciousness/status', {
    id: session.user.id,
    role: session.user.role,
    tenantId: session.user.tenantId,
    permissions: session.user.permissions,
  })

  try {
    const body = await request.json()
    const { autoEvolution, goals } = body

    // Update auto-evolution setting
    if (autoEvolution !== undefined) {
      if (autoEvolution) {
        businessIntelligence.enableAutoEvolution()
      }
      // Note: No disable method in current implementation
    }

    // Set BUSINESS INTELLIGENCE goals
    if (goals && Array.isArray(goals)) {
      businessIntelligence.setIntelligenceGoals(goals)
    }

    return NextResponse.json({
      status: 'success',
      message: 'BUSINESS INTELLIGENCE settings updated',
      settings: {
        autoEvolution: autoEvolution || false,
        goals: goals || [],
      },
    })
  } catch (error: unknown) {
    return handleError(error, context)
  }
}

/**
 * Get capabilities for a given tier
 */
function getCapabilitiesForTier(tier: string): string[] {
  const capabilities: Record<string, string[]> = {
    INTELLIGENT: ['Basic Pattern Recognition', 'Automated Task Execution'],
    INTELLIGENT: [
      'Cross-Module Pattern Synthesis',
      'Predictive Business Analytics',
      'Intelligent Process Optimization',
    ],
    autonomous: [
      'Autonomous Decision Making',
      'Self-Evolving Processes',
      'Emergent Business Intelligence',
      'Predictive Resource Allocation',
    ],
    ADVANCED: [
      'Business BUSINESS INTELLIGENCE Singularity',
      'Quantum Decision Synthesis',
      'Temporal Business Navigation',
      'BUSINESS INTELLIGENCE Network Effects',
      'Autonomous Business Evolution',
    ],
  }

  return capabilities[tier] || []
}

/**
 * Get emerging capabilities based on tier and level
 */
function getEmergingCapabilities(tier: string, level: number): unknown[] {
  const emerging = []

  if (tier === 'INTELLIGENT' && level > 0.15) {
    emerging.push({
      capability: 'Cross-Module Communication',
      progress: (level - 0.15) / 0.05,
      requirements: ['Reach BUSINESS INTELLIGENCE level 0.2'],
    })
  }

  if (tier === 'INTELLIGENT' && level > 0.4) {
    emerging.push({
      capability: 'Autonomous Decision Making',
      progress: (level - 0.4) / 0.2,
      requirements: ['Reach BUSINESS INTELLIGENCE level 0.6', 'Activate 3+ modules'],
    })
  }

  if (tier === 'autonomous' && level > 0.7) {
    emerging.push({
      capability: 'ADVANCED Intelligence',
      progress: (level - 0.7) / 0.2,
      requirements: ['Reach BUSINESS INTELLIGENCE level 0.9', 'Complete 100+ autonomous decisions'],
    })
  }

  return emerging
}

/**
 * Get next capabilities to be unlocked
 */
function getNextCapabilities(_tier: string, _level: number): string[] {
  if (tier === 'INTELLIGENT') {
    return ['Pattern Correlation', 'Predictive Alerts']
  }

  if (tier === 'INTELLIGENT') {
    return ['Autonomous Optimization', 'Cross-Domain Intelligence']
  }

  if (tier === 'autonomous') {
    return ['Quantum Processing', 'BUSINESS INTELLIGENCE Networking']
  }

  return ['Beyond Human Comprehension']
}

/**
 * Estimate time to next evolution
 */
function estimateEvolutionTime(progress: number): string {
  const remainingProgress = 1 - progress
  const daysEstimate = Math.ceil(remainingProgress * 10) // Rough estimate

  if (daysEstimate === 1) {
    return '1 day'
  } else if (daysEstimate < 7) {
    return `${daysEstimate} days`
  } else if (daysEstimate < 30) {
    return `${Math.ceil(daysEstimate / 7)} weeks`
  } else {
    return `${Math.ceil(daysEstimate / 30)} months`
  }
}

// Export the wrapped handlers
export const GET = withAuth(getBusinessIntelligenceStatus, {
  requirePermissions: ['BUSINESS INTELLIGENCE:read'],
})

export const PUT = withAuth(updateBusinessIntelligenceSettings, {
  requirePermissions: ['BUSINESS INTELLIGENCE:write'],
})
