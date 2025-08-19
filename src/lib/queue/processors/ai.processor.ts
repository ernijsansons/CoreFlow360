/**
 * CoreFlow360 - AI Processing Queue
 * Handles AI-related background jobs
 */

import { Worker, Job } from 'bullmq'
import { prisma } from '@/lib/prisma'
import { AIOrchestrator } from '@/lib/ai/orchestrator'
import { performanceMetrics } from '@/lib/cache/metrics-cache'

export interface AIJobData {
  type: 'insight_generation' | 'batch_analysis' | 'report_generation' | 'data_enrichment'
  userId: string
  tenantId: string
  agentType: string
  context: Record<string, unknown>
  priority?: 'high' | 'normal' | 'low'
}

/**
 * Process AI job
 */
async function processAIJob(job: Job<AIJobData>) {
  const startTime = Date.now()

  try {
    // Update progress
    await job.updateProgress(10)

    // Initialize AI orchestrator
    const orchestrator = new AIOrchestrator()

    let result: unknown

    switch (job.data.type) {
      case 'insight_generation':
        result = await generateInsights(orchestrator, job.data)
        break

      case 'batch_analysis':
        result = await performBatchAnalysis(orchestrator, job.data)
        break

      case 'report_generation':
        result = await generateReport(orchestrator, job.data)
        break

      case 'data_enrichment':
        result = await enrichData(orchestrator, job.data)
        break

      default:
        throw new Error(`Unknown AI job type: ${job.data.type}`)
    }

    await job.updateProgress(90)

    // Store results
    await storeAIResults(job.data, result)

    await job.updateProgress(100)

    const duration = Date.now() - startTime
    await performanceMetrics.trackResponseTime(`ai_${job.data.type}`, duration, 200)

    return {
      success: true,
      duration,
      result,
    }
  } catch (error) {
    const duration = Date.now() - startTime
    await performanceMetrics.trackResponseTime(`ai_${job.data.type}`, duration, 500)

    throw error
  }
}

/**
 * Generate insights
 */
