/**
 * CoreFlow360 - Performance Monitoring Framework Exports
 * Advanced performance tracking with real-time metrics
 */

export {
  PerformanceTracker,
  performanceTracker
} from './performance-tracking'

export type {
  PerformanceMetric,
  PerformanceThreshold,
  PerformanceAlert,
  PerformanceStats,
  TrackingOptions
} from './performance-tracking'

// Re-export the main withPerformanceTracking function for convenience
export const withPerformanceTracking = performanceTracker.withPerformanceTracking.bind(performanceTracker)

/*
// Integration Example:
// import { withPerformanceTracking } from '@/lib/monitoring'
// 
// const result = await withPerformanceTracking(
//   'database.getUserData',
//   () => fetchUserFromDatabase(userId),
//   { includeCpuUsage: true, tags: ['database', 'user'] }
// )
*/