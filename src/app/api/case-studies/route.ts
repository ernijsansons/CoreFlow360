import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const CaseStudyQuerySchema = z.object({
  status: z.enum(['DRAFT', 'IN_REVIEW', 'PUBLISHED', 'FEATURED', 'ARCHIVED']).optional(),
  featured: z.boolean().optional(),
  industry: z.string().optional(),
  businessSize: z.string().optional(),
  sortBy: z.enum(['created', 'views', 'leads', 'conversion']).optional().default('created'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
})

const CaseStudyCreateSchema = z.object({
  title: z.string().min(1),
  entrepreneurName: z.string().min(1),
  entrepreneurTitle: z.string().min(1),
  entrepreneurBio: z.string().optional(),
  entrepreneurLocation: z.string().optional(),
  businessCount: z.number().min(1),
  businessTypes: z.array(z.string()),
  industries: z.array(z.string()),
  beforeRevenue: z.number().optional(),
  afterRevenue: z.number().optional(),
  revenueGrowth: z.number().optional(),
  challengeStory: z.string().min(1),
  solutionStory: z.string().min(1),
  resultsStory: z.string().min(1),
  testimonialQuote: z.string().optional(),
  keyFeatures: z.array(z.string()),
  targetAudience: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = {
      status: searchParams.get('status') || undefined,
      featured: searchParams.get('featured') === 'true' ? true : 
                searchParams.get('featured') === 'false' ? false : undefined,
      industry: searchParams.get('industry') || undefined,
      businessSize: searchParams.get('businessSize') || undefined,
      sortBy: searchParams.get('sortBy') || 'created',
      sortOrder: searchParams.get('sortOrder') || 'desc'
    }

    const validatedQuery = CaseStudyQuerySchema.parse(queryParams)

    // Mock case study data - in production, this would query the database
    const mockCaseStudies = [
      {
        id: 'case-1',
        title: 'From 2 Struggling Businesses to $8.5M Multi-Business Empire',
        slug: 'sarah-chen-multi-business-empire',
        status: 'PUBLISHED',
        featured: true,
        publishDate: '2024-03-15',
        
        entrepreneurName: 'Sarah Chen',
        entrepreneurTitle: 'Serial Entrepreneur & Business Portfolio Owner',
        entrepreneurBio: 'Started her first HVAC business in 2018, expanded into property management in 2020. Now runs 4 profitable businesses with CoreFlow360.',
        entrepreneurLocation: 'Phoenix, Arizona',
        yearsInBusiness: 6,
        
        businessCount: 4,
        businessTypes: ['Service Business', 'Property Management', 'Consulting', 'E-commerce'],
        industries: ['HVAC', 'Real Estate', 'Consulting', 'Retail'],
        businessNames: ['Desert Climate Solutions', 'Phoenix Property Partners', 'Chen Business Consulting', 'AC Parts Direct'],
        
        beforeRevenue: 1200000,
        afterRevenue: 8500000,
        beforeEmployees: 8,
        afterEmployees: 45,
        revenueGrowth: 608,
        profitGrowth: 485,
        efficiencyGain: 78,
        timeframe: '18 months',
        
        challengeStory: 'Managing 4 separate businesses with different systems was chaos. No visibility across operations, duplicate customers not being cross-sold, and constant firefighting instead of strategic growth.',
        solutionStory: 'CoreFlow360 unified everything into one intelligent platform. Cross-business insights revealed $2M in untapped opportunities, automated workflows freed up 40 hours per week, and progressive pricing saved 45% on software costs.',
        resultsStory: '608% revenue growth in 18 months. Identified and closed $2.3M in cross-business opportunities. Reduced operational overhead by 35% while scaling from 8 to 45 employees across portfolio.',
        testimonialQuote: 'CoreFlow360 didn\'t just help me manage my businesses - it revealed opportunities I never knew existed. The cross-business insights alone generated over $2M in new revenue.',
        
        monthlyTimeSaved: 160,
        costSavings: 245000,
        revenueIncrease: 7300000,
        roiPercentage: 2980,
        paybackPeriod: '6 weeks',
        
        views: 12450,
        downloads: 890,
        leads: 125,
        shares: 67,
        conversionRate: 12.5,
        
        implementationTime: '3 weeks',
        keyFeatures: ['Cross-Business Analytics', 'Progressive Pricing', 'Unified Customer Database', 'Automated Workflows'],
        successFactors: ['Executive buy-in', 'Phased rollout', 'Staff training', 'Data migration'],
        
        targetAudience: 'GROWING',
        reviewStatus: 'APPROVED',
        reviewedBy: 'Marketing Team',
        legalApproval: true,
        
        createdAt: '2024-02-28T10:00:00Z',
        updatedAt: '2024-03-15T14:30:00Z',
        
        // Performance metrics for analytics
        analyticsData: {
          monthlyViews: [8450, 9200, 10800, 12450],
          monthlyLeads: [85, 92, 108, 125],
          trafficSources: {
            organic: 45.2,
            direct: 28.5,
            social: 16.8,
            email: 9.5
          },
          audienceSegments: {
            'HVAC': 35.5,
            'Multi-Business': 28.2,
            'Service Business': 22.8,
            'Other': 13.5
          }
        }
      },
      {
        id: 'case-2',
        title: 'Professional Services Empire: From Solo Practice to $12M Portfolio',
        slug: 'michael-rodriguez-professional-services',
        status: 'PUBLISHED',
        featured: true,
        publishDate: '2024-03-08',
        
        entrepreneurName: 'Michael Rodriguez',
        entrepreneurTitle: 'Managing Partner & Founder',
        entrepreneurBio: 'Former Big Law attorney who left to build his own legal empire. Now owns law firm, accounting practice, and consulting group serving 200+ clients.',
        entrepreneurLocation: 'Dallas, Texas',
        yearsInBusiness: 12,
        
        businessCount: 3,
        businessTypes: ['Legal Services', 'Accounting', 'Business Consulting'],
        industries: ['Legal', 'Financial Services', 'Consulting'],
        businessNames: ['Rodriguez & Associates Law', 'Lone Star Accounting', 'Strategic Business Partners'],
        
        beforeRevenue: 2800000,
        afterRevenue: 12000000,
        revenueGrowth: 329,
        profitGrowth: 275,
        roiPercentage: 5111,
        timeframe: '2 years',
        
        challengeStory: 'Three successful but siloed businesses. Clients needing legal, accounting, and consulting services were using competitors because we couldn\'t see the full picture or coordinate effectively.',
        solutionStory: 'CoreFlow360 connected all three practices. Unified client view revealed massive cross-selling opportunities. Resource sharing optimized utilization. Progressive pricing model reduced software costs by 35%.',
        resultsStory: 'Generated $4.2M in cross-business revenue in first year. Improved client retention to 94%. Reduced client acquisition costs by 60% through internal referrals. Scaled from 15 to 68 professionals.',
        testimonialQuote: 'The unified client intelligence is game-changing. We now provide comprehensive solutions instead of fragmented services. Our clients love the seamless experience.',
        
        views: 8950,
        downloads: 445,
        leads: 89,
        conversionRate: 10.8,
        
        keyFeatures: ['Unified Client Database', 'Resource Allocation', 'Cross-Business Billing', 'Performance Analytics'],
        targetAudience: 'ENTERPRISE',
        reviewStatus: 'APPROVED',
        legalApproval: true,
        
        createdAt: '2024-02-15T09:00:00Z',
        updatedAt: '2024-03-08T16:20:00Z'
      },
      {
        id: 'case-3',
        title: 'E-commerce to Physical Retail: $15M Omnichannel Success',
        slug: 'amanda-foster-omnichannel',
        status: 'IN_REVIEW',
        featured: false,
        
        entrepreneurName: 'Amanda Foster',
        entrepreneurTitle: 'Founder & CEO',
        entrepreneurLocation: 'Seattle, Washington',
        businessCount: 5,
        businessTypes: ['E-commerce', 'Retail', 'Logistics', 'Technology'],
        industries: ['E-commerce', 'Retail', 'Logistics', 'Technology'],
        
        revenueGrowth: 450,
        profitGrowth: 380,
        roiPercentage: 1250,
        timeframe: '14 months',
        
        challengeStory: 'Rapid expansion from online-only to omnichannel created operational complexity. Inventory management across channels was chaotic, customer experience was inconsistent.',
        solutionStory: 'CoreFlow360 unified our online and offline operations. Real-time inventory sync, unified customer profiles, and automated cross-channel workflows.',
        resultsStory: '450% revenue growth while maintaining operational efficiency. Reduced inventory carrying costs by 28%. Improved customer satisfaction scores by 45%.',
        testimonialQuote: 'CoreFlow360 connected our online and offline worlds seamlessly. Our customers love the unified experience.',
        
        views: 0,
        leads: 0,
        conversionRate: 0,
        
        targetAudience: 'SCALING',
        reviewStatus: 'PENDING',
        legalApproval: false,
        
        createdAt: '2024-03-18T11:30:00Z',
        updatedAt: '2024-03-20T09:15:00Z'
      }
    ]

    // Apply filters
    let filteredCaseStudies = mockCaseStudies

    if (validatedQuery.status) {
      filteredCaseStudies = filteredCaseStudies.filter(cs => cs.status === validatedQuery.status)
    }

    if (validatedQuery.featured !== undefined) {
      filteredCaseStudies = filteredCaseStudies.filter(cs => cs.featured === validatedQuery.featured)
    }

    if (validatedQuery.industry) {
      filteredCaseStudies = filteredCaseStudies.filter(cs => 
        cs.industries.includes(validatedQuery.industry!)
      )
    }

    if (validatedQuery.businessSize) {
      filteredCaseStudies = filteredCaseStudies.filter(cs => 
        cs.targetAudience === validatedQuery.businessSize
      )
    }

    // Apply sorting
    filteredCaseStudies.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (validatedQuery.sortBy) {
        case 'views':
          aValue = a.views
          bValue = b.views
          break
        case 'leads':
          aValue = a.leads
          bValue = b.leads
          break
        case 'conversion':
          aValue = a.conversionRate
          bValue = b.conversionRate
          break
        default: // 'created'
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
      }
      
      if (validatedQuery.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      }
      return aValue < bValue ? 1 : -1
    })

    // Calculate portfolio metrics
    const portfolioMetrics = {
      totalCaseStudies: mockCaseStudies.length,
      publishedCaseStudies: mockCaseStudies.filter(cs => cs.status === 'PUBLISHED').length,
      featuredCaseStudies: mockCaseStudies.filter(cs => cs.featured).length,
      draftCaseStudies: mockCaseStudies.filter(cs => cs.status === 'DRAFT').length,
      totalViews: mockCaseStudies.reduce((acc, cs) => acc + cs.views, 0),
      totalLeads: mockCaseStudies.reduce((acc, cs) => acc + cs.leads, 0),
      avgConversionRate: mockCaseStudies.filter(cs => cs.conversionRate > 0)
        .reduce((acc, cs) => acc + cs.conversionRate, 0) / 
        mockCaseStudies.filter(cs => cs.conversionRate > 0).length || 0,
      topPerformingId: mockCaseStudies.reduce((prev, current) => 
        (prev.views > current.views) ? prev : current
      ).id,
      totalAttributedRevenue: 485000, // Sum of attributed revenue
      avgROI: Math.round(mockCaseStudies.reduce((acc, cs) => acc + (cs.roiPercentage || 0), 0) / mockCaseStudies.length)
    }

    return NextResponse.json({
      success: true,
      data: {
        caseStudies: filteredCaseStudies,
        metrics: portfolioMetrics,
        filters: validatedQuery
      }
    })

  } catch (error) {
    console.error('Case studies API error:', error)
    
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
        error: 'Failed to fetch case studies' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CaseStudyCreateSchema.parse(body)

    // Generate slug from title
    const slug = validatedData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Mock case study creation - in production, this would create in database
    const newCaseStudy = {
      id: `case-${Date.now()}`,
      slug,
      status: 'DRAFT',
      featured: false,
      ...validatedData,
      views: 0,
      downloads: 0,
      leads: 0,
      shares: 0,
      conversionRate: 0,
      reviewStatus: 'PENDING',
      legalApproval: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Generate AI-powered recommendations for the new case study
    const caseStudyRecommendations = [
      {
        type: 'CONTENT_OPTIMIZATION',
        suggestion: 'Consider adding specific ROI metrics to strengthen credibility',
        confidence: 92,
        estimatedImpact: '+15% conversion rate improvement'
      },
      {
        type: 'SEO_OPTIMIZATION',
        suggestion: 'Target long-tail keywords for better organic discovery',
        confidence: 87,
        estimatedImpact: '+25% organic traffic potential'
      },
      {
        type: 'AUDIENCE_TARGETING',
        suggestion: `Content resonates well with ${validatedData.targetAudience || 'SMB'} audience segment`,
        confidence: 89,
        estimatedImpact: 'Higher engagement expected from target demographic'
      },
      {
        type: 'COMPETITIVE_ANALYSIS',
        suggestion: 'Story differentiates well from existing case studies in portfolio',
        confidence: 84,
        estimatedImpact: 'Unique value proposition identified'
      }
    ]

    return NextResponse.json({
      success: true,
      data: {
        caseStudy: newCaseStudy,
        recommendations: caseStudyRecommendations
      },
      message: 'Case study created successfully'
    })

  } catch (error) {
    console.error('Case study creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid case study data', 
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create case study' 
      },
      { status: 500 }
    )
  }
}