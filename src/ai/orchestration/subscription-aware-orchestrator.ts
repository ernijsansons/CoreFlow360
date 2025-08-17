/**
 * CoreFlow360 - Subscription-Aware AI Orchestrator
 * Enhanced AI orchestration that adapts to tenant subscription levels
 */

import { AIAgentOrchestrator, AIAgentConfig, AITask, TaskType, AgentType, AgentCapability } from './ai-agent-orchestrator'
import { moduleManager } from '@/services/subscription/module-manager'
import { AIModelType } from '@prisma/client'
import { prisma } from '@/lib/db'

export interface SubscriptionAwareOrchestrationRequest {
  tenantId: string
  taskType: TaskType
  input: Record<string, unknown>
  context: Record<string, unknown>
  requirements: {
    maxExecutionTime?: number
    accuracyThreshold?: number
    costBudget?: number
    explainability?: boolean
    realTime?: boolean
    crossModule?: boolean
  }
  userId?: string
}

export interface EnhancedOrchestrationResult {
  success: boolean
  data: Record<string, unknown>
  confidence: number
  agentsUsed: string[]
  modulesInvolved: string[]
  crossModuleInsights?: CrossModuleInsight[]
  subscriptionLimitations?: string[]
  upgradeSuggestions?: string[]
  executionMetadata: {
    executionTime: number
    cost: number
    tokensUsed: number
    modelsUsed: string[]
    subscriptionTier: string
    activeModules: string[]
  }
}

export interface CrossModuleInsight {
  sourceModule: string
  targetModule: string
  insightType: string
  description: string
  confidence: number
  actionable: boolean
  requiredModules: string[]
}

export class SubscriptionAwareAIOrchestrator extends AIAgentOrchestrator {
  private moduleAgentMap: Map<string, string[]> = new Map()
  private crossModuleAgentMap: Map<string, string[]> = new Map()
  private subscriptionCache: Map<string, { modules: string[], tier: string, timestamp: number }> = new Map()
  
  constructor(
    langChainManager: any,
    aiServiceManager: any,
    auditLogger: any,
    prisma: PrismaClient,
    redis: any
  ) {
    super(langChainManager, aiServiceManager, auditLogger, prisma, redis)
    this.initializeModuleMappings()
  }

  /**
   * Initialize module-to-agent mappings
   */
  private initializeModuleMappings(): void {
    // Single module agents
    this.moduleAgentMap.set('crm', ['crm-agent', 'sales-agent'])
    this.moduleAgentMap.set('accounting', ['finance-agent'])
    this.moduleAgentMap.set('hr', ['hr-agent'])
    this.moduleAgentMap.set('inventory', ['operations-agent'])
    this.moduleAgentMap.set('projects', ['operations-agent'])
    this.moduleAgentMap.set('marketing', ['sales-agent'])

    // Cross-module agents (only available with multiple subscriptions)
    this.crossModuleAgentMap.set('crm+hr', ['lead-to-hire-agent', 'sales-performance-agent'])
    this.crossModuleAgentMap.set('crm+accounting', ['quote-to-invoice-agent', 'revenue-analysis-agent'])
    this.crossModuleAgentMap.set('hr+accounting', ['payroll-processing-agent', 'expense-approval-agent'])
    this.crossModuleAgentMap.set('crm+inventory', ['demand-forecast-agent', 'stock-optimization-agent'])
    this.crossModuleAgentMap.set('inventory+accounting', ['cost-analysis-agent', 'procurement-optimization-agent'])
    this.crossModuleAgentMap.set('projects+hr', ['resource-allocation-agent', 'productivity-analysis-agent'])
    this.crossModuleAgentMap.set('full_suite', ['enterprise-intelligence-agent', 'predictive-analytics-agent'])
  }

