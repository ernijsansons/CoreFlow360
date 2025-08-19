/**
 * AI Provider Status API
 * GET /api/admin/ai-providers/status
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTenantFromSession, getUserFromSession } from '@/lib/auth/tenant-utils'
import { aiProviderDB } from '@/lib/ai/ai-provider-db'
import { AI_CONFIG } from '@/config/ai.config'

export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantFromSession(request)
    const user = await getUserFromSession()

    // Check if user has admin privileges
    // TODO: Implement proper role-based access control
    if (!user.email) {
      return NextResponse.json({ error: 'Invalid user session' }, { status: 401 })
    }

    try {
      // Get providers from database
      const dbProviders = await aiProviderDB.getProviders(tenantId)
      
      // Create a map of database providers
      const dbProviderMap = new Map()
      dbProviders.forEach(p => dbProviderMap.set(p.providerId, p))

      const providers: Record<string, any> = {}
      
      // Merge config with database data
      Object.entries(AI_CONFIG.providers).forEach(([providerId, config]) => {
        const dbProvider = dbProviderMap.get(providerId)
        
        providers[providerId] = {
          id: providerId,
          name: config.name,
          description: config.description,
          enabled: dbProvider?.isEnabled || false,
          configured: dbProvider?.isConfigured || false,
          models: config.models,
          supportedFeatures: config.supportedFeatures,
          costPerToken: config.costPerToken,
          lastTested: dbProvider?.lastTested,
          testResult: dbProvider?.testResult,
          healthStatus: dbProvider?.healthStatus || 'INACTIVE',
          totalRequests: dbProvider?.totalRequests || 0,
          totalCost: parseFloat(dbProvider?.totalCost?.toString() || '0'),
          avgResponseTime: dbProvider?.avgResponseTime,
          errorRate: dbProvider?.errorRate,
          lastUsed: dbProvider?.lastUsed,
        }
      })

      return NextResponse.json({
        success: true,
        providers,
      })

    } catch (dbError) {
      console.error('Database error:', dbError)
      
      // Fallback to config-only data if database fails
      const providers: Record<string, any> = {}
      
      Object.entries(AI_CONFIG.providers).forEach(([providerId, config]) => {
        providers[providerId] = {
          id: providerId,
          name: config.name,
          description: config.description,
          enabled: false,
          configured: false,
          models: config.models,
          supportedFeatures: config.supportedFeatures,
          costPerToken: config.costPerToken,
          lastTested: null,
          testResult: null,
          healthStatus: 'INACTIVE',
          totalRequests: 0,
          totalCost: 0,
          avgResponseTime: null,
          errorRate: null,
          lastUsed: null,
        }
      })

      return NextResponse.json({
        success: true,
        providers,
        warning: 'Database unavailable - showing default config only'
      })
    }

  } catch (error) {
    console.error('Provider status error:', error)
    
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to get provider status' },
      { status: 500 }
    )
  }
}