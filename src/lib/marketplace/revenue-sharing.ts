/**
 * CoreFlow360 Marketplace Revenue Sharing System
 *
 * Handles billing, revenue distribution, and developer payouts
 * for the AI Agent marketplace ecosystem
 */

import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'

export interface RevenueShareConfig {
  developerId: string
  agentId: string
  revenueSharePercentage: number // 0.70 = 70% to developer, 30% to platform
  payoutSchedule: 'weekly' | 'monthly' | 'quarterly'
  minimumPayout: number // Minimum amount before payout
  currency: string
}

export interface MarketplaceTransaction {
  id: string
  customerId: string
  agentId: string
  developerId: string
  amount: number // Total amount paid by customer
  developerShare: number // Amount going to developer
  platformShare: number // Amount going to platform
  currency: string
  stripePaymentIntentId: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  createdAt: Date
  processedAt?: Date
}

export interface DeveloperPayout {
  id: string
  developerId: string
  amount: number
  currency: string
  period: {
    start: Date
    end: Date
  }
  transactions: string[] // Array of transaction IDs included in this payout
  stripeTransferId?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: Date
  completedAt?: Date
}

export class RevenueShareManager {
  /**
   * Process a marketplace purchase and calculate revenue sharing
   */
  static async processPurchase(
    customerId: string,
    agentId: string,
    amount: number, // Amount in cents
    currency: string = 'usd'
  ): Promise<MarketplaceTransaction> {
    try {
      // Get agent and developer info
      const agent = await db.marketplaceAgent.findUnique({
        where: { id: agentId },
        include: { developer: true },
      })

      if (!agent) {
        throw new Error(`Agent ${agentId} not found`)
      }

      // Get revenue share config
      const revenueConfig = await db.revenueShareConfig.findFirst({
        where: { agentId, developerId: agent.developerId },
      })

      if (!revenueConfig) {
        throw new Error(`Revenue share config not found for agent ${agentId}`)
      }

      // Calculate shares
      const developerShare = Math.round(amount * revenueConfig.revenueSharePercentage)
      const platformShare = amount - developerShare

      // Create Stripe payment intent with Connect application fee
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        customer: customerId,
        application_fee_amount: platformShare,
        transfer_data: {
          destination: agent.developer.stripeConnectAccountId,
        },
        metadata: {
          agentId,
          developerId: agent.developerId,
          type: 'marketplace_purchase',
        },
      })

      // Create transaction record
      const transaction: MarketplaceTransaction = {
        id: generateTransactionId(),
        customerId,
        agentId,
        developerId: agent.developerId,
        amount,
        developerShare,
        platformShare,
        currency,
        stripePaymentIntentId: paymentIntent.id,
        status: 'pending',
        createdAt: new Date(),
      }

      // Save to database
      await db.marketplaceTransaction.create({
        data: transaction,
      })

      // Track analytics
      await this.trackRevenueAnalytics(transaction)

