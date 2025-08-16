/**
 * CoreFlow360 - AI Workflow Router
 * Routes AI requests to appropriate services based on workflow type
 */

import { AIFlowRequest, AIResult } from '../contexts/ai-flow-context'
import { UnifiedAIService } from '../interfaces/ai-services'
import { SecurityContext } from '@/types/bundles'
import { createSecurityContext } from '../security/context-validator'
import { AICache } from '../cache/ai-cache'

export class WorkflowRouter {
  private aiServices: UnifiedAIService
  private cache: AICache

  constructor(aiServices: UnifiedAIService, cache: AICache) {
    this.aiServices = aiServices
    this.cache = cache
  }

  async route(request: AIFlowRequest): Promise<AIResult> {
    const startTime = Date.now()
    const securityContext = createSecurityContext(request.context)
    
    // Check cache first
    const cacheKey = this.generateCacheKey(request)
    const cachedResult = await this.cache.get(cacheKey)
    if (cachedResult) {
      return {
        ...cachedResult,
        cacheHit: true,
        executionTime: Date.now() - startTime
      }
    }

    try {
      // Route based on workflow type
      const result = await this.routeToService(request, securityContext)
      
      // Cache successful results
      if (result.success) {
        await this.cache.set(cacheKey, result, this.getCacheTTL(request.workflow))
      }
      
      return {
        ...result,
        cacheHit: false,
        executionTime: Date.now() - startTime
      }
    } catch (error) {
      return this.handleError(error, request, startTime)
    }
  }

  private async routeToService(
    request: AIFlowRequest, 
    context: SecurityContext
  ): Promise<AIResult> {
    const [service, method] = request.workflow.split('.')
    
    switch (service) {
      case 'fingpt':
        return this.routeToFinGPT(method, request, context)
      case 'finrobot':
        return this.routeToFinRobot(method, request, context)
      case 'idurar':
        return this.routeToIDURAR(method, request, context)
      case 'erpnext':
        return this.routeToERPNext(method, request, context)
      case 'dolibarr':
        return this.routeToDolibarr(method, request, context)
      default:
        throw new Error(`Unknown service: ${service}`)
    }
  }

  private async routeToFinGPT(
    method: string,
    request: AIFlowRequest,
    context: SecurityContext
  ): Promise<AIResult> {
    switch (method) {
      case 'sentiment':
        const sentiment = await this.aiServices.fingpt.sentimentAnalysis(
          request.data.text,
          context
        )
        return {
          success: true,
          data: sentiment,
          confidence: sentiment.confidence,
          insights: [`Sentiment: ${sentiment.sentiment}`, sentiment.reasoning],
          tokensUsed: 100, // Estimate
          cacheHit: false,
          fallbackUsed: false,
          executionTime: 0
        }
      
      case 'anomaly':
        const anomalies = await this.aiServices.fingpt.anomalyDetection(
          request.data.dataset,
          context
        )
        return {
          success: true,
          data: anomalies,
          confidence: 0.9,
          insights: anomalies.patterns,
          warnings: anomalies.anomalies.map(a => 
            `${a.type} anomaly detected with ${a.severity} severity`
          ),
          tokensUsed: 200,
          cacheHit: false,
          fallbackUsed: false,
          executionTime: 0
        }
      
      default:
        throw new Error(`Unknown FinGPT method: ${method}`)
    }
  }

  private async routeToFinRobot(
    method: string,
    request: AIFlowRequest,
    context: SecurityContext
  ): Promise<AIResult> {
    switch (method) {
      case 'portfolio':
        const portfolio = await this.aiServices.finrobot.portfolioOptimization(
          request.data.assets,
          request.data.constraints
        )
        return {
          success: true,
          data: portfolio,
          confidence: 0.95,
          insights: [
            `Optimized portfolio with Sharpe ratio: ${portfolio.sharpeRatio}`,
            `Expected return: ${portfolio.expectedReturn}%`
          ],
          recommendations: Object.entries(portfolio.optimalWeights).map(
            ([asset, weight]) => `Allocate ${(weight * 100).toFixed(1)}% to ${asset}`
          ),
          tokensUsed: 150,
          cacheHit: false,
          fallbackUsed: false,
          executionTime: 0
        }
      
      default:
        throw new Error(`Unknown FinRobot method: ${method}`)
    }
  }

