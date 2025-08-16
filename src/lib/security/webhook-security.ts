/**
 * CoreFlow360 - Webhook Security Module
 * 
 * Comprehensive webhook security with timestamp validation, replay attack prevention,
 * and cryptographic signature verification for multiple providers
 */

import crypto from 'crypto'
import { credentialManager } from '@/lib/security/credential-manager'

export interface WebhookSecurityConfig {
  provider: 'stripe' | 'twilio' | 'vapi' | 'generic'
  secret?: string
  timestampTolerance: number // seconds
  enableReplayProtection: boolean
  enableRateLimit: boolean
  maxRequestsPerMinute: number
}

export interface WebhookSecurityResult {
  isValid: boolean
  error?: string
  metadata: {
    provider: string
    timestamp?: Date
    replayProtected: boolean
    signatureValid: boolean
    rateLimited: boolean
  }
}

export interface WebhookPayload {
  body: string
  headers: Record<string, string>
  method: string
  url: string
}

// Replay attack prevention cache
const replayCache = new Map<string, { timestamp: number; used: boolean }>()
const rateLimitCache = new Map<string, { count: number; resetTime: number }>()

export class WebhookSecurityValidator {
  private config: WebhookSecurityConfig
  private CACHE_CLEANUP_INTERVAL = 5 * 60 * 1000 // 5 minutes
  
  constructor(config: WebhookSecurityConfig) {
    this.config = config
    this.startCacheCleanup()
  }

  /**
   * Main webhook validation method
   */
  async validateWebhook(payload: WebhookPayload): Promise<WebhookSecurityResult> {
    const result: WebhookSecurityResult = {
      isValid: false,
      metadata: {
        provider: this.config.provider,
        replayProtected: false,
        signatureValid: false,
        rateLimited: false
      }
    }

    try {
      // 1. Rate limiting check
      if (this.config.enableRateLimit) {
        const rateLimitResult = this.checkRateLimit(payload)
        result.metadata.rateLimited = rateLimitResult.limited
        
        if (rateLimitResult.limited) {
          result.error = `Rate limit exceeded: ${rateLimitResult.message}`
          return result
        }
      }

      // 2. Timestamp validation (prevent replay attacks)
      if (this.config.enableReplayProtection) {
        const timestampResult = this.validateTimestamp(payload)
        result.metadata.timestamp = timestampResult.timestamp
        result.metadata.replayProtected = timestampResult.valid
        
        if (!timestampResult.valid) {
          result.error = timestampResult.error
          return result
        }
      }

      // 3. Signature verification
      const signatureResult = await this.verifySignature(payload)
      result.metadata.signatureValid = signatureResult.valid
      
      if (!signatureResult.valid) {
        result.error = signatureResult.error
        return result
      }

      // 4. Additional provider-specific validations
      const providerResult = this.validateProviderSpecific(payload)
      if (!providerResult.valid) {
        result.error = providerResult.error
        return result
      }

      result.isValid = true
      return result

    } catch (error) {
      result.error = `Webhook validation failed: ${error.message}`
      return result
    }
  }

  /**
   * Timestamp validation with replay attack prevention
   */
  private validateTimestamp(payload: WebhookPayload): {
    valid: boolean
    timestamp?: Date
    error?: string
  } {
    let timestamp: Date
    let timestampStr: string

    // Extract timestamp based on provider
    switch (this.config.provider) {
      case 'stripe':
        timestampStr = payload.headers['stripe-signature']
          ?.split(',')
          .find(pair => pair.startsWith('t='))
          ?.substring(2) || ''
        break
        
      case 'twilio':
        // Twilio doesn't provide timestamp in signature, use current time with tolerance
        timestampStr = Math.floor(Date.now() / 1000).toString()
        break
        
      case 'vapi':
        timestampStr = payload.headers['x-vapi-timestamp'] || 
                      payload.headers['x-timestamp'] || ''
        break
        
      case 'generic':
        timestampStr = payload.headers['x-timestamp'] || 
                      payload.headers['timestamp'] || ''
        break
        
      default:
        return { valid: false, error: 'Unknown provider for timestamp validation' }
    }

    if (!timestampStr) {
      return { valid: false, error: 'Missing timestamp in webhook' }
    }

    // Parse timestamp
    const timestampSeconds = parseInt(timestampStr)
    if (isNaN(timestampSeconds)) {
      return { valid: false, error: 'Invalid timestamp format' }
    }

    timestamp = new Date(timestampSeconds * 1000)
    const now = new Date()
    const timeDiff = Math.abs(now.getTime() - timestamp.getTime()) / 1000

    // Check timestamp tolerance
    if (timeDiff > this.config.timestampTolerance) {
      return {
        valid: false,
        error: `Timestamp outside tolerance: ${timeDiff}s > ${this.config.timestampTolerance}s`
      }
    }

    // Replay attack prevention
    if (this.config.enableReplayProtection) {
      const replayKey = this.generateReplayKey(payload, timestampStr)
      const cached = replayCache.get(replayKey)
      
      if (cached && cached.used) {
        return { valid: false, error: 'Potential replay attack detected' }
      }
      
      // Mark as used
      replayCache.set(replayKey, {
        timestamp: timestampSeconds,
        used: true
      })
    }

    return { valid: true, timestamp }
  }

