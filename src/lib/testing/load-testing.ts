/**
 * CoreFlow360 - Load Testing and Stress Testing Framework
 * Comprehensive performance testing suite for production readiness
 */

import { execSync, spawn, ChildProcess } from 'child_process'
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { logger } from '@/lib/logging/logger'

export interface LoadTestConfig {
  name: string
  target: string
  duration: string // e.g., '30s', '5m', '1h'
  virtualUsers: number
  rampUpTime?: string
  scenarios?: LoadTestScenario[]
  thresholds?: LoadTestThresholds
  environment?: 'development' | 'staging' | 'production'
}

export interface LoadTestScenario {
  name: string
  weight: number // Percentage of traffic
  executor: 'constant-vus' | 'ramping-vus' | 'constant-arrival-rate'
  stages?: Array<{
    duration: string
    target: number
  }>
  env?: Record<string, string>
  tags?: Record<string, string>
}

export interface LoadTestThresholds {
  http_req_duration?: string // e.g., 'p(95)<500'
  http_req_failed?: string // e.g., 'rate<0.01'
  http_reqs?: string // e.g., 'rate>100'
  checks?: string // e.g., 'rate>0.95'
}

export interface LoadTestResult {
  testId: string
  config: LoadTestConfig
  startTime: string
  endTime: string
  duration: number
  summary: {
    totalRequests: number
    failedRequests: number
    avgResponseTime: number
    p95ResponseTime: number
    p99ResponseTime: number
    requestsPerSecond: number
    dataTransferred: string
    errorRate: number
  }
  thresholdsPassed: boolean
  errors: Array<{
    type: string
    count: number
    message: string
  }>
  rawOutput: string
  reportPath?: string
}

export class LoadTestingFramework {
  private testResults: LoadTestResult[] = []
  private k6Binary: string = 'k6'
  private resultsDir: string

  constructor(resultsDir: string = 'load-test-results') {
    this.resultsDir = resultsDir
    this.ensureDirectoryExists()
    this.validateK6Installation()
  }

  /**
   * Run a comprehensive load test suite
   */
  async runTestSuite(
    baseUrl: string,
    environment: 'development' | 'staging' | 'production' = 'development'
  ): Promise<LoadTestResult[]> {
    logger.info('Starting comprehensive load test suite', {
      baseUrl,
      environment,
      suite: 'load_testing',
    })

    const results: LoadTestResult[] = []

    // Define test scenarios based on environment
    const testConfigs = this.getTestConfigs(baseUrl, environment)

    for (const config of testConfigs) {
      try {
        logger.info(`Running load test: ${config.name}`)
        const result = await this.runLoadTest(config)
        results.push(result)

        // Short delay between tests
        await new Promise((resolve) => setTimeout(resolve, 5000))
      } catch (error) {
        logger.error(`Load test failed: ${config.name}`, error as Error)
      }
    }

    // Generate comprehensive report
    this.generateTestReport(results)

    return results
  }

  /**
   * Run a single load test
   */
  async runLoadTest(config: LoadTestConfig): Promise<LoadTestResult> {
    const testId = this.generateTestId(config.name)
    const startTime = new Date().toISOString()

    logger.performance(
      'Load test started',
      {
        operation: 'load_test',
        duration_ms: 0,
      },
      {
        component: 'load_testing',
        metadata: { testId, testName: config.name },
      }
    )

    try {
      // Generate K6 script
      const scriptPath = this.generateK6Script(config, testId)

      // Run K6 test
      const rawOutput = await this.executeK6Test(scriptPath, testId)

      // Parse results
      const result = this.parseK6Output(testId, config, startTime, rawOutput)

      this.testResults.push(result)
      this.saveTestResult(result)

      // Log test completion
      logger.performance(
        'Load test completed',
        {
          operation: 'load_test',
          duration_ms: result.duration,
        },
        {
          component: 'load_testing',
          metadata: {
            testId,
            passed: result.thresholdsPassed,
            requestsPerSecond: result.summary.requestsPerSecond,
            errorRate: result.summary.errorRate,
          },
        }
      )

      return result
    } catch (error) {
      logger.error('Load test execution failed', error as Error, {
        component: 'load_testing',
        metadata: { testId, testName: config.name },
      })
      throw error
    }
  }

