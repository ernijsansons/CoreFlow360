/**
 * CoreFlow360 - Analytics Service
 * Business intelligence service layer for advanced analytics operations
 */

import { PrismaClient } from '@prisma/client'
import { AdvancedAnalyticsEngine, createAnalyticsEngine, DataPoint, AnalyticsQuery, BusinessInsight } from './advanced-analytics-engine'

export interface AnalyticsServiceConfig {
  prisma: PrismaClient
  enableCaching: boolean
  cacheTimeout: number
  enableRealTime: boolean
  enablePredictions: boolean
  enableAnomalyDetection: boolean
}

export interface DashboardMetric {
  id: string
  name: string
  value: number
  previousValue: number
  change: number
  changePercent: number
  trend: 'up' | 'down' | 'stable'
  category: 'revenue' | 'customers' | 'performance' | 'engagement'
  timestamp: Date
  confidence?: number
}

export interface BusinessKPI {
  id: string
  name: string
  current: number
  target: number
  achievement: number
  trend: number[]
  status: 'on-track' | 'at-risk' | 'off-track'
  description: string
}

export interface CrossBusinessAnalysis {
  businessComparison: Array<{
    businessId: string
    businessName: string
    metrics: Record<string, number>
    ranking: number
    trend: 'improving' | 'declining' | 'stable'
  }>
  correlations: Array<{
    metric1: string
    metric2: string
    correlation: number
    strength: 'weak' | 'moderate' | 'strong'
    businesses: string[]
  }>
  opportunities: Array<{
    type: 'cross_selling' | 'resource_sharing' | 'market_expansion'
    businesses: string[]
    potentialValue: number
    confidence: number
    description: string
  }>
}

export class AnalyticsService {
  private analyticsEngine: AdvancedAnalyticsEngine
  private config: AnalyticsServiceConfig
  private cache: Map<string, { data: any; timestamp: number }> = new Map()

  constructor(config: AnalyticsServiceConfig) {
    this.config = config
    this.analyticsEngine = createAnalyticsEngine(config.prisma, {
      enablePredictiveModels: config.enablePredictions,
      enableAnomalyDetection: config.enableAnomalyDetection,
      enableRealTimeProcessing: config.enableRealTime
    })
  }

  // Track business events
  async trackEvent(tenantId: string, event: string, value: number, metadata: Record<string, any> = {}): Promise<void> {
    const dataPoint: DataPoint = {
      timestamp: new Date(),
      tenantId,
      event,
      value,
      dimensions: metadata,
      tags: this.generateTags(event, metadata)
    }

    await this.analyticsEngine.track(dataPoint)
  }

  // Get dashboard metrics
  async getDashboardMetrics(tenantId: string, timeRange: '24h' | '7d' | '30d' = '24h'): Promise<DashboardMetric[]> {
    const cacheKey = `dashboard-metrics:${tenantId}:${timeRange}`
    
    if (this.config.enableCaching) {
      const cached = this.getFromCache(cacheKey)
      if (cached) return cached
    }

    const endDate = new Date()
    const startDate = this.getStartDate(endDate, timeRange)
    const previousStartDate = this.getStartDate(startDate, timeRange)

    const metrics = await Promise.all([
      this.calculateRevenueMetrics(tenantId, startDate, endDate, previousStartDate),
      this.calculateCustomerMetrics(tenantId, startDate, endDate, previousStartDate),
      this.calculatePerformanceMetrics(tenantId, startDate, endDate, previousStartDate),
      this.calculateEngagementMetrics(tenantId, startDate, endDate, previousStartDate)
    ])

    const result = metrics.flat()

    if (this.config.enableCaching) {
      this.setCache(cacheKey, result)
    }

    return result
  }

