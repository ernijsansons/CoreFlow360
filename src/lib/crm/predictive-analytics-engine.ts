/**
 * CoreFlow360 - Predictive Analytics Engine
 * ML-powered conversion probability, deal size prediction, and competitive intelligence
 */

import { LeadProfile } from './lead-intelligence-engine'

export interface PredictiveAnalyticsResult {
  leadId: string
  predictions: {
    conversionProbability: ConversionPrediction
    dealSize: DealSizePrediction
    timeToClose: TimeToClosePrediction
    churnRisk: ChurnRiskPrediction
    expansionOpportunity: ExpansionPrediction
    competitivePosition: CompetitivePrediction
  }
  insights: AnalyticsInsight[]
  recommendations: ActionRecommendation[]
  confidence: number
  modelVersion: string
  generatedAt: Date
}

export interface ConversionPrediction {
  probability: number // 0-1
  factors: PredictiveFactor[]
  stage: 'COLD' | 'WARM' | 'HOT' | 'READY'
  trend: 'INCREASING' | 'STABLE' | 'DECREASING'
  nextBestAction: string
  riskFactors: string[]
}

export interface DealSizePrediction {
  estimatedValue: number
  range: {
    min: number
    max: number
    p25: number // 25th percentile
    p50: number // 50th percentile (median)
    p75: number // 75th percentile
  }
  currency: string
  confidence: number
  similarDeals: SimilarDeal[]
  valueDrivers: string[]
}

export interface TimeToClosePrediction {
  estimatedDays: number
  range: {
    optimistic: number
    realistic: number
    pessimistic: number
  }
  criticalPath: SalesStage[]
  accelerators: string[]
  blockers: string[]
}

export interface ChurnRiskPrediction {
  riskScore: number // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  indicators: ChurnIndicator[]
  preventionStrategies: string[]
  estimatedChurnDate?: Date
}

export interface ExpansionPrediction {
  potential: number // 0-100
  estimatedValue: number
  opportunities: ExpansionOpportunity[]
  readinessScore: number
  timeline: string
}

export interface CompetitivePrediction {
  winProbability: number
  competitors: CompetitorAnalysis[]
  strengthsVsCompetition: string[]
  weaknessesVsCompetition: string[]
  differentiators: string[]
  battleCards: BattleCard[]
}

interface PredictiveFactor {
  name: string
  impact: number // -1 to 1
  category: 'DEMOGRAPHIC' | 'BEHAVIORAL' | 'FIRMOGRAPHIC' | 'TECHNOGRAPHIC' | 'INTENT'
  description: string
}

interface SimilarDeal {
  dealId: string
  company: string
  value: number
  daysToClose: number
  similarity: number // 0-1
}

interface SalesStage {
  stage: string
  estimatedDuration: number
  completionProbability: number
  keyActivities: string[]
}

interface ChurnIndicator {
  indicator: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
  detectedDate: Date
  trend: 'IMPROVING' | 'STABLE' | 'WORSENING'
}

interface ExpansionOpportunity {
  type: 'UPSELL' | 'CROSS_SELL' | 'RENEWAL' | 'ADD_ONS'
  product: string
  estimatedValue: number
  readiness: number // 0-100
  triggers: string[]
}

interface CompetitorAnalysis {
  name: string
  threatLevel: number // 0-100
  presence: 'INCUMBENT' | 'EVALUATING' | 'CONSIDERED' | 'REJECTED'
  strengths: string[]
  weaknesses: string[]
  customerSentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'
}

interface BattleCard {
  competitor: string
  scenario: string
  ourPosition: string
  theirPosition: string
  winningStrategy: string
  proofPoints: string[]
}

interface AnalyticsInsight {
  type: 'OPPORTUNITY' | 'RISK' | 'TREND' | 'ANOMALY'
  title: string
  description: string
  impact: 'HIGH' | 'MEDIUM' | 'LOW'
  actionable: boolean
  suggestedAction?: string
}

