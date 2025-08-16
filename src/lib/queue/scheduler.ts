/**
 * CoreFlow360 - Job Scheduler
 * Handles recurring and scheduled jobs
 */

import { Queue, QueueScheduler, RepeatOptions } from 'bullmq'
import { getQueue, QUEUE_NAMES } from './client'
import { analyticsJobs } from './processors/analytics.processor'
import { aiJobs } from './processors/ai.processor'
import { emailJobs } from './processors/email.processor'

interface ScheduledJob {
  name: string
  queue: keyof typeof QUEUE_NAMES
  data: any
  repeat: RepeatOptions
  enabled: boolean
}

/**
 * Scheduled jobs configuration
 */
const SCHEDULED_JOBS: ScheduledJob[] = [
  // Daily analytics aggregation
  {
    name: 'daily-analytics-aggregation',
    queue: 'ANALYTICS',
    data: {
      type: 'aggregation',
      event: 'daily_metrics'
    },
    repeat: {
      pattern: '0 1 * * *' // Every day at 1 AM
    },
    enabled: true
  },
  
  // Hourly metrics collection
  {
    name: 'hourly-metrics-collection',
    queue: 'ANALYTICS',
    data: {
      type: 'performance',
      event: 'collect_metrics'
    },
    repeat: {
      pattern: '0 * * * *' // Every hour
    },
    enabled: true
  },
  
  // Weekly engagement reports
  {
    name: 'weekly-engagement-report',
    queue: 'AI_PROCESSING',
    data: {
      type: 'report_generation',
      reportType: 'weekly_engagement',
      period: '7d'
    },
    repeat: {
      pattern: '0 9 * * 1' // Every Monday at 9 AM
    },
    enabled: true
  },
  
  // Daily cleanup of old data
  {
    name: 'daily-cleanup',
    queue: 'CLEANUP',
    data: {
      type: 'cleanup',
      targets: ['logs', 'temp_files', 'old_sessions']
    },
    repeat: {
      pattern: '0 3 * * *' // Every day at 3 AM
    },
    enabled: true
  },
  
  // Churn prediction analysis
  {
    name: 'weekly-churn-analysis',
    queue: 'AI_PROCESSING',
    data: {
      type: 'batch_analysis',
      analysisType: 'churn_prediction'
    },
    repeat: {
      pattern: '0 2 * * 0' // Every Sunday at 2 AM
    },
    enabled: true
  },
  
  // Email digest for admins
  {
    name: 'admin-daily-digest',
    queue: 'EMAIL',
    data: {
      type: 'admin_digest',
      template: 'daily-digest'
    },
    repeat: {
      pattern: '0 8 * * *' // Every day at 8 AM
    },
    enabled: process.env.ENABLE_ADMIN_DIGEST === 'true'
  }
]

/**
 * Queue schedulers
 */
const schedulers: Map<string, QueueScheduler> = new Map()

/**
 * Initialize schedulers
 */
export async function initializeSchedulers() {
  console.log('🕒 Initializing job schedulers...')
  
  // Create schedulers for each queue
  for (const queueName of Object.values(QUEUE_NAMES)) {
    const scheduler = new QueueScheduler(queueName, {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_QUEUE_DB || '1')
      }
    })
    
    schedulers.set(queueName, scheduler)
  }
  
  // Schedule recurring jobs
  for (const job of SCHEDULED_JOBS) {
    if (!job.enabled) continue
    
    try {
      await scheduleRecurringJob(job)
      console.log(`✅ Scheduled job: ${job.name}`)
    } catch (error) {
      console.error(`❌ Failed to schedule job ${job.name}:`, error)
    }
  }
  
  console.log('🕒 Schedulers initialized')
}

/**
 * Schedule a recurring job
 */
async function scheduleRecurringJob(job: ScheduledJob) {
  const queue = getQueue(job.queue)
  
  // Remove existing job if any
  const existingJobs = await queue.getRepeatableJobs()
  const existing = existingJobs.find(j => j.name === job.name)
  
  if (existing) {
    await queue.removeRepeatableByKey(existing.key)
  }
  
  // Add new recurring job
  await queue.add(
    job.name,
    job.data,
    {
      repeat: job.repeat,
      jobId: `recurring:${job.name}`
    }
  )
}

/**
 * Schedule one-time jobs
 */
