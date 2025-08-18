/**
 * CoreFlow360 - Workflows Page
 * Manage automated CRM workflows and triggers
 */

"use client"

import { Suspense, lazy } from "react"
import DashboardLayout from "@/components/layouts/DashboardLayout"
import { ErrorBoundary } from "@/components/error/ErrorBoundary"

// Build-time check to prevent prerendering issues
const isBuildTime = () => {
  return typeof window === 'undefined' && process.env.NODE_ENV === 'production'
}

// Dynamic import with loading fallback
const WorkflowManager = lazy(() => import("@/components/crm/WorkflowManager").then(module => ({
  default: module.default
})))

// Loading skeleton component
const WorkflowManagerSkeleton = () => (
  <div className="space-y-6">
    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-48 bg-gray-200 rounded animate-pulse"></div>
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

  const handleWorkflowEdit = (workflow: any) => {
    console.log('Edit workflow:', workflow)
    // TODO: Open workflow editor modal
  }

  const handleWorkflowTest = (workflow: any) => {
    console.log('Test workflow:', workflow)
    // TODO: Open workflow test runner
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <ErrorBoundary 
          onError={(error, errorInfo) => {
            console.error('Workflow Manager Error:', error, errorInfo)
          }}
        >
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