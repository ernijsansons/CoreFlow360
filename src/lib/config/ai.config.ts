/**
 * CoreFlow360 - AI Configuration
 * Centralized AI system configuration and settings
 */

export interface AIConfig {
  model: {
    provider: 'openai' | 'anthropic' | 'azure'
    name: string
    version?: string
    maxTokens: number
    temperature: number
    topP?: number
  }
  features: {
    enablePredictive: boolean
    enableAnomalyDetection: boolean
    enableNaturalLanguage: boolean
    enableAutomation: boolean
  }
  limits: {
    maxRequestsPerMinute: number
    maxTokensPerRequest: number
    maxConcurrentRequests: number
  }
  fallback: {
    enabled: boolean
    model?: string
    provider?: string
  }
}

export const defaultAIConfig: AIConfig = {
  model: {
    provider: 'openai',
    name: 'gpt-4',
    maxTokens: 4096,
    temperature: 0.7,
    topP: 0.9
  },
  features: {
    enablePredictive: true,
    enableAnomalyDetection: true,
    enableNaturalLanguage: true,
    enableAutomation: false
  },
  limits: {
    maxRequestsPerMinute: 60,
    maxTokensPerRequest: 4096,
    maxConcurrentRequests: 5
  },
  fallback: {
    enabled: true,
    model: 'gpt-3.5-turbo',
    provider: 'openai'
  }
}

export const getAIConfig = (): AIConfig => {
  return defaultAIConfig
}