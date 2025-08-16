/**
 * CoreFlow360 - External Services Integration Tests
 * Comprehensive testing of directly integrated external services
 * FORTRESS-LEVEL SECURITY: Validates tenant isolation and security
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { NextRequest } from 'next/server'
import { POST as FinGPT_POST, GET as FinGPT_GET } from '@/app/api/ai/fingpt/route'
import { POST as FinRobot_POST, GET as FinRobot_GET } from '@/app/api/ai/finrobot/route'

describe('External Services Integration Tests', () => {
  const testTenantId = 'test_tenant_integration'
  const testUserId = 'test_user_integration'
  
  beforeAll(() => {
    // Setup test environment
    process.env.NODE_ENV = 'test'
    process.env.PYTHON_PATH = 'python3'
  })
  
  describe('FinGPT Integration', () => {
    it('should analyze financial sentiment successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/fingpt', {
        method: 'POST',
        body: JSON.stringify({
          action: 'analyze_sentiment',
          text: 'Apple reported strong quarterly earnings with 15% revenue growth',
          context: {
            sector: 'tech',
            market_condition: 'bull'
          },
          tenant_id: testTenantId,
          user_id: testUserId
        })
      })
      
      const response = await FinGPT_POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.service).toBe('fingpt')
      expect(data.action).toBe('analyze_sentiment')
      expect(data.data).toBeDefined()
      expect(data.data.success).toBe(true)
      expect(data.data.sentiment).toBeOneOf(['positive', 'negative', 'neutral'])
      expect(data.data.score).toBeTypeOf('number')
      expect(data.data.confidence).toBeGreaterThan(0)
      expect(data.data.tenant_id).toBe(testTenantId)
      expect(data.processing_time_ms).toBeGreaterThan(0)
    }, 30000) // 30 second timeout for Python integration
    
    it('should handle batch sentiment analysis', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/fingpt', {
        method: 'POST',
        body: JSON.stringify({
          action: 'analyze_batch',
          texts: [
            'Company profits rose significantly this quarter',
            'Stock declined due to market uncertainty',
            'Trading remained stable with mixed signals'
          ],
          context: {
            sector: 'finance'
          },
          tenant_id: testTenantId,
          user_id: testUserId
        })
      })
      
      const response = await FinGPT_POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.success).toBe(true)
      expect(data.data.results).toHaveLength(3)
      expect(data.data.total_processed).toBe(3)
      
      // Verify each result
      data.data.results.forEach((result: any, index: number) => {
        expect(result.success).toBe(true)
        expect(result.sentiment).toBeOneOf(['positive', 'negative', 'neutral'])
        expect(result.index).toBe(index)
        expect(result.tenant_id).toBe(testTenantId)
      })
    }, 60000)
    
    it('should perform health check successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/fingpt', {
        method: 'POST',
        body: JSON.stringify({
          action: 'health_check',
          tenant_id: testTenantId,
          user_id: testUserId
        })
      })
      
      const response = await FinGPT_POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.health.status).toBe('healthy')
      expect(data.data.capabilities.service).toBe('fingpt')
      expect(data.data.capabilities.tenant_isolated).toBe(true)
      expect(Array.isArray(data.data.capabilities.capabilities)).toBe(true)
    }, 15000)
    
    it('should return service capabilities via GET', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/fingpt?action=capabilities')
      
      const response = await FinGPT_GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.service).toBe('fingpt')
      expect(data.data.capabilities).toContain('sentiment_analysis')
      expect(data.data.capabilities).toContain('financial_nlp')
      expect(data.data.tenant_isolated).toBe(true)
      expect(data.data.max_text_length).toBe(10000)
    })
    
    it('should return service info via GET', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/fingpt')
      
      const response = await FinGPT_GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.service).toBe('fingpt')
      expect(data.name).toBe('FinGPT Financial AI Service')
      expect(data.status).toBe('active')
      expect(data.integration).toBe('direct_code')
      expect(data.endpoints).toBeDefined()
      expect(data.performance).toBeDefined()
    })
  })
  
  describe('Input Validation', () => {
    it('should validate required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/fingpt', {
        method: 'POST',
        body: JSON.stringify({
          action: 'analyze_sentiment',
          text: '', // Empty text should fail
          tenant_id: testTenantId
          // Missing user_id should fail
        })
      })
      
      const response = await FinGPT_POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Validation error')
      expect(Array.isArray(data.details)).toBe(true)
    })
    
    it('should validate text length limits', async () => {
      const longText = 'a'.repeat(10001) // Exceeds max length
      
      const request = new NextRequest('http://localhost:3000/api/ai/fingpt', {
        method: 'POST',
        body: JSON.stringify({
          action: 'analyze_sentiment',
          text: longText,
          tenant_id: testTenantId,
          user_id: testUserId
        })
      })
      
      const response = await FinGPT_POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Validation error')
    })
    
    it('should validate batch size limits', async () => {
      const largeBatch = Array(101).fill('test text') // Exceeds batch limit
      
      const request = new NextRequest('http://localhost:3000/api/ai/fingpt', {
        method: 'POST',
        body: JSON.stringify({
          action: 'analyze_batch',
          texts: largeBatch,
          tenant_id: testTenantId,
          user_id: testUserId
        })
      })
      
      const response = await FinGPT_POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Validation error')
    })
    
    it('should handle unknown actions', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/fingpt', {
        method: 'POST',
        body: JSON.stringify({
          action: 'unknown_action',
          tenant_id: testTenantId,
          user_id: testUserId
        })
      })
      
      const response = await FinGPT_POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Unknown action')
      expect(Array.isArray(data.available_actions)).toBe(true)
    })
  })
  
  describe('Performance and Security', () => {
    it('should complete sentiment analysis within performance budget', async () => {
      const startTime = Date.now()
      
      const request = new NextRequest('http://localhost:3000/api/ai/fingpt', {
        method: 'POST',
        body: JSON.stringify({
          action: 'analyze_sentiment',
          text: 'Quick performance test for financial sentiment analysis',
          tenant_id: testTenantId,
          user_id: testUserId
        })
      })
      
      const response = await FinGPT_POST(request)
      const endTime = Date.now()
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      
      // Should complete within 10 seconds (including Python startup)
      expect(endTime - startTime).toBeLessThan(10000)
      
      // API processing time should be tracked
      expect(data.processing_time_ms).toBeGreaterThan(0)
      expect(data.data.processing_time_ms).toBeGreaterThan(0)
    }, 15000)
    
    it('should maintain tenant isolation', async () => {
      const tenant1 = 'tenant_1_isolation_test'
      const tenant2 = 'tenant_2_isolation_test'
      
      // Make requests for different tenants
      const request1 = new NextRequest('http://localhost:3000/api/ai/fingpt', {
        method: 'POST',
        body: JSON.stringify({
          action: 'analyze_sentiment',
          text: 'Tenant 1 financial analysis',
          tenant_id: tenant1,
          user_id: testUserId
        })
      })
      
      const request2 = new NextRequest('http://localhost:3000/api/ai/fingpt', {
        method: 'POST',
        body: JSON.stringify({
          action: 'analyze_sentiment', 
          text: 'Tenant 2 financial analysis',
          tenant_id: tenant2,
          user_id: testUserId
        })
      })
      
      const [response1, response2] = await Promise.all([
        FinGPT_POST(request1),
        FinGPT_POST(request2)
      ])
      
      const [data1, data2] = await Promise.all([
        response1.json(),
        response2.json()
      ])
      
      expect(data1.success).toBe(true)
      expect(data2.success).toBe(true)
      expect(data1.data.tenant_id).toBe(tenant1)
      expect(data2.data.tenant_id).toBe(tenant2)
      
      // Verify tenant isolation
      expect(data1.data.tenant_id).not.toBe(data2.data.tenant_id)
    }, 30000)
    
    it('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = 5
      const requests = Array(concurrentRequests).fill(null).map((_, index) => 
        new NextRequest('http://localhost:3000/api/ai/fingpt', {
          method: 'POST',
          body: JSON.stringify({
            action: 'analyze_sentiment',
            text: `Concurrent test ${index + 1} - market analysis`,
            tenant_id: `${testTenantId}_concurrent_${index}`,
            user_id: testUserId
          })
        })
      )
      
      const startTime = Date.now()
      const responses = await Promise.all(requests.map(req => FinGPT_POST(req)))
      const endTime = Date.now()
      
      const results = await Promise.all(responses.map(res => res.json()))
      
      // All requests should succeed
      results.forEach((data, index) => {
        expect(data.success).toBe(true)
        expect(data.data.tenant_id).toBe(`${testTenantId}_concurrent_${index}`)
      })
      
      // Total time should be reasonable for concurrent processing
      expect(endTime - startTime).toBeLessThan(45000) // 45 seconds for 5 concurrent requests
    }, 60000)
  })
  
  describe('Error Handling', () => {
    it('should handle malformed JSON gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/fingpt', {
        method: 'POST',
        body: 'invalid json'
      })
      
      const response = await FinGPT_POST(request)
      
      expect(response.status).toBe(500)
    })
    
    it('should handle empty request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/fingpt', {
        method: 'POST',
        body: JSON.stringify({})
      })
      
      const response = await FinGPT_POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
    
    it('should return proper error structure', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/fingpt', {
        method: 'POST',
        body: JSON.stringify({
          action: 'analyze_sentiment',
          // Missing required fields
        })
      })
      
      const response = await FinGPT_POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('success')
      expect(data).toHaveProperty('error')
      expect(data).toHaveProperty('service')
      expect(data.success).toBe(false)
      expect(data.service).toBe('fingpt')
    })
  })
  
  describe('FinRobot Integration', () => {
    it('should execute comprehensive forecast successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/finrobot', {
        method: 'POST',
        body: JSON.stringify({
          action: 'execute_forecast',
          data: {
            current_revenue: 1500000,
            historical_data: [1200000, 1250000, 1300000, 1400000],
            growth_rate: 0.12,
            sector: 'technology'
          },
          forecast_type: 'comprehensive',
          horizon_months: 18,
          tenant_id: testTenantId,
          user_id: testUserId
        })
      })
      
      const response = await FinRobot_POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.service).toBe('finrobot')
      expect(data.action).toBe('execute_forecast')
      expect(data.data).toBeDefined()
      expect(data.data.success).toBe(true)
      expect(data.data.forecast_summary).toBeDefined()
      expect(data.data.agent_insights).toBeDefined()
      expect(data.data.cross_departmental_impacts).toBeInstanceOf(Array)
      expect(data.data.tenant_id).toBe(testTenantId)
      expect(data.processing_time_ms).toBeGreaterThan(0)
    }, 60000) // 60 second timeout for comprehensive analysis
    
    it('should execute strategic analysis successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/finrobot', {
        method: 'POST',
        body: JSON.stringify({
          action: 'strategic_analysis',
          business_data: {
            current_revenue: 2000000,
            employee_count: 45,
            market_position: 'growing',
            industry: 'fintech',
            years_in_business: 3
          },
          analysis_depth: 'comprehensive',
          tenant_id: testTenantId,
          user_id: testUserId
        })
      })
      
      const response = await FinRobot_POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.success).toBe(true)
      expect(data.data.business_assessment).toBeDefined()
      expect(data.data.strategic_initiatives).toBeInstanceOf(Array)
      expect(data.data.priority_matrix).toBeDefined()
      expect(data.data.risk_assessment).toBeDefined()
      expect(data.data.financial_projections).toBeDefined()
    }, 60000)
    
    it('should perform health check successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/finrobot', {
        method: 'POST',
        body: JSON.stringify({
          action: 'health_check',
          tenant_id: testTenantId,
          user_id: testUserId
        })
      })
      
      const response = await FinRobot_POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.health.status).toBe('healthy')
      expect(data.data.capabilities.service).toBe('finrobot')
      expect(data.data.capabilities.agents).toBeInstanceOf(Array)
      expect(data.data.capabilities.tenant_isolated).toBe(true)
    }, 20000)
    
    it('should return service capabilities via GET', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/finrobot?action=capabilities')
      
      const response = await FinRobot_GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.service).toBe('finrobot')
      expect(data.data.capabilities).toContain('multi_agent_forecasting')
      expect(data.data.capabilities).toContain('strategic_analysis')
      expect(data.data.agents).toBeInstanceOf(Array)
      expect(data.data.agents).toHaveLength(5)
      expect(data.data.tenant_isolated).toBe(true)
    })
    
    it('should validate forecast request parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/finrobot', {
        method: 'POST',
        body: JSON.stringify({
          action: 'execute_forecast',
          data: {
            growth_rate: -2 // Invalid growth rate
          },
          horizon_months: 100, // Invalid horizon (max 60)
          tenant_id: testTenantId,
          user_id: testUserId
        })
      })
      
      const response = await FinRobot_POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Validation error')
      expect(Array.isArray(data.details)).toBe(true)
    })
    
    it('should handle unknown actions', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/finrobot', {
        method: 'POST',
        body: JSON.stringify({
          action: 'unknown_action',
          tenant_id: testTenantId,
          user_id: testUserId
        })
      })
      
      const response = await FinRobot_POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Unknown action')
      expect(Array.isArray(data.available_actions)).toBe(true)
    })
  })
  
  describe('Multi-Service Performance', () => {
    it('should handle concurrent requests across both services', async () => {
      const fingptRequest = new NextRequest('http://localhost:3000/api/ai/fingpt', {
        method: 'POST',
        body: JSON.stringify({
          action: 'analyze_sentiment',
          text: 'Technology stocks showing strong performance with AI sector leading gains',
          tenant_id: testTenantId,
          user_id: testUserId
        })
      })
      
      const finrobotRequest = new NextRequest('http://localhost:3000/api/ai/finrobot', {
        method: 'POST', 
        body: JSON.stringify({
          action: 'execute_forecast',
          data: {
            current_revenue: 1000000,
            growth_rate: 0.08
          },
          forecast_type: 'revenue',
          horizon_months: 6,
          tenant_id: testTenantId,
          user_id: testUserId
        })
      })
      
      const startTime = Date.now()
      const [fingptResponse, finrobotResponse] = await Promise.all([
        FinGPT_POST(fingptRequest),
        FinRobot_POST(finrobotRequest)
      ])
      const endTime = Date.now()
      
      const [fingptData, finrobotData] = await Promise.all([
        fingptResponse.json(),
        finrobotResponse.json()
      ])
      
      expect(fingptResponse.status).toBe(200)
      expect(finrobotResponse.status).toBe(200)
      expect(fingptData.success).toBe(true)
      expect(finrobotData.success).toBe(true)
      
      // Both services should complete within reasonable time when run concurrently
      expect(endTime - startTime).toBeLessThan(45000)
      
      console.log(`Concurrent execution time: ${endTime - startTime}ms`)
      console.log(`FinGPT processing: ${fingptData.processing_time_ms}ms`)
      console.log(`FinRobot processing: ${finrobotData.processing_time_ms}ms`)
    }, 60000)
  })

  afterAll(() => {
    // Cleanup if needed
  })
})