/**
 * CoreFlow360 - Anomaly Detection System Test Script
 * Comprehensive testing of the anomaly detection system
 */

import { AdvancedAnomalyDetector, type DataPoint } from '@/lib/anomaly/advanced-anomaly-detector'
import { BusinessAnomalyMonitor } from '@/lib/anomaly/business-anomaly-monitor'

interface TestResult {
  testName: string
  passed: boolean
  details: string
  metrics?: any
}

class AnomalyTestSuite {
  private results: TestResult[] = []

  log(message: string) {
    console.log(`[ANOMALY TEST] ${message}`)
  }

  addResult(testName: string, passed: boolean, details: string, metrics?: any) {
    this.results.push({ testName, passed, details, metrics })
    const status = passed ? '✅ PASS' : '❌ FAIL'
    this.log(`${status}: ${testName} - ${details}`)
  }

  async runAllTests() {
    this.log('Starting Anomaly Detection System Test Suite...')
    
    await this.testBasicAnomalyDetection()
    await this.testStatisticalMethods()
    await this.testSeasonalPatterns()
    await this.testBusinessMonitoring()
    await this.testAlertSystem()
    await this.testPatternDetection()
    await this.testAPICompatibility()
    
    this.generateReport()
  }

  async testBasicAnomalyDetection() {
    this.log('Testing basic anomaly detection...')
    
    try {
      const detector = new AdvancedAnomalyDetector({
        sensitivity: 0.95,
        algorithms: ['statistical']
      })

      // Create normal data with one obvious outlier
      const normalData: DataPoint[] = []
      const now = new Date()
      
      for (let i = 0; i < 30; i++) {
        normalData.push({
          timestamp: new Date(now.getTime() - i * 24 * 60 * 60 * 1000),
          value: 100 + Math.random() * 10 // Normal range: 100-110
        })
      }

      // Add obvious anomaly
      const anomalyData: DataPoint[] = [{
        timestamp: new Date(),
        value: 500 // Obvious outlier
      }]

      detector.addHistoricalData('test_metric', normalData)
      const results = detector.detectAnomalies('test_metric', anomalyData)

      const anomalyDetected = results[0].isAnomaly
      const anomalyScore = results[0].anomalyScore

      this.addResult(
        'Basic Anomaly Detection',
        anomalyDetected && anomalyScore > 0.8,
        `Anomaly detected: ${anomalyDetected}, Score: ${anomalyScore.toFixed(3)}`,
        { anomalyScore, severity: results[0].severity }
      )

    } catch (error) {
      this.addResult(
        'Basic Anomaly Detection',
        false,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async testStatisticalMethods() {
    this.log('Testing statistical detection methods...')
    
    try {
      const detector = new AdvancedAnomalyDetector({
        algorithms: ['statistical', 'isolation_forest']
      })

      // Generate data with known statistical properties
      const data: DataPoint[] = []
      const mean = 100
      const stdDev = 10
      
      // Generate normal data
      for (let i = 0; i < 50; i++) {
        const value = mean + (Math.random() - 0.5) * 2 * stdDev * 0.5 // Within 1 std dev
        data.push({
          timestamp: new Date(Date.now() - i * 60000),
          value
        })
      }

      // Add statistical outlier (beyond 3 standard deviations)
      const outlier: DataPoint = {
        timestamp: new Date(),
        value: mean + 4 * stdDev // 4 std devs from mean
      }

      detector.addHistoricalData('statistical_test', data)
      const results = detector.detectAnomalies('statistical_test', [outlier])

      const detected = results[0].isAnomaly
      const confidence = results[0].confidence

      this.addResult(
        'Statistical Methods',
        detected && confidence > 0.7,
        `Statistical outlier detected: ${detected}, Confidence: ${confidence.toFixed(3)}`,
        { confidence, algorithm: results[0].algorithm }
      )

    } catch (error) {
      this.addResult(
        'Statistical Methods',
        false,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async testSeasonalPatterns() {
    this.log('Testing seasonal pattern detection...')
    
    try {
      const detector = new AdvancedAnomalyDetector({
        algorithms: ['ensemble'],
        businessContext: {
          seasonality: ['weekly']
        }
      })

      // Generate weekly seasonal data
      const seasonalData: DataPoint[] = []
      const baseValue = 1000
      
      for (let i = 0; i < 21; i++) { // 3 weeks of data
        const dayOfWeek = i % 7
        const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 0.7 : 1.0
        const seasonalValue = baseValue * weekendMultiplier
        
        seasonalData.push({
          timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
          value: seasonalValue + Math.random() * 50
        })
      }

      // Test normal seasonal variation (should not be flagged)
      const normalWeekendValue: DataPoint = {
        timestamp: new Date(),
        value: baseValue * 0.7 + 25 // Normal weekend value
      }

      // Test seasonal anomaly
      const seasonalAnomaly: DataPoint = {
        timestamp: new Date(),
        value: baseValue * 1.5 // Much higher than expected
      }

      detector.addHistoricalData('seasonal_test', seasonalData)
      const normalResult = detector.detectAnomalies('seasonal_test', [normalWeekendValue])
      const anomalyResult = detector.detectAnomalies('seasonal_test', [seasonalAnomaly])

      const normalNotFlagged = !normalResult[0].isAnomaly
      const anomalyFlagged = anomalyResult[0].isAnomaly

      this.addResult(
        'Seasonal Pattern Detection',
        normalNotFlagged && anomalyFlagged,
        `Normal seasonal: ${!normalNotFlagged}, Seasonal anomaly: ${anomalyFlagged}`,
        { 
          normalScore: normalResult[0].anomalyScore,
          anomalyScore: anomalyResult[0].anomalyScore
        }
      )

    } catch (error) {
      this.addResult(
        'Seasonal Pattern Detection',
        false,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async testBusinessMonitoring() {
    this.log('Testing business anomaly monitoring...')
    
    try {
      const monitor = new BusinessAnomalyMonitor()
      const metrics = monitor.getMetrics()

      // Test that all core business metrics are initialized
      const expectedMetrics = [
        'daily_revenue',
        'new_subscriptions', 
        'churn_rate',
        'active_users',
        'api_response_time',
        'error_rate'
      ]

      const allMetricsPresent = expectedMetrics.every(
        metricName => metrics.some(m => m.name === metricName)
      )

      // Test monitoring a metric
      const testData: DataPoint[] = [{
        timestamp: new Date(),
        value: 50000 // High revenue (potential anomaly)
      }]

      const anomalies = await monitor.monitorMetric('daily_revenue', testData)
      const monitoringWorks = anomalies.length > 0

      this.addResult(
        'Business Monitoring',
        allMetricsPresent && monitoringWorks,
        `Metrics initialized: ${allMetricsPresent}, Monitoring works: ${monitoringWorks}`,
        { 
          metricsCount: metrics.length,
          anomaliesDetected: anomalies.filter(a => a.isAnomaly).length
        }
      )

    } catch (error) {
      this.addResult(
        'Business Monitoring',
        false,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async testAlertSystem() {
    this.log('Testing alert system...')
    
    try {
      const monitor = new BusinessAnomalyMonitor()

      // Get initial alert count
      const initialAlerts = monitor.getActiveAlerts()
      const initialCount = initialAlerts.length

      // Generate data that should trigger an alert
      const criticalData: DataPoint[] = [{
        timestamp: new Date(),
        value: 15 // High churn rate (should trigger alert)
      }]

      await monitor.monitorMetric('churn_rate', criticalData)
      
      // Check if alert was generated
      const finalAlerts = monitor.getActiveAlerts()
      const alertGenerated = finalAlerts.length > initialCount

      // Test alert acknowledgment
      let acknowledgmentWorks = false
      if (alertGenerated) {
        const alertId = finalAlerts[finalAlerts.length - 1].id
        acknowledgmentWorks = monitor.acknowledgeAlert(alertId, 'test_user')
      }

      this.addResult(
        'Alert System',
        alertGenerated && acknowledgmentWorks,
        `Alert generated: ${alertGenerated}, Acknowledgment works: ${acknowledgmentWorks}`,
        { 
          initialAlerts: initialCount,
          finalAlerts: finalAlerts.length,
          alertGenerated
        }
      )

    } catch (error) {
      this.addResult(
        'Alert System',
        false,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async testPatternDetection() {
    this.log('Testing pattern detection...')
    
    try {
      const detector = new AdvancedAnomalyDetector()

      // Create data with spike pattern
      const spikeData: DataPoint[] = []
      const baseValue = 100
      
      for (let i = 0; i < 20; i++) {
        // Add several spikes
        const value = (i % 5 === 0) ? baseValue * 3 : baseValue + Math.random() * 10
        spikeData.push({
          timestamp: new Date(Date.now() - i * 60000),
          value
        })
      }

      const anomalies = detector.detectAnomalies('pattern_test', spikeData)
      const patterns = detector.detectPatterns(anomalies)

      const spikePatternDetected = patterns.some(p => p.type === 'spike')
      const patternsFound = patterns.length > 0

      this.addResult(
        'Pattern Detection',
        spikePatternDetected && patternsFound,
        `Spike pattern detected: ${spikePatternDetected}, Total patterns: ${patterns.length}`,
        { 
          patterns: patterns.map(p => p.type),
          anomaliesAnalyzed: anomalies.length
        }
      )

    } catch (error) {
      this.addResult(
        'Pattern Detection',
        false,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async testAPICompatibility() {
    this.log('Testing API compatibility...')
    
    try {
      // Test that our classes can be serialized/deserialized (important for API responses)
      const detector = new AdvancedAnomalyDetector()
      
      const testData: DataPoint[] = [{
        timestamp: new Date(),
        value: 100
      }]

      const results = detector.detectAnomalies('api_test', testData)
      
      // Test JSON serialization
      const serialized = JSON.stringify(results)
      const deserialized = JSON.parse(serialized)
      
      const serializationWorks = deserialized.length === results.length
      const hasRequiredFields = deserialized[0] && 
        typeof deserialized[0].isAnomaly === 'boolean' &&
        typeof deserialized[0].anomalyScore === 'number'

      this.addResult(
        'API Compatibility',
        serializationWorks && hasRequiredFields,
        `Serialization works: ${serializationWorks}, Required fields present: ${hasRequiredFields}`,
        { 
          originalLength: results.length,
          deserializedLength: deserialized.length
        }
      )

    } catch (error) {
      this.addResult(
        'API Compatibility',
        false,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  generateReport() {
    this.log('\n' + '='.repeat(60))
    this.log('ANOMALY DETECTION SYSTEM TEST REPORT')
    this.log('='.repeat(60))
    
    const totalTests = this.results.length
    const passedTests = this.results.filter(r => r.passed).length
    const failedTests = totalTests - passedTests
    const successRate = (passedTests / totalTests * 100).toFixed(1)
    
    this.log(`Total Tests: ${totalTests}`)
    this.log(`Passed: ${passedTests}`)
    this.log(`Failed: ${failedTests}`)
    this.log(`Success Rate: ${successRate}%`)
    
    this.log('\nDETAILED RESULTS:')
    this.log('-'.repeat(40))
    
    this.results.forEach((result, index) => {
      const status = result.passed ? '✅' : '❌'
      this.log(`${index + 1}. ${status} ${result.testName}`)
      this.log(`   ${result.details}`)
      if (result.metrics) {
        this.log(`   Metrics: ${JSON.stringify(result.metrics, null, 2)}`)
      }
      this.log('')
    })
    
    if (failedTests > 0) {
      this.log('⚠️  SOME TESTS FAILED - Please review the anomaly detection implementation')
    } else {
      this.log('🎉 ALL TESTS PASSED - Anomaly detection system is working correctly!')
    }
    
    this.log('='.repeat(60))
  }
}

// Run the test suite
async function runAnomalyTests() {
  const testSuite = new AnomalyTestSuite()
  await testSuite.runAllTests()
}

// Export for use in other contexts
export { AnomalyTestSuite, runAnomalyTests }

// Run if executed directly
if (require.main === module) {
  runAnomalyTests().catch(console.error)
}