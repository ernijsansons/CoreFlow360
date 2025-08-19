/**
 * AI Conversation Interface
 * Handles natural language business workflow interactions
 */

import { langChainOrchestrator, OrchestrationContext } from './langchain-orchestrator'
import { crewAIOrchestrator } from './crewai-orchestrator'
import { multiLLMManager } from './multi-llm-manager'
import { workflowIntegration } from './workflow-integrations'
import { z } from 'zod'

// Define supported business intents
export enum BusinessIntent {
  CREATE_CUSTOMER = 'create_customer',
  CREATE_DEAL = 'create_deal',
  SCHEDULE_MEETING = 'schedule_meeting',
  GENERATE_REPORT = 'generate_report',
  ANALYZE_DATA = 'analyze_data',
  UPDATE_TASK = 'update_task',
  SEARCH_INFORMATION = 'search_information',
  WORKFLOW_AUTOMATION = 'workflow_automation',
  UNKNOWN = 'unknown',
}

// Message types
export interface ConversationMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    intent?: BusinessIntent
    entities?: Record<string, any>
    confidence?: number
    actions?: WorkflowAction[]
  }
}

export interface WorkflowAction {
  type: string
  parameters: Record<string, any>
  status: 'pending' | 'executing' | 'completed' | 'failed'
  result?: any
  error?: string
}

export interface ConversationContext {
  sessionId: string
  userId: string
  tenantId: string
  department?: string
  history: ConversationMessage[]
  activeWorkflow?: {
    id: string
    type: string
    status: string
    steps: WorkflowAction[]
  }
}

// Intent detection schema
const intentDetectionSchema = z.object({
  intent: z.nativeEnum(BusinessIntent),
  confidence: z.number().min(0).max(1),
  entities: z.record(z.any()).optional(),
  suggestedActions: z.array(z.object({
    action: z.string(),
    parameters: z.record(z.any()),
    description: z.string(),
  })).optional(),
})

export class AIConversationInterface {
  private conversations: Map<string, ConversationContext> = new Map()

  /**
   * Start a new conversation session
   */
  startConversation(
    sessionId: string,
    userId: string,
    tenantId: string,
    department?: string
  ): ConversationContext {
    const context: ConversationContext = {
      sessionId,
      userId,
      tenantId,
      department,
      history: [],
    }
    
    this.conversations.set(sessionId, context)
    return context
  }

  /**
   * Process a user message and generate appropriate response
   */
  async processMessage(
    sessionId: string,
    message: string
  ): Promise<ConversationMessage> {
    const context = this.conversations.get(sessionId)
    if (!context) {
      throw new Error('Conversation session not found')
    }

    // Add user message to history
    const userMessage: ConversationMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
    }
    context.history.push(userMessage)

    try {
      // Step 1: Detect intent and extract entities
      const intentResult = await this.detectIntent(message, context)
      
      // Step 2: Generate appropriate response based on intent
      const response = await this.generateResponse(intentResult, context)
      
      // Step 3: Execute any workflow actions if needed
      if (intentResult.suggestedActions && intentResult.suggestedActions.length > 0) {
        response.metadata = {
          ...response.metadata,
          actions: await this.executeWorkflowActions(intentResult.suggestedActions, context),
        }
      }

      // Add response to history
      context.history.push(response)
      
      return response

    } catch (error) {
      console.error('Error processing message:', error)
      
      const errorResponse: ConversationMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Could you please try rephrasing it?',
        timestamp: new Date(),
        metadata: {
          intent: BusinessIntent.UNKNOWN,
          confidence: 0,
        },
      }
      
