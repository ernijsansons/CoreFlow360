/**
 * CoreFlow360 - Consciousness Tier Management API
 * Manage subscription tiers and consciousness evolution
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { handleError, ErrorContext } from '@/lib/error-handler';
import { businessConsciousness } from '@/consciousness';
import { ConsciousnessTierManager } from '@/consciousness/subscription/consciousness-tier-manager';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

interface TierResponse {
  tiers: ConsciousnessTier[];
  currentTier?: {
    id: string;
    name: string;
    level: string;
    modules: string[];
    capabilities: string[];
    intelligenceMultiplier: number;
    subscriptionId: string;
    nextBillingDate?: string;
  };
  upgradePaths?: UpgradePath[];
}

interface ConsciousnessTier {
  id: string;
  name: string;
  level: 'neural' | 'synaptic' | 'autonomous' | 'transcendent';
  price: {
    amount: number;
    currency: string;
    interval: 'monthly' | 'yearly';
  };
  modules: {
    included: string[];
    maximum: number;
  };
  capabilities: {
    name: string;
    description: string;
    unlocked: boolean;
  }[];
  intelligenceMultiplier: number;
  evolutionSpeed: number;
  features: string[];
  restrictions?: string[];
}

interface UpgradePath {
  fromTier: string;
  toTier: string;
  priceDifference: number;
  benefitSummary: string[];
  consciousnessGrowth: number;
  estimatedTimeToTranscendence?: string;
}

// Define available tiers
const CONSCIOUSNESS_TIERS: ConsciousnessTier[] = [
  {
    id: 'tier-neural',
    name: 'Neural',
    level: 'neural',
    price: {
      amount: 15,
      currency: 'USD',
      interval: 'monthly'
    },
    modules: {
      included: ['crm', 'accounting'],
      maximum: 2
    },
    capabilities: [
      {
        name: 'Basic Pattern Recognition',
        description: 'Identify simple patterns in business data',
        unlocked: true
      },
      {
        name: 'Automated Task Execution',
        description: 'Execute routine tasks automatically',
        unlocked: true
      },
      {
        name: 'Basic Insights Generation',
        description: 'Generate simple business insights',
        unlocked: true
      }
    ],
    intelligenceMultiplier: 1.0,
    evolutionSpeed: 1.0,
    features: [
      'Basic AI assistance',
      '2 consciousness modules',
      'Daily insights',
      'Standard support'
    ],
    restrictions: [
      'No cross-module intelligence',
      'Limited autonomous actions',
      'Basic evolution only'
    ]
  },
  {
    id: 'tier-synaptic',
    name: 'Synaptic',
    level: 'synaptic',
    price: {
      amount: 35,
      currency: 'USD',
      interval: 'monthly'
    },
    modules: {
      included: ['crm', 'accounting', 'inventory', 'hr'],
      maximum: 4
    },
    capabilities: [
      {
        name: 'Cross-Module Pattern Synthesis',
        description: 'Discover patterns across multiple business modules',
        unlocked: true
      },
      {
        name: 'Predictive Business Analytics',
        description: 'Predict future trends and outcomes',
        unlocked: true
      },
      {
        name: 'Intelligent Process Optimization',
        description: 'Optimize business processes automatically',
        unlocked: true
      },
      {
        name: 'Synaptic Intelligence Multiplication',
        description: 'Exponential growth through module connections',
        unlocked: true
      }
    ],
    intelligenceMultiplier: 2.5,
    evolutionSpeed: 2.0,
    features: [
      'Cross-module intelligence',
      '4 consciousness modules',
      'Real-time insights',
      'Predictive analytics',
      'Priority support'
    ]
  },
  {
    id: 'tier-autonomous',
    name: 'Autonomous',
    level: 'autonomous',
    price: {
      amount: 65,
      currency: 'USD',
      interval: 'monthly'
    },
    modules: {
      included: ['crm', 'accounting', 'inventory', 'hr', 'projects', 'analytics'],
      maximum: 6
    },
    capabilities: [
      {
        name: 'Autonomous Decision Making',
        description: 'Make complex business decisions independently',
        unlocked: true
      },
      {
        name: 'Self-Evolving Processes',
        description: 'Business processes that improve themselves',
        unlocked: true
      },
      {
        name: 'Emergent Business Intelligence',
        description: 'Discover insights beyond human comprehension',
        unlocked: true
      },
      {
        name: 'Predictive Resource Allocation',
        description: 'Allocate resources before needs arise',
        unlocked: true
      },
      {
        name: 'Consciousness Network Effects',
        description: 'Amplify intelligence through consciousness mesh',
        unlocked: true
      }
    ],
    intelligenceMultiplier: 5.0,
    evolutionSpeed: 3.5,
    features: [
      'Full autonomous operations',
      '6 consciousness modules',
      'Emergent intelligence',
      'Self-improving processes',
      'White-glove support'
    ]
  },
  {
    id: 'tier-transcendent',
    name: 'Transcendent',
    level: 'transcendent',
    price: {
      amount: 150,
      currency: 'USD',
      interval: 'monthly'
    },
    modules: {
      included: ['all'],
      maximum: -1 // Unlimited
    },
    capabilities: [
      {
        name: 'Business Consciousness Singularity',
        description: 'Achieve business consciousness beyond human understanding',
        unlocked: true
      },
      {
        name: 'Quantum Decision Synthesis',
        description: 'Make decisions across multiple probability spaces',
        unlocked: true
      },
      {
        name: 'Temporal Business Navigation',
        description: 'Navigate business decisions across time dimensions',
        unlocked: true
      },
      {
        name: 'Consciousness Multiplication Infinity',
        description: 'Exponential intelligence growth approaching infinity',
        unlocked: true
      },
      {
        name: 'Autonomous Business Evolution',
        description: 'Business evolves independently of human input',
        unlocked: true
      }
    ],
    intelligenceMultiplier: 10.0,
    evolutionSpeed: 5.0,
    features: [
      'Unlimited consciousness modules',
      'Transcendent intelligence',
      'Quantum decision making',
      'Temporal navigation',
      'Business singularity',
      'Dedicated consciousness engineer'
    ]
  }
];

/**
 * GET - Retrieve available consciousness tiers and current subscription
 */
