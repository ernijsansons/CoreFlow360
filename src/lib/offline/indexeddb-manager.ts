/**
 * CoreFlow360 - IndexedDB Offline Storage Manager
 * Robust offline-first data persistence with consciousness awareness
 */

export interface OfflineRecord {
  id: string
  type: 'customer' | 'deal' | 'insight' | 'voice_note' | 'consciousness_event'
  data: any
  timestamp: number
  lastModified: number
  syncStatus: 'pending' | 'synced' | 'conflict' | 'failed'
  retryCount: number
  consciousness_level?: 'neural' | 'synaptic' | 'autonomous' | 'transcendent'
}

export interface OfflineAction {
  id: string
  type: 'create' | 'update' | 'delete'
  entity: string
  entityId: string
  data?: any
  url: string
  method: string
  headers: Record<string, string>
  body?: string
  timestamp: number
  retryCount: number
  maxRetries: number
  priority: 'low' | 'medium' | 'high' | 'critical'
}

export interface SyncConflict {
  id: string
  entityType: string
  entityId: string
  localData: any
  serverData: any
  timestamp: number
  resolution?: 'local' | 'server' | 'merged'
}

class IndexedDBManager {
  private db: IDBDatabase | null = null
  private readonly dbName = 'CoreFlow360-Consciousness'
  private readonly dbVersion = 3
  private initPromise: Promise<void> | null = null

  // Store configurations
  private readonly stores = {
    records: 'offline_records',
    actions: 'offline_actions',
    conflicts: 'sync_conflicts',
    insights: 'consciousness_insights',
    cache: 'api_cache',
    metrics: 'performance_metrics'
  }

