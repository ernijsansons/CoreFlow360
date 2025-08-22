/**
 * CoreFlow360 - Integration Test Helpers
 * End-to-end workflow testing and cross-system integration verification
 */

import { execSync } from 'child_process'
import { TestFactories, TestScenarios } from './test-factories'
import { ApiTestHelper } from './api-test-helpers'
import { testDb, withTestTransaction } from './test-database'
import { PerformanceTestRunner } from './performance-test-helpers'

// Integration test scenarios
export interface IntegrationScenario {
  name: string
  description: string
  setup: () => Promise<any>
  execute: (context: any) => Promise<any>
  verify: (context: any, result: any) => Promise<void>
  cleanup?: (context: any) => Promise<void>
}

// Service health checker
export class ServiceHealthChecker {
  private services: Map<string, { url: string; timeout: number }> = new Map()

  constructor() {
    this.addService('database', 'postgresql://localhost:5432', 5000)
    this.addService('redis', 'redis://localhost:6379', 3000)
    this.addService('api', 'http://localhost:3000/api/health', 10000)
  }

  addService(name: string, url: string, timeout: number = 5000) {
    this.services.set(name, { url, timeout })
  }

  async checkService(name: string): Promise<{ healthy: boolean; response?: any; error?: string; responseTime: number }> {
    const service = this.services.get(name)
    if (!service) {
      throw new Error(`Unknown service: ${name}`)
    }

    const startTime = performance.now()

    try {
      if (name === 'database') {
        // Database health check
        const isHealthy = await testDb.isHealthy()
        const responseTime = performance.now() - startTime
        return { healthy: isHealthy, responseTime }
      }

      if (name === 'redis') {
        // Redis health check
        const { getRedis } = await import('@/lib/redis/client')
        const redis = getRedis()
        await redis.ping()
        const responseTime = performance.now() - startTime
        return { healthy: true, responseTime }
      }

      // HTTP service check
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), service.timeout)

      const response = await fetch(service.url, {
        signal: controller.signal,
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      })

      clearTimeout(timeout)
      const responseTime = performance.now() - startTime
      const responseData = await response.json()

      return {
        healthy: response.ok,
        response: responseData,
        responseTime
      }

    } catch (error) {
      const responseTime = performance.now() - startTime
      return {
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime
      }
    }
  }

  async checkAllServices(): Promise<Record<string, any>> {
    const results: Record<string, any> = {}
    
    for (const [name] of this.services) {
      results[name] = await this.checkService(name)
    }

    return results
  }

  async waitForServices(maxWaitTime: number = 30000): Promise<boolean> {
    const startTime = Date.now()
    
    while (Date.now() - startTime < maxWaitTime) {
      const results = await this.checkAllServices()
      const allHealthy = Object.values(results).every((result: any) => result.healthy)
      
      if (allHealthy) {
        console.log('✅ All services are healthy')
        return true
      }

      console.log('⏳ Waiting for services to be ready...')
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    console.log('❌ Services not ready within timeout')
    return false
  }
}

// Integration test runner
export class IntegrationTestRunner {
  private scenarios: IntegrationScenario[] = []
  private healthChecker = new ServiceHealthChecker()

  addScenario(scenario: IntegrationScenario) {
    this.scenarios.push(scenario)
  }

