/**
 * CoreFlow360 - Role Selection API
 * Handle executive role selection for personalized onboarding
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const roleSelectionSchema = z.object({
  userId: z.string(),
  selectedRole: z.enum(['ceo', 'cfo', 'cto', 'sales', 'operations']),
  customization: z.object({}).passthrough().optional(),
  source: z.enum(['onboarding', 'settings', 'signup']).default('onboarding'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, selectedRole, customization, source } = roleSelectionSchema.parse(body)

    // Check if onboarding record already exists
    const existingOnboarding = await prisma.userOnboarding.findUnique({
      where: { userId },
    })

    let onboardingRecord

    if (existingOnboarding) {
      // Update existing record
      onboardingRecord = await prisma.userOnboarding.update({
        where: { userId },
        data: {
          selectedRole,
          roleConfirmedAt: new Date(),
          customization: JSON.stringify(customization || {}),
          recommendedAgent: getRecommendedAgent(selectedRole),
          updatedAt: new Date(),
        },
      })
    } else {
      // Create new onboarding record
      onboardingRecord = await prisma.userOnboarding.create({
        data: {
          userId,
          selectedRole,
          roleConfirmedAt: new Date(),
          currentStep: 0,
          totalSteps: getRoleTotalSteps(selectedRole),
          completedSteps: JSON.stringify([]),
          stepProgress: JSON.stringify({}),
          customization: JSON.stringify(customization || {}),
          recommendedAgent: getRecommendedAgent(selectedRole),
          isCompleted: false,
        },
      })
    }

    // Get user info for tenant tracking
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tenantId: true },
    })

    // Log the role selection event
    await prisma.conversionEvent.create({
      data: {
        tenantId: user?.tenantId || 'unknown',
        userId,
        eventType: 'role_selected',
        triggerType: 'manual',
        triggerContext: JSON.stringify({
          selectedRole,
          source,
          customization: customization || {},
          recommendedAgent: getRecommendedAgent(selectedRole),
        }),
        userPlan: 'free', // New users start as free
        currentModule: getRecommendedAgent(selectedRole),
        actionTaken: 'selected',
        sessionId: request.headers.get('x-session-id') || undefined,
      },
    })

    // Generate personalized onboarding plan
    const onboardingPlan = generateOnboardingPlan(selectedRole)

    return NextResponse.json({
      success: true,
      message: 'Role selected successfully',
      data: {
        userId: onboardingRecord.userId,
        selectedRole: onboardingRecord.selectedRole,
        roleInfo: getRoleInfo(selectedRole),
        recommendedAgent: onboardingRecord.recommendedAgent,
        agentInfo: getAgentInfo(onboardingRecord.recommendedAgent),
        onboardingPlan,
        progress: {
          currentStep: onboardingRecord.currentStep,
          totalSteps: onboardingRecord.totalSteps,
          completionPercentage: onboardingRecord.completionPercentage,
          isCompleted: onboardingRecord.isCompleted,
        },
        nextSteps: getNextSteps(selectedRole),
        estimatedTime: getEstimatedTime(selectedRole),
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Failed to select role' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId parameter is required' }, { status: 400 })
    }

    const onboarding = await prisma.userOnboarding.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
    })

    if (!onboarding) {
      return NextResponse.json({
        success: true,
        hasOnboarding: false,
        message: 'No onboarding record found',
        availableRoles: getAvailableRoles(),
      })
    }

    const completedSteps = JSON.parse(onboarding.completedSteps || '[]')
    const stepProgress = JSON.parse(onboarding.stepProgress || '{}')
    const customization = JSON.parse(onboarding.customization || '{}')

    return NextResponse.json({
      success: true,
      hasOnboarding: true,
      data: {
        userId: onboarding.userId,
        selectedRole: onboarding.selectedRole,
        roleInfo: getRoleInfo(onboarding.selectedRole),
        roleConfirmedAt: onboarding.roleConfirmedAt,
        recommendedAgent: onboarding.recommendedAgent,
        agentInfo: getAgentInfo(onboarding.recommendedAgent),
        progress: {
          currentStep: onboarding.currentStep,
          totalSteps: onboarding.totalSteps,
          completedSteps,
          stepProgress,
          completionPercentage: onboarding.completionPercentage,
          isCompleted: onboarding.isCompleted,
          completedAt: onboarding.completedAt,
        },
        customization,
        timeline: {
          startedAt: onboarding.startedAt,
          updatedAt: onboarding.updatedAt,
          estimatedCompletion: getEstimatedCompletion(onboarding),
        },
        nextSteps: onboarding.isCompleted
          ? []
          : getNextSteps(onboarding.selectedRole, onboarding.currentStep),
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get role selection' }, { status: 500 })
  }
}

// Helper functions
function getRecommendedAgent(role: string): string {
  const agentMap: Record<string, string> = {
    ceo: 'analytics', // CEOs need strategic insights
    cfo: 'finance', // CFOs need financial intelligence
    cto: 'operations', // CTOs need operational efficiency
    sales: 'sales', // Sales executives need sales AI
    operations: 'operations', // Operations managers need workflow optimization
  }
  return agentMap[role] || 'crm'
}

function getRoleInfo(role: string) {
  const roleInfo: Record<string, unknown> = {
    ceo: {
      title: 'Chief Executive Officer',
      subtitle: 'Strategic Command Center',
      description:
        'Transform your business with AI-powered strategic insights and real-time performance visibility.',
      focusAreas: [
        'Strategic Planning',
        'Performance Monitoring',
        'Growth Analytics',
        'Executive Reporting',
      ],
      primaryGoals: ['Scale business growth', 'Monitor key metrics', 'Strategic decision making'],
    },
    cfo: {
      title: 'Chief Financial Officer',
      subtitle: 'ROI & Financial Intelligence',
      description:
        'Maximize financial performance with AI-driven forecasting and automated ROI tracking.',
      focusAreas: [
        'ROI Analysis',
        'Financial Forecasting',
        'Budget Optimization',
        'Risk Management',
      ],
      primaryGoals: ['Optimize cash flow', 'Reduce costs', 'Financial planning and analysis'],
    },
    cto: {
      title: 'Chief Technology Officer',
      subtitle: 'Technical Architecture',
      description:
        'Optimize your tech stack with AI-powered architecture insights and performance monitoring.',
      focusAreas: [
        'System Architecture',
        'Performance Monitoring',
        'Security Analysis',
        'Tech Stack Optimization',
      ],
      primaryGoals: ['Scale infrastructure', 'Optimize performance', 'Ensure security'],
    },
    sales: {
      title: 'Sales Executive',
      subtitle: 'Revenue Generation',
      description:
        'Accelerate sales performance with AI-powered lead intelligence and pipeline optimization.',
      focusAreas: [
        'Pipeline Management',
        'Lead Intelligence',
        'Sales Forecasting',
        'Deal Acceleration',
      ],
      primaryGoals: ['Close more deals', 'Improve conversion rates', 'Optimize sales process'],
    },
    operations: {
      title: 'Operations Manager',
      subtitle: 'Process Optimization',
      description:
        'Streamline operations with AI-driven workflow automation and efficiency optimization.',
      focusAreas: [
        'Workflow Automation',
        'Process Optimization',
        'Resource Management',
        'Efficiency Analytics',
      ],
      primaryGoals: ['Improve efficiency', 'Automate workflows', 'Reduce operational costs'],
    },
  }
  return roleInfo[role] || roleInfo['ceo']
}

function getAgentInfo(agentKey: string) {
  const agentInfo: Record<string, unknown> = {
    sales: {
      name: 'AI Sales Expert',
      description: 'Closes deals and finds prospects faster than any human',
      capabilities: [
        'Lead scoring',
        'Pipeline forecasting',
        'Proposal generation',
        'Follow-up automation',
      ],
    },
    finance: {
      name: 'AI Money Detective',
      description: 'Tracks every penny and predicts cash flow like magic',
      capabilities: [
        'Financial forecasting',
        'Expense tracking',
        'ROI analysis',
        'Budget optimization',
      ],
    },
    operations: {
      name: 'AI Operations Expert',
      description: 'Optimizes workflows and eliminates bottlenecks',
      capabilities: [
        'Process automation',
        'Resource optimization',
        'Performance monitoring',
        'Efficiency analysis',
      ],
    },
    analytics: {
      name: 'AI Crystal Ball',
      description: 'Predicts the future with data-driven insights',
      capabilities: [
        'Predictive analytics',
        'Trend analysis',
        'Strategic insights',
        'Performance dashboards',
      ],
    },
    crm: {
      name: 'AI Customer Expert',
      description: 'Manages relationships and automates customer success',
      capabilities: [
        'Customer segmentation',
        'Lifecycle management',
        'Churn prediction',
        'Engagement optimization',
      ],
    },
  }
  return agentInfo[agentKey] || agentInfo['crm']
}

function getRoleTotalSteps(role: string): number {
  const stepCounts: Record<string, number> = {
    ceo: 4,
    cfo: 4,
    cto: 4,
    sales: 4,
    operations: 4,
  }
  return stepCounts[role] || 4
}

function generateOnboardingPlan(role: string) {
  const plans: Record<string, unknown> = {
    ceo: [
      {
        id: 'strategic-setup',
        title: 'Strategic Dashboard Setup',
        description: 'Configure your executive dashboard with key business metrics',
        estimatedTime: '3 min',
        priority: 'high',
      },
      {
        id: 'ai-insights',
        title: 'AI Business Intelligence',
        description: 'Connect your AI strategy advisor for growth recommendations',
        estimatedTime: '2 min',
        priority: 'high',
      },
      {
        id: 'performance-tracking',
        title: 'Real-time Performance',
        description: 'Set up automated executive reports and alerts',
        estimatedTime: '2 min',
        priority: 'medium',
      },
      {
        id: 'mobile-access',
        title: 'Mobile Executive Access',
        description: 'Configure mobile dashboard for on-the-go monitoring',
        estimatedTime: '1 min',
        priority: 'low',
      },
    ],
    cfo: [
      {
        id: 'financial-integration',
        title: 'Financial Data Integration',
        description: 'Connect your financial systems for real-time analysis',
        estimatedTime: '5 min',
        priority: 'high',
      },
      {
        id: 'roi-calculator',
        title: 'AI ROI Calculator',
        description: 'Set up automated ROI tracking with live business data',
        estimatedTime: '3 min',
        priority: 'high',
      },
      {
        id: 'forecasting-setup',
        title: 'Predictive Forecasting',
        description: 'Configure AI-powered financial forecasting models',
        estimatedTime: '4 min',
        priority: 'medium',
      },
      {
        id: 'compliance-monitoring',
        title: 'Compliance & Reporting',
        description: 'Automate financial reporting and compliance checks',
        estimatedTime: '3 min',
        priority: 'medium',
      },
    ],
  }

  // Use CEO plan as default for other roles
  return plans[role] || plans['ceo']
}

function getNextSteps(role: string, currentStep: number = 0): string[] {
  const nextSteps: Record<string, string[]> = {
    ceo: [
      'Set up your strategic command center',
      'Connect your business intelligence',
      'Configure performance monitoring',
      'Enable mobile access',
    ],
    cfo: [
      'Integrate financial systems',
      'Set up ROI tracking',
      'Configure forecasting models',
      'Enable compliance monitoring',
    ],
  }

  const steps = nextSteps[role] || nextSteps['ceo']
  return steps.slice(currentStep)
}

function getEstimatedTime(role: string): string {
  const times: Record<string, string> = {
    ceo: '8 minutes',
    cfo: '15 minutes',
    cto: '12 minutes',
    sales: '10 minutes',
    operations: '12 minutes',
  }
  return times[role] || '10 minutes'
}

function getEstimatedCompletion(onboarding: unknown): Date | null {
  if (onboarding.isCompleted) return null

  const remainingSteps = onboarding.totalSteps - onboarding.currentStep
  const avgTimePerStep = 3 // 3 minutes average

  return new Date(Date.now() + remainingSteps * avgTimePerStep * 60 * 1000)
}

function getAvailableRoles() {
  return [
    { id: 'ceo', title: 'Chief Executive Officer', subtitle: 'Strategic Leadership' },
    { id: 'cfo', title: 'Chief Financial Officer', subtitle: 'Financial Management' },
    { id: 'cto', title: 'Chief Technology Officer', subtitle: 'Technology Leadership' },
    { id: 'sales', title: 'Sales Executive', subtitle: 'Revenue Generation' },
    { id: 'operations', title: 'Operations Manager', subtitle: 'Process Optimization' },
  ]
}
