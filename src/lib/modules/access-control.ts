/**
 * CoreFlow360 - Module Access Control System
 * Enforces subscription-based access to modules and features
 */

import { prisma } from '@/lib/db'
import { TenantSubscription, Bundle } from '@prisma/client'
import { AuthorizationError, BusinessLogicError } from '@/lib/errors/base-error'
import { MODULE_INTEGRATIONS, ModuleIntegrationConfig } from '@/modules/integration-config'

export interface ModuleAccessContext {
  tenantId: string
  userId: string
  moduleId: string
  feature?: string
  operation?: 'read' | 'write' | 'execute' | 'admin'
}

export interface AccessCheckResult {
  allowed: boolean
  reason?: string
  requiredBundle?: string
  requiredTier?: string
  suggestedUpgrade?: string
}

export interface ModuleUsageQuota {
  moduleId: string
  quotaType: 'api_calls' | 'storage' | 'users' | 'records'
  limit: number
  used: number
  period: 'daily' | 'monthly' | 'total'
  resetAt?: Date
}

export class ModuleAccessControl {
  private static instance: ModuleAccessControl
  private cache: Map<string, { subscription: any; timestamp: number }> = new Map()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  private constructor() {}

  static getInstance(): ModuleAccessControl {
    if (!ModuleAccessControl.instance) {
      ModuleAccessControl.instance = new ModuleAccessControl()
    }
    return ModuleAccessControl.instance
  }

  /**
   * Check if a tenant has access to a specific module
   */
  async checkModuleAccess(context: ModuleAccessContext): Promise<AccessCheckResult> {
    try {
      // Get tenant subscription
      const subscription = await this.getTenantSubscription(context.tenantId)
      
      if (!subscription || subscription.status !== 'ACTIVE') {
        return {
          allowed: false,
          reason: 'No active subscription',
          suggestedUpgrade: 'Subscribe to a plan to access modules'
        }
      }

      // Check if module is included in subscription
      const enabledFeatures = JSON.parse(subscription.enabledFeatures || '[]') as string[]
      const bundle = subscription.bundle

      // Check module availability
      const moduleConfig = MODULE_INTEGRATIONS[context.moduleId]
      if (!moduleConfig) {
        return {
          allowed: false,
          reason: 'Invalid module'
        }
      }

      // Check if module is enabled for this subscription
      const moduleEnabled = this.isModuleEnabledForBundle(context.moduleId, bundle, enabledFeatures)
      
      if (!moduleEnabled) {
        return {
          allowed: false,
          reason: 'Module not included in your subscription',
          requiredBundle: this.getRequiredBundleForModule(context.moduleId),
          suggestedUpgrade: `Upgrade to access ${moduleConfig.name}`
        }
      }

      // Check feature-level access if specified
      if (context.feature) {
        const featureAllowed = await this.checkFeatureAccess(
          context.tenantId,
          context.moduleId,
          context.feature,
          bundle.tier
        )
        
        if (!featureAllowed) {
          return {
            allowed: false,
            reason: 'Feature not available in your tier',
            requiredTier: this.getRequiredTierForFeature(context.moduleId, context.feature),
            suggestedUpgrade: 'Upgrade to a higher tier for advanced features'
          }
        }
      }

      // Check operation permissions
      if (context.operation && context.operation === 'admin') {
        const isAdmin = await this.checkAdminPermission(context.userId, context.tenantId)
        if (!isAdmin) {
          return {
            allowed: false,
            reason: 'Admin permissions required'
          }
        }
      }

      // Check usage quotas
      const quotaCheck = await this.checkUsageQuotas(context.tenantId, context.moduleId)
      if (!quotaCheck.allowed) {
        return {
          allowed: false,
          reason: quotaCheck.reason,
          suggestedUpgrade: 'Upgrade for higher limits'
        }
      }

      return { allowed: true }

    } catch (error) {
      console.error('Module access check error:', error)
      return {
        allowed: false,
        reason: 'Access check failed'
      }
    }
  }

