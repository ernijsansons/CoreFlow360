/**
 * CoreFlow360 - HMAC-SHA256 Request Signing System
 * 
 * Zero-trust request authentication with cryptographic integrity validation
 * Prevents replay attacks, tampering, and ensures request authenticity
 */

import crypto from 'crypto';
import { NextRequest } from 'next/server';

export interface SigningConfig {
  secretKey: string;
  algorithm: 'sha256' | 'sha512';
  timestampTolerance: number; // seconds
  includeBody: boolean;
  headerName: string;
  timestampHeader: string;
}

export interface SignedRequest {
  signature: string;
  timestamp: number;
  nonce: string;
  body?: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  metadata?: {
    computedSignature: string;
    providedSignature: string;
    timestampDiff: number;
    endpoint: string;
  };
}

export class RequestSigner {
  private config: SigningConfig;
  private nonceCache: Set<string> = new Set();
  private cleanupInterval: NodeJS.Timeout;

  constructor(config: Partial<SigningConfig> = {}) {
    // During build time, use a placeholder configuration
    const isBuildTime = process.env.VERCEL_ENV || process.env.CI || process.env.NEXT_PHASE === 'phase-production-build';
    
    this.config = {
      secretKey: process.env.API_SIGNING_SECRET || (isBuildTime ? 'build-time-placeholder-secret' : ''),
      algorithm: 'sha256',
      timestampTolerance: 300, // 5 minutes
      includeBody: true,
      headerName: 'x-coreflow-signature',
      timestampHeader: 'x-coreflow-timestamp',
      ...config
    };

    if (!this.config.secretKey && !isBuildTime) {
      throw new Error('API signing secret key is required');
    }

    // Skip interval setup during build time
    if (!isBuildTime && typeof setInterval !== 'undefined') {
      // Clean up old nonces every hour
      this.cleanupInterval = setInterval(() => {
        this.nonceCache.clear();
      }, 3600000);
    }
  }

  /**
   * Sign an outgoing request with HMAC-SHA256
   */
  signRequest(
    method: string,
    url: string,
    body?: string,
    additionalHeaders: Record<string, string> = {}
  ): { headers: Record<string, string>; signature: string } {
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = crypto.randomBytes(16).toString('hex');
    
    const payload = this.buildPayload({
      method: method.toUpperCase(),
      url,
      timestamp,
      nonce,
      body: this.config.includeBody ? body : undefined,
      headers: additionalHeaders
    });

    const signature = this.computeSignature(payload);

    return {
      headers: {
        [this.config.headerName]: signature,
        [this.config.timestampHeader]: timestamp.toString(),
        'x-coreflow-nonce': nonce,
        ...additionalHeaders
      },
      signature
    };
  }

  /**
   * Validate an incoming signed request
   */
  async validateRequest(
    req: NextRequest,
    body?: string
  ): Promise<ValidationResult> {
    try {
      const signature = req.headers.get(this.config.headerName);
      const timestampHeader = req.headers.get(this.config.timestampHeader);
      const nonce = req.headers.get('x-coreflow-nonce');

      if (!signature || !timestampHeader || !nonce) {
        return {
          valid: false,
          error: 'Missing required signature headers'
        };
      }

      const timestamp = parseInt(timestampHeader);
      const currentTime = Math.floor(Date.now() / 1000);
      const timestampDiff = Math.abs(currentTime - timestamp);

      // Check timestamp tolerance
      if (timestampDiff > this.config.timestampTolerance) {
        return {
          valid: false,
          error: `Request timestamp outside tolerance window (${timestampDiff}s)`,
          metadata: {
            computedSignature: '',
            providedSignature: signature,
            timestampDiff,
            endpoint: req.url
          }
        };
      }

      // Check for nonce replay attack
      if (this.nonceCache.has(nonce)) {
        return {
          valid: false,
          error: 'Nonce has already been used (replay attack detected)'
        };
      }

      // Build payload for validation
      const url = new URL(req.url);
      const payload = this.buildPayload({
        method: req.method.toUpperCase(),
        url: `${url.pathname}${url.search}`,
        timestamp,
        nonce,
        body: this.config.includeBody ? body : undefined,
        headers: this.extractRelevantHeaders(req)
      });

      const computedSignature = this.computeSignature(payload);

      // Constant-time comparison to prevent timing attacks
      const isValid = this.constantTimeCompare(signature, computedSignature);

      if (isValid) {
        // Store nonce to prevent replay
        this.nonceCache.add(nonce);
        
        return {
          valid: true,
          metadata: {
            computedSignature,
            providedSignature: signature,
            timestampDiff,
            endpoint: req.url
          }
        };
      }

      return {
        valid: false,
        error: 'Invalid signature',
        metadata: {
          computedSignature,
          providedSignature: signature,
          timestampDiff,
          endpoint: req.url
        }
      };

    } catch (error) {
      return {
        valid: false,
        error: `Validation error: ${error.message}`
      };
    }
  }

