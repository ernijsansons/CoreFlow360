/**
 * CoreFlow360 - WebSocket Status API
 * API endpoint for WebSocket server status and metrics
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { wsServer } from '@/server/websocket-server'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get WebSocket server status
    const status = {
      serverRunning: !!wsServer,
      timestamp: new Date().toISOString(),
      metrics: wsServer ? wsServer.getMetrics() : null,
      connectedClients: wsServer ? wsServer.getConnectedClients().length : 0,
      version: '1.0.0'
    }

    // If user is admin, include detailed client information
    const isAdmin = session.user.role === 'admin' || session.user.email?.includes('admin')
    if (isAdmin && wsServer) {
      const clients = wsServer.getConnectedClients()
      return NextResponse.json({
        ...status,
        clients: clients.map(client => ({
          id: client.id,
          tenantId: client.tenantId,
          subscriptions: client.subscriptions,
          lastActivity: client.lastActivity,
          connectionDuration: Date.now() - new Date(client.lastActivity).getTime()
        }))
      })
    }

    return NextResponse.json(status)

  } catch (error) {
    console.error('WebSocket status API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only admins can perform WebSocket operations
    const isAdmin = session.user.role === 'admin' || session.user.email?.includes('admin')
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action, data } = body

    if (!wsServer) {
      return NextResponse.json(
        { error: 'WebSocket server not available' },
        { status: 503 }
      )
    }

    let result

    switch (action) {
      case 'broadcast':
        if (!data.tenantId || !data.channel || !data.message) {
          return NextResponse.json(
            { error: 'Missing required fields: tenantId, channel, message' },
            { status: 400 }
          )
        }
        
        await wsServer.broadcastToTenant(data.tenantId, data.channel, data.message)
        result = { success: true, action: 'broadcast', tenantId: data.tenantId }
        break

      case 'get_metrics':
        result = wsServer.getMetrics()
        break

      case 'get_clients':
        result = wsServer.getConnectedClients()
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      action,
      result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('WebSocket action API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}