  /**
   * Get list of accessible modules for a tenant
   */
  async getAccessibleModules(tenantId: string): Promise<string[]> {
    const subscription = await this.getTenantSubscription(tenantId)
    
    if (!subscription || subscription.status !== 'ACTIVE') {
      return []
    }

    const enabledFeatures = JSON.parse(subscription.enabledFeatures || '[]') as string[]
    const bundle = subscription.bundle

    // Get modules based on bundle category and tier
    const accessibleModules: string[] = []

    // Map bundle categories to modules
    const categoryModuleMap: Record<string, string[]> = {
      finance: ['bigcapital', 'fingpt', 'finrobot'],
      sales: ['twenty', 'dolibarr'],
      hr: ['erpnext', 'plane'],
      operations: ['inventory', 'plane'],
      manufacturing: ['erpnext', 'inventory'],
      erp: ['erpnext', 'dolibarr', 'idurar'],
      ai_enhancement: ['fingpt', 'finrobot']
    }

    // Add modules based on bundle category
    const bundleModules = categoryModuleMap[bundle.category] || []
    accessibleModules.push(...bundleModules)

    // Add modules from enabled features
    enabledFeatures.forEach(feature => {
      if (MODULE_INTEGRATIONS[feature]) {
        accessibleModules.push(feature)
      }
    })

    // Add tier-based modules
    if (bundle.tier === 'enterprise' || bundle.tier === 'ultimate') {
      accessibleModules.push('nocobase') // Platform features for enterprise
    }

    // Remove duplicates
    return [...new Set(accessibleModules)]
  }

  /**
   * Check usage quotas for a module
   */
  async checkUsageQuotas(
    tenantId: string,
    moduleId: string
  ): Promise<{ allowed: boolean; reason?: string; usage?: ModuleUsageQuota }> {
    try {
      // Get current usage metrics
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const usage = await prisma.usageMetric.findFirst({
        where: {
          subscription: {
            tenantId
          },
          metricType: `${moduleId}_api_calls`,
          recordedAt: {
            gte: today
          }
        },
        orderBy: {
          recordedAt: 'desc'
        }
      })

      const subscription = await this.getTenantSubscription(tenantId)
      if (!subscription) {
        return { allowed: false, reason: 'No subscription found' }
      }

      // Get limits based on tier
      const limits = this.getModuleLimits(moduleId, subscription.bundle.tier)
      
      if (!limits.api_calls || limits.api_calls === -1) {
        return { allowed: true } // Unlimited
      }

      const currentUsage = usage?.value || 0
      
      if (currentUsage >= limits.api_calls) {
        return {
          allowed: false,
          reason: 'Daily API call limit exceeded',
          usage: {
            moduleId,
            quotaType: 'api_calls',
            limit: limits.api_calls,
            used: currentUsage,
            period: 'daily',
            resetAt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      }

      return {
        allowed: true,
        usage: {
          moduleId,
          quotaType: 'api_calls',
          limit: limits.api_calls,
          used: currentUsage,
          period: 'daily',
          resetAt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }

    } catch (error) {
      console.error('Usage quota check error:', error)
      return { allowed: true } // Fail open for now
    }
  }

  /**
   * Record module usage
   */
  async recordModuleUsage(
    tenantId: string,
    moduleId: string,
    metricType: string = 'api_calls',
    value: number = 1
  ): Promise<void> {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: { tenantId }
      })

      if (!subscription) return

      await prisma.usageMetric.create({
        data: {
          subscriptionId: subscription.id,
          metricType: `${moduleId}_${metricType}`,
          value,
          recordedAt: new Date()
        }
      })
    } catch (error) {
      console.error('Failed to record module usage:', error)
    }
  }

  /**
   * Validate module dependencies
   */
  async validateModuleDependencies(
    tenantId: string,
    moduleId: string
  ): Promise<{ valid: boolean; missingDependencies: string[] }> {
    const accessibleModules = await this.getAccessibleModules(tenantId)
    
    // Define module dependencies
    const dependencies: Record<string, string[]> = {
      finrobot: ['bigcapital'], // Financial AI needs accounting data
      plane: ['twenty'], // Project management needs CRM for client projects
      // Add more dependencies as needed
    }

    const requiredDeps = dependencies[moduleId] || []
    const missingDeps = requiredDeps.filter(dep => !accessibleModules.includes(dep))

    return {
      valid: missingDeps.length === 0,
      missingDependencies: missingDeps
    }
  }

  /**
   * Private helper methods
   */
  private async getTenantSubscription(tenantId: string): Promise<TenantSubscription & { bundle: Bundle } | null> {
    // Check cache
    const cached = this.cache.get(tenantId)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.subscription
    }

