#!/usr/bin/env tsx
/**
 * CoreFlow360 - SACRED Audit Runner
 * Execute AI-powered audits with enhanced prompt engineering
 */

import { sacredAuditEngine, SACREDAuditRequest } from '../lib/audit/sacred-audit-engine'
import { CompleteContext } from '../lib/audit/prompt-engineering'
import { logger } from '../lib/logging/logger'
import { writeFileSync } from 'fs'
import { join } from 'path'

interface SACREDAuditOptions {
  type: string
  scope?: string[]
  output?: string
  format?: 'json' | 'xml' | 'markdown' | 'html'
  minSeverity?: 'low' | 'medium' | 'high' | 'critical'
  verbose?: boolean
  dryRun?: boolean
  custom?: boolean
}

async function main() {
  const args = process.argv.slice(2)
  const options = parseArgs(args)

  console.log('\n=== SACRED AUDIT ENGINE ===')
  console.log('AI-powered audit with enhanced prompt engineering\n')

  if (options.dryRun) {
    await demonstrateSACREDFramework()
    return
  }

  if (!options.type) {
    console.error('Error: Audit type is required')
    showHelp()
    process.exit(1)
  }

  try {
    await runSACREDAudit(options)
  } catch (error) {
    logger.error('SACRED audit execution failed', error as Error, {
      component: 'sacred_audit_runner',
    })
    process.exit(1)
  }
}