interface ActionRecommendation {
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'
  action: string
  reason: string
  expectedOutcome: string
  effort: 'LOW' | 'MEDIUM' | 'HIGH'
  deadline?: Date
}

export class PredictiveAnalyticsEngine {
  private modelVersion = '2.0.0'
  private historicalData: Map<string, any> = new Map()

  /**
   * Generate comprehensive predictive analytics for a lead
   */
  async analyzeLead(lead: LeadProfile): Promise<PredictiveAnalyticsResult> {
    try {
      // Load historical data for similar leads
      await this.loadHistoricalData(lead)

      // Generate all predictions
      const conversionPrediction = await this.predictConversion(lead)
      const dealSizePrediction = await this.predictDealSize(lead)
      const timeToClosePrediction = await this.predictTimeToClose(lead)
      const churnRiskPrediction = await this.predictChurnRisk(lead)
      const expansionPrediction = await this.predictExpansion(lead)
      const competitivePrediction = await this.analyzeCompetitivePosition(lead)

      // Generate insights based on predictions
      const insights = this.generateInsights(lead, {
        conversionPrediction,
        dealSizePrediction,
        timeToClosePrediction,
        churnRiskPrediction,
        expansionPrediction,
        competitivePrediction
      })

      // Generate actionable recommendations
      const recommendations = this.generateRecommendations(lead, insights, conversionPrediction)

      // Calculate overall confidence
      const confidence = this.calculateOverallConfidence({
        conversionPrediction,
        dealSizePrediction,
        timeToClosePrediction
      })

      return {
        leadId: lead.id,
        predictions: {
          conversionProbability: conversionPrediction,
          dealSize: dealSizePrediction,
          timeToClose: timeToClosePrediction,
          churnRisk: churnRiskPrediction,
          expansionOpportunity: expansionPrediction,
          competitivePosition: competitivePrediction
        },
        insights,
        recommendations,
        confidence,
        modelVersion: this.modelVersion,
        generatedAt: new Date()
      }
    } catch (error) {
      console.error('Error in predictive analytics:', error)
      throw new Error('Failed to generate predictive analytics')
    }
  }

  /**
   * Predict conversion probability with ML model
   */
  private async predictConversion(lead: LeadProfile): Promise<ConversionPrediction> {
    const factors: PredictiveFactor[] = []
    let baseProbability = 0.3

    // Demographic factors
    if (lead.seniority === 'C_SUITE' || lead.seniority === 'EXECUTIVE') {
      factors.push({
        name: 'Executive-level contact',
        impact: 0.3,
        category: 'DEMOGRAPHIC',
        description: 'Decision-making authority increases conversion likelihood'
      })
      baseProbability += 0.15
    }

    // Behavioral factors
    const engagementScore = this.calculateEngagementScore(lead)
    if (engagementScore > 70) {
      factors.push({
        name: 'High engagement',
        impact: 0.4,
        category: 'BEHAVIORAL',
        description: 'Multiple touchpoints and content engagement'
      })
      baseProbability += 0.2
    }

    // Firmographic factors
    if (lead.currentCompany.size === 'ENTERPRISE' || lead.currentCompany.size === 'LARGE') {
      factors.push({
        name: 'Enterprise company',
        impact: 0.2,
        category: 'FIRMOGRAPHIC',
        description: 'Larger companies have higher conversion rates'
      })
      baseProbability += 0.1
    }

    // Technographic factors
    if (lead.technographics.some(tech => tech.category === 'CRM' && tech.satisfactionScore && tech.satisfactionScore < 50)) {
      factors.push({
        name: 'Low CRM satisfaction',
        impact: 0.5,
        category: 'TECHNOGRAPHIC',
        description: 'Dissatisfaction with current solution indicates switching intent'
      })
      baseProbability += 0.25
    }

    // Intent factors
    const highIntentSignals = lead.intentData.filter(intent => intent.score > 70)
    if (highIntentSignals.length > 0) {
      factors.push({
        name: 'Strong buying intent',
        impact: 0.6,
        category: 'INTENT',
        description: `${highIntentSignals.length} high-score intent signals detected`
      })
      baseProbability += 0.3
    }

    // Normalize probability
    const probability = Math.min(0.95, Math.max(0.05, baseProbability))

    // Determine stage
    const stage = this.determineLeadStage(probability, engagementScore)

    // Analyze trend
    const trend = this.analyzeConversionTrend(lead)

    // Identify risk factors
    const riskFactors = this.identifyRiskFactors(lead)

    return {
      probability,
      factors: factors.sort((a, b) => b.impact - a.impact),
      stage,
      trend,
      nextBestAction: this.determineNextBestAction(stage, factors),
      riskFactors
    }
  }

