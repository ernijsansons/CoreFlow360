/**
 * CoreFlow360 - Database Seeding Script
 * Seeds the database with module definitions, pricing tiers, and business data
 */

import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding CoreFlow360 database...')

  // Clear existing data
  await prisma.auditLog.deleteMany()
  await prisma.usageMetric.deleteMany()
  await prisma.subscriptionInvoice.deleteMany()
  await prisma.tenantSubscription.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.saaSSubscription.deleteMany()
  await prisma.saaSUsageMetric.deleteMany()
  await prisma.bundle.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.project.deleteMany()
  await prisma.deal.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.workOrder.deleteMany()
  await prisma.serviceContract.deleteMany()
  await prisma.maintenanceLog.deleteMany()
  await prisma.equipment.deleteMany()
  await prisma.department.deleteMany()
  await prisma.user.deleteMany()
  await prisma.tenant.deleteMany()

  // Create test tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Test Company',
      slug: 'test-company',
      industryType: 'GENERAL',
      settings: '{}',
      metadata: '{}',
      isActive: true
    }
  })

  // Create department
  const department = await prisma.department.create({
    data: {
      name: 'Administration',
      description: 'Administrative department',
      tenantId: tenant.id
    }
  })

  // Hash password for test users
  const hashedPassword = await bcryptjs.hash('password123', 12)

  // Create super admin user
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@coreflow360.com',
      name: 'Super Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      isActive: true,
      tenantId: tenant.id,
      departmentId: department.id,
      permissions: JSON.stringify(['*']),
      avatar: null
    }
  })

  // Create test admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@test.com',
      name: 'Test Admin',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      isActive: true,
      tenantId: tenant.id,
      departmentId: department.id,
      permissions: JSON.stringify(['users:read', 'users:write', 'customers:*', 'deals:*']),
      avatar: null
    }
  })

  // Create test regular user
  const regularUser = await prisma.user.create({
    data: {
      email: 'user@test.com',
      name: 'Test User',
      password: hashedPassword,
      role: 'USER',
      status: 'ACTIVE',
      isActive: true,
      tenantId: tenant.id,
      departmentId: department.id,
      permissions: JSON.stringify(['customers:read', 'deals:read']),
      avatar: null
    }
  })

  // Create bundles
  const crmBundle = await prisma.bundle.create({
    data: {
      name: 'CRM Bundle',
      description: 'Customer Relationship Management',
      tier: 'professional',
      category: 'crm',
      basePrice: 99.0,
      perUserPrice: 25.0,
      features: JSON.stringify(['contact_management', 'deal_tracking', 'email_integration']),
      limits: JSON.stringify({ 'contacts': 10000, 'deals': 1000, 'emails': 10000 }),
      aiCapabilities: JSON.stringify(['lead_scoring', 'deal_prediction', 'email_automation'])
    }
  })

  const accountingBundle = await prisma.bundle.create({
    data: {
      name: 'Accounting Bundle',
      description: 'Financial Management & Accounting',
      tier: 'professional',
      category: 'accounting',
      basePrice: 149.0,
      perUserPrice: 35.0,
      features: JSON.stringify(['general_ledger', 'accounts_payable', 'accounts_receivable', 'financial_reporting']),
      limits: JSON.stringify({ 'transactions': 50000, 'reports': 1000, 'users': 50 }),
      aiCapabilities: JSON.stringify(['expense_categorization', 'fraud_detection', 'cash_flow_prediction'])
    }
  })

  const projectsBundle = await prisma.bundle.create({
    data: {
      name: 'Projects Bundle',
      description: 'Project Management & Collaboration',
      tier: 'professional',
      category: 'projects',
      basePrice: 79.0,
      perUserPrice: 20.0,
      features: JSON.stringify(['task_management', 'time_tracking', 'resource_allocation', 'project_reporting']),
      limits: JSON.stringify({ 'projects': 100, 'tasks': 10000, 'team_members': 100 }),
      aiCapabilities: JSON.stringify(['project_timeline_optimization', 'resource_optimization', 'risk_assessment'])
    }
  })

  const enterpriseBundle = await prisma.bundle.create({
    data: {
      name: 'Enterprise Suite',
      description: 'Complete ERP Solution',
      tier: 'enterprise',
      category: 'erp',
      basePrice: 499.0,
      perUserPrice: 50.0,
      features: JSON.stringify(['crm', 'accounting', 'projects', 'inventory', 'hr', 'manufacturing']),
      limits: JSON.stringify({ 'users': 1000, 'data_storage': 'unlimited', 'api_calls': 1000000 }),
      aiCapabilities: JSON.stringify(['predictive_analytics', 'process_automation', 'intelligent_reporting', 'custom_ai_models'])
    }
  })

  console.log('✅ Database seeded successfully!')
  console.log(`Created tenant: ${tenant.name}`)
  console.log(`Created users:`)
  console.log(`  - Super Admin: admin@coreflow360.com (password: password123)`)
  console.log(`  - Admin: admin@test.com (password: password123)`)
  console.log(`  - User: user@test.com (password: password123)`)
  console.log(`Created ${4} bundles`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })