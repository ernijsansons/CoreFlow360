import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validate required fields
    const requiredFields = [
      'companyName',
      'primaryContactName', 
      'primaryContactEmail',
      'partnerType',
      'targetMarket'
    ]
    
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }
    
    // Calculate initial partner tier based on application
    let initialTier = 'bronze'
    if (data.annualRevenue === '1m-5m' || data.annualRevenue === '5m+') {
      initialTier = 'silver'
    }
    if (data.certifiedStaff >= 5 && data.expectedMonthlyDeals === '11-20') {
      initialTier = 'gold'
    }
    
    // Generate partner ID and access credentials
    const partnerId = `PRT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const apiKey = `pk_${Math.random().toString(36).substr(2, 32)}`
    
    // Mock partner creation response
    const partner = {
      id: partnerId,
      companyName: data.companyName,
      slug: data.companyName.toLowerCase().replace(/\s+/g, '-'),
      partnerType: data.partnerType,
      partnerTier: initialTier,
      status: 'pending_review',
      
      primaryContactName: data.primaryContactName,
      primaryContactEmail: data.primaryContactEmail,
      primaryContactPhone: data.primaryContactPhone,
      primaryContactRole: data.primaryContactRole,
      
      businessDetails: {
        targetMarket: data.targetMarket,
        currentClients: data.currentClients,
        annualRevenue: data.annualRevenue,
        certifiedStaff: data.certifiedStaff,
        companySize: data.companySize,
        industry: data.industry,
        yearsFounded: data.yearsFounded
      },
      
      capabilities: {
        technical: data.technicalCapabilities || [],
        industry: data.industryExpertise || [],
        services: data.serviceOfferings || []
      },
      
      goals: {
        partnershipGoals: data.partnershipGoals,
        expectedMonthlyDeals: data.expectedMonthlyDeals,
        marketingBudget: data.marketingBudget,
        dedicatedResources: data.dedicatedResources
      },
      
      agreements: {
        termsAccepted: data.agreedToTerms,
        commissionAccepted: data.agreedToCommission,
        trainingAccepted: data.agreedToTraining,
        minimumsAccepted: data.agreedToMinimums
      },
      
      onboarding: {
        status: 'pending_review',
        submittedAt: new Date().toISOString(),
        estimatedReviewTime: '24-48 hours',
        nextSteps: [
          'Application review by partner team',
          'Background verification',
          'Initial consultation call',
          'Partner agreement execution',
          'Portal access provisioning'
        ]
      },
      
      credentials: {
        partnerId,
        apiKey,
        portalUrl: `https://partners.coreflow360.com/${data.companyName.toLowerCase().replace(/\s+/g, '-')}`,
        trainingUrl: 'https://academy.coreflow360.com/partners'
      }
    }
    
    // Send notification email (mock)
    console.log('Sending partner application notification:', {
      to: data.primaryContactEmail,
      subject: 'Welcome to CoreFlow360 Partner Program - Application Received',
      partnerId
    })
    
    // Send internal notification (mock)
    console.log('Notifying partner team of new application:', {
      partnerName: data.companyName,
      tier: initialTier,
      type: data.partnerType
    })
    
    return NextResponse.json({
      success: true,
      message: 'Partner application submitted successfully',
      partner,
      nextSteps: {
        immediate: [
          'Check your email for confirmation',
          'Schedule onboarding call',
          'Begin foundation training'
        ],
        within24Hours: [
          'Receive partner portal access',
          'Get training materials',
          'Connect with partner success manager'
        ],
        firstWeek: [
          'Complete foundation certification',
          'Set up first client demo',
          'Join partner community'
        ]
      }
    })
    
  } catch (error) {
    console.error('Partner onboarding error:', error)
    return NextResponse.json(
      { error: 'Failed to process partner application' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get('status') || 'all'
  
  // Mock data for partner applications
  const applications = [
    {
      id: 'PRT-001',
      companyName: 'TechSolutions Inc.',
      partnerType: 'integrator',
      status: 'approved',
      submittedAt: '2024-06-15',
      tier: 'gold'
    },
    {
      id: 'PRT-002', 
      companyName: 'Digital Dynamics',
      partnerType: 'agency',
      status: 'pending_review',
      submittedAt: '2024-06-28',
      tier: 'silver'
    },
    {
      id: 'PRT-003',
      companyName: 'CloudFirst Consulting',
      partnerType: 'consultant',
      status: 'in_review',
      submittedAt: '2024-06-30',
      tier: 'bronze'
    }
  ]
  
  const filtered = status === 'all' 
    ? applications 
    : applications.filter(app => app.status === status)
  
  return NextResponse.json({
    applications: filtered,
    total: filtered.length,
    stats: {
      pending: applications.filter(a => a.status === 'pending_review').length,
      inReview: applications.filter(a => a.status === 'in_review').length,
      approved: applications.filter(a => a.status === 'approved').length
    }
  })
}