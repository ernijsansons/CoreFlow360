/**
 * CoreFlow360 - Graceful Shutdown Handler
 * Ensures proper cleanup of resources during application shutdown
 */

import { PrismaClient } from '@prisma/client'
import { RedisClientType } from 'redis'
import fs from 'fs/promises'
import path from 'path'

interface ShutdownTask {
  name: string
  timeout: number
  handler: () => Promise<void>
  priority: number // Lower number = higher priority
}

interface ShutdownConfig {
  gracePeriod: number // Total time allowed for shutdown
  forceExitDelay: number // Additional time before force exit
  enableLogging: boolean
}

export class GracefulShutdownHandler {
  private static instance: GracefulShutdownHandler
  private shutdownTasks: ShutdownTask[] = []
  private isShuttingDown = false
  private shutdownPromise: Promise<void> | null = null
  private config: ShutdownConfig

  private constructor(config: Partial<ShutdownConfig> = {}) {
    this.config = {
      gracePeriod: 30000, // 30 seconds
      forceExitDelay: 5000, // 5 seconds after grace period
      enableLogging: true,
      ...config,
    }

    // Register signal handlers
    this.registerSignalHandlers()
  }

  static getInstance(config?: Partial<ShutdownConfig>): GracefulShutdownHandler {
    if (!GracefulShutdownHandler.instance) {
      GracefulShutdownHandler.instance = new GracefulShutdownHandler(config)
    }
    return GracefulShutdownHandler.instance
  }

  /**
   * Register a shutdown task
   */
  registerTask(task: ShutdownTask): void {
    if (this.isShuttingDown) {
      
      return
    }

    this.shutdownTasks.push(task)
    this.shutdownTasks.sort((a, b) => a.priority - b.priority)

    if (this.config.enableLogging) {
      console.log(`Registered shutdown task: ${task.name} (priority: ${task.priority})`)
    }
  }

  /**
   * Remove a shutdown task
   */
  unregisterTask(name: string): void {
    const index = this.shutdownTasks.findIndex((task) => task.name === name)
    if (index !== -1) {
      this.shutdownTasks.splice(index, 1)
      if (this.config.enableLogging) {
        console.log(`Unregistered shutdown task: ${name}`)
      }
    }
  }

  /**
   * Initiate graceful shutdown
   */
  async shutdown(signal: string = 'UNKNOWN'): Promise<void> {
    if (this.isShuttingDown) {
      // If shutdown is already in progress, return the existing promise
      return this.shutdownPromise || Promise.resolve()
    }

    this.isShuttingDown = true

    if (this.config.enableLogging) {
      console.log(`Starting graceful shutdown (signal: ${signal})...`)
    }

    this.shutdownPromise = this.performShutdown(signal)
    return this.shutdownPromise
  }

  /**
   * Check if shutdown is in progress
   */
  isShutdownInProgress(): boolean {
    return this.isShuttingDown
  }

  /**
   * Perform the actual shutdown sequence
   */
  private async performShutdown(_signal: string): Promise<void> {
    const startTime = Date.now()
    const tasks = [...this.shutdownTasks] // Create a copy to avoid modification during execution

    if (this.config.enableLogging) {
      console.log(`Executing ${tasks.length} shutdown tasks...`)
    }

    // Set up force exit timer
    const forceExitTimer = setTimeout(() => {
      console.error('Shutdown timeout exceeded. Forcing exit...')
      process.exit(1)
    }, this.config.gracePeriod + this.config.forceExitDelay)

    try {
      // Execute shutdown tasks in priority order
      await this.executeTasks(tasks)

      const duration = Date.now() - startTime
      if (this.config.enableLogging) {
        console.log(`Graceful shutdown completed in ${duration}ms`)
      }
    } catch (error) {
      console.error('Error during shutdown:', error)
      process.exit(1)
    } finally {
      clearTimeout(forceExitTimer)
      process.exit(0)
    }
  }

  /**
   * Execute shutdown tasks with individual timeouts
   */
  private async executeTasks(tasks: ShutdownTask[]): Promise<void> {
    const results: Array<{ name: string; success: boolean; duration: number; error?: Error }> = []

    for (const task of tasks) {
      const taskStartTime = Date.now()

      try {
        if (this.config.enableLogging) {
          console.log(`Executing shutdown task: ${task.name}...`)
        }

        // Execute task with timeout
        await this.executeTaskWithTimeout(task)

        const duration = Date.now() - taskStartTime
        results.push({ name: task.name, success: true, duration })

        if (this.config.enableLogging) {
          console.log(`✓ ${task.name} completed in ${duration}ms`)
        }
      } catch (error) {
        const duration = Date.now() - taskStartTime
        const err = error as Error
        results.push({ name: task.name, success: false, duration, error: err })

        console.error(`✗ ${task.name} failed after ${duration}ms - ${err.message}`)
      }
    }

    // Log summary
    if (this.config.enableLogging) {
      const successful = results.filter((r) => r.success).length
      const failed = results.length - successful
      console.log(`\nShutdown summary: ${successful} succeeded, ${failed} failed`)
    }
  }

