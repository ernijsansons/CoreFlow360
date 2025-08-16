import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import DataIngestionOrchestrator from '@/lib/integrations/data-ingestion/DataIngestionOrchestrator'
import { z } from 'zod'

const registerSourceSchema = z.object({
  name: z.string().min(1, 'Source name is required'),
  type: z.enum([
    'EMAIL',
    'CALL',
    'MEETING',
    'SURVEY',
    'SUPPORT_TICKET',
    'SOCIAL_MEDIA',
    'NEWS_ARTICLE',
    'FINANCIAL_REPORT',
    'JOB_POSTING',
    'REGULATORY_FILING',
    'COMPETITOR_INTELLIGENCE',
    'INDUSTRY_REPORT',
    'ANALYST_REPORT',
    'WEBSITE_BEHAVIOR',
    'TECHNOLOGY_CHANGE',
    'EXECUTIVE_COMMUNICATION'
  ]),
  config: z.record(z.unknown()),
  endpoint: z.string().url().optional(),
  apiKey: z.string().optional(),
  webhookUrl: z.string().url().optional(),
  pollInterval: z.number().positive().optional()
})

const updateSourceSchema = z.object({
  sourceId: z.string(),
  status: z.enum(['ACTIVE', 'PAUSED', 'ERROR']).optional(),
  config: z.record(z.unknown()).optional(),
  pollInterval: z.number().positive().optional()
})

// Global orchestrator instance
let orchestrator: DataIngestionOrchestrator | null = null

function getOrchestrator(): DataIngestionOrchestrator {
  if (!orchestrator) {
    orchestrator = new DataIngestionOrchestrator()
    orchestrator.start()
  }
  return orchestrator
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = registerSourceSchema.parse(body)

    console.log('📡 Registering new data source:', validatedData.name)

    const orchestrator = getOrchestrator()
    
    // Generate unique source ID
    const sourceId = `${validatedData.type.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Register the data source
    await orchestrator.registerDataSource({
      id: sourceId,
      name: validatedData.name,
      type: validatedData.type,
      status: 'ACTIVE',
      config: validatedData.config,
      endpoint: validatedData.endpoint,
      apiKey: validatedData.apiKey,
      webhookUrl: validatedData.webhookUrl,
      pollInterval: validatedData.pollInterval
    })

    const response = {
      success: true,
      message: 'Data source registered successfully',
      source: {
        id: sourceId,
        name: validatedData.name,
        type: validatedData.type,
        status: 'ACTIVE',
        registeredAt: new Date().toISOString()
      },
      
      integration: {
        webhookEndpoint: validatedData.webhookUrl ? undefined : `/api/intelligence/ingestion/webhook`,
        webhookInstructions: validatedData.webhookUrl ? undefined : {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          payload: {
            source: validatedData.name,
            eventType: 'string',
            data: 'object',
            timestamp: 'ISO string (optional)',
            signature: 'string (optional)'
          }
        },
        
        pollingConfig: validatedData.pollInterval ? {
          interval: validatedData.pollInterval,
          nextPoll: new Date(Date.now() + validatedData.pollInterval).toISOString()
        } : undefined
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Failed to register data source:', error)
    return NextResponse.json(
      {
        error: 'Failed to register data source',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orchestrator = getOrchestrator()
    const sources = orchestrator.getDataSources()
    
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    
    // Filter sources
    let filteredSources = sources
    
    if (type) {
      filteredSources = filteredSources.filter(s => s.type === type)
    }
    
    if (status) {
      filteredSources = filteredSources.filter(s => s.status === status)
    }
    
    const transformedSources = filteredSources.map(source => ({
      id: source.id,
      name: source.name,
      type: source.type,
      status: source.status,
      
      // Performance Metrics
      totalIngested: source.totalIngested,
      successRate: source.successRate,
      errorCount: source.errorCount,
      avgProcessingTime: source.avgProcessingTime,
      dataQualityScore: source.dataQualityScore,
      
      // Timing
      lastIngestion: source.lastIngestion,
      nextIngestion: source.nextIngestion,
      
      // Configuration (sanitized)
      hasApiKey: !!source.apiKey,
      hasEndpoint: !!source.endpoint,
      hasWebhook: !!source.webhookUrl,
      pollInterval: source.pollInterval,
      configKeys: Object.keys(source.config || {})
    }))

    const statistics = orchestrator.getStatistics()

    return NextResponse.json({
      success: true,
      sources: transformedSources,
      totalCount: transformedSources.length,
      statistics,
      
      summary: {
        totalSources: sources.length,
        activeWithPolling: sources.filter(s => s.status === 'ACTIVE' && s.pollInterval).length,
        activeWithWebhooks: sources.filter(s => s.status === 'ACTIVE' && s.webhookUrl).length,
        errorSources: sources.filter(s => s.status === 'ERROR').length,
        avgSuccessRate: statistics.avgSuccessRate,
        totalDataIngested: statistics.totalIngested
      }
    })

  } catch (error) {
    console.error('❌ Failed to get data sources:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve data sources' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateSourceSchema.parse(body)

    console.log('⚙️ Updating data source:', validatedData.sourceId)

    const orchestrator = getOrchestrator()
    const sources = orchestrator.getDataSources()
    const source = sources.find(s => s.id === validatedData.sourceId)
    
    if (!source) {
      return NextResponse.json(
        { error: 'Data source not found' },
        { status: 404 }
      )
    }

    // Update source properties
    if (validatedData.status) {
      source.status = validatedData.status
    }
    
    if (validatedData.config) {
      source.config = { ...source.config, ...validatedData.config }
    }
    
    if (validatedData.pollInterval) {
      source.pollInterval = validatedData.pollInterval
    }

    return NextResponse.json({
      success: true,
      message: 'Data source updated successfully',
      source: {
        id: source.id,
        name: source.name,
        type: source.type,
        status: source.status,
        pollInterval: source.pollInterval,
        updatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Failed to update data source:', error)
    return NextResponse.json(
      {
        error: 'Failed to update data source',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const sourceId = searchParams.get('sourceId')
    
    if (!sourceId) {
      return NextResponse.json(
        { error: 'Source ID is required' },
        { status: 400 }
      )
    }

    console.log('🗑️ Removing data source:', sourceId)

    const orchestrator = getOrchestrator()
    const sources = orchestrator.getDataSources()
    const source = sources.find(s => s.id === sourceId)
    
    if (!source) {
      return NextResponse.json(
        { error: 'Data source not found' },
        { status: 404 }
      )
    }

    // Set status to paused instead of actually deleting
    source.status = 'PAUSED'

    return NextResponse.json({
      success: true,
      message: 'Data source removed successfully',
      sourceId,
      status: 'PAUSED'
    })

  } catch (error) {
    console.error('❌ Failed to remove data source:', error)
    return NextResponse.json(
      { error: 'Failed to remove data source' },
      { status: 500 }
    )
  }
}