  /**
   * Build the canonical payload for signing
   */
  private buildPayload(params: {
    method: string;
    url: string;
    timestamp: number;
    nonce: string;
    body?: string;
    headers?: Record<string, string>;
  }): string {
    const components = [
      params.method,
      params.url,
      params.timestamp.toString(),
      params.nonce
    ];

    // Include body if configured
    if (this.config.includeBody && params.body) {
      components.push(crypto.createHash('sha256').update(params.body).digest('hex'));
    }

    // Include relevant headers in canonical form
    if (params.headers) {
      const sortedHeaders = Object.keys(params.headers)
        .filter(key => key.toLowerCase().startsWith('x-coreflow-') || 
                      key.toLowerCase() === 'content-type')
        .sort()
        .map(key => `${key.toLowerCase()}:${params.headers![key]}`)
        .join('\n');
      
      if (sortedHeaders) {
        components.push(sortedHeaders);
      }
    }

    return components.join('\n');
  }

  /**
   * Compute HMAC signature
   */
  private computeSignature(payload: string): string {
    const hmac = crypto.createHmac(this.config.algorithm, this.config.secretKey);
    hmac.update(payload);
    return hmac.digest('hex');
  }

  /**
   * Extract relevant headers from request
   */
  private extractRelevantHeaders(req: NextRequest): Record<string, string> {
    const headers: Record<string, string> = {};
    
    req.headers.forEach((value, key) => {
      if (key.toLowerCase().startsWith('x-coreflow-') || 
          key.toLowerCase() === 'content-type') {
        headers[key] = value;
      }
    });

    return headers;
  }

  /**
   * Constant-time string comparison to prevent timing attacks
   */
  private constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.nonceCache.clear();
  }

  /**
   * Get signing statistics
   */
  getStats(): {
    nonceCacheSize: number;
    config: Omit<SigningConfig, 'secretKey'>;
  } {
    return {
      nonceCacheSize: this.nonceCache.size,
      config: {
        algorithm: this.config.algorithm,
        timestampTolerance: this.config.timestampTolerance,
        includeBody: this.config.includeBody,
        headerName: this.config.headerName,
        timestampHeader: this.config.timestampHeader,
        secretKey: '[REDACTED]'
      }
    };
  }
}

// Global instance for API endpoints
export const requestSigner = new RequestSigner();

/**
 * Middleware factory for protecting API routes
 */
export function withRequestSigning(options: Partial<SigningConfig> = {}) {
  const signer = new RequestSigner(options);

  return async function signatureMiddleware(
    req: NextRequest,
    handler: (req: NextRequest) => Promise<Response>
  ): Promise<Response> {
    try {
      // Skip signing for non-critical endpoints in development
      if (process.env.NODE_ENV === 'development' && 
          process.env.SKIP_REQUEST_SIGNING === 'true') {
        return handler(req);
      }

      // Get request body for validation
      const body = req.method !== 'GET' && req.method !== 'HEAD' 
        ? await req.text() 
        : undefined;

      // Create new request with body for handler
      const newReq = body 
        ? new NextRequest(req.url, {
            method: req.method,
            headers: req.headers,
            body: body
          })
        : req;

      const validation = await signer.validateRequest(req, body);

      if (!validation.valid) {
        console.warn('Request signature validation failed:', {
          error: validation.error,
          endpoint: req.url,
          method: req.method,
          metadata: validation.metadata
        });

        return new Response(JSON.stringify({
          error: 'Invalid request signature',
          code: 'SIGNATURE_INVALID'
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      console.log('Request signature validated successfully:', {
        endpoint: req.url,
        timestampDiff: validation.metadata?.timestampDiff
      });

      return handler(newReq);

    } catch (error) {
      console.error('Request signing middleware error:', error);
      
      return new Response(JSON.stringify({
        error: 'Authentication system error',
        code: 'AUTH_SYSTEM_ERROR'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  };
}

/**
 * Utility for making signed HTTP requests
 */
export class SignedHttpClient {
  private signer: RequestSigner;

  constructor(config?: Partial<SigningConfig>) {
    this.signer = new RequestSigner(config);
  }

  async fetch(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const method = options.method || 'GET';
    const body = options.body ? String(options.body) : undefined;
    
    const { headers: signedHeaders } = this.signer.signRequest(
      method,
      url,
      body,
      options.headers as Record<string, string> || {}
    );

    return fetch(url, {
      ...options,
      headers: signedHeaders
    });
  }
}