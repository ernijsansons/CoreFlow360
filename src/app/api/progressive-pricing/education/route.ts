import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const module = searchParams.get('module') || 'overview'
  
  try {
    // Progressive pricing education content
    const educationContent = {
      overview: {
        title: "Progressive Pricing: The Multi-Business Advantage",
        description: "Learn how progressive pricing rewards business growth with exponential savings",
        keyPoints: [
          "Save 20-50% as you add more businesses",
          "Discounts apply retroactively to ALL businesses",
          "Designed specifically for portfolio entrepreneurs",
          "No penalties for growth - rewards for scale"
        ],
        videoUrl: "/videos/progressive-pricing-overview.mp4",
        duration: "3 minutes"
      },
      
      fundamentals: {
        title: "How Progressive Pricing Works",
        description: "Understanding the mechanics of portfolio-based pricing",
        content: {
          concept: "Traditional software charges full price for each business. Progressive pricing recognizes that portfolio entrepreneurs deserve volume discounts.",
          tiers: [
            { businesses: 1, discount: 0, description: "Standard pricing for single business" },
            { businesses: 2, discount: 20, description: "20% off all businesses when you add your second" },
            { businesses: 3, discount: 35, description: "35% off everything with three businesses" },
            { businesses: 4, discount: 45, description: "45% off your entire portfolio" },
            { businesses: "5+", discount: 50, description: "Maximum 50% discount for enterprise portfolios" }
          ],
          retroactive: "When you qualify for a higher discount tier, it applies to ALL your businesses immediately, not just new ones."
        },
        calculator: {
          enabled: true,
          defaultValues: {
            businesses: 3,
            employeesPerBusiness: 15
          }
        }
      },
      
      roi_analysis: {
        title: "ROI Analysis & Business Impact",
        description: "See the financial impact of progressive pricing on your business portfolio",
        scenarios: [
          {
            name: "HVAC Service Empire",
            businesses: 4,
            industry: "HVAC",
            employees: 65,
            currentCosts: 8400,
            progressiveCosts: 4620,
            annualSavings: 45360,
            additionalBenefits: {
              unifiedScheduling: 125000,
              crossLocationOptimization: 85000,
              sharedInventory: 65000
            }
          },
          {
            name: "Professional Services Group",
            businesses: 3,
            industry: "Professional Services",
            employees: 45,
            currentCosts: 5400,
            progressiveCosts: 3510,
            annualSavings: 22680,
            additionalBenefits: {
              crossSelling: 175000,
              unifiedClientData: 95000,
              streamlinedBilling: 45000
            }
          },
          {
            name: "Technology Portfolio",
            businesses: 6,
            industry: "Technology",
            employees: 120,
            currentCosts: 14400,
            progressiveCosts: 7200,
            annualSavings: 86400,
            additionalBenefits: {
              unifiedAnalytics: 225000,
              sharedResources: 155000,
              portfolioInvestorReporting: 85000
            }
          }
        ]
      },
      
      success_stories: {
        title: "Real Customer Success Stories",
        description: "How entrepreneurs are saving and growing with progressive pricing",
        stories: [
          {
            customer: "Sarah's Restaurant Group",
            businesses: 4,
            type: "QSR Franchises",
            quote: "Progressive pricing saved us over $45,000 in the first year. We reinvested those savings into opening our fifth location.",
            results: {
              annualSavings: 45000,
              reinvestment: "New location opening",
              roiIncrease: "340%",
              timeToPayback: "3.2 months"
            },
            beforeAfter: {
              before: {
                systems: "4 separate POS systems, manual inventory, scattered customer data",
                costs: "$8,400/month software costs",
                efficiency: "65% operational efficiency"
              },
              after: {
                systems: "Unified operations across all locations",
                costs: "$4,620/month (45% savings)",
                efficiency: "89% operational efficiency"
              }
            }
          },
          {
            customer: "Anderson HVAC Empire",
            businesses: 3,
            type: "Service Locations",
            quote: "The progressive pricing model finally treats us like the multi-business operation we are. The 35% discount plus operational efficiencies have transformed our business.",
            results: {
              annualSavings: 28000,
              reinvestment: "Marketing & equipment",
              roiIncrease: "280%",
              timeToPayback: "2.8 months"
            },
            beforeAfter: {
              before: {
                systems: "Separate scheduling at each location, manual dispatch",
                costs: "$5,100/month across systems",
                efficiency: "68% technician utilization"
              },
              after: {
                systems: "Unified scheduling, automated dispatch optimization",
                costs: "$3,315/month (35% savings)",
                efficiency: "87% technician utilization"
              }
            }
          }
        ]
      },
      
      competitive_analysis: {
        title: "Progressive vs Traditional Pricing",
        description: "How progressive pricing stacks up against traditional software licensing",
        comparison: {
          traditional: {
            model: "Per-user or per-business pricing",
            growth_impact: "Costs increase linearly with growth",
            discounts: "Volume discounts rare, usually 5-10% at enterprise level",
            multi_business: "Each business treated separately",
            integration: "Additional costs for integration",
            example_cost: "$150/user/month × businesses"
          },
          progressive: {
            model: "Portfolio-based progressive discounts",
            growth_impact: "Costs decrease as portfolio grows",
            discounts: "Automatic 20-50% discounts",
            multi_business: "Portfolio treated as unified entity",
            integration: "Included in base pricing",
            example_cost: "$75-120/user/month depending on portfolio size"
          }
        },
        breakeven_analysis: {
          single_business: {
            traditional: 1800,
            progressive: 1800,
            difference: 0
          },
          two_businesses: {
            traditional: 3600,
            progressive: 2880,
            difference: 720,
            savings_percent: 20
          },
          three_businesses: {
            traditional: 5400,
            progressive: 3510,
            difference: 1890,
            savings_percent: 35
          },
          five_businesses: {
            traditional: 9000,
            progressive: 4500,
            difference: 4500,
            savings_percent: 50
          }
        }
      },
      
      implementation: {
        title: "Getting Started with Progressive Pricing",
        description: "Step-by-step guide to implementing progressive pricing for your portfolio",
        steps: [
          {
            step: 1,
            title: "Portfolio Assessment",
            description: "Audit your current business portfolio and software costs",
            tasks: [
              "List all businesses in your portfolio",
              "Document current software costs per business",
              "Identify integration pain points",
              "Calculate total annual software spend"
            ],
            timeEstimate: "1-2 hours"
          },
          {
            step: 2,
            title: "Savings Calculation",
            description: "Use our calculator to determine your potential savings",
            tasks: [
              "Input your business portfolio details",
              "Review progressive discount tier qualification",
              "Compare with current costs",
              "Project ROI and payback period"
            ],
            timeEstimate: "30 minutes"
          },
          {
            step: 3,
            title: "Migration Planning",
            description: "Plan your transition to the unified platform",
            tasks: [
              "Prioritize businesses for migration",
              "Plan data migration strategy",
              "Schedule training for team members",
              "Set up integration timelines"
            ],
            timeEstimate: "2-4 hours"
          },
          {
            step: 4,
            title: "Launch & Optimization",
            description: "Launch your unified operations and optimize for growth",
            tasks: [
              "Complete platform onboarding",
              "Configure cross-business workflows",
              "Train teams on unified processes",
              "Monitor savings and efficiency gains"
            ],
            timeEstimate: "1-2 weeks"
          }
        ]
      },
      
      quiz: {
        title: "Progressive Pricing Knowledge Check",
        description: "Test your understanding of progressive pricing concepts",
        questions: [
          {
            id: "q1",
            question: "What discount do you get with 3 businesses?",
            options: ["20%", "35%", "45%", "50%"],
            correct: "35%",
            explanation: "Three businesses qualify for the 35% portfolio discount tier, applying to all businesses in your portfolio."
          },
          {
            id: "q2", 
            question: "When you qualify for a higher discount tier, it applies to:",
            options: ["Only new businesses", "The newest business only", "ALL your businesses", "Just the business that triggered the tier"],
            correct: "ALL your businesses",
            explanation: "Progressive pricing discounts are retroactive - when you qualify for a higher tier, it applies to your entire portfolio immediately."
          },
          {
            id: "q3",
            question: "A 5-business portfolio saves approximately what percentage vs traditional pricing?",
            options: ["30%", "40%", "50%", "60%"],
            correct: "50%",
            explanation: "Five or more businesses qualify for the maximum 50% progressive discount tier."
          },
          {
            id: "q4",
            question: "The main advantage of progressive pricing over traditional software licensing is:",
            options: ["Lower base price", "More features", "Growth rewards instead of penalties", "Faster implementation"],
            correct: "Growth rewards instead of penalties",
            explanation: "Unlike traditional pricing that penalizes growth with higher costs, progressive pricing rewards portfolio expansion with increasing discounts."
          },
          {
            id: "q5",
            question: "Progressive pricing is designed specifically for:",
            options: ["Large enterprises", "Single-business owners", "Portfolio entrepreneurs", "Software developers"],
            correct: "Portfolio entrepreneurs",
            explanation: "Progressive pricing recognizes that multi-business entrepreneurs deserve volume discounts and unified operations, not separate systems."
          }
        ]
      }
    }
    
    if (module === 'all') {
      return NextResponse.json({
        success: true,
        data: educationContent
      })
    }
    
    const moduleContent = educationContent[module as keyof typeof educationContent]
    
    if (!moduleContent) {
      return NextResponse.json(
        { error: `Module '${module}' not found` },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: moduleContent
    })
    
  } catch (error) {
    console.error('Progressive pricing education error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch education content' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { action, ...payload } = data
    
    switch (action) {
      case 'calculate_savings':
        return handleSavingsCalculation(payload)
      case 'submit_quiz':
        return handleQuizSubmission(payload)
      case 'track_engagement':
        return handleEngagementTracking(payload)
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
    
  } catch (error) {
    console.error('Progressive pricing education POST error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

async function handleSavingsCalculation(payload: any) {
  const { businesses, employeesPerBusiness = 15 } = payload
  
  if (!businesses || businesses < 1 || businesses > 20) {
    return NextResponse.json(
      { error: 'Invalid business count' },
      { status: 400 }
    )
  }
  
  const basePrice = 35 // per user per month
  const discounts = {
    1: 0,
    2: 20,
    3: 35,
    4: 45,
    5: 50
  }
  
  const discount = businesses >= 5 ? 50 : discounts[businesses as keyof typeof discounts] || 0
  const effectivePrice = basePrice * (1 - discount / 100)
  const monthlyTotal = businesses * employeesPerBusiness * effectivePrice
  const traditionalMonthly = businesses * employeesPerBusiness * basePrice
  const monthlySavings = traditionalMonthly - monthlyTotal
  const annualSavings = monthlySavings * 12
  
  // Calculate ROI and additional benefits
  const estimatedRevenue = businesses * 1500000 // $1.5M average per business
  const efficiencyGains = estimatedRevenue * 0.08 * businesses // 8% efficiency gains
  const crossBusinessSynergies = businesses > 1 ? estimatedRevenue * 0.05 * (businesses - 1) : 0
  const totalBenefits = annualSavings + efficiencyGains + crossBusinessSynergies
  const roi = (totalBenefits / (monthlyTotal * 12)) * 100
  
  return NextResponse.json({
    success: true,
    data: {
      portfolio: {
        businesses,
        employeesPerBusiness,
        totalUsers: businesses * employeesPerBusiness
      },
      pricing: {
        basePrice,
        discount,
        effectivePrice: Math.round(effectivePrice * 100) / 100,
        monthlyTotal: Math.round(monthlyTotal),
        traditionalMonthly: Math.round(traditionalMonthly),
        monthlySavings: Math.round(monthlySavings),
        annualSavings: Math.round(annualSavings)
      },
      benefits: {
        efficiencyGains: Math.round(efficiencyGains),
        crossBusinessSynergies: Math.round(crossBusinessSynergies),
        totalBenefits: Math.round(totalBenefits),
        roi: Math.round(roi),
        paybackMonths: Math.round((monthlyTotal * 12) / (totalBenefits / 12) * 10) / 10
      },
      insights: generateInsights(businesses, discount, annualSavings, roi)
    }
  })
}

async function handleQuizSubmission(payload: any) {
  const { answers } = payload
  
  if (!answers || typeof answers !== 'object') {
    return NextResponse.json(
      { error: 'Invalid quiz answers' },
      { status: 400 }
    )
  }
  
  const correctAnswers = {
    q1: "35%",
    q2: "ALL your businesses", 
    q3: "50%",
    q4: "Growth rewards instead of penalties",
    q5: "Portfolio entrepreneurs"
  }
  
  let score = 0
  const results: Record<string, { correct: boolean; explanation: string }> = {}
  
  Object.entries(correctAnswers).forEach(([questionId, correctAnswer]) => {
    const userAnswer = answers[questionId]
    const isCorrect = userAnswer === correctAnswer
    if (isCorrect) score++
    
    results[questionId] = {
      correct: isCorrect,
      explanation: getQuizExplanation(questionId)
    }
  })
  
  const percentage = (score / Object.keys(correctAnswers).length) * 100
  let grade = 'F'
  if (percentage >= 90) grade = 'A'
  else if (percentage >= 80) grade = 'B'
  else if (percentage >= 70) grade = 'C'
  else if (percentage >= 60) grade = 'D'
  
  return NextResponse.json({
    success: true,
    data: {
      score,
      totalQuestions: Object.keys(correctAnswers).length,
      percentage: Math.round(percentage),
      grade,
      results,
      certification: percentage >= 80,
      nextSteps: percentage >= 80 
        ? ["You're ready to implement progressive pricing!", "Schedule a consultation", "Start your free trial"]
        : ["Review the fundamentals", "Try the interactive calculator", "Retake the quiz"]
    }
  })
}

async function handleEngagementTracking(payload: any) {
  const { module, timeSpent, interactions, completed } = payload
  
  // In production, this would save to analytics database
  console.log('Education engagement:', {
    module,
    timeSpent,
    interactions,
    completed,
    timestamp: new Date().toISOString()
  })
  
  return NextResponse.json({
    success: true,
    data: {
      tracked: true,
      recommendedNext: getRecommendedModule(module, completed)
    }
  })
}

function generateInsights(businesses: number, discount: number, annualSavings: number, roi: number): string[] {
  const insights = []
  
  if (businesses === 1) {
    insights.push("Add a second business to unlock 20% savings on everything!")
  } else if (businesses === 2) {
    insights.push(`Your 20% portfolio discount saves you $${annualSavings.toLocaleString()} annually`)
    insights.push("Add one more business to reach the 35% tier")
  } else if (businesses === 3) {
    insights.push(`Your 35% portfolio discount saves you $${annualSavings.toLocaleString()} annually`)
    insights.push("You're in the sweet spot for multi-business efficiency gains")
  } else if (businesses === 4) {
    insights.push(`Your 45% portfolio discount saves you $${annualSavings.toLocaleString()} annually`)
    insights.push("Add one more business to reach maximum 50% savings")
  } else {
    insights.push(`Maximum 50% discount tier - you're saving $${annualSavings.toLocaleString()} annually`)
    insights.push("You qualify for enterprise portfolio benefits and priority support")
  }
  
  if (roi > 300) {
    insights.push(`Your ${roi}% ROI is exceptional - this investment pays for itself in months`)
  } else if (roi > 200) {
    insights.push(`Your ${roi}% ROI significantly outperforms traditional software investments`)
  }
  
  if (businesses >= 3) {
    insights.push("Cross-business synergies add significant value beyond just software savings")
  }
  
  return insights
}

function getQuizExplanation(questionId: string): string {
  const explanations = {
    q1: "Three businesses qualify for the 35% portfolio discount tier, applying to all businesses in your portfolio.",
    q2: "Progressive pricing discounts are retroactive - when you qualify for a higher tier, it applies to your entire portfolio immediately.",
    q3: "Five or more businesses qualify for the maximum 50% progressive discount tier.",
    q4: "Unlike traditional pricing that penalizes growth with higher costs, progressive pricing rewards portfolio expansion with increasing discounts.",
    q5: "Progressive pricing recognizes that multi-business entrepreneurs deserve volume discounts and unified operations, not separate systems."
  }
  
  return explanations[questionId as keyof typeof explanations] || "Explanation not available"
}

function getRecommendedModule(currentModule: string, completed: boolean): string {
  const moduleFlow = [
    'overview',
    'fundamentals', 
    'roi_analysis',
    'success_stories',
    'competitive_analysis',
    'implementation',
    'quiz'
  ]
  
  const currentIndex = moduleFlow.indexOf(currentModule)
  if (completed && currentIndex < moduleFlow.length - 1) {
    return moduleFlow[currentIndex + 1]
  }
  
  return moduleFlow[0] // Default to overview
}