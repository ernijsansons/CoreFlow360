/**
 * CoreFlow360 - Enhanced Prompt Engineering Framework
 * SACRED methodology with Triple-Layer prompt structure
 */

export interface SACREDPrompt {
  specific: SpecificCriteria
  actionable: ActionableSteps
  contextual: CompleteContext
  reasoned: ChainOfThought
  evidenceBased: EvidenceRequirements
  deliverable: OutputFormat
}

export interface SpecificCriteria {
  outcomes: string[]
  measurableCriteria: MeasurableCriterion[]
  successThreshold: string
  scope: string[]
}

export interface MeasurableCriterion {
  metric: string
  target: string | number
  unit: string
  priority: 'critical' | 'high' | 'medium' | 'low'
}

export interface ActionableSteps {
  requireImplementationSteps: boolean
  stepDetailLevel: 'high' | 'medium' | 'low'
  includeCodeExamples: boolean
  timeEstimates: boolean
  dependencyMapping: boolean
}

export interface CompleteContext {
  codebaseContext: CodebaseContext
  businessRequirements: BusinessRequirement[]
  constraints: Constraint[]
  stakeholders: Stakeholder[]
  environment: EnvironmentContext
}

export interface CodebaseContext {
  languages: string[]
  frameworks: string[]
  architecture: string
  dependencies: string[]
  codeMetrics: {
    totalFiles: number
    totalLines: number
    complexity: string
  }
}

export interface BusinessRequirement {
  id: string
  description: string
  priority: 'must_have' | 'should_have' | 'nice_to_have'
  successCriteria: string[]
  constraints: string[]
}

export interface Constraint {
  type: 'time' | 'budget' | 'technology' | 'regulatory' | 'resource'
  description: string
  impact: 'high' | 'medium' | 'low'
  flexibility: 'fixed' | 'negotiable' | 'flexible'
}

export interface Stakeholder {
  role: string
  concerns: string[]
  decisionPower: 'high' | 'medium' | 'low'
}

export interface EnvironmentContext {
  deployment: 'cloud' | 'on-premise' | 'hybrid'
  scale: 'startup' | 'smb' | 'enterprise'
  industry: string
  compliance: string[]
}

export interface ChainOfThought {
  steps: ThoughtStep[]
  reasoningDepth: 'shallow' | 'medium' | 'deep'
  includeAlternatives: boolean
  explainTradeoffs: boolean
}

export interface ThoughtStep {
  step: number
  description: string
  reasoning: string
  evidence: string[]
  confidence: number
  alternatives?: string[]
}

export interface EvidenceRequirements {
  codeReferences: boolean
  lineNumbers: boolean
  contextLines: number
  includeTests: boolean
  performanceMetrics: boolean
  securityScans: boolean
}

export interface OutputFormat {
  format: 'json' | 'xml' | 'markdown' | 'structured'
  includeExecutiveSummary: boolean
  includeTechnicalDetails: boolean
  includeImplementationPlan: boolean
  includeROIAnalysis: boolean
  customSchema?: any
}

/**
 * Triple-Layer Prompt Builder
 */
export class TripleLayerPromptBuilder {
  private systemRole: string = ''
  private context: CompleteContext | null = null
  private task: AuditTask | null = null

  /**
   * Set the system role layer
   */
  setSystemRole(expertise: string, experience: string, specialization: string[]): this {
    this.systemRole = `
<system_role>
You are an expert ${expertise} with ${experience} years of experience.
Specializations: ${specialization.join(', ')}
You provide detailed, actionable insights following industry best practices.
You use chain-of-thought reasoning to ensure comprehensive analysis.
You support all findings with specific evidence and code references.
</system_role>`
    return this
  }

  /**
   * Set the context layer
   */
  setContext(context: CompleteContext): this {
    this.context = context
    return this
  }

  /**
   * Set the task layer
   */
  setTask(task: AuditTask): this {
    this.task = task
    return this
  }

