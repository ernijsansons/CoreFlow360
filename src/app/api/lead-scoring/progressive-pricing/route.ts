import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const ProgressivePricingCorrelationSchema = z.object({
  leadId: z.string(),
  businessCount: z.number().min(1).max(20),
  revenue: z.number().min(0),
  industryVertical: z.string(),
  companySize: z.enum(['STARTUP', 'SMB', 'MID_MARKET', 'ENTERPRISE']),
  decisionMakerLevel: z.enum(['OWNER', 'C_LEVEL', 'VP', 'MANAGER', 'INFLUENCER']),
  urgencyLevel: z.enum(['URGENT', 'MODERATE', 'NICE_TO_HAVE', 'FUTURE']),
  budgetRange: z.enum(['UNDER_10K', '10K_50K', '50K_100K', '100K_500K', '500K_PLUS']).optional(),
  currentSolutions: z.array(z.string()).optional(),
  painPoints: z.array(z.string()).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = ProgressivePricingCorrelationSchema.parse(body)

    // Calculate progressive pricing correlation score
    const pricingCorrelation = calculatePricingCorrelation(validatedData)

    return NextResponse.json({
      success: true,
      data: pricingCorrelation
    })

  } catch (error) {
    console.error('Progressive pricing correlation error:', error)
    
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
        error: 'Failed to calculate pricing correlation' 
      },
      { status: 500 }
    )
  }
}

