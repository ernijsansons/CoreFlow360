/**
 * CoreFlow360 - Event Projections
 *
 * CQRS read models and projections for business intelligence and real-time views
 */

import { DomainEvent, eventStore } from './event-store'
import {
  EVENT_TYPES,
  isCustomerEvent,
  isSubscriptionEvent,
  isVoiceCallEvent,
  isWebhookEvent,
  isSecurityEvent,
} from './domain-events'
import { prisma } from '@/lib/db'

// Customer Read Model
export interface CustomerReadModel {
  id: string
  tenantId: string
  name: string
  email?: string
  phone?: string
  company?: string
  industry?: string
  source?: string
  customFields: Record<string, unknown>

  // Computed fields from events
  totalInteractions: number
  lastInteractionDate?: Date
  subscriptionStatus?: 'active' | 'cancelled' | 'trial' | 'none'
  lifetimeValue: number
  riskScore: number
  tags: string[]

  // Metadata
  createdAt: Date
  updatedAt: Date
  version: number
}

// Subscription Analytics Read Model
export interface SubscriptionAnalytics {
  id: string
  tenantId: string
  customerId: string

  // Current state
  status: 'active' | 'cancelled' | 'trial' | 'past_due'
  currentModules: string[]
  monthlyRevenue: number

  // Analytics
  churnRisk: number
  usageMetrics: Record<string, number>
  expansionOpportunity: number

  // Historical data
  totalUpgrades: number
  totalDowngrades: number
  totalCancellations: number
  averageLifetime: number

  createdAt: Date
  updatedAt: Date
}

// Voice Call Analytics
export interface VoiceCallAnalytics {
  tenantId: string
  date: Date

  // Volume metrics
  totalCalls: number
  inboundCalls: number
  outboundCalls: number

  // Performance metrics
  averageDuration: number
  connectionRate: number
  qualificationRate: number
  appointmentRate: number

  // Quality metrics
  averageQualificationScore: number
  transcriptionAccuracy: number
  customerSatisfaction: number

  // Cost metrics
  totalCost: number
  costPerCall: number
  costPerQualifiedLead: number
}

// Security Dashboard
export interface SecurityDashboard {
  tenantId: string
  date: Date

  // Threat metrics
  totalViolations: number
  criticalViolations: number
  highViolations: number

  // Attack patterns
  authenticationFailures: number
  rateLimitExceeded: number
  suspiciousActivities: number
  dataBreachAttempts: number

  // Response metrics
  averageResponseTime: number
  automaticBlocks: number
  manualInvestigations: number

  // Top threats
  topIpAddresses: Array<{ ip: string; count: number }>
  topUserAgents: Array<{ userAgent: string; count: number }>
}

export class EventProjectionManager {
  constructor() {
    this.setupEventHandlers()
  }

  private setupEventHandlers(): void {
    // Customer projections
    eventStore.onEvent(EVENT_TYPES.CUSTOMER_CREATED, this.handleCustomerCreated.bind(this))
    eventStore.onEvent(EVENT_TYPES.CUSTOMER_UPDATED, this.handleCustomerUpdated.bind(this))
    eventStore.onEvent(EVENT_TYPES.CUSTOMER_DELETED, this.handleCustomerDeleted.bind(this))

    // Subscription projections
    eventStore.onEvent(EVENT_TYPES.SUBSCRIPTION_CREATED, this.handleSubscriptionCreated.bind(this))
    eventStore.onEvent(EVENT_TYPES.SUBSCRIPTION_UPDATED, this.handleSubscriptionUpdated.bind(this))
    eventStore.onEvent(
      EVENT_TYPES.SUBSCRIPTION_CANCELLED,
      this.handleSubscriptionCancelled.bind(this)
    )

    // Voice call projections
    eventStore.onEvent(EVENT_TYPES.CALL_STARTED, this.handleCallStarted.bind(this))
    eventStore.onEvent(EVENT_TYPES.CALL_ENDED, this.handleCallEnded.bind(this))

    // Security projections
    eventStore.onEvent(
      EVENT_TYPES.SECURITY_VIOLATION_DETECTED,
      this.handleSecurityViolation.bind(this)
    )

    // Webhook projections
    eventStore.onEvent(EVENT_TYPES.WEBHOOK_PROCESSED, this.handleWebhookProcessed.bind(this))
  }

