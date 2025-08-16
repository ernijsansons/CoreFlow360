/**
 * CoreFlow360 - CRM Analytics Page
 * Comprehensive business intelligence and real-time metrics
 */

"use client"

import { Suspense, lazy, useMemo } from "react"
import DashboardLayout from "@/components/layouts/DashboardLayout"
import { ErrorBoundary } from "@/components/error/ErrorBoundary"

// Dynamic import for analytics dashboard
const CRMAnalyticsDashboard = lazy(() => import("@/components/crm/CRMAnalyticsDashboard"))

// Analytics loading skeleton
const AnalyticsLoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
      <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="h-80 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-80 bg-gray-200 rounded animate-pulse"></div>
    </div>
  </div>
)

export default function AnalyticsPage() {
  // Memoize event handlers to prevent unnecessary re-renders
  const handleMetricClick = useMemo(() => (metric: string, data: any) => {
    console.log('Metric clicked:', { metric, data })
    // TODO: Open detailed metric analysis or drill-down view
  }, [])

  const handleExportReport = useMemo(() => () => {
    console.log('Export analytics report')
    // TODO: Generate and download comprehensive analytics report
  }, [])

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <ErrorBoundary
          onError={(error, errorInfo) => {
            console.error('Analytics Dashboard Error:', error, errorInfo)
          }}
        >
          <Suspense fallback={<AnalyticsLoadingSkeleton />}>
            <CRMAnalyticsDashboard
              timeframe="month"
              onMetricClick={handleMetricClick}
              onExportReport={handleExportReport}
            />
          </Suspense>
        </ErrorBoundary>
      </div>
    </DashboardLayout>
  )
}