/**
 * CoreFlow360 - Advanced Security Headers & Content Security Policy
 * Enterprise-grade security hardening with comprehensive CSP and security headers
 */

import { NextRequest, NextResponse } from 'next/server'

// CSP directives configuration
interface CSPDirectives {
  'default-src'?: string[]
  'script-src'?: string[]
  'style-src'?: string[]
  'img-src'?: string[]
  'font-src'?: string[]
  'connect-src'?: string[]
  'frame-src'?: string[]
  'frame-ancestors'?: string[]
  'object-src'?: string[]
  'base-uri'?: string[]
  'form-action'?: string[]
  'worker-src'?: string[]
  'manifest-src'?: string[]
  'media-src'?: string[]
  'upgrade-insecure-requests'?: boolean
  'block-all-mixed-content'?: boolean
}

// Security headers configuration
interface SecurityHeadersConfig {
  csp: CSPDirectives
  hsts: {
    maxAge: number
    includeSubDomains: boolean
    preload: boolean
  }
  frameOptions: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM'
  contentTypeOptions: boolean
  xssProtection: {
    enabled: boolean
    mode: 'block' | 'report'
    reportUri?: string
  }
  referrerPolicy: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url'
  permissions: {
    camera: 'none' | 'self' | '*'
    microphone: 'none' | 'self' | '*'
    geolocation: 'none' | 'self' | '*'
    notifications: 'none' | 'self' | '*'
    payment: 'none' | 'self' | '*'
  }
}

// Environment-specific security configurations
const SECURITY_CONFIGS: Record<string, SecurityHeadersConfig> = {
  PRODUCTION: {
    csp: {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'unsafe-eval'", // Required for Next.js
        "'unsafe-inline'", // Required for styled-components and inline scripts
        'https://js.stripe.com',
        'https://checkout.stripe.com',
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com',
        'https://vercel.live',
        'https://vercel.com',
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'", // Required for styled-components
        'https://fonts.googleapis.com',
      ],
      'img-src': [
        "'self'",
        'data:',
        'blob:',
        'https://images.unsplash.com',
        'https://avatars.githubusercontent.com',
        'https://lh3.googleusercontent.com',
        'https://www.google-analytics.com',
        'https://vercel.com',
      ],
      'font-src': [
        "'self'",
        'https://fonts.gstatic.com',
        'https://fonts.googleapis.com',
      ],
      'connect-src': [
        "'self'",
        'https://api.stripe.com',
        'https://checkout.stripe.com',
        'https://www.google-analytics.com',
        'https://analytics.google.com',
        'https://vitals.vercel-insights.com',
        'wss://ws.pusher.com',
        process.env.NEXT_PUBLIC_APP_URL || 'https://coreflow360.com',
      ],
      'frame-src': [
        'https://js.stripe.com',
        'https://checkout.stripe.com',
        'https://www.youtube.com',
        'https://player.vimeo.com',
      ],
      'frame-ancestors': ["'none'"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'", 'https://checkout.stripe.com'],
      'worker-src': ["'self'", 'blob:'],
      'manifest-src': ["'self'"],
      'media-src': ["'self'", 'https://'],
      'upgrade-insecure-requests': true,
      'block-all-mixed-content': true,
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    frameOptions: 'DENY',
    contentTypeOptions: true,
    xssProtection: {
      enabled: true,
      mode: 'block',
    },
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissions: {
      camera: 'none',
      microphone: 'none',
      geolocation: 'self',
      notifications: 'self',
      payment: 'self',
    },
  },
  STAGING: {
    csp: {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'unsafe-eval'",
        "'unsafe-inline'",
        'https://js.stripe.com',
        'https://checkout.stripe.com',
        'https://www.googletagmanager.com',
        'https://vercel.live',
        'https://vercel.com',
      ],
      'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      'img-src': [
        "'self'",
        'data:',
        'blob:',
        'https://images.unsplash.com',
        'https://avatars.githubusercontent.com',
        'https://lh3.googleusercontent.com',
      ],
      'font-src': ["'self'", 'https://fonts.gstatic.com'],
      'connect-src': [
        "'self'",
        'https://api.stripe.com',
        'https://vitals.vercel-insights.com',
        'wss://ws.pusher.com',
        process.env.NEXT_PUBLIC_APP_URL || 'https://coreflow360-staging.vercel.app',
      ],
      'frame-src': ['https://js.stripe.com', 'https://checkout.stripe.com'],
      'frame-ancestors': ["'none'"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'worker-src': ["'self'", 'blob:'],
      'upgrade-insecure-requests': true,
    },
    hsts: {
      maxAge: 86400, // 24 hours
      includeSubDomains: true,
      preload: false,
    },
    frameOptions: 'DENY',
    contentTypeOptions: true,
    xssProtection: {
      enabled: true,
      mode: 'block',
    },
    referrerPolicy: 'origin-when-cross-origin',
    permissions: {
      camera: 'none',
      microphone: 'none',
      geolocation: 'self',
      notifications: 'self',
      payment: 'self',
    },
  },
  DEVELOPMENT: {
    csp: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'blob:', 'https:'],
      'font-src': ["'self'", 'https://fonts.gstatic.com'],
      'connect-src': ["'self'", 'ws:', 'wss:', 'http:', 'https:'],
      'frame-src': ["'self'"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
    },
    hsts: {
      maxAge: 0,
      includeSubDomains: false,
      preload: false,
    },
    frameOptions: 'SAMEORIGIN',
    contentTypeOptions: true,
    xssProtection: {
      enabled: true,
      mode: 'block',
    },
    referrerPolicy: 'origin-when-cross-origin',
    permissions: {
      camera: 'self',
      microphone: 'self',
      geolocation: 'self',
      notifications: 'self',
      payment: 'self',
    },
  },
}

