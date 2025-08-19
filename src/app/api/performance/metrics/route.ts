/**
 * CoreFlow360 - Performance Metrics API
 * Exposes performance monitoring data
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { getPerformanceStats } from '@/middleware/performance-monitoring'
import { api } from '@/lib/api-response'
import { sanitizeInput } from '@/middleware/sanitization'

export async function GET(_request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession()
    if (!session?.user) {
      return api.unauthorized('Authentication required')
    }

    // TODO: Add authorization check for admin users only
    // For now, any authenticated user can view metrics

    // Get performance statistics
    const stats = getPerformanceStats()

    // Sanitize the output
    const sanitizedStats = sanitizeInput(stats, 'performance.metrics')

    return api.success(sanitizedStats, {
      message: 'Performance metrics retrieved successfully',
    })
  } catch (error) {
    return api.error('Failed to retrieve performance metrics')
  }
}
