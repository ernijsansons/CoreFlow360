/**
 * CoreFlow360 - Autonomous Company Intelligence Orchestrator  
 * Manages and coordinates multiple intelligence agents for real-time company monitoring
 */

import { OpenAI } from 'openai'
import { prisma } from '@/lib/db'
import { ProblemSource, CompanyMonitoringStatus } from '@prisma/client'

export interface IntelligenceAgent {
  id: string
  name: string
  type: ProblemSource
  status: 'ACTIVE' | 'PAUSED' | 'ERROR' | 'INITIALIZING'
  lastExecution: Date | null
  nextExecution: Date | null
  executionCount: number
  errorCount: number
  successRate: number
  
  // Configuration
  config: Record<string, any>
  frequency: 'REAL_TIME' | 'HOURLY' | 'DAILY' | 'WEEKLY'
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  
  // Performance Metrics
  avgExecutionTime: number
  dataPointsCollected: number
  problemsDetected: number
  accuracy: number
}

export interface CompanyMonitoringConfig {
  companyId: string
  companyName: string
  companyDomain: string
  industryType: string
  enabledAgents: ProblemSource[]
  monitoringDepth: 'SURFACE' | 'STANDARD' | 'DEEP' | 'COMPREHENSIVE'
  alertThresholds: {
    problemSeverity: string[]
    confidenceMinimum: number
    rapidChangeDetection: boolean
  }
}

export interface IntelligenceInsight {
  id: string
  agentId: string
  companyId: string
  source: ProblemSource
  timestamp: Date
  
  // Data
  rawData: Record<string, any>
  processedData: Record<string, any>
  confidence: number
  
  // Analysis
  insights: Array<{
    type: 'PROBLEM' | 'OPPORTUNITY' | 'RISK' | 'TREND'
    category: string
    severity: string
    description: string
    evidence: string[]
    confidence: number
  }>
  
  // Context
  metadata: Record<string, any>
  correlatedInsights: string[]
}

export class CompanyIntelligenceOrchestrator {
  private agents: Map<string, IntelligenceAgent>
  private monitoredCompanies: Map<string, CompanyMonitoringConfig>
  private executionQueue: Array<{ agentId: string; companyId: string; scheduled: Date }>
  private isRunning: boolean = false

  constructor() {
    this.agents = new Map()
    this.monitoredCompanies = new Map()
    this.executionQueue = []
    
    this.initializeAgents()
  }

  /**
   * Start monitoring a company with specified agents
   */
  async startCompanyMonitoring(config: CompanyMonitoringConfig): Promise<void> {
    try {
      console.log(`🎯 Starting comprehensive monitoring for ${config.companyName}`)
      
      // Store monitoring configuration
      this.monitoredCompanies.set(config.companyId, config)
      
      // Initialize agents for this company
      for (const agentType of config.enabledAgents) {
        await this.initializeAgentForCompany(agentType, config)
      }
      
      // Start execution scheduler
      if (!this.isRunning) {
        this.startScheduler()
      }
      
      console.log(`✅ Monitoring started for ${config.companyName} with ${config.enabledAgents.length} agents`)
      
    } catch (error) {
      console.error('❌ Failed to start company monitoring:', error)
      throw error
    }
  }

  /**
   * Initialize specific agent for a company
   */
  private async initializeAgentForCompany(agentType: ProblemSource, config: CompanyMonitoringConfig): Promise<void> {
    const agentId = `${agentType}_${config.companyId}`
    
    let agent: IntelligenceAgent
    
    switch (agentType) {
      case 'SOCIAL_MEDIA':
        agent = await this.createSocialMediaAgent(agentId, config)
        break
        
      case 'NEWS_ARTICLE':
        agent = await this.createNewsAgent(agentId, config)
        break
        
      case 'FINANCIAL_REPORT':
        agent = await this.createFinancialAgent(agentId, config)
        break
        
      case 'JOB_POSTING':
        agent = await this.createJobPostingAgent(agentId, config)
        break
        
      case 'TECHNOLOGY_CHANGE':
        agent = await this.createTechnologyAgent(agentId, config)
        break
        
      case 'REGULATORY_FILING':
        agent = await this.createRegulatoryAgent(agentId, config)
        break
        
      case 'COMPETITOR_INTELLIGENCE':
        agent = await this.createCompetitorAgent(agentId, config)
        break
        
      case 'INDUSTRY_REPORT':
        agent = await this.createIndustryAgent(agentId, config)
        break
        
      default:
        console.warn(`⚠️ Unknown agent type: ${agentType}`)
        return
    }
    
    this.agents.set(agentId, agent)
    this.scheduleAgentExecution(agentId, config.companyId)
  }

