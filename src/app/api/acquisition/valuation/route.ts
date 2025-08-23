import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const CreateValuationSchema = z.object({
  opportunityId: z.string(),
  valuationMethod: z.enum(['DCF', 'MULTIPLES', 'ASSET_BASED', 'MARKET_APPROACH']),
  
  // DCF Analysis
  dcfProjectedCashFlows: z.array(z.number()).optional(),
  dcfDiscountRate: z.number().min(0).max(1).optional(),
  dcfTerminalValue: z.number().optional(),
  dcfGrowthRate: z.number().min(-1).max(1).optional(),
  
  // Multiple Analysis
  multipleType: z.enum(['REVENUE', 'EBITDA', 'EARNINGS', 'BOOK_VALUE']).optional(),
  multipleValue: z.number().optional(),
  comparableCompanies: z.array(z.object({
    name: z.string(),
    revenue: z.number(),
    valuation: z.number(),
    multiple: z.number()
  })).optional(),
  
  // Asset-Based Analysis
  tangibleAssets: z.number().optional(),
  intangibleAssets: z.number().optional(),
  totalLiabilities: z.number().optional(),
  
  // Risk Adjustments
  riskFactors: z.array(z.object({
    factor: z.string(),
    impact: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    adjustment: z.number()
  })).optional(),
  
  notes: z.string().optional(),
  performedBy: z.string().optional()
})

const DueDiligenceItemSchema = z.object({
  opportunityId: z.string(),
  category: z.enum(['FINANCIAL', 'LEGAL', 'OPERATIONAL', 'TECHNICAL', 'MARKET', 'HR']),
  itemName: z.string(),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional(),
  documentsRequired: z.array(z.string()).optional().default([]),
  findings: z.string().optional(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  recommendations: z.string().optional(),
  actionItems: z.array(z.string()).optional().default([])
})

const ValuationQuerySchema = z.object({
  opportunityId: z.string(),
  valuationMethod: z.enum(['DCF', 'MULTIPLES', 'ASSET_BASED', 'MARKET_APPROACH']).optional(),
  limit: z.number().min(1).max(50).optional().default(10),
  offset: z.number().min(0).optional().default(0)
})

const DueDiligenceQuerySchema = z.object({
  opportunityId: z.string().optional(),
  category: z.enum(['FINANCIAL', 'LEGAL', 'OPERATIONAL', 'TECHNICAL', 'MARKET', 'HR']).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'NOT_APPLICABLE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  assignedTo: z.string().optional(),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const action = body.action

    if (action === 'create_valuation') {
      const validatedData = CreateValuationSchema.parse(body.data)
      const valuation = await createValuation(validatedData)
      
      return NextResponse.json({
        success: true,
        data: valuation,
        message: 'Valuation created successfully'
      })
      
    } else if (action === 'create_due_diligence') {
      const validatedData = DueDiligenceItemSchema.parse(body.data)
      const item = await createDueDiligenceItem(validatedData)
      
      return NextResponse.json({
        success: true,
        data: item,
        message: 'Due diligence item created successfully'
      })
      
    } else if (action === 'bulk_create_due_diligence') {
      const { opportunityId, template } = body.data
      const items = await createDueDiligenceTemplate(opportunityId, template)
      
      return NextResponse.json({
        success: true,
        data: items,
        message: `${items.length} due diligence items created from template`
      })
      
    } else if (action === 'ai_valuation') {
      const { opportunityId, methods } = body.data
      const aiValuation = await performAIValuation(opportunityId, methods)
      
      return NextResponse.json({
        success: true,
        data: aiValuation
      })
      
    } else if (action === 'comparable_analysis') {
      const { opportunityId, industry, size } = body.data
      const comparables = await findComparableCompanies(opportunityId, industry, size)
      
      return NextResponse.json({
        success: true,
        data: comparables
      })
      
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action specified' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Valuation API error:', error)
    
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
      { success: false, error: 'Failed to process valuation request' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get('endpoint')

    if (endpoint === 'valuations') {
      const queryParams = {
        opportunityId: searchParams.get('opportunityId') || '',
        valuationMethod: searchParams.get('valuationMethod') || undefined,
        limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10,
        offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0
      }

      const validatedQuery = ValuationQuerySchema.parse(queryParams)
      const valuations = await getValuations(validatedQuery)
      
      return NextResponse.json({
        success: true,
        data: valuations
      })
      
    } else if (endpoint === 'due_diligence') {
      const queryParams = {
        opportunityId: searchParams.get('opportunityId') || undefined,
        category: searchParams.get('category') || undefined,
        status: searchParams.get('status') || undefined,
        priority: searchParams.get('priority') || undefined,
        assignedTo: searchParams.get('assignedTo') || undefined,
        limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
        offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0
      }

      const validatedQuery = DueDiligenceQuerySchema.parse(queryParams)
      const items = await getDueDiligenceItems(validatedQuery)
      
      return NextResponse.json({
        success: true,
        data: items
      })
      
    } else if (endpoint === 'valuation_summary') {
      const opportunityId = searchParams.get('opportunityId')
      if (!opportunityId) {
        return NextResponse.json(
          { success: false, error: 'Opportunity ID is required' },
          { status: 400 }
        )
      }
      
      const summary = await getValuationSummary(opportunityId)
      
      return NextResponse.json({
        success: true,
        data: summary
      })
      
    } else if (endpoint === 'due_diligence_progress') {
      const opportunityId = searchParams.get('opportunityId')
      if (!opportunityId) {
        return NextResponse.json(
          { success: false, error: 'Opportunity ID is required' },
          { status: 400 }
        )
      }
      
      const progress = await getDueDiligenceProgress(opportunityId)
      
      return NextResponse.json({
        success: true,
        data: progress
      })
      
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid endpoint specified' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Get valuation data error:', error)
    
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
      { success: false, error: 'Failed to fetch valuation data' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { itemId, status, findings, riskLevel, recommendations, actionItems } = body
    
    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'Item ID is required' },
        { status: 400 }
      )
    }

    const updatedItem = await updateDueDiligenceItem(itemId, {
      status,
      findings,
      riskLevel,
      recommendations,
      actionItems,
      completedDate: status === 'COMPLETED' ? new Date() : undefined
    })

    return NextResponse.json({
      success: true,
      data: updatedItem,
      message: 'Due diligence item updated successfully'
    })

  } catch (error) {
    console.error('Update due diligence item error:', error)
    
    return NextResponse.json(
      { success: false, error: 'Failed to update due diligence item' },
      { status: 500 }
    )
  }
}

