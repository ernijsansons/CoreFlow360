/**
 * CoreFlow360 - CSP Violation Reporting Endpoint
 * Collect and process Content Security Policy violations for security monitoring
 */

import { NextRequest, NextResponse } from 'next/server'
import { reportCSPViolation } from '@/lib/security/advanced-security-headers'
import { productionMonitor } from '@/lib/monitoring/production-alerts'

export async function POST(request: NextRequest) {
  try {
    // Parse CSP violation report
    const violation = await request.json()
    
    // Validate the violation report structure
    if (!violation || typeof violation !== 'object') {
      return NextResponse.json({ error: 'Invalid violation report' }, { status: 400 })
    }

    // Extract violation details
    const violationDetails = {
      'blocked-uri': violation['blocked-uri'] || violation.blockedURI,
      'violated-directive': violation['violated-directive'] || violation.violatedDirective,
      'original-policy': violation['original-policy'] || violation.originalPolicy,
      'user-agent': request.headers.get('user-agent'),
      'referrer': request.headers.get('referer'),
      'source-file': violation['source-file'] || violation.sourceFile,
      'line-number': violation['line-number'] || violation.lineNumber,
      'column-number': violation['column-number'] || violation.columnNumber,
      'sample': violation.sample,
      timestamp: new Date().toISOString(),
    }

    // Report the violation
    await reportCSPViolation(violationDetails)

    // Record metrics
    productionMonitor.recordMetric('csp_violation', 1)
    productionMonitor.recordMetric('security_event', 1)

    // Log for debugging (only in non-production)
    if (process.env.NODE_ENV !== 'production') {
      console.log('CSP Violation Report:', violationDetails)
    }

    return NextResponse.json({ status: 'reported' }, { status: 204 })
  } catch (error) {
    console.error('CSP violation reporting error:', error)
    return NextResponse.json({ error: 'Failed to process violation report' }, { status: 500 })
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { 
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
}