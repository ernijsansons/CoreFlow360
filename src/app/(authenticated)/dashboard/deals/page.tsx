/**
 * CoreFlow360 - Deals Page
 * Sales pipeline management with AI-powered insights
 */

"use client"

import DashboardLayout from "@/components/layouts/DashboardLayout"
import DealPipeline from "@/components/crm/DealPipeline"

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