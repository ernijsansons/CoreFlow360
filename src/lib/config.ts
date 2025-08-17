/**
 * CoreFlow360 - Configuration Validation System
 * Ensures all required environment variables are present and properly formatted
 */

import { z } from 'zod'

// Build-time detection (moved to top)
const isBuildTime = process.env.VERCEL_ENV || process.env.CI || process.env.NEXT_PHASE === 'phase-production-build'

// Environment variable schemas
// Accept standard URLs (postgres, mysql, etc.) and SQLite file URLs used in tests/development
const DatabaseConfigSchema = z.object({
  DATABASE_URL: isBuildTime
    ? z.string().optional().default('postgresql://user:pass@localhost:5432/db')
    : z.string().refine((val) => {
        if (!val) return false
        if (val.startsWith('file:')) return true
        try {
          // Will throw for invalid URLs
          // Allow http(s), postgres, mysql, etc.
          // eslint-disable-next-line no-new
          new URL(val)
          return true
        } catch {
          return false
        }
      }, 'Invalid database URL format'),
})

const AuthConfigSchema = z.object({
  NEXTAUTH_URL: isBuildTime 
    ? z.string().optional().default('http://localhost:3000')
    : z.string().url('Invalid NextAuth URL format'),
  NEXTAUTH_SECRET: isBuildTime
    ? z.string().optional().default('build-time-placeholder-secret-32-chars')
    : z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
})

const StripeConfigSchema = z.object({
  STRIPE_SECRET_KEY: isBuildTime
    ? z.string().optional().default('sk_test_placeholder')
    : z.string().startsWith('sk_', 'Invalid Stripe secret key format'),
  STRIPE_PUBLISHABLE_KEY: isBuildTime
    ? z.string().optional().default('pk_test_placeholder')
    : z.string().startsWith('pk_', 'Invalid Stripe publishable key format'),
  STRIPE_WEBHOOK_SECRET: isBuildTime
    ? z.string().optional().default('whsec_placeholder')
    : z.string().startsWith('whsec_', 'Invalid Stripe webhook secret format'),
})

const AIConfigSchema = z.object({
  OPENAI_API_KEY: isBuildTime
    ? z.string().optional().default('sk-placeholder')
    : z.string().startsWith('sk-', 'Invalid OpenAI API key format'),
  ANTHROPIC_API_KEY: isBuildTime
    ? z.string().optional().default('sk-ant-placeholder')
    : z.string().startsWith('sk-ant-', 'Invalid Anthropic API key format'),
})

const EmailConfigSchema = z.object({
  SENDGRID_API_KEY: isBuildTime
    ? z.string().optional().default('placeholder')
    : z.string().min(1, 'SendGrid API key is required'),
  RESEND_API_KEY: z.string().optional(),
})

const RedisConfigSchema = z.object({
  REDIS_URL: z.string().url('Invalid Redis URL format').optional(),
})

const SecurityConfigSchema = z.object({
  API_KEY_SECRET: isBuildTime 
    ? z.string().optional().default('build-time-placeholder-secret-32-chars')
    : z.string().min(32, 'API_KEY_SECRET must be at least 32 characters'),
  ENCRYPTION_KEY: isBuildTime
    ? z.string().optional().default('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef')
    : z.string().min(32, 'ENCRYPTION_KEY must be at least 32 characters'),
})

