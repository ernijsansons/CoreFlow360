/**
 * CoreFlow360 - Human Handoff System
 * Intelligent handoff from AI to human agents with context preservation
 */

import { WebSocket } from 'ws'
import { db } from '@/lib/db'
import { VoiceResponse } from 'twilio/lib/twiml/VoiceResponse'
import { twilioClient } from '@/lib/voice/twilio-client'

export enum HandoffTrigger {
  LOW_CONFIDENCE = 'low_confidence',
  CUSTOMER_REQUEST = 'customer_request',
  COMPLEX_ISSUE = 'complex_issue',
  HIGH_VALUE_LEAD = 'high_value_lead',
  TECHNICAL_ERROR = 'technical_error',
  ESCALATION_REQUIRED = 'escalation_required',
  APPOINTMENT_CONFLICT = 'appointment_conflict',
  BUDGET_DISCUSSION = 'budget_discussion',
}

export enum HandoffUrgency {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface HandoffContext {
  callSid: string
  leadId: string
  tenantId: string
  trigger: HandoffTrigger
  urgency: HandoffUrgency
  qualificationScore: number
  conversationSummary: string
  extractedData: Record<string, unknown>
  customerSentiment: 'positive' | 'neutral' | 'negative'
  transcript: string[]
  appointmentAttempted: boolean
  objections: string[]
  nextBestAction: string
  estimatedValue: number
  timeInConversation: number
}

export interface HumanAgent {
  id: string
  name: string
  skills: string[]
  currentLoad: number
  maxConcurrent: number
  available: boolean
  averageHandleTime: number
  specializations: string[]
}

/**
 * Human Handoff System with intelligent agent routing
 */
export class HumanHandoffSystem {
  private availableAgents: Map<string, HumanAgent> = new Map()
  private activeHandoffs: Map<string, HandoffContext> = new Map()

  constructor() {
    this.initializeAgentPool()
  }

  /**
   * Initialize available human agents
   */
  private initializeAgentPool(): void {
    // In production, this would load from database/HR system
    const defaultAgents: HumanAgent[] = [
      {
        id: 'agent_hvac_001',
        name: 'Mike Johnson',
        skills: ['HVAC', 'Technical Support', 'Emergency Response'],
        currentLoad: 0,
        maxConcurrent: 3,
        available: true,
        averageHandleTime: 480, // 8 minutes
        specializations: ['HVAC Emergency', 'System Replacement', 'Commercial HVAC'],
      },
      {
        id: 'agent_auto_001',
        name: 'Sarah Davis',
        skills: ['Auto Repair', 'Insurance Claims', 'Customer Service'],
        currentLoad: 0,
        maxConcurrent: 4,
        available: true,
        averageHandleTime: 360, // 6 minutes
        specializations: ['Insurance Claims', 'Collision Repair', 'Body Work'],
      },
      {
        id: 'agent_general_001',
        name: 'Alex Thompson',
        skills: ['General Business', 'Sales', 'Consultation'],
        currentLoad: 0,
        maxConcurrent: 5,
        available: true,
        averageHandleTime: 420, // 7 minutes
        specializations: ['B2B Sales', 'Consultation', 'Lead Qualification'],
      },
      {
        id: 'supervisor_001',
        name: 'Jennifer Martinez',
        skills: ['All Industries', 'Escalation', 'Management'],
        currentLoad: 0,
        maxConcurrent: 2,
        available: true,
        averageHandleTime: 600, // 10 minutes
        specializations: ['Escalation', 'High Value Leads', 'Complex Issues'],
      },
    ]

    defaultAgents.forEach((agent) => {
      this.availableAgents.set(agent.id, agent)
    })
  }

  /**
   * Initiate handoff to human agent
   */
  async initiateHandoff(context: HandoffContext): Promise<{
    success: boolean
    agent?: HumanAgent
    estimatedWaitTime?: number
    error?: string
  }> {
    try {
      // Find best available agent
      const agent = this.findBestAgent(context)

      if (!agent) {
        // No agents available - queue or provide callback
        return await this.handleNoAgentsAvailable(context)
      }

      // Reserve agent
      agent.currentLoad++
      this.activeHandoffs.set(context.callSid, context)

      // Create handoff record in database
      await this.createHandoffRecord(context, agent.id)

      // Prepare agent with context
      await this.prepareAgentContext(agent, context)

      // Execute handoff
      const handoffResult = await this.executeHandoff(context, agent)

      if (handoffResult.success) {
        return {
          success: true,
          agent,
          estimatedWaitTime: 0,
        }
      } else {
        // Handoff failed, release agent
        agent.currentLoad--
        this.activeHandoffs.delete(context.callSid)

        return {
          success: false,
          error: handoffResult.error,
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'System error during handoff',
      }
    }
  }

  /**
   * Find best available agent for handoff
   */
  private findBestAgent(context: HandoffContext): HumanAgent | null {
    const availableAgents = Array.from(this.availableAgents.values()).filter(
      (agent) => agent.available && agent.currentLoad < agent.maxConcurrent
    )

    if (availableAgents.length === 0) {
      return null
    }

    // Scoring algorithm for agent selection
    const scoredAgents = availableAgents.map((agent) => {
      let score = 0

      // Skill match (40% weight)
      const industryMatch = this.getIndustryFromContext(context)
      if (agent.skills.includes(industryMatch)) {
        score += 40
      }

      // Specialization match (30% weight)
      if (context.extractedData.serviceType) {
        const specializationMatch = agent.specializations.some((spec) =>
          spec.toLowerCase().includes(context.extractedData.serviceType.toLowerCase())
        )
        if (specializationMatch) score += 30
      }

      // Availability score (20% weight) - prefer agents with lower load
      const availabilityScore =
        ((agent.maxConcurrent - agent.currentLoad) / agent.maxConcurrent) * 20
      score += availabilityScore

      // Urgency match (10% weight)
      if (context.urgency === HandoffUrgency.CRITICAL) {
        if (agent.specializations.includes('Escalation')) {
          score += 10
        }
      }

      return { agent, score }
    })

    // Return highest scored agent
    scoredAgents.sort((a, b) => b.score - a.score)
    return scoredAgents[0].agent
  }

  /**
   * Extract industry from handoff context
   */
  private getIndustryFromContext(context: HandoffContext): string {
    // Extract from transcript or lead data
    const transcript = context.transcript.join(' ').toLowerCase()

    if (
      transcript.includes('hvac') ||
      transcript.includes('heating') ||
      transcript.includes('cooling')
    ) {
      return 'HVAC'
    } else if (
      transcript.includes('auto') ||
      transcript.includes('car') ||
      transcript.includes('vehicle')
    ) {
      return 'Auto Repair'
    } else {
      return 'General Business'
    }
  }

  /**
   * Handle case when no agents are available
   */
  private async handleNoAgentsAvailable(context: HandoffContext): Promise<{
    success: boolean
    estimatedWaitTime?: number
    error?: string
  }> {
    try {
      // Calculate estimated wait time based on agent loads
      const estimatedWaitTime = this.calculateWaitTime()

      // Offer callback or queue options
      const message = `I understand you'd like to speak with one of our specialists. Our current wait time is about ${Math.ceil(estimatedWaitTime / 60)} minutes. Would you prefer to hold, or can I schedule a callback for you?`

      // Send message to customer
      await this.sendCustomerMessage(context.callSid, message)

      // Store in callback queue
      await this.addToCallbackQueue(context, estimatedWaitTime)

      return {
        success: false,
        estimatedWaitTime,
        error: 'No agents available, offered callback',
      }
    } catch (error) {
      return {
        success: false,
        error: 'System error - callback will be arranged',
      }
    }
  }

  /**
   * Calculate estimated wait time
   */
  private calculateWaitTime(): number {
    const agents = Array.from(this.availableAgents.values())

    if (agents.length === 0) return 1800 // 30 minutes default

    // Find agent with shortest estimated completion time
    const shortestWait = Math.min(
      ...agents.map((agent) => {
        if (agent.currentLoad === 0) return 0
        return agent.averageHandleTime * agent.currentLoad
      })
    )

    return shortestWait
  }

  /**
   * Send message to customer via Twilio
   */
  private async sendCustomerMessage(callSid: string, message: string): Promise<void> {
    try {
      // This would integrate with your Twilio TTS system
      const twiml = new VoiceResponse()
      twiml.say(
        {
          voice: 'alice',
          language: 'en-US',
        },
        message
      )

      // Send TwiML response (implementation depends on your Twilio setup)
    } catch (error) {}
  }

  /**
   * Add to callback queue
   */
  private async addToCallbackQueue(
    context: HandoffContext,
    estimatedWaitTime: number
  ): Promise<void> {
    try {
      await db.callbackQueue.create({
        data: {
          callSid: context.callSid,
          leadId: context.leadId,
          tenantId: context.tenantId,
          priority: this.getCallbackPriority(context.urgency),
          requestedAt: new Date(),
          estimatedCallbackTime: new Date(Date.now() + estimatedWaitTime * 1000),
          reason: context.trigger,
          context: {
            qualificationScore: context.qualificationScore,
            extractedData: context.extractedData,
            conversationSummary: context.conversationSummary,
            customerSentiment: context.customerSentiment,
          },
        },
      })
    } catch (error) {}
  }

  /**
   * Get callback priority from urgency
   */
  private getCallbackPriority(urgency: HandoffUrgency): number {
    const priorities = {
      [HandoffUrgency.CRITICAL]: 1,
      [HandoffUrgency.HIGH]: 2,
      [HandoffUrgency.MEDIUM]: 3,
      [HandoffUrgency.LOW]: 4,
    }
    return priorities[urgency]
  }

  /**
   * Create handoff record in database
   */
  private async createHandoffRecord(context: HandoffContext, agentId: string): Promise<void> {
    try {
      await db.handoffLog.create({
        data: {
          callSid: context.callSid,
          leadId: context.leadId,
          tenantId: context.tenantId,
          agentId: agentId,
          trigger: context.trigger,
          urgency: context.urgency,
          qualificationScore: context.qualificationScore,
          handoffAt: new Date(),
          conversationSummary: context.conversationSummary,
          extractedData: context.extractedData,
          customerSentiment: context.customerSentiment,
          timeInConversation: context.timeInConversation,
          estimatedValue: context.estimatedValue,
        },
      })
    } catch (error) {}
  }

  /**
   * Prepare agent with conversation context
   */
  private async prepareAgentContext(agent: HumanAgent, context: HandoffContext): Promise<void> {
    const agentBriefing = {
      callSid: context.callSid,
      customerInfo: context.extractedData,
      qualificationScore: context.qualificationScore,
      conversationSummary: context.conversationSummary,
      keyPoints: [
        `Customer sentiment: ${context.customerSentiment}`,
        `Qualification score: ${context.qualificationScore}/10`,
        `Trigger: ${context.trigger}`,
        `Time in conversation: ${Math.round(context.timeInConversation / 60)}min`,
        `Estimated value: $${context.estimatedValue.toLocaleString()}`,
      ],
      nextBestAction: context.nextBestAction,
      objections: context.objections,
      transcript: context.transcript.slice(-10), // Last 10 exchanges
    }

    // Send briefing to agent system

    // In production, this would integrate with your agent dashboard/CRM
    // await this.sendAgentNotification(agent.id, agentBriefing)
  }

  /**
   * Execute the actual handoff
   */
  private async executeHandoff(
    context: HandoffContext,
    agent: HumanAgent
  ): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      // Update call log with handoff
      await db.callLog.update({
        where: { twilioCallSid: context.callSid },
        data: {
          status: 'IN_PROGRESS',
          metadata: {
            ...context.extractedData,
            handoffToAgent: agent.id,
            handoffReason: context.trigger,
            agentName: agent.name,
          },
        },
      })

      // In production, this would:
      // 1. Connect customer to agent (Twilio Conference, Queue, etc.)
      // 2. Notify agent dashboard
      // 3. Transfer call control

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to connect to agent',
      }
    }
  }

  /**
   * Complete handoff (called when agent takes over)
   */
  async completeHandoff(
    callSid: string,
    outcome: 'successful' | 'failed',
    notes?: string
  ): Promise<void> {
    try {
      const context = this.activeHandoffs.get(callSid)

      if (!context) {
        return
      }

      // Update handoff record
      await db.handoffLog.updateMany({
        where: { callSid: callSid },
        data: {
          completedAt: new Date(),
          outcome: outcome,
          agentNotes: notes,
        },
      })

      // Release agent capacity
      const agentId = (
        await db.handoffLog.findFirst({
          where: { callSid: callSid },
          orderBy: { handoffAt: 'desc' },
        })
      )?.agentId

      if (agentId) {
        const agent = this.availableAgents.get(agentId)
        if (agent && agent.currentLoad > 0) {
          agent.currentLoad--
        }
      }

      // Remove from active handoffs
      this.activeHandoffs.delete(callSid)
    } catch (error) {}
  }

  /**
   * Get handoff analytics
   */
  async getHandoffAnalytics(timeframe: 'hour' | 'day' | 'week' = 'day'): Promise<{
    totalHandoffs: number
    successRate: number
    averageHandoffTime: number
    topTriggers: Array<{ trigger: string; count: number }>
    agentPerformance: Array<{ agentId: string; handoffs: number; successRate: number }>
  }> {
    try {
      const timeWindow = {
        hour: new Date(Date.now() - 60 * 60 * 1000),
        day: new Date(Date.now() - 24 * 60 * 60 * 1000),
        week: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      }[timeframe]

      const handoffs = await db.handoffLog.findMany({
        where: {
          handoffAt: { gte: timeWindow },
        },
      })

      const totalHandoffs = handoffs.length
      const successfulHandoffs = handoffs.filter((h) => h.outcome === 'successful').length
      const successRate = totalHandoffs > 0 ? successfulHandoffs / totalHandoffs : 0

      // Calculate average handoff time
      const completedHandoffs = handoffs.filter((h) => h.completedAt)
      const averageHandoffTime =
        completedHandoffs.length > 0
          ? completedHandoffs.reduce((sum, h) => {
              return sum + (h.completedAt!.getTime() - h.handoffAt.getTime())
            }, 0) /
            completedHandoffs.length /
            1000
          : 0

      // Top triggers
      const triggerCounts = handoffs.reduce(
        (acc, h) => {
          acc[h.trigger] = (acc[h.trigger] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      )

      const topTriggers = Object.entries(triggerCounts)
        .map(([trigger, count]) => ({ trigger, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Agent performance
      const agentStats = handoffs.reduce(
        (acc, h) => {
          if (!acc[h.agentId]) {
            acc[h.agentId] = { total: 0, successful: 0 }
          }
          acc[h.agentId].total++
          if (h.outcome === 'successful') {
            acc[h.agentId].successful++
          }
          return acc
        },
        {} as Record<string, { total: number; successful: number }>
      )

      const agentPerformance = Object.entries(agentStats).map(([agentId, stats]) => ({
        agentId,
        handoffs: stats.total,
        successRate: stats.total > 0 ? stats.successful / stats.total : 0,
      }))

      return {
        totalHandoffs,
        successRate,
        averageHandoffTime,
        topTriggers,
        agentPerformance,
      }
    } catch (error) {
      return {
        totalHandoffs: 0,
        successRate: 0,
        averageHandoffTime: 0,
        topTriggers: [],
        agentPerformance: [],
      }
    }
  }

  /**
   * Update agent availability
   */
  updateAgentAvailability(agentId: string, available: boolean): void {
    const agent = this.availableAgents.get(agentId)
    if (agent) {
      agent.available = available
    }
  }

  /**
   * Get current system status
   */
  getSystemStatus(): {
    totalAgents: number
    availableAgents: number
    activeHandoffs: number
    averageWaitTime: number
  } {
    const agents = Array.from(this.availableAgents.values())
    const totalAgents = agents.length
    const availableAgents = agents.filter(
      (a) => a.available && a.currentLoad < a.maxConcurrent
    ).length
    const activeHandoffs = this.activeHandoffs.size
    const averageWaitTime = this.calculateWaitTime()

    return {
      totalAgents,
      availableAgents,
      activeHandoffs,
      averageWaitTime,
    }
  }
}

// Export singleton instance
export const humanHandoffSystem = new HumanHandoffSystem()
