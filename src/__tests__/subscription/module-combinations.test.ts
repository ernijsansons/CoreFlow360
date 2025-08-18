/**
 * CoreFlow360 - Module Combinations Test Suite
 * Tests all possible module combinations and their interactions
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { moduleManager } from '@/services/subscription/module-manager'
import { eventBus } from '@/services/events/subscription-aware-event-bus'
import { workflowEngine } from '@/services/workflows/cross-module-workflows'
import { prisma } from '@/lib/db'

describe('Module Combinations Test Suite', () => {
  const testTenantId = 'test-tenant-combinations'
  const allModules = ['crm', 'accounting', 'hr', 'inventory', 'projects', 'marketing']
  
  beforeEach(async () => {
    // Create test tenant subscription
    await prisma.tenantSubscription.create({
      data: {
        tenantId: testTenantId,
        subscriptionTier: 'test',
        activeModules: JSON.stringify({}),
        pricingPlan: JSON.stringify({ test: true }),
        billingCycle: 'monthly',
        status: 'active'
      }
    })
    
    // Clear event bus cache
    eventBus.clearTenantCache()
  })

  afterEach(async () => {
    // Clean up test data
    await prisma.subscriptionEvent.deleteMany({
      where: { tenantSubscriptionId: testTenantId }
    })
    
    await prisma.tenantSubscription.delete({
      where: { tenantId: testTenantId }
    })
  })

  describe('Single Module Activation', () => {
    allModules.forEach(module => {
      it(`should activate ${module} module independently`, async () => {
        const result = await moduleManager.activateModule(testTenantId, module)
        
        expect(result.success).toBe(true)
        expect(result.activeModules).toContain(module)
        expect(result.activeModules.length).toBe(1)
        
        // Verify module is active
        const isActive = await moduleManager.isModuleActive(testTenantId, module)
        expect(isActive).toBe(true)
      })
    })
  })

  describe('Two-Module Combinations', () => {
    const twoModuleCombos = [
      ['crm', 'accounting'],
      ['crm', 'hr'],
      ['crm', 'inventory'],
      ['accounting', 'inventory'],
      ['hr', 'projects'],
      ['projects', 'marketing']
    ]

    twoModuleCombos.forEach(([module1, module2]) => {
      it(`should activate ${module1} + ${module2} combination`, async () => {
        // Activate first module
        await moduleManager.activateModule(testTenantId, module1)
        
        // Activate second module
        const result = await moduleManager.activateModule(testTenantId, module2)
        
        expect(result.success).toBe(true)
        expect(result.activeModules).toContain(module1)
        expect(result.activeModules).toContain(module2)
        expect(result.activeModules.length).toBe(2)
        
        // Verify cross-module events are enabled
        const crossModuleEnabled = await eventBus.enableCrossModuleEvents(
          module1,
          module2,
          testTenantId
        )
        expect(crossModuleEnabled).toBe(true)
      })
    })
  })

  describe('Bundle Activations', () => {
    const bundles = [
      {
        name: 'Starter Bundle',
        modules: ['crm', 'accounting']
      },
      {
        name: 'Professional Bundle',
        modules: ['crm', 'accounting', 'hr', 'projects']
      },
      {
        name: 'Enterprise Bundle',
        modules: allModules
      }
    ]

    bundles.forEach(bundle => {
      it(`should activate ${bundle.name} with all modules`, async () => {
        // Activate all modules in bundle
        for (const moduleName of bundle.modules) {
          await moduleManager.activateModule(testTenantId, moduleName)
        }
        
        const activeModules = await moduleManager.getActiveModules(testTenantId)
        expect(activeModules.length).toBe(bundle.modules.length)
        
        bundle.modules.forEach(module => {
          expect(activeModules).toContain(module)
        })
      })
    })
  })

  describe('Cross-Module Workflows', () => {
    it('should enable Lead to Cash workflow with CRM + Accounting', async () => {
      // Activate required modules
      await moduleManager.activateModule(testTenantId, 'crm')
      await moduleManager.activateModule(testTenantId, 'accounting')
      
      // Get available workflows
      const workflows = await workflowEngine.getActiveWorkflows(testTenantId)
      
      const leadToCash = workflows.find(w => w.id === 'lead-to-cash')
      expect(leadToCash).toBeDefined()
      expect(leadToCash?.requiredModules).toEqual(['crm', 'accounting'])
    })

    it('should enable Demand Forecasting with CRM + Inventory + Projects', async () => {
      // Activate required modules
      await moduleManager.activateModule(testTenantId, 'crm')
      await moduleManager.activateModule(testTenantId, 'inventory')
      await moduleManager.activateModule(testTenantId, 'projects')
      
      // Get available workflows
      const workflows = await workflowEngine.getActiveWorkflows(testTenantId)
      
      const demandForecast = workflows.find(w => w.id === 'demand-forecast')
      expect(demandForecast).toBeDefined()
      expect(demandForecast?.requiredModules).toEqual(['crm', 'inventory', 'projects'])
    })

    it('should enable Performance-Sales workflow with HR + CRM', async () => {
      // Activate required modules
      await moduleManager.activateModule(testTenantId, 'hr')
      await moduleManager.activateModule(testTenantId, 'crm')
      
      // Get available workflows
      const workflows = await workflowEngine.getActiveWorkflows(testTenantId)
      
      const perfSales = workflows.find(w => w.id === 'performance-sales')
      expect(perfSales).toBeDefined()
      expect(perfSales?.requiredModules).toEqual(['hr', 'crm'])
    })
  })

  describe('Module Deactivation', () => {
    it('should deactivate module and maintain other active modules', async () => {
      // Activate multiple modules
      await moduleManager.activateModule(testTenantId, 'crm')
      await moduleManager.activateModule(testTenantId, 'accounting')
      await moduleManager.activateModule(testTenantId, 'hr')
      
      // Deactivate one module
      const result = await moduleManager.deactivateModule(testTenantId, 'accounting')
      
      expect(result.success).toBe(true)
      expect(result.activeModules).toContain('crm')
      expect(result.activeModules).toContain('hr')
      expect(result.activeModules).not.toContain('accounting')
      expect(result.activeModules.length).toBe(2)
    })

    it('should disable workflows when required module is deactivated', async () => {
      // Activate modules for workflow
      await moduleManager.activateModule(testTenantId, 'crm')
      await moduleManager.activateModule(testTenantId, 'accounting')
      
      // Verify workflow is available
      let workflows = await workflowEngine.getActiveWorkflows(testTenantId)
      expect(workflows.some(w => w.id === 'lead-to-cash')).toBe(true)
      
      // Deactivate required module
      await moduleManager.deactivateModule(testTenantId, 'accounting')
      
      // Verify workflow is no longer available
      workflows = await workflowEngine.getActiveWorkflows(testTenantId)
      expect(workflows.some(w => w.id === 'lead-to-cash')).toBe(false)
    })
  })

  describe('Module Dependencies', () => {
    it('should handle module dependencies correctly', async () => {
      // If we had module dependencies, test them here
      // For now, all modules are independent
      const result = await moduleManager.checkModuleDependencies('crm')
      expect(result).toEqual([]) // No dependencies
    })
  })

  describe('Subscription Events', () => {
    it('should log events for all module activations', async () => {
      // Activate modules
      await moduleManager.activateModule(testTenantId, 'crm')
      await moduleManager.activateModule(testTenantId, 'accounting')
      
      // Check events
      const events = await prisma.subscriptionEvent.findMany({
        where: { tenantSubscriptionId: testTenantId },
        orderBy: { createdAt: 'asc' }
      })
      
      expect(events.length).toBeGreaterThanOrEqual(2)
      expect(events[0].eventType).toBe('module_activated')
      expect(JSON.parse(events[0].newState).module).toBe('crm')
    })
  })

  describe('Edge Cases', () => {
    it('should handle activating already active module', async () => {
      // Activate module
      await moduleManager.activateModule(testTenantId, 'crm')
      
      // Try to activate again
      const result = await moduleManager.activateModule(testTenantId, 'crm')
      
      expect(result.success).toBe(true)
      expect(result.message).toContain('already active')
      expect(result.activeModules.length).toBe(1)
    })

    it('should handle deactivating inactive module', async () => {
      // Try to deactivate module that's not active
      const result = await moduleManager.deactivateModule(testTenantId, 'crm')
      
      expect(result.success).toBe(true)
      expect(result.message).toContain('not active')
      expect(result.activeModules.length).toBe(0)
    })

    it('should handle rapid activation/deactivation', async () => {
      // Rapidly toggle modules
      const promises = []
      
      for (let i = 0; i < 5; i++) {
        promises.push(moduleManager.activateModule(testTenantId, 'crm'))
        promises.push(moduleManager.deactivateModule(testTenantId, 'crm'))
      }
      
      await Promise.all(promises)
      
      // Final state should be consistent
      const activeModules = await moduleManager.getActiveModules(testTenantId)
      expect(activeModules.length).toBeLessThanOrEqual(1)
    })
  })
})