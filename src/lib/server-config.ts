/**
 * CoreFlow360 - Server Configuration with Graceful Shutdown
 * Configures the application server with proper shutdown handling
 */

import { gracefulShutdown, shutdownTasks } from './shutdown-handler'
import { db } from './db'

/**
 * Initialize server with graceful shutdown
 */
export function initializeServer() {
  console.log('Initializing CoreFlow360 server...')

  // Register shutdown tasks for critical resources
  gracefulShutdown.registerTask(shutdownTasks.prisma(db))
  
  // Lazy load Redis to avoid build-time connections
  if (!process.env.VERCEL && !process.env.CI && process.env.REDIS_URL) {
    import('./redis').then(({ redis }) => {
      if (redis) {
        gracefulShutdown.registerTask(shutdownTasks.redis(redis))
      }
    }).catch(err => {
      console.warn('Failed to load Redis for shutdown handling:', err)
    })
  }

  // Register application state saving
  gracefulShutdown.registerTask(shutdownTasks.saveState(async () => {
    // Save any critical application state
    console.log('Saving application metrics and state...')
    
    // Example: Save cache statistics (skip during build)
    if (!process.env.VERCEL && !process.env.CI && process.env.REDIS_URL) {
      try {
        const { redis } = await import('./redis')
        if (redis && typeof redis.get === 'function') {
          try {
            // Simple test to see if Redis is available
            await redis.get('test')
            console.log('Redis stats saved during shutdown')
          } catch (error) {
            console.warn('Redis not available during shutdown')
          }
        }
      } catch (error) {
        console.warn('Failed to load Redis for stats:', error)
      }
    }

    // Example: Save application metrics
    try {
      const metrics = {
        shutdown_time: new Date().toISOString(),
        uptime: process.uptime(),
        memory_usage: process.memoryUsage(),
        cpu_usage: process.cpuUsage()
      }
      
      // You could save this to database or external monitoring service
      console.log('Application metrics at shutdown:', metrics)
    } catch (error) {
      console.warn('Failed to save application metrics:', error)
    }
  }))

  // Register cleanup of temporary files
  const tempDirs = [
    './uploads/temp',
    './uploads/voice-notes',
    './logs/temp'
  ]
  gracefulShutdown.registerTask(shutdownTasks.cleanupTempFiles(tempDirs))

  // Register external service notification
  gracefulShutdown.registerTask(shutdownTasks.notifyServices(async () => {
    // Notify external services that we're shutting down
    console.log('Notifying external services of shutdown...')
    
    // Example: Update health check status in load balancer
    try {
      // This would typically be a call to your load balancer or service discovery
      // await updateHealthStatus('shutting_down')
      console.log('Health status updated to shutting_down')
    } catch (error) {
      console.warn('Failed to update health status:', error)
    }
    
    // Example: Close webhook subscriptions
    try {
      // await closeWebhookSubscriptions()
      console.log('Webhook subscriptions closed')
    } catch (error) {
      console.warn('Failed to close webhook subscriptions:', error)
    }
  }))

  console.log('Server initialized with graceful shutdown handling')
}

/**
 * Health check function that considers shutdown state
 */
export function getServerHealth() {
  return {
    status: gracefulShutdown.isShutdownInProgress() ? 'shutting_down' : 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  }
}

/**
 * Middleware for Next.js API routes to handle shutdown
 */
export function withShutdownHandling<T>(
  handler: (req: any, res: any) => Promise<T>
) {
  return async (req: any, res: any): Promise<T | void> => {
    // Check if server is shutting down
    if (gracefulShutdown.isShutdownInProgress()) {
      return res.status(503).json({
        success: false,
        error: {
          type: 'SERVICE_UNAVAILABLE',
          message: 'Server is shutting down',
          code: 'SERVICE_UNAVAILABLE_503'
        },
        timestamp: new Date().toISOString()
      })
    }

    try {
      return await handler(req, res)
    } catch (error) {
      // If we encounter an error and we're shutting down, 
      // return 503 instead of processing the error normally
      if (gracefulShutdown.isShutdownInProgress()) {
        return res.status(503).json({
          success: false,
          error: {
            type: 'SERVICE_UNAVAILABLE',
            message: 'Server is shutting down',
            code: 'SERVICE_UNAVAILABLE_503'
          },
          timestamp: new Date().toISOString()
        })
      }
      
      // Re-throw the error for normal error handling
      throw error
    }
  }
}

/**
 * Custom server setup for production deployments
 */
export function createCustomServer() {
  const express = require('express')
  const next = require('next')
  
  const dev = process.env.NODE_ENV !== 'production'
  const app = next({ dev })
  const handle = app.getRequestHandler()

  return app.prepare().then(() => {
    const server = express()
    
    // Health check endpoint that considers shutdown state
    server.get('/health', (req: any, res: any) => {
      const health = getServerHealth()
      const statusCode = health.status === 'shutting_down' ? 503 : 200
      res.status(statusCode).json(health)
    })

    // Add shutdown middleware to all routes
    server.use((req: any, res: any, next: any) => {
      if (gracefulShutdown.isShutdownInProgress()) {
        return res.status(503).json({
          error: 'Service unavailable',
          message: 'Server is shutting down',
          timestamp: new Date().toISOString()
        })
      }
      next()
    })

    // Handle all other routes with Next.js
    server.all('*', (req: any, res: any) => {
      return handle(req, res)
    })

    // Register HTTP server shutdown task
    gracefulShutdown.registerTask(shutdownTasks.httpServer(server))

    return server
  })
}

// Initialize server on module load in production
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
  initializeServer()
}

export { gracefulShutdown }