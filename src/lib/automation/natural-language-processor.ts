/**
 * CoreFlow360 - Natural Language Workflow Processor
 * Converts plain English descriptions into structured workflows using AI
 */

import { 
  Workflow, 
  WorkflowNode, 
  WorkflowConnection,
  WorkflowIntent,
  WorkflowIntentType,
  WorkflowEntity,
  WorkflowEntityType,
  WorkflowNodeType,
  WorkflowGenerationRequest,
  WorkflowGenerationResponse,
  WorkflowQuestion,
  WorkflowSuggestion,
  WorkflowWarning
} from './workflow-types'

export class NaturalLanguageWorkflowProcessor {
  private readonly openaiApiKey: string
  private readonly anthropicApiKey: string

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY || ''
    this.anthropicApiKey = process.env.ANTHROPIC_API_KEY || ''
  }

  /**
   * Main entry point - convert natural language to workflow
   */
  async processDescription(request: WorkflowGenerationRequest): Promise<WorkflowGenerationResponse> {
    try {
      // Step 1: Parse intent and entities
      const intent = await this.parseIntent(request.description)
      
      // Step 2: Generate workflow structure
      const workflow = await this.generateWorkflow(request, intent)
      
      // Step 3: Generate clarifying questions
      const questions = await this.generateQuestions(workflow, request)
      
      // Step 4: Generate optimization suggestions
      const suggestions = await this.generateSuggestions(workflow, request)
      
      // Step 5: Check for warnings
      const warnings = await this.checkWarnings(workflow, request)
      
      return {
        workflow,
        confidence: intent.confidence,
        questions,
        suggestions,
        warnings
      }
    } catch (error) {
      console.error('Workflow generation error:', error)
      throw new Error('Failed to generate workflow from description')
    }
  }

  /**
   * Parse natural language to extract intent and entities
   */
  private async parseIntent(description: string): Promise<WorkflowIntent> {
    const prompt = `
    You are an expert at understanding business workflow requirements from natural language.
    
    Analyze this workflow description and extract:
    1. The primary intent (what the user wants to accomplish)
    2. Key entities (triggers, actions, conditions, people, systems, etc.)
    3. Your confidence level (0-1)
    
    Description: "${description}"
    
    Respond with JSON in this format:
    {
      "intent": "CREATE_TASK|SEND_NOTIFICATION|UPDATE_RECORD|CONDITIONAL_ACTION|SCHEDULE_ACTION|MULTI_STEP_WORKFLOW|DATA_SYNC|APPROVAL_PROCESS",
      "confidence": 0.95,
      "entities": [
        {
          "type": "TRIGGER_TYPE|ACTION_TYPE|PERSON|EMAIL|DATE_TIME|CONDITION|FIELD_NAME|VALUE|INTEGRATION|TEMPLATE",
          "value": "extracted value",
          "startIndex": 0,
          "endIndex": 10,
          "confidence": 0.9
        }
      ],
      "originalText": "${description}"
    }
    
    Be specific and accurate. Only extract entities you're confident about.
    `

    const response = await this.callAI(prompt, 'gpt-4')
    return JSON.parse(response) as WorkflowIntent
  }

  /**
   * Generate workflow structure from intent and entities
   */
  private async generateWorkflow(
    request: WorkflowGenerationRequest, 
    intent: WorkflowIntent
  ): Promise<Workflow> {
    const systemPrompt = `
    You are a workflow automation expert. Convert business requirements into structured workflows.
    
    Business Context:
    - Industry: ${request.businessContext.industry}
    - Company Size: ${request.businessContext.companySize}
    - Existing Systems: ${request.businessContext.existingSystems.join(', ')}
    - User Role: ${request.businessContext.userRole}
    
    Preferences:
    - Complexity: ${request.preferences?.complexity || 'simple'}
    - Timing: ${request.preferences?.executionTiming || 'immediate'}
    - Error Handling: ${request.preferences?.errorHandling || 'basic'}
    
    Create a workflow with these components:
    1. Clear trigger node
    2. Logical action sequence
    3. Appropriate error handling
    4. Optimal node positioning for visual clarity
    
    Use these node types appropriately:
    - Triggers: TRIGGER_WEBHOOK, TRIGGER_EMAIL, TRIGGER_FORM_SUBMIT, TRIGGER_CRM_EVENT, TRIGGER_TIME_BASED
    - Actions: ACTION_SEND_EMAIL, ACTION_CREATE_TASK, ACTION_UPDATE_CRM, ACTION_SEND_SMS, etc.
    - Logic: LOGIC_CONDITION, LOGIC_DELAY, LOGIC_SPLIT, LOGIC_MERGE, LOGIC_FILTER
    
    Position nodes in a clear left-to-right flow with 200px spacing.
    `

    const userPrompt = `
    Original Description: "${request.description}"
    
    Parsed Intent: ${intent.intent}
    Entities: ${JSON.stringify(intent.entities)}
    
    Generate a complete workflow JSON with:
    - Unique IDs for all nodes and connections
    - Realistic configuration for each node
    - Clear visual positioning
    - Proper connections between nodes
    - Appropriate settings (timeout, retries, etc.)
    
    Return only valid JSON for a Workflow object.
    `

    const response = await this.callAI(systemPrompt + '\n\n' + userPrompt, 'gpt-4')
    
    // Parse and enhance the workflow
    const baseWorkflow = JSON.parse(response)
    
    return {
      ...baseWorkflow,
      id: this.generateId('workflow'),
      tenantId: '', // Will be set by caller
      createdBy: '', // Will be set by caller
      createdAt: new Date(),
      updatedAt: new Date(),
      originalDescription: request.description,
      generatedByAI: true,
      aiConfidence: intent.confidence,
      executionCount: 0,
      successRate: 0,
      settings: {
        timeout: 300, // 5 minutes
        maxRetries: 3,
        retryDelay: 30, // 30 seconds
        onError: 'stop',
        notifications: {
          onSuccess: false,
          onError: true,
          recipients: []
        },
        logging: {
          enabled: true,
          level: 'basic'
        }
      }
    }
  }

  /**
   * Generate clarifying questions to perfect the workflow
   */
  private async generateQuestions(
    workflow: Workflow, 
    request: WorkflowGenerationRequest
  ): Promise<WorkflowQuestion[]> {
    const prompt = `
    You are helping perfect an automatically generated workflow by asking smart clarifying questions.
    
    Workflow: ${JSON.stringify(workflow, null, 2)}
    Original Request: "${request.description}"
    Business Context: ${JSON.stringify(request.businessContext)}
    
    Generate 3-5 smart questions that would help optimize this workflow:
    1. Configuration details that need clarification
    2. Business logic edge cases
    3. Integration specifics
    4. Timing and error handling preferences
    5. User experience improvements
    
    Focus on questions that matter most for this specific workflow.
    Avoid obvious questions - be intelligent about what needs clarification.
    
    Return JSON array of questions:
    [
      {
        "id": "q1",
        "question": "How soon should the sales team be notified?",
        "type": "select",
        "options": ["Immediately", "Within 1 hour", "Next business day"],
        "required": true,
        "category": "timing",
        "affectedNodeIds": ["node_id_here"]
      }
    ]
    `

    const response = await this.callAI(prompt, 'gpt-4')
    return JSON.parse(response) as WorkflowQuestion[]
  }

  /**
   * Generate optimization suggestions
   */
  private async generateSuggestions(
    workflow: Workflow,
    request: WorkflowGenerationRequest
  ): Promise<WorkflowSuggestion[]> {
    const prompt = `
    Analyze this workflow and suggest optimizations:
    
    Workflow: ${JSON.stringify(workflow, null, 2)}
    Business Context: ${JSON.stringify(request.businessContext)}
    
    Look for opportunities to:
    1. Add missing steps that would be valuable
    2. Optimize performance and reliability
    3. Integrate with existing systems
    4. Improve error handling
    5. Enhance user experience
    
    Provide actionable suggestions with clear business value.
    
    Return JSON array:
    [
      {
        "type": "optimization|additional_step|integration|error_handling",
        "title": "Add confirmation email",
        "description": "Send a confirmation email to the customer after task creation",
        "impact": "medium",
        "implementationEffort": "easy"
      }
    ]
    `

    const response = await this.callAI(prompt, 'gpt-4')
    return JSON.parse(response) as WorkflowSuggestion[]
  }

  /**
   * Check for potential warnings and issues
   */
  private async checkWarnings(
    workflow: Workflow,
    request: WorkflowGenerationRequest
  ): Promise<WorkflowWarning[]> {
    const warnings: WorkflowWarning[] = []

    // Check complexity
    if (workflow.nodes.length > 10) {
      warnings.push({
        type: 'complexity',
        message: 'This workflow has many steps. Consider breaking it into smaller workflows.',
        severity: 'warning'
      })
    }

    // Check for rate limits
    const emailActions = workflow.nodes.filter(node => 
      node.type === WorkflowNodeType.ACTION_SEND_EMAIL
    )
    if (emailActions.length > 5) {
      warnings.push({
        type: 'rate_limit',
        message: 'Multiple email actions may hit rate limits. Consider adding delays.',
        severity: 'warning',
        affectedNodeIds: emailActions.map(node => node.id)
      })
    }

    // Check for required integrations
    const integrationNodes = workflow.nodes.filter(node => 
      node.type.toString().startsWith('INTEGRATION_')
    )
    if (integrationNodes.length > 0) {
      warnings.push({
        type: 'integration_required',
        message: 'This workflow requires setting up integrations with external services.',
        severity: 'info',
        affectedNodeIds: integrationNodes.map(node => node.id)
      })
    }

    return warnings
  }

  /**
   * Call AI service (OpenAI or Anthropic)
   */
  private async callAI(prompt: string, model: 'gpt-4' | 'claude-3-opus' = 'gpt-4'): Promise<string> {
    if (model === 'gpt-4') {
      return await this.callOpenAI(prompt)
    } else {
      return await this.callAnthropic(prompt)
    }
  }

  private async callOpenAI(prompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a workflow automation expert. Always respond with valid JSON when requested.'
          },
          {
            role: 'user', 
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  private async callAnthropic(prompt: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.anthropicApiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.content[0].text
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Example workflow patterns for better AI training
export const WORKFLOW_EXAMPLES = {
  lead_nurturing: {
    description: "When a new lead fills out our contact form, add them to CRM, send welcome email, and create follow-up task for sales team",
    pattern: "TRIGGER → ADD_TO_CRM → SEND_EMAIL → CREATE_TASK"
  },
  
  invoice_follow_up: {
    description: "When an invoice becomes 30 days overdue, send reminder email and notify accounts receivable team",
    pattern: "TIME_TRIGGER → CHECK_STATUS → SEND_REMINDER → NOTIFY_TEAM"
  },
  
  customer_onboarding: {
    description: "After customer signs contract, create onboarding checklist, assign customer success manager, and schedule kickoff call",
    pattern: "CONTRACT_TRIGGER → CREATE_CHECKLIST → ASSIGN_MANAGER → SCHEDULE_CALL"
  },
  
  support_escalation: {
    description: "If support ticket isn't responded to within 4 hours, escalate to manager and send customer update",
    pattern: "TIME_CHECK → CONDITION → ESCALATE → SEND_UPDATE"
  },
  
  project_completion: {
    description: "When project status changes to complete, generate final report, send to stakeholders, and create feedback survey",
    pattern: "STATUS_TRIGGER → GENERATE_REPORT → SEND_REPORT → CREATE_SURVEY"
  }
}

export default NaturalLanguageWorkflowProcessor