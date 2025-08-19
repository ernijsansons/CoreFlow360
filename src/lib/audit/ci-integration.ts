/**
 * CoreFlow360 - CI/CD Audit Integration
 * Automated audit execution for continuous integration pipelines
 */

import { sacredAuditEngine, SACREDAuditRequest } from './sacred-audit-engine'
import { AuditOrchestrationSystem } from './audit-orchestration'
import { logger } from '@/lib/logging/logger'
import { execSync } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

export interface CIAuditConfig {
  enabled: boolean
  failOnCritical: boolean
  failOnHighSeverity: boolean
  maxAllowedFindings: {
    critical: number
    high: number
    medium: number
    low: number
  }
  scopes: {
    security: string[]
    performance: string[]
    architecture: string[]
    business_logic: string[]
  }
  baselinePath?: string
  reportPath: string
  githubToken?: string
  slackWebhook?: string
}

export interface CIAuditResult {
  passed: boolean
  totalFindings: number
  criticalFindings: number
  highFindings: number
  newFindings: number
  fixedFindings: number
  reportUrl?: string
  prComment?: string
}

/**
 * CI/CD Audit Integration
 */
export class CIAuditIntegration {
  private config: CIAuditConfig
  private orchestrator: AuditOrchestrationSystem
  private baseline: Map<string, unknown> = new Map()

  constructor(config: CIAuditConfig) {
    this.config = config
    this.orchestrator = new AuditOrchestrationSystem()
    this.loadBaseline()
  }

  /**
   * Run automated audit in CI pipeline
   */
  async runCIAudit(): Promise<CIAuditResult> {
    logger.info('Starting CI/CD audit', {
      scopes: this.config.scopes,
      component: 'ci_audit_integration',
    })

    const startTime = Date.now()
    const findings = new Map<string, unknown>()
    let totalFindings = 0
    let criticalCount = 0
    let highCount = 0

    try {
      // Run audits for each configured scope
      for (const [auditType, scopes] of Object.entries(this.config.scopes)) {
        if (scopes.length === 0) continue

        const request: SACREDAuditRequest = {
          auditType: auditType as unknown,
          scope: scopes,
          context: this.buildCIContext(),
          options: {
            includeRecommendations: true,
            generateReport: true,
            outputFormat: 'json',
          },
        }

        const result = await sacredAuditEngine.executeAudit(request)
        findings.set(auditType, result)

        // Count findings by severity
        result.findings.forEach((finding) => {
          totalFindings++
          if (finding.severity === 'critical') criticalCount++
          if (finding.severity === 'high') highCount++
        })
      }

      // Compare with baseline
      const comparison = this.compareWithBaseline(findings)

      // Determine pass/fail status
      const passed = this.evaluateResults(criticalCount, highCount, totalFindings)

      // Generate reports
      const reportUrl = await this.generateCIReport(findings, comparison)

      // Create PR comment if in PR context
      const prComment = this.isInPRContext()
        ? this.generatePRComment(findings, comparison, passed)
        : undefined

      // Post to Slack if configured
      if (this.config.slackWebhook) {
        await this.postToSlack(findings, passed)
      }

      // Update baseline if on main branch
      if (this.isMainBranch()) {
        this.updateBaseline(findings)
      }

      const result: CIAuditResult = {
        passed,
        totalFindings,
        criticalFindings: criticalCount,
        highFindings: highCount,
        newFindings: comparison.newFindings.length,
        fixedFindings: comparison.fixedFindings.length,
        reportUrl,
        prComment,
      }

      logger.info('CI/CD audit completed', {
        ...result,
        executionTime: Date.now() - startTime,
        component: 'ci_audit_integration',
      })

      return result
    } catch (error) {
      logger.error('CI/CD audit failed', error as Error, {
        component: 'ci_audit_integration',
      })
      throw error
    }
  }

  /**
   * Build context for CI environment
   */
  private buildCIContext() {
    const gitInfo = this.getGitInfo()
    const prInfo = this.getPRInfo()

    return {
      codebaseContext: {
        languages: this.detectLanguages(),
        frameworks: this.detectFrameworks(),
        architecture: 'CI/CD automated analysis',
        dependencies: this.getTopDependencies(),
        codeMetrics: this.getCodeMetrics(),
      },
      environment: {
        deployment: 'cloud',
        scale: 'enterprise',
        industry: 'SaaS',
        compliance: ['SOC2', 'GDPR'],
      },
      metadata: {
        branch: gitInfo.branch,
        commit: gitInfo.commit,
        author: gitInfo.author,
        prNumber: prInfo?.number,
        prTitle: prInfo?.title,
      },
    }
  }

