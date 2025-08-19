/**
 * CoreFlow360 - DDoS Protection Configuration
 *
 * Edge-based DDoS protection with Cloudflare integration,
 * rate limiting, and traffic anomaly detection.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'

// DDoS Protection Configuration
export const DDOS_CONFIG = {
  // Rate limiting per IP
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // requests per window
    blockDuration: 5 * 60 * 1000, // 5 minutes
    message: 'Too many requests from this IP, please try again later.',
  },

  // Geographic restrictions
  geoBlocking: {
    enabled: false,
    allowedCountries: ['US', 'CA', 'GB', 'AU', 'NZ', 'IE'], // ISO country codes
    blockedCountries: [], // High-risk countries
  },

  // Challenge thresholds
  challenges: {
    enabled: true,
    suspiciousScore: 30, // Trigger JS challenge
    threatScore: 60, // Trigger CAPTCHA
    blockScore: 90, // Block request
  },

  // Traffic patterns
  trafficPatterns: {
    maxRequestsPerPath: 50, // per minute per path
    maxUniquePathsPerIP: 100, // per minute
    maxPayloadSize: 10 * 1024 * 1024, // 10MB
    suspiciousUserAgents: [
      'bot',
      'crawler',
      'spider',
      'scraper',
      'curl',
      'wget',
      'python-requests',
      'go-http-client',
      'java/',
      'ruby',
    ],
  },

  // API-specific protection
  apiProtection: {
    maxRequestsPerKey: 1000, // per hour
    maxBurstPerKey: 50, // per minute
    requireApiKey: true,
    validateSignature: true,
  },
}

/**
 * Cloudflare Headers and Threat Detection
 */
export interface CloudflareHeaders {
  'cf-ray'?: string
  'cf-connecting-ip'?: string
  'cf-ipcountry'?: string
  'cf-threat-score'?: string
  'cf-visitor'?: string
  'cf-request-id'?: string
  'cf-challenge'?: string
}

/**
 * DDoS Protection Result
 */
export interface DDoSProtectionResult {
  allowed: boolean
  reason?: string
  action?: 'allow' | 'challenge' | 'captcha' | 'block'
  score?: number
  metadata?: Record<string, unknown>
}

/**
 * Request fingerprint for tracking
 */
interface RequestFingerprint {
  ip: string
  userAgent: string
  country?: string
  path: string
  method: string
  timestamp: number
}

/**
 * In-memory tracking for DDoS detection
 */
class DDoSTracker {
  private requests = new Map<string, RequestFingerprint[]>()
  private blocked = new Map<string, number>()
  private apiUsage = new Map<string, number[]>()

  /**
   * Track a request
   */
  track(fingerprint: RequestFingerprint): void {
    const key = fingerprint.ip
    const now = Date.now()

    // Clean old entries
    this.cleanup(now)

    // Add new request
    const requests = this.requests.get(key) || []
    requests.push(fingerprint)
    this.requests.set(key, requests)
  }

  /**
   * Check if IP is currently blocked
   */
  isBlocked(ip: string): boolean {
    const blockedUntil = this.blocked.get(ip)
    if (!blockedUntil) return false

    if (Date.now() > blockedUntil) {
      this.blocked.delete(ip)
      return false
    }

    return true
  }

  /**
   * Block an IP
   */
  blockIP(ip: string, duration: number = DDOS_CONFIG.rateLimit.blockDuration): void {
    this.blocked.set(ip, Date.now() + duration)
  }

  /**
   * Get request count for IP in time window
   */
  getRequestCount(ip: string, windowMs: number): number {
    const requests = this.requests.get(ip) || []
    const cutoff = Date.now() - windowMs
    return requests.filter((r) => r.timestamp > cutoff).length
  }

  /**
   * Get unique paths accessed by IP
   */
  getUniquePaths(ip: string, windowMs: number): Set<string> {
    const requests = this.requests.get(ip) || []
    const cutoff = Date.now() - windowMs
    const paths = new Set<string>()

    requests.filter((r) => r.timestamp > cutoff).forEach((r) => paths.add(r.path))

    return paths
  }

