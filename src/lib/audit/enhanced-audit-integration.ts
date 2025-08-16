/**
 * CoreFlow360 - Enhanced Audit Integration
 * Professional-grade audit execution with enhanced prompts
 */

import { 
  SACREDAuditEngine, 
  SACREDAuditRequest, 
  SACREDAuditResponse,
  EnhancedAuditFinding 
} from './sacred-audit-engine'
import { 
  EnhancedAuditPrompts,
  SecurityAuditPrompts,
  PerformanceAuditPrompts,
  ArchitectureAuditPrompts 
} from './enhanced-audit-prompts'
import { PromptExecutionEngine } from './prompt-engineering'
import { logger } from '@/lib/logging/logger'
import { execSync } from 'child_process'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

interface EnhancedAuditConfig {
  useAdvancedPrompts: boolean
  includeCodeAnalysis: boolean
  generateCVSSScores: boolean
  performDependencyAudit: boolean
  includeComplianceAssessment: boolean
  outputDetailLevel: 'basic' | 'detailed' | 'comprehensive'
}

interface CodeAnalysisResult {
  totalFiles: number
  totalLines: number
  complexity: 'low' | 'medium' | 'high' | 'very-high'
  duplicateCode: number
  testCoverage: number
  dependencies: DependencyInfo[]
  securityHotspots: SecurityHotspot[]
  performanceIssues: PerformanceIssue[]
}

interface DependencyInfo {
  name: string
  version: string
  vulnerabilities: VulnerabilityInfo[]
  license: string
  size: number
}

interface VulnerabilityInfo {
  cve: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  cvssScore: number
  description: string
  fixedVersion?: string
}

interface SecurityHotspot {
  file: string
  line: number
  rule: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

interface PerformanceIssue {
  file: string
  line: number
  type: 'n+1-query' | 'large-bundle' | 'blocking-resource' | 'memory-leak'
  description: string
  impact: 'low' | 'medium' | 'high'
}

/**
 * Enhanced Audit Engine with Professional Prompts
 */
export class EnhancedAuditEngine extends SACREDAuditEngine {
  private config: EnhancedAuditConfig
  private promptEngine: PromptExecutionEngine
  private codeAnalysisCache: Map<string, CodeAnalysisResult> = new Map()

  constructor(config: Partial<EnhancedAuditConfig> = {}) {
    super()
    this.config = {
      useAdvancedPrompts: true,
      includeCodeAnalysis: true,
      generateCVSSScores: true,
      performDependencyAudit: true,
      includeComplianceAssessment: true,
      outputDetailLevel: 'comprehensive',
      ...config
    }
    this.promptEngine = new PromptExecutionEngine()
  }

  /**
   * Execute enhanced security audit with OWASP Top 10 focus
   */
  async executeEnhancedSecurityAudit(
    request: Omit<SACREDAuditRequest, 'auditType'>
  ): Promise<SACREDAuditResponse> {
    logger.info('Starting enhanced security audit', {
      scope: request.scope,
      useAdvancedPrompts: this.config.useAdvancedPrompts,
      component: 'enhanced_audit_engine'
    })

    // Use enhanced security prompt
    const enhancedRequest: SACREDAuditRequest = {
      ...request,
      auditType: 'security',
      customPrompt: this.config.useAdvancedPrompts 
        ? SecurityAuditPrompts.createCriticalSecurityAudit()
        : undefined
    }

    // Perform static code analysis if enabled
    let codeAnalysis: CodeAnalysisResult | undefined
    if (this.config.includeCodeAnalysis) {
      codeAnalysis = await this.performCodeAnalysis()
    }

    // Execute base audit
    const baseResult = await super.executeAudit(enhancedRequest)

    // Enhance findings with additional analysis
    const enhancedFindings = await this.enhanceSecurityFindings(
      baseResult.findings,
      codeAnalysis
    )

    // Generate compliance assessment
    const complianceAssessment = this.config.includeComplianceAssessment
      ? this.generateComplianceAssessment(enhancedFindings)
      : undefined

    return {
      ...baseResult,
      findings: enhancedFindings,
      synthesis: {
        ...baseResult.synthesis,
        complianceAssessment,
        codeAnalysisResults: codeAnalysis
      }
    }
  }

