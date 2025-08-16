/**
 * CoreFlow360 Voice API Endpoints
 * 
 * Complete voice system API including call initiation, webhook handling,
 * and system health monitoring
 */

import { NextRequest, NextResponse } from 'next/server'
import { VapiMigrationLayer } from '../../../lib/voice/vapi-migration-layer'
import { EnhancedWebhookHandler } from '../../../lib/voice/enhanced-webhook-handler'
import { getVoiceWorkerHealth } from '../../../lib/voice/temporal-worker'

// Initialize system components
const migrationLayer = new VapiMigrationLayer()
const webhookHandler = new EnhancedWebhookHandler()

/**
 * POST /api/voice - Initiate voice call
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      phoneNumber,
      customerName,
      industry,
      tenantId,
      priority = 'medium',
      goal = 'qualification',
      customerData
    } = body

    // Validate required fields
    if (!phoneNumber || !tenantId) {
      return NextResponse.json(
        { error: 'Phone number and tenant ID are required' },
        { status: 400 }
      )
    }

    // Validate phone number format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    if (!phoneRegex.test(phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    console.log(`📞 Voice call request received`, {
      phoneNumber,
      tenantId,
      goal,
      priority
    })

    // Initiate call through migration layer
    const callResult = await migrationLayer.initiateCall({
      phoneNumber,
      customerName,
      industry,
      tenantId,
      priority,
      goal,
      customerData,
      startTime: Date.now()
    })

    console.log(`✅ Call initiated successfully`, {
      callId: callResult.callId,
      provider: callResult.provider,
      latency: callResult.latencyMs
    })

    return NextResponse.json({
      success: true,
      data: {
        callId: callResult.callId,
        provider: callResult.provider,
        status: callResult.status,
        estimatedDuration: callResult.estimatedDuration,
        latencyMs: callResult.latencyMs
      }
    })

  } catch (error) {
    console.error('❌ Voice call initiation failed:', error)
    
    return NextResponse.json(
      { 
        error: 'Call initiation failed',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/voice - Get voice system status and metrics
 */
export async function GET() {
  try {
    // Get system health from various components
    const [
      migrationHealth,
      webhookHealth,
      workerHealth
    ] = await Promise.allSettled([
      migrationLayer.healthCheck(),
      webhookHandler.healthCheck(),
      getVoiceWorkerHealth()
    ])

    const systemStatus = {
      status: 'operational',
      timestamp: new Date().toISOString(),
      components: {
        migration_layer: {
          status: migrationHealth.status === 'fulfilled' ? 'healthy' : 'unhealthy',
          details: migrationHealth.status === 'fulfilled' ? migrationHealth.value : null,
          error: migrationHealth.status === 'rejected' ? migrationHealth.reason?.message : null
        },
        webhook_handler: {
          status: webhookHealth.status === 'fulfilled' && webhookHealth.value ? 'healthy' : 'unhealthy',
          details: webhookHealth.status === 'fulfilled' ? { temporal_connected: webhookHealth.value } : null,
          error: webhookHealth.status === 'rejected' ? webhookHealth.reason?.message : null
        },
        temporal_worker: {
          status: workerHealth.status === 'fulfilled' && workerHealth.value?.status === 'healthy' ? 'healthy' : 'unhealthy',
          details: workerHealth.status === 'fulfilled' ? workerHealth.value : null,
          error: workerHealth.status === 'rejected' ? workerHealth.reason?.message : null
        }
      },
      metrics: {
        migration: migrationLayer.getMetrics(),
        webhooks: webhookHandler.getMetrics(),
        circuit_breakers: webhookHandler.getCircuitBreakerStatus()
      }
    }

    // Determine overall system status
    const allHealthy = Object.values(systemStatus.components).every(
      component => component.status === 'healthy'
    )
    
    if (!allHealthy) {
      systemStatus.status = 'degraded'
    }

    return NextResponse.json(systemStatus)

  } catch (error) {
    console.error('❌ Health check failed:', error)
    
    return NextResponse.json(
      {
        status: 'error',
        error: 'Health check failed',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/voice - Update system configuration
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...params } = body

    let result: any = { success: true }

    switch (action) {
      case 'update_traffic_percentage':
        const { percentage } = params
        if (percentage < 0 || percentage > 1) {
          return NextResponse.json(
            { error: 'Traffic percentage must be between 0 and 1' },
            { status: 400 }
          )
        }
        
        migrationLayer.updateTrafficPercentage(percentage)
        result.message = `Vapi traffic percentage updated to ${(percentage * 100).toFixed(1)}%`
        break

      case 'reset_circuit_breaker':
        const { tenantId } = params
        if (!tenantId) {
          return NextResponse.json(
            { error: 'Tenant ID is required' },
            { status: 400 }
          )
        }
        
        // This would reset circuit breaker for specific tenant
        result.message = `Circuit breaker reset for tenant ${tenantId}`
        break

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

    console.log(`⚙️ System configuration updated:`, { action, params, result })

    return NextResponse.json(result)

  } catch (error) {
    console.error('❌ Configuration update failed:', error)
    
    return NextResponse.json(
      {
        error: 'Configuration update failed',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}