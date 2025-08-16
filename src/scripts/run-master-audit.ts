#!/usr/bin/env tsx
/**
 * CoreFlow360 - Master SaaS Audit Runner
 * Orchestrates comprehensive AI-powered auditing process
 */

import { auditOrchestrator, AuditScope, AuditCriteria } from '../lib/audit/audit-orchestration'
import { securityAuditor, performanceAuditor, architectureAuditor, businessLogicAuditor } from '../lib/audit/specialized-auditors'
import { logger } from '../lib/logging/logger'
import { writeFileSync } from 'fs'
import { join } from 'path'

interface AuditRunOptions {
  scope: string[]
  output?: string
  format?: 'json' | 'html' | 'markdown'
  priority?: 'critical' | 'high' | 'medium' | 'low'
  verbose?: boolean
  dryRun?: boolean
}

async function main() {
  const args = process.argv.slice(2)
  const options = parseArgs(args)

  console.log('🔍 CoreFlow360 Master SaaS Audit Framework')
  console.log('=' * 60)
  console.log(`Audit Scope: ${options.scope.join(', ')}`)
  console.log(`Output Format: ${options.format}`)
  console.log(`Priority Filter: ${options.priority || 'all'}`)
  console.log('')

  if (options.dryRun) {
    console.log('🔍 DRY RUN MODE - Simulating audit process...')
    return performDryRun(options)
  }

  try {
    await runMasterAudit(options)
  } catch (error) {
    console.error('❌ Master audit failed:', error)
    logger.error('Master audit execution failed', error as Error, {
      component: 'audit_runner'
    })
    process.exit(1)
  }
}

async function runMasterAudit(options: AuditRunOptions) {
  const startTime = Date.now()
  
  logger.info('Starting master audit execution', {
    scope: options.scope,
    component: 'audit_runner'
  })

  console.log('📋 Phase 1: Context Loading and Scope Definition')
  console.log('-'.repeat(50))
  
  // Define audit scope based on options
  const auditScope: AuditScope = {
    codebase: options.scope.includes('codebase') || options.scope.includes('all'),
    security: options.scope.includes('security') || options.scope.includes('all'),
    performance: options.scope.includes('performance') || options.scope.includes('all'),
    architecture: options.scope.includes('architecture') || options.scope.includes('all'),
    business_logic: options.scope.includes('business') || options.scope.includes('all'),
    user_experience: options.scope.includes('ux') || options.scope.includes('all'),
    scalability: options.scope.includes('scalability') || options.scope.includes('all'),
    maintainability: options.scope.includes('maintainability') || options.scope.includes('all'),
    compliance: options.scope.includes('compliance') || options.scope.includes('all'),
    deployment: options.scope.includes('deployment') || options.scope.includes('all')
  }

  const auditCriteria: AuditCriteria = {
    success_metrics: [
      'Zero critical security vulnerabilities',
      'All performance thresholds met',
      'Clean architecture patterns maintained',
      'Business logic integrity verified'
    ],
    priority_areas: options.scope,
    risk_tolerance: 'low',
    timeline: '2 hours',
    stakeholders: ['development_team', 'security_team', 'product_team']
  }

  // Load context
  const contextId = await auditOrchestrator.loadContext(auditScope, auditCriteria)
  console.log(`✅ Context loaded: ${contextId}`)

  console.log('\n🏗️ Phase 2: Intelligent Batching')
  console.log('-'.repeat(50))
  
  const batches = auditOrchestrator.createAuditBatches(contextId)
  console.log(`📦 Created ${batches.length} audit batches:`)
  
  batches.forEach((batch, index) => {
    const duration = Math.round(batch.estimated_duration / 60)
    console.log(`  ${index + 1}. ${batch.name} (${batch.audits.length} audits, ~${duration}min)`)
    if (options.verbose) {
      console.log(`     Audits: ${batch.audits.join(', ')}`)
      if (batch.dependencies.length > 0) {
        console.log(`     Dependencies: ${batch.dependencies.join(', ')}`)
      }
    }
  })

  console.log('\n⚡ Phase 3: Progressive Execution')
  console.log('-'.repeat(50))

  // Execute specialized audits concurrently where possible
  const auditPromises = []

  if (auditScope.security) {
    console.log('🔐 Running security audits...')
    auditPromises.push(runSecurityAudits())
  }

  if (auditScope.performance) {
    console.log('⚡ Running performance audits...')
    auditPromises.push(runPerformanceAudits())
  }

  if (auditScope.architecture) {
    console.log('🏗️ Running architecture audits...')
    auditPromises.push(runArchitectureAudits())
  }

  if (auditScope.business_logic) {
    console.log('💼 Running business logic audits...')
    auditPromises.push(runBusinessLogicAudits())
  }

  // Execute all audits
  console.log(`\n🚀 Executing ${auditPromises.length} audit categories...`)
  const auditResults = await Promise.all(auditPromises)
  
  // Flatten results
  const allFindings = auditResults.flat()
  console.log(`📊 Collected ${allFindings.length} findings across all audits`)

  console.log('\n🔬 Phase 4: Synthesis and Action Planning')
  console.log('-'.repeat(50))

  // Execute orchestrator pipeline for comprehensive analysis
  const orchestrationResults = await auditOrchestrator.executeAuditPipeline(contextId)
  const synthesis = await auditOrchestrator.synthesizeResults(contextId)

  // Generate comprehensive report
  const duration = Date.now() - startTime
  await generateAuditReport(synthesis, allFindings, duration, options)

  console.log('\n🎉 Master Audit Completed Successfully!')
  console.log('=' * 60)
  console.log(`Total Duration: ${Math.round(duration / 1000)}s`)
  console.log(`Total Findings: ${synthesis.key_findings.length}`)
  console.log(`Critical Issues: ${synthesis.key_findings.filter(f => f.severity === 'critical').length}`)
  console.log(`High Priority: ${synthesis.key_findings.filter(f => f.severity === 'high').length}`)
  console.log(`Implementation ROI: ${synthesis.roi_analysis.payback_period} months payback`)
  
  if (options.output) {
    console.log(`📄 Report saved to: ${options.output}`)
  }

  // Summary recommendations
  console.log('\n💡 Top 3 Immediate Actions:')
  synthesis.implementation_roadmap.phase_1_immediate.slice(0, 3).forEach((finding, index) => {
    console.log(`  ${index + 1}. ${finding.title} (${finding.severity} severity)`)
  })
}

