#!/usr/bin/env tsx
/**
 * CoreFlow360 - CI Audit Runner
 * Execute SACRED audits in CI/CD pipelines
 */

import { createCIAudit, CIAuditConfig } from '../src/lib/audit/ci-integration'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

interface CLIOptions {
  config?: string
  baseline?: string
  output?: string
  failOnError?: boolean
}

async function main() {
  const args = process.argv.slice(2)
  const options = parseArgs(args)

  console.log('🤖 CoreFlow360 CI/CD Audit Runner')
  console.log('=' * 50)
  console.log(`Environment: ${process.env.CI ? 'CI' : 'Local'}`)
  console.log(`Event: ${process.env.GITHUB_EVENT_NAME || 'manual'}`)
  console.log('')

  try {
    // Load configuration
    let config: Partial<CIAuditConfig> = {}
    if (options.config) {
      const configData = readFileSync(options.config, 'utf-8')
      config = JSON.parse(configData)
      console.log('✅ Loaded configuration from:', options.config)
    }

    // Override with CLI options
    if (options.baseline) {
      config.baselinePath = options.baseline
    }
    if (options.output) {
      config.reportPath = options.output
    }

    // Create CI audit instance
    const ciAudit = createCIAudit(config)

    console.log('\n🔍 Running SACRED audit analysis...')
    console.log('-' * 50)

    // Execute audit
    const result = await ciAudit.runCIAudit()

    // Save result for GitHub Actions
    const resultPath = join(config.reportPath || 'audit-reports', 'ci-result.json')
    writeFileSync(resultPath, JSON.stringify(result, null, 2))

    // Display results
    console.log('\n📄 Audit Results:')
    console.log('-' * 50)
    console.log(`Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`)
    console.log(`Total Findings: ${result.totalFindings}`)
    console.log(`Critical: ${result.criticalFindings}`)
    console.log(`High: ${result.highFindings}`)
    console.log(`New Issues: ${result.newFindings}`)
    console.log(`Fixed Issues: ${result.fixedFindings}`)

    if (result.reportUrl) {
      console.log(`\n📁 Report saved to: ${result.reportUrl}`)
    }

    // Exit with appropriate code
    if (!result.passed && options.failOnError !== false) {
      console.error('\n❌ Audit failed - exiting with code 1')
      process.exit(1)
    }

    console.log('\n✨ CI audit completed successfully!')
    process.exit(0)

  } catch (error) {
    console.error('\n❌ Error running CI audit:', error)
    if (options.failOnError !== false) {
      process.exit(1)
    }
  }
}

function parseArgs(args: string[]): CLIOptions {
  const options: CLIOptions = {}

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    switch (arg) {
      case '--config':
      case '-c':
        options.config = args[++i]
        break
      case '--baseline':
      case '-b':
        options.baseline = args[++i]
        break
      case '--output':
      case '-o':
        options.output = args[++i]
        break
      case '--no-fail':
        options.failOnError = false
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
CoreFlow360 CI Audit Runner

USAGE:
  tsx scripts/run-ci-audit.ts [OPTIONS]

OPTIONS:
  -c, --config <file>     Configuration file path
  -b, --baseline <file>   Baseline file for comparison
  -o, --output <dir>      Output directory for reports
  --no-fail               Don't exit with error code on audit failure
  -h, --help              Show this help

EXAMPLES:
  # Run with default configuration
  tsx scripts/run-ci-audit.ts

  # Run with custom config
  tsx scripts/run-ci-audit.ts --config ci-audit.json

  # Run without failing the build
  tsx scripts/run-ci-audit.ts --no-fail

ENVIRONMENT VARIABLES:
  GITHUB_TOKEN            GitHub token for PR comments
  SLACK_WEBHOOK           Slack webhook for notifications
  CI                      Set by CI providers
  GITHUB_EVENT_NAME       GitHub Actions event type
  GITHUB_PR_NUMBER        Pull request number
`)
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error)
}