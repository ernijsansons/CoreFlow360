/**
 * CoreFlow360 - Multi-LLM Provider Manager
 * Unified interface for multiple AI providers with intelligent routing
 */

import { ChatOpenAI } from '@langchain/openai'
import { ChatAnthropic } from '@langchain/anthropic'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
// import { ChatCohere } from '@langchain/cohere' // Temporarily disabled due to AWS SDK conflicts
import { ChatMistralAI } from '@langchain/mistralai'
import { AI_CONFIG } from '@/config/ai.config'

export interface LLMProvider {
  id: string
  name: string
  description: string
  enabled: boolean
  models: string[]
  supportedFeatures: string[]
  costPerToken: number
  instance?: any
}

export interface LLMRequest {
  prompt: string
  model?: string
  provider?: string
  task?: string
  maxTokens?: number
  temperature?: number
  stream?: boolean
}

export interface LLMResponse {
  content: string
  provider: string
  model: string
  tokensUsed: number
  cost: number
  responseTime: number
}

export class MultiLLMManager {
  private providers: Map<string, LLMProvider> = new Map()
  private apiKeys: Map<string, string> = new Map()
  private usageStats: Map<string, { requests: number; tokens: number; cost: number }> = new Map()

  constructor() {
    this.initializeProviders()
  }

  private initializeProviders() {
    // Initialize provider configurations from AI_CONFIG
    Object.entries(AI_CONFIG.providers).forEach(([key, config]) => {
      const provider: LLMProvider = {
        id: key,
        name: config.name,
        description: config.description,
        enabled: config.enabled,
        models: config.models,
        supportedFeatures: config.supportedFeatures,
        costPerToken: config.costPerToken,
      }
      this.providers.set(key, provider)
      this.usageStats.set(key, { requests: 0, tokens: 0, cost: 0 })
    })
  }

  /**
   * Configure API key for a provider
   */
  setApiKey(providerId: string, apiKey: string) {
    if (!this.providers.has(providerId)) {
      throw new Error(`Provider ${providerId} not found`)
    }

    this.apiKeys.set(providerId, apiKey)
    
    // Initialize the provider instance
    const provider = this.providers.get(providerId)!
    provider.instance = this.createProviderInstance(providerId, apiKey)
    provider.enabled = true
    
    this.providers.set(providerId, provider)
  }

  private createProviderInstance(providerId: string, apiKey: string) {
    const config = AI_CONFIG.providers[providerId as keyof typeof AI_CONFIG.providers]
    
    switch (providerId) {
      case 'openai':
        return new ChatOpenAI({
          openAIApiKey: apiKey,
          modelName: config.defaultModel,
          temperature: config.temperature,
          maxTokens: config.maxTokens,
        })
      
      case 'anthropic':
        return new ChatAnthropic({
          anthropicApiKey: apiKey,
          modelName: config.defaultModel,
          temperature: config.temperature,
          maxTokens: config.maxTokens,
        })
      
      case 'google':
        return new ChatGoogleGenerativeAI({
          apiKey: apiKey,
          modelName: config.defaultModel,
          temperature: config.temperature,
          maxOutputTokens: config.maxTokens,
        })
      
      // case 'cohere':
      //   return new ChatCohere({
      //     apiKey: apiKey,
      //     model: config.defaultModel,
      //     temperature: config.temperature,
      //     maxTokens: config.maxTokens,
      //   })
      
      case 'mistral':
        return new ChatMistralAI({
          apiKey: apiKey,
          modelName: config.defaultModel,
          temperature: config.temperature,
          maxTokens: config.maxTokens,
        })
      
      default:
        throw new Error(`Unsupported provider: ${providerId}`)
    }
  }

