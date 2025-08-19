/**
 * CoreFlow360 - SAML Callback Endpoint
 * Handles SAML response from IdP and creates user session
 */

import { NextRequest, NextResponse } from 'next/server'
import { samlAuth } from '@/lib/auth/saml/saml-strategy'
import { createSession } from '@/lib/auth/session-manager'
import { withTelemetry, trackUserActivity } from '@/middleware/telemetry'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'

async function handler(request: NextRequest) {
  try {
    // Get SAML response from request body
    const formData = await request.formData()
    const samlResponse = formData.get('SAMLResponse') as string
    const relayState = formData.get('RelayState') as string

    if (!samlResponse) {
      return NextResponse.json({ error: 'Missing SAML response' }, { status: 400 })
    }

    // Parse RelayState to get context
    let context: unknown = {}
    try {
      context = JSON.parse(relayState || '{}')
    } catch (e) {
      context = { returnUrl: '/dashboard' }
    }

    const { tenantId, idpName, returnUrl = '/dashboard' } = context

    if (!tenantId || !idpName) {
      return NextResponse.json({ error: 'Missing tenant or IdP information' }, { status: 400 })
    }

    // Get SAML strategy
    const strategy = samlAuth.getStrategy(tenantId, idpName)
    if (!strategy) {
      return NextResponse.json({ error: 'SAML provider not configured' }, { status: 404 })
    }

    // Validate SAML response
    const isValid = await samlAuth.validateResponseSignature(samlResponse, tenantId, idpName)

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid SAML response signature' }, { status: 401 })
    }

    // Process SAML response using passport-saml
    const user = await new Promise((resolve, reject) => {
      const mockReq = {
        body: {
          SAMLResponse: samlResponse,
          RelayState: relayState,
        },
        query: {},
        headers: {},
      }

      strategy.authenticate(mockReq as unknown, {
        success: (user: unknown) => resolve(user),
        error: (err: unknown) => reject(err),
        fail: (info: unknown) => reject(new Error(info || 'Authentication failed')),
      })
    })

    if (!user) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }

    // Create session
    const sessionToken = await createSession({
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
      authProvider: 'saml',
      authProviderId: idpName,
      metadata: {
        samlSessionIndex: uuidv4(), // For SAML logout
        loginTime: new Date().toISOString(),
      },
    })

    // Track successful login
    trackUserActivity('saml_login_success', user.id, user.tenantId, {
      idpName,
      email: user.email,
      role: user.role,
    })

    // Set session cookie
    const cookieStore = cookies()
    cookieStore.set('session-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    // Redirect to return URL
    return NextResponse.redirect(new URL(returnUrl, request.url))
  } catch (error) {
    // Track failed login
    trackUserActivity('saml_login_failure', 'unknown', 'unknown', {
      error: error.message,
    })

    // Redirect to error page
    return NextResponse.redirect(new URL(`/auth/error?error=saml_callback_failed`, request.url))
  }
}

export const POST = withTelemetry(handler)