  /**
   * Create social media monitoring agent
   */
  private async createSocialMediaAgent(agentId: string, config: CompanyMonitoringConfig): Promise<IntelligenceAgent> {
    return {
      id: agentId,
      name: `Social Media Monitor - ${config.companyName}`,
      type: 'SOCIAL_MEDIA',
      status: 'ACTIVE',
      lastExecution: null,
      nextExecution: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      executionCount: 0,
      errorCount: 0,
      successRate: 100,
      
      config: {
        companyDomain: config.companyDomain,
        companyName: config.companyName,
        platforms: ['twitter', 'linkedin', 'reddit', 'facebook'],
        searchTerms: [
          config.companyName,
          config.companyDomain.replace('.com', ''),
          `@${config.companyName.replace(/\s+/g, '').toLowerCase()}`,
        ],
        sentiment_analysis: true,
        engagement_tracking: true
      },
      frequency: 'REAL_TIME',
      priority: 'HIGH',
      
      avgExecutionTime: 0,
      dataPointsCollected: 0,
      problemsDetected: 0,
      accuracy: 95
    }
  }

  /**
   * Create news monitoring agent
   */
  private async createNewsAgent(agentId: string, config: CompanyMonitoringConfig): Promise<IntelligenceAgent> {
    return {
      id: agentId,
      name: `News Monitor - ${config.companyName}`,
      type: 'NEWS_ARTICLE',
      status: 'ACTIVE',
      lastExecution: null,
      nextExecution: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      executionCount: 0,
      errorCount: 0,
      successRate: 100,
      
      config: {
        companyName: config.companyName,
        searchKeywords: [
          config.companyName,
          `${config.companyName} CEO`,
          `${config.companyName} layoffs`,
          `${config.companyName} funding`,
          `${config.companyName} acquisition`
        ],
        sources: [
          'google_news',
          'techcrunch',
          'business_insider',
          'reuters',
          'bloomberg',
          'industry_publications'
        ],
        sentiment_analysis: true,
        impact_analysis: true
      },
      frequency: 'HOURLY',
      priority: 'HIGH',
      
      avgExecutionTime: 0,
      dataPointsCollected: 0,
      problemsDetected: 0,
      accuracy: 90
    }
  }

  /**
   * Create financial monitoring agent
   */
  private async createFinancialAgent(agentId: string, config: CompanyMonitoringConfig): Promise<IntelligenceAgent> {
    return {
      id: agentId,
      name: `Financial Monitor - ${config.companyName}`,
      type: 'FINANCIAL_REPORT',
      status: 'ACTIVE',
      lastExecution: null,
      nextExecution: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      executionCount: 0,
      errorCount: 0,
      successRate: 100,
      
      config: {
        companyName: config.companyName,
        ticker: null, // Would be populated if public company
        reportTypes: [
          'earnings_calls',
          'sec_filings',
          'financial_statements',
          'investor_presentations',
          'analyst_reports'
        ],
        keyMetrics: [
          'revenue_growth',
          'profit_margins',
          'cash_flow',
          'debt_levels',
          'employee_count'
        ]
      },
      frequency: 'DAILY',
      priority: 'MEDIUM',
      
      avgExecutionTime: 0,
      dataPointsCollected: 0,
      problemsDetected: 0,
      accuracy: 85
    }
  }

  /**
   * Create job posting monitoring agent
   */
  private async createJobPostingAgent(agentId: string, config: CompanyMonitoringConfig): Promise<IntelligenceAgent> {
    return {
      id: agentId,
      name: `Job Posting Monitor - ${config.companyName}`,
      type: 'JOB_POSTING',
      status: 'ACTIVE',
      lastExecution: null,
      nextExecution: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
      executionCount: 0,
      errorCount: 0,
      successRate: 100,
      
      config: {
        companyName: config.companyName,
        companyDomain: config.companyDomain,
        sources: ['linkedin', 'indeed', 'glassdoor', 'company_careers_page'],
        analysis_focus: [
          'hiring_urgency',
          'skill_requirements',
          'team_expansion',
          'technology_stack',
          'compensation_trends'
        ],
        problem_indicators: [
          'urgent_hiring',
          'replacement_positions',
          'technology_migrations',
          'new_initiatives'
        ]
      },
      frequency: 'HOURLY',
      priority: 'MEDIUM',
      
      avgExecutionTime: 0,
      dataPointsCollected: 0,
      problemsDetected: 0,
      accuracy: 80
    }
  }

