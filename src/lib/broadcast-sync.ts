/**
 * CoreFlow360 - Broadcast Channel State Synchronization
 * Synchronizes state across browser tabs/windows
 */

type MessageType = 'refresh' | 'invalidate' | 'update'

interface BroadcastMessage {
  type: MessageType
  entity: string
  id?: string
  data?: unknown
  timestamp: number
}

class BroadcastSync {
  private channel: BroadcastChannel | null = null
  private listeners: Map<string, Set<(message: BroadcastMessage) => void>> = new Map()
  private isSupported: boolean

  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'BroadcastChannel' in window

    if (this.isSupported) {
      try {
        this.channel = new BroadcastChannel('coreflow360-sync')
        this.setupMessageHandler()
      } catch (error) {
        this.isSupported = false
      }
    }
  }

  private setupMessageHandler() {
    if (!this.channel) return

    this.channel.onmessage = (event: MessageEvent<BroadcastMessage>) => {
      const message = event.data

      // Validate message structure
      if (!message || typeof message !== 'object' || !message.type || !message.entity) {
        return
      }

      // Ignore old messages (more than 5 seconds old)
      if (Date.now() - message.timestamp > 5000) {
        return
      }

      // Notify all listeners for this entity
      const entityListeners = this.listeners.get(message.entity)
      if (entityListeners) {
        entityListeners.forEach((listener) => {
          try {
            listener(message)
          } catch (error) {}
        })
      }

      // Notify global listeners (listening to '*')
      const globalListeners = this.listeners.get('*')
      if (globalListeners) {
        globalListeners.forEach((listener) => {
          try {
            listener(message)
          } catch (error) {}
        })
      }
    }
  }

  /**
   * Send a message to all other tabs/windows
   */
  send(type: MessageType, entity: string, id?: string, data?: unknown) {
    if (!this.isSupported || !this.channel) {
      return
    }

    const message: BroadcastMessage = {
      type,
      entity,
      id,
      data,
      timestamp: Date.now(),
    }

    try {
      this.channel.postMessage(message)
    } catch (error) {}
  }

  /**
   * Listen for messages for a specific entity or all entities (*)
   */
  on(entity: string, callback: (message: BroadcastMessage) => void) {
    if (!this.isSupported) {
      return () => {} // Return noop unsubscribe function
    }

    if (!this.listeners.has(entity)) {
      this.listeners.set(entity, new Set())
    }

    this.listeners.get(entity)!.add(callback)

    // Return unsubscribe function
    return () => {
      const entityListeners = this.listeners.get(entity)
      if (entityListeners) {
        entityListeners.delete(callback)
        if (entityListeners.size === 0) {
          this.listeners.delete(entity)
        }
      }
    }
  }

  /**
   * Notify other tabs that an entity needs to be refreshed
   */
  notifyRefresh(entity: string, id?: string) {
    this.send('refresh', entity, id)
  }

  /**
   * Notify other tabs that cache should be invalidated
   */
  notifyInvalidate(entity: string, id?: string) {
    this.send('invalidate', entity, id)
  }

  /**
   * Notify other tabs of an entity update
   */
  notifyUpdate(entity: string, id: string, data: unknown) {
    this.send('update', entity, id, data)
  }

  /**
   * Clean up resources
   */
  dispose() {
    if (this.channel) {
      this.channel.close()
      this.channel = null
    }
    this.listeners.clear()
  }

  /**
   * Check if BroadcastChannel is supported
   */
  get supported() {
    return this.isSupported
  }
}

// Export singleton instance
export const broadcastSync = new BroadcastSync()

// Export types
export type { BroadcastMessage, MessageType }
