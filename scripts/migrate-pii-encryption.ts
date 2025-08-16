#!/usr/bin/env tsx

/**
 * CoreFlow360 - PII Encryption Migration Script
 * Encrypts existing unencrypted PII data in the database
 */

import { PrismaClient } from '@prisma/client'
import { migrateUnencryptedPIIData } from '../src/lib/db-encryption'

async function main() {
  console.log('🔐 Starting PII encryption migration...')
  
  const prisma = new PrismaClient()
  
  try {
    // Run the migration
    await migrateUnencryptedPIIData(prisma)
    
    console.log('✅ PII encryption migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
if (require.main === module) {
  main()
    .then(() => {
      console.log('Migration finished.')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Migration error:', error)
      process.exit(1)
    })
}