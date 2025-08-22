import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const LeadScoringRequestSchema = z.object({
  leadId: z.string(),
  leadData: z.object({
    name: z.string(),
    email: z.string().email(),
    company: z.string(),
    industryVertical: z.string(),
    companySize: z.enum(['STARTUP', 'SMB', 'MID_MARKET', 'ENTERPRISE']),
    revenue: z.number().min(0).optional(),
    decisionMakerLevel: z.enum(['OWNER', 'C_LEVEL', 'VP', 'MANAGER', 'INFLUENCER']),
    businessCount: z.number().min(1).max(50).optional(),
    businessComplexity: z.enum(['SIMPLE', 'MODERATE', 'COMPLEX', 'ENTERPRISE']).optional()
  }),
  behavioralData: z.object({
    websiteVisits: z.number().min(0).optional(),
    pageViews: z.number().min(0).optional(),
    timeOnSite: z.number().min(0).optional(), // seconds
    contentDownloads: z.number().min(0).optional(),
    emailOpens: z.number().min(0).optional(),
    emailClicks: z.number().min(0).optional(),
    demoRequested: z.boolean().optional(),
    pricingPageViews: z.number().min(0).optional(),
    calculatorUsage: z.boolean().optional()
  }).optional(),
  sourceData: z.object({
    primarySource: z.enum(['ORGANIC_SEARCH', 'PAID_SEARCH', 'SOCIAL', 'DIRECT', 'REFERRAL', 'EMAIL', 'CONTENT']),
    campaign: z.string().optional(),
    referrer: z.string().optional(),
    utm_source: z.string().optional(),
    utm_medium: z.string().optional(),
    utm_campaign: z.string().optional()
  }).optional()
})

