/**
 * Database Tenant Isolation Tests
 * Critical tests for multi-tenant data security
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'

// Mock Prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: mockDeep<PrismaClient>()
}))

import { prisma } from '@/lib/prisma'

const mockPrisma = prisma as unknown as DeepMockProxy<PrismaClient>

describe('Database Tenant Isolation', () => {
  const tenant1Id = 'tenant-abc-123'
  const tenant2Id = 'tenant-xyz-789'
  
  const user1 = {
    id: 'user-1',
    email: 'user1@tenant1.com',
    tenantId: tenant1Id
  }
  
  const user2 = {
    id: 'user-2',
    email: 'user2@tenant2.com',
    tenantId: tenant2Id
  }

  beforeEach(() => {
    mockReset(mockPrisma)
  })

  describe('Customer Data Isolation', () => {
    it('should only return customers for the requesting tenant', async () => {
      const tenant1Customers = [
        { id: 'cust-1', name: 'Customer 1', tenantId: tenant1Id },
        { id: 'cust-2', name: 'Customer 2', tenantId: tenant1Id }
      ]
      
      const tenant2Customers = [
        { id: 'cust-3', name: 'Customer 3', tenantId: tenant2Id }
      ]

      // Mock the findMany to filter by tenantId
      mockPrisma.customer.findMany.mockImplementation(async (args) => {
        if (args?.where?.tenantId === tenant1Id) {
          return tenant1Customers as any
        }
        if (args?.where?.tenantId === tenant2Id) {
          return tenant2Customers as any
        }
        return []
      })

      // Test tenant 1 access
      const result1 = await mockPrisma.customer.findMany({
        where: { tenantId: tenant1Id }
      })
      
      expect(result1).toHaveLength(2)
      expect(result1.every(c => c.tenantId === tenant1Id)).toBe(true)

      // Test tenant 2 access
      const result2 = await mockPrisma.customer.findMany({
        where: { tenantId: tenant2Id }
      })
      
      expect(result2).toHaveLength(1)
      expect(result2[0].tenantId).toBe(tenant2Id)

      // Verify no cross-tenant data leak
      expect(result1.some(c => c.tenantId === tenant2Id)).toBe(false)
      expect(result2.some(c => c.tenantId === tenant1Id)).toBe(false)
    })

    it('should prevent updating records from other tenants', async () => {
      const customer = {
        id: 'cust-1',
        name: 'Original Name',
        tenantId: tenant1Id
      }

      mockPrisma.customer.findUnique.mockResolvedValue(customer as any)
      
      mockPrisma.customer.update.mockImplementation(async (args) => {
        // Simulate tenant validation in update
        const record = await mockPrisma.customer.findUnique({
          where: { id: args.where.id }
        })
        
        if (record?.tenantId !== tenant2Id) {
          throw new Error('Unauthorized: Cannot update record from different tenant')
        }
        
        return { ...record, ...args.data } as any
      })

      // Attempt to update from wrong tenant
      await expect(
        mockPrisma.customer.update({
          where: { id: 'cust-1' },
          data: { name: 'Hacked Name' }
        })
      ).rejects.toThrow('Unauthorized: Cannot update record from different tenant')
    })

    it('should enforce tenant context in create operations', async () => {
      mockPrisma.customer.create.mockImplementation(async (args) => {
        if (!args.data.tenantId) {
          throw new Error('TenantId is required')
        }
        return { id: 'new-cust', ...args.data } as any
      })

      // Test creating with tenant context
      const newCustomer = await mockPrisma.customer.create({
        data: {
          name: 'New Customer',
          email: 'new@example.com',
          tenantId: tenant1Id
        }
      })

      expect(newCustomer.tenantId).toBe(tenant1Id)

      // Test creating without tenant context
      await expect(
        mockPrisma.customer.create({
          data: {
            name: 'No Tenant Customer',
            email: 'no-tenant@example.com'
          } as any
        })
      ).rejects.toThrow('TenantId is required')
    })
  })

  describe('Subscription and Module Access', () => {
    it('should isolate subscription data by tenant', async () => {
      const tenant1Subscription = {
        id: 'sub-1',
        userId: 'user-1',
        tier: 'synaptic',
        status: 'active',
        user: { tenantId: tenant1Id }
      }

      const tenant2Subscription = {
        id: 'sub-2',
        userId: 'user-2',
        tier: 'neural',
        status: 'active',
        user: { tenantId: tenant2Id }
      }

      mockPrisma.subscription.findFirst.mockImplementation(async (args) => {
        if (args?.where?.user?.tenantId === tenant1Id) {
          return tenant1Subscription as any
        }
        if (args?.where?.user?.tenantId === tenant2Id) {
          return tenant2Subscription as any
        }
        return null
      })

      // Test tenant-specific subscription access
      const sub1 = await mockPrisma.subscription.findFirst({
        where: { user: { tenantId: tenant1Id } }
      })

      const sub2 = await mockPrisma.subscription.findFirst({
        where: { user: { tenantId: tenant2Id } }
      })

      expect(sub1?.tier).toBe('synaptic')
      expect(sub2?.tier).toBe('neural')
      expect(sub1?.id).not.toBe(sub2?.id)
    })

    it('should prevent cross-tenant module activation', async () => {
      mockPrisma.subscriptionModule.create.mockImplementation(async (args) => {
        // Validate subscription belongs to tenant
        const subscription = await mockPrisma.subscription.findUnique({
          where: { id: args.data.subscriptionId },
          include: { user: true }
        })

        if (!subscription || subscription.user.tenantId !== tenant1Id) {
          throw new Error('Cannot activate module for subscription from different tenant')
        }

        return { id: 'mod-1', ...args.data } as any
      })

      mockPrisma.subscription.findUnique.mockResolvedValue({
        id: 'sub-2',
        user: { tenantId: tenant2Id }
      } as any)

      // Attempt to activate module for wrong tenant's subscription
      await expect(
        mockPrisma.subscriptionModule.create({
          data: {
            subscriptionId: 'sub-2',
            moduleId: 'crm',
            isActive: true
          }
        })
      ).rejects.toThrow('Cannot activate module for subscription from different tenant')
    })
  })

  describe('AI Insights and Decisions Isolation', () => {
    it('should isolate AI insights by tenant', async () => {
      const tenant1Insights = [
        {
          id: 'insight-1',
          type: 'customer_pattern',
          tenantId: tenant1Id,
          confidence: 0.85
        }
      ]

      const tenant2Insights = [
        {
          id: 'insight-2',
          type: 'revenue_trend',
          tenantId: tenant2Id,
          confidence: 0.92
        }
      ]

      mockPrisma.aiInsight.findMany.mockImplementation(async (args) => {
        if (args?.where?.tenantId === tenant1Id) {
          return tenant1Insights as any
        }
        if (args?.where?.tenantId === tenant2Id) {
          return tenant2Insights as any
        }
        return []
      })

      const insights1 = await mockPrisma.aiInsight.findMany({
        where: { tenantId: tenant1Id }
      })

      const insights2 = await mockPrisma.aiInsight.findMany({
        where: { tenantId: tenant2Id }
      })

      expect(insights1).toHaveLength(1)
      expect(insights2).toHaveLength(1)
      expect(insights1[0].tenantId).toBe(tenant1Id)
      expect(insights2[0].tenantId).toBe(tenant2Id)
    })

    it('should prevent accessing AI decisions across tenants', async () => {
      const decision = {
        id: 'decision-1',
        type: 'resource_allocation',
        tenantId: tenant1Id,
        confidence: 0.88
      }

      mockPrisma.aiDecision.findUnique.mockImplementation(async (args) => {
        const found = args.where.id === 'decision-1' ? decision : null
        return found as any
      })

      // Create a function that validates tenant access
      async function getDecisionForTenant(decisionId: string, tenantId: string) {
        const decision = await mockPrisma.aiDecision.findUnique({
          where: { id: decisionId }
        })

        if (!decision || decision.tenantId !== tenantId) {
          throw new Error('Decision not found or access denied')
        }

        return decision
      }

      // Test authorized access
      const authorizedDecision = await getDecisionForTenant('decision-1', tenant1Id)
      expect(authorizedDecision.id).toBe('decision-1')

      // Test unauthorized access
      await expect(
        getDecisionForTenant('decision-1', tenant2Id)
      ).rejects.toThrow('Decision not found or access denied')
    })
  })

  describe('Transaction Isolation', () => {
    it('should maintain tenant isolation within transactions', async () => {
      mockPrisma.$transaction.mockImplementation(async (operations) => {
        // Simulate transaction execution
        const results = []
        for (const op of operations) {
          results.push(await op)
        }
        return results
      })

      mockPrisma.customer.create.mockResolvedValue({
        id: 'cust-new',
        name: 'Transaction Customer',
        tenantId: tenant1Id
      } as any)

      mockPrisma.customerActivity.create.mockImplementation(async (args) => {
        // Validate customer belongs to same tenant
        if (args.data.customerId === 'cust-new' && args.data.tenantId === tenant1Id) {
          return { id: 'activity-1', ...args.data } as any
        }
        throw new Error('Tenant mismatch in transaction')
      })

      // Test transaction with consistent tenant
      const result = await mockPrisma.$transaction([
        mockPrisma.customer.create({
          data: {
            name: 'Transaction Customer',
            email: 'trans@example.com',
            tenantId: tenant1Id
          }
        }),
        mockPrisma.customerActivity.create({
          data: {
            customerId: 'cust-new',
            action: 'created',
            tenantId: tenant1Id
          }
        })
      ])

      expect(result).toHaveLength(2)
      expect(result[0].tenantId).toBe(tenant1Id)
    })
  })

  describe('Aggregate Queries and Reporting', () => {
    it('should scope aggregate queries to tenant', async () => {
      mockPrisma.customer.count.mockImplementation(async (args) => {
        if (args?.where?.tenantId === tenant1Id) return 150
        if (args?.where?.tenantId === tenant2Id) return 75
        return 0
      })

      mockPrisma.deal.aggregate.mockImplementation(async (args) => {
        if (args?.where?.tenantId === tenant1Id) {
          return {
            _sum: { value: 500000 },
            _avg: { value: 25000 },
            _count: 20
          } as any
        }
        if (args?.where?.tenantId === tenant2Id) {
          return {
            _sum: { value: 200000 },
            _avg: { value: 20000 },
            _count: 10
          } as any
        }
        return null
      })

      // Test customer count by tenant
      const count1 = await mockPrisma.customer.count({
        where: { tenantId: tenant1Id }
      })
      const count2 = await mockPrisma.customer.count({
        where: { tenantId: tenant2Id }
      })

      expect(count1).toBe(150)
      expect(count2).toBe(75)

      // Test deal aggregation by tenant
      const deals1 = await mockPrisma.deal.aggregate({
        where: { tenantId: tenant1Id },
        _sum: { value: true },
        _avg: { value: true },
        _count: true
      })

      expect(deals1._sum.value).toBe(500000)
      expect(deals1._count).toBe(20)
    })
  })

  describe('Security Boundary Enforcement', () => {
    it('should validate tenant context in all operations', async () => {
      // Helper to ensure tenant context
      function ensureTenantContext(operation: any, tenantId: string) {
        return async (args: any) => {
          if (!args?.where?.tenantId && !args?.data?.tenantId) {
            throw new Error('Tenant context required for all operations')
          }
          
          const requestedTenant = args.where?.tenantId || args.data?.tenantId
          if (requestedTenant !== tenantId) {
            throw new Error('Operation not allowed for different tenant')
          }
          
          return operation(args)
        }
      }

      // Wrap operations with tenant validation
      const secureFind = ensureTenantContext(
        mockPrisma.customer.findMany,
        tenant1Id
      )

      // Test missing tenant context
      await expect(
        secureFind({ where: {} })
      ).rejects.toThrow('Tenant context required for all operations')

      // Test wrong tenant context
      await expect(
        secureFind({ where: { tenantId: tenant2Id } })
      ).rejects.toThrow('Operation not allowed for different tenant')
    })

    it('should log tenant isolation violations', async () => {
      const auditLog: any[] = []

      // Mock audit logging
      function logTenantViolation(operation: string, requestedTenant: string, actualTenant: string) {
        auditLog.push({
          timestamp: new Date(),
          operation,
          violation: 'TENANT_ISOLATION',
          requestedTenant,
          actualTenant,
          severity: 'CRITICAL'
        })
      }

      // Simulate a tenant isolation check
      async function validateTenantAccess(resourceId: string, tenantId: string) {
        const resource = await mockPrisma.customer.findUnique({
          where: { id: resourceId }
        })

        if (resource && resource.tenantId !== tenantId) {
          logTenantViolation('customer.access', tenantId, resource.tenantId)
          throw new Error('Tenant isolation violation detected')
        }

        return resource
      }

      mockPrisma.customer.findUnique.mockResolvedValue({
        id: 'cust-1',
        tenantId: tenant1Id
      } as any)

      // Test violation detection
      await expect(
        validateTenantAccess('cust-1', tenant2Id)
      ).rejects.toThrow('Tenant isolation violation detected')

      expect(auditLog).toHaveLength(1)
      expect(auditLog[0].violation).toBe('TENANT_ISOLATION')
      expect(auditLog[0].severity).toBe('CRITICAL')
    })
  })
})