  /**
   * Predict deal size using similar deals and ML
   */
  private async predictDealSize(lead: LeadProfile): Promise<DealSizePrediction> {
    // Find similar deals based on firmographics
    const similarDeals = await this.findSimilarDeals(lead)
    
    // Base calculation
    const companySize = lead.currentCompany.size
    const baseValues = {
      'ENTERPRISE': 150000,
      'LARGE': 75000,
      'MEDIUM': 35000,
      'SMALL': 15000
    }
    
    let estimatedValue = baseValues[companySize] || 35000

    // Adjust based on industry
    const industryMultipliers: Record<string, number> = {
      'Technology': 1.3,
      'Finance': 1.5,
      'Healthcare': 1.4,
      'Manufacturing': 1.1,
      'Retail': 0.9
    }
    const industryMultiplier = industryMultipliers[lead.currentCompany.industry] || 1
    estimatedValue *= industryMultiplier

    // Adjust based on seniority
    const seniorityMultipliers = {
      'C_SUITE': 2.0,
      'EXECUTIVE': 1.7,
      'SENIOR': 1.3,
      'MID': 1.0,
      'ENTRY': 0.7
    }
    estimatedValue *= seniorityMultipliers[lead.seniority] || 1

    // Adjust based on engagement and intent
    const engagementMultiplier = 1 + (this.calculateEngagementScore(lead) / 100) * 0.5
    estimatedValue *= engagementMultiplier

    // Calculate range based on similar deals
    const dealValues = similarDeals.map(d => d.value).sort((a, b) => a - b)
    const range = {
      min: Math.round(estimatedValue * 0.6),
      max: Math.round(estimatedValue * 1.8),
      p25: dealValues[Math.floor(dealValues.length * 0.25)] || estimatedValue * 0.75,
      p50: dealValues[Math.floor(dealValues.length * 0.5)] || estimatedValue,
      p75: dealValues[Math.floor(dealValues.length * 0.75)] || estimatedValue * 1.25
    }

    // Identify value drivers
    const valueDrivers = []
    if (lead.currentCompany.employeeCount && lead.currentCompany.employeeCount > 1000) {
      valueDrivers.push('Large employee base')
    }
    if (lead.technographics.length > 5) {
      valueDrivers.push('Complex tech stack integration')
    }
    if (lead.seniority === 'C_SUITE') {
      valueDrivers.push('Enterprise-wide implementation')
    }
    if (lead.intentData.some(i => i.topic.includes('enterprise'))) {
      valueDrivers.push('Enterprise features required')
    }

    return {
      estimatedValue: Math.round(estimatedValue),
      range,
      currency: 'USD',
      confidence: similarDeals.length > 5 ? 0.85 : 0.65,
      similarDeals: similarDeals.slice(0, 5),
      valueDrivers
    }
  }