  /**
   * Create technology change monitoring agent
   */
  private async createTechnologyAgent(agentId: string, config: CompanyMonitoringConfig): Promise<IntelligenceAgent> {
    return {
      id: agentId,
      name: `Technology Monitor - ${config.companyName}`,
      type: 'TECHNOLOGY_CHANGE',
      status: 'ACTIVE',
      lastExecution: null,
      nextExecution: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours
      executionCount: 0,
      errorCount: 0,
      successRate: 100,
      
      config: {
        companyDomain: config.companyDomain,
        companyName: config.companyName,
        monitoring_methods: [
          'dns_changes',
          'ssl_certificate_changes',
          'technology_stack_analysis',
          'api_endpoint_monitoring',
          'third_party_integrations'
        ],
        problem_signals: [
          'system_downtime',
          'performance_degradation',
          'security_vulnerabilities',
          'integration_failures',
          'technology_debt'
        ]
      },
      frequency: 'HOURLY',
      priority: 'HIGH',
      
      avgExecutionTime: 0,
      dataPointsCollected: 0,
      problemsDetected: 0,
      accuracy: 92
    }
  }

  /**
   * Create regulatory monitoring agent
   */
  private async createRegulatoryAgent(agentId: string, config: CompanyMonitoringConfig): Promise<IntelligenceAgent> {
    return {
      id: agentId,
      name: `Regulatory Monitor - ${config.companyName}`,
      type: 'REGULATORY_FILING',
      status: 'ACTIVE',
      lastExecution: null,
      nextExecution: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      executionCount: 0,
      errorCount: 0,
      successRate: 100,
      
      config: {
        companyName: config.companyName,
        industryType: config.industryType,
        filing_types: [
          'sec_filings',
          'regulatory_submissions',
          'compliance_reports',
          'legal_proceedings',
          'patent_filings'
        ],
        regulatory_bodies: this.getRegulatoryBodies(config.industryType),
        compliance_focus: this.getComplianceRequirements(config.industryType)
      },
      frequency: 'DAILY',
      priority: 'HIGH',
      
      avgExecutionTime: 0,
      dataPointsCollected: 0,
      problemsDetected: 0,
      accuracy: 88
    }
  }

  /**
   * Create competitor intelligence agent
   */
  private async createCompetitorAgent(agentId: string, config: CompanyMonitoringConfig): Promise<IntelligenceAgent> {
    return {
      id: agentId,
      name: `Competitor Monitor - ${config.companyName}`,
      type: 'COMPETITOR_INTELLIGENCE',
      status: 'ACTIVE',
      lastExecution: null,
      nextExecution: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours
      executionCount: 0,
      errorCount: 0,
      successRate: 100,
      
      config: {
        companyName: config.companyName,
        industryType: config.industryType,
        competitors: await this.identifyCompetitors(config.companyName, config.industryType),
        monitoring_areas: [
          'product_launches',
          'pricing_changes',
          'customer_wins_losses',
          'strategic_partnerships',
          'market_positioning',
          'customer_satisfaction'
        ],
        opportunity_signals: [
          'competitor_failures',
          'customer_complaints',
          'market_gaps',
          'pricing_vulnerabilities'
        ]
      },
      frequency: 'HOURLY',
      priority: 'HIGH',
      
      avgExecutionTime: 0,
      dataPointsCollected: 0,
      problemsDetected: 0,
      accuracy: 85
    }
  }

  /**
   * Create industry monitoring agent
   */
  private async createIndustryAgent(agentId: string, config: CompanyMonitoringConfig): Promise<IntelligenceAgent> {
    return {
      id: agentId,
      name: `Industry Monitor - ${config.companyName}`,
      type: 'INDUSTRY_REPORT',
      status: 'ACTIVE',
      lastExecution: null,
      nextExecution: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
      executionCount: 0,
      errorCount: 0,
      successRate: 100,
      
      config: {
        industryType: config.industryType,
        companyName: config.companyName,
        report_sources: [
          'gartner',
          'forrester',
          'idc',
          'mckinsey',
          'deloitte',
          'industry_associations'
        ],
        trend_categories: [
          'technology_trends',
          'market_trends',
          'regulatory_changes',
          'competitive_landscape',
          'customer_behavior'
        ]
      },
      frequency: 'DAILY',
      priority: 'LOW',
      
      avgExecutionTime: 0,
      dataPointsCollected: 0,
      problemsDetected: 0,
      accuracy: 75
    }
  }

