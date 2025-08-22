/**
 * CoreFlow360 - Advanced Security Headers
 * Production-grade security middleware with comprehensive protection
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export interface SecurityConfig {
  contentSecurityPolicy: boolean
  strictTransportSecurity: boolean
  frameOptions: boolean
  contentTypeOptions: boolean
  referrerPolicy: boolean
  permissionsPolicy: boolean
  crossOriginOpenerPolicy: boolean
  crossOriginResourcePolicy: boolean
}

export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  contentSecurityPolicy: true,
  strictTransportSecurity: true,
  frameOptions: true,
  contentTypeOptions: true,
  referrerPolicy: true,
  permissionsPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: true,
}

// Content Security Policy - Strict configuration
const generateCSP = (isDev: boolean = false) => {
  const devSources = isDev ? "'unsafe-eval' 'unsafe-inline'" : ""
  
  return [
    `default-src 'self'`,
    `script-src 'self' 'unsafe-inline' ${devSources} https://vercel.live https://*.vercel.app https://va.vercel-scripts.com`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com`,
    `img-src 'self' data: blob: https: http:`,
    `connect-src 'self' https://*.vercel.app https://vitals.vercel-insights.com wss:`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
  ].join('; ')
}

// Security headers configuration
export const getSecurityHeaders = (request: NextRequest, config: Partial<SecurityConfig> = {}) => {
  const fullConfig = { ...DEFAULT_SECURITY_CONFIG, ...config }
  const isDev = process.env.NODE_ENV === 'development'
  const headers: Record<string, string> = {}

  // Content Security Policy
  if (fullConfig.contentSecurityPolicy) {
    headers['Content-Security-Policy'] = generateCSP(isDev)
  }

  // Strict Transport Security
  if (fullConfig.strictTransportSecurity && !isDev) {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
  }

  // X-Frame-Options
  if (fullConfig.frameOptions) {
    headers['X-Frame-Options'] = 'DENY'
  }

  // X-Content-Type-Options
  if (fullConfig.contentTypeOptions) {
    headers['X-Content-Type-Options'] = 'nosniff'
  }

  // Referrer Policy
  if (fullConfig.referrerPolicy) {
    headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
  }

  // Permissions Policy
  if (fullConfig.permissionsPolicy) {
    headers['Permissions-Policy'] = [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'interest-cohort=()',
      'payment=()',
      'usb=()',
      'bluetooth=()',
      'serial=()',
    ].join(', ')
  }

  // Cross-Origin Opener Policy
  if (fullConfig.crossOriginOpenerPolicy) {
    headers['Cross-Origin-Opener-Policy'] = 'same-origin'
  }

  // Cross-Origin Resource Policy
  if (fullConfig.crossOriginResourcePolicy) {
    headers['Cross-Origin-Resource-Policy'] = 'same-origin'
  }

  // Additional security headers
  headers['X-DNS-Prefetch-Control'] = 'off'
  headers['X-Download-Options'] = 'noopen'
  headers['X-Permitted-Cross-Domain-Policies'] = 'none'
  headers['X-XSS-Protection'] = '1; mode=block'

  return headers
}

// Security middleware
export const withSecurityHeaders = (
  request: NextRequest,
  response: NextResponse,
  config?: Partial<SecurityConfig>
) => {
  const headers = getSecurityHeaders(request, config)
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

// Rate limiting configuration
export const SECURITY_RATE_LIMITS = {
  // Authentication endpoints
  LOGIN: { requests: 5, window: 900000 }, // 5 requests per 15 minutes
  REGISTER: { requests: 3, window: 3600000 }, // 3 requests per hour
  PASSWORD_RESET: { requests: 3, window: 3600000 }, // 3 requests per hour
  
  // API endpoints
  API_READ: { requests: 1000, window: 3600000 }, // 1000 requests per hour
  API_WRITE: { requests: 100, window: 3600000 }, // 100 requests per hour
  API_ADMIN: { requests: 50, window: 3600000 }, // 50 requests per hour
  
  // File uploads
  FILE_UPLOAD: { requests: 10, window: 900000 }, // 10 uploads per 15 minutes
  
  // Search and analytics
  SEARCH: { requests: 200, window: 3600000 }, // 200 searches per hour
  ANALYTICS: { requests: 500, window: 3600000 }, // 500 analytics calls per hour
}

// IP whitelist for admin operations
export const ADMIN_IP_WHITELIST = new Set([
  '127.0.0.1',
  '::1',
  // Add production admin IPs here
])

// Security validation middleware
export const validateSecurityContext = (request: NextRequest) => {
  const userAgent = request.headers.get('user-agent') || ''
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const ip = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0]

  const threats = []

  // Basic bot detection
  const suspiciousBots = /(?:bot|crawler|spider|scraper|curl|wget|python|java)/i
  if (suspiciousBots.test(userAgent)) {
    threats.push('suspicious_user_agent')
  }

  // Origin validation
  if (origin && !origin.includes(request.nextUrl.host)) {
    threats.push('cross_origin_request')
  }

  // SQL injection patterns
  const sqlPattern = /(?:')|(?:--)|(\bUNION\b)|(\bSELECT\b)|(\bINSERT\b)|(\bDROP\b)|(\bDELETE\b)|(\bUPDATE\b)/i
  const url = request.url
  if (sqlPattern.test(url)) {
    threats.push('sql_injection_attempt')
  }

  // XSS patterns
  const xssPattern = /<script|javascript:|onload=|onerror=/i
  if (xssPattern.test(url)) {
    threats.push('xss_attempt')
  }

  return {
    ip,
    userAgent,
    origin,
    referer,
    threats,
    isSecure: threats.length === 0,
    riskScore: threats.length * 25, // 0-100 scale
  }
}

// Content validation
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return ''
  
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 10000) // Limit length
}

// Security event logging
export const logSecurityEvent = (
  event: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  details: Record<string, any>
) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    severity,
    details,
    environment: process.env.NODE_ENV,
  }

  // In production, send to security monitoring service
  if (process.env.NODE_ENV === 'production') {
    console.warn('[SECURITY]', JSON.stringify(logEntry))
    // TODO: Send to external security monitoring service
  } else {
    console.log('[SECURITY]', logEntry)
  }
}

export default {
  getSecurityHeaders,
  withSecurityHeaders,
  validateSecurityContext,
  sanitizeInput,
  logSecurityEvent,
  SECURITY_RATE_LIMITS,
  ADMIN_IP_WHITELIST,
}