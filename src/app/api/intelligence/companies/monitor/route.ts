import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import ProblemDiscoveryEngine from '@/lib/crm/problem-discovery-engine'
import CompanyIntelligenceOrchestrator from '@/ai/agents/company-intelligence/CompanyIntelligenceOrchestrator'

const startMonitoringSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  companyDomain: z.string().min(1, "Company domain is required"),
  industryType: z.enum([
    'GENERAL',
    'HVAC', 
    'LEGAL',
    'MANUFACTURING',
    'HEALTHCARE',
    'FINANCE',
    'REAL_ESTATE',
    'CONSTRUCTION',
    'CONSULTING',
    'RETAIL',
    'EDUCATION'
  ]).default('GENERAL'),
  companySize: z.enum(['STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE']).default('MEDIUM'),
  employeeCount: z.number().optional(),
  revenue: z.number().optional(),
  headquarters: z.string().optional(),
  
  // Monitoring Configuration
  enabledSources: z.array(z.enum([
    'SOCIAL_MEDIA',
    'NEWS_ARTICLE',
    'FINANCIAL_REPORT',
    'JOB_POSTING',
    'REGULATORY_FILING',
    'COMPETITOR_INTELLIGENCE',
    'INDUSTRY_REPORT',
    'TECHNOLOGY_CHANGE'
  ])).default(['SOCIAL_MEDIA', 'NEWS_ARTICLE']),
  
  monitoringDepth: z.enum(['SURFACE', 'STANDARD', 'DEEP', 'COMPREHENSIVE']).default('STANDARD'),
  analysisFrequency: z.enum(['REAL_TIME', 'HOURLY', 'DAILY']).default('HOURLY'),
  
  // Alert Configuration
  alertThresholds: z.object({
    problemSeverity: z.array(z.string()).default(['CRITICAL', 'EXISTENTIAL']),
    confidenceMinimum: z.number().min(0).max(100).default(70),
    rapidChangeDetection: z.boolean().default(true)
  }).default({})
})

const updateMonitoringSchema = z.object({
  companyIntelligenceId: z.string(),
  monitoringStatus: z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED']).optional(),
  enabledSources: z.array(z.string()).optional(),
  analysisFrequency: z.string().optional(),
  alertThresholds: z.object({
    problemSeverity: z.array(z.string()).optional(),
    confidenceMinimum: z.number().optional(),
    rapidChangeDetection: z.boolean().optional()
  }).optional()
})

// Global orchestrator instance
let orchestrator: CompanyIntelligenceOrchestrator | null = null

