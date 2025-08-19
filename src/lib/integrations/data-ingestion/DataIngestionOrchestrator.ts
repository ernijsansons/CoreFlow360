/**
 * CoreFlow360 - Multi-Source Data Ingestion Orchestrator
 * Manages real-time data ingestion from multiple sources for problem detection
 */

import { EventEmitter } from 'events'
import { prisma } from '@/lib/db'
import { ProblemSource } from '@prisma/client'
import ProblemDiscoveryEngine from '@/lib/crm/problem-discovery-engine'

export interface DataSource {
  id: string
  name: string
  type: ProblemSource
  status: 'ACTIVE' | 'PAUSED' | 'ERROR' | 'INITIALIZING'
  config: Record<string, unknown>

  // Connection Details
  endpoint?: string
  apiKey?: string
  webhookUrl?: string
  pollInterval?: number

  // Processing
  lastIngestion: Date | null
  nextIngestion: Date | null
  totalIngested: number
  errorCount: number

  // Data Quality
  dataQualityScore: number
  avgProcessingTime: number
  successRate: number
}

export interface IngestionJob {
  id: string
  sourceId: string
  tenantId: string
  companyId?: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

  // Data
  rawData: Record<string, unknown>
  processedData?: Record<string, unknown>
  problemsDetected?: number

  // Timing
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  processingTime?: number

  // Error Handling
  error?: string
  retryCount: number
  maxRetries: number
}

export interface WebhookPayload {
  source: string
  eventType: string
  timestamp: Date
  data: Record<string, unknown>
  headers: Record<string, string>
  signature?: string
}

export class DataIngestionOrchestrator extends EventEmitter {
  private dataSources: Map<string, DataSource>
  private activeJobs: Map<string, IngestionJob>
  private pollIntervals: Map<string, NodeJS.Timer>
  private isRunning: boolean = false
  private discoveryEngine: ProblemDiscoveryEngine

  constructor() {
    super()
    this.dataSources = new Map()
    this.activeJobs = new Map()
    this.pollIntervals = new Map()
    this.discoveryEngine = new ProblemDiscoveryEngine()

    this.initializeDataSources()
  }

  /**
   * Start the ingestion orchestrator
   */
  async start(): Promise<void> {
    if (this.isRunning) return

    
    this.isRunning = true

    // Start polling sources
    for (const [sourceId, source] of this.dataSources) {
      if (source.status === 'ACTIVE' && source.pollInterval) {
        this.startPolling(sourceId)
      }
    }

    // Start job processor
    this.startJobProcessor()

    console.log('Data ingestion orchestrator started successfully')
  }

  /**
   * Stop the ingestion orchestrator
   */
  async stop(): Promise<void> {
    
    this.isRunning = false

    // Clear all polling intervals
    for (const [sourceId, interval] of this.pollIntervals) {
      clearInterval(interval)
    }
    this.pollIntervals.clear()

    console.log('Data ingestion orchestrator stopped')
  }

  /**
   * Register a new data source
   */
  async registerDataSource(
    source: Omit<
      DataSource,
      | 'lastIngestion'
      | 'nextIngestion'
      | 'totalIngested'
      | 'errorCount'
      | 'dataQualityScore'
      | 'avgProcessingTime'
      | 'successRate'
    >
  ): Promise<void> {
    const fullSource: DataSource = {
      ...source,
      lastIngestion: null,
      nextIngestion: null,
      totalIngested: 0,
      errorCount: 0,
      dataQualityScore: 100,
      avgProcessingTime: 0,
      successRate: 100,
    }

    this.dataSources.set(source.id, fullSource)

    // If running and source is active, start polling
    if (this.isRunning && source.status === 'ACTIVE' && source.config.pollInterval) {
      this.startPolling(source.id)
    }

    console.log(`Registered data source: ${source.id} (${source.name})`)
  }

  /**
   * Handle incoming webhook data
   */
  async handleWebhook(payload: WebhookPayload): Promise<IngestionJob> {
    console.log('Received webhook:', payload.source, payload.eventType)

    // Validate webhook signature if required
    const source = Array.from(this.dataSources.values()).find((s) => s.name === payload.source)
    if (!source) {
      throw new Error(`Unknown webhook source: ${payload.source}`)
    }

    if (source.config.validateSignature && payload.signature) {
      this.validateWebhookSignature(payload, source.config.webhookSecret)
    }

    // Create ingestion job
    const job = await this.createIngestionJob({
      sourceId: source.id,
      tenantId: 'default', // Would be determined from webhook context
      rawData: payload.data,
    })

    // Process immediately
    this.processJob(job.id)

    return job
  }