  /**
   * Execute a single task with timeout
   */
  private async executeTaskWithTimeout(task: ShutdownTask): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Task '${task.name}' timed out after ${task.timeout}ms`))
      }, task.timeout)

      task
        .handler()
        .then(() => {
          clearTimeout(timer)
          resolve()
        })
        .catch((error) => {
          clearTimeout(timer)
          reject(error)
        })
    })
  }

  /**
   * Register signal handlers for graceful shutdown
   */
  private registerSignalHandlers(): void {
    const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'] as const

    signals.forEach((signal) => {
      process.on(signal, () => {
        
        this.shutdown(signal).catch((error) => {
          
          process.exit(1)
        })
      })
    })

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      
      this.shutdown('UNCAUGHT_EXCEPTION').catch(() => {
        process.exit(1)
      })
    })

    // Handle unhandled rejections
    process.on('unhandledRejection', (reason, promise) => {
      
      this.shutdown('UNHANDLED_REJECTION').catch(() => {
        process.exit(1)
      })
    })
  }
}

/**
 * Pre-configured shutdown tasks for common resources
 */
export const shutdownTasks = {
  /**
   * Close Prisma database connections
   */
  prisma: (prisma: PrismaClient): ShutdownTask => ({
    name: 'prisma_disconnect',
    timeout: 10000,
    priority: 1,
    handler: async () => {
      await prisma.$disconnect()
      
    },
  }),

  /**
   * Close Redis connections
   */
  redis: (redis: RedisClientType): ShutdownTask => ({
    name: 'redis_disconnect',
    timeout: 5000,
    priority: 2,
    handler: async () => {
      if (redis.isOpen) {
        await redis.quit()
        
      }
    },
  }),

  /**
   * Flush pending logs
   */
  logs: (): ShutdownTask => ({
    name: 'flush_logs',
    timeout: 3000,
    priority: 3,
    handler: async () => {
      // Flush any pending log operations
      await new Promise((resolve) => {
        process.stdout.write('', resolve)
        process.stderr.write('', resolve)
      })
      
    },
  }),

  /**
   * Complete in-flight HTTP requests
   */
  httpServer: (server: unknown): ShutdownTask => ({
    name: 'http_server_close',
    timeout: 15000,
    priority: 4,
    handler: async () => {
      return new Promise((resolve, reject) => {
        server.close((error: Error | undefined) => {
          if (error) {
            reject(error)
          } else {
            
            resolve(undefined)
          }
        })
      })
    },
  }),

  /**
   * Save application state
   */
  saveState: (saveFunction: () => Promise<void>): ShutdownTask => ({
    name: 'save_application_state',
    timeout: 8000,
    priority: 0, // Highest priority
    handler: async () => {
      await saveFunction()
      
    },
  }),

  /**
   * Clear temporary files
   */
  cleanupTempFiles: (tempDirs: string[]): ShutdownTask => ({
    name: 'cleanup_temp_files',
    timeout: 5000,
    priority: 5,
    handler: async () => {
      for (const dir of tempDirs) {
        try {
          const files = await fs.readdir(dir)
          for (const file of files) {
            if (file.startsWith('temp_') || file.includes('cache_')) {
              await fs.unlink(path.join(dir, file))
            }
          }
        } catch (error) {
          console.error(`Failed to clean up directory ${dir}:`, error)
        }
      }
      console.log('Temporary files cleaned up')
    },
  }),

  /**
   * Notify external services of shutdown
   */
  notifyServices: (notifyFunction: () => Promise<void>): ShutdownTask => ({
    name: 'notify_external_services',
    timeout: 10000,
    priority: 1,
    handler: async () => {
      await notifyFunction()
      
    },
  }),
}

/**
 * Create and configure the default shutdown handler
 */
export function setupGracefulShutdown(config?: Partial<ShutdownConfig>): GracefulShutdownHandler {
  const handler = GracefulShutdownHandler.getInstance(config)

  // Add default cleanup tasks
  handler.registerTask(shutdownTasks.logs())

  return handler
}

/**
 * Express.js middleware to check shutdown status
 */
export function shutdownMiddleware(shutdownHandler: GracefulShutdownHandler) {
  return (req: unknown, res: unknown, next: unknown) => {
    if (shutdownHandler.isShutdownInProgress()) {
      res.status(503).json({
        error: 'Service unavailable',
        message: 'Server is shutting down',
        timestamp: new Date().toISOString(),
      })
      return
    }
    next()
  }
}

/**
 * Next.js API middleware to check shutdown status
 */
export function nextShutdownMiddleware(shutdownHandler: GracefulShutdownHandler) {
  return (handler: Function) => {
    return async (req: unknown, res: unknown) => {
      if (shutdownHandler.isShutdownInProgress()) {
        return res.status(503).json({
          error: 'Service unavailable',
          message: 'Server is shutting down',
          timestamp: new Date().toISOString(),
        })
      }
      return handler(req, res)
    }
  }
}

// Export singleton instance
export const gracefulShutdown = setupGracefulShutdown()
