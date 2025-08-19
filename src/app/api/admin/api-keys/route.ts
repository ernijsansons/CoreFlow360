/**
 * CoreFlow360 - API Key Management Routes
 * Secure endpoints for SUPER_ADMIN API key operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { credentialManager } from '@/lib/security/credential-manager'
import { getServerSession, requirePermission } from '@/lib/auth'
import { createAPIKeySchema } from '@/lib/api-keys/validation'
import { APIKeyFilter, CreateAPIKeyRequest } from '@/types/api-keys'
import {
  securityMiddleware,
  formatErrorResponse,
  sanitizeResponse,
  sanitizeInput,
  auditSecurityEvent,
} from '@/lib/api-keys/middleware'

/**
 * GET /api/admin/api-keys - List API keys with filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Apply comprehensive security middleware
    const securityResult = await securityMiddleware(request, 'read')
    if (!securityResult.isValid) {
      return formatErrorResponse(securityResult.error!, securityResult.statusCode!)
    }

    // Require super admin permission
    const session = await requirePermission('system:manage')

    const { searchParams } = new URL(request.url)

    // Parse and sanitize query parameters
    const filter: APIKeyFilter = {
      status: searchParams.get('status')?.split(',') as unknown,
      vendor: searchParams
        .get('vendor')
        ?.split(',')
        .map((v) => sanitizeInput(v)),
      securityLevel: searchParams.get('securityLevel')?.split(',') as unknown,
      searchTerm: searchParams.get('search')
        ? sanitizeInput(searchParams.get('search')!)
        : undefined,
      lastUsedSince: searchParams.get('lastUsedSince')
        ? new Date(searchParams.get('lastUsedSince')!)
        : undefined,
      expiringBefore: searchParams.get('expiringBefore')
        ? new Date(searchParams.get('expiringBefore')!)
        : undefined,
      sortBy: (searchParams.get('sortBy') as unknown) || 'updated_at',
      sortOrder: (searchParams.get('sortOrder') as unknown) || 'desc',
      limit: Math.min(searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50, 100), // Max 100
      offset: Math.max(searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0, 0),
    }

    const result = await credentialManager.listAPIKeys(
      session.user.tenantId,
      filter,
      session.user.role,
      session.user.permissions
    )

    // Audit successful operation
    await auditSecurityEvent(
      'API_KEYS_LISTED',
      {
        count: result.keys.length,
        filter: { ...filter, searchTerm: filter.searchTerm ? '[REDACTED]' : undefined },
      },
      request
    )

    return NextResponse.json(sanitizeResponse(result))
  } catch (error: unknown) {
    await auditSecurityEvent(
      'API_KEYS_LIST_ERROR',
      {
        error: error.message,
      },
      request
    )

    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return formatErrorResponse('Insufficient permissions', 403)
    }

    return formatErrorResponse('Failed to retrieve API keys', 500)
  }
}

/**
 * POST /api/admin/api-keys - Create new API key
 */
export async function POST(request: NextRequest) {
  try {
    // Apply comprehensive security middleware
    const securityResult = await securityMiddleware(request, 'create')
    if (!securityResult.isValid) {
      return formatErrorResponse(securityResult.error!, securityResult.statusCode!)
    }

    // Require super admin permission
    const session = await requirePermission('system:manage')

    const body = await request.json()

    // Sanitize input data
    const sanitizedBody = {
      ...body,
      name: sanitizeInput(body.name),
      description: body.description ? sanitizeInput(body.description) : undefined,
      service: sanitizeInput(body.service),
    }

    // Validate request body
    const validatedData = createAPIKeySchema.parse(sanitizedBody)

    const createRequest: CreateAPIKeyRequest = {
      service: validatedData.service,
      name: validatedData.name,
      description: validatedData.description,
      key: validatedData.key,
      rotationDays: validatedData.rotationDays,
      expiresAt: validatedData.expiresAt,
      vendorId: validatedData.vendorId,
    }

    const result = await credentialManager.createAPIKey(
      createRequest,
      session.user.tenantId,
      session.user.id,
      session.user.role,
      session.user.permissions
    )

    if (!result.success) {
      await auditSecurityEvent(
        'API_KEY_CREATE_FAILED',
        {
          service: createRequest.service,
          name: createRequest.name,
          error: result.message,
        },
        request
      )

      return NextResponse.json(
        {
          error: result.message,
          details: result.errors,
          warnings: result.warnings,
        },
        { status: 400 }
      )
    }

    // Audit successful creation
    await auditSecurityEvent(
      'API_KEY_CREATED',
      {
        service: createRequest.service,
        name: createRequest.name,
        keyId: result.data?.keyId,
      },
      request
    )

    return NextResponse.json(sanitizeResponse(result), { status: 201 })
  } catch (error: unknown) {
    await auditSecurityEvent(
      'API_KEY_CREATE_ERROR',
      {
        error: error.message,
      },
      request
    )

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
            code: e.code,
          })),
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }

    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return formatErrorResponse('Insufficient permissions', 403)
    }

    return formatErrorResponse('Failed to create API key', 500)
  }
}

/**
 * DELETE /api/admin/api-keys - Bulk delete API keys
 */
export async function DELETE(request: NextRequest) {
  try {
    // Require super admin permission
    const session = await requirePermission('system:manage')

    const { searchParams } = new URL(request.url)
    const keyIds = searchParams.get('ids')?.split(',')

    if (!keyIds || keyIds.length === 0) {
      return NextResponse.json({ error: 'No API key IDs provided' }, { status: 400 })
    }

    const results = []

    for (const keyId of keyIds) {
      try {
        const result = await credentialManager.deleteAPIKey(
          keyId.trim(),
          session.user.tenantId,
          session.user.id,
          session.user.role,
          session.user.permissions
        )
        results.push({ keyId, success: result.success, message: result.message })
      } catch (error: unknown) {
        results.push({ keyId, success: false, message: error.message })
      }
    }

    const successCount = results.filter((r) => r.success).length
    const failureCount = results.length - successCount

    return NextResponse.json({
      success: failureCount === 0,
      message: `${successCount} keys deleted successfully${failureCount > 0 ? `, ${failureCount} failed` : ''}`,
      results,
    })
  } catch (error: unknown) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    return NextResponse.json({ error: 'Failed to delete API keys' }, { status: 500 })
  }
}