  // Get business KPIs
  async getBusinessKPIs(tenantId: string): Promise<BusinessKPI[]> {
    const cacheKey = `business-kpis:${tenantId}`
    
    if (this.config.enableCaching) {
      const cached = this.getFromCache(cacheKey)
      if (cached) return cached
    }

    const kpis: BusinessKPI[] = []

    // Revenue KPIs
    const monthlyRevenue = await this.calculateMonthlyRevenue(tenantId)
    kpis.push({
      id: 'monthly-revenue',
      name: 'Monthly Revenue',
      current: monthlyRevenue.current,
      target: monthlyRevenue.target,
      achievement: (monthlyRevenue.current / monthlyRevenue.target) * 100,
      trend: monthlyRevenue.trend,
      status: this.getKPIStatus(monthlyRevenue.current, monthlyRevenue.target),
      description: 'Total monthly recurring revenue across all business units'
    })

    // Customer Acquisition KPIs
    const customerAcquisition = await this.calculateCustomerAcquisition(tenantId)
    kpis.push({
      id: 'customer-acquisition',
      name: 'Customer Acquisition',
      current: customerAcquisition.current,
      target: customerAcquisition.target,
      achievement: (customerAcquisition.current / customerAcquisition.target) * 100,
      trend: customerAcquisition.trend,
      status: this.getKPIStatus(customerAcquisition.current, customerAcquisition.target),
      description: 'New customers acquired this month'
    })

    // Churn Rate KPI
    const churnRate = await this.calculateChurnRate(tenantId)
    kpis.push({
      id: 'churn-rate',
      name: 'Customer Churn Rate',
      current: churnRate.current,
      target: churnRate.target,
      achievement: ((churnRate.target - churnRate.current) / churnRate.target) * 100, // Lower is better
      trend: churnRate.trend,
      status: this.getKPIStatus(churnRate.current, churnRate.target, true), // Reverse logic
      description: 'Percentage of customers lost this month'
    })

    if (this.config.enableCaching) {
      this.setCache(cacheKey, kpis)
    }

    return kpis
  }

  // Get advanced insights
  async getAdvancedInsights(tenantId: string, category?: string): Promise<BusinessInsight[]> {
    const insights = await this.analyticsEngine.generateInsights(tenantId, category)
    
    // Enrich insights with additional business context
    const enrichedInsights = await Promise.all(
      insights.map(async (insight) => {
        const enriched = { ...insight }
        
        // Add business impact scoring
        enriched.impact = await this.calculateBusinessImpact(insight, tenantId)
        
        // Add recommended actions based on insight type
        enriched.recommendations = await this.generateActionRecommendations(insight, tenantId)
        
        return enriched
      })
    )

    return enrichedInsights
  }

  // Cross-business analysis
  async getCrossBusinessAnalysis(tenantIds: string[]): Promise<CrossBusinessAnalysis> {
    const cacheKey = `cross-business:${tenantIds.join(',')}`
    
    if (this.config.enableCaching) {
      const cached = this.getFromCache(cacheKey)
      if (cached) return cached
    }

    // Business comparison
    const businessComparison = await Promise.all(
      tenantIds.map(async (tenantId, index) => {
        const metrics = await this.getBusinessMetricsSnapshot(tenantId)
        return {
          businessId: tenantId,
          businessName: await this.getBusinessName(tenantId),
          metrics,
          ranking: index + 1, // Will be sorted later
          trend: this.calculateBusinessTrend(metrics)
        }
      })
    )

    // Sort by overall performance score
    businessComparison.sort((a, b) => this.calculatePerformanceScore(b.metrics) - this.calculatePerformanceScore(a.metrics))
    businessComparison.forEach((business, index) => {
      business.ranking = index + 1
    })

    // Calculate correlations between metrics
    const correlations = await this.calculateMetricCorrelations(tenantIds)

    // Identify business opportunities
    const opportunities = await this.identifyBusinessOpportunities(tenantIds)

    const result = {
      businessComparison,
      correlations,
      opportunities
    }

    if (this.config.enableCaching) {
      this.setCache(cacheKey, result)
    }

    return result
  }

  // Predictive analytics
  async getPredictiveAnalysis(tenantId: string, metric: string, periods: number = 30) {
    return await this.analyticsEngine.predict(metric, tenantId, periods)
  }

  // Anomaly detection
  async getAnomalies(tenantId: string, metric: string, sensitivity: number = 0.95) {
    return await this.analyticsEngine.detectAnomalies(metric, tenantId, sensitivity)
  }

  // Segmentation analysis
  async performCustomerSegmentation(tenantId: string, features: string[] = ['revenue', 'engagement', 'tenure']) {
    return await this.analyticsEngine.performSegmentation(tenantId, features)
  }

  // A/B test analysis
  async analyzeABTest(testId: string, metric: string) {
    return await this.analyticsEngine.analyzeABTest(testId, metric)
  }

