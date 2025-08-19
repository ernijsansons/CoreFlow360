/**
 * CoreFlow360 - Advanced Conflict Resolution System
 *
 * Sophisticated conflict detection and resolution for business data with
 * semantic understanding, business rules, and automated merge strategies
 */

import { EventEmitter } from 'events'
import { eventStore } from '@/lib/events/event-store'
import { EVENT_TYPES } from '@/lib/events/domain-events'

export interface DataConflict {
  id: string
  entityType: string
  entityId: string
  fieldPath: string
  conflictType:
    | 'concurrent_update'
    | 'version_mismatch'
    | 'business_rule_violation'
    | 'schema_change'
  localValue: unknown
  remoteValue: unknown
  baseValue?: unknown
  timestamp: Date
  userId1: string
  userId2: string
  tenantId: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  autoResolvable: boolean
  suggestedResolution?: ConflictResolution
  businessContext?: Record<string, unknown>
}

export interface ConflictResolution {
  strategy: 'take_local' | 'take_remote' | 'merge' | 'manual' | 'business_rule' | 'timestamp_based'
  resolvedValue: unknown
  reasoning: string
  confidence: number
  requiresApproval: boolean
  metadata?: Record<string, unknown>
}

export interface MergeResult {
  success: boolean
  resolvedValue: unknown
  conflicts: DataConflict[]
  strategy: string
  confidence: number
}

export interface BusinessRule {
  id: string
  name: string
  entityType: string
  fieldPath: string
  condition: (value: unknown, context: unknown) => boolean
  priority: number
  description: string
}

export class ConflictResolutionEngine extends EventEmitter {
  private businessRules: Map<string, BusinessRule[]> = new Map()
  private conflictHistory: Map<string, DataConflict[]> = new Map()
  private resolutionStrategies: Map<string, Function> = new Map()

  constructor() {
    super()
    this.initializeDefaultRules()
    this.initializeResolutionStrategies()
  }

  /**
   * Detect conflicts between concurrent data modifications
   */
  detectConflicts(
    entityType: string,
    entityId: string,
    localChanges: Record<string, unknown>,
    remoteChanges: Record<string, unknown>,
    baseState: Record<string, unknown>,
    context: {
      userId1: string
      userId2: string
      tenantId: string
      timestamp1: Date
      timestamp2: Date
    }
  ): DataConflict[] {
    const conflicts: DataConflict[] = []

    // Find overlapping field changes
    const localFields = new Set(Object.keys(localChanges))
    const remoteFields = new Set(Object.keys(remoteChanges))
    const conflictingFields = new Set([...localFields].filter((f) => remoteFields.has(f)))

    for (const fieldPath of conflictingFields) {
      const localValue = localChanges[fieldPath]
      const remoteValue = remoteChanges[fieldPath]
      const baseValue = baseState[fieldPath]

      // Skip if values are identical
      if (this.deepEqual(localValue, remoteValue)) {
        continue
      }

      const conflict: DataConflict = {
        id: `conflict_${entityId}_${fieldPath}_${Date.now()}`,
        entityType,
        entityId,
        fieldPath,
        conflictType: 'concurrent_update',
        localValue,
        remoteValue,
        baseValue,
        timestamp: new Date(),
        userId1: context.userId1,
        userId2: context.userId2,
        tenantId: context.tenantId,
        severity: this.calculateConflictSeverity(entityType, fieldPath, localValue, remoteValue),
        autoResolvable: false,
        businessContext: {
          timestamp1: context.timestamp1,
          timestamp2: context.timestamp2,
          entityType,
          fieldPath,
        },
      }

      // Analyze conflict and suggest resolution
      conflict.suggestedResolution = this.analyzeConflict(conflict)
      conflict.autoResolvable = this.isAutoResolvable(conflict)

      conflicts.push(conflict)
    }

    // Store conflicts in history
    if (conflicts.length > 0) {
      this.storeConflictHistory(entityId, conflicts)
    }

    return conflicts
  }

  /**
   * Resolve conflicts using various strategies
   */
  async resolveConflicts(
    conflicts: DataConflict[],
    strategy?: string
  ): Promise<{
    resolvedData: Record<string, unknown>
    unresolvedConflicts: DataConflict[]
    resolutionLog: Array<{
      conflict: DataConflict
      resolution: ConflictResolution
      success: boolean
    }>
  }> {
    const resolvedData: Record<string, unknown> = {}
    const unresolvedConflicts: DataConflict[] = []
    const resolutionLog: Array<unknown> = []

    for (const conflict of conflicts) {
      try {
        const resolution = strategy
          ? await this.applySpecificStrategy(conflict, strategy)
          : conflict.suggestedResolution || (await this.getDefaultResolution(conflict))

        if (resolution.requiresApproval && !strategy) {
          unresolvedConflicts.push(conflict)
          continue
        }

        resolvedData[conflict.fieldPath] = resolution.resolvedValue

        resolutionLog.push({
          conflict,
          resolution,
          success: true,
        })

        // Create event for conflict resolution
        await this.recordConflictResolution(conflict, resolution)
      } catch (error) {
        unresolvedConflicts.push(conflict)
        resolutionLog.push({
          conflict,
          resolution: null,
          success: false,
          error: error.message,
        })
      }
    }

    return {
      resolvedData,
      unresolvedConflicts,
      resolutionLog,
    }
  }

  /**
   * Three-way merge with intelligent conflict detection
   */
  performThreeWayMerge(
    baseState: Record<string, unknown>,
    localChanges: Record<string, unknown>,
    remoteChanges: Record<string, unknown>,
    entityType: string,
    entityId: string,
    context: unknown
  ): MergeResult {
    const mergedData = { ...baseState }
    const conflicts: DataConflict[] = []

    // Apply non-conflicting local changes
    for (const [field, value] of Object.entries(localChanges)) {
      if (!(field in remoteChanges)) {
        mergedData[field] = value
      }
    }

    // Apply non-conflicting remote changes
    for (const [field, value] of Object.entries(remoteChanges)) {
      if (!(field in localChanges)) {
        mergedData[field] = value
      }
    }

    // Detect and handle conflicts
    const detectedConflicts = this.detectConflicts(
      entityType,
      entityId,
      localChanges,
      remoteChanges,
      baseState,
      context
    )

    for (const conflict of detectedConflicts) {
      if (conflict.autoResolvable && conflict.suggestedResolution) {
        mergedData[conflict.fieldPath] = conflict.suggestedResolution.resolvedValue
      } else {
        conflicts.push(conflict)
      }
    }

    const confidence = conflicts.length === 0 ? 1.0 : Math.max(0.1, 1.0 - conflicts.length * 0.2)

    return {
      success: conflicts.length === 0,
      resolvedValue: mergedData,
      conflicts,
      strategy: 'three_way_merge',
      confidence,
    }
  }

  /**
   * Analyze conflict and suggest resolution strategy
   */
  private analyzeConflict(conflict: DataConflict): ConflictResolution {
    const { entityType, fieldPath, localValue, remoteValue, businessContext } = conflict

    // Business rule-based resolution
    const rules = this.getApplicableRules(entityType, fieldPath)
    for (const rule of rules) {
      if (rule.condition(localValue, businessContext)) {
        return {
          strategy: 'business_rule',
          resolvedValue: localValue,
          reasoning: `Business rule: ${rule.description}`,
          confidence: 0.9,
          requiresApproval: false,
          metadata: { ruleId: rule.id },
        }
      }
      if (rule.condition(remoteValue, businessContext)) {
        return {
          strategy: 'business_rule',
          resolvedValue: remoteValue,
          reasoning: `Business rule: ${rule.description}`,
          confidence: 0.9,
          requiresApproval: false,
          metadata: { ruleId: rule.id },
        }
      }
    }

    // Timestamp-based resolution
    if (businessContext?.timestamp1 && businessContext?.timestamp2) {
      const isLocalNewer = businessContext.timestamp1 > businessContext.timestamp2
      return {
        strategy: 'timestamp_based',
        resolvedValue: isLocalNewer ? localValue : remoteValue,
        reasoning: `Using newer timestamp (${isLocalNewer ? 'local' : 'remote'})`,
        confidence: 0.7,
        requiresApproval: false,
      }
    }

    // Data type-specific resolution
    if (typeof localValue === 'number' && typeof remoteValue === 'number') {
      return this.resolveNumericConflict(conflict)
    }

    if (typeof localValue === 'string' && typeof remoteValue === 'string') {
      return this.resolveTextConflict(conflict)
    }

    if (Array.isArray(localValue) && Array.isArray(remoteValue)) {
      return this.resolveArrayConflict(conflict)
    }

    // Default: require manual resolution
    return {
      strategy: 'manual',
      resolvedValue: localValue,
      reasoning: 'Complex conflict requires manual resolution',
      confidence: 0.3,
      requiresApproval: true,
    }
  }

  /**
   * Resolve numeric conflicts (sum, max, average, etc.)
   */
  private resolveNumericConflict(conflict: DataConflict): ConflictResolution {
    const { localValue, remoteValue, fieldPath } = conflict

    // For revenue/money fields, use sum
    if (
      fieldPath.toLowerCase().includes('revenue') ||
      fieldPath.toLowerCase().includes('amount') ||
      fieldPath.toLowerCase().includes('cost')
    ) {
      return {
        strategy: 'merge',
        resolvedValue: localValue + remoteValue,
        reasoning: 'Summed monetary values',
        confidence: 0.8,
        requiresApproval: false,
      }
    }

    // For counters, use max
    if (fieldPath.toLowerCase().includes('count') || fieldPath.toLowerCase().includes('total')) {
      return {
        strategy: 'merge',
        resolvedValue: Math.max(localValue, remoteValue),
        reasoning: 'Used maximum count value',
        confidence: 0.8,
        requiresApproval: false,
      }
    }

    // For scores/ratings, use average
    if (fieldPath.toLowerCase().includes('score') || fieldPath.toLowerCase().includes('rating')) {
      return {
        strategy: 'merge',
        resolvedValue: (localValue + remoteValue) / 2,
        reasoning: 'Averaged score values',
        confidence: 0.7,
        requiresApproval: false,
      }
    }

    // Default: use higher value
    return {
      strategy: 'merge',
      resolvedValue: Math.max(localValue, remoteValue),
      reasoning: 'Used higher numeric value',
      confidence: 0.6,
      requiresApproval: false,
    }
  }

  /**
   * Resolve text conflicts with diff-based merging
   */
  private resolveTextConflict(conflict: DataConflict): ConflictResolution {
    const { localValue, remoteValue, baseValue } = conflict

    // If one is extension of the other, use longer
    if (localValue.includes(remoteValue)) {
      return {
        strategy: 'merge',
        resolvedValue: localValue,
        reasoning: 'Local value contains remote value',
        confidence: 0.8,
        requiresApproval: false,
      }
    }

    if (remoteValue.includes(localValue)) {
      return {
        strategy: 'merge',
        resolvedValue: remoteValue,
        reasoning: 'Remote value contains local value',
        confidence: 0.8,
        requiresApproval: false,
      }
    }

    // Try to merge if there's a common base
    if (baseValue) {
      const merged = this.mergeTextChanges(baseValue, localValue, remoteValue)
      if (merged.success) {
        return {
          strategy: 'merge',
          resolvedValue: merged.result,
          reasoning: 'Successfully merged text changes',
          confidence: merged.confidence,
          requiresApproval: false,
        }
      }
    }

    // Default: require manual resolution
    return {
      strategy: 'manual',
      resolvedValue: localValue,
      reasoning: 'Text conflict requires manual resolution',
      confidence: 0.3,
      requiresApproval: true,
    }
  }

  /**
   * Resolve array conflicts with set operations
   */
  private resolveArrayConflict(conflict: DataConflict): ConflictResolution {
    const { localValue, remoteValue } = conflict

    // Union of arrays (deduplicated)
    const merged = [...new Set([...localValue, ...remoteValue])]

    return {
      strategy: 'merge',
      resolvedValue: merged,
      reasoning: 'Merged arrays with union operation',
      confidence: 0.8,
      requiresApproval: false,
    }
  }

  /**
   * Simple text merge algorithm
   */
  private mergeTextChanges(
    base: string,
    local: string,
    remote: string
  ): {
    success: boolean
    result: string
    confidence: number
  } {
    // Simple approach: if changes don't overlap, concatenate
    const localDiff = local.replace(base, '')
    const remoteDiff = remote.replace(base, '')

    if (
      localDiff &&
      remoteDiff &&
      !localDiff.includes(remoteDiff) &&
      !remoteDiff.includes(localDiff)
    ) {
      return {
        success: true,
        result: base + localDiff + remoteDiff,
        confidence: 0.7,
      }
    }

    return {
      success: false,
      result: local,
      confidence: 0.3,
    }
  }

  /**
   * Calculate conflict severity based on business impact
   */
  private calculateConflictSeverity(
    entityType: string,
    fieldPath: string,
    _localValue: unknown,
    remoteValue: unknown
  ): 'low' | 'medium' | 'high' | 'critical' {
    // Critical fields that can't have conflicts
    const criticalFields = ['id', 'tenantId', 'status', 'deletedAt']
    if (criticalFields.includes(fieldPath)) {
      return 'critical'
    }

    // High-impact business fields
    const highImpactFields = ['email', 'phone', 'revenue', 'contractValue', 'subscriptionStatus']
    if (highImpactFields.some((field) => fieldPath.toLowerCase().includes(field))) {
      return 'high'
    }

    // Medium impact for personal/contact info
    const mediumImpactFields = ['name', 'address', 'company', 'title']
    if (mediumImpactFields.some((field) => fieldPath.toLowerCase().includes(field))) {
      return 'medium'
    }

    return 'low'
  }

  /**
   * Check if conflict can be auto-resolved
   */
  private isAutoResolvable(conflict: DataConflict): boolean {
    return (
      conflict.severity !== 'critical' &&
      conflict.suggestedResolution !== undefined &&
      conflict.suggestedResolution.confidence >= 0.7 &&
      !conflict.suggestedResolution.requiresApproval
    )
  }

  /**
   * Get applicable business rules for entity and field
   */
  private getApplicableRules(entityType: string, fieldPath: string): BusinessRule[] {
    const rules = this.businessRules.get(entityType) || []
    return rules
      .filter((rule) => rule.fieldPath === fieldPath || rule.fieldPath === '*')
      .sort((a, b) => b.priority - a.priority)
  }

  /**
   * Apply specific resolution strategy
   */
  private async applySpecificStrategy(
    conflict: DataConflict,
    strategy: string
  ): Promise<ConflictResolution> {
    const strategyFn = this.resolutionStrategies.get(strategy)
    if (!strategyFn) {
      throw new Error(`Unknown resolution strategy: ${strategy}`)
    }

    return strategyFn(conflict)
  }

  /**
   * Get default resolution when no specific strategy is provided
   */
  private async getDefaultResolution(conflict: DataConflict): Promise<ConflictResolution> {
    return (
      conflict.suggestedResolution || {
        strategy: 'manual',
        resolvedValue: conflict.localValue,
        reasoning: 'Default to local value, requires manual review',
        confidence: 0.5,
        requiresApproval: true,
      }
    )
  }

  /**
   * Record conflict resolution as domain event
   */
  private async recordConflictResolution(
    conflict: DataConflict,
    resolution: ConflictResolution
  ): Promise<void> {
    try {
      await eventStore.appendEvent(
        conflict.entityId,
        conflict.entityType,
        'ConflictResolved',
        {
          conflictId: conflict.id,
          fieldPath: conflict.fieldPath,
          strategy: resolution.strategy,
          resolvedValue: resolution.resolvedValue,
          confidence: resolution.confidence,
          reasoning: resolution.reasoning,
        },
        {
          tenantId: conflict.tenantId,
          userId: 'system',
          source: 'conflict-resolution',
          correlationId: `conflict-${conflict.id}`,
          schemaVersion: '1.0.0',
        }
      )
    } catch (error) {}
  }

  /**
   * Store conflict history for analysis
   */
  private storeConflictHistory(entityId: string, conflicts: DataConflict[]): void {
    if (!this.conflictHistory.has(entityId)) {
      this.conflictHistory.set(entityId, [])
    }

    const history = this.conflictHistory.get(entityId)!
    history.push(...conflicts)

    // Keep only last 100 conflicts per entity
    if (history.length > 100) {
      history.splice(0, history.length - 100)
    }
  }

