2/**
 * CoreFlow360 - Health Check & Monitoring API
 * Production readiness and system health monitoring
 */

import { NextRequest, NextResponse } from 'next/server'
import { getHealthChecker, HealthCheckOptions } from '@/lib/health/unified-health-checker'
import { createErrorContext } from '@/lib/error-handler/createErrorContext'
import { handleError } from '@/lib/error-handler'

// Initialize health checker with default checks on first import
const healthChecker = getHealthChecker()
healthChecker.initializeDefaultChecks()

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse query parameters
    const detailed = request.nextUrl.searchParams.get('detailed') === 'true'
    const includeMetrics = request.nextUrl.searchParams.get('metrics') === 'true'
    const includeSystem = request.nextUrl.searchParams.get('system') === 'true'
    
    // Configure health check options
    const options: HealthCheckOptions = {
      detailed,
      includeMetrics,
      includeSystem: includeSystem || detailed,
      includePerformance: detailed,
      timeout: 5000
    }
    
    // Run comprehensive health check
    const report = await healthChecker.runAllChecks(options)
    
    // Create standardized response
    const response = healthChecker.createHealthResponse(report, request)
    
    return new NextResponse(JSON.stringify(response.body), {
      status: response.statusCode,
      headers: response.headers
    })
    
  } catch (error: any) {
    const context = createErrorContext(request, '/api/health')
    return handleError(error, context)
  }
}

// Readiness probe endpoint - checks critical dependencies
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Run basic health checks for readiness
    const report = await healthChecker.runAllChecks({ 
      timeout: 2000,
      detailed: false 
    })
    
    // Check critical services (database and configuration)
    const database = report.services.database
    const configuration = report.services.configuration
    
    const isReady = 
      database?.status === 'healthy' && 
      configuration?.status === 'healthy'
    
    if (isReady) {
      return NextResponse.json({ 
        status: 'ready',
        timestamp: report.timestamp 
      }, { status: 200 })
    } else {
      return NextResponse.json({ 
        status: 'not ready',
        database: database?.status || 'unknown',
        configuration: configuration?.status || 'unknown',
        timestamp: report.timestamp
      }, { status: 503 })
    }
    
  } catch (error: any) {
    const context = createErrorContext(request, '/api/health', { method: 'POST' })
    return handleError(error, context)
  }
}