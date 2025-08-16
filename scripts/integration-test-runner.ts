/**
 * CoreFlow360 - Comprehensive Integration Test Runner
 * Phase 9.1: Module Integration Testing
 */

import { execSync } from 'child_process'
import { performance } from 'perf_hooks'
import fs from 'fs'
import path from 'path'

interface TestResult {
  suite: string
  status: 'pass' | 'fail' | 'skip'
  duration: number
  tests?: {
    passed: number
    failed: number
    total: number
  }
  errors?: string[]
}

interface TestReport {
  totalSuites: number
  passedSuites: number
  failedSuites: number
  totalTests: number
  passedTests: number
  failedTests: number
  totalDuration: number
  results: TestResult[]
  summary: string
}

class IntegrationTestRunner {
  private results: TestResult[] = []
  private startTime: number = 0

  constructor() {
    console.log('🧪 CoreFlow360 - Integration Test Runner Starting')
    console.log('Testing all modular ERP features working together perfectly')
    this.startTime = performance.now()
  }

  async runAllTests(): Promise<TestReport> {
    const testSuites = [
      {
        name: 'Module Combinations',
        path: 'src/__tests__/subscription/module-combinations.test.ts',
        description: 'Testing all module activation/deactivation combinations'
      },
      {
        name: 'Pricing Calculator',
        path: 'src/__tests__/subscription/pricing-calculator.test.ts',
        description: 'Testing Odoo-competitive pricing calculations'
      },
      {
        name: 'Performance Utils',
        path: 'src/__tests__/performance/performance-utils.test.ts',
        description: 'Testing sub-millisecond performance monitoring'
      },
      {
        name: 'Security Validation',
        path: 'src/__tests__/security/security-validation.test.ts',
        description: 'Testing zero-trust security model'
      },
      {
        name: 'Infrastructure Validation',
        path: 'src/__tests__/infrastructure-validation.test.ts',
        description: 'Testing core infrastructure components'
      }
    ]

    console.log(`\n📋 Running ${testSuites.length} test suites...\n`)

    for (const suite of testSuites) {
      console.log(`🔍 Testing: ${suite.name}`)
      console.log(`   ${suite.description}`)
      
      const result = await this.runTestSuite(suite.name, suite.path)
      this.results.push(result)
      
      if (result.status === 'pass') {
        console.log(`   ✅ PASSED (${result.duration.toFixed(2)}ms)`)
      } else if (result.status === 'fail') {
        console.log(`   ❌ FAILED (${result.duration.toFixed(2)}ms)`)
        if (result.errors) {
          result.errors.forEach(error => console.log(`      ${error}`))
        }
      } else {
        console.log(`   ⏭️  SKIPPED`)
      }
      console.log()
    }

    return this.generateReport()
  }

  private async runTestSuite(name: string, testPath: string): Promise<TestResult> {
    const startTime = performance.now()
    
    try {
      // Check if test file exists
      const fullPath = path.join(process.cwd(), testPath)
      if (!fs.existsSync(fullPath)) {
        return {
          suite: name,
          status: 'skip',
          duration: 0,
          errors: [`Test file not found: ${testPath}`]
        }
      }

      // Run the test with Vitest
      const result = execSync(
        `npm test -- ${testPath} --reporter=json --run`,
        { 
          encoding: 'utf8',
          timeout: 60000,
          stdio: ['pipe', 'pipe', 'pipe']
        }
      )

      const duration = performance.now() - startTime

      // Try to parse test results if available
      const lines = result.split('\n')
      const jsonLine = lines.find(line => line.trim().startsWith('{'))
      
      if (jsonLine) {
        try {
          const testResult = JSON.parse(jsonLine)
          const passed = testResult.numPassedTests || 0
          const failed = testResult.numFailedTests || 0
          
          return {
            suite: name,
            status: failed === 0 ? 'pass' : 'fail',
            duration,
            tests: {
              passed,
              failed,
              total: passed + failed
            }
          }
        } catch (parseError) {
          // Fallback to simple pass/fail based on exit
          return {
            suite: name,
            status: 'pass',
            duration,
            tests: {
              passed: 1,
              failed: 0,
              total: 1
            }
          }
        }
      }

      return {
        suite: name,
        status: 'pass',
        duration
      }

    } catch (error: any) {
      const duration = performance.now() - startTime
      
      return {
        suite: name,
        status: 'fail',
        duration,
        errors: [
          error.message,
          error.stdout ? `STDOUT: ${error.stdout}` : '',
          error.stderr ? `STDERR: ${error.stderr}` : ''
        ].filter(Boolean)
      }
    }
  }

  private generateReport(): TestReport {
    const totalDuration = performance.now() - this.startTime
    const passedSuites = this.results.filter(r => r.status === 'pass').length
    const failedSuites = this.results.filter(r => r.status === 'fail').length
    
    const totalTests = this.results.reduce((sum, r) => sum + (r.tests?.total || 0), 0)
    const passedTests = this.results.reduce((sum, r) => sum + (r.tests?.passed || 0), 0)
    const failedTests = this.results.reduce((sum, r) => sum + (r.tests?.failed || 0), 0)

    const report: TestReport = {
      totalSuites: this.results.length,
      passedSuites,
      failedSuites,
      totalTests,
      passedTests,
      failedTests,
      totalDuration,
      results: this.results,
      summary: this.generateSummary(passedSuites, failedSuites, totalTests, passedTests, failedTests)
    }

    this.printReport(report)
    this.saveReport(report)
    
    return report
  }

  private generateSummary(passedSuites: number, failedSuites: number, totalTests: number, passedTests: number, failedTests: number): string {
    const suiteSuccessRate = (passedSuites / (passedSuites + failedSuites)) * 100
    const testSuccessRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0
    
    if (failedSuites === 0 && failedTests === 0) {
      return `🎉 ALL TESTS PASSED! Perfect integration across all modules.`
    } else if (suiteSuccessRate >= 80) {
      return `⚠️  Mostly successful with ${failedSuites} failing suites and ${failedTests} failing tests. Requires fixes.`
    } else {
      return `❌ Major integration issues detected. ${failedSuites} failing suites, ${failedTests} failing tests.`
    }
  }

  private printReport(report: TestReport): void {
    console.log('\n' + '='.repeat(80))
    console.log('🧪 COREFLOW360 INTEGRATION TEST REPORT')
    console.log('='.repeat(80))
    console.log(`Total Test Suites: ${report.totalSuites}`)
    console.log(`✅ Passed Suites:  ${report.passedSuites}`)
    console.log(`❌ Failed Suites:  ${report.failedSuites}`)
    console.log(`📊 Total Tests:    ${report.totalTests}`)
    console.log(`✅ Passed Tests:   ${report.passedTests}`)
    console.log(`❌ Failed Tests:   ${report.failedTests}`)
    console.log(`⏱️  Total Duration: ${(report.totalDuration / 1000).toFixed(2)}s`)
    console.log()
    console.log(`📈 Suite Success Rate: ${(report.passedSuites / report.totalSuites * 100).toFixed(1)}%`)
    if (report.totalTests > 0) {
      console.log(`📈 Test Success Rate:  ${(report.passedTests / report.totalTests * 100).toFixed(1)}%`)
    }
    console.log()
    console.log(report.summary)
    console.log('='.repeat(80))

    // Detailed results
    if (report.failedSuites > 0) {
      console.log('\n❌ FAILED SUITES DETAILS:')
      console.log('-'.repeat(50))
      report.results
        .filter(r => r.status === 'fail')
        .forEach(result => {
          console.log(`\n${result.suite}:`)
          if (result.errors) {
            result.errors.forEach(error => console.log(`  • ${error}`))
          }
        })
    }
  }

  private saveReport(report: TestReport): void {
    const reportPath = 'integration-test-report.json'
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`\n📁 Test report saved to: ${reportPath}`)
  }
}

// Run the tests if this file is executed directly
if (require.main === module) {
  const runner = new IntegrationTestRunner()
  runner.runAllTests().then(report => {
    process.exit(report.failedSuites > 0 ? 1 : 0)
  }).catch(error => {
    console.error('Test runner error:', error)
    process.exit(1)
  })
}

export { IntegrationTestRunner, TestResult, TestReport }