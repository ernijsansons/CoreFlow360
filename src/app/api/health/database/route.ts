/**
 * Database Health Check API Endpoint
 * Dedicated endpoint for database connectivity testing
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Test database connection with a simple query
    await prisma.$queryRaw`SELECT 1`
    
    // Test table access
    const tenantCount = await prisma.tenant.count()
    
    const responseTime = Date.now() - startTime

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'postgresql',
      connection: 'active',
      tenant_count: tenantCount,
      response_time_ms: responseTime,
      checks: {
        connection: true,
        query_execution: true,
        table_access: true
      }
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Response-Time': `${responseTime}ms`
      }
    })
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'postgresql',
      connection: 'failed',
      error: error instanceof Error ? error.message : 'Unknown database error',
      response_time_ms: responseTime,
      checks: {
        connection: false,
        query_execution: false,
        table_access: false
      }
    }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Response-Time': `${responseTime}ms`
      }
    })
  }
}