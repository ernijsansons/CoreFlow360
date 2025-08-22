import { NextRequest, NextResponse } from 'next/server'
import { handleHealthCheck } from '@/lib/monitoring/production-alerts'

export async function GET(request: NextRequest) {
  try {
    // Use comprehensive production monitoring
    const healthData = await handleHealthCheck()
    
    // Return appropriate HTTP status based on health
    const statusCode = healthData.status === 'healthy' ? 200 : 
                      healthData.status === 'degraded' ? 207 : 503
    
    return NextResponse.json(healthData, { status: statusCode })
  } catch (error) {
    console.error('Health check error:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 503 })
  }
}

// Support HEAD requests for simple uptime checks
export async function HEAD(request: NextRequest) {
  try {
    const healthData = await handleHealthCheck()
    const statusCode = healthData.status === 'healthy' ? 200 : 503
    
    return new NextResponse(null, { 
      status: statusCode,
      headers: {
        'X-Health-Status': healthData.status,
        'X-Uptime': healthData.uptime.toString(),
      }
    })
  } catch (error) {
    return new NextResponse(null, { status: 503 })
  }
}