  /**
   * Build the complete prompt
   */
  build(): string {
    if (!this.systemRole || !this.context || !this.task) {
      throw new Error('All three layers must be set before building prompt')
    }

    return `
${this.systemRole}

<context>
  <codebase>
    <languages>${this.context.codebaseContext.languages.join(', ')}</languages>
    <frameworks>${this.context.codebaseContext.frameworks.join(', ')}</frameworks>
    <architecture>${this.context.codebaseContext.architecture}</architecture>
    <metrics>
      <total_files>${this.context.codebaseContext.codeMetrics.totalFiles}</total_files>
      <total_lines>${this.context.codebaseContext.codeMetrics.totalLines}</total_lines>
      <complexity>${this.context.codebaseContext.codeMetrics.complexity}</complexity>
    </metrics>
  </codebase>
  
  <business_requirements>
    ${this.context.businessRequirements.map(req => `
    <requirement priority="${req.priority}">
      <description>${req.description}</description>
      <success_criteria>${req.successCriteria.join('; ')}</success_criteria>
    </requirement>`).join('')}
  </business_requirements>
  
  <constraints>
    ${this.context.constraints.map(constraint => `
    <constraint type="${constraint.type}" impact="${constraint.impact}">
      ${constraint.description}
    </constraint>`).join('')}
  </constraints>
  
  <environment>
    <deployment>${this.context.environment.deployment}</deployment>
    <scale>${this.context.environment.scale}</scale>
    <industry>${this.context.environment.industry}</industry>
    <compliance>${this.context.environment.compliance.join(', ')}</compliance>
  </environment>
</context>

<task>
  <objective>${this.task.objective}</objective>
  
  <methodology>
    <approach>${this.task.methodology.approach}</approach>
    <chain_of_thought>
      ${this.task.methodology.steps.map((step, index) => `
      <step number="${index + 1}">
        <action>${step.action}</action>
        <reasoning>${step.reasoning}</reasoning>
        <expected_output>${step.expectedOutput}</expected_output>
      </step>`).join('')}
    </chain_of_thought>
  </methodology>
  
  <output_format>
    <structure>${this.task.outputFormat.structure}</structure>
    <findings_template>
      <finding severity="[critical|high|medium|low]">
        <issue>[Specific issue description]</issue>
        <evidence>
          <code_reference file="[path]" line="[number]">[code snippet]</code_reference>
          <explanation>[Why this is an issue]</explanation>
        </evidence>
        <impact>
          <business>[Business consequence]</business>
          <technical>[Technical impact]</technical>
          <risk_score>[1-100]</risk_score>
        </impact>
        <remediation>
          <quick_fix>
            <description>[Immediate action]</description>
            <effort>[hours]</effort>
            <code_example>[example code]</code_example>
          </quick_fix>
          <long_term>
            <description>[Strategic solution]</description>
            <effort>[days/weeks]</effort>
            <benefits>[Expected improvements]</benefits>
          </long_term>
        </remediation>
        <verification>
          <test_cases>[How to verify fix]</test_cases>
          <success_criteria>[Measurable outcomes]</success_criteria>
        </verification>
      </finding>
    </findings_template>
  </output_format>
  
  <analysis_parameters>
    <depth>${this.task.analysisDepth}</depth>
    <focus_areas>${this.task.focusAreas.join(', ')}</focus_areas>
    <exclude>${this.task.excludePatterns?.join(', ') || 'none'}</exclude>
    <time_budget>${this.task.timeBudget}</time_budget>
  </analysis_parameters>
</task>`
  }
}

export interface AuditTask {
  objective: string
  methodology: {
    approach: string
    steps: MethodologyStep[]
  }
  outputFormat: {
    structure: 'xml' | 'json' | 'markdown'
    includeMetrics: boolean
    includeRecommendations: boolean
  }
  analysisDepth: 'surface' | 'standard' | 'deep' | 'exhaustive'
  focusAreas: string[]
  excludePatterns?: string[]
  timeBudget: string
}

