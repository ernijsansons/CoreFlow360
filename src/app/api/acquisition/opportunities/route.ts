import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const CreateOpportunitySchema = z.object({
  businessName: z.string().min(2).max(200),
  businessType: z.string().min(2).max(100),
  industry: z.string().min(2).max(100),
  location: z.string().optional(),
  website: z.string().url().optional(),
  employees: z.number().min(0).optional(),
  yearFounded: z.number().min(1800).max(new Date().getFullYear()).optional(),
  annualRevenue: z.number().min(0).optional(),
  grossProfit: z.number().min(0).optional(),
  netIncome: z.number().optional(),
  askingPrice: z.number().min(0).optional(),
  acquisitionType: z.enum(['ACQUISITION', 'MERGER', 'ASSET_PURCHASE', 'PARTNERSHIP']).default('ACQUISITION'),
  strategicFit: z.enum(['HORIZONTAL', 'VERTICAL', 'CONGLOMERATE', 'MARKET_EXPANSION']).optional(),
  acquisitionReason: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  brokerName: z.string().optional(),
  brokerContact: z.string().optional(),
  targetCloseDate: z.string().optional()
})

const UpdateOpportunitySchema = CreateOpportunitySchema.partial().extend({
  status: z.enum(['IDENTIFIED', 'EVALUATING', 'DUE_DILIGENCE', 'NEGOTIATING', 'CLOSED_WON', 'CLOSED_LOST']).optional(),
  dueDiligenceStatus: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']).optional()
})

