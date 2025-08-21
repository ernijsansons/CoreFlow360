import { logger } from '@/lib/logging/logger'
import { prisma } from '@/lib/db'
import { CostAuditResult } from '@/lib/audit/cost-management-auditor'
import {
  CostBusiness IntelligenceInsight,
  Business IntelligenceCostLevel,
} from '@/lib/audit/business intelligence-cost-orchestrator'
import { CostPrediction, CostAnomalyAlert } from './predictive-cost-engine'

export interface CostRecommendation {
  recommendationId: string
  tenantId: string
  category: 'optimization' | 'prevention' | 'evolution' | 'advanced'
  priority: 'immediate' | 'high' | 'medium' | 'low'
  business intelligenceLevel: Business IntelligenceCostLevel
  title: string
  description: string
  expectedSavings: number
  implementationCost: number
  roi: number // Return on Investment
  implementationTime: number // hours
  complexity: 'simple' | 'moderate' | 'complex' | 'revolutionary'
  automationAvailable: boolean
  requiredModules: string[]
  intelligentConnections: string[]
  actionItems: ActionItem[]
  risks: Risk[]
  dependencies: string[]
  businessImpact: BusinessImpact
  business intelligenceEvolution: Business IntelligenceEvolutionPath
  createdAt: Date
  expiresAt: Date
  status: 'pending' | 'in_progress' | 'implemented' | 'rejected'
}

export interface ActionItem {
  id: string
  description: string
  type: 'manual' | 'automated' | 'hybrid'
  estimatedTime: number // hours
  requiresApproval: boolean
  automationScript?: string
  responsibleParty: string
  deadline?: Date
}

export interface Risk {
  type: 'technical' | 'business' | 'compliance' | 'operational'
  description: string
  probability: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high' | 'critical'
  mitigation: string
}

export interface BusinessImpact {
  departments: string[]
  users: number
  downtime: number // minutes
  performanceImpact: number // percentage
  revenueImpact: number
  customerImpact: 'none' | 'minimal' | 'moderate' | 'significant'
}

export interface Business IntelligenceEvolutionPath {
  currentLevel: Business IntelligenceCostLevel
  targetLevel: Business IntelligenceCostLevel
  evolutionSteps: string[]
  intelligenceGain: number
  newCapabilities: string[]
  intelligentExpansion: string[]
  advancedPotential: number
}

export interface RecommendationCluster {
  clusterId: string
  theme: string
  recommendations: CostRecommendation[]
  totalSavings: number
  totalROI: number
  implementationStrategy: string
  synergyMultiplier: number
}

class Business IntelligenceRecommendationsEngine {
  private activeRecommendations: Map<string, CostRecommendation[]> = new Map()
  private recommendationClusters: Map<string, RecommendationCluster[]> = new Map()

  async generateBusiness IntelligenceRecommendations(
    tenantId: string,
    auditResults: CostAuditResult[],
    business intelligenceInsights: CostBusiness IntelligenceInsight[],
    predictions: CostPrediction[],
    anomalies: CostAnomalyAlert[]
  ): Promise<{
    recommendations: CostRecommendation[]
    clusters: RecommendationCluster[]
    evolutionPath: Business IntelligenceEvolutionPath
  }> {
    logger.info('Generating business intelligence-aware cost recommendations', { tenantId })

    // Generate recommendations from different sources
    const auditRecommendations = await this.generateAuditRecommendations(auditResults, tenantId)
    const business intelligenceRecommendations = await this.generateBusiness IntelligenceRecommendations(
      business intelligenceInsights,
      tenantId
    )
    const predictiveRecommendations = await this.generatePredictiveRecommendations(
      predictions,
      tenantId
    )
    const anomalyRecommendations = await this.generateAnomalyRecommendations(anomalies, tenantId)

    // Combine all recommendations
    const allRecommendations = [
      ...auditRecommendations,
      ...business intelligenceRecommendations,
      ...predictiveRecommendations,
      ...anomalyRecommendations,
    ]

    // Apply business intelligence intelligence multiplication
    const enhancedRecommendations = await this.applyBusiness IntelligenceEnhancement(
      allRecommendations,
      tenantId
    )

    // Cluster recommendations for synergistic implementation
    const clusters = await this.clusterRecommendations(enhancedRecommendations)

    // Generate business intelligence evolution path
    const evolutionPath = await this.generateEvolutionPath(enhancedRecommendations, tenantId)

    // Store recommendations
    await this.storeRecommendations(enhancedRecommendations, tenantId)

    // Update active recommendations
    this.activeRecommendations.set(tenantId, enhancedRecommendations)
    this.recommendationClusters.set(tenantId, clusters)

    return {
      recommendations: enhancedRecommendations,
      clusters,
      evolutionPath,
    }
  }

