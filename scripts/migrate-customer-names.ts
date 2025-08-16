/**
 * Migration script to split customer names into firstName and lastName
 * Preserves existing data while updating to new schema
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateCustomerNames() {
  console.log('Starting customer name migration...')
  
  try {
    // Get all customers with name field
    const customers = await prisma.$queryRawUnsafe<Array<{
      id: string
      name: string | null
      tenantId: string
    }>>(
      `SELECT id, name, "tenantId" FROM customers WHERE name IS NOT NULL`
    )
    
    console.log(`Found ${customers.length} customers to migrate`)
    
    let migrated = 0
    let failed = 0
    
    // Process in batches of 100
    const batchSize = 100
    for (let i = 0; i < customers.length; i += batchSize) {
      const batch = customers.slice(i, i + batchSize)
      
      await prisma.$transaction(async (tx) => {
        for (const customer of batch) {
          try {
            if (!customer.name) continue
            
            // Split name into first and last
            const nameParts = customer.name.trim().split(/\s+/)
            const firstName = nameParts[0] || ''
            const lastName = nameParts.slice(1).join(' ') || ''
            
            // Update customer with split names
            await tx.$executeRawUnsafe(
              `UPDATE customers 
               SET "firstName" = $1, "lastName" = $2 
               WHERE id = $3`,
              firstName,
              lastName,
              customer.id
            )
            
            migrated++
          } catch (error) {
            console.error(`Failed to migrate customer ${customer.id}:`, error)
            failed++
          }
        }
      })
      
      console.log(`Progress: ${Math.min(i + batchSize, customers.length)}/${customers.length}`)
    }
    
    console.log(`\nMigration complete!`)
    console.log(`Successfully migrated: ${migrated}`)
    console.log(`Failed: ${failed}`)
    
    // After successful migration, we can consider removing the name column
    // This should be done in a separate migration after verifying all data is correct
    console.log('\nNote: The "name" column has been retained for backward compatibility.')
    console.log('It can be removed in a future migration after verification.')
    
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
migrateCustomerNames()
  .then(() => {
    console.log('Migration script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration script failed:', error)
    process.exit(1)
  })