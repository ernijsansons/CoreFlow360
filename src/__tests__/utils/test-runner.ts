/**
 * CoreFlow360 - Advanced Test Runner
 * Orchestrates different types of tests with reporting and CI/CD integration
 */

import { execSync, spawn, ChildProcess } from 'child_process'
import fs from 'fs'
import path from 'path'
import { PerformanceTestRunner, PerformanceMetrics } from './performance-test-helpers'

// Test suite types
export enum TestSuiteType {
  UNIT = 'unit',
  INTEGRATION = 'integration',
  E2E = 'e2e',
  LOAD = 'load',
  SECURITY = 'security',
  ACCESSIBILITY = 'accessibility',
  ALL = 'all'
}

// Test environment configurations
export interface TestEnvironment {
  name: string
  baseUrl: string
  databaseUrl: string
  apiKey?: string
  features?: string[]
}

// Test execution results
export interface TestResults {
  suite: TestSuiteType
  environment: string
  passed: number
  failed: number
  skipped: number
  duration: number
  coverage?: number
  performance?: PerformanceMetrics
  timestamp: Date
  artifacts: string[]
}

export class AdvancedTestRunner {
  private environments: Map<string, TestEnvironment> = new Map()
  private results: TestResults[] = []
  private currentProcess?: ChildProcess

  constructor() {
    this.setupEnvironments()
  }

  private setupEnvironments() {
    // Development environment
    this.environments.set('development', {
      name: 'Development',
      baseUrl: 'http://localhost:3000',
      databaseUrl: process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db',
      features: ['debug', 'mocks']
    })

    // Staging environment
    this.environments.set('staging', {
      name: 'Staging',
      baseUrl: 'https://staging.coreflow360.com',
      databaseUrl: process.env.STAGING_DATABASE_URL!,
      apiKey: process.env.STAGING_API_KEY,
      features: ['staging', 'monitoring']
    })

    // Production environment (read-only tests)
    this.environments.set('production', {
      name: 'Production',
      baseUrl: 'https://coreflow360.com',
      databaseUrl: process.env.PRODUCTION_READ_DATABASE_URL!,
      apiKey: process.env.PRODUCTION_API_KEY,
      features: ['production', 'monitoring', 'readonly']
    })
  }

  // Run specific test suite
  async runSuite(
    suite: TestSuiteType, 
    environment: string = 'development',
    options: {
      watch?: boolean
      coverage?: boolean
      bail?: boolean
      parallel?: boolean
      timeout?: number
      filter?: string
    } = {}
  ): Promise<TestResults> {
    console.log(`🚀 Starting ${suite} tests in ${environment} environment`)
    
    const env = this.environments.get(environment)
    if (!env) {
      throw new Error(`Unknown environment: ${environment}`)
    }

    const startTime = Date.now()
    let result: TestResults

    try {
      switch (suite) {
        case TestSuiteType.UNIT:
          result = await this.runUnitTests(env, options)
          break
        case TestSuiteType.INTEGRATION:
          result = await this.runIntegrationTests(env, options)
          break
        case TestSuiteType.E2E:
          result = await this.runE2ETests(env, options)
          break
        case TestSuiteType.LOAD:
          result = await this.runLoadTests(env, options)
          break
        case TestSuiteType.SECURITY:
          result = await this.runSecurityTests(env, options)
          break
        case TestSuiteType.ACCESSIBILITY:
          result = await this.runAccessibilityTests(env, options)
          break
        case TestSuiteType.ALL:
          result = await this.runAllTests(env, options)
          break
        default:
          throw new Error(`Unsupported test suite: ${suite}`)
      }

      result.duration = Date.now() - startTime
      this.results.push(result)

      console.log(`✅ ${suite} tests completed:`, {
        passed: result.passed,
        failed: result.failed,
        duration: `${result.duration}ms`
      })

      return result
    } catch (error) {
      console.error(`❌ ${suite} tests failed:`, error)
      throw error
    }
  }

  // Run unit tests with Vitest
  private async runUnitTests(env: TestEnvironment, options: any): Promise<TestResults> {
    const vitestConfig = {
      coverage: options.coverage,
      watch: options.watch,
      bail: options.bail,
      timeout: options.timeout || 10000
    }

    const command = [
      'vitest',
      options.watch ? '--watch' : '--run',
      options.coverage ? '--coverage' : '',
      options.filter ? `--grep "${options.filter}"` : '',
      options.bail ? '--bail' : '',
      '--reporter=json'
    ].filter(Boolean).join(' ')

    const output = execSync(command, {
      env: { ...process.env, ...this.getTestEnvVars(env) },
      encoding: 'utf8'
    })

    return this.parseVitestOutput(output, TestSuiteType.UNIT, env.name)
  }

