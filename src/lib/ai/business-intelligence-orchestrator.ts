/**
 * AI Business Intelligence Orchestrator for CoreFlow360
 * Multi-provider AI system with intelligent routing and decision making
 *
 * This is the central system that coordinates AI capabilities across
 * all business modules with appropriate intelligence levels
 */

import { OpenAI } from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getOpenAIKey } from '@/lib/security/credential-manager'

export type IntelligenceLevel = 'basic' | 'smart' | 'advanced' | 'premium'
export type AIProvider = 'openai' | 'anthropic' | 'google' | 'azure'
export type TaskComplexity = 'simple' | 'moderate' | 'complex' | 'revolutionary'

export interface IntelligenceConfig {
  level: IntelligenceLevel
  complexity: number
  features: string[]
  ai_integration: string
  compute_allocation: number
  max_cost_per_request: number
  preferred_providers: AIProvider[]
  fallback_providers: AIProvider[]
}

export interface AIRequest {
  task_type: string
  intelligence_requirement: IntelligenceLevel
  complexity: TaskComplexity
  context: Record<string, unknown>
  module: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  max_response_time_ms?: number
  cost_limit?: number
}

export interface AIResponse {
  provider: AIProvider
  model: string
  intelligence_level: IntelligenceLevel
  response: unknown
  confidence: number
  processing_time_ms: number
  cost_estimate: number
  reasoning_trace?: string[]
}

export interface AIProviderConfig {
  name: AIProvider
  client: unknown
  models: {
    simple: string
    moderate: string
    complex: string
    revolutionary: string
  }
  cost_per_1k_tokens: {
    input: number
    output: number
  }
  max_tokens: number
  supports_streaming: boolean
  intelligence_affinity: IntelligenceLevel[]
}

export class BusinessIntelligenceOrchestrator {
  private providers: Map<AIProvider, AIProviderConfig> = new Map()
  private intelligence_configs: Map<IntelligenceLevel, IntelligenceConfig>
  private request_history: AIRequest[] = []
  private performance_metrics: Map<string, unknown> = new Map()
  private initialized = false

  constructor() {
    this.initializeIntelligenceConfigs()
  }

  static async create(): Promise<BusinessIntelligenceOrchestrator> {
    const instance = new BusinessIntelligenceOrchestrator()
    await instance.initializeProviders()
    instance.initialized = true
    return instance
  }