  async init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise
    }

    this.initPromise = new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error('IndexedDB not supported'))
        return
      }

      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => {
        reject(new Error(`IndexedDB error: ${request.error?.message}`))
      }

      request.onsuccess = () => {
        this.db = request.result
        console.log('[IndexedDB] Database initialized successfully')
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        this.setupStores(db)
      }
    })

    return this.initPromise
  }

  private setupStores(db: IDBDatabase): void {
    // Offline Records Store
    if (!db.objectStoreNames.contains(this.stores.records)) {
      const recordsStore = db.createObjectStore(this.stores.records, { keyPath: 'id' })
      recordsStore.createIndex('type', 'type', { unique: false })
      recordsStore.createIndex('syncStatus', 'syncStatus', { unique: false })
      recordsStore.createIndex('timestamp', 'timestamp', { unique: false })
      recordsStore.createIndex('consciousness_level', 'consciousness_level', { unique: false })
    }

    // Offline Actions Store
    if (!db.objectStoreNames.contains(this.stores.actions)) {
      const actionsStore = db.createObjectStore(this.stores.actions, { keyPath: 'id' })
      actionsStore.createIndex('type', 'type', { unique: false })
      actionsStore.createIndex('entity', 'entity', { unique: false })
      actionsStore.createIndex('priority', 'priority', { unique: false })
      actionsStore.createIndex('timestamp', 'timestamp', { unique: false })
    }

    // Sync Conflicts Store
    if (!db.objectStoreNames.contains(this.stores.conflicts)) {
      const conflictsStore = db.createObjectStore(this.stores.conflicts, { keyPath: 'id' })
      conflictsStore.createIndex('entityType', 'entityType', { unique: false })
      conflictsStore.createIndex('timestamp', 'timestamp', { unique: false })
    }

    // Consciousness Insights Store
    if (!db.objectStoreNames.contains(this.stores.insights)) {
      const insightsStore = db.createObjectStore(this.stores.insights, { keyPath: 'id' })
      insightsStore.createIndex('category', 'category', { unique: false })
      insightsStore.createIndex('confidence', 'confidence', { unique: false })
      insightsStore.createIndex('timestamp', 'timestamp', { unique: false })
    }

    // API Cache Store
    if (!db.objectStoreNames.contains(this.stores.cache)) {
      const cacheStore = db.createObjectStore(this.stores.cache, { keyPath: 'key' })
      cacheStore.createIndex('expiry', 'expiry', { unique: false })
      cacheStore.createIndex('endpoint', 'endpoint', { unique: false })
    }

    // Performance Metrics Store
    if (!db.objectStoreNames.contains(this.stores.metrics)) {
      const metricsStore = db.createObjectStore(this.stores.metrics, { keyPath: 'id' })
      metricsStore.createIndex('type', 'type', { unique: false })
      metricsStore.createIndex('timestamp', 'timestamp', { unique: false })
    }
  }

  // Record Management
  async saveRecord(record: OfflineRecord): Promise<void> {
    await this.init()
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction([this.stores.records], 'readwrite')
      const store = transaction.objectStore(this.stores.records)
      
      const request = store.put({
        ...record,
        lastModified: Date.now()
      })

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getRecord(id: string): Promise<OfflineRecord | null> {
    await this.init()
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction([this.stores.records], 'readonly')
      const store = transaction.objectStore(this.stores.records)
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  async getRecordsByType(type: OfflineRecord['type']): Promise<OfflineRecord[]> {
    await this.init()
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction([this.stores.records], 'readonly')
      const store = transaction.objectStore(this.stores.records)
      const index = store.index('type')
      const request = index.getAll(type)

      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  async getPendingSyncRecords(): Promise<OfflineRecord[]> {
    await this.init()
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction([this.stores.records], 'readonly')
      const store = transaction.objectStore(this.stores.records)
      const index = store.index('syncStatus')
      const request = index.getAll('pending')

      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  // Action Management
  async saveAction(action: OfflineAction): Promise<void> {
    await this.init()
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction([this.stores.actions], 'readwrite')
      const store = transaction.objectStore(this.stores.actions)
      const request = store.put(action)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getPendingActions(): Promise<OfflineAction[]> {
    await this.init()
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction([this.stores.actions], 'readonly')
      const store = transaction.objectStore(this.stores.actions)
      const request = store.getAll()

      request.onsuccess = () => {
        // Sort by priority and timestamp
        const actions = request.result || []
        const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 }
        
        actions.sort((a, b) => {
          const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
          return priorityDiff !== 0 ? priorityDiff : a.timestamp - b.timestamp
        })
        
        resolve(actions)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async removeAction(actionId: string): Promise<void> {
    await this.init()
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction([this.stores.actions], 'readwrite')
      const store = transaction.objectStore(this.stores.actions)
      const request = store.delete(actionId)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Conflict Management
  async saveConflict(conflict: SyncConflict): Promise<void> {
    await this.init()
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction([this.stores.conflicts], 'readwrite')
      const store = transaction.objectStore(this.stores.conflicts)
      const request = store.put(conflict)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getConflicts(): Promise<SyncConflict[]> {
    await this.init()
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction([this.stores.conflicts], 'readonly')
      const store = transaction.objectStore(this.stores.conflicts)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  async resolveConflict(conflictId: string, resolution: SyncConflict['resolution']): Promise<void> {
    await this.init()
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction([this.stores.conflicts], 'readwrite')
      const store = transaction.objectStore(this.stores.conflicts)
      
      const getRequest = store.get(conflictId)
      getRequest.onsuccess = () => {
        const conflict = getRequest.result
        if (conflict) {
          conflict.resolution = resolution
          const putRequest = store.put(conflict)
          putRequest.onsuccess = () => resolve()
          putRequest.onerror = () => reject(putRequest.error)
        } else {
          reject(new Error('Conflict not found'))
        }
      }
      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  // Cache Management
  async cacheApiResponse(key: string, data: any, ttlMinutes: number = 60): Promise<void> {
    await this.init()
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const expiry = Date.now() + (ttlMinutes * 60 * 1000)
      const cacheEntry = {
        key,
        data,
        expiry,
        endpoint: key.split('?')[0], // Extract base endpoint
        timestamp: Date.now()
      }

      const transaction = this.db.transaction([this.stores.cache], 'readwrite')
      const store = transaction.objectStore(this.stores.cache)
      const request = store.put(cacheEntry)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getCachedResponse(key: string): Promise<any | null> {
    await this.init()
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction([this.stores.cache], 'readonly')
      const store = transaction.objectStore(this.stores.cache)
      const request = store.get(key)

      request.onsuccess = () => {
        const result = request.result
        if (result && result.expiry > Date.now()) {
          resolve(result.data)
        } else {
          // Expired cache
          if (result) {
            this.clearCacheEntry(key)
          }
          resolve(null)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  async clearExpiredCache(): Promise<void> {
    await this.init()
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction([this.stores.cache], 'readwrite')
      const store = transaction.objectStore(this.stores.cache)
      const index = store.index('expiry')
      const range = IDBKeyRange.upperBound(Date.now())
      const request = index.openCursor(range)

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        } else {
          resolve()
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  private async clearCacheEntry(key: string): Promise<void> {
    if (!this.db) return

    const transaction = this.db.transaction([this.stores.cache], 'readwrite')
    const store = transaction.objectStore(this.stores.cache)
    store.delete(key)
  }

  // Metrics and Analytics
  async saveMetric(metric: { type: string; data: any }): Promise<void> {
    await this.init()
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const metricEntry = {
        id: `${metric.type}_${Date.now()}_${Math.random()}`,
        type: metric.type,
        data: metric.data,
        timestamp: Date.now()
      }

      const transaction = this.db.transaction([this.stores.metrics], 'readwrite')
      const store = transaction.objectStore(this.stores.metrics)
      const request = store.put(metricEntry)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Consciousness-specific methods
  async saveConsciousnessInsight(insight: {
    category: string
    confidence: number
    data: any
  }): Promise<void> {
    await this.init()
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const insightEntry = {
        id: `insight_${Date.now()}_${Math.random()}`,
        category: insight.category,
        confidence: insight.confidence,
        data: insight.data,
        timestamp: Date.now()
      }

      const transaction = this.db.transaction([this.stores.insights], 'readwrite')
      const store = transaction.objectStore(this.stores.insights)
      const request = store.put(insightEntry)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getConsciousnessInsights(category?: string): Promise<any[]> {
    await this.init()
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction([this.stores.insights], 'readonly')
      const store = transaction.objectStore(this.stores.insights)
      
      let request: IDBRequest
      if (category) {
        const index = store.index('category')
        request = index.getAll(category)
      } else {
        request = store.getAll()
      }

      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  // Database maintenance
  async clearAllData(): Promise<void> {
    await this.init()
    if (!this.db) return

    const storeNames = Object.values(this.stores)
    const transaction = this.db.transaction(storeNames, 'readwrite')
    
    const clearPromises = storeNames.map(storeName => {
      return new Promise<void>((resolve, reject) => {
        const store = transaction.objectStore(storeName)
        const request = store.clear()
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    })

    await Promise.all(clearPromises)
  }

  async getStorageUsage(): Promise<{ used: number; quota: number; percentage: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      const used = estimate.usage || 0
      const quota = estimate.quota || 0
      const percentage = quota > 0 ? (used / quota) * 100 : 0
      
      return { used, quota, percentage }
    }
    
    return { used: 0, quota: 0, percentage: 0 }
  }
}

// Export singleton instance
export const offlineStorage = new IndexedDBManager()

// Utility functions
export function generateOfflineId(): string {
  return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function createOfflineAction(
  type: OfflineAction['type'],
  entity: string,
  entityId: string,
  options: {
    url: string
    method: string
    headers?: Record<string, string>
    body?: string
    priority?: OfflineAction['priority']
    maxRetries?: number
  }
): OfflineAction {
  return {
    id: generateOfflineId(),
    type,
    entity,
    entityId,
    url: options.url,
    method: options.method,
    headers: options.headers || {},
    body: options.body,
    timestamp: Date.now(),
    retryCount: 0,
    priority: options.priority || 'medium',
    maxRetries: options.maxRetries || 3
  }
}

export function isConsciousnessEntity(type: string): boolean {
  return ['consciousness_event', 'insight', 'voice_note'].includes(type)
}