/**
 * CoreFlow360 - Onboarding Progress API
 * Get user's current onboarding progress and state
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId') || 'demo-user-1' // Fallback for demo
    const tenantId = searchParams.get('tenantId') || 'demo-tenant'

    console.log(`📋 Getting onboarding progress for user: ${userId}`)

    // Get user's onboarding record
    const onboarding = await prisma.userOnboarding.findFirst({
      where: {
        userId,
        tenantId
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    if (!onboarding) {
      return NextResponse.json({
        success: true,
        hasOnboarding: false,
        selectedRole: null,
        completedSteps: [],
        isOnboarding: false,
        currentStep: 0
      })
    }

    // Parse completed steps
    const completedSteps = onboarding.completedSteps ? 
      JSON.parse(onboarding.completedSteps) : []

    const response = {
      success: true,
      hasOnboarding: true,
      selectedRole: onboarding.selectedRole,
      completedSteps,
      isOnboarding: !onboarding.isCompleted && onboarding.currentStep < onboarding.totalSteps,
      currentStep: onboarding.currentStep,
      totalSteps: onboarding.totalSteps,
      progress: onboarding.totalSteps > 0 ? 
        Math.round((onboarding.currentStep / onboarding.totalSteps) * 100) : 0,
      isCompleted: onboarding.isCompleted,
      startedAt: onboarding.createdAt,
      lastActive: onboarding.updatedAt
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Failed to get onboarding progress:', error)
    return NextResponse.json(
      { error: 'Failed to get onboarding progress' },
      { status: 500 }
    )
  }
}