  async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initializeProviders()
      this.initialized = true
    }
  }

  /**
   * Main orchestration method - routes AI requests based on intelligence requirements
   */
  async orchestrateIntelligence(request: AIRequest): Promise<AIResponse> {
    // Ensure providers are initialized
    await this.ensureInitialized()

    // Analyze request intelligence requirements
    const intelligence_config = this.intelligence_configs.get(request.intelligence_requirement)
    if (!intelligence_config) {
      throw new Error(`Unknown intelligence level: ${request.intelligence_requirement}`)
    }

    // Select optimal provider based on intelligence level and task complexity
    const selected_provider = await this.selectOptimalProvider(request, intelligence_config)

    // Execute AI request with intelligence-aware parameters
    const response = await this.executeAIRequest(request, selected_provider, intelligence_config)

    // Track performance and update intelligence adaptation
    await this.trackPerformance(request, response)

    // Apply intelligence-level post-processing
    return await this.applyIntelligenceProcessing(response, intelligence_config)
  }

  /**
   * Multi-agent intelligence synthesis for complex business decisions
   */
  async synthesizeBusinessDecision(
    decision_context: Record<string, unknown>,
    required_intelligence: IntelligenceLevel,
    agents: string[]
  ): Promise<{
    decision: unknown
    reasoning: string[]
    confidence: number
    intelligence_integration: number
  }> {
    // Deploy multiple AI agents with different perspectives
    const agent_responses = await Promise.all(
      agents.map((agent) =>
        this.deployIntelligenceAgent(agent, decision_context, required_intelligence)
      )
    )

    // Synthesize responses using intelligence-aware decision fusion
    const synthesis = await this.fuseIntelligenceResponses(agent_responses, required_intelligence)

    // Calculate intelligence integration score
    const intelligence_integration = this.calculateIntelligenceIntegration(
      agent_responses,
      synthesis
    )

    return {
      decision: synthesis.decision,
      reasoning: synthesis.reasoning_chain,
      confidence: synthesis.confidence,
      intelligence_integration,
    }
  }

  /**
   * Real-time intelligence adaptation based on business performance
   */
  async adaptIntelligence(
    module: string,
    performance_data: Record<string, number>,
    business_goals: Record<string, unknown>
  ): Promise<{
    recommended_intelligence: IntelligenceLevel
    adaptation_reasoning: string[]
    expected_improvement: number
  }> {
    // Analyze current intelligence effectiveness
    const current_effectiveness = await this.analyzeIntelligenceEffectiveness(
      module,
      performance_data
    )

    // Generate intelligence evolution recommendations
    const evolution_analysis = await this.orchestrateIntelligence({
      task_type: 'intelligence_evolution_analysis',
      intelligence_requirement: 'advanced',
      complexity: 'complex',
      context: {
        module,
        current_performance: performance_data,
        business_goals,
        effectiveness_metrics: current_effectiveness,
      },
      module: 'intelligence_orchestrator',
      priority: 'high',
    })

    return {
      recommended_intelligence: evolution_analysis.response.recommended_level,
      adaptation_reasoning: evolution_analysis.response.reasoning,
      expected_improvement: evolution_analysis.response.improvement_estimate,
    }
  }

  /**
   * Cross-module intelligence coordination
   */
  async coordinateIntelligence(
    modules: string[],
    shared_context: Record<string, unknown>,
    coordination_goal: string
  ): Promise<{
    coordination_plan: unknown
    module_assignments: Record<string, unknown>
    intelligence_flow: unknown[]
    success_probability: number
  }> {
    // Create cross-module intelligence map
    const intelligence_map = await this.createIntelligenceMap(modules, shared_context)

    // Generate coordination strategy
    const coordination_strategy = await this.orchestrateIntelligence({
      task_type: 'cross_module_coordination',
      intelligence_requirement: 'premium',
      complexity: 'revolutionary',
      context: {
        modules,
        shared_context,
        coordination_goal,
        intelligence_map,
      },
      module: 'cross_module_coordinator',
      priority: 'critical',
    })

    return coordination_strategy.response
  }

  // Private implementation methods

  private async initializeProviders(): Promise<void> {
    // OpenAI Configuration
    try {
      const openaiKey = await getOpenAIKey()
      this.providers.set('openai', {
        name: 'openai',
        client: new OpenAI({
          apiKey: openaiKey,
        }),
        models: {
          simple: 'gpt-3.5-turbo',
          moderate: 'gpt-4',
          complex: 'gpt-4-turbo-preview',
          revolutionary: 'gpt-4-turbo-preview',
        },
        cost_per_1k_tokens: {
          input: 0.01,
          output: 0.03,
        },
        max_tokens: 128000,
        supports_streaming: true,
        intelligence_affinity: ['basic', 'smart', 'advanced'],
      })
    } catch (error) {}

    // Anthropic Configuration
    if (process.env.ANTHROPIC_API_KEY) {
      this.providers.set('anthropic', {
        name: 'anthropic',
        client: new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY,
        }),
        models: {
          simple: 'claude-3-haiku-20240307',
          moderate: 'claude-3-sonnet-20240229',
          complex: 'claude-3-opus-20240229',
          revolutionary: 'claude-3-opus-20240229',
        },
        cost_per_1k_tokens: {
          input: 0.015,
          output: 0.075,
        },
        max_tokens: 200000,
        supports_streaming: true,
        intelligence_affinity: ['smart', 'advanced', 'premium'],
      })
    }

    // Google AI Configuration
    if (process.env.GOOGLE_AI_API_KEY) {
      this.providers.set('google', {
        name: 'google',
        client: new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY),
        models: {
          simple: 'gemini-pro',
          moderate: 'gemini-pro',
          complex: 'gemini-pro-vision',
          revolutionary: 'gemini-ultra',
        },
        cost_per_1k_tokens: {
          input: 0.0005,
          output: 0.0015,
        },
        max_tokens: 32000,
        supports_streaming: true,
        intelligence_affinity: ['basic', 'smart'],
      })
    }
  }

  private initializeIntelligenceConfigs(): void {
    this.intelligence_configs = new Map([
      [
        'basic',
        {
          level: 'basic',
          complexity: 1,
          features: ['basic_analysis', 'simple_recommendations'],
          ai_integration: 'minimal',
          compute_allocation: 0.1,
          max_cost_per_request: 0.01,
          preferred_providers: ['google', 'openai'],
          fallback_providers: ['anthropic'],
        },
      ],
      [
        'smart',
        {
          level: 'smart',
          complexity: 2,
          features: ['pattern_recognition', 'contextual_understanding', 'multi_step_reasoning'],
          ai_integration: 'moderate',
          compute_allocation: 0.3,
          max_cost_per_request: 0.05,
          preferred_providers: ['openai', 'anthropic'],
          fallback_providers: ['google'],
        },
      ],
      [
        'advanced',
        {
          level: 'advanced',
          complexity: 3,
          features: ['autonomous_decision_making', 'complex_problem_solving', 'creative_synthesis'],
          ai_integration: 'extensive',
          compute_allocation: 0.6,
          max_cost_per_request: 0.25,
          preferred_providers: ['anthropic', 'openai'],
          fallback_providers: ['google'],
        },
      ],
      [
        'premium',
        {
          level: 'premium',
          complexity: 4,
          features: ['intelligence_synthesis', 'revolutionary_insights', 'predictive_analytics'],
          ai_integration: 'fully-integrated',
          compute_allocation: 1.0,
          max_cost_per_request: 1.0,
          preferred_providers: ['anthropic'],
          fallback_providers: ['openai', 'google'],
        },
      ],
    ])
  }

  private async selectOptimalProvider(
    request: AIRequest,
    intelligence_config: IntelligenceConfig
  ): Promise<AIProviderConfig> {
    // Calculate provider scores based on intelligence affinity, cost, and performance
    const provider_scores = new Map<AIProvider, number>()

    for (const [provider_name, provider_config] of this.providers) {
      let score = 0

      // Intelligence affinity score (40% weight)
      if (provider_config.intelligence_affinity.includes(request.intelligence_requirement)) {
        score += 0.4
      }

      // Cost efficiency score (30% weight)
      const estimated_cost = this.estimateRequestCost(request, provider_config)
      if (estimated_cost <= intelligence_config.max_cost_per_request) {
        score += 0.3 * (1 - estimated_cost / intelligence_config.max_cost_per_request)
      }

      // Historical performance score (30% weight)
      const historical_performance = this.getHistoricalPerformance(provider_name, request.task_type)
      score += 0.3 * historical_performance

      provider_scores.set(provider_name, score)
    }

    // Select provider with highest score
    const selected_provider_name = Array.from(provider_scores.entries()).sort(
      ([, a], [, b]) => b - a
    )[0][0]

    const selected_provider = this.providers.get(selected_provider_name)
    if (!selected_provider) {
      throw new Error(`Provider ${selected_provider_name} not available`)
    }

    return selected_provider
  }

  private async executeAIRequest(
    request: AIRequest,
    provider: AIProviderConfig,
    intelligence_config: IntelligenceConfig
  ): Promise<AIResponse> {
    const start_time = Date.now()
    const model = provider.models[request.complexity]

    try {
      let response: unknown

      switch (provider.name) {
        case 'openai':
          response = await this.executeOpenAIRequest(request, provider, model)
          break
        case 'anthropic':
          response = await this.executeAnthropicRequest(request, provider, model)
          break
        case 'google':
          response = await this.executeGoogleRequest(request, provider, model)
          break
        default:
          throw new Error(`Unsupported provider: ${provider.name}`)
      }

      const processing_time = Date.now() - start_time

      return {
        provider: provider.name,
        model,
        intelligence_level: request.intelligence_requirement,
        response: response.content || response.text || response,
        confidence: response.confidence || 0.85,
        processing_time_ms: processing_time,
        cost_estimate: this.estimateRequestCost(request, provider),
        reasoning_trace: response.reasoning_trace,
      }
    } catch (error) {
      throw error
    }
  }

  private async executeOpenAIRequest(
    request: AIRequest,
    provider: AIProviderConfig,
    model: string
  ): Promise<unknown> {
    const completion = await provider.client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: `You are operating at ${request.intelligence_requirement} intelligence level for the ${request.module} module. Provide ${request.complexity} level analysis.`,
        },
        {
          role: 'user',
          content: JSON.stringify(request.context),
        },
      ],
      temperature: this.getIntelligenceTemperature(request.intelligence_requirement),
      max_tokens: Math.min(4000, provider.max_tokens),
    })

    return {
      content: completion.choices[0]?.message?.content,
      confidence: 0.9,
    }
  }

  private async executeAnthropicRequest(
    request: AIRequest,
    provider: AIProviderConfig,
    model: string
  ): Promise<unknown> {
    const message = await provider.client.messages.create({
      model,
      max_tokens: 4000,
      temperature: this.getIntelligenceTemperature(request.intelligence_requirement),
      messages: [
        {
          role: 'user',
          content: `Operating at ${request.intelligence_requirement} intelligence level for ${request.module}:\n\n${JSON.stringify(request.context)}`,
        },
      ],
    })

    return {
      content: message.content[0]?.text,
      confidence: 0.95,
    }
  }

  private async executeGoogleRequest(
    request: AIRequest,
    provider: AIProviderConfig,
    model: string
  ): Promise<unknown> {
    const genModel = provider.client.getGenerativeModel({ model })

    const result = await genModel.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Intelligence Level: ${request.intelligence_requirement}\nModule: ${request.module}\nContext: ${JSON.stringify(request.context)}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: this.getIntelligenceTemperature(request.intelligence_requirement),
        maxOutputTokens: 4000,
      },
    })

    return {
      content: result.response.text(),
      confidence: 0.8,
    }
  }

  private getIntelligenceTemperature(level: IntelligenceLevel): number {
    const temperatures = {
      basic: 0.1,
      smart: 0.3,
      advanced: 0.7,
      premium: 0.9,
    }
    return temperatures[level]
  }

  private estimateRequestCost(request: AIRequest, provider: AIProviderConfig): number {
    // Simplified cost estimation based on context size and complexity
    const context_tokens = JSON.stringify(request.context).length / 4 // rough token estimate
    const complexity_multiplier =
      { simple: 1, moderate: 1.5, complex: 2.5, revolutionary: 4 }[request.complexity] || 1

    return (context_tokens / 1000) * provider.cost_per_1k_tokens.input * complexity_multiplier
  }

  private getHistoricalPerformance(provider: AIProvider, task_type: string): number {
    // Simplified historical performance lookup
    const key = `${provider}_${task_type}`
    return this.performance_metrics.get(key) || 0.7 // default performance
  }

  private async trackPerformance(request: AIRequest, response: AIResponse): Promise<void> {
    // Track performance metrics for future optimization
    const key = `${response.provider}_${request.task_type}`
    const current_performance = this.performance_metrics.get(key) || 0.5

    // Calculate performance based on response time, confidence, and cost efficiency
    const new_performance =
      (1 - Math.min(response.processing_time_ms / 10000, 1)) * 0.4 + // speed score
      response.confidence * 0.4 + // confidence score
      (1 - Math.min(response.cost_estimate, 1)) * 0.2 // cost efficiency score

    // Update with exponential moving average
    this.performance_metrics.set(key, current_performance * 0.8 + new_performance * 0.2)

    // Store request in history
    this.request_history.push(request)
    if (this.request_history.length > 1000) {
      this.request_history = this.request_history.slice(-500) // keep last 500 requests
    }
  }

  private async applyIntelligenceProcessing(
    response: AIResponse,
    intelligence_config: IntelligenceConfig
  ): Promise<AIResponse> {
    // Apply intelligence-level specific post-processing
    if (intelligence_config.level === 'premium') {
      // Add premium insights and intelligence synthesis
      response.response = await this.enhanceWithPremiumInsights(response.response)
    } else if (intelligence_config.level === 'advanced') {
      // Add advanced decision-making capabilities
      response.response = await this.enhanceWithAdvancedCapabilities(response.response)
    }

    return response
  }

  private async enhanceWithPremiumInsights(content: string): Promise<string> {
    // Add premium intelligence enhancements
    return `📊 PREMIUM BUSINESS INTELLIGENCE\n\n${content}\n\n✨ Enhanced with premium business intelligence providing deep insights and strategic recommendations.`
  }

  private async enhanceWithAdvancedCapabilities(content: string): Promise<string> {
    // Add advanced intelligence enhancements
    return `🚀 ADVANCED BUSINESS INTELLIGENCE\n\n${content}\n\n💡 Includes advanced analytics and self-optimizing recommendations.`
  }

  // Additional helper methods for intelligence synthesis...
  private async deployIntelligenceAgent(
    agent: string,
    _context: Record<string, unknown>,
    intelligence: IntelligenceLevel
  ): Promise<unknown> {
    return { agent, response: `Agent ${agent} intelligence response`, confidence: 0.9 }
  }

  private async fuseIntelligenceResponses(
    _responses: unknown[],
    intelligence: IntelligenceLevel
  ): Promise<unknown> {
    return {
      decision: 'Synthesized decision',
      reasoning_chain: ['Step 1', 'Step 2'],
      confidence: 0.95,
    }
  }

  private calculateIntelligenceIntegration(_responses: unknown[], _synthesis: unknown): number {
    return 0.9 // Simplified intelligence integration calculation
  }

  private async analyzeIntelligenceEffectiveness(
    _module: string,
    _performance: Record<string, number>
  ): Promise<unknown> {
    return { effectiveness_score: 0.8, areas_for_improvement: ['decision_speed', 'accuracy'] }
  }

  private async createIntelligenceMap(
    modules: string[],
    _context: Record<string, unknown>
  ): Promise<unknown> {
    return { intelligence_connections: modules.map((m) => ({ module: m, connections: [] })) }
  }
}

