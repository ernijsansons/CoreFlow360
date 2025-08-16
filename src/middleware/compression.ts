/**
 * CoreFlow360 - Response Compression Middleware
 * Compresses API responses for better performance
 */

import { NextRequest, NextResponse } from 'next/server'
import { compress } from 'node:zlib'
import { promisify } from 'node:util'

const gzipAsync = promisify(compress)

// Minimum size for compression (1KB)
const MIN_COMPRESS_SIZE = 1024

// Compressible content types
const COMPRESSIBLE_TYPES = [
  'application/json',
  'application/javascript',
  'text/html',
  'text/css',
  'text/plain',
  'text/xml',
  'application/xml',
  'application/rss+xml',
  'application/atom+xml',
  'image/svg+xml',
]

/**
 * Check if content type is compressible
 */
function isCompressible(contentType: string | null): boolean {
  if (!contentType) return false
  
  return COMPRESSIBLE_TYPES.some(type => 
    contentType.toLowerCase().includes(type)
  )
}

/**
 * Check if client accepts encoding
 */
function acceptsEncoding(
  request: NextRequest,
  encoding: string
): boolean {
  const acceptEncoding = request.headers.get('accept-encoding') || ''
  return acceptEncoding.toLowerCase().includes(encoding.toLowerCase())
}

/**
 * Compression middleware for Next.js
 */
export async function compressionMiddleware(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse> {
  // Check if response is already compressed
  if (response.headers.get('content-encoding')) {
    return response
  }
  
  // Check if content type is compressible
  const contentType = response.headers.get('content-type')
  if (!isCompressible(contentType)) {
    return response
  }
  
  // Check content length
  const contentLength = response.headers.get('content-length')
  if (contentLength && parseInt(contentLength) < MIN_COMPRESS_SIZE) {
    return response
  }
  
  // Check if client accepts gzip
  if (!acceptsEncoding(request, 'gzip')) {
    return response
  }
  
  try {
    // Get response body
    const body = await response.text()
    
    // Skip if body is too small
    if (body.length < MIN_COMPRESS_SIZE) {
      return response
    }
    
    // Compress with gzip
    const compressed = await gzipAsync(Buffer.from(body), {
      level: 6, // Balanced compression level
    })
    
    // Calculate compression ratio
    const originalSize = Buffer.byteLength(body)
    const compressedSize = compressed.length
    const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1)
    
    // Create new response with compressed body
    const compressedResponse = new NextResponse(compressed, {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers),
    })
    
    // Update headers
    compressedResponse.headers.set('content-encoding', 'gzip')
    compressedResponse.headers.set('content-length', String(compressedSize))
    compressedResponse.headers.set('vary', 'accept-encoding')
    
    // Add compression stats in development
    if (process.env.NODE_ENV === 'development') {
      compressedResponse.headers.set(
        'x-compression-ratio',
        `${ratio}% (${originalSize} → ${compressedSize} bytes)`
      )
    }
    
    return compressedResponse
  } catch (error) {
    console.error('Compression error:', error)
    // Return original response on error
    return response
  }
}

/**
 * Create compression middleware wrapper
 */
export function withCompression(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const response = await handler(request)
    return compressionMiddleware(request, response)
  }
}

/**
 * Compression configuration for different content types
 */
export const compressionConfig = {
  // High compression for text-based content
  text: {
    level: 9,
    threshold: 512,
  },
  // Balanced compression for JSON
  json: {
    level: 6,
    threshold: 1024,
  },
  // Light compression for already optimized content
  optimized: {
    level: 3,
    threshold: 2048,
  },
}

/**
 * Advanced compression with Brotli support (for future use)
 */
export async function advancedCompression(
  request: NextRequest,
  response: NextResponse,
  options: {
    preferBrotli?: boolean
    minSize?: number
    level?: number
  } = {}
): Promise<NextResponse> {
  const {
    preferBrotli = true,
    minSize = MIN_COMPRESS_SIZE,
    level = 6,
  } = options
  
  // Check if response should be compressed
  const contentType = response.headers.get('content-type')
  if (!isCompressible(contentType)) {
    return response
  }
  
  // Get response body
  const body = await response.text()
  if (body.length < minSize) {
    return response
  }
  
  // Determine best encoding
  const acceptEncoding = request.headers.get('accept-encoding') || ''
  let encoding: string | null = null
  let compressed: Buffer | null = null
  
  // Try Brotli first if preferred and supported
  if (preferBrotli && acceptEncoding.includes('br')) {
    // Brotli compression would go here
    // For now, fall back to gzip
    encoding = 'gzip'
    compressed = await gzipAsync(Buffer.from(body), { level })
  } else if (acceptEncoding.includes('gzip')) {
    encoding = 'gzip'
    compressed = await gzipAsync(Buffer.from(body), { level })
  } else if (acceptEncoding.includes('deflate')) {
    // Deflate compression would go here
    // For now, return uncompressed
    return response
  } else {
    // No acceptable encoding
    return response
  }
  
  if (!compressed || !encoding) {
    return response
  }
  
  // Create compressed response
  const compressedResponse = new NextResponse(compressed, {
    status: response.status,
    statusText: response.statusText,
    headers: new Headers(response.headers),
  })
  
  // Update headers
  compressedResponse.headers.set('content-encoding', encoding)
  compressedResponse.headers.set('content-length', String(compressed.length))
  compressedResponse.headers.set('vary', 'accept-encoding')
  
  return compressedResponse
}

/**
 * Streaming compression for large responses
 */
export function createCompressionStream(
  encoding: 'gzip' | 'deflate' | 'br' = 'gzip',
  options: any = {}
): TransformStream {
  // This would create a compression transform stream
  // For now, return a pass-through stream
  return new TransformStream()
}

/**
 * Middleware configuration for Next.js
 */
export const compressionMiddlewareConfig = {
  // Apply to API routes
  matcher: '/api/:path*',
  // Exclude specific paths
  exclude: [
    '/api/health',
    '/api/metrics',
    '/api/voice/stream',
  ],
  // Compression settings
  settings: {
    minSize: MIN_COMPRESS_SIZE,
    level: 6,
    types: COMPRESSIBLE_TYPES,
  },
}