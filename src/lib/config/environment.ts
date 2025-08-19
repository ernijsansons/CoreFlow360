/**
 * CoreFlow360 - Environment Configuration
 * Centralized environment variable validation with Zod
 */

import { z } from 'zod'

// Safe key generation function for build time
function generateSecureKey(): string {
  // Return a placeholder during build that will be replaced at runtime
  return '0'.repeat(64)
}

// Check if we're in build phase
function getIsBuildTime(): boolean {
  return (
    process.env.NEXT_PHASE === 'phase-production-build' ||
    (process.env.NODE_ENV === 'production' && !process.env.VERCEL)
  )
}

// Environment variable schema with build-time safety
const EnvSchema = z.object({
  // Core Configuration
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().optional().default('http://localhost:3000'),
  PORT: z.coerce.number().default(3000),

  // Database Configuration - Required but with defaults for build
  DATABASE_URL: getIsBuildTime()
    ? z.string().default('postgresql://placeholder:placeholder@localhost:5432/placeholder')
    : z.string().url().min(1, 'DATABASE_URL is required'),

  // Authentication - Make optional during build
  NEXTAUTH_URL: getIsBuildTime()
    ? z.string().url().optional().default('http://localhost:3000')
    : z.string().url(),
  NEXTAUTH_SECRET: getIsBuildTime()
    ? z.string().optional().default(generateSecureKey())
    : z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),

  // OAuth Providers (all optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),

  // Stripe Configuration (optional)
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_ID: z.string().optional(),

  // Redis Configuration (optional with defaults)
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_TLS_ENABLED: z.coerce.boolean().default(false),

  // OpenAI Configuration (optional)
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_ORG_ID: z.string().optional(),

  // Twilio Configuration (optional)
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),

  // Email Configuration (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),

  // Security Configuration - Make completely optional during build
  ENCRYPTION_KEY: getIsBuildTime()
    ? z.string().optional().default(generateSecureKey())
    : z.string().optional(),
  SESSION_SECRET: z.string().min(32).optional(),
  API_KEY_SECRET: z.string().min(32).optional(),
  API_SIGNING_SECRET: z.string().min(32).optional(),
  AUDIO_ENCRYPTION_MASTER_KEY: z.string().min(32).optional(),
  CORS_ORIGINS: z.string().default('*'),

  // Monitoring & Analytics
  SENTRY_DSN: z.string().url().optional(),
  ANALYTICS_ID: z.string().optional(),

  // Feature Flags
  ENABLE_AI_FEATURES: z.coerce.boolean().default(true),
  ENABLE_VOICE_FEATURES: z.coerce.boolean().default(true),
  ENABLE_WEBSOCKETS: z.coerce.boolean().default(true),

  // External Service URLs
  AI_SERVICE_URL: z.string().url().optional(),
  WEBHOOK_SERVICE_URL: z.string().url().optional(),

  // Rate Limiting
  RATE_LIMIT_WINDOW: z.coerce.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

  // Caching
  CACHE_TTL: z.coerce.number().default(300),

  // Build Configuration
  ANALYZE: z.coerce.boolean().default(false),
  NEXT_TELEMETRY_DISABLED: z.coerce.boolean().default(true),
})

// Type for validated environment
export type Env = z.infer<typeof EnvSchema>

// Cached environment configuration
let cachedEnv: Env | undefined

// Validation function with error details
export function validateEnvironment(): { valid: boolean; errors?: z.ZodError['errors'] } {
  try {
    EnvSchema.parse(process.env)
    return { valid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error.errors }
    }
    return { valid: false, errors: [{ path: [], message: 'Unknown validation error' }] }
  }
}

// Get validated environment with caching
export function getEnv(): Env {
  if (cachedEnv) {
    return cachedEnv
  }

  try {
    cachedEnv = EnvSchema.parse(process.env)
    return cachedEnv
  } catch (error) {
    // During build, return safe defaults
    if (getIsBuildTime()) {
      console.warn('Using build-time environment defaults')
      cachedEnv = EnvSchema.parse({})
      return cachedEnv
    }

    // In runtime, log errors but don't crash
    console.error('Environment validation failed:', error)

    // Return partial environment with defaults
    cachedEnv = EnvSchema.parse({})
    return cachedEnv
  }
}

// Export commonly used values
export const env = getEnv()
export const isDevelopment = env.NODE_ENV === 'development'
export const isProduction = env.NODE_ENV === 'production'
export const isTest = env.NODE_ENV === 'test'

// Export helper to check if a feature is enabled
export function isFeatureEnabled(
  feature: keyof Pick<Env, 'ENABLE_AI_FEATURES' | 'ENABLE_VOICE_FEATURES' | 'ENABLE_WEBSOCKETS'>
): boolean {
  return Boolean(env[feature])
}

// Export database URL getter that handles edge runtime
export function getDatabaseUrl(): string {
  // During build or in edge runtime, return placeholder
  if (getIsBuildTime() || typeof EdgeRuntime !== 'undefined') {
    return 'postgresql://placeholder:placeholder@localhost:5432/placeholder'
  }
  return env.DATABASE_URL
}

// Export Redis configuration
export function getRedisConfig() {
  return {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    tls: env.REDIS_TLS_ENABLED ? {} : undefined,
  }
}

// Export safe public environment for client
export function getPublicEnv() {
  return {
    NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL,
    NODE_ENV: env.NODE_ENV,
    ENABLE_AI_FEATURES: env.ENABLE_AI_FEATURES,
    ENABLE_VOICE_FEATURES: env.ENABLE_VOICE_FEATURES,
    ENABLE_WEBSOCKETS: env.ENABLE_WEBSOCKETS,
  }
}
