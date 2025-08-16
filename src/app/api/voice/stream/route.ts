/**
 * CoreFlow360 - Voice AI Stream Handler
 * WebSocket stream handler for real-time AI conversations
 */

import { NextRequest, NextResponse } from 'next/server'
import { WebSocketServer, WebSocket } from 'ws'
import { IncomingMessage } from 'http'
import { createConversationEngine } from '@/lib/ai/conversation-engine'
import { db } from '@/lib/db'

// Global WebSocket server instance
let wss: WebSocketServer | null = null

/**
 * GET /api/voice/stream
 * WebSocket upgrade handler for Twilio Media Streams
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const callSid = url.searchParams.get('callSid')
  const scriptId = url.searchParams.get('script')
  
  if (!callSid) {
    return NextResponse.json({ error: 'callSid required' }, { status: 400 })
  }

  // Initialize WebSocket server if not exists
  if (!wss) {
    wss = new WebSocketServer({ 
      port: parseInt(process.env.WEBSOCKET_PORT || '8080'),
      host: '0.0.0.0'
    })
    
    console.log(`🔌 WebSocket server started on port ${process.env.WEBSOCKET_PORT || '8080'}`)
  }

  // Handle WebSocket connections
  wss.on('connection', async (ws: WebSocket, req: IncomingMessage) => {
    console.log(`🔗 New WebSocket connection for call ${callSid}`)
    
    try {
      // Load call and lead data
      const callData = await loadCallData(callSid!)
      
      if (!callData) {
        console.error(`❌ Call data not found for ${callSid}`)
        ws.close(1000, 'Call data not found')
        return
      }

      // Create AI conversation engine
      const conversationEngine = await createConversationEngine(
        callSid!,
        callData.leadData,
        scriptId || callData.scriptId
      )

      // Initialize conversation
      await conversationEngine.initializeConversation(ws)
      
      // Handle connection errors
      ws.on('error', (error) => {
        console.error(`WebSocket error for call ${callSid}:`, error)
      })

      ws.on('close', (code, reason) => {
        console.log(`🔚 WebSocket closed for call ${callSid}: ${code} ${reason}`)
      })

    } catch (error) {
      console.error(`Error setting up conversation for call ${callSid}:`, error)
      ws.close(1000, 'Setup error')
    }
  })

  // Return WebSocket upgrade response
  return new NextResponse(null, {
    status: 101,
    headers: {
      'Upgrade': 'websocket',
      'Connection': 'Upgrade'
    }
  })
}

/**
 * Load call and associated lead data
 */
async function loadCallData(callSid: string) {
  try {
    const callLog = await db.callLog.findUnique({
      where: { twilioCallSid: callSid },
      include: {
        customer: true,
        lead: true,
        script: true,
        tenant: true
      }
    })

    if (!callLog) {
      return null
    }

    // Determine lead data source (customer or lead table)
    const leadData = callLog.customer || callLog.lead
    
    if (!leadData) {
      return null
    }

    return {
      callLog,
      leadData: {
        id: leadData.id,
        name: leadData.name,
        phone: leadData.phone,
        email: leadData.email,
        company: (leadData as any).company,
        industry: callLog.tenant?.industry || 'General',
        serviceType: (leadData as any).customFields?.serviceType,
        urgency: (leadData as any).customFields?.urgency,
        customFields: (leadData as any).customFields,
        tenantId: callLog.tenantId
      },
      scriptId: callLog.scriptId
    }

  } catch (error) {
    console.error('Error loading call data:', error)
    return null
  }
}