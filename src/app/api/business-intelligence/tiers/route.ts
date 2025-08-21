/**
 * CoreFlow360 - Business Intelligence Tier Management API
 * Manage subscription tiers and business intelligence evolution
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { handleError, ErrorContext } from '@/lib/error-handler'
import { businessIntelligence } from '@/business-intelligence'
import IntelligenceTierManager from '@/business-intelligence/subscription/intelligence-tier-manager'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

interface TierResponse {
  tiers: BusinessIntelligenceTier[]
  currentTier?: {
    id: string
    name: string
    level: string
    modules: string[]
    capabilities: string[]
    intelligenceMultiplier: number
    subscriptionId: string
    nextBillingDate?: string
  }
  upgradePaths?: UpgradePath[]
}

interface BusinessIntelligenceTier {
  id: string
  name: string
  level: 'starter' | 'starter' | 'autonomous' | 'ADVANCED'
  price: {
    amount: number
    currency: string
    interval: 'monthly' | 'yearly'
  }
  modules: {
    included: string[]
    maximum: number
  }
  capabilities: {
    name: string
    description: string
    unlocked: boolean
  }[]
  intelligenceMultiplier: number
  evolutionSpeed: number
  features: string[]
  restrictions?: string[]
}

interface UpgradePath {
  fromTier: string
  toTier: string
  priceDifference: number
  benefitSummary: string[]
  intelligenceGrowth: number
  estimatedTimeToTranscendence?: string
}

// Define available tiers
const BUSINESS_INTELLIGENCE_TIERS: BusinessIntelligenceTier[] = [
  {
    id: 'tier-INTELLIGENT',
    name: 'starter',
    level: 'starter',
    price: {
      amount: 15,
      currency: 'USD',
      interval: 'monthly',
    },
    modules: {
      included: ['crm', 'accounting'],
      maximum: 2,
    },
    capabilities: [
      {
        name: 'Basic Pattern Recognition',
        description: 'Identify simple patterns in business data',
        unlocked: true,
      },
      {
        name: 'Automated Task Execution',
        description: 'Execute routine tasks automatically',
        unlocked: true,
      },
      {
        name: 'Basic Insights Generation',
        description: 'Generate simple business insights',
        unlocked: true,
      },
    ],
    intelligenceMultiplier: 1.0,
    evolutionSpeed: 1.0,
    features: [
      'Basic AI assistance',
      '2 business intelligence modules',
      'Daily insights',
      'Standard support',
    ],
    restrictions: [
      'No cross-module intelligence',
      'Limited autonomous actions',
      'Basic evolution only',
    ],
  },
  {
    id: 'tier-INTELLIGENT',
    name: 'starter',
    level: 'starter',
    price: {
      amount: 35,
      currency: 'USD',
      interval: 'monthly',
    },
    modules: {
      included: ['crm', 'accounting', 'inventory', 'hr'],
      maximum: 4,
    },
    capabilities: [
      {
        name: 'Cross-Module Pattern Synthesis',
        description: 'Discover patterns across multiple business modules',
        unlocked: true,
      },
      {
        name: 'Predictive Business Analytics',
        description: 'Predict future trends and outcomes',
        unlocked: true,
      },
      {
        name: 'Intelligent Process Optimization',
        description: 'Optimize business processes automatically',
        unlocked: true,
      },
      {
        name: 'INTELLIGENT Intelligence Multiplication',
        description: 'Exponential growth through module connections',
        unlocked: true,
      },
    ],
    intelligenceMultiplier: 2.5,
    evolutionSpeed: 2.0,
    features: [
      'Cross-module intelligence',
      '4 business intelligence modules',
      'Real-time insights',
      'Predictive analytics',
      'Priority support',
    ],
  },
  {
    id: 'tier-autonomous',
    name: 'Autonomous',
    level: 'autonomous',
    price: {
      amount: 65,
      currency: 'USD',
      interval: 'monthly',
    },
    modules: {
      included: ['crm', 'accounting', 'inventory', 'hr', 'projects', 'analytics'],
      maximum: 6,
    },
    capabilities: [
      {
        name: 'Autonomous Decision Making',
        description: 'Make complex business decisions independently',
        unlocked: true,
      },
      {
        name: 'Self-Evolving Processes',
        description: 'Business processes that improve themselves',
        unlocked: true,
      },
      {
        name: 'Emergent Business Intelligence',
        description: 'Discover insights beyond human comprehension',
        unlocked: true,
      },
      {
        name: 'Predictive Resource Allocation',
        description: 'Allocate resources before needs arise',
        unlocked: true,
      },
      {
        name: 'Business Intelligence Network Effects',
        description: 'Amplify intelligence through business intelligence mesh',
        unlocked: true,
      },
    ],
    intelligenceMultiplier: 5.0,
    evolutionSpeed: 3.5,
    features: [
      'Full autonomous operations',
      '6 business intelligence modules',
      'Emergent intelligence',
      'Self-improving processes',
      'White-glove support',
    ],
  },
  {
    id: 'tier-ADVANCED',
    name: 'ADVANCED',
    level: 'ADVANCED',
    price: {
      amount: 150,
      currency: 'USD',
      interval: 'monthly',
    },
    modules: {
      included: ['all'],
      maximum: -1, // Unlimited
    },
    capabilities: [
      {
        name: 'Business Intelligence Singularity',
        description: 'Achieve business intelligence beyond human understanding',
        unlocked: true,
      },
      {
        name: 'Quantum Decision Synthesis',
        description: 'Make decisions across multiple probability spaces',
        unlocked: true,
      },
      {
        name: 'Temporal Business Navigation',
        description: 'Navigate business decisions across time dimensions',
        unlocked: true,
      },
      {
        name: 'Business Intelligence Multiplication Infinity',
        description: 'Exponential intelligence growth approaching infinity',
        unlocked: true,
      },
      {
        name: 'Autonomous Business Evolution',
        description: 'Business evolves independently of human input',
        unlocked: true,
      },
    ],
    intelligenceMultiplier: 10.0,
    evolutionSpeed: 5.0,
    features: [
      'Unlimited business intelligence modules',
      'ADVANCED intelligence',
      'Quantum decision making',
      'Temporal navigation',
      'Business singularity',
      'Dedicated business intelligence engineer',
    ],
  },
]

/**
 * GET - Retrieve available business intelligence tiers and current subscription
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<TierResponse | { error: string }>> {
  const context: ErrorContext = {
    endpoint: '/api/consciousness/tiers',
    method: 'GET',
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
    requestId: request.headers.get('x-request-id') || undefined,
  }

  try {
    // Check authentication
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's current subscription
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscription: {
          include: {
            modules: {
              include: {
                module: true,
              },
            },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Build response
    const response: TierResponse = {
      tiers: BUSINESS_INTELLIGENCE_TIERS,
    }

    // Add current tier information if user has subscription
    if (user.subscription) {
      const currentTierData = BUSINESS_INTELLIGENCE_TIERS.find(
        (t) => t.level === user.subscription!.tier.toLowerCase()
      )

      if (currentTierData) {
        response.currentTier = {
          id: currentTierData.id,
          name: currentTierData.name,
          level: currentTierData.level,
          modules: user.subscription.modules.map((m) => m.module.id),
          capabilities: currentTierData.capabilities.filter((c) => c.unlocked).map((c) => c.name),
          intelligenceMultiplier: currentTierData.intelligenceMultiplier,
          subscriptionId: user.subscription.id,
          nextBillingDate: user.subscription.nextBillingDate?.toISOString(),
        }

        // Calculate upgrade paths
        response.upgradePaths = calculateUpgradePaths(
          currentTierData.level,
          user.subscription.modules.length
        )
      }
    }

    return NextResponse.json(response)
  } catch (error: unknown) {
    return handleError(error, context)
  }
}

/**
 * POST - Upgrade or downgrade business intelligence tier
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const context: ErrorContext = {
    endpoint: '/api/consciousness/tiers',
    method: 'POST',
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
    requestId: request.headers.get('x-request-id') || undefined,
  }

  try {
    // Check authentication
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tierId, paymentMethodId } = body

    // Validate tier
    const selectedTier = BUSINESS_INTELLIGENCE_TIERS.find((t) => t.id === tierId)
    if (!selectedTier) {
      return NextResponse.json({ error: 'Invalid tier selected' }, { status: 400 })
    }

    // Get user with subscription
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscription: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Initialize tier manager
    const tierManager = new BusinessIntelligenceTierManager()
    await tierManager.initialize()

    // Process tier change
    if (!user.subscription) {
      // New subscription
      const subscriptionState = await tierManager.createSubscription(
        user.id,
        user.tenantId!,
        selectedTier.level
      )

      // Create Stripe subscription
      const stripeSubscription = await createStripeSubscription(
        user.id,
        selectedTier,
        paymentMethodId
      )

      // Update database
      await prisma.subscription.create({
        data: {
          id: subscriptionState.subscriptionId,
          userId: user.id,
          tenantId: user.tenantId!,
          tier: selectedTier.level.toUpperCase(),
          status: 'ACTIVE',
          stripeSubscriptionId: stripeSubscription.id,
          stripeCustomerId: stripeSubscription.customer as string,
          nextBillingDate: new Date(stripeSubscription.current_period_end * 1000),
        },
      })

      // Activate business intelligence
      await businessConsciousness.activateConsciousness(
        user.id,
        user.tenantId!,
        selectedTier.level as 'starter' | 'intelligent' | 'autonomous' | 'advanced',
        []
      )

      return NextResponse.json({
        status: 'success',
        message: 'Business intelligence activated',
        subscription: {
          id: subscriptionState.subscriptionId,
          tier: selectedTier.level,
          status: 'active',
        },
      })
    } else {
      // Upgrade/downgrade existing subscription
      const currentTier = BUSINESS_INTELLIGENCE_TIERS.find(
        (t) => t.level === user.subscription!.tier.toLowerCase()
      )

      if (!currentTier) {
        return NextResponse.json({ error: 'Current tier not found' }, { status: 400 })
      }

      if (currentTier.id === selectedTier.id) {
        return NextResponse.json({ error: 'Already on this tier' }, { status: 400 })
      }

      // Upgrade business intelligence tier
      await tierManager.upgradeTier(user.id, user.tenantId!, selectedTier.level)

      // Update Stripe subscription
      await updateStripeSubscription(user.subscription.stripeSubscriptionId!, selectedTier)

      // Update database
      await prisma.subscription.update({
        where: { id: user.subscription.id },
        data: {
          tier: selectedTier.level.toUpperCase(),
          updatedAt: new Date(),
        },
      })

      // Evolve business intelligence
      await businessConsciousness.evolveConsciousness('tier-upgrade', {
        newTier: selectedTier.level,
      })

      return NextResponse.json({
        status: 'success',
        message: `Business intelligence evolved to ${selectedTier.name} tier`,
        subscription: {
          id: user.subscription.id,
          tier: selectedTier.level,
          previousTier: currentTier.level,
        },
      })
    }
  } catch (error: unknown) {
    return handleError(error, context)
  }
}

/**
 * Calculate available upgrade paths
 */