export interface MethodologyStep {
  action: string
  reasoning: string
  expectedOutput: string
}

/**
 * SACRED Prompt Templates
 */
export class SACREDPromptTemplates {
  /**
   * Security Audit Prompt
   */
  static securityAudit(): SACREDPrompt {
    return {
      specific: {
        outcomes: [
          'Identify all security vulnerabilities with CVSS scores',
          'Map vulnerabilities to OWASP Top 10',
          'Provide remediation timeline based on severity'
        ],
        measurableCriteria: [
          {
            metric: 'Critical vulnerabilities',
            target: 0,
            unit: 'count',
            priority: 'critical'
          },
          {
            metric: 'High severity issues resolution',
            target: 48,
            unit: 'hours',
            priority: 'high'
          },
          {
            metric: 'Security score improvement',
            target: 90,
            unit: 'percent',
            priority: 'high'
          }
        ],
        successThreshold: 'Zero critical vulnerabilities and security score > 85%',
        scope: ['authentication', 'authorization', 'input_validation', 'data_protection']
      },
      actionable: {
        requireImplementationSteps: true,
        stepDetailLevel: 'high',
        includeCodeExamples: true,
        timeEstimates: true,
        dependencyMapping: true
      },
      contextual: {
        codebaseContext: {
          languages: ['TypeScript', 'JavaScript'],
          frameworks: ['Next.js', 'React', 'Prisma'],
          architecture: 'Microservices with API Gateway',
          dependencies: ['next-auth', 'bcryptjs', 'jsonwebtoken'],
          codeMetrics: {
            totalFiles: 450,
            totalLines: 75000,
            complexity: 'medium-high'
          }
        },
        businessRequirements: [
          {
            id: 'SEC-001',
            description: 'Achieve SOC2 Type II compliance',
            priority: 'must_have',
            successCriteria: ['Pass security audit', 'Implement required controls'],
            constraints: ['6 month timeline', 'Limited security expertise']
          }
        ],
        constraints: [
          {
            type: 'time',
            description: 'Security fixes must be completed within Q1',
            impact: 'high',
            flexibility: 'fixed'
          },
          {
            type: 'budget',
            description: 'Security tooling budget capped at $10k/year',
            impact: 'medium',
            flexibility: 'negotiable'
          }
        ],
        stakeholders: [
          {
            role: 'CISO',
            concerns: ['Compliance', 'Data breach risk', 'Audit readiness'],
            decisionPower: 'high'
          },
          {
            role: 'Development Team',
            concerns: ['Implementation complexity', 'Performance impact'],
            decisionPower: 'medium'
          }
        ],
        environment: {
          deployment: 'cloud',
          scale: 'enterprise',
          industry: 'Financial Services',
          compliance: ['SOC2', 'GDPR', 'PCI-DSS']
        }
      },
      reasoned: {
        steps: [
          {
            step: 1,
            description: 'Analyze authentication implementation',
            reasoning: 'Authentication is the first line of defense',
            evidence: ['auth.config.ts', 'middleware.ts'],
            confidence: 0.95,
            alternatives: ['OAuth only', 'Passwordless auth']
          },
          {
            step: 2,
            description: 'Evaluate input validation coverage',
            reasoning: 'Prevents injection attacks and data corruption',
            evidence: ['API routes', 'Form handlers'],
            confidence: 0.90
          },
          {
            step: 3,
            description: 'Assess data encryption practices',
            reasoning: 'Protects sensitive data at rest and in transit',
            evidence: ['Database configuration', 'API responses'],
            confidence: 0.85
          }
        ],
        reasoningDepth: 'deep',
        includeAlternatives: true,
        explainTradeoffs: true
      },
      evidenceBased: {
        codeReferences: true,
        lineNumbers: true,
        contextLines: 5,
        includeTests: true,
        performanceMetrics: true,
        securityScans: true
      },
      deliverable: {
        format: 'structured',
        includeExecutiveSummary: true,
        includeTechnicalDetails: true,
        includeImplementationPlan: true,
        includeROIAnalysis: true,
        customSchema: {
          findings: {
            security_vulnerabilities: [],
            compliance_gaps: [],
            best_practice_violations: []
          },
          remediation_plan: {
            immediate_actions: [],
            short_term_fixes: [],
            long_term_improvements: []
          },
          risk_assessment: {
            current_risk_score: 0,
            projected_risk_score: 0,
            risk_reduction_timeline: []
          }
        }
      }
    }
  }