const LeadScoringQuerySchema = z.object({
  leadId: z.string().optional(),
  scoreGrade: z.enum(['A', 'B', 'C', 'D', 'F']).optional(),
  readinessLevel: z.enum(['HOT', 'WARM', 'COLD', 'FROZEN']).optional(),
  industryVertical: z.string().optional(),
  minScore: z.number().min(0).max(100).optional(),
  maxScore: z.number().min(0).max(100).optional(),
  qualified: z.boolean().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = LeadScoringRequestSchema.parse(body)

    // Calculate lead score
    const leadScore = calculateLeadScore(validatedData)

    // Store lead score (in production, save to database)
    // await saveLeadScore(leadScore)

    return NextResponse.json({
      success: true,
      data: leadScore,
      message: 'Lead scored successfully'
    })

  } catch (error) {
    console.error('Lead scoring error:', error)
    
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
        error: 'Failed to calculate lead score' 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = {
      leadId: searchParams.get('leadId') || undefined,
      scoreGrade: searchParams.get('scoreGrade') || undefined,
      readinessLevel: searchParams.get('readinessLevel') || undefined,
      industryVertical: searchParams.get('industryVertical') || undefined,
      minScore: searchParams.get('minScore') ? parseInt(searchParams.get('minScore')!) : undefined,
      maxScore: searchParams.get('maxScore') ? parseInt(searchParams.get('maxScore')!) : undefined,
      qualified: searchParams.get('qualified') === 'true' ? true : searchParams.get('qualified') === 'false' ? false : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0
    }

    const validatedQuery = LeadScoringQuerySchema.parse(queryParams)

    // Mock lead scores data - in production, fetch from database
    const mockLeadScores = getMockLeadScores()
    
    // Apply filters
    let filteredScores = mockLeadScores
    
    if (validatedQuery.leadId) {
      filteredScores = filteredScores.filter(score => score.leadId === validatedQuery.leadId)
    }
    
    if (validatedQuery.scoreGrade) {
      filteredScores = filteredScores.filter(score => score.scoreGrade === validatedQuery.scoreGrade)
    }
    
    if (validatedQuery.readinessLevel) {
      filteredScores = filteredScores.filter(score => score.readinessLevel === validatedQuery.readinessLevel)
    }
    
    if (validatedQuery.industryVertical) {
      filteredScores = filteredScores.filter(score => score.industryVertical === validatedQuery.industryVertical)
    }
    
    if (validatedQuery.minScore !== undefined) {
      filteredScores = filteredScores.filter(score => score.totalScore >= validatedQuery.minScore!)
    }
    
    if (validatedQuery.maxScore !== undefined) {
      filteredScores = filteredScores.filter(score => score.totalScore <= validatedQuery.maxScore!)
    }
    
    if (validatedQuery.qualified !== undefined) {
      filteredScores = filteredScores.filter(score => score.isQualified === validatedQuery.qualified)
    }

    // Apply pagination
    const total = filteredScores.length
    const paginatedScores = filteredScores.slice(
      validatedQuery.offset, 
      validatedQuery.offset + validatedQuery.limit
    )

    // Calculate analytics
    const analytics = calculateAnalytics(filteredScores)

    return NextResponse.json({
      success: true,
      data: {
        leadScores: paginatedScores,
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
    console.error('Get lead scores error:', error)
    
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
        error: 'Failed to fetch lead scores' 
      },
      { status: 500 }
    )
  }
}

function calculateLeadScore(data: z.infer<typeof LeadScoringRequestSchema>) {
  let totalScore = 0
  const scoreBreakdown = {
    businessCountScore: 0,
    revenueScore: 0,
    industryFitScore: 0,
    technologyScore: 0,
    urgencyScore: 0,
    engagementScore: 0
  }

  // Business Count Score (0-30 points) - Most important for multi-business focus
  const businessCount = data.leadData.businessCount || 1
  if (businessCount >= 5) {
    scoreBreakdown.businessCountScore = 30
  } else if (businessCount >= 3) {
    scoreBreakdown.businessCountScore = 25
  } else if (businessCount >= 2) {
    scoreBreakdown.businessCountScore = 20
  } else {
    scoreBreakdown.businessCountScore = 10
  }

  // Revenue Score (0-25 points)
  const revenue = data.leadData.revenue || 0
  if (revenue >= 10000000) { // $10M+
    scoreBreakdown.revenueScore = 25
  } else if (revenue >= 5000000) { // $5M+
    scoreBreakdown.revenueScore = 22
  } else if (revenue >= 1000000) { // $1M+
    scoreBreakdown.revenueScore = 18
  } else if (revenue >= 500000) { // $500K+
    scoreBreakdown.revenueScore = 12
  } else {
    scoreBreakdown.revenueScore = 5
  }

  // Industry Fit Score (0-20 points)
  const industryScoring: { [key: string]: number } = {
    'Technology': 20,
    'Professional Services': 18,
    'Healthcare': 16,
    'Manufacturing': 15,
    'HVAC': 15,
    'Construction': 12,
    'Retail': 10,
    'Other': 8
  }
  scoreBreakdown.industryFitScore = industryScoring[data.leadData.industryVertical] || 8

  // Company Size Score (integrated into technology score)
  let companySizeMultiplier = 1.0
  switch (data.leadData.companySize) {
    case 'ENTERPRISE':
      companySizeMultiplier = 1.5
      break
    case 'MID_MARKET':
      companySizeMultiplier = 1.3
      break
    case 'SMB':
      companySizeMultiplier = 1.1
      break
    case 'STARTUP':
      companySizeMultiplier = 0.8
      break
  }

  // Technology Score (0-15 points) - includes company size impact
  let baseTechScore = 10
  if (data.leadData.businessComplexity === 'ENTERPRISE') {
    baseTechScore = 15
  } else if (data.leadData.businessComplexity === 'COMPLEX') {
    baseTechScore = 12
  } else if (data.leadData.businessComplexity === 'MODERATE') {
    baseTechScore = 8
  } else {
    baseTechScore = 5
  }
  scoreBreakdown.technologyScore = Math.round(baseTechScore * companySizeMultiplier)

  // Decision Maker Level Impact (affects urgency score)
  let decisionMakerMultiplier = 1.0
  switch (data.leadData.decisionMakerLevel) {
    case 'OWNER':
    case 'C_LEVEL':
      decisionMakerMultiplier = 1.5
      break
    case 'VP':
      decisionMakerMultiplier = 1.2
      break
    case 'MANAGER':
      decisionMakerMultiplier = 1.0
      break
    case 'INFLUENCER':
      decisionMakerMultiplier = 0.7
      break
  }

  // Urgency Score (0-10 points) - includes decision maker impact
  scoreBreakdown.urgencyScore = Math.round(8 * decisionMakerMultiplier)

  // Engagement Score (0-20 points) based on behavioral data
  if (data.behavioralData) {
    const behavioral = data.behavioralData
    let engagementPoints = 0

    // Website engagement
    if (behavioral.websiteVisits && behavioral.websiteVisits > 5) engagementPoints += 3
    if (behavioral.pageViews && behavioral.pageViews > 10) engagementPoints += 2
    if (behavioral.timeOnSite && behavioral.timeOnSite > 300) engagementPoints += 2 // 5+ minutes

    // Content engagement
    if (behavioral.contentDownloads && behavioral.contentDownloads > 0) engagementPoints += 3
    if (behavioral.emailOpens && behavioral.emailOpens > 3) engagementPoints += 2
    if (behavioral.emailClicks && behavioral.emailClicks > 1) engagementPoints += 2

    // High-intent actions
    if (behavioral.demoRequested) engagementPoints += 5
    if (behavioral.pricingPageViews && behavioral.pricingPageViews > 0) engagementPoints += 3
    if (behavioral.calculatorUsage) engagementPoints += 4

    scoreBreakdown.engagementScore = Math.min(20, engagementPoints)
  }

  // Calculate total score
  totalScore = Object.values(scoreBreakdown).reduce((sum, score) => sum + score, 0)

  // Determine grade and readiness level
  const scoreGrade = getScoreGrade(totalScore)
  const readinessLevel = getReadinessLevel(totalScore, data.behavioralData)
  const conversionProbability = calculateConversionProbability(totalScore, scoreBreakdown)

  // AI predictions
  const aiPredictions = generateAIPredictions(totalScore, scoreBreakdown, data)

  return {
    id: `score-${Date.now()}`,
    leadId: data.leadId,
    totalScore,
    scoreGrade,
    conversionProbability,
    readinessLevel,
    ...scoreBreakdown,
    
    // Progressive Pricing Indicators
    pricingSensitivity: calculatePricingSensitivity(data),
    budgetAlignment: calculateBudgetAlignment(data),
    
    // Lead Demographics
    companySize: data.leadData.companySize,
    decisionMakerLevel: data.leadData.decisionMakerLevel,
    industryVertical: data.leadData.industryVertical,
    businessComplexity: data.leadData.businessComplexity || 'MODERATE',
    
    // Behavioral flags
    demoRequested: data.behavioralData?.demoRequested || false,
    
    // AI Predictions
    aiConfidenceLevel: aiPredictions.confidence,
    aiRecommendedAction: aiPredictions.recommendedAction,
    aiPredictedTimeline: aiPredictions.timeline,
    aiExpectedRevenue: aiPredictions.expectedRevenue,
    
    // Source Attribution
    sourceChannel: data.sourceData?.primarySource || 'UNKNOWN',
    sourceSpecific: data.sourceData?.utm_source || 'UNKNOWN',
    
    // Qualification Status
    isQualified: totalScore >= 70,
    qualifiedAt: totalScore >= 70 ? new Date() : null,
    
    // Scoring Metadata
    lastScoreUpdate: new Date(),
    scoreChange: 0, // Would be calculated against previous score
    
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

function getScoreGrade(totalScore: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (totalScore >= 85) return 'A'
  if (totalScore >= 70) return 'B'
  if (totalScore >= 55) return 'C'
  if (totalScore >= 40) return 'D'
  return 'F'
}

function getReadinessLevel(totalScore: number, behavioralData?: any): 'HOT' | 'WARM' | 'COLD' | 'FROZEN' {
  const hasHighIntent = behavioralData?.demoRequested || behavioralData?.calculatorUsage || 
                       (behavioralData?.pricingPageViews && behavioralData.pricingPageViews > 2)
  
  if (totalScore >= 80 && hasHighIntent) return 'HOT'
  if (totalScore >= 70 || hasHighIntent) return 'WARM'
  if (totalScore >= 40) return 'COLD'
  return 'FROZEN'
}

function calculateConversionProbability(totalScore: number, scoreBreakdown: any): number {
  // Base conversion probability from score
  let probability = Math.min(95, totalScore * 0.9)
  
  // Boost for multi-business leads
  if (scoreBreakdown.businessCountScore >= 20) {
    probability += 10
  }
  
  // Boost for high engagement
  if (scoreBreakdown.engagementScore >= 15) {
    probability += 8
  }
  
  // Boost for high revenue
  if (scoreBreakdown.revenueScore >= 20) {
    probability += 5
  }
  
  return Math.min(95, Math.max(5, probability))
}

function calculatePricingSensitivity(data: z.infer<typeof LeadScoringRequestSchema>): number {
  let sensitivity = 0.5 // Default neutral
  
  // Company size impact
  switch (data.leadData.companySize) {
    case 'ENTERPRISE':
      sensitivity = 0.2
      break
    case 'MID_MARKET':
      sensitivity = 0.3
      break
    case 'SMB':
      sensitivity = 0.6
      break
    case 'STARTUP':
      sensitivity = 0.8
      break
  }
  
  // Business count impact (more businesses = less price sensitive)
  const businessCount = data.leadData.businessCount || 1
  if (businessCount >= 3) {
    sensitivity = Math.max(0.1, sensitivity - 0.2)
  }
  
  return Math.round(sensitivity * 100)
}

function calculateBudgetAlignment(data: z.infer<typeof LeadScoringRequestSchema>): number {
  let alignment = 0.5 // Default neutral
  
  // Revenue-based alignment
  const revenue = data.leadData.revenue || 0
  if (revenue >= 5000000) {
    alignment = 0.9
  } else if (revenue >= 1000000) {
    alignment = 0.7
  } else if (revenue >= 500000) {
    alignment = 0.5
  } else {
    alignment = 0.3
  }
  
  return Math.round(alignment * 100)
}

function generateAIPredictions(totalScore: number, scoreBreakdown: any, data: z.infer<typeof LeadScoringRequestSchema>) {
  let confidence = Math.min(95, Math.max(60, totalScore * 0.8 + 20))
  let recommendedAction = 'NURTURE'
  let timeline = 'THIS_QUARTER'
  let expectedRevenue = 50000

  // Determine recommended action
  if (totalScore >= 80) {
    recommendedAction = 'IMMEDIATE_CONTACT'
    timeline = 'THIS_WEEK'
  } else if (totalScore >= 65) {
    recommendedAction = 'QUALIFY'
    timeline = 'THIS_MONTH'
  } else if (totalScore >= 45) {
    recommendedAction = 'NURTURE'
    timeline = 'THIS_QUARTER'
  } else {
    recommendedAction = 'DISQUALIFY'
    timeline = 'LONG_TERM'
  }

  // Calculate expected revenue
  const businessCount = data.leadData.businessCount || 1
  const revenue = data.leadData.revenue || 0
  
  // Base revenue on business count and size
  let baseRevenue = businessCount * 15000 // $15K per business base
  
  // Adjust for company size
  switch (data.leadData.companySize) {
    case 'ENTERPRISE':
      baseRevenue *= 8
      break
    case 'MID_MARKET':
      baseRevenue *= 4
      break
    case 'SMB':
      baseRevenue *= 2
      break
    case 'STARTUP':
      baseRevenue *= 0.8
      break
  }
  
  // Adjust for total score (quality of lead)
  baseRevenue *= (totalScore / 100)
  
  expectedRevenue = Math.round(baseRevenue)

  return {
    confidence: Math.round(confidence),
    recommendedAction,
    timeline,
    expectedRevenue
  }
}

function getMockLeadScores() {
  return [
    {
      id: 'score-001',
      leadId: 'lead-001',
      totalScore: 92,
      scoreGrade: 'A',
      conversionProbability: 87,
      readinessLevel: 'HOT',
      businessCountScore: 25,
      revenueScore: 23,
      industryFitScore: 18,
      technologyScore: 14,
      urgencyScore: 12,
      engagementScore: 20,
      pricingSensitivity: 30,
      budgetAlignment: 90,
      companySize: 'MID_MARKET',
      decisionMakerLevel: 'C_LEVEL',
      industryVertical: 'Technology',
      businessComplexity: 'COMPLEX',
      demoRequested: true,
      aiConfidenceLevel: 92,
      aiRecommendedAction: 'IMMEDIATE_CONTACT',
      aiPredictedTimeline: 'THIS_WEEK',
      aiExpectedRevenue: 285000,
      sourceChannel: 'ORGANIC_SEARCH',
      sourceSpecific: 'GOOGLE',
      isQualified: true,
      lastScoreUpdate: new Date('2024-03-20'),
      scoreChange: 15
    }
    // Add more mock data as needed
  ]
}

function calculateAnalytics(leadScores: any[]) {
  const total = leadScores.length
  const qualified = leadScores.filter(score => score.isQualified).length
  
  const gradeDistribution = {
    A: leadScores.filter(score => score.scoreGrade === 'A').length,
    B: leadScores.filter(score => score.scoreGrade === 'B').length,
    C: leadScores.filter(score => score.scoreGrade === 'C').length,
    D: leadScores.filter(score => score.scoreGrade === 'D').length,
    F: leadScores.filter(score => score.scoreGrade === 'F').length
  }
  
  const avgScore = total > 0 ? 
    leadScores.reduce((sum, score) => sum + score.totalScore, 0) / total : 0
    
  const avgRevenue = leadScores.filter(score => score.aiExpectedRevenue).length > 0 ?
    leadScores.reduce((sum, score) => sum + (score.aiExpectedRevenue || 0), 0) / 
    leadScores.filter(score => score.aiExpectedRevenue).length : 0

  return {
    totalLeads: total,
    qualifiedLeads: qualified,
    qualificationRate: total > 0 ? Math.round((qualified / total) * 100) : 0,
    averageScore: Math.round(avgScore),
    gradeDistribution,
    averageExpectedRevenue: Math.round(avgRevenue)
  }
}