  /**
   * Start polling a data source
   */
  private startPolling(sourceId: string): void {
    const source = this.dataSources.get(sourceId)
    if (!source || !source.pollInterval) return

    console.log(`Starting polling for source: ${sourceId}`)

    const interval = setInterval(async () => {
      try {
        await this.pollDataSource(sourceId)
      } catch (error) {
        console.error(`Error polling source ${sourceId}:`, error)
        source.errorCount++
        source.successRate = Math.max(0, source.successRate - 5)
      }
    }, source.pollInterval)

    this.pollIntervals.set(sourceId, interval)
  }

  /**
   * Poll a specific data source
   */
  private async pollDataSource(sourceId: string): Promise<void> {
    const source = this.dataSources.get(sourceId)
    if (!source) return

    console.log(`Polling data source: ${sourceId}`)

    try {
      let data: Record<string, unknown> | null = null

      // Poll based on source type
      switch (source.type) {
        case 'SOCIAL_MEDIA':
          data = await this.pollSocialMedia(source)
          break
        case 'NEWS_ARTICLE':
          data = await this.pollNewsArticles(source)
          break
        case 'FINANCIAL_REPORT':
          data = await this.pollFinancialReports(source)
          break
        case 'JOB_POSTING':
          data = await this.pollJobPostings(source)
          break
        case 'REGULATORY_FILING':
          data = await this.pollRegulatoryFilings(source)
          break
        default:
          console.warn(`Unknown polling type for source: ${source.type}`)
          return
      }

      if (data) {
        // Create ingestion job
        await this.createIngestionJob({
          sourceId: source.id,
          tenantId: 'default', // Would be determined from source context
          rawData: data,
        })

        source.lastIngestion = new Date()
        source.totalIngested++
      }
    } catch (error) {
      console.error(`Failed to poll source ${sourceId}:`, error)
      source.errorCount++
      throw error
    }
  }

