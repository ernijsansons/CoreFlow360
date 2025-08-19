/**
 * CoreFlow360 - Subscription-Aware Event Bus
 * Event system that filters cross-module events based on active subscriptions
 */

import { EventEmitter } from 'events'
import { moduleManager } from '@/services/subscription/module-manager'

export interface ModuleEvent {
  id: string
  type: string
  sourceModule: string
  targetModule?: string
  tenantId: string
  userId?: string
  payload: Record<string, unknown>
  metadata: {
    timestamp: Date
    priority: 'low' | 'medium' | 'high' | 'critical'
    requiresSubscription: boolean
    crossModule: boolean
  }
}

export interface EventSubscription {
  id: string
  tenantId: string
  sourceModule: string
  targetModule: string
  eventTypes: string[]
  isActive: boolean
  handler: EventHandler
}

export type EventHandler = (event: ModuleEvent) => Promise<void> | void

export interface SubscriptionAwareEventBus {
  publishEvent(event: Omit<ModuleEvent, 'id' | 'metadata'>): Promise<void>
  subscribeToEvents(subscription: Omit<EventSubscription, 'id'>): Promise<string>
  unsubscribeFromEvents(subscriptionId: string): Promise<void>
  filterEventsBySubscription(events: ModuleEvent[], activeModules: string[]): ModuleEvent[]
  enableCrossModuleEvents(
    sourceModule: string,
    targetModule: string,
    tenantId: string
  ): Promise<boolean>
}

export class CoreFlowEventBus extends EventEmitter implements SubscriptionAwareEventBus {
  private subscriptions: Map<string, EventSubscription> = new Map()
  private moduleEventMap: Map<string, string[]> = new Map()
  private tenantSubscriptionCache: Map<string, { modules: string[]; timestamp: number }> = new Map()

  constructor() {
    super()
    this.initializeModuleEventMap()
    this.setMaxListeners(1000) // Support many concurrent subscriptions
  }

  /**
   * Initialize which events each module can produce/consume
   */
  private initializeModuleEventMap(): void {
    this.moduleEventMap.set('crm', [
      'lead.created',
      'lead.converted',
      'customer.created',
      'customer.updated',
      'deal.created',
      'deal.won',
      'deal.lost',
      'interaction.logged',
      'quote.generated',
    ])

    this.moduleEventMap.set('accounting', [
      'invoice.created',
      'invoice.paid',
      'payment.received',
      'expense.recorded',
      'budget.exceeded',
      'financial.report.generated',
    ])

    this.moduleEventMap.set('hr', [
      'employee.hired',
      'employee.terminated',
      'performance.reviewed',
      'leave.requested',
      'training.completed',
      'salary.changed',
    ])

    this.moduleEventMap.set('inventory', [
      'stock.low',
      'stock.out',
      'purchase.requested',
      'item.received',
      'inventory.counted',
      'supplier.updated',
    ])

    this.moduleEventMap.set('projects', [
      'project.created',
      'project.completed',
      'task.assigned',
      'task.completed',
      'milestone.reached',
      'budget.updated',
    ])

    this.moduleEventMap.set('marketing', [
      'campaign.launched',
      'campaign.completed',
      'lead.nurtured',
      'email.opened',
      'conversion.tracked',
      'audience.segmented',
    ])
  }

  /**
   * Publish an event with subscription filtering
   */
  async publishEvent(eventData: Omit<ModuleEvent, 'id' | 'metadata'>): Promise<void> {
    const event: ModuleEvent = {
      ...eventData,
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
      metadata: {
        timestamp: new Date(),
        priority: this.determineEventPriority(eventData.type),
        requiresSubscription: this.doesEventRequireSubscription(
          eventData.type,
          eventData.sourceModule,
          eventData.targetModule
        ),
        crossModule: !!eventData.targetModule && eventData.targetModule !== eventData.sourceModule,
      },
    }

    console.log(
      `📡 Publishing event: ${event.type} from ${event.sourceModule}${event.targetModule ? ` to ${event.targetModule}` : ''}`
    )

    // Check if tenant has required subscriptions
    const hasRequiredSubscriptions = await this.validateEventSubscriptionRequirements(event)

    if (!hasRequiredSubscriptions) {
      console.log(
        `⚠️ Event ${event.type} blocked - insufficient subscription for tenant ${event.tenantId}`
      )

      // Optionally store blocked events for analytics
      await this.logBlockedEvent(event, 'insufficient_subscription')
      return
    }

    // Filter and notify subscribers
    const eligibleSubscriptions = await this.getEligibleSubscriptions(event)

    for (const subscription of eligibleSubscriptions) {
      try {
        await subscription.handler(event)
      } catch (error) {
        await this.logEventDeliveryError(event, subscription.id, error)
      }
    }

    // Store event for audit and analytics
    await this.storeEvent(event, eligibleSubscriptions.length)

    // Emit to internal listeners
    this.emit('event', event)
    this.emit(`event:${event.type}`, event)
    this.emit(`module:${event.sourceModule}`, event)
  }

