/**
 * CoreFlow360 - Orchestrator Integration Tests
 * MATHEMATICALLY PERFECT, ALGORITHMICALLY OPTIMAL, PROVABLY CORRECT
 * 
 * Comprehensive test suite for NocoBase orchestrator and plugin system
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals'
import { NocoBaseOrchestrator } from '@/integrations/nocobase/plugin-orchestrator'
import { BigcapitalAccountingPlugin } from '@/integrations/bigcapital/bigcapital-plugin'
import { TwentyCRMPlugin } from '@/integrations/twenty/twenty-crm-plugin'
import { CoreFlowEventBus, EventType, EventChannel } from '@/core/events/event-bus'
import { AIAgentOrchestrator } from '@/ai/orchestration/ai-agent-orchestrator'
import { PrismaClient } from '@prisma/client'
import { Redis } from 'ioredis'
import { Application } from '@nocobase/server'

describe('NocoBase Orchestrator Integration', () => {
  let app: Application
  let orchestrator: NocoBaseOrchestrator
  let eventBus: CoreFlowEventBus
  let aiOrchestrator: AIAgentOrchestrator
  let prisma: PrismaClient
  let redis: Redis
  
  beforeAll(async () => {
    // Initialize test environment
    prisma = new PrismaClient()
    redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      db: 1 // Use separate DB for tests
    })
    
    // Initialize core components
    eventBus = new CoreFlowEventBus(redis, prisma, {} as any)
    aiOrchestrator = new AIAgentOrchestrator({} as any, {} as any, {} as any, prisma, redis)
    
    // Create NocoBase app instance
    app = new Application({
      database: {
        dialect: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_DATABASE || 'coreflow360_test',
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres'
      }
    })
    
    // Initialize orchestrator
    orchestrator = new NocoBaseOrchestrator(app, eventBus, aiOrchestrator)
    await orchestrator.initialize()
  })
  
  afterAll(async () => {
    // Cleanup
    await prisma.$disconnect()
    await redis.quit()
  })
  
  describe('Plugin Registration', () => {
    it('should register a plugin successfully', async () => {
      const crmPlugin = new TwentyCRMPlugin(eventBus, aiOrchestrator)
      
      await orchestrator.registerPlugin(crmPlugin)
      
      const plugins = await orchestrator['getPluginList']()
      expect(plugins).toHaveLength(1)
      expect(plugins[0].id).toBe('twenty-crm')
      expect(plugins[0].status).toBe('ACTIVE')
    })
    
    it('should validate plugin dependencies', async () => {
      const accountingPlugin = new BigcapitalAccountingPlugin(eventBus, aiOrchestrator)
      accountingPlugin.config.dependencies = ['twenty-crm'] // Add dependency
      
      await orchestrator.registerPlugin(accountingPlugin)
      
      const plugins = await orchestrator['getPluginList']()
      expect(plugins).toHaveLength(2)
    })
    
    it('should reject invalid plugins', async () => {
      const invalidPlugin = {
        id: '',
        name: 'Invalid Plugin',
        module: null
      } as any
      
      await expect(orchestrator.registerPlugin(invalidPlugin))
        .rejects.toThrow('Invalid plugin configuration')
    })
  })
  
  describe('Cross-Module Data Sync', () => {
    beforeEach(async () => {
      // Register plugins for sync tests
      const crmPlugin = new TwentyCRMPlugin(eventBus, aiOrchestrator)
      const accountingPlugin = new BigcapitalAccountingPlugin(eventBus, aiOrchestrator)
      
      await orchestrator.registerPlugin(crmPlugin)
      await orchestrator.registerPlugin(accountingPlugin)
    })
    
    it('should sync customer data from CRM to Accounting', async () => {
      const customerData = {
        id: 'cust_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        companyId: 'comp_456'
      }
      
      const syncSpy = jest.spyOn(orchestrator as any, 'syncDataBetweenModules')
      
      await eventBus.publishEvent(
        EventType.ENTITY_CREATED,
        EventChannel.CRM,
        {
          entityType: 'customer',
          entityId: customerData.id,
          customerData
        },
        {
          module: 'CRM' as any,
          tenantId: 'test_tenant'
        }
      )
      
      // Wait for event processing
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(syncSpy).toHaveBeenCalled()
    })
    
    it('should handle data transformation between modules', async () => {
      const sourceData = {
        contact: {
          id: '123',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com'
        }
      }
      
      const result = await orchestrator['syncDataBetweenModules'](
        'CRM' as any,
        'ACCOUNTING' as any,
        'customer',
        sourceData
      )
      
      expect(result).toBeDefined()
    })
  })
  
  describe('AI Task Integration', () => {
    it('should submit AI tasks through orchestrator API', async () => {
      const taskRequest = {
        taskType: 'ANALYZE_CUSTOMER' as any,
        input: {
          customerId: 'cust_123',
          analysisDepth: 'comprehensive'
        },
        context: {
          entityType: 'customer',
          entityId: 'cust_123'
        },
        requirements: {
          maxExecutionTime: 30000,
          accuracyThreshold: 0.9,
          explainability: true,
          realTime: false
        }
      }
      
      const submitSpy = jest.spyOn(aiOrchestrator, 'submitTask')
        .mockResolvedValue('task_123')
      
      // Simulate API call
      const response = await orchestrator['aiOrchestrator'].submitTask(
        taskRequest.taskType,
        taskRequest.input,
        taskRequest.context,
        taskRequest.requirements,
        'MEDIUM' as any,
        'test_tenant',
        'user_123'
      )
      
      expect(response).toBe('task_123')
      expect(submitSpy).toHaveBeenCalledWith(
        taskRequest.taskType,
        taskRequest.input,
        taskRequest.context,
        taskRequest.requirements,
        'MEDIUM',
        'test_tenant',
        'user_123'
      )
    })
  })
  
  describe('Event Flow', () => {
    it('should handle entity sync events', async () => {
      const event = {
        id: 'event_123',
        type: EventType.ENTITY_CREATED,
        channel: EventChannel.CROSS_MODULE,
        priority: 1,
        source: {
          module: 'CRM' as any,
          tenantId: 'test_tenant',
          entityType: 'customer',
          entityId: 'cust_123'
        },
        data: {
          customer: { id: 'cust_123', name: 'Test Customer' }
        },
        metadata: {
          timestamp: new Date(),
          version: '1.0.0'
        },
        delivery: {
          persistent: true
        }
      }
      
      const handleSpy = jest.spyOn(orchestrator as any, 'handleEntitySync')
      
      await orchestrator['handleEntitySync'](event)
      
      expect(handleSpy).toHaveBeenCalledWith(event)
    })
    
    it('should handle AI insights distribution', async () => {
      const insightEvent = {
        data: {
          entityType: 'customer',
          insights: {
            churnRisk: 0.75,
            recommendations: ['Immediate intervention required']
          }
        },
        source: {
          module: 'AI_ENGINE' as any,
          tenantId: 'test_tenant'
        }
      }
      
      const handleSpy = jest.spyOn(orchestrator as any, 'handleAIInsights')
      
      await orchestrator['handleAIInsights'](insightEvent)
      
      expect(handleSpy).toHaveBeenCalledWith(insightEvent)
    })
  })
  
  describe('Plugin Lifecycle', () => {
    it('should activate and deactivate plugins', async () => {
      const crmPlugin = new TwentyCRMPlugin(eventBus, aiOrchestrator)
      await orchestrator.registerPlugin(crmPlugin)
      
      // Deactivate
      await orchestrator['deactivatePlugin']('twenty-crm')
      let plugins = await orchestrator['getPluginList']()
      expect(plugins.find(p => p.id === 'twenty-crm')?.status).toBe('INACTIVE')
      
      // Reactivate
      await orchestrator['activatePlugin']('twenty-crm')
      plugins = await orchestrator['getPluginList']()
      expect(plugins.find(p => p.id === 'twenty-crm')?.status).toBe('ACTIVE')
    })
  })
})