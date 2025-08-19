/**
 * CoreFlow360 - Tax Rule Auto-Update System
 * Automatically updates TAX_RULES_2025 with latest IRS changes
 * 🚨 NO TAX ADVICE - SYSTEM MAINTENANCE ONLY 🚨
 */

'use client'

import { TAX_RULES_2025, TaxRule } from './2025-us-tax-rules'
import { TaxChange } from './tax-change-tracking'

// Tax Rule Update Manager
export class TaxRuleUpdater {
  private static instance: TaxRuleUpdater
  private updateLog: TaxRuleUpdateLog[] = []
  private pendingUpdates: TaxRuleUpdate[] = []

  private constructor() {}

  static getInstance(): TaxRuleUpdater {
    if (!TaxRuleUpdater.instance) {
      TaxRuleUpdater.instance = new TaxRuleUpdater()
    }
    return TaxRuleUpdater.instance
  }

  // Process tax changes and update rules
  async processTaxChanges(changes: TaxChange[]): Promise<TaxRuleUpdateResult> {
    const results: TaxRuleUpdateResult = {
      totalChanges: changes.length,
      rulesUpdated: 0,
      rulesAdded: 0,
      rulesDeprecated: 0,
      updatesStagied: 0,
      errors: [],
    }

    for (const change of changes) {
      try {
        const updates = await this.analyzeTaxChangeForRuleUpdates(change)
        this.pendingUpdates.push(...updates)
        results.updatesStagied += updates.length
      } catch (error) {
        results.errors.push({
          changeId: change.id,
          error: error.message,
          timestamp: new Date(),
        })
      }
    }

    return results
  }

  // Analyze individual tax change for rule updates
  private async analyzeTaxChangeForRuleUpdates(change: TaxChange): Promise<TaxRuleUpdate[]> {
    const updates: TaxRuleUpdate[] = []

    // Check if change affects existing rules
    for (const rule of TAX_RULES_2025) {
      if (this.doesChangeAffectRule(change, rule)) {
        const update = await this.generateRuleUpdate(change, rule)
        if (update) {
          updates.push(update)
        }
      }
    }

    // Check if new rule needed
    const newRuleNeeded = await this.determineIfNewRuleNeeded(change)
    if (newRuleNeeded) {
      const newRule = await this.generateNewRule(change)
      if (newRule) {
        updates.push({
          type: 'add',
          changeId: change.id,
          ruleId: newRule.id,
          oldRule: null,
          newRule: newRule,
          confidence: 85,
          requiresReview: true,
          aiAnalysis: await this.generateAIAnalysis(change, null, newRule),
          timestamp: new Date(),
        })
      }
    }

    return updates
  }

  // Check if tax change affects existing rule
  private doesChangeAffectRule(change: TaxChange, rule: TaxRule): boolean {
    // Check IRC section overlap
    const sectionOverlap = change.affectedSections.some(
      (section) =>
        rule.code.includes(section) ||
        rule.applicableBusinessTypes?.some((type) =>
          change.categories.some((cat) => this.categoryMatchesBusinessType(cat, type))
        )
    )

    // Check keyword overlap
    const keywordOverlap = change.keywords.some(
      (keyword) =>
        rule.description.toLowerCase().includes(keyword.toLowerCase()) ||
        rule.guidancePrompt.toLowerCase().includes(keyword.toLowerCase())
    )

    // Check category relevance
    const categoryRelevance = change.categories.some((category) =>
      this.categoryAffectsRule(category, rule)
    )

    return sectionOverlap || keywordOverlap || categoryRelevance
  }

  // Generate rule update based on tax change
  private async generateRuleUpdate(
    change: TaxChange,
    existingRule: TaxRule
  ): Promise<TaxRuleUpdate | null> {
    const updatedRule = { ...existingRule }
    let changesMade = false

    // Update description if needed
    if (change.title.includes('threshold') || change.title.includes('limit')) {
      const newDescription = await this.updateRuleDescription(existingRule.description, change)
      if (newDescription !== existingRule.description) {
        updatedRule.description = newDescription
        changesMade = true
      }
    }

    // Update guidance prompt
    const newGuidancePrompt = await this.updateGuidancePrompt(existingRule.guidancePrompt, change)
    if (newGuidancePrompt !== existingRule.guidancePrompt) {
      updatedRule.guidancePrompt = newGuidancePrompt
      changesMade = true
    }

    // Update thresholds if applicable
    if (change.title.includes('inflation adjustment') || change.title.includes('threshold')) {
      const newThresholds = await this.updateRuleThresholds(existingRule, change)
      if (newThresholds) {
        updatedRule.thresholds = newThresholds
        changesMade = true
      }
    }

    if (!changesMade) return null

    return {
      type: 'update',
      changeId: change.id,
      ruleId: existingRule.id,
      oldRule: existingRule,
      newRule: updatedRule,
      confidence: 90,
      requiresReview: change.urgency === 'critical',
      aiAnalysis: await this.generateAIAnalysis(change, existingRule, updatedRule),
      timestamp: new Date(),
    }
  }

