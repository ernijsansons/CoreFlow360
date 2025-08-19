/**
 * CoreFlow360 - API Versioning Middleware
 * Handle version routing, deprecation warnings, and backward compatibility
 */

import { NextRequest, NextResponse } from 'next/server'

export interface APIVersion {
  version: string
  status: 'current' | 'deprecated' | 'sunset'
  deprecationDate?: Date
  sunsetDate?: Date
  migrationGuide?: string
}

export interface VersionedRoute {
  path: string
  versions: APIVersion[]
  currentVersion: string
}

// API version configuration
const API_VERSIONS: Record<string, APIVersion> = {
  v1: {
    version: 'v1',
    status: 'deprecated',
    deprecationDate: new Date('2024-12-31'),
    sunsetDate: new Date('2025-06-30'),
    migrationGuide: '/docs/api/migration/v1-to-v2',
  },
  v2: {
    version: 'v2',
    status: 'current',
    deprecationDate: undefined,
    sunsetDate: undefined,
  },
}

// Versioned routes configuration
const VERSIONED_ROUTES: VersionedRoute[] = [
  {
    path: '/api/subscriptions/calculate',
    versions: [API_VERSIONS.v1, API_VERSIONS.v2],
    currentVersion: 'v2',
  },
  {
    path: '/api/auth/register',
    versions: [API_VERSIONS.v1, API_VERSIONS.v2],
    currentVersion: 'v2',
  },
  {
    path: '/api/consciousness',
    versions: [API_VERSIONS.v2],
    currentVersion: 'v2',
  },
]

export class APIVersioning {
  /**
   * Extract API version from request path
   */
  static extractVersion(pathname: string): { version: string | null; cleanPath: string } {
    const versionMatch = pathname.match(/^\/api\/(v\d+)\/(.+)$/)

    if (versionMatch) {
      return {
        version: versionMatch[1],
        cleanPath: `/api/${versionMatch[2]}`,
      }
    }

    return {
      version: null,
      cleanPath: pathname,
    }
  }

  /**
   * Check if route is versioned
   */
  static isVersionedRoute(pathname: string): boolean {
    return VERSIONED_ROUTES.some(
      (route) =>
        pathname.startsWith(route.path) ||
        pathname.startsWith(`/api/v1${route.path}`) ||
        pathname.startsWith(`/api/v2${route.path}`)
    )
  }

  /**
   * Get version info for a route
   */
  static getVersionInfo(pathname: string): APIVersion | null {
    const { version } = this.extractVersion(pathname)
    return version ? API_VERSIONS[version] || null : null
  }

  /**
   * Check if version is deprecated
   */
  static isDeprecated(version: string): boolean {
    const versionInfo = API_VERSIONS[version]
    return versionInfo?.status === 'deprecated'
  }

  /**
   * Check if version is sunset
   */
  static isSunset(version: string): boolean {
    const versionInfo = API_VERSIONS[version]
    return versionInfo?.status === 'sunset'
  }

  /**
   * Add deprecation headers to response
   */
  static addDeprecationHeaders(response: NextResponse, version: string): NextResponse {
    const versionInfo = API_VERSIONS[version]

    if (versionInfo?.status === 'deprecated') {
      response.headers.set('Deprecation', 'true')
      response.headers.set('Sunset', versionInfo.sunsetDate?.toISOString() || '')

      if (versionInfo.migrationGuide) {
        response.headers.set('Link', `<${versionInfo.migrationGuide}>; rel="deprecation"`)
      }
    }

    return response
  }

  /**
   * Redirect to current version if no version specified
   */
  static redirectToCurrentVersion(request: NextRequest, pathname: string): NextResponse | null {
    const { version } = this.extractVersion(pathname)

    if (!version && this.isVersionedRoute(pathname)) {
      const route = VERSIONED_ROUTES.find((r) => pathname.startsWith(r.path))
      if (route) {
        const currentVersionPath = pathname.replace('/api/', `/api/${route.currentVersion}/`)
        return NextResponse.redirect(new URL(currentVersionPath, request.url))
      }
    }

    return null
  }

  /**
   * Handle version routing middleware
   */
  static handleVersioning(request: NextRequest): NextResponse | null {
    const { pathname } = request.nextUrl

    // Skip non-API routes
    if (!pathname.startsWith('/api/')) {
      return null
    }

    // Redirect to current version if no version specified
    const redirect = this.redirectToCurrentVersion(request, pathname)
    if (redirect) {
      return redirect
    }

    // Check for deprecated/sunset versions
    const { version } = this.extractVersion(pathname)
    if (version) {
      if (this.isSunset(version)) {
        return new NextResponse(
          JSON.stringify({
            error: 'API version sunset',
            message: `Version ${version} has been sunset. Please upgrade to the latest version.`,
            migrationGuide: API_VERSIONS[version]?.migrationGuide,
          }),
          {
            status: 410,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }
    }

    return null
  }

  /**
   * Create version-aware response
   */
  static createVersionedResponse(response: NextResponse, pathname: string): NextResponse {
    const { version } = this.extractVersion(pathname)

    if (version) {
      // Add version headers
      response.headers.set('X-API-Version', version)
      response.headers.set('X-API-Current-Version', 'v2')

      // Add deprecation warnings
      this.addDeprecationHeaders(response, version)
    }

    return response
  }
}

/**
 * Middleware function for API versioning
 */
export function apiVersioningMiddleware(request: NextRequest): NextResponse | null {
  return APIVersioning.handleVersioning(request)
}

/**
 * Create versioned API route handler
 */
export function createVersionedHandler(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: {
    supportedVersions?: string[]
    currentVersion?: string
  } = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const { pathname } = request.nextUrl
    const { version } = APIVersioning.extractVersion(pathname)

    // Check version support
    if (version && options.supportedVersions && !options.supportedVersions.includes(version)) {
      return new NextResponse(
        JSON.stringify({
          error: 'Unsupported API version',
          message: `Version ${version} is not supported. Supported versions: ${options.supportedVersions.join(', ')}`,
          currentVersion: options.currentVersion || 'v2',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Execute handler
    const response = await handler(request)

    // Add version headers
    return APIVersioning.createVersionedResponse(response, pathname)
  }
}
