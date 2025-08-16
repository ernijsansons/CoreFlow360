/**
 * CoreFlow360 - Idempotency Middleware
 * Ensures reliable request processing with automatic retry handling and duplicate prevention
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withCircuitBreakerProtection } from '@/lib/resilience/circuit-breaker'
import { createHash } from 'crypto'

export interface IdempotencyOptions {
  keyHeader?: string
  keyExtractor?: (request: NextRequest) => string | null
  ttlMinutes?: number
  excludePaths?: string[]
  methods?: string[]
  skipForUsers?: string[]
}

const DEFAULT_OPTIONS: Required<IdempotencyOptions> = {
  keyHeader: 'idempotency-key',
  keyExtractor: () => null,
  ttlMinutes: 60,
  excludePaths: ['/api/health', '/api/metrics'],
  methods: ['POST', 'PUT', 'PATCH'],
  skipForUsers: []
}

/**
 * Generate idempotency key from request content
 */
function generateIdempotencyKey(request: NextRequest, body?: string): string {
  const keyData = {
    method: request.method,
    url: request.url,
    body: body || '',
    userAgent: request.headers.get('user-agent') || '',
    userId: request.headers.get('x-user-id') || ''
  }
  
  return createHash('sha256')
    .update(JSON.stringify(keyData))
    .digest('hex')
    .substring(0, 32)
}

/**
 * Check if request should be processed with idempotency
 */
function shouldProcessIdempotency(
  request: NextRequest, 
  options: Required<IdempotencyOptions>
): boolean {
  // Check method
  if (!options.methods.includes(request.method)) {
    return false
  }
  
  // Check excluded paths
  const pathname = new URL(request.url).pathname
  if (options.excludePaths.some(path => pathname.startsWith(path))) {
    return false
  }
  
  // Check user exclusions
  const userId = request.headers.get('x-user-id')
  if (userId && options.skipForUsers.includes(userId)) {
    return false
  }
  
  return true
}

/**
 * Create idempotency key record
 */
async function createIdempotencyRecord(
  key: string,
  request: NextRequest,
  ttlMinutes: number,
  tenantId?: string,
  userId?: string
) {
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000)
  const pathname = new URL(request.url).pathname
  
  return withCircuitBreakerProtection('database', async () => {
    return prisma.idempotencyKey.create({
      data: {
        key,
        method: request.method,
        endpoint: pathname,
        tenantId,
        userId,
        expiresAt,
        isProcessing: true,
        attemptCount: 1
      }
    })
  })
}

/**
 * Get existing idempotency record
 */
async function getIdempotencyRecord(key: string) {
  return withCircuitBreakerProtection('database', async () => {
    return prisma.idempotencyKey.findUnique({
      where: { key }
    })
  })
}

/**
 * Update idempotency record with response
 */
async function updateIdempotencyRecord(
  key: string,
  status: number,
  body: string,
  headers: Record<string, string> = {}
) {
  return withCircuitBreakerProtection('database', async () => {
    return prisma.idempotencyKey.update({
      where: { key },
      data: {
        responseStatus: status,
        responseBody: body,
        responseHeaders: JSON.stringify(headers),
        isProcessing: false,
        processedAt: new Date()
      }
    })
  })
}

/**
 * Increment attempt count for retry scenarios
 */
async function incrementAttemptCount(key: string, error?: string) {
  return withCircuitBreakerProtection('database', async () => {
    return prisma.idempotencyKey.update({
      where: { key },
      data: {
        attemptCount: { increment: 1 },
        lastError: error,
        updatedAt: new Date()
      }
    })
  })
}

/**
 * Clean up expired idempotency keys
 */
export async function cleanupExpiredKeys(): Promise<number> {
  try {
    const result = await withCircuitBreakerProtection('database', async () => {
      return prisma.idempotencyKey.deleteMany({
        where: {
          expiresAt: {
            lt: new Date()
          }
        }
      })
    })
    
    return result.count
  } catch (error) {
    console.error('Failed to cleanup expired idempotency keys:', error)
    return 0
  }
}

/**
 * Idempotency middleware wrapper
 */
export function withIdempotency(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: IdempotencyOptions = {}
) {
  const config = { ...DEFAULT_OPTIONS, ...options }
  
  return async (request: NextRequest): Promise<NextResponse> => {
    // Skip idempotency if not applicable
    if (!shouldProcessIdempotency(request, config)) {
      return handler(request)
    }
    
    // Extract idempotency key
    let idempotencyKey = request.headers.get(config.keyHeader)
    
    // If no key provided and custom extractor exists, try it
    if (!idempotencyKey && config.keyExtractor) {
      idempotencyKey = config.keyExtractor(request)
    }
    
    // If still no key, generate one from request content
    if (!idempotencyKey) {
      // For requests with body, we need to read it
      if (request.method !== 'GET' && request.headers.get('content-length') !== '0') {
        try {
          const body = await request.text()
          idempotencyKey = generateIdempotencyKey(request, body)
          
          // Create a new request with the body for the handler
          const newRequest = new NextRequest(request.url, {
            method: request.method,
            headers: request.headers,
            body: body || undefined
          })
          
          return processWithIdempotency(newRequest, handler, idempotencyKey, config)
        } catch (error) {
          console.error('Failed to generate idempotency key:', error)
          return handler(request)
        }
      } else {
        idempotencyKey = generateIdempotencyKey(request)
      }
    }
    
    return processWithIdempotency(request, handler, idempotencyKey, config)
  }
}

/**
 * Process request with idempotency protection
 */
async function processWithIdempotency(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>,
  key: string,
  config: Required<IdempotencyOptions>
): Promise<NextResponse> {
  const tenantId = request.headers.get('x-tenant-id') || undefined
  const userId = request.headers.get('x-user-id') || undefined
  
  try {
    // Check for existing request
    const existingRecord = await getIdempotencyRecord(key)
    
    if (existingRecord) {
      // If still processing, return 409 Conflict with Retry-After
      if (existingRecord.isProcessing) {
        const processingTime = Date.now() - existingRecord.createdAt.getTime()
        const estimatedRetryAfter = Math.max(1, Math.ceil((60000 - processingTime) / 1000))
        
        return NextResponse.json(
          {
            error: 'Request is being processed',
            message: 'This request is currently being processed. Please retry in a few seconds.',
            processingTime: processingTime,
            attemptCount: existingRecord.attemptCount
          },
          {
            status: 409,
            headers: {
              'Retry-After': estimatedRetryAfter.toString(),
              'X-Idempotency-Key': key,
              'X-Processing-Time': processingTime.toString()
            }
          }
        )
      }
      
      // If completed, return cached response
      if (existingRecord.responseStatus && existingRecord.responseBody) {
        const headers = existingRecord.responseHeaders 
          ? JSON.parse(existingRecord.responseHeaders) 
          : {}
        
        return new NextResponse(existingRecord.responseBody, {
          status: existingRecord.responseStatus,
          headers: {
            ...headers,
            'X-Idempotency-Key': key,
            'X-Cached-Response': 'true',
            'X-Original-Request-Time': existingRecord.createdAt.toISOString()
          }
        })
      }
      
      // If exists but no response (error case), increment attempt and continue
      await incrementAttemptCount(key)
    } else {
      // Create new idempotency record
      await createIdempotencyRecord(key, request, config.ttlMinutes, tenantId, userId)
    }
    
    // Process the request
    try {
      const response = await handler(request)
      
      // Cache successful responses (2xx status codes)
      if (response.status >= 200 && response.status < 300) {
        const responseBody = await response.text()
        const responseHeaders: Record<string, string> = {}
        
        response.headers.forEach((value, key) => {
          if (!key.startsWith('x-') && key !== 'set-cookie') {
            responseHeaders[key] = value
          }
        })
        
        // Update idempotency record with response
        await updateIdempotencyRecord(key, response.status, responseBody, responseHeaders)
        
        // Return response with idempotency headers
        return new NextResponse(responseBody, {
          status: response.status,
          headers: {
            ...responseHeaders,
            'X-Idempotency-Key': key,
            'X-Cached-Response': 'false'
          }
        })
      } else {
        // For error responses, mark as not processing but don't cache
        await updateIdempotencyRecord(key, response.status, '', {})
        
        // Add idempotency key to error response
        const errorBody = await response.text()
        return new NextResponse(errorBody, {
          status: response.status,
          headers: {
            ...Object.fromEntries(response.headers.entries()),
            'X-Idempotency-Key': key,
            'X-Cached-Response': 'false'
          }
        })
      }
    } catch (error) {
      // Mark as not processing and record error
      await updateIdempotencyRecord(
        key, 
        500, 
        JSON.stringify({ error: 'Internal server error' }),
        {}
      )
      
      await incrementAttemptCount(key, error instanceof Error ? error.message : 'Unknown error')
      
      throw error
    }
  } catch (error) {
    console.error('Idempotency middleware error:', error)
    
    // If idempotency fails, continue with original request
    const response = await handler(request)
    
    // Add warning header
    response.headers.set('X-Idempotency-Warning', 'Idempotency processing failed')
    
    return response
  }
}