  /**
   * Enhanced orchestration with subscription awareness
   */
  async orchestrateWithSubscriptionAwareness(
    request: SubscriptionAwareOrchestrationRequest
  ): Promise<EnhancedOrchestrationResult> {
    const startTime = Date.now()
    const { tenantId, taskType, input, context, requirements, userId } = request

    try {
      // Get tenant subscription details
      const subscriptionDetails = await this.getTenantSubscriptionDetails(tenantId)
      const { activeModules, subscriptionTier } = subscriptionDetails

      // Determine available agents based on subscription
      const availableAgents = await this.getAvailableAgentsForSubscription(activeModules, subscriptionTier)
      
      // Filter agents suitable for the task
      const suitableAgents = this.filterAgentsByTask(availableAgents, taskType)
      
      if (suitableAgents.length === 0) {
        return this.createUpgradeRequiredResponse(tenantId, taskType, subscriptionTier, activeModules)
      }

      // Check for cross-module capabilities
      const crossModuleCapabilities = this.getCrossModuleCapabilities(activeModules, taskType)
      
      // Execute the task with available agents
      const executionResult = await this.executeWithSubscriptionConstraints(
        tenantId,
        taskType,
        input,
        context,
        suitableAgents,
        crossModuleCapabilities,
        requirements
      )

      // Generate cross-module insights if applicable
      const crossModuleInsights = await this.generateCrossModuleInsights(
        activeModules,
        executionResult,
        taskType
      )

      // Check for upgrade opportunities
      const upgradeSuggestions = this.generateUpgradeSuggestions(
        activeModules,
        subscriptionTier,
        taskType,
        executionResult
      )

      const executionTime = Date.now() - startTime

      return {
        success: true,
        data: executionResult.data,
        confidence: executionResult.confidence,
        agentsUsed: executionResult.agentsUsed,
        modulesInvolved: activeModules,
        crossModuleInsights,
        upgradeSuggestions: upgradeSuggestions.length > 0 ? upgradeSuggestions : undefined,
        executionMetadata: {
          executionTime,
          cost: executionResult.cost,
          tokensUsed: executionResult.tokensUsed || 0,
          modelsUsed: executionResult.modelsUsed,
          subscriptionTier,
          activeModules
        }
      }

    } catch (error) {
      console.error('Subscription-aware orchestration error:', error)
      
      return {
        success: false,
        data: { error: error instanceof Error ? error.message : 'Orchestration failed' },
        confidence: 0,
        agentsUsed: [],
        modulesInvolved: [],
        subscriptionLimitations: [error instanceof Error ? error.message : 'Unknown error'],
        executionMetadata: {
          executionTime: Date.now() - startTime,
          cost: 0,
          tokensUsed: 0,
          modelsUsed: [],
          subscriptionTier: 'unknown',
          activeModules: []
        }
      }
    }
  }

  /**
   * Get tenant subscription details with caching
   */
  private async getTenantSubscriptionDetails(tenantId: string): Promise<{
    activeModules: string[]
    subscriptionTier: string
  }> {
    // Check cache first (valid for 5 minutes)
    const cached = this.subscriptionCache.get(tenantId)
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      return { activeModules: cached.modules, subscriptionTier: cached.tier }
    }

    // Fetch from database
    const activeModules = await moduleManager.getActiveModules(tenantId)
    
    const subscription = await prisma.tenantSubscription.findUnique({
      where: { tenantId }
    })

    const subscriptionTier = subscription?.subscriptionTier || 'basic'

    // Update cache
    this.subscriptionCache.set(tenantId, {
      modules: activeModules,
      tier: subscriptionTier,
      timestamp: Date.now()
    })

