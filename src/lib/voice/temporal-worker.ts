/**
 * CoreFlow360 Temporal Worker
 *
 * Temporal worker that registers and executes voice processing workflows and activities
 * Ensures reliable, fault-tolerant processing of voice calls and lead management
 */

import { NativeConnection, Worker, Runtime } from '@temporalio/worker'
import {
  enhancedVoiceCallWorkflow,
  postCallProcessingWorkflow,
  enhancedVoiceLeadWorkflow,
} from './temporal-workflows'
import * as activities from './temporal-activities'

export interface WorkerConfig {
  temporalAddress?: string
  namespace?: string
  taskQueue?: string
  maxConcurrentWorkflowTaskExecutions?: number
  maxConcurrentActivityTaskExecutions?: number
  maxCachedWorkflows?: number
}

export class VoiceProcessingWorker {
  private worker?: Worker
  private connection?: NativeConnection
  private isRunning = false

  constructor(private config: WorkerConfig = {}) {
    this.config = {
      temporalAddress: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
      namespace: process.env.TEMPORAL_NAMESPACE || 'default',
      taskQueue: process.env.TEMPORAL_TASK_QUEUE || 'voice-processing',
      maxConcurrentWorkflowTaskExecutions: 100,
      maxConcurrentActivityTaskExecutions: 100,
      maxCachedWorkflows: 100,
      ...config,
    }
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      
      return
    }

    try {
      console.log('🔄 Starting Temporal worker...', {
        address: this.config.temporalAddress,
        namespace: this.config.namespace,
        taskQueue: this.config.taskQueue,
      })

      // Create connection to Temporal server
      this.connection = await NativeConnection.connect({
        address: this.config.temporalAddress,
        // Add TLS configuration for production
        tls:
          process.env.NODE_ENV === 'production'
            ? {
                serverName: process.env.TEMPORAL_SERVER_NAME,
                serverRootCACertificate: Buffer.from(process.env.TEMPORAL_TLS_CERT || '', 'base64'),
                clientCertPair: process.env.TEMPORAL_CLIENT_CERT
                  ? {
                      crt: Buffer.from(process.env.TEMPORAL_CLIENT_CERT, 'base64'),
                      key: Buffer.from(process.env.TEMPORAL_CLIENT_KEY || '', 'base64'),
                    }
                  : undefined,
              }
            : false,
      })

      // Configure runtime options for optimal performance
      Runtime.install({
        logger: {
          level: process.env.NODE_ENV === 'production' ? 'INFO' : 'DEBUG',
          sink: {
            info: (message, meta) => ,
            warn: (message, meta) => ,
            error: (message, meta) => ,
            debug: (message, meta) => console.debug('🔍 Temporal:', message, meta),
            trace: (message, meta) => console.trace('🔎 Temporal:', message, meta),
          },
        },
        telemetryOptions: {
          metrics: {
            prometheus: {
              bindAddress: '0.0.0.0:9464', // Metrics endpoint for monitoring
            },
          },
        },
      })

      // Create worker with optimized configuration
      this.worker = await Worker.create({
        connection: this.connection,
        namespace: this.config.namespace,
        taskQueue: this.config.taskQueue!,

        // Register workflows
        workflowsPath: require.resolve('./temporal-workflows'),

        // Register activities
        activities,

        // Performance tuning
        maxConcurrentWorkflowTaskExecutions: this.config.maxConcurrentWorkflowTaskExecutions,
        maxConcurrentActivityTaskExecutions: this.config.maxConcurrentActivityTaskExecutions,
        maxCachedWorkflows: this.config.maxCachedWorkflows,

        // Reliability settings
        stickyQueueScheduleToStartTimeout: '10s',
        maxHeartbeatThrottleInterval: '60s',
        defaultHeartbeatThrottleInterval: '30s',

        // Resource management
        maxWorkflowsInCache: 1000,

        // Enable source maps for debugging
        enableSDKTracing: process.env.NODE_ENV !== 'production',

        // Graceful shutdown
        shutdownGraceTime: '30s',

        // Interceptors for monitoring and logging
        interceptors: {
          workflowModules: [require.resolve('./workflow-interceptors')],
          activityInbound: [require.resolve('./activity-interceptors')],
        },
      })

      
      console.log('📊 Worker configuration:', {
        taskQueue: this.config.taskQueue,
        maxWorkflows: this.config.maxConcurrentWorkflowTaskExecutions,
        maxActivities: this.config.maxConcurrentActivityTaskExecutions,
        namespace: this.config.namespace,
      })

      // Start processing
      await this.worker.run()
    } catch (error) {
      
      await this.shutdown()
      throw error
    }
  }

  async shutdown(): Promise<void> {
    if (!this.isRunning) return

    

    try {
      if (this.worker) {
        this.worker.shutdown()
        await this.worker.runUntil(async () => {
          // Wait for current workflows to complete
          return new Promise((resolve) => setTimeout(resolve, 5000))
        })
      }

      if (this.connection) {
        await this.connection.close()
      }

      this.isRunning = false
      
    } catch (error) {
      
      throw error
    }
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy'
    details: {
      connection: boolean
      worker: boolean
      taskQueue: string
      activePollers: number
    }
  }> {
    try {
      const isHealthy = this.isRunning && this.worker && this.connection

      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        details: {
          connection: !!this.connection,
          worker: !!this.worker,
          taskQueue: this.config.taskQueue!,
          activePollers: 0, // Would query actual poller count
        },
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          connection: false,
          worker: false,
          taskQueue: this.config.taskQueue!,
          activePollers: 0,
        },
      }
    }
  }

  getMetrics(): {
    workflowsProcessed: number
    activitiesProcessed: number
    errorsEncountered: number
    averageWorkflowDuration: number
  } {
    // In production, would return actual metrics from worker
    return {
      workflowsProcessed: 0,
      activitiesProcessed: 0,
      errorsEncountered: 0,
      averageWorkflowDuration: 0,
    }
  }
}

