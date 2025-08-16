/**
 * CoreFlow360 - Detailed Health Check API
 * Comprehensive health monitoring with system metrics
 */

import { NextRequest, NextResponse } from 'next/server'
import { getHealthChecker } from '@/lib/health/unified-health-checker'
import { createErrorContext } from '@/lib/error-handler/createErrorContext'
import { handleError } from '@/lib/error-handler'

// Get health checker instance
const healthChecker = getHealthChecker()

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Configure detailed health check with all options enabled
    const options = {
      detailed: true,
      includeMetrics: true,
      includeSystem: true,
      includePerformance: true,
      timeout: 10000 // Longer timeout for detailed check
    }
    
    // Run comprehensive health check
    const report = await healthChecker.runAllChecks(options)
    
    // Create standardized response with detailed information
    const response = healthChecker.createHealthResponse(report, request)
    
    return new NextResponse(JSON.stringify(response.body, null, 2), {
      status: response.statusCode,
      headers: {
        ...response.headers,
        'X-Health-Detail-Level': 'comprehensive'
      }
    })
    
  } catch (error: any) {
    const context = createErrorContext(request, '/api/health/detailed')
    return handleError(error, context)
  }
}