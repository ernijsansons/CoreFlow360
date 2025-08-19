/**
 * AI Provider Remove API
 * DELETE /api/admin/ai-providers/[providerId]/remove
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTenantFromSession } from '@/lib/auth/tenant-utils'
import { aiProviderDB } from '@/lib/ai/ai-provider-db'
import { multiLLMManager } from '@/lib/ai/multi-llm-manager'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { providerId: string } }
) {
  try {
    const tenantId = await getTenantFromSession(request)
    const { providerId } = params

    try {
      // Check if provider exists
      const existingProvider = await aiProviderDB.getProvider(tenantId, providerId)
      if (!existingProvider) {
        return NextResponse.json(
          { error: 'Provider not found or not configured' },
          { status: 404 }
        )
      }

      // Remove from memory first
      multiLLMManager.removeProvider(providerId)

      // Remove from database
      await aiProviderDB.deleteProvider(tenantId, providerId)
      
      return NextResponse.json({
        success: true,
        message: `${existingProvider.name} configuration removed successfully`,
        providerId,
      })

    } catch (dbError) {
      console.error(`Database error removing ${providerId}:`, dbError)
      
      // Still try to remove from memory even if database fails
      try {
        multiLLMManager.removeProvider(providerId)
      } catch (memoryError) {
        console.error('Failed to remove from memory:', memoryError)
      }

      return NextResponse.json(
        { error: `Failed to remove ${providerId} configuration from database` },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Provider removal error:', error)
    
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to remove provider' },
      { status: 500 }
    )
  }
}