// Combined configuration schema for full app runtime
const ConfigSchema = z.object({
  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']),
  
  // Database
  ...DatabaseConfigSchema.shape,
  
  // Authentication
  ...AuthConfigSchema.shape,
  
  // Payment processing
  ...StripeConfigSchema.shape,
  
  // AI services
  ...AIConfigSchema.shape,
  
  // Email services
  ...EmailConfigSchema.shape,
  
  // Caching
  ...RedisConfigSchema.shape,
  
  // Security
  ...SecurityConfigSchema.shape,
  
  // Optional configurations
  SENTRY_DSN: z.string().url('Invalid Sentry DSN format').optional(),
  VERCEL_URL: z.string().optional(),
  CUSTOM_DOMAIN: z.string().optional(),
  
  // Feature flags
  ENABLE_AI_FEATURES: z.string().transform(val => val === 'true').default('true'),
  ENABLE_ANALYTICS: z.string().transform(val => val === 'true').default('true'),
  ENABLE_AUDIT_LOGGING: z.string().transform(val => val === 'true').default('true'),
  
  // Performance settings  
  MAX_FILE_SIZE: z.string().transform(val => parseInt(val || '10485760', 10)).default('10485760'), // 10MB
  RATE_LIMIT_WINDOW: z.string().transform(val => parseInt(val || '60000', 10)).default('60000'), // 1 minute  
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(val => parseInt(val || '100', 10)).default('100'),
  
  // Server configuration
  PORT: z.string().transform(val => parseInt(val || '3000', 10)).default('3000'),
  HOST: z.string().default('localhost'),
  
  // Monitoring configuration
  MONITORING_ENABLED: z.string().transform(val => val === 'true').default('true'),
  HEALTH_CHECK_INTERVAL: z.string().transform(val => parseInt(val || '30000', 10)).default('30000'), // 30 seconds
  PERFORMANCE_SAMPLING_RATE: z.string().transform(val => parseFloat(val || '0.1')).default('0.1'), // 10%
  
  // Cache configuration  
  CACHE_TTL_DEFAULT: z.string().transform(val => parseInt(val || '3600', 10)).default('3600'), // 1 hour
  CACHE_MAX_SIZE: z.string().transform(val => parseInt(val || '104857600', 10)).default('104857600'), // 100MB
  
  // Security settings
  CORS_ORIGINS: z.string().transform(val => val ? val.split(',').map(s => s.trim()) : ['*']).default('*'),
  JWT_EXPIRY: z.string().default('7d'),
  SESSION_TIMEOUT: z.string().transform(val => parseInt(val || '1800000', 10)).default('1800000'), // 30 minutes
})

// Minimal configuration schema for test environment
const TestConfigSchema = z.object({
  NODE_ENV: z.literal('test'),
  ...DatabaseConfigSchema.shape,
})

// Configuration type
export type Config = z.infer<typeof ConfigSchema>

// Configuration validation class
export class ConfigValidator {
  private static instance: ConfigValidator
  private config: Config | null = null
  private validationErrors: string[] = []

  private constructor() {}

  static getInstance(): ConfigValidator {
    if (!ConfigValidator.instance) {
      ConfigValidator.instance = new ConfigValidator()
    }
    return ConfigValidator.instance
  }

