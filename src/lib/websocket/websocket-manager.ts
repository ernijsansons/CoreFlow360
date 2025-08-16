// WebSocket Manager for Real-time Updates
// Handles all WebSocket connections and real-time data streaming

export interface WebSocketMessage {
  type: string
  payload: any
  timestamp: number
  userId?: string
  tenantId?: string
}

export interface PerformanceMetrics {
  responseTime: number
  activeUsers: number
  successRate: number
  uptime: number
  aiProcessesPerSecond: number
  timestamp: number
}

export interface BusinessMetrics {
  revenue: number
  growth: number
  deals: number
  performance: number
  timestamp: number
}

export type MetricsType = 'performance' | 'business' | 'ai-insights' | 'notifications'

class WebSocketManager {
  private connections: Map<string, WebSocket> = new Map()
  private subscribers: Map<string, Set<(data: any) => void>> = new Map()
  private reconnectAttempts: Map<string, number> = new Map()
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000 // Start with 1 second
  private isConnecting: Set<string> = new Set()

  constructor() {
    // Initialize subscribers for different metric types
    this.subscribers.set('performance', new Set())
    this.subscribers.set('business', new Set())
    this.subscribers.set('ai-insights', new Set())
    this.subscribers.set('notifications', new Set())
  }

  /**
   * Connect to a specific WebSocket endpoint
   */
  async connect(
    type: MetricsType, 
    url?: string,
    options: {
      userId?: string
      tenantId?: string
      authToken?: string
    } = {}
  ): Promise<WebSocket> {
    if (this.connections.has(type)) {
      return this.connections.get(type)!
    }

    if (this.isConnecting.has(type)) {
      // Wait for existing connection attempt
      return new Promise((resolve, reject) => {
        const checkConnection = () => {
          const ws = this.connections.get(type)
          if (ws) {
            resolve(ws)
          } else if (!this.isConnecting.has(type)) {
            reject(new Error('Connection failed'))
          } else {
            setTimeout(checkConnection, 100)
          }
        }
        checkConnection()
      })
    }

    this.isConnecting.add(type)

    try {
      const wsUrl = url || this.getWebSocketUrl(type, options)
      const ws = new WebSocket(wsUrl)

      // Connection promise
      const connectionPromise = new Promise<WebSocket>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error(`WebSocket connection timeout for ${type}`))
        }, 10000) // 10 second timeout

        ws.onopen = () => {
          clearTimeout(timeout)
          console.log(`✅ WebSocket connected: ${type}`)
          this.connections.set(type, ws)
          this.reconnectAttempts.set(type, 0)
          this.isConnecting.delete(type)
          
          // Send authentication if provided
          if (options.authToken) {
            this.send(type, {
              type: 'authenticate',
              payload: { 
                token: options.authToken,
                userId: options.userId,
                tenantId: options.tenantId
              },
              timestamp: Date.now()
            })
          }

          resolve(ws)
        }

        ws.onerror = (error) => {
          clearTimeout(timeout)
          console.error(`❌ WebSocket error (${type}):`, error)
          this.isConnecting.delete(type)
          reject(error)
        }
      })

      // Set up message handling
      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          this.handleMessage(type, message)
        } catch (error) {
          console.error(`Failed to parse WebSocket message (${type}):`, error)
        }
      }

      // Handle disconnection
      ws.onclose = (event) => {
        console.log(`🔌 WebSocket closed (${type}):`, event.code, event.reason)
        this.connections.delete(type)
        this.isConnecting.delete(type)

        // Attempt reconnection unless it was intentional
        if (event.code !== 1000) { // 1000 = normal closure
          this.scheduleReconnect(type, url, options)
        }
      }

      return await connectionPromise

    } catch (error) {
      this.isConnecting.delete(type)
      throw error
    }
  }

  /**
   * Subscribe to WebSocket messages of a specific type
   */
  subscribe(type: MetricsType, callback: (data: any) => void): () => void {
    const subscribers = this.subscribers.get(type)
    if (subscribers) {
      subscribers.add(callback)
    }

    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(type)
      if (subscribers) {
        subscribers.delete(callback)
      }
    }
  }

  /**
   * Send a message through the WebSocket
   */
  send(type: MetricsType, message: WebSocketMessage): boolean {
    const ws = this.connections.get(type)
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
      return true
    }
    return false
  }

  /**
   * Disconnect a specific WebSocket
   */
  disconnect(type: MetricsType): void {
    const ws = this.connections.get(type)
    if (ws) {
      ws.close(1000, 'Client disconnect')
      this.connections.delete(type)
    }
  }

  /**
   * Disconnect all WebSockets
   */
  disconnectAll(): void {
    for (const [type] of this.connections) {
      this.disconnect(type)
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(type: MetricsType): 'connected' | 'connecting' | 'disconnected' {
    if (this.isConnecting.has(type)) return 'connecting'
    
    const ws = this.connections.get(type)
    if (ws && ws.readyState === WebSocket.OPEN) return 'connected'
    
    return 'disconnected'
  }

  /**
   * Generate WebSocket URL based on environment and type
   */
  private getWebSocketUrl(type: MetricsType, options: any): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_WS_HOST || window.location.host
      : 'localhost:3000'

    let endpoint = ''
    switch (type) {
      case 'performance':
        endpoint = '/api/ws/performance'
        break
      case 'business':
        endpoint = '/api/ws/business-metrics'
        break
      case 'ai-insights':
        endpoint = '/api/ws/ai-insights'
        break
      case 'notifications':
        endpoint = '/api/ws/notifications'
        break
      default:
        endpoint = '/api/ws/general'
    }

    const params = new URLSearchParams()
    if (options.userId) params.set('userId', options.userId)
    if (options.tenantId) params.set('tenantId', options.tenantId)

    const queryString = params.toString()
    return `${protocol}//${host}${endpoint}${queryString ? '?' + queryString : ''}`
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(type: MetricsType, message: WebSocketMessage): void {
    const subscribers = this.subscribers.get(type)
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(message.payload)
        } catch (error) {
          console.error(`Error in WebSocket subscriber (${type}):`, error)
        }
      })
    }
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  private scheduleReconnect(type: MetricsType, url?: string, options: any = {}): void {
    const attempts = this.reconnectAttempts.get(type) || 0
    
    if (attempts >= this.maxReconnectAttempts) {
      console.error(`❌ Max reconnection attempts reached for ${type}`)
      return
    }

    const delay = Math.min(this.reconnectDelay * Math.pow(2, attempts), 30000) // Max 30 seconds
    this.reconnectAttempts.set(type, attempts + 1)

    console.log(`🔄 Reconnecting ${type} in ${delay}ms (attempt ${attempts + 1})`)

    setTimeout(() => {
      this.connect(type, url, options).catch(error => {
        console.error(`Reconnection failed for ${type}:`, error)
      })
    }, delay)
  }
}

