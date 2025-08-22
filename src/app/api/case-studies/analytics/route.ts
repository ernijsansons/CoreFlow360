import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const AnalyticsQuerySchema = z.object({
  period: z.enum(['7days', '30days', '90days', '1year']).optional().default('30days'),
  caseStudyId: z.string().optional(),
  metric: z.enum(['views', 'leads', 'revenue', 'engagement']).optional().default('views')
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = {
      period: searchParams.get('period') || '30days',
      caseStudyId: searchParams.get('caseStudyId') || undefined,
      metric: searchParams.get('metric') || 'views'
    }

    const validatedQuery = AnalyticsQuerySchema.parse(queryParams)

    // Mock analytics data - in production, this would query analytics database
    const mockAnalyticsData = {
      period: validatedQuery.period,
      totalViews: 37050,
      uniqueViews: 28420,
      totalLeads: 370,
      conversionRate: 10.8,
      avgTimeOnPage: 185,
      bounceRate: 42.3,
      topPerformingStudy: 'Sarah Chen Multi-Business Empire',
      attributedRevenue: 485000,
      pipelineInfluence: 1250000,
      
      // Time series data for charts
      timeSeriesData: [
        { date: '2024-02-21', views: 8450, leads: 85, revenue: 38500 },
        { date: '2024-02-28', views: 9200, leads: 92, revenue: 42000 },
        { date: '2024-03-07', views: 10800, leads: 108, revenue: 49200 },
        { date: '2024-03-14', views: 12450, leads: 125, revenue: 56800 },
        { date: '2024-03-21', views: 11890, leads: 119, revenue: 54100 }
      ],
      
      // Traffic sources breakdown
      trafficSources: [
        {
          source: 'Organic Search',
          views: 15820,
          percentage: 42.7,
          conversionRate: 12.5,
          leads: 158,
          growthRate: 18.5
        },
        {
          source: 'Direct Traffic',
          views: 8930,
          percentage: 24.1,
          conversionRate: 9.8,
          leads: 89,
          growthRate: 12.3
        },
        {
          source: 'Social Media',
          views: 6240,
          percentage: 16.8,
          conversionRate: 8.2,
          leads: 62,
          growthRate: 25.7
        },
        {
          source: 'Email Marketing',
          views: 3680,
          percentage: 9.9,
          conversionRate: 15.7,
          leads: 37,
          growthRate: 8.9
        },
        {
          source: 'Paid Search',
          views: 2380,
          percentage: 6.4,
          conversionRate: 10.1,
          leads: 24,
          growthRate: 5.2
        }
      ],
      
      // Audience insights
      audienceInsights: {
        businessSize: [
          { label: 'Startup (1-10 employees)', value: 12850, percentage: 34.7, conversionRate: 8.5 },
          { label: 'SMB (11-50 employees)', value: 11120, percentage: 30.0, conversionRate: 12.8 },
          { label: 'Mid-Market (51-200 employees)', value: 8940, percentage: 24.1, conversionRate: 14.2 },
          { label: 'Enterprise (200+ employees)', value: 4140, percentage: 11.2, conversionRate: 9.1 }
        ],
        industry: [
          { label: 'Professional Services', value: 9250, percentage: 25.0, conversionRate: 13.8 },
          { label: 'HVAC/Home Services', value: 8120, percentage: 21.9, conversionRate: 11.5 },
          { label: 'Construction', value: 6890, percentage: 18.6, conversionRate: 9.7 },
          { label: 'Technology', value: 5940, percentage: 16.0, conversionRate: 12.2 },
          { label: 'Retail/E-commerce', value: 4320, percentage: 11.7, conversionRate: 8.9 },
          { label: 'Other', value: 2530, percentage: 6.8, conversionRate: 7.4 }
        ],
        userRole: [
          { label: 'CEO/Founder', value: 14820, percentage: 40.0, conversionRate: 15.2 },
          { label: 'Business Owner', value: 11120, percentage: 30.0, conversionRate: 12.8 },
          { label: 'Operations Manager', value: 5560, percentage: 15.0, conversionRate: 8.5 },
          { label: 'Marketing Manager', value: 3705, percentage: 10.0, conversionRate: 6.9 },
          { label: 'Other', value: 1845, percentage: 5.0, conversionRate: 4.2 }
        ]
      },
      
      // Individual case study performance
      caseStudyPerformance: [
        {
          id: 'case-1',
          title: 'From 2 Struggling Businesses to $8.5M Multi-Business Empire',
          entrepreneurName: 'Sarah Chen',
          views: 12450,
          uniqueViews: 9870,
          leads: 125,
          conversionRate: 12.7,
          avgTimeOnPage: 225,
          bounceRate: 35.2,
          downloads: 890,
          shares: 67,
          attributedRevenue: 185000,
          monthlyGrowth: 18.5,
          topTrafficSource: 'Organic Search',
          topAudience: 'HVAC/Home Services'
        },
        {
          id: 'case-2',
          title: 'Professional Services Empire: From Solo Practice to $12M Portfolio',
          entrepreneurName: 'Michael Rodriguez',
          views: 8950,
          uniqueViews: 7320,
          leads: 89,
          conversionRate: 10.8,
          avgTimeOnPage: 198,
          bounceRate: 42.1,
          downloads: 445,
          shares: 34,
          attributedRevenue: 145000,
          monthlyGrowth: 12.3,
          topTrafficSource: 'Direct Traffic',
          topAudience: 'Professional Services'
        },
        {
          id: 'case-3',
          title: 'Tech-Enabled HVAC Empire: 12 Locations, $25M Revenue',
          entrepreneurName: 'Jennifer Park',
          views: 15680,
          uniqueViews: 11200,
          leads: 156,
          conversionRate: 11.2,
          avgTimeOnPage: 165,
          bounceRate: 38.9,
          downloads: 1250,
          shares: 89,
          attributedRevenue: 155000,
          monthlyGrowth: 25.1,
          topTrafficSource: 'Social Media',
          topAudience: 'Technology'
        }
      ],
      
      // Content performance insights
      contentInsights: [
        {
          type: 'HIGH_PERFORMER',
          title: 'Jennifer Park HVAC Case Leading Growth',
          description: 'Tech-enabled HVAC case study showing 25.1% monthly growth, outperforming portfolio average by 67%',
          metric: 'Monthly Growth',
          value: '25.1%',
          recommendation: 'Consider creating similar tech-focused case studies'
        },
        {
          type: 'CONVERSION_LEADER',
          title: 'Sarah Chen Case Drives Highest Conversions',
          description: 'Multi-business empire story converts at 12.7%, significantly above 10.8% average',
          metric: 'Conversion Rate',
          value: '12.7%',
          recommendation: 'Promote this case study in high-intent channels'
        },
        {
          type: 'ENGAGEMENT_CHAMPION',
          title: 'Professional Services Content Engages Deeply',
          description: 'Legal/consulting audience spends 198+ seconds on average, indicating strong resonance',
          metric: 'Time on Page',
          value: '3:18',
          recommendation: 'Develop more professional services content'
        },
        {
          type: 'OPTIMIZATION_OPPORTUNITY',
          title: 'Social Media Traffic Underconverting',
          description: 'Social traffic has good volume (16.8%) but lower conversion rate (8.2%)',
          metric: 'Conversion Gap',
          value: '-2.6%',
          recommendation: 'Optimize social content for higher intent keywords'
        }
      ],
      
      // Revenue attribution
      revenueAttribution: {
        totalAttributed: 485000,
        pipelineInfluence: 1250000,
        avgDealSize: 1310,
        timeToClose: 45, // days
        topConvertingContent: 'case-1',
        conversionFunnel: {
          awareness: 37050,
          consideration: 8920,
          intent: 2840,
          evaluation: 890,
          purchase: 370
        },
        revenueBySource: {
          'Organic Search': 185000,
          'Direct Traffic': 125000,
          'Email Marketing': 95000,
          'Social Media': 48000,
          'Paid Search': 32000
        }
      }
    }

    // Filter data if specific case study requested
    if (validatedQuery.caseStudyId) {
      const specificCaseStudy = mockAnalyticsData.caseStudyPerformance.find(
        cs => cs.id === validatedQuery.caseStudyId
      )
      
      if (!specificCaseStudy) {
        return NextResponse.json(
          { success: false, error: 'Case study not found' },
          { status: 404 }
        )
      }
      
      // Return detailed analytics for specific case study
      return NextResponse.json({
        success: true,
        data: {
          caseStudy: specificCaseStudy,
          period: validatedQuery.period,
          detailedMetrics: {
            hourlyViews: Array.from({ length: 24 }, (_, i) => ({
              hour: i,
              views: Math.floor(Math.random() * 500) + 100
            })),
            deviceBreakdown: {
              desktop: 65.2,
              mobile: 28.8,
              tablet: 6.0
            },
            geoDistribution: {
              'United States': 72.5,
              'Canada': 12.3,
              'United Kingdom': 8.7,
              'Australia': 4.2,
              'Other': 2.3
            },
            conversionPaths: [
              { path: 'Direct -> Case Study -> Demo Request', count: 45, conversionRate: 15.2 },
              { path: 'Search -> Case Study -> Trial Signup', count: 38, conversionRate: 12.8 },
              { path: 'Social -> Case Study -> Contact', count: 22, conversionRate: 8.5 }
            ]
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: mockAnalyticsData
    })

  } catch (error) {
    console.error('Case study analytics API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request parameters', 
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch case study analytics' 
      },
      { status: 500 }
    )
  }
}

// Track interaction endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { caseStudyId, interactionType, elementType, sessionData } = body

    // Mock interaction tracking - in production, this would store in analytics database
    const interaction = {
      id: `interaction-${Date.now()}`,
      caseStudyId,
      interactionType, // VIEW, DOWNLOAD, SHARE, COMMENT, LIKE, CONTACT
      elementType, // TESTIMONIAL, METRIC, IMAGE, CTA
      sessionData: {
        userAgent: sessionData?.userAgent,
        referrer: sessionData?.referrer,
        timeOnPage: sessionData?.timeOnPage,
        scrollDepth: sessionData?.scrollDepth
      },
      timestamp: new Date().toISOString(),
      
      // AI-generated engagement score
      engagementScore: Math.floor(Math.random() * 40) + 60, // 60-100
      intentScore: Math.floor(Math.random() * 30) + 70, // 70-100
      conversionProbability: Math.floor(Math.random() * 25) + 75 // 75-100
    }

    // Generate insights based on interaction
    const interactionInsights = []

    if (interactionType === 'DOWNLOAD') {
      interactionInsights.push({
        type: 'HIGH_INTENT',
        message: 'Download indicates strong purchase intent',
        suggestedAction: 'Follow up with personalized demo invitation',
        probability: 85
      })
    }

    if (sessionData?.timeOnPage > 180) {
      interactionInsights.push({
        type: 'HIGH_ENGAGEMENT',
        message: 'Above-average time on page indicates strong interest',
        suggestedAction: 'Nurture with related case studies',
        probability: 78
      })
    }

    if (sessionData?.scrollDepth > 80) {
      interactionInsights.push({
        type: 'CONTENT_RESONANCE',
        message: 'High scroll depth suggests content relevance',
        suggestedAction: 'Present complementary content',
        probability: 72
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        interaction,
        insights: interactionInsights
      },
      message: 'Interaction tracked successfully'
    })

  } catch (error) {
    console.error('Interaction tracking error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to track interaction' 
      },
      { status: 500 }
    )
  }
}