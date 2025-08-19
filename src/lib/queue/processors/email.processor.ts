/**
 * CoreFlow360 - Email Queue Processor
 * Handles email sending jobs
 */

import { Worker, Job } from 'bullmq'
import { sendEmail } from '@/lib/email'
import { prisma } from '@/lib/prisma'
import { performanceMetrics } from '@/lib/cache/metrics-cache'

export interface EmailJobData {
  to: string | string[]
  subject: string
  template: string
  data: Record<string, unknown>
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
  priority?: 'high' | 'normal' | 'low'
  trackingId?: string
}

/**
 * Process email job
 */
async function processEmailJob(job: Job<EmailJobData>) {
  const startTime = Date.now()

  try {
    console.log(`📧 Processing email job ${job.id}:`, {
      to: job.data.to,
      subject: job.data.subject,
      template: job.data.template,
    })

    // Update job progress
    await job.updateProgress(10)

    // Send email
    const result = await sendEmail({
      to: Array.isArray(job.data.to) ? job.data.to : [job.data.to],
      subject: job.data.subject,
      template: job.data.template,
      context: job.data.data,
      attachments: job.data.attachments,
    })

    await job.updateProgress(80)

    // Track email in database
    if (job.data.trackingId) {
      await prisma.emailLog.create({
        data: {
          trackingId: job.data.trackingId,
          to: Array.isArray(job.data.to) ? job.data.to.join(',') : job.data.to,
          subject: job.data.subject,
          template: job.data.template,
          status: result.success ? 'sent' : 'failed',
          messageId: result.messageId,
          sentAt: new Date(),
          metadata: job.data.data,
        },
      })
    }

    await job.updateProgress(100)

    // Track metrics
    const duration = Date.now() - startTime
    await performanceMetrics.trackResponseTime('email_send', duration, 200)

    return {
      success: true,
      messageId: result.messageId,
      duration,
    }
  } catch (error) {
    const duration = Date.now() - startTime
    await performanceMetrics.trackResponseTime('email_send', duration, 500)

    throw error
  }
}

/**
 * Create email worker
 */
export function createEmailWorker() {
  const worker = new Worker<EmailJobData>('email', processEmailJob, {
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_QUEUE_DB || '1'),
    },
    concurrency: parseInt(process.env.EMAIL_WORKER_CONCURRENCY || '5'),
    limiter: {
      max: 10,
      duration: 1000, // Max 10 emails per second
    },
  })

  // Worker event handlers
  worker.on('completed', (job) => {})

  worker.on('failed', (job, err) => {})

  worker.on('error', (err) => {})

  return worker
}

/**
 * Email job helpers
 */
export const emailJobs = {
  /**
   * Send welcome email
   */
  async sendWelcomeEmail(
    userId: string,
    data: {
      name: string
      email: string
      activationUrl?: string
    }
  ) {
    const { addJob } = await import('../client')

    return addJob('EMAIL', 'welcome-email', {
      to: data.email,
      subject: 'Welcome to CoreFlow360!',
      template: 'welcome',
      data: {
        name: data.name,
        activationUrl: data.activationUrl || `${process.env.NEXT_PUBLIC_APP_URL}/activate`,
        features: [
          'AI-powered business insights',
          'Multi-industry support',
          'Real-time analytics',
          'Team collaboration',
        ],
      },
      trackingId: `welcome-${userId}`,
      priority: 'high',
    })
  },

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, resetToken: string) {
    const { addJob } = await import('../client')

    return addJob('EMAIL', 'password-reset', {
      to: email,
      subject: 'Reset Your Password - CoreFlow360',
      template: 'password-reset',
      data: {
        resetUrl: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`,
        expiresIn: '1 hour',
      },
      priority: 'high',
    })
  },

  /**
   * Send upgrade prompt email
   */
  async sendUpgradePromptEmail(user: {
    id: string
    email: string
    name: string
    usage: number
    limit: number
  }) {
    const { addJob } = await import('../client')

    return addJob('EMAIL', 'upgrade-prompt', {
      to: user.email,
      subject: "You're Getting Great Value from CoreFlow360!",
      template: 'upgrade-prompt',
      data: {
        name: user.name,
        usage: user.usage,
        limit: user.limit,
        upgradeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
        benefits: [
          'Unlimited AI usage',
          'All 6 AI employees',
          'Priority support',
          'Advanced analytics',
        ],
      },
      trackingId: `upgrade-${user.id}-${Date.now()}`,
    })
  },

  /**
   * Send bulk email campaign
   */
  async sendBulkEmail(recipients: string[], subject: string, template: string, data: unknown) {
    const { addBulkJobs } = await import('../client')

    const jobs = recipients.map((email) => ({
      name: 'bulk-email',
      data: {
        to: email,
        subject,
        template,
        data,
        priority: 'low' as const,
      },
    }))

    return addBulkJobs('EMAIL', jobs)
  },
}