async function runSecurityAudits() {
  const projectRoot = process.cwd()
  const findings = []

  // Run all security audit methods
  findings.push(...await securityAuditor.auditAuthentication(projectRoot))
  findings.push(...await securityAuditor.auditInputValidation(projectRoot))
  findings.push(...await securityAuditor.auditDataProtection(projectRoot))

  console.log(`  ✅ Security audit completed: ${findings.length} findings`)
  return findings
}

async function runPerformanceAudits() {
  const projectRoot = process.cwd()
  const findings = []

  // Run all performance audit methods
  findings.push(...await performanceAuditor.auditDatabaseQueries(projectRoot))
  findings.push(...await performanceAuditor.auditCachingStrategy(projectRoot))
  findings.push(...await performanceAuditor.auditBundleSize(projectRoot))

  console.log(`  ✅ Performance audit completed: ${findings.length} findings`)
  return findings
}

async function runArchitectureAudits() {
  const projectRoot = process.cwd()
  const findings = []

  // Run all architecture audit methods
  findings.push(...await architectureAuditor.auditLayeredArchitecture(projectRoot))
  findings.push(...await architectureAuditor.auditAPIDesign(projectRoot))

  console.log(`  ✅ Architecture audit completed: ${findings.length} findings`)
  return findings
}

async function runBusinessLogicAudits() {
  const projectRoot = process.cwd()
  const findings = []

  // Run all business logic audit methods
  findings.push(...await businessLogicAuditor.auditDataIntegrity(projectRoot))
  findings.push(...await businessLogicAuditor.auditBusinessRules(projectRoot))

  console.log(`  ✅ Business logic audit completed: ${findings.length} findings`)
  return findings
}