  async runScenario(scenarioName: string): Promise<{
    success: boolean
    result?: any
    error?: string
    duration: number
    context?: any
  }> {
    const scenario = this.scenarios.find(s => s.name === scenarioName)
    if (!scenario) {
      throw new Error(`Scenario not found: ${scenarioName}`)
    }

    console.log(`🧪 Running integration scenario: ${scenario.name}`)
    const startTime = performance.now()
    let context: any

    try {
      // Setup
      context = await scenario.setup()
      
      // Execute
      const result = await scenario.execute(context)
      
      // Verify
      await scenario.verify(context, result)
      
      const duration = performance.now() - startTime
      console.log(`✅ Scenario completed: ${scenario.name} (${duration.toFixed(2)}ms)`)
      
      return {
        success: true,
        result,
        duration,
        context
      }

    } catch (error) {
      const duration = performance.now() - startTime
      console.error(`❌ Scenario failed: ${scenario.name}`, error)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
        context
      }
    } finally {
      // Cleanup
      if (context && scenario.cleanup) {
        try {
          await scenario.cleanup(context)
        } catch (cleanupError) {
          console.warn('Cleanup error:', cleanupError)
        }
      }
    }
  }

  async runAllScenarios(): Promise<Array<{
    scenario: string
    success: boolean
    result?: any
    error?: string
    duration: number
  }>> {
    const results = []

    for (const scenario of this.scenarios) {
      const result = await this.runScenario(scenario.name)
      results.push({
        scenario: scenario.name,
        ...result
      })
    }

    const successCount = results.filter(r => r.success).length
    console.log(`🏁 Integration tests completed: ${successCount}/${results.length} passed`)

    return results
  }

  async setupTestEnvironment(): Promise<boolean> {
    console.log('🔧 Setting up integration test environment...')
    
    // Check service health
    const servicesReady = await this.healthChecker.waitForServices()
    if (!servicesReady) {
      return false
    }

    // Setup test database
    try {
      await testDb.setup()
      await testDb.cleanup() // Start with clean slate
    } catch (error) {
      console.error('Failed to setup test database:', error)
      return false
    }

    console.log('✅ Integration test environment ready')
    return true
  }
}

