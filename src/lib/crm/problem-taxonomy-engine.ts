/**
 * CoreFlow360 - AI-Powered Problem Taxonomy Engine
 * Advanced categorization and classification of business problems
 */

import { OpenAI } from 'openai'
import { prisma } from '@/lib/db'
import { ProblemSeverity, IndustryType } from '@prisma/client'

export interface ProblemTaxonomy {
  id: string
  name: string
  description: string
  level: number // 0=root, 1=category, 2=subcategory, 3=specific
  parent?: ProblemTaxonomy
  children: ProblemTaxonomy[]

  // Classification Rules
  keywords: string[]
  patterns: RegExp[]
  exclusions: string[]

  // Industry Specificity
  industries: IndustryType[]
  departments: string[]

  // Severity Rules
  severityRules: SeverityRule[]
  defaultSeverity: ProblemSeverity

  // Solution Intelligence
  commonSolutions: Solution[]
  implementationComplexity: 'LOW' | 'MEDIUM' | 'HIGH' | 'ENTERPRISE'
  typicalTimeframe: string
  averageDealSize: number

  // AI Training
  trainingExamples: TrainingExample[]
  mlModelId?: string
  confidenceThreshold: number
}

export interface SeverityRule {
  condition: string
  severity: ProblemSeverity
  weight: number
}

export interface Solution {
  id: string
  name: string
  description: string
  category: string
  fitScore: number // How well it solves this problem type
  competitors: string[]
  differentiators: string[]
}

export interface TrainingExample {
  text: string
  classification: string
  severity: ProblemSeverity
  confidence: number
  verified: boolean
}

export interface ClassificationResult {
  taxonomy: ProblemTaxonomy
  confidence: number
  severity: ProblemSeverity
  reasonCode: string
  alternativeClassifications: Array<{
    taxonomy: ProblemTaxonomy
    confidence: number
  }>
}

export class ProblemTaxonomyEngine {
  private openai: OpenAI
  private taxonomyTree: Map<string, ProblemTaxonomy>
  private industryTaxonomies: Map<IndustryType, ProblemTaxonomy[]>
  private mlModels: Map<string, unknown>

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    this.taxonomyTree = new Map()
    this.industryTaxonomies = new Map()
    this.mlModels = new Map()

