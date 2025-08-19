/**
 * CoreFlow360 - Cache Management API
 * Admin interface for Redis cache operations
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, ApiContext } from '@/lib/api-wrapper'
import { redis, aiCache } from '@/lib/redis'

const CacheOperationSchema = z.object({
  operation: z.enum(['flush', 'invalidate', 'stats', 'ping']),
  tenantId: z.string().optional(),
  pattern: z.string().optional(),
  key: z.string().optional(),
})

const handleGET = async (context: ApiContext): Promise<NextResponse> => {
  const { user } = context

  // Only super admins can access cache management
  if (user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  try {
    const cacheStats = redis.getStats()
    const isAvailable = redis.isAvailable()
    const hitRate = redis.getHitRate()

    return NextResponse.json({
      cache: {
        available: isAvailable,
        stats: cacheStats,
        hitRate: Math.round(hitRate * 100) / 100,
        connection: isAvailable ? 'healthy' : 'unavailable',
      },
      operations: {
        available: ['flush', 'invalidate', 'stats', 'ping'],
        description: {
          flush: 'Clear all cache for a tenant',
          invalidate: 'Remove cache entries matching a pattern',
          stats: 'Get detailed cache statistics',
          ping: 'Test Redis connection',
        },
      },
    })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Failed to get cache status', details: error.message },
      { status: 500 }
    )
  }
}

const handlePOST = async (context: ApiContext): Promise<NextResponse> => {
  const { request, user } = context

  // Only super admins can perform cache operations
  if (user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const validatedData = CacheOperationSchema.parse(body)

    const { operation, tenantId, pattern, key } = validatedData

    switch (operation) {
      case 'ping':
        const isHealthy = await redis.ping()
        return NextResponse.json({
          operation: 'ping',
          result: isHealthy ? 'PONG' : 'FAILED',
          success: isHealthy,
        })

      case 'stats':
        const stats = redis.getStats()
        const hitRate = redis.getHitRate()
        return NextResponse.json({
          operation: 'stats',
          result: {
            ...stats,
            hitRate: Math.round(hitRate * 100) / 100,
            available: redis.isAvailable(),
          },
          success: true,
        })

      case 'flush':
        if (!tenantId) {
          return NextResponse.json(
            { error: 'tenantId is required for flush operation' },
            { status: 400 }
          )
        }

        const flushed = await redis.invalidateTenant(tenantId)
        return NextResponse.json({
          operation: 'flush',
          tenantId,
          result: `Flushed ${flushed} cache entries`,
          success: true,
        })

      case 'invalidate':
        if (!pattern) {
          return NextResponse.json(
            { error: 'pattern is required for invalidate operation' },
            { status: 400 }
          )
        }

        const invalidated = await redis.invalidatePattern(
          pattern,
          tenantId ? { tenantId } : undefined
        )

        return NextResponse.json({
          operation: 'invalidate',
          pattern,
          tenantId,
          result: `Invalidated ${invalidated} cache entries`,
          success: true,
        })

      default:
        return NextResponse.json({ error: `Unknown operation: ${operation}` }, { status: 400 })
    }
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: 'Cache operation failed',
        details: error.message,
        success: false,
      },
      { status: 500 }
    )
  }
}

const handleDELETE = async (context: ApiContext): Promise<NextResponse> => {
  const { request, user } = context

  // Only super admins can delete cache entries
  if (user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    const tenantId = searchParams.get('tenantId')

    if (!key) {
      return NextResponse.json({ error: 'key parameter is required' }, { status: 400 })
    }

    const deleted = await redis.del(key, tenantId ? { tenantId } : undefined)

    return NextResponse.json({
      operation: 'delete',
      key,
      tenantId,
      result: deleted ? 'Key deleted successfully' : 'Key not found',
      success: deleted,
    })
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: 'Failed to delete cache key',
        details: error.message,
        success: false,
      },
      { status: 500 }
    )
  }
}

// Export wrapped handlers
export const GET = withAuth(handleGET)
export const POST = withAuth(handlePOST)
export const DELETE = withAuth(handleDELETE)
