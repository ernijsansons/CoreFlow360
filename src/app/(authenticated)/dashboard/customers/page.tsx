'use client'

export const dynamic = 'force-dynamic'

import { Suspense, lazy } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'

// Build-time check to prevent prerendering issues
const isBuildTime = () => {
  return typeof window === 'undefined' && process.env.NODE_ENV === 'production'
}

// Dynamic import with loading fallback
const CRMDashboard = lazy(() =>
  import('@/components/crm/CRMDashboard').then((module) => ({
    default: module.default,
  }))
)

// Loading skeleton component
const CRMDashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="h-8 animate-pulse rounded bg-gray-200"></div>
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 animate-pulse rounded bg-gray-200"></div>
      ))}
    </div>
    <div className="h-96 animate-pulse rounded bg-gray-200"></div>
  </div>
)

export default function CustomersPage() {
  // Return a simple loading state during build time
  if (isBuildTime()) {
    return (
      <DashboardLayout>
        <div className="px-4 sm:px-6 lg:px-8">
          <CRMDashboardSkeleton />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <ErrorBoundary onError={(error, errorInfo) => {}}>
          <Suspense fallback={<CRMDashboardSkeleton />}>
            <CRMDashboard />
          </Suspense>
        </ErrorBoundary>
      </div>
    </DashboardLayout>
  )
}