const OpportunityQuerySchema = z.object({
  status: z.enum(['IDENTIFIED', 'EVALUATING', 'DUE_DILIGENCE', 'NEGOTIATING', 'CLOSED_WON', 'CLOSED_LOST']).optional(),
  industry: z.string().optional(),
  acquisitionType: z.enum(['ACQUISITION', 'MERGER', 'ASSET_PURCHASE', 'PARTNERSHIP']).optional(),
  strategicFit: z.enum(['HORIZONTAL', 'VERTICAL', 'CONGLOMERATE', 'MARKET_EXPANSION']).optional(),
  minRevenue: z.number().min(0).optional(),
  maxRevenue: z.number().min(0).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  minAiScore: z.number().min(0).max(100).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['aiScore', 'annualRevenue', 'askingPrice', 'discoveredAt', 'targetCloseDate']).optional().default('aiScore'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const action = body.action

    if (action === 'create') {
      const validatedData = CreateOpportunitySchema.parse(body.data)
      const opportunity = await createAcquisitionOpportunity(validatedData)
      
      return NextResponse.json({
        success: true,
        data: opportunity,
        message: 'Acquisition opportunity created successfully'
      })
      
    } else if (action === 'ai_analyze') {
      const { opportunityId } = body.data
      const analysis = await performAIAnalysis(opportunityId)
      
      return NextResponse.json({
        success: true,
        data: analysis
      })
      
    } else if (action === 'market_scan') {
      const { industry, location, criteria } = body.data
      const marketOpportunities = await scanMarketOpportunities(industry, location, criteria)
      
      return NextResponse.json({
        success: true,
        data: marketOpportunities
      })
      
    } else if (action === 'calculate_valuation') {
      const { opportunityId, valuationMethod } = body.data
      const valuation = await calculateValuation(opportunityId, valuationMethod)
      
      return NextResponse.json({
        success: true,
        data: valuation
      })
      
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action specified' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Acquisition opportunity API error:', error)
    
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
      { success: false, error: 'Failed to process acquisition opportunity request' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = {
      status: searchParams.get('status') || undefined,
      industry: searchParams.get('industry') || undefined,
      acquisitionType: searchParams.get('acquisitionType') || undefined,
      strategicFit: searchParams.get('strategicFit') || undefined,
      minRevenue: searchParams.get('minRevenue') ? parseFloat(searchParams.get('minRevenue')!) : undefined,
      maxRevenue: searchParams.get('maxRevenue') ? parseFloat(searchParams.get('maxRevenue')!) : undefined,
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
      minAiScore: searchParams.get('minAiScore') ? parseFloat(searchParams.get('minAiScore')!) : undefined,
      search: searchParams.get('search') || undefined,
      sortBy: searchParams.get('sortBy') || 'aiScore',
      sortOrder: searchParams.get('sortOrder') || 'desc',
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0
    }

    const validatedQuery = OpportunityQuerySchema.parse(queryParams)

    // Mock opportunities - in production, fetch from database
    const mockOpportunities = getMockOpportunities()
    
    // Apply filters
    let filteredOpportunities = mockOpportunities
    
    if (validatedQuery.status) {
      filteredOpportunities = filteredOpportunities.filter(o => o.status === validatedQuery.status)
    }
    
    if (validatedQuery.industry) {
      filteredOpportunities = filteredOpportunities.filter(o => 
        o.industry.toLowerCase().includes(validatedQuery.industry!.toLowerCase())
      )
    }
    
    if (validatedQuery.acquisitionType) {
      filteredOpportunities = filteredOpportunities.filter(o => o.acquisitionType === validatedQuery.acquisitionType)
    }
    
    if (validatedQuery.strategicFit) {
      filteredOpportunities = filteredOpportunities.filter(o => o.strategicFit === validatedQuery.strategicFit)
    }
    
    if (validatedQuery.minRevenue !== undefined) {
      filteredOpportunities = filteredOpportunities.filter(o => 
        o.annualRevenue && o.annualRevenue >= validatedQuery.minRevenue!
      )
    }
    
    if (validatedQuery.maxRevenue !== undefined) {
      filteredOpportunities = filteredOpportunities.filter(o => 
        o.annualRevenue && o.annualRevenue <= validatedQuery.maxRevenue!
      )
    }
    
    if (validatedQuery.minPrice !== undefined) {
      filteredOpportunities = filteredOpportunities.filter(o => 
        o.askingPrice && o.askingPrice >= validatedQuery.minPrice!
      )
    }
    
    if (validatedQuery.maxPrice !== undefined) {
      filteredOpportunities = filteredOpportunities.filter(o => 
        o.askingPrice && o.askingPrice <= validatedQuery.maxPrice!
      )
    }
    
    if (validatedQuery.minAiScore !== undefined) {
      filteredOpportunities = filteredOpportunities.filter(o => 
        o.aiScore && o.aiScore >= validatedQuery.minAiScore!
      )
    }
    
    if (validatedQuery.search) {
      const searchLower = validatedQuery.search.toLowerCase()
      filteredOpportunities = filteredOpportunities.filter(o => 
        o.businessName.toLowerCase().includes(searchLower) ||
        o.industry.toLowerCase().includes(searchLower) ||
        o.location?.toLowerCase().includes(searchLower) ||
        o.acquisitionReason?.toLowerCase().includes(searchLower)
      )
    }

    // Apply sorting
    filteredOpportunities.sort((a, b) => {
      const aValue = a[validatedQuery.sortBy as keyof typeof a] || 0
      const bValue = b[validatedQuery.sortBy as keyof typeof b] || 0
      
      if (validatedQuery.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    // Apply pagination
    const total = filteredOpportunities.length
    const paginatedOpportunities = filteredOpportunities.slice(
      validatedQuery.offset,
      validatedQuery.offset + validatedQuery.limit
    )

    // Calculate analytics
    const analytics = calculateOpportunityAnalytics(filteredOpportunities)

    return NextResponse.json({
      success: true,
      data: {
        opportunities: paginatedOpportunities,
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
    console.error('Get opportunities error:', error)
    
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
      { success: false, error: 'Failed to fetch opportunities' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { opportunityId, ...updateData } = body
    
    if (!opportunityId) {
      return NextResponse.json(
        { success: false, error: 'Opportunity ID is required' },
        { status: 400 }
      )
    }

    const validatedData = UpdateOpportunitySchema.parse(updateData)
    const updatedOpportunity = await updateAcquisitionOpportunity(opportunityId, validatedData)

    return NextResponse.json({
      success: true,
      data: updatedOpportunity,
      message: 'Opportunity updated successfully'
    })

  } catch (error) {
    console.error('Update opportunity error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid update data', 
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update opportunity' },
      { status: 500 }
    )
  }
}

async function createAcquisitionOpportunity(data: z.infer<typeof CreateOpportunitySchema>) {
  const opportunityId = `acq-${Date.now()}`
  
  // Perform AI analysis on creation
  const aiAnalysis = await performInitialAIAnalysis(data)
  
  const opportunity = {
    id: opportunityId,
    tenantId: 'demo-tenant', // In production, get from session
    businessName: data.businessName,
    businessType: data.businessType,
    industry: data.industry,
    location: data.location,
    website: data.website,
    employees: data.employees,
    yearFounded: data.yearFounded,
    annualRevenue: data.annualRevenue,
    grossProfit: data.grossProfit,
    netIncome: data.netIncome,
    askingPrice: data.askingPrice,
    estimatedValuation: aiAnalysis.estimatedValuation,
    status: 'IDENTIFIED',
    acquisitionType: data.acquisitionType,
    strategicFit: data.strategicFit,
    acquisitionReason: data.acquisitionReason,
    aiScore: aiAnalysis.aiScore,
    aiRisks: aiAnalysis.risks,
    aiOpportunities: aiAnalysis.opportunities,
    aiValuation: aiAnalysis.valuation,
    aiRecommendation: aiAnalysis.recommendation,
    dueDiligenceStatus: 'NOT_STARTED',
    dueDiligenceItems: [],
    legalIssues: [],
    financialIssues: [],
    integrationPlan: {},
    expectedSynergies: aiAnalysis.expectedSynergies,
    integrationCost: aiAnalysis.integrationCost,
    integrationTimeline: aiAnalysis.integrationTimeline,
    contactName: data.contactName,
    contactEmail: data.contactEmail,
    contactPhone: data.contactPhone,
    brokerName: data.brokerName,
    brokerContact: data.brokerContact,
    discoveredAt: new Date(),
    targetCloseDate: data.targetCloseDate ? new Date(data.targetCloseDate) : null,
    actualCloseDate: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  // Initialize due diligence checklist
  await initializeDueDiligenceChecklist(opportunityId)
  
  return opportunity
}

async function performInitialAIAnalysis(data: z.infer<typeof CreateOpportunitySchema>) {
  // Mock AI analysis - in production, use actual AI models
  
  // Calculate AI score based on various factors
  let aiScore = 50 // Base score
  
  // Revenue multiple analysis
  if (data.annualRevenue && data.askingPrice) {
    const revenueMultiple = data.askingPrice / data.annualRevenue
    if (revenueMultiple < 3) aiScore += 20
    else if (revenueMultiple < 5) aiScore += 10
    else if (revenueMultiple > 8) aiScore -= 15
  }
  
  // Industry attractiveness
  const attractiveIndustries = ['Technology', 'Healthcare', 'Finance', 'SaaS', 'E-commerce']
  if (attractiveIndustries.some(ind => data.industry.toLowerCase().includes(ind.toLowerCase()))) {
    aiScore += 15
  }
  
  // Business maturity
  if (data.yearFounded && data.yearFounded < 2010) {
    aiScore += 10 // Established business
  }
  
  // Employee count indicator
  if (data.employees) {
    if (data.employees >= 10 && data.employees <= 100) aiScore += 10 // Sweet spot
    else if (data.employees > 500) aiScore -= 5 // Large, complex
  }
  
  // Profitability check
  if (data.netIncome && data.netIncome > 0) {
    aiScore += 15
  } else if (data.netIncome && data.netIncome < 0) {
    aiScore -= 10
  }
  
  // Cap score at 100
  aiScore = Math.min(100, Math.max(0, aiScore))
  
  // Generate estimated valuation using multiple methods
  const estimatedValuation = calculateEstimatedValuation(data)
  
  // Generate risks and opportunities
  const risks = generateRisks(data, aiScore)
  const opportunities = generateOpportunities(data, aiScore)
  
  // Generate valuation breakdown
  const valuation = generateValuationBreakdown(data)
  
  // Generate recommendation
  const recommendation = generateRecommendation(aiScore, risks, opportunities)
  
  // Calculate synergies and integration
  const expectedSynergies = data.annualRevenue ? data.annualRevenue * 0.15 : 0
  const integrationCost = data.annualRevenue ? data.annualRevenue * 0.05 : 50000
  const integrationTimeline = determineIntegrationTimeline(data)

  return {
    aiScore,
    estimatedValuation,
    risks,
    opportunities,
    valuation,
    recommendation,
    expectedSynergies,
    integrationCost,
    integrationTimeline
  }
}

function calculateEstimatedValuation(data: z.infer<typeof CreateOpportunitySchema>) {
  if (!data.annualRevenue) return null
  
  // Industry-specific multiples
  const industryMultiples: Record<string, number> = {
    'technology': 4.5,
    'saas': 6.0,
    'healthcare': 3.5,
    'manufacturing': 2.8,
    'retail': 2.2,
    'construction': 2.5,
    'professional services': 3.2,
    'default': 3.0
  }
  
  const industryKey = Object.keys(industryMultiples).find(key => 
    data.industry.toLowerCase().includes(key)
  ) || 'default'
  
  const multiple = industryMultiples[industryKey]
  const revenueValuation = data.annualRevenue * multiple
  
  // Adjust for profitability
  let adjustment = 1.0
  if (data.netIncome && data.annualRevenue) {
    const profitMargin = data.netIncome / data.annualRevenue
    if (profitMargin > 0.15) adjustment = 1.2
    else if (profitMargin > 0.05) adjustment = 1.1
    else if (profitMargin < -0.05) adjustment = 0.8
  }
  
  return Math.round(revenueValuation * adjustment)
}

function generateRisks(data: z.infer<typeof CreateOpportunitySchema>, aiScore: number) {
  const risks = []
  
  // Low AI score indicates high risk
  if (aiScore < 40) {
    risks.push({
      category: 'OVERALL',
      risk: 'Low acquisition attractiveness score',
      severity: 'HIGH',
      description: 'Multiple factors indicate this may be a challenging acquisition'
    })
  }
  
  // High revenue multiple
  if (data.annualRevenue && data.askingPrice) {
    const multiple = data.askingPrice / data.annualRevenue
    if (multiple > 6) {
      risks.push({
        category: 'FINANCIAL',
        risk: 'High valuation multiple',
        severity: 'MEDIUM',
        description: `${multiple.toFixed(1)}x revenue multiple is above industry average`
      })
    }
  }
  
  // Unprofitable business
  if (data.netIncome && data.netIncome < 0) {
    risks.push({
      category: 'FINANCIAL',
      risk: 'Negative profitability',
      severity: 'HIGH',
      description: 'Business is currently operating at a loss'
    })
  }
  
  // Very small or very large business
  if (data.employees) {
    if (data.employees < 5) {
      risks.push({
        category: 'OPERATIONAL',
        risk: 'Very small team',
        severity: 'MEDIUM',
        description: 'Limited organizational depth may create integration challenges'
      })
    } else if (data.employees > 1000) {
      risks.push({
        category: 'OPERATIONAL',
        risk: 'Large organization complexity',
        severity: 'HIGH',
        description: 'Complex integration due to organizational size'
      })
    }
  }
  
  // New business
  if (data.yearFounded && data.yearFounded > 2020) {
    risks.push({
      category: 'MARKET',
      risk: 'Young business',
      severity: 'MEDIUM',
      description: 'Limited operating history and market validation'
    })
  }
  
  return risks
}

function generateOpportunities(data: z.infer<typeof CreateOpportunitySchema>, aiScore: number) {
  const opportunities = []
  
  // High AI score indicates good opportunity
  if (aiScore > 75) {
    opportunities.push({
      category: 'STRATEGIC',
      opportunity: 'High-quality acquisition target',
      impact: 'HIGH',
      description: 'Strong fundamentals indicate excellent acquisition potential'
    })
  }
  
  // Good revenue multiple
  if (data.annualRevenue && data.askingPrice) {
    const multiple = data.askingPrice / data.annualRevenue
    if (multiple < 3) {
      opportunities.push({
        category: 'FINANCIAL',
        opportunity: 'Attractive valuation',
        impact: 'HIGH',
        description: `${multiple.toFixed(1)}x revenue multiple is below market average`
      })
    }
  }
  
  // Profitable business
  if (data.netIncome && data.netIncome > 0 && data.annualRevenue) {
    const margin = data.netIncome / data.annualRevenue
    if (margin > 0.15) {
      opportunities.push({
        category: 'FINANCIAL',
        opportunity: 'Strong profitability',
        impact: 'HIGH',
        description: `${(margin * 100).toFixed(1)}% profit margin indicates efficient operations`
      })
    }
  }
  
  // Strategic fit opportunities
  if (data.strategicFit === 'HORIZONTAL') {
    opportunities.push({
      category: 'SYNERGY',
      opportunity: 'Horizontal integration synergies',
      impact: 'MEDIUM',
      description: 'Direct market expansion and customer base growth'
    })
  } else if (data.strategicFit === 'VERTICAL') {
    opportunities.push({
      category: 'SYNERGY',
      opportunity: 'Vertical integration benefits',
      impact: 'HIGH',
      description: 'Supply chain control and margin improvement potential'
    })
  }
  
  // Industry-specific opportunities
  const growthIndustries = ['technology', 'healthcare', 'renewable energy', 'e-commerce']
  if (growthIndustries.some(ind => data.industry.toLowerCase().includes(ind))) {
    opportunities.push({
      category: 'MARKET',
      opportunity: 'High-growth industry exposure',
      impact: 'MEDIUM',
      description: 'Participation in expanding market segment'
    })
  }
  
  return opportunities
}

function generateValuationBreakdown(data: z.infer<typeof CreateOpportunitySchema>) {
  if (!data.annualRevenue) return {}
  
  return {
    revenueMultipleValuation: {
      method: 'Revenue Multiple',
      value: data.annualRevenue * 3.0,
      confidence: 'MEDIUM'
    },
    dcfValuation: {
      method: 'Discounted Cash Flow',
      value: data.annualRevenue * 3.5,
      confidence: 'HIGH'
    },
    assetBasedValuation: {
      method: 'Asset-Based',
      value: data.annualRevenue * 1.5,
      confidence: 'LOW'
    },
    comparableTransactions: {
      method: 'Comparable Transactions',
      value: data.annualRevenue * 3.2,
      confidence: 'MEDIUM'
    }
  }
}

function generateRecommendation(aiScore: number, risks: any[], opportunities: any[]) {
  if (aiScore >= 80) {
    return 'STRONG_BUY: Excellent acquisition opportunity with strong fundamentals and strategic value.'
  } else if (aiScore >= 65) {
    return 'BUY: Good acquisition candidate with manageable risks and clear value creation potential.'
  } else if (aiScore >= 50) {
    return 'CONDITIONAL: Proceed with detailed due diligence to validate key assumptions and mitigate identified risks.'
  } else if (aiScore >= 30) {
    return 'CAUTION: Significant risks identified. Consider only if strategic value exceeds financial metrics.'
  } else {
    return 'AVOID: High-risk acquisition with limited upside potential. Look for better opportunities.'
  }
}

function determineIntegrationTimeline(data: z.infer<typeof CreateOpportunitySchema>) {
  if (!data.employees) return '6-12 months'
  
  if (data.employees < 10) return '3-6 months'
  else if (data.employees < 50) return '6-9 months'
  else if (data.employees < 200) return '9-15 months'
  else return '12-24 months'
}

async function initializeDueDiligenceChecklist(opportunityId: string) {
  // Create standard due diligence items
  const standardItems = [
    {
      category: 'FINANCIAL',
      items: [
        'Review 3 years of audited financial statements',
        'Analyze cash flow and working capital',
        'Verify revenue recognition practices',
        'Review accounts receivable aging',
        'Analyze debt structure and obligations'
      ]
    },
    {
      category: 'LEGAL',
      items: [
        'Corporate structure and ownership verification',
        'Contract review (key customers, suppliers, employees)',
        'Intellectual property audit',
        'Litigation and regulatory compliance review',
        'Real estate and lease agreements'
      ]
    },
    {
      category: 'OPERATIONAL',
      items: [
        'Business model and competitive position analysis',
        'Key management and employee retention',
        'Systems and technology infrastructure',
        'Customer concentration and satisfaction',
        'Supplier relationships and dependencies'
      ]
    },
    {
      category: 'MARKET',
      items: [
        'Industry and market dynamics analysis',
        'Competitive landscape assessment',
        'Customer segmentation and loyalty',
        'Growth opportunities and threats',
        'Regulatory environment and changes'
      ]
    }
  ]

  // In production, create due diligence items in database
  console.log(`Initialized due diligence checklist for opportunity ${opportunityId}`)
  
  return standardItems
}

async function performAIAnalysis(opportunityId: string) {
  // Mock detailed AI analysis
  return {
    analysisId: `analysis-${Date.now()}`,
    opportunityId,
    overallScore: 82,
    confidenceLevel: 'HIGH',
    analysis: {
      financialHealth: {
        score: 85,
        factors: [
          'Strong revenue growth trend',
          'Healthy profit margins',
          'Low debt-to-equity ratio',
          'Positive cash flow generation'
        ]
      },
      strategicFit: {
        score: 78,
        factors: [
          'Complementary product portfolio',
          'Geographic market expansion',
          'Cross-selling opportunities',
          'Technology integration potential'
        ]
      },
      marketPosition: {
        score: 80,
        factors: [
          'Strong brand recognition in niche',
          'Growing addressable market',
          'Competitive moat through patents',
          'Loyal customer base'
        ]
      },
      integrationComplexity: {
        score: 75,
        factors: [
          'Compatible technology stack',
          'Similar company cultures',
          'Manageable organizational size',
          'Clear integration pathway'
        ]
      }
    },
    recommendedActions: [
      'Fast-track due diligence process',
      'Engage integration planning team',
      'Schedule management meetings',
      'Prepare initial term sheet'
    ],
    estimatedTimeline: '6-8 weeks to close',
    keyRisks: [
      'Key personnel retention',
      'Customer concentration (top 3 = 45% revenue)',
      'Regulatory approval requirements'
    ],
    valuationRange: {
      low: 2800000,
      mid: 3200000,
      high: 3600000,
      recommended: 3200000
    }
  }
}

async function scanMarketOpportunities(industry: string, location: string, criteria: any) {
  // Mock market scanning results
  return {
    scanId: `scan-${Date.now()}`,
    totalFound: 127,
    qualified: 23,
    topOpportunities: [
      {
        businessName: 'TechFlow Solutions',
        industry: 'Technology Services',
        location: 'Austin, TX',
        estimatedRevenue: 2500000,
        estimatedValuation: 8750000,
        matchScore: 92,
        keyAttributes: ['Fast growing', 'Profitable', 'Great team']
      },
      {
        businessName: 'Green Energy Systems',
        industry: 'Renewable Energy',
        location: 'Denver, CO',
        estimatedRevenue: 5200000,
        estimatedValuation: 15600000,
        matchScore: 88,
        keyAttributes: ['Government contracts', 'IP portfolio', 'Recurring revenue']
      }
    ],
    marketInsights: {
      averageMultiple: 3.2,
      medianMultiple: 2.8,
      totalMarketSize: '$2.4B',
      growthRate: '12% annually'
    },
    nextSteps: [
      'Review detailed profiles',
      'Reach out to top matches',
      'Schedule initial meetings',
      'Perform preliminary screening'
    ]
  }
}

async function calculateValuation(opportunityId: string, method: string) {
  // Mock valuation calculation
  return {
    valuationId: `val-${Date.now()}`,
    opportunityId,
    method,
    valuation: 3200000,
    confidenceLevel: 'HIGH',
    assumptions: [
      '15% discount rate',
      '3.5x revenue multiple',
      '5% terminal growth rate',
      'Industry benchmarks applied'
    ],
    breakdown: {
      baseValuation: 3000000,
      synergiesValue: 450000,
      riskAdjustment: -250000,
      finalValuation: 3200000
    },
    comparisons: [
      { method: 'DCF', value: 3200000 },
      { method: 'Revenue Multiple', value: 3000000 },
      { method: 'EBITDA Multiple', value: 3400000 },
      { method: 'Asset Based', value: 2800000 }
    ]
  }
}

async function updateAcquisitionOpportunity(opportunityId: string, updateData: z.infer<typeof UpdateOpportunitySchema>) {
  // In production, update database record
  const mockUpdated = {
    id: opportunityId,
    ...updateData,
    updatedAt: new Date()
  }
  
  return mockUpdated
}

function getMockOpportunities() {
  return [
    {
      id: 'acq-001',
      tenantId: 'demo-tenant',
      businessName: 'TechFlow Solutions',
      businessType: 'Technology Services',
      industry: 'Software Development',
      location: 'Austin, TX',
      website: 'https://techflowsolutions.com',
      employees: 25,
      yearFounded: 2018,
      annualRevenue: 2500000,
      grossProfit: 1500000,
      netIncome: 375000,
      askingPrice: 8750000,
      estimatedValuation: 8200000,
      status: 'EVALUATING',
      acquisitionType: 'ACQUISITION',
      strategicFit: 'HORIZONTAL',
      acquisitionReason: 'Expand into Texas market with proven development team',
      aiScore: 87,
      aiRisks: [
        { category: 'TALENT', risk: 'Key developer retention' },
        { category: 'CUSTOMER', risk: 'Top 2 clients = 60% revenue' }
      ],
      aiOpportunities: [
        { category: 'MARKET', opportunity: 'Austin tech scene growth' },
        { category: 'SYNERGY', opportunity: 'Cross-selling to existing clients' }
      ],
      aiRecommendation: 'STRONG_BUY: Excellent technical team and market position',
      dueDiligenceStatus: 'IN_PROGRESS',
      expectedSynergies: 450000,
      integrationCost: 125000,
      integrationTimeline: '6-9 months',
      contactName: 'Sarah Johnson',
      contactEmail: 'sarah@techflowsolutions.com',
      contactPhone: '+1-512-555-0123',
      discoveredAt: new Date('2024-02-15'),
      targetCloseDate: new Date('2024-05-15'),
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date('2024-03-10')
    },
    {
      id: 'acq-002',
      tenantId: 'demo-tenant',
      businessName: 'Green Energy Systems',
      businessType: 'Manufacturing',
      industry: 'Renewable Energy',
      location: 'Denver, CO',
      website: 'https://greenenergysys.com',
      employees: 85,
      yearFounded: 2015,
      annualRevenue: 5200000,
      grossProfit: 2080000,
      netIncome: 780000,
      askingPrice: 15600000,
      estimatedValuation: 16800000,
      status: 'DUE_DILIGENCE',
      acquisitionType: 'ACQUISITION',
      strategicFit: 'VERTICAL',
      acquisitionReason: 'Vertical integration to control renewable energy supply chain',
      aiScore: 92,
      aiRisks: [
        { category: 'REGULATORY', risk: 'Changing government incentives' },
        { category: 'COMPETITIVE', risk: 'Large players entering market' }
      ],
      aiOpportunities: [
        { category: 'POLICY', opportunity: 'Green energy mandates' },
        { category: 'TECHNOLOGY', opportunity: 'Patent portfolio value' }
      ],
      aiRecommendation: 'BUY: Strong growth potential with manageable risks',
      dueDiligenceStatus: 'IN_PROGRESS',
      expectedSynergies: 780000,
      integrationCost: 260000,
      integrationTimeline: '9-12 months',
      contactName: 'Michael Chen',
      contactEmail: 'mchen@greenenergysys.com',
      contactPhone: '+1-303-555-0456',
      brokerName: 'Denver Business Brokers',
      brokerContact: 'james@denverbizbrokers.com',
      discoveredAt: new Date('2024-01-20'),
      targetCloseDate: new Date('2024-06-30'),
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-03-18')
    },
    {
      id: 'acq-003',
      tenantId: 'demo-tenant',
      businessName: 'Coastal Manufacturing',
      businessType: 'Manufacturing',
      industry: 'Industrial Equipment',
      location: 'San Diego, CA',
      employees: 150,
      yearFounded: 2008,
      annualRevenue: 12000000,
      grossProfit: 3600000,
      netIncome: 1200000,
      askingPrice: 36000000,
      estimatedValuation: 33600000,
      status: 'NEGOTIATING',
      acquisitionType: 'ACQUISITION',
      strategicFit: 'MARKET_EXPANSION',
      acquisitionReason: 'West Coast market entry with established manufacturing base',
      aiScore: 75,
      aiRisks: [
        { category: 'OPERATIONAL', risk: 'Aging equipment requiring updates' },
        { category: 'ENVIRONMENTAL', risk: 'California regulations compliance' }
      ],
      aiOpportunities: [
        { category: 'EFFICIENCY', opportunity: 'Automation and digitization' },
        { category: 'MARKET', opportunity: 'Defense contract potential' }
      ],
      aiRecommendation: 'CONDITIONAL: Solid business requiring operational improvements',
      dueDiligenceStatus: 'COMPLETED',
      expectedSynergies: 1800000,
      integrationCost: 600000,
      integrationTimeline: '12-18 months',
      contactName: 'David Rodriguez',
      contactEmail: 'david@coastalmfg.com',
      contactPhone: '+1-619-555-0789',
      discoveredAt: new Date('2023-11-10'),
      targetCloseDate: new Date('2024-04-30'),
      createdAt: new Date('2023-11-10'),
      updatedAt: new Date('2024-03-22')
    }
  ]
}

function calculateOpportunityAnalytics(opportunities: any[]) {
  const total = opportunities.length
  
  const statusDistribution = {
    IDENTIFIED: opportunities.filter(o => o.status === 'IDENTIFIED').length,
    EVALUATING: opportunities.filter(o => o.status === 'EVALUATING').length,
    DUE_DILIGENCE: opportunities.filter(o => o.status === 'DUE_DILIGENCE').length,
    NEGOTIATING: opportunities.filter(o => o.status === 'NEGOTIATING').length,
    CLOSED_WON: opportunities.filter(o => o.status === 'CLOSED_WON').length,
    CLOSED_LOST: opportunities.filter(o => o.status === 'CLOSED_LOST').length
  }
  
  const typeDistribution = {
    ACQUISITION: opportunities.filter(o => o.acquisitionType === 'ACQUISITION').length,
    MERGER: opportunities.filter(o => o.acquisitionType === 'MERGER').length,
    ASSET_PURCHASE: opportunities.filter(o => o.acquisitionType === 'ASSET_PURCHASE').length,
    PARTNERSHIP: opportunities.filter(o => o.acquisitionType === 'PARTNERSHIP').length
  }
  
  const industryDistribution = opportunities.reduce((acc, o) => {
    acc[o.industry] = (acc[o.industry] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const avgAiScore = total > 0 ? 
    opportunities.reduce((sum, o) => sum + (o.aiScore || 0), 0) / total : 0
    
  const totalAskingPrice = opportunities
    .filter(o => o.askingPrice)
    .reduce((sum, o) => sum + o.askingPrice, 0)
    
  const totalEstimatedValue = opportunities
    .filter(o => o.estimatedValuation)
    .reduce((sum, o) => sum + o.estimatedValuation, 0)
    
  const totalExpectedSynergies = opportunities
    .filter(o => o.expectedSynergies)
    .reduce((sum, o) => sum + o.expectedSynergies, 0)

  return {
    totalOpportunities: total,
    statusDistribution,
    typeDistribution,
    industryDistribution,
    averageAiScore: Math.round(avgAiScore),
    totalAskingPrice,
    totalEstimatedValue,
    totalExpectedSynergies,
    averageAskingPrice: total > 0 ? Math.round(totalAskingPrice / total) : 0,
    averageEstimatedValue: total > 0 ? Math.round(totalEstimatedValue / total) : 0,
    highPotentialOpportunities: opportunities.filter(o => o.aiScore >= 80).length,
    activeOpportunities: opportunities.filter(o => 
      ['EVALUATING', 'DUE_DILIGENCE', 'NEGOTIATING'].includes(o.status)
    ).length
  }
}