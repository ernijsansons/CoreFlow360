/**
 * CoreFlow360 - Advanced Query Builder
 * Complex query patterns and optimizations
 */

import { Prisma } from '@prisma/client'
import { db } from './client'

/**
 * Advanced query builder for complex business queries
 */
export class QueryBuilder {
  /**
   * Customer analytics queries
   */
  static customer = {
    /**
     * Get customer lifetime value
     */
    async getLifetimeValue(tenantId: string, customerId?: string) {
      const whereClause = customerId 
        ? Prisma.sql`AND c.id = ${customerId}`
        : Prisma.empty
      
      return await db.$queryRaw<any[]>`
        SELECT 
          c.id,
          c.name,
          c.email,
          COALESCE(SUM(i.amount), 0) as lifetime_value,
          COUNT(i.id) as invoice_count,
          AVG(i.amount) as average_invoice,
          MIN(i."createdAt") as first_purchase,
          MAX(i."createdAt") as last_purchase,
          DATE_PART('day', NOW() - MAX(i."createdAt")) as days_since_last_purchase
        FROM "Customer" c
        LEFT JOIN "Invoice" i ON c.id = i."customerId" AND i.status = 'paid'
        WHERE c."tenantId" = ${tenantId}
        ${whereClause}
        GROUP BY c.id, c.name, c.email
        ORDER BY lifetime_value DESC
      `
    },
    
    /**
     * Customer engagement score
     */
    async getEngagementScore(tenantId: string, days: number = 90) {
      const sinceDate = new Date()
      sinceDate.setDate(sinceDate.getDate() - days)
      
      return await db.$queryRaw<any[]>`
        WITH customer_activity AS (
          SELECT 
            c.id,
            c.name,
            COUNT(DISTINCT a.id) as activity_count,
            COUNT(DISTINCT d.id) as deal_count,
            COUNT(DISTINCT comm.id) as communication_count,
            MAX(a."createdAt") as last_activity
          FROM "Customer" c
          LEFT JOIN "Activity" a ON c.id::text = a."entityId" 
            AND a."entityType" = 'customer' 
            AND a."createdAt" >= ${sinceDate}
          LEFT JOIN "Deal" d ON c.id = d."customerId" 
            AND d."createdAt" >= ${sinceDate}
          LEFT JOIN "Communication" comm ON c.id = comm."customerId" 
            AND comm."createdAt" >= ${sinceDate}
          WHERE c."tenantId" = ${tenantId}
          GROUP BY c.id, c.name
        )
        SELECT 
          *,
          (
            (activity_count * 1.0) +
            (deal_count * 3.0) +
            (communication_count * 2.0) +
            CASE 
              WHEN last_activity >= NOW() - INTERVAL '7 days' THEN 5.0
              WHEN last_activity >= NOW() - INTERVAL '30 days' THEN 2.0
              ELSE 0.0
            END
          ) as engagement_score
        FROM customer_activity
        ORDER BY engagement_score DESC
      `
    },
    
    /**
     * Customer segmentation
     */
    async getSegmentation(tenantId: string) {
      return await db.$queryRaw<any[]>`
        WITH customer_metrics AS (
          SELECT 
            c.id,
            c.name,
            c.status,
            COALESCE(SUM(i.amount), 0) as total_spent,
            COUNT(i.id) as purchase_count,
            DATE_PART('day', NOW() - c."createdAt") as customer_age_days,
            DATE_PART('day', NOW() - MAX(i."createdAt")) as days_since_last_purchase
          FROM "Customer" c
          LEFT JOIN "Invoice" i ON c.id = i."customerId" AND i.status = 'paid'
          WHERE c."tenantId" = ${tenantId}
          GROUP BY c.id, c.name, c.status, c."createdAt"
        )
        SELECT 
          *,
          CASE 
            WHEN total_spent > 10000 AND days_since_last_purchase <= 30 THEN 'VIP Active'
            WHEN total_spent > 5000 AND days_since_last_purchase <= 30 THEN 'High Value'
            WHEN total_spent > 1000 AND days_since_last_purchase <= 60 THEN 'Regular'
            WHEN days_since_last_purchase <= 30 THEN 'New/Active'
            WHEN days_since_last_purchase > 90 THEN 'At Risk'
            ELSE 'Low Value'
          END as segment
        FROM customer_metrics
        ORDER BY total_spent DESC
      `
    }
  }
  