  /**
   * Select the best provider for a given task
   */
  private selectProvider(request: LLMRequest): string {
    // If specific provider requested and available
    if (request.provider && this.isProviderAvailable(request.provider)) {
      return request.provider
    }

    // Task-specific provider selection
    if (request.task) {
      const taskProvider = AI_CONFIG.providerStrategy.taskSpecific[request.task]
      if (taskProvider && this.isProviderAvailable(taskProvider)) {
        return taskProvider
      }
    }

    // Cost optimization mode
    if (AI_CONFIG.providerStrategy.costOptimization) {
      const cheapestProvider = this.findCheapestAvailableProvider()
      if (cheapestProvider) return cheapestProvider
    }

    // Fallback to available providers in order
    for (const providerId of AI_CONFIG.providerStrategy.fallbackOrder) {
      if (this.isProviderAvailable(providerId)) {
        return providerId
      }
    }

    throw new Error('No AI providers available. Please configure API keys in admin settings.')
  }

  private isProviderAvailable(providerId: string): boolean {
    const provider = this.providers.get(providerId)
    return provider?.enabled && provider?.instance !== undefined
  }

  private findCheapestAvailableProvider(): string | null {
    let cheapest: { id: string; cost: number } | null = null
    
    for (const [id, provider] of this.providers.entries()) {
      if (this.isProviderAvailable(id)) {
        if (!cheapest || provider.costPerToken < cheapest.cost) {
          cheapest = { id, cost: provider.costPerToken }
        }
      }
    }
    
    return cheapest?.id || null
  }

  /**
   * Generate completion using the best available provider
   */
  async generateCompletion(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now()
    const providerId = this.selectProvider(request)
    const provider = this.providers.get(providerId)!
    
    if (!provider.instance) {
      throw new Error(`Provider ${providerId} not properly initialized`)
    }

    try {
      // Use LangChain's invoke method
      const response = await provider.instance.invoke(request.prompt)
      const endTime = Date.now()
      
      // Estimate tokens (rough calculation)
      const tokensUsed = Math.ceil(request.prompt.length / 4) + Math.ceil(response.content.length / 4)
      const cost = tokensUsed * provider.costPerToken
      
      // Update usage stats
      const stats = this.usageStats.get(providerId)!
      stats.requests++
      stats.tokens += tokensUsed
      stats.cost += cost
      
      return {
        content: response.content,
        provider: providerId,
        model: provider.models[0], // Using default model
        tokensUsed,
        cost,
        responseTime: endTime - startTime,
      }
    } catch (error) {
      // Try fallback providers
      const fallbackProviders = AI_CONFIG.providerStrategy.fallbackOrder.filter(
        id => id !== providerId && this.isProviderAvailable(id)
      )
      
      if (fallbackProviders.length > 0) {
        return this.generateCompletion({
          ...request,
          provider: fallbackProviders[0],
        })
      }
      
      throw new Error(`AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get all available providers
   */
  getAvailableProviders(): LLMProvider[] {
    return Array.from(this.providers.values()).filter(p => p.enabled)
  }

  /**
   * Get provider configuration
   */
  getProviderConfig(providerId: string): LLMProvider | undefined {
    return this.providers.get(providerId)
  }

  /**
   * Get usage statistics
   */
  getUsageStats() {
    const stats: Record<string, any> = {}
    
    for (const [providerId, providerStats] of this.usageStats.entries()) {
      const provider = this.providers.get(providerId)
      stats[providerId] = {
        name: provider?.name,
        enabled: provider?.enabled,
        ...providerStats,
      }
    }
    
    return stats
  }

  /**
   * Remove API key and disable provider
   */
  removeProvider(providerId: string) {
    this.apiKeys.delete(providerId)
    const provider = this.providers.get(providerId)
    if (provider) {
      provider.enabled = false
      provider.instance = undefined
      this.providers.set(providerId, provider)
    }
  }

  /**
   * Test provider connection
   */
  async testProvider(providerId: string): Promise<boolean> {
    try {
      const response = await this.generateCompletion({
        prompt: 'Say "Hello, CoreFlow360!" to test the connection.',
        provider: providerId,
      })
      
      return response.content.includes('Hello')
    } catch (error) {
      console.error(`Provider ${providerId} test failed:`, error)
      return false
    }
  }
}

// Singleton instance
export const multiLLMManager = new MultiLLMManager()