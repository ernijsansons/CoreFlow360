/**
 * CoreFlow360 - Performance Dashboard API
 * Real-time performance metrics and system health endpoints
 */

import { NextRequest, NextResponse } from 'next/server'
import { performanceDashboard } from '@/lib/analytics/performance-dashboard'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'
    const period = searchParams.get('period') as '1h' | '24h' | '7d' | '30d' || '24h'
    const metrics = searchParams.get('metrics')?.split(',') || []

    switch (type) {
      case 'overview':
        const dashboard = await performanceDashboard.getRealTimeDashboard()
        return NextResponse.json(dashboard)

      case 'health':
        const health = await performanceDashboard.getSystemHealth()
        return NextResponse.json(health)

      case 'metrics':
        if (metrics.length === 0) {
          return NextResponse.json({ error: 'Metrics parameter required' }, { status: 400 })
        }
        const metricsData = await performanceDashboard.getMetrics(metrics, period)
        return NextResponse.json(metricsData)

      case 'trends':
        if (metrics.length === 0) {
          return NextResponse.json({ error: 'Metrics parameter required' }, { status: 400 })
        }
        const trends = await performanceDashboard.getPerformanceTrends(metrics, period)
        return NextResponse.json(trends)

      case 'alerts':
        const alerts = await performanceDashboard.getActiveAlerts()
        return NextResponse.json(alerts)

      case 'ux':
        const userExperience = await performanceDashboard.getUserExperienceMetrics()
        return NextResponse.json(userExperience)

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Performance dashboard API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'record_metric':
        const { name, value, unit, tags, threshold } = body
        if (!name || value === undefined) {
          return NextResponse.json({ error: 'Name and value required' }, { status: 400 })
        }
        
        await performanceDashboard.recordMetric(name, value, unit, tags, threshold)
        return NextResponse.json({ success: true })

      case 'record_web_vital':
        const { vital, vitalValue, id } = body
        if (!vital || vitalValue === undefined) {
          return NextResponse.json({ error: 'Vital name and value required' }, { status: 400 })
        }
        
        await performanceDashboard.recordMetric(
          `web_vital_${vital}`,
          vitalValue,
          'ms',
          { type: 'web_vital', id: id || 'unknown' }
        )
        return NextResponse.json({ success: true })

      case 'record_user_interaction':
        const { interaction, duration, success } = body
        if (!interaction || duration === undefined) {
          return NextResponse.json({ error: 'Interaction and duration required' }, { status: 400 })
        }
        
        await performanceDashboard.recordMetric(
          'user_interaction',
          duration,
          'ms',
          { action: interaction, success: success?.toString() || 'true' }
        )
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Performance dashboard POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication and admin role
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    switch (type) {
      case 'export':
        const startDate = searchParams.get('start') ? new Date(searchParams.get('start')!) : new Date(Date.now() - 86400000)
        const endDate = searchParams.get('end') ? new Date(searchParams.get('end')!) : new Date()
        const format = searchParams.get('format') as 'json' | 'csv' || 'json'
        
        const exportData = await performanceDashboard.exportData(startDate, endDate, format)
        
        return new NextResponse(exportData, {
          status: 200,
          headers: {
            'Content-Type': format === 'csv' ? 'text/csv' : 'application/json',
            'Content-Disposition': `attachment; filename="performance-data-${Date.now()}.${format}"`,
          },
        })

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Performance dashboard DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}