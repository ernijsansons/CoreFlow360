/**
 * CoreFlow360 - SAML Configuration Management API
 * Admin endpoints for managing SAML SSO configurations
 */

import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { samlAuth, SAMLConfig } from '@/lib/auth/saml/saml-strategy'
import { withSignatureValidation } from '@/middleware/request-signature'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'
import { trackUserActivity } from '@/middleware/telemetry'

// Validation schemas
const createSAMLConfigSchema = z.object({
  idpName: z.string().min(1).max(50),
  displayName: z.string().min(1).max(100),
  entryPoint: z.string().url(),
  certificate: z.string().min(100), // X.509 certificate
  issuer: z.string().min(1),
  signatureAlgorithm: z.enum(['sha1', 'sha256', 'sha512']).optional(),
  identifierFormat: z.string().optional(),
  acceptedClockSkewMs: z.number().min(0).max(300000).optional(),
  attributeMapping: z
    .object({
      email: z.string().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      displayName: z.string().optional(),
      department: z.string().optional(),
      title: z.string().optional(),
      groups: z.string().optional(),
    })
    .optional(),
  allowedDomains: z.array(z.string()).optional(),
  autoProvisionUsers: z.boolean().optional(),
  defaultRole: z.enum(['USER', 'MANAGER', 'ADMIN']).optional(),
})

async function getHandler(request: NextRequest) {
  try {
    const session = await requirePermission('admin:sso')
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    // Get SAML configurations for the tenant
    const configurations = await prisma.sAMLConfiguration.findMany({
      where: {
        tenantId: session.user.tenantId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      orderBy: { createdAt: 'desc' },
    })

    // Get usage statistics
    const stats = await Promise.all(
      configurations.map(async (config) => {
        const userCount = await prisma.user.count({
          where: {
            tenantId: session.user.tenantId,
            authProvider: 'saml',
            metadata: {
              path: ['saml', 'idpName'],
              equals: config.idpName,
            },
          },
        })

        const lastLogin = await prisma.user.findFirst({
          where: {
            tenantId: session.user.tenantId,
            authProvider: 'saml',
            metadata: {
              path: ['saml', 'idpName'],
              equals: config.idpName,
            },
          },
          orderBy: {
            lastLoginAt: 'desc',
          },
          select: {
            lastLoginAt: true,
          },
        })

        return {
          ...config,
          stats: {
            activeUsers: userCount,
            lastLogin: lastLogin?.lastLoginAt,
          },
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      )
    }

    return NextResponse.json({ error: 'Failed to get SAML configurations' }, { status: 500 })
  }
}

async function postHandler(request: NextRequest) {
  try {
    const session = await requirePermission('admin:sso')
    const body = await request.json()

    // Validate input
    const validation = createSAMLConfigSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid configuration', details: validation.error.errors },
        { status: 400 }
      )
    }

    const data = validation.data

    // Check if IdP name already exists
    const existing = await prisma.sAMLConfiguration.findUnique({
      where: {
        tenantId_idpName: {
          tenantId: session.user.tenantId,
          idpName: data.idpName,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ error: 'IdP name already exists' }, { status: 409 })
    }

    // Generate callback URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const callbackUrl = `${baseUrl}/api/auth/saml/callback`

    // Create SAML configuration
    const config: SAMLConfig = {
      tenantId: session.user.tenantId,
      idpName: data.idpName,
      entryPoint: data.entryPoint,
      issuer: `${baseUrl}/saml/${session.user.tenantId}`,
      cert: data.certificate
        .replace(/-----BEGIN CERTIFICATE-----/g, '')
        .replace(/-----END CERTIFICATE-----/g, '')
        .replace(/\s/g, ''),
      callbackUrl,
      signatureAlgorithm: data.signatureAlgorithm,
      identifierFormat: data.identifierFormat,
      acceptedClockSkewMs: data.acceptedClockSkewMs,
      attributeMapping: data.attributeMapping,
      allowedDomains: data.allowedDomains,
      autoProvisionUsers: data.autoProvisionUsers ?? true,
      defaultRole: data.defaultRole,
    }

    // Initialize SAML strategy
    await samlAuth.initializeTenantSAML(config)

    // Create database record
    const dbConfig = await prisma.sAMLConfiguration.create({
      data: {
        id: uuidv4(),
        tenantId: session.user.tenantId,
        idpName: data.idpName,
        displayName: data.displayName,
        entryPoint: data.entryPoint,
        issuer: config.issuer,
        certificate: data.certificate,
        callbackUrl,
        signatureAlgorithm: data.signatureAlgorithm,
        identifierFormat: data.identifierFormat,
        acceptedClockSkewMs: data.acceptedClockSkewMs,
        attributeMapping: data.attributeMapping,
        allowedDomains: data.allowedDomains,
        autoProvisionUsers: data.autoProvisionUsers ?? true,
        defaultRole: data.defaultRole,
        isActive: true,
      },
    })

    // Track configuration creation
    trackUserActivity('saml_config_created', session.user.id, session.user.tenantId, {
      idpName: data.idpName,
      displayName: data.displayName,
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          ...dbConfig,
          metadataUrl: `/api/auth/saml/metadata/${session.user.tenantId}/${data.idpName}`,
          loginUrl: `/api/auth/saml/login/${session.user.tenantId}/${data.idpName}`,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      )
    }

    return NextResponse.json({ error: 'Failed to create SAML configuration' }, { status: 500 })
  }
}

async function patchHandler(request: NextRequest) {
  try {
    const session = await requirePermission('admin:sso')
    const body = await request.json()
    const { idpName, ...updates } = body

    if (!idpName) {
      return NextResponse.json({ error: 'IdP name is required' }, { status: 400 })
    }

    // Get existing configuration
    const existing = await prisma.sAMLConfiguration.findUnique({
      where: {
        tenantId_idpName: {
          tenantId: session.user.tenantId,
          idpName,
        },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'SAML configuration not found' }, { status: 404 })
    }

    // Update configuration
    const updated = await prisma.sAMLConfiguration.update({
      where: {
        tenantId_idpName: {
          tenantId: session.user.tenantId,
          idpName,
        },
      },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    })

    // Reinitialize SAML strategy if active
    if (updated.isActive) {
      const config: SAMLConfig = {
        tenantId: updated.tenantId,
        idpName: updated.idpName,
        entryPoint: updated.entryPoint,
        issuer: updated.issuer,
        cert: updated.certificate
          .replace(/-----BEGIN CERTIFICATE-----/g, '')
          .replace(/-----END CERTIFICATE-----/g, '')
          .replace(/\s/g, ''),
        callbackUrl: updated.callbackUrl,
        signatureAlgorithm: updated.signatureAlgorithm as unknown,
        identifierFormat: updated.identifierFormat || undefined,
        acceptedClockSkewMs: updated.acceptedClockSkewMs || undefined,
        attributeMapping: updated.attributeMapping as unknown,
        allowedDomains: updated.allowedDomains,
        autoProvisionUsers: updated.autoProvisionUsers,
        defaultRole: updated.defaultRole || undefined,
      }

      await samlAuth.initializeTenantSAML(config)
    }

    // Track configuration update
    trackUserActivity('saml_config_updated', session.user.id, session.user.tenantId, {
      idpName,
      changes: Object.keys(updates),
    })

    return NextResponse.json({
      success: true,
      data: updated,
    })
  } catch (error) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      )
    }

    return NextResponse.json({ error: 'Failed to update SAML configuration' }, { status: 500 })
  }
}

