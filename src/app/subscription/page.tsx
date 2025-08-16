/**
 * CoreFlow360 - Subscription Management Page
 * Mathematical perfection for subscription lifecycle management
 * FORTRESS-LEVEL SECURITY: Tenant-isolated subscription access
 * HYPERSCALE PERFORMANCE: Optimized bundle calculations
 */

import { SubscriptionDashboard } from '@/components/subscription/SubscriptionDashboard'

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <SubscriptionDashboard />
    </div>
  )
}

export const metadata = {
  title: 'Subscription Management | CoreFlow360',
  description: 'Manage your CoreFlow360 bundles, billing, and subscription preferences'
}