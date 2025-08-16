/**
 * CoreFlow360 - Authentication Flow Integration Test
 * Tests the complete registration -> login -> orchestration flow
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const prisma = new PrismaClient()

describe('Authentication Flow Integration', () => {
  let testTenantId: string
  let testUserId: string
  const testEmail = 'test@example.com'
  const testPassword = 'testpassword123'
  const testCompany = 'Test Company'

  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.user.deleteMany({ where: { email: testEmail } })
    await prisma.tenant.deleteMany({ where: { name: testCompany } })
  })

  afterAll(async () => {
    // Clean up test data
    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } }).catch(() => {})
    }
    if (testTenantId) {
      await prisma.tenant.delete({ where: { id: testTenantId } }).catch(() => {})
    }
    await prisma.$disconnect()
  })

  it('should create tenant and user via registration endpoint', async () => {
    // Simulate the registration process
    const hashedPassword = await bcryptjs.hash(testPassword, 12)
    
    // Generate unique slug
    const baseSlug = testCompany.toLowerCase().replace(/[^a-z0-9]/g, '-')
    let slug = baseSlug
    let counter = 1
    
    while (await prisma.tenant.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Create tenant and user in transaction (simulating API behavior)
    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: testCompany,
          domain: `${slug}.coreflow360.com`,
          slug,
          industryType: 'GENERAL',
          subscriptionStatus: 'TRIAL',
          enabledModules: JSON.stringify({ crm: true }),
        }
      })

      const department = await tx.department.create({
        data: {
          name: 'Administration',
          code: 'ADMIN',
          tenantId: tenant.id
        }
      })

      const user = await tx.user.create({
        data: {
          email: testEmail,
          name: 'Test User',
          password: hashedPassword,
          tenantId: tenant.id,
          departmentId: department.id,
          role: 'ADMIN',
          status: 'ACTIVE',
          permissions: JSON.stringify([
            'tenant:read', 'tenant:update',
            'users:read', 'users:create', 'users:update',
            'customers:*', 'deals:*', 'projects:*',
            'reports:read'
          ])
        }
      })

      // Create legacy subscription for compatibility
      await tx.legacyTenantSubscription.create({
        data: {
          tenantId: tenant.id,
          subscriptionTier: 'trial',
          activeModules: JSON.stringify({ crm: true }),
          status: 'active',
          userCount: 1,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          nextBillingDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          billingCycle: 'monthly'
        }
      })

      return { tenant, user, department }
    })

    expect(result.tenant.name).toBe(testCompany)
    expect(result.user.email).toBe(testEmail)
    expect(result.user.role).toBe('ADMIN')

    testTenantId = result.tenant.id
    testUserId = result.user.id
  })

  it('should validate user credentials for login', async () => {
    // Find user with tenant
    const user = await prisma.user.findFirst({
      where: { email: testEmail },
      include: { tenant: true, department: true }
    })

    expect(user).toBeTruthy()
    expect(user!.tenant.name).toBe(testCompany)
    expect(user!.status).toBe('ACTIVE')

    // Verify password
    const isPasswordValid = await bcryptjs.compare(testPassword, user!.password!)
    expect(isPasswordValid).toBe(true)

    // Check tenant is active
    expect(user!.tenant.isActive).toBe(true)
  })

  it('should have proper subscription setup', async () => {
    // Check legacy subscription exists
    const legacySubscription = await prisma.legacyTenantSubscription.findUnique({
      where: { tenantId: testTenantId }
    })

    expect(legacySubscription).toBeTruthy()
    expect(legacySubscription!.subscriptionTier).toBe('trial')
    expect(legacySubscription!.status).toBe('active')

    const activeModules = JSON.parse(legacySubscription!.activeModules)
    expect(activeModules.crm).toBe(true)
  })

  it('should validate module manager functionality', async () => {
    // Import the module manager
    const { moduleManager } = await import('@/services/subscription/module-manager')

    // Check if CRM module is active
    const isCrmActive = await moduleManager.isModuleActive(testTenantId, 'crm')
    expect(isCrmActive).toBe(true)

    // Get active modules
    const activeModules = await moduleManager.getActiveModules(testTenantId)
    expect(activeModules).toContain('crm')

    // Test module capabilities
    const capabilities = await moduleManager.getModuleCapabilities(testTenantId, 'crm')
    expect(capabilities).toBeTruthy()
  })

  it('should handle subscription-aware orchestration', async () => {
    // Import the orchestrator
    const { SubscriptionAwareAIOrchestrator } = await import('@/ai/orchestration/subscription-aware-orchestrator')

    const mockLangChain = {}
    const mockAIService = {}
    const mockAuditLogger = { log: () => {} }
    const mockRedis = {}

    const orchestrator = new SubscriptionAwareAIOrchestrator(
      mockLangChain,
      mockAIService,
      mockAuditLogger,
      prisma,
      mockRedis
    )

    // Test orchestration request
    const request = {
      tenantId: testTenantId,
      taskType: 'ANALYZE_CUSTOMER' as any,
      input: { customerId: 'test-customer' },
      context: { userId: testUserId },
      requirements: { maxExecutionTime: 30000 },
      userId: testUserId
    }

    const result = await orchestrator.orchestrateWithSubscriptionAwareness(request)
    
    expect(result).toBeTruthy()
    expect(result.executionMetadata.subscriptionTier).toBe('trial')
    expect(result.executionMetadata.activeModules).toContain('crm')
  })

  it('should handle user permissions correctly', async () => {
    const user = await prisma.user.findUnique({
      where: { id: testUserId }
    })

    const permissions = JSON.parse(user!.permissions || '[]')
    expect(permissions).toContain('tenant:read')
    expect(permissions).toContain('customers:*')

    // Test permission checking logic (would normally be in auth middleware)
    const hasCustomerAccess = permissions.some((p: string) => 
      p === 'customers:*' || p === 'customers:read'
    )
    expect(hasCustomerAccess).toBe(true)
  })

  it('should create audit log entries', async () => {
    // Check if audit log was created during registration
    const auditLog = await prisma.auditLog.findFirst({
      where: {
        tenantId: testTenantId,
        userId: testUserId,
        action: 'CREATE'
      }
    })

    expect(auditLog).toBeTruthy()
    expect(auditLog!.entityType).toBe('tenant')
  })

  it('should validate session data structure', async () => {
    // Simulate what the session would contain
    const user = await prisma.user.findUnique({
      where: { id: testUserId },
      include: { tenant: true }
    })

    const sessionUser = {
      id: user!.id,
      email: user!.email,
      name: user!.name,
      tenantId: user!.tenantId,
      role: user!.role,
      departmentId: user!.departmentId,
      permissions: JSON.parse(user!.permissions || '[]')
    }

    expect(sessionUser.id).toBeTruthy()
    expect(sessionUser.tenantId).toBe(testTenantId)
    expect(sessionUser.role).toBe('ADMIN')
    expect(Array.isArray(sessionUser.permissions)).toBe(true)
  })
})