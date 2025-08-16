/**
 * CoreFlow360 - Module Deactivation API
 * Deactivate a module for a tenant's subscription
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { moduleManager } from '@/services/subscription/module-manager'

const DeactivateModuleSchema = z.object({
  tenantId: z.string().min(1, "Tenant ID is required"),
  moduleKey: z.string().min(1, "Module key is required"),
  force: z.boolean().default(false)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tenantId, moduleKey, force } = DeactivateModuleSchema.parse(body)

    // Check current module status
    const isActive = await moduleManager.isModuleActive(tenantId, moduleKey)
    
    if (!isActive) {
      return NextResponse.json({
        success: true,
        message: `Module '${moduleKey}' is already inactive`,
        moduleKey,
        tenantId,
        wasActive: false
      })
    }

    // If not forcing, check for dependencies first
    if (!force) {
      const currentModules = await moduleManager.getActiveModules(tenantId)
      const remainingModules = currentModules.filter(m => m !== moduleKey)
      
      // This will check if any remaining modules depend on the one being deactivated
      const validation = await moduleManager.validateModuleDependencies(remainingModules)
      
      if (!validation.isValid) {
        return NextResponse.json({
          success: false,
          error: 'Cannot deactivate module due to dependencies',
          dependencies: validation.errors,
          suggestions: validation.suggestions,
          moduleKey,
          tenantId,
          force: false
        }, { status: 400 })
      }
    }

    // Deactivate the module
    await moduleManager.deactivateModule(tenantId, moduleKey)
    
    // Get updated module list
    const activeModules = await moduleManager.getActiveModules(tenantId)

    return NextResponse.json({
      success: true,
      message: `Module '${moduleKey}' deactivated successfully`,
      moduleKey,
      tenantId,
      activeModules,
      deactivatedAt: new Date().toISOString(),
      wasForced: force
    })

  } catch (error) {
    console.error('Module deactivation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid request data', 
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to deactivate module' 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'POST to this endpoint to deactivate a module',
    schema: {
      tenantId: 'string',
      moduleKey: 'string',
      force: 'boolean (optional, default: false) - Skip dependency validation'
    }
  })
}