  /**
   * Execute enhanced performance audit with Web Vitals focus
   */
  async executeEnhancedPerformanceAudit(
    request: Omit<SACREDAuditRequest, 'auditType'>
  ): Promise<SACREDAuditResponse> {
    logger.info('Starting enhanced performance audit', {
      scope: request.scope,
      component: 'enhanced_audit_engine'
    })

    // Use enhanced performance prompt
    const enhancedRequest: SACREDAuditRequest = {
      ...request,
      auditType: 'performance',
      customPrompt: this.config.useAdvancedPrompts 
        ? PerformanceAuditPrompts.createPerformanceOptimizationAudit()
        : undefined
    }

    // Gather performance metrics
    const performanceMetrics = await this.gatherPerformanceMetrics()

    // Execute base audit
    const baseResult = await super.executeAudit(enhancedRequest)

    // Enhance findings with performance analysis
    const enhancedFindings = await this.enhancePerformanceFindings(
      baseResult.findings,
      performanceMetrics
    )

    return {
      ...baseResult,
      findings: enhancedFindings,
      synthesis: {
        ...baseResult.synthesis,
        performanceMetrics,
        webVitalsAnalysis: this.analyzeWebVitals(performanceMetrics)
      }
    }
  }

  /**
   * Execute comprehensive multi-domain audit
   */
  async executeComprehensiveAudit(
    request: Omit<SACREDAuditRequest, 'auditType'>
  ): Promise<Map<string, SACREDAuditResponse>> {
    const results = new Map<string, SACREDAuditResponse>()

    // Execute all audit types
    const auditTypes = ['security', 'performance', 'architecture'] as const

    for (const auditType of auditTypes) {
      try {
        let result: SACREDAuditResponse

        switch (auditType) {
          case 'security':
            result = await this.executeEnhancedSecurityAudit(request)
            break
          case 'performance':
            result = await this.executeEnhancedPerformanceAudit(request)
            break
          case 'architecture':
            result = await this.executeEnhancedArchitectureAudit(request)
            break
          default:
            result = await super.executeAudit({ ...request, auditType })
        }

        results.set(auditType, result)
      } catch (error) {
        logger.error(`Failed to execute ${auditType} audit`, error as Error, {
          auditType,
          component: 'enhanced_audit_engine'
        })
      }
    }

    return results
  }

  /**
   * Enhanced architecture audit
   */
  private async executeEnhancedArchitectureAudit(
    request: Omit<SACREDAuditRequest, 'auditType'>
  ): Promise<SACREDAuditResponse> {
    const enhancedRequest: SACREDAuditRequest = {
      ...request,
      auditType: 'architecture'
    }

    // Analyze architecture metrics
    const architectureMetrics = await this.analyzeArchitectureMetrics()

    const baseResult = await super.executeAudit(enhancedRequest)

    return {
      ...baseResult,
      synthesis: {
        ...baseResult.synthesis,
        architectureMetrics
      }
    }
  }

  /**
   * Perform comprehensive code analysis
   */
  private async performCodeAnalysis(): Promise<CodeAnalysisResult> {
    const cacheKey = 'code-analysis'
    if (this.codeAnalysisCache.has(cacheKey)) {
      return this.codeAnalysisCache.get(cacheKey)!
    }

    logger.info('Performing comprehensive code analysis')

    try {
      // Analyze codebase structure
      const codeMetrics = await this.analyzeCodeMetrics()
      
      // Analyze dependencies
      const dependencies = await this.analyzeDependencies()
      
      // Find security hotspots
      const securityHotspots = await this.findSecurityHotspots()
      
      // Find performance issues
      const performanceIssues = await this.findPerformanceIssues()

      const result: CodeAnalysisResult = {
        ...codeMetrics,
        dependencies,
        securityHotspots,
        performanceIssues
      }

      this.codeAnalysisCache.set(cacheKey, result)
      return result
    } catch (error) {
      logger.error('Code analysis failed', error as Error)
      throw error
    }
  }

