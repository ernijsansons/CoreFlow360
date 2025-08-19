import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import ProblemDiscoveryEngine from '@/lib/crm/problem-discovery-engine'
import ProblemTaxonomyEngine from '@/lib/crm/problem-taxonomy-engine'

const detectProblemsSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  source: z.enum([
    'EMAIL',
    'CALL',
    'MEETING',
    'SURVEY',
    'SUPPORT_TICKET',
    'SOCIAL_MEDIA',
    'NEWS_ARTICLE',
    'FINANCIAL_REPORT',
    'JOB_POSTING',
    'REGULATORY_FILING',
    'COMPETITOR_INTELLIGENCE',
    'INDUSTRY_REPORT',
    'ANALYST_REPORT',
    'WEBSITE_BEHAVIOR',
    'TECHNOLOGY_CHANGE',
    'EXECUTIVE_COMMUNICATION',
  ]),
  companyId: z.string().optional(),
  companyName: z.string().optional(),
  companyDomain: z.string().optional(),
  industryType: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = detectProblemsSchema.parse(body)

    // Initialize engines
    const discoveryEngine = new ProblemDiscoveryEngine()
    const taxonomyEngine = new ProblemTaxonomyEngine()

    // Get or create company intelligence record
    let companyIntelligenceId = validatedData.companyId

    if (!companyIntelligenceId && validatedData.companyDomain) {
      const companyIntelligence = await prisma.companyIntelligence.upsert({
        where: {
          tenantId_companyDomain: {
            tenantId: session.user.tenantId,
            companyDomain: validatedData.companyDomain,
          },
        },
        update: {
          lastAnalyzedAt: new Date(),
        },
        create: {
          tenantId: session.user.tenantId,
          companyName: validatedData.companyName || validatedData.companyDomain,
          companyDomain: validatedData.companyDomain,
          industryType: (validatedData.industryType as unknown) || 'GENERAL',
          companySize: 'MEDIUM', // Default
          monitoringStatus: 'ACTIVE',
        },
      })
      companyIntelligenceId = companyIntelligence.id
    }

    // Detect problems using AI
    const detectedProblems = await discoveryEngine.detectProblems({
      tenantId: session.user.tenantId,
      companyId: companyIntelligenceId,
      content: validatedData.content,
      source: validatedData.source as unknown,
      metadata: validatedData.metadata,
    })

    // Classify each problem using taxonomy engine
    const classifiedProblems = await Promise.all(
      detectedProblems.map(async (problem) => {
        const classification = await taxonomyEngine.classifyProblem({
          text: problem.category.description,
          industry: validatedData.industryType as unknown,
          context: validatedData.metadata,
        })

        return {
          ...problem,
          classification,
          taxonomyConfidence: classification.confidence,
        }
      })
    )

    // Generate response with intelligence insights
    const response = {
      success: true,
      problemsDetected: classifiedProblems.length,
      problems: classifiedProblems.map((problem) => ({
        id: problem.problemId,
        title: problem.category.name,
        description: problem.category.description,
        severity: problem.severity,
        confidence: problem.confidence,
        urgency: problem.timing.urgency,
        category: problem.classification.taxonomy.name,
        subcategory: problem.subCategory,

        // Business Impact
        businessImpact: {
          revenueImpact: problem.impactAnalysis.revenueImpact,
          efficiencyImpact: problem.impactAnalysis.efficiencyImpact,
          customerImpact: problem.impactAnalysis.customerImpact,
          complianceRisk: problem.impactAnalysis.complianceRisk,
        },

        // Solution Intelligence
        solutionFit: {
          ourSolutionMatch: problem.solutionFit.ourSolutionMatch,
          estimatedDealSize: problem.solutionFit.estimatedDealSize,
          implementationTimeframe: problem.solutionFit.implementationTimeframe,
          competitorSolutions: problem.solutionFit.competitorSolutions.length,
        },

        // Timing Intelligence
        timing: {
          urgency: problem.timing.urgency,
          budgetCycle: problem.timing.budgetCycle,
          decisionWindow: problem.timing.decisionWindow,
          implementationComplexity: problem.timing.implementationComplexity,
        },

        // Detection Details
        detectionDetails: {
          source: validatedData.source,
          detectedAt: problem.detectedAt,
          detectionMethod: 'AI_POWERED',
          taxonomyMatch: problem.classification.taxonomy.name,
          taxonomyConfidence: problem.classification.confidence,
        },

        // Stakeholders
        stakeholders: problem.stakeholders,

        // Recommended Actions
        recommendedActions: [
          `Contact ${problem.stakeholders.decisionMaker?.name || 'decision maker'} within ${problem.timing.decisionWindow} days`,
          `Prepare solution demo focusing on ${problem.category.name} challenges`,
          `Schedule stakeholder meeting to discuss implementation`,
        ],
      })),

      // Analytics
      analytics: {
        totalProblemsDetected: classifiedProblems.length,
        severityBreakdown: this.calculateSeverityBreakdown(classifiedProblems),
        categoryBreakdown: this.calculateCategoryBreakdown(classifiedProblems),
        totalPipelineValue: classifiedProblems.reduce(
          (sum, p) => sum + p.solutionFit.estimatedDealSize.mostLikely,
          0
        ),
        averageConfidence:
          classifiedProblems.reduce((sum, p) => sum + p.confidence, 0) / classifiedProblems.length,
        urgentProblems: classifiedProblems.filter((p) => p.timing.urgency > 80).length,
        highValueOpportunities: classifiedProblems.filter(
          (p) => p.solutionFit.ourSolutionMatch > 80
        ).length,
      },

      // Processing Details
      processingDetails: {
        processedAt: new Date().toISOString(),
        processingTimeMs: Date.now() - Date.now(), // Placeholder
        enginesUsed: ['ProblemDiscoveryEngine', 'ProblemTaxonomyEngine'],
        dataSourcesAnalyzed: [validatedData.source],
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Problem detection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Helper function to calculate severity breakdown
function calculateSeverityBreakdown(problems: unknown[]) {
  const breakdown = {
    EXISTENTIAL: 0,
    CRITICAL: 0,
    MAJOR: 0,
    MODERATE: 0,
    MINOR: 0,
  }

  problems.forEach((problem) => {
    breakdown[problem.severity as keyof typeof breakdown]++
  })

  return breakdown
}

// Helper function to calculate category breakdown
function calculateCategoryBreakdown(_problems: unknown[]) {
  const breakdown: Record<string, number> = {}

  problems.forEach((problem) => {
    const category = problem.category.name
    breakdown[category] = (breakdown[category] || 0) + 1
  })

  return breakdown
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const companyId = searchParams.get('companyId')
    const severity = searchParams.get('severity')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build where clause
    const where: unknown = {
      tenantId: session.user.tenantId,
    }

    if (companyId) {
      where.companyIntelligenceId = companyId
    }

    if (severity) {
      where.severity = severity
    }

    if (status) {
      where.status = status
    }

    // Get problems from database
    const problems = await prisma.customerProblem.findMany({
      where,
      orderBy: [{ severity: 'desc' }, { urgencyScore: 'desc' }, { detectedAt: 'desc' }],
      take: limit,
      include: {
        companyIntelligence: {
          select: {
            companyName: true,
            companyDomain: true,
            industryType: true,
          },
        },
      },
    })

    // Transform problems for response
    const transformedProblems = problems.map((problem) => ({
      id: problem.id,
      companyId: problem.companyIntelligenceId,
      companyName: problem.companyIntelligence?.companyName,
      industry: problem.companyIntelligence?.industryType,

      title: problem.problemTitle,
      description: problem.problemDescription,
      category: problem.problemCategory,
      subcategory: problem.problemSubcategory,
      severity: problem.severity,
      status: problem.status,
      confidence: problem.confidenceScore,
      urgency: problem.urgencyScore,

      detectedAt: problem.detectedAt,
      lastUpdated: problem.lastUpdatedAt,
      sources: problem.detectionSource,

      businessImpact: problem.businessImpact,
      solutionFitScore: problem.solutionFitScore,
      estimatedDealSize: problem.estimatedDealSize,
      implementationComplexity: problem.implementationComplexity,

      affectedDepartments: problem.affectedDepartments,
      affectedStakeholders: problem.affectedStakeholders,

      aiInsights: problem.aiInsights,
      recommendedActions: problem.recommendedActions,
    }))

    return NextResponse.json({
      success: true,
      problems: transformedProblems,
      totalCount: problems.length,
      analytics: {
        severityBreakdown: calculateSeverityBreakdown(transformedProblems),
        statusBreakdown: this.calculateStatusBreakdown(problems),
        avgConfidence: problems.reduce((sum, p) => sum + p.confidenceScore, 0) / problems.length,
        avgUrgency: problems.reduce((sum, p) => sum + p.urgencyScore, 0) / problems.length,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve problems' }, { status: 500 })
  }
}

// Helper function to calculate status breakdown
function calculateStatusBreakdown(_problems: unknown[]) {
  const breakdown: Record<string, number> = {}

  problems.forEach((problem) => {
    breakdown[problem.status] = (breakdown[problem.status] || 0) + 1
  })

  return breakdown
}
