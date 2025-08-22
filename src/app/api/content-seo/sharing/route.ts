import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const ContentSharingQuerySchema = z.object({
  businessId: z.string().optional(),
  sharingType: z.enum(['shared', 'requests', 'opportunities']).optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'IMPLEMENTED']).optional()
})

const ShareRequestSchema = z.object({
  contentId: z.string(),
  requestingBusiness: z.string(),
  requestedBy: z.string(),
  reason: z.string(),
  adaptationRequired: z.boolean(),
  estimatedAdaptationHours: z.number().optional(),
  notes: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = {
      businessId: searchParams.get('businessId') || undefined,
      sharingType: searchParams.get('sharingType') || undefined,
      status: searchParams.get('status') || undefined
    }

    const validatedQuery = ContentSharingQuerySchema.parse(queryParams)

    // Mock shared content data
    const mockSharedContent = [
      {
        id: 'shared-1',
        title: 'Complete Guide to HVAC Maintenance for Multi-Location Businesses',
        contentType: 'BLOG_POST',
        originalBusiness: 'Phoenix HVAC Services',
        sharedWithBusinesses: ['Valley Maintenance Co', 'Desert Air Solutions'],
        adaptationLevel: 'MINOR',
        adaptationNotes: 'Updated location-specific information and contact details',
        performanceData: {
          'Phoenix HVAC Services': {
            views: 2450,
            leads: 12,
            conversionRate: 3.2,
            adaptationScore: 100
          },
          'Valley Maintenance Co': {
            views: 1890,
            leads: 9,
            conversionRate: 3.8,
            adaptationScore: 95
          },
          'Desert Air Solutions': {
            views: 1650,
            leads: 7,
            conversionRate: 2.9,
            adaptationScore: 92
          }
        },
        sharingMetrics: {
          totalViews: 5990,
          totalLeads: 28,
          avgConversionRate: 3.3,
          crossBusinessLift: 18.5,
          costEfficiency: 'Saved $8,400 in content creation costs',
          timeToMarket: 'Reduced by 75% vs new content creation'
        },
        focusKeywords: ['HVAC maintenance', 'multi-location HVAC', 'commercial HVAC service'],
        lastUpdated: '2024-03-15',
        nextReview: '2024-06-15'
      }
    ]

    // Mock share requests
    const mockShareRequests = [
      {
        id: 'req-3',
        contentId: 'content-3',
        contentTitle: 'Cross-Business Resource Optimization Strategies',
        requestingBusiness: 'Creative Marketing Studio',
        requestedBy: 'Emma Thompson',
        requestDate: '2024-03-20',
        status: 'PENDING',
        reason: 'Want to adapt the resource optimization content for marketing agency use case',
        adaptationRequired: true,
        estimatedAdaptationHours: 8,
        notes: 'Need to update examples to marketing-specific scenarios',
        urgency: 'MEDIUM',
        businessJustification: 'Aligns with our Q2 efficiency initiative',
        expectedROI: '+25% content engagement based on topic relevance'
      },
      {
        id: 'req-4',
        contentId: 'content-4',
        contentTitle: 'Professional Services Billing Rate Analysis',
        requestingBusiness: 'Desert Air Solutions',
        requestedBy: 'Carlos Martinez',
        requestDate: '2024-03-19',
        status: 'PENDING',
        reason: 'Professional services billing content could be adapted for service contracts',
        adaptationRequired: true,
        estimatedAdaptationHours: 4,
        urgency: 'HIGH',
        businessJustification: 'Need for Q2 pricing strategy update',
        expectedROI: 'Improve pricing transparency, reduce sales cycle by 15%'
      }
    ]

    // Mock sharing opportunities with AI scoring
    const mockSharingOpportunities = [
      {
        id: 'opp-1',
        contentId: 'content-3',
        contentTitle: 'Cross-Business Resource Optimization Strategies',
        sourceBusinesses: ['Strategic Consulting Group'],
        targetBusiness: 'Corporate Law Partners',
        opportunityScore: 87,
        estimatedLift: '15-25% increase in relevant traffic',
        reasoning: 'High keyword overlap (78%) with law firm resource management needs. Content addresses efficiency optimization which is relevant for legal operations.',
        adaptationRequired: true,
        estimatedHours: 6,
        keywordMatch: 78,
        audienceMatch: 82,
        competitorAnalysis: 'Competitors have similar content gaps',
        seasonalRelevance: 'High - Q2 efficiency planning season',
        riskAssessment: 'Low risk - complementary positioning'
      },
      {
        id: 'opp-2',
        contentId: 'content-4',
        contentTitle: 'Marketing ROI Calculator for Professional Services',
        sourceBusinesses: ['Creative Marketing Studio'],
        targetBusiness: 'Strategic Consulting Group',
        opportunityScore: 92,
        estimatedLift: '25-35% increase in tool engagement',
        reasoning: 'Perfect audience match (94%) - consulting firms need ROI measurement tools. Minimal adaptation required for consulting use case.',
        adaptationRequired: false,
        estimatedHours: 2,
        keywordMatch: 86,
        audienceMatch: 94,
        competitorAnalysis: 'First-mover advantage in consulting ROI tools',
        seasonalRelevance: 'Medium - year-round relevance',
        riskAssessment: 'Very low - strong strategic fit'
      }
    ]

    // Apply filters based on query
    let responseData: any = {}

    if (!validatedQuery.sharingType || validatedQuery.sharingType === 'shared') {
      responseData.sharedContent = mockSharedContent
    }

    if (!validatedQuery.sharingType || validatedQuery.sharingType === 'requests') {
      let filteredRequests = mockShareRequests
      if (validatedQuery.status) {
        filteredRequests = filteredRequests.filter(req => req.status === validatedQuery.status)
      }
      responseData.shareRequests = filteredRequests
    }

    if (!validatedQuery.sharingType || validatedQuery.sharingType === 'opportunities') {
      let filteredOpportunities = mockSharingOpportunities
      if (validatedQuery.businessId && validatedQuery.businessId !== 'ALL') {
        filteredOpportunities = filteredOpportunities.filter(opp => 
          opp.targetBusiness === validatedQuery.businessId ||
          opp.sourceBusinesses.includes(validatedQuery.businessId)
        )
      }
      responseData.sharingOpportunities = filteredOpportunities
    }

    // Calculate portfolio metrics
    const portfolioMetrics = {
      totalSharedContent: mockSharedContent.length,
      activeRequests: mockShareRequests.filter(r => r.status === 'PENDING').length,
      totalOpportunities: mockSharingOpportunities.length,
      avgCrossBusinessLift: Math.round(
        mockSharedContent.reduce((acc, content) => acc + content.sharingMetrics.crossBusinessLift, 0) / 
        mockSharedContent.length
      ),
      totalSharedViews: mockSharedContent.reduce((acc, content) => acc + content.sharingMetrics.totalViews, 0),
      totalSharedLeads: mockSharedContent.reduce((acc, content) => acc + content.sharingMetrics.totalLeads, 0),
      totalCostSavings: 25200, // Calculated from avoided content creation costs
      avgTimeToMarket: '75% faster', // vs creating new content
      portfolioEfficiency: 94 // Overall sharing efficiency score
    }

    // Generate AI-powered sharing insights
    const sharingInsights = [
      {
        type: 'HIGH_OPPORTUNITY',
        priority: 'CRITICAL',
        title: 'Strategic Consulting Content Gap',
        description: 'Marketing ROI Calculator has 92% compatibility with Strategic Consulting. Immediate implementation recommended.',
        actionable: true,
        estimatedImpact: '+$45K revenue potential',
        timeToImplement: '2 hours',
        suggestedAction: 'Share immediately - minimal adaptation required'
      },
      {
        type: 'EFFICIENCY_OPTIMIZATION',
        priority: 'HIGH',
        title: 'Content Portfolio Optimization',
        description: 'Current shared content generating 18.5% lift. Identified 3 additional high-value sharing opportunities.',
        actionable: true,
        estimatedImpact: '+$25K annual content cost savings',
        timeToImplement: '2 weeks',
        suggestedAction: 'Implement all 3 opportunities to maximize portfolio efficiency'
      },
      {
        type: 'RISK_MITIGATION',
        priority: 'MEDIUM',
        title: 'Content Adaptation Quality',
        description: 'Adaptation scores averaging 92%. One business showing lower performance - may need content review.',
        actionable: true,
        estimatedImpact: 'Maintain quality standards',
        timeToImplement: '1 week',
        suggestedAction: 'Review Desert Air Solutions content adaptation'
      }
    ]

    return NextResponse.json({
      success: true,
      data: {
        ...responseData,
        metrics: portfolioMetrics,
        insights: sharingInsights,
        filters: validatedQuery
      }
    })

  } catch (error) {
    console.error('Content sharing API error:', error)
    
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
        error: 'Failed to fetch content sharing data' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    if (action === 'create_share_request') {
      const validatedData = ShareRequestSchema.parse(data)
      
      // Mock share request creation
      const newShareRequest = {
        id: `req-${Date.now()}`,
        ...validatedData,
        requestDate: new Date().toISOString(),
        status: 'PENDING',
        urgency: 'MEDIUM',
        createdAt: new Date().toISOString()
      }

      // Generate AI analysis for the request
      const requestAnalysis = {
        feasibilityScore: 85,
        adaptationComplexity: validatedData.adaptationRequired ? 'MODERATE' : 'LOW',
        estimatedROI: '+20-30% content performance improvement',
        riskFactors: ['Brand consistency needs review', 'Technical adaptation required'],
        recommendations: [
          'Approve with standard adaptation guidelines',
          'Schedule review with brand team',
          'Allocate 6-8 hours for quality adaptation'
        ]
      }

      return NextResponse.json({
        success: true,
        data: {
          shareRequest: newShareRequest,
          analysis: requestAnalysis
        },
        message: 'Share request created successfully'
      })
    }

    if (action === 'approve_share_request') {
      const { requestId, approverName, notes } = data
      
      // Mock approval logic
      const approvedRequest = {
        requestId,
        approvedBy: approverName,
        approvalDate: new Date().toISOString(),
        status: 'APPROVED',
        notes,
        nextSteps: [
          'Begin content adaptation',
          'Quality review and brand approval',
          'Implementation and performance tracking'
        ]
      }

      return NextResponse.json({
        success: true,
        data: approvedRequest,
        message: 'Share request approved successfully'
      })
    }

    if (action === 'share_content') {
      const { contentId, targetBusinesses, adaptationLevel } = data
      
      // Mock content sharing
      const sharingResult = {
        contentId,
        targetBusinesses,
        adaptationLevel,
        shareDate: new Date().toISOString(),
        estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        trackingId: `share-${Date.now()}`,
        expectedMetrics: {
          estimatedViews: 2500,
          estimatedLeads: 8,
          projectedLift: '+22%'
        }
      }

      return NextResponse.json({
        success: true,
        data: sharingResult,
        message: 'Content shared successfully'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action specified' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Content sharing action error:', error)
    
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
        error: 'Failed to process content sharing action' 
      },
      { status: 500 }
    )
  }
}