function calculatePricingCorrelation(data: z.infer<typeof ProgressivePricingCorrelationSchema>) {
  let baseScore = 0
  let pricingSensitivity = 0.5 // Default neutral sensitivity
  let discountEligibility = 0
  let recommendedTier = 'INTELLIGENT'

  // Business Count Correlation (Most Important Factor)
  if (data.businessCount >= 5) {
    baseScore += 30
    pricingSensitivity = 0.1 // Very low sensitivity for high business count
    discountEligibility = 50 // Maximum discount
    recommendedTier = 'AUTONOMOUS'
  } else if (data.businessCount >= 3) {
    baseScore += 25
    pricingSensitivity = 0.2
    discountEligibility = 35
    recommendedTier = 'AUTONOMOUS'
  } else if (data.businessCount >= 2) {
    baseScore += 20
    pricingSensitivity = 0.3
    discountEligibility = 20
    recommendedTier = 'INTELLIGENT_PRO'
  } else {
    baseScore += 10
    pricingSensitivity = 0.7
    discountEligibility = 0
    recommendedTier = 'INTELLIGENT'
  }

  // Revenue Size Correlation
  if (data.revenue >= 10000000) { // $10M+
    baseScore += 25
    pricingSensitivity = Math.max(0.1, pricingSensitivity - 0.1)
    discountEligibility += 15
  } else if (data.revenue >= 5000000) { // $5M+
    baseScore += 20
    pricingSensitivity = Math.max(0.2, pricingSensitivity - 0.05)
    discountEligibility += 10
  } else if (data.revenue >= 1000000) { // $1M+
    baseScore += 15
    discountEligibility += 5
  } else {
    baseScore += 5
    pricingSensitivity = Math.min(0.8, pricingSensitivity + 0.1)
  }

  // Company Size Impact
  switch (data.companySize) {
    case 'ENTERPRISE':
      baseScore += 20
      pricingSensitivity = Math.max(0.1, pricingSensitivity - 0.2)
      discountEligibility += 10
      break
    case 'MID_MARKET':
      baseScore += 15
      pricingSensitivity = Math.max(0.2, pricingSensitivity - 0.1)
      discountEligibility += 5
      break
    case 'SMB':
      baseScore += 10
      break
    case 'STARTUP':
      baseScore += 5
      pricingSensitivity = Math.min(0.9, pricingSensitivity + 0.2)
      break
  }

  // Decision Maker Level Impact
  switch (data.decisionMakerLevel) {
    case 'OWNER':
    case 'C_LEVEL':
      baseScore += 15
      pricingSensitivity = Math.max(0.1, pricingSensitivity - 0.1)
      break
    case 'VP':
      baseScore += 10
      pricingSensitivity = Math.max(0.2, pricingSensitivity - 0.05)
      break
    case 'MANAGER':
      baseScore += 5
      break
    case 'INFLUENCER':
      baseScore += 2
      pricingSensitivity = Math.min(0.8, pricingSensitivity + 0.1)
      break
  }

  // Industry Vertical Correlation
  const industryMultipliers: { [key: string]: number } = {
    'Technology': 1.2,
    'Professional Services': 1.15,
    'Healthcare': 1.1,
    'Manufacturing': 1.05,
    'HVAC': 1.0,
    'Construction': 0.95,
    'Retail': 0.9
  }

  const industryMultiplier = industryMultipliers[data.industryVertical] || 1.0
  baseScore *= industryMultiplier

  // Urgency Level Impact
  switch (data.urgencyLevel) {
    case 'URGENT':
      baseScore += 10
      pricingSensitivity = Math.max(0.1, pricingSensitivity - 0.2)
      break
    case 'MODERATE':
      baseScore += 5
      pricingSensitivity = Math.max(0.2, pricingSensitivity - 0.1)
      break
    case 'NICE_TO_HAVE':
      // No change
      break
    case 'FUTURE':
      baseScore -= 5
      pricingSensitivity = Math.min(0.9, pricingSensitivity + 0.1)
      break
  }

  // Budget Range Correlation
  if (data.budgetRange) {
    switch (data.budgetRange) {
      case '500K_PLUS':
        baseScore += 15
        pricingSensitivity = Math.max(0.1, pricingSensitivity - 0.2)
        discountEligibility += 20
        break
      case '100K_500K':
        baseScore += 12
        pricingSensitivity = Math.max(0.2, pricingSensitivity - 0.1)
        discountEligibility += 15
        break
      case '50K_100K':
        baseScore += 8
        discountEligibility += 10
        break
      case '10K_50K':
        baseScore += 5
        discountEligibility += 5
        break
      case 'UNDER_10K':
        baseScore += 2
        pricingSensitivity = Math.min(0.9, pricingSensitivity + 0.2)
        break
    }
  }

  // Calculate final discount eligibility
  discountEligibility = Math.min(50, Math.max(0, discountEligibility))

  // Determine price sensitivity level
  let sensitivityLevel: string
  if (pricingSensitivity <= 0.2) {
    sensitivityLevel = 'LOW'
  } else if (pricingSensitivity <= 0.4) {
    sensitivityLevel = 'MODERATE'
  } else if (pricingSensitivity <= 0.6) {
    sensitivityLevel = 'HIGH'
  } else {
    sensitivityLevel = 'VERY_HIGH'
  }

  // Calculate estimated pricing
  const basePricing = {
    INTELLIGENT: { perUser: 12, businesses: [1] },
    INTELLIGENT_PRO: { perUser: 28, businesses: [2, 3] },
    AUTONOMOUS: { perUser: 52, businesses: [4, 5, 6] },
    ADVANCED: { perUser: 128, businesses: [7, 8, 9, 10] }
  }

  const selectedTierData = basePricing[recommendedTier as keyof typeof basePricing]
  const estimatedUsers = Math.max(10, data.businessCount * 8) // Estimate 8 users per business
  const basePrice = selectedTierData.perUser * estimatedUsers
  const discountAmount = basePrice * (discountEligibility / 100)
  const finalPrice = basePrice - discountAmount

  // Progressive discount calculation
  let progressiveDiscount = 0
  if (data.businessCount >= 5) {
    progressiveDiscount = 50
  } else if (data.businessCount >= 4) {
    progressiveDiscount = 45
  } else if (data.businessCount >= 3) {
    progressiveDiscount = 35
  } else if (data.businessCount >= 2) {
    progressiveDiscount = 20
  }

  const progressivePrice = basePrice * (1 - progressiveDiscount / 100)

  // ROI Calculation
  const estimatedROI = calculateEstimatedROI(data.businessCount, data.revenue, finalPrice)

  // Generate AI insights and recommendations
  const aiInsights = generateAIInsights(data, baseScore, pricingSensitivity, discountEligibility)

  return {
    leadId: data.leadId,
    pricingScore: Math.round(baseScore),
    pricingSensitivity: Math.round(pricingSensitivity * 100),
    sensitivityLevel,
    discountEligibility: Math.round(discountEligibility),
    recommendedTier,
    
    // Pricing Estimates
    pricing: {
      basePriceMonthly: Math.round(basePrice),
      discountedPriceMonthly: Math.round(finalPrice),
      progressivePriceMonthly: Math.round(progressivePrice),
      discountAmount: Math.round(discountAmount),
      progressiveDiscount,
      estimatedUsers,
      annualSavings: Math.round((basePrice - progressivePrice) * 12)
    },
    
    // ROI Projections
    roi: estimatedROI,
    
    // AI Insights
    insights: aiInsights,
    
    // Calculated at
    calculatedAt: new Date().toISOString()
  }
}

function calculateEstimatedROI(businessCount: number, revenue: number, monthlyPrice: number) {
  // ROI calculation based on multi-business efficiency gains
  const efficiencyGains = {
    operationalEfficiency: businessCount * 0.08, // 8% per business
    crossBusinessSynergies: Math.max(0, (businessCount - 1) * 0.05), // 5% per additional business
    dataConsolidation: businessCount * 0.03, // 3% per business
    processAutomation: businessCount * 0.12 // 12% per business
  }

  const totalEfficiencyGain = Object.values(efficiencyGains).reduce((sum, gain) => sum + gain, 0)
  const annualSavings = revenue * totalEfficiencyGain
  const annualCost = monthlyPrice * 12
  const netBenefit = annualSavings - annualCost
  const roiPercentage = (netBenefit / annualCost) * 100

  return {
    annualSavings: Math.round(annualSavings),
    annualCost: Math.round(annualCost),
    netBenefit: Math.round(netBenefit),
    roiPercentage: Math.round(roiPercentage),
    paybackPeriod: Math.round((annualCost / (annualSavings / 12)) * 10) / 10, // months
    efficiencyGains
  }
}

