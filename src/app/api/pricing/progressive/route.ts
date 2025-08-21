import { NextResponse } from 'next/server'
import { calculateProgressivePrice, PROGRESSIVE_DISCOUNTS } from '@/lib/unified-pricing-engine'

export async function POST(req: Request) {
  try {
    const { businessCount, usersPerBusiness, tier = 'professional' } = await req.json()
    
    const tierPrices = {
      starter: 29,
      professional: 59,
      enterprise: 99
    }
    
    const basePrice = tierPrices[tier] || 59
    const pricing = calculateProgressivePrice(basePrice, businessCount, usersPerBusiness)
    
    return NextResponse.json({
      success: true,
      pricing: {
        ...pricing,
        businessCount,
        usersPerBusiness,
        tier,
        annualSavings: pricing.savings * 12
      }
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Calculation failed' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    discounts: PROGRESSIVE_DISCOUNTS,
    tiers: {
      starter: { base: 29, perUser: 7 },
      professional: { base: 59, perUser: 12 },
      enterprise: { base: 99, perUser: 18 }
    }
  })
}