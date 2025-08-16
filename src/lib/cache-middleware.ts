/**
 * CoreFlow360 - API Response Caching Middleware
 * Intelligent caching for API endpoints with tenant isolation
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { redis } from './redis'
import { getServerSession } from './auth'

export interface CacheConfig {
  ttl?: number // Time to live in seconds
  varyBy?: string[] // Request properties to vary cache by
  revalidate?: boolean // Use stale-while-revalidate pattern
  revalidateTime?: number // Time to serve stale content while revalidating
  excludeAuth?: boolean // Don't cache authenticated requests
  keyGenerator?: (req: NextRequest) => string // Custom cache key generator
}

// Default cache configurations for different endpoint types
export const cachePresets = {
  // Public data that rarely changes
  static: {
    ttl: 3600, // 1 hour
    excludeAuth: false,
  },
  // Public data that changes occasionally
  dynamic: {
    ttl: 300, // 5 minutes
    excludeAuth: false,
    revalidate: true,
    revalidateTime: 60,
  },
  // User-specific data
  user: {
    ttl: 60, // 1 minute
    varyBy: ['userId', 'tenantId'],
    excludeAuth: false,
  },
  // Tenant-specific data
  tenant: {
    ttl: 300, // 5 minutes
    varyBy: ['tenantId'],
    excludeAuth: false,
  },
  // Search results
  search: {
    ttl: 120, // 2 minutes
    varyBy: ['query', 'tenantId'],
    excludeAuth: false,
  },
  // AI responses
  ai: {
    ttl: 1800, // 30 minutes
    varyBy: ['prompt', 'tenantId'],
    excludeAuth: false,
  },
}

/**
 * Generate cache key from request
 */
function generateCacheKey(
  req: NextRequest,
  config: CacheConfig,
  session?: any
): string {
  // Use custom key generator if provided
  if (config.keyGenerator) {
    return config.keyGenerator(req)
  }

  const parts: string[] = ['api-cache']
  
  // Add method and pathname
  parts.push(req.method)
  parts.push(req.nextUrl.pathname)
  
  // Add search params
  const searchParams = req.nextUrl.searchParams
  const sortedParams = Array.from(searchParams.entries()).sort()
  if (sortedParams.length > 0) {
    const paramsHash = crypto
      .createHash('md5')
      .update(JSON.stringify(sortedParams))
      .digest('hex')
      .substring(0, 8)
    parts.push(`params:${paramsHash}`)
  }
  
  // Add vary-by properties
  if (config.varyBy) {
    for (const prop of config.varyBy) {
      switch (prop) {
        case 'userId':
          if (session?.user?.id) {
            parts.push(`user:${session.user.id}`)
          }
          break
        case 'tenantId':
          if (session?.user?.tenantId) {
            parts.push(`tenant:${session.user.tenantId}`)
          }
          break
        case 'query':
          const query = searchParams.get('q') || searchParams.get('query')
          if (query) {
            const queryHash = crypto
              .createHash('md5')
              .update(query)
              .digest('hex')
              .substring(0, 8)
            parts.push(`query:${queryHash}`)
          }
          break
        case 'prompt':
          // For AI endpoints, hash the prompt from body
          // This would need to be extracted from request body
          break
      }
    }
  }
  
  return parts.join(':')
}

/**
 * Cache middleware for API routes
 */
