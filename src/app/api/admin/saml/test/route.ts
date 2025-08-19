/**
 * CoreFlow360 - SAML Test Connection Endpoint
 * Tests SAML IdP connectivity and configuration
 */

import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { withSignatureValidation } from '@/middleware/request-signature'
import { z } from 'zod'

const testSchema = z.object({
  idpName: z.string().min(1),
})

async function postHandler(request: NextRequest) {
  try {
    const session = await requirePermission('admin:sso')
    const body = await request.json()

    // Validate input
    const validation = testSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { idpName } = validation.data

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
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

      const response = await fetch(config.entryPoint, {
        method: 'HEAD',
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const isReachable = response.ok || response.status === 405 // 405 is expected for HEAD

      return NextResponse.json({
        success: true,
        data: {
          idpName,
          entryPoint: config.entryPoint,
          reachable: isReachable,
          responseStatus: response.status,
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
          error: error.name === 'AbortError' ? 'Connection timeout' : error.message,
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

export const POST = withSignatureValidation(postHandler, {
  highSecurity: true,
})
