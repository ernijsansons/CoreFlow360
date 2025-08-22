import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Input validation schema
const CrossSellRequestSchema = z.object({
  unifiedCustomerId: z.string().optional(),
  businessIds: z.array(z.string()).min(1),
  minOpportunityScore: z.number().min(0).max(100).default(60),
  includeProspects: z.boolean().default(true),
  timeframe: z.enum(['immediate', 'short_term', 'long_term']).default('short_term'),
  serviceCategories: z.array(z.string()).optional()
})

// Mock data structures
interface UnifiedCustomer {
  id: string
  masterEmail: string
  fullName: string
  customerType: 'INDIVIDUAL' | 'BUSINESS' | 'ENTERPRISE'
  totalLifetimeValue: number
  businessCount: number
  portfolioScore: number
  businessRelationships: BusinessRelationship[]
  recentActivities: CustomerActivity[]
  demographics: any
  psychographics: any
}

interface BusinessRelationship {
  businessId: string
  businessName: string
  relationshipStrength: number
  businessValue: number
  relationshipStatus: string
  relationshipType: string
  lastInteraction: string
  aiCrossSellReadiness: number
  serviceHistory: string[]
  satisfactionScore: number
}

interface CustomerActivity {
  businessId: string
  activityType: string
  serviceCategory: string
  revenueImpact: number
  sentimentScore: number
  activityDate: string
}

