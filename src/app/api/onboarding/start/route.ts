/**
 * CoreFlow360 - Onboarding Start API
 * Initialize onboarding process for a user
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'



export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      selectedRole, 
      roleTitle, 
      totalSteps, 
      estimatedTotalTime,
      userId = 'demo-user-1',
      tenantId = 'demo-tenant'
    } = body

    console.log(`🚀 Starting onboarding for user: ${userId}, role: ${selectedRole}`)

    // Create or update onboarding record
    const onboarding = await prisma.userOnboarding.upsert({
      where: {
        userId_tenantId: {
          userId,
          tenantId
        }
      },
      create: {
        userId,
        tenantId,
        selectedRole,
        roleTitle,
        totalSteps,
        currentStep: 0,
        completedSteps: JSON.stringify([]),
        isCompleted: false,
        estimatedTotalTime,
        startedAt: new Date()
      },
      update: {
        selectedRole,
        roleTitle,
        totalSteps,
        currentStep: 0,
        completedSteps: JSON.stringify([]),
        isCompleted: false,
        estimatedTotalTime,
        startedAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Track conversion event for onboarding start
    try {
      await prisma.conversionEvent.create({
        data: {
          userId,
          tenantId,
          eventType: 'onboarding_started',
          triggerType: 'role_selection',
          actionTaken: 'started',
          currentModule: selectedRole,
          userPlan: 'FREE',
          triggerContext: JSON.stringify({
            selectedRole,
            roleTitle,
            totalSteps,
            estimatedTotalTime
          })
        }
      })
    } catch (conversionError) {
      console.warn('Failed to track conversion event:', conversionError)
    }

    const response = {
      success: true,
      message: 'Onboarding started successfully',
      onboarding: {
        id: onboarding.id,
        selectedRole: onboarding.selectedRole,
        roleTitle: onboarding.roleTitle,
        totalSteps: onboarding.totalSteps,
        currentStep: onboarding.currentStep,
        estimatedTotalTime: onboarding.estimatedTotalTime,
        startedAt: onboarding.startedAt
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Failed to start onboarding:', error)
    return NextResponse.json(
      { error: 'Failed to start onboarding' },
      { status: 500 }
    )
  }
}