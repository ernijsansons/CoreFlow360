/**
 * CoreFlow360 - Sales Forecasting Page
 * Predictive analytics and sales trend analysis
 */

'use client'

import DashboardLayout from '@/components/layouts/DashboardLayout'
import SalesForecasting from '@/components/crm/SalesForecasting'

export default function ForecastingPage() {
  const handleDrillDown = (_forecast: unknown) => {
    // TODO: Open detailed forecast analysis
  }

  const handleExportData = (_forecast: unknown) => {
    // TODO: Generate and download forecast report
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <SalesForecasting onDrillDown={handleDrillDown} onExportData={handleExportData} />
      </div>
    </DashboardLayout>
  )
}