  /**
   * Performance Optimization Prompt
   */
  static performanceOptimization(): SACREDPrompt {
    return {
      specific: {
        outcomes: [
          'Reduce API response time by 50%',
          'Eliminate N+1 query patterns',
          'Optimize bundle size below 200KB'
        ],
        measurableCriteria: [
          {
            metric: 'P95 response time',
            target: 200,
            unit: 'milliseconds',
            priority: 'critical'
          },
          {
            metric: 'Database query count per request',
            target: 5,
            unit: 'queries',
            priority: 'high'
          },
          {
            metric: 'Initial JS bundle size',
            target: 200,
            unit: 'kilobytes',
            priority: 'medium'
          }
        ],
        successThreshold: 'All API endpoints < 200ms P95 and bundle < 200KB',
        scope: ['database_queries', 'api_optimization', 'frontend_bundle', 'caching']
      },
      actionable: {
        requireImplementationSteps: true,
        stepDetailLevel: 'high',
        includeCodeExamples: true,
        timeEstimates: true,
        dependencyMapping: false
      },
      contextual: {
        codebaseContext: {
          languages: ['TypeScript', 'SQL'],
          frameworks: ['Next.js', 'Prisma', 'React'],
          architecture: 'Monolithic with service layer',
          dependencies: ['Large UI library', 'Multiple ORMs'],
          codeMetrics: {
            totalFiles: 300,
            totalLines: 50000,
            complexity: 'high'
          }
        },
        businessRequirements: [
          {
            id: 'PERF-001',
            description: 'Support 10x user growth without infrastructure changes',
            priority: 'must_have',
            successCriteria: ['Sub-second response times', 'No timeout errors'],
            constraints: ['Current infrastructure', 'No additional caching layers']
          }
        ],
        constraints: [
          {
            type: 'technology',
            description: 'Must maintain backward compatibility',
            impact: 'high',
            flexibility: 'fixed'
          },
          {
            type: 'resource',
            description: 'Limited to 2 developers for optimization',
            impact: 'medium',
            flexibility: 'negotiable'
          }
        ],
        stakeholders: [
          {
            role: 'Product Manager',
            concerns: ['User experience', 'Feature delivery timeline'],
            decisionPower: 'high'
          },
          {
            role: 'Infrastructure Team',
            concerns: ['Resource utilization', 'Scaling costs'],
            decisionPower: 'medium'
          }
        ],
        environment: {
          deployment: 'cloud',
          scale: 'smb',
          industry: 'SaaS',
          compliance: []
        }
      },
      reasoned: {
        steps: [
          {
            step: 1,
            description: 'Profile current performance bottlenecks',
            reasoning: 'Cannot optimize what we cannot measure',
            evidence: ['APM data', 'Database logs'],
            confidence: 1.0
          },
          {
            step: 2,
            description: 'Analyze database query patterns',
            reasoning: 'Database is often the primary bottleneck',
            evidence: ['Query logs', 'ORM usage patterns'],
            confidence: 0.95
          },
          {
            step: 3,
            description: 'Evaluate caching opportunities',
            reasoning: 'Caching provides the highest ROI for read-heavy workloads',
            evidence: ['API usage patterns', 'Data volatility analysis'],
            confidence: 0.90
          }
        ],
        reasoningDepth: 'deep',
        includeAlternatives: true,
        explainTradeoffs: true
      },
      evidenceBased: {
        codeReferences: true,
        lineNumbers: true,
        contextLines: 3,
        includeTests: false,
        performanceMetrics: true,
        securityScans: false
      },
      deliverable: {
        format: 'structured',
        includeExecutiveSummary: true,
        includeTechnicalDetails: true,
        includeImplementationPlan: true,
        includeROIAnalysis: true,
        customSchema: {
          performance_issues: {
            database: [],
            api: [],
            frontend: []
          },
          optimization_plan: {
            quick_wins: [],
            medium_term: [],
            architectural_changes: []
          },
          expected_improvements: {
            response_time_reduction: '',
            throughput_increase: '',
            resource_savings: ''
          }
        }
      }
    }
  }

