/**
 * CoreFlow360 - AI Provider Database Service
 * Handles persistence of AI provider configurations and usage
 */

import { PrismaClient } from '@prisma/client'
import { createHash } from 'crypto'

const prisma = new PrismaClient()

export interface AIProviderConfig {
  providerId: string
  name: string
  description?: string
  apiKey?: string
  isEnabled?: boolean
  defaultModel?: string
  temperature?: number
  maxTokens?: number
  costPerToken?: number
  supportedModels?: string[]
  supportedFeatures?: string[]
  metadata?: any
}

export interface AIProviderUsageData {
  providerId: string
  model: string
  tokensUsed: number
  cost: number
  responseTime: number
  taskType?: string
  department?: string
  userId?: string
  success?: boolean
  errorMessage?: string
}

export class AIProviderDatabase {
  /**
   * Get all AI providers for a tenant
   */
  async getProviders(tenantId: string) {
    try {
      const providers = await prisma.aIProvider.findMany({
        where: { tenantId },
        include: {
          usageLogs: {
            take: 10,
            orderBy: { timestamp: 'desc' }
          }
        },
        orderBy: { providerId: 'asc' }
      })

      // Don't return actual API keys in response
      return providers.map(provider => ({
        ...provider,
        apiKey: provider.apiKey ? '***CONFIGURED***' : null,
        apiKeyHash: undefined, // Remove hash from response
      }))
    } catch (error) {
      console.error('Error fetching AI providers:', error)
      throw new Error('Failed to fetch AI providers')
    }
  }

  /**
   * Get a specific AI provider
   */
  async getProvider(tenantId: string, providerId: string) {
    try {
      const provider = await prisma.aIProvider.findUnique({
        where: {
          tenantId_providerId: {
            tenantId,
            providerId
          }
        },
        include: {
          usageLogs: {
            take: 50,
            orderBy: { timestamp: 'desc' }
          }
        }
      })

      if (provider) {
        return {
          ...provider,
          apiKey: provider.apiKey ? '***CONFIGURED***' : null,
          apiKeyHash: undefined,
        }
      }

      return null
    } catch (error) {
      console.error('Error fetching AI provider:', error)
      throw new Error('Failed to fetch AI provider')
    }
  }

  /**
   * Create or update an AI provider configuration
   */
  async upsertProvider(tenantId: string, config: AIProviderConfig, userId?: string) {
    try {
      const apiKeyHash = config.apiKey ? this.hashApiKey(config.apiKey) : undefined
      
      const provider = await prisma.aIProvider.upsert({
        where: {
          tenantId_providerId: {
            tenantId,
            providerId: config.providerId
          }
        },
        update: {
          name: config.name,
          description: config.description,
          apiKey: config.apiKey,
          apiKeyHash,
          isEnabled: config.isEnabled ?? false,
          isConfigured: !!config.apiKey,
          defaultModel: config.defaultModel,
          temperature: config.temperature,
          maxTokens: config.maxTokens,
          costPerToken: config.costPerToken,
          supportedModels: config.supportedModels || [],
          supportedFeatures: config.supportedFeatures || [],
          metadata: config.metadata || {},
          lastModifiedBy: userId,
          updatedAt: new Date(),
        },
        create: {
          tenantId,
          providerId: config.providerId,
          name: config.name,
          description: config.description,
          apiKey: config.apiKey,
          apiKeyHash,
          isEnabled: config.isEnabled ?? false,
          isConfigured: !!config.apiKey,
          defaultModel: config.defaultModel,
          temperature: config.temperature ?? 0.7,
          maxTokens: config.maxTokens ?? 4096,
          costPerToken: config.costPerToken ?? 0.0,
          supportedModels: config.supportedModels || [],
          supportedFeatures: config.supportedFeatures || [],
          metadata: config.metadata || {},
          createdBy: userId,
        }
      })

      return {
        ...provider,
        apiKey: provider.apiKey ? '***CONFIGURED***' : null,
        apiKeyHash: undefined,
      }
    } catch (error) {
      console.error('Error upserting AI provider:', error)
      throw new Error('Failed to configure AI provider')
    }
  }

  /**
   * Delete an AI provider configuration
   */
  async deleteProvider(tenantId: string, providerId: string) {
    try {
      await prisma.aIProvider.delete({
        where: {
          tenantId_providerId: {
            tenantId,
            providerId
          }
        }
      })

      return true
    } catch (error) {
      console.error('Error deleting AI provider:', error)
      throw new Error('Failed to delete AI provider')
    }
  }

  /**
   * Update provider test results
   */
  async updateTestResults(
    tenantId: string, 
    providerId: string, 
    success: boolean, 
    errorMessage?: string
  ) {
    try {
      const healthStatus = success ? 'HEALTHY' : 'DEGRADED'
      
      await prisma.aIProvider.update({
        where: {
          tenantId_providerId: {
            tenantId,
            providerId
          }
        },
        data: {
          lastTested: new Date(),
          testResult: success,
          lastTestError: errorMessage,
          healthStatus,
        }
      })

      return true
    } catch (error) {
      console.error('Error updating test results:', error)
      throw new Error('Failed to update test results')
    }
  }

