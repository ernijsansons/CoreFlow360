/**
 * CoreFlow360 - Environment Validation
 * Ensures all required environment variables are properly configured
 */

import { z } from 'zod'

// Define the schema for environment variables
const envSchema = z.object({
  // Core configuration
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  
  // Application URLs
  NEXTAUTH_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  
  // Database
  DATABASE_URL: z.string().min(1, 'Database URL is required'),
  DATABASE_URL_UNPOOLED: z.string().optional(),
  
  // Authentication
  NEXTAUTH_SECRET: z.string().min(32, 'NextAuth secret must be at least 32 characters'),
  AUTH_SECRET: z.string().optional(),
  
  // API Security
  API_KEY_SECRET: z.string().min(32, 'API key secret must be at least 32 characters').optional(),
  
  // Payment Processing
  STRIPE_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // AI Services
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_AI_API_KEY: z.string().optional(),
  
  // Email
  EMAIL_FROM: z.string().email().optional(),
  RESEND_API_KEY: z.string().optional(),
  
  // Monitoring
  REDIS_URL: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  
  // OAuth Providers
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  
  // Features
  SECURITY_HEADERS_ENABLED: z.string().default('true'),
  RATE_LIMIT_ENABLED: z.string().default('true'),
  CONSCIOUSNESS_FEATURES_ENABLED: z.string().default('true'),
})

// Type for validated environment
export type ValidatedEnv = z.infer<typeof envSchema>

// Validation function
export function validateEnvironment(): ValidatedEnv {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      
      console.error('❌ Environment validation failed:')
      missingVars.forEach(err => console.error(`  • ${err}`))
      
      // In development, provide helpful guidance
      if (process.env.NODE_ENV === 'development') {
        console.error('\n💡 Quick fix:')
        console.error('  1. Copy env.example to .env.local')
        console.error('  2. Fill in the required values')
        console.error('  3. Restart your development server')
      }
      
      throw new Error('Environment validation failed')
    }
    throw error
  }
}

// Build-time validation (safe for edge runtime)
export function validateBuildEnvironment(): boolean {
  const required = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
  ]
  
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.warn(`⚠️  Build warning: Missing environment variables: ${missing.join(', ')}`)
    return false
  }
  
  return true
}

// Runtime validation with fallbacks
export function getValidatedEnv(): ValidatedEnv {
  // Skip validation during build if explicitly requested
  if (process.env.SKIP_ENV_VALIDATION === 'true') {
    console.warn('⚠️  Environment validation skipped')
    return envSchema.parse({
      NODE_ENV: process.env.NODE_ENV || 'development',
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://placeholder',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'dev-secret-minimum-32-characters-long',
    })
  }
  
  return validateEnvironment()
}

// Export for use in other files
export const env = getValidatedEnv()