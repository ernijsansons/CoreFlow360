/**
 * CoreFlow360 - Workflows Page
 * Manage automated CRM workflows and triggers
 */

'use client'

export const dynamic = 'force-dynamic'

import { Suspense, lazy } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'

// Enhanced build-time check to prevent prerendering issues
const isBuildTime = () => {
  return typeof window === 'undefined' && 
         (process.env.NODE_ENV === 'production' || process.env.CI === 'true')
}

// Dynamic import with loading fallback
const WorkflowManager = lazy(() =>
  import('@/components/crm/WorkflowManager').then((module) => ({
    default: module.default,
  }))
)

// Loading skeleton component
const WorkflowManagerSkeleton = () => (
  <div className="space-y-6">
    <div className="h-8 animate-pulse rounded bg-gray-200"></div>
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-48 animate-pulse rounded bg-gray-200"></div>
      ))}
    </div>
  </div>
)

export default function WorkflowsPage() {
  // Return a simple loading state during build time
  if (isBuildTime()) {
    return (
      <DashboardLayout>
        <div className="px-4 sm:px-6 lg:px-8">
          <WorkflowManagerSkeleton />
        </div>
      </DashboardLayout>
    )
  }

  const handleWorkflowEdit = (_workflow: unknown) => {
    // TODO: Open workflow editor modal
  }

  const handleWorkflowTest = (_workflow: unknown) => {
    // TODO: Open workflow test runner
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <ErrorBoundary onError={(error, errorInfo) => {}}>
          <Suspense fallback={<WorkflowManagerSkeleton />}>
            <WorkflowManager
              onWorkflowEdit={handleWorkflowEdit}
              onWorkflowTest={handleWorkflowTest}
            />
          </Suspense>
        </ErrorBoundary>
      </div>
    </DashboardLayout>
  )
}