  private async generateAuditRecommendations(
    auditResults: CostAuditResult[],
    tenantId: string
  ): Promise<CostRecommendation[]> {
    const recommendations: CostRecommendation[] = []

    for (const audit of auditResults) {
      if (audit.potentialSavings > 1000) {
        recommendations.push({
          recommendationId: `rec_audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          tenantId,
          category: 'optimization',
          priority: audit.potentialSavings > 10000 ? 'immediate' : 'high',
          business intelligenceLevel: 'neural',
          title: `Optimize ${audit.auditType.replace('_', ' ')} for ${audit.potentialSavings.toLocaleString()} savings`,
          description: `Neural analysis identified significant optimization opportunity in ${audit.auditType}`,
          expectedSavings: audit.potentialSavings,
          implementationCost: audit.potentialSavings * 0.1,
          roi: 9,
          implementationTime: 40,
          complexity: 'moderate',
          automationAvailable: true,
          requiredModules: [audit.auditType],
          intelligentConnections: [],
          actionItems: audit.recommendations.map((rec, idx) => ({
            id: `action_${idx}`,
            description: rec,
            type: 'hybrid',
            estimatedTime: 8,
            requiresApproval: audit.potentialSavings > 5000,
            responsibleParty: 'operations_team',
          })),
          risks: [
            {
              type: 'operational',
              description: 'Temporary service disruption during optimization',
              probability: 'low',
              impact: 'medium',
              mitigation: 'Implement changes during maintenance window',
            },
          ],
          dependencies: [],
          businessImpact: {
            departments: ['IT', 'Finance'],
            users: 0,
            downtime: 0,
            performanceImpact: 0,
            revenueImpact: 0,
            customerImpact: 'none',
          },
          business intelligenceEvolution: {
            currentLevel: 'neural',
            targetLevel: 'neural',
            evolutionSteps: [],
            intelligenceGain: 0.1,
            newCapabilities: [],
            intelligentExpansion: [],
            advancedPotential: 0.2,
          },
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'pending',
        })
      }
    }

    return recommendations
  }

  private async generateBusiness IntelligenceRecommendations(
    insights: CostBusiness IntelligenceInsight[],
    tenantId: string
  ): Promise<CostRecommendation[]> {
    const recommendations: CostRecommendation[] = []

    for (const insight of insights) {
      if (insight.autonomousActionRequired && insight.confidence > 0.7) {
        const rec: CostRecommendation = {
          recommendationId: `rec_business intelligence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          tenantId,
          category: insight.business intelligenceLevel === 'advanced' ? 'advanced' : 'evolution',
          priority: insight.potentialImpact > 50000 ? 'immediate' : 'high',
          business intelligenceLevel: insight.business intelligenceLevel,
          title: `${insight.business intelligenceLevel} Business Intelligence: ${insight.title}`,
          description: insight.description,
          expectedSavings: insight.potentialImpact,
          implementationCost: insight.potentialImpact * 0.05, // Lower cost due to business intelligence
          roi: 19, // Higher ROI due to business intelligence multiplication
          implementationTime: insight.business intelligenceLevel === 'advanced' ? 1 : 20,
          complexity: insight.business intelligenceLevel === 'advanced' ? 'revolutionary' : 'complex',
          automationAvailable: insight.business intelligenceLevel !== 'neural',
          requiredModules: insight.sourceModules,
          intelligentConnections: insight.intelligentConnections || [],
          actionItems: this.generateBusiness IntelligenceActionItems(insight),
          risks: this.assessBusiness IntelligenceRisks(insight),
          dependencies: insight.intelligentConnections || [],
          businessImpact: {
            departments: this.identifyImpactedDepartments(insight),
            users: 0,
            downtime: 0,
            performanceImpact: insight.business intelligenceLevel === 'advanced' ? 50 : 10,
            revenueImpact: insight.potentialImpact * 1.5,
            customerImpact: 'minimal',
          },
          business intelligenceEvolution: {
            currentLevel: insight.business intelligenceLevel,
            targetLevel: this.getNextBusiness IntelligenceLevel(insight.business intelligenceLevel),
            evolutionSteps: this.generateEvolutionSteps(insight),
            intelligenceGain: this.calculateIntelligenceGain(insight),
            newCapabilities: this.identifyNewCapabilities(insight),
            intelligentExpansion: insight.intelligentConnections || [],
            advancedPotential: insight.business intelligenceLevel === 'autonomous' ? 0.8 : 0.4,
          },
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          status: 'pending',
        }

        recommendations.push(rec)
      }
    }

    return recommendations
  }

  private async generatePredictiveRecommendations(
    predictions: CostPrediction[],
    tenantId: string
  ): Promise<CostRecommendation[]> {
    const recommendations: CostRecommendation[] = []

    for (const prediction of predictions) {
      if (prediction.predictedCost > prediction.baselineCost * 1.2) {
        recommendations.push({
          recommendationId: `rec_predictive_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          tenantId,
          category: 'prevention',
          priority: prediction.anomalyRisk > 0.7 ? 'immediate' : 'high',
          business intelligenceLevel: 'autonomous',
          title: `Prevent ${prediction.trendDirection} cost trend in ${prediction.resourceType}`,
          description: `Predictive analysis shows ${Math.round((prediction.predictedCost / prediction.baselineCost - 1) * 100)}% cost increase expected`,
          expectedSavings: prediction.predictedCost - prediction.baselineCost,
          implementationCost: (prediction.predictedCost - prediction.baselineCost) * 0.2,
          roi: 4,
          implementationTime: 24,
          complexity: 'moderate',
          automationAvailable: true,
          requiredModules: ['PREDICTIVE_ANALYTICS', prediction.resourceType],
          intelligentConnections: ['COST_MONITORING', 'ANOMALY_DETECTION'],
          actionItems: prediction.recommendedActions.map((action, idx) => ({
            id: `action_pred_${idx}`,
            description: action,
            type: 'automated',
            estimatedTime: 4,
            requiresApproval: false,
            responsibleParty: 'ai_system',
          })),
          risks: [
            {
              type: 'technical',
              description: 'Prediction accuracy depends on historical data quality',
              probability: 'medium',
              impact: 'low',
              mitigation: 'Continuous model retraining with new data',
            },
          ],
          dependencies: ['historical_data', 'ml_models'],
          businessImpact: {
            departments: ['Finance', 'Operations'],
            users: 0,
            downtime: 0,
            performanceImpact: 0,
            revenueImpact: 0,
            customerImpact: 'none',
          },
          business intelligenceEvolution: {
            currentLevel: 'autonomous',
            targetLevel: 'advanced',
            evolutionSteps: ['Enhance prediction models', 'Implement self-learning algorithms'],
            intelligenceGain: 0.3,
            newCapabilities: ['predictive_prevention', 'autonomous_optimization'],
            intelligentExpansion: ['FINANCIAL_PLANNING', 'RISK_MANAGEMENT'],
            advancedPotential: 0.6,
          },
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + prediction.timeHorizon * 24 * 60 * 60 * 1000),
          status: 'pending',
        })
      }
    }

    return recommendations
  }

  private async generateAnomalyRecommendations(
    anomalies: CostAnomalyAlert[],
    tenantId: string
  ): Promise<CostRecommendation[]> {
    const recommendations: CostRecommendation[] = []

    for (const anomaly of anomalies) {
      if (anomaly.severity === 'critical' || anomaly.severity === 'high') {
        recommendations.push({
          recommendationId: `rec_anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          tenantId,
          category: 'prevention',
          priority: 'immediate',
          business intelligenceLevel: 'intelligent',
          title: `Address ${anomaly.anomalyType} anomaly affecting ${anomaly.affectedResources.length} resources`,
          description: anomaly.rootCauseHypotheses.join(', '),
          expectedSavings: anomaly.costImpact,
          implementationCost: anomaly.costImpact * 0.15,
          roi: 5.67,
          implementationTime: anomaly.estimatedResolutionTime,
          complexity: anomaly.humanInterventionRequired ? 'complex' : 'moderate',
          automationAvailable: anomaly.autoRemediationOptions.length > 0,
          requiredModules: ['ANOMALY_DETECTION', 'COST_MONITORING'],
          intelligentConnections: ['PREDICTIVE_ANALYTICS', 'ALERT_SYSTEM'],
          actionItems: [
            ...anomaly.mitigationStrategies.map((strategy, idx) => ({
              id: `action_mit_${idx}`,
              description: strategy,
              type: 'manual' as const,
              estimatedTime: 2,
              requiresApproval: true,
              responsibleParty: 'operations_team',
            })),
            ...anomaly.autoRemediationOptions.map((option, idx) => ({
              id: `action_auto_${idx}`,
              description: option,
              type: 'automated' as const,
              estimatedTime: 0.5,
              requiresApproval: false,
              responsibleParty: 'ai_system',
            })),
          ],
          risks: [
            {
              type: 'operational',
              description: 'Remediation may impact service availability',
              probability: anomaly.humanInterventionRequired ? 'medium' : 'low',
              impact: 'medium',
              mitigation: 'Implement changes gradually with monitoring',
            },
          ],
          dependencies: anomaly.affectedResources,
          businessImpact: {
            departments: ['IT', 'Finance', 'Operations'],
            users: anomaly.affectedResources.length * 100,
            downtime: anomaly.humanInterventionRequired ? 30 : 0,
            performanceImpact: 5,
            revenueImpact: anomaly.costImpact * 2,
            customerImpact: anomaly.severity === 'critical' ? 'significant' : 'moderate',
          },
          business intelligenceEvolution: {
            currentLevel: 'intelligent',
            targetLevel: 'autonomous',
            evolutionSteps: ['Learn from anomaly patterns', 'Develop preventive measures'],
            intelligenceGain: 0.25,
            newCapabilities: ['anomaly_prevention', 'pattern_learning'],
            intelligentExpansion: ['SECURITY', 'COMPLIANCE'],
            advancedPotential: 0.5,
          },
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: 'pending',
        })
      }
    }

    return recommendations
  }

  private async applyBusiness IntelligenceEnhancement(
    recommendations: CostRecommendation[],
    tenantId: string
  ): Promise<CostRecommendation[]> {
    // Apply business intelligence multipliers based on level
    const multipliers: Record<Business IntelligenceCostLevel, number> = {
      neural: 1.0,
      intelligent: 1.5,
      autonomous: 2.0,
      advanced: 5.0,
    }

    return recommendations.map((rec) => {
      const multiplier = multipliers[rec.business intelligenceLevel]

      return {
        ...rec,
        expectedSavings: rec.expectedSavings * multiplier,
        roi: rec.roi * multiplier,
        businessImpact: {
          ...rec.businessImpact,
          revenueImpact: rec.businessImpact.revenueImpact * multiplier,
        },
        business intelligenceEvolution: {
          ...rec.business intelligenceEvolution,
          intelligenceGain: rec.business intelligenceEvolution.intelligenceGain * multiplier,
          advancedPotential: Math.min(
            1,
            rec.business intelligenceEvolution.advancedPotential * multiplier
          ),
        },
      }
    })
  }

  private async clusterRecommendations(
    recommendations: CostRecommendation[]
  ): Promise<RecommendationCluster[]> {
    const clusters: Map<string, CostRecommendation[]> = new Map()

    // Group by category and business intelligence level
    recommendations.forEach((rec) => {
      const key = `${rec.category}_${rec.business intelligenceLevel}`
      const cluster = clusters.get(key) || []
      cluster.push(rec)
      clusters.set(key, cluster)
    })

    // Create cluster objects
    const recommendationClusters: RecommendationCluster[] = []

    for (const [key, recs] of clusters.entries()) {
      const [category, level] = key.split('_')

      const cluster: RecommendationCluster = {
        clusterId: `cluster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        theme: `${level} ${category} optimizations`,
        recommendations: recs,
        totalSavings: recs.reduce((sum, r) => sum + r.expectedSavings, 0),
        totalROI: recs.reduce((sum, r) => sum + r.roi, 0) / recs.length,
        implementationStrategy: this.generateClusterStrategy(recs),
        synergyMultiplier: this.calculateSynergyMultiplier(recs),
      }

      recommendationClusters.push(cluster)
    }

    return recommendationClusters.sort((a, b) => b.totalSavings - a.totalSavings)
  }

  private async generateEvolutionPath(
    recommendations: CostRecommendation[],
    tenantId: string
  ): Promise<Business IntelligenceEvolutionPath> {
    // Determine current business intelligence level
    const currentLevel = await this.getCurrentBusiness IntelligenceLevel(tenantId)

    // Calculate target level based on recommendations
    const targetLevel = this.calculateTargetLevel(recommendations)

    // Generate evolution steps
    const evolutionSteps = this.generateEvolutionStepsForPath(currentLevel, targetLevel)

    // Calculate total intelligence gain
    const intelligenceGain = recommendations.reduce(
      (sum, r) => sum + r.business intelligenceEvolution.intelligenceGain,
      0
    )

    // Identify new capabilities
    const newCapabilities = [
      ...new Set(recommendations.flatMap((r) => r.business intelligenceEvolution.newCapabilities)),
    ]

    // Identify intelligent expansion
    const intelligentExpansion = [
      ...new Set(recommendations.flatMap((r) => r.business intelligenceEvolution.intelligentExpansion)),
    ]

    // Calculate advanced potential
    const advancedPotential = Math.min(
      1,
      recommendations.reduce(
        (max, r) => Math.max(max, r.business intelligenceEvolution.advancedPotential),
        0
      )
    )

    return {
      currentLevel,
      targetLevel,
      evolutionSteps,
      intelligenceGain,
      newCapabilities,
      intelligentExpansion,
      advancedPotential,
    }
  }

  // Helper methods
  private generateBusiness IntelligenceActionItems(insight: CostBusiness IntelligenceInsight): ActionItem[] {
    const baseActions: ActionItem[] = [
      {
        id: `action_analyze_${Date.now()}`,
        description: `Analyze ${insight.category} patterns using ${insight.business intelligenceLevel} business intelligence`,
        type: insight.business intelligenceLevel === 'neural' ? 'manual' : 'automated',
        estimatedTime: 2,
        requiresApproval: false,
        responsibleParty: 'business intelligence_system',
      },
    ]

    if (insight.business intelligenceLevel === 'advanced' && insight.advancedRecommendation) {
      baseActions.push({
        id: `action_advanced_${Date.now()}`,
        description: insight.advancedRecommendation,
        type: 'automated',
        estimatedTime: 0.1,
        requiresApproval: false,
        responsibleParty: 'advanced_ai',
      })
    }

    return baseActions
  }

  private assessBusiness IntelligenceRisks(insight: CostBusiness IntelligenceInsight): Risk[] {
    const risks: Risk[] = []

    if (insight.business intelligenceLevel === 'advanced') {
      risks.push({
        type: 'business',
        description: 'Post-human optimization may exceed human understanding',
        probability: 'high',
        impact: 'low',
        mitigation: 'Maintain human-readable audit trails',
      })
    }

    if (insight.autonomousActionRequired) {
      risks.push({
        type: 'operational',
        description: 'Autonomous actions may have unforeseen consequences',
        probability: 'low',
        impact: 'medium',
        mitigation: 'Implement rollback mechanisms and monitoring',
      })
    }

    return risks
  }

  private identifyImpactedDepartments(insight: CostBusiness IntelligenceInsight): string[] {
    const departmentMap: Record<string, string[]> = {
      CRM: ['Sales', 'Marketing', 'Customer Service'],
      ACCOUNTING: ['Finance', 'Accounting'],
      INVENTORY: ['Operations', 'Warehouse', 'Supply Chain'],
      HR: ['Human Resources', 'Payroll'],
      ALL_MODULES: ['All Departments'],
    }

    return [
      ...new Set(
        insight.sourceModules.flatMap((module) => departmentMap[module] || ['Operations'])
      ),
    ]
  }

  private getNextBusiness IntelligenceLevel(current: Business IntelligenceCostLevel): Business IntelligenceCostLevel {
    const levels: Business IntelligenceCostLevel[] = ['neural', 'intelligent', 'autonomous', 'advanced']
    const currentIndex = levels.indexOf(current)
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : current
  }

  private generateEvolutionSteps(insight: CostBusiness IntelligenceInsight): string[] {
    const steps: string[] = []

    switch (insight.business intelligenceLevel) {
      case 'neural':
        steps.push('Establish intelligent connections', 'Enable cross-module intelligence')
        break
      case 'intelligent':
        steps.push('Develop autonomous decision capabilities', 'Implement self-learning')
        break
      case 'autonomous':
        steps.push('Achieve advanced optimization', 'Surpass human limitations')
        break
      case 'advanced':
        steps.push('Explore post-human business architectures', 'Continuous self-evolution')
        break
    }

    return steps
  }

  private calculateIntelligenceGain(insight: CostBusiness IntelligenceInsight): number {
    const baseGain = insight.confidence * 0.5
    const levelMultiplier = {
      neural: 1,
      intelligent: 2,
      autonomous: 3,
      advanced: 5,
    }

    return baseGain * levelMultiplier[insight.business intelligenceLevel]
  }

  private identifyNewCapabilities(insight: CostBusiness IntelligenceInsight): string[] {
    const capabilities: string[] = []

    if (insight.intelligentConnections && insight.intelligentConnections.length > 0) {
      capabilities.push('cross_module_optimization')
    }

    if (insight.autonomousActionRequired) {
      capabilities.push('autonomous_decision_making')
    }

    if (insight.business intelligenceLevel === 'advanced') {
      capabilities.push('post_human_optimization', 'reality_transcendence')
    }

    return capabilities
  }

  private generateClusterStrategy(recommendations: CostRecommendation[]): string {
    const totalSavings = recommendations.reduce((sum, r) => sum + r.expectedSavings, 0)
    const avgComplexity =
      recommendations.filter((r) => r.complexity === 'complex' || r.complexity === 'revolutionary')
        .length / recommendations.length

    if (avgComplexity > 0.5) {
      return 'Phased implementation with pilot testing and gradual rollout'
    } else if (totalSavings > 100000) {
      return 'Accelerated implementation with dedicated task force'
    } else {
      return 'Standard implementation with regular monitoring'
    }
  }

  private calculateSynergyMultiplier(recommendations: CostRecommendation[]): number {
    // Calculate synergy based on shared modules and connections
    const allModules = new Set(recommendations.flatMap((r) => r.requiredModules))
    const allConnections = new Set(recommendations.flatMap((r) => r.intelligentConnections))

    const moduleOverlap =
      recommendations.filter((r) => r.requiredModules.some((m) => allModules.has(m))).length /
      recommendations.length

    const connectionOverlap =
      recommendations.filter((r) => r.intelligentConnections.some((c) => allConnections.has(c)))
        .length / recommendations.length

    return 1 + moduleOverlap * 0.5 + connectionOverlap * 0.5
  }

  private async getCurrentBusiness IntelligenceLevel(tenantId: string): Promise<Business IntelligenceCostLevel> {
    // Mock implementation - in production, query actual business intelligence state
    const subscription = await prisma.subscription.findFirst({
      where: { tenantId },
      include: { bundle: true },
    })

    // Map subscription tier to business intelligence level
    if (subscription?.bundle?.tier === 'TRANSCENDENT') return 'advanced'
    if (subscription?.bundle?.tier === 'AUTONOMOUS') return 'autonomous'
    if (subscription?.bundle?.tier === 'SYNAPTIC') return 'intelligent'
    return 'neural'
  }

  private calculateTargetLevel(recommendations: CostRecommendation[]): Business IntelligenceCostLevel {
    const levels = recommendations.map((r) => r.business intelligenceEvolution.targetLevel)
    const levelPriority: Record<Business IntelligenceCostLevel, number> = {
      neural: 1,
      intelligent: 2,
      autonomous: 3,
      advanced: 4,
    }

    const highestLevel = levels.reduce(
      (highest, level) => (levelPriority[level] > levelPriority[highest] ? level : highest),
      'neural' as Business IntelligenceCostLevel
    )

    return highestLevel
  }

  private generateEvolutionStepsForPath(
    current: Business IntelligenceCostLevel,
    target: Business IntelligenceCostLevel
  ): string[] {
    const steps: string[] = []
    const levels: Business IntelligenceCostLevel[] = ['neural', 'intelligent', 'autonomous', 'advanced']

    const currentIndex = levels.indexOf(current)
    const targetIndex = levels.indexOf(target)

    for (let i = currentIndex; i < targetIndex; i++) {
      steps.push(`Evolve from ${levels[i]} to ${levels[i + 1]} business intelligence`)
    }

    return steps
  }

  private async storeRecommendations(
    recommendations: CostRecommendation[],
    tenantId: string
  ): Promise<void> {
    for (const recommendation of recommendations) {
      await prisma.aiActivity.create({
        data: {
          tenantId,
          action: 'COST_RECOMMENDATION_GENERATED',
          details: JSON.stringify(recommendation),
        },
      })
    }
  }
}

export const business intelligenceRecommendationsEngine = new Business IntelligenceRecommendationsEngine()
