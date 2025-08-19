import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import DataIngestionOrchestrator from '@/lib/integrations/data-ingestion/DataIngestionOrchestrator'
import { z } from 'zod'

const webhookSchema = z.object({
  source: z.string().min(1, 'Source is required'),
  eventType: z.string().min(1, 'Event type is required'),
  data: z.record(z.unknown()),
  timestamp: z.string().optional(),
  signature: z.string().optional(),
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
    // Parse webhook data
    const body = await request.json()
    const validatedData = webhookSchema.parse(body)

    // Get request headers
    const headers = Object.fromEntries(request.headers.entries())

    // Create webhook payload
    const webhookPayload = {
      source: validatedData.source,
      eventType: validatedData.eventType,
      timestamp: validatedData.timestamp ? new Date(validatedData.timestamp) : new Date(),
      data: validatedData.data,
      headers,
      signature: validatedData.signature,
    }

    // Process webhook through orchestrator
    const orchestrator = getOrchestrator()
    const job = await orchestrator.handleWebhook(webhookPayload)

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      jobId: job.id,
      status: job.status,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const includeJobs = searchParams.get('includeJobs') === 'true'
    const includeStats = searchParams.get('includeStats') === 'true'

    const response: unknown = {
      success: true,
      webhook: {
        endpoint: '/api/intelligence/ingestion/webhook',
        supportedSources: [
          'twitter',
          'linkedin',
          'news_api',
          'job_boards',
          'financial_api',
          'regulatory_api',
        ],
        supportedEventTypes: [
          'social_media_post',
          'news_article',
          'job_posting',
          'financial_report',
          'regulatory_filing',
        ],
      },
    }

    if (includeJobs) {
      response.activeJobs = orchestrator.getActiveJobs().map((job) => ({
        id: job.id,
        sourceId: job.sourceId,
        status: job.status,
        createdAt: job.createdAt,
        processingTime: job.processingTime,
        problemsDetected: job.problemsDetected,
        error: job.error,
      }))
    }

    if (includeStats) {
      response.statistics = orchestrator.getStatistics()
    }

    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve webhook information' }, { status: 500 })
  }
}
