import { NextRequest, NextResponse } from 'next/server'
import { healthCheck } from '@/lib/monitoring/production-monitor'

export async function GET(request: NextRequest) {
  try {
    const health = await healthCheck()
    
    // Return appropriate HTTP status based on health
    const status = health.status === 'healthy' ? 200 : 
                  health.status === 'degraded' ? 503 : 500

    return NextResponse.json(health, { status })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      { 
        status: 'critical', 
        error: 'Health check failed',
        timestamp: new Date().toISOString() 
      }, 
      { status: 500 }
    )
  }
}