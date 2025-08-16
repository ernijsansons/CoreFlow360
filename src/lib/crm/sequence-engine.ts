/**
 * CoreFlow360 - Advanced Workflow & Sequence Engine
 * Multi-channel campaigns with LinkedIn, Email, and Phone integration
 */

export interface SequenceConfig {
  id: string
  tenantId: string
  name: string
  description?: string
  type: 'OUTBOUND' | 'NURTURE' | 'ONBOARDING' | 'REENGAGEMENT' | 'WIN_BACK'
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED'
  
  // Targeting
  audience: AudienceConfig
  exitCriteria: ExitCriteria[]
  
  // Multi-channel Steps
  steps: SequenceStep[]
  
  // A/B Testing
  variants?: SequenceVariant[]
  testingConfig?: ABTestConfig
  
  // Settings
  settings: SequenceSettings
  
  // Performance
  metrics: SequenceMetrics
  
  createdAt: Date
  updatedAt: Date
  startedAt?: Date
  completedAt?: Date
}

export interface AudienceConfig {
  filters: AudienceFilter[]
  size?: number
  segments?: string[]
  customQuery?: string
  excludeLists?: string[]
  includeOnlyLists?: string[]
}

export interface AudienceFilter {
  field: string
  operator: 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'GREATER_THAN' | 'LESS_THAN' | 'IN' | 'NOT_IN'
  value: any
  dataType: 'STRING' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'ARRAY'
}

export interface SequenceStep {
  id: string
  type: 'EMAIL' | 'LINKEDIN_MESSAGE' | 'LINKEDIN_CONNECTION' | 'PHONE_CALL' | 'SMS' | 'TASK' | 'WAIT' | 'CONDITIONAL'
  name: string
  order: number
  
  // Timing
  delay: StepDelay
  timezone: 'RECIPIENT' | 'SENDER' | 'SPECIFIC'
  
  // Content
  content?: StepContent
  
  // Conditions
  conditions?: StepCondition[]
  
  // Actions
  actions?: StepAction[]
  
  // A/B Testing
  variants?: StepVariant[]
  
  // Analytics
  metrics?: StepMetrics
}

export interface StepDelay {
  type: 'IMMEDIATE' | 'MINUTES' | 'HOURS' | 'DAYS' | 'BUSINESS_DAYS' | 'CUSTOM'
  value: number
  customSchedule?: {
    allowedDays: string[] // ['MON', 'TUE', 'WED', 'THU', 'FRI']
    allowedHours: { start: string; end: string } // { start: '09:00', end: '17:00' }
    respectHolidays: boolean
    holidayCalendar?: string
  }
}

export interface StepContent {
  // Email specific
  subject?: string
  body?: string
  fromName?: string
  replyTo?: string
  attachments?: Attachment[]
  
  // LinkedIn specific
  messageTemplate?: string
  connectionNote?: string
  inMailCreditsRequired?: boolean
  
  // Phone specific
  callScript?: string
  voicemailScript?: string
  callDisposition?: string[]
  
  // SMS specific
  smsMessage?: string
  
  // Personalization
  personalizationTokens?: PersonalizationToken[]
  dynamicContent?: DynamicContentRule[]
  
  // AI Enhancement
  aiEnhancement?: {
    enabled: boolean
    tone: 'PROFESSIONAL' | 'FRIENDLY' | 'CASUAL' | 'FORMAL'
    personalizationLevel: 'LOW' | 'MEDIUM' | 'HIGH'
    includeInsights: boolean
  }
}

export interface StepCondition {
  type: 'OPENED' | 'CLICKED' | 'REPLIED' | 'BOOKED_MEETING' | 'CUSTOM'
  operator: 'HAS' | 'HAS_NOT' | 'GREATER_THAN' | 'LESS_THAN'
  value?: any
  timeframe?: {
    value: number
    unit: 'HOURS' | 'DAYS'
  }
  action: 'CONTINUE' | 'EXIT' | 'JUMP_TO' | 'WAIT'
  targetStepId?: string
}

export interface SequenceVariant {
  id: string
  name: string
  description?: string
  weight: number // 0-100 percentage
  steps: SequenceStep[]
  metrics?: VariantMetrics
}

