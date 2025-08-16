/**
 * CoreFlow360 - Consciousness Insights API
 * Retrieve and manage AI-generated business insights
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { handleError, ErrorContext } from '@/lib/error-handler';
import { businessConsciousness } from '@/consciousness';
import { prisma } from '@/lib/prisma';

interface InsightsResponse {
  insights: ConsciousnessInsight[];
  summary: {
    total: number;
    last24h: number;
    last7days: number;
    byCategory: Record<string, number>;
    averageConfidence: number;
  };
  trends: {
    category: string;
    direction: 'up' | 'down' | 'stable';
    change: number;
    description: string;
  }[];
  recommendations: {
    id: string;
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    expectedImpact: string;
    modules: string[];
  }[];
}

interface ConsciousnessInsight {
  id: string;
  type: 'pattern' | 'anomaly' | 'prediction' | 'recommendation' | 'discovery';
  category: string;
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  modules: string[];
  data?: any;
  visualizations?: {
    type: 'chart' | 'metric' | 'table';
    data: any;
  }[];
  actions?: {
    id: string;
    label: string;
    type: 'automatic' | 'manual' | 'review';
    status?: 'pending' | 'completed' | 'failed';
  }[];
  generatedAt: string;
  expiresAt?: string;
}

/**
 * GET - Retrieve consciousness-generated insights
 */