  /**
   * Architecture Review Prompt
   */
  static architectureReview(): SACREDPrompt {
    return {
      specific: {
        outcomes: [
          'Identify architectural anti-patterns',
          'Assess scalability limitations',
          'Provide modernization roadmap'
        ],
        measurableCriteria: [
          {
            metric: 'Coupling score',
            target: 3,
            unit: 'scale 1-10',
            priority: 'high'
          },
          {
            metric: 'Code duplication',
            target: 5,
            unit: 'percent',
            priority: 'medium'
          },
          {
            metric: 'Architectural debt',
            target: 20,
            unit: 'story points',
            priority: 'medium'
          }
        ],
        successThreshold: 'Clean architecture with clear boundaries and < 5% duplication',
        scope: ['layering', 'dependencies', 'patterns', 'modularity']
      },
      actionable: {
        requireImplementationSteps: true,
        stepDetailLevel: 'medium',
        includeCodeExamples: true,
        timeEstimates: true,
        dependencyMapping: true
      },
      contextual: {
        codebaseContext: {
          languages: ['TypeScript'],
          frameworks: ['Next.js', 'React'],
          architecture: 'Layered monolith',
          dependencies: ['100+ npm packages'],
          codeMetrics: {
            totalFiles: 500,
            totalLines: 80000,
            complexity: 'very high'
          }
        },
        businessRequirements: [
          {
            id: 'ARCH-001',
            description: 'Enable independent team scaling',
            priority: 'should_have',
            successCriteria: ['Clear module boundaries', 'Independent deployability'],
            constraints: ['No full rewrite', 'Maintain uptime']
          }
        ],
        constraints: [
          {
            type: 'technology',
            description: 'Must remain on Next.js framework',
            impact: 'high',
            flexibility: 'fixed'
          },
          {
            type: 'time',
            description: 'Architecture improvements spread over 6 months',
            impact: 'medium',
            flexibility: 'flexible'
          }
        ],
        stakeholders: [
          {
            role: 'CTO',
            concerns: ['Technical debt', 'Team productivity', 'Future flexibility'],
            decisionPower: 'high'
          },
          {
            role: 'Senior Developers',
            concerns: ['Code maintainability', 'Development speed'],
            decisionPower: 'medium'
          }
        ],
        environment: {
          deployment: 'hybrid',
          scale: 'enterprise',
          industry: 'Technology',
          compliance: ['ISO27001']
        }
      },
      reasoned: {
        steps: [
          {
            step: 1,
            description: 'Map current architecture and dependencies',
            reasoning: 'Understanding current state is prerequisite for improvement',
            evidence: ['Package.json', 'Import graphs', 'Module structure'],
            confidence: 1.0
          },
          {
            step: 2,
            description: 'Identify architectural smells and anti-patterns',
            reasoning: 'Anti-patterns are the primary source of technical debt',
            evidence: ['Circular dependencies', 'God objects', 'Anemic models'],
            confidence: 0.90
          },
          {
            step: 3,
            description: 'Design target architecture',
            reasoning: 'Clear vision needed before refactoring',
            evidence: ['Industry best practices', 'Team capabilities'],
            confidence: 0.85,
            alternatives: ['Microservices', 'Modular monolith', 'Serverless']
          }
        ],
        reasoningDepth: 'deep',
        includeAlternatives: true,
        explainTradeoffs: true
      },
      evidenceBased: {
        codeReferences: true,
        lineNumbers: false,
        contextLines: 0,
        includeTests: true,
        performanceMetrics: false,
        securityScans: false
      },
      deliverable: {
        format: 'structured',
        includeExecutiveSummary: true,
        includeTechnicalDetails: true,
        includeImplementationPlan: true,
        includeROIAnalysis: true,
        customSchema: {
          current_architecture: {
            patterns: [],
            anti_patterns: [],
            technical_debt: []
          },
          target_architecture: {
            vision: '',
            principles: [],
            patterns: []
          },
          migration_plan: {
            phases: [],
            risks: [],
            milestones: []
          }
        }
      }
    }
  }
}

