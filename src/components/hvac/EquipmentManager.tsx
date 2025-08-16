/**
 * CoreFlow360 - Equipment Manager for HVAC/Field Service
 * Comprehensive equipment tracking with service history and maintenance scheduling
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  WrenchScrewdriverIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  CogIcon,
  FireIcon,
  BoltIcon,
  HomeIcon,
  BuildingOfficeIcon,
  ArrowPathIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { MetricCard } from '@/components/ui/MetricCard'

interface Equipment {
  id: string
  serialNumber?: string
  manufacturer: string
  model: string
  equipmentType: string
  capacity?: string
  installDate?: string
  warrantyExpiry?: string
  location?: string
  lastServiceDate?: string
  nextServiceDue?: string
  serviceIntervalDays?: number
  condition: 'NEW' | 'GOOD' | 'FAIR' | 'POOR' | 'NEEDS_REPLACEMENT'
  efficiency?: number
  refrigerantType?: string
  notes?: string
  specifications: Record<string, any>
  maintenanceHistory: any[]
  customerId: string
  customerName?: string
  customerAddress?: string
}

interface EquipmentSummary {
  totalEquipment: number
  serviceDueThisWeek: number
  warrantyExpiring: number
  needsAttention: number
  averageAge: number
  maintenanceCompliance: number
}

interface EquipmentManagerProps {
  onEquipmentSelect?: (equipment: Equipment) => void
  onAddEquipment?: () => void
  onScheduleService?: (equipment: Equipment) => void
}

const equipmentTypeIcons: Record<string, any> = {
  FURNACE: FireIcon,
  AC_UNIT: BoltIcon,
  HEAT_PUMP: ArrowPathIcon,
  BOILER: FireIcon,
  WATER_HEATER: HomeIcon,
  THERMOSTAT: CogIcon
}

export default function EquipmentManager({ 
  onEquipmentSelect, 
  onAddEquipment,
  onScheduleService 
}: EquipmentManagerProps) {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [summary, setSummary] = useState<EquipmentSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedCondition, setSelectedCondition] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('nextServiceDue')

  useEffect(() => {
    loadEquipment()
  }, [selectedCustomer, selectedType, selectedCondition, sortBy])

  const loadEquipment = async () => {
    try {
      setLoading(true)
      
      // Mock data for demonstration
      const mockEquipment: Equipment[] = [
        {
          id: '1',
          serialNumber: 'LNX-2024-001',
          manufacturer: 'Lennox',
          model: 'ML195',
          equipmentType: 'FURNACE',
          capacity: '80,000 BTU',
          installDate: '2022-03-15',
          warrantyExpiry: '2027-03-15',
          location: 'Basement',
          lastServiceDate: '2024-06-15',
          nextServiceDue: '2025-06-15',
          serviceIntervalDays: 365,
          condition: 'GOOD',
          efficiency: 95.5,
          refrigerantType: 'Natural Gas',
          notes: 'Customer reports some noise during startup',
          specifications: {
            afue: 95.5,
            stages: 2,
            venting: 'Power Vent'
          },
          maintenanceHistory: [
            {
              date: '2024-06-15',
              type: 'Annual Service',
              technician: 'John Smith',
              notes: 'Filter replaced, heat exchanger inspected, all systems normal'
            }
          ],
          customerId: 'cust-1',
          customerName: 'Johnson Residence',
          customerAddress: '123 Main St, Springfield'
        },
        {
          id: '2',
          serialNumber: 'CAR-2023-045',
          manufacturer: 'Carrier',
          model: '24ACC636A003',
          equipmentType: 'AC_UNIT',
          capacity: '3 Ton',
          installDate: '2023-05-20',
          warrantyExpiry: '2033-05-20',
          location: 'Side Yard',
          lastServiceDate: '2024-04-10',
          nextServiceDue: '2024-09-10',
          serviceIntervalDays: 180,
          condition: 'FAIR',
          efficiency: 16.0,
          refrigerantType: 'R-410A',
          notes: 'Low refrigerant detected during last service',
          specifications: {
            seer: 16.0,
            refrigerantCapacity: '8.5 lbs',
            compressorType: 'Scroll'
          },
          maintenanceHistory: [
            {
              date: '2024-04-10',
              type: 'Spring Service',
              technician: 'Mike Johnson',
              notes: 'Refrigerant low, leak test performed, minor leak found and repaired'
            }
          ],
          customerId: 'cust-2',
          customerName: 'Smith Commercial Building',
          customerAddress: '456 Business Ave, Springfield'
        },
        {
          id: '3',
          serialNumber: 'TRN-2024-012',
          manufacturer: 'Trane',
          model: 'XR95',
          equipmentType: 'HEAT_PUMP',
          capacity: '4 Ton',
          installDate: '2024-01-12',
          warrantyExpiry: '2034-01-12',
          location: 'Rooftop',
          lastServiceDate: '2024-07-20',
          nextServiceDue: '2025-01-20',
          serviceIntervalDays: 180,
          condition: 'NEW',
          efficiency: 19.5,
          refrigerantType: 'R-410A',
          specifications: {
            seer: 19.5,
            hspf: 10.0,
            stages: 2
          },
          maintenanceHistory: [
            {
              date: '2024-07-20',
              type: 'Post-Installation Check',
              technician: 'Sarah Wilson',
              notes: 'System operating perfectly, customer training completed'
            }
          ],
          customerId: 'cust-3',
          customerName: 'Davis Family Home',
          customerAddress: '789 Oak Street, Springfield'
        }
      ]

      const mockSummary: EquipmentSummary = {
        totalEquipment: mockEquipment.length,
        serviceDueThisWeek: 1,
        warrantyExpiring: 0,
        needsAttention: 1,
        averageAge: 1.8,
        maintenanceCompliance: 88.5
      }

      setEquipment(mockEquipment)
      setSummary(mockSummary)
    } catch (error) {
      console.error('Failed to load equipment:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredEquipment = equipment.filter(eq => {
    const matchesSearch = searchTerm === '' || 
      eq.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCustomer = selectedCustomer === 'all' || eq.customerId === selectedCustomer
    const matchesType = selectedType === 'all' || eq.equipmentType === selectedType
    const matchesCondition = selectedCondition === 'all' || eq.condition === selectedCondition
    
    return matchesSearch && matchesCustomer && matchesType && matchesCondition
  })

  const getEquipmentIcon = (type: string) => {
    const Icon = equipmentTypeIcons[type] || WrenchScrewdriverIcon
    return <Icon className="h-5 w-5" />
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'NEW':
        return 'text-green-600 bg-green-100'
      case 'GOOD':
        return 'text-blue-600 bg-blue-100'
      case 'FAIR':
        return 'text-yellow-600 bg-yellow-100'
      case 'POOR':
        return 'text-orange-600 bg-orange-100'
      case 'NEEDS_REPLACEMENT':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const isServiceDue = (nextServiceDue?: string) => {
    if (!nextServiceDue) return false
    const dueDate = new Date(nextServiceDue)
    const today = new Date()
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7
  }

  const formatType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipment Management</h1>
          <p className="text-gray-600 mt-1">Track and maintain HVAC equipment with service history</p>
        </div>
        <button
          onClick={onAddEquipment}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Equipment
        </button>
      </div>

      {/* Summary Metrics */}
      {summary && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            value={summary.totalEquipment.toString()}
            label="Total Equipment"
            icon={WrenchScrewdriverIcon}
            gradient="blue"
          />
          <MetricCard
            value={summary.serviceDueThisWeek.toString()}
            label="Service Due This Week"
            icon={ClockIcon}
            gradient="orange"
            trend={summary.serviceDueThisWeek > 0 ? -5 : 0}
          />
          <MetricCard
            value={summary.needsAttention.toString()}
            label="Needs Attention"
            icon={ExclamationTriangleIcon}
            gradient="red"
            trend={summary.needsAttention > 0 ? -10 : 5}
          />
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="FURNACE">Furnace</option>
            <option value="AC_UNIT">AC Unit</option>
            <option value="HEAT_PUMP">Heat Pump</option>
            <option value="BOILER">Boiler</option>
            <option value="WATER_HEATER">Water Heater</option>
            <option value="THERMOSTAT">Thermostat</option>
          </select>
          
          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Conditions</option>
            <option value="NEW">New</option>
            <option value="GOOD">Good</option>
            <option value="FAIR">Fair</option>
            <option value="POOR">Poor</option>
            <option value="NEEDS_REPLACEMENT">Needs Replacement</option>
          </select>
          
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Customers</option>
            <option value="cust-1">Johnson Residence</option>
            <option value="cust-2">Smith Commercial Building</option>
            <option value="cust-3">Davis Family Home</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="nextServiceDue">Next Service Due</option>
            <option value="installDate">Install Date</option>
            <option value="manufacturer">Manufacturer</option>
            <option value="condition">Condition</option>
          </select>
        </div>
      </div>

      {/* Equipment List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredEquipment.map((eq, index) => (
            <motion.li
              key={eq.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onEquipmentSelect?.(eq)}
            >
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                        {getEquipmentIcon(eq.equipmentType)}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {eq.manufacturer} {eq.model}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConditionColor(eq.condition)}`}>
                          {eq.condition}
                        </span>
                        {isServiceDue(eq.nextServiceDue) && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-orange-800 bg-orange-100">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            Service Due
                          </span>
                        )}
                      </div>
                      <div className="flex items-center mt-1">
                        <p className="text-sm text-gray-500">
                          {formatType(eq.equipmentType)} • {eq.capacity || 'N/A'} • {eq.location || 'Location TBD'}
                        </p>
                      </div>
                      <div className="flex items-center mt-1 text-xs text-gray-400">
                        <BuildingOfficeIcon className="h-3 w-3 mr-1" />
                        <span>{eq.customerName}</span>
                        <span className="mx-2">•</span>
                        <span>SN: {eq.serialNumber || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        Next Service
                      </p>
                      <p className="text-sm text-gray-500">
                        {eq.nextServiceDue ? new Date(eq.nextServiceDue).toLocaleDateString() : 'Not scheduled'}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onScheduleService?.(eq)
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                        title="Schedule Service"
                      >
                        <CalendarIcon className="h-4 w-4" />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md"
                        title="View Details"
                      >
                        <DocumentTextIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Empty State */}
      {filteredEquipment.length === 0 && (
        <div className="text-center py-12">
          <WrenchScrewdriverIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No equipment found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first piece of equipment
          </p>
          <div className="mt-6">
            <button
              onClick={onAddEquipment}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Equipment
            </button>
          </div>
        </div>
      )}
    </div>
  )
}