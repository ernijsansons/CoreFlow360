/**
 * CoreFlow360 - Subscription Bundles API
 * Get all available subscription bundles with intelligent recommendations
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'



const BundleQuerySchema = z.object({
  userCount: z.number().optional(),
  industry: z.string().optional(),
  currentModules: z.array(z.string()).optional(),
  includeRecommendations: z.boolean().default(true)
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userCount = searchParams.get('userCount') ? parseInt(searchParams.get('userCount')!) : undefined
    const industry = searchParams.get('industry')
    const currentModulesParam = searchParams.get('currentModules')
    const currentModules = currentModulesParam ? currentModulesParam.split(',') : []
    const includeRecommendations = searchParams.get('includeRecommendations') !== 'false'

    // Fetch all active bundles
    const bundles = await prisma.bundleDefinition.findMany({
      where: { isActive: true },
      orderBy: { perUserPrice: 'asc' }
    })

    // Format bundles with detailed information
    const formattedBundles = await Promise.all(bundles.map(async (bundle) => {
      const includedModules = JSON.parse(bundle.includedModules) as string[]
      const recommendedFor = JSON.parse(bundle.recommendedFor || '{}')

      // Get module details for this bundle
      const moduleDetails = await prisma.moduleDefinition.findMany({
        where: {
          moduleKey: { in: includedModules },
          isActive: true
        }
      })

      // Calculate individual module pricing for comparison
      const individualPrice = userCount ? 
        moduleDetails.reduce((sum, module) => 
          sum + Math.max(module.basePrice, module.perUserPrice * userCount), 0
        ) : null

      const bundlePrice = userCount ? 
        Math.max(bundle.basePrice, bundle.perUserPrice * userCount) : bundle.perUserPrice

      const savings = individualPrice && userCount ? individualPrice - bundlePrice : 0
      const savingsPercentage = individualPrice ? Math.round((savings / individualPrice) * 100) : 0

      return {
        bundleKey: bundle.bundleKey,
        name: bundle.name,
        description: bundle.description,
        isPopular: bundle.isPopular,
        pricing: {
          basePrice: bundle.basePrice,
          perUserPrice: bundle.perUserPrice,
          currency: 'USD',
          discountRate: bundle.discountRate * 100, // Convert to percentage
          calculatedPrice: userCount ? bundlePrice : null,
          savings: savings > 0 ? savings : null,
          savingsPercentage: savingsPercentage > 0 ? savingsPercentage : null
        },
        constraints: {
          minUsers: bundle.minUsers,
          maxUsers: bundle.maxUsers
        },
        modules: {
          included: moduleDetails.map(module => ({
            moduleKey: module.moduleKey,
            name: module.name,
            category: module.category,
            individualPrice: module.perUserPrice
          })),
          count: moduleDetails.length
        },
        suitability: {
          recommendedFor: recommendedFor,
          isEligible: userCount ? (
            userCount >= bundle.minUsers && 
            (!bundle.maxUsers || userCount <= bundle.maxUsers)
          ) : true
        },
        updatedAt: bundle.updatedAt
      }
    }))

    // Generate intelligent recommendations if requested
    let recommendations: any[] = []
    if (includeRecommendations && (userCount || currentModules.length > 0)) {
      recommendations = generateBundleRecommendations(
        formattedBundles,
        userCount,
        industry,
        currentModules
      )
    }

    return NextResponse.json({
      bundles: formattedBundles,
      recommendations,
      meta: {
        totalBundles: formattedBundles.length,
        eligibleBundles: userCount ? 
          formattedBundles.filter(b => b.suitability.isEligible).length : 
          formattedBundles.length,
        priceRange: {
          min: Math.min(...formattedBundles.map(b => b.pricing.perUserPrice)),
          max: Math.max(...formattedBundles.map(b => b.pricing.perUserPrice))
        }
      }
    })

  } catch (error) {
    console.error('Error fetching bundles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bundles' },
      { status: 500 }
    )
  }
}

function generateBundleRecommendations(
  bundles: any[],
  userCount?: number,
  industry?: string,
  currentModules: string[] = []
): any[] {
  const recommendations: any[] = []

  for (const bundle of bundles) {
    let score = 0
    let reasons: string[] = []

    // User count suitability
    if (userCount && bundle.suitability.isEligible) {
      if (userCount >= bundle.constraints.minUsers && 
          userCount <= (bundle.constraints.maxUsers || 1000)) {
        score += 30
        reasons.push(`Optimized for ${userCount} users`)
      }
    }

    // Industry match
    if (industry && bundle.suitability.recommendedFor.industries) {
      const recommendedIndustries = bundle.suitability.recommendedFor.industries
      if (recommendedIndustries.includes(industry) || recommendedIndustries.includes('all')) {
        score += 25
        reasons.push(`Designed for ${industry} industry`)
      }
    }

    // Module coverage
    if (currentModules.length > 0) {
      const includedModuleKeys = bundle.modules.included.map((m: any) => m.moduleKey)
      const coverageCount = currentModules.filter(m => includedModuleKeys.includes(m)).length
      const coveragePercentage = coverageCount / currentModules.length
      
      if (coveragePercentage >= 0.8) {
        score += 20
        reasons.push(`Covers ${Math.round(coveragePercentage * 100)}% of your current modules`)
      } else if (coveragePercentage >= 0.5) {
        score += 10
        reasons.push(`Covers ${Math.round(coveragePercentage * 100)}% of your current modules`)
      }
    }

    // Savings potential
    if (bundle.pricing.savings && bundle.pricing.savings > 0) {
      score += Math.min(bundle.pricing.savingsPercentage || 0, 20)
      reasons.push(`Save ${bundle.pricing.savingsPercentage}% vs individual modules`)
    }

    // Popular bundles get a small boost
    if (bundle.isPopular) {
      score += 5
      reasons.push('Most popular choice')
    }

    // Only recommend bundles with a meaningful score
    if (score >= 25) {
      recommendations.push({
        bundleKey: bundle.bundleKey,
        name: bundle.name,
        score,
        reasons,
        priority: score >= 50 ? 'high' : score >= 35 ? 'medium' : 'low'
      })
    }
  }

  // Sort by score (highest first) and return top 3
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userCount, industry, currentModules, includeRecommendations } = 
      BundleQuerySchema.parse(body)

    // Similar logic to GET but with POST body parameters
    // This allows for more complex recommendation requests
    
    return NextResponse.json({ 
      message: 'Advanced bundle recommendations - implementation similar to GET' 
    })

  } catch (error) {
    console.error('Error in bundle recommendations:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}