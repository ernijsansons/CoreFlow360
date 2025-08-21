/**
 * CoreFlow360 - Deals Page
 * Sales pipeline management with AI-powered insights
 */

'use client'

export const dynamic = 'force-dynamic'

import dynamicImport from 'next/dynamic'
import DashboardLayout from '@/components/layouts/DashboardLayout'

// Dynamic import to prevent SSR issues
const DealPipeline = dynamicImport(() => import('@/components/crm/DealPipeline'), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
    </div>
  ),
})

export default function DealsPage() {
  const handleDealClick = (_deal: unknown) => {
    // TODO: Open deal detail modal or navigate to deal page
  }

  const handleAddDeal = (_stageId: string) => {
    // TODO: Open add deal modal
  }

  const handleEditDeal = (_deal: unknown) => {
    // TODO: Open edit deal modal
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <DealPipeline
          onDealClick={handleDealClick}
          onAddDeal={handleAddDeal}
          onEditDeal={handleEditDeal}
        />
      </div>
    </DashboardLayout>
  )
}