async function deleteHandler(request: NextRequest) {
  try {
    const session = await requirePermission('admin:sso')
    const { searchParams } = new URL(request.url)
    const idpName = searchParams.get('idpName')

    if (!idpName) {
      return NextResponse.json({ error: 'IdP name is required' }, { status: 400 })
    }

    // Check if configuration exists
    const existing = await prisma.sAMLConfiguration.findUnique({
      where: {
        tenantId_idpName: {
          tenantId: session.user.tenantId,
          idpName,
        },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'SAML configuration not found' }, { status: 404 })
    }

    // Check if there are active users
    const activeUsers = await prisma.user.count({
      where: {
        tenantId: session.user.tenantId,
        authProvider: 'saml',
        metadata: {
          path: ['saml', 'idpName'],
          equals: idpName,
        },
      },
    })

    if (activeUsers > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete configuration with active users',
          details: { activeUsers },
        },
        { status: 409 }
      )
    }

    // Soft delete (mark as inactive)
    await prisma.sAMLConfiguration.update({
      where: {
        tenantId_idpName: {
          tenantId: session.user.tenantId,
          idpName,
        },
      },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    })

    // Track configuration deletion
    trackUserActivity('saml_config_deleted', session.user.id, session.user.tenantId, {
      idpName,
    })

    return NextResponse.json({
      success: true,
      message: 'SAML configuration deactivated',
    })
  } catch (error) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      )
    }

    return NextResponse.json({ error: 'Failed to delete SAML configuration' }, { status: 500 })
  }
}

// Test SAML connection
async function testConnection(_request: NextRequest) {
  try {
    const session = await requirePermission('admin:sso')
    const body = await request.json()
    const { idpName } = body

    if (!idpName) {
      return NextResponse.json({ error: 'IdP name is required' }, { status: 400 })
    }

    // Get configuration
    const config = await prisma.sAMLConfiguration.findUnique({
      where: {
        tenantId_idpName: {
          tenantId: session.user.tenantId,
          idpName,
        },
      },
    })

    if (!config || !config.isActive) {
      return NextResponse.json(
        { error: 'SAML configuration not found or inactive' },
        { status: 404 }
      )
    }

    // Test connection by checking if we can reach the IdP
    try {
      const response = await fetch(config.entryPoint, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000), // 5 second timeout
      })

      const isReachable = response.ok || response.status === 405 // 405 is expected for HEAD

      return NextResponse.json({
        success: true,
        data: {
          idpName,
          entryPoint: config.entryPoint,
          reachable: isReachable,
          metadataUrl: `/api/auth/saml/metadata/${session.user.tenantId}/${idpName}`,
          loginUrl: `/api/auth/saml/login/${session.user.tenantId}/${idpName}`,
        },
      })
    } catch (error) {
      return NextResponse.json({
        success: false,
        data: {
          idpName,
          entryPoint: config.entryPoint,
          reachable: false,
          error: error.message,
        },
      })
    }
  } catch (error) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      )
    }

    return NextResponse.json({ error: 'Failed to test SAML connection' }, { status: 500 })
  }
}

// Apply signature validation to all endpoints
export const GET = withSignatureValidation(getHandler, {
  highSecurity: true,
})

export const POST = withSignatureValidation(postHandler, {
  highSecurity: true,
})

export const PATCH = withSignatureValidation(patchHandler, {
  highSecurity: true,
})

export const DELETE = withSignatureValidation(deleteHandler, {
  highSecurity: true,
})