  /**
   * Track API usage
   */
  trackApiUsage(apiKey: string): void {
    const now = Date.now()
    const usage = this.apiUsage.get(apiKey) || []
    usage.push(now)
    this.apiUsage.set(apiKey, usage)
  }

  /**
   * Get API usage count
   */
  getApiUsage(apiKey: string, windowMs: number): number {
    const usage = this.apiUsage.get(apiKey) || []
    const cutoff = Date.now() - windowMs
    return usage.filter((timestamp) => timestamp > cutoff).length
  }

  /**
   * Clean up old entries
   */
  private cleanup(now: number): void {
    const cutoff = now - 5 * 60 * 1000 // 5 minutes

    // Clean requests
    for (const [ip, requests] of this.requests.entries()) {
      const filtered = requests.filter((r) => r.timestamp > cutoff)
      if (filtered.length === 0) {
        this.requests.delete(ip)
      } else {
        this.requests.set(ip, filtered)
      }
    }

    // Clean API usage
    for (const [key, usage] of this.apiUsage.entries()) {
      const filtered = usage.filter((t) => t > cutoff)
      if (filtered.length === 0) {
        this.apiUsage.delete(key)
      } else {
        this.apiUsage.set(key, filtered)
      }
    }
  }
}

// Global tracker instance
const tracker = new DDoSTracker()

/**
 * Main DDoS Protection Class
 */
export class DDoSProtection {
  /**
   * Analyze request for DDoS patterns
   */
  static async analyzeRequest(request: NextRequest): Promise<DDoSProtectionResult> {
    try {
      const headers = this.extractCloudflareHeaders(request)
      const ip = this.getClientIP(request, headers)
      const fingerprint = this.createFingerprint(request, ip, headers)

      // Check if IP is blocked
      if (tracker.isBlocked(ip)) {
        return {
          allowed: false,
          reason: 'IP is temporarily blocked',
          action: 'block',
          score: 100,
        }
      }

      // Track the request
      tracker.track(fingerprint)

      // Perform checks
      const checks = await Promise.all([
        this.checkRateLimit(ip),
        this.checkGeoBlocking(headers['cf-ipcountry']),
        this.checkThreatScore(headers['cf-threat-score']),
        this.checkTrafficPatterns(ip, fingerprint),
        this.checkUserAgent(fingerprint.userAgent),
      ])

      // Calculate overall score
      const overallScore = Math.max(...checks.map((c) => c.score || 0))

      // Determine action based on score
      if (overallScore >= DDOS_CONFIG.challenges.blockScore) {
        tracker.blockIP(ip)
        return {
          allowed: false,
          reason: 'Request blocked due to high threat score',
          action: 'block',
          score: overallScore,
          metadata: { checks },
        }
      }

      if (overallScore >= DDOS_CONFIG.challenges.threatScore) {
        return {
          allowed: false,
          reason: 'CAPTCHA challenge required',
          action: 'captcha',
          score: overallScore,
          metadata: { checks },
        }
      }

      if (overallScore >= DDOS_CONFIG.challenges.suspiciousScore) {
        return {
          allowed: false,
          reason: 'JavaScript challenge required',
          action: 'challenge',
          score: overallScore,
          metadata: { checks },
        }
      }

      return {
        allowed: true,
        action: 'allow',
        score: overallScore,
        metadata: { checks },
      }
    } catch (error) {
      // Fail open to avoid blocking legitimate traffic
      return { allowed: true, action: 'allow' }
    }
  }

  /**
   * Check rate limiting
   */
  private static checkRateLimit(ip: string): DDoSProtectionResult {
    const count = tracker.getRequestCount(ip, DDOS_CONFIG.rateLimit.windowMs)

    if (count > DDOS_CONFIG.rateLimit.maxRequests) {
      return {
        allowed: false,
        reason: 'Rate limit exceeded',
        score: 80,
      }
    }

    // Calculate score based on request rate
    const score = Math.min(50, (count / DDOS_CONFIG.rateLimit.maxRequests) * 50)

    return {
      allowed: true,
      score,
    }
  }