      return transaction
    } catch (error) {
      throw error
    }
  }

  /**
   * Handle successful payment completion
   */
  static async completeTransaction(stripePaymentIntentId: string): Promise<void> {
    try {
      const transaction = await db.marketplaceTransaction.findFirst({
        where: { stripePaymentIntentId },
      })

      if (!transaction) {
        throw new Error(`Transaction not found for payment intent ${stripePaymentIntentId}`)
      }

      // Update transaction status
      await db.marketplaceTransaction.update({
        where: { id: transaction.id },
        data: {
          status: 'completed',
          processedAt: new Date(),
        },
      })

      // Add to developer's pending payout
      await this.addToPendingPayout(
        transaction.developerId,
        transaction.developerShare,
        transaction.currency,
        transaction.id
      )

      // Update agent sales stats
      await db.marketplaceAgent.update({
        where: { id: transaction.agentId },
        data: {
          totalSales: { increment: 1 },
          totalRevenue: { increment: transaction.amount },
        },
      })
    } catch (error) {
      throw error
    }
  }

  /**
   * Add revenue to developer's pending payout
   */
  private static async addToPendingPayout(
    developerId: string,
    amount: number,
    currency: string,
    transactionId: string
  ): Promise<void> {
    // Check if there's an existing pending payout for this developer
    const existingPayout = await db.developerPayout.findFirst({
      where: {
        developerId,
        status: 'pending',
        currency,
      },
    })

    if (existingPayout) {
      // Add to existing payout
      await db.developerPayout.update({
        where: { id: existingPayout.id },
        data: {
          amount: { increment: amount },
          transactions: { push: transactionId },
        },
      })
    } else {
      // Create new payout
      await db.developerPayout.create({
        data: {
          id: generatePayoutId(),
          developerId,
          amount,
          currency,
          period: {
            start: new Date(),
            end: new Date(), // Will be updated when payout is processed
          },
          transactions: [transactionId],
          status: 'pending',
          createdAt: new Date(),
        },
      })
    }
  }

  /**
   * Process weekly/monthly payouts to developers
   */
  static async processScheduledPayouts(): Promise<void> {
    try {
      // Get all developers with revenue share configs
      const developers = await db.developer.findMany({
        where: {
          revenueShareConfigs: {
            some: {},
          },
        },
        include: {
          revenueShareConfigs: true,
          pendingPayouts: {
            where: { status: 'pending' },
          },
        },
      })

      for (const developer of developers) {
        for (const config of developer.revenueShareConfigs) {
          await this.processDeveloperPayout(developer, config)
        }
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Process payout for a specific developer
   */
  private static async processDeveloperPayout(
    developer: unknown,
    config: RevenueShareConfig
  ): Promise<void> {
    const pendingPayouts = await db.developerPayout.findMany({
      where: {
        developerId: developer.id,
        status: 'pending',
        amount: { gte: config.minimumPayout },
      },
    })

    for (const payout of pendingPayouts) {
      try {
        // Create Stripe transfer to developer's Connect account
        const transfer = await stripe.transfers.create({
          amount: payout.amount,
          currency: payout.currency,
          destination: developer.stripeConnectAccountId,
          metadata: {
            payoutId: payout.id,
            developerId: developer.id,
            period: `${payout.period.start.toISOString()}-${payout.period.end.toISOString()}`,
          },
        })

        // Update payout record
        await db.developerPayout.update({
          where: { id: payout.id },
          data: {
            status: 'completed',
            stripeTransferId: transfer.id,
            completedAt: new Date(),
          },
        })

        // Send notification to developer
        await this.notifyDeveloperOfPayout(developer, payout, transfer.id)
      } catch (error) {
        // Mark payout as failed
        await db.developerPayout.update({
          where: { id: payout.id },
          data: { status: 'failed' },
        })
      }
    }
  }

  /**
   * Get revenue analytics for a developer
   */
  static async getDeveloperAnalytics(
    developerId: string,
    period: {
      start: Date
      end: Date
    }
  ): Promise<{
    totalRevenue: number
    totalTransactions: number
    averageTransactionValue: number
    topPerformingAgents: Array<{
      agentId: string
      agentName: string
      revenue: number
      transactions: number
    }>
  }> {
    try {
      // Get transactions in period
      const transactions = await db.marketplaceTransaction.findMany({
        where: {
          developerId,
          status: 'completed',
          createdAt: {
            gte: period.start,
            lte: period.end,
          },
        },
        include: {
          agent: true,
        },
      })

      const totalRevenue = transactions.reduce((sum, t) => sum + t.developerShare, 0)
      const totalTransactions = transactions.length
      const averageTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

      // Calculate top performing agents
      const agentStats = transactions.reduce(
        (stats, transaction) => {
          const agentId = transaction.agentId
          if (!stats[agentId]) {
            stats[agentId] = {
              agentId,
              agentName: transaction.agent.name,
              revenue: 0,
              transactions: 0,
            }
          }
          stats[agentId].revenue += transaction.developerShare
          stats[agentId].transactions += 1
          return stats
        },
        {} as Record<string, unknown>
      )

      const topPerformingAgents = Object.values(agentStats)
        .sort((a: unknown, b: unknown) => b.revenue - a.revenue)
        .slice(0, 5)

      return {
        totalRevenue,
        totalTransactions,
        averageTransactionValue,
        topPerformingAgents,
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Handle refunds and revenue adjustments
   */
  static async processRefund(transactionId: string): Promise<void> {
    try {
      const transaction = await db.marketplaceTransaction.findUnique({
        where: { id: transactionId },
      })

      if (!transaction) {
        throw new Error(`Transaction ${transactionId} not found`)
      }

      // Process Stripe refund
      const refund = await stripe.refunds.create({
        payment_intent: transaction.stripePaymentIntentId,
        reverse_transfer: true, // Also reverse the transfer to the developer
        refund_application_fee: true,
      })

      // Update transaction status
      await db.marketplaceTransaction.update({
        where: { id: transactionId },
        data: { status: 'refunded' },
      })

      // Adjust developer's pending payout if not yet paid out
      await this.adjustDeveloperPayout(
        transaction.developerId,
        -transaction.developerShare,
        transaction.currency,
        transactionId
      )
    } catch (error) {
      throw error
    }
  }

  private static async adjustDeveloperPayout(
    developerId: string,
    adjustmentAmount: number,
    currency: string,
    transactionId: string
  ): Promise<void> {
    // Find pending payout that includes this transaction
    const payout = await db.developerPayout.findFirst({
      where: {
        developerId,
        status: 'pending',
        currency,
        transactions: { has: transactionId },
      },
    })

    if (payout) {
      await db.developerPayout.update({
        where: { id: payout.id },
        data: {
          amount: { increment: adjustmentAmount },
          transactions: payout.transactions.filter((t) => t !== transactionId),
        },
      })
    }
  }

  private static async trackRevenueAnalytics(transaction: MarketplaceTransaction): Promise<void> {
    // Send analytics event
    if (typeof window !== 'undefined' && (window as unknown).gtag) {
      ;(window as unknown).gtag('event', 'marketplace_revenue', {
        agent_id: transaction.agentId,
        developer_id: transaction.developerId,
        amount: transaction.amount / 100, // Convert to dollars
        currency: transaction.currency,
        developer_share: transaction.developerShare / 100,
        platform_share: transaction.platformShare / 100,
      })
    }
  }

  private static async notifyDeveloperOfPayout(
    developer: unknown,
    payout: DeveloperPayout,
    transferId: string
  ): Promise<void> {
    // In production, send email notification
    console.log(
      `Payout notification: Developer ${developer.id} received $${payout.amount / 100} (Transfer: ${transferId})`
    )
  }
}

// Utility functions
function generateTransactionId(): string {
  return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function generatePayoutId(): string {
  return `payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Database schema types for Prisma (these would go in schema.prisma)
export const MARKETPLACE_SCHEMA = `
model Developer {
  id                        String   @id @default(cuid())
  email                     String   @unique
  name                      String
  company                   String?
  website                   String?
  stripeConnectAccountId    String   @unique
  isVerified                Boolean  @default(false)
  createdAt                 DateTime @default(now())
  updatedAt                 DateTime @updatedAt

  // Relations
  agents                    MarketplaceAgent[]
  revenueShareConfigs       RevenueShareConfig[]
  transactions              MarketplaceTransaction[]
  payouts                   DeveloperPayout[]

  @@map("developers")
}

model MarketplaceAgent {
  id                String   @id @default(cuid())
  name              String
  description       String
  longDescription   String?
  category          String
  version           String
  verified          Boolean  @default(false)
  published         Boolean  @default(false)
  totalSales        Int      @default(0)
  totalRevenue      Int      @default(0)
  rating            Float    @default(0)
  reviewCount       Int      @default(0)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Foreign keys
  developerId       String
  developer         Developer @relation(fields: [developerId], references: [id])

  // Relations
  transactions      MarketplaceTransaction[]
  revenueConfig     RevenueShareConfig?

  @@map("marketplace_agents")
}

model RevenueShareConfig {
  id                      String   @id @default(cuid())
  developerId             String
  agentId                 String   @unique
  revenueSharePercentage  Float    // 0.70 for 70%
  payoutSchedule          String   // 'weekly', 'monthly', 'quarterly'
  minimumPayout           Int      // Amount in cents
  currency                String   @default("usd")
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt

  // Relations
  developer               Developer @relation(fields: [developerId], references: [id])
  agent                   MarketplaceAgent @relation(fields: [agentId], references: [id])

  @@map("revenue_share_configs")
}

model MarketplaceTransaction {
  id                    String   @id @default(cuid())
  customerId            String
  agentId               String
  developerId           String
  amount                Int      // Total amount in cents
  developerShare        Int      // Developer's share in cents
  platformShare         Int      // Platform's share in cents
  currency              String   @default("usd")
  stripePaymentIntentId String   @unique
  status                String   // 'pending', 'completed', 'failed', 'refunded'
  createdAt             DateTime @default(now())
  processedAt           DateTime?

  // Relations
  developer             Developer @relation(fields: [developerId], references: [id])
  agent                 MarketplaceAgent @relation(fields: [agentId], references: [id])

  @@map("marketplace_transactions")
}

model DeveloperPayout {
  id                String   @id @default(cuid())
  developerId       String
  amount            Int      // Amount in cents
  currency          String   @default("usd")
  periodStart       DateTime
  periodEnd         DateTime
  transactions      String[] // Array of transaction IDs
  stripeTransferId  String?
  status            String   // 'pending', 'processing', 'completed', 'failed'
  createdAt         DateTime @default(now())
  completedAt       DateTime?

  // Relations
  developer         Developer @relation(fields: [developerId], references: [id])

  @@map("developer_payouts")
}
`

export default RevenueShareManager
