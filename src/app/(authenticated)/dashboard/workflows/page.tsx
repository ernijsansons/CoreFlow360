/**
 * CoreFlow360 - Workflows Page
 * Manage automated CRM workflows and triggers
 */

"use client"

import DashboardLayout from "@/components/layouts/DashboardLayout"
import WorkflowManager from "@/components/crm/WorkflowManager"
import { WorkflowTrigger } from "@/lib/crm/workflow-engine"

export default function WorkflowsPage() {
  const handleWorkflowEdit = (workflow: WorkflowTrigger) => {
    console.log('Edit workflow:', workflow)
    // TODO: Open workflow editor modal
  }

  const handleWorkflowTest = (workflow: WorkflowTrigger) => {
    console.log('Test workflow:', workflow)
    // TODO: Open workflow test runner
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <WorkflowManager
          onWorkflowEdit={handleWorkflowEdit}
          onWorkflowTest={handleWorkflowTest}
        />
      </div>
    </DashboardLayout>
  )
}