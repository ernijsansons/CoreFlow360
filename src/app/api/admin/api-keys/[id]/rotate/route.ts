/**
 * CoreFlow360 - API Key Rotation Route
 * Secure endpoint for API key rotation operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { credentialManager } from '@/lib/security/credential-manager'
import { getServerSession, requirePermission } from '@/lib/auth'
import { rotateAPIKeySchema } from '@/lib/api-keys/validation'
import { RotateAPIKeyRequest } from '@/types/api-keys'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

/**
 * POST /api/admin/api-keys/[id]/rotate - Rotate API key
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Require super admin permission
    const session = await requirePermission('system:manage')
    
    const { id: keyId } = await params
    
    if (!keyId) {
      return NextResponse.json(
        { error: 'API key ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // Validate request body
    const validatedData = rotateAPIKeySchema.parse(body)
    
    const rotateRequest: RotateAPIKeyRequest = {
      newKey: validatedData.newKey,
      reason: validatedData.reason,
      scheduleRotation: validatedData.scheduleRotation,
      rotationDate: validatedData.rotationDate
    }

    const result = await credentialManager.rotateAPIKey(
      keyId,
      rotateRequest,
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
    console.error('API Key rotation error:', error)
    
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
      { error: 'Failed to rotate API key' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/api-keys/[id]/rotate - Get rotation history and recommendations
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

    // Get the API key details first
    const apiKeyResponse = await credentialManager.getAPIKey(
      keyId,
      session.user.tenantId,
      session.user.role,
      session.user.permissions
    )

    // Filter audit log for rotation events
    const rotationHistory = apiKeyResponse.auditLog.filter(
      event => event.action === 'ROTATED' || event.action === 'CREATED'
    )

    // Calculate rotation recommendations
    const key = apiKeyResponse.key
    const daysSinceLastRotation = Math.floor(
      (Date.now() - key.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
    )
    
    const rotationStatus = {
      isOverdue: daysSinceLastRotation > key.rotationDays,
      daysUntilRotation: key.rotationDays - daysSinceLastRotation,
      daysSinceLastRotation,
      recommendedRotationDays: key.rotationDays,
      nextRotationDate: new Date(
        key.updatedAt.getTime() + (key.rotationDays * 24 * 60 * 60 * 1000)
      )
    }

    const recommendations = []
    
    if (rotationStatus.isOverdue) {
      recommendations.push({
        type: 'URGENT',
        priority: 'HIGH',
        message: `Key is ${Math.abs(rotationStatus.daysUntilRotation)} days overdue for rotation`,
        action: 'Rotate immediately'
      })
    } else if (rotationStatus.daysUntilRotation <= 7) {
      recommendations.push({
        type: 'WARNING',
        priority: 'MEDIUM',
        message: `Key rotation due in ${rotationStatus.daysUntilRotation} days`,
        action: 'Schedule rotation soon'
      })
    }

    // Add security score based recommendations
    if (key.securityScore.score < 50) {
      recommendations.push({
        type: 'SECURITY',
        priority: 'HIGH',
        message: 'Low security score detected',
        action: 'Consider immediate rotation and security review'
      })
    }

    return NextResponse.json({
      rotationStatus,
      rotationHistory,
      recommendations,
      securityScore: key.securityScore
    })
  } catch (error: any) {
    console.error('API Key rotation info error:', error)
    
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
      { error: 'Failed to retrieve rotation information' },
      { status: 500 }
    )
  }
}