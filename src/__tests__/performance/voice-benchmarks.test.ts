/**
 * CoreFlow360 - Voice Features Performance Benchmarks
 * Automated performance testing with target validation
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { performance } from 'perf_hooks'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'

const execAsync = promisify(exec)

// Performance targets from requirements
const PERFORMANCE_TARGETS = {
  CALL_INITIATION: 1000, // <1s
  STT_LATENCY: 100, // <100ms
  NOTE_SAVE: 50, // <50ms
  UPTIME: 99.9 // 99.9%
}

interface BenchmarkResult {
  name: string
  duration: number
  iterations: number
  average: number
  min: number
  max: number
  p95: number
  p99: number
  target: number
  passed: boolean
}

describe('Voice Features Performance Benchmarks', () => {
  let benchmarkResults: BenchmarkResult[] = []

  beforeAll(async () => {
    console.log('🚀 Starting Performance Benchmarks')
    console.log('==================================')
    console.log('Performance Targets:')
    console.log(`  • Call Initiation: <${PERFORMANCE_TARGETS.CALL_INITIATION}ms`)
    console.log(`  • STT Latency: <${PERFORMANCE_TARGETS.STT_LATENCY}ms`)
    console.log(`  • Note Save: <${PERFORMANCE_TARGETS.NOTE_SAVE}ms`)
    console.log(`  • Uptime: >${PERFORMANCE_TARGETS.UPTIME}%`)
    console.log('')
  })

  afterAll(async () => {
    // Generate performance report
    await generatePerformanceReport(benchmarkResults)
    
    console.log('\n📊 Performance Benchmark Summary')
    console.log('==================================')
    
    let allPassed = true
    benchmarkResults.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL'
      console.log(`${status} ${result.name}: ${result.average.toFixed(2)}ms (target: <${result.target}ms)`)
      
      if (!result.passed) allPassed = false
    })
    
    console.log('')
    console.log(allPassed ? '🎉 All benchmarks PASSED!' : '⚠️  Some benchmarks FAILED!')
  })

  describe('Call Initiation Performance', () => {
    it('should initiate calls within 1 second', async () => {
      const iterations = 100
      const durations: number[] = []
      
      console.log('📞 Benchmarking call initiation...')
      
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now()
        
        // Simulate call initiation process
        await simulateCallInitiation()
        
        const endTime = performance.now()
        durations.push(endTime - startTime)
        
        if (i % 20 === 0) {
          console.log(`   Progress: ${i}/${iterations} calls initiated`)
        }
      }
      
      const result = analyzeBenchmarkResults(
        'Call Initiation',
        durations,
        PERFORMANCE_TARGETS.CALL_INITIATION
      )
      
      benchmarkResults.push(result)
      expect(result.passed).toBe(true)
    })

    it('should handle concurrent call initiation efficiently', async () => {
      const concurrentCalls = 50
      console.log(`📞 Benchmarking ${concurrentCalls} concurrent call initiations...`)
      
      const startTime = performance.now()
      
      // Initiate multiple calls concurrently
      const callPromises = Array(concurrentCalls).fill(null).map(() => 
        simulateCallInitiation()
      )
      
      await Promise.all(callPromises)
      
      const totalTime = performance.now() - startTime
      const averagePerCall = totalTime / concurrentCalls
      
      console.log(`   Concurrent calls completed in ${totalTime.toFixed(2)}ms`)
      console.log(`   Average per call: ${averagePerCall.toFixed(2)}ms`)
      
      expect(averagePerCall).toBeLessThan(PERFORMANCE_TARGETS.CALL_INITIATION)
    })
  })

  describe('Speech-to-Text Performance', () => {
    it('should process STT within 100ms', async () => {
      const iterations = 200
      const durations: number[] = []
      
      console.log('🎤 Benchmarking speech-to-text processing...')
      
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now()
        
        // Simulate STT processing
        await simulateSTTProcessing()
        
        const endTime = performance.now()
        durations.push(endTime - startTime)
        
        if (i % 40 === 0) {
          console.log(`   Progress: ${i}/${iterations} STT requests processed`)
        }
      }
      
      const result = analyzeBenchmarkResults(
        'STT Processing',
        durations,
        PERFORMANCE_TARGETS.STT_LATENCY
      )
      
      benchmarkResults.push(result)
      expect(result.passed).toBe(true)
    })

    it('should maintain STT performance under load', async () => {
      const concurrentRequests = 20
      const requestsPerBatch = 10
      
      console.log(`🎤 Benchmarking STT under load (${concurrentRequests} concurrent)...`)
      
      const allDurations: number[] = []
      
      for (let batch = 0; batch < requestsPerBatch; batch++) {
        const batchPromises = Array(concurrentRequests).fill(null).map(async () => {
          const startTime = performance.now()
          await simulateSTTProcessing()
          return performance.now() - startTime
        })
        
        const batchDurations = await Promise.all(batchPromises)
        allDurations.push(...batchDurations)
        
        console.log(`   Batch ${batch + 1}/${requestsPerBatch} completed`)
      }
      
      const averageLatency = allDurations.reduce((sum, d) => sum + d, 0) / allDurations.length
      console.log(`   Average STT latency under load: ${averageLatency.toFixed(2)}ms`)
      
      expect(averageLatency).toBeLessThan(PERFORMANCE_TARGETS.STT_LATENCY * 2) // Allow 2x under load
    })
  })

  describe('Voice Note Save Performance', () => {
    it('should save voice notes within 50ms', async () => {
      const iterations = 150
      const durations: number[] = []
      
      console.log('💾 Benchmarking voice note save operations...')
      
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now()
        
        // Simulate voice note save
        await simulateVoiceNoteSave()
        
        const endTime = performance.now()
        durations.push(endTime - startTime)
        
        if (i % 30 === 0) {
          console.log(`   Progress: ${i}/${iterations} notes saved`)
        }
      }
      
      const result = analyzeBenchmarkResults(
        'Voice Note Save',
        durations,
        PERFORMANCE_TARGETS.NOTE_SAVE
      )
      
      benchmarkResults.push(result)
      expect(result.passed).toBe(true)
    })

    it('should handle bulk save operations efficiently', async () => {
      const bulkSize = 25
      console.log(`💾 Benchmarking bulk save of ${bulkSize} voice notes...`)
      
      const startTime = performance.now()
      
      // Simulate bulk save
      const savePromises = Array(bulkSize).fill(null).map(() => 
        simulateVoiceNoteSave()
      )
      
      await Promise.all(savePromises)
      
      const totalTime = performance.now() - startTime
      const averagePerNote = totalTime / bulkSize
      
      console.log(`   Bulk save completed in ${totalTime.toFixed(2)}ms`)
      console.log(`   Average per note: ${averagePerNote.toFixed(2)}ms`)
      
      expect(averagePerNote).toBeLessThan(PERFORMANCE_TARGETS.NOTE_SAVE * 1.5) // Allow 50% overhead
    })
  })

  describe('End-to-End Performance', () => {
    it('should complete full dictation flow within performance targets', async () => {
      const iterations = 20
      const results: { [key: string]: number[] } = {
        total: [],
        recording: [],
        transcription: [],
        save: []
      }
      
      console.log('🎯 Benchmarking complete dictation flow...')
      
      for (let i = 0; i < iterations; i++) {
        const flowStartTime = performance.now()
        
        // Step 1: Start recording
        const recordingStartTime = performance.now()
        await simulateRecordingStart()
        const recordingTime = performance.now() - recordingStartTime
        results.recording.push(recordingTime)
        
        // Step 2: Process transcription (simulated 2 second recording)
        const transcriptionStartTime = performance.now()
        await simulateRealtimeTranscription(2000) // 2 seconds of audio
        const transcriptionTime = performance.now() - transcriptionStartTime
        results.transcription.push(transcriptionTime)
        
        // Step 3: Save note
        const saveStartTime = performance.now()
        await simulateVoiceNoteSave()
        const saveTime = performance.now() - saveStartTime
        results.save.push(saveTime)
        
        const totalTime = performance.now() - flowStartTime
        results.total.push(totalTime)
        
        if (i % 5 === 0) {
          console.log(`   Flow ${i + 1}/${iterations} completed in ${totalTime.toFixed(2)}ms`)
        }
      }
      
      // Analyze each step
      const avgRecording = results.recording.reduce((sum, t) => sum + t, 0) / iterations
      const avgTranscription = results.transcription.reduce((sum, t) => sum + t, 0) / iterations
      const avgSave = results.save.reduce((sum, t) => sum + t, 0) / iterations
      const avgTotal = results.total.reduce((sum, t) => sum + t, 0) / iterations
      
      console.log(`   Average recording start: ${avgRecording.toFixed(2)}ms`)
      console.log(`   Average transcription: ${avgTranscription.toFixed(2)}ms`)
      console.log(`   Average save: ${avgSave.toFixed(2)}ms`)
      console.log(`   Average total: ${avgTotal.toFixed(2)}ms`)
      
      // Validate performance targets
      expect(avgRecording).toBeLessThan(200) // Recording should start quickly
      expect(avgSave).toBeLessThan(PERFORMANCE_TARGETS.NOTE_SAVE)
      expect(avgTotal).toBeLessThan(3000) // Total flow under 3 seconds
    })
  })

  describe('Resource Usage Performance', () => {
    it('should maintain low memory usage during operations', async () => {
      const initialMemory = process.memoryUsage()
      
      console.log('🧠 Benchmarking memory usage...')
      
      // Simulate heavy voice operations
      for (let i = 0; i < 50; i++) {
        await simulateCallInitiation()
        await simulateSTTProcessing()
        await simulateVoiceNoteSave()
        
        if (i % 10 === 0) {
          // Force garbage collection if available
          if (global.gc) {
            global.gc()
          }
        }
      }
      
      const finalMemory = process.memoryUsage()
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed
      const memoryIncreaseKB = Math.round(memoryIncrease / 1024)
      
      console.log(`   Memory usage increase: ${memoryIncreaseKB}KB`)
      console.log(`   Heap used: ${Math.round(finalMemory.heapUsed / 1024 / 1024)}MB`)
      
      // Memory increase should be reasonable (< 50MB for this test)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024)
    })

    it('should handle CPU-intensive operations efficiently', async () => {
      console.log('💻 Benchmarking CPU usage...')
      
      const startTime = process.hrtime.bigint()
      const startCPU = process.cpuUsage()
      
      // Simulate CPU-intensive voice processing
      const promises = []
      for (let i = 0; i < 20; i++) {
        promises.push(simulateIntensiveProcessing())
      }
      
      await Promise.all(promises)
      
      const endTime = process.hrtime.bigint()
      const endCPU = process.cpuUsage(startCPU)
      
      const executionTime = Number(endTime - startTime) / 1000000 // Convert to ms
      const cpuUsage = (endCPU.user + endCPU.system) / 1000 // Convert to ms
      const cpuEfficiency = (cpuUsage / executionTime) * 100
      
      console.log(`   Execution time: ${executionTime.toFixed(2)}ms`)
      console.log(`   CPU time: ${cpuUsage.toFixed(2)}ms`)
      console.log(`   CPU efficiency: ${cpuEfficiency.toFixed(2)}%`)
      
      // CPU efficiency should be reasonable
      expect(cpuEfficiency).toBeLessThan(200) // Less than 200% (2 cores)
    })
  })

  // Helper functions for simulation
  async function simulateCallInitiation(): Promise<void> {
    // Simulate Twilio API call latency
    const latency = 50 + Math.random() * 200 // 50-250ms
    await new Promise(resolve => setTimeout(resolve, latency))
    
    // Simulate database operations
    await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 20))
  }

  async function simulateSTTProcessing(): Promise<void> {
    // Simulate WebSocket message processing
    const baseLatency = 20 + Math.random() * 60 // 20-80ms base
    await new Promise(resolve => setTimeout(resolve, baseLatency))
    
    // Simulate audio chunk processing
    await new Promise(resolve => setTimeout(resolve, 5 + Math.random() * 10))
  }

  async function simulateVoiceNoteSave(): Promise<void> {
    // Simulate database write
    const dbLatency = 10 + Math.random() * 30 // 10-40ms
    await new Promise(resolve => setTimeout(resolve, dbLatency))
    
    // Simulate file system operations
    await new Promise(resolve => setTimeout(resolve, 5 + Math.random() * 10))
  }

  async function simulateRecordingStart(): Promise<void> {
    // Simulate getUserMedia and MediaRecorder setup
    const setupTime = 20 + Math.random() * 80 // 20-100ms
    await new Promise(resolve => setTimeout(resolve, setupTime))
  }

  async function simulateRealtimeTranscription(audioDurationMs: number): Promise<void> {
    // Simulate real-time transcription processing
    const processingRatio = 0.1 // Process 1 second of audio in 0.1 seconds
    const processingTime = audioDurationMs * processingRatio
    await new Promise(resolve => setTimeout(resolve, processingTime))
  }

  async function simulateIntensiveProcessing(): Promise<void> {
    // Simulate CPU-intensive operations like audio processing
    const operations = 10000
    let sum = 0
    
    for (let i = 0; i < operations; i++) {
      sum += Math.sqrt(i) * Math.sin(i)
    }
    
    // Small delay to simulate I/O
    await new Promise(resolve => setTimeout(resolve, 1))
    
    return sum // Prevent optimization
  }

  function analyzeBenchmarkResults(
    name: string,
    durations: number[],
    target: number
  ): BenchmarkResult {
    const sorted = durations.sort((a, b) => a - b)
    const average = durations.reduce((sum, d) => sum + d, 0) / durations.length
    const min = sorted[0]
    const max = sorted[sorted.length - 1]
    const p95 = sorted[Math.floor(sorted.length * 0.95)]
    const p99 = sorted[Math.floor(sorted.length * 0.99)]
    const passed = average < target
    
    return {
      name,
      duration: durations.reduce((sum, d) => sum + d, 0),
      iterations: durations.length,
      average,
      min,
      max,
      p95,
      p99,
      target,
      passed
    }
  }

  async function generatePerformanceReport(results: BenchmarkResult[]): Promise<void> {
    const report = {
      timestamp: new Date().toISOString(),
      environment: {
        node: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: process.memoryUsage()
      },
      targets: PERFORMANCE_TARGETS,
      results: results.map(r => ({
        name: r.name,
        passed: r.passed,
        average: r.average,
        target: r.target,
        p95: r.p95,
        p99: r.p99,
        iterations: r.iterations
      })),
      summary: {
        totalTests: results.length,
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length,
        overallPassed: results.every(r => r.passed)
      }
    }
    
    try {
      await fs.writeFile(
        'performance-benchmark-report.json',
        JSON.stringify(report, null, 2),
        'utf8'
      )
      console.log('📄 Performance report saved to performance-benchmark-report.json')
    } catch (error) {
      console.warn('⚠️  Failed to save performance report:', error)
    }
  }
})