/**
 * CoreFlow360 - CRM Analytics Page
 * Comprehensive business intelligence and real-time metrics
 */

'use client'

export const dynamic = 'force-dynamic'

import { Suspense, lazy, useMemo } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'

// Dynamic import for analytics dashboard
const CRMAnalyticsDashboard = lazy(() => import('@/components/crm/CRMAnalyticsDashboard'))

// Analytics loading skeleton
const AnalyticsLoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="h-8 w-64 animate-pulse rounded bg-gray-200"></div>
      <div className="h-10 w-32 animate-pulse rounded bg-gray-200"></div>
    </div>
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 animate-pulse rounded bg-gray-200"></div>
      ))}
    </div>
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="h-80 animate-pulse rounded bg-gray-200"></div>
      <div className="h-80 animate-pulse rounded bg-gray-200"></div>
    </div>
  </div>
)

export default function AnalyticsPage() {
  // Memoize event handlers to prevent unnecessary re-renders
  const handleMetricClick = useMemo(
    () => (_metric: string, _data: unknown) => {
      // TODO: Open detailed metric analysis or drill-down view
    },
    []
  )

  const handleExportReport = useMemo(
    () => () => {
      // TODO: Generate and download comprehensive analytics report
    },
    []
  )

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <ErrorBoundary onError={(error, errorInfo) => {}}>
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