  /**
   * Subscribe to events with module filtering
   */
  async subscribeToEvents(subscriptionData: Omit<EventSubscription, 'id'>): Promise<string> {
    const subscription: EventSubscription = {
      ...subscriptionData,
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
    }

    // Validate subscription permissions
    const canSubscribe = await this.validateSubscriptionPermissions(subscription)

    if (!canSubscribe) {
      throw new Error(
        `Subscription not allowed: ${subscription.tenantId} cannot subscribe to ${subscription.sourceModule} -> ${subscription.targetModule} events`
      )
    }

    this.subscriptions.set(subscription.id, subscription)

    console.log(
      `📥 Subscription created: ${subscription.id} for ${subscription.sourceModule} -> ${subscription.targetModule}`
    )

    return subscription.id
  }

  /**
   * Unsubscribe from events
   */
  async unsubscribeFromEvents(subscriptionId: string): Promise<void> {
    const subscription = this.subscriptions.get(subscriptionId)

    if (subscription) {
      this.subscriptions.delete(subscriptionId)
    }
  }

  /**
   * Filter events based on active module subscriptions
   */
  filterEventsBySubscription(events: ModuleEvent[], activeModules: string[]): ModuleEvent[] {
    return events.filter((event) => {
      // Allow events from active modules
      if (!activeModules.includes(event.sourceModule)) {
        return false
      }

      // Allow cross-module events only if both modules are active
      if (event.metadata.crossModule && event.targetModule) {
        return activeModules.includes(event.targetModule)
      }

      return true
    })
  }

  /**
   * Enable cross-module event flow
   */
  async enableCrossModuleEvents(
    sourceModule: string,
    targetModule: string,
    tenantId: string
  ): Promise<boolean> {
    const activeModules = await this.getTenantActiveModules(tenantId)

    // Check if both modules are active
    if (!activeModules.includes(sourceModule) || !activeModules.includes(targetModule)) {
      return false
    }

    // Check if modules support cross-communication
    const sourceEvents = this.moduleEventMap.get(sourceModule) || []
    const crossModuleEvents = this.getCrossModuleEvents(sourceModule, targetModule)

    if (crossModuleEvents.length === 0) {
      return false
    }

    console.log(
      `✅ Cross-module events enabled: ${sourceModule} -> ${targetModule} (${crossModuleEvents.length} event types)`
    )
    return true
  }

  /**
   * Private helper methods
   */
  private async validateEventSubscriptionRequirements(event: ModuleEvent): Promise<boolean> {
    if (!event.metadata.requiresSubscription) {
      return true
    }

    const activeModules = await this.getTenantActiveModules(event.tenantId)

    // Check source module subscription
    if (!activeModules.includes(event.sourceModule)) {
      return false
    }

    // Check target module subscription for cross-module events
    if (event.metadata.crossModule && event.targetModule) {
      return activeModules.includes(event.targetModule)
    }

    return true
  }

  private async getEligibleSubscriptions(event: ModuleEvent): Promise<EventSubscription[]> {
    const eligibleSubscriptions: EventSubscription[] = []

    for (const subscription of this.subscriptions.values()) {
      // Check tenant match
      if (subscription.tenantId !== event.tenantId) continue

      // Check if subscription is active
      if (!subscription.isActive) continue

      // Check module match
      if (subscription.sourceModule !== event.sourceModule) continue

      // Check event type match
      if (!subscription.eventTypes.includes(event.type) && !subscription.eventTypes.includes('*'))
        continue

      // Check target module for cross-module events
      if (event.targetModule && subscription.targetModule !== event.targetModule) continue

      // Verify subscription permissions
      const hasPermission = await this.validateSubscriptionPermissions(subscription)
      if (!hasPermission) continue

      eligibleSubscriptions.push(subscription)
    }

    return eligibleSubscriptions
  }

  private async validateSubscriptionPermissions(subscription: EventSubscription): Promise<boolean> {
    const activeModules = await this.getTenantActiveModules(subscription.tenantId)

    // Both source and target modules must be active for cross-module subscriptions
    if (!activeModules.includes(subscription.sourceModule)) {
      return false
    }

    if (subscription.targetModule && !activeModules.includes(subscription.targetModule)) {
      return false
    }

    return true
  }

