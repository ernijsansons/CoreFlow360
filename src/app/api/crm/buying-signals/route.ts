/**
 * CoreFlow360 - Buying Signals Detection API
 * AI-powered buying signal detection and opportunity scoring
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import DecisionMakerIntelligence from '@/lib/crm/decision-maker-intelligence'

// Get buying signals with filtering and scoring
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')
    const companyId = searchParams.get('companyId')
    const executiveId = searchParams.get('executiveId')
    const signalType = searchParams.get('signalType')
    const strength = searchParams.get('strength')
    const urgency = searchParams.get('urgency')
    const days = parseInt(searchParams.get('days') || '30')
    const limit = parseInt(searchParams.get('limit') || '50')
    const minRelevanceScore = parseFloat(searchParams.get('minRelevanceScore') || '0.5')

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 })
    }

    // Check premium subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        tenantId,
        status: 'ACTIVE',
        plan: {
          features: {
            has: 'DECISION_MAKER_INTELLIGENCE'
          }
        }
      }
    })

    if (!subscription) {
      return NextResponse.json({ 
        error: 'Premium feature requires Decision Maker Intelligence subscription',
        upgrade: {
          feature: 'DECISION_MAKER_INTELLIGENCE',
          price: 49,
          currency: 'USD'
        }
      }, { status: 402 })
    }

    // Build query filters
    const where: any = {
      executive: { tenantId },
      detectedDate: {
        gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      },
      relevanceScore: {
        gte: minRelevanceScore
      }
    }

    if (companyId) where.companyId = companyId
    if (executiveId) where.executiveId = executiveId
    if (signalType) where.signalType = signalType
    if (strength) where.strength = strength
    if (urgency) where.urgency = urgency

    const buyingSignals = await prisma.buyingSignal.findMany({
      where,
      include: {
        executive: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            currentTitle: true,
            currentCompany: true,
            currentCompanyId: true,
            profileUrl: true,
            profilePictureUrl: true,
            influenceScore: true,
            connectionLevel: true,
            reportingLevel: true
          }
        },
        company: {
          select: {
            id: true,
            name: true,
            industry: true,
            size: true,
            website: true
          }
        }
      },
      orderBy: [
        { strength: 'desc' },
        { urgency: 'desc' },
        { relevanceScore: 'desc' },
        { detectedDate: 'desc' }
      ],
      take: limit
    })

    // Transform and enrich signals
    const transformedSignals = await Promise.all(
      buyingSignals.map(async (signal) => {
        // Calculate opportunity assessment
        const opportunityAssessment = await this.calculateOpportunityAssessment(signal)
        
        return {
          id: signal.id,
          executiveId: signal.executiveId,
          companyId: signal.companyId,
          
          executive: signal.executive ? {
            id: signal.executive.id,
            name: `${signal.executive.firstName} ${signal.executive.lastName}`,
            title: signal.executive.currentTitle,
            company: signal.executive.currentCompany,
            profileUrl: signal.executive.profileUrl,
            profilePictureUrl: signal.executive.profilePictureUrl,
            influenceScore: signal.executive.influenceScore,
            connectionLevel: signal.executive.connectionLevel,
            reportingLevel: signal.executive.reportingLevel
          } : null,
          
          company: signal.company,
          
          signalType: signal.signalType,
          signal: signal.signal,
          description: signal.description,
          strength: signal.strength,
          urgency: signal.urgency,
          
          source: signal.source,
          sourceUrl: signal.sourceUrl,
          detectedDate: signal.detectedDate.toISOString(),
          
          relevanceScore: Number(signal.relevanceScore),
          keywords: signal.keywords,
          sentiment: signal.sentiment,
          
          opportunitySize: signal.opportunitySize,
          timeToDecision: signal.timeToDecision,
          competitionLevel: signal.competitionLevel,
          
          // Enhanced assessments
          opportunityAssessment,
          
          // Action tracking
          alertSent: signal.alertSent,
          actionTaken: signal.actionTaken,
          actionType: signal.actionType,
          outcome: signal.outcome,
          
          // Timing analysis
          timingAnalysis: this.analyzeSignalTiming(signal),
          
          // Recommended actions
          recommendedActions: await this.generateRecommendedActions(signal)
        }
      })
    )

    // Calculate analytics and insights
    const analytics = {
      total: transformedSignals.length,
      byStrength: {
        CRITICAL: transformedSignals.filter(s => s.strength === 'CRITICAL').length,
        HIGH: transformedSignals.filter(s => s.strength === 'HIGH').length,
        MEDIUM: transformedSignals.filter(s => s.strength === 'MEDIUM').length,
        LOW: transformedSignals.filter(s => s.strength === 'LOW').length
      },
      byType: transformedSignals.reduce((acc, signal) => {
        acc[signal.signalType] = (acc[signal.signalType] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      byUrgency: {
        URGENT: transformedSignals.filter(s => s.urgency === 'URGENT').length,
        HIGH: transformedSignals.filter(s => s.urgency === 'HIGH').length,
        MEDIUM: transformedSignals.filter(s => s.urgency === 'MEDIUM').length,
        LOW: transformedSignals.filter(s => s.urgency === 'LOW').length
      },
      averageRelevanceScore: Math.round(
        transformedSignals.reduce((sum, s) => sum + s.relevanceScore, 0) / 
        transformedSignals.length * 100
      ) / 100,
      totalOpportunityValue: transformedSignals.reduce((sum, s) => 
        sum + (s.opportunitySize?.max || 0), 0
      ),
      actionStats: {
        alertsSent: transformedSignals.filter(s => s.alertSent).length,
        actionsStarted: transformedSignals.filter(s => s.actionTaken).length,
        successfulOutcomes: transformedSignals.filter(s => 
          s.outcome && ['MEETING_SCHEDULED', 'PROPOSAL_SENT', 'DEAL_WON'].includes(s.outcome)
        ).length
      }
    }

    // Get trending signals
    const trendingSignals = await this.getTrendingSignalTypes(tenantId, days)

    return NextResponse.json({
      buyingSignals: transformedSignals,
      analytics,
      trending: trendingSignals,
      pagination: {
        limit,
        total: transformedSignals.length,
        hasMore: transformedSignals.length === limit
      }
    })

  } catch (error) {
    console.error('Error fetching buying signals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch buying signals' },
      { status: 500 }
    )
  }
}

// Manually trigger buying signal detection
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      tenantId,
      companyIds = [],
      executiveIds = [],
      signalTypes = [],
      forceRefresh = false
    } = body

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID required' },
        { status: 400 }
      )
    }

    // Check premium subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        tenantId,
        status: 'ACTIVE',
        plan: {
          features: {
            has: 'DECISION_MAKER_INTELLIGENCE'
          }
        }
      }
    })

    if (!subscription) {
      return NextResponse.json({ 
        error: 'Premium feature requires subscription' 
      }, { status: 402 })
    }

    const intelligence = new DecisionMakerIntelligence()

    // Process each company
    const detectionResults = []
    const companiesToProcess = companyIds.length > 0 ? companyIds : 
      await this.getTrackedCompanies(tenantId)

    for (const companyId of companiesToProcess) {
      try {
        const executivesToProcess = executiveIds.length > 0 ? executiveIds :
          await this.getCompanyExecutives(companyId, tenantId)

        const signals = await intelligence.detectBuyingSignals(companyId, executivesToProcess)
        
        // Filter by signal types if specified
        const filteredSignals = signalTypes.length > 0 
          ? signals.filter(s => signalTypes.includes(s.signalType))
          : signals

        detectionResults.push({
          companyId,
          signalsDetected: filteredSignals.length,
          signals: filteredSignals.map(s => ({
            id: s.id,
            signalType: s.signalType,
            strength: s.strength,
            relevanceScore: s.relevanceScore
          }))
        })

        // Send alerts for critical signals
        const criticalSignals = filteredSignals.filter(s => s.strength === 'CRITICAL')
        for (const signal of criticalSignals) {
          await this.sendBuyingSignalAlert(signal, tenantId)
        }

      } catch (companyError) {
        console.error(`Error processing company ${companyId}:`, companyError)
      }
    }

    const totalSignals = detectionResults.reduce((sum, result) => sum + result.signalsDetected, 0)

    return NextResponse.json({
      success: true,
      companiesProcessed: detectionResults.length,
      totalSignalsDetected: totalSignals,
      results: detectionResults
    })

  } catch (error) {
    console.error('Error triggering buying signal detection:', error)
    return NextResponse.json(
      { error: 'Failed to trigger buying signal detection' },
      { status: 500 }
    )
  }
}

// Update signal action status
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      signalId,
      tenantId,
      actionTaken = true,
      actionType,
      outcome,
      notes,
      followUpDate
    } = body

    if (!signalId || !tenantId) {
      return NextResponse.json(
        { error: 'Signal ID and tenant ID required' },
        { status: 400 }
      )
    }

    // Verify access
    const signal = await prisma.buyingSignal.findFirst({
      where: {
        id: signalId,
        executive: { tenantId }
      },
      include: { executive: true }
    })

    if (!signal) {
      return NextResponse.json(
        { error: 'Buying signal not found' },
        { status: 404 }
      )
    }

    // Update signal
    const updatedSignal = await prisma.buyingSignal.update({
      where: { id: signalId },
      data: {
        actionTaken,
        actionType,
        outcome,
        notes,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        lastUpdated: new Date()
      }
    })

    // Log activity
    await prisma.crmActivity.create({
      data: {
        tenantId,
        userId: session.user.id,
        entityType: 'BUYING_SIGNAL',
        entityId: signalId,
        activityType: actionTaken ? 'ACTION_TAKEN' : 'STATUS_UPDATE',
        description: `Buying signal action: ${actionType || 'Status updated'} for ${signal.executive.firstName} ${signal.executive.lastName}`,
        metadata: {
          signalType: signal.signalType,
          signalStrength: signal.strength,
          actionType,
          outcome
        }
      }
    })

    return NextResponse.json({
      success: true,
      signal: {
        id: updatedSignal.id,
        actionTaken: updatedSignal.actionTaken,
        actionType: updatedSignal.actionType,
        outcome: updatedSignal.outcome,
        followUpDate: updatedSignal.followUpDate?.toISOString(),
        lastUpdated: updatedSignal.lastUpdated.toISOString()
      }
    })

  } catch (error) {
    console.error('Error updating buying signal action:', error)
    return NextResponse.json(
      { error: 'Failed to update buying signal action' },
      { status: 500 }
    )
  }
}

// Helper methods
async function calculateOpportunityAssessment(signal: any) {
  return {
    dealProbability: this.calculateDealProbability(signal),
    timelineEstimate: this.estimateTimeline(signal),
    competitorRisk: this.assessCompetitorRisk(signal),
    budgetFit: this.assessBudgetFit(signal),
    decisionMakerAccess: this.assessDecisionMakerAccess(signal)
  }
}

function calculateDealProbability(signal: any): number {
  let probability = 0.5 // Base probability

  // Adjust based on signal strength
  switch (signal.strength) {
    case 'CRITICAL': probability += 0.3; break
    case 'HIGH': probability += 0.2; break
    case 'MEDIUM': probability += 0.1; break
    case 'LOW': probability -= 0.1; break
  }

  // Adjust based on urgency
  switch (signal.urgency) {
    case 'URGENT': probability += 0.2; break
    case 'HIGH': probability += 0.1; break
    case 'MEDIUM': probability += 0.05; break
    case 'LOW': probability -= 0.05; break
  }

  // Adjust based on executive influence
  if (signal.executive) {
    const influenceBonus = (signal.executive.influenceScore - 50) / 100 * 0.2
    probability += influenceBonus
  }

  return Math.max(0, Math.min(1, probability))
}

function estimateTimeline(signal: any): string {
  const urgencyToTimeline = {
    'URGENT': '1-2 weeks',
    'HIGH': '1-2 months',
    'MEDIUM': '3-6 months',
    'LOW': '6+ months'
  }
  return urgencyToTimeline[signal.urgency as keyof typeof urgencyToTimeline] || '3-6 months'
}

function assessCompetitorRisk(signal: any): 'LOW' | 'MEDIUM' | 'HIGH' {
  // Logic based on signal type and market conditions
  const highRiskSignalTypes = ['HIRING', 'FUNDING', 'RFP']
  return highRiskSignalTypes.includes(signal.signalType) ? 'HIGH' : 'MEDIUM'
}

function assessBudgetFit(signal: any): 'GOOD' | 'FAIR' | 'POOR' {
  if (signal.opportunitySize) {
    const avgOpportunity = (signal.opportunitySize.min + signal.opportunitySize.max) / 2
    if (avgOpportunity >= 50000) return 'GOOD'
    if (avgOpportunity >= 10000) return 'FAIR'
  }
  return 'POOR'
}

function assessDecisionMakerAccess(signal: any): 'DIRECT' | 'INDIRECT' | 'UNKNOWN' {
  if (signal.executive) {
    if (signal.executive.reportingLevel <= 2) return 'DIRECT'
    if (signal.executive.reportingLevel <= 4) return 'INDIRECT'
  }
  return 'UNKNOWN'
}

function analyzeSignalTiming(signal: any) {
  const hoursAgo = Math.floor(
    (Date.now() - new Date(signal.detectedDate).getTime()) / (1000 * 60 * 60)
  )
  
  return {
    hoursAgo,
    freshness: hoursAgo < 24 ? 'FRESH' : hoursAgo < 72 ? 'RECENT' : 'OLDER',
    actionWindow: hoursAgo < 48 ? 'OPTIMAL' : hoursAgo < 168 ? 'GOOD' : 'DECLINING'
  }
}

async function generateRecommendedActions(signal: any): Promise<string[]> {
  const actions = []
  
  // Base actions based on signal type
  switch (signal.signalType) {
    case 'HIRING':
      actions.push('Reach out about scaling challenges')
      actions.push('Offer automation consultation')
      break
    case 'FUNDING':
      actions.push('Congratulate on funding')
      actions.push('Discuss growth infrastructure needs')
      break
    case 'PROBLEM_POST':
      actions.push('Engage with helpful insights')
      actions.push('Share relevant case study')
      break
    case 'TECHNOLOGY_DISCUSSION':
      actions.push('Join the conversation')
      actions.push('Offer technical expertise')
      break
  }

  // Add urgency-based actions
  if (signal.urgency === 'URGENT' || signal.strength === 'CRITICAL') {
    actions.unshift('Contact within 24 hours')
  }

  return actions
}

async function getTrendingSignalTypes(tenantId: string, days: number) {
  const signals = await prisma.buyingSignal.findMany({
    where: {
      executive: { tenantId },
      detectedDate: {
        gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      }
    },
    select: { signalType: true }
  })

  const counts = signals.reduce((acc, s) => {
    acc[s.signalType] = (acc[s.signalType] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return Object.entries(counts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([type, count]) => ({ type, count }))
}

async function getTrackedCompanies(tenantId: string): Promise<string[]> {
  const companies = await prisma.executiveProfile.findMany({
    where: { tenantId, monitoringEnabled: true },
    select: { currentCompanyId: true },
    distinct: ['currentCompanyId']
  })
  
  return companies
    .map(c => c.currentCompanyId)
    .filter((id): id is string => id !== null)
}

async function getCompanyExecutives(companyId: string, tenantId: string): Promise<string[]> {
  const executives = await prisma.executiveProfile.findMany({
    where: { 
      tenantId,
      currentCompanyId: companyId,
      monitoringEnabled: true
    },
    select: { id: true }
  })
  
  return executives.map(e => e.id)
}

async function sendBuyingSignalAlert(signal: any, tenantId: string): Promise<void> {
  await prisma.notification.create({
    data: {
      tenantId,
      type: 'BUYING_SIGNAL_ALERT',
      title: 'Critical Buying Signal Detected',
      message: `${signal.signalType}: ${signal.signal}`,
      priority: signal.strength,
      entityType: 'BUYING_SIGNAL',
      entityId: signal.id,
      actionUrl: `/crm/decision-makers/buying-signals/${signal.id}`,
      metadata: {
        executiveId: signal.executiveId,
        signalType: signal.signalType,
        relevanceScore: signal.relevanceScore
      }
    }
  })
}