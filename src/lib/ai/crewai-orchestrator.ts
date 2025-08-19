/**
 * CoreFlow360 - CrewAI Multi-Agent Orchestrator
 * Coordinates multiple AI agents for complex business workflows
 */

import { multiLLMManager } from './multi-llm-manager'
import { AI_CONFIG } from '@/config/ai.config'

export interface Agent {
  id: string
  name: string
  role: string
  goal: string
  backstory: string
  capabilities: string[]
  department: string
  llmProvider?: string
  model?: string
}

export interface Task {
  id: string
  description: string
  expectedOutput: string
  assignedAgent: string
  dependencies?: string[]
  priority: 'low' | 'medium' | 'high' | 'urgent'
  context?: Record<string, any>
}

export interface CrewResult {
  taskResults: Record<string, any>
  executionTime: number
  totalCost: number
  agentsUsed: string[]
  insights: string[]
  recommendations: string[]
}

export class CrewAIOrchestrator {
  private agents: Map<string, Agent> = new Map()
  private executionHistory: Array<{ timestamp: Date; crew: string; result: CrewResult }> = []

  constructor() {
    this.initializeBusinessAgents()
  }

  /**
   * Initialize CoreFlow360 business agents based on AI_CONFIG
   */
  private initializeBusinessAgents() {
    const departments = AI_CONFIG.agents.departmental

    // CRM Agent
    this.agents.set('crm-specialist', {
      id: 'crm-specialist',
      name: 'Sarah - CRM Intelligence Specialist',
      role: 'Customer Relationship Expert',
      goal: 'Optimize customer relationships and maximize lifetime value',
      backstory: 'Expert in customer psychology with 10+ years in CRM optimization. Specializes in predicting customer behavior and preventing churn.',
      capabilities: departments.crm.capabilities,
      department: 'crm',
      llmProvider: 'anthropic', // Best for reasoning about customer behavior
    })

    // Sales Agent
    this.agents.set('sales-optimizer', {
      id: 'sales-optimizer',
      name: 'Marcus - Revenue Optimization Expert',
      role: 'Sales Performance Specialist',
      goal: 'Maximize revenue through strategic sales optimization',
      backstory: 'Former top sales director turned AI specialist. Masters the art of deal closure and revenue forecasting.',
      capabilities: departments.sales.capabilities,
      department: 'sales',
      llmProvider: 'openai', // Good for strategic analysis
    })

    // Finance Agent
    this.agents.set('finance-detective', {
      id: 'finance-detective',
      name: 'Elena - Financial Intelligence Analyst',
      role: 'Financial Risk and Optimization Expert',
      goal: 'Ensure financial health and discover hidden opportunities',
      backstory: 'CFO background with expertise in financial modeling and risk assessment. Sees patterns others miss.',
      capabilities: departments.finance.capabilities,
      department: 'finance',
      llmProvider: 'anthropic', // Excellent for financial reasoning
    })

    // Operations Agent
    this.agents.set('ops-optimizer', {
      id: 'ops-optimizer',
      name: 'David - Operations Excellence Manager',
      role: 'Process Optimization Specialist',
      goal: 'Streamline operations for maximum efficiency',
      backstory: 'Operations expert with lean manufacturing background. Eliminates waste and optimizes workflows.',
      capabilities: departments.operations.capabilities,
      department: 'operations',
      llmProvider: 'mistral', // Cost-effective for process optimization
    })

    // HR Agent
    this.agents.set('hr-strategist', {
      id: 'hr-strategist',
      name: 'Rebecca - People Success Strategist',
      role: 'Human Capital Optimization Expert',
      goal: 'Build high-performing teams and retain top talent',
      backstory: 'HR leader with psychology background. Expert in talent acquisition and employee development.',
      capabilities: departments.hr.capabilities,
      department: 'hr',
      llmProvider: 'google', // Good for understanding human behavior
    })

    // Analytics Agent
    this.agents.set('data-prophet', {
      id: 'data-prophet',
      name: 'Alex - Predictive Analytics Oracle',
      role: 'Business Intelligence Specialist',
      goal: 'Reveal hidden insights and predict future trends',
      backstory: 'Data scientist with business strategy expertise. Turns raw data into actionable intelligence.',
      capabilities: departments.analytics.capabilities,
      department: 'analytics',
      llmProvider: 'anthropic', // Superior reasoning for data analysis
    })

    // Orchestrator Agent
    this.agents.set('business-orchestrator', {
      id: 'business-orchestrator',
      name: 'Victoria - Business Strategy Orchestrator',
      role: 'Strategic Coordination Expert',
      goal: 'Coordinate cross-departmental initiatives for maximum business impact',
      backstory: 'Former management consultant and CEO. Sees the big picture and aligns all departments toward common goals.',
      capabilities: AI_CONFIG.agents.orchestrator.capabilities,
      department: 'strategy',
      llmProvider: 'openai', // Best for strategic coordination
    })
  }

