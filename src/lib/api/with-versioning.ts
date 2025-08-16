/**
 * CoreFlow360 - API Versioning Wrapper
 * Easily apply versioning to API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { APIVersioning } from '@/middleware/versioning'

export interface VersionedHandler {
  (request: NextRequest, context?: any): Promise<NextResponse> | NextResponse
}

export interface VersionConfig {
  supportedVersions?: string[]
  currentVersion?: string
  transformResponse?: (data: any, fromVersion: string, toVersion: string) => any
}

/**
 * Wrap an API handler with versioning support
 */
export function withAPIVersioning(
  handler: VersionedHandler,
  config: VersionConfig = {}
): VersionedHandler {
  const {
    supportedVersions = ['v1', 'v2'],
    currentVersion = 'v2',
    transformResponse
  } = config

  return async (request: NextRequest, context?: any) => {
    const { pathname } = request.nextUrl
    const { version, cleanPath } = APIVersioning.extractVersion(pathname)
    const requestVersion = version || currentVersion

    // Check if version is supported
    if (!supportedVersions.includes(requestVersion)) {
      return NextResponse.json(
        {
          error: 'Unsupported API version',
          message: `Version ${requestVersion} is not supported. Supported versions: ${supportedVersions.join(', ')}`,
          currentVersion
        },
        { status: 400 }
      )
    }

    // Check if version is sunset
    if (APIVersioning.isSunset(requestVersion)) {
      return NextResponse.json(
        {
          error: 'API version sunset',
          message: `Version ${requestVersion} has been sunset. Please upgrade to ${currentVersion}.`,
          migrationGuide: `/docs/api/migration/${requestVersion}-to-${currentVersion}`
        },
        { status: 410 }
      )
    }

    try {
      // Execute the handler
      const response = await handler(request, context)

      // If response is JSON and we have a transformer, apply it
      if (transformResponse && requestVersion !== currentVersion) {
        const contentType = response.headers.get('content-type')
        if (contentType?.includes('application/json')) {
          try {
            const data = await response.json()
            const transformed = transformResponse(data, currentVersion, requestVersion)
            
            const newResponse = NextResponse.json(transformed, {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers
            })

            // Add version headers
            return APIVersioning.createVersionedResponse(newResponse, pathname)
          } catch (e) {
            // If transformation fails, return original response
            console.error('Response transformation error:', e)
          }
        }
      }

      // Add version headers to response
      return APIVersioning.createVersionedResponse(response, pathname)
    } catch (error) {
      // Handle errors consistently across versions
      console.error('API handler error:', error)
      return NextResponse.json(
        {
          error: 'Internal server error',
          message: 'An unexpected error occurred',
          version: requestVersion
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Response transformers for backward compatibility
 */
export const responseTransformers = {
  /**
   * Transform v2 customer response to v1 format
   */
  customerV2ToV1: (data: any) => {
    if (Array.isArray(data)) {
      return data.map(customer => ({
        ...customer,
        name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
        // Remove v2-only fields
        firstName: undefined,
        lastName: undefined,
        status: undefined,
        source: undefined,
        aiScore: undefined,
        aiChurnRisk: undefined,
        aiLifetimeValue: undefined
      }))
    }

    // Single customer
    return {
      ...data,
      name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      firstName: undefined,
      lastName: undefined,
      status: undefined,
      source: undefined,
      aiScore: undefined,
      aiChurnRisk: undefined,
      aiLifetimeValue: undefined
    }
  },

  /**
   * Transform v1 customer request to v2 format
   */
  customerV1ToV2: (data: any) => {
    if (data.name && !data.firstName && !data.lastName) {
      const nameParts = data.name.trim().split(/\s+/)
      return {
        ...data,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        status: data.status || 'LEAD'
      }
    }
    return data
  },

  /**
   * Generic pagination transformer
   */
  paginationV2ToV1: (response: any) => {
    if (response.data && response.meta) {
      return {
        ...response,
        pagination: {
          page: response.meta.page,
          limit: response.meta.limit,
          total: response.meta.totalCount,
          pages: Math.ceil(response.meta.totalCount / response.meta.limit)
        },
        meta: undefined
      }
    }
    return response
  }
}

/**
 * Apply versioning to all routes in a directory
 */
export function createVersionedRoute(
  handlers: {
    GET?: VersionedHandler
    POST?: VersionedHandler
    PUT?: VersionedHandler
    PATCH?: VersionedHandler
    DELETE?: VersionedHandler
  },
  config?: VersionConfig
) {
  const versioned: any = {}

  if (handlers.GET) {
    versioned.GET = withAPIVersioning(handlers.GET, config)
  }
  if (handlers.POST) {
    versioned.POST = withAPIVersioning(handlers.POST, config)
  }
  if (handlers.PUT) {
    versioned.PUT = withAPIVersioning(handlers.PUT, config)
  }
  if (handlers.PATCH) {
    versioned.PATCH = withAPIVersioning(handlers.PATCH, config)
  }
  if (handlers.DELETE) {
    versioned.DELETE = withAPIVersioning(handlers.DELETE, config)
  }

  return versioned
}