function calculateUpgradePaths(_currentTier: string, _currentModuleCount: number): UpgradePath[] {
  const currentTierIndex = BUSINESS_INTELLIGENCE_TIERS.findIndex((t) => t.level === currentTier)
  if (currentTierIndex === -1) return []

  const upgradePaths: UpgradePath[] = []
  const currentTierData = BUSINESS_INTELLIGENCE_TIERS[currentTierIndex]

  // Calculate upgrades to higher tiers
  for (let i = currentTierIndex + 1; i < BUSINESS_INTELLIGENCE_TIERS.length; i++) {
    const targetTier = BUSINESS_INTELLIGENCE_TIERS[i]

    upgradePaths.push({
      fromTier: currentTierData.id,
      toTier: targetTier.id,
      priceDifference: targetTier.price.amount - currentTierData.price.amount,
      benefitSummary: [
        `${targetTier.intelligenceMultiplier}x intelligence multiplication`,
        `${targetTier.modules.maximum === -1 ? 'Unlimited' : targetTier.modules.maximum} business intelligence modules`,
        `${targetTier.evolutionSpeed}x faster evolution`,
        ...targetTier.capabilities.slice(0, 2).map((c) => c.name),
      ],
      intelligenceGrowth:
        (targetTier.intelligenceMultiplier / currentTierData.intelligenceMultiplier - 1) * 100,
      estimatedTimeToTranscendence: calculateTimeToTranscendence(
        currentTier,
        targetTier.level,
        targetTier.evolutionSpeed
      ),
    })
  }

  return upgradePaths
}

