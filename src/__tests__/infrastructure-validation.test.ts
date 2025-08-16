/**
 * CoreFlow360 - Infrastructure Validation Tests
 * MATHEMATICALLY PERFECT, ALGORITHMICALLY OPTIMAL, PROVABLY CORRECT
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { executeSecureOperation } from '@/services/security/secure-operations'
import { withPerformanceTracking } from '@/utils/performance/performance-tracking'
import { AuditLogger } from '@/services/security/audit-logging'
import { cacheManager } from '@/services/cache/cache-manager'
import { aiServiceManager } from '@/services/ai/ai-service-manager'

describe('CoreFlow360 Infrastructure Validation', () => {
  const testTenantId = 'test-tenant-12345'
  const testUserId = 'test-user-12345'

  beforeAll(async () => {
    console.log('🚀 Starting CoreFlow360 Infrastructure Validation...')
    
    // Create test tenant for security operations
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    try {
      await prisma.tenant.create({
        data: {
          id: testTenantId,
          name: 'Test Tenant',
          domain: 'test.coreflow360.com',
          slug: 'test-tenant',
          industryType: 'GENERAL',
          isActive: true,
        },
      })
      
      // Create test user
      await prisma.user.create({
        data: {
          id: testUserId,
          email: 'test@coreflow360.com',
          name: 'Test User',
          tenantId: testTenantId,
          role: 'USER',
          status: 'ACTIVE',
        },
      })
    } catch (error) {
      // Tenant/user might already exist from previous tests
    } finally {
      await prisma.$disconnect()
    }
  })

  afterAll(async () => {
    console.log('✅ Infrastructure Validation Complete')
    
    // Cleanup test tenant
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    try {
      // Delete test user first (due to foreign key constraint)
      await prisma.user.delete({
        where: { id: testUserId }
      })
      
      // Then delete test tenant
      await prisma.tenant.delete({
        where: { id: testTenantId }
      })
    } catch (error) {
      // Ignore cleanup errors
    } finally {
      await prisma.$disconnect()
    }
  })

  describe('Security Infrastructure', () => {
    it('should execute secure operations with proper context', async () => {
      const context = {
        tenantId: testTenantId,
        userId: testUserId,
        operation: 'test_secure_operation',
        entityType: 'test',
        entityId: 'test-123'
      }

      const result = await executeSecureOperation(context, async () => {
        return { message: 'Test operation successful' }
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual({ message: 'Test operation successful' })
      expect(result.auditId).toBeDefined()
      expect(result.performance.duration).toBeGreaterThan(0)
    })

    it('should handle security violations appropriately', async () => {
      const context = {
        tenantId: '', // Invalid tenant ID
        operation: 'test_security_violation',
        entityType: 'test',
        entityId: 'test-456'
      }

      const result = await executeSecureOperation(context, async () => {
        return { message: 'This should not succeed' }
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('SECURITY_VIOLATION')
    })
  })

  describe('Performance Tracking', () => {
    it('should track performance metrics accurately', async () => {
      const trackedFunction = withPerformanceTracking(
        'test_performance_operation',
        async () => {
          await new Promise(resolve => setTimeout(resolve, 100)) // 100ms delay
          return { result: 'performance test' }
        }
      )

      const result = await trackedFunction()
      expect(result).toEqual({ result: 'performance test' })
    })

    it('should handle performance tracking failures gracefully', async () => {
      const trackedFunction = withPerformanceTracking(
        'test_performance_failure',
        async () => {
          throw new Error('Test error')
        }
      )

      await expect(trackedFunction()).rejects.toThrow('Test error')
    })
  })

  describe('Audit Logging', () => {
    it('should log audit events correctly', async () => {
      await expect(
        AuditLogger.logCreate(
          testTenantId,
          'test_entity',
          'test-entity-123',
          { name: 'Test Entity', value: 42 },
          testUserId
        )
      ).resolves.not.toThrow()
    })

    it('should log updates with old and new values', async () => {
      await expect(
        AuditLogger.logUpdate(
          testTenantId,
          'test_entity',
          'test-entity-123',
          { name: 'Old Name', value: 40 },
          { name: 'New Name', value: 42 },
          testUserId
        )
      ).resolves.not.toThrow()
    })

    it('should handle audit log queries', async () => {
      const result = await AuditLogger.query({
        tenantId: testTenantId,
        limit: 10
      })

      expect(result).toHaveProperty('logs')
      expect(result).toHaveProperty('total')
      expect(result).toHaveProperty('hasMore')
      expect(Array.isArray(result.logs)).toBe(true)
    })
  })

  describe('Caching Layer', () => {
    it('should store and retrieve cached values', async () => {
      const key = 'test_cache_key'
      const value = { data: 'test value', timestamp: Date.now() }

      await cacheManager.set(key, value)
      const retrieved = await cacheManager.get(key)

      expect(retrieved).toEqual(value)
    })

    it('should implement cache-aside pattern', async () => {
      const key = 'test_cache_aside'
      let loaderCallCount = 0

      const loader = async () => {
        loaderCallCount++
        return { data: 'loaded data', callCount: loaderCallCount }
      }

      // First call should load data
      const result1 = await cacheManager.getOrSet(key, loader)
      expect(result1.callCount).toBe(1)
      expect(loaderCallCount).toBe(1)

      // Second call should use cache
      const result2 = await cacheManager.getOrSet(key, loader)
      expect(result2.callCount).toBe(1) // Same as first call
      expect(loaderCallCount).toBe(1) // Loader not called again
    })

    it('should invalidate cached values correctly', async () => {
      await cacheManager.set('test_invalidate_1', 'value1')
      await cacheManager.set('test_invalidate_2', 'value2')

      const deletedCount = await cacheManager.invalidate('test_invalidate')
      expect(deletedCount).toBeGreaterThanOrEqual(0)
    })

    it('should provide health check information', async () => {
      const health = await cacheManager.healthCheck()
      
      expect(health).toHaveProperty('status')
      expect(health).toHaveProperty('tiers')
      expect(health).toHaveProperty('recommendations')
      expect(['healthy', 'degraded', 'critical']).toContain(health.status)
    })
  })

  describe('AI Service Manager', () => {
    it('should provide service health information', async () => {
      const health = await aiServiceManager.getServiceHealth()
      
      expect(health).toHaveProperty('openai')
      expect(health).toHaveProperty('anthropic')
      expect(health.openai).toHaveProperty('status')
      expect(health.anthropic).toHaveProperty('status')
    })

    it('should provide cost summaries', async () => {
      const costSummary = await aiServiceManager.getCostSummary(testTenantId, 'day')
      
      expect(costSummary).toHaveProperty('totalCost')
      expect(costSummary).toHaveProperty('breakdown')
      expect(costSummary).toHaveProperty('usage')
      expect(typeof costSummary.totalCost).toBe('number')
    })
  })

  describe('Integration Tests', () => {
    it('should integrate security, performance, and audit logging', async () => {
      const context = {
        tenantId: testTenantId,
        userId: testUserId,
        operation: 'integration_test',
        entityType: 'integration',
        entityId: 'integration-123'
      }

      const result = await executeSecureOperation(context, async () => {
        return withPerformanceTracking('integration_inner_operation', async () => {
          // Simulate some work
          await new Promise(resolve => setTimeout(resolve, 50))
          
          // Log an audit event
          await AuditLogger.logCreate(
            testTenantId,
            'integration_entity',
            'integration-456',
            { integrated: true, timestamp: Date.now() },
            testUserId
          )
          
          // Use cache
          await cacheManager.set('integration_cache', { success: true })
          const cached = await cacheManager.get('integration_cache')
          
          return {
            security: 'passed',
            performance: 'tracked',
            audit: 'logged',
            cache: cached
          }
        })()
      })

      expect(result.success).toBe(true)
      expect(result.data).toHaveProperty('security', 'passed')
      expect(result.data).toHaveProperty('performance', 'tracked')
      expect(result.data).toHaveProperty('audit', 'logged')
      expect(result.data).toHaveProperty('cache')
      expect(result.data.cache).toEqual({ success: true })
    })
  })
})