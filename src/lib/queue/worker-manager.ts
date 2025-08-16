/**
 * CoreFlow360 - Worker Manager
 * Manages all queue workers and their lifecycle
 */

import { Worker } from 'bullmq'
import { createEmailWorker } from './processors/email.processor'
import { createAnalyticsWorker } from './processors/analytics.processor'
import { createAIWorker } from './processors/ai.processor'
import { initializeSchedulers, closeSchedulers } from './scheduler'
import { queueMonitor } from './client'

interface WorkerInstance {
  worker: Worker
  name: string
  status: 'running' | 'paused' | 'stopped'
  startedAt: Date
  processedJobs: number
  failedJobs: number
}

class WorkerManager {
  private workers: Map<string, WorkerInstance> = new Map()
  private isRunning: boolean = false
  private monitorInterval?: NodeJS.Timeout
  
  /**
   * Start all workers
   */
  async start() {
    if (this.isRunning) {
      console.log('⚠️ Workers already running')
      return
    }
    
    console.log('🚀 Starting queue workers...')
    
    try {
      // Initialize schedulers first
      await initializeSchedulers()
      
      // Start workers
      this.startWorker('email', createEmailWorker())
      this.startWorker('analytics', createAnalyticsWorker())
      this.startWorker('ai', createAIWorker())
      
      // Start monitoring
      this.startMonitoring()
      
      this.isRunning = true
      console.log('✅ All workers started successfully')
    } catch (error) {
      console.error('❌ Failed to start workers:', error)
      await this.stop()
      throw error
    }
  }
  
  /**
   * Stop all workers
   */
  async stop() {
    console.log('🛑 Stopping queue workers...')
    
    // Stop monitoring
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval)
    }
    
    // Close all workers
    const closePromises = []
    for (const [name, instance] of this.workers) {
      console.log(`Stopping ${name} worker...`)
      closePromises.push(instance.worker.close())
    }
    
    await Promise.all(closePromises)
    
    // Close schedulers
    await closeSchedulers()
    
    this.workers.clear()
    this.isRunning = false
    
    console.log('✅ All workers stopped')
  }
  
  /**
   * Start individual worker
   */
  private startWorker(name: string, worker: Worker) {
    const instance: WorkerInstance = {
      worker,
      name,
      status: 'running',
      startedAt: new Date(),
      processedJobs: 0,
      failedJobs: 0
    }
    
    // Track job completion
    worker.on('completed', () => {
      instance.processedJobs++
    })
    
    worker.on('failed', () => {
      instance.failedJobs++
    })
    
    // Handle worker errors
    worker.on('error', (error) => {
      console.error(`❌ Worker ${name} error:`, error)
      this.handleWorkerError(name, error)
    })
    
    this.workers.set(name, instance)
    console.log(`✅ Started ${name} worker`)
  }
  
  /**
   * Handle worker errors
   */
  private async handleWorkerError(name: string, error: Error) {
    const instance = this.workers.get(name)
    if (!instance) return
    
    instance.status = 'stopped'
    
    // Try to restart worker after delay
    setTimeout(async () => {
      console.log(`🔄 Attempting to restart ${name} worker...`)
      
      try {
        await instance.worker.close()
        
        // Recreate worker based on type
        let newWorker: Worker
        switch (name) {
          case 'email':
            newWorker = createEmailWorker()
            break
          case 'analytics':
            newWorker = createAnalyticsWorker()
            break
          case 'ai':
            newWorker = createAIWorker()
            break
          default:
            console.error(`Unknown worker type: ${name}`)
            return
        }
        
        this.startWorker(name, newWorker)
      } catch (err) {
        console.error(`❌ Failed to restart ${name} worker:`, err)
      }
    }, 5000) // Wait 5 seconds before restart
  }
  
  /**
   * Start monitoring
   */
  private startMonitoring() {
    // Monitor every 30 seconds
    this.monitorInterval = setInterval(async () => {
      try {
        const stats = await this.getStats()
        
        // Log stats if in development
        if (process.env.NODE_ENV === 'development') {
          console.log('📊 Queue Stats:', stats)
        }
        
        // Check for issues
        for (const [name, workerStats] of Object.entries(stats.workers)) {
          const worker = workerStats as any
          if (worker.status === 'stopped') {
            console.warn(`⚠️ Worker ${name} is stopped`)
          }
          
          if (worker.errorRate > 0.1) { // More than 10% error rate
            console.warn(`⚠️ High error rate for ${name} worker: ${(worker.errorRate * 100).toFixed(1)}%`)
          }
        }
        
        // Check queue backlogs
        for (const [queue, counts] of Object.entries(stats.queues)) {
          const queueCounts = counts as any
          if (queueCounts.waiting > 1000) {
            console.warn(`⚠️ High backlog in ${queue} queue: ${queueCounts.waiting} jobs waiting`)
          }
        }
      } catch (error) {
        console.error('❌ Monitoring error:', error)
      }
    }, 30000)
  }
  
  /**
   * Get worker statistics
   */
  async getStats() {
    const workerStats: Record<string, any> = {}
    
    for (const [name, instance] of this.workers) {
      const total = instance.processedJobs + instance.failedJobs
      workerStats[name] = {
        status: instance.status,
        uptime: Date.now() - instance.startedAt.getTime(),
        processed: instance.processedJobs,
        failed: instance.failedJobs,
        errorRate: total > 0 ? instance.failedJobs / total : 0
      }
    }
    
    const queueStats = await queueMonitor.getAllStats()
    
    return {
      workers: workerStats,
      queues: queueStats,
      timestamp: new Date()
    }
  }
  
  /**
   * Pause worker
   */
  async pauseWorker(name: string) {
    const instance = this.workers.get(name)
    if (!instance) {
      throw new Error(`Worker ${name} not found`)
    }
    
    await instance.worker.pause()
    instance.status = 'paused'
    console.log(`⏸️ Paused ${name} worker`)
  }
  
  /**
   * Resume worker
   */
  async resumeWorker(name: string) {
    const instance = this.workers.get(name)
    if (!instance) {
      throw new Error(`Worker ${name} not found`)
    }
    
    await instance.worker.resume()
    instance.status = 'running'
    console.log(`▶️ Resumed ${name} worker`)
  }
  
  /**
   * Get worker status
   */
  getWorkerStatus(name: string) {
    const instance = this.workers.get(name)
    if (!instance) {
      return null
    }
    
    return {
      name: instance.name,
      status: instance.status,
      startedAt: instance.startedAt,
      processedJobs: instance.processedJobs,
      failedJobs: instance.failedJobs,
      uptime: Date.now() - instance.startedAt.getTime()
    }
  }
  
  /**
   * Get all worker statuses
   */
  getAllWorkerStatuses() {
    const statuses = []
    for (const name of this.workers.keys()) {
      const status = this.getWorkerStatus(name)
      if (status) {
        statuses.push(status)
      }
    }
    return statuses
  }
}

// Export singleton instance
export const workerManager = new WorkerManager()

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down workers...')
  await workerManager.stop()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down workers...')
  await workerManager.stop()
  process.exit(0)
})

// Start workers if this is the main worker process
if (process.env.IS_WORKER_PROCESS === 'true') {
  workerManager.start().catch(error => {
    console.error('Failed to start workers:', error)
    process.exit(1)
  })
}