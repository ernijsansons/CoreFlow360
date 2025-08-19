/**
 * CoreFlow360 - Subscription Pricing Calculator API
 * Mathematical precision in bundle pricing with usage-based calculations
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withRateLimit } from '@/lib/api-wrapper'
import {
  BUNDLES,
  BUNDLE_PRESETS,
  type BundleDefinition,
  type BundleTier,
  getBundleById,
  validateBundleCompatibility,
} from '@/types/bundles'

// Request validation schema
const PricingRequestSchema = z.object({
  bundles: z.array(z.string()).min(1),
  users: z.number().int().min(1).max(10000),
  billingCycle: z.enum(['monthly', 'annual']),
  addons: z
    .object({
      additionalStorage: z.number().nonnegative().optional(), // GB
      additionalApiCalls: z.number().nonnegative().optional(),
      additionalAiOperations: z.number().nonnegative().optional(),
      premiumSupport: z.boolean().optional(),
      dedicatedAccount: z.boolean().optional(),
      customIntegrations: z.number().int().nonnegative().optional(),
    })
    .optional(),
  discountCode: z.string().optional(),
})

// Pricing response structure
interface PricingBreakdown {
  bundles: Array<{
    id: string
    name: string
    basePrice: number
    userPrice: number
    totalPrice: number
    features: string[]
  }>
  addons: Array<{
    name: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
  summary: {
    subtotal: number
    discount: number
    discountPercentage: number
    setupFees: number
    monthlyTotal: number
    annualTotal: number
    savings: number
  }
  recommendations: Array<{
    type: 'bundle_upgrade' | 'bundle_addition' | 'addon' | 'discount'
    title: string
    description: string
    potentialSavings: number
  }>
  warnings: string[]
}

// Addon pricing configuration
const ADDON_PRICING = {
  additionalStorage: { price: 0.1, unit: 'GB' }, // per GB per month
  additionalApiCalls: { price: 0.0001, unit: 'call' }, // per 1000 calls
  additionalAiOperations: { price: 0.01, unit: 'operation' }, // per operation
  premiumSupport: { price: 500, unit: 'month' }, // flat fee
  dedicatedAccount: { price: 1000, unit: 'month' }, // flat fee
  customIntegrations: { price: 250, unit: 'integration' }, // per integration
}

// Discount codes
const DISCOUNT_CODES: Record<string, { percentage: number; validUntil: Date }> = {
  LAUNCH2024: { percentage: 20, validUntil: new Date('2024-12-31') },
  EARLYBIRD: { percentage: 15, validUntil: new Date('2024-06-30') },
  PARTNER10: { percentage: 10, validUntil: new Date('2025-12-31') },
}

async function handlePOST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json()
    const validatedData = PricingRequestSchema.parse(body)

    const { bundles: bundleIds, users, billingCycle, addons = {}, discountCode } = validatedData

    // Validate bundle compatibility
    const compatibility = validateBundleCompatibility(bundleIds)
    const warnings: string[] = []

    if (!compatibility.valid) {
      warnings.push(...compatibility.conflicts)
      warnings.push(...compatibility.missingDependencies)
    }

    // Get bundle details
    const bundles = bundleIds
      .map((id) => getBundleById(id))
      .filter((b): b is BundleDefinition => b !== undefined)

    if (bundles.length !== bundleIds.length) {
      const invalidIds = bundleIds.filter((id) => !getBundleById(id))
      return NextResponse.json(
        { error: `Invalid bundle IDs: ${invalidIds.join(', ')}` },
        { status: 400 }
      )
    }

    // Calculate bundle pricing
    const bundlePricing = bundles.map((bundle) => {
      // Check user limits
      if (bundle.pricing.maximumUsers && users > bundle.pricing.maximumUsers) {
        warnings.push(`${bundle.name} supports maximum ${bundle.pricing.maximumUsers} users`)
      }

      const effectiveUsers = Math.max(users, bundle.pricing.minimumUsers)
      const basePrice = bundle.pricing.basePrice
      const userPrice = bundle.pricing.perUserPrice * effectiveUsers
      const totalPrice = basePrice + userPrice

      return {
        id: bundle.id,
        name: bundle.name,
        basePrice,
        userPrice,
        totalPrice,
        features: bundle.enabledFeatures,
        setupFee: bundle.pricing.setupFee || 0,
      }
    })

    // Calculate addon pricing
    const addonPricing = Object.entries(addons)
      .filter(([_, value]) => value && value > 0)
      .map(([addon, quantity]) => {
        const config = ADDON_PRICING[addon as keyof typeof ADDON_PRICING]
        if (!config) return null

        return {
          name: addon.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()),
          quantity: quantity as number,
          unitPrice: config.price,
          totalPrice: config.price * (quantity as number),
        }
      })
      .filter((addon): addon is NonNullable<typeof addon> => addon !== null)

    // Calculate totals
    const bundleSubtotal = bundlePricing.reduce((sum, b) => sum + b.totalPrice, 0)
    const addonSubtotal = addonPricing.reduce((sum, a) => sum + a.totalPrice, 0)
    const setupFees = bundlePricing.reduce((sum, b) => sum + b.setupFee, 0)
    const monthlySubtotal = bundleSubtotal + addonSubtotal

    // Apply discounts
    let discountPercentage = 0

    // Annual billing discount
    if (billingCycle === 'annual') {
      const annualDiscounts = bundles.map((b) => b.pricing.annualDiscount)
      discountPercentage = Math.max(...annualDiscounts)
    }

    // Promotional discount code
    if (discountCode && DISCOUNT_CODES[discountCode]) {
      const code = DISCOUNT_CODES[discountCode]
      if (code.validUntil > new Date()) {
        discountPercentage = Math.max(discountPercentage, code.percentage)
      }
    }

    // Volume discount for large teams
    if (users >= 100) {
      discountPercentage = Math.max(discountPercentage, 10)
    } else if (users >= 50) {
      discountPercentage = Math.max(discountPercentage, 5)
    }

    const discount = monthlySubtotal * (discountPercentage / 100)
    const monthlyTotal = monthlySubtotal - discount
    const annualTotal = monthlyTotal * 12
    const monthlySavings = billingCycle === 'annual' ? monthlySubtotal * 12 - annualTotal : 0

    // Generate recommendations
    const recommendations = generateRecommendations(bundles, users, billingCycle, monthlyTotal)

    const response: PricingBreakdown = {
      bundles: bundlePricing.map((b) => ({
        id: b.id,
        name: b.name,
        basePrice: b.basePrice,
        userPrice: b.userPrice,
        totalPrice: b.totalPrice,
        features: b.features.slice(0, 5), // Top 5 features
      })),
      addons: addonPricing,
      summary: {
        subtotal: monthlySubtotal,
        discount,
        discountPercentage,
        setupFees,
        monthlyTotal,
        annualTotal,
        savings: monthlySavings,
      },
      recommendations,
      warnings,
    }

    return NextResponse.json(response)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to calculate pricing' }, { status: 500 })
  }
}

function generateRecommendations(
  bundles: BundleDefinition[],
  users: number,
  billingCycle: 'monthly' | 'annual',
  currentMonthlyTotal: number
): PricingBreakdown['recommendations'] {
  const recommendations: PricingBreakdown['recommendations'] = []

  // Recommend annual billing if on monthly
  if (billingCycle === 'monthly') {
    const maxAnnualDiscount = Math.max(...bundles.map((b) => b.pricing.annualDiscount))
    const annualSavings = currentMonthlyTotal * 12 * (maxAnnualDiscount / 100)

    recommendations.push({
      type: 'discount',
      title: 'Switch to Annual Billing',
      description: `Save ${maxAnnualDiscount}% with annual billing`,
      potentialSavings: Math.round(annualSavings),
    })
  }

  // Check for bundle upgrades
  const currentTiers = bundles.map((b) => b.tier)
  const hasStarter = currentTiers.includes('basic' as BundleTier)
  const hasProfessional = currentTiers.includes('professional' as BundleTier)

  if (hasStarter && !hasProfessional) {
    recommendations.push({
      type: 'bundle_upgrade',
      title: 'Upgrade to Professional',
      description: 'Unlock AI-powered insights and advanced analytics',
      potentialSavings: 0,
    })
  }

  // Recommend complementary bundles
  const hasFinance = bundles.some((b) => b.category === 'finance')
  const hasAI = bundles.some((b) => b.category === 'ai_enhancement')

  if (hasFinance && !hasAI) {
    recommendations.push({
      type: 'bundle_addition',
      title: 'Add AI Finance Intelligence',
      description: 'Enhance financial analysis with AI-powered insights',
      potentialSavings: 0,
    })
  }

  // Recommend support for large teams
  if (users >= 50) {
    recommendations.push({
      type: 'addon',
      title: 'Add Premium Support',
      description: 'Get dedicated support for your growing team',
      potentialSavings: 0,
    })
  }

  return recommendations.slice(0, 3) // Top 3 recommendations
}

// Export with rate limiting
export const POST = withRateLimit(
  handlePOST,
  100, // 100 requests per minute
  60000,
  'pricing-calculator'
)

// Handle GET for pricing information
export async function GET(): Promise<NextResponse> {
  const pricingInfo = {
    bundles: BUNDLES.map((bundle) => ({
      id: bundle.id,
      name: bundle.name,
      description: bundle.description,
      category: bundle.category,
      tier: bundle.tier,
      pricing: {
        basePrice: bundle.pricing.basePrice,
        perUserPrice: bundle.pricing.perUserPrice,
        minimumUsers: bundle.pricing.minimumUsers,
        maximumUsers: bundle.pricing.maximumUsers,
        annualDiscount: bundle.pricing.annualDiscount,
      },
      highlights: bundle.enabledFeatures.slice(0, 5),
    })),
    addons: Object.entries(ADDON_PRICING).map(([key, config]) => ({
      id: key,
      name: key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()),
      price: config.price,
      unit: config.unit,
    })),
    discounts: {
      volume: [
        { minUsers: 50, discount: 5 },
        { minUsers: 100, discount: 10 },
      ],
      annual: 'Up to 25% off',
    },
  }

  return NextResponse.json(pricingInfo)
}
