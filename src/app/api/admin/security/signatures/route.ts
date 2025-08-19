/**
 * CoreFlow360 - Request Signature Management API
 * Admin endpoint for managing and monitoring request signatures
 */

import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/auth'
import { withSignatureValidation } from '@/middleware/request-signature'
import { requestSigner } from '@/lib/security/request-signing'

async function getHandler(_request: NextRequest) {
  try {
    // Require admin permission
    await requirePermission('admin:security')

    const stats = requestSigner.getStats()

    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        endpoints: {
          signed: [
            '/api/admin/*',
            '/api/voice/webhook',
            '/api/stripe/webhook',
            '/api/intelligence/*',
            '/api/crm/engagement/*',
            '/api/subscriptions/checkout',
            '/api/customers/*',
            '/api/metrics/*',
          ],
          highSecurity: [
            '/api/admin/users',
            '/api/admin/tenants',
            '/api/stripe/webhook',
            '/api/subscriptions/checkout',
            '/api/voice/webhook',
          ],
        },
        environment: {
          enabled:
            process.env.NODE_ENV === 'production' || process.env.DISABLE_REQUEST_SIGNING !== 'true',
          algorithm: stats.config.algorithm,
          timestampTolerance: stats.config.timestampTolerance,
        },
      },
    })
  } catch (error) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      )
    }

    return NextResponse.json({ error: 'Failed to retrieve signature statistics' }, { status: 500 })
  }
}

// Apply high security signature validation to this admin endpoint
export const GET = withSignatureValidation(getHandler, {
  highSecurity: true,
  skipInDevelopment: false, // Always require signatures for admin endpoints
})
