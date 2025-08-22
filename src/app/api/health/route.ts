import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const prisma = getPrisma()
    const startTime = Date.now()
    
    // Test database connection
    let dbStatus = 'unhealthy'
    let dbMessage = 'Database unavailable'
    let responseTime = 0
    
    if (prisma) {
      try {
        await prisma.$queryRaw`SELECT 1`
        responseTime = Date.now() - startTime
        dbStatus = responseTime < 1000 ? 'healthy' : 'degraded'
        dbMessage = `Connected in ${responseTime}ms`
      } catch (dbError) {
        responseTime = Date.now() - startTime
        dbMessage = dbError instanceof Error ? dbError.message : 'Database connection failed'
      }
    }
    
    const healthData = {
      status: dbStatus === 'healthy' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      services: {
        database: {
          status: dbStatus,
          responseTime,
          details: {
            connected: {
              status: dbStatus,
              message: dbMessage,
              responseTime
            }
          }
        }
      }
    }
    
    const statusCode = dbStatus === 'healthy' ? 200 : 207
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
