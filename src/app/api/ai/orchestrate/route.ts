/**
 * CoreFlow360 - AI Orchestration API
 * Subscription-aware AI orchestration with module filtering and cross-module workflows
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
// import SubscriptionAwareAIOrchestrator from '@/ai/orchestration/subscription-aware-orchestrator'
// import { TaskType, TaskPriority } from '@/ai/orchestration/ai-agent-orchestrator'
import { withTenant, withRateLimit, ApiContext } from '@/lib/api-wrapper'
import { redis, aiCache, cacheKey } from '@/lib/redis'
import { prisma } from '@/lib/db'

// Mock implementations for services that aren't fully implemented yet
const mockLangChainManager = {
  /* LangChain integration */
}
const mockAIServiceManager = {
  /* AI services integration */
}
const mockAuditLogger = { log: (msg: string, data?: unknown) => {} }
const mockRedis = redis // Use real Redis instance

// Initialize orchestrator (in production, this would be a singleton)
let orchestrator: SubscriptionAwareAIOrchestrator | null = null

const OrchestrationRequestSchema = z.object({
  taskType: z.enum([
    'ANALYZE_CUSTOMER',
    'PREDICT_CHURN',
    'RECOMMEND_ACTION',
    'OPTIMIZE_PRICING',
    'FORECAST_DEMAND',
    'DETECT_ANOMALY',
    'AUTOMATE_WORKFLOW',
    'CROSS_MODULE_SYNC',
    'COMPLIANCE_CHECK',
    'PERFORMANCE_ANALYSIS',
  ]),
  input: z.record(z.unknown()),
  context: z.record(z.unknown()).optional().default({}),
  requirements: z
    .object({
      maxExecutionTime: z.number().optional().default(30000),
      accuracyThreshold: z.number().min(0).max(1).optional().default(0.8),
      costBudget: z.number().positive().optional(),
      explainability: z.boolean().optional().default(true),
      realTime: z.boolean().optional().default(false),
      crossModule: z.boolean().optional().default(true),
    })
    .optional()
    .default({}),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional().default('MEDIUM'),
})

async function getOrchestrator(): Promise<SubscriptionAwareAIOrchestrator> {
  if (!orchestrator) {
    orchestrator = new SubscriptionAwareAIOrchestrator(
      mockLangChainManager,
      mockAIServiceManager,
      mockAuditLogger,
      prisma,
      mockRedis
    )
  }

  return orchestrator
}

const handlePOST = async (context: ApiContext): Promise<NextResponse> => {
  const { request, user, tenantId } = context

  const body = await request.json()
  const validatedData = OrchestrationRequestSchema.parse(body)

  const { taskType, input, context: requestContext, requirements, priority } = validatedData

  // Generate cache key for this request
  const requestHash = crypto
    .createHash('sha256')
    .update(JSON.stringify({ taskType, input, requirements, tenantId }))
    .digest('hex')

  const aiCacheKey = cacheKey('orchestration', taskType, requestHash)

  // Try to get from cache first (for non-real-time requests)
  if (!requirements?.realTime) {
    const cached = await aiCache.get(aiCacheKey, tenantId!)
    if (cached) {
      return NextResponse.json({
        ...cached,
        cached: true,
        timestamp: new Date().toISOString(),
      })
    }
  }

  // Get orchestrator instance
  const aiOrchestrator = await getOrchestrator()

  // Convert string enums to proper types
  const taskTypeEnum = TaskType[taskType as keyof typeof TaskType]
  const priorityEnum = TaskPriority[priority as keyof typeof TaskPriority]

  // Execute subscription-aware orchestration
  const result = await aiOrchestrator.orchestrateWithSubscriptionAwareness({
    tenantId: tenantId!,
    taskType: taskTypeEnum,
    input,
    context: {
      ...requestContext,
      userId: user.id,
      userRole: user.role,
      requestTimestamp: new Date().toISOString(),
    },
    requirements,
    userId: user.id,
  })

  const response = {
    success: result.success,
    orchestrationId: `orch-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    tenantId,
    result: {
      data: result.data,
      confidence: result.confidence,
      agentsUsed: result.agentsUsed,
      modulesInvolved: result.modulesInvolved,
      crossModuleInsights: result.crossModuleInsights,
      subscriptionLimitations: result.subscriptionLimitations,
      upgradeSuggestions: result.upgradeSuggestions,
      executionMetadata: result.executionMetadata,
    },
    cached: false,
    timestamp: new Date().toISOString(),
  }

  // Cache successful results (for 30 minutes)
  if (result.success && !requirements?.realTime) {
    await aiCache.set(aiCacheKey, response, tenantId!)
  }

  return NextResponse.json(response)
}

const handleGET = async (context: ApiContext): Promise<NextResponse> => {
  const { tenantId } = context

  // Cache key for tenant AI capabilities
  const capabilitiesCacheKey = cacheKey('ai-capabilities', tenantId!)

  // Try to get from cache first (cached for 5 minutes)
  const cached = await redis.get(capabilitiesCacheKey, { tenantId: tenantId!, ttl: 300 })
  if (cached) {
    return NextResponse.json({
      ...cached,
      cached: true,
      timestamp: new Date().toISOString(),
    })
  }

  // Get available agents and capabilities for tenant
  const aiOrchestrator = await getOrchestrator()
  const subscriptionDetails = await (aiOrchestrator as unknown).getTenantSubscriptionDetails(
    tenantId
  )
  const availableAgents = await (aiOrchestrator as unknown).getAvailableAgentsForSubscription(
    subscriptionDetails.activeModules,
    subscriptionDetails.subscriptionTier
  )

  const response = {
    tenantId,
    subscription: {
      tier: subscriptionDetails.subscriptionTier,
      activeModules: subscriptionDetails.activeModules,
      moduleCount: subscriptionDetails.activeModules.length,
    },
    aiCapabilities: {
      availableAgents: availableAgents.map((agent: unknown) => ({
        id: agent.id,
        name: agent.name,
        type: agent.type,
        capabilities: agent.capabilities,
      })),
      crossModuleCapabilities: (aiOrchestrator as unknown).getCrossModuleCapabilities(
        subscriptionDetails.activeModules,
        TaskType.ANALYZE_CUSTOMER
      ),
      _supportedTaskTypes: availableAgents.reduce((tasks: string[], _agent: unknown) => {
        // Add task types this agent can handle
        return tasks
      }, []),
    },
    limits: {
      maxConcurrentTasks: availableAgents.reduce(
        (sum: number, agent: unknown) => sum + agent.maxConcurrentTasks,
        0
      ),
      estimatedCostPerOperation:
        availableAgents.length > 0
          ? availableAgents.reduce(
              (sum: number, agent: unknown) => sum + agent.performanceTargets.costPerOperation,
              0
            ) / availableAgents.length
          : 0,
    },
    cached: false,
    timestamp: new Date().toISOString(),
  }

  // Cache the response
  await redis.set(capabilitiesCacheKey, response, { tenantId: tenantId!, ttl: 300 })

  return NextResponse.json(response)
}

// Export wrapped handlers with comprehensive error handling
export const POST = withRateLimit(
  withTenant(handlePOST),
  10, // 10 requests per minute
  60000,
  'ai-orchestrate'
)

export const GET = withTenant(handleGET)
