/**
 * CoreFlow360 - Broadcast Sync Hook
 * React hook for synchronizing state across browser tabs
 */

import { useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { broadcastSync, BroadcastMessage } from '@/lib/broadcast-sync'

interface UseBroadcastSyncOptions {
  entity: string
  onMessage?: (message: BroadcastMessage) => void
}

/**
 * Hook to synchronize React Query cache across browser tabs
 */
export function useBroadcastSync({ entity, onMessage }: UseBroadcastSyncOptions) {
  const queryClient = useQueryClient()

  const handleBroadcastMessage = useCallback((message: BroadcastMessage) => {
    // Handle different message types
    switch (message.type) {
      case 'refresh':
      case 'invalidate':
        // Invalidate queries for this entity
        if (message.id) {
          // Invalidate specific item
          queryClient.invalidateQueries({ 
            queryKey: [entity, 'detail', message.id] 
          })
        } else {
          // Invalidate all queries for this entity
          queryClient.invalidateQueries({ 
            queryKey: [entity] 
          })
        }
        break

      case 'update':
        // Update specific item in cache if we have the data
        if (message.id && message.data) {
          queryClient.setQueryData(
            [entity, 'detail', message.id], 
            message.data
          )
          // Also invalidate list queries to reflect the update
          queryClient.invalidateQueries({ 
            queryKey: [entity, 'list'] 
          })
        }
        break
    }

    // Call custom handler if provided
    if (onMessage) {
      onMessage(message)
    }
  }, [entity, queryClient, onMessage])

  useEffect(() => {
    // Subscribe to broadcast messages for this entity
    const unsubscribe = broadcastSync.on(entity, handleBroadcastMessage)

    // Cleanup on unmount
    return unsubscribe
  }, [entity, handleBroadcastMessage])

  // Return methods to send broadcast messages
  return {
    notifyRefresh: useCallback((id?: string) => {
      broadcastSync.notifyRefresh(entity, id)
    }, [entity]),
    
    notifyInvalidate: useCallback((id?: string) => {
      broadcastSync.notifyInvalidate(entity, id)
    }, [entity]),
    
    notifyUpdate: useCallback((id: string, data: any) => {
      broadcastSync.notifyUpdate(entity, id, data)
    }, [entity]),
    
    isSupported: broadcastSync.supported
  }
}

/**
 * Hook to listen to all broadcast messages
 */
export function useGlobalBroadcastSync(onMessage: (message: BroadcastMessage) => void) {
  useEffect(() => {
    const unsubscribe = broadcastSync.on('*', onMessage)
    return unsubscribe
  }, [onMessage])

  return {
    isSupported: broadcastSync.supported
  }
}