/**
 * CoreFlow360 - Decision Maker Intelligence API
 * Executive tracking and intelligence endpoints ($49/month premium feature)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import DecisionMakerIntelligence from '@/lib/crm/decision-maker-intelligence'

// Get tracked executives and their intelligence
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')
    const companyId = searchParams.get('companyId')
    const includeSignals = searchParams.get('includeSignals') === 'true'
    const includePredictions = searchParams.get('includePredictions') === 'true'

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 })
    }

    // Check if user has premium subscription for Decision Maker Intelligence
    const subscription = await prisma.subscription.findFirst({
      where: {
        tenantId,
        status: 'ACTIVE',
        plan: {
          features: {
            has: 'DECISION_MAKER_INTELLIGENCE',
          },
        },
      },
      include: { plan: true },
    })

    if (!subscription) {
      return NextResponse.json(
        {
          error: 'Premium feature - Decision Maker Intelligence requires $49/month subscription',
          upgrade: {
            feature: 'DECISION_MAKER_INTELLIGENCE',
            price: 49,
            currency: 'USD',
            billing: 'monthly',
          },
        },
        { status: 402 }
      ) // Payment Required
    }

    // Build query filters
    const where: unknown = { tenantId }
    if (companyId) where.currentCompanyId = companyId

    const executives = await prisma.executiveProfile.findMany({
      where,
      include: {
        jobChangeHistory: {
          orderBy: { changeDate: 'desc' },
          take: 5,
        },
        buyingSignals: includeSignals
          ? {
              where: {
                detectedDate: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                },
              },
              orderBy: { relevanceScore: 'desc' },
            }
          : false,
        contentEngagement: {
          orderBy: { date: 'desc' },
          take: 10,
        },
        responseHistory: {
          orderBy: { date: 'desc' },
          take: 5,
        },
      },
      orderBy: [
        { influenceScore: 'desc' },
        { signalStrength: 'desc' },
        { lastActivityDate: 'desc' },
      ],
    })

    // Transform data for frontend
    const transformedExecutives = executives.map((exec) => ({
      id: exec.id,
      firstName: exec.firstName,
      lastName: exec.lastName,
      currentTitle: exec.currentTitle,
      currentCompany: exec.currentCompany,
      currentCompanyId: exec.currentCompanyId,
      profileUrl: exec.profileUrl,
      profilePictureUrl: exec.profilePictureUrl,
      location: exec.location,
      headline: exec.headline,

      // Influence metrics
      influenceScore: exec.influenceScore,
      connectionLevel: exec.connectionLevel,
      mutualConnections: exec.mutualConnections,
      followerCount: exec.followerCount,

      // Decision making power
      budgetAuthority: exec.budgetAuthority,
      decisionAreas: exec.decisionAreas,
      reportingLevel: exec.reportingLevel,

      // Change tracking
      lastJobChangeDate: exec.lastJobChangeDate?.toISOString(),
      jobChangePrediction: exec.jobChangePrediction,
      recentJobChanges: exec.jobChangeHistory?.slice(0, 3).map((change) => ({
        id: change.id,
        changeType: change.changeType,
        previousTitle: change.previousTitle,
        previousCompany: change.previousCompany,
        newTitle: change.newTitle,
        newCompany: change.newCompany,
        changeDate: change.changeDate.toISOString(),
        impactLevel: change.impactLevel,
        opportunityScore: change.opportunityScore,
      })),

      // Buying signals
      signalStrength: exec.signalStrength,
      lastSignalDate: exec.lastSignalDate?.toISOString(),
      buyingSignals: includeSignals
        ? exec.buyingSignals?.map((signal) => ({
            id: signal.id,
            signalType: signal.signalType,
            signal: signal.signal,
            description: signal.description,
            strength: signal.strength,
            urgency: signal.urgency,
            source: signal.source,
            sourceUrl: signal.sourceUrl,
            detectedDate: signal.detectedDate.toISOString(),
            relevanceScore: Number(signal.relevanceScore),
            opportunitySize: signal.opportunitySize,
            keywords: signal.keywords,
            sentiment: signal.sentiment,
          }))
        : undefined,

      // AI insights
      personalityProfile: exec.personalityProfile,
      communicationStyle: exec.communicationStyle,
      decisionMakingStyle: exec.decisionMakingStyle,

      // Engagement data
      lastActivityDate: exec.lastActivityDate?.toISOString(),
      responseRate:
        exec.responseHistory?.length > 0
          ? exec.responseHistory.filter((r) => r.engaged).length / exec.responseHistory.length
          : 0,
      avgResponseTime:
        exec.responseHistory?.length > 0
          ? exec.responseHistory.reduce((sum, r) => sum + r.responseTime, 0) /
            exec.responseHistory.length
          : 0,

      createdAt: exec.createdAt.toISOString(),
      updatedAt: exec.updatedAt.toISOString(),
    }))

    // Get summary analytics
    const totalExecutives = transformedExecutives.length
    const highValueSignals = transformedExecutives.reduce(
      (sum, exec) =>
        sum +
        (exec.buyingSignals?.filter((s) => s.strength === 'HIGH' || s.strength === 'CRITICAL')
          .length || 0),
      0
    )
    const recentJobChanges = transformedExecutives.reduce(
      (sum, exec) => sum + (exec.recentJobChanges?.length || 0),
      0
    )

    return NextResponse.json({
      executives: transformedExecutives,
      summary: {
        totalExecutives,
        highValueSignals,
        recentJobChanges,
        averageInfluenceScore: Math.round(
          transformedExecutives.reduce((sum, exec) => sum + exec.influenceScore, 0) /
            totalExecutives
        ),
        signalDistribution: {
          CRITICAL: transformedExecutives.filter((e) => e.signalStrength === 'CRITICAL').length,
          HIGH: transformedExecutives.filter((e) => e.signalStrength === 'HIGH').length,
          MEDIUM: transformedExecutives.filter((e) => e.signalStrength === 'MEDIUM').length,
          LOW: transformedExecutives.filter((e) => e.signalStrength === 'LOW').length,
        },
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch decision makers' }, { status: 500 })
  }
}

// Add new executive to tracking
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tenantId, linkedinUrl, companyId, autoEnrich = true } = body

    if (!tenantId || !linkedinUrl) {
      return NextResponse.json({ error: 'Tenant ID and LinkedIn URL required' }, { status: 400 })
    }

    // Check premium subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        tenantId,
        status: 'ACTIVE',
        plan: {
          features: {
            has: 'DECISION_MAKER_INTELLIGENCE',
          },
        },
      },
    })

    if (!subscription) {
      return NextResponse.json(
        {
          error: 'Premium feature requires $49/month subscription',
        },
        { status: 402 }
      )
    }

    // Extract LinkedIn ID from URL
    const linkedinId = linkedinUrl.match(/\/in\/([^\/]+)\/?/)?.[1]
    if (!linkedinId) {
      return NextResponse.json({ error: 'Invalid LinkedIn URL' }, { status: 400 })
    }

    // Check if executive already exists
    const existingExecutive = await prisma.executiveProfile.findFirst({
      where: { linkedinId },
    })

    if (existingExecutive) {
      return NextResponse.json({ error: 'Executive already being tracked' }, { status: 409 })
    }

    // Initialize Decision Maker Intelligence engine
    const intelligence = new DecisionMakerIntelligence()

    // Enrich executive profile if requested
    const executiveData: unknown = {
      tenantId,
      linkedinId,
      linkedinUrl,
      firstName: '',
      lastName: '',
      currentTitle: '',
      currentCompany: '',
      currentCompanyId: companyId,
      profileUrl: linkedinUrl,
      influenceScore: 0,
      connectionLevel: 3, // Default
      reportingLevel: 3, // Default
      signalStrength: 'LOW',
    }

    if (autoEnrich) {
      try {
        // This would call LinkedIn API to enrich profile
        // For now, we'll create with minimal data
      } catch (enrichError) {}
    }

    const executive = await prisma.executiveProfile.create({
      data: executiveData,
    })

    // Start monitoring for job changes and buying signals in background
    // This would typically be handled by a job queue
    setImmediate(async () => {
      try {
        await intelligence.monitorJobChanges()
        if (companyId) {
          await intelligence.detectBuyingSignals(companyId, [executive.id])
        }
      } catch (monitorError) {}
    })

    return NextResponse.json({
      executive: {
        id: executive.id,
        linkedinId: executive.linkedinId,
        firstName: executive.firstName,
        lastName: executive.lastName,
        currentTitle: executive.currentTitle,
        currentCompany: executive.currentCompany,
        profileUrl: executive.profileUrl,
        influenceScore: executive.influenceScore,
        signalStrength: executive.signalStrength,
        createdAt: executive.createdAt.toISOString(),
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add executive to tracking' }, { status: 500 })
  }
}

// Update executive tracking settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      executiveId,
      tenantId,
      monitoringEnabled = true,
      alertThreshold = 'MEDIUM',
      customFields = {},
    } = body

    if (!executiveId || !tenantId) {
      return NextResponse.json({ error: 'Executive ID and tenant ID required' }, { status: 400 })
    }

    // Check ownership
    const executive = await prisma.executiveProfile.findFirst({
      where: { id: executiveId, tenantId },
    })

    if (!executive) {
      return NextResponse.json({ error: 'Executive not found' }, { status: 404 })
    }

    const updatedExecutive = await prisma.executiveProfile.update({
      where: { id: executiveId },
      data: {
        monitoringEnabled,
        alertThreshold,
        customFields,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      executive: {
        id: updatedExecutive.id,
        monitoringEnabled: updatedExecutive.monitoringEnabled,
        alertThreshold: updatedExecutive.alertThreshold,
        updatedAt: updatedExecutive.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update executive tracking' }, { status: 500 })
  }
}

// Remove executive from tracking
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const executiveId = searchParams.get('executiveId')
    const tenantId = searchParams.get('tenantId')

    if (!executiveId || !tenantId) {
      return NextResponse.json({ error: 'Executive ID and tenant ID required' }, { status: 400 })
    }

    // Check ownership
    const executive = await prisma.executiveProfile.findFirst({
      where: { id: executiveId, tenantId },
    })

    if (!executive) {
      return NextResponse.json({ error: 'Executive not found' }, { status: 404 })
    }

    // Soft delete by disabling monitoring (preserve historical data)
    await prisma.executiveProfile.update({
      where: { id: executiveId },
      data: {
        monitoringEnabled: false,
        isActive: false,
        deletedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove executive from tracking' }, { status: 500 })
  }
}