  private async routeToIDURAR(
    method: string,
    request: AIFlowRequest,
    context: SecurityContext
  ): Promise<AIResult> {
    switch (method) {
      case 'customer':
        const customer = await this.aiServices.idurar.customerIntelligence(
          request.data.customerId
        )
        return {
          success: true,
          data: customer,
          confidence: 0.85,
          insights: [
            `Customer segment: ${customer.profile.segment}`,
            `Churn risk: ${(customer.profile.churn_risk * 100).toFixed(1)}%`
          ],
          recommendations: customer.recommendations,
          tokensUsed: 120,
          cacheHit: false,
          fallbackUsed: false,
          executionTime: 0
        }
      
      default:
        throw new Error(`Unknown IDURAR method: ${method}`)
    }
  }

  private async routeToERPNext(
    method: string,
    request: AIFlowRequest,
    context: SecurityContext
  ): Promise<AIResult> {
    switch (method) {
      case 'automation':
        const automation = await this.aiServices.erpnext.processAutomation(
          request.data.workflow,
          request.data.processData
        )
        return {
          success: true,
          data: automation,
          confidence: automation.confidence,
          insights: [
            `${automation.automatedSteps.length} steps automated`,
            `Estimated time saved: ${automation.estimatedTimeSaved} hours`
          ],
          tokensUsed: 180,
          cacheHit: false,
          fallbackUsed: false,
          executionTime: 0
        }
      
      default:
        throw new Error(`Unknown ERPNext method: ${method}`)
    }
  }

  private async routeToDolibarr(
    method: string,
    request: AIFlowRequest,
    context: SecurityContext
  ): Promise<AIResult> {
    switch (method) {
      case 'lead':
        const lead = await this.aiServices.dolibarr.leadScoring(request.data.lead)
        return {
          success: true,
          data: lead,
          confidence: lead.conversionProbability,
          insights: [
            `Lead score: ${lead.score}/100`,
            `Estimated value: $${lead.estimatedValue.toLocaleString()}`
          ],
          recommendations: lead.recommendedActions,
          tokensUsed: 90,
          cacheHit: false,
          fallbackUsed: false,
          executionTime: 0
        }
      
      default:
        throw new Error(`Unknown Dolibarr method: ${method}`)
    }
  }

  private handleError(error: any, request: AIFlowRequest, startTime: number): AIResult {
    console.error(`AI workflow error for ${request.workflow}:`, error)
    
    return {
      success: false,
      data: null,
      confidence: 0,
      insights: [],
      errors: [error.message || 'Unknown error occurred'],
      executionTime: Date.now() - startTime,
      tokensUsed: 0,
      cacheHit: false,
      fallbackUsed: false
    }
  }

  private generateCacheKey(request: AIFlowRequest): string {
    return `ai:${request.workflow}:${request.context.tenantId}:${JSON.stringify(request.data)}`
  }

  private getCacheTTL(workflow: string): number {
    // Different TTLs for different workflow types
    const ttlMap: Record<string, number> = {
      'fingpt.sentiment': 3600, // 1 hour
      'fingpt.anomaly': 1800, // 30 minutes
      'finrobot.portfolio': 7200, // 2 hours
      'idurar.customer': 3600, // 1 hour
      'erpnext.automation': 86400, // 24 hours
      'dolibarr.lead': 1800 // 30 minutes
    }
    
    return ttlMap[workflow] || 3600 // Default 1 hour
  }
}