    return { activeModules, subscriptionTier }
  }

  /**
   * Get available agents based on subscription
   */
  private async getAvailableAgentsForSubscription(
    activeModules: string[],
    subscriptionTier: string
  ): Promise<AIAgentConfig[]> {
    const availableAgentIds: string[] = []

    // Add single-module agents
    for (const module of activeModules) {
      const moduleAgents = this.moduleAgentMap.get(module) || []
      availableAgentIds.push(...moduleAgents)
    }

    // Add cross-module agents if multiple modules are active
    if (activeModules.length > 1) {
      // Check specific combinations
      for (const [combination, agents] of this.crossModuleAgentMap.entries()) {
        if (combination === 'full_suite' && activeModules.length >= 5) {
          availableAgentIds.push(...agents)
        } else {
          const requiredModules = combination.split('+')
          if (requiredModules.every(mod => activeModules.includes(mod))) {
            availableAgentIds.push(...agents)
          }
        }
      }
    }

    // Filter by subscription tier restrictions
    const allAgents = Array.from(this.agents.values())
    return allAgents.filter(agent => {
      if (!availableAgentIds.includes(agent.id)) return false
      
      // Enterprise-only agents
      if (agent.id.includes('enterprise') && subscriptionTier !== 'enterprise') {
        return false
      }

      return true
    })
  }

  /**
   * Get cross-module capabilities
   */
  private getCrossModuleCapabilities(activeModules: string[], taskType: TaskType): string[] {
    const capabilities: string[] = []

    if (activeModules.length < 2) return capabilities

    // Define cross-module capabilities
    const crossCapabilities = {
      'crm+accounting': ['revenue_forecasting', 'customer_lifetime_value', 'payment_prediction'],
      'crm+hr': ['sales_performance_correlation', 'lead_to_hire_tracking', 'team_productivity'],
      'hr+accounting': ['payroll_optimization', 'cost_per_employee', 'budget_allocation'],
      'crm+inventory': ['demand_forecasting', 'customer_inventory_needs', 'stock_recommendations'],
      'projects+hr': ['resource_optimization', 'skill_matching', 'workload_balancing']
    }

    // Check which combinations are available
    for (const [combination, caps] of Object.entries(crossCapabilities)) {
      const requiredModules = combination.split('+')
      if (requiredModules.every(mod => activeModules.includes(mod))) {
        capabilities.push(...caps)
      }
    }

    return capabilities
  }

  /**
   * Execute task with subscription constraints
   */
  private async executeWithSubscriptionConstraints(
    tenantId: string,
    taskType: TaskType,
    input: Record<string, unknown>,
    context: Record<string, unknown>,
    availableAgents: AIAgentConfig[],
    crossModuleCapabilities: string[],
    requirements?: any
  ): Promise<any> {
    // Select best agent for the task
    const selectedAgent = this.selectOptimalAgent(availableAgents, taskType, requirements)
    
    if (!selectedAgent) {
      throw new Error('No suitable agents available for this task with current subscription')
    }

    // Enhance context with cross-module capabilities
    const enhancedContext = {
      ...context,
      crossModuleCapabilities,
      subscriptionConstraints: {
        availableAgents: availableAgents.map(a => a.id),
        maxComplexity: this.getMaxComplexityForAgent(selectedAgent)
      }
    }

    // Execute the task (this would integrate with the existing task execution)
    const result = {
      data: { 
        result: `Task executed by ${selectedAgent.name}`,
        capabilities: crossModuleCapabilities
      },
      confidence: 0.85,
      agentsUsed: [selectedAgent.id],
      cost: selectedAgent.performanceTargets.costPerOperation,
      tokensUsed: 150,
      modelsUsed: [selectedAgent.model]
    }

    return result
  }

  /**
   * Generate cross-module insights
   */
  private async generateCrossModuleInsights(
    activeModules: string[],
    executionResult: any,
    taskType: TaskType
  ): Promise<CrossModuleInsight[]> {
    const insights: CrossModuleInsight[] = []

    if (activeModules.length < 2) return insights

    // Example cross-module insights
    if (activeModules.includes('crm') && activeModules.includes('hr')) {
      insights.push({
        sourceModule: 'crm',
        targetModule: 'hr',
        insightType: 'performance_correlation',
        description: 'Sales performance data can be correlated with employee satisfaction metrics',
        confidence: 0.78,
        actionable: true,
        requiredModules: ['crm', 'hr']
      })
    }

    if (activeModules.includes('crm') && activeModules.includes('accounting')) {
      insights.push({
        sourceModule: 'crm',
        targetModule: 'accounting',
        insightType: 'revenue_prediction',
        description: 'Customer data can improve revenue forecasting accuracy by 23%',
        confidence: 0.82,
        actionable: true,
        requiredModules: ['crm', 'accounting']
      })
    }

    return insights
  }

  /**
   * Generate upgrade suggestions
   */
  private generateUpgradeSuggestions(
    activeModules: string[],
    subscriptionTier: string,
    taskType: TaskType,
    executionResult: any
  ): string[] {
    const suggestions: string[] = []

    // Suggest additional modules
    if (!activeModules.includes('accounting') && activeModules.includes('crm')) {
      suggestions.push('Add Accounting module for 25% better revenue forecasting')
    }

    if (!activeModules.includes('hr') && activeModules.length >= 2) {
      suggestions.push('Add HR module to unlock team performance insights')
    }

    // Suggest tier upgrades
    if (subscriptionTier === 'basic' && activeModules.length >= 3) {
      suggestions.push('Upgrade to Professional tier for advanced AI capabilities')
    }

    if (subscriptionTier !== 'enterprise' && activeModules.length >= 5) {
      suggestions.push('Enterprise tier unlocks predictive analytics and custom integrations')
    }

    return suggestions
  }

  /**
   * Create response for upgrade-required scenarios
   */
  private createUpgradeRequiredResponse(
    tenantId: string,
    taskType: TaskType,
    subscriptionTier: string,
    activeModules: string[]
  ): EnhancedOrchestrationResult {
    const requiredModules = this.getRequiredModulesForTask(taskType)
    const missingModules = requiredModules.filter(mod => !activeModules.includes(mod))

    return {
      success: false,
      data: { message: 'Subscription upgrade required' },
      confidence: 0,
      agentsUsed: [],
      modulesInvolved: activeModules,
      subscriptionLimitations: [
        `Task requires modules: ${requiredModules.join(', ')}`,
        `Missing modules: ${missingModules.join(', ')}`
      ],
      upgradeSuggestions: [
        `Add ${missingModules.join(', ')} module(s) to enable this capability`,
        subscriptionTier === 'basic' ? 'Consider upgrading to Professional tier' : undefined
      ].filter(Boolean) as string[],
      executionMetadata: {
        executionTime: 0,
        cost: 0,
        tokensUsed: 0,
        modelsUsed: [],
        subscriptionTier,
        activeModules
      }
    }
  }

  /**
   * Helper methods
   */
  private selectOptimalAgent(agents: AIAgentConfig[], taskType: TaskType, requirements?: any): AIAgentConfig | null {
    // Score agents based on suitability for the task
    const scoredAgents = agents.map(agent => ({
      agent,
      score: this.calculateAgentScore(agent, taskType, requirements)
    }))

    // Sort by score (highest first)
    scoredAgents.sort((a, b) => b.score - a.score)
    
    return scoredAgents.length > 0 ? scoredAgents[0].agent : null
  }

  private calculateAgentScore(agent: AIAgentConfig, taskType: TaskType, requirements?: any): number {
    let score = 0

    // Base capability match
    if (agent.type === AgentType.CRM_AGENT && taskType.toString().includes('CUSTOMER')) {
      score += 50
    }
    if (agent.type === AgentType.FINANCE_AGENT && taskType.toString().includes('FINANCIAL')) {
      score += 50
    }

    // Performance targets
    score += agent.performanceTargets.accuracy * 20
    score -= agent.performanceTargets.costPerOperation * 10

    // Priority (lower number = higher priority)
    score += (5 - agent.priority) * 10

    return score
  }

  private getMaxComplexityForAgent(agent: AIAgentConfig): string {
    if (agent.capabilities.includes(AgentCapability.CROSS_DEPARTMENT)) return 'high'
    if (agent.capabilities.includes(AgentCapability.DECISION_MAKING)) return 'medium'
    return 'low'
  }

  private getRequiredModulesForTask(taskType: TaskType): string[] {
    const taskModuleMap: Record<string, string[]> = {
      [TaskType.ANALYZE_CUSTOMER]: ['crm'],
      [TaskType.PREDICT_CHURN]: ['crm'],
      [TaskType.OPTIMIZE_PRICING]: ['crm', 'accounting'],
      [TaskType.FORECAST_DEMAND]: ['inventory'],
      [TaskType.CROSS_MODULE_SYNC]: ['crm', 'accounting'], // Example
      [TaskType.PERFORMANCE_ANALYSIS]: ['hr']
    }
    
    return taskModuleMap[taskType] || ['crm']
  }

  /**
   * Clear subscription cache (useful for testing or when subscriptions change)
   */
  public clearSubscriptionCache(tenantId?: string): void {
    if (tenantId) {
      this.subscriptionCache.delete(tenantId)
    } else {
      this.subscriptionCache.clear()
    }
  }
}

// Export the enhanced orchestrator
export default SubscriptionAwareAIOrchestrator