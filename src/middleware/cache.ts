/**
 * CoreFlow360 - Caching Middleware
 * API response caching with Redis
 */

import { NextRequest, NextResponse } from 'next/server'
import { redis, CACHE_PREFIXES, CACHE_TTL } from '@/lib/redis/client'
import crypto from 'crypto'

// Cache configuration for different endpoints
export const CACHE_CONFIG: Record<string, CacheConfig> = {
  // Public endpoints - aggressive caching
  '/api/health': { ttl: CACHE_TTL.MEDIUM, vary: [] },
  '/api/pricing': { ttl: CACHE_TTL.LONG, vary: [] },
  
  // User-specific endpoints - moderate caching
  '/api/freemium/status': { ttl: CACHE_TTL.SHORT, vary: ['userId', 'tenantId'] },
  '/api/dashboard/executive': { ttl: CACHE_TTL.MEDIUM, vary: ['tenantId', 'timeframe'] },
  '/api/metrics/live': { ttl: 30, vary: [] }, // 30 seconds for live data
  
  // List endpoints - cache with query params
  '/api/customers': { ttl: CACHE_TTL.SHORT, vary: ['query'] },
  '/api/deals': { ttl: CACHE_TTL.SHORT, vary: ['query'] },
  '/api/projects': { ttl: CACHE_TTL.SHORT, vary: ['query'] },
  
  // Analytics - longer cache
  '/api/conversion/analytics': { ttl: CACHE_TTL.MEDIUM, vary: ['tenantId', 'timeframe'] },
  '/api/performance/summary': { ttl: CACHE_TTL.MEDIUM, vary: ['tenantId', 'period'] }
}

interface CacheConfig {
  ttl: number // Time to live in seconds
  vary: string[] // Parameters that affect cache key
}

interface CacheOptions extends Partial<CacheConfig> {
  skipCache?: boolean
  invalidatePattern?: string
}

/**
 * Generate cache key from request
 */
function generateCacheKey(
  request: NextRequest,
  config: CacheConfig
): string {
  const url = request.nextUrl
  const keyParts = [url.pathname]
  
  // Add varying parameters
  for (const param of config.vary) {
    if (param === 'query') {
      // Include all query parameters
      const sortedParams = Array.from(url.searchParams.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join('&')
      if (sortedParams) {
        keyParts.push(sortedParams)
      }
    } else if (param === 'userId' || param === 'tenantId') {
      // Get from headers or auth context
      const value = request.headers.get(`x-${param.toLowerCase()}`) || 
                   url.searchParams.get(param)
      if (value) {
        keyParts.push(`${param}:${value}`)
      }
    } else {
      // Get from query params
      const value = url.searchParams.get(param)
      if (value) {
        keyParts.push(`${param}:${value}`)
      }
    }
  }
  
  // Create hash of key parts for shorter keys
  const keyString = keyParts.join(':')
  const hash = crypto.createHash('md5').update(keyString).digest('hex')
  
  return `${CACHE_PREFIXES.API_RESPONSE}${url.pathname}:${hash}`
}

/**
 * Check if request should be cached
 */
function shouldCache(request: NextRequest): boolean {
  // Only cache GET requests
  if (request.method !== 'GET') return false
  
  // Skip cache if no-cache header is present
  const cacheControl = request.headers.get('cache-control')
  if (cacheControl?.includes('no-cache')) return false
  
  // Skip cache for authenticated admin requests
  const isAdmin = request.headers.get('x-user-role')?.includes('admin')
  if (isAdmin) return false
  
  return true
}

/**
 * Cache middleware factory
 */
export function withCache(options?: CacheOptions) {
  return function cacheMiddleware(
    handler: (request: NextRequest) => Promise<NextResponse>
  ) {
    return async (request: NextRequest): Promise<NextResponse> => {
      // Skip cache if disabled or conditions not met
      if (options?.skipCache || !shouldCache(request)) {
        return handler(request)
      }
      
      // Get cache configuration
      const pathname = request.nextUrl.pathname
      const config: CacheConfig = {
        ttl: CACHE_TTL.SHORT,
        vary: [],
        ...CACHE_CONFIG[pathname],
        ...options
      }
      
      // Generate cache key
      const cacheKey = generateCacheKey(request, config)
      
      // Try to get from cache
      const cached = await redis.get<{
        body: any
        headers: Record<string, string>
        status: number
      }>(cacheKey)
      
      if (cached) {
        // Return cached response
        const response = NextResponse.json(cached.body, {
          status: cached.status,
          headers: cached.headers
        })
        
        // Add cache headers
        response.headers.set('X-Cache', 'HIT')
        response.headers.set('X-Cache-Key', cacheKey)
        response.headers.set('Cache-Control', `public, max-age=${config.ttl}`)
        
        return response
      }
      
      // Call handler
      const response = await handler(request)
      
      // Cache successful responses
      if (response.status >= 200 && response.status < 300) {
        try {
          // Clone response to read body
          const cloned = response.clone()
          const body = await cloned.json()
          
          // Extract headers
          const headers: Record<string, string> = {}
          response.headers.forEach((value, key) => {
            // Skip some headers
            if (!['set-cookie', 'x-cache'].includes(key.toLowerCase())) {
              headers[key] = value
            }
          })
          
          // Store in cache
          await redis.set(
            cacheKey,
            {
              body,
              headers,
              status: response.status
            },
            config.ttl
          )
          
          // Add cache headers to original response
          response.headers.set('X-Cache', 'MISS')
          response.headers.set('X-Cache-Key', cacheKey)
          response.headers.set('Cache-Control', `public, max-age=${config.ttl}`)
        } catch (error) {
          console.error('Cache storage error:', error)
        }
      }
      
      return response
    }
  }
}

/**
 * Invalidate cache by pattern
 */
export async function invalidateCache(pattern: string): Promise<number> {
  const client = redis
  if (!client) return 0
  
  try {
    // Get all matching keys
    const prefix = CACHE_PREFIXES.API_RESPONSE
    const keys = await client.smembers(`${prefix}*${pattern}*`)
    
    if (keys.length > 0) {
      return await client.del(...keys)
    }
    
    return 0
  } catch (error) {
    console.error('Cache invalidation error:', error)
    return 0
  }
}

/**
 * Cache invalidation middleware
 */
export function withCacheInvalidation(patterns: string[]) {
  return function invalidationMiddleware(
    handler: (request: NextRequest) => Promise<NextResponse>
  ) {
    return async (request: NextRequest): Promise<NextResponse> => {
      // Call handler first
      const response = await handler(request)
      
      // Invalidate cache on successful mutations
      if (response.status >= 200 && response.status < 300 &&
          ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
        
        // Invalidate all matching patterns
        for (const pattern of patterns) {
          await invalidateCache(pattern)
        }
        
        // Add invalidation header
        response.headers.set('X-Cache-Invalidated', patterns.join(','))
      }
      
      return response
    }
  }
}

/**
 * Combine cache with API middleware
 */
export function withCachedApi(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options?: CacheOptions
) {
  return withCache(options)(handler)
}