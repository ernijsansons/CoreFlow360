/**
 * CoreFlow360 - Bundle-Aware AI Orchestrator
 * Mathematical precision in AI flow execution with bundle constraints
 */

import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import type { 
  BundleDefinition, 
  AICapability, 
  AICapabilityType,
  ExternalResource,
  BundleTier,
  AIFlow,
  AIFlowStep,
  Subscription
} from '@/types/bundles'
import { AI_CAPABILITIES, BUNDLE_PRESETS } from '@/types/bundles'
import { redis } from '@/lib/redis'
import { performance } from 'perf_hooks'

const prisma = new PrismaClient()

export interface AIFlowContext {
  tenantId: string
  userId: string
  subscription: Subscription
  activeBundle: BundleDefinition
  input: Record<string, any>
  metadata: Record<string, any>
}

export interface AIFlowResult {
  success: boolean
  flowId: string
  duration: number
  steps: AIFlowStepResult[]
  output: Record<string, any>
  cost: number
  errors?: string[]
}

export interface AIFlowStepResult {
  stepId: string
  capability: AICapabilityType
  resource: ExternalResource
  startTime: number
  endTime: number
  success: boolean
  output?: Record<string, any>
  error?: string
  retries: number
}

export class BundleAwareOrchestrator {
  private static instance: BundleAwareOrchestrator
  private flowExecutions: Map<string, AIFlowResult> = new Map()
  
  private constructor() {}
  
  static getInstance(): BundleAwareOrchestrator {
    if (!BundleAwareOrchestrator.instance) {
      BundleAwareOrchestrator.instance = new BundleAwareOrchestrator()
    }
    return BundleAwareOrchestrator.instance
  }
  