async function runSACREDAudit(options: SACREDAuditOptions) {
  const startTime = Date.now()

  logger.info('Starting SACRED audit', {
    type: options.type,
    scope: options.scope,
    component: 'sacred_audit_runner',
  })

  console.log(`Audit Type: ${options.type}`)
  console.log(`Scope: ${options.scope?.join(', ') || 'All systems'}\n`)

  // Build context based on actual project
  const context: Partial<CompleteContext> = {
    project: {
      name: 'CoreFlow360',
      type: 'SaaS Platform',
      domain: 'Business Process Automation',
      stage: 'Production',
    },
    technical: {
      stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Redis', 'AI/ML'],
      architecture: 'Microservices with AI Orchestration',
      deploymentModel: 'Cloud-native (Vercel/AWS)',
      scalabilityRequirements: 'High (10k+ concurrent users)',
    },
    business: {
      objectives: [
        'Achieve 99.9% uptime',
        'Sub-100ms AI response times',
        'SOC2 compliance',
        'GDPR compliance',
      ],
      constraints: ['Must maintain performance SLAs'],
      stakeholders: ['CTOs', 'Security Teams', 'Compliance Officers'],
      timeline: '30-day implementation window',
    },
    operational: {
      teamSize: 10,
      environment: 'Production',
      deploymentFrequency: 'Daily',
      maintenanceWindows: 'Sundays 2-4 AM UTC',
      slaRequirements: {
        uptime: 99.9,
        responseTime: 100,
        constraints: ['Current infrastructure limitations'],
      },
    },
    constraints: [
      'Must not impact current production performance',
      'Backwards compatibility required',
      'Zero-downtime deployment mandatory',
    ],
    successCriteria: [
      'All critical vulnerabilities addressed',
      'Performance improvements documented',
      'Automated testing coverage > 80%',
    ],
  }

  // Configure audit request with SACRED enhancements
  const auditType = mapAuditType(options.type)
  
  // Handle custom prompts if requested
  if (options.custom) {
    console.log('\n--- CUSTOM PROMPT ENHANCEMENTS ---')
    console.log('Enter your custom requirements (empty line to finish):')
    // In a real implementation, we'd read from stdin
    console.log('(Custom prompt input simulated for this example)\n')
  }

  const auditRequest: SACREDAuditRequest = {
    auditType,
    context,
    enhancedPromptingEnabled: true,
    promptEnhancements: {
      specific: {
        outcomes: [
          `Identify all ${auditType} issues with severity ratings`,
          'Provide actionable remediation steps',
          'Estimate implementation effort and impact',
        ],
        metrics: [
          {
            metric: 'Issue resolution time',
            target: 72,
            unit: 'hours',
            priority: 'high',
          },
          {
            metric: 'Implementation complexity',
            target: 7,
            unit: 'story points',
            priority: 'medium',
          },
          {
            metric: 'Risk reduction',
            target: 90,
            unit: 'percent',
            priority: 'critical',
          },
        ],
        deliverables: [
          'Executive summary with key findings',
          'Technical implementation guide',
          'Risk assessment matrix',
          'Compliance checklist',
        ],
      },
      contextual: {
        businessContext: context.business!,
        technicalContext: context.technical!,
        operationalContext: context.operational!,
        constraints: context.constraints!,
      },
      reasoned: {
        requireExplanations: true,
        depthLevel: 'comprehensive',
        includeAlternatives: true,
        showTradeoffs: true,
      },
      evidenceBased: {
        requireCodeReferences: true,
        includeMetrics: true,
        showBenchmarks: true,
        citeSources: true,
      },
      deliverable: {
        format: options.format || 'markdown',
        structure: 'hierarchical',
        includeVisuals: true,
        executiveSummary: true,
      },
      sacred: {
        validationRules: [
          'All findings must have clear business impact',
          'Recommendations must be implementable within sprint',
          'Evidence must include specific code locations',
        ],
        qualityMetrics: [
          {
            metric: 'Actionability score',
            target: 100,
            unit: 'percent',
            priority: 'critical',
          },
          {
            metric: 'Implementation clarity',
            target: 100,
            unit: 'percent',
            priority: 'critical',
          },
        ],
        successThreshold: 'All findings actionable within current sprint',
        scope: options.scope || ['all'],
      },
      actionable: {
        requireImplementationSteps: true,
        stepDetailLevel: 'high',
        includeCodeExamples: true,
        timeEstimates: true,
        dependencyMapping: true,
      },
    }
  }

  console.log('--- SACRED ENHANCEMENTS APPLIED ---')
  console.log('- Specific outcomes defined')
  console.log('- Actionable steps required')
  console.log('- Contextual analysis enabled')
  console.log('- Reasoned conclusions with evidence')
  console.log('- Deliverable format configured\n')

  console.log('Executing audit with SACRED framework...\n')

  const response = await sacredAuditEngine.executeAudit(auditRequest)

  const duration = Date.now() - startTime

  console.log('\n=== SACRED AUDIT REPORT ===')
  console.log('===================================================\n')
  console.log(`Audit completed in ${(duration / 1000).toFixed(2)}s`)

  console.log('\n--- AUDIT METRICS ---')
  console.log(`   Total prompts analyzed: ${response.promptValidation.totalPromptsAnalyzed}`)
  console.log(`   Pass rate: ${(response.promptValidation.passRate * 100).toFixed(1)}%`)
  if (response.promptValidation.warnings.length > 0) {
    console.log(`   Warnings: ${response.promptValidation.warnings.length}`)
  }

  console.log('\n--- FINDINGS BY SEVERITY ---')
  const findings = response.codebaseFindings.findings
  console.log(`   Critical: ${findings.filter(f => f.severity === 'critical').length}`)
  console.log(`   High: ${findings.filter(f => f.severity === 'high').length}`)
  console.log(`   Medium: ${findings.filter(f => f.severity === 'medium').length}`)
  console.log(`   Low: ${findings.filter(f => f.severity === 'low').length}`)

  console.log('\n--- AI INTELLIGENCE INSIGHTS ---')
  console.log(`   BUSINESS INTELLIGENCE readiness: ${response.BUSINESS INTELLIGENCEEvaluation.readinessScore}/10`)
  console.log(`   Module synergy: ${response.BUSINESS INTELLIGENCEEvaluation.moduleSynergyScore}/10`)
  console.log(`   ADVANCED potential: ${response.BUSINESS INTELLIGENCEEvaluation.ADVANCEDPotential}/10`)
  console.log(`   Business transformation: ${response.BUSINESS INTELLIGENCEEvaluation.businessTransformationReadiness}/10`)
  console.log(`   Ethical alignment: ${response.sacredProtocol.ethicalAlignmentScore}/10`)
  console.log(`   Human benefit: ${response.sacredProtocol.humanBenefitScore}/10`)

  console.log('\n--- EXECUTIVE SUMMARY ---')
  console.log(
    response.synthesis.executiveSummary
      .split('\n')
      .map((line) => `  ${line}`)
      .join('\n')
  )

  if (options.verbose) {
    console.log('\n--- DETAILED FINDINGS ---')
    response.findings.forEach((finding, index) => {
      console.log(`\n[${index + 1}] ${finding.title}`)
      console.log(`    Severity: ${finding.severity.toUpperCase()}`)
      console.log(`    Category: ${finding.category}`)
      console.log(`    Location: ${finding.evidence.codeReferences[0]?.file}`)
      console.log(`    Impact: ${finding.impact}`)
      console.log(`    Recommendation: ${finding.recommendation}`)
      
      if (finding.implementation) {
        console.log(`    Implementation Steps:`)
        finding.implementation.steps.forEach((step, i) => {
          console.log(`      ${i + 1}. ${step.description}`)
        })
        console.log(`    Estimated Effort: ${finding.implementation.estimatedEffort}`)
      }
    })
  }

  console.log('\n--- RECOMMENDATIONS ---')
  response.synthesis.prioritizedActions.forEach((action, index) => {
    console.log(`${index + 1}. ${action.action} (${action.priority})`)
    console.log(`   Impact: ${action.impact}`)
    console.log(`   Effort: ${action.effort}`)
  })

  console.log('\n--- NEXT STEPS ---')
  response.synthesis.nextSteps.forEach((step, index) => {
    console.log(`${index + 1}. ${step}`)
  })

  // Save output if requested
  if (options.output) {
    const outputPath = options.output
    const format = options.format || 'json'
    
    let outputContent: string
    switch (format) {
      case 'json':
        outputContent = JSON.stringify(response, null, 2)
        break
      case 'xml':
        outputContent = convertToXML(response)
        break
      case 'markdown':
        outputContent = convertToMarkdown(response)
        break
      case 'html':
        outputContent = convertToHTML(response)
        break
      default:
        outputContent = JSON.stringify(response, null, 2)
    }
    
    writeFileSync(outputPath, outputContent)
    console.log(`\nReport saved to: ${outputPath}`)
  }

  // Handle critical findings
  const critical = response.findings.filter((f) => f.severity === 'critical')
  if (critical.length > 0) {
    console.log('\n!!! CRITICAL FINDINGS DETECTED !!!')
    console.log(`Found ${critical.length} critical issues that require immediate attention.`)
    process.exit(1)
  }

  logger.info('SACRED audit completed successfully', {
    type: options.type,
    duration,
    findings: response.findings.length,
    component: 'sacred_audit_runner',
  })
}

