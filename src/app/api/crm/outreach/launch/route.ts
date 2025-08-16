import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const launchSequenceSchema = z.object({
  sequence: z.object({
    id: z.string(),
    name: z.string(),
    steps: z.array(z.object({
      day: z.number(),
      methods: z.array(z.string())
    }))
  }),
  methods: z.array(z.string()),
  targetProfile: z.object({
    name: z.string(),
    title: z.string(),
    company: z.string(),
    industry: z.string()
  })
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = launchSequenceSchema.parse(body)

    // Create outreach campaign
    const campaign = await prisma.outreachCampaign.create({
      data: {
        tenantId: session.user.tenantId,
        userId: session.user.id,
        name: `${validatedData.sequence.name} - ${validatedData.targetProfile.name}`,
        targetName: validatedData.targetProfile.name,
        targetCompany: validatedData.targetProfile.company,
        sequenceData: JSON.stringify(validatedData.sequence),
        selectedMethods: validatedData.methods,
        status: 'ACTIVE',
        currentStep: 0,
        metadata: JSON.stringify(validatedData.targetProfile)
      }
    })

    // Schedule the first step
    const firstStep = validatedData.sequence.steps[0]
    await scheduleOutreachStep(campaign.id, firstStep, validatedData.targetProfile)

    // Track campaign analytics
    await prisma.campaignAnalytics.create({
      data: {
        campaignId: campaign.id,
        tenantId: session.user.tenantId,
        totalSteps: validatedData.sequence.steps.length,
        completedSteps: 0,
        engagementRate: 0,
        responseRate: 0
      }
    })

    return NextResponse.json({
      success: true,
      campaignId: campaign.id,
      message: `Outreach sequence launched for ${validatedData.targetProfile.name}`,
      firstStepScheduled: new Date().toISOString(),
      totalSteps: validatedData.sequence.steps.length
    })
  } catch (error) {
    console.error('Error launching sequence:', error)
    return NextResponse.json(
      { error: 'Failed to launch sequence' },
      { status: 500 }
    )
  }
}

async function scheduleOutreachStep(campaignId: string, step: any, targetProfile: any) {
  // In production, this would integrate with a job queue (BullMQ, etc.)
  // For now, we'll create scheduled tasks in the database
  
  for (const method of step.methods) {
    await prisma.scheduledOutreach.create({
      data: {
        campaignId,
        method,
        scheduledFor: new Date(Date.now() + step.day * 24 * 60 * 60 * 1000),
        targetData: JSON.stringify(targetProfile),
        status: 'PENDING'
      }
    })
  }
  
  // Simulate immediate execution for demo purposes
  if (step.day === 0) {
    // Execute immediately
    setTimeout(() => {
      executeOutreachMethod(campaignId, step.methods[0], targetProfile)
    }, 1000)
  }
}

async function executeOutreachMethod(campaignId: string, method: string, targetProfile: any) {
  // This would integrate with various channels (email, SMS, social media APIs)
  console.log(`Executing ${method} for ${targetProfile.name} at ${targetProfile.company}`)
  
  // Update campaign progress
  await prisma.outreachCampaign.update({
    where: { id: campaignId },
    data: {
      lastActivityAt: new Date(),
      currentStep: { increment: 1 }
    }
  })
}