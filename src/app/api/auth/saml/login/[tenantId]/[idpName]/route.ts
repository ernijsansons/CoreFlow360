/**
 * CoreFlow360 - SAML Login Endpoint
 * Initiates SAML authentication flow for a specific tenant and IdP
 */

import { NextRequest, NextResponse } from 'next/server';
import { samlAuth } from '@/lib/auth/saml/saml-strategy';
import { withTelemetry } from '@/middleware/telemetry';
import { z } from 'zod';

const paramsSchema = z.object({
  tenantId: z.string().uuid(),
  idpName: z.string().min(1)
});

async function handler(
  request: NextRequest,
  { params }: { params: { tenantId: string; idpName: string } }
) {
  try {
    // Validate parameters
    const validation = paramsSchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      );
    }

    const { tenantId, idpName } = validation.data;

    // Get SAML strategy
    const strategy = samlAuth.getStrategy(tenantId, idpName);
    if (!strategy) {
      return NextResponse.json(
        { error: 'SAML provider not configured' },
        { status: 404 }
      );
    }

    // Store return URL in session if provided
    const returnUrl = request.nextUrl.searchParams.get('returnUrl') || '/dashboard';
    
    // Create authentication request
    const authUrl = await new Promise<string>((resolve, reject) => {
      strategy.getAuthorizeUrl(
        {
          // RelayState can be used to pass the return URL through the SAML flow
          RelayState: JSON.stringify({
            returnUrl,
            tenantId,
            idpName,
            timestamp: Date.now()
          })
        },
        (err, url) => {
          if (err) reject(err);
          else resolve(url);
        }
      );
    });

    // Redirect to IdP
    return NextResponse.redirect(authUrl);

  } catch (error) {
    console.error('SAML login error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate SAML login' },
      { status: 500 }
    );
  }
}

export const GET = withTelemetry(handler);