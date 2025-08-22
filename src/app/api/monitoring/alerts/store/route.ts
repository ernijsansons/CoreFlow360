import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const alert = await request.json()
    
    // Store alert in database for historical analysis
    const storedAlert = await prisma.monitoringAlert.create({
      data: {
        alertId: alert.id,
        name: alert.name,
        severity: alert.severity,
        metric: alert.metric,
        value: alert.value,
        threshold: alert.threshold,
        context: JSON.stringify(alert.context),
        timestamp: new Date(alert.timestamp),
        resolved: false
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      storedAlertId: storedAlert.id 
    })
  } catch (error) {
    console.error('Failed to store alert:', error)
    return NextResponse.json(
      { error: 'Failed to store alert' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const severity = searchParams.get('severity')
    
    const alerts = await prisma.monitoringAlert.findMany({
      where: severity ? { severity } : undefined,
      orderBy: { timestamp: 'desc' },
      take: limit
    })
    
    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Failed to fetch stored alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { alertId, resolved } = await request.json()
    
    const updatedAlert = await prisma.monitoringAlert.update({
      where: { alertId },
      data: { 
        resolved,
        resolvedAt: resolved ? new Date() : null
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      updatedAlert: updatedAlert.id 
    })
  } catch (error) {
    console.error('Failed to update alert:', error)
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    )
  }
}