  /**
   * Execute a task with a specific agent
   */
  private async executeAgentTask(agent: Agent, task: Task, context?: Record<string, any>): Promise<any> {
    const prompt = this.buildAgentPrompt(agent, task, context)
    
    const response = await multiLLMManager.generateCompletion({
      prompt,
      provider: agent.llmProvider,
      task: this.mapDepartmentToTaskType(agent.department),
    })

    return {
      agentId: agent.id,
      agentName: agent.name,
      taskId: task.id,
      result: response.content,
      tokensUsed: response.tokensUsed,
      cost: response.cost,
      provider: response.provider,
      processingTime: response.responseTime,
    }
  }

  /**
   * Build agent-specific prompt
   */
  private buildAgentPrompt(agent: Agent, task: Task, context?: Record<string, any>): string {
    return `You are ${agent.name}, a ${agent.role} at CoreFlow360.

BACKGROUND: ${agent.backstory}

YOUR GOAL: ${agent.goal}

YOUR CAPABILITIES:
${agent.capabilities.map(cap => `- ${cap}`).join('\n')}

CURRENT TASK: ${task.description}

EXPECTED OUTPUT: ${task.expectedOutput}

${context ? `ADDITIONAL CONTEXT:\n${JSON.stringify(context, null, 2)}` : ''}

Please complete this task with your expertise. Be specific, actionable, and data-driven in your response. Include concrete recommendations and next steps.

IMPORTANT: Stay in character as ${agent.name} and leverage your unique expertise in ${agent.department}.`
  }

  /**
   * Map department to LLM task type
   */
  private mapDepartmentToTaskType(department: string): string {
    const mapping: Record<string, string> = {
      'crm': 'reasoning',
      'sales': 'reasoning',
      'finance': 'reasoning',
      'operations': 'cost-optimization',
      'hr': 'reasoning',
      'analytics': 'reasoning',
      'strategy': 'reasoning',
    }
    return mapping[department] || 'reasoning'
  }