  /**
   * Predict time to close based on historical patterns
   */
  private async predictTimeToClose(lead: LeadProfile): Promise<TimeToClosePrediction> {
    // Base estimation by company size
    const baseDays = {
      'ENTERPRISE': 120,
      'LARGE': 90,
      'MEDIUM': 60,
      'SMALL': 30
    }
    
    let estimatedDays = baseDays[lead.currentCompany.size] || 60

    // Adjust based on engagement level
    const engagementScore = this.calculateEngagementScore(lead)
    if (engagementScore > 80) {
      estimatedDays *= 0.7 // 30% faster for highly engaged leads
    } else if (engagementScore < 30) {
      estimatedDays *= 1.5 // 50% slower for low engagement
    }

    // Adjust based on decision-making complexity
    if (lead.influenceNetwork.length > 5) {
      estimatedDays *= 1.3 // Complex buying committee
    }

    // Define critical path
    const criticalPath: SalesStage[] = [
      {
        stage: 'Initial Contact',
        estimatedDuration: Math.round(estimatedDays * 0.1),
        completionProbability: 0.95,
        keyActivities: ['First meeting', 'Needs assessment', 'Stakeholder identification']
      },
      {
        stage: 'Discovery',
        estimatedDuration: Math.round(estimatedDays * 0.2),
        completionProbability: 0.8,
        keyActivities: ['Deep dive demo', 'Technical evaluation', 'Business case development']
      },
      {
        stage: 'Proposal',
        estimatedDuration: Math.round(estimatedDays * 0.2),
        completionProbability: 0.7,
        keyActivities: ['Proposal submission', 'Pricing negotiation', 'Contract review']
      },
      {
        stage: 'Negotiation',
        estimatedDuration: Math.round(estimatedDays * 0.3),
        completionProbability: 0.6,
        keyActivities: ['Terms negotiation', 'Legal review', 'Final approvals']
      },
      {
        stage: 'Closing',
        estimatedDuration: Math.round(estimatedDays * 0.2),
        completionProbability: 0.9,
        keyActivities: ['Contract signing', 'Implementation planning', 'Kickoff']
      }
    ]

    // Identify accelerators and blockers
    const accelerators = []
    const blockers = []

    if (lead.buyingRole === 'CHAMPION') {
      accelerators.push('Internal champion identified')
    }
    if (lead.competitorUsage.some(c => c.satisfactionLevel === 'LOW')) {
      accelerators.push('Dissatisfaction with current solution')
    }
    if (lead.personalityProfile?.decisionMakingStyle === 'FAST') {
      accelerators.push('Fast decision-making style')
    }

    if (lead.competitorUsage.some(c => c.contractEndDate && c.contractEndDate > new Date(Date.now() + 180 * 24 * 60 * 60 * 1000))) {
      blockers.push('Long-term competitor contract')
    }
    if (!lead.phoneNumbers.length) {
      blockers.push('Limited contact information')
    }
    if (lead.objections.length > 3) {
      blockers.push('Multiple objections to address')
    }

    return {
      estimatedDays: Math.round(estimatedDays),
      range: {
        optimistic: Math.round(estimatedDays * 0.7),
        realistic: Math.round(estimatedDays),
        pessimistic: Math.round(estimatedDays * 1.5)
      },
      criticalPath,
      accelerators,
      blockers
    }
  }

