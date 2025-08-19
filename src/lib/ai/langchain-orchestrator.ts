/**
 * CoreFlow360 - LangChain AI Orchestrator
 * Advanced AI workflow orchestration using LangChain
 */

import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'
import { RunnableSequence, RunnableMap } from '@langchain/core/runnables'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { OpenAIEmbeddings } from '@langchain/openai'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { Document } from '@langchain/core/documents'
import { multiLLMManager, LLMRequest } from './multi-llm-manager'

export interface OrchestrationContext {
  userId: string
  tenantId: string
  department?: string
  task: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  context?: Record<string, any>
  conversation?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
}

export interface OrchestrationResult {
  response: string
  confidence: number
  provider: string
  processingTime: number
  tokensUsed: number
  cost: number
  followUpActions?: string[]
  relatedInsights?: string[]
}

export class LangChainOrchestrator {
  private vectorStore?: MemoryVectorStore
  private textSplitter: RecursiveCharacterTextSplitter
  private conversationMemory: Map<string, Array<any>> = new Map()

  constructor() {
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    })
    this.initializeVectorStore()
  }

  private async initializeVectorStore() {
    try {
      // Only initialize if OpenAI API key is available
      if (process.env.OPENAI_API_KEY) {
        const embeddings = new OpenAIEmbeddings({
          openAIApiKey: process.env.OPENAI_API_KEY,
        })
        this.vectorStore = new MemoryVectorStore(embeddings)
        await this.loadBusinessKnowledge()
      }
    } catch (error) {
      console.warn('Vector store initialization skipped - no OpenAI key available')
    }
  }

  private async loadBusinessKnowledge() {
    if (!this.vectorStore) return

    // Load business knowledge documents
    const businessDocs = [
      {
        content: `CoreFlow360 is an Autonomous Business Operating System that provides:
        - Multi-department AI agents (CRM, Sales, Finance, Operations, HR, Analytics)
        - Consciousness-based architecture that evolves with usage
        - Subscription tiers from Neural ($7-15) to Transcendent ($85-150)
        - Real-time business intelligence and predictive analytics
        - Cross-module intelligence multiplication`,
        metadata: { type: 'platform-overview' }
      },
      {
        content: `CRM capabilities include:
        - Predictive customer behavior analysis
        - Automated lead scoring and prioritization
        - Personalized outreach recommendations
        - Customer lifetime value predictions
        - Churn prevention alerts
        - Sales pipeline optimization`,
        metadata: { type: 'crm-features' }
      },
      {
        content: `Financial AI features:
        - Cash flow forecasting
        - Expense anomaly detection
        - Budget optimization recommendations
        - Risk assessment and compliance monitoring
        - Revenue prediction models
        - Cost optimization strategies`,
        metadata: { type: 'finance-features' }
      }
    ]

    const docs = businessDocs.map(doc => new Document({
      pageContent: doc.content,
      metadata: doc.metadata
    }))

    await this.vectorStore.addDocuments(docs)
  }

  /**
   * Create department-specific prompt templates
   */
  private createDepartmentPrompt(department: string): ChatPromptTemplate {
    const systemPrompts = {
      crm: `You are CoreFlow360's AI CRM Expert. You understand customers better than they know themselves.
      Your role is to:
      - Analyze customer data and behavior patterns
      - Provide actionable sales recommendations
      - Predict customer needs and churn risk
      - Optimize lead scoring and pipeline management
      
      Always be specific, data-driven, and focused on revenue impact.`,

      sales: `You are CoreFlow360's AI Revenue Generator. You find money that's being left on the table.
      Your role is to:
      - Predict deal closure probability
      - Optimize pricing strategies
      - Identify upsell/cross-sell opportunities
      - Provide territory management insights
      
      Focus on concrete actions that drive revenue growth.`,

      finance: `You are CoreFlow360's AI Money Detective. You prevent financial disasters and find hidden cash.
      Your role is to:
      - Forecast cash flow and identify risks
      - Detect expense anomalies and cost savings
      - Ensure compliance and risk management
      - Optimize budget allocation
      
      Be precise with numbers and always include risk assessments.`,

      operations: `You are CoreFlow360's AI Operations Expert. You make everything run smoother and faster.
      Your role is to:
      - Optimize resource allocation and efficiency
      - Predict maintenance needs and bottlenecks
      - Automate repetitive processes
      - Monitor performance and quality metrics
      
      Focus on measurable efficiency improvements.`,

      hr: `You are CoreFlow360's AI People Expert. You keep the best people happy and find great new ones.
      Your role is to:
      - Match candidates to roles with precision
      - Predict employee performance and retention
      - Optimize compensation and career development
      - Identify skill gaps and training needs
      
      Always consider both business needs and employee wellbeing.`,

      analytics: `You are CoreFlow360's AI Crystal Ball. You show the future of the business.
      Your role is to:
      - Identify hidden patterns and trends
      - Build predictive models for key metrics
      - Create actionable insights from data
      - Optimize KPIs and performance indicators
      
      Provide clear, visual insights with confidence levels.`
    }

    const systemMessage = systemPrompts[department as keyof typeof systemPrompts] || 
      `You are CoreFlow360's AI Business Partner. You help optimize all aspects of business operations with intelligent, data-driven recommendations.`

    return ChatPromptTemplate.fromMessages([
      ["system", systemMessage],
      new MessagesPlaceholder("conversation_history"),
      ["human", "{input}"]
    ])
  }

  /**
   * Retrieve relevant context from vector store
   */
  private async retrieveContext(query: string, k: number = 3): Promise<string> {
    if (!this.vectorStore) return ''

    try {
      const results = await this.vectorStore.similaritySearch(query, k)
      return results.map(doc => doc.pageContent).join('\n\n')
    } catch (error) {
      console.error('Context retrieval failed:', error)
      return ''
    }
  }

  /**
   * Build conversation history for context
   */
  private buildConversationHistory(context: OrchestrationContext) {
    const conversationId = `${context.tenantId}-${context.userId}`
    let history = this.conversationMemory.get(conversationId) || []

    // Add current conversation if provided
    if (context.conversation) {
      const messages = context.conversation.map(msg => {
        switch (msg.role) {
          case 'system':
            return new SystemMessage(msg.content)
          case 'assistant':
            return new AIMessage(msg.content)
          default:
            return new HumanMessage(msg.content)
        }
      })
      history = [...history, ...messages]
    }

    // Keep only last 10 messages for context
    if (history.length > 10) {
      history = history.slice(-10)
    }

    this.conversationMemory.set(conversationId, history)
    return history
  }

  /**
   * Determine the best task type for provider selection
   */
  private determineTaskType(input: string, department?: string): string {
    const taskKeywords = {
      'reasoning': ['analyze', 'compare', 'evaluate', 'assess', 'reason', 'logic'],
      'code-generation': ['code', 'script', 'function', 'api', 'programming'],
      'vision': ['image', 'chart', 'graph', 'visual', 'picture'],
      'embeddings': ['similar', 'search', 'find', 'match', 'related'],
      'cost-optimization': ['cheap', 'budget', 'cost', 'affordable', 'economical']
    }

    for (const [task, keywords] of Object.entries(taskKeywords)) {
      if (keywords.some(keyword => input.toLowerCase().includes(keyword))) {
        return task
      }
    }

    // Department-specific task mapping
    if (department === 'analytics') return 'reasoning'
    if (department === 'finance') return 'reasoning'
    if (department === 'operations') return 'cost-optimization'

    return 'reasoning' // Default
  }

  /**
   * Main orchestration method
   */
  async orchestrate(input: string, context: OrchestrationContext): Promise<OrchestrationResult> {
    const startTime = Date.now()

    try {
      // Retrieve relevant context
      const relevantContext = await this.retrieveContext(input)
      
      // Build conversation history
      const conversationHistory = this.buildConversationHistory(context)
      
      // Create department-specific prompt
      const promptTemplate = this.createDepartmentPrompt(context.department || 'general')
      
      // Determine task type for provider selection
      const taskType = this.determineTaskType(input, context.department)
      
      // Enhance input with context
      const enhancedInput = relevantContext ? 
        `Context: ${relevantContext}\n\nUser Query: ${input}` : input

      // Create the processing chain
      const chain = RunnableSequence.from([
        RunnableMap.from({
          input: () => enhancedInput,
          conversation_history: () => conversationHistory,
        }),
        promptTemplate,
        new StringOutputParser(),
      ])

      // Generate response using multi-LLM manager
      const llmRequest: LLMRequest = {
        prompt: await chain.invoke({}),
        task: taskType,
        provider: context.context?.preferredProvider,
      }

      const llmResponse = await multiLLMManager.generateCompletion(llmRequest)
      
      // Generate follow-up actions
      const followUpActions = await this.generateFollowUpActions(
        input, 
        llmResponse.content, 
        context.department
      )

      // Find related insights
      const relatedInsights = await this.findRelatedInsights(input)

      const endTime = Date.now()

      return {
        response: llmResponse.content,
        confidence: this.calculateConfidence(llmResponse.content),
        provider: llmResponse.provider,
        processingTime: endTime - startTime,
        tokensUsed: llmResponse.tokensUsed,
        cost: llmResponse.cost,
        followUpActions,
        relatedInsights,
      }

    } catch (error) {
      console.error('Orchestration failed:', error)
      throw new Error(`AI orchestration failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate follow-up action recommendations
   */
  private async generateFollowUpActions(
    input: string, 
    response: string, 
    department?: string
  ): Promise<string[]> {
    try {
      const actionPrompt = `Based on this query and response, suggest 3 specific follow-up actions:
      
      Query: ${input}
      Response: ${response}
      Department: ${department || 'general'}
      
      Provide only actionable next steps, each on a new line starting with "- "`

      const actionResponse = await multiLLMManager.generateCompletion({
        prompt: actionPrompt,
        task: 'reasoning',
      })

      return actionResponse.content
        .split('\n')
        .filter(line => line.trim().startsWith('- '))
        .map(line => line.replace(/^- /, '').trim())
        .slice(0, 3)

    } catch (error) {
      console.error('Failed to generate follow-up actions:', error)
      return []
    }
  }

  /**
   * Find related insights from vector store
   */
  private async findRelatedInsights(query: string): Promise<string[]> {
    if (!this.vectorStore) return []

    try {
      const results = await this.vectorStore.similaritySearch(query, 2)
      return results.map(doc => doc.pageContent.substring(0, 100) + '...')
    } catch (error) {
      console.error('Failed to find related insights:', error)
      return []
    }
  }

  /**
   * Calculate confidence score based on response characteristics
   */
  private calculateConfidence(response: string): number {
    let confidence = 0.5 // Base confidence

    // Higher confidence for longer, more detailed responses
    if (response.length > 200) confidence += 0.1
    if (response.length > 500) confidence += 0.1

    // Higher confidence if response includes specific actions or numbers
    if (/\d+%|\$\d+|\d+\.\d+/.test(response)) confidence += 0.1
    if (response.includes('recommend') || response.includes('suggest')) confidence += 0.1

    // Lower confidence for vague responses
    if (response.includes('might') || response.includes('possibly')) confidence -= 0.1
    if (response.length < 50) confidence -= 0.2

    return Math.max(0.1, Math.min(1.0, confidence))
  }

  /**
   * Clear conversation memory for a user
   */
  clearConversationMemory(tenantId: string, userId: string) {
    const conversationId = `${tenantId}-${userId}`
    this.conversationMemory.delete(conversationId)
  }

  /**
   * Add documents to vector store
   */
  async addKnowledgeDocument(content: string, metadata: Record<string, any>) {
    if (!this.vectorStore) return

    const docs = await this.textSplitter.splitText(content)
    const documents = docs.map(text => new Document({
      pageContent: text,
      metadata,
    }))

    await this.vectorStore.addDocuments(documents)
  }
}

// Singleton instance
export const langChainOrchestrator = new LangChainOrchestrator()