function getOrchestrator(): CompanyIntelligenceOrchestrator {
  if (!orchestrator) {
    orchestrator = new CompanyIntelligenceOrchestrator()
  }
  return orchestrator
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = startMonitoringSchema.parse(body)

    console.log('🎯 Starting company monitoring for:', validatedData.companyName)

    // Check if company is already being monitored
    const existingCompany = await prisma.companyIntelligence.findFirst({
      where: {
        tenantId: session.user.tenantId,
        companyDomain: validatedData.companyDomain
      }
    })

    if (existingCompany && existingCompany.monitoringStatus === 'ACTIVE') {
      return NextResponse.json({
        success: true,
        message: 'Company is already being monitored',
        companyIntelligenceId: existingCompany.id,
        status: 'ALREADY_MONITORING'
      })
    }

    // Create or update company intelligence record
    const companyIntelligence = await prisma.companyIntelligence.upsert({
      where: existingCompany ? { id: existingCompany.id } : { id: 'non-existent' },
      update: {
        monitoringStatus: 'ACTIVE',
        dataSourcesEnabled: validatedData.enabledSources,
        analysisFrequency: validatedData.analysisFrequency,
        companySize: validatedData.companySize,
        employeeCount: validatedData.employeeCount,
        revenue: validatedData.revenue,
        headquarters: validatedData.headquarters,
        lastAnalyzedAt: new Date()
      },
      create: {
        tenantId: session.user.tenantId,
        companyName: validatedData.companyName,
        companyDomain: validatedData.companyDomain,
        industryType: validatedData.industryType,
        companySize: validatedData.companySize,
        employeeCount: validatedData.employeeCount,
        revenue: validatedData.revenue,
        headquarters: validatedData.headquarters,
        monitoringStatus: 'ACTIVE',
        dataSourcesEnabled: validatedData.enabledSources,
        analysisFrequency: validatedData.analysisFrequency,
        customFields: {
          monitoringDepth: validatedData.monitoringDepth,
          alertThresholds: validatedData.alertThresholds
        }
      }
    })

    // Initialize Problem Discovery Engine
    const discoveryEngine = new ProblemDiscoveryEngine()
    
    // Start monitoring with the discovery engine
    await discoveryEngine.startCompanyMonitoring({
      tenantId: session.user.tenantId,
      companyName: validatedData.companyName,
      companyDomain: validatedData.companyDomain,
      industryType: validatedData.industryType,
      dataSources: validatedData.enabledSources as any[],
      frequency: validatedData.analysisFrequency as any
    })

    // Start autonomous agents using the orchestrator
    const orchestrator = getOrchestrator()
    await orchestrator.startCompanyMonitoring({
      companyId: companyIntelligence.id,
      companyName: validatedData.companyName,
      companyDomain: validatedData.companyDomain,
      industryType: validatedData.industryType,
      enabledAgents: validatedData.enabledSources as any[],
      monitoringDepth: validatedData.monitoringDepth,
      alertThresholds: validatedData.alertThresholds
    })

    // Create initial intelligence report
    await prisma.intelligenceReport.create({
      data: {
        tenantId: session.user.tenantId,
        companyIntelligenceId: companyIntelligence.id,
        reportType: 'EVENT_TRIGGERED',
        reportTitle: 'Monitoring Started',
        reportSummary: `Comprehensive monitoring started for ${validatedData.companyName}`,
        executiveSummary: `Initiated ${validatedData.enabledSources.length} intelligence agents to monitor ${validatedData.companyName} across multiple data sources.`,
        keyFindings: {
          monitoringConfiguration: {
            sources: validatedData.enabledSources,
            frequency: validatedData.analysisFrequency,
            depth: validatedData.monitoringDepth
          }
        },
        problemsDetected: 0,
        opportunitiesIdentified: 0,
        riskAssessment: {
          riskLevel: 'MEDIUM',
          factors: ['New monitoring setup', 'Historical data collection needed']
        },
        actionItems: {
          immediate: ['Initialize data collection', 'Establish baselines'],
          shortTerm: ['Analyze initial data patterns', 'Calibrate alert thresholds'],
          longTerm: ['Optimize monitoring configuration', 'Expand data sources']
        },
        dataSourcesUsed: validatedData.enabledSources as any[],
        dataQualityScore: 85,
        analysisConfidence: 90
      }
    })

    const response = {
      success: true,
      message: 'Company monitoring started successfully',
      companyIntelligenceId: companyIntelligence.id,
      status: 'MONITORING_STARTED',
      
      configuration: {
        companyName: validatedData.companyName,
        companyDomain: validatedData.companyDomain,
        industry: validatedData.industryType,
        enabledSources: validatedData.enabledSources,
        analysisFrequency: validatedData.analysisFrequency,
        monitoringDepth: validatedData.monitoringDepth
      },
      
      agents: {
        totalAgents: validatedData.enabledSources.length,
        activeAgents: validatedData.enabledSources.length,
        agentTypes: validatedData.enabledSources
      },
      
      expectedInsights: {
        firstInsightsWithin: '15 minutes',
        comprehensiveAnalysisBy: '24 hours',
        problemDetectionAccuracy: '90%+'
      },
      
      nextSteps: [
        'Intelligence agents are being initialized',
        'Historical data analysis will begin shortly', 
        'First insights expected within 15 minutes',
        'Alert thresholds are being calibrated'
      ]
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Failed to start company monitoring:', error)
    return NextResponse.json(
      { 
        error: 'Failed to start company monitoring',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateMonitoringSchema.parse(body)

    console.log('⚙️ Updating monitoring configuration for:', validatedData.companyIntelligenceId)

    // Update company intelligence record
    const updateData: any = {}
    
    if (validatedData.monitoringStatus) {
      updateData.monitoringStatus = validatedData.monitoringStatus
    }
    
    if (validatedData.enabledSources) {
      updateData.dataSourcesEnabled = validatedData.enabledSources
    }
    
    if (validatedData.analysisFrequency) {
      updateData.analysisFrequency = validatedData.analysisFrequency
    }
    
    const companyIntelligence = await prisma.companyIntelligence.update({
      where: {
        id: validatedData.companyIntelligenceId,
        tenantId: session.user.tenantId
      },
      data: {
        ...updateData,
        lastAnalyzedAt: new Date(),
        customFields: validatedData.alertThresholds ? {
          alertThresholds: validatedData.alertThresholds
        } : undefined
      }
    })

    // Update orchestrator configuration if needed
    const orchestrator = getOrchestrator()
    
    if (validatedData.monitoringStatus === 'PAUSED') {
      // Pause all agents for this company
      const agents = orchestrator.getAgentsStatus().filter(
        agent => agent.id.endsWith(`_${validatedData.companyIntelligenceId}`)
      )
      agents.forEach(agent => {
        orchestrator.toggleAgent(agent.id, false)
      })
    } else if (validatedData.monitoringStatus === 'ACTIVE') {
      // Resume all agents for this company
      const agents = orchestrator.getAgentsStatus().filter(
        agent => agent.id.endsWith(`_${validatedData.companyIntelligenceId}`)
      )
      agents.forEach(agent => {
        orchestrator.toggleAgent(agent.id, true)
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Monitoring configuration updated successfully',
      companyIntelligenceId: validatedData.companyIntelligenceId,
      updatedConfiguration: {
        monitoringStatus: companyIntelligence.monitoringStatus,
        enabledSources: companyIntelligence.dataSourcesEnabled,
        analysisFrequency: companyIntelligence.analysisFrequency,
        lastUpdated: companyIntelligence.updatedAt
      }
    })

  } catch (error) {
    console.error('❌ Failed to update monitoring configuration:', error)
    return NextResponse.json(
      { error: 'Failed to update monitoring configuration' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const companyId = searchParams.get('companyId')
    const status = searchParams.get('status')
    const includeProblems = searchParams.get('includeProblems') === 'true'
    
    // Build query
    const where: any = { tenantId: session.user.tenantId }
    
    if (companyId) {
      where.id = companyId
    }
    
    if (status) {
      where.monitoringStatus = status
    }

    const companies = await prisma.companyIntelligence.findMany({
      where,
      include: {
        problems: includeProblems ? {
          where: { status: { notIn: ['RESOLVED'] } },
          orderBy: { detectedAt: 'desc' },
          take: 10
        } : false,
        intelligenceReports: {
          orderBy: { generatedAt: 'desc' },
          take: 5
        }
      },
      orderBy: { lastAnalyzedAt: 'desc' }
    })

    // Get orchestrator status for each company
    const orchestrator = getOrchestrator()
    const allAgents = orchestrator.getAgentsStatus()

    const companiesWithStatus = companies.map(company => {
      // Find agents for this company
      const companyAgents = allAgents.filter(agent => 
        agent.id.includes(company.id) || agent.company === company.companyName
      )

      const activeProblems = includeProblems ? company.problems || [] : []
      const criticalProblems = activeProblems.filter(p => 
        p.severity === 'CRITICAL' || p.severity === 'EXISTENTIAL'
      )

      return {
        id: company.id,
        companyName: company.companyName,
        companyDomain: company.companyDomain,
        industry: company.industryType,
        companySize: company.companySize,
        employeeCount: company.employeeCount,
        revenue: company.revenue,
        headquarters: company.headquarters,
        
        // Monitoring Status
        monitoringStatus: company.monitoringStatus,
        monitoringStartedAt: company.monitoringStartedAt,
        lastAnalyzed: company.lastAnalyzedAt,
        
        // Configuration
        enabledSources: company.dataSourcesEnabled,
        analysisFrequency: company.analysisFrequency,
        
        // Health Scores
        healthScore: company.overallHealthScore,
        riskScore: company.problemRiskScore,
        opportunityScore: company.opportunityScore,
        
        // Problem Summary
        totalProblems: activeProblems.length,
        criticalProblems: criticalProblems.length,
        newProblemsToday: activeProblems.filter(p => {
          const today = new Date()
          const problemDate = new Date(p.detectedAt)
          return problemDate.toDateString() === today.toDateString()
        }).length,
        
        // Agent Status
        totalAgents: companyAgents.length,
        activeAgents: companyAgents.filter(a => a.status === 'ACTIVE').length,
        agentStatus: companyAgents.map(agent => ({
          type: agent.type,
          status: agent.status,
          lastExecution: agent.lastExecution,
          nextExecution: agent.nextExecution,
          successRate: agent.successRate,
          problemsDetected: agent.problemsDetected
        })),
        
        // Recent Reports
        recentReports: company.intelligenceReports.length,
        lastReportAt: company.intelligenceReports[0]?.generatedAt,
        
        // Problems (if requested)
        ...(includeProblems && {
          recentProblems: activeProblems.map(problem => ({
            id: problem.id,
            title: problem.problemTitle,
            severity: problem.severity,
            status: problem.status,
            confidence: problem.confidenceScore,
            urgency: problem.urgencyScore,
            detectedAt: problem.detectedAt,
            category: problem.problemCategory
          }))
        })
      }
    })

    // Calculate summary statistics
    const summary = {
      totalCompanies: companies.length,
      activeMonitoring: companies.filter(c => c.monitoringStatus === 'ACTIVE').length,
      totalAgents: allAgents.length,
      activeAgents: allAgents.filter(a => a.status === 'ACTIVE').length,
      totalProblemsDetected: companies.reduce((sum, c) => sum + (c.problems?.length || 0), 0),
      avgHealthScore: companies.reduce((sum, c) => sum + (c.overallHealthScore || 0), 0) / companies.length
    }

    return NextResponse.json({
      success: true,
      companies: companiesWithStatus,
      summary,
      orchestrator: {
        totalAgents: allAgents.length,
        activeAgents: allAgents.filter(a => a.status === 'ACTIVE').length,
        agentTypes: [...new Set(allAgents.map(a => a.type))],
        avgSuccessRate: allAgents.reduce((sum, a) => sum + a.successRate, 0) / allAgents.length
      }
    })

  } catch (error) {
    console.error('❌ Failed to get monitored companies:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve monitored companies' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const companyId = searchParams.get('companyId')
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      )
    }

    // Update status to ARCHIVED instead of deleting
    const company = await prisma.companyIntelligence.update({
      where: {
        id: companyId,
        tenantId: session.user.tenantId
      },
      data: {
        monitoringStatus: 'ARCHIVED',
        lastAnalyzedAt: new Date()
      }
    })

    // Stop all agents for this company
    const orchestrator = getOrchestrator()
    const agents = orchestrator.getAgentsStatus().filter(
      agent => agent.id.endsWith(`_${companyId}`)
    )
    agents.forEach(agent => {
      orchestrator.toggleAgent(agent.id, false)
    })

    return NextResponse.json({
      success: true,
      message: 'Company monitoring stopped and archived',
      companyId,
      status: 'ARCHIVED'
    })

  } catch (error) {
    console.error('❌ Failed to stop company monitoring:', error)
    return NextResponse.json(
      { error: 'Failed to stop company monitoring' },
      { status: 500 }
    )
  }
}