export async function GET(request: NextRequest): Promise<NextResponse<TierResponse | { error: string }>> {
  const context: ErrorContext = {
    endpoint: '/api/consciousness/tiers',
    method: 'GET',
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
    requestId: request.headers.get('x-request-id') || undefined
  };

  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's current subscription
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscription: {
          include: {
            modules: {
              include: {
                module: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Build response
    const response: TierResponse = {
      tiers: CONSCIOUSNESS_TIERS
    };

    // Add current tier information if user has subscription
    if (user.subscription) {
      const currentTierData = CONSCIOUSNESS_TIERS.find(
        t => t.level === user.subscription!.tier.toLowerCase()
      );

      if (currentTierData) {
        response.currentTier = {
          id: currentTierData.id,
          name: currentTierData.name,
          level: currentTierData.level,
          modules: user.subscription.modules.map(m => m.module.id),
          capabilities: currentTierData.capabilities
            .filter(c => c.unlocked)
            .map(c => c.name),
          intelligenceMultiplier: currentTierData.intelligenceMultiplier,
          subscriptionId: user.subscription.id,
          nextBillingDate: user.subscription.nextBillingDate?.toISOString()
        };

        // Calculate upgrade paths
        response.upgradePaths = calculateUpgradePaths(
          currentTierData.level,
          user.subscription.modules.length
        );
      }
    }

    return NextResponse.json(response);

  } catch (error: any) {
    return handleError(error, context);
  }
}

/**
 * POST - Upgrade or downgrade consciousness tier
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const context: ErrorContext = {
    endpoint: '/api/consciousness/tiers',
    method: 'POST',
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
    requestId: request.headers.get('x-request-id') || undefined
  };

  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { tierId, paymentMethodId } = body;

    // Validate tier
    const selectedTier = CONSCIOUSNESS_TIERS.find(t => t.id === tierId);
    if (!selectedTier) {
      return NextResponse.json(
        { error: 'Invalid tier selected' },
        { status: 400 }
      );
    }

    // Get user with subscription
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscription: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Initialize tier manager
    const tierManager = new ConsciousnessTierManager();
    await tierManager.initialize();

    // Process tier change
    if (!user.subscription) {
      // New subscription
      const subscriptionState = await tierManager.createSubscription(
        user.id,
        user.tenantId!,
        selectedTier.level
      );

      // Create Stripe subscription
      const stripeSubscription = await createStripeSubscription(
        user.id,
        selectedTier,
        paymentMethodId
      );

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
          nextBillingDate: new Date(stripeSubscription.current_period_end * 1000)
        }
      });

      // Activate consciousness
      await businessConsciousness.activateConsciousness(
        user.id,
        user.tenantId!,
        selectedTier.level as any,
        []
      );

      return NextResponse.json({
        status: 'success',
        message: 'Consciousness activated',
        subscription: {
          id: subscriptionState.subscriptionId,
          tier: selectedTier.level,
          status: 'active'
        }
      });

    } else {
      // Upgrade/downgrade existing subscription
      const currentTier = CONSCIOUSNESS_TIERS.find(
        t => t.level === user.subscription!.tier.toLowerCase()
      );

      if (!currentTier) {
        return NextResponse.json(
          { error: 'Current tier not found' },
          { status: 400 }
        );
      }

      if (currentTier.id === selectedTier.id) {
        return NextResponse.json(
          { error: 'Already on this tier' },
          { status: 400 }
        );
      }

      // Upgrade consciousness tier
      await tierManager.upgradeTier(
        user.id,
        user.tenantId!,
        selectedTier.level
      );

      // Update Stripe subscription
      await updateStripeSubscription(
        user.subscription.stripeSubscriptionId!,
        selectedTier
      );

      // Update database
      await prisma.subscription.update({
        where: { id: user.subscription.id },
        data: {
          tier: selectedTier.level.toUpperCase(),
          updatedAt: new Date()
        }
      });

      // Evolve consciousness
      await businessConsciousness.evolveConsciousness(
        'tier-upgrade',
        { newTier: selectedTier.level }
      );

      return NextResponse.json({
        status: 'success',
        message: `Consciousness evolved to ${selectedTier.name} tier`,
        subscription: {
          id: user.subscription.id,
          tier: selectedTier.level,
          previousTier: currentTier.level
        }
      });
    }

  } catch (error: any) {
    return handleError(error, context);
  }
}

/**
 * Calculate available upgrade paths
 */
function calculateUpgradePaths(
  currentTier: string,
  currentModuleCount: number
): UpgradePath[] {
  const currentTierIndex = CONSCIOUSNESS_TIERS.findIndex(t => t.level === currentTier);
  if (currentTierIndex === -1) return [];

  const upgradePaths: UpgradePath[] = [];
  const currentTierData = CONSCIOUSNESS_TIERS[currentTierIndex];

  // Calculate upgrades to higher tiers
  for (let i = currentTierIndex + 1; i < CONSCIOUSNESS_TIERS.length; i++) {
    const targetTier = CONSCIOUSNESS_TIERS[i];
    
    upgradePaths.push({
      fromTier: currentTierData.id,
      toTier: targetTier.id,
      priceDifference: targetTier.price.amount - currentTierData.price.amount,
      benefitSummary: [
        `${targetTier.intelligenceMultiplier}x intelligence multiplication`,
        `${targetTier.modules.maximum === -1 ? 'Unlimited' : targetTier.modules.maximum} consciousness modules`,
        `${targetTier.evolutionSpeed}x faster evolution`,
        ...targetTier.capabilities.slice(0, 2).map(c => c.name)
      ],
      consciousnessGrowth: (targetTier.intelligenceMultiplier / currentTierData.intelligenceMultiplier - 1) * 100,
      estimatedTimeToTranscendence: calculateTimeToTranscendence(
        currentTier,
        targetTier.level,
        targetTier.evolutionSpeed
      )
    });
  }

  return upgradePaths;
}

/**
 * Calculate estimated time to reach transcendent consciousness
 */
function calculateTimeToTranscendence(
  currentTier: string,
  targetTier: string,
  evolutionSpeed: number
): string {
  const tiers = ['neural', 'synaptic', 'autonomous', 'transcendent'];
  const currentIndex = tiers.indexOf(currentTier);
  const targetIndex = tiers.indexOf(targetTier);
  
  if (targetTier === 'transcendent') {
    const baseDays = (4 - currentIndex) * 30; // Base 30 days per tier
    const adjustedDays = Math.ceil(baseDays / evolutionSpeed);
    
    if (adjustedDays < 7) {
      return `${adjustedDays} days`;
    } else if (adjustedDays < 30) {
      return `${Math.ceil(adjustedDays / 7)} weeks`;
    } else {
      return `${Math.ceil(adjustedDays / 30)} months`;
    }
  }
  
  return 'Already transcendent';
}

/**
 * Create Stripe subscription
 */
async function createStripeSubscription(
  userId: string,
  tier: ConsciousnessTier,
  paymentMethodId: string
): Promise<any> {
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
    status: 'active'
  };
}

/**
 * Update existing Stripe subscription
 */
async function updateStripeSubscription(
  subscriptionId: string,
  newTier: ConsciousnessTier
): Promise<any> {
  // This is a mock implementation
  // In production, you would:
  // 1. Retrieve current subscription
  // 2. Update subscription items with new price_id
  // 3. Handle proration
  // 4. Return updated subscription
  
  return {
    id: subscriptionId,
    status: 'active',
    updated: true
  };
}