/**
 * Prompt Execution Engine
 */
export class PromptExecutionEngine {
  private promptBuilder: TripleLayerPromptBuilder

  constructor() {
    this.promptBuilder = new TripleLayerPromptBuilder()
  }

  /**
   * Execute a SACRED audit
   */
  async executeSACREDAudit(
    auditType: 'security' | 'performance' | 'architecture',
    customContext?: Partial<CompleteContext>
  ): Promise<AuditExecutionResult> {
    // Get the appropriate SACRED template
    let sacredPrompt: SACREDPrompt
    switch (auditType) {
      case 'security':
        sacredPrompt = SACREDPromptTemplates.securityAudit()
        break
      case 'performance':
        sacredPrompt = SACREDPromptTemplates.performanceOptimization()
        break
      case 'architecture':
        sacredPrompt = SACREDPromptTemplates.architectureReview()
        break
    }

    // Build the triple-layer prompt
    const prompt = this.buildPromptFromSACRED(sacredPrompt, customContext)

    // Execute the audit (this would call the AI model)
    const startTime = Date.now()
    const result = await this.executePrompt(prompt)
    const executionTime = Date.now() - startTime

    return {
      auditType,
      prompt,
      result,
      executionTime,
      metadata: {
        timestamp: new Date().toISOString(),
        sacredCriteria: sacredPrompt.specific.measurableCriteria,
        confidenceScore: this.calculateConfidence(result)
      }
    }
  }

  /**
   * Build triple-layer prompt from SACRED specification
   */
  private buildPromptFromSACRED(
    sacred: SACREDPrompt,
    customContext?: Partial<CompleteContext>
  ): string {
    // Merge custom context with SACRED context
    const context = {
      ...sacred.contextual,
      ...customContext
    }

    // Build task from SACRED components
    const task: AuditTask = {
      objective: sacred.specific.outcomes.join('; '),
      methodology: {
        approach: 'Chain-of-thought reasoning with evidence-based analysis',
        steps: sacred.reasoned.steps.map(step => ({
          action: step.description,
          reasoning: step.reasoning,
          expectedOutput: `Evidence from ${step.evidence.join(', ')}`
        }))
      },
      outputFormat: {
        structure: sacred.deliverable.format as 'xml' | 'json' | 'markdown',
        includeMetrics: true,
        includeRecommendations: true
      },
      analysisDepth: sacred.reasoned.reasoningDepth === 'deep' ? 'deep' : 'standard',
      focusAreas: sacred.specific.scope,
      timeBudget: '2 hours'
    }

    return this.promptBuilder
      .setSystemRole(
        'SaaS Architecture and Security Auditor',
        '20+',
        ['Security', 'Performance', 'Architecture', 'Cloud Systems']
      )
      .setContext(context)
      .setTask(task)
      .build()
  }