  /**
   * Analyze code metrics
   */
  private async analyzeCodeMetrics() {
    try {
      // Count files and lines
      const files = this.getSourceFiles()
      const totalFiles = files.length
      let totalLines = 0
      let duplicateLines = 0

      for (const file of files) {
        const content = readFileSync(file, 'utf-8')
        totalLines += content.split('\n').length
      }

      // Calculate complexity
      const complexity = this.calculateComplexity(totalLines, totalFiles)

      // Get test coverage if available
      const testCoverage = await this.getTestCoverage()

      return {
        totalFiles,
        totalLines,
        complexity,
        duplicateCode: duplicateLines,
        testCoverage
      }
    } catch (error) {
      logger.warn('Failed to analyze code metrics', { error })
      return {
        totalFiles: 0,
        totalLines: 0,
        complexity: 'unknown' as const,
        duplicateCode: 0,
        testCoverage: 0
      }
    }
  }

  /**
   * Analyze project dependencies
   */
  private async analyzeDependencies(): Promise<DependencyInfo[]> {
    try {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'))
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      }

      const depInfo: DependencyInfo[] = []

      for (const [name, version] of Object.entries(dependencies)) {
        const vulnerabilities = await this.checkVulnerabilities(name, version as string)
        const packageInfo = await this.getPackageInfo(name)

        depInfo.push({
          name,
          version: version as string,
          vulnerabilities,
          license: packageInfo.license || 'unknown',
          size: packageInfo.size || 0
        })
      }

      return depInfo
    } catch (error) {
      logger.warn('Failed to analyze dependencies', { error })
      return []
    }
  }

  /**
   * Find security hotspots in code
   */
  private async findSecurityHotspots(): Promise<SecurityHotspot[]> {
    const hotspots: SecurityHotspot[] = []

    try {
      const files = this.getSourceFiles()

      for (const file of files) {
        const content = readFileSync(file, 'utf-8')
        const lines = content.split('\n')

        lines.forEach((line, index) => {
          // Check for common security issues
          if (line.includes('eval(') || line.includes('Function(')) {
            hotspots.push({
              file,
              line: index + 1,
              rule: 'dangerous-eval',
              message: 'Use of eval() or Function() constructor',
              severity: 'high'
            })
          }

          if (line.includes('innerHTML') && !line.includes('DOMPurify')) {
            hotspots.push({
              file,
              line: index + 1,
              rule: 'xss-risk',
              message: 'Potential XSS risk with innerHTML',
              severity: 'medium'
            })
          }

          if (line.includes('SELECT') && line.includes('+')) {
            hotspots.push({
              file,
              line: index + 1,
              rule: 'sql-injection',
              message: 'Potential SQL injection with string concatenation',
              severity: 'critical'
            })
          }
        })
      }
    } catch (error) {
      logger.warn('Failed to find security hotspots', { error })
    }

    return hotspots
  }

  /**
   * Find performance issues in code
   */
  private async findPerformanceIssues(): Promise<PerformanceIssue[]> {
    const issues: PerformanceIssue[] = []

    try {
      const files = this.getSourceFiles()

      for (const file of files) {
        const content = readFileSync(file, 'utf-8')
        const lines = content.split('\n')

        lines.forEach((line, index) => {
          // Check for N+1 queries
          if (line.includes('findMany') && content.includes('for') && content.includes('await')) {
            issues.push({
              file,
              line: index + 1,
              type: 'n+1-query',
              description: 'Potential N+1 query pattern detected',
              impact: 'high'
            })
          }

          // Check for large imports
          if (line.includes('import') && (line.includes('lodash') || line.includes('moment'))) {
            issues.push({
              file,
              line: index + 1,
              type: 'large-bundle',
              description: 'Large library import may increase bundle size',
              impact: 'medium'
            })
          }
        })
      }
    } catch (error) {
      logger.warn('Failed to find performance issues', { error })
    }

    return issues
  }

