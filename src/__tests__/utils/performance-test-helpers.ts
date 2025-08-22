/**
 * CoreFlow360 - Performance Test Helpers
 * Load testing, stress testing, and performance benchmarking utilities
 */

import { performance } from 'perf_hooks'

// Performance metrics interface
export interface PerformanceMetrics {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  minResponseTime: number
  maxResponseTime: number
  p95ResponseTime: number
  p99ResponseTime: number
  requestsPerSecond: number
  errorRate: number
  duration: number
}

// Load test configuration
export interface LoadTestConfig {
  url: string
  concurrentUsers: number
  duration: number // seconds
  rampUpTime?: number // seconds
  headers?: Record<string, string>
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  timeout?: number // milliseconds
}

// Stress test levels
export enum StressLevel {
  LIGHT = 'light',      // 1-10 users
  MODERATE = 'moderate', // 10-50 users
  HEAVY = 'heavy',      // 50-200 users
  EXTREME = 'extreme'   // 200+ users
}

export class PerformanceTestRunner {
  private results: Array<{ timestamp: number; responseTime: number; success: boolean; error?: string }> = []

  // Run load test
  async runLoadTest(config: LoadTestConfig): Promise<PerformanceMetrics> {
    console.log(`🚀 Starting load test: ${config.concurrentUsers} users for ${config.duration}s`)
    
    this.results = []
    const startTime = Date.now()
    const endTime = startTime + (config.duration * 1000)
    const promises: Promise<void>[] = []

    // Ramp up users gradually
    const rampUpTime = config.rampUpTime || 10
    const rampUpInterval = (rampUpTime * 1000) / config.concurrentUsers

    for (let i = 0; i < config.concurrentUsers; i++) {
      const delay = i * rampUpInterval
      
      promises.push(
        new Promise(resolve => {
          setTimeout(() => {
            this.simulateUser(config, endTime).finally(resolve)
          }, delay)
        })
      )
    }

    // Wait for all users to complete
    await Promise.all(promises)

    const metrics = this.calculateMetrics(startTime, Date.now())
    console.log(`✅ Load test completed:`, metrics)
    
    return metrics
  }

  // Simulate a single user session
  private async simulateUser(config: LoadTestConfig, endTime: number): Promise<void> {
    while (Date.now() < endTime) {
      const requestStart = performance.now()
      
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), config.timeout || 10000)

        const response = await fetch(config.url, {
          method: config.method || 'GET',
          headers: config.headers || {},
          body: config.body ? JSON.stringify(config.body) : undefined,
          signal: controller.signal
        })

        clearTimeout(timeout)
        const requestEnd = performance.now()
        
        this.results.push({
          timestamp: Date.now(),
          responseTime: requestEnd - requestStart,
          success: response.ok,
          error: response.ok ? undefined : `HTTP ${response.status}`
        })

        // Random delay between requests (1-3 seconds)
        await this.delay(1000 + Math.random() * 2000)
        
      } catch (error) {
        const requestEnd = performance.now()
        
        this.results.push({
          timestamp: Date.now(),
          responseTime: requestEnd - requestStart,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })

        // Still wait before next request
        await this.delay(1000)
      }
    }
  }

  // Calculate performance metrics
  private calculateMetrics(startTime: number, endTime: number): PerformanceMetrics {
    const duration = (endTime - startTime) / 1000 // Convert to seconds
    const responseTimes = this.results.map(r => r.responseTime).sort((a, b) => a - b)
    const successfulRequests = this.results.filter(r => r.success).length
    const failedRequests = this.results.length - successfulRequests

    return {
      totalRequests: this.results.length,
      successfulRequests,
      failedRequests,
      averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length || 0,
      minResponseTime: responseTimes[0] || 0,
      maxResponseTime: responseTimes[responseTimes.length - 1] || 0,
      p95ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.95)] || 0,
      p99ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.99)] || 0,
      requestsPerSecond: this.results.length / duration,
      errorRate: (failedRequests / this.results.length) * 100,
      duration
    }
  }

  // Delay utility
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Spike test - sudden increase in load
  async runSpikeTest(config: LoadTestConfig & { spikeUsers: number; spikeDuration: number }): Promise<PerformanceMetrics> {
    console.log(`⚡ Starting spike test: ${config.spikeUsers} users for ${config.spikeDuration}s`)
    
    this.results = []
    const startTime = Date.now()
    const promises: Promise<void>[] = []
    
    // Launch all users at once (spike)
    for (let i = 0; i < config.spikeUsers; i++) {
      promises.push(
        this.simulateUser(config, startTime + (config.spikeDuration * 1000))
      )
    }

    await Promise.all(promises)
    
    const metrics = this.calculateMetrics(startTime, Date.now())
    console.log(`✅ Spike test completed:`, metrics)
    
    return metrics
  }

  // Volume test - sustained high load
  async runVolumeTest(config: LoadTestConfig): Promise<PerformanceMetrics> {
    console.log(`📊 Starting volume test: ${config.concurrentUsers} users for ${config.duration}s`)
    
    // Volume test is essentially a sustained load test
    return this.runLoadTest(config)
  }

  // Stress test - find breaking point
  async runStressTest(baseConfig: Omit<LoadTestConfig, 'concurrentUsers'>): Promise<{
    breakingPoint: number
    maxSuccessfulUsers: number
    results: Array<{ users: number; metrics: PerformanceMetrics }>
  }> {
    console.log(`🔥 Starting stress test to find breaking point`)
    
    const results = []
    let currentUsers = 1
    let maxSuccessfulUsers = 0
    let breakingPoint = 0
    
    const stressLevels = [5, 10, 25, 50, 100, 200, 500, 1000]
    
    for (const users of stressLevels) {
      console.log(`Testing with ${users} concurrent users...`)
      
      const config = {
        ...baseConfig,
        concurrentUsers: users,
        duration: 30 // Shorter duration for stress testing
      }
      
      const metrics = await this.runLoadTest(config)
      results.push({ users, metrics })
      
      // Define breaking point criteria
      const isHealthy = metrics.errorRate < 5 && 
                       metrics.averageResponseTime < 2000 && 
                       metrics.p95ResponseTime < 5000
      
      if (isHealthy) {
        maxSuccessfulUsers = users
      } else if (breakingPoint === 0) {
        breakingPoint = users
        break
      }
      
      // Wait between stress levels
      await this.delay(5000)
    }
    
    return {
      breakingPoint: breakingPoint || maxSuccessfulUsers,
      maxSuccessfulUsers,
      results
    }
  }
}

