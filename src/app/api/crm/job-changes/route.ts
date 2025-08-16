/**
 * CoreFlow360 - Job Changes Monitoring API
 * Track executive job changes and trigger opportunity alerts
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import DecisionMakerIntelligence from '@/lib/crm/decision-maker-intelligence'

// Get recent job changes
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')
    const executiveId = searchParams.get('executiveId')
    const impactLevel = searchParams.get('impactLevel')
    const days = parseInt(searchParams.get('days') || '30')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 })
    }

    // Build query filters
    const where: any = {
      executive: { tenantId },
      changeDate: {
        gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      }
    }

    if (executiveId) where.executiveId = executiveId
    if (impactLevel) where.impactLevel = impactLevel

    const jobChanges = await prisma.jobChange.findMany({
      where,
      include: {
        executive: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            currentTitle: true,
            currentCompany: true,
            profileUrl: true,
            profilePictureUrl: true,
            influenceScore: true,
            connectionLevel: true
          }
        }
      },
      orderBy: [
        { impactLevel: 'desc' },
        { opportunityScore: 'desc' },
        { changeDate: 'desc' }
      ],
      take: limit
    })

    // Transform data
    const transformedChanges = jobChanges.map(change => ({
      id: change.id,
      executiveId: change.executiveId,
      executive: {
        id: change.executive.id,
        name: `${change.executive.firstName} ${change.executive.lastName}`,
        currentTitle: change.executive.currentTitle,
        currentCompany: change.executive.currentCompany,
        profileUrl: change.executive.profileUrl,
        profilePictureUrl: change.executive.profilePictureUrl,
        influenceScore: change.executive.influenceScore,
        connectionLevel: change.executive.connectionLevel
      },
      changeType: change.changeType,
      previousTitle: change.previousTitle,
      previousCompany: change.previousCompany,
      newTitle: change.newTitle,
      newCompany: change.newCompany,
      changeDate: change.changeDate.toISOString(),
      detectedDate: change.detectedDate.toISOString(),
      impactLevel: change.impactLevel,
      opportunityScore: Number(change.opportunityScore),
      changeReason: change.changeReason,
      announcementSource: change.announcementSource,
      announcementText: change.announcementText,
      
      // Follow-up tracking
      outreachSent: change.outreachSent,
      responseReceived: change.responseReceived,
      meetingScheduled: change.meetingScheduled,
      
      // Opportunity assessment
      opportunityAssessment: {
        newRoleInfluence: this.assessNewRoleInfluence(change),
        budgetChange: this.assessBudgetChange(change),
        timingWindow: this.calculateTimingWindow(change),
        competitionLevel: this.assessCompetitionLevel(change)
      }
    }))

    // Calculate summary statistics
    const summary = {
      total: transformedChanges.length,
      byImpact: {
        HIGH: transformedChanges.filter(c => c.impactLevel === 'HIGH').length,
        MEDIUM: transformedChanges.filter(c => c.impactLevel === 'MEDIUM').length,
        LOW: transformedChanges.filter(c => c.impactLevel === 'LOW').length
      },
      byChangeType: transformedChanges.reduce((acc, change) => {
        acc[change.changeType] = (acc[change.changeType] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      outreachStats: {
        sent: transformedChanges.filter(c => c.outreachSent).length,
        responded: transformedChanges.filter(c => c.responseReceived).length,
        meetings: transformedChanges.filter(c => c.meetingScheduled).length
      },
      averageOpportunityScore: Math.round(
        transformedChanges.reduce((sum, c) => sum + c.opportunityScore, 0) / transformedChanges.length * 100
      ) / 100
    }

    return NextResponse.json({
      jobChanges: transformedChanges,
      summary,
      pagination: {
        limit,
        total: transformedChanges.length,
        hasMore: transformedChanges.length === limit
      }
    })

  } catch (error) {
    console.error('Error fetching job changes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job changes' },
      { status: 500 }
    )
  }
}

// Manually trigger job change detection
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      tenantId,
      executiveIds = [], // Specific executives to check, or empty for all
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
        error: 'Premium feature requires Decision Maker Intelligence subscription' 
      }, { status: 402 })
    }

    const intelligence = new DecisionMakerIntelligence()

    // Trigger job change monitoring
    const detectedChanges = await intelligence.monitorJobChanges()

    // Filter changes for specific executives if provided
    const relevantChanges = executiveIds.length > 0 
      ? detectedChanges.filter(change => executiveIds.includes(change.executiveId))
      : detectedChanges

    // Send alerts for high-impact changes
    const alertsSent = []
    for (const change of relevantChanges.filter(c => c.impactLevel === 'HIGH')) {
      try {
        await this.sendJobChangeAlert(change, tenantId)
        alertsSent.push(change.id)
      } catch (alertError) {
        console.error('Failed to send job change alert:', alertError)
      }
    }

    return NextResponse.json({
      success: true,
      detectedChanges: relevantChanges.length,
      alertsSent: alertsSent.length,
      changes: relevantChanges.map(change => ({
        id: change.id,
        executiveId: change.executiveId,
        changeType: change.changeType,
        impactLevel: change.impactLevel,
        opportunityScore: change.opportunityScore,
        changeDate: change.changeDate
      }))
    })

  } catch (error) {
    console.error('Error triggering job change detection:', error)
    return NextResponse.json(
      { error: 'Failed to trigger job change detection' },
      { status: 500 }
    )
  }
}

// Update job change follow-up status
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      jobChangeId,
      tenantId,
      outreachSent = false,
      responseReceived = false,
      meetingScheduled = false,
      notes,
      nextFollowUpDate
    } = body

    if (!jobChangeId || !tenantId) {
      return NextResponse.json(
        { error: 'Job change ID and tenant ID required' },
        { status: 400 }
      )
    }

    // Verify access
    const jobChange = await prisma.jobChange.findFirst({
      where: {
        id: jobChangeId,
        executive: { tenantId }
      },
      include: { executive: true }
    })

    if (!jobChange) {
      return NextResponse.json(
        { error: 'Job change not found' },
        { status: 404 }
      )
    }

    // Update job change record
    const updatedJobChange = await prisma.jobChange.update({
      where: { id: jobChangeId },
      data: {
        outreachSent,
        responseReceived,
        meetingScheduled,
        notes,
        nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : null,
        lastUpdated: new Date()
      }
    })

    // Log activity
    await prisma.crmActivity.create({
      data: {
        tenantId,
        userId: session.user.id,
        entityType: 'JOB_CHANGE',
        entityId: jobChangeId,
        activityType: outreachSent ? 'OUTREACH_SENT' : 
                     responseReceived ? 'RESPONSE_RECEIVED' :
                     meetingScheduled ? 'MEETING_SCHEDULED' : 'STATUS_UPDATE',
        description: `Job change follow-up updated for ${jobChange.executive.firstName} ${jobChange.executive.lastName}`,
        metadata: {
          jobChangeType: jobChange.changeType,
          impactLevel: jobChange.impactLevel,
          outreachSent,
          responseReceived,
          meetingScheduled
        }
      }
    })

    return NextResponse.json({
      success: true,
      jobChange: {
        id: updatedJobChange.id,
        outreachSent: updatedJobChange.outreachSent,
        responseReceived: updatedJobChange.responseReceived,
        meetingScheduled: updatedJobChange.meetingScheduled,
        nextFollowUpDate: updatedJobChange.nextFollowUpDate?.toISOString(),
        lastUpdated: updatedJobChange.lastUpdated.toISOString()
      }
    })

  } catch (error) {
    console.error('Error updating job change follow-up:', error)
    return NextResponse.json(
      { error: 'Failed to update job change follow-up' },
      { status: 500 }
    )
  }
}

// Helper methods (would typically be in a separate service class)
function assessNewRoleInfluence(change: any): 'INCREASED' | 'DECREASED' | 'SIMILAR' {
  // Logic to assess if new role has more influence
  if (change.changeType === 'PROMOTION') return 'INCREASED'
  if (change.changeType === 'LATERAL_MOVE') return 'SIMILAR'
  if (change.changeType === 'NEW_COMPANY') {
    // Would analyze company size, role level, etc.
    return 'SIMILAR' // Default
  }
  return 'DECREASED'
}

function assessBudgetChange(change: any): 'INCREASED' | 'DECREASED' | 'SIMILAR' {
  // Logic to assess budget authority change
  return 'SIMILAR' // Default - would analyze role titles, company sizes, etc.
}

function calculateTimingWindow(change: any): string {
  // Calculate optimal outreach timing window
  const daysSinceChange = Math.floor(
    (Date.now() - new Date(change.changeDate).getTime()) / (1000 * 60 * 60 * 24)
  )
  
  if (daysSinceChange < 7) return 'IMMEDIATE' // First week is prime
  if (daysSinceChange < 30) return 'GOOD' // First month is still good
  if (daysSinceChange < 90) return 'FAIR' // First quarter is fair
  return 'POOR' // After 90 days, timing is poor
}

function assessCompetitionLevel(change: any): 'LOW' | 'MEDIUM' | 'HIGH' {
  // Assess likely competition level based on role, company, timing
  if (change.changeType === 'PROMOTION' && change.impactLevel === 'HIGH') {
    return 'MEDIUM' // Promoted executives get attention but internal
  }
  if (change.changeType === 'NEW_COMPANY') {
    return 'HIGH' // New company executives get lots of vendor attention
  }
  return 'LOW'
}

async function sendJobChangeAlert(change: any, tenantId: string): Promise<void> {
  // Would send alert via email, Slack, etc.
  console.log(`Sending job change alert for ${change.id} to tenant ${tenantId}`)
  
  // Create notification record
  await prisma.notification.create({
    data: {
      tenantId,
      type: 'JOB_CHANGE_ALERT',
      title: 'High-Impact Job Change Detected',
      message: `${change.executive?.firstName} ${change.executive?.lastName} has a new role: ${change.newTitle} at ${change.newCompany}`,
      priority: change.impactLevel,
      entityType: 'JOB_CHANGE',
      entityId: change.id,
      actionUrl: `/crm/decision-makers/job-changes/${change.id}`,
      metadata: {
        executiveId: change.executiveId,
        changeType: change.changeType,
        opportunityScore: change.opportunityScore
      }
    }
  })
}