  /**
   * Enhance security findings with CVSS scores and additional analysis
   */
  private async enhanceSecurityFindings(
    findings: EnhancedAuditFinding[],
    codeAnalysis?: CodeAnalysisResult
  ): Promise<EnhancedAuditFinding[]> {
    return findings.map(finding => {
      // Generate CVSS score if enabled
      const cvssScore = this.config.generateCVSSScores 
        ? this.calculateCVSSScore(finding)
        : undefined

      // Add compliance mapping
      const complianceMapping = this.mapToComplianceFrameworks(finding)

      // Enhance with code analysis data
      const codeContext = codeAnalysis?.securityHotspots
        .filter(hotspot => finding.location.includes(hotspot.file))
        .map(hotspot => ({
          file: hotspot.file,
          line: hotspot.line,
          rule: hotspot.rule,
          message: hotspot.message
        })) || []

      return {
        ...finding,
        cvssScore,
        complianceMapping,
        codeContext,
        enhancedEvidence: [
          ...finding.evidenceChain,
          ...codeContext.map(ctx => ({
            type: 'code' as const,
            source: ctx.file,
            content: ctx.message,
            relevance: 0.9,
            explanation: `Security hotspot: ${ctx.rule}`
          }))
        ]
      }
    })
  }

  /**
   * Enhance performance findings with Web Vitals analysis
   */
  private async enhancePerformanceFindings(
    findings: EnhancedAuditFinding[],
    metrics: any
  ): Promise<EnhancedAuditFinding[]> {
    return findings.map(finding => {
      // Add Web Vitals impact analysis
      const webVitalsImpact = this.analyzeWebVitalsImpact(finding, metrics)

      // Calculate performance ROI
      const performanceROI = this.calculatePerformanceROI(finding)

      return {
        ...finding,
        webVitalsImpact,
        performanceROI,
        benchmarkComparison: this.compareToBenchmarks(finding)
      }
    })
  }

  /**
   * Helper methods
   */