      context.history.push(errorResponse)
      return errorResponse
    }
  }

  /**
   * Detect user intent using AI
   */
  private async detectIntent(
    message: string,
    context: ConversationContext
  ): Promise<z.infer<typeof intentDetectionSchema>> {
    const orchestrationContext: OrchestrationContext = {
      userId: context.userId,
      tenantId: context.tenantId,
      department: context.department || 'general',
      task: 'intent-detection',
      priority: 'high',
    }

    const prompt = `Analyze the following user message and determine the business intent.

User message: "${message}"

Recent conversation history:
${context.history.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n')}

Detect the intent from these options:
- create_customer: User wants to create a new customer
- create_deal: User wants to create a new deal or opportunity
- schedule_meeting: User wants to schedule a meeting
- generate_report: User wants to generate a report or analytics
- analyze_data: User wants to analyze business data
- update_task: User wants to update or manage tasks
- search_information: User is searching for information
- workflow_automation: User wants to automate a workflow
- unknown: Intent is not clear

Also extract any entities mentioned (names, dates, amounts, etc.) and suggest specific actions.

Respond in JSON format:
{
  "intent": "<intent>",
  "confidence": <0-1>,
  "entities": { <extracted entities> },
  "suggestedActions": [
    {
      "action": "<action_type>",
      "parameters": { <parameters> },
      "description": "<what this action does>"
    }
  ]
}`

    const result = await langChainOrchestrator.orchestrate(prompt, orchestrationContext)
    
    try {
      // Parse AI response
      const parsed = JSON.parse(result.response)
      return intentDetectionSchema.parse(parsed)
    } catch (error) {
      console.error('Failed to parse intent detection result:', error)
      return {
        intent: BusinessIntent.UNKNOWN,
        confidence: 0,
        entities: {},
        suggestedActions: [],
      }
    }
  }

  /**
   * Generate contextual response based on detected intent
   */
  private async generateResponse(
    intentResult: z.infer<typeof intentDetectionSchema>,
    context: ConversationContext
  ): Promise<ConversationMessage> {
    const orchestrationContext: OrchestrationContext = {
      userId: context.userId,
      tenantId: context.tenantId,
      department: context.department || 'general',
      task: 'response-generation',
      priority: 'high',
    }

    // Build intent-specific prompts
    let responsePrompt = this.buildResponsePrompt(intentResult, context)

    const result = await langChainOrchestrator.orchestrate(responsePrompt, orchestrationContext)

    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: result.response,
      timestamp: new Date(),
      metadata: {
        intent: intentResult.intent,
        entities: intentResult.entities,
        confidence: intentResult.confidence,
      },
    }
  }

  /**
   * Build response prompt based on intent
   */
  private buildResponsePrompt(
    intentResult: z.infer<typeof intentDetectionSchema>,
    context: ConversationContext
  ): string {
    const basePrompt = `You are a helpful AI assistant for CoreFlow360, an advanced business management platform.

User intent: ${intentResult.intent}
Confidence: ${intentResult.confidence}
Extracted entities: ${JSON.stringify(intentResult.entities)}

Conversation history:
${context.history.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n')}

`

    switch (intentResult.intent) {
      case BusinessIntent.CREATE_CUSTOMER:
        return basePrompt + `The user wants to create a new customer. Guide them through the process:
1. Confirm the customer details extracted
2. Ask for any missing required information (name, email, phone)
3. Explain what will happen next

Be conversational and helpful.`

      case BusinessIntent.CREATE_DEAL:
        return basePrompt + `The user wants to create a new deal. Help them:
1. Confirm deal details (customer, amount, expected close date)
2. Ask about deal stage and probability
3. Offer to add any notes or next steps

Be encouraging about the new opportunity.`

      case BusinessIntent.SCHEDULE_MEETING:
        return basePrompt + `The user wants to schedule a meeting. Assist them by:
1. Confirming attendees and purpose
2. Suggesting available time slots
3. Asking about meeting duration and location/video link

Be efficient and professional.`

      case BusinessIntent.GENERATE_REPORT:
        return basePrompt + `The user wants to generate a report. Help by:
1. Clarifying what type of report they need
2. Confirming the time period and filters
3. Explaining the report contents and delivery

Be informative about available insights.`

      case BusinessIntent.ANALYZE_DATA:
        return basePrompt + `The user wants to analyze data. Provide:
1. Key insights based on their query
2. Relevant metrics and trends
3. Actionable recommendations

Be analytical and insightful.`

      case BusinessIntent.SEARCH_INFORMATION:
        return basePrompt + `The user is searching for information. Help by:
1. Providing relevant search results
2. Offering related information
3. Suggesting next steps

Be thorough and helpful.`

      default:
        return basePrompt + `The user's intent is unclear. Politely ask for clarification and offer suggestions for common tasks like:
- Creating customers or deals
- Generating reports
- Scheduling meetings
- Analyzing business data

Be friendly and guide them to available features.`
    }
  }

  /**
   * Execute workflow actions
   */
  private async executeWorkflowActions(
    suggestedActions: Array<{ action: string; parameters: Record<string, any>; description: string }>,
    context: ConversationContext
  ): Promise<WorkflowAction[]> {
    const actions: WorkflowAction[] = []

    for (const suggested of suggestedActions) {
      const action: WorkflowAction = {
        type: suggested.action,
        parameters: suggested.parameters,
        status: 'pending',
      }

      try {
        // Execute action based on type
        action.status = 'executing'
        
        switch (suggested.action) {
          case 'create_customer':
            const customerResult = await workflowIntegration.createCustomer(
              suggested.parameters,
              context.tenantId,
              context.userId
            )
            action.result = customerResult
            break
            
          case 'create_deal':
            const dealResult = await workflowIntegration.createDeal(
              suggested.parameters,
              context.tenantId,
              context.userId
            )
            action.result = dealResult
            break
            
          case 'schedule_meeting':
            const meetingResult = await workflowIntegration.scheduleMeeting(
              suggested.parameters,
              context.tenantId,
              context.userId
            )
            action.result = meetingResult
            break
            
          case 'generate_report':
            const reportResult = await workflowIntegration.generateReport(
              suggested.parameters.reportType || 'general',
              suggested.parameters.filters || {},
              context.tenantId,
              context.userId
            )
            action.result = reportResult
            break
            
          case 'search_information':
            const searchResult = await workflowIntegration.searchInformation(
              suggested.parameters.query || '',
              suggested.parameters.context || '',
              context.tenantId
            )
            action.result = searchResult
            break
            
          case 'create_workflow':
            const workflowResult = await workflowIntegration.createWorkflow(
              suggested.parameters.workflowType || 'custom',
              suggested.parameters,
              context.tenantId,
              context.userId
            )
            action.result = workflowResult
            break
            
          default:
            action.result = { message: 'Action noted but not yet implemented' }
        }
        
        action.status = 'completed'
        
      } catch (error) {
        action.status = 'failed'
        action.error = error instanceof Error ? error.message : 'Unknown error'
      }

      actions.push(action)
    }

    return actions
  }

  /**
   * Get conversation context
   */
  getConversation(sessionId: string): ConversationContext | undefined {
    return this.conversations.get(sessionId)
  }

  /**
   * Clear conversation history
   */
  clearConversation(sessionId: string): void {
    this.conversations.delete(sessionId)
  }

  /**
   * Get suggested prompts for user
   */
  getSuggestedPrompts(context?: ConversationContext): string[] {
    const basePrompts = [
      "Create a new customer for ACME Corp",
      "Show me this month's sales report",
      "Schedule a meeting with the sales team",
      "What are our top performing products?",
      "Create a new deal worth $50,000",
      "Analyze customer churn rate",
      "Set up a workflow for lead follow-ups",
      "Find all deals closing this week",
    ]

    if (context?.department) {
      switch (context.department) {
        case 'sales':
          return [
            "Show me deals closing this month",
            "Create a new opportunity for $25,000",
            "What's my sales pipeline looking like?",
            "Schedule a demo with a prospect",
            ...basePrompts.slice(4),
          ]
        case 'marketing':
          return [
            "Generate a campaign performance report",
            "Analyze lead conversion rates",
            "Create a new marketing qualified lead",
            "Show me website traffic trends",
            ...basePrompts.slice(4),
          ]
        case 'support':
          return [
            "Show me open support tickets",
            "Create a new support case",
            "Analyze customer satisfaction scores",
            "Find tickets awaiting response",
            ...basePrompts.slice(4),
          ]
        default:
          return basePrompts
      }
    }

    return basePrompts
  }
}

// Singleton instance
export const aiConversationInterface = new AIConversationInterface()