/**
 * CoreFlow360 - Job Queue Client
 * Background job processing with BullMQ
 */

import { Queue, Worker, QueueEvents, Job, ConnectionOptions } from 'bullmq'
import { getRedisClient } from '@/lib/redis/client'

// Redis connection for BullMQ
const connection: ConnectionOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_QUEUE_DB || '1'), // Use different DB for queues
  maxRetriesPerRequest: null, // Required by BullMQ
}

// Queue names
export const QUEUE_NAMES = {
  EMAIL: 'email',
  ANALYTICS: 'analytics',
  EXPORT: 'export',
  AI_PROCESSING: 'ai-processing',
  NOTIFICATIONS: 'notifications',
  REPORTS: 'reports',
  WEBHOOKS: 'webhooks',
  CLEANUP: 'cleanup'
} as const

// Queue instances
const queues: Map<string, Queue> = new Map()

/**
 * Get or create a queue instance
 */
export function getQueue(name: keyof typeof QUEUE_NAMES): Queue {
  const queueName = QUEUE_NAMES[name]
  
  // Skip queue creation during build time
  const isBuildTime = process.env.VERCEL_ENV || process.env.CI || process.env.NEXT_PHASE === 'phase-production-build'
  if (isBuildTime) {
    // Return a mock queue during build
    return {} as Queue
  }
  
  if (!queues.has(queueName)) {
    const queue = new Queue(queueName, {
      connection,
      defaultJobOptions: {
        removeOnComplete: {
          age: 3600, // 1 hour
          count: 100
        },
        removeOnFail: {
          age: 24 * 3600, // 24 hours
          count: 1000
        },
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      }
    })
    
    queues.set(queueName, queue)
  }
  
  return queues.get(queueName)!
}

/**
 * Job options by queue type
 */
export const JOB_OPTIONS = {
  email: {
    priority: 1,
    attempts: 5,
    backoff: {
      type: 'exponential' as const,
      delay: 5000
    }
  },
  analytics: {
    priority: 10,
    attempts: 3,
    delay: 1000 // Process after 1 second
  },
  export: {
    priority: 5,
    attempts: 2,
    timeout: 300000 // 5 minutes
  },
  aiProcessing: {
    priority: 3,
    attempts: 2,
    timeout: 120000 // 2 minutes
  },
  notifications: {
    priority: 1,
    attempts: 3
  },
  reports: {
    priority: 5,
    attempts: 2,
    timeout: 600000 // 10 minutes
  },
  webhooks: {
    priority: 1,
    attempts: 5,
    backoff: {
      type: 'exponential' as const,
      delay: 10000
    }
  },
  cleanup: {
    priority: 100, // Lowest priority
    attempts: 1
  }
}

/**
 * Queue events for monitoring
 */
const queueEvents: Map<string, QueueEvents> = new Map()

export function getQueueEvents(name: keyof typeof QUEUE_NAMES): QueueEvents {
  const queueName = QUEUE_NAMES[name]
  
  if (!queueEvents.has(queueName)) {
    const events = new QueueEvents(queueName, { connection })
    queueEvents.set(queueName, events)
  }
  
  return queueEvents.get(queueName)!
}

/**
 * Add job to queue
 */
export async function addJob<T = any>(
  queueName: keyof typeof QUEUE_NAMES,
  jobName: string,
  data: T,
  options?: any
): Promise<Job<T>> {
  const queue = getQueue(queueName)
  const jobOptions = JOB_OPTIONS[queueName] || {}
  
  return await queue.add(jobName, data, {
    ...jobOptions,
    ...options
  })
}

/**
 * Bulk add jobs
 */
export async function addBulkJobs<T = any>(
  queueName: keyof typeof QUEUE_NAMES,
  jobs: Array<{ name: string; data: T; opts?: any }>
): Promise<Job<T>[]> {
  const queue = getQueue(queueName)
  const jobOptions = JOB_OPTIONS[queueName] || {}
  
  const jobsWithOptions = jobs.map(job => ({
    ...job,
    opts: { ...jobOptions, ...job.opts }
  }))
  
  return await queue.addBulk(jobsWithOptions)
}

/**
 * Get job counts
 */
export async function getJobCounts(queueName: keyof typeof QUEUE_NAMES) {
  const queue = getQueue(queueName)
  return await queue.getJobCounts()
}

/**
 * Clean queue
 */
export async function cleanQueue(
  queueName: keyof typeof QUEUE_NAMES,
  grace: number = 0,
  limit: number = 100,
  status: 'completed' | 'failed' = 'completed'
) {
  const queue = getQueue(queueName)
  return await queue.clean(grace, limit, status)
}

/**
 * Pause/resume queue
 */
export async function pauseQueue(queueName: keyof typeof QUEUE_NAMES) {
  const queue = getQueue(queueName)
  await queue.pause()
}

export async function resumeQueue(queueName: keyof typeof QUEUE_NAMES) {
  const queue = getQueue(queueName)
  await queue.resume()
}

/**
 * Close all connections
 */
export async function closeQueues() {
  for (const queue of queues.values()) {
    await queue.close()
  }
  for (const events of queueEvents.values()) {
    await events.close()
  }
  queues.clear()
  queueEvents.clear()
}

/**
 * Queue monitoring utilities
 */
export const queueMonitor = {
  /**
   * Get all queue statistics
   */
  async getAllStats() {
    const stats: Record<string, any> = {}
    
    for (const [name, queueName] of Object.entries(QUEUE_NAMES)) {
      const counts = await getJobCounts(name as keyof typeof QUEUE_NAMES)
      stats[queueName] = counts
    }
    
    return stats
  },
  
  /**
   * Monitor queue events
   */
  monitorQueue(
    queueName: keyof typeof QUEUE_NAMES,
    handlers: {
      onCompleted?: (jobId: string, result: any) => void
      onFailed?: (jobId: string, error: Error) => void
      onProgress?: (jobId: string, progress: number) => void
      onStalled?: (jobId: string) => void
    }
  ) {
    const events = getQueueEvents(queueName)
    
    if (handlers.onCompleted) {
      events.on('completed', ({ jobId, returnvalue }) => {
        handlers.onCompleted!(jobId, returnvalue)
      })
    }
    
    if (handlers.onFailed) {
      events.on('failed', ({ jobId, failedReason }) => {
        handlers.onFailed!(jobId, new Error(failedReason))
      })
    }
    
    if (handlers.onProgress) {
      events.on('progress', ({ jobId, data }) => {
        handlers.onProgress!(jobId, data)
      })
    }
    
    if (handlers.onStalled) {
      events.on('stalled', ({ jobId }) => {
        handlers.onStalled!(jobId)
      })
    }
    
    return () => {
      events.removeAllListeners()
    }
  }
}