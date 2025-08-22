import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const ContentCalendarQuerySchema = z.object({
  businessId: z.string().optional(),
  contentPillar: z.string().optional(),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'IN_REVIEW', 'SCHEDULED', 'PUBLISHED']).optional(),
  dateRange: z.object({
    start: z.string(),
    end: z.string()
  }).optional()
})

const ContentCalendarItemSchema = z.object({
  title: z.string(),
  contentType: z.enum(['BLOG_POST', 'LANDING_PAGE', 'SERVICE_PAGE', 'CASE_STUDY', 'PRESS_RELEASE']),
  plannedDate: z.string(),
  publishDate: z.string().optional(),
  assignedTo: z.string(),
  primaryBusiness: z.string(),
  targetBusinesses: z.array(z.string()),
  sharedContent: z.boolean(),
  focusKeywords: z.array(z.string()),
  contentPillar: z.string(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  estimatedHours: z.number(),
  campaignTag: z.string().optional(),
  seasonalTheme: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = {
      businessId: searchParams.get('businessId') || undefined,
      contentPillar: searchParams.get('contentPillar') || undefined,
      status: searchParams.get('status') || undefined,
      dateRange: searchParams.get('startDate') && searchParams.get('endDate') ? {
        start: searchParams.get('startDate')!,
        end: searchParams.get('endDate')!
      } : undefined
    }

    const validatedQuery = ContentCalendarQuerySchema.parse(queryParams)

    // Mock calendar data - in production, this would query the database
    const mockCalendarItems = [
      {
        id: 'cal-1',
        title: 'Complete Guide to HVAC Maintenance for Multi-Location Businesses',
        contentType: 'BLOG_POST',
        status: 'PUBLISHED',
        plannedDate: '2024-03-10',
        publishDate: '2024-03-10',
        assignedTo: 'Sarah Johnson',
        primaryBusiness: 'Phoenix HVAC Services',
        targetBusinesses: ['Phoenix HVAC Services', 'Valley Maintenance Co', 'Desert Air Solutions'],
        sharedContent: true,
        focusKeywords: ['HVAC maintenance', 'multi-location HVAC', 'commercial HVAC service'],
        contentPillar: 'THOUGHT_LEADERSHIP',
        priority: 'HIGH',
        estimatedHours: 12,
        actualHours: 14,
        campaignTag: 'Spring Maintenance Drive',
        seasonalTheme: 'Spring Preparation',
        calendarMetrics: {
          viewsFromCalendar: 2450,
          leadsFromCalendar: 12,
          schedulingAccuracy: 85
        }
      },
      {
        id: 'cal-2',
        title: 'Q2 Tax Planning Strategies for Multi-Entity Businesses',
        contentType: 'SERVICE_PAGE',
        status: 'SCHEDULED',
        plannedDate: '2024-03-25',
        publishDate: '2024-03-25',
        assignedTo: 'Jennifer Walsh',
        primaryBusiness: 'Premier Accounting Services',
        targetBusinesses: ['Premier Accounting Services', 'Corporate Law Partners'],
        sharedContent: true,
        focusKeywords: ['Q2 tax planning', 'multi-entity tax', 'business tax optimization'],
        contentPillar: 'PRODUCT_EDUCATION',
        priority: 'CRITICAL',
        estimatedHours: 8,
        campaignTag: 'Q2 Tax Season',
        seasonalTheme: 'Tax Season',
        calendarMetrics: {
          schedulingAccuracy: 95,
          resourceAllocation: 100,
          timelineAdherence: 98
        }
      }
    ]

    // Apply filters
    let filteredItems = mockCalendarItems

    if (validatedQuery.businessId && validatedQuery.businessId !== 'ALL') {
      filteredItems = filteredItems.filter(item => 
        item.primaryBusiness === validatedQuery.businessId ||
        item.targetBusinesses.includes(validatedQuery.businessId)
      )
    }

    if (validatedQuery.contentPillar && validatedQuery.contentPillar !== 'ALL') {
      filteredItems = filteredItems.filter(item => 
        item.contentPillar === validatedQuery.contentPillar
      )
    }

    if (validatedQuery.status) {
      filteredItems = filteredItems.filter(item => item.status === validatedQuery.status)
    }

    if (validatedQuery.dateRange) {
      const startDate = new Date(validatedQuery.dateRange.start)
      const endDate = new Date(validatedQuery.dateRange.end)
      
      filteredItems = filteredItems.filter(item => {
        const itemDate = new Date(item.plannedDate)
        return itemDate >= startDate && itemDate <= endDate
      })
    }

    // Calculate calendar metrics
    const calendarMetrics = {
      totalPlanned: filteredItems.length,
      thisMonth: filteredItems.filter(item => {
        const itemDate = new Date(item.plannedDate)
        const currentDate = new Date()
        return itemDate.getMonth() === currentDate.getMonth()
      }).length,
      inProgress: filteredItems.filter(item => item.status === 'IN_PROGRESS').length,
      sharedContent: filteredItems.filter(item => item.sharedContent).length,
      avgSchedulingAccuracy: filteredItems.reduce((acc, item) => 
        acc + (item.calendarMetrics?.schedulingAccuracy || 0), 0) / filteredItems.length || 0,
      totalEstimatedHours: filteredItems.reduce((acc, item) => acc + item.estimatedHours, 0),
      completionRate: filteredItems.filter(item => 
        ['PUBLISHED', 'SCHEDULED'].includes(item.status)
      ).length / filteredItems.length * 100 || 0
    }

    // Generate calendar recommendations
    const calendarRecommendations = [
      {
        type: 'RESOURCE_OPTIMIZATION',
        priority: 'HIGH',
        title: 'Content Resource Optimization',
        description: 'Sarah Johnson has 3 overlapping HVAC content pieces scheduled for next week. Consider redistributing to maintain quality.',
        actionable: true,
        estimatedImpact: 'Prevent resource burnout, maintain content quality',
        suggestedAction: 'Reschedule one piece to following week'
      },
      {
        type: 'CROSS_BUSINESS_OPPORTUNITY',
        priority: 'MEDIUM',
        title: 'Shared Content Opportunity',
        description: 'Tax planning content could be adapted for 2 additional businesses with minimal effort.',
        actionable: true,
        estimatedImpact: '3x content ROI with 2 hours adaptation',
        suggestedAction: 'Schedule adaptation task for Marketing and Consulting teams'
      },
      {
        type: 'SEASONAL_OPTIMIZATION',
        priority: 'MEDIUM',
        title: 'Seasonal Content Gap',
        description: 'Missing summer HVAC preparation content. Competitors are already scheduling.',
        actionable: true,
        estimatedImpact: 'Capture seasonal demand, improve market positioning',
        suggestedAction: 'Schedule summer prep content for April publication'
      }
    ]

    return NextResponse.json({
      success: true,
      data: {
        items: filteredItems,
        metrics: calendarMetrics,
        recommendations: calendarRecommendations,
        filters: validatedQuery
      }
    })

  } catch (error) {
    console.error('Content calendar API error:', error)
    
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
        error: 'Failed to fetch content calendar data' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = ContentCalendarItemSchema.parse(body)

    // Mock creation logic - in production, this would create in database
    const newCalendarItem = {
      id: `cal-${Date.now()}`,
      ...validatedData,
      status: 'PLANNED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      calendarMetrics: {
        schedulingAccuracy: 0,
        resourceAllocation: 0,
        timelineAdherence: 0
      }
    }

    // Generate AI-powered recommendations for the new content
    const contentRecommendations = [
      {
        type: 'KEYWORD_OPTIMIZATION',
        suggestion: 'Consider adding "enterprise" keyword for better B2B targeting',
        confidence: 87,
        estimatedImpact: '+15% organic traffic'
      },
      {
        type: 'TIMING_OPTIMIZATION',
        suggestion: 'Tuesday 9 AM publication typically performs 23% better for this content type',
        confidence: 92,
        estimatedImpact: '+23% initial engagement'
      },
      {
        type: 'CROSS_BUSINESS_POTENTIAL',
        suggestion: 'This content could be adapted for 2 other business units',
        confidence: 78,
        estimatedImpact: '3x content ROI potential'
      }
    ]

    return NextResponse.json({
      success: true,
      data: {
        item: newCalendarItem,
        recommendations: contentRecommendations
      },
      message: 'Content calendar item created successfully'
    })

  } catch (error) {
    console.error('Content calendar creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid content data', 
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create content calendar item' 
      },
      { status: 500 }
    )
  }
}