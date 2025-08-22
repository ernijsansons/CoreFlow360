import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const PortfolioIntelligenceRequestSchema = z.object({
  portfolioId: z.string(),
  analysisType: z.enum(['FULL_ANALYSIS', 'CROSS_SELLING', 'RESOURCE_SHARING', 'DATA_INSIGHTS', 'OPERATIONAL_SYNC']).optional(),
  timeframe: z.enum(['7D', '30D', '90D', '1Y']).optional(),
  includeAI: z.boolean().optional().default(true),
  confidenceThreshold: z.number().min(0).max(100).optional().default(70)
})

const PortfolioIntelligenceQuerySchema = z.object({
  portfolioId: z.string(),
  intelligenceType: z.enum(['CROSS_SELLING', 'RESOURCE_SHARING', 'DATA_INSIGHTS', 'OPERATIONAL_SYNC']).optional(),
  category: z.enum(['REVENUE', 'EFFICIENCY', 'COST_REDUCTION', 'GROWTH']).optional(),
  status: z.enum(['IDENTIFIED', 'PLANNED', 'IN_PROGRESS', 'IMPLEMENTED', 'DECLINED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  minConfidence: z.number().min(0).max(100).optional(),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = PortfolioIntelligenceRequestSchema.parse(body)

    // Generate portfolio intelligence insights
    const intelligence = await generatePortfolioIntelligence(validatedData)

    return NextResponse.json({
      success: true,
      data: intelligence,
      message: 'Portfolio intelligence generated successfully'
    })

  } catch (error) {
    console.error('Portfolio intelligence generation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data', 
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate portfolio intelligence' 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = {
      portfolioId: searchParams.get('portfolioId') || '',
      intelligenceType: searchParams.get('intelligenceType') || undefined,
      category: searchParams.get('category') || undefined,
      status: searchParams.get('status') || undefined,
      priority: searchParams.get('priority') || undefined,
      minConfidence: searchParams.get('minConfidence') ? parseInt(searchParams.get('minConfidence')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0
    }

    if (!queryParams.portfolioId) {
      return NextResponse.json(
        { success: false, error: 'Portfolio ID is required' },
        { status: 400 }
      )
    }

    const validatedQuery = PortfolioIntelligenceQuerySchema.parse(queryParams)

    // Mock intelligence data - in production, fetch from database
    const mockIntelligence = getMockPortfolioIntelligence()
    
    // Apply filters
    let filteredIntelligence = mockIntelligence
    
    if (validatedQuery.intelligenceType) {
      filteredIntelligence = filteredIntelligence.filter(intel => intel.intelligenceType === validatedQuery.intelligenceType)
    }
    
    if (validatedQuery.category) {
      filteredIntelligence = filteredIntelligence.filter(intel => intel.category === validatedQuery.category)
    }
    
    if (validatedQuery.status) {
      filteredIntelligence = filteredIntelligence.filter(intel => intel.status === validatedQuery.status)
    }
    
    if (validatedQuery.priority) {
      filteredIntelligence = filteredIntelligence.filter(intel => intel.priority === validatedQuery.priority)
    }
    
    if (validatedQuery.minConfidence !== undefined) {
      filteredIntelligence = filteredIntelligence.filter(intel => intel.confidenceLevel >= validatedQuery.minConfidence!)
    }

    // Apply pagination
    const total = filteredIntelligence.length
    const paginatedIntelligence = filteredIntelligence.slice(
      validatedQuery.offset, 
      validatedQuery.offset + validatedQuery.limit
    )

    // Calculate analytics
    const analytics = calculateIntelligenceAnalytics(filteredIntelligence)

    return NextResponse.json({
      success: true,
      data: {
        intelligence: paginatedIntelligence,
        pagination: {
          total,
          limit: validatedQuery.limit,
          offset: validatedQuery.offset,
          hasMore: validatedQuery.offset + validatedQuery.limit < total
        },
        analytics
      }
    })

  } catch (error) {
    console.error('Get portfolio intelligence error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid query parameters', 
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch portfolio intelligence' 
      },
      { status: 500 }
    )
  }
}

async function generatePortfolioIntelligence(data: z.infer<typeof PortfolioIntelligenceRequestSchema>) {
  // Mock portfolio data analysis
  const portfolioMetrics = {
    totalBusinesses: 5,
    totalRevenue: 12500000,
    totalEmployees: 287,
    totalCustomers: 8432,
    portfolioValue: 45000000
  }

  const intelligence = []

  // Cross-Selling Intelligence
  if (!data.analysisType || data.analysisType === 'FULL_ANALYSIS' || data.analysisType === 'CROSS_SELLING') {
    intelligence.push({
      id: `intel-cs-${Date.now()}`,
      intelligenceType: 'CROSS_SELLING',
      category: 'REVENUE',
      title: 'High-Value Cross-Selling Opportunity Identified',
      description: 'Analysis reveals 47% customer overlap between Tech and HVAC businesses with $285K untapped cross-selling potential.',
      impact: 'HIGH',
      confidenceLevel: 89,
      affectedBusinesses: ['business-001', 'business-003'],
      estimatedValue: 285000,
      timeToImplement: 45,
      implementationComplexity: 'MEDIUM',
      status: 'IDENTIFIED',
      priority: 'HIGH',
      aiRecommendations: {
        actions: [
          'Implement unified CRM system',
          'Create cross-selling training program',
          'Launch targeted campaign to overlapping customers'
        ],
        timeline: '3-6 months',
        resources: ['CRM integration', 'Sales training', 'Marketing campaign']
      },
      predictedOutcome: {
        revenueIncrease: 285000,
        customerSatisfaction: 15,
        marketShare: 8
      },
      riskAssessment: {
        level: 'LOW',
        factors: ['Customer acceptance', 'Sales team readiness', 'Technical integration'],
        mitigation: 'Phased rollout with pilot program'
      }
    })
  }

  // Resource Sharing Intelligence
  if (!data.analysisType || data.analysisType === 'FULL_ANALYSIS' || data.analysisType === 'RESOURCE_SHARING') {
    intelligence.push({
      id: `intel-rs-${Date.now()}`,
      intelligenceType: 'RESOURCE_SHARING',
      category: 'EFFICIENCY',
      title: 'IT Support Consolidation Opportunity',
      description: 'Consolidating IT support across 3 businesses can reduce costs by 40% while improving service quality.',
      impact: 'HIGH',
      confidenceLevel: 91,
      affectedBusinesses: ['business-001', 'business-002', 'business-003'],
      estimatedValue: 240000,
      timeToImplement: 60,
      implementationComplexity: 'MEDIUM',
      status: 'IDENTIFIED',
      priority: 'MEDIUM',
      aiRecommendations: {
        actions: [
          'Centralize IT support team',
          'Implement unified ticketing system',
          'Standardize IT infrastructure'
        ],
        timeline: '2-4 months',
        resources: ['IT team restructuring', 'System integration', 'Training programs']
      },
      predictedOutcome: {
        costReduction: 240000,
        efficiencyGain: 40,
        serviceQuality: 25
      },
      riskAssessment: {
        level: 'MEDIUM',
        factors: ['Service disruption during transition', 'Team resistance', 'Technical challenges'],
        mitigation: 'Gradual migration with parallel systems'
      }
    })
  }

  // Data Insights Intelligence
  if (!data.analysisType || data.analysisType === 'FULL_ANALYSIS' || data.analysisType === 'DATA_INSIGHTS') {
    intelligence.push({
      id: `intel-di-${Date.now()}`,
      intelligenceType: 'DATA_INSIGHTS',
      category: 'GROWTH',
      title: 'Market Expansion Pattern Detected',
      description: 'Combined data analysis reveals untapped market opportunity in Denver region with 73% success probability.',
      impact: 'HIGH',
      confidenceLevel: 94,
      affectedBusinesses: ['business-002', 'business-005'],
      estimatedValue: 450000,
      timeToImplement: 90,
      implementationComplexity: 'HIGH',
      status: 'IDENTIFIED',
      priority: 'URGENT',
      aiRecommendations: {
        actions: [
          'Conduct detailed market research in Denver',
          'Establish local partnerships',
          'Launch pilot operations'
        ],
        timeline: '6-12 months',
        resources: ['Market research', 'Business development', 'Operations setup']
      },
      predictedOutcome: {
        revenueIncrease: 450000,
        marketExpansion: 35,
        brandRecognition: 20
      },
      riskAssessment: {
        level: 'MEDIUM',
        factors: ['Market competition', 'Regulatory requirements', 'Local partnerships'],
        mitigation: 'Phased market entry with local expertise'
      }
    })
  }

  // Operational Sync Intelligence
  if (!data.analysisType || data.analysisType === 'FULL_ANALYSIS' || data.analysisType === 'OPERATIONAL_SYNC') {
    intelligence.push({
      id: `intel-os-${Date.now()}`,
      intelligenceType: 'OPERATIONAL_SYNC',
      category: 'EFFICIENCY',
      title: 'Inventory Management Synchronization',
      description: 'Synchronizing inventory management across construction and HVAC businesses can reduce carrying costs by 28%.',
      impact: 'MEDIUM',
      confidenceLevel: 85,
      affectedBusinesses: ['business-003', 'business-004'],
      estimatedValue: 120000,
      timeToImplement: 30,
      implementationComplexity: 'LOW',
      status: 'IDENTIFIED',
      priority: 'MEDIUM',
      aiRecommendations: {
        actions: [
          'Implement shared inventory system',
          'Optimize stock levels across businesses',
          'Establish common supplier relationships'
        ],
        timeline: '1-2 months',
        resources: ['Inventory system', 'Process standardization', 'Supplier management']
      },
      predictedOutcome: {
        costReduction: 120000,
        inventoryTurnover: 35,
        cashFlow: 15
      },
      riskAssessment: {
        level: 'LOW',
        factors: ['System integration', 'Process changes', 'Supplier negotiations'],
        mitigation: 'Gradual implementation with existing suppliers'
      }
    })
  }

  return {
    portfolioId: data.portfolioId,
    analysisTimestamp: new Date().toISOString(),
    analysisType: data.analysisType || 'FULL_ANALYSIS',
    timeframe: data.timeframe || '30D',
    portfolioMetrics,
    intelligence: intelligence.filter(intel => intel.confidenceLevel >= data.confidenceThreshold),
    summary: {
      totalInsights: intelligence.length,
      highPriorityInsights: intelligence.filter(intel => intel.priority === 'HIGH' || intel.priority === 'URGENT').length,
      totalEstimatedValue: intelligence.reduce((sum, intel) => sum + intel.estimatedValue, 0),
      averageConfidence: intelligence.reduce((sum, intel) => sum + intel.confidenceLevel, 0) / intelligence.length,
      implementationComplexity: {
        low: intelligence.filter(intel => intel.implementationComplexity === 'LOW').length,
        medium: intelligence.filter(intel => intel.implementationComplexity === 'MEDIUM').length,
        high: intelligence.filter(intel => intel.implementationComplexity === 'HIGH').length
      }
    },
    recommendations: generatePortfolioRecommendations(intelligence, portfolioMetrics)
  }
}

function generatePortfolioRecommendations(intelligence: any[], portfolioMetrics: any) {
  const recommendations = []

  // Prioritization recommendation
  const highValueInsights = intelligence.filter(intel => intel.estimatedValue > 200000)
  if (highValueInsights.length > 0) {
    recommendations.push({
      type: 'PRIORITIZATION',
      title: 'Focus on High-Value Opportunities',
      description: `${highValueInsights.length} insights with estimated value over $200K should be prioritized for immediate implementation.`,
      priority: 'HIGH',
      timeline: 'Immediate',
      expectedImpact: highValueInsights.reduce((sum, intel) => sum + intel.estimatedValue, 0)
    })
  }

  // Resource allocation recommendation
  const resourceSharingInsights = intelligence.filter(intel => intel.intelligenceType === 'RESOURCE_SHARING')
  if (resourceSharingInsights.length > 0) {
    recommendations.push({
      type: 'RESOURCE_OPTIMIZATION',
      title: 'Implement Resource Sharing Programs',
      description: 'Multiple opportunities for resource sharing detected. Consider establishing centralized resource management.',
      priority: 'MEDIUM',
      timeline: '3-6 months',
      expectedImpact: resourceSharingInsights.reduce((sum, intel) => sum + intel.estimatedValue, 0)
    })
  }

  // Cross-selling recommendation
  const crossSellingInsights = intelligence.filter(intel => intel.intelligenceType === 'CROSS_SELLING')
  if (crossSellingInsights.length > 0) {
    recommendations.push({
      type: 'REVENUE_GROWTH',
      title: 'Launch Cross-Business Sales Initiative',
      description: 'Significant cross-selling opportunities identified. Consider unified sales approach across businesses.',
      priority: 'HIGH',
      timeline: '2-4 months',
      expectedImpact: crossSellingInsights.reduce((sum, intel) => sum + intel.estimatedValue, 0)
    })
  }

  return recommendations
}

function getMockPortfolioIntelligence() {
  return [
    {
      id: 'intel-001',
      portfolioId: 'demo-portfolio',
      intelligenceType: 'CROSS_SELLING',
      category: 'REVENUE',
      title: 'Cross-Sell HVAC Maintenance to Software Clients',
      description: 'Software business clients have high overlap with HVAC service needs. Estimated 47% conversion opportunity.',
      impact: 'HIGH',
      confidenceLevel: 89,
      affectedBusinesses: ['business-001', 'business-003'],
      estimatedValue: 285000,
      timeToImplement: 45,
      implementationComplexity: 'MEDIUM',
      status: 'IDENTIFIED',
      priority: 'HIGH',
      assignedTo: 'user-001',
      aiRecommendations: {
        actions: ['Implement unified CRM', 'Create cross-selling training', 'Launch targeted campaign'],
        timeline: '3-6 months',
        resources: ['CRM integration', 'Sales training', 'Marketing campaign']
      },
      predictedOutcome: {
        revenueIncrease: 285000,
        customerSatisfaction: 15,
        marketShare: 8
      },
      riskAssessment: {
        level: 'LOW',
        factors: ['Customer acceptance', 'Sales team readiness'],
        mitigation: 'Phased rollout with pilot program'
      },
      createdAt: new Date('2024-03-20'),
      updatedAt: new Date('2024-03-20')
    },
    {
      id: 'intel-002',
      portfolioId: 'demo-portfolio',
      intelligenceType: 'RESOURCE_SHARING',
      category: 'EFFICIENCY',
      title: 'Shared Customer Service Team',
      description: 'Consolidate customer service across 3 businesses to reduce costs and improve response times.',
      impact: 'MEDIUM',
      confidenceLevel: 82,
      affectedBusinesses: ['business-001', 'business-002', 'business-004'],
      estimatedValue: 120000,
      timeToImplement: 60,
      implementationComplexity: 'MEDIUM',
      status: 'PLANNED',
      priority: 'MEDIUM',
      assignedTo: 'user-002',
      aiRecommendations: {
        actions: ['Centralize customer service', 'Implement unified ticketing', 'Cross-train agents'],
        timeline: '2-4 months',
        resources: ['Team restructuring', 'System integration', 'Training programs']
      },
      predictedOutcome: {
        costReduction: 120000,
        efficiencyGain: 35,
        serviceQuality: 20
      },
      riskAssessment: {
        level: 'MEDIUM',
        factors: ['Service disruption', 'Team resistance'],
        mitigation: 'Gradual migration with parallel systems'
      },
      createdAt: new Date('2024-03-18'),
      updatedAt: new Date('2024-03-19')
    }
  ]
}

function calculateIntelligenceAnalytics(intelligence: any[]) {
  const total = intelligence.length
  
  const categoryDistribution = {
    REVENUE: intelligence.filter(intel => intel.category === 'REVENUE').length,
    EFFICIENCY: intelligence.filter(intel => intel.category === 'EFFICIENCY').length,
    COST_REDUCTION: intelligence.filter(intel => intel.category === 'COST_REDUCTION').length,
    GROWTH: intelligence.filter(intel => intel.category === 'GROWTH').length
  }
  
  const statusDistribution = {
    IDENTIFIED: intelligence.filter(intel => intel.status === 'IDENTIFIED').length,
    PLANNED: intelligence.filter(intel => intel.status === 'PLANNED').length,
    IN_PROGRESS: intelligence.filter(intel => intel.status === 'IN_PROGRESS').length,
    IMPLEMENTED: intelligence.filter(intel => intel.status === 'IMPLEMENTED').length,
    DECLINED: intelligence.filter(intel => intel.status === 'DECLINED').length
  }
  
  const priorityDistribution = {
    LOW: intelligence.filter(intel => intel.priority === 'LOW').length,
    MEDIUM: intelligence.filter(intel => intel.priority === 'MEDIUM').length,
    HIGH: intelligence.filter(intel => intel.priority === 'HIGH').length,
    URGENT: intelligence.filter(intel => intel.priority === 'URGENT').length
  }

  const avgConfidence = total > 0 ? 
    intelligence.reduce((sum, intel) => sum + intel.confidenceLevel, 0) / total : 0
    
  const totalEstimatedValue = intelligence.reduce((sum, intel) => sum + intel.estimatedValue, 0)

  const implementationComplexity = {
    LOW: intelligence.filter(intel => intel.implementationComplexity === 'LOW').length,
    MEDIUM: intelligence.filter(intel => intel.implementationComplexity === 'MEDIUM').length,
    HIGH: intelligence.filter(intel => intel.implementationComplexity === 'HIGH').length
  }

  return {
    totalIntelligence: total,
    categoryDistribution,
    statusDistribution,
    priorityDistribution,
    averageConfidence: Math.round(avgConfidence),
    totalEstimatedValue,
    implementationComplexity,
    aiGenerated: intelligence.filter(intel => intel.aiRecommendations).length,
    avgTimeToImplement: total > 0 ? 
      Math.round(intelligence.reduce((sum, intel) => sum + (intel.timeToImplement || 0), 0) / total) : 0
  }
}