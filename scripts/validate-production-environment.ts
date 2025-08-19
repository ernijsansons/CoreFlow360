#!/usr/bin/env tsx
/**
 * Production Environment Validation Script
 * Validates all required environment variables for CoreFlow360 production deployment
 */

import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.production' })
config({ path: '.env.local' })
config({ path: '.env' })

interface ValidationResult {
  variable: string
  status: 'VALID' | 'MISSING' | 'INVALID'
  message?: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
}

/**
 * Validate environment variables for production deployment
 */
function validateProductionEnvironment(): ValidationResult[] {
  const results: ValidationResult[] = []

  // CRITICAL - Core System Variables
  const criticalVariables = [
    {
      name: 'DATABASE_URL',
      validator: (value: string) => value.startsWith('postgresql://') && value.includes('@'),
      message: 'Must be a valid PostgreSQL connection string'
    },
    {
      name: 'NEXTAUTH_SECRET',
      validator: (value: string) => value.length >= 32,
      message: 'Must be at least 32 characters. Generate with: openssl rand -base64 32'
    },
    {
      name: 'NEXTAUTH_URL',
      validator: (value: string) => value.startsWith('https://') || (process.env.NODE_ENV !== 'production' && value.startsWith('http://')),
      message: 'Must be a valid HTTPS URL for production'
    },
    {
      name: 'ENCRYPTION_KEY',
      validator: (value: string) => /^[0-9a-fA-F]{64}$/.test(value),
      message: 'Must be exactly 64 hexadecimal characters. Generate with: openssl rand -hex 32'
    }
  ]

  // HIGH - Security Variables
  const securityVariables = [
    {
      name: 'API_KEY_SECRET',
      validator: (value: string) => /^[0-9a-fA-F]{64}$/.test(value),
      message: 'Should be 64 hex characters for security. Generate with: openssl rand -hex 32'
    }
  ]

  // MEDIUM - Feature Variables (Required if features enabled)
  const featureVariables = [
    {
      name: 'STRIPE_SECRET_KEY',
      validator: (value: string) => value.startsWith('sk_'),
      message: 'Required for subscription billing',
      required: process.env.ENABLE_STRIPE_INTEGRATION === 'true'
    },
    {
      name: 'STRIPE_WEBHOOK_SECRET',
      validator: (value: string) => value.startsWith('whsec_'),
      message: 'Required for Stripe webhook processing',
      required: process.env.ENABLE_STRIPE_INTEGRATION === 'true'
    },
    {
      name: 'OPENAI_API_KEY',
      validator: (value: string) => value.startsWith('sk-'),
      message: 'Required for AI features',
      required: process.env.ENABLE_AI_FEATURES === 'true'
    }
  ]

  // LOW - Optional Variables
  const optionalVariables = [
    {
      name: 'REDIS_URL',
      validator: (value: string) => value.startsWith('redis://') || value.startsWith('rediss://'),
      message: 'Recommended for production performance'
    },
    {
      name: 'SENTRY_DSN',
      validator: (value: string) => value.startsWith('https://') && value.includes('sentry.io'),
      message: 'Recommended for error monitoring'
    }
  ]

  // Validate each category
  const validateCategory = (
    variables: any[],
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  ) => {
    variables.forEach(({ name, validator, message, required = true }) => {
      const value = process.env[name]

      if (!value) {
        if (required) {
          results.push({
            variable: name,
            status: 'MISSING',
            message: `${message} (Required)`,
            severity
          })
        } else {
          results.push({
            variable: name,
            status: 'MISSING',
            message: `${message} (Optional)`,
            severity: 'LOW'
          })
        }
        return
      }

      if (validator && !validator(value)) {
        results.push({
          variable: name,
          status: 'INVALID',
          message,
          severity
        })
        return
      }

      results.push({
        variable: name,
        status: 'VALID',
        severity
      })
    })
  }

  validateCategory(criticalVariables, 'CRITICAL')
  validateCategory(securityVariables, 'HIGH')
  validateCategory(featureVariables, 'MEDIUM')
  validateCategory(optionalVariables, 'LOW')

  return results
}

/**
 * Display validation results
 */
function displayResults(results: ValidationResult[]) {
  console.log('\n🔍 CoreFlow360 Production Environment Validation\n')

  const categories = {
    CRITICAL: results.filter(r => r.severity === 'CRITICAL'),
    HIGH: results.filter(r => r.severity === 'HIGH'),
    MEDIUM: results.filter(r => r.severity === 'MEDIUM'),
    LOW: results.filter(r => r.severity === 'LOW')
  }

  let hasErrors = false
  let hasWarnings = false

  Object.entries(categories).forEach(([severity, items]) => {
    if (items.length === 0) return

    const icon = severity === 'CRITICAL' ? '🔴' : 
                 severity === 'HIGH' ? '🟠' : 
                 severity === 'MEDIUM' ? '🟡' : '🔵'

    console.log(`${icon} ${severity} Variables:`)
    
    items.forEach(result => {
      const status = result.status === 'VALID' ? '✅' : 
                     result.status === 'MISSING' ? '❌' : '⚠️'
      
      console.log(`  ${status} ${result.variable}: ${result.status}`)
      
      if (result.message) {
        console.log(`     ${result.message}`)
      }

      if (result.status !== 'VALID') {
        if (result.severity === 'CRITICAL' || result.severity === 'HIGH') {
          hasErrors = true
        } else {
          hasWarnings = true
        }
      }
    })
    console.log('')
  })

  // Summary
  console.log('📊 Summary:')
  const valid = results.filter(r => r.status === 'VALID').length
  const total = results.length
  console.log(`  Valid: ${valid}/${total} environment variables`)

  if (hasErrors) {
    console.log('\n🚨 CRITICAL ISSUES FOUND!')
    console.log('   Production deployment will fail without fixing these issues.')
    console.log('   Please update your environment variables and run this script again.')
    process.exit(1)
  } else if (hasWarnings) {
    console.log('\n⚠️  WARNINGS DETECTED')
    console.log('   Some optional features may not work correctly.')
    console.log('   Consider adding the missing environment variables.')
    process.exit(0)
  } else {
    console.log('\n✅ ALL CHECKS PASSED!')
    console.log('   Environment is ready for production deployment.')
    process.exit(0)
  }
}

/**
 * Main execution
 */
if (require.main === module) {
  try {
    const results = validateProductionEnvironment()
    displayResults(results)
  } catch (error) {
    console.error('❌ Environment validation failed:', error)
    process.exit(1)
  }
}

export { validateProductionEnvironment, ValidationResult }