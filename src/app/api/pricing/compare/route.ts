/**
 * CoreFlow360 - Pricing Comparison API
 * Compare pricing across different tiers
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { PricingCalculator } from '@/lib/pricing/calculator'
import { handleValidationError, handleError, ErrorContext } from '@/lib/error-handler'
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

const comparePricingSchema = z.object({
  users: z.number().min(1).max(10000),
  bundles: z.array(z.string()).min(1).max(10)
})

export async function POST(request: NextRequest) {
  return withRateLimit(request, async () => {
    const context: ErrorContext = {
      endpoint: '/api/pricing/compare',
      method: 'POST',
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
      requestId: request.headers.get('x-request-id') || undefined
    }

    try {
      const body = await request.json()
      
      // Validate input
      const validationResult = comparePricingSchema.safeParse(body)
      if (!validationResult.success) {
        return handleValidationError(validationResult.error, context)
      }

      const { users, bundles } = validationResult.data

      // Compare pricing across all tiers
      const comparison = PricingCalculator.compareTiers(users, bundles)

      // Find best value tier
      let bestValue = null
      let lowestCost = Infinity

      Object.entries(comparison).forEach(([tier, pricing]) => {
        if (pricing.totalAnnual < lowestCost) {
          lowestCost = pricing.totalAnnual
          bestValue = tier
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          comparison,
          bestValue,
          users,
          bundles
        }
      })

    } catch (error) {
      return handleError(error, context)
    }
  }, RATE_LIMITS.public)
}