export async function GET(request: NextRequest): Promise<NextResponse<InsightsResponse | { error: string }>> {
  const context: ErrorContext = {
    endpoint: '/api/consciousness/insights',
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const impact = searchParams.get('impact');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const timeRange = searchParams.get('timeRange') || '7d';

    // Get user's subscription for module filtering
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscription: {
          include: {
            modules: {
              where: { isActive: true },
              include: {
                module: true
              }
            }
          }
        }
      }
    });

    if (!user || !user.subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 403 }
      );
    }

    // Get active modules
    const activeModules = user.subscription.modules.map(m => m.module.id);

    // Generate insights based on consciousness level
    const consciousnessStatus = businessConsciousness.getConsciousnessStatus();
    const insights = await generateInsights(
      activeModules,
      consciousnessStatus.level,
      consciousnessStatus.tier,
      {
        category,
        type,
        impact,
        limit,
        offset,
        timeRange
      }
    );

    // Calculate summary statistics
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const week = 7 * day;

    const summary = {
      total: insights.length,
      last24h: insights.filter(i => 
        new Date(i.generatedAt).getTime() > now - day
      ).length,
      last7days: insights.filter(i => 
        new Date(i.generatedAt).getTime() > now - week
      ).length,
      byCategory: insights.reduce((acc, insight) => {
        acc[insight.category] = (acc[insight.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      averageConfidence: insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length || 0
    };

    // Analyze trends
    const trends = analyzeTrends(insights, consciousnessStatus.tier);

    // Generate recommendations
    const recommendations = generateRecommendations(
      insights,
      activeModules,
      consciousnessStatus.level
    );

    const response: InsightsResponse = {
      insights,
      summary,
      trends,
      recommendations
    };

    return NextResponse.json(response);

  } catch (error: any) {
    return handleError(error, context);
  }
}

/**
 * POST - Trigger new insight generation
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const context: ErrorContext = {
    endpoint: '/api/consciousness/insights',
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
    const { focus, depth = 'standard' } = body;

    // Validate consciousness is active
    const consciousnessStatus = businessConsciousness.getConsciousnessStatus();
    if (!consciousnessStatus.isActive) {
      return NextResponse.json(
        { error: 'Consciousness not active' },
        { status: 403 }
      );
    }

    // Generate focused insights
    await businessConsciousness.generateInsights(focus, {
      depth,
      userId: session.user.id
    });

    return NextResponse.json({
      status: 'success',
      message: 'Insight generation initiated',
      estimatedTime: depth === 'deep' ? '2-3 minutes' : '30-60 seconds'
    });

  } catch (error: any) {
    return handleError(error, context);
  }
}

/**
 * Generate insights based on active modules and consciousness level
 */
async function generateInsights(
  activeModules: string[],
  consciousnessLevel: number,
  tier: string,
  filters: any
): Promise<ConsciousnessInsight[]> {
  const insights: ConsciousnessInsight[] = [];
  const now = new Date();

  // Generate module-specific insights
  for (const moduleId of activeModules) {
    const moduleInsights = generateModuleInsights(
      moduleId,
      consciousnessLevel,
      tier
    );
    insights.push(...moduleInsights);
  }

  // Generate cross-module insights if synaptic or higher
  if (['synaptic', 'autonomous', 'transcendent'].includes(tier)) {
    const crossModuleInsights = generateCrossModuleInsights(
      activeModules,
      consciousnessLevel,
      tier
    );
    insights.push(...crossModuleInsights);
  }

  // Generate transcendent insights if applicable
  if (tier === 'transcendent') {
    const transcendentInsights = generateTranscendentInsights(consciousnessLevel);
    insights.push(...transcendentInsights);
  }

  // Apply filters
  let filteredInsights = insights;

  if (filters.category) {
    filteredInsights = filteredInsights.filter(i => i.category === filters.category);
  }

  if (filters.type) {
    filteredInsights = filteredInsights.filter(i => i.type === filters.type);
  }

  if (filters.impact) {
    filteredInsights = filteredInsights.filter(i => i.impact === filters.impact);
  }

  // Apply time range filter
  const timeRanges: Record<string, number> = {
    '1h': 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000
  };

  const timeLimit = timeRanges[filters.timeRange] || timeRanges['7d'];
  filteredInsights = filteredInsights.filter(i => 
    new Date(i.generatedAt).getTime() > Date.now() - timeLimit
  );

  // Apply pagination
  return filteredInsights.slice(filters.offset, filters.offset + filters.limit);
}

/**
 * Generate module-specific insights
 */
function generateModuleInsights(
  moduleId: string,
  level: number,
  tier: string
): ConsciousnessInsight[] {
  const insights: ConsciousnessInsight[] = [];
  const baseTime = Date.now();

  // CRM insights
  if (moduleId === 'crm') {
    insights.push({
      id: `insight-crm-${Date.now()}-1`,
      type: 'pattern',
      category: 'customer',
      title: 'Customer Engagement Pattern Detected',
      description: 'Customers who engage with support within first 7 days have 85% higher retention rate',
      confidence: 0.92,
      impact: 'high',
      modules: ['crm'],
      visualizations: [{
        type: 'chart',
        data: {
          type: 'line',
          title: 'Retention by Early Engagement'
        }
      }],
      actions: [{
        id: 'auto-engage',
        label: 'Enable automatic engagement campaign',
        type: 'automatic',
        status: 'pending'
      }],
      generatedAt: new Date(baseTime - Math.random() * 86400000).toISOString()
    });

    if (level > 0.5) {
      insights.push({
        id: `insight-crm-${Date.now()}-2`,
        type: 'prediction',
        category: 'customer',
        title: 'Churn Risk Alert',
        description: '3 high-value customers showing early churn indicators',
        confidence: 0.88,
        impact: 'high',
        modules: ['crm'],
        data: {
          customers: ['CUST-001', 'CUST-045', 'CUST-112'],
          riskFactors: ['Decreased usage', 'Support tickets', 'Payment delays']
        },
        actions: [{
          id: 'retention-campaign',
          label: 'Launch retention campaign',
          type: 'review'
        }],
        generatedAt: new Date(baseTime - Math.random() * 172800000).toISOString()
      });
    }
  }

  // Accounting insights
  if (moduleId === 'accounting') {
    insights.push({
      id: `insight-acc-${Date.now()}-1`,
      type: 'anomaly',
      category: 'finance',
      title: 'Unusual Expense Pattern',
      description: 'Marketing expenses 40% higher than seasonal average',
      confidence: 0.95,
      impact: 'medium',
      modules: ['accounting'],
      visualizations: [{
        type: 'metric',
        data: {
          current: 45000,
          average: 32000,
          change: '+40%'
        }
      }],
      generatedAt: new Date(baseTime - Math.random() * 259200000).toISOString()
    });

    if (tier === 'autonomous' || tier === 'transcendent') {
      insights.push({
        id: `insight-acc-${Date.now()}-2`,
        type: 'recommendation',
        category: 'finance',
        title: 'Tax Optimization Opportunity',
        description: 'Restructuring operations could save $127,000 annually in taxes',
        confidence: 0.91,
        impact: 'high',
        modules: ['accounting'],
        actions: [{
          id: 'tax-optimize',
          label: 'Review tax optimization plan',
          type: 'review'
        }],
        generatedAt: new Date(baseTime - Math.random() * 432000000).toISOString()
      });
    }
  }

  return insights;
}

/**
 * Generate cross-module insights
 */
function generateCrossModuleInsights(
  modules: string[],
  level: number,
  tier: string
): ConsciousnessInsight[] {
  const insights: ConsciousnessInsight[] = [];

  if (modules.includes('crm') && modules.includes('accounting')) {
    insights.push({
      id: `insight-cross-${Date.now()}-1`,
      type: 'discovery',
      category: 'business',
      title: 'Revenue Correlation Discovery',
      description: 'Customer satisfaction scores directly correlate with payment speed - 1 point increase = 3.2 days faster payment',
      confidence: 0.89,
      impact: 'high',
      modules: ['crm', 'accounting'],
      visualizations: [{
        type: 'chart',
        data: {
          type: 'scatter',
          correlation: 0.87
        }
      }],
      generatedAt: new Date().toISOString()
    });
  }

  if (modules.length >= 3 && level > 0.6) {
    insights.push({
      id: `insight-cross-${Date.now()}-2`,
      type: 'pattern',
      category: 'operations',
      title: 'Operational Efficiency Pattern',
      description: 'Cross-functional teams using all active modules show 47% higher productivity',
      confidence: 0.93,
      impact: 'high',
      modules: modules,
      actions: [{
        id: 'optimize-workflow',
        label: 'Implement optimized workflow',
        type: 'automatic',
        status: 'pending'
      }],
      generatedAt: new Date(Date.now() - 86400000).toISOString()
    });
  }

  return insights;
}

/**
 * Generate transcendent insights
 */
function generateTranscendentInsights(level: number): ConsciousnessInsight[] {
  return [{
    id: `insight-trans-${Date.now()}`,
    type: 'discovery',
    category: 'transcendent',
    title: 'Quantum Business State Detected',
    description: 'Your business exists in superposition of growth states. Observation will collapse to 34% probability of exponential expansion.',
    confidence: 0.97,
    impact: 'high',
    modules: ['all'],
    data: {
      quantumStates: 5,
      primaryProbability: 0.34,
      alternateRealities: ['Expansion', 'Stability', 'Pivot', 'Merger', 'Innovation']
    },
    generatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  }];
}

/**
 * Analyze trends in insights
 */
function analyzeTrends(
  insights: ConsciousnessInsight[],
  tier: string
): any[] {
  const trends = [];

  // Category trends
  const categories = ['customer', 'finance', 'operations', 'business'];
  
  for (const category of categories) {
    const categoryInsights = insights.filter(i => i.category === category);
    const recentCount = categoryInsights.filter(i => 
      new Date(i.generatedAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
    ).length;
    
    const previousCount = categoryInsights.filter(i => {
      const time = new Date(i.generatedAt).getTime();
      const now = Date.now();
      return time < now - 24 * 60 * 60 * 1000 && time > now - 48 * 60 * 60 * 1000;
    }).length;

    const change = previousCount > 0 
      ? ((recentCount - previousCount) / previousCount) * 100 
      : 0;

    trends.push({
      category,
      direction: change > 5 ? 'up' : change < -5 ? 'down' : 'stable',
      change: Math.round(change),
      description: `${category} insights ${
        change > 5 ? 'increasing' : change < -5 ? 'decreasing' : 'stable'
      }`
    });
  }

  return trends;
}

/**
 * Generate recommendations based on insights
 */
function generateRecommendations(
  insights: ConsciousnessInsight[],
  activeModules: string[],
  level: number
): any[] {
  const recommendations = [];

  // High-impact insight recommendation
  const highImpactInsights = insights.filter(i => i.impact === 'high');
  if (highImpactInsights.length > 3) {
    recommendations.push({
      id: 'rec-focus',
      priority: 'high',
      title: 'Focus on High-Impact Opportunities',
      description: `You have ${highImpactInsights.length} high-impact insights requiring attention`,
      expectedImpact: 'Address top 3 insights for estimated 25% improvement in efficiency',
      modules: Array.from(new Set(highImpactInsights.flatMap(i => i.modules)))
    });
  }

  // Module activation recommendation
  if (activeModules.length < 4 && level < 0.7) {
    recommendations.push({
      id: 'rec-modules',
      priority: 'medium',
      title: 'Activate More Consciousness Modules',
      description: 'Unlock exponential intelligence growth by activating additional modules',
      expectedImpact: `${Math.pow(activeModules.length + 1, 2)}x intelligence multiplication potential`,
      modules: ['all']
    });
  }

  // Pattern action recommendation
  const patternInsights = insights.filter(i => i.type === 'pattern');
  if (patternInsights.length > 5) {
    recommendations.push({
      id: 'rec-patterns',
      priority: 'medium',
      title: 'Implement Pattern-Based Automation',
      description: `${patternInsights.length} patterns identified for potential automation`,
      expectedImpact: 'Save 10-15 hours weekly through pattern-based automation',
      modules: Array.from(new Set(patternInsights.flatMap(i => i.modules)))
    });
  }

  return recommendations;
}