  // Generate new tax rule from change
  private async generateNewRule(change: TaxChange): Promise<TaxRule | null> {
    // Determine if change warrants a new rule
    const isNewProvision = !TAX_RULES_2025.some((rule) =>
      change.affectedSections.some((section) => rule.code.includes(section))
    )

    if (!isNewProvision) return null

    const newRule: TaxRule = {
      id: `new-rule-${change.id}`,
      code: change.affectedSections[0] || 'New Provision',
      description: change.description,
      guidancePrompt: `New provision: ${change.title}. Worth exploring with your tax attorney or CPA to understand how this affects your specific situation.`,
      applicableBusinessTypes: this.inferBusinessTypes(change),
      thresholds: await this.extractThresholds(change),
      deductionAmount: await this.extractDeductionAmount(change),
      requirements: await this.extractRequirements(change),
      effectiveDate: change.effectiveDate,
      expirationDate: await this.inferExpirationDate(change),
      complexity: this.assessComplexity(change),
      estimatedImpact: await this.estimateRuleImpact(change),
    }

    return newRule
  }

  // Apply staged updates to tax rules
  async applyUpdates(reviewApproved: boolean = false): Promise<ApplyUpdatesResult> {
    const result: ApplyUpdatesResult = {
      applied: 0,
      skipped: 0,
      errors: [],
      updatedRules: [],
    }

    for (const update of this.pendingUpdates) {
      if (update.requiresReview && !reviewApproved) {
        result.skipped++
        continue
      }

      try {
        await this.applyRuleUpdate(update)
        result.applied++
        result.updatedRules.push(update.newRule)

        // Log the update
        this.updateLog.push({
          updateId: update.changeId,
          type: update.type,
          ruleId: update.ruleId,
          timestamp: new Date(),
          confidence: update.confidence,
          reviewStatus: update.requiresReview ? 'approved' : 'auto-applied',
        })
      } catch (error) {
        result.errors.push({
          updateId: update.changeId,
          error: error.message,
          timestamp: new Date(),
        })
      }
    }

    // Clear applied updates
    this.pendingUpdates = this.pendingUpdates.filter(
      (update) => update.requiresReview && !reviewApproved
    )

    return result
  }

  // Get pending updates for review
  getPendingUpdates(): TaxRuleUpdate[] {
    return this.pendingUpdates.filter((update) => update.requiresReview)
  }