  /**
   * Initialize default business rules
   */
  private initializeDefaultRules(): void {
    const rules: BusinessRule[] = [
      {
        id: 'email-format-validation',
        name: 'Email Format Validation',
        entityType: 'Customer',
        fieldPath: 'email',
        condition: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        priority: 100,
        description: 'Email must be in valid format',
      },
      {
        id: 'revenue-positive',
        name: 'Revenue Must Be Positive',
        entityType: 'Customer',
        fieldPath: 'totalRevenue',
        condition: (value) => typeof value === 'number' && value >= 0,
        priority: 90,
        description: 'Revenue cannot be negative',
      },
      {
        id: 'phone-format',
        name: 'Phone Number Format',
        entityType: 'Customer',
        fieldPath: 'phone',
        condition: (value) => !value || /^\+?[\d\s\-\(\)]+$/.test(value),
        priority: 80,
        description: 'Phone number must be in valid format',
      },
    ]

    rules.forEach((rule) => {
      if (!this.businessRules.has(rule.entityType)) {
        this.businessRules.set(rule.entityType, [])
      }
      this.businessRules.get(rule.entityType)!.push(rule)
    })
  }

  /**
   * Initialize resolution strategies
   */
  private initializeResolutionStrategies(): void {
    this.resolutionStrategies.set('take_local', (conflict: DataConflict) => ({
      strategy: 'take_local',
      resolvedValue: conflict.localValue,
      reasoning: 'Manually selected local value',
      confidence: 1.0,
      requiresApproval: false,
    }))

    this.resolutionStrategies.set('take_remote', (conflict: DataConflict) => ({
      strategy: 'take_remote',
      resolvedValue: conflict.remoteValue,
      reasoning: 'Manually selected remote value',
      confidence: 1.0,
      requiresApproval: false,
    }))

    this.resolutionStrategies.set('latest_timestamp', (conflict: DataConflict) => {
      const isLocalNewer =
        conflict.businessContext?.timestamp1 > conflict.businessContext?.timestamp2
      return {
        strategy: 'latest_timestamp',
        resolvedValue: isLocalNewer ? conflict.localValue : conflict.remoteValue,
        reasoning: 'Selected value with latest timestamp',
        confidence: 0.8,
        requiresApproval: false,
      }
    })
  }

  /**
   * Add custom business rule
   */
  addBusinessRule(rule: BusinessRule): void {
    if (!this.businessRules.has(rule.entityType)) {
      this.businessRules.set(rule.entityType, [])
    }
    this.businessRules.get(rule.entityType)!.push(rule)
  }

  /**
   * Get conflict statistics
   */
  getConflictStatistics(): {
    totalConflicts: number
    autoResolvedCount: number
    manualResolvedCount: number
    conflictsByType: Record<string, number>
    conflictsBySeverity: Record<string, number>
  } {
    let totalConflicts = 0
    let autoResolvedCount = 0
    let manualResolvedCount = 0
    const conflictsByType: Record<string, number> = {}
    const conflictsBySeverity: Record<string, number> = {}

    for (const conflicts of this.conflictHistory.values()) {
      for (const conflict of conflicts) {
        totalConflicts++

        if (conflict.autoResolvable) {
          autoResolvedCount++
        } else {
          manualResolvedCount++
        }

        conflictsByType[conflict.conflictType] = (conflictsByType[conflict.conflictType] || 0) + 1
        conflictsBySeverity[conflict.severity] = (conflictsBySeverity[conflict.severity] || 0) + 1
      }
    }

    return {
      totalConflicts,
      autoResolvedCount,
      manualResolvedCount,
      conflictsByType,
      conflictsBySeverity,
    }
  }

  /**
   * Deep equality check
   */
  private deepEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true
    if (a == null || b == null) return false
    if (typeof a !== typeof b) return false

    if (typeof a === 'object') {
      const keysA = Object.keys(a)
      const keysB = Object.keys(b)
      if (keysA.length !== keysB.length) return false

      for (const key of keysA) {
        if (!keysB.includes(key) || !this.deepEqual(a[key], b[key])) {
          return false
        }
      }
      return true
    }

    return false
  }
}

// Global conflict resolution engine
export const conflictResolver = new ConflictResolutionEngine()
