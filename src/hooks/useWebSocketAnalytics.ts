/**
 * CoreFlow360 - WebSocket Analytics Hook
 * React hook for real-time analytics data streaming
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { io, Socket } from 'socket.io-client'

export interface AnalyticsData {
  revenue: {
    totalRevenue: number
    dailyRevenue: number
    mrr: number
    conversionRate: number
    churnRate: number
    trend: 'up' | 'down' | 'stable'
    change: number
  }
  users: {
    activeUsers: number
    newUsers: number
    sessionDuration: number
    bounceRate: number
    userGrowth: number
  }
  performance: {
    responseTime: number
    errorRate: number
    uptime: number
    throughput: number
    cpuUsage: number
    memoryUsage: number
  }
  alerts: {
    critical: number
    high: number
    medium: number
    low: number
  }
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical'
    score: number
    uptime: number
  }
}

export interface RealtimeEvent {
  id: string
  type: string
  timestamp: Date
  data: any
  tenantId: string
  userId?: string
}

export interface WebSocketMetrics {
  connected: boolean
  connectionId?: string
  lastUpdate?: Date
  latency?: number
  reconnectAttempts: number
  subscriptions: string[]
  messagesReceived: number
  errors: string[]
}

interface UseWebSocketAnalyticsOptions {
  autoConnect?: boolean
  autoReconnect?: boolean
  maxReconnectAttempts?: number
  subscriptions?: string[]
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Error) => void
  onData?: (channel: string, data: any) => void
}

interface UseWebSocketAnalyticsReturn {
  // Connection state
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  metrics: WebSocketMetrics

  // Data streams
  analyticsData: AnalyticsData | null
  realtimeEvents: RealtimeEvent[]
  
  // Connection methods
  connect: () => Promise<void>
  disconnect: () => void
  reconnect: () => Promise<void>
  
  // Subscription methods
  subscribe: (channel: string, filters?: any) => Promise<void>
  unsubscribe: (channel: string) => Promise<void>
  
  // Event methods
  trackEvent: (eventType: string, data: any) => void
  
  // Data methods
  getLatestData: (channel: string) => any
  clearEvents: () => void
}

export function useWebSocketAnalytics(
  options: UseWebSocketAnalyticsOptions = {}
): UseWebSocketAnalyticsReturn {
  const { data: session } = useSession()
  const {
    autoConnect = true,
    autoReconnect = true,
    maxReconnectAttempts = 5,
    subscriptions = ['dashboard:metrics', 'events:realtime'],
    onConnect,
    onDisconnect,
    onError,
    onData
  } = options

  // State
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [realtimeEvents, setRealtimeEvents] = useState<RealtimeEvent[]>([])
  const [metrics, setMetrics] = useState<WebSocketMetrics>({
    connected: false,
    reconnectAttempts: 0,
    subscriptions: [],
    messagesReceived: 0,
    errors: []
  })

  // Refs
  const socketRef = useRef<Socket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastPingRef = useRef<number>(0)
  const dataBufferRef = useRef<Map<string, any>>(new Map())

  // Connect to WebSocket server
  const connect = useCallback(async () => {
    if (!session?.user?.tenantId || isConnecting || isConnected) return

    try {
      setIsConnecting(true)
      setError(null)

      const socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3000', {
        transports: ['websocket', 'polling'],
        auth: {
          token: session.accessToken || 'mock_token',
          tenantId: session.user.tenantId,
          userId: session.user.id || session.user.email,
          userAgent: navigator.userAgent,
          department: session.user.department
        },
        forceNew: true
      })

      socketRef.current = socket

      // Set up event handlers
      socket.on('connect', () => {
        console.log('[WebSocket] Connected with ID:', socket.id)
        setIsConnected(true)
        setIsConnecting(false)
        
        setMetrics(prev => ({
          ...prev,
          connected: true,
          connectionId: socket.id,
          reconnectAttempts: 0
        }))

        // Authenticate
        socket.emit('authenticate', {
          token: session.accessToken || 'mock_token',
          tenantId: session.user.tenantId,
          userId: session.user.id || session.user.email,
          userAgent: navigator.userAgent,
          department: session.user.department
        })

        onConnect?.()
      })

      socket.on('authenticated', async (data) => {
        console.log('[WebSocket] Authenticated:', data)
        
        // Subscribe to default channels
        for (const channel of subscriptions) {
          await subscribeToChannel(channel)
        }
      })

      socket.on('authentication_failed', (data) => {
        console.error('[WebSocket] Authentication failed:', data)
        setError('Authentication failed')
        setIsConnecting(false)
      })

      socket.on('disconnect', (reason) => {
        console.log('[WebSocket] Disconnected:', reason)
        setIsConnected(false)
        setMetrics(prev => ({ ...prev, connected: false }))
        
        onDisconnect?.()

        // Auto-reconnect if enabled
        if (autoReconnect && reason !== 'io client disconnect') {
          scheduleReconnect()
        }
      })

      socket.on('connect_error', (err) => {
        console.error('[WebSocket] Connection error:', err)
        setError(err.message)
        setIsConnecting(false)
        
        onError?.(err)

        if (autoReconnect) {
          scheduleReconnect()
        }
      })

      // Data handlers
      socket.on('initial_data', (data) => {
        console.log('[WebSocket] Initial data received:', data.channel)
        handleDataUpdate(data.channel, data.data)
      })

      socket.on('analytics_update', (data) => {
        handleDataUpdate(data.channel, data.data)
        setMetrics(prev => ({ ...prev, messagesReceived: prev.messagesReceived + 1, lastUpdate: new Date() }))
      })

      socket.on('metrics_update', (data) => {
        if (data.channel === 'dashboard:metrics') {
          setAnalyticsData(data.data)
        }
        handleDataUpdate(data.channel, data.data)
        setMetrics(prev => ({ ...prev, messagesReceived: prev.messagesReceived + 1, lastUpdate: new Date() }))
      })

      socket.on('realtime_event', (data) => {
        const event: RealtimeEvent = {
          ...data.data,
          timestamp: new Date(data.timestamp)
        }
        
        setRealtimeEvents(prev => [...prev.slice(-49), event]) // Keep last 50 events
        handleDataUpdate(data.channel, event)
        setMetrics(prev => ({ ...prev, messagesReceived: prev.messagesReceived + 1 }))
      })

      socket.on('subscription_confirmed', (data) => {
        console.log('[WebSocket] Subscription confirmed:', data.channel)
        setMetrics(prev => ({
          ...prev,
          subscriptions: [...prev.subscriptions, data.channel]
        }))
      })

      socket.on('subscription_error', (data) => {
        console.error('[WebSocket] Subscription error:', data)
        setError(data.error)
      })

      socket.on('pong', (data) => {
        const latency = Date.now() - lastPingRef.current
        setMetrics(prev => ({ ...prev, latency }))
      })

      // Start ping/pong for latency measurement
      const pingInterval = setInterval(() => {
        if (socket.connected) {
          lastPingRef.current = Date.now()
          socket.emit('ping')
        }
      }, 30000)

      // Cleanup on unmount
      return () => {
        clearInterval(pingInterval)
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed')
      setIsConnecting(false)
      onError?.(err instanceof Error ? err : new Error('Connection failed'))
    }
  }, [session, isConnecting, isConnected, subscriptions, autoReconnect, onConnect, onDisconnect, onError])

  const subscribeToChannel = useCallback(async (channel: string, filters?: any) => {
    const socket = socketRef.current
    if (!socket || !isConnected) return

    const subscriptionData = {
      channel,
      filters: {
        tenantId: session?.user?.tenantId || '',
        timeframe: '5m' as const,
        ...filters
      }
    }

    socket.emit('subscribe', subscriptionData)
  }, [isConnected, session?.user?.tenantId])

  const handleDataUpdate = useCallback((channel: string, data: any) => {
    // Store in buffer for getLatestData
    dataBufferRef.current.set(channel, data)
    
    // Call custom data handler
    onData?.(channel, data)
  }, [onData])

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) return

    setMetrics(prev => {
      if (prev.reconnectAttempts >= maxReconnectAttempts) {
        setError('Max reconnection attempts reached')
        return prev
      }

      const delay = Math.min(1000 * Math.pow(2, prev.reconnectAttempts), 30000) // Exponential backoff, max 30s

      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectTimeoutRef.current = null
        connect()
      }, delay)

      return {
        ...prev,
        reconnectAttempts: prev.reconnectAttempts + 1
      }
    })
  }, [maxReconnectAttempts, connect])

  // Public methods
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }

    setIsConnected(false)
    setIsConnecting(false)
    setMetrics(prev => ({ ...prev, connected: false }))
  }, [])

  const reconnect = useCallback(async () => {
    disconnect()
    await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1s before reconnecting
    await connect()
  }, [disconnect, connect])

  const subscribe = useCallback(async (channel: string, filters?: any) => {
    await subscribeToChannel(channel, filters)
  }, [subscribeToChannel])

  const unsubscribe = useCallback(async (channel: string) => {
    const socket = socketRef.current
    if (!socket || !isConnected) return

    socket.emit('unsubscribe', channel)
    
    setMetrics(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.filter(s => s !== channel)
    }))
  }, [isConnected])

  const trackEvent = useCallback((eventType: string, data: any) => {
    const socket = socketRef.current
    if (!socket || !isConnected) return

    socket.emit('track_event', {
      type: eventType,
      data,
      timestamp: new Date()
    })
  }, [isConnected])

  const getLatestData = useCallback((channel: string) => {
    return dataBufferRef.current.get(channel)
  }, [])

  const clearEvents = useCallback(() => {
    setRealtimeEvents([])
  }, [])

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && session?.user?.tenantId && !isConnected && !isConnecting) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [autoConnect, session?.user?.tenantId, connect, disconnect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      disconnect()
    }
  }, [disconnect])

  return {
    // Connection state
    isConnected,
    isConnecting,
    error,
    metrics,

    // Data streams
    analyticsData,
    realtimeEvents,

    // Connection methods
    connect,
    disconnect,
    reconnect,

    // Subscription methods
    subscribe,
    unsubscribe,

    // Event methods
    trackEvent,

    // Data methods
    getLatestData,
    clearEvents
  }
}

export default useWebSocketAnalytics