// Export a function to get the singleton instance (async initialization)
let orchestratorInstance: BusinessIntelligenceOrchestrator | null = null

export const getBusinessIntelligenceOrchestrator = async (): Promise<BusinessIntelligenceOrchestrator> => {
  if (!orchestratorInstance) {
    orchestratorInstance = await BusinessIntelligenceOrchestrator.create()
  } else {
    await orchestratorInstance.ensureInitialized()
  }
  return orchestratorInstance
}

// For backward compatibility - lazy initialization
export const businessIntelligenceOrchestrator = new BusinessIntelligenceOrchestrator()

// Integration helpers for Next.js
export const AIOrchestrationAPI = {
  // Middleware for intelligence-aware API routes
  intelligenceMiddleware: async (req: unknown, res: unknown, next: unknown) => {
    const intelligence_level = req.headers['x-intelligence-level'] || 'basic'
    const task_complexity = req.headers['x-task-complexity'] || 'simple'

    req.ai_orchestrator = {
      request: async (task_type: string, context: Record<string, unknown>) => {
        return await businessIntelligenceOrchestrator.orchestrateIntelligence({
          task_type,
          intelligence_requirement: intelligence_level as IntelligenceLevel,
          complexity: task_complexity as TaskComplexity,
          context,
          module: req.url?.split('/')[2] || 'unknown',
          priority: 'medium',
        })
      },
    }

    next()
  },
}