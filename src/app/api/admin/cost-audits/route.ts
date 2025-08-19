import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { costManagementAuditor } from '@/lib/audit/cost-management-auditor'
import { logger } from '@/lib/logging/logger'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 })
    }

    // Check if user has admin access
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { tenant: true },
    })

    if (!user || user.tenantId !== tenantId || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Retrieve recent audit results from database
    const recentAudits = await prisma.aiActivity.findMany({
      where: {
        tenantId,
        action: 'COST_MANAGEMENT_AUDIT',
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    const auditResults = recentAudits
      .map((audit) => {
        try {
          const details = JSON.parse(audit.details || '{}')
          return {
            auditType: 'COMPREHENSIVE_AUDIT',
            timestamp: audit.createdAt,
            findings: details,
            recommendations: details.recommendations || [],
            potentialSavings: details.totalPotentialSavings || 0,
            criticalIssues: details.criticalIssues || [],
          }
        } catch (error) {
          logger.error('Failed to parse audit details', { auditId: audit.id, error })
          return null
        }
      })
      .filter(Boolean)

    return NextResponse.json({
      success: true,
      audits: auditResults,
      count: auditResults.length,
    })
  } catch (error) {
    logger.error('Failed to fetch cost audits', { error })
    return NextResponse.json({ error: 'Failed to fetch audit results' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tenantId } = body

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 })
    }

    // Check if user has admin access
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { tenant: true },
    })

    if (!user || user.tenantId !== tenantId || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    logger.info('Starting cost management audit via API', {
      tenantId,
      userId: user.id,
    })

    // Run comprehensive cost audit
    const auditResults = await costManagementAuditor.runFullCostAudit(tenantId)

    // Log audit completion
    await prisma.aiActivity.create({
      data: {
        tenantId,
        action: 'COST_AUDIT_INITIATED',
        details: JSON.stringify({
          initiatedBy: user.id,
          auditTypes: auditResults.map((result) => result.auditType),
          totalSavings: auditResults.reduce((sum, result) => sum + result.potentialSavings, 0),
          totalIssues: auditResults.reduce((sum, result) => sum + result.criticalIssues.length, 0),
          timestamp: new Date().toISOString(),
        }),
      },
    })

    return NextResponse.json({
      success: true,
      audits: auditResults,
      summary: {
        totalAudits: auditResults.length,
        totalPotentialSavings: auditResults.reduce(
          (sum, result) => sum + result.potentialSavings,
          0
        ),
        totalCriticalIssues: auditResults.reduce(
          (sum, result) => sum + result.criticalIssues.length,
          0
        ),
        auditTypes: auditResults.map((result) => result.auditType),
      },
    })
  } catch (error) {
    logger.error('Failed to run cost audit', { error })
    return NextResponse.json({ error: 'Failed to execute cost audit' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 })
    }

    // Check if user has admin access
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { tenant: true },
    })

    if (!user || user.tenantId !== tenantId || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Delete all cost audit records for the tenant
    const deletedRecords = await prisma.aiActivity.deleteMany({
      where: {
        tenantId,
        action: {
          in: ['COST_MANAGEMENT_AUDIT', 'COST_AUDIT_INITIATED'],
        },
      },
    })

    logger.info('Cost audit history cleared', {
      tenantId,
      deletedCount: deletedRecords.count,
    })

    return NextResponse.json({
      success: true,
      deletedCount: deletedRecords.count,
      message: 'Audit history cleared successfully',
    })
  } catch (error) {
    logger.error('Failed to clear audit history', { error })
    return NextResponse.json({ error: 'Failed to clear audit history' }, { status: 500 })
  }
}
