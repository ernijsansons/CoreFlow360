/**
 * CoreFlow360 - Enhanced Transaction Manager
 * Provides ACID compliance, saga pattern, and compensation logic for reliable business operations
 */

import { PrismaClient, Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { withCircuitBreakerProtection } from '@/lib/resilience/circuit-breaker'
import { withRetry, timeoutConfigs } from '@/lib/resilience/timeout-handler'
import { eventStore } from '@/lib/events/event-store'
import { EVENT_TYPES } from '@/lib/events/domain-events'

export interface TransactionStep {
  stepId: string
  stepType: string
  operation: () => Promise<any>
  compensation?: () => Promise<void>
  data?: any
  status?: 'pending' | 'completed' | 'failed' | 'compensated'
  result?: any
  error?: string
  attemptCount?: number
}

export interface TransactionContext {
  transactionId: string
  transactionType: string
  tenantId?: string
  userId?: string
  entityType: string
  entityId?: string
  steps: TransactionStep[]
  metadata?: Record<string, any>
}

export interface TransactionOptions {
  timeout?: number
  retryAttempts?: number
  enableCompensation?: boolean
  isolationLevel?: Prisma.TransactionIsolationLevel
  maxWait?: number
}

const DEFAULT_OPTIONS: Required<TransactionOptions> = {
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  enableCompensation: true,
  isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
  maxWait: 5000
}

/**
 * Enhanced Transaction Manager with saga pattern support
 */
export class TransactionManager {
  private static instance: TransactionManager
  private activeTransactions = new Map<string, TransactionContext>()

  static getInstance(): TransactionManager {
    if (!TransactionManager.instance) {
      TransactionManager.instance = new TransactionManager()
    }
    return TransactionManager.instance
  }

  /**
   * Execute a simple database transaction with retries and circuit breaker
   */
  async executeTransaction<T>(
    operation: (tx: Prisma.TransactionClient) => Promise<T>,
    options: TransactionOptions = {}
  ): Promise<T> {
    const config = { ...DEFAULT_OPTIONS, ...options }
    
    return withRetry(
      async () => {
        return withCircuitBreakerProtection('database', async () => {
          return prisma.$transaction(operation, {
            timeout: config.timeout,
            isolationLevel: config.isolationLevel,
            maxWait: config.maxWait
          })
        })
      },
      timeoutConfigs.database,
      'database_transaction'
    )
  }

  /**
   * Execute a saga transaction with compensation support
   */
  async executeSaga(
    context: Omit<TransactionContext, 'transactionId'>,
    options: TransactionOptions = {}
  ): Promise<any> {
    const config = { ...DEFAULT_OPTIONS, ...options }
    const transactionId = this.generateTransactionId()
    
    const fullContext: TransactionContext = {
      ...context,
      transactionId,
      steps: context.steps.map(step => ({
        ...step,
        status: 'pending',
        attemptCount: 0
      }))
    }

    this.activeTransactions.set(transactionId, fullContext)

    try {
      // Log transaction start
      await this.logTransactionStart(fullContext)

      // Execute saga steps
      const result = await this.executeSagaSteps(fullContext, config)

      // Mark transaction as committed
      await this.logTransactionCommit(transactionId, result)
      
      return result
    } catch (error) {
      console.error(`Saga transaction ${transactionId} failed:`, error)

      // Execute compensation if enabled
      if (config.enableCompensation) {
        await this.executeCompensation(fullContext)
      }

      // Log transaction failure
      await this.logTransactionFailure(
        transactionId, 
        error instanceof Error ? error.message : 'Unknown error'
      )

      throw error
    } finally {
      this.activeTransactions.delete(transactionId)
    }
  }

  /**
   * Execute individual saga steps
   */
  private async executeSagaSteps(
    context: TransactionContext,
    options: Required<TransactionOptions>
  ): Promise<any> {
    let lastResult: any = null

    for (let i = 0; i < context.steps.length; i++) {
      const step = context.steps[i]
      
      try {
        // Execute step with retry
        step.status = 'pending'
        step.attemptCount = (step.attemptCount || 0) + 1

        const result = await withRetry(
          async () => {
            return step.operation()
          },
          {
            timeout: options.timeout,
            retries: options.retryAttempts,
            retryDelay: 1000,
            exponentialBackoff: true,
            maxRetryDelay: 10000,
            retryCondition: (error: Error) => {
              // Retry on connection errors, timeouts, but not on business logic errors
              const message = error.message.toLowerCase()
              return message.includes('connection') ||
                     message.includes('timeout') ||
                     message.includes('lock') ||
                     message.includes('deadlock')
            }
          },
          `saga_step_${step.stepId}`
        )

        step.result = result
        step.status = 'completed'
        lastResult = result

        // Update transaction log
        await this.updateTransactionStep(context.transactionId, i, step)

      } catch (error) {
        step.error = error instanceof Error ? error.message : 'Unknown error'
        step.status = 'failed'

        // Update transaction log with failure
        await this.updateTransactionStep(context.transactionId, i, step)

        throw error
      }
    }

    return lastResult
  }

  /**
   * Execute compensation logic for failed saga
   */
  private async executeCompensation(context: TransactionContext): Promise<void> {
    console.log(`Starting compensation for transaction ${context.transactionId}`)

    // Execute compensation in reverse order
    for (let i = context.steps.length - 1; i >= 0; i--) {
      const step = context.steps[i]
      
      // Only compensate completed steps
      if (step.status !== 'completed' || !step.compensation) {
        continue
      }

      try {
        await step.compensation()
        step.status = 'compensated'
        
        console.log(`Compensated step ${step.stepId}`)
        
        // Update transaction log
        await this.updateTransactionStep(context.transactionId, i, step)
        
      } catch (error) {
        console.error(`Compensation failed for step ${step.stepId}:`, error)
        
        // Log compensation failure but continue with other steps
        step.error = `Compensation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        await this.updateTransactionStep(context.transactionId, i, step)
      }
    }

    // Log compensation completion
    await this.logTransactionRollback(context.transactionId)
  }

  /**
   * Log transaction start
   */
  private async logTransactionStart(context: TransactionContext): Promise<void> {
    try {
      await withCircuitBreakerProtection('database', async () => {
        await prisma.transactionLog.create({
          data: {
            transactionId: context.transactionId,
            transactionType: context.transactionType,
            tenantId: context.tenantId,
            entityType: context.entityType,
            entityId: context.entityId,
            status: 'started',
            steps: context.steps.map(step => ({
              stepId: step.stepId,
              stepType: step.stepType,
              status: step.status,
              data: step.data
            })),
            currentStep: 0,
            transactionData: {},
            metadata: context.metadata || {}
          }
        })
      })
    } catch (error) {
      console.error('Failed to log transaction start:', error)
      // Don't fail the transaction for logging errors
    }
  }

  /**
   * Update transaction step
   */
  private async updateTransactionStep(
    transactionId: string,
    stepIndex: number,
    step: TransactionStep
  ): Promise<void> {
    try {
      await withCircuitBreakerProtection('database', async () => {
        await prisma.transactionLog.update({
          where: { transactionId },
          data: {
            currentStep: stepIndex + 1,
            steps: this.activeTransactions.get(transactionId)?.steps.map(s => ({
              stepId: s.stepId,
              stepType: s.stepType,
              status: s.status,
              data: s.data,
              result: s.result,
              error: s.error,
              attemptCount: s.attemptCount
            })) || [],
            updatedAt: new Date()
          }
        })
      })
    } catch (error) {
      console.error('Failed to update transaction step:', error)
    }
  }

  /**
   * Log transaction commit
   */
  private async logTransactionCommit(transactionId: string, result: any): Promise<void> {
    try {
      await withCircuitBreakerProtection('database', async () => {
        await prisma.transactionLog.update({
          where: { transactionId },
          data: {
            status: 'committed',
            completedAt: new Date(),
            transactionData: { result }
          }
        })
      })
    } catch (error) {
      console.error('Failed to log transaction commit:', error)
    }
  }

  /**
   * Log transaction failure
   */
  private async logTransactionFailure(transactionId: string, error: string): Promise<void> {
    try {
      await withCircuitBreakerProtection('database', async () => {
        await prisma.transactionLog.update({
          where: { transactionId },
          data: {
            status: 'failed',
            completedAt: new Date(),
            rollbackReason: error
          }
        })
      })
    } catch (err) {
      console.error('Failed to log transaction failure:', err)
    }
  }

  /**
   * Log transaction rollback
   */
  private async logTransactionRollback(transactionId: string): Promise<void> {
    try {
      await withCircuitBreakerProtection('database', async () => {
        await prisma.transactionLog.update({
          where: { transactionId },
          data: {
            status: 'rolled_back',
            completedAt: new Date()
          }
        })
      })
    } catch (error) {
      console.error('Failed to log transaction rollback:', error)
    }
  }

  /**
   * Generate unique transaction ID
   */
  private generateTransactionId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(transactionId: string): Promise<any> {
    try {
      return await withCircuitBreakerProtection('database', async () => {
        return prisma.transactionLog.findUnique({
          where: { transactionId }
        })
      })
    } catch (error) {
      console.error('Failed to get transaction status:', error)
      return null
    }
  }

  /**
   * Clean up old transaction logs
   */
  async cleanupOldTransactions(olderThanDays: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

      const result = await withCircuitBreakerProtection('database', async () => {
        return prisma.transactionLog.deleteMany({
          where: {
            startedAt: {
              lt: cutoffDate
            },
            status: {
              in: ['committed', 'rolled_back', 'failed']
            }
          }
        })
      })

      return result.count
    } catch (error) {
      console.error('Failed to cleanup old transactions:', error)
      return 0
    }
  }

  /**
   * Get active transaction count
   */
  getActiveTransactionCount(): number {
    return this.activeTransactions.size
  }

  /**
   * Get transaction statistics
   */
  async getTransactionStats(): Promise<{
    activeTransactions: number
    totalTransactions: number
    successfulTransactions: number
    failedTransactions: number
    rolledBackTransactions: number
  }> {
    try {
      const [stats] = await withCircuitBreakerProtection('database', async () => {
        return prisma.$queryRaw<Array<{
          total_transactions: bigint
          successful_transactions: bigint
          failed_transactions: bigint
          rolled_back_transactions: bigint
        }>>`
          SELECT 
            COUNT(*) as total_transactions,
            COUNT(CASE WHEN status = 'committed' THEN 1 END) as successful_transactions,
            COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_transactions,
            COUNT(CASE WHEN status = 'rolled_back' THEN 1 END) as rolled_back_transactions
          FROM transaction_logs
          WHERE started_at > NOW() - INTERVAL '24 hours'
        `
      })

      return {
        activeTransactions: this.activeTransactions.size,
        totalTransactions: Number(stats?.total_transactions || 0),
        successfulTransactions: Number(stats?.successful_transactions || 0),
        failedTransactions: Number(stats?.failed_transactions || 0),
        rolledBackTransactions: Number(stats?.rolled_back_transactions || 0)
      }
    } catch (error) {
      console.error('Failed to get transaction stats:', error)
      return {
        activeTransactions: this.activeTransactions.size,
        totalTransactions: 0,
        successfulTransactions: 0,
        failedTransactions: 0,
        rolledBackTransactions: 0
      }
    }
  }
}

/**
 * Singleton transaction manager instance
 */
export const transactionManager = TransactionManager.getInstance()

/**
 * Helper function to create a simple transaction wrapper
 */
export async function withTransaction<T>(
  operation: (tx: Prisma.TransactionClient) => Promise<T>,
  options: TransactionOptions = {}
): Promise<T> {
  return transactionManager.executeTransaction(operation, options)
}

/**
 * Helper function to create customer with transaction
 */
export async function createCustomerTransaction(
  customerData: any,
  tenantId: string,
  userId: string
): Promise<any> {
  let createdCustomer: any = null
  
  const result = await transactionManager.executeSaga({
    transactionType: 'customer_creation',
    tenantId,
    userId,
    entityType: 'customer',
    steps: [
      {
        stepId: 'validate_customer',
        stepType: 'validation',
        operation: async () => {
          // Validate customer data
          if (!customerData.firstName && !customerData.name) {
            throw new Error('Customer name is required')
          }
          if (customerData.email) {
            const existing = await prisma.customer.findFirst({
              where: { email: customerData.email, tenantId }
            })
            if (existing) {
              throw new Error('Customer with this email already exists')
            }
          }
          return { valid: true }
        }
      },
      {
        stepId: 'create_customer',
        stepType: 'database_write',
        operation: async () => {
          createdCustomer = await prisma.customer.create({
            data: {
              ...customerData,
              tenantId,
              version: 1,
              industryData: customerData.industryData ? JSON.stringify(customerData.industryData) : undefined
            },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              address: true,
              company: true,
              industry: true,
              status: true,
              source: true,
              totalRevenue: true,
              createdAt: true,
              updatedAt: true,
              aiScore: true,
              aiChurnRisk: true,
              aiLifetimeValue: true,
              assignee: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          })
          return createdCustomer
        },
        compensation: async () => {
          // Delete created customer if transaction fails
          if (createdCustomer?.id) {
            await prisma.customer.deleteMany({
              where: { id: createdCustomer.id, tenantId }
            })
          }
        }
      },
      {
        stepId: 'create_audit_log',
        stepType: 'audit',
        operation: async () => {
          if (createdCustomer) {
            return prisma.auditLog.create({
              data: {
                action: 'CREATE',
                entityType: 'CUSTOMER',
                entityId: createdCustomer.id,
                oldValues: null,
                newValues: JSON.stringify(createdCustomer),
                metadata: JSON.stringify({
                  createdBy: userId,
                  customerName: `${createdCustomer.firstName} ${createdCustomer.lastName}`
                }),
                tenantId,
                userId
              }
            })
          }
        }
      },
      {
        stepId: 'create_domain_event',
        stepType: 'event_sourcing',
        operation: async () => {
          if (createdCustomer) {
            // Create domain event for customer creation
            await eventStore.appendEvent(
              createdCustomer.id,
              'Customer',
              EVENT_TYPES.CUSTOMER_CREATED,
              {
                name: `${createdCustomer.firstName} ${createdCustomer.lastName}`.trim(),
                email: createdCustomer.email,
                phone: createdCustomer.phone,
                company: createdCustomer.company,
                industry: createdCustomer.industry,
                source: createdCustomer.source,
                customFields: customerData.customFields || {}
              },
              {
                tenantId,
                userId,
                source: 'customer-api',
                correlationId: `customer-create-${createdCustomer.id}`,
                schemaVersion: '1.0.0'
              }
            )
            console.log(`📝 Domain event created for customer: ${createdCustomer.id}`)
          }
        }
      }
    ]
  })
  
  // Return the created customer from the saga result
  return createdCustomer || result
}

/**
 * Helper function to update customer with optimistic locking
 */
export async function updateCustomerWithOptimisticLock(
  customerId: string,
  updateData: any,
  expectedVersion: number,
  tenantId: string,
  userId: string
): Promise<any> {
  return transactionManager.executeTransaction(async (tx) => {
    // Get current customer with version
    const currentCustomer = await tx.customer.findUnique({
      where: { id: customerId },
      select: { version: true, tenantId: true }
    })

    if (!currentCustomer) {
      throw new Error('Customer not found')
    }

    if (currentCustomer.tenantId !== tenantId) {
      throw new Error('Access denied')
    }

    if (currentCustomer.version !== expectedVersion) {
      throw new Error(`Optimistic lock failure. Expected version ${expectedVersion}, got ${currentCustomer.version}`)
    }

    // Update with incremented version
    const updatedCustomer = await tx.customer.update({
      where: { 
        id: customerId,
        version: expectedVersion
      },
      data: {
        ...updateData,
        version: expectedVersion + 1,
        updatedAt: new Date()
      }
    })

    // Create audit log
    await tx.auditLog.create({
      data: {
        action: 'UPDATE',
        resourceType: 'customer',
        resourceId: customerId,
        tenantId,
        userId,
        details: JSON.stringify({ 
          updateData, 
          oldVersion: expectedVersion, 
          newVersion: expectedVersion + 1 
        })
      }
    })

    // Create domain event for customer update (outside transaction for async processing)
    setImmediate(async () => {
      try {
        await eventStore.appendEvent(
          customerId,
          'Customer',
          EVENT_TYPES.CUSTOMER_UPDATED,
          {
            previousValues: currentCustomer,
            updatedValues: updateData,
            changeReason: 'api_update'
          },
          {
            tenantId,
            userId,
            source: 'customer-api',
            correlationId: `customer-update-${customerId}-${Date.now()}`,
            schemaVersion: '1.0.0'
          }
        )
        console.log(`📝 Domain event created for customer update: ${customerId}`)
      } catch (error) {
        console.error('Failed to create domain event for customer update:', error)
      }
    })

    return updatedCustomer
  })
}