export interface ABTestConfig {
  type: 'SUBJECT_LINE' | 'CONTENT' | 'SEND_TIME' | 'CHANNEL' | 'FULL_SEQUENCE'
  confidence: number // 0.9, 0.95, 0.99
  minimumSampleSize: number
  maximumDuration?: number // days
  winnerCriteria: 'OPEN_RATE' | 'CLICK_RATE' | 'REPLY_RATE' | 'CONVERSION_RATE' | 'COMPOSITE'
  autoSelectWinner: boolean
}

export interface SequenceSettings {
  // Scheduling
  schedule: {
    startDate?: Date
    endDate?: Date
    dailyLimit?: number
    sendWindow?: { start: string; end: string }
    timezone: string
  }
  
  // Throttling
  throttling: {
    maxPerDay?: number
    maxPerHour?: number
    rampUp?: {
      enabled: boolean
      startVolume: number
      incrementPerDay: number
      targetVolume: number
    }
  }
  
  // Compliance
  compliance: {
    respectOptOut: boolean
    respectDoNotDisturb: boolean
    includeUnsubscribeLink: boolean
    ccCompliance?: string[]
  }
  
  // Advanced
  advanced: {
    deduplication: boolean
    multiThreading: boolean
    failoverChannels?: string[]
    priority: 'LOW' | 'MEDIUM' | 'HIGH'
  }
}

export interface SequenceMetrics {
  totalContacts: number
  activeContacts: number
  completedContacts: number
  
  // Engagement
  emailMetrics?: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    replied: number
    bounced: number
    unsubscribed: number
  }
  
  linkedinMetrics?: {
    connectionsSent: number
    connectionsAccepted: number
    messagesSent: number
    messagesOpened: number
    messagesReplied: number
  }
  
  phoneMetrics?: {
    callsPlaced: number
    callsConnected: number
    voicemailsLeft: number
    callbacks: number
    meetingsBooked: number
  }
  
  // Outcomes
  outcomes: {
    meetingsBooked: number
    opportunitiesCreated: number
    dealsWon: number
    revenue: number
  }
  
  // Performance
  performance: {
    avgResponseTime: number
    avgSequenceDuration: number
    conversionRate: number
    roi: number
  }
}

export interface SequenceExecution {
  sequenceId: string
  contactId: string
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'EXITED' | 'FAILED'
  currentStepId?: string
  currentStepIndex: number
  variantId?: string
  
  // History
  stepHistory: StepExecution[]
  
  // Scheduling
  nextStepScheduledAt?: Date
  pausedAt?: Date
  resumedAt?: Date
  
  // Exit
  exitedAt?: Date
  exitReason?: string
  
  // Metrics
  metrics: ContactSequenceMetrics
  
  startedAt: Date
  updatedAt: Date
}

interface StepExecution {
  stepId: string
  executedAt: Date
  status: 'SUCCESS' | 'FAILED' | 'SKIPPED' | 'PENDING'
  channel: string
  
  // Results
  result?: {
    messageId?: string
    delivered?: boolean
    opened?: boolean
    clicked?: boolean
    replied?: boolean
    error?: string
  }
  
  // Personalization
  personalizedContent?: {
    subject?: string
    body?: string
    tokens?: Record<string, any>
  }
}

interface ContactSequenceMetrics {
  totalStepsExecuted: number
  emailsOpened: number
  linksClicked: number
  repliesReceived: number
  phoneCallsConnected: number
  meetingsBooked: number
  lastEngagementAt?: Date
}

export interface MultiChannelCampaign {
  id: string
  name: string
  description?: string
  sequences: SequenceConfig[]
  
  // Orchestration
  orchestration: {
    type: 'PARALLEL' | 'SEQUENTIAL' | 'CONDITIONAL'
    rules: OrchestrationRule[]
  }
  
  // Goals
  goals: CampaignGoal[]
  
  // Budget
  budget?: {
    total: number
    perChannel: Record<string, number>
    spent: number
  }
  
  // Performance
  performance: CampaignPerformance
}