  /**
   * Sales analytics queries
   */
  static sales = {
    /**
     * Sales funnel analysis
     */
    async getFunnelAnalysis(tenantId: string, period: 'week' | 'month' | 'quarter' = 'month') {
      const periodClause = period === 'week' ? 
        Prisma.sql`DATE_TRUNC('week', d."createdAt")` :
        period === 'quarter' ?
        Prisma.sql`DATE_TRUNC('quarter', d."createdAt")` :
        Prisma.sql`DATE_TRUNC('month', d."createdAt")`
      
      return await db.$queryRaw<any[]>`
        SELECT 
          ${periodClause} as period,
          COUNT(*) as total_deals,
          COUNT(*) FILTER (WHERE status = 'qualified') as qualified,
          COUNT(*) FILTER (WHERE status = 'proposal') as proposals,
          COUNT(*) FILTER (WHERE status = 'negotiation') as negotiations,
          COUNT(*) FILTER (WHERE status = 'won') as won,
          COUNT(*) FILTER (WHERE status = 'lost') as lost,
          SUM(amount) FILTER (WHERE status = 'won') as won_amount,
          AVG(amount) FILTER (WHERE status = 'won') as avg_deal_size
        FROM "Deal" d
        WHERE d."tenantId" = ${tenantId}
        AND d."createdAt" >= NOW() - INTERVAL '12 months'
        GROUP BY ${periodClause}
        ORDER BY period DESC
      `
    },
    
    /**
     * Sales performance by user
     */
    async getPerformanceByUser(tenantId: string, period: number = 90) {
      const sinceDate = new Date()
      sinceDate.setDate(sinceDate.getDate() - period)
      
      return await db.$queryRaw<any[]>`
        SELECT 
          u.id,
          u.name,
          u.email,
          COUNT(d.id) as total_deals,
          COUNT(d.id) FILTER (WHERE d.status = 'won') as won_deals,
          COUNT(d.id) FILTER (WHERE d.status = 'lost') as lost_deals,
          SUM(d.amount) FILTER (WHERE d.status = 'won') as total_revenue,
          AVG(d.amount) FILTER (WHERE d.status = 'won') as avg_deal_size,
          CASE 
            WHEN COUNT(d.id) > 0 
            THEN ROUND((COUNT(d.id) FILTER (WHERE d.status = 'won')::decimal / COUNT(d.id) * 100), 2)
            ELSE 0 
          END as win_rate
        FROM "User" u
        LEFT JOIN "Deal" d ON u.id = d."ownerId" 
          AND d."createdAt" >= ${sinceDate}
        WHERE u."tenantId" = ${tenantId}
        AND u.role IN ('user', 'team_lead', 'department_manager')
        GROUP BY u.id, u.name, u.email
        HAVING COUNT(d.id) > 0
        ORDER BY total_revenue DESC NULLS LAST
      `
    },
    
    /**
     * Revenue forecast
     */
    async getRevenueForecast(tenantId: string) {
      return await db.$queryRaw<any[]>`
        WITH monthly_revenue AS (
          SELECT 
            DATE_TRUNC('month', i."createdAt") as month,
            SUM(i.amount) as revenue
          FROM "Invoice" i
          JOIN "Customer" c ON i."customerId" = c.id
          WHERE c."tenantId" = ${tenantId}
          AND i.status = 'paid'
          AND i."createdAt" >= NOW() - INTERVAL '12 months'
          GROUP BY DATE_TRUNC('month', i."createdAt")
          ORDER BY month
        ),
        pipeline_value AS (
          SELECT 
            DATE_TRUNC('month', d."expectedCloseDate") as month,
            SUM(d.amount * 
              CASE d.status
                WHEN 'qualified' THEN 0.2
                WHEN 'proposal' THEN 0.4
                WHEN 'negotiation' THEN 0.7
                ELSE 0
              END
            ) as pipeline_amount
          FROM "Deal" d
          WHERE d."tenantId" = ${tenantId}
          AND d.status IN ('qualified', 'proposal', 'negotiation')
          AND d."expectedCloseDate" >= DATE_TRUNC('month', NOW())
          AND d."expectedCloseDate" < DATE_TRUNC('month', NOW() + INTERVAL '6 months')
          GROUP BY DATE_TRUNC('month', d."expectedCloseDate")
        )
        SELECT 
          COALESCE(mr.month, pv.month) as month,
          COALESCE(mr.revenue, 0) as actual_revenue,
          COALESCE(pv.pipeline_amount, 0) as forecasted_revenue
        FROM monthly_revenue mr
        FULL OUTER JOIN pipeline_value pv ON mr.month = pv.month
        ORDER BY month
      `
    }
  }
  