  // Run integration tests
  private async runIntegrationTests(env: TestEnvironment, options: any): Promise<TestResults> {
    const command = [
      'vitest',
      'src/__tests__/integration',
      options.watch ? '--watch' : '--run',
      '--reporter=json'
    ].filter(Boolean).join(' ')

    const output = execSync(command, {
      env: { ...process.env, ...this.getTestEnvVars(env) },
      encoding: 'utf8'
    })

    return this.parseVitestOutput(output, TestSuiteType.INTEGRATION, env.name)
  }

  // Run E2E tests with Playwright
  private async runE2ETests(env: TestEnvironment, options: any): Promise<TestResults> {
    const command = [
      'playwright test',
      options.filter ? `--grep "${options.filter}"` : '',
      '--reporter=json'
    ].filter(Boolean).join(' ')

    const output = execSync(command, {
      env: { 
        ...process.env, 
        ...this.getTestEnvVars(env),
        PLAYWRIGHT_BASE_URL: env.baseUrl
      },
      encoding: 'utf8'
    })

    return this.parsePlaywrightOutput(output, env.name)
  }

  // Run load tests
  private async runLoadTests(env: TestEnvironment, options: any): Promise<TestResults> {
    const runner = new PerformanceTestRunner()
    
    const config = {
      url: `${env.baseUrl}/api/health`,
      concurrentUsers: options.users || 50,
      duration: options.duration || 60,
      rampUpTime: options.rampUp || 10
    }

    const performance = await runner.runLoadTest(config)

    return {
      suite: TestSuiteType.LOAD,
      environment: env.name,
      passed: performance.errorRate < 5 ? 1 : 0,
      failed: performance.errorRate >= 5 ? 1 : 0,
      skipped: 0,
      duration: performance.duration * 1000,
      performance,
      timestamp: new Date(),
      artifacts: []
    }
  }

  // Run security tests
  private async runSecurityTests(env: TestEnvironment, options: any): Promise<TestResults> {
    const command = [
      'vitest',
      'src/__tests__/security',
      '--run',
      '--reporter=json'
    ].join(' ')

    const output = execSync(command, {
      env: { ...process.env, ...this.getTestEnvVars(env) },
      encoding: 'utf8'
    })

    return this.parseVitestOutput(output, TestSuiteType.SECURITY, env.name)
  }

  // Run accessibility tests
  private async runAccessibilityTests(env: TestEnvironment, options: any): Promise<TestResults> {
    const command = [
      'vitest',
      'src/__tests__/accessibility',
      '--run',
      '--reporter=json'
    ].join(' ')

    const output = execSync(command, {
      env: { ...process.env, ...this.getTestEnvVars(env) },
      encoding: 'utf8'
    })

    return this.parseVitestOutput(output, TestSuiteType.ACCESSIBILITY, env.name)
  }

  // Run all test suites
  private async runAllTests(env: TestEnvironment, options: any): Promise<TestResults> {
    const suites = [
      TestSuiteType.UNIT,
      TestSuiteType.INTEGRATION,
      TestSuiteType.SECURITY,
      TestSuiteType.ACCESSIBILITY,
      TestSuiteType.E2E
    ]

    let totalPassed = 0
    let totalFailed = 0
    let totalSkipped = 0
    const artifacts: string[] = []

    for (const suite of suites) {
      try {
        const result = await this.runSuite(suite, env.name, { ...options, coverage: false })
        totalPassed += result.passed
        totalFailed += result.failed
        totalSkipped += result.skipped
        artifacts.push(...result.artifacts)
      } catch (error) {
        console.error(`Failed to run ${suite} tests:`, error)
        totalFailed += 1
      }
    }

    return {
      suite: TestSuiteType.ALL,
      environment: env.name,
      passed: totalPassed,
      failed: totalFailed,
      skipped: totalSkipped,
      duration: 0, // Will be set by caller
      timestamp: new Date(),
      artifacts
    }
  }

  // Parse Vitest JSON output
  private parseVitestOutput(output: string, suite: TestSuiteType, environment: string): TestResults {
    try {
      const lastLine = output.trim().split('\n').pop()
      const result = JSON.parse(lastLine!)
      
      return {
        suite,
        environment,
        passed: result.numPassedTests || 0,
        failed: result.numFailedTests || 0,
        skipped: result.numPendingTests || 0,
        duration: result.testResults?.[0]?.perfStats?.runtime || 0,
        coverage: result.coverageMap ? this.calculateCoverage(result.coverageMap) : undefined,
        timestamp: new Date(),
        artifacts: []
      }
    } catch (error) {
      console.error('Failed to parse Vitest output:', error)
      return {
        suite,
        environment,
        passed: 0,
        failed: 1,
        skipped: 0,
        duration: 0,
        timestamp: new Date(),
        artifacts: []
      }
    }
  }

