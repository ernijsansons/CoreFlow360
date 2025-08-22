/**
 * CoreFlow360 - OpenAPI Specification Endpoint
 * Serves the generated OpenAPI specification in JSON format
 */

import { NextRequest, NextResponse } from 'next/server'
import { openAPIGenerator } from '@/lib/documentation/openapi-generator'

export async function GET(request: NextRequest) {
  try {
    // Generate the OpenAPI specification
    const spec = openAPIGenerator.generateOpenAPISpec()
    
    return NextResponse.json(spec, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('OpenAPI generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate OpenAPI specification' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}