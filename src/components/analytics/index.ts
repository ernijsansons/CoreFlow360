/**
 * CoreFlow360 - Analytics Components Index
 * Centralized export for all analytics components
 */

export { AIBusinessAnalytics } from './AIBusinessAnalytics'
export { RealTimeAnalyticsDashboard } from './RealTimeAnalyticsDashboard'
export { AnalyticsReportBuilder } from './AnalyticsReportBuilder'

// Export analytics service and engine
export { AdvancedAnalyticsEngine, createAnalyticsEngine } from '../../lib/analytics/advanced-analytics-engine'
export { AnalyticsService, createAnalyticsService } from '../../lib/analytics/analytics-service'

// Analytics types
export type {
  DataPoint,
  AnalyticsQuery,
  AnalyticsResult,
  PredictionResult,
  AnomalyResult,
  BusinessInsight
} from '../../lib/analytics/advanced-analytics-engine'

export type {
  DashboardMetric,
  BusinessKPI,
  CrossBusinessAnalysis
} from '../../lib/analytics/analytics-service'