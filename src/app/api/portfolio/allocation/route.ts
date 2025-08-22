import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const ResourceAllocationRequestSchema = z.object({
  portfolioId: z.string(),
  resourceType: z.enum(['EMPLOYEE', 'BUDGET', 'EQUIPMENT', 'TECHNOLOGY', 'INVENTORY']),
  resourceName: z.string(),
  resourceId: z.string().optional(),
  sourceBusinessId: z.string().optional(),
  targetBusinessId: z.string().optional(),
  allocationAmount: z.number().min(0),
  allocationUnit: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  isRecurring: z.boolean().optional().default(false),
  recurringPattern: z.string().optional(),
  allocationType: z.enum(['MANUAL', 'AUTO_DEMAND', 'AUTO_EFFICIENCY', 'AI_OPTIMIZED']).optional().default('MANUAL'),
  allocationReason: z.string().optional(),
  expectedBenefit: z.string().optional(),
  estimatedValue: z.number().optional().default(0)
})

const ResourceAllocationQuerySchema = z.object({
  portfolioId: z.string(),
  resourceType: z.enum(['EMPLOYEE', 'BUDGET', 'EQUIPMENT', 'TECHNOLOGY', 'INVENTORY']).optional(),
  status: z.enum(['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
  allocationType: z.enum(['MANUAL', 'AUTO_DEMAND', 'AUTO_EFFICIENCY', 'AI_OPTIMIZED']).optional(),
  sourceBusinessId: z.string().optional(),
  targetBusinessId: z.string().optional(),
  aiRecommended: z.boolean().optional(),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0)
})

const OptimizationRequestSchema = z.object({
  portfolioId: z.string(),
  optimizationType: z.enum(['REALLOCATION', 'CONSOLIDATION', 'EXPANSION', 'EFFICIENCY']).optional(),
  resourceTypes: z.array(z.string()).optional(),
  targetMetrics: z.array(z.string()).optional(),
  constraints: z.object({
    maxBudget: z.number().optional(),
    maxTimeframe: z.number().optional(),
    riskTolerance: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional()
  }).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const action = body.action

    if (action === 'create_allocation') {
      const validatedData = ResourceAllocationRequestSchema.parse(body.data)
      const allocation = await createResourceAllocation(validatedData)
      
      return NextResponse.json({
        success: true,
        data: allocation,
        message: 'Resource allocation created successfully'
      })
      
    } else if (action === 'optimize_resources') {
      const validatedData = OptimizationRequestSchema.parse(body.data)
      const optimizations = await generateResourceOptimizations(validatedData)
      
      return NextResponse.json({
        success: true,
        data: optimizations,
        message: 'Resource optimizations generated successfully'
      })
      
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action specified' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Resource allocation API error:', error)
    
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
        error: 'Failed to process resource allocation request' 
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
      resourceType: searchParams.get('resourceType') || undefined,
      status: searchParams.get('status') || undefined,
      allocationType: searchParams.get('allocationType') || undefined,
      sourceBusinessId: searchParams.get('sourceBusinessId') || undefined,
      targetBusinessId: searchParams.get('targetBusinessId') || undefined,
      aiRecommended: searchParams.get('aiRecommended') ? searchParams.get('aiRecommended') === 'true' : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0
    }

    if (!queryParams.portfolioId) {
      return NextResponse.json(
        { success: false, error: 'Portfolio ID is required' },
        { status: 400 }
      )
    }

    const validatedQuery = ResourceAllocationQuerySchema.parse(queryParams)

    // Mock allocation data - in production, fetch from database
    const mockAllocations = getMockResourceAllocations()
    
    // Apply filters
    let filteredAllocations = mockAllocations
    
    if (validatedQuery.resourceType) {
      filteredAllocations = filteredAllocations.filter(alloc => alloc.resourceType === validatedQuery.resourceType)
    }
    
    if (validatedQuery.status) {
      filteredAllocations = filteredAllocations.filter(alloc => alloc.status === validatedQuery.status)
    }
    
    if (validatedQuery.allocationType) {
      filteredAllocations = filteredAllocations.filter(alloc => alloc.allocationType === validatedQuery.allocationType)
    }
    
    if (validatedQuery.sourceBusinessId) {
      filteredAllocations = filteredAllocations.filter(alloc => alloc.sourceBusinessId === validatedQuery.sourceBusinessId)
    }
    
    if (validatedQuery.targetBusinessId) {
      filteredAllocations = filteredAllocations.filter(alloc => alloc.targetBusinessId === validatedQuery.targetBusinessId)
    }
    
    if (validatedQuery.aiRecommended !== undefined) {
      filteredAllocations = filteredAllocations.filter(alloc => alloc.aiRecommended === validatedQuery.aiRecommended)
    }

    // Apply pagination
    const total = filteredAllocations.length
    const paginatedAllocations = filteredAllocations.slice(
      validatedQuery.offset, 
      validatedQuery.offset + validatedQuery.limit
    )

    // Calculate analytics
    const analytics = calculateAllocationAnalytics(filteredAllocations)

    return NextResponse.json({
      success: true,
      data: {
        allocations: paginatedAllocations,
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
    console.error('Get resource allocations error:', error)
    
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
        error: 'Failed to fetch resource allocations' 
      },
      { status: 500 }
    )
  }
}

async function createResourceAllocation(data: z.infer<typeof ResourceAllocationRequestSchema>) {
  // In production, save to database and trigger allocation workflow
  
  const allocationId = `alloc-${Date.now()}`
  
  // Calculate optimization score based on AI analysis
  const optimizationScore = calculateOptimizationScore(data)
  
  // Generate alternative options
  const alternativeOptions = generateAlternativeOptions(data)
  
  const allocation = {
    id: allocationId,
    portfolioId: data.portfolioId,
    resourceType: data.resourceType,
    resourceName: data.resourceName,
    resourceId: data.resourceId,
    sourceBusinessId: data.sourceBusinessId,
    targetBusinessId: data.targetBusinessId,
    allocationAmount: data.allocationAmount,
    allocationUnit: data.allocationUnit,
    startDate: new Date(data.startDate),
    endDate: data.endDate ? new Date(data.endDate) : null,
    isRecurring: data.isRecurring,
    recurringPattern: data.recurringPattern,
    allocationType: data.allocationType,
    allocationReason: data.allocationReason,
    expectedBenefit: data.expectedBenefit,
    estimatedValue: data.estimatedValue,
    status: 'PLANNED',
    utilizationRate: 0,
    actualValue: 0,
    aiRecommended: data.allocationType === 'AI_OPTIMIZED',
    optimizationScore,
    alternativeOptions,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  // Trigger allocation workflow
  await initiateAllocationWorkflow(allocation)
  
  return allocation
}

function calculateOptimizationScore(data: z.infer<typeof ResourceAllocationRequestSchema>): number {
  let score = 50 // Base score
  
  // Resource type multipliers
  const resourceMultipliers = {
    'EMPLOYEE': 1.2,
    'BUDGET': 1.0,
    'EQUIPMENT': 1.1,
    'TECHNOLOGY': 1.3,
    'INVENTORY': 0.9
  }
  
  score *= resourceMultipliers[data.resourceType] || 1.0
  
  // Allocation type bonuses
  if (data.allocationType === 'AI_OPTIMIZED') score += 20
  if (data.allocationType === 'AUTO_EFFICIENCY') score += 15
  if (data.allocationType === 'AUTO_DEMAND') score += 10
  
  // Cross-business allocation bonus
  if (data.sourceBusinessId && data.targetBusinessId && data.sourceBusinessId !== data.targetBusinessId) {
    score += 15
  }
  
  // Expected value consideration
  if (data.estimatedValue && data.estimatedValue > 50000) {
    score += Math.min(20, data.estimatedValue / 10000)
  }
  
  return Math.min(100, Math.max(0, Math.round(score)))
}

function generateAlternativeOptions(data: z.infer<typeof ResourceAllocationRequestSchema>) {
  const alternatives = []
  
  // Alternative 1: Different allocation amount
  if (data.allocationAmount > 1) {
    alternatives.push({
      type: 'ADJUSTED_AMOUNT',
      description: `Reduce allocation to ${Math.round(data.allocationAmount * 0.7)} ${data.allocationUnit}`,
      impact: 'Lower cost, potentially reduced benefit',
      estimatedValue: (data.estimatedValue || 0) * 0.8,
      optimizationScore: calculateOptimizationScore({...data, allocationAmount: data.allocationAmount * 0.7}) + 5
    })
  }
  
  // Alternative 2: Shared allocation
  if (data.targetBusinessId) {
    alternatives.push({
      type: 'SHARED_ALLOCATION',
      description: 'Share resource across multiple businesses',
      impact: 'Maximized utilization, potential coordination overhead',
      estimatedValue: (data.estimatedValue || 0) * 1.3,
      optimizationScore: calculateOptimizationScore(data) + 10
    })
  }
  
  // Alternative 3: Delayed start
  alternatives.push({
    type: 'DELAYED_START',
    description: 'Delay start by 30 days for better resource availability',
    impact: 'Optimized resource utilization, delayed benefits',
    estimatedValue: (data.estimatedValue || 0) * 1.1,
    optimizationScore: calculateOptimizationScore(data) + 8
  })
  
  return alternatives
}

async function initiateAllocationWorkflow(allocation: any) {
  // In production, this would trigger workflow automation
  console.log(`Initiated allocation workflow for ${allocation.id}`)
  
  // Example workflow steps:
  // 1. Validate resource availability
  // 2. Check business capacity and constraints
  // 3. Notify stakeholders
  // 4. Schedule allocation
  // 5. Monitor utilization
  
  return {
    workflowId: `workflow-${allocation.id}`,
    steps: [
      { step: 'validation', status: 'pending' },
      { step: 'approval', status: 'pending' },
      { step: 'scheduling', status: 'pending' },
      { step: 'execution', status: 'pending' },
      { step: 'monitoring', status: 'pending' }
    ]
  }
}

async function generateResourceOptimizations(data: z.infer<typeof OptimizationRequestSchema>) {
  // Mock optimization analysis - in production, run AI optimization algorithms
  
  const optimizations = []
  
  // Consolidation opportunities
  optimizations.push({
    id: `opt-consolidation-${Date.now()}`,
    optimizationType: 'CONSOLIDATION',
    title: 'Consolidate IT Support Across Businesses',
    description: 'Merge IT support teams from 3 businesses into a centralized unit. Analysis shows 40% efficiency gain and $240K annual savings.',
    affectedResources: ['IT Support Staff', 'Help Desk Systems', 'Ticketing Tools'],
    estimatedSavings: 240000,
    implementationCost: 45000,
    netBenefit: 195000,
    confidence: 89,
    priority: 'HIGH',
    timeToImplement: 45,
    riskLevel: 'MEDIUM',
    businessImpact: ['business-001', 'business-002', 'business-003'],
    aiRecommendations: {
      implementation: [
        'Phase 1: Standardize IT processes across businesses',
        'Phase 2: Migrate to unified ticketing system',
        'Phase 3: Centralize team and establish shared procedures'
      ],
      timeline: '6-8 weeks',
      resources: ['Project manager', 'IT integration specialist', 'Change management support']
    },
    successMetrics: [
      { metric: 'Response time improvement', target: '40%', measurement: 'Average ticket resolution time' },
      { metric: 'Cost reduction', target: '$240K annually', measurement: 'IT operational costs' },
      { metric: 'Employee satisfaction', target: '15% increase', measurement: 'IT service satisfaction surveys' }
    ]
  })
  
  // Reallocation opportunities
  optimizations.push({
    id: `opt-reallocation-${Date.now()}`,
    optimizationType: 'REALLOCATION',
    title: 'Cross-Train Sales Teams for Multi-Business Coverage',
    description: 'Enable sales representatives to sell across all business lines. Projected 35% increase in cross-selling opportunities.',
    affectedResources: ['Sales Representatives', 'CRM Systems', 'Training Programs'],
    estimatedSavings: 380000,
    implementationCost: 85000,
    netBenefit: 295000,
    confidence: 76,
    priority: 'HIGH',
    timeToImplement: 60,
    riskLevel: 'LOW',
    businessImpact: ['business-001', 'business-002', 'business-003', 'business-004'],
    aiRecommendations: {
      implementation: [
        'Phase 1: Develop cross-business product training modules',
        'Phase 2: Implement unified CRM with multi-business views',
        'Phase 3: Launch pilot program with select sales reps',
        'Phase 4: Full rollout with incentive alignment'
      ],
      timeline: '8-12 weeks',
      resources: ['Sales training coordinator', 'CRM administrator', 'Product specialists']
    },
    successMetrics: [
      { metric: 'Cross-selling increase', target: '35%', measurement: 'Multi-business sales transactions' },
      { metric: 'Revenue per rep', target: '25% increase', measurement: 'Individual sales performance' },
      { metric: 'Customer satisfaction', target: '10% improvement', measurement: 'Post-sale customer surveys' }
    ]
  })
  
  // Efficiency optimizations
  optimizations.push({
    id: `opt-efficiency-${Date.now()}`,
    optimizationType: 'EFFICIENCY',
    title: 'Shared Inventory Management System',
    description: 'Implement unified inventory management for common materials across construction and HVAC businesses.',
    affectedResources: ['Inventory Stock', 'Warehouse Space', 'Logistics Staff'],
    estimatedSavings: 120000,
    implementationCost: 35000,
    netBenefit: 85000,
    confidence: 82,
    priority: 'MEDIUM',
    timeToImplement: 30,
    riskLevel: 'LOW',
    businessImpact: ['business-003', 'business-004'],
    aiRecommendations: {
      implementation: [
        'Phase 1: Analyze common inventory items across businesses',
        'Phase 2: Implement shared inventory tracking system',
        'Phase 3: Optimize stock levels and reorder points',
        'Phase 4: Establish shared supplier relationships'
      ],
      timeline: '4-6 weeks',
      resources: ['Inventory specialist', 'System administrator', 'Procurement coordinator']
    },
    successMetrics: [
      { metric: 'Inventory carrying cost reduction', target: '28%', measurement: 'Total inventory investment' },
      { metric: 'Stock-out reduction', target: '50%', measurement: 'Frequency of material shortages' },
      { metric: 'Procurement efficiency', target: '20% improvement', measurement: 'Order processing time' }
    ]
  })
  
  // Calculate optimization summary
  const summary = {
    totalOptimizations: optimizations.length,
    totalEstimatedSavings: optimizations.reduce((sum, opt) => sum + opt.estimatedSavings, 0),
    totalImplementationCost: optimizations.reduce((sum, opt) => sum + opt.implementationCost, 0),
    totalNetBenefit: optimizations.reduce((sum, opt) => sum + opt.netBenefit, 0),
    averageConfidence: Math.round(optimizations.reduce((sum, opt) => sum + opt.confidence, 0) / optimizations.length),
    priorityDistribution: {
      HIGH: optimizations.filter(opt => opt.priority === 'HIGH').length,
      MEDIUM: optimizations.filter(opt => opt.priority === 'MEDIUM').length,
      LOW: optimizations.filter(opt => opt.priority === 'LOW').length
    },
    averageImplementationTime: Math.round(optimizations.reduce((sum, opt) => sum + opt.timeToImplement, 0) / optimizations.length)
  }
  
  return {
    portfolioId: data.portfolioId,
    analysisTimestamp: new Date().toISOString(),
    optimizationType: data.optimizationType || 'ALL',
    constraints: data.constraints || {},
    optimizations,
    summary,
    recommendations: generateOptimizationRecommendations(optimizations, summary)
  }
}

function generateOptimizationRecommendations(optimizations: any[], summary: any) {
  const recommendations = []
  
  // High-value recommendations
  const highValueOpts = optimizations.filter(opt => opt.netBenefit > 150000)
  if (highValueOpts.length > 0) {
    recommendations.push({
      type: 'HIGH_PRIORITY',
      title: 'Prioritize High-Value Optimizations',
      description: `${highValueOpts.length} optimizations with net benefit over $150K should be fast-tracked for implementation.`,
      actions: highValueOpts.map(opt => opt.title),
      expectedImpact: highValueOpts.reduce((sum, opt) => sum + opt.netBenefit, 0),
      timeline: 'Next 90 days'
    })
  }
  
  // Quick wins
  const quickWins = optimizations.filter(opt => opt.timeToImplement <= 45 && opt.riskLevel === 'LOW')
  if (quickWins.length > 0) {
    recommendations.push({
      type: 'QUICK_WINS',
      title: 'Implement Quick Win Optimizations',
      description: `${quickWins.length} low-risk optimizations can be implemented within 45 days for immediate impact.`,
      actions: quickWins.map(opt => opt.title),
      expectedImpact: quickWins.reduce((sum, opt) => sum + opt.netBenefit, 0),
      timeline: 'Next 45 days'
    })
  }
  
  // Consolidation focus
  const consolidationOpts = optimizations.filter(opt => opt.optimizationType === 'CONSOLIDATION')
  if (consolidationOpts.length > 0) {
    recommendations.push({
      type: 'CONSOLIDATION_STRATEGY',
      title: 'Develop Systematic Consolidation Approach',
      description: 'Multiple consolidation opportunities suggest potential for centralized services strategy.',
      actions: ['Create centralized services roadmap', 'Establish governance structure', 'Plan phased implementation'],
      expectedImpact: consolidationOpts.reduce((sum, opt) => sum + opt.netBenefit, 0),
      timeline: 'Next 6 months'
    })
  }
  
  return recommendations
}

function getMockResourceAllocations() {
  return [
    {
      id: 'alloc-001',
      portfolioId: 'demo-portfolio',
      resourceType: 'EMPLOYEE',
      resourceName: 'Senior Full-Stack Developer',
      resourceId: 'emp-001',
      sourceBusinessId: 'business-001',
      targetBusinessId: 'business-003',
      allocationAmount: 20,
      allocationUnit: 'hours/week',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-06-30'),
      isRecurring: false,
      allocationType: 'AI_OPTIMIZED',
      allocationReason: 'HVAC business needs custom software development for field service optimization',
      expectedBenefit: 'Reduce service time by 25%, increase customer satisfaction',
      estimatedValue: 180000,
      status: 'ACTIVE',
      utilizationRate: 92,
      actualValue: 165000,
      aiRecommended: true,
      optimizationScore: 87,
      alternativeOptions: [],
      createdAt: new Date('2024-03-25'),
      updatedAt: new Date('2024-03-25')
    },
    {
      id: 'alloc-002',
      portfolioId: 'demo-portfolio',
      resourceType: 'BUDGET',
      resourceName: 'Cross-Business Marketing Campaign',
      sourceBusinessId: 'portfolio',
      targetBusinessId: 'all',
      allocationAmount: 150000,
      allocationUnit: 'USD',
      startDate: new Date('2024-03-15'),
      endDate: new Date('2024-09-15'),
      isRecurring: false,
      allocationType: 'MANUAL',
      allocationReason: 'Unified marketing campaign to leverage brand synergies across all businesses',
      expectedBenefit: 'Increase brand awareness and cross-business customer acquisition',
      estimatedValue: 450000,
      status: 'ACTIVE',
      utilizationRate: 78,
      actualValue: 380000,
      aiRecommended: false,
      optimizationScore: 72,
      alternativeOptions: [],
      createdAt: new Date('2024-03-10'),
      updatedAt: new Date('2024-03-15')
    }
  ]
}

function calculateAllocationAnalytics(allocations: any[]) {
  const total = allocations.length
  
  const typeDistribution = {
    EMPLOYEE: allocations.filter(a => a.resourceType === 'EMPLOYEE').length,
    BUDGET: allocations.filter(a => a.resourceType === 'BUDGET').length,
    EQUIPMENT: allocations.filter(a => a.resourceType === 'EQUIPMENT').length,
    TECHNOLOGY: allocations.filter(a => a.resourceType === 'TECHNOLOGY').length,
    INVENTORY: allocations.filter(a => a.resourceType === 'INVENTORY').length
  }
  
  const statusDistribution = {
    PLANNED: allocations.filter(a => a.status === 'PLANNED').length,
    ACTIVE: allocations.filter(a => a.status === 'ACTIVE').length,
    COMPLETED: allocations.filter(a => a.status === 'COMPLETED').length,
    CANCELLED: allocations.filter(a => a.status === 'CANCELLED').length
  }
  
  const allocationTypeDistribution = {
    MANUAL: allocations.filter(a => a.allocationType === 'MANUAL').length,
    AUTO_DEMAND: allocations.filter(a => a.allocationType === 'AUTO_DEMAND').length,
    AUTO_EFFICIENCY: allocations.filter(a => a.allocationType === 'AUTO_EFFICIENCY').length,
    AI_OPTIMIZED: allocations.filter(a => a.allocationType === 'AI_OPTIMIZED').length
  }

  const avgUtilization = total > 0 ? 
    allocations.reduce((sum, a) => sum + (a.utilizationRate || 0), 0) / total : 0
    
  const totalEstimatedValue = allocations.reduce((sum, a) => sum + (a.estimatedValue || 0), 0)
  const totalActualValue = allocations.reduce((sum, a) => sum + (a.actualValue || 0), 0)
  
  const avgOptimizationScore = total > 0 ? 
    allocations.reduce((sum, a) => sum + (a.optimizationScore || 0), 0) / total : 0

  return {
    totalAllocations: total,
    typeDistribution,
    statusDistribution,
    allocationTypeDistribution,
    averageUtilization: Math.round(avgUtilization),
    totalEstimatedValue,
    totalActualValue,
    valueRealizationRate: totalEstimatedValue > 0 ? Math.round((totalActualValue / totalEstimatedValue) * 100) : 0,
    averageOptimizationScore: Math.round(avgOptimizationScore),
    aiRecommendedCount: allocations.filter(a => a.aiRecommended).length,
    crossBusinessAllocations: allocations.filter(a => 
      a.sourceBusinessId && a.targetBusinessId && a.sourceBusinessId !== a.targetBusinessId
    ).length
  }
}