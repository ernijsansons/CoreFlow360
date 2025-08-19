/**
 * AI Workflow Integrations
 * Connects AI conversation interface with business workflows
 */

import { prisma } from '@/lib/db'
import { z } from 'zod'
import { langChainOrchestrator } from './langchain-orchestrator'
import { crewAIOrchestrator } from './crewai-orchestrator'

// Workflow action schemas
const createCustomerSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
})

const createDealSchema = z.object({
  title: z.string(),
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  amount: z.number(),
  stage: z.enum(['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).default('prospecting'),
  probability: z.number().min(0).max(100).default(20),
  expectedCloseDate: z.string().optional(),
  notes: z.string().optional(),
})

const scheduleMeetingSchema = z.object({
  title: z.string(),
  attendees: z.array(z.string()),
  startTime: z.string(),
  duration: z.number().default(60), // minutes
  location: z.string().optional(),
  description: z.string().optional(),
})

export class WorkflowIntegration {
  /**
   * Create a new customer from AI conversation
   */
  async createCustomer(params: z.infer<typeof createCustomerSchema>, tenantId: string, userId: string) {
    try {
      const validated = createCustomerSchema.parse(params)
      
      // Check if customer already exists
      const existing = await prisma.customer.findFirst({
        where: {
          tenantId,
          email: validated.email,
        },
      })

      if (existing) {
        return {
          success: true,
          action: 'found_existing',
          data: existing,
          message: `Customer ${existing.name} already exists`,
        }
      }

      // Create new customer
      const customer = await prisma.customer.create({
        data: {
          ...validated,
          tenantId,
          createdById: userId,
          lastContactDate: new Date(),
          status: 'active',
        },
      })

      // Log activity
      await prisma.activity.create({
        data: {
          type: 'customer_created',
          description: `Created customer ${customer.name} via AI assistant`,
          customerId: customer.id,
          userId,
          tenantId,
        },
      })

      return {
        success: true,
        action: 'created',
        data: customer,
        message: `Successfully created customer ${customer.name}`,
      }

    } catch (error) {
      console.error('Error creating customer:', error)
      throw error
    }
  }

  /**
   * Create a new deal from AI conversation
   */
  async createDeal(params: z.infer<typeof createDealSchema>, tenantId: string, userId: string) {
    try {
      const validated = createDealSchema.parse(params)
      
      // Find or create customer if needed
      let customerId = validated.customerId
      if (!customerId && validated.customerName) {
        const customer = await prisma.customer.findFirst({
          where: {
            tenantId,
            name: { contains: validated.customerName, mode: 'insensitive' },
          },
        })
        customerId = customer?.id
      }

      // Create deal
      const deal = await prisma.deal.create({
        data: {
          title: validated.title,
          amount: validated.amount,
          stage: validated.stage,
          probability: validated.probability,
          expectedCloseDate: validated.expectedCloseDate ? new Date(validated.expectedCloseDate) : undefined,
          notes: validated.notes,
          customerId,
          ownerId: userId,
          tenantId,
        },
      })

      // Log activity
      await prisma.activity.create({
        data: {
          type: 'deal_created',
          description: `Created deal "${deal.title}" worth $${deal.amount} via AI assistant`,
          dealId: deal.id,
          customerId,
          userId,
          tenantId,
        },
      })

      return {
        success: true,
        action: 'created',
        data: deal,
        message: `Successfully created deal "${deal.title}" worth $${deal.amount.toLocaleString()}`,
      }

    } catch (error) {
      console.error('Error creating deal:', error)
      throw error
    }
  }

  /**
   * Schedule a meeting from AI conversation
   */
  async scheduleMeeting(params: z.infer<typeof scheduleMeetingSchema>, tenantId: string, userId: string) {
    try {
      const validated = scheduleMeetingSchema.parse(params)
      
      // Create event/task for the meeting
      const task = await prisma.task.create({
        data: {
          title: validated.title,
          description: validated.description || `Meeting with ${validated.attendees.join(', ')}`,
          dueDate: new Date(validated.startTime),
          priority: 'medium',
          status: 'scheduled',
          type: 'meeting',
          assignedToId: userId,
          tenantId,
          metadata: {
            attendees: validated.attendees,
            duration: validated.duration,
            location: validated.location,
          },
        },
      })

      // Log activity
      await prisma.activity.create({
        data: {
          type: 'meeting_scheduled',
          description: `Scheduled meeting "${task.title}" via AI assistant`,
          taskId: task.id,
          userId,
          tenantId,
        },
      })

      return {
        success: true,
        action: 'scheduled',
        data: task,
        message: `Successfully scheduled meeting "${task.title}" for ${new Date(validated.startTime).toLocaleString()}`,
      }

    } catch (error) {
      console.error('Error scheduling meeting:', error)
      throw error
    }
  }

  /**
   * Generate a report from AI conversation
   */
  async generateReport(reportType: string, filters: Record<string, any>, tenantId: string, userId: string) {
    try {
      // Use CrewAI to generate comprehensive report
      const tasks = [
        {
          id: 'analyze-data',
          description: `Analyze ${reportType} data with filters: ${JSON.stringify(filters)}`,
          expectedOutput: 'Data analysis with key metrics and trends',
          assignedAgent: 'data-analyst',
          priority: 'high' as const,
        },
        {
          id: 'generate-insights',
          description: `Generate insights from the ${reportType} analysis`,
          expectedOutput: 'Business insights and recommendations',
          assignedAgent: 'finance-detective',
          priority: 'high' as const,
        },
        {
          id: 'create-visualization',
          description: `Create visualization recommendations for ${reportType} report`,
          expectedOutput: 'Chart types and data visualization suggestions',
          assignedAgent: 'market-analyst',
          priority: 'medium' as const,
        },
      ]

      const crewResult = await crewAIOrchestrator.createBusinessCrew(
        `${reportType} Report Generation`,
        tasks,
        undefined,
        { tenantId, filters }
      )

      // Create report record
      const report = await prisma.report.create({
        data: {
          title: `${reportType} Report - ${new Date().toLocaleDateString()}`,
          type: reportType,
          status: 'completed',
          data: crewResult.summary,
          metadata: {
            filters,
            insights: crewResult.taskResults,
          },
          generatedById: userId,
          tenantId,
        },
      })

      return {
        success: true,
        action: 'generated',
        data: {
          reportId: report.id,
          reportUrl: `/reports/${report.id}`,
          summary: crewResult.summary,
        },
        message: `Successfully generated ${reportType} report`,
      }

    } catch (error) {
      console.error('Error generating report:', error)
      throw error
    }
  }

  /**
   * Search for information across the system
   */
  async searchInformation(query: string, context: string, tenantId: string) {
    try {
      const searchPrompt = `Search for information about: "${query}"
Context: ${context}
Tenant: ${tenantId}

Provide relevant results including:
1. Matching customers, deals, or tasks
2. Related activities or notes
3. Relevant metrics or insights`

      const result = await langChainOrchestrator.orchestrate(searchPrompt, {
        userId: 'system',
        tenantId,
        department: 'general',
        task: 'search',
        priority: 'high',
      })

      // Parse results and search database
      const searchResults = {
        customers: await prisma.customer.findMany({
          where: {
            tenantId,
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
              { notes: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 5,
        }),
        deals: await prisma.deal.findMany({
          where: {
            tenantId,
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { notes: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 5,
        }),
        tasks: await prisma.task.findMany({
          where: {
            tenantId,
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 5,
        }),
      }

      return {
        success: true,
        action: 'searched',
        data: searchResults,
        message: `Found ${searchResults.customers.length + searchResults.deals.length + searchResults.tasks.length} results for "${query}"`,
      }

    } catch (error) {
      console.error('Error searching information:', error)
      throw error
    }
  }

  /**
   * Create an automated workflow
   */
  async createWorkflow(workflowType: string, parameters: Record<string, any>, tenantId: string, userId: string) {
    try {
      // Use AI to design the workflow
      const workflowPrompt = `Design an automated workflow for: ${workflowType}
Parameters: ${JSON.stringify(parameters)}

Create a step-by-step workflow including:
1. Trigger conditions
2. Actions to perform
3. Decision points
4. Success criteria`

      const result = await langChainOrchestrator.orchestrate(workflowPrompt, {
        userId,
        tenantId,
        department: 'automation',
        task: 'workflow-design',
        priority: 'high',
      })

      // Create workflow record
      const workflow = await prisma.workflow.create({
        data: {
          name: `${workflowType} Automation`,
          type: workflowType,
          status: 'active',
          trigger: parameters.trigger || 'manual',
          actions: result.response,
          metadata: parameters,
          createdById: userId,
          tenantId,
        },
      })

      return {
        success: true,
        action: 'created',
        data: workflow,
        message: `Successfully created ${workflowType} automation workflow`,
      }

    } catch (error) {
      console.error('Error creating workflow:', error)
      throw error
    }
  }
}

// Singleton instance
export const workflowIntegration = new WorkflowIntegration()