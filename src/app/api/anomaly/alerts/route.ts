/**
 * CoreFlow360 - Anomaly Alerts API
 * API endpoints for managing anomaly alerts
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from '@/lib/auth'
import { BusinessAnomalyMonitor } from '@/lib/anomaly/business-anomaly-monitor'

const AlertActionSchema = z.object({
  alertId: z.string(),
  action: z.enum(['acknowledge', 'resolve']),
  resolution: z.string().optional(),
  acknowledgedBy: z.string().optional(),
})

// Global monitor instance (in production, this would be properly managed)
let globalMonitor: BusinessAnomalyMonitor | null = null

function getMonitor(): BusinessAnomalyMonitor {
  if (!globalMonitor) {
    globalMonitor = new BusinessAnomalyMonitor()
  }
  return globalMonitor
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'active', 'acknowledged', 'resolved'
    const severity = searchParams.get('severity') // 'critical', 'high', 'medium', 'low'
    const limit = parseInt(searchParams.get('limit') || '50')

    const monitor = getMonitor()
    let alerts = monitor.getActiveAlerts()

    // Filter by status
    if (status) {
      switch (status) {
        case 'active':
          alerts = alerts.filter((a) => !a.acknowledged && !a.resolved)
          break
        case 'acknowledged':
          alerts = alerts.filter((a) => a.acknowledged && !a.resolved)
          break
        case 'resolved':
          alerts = alerts.filter((a) => a.resolved)
          break
      }
    }

    // Filter by severity
    if (severity) {
      alerts = alerts.filter((a) => a.severity === severity)
    }

    // Limit results
    alerts = alerts.slice(0, limit)

    // Calculate summary statistics
    const summary = {
      total: alerts.length,
      critical: alerts.filter((a) => a.severity === 'critical').length,
      high: alerts.filter((a) => a.severity === 'high').length,
      medium: alerts.filter((a) => a.severity === 'medium').length,
      low: alerts.filter((a) => a.severity === 'low').length,
      acknowledged: alerts.filter((a) => a.acknowledged).length,
      resolved: alerts.filter((a) => a.resolved).length,
    }

    return NextResponse.json({
      alerts,
      summary,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { alertId, action, resolution, acknowledgedBy } = AlertActionSchema.parse(body)

    const monitor = getMonitor()
    let success = false

    switch (action) {
      case 'acknowledge':
        success = monitor.acknowledgeAlert(
          alertId,
          acknowledgedBy || session.user.email || 'unknown'
        )
        break
      case 'resolve':
        if (!resolution) {
          return NextResponse.json(
            { error: 'Resolution is required for resolve action' },
            { status: 400 }
          )
        }
        success = monitor.resolveAlert(alertId, resolution)
        break
    }

    if (!success) {
      return NextResponse.json({ error: 'Alert not found or action failed' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      action,
      alertId,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Get alert details
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const alertId = searchParams.get('id')

    if (!alertId) {
      return NextResponse.json({ error: 'Alert ID is required' }, { status: 400 })
    }

    const monitor = getMonitor()
    const alerts = monitor.getActiveAlerts()
    const alert = alerts.find((a) => a.id === alertId)

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    return NextResponse.json({
      alert,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
