#!/usr/bin/env tsx

/**
 * CoreFlow360 - Credential Migration Script
 * Moves API keys from environment variables to secure encrypted storage
 */

import { credentialManager } from '../src/lib/security/credential-manager'

const CREDENTIALS_TO_MIGRATE = [
  {
    service: 'openai_api_key',
    envVar: 'OPENAI_API_KEY',
    rotationDays: 90
  },
  {
    service: 'stripe_secret_key',
    envVar: 'STRIPE_SECRET_KEY',
    rotationDays: 180
  },
  {
    service: 'twilio_auth_token',
    envVar: 'TWILIO_AUTH_TOKEN',
    rotationDays: 90
  },
  {
    service: 'google_client_secret',
    envVar: 'GOOGLE_CLIENT_SECRET',
    rotationDays: 365
  },
  {
    service: 'nextauth_secret',
    envVar: 'NEXTAUTH_SECRET',
    rotationDays: 90
  },
  {
    service: 'encryption_key',
    envVar: 'ENCRYPTION_KEY',
    rotationDays: 180
  }
]

async function migrateCredentials() {
  console.log('🔐 Starting credential migration to secure storage...')
  
  let migrated = 0
  let skipped = 0
  let errors = 0
  
  for (const { service, envVar, rotationDays } of CREDENTIALS_TO_MIGRATE) {
    try {
      const envValue = process.env[envVar]
      
      if (!envValue) {
        console.log(`⏭️  Skipping ${service}: ${envVar} not found in environment`)
        skipped++
        continue
      }
      
      // Check if already exists in secure storage
      const existing = await credentialManager.getCredential(service)
      if (existing) {
        console.log(`✅ ${service}: Already exists in secure storage`)
        skipped++
        continue
      }
      
      // Migrate to secure storage
      await credentialManager.storeCredential(service, envValue, undefined, rotationDays)
      console.log(`✅ ${service}: Migrated to secure storage`)
      migrated++
      
    } catch (error) {
      console.error(`❌ Failed to migrate ${service}:`, error)
      errors++
    }
  }
  
  console.log('\n📊 Migration Summary:')
  console.log(`  Migrated: ${migrated}`)
  console.log(`  Skipped: ${skipped}`)
  console.log(`  Errors: ${errors}`)
  
  if (migrated > 0) {
    console.log('\n⚠️  Security Recommendations:')
    console.log('  1. Remove migrated environment variables from production once verified')
    console.log('  2. Update your deployment scripts to not include these variables')
    console.log('  3. Set up automated credential rotation')
    console.log('  4. Monitor credential usage in application logs')
  }
  
  if (errors > 0) {
    console.log('\n🔍 Error Resolution:')
    console.log('  1. Check database connectivity')
    console.log('  2. Verify encryption key is available')
    console.log('  3. Ensure proper database permissions')
    process.exit(1)
  }
}

// Run the migration
if (require.main === module) {
  migrateCredentials()
    .then(() => {
      console.log('\n🎉 Credential migration completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Migration failed:', error)
      process.exit(1)
    })
}