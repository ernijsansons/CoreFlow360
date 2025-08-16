/**
 * CoreFlow360 - Module API Route
 * Provides module information and access status
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { 
  checkModuleAccess, 
  getAccessibleModules,
  moduleAccessControl 
} from '@/lib/modules/access-control'
import { MODULE_INTEGRATIONS, getModuleConfig } from '@/modules/integration-config'
import { handleError, handleNotFoundError, ErrorContext } from '@/lib/error-handler'
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export async function GET(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  return withRateLimit(request, async () => {
    const context: ErrorContext = {
      endpoint: `/api/modules/${params.moduleId}`,
      method: 'GET',
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
      requestId: request.headers.get('x-request-id') || undefined
    }

    try {
      const session = await auth()
      if (!session?.user?.tenantId) {
        return NextResponse.json({
          success: false,
          error: 'Authentication required'
        }, { status: 401 })
      }

      context.userId = session.user.id
      context.tenantId = session.user.tenantId

      const { moduleId } = params

      // Get module configuration
      const moduleConfig = getModuleConfig(moduleId)
      if (!moduleConfig) {
        return handleNotFoundError('Module', context)
      }

      // Check module access
      const accessCheck = await checkModuleAccess({
        tenantId: session.user.tenantId,
        userId: session.user.id,
        moduleId
      })

      // Get usage quotas if accessible
      let usageInfo = null
      if (accessCheck.allowed) {
        const quotaCheck = await moduleAccessControl.checkUsageQuotas(
          session.user.tenantId,
          moduleId
        )
        usageInfo = quotaCheck.usage
      }

      // Check dependencies
      const dependencies = await moduleAccessControl.validateModuleDependencies(
        session.user.tenantId,
        moduleId
      )

      return NextResponse.json({
        success: true,
        data: {
          module: {
            id: moduleConfig.id,
            name: moduleConfig.name,
            description: moduleConfig.description,
            category: moduleConfig.category,
            capabilities: moduleConfig.capabilities,
            documentation: moduleConfig.documentation,
            officialWebsite: moduleConfig.officialWebsite
          },
          access: {
            allowed: accessCheck.allowed,
            reason: accessCheck.reason,
            requiredBundle: accessCheck.requiredBundle,
            requiredTier: accessCheck.requiredTier,
            suggestedUpgrade: accessCheck.suggestedUpgrade
          },
          usage: usageInfo,
          dependencies: {
            satisfied: dependencies.valid,
            missing: dependencies.missingDependencies
          },
          integration: {
            connectionType: moduleConfig.connectionType,
            deploymentType: moduleConfig.deploymentType,
            authMethod: moduleConfig.authMethod,
            healthCheckEndpoint: moduleConfig.healthCheckEndpoint
          }
        }
      })

    } catch (error) {
      return handleError(error, context)
    }
  }, RATE_LIMITS.api)
}

// Get all accessible modules for the tenant
export async function POST(request: NextRequest) {
  return withRateLimit(request, async () => {
    const context: ErrorContext = {
      endpoint: '/api/modules',
      method: 'POST',
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
      requestId: request.headers.get('x-request-id') || undefined
    }

    try {
      const session = await auth()
      if (!session?.user?.tenantId) {
        return NextResponse.json({
          success: false,
          error: 'Authentication required'
        }, { status: 401 })
      }

      context.userId = session.user.id
      context.tenantId = session.user.tenantId

      // Get all accessible modules
      const accessibleModules = await getAccessibleModules(session.user.tenantId)

      // Get details for each accessible module
      const moduleDetails = accessibleModules.map(moduleId => {
        const config = getModuleConfig(moduleId)
        if (!config) return null

        return {
          id: config.id,
          name: config.name,
          description: config.description,
          category: config.category,
          capabilities: config.capabilities.slice(0, 3), // Top 3 capabilities
          connectionType: config.connectionType,
          deploymentType: config.deploymentType
        }
      }).filter(Boolean)

      // Get all available modules for comparison
      const allModules = Object.values(MODULE_INTEGRATIONS).map(module => ({
        id: module.id,
        name: module.name,
        category: module.category,
        accessible: accessibleModules.includes(module.id)
      }))

      return NextResponse.json({
        success: true,
        data: {
          accessibleModules: moduleDetails,
          totalAccessible: accessibleModules.length,
          allModules,
          subscription: {
            hasActiveSubscription: true,
            moduleCount: accessibleModules.length
          }
        }
      })

    } catch (error) {
      return handleError(error, context)
    }
  }, RATE_LIMITS.api)
}