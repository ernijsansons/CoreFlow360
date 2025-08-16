/**
 * CoreFlow360 - CRM Dashboard
 * Comprehensive customer relationship management with AI insights
 */

'use client'

import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { motion } from 'framer-motion'
import { useDebounce } from '@/hooks/useDebounce'
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  SparklesIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'
import { MetricCard } from '@/components/ui/MetricCard'
import CustomerLifecycleView from './CustomerLifecycleView'
import HybridMapComponent from '@/components/maps/HybridMapComponent'
import CustomerLocationManager from '@/components/maps/CustomerLocationManager'
import TerritoryManagementDashboard from '@/components/territory/TerritoryManagementDashboard'
import { CustomerLocation, TenantMappingConfig } from '@/types/mapping'
import { SafeText, getSafeInitials, getSafeCustomerName } from '@/components/ui/SafeText'
import { useCustomers, useDeleteCustomer } from '@/hooks/queries/useCustomers'
import CreateCustomerModal from './CreateCustomerModal'
import { useBroadcastSync } from '@/hooks/useBroadcastSync'

interface Customer {
  id: string
  firstName?: string | null
  lastName?: string | null
  name?: string | null
  email?: string | null
  phone?: string | null
  company?: string | null
  status: 'LEAD' | 'PROSPECT' | 'CUSTOMER' | 'CHAMPION' | 'AT_RISK' | 'CHURNED'
  source?: string | null
  aiScore: number
  aiChurnRisk: number
  aiLifetimeValue: number
  totalRevenue: number
  lastInteraction?: string
  assignee?: {
    id: string
    name: string
    avatar?: string
  } | null
  createdAt: string
  updatedAt: string
}

interface CRMMetrics {
  totalCustomers: number
  totalLeads: number
  conversionRate: number
  avgLifetimeValue: number
  totalRevenue: number
  activeDeals: number
  churnRisk: number
}

const lifecycleStages = [
  { id: 'LEAD', name: 'Lead', color: 'bg-gray-500', textColor: 'text-gray-700' },
  { id: 'PROSPECT', name: 'Prospect', color: 'bg-blue-500', textColor: 'text-blue-700' },
  { id: 'CUSTOMER', name: 'Customer', color: 'bg-green-500', textColor: 'text-green-700' },
  { id: 'CHAMPION', name: 'Champion', color: 'bg-purple-500', textColor: 'text-purple-700' },
  { id: 'AT_RISK', name: 'At Risk', color: 'bg-yellow-500', textColor: 'text-yellow-700' },
  { id: 'CHURNED', name: 'Churned', color: 'bg-red-500', textColor: 'text-red-700' }
]

