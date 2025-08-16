/**
 * CoreFlow360 - Subscription-Aware AI Orchestration Test Suite
 * Tests AI behavior adapts correctly based on active modules
 */

import { describe, it, expect, beforeEach, vi } from '@jest/globals'
import SubscriptionAwareAIOrchestrator from '@/ai/orchestration/subscription-aware-orchestrator'
import { TaskType } from '@/ai/orchestration/ai-agent-orchestrator'
import { moduleManager } from '@/services/subscription/module-manager'

// Mock dependencies
vi.mock('@/services/subscription/module-manager')
vi.mock('@/ai/orchestration/langchain-manager')
vi.mock('@/services/ai/ai-service-manager')
vi.mock('@/services/security/audit-logging')

describe('Subscription-Aware AI Orchestration', () => {
  let orchestrator: SubscriptionAwareAIOrchestrator
  const testTenantId = 'test-tenant-ai'

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock orchestrator initialization would go here
  })

  describe('Single Module AI Capabilities', () => {
    it('should provide CRM-only AI features when only CRM is active', async () => {
      vi.mocked(moduleManager.getActiveModules).mockResolvedValue(['crm'])

      const result = await orchestrator.orchestrateWithSubscriptionAwareness({
        tenantId: testTenantId,
        taskType: TaskType.ANALYZE_CUSTOMER,
        input: { customerId: '123' },
        context: {},
        requirements: {}
      })

      expect(result.modulesInvolved).toEqual(['crm'])
      expect(result.crossModuleInsights).toHaveLength(0)
      expect(result.agentsUsed).toContain('CRMAnalyticsAgent')
      expect(result.agentsUsed).not.toContain('AccountingAgent')
    })

    it('should provide accounting-only AI features when only accounting is active', async () => {
      vi.mocked(moduleManager.getActiveModules).mockResolvedValue(['accounting'])

      const result = await orchestrator.orchestrateWithSubscriptionAwareness({
        tenantId: testTenantId,
        taskType: TaskType.OPTIMIZE_PRICING,
        input: { productId: '456' },
        context: {},
        requirements: {}
      })

      expect(result.modulesInvolved).toEqual(['accounting'])
      expect(result.agentsUsed).toContain('AccountingAgent')
      expect(result.subscriptionLimitations).toContain('Cross-module revenue insights unavailable')
    })
  })

  describe('Cross-Module AI Capabilities', () => {
    it('should enable cross-module insights with CRM + Accounting', async () => {
      vi.mocked(moduleManager.getActiveModules).mockResolvedValue(['crm', 'accounting'])

      const result = await orchestrator.orchestrateWithSubscriptionAwareness({
        tenantId: testTenantId,
        taskType: TaskType.PREDICT_CHURN,
        input: { customerId: '123' },
        context: {},
        requirements: { crossModule: true }
      })

      expect(result.modulesInvolved).toContain('crm')
      expect(result.modulesInvolved).toContain('accounting')
      expect(result.crossModuleInsights).toHaveLength(1)
      expect(result.crossModuleInsights[0]).toMatchObject({
        type: 'revenue-behavior-correlation',
        confidence: expect.any(Number)
      })
    })

    it('should enable HR-CRM correlation with both modules active', async () => {
      vi.mocked(moduleManager.getActiveModules).mockResolvedValue(['hr', 'crm'])

      const result = await orchestrator.orchestrateWithSubscriptionAwareness({
        tenantId: testTenantId,
        taskType: TaskType.PERFORMANCE_ANALYSIS,
        input: { employeeId: '789' },
        context: {},
        requirements: { crossModule: true }
      })

      expect(result.crossModuleInsights).toContainEqual(
        expect.objectContaining({
          type: 'sales-performance-correlation'
        })
      )
    })

    it('should enable demand forecasting with CRM + Inventory + Projects', async () => {
      vi.mocked(moduleManager.getActiveModules).mockResolvedValue(['crm', 'inventory', 'projects'])

      const result = await orchestrator.orchestrateWithSubscriptionAwareness({
        tenantId: testTenantId,
        taskType: TaskType.FORECAST_DEMAND,
        input: { productId: '101' },
        context: {},
        requirements: { crossModule: true }
      })

      expect(result.modulesInvolved).toHaveLength(3)
      expect(result.data).toHaveProperty('forecastAccuracy')
      expect(result.data.forecastAccuracy).toBeGreaterThan(0.8)
    })
  })

  describe('AI Limitations Based on Subscriptions', () => {
    it('should limit AI capabilities when required modules are missing', async () => {
      vi.mocked(moduleManager.getActiveModules).mockResolvedValue(['crm']) // Missing accounting

      const result = await orchestrator.orchestrateWithSubscriptionAwareness({
        tenantId: testTenantId,
        taskType: TaskType.OPTIMIZE_PRICING, // Requires accounting
        input: { productId: '456' },
        context: {},
        requirements: {}
      })

      expect(result.success).toBe(false)
      expect(result.subscriptionLimitations).toContain('Accounting module required')
      expect(result.upgradeSuggestions).toContain('accounting')
    })

    it('should suggest module upgrades for enhanced capabilities', async () => {
      vi.mocked(moduleManager.getActiveModules).mockResolvedValue(['crm'])

      const result = await orchestrator.orchestrateWithSubscriptionAwareness({
        tenantId: testTenantId,
        taskType: TaskType.ANALYZE_CUSTOMER,
        input: { customerId: '123' },
        context: { requestEnhancedInsights: true },
        requirements: {}
      })

      expect(result.upgradeSuggestions).toContain('accounting')
      expect(result.upgradeSuggestions).toContain('marketing')
      expect(result.subscriptionLimitations).toContain('Enhanced customer insights require additional modules')
    })
  })

  describe('Workflow Orchestration', () => {
    it('should execute single-module workflow', async () => {
      vi.mocked(moduleManager.getActiveModules).mockResolvedValue(['crm'])

      const result = await orchestrator.orchestrateWithSubscriptionAwareness({
        tenantId: testTenantId,
        taskType: TaskType.AUTOMATE_WORKFLOW,
        input: { 
          workflow: 'lead-qualification',
          leadId: '123'
        },
        context: {},
        requirements: {}
      })

      expect(result.success).toBe(true)
      expect(result.data.workflowSteps).toBeDefined()
      expect(result.data.workflowSteps).toHaveLength(3) // Qualify, Score, Route
    })

    it('should execute cross-module workflow when modules available', async () => {
      vi.mocked(moduleManager.getActiveModules).mockResolvedValue(['crm', 'accounting'])

      const result = await orchestrator.orchestrateWithSubscriptionAwareness({
        tenantId: testTenantId,
        taskType: TaskType.AUTOMATE_WORKFLOW,
        input: { 
          workflow: 'quote-to-cash',
          quoteId: '456'
        },
        context: {},
        requirements: { crossModule: true }
      })

      expect(result.success).toBe(true)
      expect(result.data.workflowSteps).toContainEqual(
        expect.objectContaining({ module: 'crm' })
      )
      expect(result.data.workflowSteps).toContainEqual(
        expect.objectContaining({ module: 'accounting' })
      )
    })
  })

  describe('Performance Optimization', () => {
    it('should use minimal agents for single-module tasks', async () => {
      vi.mocked(moduleManager.getActiveModules).mockResolvedValue(['crm'])

      const startTime = Date.now()
      const result = await orchestrator.orchestrateWithSubscriptionAwareness({
        tenantId: testTenantId,
        taskType: TaskType.ANALYZE_CUSTOMER,
        input: { customerId: '123' },
        context: {},
        requirements: { maxExecutionTime: 1000 }
      })

      const executionTime = Date.now() - startTime

      expect(executionTime).toBeLessThan(1000)
      expect(result.agentsUsed).toHaveLength(1)
      expect(result.executionMetadata.executionTime).toBeLessThan(1000)
    })

    it('should parallelize cross-module operations', async () => {
      vi.mocked(moduleManager.getActiveModules).mockResolvedValue(['crm', 'accounting', 'hr'])

      const result = await orchestrator.orchestrateWithSubscriptionAwareness({
        tenantId: testTenantId,
        taskType: TaskType.CROSS_MODULE_SYNC,
        input: { syncAll: true },
        context: {},
        requirements: { crossModule: true }
      })

      expect(result.executionMetadata.parallelOperations).toBe(true)
      expect(result.executionMetadata.modulesProcessedInParallel).toBe(3)
    })
  })

  describe('Error Handling', () => {
    it('should handle module activation errors gracefully', async () => {
      vi.mocked(moduleManager.getActiveModules).mockRejectedValue(new Error('Database error'))

      const result = await orchestrator.orchestrateWithSubscriptionAwareness({
        tenantId: testTenantId,
        taskType: TaskType.ANALYZE_CUSTOMER,
        input: { customerId: '123' },
        context: {},
        requirements: {}
      })

      expect(result.success).toBe(false)
      expect(result.data.error).toContain('Failed to retrieve active modules')
    })

    it('should fallback to basic AI when advanced features fail', async () => {
      vi.mocked(moduleManager.getActiveModules).mockResolvedValue(['crm', 'accounting'])
      // Mock cross-module feature failure

      const result = await orchestrator.orchestrateWithSubscriptionAwareness({
        tenantId: testTenantId,
        taskType: TaskType.PREDICT_CHURN,
        input: { customerId: '123' },
        context: {},
        requirements: { crossModule: true }
      })

      expect(result.success).toBe(true)
      expect(result.subscriptionLimitations).toContain('Some cross-module features unavailable')
      expect(result.data.fallbackMode).toBe(true)
    })
  })
})