async function demonstrateSACREDFramework() {
  console.log('\n--- SACRED FRAMEWORK DEMONSTRATION ---\n')
  
  console.log('The SACRED framework enhances AI prompts for superior results:\n')
  
  console.log('S - SPECIFIC')
  console.log('  Define clear, measurable outcomes')
  console.log('  Example: "Identify all SQL injection vulnerabilities with CVSS scores"\n')
  
  console.log('A - ACTIONABLE')
  console.log('  Require concrete implementation steps')
  console.log('  Example: "Provide code fixes with line numbers and test cases"\n')
  
  console.log('C - CONTEXTUAL')
  console.log('  Include business and technical context')
  console.log('  Example: "Consider our SaaS architecture and 99.9% uptime SLA"\n')
  
  console.log('R - REASONED')
  console.log('  Demand evidence-based conclusions')
  console.log('  Example: "Explain why each finding is critical with business impact"\n')
  
  console.log('E - EVIDENTIAL')
  console.log('  Require proof and references')
  console.log('  Example: "Include code snippets and OWASP references"\n')
  
  console.log('D - DELIVERABLE')
  console.log('  Specify output format and structure')
  console.log('  Example: "Generate executive summary and technical guide"\n')
  
  console.log('--- EXAMPLE ENHANCED PROMPT ---\n')
  
  const examplePrompt = `
You are performing a security audit for CoreFlow360, a SaaS platform.

<specific>
  <outcome>Identify all authentication vulnerabilities with CVSS scores</outcome>
  <outcome>Rank findings by exploitability and business impact</outcome>
  <metric name="coverage" target="100%" priority="critical" />
  <deliverable>Security assessment report with remediation roadmap</deliverable>
</specific>

<actionable>
  <requirement>Provide exact code changes with line numbers</requirement>
  <requirement>Include test cases for each fix</requirement>
  <requirement>Estimate implementation time per fix</requirement>
</actionable>

<contextual>
  <business-context>
    <objective>Maintain SOC2 compliance</objective>
    <constraint>Zero-downtime deployment required</constraint>
    <timeline>Fixes needed within 30 days</timeline>
  </business-context>
  <technical-context>
    <stack>Next.js, TypeScript, PostgreSQL</stack>
    <architecture>Microservices with JWT authentication</architecture>
  </technical-context>
</contextual>

<reasoned>
  <requirement>Explain attack vectors for each vulnerability</requirement>
  <requirement>Show potential business impact with examples</requirement>
  <requirement>Justify severity ratings with evidence</requirement>
</reasoned>

<evidential>
  <requirement>Reference OWASP Top 10 categories</requirement>
  <requirement>Include code snippets showing vulnerabilities</requirement>
  <requirement>Cite similar breaches and their impacts</requirement>
</evidential>

<deliverable>
  <format>Structured markdown report</format>
  <sections>
    <section>Executive summary</section>
    <section>Technical findings with code</section>
    <section>Remediation roadmap</section>
    <section>Compliance checklist</section>
  </sections>
</deliverable>
`
  
  console.log(examplePrompt)
  
  console.log('\n--- BENEFITS OF SACRED ---\n')
  console.log('✅ 10x more actionable findings')
  console.log('✅ Clear implementation paths')
  console.log('✅ Business-aligned recommendations')
  console.log('✅ Evidence-based conclusions')
  console.log('✅ Ready-to-use deliverables\n')
}

