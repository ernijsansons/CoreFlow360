/**
 * CoreFlow360 - Deals Page
 * Sales pipeline management with AI-powered insights
 */

"use client"

import dynamic from 'next/dynamic'
import DashboardLayout from "@/components/layouts/DashboardLayout"

// Dynamic import to prevent SSR issues
const DealPipeline = dynamic(() => import("@/components/crm/DealPipeline"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
})

export default function DealsPage() {
  const handleDealClick = (deal: any) => {
    console.log('Deal clicked:', deal)
    // TODO: Open deal detail modal or navigate to deal page
  }

  const handleAddDeal = (stageId: string) => {
    console.log('Add deal to stage:', stageId)
    // TODO: Open add deal modal
  }

  const handleEditDeal = (deal: any) => {
    console.log('Edit deal:', deal)
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