  /**
   * Run stress test to find breaking points
   */
  async runStressTest(baseUrl: string, maxVirtualUsers: number = 1000): Promise<LoadTestResult> {
    const config: LoadTestConfig = {
      name: 'stress-test',
      target: baseUrl,
      duration: '10m',
      virtualUsers: maxVirtualUsers,
      scenarios: [
        {
          name: 'stress_ramp',
          weight: 100,
          executor: 'ramping-vus',
          stages: [
            { duration: '2m', target: 100 }, // Ramp up to 100 users
            { duration: '2m', target: 200 }, // Ramp to 200 users
            { duration: '2m', target: 500 }, // Ramp to 500 users
            { duration: '2m', target: maxVirtualUsers }, // Peak load
            { duration: '1m', target: maxVirtualUsers }, // Stay at peak
            { duration: '1m', target: 0 }, // Ramp down
          ],
        },
      ],
      thresholds: {
        http_req_duration: 'p(95)<2000', // More lenient for stress test
        http_req_failed: 'rate<0.05', // Allow 5% failures
      },
    }

    return this.runLoadTest(config)
  }

  /**
   * Run spike test for traffic spikes
   */
  async runSpikeTest(baseUrl: string): Promise<LoadTestResult> {
    const config: LoadTestConfig = {
      name: 'spike-test',
      target: baseUrl,
      duration: '5m',
      virtualUsers: 500,
      scenarios: [
        {
          name: 'spike_pattern',
          weight: 100,
          executor: 'ramping-vus',
          stages: [
            { duration: '30s', target: 50 }, // Baseline
            { duration: '30s', target: 500 }, // Spike
            { duration: '1m', target: 500 }, // Maintain spike
            { duration: '30s', target: 50 }, // Return to baseline
            { duration: '2m', target: 50 }, // Maintain baseline
          ],
        },
      ],
      thresholds: {
        http_req_duration: 'p(95)<1000',
        http_req_failed: 'rate<0.02',
      },
    }

    return this.runLoadTest(config)
  }

  /**
   * Generate K6 test script
   */
  private generateK6Script(config: LoadTestConfig, testId: string): string {
    const scriptContent = `
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTrend = new Trend('response_time');

export const options = {
  scenarios: ${JSON.stringify(
    config.scenarios
      ? this.convertScenarios(config.scenarios)
      : {
          default: {
            executor: 'constant-vus',
            vus: config.virtualUsers,
            duration: config.duration,
          },
        },
    null,
    2
  )},
  thresholds: ${JSON.stringify(config.thresholds || {}, null, 2)},
  userAgent: 'CoreFlow360-LoadTester/2.0',
};

const BASE_URL = '${config.target}';

// Test scenarios
const endpoints = [
  { path: '/api/health', method: 'GET', weight: 20 },
  { path: '/api/auth/session', method: 'GET', weight: 15 },
  { path: '/api/customers', method: 'GET', weight: 25 },
  { path: '/api/dashboard/stats', method: 'GET', weight: 20 },
  { path: '/api/metrics', method: 'GET', weight: 10 },
  { path: '/', method: 'GET', weight: 10 }
];

function selectEndpoint() {
  const random = Math.random() * 100;
  let cumulative = 0;
  
  for (const endpoint of endpoints) {
    cumulative += endpoint.weight;
    if (random <= cumulative) {
      return endpoint;
    }
  }
  
  return endpoints[0];
}

export default function() {
  const endpoint = selectEndpoint();
  const url = BASE_URL + endpoint.path;
  
  const params = {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'CoreFlow360-LoadTester/2.0',
      'X-Test-ID': '${testId}',
    },
    timeout: '30s',
  };

  const response = http.request(endpoint.method, url, null, params);
  
  // Record metrics
  responseTrend.add(response.timings.duration);
  errorRate.add(response.status !== 200);
  
  // Checks
  const checkResult = check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 1000ms': (r) => r.timings.duration < 1000,
    'response has body': (r) => r.body && r.body.length > 0,
  });
  
  if (!checkResult) {
    console.error(\`Request failed: \${endpoint.method} \${url} - Status: \${response.status}\`);
  }
  
  // Random sleep between 0.5-2 seconds
  sleep(Math.random() * 1.5 + 0.5);
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: false }),
    'summary.json': JSON.stringify(data, null, 2),
  };
}

function textSummary(data, options = {}) {
  // Custom summary formatter
  const indent = options.indent || '';
  const summary = [];
  
  summary.push(\`\${indent}Test Summary:\`);
  summary.push(\`\${indent}  Total Requests: \${data.metrics.http_reqs.count}\`);
  summary.push(\`\${indent}  Failed Requests: \${data.metrics.http_req_failed.count}\`);
  summary.push(\`\${indent}  Request Rate: \${data.metrics.http_reqs.rate.toFixed(2)} req/s\`);
  summary.push(\`\${indent}  Response Time (avg): \${data.metrics.http_req_duration.avg.toFixed(2)}ms\`);
  summary.push(\`\${indent}  Response Time (p95): \${data.metrics.http_req_duration.p95.toFixed(2)}ms\`);
  
  return summary.join('\\n');
}
`

    const scriptPath = join(this.resultsDir, `test-${testId}.js`)
    writeFileSync(scriptPath, scriptContent)
    return scriptPath
  }