  /**
   * Load baseline findings
   */
  private loadBaseline() {
    if (!this.config.baselinePath) return

    try {
      const baselineData = readFileSync(this.config.baselinePath, 'utf-8')
      const baseline = JSON.parse(baselineData)

      Object.entries(baseline).forEach(([key, value]) => {
        this.baseline.set(key, value)
      })
    } catch (error) {
      logger.warn('Failed to load baseline', {
        error: error as Error,
        path: this.config.baselinePath,
      })
    }
  }

  /**
   * Compare current findings with baseline
   */
  private compareWithBaseline(currentFindings: Map<string, unknown>) {
    const newFindings: unknown[] = []
    const fixedFindings: unknown[] = []
    const unchangedFindings: unknown[] = []

    // Create maps for efficient lookup
    const baselineFindingsMap = new Map<string, unknown>()
    const currentFindingsMap = new Map<string, unknown>()

    // Populate baseline map
    this.baseline.forEach((audit, type) => {
      audit.findings?.forEach((finding: unknown) => {
        const key = `${type}:${finding.location}:${finding.title}`
        baselineFindingsMap.set(key, finding)
      })
    })

    // Populate current map and identify new findings
    currentFindings.forEach((audit, type) => {
      audit.findings.forEach((finding: unknown) => {
        const key = `${type}:${finding.location}:${finding.title}`
        currentFindingsMap.set(key, finding)

        if (!baselineFindingsMap.has(key)) {
          newFindings.push({ ...finding, auditType: type })
        } else {
          unchangedFindings.push({ ...finding, auditType: type })
        }
      })
    })

    // Identify fixed findings
    baselineFindingsMap.forEach((finding, key) => {
      if (!currentFindingsMap.has(key)) {
        fixedFindings.push(finding)
      }
    })

    return {
      newFindings,
      fixedFindings,
      unchangedFindings,
      summary: {
        new: newFindings.length,
        fixed: fixedFindings.length,
        unchanged: unchangedFindings.length,
      },
    }
  }

  /**
   * Evaluate if audit passes CI requirements
   */
  private evaluateResults(_critical: number, _high: number, _total: number): boolean {
    if (this.config.failOnCritical && critical > 0) {
      return false
    }

    if (this.config.failOnHighSeverity && high > 0) {
      return false
    }

    if (critical > this.config.maxAllowedFindings.critical) {
      return false
    }

    if (high > this.config.maxAllowedFindings.high) {
      return false
    }

    return true
  }

  /**
   * Generate CI report
   */
  private async generateCIReport(
    findings: Map<string, unknown>,
    comparison: unknown
  ): Promise<string> {
    const report = {
      timestamp: new Date().toISOString(),
      ci: {
        ...this.getGitInfo(),
        ...this.getPRInfo(),
      },
      summary: {
        totalFindings: Array.from(findings.values()).reduce(
          (sum, audit) => sum + audit.findings.length,
          0
        ),
        bySeverity: this.countBySeverity(findings),
        byCategory: this.countByCategory(findings),
      },
      comparison,
      findings: Object.fromEntries(findings),
      config: {
        scopes: this.config.scopes,
        thresholds: this.config.maxAllowedFindings,
      },
    }

    const reportPath = join(this.config.reportPath, `audit-${Date.now()}.json`)
    writeFileSync(reportPath, JSON.stringify(report, null, 2))

    // Upload to artifact storage if available
    if (process.env.CI) {
      // GitHub Actions
      if (process.env.GITHUB_ACTIONS) {
      }
      // Add other CI providers as needed
    }

    return reportPath
  }