  /**
   * Create a crew for a specific business workflow
   */
  async createBusinessCrew(
    crewName: string,
    tasks: Task[],
    selectedAgents?: string[],
    context?: Record<string, any>
  ): Promise<CrewResult> {
    const startTime = Date.now()
    const taskResults: Record<string, any> = {}
    const agentsUsed: string[] = []
    let totalCost = 0

    try {
      // Sort tasks by dependencies and priority
      const sortedTasks = this.sortTasksByDependencies(tasks)

      // Execute tasks sequentially, respecting dependencies
      for (const task of sortedTasks) {
        const agent = this.selectAgentForTask(task, selectedAgents)
        if (!agent) {
          throw new Error(`No suitable agent found for task: ${task.id}`)
        }

        // Build context with results from dependent tasks
        const taskContext = this.buildTaskContext(task, taskResults, context)

        // Execute the task
        const result = await this.executeAgentTask(agent, task, taskContext)
        
        taskResults[task.id] = result
        agentsUsed.push(agent.id)
        totalCost += result.cost
      }

      // Generate insights and recommendations
      const insights = await this.generateCrewInsights(taskResults, crewName)
      const recommendations = await this.generateCrewRecommendations(taskResults, crewName)

      const endTime = Date.now()
      const executionTime = endTime - startTime

      const crewResult: CrewResult = {
        taskResults,
        executionTime,
        totalCost,
        agentsUsed: [...new Set(agentsUsed)], // Remove duplicates
        insights,
        recommendations,
      }

      // Store execution history
      this.executionHistory.push({
        timestamp: new Date(),
        crew: crewName,
        result: crewResult,
      })

      return crewResult

    } catch (error) {
      console.error(`Crew execution failed for ${crewName}:`, error)
      throw new Error(`Crew execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Sort tasks by dependencies and priority
   */
  private sortTasksByDependencies(tasks: Task[]): Task[] {
    const sorted: Task[] = []
    const visited = new Set<string>()
    const visiting = new Set<string>()

    const visit = (task: Task) => {
      if (visiting.has(task.id)) {
        throw new Error(`Circular dependency detected involving task: ${task.id}`)
      }
      if (visited.has(task.id)) return

      visiting.add(task.id)

      // Visit dependencies first
      if (task.dependencies) {
        for (const depId of task.dependencies) {
          const depTask = tasks.find(t => t.id === depId)
          if (depTask) visit(depTask)
        }
      }

      visiting.delete(task.id)
      visited.add(task.id)
      sorted.push(task)
    }

    // Sort by priority first
    const priorityOrder = { 'urgent': 0, 'high': 1, 'medium': 2, 'low': 3 }
    const prioritySorted = tasks.sort((a, b) => 
      priorityOrder[a.priority] - priorityOrder[b.priority]
    )

    for (const task of prioritySorted) {
      visit(task)
    }

    return sorted
  }

  /**
   * Select the best agent for a task
   */
  private selectAgentForTask(task: Task, selectedAgents?: string[]): Agent | null {
    // If specific agents are selected, prefer those
    if (selectedAgents && selectedAgents.length > 0) {
      for (const agentId of selectedAgents) {
        const agent = this.agents.get(agentId)
        if (agent && this.isAgentSuitableForTask(agent, task)) {
          return agent
        }
      }
    }

    // Find the most suitable agent based on capabilities
    let bestAgent: Agent | null = null
    let bestScore = 0

    for (const agent of this.agents.values()) {
      const score = this.calculateAgentTaskScore(agent, task)
      if (score > bestScore) {
        bestScore = score
        bestAgent = agent
      }
    }

    return bestAgent
  }

  /**
   * Check if agent is suitable for task
   */
  private isAgentSuitableForTask(agent: Agent, task: Task): boolean {
    // Check if task description matches agent capabilities
    const taskLower = task.description.toLowerCase()
    return agent.capabilities.some(cap => 
      taskLower.includes(cap.toLowerCase().split(' ')[0])
    )
  }

  /**
   * Calculate how well an agent matches a task
   */
  private calculateAgentTaskScore(agent: Agent, task: Task): number {
    let score = 0
    const taskLower = task.description.toLowerCase()

    // Match capabilities
    for (const capability of agent.capabilities) {
      const capWords = capability.toLowerCase().split(' ')
      for (const word of capWords) {
        if (taskLower.includes(word)) {
          score += 1
        }
      }
    }

    // Priority bonus for orchestrator on strategic tasks
    if (agent.id === 'business-orchestrator' && 
        (taskLower.includes('strategy') || taskLower.includes('coordinate'))) {
      score += 5
    }

    return score
  }

  /**
   * Build context for task execution
   */
  private buildTaskContext(
    task: Task, 
    taskResults: Record<string, any>, 
    globalContext?: Record<string, any>
  ): Record<string, any> {
    const context: Record<string, any> = { ...globalContext }

    // Add results from dependent tasks
    if (task.dependencies) {
      context.dependentResults = {}
      for (const depId of task.dependencies) {
        if (taskResults[depId]) {
          context.dependentResults[depId] = taskResults[depId].result
        }
      }
    }

    return context
  }

  /**
   * Generate insights from crew execution
   */
  private async generateCrewInsights(
    taskResults: Record<string, any>, 
    crewName: string
  ): Promise<string[]> {
    try {
      const resultsText = Object.values(taskResults)
        .map((result: any) => `${result.agentName}: ${result.result}`)
        .join('\n\n')

      const insightPrompt = `Analyze the following crew execution results and provide 3 key business insights:

Crew: ${crewName}
Results:
${resultsText}

Provide insights that reveal patterns, opportunities, or risks across the different agent outputs. Each insight should be actionable and specific.`

      const response = await multiLLMManager.generateCompletion({
        prompt: insightPrompt,
        task: 'reasoning',
      })

      return response.content
        .split('\n')
        .filter(line => line.trim().length > 0)
        .slice(0, 3)

    } catch (error) {
      console.error('Failed to generate crew insights:', error)
      return []
    }
  }

  /**
   * Generate recommendations from crew execution
   */
  private async generateCrewRecommendations(
    taskResults: Record<string, any>, 
    crewName: string
  ): Promise<string[]> {
    try {
      const resultsText = Object.values(taskResults)
        .map((result: any) => `${result.agentName}: ${result.result}`)
        .join('\n\n')

      const recommendationPrompt = `Based on these crew execution results, provide 3 specific action recommendations:

Crew: ${crewName}
Results:
${resultsText}

Focus on concrete next steps that the business should take based on the agents' analysis. Prioritize high-impact, implementable actions.`

      const response = await multiLLMManager.generateCompletion({
        prompt: recommendationPrompt,
        task: 'reasoning',
      })

      return response.content
        .split('\n')
        .filter(line => line.trim().length > 0)
        .slice(0, 3)

    } catch (error) {
      console.error('Failed to generate crew recommendations:', error)
      return []
    }
  }

  /**
   * Get available agents
   */
  getAvailableAgents(): Agent[] {
    return Array.from(this.agents.values())
  }

  /**
   * Get agent by ID
   */
  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId)
  }

  /**
   * Get execution history
   */
  getExecutionHistory(): Array<{ timestamp: Date; crew: string; result: CrewResult }> {
    return this.executionHistory
  }

  /**
   * Create predefined business workflows
   */
  async runCustomerChurnAnalysis(customerId: string): Promise<CrewResult> {
    const tasks: Task[] = [
      {
        id: 'analyze-customer-behavior',
        description: `Analyze customer behavior patterns for customer ID ${customerId}`,
        expectedOutput: 'Detailed customer behavior analysis with churn risk assessment',
        assignedAgent: 'crm-specialist',
        priority: 'high',
      },
      {
        id: 'financial-impact-assessment',
        description: 'Assess financial impact of potential customer churn',
        expectedOutput: 'Revenue impact analysis and cost calculations',
        assignedAgent: 'finance-detective',
        dependencies: ['analyze-customer-behavior'],
        priority: 'high',
      },
      {
        id: 'retention-strategy',
        description: 'Develop customer retention strategy',
        expectedOutput: 'Actionable retention plan with specific tactics',
        assignedAgent: 'sales-optimizer',
        dependencies: ['analyze-customer-behavior', 'financial-impact-assessment'],
        priority: 'high',
      },
    ]

    return this.createBusinessCrew('Customer Churn Analysis', tasks, undefined, { customerId })
  }

  async runRevenueOptimization(): Promise<CrewResult> {
    const tasks: Task[] = [
      {
        id: 'sales-pipeline-analysis',
        description: 'Analyze current sales pipeline for optimization opportunities',
        expectedOutput: 'Pipeline analysis with bottleneck identification',
        assignedAgent: 'sales-optimizer',
        priority: 'high',
      },
      {
        id: 'customer-value-analysis',
        description: 'Analyze customer lifetime value and segmentation',
        expectedOutput: 'Customer value tiers and expansion opportunities',
        assignedAgent: 'crm-specialist',
        priority: 'high',
      },
      {
        id: 'pricing-optimization',
        description: 'Optimize pricing strategy based on market analysis',
        expectedOutput: 'Pricing recommendations with revenue projections',
        assignedAgent: 'finance-detective',
        dependencies: ['customer-value-analysis'],
        priority: 'high',
      },
      {
        id: 'strategic-coordination',
        description: 'Coordinate revenue optimization initiatives across departments',
        expectedOutput: 'Integrated revenue optimization plan',
        assignedAgent: 'business-orchestrator',
        dependencies: ['sales-pipeline-analysis', 'customer-value-analysis', 'pricing-optimization'],
        priority: 'urgent',
      },
    ]

    return this.createBusinessCrew('Revenue Optimization', tasks)
  }
}

// Singleton instance
export const crewAIOrchestrator = new CrewAIOrchestrator()