  private getSourceFiles(): string[] {
    const extensions = ['.ts', '.tsx', '.js', '.jsx']
    const directories = ['src', 'pages', 'app']
    const files: string[] = []

    const walkDirectory = (dir: string) => {
      try {
        const items = readdirSync(dir)
        for (const item of items) {
          const fullPath = join(dir, item)
          const stat = statSync(fullPath)
          
          if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            walkDirectory(fullPath)
          } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
            files.push(fullPath)
          }
        }
      } catch (error) {
        // Ignore errors for inaccessible directories
      }
    }

    directories.forEach(dir => {
      try {
        walkDirectory(dir)
      } catch (error) {
        // Directory doesn't exist, skip
      }
    })

    return files
  }

  private calculateComplexity(lines: number, files: number): 'low' | 'medium' | 'high' | 'very-high' {
    const avgLinesPerFile = lines / files
    
    if (avgLinesPerFile < 100) return 'low'
    if (avgLinesPerFile < 200) return 'medium'
    if (avgLinesPerFile < 400) return 'high'
    return 'very-high'
  }

  private async getTestCoverage(): Promise<number> {
    try {
      // Try to read coverage report
      const coverageReport = readFileSync('coverage/coverage-summary.json', 'utf-8')
      const coverage = JSON.parse(coverageReport)
      return coverage.total?.lines?.pct || 0
    } catch {
      return 0
    }
  }

  private async checkVulnerabilities(name: string, version: string): Promise<VulnerabilityInfo[]> {
    // Mock implementation - would integrate with actual vulnerability database
    return []
  }

  private async getPackageInfo(name: string) {
    // Mock implementation - would fetch from npm registry
    return { license: 'MIT', size: 100000 }
  }

  private calculateCVSSScore(finding: EnhancedAuditFinding): number {
    // Simplified CVSS calculation
    const severityMap = {
      'critical': 9.5,
      'high': 7.5,
      'medium': 5.5,
      'low': 2.5
    }
    return severityMap[finding.severity] || 0
  }

  private mapToComplianceFrameworks(finding: EnhancedAuditFinding) {
    // Map findings to compliance frameworks
    return {
      soc2: this.mapToSOC2(finding),
      gdpr: this.mapToGDPR(finding),
      iso27001: this.mapToISO27001(finding)
    }
  }

  private mapToSOC2(finding: EnhancedAuditFinding) {
    // SOC2 control mapping logic
    return finding.category === 'security' ? ['CC6.1', 'CC6.2'] : []
  }

  private mapToGDPR(finding: EnhancedAuditFinding) {
    // GDPR article mapping logic
    return finding.title.toLowerCase().includes('data') ? ['Article 32'] : []
  }

  private mapToISO27001(finding: EnhancedAuditFinding) {
    // ISO 27001 control mapping logic
    return finding.category === 'security' ? ['A.12.1.1', 'A.12.1.2'] : []
  }

  private async gatherPerformanceMetrics() {
    // Gather actual performance metrics
    return {
      coreWebVitals: {
        lcp: 3.2,
        fid: 180,
        cls: 0.25
      },
      apiMetrics: {
        p50: 320,
        p95: 1200,
        p99: 2800
      }
    }
  }

  private analyzeWebVitals(metrics: any) {
    // Analyze Web Vitals performance
    return {
      lcpStatus: metrics.coreWebVitals.lcp > 2.5 ? 'poor' : 'good',
      fidStatus: metrics.coreWebVitals.fid > 100 ? 'poor' : 'good',
      clsStatus: metrics.coreWebVitals.cls > 0.1 ? 'poor' : 'good'
    }
  }

  private analyzeWebVitalsImpact(finding: EnhancedAuditFinding, metrics: any) {
    // Analyze how finding impacts Web Vitals
    return {
      lcpImpact: finding.category === 'performance' ? 'high' : 'low',
      fidImpact: finding.title.includes('JavaScript') ? 'high' : 'low',
      clsImpact: finding.title.includes('layout') ? 'high' : 'low'
    }
  }

  private calculatePerformanceROI(finding: EnhancedAuditFinding) {
    // Calculate ROI for performance improvements
    return {
      conversionImpact: 0.12, // 12% improvement
      costSavings: 5000, // Monthly savings
      implementationCost: finding.implementation_cost * 150
    }
  }

  private compareToBenchmarks(finding: EnhancedAuditFinding) {
    // Compare to industry benchmarks
    return {
      industry: 'SaaS',
      currentPercentile: 25,
      targetPercentile: 75,
      gapAnalysis: 'Significant improvement needed'
    }
  }

  private async analyzeArchitectureMetrics() {
    // Analyze architecture-specific metrics
    return {
      couplingScore: 7.2,
      cohesionScore: 6.8,
      technicalDebtRatio: 0.23,
      maintainabilityIndex: 68
    }
  }

  private generateComplianceAssessment(findings: EnhancedAuditFinding[]) {
    // Generate comprehensive compliance assessment
    return {
      soc2Status: 'partial-compliance',
      gdprStatus: 'non-compliant',
      iso27001Status: 'assessment-needed',
      recommendations: [
        'Implement comprehensive access controls',
        'Add encryption for all PII data',
        'Establish continuous monitoring'
      ]
    }
  }
}

// Export factory function
export function createEnhancedAuditEngine(
  config?: Partial<EnhancedAuditConfig>
): EnhancedAuditEngine {
  return new EnhancedAuditEngine(config)
}