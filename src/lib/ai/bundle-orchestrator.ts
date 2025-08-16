/**
 * CoreFlow360 - AI Bundle Orchestrator
 * Mathematical perfection for AI-first bundle orchestration
 * FORTRESS-LEVEL SECURITY: Zero-trust AI operations
 * HYPERSCALE PERFORMANCE: Sub-100ms AI routing
 */

import { 
  BundleDefinition, 
  AICapability, 
  SecurityContext, 
  PerformanceBudgets,
  getBundleById,
  validateBundleCompatibility,
  BundleId,
  AI_CAPABILITIES
} from '@/types/bundles'

import { 
  AIFlowContext, 
  AIFlowRequest, 
  AIResult,
  AIRequestLog
} from './contexts/ai-flow-context'

import { UnifiedAIService } from './interfaces/ai-services'
import { WorkflowRouter } from './orchestration/workflow-router'
import { PerformanceTracker } from './monitoring/performance-tracker'
import { AICache } from './cache/ai-cache'
import { 
  createSecurityContext, 
  validateSecurityContext,
  sanitizeContextForLogging,
  hasPermission,
  createRateLimitKey,
  getRateLimitForTier
} from './security/context-validator'

// Import external service implementations
import { createFinGPTService } from './services/fingpt-service'
import { createFinRobotService } from './services/finrobot-service'
import { createIDURARService } from './services/idurar-service'
import { createERPNextService } from './services/erpnext-service'
import { createDolibarrService } from './services/dolibarr-service'

// ============================================================================
// AI BUNDLE ORCHESTRATOR
// ============================================================================

export class AIBundleOrchestrator {
  private router: WorkflowRouter
  private performanceTracker: PerformanceTracker
  private cache: AICache
  private rateLimitMap: Map<string, { count: number; resetTime: number }> = new Map()

  constructor() {
    // Initialize AI services
    const aiServices: UnifiedAIService = {
      fingpt: createFinGPTService(),
      finrobot: createFinRobotService(),
      idurar: createIDURARService(),
      erpnext: createERPNextService(),
      dolibarr: createDolibarrService()
    }

    // Initialize components
    this.cache = new AICache({ max: 5000, ttl: 3600000 }) // 1 hour default TTL
    this.router = new WorkflowRouter(aiServices, this.cache)
    this.performanceTracker = new PerformanceTracker()

    // Start periodic cleanup
    this.startPeriodicCleanup()
  }

  /**
   * Execute AI workflow with bundle validation
   */
  async executeWorkflow(request: AIFlowRequest): Promise<AIResult> {
    const startTime = Date.now()
    const requestId = `${request.workflow}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    try {
      // Create and validate security context
      const securityContext = createSecurityContext(request.context)
      if (!validateSecurityContext(securityContext)) {
        throw new Error('Invalid security context')
      }

      // Check rate limits
      await this.checkRateLimit(securityContext)

      // Validate bundle access
      await this.validateBundleAccess(request)

      // Route the request
      const result = await this.router.route(request)

      // Log the request
      const log: AIRequestLog = {
        id: requestId,
        timestamp: new Date(),
        workflow: request.workflow,
        context: request.context,
        executionTime: Date.now() - startTime,
        tokensUsed: result.tokensUsed,
        success: result.success,
        error: result.errors?.[0],
        cacheHit: result.cacheHit,
        fallbackUsed: result.fallbackUsed
      }
      this.performanceTracker.logRequest(log)

      // Audit log if required
      if (securityContext.auditLog) {
        await this.auditLog(securityContext, request, result)
      }

      return result

    } catch (error) {
      // Log error
      const log: AIRequestLog = {
        id: requestId,
        timestamp: new Date(),
        workflow: request.workflow,
        context: request.context,
        executionTime: Date.now() - startTime,
        tokensUsed: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        cacheHit: false,
        fallbackUsed: false
      }
      this.performanceTracker.logRequest(log)

      return {
        success: false,
        data: null,
        confidence: 0,
        insights: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        executionTime: Date.now() - startTime,
        tokensUsed: 0,
        cacheHit: false,
        fallbackUsed: false
      }
    }
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(timeWindow?: number) {
    return this.performanceTracker.getMetrics(timeWindow)
  }

  /**
   * Get workflow-specific metrics
   */
  getWorkflowMetrics(workflow: string, timeWindow?: number) {
    return this.performanceTracker.getWorkflowMetrics(workflow, timeWindow)
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    await this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats()
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private async validateBundleAccess(request: AIFlowRequest): Promise<void> {
    const [service] = request.workflow.split('.')
    const requiredBundle = this.getRequiredBundleForService(service)
    
    if (requiredBundle && !request.context.activeBundles.includes(requiredBundle)) {
      throw new Error(`Bundle ${requiredBundle} is required for ${service} workflows`)
    }
  }

  private getRequiredBundleForService(service: string): string | null {
    const bundleMap: Record<string, string> = {
      fingpt: 'enterprise',
      finrobot: 'enterprise',
      idurar: 'business',
      erpnext: 'business',
      dolibarr: 'starter'
    }
    
    return bundleMap[service] || null
  }

  private async checkRateLimit(context: SecurityContext): Promise<void> {
    const key = createRateLimitKey(context)
    const limits = getRateLimitForTier(context.rateLimitTier)
    const now = Date.now()
    
    let rateLimitInfo = this.rateLimitMap.get(key)
    
    if (!rateLimitInfo || rateLimitInfo.resetTime < now) {
      rateLimitInfo = {
        count: 0,
        resetTime: now + limits.window
      }
    }
    
    if (rateLimitInfo.count >= limits.requests) {
      throw new Error('Rate limit exceeded')
    }
    
    rateLimitInfo.count++
    this.rateLimitMap.set(key, rateLimitInfo)
  }

  private async auditLog(
    context: SecurityContext,
    request: AIFlowRequest,
    result: AIResult
  ): Promise<void> {
    const sanitizedContext = sanitizeContextForLogging(context)
    
    console.log('AI Audit Log:', {
      context: sanitizedContext,
      workflow: request.workflow,
      success: result.success,
      executionTime: result.executionTime,
      tokensUsed: result.tokensUsed,
      cacheHit: result.cacheHit
    })
  }

  private startPeriodicCleanup(): void {
    // Clean up rate limit map every 5 minutes
    setInterval(() => {
      const now = Date.now()
      for (const [key, info] of this.rateLimitMap.entries()) {
        if (info.resetTime < now) {
          this.rateLimitMap.delete(key)
        }
      }
    }, 5 * 60 * 1000)

    // Prune cache every hour
    setInterval(() => {
      this.cache.prune()
    }, 60 * 60 * 1000)
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let orchestratorInstance: AIBundleOrchestrator | null = null

export function getAIOrchestrator(): AIBundleOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new AIBundleOrchestrator()
  }
  return orchestratorInstance
}

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

export { 
  AIFlowContext, 
  AIFlowRequest, 
  AIResult,
  createSecurityContext,
  validateSecurityContext,
  hasPermission
}