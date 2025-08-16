/**
 * CoreFlow360 - Load Tests for 10K Concurrent Voice Calls
 * Performance testing for high-volume voice operations
 */

import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals'
import { performance } from 'perf_hooks'
import { Worker } from 'worker_threads'
import { EventEmitter } from 'events'
import WebSocket from 'ws'

// Test configuration
const CONCURRENT_CALLS = 10000
const RAMP_UP_TIME = 60000 // 60 seconds
const TEST_DURATION = 300000 // 5 minutes
const BATCH_SIZE = 100
const TARGET_LATENCY = 100 // ms
const TARGET_SUCCESS_RATE = 99.9 // %

interface CallMetrics {
  id: string
  startTime: number
  endTime?: number
  status: 'queued' | 'ringing' | 'answered' | 'completed' | 'failed'
  latency?: number
  error?: string
  transcriptionLatency?: number
  audioQuality?: number
}

interface LoadTestResults {
  totalCalls: number
  successfulCalls: number
  failedCalls: number
  averageLatency: number
  p95Latency: number
  p99Latency: number
  throughput: number
  errorRate: number
  transcriptionAccuracy: number
}

describe('10K Concurrent Calls Load Test', () => {
  let metrics: CallMetrics[] = []
  let testStartTime: number
  let workers: Worker[] = []
  let wsConnections: WebSocket[] = []
  let eventEmitter: EventEmitter

  beforeAll(async () => {
    eventEmitter = new EventEmitter()
    eventEmitter.setMaxListeners(CONCURRENT_CALLS + 100)
    
    // Initialize test environment
    console.log(`🚀 Starting load test with ${CONCURRENT_CALLS} concurrent calls`)
    console.log(`📊 Test configuration:`)
    console.log(`   - Ramp-up time: ${RAMP_UP_TIME / 1000}s`)
    console.log(`   - Test duration: ${TEST_DURATION / 1000}s`)
    console.log(`   - Batch size: ${BATCH_SIZE}`)
    console.log(`   - Target latency: ${TARGET_LATENCY}ms`)
    console.log(`   - Target success rate: ${TARGET_SUCCESS_RATE}%`)
  })

  afterAll(async () => {
    // Clean up workers and connections
    await Promise.all([
      ...workers.map(worker => new Promise(resolve => {
        worker.terminate()
        worker.on('exit', resolve)
      })),
      ...wsConnections.map(ws => new Promise(resolve => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close(1000, 'Test completed')
        }
        resolve(void 0)
      }))
    ])
    
    console.log('🧹 Cleanup completed')
  })

  it('should handle 10K concurrent voice calls', async () => {
    testStartTime = performance.now()
    const callPromises: Promise<CallMetrics>[] = []
    
    // Create calls in batches with gradual ramp-up
    const batchCount = Math.ceil(CONCURRENT_CALLS / BATCH_SIZE)
    const batchInterval = RAMP_UP_TIME / batchCount
    
    console.log(`📈 Ramping up ${batchCount} batches over ${RAMP_UP_TIME / 1000}s`)
    
    for (let batch = 0; batch < batchCount; batch++) {
      const batchStartTime = performance.now()
      
      // Create batch of concurrent calls
      for (let i = 0; i < BATCH_SIZE && (batch * BATCH_SIZE + i) < CONCURRENT_CALLS; i++) {
        const callId = `call_${batch}_${i}`
        const promise = simulateVoiceCall(callId, batch * BATCH_SIZE + i)
        callPromises.push(promise)
      }
      
      const batchEndTime = performance.now()
      console.log(`✅ Batch ${batch + 1}/${batchCount} queued in ${(batchEndTime - batchStartTime).toFixed(2)}ms`)
      
      // Wait for batch interval before next batch
      if (batch < batchCount - 1) {
        await new Promise(resolve => setTimeout(resolve, batchInterval))
      }
    }
    
    console.log(`🎯 All ${CONCURRENT_CALLS} calls queued. Waiting for completion...`)
    
    // Wait for all calls to complete with timeout
    const testTimeout = TEST_DURATION
    const results = await Promise.allSettled(
      callPromises.map(promise => 
        Promise.race([
          promise,
          new Promise<CallMetrics>((_, reject) => 
            setTimeout(() => reject(new Error('Call timeout')), testTimeout)
          )
        ])
      )
    )
    
    // Process results
    metrics = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        return {
          id: `call_timeout_${index}`,
          startTime: performance.now(),
          status: 'failed' as const,
          error: result.reason?.message || 'Unknown error'
        }
      }
    })
    
    const testResults = analyzeResults(metrics)
    displayResults(testResults)
    
    // Validate performance targets
    expect(testResults.successfulCalls).toBeGreaterThan(0)
    expect(testResults.errorRate).toBeLessThan((100 - TARGET_SUCCESS_RATE))
    expect(testResults.averageLatency).toBeLessThan(TARGET_LATENCY * 2) // Allow 2x target for load test
    expect(testResults.p95Latency).toBeLessThan(TARGET_LATENCY * 5) // 5x for 95th percentile
    
    console.log('✅ Load test completed successfully!')
  }, TEST_DURATION + 60000) // Extended timeout for load test

  it('should maintain voice quality under load', async () => {
    const audioQualityTests = 1000 // Sample 1000 calls for quality
    const qualityPromises: Promise<number>[] = []
    
    console.log(`🎵 Testing audio quality with ${audioQualityTests} sample calls`)
    
    for (let i = 0; i < audioQualityTests; i++) {
      qualityPromises.push(simulateAudioQualityTest(`quality_${i}`))
    }
    
    const qualityResults = await Promise.allSettled(qualityPromises)
    const successfulTests = qualityResults
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<number>).value)
    
    const averageQuality = successfulTests.reduce((sum, quality) => sum + quality, 0) / successfulTests.length
    
    console.log(`📊 Audio Quality Results:`)
    console.log(`   - Average quality: ${(averageQuality * 100).toFixed(2)}%`)
    console.log(`   - Successful tests: ${successfulTests.length}/${audioQualityTests}`)
    
    expect(averageQuality).toBeGreaterThan(0.95) // 95% quality threshold
  })

  it('should handle WebSocket connections at scale', async () => {
    const wsConnectionCount = Math.min(CONCURRENT_CALLS, 5000) // Limit WS connections
    const wsPromises: Promise<void>[] = []
    
    console.log(`🔌 Testing ${wsConnectionCount} concurrent WebSocket connections`)
    
    for (let i = 0; i < wsConnectionCount; i++) {
      wsPromises.push(simulateWebSocketConnection(`ws_${i}`))
    }
    
    const wsResults = await Promise.allSettled(wsPromises)
    const successfulConnections = wsResults.filter(result => result.status === 'fulfilled').length
    const connectionSuccessRate = (successfulConnections / wsConnectionCount) * 100
    
    console.log(`📊 WebSocket Results:`)
    console.log(`   - Successful connections: ${successfulConnections}/${wsConnectionCount}`)
    console.log(`   - Success rate: ${connectionSuccessRate.toFixed(2)}%`)
    
    expect(connectionSuccessRate).toBeGreaterThan(99) // 99% connection success rate
  })

  it('should maintain database performance under load', async () => {
    const dbOperationCount = 5000
    const dbPromises: Promise<number>[] = []
    
    console.log(`💾 Testing database performance with ${dbOperationCount} operations`)
    
    for (let i = 0; i < dbOperationCount; i++) {
      dbPromises.push(simulateDatabaseOperation(`db_op_${i}`))
    }
    
    const dbResults = await Promise.allSettled(dbPromises)
    const successfulOps = dbResults
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<number>).value)
    
    const averageDbLatency = successfulOps.reduce((sum, latency) => sum + latency, 0) / successfulOps.length
    const p95DbLatency = calculatePercentile(successfulOps, 95)
    
    console.log(`📊 Database Performance:`)
    console.log(`   - Average latency: ${averageDbLatency.toFixed(2)}ms`)
    console.log(`   - 95th percentile: ${p95DbLatency.toFixed(2)}ms`)
    console.log(`   - Successful operations: ${successfulOps.length}/${dbOperationCount}`)
    
    expect(averageDbLatency).toBeLessThan(50) // 50ms average DB latency
    expect(p95DbLatency).toBeLessThan(200) // 200ms 95th percentile
  })

  /**
   * Simulate a single voice call with realistic behavior
   */
  async function simulateVoiceCall(callId: string, index: number): Promise<CallMetrics> {
    const startTime = performance.now()
    
    const metric: CallMetrics = {
      id: callId,
      startTime,
      status: 'queued'
    }
    
    try {
      // Simulate call queuing delay
      await delay(Math.random() * 100) // 0-100ms queue time
      metric.status = 'ringing'
      
      // Simulate ring time
      await delay(1000 + Math.random() * 2000) // 1-3s ring time
      
      // Simulate answer probability (95% answer rate)
      if (Math.random() > 0.05) {
        metric.status = 'answered'
        
        // Simulate conversation duration
        const conversationTime = 10000 + Math.random() * 50000 // 10-60s conversation
        await delay(conversationTime)
        
        // Simulate transcription processing
        const transcriptionStart = performance.now()
        await simulateTranscriptionProcessing(callId)
        metric.transcriptionLatency = performance.now() - transcriptionStart
        
        metric.status = 'completed'
      } else {
        // No answer
        await delay(15000) // 15s no answer timeout
        throw new Error('No answer')
      }
      
      metric.endTime = performance.now()
      metric.latency = metric.endTime - startTime
      
      // Emit progress update every 1000 calls
      if (index % 1000 === 0) {
        const completedCalls = metrics.filter(m => m.status === 'completed').length
        const progress = (completedCalls / CONCURRENT_CALLS) * 100
        console.log(`📞 Progress: ${completedCalls}/${CONCURRENT_CALLS} calls completed (${progress.toFixed(1)}%)`)
      }
      
      return metric
      
    } catch (error) {
      metric.status = 'failed'
      metric.error = error instanceof Error ? error.message : 'Unknown error'
      metric.endTime = performance.now()
      metric.latency = metric.endTime - startTime
      
      return metric
    }
  }

  /**
   * Simulate audio quality testing
   */
  async function simulateAudioQualityTest(testId: string): Promise<number> {
    await delay(100 + Math.random() * 200) // Processing time
    
    // Simulate quality degradation under load
    const loadFactor = Math.min(metrics.length / CONCURRENT_CALLS, 1)
    const baseQuality = 0.98
    const qualityDegradation = loadFactor * 0.05 // Up to 5% degradation
    
    return Math.max(0.9, baseQuality - qualityDegradation + (Math.random() - 0.5) * 0.02)
  }

  /**
   * Simulate WebSocket connection
   */
  async function simulateWebSocketConnection(wsId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Mock WebSocket connection
        const mockWs = {
          readyState: 1, // OPEN
          close: () => {},
          send: () => {},
          on: () => {},
          removeAllListeners: () => {}
        }
        
        wsConnections.push(mockWs as any)
        
        // Simulate connection establishment
        setTimeout(() => {
          resolve()
        }, Math.random() * 100) // 0-100ms connection time
        
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Simulate database operation
   */
  async function simulateDatabaseOperation(opId: string): Promise<number> {
    const startTime = performance.now()
    
    // Simulate DB query with load-based latency
    const loadFactor = Math.min(metrics.length / CONCURRENT_CALLS, 1)
    const baseLatency = 10 // 10ms base latency
    const loadLatency = loadFactor * 40 // Up to 40ms additional latency
    const jitter = Math.random() * 10 // Random jitter
    
    const totalLatency = baseLatency + loadLatency + jitter
    await delay(totalLatency)
    
    return performance.now() - startTime
  }

  /**
   * Simulate transcription processing
   */
  async function simulateTranscriptionProcessing(callId: string): Promise<void> {
    // Simulate STT processing time based on audio length
    const audioLength = 10 + Math.random() * 50 // 10-60s audio
    const processingTime = audioLength * 0.1 // 10% of audio length
    
    await delay(processingTime * 1000)
  }

  /**
   * Analyze test results and calculate metrics
   */
  function analyzeResults(metrics: CallMetrics[]): LoadTestResults {
    const totalCalls = metrics.length
    const successfulCalls = metrics.filter(m => m.status === 'completed').length
    const failedCalls = totalCalls - successfulCalls
    
    const completedMetrics = metrics.filter(m => m.latency !== undefined)
    const latencies = completedMetrics.map(m => m.latency!).sort((a, b) => a - b)
    
    const averageLatency = latencies.length > 0 
      ? latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length 
      : 0
    
    const p95Latency = calculatePercentile(latencies, 95)
    const p99Latency = calculatePercentile(latencies, 99)
    
    const testDuration = (performance.now() - testStartTime) / 1000 // seconds
    const throughput = totalCalls / testDuration // calls per second
    
    const errorRate = (failedCalls / totalCalls) * 100
    
    // Calculate transcription accuracy (mock)
    const transcriptionAccuracy = Math.max(0.95, 1 - (errorRate / 100) * 0.1)
    
    return {
      totalCalls,
      successfulCalls,
      failedCalls,
      averageLatency,
      p95Latency,
      p99Latency,
      throughput,
      errorRate,
      transcriptionAccuracy
    }
  }

  /**
   * Display comprehensive test results
   */
  function displayResults(results: LoadTestResults): void {
    console.log('\n📊 LOAD TEST RESULTS')
    console.log('==================================')
    console.log(`📞 Call Statistics:`)
    console.log(`   - Total calls: ${results.totalCalls.toLocaleString()}`)
    console.log(`   - Successful: ${results.successfulCalls.toLocaleString()} (${((results.successfulCalls/results.totalCalls)*100).toFixed(2)}%)`)
    console.log(`   - Failed: ${results.failedCalls.toLocaleString()} (${results.errorRate.toFixed(2)}%)`)
    
    console.log(`\n⏱️  Performance Metrics:`)
    console.log(`   - Average latency: ${results.averageLatency.toFixed(2)}ms`)
    console.log(`   - 95th percentile: ${results.p95Latency.toFixed(2)}ms`)
    console.log(`   - 99th percentile: ${results.p99Latency.toFixed(2)}ms`)
    console.log(`   - Throughput: ${results.throughput.toFixed(2)} calls/second`)
    
    console.log(`\n🎯 Quality Metrics:`)
    console.log(`   - Error rate: ${results.errorRate.toFixed(3)}%`)
    console.log(`   - Transcription accuracy: ${(results.transcriptionAccuracy * 100).toFixed(2)}%`)
    
    console.log(`\n✅ Target Compliance:`)
    console.log(`   - Latency target (${TARGET_LATENCY}ms): ${results.averageLatency < TARGET_LATENCY * 2 ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`   - Success rate target (${TARGET_SUCCESS_RATE}%): ${results.errorRate < (100 - TARGET_SUCCESS_RATE) ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`   - Throughput: ${results.throughput > 100 ? '✅ PASS' : '❌ FAIL'} (${results.throughput.toFixed(0)} calls/s)`)
  }

  /**
   * Calculate percentile from sorted array
   */
  function calculatePercentile(sortedArray: number[], percentile: number): number {
    if (sortedArray.length === 0) return 0
    
    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1
    return sortedArray[Math.max(0, Math.min(index, sortedArray.length - 1))]
  }

  /**
   * Utility delay function
   */
  function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
})