export const scheduler = {
  /**
   * Schedule a job to run at specific time
   */
  async scheduleAt(
    queueName: keyof typeof QUEUE_NAMES,
    jobName: string,
    data: any,
    runAt: Date
  ) {
    const queue = getQueue(queueName)
    const delay = runAt.getTime() - Date.now()
    
    if (delay < 0) {
      throw new Error('Cannot schedule job in the past')
    }
    
    return await queue.add(jobName, data, { delay })
  },
  
  /**
   * Schedule a job with delay
   */
  async scheduleIn(
    queueName: keyof typeof QUEUE_NAMES,
    jobName: string,
    data: any,
    delayMs: number
  ) {
    const queue = getQueue(queueName)
    return await queue.add(jobName, data, { delay: delayMs })
  },
  
  /**
   * Cancel scheduled job
   */
  async cancel(jobId: string) {
    // Try to find and remove job from all queues
    for (const queueName of Object.values(QUEUE_NAMES)) {
      const queue = getQueue(queueName as keyof typeof QUEUE_NAMES)
      const job = await queue.getJob(jobId)
      
      if (job) {
        await job.remove()
        return true
      }
    }
    
    return false
  },
  
  /**
   * Get scheduled jobs
   */
  async getScheduled(queueName?: keyof typeof QUEUE_NAMES) {
    const queues = queueName 
      ? [getQueue(queueName)]
      : Object.values(QUEUE_NAMES).map(name => getQueue(name as keyof typeof QUEUE_NAMES))
    
    const allJobs = []
    
    for (const queue of queues) {
      const [delayed, repeatable] = await Promise.all([
        queue.getDelayed(),
        queue.getRepeatableJobs()
      ])
      
      allJobs.push(...delayed.map(job => ({
        id: job.id,
        name: job.name,
        queue: queue.name,
        data: job.data,
        delay: job.opts.delay,
        timestamp: job.timestamp,
        type: 'delayed' as const
      })))
      
      allJobs.push(...repeatable.map(job => ({
        ...job,
        queue: queue.name,
        type: 'repeatable' as const
      })))
    }
    
    return allJobs
  }
}

/**
 * Scheduled job helpers
 */
export const scheduledJobs = {
  /**
   * Schedule tenant-specific analytics
   */
  async scheduleTenantAnalytics(tenantId: string) {
    // Daily metrics aggregation
    await scheduler.scheduleAt(
      'ANALYTICS',
      `tenant-analytics-${tenantId}`,
      {
        type: 'aggregation',
        tenantId,
        event: 'daily_metrics',
        data: {}
      },
      getNextRunTime('0 1 * * *')
    )
    
    // Weekly engagement analysis
    await scheduler.scheduleAt(
      'ANALYTICS',
      `tenant-engagement-${tenantId}`,
      {
        type: 'aggregation',
        tenantId,
        event: 'user_engagement',
        data: {}
      },
      getNextRunTime('0 2 * * 1')
    )
  },
  
  /**
   * Schedule user onboarding emails
   */
  async scheduleOnboardingEmails(userId: string, email: string, name: string) {
    const baseDelay = 24 * 60 * 60 * 1000 // 1 day
    
    // Day 1: Welcome tips
    await scheduler.scheduleIn(
      'EMAIL',
      `onboarding-day1-${userId}`,
      {
        to: email,
        subject: 'Getting Started with CoreFlow360',
        template: 'onboarding-day1',
        data: { name }
      },
      baseDelay
    )
    
    // Day 3: Feature highlight
    await scheduler.scheduleIn(
      'EMAIL',
      `onboarding-day3-${userId}`,
      {
        to: email,
        subject: 'Unlock the Power of AI',
        template: 'onboarding-day3',
        data: { name }
      },
      baseDelay * 3
    )
    
    // Day 7: Check-in
    await scheduler.scheduleIn(
      'EMAIL',
      `onboarding-day7-${userId}`,
      {
        to: email,
        subject: 'How\'s Your Experience So Far?',
        template: 'onboarding-day7',
        data: { name }
      },
      baseDelay * 7
    )
  },
  
  /**
   * Schedule upgrade reminders
   */
  async scheduleUpgradeReminder(userId: string, email: string, data: any) {
    await scheduler.scheduleIn(
      'EMAIL',
      `upgrade-reminder-${userId}`,
      {
        to: email,
        subject: 'Unlock More with CoreFlow360 Pro',
        template: 'upgrade-reminder',
        data
      },
      2 * 24 * 60 * 60 * 1000 // 2 days
    )
  },
  
  /**
   * Schedule data export
   */
  async scheduleDataExport(userId: string, tenantId: string, exportType: string) {
    return await scheduler.scheduleIn(
      'EXPORT',
      `export-${exportType}-${userId}`,
      {
        userId,
        tenantId,
        type: exportType,
        format: 'csv'
      },
      5000 // 5 seconds delay
    )
  }
}

/**
 * Get next run time for cron pattern
 */
function getNextRunTime(pattern: string): Date {
  // This is a simplified version - in production use a proper cron parser
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(1, 0, 0, 0)
  return tomorrow
}

/**
 * Close all schedulers
 */
export async function closeSchedulers() {
  for (const scheduler of schedulers.values()) {
    await scheduler.close()
  }
  schedulers.clear()
}