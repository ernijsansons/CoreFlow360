/**
 * CoreFlow360 - CSRF Token API Route
 * Generates CSRF tokens in Node.js runtime (not Edge)
 */

import { NextResponse } from 'next/server'
import { initializeCSRFProtection } from '@/lib/csrf'
import { getServerSession } from '@/lib/auth'

export async function GET() {
  try {
    // Check if user is authenticated
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Generate CSRF token
    const secret = process.env.API_KEY_SECRET || process.env.NEXTAUTH_SECRET
    if (!secret) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const csrfToken = await initializeCSRFProtection(secret)

    return NextResponse.json({ csrfToken })
  } catch (error) {
    console.error('CSRF token generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    )
  }
}