  /**
   * Start the execution scheduler
   */
  private startScheduler(): void {
    this.isRunning = true
    
    setInterval(async () => {
      await this.processExecutionQueue()
    }, 60 * 1000) // Check every minute
    
    console.log('🤖 Intelligence orchestrator scheduler started')
  }

  /**
   * Process the execution queue
   */
  private async processExecutionQueue(): Promise<void> {
    const now = new Date()
    const dueExecutions = this.executionQueue.filter(exec => exec.scheduled <= now)
    
    for (const execution of dueExecutions) {
      try {
        await this.executeAgent(execution.agentId, execution.companyId)
        
        // Remove from queue
        this.executionQueue = this.executionQueue.filter(e => e !== execution)
        
        // Schedule next execution
        this.scheduleAgentExecution(execution.agentId, execution.companyId)
        
      } catch (error) {
        console.error(`❌ Agent execution failed: ${execution.agentId}`, error)
        
        // Update error count
        const agent = this.agents.get(execution.agentId)
        if (agent) {
          agent.errorCount++
          agent.successRate = (agent.executionCount - agent.errorCount) / agent.executionCount * 100
        }
      }
    }
  }

  /**
   * Schedule agent execution
   */
  private scheduleAgentExecution(agentId: string, companyId: string): void {
    const agent = this.agents.get(agentId)
    if (!agent) return
    
    let nextExecution: Date
    const now = new Date()
    
    switch (agent.frequency) {
      case 'REAL_TIME':
        nextExecution = new Date(now.getTime() + 5 * 60 * 1000) // 5 minutes
        break
      case 'HOURLY':
        nextExecution = new Date(now.getTime() + 60 * 60 * 1000) // 1 hour
        break
      case 'DAILY':
        nextExecution = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours
        break
      case 'WEEKLY':
        nextExecution = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days
        break
      default:
        nextExecution = new Date(now.getTime() + 60 * 60 * 1000) // Default 1 hour
    }
    
    this.executionQueue.push({
      agentId,
      companyId,
      scheduled: nextExecution
    })
    
    agent.nextExecution = nextExecution
  }

  /**
   * Execute a specific agent
   */
  private async executeAgent(agentId: string, companyId: string): Promise<IntelligenceInsight[]> {
    const agent = this.agents.get(agentId)
    const config = this.monitoredCompanies.get(companyId)
    
    if (!agent || !config) {
      throw new Error('Agent or company config not found')
    }
    
    console.log(`🤖 Executing ${agent.name}...`)
    const startTime = Date.now()
    
    try {
      // Execute agent based on type
      let insights: IntelligenceInsight[] = []
      
      switch (agent.type) {
        case 'SOCIAL_MEDIA':
          insights = await this.executeSocialMediaAgent(agent, config)
          break
        case 'NEWS_ARTICLE':
          insights = await this.executeNewsAgent(agent, config)
          break
        case 'FINANCIAL_REPORT':
          insights = await this.executeFinancialAgent(agent, config)
          break
        case 'JOB_POSTING':
          insights = await this.executeJobPostingAgent(agent, config)
          break
        case 'TECHNOLOGY_CHANGE':
          insights = await this.executeTechnologyAgent(agent, config)
          break
        case 'REGULATORY_FILING':
          insights = await this.executeRegulatoryAgent(agent, config)
          break
        case 'COMPETITOR_INTELLIGENCE':
          insights = await this.executeCompetitorAgent(agent, config)
          break
        case 'INDUSTRY_REPORT':
          insights = await this.executeIndustryAgent(agent, config)
          break
        default:
          throw new Error(`Unknown agent type: ${agent.type}`)
      }
      
      // Update agent metrics
      const executionTime = Date.now() - startTime
      agent.lastExecution = new Date()
      agent.executionCount++
      agent.avgExecutionTime = (agent.avgExecutionTime * (agent.executionCount - 1) + executionTime) / agent.executionCount
      agent.dataPointsCollected += insights.length
      agent.problemsDetected += insights.filter(i => i.insights.some(insight => insight.type === 'PROBLEM')).length
      
      // Store insights in database
      for (const insight of insights) {
        await this.storeInsight(insight)
      }
      
      console.log(`✅ ${agent.name} completed - ${insights.length} insights generated`)
      return insights
      
    } catch (error) {
      agent.errorCount++
      throw error
    }
  }