interface CrossSellOpportunity {
  id: string
  unifiedCustomerId: string
  customerName: string
  sourceBusinessId: string
  sourceBusinessName: string
  targetBusinessId: string
  targetBusinessName: string
  serviceCategory: string
  specificService: string
  aiOpportunityScore: number
  aiRevenueProjection: number
  aiTimelineProjection: number
  aiSuccessProbability: number
  triggers: string[]
  customerSignals: string[]
  competitiveFactors: string[]
  recommendedApproach: string[]
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  reasoning: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      unifiedCustomerId, 
      businessIds, 
      minOpportunityScore, 
      includeProspects, 
      timeframe,
      serviceCategories 
    } = CrossSellRequestSchema.parse(body)

    // Mock unified customers data - in production, this would come from database
    const mockCustomers: UnifiedCustomer[] = [
      {
        id: '1',
        masterEmail: 'john.smith@phoenixtech.com',
        fullName: 'John Smith',
        customerType: 'BUSINESS',
        totalLifetimeValue: 125000,
        businessCount: 2,
        portfolioScore: 92,
        businessRelationships: [
          {
            businessId: 'phoenix-hvac',
            businessName: 'Phoenix HVAC Services',
            relationshipStrength: 95,
            businessValue: 75000,
            relationshipStatus: 'ACTIVE',
            relationshipType: 'CUSTOMER',
            lastInteraction: '2024-08-20',
            aiCrossSellReadiness: 88,
            serviceHistory: ['Commercial HVAC', 'Maintenance', 'Emergency Service'],
            satisfactionScore: 94
          },
          {
            businessId: 'valley-maintenance',
            businessName: 'Valley Maintenance Co',
            relationshipStrength: 78,
            businessValue: 35000,
            relationshipStatus: 'ACTIVE',
            relationshipType: 'CUSTOMER',
            lastInteraction: '2024-08-18',
            aiCrossSellReadiness: 72,
            serviceHistory: ['General Maintenance', 'Repairs'],
            satisfactionScore: 86
          }
        ],
        recentActivities: [
          {
            businessId: 'phoenix-hvac',
            activityType: 'SERVICE_COMPLETION',
            serviceCategory: 'Commercial HVAC',
            revenueImpact: 5000,
            sentimentScore: 0.9,
            activityDate: '2024-08-20'
          },
          {
            businessId: 'valley-maintenance',
            activityType: 'QUOTE_REQUEST',
            serviceCategory: 'Facility Maintenance',
            revenueImpact: 0,
            sentimentScore: 0.7,
            activityDate: '2024-08-18'
          }
        ],
        demographics: {
          company_size: 'medium',
          industry: 'technology',
          budget_range: 'high',
          decision_maker: true
        },
        psychographics: {
          values_quality: true,
          price_sensitive: false,
          prefers_bundled_services: true,
          loyalty_score: 92
        }
      },
      {
        id: '2',
        masterEmail: 'sarah.johnson@retailcorp.com',
        fullName: 'Sarah Johnson',
        customerType: 'ENTERPRISE',
        totalLifetimeValue: 350000,
        businessCount: 2,
        portfolioScore: 96,
        businessRelationships: [
          {
            businessId: 'phoenix-hvac',
            businessName: 'Phoenix HVAC Services',
            relationshipStrength: 98,
            businessValue: 280000,
            relationshipStatus: 'ACTIVE',
            relationshipType: 'CUSTOMER',
            lastInteraction: '2024-08-21',
            aiCrossSellReadiness: 65,
            serviceHistory: ['Enterprise HVAC', 'Multi-Location Service', 'Contract Maintenance'],
            satisfactionScore: 97
          },
          {
            businessId: 'desert-air',
            businessName: 'Desert Air Solutions',
            relationshipStrength: 82,
            businessValue: 70000,
            relationshipStatus: 'ACTIVE',
            relationshipType: 'CUSTOMER',
            lastInteraction: '2024-08-19',
            aiCrossSellReadiness: 58,
            serviceHistory: ['Residential HVAC', 'Installation'],
            satisfactionScore: 89
          }
        ],
        recentActivities: [
          {
            businessId: 'phoenix-hvac',
            activityType: 'CONTRACT_RENEWAL',
            serviceCategory: 'Enterprise HVAC',
            revenueImpact: 120000,
            sentimentScore: 0.95,
            activityDate: '2024-08-21'
          }
        ],
        demographics: {
          company_size: 'large',
          industry: 'retail',
          budget_range: 'very_high',
          decision_maker: true,
          locations: 15
        },
        psychographics: {
          values_efficiency: true,
          cost_optimization_focus: true,
          prefers_comprehensive_solutions: true,
          loyalty_score: 88
        }
      }
    ]

    // Generate cross-sell opportunities
    const opportunities: CrossSellOpportunity[] = []

    // Filter customers based on request
    const targetCustomers = unifiedCustomerId 
      ? mockCustomers.filter(c => c.id === unifiedCustomerId)
      : mockCustomers

    targetCustomers.forEach(customer => {
      // Find businesses the customer is NOT currently engaged with
      const currentBusinessIds = customer.businessRelationships.map(r => r.businessId)
      const potentialTargetBusinesses = businessIds.filter(id => !currentBusinessIds.includes(id))

      potentialTargetBusinesses.forEach(targetBusinessId => {
        const targetBusinessName = getBusinessName(targetBusinessId)
        
        // Generate opportunities for each potential target business
        const businessOpportunities = generateOpportunitiesForBusiness(
          customer, 
          targetBusinessId, 
          targetBusinessName,
          minOpportunityScore,
          timeframe,
          serviceCategories
        )
        
        opportunities.push(...businessOpportunities)
      })

      // Also check for expansion opportunities within existing businesses
      customer.businessRelationships.forEach(relationship => {
        if (businessIds.includes(relationship.businessId)) {
          const expansionOpportunities = generateExpansionOpportunities(
            customer,
            relationship,
            minOpportunityScore,
            timeframe,
            serviceCategories
          )
          opportunities.push(...expansionOpportunities)
        }
      })
    })

    // Sort opportunities by score and filter by minimum threshold
    const filteredOpportunities = opportunities
      .filter(opp => opp.aiOpportunityScore >= minOpportunityScore)
      .sort((a, b) => b.aiOpportunityScore - a.aiOpportunityScore)

    // Calculate summary metrics
    const totalProjectedRevenue = filteredOpportunities.reduce((sum, opp) => sum + opp.aiRevenueProjection, 0)
    const averageScore = filteredOpportunities.length > 0 
      ? filteredOpportunities.reduce((sum, opp) => sum + opp.aiOpportunityScore, 0) / filteredOpportunities.length
      : 0

    const priorityDistribution = {
      URGENT: filteredOpportunities.filter(opp => opp.priority === 'URGENT').length,
      HIGH: filteredOpportunities.filter(opp => opp.priority === 'HIGH').length,
      MEDIUM: filteredOpportunities.filter(opp => opp.priority === 'MEDIUM').length,
      LOW: filteredOpportunities.filter(opp => opp.priority === 'LOW').length
    }

    const response = {
      success: true,
      summary: {
        totalOpportunities: filteredOpportunities.length,
        totalProjectedRevenue,
        averageOpportunityScore: Math.round(averageScore),
        timeframe,
        priorityDistribution,
        averageTimelineProjection: filteredOpportunities.length > 0 
          ? Math.round(filteredOpportunities.reduce((sum, opp) => sum + opp.aiTimelineProjection, 0) / filteredOpportunities.length)
          : 0
      },
      opportunities: filteredOpportunities.slice(0, 50), // Return top 50 opportunities
      recommendations: generateRecommendations(filteredOpportunities),
      nextActions: generateNextActions(filteredOpportunities)
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error in cross-sell opportunities API:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid input parameters',
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

// Helper functions
function getBusinessName(businessId: string): string {
  const businessNames = {
    'phoenix-hvac': 'Phoenix HVAC Services',
    'desert-air': 'Desert Air Solutions',
    'valley-maintenance': 'Valley Maintenance Co'
  }
  return businessNames[businessId as keyof typeof businessNames] || 'Unknown Business'
}

function generateOpportunitiesForBusiness(
  customer: UnifiedCustomer,
  targetBusinessId: string,
  targetBusinessName: string,
  minScore: number,
  timeframe: string,
  serviceCategories?: string[]
): CrossSellOpportunity[] {
  const opportunities: CrossSellOpportunity[] = []
  
  // Get primary business relationship for context
  const primaryRelationship = customer.businessRelationships.find(r => r.relationshipStrength > 80)
  if (!primaryRelationship) return []

  // Define service offerings by business
  const businessServices = {
    'phoenix-hvac': [
      { category: 'Commercial HVAC', services: ['System Installation', 'Maintenance Contracts', 'Emergency Service'] },
      { category: 'Energy Efficiency', services: ['Energy Audits', 'System Upgrades', 'Smart Controls'] }
    ],
    'desert-air': [
      { category: 'Residential HVAC', services: ['Home Installation', 'Repair Service', 'Seasonal Maintenance'] },
      { category: 'Indoor Air Quality', services: ['Air Purification', 'Duct Cleaning', 'Humidity Control'] }
    ],
    'valley-maintenance': [
      { category: 'Facility Maintenance', services: ['General Maintenance', 'Preventive Care', 'Multi-Location Service'] },
      { category: 'Equipment Services', services: ['Equipment Repair', 'Replacement Planning', 'Warranty Service'] }
    ]
  }

  const serviceOfferings = businessServices[targetBusinessId as keyof typeof businessServices] || []
  
  serviceOfferings.forEach(categoryGroup => {
    if (serviceCategories && !serviceCategories.includes(categoryGroup.category)) return

    categoryGroup.services.forEach(service => {
      const opportunity = calculateOpportunity(
        customer,
        primaryRelationship,
        targetBusinessId,
        targetBusinessName,
        categoryGroup.category,
        service,
        timeframe
      )

      if (opportunity.aiOpportunityScore >= minScore) {
        opportunities.push(opportunity)
      }
    })
  })

  return opportunities
}

function generateExpansionOpportunities(
  customer: UnifiedCustomer,
  relationship: BusinessRelationship,
  minScore: number,
  timeframe: string,
  serviceCategories?: string[]
): CrossSellOpportunity[] {
  const opportunities: CrossSellOpportunity[] = []

  // Look for service expansion within existing business
  const expansionServices = {
    'phoenix-hvac': ['Smart Building Integration', 'Preventive Maintenance Plus', 'Energy Management'],
    'desert-air': ['Whole Home Solutions', 'Smart Home Integration', 'Air Quality Monitoring'],
    'valley-maintenance': ['Comprehensive Facility Management', '24/7 Monitoring', 'Predictive Maintenance']
  }

  const availableExpansions = expansionServices[relationship.businessId as keyof typeof expansionServices] || []

  availableExpansions.forEach(service => {
    if (!relationship.serviceHistory.includes(service)) {
      const opportunity: CrossSellOpportunity = {
        id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        unifiedCustomerId: customer.id,
        customerName: customer.fullName,
        sourceBusinessId: relationship.businessId,
        sourceBusinessName: relationship.businessName,
        targetBusinessId: relationship.businessId,
        targetBusinessName: relationship.businessName,
        serviceCategory: 'Service Expansion',
        specificService: service,
        aiOpportunityScore: Math.min(95, relationship.aiCrossSellReadiness + 15),
        aiRevenueProjection: relationship.businessValue * 0.3,
        aiTimelineProjection: timeframe === 'immediate' ? 30 : timeframe === 'short_term' ? 60 : 120,
        aiSuccessProbability: 0.75,
        triggers: ['Existing relationship', 'High satisfaction', 'Service expansion natural fit'],
        customerSignals: ['Active customer', 'Growing business needs'],
        competitiveFactors: ['Incumbent advantage', 'Established trust'],
        recommendedApproach: ['Leverage existing relationship', 'Present as natural upgrade'],
        priority: relationship.aiCrossSellReadiness > 85 ? 'HIGH' : 'MEDIUM',
        reasoning: `Strong existing relationship (${relationship.relationshipStrength}% strength) with high cross-sell readiness provides excellent expansion opportunity`
      }

      if (opportunity.aiOpportunityScore >= minScore) {
        opportunities.push(opportunity)
      }
    }
  })

  return opportunities
}

function calculateOpportunity(
  customer: UnifiedCustomer,
  sourceRelationship: BusinessRelationship,
  targetBusinessId: string,
  targetBusinessName: string,
  serviceCategory: string,
  specificService: string,
  timeframe: string
): CrossSellOpportunity {
  // Base opportunity score calculation
  let opportunityScore = 50 // Base score

  // Factor in source relationship strength
  opportunityScore += (sourceRelationship.relationshipStrength - 50) * 0.6

  // Factor in customer value and type
  if (customer.customerType === 'ENTERPRISE') opportunityScore += 15
  else if (customer.customerType === 'BUSINESS') opportunityScore += 10

  // Factor in customer satisfaction
  opportunityScore += (sourceRelationship.satisfactionScore - 50) * 0.4

  // Factor in cross-sell readiness
  opportunityScore += (sourceRelationship.aiCrossSellReadiness - 50) * 0.5

  // Factor in recent activity sentiment
  const recentPositiveActivities = customer.recentActivities.filter(
    a => a.sentimentScore > 0.7 && new Date(a.activityDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  )
  opportunityScore += recentPositiveActivities.length * 5

  // Service category specific adjustments
  const categoryMultipliers = {
    'Commercial HVAC': 1.2,
    'Residential HVAC': 1.0,
    'Facility Maintenance': 1.1,
    'Energy Efficiency': 1.15,
    'Indoor Air Quality': 1.05
  }
  opportunityScore *= categoryMultipliers[serviceCategory as keyof typeof categoryMultipliers] || 1.0

  // Cap the score at 95
  opportunityScore = Math.min(95, Math.max(20, opportunityScore))

  // Revenue projection based on customer value and service type
  const baseRevenue = sourceRelationship.businessValue * 0.4
  const serviceMultipliers = {
    'Commercial HVAC': 1.5,
    'Residential HVAC': 0.8,
    'Facility Maintenance': 1.2,
    'Energy Efficiency': 1.3
  }
  const revenueProjection = baseRevenue * (serviceMultipliers[serviceCategory as keyof typeof serviceMultipliers] || 1.0)

  // Timeline projection
  const timelineProjection = timeframe === 'immediate' ? 
    Math.max(14, 90 - opportunityScore) :
    timeframe === 'short_term' ?
    Math.max(30, 120 - opportunityScore) :
    Math.max(60, 180 - opportunityScore)

  // Generate contextual triggers and signals
  const triggers = generateTriggers(customer, sourceRelationship, serviceCategory)
  const customerSignals = generateCustomerSignals(customer, sourceRelationship)
  const competitiveFactors = generateCompetitiveFactors(customer, targetBusinessId)
  const recommendedApproach = generateRecommendedApproach(customer, sourceRelationship, serviceCategory)

  // Determine priority
  let priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'MEDIUM'
  if (opportunityScore >= 90) priority = 'URGENT'
  else if (opportunityScore >= 80) priority = 'HIGH'
  else if (opportunityScore >= 60) priority = 'MEDIUM'
  else priority = 'LOW'

  return {
    id: `opp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    unifiedCustomerId: customer.id,
    customerName: customer.fullName,
    sourceBusinessId: sourceRelationship.businessId,
    sourceBusinessName: sourceRelationship.businessName,
    targetBusinessId,
    targetBusinessName,
    serviceCategory,
    specificService,
    aiOpportunityScore: Math.round(opportunityScore),
    aiRevenueProjection: Math.round(revenueProjection),
    aiTimelineProjection: timelineProjection,
    aiSuccessProbability: Math.min(0.95, opportunityScore / 100),
    triggers,
    customerSignals,
    competitiveFactors,
    recommendedApproach,
    priority,
    reasoning: `Strong ${sourceRelationship.relationshipStrength}% relationship in ${sourceRelationship.businessName} with ${customer.customerType} customer shows high potential for ${serviceCategory} services`
  }
}

function generateTriggers(customer: UnifiedCustomer, relationship: BusinessRelationship, serviceCategory: string): string[] {
  const triggers = []
  
  if (relationship.satisfactionScore > 90) triggers.push('High customer satisfaction')
  if (customer.totalLifetimeValue > 100000) triggers.push('High-value customer')
  if (customer.customerType === 'ENTERPRISE') triggers.push('Enterprise-scale needs')
  
  // Service-specific triggers
  if (serviceCategory === 'Commercial HVAC') {
    triggers.push('Existing commercial relationship', 'Facility expansion potential')
  } else if (serviceCategory === 'Residential HVAC') {
    triggers.push('Employee benefits program opportunity', 'Executive home services')
  } else if (serviceCategory === 'Facility Maintenance') {
    triggers.push('Multi-location needs', 'Operational efficiency focus')
  }

  return triggers
}

function generateCustomerSignals(customer: UnifiedCustomer, relationship: BusinessRelationship): string[] {
  const signals = []
  
  if (relationship.aiCrossSellReadiness > 80) signals.push('High cross-sell readiness')
  if (customer.recentActivities.some(a => a.sentimentScore > 0.8)) signals.push('Recent positive interactions')
  if (customer.portfolioScore > 90) signals.push('High portfolio engagement')
  
  return signals
}

function generateCompetitiveFactors(customer: UnifiedCustomer, targetBusinessId: string): string[] {
  return [
    'Portfolio relationship advantage',
    'Established trust within business family',
    'Integrated service delivery capability'
  ]
}

function generateRecommendedApproach(customer: UnifiedCustomer, relationship: BusinessRelationship, serviceCategory: string): string[] {
  const approaches = []
  
  if (relationship.relationshipStrength > 90) {
    approaches.push('Leverage existing relationship strength')
  }
  
  approaches.push('Present as portfolio expansion opportunity')
  approaches.push('Emphasize integrated service benefits')
  
  if (customer.customerType === 'ENTERPRISE') {
    approaches.push('Focus on scalability and standardization')
  }
  
  return approaches
}

function generateRecommendations(opportunities: CrossSellOpportunity[]): string[] {
  const recommendations = []
  
  if (opportunities.length === 0) {
    return ['No immediate cross-sell opportunities identified with current criteria']
  }
  
  const highPriorityCount = opportunities.filter(opp => opp.priority === 'HIGH' || opp.priority === 'URGENT').length
  if (highPriorityCount > 0) {
    recommendations.push(`Focus on ${highPriorityCount} high-priority opportunities for immediate action`)
  }
  
  const avgRevenue = opportunities.reduce((sum, opp) => sum + opp.aiRevenueProjection, 0) / opportunities.length
  if (avgRevenue > 25000) {
    recommendations.push('High-value opportunities present - consider dedicated account management')
  }
  
  recommendations.push('Leverage existing relationships for warm introductions')
  recommendations.push('Create integrated service proposals to maximize portfolio value')
  
  return recommendations
}

function generateNextActions(opportunities: CrossSellOpportunity[]): string[] {
  const actions = []
  
  const urgentOpps = opportunities.filter(opp => opp.priority === 'URGENT')
  if (urgentOpps.length > 0) {
    actions.push(`Contact ${urgentOpps.length} urgent opportunities within 24 hours`)
  }
  
  const highOpps = opportunities.filter(opp => opp.priority === 'HIGH')
  if (highOpps.length > 0) {
    actions.push(`Schedule discovery calls for ${highOpps.length} high-priority opportunities`)
  }
  
  actions.push('Prepare integrated service presentations')
  actions.push('Coordinate with existing account teams for warm handoffs')
  
  return actions
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Cross-business cross-sell opportunities API',
    version: '1.0.0',
    endpoints: {
      'POST /': 'Identify cross-sell opportunities across businesses'
    },
    parameters: {
      unifiedCustomerId: 'Specific customer to analyze (optional)',
      businessIds: 'Array of business IDs to consider for opportunities',
      minOpportunityScore: 'Minimum AI opportunity score (0-100)',
      includeProspects: 'Include prospect-level opportunities',
      timeframe: 'Timeline focus (immediate, short_term, long_term)',
      serviceCategories: 'Filter by specific service categories'
    }
  })
}