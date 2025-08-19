/**
 * CoreFlow360 - E2E Global Teardown
 * Cleans up test environment after E2E tests
 */

import { FullConfig } from '@playwright/test'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function globalTeardown(config: FullConfig) {
  // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // console.log('🧹 Cleaning up E2E test environment...')

  try {
    // Clean up test data created during tests
    await cleanupTestData()

    // Close database connection
    await prisma.$disconnect()

    // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // console.log('✅ E2E teardown completed successfully')
  } catch (error) {
    console.error('❌ E2E teardown failed:', error)
    // Don't throw to avoid failing the test suite
  }
}

async function cleanupTestData() {
  try {
    // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // console.log('🗑️  Removing test data...')

    // Delete test users (those created during tests)
    const testEmails = ['test@example.com', 'test-ai@example.com', 'e2e-test@example.com']

    for (const email of testEmails) {
      const user = await prisma.user.findUnique({ where: { email } })
      if (user) {
        // Delete user's audit logs first
        await prisma.auditLog.deleteMany({
          where: { userId: user.id },
        })

        // Delete the user
        await prisma.user.delete({
          where: { id: user.id },
        })

        // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // console.log(`  Deleted test user: ${email}`)
      }
    }

    // Delete test tenants created during tests
    const testTenants = await prisma.tenant.findMany({
      where: {
        OR: [
          { name: { contains: 'Test Company' } },
          { name: { contains: 'AI Test Company' } },
          { name: { contains: 'E2E Test' } },
        ],
      },
    })

    for (const tenant of testTenants) {
      // Delete tenant's subscriptions
      await prisma.tenantSubscription.deleteMany({
        where: { tenantId: tenant.id },
      })

      // Delete tenant's departments
      await prisma.department.deleteMany({
        where: { tenantId: tenant.id },
      })

      // Delete tenant's audit logs
      await prisma.auditLog.deleteMany({
        where: { tenantId: tenant.id },
      })

      // Delete the tenant
      await prisma.tenant.delete({
        where: { id: tenant.id },
      })

      // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // console.log(`  Deleted test tenant: ${tenant.name}`)
    }

    // Clean up any orphaned test data
    await prisma.auditLog.deleteMany({
      where: {
        OR: [
          { metadata: { contains: 'e2e-test' } },
          { metadata: { contains: 'playwright' } },
          { metadata: { contains: 'test-' } },
        ],
      },
    })

    // Clean up AI activities from tests
    await prisma.aIActivity.deleteMany({
      where: {
        metadata: { contains: 'test' },
      },
    })

    // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // console.log('✅ Test data cleanup completed')
  } catch (error) {
    console.warn('⚠️  Test data cleanup encountered issues:', error.message)
    // Continue with teardown even if cleanup fails
  }
}

export default globalTeardown
