/**
 * CoreFlow360 - SAML Service Provider Metadata Endpoint
 * Provides SP metadata for IdP configuration
 */

import { NextRequest, NextResponse } from 'next/server'
import { samlAuth } from '@/lib/auth/saml/saml-strategy'
import { requirePermission } from '@/lib/auth'
import { z } from 'zod'

const paramsSchema = z.object({
  tenantId: z.string().uuid(),
  idpName: z.string().min(1),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string; idpName: string }> }
) {
  try {
    // Await and validate parameters
    const resolvedParams = await params
    const validation = paramsSchema.safeParse(resolvedParams)
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    const { tenantId, idpName } = validation.data

    // Require admin permission for the tenant
    const session = await requirePermission('admin:sso')
    if (session.user.tenantId !== tenantId && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Generate SP metadata
    const metadata = samlAuth.generateSPMetadata(tenantId, idpName)

    if (!metadata) {
      return NextResponse.json({ error: 'SAML provider not configured' }, { status: 404 })
    }

    // Return XML metadata
    return new NextResponse(metadata, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Content-Disposition': `attachment; filename="sp-metadata-${idpName}.xml"`,
      },
    })
  } catch (error) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      )
    }

    return NextResponse.json({ error: 'Failed to generate metadata' }, { status: 500 })
  }
}
