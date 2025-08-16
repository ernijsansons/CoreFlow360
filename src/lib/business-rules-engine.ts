/**
 * CoreFlow360 - Business Rules Engine
 * Centralized business logic enforcement and validation
 */

import { z } from 'zod'
import { prisma } from './db'

// Business context interface
export interface BusinessContext {
  userId?: string
  tenantId?: string
  userRole?: string
  subscription?: any
  modules?: string[]
  userCount?: number
  billingCycle?: string
  pricingModel?: string
  region?: string
  industry?: string
  companySize?: string
}

// Business rule result
export interface BusinessRuleResult {
  allowed: boolean
  reason?: string
  conditions?: string[]
  recommendations?: string[]
  alternatives?: string[]
}

// Business rule definition
export interface BusinessRule {
  id: string
  name: string
  description: string
  category: 'pricing' | 'access' | 'subscription' | 'data' | 'security' | 'compliance'
  priority: 'low' | 'medium' | 'high' | 'critical'
  conditions: BusinessRuleCondition[]
  actions: BusinessRuleAction[]
  enabled: boolean
}

export interface BusinessRuleCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in'
  value: any
  logicalOperator?: 'AND' | 'OR'
}

export interface BusinessRuleAction {
  type: 'allow' | 'deny' | 'require' | 'recommend' | 'notify' | 'calculate'
  action: string
  parameters?: Record<string, any>
}

export class BusinessRulesEngine {
  private static instance: BusinessRulesEngine
  private rules: Map<string, BusinessRule> = new Map()

  private constructor() {
    this.initializeDefaultRules()
  }

  static getInstance(): BusinessRulesEngine {
    if (!BusinessRulesEngine.instance) {
      BusinessRulesEngine.instance = new BusinessRulesEngine()
    }
    return BusinessRulesEngine.instance
  }

  /**
   * Initialize default business rules
   */
  private initializeDefaultRules(): void {
    // Pricing rules
    this.addRule({
      id: 'pricing_volume_discount',
      name: 'Volume Discount Eligibility',
      description: 'Apply volume discounts based on user count',
      category: 'pricing',
      priority: 'high',
      conditions: [
        { field: 'userCount', operator: 'greater_than', value: 20 }
      ],
      actions: [
        { type: 'allow', action: 'apply_volume_discount' }
      ],
      enabled: true
    })

    // Access rules
    this.addRule({
      id: 'module_access_standard',
      name: 'Standard Module Access',
      description: 'Limit module access for standard pricing',
      category: 'access',
      priority: 'high',
      conditions: [
        { field: 'pricingModel', operator: 'equals', value: 'standard' },
        { field: 'userCount', operator: 'greater_than', value: 100, logicalOperator: 'AND' }
      ],
      actions: [
        { type: 'deny', action: 'access_enterprise_modules' },
        { type: 'recommend', action: 'upgrade_to_enterprise' }
      ],
      enabled: true
    })

    // Subscription rules
    this.addRule({
      id: 'subscription_limits',
      name: 'Subscription Limits',
      description: 'Enforce subscription limits',
      category: 'subscription',
      priority: 'critical',
      conditions: [
        { field: 'userCount', operator: 'greater_than', value: 10000 }
      ],
      actions: [
        { type: 'deny', action: 'exceed_user_limit' },
        { type: 'require', action: 'enterprise_pricing' }
      ],
      enabled: true
    })

    // Data rules
    this.addRule({
      id: 'data_retention',
      name: 'Data Retention Policy',
      description: 'Enforce data retention policies',
      category: 'data',
      priority: 'high',
      conditions: [
        { field: 'subscription.status', operator: 'equals', value: 'cancelled' }
      ],
      actions: [
        { type: 'require', action: 'data_export' },
        { type: 'notify', action: 'data_deletion_schedule' }
      ],
      enabled: true
    })

    // Security rules
    this.addRule({
      id: 'security_audit',
      name: 'Security Audit Requirements',
      description: 'Require security audits for enterprise customers',
      category: 'security',
      priority: 'high',
      conditions: [
        { field: 'pricingModel', operator: 'equals', value: 'enterprise' },
        { field: 'deploymentType', operator: 'equals', value: 'on-premise', logicalOperator: 'AND' }
      ],
      actions: [
        { type: 'require', action: 'security_audit' },
        { type: 'require', action: 'compliance_certification' }
      ],
      enabled: true
    })

    // Compliance rules
    this.addRule({
      id: 'gdpr_compliance',
      name: 'GDPR Compliance',
      description: 'Enforce GDPR compliance for EU customers',
      category: 'compliance',
      priority: 'critical',
      conditions: [
        { field: 'region', operator: 'in', value: ['EU', 'UK'] }
      ],
      actions: [
        { type: 'require', action: 'gdpr_features' },
        { type: 'require', action: 'data_processing_agreement' }
      ],
      enabled: true
    })
  }