  /**
   * Generate PR comment
   */
  private generatePRComment(
    findings: Map<string, unknown>,
    comparison: unknown,
    passed: boolean
  ): string {
    const emoji = passed ? '✅' : '❌'
    const status = passed ? 'PASSED' : 'FAILED'
    const totalFindings = Array.from(findings.values()).reduce(
      (sum, audit) => sum + audit.findings.length,
      0
    )

    let comment = `## ${emoji} CoreFlow360 Audit: ${status}\n\n`

    // Summary table
    comment += `### Summary\n\n`
    comment += `| Metric | Count |\n`
    comment += `|--------|-------|\n`
    comment += `| Total Findings | ${totalFindings} |\n`
    comment += `| New Issues | 🆕 ${comparison.newFindings.length} |\n`
    comment += `| Fixed Issues | ✅ ${comparison.fixedFindings.length} |\n`
    comment += `| Critical | 🔴 ${this.countBySeverity(findings).critical} |\n`
    comment += `| High | 🟠 ${this.countBySeverity(findings).high} |\n`
    comment += `| Medium | 🟡 ${this.countBySeverity(findings).medium} |\n`
    comment += `| Low | 🟢 ${this.countBySeverity(findings).low} |\n\n`

    // New critical/high findings
    const criticalNew = comparison.newFindings.filter((f: unknown) => f.severity === 'critical')
    const highNew = comparison.newFindings.filter((f: unknown) => f.severity === 'high')

    if (criticalNew.length > 0) {
      comment += `### 🚨 New Critical Issues\n\n`
      criticalNew.forEach((finding: unknown) => {
        comment += `- **${finding.title}**\n`
        comment += `  - 📍 Location: \`${finding.location}\`\n`
        comment += `  - 💥 Impact: ${finding.impact}\n`
        comment += `  - 🔧 Fix: ${finding.recommendations?.[0] || 'See detailed report'}\n\n`
      })
    }

    if (highNew.length > 0) {
      comment += `### ⚠️ New High Priority Issues\n\n`
      highNew.slice(0, 5).forEach((finding: unknown) => {
        comment += `- **${finding.title}** (\`${finding.location}\`)\n`
      })
      if (highNew.length > 5) {
        comment += `\n_...and ${highNew.length - 5} more_\n`
      }
      comment += '\n'
    }

    // Fixed issues
    if (comparison.fixedFindings.length > 0) {
      comment += `### ✅ Fixed Issues\n\n`
      comparison.fixedFindings.slice(0, 5).forEach((finding: unknown) => {
        comment += `- ~${finding.title}~\n`
      })
      if (comparison.fixedFindings.length > 5) {
        comment += `\n_...and ${comparison.fixedFindings.length - 5} more_\n`
      }
      comment += '\n'
    }

    // Actions required
    if (!passed) {
      comment += `### 🔧 Actions Required\n\n`
      comment += `This PR cannot be merged until the following issues are resolved:\n\n`

      if (criticalNew.length > 0) {
        comment += `- Fix all ${criticalNew.length} critical security issues\n`
      }
      if (this.config.failOnHighSeverity && highNew.length > 0) {
        comment += `- Fix all ${highNew.length} high priority issues\n`
      }
      comment += `\nRun \`npm run audit:fix\` locally to see detailed remediation steps.\n`
    }

    comment += `\n---\n`
    comment += `*Generated by [CoreFlow360 SACRED Audit](https://coreflow360.com/docs/audit)*`

    return comment
  }