  // Parse Playwright JSON output
  private parsePlaywrightOutput(output: string, environment: string): TestResults {
    try {
      const result = JSON.parse(output)
      
      return {
        suite: TestSuiteType.E2E,
        environment,
        passed: result.stats?.expected || 0,
        failed: result.stats?.unexpected || 0,
        skipped: result.stats?.skipped || 0,
        duration: result.stats?.duration || 0,
        timestamp: new Date(),
        artifacts: result.artifacts || []
      }
    } catch (error) {
      console.error('Failed to parse Playwright output:', error)
      return {
        suite: TestSuiteType.E2E,
        environment,
        passed: 0,
        failed: 1,
        skipped: 0,
        duration: 0,
        timestamp: new Date(),
        artifacts: []
      }
    }
  }

  // Calculate code coverage percentage
  private calculateCoverage(coverageMap: any): number {
    let totalStatements = 0
    let coveredStatements = 0

    for (const fileCoverage of Object.values(coverageMap)) {
      const statements = (fileCoverage as any).s
      for (const count of Object.values(statements)) {
        totalStatements++
        if (count as number > 0) coveredStatements++
      }
    }

    return totalStatements > 0 ? (coveredStatements / totalStatements) * 100 : 0
  }

  // Get environment variables for test execution
  private getTestEnvVars(env: TestEnvironment): Record<string, string> {
    return {
      NODE_ENV: 'test',
      DATABASE_URL: env.databaseUrl,
      TEST_BASE_URL: env.baseUrl,
      TEST_API_KEY: env.apiKey || '',
      TEST_ENVIRONMENT: env.name
    }
  }

  // Generate comprehensive test report
  generateReport(): string {
    const reportPath = path.join(process.cwd(), 'test-reports', `report-${Date.now()}.json`)
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.generateSummary(),
      results: this.results,
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version
    }

    // Ensure directory exists
    fs.mkdirSync(path.dirname(reportPath), { recursive: true })
    
    // Write report
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    
    console.log(`📊 Test report generated: ${reportPath}`)
    return reportPath
  }

  // Generate test summary
  private generateSummary() {
    const totalPassed = this.results.reduce((sum, r) => sum + r.passed, 0)
    const totalFailed = this.results.reduce((sum, r) => sum + r.failed, 0)
    const totalSkipped = this.results.reduce((sum, r) => sum + r.skipped, 0)
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0)
    
    return {
      totalTests: totalPassed + totalFailed + totalSkipped,
      passed: totalPassed,
      failed: totalFailed,
      skipped: totalSkipped,
      successRate: totalPassed / (totalPassed + totalFailed) * 100,
      totalDuration,
      suites: this.results.length
    }
  }

  // CI/CD integration helpers
  getExitCode(): number {
    return this.results.some(r => r.failed > 0) ? 1 : 0
  }

  // Kill running processes
  async cleanup() {
    if (this.currentProcess) {
      this.currentProcess.kill()
      this.currentProcess = undefined
    }
  }

  // Watch mode for development
  async watchMode(suite: TestSuiteType, environment: string = 'development') {
    console.log(`👀 Starting watch mode for ${suite} tests`)
    
    const options = { 
      watch: true, 
      coverage: false,
      bail: false
    }

    try {
      await this.runSuite(suite, environment, options)
    } catch (error) {
      console.error('Watch mode error:', error)
    }
  }
}

// Pre-configured test runners
export const testRunners = {
  // Quick development test
  quick: async () => {
    const runner = new AdvancedTestRunner()
    return await runner.runSuite(TestSuiteType.UNIT, 'development', {
      filter: 'src/__tests__/utils',
      timeout: 5000
    })
  },

  // CI/CD pipeline test
  ci: async (environment: string = 'staging') => {
    const runner = new AdvancedTestRunner()
    const result = await runner.runSuite(TestSuiteType.ALL, environment, {
      coverage: true,
      bail: true,
      parallel: true
    })
    
    runner.generateReport()
    return result
  },

  // Pre-deployment validation
  preDeployment: async () => {
    const runner = new AdvancedTestRunner()
    const results = []
    
    // Run critical tests
    results.push(await runner.runSuite(TestSuiteType.UNIT, 'development'))
    results.push(await runner.runSuite(TestSuiteType.INTEGRATION, 'staging'))
    results.push(await runner.runSuite(TestSuiteType.SECURITY, 'staging'))
    
    const hasFailures = results.some(r => r.failed > 0)
    if (hasFailures) {
      throw new Error('Pre-deployment tests failed')
    }
    
    return results
  }
}

export default AdvancedTestRunner