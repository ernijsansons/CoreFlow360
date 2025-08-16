/**
 * CoreFlow360 - AI Performance Tracker
 * Tracks and monitors AI service performance
 */

import { AIRequestLog, AIPerformanceMetrics } from '../contexts/ai-flow-context'

export class PerformanceTracker {
  private logs: AIRequestLog[] = []
  private maxLogs: number = 10000

  logRequest(log: AIRequestLog): void {
    this.logs.push(log)
    
    // Prune old logs if necessary
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }
  }

  getMetrics(timeWindow?: number): AIPerformanceMetrics {
    const now = Date.now()
    const window = timeWindow || 3600000 // Default 1 hour
    
    const recentLogs = this.logs.filter(
      log => now - log.timestamp.getTime() < window
    )

    if (recentLogs.length === 0) {
      return this.getEmptyMetrics()
    }

    // Calculate metrics
    const totalRequests = recentLogs.length
    const successfulRequests = recentLogs.filter(log => log.success).length
    const errorRate = (totalRequests - successfulRequests) / totalRequests

    // Latency calculations
    const latencies = recentLogs.map(log => log.executionTime).sort((a, b) => a - b)
    const averageLatency = latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length
    const p95Latency = latencies[Math.floor(latencies.length * 0.95)] || averageLatency
    const p99Latency = latencies[Math.floor(latencies.length * 0.99)] || p95Latency

    // Cache hit rate
    const cacheHits = recentLogs.filter(log => log.cacheHit).length
    const cacheHitRate = cacheHits / totalRequests

    // Token usage
    const totalTokens = recentLogs.reduce((sum, log) => sum + log.tokensUsed, 0)
    const tokensByModel = this.calculateTokensByModel(recentLogs)

    // Cost estimate (simplified)
    const costEstimate = this.estimateCost(totalTokens)

    return {
      totalRequests,
      averageLatency,
      p95Latency,
      p99Latency,
      errorRate,
      cacheHitRate,
      tokenUsage: {
        total: totalTokens,
        byModel: tokensByModel
      },
      costEstimate
    }
  }

  getWorkflowMetrics(workflow: string, timeWindow?: number): {
    requests: number
    averageLatency: number
    errorRate: number
    cacheHitRate: number
  } {
    const now = Date.now()
    const window = timeWindow || 3600000
    
    const workflowLogs = this.logs.filter(
      log => log.workflow === workflow && now - log.timestamp.getTime() < window
    )

    if (workflowLogs.length === 0) {
      return { requests: 0, averageLatency: 0, errorRate: 0, cacheHitRate: 0 }
    }

    const requests = workflowLogs.length
    const averageLatency = workflowLogs.reduce((sum, log) => sum + log.executionTime, 0) / requests
    const errors = workflowLogs.filter(log => !log.success).length
    const errorRate = errors / requests
    const cacheHits = workflowLogs.filter(log => log.cacheHit).length
    const cacheHitRate = cacheHits / requests

    return {
      requests,
      averageLatency,
      errorRate,
      cacheHitRate
    }
  }

  private calculateTokensByModel(logs: AIRequestLog[]): Record<string, number> {
    const tokensByModel: Record<string, number> = {}
    
    logs.forEach(log => {
      const model = this.getModelFromWorkflow(log.workflow)
      tokensByModel[model] = (tokensByModel[model] || 0) + log.tokensUsed
    })
    
    return tokensByModel
  }

  private getModelFromWorkflow(workflow: string): string {
    const [service] = workflow.split('.')
    return service || 'unknown'
  }

  private estimateCost(totalTokens: number): number {
    // Simplified cost calculation
    const costPer1kTokens = 0.01 // $0.01 per 1k tokens
    return (totalTokens / 1000) * costPer1kTokens
  }

  private getEmptyMetrics(): AIPerformanceMetrics {
    return {
      totalRequests: 0,
      averageLatency: 0,
      p95Latency: 0,
      p99Latency: 0,
      errorRate: 0,
      cacheHitRate: 0,
      tokenUsage: {
        total: 0,
        byModel: {}
      },
      costEstimate: 0
    }
  }

  clearLogs(): void {
    this.logs = []
  }

  exportLogs(): AIRequestLog[] {
    return [...this.logs]
  }
}