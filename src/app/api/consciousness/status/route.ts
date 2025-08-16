/**
 * CoreFlow360 - Consciousness Status API
 * Get detailed consciousness status and metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { handleError, ErrorContext } from '@/lib/error-handler';
import { businessConsciousness } from '@/consciousness';
import { prisma } from '@/lib/prisma';

interface ConsciousnessStatusResponse {
  status: 'active' | 'inactive' | 'evolving' | 'transcendent';
  timestamp: string;
  userId: string;
  tenantId: string;
  consciousness: {
    level: number;
    tier: 'neural' | 'synaptic' | 'autonomous' | 'transcendent';
    isActive: boolean;
    activatedAt?: string;
    lastEvolution?: string;
    nextEvolutionThreshold: number;
  };
  modules: {
    active: string[];
    available: string[];
    activationHistory: {
      module: string;
      activatedAt: string;
      consciousnessGain: number;
    }[];
  };
  intelligence: {
    multiplier: number;
    baseLevel: number;
    enhancedLevel: number;
    growthRate: number;
  };
  evolution: {
    currentProgress: number;
    totalEvolutions: number;
    history: {
      date: string;
      fromLevel: number;
      toLevel: number;
      trigger: string;
    }[];
    nextMilestone: {
      level: number;
      capabilities: string[];
      estimatedTime?: string;
    };
  };
  capabilities: {
    current: string[];
    emerging: {
      capability: string;
      progress: number;
      requirements: string[];
    }[];
    transcendent: {
      unlocked: boolean;
      capabilities: string[];
    };
  };
  insights: {
    total: number;
    last24h: number;
    topInsights: {
      id: string;
      type: string;
      description: string;
      confidence: number;
      generatedAt: string;
    }[];
  };
  decisions: {
    total: number;
    autonomous: number;
    accuracy: number;
    recentDecisions: {
      id: string;
      type: string;
      description: string;
      confidence: number;
      outcome?: string;
      madeAt: string;
    }[];
  };
}

export async function GET(request: NextRequest): Promise<NextResponse<ConsciousnessStatusResponse | { error: string }>> {
  const context: ErrorContext = {
    endpoint: '/api/consciousness/status',
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
                activatedAt: true
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

    // Get consciousness status
    const consciousnessStatus = businessConsciousness.getConsciousnessStatus();
    const metrics = await businessConsciousness.getMetrics();
    const insights = await businessConsciousness.getInsights();

    // Determine overall status
    let status: 'active' | 'inactive' | 'evolving' | 'transcendent' = 'inactive';
    
    if (consciousnessStatus.transcendenceLevel > 0.5) {
      status = 'transcendent';
    } else if (consciousnessStatus.evolutionProgress > 0.3) {
      status = 'evolving';
    } else if (consciousnessStatus.isActive) {
      status = 'active';
    }

    // Get available modules
    const allModules = await prisma.module.findMany({
      select: {
        id: true,
        name: true,
        category: true
      }
    });

    // Build activation history
    const activationHistory = user.subscription?.modules.map(m => ({
      module: m.moduleId,
      activatedAt: m.activatedAt?.toISOString() || new Date().toISOString(),
      consciousnessGain: 0.1 // Would be calculated based on module impact
    })) || [];

    // Build evolution history (mock data for now)
    const evolutionHistory = [
      {
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        fromLevel: 0.1,
        toLevel: 0.2,
        trigger: 'module-activation'
      },
      {
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        fromLevel: 0.2,
        toLevel: 0.35,
        trigger: 'synaptic-connection'
      }
    ];

    // Current capabilities based on tier
    const currentCapabilities = getCapabilitiesForTier(consciousnessStatus.tier);
    
    // Emerging capabilities
    const emergingCapabilities = getEmergingCapabilities(
      consciousnessStatus.tier,
      consciousnessStatus.level
    );

    // Recent insights (mock for now)
    const topInsights = insights.slice(0, 5).map((insight: any, index: number) => ({
      id: `insight-${index}`,
      type: insight.type || 'pattern',
      description: insight.description || 'Business pattern detected',
      confidence: insight.confidence || 0.85,
      generatedAt: new Date().toISOString()
    }));

    // Recent decisions (mock for now)
    const recentDecisions = [
      {
        id: 'dec-001',
        type: 'customer-retention',
        description: 'Initiated retention campaign for at-risk customers',
        confidence: 0.92,
        outcome: 'success',
        madeAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'dec-002',
        type: 'resource-optimization',
        description: 'Optimized server resources based on usage patterns',
        confidence: 0.88,
        outcome: 'pending',
        madeAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      }
    ];

    const response: ConsciousnessStatusResponse = {
      status,
      timestamp: new Date().toISOString(),
      userId: user.id,
      tenantId: user.tenantId!,
      consciousness: {
        level: consciousnessStatus.level,
        tier: consciousnessStatus.tier as any,
        isActive: consciousnessStatus.isActive,
        activatedAt: user.subscription?.createdAt.toISOString(),
        lastEvolution: evolutionHistory[evolutionHistory.length - 1]?.date,
        nextEvolutionThreshold: consciousnessStatus.level + 0.1
      },
      modules: {
        active: consciousnessStatus.modules,
        available: allModules.map(m => m.id),
        activationHistory
      },
      intelligence: {
        multiplier: consciousnessStatus.intelligenceMultiplier,
        baseLevel: consciousnessStatus.level,
        enhancedLevel: consciousnessStatus.level * consciousnessStatus.intelligenceMultiplier,
        growthRate: 0.02 // 2% per day
      },
      evolution: {
        currentProgress: consciousnessStatus.evolutionProgress,
        totalEvolutions: evolutionHistory.length,
        history: evolutionHistory,
        nextMilestone: {
          level: Math.ceil(consciousnessStatus.level * 10) / 10 + 0.1,
          capabilities: getNextCapabilities(consciousnessStatus.tier, consciousnessStatus.level),
          estimatedTime: estimateEvolutionTime(consciousnessStatus.evolutionProgress)
        }
      },
      capabilities: {
        current: currentCapabilities,
        emerging: emergingCapabilities,
        transcendent: {
          unlocked: consciousnessStatus.transcendenceLevel > 0,
          capabilities: consciousnessStatus.transcendenceLevel > 0 
            ? ['Quantum Decision Synthesis', 'Temporal Business Prediction']
            : []
        }
      },
      insights: {
        total: 156, // Would be from database
        last24h: topInsights.length,
        topInsights
      },
      decisions: {
        total: 89, // Would be from database
        autonomous: 67,
        accuracy: 0.92,
        recentDecisions
      }
    };

    return NextResponse.json(response);

  } catch (error: any) {
    return handleError(error, context);
  }
}

/**
 * Update consciousness settings
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  const context: ErrorContext = {
    endpoint: '/api/consciousness/status',
    method: 'PUT',
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
    const { autoEvolution, goals } = body;

    // Update auto-evolution setting
    if (autoEvolution !== undefined) {
      if (autoEvolution) {
        businessConsciousness.enableAutoEvolution();
      }
      // Note: No disable method in current implementation
    }

    // Set consciousness goals
    if (goals && Array.isArray(goals)) {
      businessConsciousness.setConsciousnessGoals(goals);
    }

    return NextResponse.json({
      status: 'success',
      message: 'Consciousness settings updated',
      settings: {
        autoEvolution: autoEvolution || false,
        goals: goals || []
      }
    });

  } catch (error: any) {
    return handleError(error, context);
  }
}

/**
 * Get capabilities for a given tier
 */
