import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const AnalyticsRequestSchema = z.object({
  timeframe: z.enum(['week', 'month', 'quarter', 'year']).default('month'),
  businessIds: z.array(z.string()).optional(),
  includeSegments: z.boolean().default(true),
  includePredictions: z.boolean().default(true),
  includeInsights: z.boolean().default(true)
})

interface CustomerPortfolioMetrics {
  totalCustomers: number
  multiBusinessCustomers: number
  averagePortfolioValue: number
  totalPortfolioValue: number
  crossSellConversionRate: number
  customerRetentionRate: number
  averageLifetimeValue: number
  portfolioPenetrationRate: number
  quarterlyGrowthRate: number
  averageBusinessCount: number
  trendData: {
    period: string
    value: number
    customers: number
    crossSells: number
  }[]
}

interface BusinessPerformance {
  businessId: string
  businessName: string
  customerCount: number
  averageCustomerValue: number
  retentionRate: number
  crossSellRate: number
  growthTrend: 'up' | 'down' | 'stable'
  growthPercentage: number
  portfolioContribution: number
  satisfactionScore: number
  topServiceCategories: string[]
  monthlyTrend: {
    month: string
    customers: number
    revenue: number
    crossSells: number
  }[]
}

interface CustomerSegment {
  segment: string
  count: number
  percentage: number
  averageValue: number
  crossSellPotential: number
  retentionRisk: number
  preferredServices: string[]
  growthTrend: 'up' | 'down' | 'stable'
  conversionRate: number
  satisfactionScore: number
}

interface AIInsight {
  id: string
  type: 'opportunity' | 'trend' | 'risk' | 'success'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  confidence: number
  actionRequired: boolean
  relatedBusinesses: string[]
  potentialValue: number
  timeline: string
  triggers: string[]
  recommendations: string[]
  priority: number
  createdAt: string
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const timeframe = (url.searchParams.get('timeframe') || 'month') as any
    const includeSegments = url.searchParams.get('includeSegments') !== 'false'
    const includePredictions = url.searchParams.get('includePredictions') !== 'false'
    const includeInsights = url.searchParams.get('includeInsights') !== 'false'

    // Generate comprehensive analytics based on timeframe
    const portfolioMetrics = generatePortfolioMetrics(timeframe)
    const businessPerformance = generateBusinessPerformance(timeframe)
    const customerSegments = includeSegments ? generateCustomerSegments() : []
    const aiInsights = includeInsights ? generateAIInsights() : []
    const predictions = includePredictions ? generatePredictions(timeframe) : null