  // Cohort analysis
  async performCohortAnalysis(tenantId: string, type: 'acquisition' | 'behavioral' = 'acquisition') {
    return await this.analyticsEngine.performCohortAnalysis(tenantId, type)
  }

  // Private helper methods
  private generateTags(event: string, metadata: Record<string, any>): string[] {
    const tags = [event]
    
    if (metadata.businessUnit) tags.push(`business:${metadata.businessUnit}`)
    if (metadata.source) tags.push(`source:${metadata.source}`)
    if (metadata.category) tags.push(`category:${metadata.category}`)
    
    return tags
  }

  private getStartDate(endDate: Date, timeRange: string): Date {
    const start = new Date(endDate)
    
    switch (timeRange) {
      case '24h':
        start.setHours(start.getHours() - 24)
        break
      case '7d':
        start.setDate(start.getDate() - 7)
        break
      case '30d':
        start.setDate(start.getDate() - 30)
        break
    }
    
    return start
  }

  private async calculateRevenueMetrics(tenantId: string, start: Date, end: Date, previousStart: Date): Promise<DashboardMetric[]> {
    const query: AnalyticsQuery = {
      metrics: ['value'],
      filters: { tenantId, event: 'revenue' },
      timeRange: { start, end },
      granularity: '1d'
    }

    const previousQuery: AnalyticsQuery = {
      ...query,
      timeRange: { start: previousStart, end: start }
    }

    const [current, previous] = await Promise.all([
      this.analyticsEngine.query(query),
      this.analyticsEngine.query(previousQuery)
    ])

    const currentValue = current.data.reduce((sum, point) => sum + (point.values.value || 0), 0)
    const previousValue = previous.data.reduce((sum, point) => sum + (point.values.value || 0), 0)
    const change = currentValue - previousValue
    const changePercent = previousValue > 0 ? (change / previousValue) * 100 : 0

    return [{
      id: 'revenue',
      name: 'Total Revenue',
      value: currentValue,
      previousValue,
      change,
      changePercent,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      category: 'revenue',
      timestamp: new Date(),
      confidence: current.metadata.confidence
    }]
  }

  private async calculateCustomerMetrics(tenantId: string, start: Date, end: Date, previousStart: Date): Promise<DashboardMetric[]> {
    // Implementation would query customer-related metrics
    // This is a simplified version
    return [{
      id: 'customers',
      name: 'Active Customers',
      value: 1250,
      previousValue: 1180,
      change: 70,
      changePercent: 5.93,
      trend: 'up',
      category: 'customers',
      timestamp: new Date()
    }]
  }

  private async calculatePerformanceMetrics(tenantId: string, start: Date, end: Date, previousStart: Date): Promise<DashboardMetric[]> {
    return [{
      id: 'performance',
      name: 'System Performance',
      value: 98.5,
      previousValue: 97.2,
      change: 1.3,
      changePercent: 1.34,
      trend: 'up',
      category: 'performance',
      timestamp: new Date()
    }]
  }

  private async calculateEngagementMetrics(tenantId: string, start: Date, end: Date, previousStart: Date): Promise<DashboardMetric[]> {
    return [{
      id: 'engagement',
      name: 'User Engagement',
      value: 87.3,
      previousValue: 84.1,
      change: 3.2,
      changePercent: 3.80,
      trend: 'up',
      category: 'engagement',
      timestamp: new Date()
    }]
  }

  private async calculateMonthlyRevenue(tenantId: string) {
    return {
      current: 125000,
      target: 150000,
      trend: [95000, 105000, 115000, 125000]
    }
  }

  private async calculateCustomerAcquisition(tenantId: string) {
    return {
      current: 45,
      target: 50,
      trend: [38, 42, 47, 45]
    }
  }

  private async calculateChurnRate(tenantId: string) {
    return {
      current: 2.3,
      target: 2.0,
      trend: [2.8, 2.5, 2.1, 2.3]
    }
  }

  private getKPIStatus(current: number, target: number, reverse: boolean = false): 'on-track' | 'at-risk' | 'off-track' {
    const ratio = current / target
    const threshold1 = reverse ? 1.1 : 0.9
    const threshold2 = reverse ? 1.2 : 0.8

    if (reverse) {
      if (ratio <= 1) return 'on-track'
      if (ratio <= threshold1) return 'at-risk'
      return 'off-track'
    } else {
      if (ratio >= 1) return 'on-track'
      if (ratio >= threshold1) return 'at-risk'
      return 'off-track'
    }
  }

