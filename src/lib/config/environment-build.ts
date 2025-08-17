/**
 * CoreFlow360 - Build-time Environment Configuration
 * More lenient validation for build process
 */

import { z } from 'zod'

// Build-time environment schema - more lenient
const buildEnvironmentSchema = z.object({
  // Node.js Environment
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('production'),
  
  // Required for build but can have defaults
  DATABASE_URL: z.string().default('postgresql://user:pass@localhost:5432/db'),
  NEXTAUTH_SECRET: z.string().default('build-time-placeholder-secret-will-be-replaced'),
  NEXTAUTH_URL: z.string().default('https://localhost:3000'),
  
  // Optional during build
  APP_NAME: z.string().default('CoreFlow360'),
  APP_VERSION: z.string().default('2.0.0'),
  APP_URL: z.string().optional(),
  PORT: z.coerce.number().default(3000),
  
  // All other vars are optional during build
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  ENCRYPTION_KEY: z.string().optional(),
  REDIS_URL: z.string().optional(),
  V0_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
})

export type BuildEnvironment = z.infer<typeof buildEnvironmentSchema>

let cachedEnv: BuildEnvironment | null = null

export function getBuildEnvironment(): BuildEnvironment {
  if (cachedEnv) return cachedEnv
  
  try {
    // Parse environment with defaults
    const env = buildEnvironmentSchema.parse(process.env)
    cachedEnv = env
    return env
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.warn('Build environment validation warnings:')
      error.errors.forEach((err) => {
        console.warn(`  ${err.path.join('.')}: ${err.message}`)
      })
    }
    
    // Return safe defaults for build
    return {
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      NEXTAUTH_SECRET: 'build-time-placeholder-secret-will-be-replaced',
      NEXTAUTH_URL: 'https://localhost:3000',
      APP_NAME: 'CoreFlow360',
      APP_VERSION: '2.0.0',
      PORT: 3000,
    }
  }
}

// Export for build-time usage
export const buildEnv = getBuildEnvironment()