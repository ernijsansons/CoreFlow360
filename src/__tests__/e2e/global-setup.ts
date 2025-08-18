/**
 * CoreFlow360 - E2E Global Setup
 * Prepares test environment before running E2E tests
 */

import { chromium, FullConfig } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import { testConfig } from '@/test-config'

const prisma = new PrismaClient()

async function globalSetup(config: FullConfig) {
  console.log('🔧 Setting up E2E test environment...')

  try {
    // Clean up test data from previous runs
    await cleanupTestData()

    // Seed test data
    await seedTestData()

    // Verify the application is running
    if (config.webServer) {
      console.log('✅ Web server will be started by Playwright')
    } else {
      // Verify the app is accessible
      const browser = await chromium.launch()
      const page = await browser.newPage()
      
      try {
        const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'
        await page.goto(baseURL, { waitUntil: 'networkidle' })
        console.log('✅ Application is accessible')
      } catch (error) {
        console.error('❌ Application is not accessible:', error)
        throw error
      } finally {
        await browser.close()
      }
    }

    console.log('✅ E2E setup completed successfully')
  } catch (error) {
    console.error('❌ E2E setup failed:', error)
    throw error
  }
}

async function cleanupTestData() {
  console.log('🧹 Cleaning up test data...')

  try {
    // Delete test users and related data
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: '@example.com'
        }
      }
    })

    // Delete test tenants
    await prisma.tenant.deleteMany({
      where: {
        name: {
          contains: 'Test Company'
        }
      }
    })

    // Delete test audit logs
    await prisma.auditLog.deleteMany({
      where: {
        metadata: {
          contains: 'e2e-test'
        }
      }
    })

    console.log('✅ Test data cleanup completed')
  } catch (error) {
    console.warn('⚠️  Test data cleanup failed (this is usually fine):', error.message)
  }
}

async function seedTestData() {
  console.log('🌱 Seeding test data...')

  try {
    // Create demo users for testing if they don't exist
    const demoUsers = [
      {
        email: 'super@coreflow360.com',
        name: 'Super Admin',
        role: 'SUPER_ADMIN',
        password: testConfig.auth.demoPassword
      },
      {
        email: 'admin@coreflow360.com',
        name: 'Admin User',
        role: 'ADMIN',
        password: testConfig.auth.demoPassword
      },
      {
        email: 'manager@coreflow360.com',
        name: 'Manager User',
        role: 'MANAGER',
        password: testConfig.auth.demoPassword
      },
      {
        email: 'user@coreflow360.com',
        name: 'Regular User',
        role: 'USER',
        password: testConfig.auth.demoPassword
      }
    ]

    // Check if demo tenant exists
    let demoTenant = await prisma.tenant.findFirst({
      where: { slug: 'demo' }
    })

    if (!demoTenant) {
      // Create demo tenant
      demoTenant = await prisma.tenant.create({
        data: {
          name: 'Demo Corporation',
          domain: 'demo.coreflow360.com',
          slug: 'demo',
          industryType: 'GENERAL',
          subscriptionStatus: 'ACTIVE',
          enabledModules: JSON.stringify({ crm: true, accounting: true, hr: true })
        }
      })

      // Create default department
      await prisma.department.create({
        data: {
          name: 'Administration',
          code: 'ADMIN',
          tenantId: demoTenant.id
        }
      })
    }

    const department = await prisma.department.findFirst({
      where: { tenantId: demoTenant.id }
    })

    // Create demo users
    for (const userData of demoUsers) {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      })

      if (!existingUser) {
        // Hash password (using bcrypt in production)
        const bcrypt = await import('bcryptjs')
        const hashedPassword = await bcrypt.hash(userData.password, 12)

        await prisma.user.create({
          data: {
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            role: userData.role as any,
            status: 'ACTIVE',
            tenantId: demoTenant.id,
            departmentId: department?.id,
            permissions: JSON.stringify([
              'tenant:read',
              'users:read',
              'customers:*',
              'deals:*'
            ])
          }
        })
      }
    }

    // Create demo subscription
    const existingSubscription = await prisma.tenantSubscription.findUnique({
      where: { tenantId: demoTenant.id }
    })

    if (!existingSubscription) {
      await prisma.tenantSubscription.create({
        data: {
          tenantId: demoTenant.id,
          subscriptionTier: 'professional',
          subscriptionStatus: 'ACTIVE',
          activeModules: JSON.stringify({ crm: true, accounting: true, hr: true }),
          userCount: 50,
          billingCycle: 'monthly',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      })
    }

    console.log('✅ Test data seeding completed')
  } catch (error) {
    console.error('❌ Test data seeding failed:', error)
    throw error
  }
}

export default globalSetup