  private async calculateBusinessImpact(insight: BusinessInsight, tenantId: string): Promise<number> {
    // Enhanced impact calculation based on business context
    let baseImpact = insight.impact || 0
    
    // Adjust based on confidence
    baseImpact *= insight.confidence
    
    // Adjust based on category importance
    const categoryWeights = {
      financial: 1.2,
      growth: 1.1,
      operational: 1.0,
      customer: 1.05
    }
    
    baseImpact *= categoryWeights[insight.category] || 1.0
    
    return Math.min(100, Math.max(0, baseImpact))
  }

  private async generateActionRecommendations(insight: BusinessInsight, tenantId: string): Promise<string[]> {
    const baseRecommendations = insight.recommendations || []
    
    // Add context-specific recommendations
    const contextRecommendations: string[] = []
    
    if (insight.type === 'opportunity') {
      contextRecommendations.push('Schedule stakeholder review meeting')
      contextRecommendations.push('Create implementation timeline')
    }
    
    if (insight.type === 'risk') {
      contextRecommendations.push('Implement monitoring alerts')
      contextRecommendations.push('Create mitigation plan')
    }
    
    return [...baseRecommendations, ...contextRecommendations]
  }

  private async getBusinessMetricsSnapshot(tenantId: string): Promise<Record<string, number>> {
    // This would fetch actual metrics from the database
    return {
      revenue: Math.random() * 100000,
      customers: Math.random() * 1000,
      growth: Math.random() * 20,
      satisfaction: Math.random() * 100
    }
  }

  private async getBusinessName(tenantId: string): Promise<string> {
    // This would fetch the actual business name from the database
    const names = ['TechFlow Solutions', 'GreenTech Manufacturing', 'Urban Consulting Group', 'RetailMax Plus']
    return names[Math.floor(Math.random() * names.length)]
  }

  private calculateBusinessTrend(metrics: Record<string, number>): 'improving' | 'declining' | 'stable' {
    // Simplified trend calculation
    const score = Object.values(metrics).reduce((sum, val) => sum + val, 0)
    const threshold = Math.random() * 100
    
    if (score > threshold * 1.1) return 'improving'
    if (score < threshold * 0.9) return 'declining'
    return 'stable'
  }

  private calculatePerformanceScore(metrics: Record<string, number>): number {
    return Object.values(metrics).reduce((sum, val) => sum + val, 0) / Object.keys(metrics).length
  }

  private async calculateMetricCorrelations(tenantIds: string[]) {
    // This would perform actual correlation analysis
    return [
      {
        metric1: 'revenue',
        metric2: 'customer_satisfaction',
        correlation: 0.78,
        strength: 'strong' as const,
        businesses: tenantIds.slice(0, 2)
      },
      {
        metric1: 'marketing_spend',
        metric2: 'customer_acquisition',
        correlation: 0.65,
        strength: 'moderate' as const,
        businesses: tenantIds
      }
    ]
  }

  private async identifyBusinessOpportunities(tenantIds: string[]) {
    return [
      {
        type: 'cross_selling' as const,
        businesses: tenantIds.slice(0, 2),
        potentialValue: 120000,
        confidence: 0.82,
        description: 'Customer overlap suggests strong cross-selling potential'
      },
      {
        type: 'resource_sharing' as const,
        businesses: tenantIds,
        potentialValue: 85000,
        confidence: 0.88,
        description: 'Consolidate IT infrastructure for cost savings'
      }
    ]
  }

  private getFromCache(key: string): any {
    if (!this.config.enableCaching) return null
    
    const cached = this.cache.get(key)
    if (!cached) return null
    
    if (Date.now() - cached.timestamp > this.config.cacheTimeout) {
      this.cache.delete(key)
      return null
    }
    
    return cached.data
  }

  private setCache(key: string, data: any): void {
    if (!this.config.enableCaching) return
    
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }
}

// Factory function
export const createAnalyticsService = (config: Partial<AnalyticsServiceConfig> & { prisma: PrismaClient }): AnalyticsService => {
  const defaultConfig: AnalyticsServiceConfig = {
    enableCaching: true,
    cacheTimeout: 300000, // 5 minutes
    enableRealTime: true,
    enablePredictions: true,
    enableAnomalyDetection: true,
    ...config
  }
  
  return new AnalyticsService(defaultConfig)
}