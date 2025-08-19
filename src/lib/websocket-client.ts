/**
 * CoreFlow360 - WebSocket Client
 * Real-time connection management for live updates
 */

interface WebSocketMessage {
  type: string
  data: unknown
  timestamp: string
  clientId?: string
}

interface WebSocketOptions {
  reconnectInterval?: number
  maxReconnectAttempts?: number
  pingInterval?: number
  debug?: boolean
}

export class CoreFlowWebSocket {
  private ws: WebSocket | null = null
  private url: string
  private options: Required<WebSocketOptions>
  private reconnectAttempts = 0
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map()
  private pingTimer?: NodeJS.Timeout
  private isConnecting = false
  private connectionState: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected'

  constructor(url: string, options: WebSocketOptions = {}) {
    this.url = url
    this.options = {
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      pingInterval: 30000,
      debug: false,
      ...options,
    }
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting || this.connectionState === 'connected') {
        resolve()
        return
      }

      this.isConnecting = true
      this.connectionState = 'connecting'

      try {
        // Convert HTTP URL to WebSocket URL
        const wsUrl = this.url.replace(/^http/, 'ws')
        this.ws = new WebSocket(wsUrl)

        this.ws.onopen = () => {
          this.log('WebSocket connected')
          this.isConnecting = false
          this.connectionState = 'connected'
          this.reconnectAttempts = 0
          this.startPing()
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            this.log('Failed to parse WebSocket message:', error)
          }
        }

        this.ws.onclose = (event) => {
          this.log('WebSocket disconnected:', event.code, event.reason)
          this.isConnecting = false
          this.connectionState = 'disconnected'
          this.stopPing()

          if (!event.wasClean && this.reconnectAttempts < this.options.maxReconnectAttempts) {
            this.scheduleReconnect()
          }
        }

        this.ws.onerror = (error) => {
          this.log('WebSocket error:', error)
          this.isConnecting = false
          this.connectionState = 'error'
          reject(error)
        }
      } catch (error) {
        this.isConnecting = false
        this.connectionState = 'error'
        reject(error)
      }
    })
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }
    this.stopPing()
    this.connectionState = 'disconnected'
  }

  subscribe(eventType: string, callback: (data: unknown) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }

    this.listeners.get(eventType)!.add(callback)
    this.log(`Subscribed to ${eventType}`)

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType)
      if (listeners) {
        listeners.delete(callback)
        if (listeners.size === 0) {
          this.listeners.delete(eventType)
        }
      }
      this.log(`Unsubscribed from ${eventType}`)
    }
  }

  send(type: string, data: unknown): void {
    if (this.connectionState !== 'connected' || !this.ws) {
      this.log('Cannot send message - not connected')
      return
    }

    const message: WebSocketMessage = {
      type,
      data,
      timestamp: new Date().toISOString(),
    }

    try {
      this.ws.send(JSON.stringify(message))
      this.log('Sent message:', type)
    } catch (error) {
      this.log('Failed to send message:', error)
    }
  }

  getConnectionState(): string {
    return this.connectionState
  }

  isConnected(): boolean {
    return this.connectionState === 'connected'
  }

  private handleMessage(message: WebSocketMessage): void {
    this.log('Received message:', message.type)

    // Handle system messages
    if (message.type === 'ping') {
      this.send('pong', {})
      return
    }

    // Handle pong responses
    if (message.type === 'pong') {
      return
    }

    // Dispatch to listeners
    const listeners = this.listeners.get(message.type)
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(message.data)
        } catch (error) {
          this.log('Error in message listener:', error)
        }
      })
    }
  }

  private startPing(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
    }

    this.pingTimer = setInterval(() => {
      if (this.connectionState === 'connected') {
        this.send('ping', {})
      }
    }, this.options.pingInterval)
  }

  private stopPing(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
      this.pingTimer = undefined
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++
    const delay = this.options.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1)

    this.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)

    setTimeout(() => {
      this.connect().catch((error) => {
        this.log('Reconnect failed:', error)
        if (this.reconnectAttempts < this.options.maxReconnectAttempts) {
          this.scheduleReconnect()
        }
      })
    }, delay)
  }

  private log(..._args: unknown[]): void {
    if (this.options.debug) {
    }
  }
}

// Global WebSocket instance
let globalWebSocket: CoreFlowWebSocket | null = null

export function getWebSocketClient(): CoreFlowWebSocket {
  if (!globalWebSocket) {
    // Determine WebSocket URL based on current location
    const protocol =
      typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = typeof window !== 'undefined' ? window.location.host : 'localhost:3000'
    const wsUrl = `${protocol}//${host}/api/ws`

    globalWebSocket = new CoreFlowWebSocket(wsUrl, {
      debug: process.env.NODE_ENV === 'development',
      reconnectInterval: 2000,
      maxReconnectAttempts: 10,
    })
  }

  return globalWebSocket
}

// React hook for WebSocket functionality
export function useWebSocket() {
  const client = getWebSocketClient()

  return {
    client,
    subscribe: (eventType: string, callback: (data: unknown) => void) =>
      client.subscribe(eventType, callback),
    send: (type: string, data: unknown) => client.send(type, data),
    connect: () => client.connect(),
    disconnect: () => client.disconnect(),
    isConnected: () => client.isConnected(),
    connectionState: client.getConnectionState(),
  }
}

// Specific hooks for common real-time data
export function useLiveMetrics() {
  const { subscribe, connect, isConnected } = useWebSocket()

  return {
    subscribe: (callback: (metrics: unknown) => void) => subscribe('live_metrics', callback),
    connect,
    isConnected,
  }
}

export function useConversionEvents() {
  const { subscribe, send, connect, isConnected } = useWebSocket()

  return {
    subscribe: (callback: (event: unknown) => void) => subscribe('conversion_event', callback),
    trackEvent: (event: unknown) => send('track_conversion', event),
    connect,
    isConnected,
  }
}

export function useModuleUpdates() {
  const { subscribe, connect, isConnected } = useWebSocket()

  return {
    subscribe: (callback: (moduleUpdate: unknown) => void) => subscribe('module_update', callback),
    connect,
    isConnected,
  }
}
