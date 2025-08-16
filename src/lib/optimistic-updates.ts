/**
 * CoreFlow360 - Optimistic Updates Utility
 * Handle optimistic updates with server synchronization and rollback
 */

export interface OptimisticUpdate<T = any> {
  id: string
  data: T
  timestamp: number
  status: 'pending' | 'success' | 'error'
  error?: Error
  rollback?: () => void
}

export interface OptimisticUpdateOptions<T = any> {
  timeout?: number
  retryAttempts?: number
  retryDelay?: number
  onSuccess?: (data: T) => void
  onError?: (error: Error, originalData: T) => void
  onRollback?: (data: T) => void
}

export class OptimisticUpdateManager<T = any> {
  private updates = new Map<string, OptimisticUpdate<T>>()
  private listeners = new Set<(updates: OptimisticUpdate<T>[]) => void>()

  /**
   * Create an optimistic update
   */
  async createUpdate(
    id: string,
    data: T,
    serverUpdate: () => Promise<T>,
    options: OptimisticUpdateOptions<T> = {}
  ): Promise<T> {
    const {
      timeout = 10000,
      retryAttempts = 3,
      retryDelay = 1000,
      onSuccess,
      onError,
      onRollback
    } = options

    // Create optimistic update
    const update: OptimisticUpdate<T> = {
      id,
      data,
      timestamp: Date.now(),
      status: 'pending'
    }

    // Store original data for rollback
    const originalData = this.getCurrentData(id)

    // Add to updates map
    this.updates.set(id, update)
    this.notifyListeners()

    try {
      // Attempt server update with retries
      let lastError: Error
      for (let attempt = 0; attempt <= retryAttempts; attempt++) {
        try {
          const result = await Promise.race([
            serverUpdate(),
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error('Request timeout')), timeout)
            )
          ])

          // Update successful
          update.status = 'success'
          update.data = result
          this.updates.set(id, update)
          this.notifyListeners()

          onSuccess?.(result)
          return result

        } catch (error) {
          lastError = error as Error
          
          if (attempt < retryAttempts) {
            await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)))
          }
        }
      }

      // All retries failed
      update.status = 'error'
      update.error = lastError!
      this.updates.set(id, update)
      this.notifyListeners()

      // Rollback to original data
      this.rollbackUpdate(id, originalData)
      onError?.(lastError!, originalData)
      onRollback?.(originalData)

      throw lastError!

    } catch (error) {
      // Handle unexpected errors
      update.status = 'error'
      update.error = error as Error
      this.updates.set(id, update)
      this.notifyListeners()

      this.rollbackUpdate(id, originalData)
      onError?.(error as Error, originalData)
      onRollback?.(originalData)

      throw error
    }
  }

  /**
   * Get current data for an ID
   */
  getCurrentData(id: string): T | undefined {
    const update = this.updates.get(id)
    return update?.data
  }

  /**
   * Get all pending updates
   */
  getPendingUpdates(): OptimisticUpdate<T>[] {
    return Array.from(this.updates.values()).filter(u => u.status === 'pending')
  }

  /**
   * Get all updates
   */
  getAllUpdates(): OptimisticUpdate<T>[] {
    return Array.from(this.updates.values())
  }

  /**
   * Rollback an update to original data
   */
  rollbackUpdate(id: string, originalData: T | undefined): void {
    const update = this.updates.get(id)
    if (update && originalData !== undefined) {
      update.data = originalData
      update.status = 'pending'
      update.error = undefined
      this.updates.set(id, update)
      this.notifyListeners()
    }
  }

  /**
   * Clear completed updates
   */
  clearCompletedUpdates(): void {
    for (const [id, update] of Array.from(this.updates.entries())) {
      if (update.status !== 'pending') {
        this.updates.delete(id)
      }
    }
    this.notifyListeners()
  }

  /**
   * Clear all updates
   */
  clearAllUpdates(): void {
    this.updates.clear()
    this.notifyListeners()
  }

  /**
   * Subscribe to updates
   */
  subscribe(listener: (updates: OptimisticUpdate<T>[]) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    const updates = this.getAllUpdates()
    this.listeners.forEach(listener => listener(updates))
  }
}

/**
 * React hook for optimistic updates
 */
export function useOptimisticUpdates<T = any>() {
  const manager = new OptimisticUpdateManager<T>()

  const createUpdate = async (
    id: string,
    data: T,
    serverUpdate: () => Promise<T>,
    options: OptimisticUpdateOptions<T> = {}
  ) => {
    return manager.createUpdate(id, data, serverUpdate, options)
  }

  const getCurrentData = (id: string) => manager.getCurrentData(id)
  const getPendingUpdates = () => manager.getPendingUpdates()
  const getAllUpdates = () => manager.getAllUpdates()
  const clearCompletedUpdates = () => manager.clearCompletedUpdates()
  const clearAllUpdates = () => manager.clearAllUpdates()

  return {
    createUpdate,
    getCurrentData,
    getPendingUpdates,
    getAllUpdates,
    clearCompletedUpdates,
    clearAllUpdates,
    subscribe: manager.subscribe.bind(manager)
  }
}

/**
 * Create optimistic update for API calls
 */
export function createOptimisticAPIUpdate<T = any>(
  apiCall: () => Promise<T>,
  options: OptimisticUpdateOptions = {}
) {
  return async (id: string, data: T) => {
    const manager = new OptimisticUpdateManager<T>()
    return manager.createUpdate(id, data, apiCall, options)
  }
}

/**
 * Batch optimistic updates
 */
export class BatchOptimisticUpdates<T = any> {
  private manager = new OptimisticUpdateManager<T>()
  private batch: Array<{
    id: string
    data: T
    serverUpdate: () => Promise<T>
    options?: OptimisticUpdateOptions<T>
  }> = []

  /**
   * Add update to batch
   */
  add(
    id: string,
    data: T,
    serverUpdate: () => Promise<T>,
    options?: OptimisticUpdateOptions<T>
  ): void {
    this.batch.push({ id, data, serverUpdate, options })
  }

  /**
   * Execute all updates in batch
   */
  async execute(): Promise<T[]> {
    const results: T[] = []
    const errors: Error[] = []

    // Execute all updates concurrently
    const promises = this.batch.map(async ({ id, data, serverUpdate, options }) => {
      try {
        const result = await this.manager.createUpdate(id, data, serverUpdate, options)
        results.push(result)
        return result
      } catch (error) {
        errors.push(error as Error)
        throw error
      }
    })

    try {
      await Promise.all(promises)
      this.batch = [] // Clear batch on success
      return results
    } catch (error) {
      // Some updates failed, but others may have succeeded
      if (errors.length > 0) {
        throw new Error(`Batch update failed: ${errors.length} errors`)
      }
      throw error
    }
  }

  /**
   * Clear batch
   */
  clear(): void {
    this.batch = []
  }

  /**
   * Get batch size
   */
  get size(): number {
    return this.batch.length
  }
}