  /**
   * Predict churn risk for existing customers
   */
  private async predictChurnRisk(lead: LeadProfile): Promise<ChurnRiskPrediction> {
    const indicators: ChurnIndicator[] = []
    let riskScore = 0

    // Check engagement decline
    const recentEngagement = lead.websiteActivity.filter(a => 
      a.visitDate > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length
    
    if (recentEngagement === 0) {
      indicators.push({
        indicator: 'No recent engagement',
        severity: 'HIGH',
        detectedDate: new Date(),
        trend: 'WORSENING'
      })
      riskScore += 30
    }

    // Check support tickets (would be from integration)
    // For now, simulate based on other factors
    if (lead.contentEngagement.filter(e => e.title.includes('troubleshooting')).length > 2) {
      indicators.push({
        indicator: 'Multiple support inquiries',
        severity: 'MEDIUM',
        detectedDate: new Date(),
        trend: 'STABLE'
      })
      riskScore += 20
    }

    // Check competitor engagement
    if (lead.websiteActivity.some(a => a.url.includes('alternatives') || a.url.includes('vs'))) {
      indicators.push({
        indicator: 'Researching alternatives',
        severity: 'HIGH',
        detectedDate: new Date(),
        trend: 'WORSENING'
      })
      riskScore += 35
    }

    // Determine risk level
    const riskLevel = riskScore >= 70 ? 'CRITICAL' :
                     riskScore >= 50 ? 'HIGH' :
                     riskScore >= 30 ? 'MEDIUM' : 'LOW'

    // Generate prevention strategies
    const preventionStrategies = []
    if (riskLevel === 'HIGH' || riskLevel === 'CRITICAL') {
      preventionStrategies.push('Schedule executive business review')
      preventionStrategies.push('Offer success manager consultation')
      preventionStrategies.push('Provide additional training resources')
    }
    if (indicators.some(i => i.indicator.includes('support'))) {
      preventionStrategies.push('Prioritize support ticket resolution')
      preventionStrategies.push('Assign dedicated technical resource')
    }

    return {
      riskScore,
      riskLevel,
      indicators,
      preventionStrategies,
      estimatedChurnDate: riskLevel === 'CRITICAL' ? 
        new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) : undefined
    }
  }

  /**
   * Predict expansion opportunities
   */
  private async predictExpansion(lead: LeadProfile): Promise<ExpansionPrediction> {
    const opportunities: ExpansionOpportunity[] = []
    let potential = 50 // Base potential

    // Check for growth signals
    if (lead.companyGrowthStage === 'GROWTH' || lead.companyGrowthStage === 'STARTUP') {
      potential += 20
      opportunities.push({
        type: 'UPSELL',
        product: 'Enterprise Plan',
        estimatedValue: 50000,
        readiness: 70,
        triggers: ['Company growth', 'Increased usage']
      })
    }

    // Check for department expansion
    if (lead.department === 'Sales' && !lead.technographics.some(t => t.category === 'Marketing Automation')) {
      opportunities.push({
        type: 'CROSS_SELL',
        product: 'Marketing Module',
        estimatedValue: 25000,
        readiness: 60,
        triggers: ['Sales-Marketing alignment need', 'Lead generation requirements']
      })
    }

    // Check for feature usage patterns
    if (lead.websiteActivity.some(a => a.url.includes('api') || a.url.includes('integration'))) {
      opportunities.push({
        type: 'ADD_ONS',
        product: 'API Premium Access',
        estimatedValue: 15000,
        readiness: 80,
        triggers: ['Technical integration interest', 'API documentation views']
      })
    }

    // Calculate total estimated value
    const estimatedValue = opportunities.reduce((sum, opp) => sum + opp.estimatedValue, 0)

    // Determine readiness
    const readinessScore = opportunities.length > 0 ? 
      opportunities.reduce((sum, opp) => sum + opp.readiness, 0) / opportunities.length : 0

    return {
      potential: Math.min(100, potential),
      estimatedValue,
      opportunities,
      readinessScore,
      timeline: readinessScore > 70 ? '1-3 months' : '3-6 months'
    }
  }

