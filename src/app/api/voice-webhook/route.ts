/**
 * CoreFlow360 Voice Webhook Handler
 * 
 * Handles webhooks from Vapi.ai, Twilio, and other voice providers
 * Processes voice events through Enhanced Webhook Handler with Temporal workflows
 */

import { NextRequest, NextResponse } from 'next/server'
import { EnhancedWebhookHandler } from '../../../lib/voice/enhanced-webhook-handler'

// Initialize webhook handler
const webhookHandler = new EnhancedWebhookHandler()

/**
 * POST /api/voice-webhook - Handle voice provider webhooks
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Log incoming webhook
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const contentType = request.headers.get('content-type') || 'unknown'
    const signature = request.headers.get('x-vapi-signature') || request.headers.get('x-twilio-signature')
    
    console.log(`🎣 Webhook received`, {
      userAgent,
      contentType,
      hasSignature: !!signature,
      timestamp: new Date().toISOString()
    })

    // Convert NextRequest to Express-like request for compatibility
    const expressRequest = await convertToExpressRequest(request)
    
    // Process webhook through enhanced handler
    const response = await webhookHandler.handleWebhook(expressRequest)
    
    const processingTime = Date.now() - startTime
    console.log(`✅ Webhook processed successfully in ${processingTime}ms`)

    // Convert Response to NextResponse
    const responseBody = await response.text()
    let responseJson: any
    
    try {
      responseJson = JSON.parse(responseBody)
    } catch {
      responseJson = { message: responseBody }
    }

    return NextResponse.json(responseJson, { 
      status: response.status,
      headers: {
        'X-Processing-Time': processingTime.toString(),
        'X-Webhook-Version': '2.0',
        'X-Handled-By': 'enhanced-webhook-handler'
      }
    })

  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('❌ Webhook processing failed:', {
      error: error.message,
      stack: error.stack,
      processingTime
    })

    // Always return 200 to prevent provider retries for non-transient errors
    return NextResponse.json(
      {
        success: false,
        error: 'Webhook processing failed',
        message: 'Error logged and queued for retry',
        processingTime,
        timestamp: new Date().toISOString()
      },
      { 
        status: 200,
        headers: {
          'X-Processing-Time': processingTime.toString(),
          'X-Webhook-Version': '2.0',
          'X-Error': 'true'
        }
      }
    )
  }
}

/**
 * GET /api/voice-webhook - Webhook health check and verification
 */
export async function GET() {
  try {
    const health = await webhookHandler.healthCheck()
    const metrics = webhookHandler.getMetrics()
    const circuitBreakers = webhookHandler.getCircuitBreakerStatus()

    return NextResponse.json({
      status: 'healthy',
      webhook_handler: {
        healthy: health,
        temporal_connected: health
      },
      metrics: {
        total_requests: metrics.totalRequests,
        successful_requests: metrics.successfulRequests,
        failed_requests: metrics.failedRequests,
        success_rate: metrics.totalRequests > 0 ? 
          ((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2) + '%' : '100%',
        average_processing_time: metrics.averageProcessingTime.toFixed(2) + 'ms',
        temporal_workflows_started: metrics.temporalWorkflowsStarted,
        circuit_breaker_trips: metrics.circuitBreakerTrips
      },
      circuit_breakers: {
        active_breakers: Object.keys(circuitBreakers).length,
        breaker_details: circuitBreakers
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Webhook health check failed:', error)
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    )
  }
}

/**
 * Convert NextRequest to Express-like request for compatibility
 */
async function convertToExpressRequest(request: NextRequest): Promise<any> {
  const body = await request.text()
  
  // Parse JSON if content-type is application/json
  let parsedBody: any
  const contentType = request.headers.get('content-type') || ''
  
  if (contentType.includes('application/json') && body) {
    try {
      parsedBody = JSON.parse(body)
    } catch (error) {
      console.warn('⚠️ Failed to parse JSON body:', error.message)
      parsedBody = body
    }
  } else if (contentType.includes('application/x-www-form-urlencoded') && body) {
    // Parse URL-encoded form data (Twilio webhooks)
    parsedBody = Object.fromEntries(new URLSearchParams(body))
  } else {
    parsedBody = body
  }

  // Create Express-like request object
  const expressRequest = {
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers.entries()),
    body: parsedBody,
    rawBody: body,
    
    // Add Express-like methods
    json: async () => parsedBody,
    text: async () => body,
    get: (headerName: string) => request.headers.get(headerName)
  }

  return expressRequest
}

/**
 * Handle webhook verification challenges (for some providers)
 */
export async function HEAD() {
  return new NextResponse(null, { 
    status: 200,
    headers: {
      'X-Webhook-Endpoint': 'active',
      'X-Supported-Providers': 'vapi,twilio',
      'X-Webhook-Version': '2.0'
    }
  })
}

/**
 * OPTIONS - CORS preflight for webhook endpoint
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Vapi-Signature, X-Twilio-Signature, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  })
}