  /**
   * Execute the prompt (placeholder for AI integration)
   */
  private async executePrompt(prompt: string): Promise<any> {
    // This would integrate with the AI model
    // For now, return a mock result
    return {
      findings: [],
      summary: 'Audit completed successfully',
      recommendations: []
    }
  }

  /**
   * Calculate confidence score for results
   */
  private calculateConfidence(result: any): number {
    // Implement confidence calculation based on:
    // - Evidence quality
    // - Finding consistency
    // - Coverage completeness
    return 0.85
  }
}

export interface AuditExecutionResult {
  auditType: string
  prompt: string
  result: any
  executionTime: number
  metadata: {
    timestamp: string
    sacredCriteria: MeasurableCriterion[]
    confidenceScore: number
  }
}

/**
 * Prompt Validator
 */
export class PromptValidator {
  /**
   * Validate a SACRED prompt for completeness
   */
  static validateSACREDPrompt(prompt: SACREDPrompt): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Validate Specific criteria
    if (!prompt.specific.outcomes || prompt.specific.outcomes.length === 0) {
      errors.push('Missing specific outcomes')
    }
    if (!prompt.specific.measurableCriteria || prompt.specific.measurableCriteria.length === 0) {
      errors.push('Missing measurable criteria')
    }

    // Validate Actionable steps
    if (!prompt.actionable.requireImplementationSteps) {
      warnings.push('Implementation steps not required - findings may not be actionable')
    }

    // Validate Context
    if (!prompt.contextual.codebaseContext) {
      errors.push('Missing codebase context')
    }
    if (!prompt.contextual.businessRequirements || prompt.contextual.businessRequirements.length === 0) {
      warnings.push('No business requirements specified')
    }

    // Validate Reasoning
    if (!prompt.reasoned.steps || prompt.reasoned.steps.length === 0) {
      errors.push('Missing chain-of-thought steps')
    }

    // Validate Evidence
    if (!prompt.evidenceBased.codeReferences) {
      warnings.push('Code references not required - findings may lack evidence')
    }

    // Validate Deliverable
    if (!prompt.deliverable.format) {
      errors.push('Missing output format specification')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      completenessScore: this.calculateCompleteness(prompt)
    }
  }

  /**
   * Calculate prompt completeness score
   */
  private static calculateCompleteness(prompt: SACREDPrompt): number {
    let score = 0
    const weights = {
      specific: 0.20,
      actionable: 0.20,
      contextual: 0.20,
      reasoned: 0.20,
      evidenceBased: 0.10,
      deliverable: 0.10
    }

    // Score each component
    if (prompt.specific.outcomes.length > 0) score += weights.specific * 0.5
    if (prompt.specific.measurableCriteria.length > 0) score += weights.specific * 0.5

    if (prompt.actionable.requireImplementationSteps) score += weights.actionable * 0.5
    if (prompt.actionable.includeCodeExamples) score += weights.actionable * 0.5

    if (prompt.contextual.codebaseContext) score += weights.contextual * 0.25
    if (prompt.contextual.businessRequirements.length > 0) score += weights.contextual * 0.25
    if (prompt.contextual.constraints.length > 0) score += weights.contextual * 0.25
    if (prompt.contextual.stakeholders.length > 0) score += weights.contextual * 0.25

    if (prompt.reasoned.steps.length > 0) score += weights.reasoned * 0.5
    if (prompt.reasoned.reasoningDepth === 'deep') score += weights.reasoned * 0.5

    if (prompt.evidenceBased.codeReferences) score += weights.evidenceBased * 0.5
    if (prompt.evidenceBased.lineNumbers) score += weights.evidenceBased * 0.5

    if (prompt.deliverable.format) score += weights.deliverable * 0.5
    if (prompt.deliverable.includeROIAnalysis) score += weights.deliverable * 0.5

    return Math.round(score * 100)
  }
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  completenessScore: number
}

// Export singleton instances
export const promptExecutionEngine = new PromptExecutionEngine()
export const promptValidator = PromptValidator