  /**
   * Execute social media monitoring agent
   */
  private async executeSocialMediaAgent(agent: IntelligenceAgent, config: CompanyMonitoringConfig): Promise<IntelligenceInsight[]> {
    // Simulate social media monitoring - in production this would call real APIs
    const insights: IntelligenceInsight[] = []
    
    // Mock social media data
    const mockPosts = [
      {
        platform: 'twitter',
        content: `Just had another frustrating experience with ${config.companyName}'s customer service. 3 hours on hold!`,
        sentiment: -0.8,
        engagement: 15,
        author: 'customer_user123'
      },
      {
        platform: 'linkedin',
        content: `${config.companyName} is hiring 50 new engineers - major expansion happening!`,
        sentiment: 0.6,
        engagement: 42,
        author: 'industry_insider'
      }
    ]
    
    for (const post of mockPosts) {
      if (post.sentiment < -0.5) {
        insights.push({
          id: `social_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          agentId: agent.id,
          companyId: config.companyId,
          source: 'SOCIAL_MEDIA',
          timestamp: new Date(),
          rawData: post,
          processedData: {
            sentiment_analysis: post.sentiment,
            engagement_level: post.engagement > 20 ? 'HIGH' : 'MEDIUM',
            problem_indicators: ['customer_service', 'wait_times']
          },
          confidence: 75,
          insights: [{
            type: 'PROBLEM',
            category: 'Customer Service',
            severity: 'MODERATE',
            description: 'Customer service wait times causing frustration',
            evidence: [post.content],
            confidence: 80
          }],
          metadata: {
            platform: post.platform,
            author: post.author,
            viral_potential: post.engagement > 30
          },
          correlatedInsights: []
        })
      }
    }
    
    return insights
  }

  /**
   * Execute news monitoring agent
   */
  private async executeNewsAgent(agent: IntelligenceAgent, config: CompanyMonitoringConfig): Promise<IntelligenceInsight[]> {
    // Simulate news monitoring
    const insights: IntelligenceInsight[] = []
    
    // Mock news articles
    const mockArticles = [
      {
        title: `${config.companyName} Announces Layoffs Amid Market Uncertainty`,
        content: `${config.companyName} announced today that it will be reducing its workforce by 15% as part of cost-cutting measures...`,
        source: 'TechCrunch',
        sentiment: -0.6,
        impact_score: 85
      }
    ]
    
    for (const article of mockArticles) {
      if (article.impact_score > 70) {
        insights.push({
          id: `news_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          agentId: agent.id,
          companyId: config.companyId,
          source: 'NEWS_ARTICLE',
          timestamp: new Date(),
          rawData: article,
          processedData: {
            sentiment: article.sentiment,
            impact_assessment: article.impact_score > 80 ? 'HIGH' : 'MEDIUM',
            keywords: ['layoffs', 'cost-cutting', 'market uncertainty']
          },
          confidence: 90,
          insights: [{
            type: 'PROBLEM',
            category: 'Financial Stress',
            severity: 'MAJOR',
            description: 'Company experiencing financial pressure leading to workforce reduction',
            evidence: [article.title, article.content.substring(0, 200)],
            confidence: 85
          }],
          metadata: {
            source: article.source,
            media_reach: 'HIGH',
            industry_attention: true
          },
          correlatedInsights: []
        })
      }
    }
    
    return insights
  }

  // Additional agent execution methods would be implemented here...
  private async executeFinancialAgent(agent: IntelligenceAgent, config: CompanyMonitoringConfig): Promise<IntelligenceInsight[]> {
    return [] // Placeholder
  }

  private async executeJobPostingAgent(agent: IntelligenceAgent, config: CompanyMonitoringConfig): Promise<IntelligenceInsight[]> {
    return [] // Placeholder
  }

