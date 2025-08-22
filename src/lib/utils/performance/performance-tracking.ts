/**
 * CoreFlow360 - Performance Tracking
 * Comprehensive performance monitoring and optimization utilities
 */

export interface PerformanceMetrics {
  duration: number
  memoryUsage: {
    heapUsed: number
    heapTotal: number
    external: number
  }
  timestamp: Date
  operationType: string
  metadata?: Record<string, any>
}

export interface PerformanceThresholds {
  maxDuration: number
  maxMemoryUsage: number
  warningThreshold: number
}

export class PerformanceTracker {
  private static instance: PerformanceTracker
  private metrics: PerformanceMetrics[] = []
  private thresholds: PerformanceThresholds

  constructor(thresholds?: Partial<PerformanceThresholds>) {
    this.thresholds = {
      maxDuration: 5000, // 5 seconds
      maxMemoryUsage: 100 * 1024 * 1024, // 100MB
      warningThreshold: 1000, // 1 second
      ...thresholds
    }
  }

  static getInstance(thresholds?: Partial<PerformanceThresholds>): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker(thresholds)
    }
    return PerformanceTracker.instance
  }

  async track<T>(
    operation: () => Promise<T>,
    operationType: string,
    metadata?: Record<string, any>
  ): Promise<{ result: T; metrics: PerformanceMetrics }> {
    const startTime = performance.now()
    const startMemory = this.getMemoryUsage()

    try {
      const result = await operation()
      const endTime = performance.now()
      const endMemory = this.getMemoryUsage()

      const metrics: PerformanceMetrics = {
        duration: endTime - startTime,
        memoryUsage: {
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          heapTotal: endMemory.heapTotal,
          external: endMemory.external - startMemory.external
        },
        timestamp: new Date(),
        operationType,
        metadata
      }

      this.recordMetrics(metrics)
      this.checkThresholds(metrics)

      return { result, metrics }

    } catch (error) {
      const endTime = performance.now()
      const endMemory = this.getMemoryUsage()

      const metrics: PerformanceMetrics = {
        duration: endTime - startTime,
        memoryUsage: {
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          heapTotal: endMemory.heapTotal,
          external: endMemory.external - startMemory.external
        },
        timestamp: new Date(),
        operationType: `${operationType}:error`,
        metadata: { ...metadata, error: error instanceof Error ? error.message : 'Unknown error' }
      }

      this.recordMetrics(metrics)
      this.checkThresholds(metrics)

      throw error
    }
  }

  private getMemoryUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage()
    }
    
    // Fallback for browser environments
    return {
      heapUsed: 0,
      heapTotal: 0,
      external: 0,
      arrayBuffers: 0,
      rss: 0
    }
  }

  private recordMetrics(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics)

    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100)
    }
  }

  private checkThresholds(metrics: PerformanceMetrics): void {
    if (metrics.duration > this.thresholds.maxDuration) {
      console.warn(`Performance warning: Operation ${metrics.operationType} took ${metrics.duration}ms`)
    }

    if (metrics.memoryUsage.heapUsed > this.thresholds.maxMemoryUsage) {
      console.warn(`Memory warning: Operation ${metrics.operationType} used ${metrics.memoryUsage.heapUsed} bytes`)
    }
  }

  getMetrics(operationType?: string): PerformanceMetrics[] {
    if (!operationType) {
      return [...this.metrics]
    }

    return this.metrics.filter(m => m.operationType === operationType)
  }

  getAverageMetrics(operationType?: string): {
    averageDuration: number
    averageMemoryUsage: number
    count: number
  } {
    const metrics = this.getMetrics(operationType)
    
    if (metrics.length === 0) {
      return {
        averageDuration: 0,
        averageMemoryUsage: 0,
        count: 0
      }
    }

    const totalDuration = metrics.reduce((sum, m) => sum + m.duration, 0)
    const totalMemory = metrics.reduce((sum, m) => sum + m.memoryUsage.heapUsed, 0)

    return {
      averageDuration: totalDuration / metrics.length,
      averageMemoryUsage: totalMemory / metrics.length,
      count: metrics.length
    }
  }

  clearMetrics(): void {
    this.metrics = []
  }
}

// Export singleton instance
export const performanceTracker = PerformanceTracker.getInstance()