  /**
   * Execute AI flow with bundle constraints and subscription awareness
   */
  async executeAIFlow(
    flow: AIFlow,
    context: AIFlowContext
  ): Promise<AIFlowResult> {
    const startTime = performance.now()
    const flowId = `flow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    try {
      // Validate bundle access
      const hasAccess = await this.validateBundleAccess(
        flow,
        context.subscription,
        context.activeBundle
      )
      
      if (!hasAccess) {
        throw new Error('Insufficient bundle permissions for AI flow')
      }
      
      // Check usage limits
      const withinLimits = await this.checkUsageLimits(
        context.subscription,
        flow.estimatedCost
      )
      
      if (!withinLimits) {
        throw new Error('AI operation limit exceeded for current billing period')
      }
      
      // Execute flow steps
      const stepResults: AIFlowStepResult[] = []
      const stepOutputs: Map<string, any> = new Map()
      
      for (const step of flow.steps) {
        const stepResult = await this.executeStep(
          step,
          context,
          stepOutputs
        )
        
        stepResults.push(stepResult)
        
        if (stepResult.success && stepResult.output) {
          stepOutputs.set(step.id, stepResult.output)
        } else if (!stepResult.success && !step.fallbackStep) {
          throw new Error(`Step ${step.id} failed without fallback`)
        }
      }
      
      // Calculate total cost
      const totalCost = stepResults.reduce((sum, step) => {
        const capability = this.getCapability(step.capability)
        return sum + (capability?.cost || 0)
      }, 0)
      
      // Update usage metrics
      await this.updateUsageMetrics(
        context.subscription.id,
        totalCost,
        stepResults.length
      )
      
      const result: AIFlowResult = {
        success: true,
        flowId,
        duration: performance.now() - startTime,
        steps: stepResults,
        output: Object.fromEntries(stepOutputs),
        cost: totalCost
      }
      
      // Cache result
      await this.cacheFlowResult(flowId, result, context.tenantId)
      
      return result
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      return {
        success: false,
        flowId,
        duration: performance.now() - startTime,
        steps: [],
        output: {},
        cost: 0,
        errors: [errorMessage]
      }
    }
  }
  
  /**
   * Execute individual AI flow step
   */
  private async executeStep(
    step: AIFlowStep,
    context: AIFlowContext,
    previousOutputs: Map<string, any>
  ): Promise<AIFlowStepResult> {
    const startTime = performance.now()
    let retries = 0
    
    while (retries <= step.retryPolicy.maxRetries) {
      try {
        // Resolve input dependencies
        const resolvedInput = this.resolveStepInput(
          step.input,
          previousOutputs,
          context.input
        )
        
        // Get capability configuration
        const capability = this.getCapability(step.capability)
        if (!capability) {
          throw new Error(`Unknown capability: ${step.capability}`)
        }
        
        // Execute external service call
        const output = await this.callExternalService(
          capability,
          step.resource,
          resolvedInput,
          context
        )
        
        return {
          stepId: step.id,
          capability: step.capability,
          resource: step.resource,
          startTime,
          endTime: performance.now(),
          success: true,
          output,
          retries
        }
        
      } catch (error) {
        retries++
        
        if (retries > step.retryPolicy.maxRetries) {
          return {
            stepId: step.id,
            capability: step.capability,
            resource: step.resource,
            startTime,
            endTime: performance.now(),
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            retries
          }
        }
        
        // Exponential backoff
        const delay = Math.min(
          1000 * Math.pow(step.retryPolicy.backoffMultiplier, retries),
          step.retryPolicy.timeout
        )
        
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    return {
      stepId: step.id,
      capability: step.capability,
      resource: step.resource,
      startTime,
      endTime: performance.now(),
      success: false,
      error: 'Max retries exceeded',
      retries
    }
  }
  
  /**
   * Call external service with proper authentication and error handling
   */
  private async callExternalService(
    capability: AICapability,
    resource: ExternalResource,
    input: Record<string, any>,
    context: AIFlowContext
  ): Promise<Record<string, any>> {
    // Get service configuration
    const serviceConfig = await this.getServiceConfig(resource, context.tenantId)
    
    // Prepare request
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Tenant-ID': context.tenantId,
      'X-Request-ID': `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
    
    // Add authentication
    switch (capability.authentication.type) {
      case 'api_key':
        headers[capability.authentication.configKey] = serviceConfig.apiKey
        break
      case 'oauth2':
        headers['Authorization'] = `Bearer ${serviceConfig.accessToken}`
        break
      case 'jwt':
        headers['Authorization'] = `Bearer ${await this.generateJWT(context)}`
        break
    }
    
    // Make request
    const response = await fetch(capability.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        capability: capability.type,
        input,
        context: {
          tenantId: context.tenantId,
          userId: context.userId,
          bundleTier: context.activeBundle.tier
        }
      }),
      signal: AbortSignal.timeout(capability.latency * 2) // 2x expected latency as timeout
    })
    
    if (!response.ok) {
      throw new Error(`External service error: ${response.status} ${response.statusText}`)
    }
    
    const result = await response.json()
    
    // Validate response accuracy
    if (result.confidence && result.confidence < capability.accuracy) {
      throw new Error(`Result confidence ${result.confidence} below threshold ${capability.accuracy}`)
    }
    
    return result
  }
  
  /**
   * Validate bundle access for AI flow
   */
  private async validateBundleAccess(
    flow: AIFlow,
    subscription: Subscription,
    bundle: BundleDefinition
  ): Promise<boolean> {
    // Check minimum bundle tier
    const tierOrder = ['starter', 'professional', 'enterprise', 'ultimate']
    const requiredTierIndex = tierOrder.indexOf(flow.minBundleTier)
    const currentTierIndex = tierOrder.indexOf(bundle.tier)
    
    if (currentTierIndex < requiredTierIndex) {
      return false
    }
    
    // Check required capabilities
    const bundleCapabilities = new Set(
      bundle.aiCapabilities.map(cap => cap.type)
    )
    
    for (const required of flow.requiredCapabilities) {
      if (!bundleCapabilities.has(required)) {
        return false
      }
    }
    
    // Check required resources
    const bundleResources = new Set(bundle.includedResources)
    
    for (const required of flow.requiredResources) {
      if (!bundleResources.has(required)) {
        // Check if resource is in additional resources
        if (!subscription.additionalResources?.includes(required)) {
          return false
        }
      }
    }
    
    return true
  }
  
  /**
   * Check usage limits
   */
  private async checkUsageLimits(
    subscription: Subscription,
    estimatedOperations: number
  ): Promise<boolean> {
    const limits = subscription.customLimits || 
                   BUNDLE_PRESETS[subscription.bundleId as BundleTier]?.limits
    
    if (!limits) return true
    
    return (subscription.usage.aiOperations + estimatedOperations) <= limits.aiOperations
  }
  
  /**
   * Update usage metrics
   */
  private async updateUsageMetrics(
    subscriptionId: string,
    cost: number,
    operations: number
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Update subscription usage
      const subscription = await tx.saaSSubscription.findFirst({
        where: { id: subscriptionId }
      })
      
      if (!subscription) return
      
      // Record usage metric
      await tx.saaSUsageMetric.create({
        data: {
          subscriptionId,
          metricName: 'ai_operations',
          metricValue: operations,
          recordedAt: new Date()
        }
      })
      
      await tx.saaSUsageMetric.create({
        data: {
          subscriptionId,
          metricName: 'ai_cost',
          metricValue: cost,
          recordedAt: new Date()
        }
      })
    })
  }
  
  /**
   * Resolve step input from dependencies and context
   */
  private resolveStepInput(
    stepInput: Record<string, any>,
    previousOutputs: Map<string, any>,
    contextInput: Record<string, any>
  ): Record<string, any> {
    const resolved: Record<string, any> = {}
    
    for (const [key, value] of Object.entries(stepInput)) {
      if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
        // Template variable
        const path = value.slice(2, -2)
        const [source, ...keys] = path.split('.')
        
        if (source === 'context') {
          resolved[key] = this.getNestedValue(contextInput, keys)
        } else if (previousOutputs.has(source)) {
          resolved[key] = this.getNestedValue(previousOutputs.get(source), keys)
        } else {
          resolved[key] = value // Keep original if not found
        }
      } else {
        resolved[key] = value
      }
    }
    
    return resolved
  }
  
  /**
   * Get nested value from object
   */
  private getNestedValue(obj: any, keys: string[]): any {
    return keys.reduce((current, key) => current?.[key], obj)
  }
  
  /**
   * Get capability by type
   */
  private getCapability(type: AICapabilityType): AICapability | undefined {
    return AI_CAPABILITIES.find(cap => cap.type === type)
  }
  
  /**
   * Get service configuration
   */
  private async getServiceConfig(
    resource: ExternalResource,
    tenantId: string
  ): Promise<any> {
    const cacheKey = `service-config:${tenantId}:${resource}`
    
    // Check cache
    const cached = await redis.get(cacheKey)
    if (cached) return cached
    
    // Get from database or environment
    const config = {
      apiKey: process.env[`${resource.toUpperCase()}_API_KEY`],
      accessToken: process.env[`${resource.toUpperCase()}_ACCESS_TOKEN`],
      baseUrl: process.env[`${resource.toUpperCase()}_BASE_URL`]
    }
    
    // Cache for 5 minutes
    await redis.set(cacheKey, config, { ttl: 300 })
    
    return config
  }
  
  /**
   * Generate JWT for service authentication
   */
  private async generateJWT(context: AIFlowContext): Promise<string> {
    // Simple JWT generation - in production use proper JWT library
    const header = Buffer.from(JSON.stringify({
      alg: 'HS256',
      typ: 'JWT'
    })).toString('base64url')
    
    const payload = Buffer.from(JSON.stringify({
      iss: 'coreflow360.com',
      sub: context.userId,
      aud: context.activeBundle.id,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      tenant: context.tenantId
    })).toString('base64url')
    
    // In production, use proper HMAC
    const signature = Buffer.from('signature').toString('base64url')
    
    return `${header}.${payload}.${signature}`
  }
  
  /**
   * Cache flow result
   */
  private async cacheFlowResult(
    flowId: string,
    result: AIFlowResult,
    tenantId: string
  ): Promise<void> {
    const cacheKey = `ai-flow:${tenantId}:${flowId}`
    
    // Store in memory
    this.flowExecutions.set(flowId, result)
    
    // Store in Redis with 1 hour TTL
    await redis.set(cacheKey, result, { ttl: 3600 })
    
    // Cleanup old executions from memory
    if (this.flowExecutions.size > 1000) {
      const oldestKey = this.flowExecutions.keys().next().value
      this.flowExecutions.delete(oldestKey)
    }
  }
  
  /**
   * Get flow execution result
   */
  async getFlowResult(
    flowId: string,
    tenantId: string
  ): Promise<AIFlowResult | null> {
    // Check memory first
    if (this.flowExecutions.has(flowId)) {
      return this.flowExecutions.get(flowId)!
    }
    
    // Check Redis
    const cacheKey = `ai-flow:${tenantId}:${flowId}`
    const cached = await redis.get(cacheKey) as AIFlowResult | null
    
    if (cached) {
      // Restore to memory
      this.flowExecutions.set(flowId, cached)
    }
    
    return cached
  }
  
  /**
   * List available AI flows for subscription
   */
  async getAvailableFlows(
    subscription: Subscription,
    bundle: BundleDefinition
  ): Promise<AIFlow[]> {
    // This would normally fetch from database
    // For now, return sample flows based on bundle
    
    const flows: AIFlow[] = []
    
    if (bundle.aiCapabilities.some(cap => cap.type === AICapabilityType.FINANCIAL_ANALYSIS)) {
      flows.push({
        id: 'financial-health-check',
        name: 'Financial Health Check',
        description: 'Comprehensive financial analysis with anomaly detection',
        steps: [
          {
            id: 'analyze',
            name: 'Analyze Financial Data',
            capability: AICapabilityType.FINANCIAL_ANALYSIS,
            resource: ExternalResource.FINGPT,
            input: {
              data: '{{context.financialData}}',
              period: '{{context.period}}'
            },
            output: {
              analysis: 'object',
              anomalies: 'array',
              recommendations: 'array'
            },
            dependsOn: [],
            retryPolicy: {
              maxRetries: 3,
              backoffMultiplier: 2,
              timeout: 30000
            }
          }
        ],
        triggers: [
          {
            type: 'schedule',
            config: { cron: '0 9 * * 1' } // Every Monday at 9 AM
          }
        ],
        requiredCapabilities: [AICapabilityType.FINANCIAL_ANALYSIS],
        requiredResources: [ExternalResource.FINGPT],
        minBundleTier: BundleTier.PROFESSIONAL,
        estimatedDuration: 5000,
        estimatedCost: 0.05,
        successRate: 0.92
      })
    }
    
    return flows
  }
}

export const bundleAwareOrchestrator = BundleAwareOrchestrator.getInstance()