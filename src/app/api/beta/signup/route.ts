/**
 * Beta Signup API Endpoint
 *
 * Handles beta user registration with BUSINESS INTELLIGENCE-based prioritization
 * and automated follow-up sequences.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '../../../../lib/db'
import { rateLimit } from '../../../../lib/rate-limit'

// Validation schema
const betaSignupSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  company: z.string().min(1, 'Company is required'),
  role: z.string().min(1, 'Role is required'),
  industry: z.string().min(1, 'Industry is required'),
  companySize: z.string().min(1, 'Company size is required'),
  currentChallenges: z.array(z.string()).min(1, 'At least one challenge is required'),
  intelligenceLevel: z.number().min(1).max(10),
  referralSource: z.string().optional(),
  priorityScore: z.number().min(0).max(500),
})

type BetaSignupData = z.infer<typeof betaSignupSchema>

// Rate limiting: 3 signups per 15 minutes per IP
const limiter = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 500, // Max 500 unique IPs per interval
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    try {
      await limiter.check(3, ip) // 3 signups per interval
    } catch {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again later.' },
        { status: 429 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = betaSignupSchema.parse(body)

    // Check if user already signed up (using new schema)
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered for beta access' },
        { status: 409 }
      )
    }

    // Enhanced BUSINESS INTELLIGENCE analysis
    const enhancedIntelligenceData = await calculateEnhancedIntelligence(validatedData)

    // Create beta user record (using existing user table structure)
    const betaUser = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: `${validatedData.firstName} ${validatedData.lastName}`,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        company: validatedData.company,
        role: validatedData.role,
        industry: validatedData.industry,
        companySize: validatedData.companySize,
        intelligenceLevel: validatedData.intelligenceLevel,
        referralSource: validatedData.referralSource || 'direct',
        priorityScore: validatedData.priorityScore,
        status: 'beta_pending',

        // Store additional data in JSON fields if available
        metadata: {
          currentChallenges: validatedData.currentChallenges,
          intelligenceGapScore: enhancedIntelligenceData.intelligenceGap,
          transformationReadiness: enhancedIntelligenceData.readiness,
          businessComplexity: enhancedIntelligenceData.complexity,
          expectedROI: enhancedIntelligenceData.expectedROI,
          signupSource: 'BUSINESS INTELLIGENCE-awakening-form',
          userAgent: request.headers.get('user-agent'),
          ipAddress: ip,
          betaTier: determineBetaTier(validatedData.priorityScore),
        },
      },
    })

    // Determine beta tier based on priority score
    const betaTier = determineBetaTier(validatedData.priorityScore)

    // Track beta signup event
    await trackBetaSignupEvent(betaUser, enhancedIntelligenceData)

    return NextResponse.json({
      success: true,
      message: 'Welcome to the BUSINESS INTELLIGENCE revolution!',
      data: {
        id: betaUser.id,
        betaTier,
        intelligenceLevel: validatedData.intelligenceLevel,
        priorityScore: validatedData.priorityScore,
        expectedInviteDate: calculateExpectedInviteDate(betaTier),
        intelligenceInsights: enhancedIntelligenceData.insights,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
        },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error. Please try again.' }, { status: 500 })
  }
}

// Helper functions for BUSINESS INTELLIGENCE analysis
async function calculateEnhancedIntelligence(data: BetaSignupData) {
  const { currentChallenges, companySize, role, industry, intelligenceLevel } = data

  // Intelligence Gap Analysis
  const challengeComplexity = currentChallenges.length * 10
  const roleMultiplier = getRoleMultiplier(role)
  const industryComplexity = getIndustryComplexity(industry)
  const sizeComplexity = getSizeComplexity(companySize)

  const intelligenceGap = Math.min(challengeComplexity + industryComplexity + sizeComplexity, 100)

  // Transformation Readiness Score
  const executiveLevel = ['CEO/Founder', 'CTO/VP Engineering', 'VP Operations'].includes(role)
    ? 50
    : 30
  const intelligenceReadiness = intelligenceLevel < 5 ? 40 : 20 // Lower BUSINESS INTELLIGENCE = higher readiness for change
  const transformationReadiness = Math.min(executiveLevel + intelligenceReadiness, 100)

  // Business Complexity Score
  const complexity = (intelligenceGap + sizeComplexity + industryComplexity) / 3

  // Expected ROI Calculation
  const baseSizeROI = getSizeROI(companySize)
  const challengeROI = currentChallenges.length * 50000 // $50k per challenge area
  const expectedROI = Math.min(baseSizeROI + challengeROI, 5000000) // Cap at $5M

  // BUSINESS INTELLIGENCE Insights
  const insights = generateBusinessIntelligenceInsights(data, {
    intelligenceGap,
    transformationReadiness,
    complexity,
    expectedROI,
  })

  return {
    intelligenceGap,
    readiness: transformationReadiness,
    complexity,
    expectedROI,
    insights,
  }
}

function getRoleMultiplier(role: string): number {
  const multipliers: Record<string, number> = {
    'CEO/Founder': 1.5,
    'CTO/VP Engineering': 1.4,
    'VP Operations': 1.3,
    'Director of Technology': 1.2,
    'IT Manager': 1.1,
    'Business Operations Manager': 1.0,
  }
  return multipliers[role] || 1.0
}

function getIndustryComplexity(industry: string): number {
  const complexities: Record<string, number> = {
    Manufacturing: 40,
    'Financial Services': 35,
    Healthcare: 35,
    'Technology/Software': 30,
    'Professional Services': 25,
    'Retail/E-commerce': 25,
    Education: 20,
    'Non-profit': 15,
  }
  return complexities[industry] || 25
}

function getSizeComplexity(companySize: string): number {
  const complexities: Record<string, number> = {
    '1000+ employees': 50,
    '201-1000 employees': 40,
    '51-200 employees': 30,
    '11-50 employees': 20,
    '1-10 employees': 10,
  }
  return complexities[companySize] || 25
}

function getSizeROI(companySize: string): number {
  const baseROIs: Record<string, number> = {
    '1000+ employees': 2000000, // $2M
    '201-1000 employees': 1000000, // $1M
    '51-200 employees': 500000, // $500K
    '11-50 employees': 200000, // $200K
    '1-10 employees': 100000, // $100K
  }
  return baseROIs[companySize] || 200000
}

function determineBetaTier(priorityScore: number): string {
  if (priorityScore >= 400) return 'platinum'
  if (priorityScore >= 300) return 'gold'
  if (priorityScore >= 200) return 'silver'
  return 'bronze'
}

function calculateExpectedInviteDate(betaTier: string): Date {
  const now = new Date()
  const daysToAdd = {
    platinum: 3, // 3 days
    gold: 7, // 1 week
    silver: 14, // 2 weeks
    bronze: 30, // 1 month
  }

  const days = daysToAdd[betaTier as keyof typeof daysToAdd] || 30
  const inviteDate = new Date(now)
  inviteDate.setDate(now.getDate() + days)

  return inviteDate
}

function generateBusinessIntelligenceInsights(
  data: BetaSignupData,
  analysis: { intelligenceGap: number; readiness: number; complexity: number; expectedROI: number }
): string[] {
  const insights: string[] = []

  // Intelligence Gap Insights
  if (analysis.intelligenceGap > 70) {
    insights.push('Your business has significant untapped intelligence potential')
  } else if (analysis.intelligenceGap > 40) {
    insights.push('Multiple optimization opportunities identified across departments')
  }

  // BUSINESS INTELLIGENCE Level Insights
  if (data.intelligenceLevel < 4) {
    insights.push('Perfect timing for BUSINESS INTELLIGENCE transformation - maximum growth potential')
  } else if (data.intelligenceLevel > 7) {
    insights.push('Your advanced awareness positions you for rapid intelligent automation')
  }

  // Industry-Specific Insights
  if (data.industry === 'Manufacturing') {
    insights.push('Manufacturing BUSINESS INTELLIGENCE transformation typically yields 15-25x ROI')
  } else if (data.industry === 'Technology/Software') {
    insights.push('Tech companies experience fastest BUSINESS INTELLIGENCE evolution')
  }

  // Challenge-Based Insights
  if (data.currentChallenges.includes('Departments operate in silos')) {
    insights.push('Breaking silos can unlock 300-500% intelligence multiplication')
  }

  if (data.currentChallenges.includes('Manual processes slow us down')) {
    insights.push('Process BUSINESS INTELLIGENCE typically saves 40+ hours per employee monthly')
  }

  // ROI Insights
  if (analysis.expectedROI > 1000000) {
    insights.push(
      `Projected first-year BUSINESS INTELLIGENCE ROI: $${(analysis.expectedROI / 1000000).toFixed(1)}M+`
    )
  } else {
    insights.push(
      `Projected first-year BUSINESS INTELLIGENCE ROI: $${(analysis.expectedROI / 1000).toFixed(0)}K+`
    )
  }

  return insights.slice(0, 3) // Return top 3 insights
}

async function trackBetaSignupEvent(betaUser: unknown, analysis: unknown) {
  try {
    // Simple console logging for now - in production would send to analytics service
    console.log('[Beta Signup Analytics]', {
      userId: betaUser.id,
      email: betaUser.email,
      company: betaUser.company,
      industry: betaUser.industry,
      intelligenceLevel: betaUser.intelligenceLevel,
      priorityScore: betaUser.priorityScore,
      intelligenceGap: analysis.intelligenceGap,
      expectedROI: analysis.expectedROI,
    })
  } catch (error) {}
}

export async function GET(_request: NextRequest) {
  try {
    // Get beta program statistics (using new user table structure)
    const totalSignups = await prisma.user.count({
      where: { status: { contains: 'beta' } },
    })

    const pendingSignups = await prisma.user.count({
      where: { status: 'beta_pending' },
    })

    const approvedSignups = await prisma.user.count({
      where: { status: 'beta_approved' },
    })

    const industryBreakdown = await prisma.user.groupBy({
      by: ['industry'],
      where: { status: { contains: 'beta' } },
      _count: { industry: true },
    })

    return NextResponse.json({
      success: true,
      stats: {
        total_signups: totalSignups,
        pending: pendingSignups,
        approved: approvedSignups,
        active: approvedSignups, // Simplified for now
      },
      industryBreakdown: industryBreakdown.map((item) => ({
        industry_vertical: item.industry,
        count: item._count.industry,
      })),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch beta program statistics',
      },
      { status: 500 }
    )
  }
}

// Handle other HTTP methods
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 })
}
