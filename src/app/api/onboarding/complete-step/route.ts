/**
 * CoreFlow360 - Onboarding Step Completion API
 * Track user progress through role-based onboarding flows
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'



const completeStepSchema = z.object({
  userId: z.string(),
  stepId: z.string(),
  stepData: z.object({}).passthrough().optional(),
  timeSpent: z.number().optional(),
  completed: z.boolean().default(true)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, stepId, stepData, timeSpent, completed } = completeStepSchema.parse(body)

    console.log(`✅ User ${userId} ${completed ? 'completed' : 'started'} step: ${stepId}`)

    // Get current onboarding record
    const onboarding = await prisma.userOnboarding.findUnique({
      where: { userId }
    })

    if (!onboarding) {
      return NextResponse.json(
        { error: 'Onboarding record not found. Please select a role first.' },
        { status: 404 }
      )
    }

    const completedSteps = JSON.parse(onboarding.completedSteps || '[]')
    const stepProgress = JSON.parse(onboarding.stepProgress || '{}')

    // Update step progress
    if (completed && !completedSteps.includes(stepId)) {
      completedSteps.push(stepId)
    }

    // Update step data
    stepProgress[stepId] = {
      ...stepProgress[stepId],
      ...stepData,
      timeSpent: timeSpent || 0,
      completedAt: completed ? new Date().toISOString() : null,
      lastUpdated: new Date().toISOString()
    }

    // Calculate completion percentage
    const completionPercentage = Math.round((completedSteps.length / onboarding.totalSteps) * 100)
    const isOnboardingComplete = completedSteps.length >= onboarding.totalSteps

    // Update current step if progressing
    let newCurrentStep = onboarding.currentStep
    if (completed && newCurrentStep < onboarding.totalSteps) {
      newCurrentStep = Math.min(newCurrentStep + 1, onboarding.totalSteps)
    }

    // Update onboarding record
    const updatedOnboarding = await prisma.userOnboarding.update({
      where: { userId },
      data: {
        currentStep: newCurrentStep,
        completedSteps: JSON.stringify(completedSteps),
        stepProgress: JSON.stringify(stepProgress),
        completionPercentage,
        isCompleted: isOnboardingComplete,
        completedAt: isOnboardingComplete ? new Date() : null,
        updatedAt: new Date()
      }
    })

    // Get user info for event tracking
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tenantId: true, name: true }
    })

    // Log the step completion event
    await prisma.conversionEvent.create({
      data: {
        tenantId: user?.tenantId || 'unknown',
        userId,
        eventType: completed ? 'onboarding_step_completed' : 'onboarding_step_started',
        triggerType: 'manual',
        triggerContext: JSON.stringify({
          stepId,
          stepData,
          timeSpent,
          currentStep: newCurrentStep,
          totalSteps: onboarding.totalSteps,
          completionPercentage,
          selectedRole: onboarding.selectedRole,
          isOnboardingComplete
        }),
        userPlan: 'free',
        currentModule: onboarding.recommendedAgent || 'crm',
        actionTaken: completed ? 'completed' : 'started',
        sessionId: request.headers.get('x-session-id') || undefined
      }
    })

    // If onboarding is complete, automatically set up their free AI agent
    if (isOnboardingComplete && onboarding.recommendedAgent) {
      await setupFreeAgent(userId, user?.tenantId || 'unknown', onboarding.recommendedAgent)
    }

    // Generate insights and recommendations
    const insights = generateOnboardingInsights(updatedOnboarding, stepProgress)
    const recommendations = generateRecommendations(updatedOnboarding, stepProgress)

    return NextResponse.json({
      success: true,
      message: completed ? 'Step completed successfully' : 'Step progress saved',
      data: {
        userId: updatedOnboarding.userId,
        stepId,
        progress: {
          currentStep: updatedOnboarding.currentStep,
          totalSteps: updatedOnboarding.totalSteps,
          completedSteps,
          completionPercentage: updatedOnboarding.completionPercentage,
          isCompleted: updatedOnboarding.isCompleted
        },
        nextStep: getNextStep(updatedOnboarding, completedSteps),
        timeRemaining: getEstimatedTimeRemaining(updatedOnboarding),
        achievements: getAchievements(completedSteps.length, onboarding.totalSteps),
        insights,
        recommendations
      },
      celebration: isOnboardingComplete ? {
        message: `🎉 Congratulations! Your ${getRoleName(onboarding.selectedRole)} setup is complete!`,
        benefits: getCompletionBenefits(onboarding.selectedRole),
        nextSteps: getPostOnboardingSteps(onboarding.selectedRole)
      } : null
    })

  } catch (error) {
    console.error('❌ Failed to complete step:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to complete step' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      )
    }

    const onboarding = await prisma.userOnboarding.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            createdAt: true
          }
        }
      }
    })

    if (!onboarding) {
      return NextResponse.json({
        success: true,
        hasProgress: false,
        message: 'No onboarding progress found'
      })
    }

    const completedSteps = JSON.parse(onboarding.completedSteps || '[]')
    const stepProgress = JSON.parse(onboarding.stepProgress || '{}')

    return NextResponse.json({
      success: true,
      hasProgress: true,
      data: {
        userId: onboarding.userId,
        selectedRole: onboarding.selectedRole,
        progress: {
          currentStep: onboarding.currentStep,
          totalSteps: onboarding.totalSteps,
          completedSteps,
          stepProgress,
          completionPercentage: onboarding.completionPercentage,
          isCompleted: onboarding.isCompleted,
          completedAt: onboarding.completedAt
        },
        timeline: {
          startedAt: onboarding.startedAt,
          lastUpdated: onboarding.updatedAt,
          timeSpent: calculateTotalTimeSpent(stepProgress),
          estimatedTimeRemaining: getEstimatedTimeRemaining(onboarding)
        },
        nextStep: onboarding.isCompleted ? null : getNextStep(onboarding, completedSteps),
        achievements: getAchievements(completedSteps.length, onboarding.totalSteps),
        insights: generateOnboardingInsights(onboarding, stepProgress)
      }
    })

  } catch (error) {
    console.error('❌ Failed to get onboarding progress:', error)
    return NextResponse.json(
      { error: 'Failed to get onboarding progress' },
      { status: 500 }
    )
  }
}

// Helper functions
async function setupFreeAgent(userId: string, tenantId: string, agentKey: string) {
  try {
    // Check if freemium user already exists
    const existingFreemiumUser = await prisma.freemiumUser.findUnique({
      where: { userId }
    })

    if (!existingFreemiumUser) {
      // Create freemium user with selected agent
      await prisma.freemiumUser.create({
        data: {
          userId,
          tenantId,
          selectedAgent: agentKey,
          dailyUsageCount: 0,
          dailyLimit: 10,
          daysActive: 1,
          firstLoginAt: new Date(),
          lastActiveAt: new Date()
        }
      })

      console.log(`🤖 Free AI agent ${agentKey} set up for user ${userId}`)
    }
  } catch (error) {
    console.error('❌ Failed to setup free agent:', error)
  }
}

function generateOnboardingInsights(onboarding: any, stepProgress: any) {
  const insights = []
  const completedSteps = JSON.parse(onboarding.completedSteps || '[]')
  
  // Progress insights
  if (onboarding.completionPercentage >= 75) {
    insights.push({
      type: 'progress',
      message: 'You\'re almost there! Just one more step to unlock your AI assistant.',
      priority: 'high'
    })
  } else if (onboarding.completionPercentage >= 50) {
    insights.push({
      type: 'progress',
      message: 'Great progress! You\'re halfway through your personalized setup.',
      priority: 'medium'
    })
  }

  // Time-based insights
  const totalTimeSpent = calculateTotalTimeSpent(stepProgress)
  if (totalTimeSpent > 0) {
    const avgTimePerStep = totalTimeSpent / completedSteps.length
    if (avgTimePerStep < 120) { // Less than 2 minutes per step
      insights.push({
        type: 'efficiency',
        message: 'You\'re moving quickly through the setup! Your efficiency will pay off.',
        priority: 'low'
      })
    }
  }

  // Role-specific insights
  const roleInsights = getRoleSpecificInsights(onboarding.selectedRole, completedSteps)
  insights.push(...roleInsights)

  return insights
}

function generateRecommendations(onboarding: any, stepProgress: any) {
  const recommendations = []
  
  // Based on current progress
  if (onboarding.completionPercentage < 25) {
    recommendations.push({
      type: 'motivation',
      title: 'Complete Your Setup',
      description: 'Finish setting up your AI assistant to start seeing results immediately.',
      action: 'Continue Setup',
      priority: 'high'
    })
  }

  // Role-specific recommendations
  const roleRecommendations = getRoleSpecificRecommendations(onboarding.selectedRole)
  recommendations.push(...roleRecommendations)

  return recommendations
}

function getNextStep(onboarding: any, completedSteps: string[]) {
  if (onboarding.isCompleted) return null
  
  const allSteps = getOnboardingSteps(onboarding.selectedRole)
  const nextStep = allSteps.find(step => !completedSteps.includes(step.id))
  
  return nextStep || null
}

function getEstimatedTimeRemaining(onboarding: any): string {
  if (onboarding.isCompleted) return '0 minutes'
  
  const remainingSteps = onboarding.totalSteps - onboarding.currentStep
  const avgTimePerStep = 3 // 3 minutes average
  
  return `${remainingSteps * avgTimePerStep} minutes`
}

function getAchievements(completedSteps: number, totalSteps: number) {
  const achievements = []
  
  if (completedSteps >= 1) {
    achievements.push({
      id: 'first_step',
      title: 'Getting Started',
      description: 'Completed your first onboarding step',
      icon: '🚀',
      unlockedAt: new Date().toISOString()
    })
  }
  
  if (completedSteps >= totalSteps / 2) {
    achievements.push({
      id: 'halfway',
      title: 'Halfway Hero',
      description: 'Completed 50% of your setup',
      icon: '⚡',
      unlockedAt: new Date().toISOString()
    })
  }
  
  if (completedSteps >= totalSteps) {
    achievements.push({
      id: 'completed',
      title: 'Setup Complete',
      description: 'Completed your entire onboarding journey',
      icon: '🎉',
      unlockedAt: new Date().toISOString()
    })
  }
  
  return achievements
}

function getCompletionBenefits(role: string): string[] {
  const benefits: Record<string, string[]> = {
    'ceo': [
      'Real-time executive dashboard configured',
      'Strategic AI insights activated',
      'Performance monitoring enabled',
      'Mobile access ready'
    ],
    'cfo': [
      'Financial intelligence system ready',
      'ROI tracking automated',
      'Forecasting models activated',
      'Compliance monitoring enabled'
    ]
  }
  
  return benefits[role] || benefits['ceo']
}

function getPostOnboardingSteps(role: string): string[] {
  return [
    'Explore your AI assistant capabilities',
    'Connect your business data sources',
    'Set up automated reports',
    'Invite your team members',
    'Schedule a success check-in'
  ]
}

function getRoleName(role: string): string {
  const names: Record<string, string> = {
    'ceo': 'CEO Command Center',
    'cfo': 'CFO Financial Intelligence',
    'cto': 'CTO Technical Dashboard',
    'sales': 'Sales Acceleration Hub',
    'operations': 'Operations Optimization Center'
  }
  return names[role] || 'Business Intelligence Center'
}

function calculateTotalTimeSpent(stepProgress: any): number {
  return Object.values(stepProgress).reduce((total: number, step: any) => {
    return total + (step.timeSpent || 0)
  }, 0)
}

function getOnboardingSteps(role: string) {
  // This would typically come from a configuration file or database
  const steps: Record<string, any[]> = {
    'ceo': [
      { id: 'strategic-setup', title: 'Strategic Dashboard Setup' },
      { id: 'ai-insights', title: 'AI Business Intelligence' },
      { id: 'performance-tracking', title: 'Real-time Performance' },
      { id: 'mobile-access', title: 'Mobile Executive Access' }
    ],
    'cfo': [
      { id: 'financial-integration', title: 'Financial Data Integration' },
      { id: 'roi-calculator', title: 'AI ROI Calculator' },
      { id: 'forecasting-setup', title: 'Predictive Forecasting' },
      { id: 'compliance-monitoring', title: 'Compliance & Reporting' }
    ]
  }
  
  return steps[role] || steps['ceo']
}

function getRoleSpecificInsights(role: string, completedSteps: string[]) {
  const insights: Record<string, any[]> = {
    'ceo': [
      {
        type: 'strategic',
        message: 'Your executive dashboard will show 300% faster decision-making metrics.',
        priority: 'medium'
      }
    ],
    'cfo': [
      {
        type: 'financial',
        message: 'AI-powered forecasting typically improves accuracy by 40%.',
        priority: 'medium'
      }
    ]
  }
  
  return insights[role] || []
}

function getRoleSpecificRecommendations(role: string) {
  const recommendations: Record<string, any[]> = {
    'ceo': [
      {
        type: 'strategic',
        title: 'Connect Business Metrics',
        description: 'Link your key performance indicators for real-time monitoring.',
        priority: 'high'
      }
    ],
    'cfo': [
      {
        type: 'financial',
        title: 'Import Financial Data',
        description: 'Connect your accounting system for automated analysis.',
        priority: 'high'
      }
    ]
  }
  
  return recommendations[role] || []
}