    // Fetch from database
    const subscription = await prisma.tenantSubscription.findFirst({
      where: {
        tenantId,
        status: 'ACTIVE'
      },
      include: {
        bundle: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Update cache
    if (subscription) {
      this.cache.set(tenantId, {
        subscription,
        timestamp: Date.now()
      })
    }

    return subscription
  }

  private isModuleEnabledForBundle(
    moduleId: string,
    bundle: Bundle,
    enabledFeatures: string[]
  ): boolean {
    // Check if explicitly enabled
    if (enabledFeatures.includes(moduleId)) {
      return true
    }

    // Check if included in bundle category
    const categoryModules: Record<string, string[]> = {
      finance: ['bigcapital'],
      sales: ['twenty'],
      hr: ['plane'],
      operations: ['inventory'],
      erp: ['erpnext', 'dolibarr', 'idurar'],
      ai_enhancement: ['fingpt', 'finrobot']
    }

    const bundleModules = categoryModules[bundle.category] || []
    return bundleModules.includes(moduleId)
  }

  private async checkFeatureAccess(
    tenantId: string,
    moduleId: string,
    feature: string,
    tier: string
  ): Promise<boolean> {
    // Define tier-restricted features
    const tierFeatures: Record<string, Record<string, string[]>> = {
      bigcapital: {
        professional: ['multi_currency', 'advanced_reports'],
        enterprise: ['api_access', 'custom_fields', 'automation'],
        ultimate: ['ai_insights', 'predictive_analytics']
      },
      twenty: {
        professional: ['email_sequences', 'advanced_analytics'],
        enterprise: ['api_webhooks', 'custom_objects'],
        ultimate: ['ai_lead_scoring', 'predictive_sales']
      }
    }

    const moduleFeatures = tierFeatures[moduleId]
    if (!moduleFeatures) return true // No restrictions

    // Check if feature requires a higher tier
    const tierHierarchy = ['starter', 'professional', 'enterprise', 'ultimate']
    const currentTierIndex = tierHierarchy.indexOf(tier)

    for (let i = currentTierIndex + 1; i < tierHierarchy.length; i++) {
      const tierName = tierHierarchy[i]
      if (moduleFeatures[tierName]?.includes(feature)) {
        return false // Feature requires higher tier
      }
    }

    return true
  }

  private async checkAdminPermission(userId: string, tenantId: string): Promise<boolean> {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        tenantId
      }
    })

    return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
  }

  private getRequiredBundleForModule(moduleId: string): string {
    const moduleBundleMap: Record<string, string> = {
      bigcapital: 'Finance Bundle',
      twenty: 'Sales Bundle',
      fingpt: 'AI Enhancement Bundle',
      finrobot: 'AI Enhancement Bundle',
      erpnext: 'ERP Bundle',
      dolibarr: 'ERP Bundle',
      idurar: 'ERP Bundle',
      plane: 'Operations Bundle',
      inventory: 'Operations Bundle',
      nocobase: 'Enterprise Platform'
    }

    return moduleBundleMap[moduleId] || 'Custom Bundle'
  }

  private getRequiredTierForFeature(moduleId: string, feature: string): string {
    // This would be more sophisticated in production
    if (feature.includes('ai_') || feature.includes('predictive_')) {
      return 'ultimate'
    }
    if (feature.includes('api_') || feature.includes('custom_')) {
      return 'enterprise'
    }
    if (feature.includes('advanced_')) {
      return 'professional'
    }
    return 'starter'
  }

  private getModuleLimits(moduleId: string, tier: string): Record<string, number> {
    const tierLimits: Record<string, Record<string, number>> = {
      starter: {
        api_calls: 1000,
        storage: 10, // GB
        users: 5
      },
      professional: {
        api_calls: 10000,
        storage: 100,
        users: 50
      },
      enterprise: {
        api_calls: 100000,
        storage: 1000,
        users: 500
      },
      ultimate: {
        api_calls: -1, // Unlimited
        storage: -1,
        users: -1
      }
    }

    return tierLimits[tier] || tierLimits.starter
  }

  /**
   * Clear cache for a specific tenant or all
   */
  clearCache(tenantId?: string): void {
    if (tenantId) {
      this.cache.delete(tenantId)
    } else {
      this.cache.clear()
    }
  }
}

// Export singleton instance
export const moduleAccessControl = ModuleAccessControl.getInstance()

// Export convenience functions
export async function checkModuleAccess(context: ModuleAccessContext): Promise<AccessCheckResult> {
  return moduleAccessControl.checkModuleAccess(context)
}

export async function getAccessibleModules(tenantId: string): Promise<string[]> {
  return moduleAccessControl.getAccessibleModules(tenantId)
}

export async function recordModuleUsage(
  tenantId: string,
  moduleId: string,
  metricType?: string,
  value?: number
): Promise<void> {
  return moduleAccessControl.recordModuleUsage(tenantId, moduleId, metricType, value)
}