async function createValuation(data: z.infer<typeof CreateValuationSchema>) {
  const valuationId = `val-${Date.now()}`
  
  // Calculate valuation based on method
  const valuationAmount = calculateValuationAmount(data)
  const confidenceLevel = determineConfidenceLevel(data)
  const finalValuation = applyRiskAdjustments(valuationAmount, data.riskFactors || [])
  
  // Perform AI validation
  const aiValidation = await performAIValidation(data, valuationAmount)
  
  const valuation = {
    id: valuationId,
    opportunityId: data.opportunityId,
    valuationMethod: data.valuationMethod,
    valuationAmount,
    confidenceLevel,
    dcfProjectedCashFlows: data.dcfProjectedCashFlows,
    dcfDiscountRate: data.dcfDiscountRate,
    dcfTerminalValue: data.dcfTerminalValue,
    dcfGrowthRate: data.dcfGrowthRate,
    multipleType: data.multipleType,
    multipleValue: data.multipleValue,
    comparableCompanies: data.comparableCompanies,
    tangibleAssets: data.tangibleAssets,
    intangibleAssets: data.intangibleAssets,
    totalLiabilities: data.totalLiabilities,
    netAssetValue: calculateNetAssetValue(data),
    riskFactors: data.riskFactors,
    riskAdjustment: valuationAmount - finalValuation,
    finalValuation,
    aiValidation,
    aiAdjustments: aiValidation.suggestedAdjustments,
    valuationDate: new Date(),
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    performedBy: data.performedBy,
    notes: data.notes,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  return valuation
}

function calculateValuationAmount(data: z.infer<typeof CreateValuationSchema>): number {
  switch (data.valuationMethod) {
    case 'DCF':
      return calculateDCFValuation(data)
    case 'MULTIPLES':
      return calculateMultiplesValuation(data)
    case 'ASSET_BASED':
      return calculateAssetBasedValuation(data)
    case 'MARKET_APPROACH':
      return calculateMarketApproachValuation(data)
    default:
      return 0
  }
}

function calculateDCFValuation(data: z.infer<typeof CreateValuationSchema>): number {
  if (!data.dcfProjectedCashFlows || !data.dcfDiscountRate) return 0
  
  const discountRate = data.dcfDiscountRate
  const terminalValue = data.dcfTerminalValue || 0
  const growthRate = data.dcfGrowthRate || 0.02
  
  // Calculate present value of projected cash flows
  let presentValue = 0
  for (let i = 0; i < data.dcfProjectedCashFlows.length; i++) {
    const cashFlow = data.dcfProjectedCashFlows[i]
    if (cashFlow !== undefined) {
      const pv = cashFlow / Math.pow(1 + discountRate, i + 1)
      presentValue += pv
    }
  }
  
  // Add terminal value
  if (terminalValue > 0) {
    const terminalPV = terminalValue / Math.pow(1 + discountRate, data.dcfProjectedCashFlows.length)
    presentValue += terminalPV
  } else {
    // Calculate terminal value using perpetuity growth model
    const finalCashFlow = data.dcfProjectedCashFlows[data.dcfProjectedCashFlows.length - 1]
    if (finalCashFlow !== undefined) {
      const terminalCashFlow = finalCashFlow * (1 + growthRate)
      const calculatedTerminalValue = terminalCashFlow / (discountRate - growthRate)
      const terminalPV = calculatedTerminalValue / Math.pow(1 + discountRate, data.dcfProjectedCashFlows.length)
      presentValue += terminalPV
    }
  }
  
  return Math.round(presentValue)
}

function calculateMultiplesValuation(data: z.infer<typeof CreateValuationSchema>): number {
  if (!data.multipleValue) return 0
  
  // For demo purposes, assume we have base revenue/EBITDA
  const baseValue = 1000000 // This would come from opportunity data
  return Math.round(baseValue * data.multipleValue)
}

function calculateAssetBasedValuation(data: z.infer<typeof CreateValuationSchema>): number {
  const tangible = data.tangibleAssets || 0
  const intangible = data.intangibleAssets || 0
  const liabilities = data.totalLiabilities || 0
  
  return Math.round(tangible + intangible - liabilities)
}

function calculateMarketApproachValuation(data: z.infer<typeof CreateValuationSchema>): number {
  if (!data.comparableCompanies || data.comparableCompanies.length === 0) return 0
  
  // Calculate average multiple from comparables
  const avgMultiple = data.comparableCompanies.reduce((sum, comp) => sum + comp.multiple, 0) / data.comparableCompanies.length
  
  // Apply to target company (demo value)
  const targetRevenue = 1000000 // This would come from opportunity data
  return Math.round(targetRevenue * avgMultiple)
}

function calculateNetAssetValue(data: z.infer<typeof CreateValuationSchema>): number {
  if (data.valuationMethod !== 'ASSET_BASED') return 0
  
  const tangible = data.tangibleAssets || 0
  const intangible = data.intangibleAssets || 0
  const liabilities = data.totalLiabilities || 0
  
  return tangible + intangible - liabilities
}

function determineConfidenceLevel(data: z.infer<typeof CreateValuationSchema>): string {
  // Confidence based on data quality and method
  let score = 0
  
  if (data.valuationMethod === 'DCF' && data.dcfProjectedCashFlows && data.dcfProjectedCashFlows.length >= 3) {
    score += 30
  }
  
  if (data.comparableCompanies && data.comparableCompanies.length >= 3) {
    score += 25
  }
  
  if (data.tangibleAssets && data.intangibleAssets && data.totalLiabilities) {
    score += 20
  }
  
  if (data.riskFactors && data.riskFactors.length > 0) {
    score += 15
  }
  
  if (score >= 70) return 'HIGH'
  if (score >= 40) return 'MEDIUM'
  return 'LOW'
}

function applyRiskAdjustments(baseValuation: number, riskFactors: any[]): number {
  let totalAdjustment = 0
  
  for (const risk of riskFactors) {
    totalAdjustment += risk.adjustment
  }
  
  return Math.round(baseValuation + totalAdjustment)
}

async function performAIValidation(data: z.infer<typeof CreateValuationSchema>, valuation: number) {
  // Mock AI validation
  const validation = {
    overallAssessment: 'REASONABLE',
    confidenceScore: 78,
    suggestedAdjustments: [] as Array<{ type: string; suggestion: string; impact: number }>,
    marketComparison: {
      industryMedian: valuation * 0.9,
      industryAverage: valuation * 1.1,
      marketPosition: 'ABOVE_MEDIAN'
    },
    riskAnalysis: {
      overallRisk: 'MEDIUM',
      keyRisks: [
        'Market volatility',
        'Integration complexity',
        'Regulatory changes'
      ]
    },
    recommendations: [
      'Consider sensitivity analysis for key assumptions',
      'Update projections based on recent market data',
      'Include scenario planning in valuation model'
    ]
  }
  
  // Add suggested adjustments based on method
  if (data.valuationMethod === 'DCF' && data.dcfDiscountRate && data.dcfDiscountRate < 0.08) {
    validation.suggestedAdjustments.push({
      type: 'DISCOUNT_RATE',
      suggestion: 'Consider higher discount rate for industry risk',
      impact: -valuation * 0.05
    })
  }
  
  if (data.valuationMethod === 'MULTIPLES' && data.multipleValue && data.multipleValue > 5) {
    validation.suggestedAdjustments.push({
      type: 'MULTIPLE_ADJUSTMENT',
      suggestion: 'High multiple may indicate market optimism',
      impact: -valuation * 0.1
    })
  }
  
  return validation
}

async function createDueDiligenceItem(data: z.infer<typeof DueDiligenceItemSchema>) {
  const itemId = `dd-${Date.now()}`
  
  // Generate AI suggestions for the item
  const aiSuggestions = await generateAISuggestions(data)
  
  const item = {
    id: itemId,
    opportunityId: data.opportunityId,
    category: data.category,
    itemName: data.itemName,
    description: data.description,
    priority: data.priority,
    status: 'PENDING',
    assignedTo: data.assignedTo,
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
    completedDate: null,
    findings: data.findings,
    riskLevel: data.riskLevel,
    recommendations: data.recommendations,
    actionItems: data.actionItems,
    documentsRequired: data.documentsRequired,
    documentsReceived: [],
    documentsReviewed: false,
    aiRiskAssessment: aiSuggestions.riskAssessment,
    aiSuggestions: aiSuggestions.suggestions,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  return item
}

async function generateAISuggestions(data: z.infer<typeof DueDiligenceItemSchema>) {
  // Mock AI-generated suggestions based on category and item type
  const suggestions = {
    riskAssessment: {
      overallRisk: 'MEDIUM',
      specificRisks: [] as string[],
      mitigationStrategies: [] as string[]
    },
    suggestions: [] as string[]
  }

  switch (data.category) {
    case 'FINANCIAL':
      suggestions.riskAssessment.specificRisks = [
        'Revenue recognition timing',
        'Working capital requirements',
        'Debt covenant compliance'
      ]
      suggestions.suggestions = [
        'Request 36-month financial statements',
        'Analyze cash conversion cycle',
        'Review management representations'
      ]
      break
      
    case 'LEGAL':
      suggestions.riskAssessment.specificRisks = [
        'Pending litigation exposure',
        'Regulatory compliance gaps',
        'Contract termination clauses'
      ]
      suggestions.suggestions = [
        'Comprehensive legal entity review',
        'IP ownership verification',
        'Employment law compliance check'
      ]
      break
      
    case 'OPERATIONAL':
      suggestions.riskAssessment.specificRisks = [
        'Key person dependency',
        'System integration complexity',
        'Process standardization needs'
      ]
      suggestions.suggestions = [
        'Document critical processes',
        'Assess management depth',
        'Evaluate system compatibility'
      ]
      break
      
    default:
      suggestions.suggestions = [
        'Define specific evaluation criteria',
        'Identify key stakeholders',
        'Establish documentation requirements'
      ]
  }

  return suggestions
}

async function createDueDiligenceTemplate(opportunityId: string, template: string) {
  const templateItems = getDueDiligenceTemplate(template)
  const items = []
  
  for (const templateItem of templateItems) {
    const item = await createDueDiligenceItem({
      opportunityId,
      category: templateItem.category,
      itemName: templateItem.itemName,
      description: templateItem.description,
      priority: templateItem.priority,
      documentsRequired: templateItem.documentsRequired,
      actionItems: []
    })
    items.push(item)
  }
  
  return items
}

function getDueDiligenceTemplate(template: string) {
  const templates = {
    'comprehensive': [
      // Financial Items
      {
        category: 'FINANCIAL' as const,
        itemName: 'Audited Financial Statements Review',
        description: 'Review 3 years of audited financial statements',
        priority: 'HIGH' as const,
        documentsRequired: ['Income statements', 'Balance sheets', 'Cash flow statements', 'Audit reports']
      },
      {
        category: 'FINANCIAL' as const,
        itemName: 'Management Financial Statements',
        description: 'Review interim management accounts and budget vs actual',
        priority: 'HIGH' as const,
        documentsRequired: ['Monthly P&L', 'Budget reports', 'Variance analysis']
      },
      {
        category: 'FINANCIAL' as const,
        itemName: 'Working Capital Analysis',
        description: 'Analyze accounts receivable, payable, and inventory',
        priority: 'MEDIUM' as const,
        documentsRequired: ['AR aging', 'AP aging', 'Inventory reports']
      },
      
      // Legal Items
      {
        category: 'LEGAL' as const,
        itemName: 'Corporate Structure Review',
        description: 'Verify legal entity structure and ownership',
        priority: 'HIGH' as const,
        documentsRequired: ['Articles of incorporation', 'Bylaws', 'Shareholder agreements']
      },
      {
        category: 'LEGAL' as const,
        itemName: 'Material Contracts Review',
        description: 'Review all material customer, supplier, and partnership agreements',
        priority: 'HIGH' as const,
        documentsRequired: ['Customer contracts', 'Supplier agreements', 'Partnership agreements']
      },
      {
        category: 'LEGAL' as const,
        itemName: 'Intellectual Property Audit',
        description: 'Verify ownership and registration of IP assets',
        priority: 'MEDIUM' as const,
        documentsRequired: ['Patent filings', 'Trademark registrations', 'Copyright documentation']
      },
      
      // Operational Items
      {
        category: 'OPERATIONAL' as const,
        itemName: 'Key Management Assessment',
        description: 'Evaluate management team and key personnel',
        priority: 'HIGH' as const,
        documentsRequired: ['Organization chart', 'Management CVs', 'Employment contracts']
      },
      {
        category: 'OPERATIONAL' as const,
        itemName: 'Customer Analysis',
        description: 'Analyze customer concentration and satisfaction',
        priority: 'HIGH' as const,
        documentsRequired: ['Customer list', 'Revenue by customer', 'Customer surveys']
      },
      {
        category: 'OPERATIONAL' as const,
        itemName: 'Systems and Technology Review',
        description: 'Assess IT infrastructure and system capabilities',
        priority: 'MEDIUM' as const,
        documentsRequired: ['System architecture', 'Software licenses', 'IT policies']
      }
    ],
    
    'financial_focus': [
      {
        category: 'FINANCIAL' as const,
        itemName: 'Quality of Earnings Analysis',
        description: 'Detailed analysis of earnings quality and sustainability',
        priority: 'CRITICAL' as const,
        documentsRequired: ['Detailed general ledger', 'Journal entries', 'Revenue recognition policies']
      },
      {
        category: 'FINANCIAL' as const,
        itemName: 'Cash Flow Verification',
        description: 'Verify cash flow generation and working capital needs',
        priority: 'HIGH' as const,
        documentsRequired: ['Bank statements', 'Cash flow statements', 'Working capital analysis']
      },
      {
        category: 'FINANCIAL' as const,
        itemName: 'Debt and Liability Review',
        description: 'Complete review of all debt obligations and contingent liabilities',
        priority: 'HIGH' as const,
        documentsRequired: ['Loan agreements', 'Lease agreements', 'Contingent liability disclosure']
      }
    ],
    
    'operational_focus': [
      {
        category: 'OPERATIONAL' as const,
        itemName: 'Business Model Validation',
        description: 'Validate business model and competitive positioning',
        priority: 'HIGH' as const,
        documentsRequired: ['Business plan', 'Competitive analysis', 'Market research']
      },
      {
        category: 'OPERATIONAL' as const,
        itemName: 'Process Documentation',
        description: 'Document all critical business processes',
        priority: 'MEDIUM' as const,
        documentsRequired: ['Process maps', 'Standard operating procedures', 'Quality manuals']
      },
      {
        category: 'HR' as const,
        itemName: 'Human Resources Review',
        description: 'Complete HR policies and employee relations review',
        priority: 'MEDIUM' as const,
        documentsRequired: ['Employee handbook', 'HR policies', 'Employment agreements']
      }
    ]
  }
  
  return templates[template as keyof typeof templates] || templates.comprehensive
}

async function performAIValuation(opportunityId: string, methods: string[]) {
  // Mock AI-powered valuation using multiple methods
  const aiValuation = {
    valuationId: `ai-val-${Date.now()}`,
    opportunityId,
    methods,
    overallValuation: {
      low: 2800000,
      mid: 3200000,
      high: 3600000,
      recommended: 3200000,
      confidence: 'HIGH'
    },
    methodResults: {
      DCF: {
        valuation: 3150000,
        confidence: 'HIGH',
        keyAssumptions: [
          '12% discount rate',
          '3% terminal growth',
          '5-year projection period'
        ]
      },
      MULTIPLES: {
        valuation: 3200000,
        confidence: 'MEDIUM',
        keyAssumptions: [
          '3.2x revenue multiple',
          'Industry median multiple',
          'Adjusted for size'
        ]
      },
      MARKET_APPROACH: {
        valuation: 3300000,
        confidence: 'MEDIUM',
        keyAssumptions: [
          '5 comparable transactions',
          'Similar industry and size',
          'Recent transaction data'
        ]
      }
    },
    riskFactors: [
      {
        factor: 'Customer concentration',
        impact: 'MEDIUM',
        valuationImpact: -150000,
        mitigation: 'Customer diversification strategy'
      },
      {
        factor: 'Technology refresh needs',
        impact: 'LOW',
        valuationImpact: -50000,
        mitigation: 'CapEx planning'
      }
    ],
    upside: [
      {
        opportunity: 'Market expansion',
        impact: 'HIGH',
        valuationImpact: 400000,
        probability: 0.7
      },
      {
        opportunity: 'Operational efficiencies',
        impact: 'MEDIUM',
        valuationImpact: 200000,
        probability: 0.8
      }
    ],
    sensitivityAnalysis: {
      revenueGrowth: {
        '-10%': 2900000,
        'Base': 3200000,
        '+10%': 3500000
      },
      discountRate: {
        '10%': 3400000,
        '12%': 3200000,
        '14%': 3000000
      }
    },
    recommendation: 'Target valuation range of $3.0M - $3.4M based on risk-adjusted analysis',
    lastUpdated: new Date()
  }
  
  return aiValuation
}

async function findComparableCompanies(opportunityId: string, industry: string, size: string) {
  // Mock comparable company analysis
  return {
    searchCriteria: {
      industry,
      size,
      timeframe: '24 months'
    },
    comparables: [
      {
        companyName: 'TechSolutions Inc',
        industry: 'Software Development',
        revenue: 2800000,
        valuation: 8400000,
        multiple: 3.0,
        transactionDate: '2024-01-15',
        source: 'Private transaction'
      },
      {
        companyName: 'Digital Services Corp',
        industry: 'Technology Services',
        revenue: 3200000,
        valuation: 11200000,
        multiple: 3.5,
        transactionDate: '2023-11-20',
        source: 'Public filing'
      },
      {
        companyName: 'Code Crafters LLC',
        industry: 'Software Development',
        revenue: 2100000,
        valuation: 6300000,
        multiple: 3.0,
        transactionDate: '2023-09-10',
        source: 'Industry report'
      }
    ],
    analysis: {
      medianMultiple: 3.0,
      averageMultiple: 3.17,
      rangeMultiple: '3.0x - 3.5x',
      recommendation: 'Target company fits within comparable range at 3.2x revenue multiple'
    },
    marketTrends: [
      'Software services multiples trending upward',
      'Premium for recurring revenue models',
      'Size discount for sub-$5M revenue companies'
    ]
  }
}

async function getValuations(query: z.infer<typeof ValuationQuerySchema>) {
  // Mock valuation data
  const mockValuations = getMockValuations().filter(v => v.opportunityId === query.opportunityId)
  
  if (query.valuationMethod) {
    return mockValuations.filter(v => v.valuationMethod === query.valuationMethod)
  }
  
  return {
    valuations: mockValuations.slice(query.offset, query.offset + query.limit),
    total: mockValuations.length,
    pagination: {
      limit: query.limit,
      offset: query.offset,
      hasMore: query.offset + query.limit < mockValuations.length
    }
  }
}

async function getDueDiligenceItems(query: z.infer<typeof DueDiligenceQuerySchema>) {
  // Mock due diligence data
  let mockItems = getMockDueDiligenceItems()
  
  if (query.opportunityId) {
    mockItems = mockItems.filter(item => item.opportunityId === query.opportunityId)
  }
  
  if (query.category) {
    mockItems = mockItems.filter(item => item.category === query.category)
  }
  
  if (query.status) {
    mockItems = mockItems.filter(item => item.status === query.status)
  }
  
  if (query.priority) {
    mockItems = mockItems.filter(item => item.priority === query.priority)
  }
  
  if (query.assignedTo) {
    mockItems = mockItems.filter(item => item.assignedTo === query.assignedTo)
  }
  
  return {
    items: mockItems.slice(query.offset, query.offset + query.limit),
    total: mockItems.length,
    pagination: {
      limit: query.limit,
      offset: query.offset,
      hasMore: query.offset + query.limit < mockItems.length
    },
    analytics: calculateDueDiligenceAnalytics(mockItems)
  }
}

async function getValuationSummary(opportunityId: string) {
  const valuations = getMockValuations().filter(v => v.opportunityId === opportunityId)
  
  if (valuations.length === 0) {
    return {
      opportunityId,
      valuationCount: 0,
      recommendedValuation: null,
      valuationRange: null,
      lastUpdated: null
    }
  }
  
  const amounts = valuations.map(v => v.finalValuation || v.valuationAmount)
  const minValuation = Math.min(...amounts)
  const maxValuation = Math.max(...amounts)
  const avgValuation = amounts.reduce((sum, val) => sum + val, 0) / amounts.length
  
  return {
    opportunityId,
    valuationCount: valuations.length,
    recommendedValuation: Math.round(avgValuation),
    valuationRange: {
      min: minValuation,
      max: maxValuation,
      average: Math.round(avgValuation)
    },
    methodBreakdown: valuations.reduce((acc, val) => {
      acc[val.valuationMethod] = val.finalValuation || val.valuationAmount
      return acc
    }, {} as Record<string, number>),
    confidenceDistribution: valuations.reduce((acc, val) => {
      acc[val.confidenceLevel] = (acc[val.confidenceLevel] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    lastUpdated: new Date(Math.max(...valuations.map(v => new Date(v.updatedAt).getTime())))
  }
}

async function getDueDiligenceProgress(opportunityId: string) {
  const items = getMockDueDiligenceItems().filter(item => item.opportunityId === opportunityId)
  
  const total = items.length
  const completed = items.filter(item => item.status === 'COMPLETED').length
  const inProgress = items.filter(item => item.status === 'IN_PROGRESS').length
  const pending = items.filter(item => item.status === 'PENDING').length
  const blocked = items.filter(item => item.status === 'BLOCKED').length
  
  const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0
  
  const categoryProgress = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = { total: 0, completed: 0 }
    }
    acc[item.category].total++
    if (item.status === 'COMPLETED') {
      acc[item.category].completed++
    }
    return acc
  }, {} as Record<string, { total: number; completed: number }>)
  
  const highRiskItems = items.filter(item => item.riskLevel === 'HIGH' || item.riskLevel === 'CRITICAL')
  const overdueItems = items.filter(item => 
    item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'COMPLETED'
  )
  
  return {
    opportunityId,
    overall: {
      total,
      completed,
      inProgress,
      pending,
      blocked,
      progressPercentage
    },
    categoryProgress,
    risks: {
      highRiskItems: highRiskItems.length,
      overdueItems: overdueItems.length,
      criticalFindings: items.filter(item => 
        item.findings && item.riskLevel === 'CRITICAL'
      ).length
    },
    timeline: {
      estimatedCompletion: calculateEstimatedCompletion(items),
      daysRemaining: calculateDaysRemaining(items)
    },
    nextActions: generateNextActions(items)
  }
}

function calculateEstimatedCompletion(items: any[]) {
  const pendingItems = items.filter(item => item.status !== 'COMPLETED')
  if (pendingItems.length === 0) return new Date()
  
  // Simple estimation: 3 days per pending item
  const daysToComplete = pendingItems.length * 3
  return new Date(Date.now() + daysToComplete * 24 * 60 * 60 * 1000)
}

function calculateDaysRemaining(items: any[]) {
  const dueDates = items
    .filter(item => item.dueDate && item.status !== 'COMPLETED')
    .map(item => new Date(item.dueDate))
  
  if (dueDates.length === 0) return null
  
  const latestDueDate = new Date(Math.max(...dueDates.map(d => d.getTime())))
  const today = new Date()
  const diffTime = latestDueDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return Math.max(0, diffDays)
}

function generateNextActions(items: any[]) {
  const actions = []
  
  const overdueItems = items.filter(item => 
    item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'COMPLETED'
  )
  
  if (overdueItems.length > 0) {
    actions.push({
      priority: 'HIGH',
      action: `Review ${overdueItems.length} overdue items`,
      items: overdueItems.map(item => item.itemName)
    })
  }
  
  const highPriorityPending = items.filter(item => 
    item.priority === 'HIGH' && item.status === 'PENDING'
  )
  
  if (highPriorityPending.length > 0) {
    actions.push({
      priority: 'MEDIUM',
      action: `Start ${highPriorityPending.length} high-priority items`,
      items: highPriorityPending.slice(0, 3).map(item => item.itemName)
    })
  }
  
  const blockedItems = items.filter(item => item.status === 'BLOCKED')
  
  if (blockedItems.length > 0) {
    actions.push({
      priority: 'MEDIUM',
      action: `Resolve ${blockedItems.length} blocked items`,
      items: blockedItems.map(item => item.itemName)
    })
  }
  
  return actions
}

async function updateDueDiligenceItem(itemId: string, updateData: any) {
  // In production, update database record
  return {
    id: itemId,
    ...updateData,
    updatedAt: new Date()
  }
}

function getMockValuations() {
  return [
    {
      id: 'val-001',
      opportunityId: 'acq-001',
      valuationMethod: 'DCF',
      valuationAmount: 8200000,
      confidenceLevel: 'HIGH',
      dcfProjectedCashFlows: [500000, 600000, 700000, 800000, 900000],
      dcfDiscountRate: 0.12,
      dcfTerminalValue: 12000000,
      dcfGrowthRate: 0.03,
      finalValuation: 8200000,
      riskAdjustment: 0,
      valuationDate: new Date('2024-03-01'),
      validUntil: new Date('2024-06-01'),
      performedBy: 'Financial Analyst',
      notes: 'Conservative assumptions due to market uncertainty',
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-03-01')
    },
    {
      id: 'val-002',
      opportunityId: 'acq-001',
      valuationMethod: 'MULTIPLES',
      valuationAmount: 8750000,
      confidenceLevel: 'MEDIUM',
      multipleType: 'REVENUE',
      multipleValue: 3.5,
      finalValuation: 8500000,
      riskAdjustment: -250000,
      valuationDate: new Date('2024-03-05'),
      validUntil: new Date('2024-06-05'),
      performedBy: 'Investment Director',
      notes: 'Based on recent comparable transactions',
      createdAt: new Date('2024-03-05'),
      updatedAt: new Date('2024-03-05')
    }
  ]
}

function getMockDueDiligenceItems() {
  return [
    {
      id: 'dd-001',
      opportunityId: 'acq-001',
      category: 'FINANCIAL',
      itemName: 'Audited Financial Statements Review',
      description: 'Review 3 years of audited financial statements',
      priority: 'HIGH',
      status: 'COMPLETED',
      assignedTo: 'John Smith',
      dueDate: new Date('2024-03-15'),
      completedDate: new Date('2024-03-12'),
      findings: 'Clean audit opinions for all periods. Minor working capital adjustments noted.',
      riskLevel: 'LOW',
      recommendations: 'Proceed with financial analysis. No material issues identified.',
      actionItems: ['Request detailed general ledger for Q1 2024'],
      documentsRequired: ['Audit reports', 'Financial statements'],
      documentsReceived: ['2023 audit report', '2022 audit report', '2021 audit report'],
      documentsReviewed: true,
      createdAt: new Date('2024-02-20'),
      updatedAt: new Date('2024-03-12')
    },
    {
      id: 'dd-002',
      opportunityId: 'acq-001',
      category: 'LEGAL',
      itemName: 'Corporate Structure Review',
      description: 'Verify legal entity structure and ownership',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      assignedTo: 'Legal Team',
      dueDate: new Date('2024-03-20'),
      completedDate: null,
      findings: 'Standard C-Corp structure. Minor subsidiary holding identified.',
      riskLevel: 'MEDIUM',
      recommendations: 'Complete subsidiary due diligence before closing',
      actionItems: ['Review subsidiary financial statements', 'Verify subsidiary compliance'],
      documentsRequired: ['Articles of incorporation', 'Bylaws', 'Stock certificates'],
      documentsReceived: ['Articles of incorporation', 'Bylaws'],
      documentsReviewed: false,
      createdAt: new Date('2024-02-25'),
      updatedAt: new Date('2024-03-10')
    },
    {
      id: 'dd-003',
      opportunityId: 'acq-001',
      category: 'OPERATIONAL',
      itemName: 'Key Management Assessment',
      description: 'Evaluate management team and key personnel',
      priority: 'HIGH',
      status: 'PENDING',
      assignedTo: 'HR Consultant',
      dueDate: new Date('2024-03-25'),
      completedDate: null,
      findings: null,
      riskLevel: 'UNKNOWN',
      recommendations: null,
      actionItems: [],
      documentsRequired: ['Management CVs', 'Employment contracts', 'Compensation details'],
      documentsReceived: [],
      documentsReviewed: false,
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-03-01')
    }
  ]
}

function calculateDueDiligenceAnalytics(items: any[]) {
  const total = items.length
  
  const statusDistribution = {
    PENDING: items.filter(item => item.status === 'PENDING').length,
    IN_PROGRESS: items.filter(item => item.status === 'IN_PROGRESS').length,
    COMPLETED: items.filter(item => item.status === 'COMPLETED').length,
    BLOCKED: items.filter(item => item.status === 'BLOCKED').length,
    NOT_APPLICABLE: items.filter(item => item.status === 'NOT_APPLICABLE').length
  }
  
  const categoryDistribution = {
    FINANCIAL: items.filter(item => item.category === 'FINANCIAL').length,
    LEGAL: items.filter(item => item.category === 'LEGAL').length,
    OPERATIONAL: items.filter(item => item.category === 'OPERATIONAL').length,
    TECHNICAL: items.filter(item => item.category === 'TECHNICAL').length,
    MARKET: items.filter(item => item.category === 'MARKET').length,
    HR: items.filter(item => item.category === 'HR').length
  }
  
  const priorityDistribution = {
    LOW: items.filter(item => item.priority === 'LOW').length,
    MEDIUM: items.filter(item => item.priority === 'MEDIUM').length,
    HIGH: items.filter(item => item.priority === 'HIGH').length,
    CRITICAL: items.filter(item => item.priority === 'CRITICAL').length
  }
  
  const riskDistribution = {
    LOW: items.filter(item => item.riskLevel === 'LOW').length,
    MEDIUM: items.filter(item => item.riskLevel === 'MEDIUM').length,
    HIGH: items.filter(item => item.riskLevel === 'HIGH').length,
    CRITICAL: items.filter(item => item.riskLevel === 'CRITICAL').length,
    UNKNOWN: items.filter(item => !item.riskLevel || item.riskLevel === 'UNKNOWN').length
  }
  
  const completionRate = total > 0 ? Math.round((statusDistribution.COMPLETED / total) * 100) : 0
  
  return {
    totalItems: total,
    completionRate,
    statusDistribution,
    categoryDistribution,
    priorityDistribution,
    riskDistribution,
    overdueItems: items.filter(item => 
      item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'COMPLETED'
    ).length,
    highRiskItems: items.filter(item => 
      item.riskLevel === 'HIGH' || item.riskLevel === 'CRITICAL'
    ).length
  }
}