  // Get update history
  getUpdateLog(limit: number = 50): TaxRuleUpdateLog[] {
    return this.updateLog
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  // Utility methods
  private categoryMatchesBusinessType(category: string, businessType: string): boolean {
    const mappings = {
      business_expenses: ['freelancer', 'small_business', 'corporation'],
      deductions: ['freelancer', 'small_business'],
      payroll: ['small_business', 'corporation'],
      international: ['corporation'],
      retirement: ['freelancer', 'small_business'],
    }

    return mappings[category]?.includes(businessType) || false
  }

  private categoryAffectsRule(category: string, rule: TaxRule): boolean {
    const categoryKeywords = {
      deductions: ['deduction', 'deduct', 'expense'],
      credits: ['credit', 'tax credit'],
      compliance: ['filing', 'report', 'documentation'],
      business_expenses: ['business', 'expense', 'meal', 'travel'],
    }

    const keywords = categoryKeywords[category] || []
    return keywords.some(
      (keyword) =>
        rule.description.toLowerCase().includes(keyword) ||
        rule.guidancePrompt.toLowerCase().includes(keyword)
    )
  }

  // AI Analysis generation
  private async generateAIAnalysis(
    change: TaxChange,
    oldRule: TaxRule | null,
    newRule: TaxRule
  ): Promise<string> {
    return (
      `AI Analysis: Tax change "${change.title}" ${oldRule ? 'updates' : 'creates new'} rule ${newRule.id}. ` +
      `Change effective ${change.effectiveDate.toLocaleDateString()}. ` +
      `Confidence: High. Review recommended for implementation details. ` +
      `🚨 NOT TAX ADVICE - Professional consultation required 🚨`
    )
  }

  // Helper methods for rule generation
  private inferBusinessTypes(change: TaxChange): string[] {
    const types = []
    if (change.categories.includes('business_expenses')) types.push('freelancer', 'small_business')
    if (change.categories.includes('payroll')) types.push('small_business', 'corporation')
    if (change.categories.includes('deductions')) types.push('freelancer', 'small_business')
    return types.length > 0 ? types : ['freelancer', 'small_business']
  }

  private async extractThresholds(change: TaxChange): Promise<Record<string, number> | undefined> {
    // Extract numerical thresholds from change text
    const numbers = change.description.match(/\$[\d,]+|\d+%/g)
    if (!numbers) return undefined

    return {
      amount: parseInt(numbers[0].replace(/[$,]/g, '')) || 0,
    }
  }

  private async extractDeductionAmount(change: TaxChange): Promise<number | string | undefined> {
    if (change.title.includes('50%')) return '50%'
    if (change.title.includes('100%')) return '100%'
    return undefined
  }

  private async extractRequirements(change: TaxChange): Promise<string[] | undefined> {
    if (change.title.toLowerCase().includes('documentation')) {
      return ['Proper documentation required', 'Business purpose must be established']
    }
    return undefined
  }

  private async inferExpirationDate(change: TaxChange): Promise<Date | undefined> {
    // Most tax provisions are permanent unless specified
    if (change.description.includes('temporary') || change.description.includes('expires')) {
      return new Date('2025-12-31') // Default temporary expiration
    }
    return undefined
  }

  private assessComplexity(change: TaxChange): 'simple' | 'moderate' | 'complex' {
    if (change.affectedSections.length > 2) return 'complex'
    if (change.categories.includes('compliance')) return 'complex'
    if (change.urgency === 'critical') return 'complex'
    return 'moderate'
  }

  private async estimateRuleImpact(_change: TaxChange): Promise<{
    potentialSavings: number
    implementationCost: number
    applicabilityScore: number
  }> {
    return {
      potentialSavings: 1000, // Default estimate
      implementationCost: 200,
      applicabilityScore: 75,
    }
  }

  private async updateRuleDescription(description: string, change: TaxChange): Promise<string> {
    // Simple update - in production would use AI to intelligently update
    if (change.title.includes('threshold') && description.includes('threshold')) {
      return (
        description + ` Updated thresholds effective ${change.effectiveDate.toLocaleDateString()}.`
      )
    }
    return description
  }

  private async updateGuidancePrompt(prompt: string, change: TaxChange): Promise<string> {
    return (
      prompt +
      ` Note: Recent changes effective ${change.effectiveDate.toLocaleDateString()} may affect this guidance - worth exploring with your tax professional.`
    )
  }

  private async updateRuleThresholds(
    rule: TaxRule,
    change: TaxChange
  ): Promise<Record<string, number> | null> {
    if (!rule.thresholds || !change.title.includes('threshold')) return null

    // Mock threshold update - in production would parse actual new thresholds
    const updated = { ...rule.thresholds }
    if (updated.amount) {
      updated.amount = updated.amount * 1.05 // 5% inflation adjustment example
    }
    return updated
  }

  private async applyRuleUpdate(update: TaxRuleUpdate): Promise<void> {
    // In production, this would update the actual TAX_RULES_2025 database
    const index = TAX_RULES_2025.findIndex((rule) => rule.id === update.ruleId)

    if (update.type === 'update' && index >= 0) {
      // Update existing rule
      TAX_RULES_2025[index] = update.newRule
    } else if (update.type === 'add') {
      // Add new rule
      TAX_RULES_2025.push(update.newRule)
    } else if (update.type === 'deprecate' && index >= 0) {
      // Mark rule as deprecated
      TAX_RULES_2025[index].expirationDate = new Date()
    }
  }
}

// Types
export interface TaxRuleUpdate {
  type: 'add' | 'update' | 'deprecate'
  changeId: string
  ruleId: string
  oldRule: TaxRule | null
  newRule: TaxRule
  confidence: number
  requiresReview: boolean
  aiAnalysis: string
  timestamp: Date
}

export interface TaxRuleUpdateResult {
  totalChanges: number
  rulesUpdated: number
  rulesAdded: number
  rulesDeprecated: number
  updatesStagied: number
  errors: Array<{
    changeId: string
    error: string
    timestamp: Date
  }>
}

export interface TaxRuleUpdateLog {
  updateId: string
  type: 'add' | 'update' | 'deprecate'
  ruleId: string
  timestamp: Date
  confidence: number
  reviewStatus: 'auto-applied' | 'approved' | 'rejected'
}

export interface ApplyUpdatesResult {
  applied: number
  skipped: number
  errors: Array<{
    updateId: string
    error: string
    timestamp: Date
  }>
  updatedRules: TaxRule[]
}

// Export singleton instance
export const taxRuleUpdater = TaxRuleUpdater.getInstance()
