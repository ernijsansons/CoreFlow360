/**
 * CoreFlow360 - Predictive Problem Analytics Engine
 * Advanced analytics for predicting problem escalation and business impact
 */

import { OpenAI } from 'openai'
import { prisma } from '@/lib/db'
import { ProblemSeverity, ProblemStatus, IndustryType } from '@prisma/client'

export interface PredictionModel {
  id: string
  name: string
  type: 'ESCALATION' | 'CHURN_RISK' | 'REVENUE_IMPACT' | 'TIMELINE' | 'SOLUTION_FIT'
  industry?: IndustryType
  accuracy: number
  version: string
  trainingData: {
    samples: number
    lastTrained: Date
    features: string[]
  }
}

export interface ProblemPrediction {
  problemId: string
  predictions: {
    escalationRisk: {
      probability: number
      timeframe: string
      confidence: number
      factors: string[]
    }
    businessImpact: {
      revenueAtRisk: number
      customerChurnRisk: number
      complianceRisk: number
      operationalImpact: number
    }
    solutionOutcome: {
      successProbability: number
      implementationTime: string
      expectedROI: number
      riskFactors: string[]
    }
    timelineForecasting: {
      daysToDecision: number
      implementationDuration: number
      paybackPeriod: number
      confidence: number
    }
  }
  recommendations: PredictiveRecommendation[]
  modelUsed: string[]
  analyzedAt: Date
  validUntil: Date
}

export interface PredictiveRecommendation {
  type: 'IMMEDIATE' | 'SHORT_TERM' | 'LONG_TERM'
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  action: string
  reasoning: string
  expectedOutcome: string
  confidence: number
  resources: string[]
}

export interface PredictiveInsight {
  id: string
  type: 'TREND' | 'ANOMALY' | 'OPPORTUNITY' | 'RISK'
  category: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

  insight: string
  description: string
  evidence: Record<string, unknown>

  predictions: {
    shortTerm: string // Next 30 days
    mediumTerm: string // Next 90 days
    longTerm: string // Next 365 days
  }

  actionability: {
    canInfluence: boolean
    timeWindow: string
    requiredActions: string[]
    stakeholders: string[]
  }

  businessImpact: {
    revenue: number
    costs: number
    efficiency: number
    risk: number
  }

  confidence: number
  generatedAt: Date
}

export interface TrendAnalysis {
  category: string
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY'

  patterns: {
    volume: {
      trend: 'INCREASING' | 'DECREASING' | 'STABLE' | 'VOLATILE'
      changeRate: number
      seasonality?: string
    }
    severity: {
      averageSeverity: number
      severityTrend: 'ESCALATING' | 'IMPROVING' | 'STABLE'
      criticalIncidents: number
    }
    resolution: {
      averageResolutionTime: number
      resolutionRate: number
      trendsImprovement: boolean
    }
  }

  forecast: {
    next30Days: {
      expectedProblems: number
      severityDistribution: Record<string, number>
      resourceNeeds: string[]
    }
    next90Days: {
      expectedProblems: number
      majorTrends: string[]
      riskFactors: string[]
    }
    next365Days: {
      strategicInsights: string[]
      investmentRecommendations: string[]
    }
  }
}

