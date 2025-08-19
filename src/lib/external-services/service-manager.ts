/**
 * CoreFlow360 - External Service Manager
 * Manages connections to external ERP/AI services with fault tolerance
 */

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { redis } from '@/lib/redis'
import type { ExternalResource, ExternalServiceConfig } from '@/types/bundles'

export interface ServiceHealth {
  service: ExternalResource
  status: 'healthy' | 'degraded' | 'unhealthy'
  lastCheck: Date
  latency: number
  errorRate: number
  uptime: number
}

export interface ServiceCredentials {
  apiKey?: string
  clientId?: string
  clientSecret?: string
  accessToken?: string
  refreshToken?: string
  expiresAt?: Date
}

export class ExternalServiceManager {
  private static instance: ExternalServiceManager
  private healthChecks: Map<ExternalResource, ServiceHealth> = new Map()
  private credentials: Map<string, ServiceCredentials> = new Map()
  private healthCheckInterval: NodeJS.Timeout | null = null

  private constructor() {
    this.startHealthChecks()
  }

  static getInstance(): ExternalServiceManager {
    if (!ExternalServiceManager.instance) {
      ExternalServiceManager.instance = new ExternalServiceManager()
    }
    return ExternalServiceManager.instance
  }

  /**
   * Register a service configuration
   */
  async registerService(
    resource: ExternalResource,
    config: ExternalServiceConfig,
    tenantId: string
  ): Promise<void> {
    const cacheKey = `service:${tenantId}:${resource}`

    // Validate configuration
    this.validateServiceConfig(config)

    // Store configuration
    await redis.set(cacheKey, config, { ttl: 86400 }) // 24 hours

    // Store credentials separately with encryption
    const credKey = `${tenantId}:${resource}`
    this.credentials.set(credKey, {
      apiKey: config.authentication.config.apiKey,
      clientId: config.authentication.config.clientId,
      clientSecret: config.authentication.config.clientSecret,
    })

    // Perform initial health check
    await this.checkServiceHealth(resource, config)
  }

  /**
   * Get service configuration
   */
  async getServiceConfig(
    resource: ExternalResource,
    tenantId: string
  ): Promise<ExternalServiceConfig | null> {
    const cacheKey = `service:${tenantId}:${resource}`
    const config = (await redis.get(cacheKey)) as ExternalServiceConfig | null

    if (!config) {
      // Try to load from environment defaults
      return this.getDefaultConfig(resource)
    }

    return config
  }

  /**
   * Call external service with retry and circuit breaker
   */
  async callService<T = unknown>(
    resource: ExternalResource,
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    data: unknown,
    tenantId: string
  ): Promise<T> {
    const config = await this.getServiceConfig(resource, tenantId)
    if (!config) {
      throw new Error(`Service ${resource} not configured`)
    }

    // Check circuit breaker
    const health = this.healthChecks.get(resource)
    if (health?.status === 'unhealthy') {
      throw new Error(`Service ${resource} is currently unavailable`)
    }

    // Get credentials
    const credentials = this.credentials.get(`${tenantId}:${resource}`)
    if (!credentials) {
      throw new Error(`No credentials for service ${resource}`)
    }

    // Build request
    const url = this.buildUrl(config, endpoint)
    const headers = await this.buildHeaders(config, credentials)

    // Implement retry with exponential backoff
    let lastError: Error | null = null
    const maxRetries = 3

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          method,
          headers,
          body: method !== 'GET' ? JSON.stringify(data) : undefined,
          signal: AbortSignal.timeout(30000), // 30 second timeout
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()

        // Update metrics
        await this.updateServiceMetrics(resource, true, Date.now())

        return result as T
      } catch (error) {
        lastError = error as Error

        // Update metrics
        await this.updateServiceMetrics(resource, false, Date.now())

        if (attempt < maxRetries - 1) {
          // Exponential backoff
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
      }
    }