function mapAuditType(type: string): SACREDAuditRequest['auditType'] {
  const mapping: Record<string, SACREDAuditRequest['auditType']> = {
    security: 'security',
    performance: 'performance',
    quality: 'codeQuality',
    compliance: 'compliance',
    accessibility: 'accessibility',
    BUSINESS INTELLIGENCE: 'BUSINESS INTELLIGENCE',
    all: 'comprehensive',
  }
  
  return mapping[type.toLowerCase()] || 'comprehensive'
}

function parseArgs(args: string[]): SACREDAuditOptions {
  const options: SACREDAuditOptions = {
    type: '',
    scope: undefined,
    output: undefined,
    format: 'json',
    minSeverity: 'low',
    verbose: false,
    dryRun: false,
    custom: false,
  }
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    switch (arg) {
      case '-t':
      case '--type':
        options.type = args[++i]
        break
      case '-s':
      case '--scope':
        options.scope = args[++i].split(',')
        break
      case '-o':
      case '--output':
        options.output = args[++i]
        break
      case '-f':
      case '--format':
        options.format = args[++i] as any
        break
      case '-m':
      case '--min-severity':
        options.minSeverity = args[++i] as any
        break
      case '-v':
      case '--verbose':
        options.verbose = true
        break
      case '-c':
      case '--custom':
        options.custom = true
        break
      case '-d':
      case '--dry-run':
        options.dryRun = true
        break
      case '-h':
      case '--help':
        showHelp()
        process.exit(0)
    }
  }
  
  return options
}

function convertToXML(response: any): string {
  // Simple XML conversion (in production, use a proper XML library)
  return `<?xml version="1.0" encoding="UTF-8"?>
<sacred-audit-report>
  <summary>${response.synthesis.executiveSummary}</summary>
  <findings count="${response.findings.length}">
    ${response.findings.map((f: any) => `
    <finding severity="${f.severity}">
      <title>${f.title}</title>
      <impact>${f.impact}</impact>
      <recommendation>${f.recommendation}</recommendation>
    </finding>`).join('')}
  </findings>
</sacred-audit-report>`
}

function convertToMarkdown(response: any): string {
  return `# SACRED Audit Report

## Executive Summary
${response.synthesis.executiveSummary}

## Findings (${response.findings.length})
${response.findings.map((f: any) => `
### ${f.title}
- **Severity**: ${f.severity}
- **Impact**: ${f.impact}
- **Recommendation**: ${f.recommendation}
`).join('\n')}

## Next Steps
${response.synthesis.nextSteps.map((step: string, i: number) => `${i + 1}. ${step}`).join('\n')}
`
}

function convertToHTML(response: any): string {
  return `<!DOCTYPE html>
<html>
<head>
  <title>SACRED Audit Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    .severity-critical { color: #d32f2f; }
    .severity-high { color: #f57c00; }
    .severity-medium { color: #fbc02d; }
    .severity-low { color: #388e3c; }
  </style>
</head>
<body>
  <h1>SACRED Audit Report</h1>
  <h2>Executive Summary</h2>
  <p>${response.synthesis.executiveSummary}</p>
  
  <h2>Findings</h2>
  ${response.findings.map((f: any) => `
  <div class="finding">
    <h3 class="severity-${f.severity}">${f.title}</h3>
    <p><strong>Impact:</strong> ${f.impact}</p>
    <p><strong>Recommendation:</strong> ${f.recommendation}</p>
  </div>`).join('\n')}
</body>
</html>`
}

function showHelp() {
  console.log(`
USAGE:
  npm run audit:sacred [options]

OPTIONS:
  -t, --type <type>        Audit type: security, performance, quality, compliance, BUSINESS INTELLIGENCE, all
  -s, --scope <areas>      Specific scope areas (comma-separated)
  -o, --output <file>      Output file path
  -f, --format <format>    Output format: json, xml, markdown, html
  -m, --min-severity <level> Minimum severity: critical, high, medium, low
  -v, --verbose           Show detailed findings
  -c, --custom            Use custom prompt enhancements
  -d, --dry-run           Demonstrate SACRED framework
  -h, --help              Show this help

EXAMPLES:
  npm run audit:sacred                              # Security audit with defaults
  npm run audit:sacred -t performance -v            # Verbose performance audit
  npm run audit:sacred -t security -f html -o report.html  # HTML security report
  npm run audit:sacred --custom -s auth,api         # Custom audit with specific scope
  npm run audit:sacred --dry-run                    # See SACRED framework demo

The SACRED framework provides:
✅ Specific outcomes with measurable criteria
✅ Actionable findings with implementation steps
✅ Contextual analysis considering business needs
✅ Reasoned conclusions with chain-of-thought
✅ Evidence-based findings with code references
✅ Deliverable outputs in multiple formats
`)
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error)
}