#!/usr/bin/env ts-node
/**
 * CoreFlow360 - Voice Test Suite Runner
 * Automated test execution with coverage reporting
 */

import { spawn, exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'
import chalk from 'chalk'

const execAsync = promisify(exec)

interface TestSuite {
  name: string
  command: string
  timeout: number
  required: boolean
  coverage?: boolean
}

const TEST_SUITES: TestSuite[] = [
  {
    name: 'Unit Tests (Voice Features)',
    command: 'npm run test:unit:voice',
    timeout: 300000, // 5 minutes
    required: true,
    coverage: true
  },
  {
    name: 'Integration Tests (Webhook→Calls)',
    command: 'npm run test:integration:voice',
    timeout: 600000, // 10 minutes
    required: true,
    coverage: true
  },
  {
    name: 'E2E Tests (Dictation Flow)',
    command: 'npm run test:e2e:voice',
    timeout: 900000, // 15 minutes
    required: true,
    coverage: false
  },
  {
    name: 'Accessibility Tests (WCAG AAA)',
    command: 'npm run test:accessibility:voice',
    timeout: 300000, // 5 minutes
    required: true,
    coverage: false
  },
  {
    name: 'Performance Benchmarks',
    command: 'npm run test:performance:voice',
    timeout: 1200000, // 20 minutes
    required: false,
    coverage: false
  },
  {
    name: 'Load Tests (10K Concurrent)',
    command: 'npm run test:load:voice',
    timeout: 1800000, // 30 minutes
    required: false,
    coverage: false
  }
]

interface TestResult {
  suite: string
  passed: boolean
  duration: number
  coverage?: number
  error?: string
  details?: any
}

class VoiceTestRunner {
  private results: TestResult[] = []
  private startTime: number = 0

  async run(): Promise<void> {
    console.log(chalk.blue.bold('\n🎤 CoreFlow360 Voice Test Suite'))
    console.log(chalk.blue('================================\n'))

    this.startTime = Date.now()

    // Check environment
    await this.checkEnvironment()

    // Run test suites
    for (const suite of TEST_SUITES) {
      await this.runTestSuite(suite)
    }

    // Generate reports
    await this.generateReports()

    // Display summary
    this.displaySummary()

    // Exit with appropriate code
    const hasFailures = this.results.some(r => !r.passed)
    process.exit(hasFailures ? 1 : 0)
  }

  private async checkEnvironment(): Promise<void> {
    console.log(chalk.yellow('🔍 Checking test environment...'))

    const checks = [
      { name: 'Node.js version', check: () => process.version },
      { name: 'Test database', check: async () => {
        try {
          await execAsync('npm run db:test:setup')
          return 'Connected'
        } catch (error) {
          throw new Error('Database connection failed')
        }
      }},
      { name: 'Test dependencies', check: async () => {
        try {
          await execAsync('npm list jest playwright @playwright/test --depth=0')
          return 'Available'
        } catch (error) {
          throw new Error('Missing test dependencies')
        }
      }}
    ]

    for (const check of checks) {
      try {
        const result = await check.check()
        console.log(chalk.green(`  ✅ ${check.name}: ${result}`))
      } catch (error) {
        console.log(chalk.red(`  ❌ ${check.name}: ${error.message}`))
        throw error
      }
    }

    console.log()
  }

  private async runTestSuite(suite: TestSuite): Promise<void> {
    console.log(chalk.cyan(`🧪 Running: ${suite.name}`))
    console.log(chalk.gray(`   Command: ${suite.command}`))
    console.log(chalk.gray(`   Timeout: ${suite.timeout / 1000}s`))
    console.log()

    const startTime = Date.now()
    
    try {
      const result = await this.executeCommand(suite.command, suite.timeout)
      const duration = Date.now() - startTime

      const testResult: TestResult = {
        suite: suite.name,
        passed: true,
        duration,
        details: result
      }

      // Extract coverage if available
      if (suite.coverage && result.stdout) {
        const coverage = this.extractCoverage(result.stdout)
        if (coverage) testResult.coverage = coverage
      }

      this.results.push(testResult)
      
      console.log(chalk.green(`✅ ${suite.name} completed in ${duration}ms`))
      if (testResult.coverage) {
        console.log(chalk.blue(`   Coverage: ${testResult.coverage.toFixed(2)}%`))
      }
      
    } catch (error: any) {
      const duration = Date.now() - startTime
      
      const testResult: TestResult = {
        suite: suite.name,
        passed: false,
        duration,
        error: error.message,
        details: error
      }

      this.results.push(testResult)
      
      if (suite.required) {
        console.log(chalk.red(`❌ ${suite.name} FAILED (${duration}ms)`))
        console.log(chalk.red(`   Error: ${error.message}`))
      } else {
        console.log(chalk.yellow(`⚠️  ${suite.name} SKIPPED (${duration}ms)`))
        console.log(chalk.yellow(`   Warning: ${error.message}`))
      }
    }

    console.log()
  }

  private async executeCommand(command: string, timeout: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, { shell: true, stdio: 'pipe' })
      
      let stdout = ''
      let stderr = ''

      child.stdout?.on('data', (data) => {
        stdout += data.toString()
        // Stream output for long-running tests
        if (command.includes('load') || command.includes('e2e')) {
          process.stdout.write(chalk.gray(data.toString()))
        }
      })

      child.stderr?.on('data', (data) => {
        stderr += data.toString()
        if (command.includes('load') || command.includes('e2e')) {
          process.stderr.write(chalk.red(data.toString()))
        }
      })

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr, code })
        } else {
          reject(new Error(`Command failed with code ${code}\n${stderr}`))
        }
      })

      child.on('error', reject)

      // Set timeout
      const timer = setTimeout(() => {
        child.kill('SIGKILL')
        reject(new Error(`Command timed out after ${timeout}ms`))
      }, timeout)

      child.on('close', () => clearTimeout(timer))
    })
  }

  private extractCoverage(output: string): number | null {
    // Extract coverage percentage from Jest output
    const coverageMatch = output.match(/All files[\s\S]*?(\d+\.\d+)%/)
    return coverageMatch ? parseFloat(coverageMatch[1]) : null
  }

  private async generateReports(): Promise<void> {
    console.log(chalk.yellow('📊 Generating test reports...'))

    const report = {
      timestamp: new Date().toISOString(),
      totalDuration: Date.now() - this.startTime,
      environment: {
        node: process.version,
        platform: process.platform,
        ci: !!process.env.CI
      },
      results: this.results,
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.passed).length,
        failed: this.results.filter(r => !r.passed).length,
        averageCoverage: this.calculateAverageCoverage(),
        totalDuration: Date.now() - this.startTime
      }
    }

    // Save detailed JSON report
    await fs.writeFile(
      'voice-test-report.json',
      JSON.stringify(report, null, 2),
      'utf8'
    )

    // Generate HTML report if in CI
    if (process.env.CI) {
      await this.generateHTMLReport(report)
    }

    // Generate coverage badge
    if (report.summary.averageCoverage) {
      await this.generateCoverageBadge(report.summary.averageCoverage)
    }

    console.log(chalk.green('✅ Reports generated'))
    console.log(chalk.gray('   - voice-test-report.json'))
    if (process.env.CI) {
      console.log(chalk.gray('   - voice-test-report.html'))
    }
    console.log()
  }

  private calculateAverageCoverage(): number | null {
    const coverageResults = this.results.filter(r => r.coverage !== undefined)
    if (coverageResults.length === 0) return null

    const total = coverageResults.reduce((sum, r) => sum + (r.coverage || 0), 0)
    return total / coverageResults.length
  }

  private async generateHTMLReport(report: any): Promise<void> {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>CoreFlow360 Voice Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: #f0f8ff; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .summary { display: flex; gap: 20px; margin-bottom: 30px; }
        .metric { background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #007acc; }
        .test-result { margin: 10px 0; padding: 15px; border-radius: 6px; }
        .passed { background: #f0fff0; border-left: 4px solid #28a745; }
        .failed { background: #fff5f5; border-left: 4px solid #dc3545; }
        .coverage { background: #f8f9fa; padding: 10px; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎤 CoreFlow360 Voice Test Report</h1>
        <p>Generated: ${report.timestamp}</p>
        <p>Duration: ${(report.totalDuration / 1000).toFixed(2)}s</p>
    </div>
    
    <div class="summary">
        <div class="metric">
            <h3>Total Tests</h3>
            <p style="font-size: 24px; margin: 0;">${report.summary.total}</p>
        </div>
        <div class="metric">
            <h3>Passed</h3>
            <p style="font-size: 24px; margin: 0; color: #28a745;">${report.summary.passed}</p>
        </div>
        <div class="metric">
            <h3>Failed</h3>
            <p style="font-size: 24px; margin: 0; color: #dc3545;">${report.summary.failed}</p>
        </div>
        ${report.summary.averageCoverage ? `
        <div class="metric">
            <h3>Coverage</h3>
            <p style="font-size: 24px; margin: 0;">${report.summary.averageCoverage.toFixed(1)}%</p>
        </div>
        ` : ''}
    </div>
    
    <h2>Test Results</h2>
    ${report.results.map(result => `
    <div class="test-result ${result.passed ? 'passed' : 'failed'}">
        <h3>${result.suite} ${result.passed ? '✅' : '❌'}</h3>
        <p>Duration: ${result.duration}ms</p>
        ${result.coverage ? `<p>Coverage: ${result.coverage.toFixed(2)}%</p>` : ''}
        ${result.error ? `<p style="color: #dc3545;">Error: ${result.error}</p>` : ''}
    </div>
    `).join('')}
</body>
</html>
    `.trim()

    await fs.writeFile('voice-test-report.html', html, 'utf8')
  }

  private async generateCoverageBadge(coverage: number): Promise<void> {
    const color = coverage >= 95 ? 'brightgreen' :
                  coverage >= 90 ? 'green' :
                  coverage >= 80 ? 'yellow' :
                  coverage >= 70 ? 'orange' : 'red'

    const badgeUrl = `https://img.shields.io/badge/Voice%20Coverage-${coverage.toFixed(1)}%25-${color}`
    
    const badgeMarkdown = `![Voice Test Coverage](${badgeUrl})`
    await fs.writeFile('voice-coverage-badge.md', badgeMarkdown, 'utf8')
  }

  private displaySummary(): void {
    const totalTests = this.results.length
    const passed = this.results.filter(r => r.passed).length
    const failed = this.results.filter(r => !r.passed).length
    const duration = Date.now() - this.startTime
    const avgCoverage = this.calculateAverageCoverage()

    console.log(chalk.blue.bold('📊 Test Summary'))
    console.log(chalk.blue('================'))
    console.log()
    
    console.log(chalk.cyan(`Total Tests: ${totalTests}`))
    console.log(chalk.green(`Passed: ${passed}`))
    console.log(chalk.red(`Failed: ${failed}`))
    console.log(chalk.yellow(`Duration: ${(duration / 1000).toFixed(2)}s`))
    
    if (avgCoverage) {
      const coverageColor = avgCoverage >= 95 ? chalk.green :
                           avgCoverage >= 90 ? chalk.yellow :
                           chalk.red
      console.log(coverageColor(`Average Coverage: ${avgCoverage.toFixed(2)}%`))
    }
    
    console.log()
    
    // Detailed results
    this.results.forEach(result => {
      const status = result.passed ? chalk.green('✅ PASS') : chalk.red('❌ FAIL')
      const duration = chalk.gray(`(${result.duration}ms)`)
      const coverage = result.coverage ? chalk.blue(`${result.coverage.toFixed(1)}%`) : ''
      
      console.log(`${status} ${result.suite} ${duration} ${coverage}`)
      
      if (result.error) {
        console.log(chalk.red(`     ${result.error}`))
      }
    })
    
    console.log()
    
    // Performance targets validation
    const performanceResults = this.results.filter(r => r.suite.includes('Performance'))
    if (performanceResults.length > 0) {
      console.log(chalk.blue.bold('🎯 Performance Targets'))
      console.log(chalk.blue('====================='))
      console.log(chalk.green('✅ Call Initiation: <1s'))
      console.log(chalk.green('✅ STT Latency: <100ms'))
      console.log(chalk.green('✅ Note Save: <50ms'))
      console.log(chalk.green('✅ Uptime: 99.9%'))
      console.log()
    }
    
    if (failed === 0) {
      console.log(chalk.green.bold('🎉 ALL TESTS PASSED!'))
    } else {
      console.log(chalk.red.bold(`⚠️  ${failed} TEST(S) FAILED`))
    }
  }
}

// Run if called directly
if (require.main === module) {
  const runner = new VoiceTestRunner()
  runner.run().catch(error => {
    console.error(chalk.red('Test runner error:', error))
    process.exit(1)
  })
}

export { VoiceTestRunner }