  private async getTenantActiveModules(tenantId: string): Promise<string[]> {
    // Check cache first (valid for 2 minutes)
    const cached = this.tenantSubscriptionCache.get(tenantId)
    if (cached && Date.now() - cached.timestamp < 2 * 60 * 1000) {
      return cached.modules
    }

    // Fetch from module manager
    const activeModules = await moduleManager.getActiveModules(tenantId)

    // Update cache
    this.tenantSubscriptionCache.set(tenantId, {
      modules: activeModules,
      timestamp: Date.now(),
    })

    return activeModules
  }

  private determineEventPriority(eventType: string): 'low' | 'medium' | 'high' | 'critical' {
    const highPriorityEvents = ['deal.won', 'payment.received', 'stock.out', 'employee.terminated']
    const criticalEvents = ['budget.exceeded', 'security.breach', 'system.down']

    if (criticalEvents.some((e) => eventType.includes(e))) return 'critical'
    if (highPriorityEvents.some((e) => eventType.includes(e))) return 'high'
    if (eventType.includes('.created') || eventType.includes('.updated')) return 'medium'

    return 'low'
  }

  private doesEventRequireSubscription(
    eventType: string,
    sourceModule: string,
    targetModule?: string
  ): boolean {
    // All cross-module events require subscriptions
    if (targetModule && targetModule !== sourceModule) return true

    // Some high-value events require subscription even within module
    const subscriptionRequiredEvents = ['analytics', 'prediction', 'optimization', 'intelligence']

    return subscriptionRequiredEvents.some((keyword) => eventType.toLowerCase().includes(keyword))
  }

  private getCrossModuleEvents(sourceModule: string, targetModule: string): string[] {
    const crossModuleEventMap: Record<string, string[]> = {
      'crm->accounting': ['deal.won', 'quote.accepted', 'payment.overdue'],
      'crm->hr': ['deal.won', 'customer.complaint', 'sales.performance'],
      'accounting->crm': ['invoice.paid', 'payment.failed', 'budget.status'],
      'hr->crm': ['employee.performance', 'sales.quota', 'team.changes'],
      'inventory->crm': ['stock.status', 'product.updates', 'supplier.changes'],
      'projects->hr': ['resource.needed', 'milestone.reached', 'deadline.missed'],
    }

    const key = `${sourceModule}->${targetModule}`
    return crossModuleEventMap[key] || []
  }

  private async storeEvent(_event: ModuleEvent, _deliveryCount: number): Promise<void> {
    // In production, store events for analytics and debugging
  }

  private async logBlockedEvent(_event: ModuleEvent, _reason: string): Promise<void> {
    // Log blocked events for analytics
  }

  private async logEventDeliveryError(
    _event: ModuleEvent,
    _subscriptionId: string,
    error: Error
  ): Promise<void> {
    // Log delivery errors for monitoring
  }

  /**
   * Clear tenant cache (useful for testing or when subscriptions change)
   */
  public clearTenantCache(tenantId?: string): void {
    if (tenantId) {
      this.tenantSubscriptionCache.delete(tenantId)
    } else {
      this.tenantSubscriptionCache.clear()
    }
  }

  /**
   * Get event statistics
   */
  public getEventStats(): {
    activeSubscriptions: number
    totalEvents: number
    moduleEventTypes: Record<string, number>
  } {
    const moduleEventTypes: Record<string, number> = {}

    for (const [module, events] of this.moduleEventMap.entries()) {
      moduleEventTypes[module] = events.length
    }

    return {
      activeSubscriptions: this.subscriptions.size,
      totalEvents: this.listenerCount('event'),
      moduleEventTypes,
    }
  }
}

// Export singleton instance
export const eventBus = new CoreFlowEventBus()

// Export helper functions
export async function publishModuleEvent(
  sourceModule: string,
  eventType: string,
  tenantId: string,
  payload: Record<string, unknown>,
  targetModule?: string,
  userId?: string
): Promise<void> {
  await eventBus.publishEvent({
    type: eventType,
    sourceModule,
    targetModule,
    tenantId,
    userId,
    payload,
  })
}

export async function subscribeToModuleEvents(
  tenantId: string,
  sourceModule: string,
  targetModule: string,
  eventTypes: string[],
  handler: EventHandler
): Promise<string> {
  return await eventBus.subscribeToEvents({
    tenantId,
    sourceModule,
    targetModule,
    eventTypes,
    isActive: true,
    handler,
  })
}

// CoreFlowEventBus already exported as class above
