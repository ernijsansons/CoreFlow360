import dynamic from 'next/dynamic'
import DashboardLayout from '@/components/layouts/DashboardLayout'

const QuantumEvolutionDashboard = dynamic(
  () => import('@/components/consciousness/dashboard/QuantumEvolutionDashboard'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading quantum dashboard...</div>
      </div>
    )
  }
)

export default function EvolutionDashboardPage() {
  return (
    <DashboardLayout>
      <QuantumEvolutionDashboard />
    </DashboardLayout>
  )
}