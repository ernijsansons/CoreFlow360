/**
 * CoreFlow360 - Postman Collection Generator
 * Generates and serves Postman collection for API testing
 */

import { NextRequest, NextResponse } from 'next/server'
import { openAPIGenerator } from '@/lib/documentation/openapi-generator'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication for sensitive API information
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Generate Postman collection
    const collection = openAPIGenerator.generatePostmanCollection()
    
    return NextResponse.json(collection, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="CoreFlow360-API.postman_collection.json"',
        'Cache-Control': 'private, max-age=300', // Cache for 5 minutes (private)
      },
    })
  } catch (error) {
    console.error('Postman collection generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate Postman collection' },
      { status: 500 }
    )
  }
}