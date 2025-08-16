/**
 * CoreFlow360 Service Worker
 * Provides offline functionality and caching strategies for PWA
 */

// Auto-versioning based on build hash - updated during build process
const BUILD_HASH = 'BUILD_HASH_PLACEHOLDER' // Will be replaced by build script
const VERSION_TIMESTAMP = Date.now()
const CACHE_NAME = `coreflow360-v${BUILD_HASH || '1.0.0'}`
const STATIC_CACHE_NAME = `coreflow360-static-v${BUILD_HASH || '1.0.0'}`
const DYNAMIC_CACHE_NAME = `coreflow360-dynamic-v${BUILD_HASH || '1.0.0'}`

// Assets to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add other critical assets here
]

// API endpoints to cache for offline access
const CACHED_API_ROUTES = [
  '/api/dashboard/stats',
  '/api/customers/recent',
  '/api/notifications/unread'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...', event)
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('[SW] Error caching static assets:', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...', event)
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return (
                cacheName.startsWith('coreflow360-') &&
                cacheName !== STATIC_CACHE_NAME &&
                cacheName !== DYNAMIC_CACHE_NAME
              )
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            })
        )
      })
      .then(() => {
        console.log('[SW] Service Worker activated')
        return self.clients.claim()
      })
  )
})

// Fetch event - handle network requests with caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return
  }

  // Handle different types of requests with appropriate strategies
  if (isStaticAsset(request.url)) {
    // Cache First strategy for static assets
    event.respondWith(cacheFirstStrategy(request))
  } else if (isAPIRequest(request.url)) {
    // Network First strategy for API requests
    event.respondWith(networkFirstStrategy(request))
  } else if (isNavigationRequest(request)) {
    // Stale While Revalidate for navigation requests
    event.respondWith(staleWhileRevalidateStrategy(request))
  } else {
    // Network First for other requests
    event.respondWith(networkFirstStrategy(request))
  }
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag)
  
  if (event.tag === 'offline-actions') {
    event.waitUntil(syncOfflineActions())
  }
})

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received:', event)
  
  const options = {
    body: event.data ? event.data.text() : 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/action-view.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/action-close.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('CoreFlow360', options)
  )
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received:', event)
  
  event.notification.close()
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    )
  } else if (event.action === 'close') {
    // Notification closed
  } else {
    // Default action - open app
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Caching Strategies

// Cache First - good for static assets
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('[SW] Cache First strategy failed:', error)
    return new Response('Offline - Asset not available', { 
      status: 503,
      statusText: 'Service Unavailable'
    })
  }
}

// Network First - good for API requests
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok && isAPIRequest(request.url)) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('[SW] Network request failed, trying cache:', error)
    
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline page for navigation requests
    if (isNavigationRequest(request)) {
      const offlineResponse = await caches.match('/offline')
      if (offlineResponse) {
        return offlineResponse
      }
    }
    
    return new Response('Offline - Resource not available', {
      status: 503,
      statusText: 'Service Unavailable'
    })
  }
}

// Stale While Revalidate - good for frequently updated content
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME)
  
  // Try to get from cache first
  const cachedResponse = await cache.match(request)
  
  // Fetch from network in background
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  }).catch((error) => {
    console.log('[SW] Network fetch failed:', error)
  })
  
  // Return cached version immediately if available, otherwise wait for network
  return cachedResponse || fetchPromise
}

// Helper functions

function isStaticAsset(url) {
  return (
    url.includes('/_next/static/') ||
    url.includes('/icons/') ||
    url.includes('/images/') ||
    url.includes('.css') ||
    url.includes('.js') ||
    url.includes('.png') ||
    url.includes('.jpg') ||
    url.includes('.jpeg') ||
    url.includes('.svg') ||
    url.includes('.woff') ||
    url.includes('.woff2')
  )
}

function isAPIRequest(url) {
  return url.includes('/api/') || CACHED_API_ROUTES.some(route => url.includes(route))
}

function isNavigationRequest(request) {
  return request.mode === 'navigate'
}

// Background sync for offline actions
async function syncOfflineActions() {
  try {
    // Get offline actions from IndexedDB
    const offlineActions = await getOfflineActions()
    
    for (const action of offlineActions) {
      try {
        await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body
        })
        
        // Remove successful action from offline queue
        await removeOfflineAction(action.id)
      } catch (error) {
        console.log('[SW] Failed to sync action:', action.id, error)
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error)
  }
}

// IndexedDB helpers for offline actions
async function getOfflineActions() {
  // Implementation would use IndexedDB to store offline actions
  // For now, return empty array
  return []
}

async function removeOfflineAction(actionId) {
  // Implementation would remove action from IndexedDB
  console.log('[SW] Removing offline action:', actionId)
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data)
  
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting()
        break
      case 'GET_VERSION':
        event.ports[0].postMessage({ version: CACHE_NAME })
        break
      case 'CACHE_NEW_ROUTE':
        event.waitUntil(cacheNewRoute(event.data.url))
        break
      default:
        break
    }
  }
})

async function cacheNewRoute(url) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME)
    await cache.add(url)
    console.log('[SW] New route cached:', url)
  } catch (error) {
    console.error('[SW] Failed to cache new route:', url, error)
  }
}