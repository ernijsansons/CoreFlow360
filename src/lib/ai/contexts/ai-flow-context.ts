/**
 * CoreFlow360 - AI Flow Context Types
 * Defines the context and request types for AI workflows
 */

// ============================================================================
// AI FLOW CONTEXT
// ============================================================================

export interface AIFlowContext {
  tenantId: string
  userId: string
  activeBundles: string[]
  industry: string
  department?: string
  sessionId: string
  metadata: Record<string, unknown>
}

export interface AIFlowRequest {
  workflow: string
  data: unknown
  context: AIFlowContext
  priority: 'low' | 'medium' | 'high' | 'critical'
  timeout?: number
  fallbackStrategy?: 'basic_llm' | 'cached_result' | 'user_prompt' | 'skip'
}

export interface AIResult {
  success: boolean
  data: unknown
  confidence: number
  insights: string[]
  predictions?: unknown[]
  recommendations?: string[]
  crossDeptImpact?: CrossDeptImpact[]
  executionTime: number
  tokensUsed: number
  cacheHit: boolean
  fallbackUsed: boolean
  errors?: string[]
  warnings?: string[]
}

export interface CrossDeptImpact {
  department: string
  impact: 'positive' | 'negative' | 'neutral'
  severity: 'low' | 'medium' | 'high'
  description: string
  recommendedActions: string[]
  confidence: number
}

export interface AIModelMetrics {
  modelId: string
  requestCount: number
  averageLatency: number
  errorRate: number
  confidenceScores: number[]
  cacheHitRatio: number
  lastUsed: Date
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

export interface AIPerformanceMetrics {
  totalRequests: number
  averageLatency: number
  p95Latency: number
  p99Latency: number
  errorRate: number
  cacheHitRate: number
  tokenUsage: {
    total: number
    byModel: Record<string, number>
  }
  costEstimate: number
}

export interface AIRequestLog {
  id: string
  timestamp: Date
  workflow: string
  context: AIFlowContext
  executionTime: number
  tokensUsed: number
  success: boolean
  error?: string
  cacheHit: boolean
  fallbackUsed: boolean
}