  /**
   * Validate and load configuration
   */
  validate(): Config {
    if (this.config) {
      return this.config
    }

    try {
      // Transform environment variables
      const envConfig = {
        NODE_ENV: process.env.NODE_ENV || 'development',
        DATABASE_URL: process.env.DATABASE_URL,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
        STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
        SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
        RESEND_API_KEY: process.env.RESEND_API_KEY,
        REDIS_URL: process.env.REDIS_URL,
        API_KEY_SECRET: process.env.API_KEY_SECRET,
        ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
        SENTRY_DSN: process.env.SENTRY_DSN,
        VERCEL_URL: process.env.VERCEL_URL,
        CUSTOM_DOMAIN: process.env.CUSTOM_DOMAIN,
        ENABLE_AI_FEATURES: process.env.ENABLE_AI_FEATURES,
        ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS,
        ENABLE_AUDIT_LOGGING: process.env.ENABLE_AUDIT_LOGGING,
        MAX_FILE_SIZE: process.env.MAX_FILE_SIZE,
        RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW,
        RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS,
        PORT: process.env.PORT,
        HOST: process.env.HOST,
        MONITORING_ENABLED: process.env.MONITORING_ENABLED,
        HEALTH_CHECK_INTERVAL: process.env.HEALTH_CHECK_INTERVAL,
        PERFORMANCE_SAMPLING_RATE: process.env.PERFORMANCE_SAMPLING_RATE,
        CACHE_TTL_DEFAULT: process.env.CACHE_TTL_DEFAULT,
        CACHE_MAX_SIZE: process.env.CACHE_MAX_SIZE,
        CORS_ORIGINS: process.env.CORS_ORIGINS,
        JWT_EXPIRY: process.env.JWT_EXPIRY,
        SESSION_TIMEOUT: process.env.SESSION_TIMEOUT,
      }

      // Validate configuration (use minimal schema in test env)
      const result = (envConfig.NODE_ENV === 'test'
        ? TestConfigSchema
        : ConfigSchema
      ).safeParse(envConfig)
      
      if (!result.success) {
        this.validationErrors = result.error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        )
        
        throw new Error(`Configuration validation failed:\n${this.validationErrors.join('\n')}`)
      }

      this.config = result.data
      return this.config

    } catch (error) {
      console.error('Configuration validation error:', error)
      throw error
    }
  }

  /**
   * Get configuration (validates if not already done)
   */
  getConfig(): Config {
    return this.validate()
  }

  /**
   * Get validation errors
   */
  getValidationErrors(): string[] {
    return [...this.validationErrors]
  }

  /**
   * Check if configuration is valid
   */
  isValid(): boolean {
    try {
      this.validate()
      return true
    } catch {
      return false
    }
  }

  /**
   * Get environment-specific configuration
   */
  getEnvironmentConfig() {
    const config = this.getConfig()
    
    return {
      isDevelopment: config.NODE_ENV === 'development',
      isProduction: config.NODE_ENV === 'production',
      isTest: config.NODE_ENV === 'test',
      features: {
        ai: config.ENABLE_AI_FEATURES,
        analytics: config.ENABLE_ANALYTICS,
        auditLogging: config.ENABLE_AUDIT_LOGGING,
      },
      limits: {
        maxFileSize: config.MAX_FILE_SIZE,
        rateLimitWindow: config.RATE_LIMIT_WINDOW,
        rateLimitMaxRequests: config.RATE_LIMIT_MAX_REQUESTS,
      },
      server: {
        port: config.PORT,
        host: config.HOST,
      },
      monitoring: {
        enabled: config.MONITORING_ENABLED,
        healthCheckInterval: config.HEALTH_CHECK_INTERVAL,
        performanceSamplingRate: config.PERFORMANCE_SAMPLING_RATE,
      },
      cache: {
        ttlDefault: config.CACHE_TTL_DEFAULT,
        maxSize: config.CACHE_MAX_SIZE,
      },
      security: {
        corsOrigins: config.CORS_ORIGINS,
        jwtExpiry: config.JWT_EXPIRY,
        sessionTimeout: config.SESSION_TIMEOUT,
      }
    }
  }

  /**
   * Validate specific configuration section
   */
  validateSection<T extends keyof Config>(section: T): Config[T] {
    const config = this.getConfig()
    return config[section]
  }

  /**
   * Get database configuration
   */
  getDatabaseConfig() {
    return {
      url: this.validateSection('DATABASE_URL'),
    }
  }

  /**
   * Get authentication configuration
   */
  getAuthConfig() {
    return {
      url: this.validateSection('NEXTAUTH_URL'),
      secret: this.validateSection('NEXTAUTH_SECRET'),
    }
  }

  /**
   * Get Stripe configuration
   */
  getStripeConfig() {
    return {
      secretKey: this.validateSection('STRIPE_SECRET_KEY'),
      publishableKey: this.validateSection('STRIPE_PUBLISHABLE_KEY'),
      webhookSecret: this.validateSection('STRIPE_WEBHOOK_SECRET'),
    }
  }

  /**
   * Get AI configuration
   */
  getAIConfig() {
    return {
      openaiKey: this.validateSection('OPENAI_API_KEY'),
      anthropicKey: this.validateSection('ANTHROPIC_API_KEY'),
    }
  }

  /**
   * Get email configuration
   */
  getEmailConfig() {
    return {
      sendgridKey: this.validateSection('SENDGRID_API_KEY'),
      resendKey: this.validateSection('RESEND_API_KEY'),
    }
  }

  /**
   * Get security configuration
   */
  getSecurityConfig() {
    return {
      apiKeySecret: this.validateSection('API_KEY_SECRET'),
      encryptionKey: this.validateSection('ENCRYPTION_KEY'),
    }
  }
}

// Export singleton instance
export const configValidator = ConfigValidator.getInstance()

// Convenience function to get validated configuration
export const getConfig = (): Config => configValidator.getConfig()

// Convenience function to check if configuration is valid
export const isConfigValid = (): boolean => configValidator.isValid()

// Convenience function to get validation errors
export const getConfigErrors = (): string[] => configValidator.getValidationErrors()

// Environment-specific configuration getters
export const getEnvironmentConfig = () => configValidator.getEnvironmentConfig()
export const getDatabaseConfig = () => configValidator.getDatabaseConfig()
export const getAuthConfig = () => configValidator.getAuthConfig()
export const getStripeConfig = () => configValidator.getStripeConfig()
export const getAIConfig = () => configValidator.getAIConfig()
export const getEmailConfig = () => configValidator.getEmailConfig()
export const getSecurityConfig = () => configValidator.getSecurityConfig()