  /**
   * Analyze competitive position
   */
  private async analyzeCompetitivePosition(lead: LeadProfile): Promise<CompetitivePrediction> {
    const competitors: CompetitorAnalysis[] = []
    let winProbability = 0.5 // Base probability

    // Analyze known competitors
    for (const comp of lead.competitorUsage) {
      const analysis: CompetitorAnalysis = {
        name: comp.competitorName,
        threatLevel: this.calculateThreatLevel(comp),
        presence: comp.contractEndDate ? 'INCUMBENT' : 'EVALUATING',
        strengths: this.getCompetitorStrengths(comp.competitorName),
        weaknesses: this.getCompetitorWeaknesses(comp.competitorName),
        customerSentiment: comp.satisfactionLevel === 'HIGH' ? 'POSITIVE' :
                          comp.satisfactionLevel === 'LOW' ? 'NEGATIVE' : 'NEUTRAL'
      }
      competitors.push(analysis)

      // Adjust win probability based on sentiment
      if (analysis.customerSentiment === 'NEGATIVE') {
        winProbability += 0.15
      } else if (analysis.customerSentiment === 'POSITIVE') {
        winProbability -= 0.1
      }
    }

    // Our strengths vs competition
    const strengthsVsCompetition = [
      'AI-powered intelligence at 1/3 the price',
      'Unified platform vs point solutions',
      'No user limits on premium features',
      'Modern architecture with faster performance'
    ]

    const weaknessesVsCompetition = [
      'Newer brand vs established players',
      'Smaller ecosystem of integrations',
      'Less industry-specific features'
    ]

    const differentiators = [
      'Decision Maker Intelligence included',
      'Built-in predictive analytics',
      'Natural language automation',
      'Transparent, module-based pricing'
    ]

    // Generate battle cards for top competitors
    const battleCards = competitors.slice(0, 3).map(comp => this.generateBattleCard(comp))

    return {
      winProbability: Math.min(0.9, Math.max(0.1, winProbability)),
      competitors,
      strengthsVsCompetition,
      weaknessesVsCompetition,
      differentiators,
      battleCards
    }
  }

  // Helper methods
  private async loadHistoricalData(lead: LeadProfile): Promise<void> {
    // In production, this would load from database
    // For now, we'll use simulated data
    console.log('Loading historical data for:', lead.currentCompany.industry, lead.currentCompany.size)
  }

  private calculateEngagementScore(lead: LeadProfile): number {
    let score = 0
    
    // Website activity (up to 30 points)
    score += Math.min(30, lead.websiteActivity.length * 5)
    
    // Content engagement (up to 40 points)
    score += Math.min(40, lead.contentEngagement.length * 10)
    
    // Intent signals (up to 30 points)
    const highIntentSignals = lead.intentData.filter(i => i.score > 70).length
    score += Math.min(30, highIntentSignals * 15)
    
    return score
  }

  private determineLeadStage(probability: number, engagementScore: number): 'COLD' | 'WARM' | 'HOT' | 'READY' {
    if (probability > 0.8 && engagementScore > 80) return 'READY'
    if (probability > 0.6 || engagementScore > 60) return 'HOT'
    if (probability > 0.4 || engagementScore > 40) return 'WARM'
    return 'COLD'
  }