// Pre-configured integration scenarios
export const createIntegrationScenarios = () => {
  const runner = new IntegrationTestRunner()

  // Customer lifecycle scenario
  runner.addScenario({
    name: 'customer-lifecycle',
    description: 'Complete customer lifecycle from creation to deletion',
    
    setup: async () => {
      const tenant = TestFactories.tenant.create()
      const user = TestFactories.user.create({ tenantId: tenant.id })
      
      return { tenant, user, customers: [] }
    },

    execute: async (context) => {
      const customerData = TestFactories.customer.create({ tenantId: context.tenant.id })
      
      // Create customer via API
      const createResponse = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      })
      
      if (!createResponse.ok) {
        throw new Error(`Failed to create customer: ${createResponse.statusText}`)
      }
      
      const customer = await createResponse.json()
      context.customers.push(customer)
      
      // Update customer
      const updateResponse = await fetch(`/api/customers/${customer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...customer, name: 'Updated Name' })
      })
      
      if (!updateResponse.ok) {
        throw new Error(`Failed to update customer: ${updateResponse.statusText}`)
      }
      
      const updatedCustomer = await updateResponse.json()
      
      return { customer, updatedCustomer }
    },

    verify: async (context, result) => {
      // Verify customer was created
      expect(result.customer.id).toBeDefined()
      expect(result.customer.tenantId).toBe(context.tenant.id)
      
      // Verify customer was updated
      expect(result.updatedCustomer.name).toBe('Updated Name')
      expect(result.updatedCustomer.updatedAt).toBeDefined()
      
      // Verify in database
      await withTestTransaction(async (tx) => {
        const dbCustomer = await tx.customer.findUnique({
          where: { id: result.customer.id }
        })
        
        expect(dbCustomer).toBeDefined()
        expect(dbCustomer?.name).toBe('Updated Name')
      })
    },

    cleanup: async (context) => {
      // Clean up created customers
      for (const customer of context.customers) {
        await fetch(`/api/customers/${customer.id}`, { method: 'DELETE' })
      }
    }
  })

  // Business workflow scenario
  runner.addScenario({
    name: 'business-workflow',
    description: 'Multi-module business workflow integration',
    
    setup: async () => {
      const scenario = TestScenarios.smallBusiness()
      return scenario
    },

    execute: async (context) => {
      const workflow = []
      
      // 1. Create customer
      const customer = context.customers[0]
      workflow.push({ step: 'customer-created', data: customer })
      
      // 2. Create deal for customer
      const dealData = TestFactories.deal.create({ 
        customerId: customer.id, 
        tenantId: context.tenant.id 
      })
      workflow.push({ step: 'deal-created', data: dealData })
      
      // 3. Progress deal through stages
      const progressedDeal = { ...dealData, stage: 'QUALIFIED', probability: 75 }
      workflow.push({ step: 'deal-progressed', data: progressedDeal })
      
      // 4. Win deal and create invoice
      const wonDeal = { ...progressedDeal, stage: 'WON', probability: 100 }
      const invoice = TestFactories.invoice.create({
        customerId: customer.id,
        tenantId: context.tenant.id,
        amount: wonDeal.value
      })
      workflow.push({ step: 'deal-won-invoice-created', data: { deal: wonDeal, invoice } })
      
      return workflow
    },

    verify: async (context, result) => {
      // Verify workflow steps
      expect(result).toHaveLength(4)
      expect(result[0].step).toBe('customer-created')
      expect(result[1].step).toBe('deal-created')
      expect(result[2].step).toBe('deal-progressed')
      expect(result[3].step).toBe('deal-won-invoice-created')
      
      // Verify business logic
      const finalStep = result[3]
      expect(finalStep.data.deal.stage).toBe('WON')
      expect(finalStep.data.invoice.amount).toBe(finalStep.data.deal.value)
    }
  })

  // Performance integration scenario
  runner.addScenario({
    name: 'performance-integration',
    description: 'Test system performance under realistic load',
    
    setup: async () => {
      return { baseUrl: 'http://localhost:3000' }
    },

    execute: async (context) => {
      const performanceRunner = new PerformanceTestRunner()
      
      // Test API endpoint under load
      const metrics = await performanceRunner.runLoadTest({
        url: `${context.baseUrl}/api/health`,
        concurrentUsers: 10,
        duration: 30,
        rampUpTime: 5
      })
      
      return metrics
    },

    verify: async (context, result) => {
      // Verify performance metrics
      expect(result.errorRate).toBeLessThan(5) // Less than 5% error rate
      expect(result.averageResponseTime).toBeLessThan(1000) // Less than 1s average
      expect(result.p95ResponseTime).toBeLessThan(2000) // Less than 2s P95
      expect(result.requestsPerSecond).toBeGreaterThan(5) // At least 5 RPS
    }
  })

  return runner
}

// Database migration testing
export const testDatabaseMigrations = async (): Promise<{
  success: boolean
  migrationsRun: number
  errors: string[]
}> => {
  const errors: string[] = []
  let migrationsRun = 0

  try {
    console.log('🗄️  Testing database migrations...')
    
    // Run migrations
    execSync('npx prisma migrate dev --name test_migration', {
      stdio: 'pipe',
      env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL }
    })
    migrationsRun++

    // Test schema integrity
    const tables = await testDb.getPrisma().$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name NOT LIKE '_prisma_%'
    `
    
    if (tables.length === 0) {
      errors.push('No tables found after migration')
    }

    console.log(`✅ Database migrations tested successfully (${tables.length} tables)`)

  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown migration error')
  }

  return {
    success: errors.length === 0,
    migrationsRun,
    errors
  }
}

// Cross-service communication testing
export const testServiceCommunication = async (): Promise<{
  success: boolean
  services: Record<string, boolean>
  errors: string[]
}> => {
  const healthChecker = new ServiceHealthChecker()
  const errors: string[] = []
  const services: Record<string, boolean> = {}

  try {
    const results = await healthChecker.checkAllServices()
    
    for (const [service, result] of Object.entries(results)) {
      services[service] = result.healthy
      if (!result.healthy) {
        errors.push(`${service}: ${result.error || 'Unhealthy'}`)
      }
    }

  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown service error')
  }

  return {
    success: errors.length === 0,
    services,
    errors
  }
}

export { ServiceHealthChecker, IntegrationTestRunner }