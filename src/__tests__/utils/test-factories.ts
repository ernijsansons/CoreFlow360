/**
 * CoreFlow360 - Test Data Factories
 * Centralized test data generation for consistent testing
 */

import { faker } from '@faker-js/faker'

// Core entity factories
export const TestFactories = {
  // User Factory
  user: {
    create: (overrides: any = {}) => ({
      id: faker.string.uuid(),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      role: 'USER',
      tenantId: faker.string.uuid(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    }),

    admin: (overrides: any = {}) => ({
      ...TestFactories.user.create(),
      role: 'ADMIN',
      ...overrides
    }),

    superAdmin: (overrides: any = {}) => ({
      ...TestFactories.user.create(),
      role: 'SUPER_ADMIN',
      ...overrides
    })
  },

  // Tenant Factory
  tenant: {
    create: (overrides: any = {}) => ({
      id: faker.string.uuid(),
      name: faker.company.name(),
      slug: faker.lorem.slug(),
      industryType: 'GENERAL',
      subscriptionTier: 'INTELLIGENT',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    }),

    hvac: (overrides: any = {}) => ({
      ...TestFactories.tenant.create(),
      name: `${faker.company.name()} HVAC Services`,
      industryType: 'HVAC',
      ...overrides
    }),

    enterprise: (overrides: any = {}) => ({
      ...TestFactories.tenant.create(),
      subscriptionTier: 'AUTONOMOUS',
      ...overrides
    })
  },

  // Customer Factory
  customer: {
    create: (overrides: any = {}) => ({
      id: faker.string.uuid(),
      tenantId: faker.string.uuid(),
      name: faker.company.name(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zipCode: faker.location.zipCode(),
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    }),

    withDeals: (dealCount: number = 3, overrides: any = {}) => {
      const customer = TestFactories.customer.create(overrides)
      return {
        ...customer,
        deals: Array.from({ length: dealCount }, () => 
          TestFactories.deal.create({ customerId: customer.id })
        )
      }
    }
  },

  // Deal Factory
  deal: {
    create: (overrides: any = {}) => ({
      id: faker.string.uuid(),
      tenantId: faker.string.uuid(),
      customerId: faker.string.uuid(),
      title: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      value: parseFloat(faker.commerce.price({ min: 1000, max: 100000 })),
      stage: 'PROSPECTING',
      probability: faker.number.int({ min: 10, max: 90 }),
      expectedCloseDate: faker.date.future(),
      assignedUserId: faker.string.uuid(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    }),

    won: (overrides: any = {}) => ({
      ...TestFactories.deal.create(),
      stage: 'WON',
      probability: 100,
      closedAt: new Date(),
      ...overrides
    }),

    lost: (overrides: any = {}) => ({
      ...TestFactories.deal.create(),
      stage: 'LOST',
      probability: 0,
      closedAt: new Date(),
      ...overrides
    })
  },

  // Invoice Factory
  invoice: {
    create: (overrides: any = {}) => ({
      id: faker.string.uuid(),
      tenantId: faker.string.uuid(),
      customerId: faker.string.uuid(),
      invoiceNumber: `INV-${faker.number.int({ min: 1000, max: 9999 })}`,
      amount: parseFloat(faker.commerce.price({ min: 100, max: 10000 })),
      tax: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
      total: 0, // Will be calculated
      status: 'DRAFT',
      issueDate: new Date(),
      dueDate: faker.date.future(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    }),

    paid: (overrides: any = {}) => ({
      ...TestFactories.invoice.create(),
      status: 'PAID',
      paidAt: new Date(),
      ...overrides
    }),

    overdue: (overrides: any = {}) => ({
      ...TestFactories.invoice.create(),
      status: 'OVERDUE',
      dueDate: faker.date.past(),
      ...overrides
    })
  },

  // Project Factory
  project: {
    create: (overrides: any = {}) => ({
      id: faker.string.uuid(),
      tenantId: faker.string.uuid(),
      name: faker.company.buzzPhrase(),
      description: faker.lorem.paragraph(),
      status: 'ACTIVE',
      startDate: faker.date.past(),
      endDate: faker.date.future(),
      budget: parseFloat(faker.commerce.price({ min: 5000, max: 500000 })),
      managerId: faker.string.uuid(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    }),

    completed: (overrides: any = {}) => ({
      ...TestFactories.project.create(),
      status: 'COMPLETED',
      endDate: faker.date.past(),
      ...overrides
    })
  },

  // Employee Factory
  employee: {
    create: (overrides: any = {}) => ({
      id: faker.string.uuid(),
      tenantId: faker.string.uuid(),
      userId: faker.string.uuid(),
      employeeId: faker.string.alphanumeric(8).toUpperCase(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      department: 'OPERATIONS',
      position: faker.person.jobTitle(),
      salary: faker.number.int({ min: 30000, max: 150000 }),
      hireDate: faker.date.past(),
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    }),

    hvacTechnician: (overrides: any = {}) => ({
      ...TestFactories.employee.create(),
      department: 'HVAC_OPERATIONS',
      position: 'HVAC Technician',
      ...overrides
    }),

    manager: (overrides: any = {}) => ({
      ...TestFactories.employee.create(),
      department: 'MANAGEMENT',
      position: 'Department Manager',
      salary: faker.number.int({ min: 70000, max: 200000 }),
      ...overrides
    })
  },

  // AI Analysis Factory
  aiAnalysis: {
    create: (overrides: any = {}) => ({
      id: faker.string.uuid(),
      tenantId: faker.string.uuid(),
      entityId: faker.string.uuid(),
      entityType: 'CUSTOMER',
      analysisType: 'RISK_ASSESSMENT',
      confidence: faker.number.float({ min: 0.5, max: 1.0, precision: 0.01 }),
      insights: [
        faker.lorem.sentence(),
        faker.lorem.sentence(),
        faker.lorem.sentence()
      ],
      recommendations: [
        faker.lorem.sentence(),
        faker.lorem.sentence()
      ],
      metadata: {
        model: 'gpt-4',
        processingTime: faker.number.int({ min: 500, max: 5000 }),
        tokensUsed: faker.number.int({ min: 100, max: 2000 })
      },
      createdAt: new Date(),
      ...overrides
    }),

    businessIntelligence: (overrides: any = {}) => ({
      ...TestFactories.aiAnalysis.create(),
      analysisType: 'BUSINESS_INTELLIGENCE',
      insights: [
        'Revenue growth opportunity identified in Q4',
        'Customer retention rate trending upward',
        'Operational efficiency improved by 15%'
      ],
      ...overrides
    })
  },

  // Monitoring Alert Factory
  monitoringAlert: {
    create: (overrides: any = {}) => ({
      id: faker.string.uuid(),
      alertId: `alert_${faker.number.int({ min: 1000, max: 9999 })}`,
      name: faker.lorem.words(3),
      severity: 'medium',
      metric: 'cpu.usage',
      value: faker.number.float({ min: 0, max: 100, precision: 0.1 }),
      threshold: faker.number.float({ min: 50, max: 95, precision: 0.1 }),
      context: JSON.stringify({
        server: faker.internet.domainName(),
        timestamp: new Date().toISOString()
      }),
      resolved: false,
      timestamp: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    }),

    critical: (overrides: any = {}) => ({
      ...TestFactories.monitoringAlert.create(),
      severity: 'critical',
      value: faker.number.float({ min: 95, max: 100, precision: 0.1 }),
      ...overrides
    }),

    resolved: (overrides: any = {}) => ({
      ...TestFactories.monitoringAlert.create(),
      resolved: true,
      resolvedAt: new Date(),
      ...overrides
    })
  }
}

// Batch creation utilities
export const createMultiple = <T>(factory: () => T, count: number): T[] => {
  return Array.from({ length: count }, factory)
}

// Realistic data scenarios
export const TestScenarios = {
  // A complete business setup
  smallBusiness: () => {
    const tenant = TestFactories.tenant.create({ 
      subscriptionTier: 'INTELLIGENT',
      name: 'Acme HVAC Solutions' 
    })
    
    const owner = TestFactories.user.admin({ tenantId: tenant.id })
    const employees = createMultiple(
      () => TestFactories.employee.hvacTechnician({ tenantId: tenant.id }), 
      3
    )
    
    const customers = createMultiple(
      () => TestFactories.customer.create({ tenantId: tenant.id }), 
      10
    )
    
    const deals = customers.flatMap(customer => 
      createMultiple(() => TestFactories.deal.create({ 
        tenantId: tenant.id, 
        customerId: customer.id 
      }), faker.number.int({ min: 0, max: 3 }))
    )

    return { tenant, owner, employees, customers, deals }
  },

  // Enterprise setup with multiple departments
  enterpriseBusiness: () => {
    const tenant = TestFactories.tenant.enterprise({
      name: 'Global Manufacturing Corp'
    })
    
    const departments = ['SALES', 'OPERATIONS', 'FINANCE', 'HR', 'IT']
    const employees = departments.flatMap(dept => 
      createMultiple(() => TestFactories.employee.create({ 
        tenantId: tenant.id,
        department: dept 
      }), faker.number.int({ min: 5, max: 15 }))
    )
    
    const customers = createMultiple(
      () => TestFactories.customer.create({ tenantId: tenant.id }), 
      50
    )
    
    const projects = createMultiple(
      () => TestFactories.project.create({ tenantId: tenant.id }), 
      20
    )

    return { tenant, employees, customers, projects }
  },

  // Multi-tenant scenario for testing isolation
  multiTenant: () => {
    const tenants = createMultiple(() => TestFactories.tenant.create(), 3)
    
    const tenantsWithData = tenants.map(tenant => ({
      tenant,
      users: createMultiple(() => TestFactories.user.create({ tenantId: tenant.id }), 5),
      customers: createMultiple(() => TestFactories.customer.create({ tenantId: tenant.id }), 10),
      deals: createMultiple(() => TestFactories.deal.create({ tenantId: tenant.id }), 15)
    }))

    return tenantsWithData
  }
}

// Reset faker seed for deterministic tests
export const resetFaker = (seed?: number) => {
  faker.seed(seed || 12345)
}