// Memoized customer row component to prevent unnecessary re-renders
const CustomerRow = memo(({ 
  customer, 
  index, 
  onView, 
  onDelete, 
  isDeleting,
  formatCurrency,
  formatDate,
  getStatusColor
}: {
  customer: Customer
  index: number
  onView: (id: string) => void
  onDelete: (id: string) => void
  isDeleting: boolean
  formatCurrency: (amount: number) => string
  formatDate: (dateString: string) => string
  getStatusColor: (status: string) => string
}) => (
  <motion.div
    key={customer.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">
              {getSafeInitials(customer.firstName, customer.lastName)}
            </span>
          </div>
        </div>
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-3">
            <SafeText className="text-sm font-medium text-gray-900 truncate">
              {getSafeCustomerName(customer)}
            </SafeText>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getStatusColor(customer.status)}`}>
              {lifecycleStages.find(s => s.id === customer.status)?.name}
            </span>
            <div className="flex items-center">
              <SparklesIcon className="h-4 w-4 text-purple-500 mr-1" />
              <span className="text-sm text-gray-500">{customer.aiScore}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 mt-1">
            {customer.company && (
              <SafeText className="text-sm text-gray-500">
                {customer.company}
              </SafeText>
            )}
            <p className="text-sm text-gray-500">{formatCurrency(customer.aiLifetimeValue)} LTV</p>
            {customer.lastInteraction && (
              <p className="text-xs text-gray-400">
                Last contact: {formatDate(customer.lastInteraction)}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        {/* Contact Actions */}
        <div className="flex items-center space-x-2">
          {customer.phone && (
            <button className="text-gray-400 hover:text-blue-600">
              <PhoneIcon className="h-4 w-4" />
            </button>
          )}
          {customer.email && (
            <button className="text-gray-400 hover:text-blue-600">
              <EnvelopeIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* AI Insights */}
        <div className="flex items-center space-x-4 text-sm">
          <div className="text-center">
            <p className="text-xs text-gray-500">Revenue</p>
            <p className="font-medium text-gray-900">
              {formatCurrency(customer.totalRevenue)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Churn Risk</p>
            <p className={`font-medium ${
              customer.aiChurnRisk > 50 
                ? 'text-red-600' 
                : customer.aiChurnRisk > 25 
                  ? 'text-yellow-600' 
                  : 'text-green-600'
            }`}>
              {customer.aiChurnRisk}%
            </p>
          </div>
        </div>

        {/* Assignee */}
        {customer.assignee && (
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gray-300"></div>
            <span className="text-sm text-gray-500">{customer.assignee.name}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onView(customer.id)}
            className="text-gray-400 hover:text-blue-600"
            title="View Details"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            className="text-gray-400 hover:text-blue-600"
            title="Edit"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this customer?')) {
                onDelete(customer.id)
              }
            }}
            disabled={isDeleting}
            className="text-gray-400 hover:text-red-600 disabled:opacity-50"
            title="Delete"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </motion.div>
))

export default function CRMDashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'map' | 'territory'>('list')
  const [customerLocations, setCustomerLocations] = useState<CustomerLocation[]>([])
  const [tenantConfig, setTenantConfig] = useState<TenantMappingConfig | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Debounce search term to avoid excessive API calls
  const debouncedSearch = useDebounce(searchTerm, 300)

  // Use React Query for data fetching
  const { data, isLoading, error, refetch } = useCustomers({
    page: currentPage,
    limit: 20,
    search: debouncedSearch,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  // Extract data from response
  const customers = data?.data || []
  const totalPages = data?.meta ? Math.ceil(data.meta.totalCount / data.meta.limit) : 1
  const totalCustomers = data?.meta?.totalCount || 0

  // Delete customer mutation
  const deleteCustomerMutation = useDeleteCustomer()

  // Sync state across browser tabs
  const { isSupported: broadcastSupported } = useBroadcastSync({
    entity: 'customers',
    onMessage: (message) => {
      // Optional: Show notification when data changes in another tab
      if (message.type === 'update' || message.type === 'refresh') {
        console.log('Customer data updated in another tab')
      }
    }
  })

  // Calculate metrics from customers (memoized to prevent recalculation)
  const metrics = useMemo(() => calculateMetricsFromCustomers(customers), [customers])

  // Generate locations from customers (memoized to prevent recalculation)
  const locations: CustomerLocation[] = useMemo(() => 
    customers
      .filter(customer => customer.address)
      .map(customer => ({
        id: customer.id,
        customerId: customer.id,
        customer: {
          id: customer.id,
          name: `${customer.firstName} ${customer.lastName}${customer.company ? ` - ${customer.company}` : ''}`,
          email: customer.email || ''
        },
        address: customer.address || '',
        city: 'Unknown', // TODO: Parse from address
        state: 'Unknown',
        zipCode: 'Unknown',
        country: 'US',
        latitude: 0, // TODO: Geocode addresses
        longitude: 0,
        locationType: 'primary',
        isVerified: false,
        territory: 'Unassigned',
        salesRep: customer.assignee?.name || 'Unassigned',
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt
      })), [customers])

  // Mock tenant config until we implement mapping endpoints (memoized)
  const mockTenantConfig: TenantMappingConfig = useMemo(() => ({
    mappingTier: 'free',
    googleMapsEnabled: false,
    monthlyMapCredits: 0
  }), [])

  // Update locations when customers change
  useEffect(() => {
    setCustomerLocations(locations)
  }, [customers])

  // Set tenant config once
  useEffect(() => {
    setTenantConfig(mockTenantConfig)
  }, [])
  
  // Calculate metrics from customer data (memoized function)
  const calculateMetricsFromCustomers = useCallback((customersList: Customer[]): CRMMetrics => {
    // Group customers by status
    const statusCounts = customersList.reduce((acc, customer) => {
      acc[customer.status] = (acc[customer.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Calculate totals
    const totalRevenue = customersList.reduce((sum, c) => sum + (c.totalRevenue || 0), 0)
    const avgLifetimeValue = customersList.length > 0 
      ? customersList.reduce((sum, c) => sum + (c.aiLifetimeValue || 0), 0) / customersList.length
      : 0
    
    // Calculate conversion rate (customers / (leads + prospects + customers))
    const potentialCustomers = (statusCounts.LEAD || 0) + (statusCounts.PROSPECT || 0) + (statusCounts.CUSTOMER || 0)
    const conversionRate = potentialCustomers > 0 
      ? ((statusCounts.CUSTOMER || 0) / potentialCustomers) * 100
      : 0
    
    // Calculate churn risk (percentage of customers at risk)
    const activeCustomers = (statusCounts.CUSTOMER || 0) + (statusCounts.CHAMPION || 0)
    const atRiskCustomers = statusCounts.AT_RISK || 0
    const churnRisk = activeCustomers > 0 
      ? (atRiskCustomers / (activeCustomers + atRiskCustomers)) * 100
      : 0
    
    return {
      totalCustomers: statusCounts.CUSTOMER || 0,
      totalLeads: statusCounts.LEAD || 0,
      conversionRate: Math.round(conversionRate * 10) / 10,
      avgLifetimeValue: Math.round(avgLifetimeValue),
      totalRevenue,
      activeDeals: statusCounts.PROSPECT || 0,
      churnRisk: Math.round(churnRisk)
    }
  }, [])


  const getStatusColor = useCallback((status: string) => {
    const stage = lifecycleStages.find(s => s.id === status)
    return stage?.color || 'bg-gray-500'
  }, [])

  const getStatusTextColor = useCallback((status: string) => {
    const stage = lifecycleStages.find(s => s.id === status)
    return stage?.textColor || 'text-gray-700'
  }, [])

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }, [])

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }, [])

  const handleCustomerView = useCallback((customerId: string) => {
    setSelectedCustomer(customerId)
    setViewMode('detail')
  }, [])

  const handleBackToList = useCallback(() => {
    setSelectedCustomer(null)
    setViewMode('list')
  }, [])

  // Memoized delete handler to prevent unnecessary re-renders
  const handleDeleteCustomer = useCallback((customerId: string) => {
    deleteCustomerMutation.mutate(customerId, {
      onSuccess: () => {
        console.log('Customer deleted successfully')
      },
      onError: (error) => {
        console.error('Failed to delete customer:', error)
        alert('Failed to delete customer. Please try again.')
      }
    })
  }, [deleteCustomerMutation])

  // Memoized pagination pages to prevent unnecessary recalculation
  const paginationPages = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    } else if (currentPage <= 3) {
      return Array.from({ length: 5 }, (_, i) => i + 1)
    } else if (currentPage >= totalPages - 2) {
      return Array.from({ length: 5 }, (_, i) => totalPages - 4 + i)
    } else {
      return Array.from({ length: 5 }, (_, i) => currentPage - 2 + i)
    }
  }, [totalPages, currentPage])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-gray-600">Loading customer data...</p>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="bg-red-50 rounded-lg p-6 max-w-md">
          <div className="flex items-start space-x-3">
            <ExclamationCircleIcon className="h-6 w-6 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800">Error Loading Data</h3>
              <p className="text-red-700 text-sm mt-1">{error instanceof Error ? error.message : 'Failed to load customer data'}</p>
              <button
                onClick={() => refetch()}
                className="mt-3 text-sm font-medium text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (viewMode === 'detail' && selectedCustomer) {
    return (
      <div>
        <div className="mb-6">
          <button
            onClick={handleBackToList}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Back to Customer List
          </button>
        </div>
        <CustomerLifecycleView
          customerId={selectedCustomer}
          onEdit={(customer) => {
            console.log('Edit customer:', customer)
            // Handle edit
          }}
          onAddActivity={() => console.log('Add activity')}
          onAddDeal={() => console.log('Add deal')}
          onAddContact={() => console.log('Add contact')}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CRM Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your customer relationships and sales pipeline</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 text-sm font-medium border border-gray-300 rounded-l-md ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-900 hover:bg-gray-50'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 text-sm font-medium border-t border-b border-gray-300 ${
                viewMode === 'map'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-900 hover:bg-gray-50'
              }`}
            >
              Map View
            </button>
            <button
              onClick={() => setViewMode('territory')}
              className={`px-4 py-2 text-sm font-medium border border-gray-300 rounded-r-md ${
                viewMode === 'territory'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-900 hover:bg-gray-50'
              }`}
            >
              Territory View
            </button>
          </div>
          
          <button 
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            value={metrics.totalCustomers.toString()}
            label="Total Customers"
            icon={UserGroupIcon}
            gradient="blue"
            trend={8}
          />
          <MetricCard
            value={formatCurrency(metrics.avgLifetimeValue)}
            label="Avg. Lifetime Value"
            icon={CurrencyDollarIcon}
            gradient="emerald"
            trend={12}
          />
          <MetricCard
            value={`${metrics.conversionRate}%`}
            label="Conversion Rate"
            icon={ChartBarIcon}
            gradient="violet"
            trend={5}
          />
          <MetricCard
            value={`${metrics.churnRisk}%`}
            label="Churn Risk"
            icon={ExclamationTriangleIcon}
            gradient="orange"
            trend={-3}
          />
        </div>
      )}

      {/* Map View */}
      {viewMode === 'map' && (
        <div className="space-y-6">
          <HybridMapComponent
            locations={customerLocations}
            tenantConfig={tenantConfig || undefined}
            onLocationClick={(location) => {
              console.log('Location clicked:', location)
              // Handle location selection
            }}
            onUpgrade={() => {
              console.log('Upgrade to premium mapping')
              // Handle upgrade flow
            }}
          />
          
          <CustomerLocationManager
            showMap={false}
            onLocationSelect={(location) => {
              console.log('Location selected:', location)
            }}
          />
        </div>
      )}

      {/* Territory Management View */}
      {viewMode === 'territory' && (
        <TerritoryManagementDashboard
          userId={selectedCustomer || undefined}
          tenantId="tenant-1" // In production, get from context
        />
      )}

      {/* Filters and Search */}
      {viewMode === 'list' && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search customers..."
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
              >
                <option value="ALL">All Statuses</option>
                {lifecycleStages.map((stage) => (
                  <option key={stage.id} value={stage.id}>{stage.name}</option>
                ))}
              </select>
              
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <FunnelIcon className="h-4 w-4 mr-2" />
                More Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer List */}
      {viewMode === 'list' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          {/* Customer Count */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {customers.length} of {totalCustomers} customers
            </p>
            {totalPages > 1 && (
              <p className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </p>
            )}
          </div>
          
          <div className="flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                {customers.length === 0 ? (
                  <div className="text-center py-12">
                    <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm || statusFilter !== 'ALL' ? 'Try adjusting your search criteria.' : 'Get started by adding your first customer.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {customers.map((customer, index) => (
                      <CustomerRow
                        key={customer.id}
                        customer={customer}
                        index={index}
                        onView={handleCustomerView}
                        onDelete={handleDeleteCustomer}
                        isDeleting={deleteCustomerMutation.isPending}
                        formatCurrency={formatCurrency}
                        formatDate={formatDate}
                        getStatusColor={getStatusColor}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                  currentPage === 1
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              
              <div className="flex items-center space-x-2">
                {/* Page numbers */}
                {paginationPages.map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                  currentPage === totalPages
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Create Customer Modal */}
      <CreateCustomerModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  )
}