  // Customer Read Model Handlers
  private async handleCustomerCreated(event: DomainEvent): Promise<void> {
    if (!isCustomerEvent(event)) return

    try {
      const customerData = event.eventData as unknown

      await prisma.customerReadModel.create({
        data: {
          id: event.aggregateId,
          tenantId: event.tenantId,
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          company: customerData.company,
          industry: customerData.industry,
          source: customerData.source,
          customFields: customerData.customFields || {},
          totalInteractions: 0,
          lifetimeValue: 0,
          riskScore: 0,
          tags: [],
          createdAt: event.timestamp,
          updatedAt: event.timestamp,
          version: event.version,
        },
      })
    } catch (error) {}
  }

  private async handleCustomerUpdated(event: DomainEvent): Promise<void> {
    if (!isCustomerEvent(event)) return

    try {
      const updateData = event.eventData as unknown

      await prisma.customerReadModel.update({
        where: { id: event.aggregateId },
        data: {
          ...updateData.updatedValues,
          updatedAt: event.timestamp,
          version: event.version,
        },
      })
    } catch (error) {}
  }

  private async handleCustomerDeleted(event: DomainEvent): Promise<void> {
    if (!isCustomerEvent(event)) return

    try {
      // Soft delete - mark as deleted but keep for audit
      await prisma.customerReadModel.update({
        where: { id: event.aggregateId },
        data: {
          tags: { push: 'deleted' },
          updatedAt: event.timestamp,
          version: event.version,
        },
      })
    } catch (error) {}
  }

  // Subscription Analytics Handlers
  private async handleSubscriptionCreated(event: DomainEvent): Promise<void> {
    if (!isSubscriptionEvent(event)) return

    try {
      const subscriptionData = event.eventData as unknown

      await prisma.subscriptionAnalytics.create({
        data: {
          id: event.aggregateId,
          tenantId: event.tenantId,
          customerId: subscriptionData.customerId,
          status: 'active',
          currentModules: subscriptionData.modules,
          monthlyRevenue: subscriptionData.price,
          churnRisk: 0.1, // Initial low risk
          usageMetrics: {},
          expansionOpportunity: this.calculateExpansionOpportunity(subscriptionData.modules),
          totalUpgrades: 0,
          totalDowngrades: 0,
          totalCancellations: 0,
          averageLifetime: 0,
          createdAt: event.timestamp,
          updatedAt: event.timestamp,
        },
      })

      // Update customer lifetime value
      await this.updateCustomerLifetimeValue(subscriptionData.customerId, subscriptionData.price)
    } catch (error) {}
  }

  private async handleSubscriptionUpdated(event: DomainEvent): Promise<void> {
    if (!isSubscriptionEvent(event)) return

    try {
      const updateData = event.eventData as unknown
      const isUpgrade = updateData.newPrice > updateData.previousPrice
      const isDowngrade = updateData.newPrice < updateData.previousPrice

      await prisma.subscriptionAnalytics.update({
        where: { id: event.aggregateId },
        data: {
          currentModules: updateData.newModules,
          monthlyRevenue: updateData.newPrice,
          totalUpgrades: isUpgrade ? { increment: 1 } : undefined,
          totalDowngrades: isDowngrade ? { increment: 1 } : undefined,
          expansionOpportunity: this.calculateExpansionOpportunity(updateData.newModules),
          churnRisk: isDowngrade ? 0.3 : 0.1, // Increase churn risk on downgrades
          updatedAt: event.timestamp,
        },
      })
    } catch (error) {}
  }

  private async handleSubscriptionCancelled(event: DomainEvent): Promise<void> {
    if (!isSubscriptionEvent(event)) return

    try {
      const cancellationData = event.eventData as unknown

      await prisma.subscriptionAnalytics.update({
        where: { id: event.aggregateId },
        data: {
          status: 'cancelled',
          monthlyRevenue: 0,
          totalCancellations: { increment: 1 },
          churnRisk: 1.0, // Churned
          updatedAt: event.timestamp,
        },
      })
    } catch (error) {}
  }