/**
 * Singleton worker instance for the application
 */
class WorkerManager {
  private static instance: WorkerManager
  private worker?: VoiceProcessingWorker

  private constructor() {}

  static getInstance(): WorkerManager {
    if (!WorkerManager.instance) {
      WorkerManager.instance = new WorkerManager()
    }
    return WorkerManager.instance
  }

  async getWorker(): Promise<VoiceProcessingWorker> {
    if (!this.worker) {
      this.worker = new VoiceProcessingWorker({
        taskQueue: 'voice-processing',
        maxConcurrentWorkflowTaskExecutions: parseInt(process.env.TEMPORAL_MAX_WORKFLOWS || '50'),
        maxConcurrentActivityTaskExecutions: parseInt(process.env.TEMPORAL_MAX_ACTIVITIES || '50'),
      })
    }
    return this.worker
  }

  async startWorker(): Promise<void> {
    if (!process.env.TEMPORAL_ENABLED || process.env.TEMPORAL_ENABLED !== 'true') {
      
      return
    }

    const worker = await this.getWorker()
    await worker.start()
  }

  async stopWorker(): Promise<void> {
    if (this.worker) {
      await this.worker.shutdown()
      this.worker = undefined
    }
  }

  async getWorkerHealth(): Promise<unknown> {
    if (!this.worker) {
      return { status: 'not_started' }
    }
    return await this.worker.healthCheck()
  }
}

export const workerManager = WorkerManager.getInstance()

/**
 * Initialize worker for voice processing
 * Call this from your application startup
 */
export async function initializeVoiceWorker(): Promise<void> {
  try {
    await workerManager.startWorker()
  } catch (error) {
    
    throw error
  }
}

/**
 * Gracefully shutdown the worker
 * Call this during application shutdown
 */
export async function shutdownVoiceWorker(): Promise<void> {
  try {
    await workerManager.stopWorker()
  } catch (error) {
    
    throw error
  }
}

/**
 * Get worker health status
 */
export async function getVoiceWorkerHealth(): Promise<unknown> {
  return await workerManager.getWorkerHealth()
}

// Auto-start worker if running as main module
if (require.main === module) {
  

  initializeVoiceWorker().catch((error) => {
    
    process.exit(1)
  })

  // Graceful shutdown handling
  process.on('SIGTERM', async () => {
    
    await shutdownVoiceWorker()
    process.exit(0)
  })

  process.on('SIGINT', async () => {
    
    await shutdownVoiceWorker()
    process.exit(0)
  })

  // Handle uncaught errors
  process.on('uncaughtException', async (error) => {
    
    await shutdownVoiceWorker()
    process.exit(1)
  })

  process.on('unhandledRejection', async (reason, promise) => {
    
    await shutdownVoiceWorker()
    process.exit(1)
  })
}

export default VoiceProcessingWorker