  /**
   * Cryptographic signature verification
   */
  private async verifySignature(payload: WebhookPayload): Promise<{
    valid: boolean
    error?: string
  }> {
    try {
      let secret = this.config.secret

      // Get secret from secure credential manager if not provided
      if (!secret) {
        secret = await this.getProviderSecret()
      }

      if (!secret) {
        return { valid: false, error: 'No webhook secret configured' }
      }

      switch (this.config.provider) {
        case 'stripe':
          return this.verifyStripeSignature(payload, secret)
          
        case 'twilio':
          return this.verifyTwilioSignature(payload, secret)
          
        case 'vapi':
          return this.verifyVapiSignature(payload, secret)
          
        case 'generic':
          return this.verifyGenericSignature(payload, secret)
          
        default:
          return { valid: false, error: 'Unknown provider for signature verification' }
      }
    } catch (error) {
      return { valid: false, error: `Signature verification error: ${error.message}` }
    }
  }

  /**
   * Stripe signature verification (HMAC SHA256)
   */
  private verifyStripeSignature(payload: WebhookPayload, secret: string): {
    valid: boolean
    error?: string
  } {
    const signature = payload.headers['stripe-signature']
    if (!signature) {
      return { valid: false, error: 'Missing Stripe signature' }
    }

    try {
      // Parse signature components
      const elements = signature.split(',')
      const signatureHash = elements.find(el => el.startsWith('v1='))?.substring(3)
      const timestamp = elements.find(el => el.startsWith('t='))?.substring(2)

      if (!signatureHash || !timestamp) {
        return { valid: false, error: 'Invalid Stripe signature format' }
      }

      // Compute expected signature
      const signedPayload = timestamp + '.' + payload.body
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(signedPayload, 'utf8')
        .digest('hex')

      // Secure comparison
      const isValid = crypto.timingSafeEqual(
        Buffer.from(signatureHash, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      )

      return { valid: isValid, error: isValid ? undefined : 'Invalid Stripe signature' }
    } catch (error) {
      return { valid: false, error: `Stripe signature verification failed: ${error.message}` }
    }
  }

  /**
   * Twilio signature verification (SHA1)
   */
  private verifyTwilioSignature(payload: WebhookPayload, secret: string): {
    valid: boolean
    error?: string
  } {
    const signature = payload.headers['x-twilio-signature']
    if (!signature) {
      return { valid: false, error: 'Missing Twilio signature' }
    }

    try {
      // For Twilio, we need to reconstruct the URL and sorted params
      const url = payload.url
      const sortedParams = this.getSortedParams(payload.body)
      const data = url + sortedParams

      const expectedSignature = crypto
        .createHmac('sha1', secret)
        .update(Buffer.from(data, 'utf-8'))
        .digest('base64')

      const isValid = crypto.timingSafeEqual(
        Buffer.from(signature, 'base64'),
        Buffer.from(expectedSignature, 'base64')
      )

      return { valid: isValid, error: isValid ? undefined : 'Invalid Twilio signature' }
    } catch (error) {
      return { valid: false, error: `Twilio signature verification failed: ${error.message}` }
    }
  }

  /**
   * Vapi signature verification (HMAC SHA256)
   */
  private verifyVapiSignature(payload: WebhookPayload, secret: string): {
    valid: boolean
    error?: string
  } {
    const signature = payload.headers['x-vapi-signature']
    if (!signature) {
      return { valid: false, error: 'Missing Vapi signature' }
    }

    try {
      // Vapi uses HMAC SHA256 with hex encoding
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload.body, 'utf8')
        .digest('hex')

      // Remove 'sha256=' prefix if present
      const cleanSignature = signature.replace(/^sha256=/, '')

      const isValid = crypto.timingSafeEqual(
        Buffer.from(cleanSignature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      )

      return { valid: isValid, error: isValid ? undefined : 'Invalid Vapi signature' }
    } catch (error) {
      return { valid: false, error: `Vapi signature verification failed: ${error.message}` }
    }
  }

  /**
   * Generic HMAC SHA256 signature verification
   */
  private verifyGenericSignature(payload: WebhookPayload, secret: string): {
    valid: boolean
    error?: string
  } {
    const signature = payload.headers['x-signature'] || 
                     payload.headers['x-hub-signature-256'] ||
                     payload.headers['signature']
    
    if (!signature) {
      return { valid: false, error: 'Missing signature header' }
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload.body, 'utf8')
        .digest('hex')

      // Handle different signature formats
      const cleanSignature = signature.replace(/^(sha256=|sha256:)/, '')

      const isValid = crypto.timingSafeEqual(
        Buffer.from(cleanSignature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      )

      return { valid: isValid, error: isValid ? undefined : 'Invalid signature' }
    } catch (error) {
      return { valid: false, error: `Generic signature verification failed: ${error.message}` }
    }
  }

  /**
   * Rate limiting implementation
   */
  private checkRateLimit(payload: WebhookPayload): {
    limited: boolean
    message?: string
  } {
    const clientId = this.getClientIdentifier(payload)
    const now = Date.now()
    const windowStart = Math.floor(now / 60000) * 60000 // 1-minute windows
    
    const key = `${clientId}:${windowStart}`
    const current = rateLimitCache.get(key) || { count: 0, resetTime: windowStart + 60000 }
    
    if (current.count >= this.config.maxRequestsPerMinute) {
      return {
        limited: true,
        message: `Rate limit exceeded: ${current.count}/${this.config.maxRequestsPerMinute} requests per minute`
      }
    }
    
    current.count++
    rateLimitCache.set(key, current)
    
    return { limited: false }
  }

  /**
   * Provider-specific validation
   */
  private validateProviderSpecific(payload: WebhookPayload): {
    valid: boolean
    error?: string
  } {
    switch (this.config.provider) {
      case 'stripe':
        // Validate Stripe-specific headers
        if (!payload.headers['stripe-signature']) {
          return { valid: false, error: 'Missing Stripe signature header' }
        }
        break
        
      case 'twilio':
        // Validate Twilio-specific headers and content
        if (!payload.headers['x-twilio-signature']) {
          return { valid: false, error: 'Missing Twilio signature header' }
        }
        if (payload.headers['content-type'] !== 'application/x-www-form-urlencoded') {
          return { valid: false, error: 'Invalid Twilio content type' }
        }
        break
        
      case 'vapi':
        // Validate Vapi-specific headers
        if (!payload.headers['x-vapi-signature']) {
          return { valid: false, error: 'Missing Vapi signature header' }
        }
        break
    }
    
    return { valid: true }
  }

  /**
   * Helper methods
   */
  private async getProviderSecret(): Promise<string | null> {
    try {
      switch (this.config.provider) {
        case 'stripe':
          return await credentialManager.getCredential('stripe_webhook_secret')
        case 'twilio':
          return await credentialManager.getCredential('twilio_webhook_secret')
        case 'vapi':
          return await credentialManager.getCredential('vapi_webhook_secret')
        default:
          return null
      }
    } catch (error) {
      console.error('Failed to get webhook secret from credential manager:', error)
      return null
    }
  }

  private generateReplayKey(payload: WebhookPayload, timestamp: string): string {
    const content = `${payload.method}:${payload.url}:${timestamp}:${payload.body}`
    return crypto.createHash('sha256').update(content).digest('hex')
  }

  private getClientIdentifier(payload: WebhookPayload): string {
    // Use IP address, user agent, or provider-specific identifier
    return payload.headers['x-forwarded-for'] || 
           payload.headers['x-real-ip'] || 
           payload.headers['remote-addr'] ||
           payload.headers['user-agent'] ||
           'unknown'
  }

  private getSortedParams(body: string): string {
    try {
      // Parse URL-encoded form data and sort parameters
      const params = new URLSearchParams(body)
      const sorted = Array.from(params.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}${value}`)
        .join('')
      return sorted
    } catch (error) {
      return body
    }
  }

  private startCacheCleanup(): void {
    setInterval(() => {
      this.cleanupCaches()
    }, this.CACHE_CLEANUP_INTERVAL)
  }

  private cleanupCaches(): void {
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours

    // Clean replay cache
    for (const [key, value] of replayCache.entries()) {
      if (now - (value.timestamp * 1000) > maxAge) {
        replayCache.delete(key)
      }
    }

    // Clean rate limit cache
    for (const [key, value] of rateLimitCache.entries()) {
      if (now > value.resetTime + maxAge) {
        rateLimitCache.delete(key)
      }
    }
  }
}

/**
 * Factory function for creating webhook validators
 */
export function createWebhookValidator(config: WebhookSecurityConfig): WebhookSecurityValidator {
  return new WebhookSecurityValidator(config)
}

/**
 * Predefined configurations for common providers
 */
export const WEBHOOK_CONFIGS = {
  stripe: {
    provider: 'stripe' as const,
    timestampTolerance: 300, // 5 minutes
    enableReplayProtection: true,
    enableRateLimit: true,
    maxRequestsPerMinute: 100
  },
  
  twilio: {
    provider: 'twilio' as const,
    timestampTolerance: 600, // 10 minutes (Twilio doesn't provide exact timestamp)
    enableReplayProtection: true,
    enableRateLimit: true,
    maxRequestsPerMinute: 200
  },
  
  vapi: {
    provider: 'vapi' as const,
    timestampTolerance: 300, // 5 minutes
    enableReplayProtection: true,
    enableRateLimit: true,
    maxRequestsPerMinute: 500
  },
  
  generic: {
    provider: 'generic' as const,
    timestampTolerance: 300, // 5 minutes
    enableReplayProtection: true,
    enableRateLimit: true,
    maxRequestsPerMinute: 100
  }
} as const