  // Voice Call Analytics Handlers
  private async handleCallStarted(event: DomainEvent): Promise<void> {
    if (!isVoiceCallEvent(event)) return

    try {
      const callData = event.eventData as unknown
      const date = new Date(event.timestamp)
      date.setHours(0, 0, 0, 0)

      // Upsert daily call analytics
      await prisma.voiceCallAnalytics.upsert({
        where: {
          tenantId_date: {
            tenantId: event.tenantId,
            date,
          },
        },
        update: {
          totalCalls: { increment: 1 },
          inboundCalls: callData.direction === 'inbound' ? { increment: 1 } : undefined,
          outboundCalls: callData.direction === 'outbound' ? { increment: 1 } : undefined,
        },
        create: {
          tenantId: event.tenantId,
          date,
          totalCalls: 1,
          inboundCalls: callData.direction === 'inbound' ? 1 : 0,
          outboundCalls: callData.direction === 'outbound' ? 1 : 0,
          averageDuration: 0,
          connectionRate: 0,
          qualificationRate: 0,
          appointmentRate: 0,
          averageQualificationScore: 0,
          transcriptionAccuracy: 0,
          customerSatisfaction: 0,
          totalCost: 0,
          costPerCall: 0,
          costPerQualifiedLead: 0,
        },
      })
    } catch (error) {}
  }

  private async handleCallEnded(event: DomainEvent): Promise<void> {
    if (!isVoiceCallEvent(event)) return

    try {
      const callData = event.eventData as unknown
      const date = new Date(event.timestamp)
      date.setHours(0, 0, 0, 0)

      // Update analytics with call completion data
      const analytics = await prisma.voiceCallAnalytics.findUnique({
        where: {
          tenantId_date: {
            tenantId: event.tenantId,
            date,
          },
        },
      })

      if (analytics) {
        const totalCalls = analytics.totalCalls
        const newAvgDuration =
          (analytics.averageDuration * (totalCalls - 1) + callData.duration) / totalCalls

        await prisma.voiceCallAnalytics.update({
          where: {
            tenantId_date: {
              tenantId: event.tenantId,
              date,
            },
          },
          data: {
            averageDuration: newAvgDuration,
            connectionRate:
              callData.status === 'completed'
                ? (analytics.connectionRate * (totalCalls - 1) + 1) / totalCalls
                : analytics.connectionRate,
            qualificationRate:
              callData.qualificationScore > 0.7
                ? (analytics.qualificationRate * (totalCalls - 1) + 1) / totalCalls
                : analytics.qualificationRate,
            appointmentRate: callData.appointmentScheduled
              ? (analytics.appointmentRate * (totalCalls - 1) + 1) / totalCalls
              : analytics.appointmentRate,
            averageQualificationScore: callData.qualificationScore
              ? (analytics.averageQualificationScore * (totalCalls - 1) +
                  callData.qualificationScore) /
                totalCalls
              : analytics.averageQualificationScore,
          },
        })
      }
    } catch (error) {}
  }

  // Security Dashboard Handlers
  private async handleSecurityViolation(event: DomainEvent): Promise<void> {
    if (!isSecurityEvent(event)) return

    try {
      const violationData = event.eventData as unknown
      const date = new Date(event.timestamp)
      date.setHours(0, 0, 0, 0)

      await prisma.securityDashboard.upsert({
        where: {
          tenantId_date: {
            tenantId: event.tenantId,
            date,
          },
        },
        update: {
          totalViolations: { increment: 1 },
          criticalViolations: violationData.severity === 'critical' ? { increment: 1 } : undefined,
          highViolations: violationData.severity === 'high' ? { increment: 1 } : undefined,
          authenticationFailures:
            violationData.violationType === 'authentication_failure' ? { increment: 1 } : undefined,
          rateLimitExceeded:
            violationData.violationType === 'rate_limit_exceeded' ? { increment: 1 } : undefined,
          suspiciousActivities:
            violationData.violationType === 'suspicious_activity' ? { increment: 1 } : undefined,
          dataBreachAttempts:
            violationData.violationType === 'data_breach_attempt' ? { increment: 1 } : undefined,
        },
        create: {
          tenantId: event.tenantId,
          date,
          totalViolations: 1,
          criticalViolations: violationData.severity === 'critical' ? 1 : 0,
          highViolations: violationData.severity === 'high' ? 1 : 0,
          authenticationFailures: violationData.violationType === 'authentication_failure' ? 1 : 0,
          rateLimitExceeded: violationData.violationType === 'rate_limit_exceeded' ? 1 : 0,
          suspiciousActivities: violationData.violationType === 'suspicious_activity' ? 1 : 0,
          dataBreachAttempts: violationData.violationType === 'data_breach_attempt' ? 1 : 0,
          averageResponseTime: 0,
          automaticBlocks: 0,
          manualInvestigations: 0,
          topIpAddresses: [],
          topUserAgents: [],
        },
      })
    } catch (error) {}
  }

