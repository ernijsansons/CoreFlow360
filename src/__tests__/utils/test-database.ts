/**
 * CoreFlow360 - Test Database Utilities
 * Database setup, teardown, and transaction management for testing
 */

import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

// Global test database instance
let testDb: PrismaClient | null = null
const DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL

export class TestDatabase {
  private static instance: TestDatabase
  private prisma: PrismaClient
  private isInTransaction = false

  constructor() {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: DATABASE_URL
        }
      },
      log: process.env.NODE_ENV === 'test' ? [] : ['query', 'error', 'warn']
    })
  }

  static getInstance(): TestDatabase {
    if (!TestDatabase.instance) {
      TestDatabase.instance = new TestDatabase()
    }
    return TestDatabase.instance
  }

  getPrisma(): PrismaClient {
    return this.prisma
  }

  // Setup test database
  async setup() {
    try {
      // Run database migrations for test environment
      if (process.env.NODE_ENV === 'test') {
        console.log('🔧 Setting up test database...')
        
        // Apply migrations
        execSync('npx prisma migrate deploy', { 
          stdio: 'inherit',
          env: { ...process.env, DATABASE_URL }
        })
        
        console.log('✅ Test database setup complete')
      }
      
      await this.prisma.$connect()
    } catch (error) {
      console.error('❌ Failed to setup test database:', error)
      throw error
    }
  }

  // Teardown test database
  async teardown() {
    try {
      await this.prisma.$disconnect()
      console.log('🧹 Test database disconnected')
    } catch (error) {
      console.error('❌ Failed to teardown test database:', error)
      throw error
    }
  }

  // Clean all tables (preserving structure)
  async cleanup() {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('⚠️  Database cleanup is only allowed in test environment!')
    }

    try {
      // Get all table names
      const tables = await this.prisma.$queryRaw<Array<{ table_name: string }>>`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name NOT LIKE '_prisma_%'
      `

      // Disable foreign key checks
      await this.prisma.$executeRaw`SET session_replication_role = replica;`

      // Truncate all tables
      for (const { table_name } of tables) {
        await this.prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table_name}" RESTART IDENTITY CASCADE;`)
      }

      // Re-enable foreign key checks
      await this.prisma.$executeRaw`SET session_replication_role = DEFAULT;`

      console.log('🧹 Database cleanup complete')
    } catch (error) {
      console.error('❌ Failed to cleanup database:', error)
      throw error
    }
  }

  // Transaction wrapper for tests
  async withTransaction<T>(testFn: (tx: PrismaClient) => Promise<T>): Promise<T> {
    return await this.prisma.$transaction(async (tx) => {
      this.isInTransaction = true
      try {
        const result = await testFn(tx)
        return result
      } finally {
        this.isInTransaction = false
      }
    })
  }

  // Seed test data
  async seed(seedData: any) {
    try {
      console.log('🌱 Seeding test database...')
      
      // Create tenants first
      if (seedData.tenants) {
        for (const tenant of seedData.tenants) {
          await this.prisma.tenant.create({ data: tenant })
        }
      }

      // Create users
      if (seedData.users) {
        for (const user of seedData.users) {
          await this.prisma.user.create({ data: user })
        }
      }

      // Create customers
      if (seedData.customers) {
        for (const customer of seedData.customers) {
          await this.prisma.customer.create({ data: customer })
        }
      }

      // Create deals
      if (seedData.deals) {
        for (const deal of seedData.deals) {
          await this.prisma.deal.create({ data: deal })
        }
      }

      console.log('✅ Test database seeded')
    } catch (error) {
      console.error('❌ Failed to seed test database:', error)
      throw error
    }
  }

  // Create isolated test environment
  async createTestEnvironment(testName: string) {
    const testPrefix = `test_${testName}_${Date.now()}`
    
    // This would create schema isolation in a real implementation
    console.log(`🧪 Creating test environment: ${testPrefix}`)
    
    return {
      cleanup: async () => {
        console.log(`🧹 Cleaning up test environment: ${testPrefix}`)
        await this.cleanup()
      }
    }
  }

  // Health check
  async isHealthy(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`
      return true
    } catch (error) {
      console.error('❌ Database health check failed:', error)
      return false
    }
  }

  // Get connection info
  getConnectionInfo() {
    return {
      url: DATABASE_URL?.replace(/\/\/.*@/, '//***:***@'), // Hide credentials
      isConnected: this.prisma !== null,
      isInTransaction: this.isInTransaction
    }
  }
}

// Singleton instance
export const testDb = TestDatabase.getInstance()

// Vitest setup helpers
export const setupTestDatabase = async () => {
  await testDb.setup()
}

export const teardownTestDatabase = async () => {
  await testDb.teardown()
}

export const cleanupTestDatabase = async () => {
  await testDb.cleanup()
}

// Test utilities
export const withTestTransaction = async <T>(testFn: (db: PrismaClient) => Promise<T>) => {
  return testDb.withTransaction(testFn)
}

export const createTestTenant = async (data: any = {}) => {
  return testDb.getPrisma().tenant.create({
    data: {
      name: 'Test Tenant',
      slug: `test-tenant-${Date.now()}`,
      industryType: 'GENERAL',
      subscriptionTier: 'INTELLIGENT',
      ...data
    }
  })
}

export const createTestUser = async (tenantId: string, data: any = {}) => {
  return testDb.getPrisma().user.create({
    data: {
      email: `test-${Date.now()}@example.com`,
      name: 'Test User',
      role: 'USER',
      tenantId,
      ...data
    }
  })
}

// Database assertion helpers
export const assertDatabaseState = {
  async hasRecord(model: string, where: any) {
    const record = await (testDb.getPrisma() as any)[model].findFirst({ where })
    if (!record) {
      throw new Error(`Expected to find ${model} with ${JSON.stringify(where)}`)
    }
    return record
  },

  async hasNoRecord(model: string, where: any) {
    const record = await (testDb.getPrisma() as any)[model].findFirst({ where })
    if (record) {
      throw new Error(`Expected NOT to find ${model} with ${JSON.stringify(where)}`)
    }
  },

  async hasCount(model: string, expected: number, where: any = {}) {
    const count = await (testDb.getPrisma() as any)[model].count({ where })
    if (count !== expected) {
      throw new Error(`Expected ${expected} ${model} records, found ${count}`)
    }
  }
}

// Mock database for unit tests
export class MockDatabase {
  private data: Map<string, any[]> = new Map()

  constructor() {
    this.reset()
  }

  reset() {
    this.data.clear()
    // Initialize empty collections
    const models = ['tenant', 'user', 'customer', 'deal', 'invoice', 'project', 'employee']
    models.forEach(model => this.data.set(model, []))
  }

  create(model: string, data: any) {
    const records = this.data.get(model) || []
    const record = { id: `mock_${Date.now()}`, ...data, createdAt: new Date(), updatedAt: new Date() }
    records.push(record)
    this.data.set(model, records)
    return record
  }

  findMany(model: string, query: any = {}) {
    const records = this.data.get(model) || []
    
    if (!query.where) return records
    
    return records.filter(record => {
      return Object.entries(query.where).every(([key, value]) => record[key] === value)
    })
  }

  findUnique(model: string, query: any) {
    const records = this.findMany(model, query)
    return records[0] || null
  }

  update(model: string, query: any, data: any) {
    const records = this.data.get(model) || []
    const index = records.findIndex(record => 
      Object.entries(query.where).every(([key, value]) => record[key] === value)
    )
    
    if (index >= 0) {
      records[index] = { ...records[index], ...data, updatedAt: new Date() }
      return records[index]
    }
    
    throw new Error(`Record not found`)
  }

  delete(model: string, query: any) {
    const records = this.data.get(model) || []
    const index = records.findIndex(record => 
      Object.entries(query.where).every(([key, value]) => record[key] === value)
    )
    
    if (index >= 0) {
      const deleted = records.splice(index, 1)[0]
      return deleted
    }
    
    throw new Error(`Record not found`)
  }

  count(model: string, query: any = {}) {
    return this.findMany(model, query).length
  }
}

export const mockDb = new MockDatabase()

// Export the test database instance
export default testDb