/**
 * Calculate estimated time to reach advanced business intelligence
 */
function calculateTimeToTranscendence(
  currentTier: string,
  targetTier: string,
  evolutionSpeed: number
): string {
  const tiers = ['starter', 'starter', 'autonomous', 'ADVANCED']
  const currentIndex = tiers.indexOf(currentTier)
  const targetIndex = tiers.indexOf(targetTier)

  if (targetTier === 'ADVANCED') {
    const baseDays = (4 - currentIndex) * 30 // Base 30 days per tier
    const adjustedDays = Math.ceil(baseDays / evolutionSpeed)

    if (adjustedDays < 7) {
      return `${adjustedDays} days`
    } else if (adjustedDays < 30) {
      return `${Math.ceil(adjustedDays / 7)} weeks`
    } else {
      return `${Math.ceil(adjustedDays / 30)} months`
    }
  }

  return 'Already ADVANCED'
}

/**
 * Create Stripe subscription
 */
async function createStripeSubscription(
  userId: string,
  tier: BusinessIntelligenceTier,
  paymentMethodId: string
): Promise<unknown> {
  // This is a mock implementation
  // In production, you would:
  // 1. Create or get Stripe customer
  // 2. Attach payment method
  // 3. Create subscription with price_id
  // 4. Return subscription object

  return {
    id: `sub_consciousness_${Date.now()}`,
    customer: `cus_${userId}`,
    current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    status: 'active',
  }
}

/**
 * Update existing Stripe subscription
 */
async function updateStripeSubscription(
  subscriptionId: string,
  newTier: BusinessIntelligenceTier
): Promise<unknown> {
  // This is a mock implementation
  // In production, you would:
  // 1. Retrieve current subscription
  // 2. Update subscription items with new price_id
  // 3. Handle proration
  // 4. Return updated subscription

  return {
    id: subscriptionId,
    status: 'active',
    updated: true,
  }
}