  private async executeTechnologyAgent(agent: IntelligenceAgent, config: CompanyMonitoringConfig): Promise<IntelligenceInsight[]> {
    return [] // Placeholder
  }

  private async executeRegulatoryAgent(agent: IntelligenceAgent, config: CompanyMonitoringConfig): Promise<IntelligenceInsight[]> {
    return [] // Placeholder
  }

  private async executeCompetitorAgent(agent: IntelligenceAgent, config: CompanyMonitoringConfig): Promise<IntelligenceInsight[]> {
    return [] // Placeholder
  }

  private async executeIndustryAgent(agent: IntelligenceAgent, config: CompanyMonitoringConfig): Promise<IntelligenceInsight[]> {
    return [] // Placeholder
  }

  /**
   * Store insight in database
   */
  private async storeInsight(insight: IntelligenceInsight): Promise<void> {
    // Convert insight to problem format and store
    for (const analysisInsight of insight.insights) {
      if (analysisInsight.type === 'PROBLEM') {
        await prisma.customerProblem.create({
          data: {
            tenantId: 'default', // Would be passed from context
            companyIntelligenceId: insight.companyId,
            problemTitle: analysisInsight.description,
            problemDescription: JSON.stringify(analysisInsight),
            problemCategory: analysisInsight.category,
            severity: analysisInsight.severity as any,
            detectionSource: [insight.source],
            sourceData: insight.rawData,
            confidenceScore: analysisInsight.confidence,
            urgencyScore: this.calculateUrgencyFromSeverity(analysisInsight.severity),
            aiInsights: {
              agent: insight.agentId,
              evidence: analysisInsight.evidence,
              metadata: insight.metadata
            }
          }
        })
      }
    }
  }

  // Helper methods
  private getRegulatoryBodies(industryType: string): string[] {
    const regulatoryMap: Record<string, string[]> = {
      'FINANCE': ['SEC', 'FINRA', 'FDIC', 'OCC'],
      'HEALTHCARE': ['FDA', 'CMS', 'HHS', 'DEA'],
      'MANUFACTURING': ['OSHA', 'EPA', 'FDA'],
      // Add more industries...
    }
    
    return regulatoryMap[industryType] || []
  }

  private getComplianceRequirements(industryType: string): string[] {
    const complianceMap: Record<string, string[]> = {
      'FINANCE': ['SOX', 'KYC', 'AML', 'GDPR'],
      'HEALTHCARE': ['HIPAA', 'HITECH', 'FDA 21 CFR Part 11'],
      'MANUFACTURING': ['ISO 9001', 'ISO 14001', 'OSHA Standards'],
      // Add more industries...
    }
    
    return complianceMap[industryType] || []
  }

  private async identifyCompetitors(companyName: string, industryType: string): Promise<string[]> {
    // Simplified competitor identification - in production would use comprehensive database
    const industryCompetitors: Record<string, string[]> = {
      'FINANCE': ['Goldman Sachs', 'JP Morgan', 'Bank of America'],
      'HEALTHCARE': ['Johnson & Johnson', 'Pfizer', 'UnitedHealth'],
      'MANUFACTURING': ['General Electric', 'Siemens', '3M'],
      // Add more industries...
    }
    
    return industryCompetitors[industryType]?.slice(0, 5) || []
  }

  private calculateUrgencyFromSeverity(severity: string): number {
    const severityUrgency: Record<string, number> = {
      'EXISTENTIAL': 95,
      'CRITICAL': 80,
      'MAJOR': 60,
      'MODERATE': 40,
      'MINOR': 20
    }
    
    return severityUrgency[severity] || 40
  }

  /**
   * Get all agents status
   */
  getAgentsStatus(): IntelligenceAgent[] {
    return Array.from(this.agents.values())
  }

  /**
   * Get monitored companies
   */
  getMonitoredCompanies(): CompanyMonitoringConfig[] {
    return Array.from(this.monitoredCompanies.values())
  }

  /**
   * Pause/resume specific agent
   */
  toggleAgent(agentId: string, active: boolean): void {
    const agent = this.agents.get(agentId)
    if (agent) {
      agent.status = active ? 'ACTIVE' : 'PAUSED'
    }
  }

  /**
   * Initialize all available agents
   */
  private initializeAgents(): void {
    console.log('🤖 Initializing Company Intelligence Orchestrator')
    // Agent types are created on-demand when monitoring is started
  }
}

export default CompanyIntelligenceOrchestrator