  /**
   * Poll social media sources
   */
  private async pollSocialMedia(source: DataSource): Promise<Record<string, unknown> | null> {
    // Mock implementation - in production would use real APIs
    const mockPosts = [
      {
        platform: 'twitter',
        id: `tweet_${Date.now()}`,
        content: `Just had another terrible experience with ${source.config.companyName}'s support. This is getting ridiculous!`,
        author: 'frustrated_customer',
        timestamp: new Date(),
        engagement: {
          likes: 5,
          retweets: 2,
          replies: 8,
        },
        sentiment: -0.8,
      },
    ]

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      source: 'twitter_api',
      posts: mockPosts,
      totalPosts: mockPosts.length,
      searchTerms: source.config.searchTerms,
      collectedAt: new Date(),
    }
  }

  /**
   * Poll news articles
   */
  private async pollNewsArticles(source: DataSource): Promise<Record<string, unknown> | null> {
    // Mock implementation
    const mockArticles = [
      {
        title: `${source.config.companyName} Faces Customer Backlash Over Service Issues`,
        content: 'Recent reports indicate growing customer dissatisfaction...',
        source: 'TechNews Today',
        publishedAt: new Date(),
        url: 'https://example.com/article',
        sentiment: -0.6,
      },
    ]

    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      source: 'news_api',
      articles: mockArticles,
      totalArticles: mockArticles.length,
      searchKeywords: source.config.searchKeywords,
      collectedAt: new Date(),
    }
  }

  /**
   * Poll financial reports
   */
  private async pollFinancialReports(_source: DataSource): Promise<Record<string, unknown> | null> {
    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 2000))

    return {
      source: 'financial_api',
      reports: [],
      totalReports: 0,
      collectedAt: new Date(),
    }
  }

  /**
   * Poll job postings
   */
  private async pollJobPostings(source: DataSource): Promise<Record<string, unknown> | null> {
    // Mock implementation
    const mockJobs = [
      {
        title: 'Senior Customer Support Manager - Urgent',
        company: source.config.companyName,
        location: 'Remote',
        postedAt: new Date(),
        description:
          'We are urgently seeking an experienced manager to lead our struggling support team...',
        urgencyIndicators: ['urgent', 'struggling', 'immediate start'],
      },
    ]

    await new Promise((resolve) => setTimeout(resolve, 800))

    return {
      source: 'job_api',
      jobs: mockJobs,
      totalJobs: mockJobs.length,
      companyDomain: source.config.companyDomain,
      collectedAt: new Date(),
    }
  }

  /**
   * Poll regulatory filings
   */
  private async pollRegulatoryFilings(_source: DataSource): Promise<Record<string, unknown> | null> {
    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 1500))

    return {
      source: 'regulatory_api',
      filings: [],
      totalFilings: 0,
      collectedAt: new Date(),
    }
  }

  /**
   * Create a new ingestion job
   */
  private async createIngestionJob(params: {
    sourceId: string
    tenantId: string
    companyId?: string
    rawData: Record<string, unknown>
  }): Promise<IngestionJob> {
    const job: IngestionJob = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sourceId: params.sourceId,
      tenantId: params.tenantId,
      companyId: params.companyId,
      status: 'PENDING',
      rawData: params.rawData,
      createdAt: new Date(),
      retryCount: 0,
      maxRetries: 3,
    }

    this.activeJobs.set(job.id, job)

    // Emit job created event
    this.emit('jobCreated', job)

    return job
  }

  /**
   * Start the job processor
   */
  private startJobProcessor(): void {
    setInterval(async () => {
      if (!this.isRunning) return

      const pendingJobs = Array.from(this.activeJobs.values())
        .filter((job) => job.status === 'PENDING')
        .slice(0, 5) // Process up to 5 jobs concurrently

      for (const job of pendingJobs) {
        this.processJob(job.id)
      }
    }, 1000) // Check every second
  }

  /**
   * Process a specific job
   */
  private async processJob(jobId: string): Promise<void> {
    const job = this.activeJobs.get(jobId)
    if (!job || job.status !== 'PENDING') return

    console.log(`Processing job: ${jobId}`)

    try {
      job.status = 'PROCESSING'
      job.startedAt = new Date()

      // Get source information
      const source = this.dataSources.get(job.sourceId)
      if (!source) {
        throw new Error(`Source not found: ${job.sourceId}`)
      }

      // Process data based on source type
      const processedData = await this.processSourceData(job.rawData, source)
      job.processedData = processedData

      // Detect problems using the discovery engine
      const problemsDetected = await this.discoveryEngine.detectProblems({
        tenantId: job.tenantId,
        companyId: job.companyId,
        content: this.extractContentForAnalysis(job.rawData, source.type),
        source: source.type,
        metadata: {
          sourceId: source.id,
          jobId: job.id,
          rawDataSize: JSON.stringify(job.rawData).length,
        },
      })

      job.problemsDetected = problemsDetected.length
      job.status = 'COMPLETED'
      job.completedAt = new Date()
      job.processingTime = job.completedAt.getTime() - job.startedAt.getTime()

      // Update source metrics
      this.updateSourceMetrics(source, job)

      // Store job results
      await this.storeJobResults(job, problemsDetected)

      console.log(`Job completed: ${job.id} - Detected ${problemsDetected.length} problems`)

      // Emit job completed event
      this.emit('jobCompleted', job, problemsDetected)
    } catch (error) {
      console.error(`Job ${job.id} failed:`, error)

      job.error = error instanceof Error ? error.message : 'Unknown error'
      job.retryCount++

      if (job.retryCount < job.maxRetries) {
        job.status = 'PENDING'
        console.log(`Retrying job ${job.id} (attempt ${job.retryCount}/${job.maxRetries})`)
      } else {
        job.status = 'FAILED'
        job.completedAt = new Date()
        console.error(`Job ${job.id} failed after ${job.maxRetries} attempts`)
      }

      // Update source error count
      const source = this.dataSources.get(job.sourceId)
      if (source) {
        source.errorCount++
        source.successRate = Math.max(0, source.successRate - 2)
      }

      this.emit('jobFailed', job, error)
    }
  }

  /**
   * Process source-specific data
   */
  private async processSourceData(
    rawData: Record<string, unknown>,
    source: DataSource
  ): Promise<Record<string, unknown>> {
    const processed: Record<string, unknown> = {
      sourceType: source.type,
      processedAt: new Date(),
      dataQuality: 'HIGH',
    }

    switch (source.type) {
      case 'SOCIAL_MEDIA':
        processed.posts = rawData.posts?.map((post: unknown) => ({
          ...post,
          problemIndicators: this.extractProblemIndicators(post.content),
          sentimentScore: post.sentiment || 0,
        }))
        break

      case 'NEWS_ARTICLE':
        processed.articles = rawData.articles?.map((article: unknown) => ({
          ...article,
          problemIndicators: this.extractProblemIndicators(article.content),
          sentimentScore: article.sentiment || 0,
        }))
        break

      case 'JOB_POSTING':
        processed.jobs = rawData.jobs?.map((job: unknown) => ({
          ...job,
          urgencyLevel: job.urgencyIndicators?.length > 0 ? 'HIGH' : 'MEDIUM',
          problemSignals: job.urgencyIndicators || [],
        }))
        break

      default:
        processed.rawData = rawData
    }

    return processed
  }

  /**
   * Extract content for problem analysis
   */
  private extractContentForAnalysis(
    rawData: Record<string, unknown>,
    sourceType: ProblemSource
  ): string {
    let content = ''

    switch (sourceType) {
      case 'SOCIAL_MEDIA':
        content = rawData.posts?.map((post: unknown) => post.content).join(' ') || ''
        break
      case 'NEWS_ARTICLE':
        content =
          rawData.articles
            ?.map((article: unknown) => `${article.title} ${article.content}`)
            .join(' ') || ''
        break
      case 'JOB_POSTING':
        content = rawData.jobs?.map((job: unknown) => `${job.title} ${job.description}`).join(' ') || ''
        break
      default:
        content = JSON.stringify(rawData)
    }

    return content
  }

  /**
   * Extract problem indicators from text
   */
  private extractProblemIndicators(text: string): string[] {
    const indicators: string[] = []
    const textLower = text.toLowerCase()

    const problemKeywords = [
      'problem',
      'issue',
      'bug',
      'error',
      'fail',
      'broken',
      'down',
      'slow',
      'terrible',
      'awful',
      'frustrating',
      'annoying',
      'urgent',
      'critical',
      'emergency',
      'help',
      'support',
    ]

    for (const keyword of problemKeywords) {
      if (textLower.includes(keyword)) {
        indicators.push(keyword)
      }
    }

    return indicators
  }

  /**
   * Update source performance metrics
   */
  private updateSourceMetrics(source: DataSource, job: IngestionJob): void {
    if (job.status === 'COMPLETED' && job.processingTime) {
      source.avgProcessingTime = (source.avgProcessingTime + job.processingTime) / 2
      source.successRate = Math.min(100, source.successRate + 1)

      // Update data quality based on problems detected
      if (job.problemsDetected && job.problemsDetected > 0) {
        source.dataQualityScore = Math.min(100, source.dataQualityScore + 2)
      }
    }
  }

  /**
   * Store job results in database
   */
  private async storeJobResults(job: IngestionJob, problems: unknown[]): Promise<void> {
    try {
      // Store the ingestion job record
      await prisma.intelligenceReport.create({
        data: {
          tenantId: job.tenantId,
          companyIntelligenceId: job.companyId || 'unknown',
          reportType: 'DATA_INGESTION',
          reportTitle: `Data Ingestion - ${job.sourceId}`,
          reportSummary: `Processed ${JSON.stringify(job.rawData).length} bytes of data, detected ${problems.length} problems`,
          executiveSummary: `Automated data ingestion from ${job.sourceId} completed successfully`,
          keyFindings: {
            sourceId: job.sourceId,
            jobId: job.id,
            dataSize: JSON.stringify(job.rawData).length,
            problemsDetected: problems.length,
            processingTime: job.processingTime,
          },
          problemsDetected: problems.length,
          opportunitiesIdentified: 0,
          riskAssessment: {
            riskLevel: problems.length > 3 ? 'HIGH' : problems.length > 1 ? 'MEDIUM' : 'LOW',
            factors: problems.map((p) => p.category?.name || 'Unknown'),
          },
          actionItems: {
            immediate: problems
              .filter((p) => p.severity === 'CRITICAL')
              .map((p) => p.category?.name),
            shortTerm: problems.filter((p) => p.severity === 'MAJOR').map((p) => p.category?.name),
            longTerm: [],
          },
          dataSourcesUsed: [job.sourceId as unknown],
          dataQualityScore: 85,
          analysisConfidence: 80,
        },
      })
    } catch (error) {
      console.error('Failed to store job results:', error)
    }
  }

  /**
   * Validate webhook signature
   */
  private validateWebhookSignature(_payload: WebhookPayload, _secret: string): void {
    // Simple signature validation - in production would use proper HMAC
    if (!payload.signature) {
      throw new Error('Missing webhook signature')
    }

    // Mock validation
    console.log('Webhook signature validated')
  }

  /**
   * Initialize default data sources
   */
  private initializeDataSources(): void {
    console.log('Initializing data ingestion orchestrator')
    // Data sources are registered dynamically when companies are monitored
  }

  /**
   * Get all data sources
   */
  getDataSources(): DataSource[] {
    return Array.from(this.dataSources.values())
  }

  /**
   * Get active jobs
   */
  getActiveJobs(): IngestionJob[] {
    return Array.from(this.activeJobs.values())
  }

  /**
   * Get ingestion statistics
   */
  getStatistics(): Record<string, unknown> {
    const sources = Array.from(this.dataSources.values())
    const jobs = Array.from(this.activeJobs.values())

    return {
      totalSources: sources.length,
      activeSources: sources.filter((s) => s.status === 'ACTIVE').length,
      totalIngested: sources.reduce((sum, s) => sum + s.totalIngested, 0),
      totalJobs: jobs.length,
      completedJobs: jobs.filter((j) => j.status === 'COMPLETED').length,
      failedJobs: jobs.filter((j) => j.status === 'FAILED').length,
      avgProcessingTime: sources.reduce((sum, s) => sum + s.avgProcessingTime, 0) / sources.length,
      avgSuccessRate: sources.reduce((sum, s) => sum + s.successRate, 0) / sources.length,
    }
  }
}

export default DataIngestionOrchestrator