  private analyzeConversionTrend(lead: LeadProfile): 'INCREASING' | 'STABLE' | 'DECREASING' {
    // Analyze recent activity patterns
    const recentActivity = lead.websiteActivity.filter(a => 
      a.visitDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length
    
    const olderActivity = lead.websiteActivity.filter(a => 
      a.visitDate > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) &&
      a.visitDate <= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length
    
    if (recentActivity > olderActivity * 1.5) return 'INCREASING'
    if (recentActivity < olderActivity * 0.5) return 'DECREASING'
    return 'STABLE'
  }

  private identifyRiskFactors(lead: LeadProfile): string[] {
    const risks = []
    
    if (lead.competitorUsage.some(c => c.satisfactionLevel === 'HIGH')) {
      risks.push('Happy with current solution')
    }
    
    if (!lead.phoneNumbers.length) {
      risks.push('Limited contact information')
    }
    
    if (lead.buyingRole === 'BLOCKER') {
      risks.push('Potential blocker identified')
    }
    
    if (lead.objections.length > 3) {
      risks.push(`${lead.objections.length} objections to overcome`)
    }
    
    return risks
  }

  private determineNextBestAction(stage: string, factors: PredictiveFactor[]): string {
    const actions: Record<string, string> = {
      'READY': 'Schedule demo with decision maker',
      'HOT': 'Send personalized proposal',
      'WARM': 'Share relevant case study',
      'COLD': 'Add to nurture campaign'
    }
    
    // Override based on specific factors
    if (factors.some(f => f.name === 'Strong buying intent' && f.impact > 0.5)) {
      return 'Immediate phone outreach'
    }
    
    return actions[stage] || 'Continue monitoring'
  }

  private async findSimilarDeals(lead: LeadProfile): Promise<SimilarDeal[]> {
    // In production, this would query historical deals
    // For now, return simulated similar deals
    const mockDeals: SimilarDeal[] = [
      {
        dealId: 'deal-001',
        company: 'Similar Tech Corp',
        value: 45000,
        daysToClose: 75,
        similarity: 0.85
      },
      {
        dealId: 'deal-002',
        company: 'Industry Leader Inc',
        value: 38000,
        daysToClose: 60,
        similarity: 0.78
      }
    ]
    
    return mockDeals
  }

  private calculateThreatLevel(competitor: any): number {
    let threat = 50
    
    if (competitor.satisfactionLevel === 'HIGH') threat += 30
    if (competitor.contractEndDate && competitor.contractEndDate > new Date()) threat += 20
    if (competitor.switchingLikelihood && competitor.switchingLikelihood < 0.3) threat += 20
    
    return Math.min(100, threat)
  }

  private getCompetitorStrengths(name: string): string[] {
    const competitorProfiles: Record<string, string[]> = {
      'Salesforce': ['Market leader', 'Extensive ecosystem', 'Enterprise features'],
      'HubSpot': ['User-friendly', 'Marketing integration', 'Free tier'],
      'Pipedrive': ['Sales-focused', 'Visual pipeline', 'Affordable']
    }
    
    return competitorProfiles[name] || ['Established player', 'Existing relationship']
  }

  private getCompetitorWeaknesses(name: string): string[] {
    const competitorWeaknesses: Record<string, string[]> = {
      'Salesforce': ['Complex setup', 'Expensive', 'Steep learning curve'],
      'HubSpot': ['Limited customization', 'Gets expensive at scale', 'Sales features basic'],
      'Pipedrive': ['Limited marketing features', 'Basic reporting', 'No AI features']
    }
    
    return competitorWeaknesses[name] || ['Higher cost', 'Legacy technology']
  }

  private generateBattleCard(competitor: CompetitorAnalysis): BattleCard {
    const scenarios: Record<string, BattleCard> = {
      'Salesforce': {
        competitor: 'Salesforce',
        scenario: 'Price objection',
        ourPosition: 'Enterprise features at 1/3 the cost with AI included',
        theirPosition: 'Premium pricing for market leader status',
        winningStrategy: 'Focus on ROI and included AI features that would cost extra with Salesforce',
        proofPoints: ['Save $50k+ annually', 'No per-user fees for AI', 'Faster implementation']
      },
      'HubSpot': {
        competitor: 'HubSpot',
        scenario: 'Feature comparison',
        ourPosition: 'AI-first CRM with predictive analytics built-in',
        theirPosition: 'All-in-one platform with basic CRM features',
        winningStrategy: 'Emphasize advanced AI capabilities and sales intelligence',
        proofPoints: ['Decision maker tracking included', 'Predictive deal scoring', 'Advanced automation']
      }
    }
    
    return scenarios[competitor.name] || {
      competitor: competitor.name,
      scenario: 'General comparison',
      ourPosition: 'Modern AI-powered alternative',
      theirPosition: 'Traditional CRM approach',
      winningStrategy: 'Focus on innovation and value',
      proofPoints: ['Better price-performance', 'Modern architecture', 'AI-first design']
    }
  }

  private generateInsights(lead: LeadProfile, predictions: any): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = []
    
    // Conversion insights
    if (predictions.conversionPrediction.probability > 0.7) {
      insights.push({
        type: 'OPPORTUNITY',
        title: 'High conversion probability detected',
        description: `${Math.round(predictions.conversionPrediction.probability * 100)}% chance of conversion based on engagement patterns`,
        impact: 'HIGH',
        actionable: true,
        suggestedAction: 'Prioritize for immediate outreach'
      })
    }
    
    // Deal size insights
    if (predictions.dealSizePrediction.estimatedValue > 100000) {
      insights.push({
        type: 'OPPORTUNITY',
        title: 'Enterprise deal potential',
        description: `Estimated deal size of $${predictions.dealSizePrediction.estimatedValue.toLocaleString()}`,
        impact: 'HIGH',
        actionable: true,
        suggestedAction: 'Assign senior sales representative'
      })
    }
    
    // Risk insights
    if (predictions.conversionPrediction.riskFactors.length > 2) {
      insights.push({
        type: 'RISK',
        title: 'Multiple risk factors identified',
        description: `${predictions.conversionPrediction.riskFactors.length} factors may impact conversion`,
        impact: 'MEDIUM',
        actionable: true,
        suggestedAction: 'Develop risk mitigation strategy'
      })
    }
    
    // Competitive insights
    if (predictions.competitivePrediction.winProbability < 0.4) {
      insights.push({
        type: 'RISK',
        title: 'Strong competitive presence',
        description: 'Incumbent competitor with high satisfaction detected',
        impact: 'HIGH',
        actionable: true,
        suggestedAction: 'Deploy competitive displacement strategy'
      })
    }
    
    // Timing insights
    if (predictions.timeToClosePrediction.accelerators.length > 2) {
      insights.push({
        type: 'OPPORTUNITY',
        title: 'Fast-track opportunity',
        description: `${predictions.timeToClosePrediction.accelerators.length} factors could accelerate deal closure`,
        impact: 'MEDIUM',
        actionable: true,
        suggestedAction: 'Leverage accelerators in sales approach'
      })
    }
    
    return insights
  }

