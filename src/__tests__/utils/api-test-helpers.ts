/**
 * CoreFlow360 - API Test Helpers
 * Utilities for testing API endpoints, authentication, and responses
 */

import { NextRequest } from 'next/server'
import { createMocks } from 'node-mocks-http'
import { Session } from 'next-auth'
import { expect } from 'vitest'
import { TestFactories } from './test-factories'

// Mock session for testing
export const createMockSession = (overrides: Partial<Session> = {}): Session => {
  const tenant = TestFactories.tenant.create()
  const user = TestFactories.user.create({ tenantId: tenant.id })
  
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      image: null,
      ...overrides.user
    },
    tenant: {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      subscriptionTier: tenant.subscriptionTier,
      ...overrides.tenant
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    ...overrides
  }
}

// Mock NextAuth session
export const mockNextAuthSession = (session: Session | null = null) => {
  const { getServerSession } = require('next-auth')
  return vi.mocked(getServerSession).mockResolvedValue(session)
}

// API Route testing utilities
export class ApiTestHelper {
  static async callApiRoute(
    handler: Function,
    options: {
      method?: string
      body?: any
      query?: Record<string, string>
      headers?: Record<string, string>
      session?: Session | null
      params?: Record<string, string>
    } = {}
  ) {
    const {
      method = 'GET',
      body,
      query = {},
      headers = { 'content-type': 'application/json' },
      session = null,
      params = {}
    } = options

    // Mock the session if provided
    if (session !== undefined) {
      mockNextAuthSession(session)
    }

    // Create mock request
    const url = new URL('http://localhost:3000/api/test')
    Object.entries(query).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })

    const request = new Request(url.toString(), {
      method,
      headers: new Headers(headers),
      body: body ? JSON.stringify(body) : undefined
    }) as NextRequest

    // Add params to the request (for dynamic routes)
    ;(request as any).params = params

    try {
      const response = await handler(request)
      
      // Handle Response objects
      if (response instanceof Response) {
        let data: any
        const contentType = response.headers.get('content-type')
        
        if (contentType?.includes('application/json')) {
          data = await response.json()
        } else {
          data = await response.text()
        }

        return {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          data,
          response
        }
      }
      
      // Handle direct returns (legacy)
      return {
        status: 200,
        data: response,
        headers: {},
        response
      }
    } catch (error) {
      throw error
    }
  }

  // Test authenticated requests
  static async callAuthenticatedApi(
    handler: Function,
    options: Parameters<typeof ApiTestHelper.callApiRoute>[1] & {
      userRole?: string
      tenantId?: string
    } = {}
  ) {
    const { userRole = 'USER', tenantId, ...restOptions } = options
    
    const session = createMockSession({
      user: { role: userRole },
      tenant: tenantId ? { id: tenantId } : undefined
    })

    return this.callApiRoute(handler, {
      session,
      ...restOptions
    })
  }

  // Test unauthenticated requests
  static async callUnauthenticatedApi(
    handler: Function,
    options: Parameters<typeof ApiTestHelper.callApiRoute>[1] = {}
  ) {
    return this.callApiRoute(handler, {
      session: null,
      ...options
    })
  }

  // Test different user roles
  static async testRoleAccess(
    handler: Function,
    allowedRoles: string[],
    options: Parameters<typeof ApiTestHelper.callApiRoute>[1] = {}
  ) {
    const roles = ['USER', 'MANAGER', 'ADMIN', 'SUPER_ADMIN']
    const results: Record<string, any> = {}

    for (const role of roles) {
      try {
        const result = await this.callAuthenticatedApi(handler, {
          ...options,
          userRole: role
        })
        results[role] = { success: true, status: result.status, data: result.data }
      } catch (error) {
        results[role] = { success: false, error: error.message }
      }
    }

    // Verify allowed roles can access
    for (const role of allowedRoles) {
      expect(results[role].success).toBe(true)
      expect([200, 201].includes(results[role].status)).toBe(true)
    }

    // Verify forbidden roles are blocked
    const forbiddenRoles = roles.filter(role => !allowedRoles.includes(role))
    for (const role of forbiddenRoles) {
      expect([401, 403].includes(results[role].status)).toBe(true)
    }

    return results
  }

  // Test tenant isolation
  static async testTenantIsolation(
    handler: Function,
    options: {
      createTestData: (tenantId: string) => Promise<any>
      method?: string
      endpoint?: string
    }
  ) {
    const tenant1 = TestFactories.tenant.create()
    const tenant2 = TestFactories.tenant.create()
    
    // Create test data for both tenants
    const data1 = await options.createTestData(tenant1.id)
    const data2 = await options.createTestData(tenant2.id)

    // User from tenant1 should only see tenant1 data
    const session1 = createMockSession({ tenant: tenant1 })
    const result1 = await this.callApiRoute(handler, {
      method: options.method,
      session: session1
    })

    // User from tenant2 should only see tenant2 data
    const session2 = createMockSession({ tenant: tenant2 })
    const result2 = await this.callApiRoute(handler, {
      method: options.method,
      session: session2
    })

    return {
      tenant1: { data: data1, result: result1 },
      tenant2: { data: data2, result: result2 }
    }
  }
}

