/**
 * CoreFlow360 - WebSocket Server Integration
 * Integration layer for Next.js custom server with WebSocket support
 */

import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { AnalyticsWebSocketServer } from '@/lib/websocket/analytics-websocket-server'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

// Initialize Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

let wsServer: AnalyticsWebSocketServer | null = null

async function startServer() {
  try {
    await app.prepare()

    // Create HTTP server
    const server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url!, true)
        await handle(req, res, parsedUrl)
      } catch (err) {
        res.statusCode = 500
        res.end('Internal server error')
      }
    })

    // Initialize WebSocket server
    wsServer = new AnalyticsWebSocketServer(server)

    // Start listening
    server.listen(port, () => {})

    // Graceful shutdown
    const gracefulShutdown = () => {
      if (wsServer) {
        wsServer.shutdown()
      }

      server.close(() => {
        process.exit(0)
      })
    }

    process.on('SIGTERM', gracefulShutdown)
    process.on('SIGINT', gracefulShutdown)
  } catch (err) {
    process.exit(1)
  }
}

// Export for use in other contexts
export { wsServer }

// Start server if this file is run directly
if (require.main === module) {
  startServer()
}

export default startServer
