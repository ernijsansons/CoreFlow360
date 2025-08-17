/**
 * CoreFlow360 - Security Middleware
 * Production-grade security measures for the modular ERP platform
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import crypto from 'crypto'

// Security headers configuration
const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-XSS-Protection': '1; mode=block',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://vercel.live",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob: https://vercel.live",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://api.stripe.com wss:// https://vercel.live",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ')
}

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  message: string
  blockDuration?: number // Additional block duration for repeated violations
}

const rateLimitConfigs: Record<string, RateLimitConfig> = {
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    message: 'Too many requests from this IP, please try again later.',
    blockDuration: 300000 // 5 minutes block for repeated violations
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many authentication attempts, please try again later.',
    blockDuration: 900000 // 15 minutes block
  },
  stripe: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    message: 'Too many payment requests, please try again later.',
    blockDuration: 600000 // 10 minutes block
  },
  ai: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
    message: 'Too many AI requests, please try again later.',
    blockDuration: 300000 // 5 minutes block
  }
}

// Enhanced rate limit store with blocking capability
interface RateLimitEntry {
  count: number
  resetTime: number
  blockedUntil?: number
  violations: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Redis client for production (fallback to in-memory for development)
let redisClient: any = null

// Lazy Redis initialization function
function getRedisClient() {
  // Skip during build
  if (process.env.VERCEL || process.env.CI || process.env.NEXT_PHASE === 'phase-production-build' || process.env.VERCEL_ENV === 'preview') {
    return null
  }
  
  // Return existing client if already initialized
  if (redisClient !== null) {
    return redisClient
  }
  
  // Initialize Redis client only when REDIS_URL is explicitly provided
  if (process.env.REDIS_URL && typeof process.env.REDIS_URL === 'string' && process.env.REDIS_URL.length > 0) {
    try {
      const Redis = require('ioredis')
      // Avoid noisy retries in development; fall back to memory on failure
      redisClient = new Redis(process.env.REDIS_URL, {
        lazyConnect: true,
        retryStrategy: () => null,
        maxRetriesPerRequest: 0,
      })

      // Attempt a one-time connect; on failure, disable Redis usage
      redisClient.connect().catch((err: any) => {
        console.warn('Redis connection failed, using in-memory rate limiting:', err?.message || err)
        try { redisClient.disconnect() } catch {}
        redisClient = null
      })

      // If runtime error occurs later, disable Redis usage
      redisClient.on('error', (err: any) => {
        console.warn('Redis error, switching to in-memory rate limiting:', err?.message || err)
        try { redisClient.disconnect() } catch {}
        redisClient = null
      })
    } catch (error) {
      console.warn('Redis client unavailable, using in-memory rate limiting')
      redisClient = null
    }
  }
  
  return redisClient
}

export async function securityMiddleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Enhanced CSRF Protection for mutations
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const csrfToken = request.headers.get('x-csrf-token')
    const sessionToken = request.cookies.get('csrf-token')?.value
    const isWebhook = request.nextUrl.pathname.includes('/webhook')

    if (!isWebhook) {
      if (!csrfToken || !sessionToken || !validateCsrfToken(csrfToken, sessionToken)) {
        return NextResponse.json(
          { error: 'Invalid CSRF token' },
          { status: 403 }
        )
      }
    }
  }

  // Enhanced rate limiting with Redis support
  const ip = getClientIP(request)
  const path = request.nextUrl.pathname
  
  let rateLimitConfig: RateLimitConfig | undefined
  
  if (path.startsWith('/api/auth')) {
    rateLimitConfig = rateLimitConfigs.auth
  } else if (path.startsWith('/api/stripe')) {
    rateLimitConfig = rateLimitConfigs.stripe
  } else if (path.startsWith('/api/ai')) {
    rateLimitConfig = rateLimitConfigs.ai
  } else if (path.startsWith('/api')) {
    rateLimitConfig = rateLimitConfigs.api
  }

  if (rateLimitConfig) {
    const rateLimitResult = await checkRateLimit(ip, path, rateLimitConfig)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.message },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rateLimitResult.retryAfter / 1000)),
            'X-RateLimit-Limit': String(rateLimitConfig.maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimitResult.resetTime)
          }
        }
      )
    }
  }

  // Clean up old rate limit entries periodically
  if (Math.random() < 0.01) { // 1% chance
    cleanupRateLimitStore()
  }

  return response
}

// Enhanced input sanitization utilities
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Remove null bytes and control characters
    input = input.replace(/[\x00-\x1F\x7F]/g, '')
    
    // Trim whitespace
    input = input.trim()
    
    // Prevent script injection with more comprehensive patterns
    input = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    input = input.replace(/javascript:/gi, '')
    input = input.replace(/on\w+\s*=/gi, '')
    
    // Encode special characters
    input = input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  } else if (Array.isArray(input)) {
    return input.map(sanitizeInput)
  } else if (input && typeof input === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(input)) {
      sanitized[sanitizeInput(key)] = sanitizeInput(value)
    }
    return sanitized
  }
  
  return input
}

// Enhanced tenant isolation validator
export async function validateTenantAccess(
  tenantId: string,
  userId: string,
  resource: string
): Promise<boolean> {
  if (!tenantId || !userId) {
    return false
  }
  
  // Enhanced tenant ID format validation
  const tenantIdRegex = /^[a-zA-Z0-9-_]{3,50}$/
  if (!tenantIdRegex.test(tenantId)) {
    return false
  }
  
  // Enhanced user ID format validation
  const userIdRegex = /^[a-zA-Z0-9-_]{3,50}$/
  if (!userIdRegex.test(userId)) {
    return false
  }
  
  // Additional checks would go here:
  // - Verify user belongs to tenant
  // - Check user permissions for resource
  // - Validate resource ownership
  
  return true
}

// Enhanced API key validation
export function validateApiKey(apiKey: string): { valid: boolean; tenantId?: string } {
  if (!apiKey || !apiKey.startsWith('cf360_')) {
    return { valid: false }
  }
  
  try {
    // API key format: cf360_<tenantId>_<random>_<signature>
    const parts = apiKey.split('_')
    if (parts.length !== 4) {
      return { valid: false }
    }
    
    const [prefix, tenantId, random, signature] = parts
    
    // Validate tenant ID format
    const tenantIdRegex = /^[a-zA-Z0-9-_]{3,50}$/
    if (!tenantIdRegex.test(tenantId)) {
      return { valid: false }
    }
    
    // Verify signature with timing-safe comparison
    const secret = process.env.API_KEY_SECRET
    if (!secret) {
      return { valid: false }
    }
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${prefix}_${tenantId}_${random}`)
      .digest('hex')
      .substring(0, 16)
    
    if (!crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )) {
      return { valid: false }
    }
    
    return { valid: true, tenantId }
  } catch (error) {
    return { valid: false }
  }
}

// Enhanced SQL injection prevention
export function escapeSqlIdentifier(identifier: string): string {
  // Remove any non-alphanumeric characters except underscore
  return identifier.replace(/[^a-zA-Z0-9_]/g, '')
}

// Enhanced CSRF token generation and validation
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function validateCsrfToken(token: string, sessionToken: string): boolean {
  if (!token || !sessionToken) {
    return false
  }
  
  // Use timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(sessionToken)
  )
}

// Enhanced webhook signature validation
export function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
    
    // Use timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch (error) {
    return false
  }
}

// Helper functions
function getClientIP(request: NextRequest): string {
  return request.ip || 
         request.headers.get('x-forwarded-for')?.split(',')[0] || 
         request.headers.get('x-real-ip') || 
         'unknown'
}

async function checkRateLimit(
  ip: string, 
  path: string, 
  config: RateLimitConfig
): Promise<{ allowed: boolean; message: string; retryAfter: number; resetTime: number }> {
  const key = `${ip}:${path}`
  const now = Date.now()
  
  const client = getRedisClient()
  if (client && client.status === 'ready') {
    // Use Redis for production
    return await checkRateLimitRedis(key, now, config)
  } else {
    // Use in-memory for development
    return checkRateLimitMemory(key, now, config)
  }
}

async function checkRateLimitRedis(
  key: string, 
  now: number, 
  config: RateLimitConfig
): Promise<{ allowed: boolean; message: string; retryAfter: number; resetTime: number }> {
  const client = getRedisClient()
  if (!client) {
    // Fallback to memory if Redis not available
    return checkRateLimitMemory(key, now, config)
  }
  
  try {
    // Atomic rate limiting using Redis pipeline
    const pipeline = client.pipeline()
    pipeline.incr(key)
    pipeline.expire(key, Math.floor(config.windowMs / 1000))
    pipeline.get(key)
    
    const results = await pipeline.exec()
    const newCount = results[0][1] as number
    const currentCount = results[2][1] as number || newCount
    
    if (currentCount > config.maxRequests) {
      const ttl = await client.ttl(key)
      const retryAfter = ttl > 0 ? ttl * 1000 : config.windowMs
      
      return {
        allowed: false,
        message: config.message,
        retryAfter,
        resetTime: now + retryAfter
      }
    }
    
    return {
      allowed: true,
      message: '',
      retryAfter: 0,
      resetTime: now + config.windowMs
    }
  } catch (error) {
    console.error('Redis rate limiting error:', error)
    // Fallback to memory-based rate limiting
    return checkRateLimitMemory(key, now, config)
  }
}

function checkRateLimitMemory(
  key: string, 
  now: number, 
  config: RateLimitConfig
): { allowed: boolean; message: string; retryAfter: number; resetTime: number } {
  const limit = rateLimitStore.get(key)
  
  if (limit && limit.blockedUntil && limit.blockedUntil > now) {
    return {
      allowed: false,
      message: config.message,
      retryAfter: limit.blockedUntil - now,
      resetTime: limit.blockedUntil
    }
  }
  
  if (limit && limit.resetTime > now) {
    if (limit.count >= config.maxRequests) {
      // Block the IP for additional duration
      const blockDuration = config.blockDuration || config.windowMs
      limit.blockedUntil = now + blockDuration
      limit.violations++
      
      return {
        allowed: false,
        message: config.message,
        retryAfter: blockDuration,
        resetTime: limit.blockedUntil
      }
    }
    
    limit.count++
  } else {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
      violations: 0
    })
  }
  
  return {
    allowed: true,
    message: '',
    retryAfter: 0,
    resetTime: now + config.windowMs
  }
}

function cleanupRateLimitStore(): void {
  const now = Date.now()
  for (const [key, limit] of rateLimitStore.entries()) {
    if (limit.resetTime < now && (!limit.blockedUntil || limit.blockedUntil < now)) {
      rateLimitStore.delete(key)
    }
  }
}