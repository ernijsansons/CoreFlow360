import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Check environment variables
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL'
    ]
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
    
    if (missingVars.length > 0) {
      return Response.json({
        status: 'error',
        message: `Missing environment variables: ${missingVars.join(', ')}`,
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime
      }, { status: 500 })
    }

    // Check database connection
    let dbStatus = 'unknown'
    try {
      await prisma.$queryRaw`SELECT 1`
      dbStatus = 'connected'
    } catch (dbError) {
      dbStatus = 'error'
      console.error('Database health check failed:', dbError)
    }

    // Check build environment
    const buildInfo = {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      buildingForVercel: process.env.BUILDING_FOR_VERCEL,
      ci: process.env.CI,
      nextPhase: process.env.NEXT_PHASE
    }

    // Check if we're in a build context
    const isBuildTime = typeof window === 'undefined' && 
                       (process.env.NODE_ENV === 'production' || process.env.CI === 'true')

    const healthStatus = {
      status: dbStatus === 'connected' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      services: {
        database: dbStatus,
        environment: missingVars.length === 0 ? 'configured' : 'missing_vars'
      },
      buildInfo,
      isBuildTime,
      version: process.env.npm_package_version || 'unknown',
      commit: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown'
    }

    const statusCode = healthStatus.status === 'healthy' ? 200 : 503
    
    return Response.json(healthStatus, { status: statusCode })
    
  } catch (error) {
    console.error('Health check failed:', error)
    
    return Response.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime
    }, { status: 500 })
  }
}
