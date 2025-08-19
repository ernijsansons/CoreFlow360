/**
 * AI Provider Toggle API
 * POST /api/admin/ai-providers/[providerId]/toggle
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTenantFromSession } from '@/lib/auth/tenant-utils'
import { aiProviderDB } from '@/lib/ai/ai-provider-db'

export async function POST(
  request: NextRequest,
  { params }: { params: { providerId: string } }
) {
  try {
    const tenantId = await getTenantFromSession(request)
    const { providerId } = params
    const { enabled } = await request.json()

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Enabled parameter must be boolean' },
        { status: 400 }
      )
    }

    try {
      // Check if provider exists
      const existingProvider = await aiProviderDB.getProvider(tenantId, providerId)
      if (!existingProvider) {
        return NextResponse.json(
          { error: 'Provider not found or not configured' },
          { status: 404 }
        )
      }

      // Toggle the provider
      const updatedProvider = await aiProviderDB.toggleProvider(tenantId, providerId, enabled)

      return NextResponse.json({
        success: true,
        message: `${updatedProvider.name} ${enabled ? 'enabled' : 'disabled'} successfully`,
        provider: updatedProvider,
      })

    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to update provider status' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Provider toggle error:', error)
    
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to toggle provider' },
      { status: 500 }
    )
  }
}