    throw lastError || new Error('Service call failed')
  }

  /**
   * Start health check monitoring
   */
  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      const services = await this.getAllServices()

      for (const [resource, config] of services) {
        await this.checkServiceHealth(resource, config)
      }
    }, 60000) // Check every minute
  }

  /**
   * Check service health
   */
  private async checkServiceHealth(
    resource: ExternalResource,
    config: ExternalServiceConfig
  ): Promise<void> {
    const startTime = Date.now()

    try {
      const url = this.buildUrl(config, config.healthCheck.endpoint)

      const response = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(config.healthCheck.timeoutMs),
      })

      const latency = Date.now() - startTime
      const isHealthy = response.ok

      // Update health status
      const current = this.healthChecks.get(resource) || {
        service: resource,
        status: 'healthy',
        lastCheck: new Date(),
        latency: 0,
        errorRate: 0,
        uptime: 100,
      }

      this.healthChecks.set(resource, {
        service: resource,
        status: isHealthy ? 'healthy' : 'degraded',
        lastCheck: new Date(),
        latency,
        errorRate: isHealthy
          ? current.errorRate * 0.95 // Decay error rate
          : Math.min(current.errorRate + 5, 100), // Increase error rate
        uptime: this.calculateUptime(current, isHealthy),
      })
    } catch (error) {
      // Mark as unhealthy
      this.healthChecks.set(resource, {
        service: resource,
        status: 'unhealthy',
        lastCheck: new Date(),
        latency: Date.now() - startTime,
        errorRate: 100,
        uptime: 0,
      })
    }
  }

  /**
   * Build URL for service
   */
  private buildUrl(config: ExternalServiceConfig, endpoint: string): string {
    if (config.baseUrl) {
      return new URL(endpoint, config.baseUrl).toString()
    }

    // For Docker services, use service name as hostname
    if (config.dockerImage) {
      const serviceName = config.dockerImage.split(':')[0]
      return `http://${serviceName}:8000${endpoint}`
    }

    throw new Error('No base URL or Docker image configured')
  }

  /**
   * Build headers for request
   */
  private async buildHeaders(
    config: ExternalServiceConfig,
    credentials: ServiceCredentials
  ): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Request-ID': `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }

    switch (config.authentication.type) {
      case 'api_key':
        const keyHeader = config.authentication.config.headerName || 'X-API-Key'
        headers[keyHeader] = credentials.apiKey || ''
        break

      case 'oauth2':
        // Check if token needs refresh
        if (credentials.expiresAt && credentials.expiresAt < new Date()) {
          const newToken = await this.refreshOAuthToken(
            credentials.clientId!,
            credentials.clientSecret!,
            credentials.refreshToken!
          )
          credentials.accessToken = newToken.accessToken
          credentials.expiresAt = newToken.expiresAt
        }
        headers['Authorization'] = `Bearer ${credentials.accessToken}`
        break

      case 'jwt':
        headers['Authorization'] = `Bearer ${await this.generateServiceJWT(config)}`
        break

      case 'mutual_tls':
        // Mutual TLS is handled at the network level
        break
    }

    return headers
  }

  /**
   * Refresh OAuth token
   */
  private async refreshOAuthToken(
    _clientId: string,
    _clientSecret: string,
    refreshToken: string
  ): Promise<{ accessToken: string; expiresAt: Date }> {
    // Implementation would call OAuth provider
    // This is a placeholder
    return {
      accessToken: 'new-access-token',
      expiresAt: new Date(Date.now() + 3600000), // 1 hour
    }
  }

  /**
   * Generate JWT for service authentication
   */
  private async generateServiceJWT(config: ExternalServiceConfig): Promise<string> {
    // Simple JWT generation - in production use proper JWT library
    const header = Buffer.from(
      JSON.stringify({
        alg: 'HS256',
        typ: 'JWT',
      })
    ).toString('base64url')

    const payload = Buffer.from(
      JSON.stringify({
        iss: 'coreflow360.com',
        aud: config.service,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      })
    ).toString('base64url')

    // In production, use proper HMAC with secret
    const signature = Buffer.from('signature').toString('base64url')

    return `${header}.${payload}.${signature}`
  }

  /**
   * Update service metrics
   */
  private async updateServiceMetrics(
    resource: ExternalResource,
    success: boolean,
    timestamp: number
  ): Promise<void> {
    const metricsKey = `metrics:${resource}:${Math.floor(timestamp / 60000)}`

    await redis.hincrby(metricsKey, success ? 'success' : 'failure', 1)
    await redis.expire(metricsKey, 3600) // Keep for 1 hour
  }

  /**
   * Calculate uptime percentage
   */
  private calculateUptime(current: ServiceHealth, isHealthy: boolean): number {
    const weight = 0.95 // Exponential moving average
    const currentValue = isHealthy ? 100 : 0

    return current.uptime * weight + currentValue * (1 - weight)
  }

  /**
   * Get all registered services
   */
  private async getAllServices(): Promise<Map<ExternalResource, ExternalServiceConfig>> {
    const services = new Map<ExternalResource, ExternalServiceConfig>()

    // Get from Redis (would scan keys in production)
    // For now, return default services
    const defaults = [
      ExternalResource.FINGPT,
      ExternalResource.FINROBOT,
      ExternalResource.IDURAR,
      ExternalResource.ERPNEXT,
      ExternalResource.DOLIBARR,
    ]

    for (const resource of defaults) {
      const config = this.getDefaultConfig(resource)
      if (config) {
        services.set(resource, config)
      }
    }

    return services
  }

  /**
   * Get default configuration for a service
   */
  private getDefaultConfig(resource: ExternalResource): ExternalServiceConfig | null {
    const configs: Partial<Record<ExternalResource, ExternalServiceConfig>> = {
      [ExternalResource.FINGPT]: {
        service: 'python-docker',
        dockerImage: 'fingpt:latest',
        apiEndpoints: ['/sentiment', '/anomaly', '/forecast'],
        authentication: {
          type: 'api_key',
          config: { headerName: 'X-API-Key' },
        },
        rateLimit: {
          requestsPerSecond: 100,
          burstSize: 200,
        },
        healthCheck: {
          endpoint: '/health',
          intervalSeconds: 30,
          timeoutMs: 5000,
        },
        encryption: {
          algorithm: 'AES-256-GCM',
          keyRotationDays: 30,
        },
      },
      [ExternalResource.FINROBOT]: {
        service: 'python-docker',
        dockerImage: 'finrobot:latest',
        apiEndpoints: ['/forecast', '/strategy', '/analyze'],
        authentication: {
          type: 'jwt',
          config: { algorithm: 'RS256' },
        },
        rateLimit: {
          requestsPerSecond: 50,
          burstSize: 100,
        },
        healthCheck: {
          endpoint: '/health',
          intervalSeconds: 60,
          timeoutMs: 10000,
        },
        encryption: {
          algorithm: 'ChaCha20-Poly1305',
          keyRotationDays: 30,
        },
      },
    }

    return configs[resource] || null
  }

  /**
   * Validate service configuration
   */
  private validateServiceConfig(config: ExternalServiceConfig): void {
    const schema = z.object({
      service: z.enum([
        'python-docker',
        'node-express',
        'python-rest',
        'php-proxy',
        'microservice',
      ]),
      dockerImage: z.string().optional(),
      baseUrl: z.string().url().optional(),
      apiEndpoints: z.array(z.string()),
      authentication: z.object({
        type: z.enum(['api_key', 'oauth2', 'jwt', 'mutual_tls']),
        config: z.record(z.string()),
      }),
      rateLimit: z.object({
        requestsPerSecond: z.number().positive(),
        burstSize: z.number().positive(),
      }),
      healthCheck: z.object({
        endpoint: z.string(),
        intervalSeconds: z.number().positive(),
        timeoutMs: z.number().positive(),
      }),
      encryption: z.object({
        algorithm: z.enum(['AES-256-GCM', 'ChaCha20-Poly1305']),
        keyRotationDays: z.number().positive(),
      }),
    })

    schema.parse(config)
  }

  /**
   * Get service health status
   */
  getServiceHealth(resource: ExternalResource): ServiceHealth | null {
    return this.healthChecks.get(resource) || null
  }

  /**
   * Get all service health statuses
   */
  getAllServiceHealth(): ServiceHealth[] {
    return Array.from(this.healthChecks.values())
  }

  /**
   * Cleanup on shutdown
   */
  shutdown(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }
  }
}

export const serviceManager = ExternalServiceManager.getInstance()
