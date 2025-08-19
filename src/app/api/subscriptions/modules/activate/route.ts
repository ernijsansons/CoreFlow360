/**
 * CoreFlow360 - Module Activation API
 * Activate a module for a tenant's subscription
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { moduleManager } from '@/services/subscription/module-manager'

const ActivateModuleSchema = z.object({
  tenantId: z.string().min(1, 'Tenant ID is required'),
  moduleKey: z.string().min(1, 'Module key is required'),
  validateOnly: z.boolean().default(false),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tenantId, moduleKey, validateOnly } = ActivateModuleSchema.parse(body)

    if (validateOnly) {
      // Just validate without actually activating
      const currentModules = await moduleManager.getActiveModules(tenantId)
      const newModules = [...currentModules, moduleKey]

      const validation = await moduleManager.validateModuleDependencies(newModules)

      return NextResponse.json({
        success: true,
        validation,
        moduleKey,
        tenantId,
        action: 'validation_only',
      })
    }

    // Activate the module
    await moduleManager.activateModule(tenantId, moduleKey)

    // Get updated module list and capabilities
    const activeModules = await moduleManager.getActiveModules(tenantId)
    const capabilities = await moduleManager.getModuleCapabilities(tenantId, moduleKey)

    return NextResponse.json({
      success: true,
      message: `Module '${moduleKey}' activated successfully`,
      moduleKey,
      tenantId,
      activeModules,
      capabilities,
      activatedAt: new Date().toISOString(),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to activate module',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint to activate a module',
    schema: {
      tenantId: 'string',
      moduleKey: 'string',
      validateOnly: 'boolean (optional, default: false)',
    },
  })
}
