/**
 * CoreFlow360 - Interactive API Documentation
 * Serves Swagger UI for interactive API exploration
 */

import { NextRequest, NextResponse } from 'next/server'
import { openAPIGenerator } from '@/lib/documentation/openapi-generator'

export async function GET(request: NextRequest) {
  try {
    // Generate interactive documentation HTML
    const html = openAPIGenerator.generateInteractiveDocs()
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    })
  } catch (error) {
    console.error('Interactive docs generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate interactive documentation' },
      { status: 500 }
    )
  }
}