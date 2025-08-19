/**
 * CoreFlow360 - Admin Monitoring Page
 * Comprehensive system monitoring dashboard for administrators
 */

import { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import MonitoringDashboard from '@/components/admin/MonitoringDashboard'

export const metadata: Metadata = {
  title: 'System Monitoring | Admin | CoreFlow360',
  description: 'Real-time system monitoring and metrics dashboard for CoreFlow360 administrators',
  robots: 'noindex, nofollow', // Admin pages should not be indexed
}

export default async function MonitoringPage() {
  const session = await auth()

  // Check if user is authenticated and has admin role
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/admin/monitoring')
  }

  if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <MonitoringDashboard />
      </div>
    </div>
  )
}