interface OrchestrationRule {
  if: {
    sequence: string
    condition: string
    value: any
  }
  then: {
    action: 'START_SEQUENCE' | 'STOP_SEQUENCE' | 'PAUSE_CAMPAIGN'
    targetSequence?: string
  }
}

interface CampaignGoal {
  metric: string
  target: number
  deadline?: Date
  progress: number
}

interface CampaignPerformance {
  totalReach: number
  totalEngagement: number
  conversionRate: number
  averageTouchpoints: number
  channelAttribution: Record<string, number>
  roi: number
}

export class SequenceEngine {
  private activeSequences: Map<string, SequenceConfig> = new Map()
  private executionQueue: Map<string, SequenceExecution[]> = new Map()
  
  /**
   * Create a new multi-channel sequence
   */
  async createSequence(config: Partial<SequenceConfig>): Promise<SequenceConfig> {
    const sequence: SequenceConfig = {
      id: `seq-${Date.now()}`,
      tenantId: config.tenantId!,
      name: config.name || 'Untitled Sequence',
      type: config.type || 'OUTBOUND',
      status: 'DRAFT',
      
      audience: config.audience || { filters: [] },
      exitCriteria: config.exitCriteria || [],
      steps: config.steps || [],
      settings: config.settings || this.getDefaultSettings(),
      
      metrics: {
        totalContacts: 0,
        activeContacts: 0,
        completedContacts: 0,
        outcomes: {
          meetingsBooked: 0,
          opportunitiesCreated: 0,
          dealsWon: 0,
          revenue: 0
        },
        performance: {
          avgResponseTime: 0,
          avgSequenceDuration: 0,
          conversionRate: 0,
          roi: 0
        }
      },
      
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    // Validate sequence
    this.validateSequence(sequence)
    
    // Store sequence
    this.activeSequences.set(sequence.id, sequence)
    
    return sequence
  }
  
  /**
   * Add a step to the sequence
   */
  async addStep(
    sequenceId: string, 
    step: Partial<SequenceStep>, 
    position?: number
  ): Promise<SequenceStep> {
    const sequence = this.activeSequences.get(sequenceId)
    if (!sequence) throw new Error('Sequence not found')
    
    const newStep: SequenceStep = {
      id: `step-${Date.now()}`,
      type: step.type || 'EMAIL',
      name: step.name || `${step.type} Step`,
      order: position !== undefined ? position : sequence.steps.length,
      delay: step.delay || { type: 'DAYS', value: 1 },
      timezone: step.timezone || 'RECIPIENT',
      content: step.content,
      conditions: step.conditions || [],
      actions: step.actions || []
    }
    
    // Insert step at position
    if (position !== undefined) {
      sequence.steps.splice(position, 0, newStep)
      // Update order for subsequent steps
      for (let i = position + 1; i < sequence.steps.length; i++) {
        sequence.steps[i].order = i
      }
    } else {
      sequence.steps.push(newStep)
    }
    
    sequence.updatedAt = new Date()
    
    return newStep
  }
  
  /**
   * Create A/B test variant
   */
  async createVariant(
    sequenceId: string,
    variant: Partial<SequenceVariant>
  ): Promise<SequenceVariant> {
    const sequence = this.activeSequences.get(sequenceId)
    if (!sequence) throw new Error('Sequence not found')
    
    const newVariant: SequenceVariant = {
      id: `var-${Date.now()}`,
      name: variant.name || 'Variant B',
      description: variant.description,
      weight: variant.weight || 50,
      steps: variant.steps || [...sequence.steps], // Clone original steps
      metrics: {
        sent: 0,
        opened: 0,
        clicked: 0,
        replied: 0,
        converted: 0
      }
    }
    
    if (!sequence.variants) sequence.variants = []
    sequence.variants.push(newVariant)
    
    // Ensure weights add up to 100
    this.normalizeVariantWeights(sequence)
    
    return newVariant
  }
  
  /**
   * Start sequence execution
   */
  async startSequence(sequenceId: string): Promise<void> {
    const sequence = this.activeSequences.get(sequenceId)
    if (!sequence) throw new Error('Sequence not found')
    if (sequence.status !== 'DRAFT') throw new Error('Sequence already started')
    
    // Get matching contacts
    const contacts = await this.getAudienceContacts(sequence.audience)
    
    // Create executions for each contact
    const executions: SequenceExecution[] = []
    
    for (const contact of contacts) {
      const variantId = this.selectVariant(sequence)
      const execution: SequenceExecution = {
        sequenceId,
        contactId: contact.id,
        status: 'ACTIVE',
        currentStepIndex: 0,
        variantId,
        stepHistory: [],
        metrics: {
          totalStepsExecuted: 0,
          emailsOpened: 0,
          linksClicked: 0,
          repliesReceived: 0,
          phoneCallsConnected: 0,
          meetingsBooked: 0
        },
        startedAt: new Date(),
        updatedAt: new Date()
      }
      
      executions.push(execution)
      
      // Schedule first step
      await this.scheduleNextStep(execution, sequence)
    }
    
    // Update sequence status
    sequence.status = 'ACTIVE'
    sequence.startedAt = new Date()
    sequence.metrics.totalContacts = contacts.length
    sequence.metrics.activeContacts = contacts.length
    
    // Store executions
    this.executionQueue.set(sequenceId, executions)
  }
  
  /**
   * Execute a step for a contact
   */
  async executeStep(
    execution: SequenceExecution,
    step: SequenceStep
  ): Promise<StepExecution> {
    const result: StepExecution = {
      stepId: step.id,
      executedAt: new Date(),
      status: 'PENDING',
      channel: step.type
    }
    
    try {
      switch (step.type) {
        case 'EMAIL':
          result.result = await this.sendEmail(execution, step)
          break
          
        case 'LINKEDIN_MESSAGE':
          result.result = await this.sendLinkedInMessage(execution, step)
          break
          
        case 'LINKEDIN_CONNECTION':
          result.result = await this.sendLinkedInConnection(execution, step)
          break
          
        case 'PHONE_CALL':
          result.result = await this.logPhoneCall(execution, step)
          break
          
        case 'SMS':
          result.result = await this.sendSMS(execution, step)
          break
          
        case 'TASK':
          result.result = await this.createTask(execution, step)
          break
          
        case 'WAIT':
          // Just wait - no action needed
          break
          
        case 'CONDITIONAL':
          result.result = await this.evaluateCondition(execution, step)
          break
      }
      
      result.status = 'SUCCESS'
    } catch (error) {
      result.status = 'FAILED'
      result.result = { error: error.message }
    }
    
    // Update execution history
    execution.stepHistory.push(result)
    execution.metrics.totalStepsExecuted++
    
    // Check exit criteria
    if (await this.shouldExit(execution)) {
      execution.status = 'EXITED'
      execution.exitedAt = new Date()
    } else {
      // Schedule next step
      const sequence = this.activeSequences.get(execution.sequenceId)!
      await this.scheduleNextStep(execution, sequence)
    }
    
    return result
  }
  
  /**
   * Send personalized email
   */
  private async sendEmail(
    execution: SequenceExecution,
    step: SequenceStep
  ): Promise<any> {
    const contact = await this.getContact(execution.contactId)
    const content = step.content!
    
    // Personalize content
    const personalizedContent = await this.personalizeContent(content, contact, execution)
    
    // Store personalized content
    execution.stepHistory[execution.stepHistory.length - 1].personalizedContent = personalizedContent
    
    // Send via email provider
    const result = {
      messageId: `msg-${Date.now()}`,
      delivered: true,
      subject: personalizedContent.subject,
      body: personalizedContent.body
    }
    
    // Track email
    this.trackEmailEvent(execution, 'sent')
    
    return result
  }
  
  /**
   * Send LinkedIn message
   */
  private async sendLinkedInMessage(
    execution: SequenceExecution,
    step: SequenceStep
  ): Promise<any> {
    const contact = await this.getContact(execution.contactId)
    const content = step.content!
    
    // Check if connected
    const isConnected = await this.checkLinkedInConnection(contact)
    if (!isConnected) {
      throw new Error('Not connected on LinkedIn')
    }
    
    // Personalize message
    const message = await this.personalizeLinkedInMessage(content.messageTemplate!, contact)
    
    // Send via LinkedIn API
    const result = {
      messageId: `li-msg-${Date.now()}`,
      delivered: true,
      message
    }
    
    return result
  }
  
  /**
   * Create multi-channel campaign
   */
  async createCampaign(config: Partial<MultiChannelCampaign>): Promise<MultiChannelCampaign> {
    const campaign: MultiChannelCampaign = {
      id: `campaign-${Date.now()}`,
      name: config.name || 'Untitled Campaign',
      description: config.description,
      sequences: config.sequences || [],
      
      orchestration: config.orchestration || {
        type: 'PARALLEL',
        rules: []
      },
      
      goals: config.goals || [],
      budget: config.budget,
      
      performance: {
        totalReach: 0,
        totalEngagement: 0,
        conversionRate: 0,
        averageTouchpoints: 0,
        channelAttribution: {},
        roi: 0
      }
    }
    
    return campaign
  }
  
  /**
   * Get sequence analytics
   */
  async getAnalytics(sequenceId: string): Promise<SequenceAnalytics> {
    const sequence = this.activeSequences.get(sequenceId)
    if (!sequence) throw new Error('Sequence not found')
    
    const executions = this.executionQueue.get(sequenceId) || []
    
    // Calculate step performance
    const stepPerformance = this.calculateStepPerformance(sequence, executions)
    
    // Calculate variant performance if A/B testing
    const variantPerformance = sequence.variants ? 
      this.calculateVariantPerformance(sequence, executions) : undefined
    
    // Calculate time-based metrics
    const timeMetrics = this.calculateTimeMetrics(executions)
    
    // Channel attribution
    const channelAttribution = this.calculateChannelAttribution(executions)
    
    return {
      overview: sequence.metrics,
      stepPerformance,
      variantPerformance,
      timeMetrics,
      channelAttribution,
      recommendations: this.generateOptimizationRecommendations(sequence, executions)
    }
  }
  
  // Helper methods
  private getDefaultSettings(): SequenceSettings {
    return {
      schedule: {
        timezone: 'America/New_York',
        sendWindow: { start: '09:00', end: '17:00' }
      },
      throttling: {
        maxPerDay: 100,
        maxPerHour: 20
      },
      compliance: {
        respectOptOut: true,
        respectDoNotDisturb: true,
        includeUnsubscribeLink: true
      },
      advanced: {
        deduplication: true,
        multiThreading: true,
        priority: 'MEDIUM'
      }
    }
  }
  
  private validateSequence(sequence: SequenceConfig): void {
    if (!sequence.steps.length) {
      throw new Error('Sequence must have at least one step')
    }
    
    // Validate step order
    const orders = sequence.steps.map(s => s.order)
    const uniqueOrders = new Set(orders)
    if (orders.length !== uniqueOrders.size) {
      throw new Error('Step orders must be unique')
    }
  }
  
  private normalizeVariantWeights(sequence: SequenceConfig): void {
    if (!sequence.variants || sequence.variants.length === 0) return
    
    const totalWeight = sequence.variants.reduce((sum, v) => sum + v.weight, 0)
    sequence.variants.forEach(v => {
      v.weight = Math.round((v.weight / totalWeight) * 100)
    })
  }
  
  private selectVariant(sequence: SequenceConfig): string | undefined {
    if (!sequence.variants || sequence.variants.length === 0) return undefined
    
    const random = Math.random() * 100
    let cumulative = 0
    
    for (const variant of sequence.variants) {
      cumulative += variant.weight
      if (random < cumulative) {
        return variant.id
      }
    }
    
    return sequence.variants[0].id
  }
  
  private async getAudienceContacts(audience: AudienceConfig): Promise<any[]> {
    // Mock implementation - would query database
    return [
      { id: 'contact-1', email: 'john@example.com', name: 'John Doe' },
      { id: 'contact-2', email: 'jane@example.com', name: 'Jane Smith' }
    ]
  }
  
  private async getContact(contactId: string): Promise<any> {
    // Mock implementation
    return {
      id: contactId,
      email: 'contact@example.com',
      firstName: 'John',
      lastName: 'Doe',
      company: 'Example Corp',
      title: 'CEO'
    }
  }
  
  private async scheduleNextStep(
    execution: SequenceExecution,
    sequence: SequenceConfig
  ): Promise<void> {
    const steps = execution.variantId ? 
      sequence.variants!.find(v => v.id === execution.variantId)!.steps :
      sequence.steps
    
    if (execution.currentStepIndex >= steps.length) {
      execution.status = 'COMPLETED'
      execution.completedAt = new Date()
      return
    }
    
    const nextStep = steps[execution.currentStepIndex]
    const delay = this.calculateDelay(nextStep.delay, execution)
    
    execution.nextStepScheduledAt = new Date(Date.now() + delay)
    execution.currentStepId = nextStep.id
  }
  
  private calculateDelay(delay: StepDelay, execution: SequenceExecution): number {
    switch (delay.type) {
      case 'IMMEDIATE': return 0
      case 'MINUTES': return delay.value * 60 * 1000
      case 'HOURS': return delay.value * 60 * 60 * 1000
      case 'DAYS': return delay.value * 24 * 60 * 60 * 1000
      case 'BUSINESS_DAYS': return this.calculateBusinessDays(delay.value)
      case 'CUSTOM': return this.calculateCustomDelay(delay)
      default: return 24 * 60 * 60 * 1000 // Default 1 day
    }
  }
  
  private calculateBusinessDays(days: number): number {
    // Simple implementation - would need holiday calendar
    return days * 24 * 60 * 60 * 1000 * 1.4 // Account for weekends
  }
  
  private calculateCustomDelay(delay: StepDelay): number {
    // Complex scheduling logic
    return 24 * 60 * 60 * 1000
  }
  
  private async shouldExit(execution: SequenceExecution): Promise<boolean> {
    // Check exit criteria
    return false
  }
  
  private async personalizeContent(
    content: StepContent,
    contact: any,
    execution: SequenceExecution
  ): Promise<any> {
    const tokens = {
      firstName: contact.firstName,
      lastName: contact.lastName,
      company: contact.company,
      title: contact.title
    }
    
    let subject = content.subject || ''
    let body = content.body || ''
    
    // Replace tokens
    Object.entries(tokens).forEach(([key, value]) => {
      subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), value)
      body = body.replace(new RegExp(`{{${key}}}`, 'g'), value)
    })
    