  /**
   * Check geographic restrictions
   */
  private static checkGeoBlocking(country?: string): DDoSProtectionResult {
    if (!DDOS_CONFIG.geoBlocking.enabled || !country) {
      return { allowed: true, score: 0 }
    }

    if (DDOS_CONFIG.geoBlocking.blockedCountries.includes(country)) {
      return {
        allowed: false,
        reason: `Access from ${country} is blocked`,
        score: 100,
      }
    }

    if (
      DDOS_CONFIG.geoBlocking.allowedCountries.length > 0 &&
      !DDOS_CONFIG.geoBlocking.allowedCountries.includes(country)
    ) {
      return {
        allowed: false,
        reason: `Access from ${country} is not allowed`,
        score: 90,
      }
    }

    return { allowed: true, score: 0 }
  }

  /**
   * Check Cloudflare threat score
   */
  private static checkThreatScore(threatScore?: string): DDoSProtectionResult {
    if (!threatScore) {
      return { allowed: true, score: 0 }
    }

    const score = parseInt(threatScore, 10)
    if (isNaN(score)) {
      return { allowed: true, score: 0 }
    }

    return {
      allowed: score < DDOS_CONFIG.challenges.blockScore,
      score,
    }
  }

  /**
   * Check traffic patterns
   */
  private static checkTrafficPatterns(
    ip: string,
    fingerprint: RequestFingerprint
  ): DDoSProtectionResult {
    const uniquePaths = tracker.getUniquePaths(ip, 60000) // 1 minute

    if (uniquePaths.size > DDOS_CONFIG.trafficPatterns.maxUniquePathsPerIP) {
      return {
        allowed: false,
        reason: 'Suspicious traffic pattern detected',
        score: 70,
      }
    }

    // Calculate score based on path diversity
    const score = Math.min(
      40,
      (uniquePaths.size / DDOS_CONFIG.trafficPatterns.maxUniquePathsPerIP) * 40
    )

    return {
      allowed: true,
      score,
    }
  }

  /**
   * Check user agent
   */
  private static checkUserAgent(userAgent: string): DDoSProtectionResult {
    const lowerUA = userAgent.toLowerCase()

    const isSuspicious = DDOS_CONFIG.trafficPatterns.suspiciousUserAgents.some((pattern) =>
      lowerUA.includes(pattern)
    )

    if (isSuspicious) {
      return {
        allowed: true, // Don't block, just increase score
        score: 30,
      }
    }

    return { allowed: true, score: 0 }
  }

  /**
   * Extract Cloudflare headers
   */
  private static extractCloudflareHeaders(request: NextRequest): CloudflareHeaders {
    const headers: CloudflareHeaders = {}
    const headerNames = [
      'cf-ray',
      'cf-connecting-ip',
      'cf-ipcountry',
      'cf-threat-score',
      'cf-visitor',
      'cf-request-id',
      'cf-challenge',
    ]

    headerNames.forEach((name) => {
      const value = request.headers.get(name)
      if (value) {
        headers[name as keyof CloudflareHeaders] = value
      }
    })

    return headers
  }

  /**
   * Get client IP address
   */
  private static getClientIP(request: NextRequest, cfHeaders: CloudflareHeaders): string {
    // Prefer Cloudflare's connecting IP
    if (cfHeaders['cf-connecting-ip']) {
      return cfHeaders['cf-connecting-ip']
    }

    // Fallback to X-Forwarded-For
    const xForwardedFor = request.headers.get('x-forwarded-for')
    if (xForwardedFor) {
      return xForwardedFor.split(',')[0].trim()
    }

    // Fallback to request IP
    return request.ip || 'unknown'
  }

  /**
   * Create request fingerprint
   */
  private static createFingerprint(
    request: NextRequest,
    ip: string,
    cfHeaders: CloudflareHeaders
  ): RequestFingerprint {
    return {
      ip,
      userAgent: request.headers.get('user-agent') || 'unknown',
      country: cfHeaders['cf-ipcountry'],
      path: request.nextUrl.pathname,
      method: request.method,
      timestamp: Date.now(),
    }
  }