export class AdvancedSecurityHeaders {
  private static instance: AdvancedSecurityHeaders
  private config: SecurityHeadersConfig

  constructor(environment: string = 'PRODUCTION') {
    this.config = SECURITY_CONFIGS[environment.toUpperCase()] || SECURITY_CONFIGS.PRODUCTION
  }

  static getInstance(environment?: string): AdvancedSecurityHeaders {
    if (!AdvancedSecurityHeaders.instance) {
      AdvancedSecurityHeaders.instance = new AdvancedSecurityHeaders(environment)
    }
    return AdvancedSecurityHeaders.instance
  }

  /**
   * Apply security headers to NextResponse
   */
  applyHeaders(response: NextResponse): NextResponse {
    // Content Security Policy
    const cspValue = this.buildCSP()
    response.headers.set('Content-Security-Policy', cspValue)

    // HTTP Strict Transport Security
    if (this.config.hsts.maxAge > 0) {
      const hstsValue = this.buildHSTS()
      response.headers.set('Strict-Transport-Security', hstsValue)
    }

    // X-Frame-Options
    response.headers.set('X-Frame-Options', this.config.frameOptions)

    // X-Content-Type-Options
    if (this.config.contentTypeOptions) {
      response.headers.set('X-Content-Type-Options', 'nosniff')
    }

    // X-XSS-Protection
    if (this.config.xssProtection.enabled) {
      const xssValue = `1; mode=${this.config.xssProtection.mode}`
      response.headers.set('X-XSS-Protection', xssValue)
    }

    // Referrer Policy
    response.headers.set('Referrer-Policy', this.config.referrerPolicy)

    // Permissions Policy (Feature Policy)
    const permissionsValue = this.buildPermissionsPolicy()
    response.headers.set('Permissions-Policy', permissionsValue)

    // Additional security headers
    response.headers.set('X-DNS-Prefetch-Control', 'off')
    response.headers.set('X-Download-Options', 'noopen')
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
    response.headers.set('Cross-Origin-Resource-Policy', 'same-origin')
    response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp')

    // Server identification removal
    response.headers.delete('Server')
    response.headers.delete('X-Powered-By')

    return response
  }

  /**
   * Build Content Security Policy string
   */
  private buildCSP(): string {
    const directives: string[] = []

    for (const [directive, values] of Object.entries(this.config.csp)) {
      if (typeof values === 'boolean') {
        if (values) {
          directives.push(directive.replace(/([A-Z])/g, '-$1').toLowerCase())
        }
      } else if (Array.isArray(values)) {
        const directiveName = directive.replace(/([A-Z])/g, '-$1').toLowerCase()
        directives.push(`${directiveName} ${values.join(' ')}`)
      }
    }

    return directives.join('; ')
  }

  /**
   * Build HSTS header string
   */
  private buildHSTS(): string {
    let hsts = `max-age=${this.config.hsts.maxAge}`
    
    if (this.config.hsts.includeSubDomains) {
      hsts += '; includeSubDomains'
    }
    
    if (this.config.hsts.preload) {
      hsts += '; preload'
    }
    
    return hsts
  }

  /**
   * Build Permissions Policy string
   */
  private buildPermissionsPolicy(): string {
    const policies: string[] = []

    for (const [feature, value] of Object.entries(this.config.permissions)) {
      const policy = value === 'none' ? `${feature}=()` :
                    value === 'self' ? `${feature}=(self)` :
                    `${feature}=*`
      policies.push(policy)
    }

    return policies.join(', ')
  }

