/**
 * CoreFlow360 - Contract Manager for HVAC/Field Service
 * Service contracts, maintenance agreements, and SLA tracking
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  DocumentTextIcon,
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PauseIcon,
  PlayIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  BellIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline'
import { MetricCard } from '@/components/ui/MetricCard'

interface ServiceContract {
  id: string
  contractNumber: string
  contractType: 'MAINTENANCE' | 'WARRANTY' | 'SERVICE_AGREEMENT' | 'PROTECTION_PLAN'
  name: string
  description?: string
  status: 'DRAFT' | 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'CANCELLED'
  startDate: string
  endDate: string
  autoRenew: boolean
  renewalNotice: number
  contractValue: number
  billingCycle: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL'
  lastBilledDate?: string
  nextBillingDate?: string
  responseTime?: number
  priorityLevel: 'STANDARD' | 'PRIORITY' | 'VIP'
  customerId: string
  customerName: string
  customerAddress: string
  customerPhone?: string
  equipmentCount: number
  serviceVisits?: number
  partsIncluded: boolean
  laborIncluded: boolean
  emergencyService: boolean
  coveredServices: string[]
  slaMetrics: {
    responseTimeCompliance: number
    resolutionTimeCompliance: number
    serviceQualityScore: number
    customerSatisfaction: number
  }
  upcomingServices: Array<{
    equipmentId: string
    equipmentName: string
    dueDate: string
    serviceType: string
  }>
  recentActivity: Array<{
    date: string
    type: string
    description: string
    technician?: string
  }>
}

interface ContractSummary {
  totalContracts: number
  activeContracts: number
  contractsExpiringSoon: number
  monthlyRecurringRevenue: number
  slaCompliance: number
  renewalRate: number
  averageContractValue: number
}

interface ContractManagerProps {
  onContractSelect?: (contract: ServiceContract) => void
  onCreateContract?: () => void
  onRenewContract?: (contract: ServiceContract) => void
  onScheduleService?: (contract: ServiceContract, equipmentId: string) => void
}

const contractTypeColors = {
  MAINTENANCE: 'text-blue-700 bg-blue-100',
  WARRANTY: 'text-green-700 bg-green-100',
  SERVICE_AGREEMENT: 'text-purple-700 bg-purple-100',
  PROTECTION_PLAN: 'text-orange-700 bg-orange-100',
}

const statusColors = {
  DRAFT: 'text-gray-700 bg-gray-100',
  ACTIVE: 'text-green-700 bg-green-100',
  SUSPENDED: 'text-yellow-700 bg-yellow-100',
  EXPIRED: 'text-red-700 bg-red-100',
  CANCELLED: 'text-red-700 bg-red-100',
}

const priorityColors = {
  STANDARD: 'text-blue-600 bg-blue-50',
  PRIORITY: 'text-orange-600 bg-orange-50',
  VIP: 'text-purple-600 bg-purple-50',
}

export default function ContractManager({
  onContractSelect,
  onCreateContract,
  onRenewContract,
  onScheduleService,
}: ContractManagerProps) {
  const [contracts, setContracts] = useState<ServiceContract[]>([])
  const [summary, setSummary] = useState<ContractSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('endDate')

  useEffect(() => {
    loadContracts()
  }, [selectedStatus, selectedType, sortBy])

  const loadContracts = async () => {
    try {
      setLoading(true)

      // Mock data for demonstration
      const mockContracts: ServiceContract[] = [
        {
          id: 'contract-1',
          contractNumber: 'SVC-2024-001',
          contractType: 'MAINTENANCE',
          name: 'Annual HVAC Maintenance Agreement',
          description: 'Comprehensive annual maintenance for all HVAC equipment',
          status: 'ACTIVE',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          autoRenew: true,
          renewalNotice: 60,
          contractValue: 2400,
          billingCycle: 'ANNUAL',
          lastBilledDate: '2024-01-01',
          nextBillingDate: '2025-01-01',
          responseTime: 4,
          priorityLevel: 'PRIORITY',
          customerId: 'cust-1',
          customerName: 'Johnson Residence',
          customerAddress: '123 Main St, Springfield',
          customerPhone: '555-1234',
          equipmentCount: 3,
          serviceVisits: 2,
          partsIncluded: false,
          laborIncluded: true,
          emergencyService: true,
          coveredServices: [
            'Preventive Maintenance',
            'Filter Replacement',
            'System Inspection',
            'Emergency Repair',
          ],
          slaMetrics: {
            responseTimeCompliance: 95.5,
            resolutionTimeCompliance: 88.2,
            serviceQualityScore: 9.1,
            customerSatisfaction: 4.7,
          },
          upcomingServices: [
            {
              equipmentId: 'eq-1',
              equipmentName: 'Lennox ML195 Furnace',
              dueDate: '2024-09-15',
              serviceType: 'Fall Maintenance',
            },
            {
              equipmentId: 'eq-2',
              equipmentName: 'Carrier AC Unit',
              dueDate: '2024-10-01',
              serviceType: 'Pre-Winter Inspection',
            },
          ],
          recentActivity: [
            {
              date: '2024-06-15',
              type: 'Service Completed',
              description: 'Annual furnace maintenance completed',
              technician: 'John Smith',
            },
            {
              date: '2024-04-20',
              type: 'Emergency Service',
              description: 'AC unit repair - refrigerant leak fixed',
              technician: 'Mike Johnson',
            },
          ],
        },
        {
          id: 'contract-2',
          contractNumber: 'SVC-2024-002',
          contractType: 'SERVICE_AGREEMENT',
          name: 'Commercial HVAC Service Plan',
          description: 'Quarterly maintenance and priority service for commercial building',
          status: 'ACTIVE',
          startDate: '2024-03-01',
          endDate: '2025-02-28',
          autoRenew: true,
          renewalNotice: 30,
          contractValue: 8400,
          billingCycle: 'QUARTERLY',
          lastBilledDate: '2024-06-01',
          nextBillingDate: '2024-09-01',
          responseTime: 2,
          priorityLevel: 'VIP',
          customerId: 'cust-2',
          customerName: 'Smith Commercial Building',
          customerAddress: '456 Business Ave, Springfield',
          customerPhone: '555-5678',
          equipmentCount: 8,
          serviceVisits: 4,
          partsIncluded: true,
          laborIncluded: true,
          emergencyService: true,
          coveredServices: [
            'Preventive Maintenance',
            'Emergency Service',
            'Parts Replacement',
            'System Upgrades',
          ],
          slaMetrics: {
            responseTimeCompliance: 98.8,
            resolutionTimeCompliance: 92.4,
            serviceQualityScore: 9.5,
            customerSatisfaction: 4.9,
          },
          upcomingServices: [
            {
              equipmentId: 'eq-3',
              equipmentName: 'Rooftop Units 1-4',
              dueDate: '2024-09-10',
              serviceType: 'Quarterly Maintenance',
            },
          ],
          recentActivity: [
            {
              date: '2024-07-20',
              type: 'Service Completed',
              description: 'Quarterly maintenance on all rooftop units',
              technician: 'Sarah Wilson',
            },
          ],
        },
        {
          id: 'contract-3',
          contractNumber: 'SVC-2024-003',
          contractType: 'WARRANTY',
          name: 'New Installation Warranty',
          description: 'Comprehensive warranty coverage for newly installed heat pump system',
          status: 'ACTIVE',
          startDate: '2024-01-12',
          endDate: '2034-01-12',
          autoRenew: false,
          renewalNotice: 0,
          contractValue: 0,
          billingCycle: 'ANNUAL',
          responseTime: 24,
          priorityLevel: 'STANDARD',
          customerId: 'cust-3',
          customerName: 'Davis Family Home',
          customerAddress: '789 Oak Street, Springfield',
          customerPhone: '555-9999',
          equipmentCount: 1,
          partsIncluded: true,
          laborIncluded: true,
          emergencyService: false,
          coveredServices: ['Manufacturing Defects', 'Parts Replacement', 'Labor Coverage'],
          slaMetrics: {
            responseTimeCompliance: 100,
            resolutionTimeCompliance: 95.0,
            serviceQualityScore: 9.3,
            customerSatisfaction: 5.0,
          },
          upcomingServices: [],
          recentActivity: [
            {
              date: '2024-07-20',
              type: 'Warranty Service',
              description: 'Post-installation check - system operating perfectly',
              technician: 'Sarah Wilson',
            },
          ],
        },
      ]

      const mockSummary: ContractSummary = {
        totalContracts: mockContracts.length,
        activeContracts: mockContracts.filter((c) => c.status === 'ACTIVE').length,
        contractsExpiringSoon: 1,
        monthlyRecurringRevenue: mockContracts.reduce((sum, c) => {
          if (c.status === 'ACTIVE') {
            switch (c.billingCycle) {
              case 'MONTHLY':
                return sum + c.contractValue
              case 'QUARTERLY':
                return sum + c.contractValue / 3
              case 'ANNUAL':
                return sum + c.contractValue / 12
              default:
                return sum
            }
          }
          return sum
        }, 0),
        slaCompliance: 94.2,
        renewalRate: 88.5,
        averageContractValue:
          mockContracts.reduce((sum, c) => sum + c.contractValue, 0) / mockContracts.length,
      }

      setContracts(mockContracts)
      setSummary(mockSummary)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      searchTerm === '' ||
      contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.customerName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = selectedStatus === 'all' || contract.status === selectedStatus
    const matchesType = selectedType === 'all' || contract.contractType === selectedType

    return matchesSearch && matchesStatus && matchesType
  })

  const isExpiringSoon = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 90 && diffDays > 0
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getSLAColor = (score: number) => {
    if (score >= 95) return 'text-green-600'
    if (score >= 85) return 'text-yellow-600'
    return 'text-red-600'
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Service Contracts</h1>
          <p className="mt-1 text-gray-600">Manage maintenance agreements and SLA tracking</p>
        </div>
        <button
          onClick={onCreateContract}
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Create Contract
        </button>
      </div>

      {/* Summary Metrics */}
      {summary && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            value={formatCurrency(summary.monthlyRecurringRevenue)}
            label="Monthly Recurring Revenue"
            icon={CurrencyDollarIcon}
            gradient="emerald"
            trend={12.5}
          />
          <MetricCard
            value={summary.activeContracts.toString()}
            label="Active Contracts"
            icon={DocumentTextIcon}
            gradient="blue"
            trend={8.3}
          />
          <MetricCard
            value={`${summary.slaCompliance}%`}
            label="SLA Compliance"
            icon={ShieldCheckIcon}
            gradient="violet"
            trend={2.1}
          />
          <MetricCard
            value={`${summary.renewalRate}%`}
            label="Renewal Rate"
            icon={ArrowPathIcon}
            gradient="orange"
            trend={5.7}
          />
        </div>
      )}

      {/* Filters */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search contracts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="EXPIRED">Expired</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="WARRANTY">Warranty</option>
            <option value="SERVICE_AGREEMENT">Service Agreement</option>
            <option value="PROTECTION_PLAN">Protection Plan</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="endDate">End Date</option>
            <option value="contractValue">Contract Value</option>
            <option value="customerName">Customer</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      {/* Contracts List */}
      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredContracts.map((contract, index) => (
            <motion.li
              key={contract.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => onContractSelect?.(contract)}
            >
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <DocumentTextIcon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">
                          {contract.contractNumber} - {contract.name}
                        </p>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[contract.status]}`}
                        >
                          {contract.status}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${contractTypeColors[contract.contractType]}`}
                        >
                          {contract.contractType.replace(/_/g, ' ')}
                        </span>
                        {isExpiringSoon(contract.endDate) && (
                          <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                            <BellIcon className="mr-1 h-3 w-3" />
                            Expiring Soon
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityColors[contract.priorityLevel]}`}
                        >
                          {contract.priorityLevel}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center">
                        <p className="text-sm text-gray-500">
                          {contract.customerName} • {contract.equipmentCount} equipment •{' '}
                          {contract.responseTime}h response
                        </p>
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <span>SLA Compliance:</span>
                          <span
                            className={`font-medium ${getSLAColor(contract.slaMetrics.responseTimeCompliance)}`}
                          >
                            {contract.slaMetrics.responseTimeCompliance}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>Satisfaction:</span>
                          <span className="font-medium text-green-600">
                            {contract.slaMetrics.customerSatisfaction}/5.0
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>Next Service:</span>
                          <span className="font-medium text-blue-600">
                            {contract.upcomingServices.length > 0
                              ? new Date(contract.upcomingServices[0].dueDate).toLocaleDateString()
                              : 'None scheduled'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(contract.contractValue)}
                      </p>
                      <p className="text-sm text-gray-500">{contract.billingCycle.toLowerCase()}</p>
                      <p className="text-xs text-gray-400">
                        Expires: {new Date(contract.endDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      {contract.upcomingServices.length > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onScheduleService?.(contract, contract.upcomingServices[0].equipmentId)
                          }}
                          className="rounded-md p-2 text-blue-400 hover:bg-blue-50 hover:text-blue-600"
                          title="Schedule Service"
                        >
                          <CalendarIcon className="h-4 w-4" />
                        </button>
                      )}
                      {isExpiringSoon(contract.endDate) && contract.autoRenew && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onRenewContract?.(contract)
                          }}
                          className="rounded-md p-2 text-green-400 hover:bg-green-50 hover:text-green-600"
                          title="Renew Contract"
                        >
                          <ArrowPathIcon className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        className="rounded-md p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                        title="Contact Customer"
                      >
                        <PhoneIcon className="h-4 w-4" />
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
      {filteredContracts.length === 0 && (
        <div className="py-12 text-center">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No contracts found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Create your first service contract to start managing maintenance agreements
          </p>
          <div className="mt-6">
            <button
              onClick={onCreateContract}
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Contract
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
