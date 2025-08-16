#!/usr/bin/env node

/**
 * CoreFlow360 - Production Server Startup Script
 * Starts the server with graceful shutdown handling
 */

const { createServer } = require('http')
const next = require('next')
const { parse } = require('url')

// Environment configuration
const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || 'localhost'
const port = parseInt(process.env.PORT || '3000')

console.log('=€ CoreFlow360 - Starting server...')
console.log(`=Í Environment: ${dev ? 'development' : 'production'}`)
console.log(`< Hostname: ${hostname}`)
console.log(`= Port: ${port}`)

// Initialize Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Import graceful shutdown after Next.js is available
let gracefulShutdown = null

app.prepare().then(() => {
  console.log(' Next.js app prepared')
  
  // Import server configuration
  const { initializeServer, getServerHealth, gracefulShutdown: shutdown } = require('../dist/lib/server-config')
  gracefulShutdown = shutdown
  
  // Initialize server with shutdown handlers
  initializeServer()
  
  // Create HTTP server
  const server = createServer(async (req, res) => {
    try {
      // Parse request URL
      const parsedUrl = parse(req.url, true)
      
      // Handle health check
      if (parsedUrl.pathname === '/health') {
        const health = getServerHealth()
        const statusCode = health.status === 'shutting_down' ? 503 : 200
        
        res.writeHead(statusCode, {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        })
        res.end(JSON.stringify(health, null, 2))
        return
      }
      
      // Check if server is shutting down
      if (gracefulShutdown && gracefulShutdown.isShutdownInProgress()) {
        res.writeHead(503, {
          'Content-Type': 'application/json',
          'Retry-After': '30'
        })
        res.end(JSON.stringify({
          error: 'Service unavailable',
          message: 'Server is shutting down',
          timestamp: new Date().toISOString()
        }))
        return
      }
      
      // Handle request with Next.js
      await handle(req, res, parsedUrl)
      
    } catch (error) {
      console.error('Error handling request:', error)
      
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({
          error: 'Internal server error',
          message: dev ? error.message : 'Something went wrong',
          timestamp: new Date().toISOString()
        }))
      }
    }
  })

  // Configure server options
  server.keepAliveTimeout = 65000 // Slightly higher than ALB timeout
  server.headersTimeout = 66000 // Higher than keepAliveTimeout
  
  // Start listening
  server.listen(port, hostname, (err) => {
    if (err) {
      console.error('L Failed to start server:', err)
      process.exit(1)
    }
    
    console.log(` Server ready on http://${hostname}:${port}`)
    console.log(`=Ú API Documentation: http://${hostname}:${port}/api/docs`)
    console.log(`=š Health Check: http://${hostname}:${port}/health`)
    
    if (dev) {
      console.log(`=' Development mode active`)
    }
  })
  
  // Register server shutdown task
  if (gracefulShutdown) {
    gracefulShutdown.registerTask({
      name: 'http_server_close',
      timeout: 15000,
      priority: 4,
      handler: async () => {
        return new Promise((resolve, reject) => {
          console.log('= Closing HTTP server...')
          server.close((error) => {
            if (error) {
              console.error('L Error closing server:', error)
              reject(error)
            } else {
              console.log(' HTTP server closed')
              resolve()
            }
          })
        })
      }
    })
  }
  
  // Handle server errors
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`L Port ${port} is already in use`)
      process.exit(1)
    } else {
      console.error('L Server error:', error)
    }
  })
  
  // Handle client errors (like invalid requests)
  server.on('clientError', (error, socket) => {
    console.warn('  Client error:', error.message)
    if (socket.writable) {
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n')
    }
  })
  
  // Graceful shutdown on process termination
  const shutdown = async (signal) => {
    console.log(`\n= Received ${signal}. Starting graceful shutdown...`)
    
    if (gracefulShutdown) {
      try {
        await gracefulShutdown.shutdown(signal)
      } catch (error) {
        console.error('L Error during graceful shutdown:', error)
        process.exit(1)
      }
    } else {
      console.log('  Graceful shutdown handler not available, forcing exit')
      process.exit(0)
    }
  }
  
  // Register signal handlers
  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGUSR2', () => shutdown('SIGUSR2'))
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('=¥ Uncaught Exception:', error)
    if (gracefulShutdown) {
      gracefulShutdown.shutdown('UNCAUGHT_EXCEPTION').catch(() => {
        process.exit(1)
      })
    } else {
      process.exit(1)
    }
  })
  
  // Handle unhandled rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('=¥ Unhandled Rejection at:', promise, 'reason:', reason)
    if (gracefulShutdown) {
      gracefulShutdown.shutdown('UNHANDLED_REJECTION').catch(() => {
        process.exit(1)
      })
    } else {
      process.exit(1)
    }
  })
  
  // Log memory usage periodically in development
  if (dev) {
    setInterval(() => {
      const usage = process.memoryUsage()
      console.log(`=Ê Memory: ${Math.round(usage.rss / 1024 / 1024)}MB RSS, ${Math.round(usage.heapUsed / 1024 / 1024)}MB Heap`)
    }, 60000) // Every minute
  }
  
}).catch((error) => {
  console.error('L Failed to initialize Next.js app:', error)
  process.exit(1)
})