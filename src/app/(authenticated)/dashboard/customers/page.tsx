"use client"

import DashboardLayout from "@/components/layouts/DashboardLayout"
import CRMDashboard from "@/components/crm/CRMDashboard"
import { ErrorBoundary } from "@/components/error/ErrorBoundary"

export default function CustomersPage() {
  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <ErrorBoundary 
          onError={(error, errorInfo) => {
            console.error('CRM Dashboard Error:', error, errorInfo)
          }}
        >
          <CRMDashboard />
        </ErrorBoundary>
      </div>
    </DashboardLayout>
  )
}