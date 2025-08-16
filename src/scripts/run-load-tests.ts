#!/usr/bin/env tsx
/**
 * CoreFlow360 - Load Test Runner Script
 * Execute load tests for different environments and scenarios
 */

import { loadTester, LoadTestConfig } from '../lib/testing/load-testing'
import { logger } from '../lib/logging/logger'

interface TestSuiteConfig {
  environment: 'development' | 'staging' | 'production'
  baseUrl: string
  runStressTest?: boolean
  runSpikeTest?: boolean
  customTests?: LoadTestConfig[]
}

async function main() {
  const args = process.argv.slice(2)
  const environment = (args[0] as 'development' | 'staging' | 'production') || 'development'
  const baseUrl = args[1] || getDefaultBaseUrl(environment)
  
  console.log('🚀 Starting CoreFlow360 Load Test Suite')
  console.log(`Environment: ${environment}`)
  console.log(`Target URL: ${baseUrl}`)
  console.log('=' * 50)

  try {
    const config: TestSuiteConfig = {
      environment,
      baseUrl,
      runStressTest: environment !== 'production', // Don't stress test production by default
      runSpikeTest: true
    }

    await runTestSuite(config)
    
  } catch (error) {
    console.error('❌ Load test suite failed:', error)
    process.exit(1)
  }
}

async function runTestSuite(config: TestSuiteConfig) {
  const startTime = Date.now()
  
  logger.info('Starting load test suite', {
    environment: config.environment,
    baseUrl: config.baseUrl,
    component: 'load_testing'
  })

  try {
    // 1. Run standard load tests
    console.log('📊 Running standard load tests...')
    const standardResults = await loadTester.runTestSuite(config.baseUrl, config.environment)
    
    let passedTests = standardResults.filter(r => r.thresholdsPassed).length
    let totalTests = standardResults.length

    console.log(`✅ Standard tests completed: ${passedTests}/${totalTests} passed`)

    // 2. Run stress test if enabled
    if (config.runStressTest) {
      console.log('💪 Running stress test...')
      const stressResult = await loadTester.runStressTest(config.baseUrl, getMaxVUsForEnvironment(config.environment))
      
      totalTests++
      if (stressResult.thresholdsPassed) passedTests++
      
      console.log(`${stressResult.thresholdsPassed ? '✅' : '❌'} Stress test completed`)
      console.log(`   Max users handled: ${stressResult.config.virtualUsers}`)
      console.log(`   Error rate: ${stressResult.summary.errorRate.toFixed(2)}%`)
    }

    // 3. Run spike test if enabled
    if (config.runSpikeTest) {
      console.log('⚡ Running spike test...')
      const spikeResult = await loadTester.runSpikeTest(config.baseUrl)
      
      totalTests++
      if (spikeResult.thresholdsPassed) passedTests++
      
      console.log(`${spikeResult.thresholdsPassed ? '✅' : '❌'} Spike test completed`)
      console.log(`   Peak response time (P95): ${spikeResult.summary.p95ResponseTime.toFixed(2)}ms`)
    }

    // 4. Run custom tests if provided
    if (config.customTests) {
      console.log('🛠️ Running custom tests...')
      for (const testConfig of config.customTests) {
        const result = await loadTester.runLoadTest(testConfig)
        totalTests++
        if (result.thresholdsPassed) passedTests++
        console.log(`${result.thresholdsPassed ? '✅' : '❌'} ${testConfig.name} completed`)
      }
    }

    // 5. Generate summary
    const duration = Date.now() - startTime
    console.log('=' * 50)
    console.log('📋 LOAD TEST SUMMARY')
    console.log('=' * 50)
    console.log(`Total Tests: ${totalTests}`)
    console.log(`Passed: ${passedTests}`)
    console.log(`Failed: ${totalTests - passedTests}`)
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`)
    console.log(`Total Duration: ${(duration / 1000).toFixed(1)}s`)
    
    // 6. Performance recommendations
    generatePerformanceRecommendations(loadTester.getTestResults())

    // 7. Log completion
    logger.info('Load test suite completed', {
      totalTests,
      passedTests,
      successRate: (passedTests / totalTests) * 100,
      duration,
      component: 'load_testing'
    })

    if (passedTests < totalTests) {
      console.log('\n⚠️  Some tests failed. Check the detailed reports for analysis.')
      process.exit(1)
    } else {
      console.log('\n🎉 All tests passed! Your application is ready for production load.')
    }

  } catch (error) {
    logger.error('Load test suite execution failed', error as Error, {
      component: 'load_testing'
    })
    throw error
  }
}

function getDefaultBaseUrl(environment: string): string {
  switch (environment) {
    case 'development':
      return 'http://localhost:3000'
    case 'staging':
      return 'https://staging.coreflow360.com'
    case 'production':
      return 'https://coreflow360.com'
    default:
      return 'http://localhost:3000'
  }
}

function getMaxVUsForEnvironment(environment: string): number {
  switch (environment) {
    case 'development':
      return 50
    case 'staging':
      return 500
    case 'production':
      return 1000
    default:
      return 50
  }
}

function generatePerformanceRecommendations(results: any[]) {
  console.log('\n🔍 PERFORMANCE ANALYSIS & RECOMMENDATIONS')
  console.log('-' * 50)

  const allResults = results.filter(r => r.summary)
  if (allResults.length === 0) {
    console.log('No performance data available for analysis.')
    return
  }

  // Calculate averages
  const avgResponseTime = allResults.reduce((sum, r) => sum + r.summary.avgResponseTime, 0) / allResults.length
  const avgP95 = allResults.reduce((sum, r) => sum + r.summary.p95ResponseTime, 0) / allResults.length
  const avgErrorRate = allResults.reduce((sum, r) => sum + r.summary.errorRate, 0) / allResults.length
  const maxRPS = Math.max(...allResults.map(r => r.summary.requestsPerSecond))

  console.log(`Average Response Time: ${avgResponseTime.toFixed(2)}ms`)
  console.log(`Average P95 Response Time: ${avgP95.toFixed(2)}ms`)
  console.log(`Average Error Rate: ${avgErrorRate.toFixed(2)}%`)
  console.log(`Peak Requests/Second: ${maxRPS.toFixed(2)}`)

  // Generate recommendations
  const recommendations: string[] = []

  if (avgResponseTime > 500) {
    recommendations.push('🐌 Average response time is high (>500ms). Consider optimizing database queries and adding caching.')
  }

  if (avgP95 > 1000) {
    recommendations.push('⏰ P95 response time is concerning (>1s). Investigate slow endpoints and optimize critical paths.')
  }

  if (avgErrorRate > 1) {
    recommendations.push('🚨 Error rate is above 1%. Review error logs and improve error handling.')
  }

  if (maxRPS < 50) {
    recommendations.push('📊 Request throughput is low (<50 RPS). Consider optimizing server configuration and scaling strategy.')
  }

  // Memory and resource recommendations
  recommendations.push('💾 Monitor memory usage during peak load to prevent OOM errors.')
  recommendations.push('🔄 Implement connection pooling for database and external services.')
  recommendations.push('⚡ Add CDN for static assets to reduce server load.')
  recommendations.push('📈 Set up auto-scaling based on CPU and memory metrics.')

  if (recommendations.length > 0) {
    console.log('\n💡 Recommendations:')
    recommendations.forEach((rec, i) => console.log(`${i + 1}. ${rec}`))
  } else {
    console.log('\n✨ Performance looks good! No immediate optimizations needed.')
  }
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error)
}

export { runTestSuite }