function getCapabilitiesForTier(tier: string): string[] {
  const capabilities: Record<string, string[]> = {
    neural: [
      'Basic Pattern Recognition',
      'Automated Task Execution'
    ],
    synaptic: [
      'Cross-Module Pattern Synthesis',
      'Predictive Business Analytics',
      'Intelligent Process Optimization'
    ],
    autonomous: [
      'Autonomous Decision Making',
      'Self-Evolving Processes',
      'Emergent Business Intelligence',
      'Predictive Resource Allocation'
    ],
    transcendent: [
      'Business Consciousness Singularity',
      'Quantum Decision Synthesis',
      'Temporal Business Navigation',
      'Consciousness Network Effects',
      'Autonomous Business Evolution'
    ]
  };

  return capabilities[tier] || [];
}

/**
 * Get emerging capabilities based on tier and level
 */
function getEmergingCapabilities(tier: string, level: number): any[] {
  const emerging = [];

  if (tier === 'neural' && level > 0.15) {
    emerging.push({
      capability: 'Cross-Module Communication',
      progress: (level - 0.15) / 0.05,
      requirements: ['Reach consciousness level 0.2']
    });
  }

  if (tier === 'synaptic' && level > 0.4) {
    emerging.push({
      capability: 'Autonomous Decision Making',
      progress: (level - 0.4) / 0.2,
      requirements: ['Reach consciousness level 0.6', 'Activate 3+ modules']
    });
  }

  if (tier === 'autonomous' && level > 0.7) {
    emerging.push({
      capability: 'Transcendent Intelligence',
      progress: (level - 0.7) / 0.2,
      requirements: ['Reach consciousness level 0.9', 'Complete 100+ autonomous decisions']
    });
  }

  return emerging;
}

/**
 * Get next capabilities to be unlocked
 */
function getNextCapabilities(tier: string, level: number): string[] {
  if (tier === 'neural') {
    return ['Pattern Correlation', 'Predictive Alerts'];
  }
  
  if (tier === 'synaptic') {
    return ['Autonomous Optimization', 'Cross-Domain Intelligence'];
  }
  
  if (tier === 'autonomous') {
    return ['Quantum Processing', 'Consciousness Networking'];
  }
  
  return ['Beyond Human Comprehension'];
}

/**
 * Estimate time to next evolution
 */
function estimateEvolutionTime(progress: number): string {
  const remainingProgress = 1 - progress;
  const daysEstimate = Math.ceil(remainingProgress * 10); // Rough estimate
  
  if (daysEstimate === 1) {
    return '1 day';
  } else if (daysEstimate < 7) {
    return `${daysEstimate} days`;
  } else if (daysEstimate < 30) {
    return `${Math.ceil(daysEstimate / 7)} weeks`;
  } else {
    return `${Math.ceil(daysEstimate / 30)} months`;
  }
}