    this.initializeTaxonomyTree()
    this.loadIndustryTaxonomies()
  }

  /**
   * Main classification method
   */
  async classifyProblem(params: {
    text: string
    industry?: IndustryType
    department?: string
    context?: Record<string, unknown>
  }): Promise<ClassificationResult> {
    try {
      

      // Multi-stage classification approach
      const results = await Promise.all([
        this.ruleBasedClassification(params),
        this.aiBasedClassification(params),
        this.patternMatchingClassification(params),
      ])

      // Combine and weigh results
      const combinedResult = this.combineClassificationResults(results)

      // Validate and refine
      const validatedResult = await this.validateClassification(combinedResult, params)

      console.log(
        `✅ Problem classified as: ${validatedResult.taxonomy.name} (${validatedResult.confidence}%)`
      )
      return validatedResult
    } catch (error) {
      
      throw new Error(
        `Classification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Rule-based classification using keywords and patterns
   */
  private async ruleBasedClassification(params: {
    text: string
    industry?: IndustryType
    department?: string
  }): Promise<Partial<ClassificationResult>> {
    const { text, industry, department } = params
    const textLower = text.toLowerCase()

    // Get applicable taxonomies
    const applicableTaxonomies = this.getApplicableTaxonomies(industry, department)

    let bestMatch: { taxonomy: ProblemTaxonomy; score: number } | null = null

    for (const taxonomy of applicableTaxonomies) {
      let score = 0

      // Keyword matching
      for (const keyword of taxonomy.keywords) {
        if (textLower.includes(keyword.toLowerCase())) {
          score += 10
        }
      }

      // Pattern matching
      for (const pattern of taxonomy.patterns) {
        if (pattern.test(textLower)) {
          score += 15
        }
      }

      // Exclusion penalties
      for (const exclusion of taxonomy.exclusions) {
        if (textLower.includes(exclusion.toLowerCase())) {
          score -= 20
        }
      }

      // Department bonus
      if (department && taxonomy.departments.includes(department)) {
        score += 5
      }

      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { taxonomy, score }
      }
    }

    if (bestMatch && bestMatch.score > 20) {
      const severity = this.calculateSeverity(text, bestMatch.taxonomy)
      return {
        taxonomy: bestMatch.taxonomy,
        confidence: Math.min(95, Math.max(10, bestMatch.score)),
        severity,
        reasonCode: 'RULE_BASED',
      }
    }

    return { confidence: 0 }
  }

  /**
   * AI-based classification using OpenAI
   */
  private async aiBasedClassification(params: {
    text: string
    industry?: IndustryType
    department?: string
  }): Promise<Partial<ClassificationResult>> {
    try {
      const { text, industry, department } = params

      // Get taxonomy options for AI to choose from
      const taxonomyOptions = this.getApplicableTaxonomies(industry, department)
        .slice(0, 20) // Limit options to prevent token overflow
        .map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description,
          keywords: t.keywords.slice(0, 5),
        }))

      const prompt = `
        Analyze this business problem text and classify it into the most appropriate category.
        
        Problem Text: "${text}"
        ${industry ? `Industry: ${industry}` : ''}
        ${department ? `Department: ${department}` : ''}
        
        Available Categories:
        ${taxonomyOptions.map((t) => `- ${t.name}: ${t.description} (keywords: ${t.keywords.join(', ')})`).join('\n')}
        
        Respond with JSON in this exact format:
        {
          "classification": "taxonomy_id",
          "confidence": 0-100,
          "severity": "MINOR|MODERATE|MAJOR|CRITICAL|EXISTENTIAL",
          "reasoning": "brief explanation",
          "alternatives": [
            {"taxonomy": "id", "confidence": 0-100}
          ]
        }
        
        Consider:
        - Explicit problem statements
        - Implicit pain points
        - Business impact indicators
        - Urgency signals
        - Technical vs business problems
        - Industry-specific nuances
        
        Only return valid JSON, no other text.
      `

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 800,
      })

      const result = response.choices[0]?.message?.content
      if (!result) {
        return { confidence: 0 }
      }

      const parsed = JSON.parse(result)
      const taxonomy = this.taxonomyTree.get(parsed.classification)

      if (taxonomy) {
        return {
          taxonomy,
          confidence: parsed.confidence,
          severity: parsed.severity as ProblemSeverity,
          reasonCode: 'AI_BASED',
          alternativeClassifications:
            parsed.alternatives
              ?.map((alt: unknown) => ({
                taxonomy: this.taxonomyTree.get(alt.taxonomy),
                confidence: alt.confidence,
              }))
              .filter((alt: unknown) => alt.taxonomy) || [],
        }
      }

      return { confidence: 0 }
    } catch (error) {
      
      return { confidence: 0 }
    }
  }

  /**
   * Pattern matching classification using ML-like approaches
   */
  private async patternMatchingClassification(params: {
    text: string
    industry?: IndustryType
  }): Promise<Partial<ClassificationResult>> {
    const { text, industry } = params

    // Extract features from text
    const features = this.extractTextFeatures(text)

    // Get training examples for the industry
    const trainingExamples = this.getTrainingExamples(industry)

    // Calculate similarity scores
    let bestMatch: { taxonomy: ProblemTaxonomy; score: number } | null = null

    for (const example of trainingExamples) {
      const taxonomy = this.taxonomyTree.get(example.classification)
      if (!taxonomy) continue

      const similarity = this.calculateTextSimilarity(
        features,
        this.extractTextFeatures(example.text)
      )

      if (!bestMatch || similarity > bestMatch.score) {
        bestMatch = { taxonomy, score: similarity }
      }
    }

    if (bestMatch && bestMatch.score > 0.6) {
      return {
        taxonomy: bestMatch.taxonomy,
        confidence: Math.round(bestMatch.score * 100),
        severity: bestMatch.taxonomy.defaultSeverity,
        reasonCode: 'PATTERN_MATCHING',
      }
    }

    return { confidence: 0 }
  }

  /**
   * Combine multiple classification results
   */
  private combineClassificationResults(
    results: Partial<ClassificationResult>[]
  ): ClassificationResult {
    // Weight different approaches
    const weights = {
      RULE_BASED: 0.4,
      AI_BASED: 0.5,
      PATTERN_MATCHING: 0.1,
    }

    let bestResult: Partial<ClassificationResult> | null = null
    let maxWeightedScore = 0

    for (const result of results) {
      if (result.taxonomy && result.confidence && result.reasonCode) {
        const weight = weights[result.reasonCode as keyof typeof weights] || 0.1
        const weightedScore = result.confidence * weight

        if (weightedScore > maxWeightedScore) {
          maxWeightedScore = weightedScore
          bestResult = result
        }
      }
    }

    if (bestResult && bestResult.taxonomy && bestResult.confidence !== undefined) {
      return {
        taxonomy: bestResult.taxonomy,
        confidence: Math.round(maxWeightedScore / Math.max(...Object.values(weights))),
        severity: bestResult.severity || bestResult.taxonomy.defaultSeverity,
        reasonCode: bestResult.reasonCode || 'COMBINED',
        alternativeClassifications: bestResult.alternativeClassifications || [],
      }
    }

    // Fallback to general category
    const generalTaxonomy = this.taxonomyTree.get('general_business_problem')
    return {
      taxonomy: generalTaxonomy || this.createFallbackTaxonomy(),
      confidence: 30,
      severity: 'MODERATE',
      reasonCode: 'FALLBACK',
      alternativeClassifications: [],
    }
  }

  /**
   * Validate classification result
   */
  private async validateClassification(
    result: ClassificationResult,
    params: { text: string; industry?: IndustryType }
  ): Promise<ClassificationResult> {
    // Check confidence threshold
    if (result.confidence < result.taxonomy.confidenceThreshold) {
      console.log(`Low confidence classification (${result.confidence}), requesting human review`)
      // In production, this would trigger human review workflow
    }

    // Industry validation
    if (params.industry && !result.taxonomy.industries.includes(params.industry)) {
      
      result.confidence = Math.max(10, result.confidence - 20)
    }

    // Severity validation
    result.severity = this.calculateSeverity(params.text, result.taxonomy)

    return result
  }

  /**
   * Calculate problem severity based on text analysis
   */
  private calculateSeverity(text: string, taxonomy: ProblemTaxonomy): ProblemSeverity {
    const textLower = text.toLowerCase()

    // Apply taxonomy-specific severity rules
    for (const rule of taxonomy.severityRules) {
      if (this.evaluateCondition(rule.condition, textLower)) {
        return rule.severity
      }
    }

    // General severity indicators
    const severityKeywords = {
      EXISTENTIAL: ['bankruptcy', 'shutdown', 'failure', 'collapse', 'existential'],
      CRITICAL: ['critical', 'emergency', 'urgent', 'crisis', 'breaking', 'failing'],
      MAJOR: ['major', 'significant', 'important', 'severe', 'serious'],
      MODERATE: ['moderate', 'noticeable', 'affecting', 'impacting'],
      MINOR: ['minor', 'small', 'slight', 'minimal'],
    }

    for (const [severity, keywords] of Object.entries(severityKeywords)) {
      if (keywords.some((keyword) => textLower.includes(keyword))) {
        return severity as ProblemSeverity
      }
    }

    return taxonomy.defaultSeverity
  }

  /**
   * Get applicable taxonomies based on industry and department
   */
  private getApplicableTaxonomies(industry?: IndustryType, department?: string): ProblemTaxonomy[] {
    let taxonomies: ProblemTaxonomy[] = []

    // Add industry-specific taxonomies
    if (industry) {
      const industryTaxonomies = this.industryTaxonomies.get(industry) || []
      taxonomies.push(...industryTaxonomies)
    }

    // Add general taxonomies
    const generalTaxonomies = Array.from(this.taxonomyTree.values()).filter(
      (t) => t.industries.length === 0 || t.industries.includes('GENERAL' as IndustryType)
    )
    taxonomies.push(...generalTaxonomies)

    // Filter by department if specified
    if (department) {
      taxonomies = taxonomies.filter(
        (t) => t.departments.length === 0 || t.departments.includes(department)
      )
    }

    return taxonomies
  }

  /**
   * Extract text features for similarity calculation
   */
  private extractTextFeatures(text: string): Record<string, number> {
    const words = text.toLowerCase().split(/\s+/)
    const features: Record<string, number> = {}

    // Word frequency
    for (const word of words) {
      features[word] = (features[word] || 0) + 1
    }

    // N-grams
    for (let i = 0; i < words.length - 1; i++) {
      const bigram = `${words[i]}_${words[i + 1]}`
      features[bigram] = (features[bigram] || 0) + 1
    }

    return features
  }

  /**
   * Calculate text similarity using cosine similarity
   */
  private calculateTextSimilarity(
    features1: Record<string, number>,
    features2: Record<string, number>
  ): number {
    const allKeys = new Set([...Object.keys(features1), ...Object.keys(features2)])

    let dotProduct = 0
    let magnitude1 = 0
    let magnitude2 = 0

    for (const key of allKeys) {
      const val1 = features1[key] || 0
      const val2 = features2[key] || 0

      dotProduct += val1 * val2
      magnitude1 += val1 * val1
      magnitude2 += val2 * val2
    }

    if (magnitude1 === 0 || magnitude2 === 0) return 0

    return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2))
  }

  /**
   * Get training examples for an industry
   */
  private getTrainingExamples(industry?: IndustryType): TrainingExample[] {
    // In production, this would load from database
    const examples: TrainingExample[] = [
      {
        text: "Our CRM system is outdated and doesn't integrate with our new marketing platform",
        classification: 'integration_problem',
        severity: 'MAJOR',
        confidence: 90,
        verified: true,
      },
      {
        text: 'Sales team is spending too much time on manual data entry',
        classification: 'efficiency_problem',
        severity: 'MODERATE',
        confidence: 85,
        verified: true,
      },
      // Add more training examples...
    ]

    return examples
  }

  /**
   * Evaluate a condition string against text
   */
  private evaluateCondition(condition: string, text: string): boolean {
    // Simple condition evaluation - could be enhanced with expression parser
    if (condition.startsWith('contains:')) {
      const keyword = condition.substring(9)
      return text.includes(keyword)
    }

    if (condition.startsWith('regex:')) {
      const pattern = condition.substring(6)
      return new RegExp(pattern, 'i').test(text)
    }

    return false
  }

  /**
   * Create fallback taxonomy for unclassified problems
   */
  private createFallbackTaxonomy(): ProblemTaxonomy {
    return {
      id: 'fallback',
      name: 'Unclassified Problem',
      description: 'Problem that could not be automatically classified',
      level: 0,
      children: [],
      keywords: [],
      patterns: [],
      exclusions: [],
      industries: [],
      departments: [],
      severityRules: [],
      defaultSeverity: 'MODERATE',
      commonSolutions: [],
      implementationComplexity: 'MEDIUM',
      typicalTimeframe: '2-4 weeks',
      averageDealSize: 25000,
      trainingExamples: [],
      confidenceThreshold: 0.1,
    }
  }

  /**
   * Initialize the taxonomy tree
   */
  private initializeTaxonomyTree(): void {
    // Root categories
    const rootCategories = [
      this.createTaxonomy({
        id: 'technology_problems',
        name: 'Technology Problems',
        description: 'Issues related to software, hardware, and IT infrastructure',
        level: 0,
        keywords: ['system', 'software', 'technology', 'IT', 'integration', 'platform'],
        departments: ['IT', 'Engineering'],
        defaultSeverity: 'MAJOR',
      }),

      this.createTaxonomy({
        id: 'process_problems',
        name: 'Process Problems',
        description: 'Inefficiencies and bottlenecks in business processes',
        level: 0,
        keywords: ['process', 'workflow', 'manual', 'inefficient', 'bottleneck'],
        departments: ['Operations'],
        defaultSeverity: 'MODERATE',
      }),

      this.createTaxonomy({
        id: 'customer_problems',
        name: 'Customer Problems',
        description: 'Issues affecting customer satisfaction and experience',
        level: 0,
        keywords: ['customer', 'client', 'satisfaction', 'experience', 'support'],
        departments: ['Customer Service', 'Sales'],
        defaultSeverity: 'MAJOR',
      }),

      this.createTaxonomy({
        id: 'financial_problems',
        name: 'Financial Problems',
        description: 'Budget, cost, and revenue-related issues',
        level: 0,
        keywords: ['budget', 'cost', 'revenue', 'financial', 'money', 'expense'],
        departments: ['Finance'],
        defaultSeverity: 'CRITICAL',
      }),

      this.createTaxonomy({
        id: 'compliance_problems',
        name: 'Compliance Problems',
        description: 'Regulatory and legal compliance issues',
        level: 0,
        keywords: ['compliance', 'regulation', 'audit', 'legal', 'policy'],
        departments: ['Legal', 'Compliance'],
        defaultSeverity: 'CRITICAL',
      }),
    ]

    // Add to tree
    for (const category of rootCategories) {
      this.taxonomyTree.set(category.id, category)
    }

    // Add subcategories
    this.addSubcategories()
  }

  /**
   * Add subcategories to the taxonomy tree
   */
  private addSubcategories(): void {
    // Technology subcategories
    const techSubcategories = [
      this.createTaxonomy({
        id: 'integration_problem',
        name: 'Integration Problems',
        description: 'System integration and API connectivity issues',
        level: 1,
        keywords: ['integration', 'api', 'connect', 'sync', 'interface'],
        parentId: 'technology_problems',
      }),

      this.createTaxonomy({
        id: 'performance_problem',
        name: 'Performance Problems',
        description: 'System speed and performance issues',
        level: 1,
        keywords: ['slow', 'performance', 'speed', 'lag', 'timeout'],
        parentId: 'technology_problems',
      }),
    ]

    // Process subcategories
    const processSubcategories = [
      this.createTaxonomy({
        id: 'efficiency_problem',
        name: 'Efficiency Problems',
        description: 'Manual processes and inefficiencies',
        level: 1,
        keywords: ['manual', 'efficiency', 'automation', 'time-consuming'],
        parentId: 'process_problems',
      }),
    ]

    const allSubcategories = [...techSubcategories, ...processSubcategories]

    for (const subcategory of allSubcategories) {
      this.taxonomyTree.set(subcategory.id, subcategory)

      // Link to parent
      const parent = this.taxonomyTree.get(subcategory.parent?.id || '')
      if (parent) {
        parent.children.push(subcategory)
      }
    }
  }

  /**
   * Load industry-specific taxonomies
   */
  private loadIndustryTaxonomies(): void {
    // Finance industry problems
    const financeProblems = [
      this.createTaxonomy({
        id: 'regulatory_reporting',
        name: 'Regulatory Reporting',
        description: 'Issues with financial regulatory reporting',
        level: 1,
        keywords: ['reporting', 'regulatory', 'compliance', 'sox', 'audit'],
        industries: ['FINANCE'],
        defaultSeverity: 'CRITICAL',
      }),
    ]

    // Healthcare industry problems
    const healthcareProblems = [
      this.createTaxonomy({
        id: 'hipaa_compliance',
        name: 'HIPAA Compliance',
        description: 'Patient data privacy and HIPAA compliance issues',
        level: 1,
        keywords: ['hipaa', 'patient', 'privacy', 'phi', 'healthcare'],
        industries: ['HEALTHCARE'],
        defaultSeverity: 'CRITICAL',
      }),
    ]

    this.industryTaxonomies.set('FINANCE', financeProblems)
    this.industryTaxonomies.set('HEALTHCARE', healthcareProblems)

    // Add to main tree
    for (const problems of [financeProblems, healthcareProblems]) {
      for (const problem of problems) {
        this.taxonomyTree.set(problem.id, problem)
      }
    }
  }

  /**
   * Helper to create taxonomy objects
   */
  private createTaxonomy(params: {
    id: string
    name: string
    description: string
    level: number
    keywords?: string[]
    patterns?: RegExp[]
    exclusions?: string[]
    industries?: IndustryType[]
    departments?: string[]
    defaultSeverity?: ProblemSeverity
    parentId?: string
  }): ProblemTaxonomy {
    return {
      id: params.id,
      name: params.name,
      description: params.description,
      level: params.level,
      children: [],
      keywords: params.keywords || [],
      patterns: params.patterns || [],
      exclusions: params.exclusions || [],
      industries: params.industries || [],
      departments: params.departments || [],
      severityRules: [],
      defaultSeverity: params.defaultSeverity || 'MODERATE',
      commonSolutions: [],
      implementationComplexity: 'MEDIUM',
      typicalTimeframe: '2-4 weeks',
      averageDealSize: 25000,
      trainingExamples: [],
      confidenceThreshold: 0.7,
    }
  }
}

export default ProblemTaxonomyEngine
