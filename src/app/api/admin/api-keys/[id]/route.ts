/**
 * CoreFlow360 - Individual API Key Management Routes
 * Secure endpoints for single API key operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { credentialManager } from '@/lib/security/credential-manager'
import { getServerSession, requirePermission } from '@/lib/auth'
import { updateAPIKeySchema } from '@/lib/api-keys/validation'
import { UpdateAPIKeyRequest } from '@/types/api-keys'

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * GET /api/admin/api-keys/[id] - Get specific API key details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Require super admin permission
    const session = await requirePermission('system:manage')
    
    const keyId = params.id
    
    if (!keyId) {
      return NextResponse.json(
        { error: 'API key ID is required' },
        { status: 400 }
      )
    }

    const result = await credentialManager.getAPIKey(
      keyId,
      session.user.tenantId,
      session.user.role,
      session.user.permissions
    )

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('API Key retrieval error:', error)
    
    if (error.message === 'API key not found') {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      )
    }
    
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to retrieve API key' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/api-keys/[id] - Update API key
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Require super admin permission
    const session = await requirePermission('system:manage')
    
    const keyId = params.id
    
    if (!keyId) {
      return NextResponse.json(
        { error: 'API key ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // Validate request body
    const validatedData = updateAPIKeySchema.parse(body)
    
    const updateRequest: UpdateAPIKeyRequest = {
      name: validatedData.name,
      description: validatedData.description,
      key: validatedData.key,
      rotationDays: validatedData.rotationDays,
      expiresAt: validatedData.expiresAt,
      status: validatedData.status
    }

    const result = await credentialManager.updateAPIKey(
      keyId,
      updateRequest,
      session.user.tenantId,
      session.user.id,
      session.user.role,
      session.user.permissions
    )

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.message, 
          details: result.errors,
          warnings: result.warnings 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('API Key update error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
            code: e.code
          }))
        },
        { status: 400 }
      )
    }
    
    if (error.message === 'API key not found') {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      )
    }
    
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update API key' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/api-keys/[id] - Delete API key
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Require super admin permission
    const session = await requirePermission('system:manage')
    
    const keyId = params.id
    
    if (!keyId) {
      return NextResponse.json(
        { error: 'API key ID is required' },
        { status: 400 }
      )
    }

    const result = await credentialManager.deleteAPIKey(
      keyId,
      session.user.tenantId,
      session.user.id,
      session.user.role,
      session.user.permissions
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('API Key deletion error:', error)
    
    if (error.message === 'API key not found') {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      )
    }
    
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to delete API key' },
      { status: 500 }
    )
  }
}