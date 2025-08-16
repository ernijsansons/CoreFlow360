/**
 * CoreFlow360 - Module Manager Service  
 * Dynamic activation/deactivation of modules based on subscriptions
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface ModuleManager {
  activateModule(tenantId: string, moduleKey: string): Promise<void>
  deactivateModule(tenantId: string, moduleKey: string): Promise<void>
  isModuleActive(tenantId: string, moduleKey: string): Promise<boolean>
  getActiveModules(tenantId: string): Promise<string[]>
  validateModuleDependencies(modules: string[]): Promise<ValidationResult>
  getModuleCapabilities(tenantId: string, moduleKey: string): Promise<ModuleCapabilities | null>
  updateSubscriptionModules(tenantId: string, modules: string[]): Promise<SubscriptionUpdateResult>
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

export interface ModuleCapabilities {
  aiCapabilities: Record<string, boolean>
  featureFlags: Record<string, boolean>
  crossModuleEvents: string[]
  apiEndpoints: string[]
  uiComponents: string[]
}

export interface SubscriptionUpdateResult {
  success: boolean
  activatedModules: string[]
  deactivatedModules: string[]
  errors: string[]
  warnings: string[]
  newActiveModules: string[]
}

export class CoreFlowModuleManager implements ModuleManager {
  constructor(private tenantId?: string) {}

  /**
   * Activate a module for a specific tenant
   */
  async activateModule(tenantId: string, moduleKey: string): Promise<void> {
    // Validate module exists and is available
    const moduleDefinition = await prisma.moduleDefinition.findUnique({
      where: { moduleKey, isActive: true }
    })

    if (!moduleDefinition) {
      throw new Error(`Module '${moduleKey}' not found or inactive`)
    }

    // Get current subscription
    let subscription = await prisma.tenantSubscription.findUnique({
      where: { tenantId }
    })

    // Create subscription if it doesn't exist
    if (!subscription) {
      subscription = await prisma.tenantSubscription.create({
        data: {
          tenantId,
          subscriptionTier: 'basic',
          activeModules: JSON.stringify({ [moduleKey]: true }),
          pricingPlan: JSON.stringify({}),
          billingCycle: 'monthly',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }
      })
    }

    // Parse current active modules
    const activeModules = JSON.parse(subscription.activeModules) as Record<string, boolean>
    
    // Check if already active
    if (activeModules[moduleKey]) {
      console.log(`Module '${moduleKey}' is already active for tenant '${tenantId}'`)
      return
    }

    // Validate dependencies
    const currentModuleList = Object.keys(activeModules).filter(key => activeModules[key])
    const newModuleList = [...currentModuleList, moduleKey]
    
    const validation = await this.validateModuleDependencies(newModuleList)
    if (!validation.isValid) {
      throw new Error(`Dependency validation failed: ${validation.errors.join(', ')}`)
    }

    // Check enterprise restrictions
    if (moduleDefinition.enterpriseOnly && subscription.subscriptionTier !== 'enterprise') {
      throw new Error(`Module '${moduleKey}' requires enterprise subscription`)
    }

    // Check user count limits
    if (subscription.userCount < moduleDefinition.minUserCount) {
      throw new Error(`Module '${moduleKey}' requires at least ${moduleDefinition.minUserCount} users`)
    }

    if (moduleDefinition.maxUserCount && subscription.userCount > moduleDefinition.maxUserCount) {
      throw new Error(`Module '${moduleKey}' supports maximum ${moduleDefinition.maxUserCount} users`)
    }

    // Activate the module
    activeModules[moduleKey] = true
    
    await prisma.tenantSubscription.update({
      where: { tenantId },
      data: {
        activeModules: JSON.stringify(activeModules),
        updatedAt: new Date()
      }
    })

    // Create subscription event
    await this.logSubscriptionEvent(tenantId, 'module_activated', {
      moduleKey,
      previousState: subscription.activeModules,
      newState: JSON.stringify(activeModules)
    })

    // Trigger module initialization hooks
    await this.triggerModuleHooks(tenantId, moduleKey, 'activated')

    console.log(`✅ Module '${moduleKey}' activated for tenant '${tenantId}'`)
  }

  /**
   * Deactivate a module for a specific tenant
   */
  async deactivateModule(tenantId: string, moduleKey: string): Promise<void> {
    const subscription = await prisma.tenantSubscription.findUnique({
      where: { tenantId }
    })

    if (!subscription) {
      throw new Error(`No subscription found for tenant '${tenantId}'`)
    }

    const activeModules = JSON.parse(subscription.activeModules) as Record<string, boolean>
    
    if (!activeModules[moduleKey]) {
      console.log(`Module '${moduleKey}' is already inactive for tenant '${tenantId}'`)
      return
    }

    // Check for dependent modules
    const dependentModules = await this.findDependentModules(moduleKey, Object.keys(activeModules))
    if (dependentModules.length > 0) {
      throw new Error(`Cannot deactivate '${moduleKey}' - required by: ${dependentModules.join(', ')}`)
    }

    // Deactivate the module
    activeModules[moduleKey] = false
    
    await prisma.tenantSubscription.update({
      where: { tenantId },
      data: {
        activeModules: JSON.stringify(activeModules),
        updatedAt: new Date()
      }
    })

    // Create subscription event
    await this.logSubscriptionEvent(tenantId, 'module_deactivated', {
      moduleKey,
      previousState: subscription.activeModules,
      newState: JSON.stringify(activeModules)
    })

    // Trigger module cleanup hooks
    await this.triggerModuleHooks(tenantId, moduleKey, 'deactivated')

    console.log(`✅ Module '${moduleKey}' deactivated for tenant '${tenantId}'`)
  }

  /**
   * Check if a module is active for a tenant
   */
  async isModuleActive(tenantId: string, moduleKey: string): Promise<boolean> {
    const subscription = await prisma.tenantSubscription.findUnique({
      where: { tenantId }
    })

    if (!subscription) return false

    const activeModules = JSON.parse(subscription.activeModules) as Record<string, boolean>
    return activeModules[moduleKey] === true
  }

  /**
   * Get all active modules for a tenant
   */
  async getActiveModules(tenantId: string): Promise<string[]> {
    const subscription = await prisma.tenantSubscription.findUnique({
      where: { tenantId }
    })

    if (!subscription) return []

    const activeModules = JSON.parse(subscription.activeModules) as Record<string, boolean>
    return Object.keys(activeModules).filter(key => activeModules[key])
  }

  /**
   * Validate module dependencies
   */
  async validateModuleDependencies(modules: string[]): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []
    const suggestions: string[] = []

    // Fetch module definitions for all requested modules
    const moduleDefinitions = await prisma.moduleDefinition.findMany({
      where: { moduleKey: { in: modules }, isActive: true }
    })

    // Check if all requested modules exist
    const foundModules = moduleDefinitions.map(m => m.moduleKey)
    const missingModules = modules.filter(m => !foundModules.includes(m))
    
    if (missingModules.length > 0) {
      errors.push(`Modules not found: ${missingModules.join(', ')}`)
    }

    // Validate dependencies for each module
         for (const moduleDef of moduleDefinitions) {
       const dependencies = JSON.parse(moduleDef.dependencies || '[]') as string[]
       const conflicts = JSON.parse(moduleDef.conflicts || '[]') as string[]

      // Check dependencies
      for (const dependency of dependencies) {
        if (!modules.includes(dependency)) {
                   errors.push(`Module '${moduleDef.moduleKey}' requires '${dependency}'`)
         suggestions.push(`Add '${moduleDef.moduleKey}' to enable '${moduleDef.moduleKey}'`)
        }
      }

      // Check conflicts
      for (const conflict of conflicts) {
        if (modules.includes(conflict)) {
                   errors.push(`Module '${moduleDef.moduleKey}' conflicts with '${conflict}'`)
         suggestions.push(`Remove '${conflict}' to enable '${moduleDef.moduleKey}'`)
        }
      }

      // Check enterprise requirements
             if (moduleDef.enterpriseOnly && modules.length < 5) {
         warnings.push(`Module '${moduleDef.moduleKey}' is enterprise-only and may require additional licensing`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    }
  }

  /**
   * Get capabilities for a specific module
   */
  async getModuleCapabilities(tenantId: string, moduleKey: string): Promise<ModuleCapabilities | null> {
    const isActive = await this.isModuleActive(tenantId, moduleKey)
    if (!isActive) return null

    const moduleDefinition = await prisma.moduleDefinition.findUnique({
      where: { moduleKey, isActive: true }
    })

    if (!moduleDefinition) return null

    return {
      aiCapabilities: JSON.parse(moduleDefinition.aiCapabilities || '{}'),
      featureFlags: JSON.parse(moduleDefinition.featureFlags || '{}'),
      crossModuleEvents: JSON.parse(moduleDefinition.crossModuleEvents || '[]'),
      apiEndpoints: this.getApiEndpointsForModule(moduleKey),
      uiComponents: this.getUIComponentsForModule(moduleKey)
    }
  }

  /**
   * Update subscription modules in bulk
   */
  async updateSubscriptionModules(tenantId: string, targetModules: string[]): Promise<SubscriptionUpdateResult> {
    const currentModules = await this.getActiveModules(tenantId)
    const activatedModules: string[] = []
    const deactivatedModules: string[] = []
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Validate target modules
      const validation = await this.validateModuleDependencies(targetModules)
      if (!validation.isValid) {
        errors.push(...validation.errors)
        return {
          success: false,
          activatedModules: [],
          deactivatedModules: [],
          errors,
          warnings: validation.warnings,
          newActiveModules: currentModules
        }
      }

      warnings.push(...validation.warnings)

      // Calculate modules to activate/deactivate
      const toActivate = targetModules.filter(m => !currentModules.includes(m))
      const toDeactivate = currentModules.filter(m => !targetModules.includes(m))

      // Deactivate modules first (in reverse dependency order)
      for (const moduleKey of toDeactivate) {
        try {
          await this.deactivateModule(tenantId, moduleKey)
          deactivatedModules.push(moduleKey)
        } catch (error) {
          errors.push(`Failed to deactivate ${moduleKey}: ${error}`)
        }
      }

      // Activate new modules (in dependency order)
      for (const moduleKey of toActivate) {
        try {
          await this.activateModule(tenantId, moduleKey)
          activatedModules.push(moduleKey)
        } catch (error) {
          errors.push(`Failed to activate ${moduleKey}: ${error}`)
        }
      }

      const newActiveModules = await this.getActiveModules(tenantId)

      return {
        success: errors.length === 0,
        activatedModules,
        deactivatedModules,
        errors,
        warnings,
        newActiveModules
      }

    } catch (error) {
      errors.push(`Bulk update failed: ${error}`)
      return {
        success: false,
        activatedModules,
        deactivatedModules,
        errors,
        warnings,
        newActiveModules: currentModules
      }
    }
  }

  /**
   * Private helper methods
   */
  private async findDependentModules(moduleKey: string, activeModules: string[]): Promise<string[]> {
    const moduleDefinitions = await prisma.moduleDefinition.findMany({
      where: { moduleKey: { in: activeModules }, isActive: true }
    })

    const dependentModules: string[] = []

         for (const moduleDef of moduleDefinitions) {
       const dependencies = JSON.parse(moduleDef.dependencies || '[]') as string[]
       if (dependencies.includes(moduleKey)) {
         dependentModules.push(moduleDef.moduleKey)
      }
    }

    return dependentModules
  }

  private async logSubscriptionEvent(
    tenantId: string, 
    eventType: string, 
    details: Record<string, unknown>
  ): Promise<void> {
    const subscription = await prisma.tenantSubscription.findUnique({
      where: { tenantId }
    })

    if (!subscription) return

    await prisma.subscriptionEvent.create({
      data: {
        tenantSubscriptionId: subscription.id,
        eventType,
        newState: JSON.stringify(details),
        effectiveDate: new Date(),
        metadata: JSON.stringify({ timestamp: new Date().toISOString() })
      }
    })
  }

  private async triggerModuleHooks(
    tenantId: string, 
    moduleKey: string, 
    action: 'activated' | 'deactivated'
  ): Promise<void> {
    // TODO: Implement module-specific initialization/cleanup hooks
    // This could include:
    // - Setting up module-specific database tables/indexes
    // - Initializing AI agents for the module
    // - Configuring event listeners
    // - Setting up module-specific caching
    
    console.log(`📋 Module hook triggered: ${moduleKey} ${action} for tenant ${tenantId}`)
  }

  private getApiEndpointsForModule(moduleKey: string): string[] {
    const endpointMap: Record<string, string[]> = {
      'crm': ['/api/customers', '/api/deals', '/api/leads'],
      'accounting': ['/api/invoices', '/api/expenses', '/api/reports'],
      'hr': ['/api/employees', '/api/performance', '/api/recruitment'],
      'inventory': ['/api/inventory', '/api/products', '/api/suppliers'],
      'projects': ['/api/projects', '/api/tasks', '/api/timesheets'],
      'marketing': ['/api/campaigns', '/api/contacts', '/api/analytics']
    }
    
    return endpointMap[moduleKey] || []
  }

  private getUIComponentsForModule(moduleKey: string): string[] {
    const componentMap: Record<string, string[]> = {
      'crm': ['CustomerDashboard', 'DealPipeline', 'LeadForm'],
      'accounting': ['InvoiceList', 'ExpenseTracker', 'FinancialReports'],
      'hr': ['EmployeeDirectory', 'PerformanceReview', 'Recruitment'],
      'inventory': ['ProductCatalog', 'StockLevels', 'PurchaseOrders'],
      'projects': ['ProjectList', 'TaskBoard', 'TimeTracker'],
      'marketing': ['CampaignBuilder', 'ContactSegments', 'Analytics']
    }
    
    return componentMap[moduleKey] || []
  }
}

// Export singleton instance
export const moduleManager = new CoreFlowModuleManager()

// Export helper functions for use in API routes
export async function getModuleManagerForTenant(tenantId: string): Promise<ModuleManager> {
  return new CoreFlowModuleManager(tenantId)
}

