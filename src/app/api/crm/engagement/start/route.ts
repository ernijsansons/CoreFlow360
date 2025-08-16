import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const startEngagementSchema = z.object({
  sequenceId: z.string(),
  contactIds: z.array(z.string()),
  channels: z.array(z.string())
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sequenceId, contactIds, channels } = startEngagementSchema.parse(body)

    // Create engagement campaign
    const campaign = await prisma.engagementCampaign.create({
      data: {
        tenantId: session.user.tenantId,
        userId: session.user.id,
        sequenceId,
        name: `Campaign ${Date.now()}`,
        targetContactIds: contactIds,
        selectedChannels: channels,
        status: 'ACTIVE',
        startedAt: new Date(),
        metadata: JSON.stringify({
          automation_level: 'high',
          personalization_enabled: true,
          ai_optimization: true
        })
      }
    })

    // Initialize engagement tracking for each contact
    for (const contactId of contactIds) {
      await prisma.contactEngagement.create({
        data: {
          campaignId: campaign.id,
          contactId,
          currentStep: 0,
          status: 'ACTIVE',
          engagementScore: 0,
          lastTouchAt: new Date()
        }
      })
    }

    // Schedule first touchpoints
    await scheduleInitialTouchpoints(campaign.id, sequenceId, contactIds, channels)

    // Track campaign analytics
    await prisma.engagementAnalytics.create({
      data: {
        campaignId: campaign.id,
        tenantId: session.user.tenantId,
        totalContacts: contactIds.length,
        channelsUsed: channels.length,
        automationLevel: 85,
        personalizationScore: 92
      }
    })

    return NextResponse.json({
      success: true,
      campaignId: campaign.id,
      contactsAdded: contactIds.length,
      channelsActivated: channels.length,
      estimatedDuration: calculateSequenceDuration(sequenceId),
      firstTouchpointScheduled: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error starting engagement:', error)
    return NextResponse.json(
      { error: 'Failed to start engagement sequence' },
      { status: 500 }
    )
  }
}

async function scheduleInitialTouchpoints(
  campaignId: string, 
  sequenceId: string, 
  contactIds: string[], 
  channels: string[]
) {
  // In production, this would integrate with a job queue (BullMQ, Agenda, etc.)
  // For now, we'll create scheduled tasks in the database
  
  const sequences = {
    'executive_outreach': [
      { channel: 'linkedin', delay: 0 },
      { channel: 'personalized_video', delay: 2 * 24 * 60 * 60 * 1000 },
      { channel: 'direct_mail', delay: 7 * 24 * 60 * 60 * 1000 },
      { channel: 'phone_call', delay: 14 * 24 * 60 * 60 * 1000 }
    ],
    'nurture_sequence': [
      { channel: 'email', delay: 0 },
      { channel: 'linkedin', delay: 3 * 24 * 60 * 60 * 1000 },
      { channel: 'whatsapp', delay: 7 * 24 * 60 * 60 * 1000 }
    ]
  }

  const sequence = sequences[sequenceId as keyof typeof sequences] || sequences.nurture_sequence

  for (const contactId of contactIds) {
    for (let i = 0; i < sequence.length; i++) {
      const step = sequence[i]
      if (channels.includes(step.channel)) {
        await prisma.scheduledTouchpoint.create({
          data: {
            campaignId,
            contactId,
            channel: step.channel,
            stepNumber: i,
            scheduledFor: new Date(Date.now() + step.delay),
            content: await generateTouchpointContent(step.channel, contactId),
            status: 'PENDING'
          }
        })
      }
    }
  }
}

async function generateTouchpointContent(channel: string, contactId: string) {
  // Generate personalized content for each touchpoint
  const contentTemplates = {
    linkedin: {
      type: 'connection_request',
      message: 'Hi {name}, I noticed your work at {company} and would love to connect!',
      personalization_level: 'high'
    },
    email: {
      type: 'introduction_email',
      subject: 'Quick question about {company}',
      body: 'Hi {name}, I came across {company} and was impressed by...',
      personalization_level: 'ultra'
    },
    whatsapp: {
      type: 'casual_message',
      message: 'Hi {name}! Hope your week is going well. Quick question about {company}...',
      personalization_level: 'medium'
    },
    personalized_video: {
      type: 'ceo_introduction',
      script: 'Hi {name}, I wanted to personally reach out about {company}...',
      personalization_level: 'ultra'
    },
    direct_mail: {
      type: 'executive_package',
      items: ['personalized_note', 'company_swag', 'case_study'],
      personalization_level: 'ultra'
    },
    phone_call: {
      type: 'follow_up_call',
      script: 'Hi {name}, following up on our previous touchpoints...',
      personalization_level: 'high'
    }
  }

  return JSON.stringify(contentTemplates[channel as keyof typeof contentTemplates] || contentTemplates.email)
}

function calculateSequenceDuration(sequenceId: string): number {
  // Return estimated duration in days
  const durations = {
    'executive_outreach': 21,
    'nurture_sequence': 14
  }
  
  return durations[sequenceId as keyof typeof durations] || 7
}