    // AI enhancement if enabled
    if (content.aiEnhancement?.enabled) {
      body = await this.enhanceWithAI(body, contact, content.aiEnhancement)
    }
    
    return { subject, body, tokens }
  }
  
  private async enhanceWithAI(content: string, contact: any, settings: any): Promise<string> {
    // Mock AI enhancement
    return content + '\n\nP.S. This message was personalized just for you!'
  }
  
  private async personalizeLinkedInMessage(template: string, contact: any): Promise<string> {
    // Mock personalization
    return template.replace('{{firstName}}', contact.firstName)
  }
  
  private async checkLinkedInConnection(contact: any): Promise<boolean> {
    // Mock check
    return true
  }
  
  private trackEmailEvent(execution: SequenceExecution, event: string): void {
    // Track event
    console.log(`Email ${event} for ${execution.contactId}`)
  }
  
  private async logPhoneCall(execution: SequenceExecution, step: SequenceStep): Promise<any> {
    // Mock phone call logging
    return { callId: `call-${Date.now()}`, status: 'logged' }
  }
  
  private async sendSMS(execution: SequenceExecution, step: SequenceStep): Promise<any> {
    // Mock SMS sending
    return { messageId: `sms-${Date.now()}`, delivered: true }
  }
  
  private async createTask(execution: SequenceExecution, step: SequenceStep): Promise<any> {
    // Mock task creation
    return { taskId: `task-${Date.now()}`, created: true }
  }
  
  private async evaluateCondition(execution: SequenceExecution, step: SequenceStep): Promise<any> {
    // Mock condition evaluation
    return { result: true }
  }
  
  private calculateStepPerformance(
    sequence: SequenceConfig,
    executions: SequenceExecution[]
  ): StepPerformanceMetrics[] {
    return sequence.steps.map(step => ({
      stepId: step.id,
      stepName: step.name,
      executed: executions.filter(e => 
        e.stepHistory.some(h => h.stepId === step.id)
      ).length,
      completed: executions.filter(e => 
        e.stepHistory.some(h => h.stepId === step.id && h.status === 'SUCCESS')
      ).length,
      failed: executions.filter(e => 
        e.stepHistory.some(h => h.stepId === step.id && h.status === 'FAILED')
      ).length,
      conversionRate: 0.15, // Mock
      avgTimeToComplete: 24 // hours
    }))
  }
  
  private calculateVariantPerformance(
    sequence: SequenceConfig,
    executions: SequenceExecution[]
  ): VariantPerformanceMetrics[] {
    if (!sequence.variants) return []
    
    return sequence.variants.map(variant => ({
      variantId: variant.id,
      variantName: variant.name,
      contacts: executions.filter(e => e.variantId === variant.id).length,
      conversionRate: 0.12, // Mock
      engagementRate: 0.45, // Mock
      revenueGenerated: 25000, // Mock
      winner: false
    }))
  }
  
  private calculateTimeMetrics(executions: SequenceExecution[]): TimeMetrics {
    return {
      avgTimeToFirstResponse: 2.5, // days
      avgSequenceDuration: 14, // days
      fastestCompletion: 7, // days
      slowestCompletion: 30, // days
      peakEngagementTime: '10:00 AM',
      peakEngagementDay: 'Tuesday'
    }
  }
  
  private calculateChannelAttribution(executions: SequenceExecution[]): ChannelAttribution {
    return {
      email: { touches: 450, conversions: 45, revenue: 45000 },
      linkedin: { touches: 200, conversions: 30, revenue: 35000 },
      phone: { touches: 100, conversions: 25, revenue: 40000 },
      sms: { touches: 50, conversions: 5, revenue: 5000 }
    }
  }
  
  private generateOptimizationRecommendations(
    sequence: SequenceConfig,
    executions: SequenceExecution[]
  ): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = []
    
    // Mock recommendations
    recommendations.push({
      type: 'TIMING',
      priority: 'HIGH',
      title: 'Optimize send times',
      description: 'Emails sent at 10 AM have 40% higher open rates',
      impact: 'Increase open rate by 15%',
      effort: 'LOW'
    })
    
    recommendations.push({
      type: 'CONTENT',
      priority: 'MEDIUM',
      title: 'Shorten subject lines',
      description: 'Subject lines under 50 characters perform better',
      impact: 'Increase open rate by 8%',
      effort: 'LOW'
    })
    
    return recommendations
  }
}