// Response validation utilities
export const validateApiResponse = {
  // Standard success response
  success: (response: any, expectedStatus: number = 200) => {
    expect(response.status).toBe(expectedStatus)
    expect(response.data).toBeDefined()
  },

  // Error response with message
  error: (response: any, expectedStatus: number, expectedMessage?: string) => {
    expect(response.status).toBe(expectedStatus)
    if (expectedMessage) {
      expect(response.data.error || response.data.message).toContain(expectedMessage)
    }
  },

  // Paginated response
  paginated: (response: any, options: { 
    minItems?: number
    maxItems?: number
    hasNextPage?: boolean
  } = {}) => {
    expect(response.status).toBe(200)
    expect(response.data.data).toBeInstanceOf(Array)
    expect(response.data.meta).toBeDefined()
    expect(response.data.meta.page).toBeTypeOf('number')
    expect(response.data.meta.limit).toBeTypeOf('number')
    expect(response.data.meta.total).toBeTypeOf('number')
    
    if (options.minItems !== undefined) {
      expect(response.data.data.length).toBeGreaterThanOrEqual(options.minItems)
    }
    if (options.maxItems !== undefined) {
      expect(response.data.data.length).toBeLessThanOrEqual(options.maxItems)
    }
    if (options.hasNextPage !== undefined) {
      expect(response.data.meta.hasNextPage).toBe(options.hasNextPage)
    }
  },

  // Created resource response
  created: (response: any, requiredFields: string[] = []) => {
    expect(response.status).toBe(201)
    expect(response.data.id).toBeDefined()
    expect(response.data.createdAt).toBeDefined()
    
    for (const field of requiredFields) {
      expect(response.data[field]).toBeDefined()
    }
  },

  // Updated resource response
  updated: (response: any) => {
    expect(response.status).toBe(200)
    expect(response.data.id).toBeDefined()
    expect(response.data.updatedAt).toBeDefined()
  },

  // Deleted resource response
  deleted: (response: any) => {
    expect([200, 204].includes(response.status)).toBe(true)
  },

  // Unauthorized access
  unauthorized: (response: any) => {
    expect(response.status).toBe(401)
    expect(response.data.error || response.data.message).toBeDefined()
  },

  // Forbidden access
  forbidden: (response: any) => {
    expect(response.status).toBe(403)
    expect(response.data.error || response.data.message).toBeDefined()
  },

  // Not found
  notFound: (response: any) => {
    expect(response.status).toBe(404)
    expect(response.data.error || response.data.message).toBeDefined()
  },

  // Validation error
  validation: (response: any, invalidFields?: string[]) => {
    expect(response.status).toBe(400)
    expect(response.data.error || response.data.message).toBeDefined()
    
    if (invalidFields) {
      const errorText = JSON.stringify(response.data)
      for (const field of invalidFields) {
        expect(errorText.toLowerCase()).toContain(field.toLowerCase())
      }
    }
  }
}

// Rate limiting test helper
export const testRateLimit = async (
  handler: Function,
  options: {
    requests: number
    timeWindow: number // milliseconds
    expectedStatus: number
    session?: Session
  }
) => {
  const results = []
  
  for (let i = 0; i < options.requests; i++) {
    const result = await ApiTestHelper.callApiRoute(handler, {
      session: options.session || createMockSession()
    })
    results.push(result)
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 10))
  }

  // Check if rate limiting kicked in
  const rateLimitedRequests = results.filter(r => r.status === options.expectedStatus)
  expect(rateLimitedRequests.length).toBeGreaterThan(0)
  
  return results
}

// Performance testing helper
export const measureApiPerformance = async (
  handler: Function,
  options: {
    iterations?: number
    maxResponseTime?: number
    session?: Session
  } = {}
) => {
  const { iterations = 10, maxResponseTime = 1000, session = createMockSession() } = options
  const times: number[] = []
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now()
    
    await ApiTestHelper.callApiRoute(handler, { session })
    
    const end = performance.now()
    times.push(end - start)
  }
  
  const avgTime = times.reduce((a, b) => a + b) / times.length
  const maxTime = Math.max(...times)
  const minTime = Math.min(...times)
  
  if (maxResponseTime) {
    expect(avgTime).toBeLessThan(maxResponseTime)
  }
  
  return {
    average: avgTime,
    maximum: maxTime,
    minimum: minTime,
    times,
    iterations
  }
}

// Mock external API responses
export const mockExternalApi = {
  stripe: {
    customer: (customerId: string = 'cus_test123') => ({
      id: customerId,
      object: 'customer',
      created: Math.floor(Date.now() / 1000),
      email: 'test@example.com',
      name: 'Test Customer'
    }),
    
    subscription: (subscriptionId: string = 'sub_test123') => ({
      id: subscriptionId,
      object: 'subscription',
      status: 'active',
      current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      items: { data: [] }
    })
  },
  
  openai: {
    completion: (content: string = 'Test AI response') => ({
      choices: [
        {
          message: {
            role: 'assistant',
            content
          }
        }
      ],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30
      }
    })
  }
}

export default ApiTestHelper