  /**
   * Execute K6 test
   */
  private executeK6Test(scriptPath: string, testId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const outputPath = join(this.resultsDir, `output-${testId}.json`)

      const command = `${this.k6Binary} run --out json=${outputPath} ${scriptPath}`

      try {
        const output = execSync(command, {
          encoding: 'utf8',
          timeout: 30 * 60 * 1000, // 30 minutes timeout
          maxBuffer: 50 * 1024 * 1024, // 50MB buffer
        })
        resolve(output)
      } catch (error: unknown) {
        // K6 might exit with non-zero code even on successful tests
        if (error.stdout) {
          resolve(error.stdout)
        } else {
          reject(error)
        }
      }
    })
  }

  /**
   * Parse K6 output
   */
  private parseK6Output(
    testId: string,
    config: LoadTestConfig,
    startTime: string,
    rawOutput: string
  ): LoadTestResult {
    const endTime = new Date().toISOString()
    const duration = new Date(endTime).getTime() - new Date(startTime).getTime()

    // Try to parse JSON output
    let parsedData: unknown = null
    try {
      const outputPath = join(this.resultsDir, `output-${testId}.json`)
      if (existsSync(outputPath)) {
        const jsonOutput = readFileSync(outputPath, 'utf8')
        parsedData = JSON.parse(jsonOutput)
      }
    } catch (error) {
      logger.warn('Could not parse K6 JSON output', { testId })
    }

    // Extract metrics from raw output
    const summary = this.extractMetricsFromOutput(rawOutput, parsedData)

    return {
      testId,
      config,
      startTime,
      endTime,
      duration,
      summary,
      thresholdsPassed: this.checkThresholds(summary, config.thresholds),
      errors: this.extractErrors(rawOutput),
      rawOutput,
    }
  }

  /**
   * Extract metrics from K6 output
   */
  private extractMetricsFromOutput(rawOutput: string, parsedData?: unknown): LoadTestResult['summary'] {
    const defaultSummary = {
      totalRequests: 0,
      failedRequests: 0,
      avgResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      requestsPerSecond: 0,
      dataTransferred: '0 B',
      errorRate: 0,
    }

    if (parsedData?.metrics) {
      const metrics = parsedData.metrics
      return {
        totalRequests: metrics.http_reqs?.count || 0,
        failedRequests: metrics.http_req_failed?.count || 0,
        avgResponseTime: metrics.http_req_duration?.avg || 0,
        p95ResponseTime: metrics.http_req_duration?.p95 || 0,
        p99ResponseTime: metrics.http_req_duration?.p99 || 0,
        requestsPerSecond: metrics.http_reqs?.rate || 0,
        dataTransferred: this.formatBytes(metrics.data_received?.count || 0),
        errorRate: (metrics.http_req_failed?.rate || 0) * 100,
      }
    }

    // Fallback: parse from raw output using regex
    try {
      const totalReqs = this.extractMetric(rawOutput, /http_reqs.*?(\d+)/)
      const failedReqs = this.extractMetric(rawOutput, /http_req_failed.*?(\d+)/)
      const avgDuration = this.extractMetric(rawOutput, /http_req_duration.*?avg=([0-9.]+)/)
      const p95Duration = this.extractMetric(rawOutput, /http_req_duration.*?p\(95\)=([0-9.]+)/)

      return {
        totalRequests: totalReqs || 0,
        failedRequests: failedReqs || 0,
        avgResponseTime: avgDuration || 0,
        p95ResponseTime: p95Duration || 0,
        p99ResponseTime: 0,
        requestsPerSecond: totalReqs ? totalReqs / 60 : 0, // Rough estimate
        dataTransferred: '0 B',
        errorRate: totalReqs ? (failedReqs / totalReqs) * 100 : 0,
      }
    } catch (error) {
      logger.warn('Could not extract metrics from K6 output')
      return defaultSummary
    }
  }

  /**
   * Get predefined test configurations
   */
  private getTestConfigs(baseUrl: string, environment: string): LoadTestConfig[] {
    const configs: LoadTestConfig[] = []

    if (environment === 'development') {
      configs.push({
        name: 'dev-smoke-test',
        target: baseUrl,
        duration: '30s',
        virtualUsers: 5,
        thresholds: {
          http_req_duration: 'p(95)<2000',
          http_req_failed: 'rate<0.01',
        },
      })
    } else if (environment === 'staging') {
      configs.push(
        {
          name: 'staging-load-test',
          target: baseUrl,
          duration: '2m',
          virtualUsers: 50,
          thresholds: {
            http_req_duration: 'p(95)<1000',
            http_req_failed: 'rate<0.01',
          },
        },
        {
          name: 'staging-burst-test',
          target: baseUrl,
          duration: '3m',
          virtualUsers: 100,
          scenarios: [
            {
              name: 'burst',
              weight: 100,
              executor: 'ramping-vus',
              stages: [
                { duration: '30s', target: 20 },
                { duration: '1m', target: 100 },
                { duration: '30s', target: 100 },
                { duration: '1m', target: 0 },
              ],
            },
          ],
        }
      )
    } else {
      configs.push(
        {
          name: 'prod-baseline-test',
          target: baseUrl,
          duration: '5m',
          virtualUsers: 100,
          thresholds: {
            http_req_duration: 'p(95)<500',
            http_req_failed: 'rate<0.005',
          },
        },
        {
          name: 'prod-load-test',
          target: baseUrl,
          duration: '10m',
          virtualUsers: 300,
          thresholds: {
            http_req_duration: 'p(95)<1000',
            http_req_failed: 'rate<0.01',
          },
        }
      )
    }

    return configs
  }

  /**
   * Utility methods
   */

  private ensureDirectoryExists(): void {
    if (!existsSync(this.resultsDir)) {
      mkdirSync(this.resultsDir, { recursive: true })
    }
  }

  private validateK6Installation(): void {
    try {
      execSync('k6 version', { stdio: 'ignore' })
    } catch (error) {
      logger.warn('K6 not found in PATH. Load testing will use alternative method.')
      this.k6Binary = 'npx k6' // Try npx as fallback
    }
  }

  private generateTestId(testName: string): string {
    return `${testName}_${Date.now()}_${Math.random().toString(36).substring(7)}`
  }

  private convertScenarios(scenarios: LoadTestScenario[]): Record<string, unknown> {
    const k6Scenarios: Record<string, unknown> = {}

    scenarios.forEach((scenario) => {
      k6Scenarios[scenario.name] = {
        executor: scenario.executor,
        ...(scenario.stages && { stages: scenario.stages }),
        ...(scenario.env && { env: scenario.env }),
        ...(scenario.tags && { tags: scenario.tags }),
      }
    })

    return k6Scenarios
  }

  private checkThresholds(
    summary: LoadTestResult['summary'],
    thresholds?: LoadTestThresholds
  ): boolean {
    if (!thresholds) return true

    // Simple threshold checking (would be more sophisticated in real implementation)
    if (thresholds.http_req_failed) {
      const maxErrorRate = parseFloat(thresholds.http_req_failed.replace('rate<', ''))
      if (summary.errorRate > maxErrorRate * 100) return false
    }

    if (thresholds.http_req_duration) {
      const maxDuration = parseFloat(thresholds.http_req_duration.replace('p(95)<', ''))
      if (summary.p95ResponseTime > maxDuration) return false
    }

    return true
  }

  private extractErrors(
    rawOutput: string
  ): Array<{ type: string; count: number; message: string }> {
    const errors: Array<{ type: string; count: number; message: string }> = []

    // Parse error patterns from K6 output
    const errorPatterns = [/(\d+) network errors/, /(\d+) timeout errors/, /(\d+) HTTP errors/]

    errorPatterns.forEach((pattern) => {
      const match = rawOutput.match(pattern)
      if (match) {
        errors.push({
          type: pattern.source.includes('network')
            ? 'network'
            : pattern.source.includes('timeout')
              ? 'timeout'
              : 'http',
          count: parseInt(match[1]),
          message: match[0],
        })
      }
    })

    return errors
  }

  private extractMetric(output: string, pattern: RegExp): number | null {
    const match = output.match(pattern)
    return match ? parseFloat(match[1]) : null
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  private saveTestResult(result: LoadTestResult): void {
    const filePath = join(this.resultsDir, `result-${result.testId}.json`)
    writeFileSync(filePath, JSON.stringify(result, null, 2))
  }

  private generateTestReport(results: LoadTestResult[]): void {
    const reportPath = join(this.resultsDir, `report-${Date.now()}.html`)

    const html = this.generateHTMLReport(results)
    writeFileSync(reportPath, html)

    logger.info('Load test report generated', {
      reportPath,
      totalTests: results.length,
      passedTests: results.filter((r) => r.thresholdsPassed).length,
    })
  }

  private generateHTMLReport(results: LoadTestResult[]): string {
    const passedTests = results.filter((r) => r.thresholdsPassed).length
    const totalTests = results.length

    return `
<!DOCTYPE html>
<html>
<head>
    <title>CoreFlow360 Load Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .metric { background: white; border: 1px solid #ddd; padding: 15px; border-radius: 5px; flex: 1; }
        .test-result { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .passed { border-left: 5px solid #4CAF50; }
        .failed { border-left: 5px solid #f44336; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
    </style>
</head>
<body>
    <div class="header">
        <h1>CoreFlow360 Load Test Report</h1>
        <p>Generated: ${new Date().toISOString()}</p>
        <p>Tests Passed: ${passedTests}/${totalTests}</p>
    </div>

    <div class="summary">
        <div class="metric">
            <h3>Total Requests</h3>
            <p>${results.reduce((sum, r) => sum + r.summary.totalRequests, 0)}</p>
        </div>
        <div class="metric">
            <h3>Average Response Time</h3>
            <p>${(results.reduce((sum, r) => sum + r.summary.avgResponseTime, 0) / results.length).toFixed(2)}ms</p>
        </div>
        <div class="metric">
            <h3>Error Rate</h3>
            <p>${(results.reduce((sum, r) => sum + r.summary.errorRate, 0) / results.length).toFixed(2)}%</p>
        </div>
    </div>

    ${results
      .map(
        (result) => `
        <div class="test-result ${result.thresholdsPassed ? 'passed' : 'failed'}">
            <h3>${result.config.name} ${result.thresholdsPassed ? '✅' : '❌'}</h3>
            <table>
                <tr><th>Metric</th><th>Value</th></tr>
                <tr><td>Duration</td><td>${(result.duration / 1000).toFixed(2)}s</td></tr>
                <tr><td>Virtual Users</td><td>${result.config.virtualUsers}</td></tr>
                <tr><td>Total Requests</td><td>${result.summary.totalRequests}</td></tr>
                <tr><td>Failed Requests</td><td>${result.summary.failedRequests}</td></tr>
                <tr><td>Requests/sec</td><td>${result.summary.requestsPerSecond.toFixed(2)}</td></tr>
                <tr><td>Avg Response Time</td><td>${result.summary.avgResponseTime.toFixed(2)}ms</td></tr>
                <tr><td>P95 Response Time</td><td>${result.summary.p95ResponseTime.toFixed(2)}ms</td></tr>
                <tr><td>Error Rate</td><td>${result.summary.errorRate.toFixed(2)}%</td></tr>
            </table>
        </div>
    `
      )
      .join('')}
</body>
</html>`
  }

  /**
   * Get test results
   */
  getTestResults(): LoadTestResult[] {
    return [...this.testResults]
  }

  /**
   * Clean up old test results
   */
  cleanupOldResults(daysToKeep: number = 7): void {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    this.testResults = this.testResults.filter((result) => new Date(result.startTime) > cutoffDate)
  }
}

// Export singleton instance
export const loadTester = new LoadTestingFramework()

/**
 * Quick load test runner
 */
export async function runQuickLoadTest(
  baseUrl: string,
  virtualUsers: number = 10,
  duration: string = '1m'
): Promise<LoadTestResult> {
  const config: LoadTestConfig = {
    name: 'quick-test',
    target: baseUrl,
    duration,
    virtualUsers,
    thresholds: {
      http_req_duration: 'p(95)<1000',
      http_req_failed: 'rate<0.01',
    },
  }

  return loadTester.runLoadTest(config)
}