// Singleton instance
const websocketManager = new WebSocketManager()

import { useState, useEffect } from 'react'

// React hook for WebSocket connections
export function useWebSocket(
  type: MetricsType, 
  options?: {
    url?: string
    userId?: string
    tenantId?: string
    authToken?: string
    autoConnect?: boolean
  }
) {
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected')
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (options?.autoConnect !== false) {
      // Auto-connect on mount
      websocketManager.connect(type, options?.url, {
        userId: options?.userId,
        tenantId: options?.tenantId,
        authToken: options?.authToken
      }).catch(err => {
        setError(err)
        setConnectionStatus('disconnected')
      })
    }

    // Subscribe to messages
    const unsubscribe = websocketManager.subscribe(type, (newData) => {
      setData(newData)
      setError(null)
    })

    // Monitor connection status
    const statusInterval = setInterval(() => {
      setConnectionStatus(websocketManager.getConnectionStatus(type))
    }, 1000)

    return () => {
      unsubscribe()
      clearInterval(statusInterval)
    }
  }, [type, options?.url, options?.userId, options?.tenantId, options?.authToken, options?.autoConnect])

  return {
    data,
    connectionStatus,
    error,
    send: (message: any) => websocketManager.send(type, {
      type: 'client_message',
      payload: message,
      timestamp: Date.now(),
      userId: options?.userId,
      tenantId: options?.tenantId
    }),
    connect: () => websocketManager.connect(type, options?.url, options),
    disconnect: () => websocketManager.disconnect(type)
  }
}

// Performance metrics mock data generator (for development)
export function startMockPerformanceStream(): () => void {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('Mock performance stream should only be used in development')
    return () => {}
  }

  const interval = setInterval(() => {
    const mockMetrics: PerformanceMetrics = {
      responseTime: 45 + Math.random() * 15, // 45-60ms
      activeUsers: 1200 + Math.floor(Math.random() * 100),
      successRate: 98.5 + Math.random() * 1.4, // 98.5-99.9%
      uptime: 99.97 + Math.random() * 0.03,
      aiProcessesPerSecond: 180 + Math.floor(Math.random() * 40),
      timestamp: Date.now()
    }

    // Simulate WebSocket message to subscribers
    const subscribers = websocketManager['subscribers'].get('performance')
    if (subscribers) {
      subscribers.forEach(callback => callback(mockMetrics))
    }
  }, 2000)

  return () => clearInterval(interval)
}

export default websocketManager

// Types export
export type { WebSocketMessage, PerformanceMetrics, BusinessMetrics, MetricsType }