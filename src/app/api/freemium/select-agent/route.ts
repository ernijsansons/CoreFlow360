/**
 * CoreFlow360 - Freemium Agent Selection API
 * Handle free tier AI agent selection and tracking
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseValidatedData } from '@/middleware/validation'
import { z } from 'zod'



// Updated schema with proper naming
const selectAgentBodySchema = z.object({
  userId: z.string().optional(), // Optional as we might get from auth
  tenantId: z.string().optional(), // Optional as we might get from auth
  selectedAgent: z.enum(['sales', 'finance', 'crm', 'operations', 'analytics', 'hr']),
  fromOnboarding: z.boolean().default(false)
})

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const { data, error } = await parseValidatedData(request, selectAgentBodySchema)
    
    if (error) {
      return error
    }
    
    if (!data) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }
    
    // Use demo values if not provided
    const userId = data.userId || 'demo-user-1'
    const tenantId = data.tenantId || 'demo-tenant'
    const { selectedAgent, fromOnboarding } = data

    console.log(`🆓 User ${userId} selecting free AI agent: ${selectedAgent}`)

    // Check if freemium user already exists
    const existingFreemiumUser = await prisma.freemiumUser.findUnique({
      where: { userId }
    })

    if (existingFreemiumUser) {
      // Update existing selection
      const updatedUser = await prisma.freemiumUser.update({
        where: { userId },
        data: {
          selectedAgent,
          lastActiveAt: new Date(),
          updatedAt: new Date()
        }
      })

      // Log the agent change as a conversion event
      await prisma.conversionEvent.create({
        data: {
          tenantId,
          userId,
          eventType: 'agent_changed',
          triggerType: fromOnboarding ? 'onboarding' : 'manual',
          triggerContext: JSON.stringify({
            previousAgent: existingFreemiumUser.selectedAgent,
            newAgent: selectedAgent,
            fromOnboarding
          }),
          userPlan: 'free',
          currentModule: selectedAgent,
          actionTaken: 'selected',
          sessionId: request.headers.get('x-session-id') || undefined
        }
      })

      return NextResponse.json({
        success: true,
        message: 'AI agent selection updated',
        data: {
          userId: updatedUser.userId,
          selectedAgent: updatedUser.selectedAgent,
          dailyUsageCount: updatedUser.dailyUsageCount,
          dailyLimit: updatedUser.dailyLimit,
          daysActive: updatedUser.daysActive
        }
      })
    }

    // Create new freemium user
    const newFreemiumUser = await prisma.freemiumUser.create({
      data: {
        userId,
        tenantId,
        selectedAgent,
        dailyUsageCount: 0,
        dailyLimit: 10,
        daysActive: 1,
        firstLoginAt: new Date(),
        lastActiveAt: new Date()
      }
    })

    // Log the initial agent selection
    await prisma.conversionEvent.create({
      data: {
        tenantId,
        userId,
        eventType: 'agent_selected',
        triggerType: fromOnboarding ? 'onboarding' : 'manual',
        triggerContext: JSON.stringify({
          selectedAgent,
          fromOnboarding,
          isInitialSelection: true
        }),
        userPlan: 'free',
        currentModule: selectedAgent,
        actionTaken: 'selected',
        sessionId: request.headers.get('x-session-id') || undefined
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Free AI agent selected successfully',
      data: {
        userId: newFreemiumUser.userId,
        selectedAgent: newFreemiumUser.selectedAgent,
        dailyUsageCount: newFreemiumUser.dailyUsageCount,
        dailyLimit: newFreemiumUser.dailyLimit,
        daysActive: newFreemiumUser.daysActive,
        welcomeMessage: `Welcome! Your ${getAgentName(selectedAgent)} is ready to help you succeed.`
      }
    })

  } catch (error) {
    console.error('❌ Failed to select AI agent:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to select AI agent' },
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

    const freemiumUser = await prisma.freemiumUser.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!freemiumUser) {
      return NextResponse.json({
        success: true,
        hasSelection: false,
        message: 'No AI agent selected yet'
      })
    }

    return NextResponse.json({
      success: true,
      hasSelection: true,
      data: {
        userId: freemiumUser.userId,
        selectedAgent: freemiumUser.selectedAgent,
        selectedAgentName: getAgentName(freemiumUser.selectedAgent),
        dailyUsageCount: freemiumUser.dailyUsageCount,
        dailyLimit: freemiumUser.dailyLimit,
        usagePercentage: Math.round((freemiumUser.dailyUsageCount / freemiumUser.dailyLimit) * 100),
        daysActive: freemiumUser.daysActive,
        upgradePromptedCount: freemiumUser.upgradePromptedCount,
        lastActiveAt: freemiumUser.lastActiveAt,
        memberSince: freemiumUser.createdAt
      }
    })

  } catch (error) {
    console.error('❌ Failed to get agent selection:', error)
    return NextResponse.json(
      { error: 'Failed to get agent selection' },
      { status: 500 }
    )
  }
}

// Helper function to get human-friendly agent names
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