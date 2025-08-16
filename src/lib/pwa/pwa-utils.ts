/**
 * CoreFlow360 - PWA Utilities
 * Service worker registration, installation prompts, and offline functionality
 */

'use client'

import { useState, useEffect } from 'react'

export interface PWAInstallPrompt {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export interface PWAState {
  isInstalled: boolean
  canInstall: boolean
  isOnline: boolean
  isUpdateAvailable: boolean
  installPrompt: PWAInstallPrompt | null
  swRegistration: ServiceWorkerRegistration | null
}

export interface OfflineAction {
  id: string
  type: string
  url: string
  method: string
  headers: Record<string, string>
  body?: string
  timestamp: number
  retryCount: number
}

// PWA Installation Hook
export function usePWA() {
  const [pwaState, setPWAState] = useState<PWAState>({
    isInstalled: false,
    canInstall: false,
    isOnline: navigator?.onLine ?? true,
    isUpdateAvailable: false,
    installPrompt: null,
    swRegistration: null
  })

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isInstalled = isStandalone || (window.navigator as any).standalone === true
    
    setPWAState(prev => ({ ...prev, isInstalled }))

    // Register service worker
    if ('serviceWorker' in navigator) {
      registerServiceWorker()
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const installEvent = e as any
      
      setPWAState(prev => ({
        ...prev,
        canInstall: true,
        installPrompt: {
          prompt: async () => {
            await installEvent.prompt()
            const choiceResult = await installEvent.userChoice
            
            if (choiceResult.outcome === 'accepted') {
              setPWAState(prev => ({ 
                ...prev, 
                canInstall: false, 
                isInstalled: true,
                installPrompt: null 
              }))
            }
          },
          userChoice: installEvent.userChoice
        }
      }))
    }

    // Listen for online/offline events
    const handleOnline = () => {
      setPWAState(prev => ({ ...prev, isOnline: true }))
      syncOfflineActions()
    }

    const handleOffline = () => {
      setPWAState(prev => ({ ...prev, isOnline: false }))
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      setPWAState(prev => ({ ...prev, swRegistration: registration }))

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setPWAState(prev => ({ ...prev, isUpdateAvailable: true }))
            }
          })
        }
      })

      console.log('[PWA] Service Worker registered successfully')
    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error)
    }
  }

  const installPWA = async () => {
    if (pwaState.installPrompt) {
      await pwaState.installPrompt.prompt()
    }
  }

  const updatePWA = () => {
    if (pwaState.swRegistration?.waiting) {
      pwaState.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }

  return {
    ...pwaState,
    installPWA,
    updatePWA
  }
}

// Offline Actions Management
export function useOfflineActions() {
  const [offlineActions, setOfflineActions] = useState<OfflineAction[]>([])

  useEffect(() => {
    loadOfflineActions()
  }, [])

  const addOfflineAction = (action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>) => {
    const newAction: OfflineAction = {
      ...action,
      id: generateId(),
      timestamp: Date.now(),
      retryCount: 0
    }

    setOfflineActions(prev => [...prev, newAction])
    saveOfflineActions([...offlineActions, newAction])
    
    // Register background sync if available
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        return registration.sync.register('offline-actions')
      }).catch(error => {
        console.error('[PWA] Background sync registration failed:', error)
      })
    }
  }

  const removeOfflineAction = (actionId: string) => {
    const updatedActions = offlineActions.filter(action => action.id !== actionId)
    setOfflineActions(updatedActions)
    saveOfflineActions(updatedActions)
  }

  const syncOfflineActions = async () => {
    for (const action of offlineActions) {
      try {
        const response = await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body
        })

        if (response.ok) {
          removeOfflineAction(action.id)
        } else {
          // Increment retry count
          const updatedAction = { ...action, retryCount: action.retryCount + 1 }
          const updatedActions = offlineActions.map(a => 
            a.id === action.id ? updatedAction : a
          )
          setOfflineActions(updatedActions)
          saveOfflineActions(updatedActions)
        }
      } catch (error) {
        console.error('[PWA] Failed to sync offline action:', action.id, error)
      }
    }
  }

  return {
    offlineActions,
    addOfflineAction,
    removeOfflineAction,
    syncOfflineActions
  }
}

// Utility functions
function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

function saveOfflineActions(actions: OfflineAction[]) {
  try {
    localStorage.setItem('coreflow360-offline-actions', JSON.stringify(actions))
  } catch (error) {
    console.error('[PWA] Failed to save offline actions:', error)
  }
}

function loadOfflineActions(): OfflineAction[] {
  try {
    const saved = localStorage.getItem('coreflow360-offline-actions')
    return saved ? JSON.parse(saved) : []
  } catch (error) {
    console.error('[PWA] Failed to load offline actions:', error)
    return []
  }
}

// Push Notifications
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied'
  }

  if (Notification.permission === 'granted') {
    return 'granted'
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission
  }

  return 'denied'
}

export async function subscribeToPushNotifications(swRegistration: ServiceWorkerRegistration): Promise<PushSubscription | null> {
  try {
    const subscription = await swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    })

    // Send subscription to server
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription)
    })

    return subscription
  } catch (error) {
    console.error('[PWA] Push notification subscription failed:', error)
    return null
  }
}

// Share API
export function canUseWebShare(): boolean {
  return 'share' in navigator
}

export async function shareContent(shareData: ShareData): Promise<boolean> {
  try {
    if (canUseWebShare()) {
      await navigator.share(shareData)
      return true
    } else {
      // Fallback to clipboard
      if ('clipboard' in navigator) {
        await navigator.clipboard.writeText(shareData.url || shareData.text || '')
        return true
      }
    }
  } catch (error) {
    console.error('[PWA] Sharing failed:', error)
  }
  
  return false
}

// App Update Detection
export function useAppUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        setRegistration(reg)
        
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true)
              }
            })
          }
        })
      })
    }
  }, [])

  const applyUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }

  return { updateAvailable, applyUpdate }
}

// Performance monitoring for PWA
export function trackPWAMetrics() {
  // Track app installation
  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installed')
    // Track with analytics
  })

  // Track display mode
  const displayMode = window.matchMedia('(display-mode: standalone)').matches 
    ? 'standalone' 
    : 'browser'
  
  console.log('[PWA] Display mode:', displayMode)

  // Track connection type
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
  if (connection) {
    console.log('[PWA] Connection type:', connection.effectiveType)
  }
}

// Cache management
export async function clearAppCache(): Promise<void> {
  if ('caches' in window) {
    const cacheNames = await caches.keys()
    await Promise.all(
      cacheNames
        .filter(name => name.startsWith('coreflow360-'))
        .map(name => caches.delete(name))
    )
    console.log('[PWA] App cache cleared')
  }
}

export async function getCacheSize(): Promise<number> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate()
    return estimate.usage || 0
  }
  return 0
}