export function withCache(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config: CacheConfig = cachePresets.dynamic
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return handler(req)
    }
    
    // Get session if needed
    let session = null
    if (!config.excludeAuth || config.varyBy?.includes('userId') || config.varyBy?.includes('tenantId')) {
      session = await getServerSession()
    }
    
    // Skip caching for authenticated requests if configured
    if (config.excludeAuth && session) {
      return handler(req)
    }
    
    // Generate cache key
    const cacheKey = generateCacheKey(req, config, session)
    
    // Try to get from cache
    const cached = await redis.get(cacheKey, {
      tenantId: session?.user?.tenantId,
    })
    
    if (cached) {
      // Check if we should revalidate
      if (config.revalidate && cached.expires && cached.expires < Date.now()) {
        // Serve stale content while revalidating in background
        const staleResponse = new NextResponse(
          JSON.stringify(cached.data),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'X-Cache': 'HIT-STALE',
              'X-Cache-Age': String(Math.floor((Date.now() - cached.created) / 1000)),
              'Cache-Control': `max-age=${config.ttl}, stale-while-revalidate=${config.revalidateTime}`,
            },
          }
        )
        
        // Revalidate in background
        setImmediate(async () => {
          try {
            const fresh = await handler(req)
            if (fresh.ok) {
              const data = await fresh.json()
              await redis.set(
                cacheKey,
                {
                  data,
                  created: Date.now(),
                  expires: Date.now() + (config.ttl! * 1000),
                },
                {
                  ttl: config.ttl! + (config.revalidateTime || 60),
                  tenantId: session?.user?.tenantId,
                }
              )
            }
          } catch (error) {
            console.error('Cache revalidation error:', error)
          }
        })
        
        return staleResponse
      }
      
      // Serve fresh cached content
      return new NextResponse(
        JSON.stringify(cached.data),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'X-Cache': 'HIT',
            'X-Cache-Age': String(Math.floor((Date.now() - cached.created) / 1000)),
            'Cache-Control': `max-age=${config.ttl}, stale-while-revalidate=${config.revalidateTime || 0}`,
          },
        }
      )
    }
    
    // Cache miss - execute handler
    try {
      const response = await handler(req)
      
      // Only cache successful responses
      if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json()
        
        // Store in cache
        await redis.set(
          cacheKey,
          {
            data,
            created: Date.now(),
            expires: Date.now() + (config.ttl! * 1000),
          },
          {
            ttl: config.ttl! + (config.revalidateTime || 60),
            tenantId: session?.user?.tenantId,
          }
        )
        
        // Return new response with cache headers
        return new NextResponse(
          JSON.stringify(data),
          {
            status: response.status,
            headers: {
              'Content-Type': 'application/json',
              'X-Cache': 'MISS',
              'Cache-Control': `max-age=${config.ttl}, stale-while-revalidate=${config.revalidateTime || 0}`,
            },
          }
        )
      }
      
      return response
    } catch (error) {
      // Don't cache errors
      throw error
    }
  }
}

/**
 * Invalidate cache for specific patterns
 */
export async function invalidateCache(patterns: string[], tenantId?: string) {
  const promises = patterns.map(pattern => 
    redis.invalidatePattern(pattern, { tenantId })
  )
  
  const results = await Promise.all(promises)
  return results.reduce((sum, count) => sum + count, 0)
}

/**
 * Cache invalidation helpers for common scenarios
 */
export const cacheInvalidation = {
  // Invalidate all user-specific caches
  user: async (userId: string, tenantId: string) => {
    await invalidateCache([
      `*:user:${userId}:*`,
      `*:tenant:${tenantId}:*`,
    ], tenantId)
  },
  
  // Invalidate all tenant caches
  tenant: async (tenantId: string) => {
    await redis.invalidateTenant(tenantId)
  },
  
  // Invalidate specific endpoint caches
  endpoint: async (pathname: string, tenantId?: string) => {
    await invalidateCache([
      `*:${pathname}:*`,
    ], tenantId)
  },
  
  // Invalidate search results
  search: async (tenantId: string) => {
    await invalidateCache([
      `*:query:*`,
    ], tenantId)
  },
  
  // Invalidate AI responses
  ai: async (tenantId: string) => {
    await redis.aiCache.invalidateAll(tenantId)
  },
}

/**
 * Express-style cache middleware for Next.js API routes
 */
export function cacheMiddleware(config: CacheConfig = cachePresets.dynamic) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value
    
    descriptor.value = async function (req: NextRequest) {
      return withCache(
        () => originalMethod.call(this, req),
        config
      )(req)
    }
    
    return descriptor
  }
}