    const response = {
      success: true,
      timeframe,
      generatedAt: new Date().toISOString(),
      metrics: {
        portfolio: portfolioMetrics,
        businessPerformance,
        customerSegments,
        aiInsights,
        predictions
      },
      summary: {
        totalPortfolioValue: portfolioMetrics.totalPortfolioValue,
        portfolioPenetrationRate: portfolioMetrics.portfolioPenetrationRate,
        crossSellSuccessRate: portfolioMetrics.crossSellConversionRate,
        retentionRate: portfolioMetrics.customerRetentionRate,
        highImpactInsights: aiInsights.filter(i => i.impact === 'high').length,
        actionRequiredCount: aiInsights.filter(i => i.actionRequired).length
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error in customer analytics API:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error generating analytics' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { timeframe, businessIds, includeSegments, includePredictions, includeInsights } = 
      AnalyticsRequestSchema.parse(body)

    // Generate targeted analytics based on specific parameters
    const portfolioMetrics = generatePortfolioMetrics(timeframe, businessIds)
    const businessPerformance = businessIds 
      ? generateBusinessPerformance(timeframe).filter(b => businessIds.includes(b.businessId))
      : generateBusinessPerformance(timeframe)
    
    const customerSegments = includeSegments ? generateCustomerSegments() : []
    const aiInsights = includeInsights ? generateAIInsights().filter(insight => 
      !businessIds || insight.relatedBusinesses.some(b => businessIds.includes(b))
    ) : []
    
    const predictions = includePredictions ? generatePredictions(timeframe) : null

    const response = {
      success: true,
      parameters: { timeframe, businessIds, includeSegments, includePredictions, includeInsights },
      generatedAt: new Date().toISOString(),
      metrics: {
        portfolio: portfolioMetrics,
        businessPerformance,
        customerSegments,
        aiInsights,
        predictions
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error in customer analytics POST:', error)
    
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
function generatePortfolioMetrics(timeframe: string, businessIds?: string[]): CustomerPortfolioMetrics {
  // Mock portfolio metrics with realistic data
  const baseMetrics = {
    totalCustomers: 247,
    multiBusinessCustomers: 89,
    averagePortfolioValue: 28500,
    totalPortfolioValue: 7047500,
    crossSellConversionRate: 34.2,
    customerRetentionRate: 92.1,
    averageLifetimeValue: 45200,
    portfolioPenetrationRate: 36.0,
    quarterlyGrowthRate: 18.5,
    averageBusinessCount: 2.3
  }

  // Adjust metrics based on timeframe
  const timeframeMultipliers = {
    week: { growth: 0.2, volatility: 0.05 },
    month: { growth: 1.0, volatility: 0.02 },
    quarter: { growth: 3.5, volatility: 0.08 },
    year: { growth: 15.2, volatility: 0.15 }
  }

  const multiplier = timeframeMultipliers[timeframe as keyof typeof timeframeMultipliers] || timeframeMultipliers.month

  // Generate trend data
  const periods = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : timeframe === 'quarter' ? 90 : 365
  const trendData = Array.from({ length: Math.min(periods, 30) }, (_, i) => {
    const baseValue = baseMetrics.totalPortfolioValue
    const variation = (Math.random() - 0.5) * multiplier.volatility * baseValue
    const growthTrend = (baseValue * multiplier.growth / 100) * (i / periods)
    
    return {
      period: timeframe === 'week' ? `Day ${i + 1}` : 
              timeframe === 'month' ? `Day ${i + 1}` : 
              timeframe === 'quarter' ? `Week ${Math.floor(i / 7) + 1}` : 
              `Month ${Math.floor(i / 30) + 1}`,
      value: Math.round(baseValue + growthTrend + variation),
      customers: Math.round(baseMetrics.totalCustomers * (1 + (multiplier.growth / 100) * (i / periods))),
      crossSells: Math.round(15 + Math.random() * 10)
    }
  })

  return {
    ...baseMetrics,
    quarterlyGrowthRate: multiplier.growth,
    trendData
  }
}

function generateBusinessPerformance(timeframe: string): BusinessPerformance[] {
  const businesses = [
    {
      businessId: 'phoenix-hvac',
      businessName: 'Phoenix HVAC Services',
      baseCustomers: 145,
      baseValue: 32000,
      categories: ['Commercial HVAC', 'Maintenance', 'Emergency Service', 'Energy Efficiency']
    },
    {
      businessId: 'valley-maintenance', 
      businessName: 'Valley Maintenance Co',
      baseCustomers: 78,
      baseValue: 18500,
      categories: ['Facility Maintenance', 'General Repairs', 'Preventive Care', 'Equipment Service']
    },
    {
      businessId: 'desert-air',
      businessName: 'Desert Air Solutions', 
      baseCustomers: 64,
      baseValue: 22800,
      categories: ['Residential HVAC', 'Air Quality', 'Smart Systems', 'Installation']
    }
  ]

  return businesses.map(business => {
    // Generate realistic performance metrics
    const retentionRate = 88 + Math.random() * 8 // 88-96%
    const crossSellRate = 25 + Math.random() * 20 // 25-45% 
    const growthPercentage = -5 + Math.random() * 30 // -5% to +25%
    const growthTrend = growthPercentage > 10 ? 'up' : growthPercentage < -2 ? 'down' : 'stable'
    const satisfactionScore = 4.2 + Math.random() * 0.6 // 4.2-4.8

    // Calculate portfolio contribution
    const totalCustomers = businesses.reduce((sum, b) => sum + b.baseCustomers, 0)
    const portfolioContribution = (business.baseCustomers / totalCustomers) * 100

    // Generate monthly trend data
    const monthlyTrend = Array.from({ length: 6 }, (_, i) => ({
      month: new Date(Date.now() - (5 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short' }),
      customers: Math.round(business.baseCustomers * (0.9 + Math.random() * 0.2)),
      revenue: Math.round(business.baseValue * business.baseCustomers * (0.8 + Math.random() * 0.4)),
      crossSells: Math.round(5 + Math.random() * 15)
    }))

    return {
      businessId: business.businessId,
      businessName: business.businessName,
      customerCount: business.baseCustomers,
      averageCustomerValue: business.baseValue,
      retentionRate: Math.round(retentionRate * 10) / 10,
      crossSellRate: Math.round(crossSellRate * 10) / 10,
      growthTrend,
      growthPercentage: Math.round(growthPercentage * 10) / 10,
      portfolioContribution: Math.round(portfolioContribution * 10) / 10,
      satisfactionScore: Math.round(satisfactionScore * 10) / 10,
      topServiceCategories: business.categories.slice(0, 3),
      monthlyTrend
    }
  })
}

function generateCustomerSegments(): CustomerSegment[] {
  return [
    {
      segment: 'Enterprise Portfolio Champions',
      count: 23,
      percentage: 9.3,
      averageValue: 125000,
      crossSellPotential: 89,
      retentionRisk: 8,
      preferredServices: ['Enterprise HVAC', 'Multi-Location', 'Contract Maintenance'],
      growthTrend: 'up',
      conversionRate: 78.5,
      satisfactionScore: 4.8
    },
    {
      segment: 'Growing Business Network',
      count: 66,
      percentage: 26.7,
      averageValue: 45000,
      crossSellPotential: 76,
      retentionRisk: 12,
      preferredServices: ['Commercial HVAC', 'Facility Maintenance', 'Energy Solutions'],
      growthTrend: 'up',
      conversionRate: 42.3,
      satisfactionScore: 4.6
    },
    {
      segment: 'Cross-Business Loyalists',
      count: 89,
      percentage: 36.0,
      averageValue: 28500,
      crossSellPotential: 65,
      retentionRisk: 15,
      preferredServices: ['Maintenance', 'Repair Services', 'Consultation'],
      growthTrend: 'stable',
      conversionRate: 34.1,
      satisfactionScore: 4.5
    },
    {
      segment: 'Single Business Focused',
      count: 69,
      percentage: 28.0,
      averageValue: 15200,
      crossSellPotential: 42,
      retentionRisk: 22,
      preferredServices: ['Basic Service', 'Emergency Response', 'Residential'],
      growthTrend: 'down',
      conversionRate: 18.7,
      satisfactionScore: 4.2
    }
  ]
}

function generateAIInsights(): AIInsight[] {
  return [
    {
      id: 'insight-001',
      type: 'opportunity',
      title: 'High-Value Enterprise Cross-Sell Window',
      description: '23 enterprise customers show 89% cross-sell readiness with AI-calculated $2.8M revenue potential across complementary service categories',
      impact: 'high',
      confidence: 94,
      actionRequired: true,
      relatedBusinesses: ['phoenix-hvac', 'valley-maintenance'],
      potentialValue: 2800000,
      timeline: '30-60 days',
      triggers: ['Contract renewal season', 'High satisfaction scores', 'Service expansion requests'],
      recommendations: [
        'Prepare integrated service proposals for top 10 enterprise accounts',
        'Schedule executive-level meetings within 2 weeks',
        'Create bundled pricing for multi-service contracts'
      ],
      priority: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: 'insight-002',
      type: 'trend',
      title: 'Facility Maintenance Demand Surge',
      description: 'AI detects 42% increase in maintenance service requests across business network, indicating significant expansion opportunity in comprehensive facility services',
      impact: 'high',
      confidence: 87,
      actionRequired: true,
      relatedBusinesses: ['valley-maintenance', 'desert-air'],
      potentialValue: 850000,
      timeline: '45 days',
      triggers: ['Seasonal maintenance cycles', 'Equipment aging patterns', 'Budget planning periods'],
      recommendations: [
        'Expand Valley Maintenance capacity by 30%',
        'Cross-train technicians across businesses',
        'Develop predictive maintenance AI capabilities'
      ],
      priority: 2,
      createdAt: new Date().toISOString()
    },
    {
      id: 'insight-003',
      type: 'risk',
      title: 'Single-Business Customer Retention Alert',
      description: 'Machine learning models identify 28% of customers remaining single-business focused with 22% retention risk, requiring targeted engagement strategy',
      impact: 'medium',
      confidence: 82,
      actionRequired: true,
      relatedBusinesses: ['phoenix-hvac', 'desert-air'],
      potentialValue: 1050000,
      timeline: 'Immediate',
      triggers: ['Decreased engagement scores', 'Service frequency decline', 'Competitive pressure indicators'],
      recommendations: [
        'Launch personalized re-engagement campaign',
        'Offer portfolio discovery incentives',
        'Implement customer success check-ins'
      ],
      priority: 3,
      createdAt: new Date().toISOString()
    },
    {
      id: 'insight-004',
      type: 'success',
      title: 'Multi-Business Customer Satisfaction Peak',
      description: 'Cross-business customers demonstrate 94.5% satisfaction vs 87.2% single-business, validating portfolio strategy with measurable loyalty benefits',
      impact: 'medium',
      confidence: 96,
      actionRequired: false,
      relatedBusinesses: ['phoenix-hvac', 'valley-maintenance', 'desert-air'],
      potentialValue: 0,
      timeline: 'Ongoing',
      triggers: ['Customer feedback analysis', 'Service quality metrics', 'Retention rate tracking'],
      recommendations: [
        'Leverage satisfaction data in marketing',
        'Create customer testimonial program',
        'Expand successful integration practices'
      ],
      priority: 4,
      createdAt: new Date().toISOString()
    },
    {
      id: 'insight-005',
      type: 'opportunity',
      title: 'Smart Building Integration Cross-Sell',
      description: 'AI identifies 15 commercial customers with smart building initiatives showing 73% probability for integrated HVAC and facility management solutions',
      impact: 'medium',
      confidence: 79,
      actionRequired: true,
      relatedBusinesses: ['phoenix-hvac', 'valley-maintenance'],
      potentialValue: 420000,
      timeline: '90 days',
      triggers: ['Smart building technology adoption', 'Energy efficiency mandates', 'IoT integration projects'],
      recommendations: [
        'Develop smart building service packages',
        'Partner with technology providers',
        'Train technicians on IoT systems'
      ],
      priority: 5,
      createdAt: new Date().toISOString()
    }
  ].sort((a, b) => a.priority - b.priority)
}

function generatePredictions(timeframe: string) {
  return {
    portfolioGrowth: {
      next30Days: {
        projectedCustomers: 263,
        projectedRevenue: 7450000,
        confidence: 87
      },
      next90Days: {
        projectedCustomers: 291,
        projectedRevenue: 8200000,
        confidence: 74
      },
      nextYear: {
        projectedCustomers: 385,
        projectedRevenue: 12800000,
        confidence: 62
      }
    },
    crossSellOpportunities: {
      immediate: 47,
      shortTerm: 73,
      longTerm: 126
    },
    riskFactors: [
      {
        factor: 'Seasonal demand fluctuation',
        probability: 0.65,
        impact: 'medium',
        mitigation: 'Diversify service portfolio'
      },
      {
        factor: 'Competition in facility maintenance',
        probability: 0.42,
        impact: 'low',
        mitigation: 'Strengthen customer relationships'
      }
    ]
  }
}