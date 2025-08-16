/**
 * CoreFlow360 - Real-Time Analytics WebSocket Server
 * High-performance WebSocket server for streaming analytics data
 */

import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { z } from 'zod'
import { eventTracker } from '@/lib/events/enhanced-event-tracker'
import { paymentAnalytics } from '@/lib/billing/payment-analytics'
import { redis } from '@/lib/cache/unified-redis'

// WebSocket message schemas
export const SubscriptionSchema = z.object({
  channel: z.enum([
    'analytics:revenue',
    'analytics:users', 
    'analytics:performance',
    'analytics:anomalies',
    'analytics:conversions',
    'dashboard:metrics',
    'dashboard:alerts',
    'events:realtime'
  ]),
  filters: z.object({
    tenantId: z.string(),
    timeframe: z.enum(['1m', '5m', '15m', '1h', '24h']).default('5m'),
    metrics: z.array(z.string()).optional(),
    departments: z.array(z.string()).optional()
  })
})

export const StreamDataSchema = z.object({
  channel: z.string(),
  timestamp: z.date(),
  data: z.any(),
  metadata: z.object({
    tenantId: z.string(),
    source: z.string(),
    version: z.string().default('1.0')
  })
})

export type SubscriptionRequest = z.infer<typeof SubscriptionSchema>
export type StreamData = z.infer<typeof StreamDataSchema>

interface ClientSession {
  id: string
  tenantId: string
  userId: string
  subscriptions: Set<string>
  lastActivity: Date
  metadata: {
    userAgent?: string
    ip?: string
    department?: string
  }
}

