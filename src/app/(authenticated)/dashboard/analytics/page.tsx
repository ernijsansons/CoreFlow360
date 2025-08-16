/**
 * CoreFlow360 - CRM Analytics Page
 * Comprehensive business intelligence and real-time metrics
 */

"use client"

import DashboardLayout from "@/components/layouts/DashboardLayout"
import CRMAnalyticsDashboard from "@/components/crm/CRMAnalyticsDashboard"

export default function AnalyticsPage() {
  const handleMetricClick = (metric: string, data: any) => {
    console.log('Metric clicked:', { metric, data })
    // TODO: Open detailed metric analysis or drill-down view
  }

  const handleExportReport = () => {
    console.log('Export analytics report')
    // TODO: Generate and download comprehensive analytics report
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <CRMAnalyticsDashboard
          timeframe="month"
          onMetricClick={handleMetricClick}
          onExportReport={handleExportReport}
        />
      </div>
    </DashboardLayout>
  )
}