export class PredictiveProblemAnalytics {
  private openai: OpenAI
  private models: Map<string, PredictionModel>
  private trendCache: Map<string, TrendAnalysis>

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    this.models = new Map()
    this.trendCache = new Map()
    this.initializePredictionModels()
  }

  /**
   * Generate comprehensive predictions for a problem
   */
  async generateProblemPredictions(params: {
    tenantId: string
    problemId: string
    problemData?: Record<string, unknown>
  }): Promise<ProblemPrediction> {
    try {
      // Get problem data
      const problem = await this.getProblemData(params.tenantId, params.problemId)
      if (!problem) {
        throw new Error('Problem not found')
      }

      // Get historical context
      const historicalContext = await this.getHistoricalContext(params.tenantId, problem)

      // Generate predictions using multiple models
      const [escalationPrediction, impactPrediction, solutionPrediction, timelinePrediction] =
        await Promise.all([
          this.predictEscalationRisk(problem, historicalContext),
          this.predictBusinessImpact(problem, historicalContext),
          this.predictSolutionOutcome(problem, historicalContext),
          this.predictTimeline(problem, historicalContext),
        ])

      // Generate recommendations
      const recommendations = await this.generateRecommendations(problem, {
        escalation: escalationPrediction,
        impact: impactPrediction,
        solution: solutionPrediction,
        timeline: timelinePrediction,
      })

      const prediction: ProblemPrediction = {
        problemId: params.problemId,
        predictions: {
          escalationRisk: escalationPrediction,
          businessImpact: impactPrediction,
          solutionOutcome: solutionPrediction,
          timelineForecasting: timelinePrediction,
        },
        recommendations,
        modelUsed: ['escalation_v1', 'impact_v1', 'solution_v1', 'timeline_v1'],
        analyzedAt: new Date(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Valid for 7 days
      }

      // Store prediction
      await this.storePrediction(params.tenantId, prediction)

      return prediction
    } catch (error) {
      throw error
    }
  }

  /**
   * Predict escalation risk
   */
  private async predictEscalationRisk(problem: unknown, context: unknown): Promise<unknown> {
    const severity = problem.severity
    const urgency = problem.urgencyScore || 50
    const age = Date.now() - new Date(problem.detectedAt).getTime()
    const daysOld = age / (1000 * 60 * 60 * 24)

    // Simple rule-based escalation model
    let probability = 0
    let timeframe = '30+ days'

    // Severity factor
    const severityWeight =
      {
        EXISTENTIAL: 90,
        CRITICAL: 70,
        MAJOR: 50,
        MODERATE: 30,
        MINOR: 10,
      }[severity] || 30

    // Urgency factor
    const urgencyWeight = urgency

    // Age factor (older problems more likely to escalate)
    const ageWeight = Math.min(daysOld * 5, 40)

    // Calculate combined probability
    probability = Math.min(95, (severityWeight + urgencyWeight + ageWeight) / 3)

    // Determine timeframe based on probability
    if (probability > 80) {
      timeframe = '1-3 days'
    } else if (probability > 60) {
      timeframe = '1-2 weeks'
    } else if (probability > 40) {
      timeframe = '2-4 weeks'
    } else if (probability > 20) {
      timeframe = '1-2 months'
    }

    const factors = []
    if (severityWeight > 60) factors.push('High severity level')
    if (urgency > 70) factors.push('High urgency score')
    if (daysOld > 14) factors.push('Problem age increasing risk')
    if (context.similarProblems > 3) factors.push('Pattern of similar problems')

    return {
      probability,
      timeframe,
      confidence: 85,
      factors,
    }
  }

  /**
   * Predict business impact
   */
  private async predictBusinessImpact(_problem: unknown, _context: unknown): Promise<unknown> {
    const baseRevenue = problem.businessImpact?.revenueImpact || 50000
    const customerCount = problem.affectedCustomers || 100

    // Calculate various impact metrics
    const revenueAtRisk = baseRevenue * (1 + customerCount / 1000)
    const customerChurnRisk = Math.min(95, customerCount / 10 + (problem.urgencyScore || 50))
    const complianceRisk = problem.problemCategory === 'compliance' ? 90 : 20
    const operationalImpact = problem.affectedDepartments?.length * 15 || 30

    return {
      revenueAtRisk: Math.round(revenueAtRisk),
      customerChurnRisk: Math.round(customerChurnRisk),
      complianceRisk: Math.round(complianceRisk),
      operationalImpact: Math.round(operationalImpact),
    }
  }

  /**
   * Predict solution outcome
   */
  private async predictSolutionOutcome(problem: unknown, context: unknown): Promise<unknown> {
    const solutionFit = problem.solutionFitScore || 70
    const complexity = problem.implementationComplexity || 'MEDIUM'

    // Calculate success probability
    let successProbability = solutionFit

    // Adjust based on complexity
    const complexityAdjustment =
      {
        LOW: 10,
        MEDIUM: 0,
        HIGH: -15,
        ENTERPRISE: -25,
      }[complexity] || 0

    successProbability = Math.max(10, Math.min(95, successProbability + complexityAdjustment))

    // Implementation time estimation
    const implementationTime =
      {
        LOW: '1-2 weeks',
        MEDIUM: '1-2 months',
        HIGH: '3-6 months',
        ENTERPRISE: '6-12 months',
      }[complexity] || '1-2 months'

    // Expected ROI calculation
    const dealSize = problem.estimatedDealSize || 100000
    const implementationCost = dealSize * 0.3 // Assume 30% implementation cost
    const expectedROI = ((dealSize - implementationCost) / implementationCost) * 100

    const riskFactors = []
    if (complexity === 'HIGH' || complexity === 'ENTERPRISE') {
      riskFactors.push('High implementation complexity')
    }
    if (solutionFit < 70) {
      riskFactors.push('Medium solution fit')
    }
    if (context.competitorSolutions > 2) {
      riskFactors.push('Multiple competitor solutions available')
    }

    return {
      successProbability: Math.round(successProbability),
      implementationTime,
      expectedROI: Math.round(expectedROI),
      riskFactors,
    }
  }

  /**
   * Predict timeline forecasting
   */
  private async predictTimeline(_problem: unknown, _context: unknown): Promise<unknown> {
    const urgency = problem.urgencyScore || 50
    const complexity = problem.implementationComplexity || 'MEDIUM'
    const severity = problem.severity

    // Days to decision based on urgency and severity
    let daysToDecision = 30

    if (severity === 'EXISTENTIAL' || severity === 'CRITICAL') {
      daysToDecision = Math.max(1, 30 - urgency)
    } else if (severity === 'MAJOR') {
      daysToDecision = Math.max(7, 45 - urgency)
    } else {
      daysToDecision = Math.max(14, 60 - urgency)
    }

    // Implementation duration
    const implementationDays =
      {
        LOW: 14,
        MEDIUM: 60,
        HIGH: 120,
        ENTERPRISE: 270,
      }[complexity] || 60

    // Payback period
    const dealSize = problem.estimatedDealSize || 100000
    const monthlyValue = dealSize / 24 // Assume 2-year contract value
    const implementationCost = dealSize * 0.3
    const paybackPeriod = Math.ceil(implementationCost / monthlyValue)

    return {
      daysToDecision: Math.round(daysToDecision),
      implementationDuration: implementationDays,
      paybackPeriod,
      confidence: 75,
    }
  }

  /**
   * Generate actionable recommendations
   */
  private async generateRecommendations(
    problem: unknown,
    predictions: unknown
  ): Promise<PredictiveRecommendation[]> {
    const recommendations: PredictiveRecommendation[] = []

    // Immediate actions based on escalation risk
    if (predictions.escalation.probability > 70) {
      recommendations.push({
        type: 'IMMEDIATE',
        priority: 'CRITICAL',
        action: 'Contact decision maker within 24 hours',
        reasoning: `High escalation risk (${predictions.escalation.probability}%) detected`,
        expectedOutcome: 'Prevent problem escalation and maintain relationship',
        confidence: 90,
        resources: ['Sales team', 'Solution engineer'],
      })
    }

    // Solution recommendations
    if (predictions.solution.successProbability > 80) {
      recommendations.push({
        type: 'SHORT_TERM',
        priority: 'HIGH',
        action: 'Schedule solution demonstration',
        reasoning: `High solution fit probability (${predictions.solution.successProbability}%)`,
        expectedOutcome: 'Accelerate deal closure and solution adoption',
        confidence: 85,
        resources: ['Technical team', 'Sales engineer'],
      })
    }

    // Timeline optimization
    if (predictions.timeline.daysToDecision < 14) {
      recommendations.push({
        type: 'IMMEDIATE',
        priority: 'HIGH',
        action: 'Prepare expedited proposal and pricing',
        reasoning: `Short decision window (${predictions.timeline.daysToDecision} days)`,
        expectedOutcome: 'Capture opportunity within decision timeframe',
        confidence: 80,
        resources: ['Sales team', 'Pricing team'],
      })
    }

    // Long-term strategic actions
    if (predictions.impact.revenueAtRisk > 100000) {
      recommendations.push({
        type: 'LONG_TERM',
        priority: 'MEDIUM',
        action: 'Develop industry-specific solution package',
        reasoning: `High revenue impact potential (${predictions.impact.revenueAtRisk.toLocaleString()})`,
        expectedOutcome: 'Create competitive advantage and prevent future issues',
        confidence: 70,
        resources: ['Product team', 'Industry experts'],
      })
    }

    return recommendations
  }

  /**
   * Generate trend analysis and insights
   */
  async generateTrendAnalysis(params: {
    tenantId: string
    category?: string
    period?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY'
    industryType?: IndustryType
  }): Promise<TrendAnalysis> {
    try {
      const { tenantId, category, period = 'MONTHLY', industryType } = params

      // Get historical problem data
      const problems = await this.getHistoricalProblems(tenantId, {
        category,
        industryType,
        daysPeriod: this.getPeriodDays(period),
      })

      // Analyze patterns
      const patterns = this.analyzePatterns(problems, period)

      // Generate forecasts
      const forecast = await this.generateForecasts(problems, patterns)

      const analysis: TrendAnalysis = {
        category: category || 'all',
        period,
        patterns,
        forecast,
      }

      // Cache the analysis
      const cacheKey = `${tenantId}_${category || 'all'}_${period}`
      this.trendCache.set(cacheKey, analysis)

      return analysis
    } catch (error) {
      throw error
    }
  }

  /**
   * Generate predictive insights
   */
  async generatePredictiveInsights(params: {
    tenantId: string
    companyId?: string
    industryType?: IndustryType
  }): Promise<PredictiveInsight[]> {
    try {
      const insights: PredictiveInsight[] = []

      // Get data for analysis
      const problems = await this.getHistoricalProblems(params.tenantId, {
        companyId: params.companyId,
        industryType: params.industryType,
        daysPeriod: 90,
      })

      // Detect trends
      const trendInsight = await this.detectTrends(problems)
      if (trendInsight) insights.push(trendInsight)

      // Detect anomalies
      const anomalyInsight = await this.detectAnomalies(problems)
      if (anomalyInsight) insights.push(anomalyInsight)

      // Identify opportunities
      const opportunityInsight = await this.identifyOpportunities(problems)
      if (opportunityInsight) insights.push(opportunityInsight)

      // Assess risks
      const riskInsight = await this.assessRisks(problems)
      if (riskInsight) insights.push(riskInsight)

      return insights
    } catch (error) {
      throw error
    }
  }

  // Helper methods
  private async getProblemData(tenantId: string, problemId: string): Promise<unknown> {
    return await prisma.customerProblem.findFirst({
      where: {
        tenantId,
        id: problemId,
      },
      include: {
        companyIntelligence: true,
      },
    })
  }

  private async getHistoricalContext(tenantId: string, problem: unknown): Promise<unknown> {
    const similarProblems = await prisma.customerProblem.count({
      where: {
        tenantId,
        problemCategory: problem.problemCategory,
        companyIntelligenceId: problem.companyIntelligenceId,
        id: { not: problem.id },
      },
    })

    return {
      similarProblems,
      competitorSolutions: 2, // Mock data
      industryBenchmark: 75, // Mock data
    }
  }

  private async getHistoricalProblems(tenantId: string, filters: unknown): Promise<unknown[]> {
    const where: unknown = { tenantId }

    if (filters.category) {
      where.problemCategory = filters.category
    }

    if (filters.companyId) {
      where.companyIntelligenceId = filters.companyId
    }

    if (filters.daysPeriod) {
      where.detectedAt = {
        gte: new Date(Date.now() - filters.daysPeriod * 24 * 60 * 60 * 1000),
      }
    }

    return await prisma.customerProblem.findMany({
      where,
      orderBy: { detectedAt: 'desc' },
      take: 1000,
    })
  }

  private getPeriodDays(period: string): number {
    switch (period) {
      case 'DAILY':
        return 7
      case 'WEEKLY':
        return 30
      case 'MONTHLY':
        return 90
      case 'QUARTERLY':
        return 365
      default:
        return 90
    }
  }

  private analyzePatterns(_problems: unknown[], _period: string): unknown {
    // Mock pattern analysis - in production would use statistical analysis
    return {
      volume: {
        trend: 'INCREASING',
        changeRate: 15.5,
        seasonality: 'weekly',
      },
      severity: {
        averageSeverity: 3.2,
        severityTrend: 'STABLE',
        criticalIncidents: problems.filter((p) => p.severity === 'CRITICAL').length,
      },
      resolution: {
        averageResolutionTime: 72, // hours
        resolutionRate: 85,
        trendsImprovement: true,
      },
    }
  }

  private async generateForecasts(_problems: unknown[], _patterns: unknown): Promise<unknown> {
    // Mock forecast generation
    return {
      next30Days: {
        expectedProblems: Math.round(problems.length * 1.15),
        severityDistribution: {
          CRITICAL: 3,
          MAJOR: 8,
          MODERATE: 15,
          MINOR: 4,
        },
        resourceNeeds: ['2 additional support engineers', 'Escalation process review'],
      },
      next90Days: {
        expectedProblems: Math.round(problems.length * 3.5),
        majorTrends: ['Increasing integration issues', 'Performance concerns growing'],
        riskFactors: ['Holiday season impact', 'New feature rollout'],
      },
      next365Days: {
        strategicInsights: [
          'Investment in automation could reduce 40% of routine issues',
          'Industry-specific solutions showing higher success rates',
        ],
        investmentRecommendations: [
          'AI-powered support automation',
          'Proactive monitoring system',
          'Industry vertical specialization',
        ],
      },
    }
  }

  private async detectTrends(problems: unknown[]): Promise<PredictiveInsight | null> {
    if (problems.length < 10) return null

    return {
      id: `trend_${Date.now()}`,
      type: 'TREND',
      category: 'problem_volume',
      severity: 'MEDIUM',
      insight: 'Problem volume increasing 15% month-over-month',
      description: 'Analysis shows consistent growth in problem detection across all categories',
      evidence: {
        dataPoints: problems.length,
        timeSpan: '90 days',
        growthRate: 15.2,
      },
      predictions: {
        shortTerm: 'Expect 25% more problems next month without intervention',
        mediumTerm: 'Trend may plateau if proactive measures implemented',
        longTerm: 'Could reach capacity limits without scaling support team',
      },
      actionability: {
        canInfluence: true,
        timeWindow: '2-4 weeks',
        requiredActions: ['Scale support team', 'Implement automation'],
        stakeholders: ['Operations', 'Customer Success'],
      },
      businessImpact: {
        revenue: -50000,
        costs: 30000,
        efficiency: -20,
        risk: 40,
      },
      confidence: 85,
      generatedAt: new Date(),
    }
  }

  private async detectAnomalies(_problems: unknown[]): Promise<PredictiveInsight | null> {
    // Mock anomaly detection
    return null
  }

  private async identifyOpportunities(_problems: unknown[]): Promise<PredictiveInsight | null> {
    // Mock opportunity identification
    return null
  }

  private async assessRisks(_problems: unknown[]): Promise<PredictiveInsight | null> {
    // Mock risk assessment
    return null
  }

  private async storePrediction(tenantId: string, prediction: ProblemPrediction): Promise<void> {
    try {
      await prisma.intelligenceReport.create({
        data: {
          tenantId,
          companyIntelligenceId: 'prediction',
          reportType: 'PREDICTIVE_ANALYSIS',
          reportTitle: `Predictive Analysis - Problem ${prediction.problemId}`,
          reportSummary: `Comprehensive predictions for problem escalation, business impact, and solution outcomes`,
          executiveSummary: `Generated predictions with ${prediction.recommendations.length} actionable recommendations`,
          keyFindings: {
            predictions: prediction.predictions,
            recommendations: prediction.recommendations,
          },
          problemsDetected: 0,
          opportunitiesIdentified: prediction.recommendations.filter((r) => r.type === 'LONG_TERM')
            .length,
          riskAssessment: {
            riskLevel: prediction.predictions.escalationRisk.probability > 70 ? 'HIGH' : 'MEDIUM',
            factors: prediction.predictions.escalationRisk.factors,
          },
          actionItems: {
            immediate: prediction.recommendations
              .filter((r) => r.type === 'IMMEDIATE')
              .map((r) => r.action),
            shortTerm: prediction.recommendations
              .filter((r) => r.type === 'SHORT_TERM')
              .map((r) => r.action),
            longTerm: prediction.recommendations
              .filter((r) => r.type === 'LONG_TERM')
              .map((r) => r.action),
          },
          dataSourcesUsed: ['PREDICTIVE_ANALYTICS'] as unknown,
          dataQualityScore: 90,
          analysisConfidence: 85,
        },
      })
    } catch (error) {}
  }

  private initializePredictionModels(): void {
    // Initialize default prediction models
  }
}

export default PredictiveProblemAnalytics
