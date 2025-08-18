/**
 * CoreFlow360 - Bug Bot Admin Page
 * Access point for the bug bot dashboard
 */

import BugBotDashboard from '@/components/admin/BugBotDashboard'

export default function BugBotPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <BugBotDashboard />
    </div>
  )
}