/**
 * Extract idempotency key from Stripe webhook signature
 */
export function extractStripeIdempotencyKey(request: NextRequest): string | null {
  const signature = request.headers.get('stripe-signature')
  if (!signature) return null
  
  // Stripe sends signature which can be used as idempotency key
  return createHash('sha256').update(signature).digest('hex').substring(0, 32)
}

/**
 * Extract idempotency key from customer email for customer operations
 */
export function extractCustomerIdempotencyKey(request: NextRequest): string | null {
  const contentType = request.headers.get('content-type')
  if (!contentType?.includes('application/json')) return null
  
  try {
    // This would need the request body to be available
    // For now, return null and rely on auto-generation
    return null
  } catch {
    return null
  }
}

/**
 * Setup automatic cleanup job (should be called on server startup)
 */
export function setupIdempotencyCleanup(): void {
  // Clean up expired keys every hour
  setInterval(async () => {
    try {
      const cleaned = await cleanupExpiredKeys()
      if (cleaned > 0) {
        console.log(`Cleaned up ${cleaned} expired idempotency keys`)
      }
    } catch (error) {
      console.error('Idempotency cleanup failed:', error)
    }
  }, 60 * 60 * 1000) // 1 hour
}

/**
 * Helper to manually invalidate idempotency key (for testing or admin operations)
 */
export async function invalidateIdempotencyKey(key: string): Promise<boolean> {
  try {
    await withCircuitBreakerProtection('database', async () => {
      await prisma.idempotencyKey.delete({
        where: { key }
      })
    })
    return true
  } catch (error) {
    console.error('Failed to invalidate idempotency key:', error)
    return false
  }
}

/**
 * Get idempotency statistics for monitoring
 */
export async function getIdempotencyStats(): Promise<{
  totalKeys: number
  processingKeys: number
  expiredKeys: number
  averageProcessingTime: number
}> {
  try {
    const [stats] = await withCircuitBreakerProtection('database', async () => {
      return prisma.$queryRaw<Array<{
        total_keys: bigint
        processing_keys: bigint
        expired_keys: bigint
        avg_processing_time: number
      }>>`
        SELECT 
          COUNT(*) as total_keys,
          COUNT(CASE WHEN is_processing = true THEN 1 END) as processing_keys,
          COUNT(CASE WHEN expires_at < NOW() THEN 1 END) as expired_keys,
          AVG(EXTRACT(EPOCH FROM (processed_at - created_at)) * 1000) as avg_processing_time
        FROM idempotency_keys
        WHERE created_at > NOW() - INTERVAL '24 hours'
      `
    })
    
    return {
      totalKeys: Number(stats?.total_keys || 0),
      processingKeys: Number(stats?.processing_keys || 0),
      expiredKeys: Number(stats?.expired_keys || 0),
      averageProcessingTime: stats?.avg_processing_time || 0
    }
  } catch (error) {
    console.error('Failed to get idempotency stats:', error)
    return {
      totalKeys: 0,
      processingKeys: 0,
      expiredKeys: 0,
      averageProcessingTime: 0
    }
  }
}