  /**
   * Add a new business rule
   */
  addRule(rule: BusinessRule): void {
    this.rules.set(rule.id, rule)
  }

  /**
   * Remove a business rule
   */
  removeRule(ruleId: string): boolean {
    return this.rules.delete(ruleId)
  }

  /**
   * Get all rules for a category
   */
  getRulesByCategory(category: string): BusinessRule[] {
    return Array.from(this.rules.values()).filter(rule => rule.category === category)
  }

  /**
   * Evaluate business rules for a given context
   */
  async evaluateRules(context: BusinessContext, action: string): Promise<BusinessRuleResult[]> {
    const results: BusinessRuleResult[] = []

    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue

      const isRelevant = rule.actions.some(actionDef => actionDef.action === action)
      if (!isRelevant) continue

      const evaluation = await this.evaluateRule(rule, context)
      results.push(evaluation)
    }

    return results
  }

  /**
   * Evaluate a single business rule
   */
  private async evaluateRule(rule: BusinessRule, context: BusinessContext): Promise<BusinessRuleResult> {
    const conditionsMet = await this.evaluateConditions(rule.conditions, context)
    
    if (!conditionsMet.met) {
      return {
        allowed: true,
        reason: `Rule ${rule.name} conditions not met`
      }
    }

    const actions = rule.actions.map(action => this.evaluateAction(action, context))
    
    return {
      allowed: !actions.some(action => action.type === 'deny'),
      reason: rule.description,
      conditions: conditionsMet.conditions,
      recommendations: actions
        .filter(action => action.type === 'recommend')
        .map(action => action.action),
      alternatives: actions
        .filter(action => action.type === 'require')
        .map(action => action.action)
    }
  }

  /**
   * Evaluate rule conditions
   */
  private async evaluateConditions(conditions: BusinessRuleCondition[], context: BusinessContext): Promise<{ met: boolean; conditions: string[] }> {
    const evaluatedConditions: string[] = []
    let allMet = true

    for (let i = 0; i < conditions.length; i++) {
      const condition = conditions[i]
      const value = this.getFieldValue(context, condition.field)
      const met = this.evaluateCondition(condition, value)
      
      evaluatedConditions.push(`${condition.field} ${condition.operator} ${condition.value} = ${met}`)
      
      if (i > 0 && condition.logicalOperator === 'OR') {
        // For OR conditions, we need to check if any previous condition was met
        const previousMet = evaluatedConditions[i - 1].includes('= true')
        allMet = allMet && (previousMet || met)
      } else {
        allMet = allMet && met
      }
    }

    return { met: allMet, conditions: evaluatedConditions }
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(condition: BusinessRuleCondition, value: any): boolean {
    switch (condition.operator) {
      case 'equals':
        return value === condition.value
      case 'not_equals':
        return value !== condition.value
      case 'greater_than':
        return Number(value) > Number(condition.value)
      case 'less_than':
        return Number(value) < Number(condition.value)
      case 'contains':
        return String(value).includes(String(condition.value))
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(value)
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(value)
      default:
        return false
    }
  }

  /**
   * Get field value from context (supports nested fields)
   */
  private getFieldValue(context: BusinessContext, field: string): any {
    const parts = field.split('.')
    let value: any = context

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part]
      } else {
        return undefined
      }
    }

    return value
  }

  /**
   * Evaluate a business rule action
   */
  private evaluateAction(action: BusinessRuleAction, context: BusinessContext): { type: string; action: string } {
    return {
      type: action.type,
      action: action.action
    }
  }

  /**
   * Check if a specific action is allowed
   */
  async isActionAllowed(context: BusinessContext, action: string): Promise<BusinessRuleResult> {
    const results = await this.evaluateRules(context, action)
    
    const deniedRules = results.filter(result => !result.allowed)
    if (deniedRules.length > 0) {
      return deniedRules[0] // Return the first denial
    }

    return {
      allowed: true,
      reason: 'Action allowed by business rules'
    }
  }

  /**
   * Get recommendations for a context
   */
  async getRecommendations(context: BusinessContext): Promise<string[]> {
    const recommendations: string[] = []

    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue

      const evaluation = await this.evaluateRule(rule, context)
      if (evaluation.recommendations) {
        recommendations.push(...evaluation.recommendations)
      }
    }

    return [...new Set(recommendations)] // Remove duplicates
  }

  /**
   * Validate subscription changes
   */
  async validateSubscriptionChange(currentSubscription: any, proposedChanges: any): Promise<BusinessRuleResult[]> {
    const context: BusinessContext = {
      subscription: currentSubscription,
      ...proposedChanges
    }

    return await this.evaluateRules(context, 'subscription_change')
  }

  /**
   * Validate module access
   */
  async validateModuleAccess(context: BusinessContext, moduleKey: string): Promise<BusinessRuleResult> {
    const moduleContext = {
      ...context,
      requestedModule: moduleKey
    }

    return await this.isActionAllowed(moduleContext, 'access_module')
  }

  /**
   * Validate pricing changes
   */
  async validatePricingChange(context: BusinessContext, newPricing: any): Promise<BusinessRuleResult[]> {
    const pricingContext = {
      ...context,
      proposedPricing: newPricing
    }

    return await this.evaluateRules(pricingContext, 'pricing_change')
  }

  /**
   * Get business insights for a context
   */
  async getBusinessInsights(context: BusinessContext): Promise<{
    recommendations: string[]
    warnings: string[]
    opportunities: string[]
    risks: string[]
  }> {
    const recommendations = await this.getRecommendations(context)
    const warnings: string[] = []
    const opportunities: string[] = []
    const risks: string[] = []

    // Analyze context for insights
    if (context.userCount && context.userCount > 50 && context.pricingModel === 'standard') {
      opportunities.push('Consider upgrading to Enterprise for better pricing and features')
    }

    if (context.billingCycle === 'monthly') {
      opportunities.push('Switch to annual billing to save 15%')
    }

    if (context.userCount && context.userCount > 100 && context.pricingModel === 'standard') {
      warnings.push('User count exceeds standard plan limits')
    }

    if (context.region === 'EU' && !context.subscription?.gdprCompliant) {
      risks.push('GDPR compliance required for EU customers')
    }

    return {
      recommendations,
      warnings,
      opportunities,
      risks
    }
  }

  /**
   * Apply business rules to data
   */
  async applyBusinessRules<T>(data: T, context: BusinessContext): Promise<T> {
    const rules = await this.evaluateRules(context, 'data_processing')
    
    // Apply any data transformation rules
    for (const rule of rules) {
      if (rule.alternatives && rule.alternatives.length > 0) {
        // Apply required transformations
        data = this.applyDataTransformations(data, rule.alternatives)
      }
    }

    return data
  }

  /**
   * Apply data transformations based on business rules
   */
  private applyDataTransformations<T>(data: T, transformations: string[]): T {
    // Apply transformations based on business rules
    // This is a simplified implementation
    return data
  }

  /**
   * Export business rules for external use
   */
  exportRules(): BusinessRule[] {
    return Array.from(this.rules.values())
  }

  /**
   * Import business rules from external source
   */
  importRules(rules: BusinessRule[]): void {
    for (const rule of rules) {
      this.addRule(rule)
    }
  }

  /**
   * Get rule statistics
   */
  getRuleStatistics(): {
    total: number
    byCategory: Record<string, number>
    byPriority: Record<string, number>
    enabled: number
    disabled: number
  } {
    const rules = Array.from(this.rules.values())
    const byCategory: Record<string, number> = {}
    const byPriority: Record<string, number> = {}

    for (const rule of rules) {
      byCategory[rule.category] = (byCategory[rule.category] || 0) + 1
      byPriority[rule.priority] = (byPriority[rule.priority] || 0) + 1
    }

    return {
      total: rules.length,
      byCategory,
      byPriority,
      enabled: rules.filter(r => r.enabled).length,
      disabled: rules.filter(r => !r.enabled).length
    }
  }
}

// Export singleton instance
export const businessRulesEngine = BusinessRulesEngine.getInstance()
