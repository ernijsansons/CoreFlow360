/**
 * Mock implementation of Prisma client for testing with Vitest
 */
import { vi } from 'vitest'

export const mockDb = {
  // Mock models commonly used in tests
  tenantSubscription: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    upsert: vi.fn(),
  },

  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },

  tenant: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },

  moduleDefinition: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },

  subscription: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },

  subscriptionEvent: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },

  aiActivity: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },

  // Transaction support
  $transaction: vi.fn(),

  // Connection management
  $connect: vi.fn(),
  $disconnect: vi.fn(),

  // Query raw
  $queryRaw: vi.fn(),
  $executeRaw: vi.fn(),

  // Metrics
  $metrics: {
    histogram: vi.fn(),
    counter: vi.fn(),
  },
}

// Mock prisma client with proper typing
export const prisma = mockDb

// Helper function to reset all mocks
export const resetMocks = () => {
  Object.values(mockDb).forEach((model) => {
    if (typeof model === 'object' && model !== null) {
      Object.values(model).forEach((method) => {
        if (typeof method === 'function' && method.mockReset) {
          method.mockReset()
        }
      })
    }
  })
  vi.clearAllMocks()
}

// Helper function to create mock data
export const createMockTenant = (id: string = 'test-tenant') => ({
  id,
  name: `Test Tenant ${id}`,
  slug: `test-tenant-${id}`,
  createdAt: new Date(),
  updatedAt: new Date(),
})

export const createMockUser = (id: string = 'test-user') => ({
  id,
  email: `test-${id}@example.com`,
  name: `Test User ${id}`,
  tenantId: 'test-tenant',
  createdAt: new Date(),
  updatedAt: new Date(),
})

export const createMockSubscription = (tenantId: string = 'test-tenant') => ({
  id: 'test-subscription',
  tenantId,
  status: 'active',
  stripeCustomerId: 'cus_test123',
  stripeSubscriptionId: 'sub_test123',
  currentPeriodStart: new Date(),
  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  createdAt: new Date(),
  updatedAt: new Date(),
})

export const createMockModuleDefinition = (key: string) => ({
  id: `module-${key}`,
  key,
  name: `${key.charAt(0).toUpperCase() + key.slice(1)} Module`,
  description: `Mock ${key} module`,
  category: 'business',
  isActive: true,
  basePricePerUser: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
})

export default mockDb
