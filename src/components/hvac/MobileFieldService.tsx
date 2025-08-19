/**
 * CoreFlow360 - Mobile Field Service for HVAC
 * Mobile-optimized interface for field technicians
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CameraIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  MapIcon as NavigationIcon,
  SignalIcon,
  Battery100Icon as BatteryIcon,
  CloudIcon,
  UserIcon,
  CalendarIcon,
  ListBulletIcon,
  PhotoIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'

interface WorkOrder {
  id: string
  workOrderNumber: string
  title: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY'
  status: 'PENDING' | 'EN_ROUTE' | 'ON_SITE' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  scheduledStart: string
  estimatedDuration: number
  customer: {
    name: string
    phone: string
    address: string
    coordinates?: { lat: number; lng: number }
  }
  equipment: Array<{
    id: string
    name: string
    model: string
    serialNumber?: string
  }>
  description: string
  checklist: Array<{
    id: string
    task: string
    completed: boolean
    required: boolean
    notes?: string
  }>
  partsUsed: Array<{
    id: string
    name: string
    quantity: number
    partNumber: string
  }>
  photos: Array<{
    id: string
    url: string
    caption: string
    timestamp: string
  }>
  timeEntries: Array<{
    action: 'START' | 'PAUSE' | 'RESUME' | 'COMPLETE'
    timestamp: string
  }>
}

interface MobileFieldServiceProps {
  technicianId: string
  onWorkOrderUpdate?: (workOrder: WorkOrder) => void
  onNavigateToLocation?: (coordinates: { lat: number; lng: number }) => void
}

const priorityColors = {
  LOW: 'bg-blue-100 text-blue-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  EMERGENCY: 'bg-red-100 text-red-800',
}

const statusColors = {
  PENDING: 'bg-gray-100 text-gray-800',
  EN_ROUTE: 'bg-blue-100 text-blue-800',
  ON_SITE: 'bg-purple-100 text-purple-800',
  IN_PROGRESS: 'bg-orange-100 text-orange-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export default function MobileFieldService({
  technicianId,
  onWorkOrderUpdate,
  onNavigateToLocation,
}: MobileFieldServiceProps) {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [activeWorkOrder, setActiveWorkOrder] = useState<WorkOrder | null>(null)
  const [currentTimer, setCurrentTimer] = useState<{
    workOrderId: string
    startTime: number
  } | null>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null)
  const [view, setView] = useState<'list' | 'details'>('list')

  useEffect(() => {
    loadWorkOrders()
    checkBatteryStatus()

    // Online/offline detection
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const loadWorkOrders = async () => {
    try {
      // Mock data for demonstration
      const mockWorkOrders: WorkOrder[] = [
        {
          id: 'wo-1',
          workOrderNumber: 'WO-2024-001',
          title: 'AC Unit Maintenance - Annual Service',
          priority: 'HIGH',
          status: 'PENDING',
          scheduledStart: '2024-08-09T09:00:00Z',
          estimatedDuration: 120,
          customer: {
            name: 'Johnson Residence',
            phone: '555-1234',
            address: '123 Main St, Springfield, IL',
            coordinates: { lat: 39.7817, lng: -89.6501 },
          },
          equipment: [
            {
              id: 'eq-1',
              name: 'Central AC Unit',
              model: 'Carrier 24ACC6',
              serialNumber: 'CAR123456',
            },
          ],
          description:
            'Annual maintenance service including filter replacement, coil cleaning, and system inspection',
          checklist: [
            { id: 'c1', task: 'Replace air filter', completed: false, required: true },
            { id: 'c2', task: 'Clean evaporator coils', completed: false, required: true },
            { id: 'c3', task: 'Check refrigerant levels', completed: false, required: true },
            { id: 'c4', task: 'Inspect electrical connections', completed: false, required: true },
            { id: 'c5', task: 'Test thermostat operation', completed: false, required: false },
          ],
          partsUsed: [],
          photos: [],
          timeEntries: [],
        },
        {
          id: 'wo-2',
          workOrderNumber: 'WO-2024-002',
          title: 'Emergency Furnace Repair',
          priority: 'EMERGENCY',
          status: 'EN_ROUTE',
          scheduledStart: '2024-08-09T14:00:00Z',
          estimatedDuration: 180,
          customer: {
            name: 'Smith Commercial',
            phone: '555-5678',
            address: '456 Business Ave, Springfield, IL',
            coordinates: { lat: 39.7897, lng: -89.6484 },
          },
          equipment: [
            {
              id: 'eq-2',
              name: 'Gas Furnace',
              model: 'Lennox ML195',
              serialNumber: 'LEN789012',
            },
          ],
          description:
            'Furnace not igniting, customer reports no heat. Possible ignition system failure.',
          checklist: [
            { id: 'c6', task: 'Check gas supply', completed: false, required: true },
            { id: 'c7', task: 'Inspect ignition system', completed: false, required: true },
            { id: 'c8', task: 'Test safety controls', completed: false, required: true },
            { id: 'c9', task: 'Check flue and venting', completed: false, required: true },
          ],
          partsUsed: [],
          photos: [],
          timeEntries: [{ action: 'START', timestamp: '2024-08-09T13:30:00Z' }],
        },
      ]

      setWorkOrders(mockWorkOrders)
    } catch (error) {}
  }

  const checkBatteryStatus = async () => {
    try {
      // @ts-ignore - Battery API not in standard types
      const battery = await navigator.getBattery?.()
      if (battery) {
        setBatteryLevel(Math.round(battery.level * 100))
      }
    } catch (error) {}
  }

  const updateWorkOrderStatus = (workOrderId: string, status: WorkOrder['status']) => {
    setWorkOrders((orders) =>
      orders.map((order) => (order.id === workOrderId ? { ...order, status } : order))
    )
  }

  const toggleTimer = (workOrder: WorkOrder) => {
    if (currentTimer?.workOrderId === workOrder.id) {
      // Stop timer
      setCurrentTimer(null)
      updateWorkOrderStatus(workOrder.id, 'ON_SITE')
    } else {
      // Start timer
      setCurrentTimer({ workOrderId: workOrder.id, startTime: Date.now() })
      updateWorkOrderStatus(workOrder.id, 'IN_PROGRESS')
    }
  }

  const toggleChecklistItem = (workOrderId: string, checklistId: string) => {
    setWorkOrders((orders) =>
      orders.map((order) => {
        if (order.id === workOrderId) {
          return {
            ...order,
            checklist: order.checklist.map((item) =>
              item.id === checklistId ? { ...item, completed: !item.completed } : item
            ),
          }
        }
        return order
      })
    )
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getElapsedTime = () => {
    if (!currentTimer) return '00:00'
    const elapsed = Math.floor((Date.now() - currentTimer.startTime) / 1000)
    const minutes = Math.floor(elapsed / 60)
    const seconds = elapsed % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const StatusBar = () => (
    <div className="border-b border-gray-200 bg-white px-4 py-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-gray-600">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
          {batteryLevel && (
            <div className="flex items-center space-x-1">
              <BatteryIcon className="h-3 w-3 text-gray-400" />
              <span className="text-gray-600">{batteryLevel}%</span>
            </div>
          )}
        </div>
        <div className="text-gray-500">
          {new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  )

  if (view === 'list') {
    return (
      <div className="flex h-screen flex-col bg-gray-50">
        <StatusBar />

        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
          <h1 className="text-lg font-semibold text-gray-900">Today's Work Orders</h1>
          <p className="text-sm text-gray-600">{workOrders.length} orders assigned</p>
        </div>

        {/* Work Orders List */}
        <div className="flex-1 overflow-y-auto">
          {workOrders.map((workOrder, index) => (
            <motion.div
              key={workOrder.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border-b border-gray-200 bg-white p-4"
              onClick={() => {
                setActiveWorkOrder(workOrder)
                setView('details')
              }}
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-1 flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {workOrder.workOrderNumber}
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${priorityColors[workOrder.priority]}`}
                    >
                      {workOrder.priority}
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[workOrder.status]}`}
                    >
                      {workOrder.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="mb-1 text-sm font-medium text-gray-900">{workOrder.title}</h3>
                  <div className="mb-2 flex items-center text-xs text-gray-600">
                    <MapPinIcon className="mr-1 h-3 w-3" />
                    <span className="truncate">{workOrder.customer.address}</span>
                  </div>
                </div>
                <ChevronRightIcon className="h-4 w-4 text-gray-400" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-gray-600">
                  <ClockIcon className="mr-1 h-3 w-3" />
                  <span>{formatTime(workOrder.scheduledStart)}</span>
                  <span className="mx-2">•</span>
                  <span>{workOrder.estimatedDuration}min</span>
                </div>

                <div className="flex space-x-2">
                  {workOrder.customer.coordinates && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onNavigateToLocation?.(workOrder.customer.coordinates!)
                      }}
                      className="rounded p-1 text-blue-600 hover:bg-blue-50"
                    >
                      <NavigationIcon className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      window.location.href = `tel:${workOrder.customer.phone}`
                    }}
                    className="rounded p-1 text-green-600 hover:bg-green-50"
                  >
                    <PhoneIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  // Details view
  if (!activeWorkOrder) return null

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <StatusBar />

      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <button onClick={() => setView('list')} className="text-sm font-medium text-blue-600">
            ← Back to List
          </button>

          {currentTimer?.workOrderId === activeWorkOrder.id && (
            <div className="font-mono text-lg text-orange-600">{getElapsedTime()}</div>
          )}
        </div>

        <div className="mt-2">
          <h1 className="text-lg font-semibold text-gray-900">{activeWorkOrder.workOrderNumber}</h1>
          <p className="text-sm text-gray-600">{activeWorkOrder.title}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Customer Info */}
        <div className="border-b border-gray-200 bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Customer Information</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <UserIcon className="mr-3 h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-900">{activeWorkOrder.customer.name}</span>
            </div>
            <div className="flex items-center">
              <MapPinIcon className="mr-3 h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-900">{activeWorkOrder.customer.address}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <PhoneIcon className="mr-3 h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-900">{activeWorkOrder.customer.phone}</span>
              </div>
              <button
                onClick={() => (window.location.href = `tel:${activeWorkOrder.customer.phone}`)}
                className="rounded-md bg-green-100 px-3 py-1 text-xs text-green-800"
              >
                Call
              </button>
            </div>
          </div>
        </div>

        {/* Status & Timer */}
        <div className="border-b border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${statusColors[activeWorkOrder.status]}`}
              >
                {activeWorkOrder.status.replace('_', ' ')}
              </span>

              {activeWorkOrder.status === 'PENDING' && (
                <button
                  onClick={() => updateWorkOrderStatus(activeWorkOrder.id, 'EN_ROUTE')}
                  className="rounded-md bg-blue-100 px-3 py-1 text-sm text-blue-800"
                >
                  Start Travel
                </button>
              )}

              {activeWorkOrder.status === 'EN_ROUTE' && (
                <button
                  onClick={() => updateWorkOrderStatus(activeWorkOrder.id, 'ON_SITE')}
                  className="rounded-md bg-purple-100 px-3 py-1 text-sm text-purple-800"
                >
                  Arrived On-Site
                </button>
              )}
            </div>

            {(activeWorkOrder.status === 'ON_SITE' || activeWorkOrder.status === 'IN_PROGRESS') && (
              <button
                onClick={() => toggleTimer(activeWorkOrder)}
                className={`flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                  currentTimer?.workOrderId === activeWorkOrder.id
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {currentTimer?.workOrderId === activeWorkOrder.id ? (
                  <PauseIcon className="mr-1 h-4 w-4" />
                ) : (
                  <PlayIcon className="mr-1 h-4 w-4" />
                )}
                {currentTimer?.workOrderId === activeWorkOrder.id ? 'Pause' : 'Start Work'}
              </button>
            )}
          </div>
        </div>

        {/* Checklist */}
        <div className="border-b border-gray-200 bg-white">
          <button
            onClick={() => toggleSection('checklist')}
            className="flex w-full items-center justify-between px-4 py-3"
          >
            <span className="font-medium text-gray-900">Service Checklist</span>
            <ChevronDownIcon
              className={`h-4 w-4 text-gray-400 transition-transform ${
                expandedSections.checklist ? 'rotate-180' : ''
              }`}
            />
          </button>

          {expandedSections.checklist && (
            <div className="px-4 pb-4">
              <div className="space-y-3">
                {activeWorkOrder.checklist.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3">
                    <button
                      onClick={() => toggleChecklistItem(activeWorkOrder.id, item.id)}
                      className="mt-0.5"
                    >
                      {item.completed ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm ${item.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}
                      >
                        {item.task}
                        {item.required && <span className="ml-1 text-red-500">*</span>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Equipment */}
        <div className="border-b border-gray-200 bg-white">
          <button
            onClick={() => toggleSection('equipment')}
            className="flex w-full items-center justify-between px-4 py-3"
          >
            <span className="font-medium text-gray-900">Equipment</span>
            <ChevronDownIcon
              className={`h-4 w-4 text-gray-400 transition-transform ${
                expandedSections.equipment ? 'rotate-180' : ''
              }`}
            />
          </button>

          {expandedSections.equipment && (
            <div className="px-4 pb-4">
              {activeWorkOrder.equipment.map((equipment) => (
                <div key={equipment.id} className="flex items-center rounded-lg bg-gray-50 p-3">
                  <WrenchScrewdriverIcon className="mr-3 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{equipment.name}</p>
                    <p className="text-xs text-gray-600">{equipment.model}</p>
                    {equipment.serialNumber && (
                      <p className="text-xs text-gray-500">S/N: {equipment.serialNumber}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Complete Work Order */}
        {activeWorkOrder.status === 'IN_PROGRESS' && (
          <div className="bg-white p-4">
            <button
              onClick={() => {
                updateWorkOrderStatus(activeWorkOrder.id, 'COMPLETED')
                setCurrentTimer(null)
                setView('list')
              }}
              className="w-full rounded-lg bg-green-600 px-4 py-3 font-medium text-white"
            >
              Complete Work Order
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