  /**
   * Record AI provider usage
   */
  async recordUsage(tenantId: string, usage: AIProviderUsageData) {
    try {
      // Record the usage
      await prisma.aIProviderUsage.create({
        data: {
          tenantId,
          providerId: usage.providerId,
          model: usage.model,
          tokensUsed: usage.tokensUsed,
          cost: usage.cost,
          responseTime: usage.responseTime,
          taskType: usage.taskType,
          department: usage.department,
          userId: usage.userId,
          success: usage.success ?? true,
          errorMessage: usage.errorMessage,
        }
      })

      // Update provider statistics
      await this.updateProviderStats(tenantId, usage.providerId, usage)

      return true
    } catch (error) {
      console.error('Error recording AI usage:', error)
      throw new Error('Failed to record AI usage')
    }
  }

  /**
   * Get AI provider usage statistics
   */
  async getUsageStats(tenantId: string, providerId?: string, startDate?: Date, endDate?: Date) {
    try {
      const where: any = { tenantId }
      
      if (providerId) {
        where.providerId = providerId
      }
      
      if (startDate || endDate) {
        where.timestamp = {}
        if (startDate) where.timestamp.gte = startDate
        if (endDate) where.timestamp.lte = endDate
      }

      const usage = await prisma.aIProviderUsage.groupBy({
        by: ['providerId'],
        where,
        _count: {
          id: true
        },
        _sum: {
          tokensUsed: true,
          cost: true,
        },
        _avg: {
          responseTime: true,
        }
      })

      const stats: Record<string, any> = {}
      
      for (const stat of usage) {
        const provider = await prisma.aIProvider.findUnique({
          where: {
            tenantId_providerId: {
              tenantId,
              providerId: stat.providerId
            }
          }
        })

        stats[stat.providerId] = {
          name: provider?.name || stat.providerId,
          enabled: provider?.isEnabled || false,
          requests: stat._count.id,
          tokens: stat._sum.tokensUsed || 0,
          cost: parseFloat(stat._sum.cost?.toString() || '0'),
          avgResponseTime: Math.round(stat._avg.responseTime || 0),
        }
      }

      return stats
    } catch (error) {
      console.error('Error fetching usage stats:', error)
      throw new Error('Failed to fetch usage statistics')
    }
  }

  /**
   * Get real API key for internal use (for AI operations)
   */
  async getApiKey(tenantId: string, providerId: string): Promise<string | null> {
    try {
      const provider = await prisma.aIProvider.findUnique({
        where: {
          tenantId_providerId: {
            tenantId,
            providerId
          }
        },
        select: {
          apiKey: true,
          isEnabled: true,
          isConfigured: true,
        }
      })

      if (provider?.isEnabled && provider?.isConfigured && provider?.apiKey) {
        return provider.apiKey
      }

      return null
    } catch (error) {
      console.error('Error fetching API key:', error)
      return null
    }
  }

  /**
   * Toggle provider enabled status
   */
  async toggleProvider(tenantId: string, providerId: string, enabled: boolean) {
    try {
      const provider = await prisma.aIProvider.update({
        where: {
          tenantId_providerId: {
            tenantId,
            providerId
          }
        },
        data: {
          isEnabled: enabled,
          healthStatus: enabled ? 'HEALTHY' : 'INACTIVE',
        }
      })

      return {
        ...provider,
        apiKey: provider.apiKey ? '***CONFIGURED***' : null,
        apiKeyHash: undefined,
      }
    } catch (error) {
      console.error('Error toggling provider:', error)
      throw new Error('Failed to toggle provider')
    }
  }

  // Private helper methods

  private hashApiKey(apiKey: string): string {
    return createHash('sha256').update(apiKey).digest('hex')
  }

  private async updateProviderStats(tenantId: string, providerId: string, usage: AIProviderUsageData) {
    try {
      const provider = await prisma.aIProvider.findUnique({
        where: {
          tenantId_providerId: {
            tenantId,
            providerId
          }
        }
      })

      if (!provider) return

      // Calculate new averages
      const newTotalRequests = provider.totalRequests + 1
      const newTotalTokens = provider.totalTokens + BigInt(usage.tokensUsed)
      const newTotalCost = parseFloat(provider.totalCost.toString()) + usage.cost
      
      // Calculate new average response time
      const currentAvg = provider.avgResponseTime || 0
      const newAvgResponseTime = Math.round(
        (currentAvg * provider.totalRequests + usage.responseTime) / newTotalRequests
      )

      // Calculate error rate
      const successfulRequests = usage.success ? 1 : 0
      const newErrorRate = ((provider.totalRequests - (provider.totalRequests * (100 - (provider.errorRate || 0)) / 100) + (1 - successfulRequests)) / newTotalRequests) * 100

      await prisma.aIProvider.update({
        where: {
          tenantId_providerId: {
            tenantId,
            providerId
          }
        },
        data: {
          totalRequests: newTotalRequests,
          totalTokens: newTotalTokens,
          totalCost: newTotalCost,
          lastUsed: new Date(),
          avgResponseTime: newAvgResponseTime,
          errorRate: Math.max(0, Math.min(100, newErrorRate)),
        }
      })
    } catch (error) {
      console.error('Error updating provider stats:', error)
      // Don't throw here as it's a background operation
    }
  }
}

// Singleton instance
export const aiProviderDB = new AIProviderDatabase()