  /**
   * Business intelligence queries
   */
  static analytics = {
    /**
     * Executive dashboard metrics
     */
    async getExecutiveMetrics(tenantId: string, period: number = 30) {
      const sinceDate = new Date()
      sinceDate.setDate(sinceDate.getDate() - period)
      
      const [metrics] = await db.$queryRaw<any[]>`
        WITH period_metrics AS (
          SELECT 
            -- Customer metrics
            COUNT(DISTINCT c.id) FILTER (WHERE c."createdAt" >= ${sinceDate}) as new_customers,
            COUNT(DISTINCT c.id) as total_customers,
            
            -- Deal metrics
            COUNT(DISTINCT d.id) FILTER (WHERE d."createdAt" >= ${sinceDate}) as new_deals,
            COUNT(DISTINCT d.id) FILTER (WHERE d.status = 'won' AND d."updatedAt" >= ${sinceDate}) as closed_deals,
            SUM(d.amount) FILTER (WHERE d.status = 'won' AND d."updatedAt" >= ${sinceDate}) as revenue,
            
            -- Project metrics
            COUNT(DISTINCT p.id) FILTER (WHERE p."createdAt" >= ${sinceDate}) as new_projects,
            COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'active') as active_projects,
            
            -- Activity metrics
            COUNT(DISTINCT a.id) FILTER (WHERE a."createdAt" >= ${sinceDate}) as activities,
            COUNT(DISTINCT a."userId") FILTER (WHERE a."createdAt" >= ${sinceDate}) as active_users
            
          FROM "Customer" c
          LEFT JOIN "Deal" d ON c.id = d."customerId"
          LEFT JOIN "Project" p ON c.id = p."customerId"
          LEFT JOIN "Activity" a ON c."tenantId" = a."tenantId"
          WHERE c."tenantId" = ${tenantId}
        )
        SELECT 
          *,
          CASE 
            WHEN total_customers > 0 
            THEN ROUND((new_customers::decimal / total_customers * 100), 2)
            ELSE 0 
          END as customer_growth_rate,
          CASE 
            WHEN new_deals > 0 
            THEN ROUND((closed_deals::decimal / new_deals * 100), 2)
            ELSE 0 
          END as close_rate
        FROM period_metrics
      `
      
      return metrics
    },
    
    /**
     * Churn analysis
     */
    async getChurnAnalysis(tenantId: string) {
      return await db.$queryRaw<any[]>`
        WITH customer_activity AS (
          SELECT 
            c.id,
            c.name,
            c."createdAt",
            MAX(GREATEST(
              COALESCE(i."createdAt", '1900-01-01'::timestamp),
              COALESCE(d."updatedAt", '1900-01-01'::timestamp),
              COALESCE(comm."createdAt", '1900-01-01'::timestamp)
            )) as last_activity,
            COUNT(i.id) as invoice_count,
            SUM(i.amount) FILTER (WHERE i.status = 'paid') as total_spent
          FROM "Customer" c
          LEFT JOIN "Invoice" i ON c.id = i."customerId"
          LEFT JOIN "Deal" d ON c.id = d."customerId"
          LEFT JOIN "Communication" comm ON c.id = comm."customerId"
          WHERE c."tenantId" = ${tenantId}
          GROUP BY c.id, c.name, c."createdAt"
        )
        SELECT 
          *,
          DATE_PART('day', NOW() - last_activity) as days_inactive,
          CASE 
            WHEN DATE_PART('day', NOW() - last_activity) > 180 THEN 'High Risk'
            WHEN DATE_PART('day', NOW() - last_activity) > 90 THEN 'Medium Risk'
            WHEN DATE_PART('day', NOW() - last_activity) > 30 THEN 'Low Risk'
            ELSE 'Active'
          END as churn_risk,
          CASE 
            WHEN total_spent > 10000 THEN 'High'
            WHEN total_spent > 1000 THEN 'Medium'
            ELSE 'Low'
          END as value_segment
        FROM customer_activity
        ORDER BY days_inactive DESC
      `
    },
    
    /**
     * Growth metrics over time
     */
    async getGrowthMetrics(tenantId: string, months: number = 12) {
      return await db.$queryRaw<any[]>`
        WITH monthly_metrics AS (
          SELECT 
            DATE_TRUNC('month', date_series) as month,
            
            -- Cumulative customers
            (SELECT COUNT(*) FROM "Customer" c2 
             WHERE c2."tenantId" = ${tenantId} 
             AND c2."createdAt" <= date_series + INTERVAL '1 month' - INTERVAL '1 day') as cumulative_customers,
            
            -- New customers this month
            (SELECT COUNT(*) FROM "Customer" c2 
             WHERE c2."tenantId" = ${tenantId} 
             AND DATE_TRUNC('month', c2."createdAt") = DATE_TRUNC('month', date_series)) as new_customers,
            
            -- Revenue this month
            (SELECT COALESCE(SUM(i.amount), 0) FROM "Invoice" i 
             JOIN "Customer" c2 ON i."customerId" = c2.id
             WHERE c2."tenantId" = ${tenantId} 
             AND i.status = 'paid'
             AND DATE_TRUNC('month', i."createdAt") = DATE_TRUNC('month', date_series)) as monthly_revenue,
            
            -- Active users this month
            (SELECT COUNT(DISTINCT a."userId") FROM "Activity" a 
             WHERE a."tenantId" = ${tenantId} 
             AND DATE_TRUNC('month', a."createdAt") = DATE_TRUNC('month', date_series)) as active_users
            
          FROM generate_series(
            DATE_TRUNC('month', NOW() - INTERVAL '${months} months'),
            DATE_TRUNC('month', NOW()),
            INTERVAL '1 month'
          ) as date_series
        )
        SELECT 
          month,
          cumulative_customers,
          new_customers,
          monthly_revenue,
          active_users,
          LAG(new_customers) OVER (ORDER BY month) as prev_new_customers,
          LAG(monthly_revenue) OVER (ORDER BY month) as prev_revenue,
          CASE 
            WHEN LAG(new_customers) OVER (ORDER BY month) > 0 
            THEN ROUND(((new_customers - LAG(new_customers) OVER (ORDER BY month))::decimal / LAG(new_customers) OVER (ORDER BY month) * 100), 2)
            ELSE 0 
          END as customer_growth_rate,
          CASE 
            WHEN LAG(monthly_revenue) OVER (ORDER BY month) > 0 
            THEN ROUND(((monthly_revenue - LAG(monthly_revenue) OVER (ORDER BY month))::decimal / LAG(monthly_revenue) OVER (ORDER BY month) * 100), 2)
            ELSE 0 
          END as revenue_growth_rate
        FROM monthly_metrics
        ORDER BY month
      `
    }
  }
}