async function generateInsights(orchestrator: AIOrchestrator, data: AIJobData): Promise<unknown> {
  const { userId, tenantId, agentType, context } = data

  // Get relevant data for insight generation
  const [customers, deals, metrics] = await Promise.all([
    prisma.customer.findMany({
      where: { tenantId },
      take: 100,
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.deal.findMany({
      where: { tenantId },
      take: 50,
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.businessMetric.findMany({
      where: { tenantId },
      take: 30,
      orderBy: { timestamp: 'desc' },
    }),
  ])

  // Generate insights using AI
  const insights = await orchestrator.generateInsights({
    agentType,
    data: {
      customers,
      deals,
      metrics,
      ...context,
    },
  })

  // Store insights
  const createdInsights = await Promise.all(
    insights.map((insight) =>
      prisma.aIInsight.create({
        data: {
          userId,
          tenantId,
          agentType,
          category: insight.category,
          title: insight.title,
          description: insight.description,
          impact: insight.impact,
          confidence: insight.confidence,
          recommendations: insight.recommendations,
          metadata: insight.metadata,
        },
      })
    )
  )

  return createdInsights
}

/**
 * Perform batch analysis
 */
async function performBatchAnalysis(
  orchestrator: AIOrchestrator,
  data: AIJobData
): Promise<unknown> {
  const { tenantId, context } = data

  const analysisType = context.analysisType || 'customer_segmentation'

  switch (analysisType) {
    case 'customer_segmentation':
      return await analyzeCustomerSegments(orchestrator, tenantId, context)

    case 'churn_prediction':
      return await predictChurn(orchestrator, tenantId, context)

    case 'revenue_forecast':
      return await forecastRevenue(orchestrator, tenantId, context)

    default:
      throw new Error(`Unknown analysis type: ${analysisType}`)
  }
}

/**
 * Generate report
 */
async function generateReport(orchestrator: AIOrchestrator, data: AIJobData): Promise<unknown> {
  const { userId, tenantId, context } = data

  const reportType = context.reportType || 'executive_summary'
  const period = context.period || '30d'

  // Gather data for report
  const reportData = await gatherReportData(tenantId, reportType, period)

  // Generate report using AI
  const report = await orchestrator.generateReport({
    type: reportType,
    data: reportData,
    format: context.format || 'markdown',
  })

  // Store report
  const storedReport = await prisma.aIReport.create({
    data: {
      userId,
      tenantId,
      type: reportType,
      title: report.title,
      content: report.content,
      summary: report.summary,
      format: report.format,
      metadata: {
        period,
        generatedBy: data.agentType,
        metrics: report.metrics,
      },
    },
  })

  return storedReport
}

/**
 * Enrich data with AI
 */
async function enrichData(orchestrator: AIOrchestrator, data: AIJobData): Promise<unknown> {
  const { tenantId, context } = data

  const entityType = context.entityType || 'customer'
  const entityIds = context.entityIds || []

  const enrichedData = []

  for (const entityId of entityIds) {
    const entity = await getEntity(entityType, entityId, tenantId)
    if (!entity) continue

    const enrichment = await orchestrator.enrichData({
      type: entityType,
      data: entity,
      enrichmentFields: context.fields || ['industry', 'size', 'potential'],
    })

    // Update entity with enriched data
    await updateEntity(entityType, entityId, enrichment)

    enrichedData.push({
      entityId,
      enrichment,
    })
  }

  return enrichedData
}

/**
 * Helper functions
 */
async function analyzeCustomerSegments(
  orchestrator: AIOrchestrator,
  tenantId: string,
  context: unknown
) {
  const customers = await prisma.customer.findMany({
    where: { tenantId },
    include: {
      deals: true,
      interactions: {
        take: 10,
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  const segments = await orchestrator.analyzeSegments({
    data: customers,
    criteria: context.criteria || ['value', 'engagement', 'potential'],
  })

  // Store segment assignments
  for (const segment of segments) {
    await prisma.customerSegment.createMany({
      data: segment.customerIds.map((customerId) => ({
        customerId,
        segmentName: segment.name,
        segmentValue: segment.value,
        confidence: segment.confidence,
      })),
    })
  }

  return segments
}

async function predictChurn(orchestrator: AIOrchestrator, tenantId: string, context: unknown) {
  const customers = await prisma.customer.findMany({
    where: {
      tenantId,
      status: 'active',
    },
    include: {
      interactions: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      invoices: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })

  const predictions = await orchestrator.predictChurn({
    customers,
    timeframe: context.timeframe || 90, // days
  })

  // Store predictions
  await Promise.all(
    predictions.map((pred) =>
      prisma.churnPrediction.create({
        data: {
          customerId: pred.customerId,
          probability: pred.probability,
          riskLevel: pred.riskLevel,
          reasons: pred.reasons,
          recommendations: pred.recommendations,
          predictedDate: pred.predictedDate,
        },
      })
    )
  )

  return predictions
}

async function forecastRevenue(orchestrator: AIOrchestrator, tenantId: string, context: unknown) {
  const historicalData = await prisma.revenueMetrics.findMany({
    where: { tenantId },
    orderBy: { month: 'desc' },
    take: 12,
  })

  const forecast = await orchestrator.forecastRevenue({
    historical: historicalData,
    periods: context.periods || 6,
    includeSeasonality: context.includeSeasonality !== false,
  })

  // Store forecast
  await prisma.revenueForecast.create({
    data: {
      tenantId,
      forecast: forecast.predictions,
      confidence: forecast.confidence,
      methodology: forecast.methodology,
      factors: forecast.factors,
      generatedAt: new Date(),
    },
  })

  return forecast
}

async function gatherReportData(tenantId: string, reportType: string, period: string) {
  // Convert period to date range
  const endDate = new Date()
  const startDate = new Date()

  switch (period) {
    case '7d':
      startDate.setDate(startDate.getDate() - 7)
      break
    case '30d':
      startDate.setDate(startDate.getDate() - 30)
      break
    case '90d':
      startDate.setDate(startDate.getDate() - 90)
      break
  }

  // Gather data based on report type
  const data: unknown = {}

  data.metrics = await prisma.businessMetric.findMany({
    where: {
      tenantId,
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    },
  })

  data.customers = await prisma.customer.count({
    where: { tenantId },
  })

  data.revenue = await prisma.invoice.aggregate({
    where: {
      tenantId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      amount: true,
    },
  })

  return data
}

async function getEntity(type: string, id: string, tenantId: string) {
  switch (type) {
    case 'customer':
      return await prisma.customer.findFirst({
        where: { id, tenantId },
      })
    case 'deal':
      return await prisma.deal.findFirst({
        where: { id, tenantId },
      })
    case 'lead':
      return await prisma.lead.findFirst({
        where: { id, tenantId },
      })
    default:
      return null
  }
}

async function updateEntity(type: string, id: string, data: unknown) {
  switch (type) {
    case 'customer':
      return await prisma.customer.update({
        where: { id },
        data: { enrichedData: data },
      })
    case 'deal':
      return await prisma.deal.update({
        where: { id },
        data: { enrichedData: data },
      })
    case 'lead':
      return await prisma.lead.update({
        where: { id },
        data: { enrichedData: data },
      })
  }
}

async function storeAIResults(jobData: AIJobData, result: unknown) {
  await prisma.aIJobResult.create({
    data: {
      jobType: jobData.type,
      userId: jobData.userId,
      tenantId: jobData.tenantId,
      agentType: jobData.agentType,
      result,
      metadata: jobData.context,
      completedAt: new Date(),
    },
  })
}

/**
 * Create AI worker
 */
export function createAIWorker() {
  const worker = new Worker<AIJobData>('ai-processing', processAIJob, {
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_QUEUE_DB || '1'),
    },
    concurrency: parseInt(process.env.AI_WORKER_CONCURRENCY || '3'),
  })

  worker.on('completed', (job) => {})

  worker.on('failed', (job, err) => {})

  return worker
}

/**
 * AI job helpers
 */
export const aiJobs = {
  /**
   * Generate insights
   */
  async generateInsights(params: {
    userId: string
    tenantId: string
    agentType: string
    context?: unknown
  }) {
    const { addJob } = await import('../client')

    return addJob('AI_PROCESSING', 'generate-insights', {
      type: 'insight_generation',
      ...params,
      context: params.context || {},
    })
  },

  /**
   * Analyze data batch
   */
  async analyzeBatch(params: {
    userId: string
    tenantId: string
    analysisType: string
    data: unknown
  }) {
    const { addJob } = await import('../client')

    return addJob('AI_PROCESSING', 'batch-analysis', {
      type: 'batch_analysis',
      userId: params.userId,
      tenantId: params.tenantId,
      agentType: 'analytics',
      context: {
        analysisType: params.analysisType,
        ...params.data,
      },
    })
  },

  /**
   * Generate report
   */
  async generateReport(params: {
    userId: string
    tenantId: string
    reportType: string
    period: string
    format?: string
  }) {
    const { addJob } = await import('../client')

    return addJob(
      'AI_PROCESSING',
      'generate-report',
      {
        type: 'report_generation',
        userId: params.userId,
        tenantId: params.tenantId,
        agentType: 'analytics',
        context: {
          reportType: params.reportType,
          period: params.period,
          format: params.format || 'markdown',
        },
      },
      {
        priority: 5,
      }
    )
  },

  /**
   * Enrich entities
   */
  async enrichEntities(params: {
    userId: string
    tenantId: string
    entityType: string
    entityIds: string[]
    fields?: string[]
  }) {
    const { addJob } = await import('../client')

    return addJob('AI_PROCESSING', 'enrich-data', {
      type: 'data_enrichment',
      userId: params.userId,
      tenantId: params.tenantId,
      agentType: 'crm',
      context: {
        entityType: params.entityType,
        entityIds: params.entityIds,
        fields: params.fields,
      },
    })
  },
}