// Memory usage monitor
export class MemoryMonitor {
  private measurements: Array<{ timestamp: number; usage: NodeJS.MemoryUsage }> = []
  private interval?: NodeJS.Timeout

  start(intervalMs: number = 1000) {
    this.measurements = []
    this.interval = setInterval(() => {
      this.measurements.push({
        timestamp: Date.now(),
        usage: process.memoryUsage()
      })
    }, intervalMs)
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = undefined
    }
  }

  getReport() {
    if (this.measurements.length === 0) {
      return { error: 'No measurements taken' }
    }

    const initial = this.measurements[0].usage
    const final = this.measurements[this.measurements.length - 1].usage
    const peak = this.measurements.reduce((max, curr) => 
      curr.usage.heapUsed > max.usage.heapUsed ? curr : max
    )

    return {
      initialMemory: this.formatBytes(initial.heapUsed),
      finalMemory: this.formatBytes(final.heapUsed),
      peakMemory: this.formatBytes(peak.usage.heapUsed),
      memoryGrowth: this.formatBytes(final.heapUsed - initial.heapUsed),
      measurements: this.measurements
    }
  }

  private formatBytes(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`
  }
}

// Performance benchmarking utilities
export const benchmark = {
  // Time a function execution
  async time<T>(name: string, fn: () => Promise<T> | T): Promise<{ result: T; duration: number }> {
    const start = performance.now()
    const result = await fn()
    const end = performance.now()
    const duration = end - start
    
    console.log(`⏱️  ${name}: ${duration.toFixed(2)}ms`)
    
    return { result, duration }
  },

  // Run multiple iterations and get statistics
  async iterate<T>(
    name: string, 
    fn: () => Promise<T> | T, 
    iterations: number = 100
  ): Promise<{
    results: T[]
    times: number[]
    average: number
    min: number
    max: number
    p95: number
    p99: number
  }> {
    console.log(`🔄 Running ${name} benchmark (${iterations} iterations)`)
    
    const results: T[] = []
    const times: number[] = []
    
    for (let i = 0; i < iterations; i++) {
      const { result, duration } = await this.time(`${name}_${i}`, fn)
      results.push(result)
      times.push(duration)
    }
    
    const sortedTimes = times.sort((a, b) => a - b)
    const stats = {
      results,
      times,
      average: times.reduce((a, b) => a + b) / times.length,
      min: sortedTimes[0],
      max: sortedTimes[sortedTimes.length - 1],
      p95: sortedTimes[Math.floor(sortedTimes.length * 0.95)],
      p99: sortedTimes[Math.floor(sortedTimes.length * 0.99)]
    }
    
    console.log(`📊 ${name} stats:`, {
      average: `${stats.average.toFixed(2)}ms`,
      min: `${stats.min.toFixed(2)}ms`,
      max: `${stats.max.toFixed(2)}ms`,
      p95: `${stats.p95.toFixed(2)}ms`,
      p99: `${stats.p99.toFixed(2)}ms`
    })
    
    return stats
  },

  // Compare performance of different functions
  async compare(
    name: string,
    functions: Record<string, () => Promise<any> | any>,
    iterations: number = 50
  ) {
    console.log(`🏁 Performance comparison: ${name}`)
    
    const results: Record<string, any> = {}
    
    for (const [funcName, func] of Object.entries(functions)) {
      const stats = await this.iterate(`${name}_${funcName}`, func, iterations)
      results[funcName] = stats
    }
    
    // Find the fastest
    const fastest = Object.entries(results).reduce((fastest, [name, stats]) => 
      stats.average < fastest.stats.average ? { name, stats } : fastest
    , { name: 'none', stats: { average: Infinity } })
    
    console.log(`🏆 Fastest: ${fastest.name}`)
    
    return results
  }
}

// Pre-configured test scenarios
export const performanceScenarios = {
  // API endpoint load test
  apiEndpoint: (url: string, options: Partial<LoadTestConfig> = {}) => ({
    url,
    concurrentUsers: 50,
    duration: 60,
    rampUpTime: 10,
    method: 'GET' as const,
    timeout: 5000,
    ...options
  }),

  // Database operation stress test
  databaseStress: (url: string) => ({
    url,
    concurrentUsers: 100,
    duration: 120,
    rampUpTime: 20,
    method: 'POST' as const,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000
  }),

  // User authentication flow
  authFlow: (loginUrl: string, credentials: any) => ({
    url: loginUrl,
    concurrentUsers: 25,
    duration: 30,
    method: 'POST' as const,
    headers: { 'Content-Type': 'application/json' },
    body: credentials,
    timeout: 8000
  }),

  // File upload test
  fileUpload: (uploadUrl: string) => ({
    url: uploadUrl,
    concurrentUsers: 10,
    duration: 60,
    method: 'POST' as const,
    timeout: 30000
  })
}

export { PerformanceTestRunner, MemoryMonitor }