export class AnalyticsWebSocketServer {
  private io: SocketIOServer
  private clients: Map<string, ClientSession> = new Map()
  private streamIntervals: Map<string, NodeJS.Timeout> = new Map()
  private metrics = {
    connectedClients: 0,
    messagesPerSecond: 0,
    subscriptionsCount: 0,
    dataPointsStreamed: 0
  }

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000
    })

    this.initializeEventHandlers()
    this.startMetricsCollection()
    this.startDataStreaming()
  }

  private initializeEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`[WebSocket] Client connected: ${socket.id}`)
      
      // Handle authentication
      socket.on('authenticate', async (authData) => {
        try {
          const session = await this.authenticateClient(socket.id, authData)
          if (session) {
            this.clients.set(socket.id, session)
            this.metrics.connectedClients++
            
            socket.emit('authenticated', { 
              success: true, 
              clientId: socket.id,
              capabilities: this.getClientCapabilities(session)
            })
            
            // Track connection
            await this.trackEvent('websocket_connected', {
              clientId: socket.id,
              tenantId: session.tenantId,
              userId: session.userId
            })
          } else {
            socket.emit('authentication_failed', { error: 'Invalid credentials' })
            socket.disconnect()
          }
        } catch (error) {
          console.error('[WebSocket] Authentication error:', error)
          socket.emit('authentication_failed', { error: 'Authentication failed' })
          socket.disconnect()
        }
      })

      // Handle channel subscriptions
      socket.on('subscribe', async (subscription: SubscriptionRequest) => {
        try {
          const parsed = SubscriptionSchema.parse(subscription)
          await this.handleSubscription(socket.id, parsed)
          
          socket.emit('subscription_confirmed', {
            channel: parsed.channel,
            filters: parsed.filters
          })
        } catch (error) {
          socket.emit('subscription_error', {
            error: error instanceof Error ? error.message : 'Subscription failed'
          })
        }
      })

      // Handle unsubscribe
      socket.on('unsubscribe', async (channel: string) => {
        await this.handleUnsubscription(socket.id, channel)
        socket.emit('unsubscribed', { channel })
      })

      // Handle real-time events
      socket.on('track_event', async (eventData) => {
        const client = this.clients.get(socket.id)
        if (client) {
          await this.handleRealTimeEvent(client, eventData)
        }
      })

      // Handle disconnection
      socket.on('disconnect', async (reason) => {
        console.log(`[WebSocket] Client disconnected: ${socket.id}, reason: ${reason}`)
        await this.handleDisconnection(socket.id)
      })

      // Handle ping/pong for connection health
      socket.on('ping', () => {
        const client = this.clients.get(socket.id)
        if (client) {
          client.lastActivity = new Date()
          socket.emit('pong', { timestamp: Date.now() })
        }
      })
    })
  }

  private async authenticateClient(socketId: string, authData: any): Promise<ClientSession | null> {
    try {
      // In production, validate JWT token or session
      const { token, tenantId, userId } = authData
      
      if (!token || !tenantId || !userId) {
        return null
      }

      // Validate token (simplified - in production use proper JWT validation)
      const isValidToken = await this.validateAuthToken(token)
      if (!isValidToken) {
        return null
      }

      return {
        id: socketId,
        tenantId,
        userId,
        subscriptions: new Set(),
        lastActivity: new Date(),
        metadata: {
          userAgent: authData.userAgent,
          ip: authData.ip,
          department: authData.department
        }
      }
    } catch (error) {
      console.error('[WebSocket] Authentication error:', error)
      return null
    }
  }

  private async validateAuthToken(token: string): Promise<boolean> {
    // Simplified validation - in production, validate JWT properly
    return token && token.length > 10
  }

  private getClientCapabilities(session: ClientSession) {
    return {
      canSubscribeToRealTimeEvents: true,
      canReceiveAnomalyAlerts: true,
      canAccessRevenuemetrics: session.metadata.department !== 'support',
      maxSubscriptions: 10,
      supportedChannels: [
        'analytics:revenue',
        'analytics:users',
        'analytics:performance',
        'analytics:anomalies',
        'analytics:conversions',
        'dashboard:metrics',
        'dashboard:alerts',
        'events:realtime'
      ]
    }
  }

  private async handleSubscription(socketId: string, subscription: SubscriptionRequest) {
    const client = this.clients.get(socketId)
    if (!client) return

    const channelKey = `${subscription.channel}:${client.tenantId}`
    client.subscriptions.add(channelKey)
    this.metrics.subscriptionsCount++

    // Join socket room for efficient broadcasting
    const socket = this.io.sockets.sockets.get(socketId)
    if (socket) {
      await socket.join(channelKey)
    }

    // Send initial data for the subscription
    await this.sendInitialData(socketId, subscription)

    // Track subscription
    await this.trackEvent('websocket_subscribed', {
      clientId: socketId,
      channel: subscription.channel,
      tenantId: client.tenantId,
      filters: subscription.filters
    })
  }

  private async handleUnsubscription(socketId: string, channel: string) {
    const client = this.clients.get(socketId)
    if (!client) return

    const channelKey = `${channel}:${client.tenantId}`
    client.subscriptions.delete(channelKey)
    this.metrics.subscriptionsCount--

    const socket = this.io.sockets.sockets.get(socketId)
    if (socket) {
      await socket.leave(channelKey)
    }
  }

  private async handleRealTimeEvent(client: ClientSession, eventData: any) {
    try {
      // Process and broadcast real-time event
      const processedEvent = {
        ...eventData,
        timestamp: new Date(),
        tenantId: client.tenantId,
        userId: client.userId
      }

      // Track the event
      await eventTracker.track({
        type: eventData.type || 'realtime_event',
        category: 'websocket',
        properties: processedEvent
      })

      // Broadcast to relevant subscribers
      const channelKey = `events:realtime:${client.tenantId}`
      this.io.to(channelKey).emit('realtime_event', processedEvent)
      
      this.metrics.messagesPerSecond++
    } catch (error) {
      console.error('[WebSocket] Real-time event error:', error)
    }
  }

  private async handleDisconnection(socketId: string) {
    const client = this.clients.get(socketId)
    if (client) {
      this.metrics.connectedClients--
      this.metrics.subscriptionsCount -= client.subscriptions.size
      
      // Track disconnection
      await this.trackEvent('websocket_disconnected', {
        clientId: socketId,
        tenantId: client.tenantId,
        sessionDuration: Date.now() - client.lastActivity.getTime()
      })
      
      this.clients.delete(socketId)
    }
  }

  private async sendInitialData(socketId: string, subscription: SubscriptionRequest) {
    try {
      const socket = this.io.sockets.sockets.get(socketId)
      if (!socket) return

      let initialData: any

      switch (subscription.channel) {
        case 'analytics:revenue':
          initialData = await this.getRevenueAnalytics(subscription.filters.tenantId)
          break
        case 'analytics:users':
          initialData = await this.getUserAnalytics(subscription.filters.tenantId)
          break
        case 'analytics:performance':
          initialData = await this.getPerformanceAnalytics(subscription.filters.tenantId)
          break
        case 'dashboard:metrics':
          initialData = await this.getDashboardMetrics(subscription.filters.tenantId)
          break
        default:
          initialData = { message: 'No initial data available' }
      }

      socket.emit('initial_data', {
        channel: subscription.channel,
        data: initialData,
        timestamp: new Date()
      })
    } catch (error) {
      console.error('[WebSocket] Initial data error:', error)
    }
  }

  private startDataStreaming() {
    // Stream analytics data every 30 seconds
    const analyticsInterval = setInterval(async () => {
      await this.streamAnalyticsData()
    }, 30000)

    // Stream metrics data every 10 seconds
    const metricsInterval = setInterval(async () => {
      await this.streamMetricsData()
    }, 10000)

    // Stream real-time events immediately
    const eventsInterval = setInterval(async () => {
      await this.streamRealtimeEvents()
    }, 5000)

    this.streamIntervals.set('analytics', analyticsInterval)
    this.streamIntervals.set('metrics', metricsInterval)
    this.streamIntervals.set('events', eventsInterval)
  }

  private async streamAnalyticsData() {
    try {
      // Get all tenants with active subscriptions
      const activeTenants = new Set<string>()
      this.clients.forEach(client => {
        if (client.subscriptions.size > 0) {
          activeTenants.add(client.tenantId)
        }
      })

      // Stream data for each active tenant
      for (const tenantId of activeTenants) {
        const [revenueData, userdata, performanceData] = await Promise.all([
          this.getRevenueAnalytics(tenantId),
          this.getUserAnalytics(tenantId),
          this.getPerformanceAnalytics(tenantId)
        ])

        // Broadcast to subscribers
        this.io.to(`analytics:revenue:${tenantId}`).emit('analytics_update', {
          channel: 'analytics:revenue',
          data: revenueData,
          timestamp: new Date()
        })

        this.io.to(`analytics:users:${tenantId}`).emit('analytics_update', {
          channel: 'analytics:users',
          data: userdata,
          timestamp: new Date()
        })

        this.io.to(`analytics:performance:${tenantId}`).emit('analytics_update', {
          channel: 'analytics:performance', 
          data: performanceData,
          timestamp: new Date()
        })

        this.metrics.dataPointsStreamed += 3
      }
    } catch (error) {
      console.error('[WebSocket] Analytics streaming error:', error)
    }
  }

  private async streamMetricsData() {
    try {
      const activeTenants = new Set<string>()
      this.clients.forEach(client => activeTenants.add(client.tenantId))

      for (const tenantId of activeTenants) {
        const metricsData = await this.getDashboardMetrics(tenantId)
        
        this.io.to(`dashboard:metrics:${tenantId}`).emit('metrics_update', {
          channel: 'dashboard:metrics',
          data: metricsData,
          timestamp: new Date()
        })

        this.metrics.dataPointsStreamed++
      }
    } catch (error) {
      console.error('[WebSocket] Metrics streaming error:', error)
    }
  }

  private async streamRealtimeEvents() {
    try {
      // Get recent events from the last 5 seconds
      const recentEvents = await this.getRecentEvents(5000)
      
      for (const event of recentEvents) {
        if (event.tenantId) {
          this.io.to(`events:realtime:${event.tenantId}`).emit('realtime_event', {
            channel: 'events:realtime',
            data: event,
            timestamp: new Date()
          })
        }
      }

      this.metrics.dataPointsStreamed += recentEvents.length
    } catch (error) {
      console.error('[WebSocket] Real-time events streaming error:', error)
    }
  }

  private async getRevenueAnalytics(tenantId: string) {
    try {
      const analytics = await paymentAnalytics.getPaymentAnalytics('day', tenantId)
      return {
        totalRevenue: analytics.overview.totalRevenue,
        dailyRevenue: analytics.overview.totalRevenue,
        mrr: analytics.overview.mrr,
        conversionRate: analytics.overview.conversionRate,
        churnRate: analytics.overview.churnRate,
        trend: 'up', // Would calculate from historical data
        change: 12.5 // Would calculate from historical data
      }
    } catch (error) {
      console.error('[WebSocket] Revenue analytics error:', error)
      return { error: 'Failed to fetch revenue analytics' }
    }
  }

  private async getUserAnalytics(tenantId: string) {
    // Mock user analytics - in production, query from database
    return {
      activeUsers: 5000 + Math.floor(Math.random() * 1000),
      newUsers: 50 + Math.floor(Math.random() * 20),
      sessionDuration: 15 + Math.random() * 10,
      bounceRate: 0.3 + Math.random() * 0.2,
      userGrowth: 8.5 + Math.random() * 5
    }
  }

  private async getPerformanceAnalytics(tenantId: string) {
    // Mock performance analytics - in production, query from monitoring systems
    return {
      responseTime: 200 + Math.random() * 100,
      errorRate: 0.1 + Math.random() * 0.2,
      uptime: 99.9,
      throughput: 1000 + Math.random() * 500,
      cpuUsage: 30 + Math.random() * 40,
      memoryUsage: 60 + Math.random() * 20
    }
  }

  private async getDashboardMetrics(tenantId: string) {
    // Combine multiple analytics for dashboard
    const [revenue, users, performance] = await Promise.all([
      this.getRevenueAnalytics(tenantId),
      this.getUserAnalytics(tenantId),
      this.getPerformanceAnalytics(tenantId)
    ])

    return {
      revenue,
      users,
      performance,
      alerts: await this.getActiveAlerts(tenantId),
      systemHealth: this.calculateSystemHealth()
    }
  }

  private async getActiveAlerts(tenantId: string) {
    // Mock alerts - in production, query from alert system
    return {
      critical: Math.floor(Math.random() * 2),
      high: Math.floor(Math.random() * 3),
      medium: Math.floor(Math.random() * 5),
      low: Math.floor(Math.random() * 10)
    }
  }

  private calculateSystemHealth() {
    return {
      status: 'healthy',
      score: 95 + Math.random() * 5,
      uptime: 99.9
    }
  }

  private async getRecentEvents(milliseconds: number) {
    // Mock recent events - in production, query from event store
    return [
      {
        id: `event_${Date.now()}`,
        type: 'user_action',
        tenantId: 'tenant_1',
        timestamp: new Date(),
        data: { action: 'page_view', page: '/dashboard' }
      }
    ]
  }

  private startMetricsCollection() {
    setInterval(() => {
      // Reset per-second metrics
      this.metrics.messagesPerSecond = 0
    }, 1000)

    // Log metrics every 30 seconds
    setInterval(() => {
      console.log('[WebSocket] Metrics:', this.metrics)
    }, 30000)
  }

  private async trackEvent(type: string, properties: any) {
    try {
      await eventTracker.track({
        type,
        category: 'websocket',
        properties
      })
    } catch (error) {
      console.error('[WebSocket] Event tracking error:', error)
    }
  }

  // Public methods
  public getMetrics() {
    return {
      ...this.metrics,
      timestamp: new Date()
    }
  }

  public getConnectedClients() {
    return Array.from(this.clients.values()).map(client => ({
      id: client.id,
      tenantId: client.tenantId,
      subscriptions: Array.from(client.subscriptions),
      lastActivity: client.lastActivity
    }))
  }

  public async broadcastToTenant(tenantId: string, channel: string, data: any) {
    const channelKey = `${channel}:${tenantId}`
    this.io.to(channelKey).emit('broadcast', {
      channel,
      data,
      timestamp: new Date()
    })
  }

  public shutdown() {
    // Clear all intervals
    this.streamIntervals.forEach(interval => clearInterval(interval))
    this.streamIntervals.clear()
    
    // Disconnect all clients
    this.io.disconnectSockets(true)
    
    console.log('[WebSocket] Server shutdown complete')
  }
}

export default AnalyticsWebSocketServer