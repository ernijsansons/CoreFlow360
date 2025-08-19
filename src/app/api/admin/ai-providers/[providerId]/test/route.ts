/**
 * AI Provider Test API
 * POST /api/admin/ai-providers/[providerId]/test
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTenantFromSession } from '@/lib/auth/tenant-utils'
import { aiProviderDB } from '@/lib/ai/ai-provider-db'
import { multiLLMManager } from '@/lib/ai/multi-llm-manager'

export async function POST(
  request: NextRequest,
  { params }: { params: { providerId: string } }
) {
  try {
    const tenantId = await getTenantFromSession(request)
    const { providerId } = params

    // Test the provider connection
    try {
      const startTime = Date.now()
      
      // Get the provider's API key from database
      const apiKey = await aiProviderDB.getApiKey(tenantId, providerId)
      
      if (!apiKey) {
        await aiProviderDB.updateTestResults(tenantId, providerId, false, 'Provider not configured or API key missing')
        
        return NextResponse.json({
          success: false,
          message: `${providerId} is not configured with an API key`,
          timestamp: new Date().toISOString(),
        })
      }

      // Configure the provider in memory for testing
      multiLLMManager.setApiKey(providerId, apiKey)
      
      // Run the actual test
      const success = await multiLLMManager.testProvider(providerId)
      const responseTime = Date.now() - startTime
      
      let errorMessage: string | undefined
      if (!success) {
        errorMessage = 'Test request failed - check API key validity and network connectivity'
      }

      // Update test results in database
      await aiProviderDB.updateTestResults(tenantId, providerId, success, errorMessage)

      const message = success 
        ? `${providerId} connection test successful (${responseTime}ms)` 
        : `${providerId} connection test failed: ${errorMessage}`

      return NextResponse.json({
        success,
        message,
        responseTime,
        timestamp: new Date().toISOString(),
        providerId,
      })

    } catch (testError) {
      console.error(`Provider test failed for ${providerId}:`, testError)
      
      const errorMessage = testError instanceof Error ? testError.message : 'Unknown error'
      
      // Update test results in database
      try {
        await aiProviderDB.updateTestResults(tenantId, providerId, false, errorMessage)
      } catch (dbError) {
        console.error('Failed to update test results in database:', dbError)
      }

      return NextResponse.json({
        success: false,
        message: `${providerId} connection test failed`,
        error: errorMessage,
        timestamp: new Date().toISOString(),
        providerId,
      })
    }

  } catch (error) {
    console.error('Provider test error:', error)
    
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to test provider' },
      { status: 500 }
    )
  }
}