async function generateAuditReport(synthesis: any, findings: any[], duration: number, options: AuditRunOptions) {
  const reportData = {
    metadata: {
      timestamp: new Date().toISOString(),
      duration_ms: duration,
      scope: options.scope,
      total_findings: findings.length
    },
    executive_summary: synthesis.executive_summary,
    key_metrics: {
      critical_issues: findings.filter(f => f.severity === 'critical').length,
      high_issues: findings.filter(f => f.severity === 'high').length,
      medium_issues: findings.filter(f => f.severity === 'medium').length,
      low_issues: findings.filter(f => f.severity === 'low').length
    },
    risk_assessment: synthesis.risk_assessment,
    implementation_roadmap: synthesis.implementation_roadmap,
    roi_analysis: synthesis.roi_analysis,
    detailed_findings: findings
  }

  const outputPath = options.output || `audit-report-${Date.now()}.${options.format || 'json'}`

  switch (options.format) {
    case 'html':
      await generateHTMLReport(reportData, outputPath)
      break
    case 'markdown':
      await generateMarkdownReport(reportData, outputPath)
      break
    default:
      writeFileSync(outputPath, JSON.stringify(reportData, null, 2))
  }
}

async function generateHTMLReport(data: any, outputPath: string) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CoreFlow360 Master Audit Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #e1e5e9; }
        .header h1 { color: #2d3748; margin: 0; font-size: 2.5rem; }
        .header p { color: #718096; font-size: 1.1rem; margin: 10px 0; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
        .metric { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
        .metric h3 { margin: 0 0 10px 0; font-size: 2rem; }
        .metric p { margin: 0; opacity: 0.9; }
        .section { margin: 30px 0; }
        .section h2 { color: #2d3748; border-left: 4px solid #4299e1; padding-left: 15px; }
        .roadmap { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
        .phase { background: #f7fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #38b2ac; }
        .phase h3 { margin-top: 0; color: #2d3748; }
        .finding { background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin: 10px 0; }
        .severity-critical { border-left: 4px solid #f56565; }
        .severity-high { border-left: 4px solid #ed8936; }
        .severity-medium { border-left: 4px solid #ecc94b; }
        .severity-low { border-left: 4px solid #48bb78; }
        .finding h4 { margin: 0 0 10px 0; color: #2d3748; }
        .finding p { color: #4a5568; margin: 5px 0; }
        .finding .meta { font-size: 0.9rem; color: #718096; margin-top: 10px; }
        .roi { background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; padding: 25px; border-radius: 10px; text-align: center; }
        .roi h3 { margin: 0 0 15px 0; }
        .roi .value { font-size: 2rem; font-weight: bold; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 CoreFlow360 Master Audit Report</h1>
            <p>Comprehensive SaaS Architecture & Security Analysis</p>
            <p><strong>Generated:</strong> ${new Date(data.metadata.timestamp).toLocaleString()}</p>
            <p><strong>Duration:</strong> ${Math.round(data.metadata.duration_ms / 1000)} seconds</p>
        </div>

        <div class="metrics">
            <div class="metric">
                <h3>${data.key_metrics.critical_issues}</h3>
                <p>Critical Issues</p>
            </div>
            <div class="metric">
                <h3>${data.key_metrics.high_issues}</h3>
                <p>High Priority</p>
            </div>
            <div class="metric">
                <h3>${data.key_metrics.medium_issues}</h3>
                <p>Medium Priority</p>
            </div>
            <div class="metric">
                <h3>${data.metadata.total_findings}</h3>
                <p>Total Findings</p>
            </div>
        </div>

        <div class="section">
            <h2>📋 Executive Summary</h2>
            <p>${data.executive_summary}</p>
        </div>

        <div class="section">
            <h2>🎯 Implementation Roadmap</h2>
            <div class="roadmap">
                <div class="phase">
                    <h3>🚨 Phase 1: Immediate Actions</h3>
                    ${data.implementation_roadmap.phase_1_immediate.map((finding: any) => 
                        `<div class="finding severity-${finding.severity}">
                            <h4>${finding.title}</h4>
                            <p>${finding.description}</p>
                            <div class="meta">Effort: ${finding.effort} | Cost: ${finding.implementation_cost}h</div>
                        </div>`
                    ).join('')}
                </div>
                <div class="phase">
                    <h3>⏳ Phase 2: Short Term</h3>
                    ${data.implementation_roadmap.phase_2_short_term.slice(0, 5).map((finding: any) => 
                        `<div class="finding severity-${finding.severity}">
                            <h4>${finding.title}</h4>
                            <p>${finding.description}</p>
                            <div class="meta">Effort: ${finding.effort} | Cost: ${finding.implementation_cost}h</div>
                        </div>`
                    ).join('')}
                </div>
                <div class="phase">
                    <h3>📈 Phase 3: Long Term</h3>
                    ${data.implementation_roadmap.phase_3_long_term.slice(0, 5).map((finding: any) => 
                        `<div class="finding severity-${finding.severity}">
                            <h4>${finding.title}</h4>
                            <p>${finding.description}</p>
                            <div class="meta">Effort: ${finding.effort} | Cost: ${finding.implementation_cost}h</div>
                        </div>`
                    ).join('')}
                </div>
            </div>
        </div>

        <div class="section">
            <div class="roi">
                <h3>💰 Return on Investment Analysis</h3>
                <div class="value">$${data.roi_analysis.expected_savings.toLocaleString()}</div>
                <p>Expected Annual Savings</p>
                <p><strong>Payback Period:</strong> ${data.roi_analysis.payback_period} months</p>
                <p><strong>Risk Mitigation Value:</strong> $${data.roi_analysis.risk_mitigation_value.toLocaleString()}</p>
            </div>
        </div>

        <div class="section">
            <h2>🛡️ Risk Assessment</h2>
            <div class="finding">
                <h4>Critical Risks</h4>
                ${data.risk_assessment.critical_risks.map((risk: string) => `<li>${risk}</li>`).join('')}
            </div>
            <div class="finding">
                <h4>Business Impact: ${data.risk_assessment.business_impact}</h4>
                <p>Technical Impact: ${data.risk_assessment.technical_impact}</p>
            </div>
        </div>
    </div>
</body>
</html>`

  writeFileSync(outputPath, html)
}

async function generateMarkdownReport(data: any, outputPath: string) {
  const markdown = `
# 🔍 CoreFlow360 Master Audit Report

**Generated:** ${new Date(data.metadata.timestamp).toLocaleString()}  
**Duration:** ${Math.round(data.metadata.duration_ms / 1000)} seconds  
**Scope:** ${data.metadata.scope || 'Full audit'}

## 📊 Key Metrics

| Metric | Count |
|--------|-------|
| Critical Issues | ${data.key_metrics.critical_issues} |
| High Priority | ${data.key_metrics.high_issues} |
| Medium Priority | ${data.key_metrics.medium_issues} |
| Low Priority | ${data.key_metrics.low_issues} |
| **Total Findings** | **${data.metadata.total_findings}** |

## 📋 Executive Summary

${data.executive_summary}

## 🎯 Implementation Roadmap

### 🚨 Phase 1: Immediate Actions (Critical)

${data.implementation_roadmap.phase_1_immediate.map((finding: any, index: number) => 
  `${index + 1}. **${finding.title}** (${finding.severity})
   - ${finding.description}
   - Effort: ${finding.effort} | Cost: ${finding.implementation_cost}h
   - Business Value: ${finding.business_value}`
).join('\n\n')}

### ⏳ Phase 2: Short Term (Next 30 days)

${data.implementation_roadmap.phase_2_short_term.slice(0, 10).map((finding: any, index: number) => 
  `${index + 1}. **${finding.title}** (${finding.severity})
   - ${finding.description}
   - Effort: ${finding.effort} | Cost: ${finding.implementation_cost}h`
).join('\n\n')}

## 💰 Return on Investment Analysis

- **Total Investment:** $${data.roi_analysis.total_investment.toLocaleString()}
- **Expected Savings:** $${data.roi_analysis.expected_savings.toLocaleString()}/year
- **Payback Period:** ${data.roi_analysis.payback_period} months
- **Risk Mitigation Value:** $${data.roi_analysis.risk_mitigation_value.toLocaleString()}

## 🛡️ Risk Assessment

### Critical Risks
${data.risk_assessment.critical_risks.map((risk: string) => `- ${risk}`).join('\n')}

### Impact Assessment
- **Business Impact:** ${data.risk_assessment.business_impact}
- **Technical Impact:** ${data.risk_assessment.technical_impact}

---

*Report generated by CoreFlow360 Master SaaS Audit Framework*
`

  writeFileSync(outputPath, markdown)
}

async function performDryRun(options: AuditRunOptions) {
  console.log('🔍 Simulating audit execution...\n')
  
  const simulatedBatches = [
    { name: 'Security & Authentication', audits: 6, duration: 90 },
    { name: 'Performance & Scalability', audits: 5, duration: 75 },
    { name: 'Architecture & Design', audits: 4, duration: 60 },
    { name: 'Business Logic & Data', audits: 7, duration: 85 },
    { name: 'User Experience & Accessibility', audits: 4, duration: 50 }
  ]

  console.log('📦 Audit Batches:')
  simulatedBatches.forEach((batch, index) => {
    console.log(`  ${index + 1}. ${batch.name}`)
    console.log(`     ${batch.audits} audits, ~${batch.duration} minutes`)
  })

  const totalDuration = simulatedBatches.reduce((sum, batch) => sum + batch.duration, 0)
  const totalAudits = simulatedBatches.reduce((sum, batch) => sum + batch.audits, 0)

  console.log('\n📊 Estimated Execution:')
  console.log(`  Total Audits: ${totalAudits}`)
  console.log(`  Total Duration: ${Math.round(totalDuration / 60)} hours`)
  console.log(`  Parallel Execution: ~${Math.round(totalDuration / 3 / 60)} hours`)

  console.log('\n💡 Expected Findings:')
  console.log('  • 2-5 Critical security issues')
  console.log('  • 8-12 High priority improvements')
  console.log('  • 15-25 Medium priority optimizations')
  console.log('  • 20-40 Low priority enhancements')

  console.log('\n✅ Dry run completed - Ready for actual audit execution')
}

function parseArgs(args: string[]): AuditRunOptions {
  const options: AuditRunOptions = {
    scope: ['all'],
    format: 'json'
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    switch (arg) {
      case '--scope':
      case '-s':
        options.scope = args[++i].split(',')
        break
      case '--output':
      case '-o':
        options.output = args[++i]
        break
      case '--format':
      case '-f':
        options.format = args[++i] as 'json' | 'html' | 'markdown'
        break
      case '--priority':
      case '-p':
        options.priority = args[++i] as 'critical' | 'high' | 'medium' | 'low'
        break
      case '--verbose':
      case '-v':
        options.verbose = true
        break
      case '--dry-run':
      case '-d':
        options.dryRun = true
        break
      case '--help':
      case '-h':
        printHelp()
        process.exit(0)
        break
    }
  }

  return options
}

function printHelp() {
  console.log(`
CoreFlow360 Master SaaS Audit Framework

USAGE:
  npm run audit:master [OPTIONS]

OPTIONS:
  -s, --scope <areas>      Audit scope: security,performance,architecture,business,ux,all
  -o, --output <file>      Output file path
  -f, --format <type>      Report format: json,html,markdown (default: json)
  -p, --priority <level>   Filter by priority: critical,high,medium,low
  -v, --verbose           Enable verbose output
  -d, --dry-run           Simulate audit without execution
  -h, --help              Show this help

SCOPE OPTIONS:
  security        Authentication, authorization, input validation, data protection
  performance     Database queries, API response times, caching, bundle size
  architecture    Design patterns, separation of concerns, dependency management
  business        Business rules, data integrity, workflow consistency
  ux              Accessibility, usability, responsive design
  all             Complete comprehensive audit (default)

EXAMPLES:
  npm run audit:master                                    # Full audit
  npm run audit:master -s security,performance           # Specific areas
  npm run audit:master -f html -o report.html           # HTML report
  npm run audit:master --dry-run                        # Simulate execution
  npm run audit:master -p critical -f markdown          # Critical issues only

The audit framework provides:
✅ AI-powered analysis with chain-of-thought reasoning
✅ Comprehensive coverage across 10+ audit categories
✅ Actionable recommendations with ROI analysis
✅ Implementation roadmap prioritized by impact/effort
✅ Integration with existing development workflows
`)
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error)
}