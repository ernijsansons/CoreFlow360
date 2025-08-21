/**
 * CoreFlow360 - Leads Page
 * Lead management with AI-powered scoring and duplicate detection
 */

'use client'

export const dynamic = 'force-dynamic'

import DashboardLayout from '@/components/layouts/DashboardLayout'
import LeadManagement from '@/components/crm/LeadManagement'

export default function LeadsPage() {
  const handleLeadClick = (_lead: unknown) => {
    // TODO: Open lead detail modal or navigate to lead page
  }

  const handleAddLead = () => {
    // TODO: Open add lead modal
  }

  const handleEditLead = (_lead: unknown) => {
    // TODO: Open edit lead modal
  }

  const handleConvertLead = (_lead: unknown) => {
    // TODO: Open lead conversion modal or flow
  }

  const handleMergeLeads = (_primaryLead: unknown, _duplicates: unknown[]) => {
    // TODO: Open merge confirmation modal and perform merge
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <LeadManagement
          onLeadClick={handleLeadClick}
          onAddLead={handleAddLead}
          onEditLead={handleEditLead}
          onConvertLead={handleConvertLead}
          onMergeLeads={handleMergeLeads}
        />
      </div>
    </DashboardLayout>
  )
}
