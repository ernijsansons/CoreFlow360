/**
 * CoreFlow360 - HVAC Module Dashboard
 * Main dashboard for HVAC/Field Service management
 */

'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import EquipmentManager from '@/components/hvac/EquipmentManager'
import ServiceScheduler from '@/components/hvac/ServiceScheduler'
import ContractManager from '@/components/hvac/ContractManager'
import MobileFieldService from '@/components/hvac/MobileFieldService'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  WrenchScrewdriverIcon,
  CalendarIcon,
  DocumentTextIcon,
  CogIcon,
  ChartBarIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline'

export default function HVACPage() {
  const [activeTab, setActiveTab] = useState('equipment')

  const handleEquipmentSelect = (_equipment: unknown) => {
    // TODO: Open equipment detail modal or navigate to equipment page
  }

  const handleAddEquipment = () => {
    // TODO: Open add equipment modal
  }

  const handleScheduleService = (_equipment: unknown) => {
    // TODO: Open service scheduling modal with equipment pre-selected
    setActiveTab('scheduler')
  }

  const handleWorkOrderSelect = (_workOrder: unknown) => {
    // TODO: Open work order detail modal
  }

  const handleCreateWorkOrder = () => {
    // TODO: Open create work order modal
  }

  const handleEditWorkOrder = (_workOrder: unknown) => {
    // TODO: Open edit work order modal
  }

  const handleAssignTechnician = (_workOrderId: string, _technicianId: string) => {
    // TODO: Update work order assignment
  }

  const handleContractSelect = (_contract: unknown) => {
    // TODO: Open contract detail modal
  }

  const handleCreateContract = () => {
    // TODO: Open create contract modal
  }

  const handleRenewContract = (_contract: unknown) => {
    // TODO: Open contract renewal flow
  }

  const handleScheduleContractService = (_contract: unknown, _equipmentId: string) => {
    // TODO: Open scheduling with contract context
  }

  const handleWorkOrderUpdate = (_workOrder: unknown) => {
    // TODO: Sync work order changes
  }

  const handleNavigateToLocation = (_coordinates: { lat: number; lng: number }) => {
    // TODO: Open maps app with coordinates
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">HVAC Management</h1>
            <p className="mt-2 text-gray-600">
              Comprehensive field service management for HVAC operations
            </p>
          </div>

          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="equipment" className="flex items-center space-x-2">
                <WrenchScrewdriverIcon className="h-4 w-4" />
                <span>Equipment</span>
              </TabsTrigger>
              <TabsTrigger value="scheduler" className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4" />
                <span>Scheduler</span>
              </TabsTrigger>
              <TabsTrigger value="contracts" className="flex items-center space-x-2">
                <DocumentTextIcon className="h-4 w-4" />
                <span>Contracts</span>
              </TabsTrigger>
              <TabsTrigger value="mobile" className="flex items-center space-x-2">
                <DevicePhoneMobileIcon className="h-4 w-4" />
                <span>Mobile</span>
              </TabsTrigger>
              <TabsTrigger value="maintenance" className="flex items-center space-x-2">
                <CogIcon className="h-4 w-4" />
                <span>Maintenance</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center space-x-2">
                <ChartBarIcon className="h-4 w-4" />
                <span>Reports</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="equipment" className="mt-6">
              <EquipmentManager
                onEquipmentSelect={handleEquipmentSelect}
                onAddEquipment={handleAddEquipment}
                onScheduleService={handleScheduleService}
              />
            </TabsContent>

            <TabsContent value="scheduler" className="mt-6">
              <ServiceScheduler
                onWorkOrderSelect={handleWorkOrderSelect}
                onCreateWorkOrder={handleCreateWorkOrder}
                onEditWorkOrder={handleEditWorkOrder}
                onAssignTechnician={handleAssignTechnician}
              />
            </TabsContent>

            <TabsContent value="contracts" className="mt-6">
              <ContractManager
                onContractSelect={handleContractSelect}
                onCreateContract={handleCreateContract}
                onRenewContract={handleRenewContract}
                onScheduleService={handleScheduleContractService}
              />
            </TabsContent>

            <TabsContent value="mobile" className="mt-6">
              <MobileFieldService
                technicianId="tech-1"
                onWorkOrderUpdate={handleWorkOrderUpdate}
                onNavigateToLocation={handleNavigateToLocation}
              />
            </TabsContent>

            <TabsContent value="maintenance" className="mt-6">
              <div className="py-12 text-center">
                <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Maintenance Planning</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Preventive maintenance scheduling and tracking (Coming Soon)
                </p>
              </div>
            </TabsContent>

            <TabsContent value="reports" className="mt-6">
              <div className="py-12 text-center">
                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">HVAC Reports</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Equipment performance and service analytics (Coming Soon)
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  )
}
