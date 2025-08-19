'use client'

import dynamic from 'next/dynamic'
import DashboardLayout from '@/components/layouts/DashboardLayout'

// Force dynamic rendering to prevent SSR issues
export const runtime = 'edge'

const QuantumEvolutionDashboard = dynamic(
  () => import('@/components/consciousness/dashboard/QuantumEvolutionDashboard'),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-white">Loading quantum dashboard...</div>
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
