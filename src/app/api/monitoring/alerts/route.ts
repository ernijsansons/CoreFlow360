import { NextRequest, NextResponse } from 'next/server'
import { productionMonitor } from '@/lib/monitoring/production-monitor'

export async function GET(request: NextRequest) {
  try {
    const alerts = productionMonitor.getActiveAlerts()
    const recentMetrics = productionMonitor.getRecentMetrics(5)
    const systemHealth = productionMonitor.getSystemHealth()

    return NextResponse.json({
      health: systemHealth,
      activeAlerts: alerts.length,
      alerts,
      recentMetrics,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to get monitoring alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Handle incoming alerts from monitoring system
    console.log('Received monitoring alert:', body)
    
    // In production, this could:
    // 1. Forward to Slack/Teams
    // 2. Send to PagerDuty
    // 3. Trigger incident response
    // 4. Send email notifications
    
    if (body.severity === 'critical') {
      await handleCriticalAlert(body)
    }
    
    return NextResponse.json({ 
      success: true, 
      alertProcessed: body.id 
    })
  } catch (error) {
    console.error('Failed to process alert:', error)
    return NextResponse.json(
      { error: 'Failed to process alert' },
      { status: 500 }
    )
  }
}

async function handleCriticalAlert(alert: any) {
  // Critical alert handling logic
  const webhookUrl = process.env.MONITORING_WEBHOOK_URL
  
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 CRITICAL ALERT: ${alert.name}`,
          attachments: [{
            color: 'danger',
            fields: [
              { title: 'Metric', value: alert.metric, short: true },
              { title: 'Value', value: alert.value, short: true },
              { title: 'Threshold', value: alert.threshold, short: true },
              { title: 'Time', value: alert.timestamp, short: true }
            ]
          }]
        })
      })
    } catch (error) {
      console.error('Failed to send critical alert:', error)
    }
  }
}