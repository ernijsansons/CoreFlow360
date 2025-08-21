'use client'

export const dynamic = 'force-dynamic'

import dynamicImport from 'next/dynamic'
import DashboardLayout from '@/components/layouts/DashboardLayout'

// Force dynamic rendering to prevent SSR issues
// export const runtime = 'edge' // Temporarily disabled due to build issues

const QuantumEvolutionDashboard = dynamicImport(
  () => import('@/components/consciousness/dashboard/QuantumEvolutionDashboard'),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-white">Loading business intelligence dashboard...</div>
      </div>
    ),
  }
)

export default function EvolutionDashboardPage() {
  return (
    <DashboardLayout>
      <QuantumEvolutionDashboard />
    </DashboardLayout>
  )
}
