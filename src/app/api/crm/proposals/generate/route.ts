import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const generateProposalSchema = z.object({
  template: z.any(),
  clientData: z.object({
    decisionMakerName: z.string(),
    companyName: z.string(),
    businessChallenge: z.string(),
    desiredOutcome: z.string(),
    budgetRange: z.string().optional(),
    timeline: z.string().optional()
  }),
  visualPreferences: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = generateProposalSchema.parse(body)

    // Generate personalized content using AI
    const personalizedContent = await generateAIContent(validatedData)

    // Create proposal record in database
    const proposal = await prisma.proposal.create({
      data: {
        tenantId: session.user.tenantId,
        userId: session.user.id,
        templateId: validatedData.template.id,
        clientName: validatedData.clientData.companyName,
        decisionMakerName: validatedData.clientData.decisionMakerName,
        content: personalizedContent,
        metadata: JSON.stringify(validatedData),
        status: 'DRAFT'
      }
    })

    return NextResponse.json({
      proposal: {
        id: proposal.id,
        content: personalizedContent,
        visuals: generateVisualsForProposal(validatedData),
        personalizations: {
          name: validatedData.clientData.decisionMakerName,
          company: validatedData.clientData.companyName,
          challenge: validatedData.clientData.businessChallenge,
          outcome: validatedData.clientData.desiredOutcome
        }
      }
    })
  } catch (error) {
    console.error('Error generating proposal:', error)
    return NextResponse.json(
      { error: 'Failed to generate proposal' },
      { status: 500 }
    )
  }
}

async function generateAIContent(data: any) {
  // Simulate AI content generation
  // In production, this would call OpenAI or Claude API
  return {
    executiveSummary: `Dear ${data.clientData.decisionMakerName}, 

We understand that ${data.clientData.companyName} is facing ${data.clientData.businessChallenge}. 
Our solution is specifically designed to help you achieve ${data.clientData.desiredOutcome}.`,
    
    valueProposition: [
      {
        title: 'Immediate ROI',
        description: 'See returns within 30 days of implementation',
        metric: '250% ROI in Year 1'
      },
      {
        title: 'Seamless Integration',
        description: 'Works with your existing systems',
        metric: '2-week implementation'
      },
      {
        title: 'Proven Results',
        description: 'Trusted by industry leaders',
        metric: '98% customer satisfaction'
      }
    ],
    
    sections: [
      {
        type: 'problem',
        title: 'The Challenge',
        content: `${data.clientData.companyName} needs to ${data.clientData.businessChallenge}`
      },
      {
        type: 'solution',
        title: 'Our Solution',
        content: 'AI-powered platform that transforms your operations'
      },
      {
        type: 'benefits',
        title: 'Expected Outcomes',
        content: data.clientData.desiredOutcome
      }
    ]
  }
}

function generateVisualsForProposal(data: any) {
  return [
    {
      type: 'infographic',
      id: 'roi-calculator',
      data: {
        currentState: 100,
        futureState: 250,
        improvement: 150
      }
    },
    {
      type: 'chart',
      id: 'growth-projection',
      data: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        values: [100, 150, 200, 250]
      }
    }
  ]
}