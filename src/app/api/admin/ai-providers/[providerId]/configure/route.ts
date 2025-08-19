/**
 * AI Provider Configuration API
 * POST /api/admin/ai-providers/[providerId]/configure
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTenantFromSession, getUserFromSession } from '@/lib/auth/tenant-utils'
import { aiProviderDB } from '@/lib/ai/ai-provider-db'
import { multiLLMManager } from '@/lib/ai/multi-llm-manager'
import { AI_CONFIG } from '@/config/ai.config'

export async function POST(
  request: NextRequest,
  { params }: { params: { providerId: string } }
) {
  try {
    const tenantId = await getTenantFromSession(request)
    const user = await getUserFromSession()
    const { providerId } = params
    const { apiKey, enabled = true, settings = {} } = await request.json()

    if (!apiKey || apiKey.trim() === '') {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      )
    }

    // Validate provider ID
    const validProviders = Object.keys(AI_CONFIG.providers)
    if (!validProviders.includes(providerId)) {
      return NextResponse.json(
        { error: `Invalid provider ID. Valid providers: ${validProviders.join(', ')}` },
        { status: 400 }
      )
    }

    const userId = user.email || user.id

    try {
      // Get provider config from AI_CONFIG
      const providerConfig = AI_CONFIG.providers[providerId as keyof typeof AI_CONFIG.providers]
      
      // Configure the provider in memory first
      multiLLMManager.setApiKey(providerId, apiKey)

      // Save to database
      const savedProvider = await aiProviderDB.upsertProvider(tenantId, {
        providerId,
        name: providerConfig.name,
        description: providerConfig.description,
        apiKey,
        isEnabled: enabled,
        defaultModel: providerConfig.defaultModel,
        temperature: settings.temperature || providerConfig.temperature,
        maxTokens: settings.maxTokens || providerConfig.maxTokens,
        costPerToken: providerConfig.costPerToken,
        supportedModels: providerConfig.models,
        supportedFeatures: providerConfig.supportedFeatures,
        metadata: settings,
      }, userId)

      return NextResponse.json({
        success: true,
        message: `${providerConfig.name} configured successfully`,
        provider: savedProvider,
      })

    } catch (configError) {
      console.error(`Failed to configure ${providerId}:`, configError)
      
      // Try to provide more specific error messages
      let errorMessage = `Failed to configure ${providerId}`
      
      if (configError instanceof Error) {
        if (configError.message.includes('Invalid API key')) {
          errorMessage = 'Invalid API key format'
        } else if (configError.message.includes('Network')) {
          errorMessage = 'Unable to verify API key - network error'
        } else if (configError.message.includes('Unauthorized')) {
          errorMessage = 'API key is invalid or unauthorized'
        }
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Provider configuration error:', error)
    
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to configure provider' },
      { status: 500 }
    )
  }
}