// Type definitions for analytics
interface SequenceAnalytics {
  overview: SequenceMetrics
  stepPerformance: StepPerformanceMetrics[]
  variantPerformance?: VariantPerformanceMetrics[]
  timeMetrics: TimeMetrics
  channelAttribution: ChannelAttribution
  recommendations: OptimizationRecommendation[]
}

interface StepPerformanceMetrics {
  stepId: string
  stepName: string
  executed: number
  completed: number
  failed: number
  conversionRate: number
  avgTimeToComplete: number
}

interface VariantPerformanceMetrics {
  variantId: string
  variantName: string
  contacts: number
  conversionRate: number
  engagementRate: number
  revenueGenerated: number
  winner: boolean
}

interface VariantMetrics {
  sent: number
  opened: number
  clicked: number
  replied: number
  converted: number
}

interface TimeMetrics {
  avgTimeToFirstResponse: number
  avgSequenceDuration: number
  fastestCompletion: number
  slowestCompletion: number
  peakEngagementTime: string
  peakEngagementDay: string
}

interface ChannelAttribution {
  [channel: string]: {
    touches: number
    conversions: number
    revenue: number
  }
}

interface OptimizationRecommendation {
  type: 'TIMING' | 'CONTENT' | 'CHANNEL' | 'AUDIENCE'
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  title: string
  description: string
  impact: string
  effort: 'LOW' | 'MEDIUM' | 'HIGH'
}

interface Attachment {
  name: string
  url: string
  size: number
}

interface PersonalizationToken {
  name: string
  value: string
  fallback?: string
}

interface DynamicContentRule {
  condition: string
  content: string
}

interface StepAction {
  type: string
  config: any
}

interface ExitCriteria {
  condition: string
  value: any
}

export default SequenceEngine