  // Webhook Processing Handlers
  private async handleWebhookProcessed(event: DomainEvent): Promise<void> {
    if (!isWebhookEvent(event)) return

    try {
      const webhookData = event.eventData as unknown

      // Update customer interaction count if webhook relates to customer
      if (webhookData.correlatedEntityType === 'Customer' && webhookData.correlatedEntityId) {
        await prisma.customerReadModel.update({
          where: { id: webhookData.correlatedEntityId },
          data: {
            totalInteractions: { increment: 1 },
            lastInteractionDate: event.timestamp,
          },
        })
      }
    } catch (error) {}
  }

  // Helper Methods
  private calculateExpansionOpportunity(currentModules: string[]): number {
    const allModules = ['CRM', 'Accounting', 'HR', 'Inventory', 'Analytics', 'Voice', 'AI']
    const availableModules = allModules.filter((m) => !currentModules.includes(m))
    return availableModules.length / allModules.length
  }

  private async updateCustomerLifetimeValue(
    customerId: string,
    monthlyRevenue: number
  ): Promise<void> {
    try {
      // Simple LTV calculation: Monthly Revenue * 12 (assumed annual retention)
      const ltv = monthlyRevenue * 12

      await prisma.customerReadModel.update({
        where: { id: customerId },
        data: {
          lifetimeValue: ltv,
        },
      })
    } catch (error) {}
  }

  // Public query methods for read models
  async getCustomerReadModel(customerId: string): Promise<CustomerReadModel | null> {
    return prisma.customerReadModel.findUnique({
      where: { id: customerId },
    }) as Promise<CustomerReadModel | null>
  }

  async getSubscriptionAnalytics(subscriptionId: string): Promise<SubscriptionAnalytics | null> {
    return prisma.subscriptionAnalytics.findUnique({
      where: { id: subscriptionId },
    }) as Promise<SubscriptionAnalytics | null>
  }

  async getVoiceCallAnalytics(tenantId: string, date: Date): Promise<VoiceCallAnalytics | null> {
    return prisma.voiceCallAnalytics.findUnique({
      where: {
        tenantId_date: { tenantId, date },
      },
    }) as Promise<VoiceCallAnalytics | null>
  }

  async getSecurityDashboard(tenantId: string, date: Date): Promise<SecurityDashboard | null> {
    return prisma.securityDashboard.findUnique({
      where: {
        tenantId_date: { tenantId, date },
      },
    }) as Promise<SecurityDashboard | null>
  }

  // Rebuild projections from events
  async rebuildProjections(fromDate?: Date): Promise<void> {
    const filters: unknown = {}
    if (fromDate) {
      filters.startTime = fromDate
    }

    const { events } = await eventStore.queryEvents(filters)

    for (const event of events) {
      // Re-process each event through the appropriate handler
      const handlers = this.getHandlersForEvent(event.eventType)
      for (const handler of handlers) {
        await handler(event)
      }
    }
  }

  private getHandlersForEvent(eventType: string): Function[] {
    const handlerMap: Record<string, Function[]> = {
      [EVENT_TYPES.CUSTOMER_CREATED]: [this.handleCustomerCreated.bind(this)],
      [EVENT_TYPES.CUSTOMER_UPDATED]: [this.handleCustomerUpdated.bind(this)],
      [EVENT_TYPES.CUSTOMER_DELETED]: [this.handleCustomerDeleted.bind(this)],
      [EVENT_TYPES.SUBSCRIPTION_CREATED]: [this.handleSubscriptionCreated.bind(this)],
      [EVENT_TYPES.SUBSCRIPTION_UPDATED]: [this.handleSubscriptionUpdated.bind(this)],
      [EVENT_TYPES.SUBSCRIPTION_CANCELLED]: [this.handleSubscriptionCancelled.bind(this)],
      [EVENT_TYPES.CALL_STARTED]: [this.handleCallStarted.bind(this)],
      [EVENT_TYPES.CALL_ENDED]: [this.handleCallEnded.bind(this)],
      [EVENT_TYPES.SECURITY_VIOLATION_DETECTED]: [this.handleSecurityViolation.bind(this)],
      [EVENT_TYPES.WEBHOOK_PROCESSED]: [this.handleWebhookProcessed.bind(this)],
    }

    return handlerMap[eventType] || []
  }
}

// Global projection manager instance
export const projectionManager = new EventProjectionManager()