  private generateRecommendations(lead: LeadProfile, insights: AnalyticsInsight[], conversion: ConversionPrediction): ActionRecommendation[] {
    const recommendations: ActionRecommendation[] = []
    
    // High priority recommendations
    if (conversion.probability > 0.7 && conversion.stage === 'READY') {
      recommendations.push({
        priority: 'URGENT',
        action: 'Schedule executive demo within 24 hours',
        reason: 'Lead shows high buying intent and decision readiness',
        expectedOutcome: 'Move to proposal stage within 1 week',
        effort: 'LOW',
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000)
      })
    }
    
    // Medium priority recommendations
    if (lead.competitorUsage.some(c => c.satisfactionLevel === 'LOW')) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Send competitive comparison guide',
        reason: 'Dissatisfaction with current solution detected',
        expectedOutcome: 'Position as superior alternative',
        effort: 'LOW'
      })
    }
    
    if (insights.some(i => i.type === 'RISK')) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Develop risk mitigation plan',
        reason: 'Multiple risk factors could impact conversion',
        expectedOutcome: 'Increase win probability by 20%',
        effort: 'MEDIUM'
      })
    }
    
    // Low priority recommendations
    if (!lead.phoneNumbers.length) {
      recommendations.push({
        priority: 'LOW',
        action: 'Research and acquire phone number',
        reason: 'Multiple contact channels improve response rates',
        expectedOutcome: 'Enable multi-channel outreach',
        effort: 'LOW'
      })
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { 'URGENT': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  }

  private calculateOverallConfidence(predictions: any): number {
    // Weight different prediction confidences
    const conversionWeight = 0.4
    const dealSizeWeight = 0.3
    const timeWeight = 0.3
    
    const conversionConfidence = predictions.conversionPrediction.factors.length > 3 ? 0.85 : 0.65
    const dealSizeConfidence = predictions.dealSizePrediction.confidence
    const timeConfidence = predictions.timeToClosePrediction.criticalPath.length === 5 ? 0.8 : 0.6
    
    return (
      conversionConfidence * conversionWeight +
      dealSizeConfidence * dealSizeWeight +
      timeConfidence * timeWeight
    )
  }
}

export default PredictiveAnalyticsEngine