function generateAIInsights(
  data: z.infer<typeof ProgressivePricingCorrelationSchema>, 
  score: number, 
  sensitivity: number, 
  discount: number
) {
  const insights = []

  // Business count insights
  if (data.businessCount >= 3) {
    insights.push({
      type: 'MULTI_BUSINESS_OPPORTUNITY',
      title: 'Strong Multi-Business Profile',
      description: `With ${data.businessCount} businesses, this lead shows excellent potential for progressive pricing benefits.`,
      recommendation: 'Emphasize cross-business synergies and volume discounts.',
      impact: 'HIGH',
      confidence: 0.9
    })
  }

  // Pricing sensitivity insights
  if (sensitivity <= 0.3) {
    insights.push({
      type: 'LOW_PRICE_SENSITIVITY',
      title: 'Value-Focused Buyer',
      description: 'Low price sensitivity indicates focus on value over cost.',
      recommendation: 'Lead with ROI and business transformation benefits.',
      impact: 'HIGH',
      confidence: 0.85
    })
  } else if (sensitivity >= 0.7) {
    insights.push({
      type: 'HIGH_PRICE_SENSITIVITY',
      title: 'Cost-Conscious Buyer',
      description: 'High price sensitivity requires careful pricing strategy.',
      recommendation: 'Lead with progressive discounts and cost savings.',
      impact: 'MEDIUM',
      confidence: 0.8
    })
  }

  // Discount eligibility insights
  if (discount >= 30) {
    insights.push({
      type: 'HIGH_DISCOUNT_ELIGIBILITY',
      title: 'Premium Discount Qualified',
      description: `Qualifies for up to ${discount}% discount based on profile.`,
      recommendation: 'Present progressive pricing calculator early in sales process.',
      impact: 'HIGH',
      confidence: 0.95
    })
  }

  // Revenue-based insights
  if (data.revenue >= 5000000) {
    insights.push({
      type: 'HIGH_VALUE_PROSPECT',
      title: 'Enterprise Revenue Profile',
      description: 'High revenue suggests strong budget and decision-making authority.',
      recommendation: 'Fast-track to senior sales team and enterprise pricing.',
      impact: 'HIGH',
      confidence: 0.9
    })
  }

  // Decision maker insights
  if (data.decisionMakerLevel === 'OWNER' || data.decisionMakerLevel === 'C_LEVEL') {
    insights.push({
      type: 'DECISION_MAKER_AUTHORITY',
      title: 'Direct Decision Authority',
      description: 'Contact has direct decision-making authority.',
      recommendation: 'Focus on strategic benefits and executive-level ROI.',
      impact: 'HIGH',
      confidence: 0.92
    })
  }

  // Urgency insights
  if (data.urgencyLevel === 'URGENT') {
    insights.push({
      type: 'HIGH_URGENCY',
      title: 'Urgent Implementation Need',
      description: 'High urgency indicates immediate pain points.',
      recommendation: 'Expedite sales process and offer implementation fast-track.',
      impact: 'HIGH',
      confidence: 0.88
    })
  }

  return insights
}

// Get pricing correlation for existing lead
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get('leadId')

    if (!leadId) {
      return NextResponse.json(
        { success: false, error: 'Lead ID is required' },
        { status: 400 }
      )
    }

    // Mock pricing correlation data - in production, fetch from database
    const mockCorrelation = {
      leadId,
      pricingScore: 78,
      pricingSensitivity: 35,
      sensitivityLevel: 'MODERATE',
      discountEligibility: 25,
      recommendedTier: 'INTELLIGENT_PRO',
      
      pricing: {
        basePriceMonthly: 1120,
        discountedPriceMonthly: 840,
        progressivePriceMonthly: 728,
        discountAmount: 280,
        progressiveDiscount: 35,
        estimatedUsers: 40,
        annualSavings: 4704
      },
      
      roi: {
        annualSavings: 285000,
        annualCost: 10080,
        netBenefit: 274920,
        roiPercentage: 2728,
        paybackPeriod: 0.4,
        efficiencyGains: {
          operationalEfficiency: 0.24,
          crossBusinessSynergies: 0.10,
          dataConsolidation: 0.09,
          processAutomation: 0.36
        }
      },
      
      insights: [
        {
          type: 'MULTI_BUSINESS_OPPORTUNITY',
          title: 'Strong Multi-Business Profile',
          description: 'With 3 businesses, this lead shows excellent potential for progressive pricing benefits.',
          recommendation: 'Emphasize cross-business synergies and volume discounts.',
          impact: 'HIGH',
          confidence: 0.9
        }
      ],
      
      calculatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: mockCorrelation
    })

  } catch (error) {
    console.error('Get pricing correlation error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get pricing correlation' 
      },
      { status: 500 }
    )
  }
}