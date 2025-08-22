import { NextRequest, NextResponse } from 'next/server'
import { productionMonitor } from '@/lib/monitoring/production-monitor'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const count = parseInt(searchParams.get('count') || '10')
    
    const metrics = productionMonitor.getRecentMetrics(count)
    const health = productionMonitor.getSystemHealth()
    const alerts = productionMonitor.getActiveAlerts()
    
    return NextResponse.json({
      health,
      alertsCount: alerts.length,
      metrics,
      summary: {
        totalMetricPoints: metrics.length,
        oldestTimestamp: metrics[0]?.timestamp,
        latestTimestamp: metrics[metrics.length - 1]?.timestamp
      }
    })
  } catch (error) {
    console.error('Failed to get metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const customMetric = await request.json()
    
    // Force a metrics collection cycle
    const freshMetrics = await productionMonitor.collectMetrics()
    
    return NextResponse.json({
      success: true,
      latestMetrics: freshMetrics,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to collect metrics:', error)
    return NextResponse.json(
      { error: 'Failed to collect metrics' },
      { status: 500 }
    )
  }
}