  /**
   * Check API rate limiting
   */
  static checkApiRateLimit(apiKey: string): DDoSProtectionResult {
    tracker.trackApiUsage(apiKey)

    // Check hourly limit
    const hourlyUsage = tracker.getApiUsage(apiKey, 60 * 60 * 1000)
    if (hourlyUsage > DDOS_CONFIG.apiProtection.maxRequestsPerKey) {
      return {
        allowed: false,
        reason: 'API rate limit exceeded',
        score: 90,
      }
    }

    // Check burst limit
    const burstUsage = tracker.getApiUsage(apiKey, 60 * 1000)
    if (burstUsage > DDOS_CONFIG.apiProtection.maxBurstPerKey) {
      return {
        allowed: false,
        reason: 'API burst limit exceeded',
        score: 80,
      }
    }

    return { allowed: true, score: 0 }
  }

  /**
   * Generate challenge response
   */
  static generateChallengeResponse(
    action: 'challenge' | 'captcha',
    metadata?: Record<string, unknown>
  ): NextResponse {
    const html =
      action === 'challenge' ? this.getJavascriptChallengeHTML() : this.getCaptchaChallengeHTML()

    return new NextResponse(html, {
      status: 429,
      headers: {
        'Content-Type': 'text/html',
        'X-Challenge-Type': action,
        'Retry-After': '60',
      },
    })
  }

  /**
   * JavaScript challenge HTML
   */
  private static getJavascriptChallengeHTML(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Security Check - CoreFlow360</title>
  <meta charset="utf-8">
  <style>
    body { font-family: sans-serif; text-align: center; padding: 50px; }
    .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; 
               border-radius: 50%; width: 40px; height: 40px; 
               animation: spin 2s linear infinite; margin: 20px auto; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <h1>Security Check</h1>
  <p>Please wait while we verify your browser...</p>
  <div class="spinner"></div>
  <script>
    // Simple proof-of-work challenge
    function solveChallenge() {
      const challenge = Math.random().toString(36).substring(7);
      let nonce = 0;
      const target = '0000';
      
      while (true) {
        const hash = btoa(challenge + nonce).substring(0, 4);
        if (hash === target) {
          // Submit solution
          fetch(window.location.href, {
            method: 'POST',
            headers: { 'X-Challenge-Solution': nonce.toString() },
            body: JSON.stringify({ challenge, nonce })
          }).then(() => window.location.reload());
          break;
        }
        nonce++;
      }
    }
    
    setTimeout(solveChallenge, 1000);
  </script>
</body>
</html>
    `
  }

  /**
   * CAPTCHA challenge HTML
   */
  private static getCaptchaChallengeHTML(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Security Check - CoreFlow360</title>
  <meta charset="utf-8">
  <style>
    body { font-family: sans-serif; text-align: center; padding: 50px; }
    .captcha-container { margin: 20px auto; max-width: 400px; }
  </style>
</head>
<body>
  <h1>Security Verification Required</h1>
  <p>Please complete the CAPTCHA to continue</p>
  <div class="captcha-container">
    <!-- In production, integrate with reCAPTCHA or hCaptcha -->
    <p style="color: red;">CAPTCHA integration required</p>
    <p>Contact support if you believe this is an error.</p>
  </div>
</body>
</html>
    `
  }
}

/**
 * DDoS Protection Middleware
 */
export async function ddosProtectionMiddleware(request: NextRequest): Promise<NextResponse | null> {
  // Skip protection for static assets
  if (
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.startsWith('/favicon')
  ) {
    return null
  }

  const result = await DDoSProtection.analyzeRequest(request)

  if (!result.allowed) {
    if (result.action === 'block') {
      return new NextResponse('Access Denied', { status: 403 })
    }

    if (result.action === 'challenge' || result.action === 'captcha') {
      return DDoSProtection.generateChallengeResponse(result.action, result.metadata)
    }
  }

  // Add protection headers to response
  const response = NextResponse.next()
  response.headers.set('X-DDoS-Protection', 'active')
  response.headers.set('X-Request-Score', result.score?.toString() || '0')

  return null
}
