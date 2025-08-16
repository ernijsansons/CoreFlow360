#!/usr/bin/env tsx
/**
 * CoreFlow360 Production Environment Validator
 * Validates that all required environment variables are properly configured
 */

import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.production.final' })

interface EnvCheck {
  name: string
  required: boolean
  description: string
  validator?: (value: string) => boolean
}

const ENV_CHECKS: EnvCheck[] = [
  // Core Authentication
  { name: 'NODE_ENV', required: true, description: 'Environment mode' },
  { name: 'NEXTAUTH_SECRET', required: true, description: 'NextAuth secret key', 
    validator: (v) => v.length >= 32 },
  { name: 'NEXTAUTH_URL', required: true, description: 'Application URL',
    validator: (v) => v.startsWith('https://') },
  { name: 'API_KEY_SECRET', required: true, description: 'API security secret',
    validator: (v) => v.length >= 32 },
  { name: 'ENCRYPTION_KEY', required: true, description: 'Data encryption key',
    validator: (v) => v.length >= 32 },
  
  // Database
  { name: 'DATABASE_URL', required: true, description: 'PostgreSQL connection',
    validator: (v) => v.includes('postgresql://') },
  
  // Stripe
  { name: 'STRIPE_PUBLISHABLE_KEY', required: true, description: 'Stripe publishable key',
    validator: (v) => v.startsWith('pk_') },
  { name: 'STRIPE_SECRET_KEY', required: true, description: 'Stripe secret key',
    validator: (v) => v.startsWith('sk_') },
  { name: 'STRIPE_WEBHOOK_SECRET', required: true, description: 'Stripe webhook secret',
    validator: (v) => v.startsWith('whsec_') },
  
  // Email
  { name: 'EMAIL_PROVIDER', required: true, description: 'Email service provider' },
  { name: 'EMAIL_FROM', required: true, description: 'From email address' },
]

function validateEnvironment() {
  console.log('🔍 CoreFlow360 Production Environment Validation\n')
  
  let allValid = true
  let requiredMissing = 0

  for (const check of ENV_CHECKS) {
    const value = process.env[check.name]
    const isSet = value && value.trim() !== '' && !value.includes('REPLACE_WITH_YOUR_')
    
    let status = '❌'
    let message = ''
    
    if (isSet) {
      if (check.validator && !check.validator(value!)) {
        status = '⚠️ '
        message = ' (invalid format)'
        if (check.required) allValid = false
      } else {
        status = '✅'
      }
    } else {
      if (check.required) {
        allValid = false
        requiredMissing++
        message = ' (REQUIRED)'
      } else {
        status = '⚪'
        message = ' (optional)'
      }
    }
    
    console.log(`${status} ${check.name}: ${check.description}${message}`)
  }
  
  if (allValid && requiredMissing === 0) {
    console.log('\n🎉 Environment validation PASSED! Ready for production deployment.')
    return true
  } else {
    console.log('\n❌ Environment validation FAILED!')
    console.log(`   ${requiredMissing} required variables are missing or invalid`)
    return false
  }
}

// Run validation
const isValid = validateEnvironment()
if (!isValid) {
  console.log('\n📝 Update .env.production.final with your actual credentials')
  process.exit(1)
} else {
  console.log('\n🎯 Ready to deploy! Run: vercel --prod')
  process.exit(0)
}