  /**
   * Post results to Slack
   */
  private async postToSlack(findings: Map<string, unknown>, passed: boolean) {
    if (!this.config.slackWebhook) return

    const totalFindings = Array.from(findings.values()).reduce(
      (sum, audit) => sum + audit.findings.length,
      0
    )
    const severity = this.countBySeverity(findings)

    const payload = {
      text: `Audit ${passed ? 'Passed' : 'Failed'}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${passed ? '✅' : '❌'} CoreFlow360 Audit ${passed ? 'Passed' : 'Failed'}`,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Total Findings:* ${totalFindings}`,
            },
            {
              type: 'mrkdwn',
              text: `*Critical:* ${severity.critical}`,
            },
            {
              type: 'mrkdwn',
              text: `*Branch:* ${this.getGitInfo().branch}`,
            },
            {
              type: 'mrkdwn',
              text: `*Commit:* ${this.getGitInfo().commit.substring(0, 7)}`,
            },
          ],
        },
      ],
    }

    try {
      await fetch(this.config.slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch (error) {
      logger.error('Failed to post to Slack', error as Error)
    }
  }

  /**
   * Update baseline with current findings
   */
  private updateBaseline(findings: Map<string, unknown>) {
    if (!this.config.baselinePath) return

    const baseline = Object.fromEntries(findings)
    writeFileSync(this.config.baselinePath, JSON.stringify(baseline, null, 2))

    logger.info('Updated audit baseline', {
      path: this.config.baselinePath,
      findingsCount: Array.from(findings.values()).reduce(
        (sum, audit) => sum + audit.findings.length,
        0
      ),
    })
  }

  /**
   * Helper methods
   */

  private getGitInfo() {
    try {
      return {
        branch: execSync('git rev-parse --abbrev-ref HEAD').toString().trim(),
        commit: execSync('git rev-parse HEAD').toString().trim(),
        author: execSync('git log -1 --pretty=format:"%an"').toString().trim(),
        message: execSync('git log -1 --pretty=format:"%s"').toString().trim(),
      }
    } catch {
      return {
        branch: 'unknown',
        commit: 'unknown',
        author: 'unknown',
        message: 'unknown',
      }
    }
  }

  private getPRInfo() {
    // GitHub Actions
    if (process.env.GITHUB_EVENT_NAME === 'pull_request') {
      return {
        number: process.env.GITHUB_PR_NUMBER,
        title: process.env.GITHUB_PR_TITLE,
        author: process.env.GITHUB_ACTOR,
      }
    }
    return null
  }

  private isInPRContext(): boolean {
    return (
      process.env.GITHUB_EVENT_NAME === 'pull_request' ||
      process.env.CI_MERGE_REQUEST_ID !== undefined || // GitLab
      process.env.CHANGE_ID !== undefined
    ) // Jenkins
  }

  private isMainBranch(): boolean {
    const branch = this.getGitInfo().branch
    return branch === 'main' || branch === 'master' || branch === 'develop'
  }

  private detectLanguages(): string[] {
    // Simple detection based on file extensions
    try {
      const files = execSync(
        'find . -type f -name "*.ts" -o -name "*.js" -o -name "*.tsx" | head -20'
      )
        .toString()
        .trim()
        .split('\n')

      const languages = new Set<string>()
      files.forEach((file) => {
        if (file.endsWith('.ts') || file.endsWith('.tsx')) languages.add('TypeScript')
        if (file.endsWith('.js') || file.endsWith('.jsx')) languages.add('JavaScript')
      })

      return Array.from(languages)
    } catch {
      return ['TypeScript', 'JavaScript']
    }
  }

  private detectFrameworks(): string[] {
    try {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'))
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }

      const frameworks: string[] = []
      if (deps.next) frameworks.push('Next.js')
      if (deps.react) frameworks.push('React')
      if (deps.express) frameworks.push('Express')
      if (deps.prisma || deps['@prisma/client']) frameworks.push('Prisma')

      return frameworks
    } catch {
      return ['Next.js', 'React']
    }
  }

  private getTopDependencies(): string[] {
    try {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'))
      return Object.keys(packageJson.dependencies || {}).slice(0, 10)
    } catch {
      return []
    }
  }

  private getCodeMetrics() {
    try {
      const fileCount = parseInt(
        execSync(
          'find . -type f \\( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \\) | wc -l'
        )
          .toString()
          .trim()
      )

      const lineCount =
        parseInt(
          execSync(
            'find . -type f \\( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \\) -exec wc -l {} + | tail -1 | awk \'{print $1}\''
          )
            .toString()
            .trim()
        ) || 0

      return {
        totalFiles: fileCount,
        totalLines: lineCount,
        complexity: lineCount > 50000 ? 'high' : lineCount > 10000 ? 'medium' : 'low',
      }
    } catch {
      return {
        totalFiles: 0,
        totalLines: 0,
        complexity: 'unknown',
      }
    }
  }

  private countBySeverity(findings: Map<string, unknown>) {
    const counts = { critical: 0, high: 0, medium: 0, low: 0 }

    findings.forEach((audit) => {
      audit.findings.forEach((finding: unknown) => {
        counts[finding.severity as keyof typeof counts]++
      })
    })

    return counts
  }

  private countByCategory(findings: Map<string, unknown>) {
    const counts: Record<string, number> = {}

    findings.forEach((audit) => {
      audit.findings.forEach((finding: unknown) => {
        counts[finding.category] = (counts[finding.category] || 0) + 1
      })
    })

    return counts
  }
}

// Export factory function
export function createCIAudit(config?: Partial<CIAuditConfig>): CIAuditIntegration {
  const defaultConfig: CIAuditConfig = {
    enabled: true,
    failOnCritical: true,
    failOnHighSeverity: false,
    maxAllowedFindings: {
      critical: 0,
      high: 5,
      medium: 20,
      low: 50,
    },
    scopes: {
      security: ['authentication', 'authorization', 'input_validation'],
      performance: ['database_queries', 'api_optimization'],
      architecture: ['patterns', 'dependencies'],
      business_logic: [],
    },
    reportPath: './audit-reports',
    ...config,
  }

  return new CIAuditIntegration(defaultConfig)
}