  /**
   * Check if CSP violation should be reported
   */
  shouldReportCSPViolation(violation: any): boolean {
    // Filter out common false positives
    const falsePositives = [
      'about:blank',
      'chrome-extension:',
      'moz-extension:',
      'safari-extension:',
      'data:text/html,chromewebdata',
    ]

    const blockedUri = violation['blocked-uri'] || violation.blockedURI || ''
    return !falsePositives.some(fp => blockedUri.startsWith(fp))
  }

  /**
   * Generate nonce for inline scripts (when needed)
   */
  generateNonce(): string {
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    return btoa(String.fromCharCode(...array))
  }

  /**
   * Create CSP with nonce for specific scripts
   */
  buildCSPWithNonce(nonce: string): string {
    const config = { ...this.config.csp }
    if (config['script-src']) {
      config['script-src'] = [...config['script-src'], `'nonce-${nonce}'`]
    }
    
    const tempConfig = { ...this.config, csp: config }
    const originalConfig = this.config
    this.config = tempConfig
    const csp = this.buildCSP()
    this.config = originalConfig
    
    return csp
  }

  /**
   * Update CSP for specific routes that need relaxed policies
   */
  getRelaxedCSPForAPI(): string {
    const relaxedConfig: CSPDirectives = {
      ...this.config.csp,
      'connect-src': [
        ...(this.config.csp['connect-src'] || []),
        'https://*.vercel.com',
        'https://*.vercel.app',
      ],
    }

    const tempConfig = { ...this.config, csp: relaxedConfig }
    const originalConfig = this.config
    this.config = tempConfig
    const csp = this.buildCSP()
    this.config = originalConfig
    
    return csp
  }

  /**
   * Get security headers for webhook endpoints
   */
  getWebhookSecurityHeaders(): Record<string, string> {
    return {
      'Content-Security-Policy': "default-src 'none'; script-src 'none'",
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'no-referrer',
      'Cross-Origin-Resource-Policy': 'same-origin',
    }
  }

  /**
   * Validate security configuration
   */
  validateConfiguration(): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check required CSP directives
    if (!this.config.csp['default-src']) {
      errors.push("CSP missing required 'default-src' directive")
    }

    if (!this.config.csp['script-src']) {
      errors.push("CSP missing required 'script-src' directive")
    }

    // Check HSTS configuration
    if (this.config.hsts.maxAge < 0) {
      errors.push('HSTS max-age cannot be negative')
    }

    // Check for potentially dangerous CSP values
    if (this.config.csp['script-src']?.includes("'unsafe-eval'") && process.env.NODE_ENV === 'production') {
      errors.push("Production CSP should avoid 'unsafe-eval' if possible")
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }
}

// Singleton instance
export const advancedSecurityHeaders = AdvancedSecurityHeaders.getInstance(process.env.NODE_ENV)

// Middleware helper function
export function applySecurityHeaders(request: NextRequest): NextResponse {
  const response = NextResponse.next()
  
  // Get environment-specific security headers
  const environment = process.env.NODE_ENV || 'development'
  const securityHeaders = AdvancedSecurityHeaders.getInstance(environment.toUpperCase())
  
  // Apply headers based on route type
  const { pathname } = request.nextUrl
  
  if (pathname.startsWith('/api/webhooks/')) {
    // Apply strict headers for webhook endpoints
    const webhookHeaders = securityHeaders.getWebhookSecurityHeaders()
    for (const [key, value] of Object.entries(webhookHeaders)) {
      response.headers.set(key, value)
    }
  } else if (pathname.startsWith('/api/')) {
    // Apply relaxed CSP for API routes
    const apiCSP = securityHeaders.getRelaxedCSPForAPI()
    response.headers.set('Content-Security-Policy', apiCSP)
    
    // Apply other security headers
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  } else {
    // Apply full security headers for pages
    securityHeaders.applyHeaders(response)
  }

  return response
}

// CSP violation reporter (for production monitoring)
export async function reportCSPViolation(violation: any): Promise<void> {
  try {
    // Only report in production and if it's not a false positive
    if (process.env.NODE_ENV !== 'production') return
    
    const securityHeaders = AdvancedSecurityHeaders.getInstance('PRODUCTION')
    if (!securityHeaders.shouldReportCSPViolation(violation)) return

    // Log violation (could also send to external monitoring service)
    console.warn('CSP Violation detected:', {
      blockedURI: violation['blocked-uri'] || violation.blockedURI,
      violatedDirective: violation['violated-directive'] || violation.violatedDirective,
      originalPolicy: violation['original-policy'] || violation.originalPolicy,
      userAgent: violation['user-agent'],
      timestamp: new Date().toISOString(),
    })

    // Could send to Sentry, DataDog, or other monitoring service
    // await sendToMonitoringService('csp-violation', violation)
  } catch (error) {
    console.error('Failed to report CSP violation:', error)
  }
}

// Export configurations for testing
export { SECURITY_CONFIGS }