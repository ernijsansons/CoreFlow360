/**
 * Create Customer Portal Session API
 * POST /api/subscriptions/portal-session
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTenantFromSession, getUserFromSession } from '@/lib/auth/tenant-utils'
import { subscriptionManager } from '@/lib/subscription/subscription-manager'
import { z } from 'zod'

const portalSchema = z.object({
  returnUrl: z.string().url(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { returnUrl } = portalSchema.parse(body)
    
    const tenantId = await getTenantFromSession(request)

    // Create customer portal session
    const portalSession = await subscriptionManager.createPortalSession(
      tenantId,
      returnUrl
    )

    return NextResponse.json({
      portalUrl: portalSession.url,
      sessionId: portalSession.id,
    })

  } catch (error) {
    console.error('Error creating portal session:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create portal session' },
      { status: 500 }
    )
  }
}