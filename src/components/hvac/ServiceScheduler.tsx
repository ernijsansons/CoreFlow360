/**
 * CoreFlow360 - Service Scheduler for HVAC/Field Service
 * Advanced scheduling and dispatch system with route optimization
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  MapIcon,
  WrenchScrewdriverIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlusIcon,
  FunnelIcon,
  ArrowPathIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  FireIcon,
  BoltIcon,
} from '@heroicons/react/24/outline'

interface WorkOrder {
  id: string
  workOrderNumber: string
  title: string
  description?: string
  type: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY'
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD'
  scheduledDate: string
  scheduledStartTime?: string
  scheduledEndTime?: string
  duration?: number
  customerId: string
  customerName: string
  customerAddress: string
  customerPhone?: string
  technicianId?: string
  technicianName?: string
  equipmentType?: string
  serviceType?: string
  estimatedDuration: number
  urgencyScore: number
}

interface Technician {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  skills: string[]
  currentLocation?: string
  availability: 'AVAILABLE' | 'BUSY' | 'OFF_DUTY'
  workloadToday: number
  rating: number
}

interface ScheduleView {
  date: string
  technicians: {
    [technicianId: string]: {
      technician: Technician
      workOrders: WorkOrder[]
      totalHours: number
      efficiency: number
    }
  }
}

interface ServiceSchedulerProps {
  onWorkOrderSelect?: (workOrder: WorkOrder) => void
  onCreateWorkOrder?: () => void
  onEditWorkOrder?: (workOrder: WorkOrder) => void
  onAssignTechnician?: (workOrderId: string, technicianId: string) => void
}

const priorityColors = {
  LOW: 'text-green-700 bg-green-100',
  MEDIUM: 'text-yellow-700 bg-yellow-100',
  HIGH: 'text-orange-700 bg-orange-100',
  EMERGENCY: 'text-red-700 bg-red-100',
}

const statusColors = {
  SCHEDULED: 'text-blue-700 bg-blue-100',
  IN_PROGRESS: 'text-purple-700 bg-purple-100',
  COMPLETED: 'text-green-700 bg-green-100',
  CANCELLED: 'text-gray-700 bg-gray-100',
  ON_HOLD: 'text-orange-700 bg-orange-100',
}

export default function ServiceScheduler({
  onWorkOrderSelect,
  onCreateWorkOrder,
  onEditWorkOrder,
  onAssignTechnician,
}: ServiceSchedulerProps) {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [scheduleView, setScheduleView] = useState<ScheduleView | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [viewMode, setViewMode] = useState<'list' | 'board' | 'calendar'>('board')
  const [filterTechnician, setFilterTechnician] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    loadScheduleData()
  }, [selectedDate])

  const loadScheduleData = async () => {
    try {
      setLoading(true)

      // Mock technicians
      const mockTechnicians: Technician[] = [
        {
          id: 'tech-1',
          name: 'John Smith',
          email: 'john@company.com',
          phone: '555-0101',
          skills: ['HVAC', 'Electrical', 'Plumbing'],
          availability: 'AVAILABLE',
          workloadToday: 6,
          rating: 4.8,
        },
        {
          id: 'tech-2',
          name: 'Mike Johnson',
          email: 'mike@company.com',
          phone: '555-0102',
          skills: ['HVAC', 'Refrigeration'],
          availability: 'BUSY',
          workloadToday: 8,
          rating: 4.6,
        },
        {
          id: 'tech-3',
          name: 'Sarah Wilson',
          email: 'sarah@company.com',
          phone: '555-0103',
          skills: ['HVAC', 'Controls', 'Electrical'],
          availability: 'AVAILABLE',
          workloadToday: 4,
          rating: 4.9,
        },
      ]

      // Mock work orders
      const mockWorkOrders: WorkOrder[] = [
        {
          id: 'wo-1',
          workOrderNumber: 'WO-2024-001',
          title: 'Annual Furnace Maintenance',
          description: 'Routine annual service for gas furnace',
          type: 'MAINTENANCE',
          priority: 'MEDIUM',
          status: 'SCHEDULED',
          scheduledDate: selectedDate,
          scheduledStartTime: '09:00',
          scheduledEndTime: '11:00',
          duration: 120,
          customerId: 'cust-1',
          customerName: 'Johnson Residence',
          customerAddress: '123 Main St, Springfield',
          customerPhone: '555-1234',
          technicianId: 'tech-1',
          technicianName: 'John Smith',
          equipmentType: 'FURNACE',
          serviceType: 'PREVENTIVE',
          estimatedDuration: 120,
          urgencyScore: 5,
        },
        {
          id: 'wo-2',
          workOrderNumber: 'WO-2024-002',
          title: 'AC Unit Not Cooling',
          description: 'Customer reports AC not cooling properly, possible refrigerant leak',
          type: 'REPAIR',
          priority: 'HIGH',
          status: 'SCHEDULED',
          scheduledDate: selectedDate,
          scheduledStartTime: '13:00',
          scheduledEndTime: '16:00',
          duration: 180,
          customerId: 'cust-2',
          customerName: 'Smith Commercial Building',
          customerAddress: '456 Business Ave, Springfield',
          customerPhone: '555-5678',
          technicianId: 'tech-2',
          technicianName: 'Mike Johnson',
          equipmentType: 'AC_UNIT',
          serviceType: 'CORRECTIVE',
          estimatedDuration: 180,
          urgencyScore: 8,
        },
        {
          id: 'wo-3',
          workOrderNumber: 'WO-2024-003',
          title: 'New Heat Pump Installation',
          description: 'Install new Trane XR95 heat pump system',
          type: 'INSTALLATION',
          priority: 'MEDIUM',
          status: 'IN_PROGRESS',
          scheduledDate: selectedDate,
          scheduledStartTime: '08:00',
          scheduledEndTime: '17:00',
          duration: 480,
          customerId: 'cust-3',
          customerName: 'Davis Family Home',
          customerAddress: '789 Oak Street, Springfield',
          customerPhone: '555-9999',
          technicianId: 'tech-3',
          technicianName: 'Sarah Wilson',
          equipmentType: 'HEAT_PUMP',
          serviceType: 'INSTALLATION',
          estimatedDuration: 480,
          urgencyScore: 6,
        },
        {
          id: 'wo-4',
          workOrderNumber: 'WO-2024-004',
          title: 'Thermostat Programming',
          description: 'Program new smart thermostat and customer training',
          type: 'MAINTENANCE',
          priority: 'LOW',
          status: 'SCHEDULED',
          scheduledDate: selectedDate,
          scheduledStartTime: '14:00',
          scheduledEndTime: '15:00',
          duration: 60,
          customerId: 'cust-4',
          customerName: 'Anderson Home',
          customerAddress: '321 Pine Ave, Springfield',
          customerPhone: '555-4321',
          equipmentType: 'THERMOSTAT',
          serviceType: 'INSTALLATION',
          estimatedDuration: 60,
          urgencyScore: 3,
        },
      ]

      // Build schedule view
      const scheduleData: ScheduleView = {
        date: selectedDate,
        technicians: {},
      }

      mockTechnicians.forEach((tech) => {
        const techWorkOrders = mockWorkOrders.filter((wo) => wo.technicianId === tech.id)
        const totalHours = techWorkOrders.reduce((sum, wo) => sum + (wo.duration || 0), 0) / 60

        scheduleData.technicians[tech.id] = {
          technician: tech,
          workOrders: techWorkOrders,
          totalHours,
          efficiency: Math.min((totalHours / 8) * 100, 100),
        }
      })

      setWorkOrders(mockWorkOrders)
      setTechnicians(mockTechnicians)
      setScheduleView(scheduleData)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'FURNACE':
        return <FireIcon className="h-4 w-4" />
      case 'AC_UNIT':
        return <BoltIcon className="h-4 w-4" />
      default:
        return <WrenchScrewdriverIcon className="h-4 w-4" />
    }
  }

  const formatTime = (time: string) => {
    return new Date(`2024-01-01T${time}`).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'EMERGENCY':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
      case 'HIGH':
        return <ExclamationTriangleIcon className="h-4 w-4 text-orange-500" />
      default:
        return null
    }
  }

  const filteredWorkOrders = workOrders.filter((wo) => {
    const matchesTech = filterTechnician === 'all' || wo.technicianId === filterTechnician
    const matchesStatus = filterStatus === 'all' || wo.status === filterStatus
    return matchesTech && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Scheduler</h1>
          <p className="mt-1 text-gray-600">Manage work orders and technician schedules</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onCreateWorkOrder}
            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Work Order
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <select
              value={filterTechnician}
              onChange={(e) => setFilterTechnician(e.target.value)}
              className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Technicians</option>
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.name}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="ON_HOLD">On Hold</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                viewMode === 'list'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                viewMode === 'board'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Board
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                viewMode === 'calendar'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Board View */}
      {viewMode === 'board' && scheduleView && (
        <div className="space-y-6">
          {Object.values(scheduleView.technicians).map((techSchedule, index) => (
            <motion.div
              key={techSchedule.technician.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="overflow-hidden rounded-lg bg-white shadow"
            >
              {/* Technician Header */}
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <UserIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {techSchedule.technician.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>★ {techSchedule.technician.rating}</span>
                        <span>{techSchedule.totalHours.toFixed(1)}h scheduled</span>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            techSchedule.technician.availability === 'AVAILABLE'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {techSchedule.technician.availability}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Efficiency</div>
                    <div className="text-xl font-semibold text-gray-900">
                      {techSchedule.efficiency.toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Work Orders */}
              <div className="p-6">
                {techSchedule.workOrders.length === 0 ? (
                  <div className="py-8 text-center">
                    <CalendarIcon className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No work orders scheduled</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {techSchedule.workOrders.map((wo) => (
                      <div
                        key={wo.id}
                        onClick={() => onWorkOrderSelect?.(wo)}
                        className="cursor-pointer rounded-lg border p-4 transition-colors hover:bg-gray-50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 pt-1">
                              {getServiceIcon(wo.equipmentType || '')}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium text-gray-900">{wo.title}</p>
                                {getPriorityIcon(wo.priority)}
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${priorityColors[wo.priority]}`}
                                >
                                  {wo.priority}
                                </span>
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusColors[wo.status]}`}
                                >
                                  {wo.status}
                                </span>
                              </div>
                              <div className="mt-1">
                                <p className="text-sm text-gray-600">{wo.description}</p>
                              </div>
                              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center">
                                  <ClockIcon className="mr-1 h-4 w-4" />
                                  {wo.scheduledStartTime &&
                                    formatTime(wo.scheduledStartTime)} -{' '}
                                  {wo.scheduledEndTime && formatTime(wo.scheduledEndTime)}
                                </div>
                                <div className="flex items-center">
                                  <BuildingOfficeIcon className="mr-1 h-4 w-4" />
                                  {wo.customerName}
                                </div>
                                <div className="flex items-center">
                                  <MapIcon className="mr-1 h-4 w-4" />
                                  {wo.customerAddress.split(',')[0]}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {wo.customerPhone && (
                              <button className="p-1 text-gray-400 hover:text-blue-600">
                                <PhoneIcon className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onEditWorkOrder?.(wo)
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <WrenchScrewdriverIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="overflow-hidden bg-white shadow sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredWorkOrders.map((wo, index) => (
              <motion.li
                key={wo.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onWorkOrderSelect?.(wo)}
                className="cursor-pointer hover:bg-gray-50"
              >
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">{getServiceIcon(wo.equipmentType || '')}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {wo.workOrderNumber} - {wo.title}
                          </p>
                          {getPriorityIcon(wo.priority)}
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${priorityColors[wo.priority]}`}
                          >
                            {wo.priority}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <span>{wo.customerName}</span>
                          <span>•</span>
                          <span>{wo.technicianName || 'Unassigned'}</span>
                          <span>•</span>
                          <span>{wo.scheduledStartTime && formatTime(wo.scheduledStartTime)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusColors[wo.status]}`}
                      >
                        {wo.status}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* Empty State */}
      {filteredWorkOrders.length === 0 && (
        <div className="py-12 text-center">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No work orders found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Create your first work order to get started with scheduling
          </p>
          <div className="mt-6">
            <button
              onClick={onCreateWorkOrder}
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Work Order
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
