/**
 * CoreFlow360 - Customer Lifecycle Management View
 * Comprehensive customer management with AI-powered insights
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UserIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon,
  CalendarIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  TrendingDownIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftIcon,
  PlusIcon,
  PencilIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { MetricCard } from '@/components/ui/MetricCard'

interface Customer {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  address?: string
  createdAt: string
  updatedAt: string
  
  // AI Intelligence
  aiScore: number
  aiChurnRisk: number
  aiLifetimeValue: number
  aiLastAnalysisAt?: string
  aiRecommendations: string[]
  
  // Lifecycle data
  status: 'LEAD' | 'PROSPECT' | 'CUSTOMER' | 'CHAMPION' | 'AT_RISK' | 'CHURNED'
  source: string
  lastInteraction?: string
  nextAction?: string
  
  // Statistics
  totalDeals: number
  totalRevenue: number
  avgDealSize: number
  conversionRate: number
  
  // Relationships
  deals?: Deal[]
  contacts?: Contact[]
  activities?: Activity[]
}

interface Deal {
  id: string
  title: string
  value: number
  stage: string
  probability: number
  expectedCloseDate?: string
  createdAt: string
}

interface Contact {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  title?: string
  isPrimary: boolean
  contactType: string
}

interface Activity {
  id: string
  type: string
  subject: string
  description?: string
  scheduledAt?: string
  completedAt?: string
  status: string
  assignee?: {
    name: string
    avatar?: string
  }
}

interface CustomerLifecycleViewProps {
  customerId: string
  onEdit?: (customer: Customer) => void
  onAddActivity?: () => void
  onAddDeal?: () => void
  onAddContact?: () => void
}

const lifecycleStages = [
  { id: 'LEAD', name: 'Lead', color: 'bg-gray-500', description: 'Initial contact' },
  { id: 'PROSPECT', name: 'Prospect', color: 'bg-blue-500', description: 'Qualified interest' },
  { id: 'CUSTOMER', name: 'Customer', color: 'bg-green-500', description: 'Active customer' },
  { id: 'CHAMPION', name: 'Champion', color: 'bg-purple-500', description: 'Brand advocate' },
  { id: 'AT_RISK', name: 'At Risk', color: 'bg-yellow-500', description: 'Churn risk' },
  { id: 'CHURNED', name: 'Churned', color: 'bg-red-500', description: 'Lost customer' }
]

export default function CustomerLifecycleView({ 
  customerId, 
  onEdit, 
  onAddActivity, 
  onAddDeal, 
  onAddContact 
}: CustomerLifecycleViewProps) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'deals' | 'activities' | 'contacts'>('overview')

  useEffect(() => {
    loadCustomer()
  }, [customerId])

  const loadCustomer = async () => {
    try {
      setLoading(true)
      // Mock data for demonstration
      const mockCustomer: Customer = {
        id: customerId,
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        phone: '+1 (555) 123-4567',
        address: '123 Business St, City, ST 12345',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-08-09T14:22:00Z',
        aiScore: 85,
        aiChurnRisk: 15,
        aiLifetimeValue: 125000,
        aiLastAnalysisAt: '2024-08-09T12:00:00Z',
        aiRecommendations: [
          'Schedule quarterly business review',
          'Introduce premium service tier',
          'Connect with decision maker in finance department'
        ],
        status: 'CUSTOMER',
        source: 'Website',
        lastInteraction: '2024-08-05T09:15:00Z',
        nextAction: 'Follow up on proposal',
        totalDeals: 8,
        totalRevenue: 245000,
        avgDealSize: 30625,
        conversionRate: 75,
        deals: [
          {
            id: '1',
            title: 'Q4 Service Contract',
            value: 45000,
            stage: 'Negotiation',
            probability: 80,
            expectedCloseDate: '2024-12-01T00:00:00Z',
            createdAt: '2024-11-01T10:00:00Z'
          },
          {
            id: '2',
            title: 'System Upgrade',
            value: 25000,
            stage: 'Proposal',
            probability: 60,
            expectedCloseDate: '2024-10-15T00:00:00Z',
            createdAt: '2024-09-15T14:30:00Z'
          }
        ],
        contacts: [
          {
            id: '1',
            firstName: 'John',
            lastName: 'Smith',
            email: 'john.smith@example.com',
            phone: '+1 (555) 123-4567',
            title: 'CEO',
            isPrimary: true,
            contactType: 'BUSINESS'
          },
          {
            id: '2',
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah.j@example.com',
            phone: '+1 (555) 123-4568',
            title: 'CFO',
            isPrimary: false,
            contactType: 'BUSINESS'
          }
        ],
        activities: [
          {
            id: '1',
            type: 'CALL',
            subject: 'Quarterly Check-in',
            description: 'Discussed Q4 needs and upcoming projects',
            completedAt: '2024-08-05T09:15:00Z',
            status: 'COMPLETED',
            assignee: { name: 'Alex Morgan' }
          },
          {
            id: '2',
            type: 'EMAIL',
            subject: 'Proposal Follow-up',
            description: 'Sent follow-up email regarding system upgrade proposal',
            scheduledAt: '2024-08-10T10:00:00Z',
            status: 'PENDING',
            assignee: { name: 'Alex Morgan' }
          }
        ]
      }
      
      setCustomer(mockCustomer)
    } catch (error) {
      console.error('Failed to load customer:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const stage = lifecycleStages.find(s => s.id === status)
    return stage?.color || 'bg-gray-500'
  }

  const getRiskColor = (risk: number) => {
    if (risk < 25) return 'text-green-500'
    if (risk < 50) return 'text-yellow-500'
    return 'text-red-500'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Customer not found</h3>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                  <UserIcon className="h-8 w-8 text-gray-600" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {customer.firstName} {customer.lastName}
                </h1>
                <div className="flex items-center space-x-4 mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getStatusColor(customer.status)}`}>
                    {lifecycleStages.find(s => s.id === customer.status)?.name}
                  </span>
                  <div className="flex items-center text-sm text-gray-500">
                    <StarIcon className="h-4 w-4 mr-1" />
                    AI Score: {customer.aiScore}/100
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => onEdit?.(customer)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </button>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-200 px-6 py-4">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-3">
            {customer.email && (
              <div className="flex items-center">
                <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-900">{customer.email}</span>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center">
                <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-900">{customer.phone}</span>
              </div>
            )}
            {customer.address && (
              <div className="flex items-center">
                <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-900">{customer.address}</span>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <MetricCard
          value={`${customer.aiScore}%`}
          label="AI Score"
          icon={SparklesIcon}
          gradient="violet"
          trend={customer.aiScore > 75 ? 5 : -2}
        />
        <MetricCard
          value={`${customer.aiChurnRisk}%`}
          label="Churn Risk"
          icon={ExclamationTriangleIcon}
          gradient="orange"
          trend={customer.aiChurnRisk < 25 ? -5 : 8}
        />
        <MetricCard
          value={formatCurrency(customer.aiLifetimeValue)}
          label="Lifetime Value"
          icon={CurrencyDollarIcon}
          gradient="emerald"
          trend={12}
        />
        <MetricCard
          value={`${customer.conversionRate}%`}
          label="Conversion Rate"
          icon={TrendingUpIcon}
          gradient="blue"
          trend={customer.conversionRate > 50 ? 3 : -1}
        />
      </div>

      {/* AI Recommendations */}
      {customer.aiRecommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <SparklesIcon className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-medium text-purple-900">AI Recommendations</h3>
          </div>
          <ul className="space-y-2">
            {customer.aiRecommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start space-x-2">
                <CheckCircleIcon className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-purple-800">{recommendation}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'deals', label: `Deals (${customer.deals?.length || 0})` },
              { key: 'activities', label: `Activities (${customer.activities?.length || 0})` },
              { key: 'contacts', label: `Contacts (${customer.contacts?.length || 0})` }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Statistics</h3>
                    <dl className="space-y-4">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Total Deals</dt>
                        <dd className="text-sm font-medium text-gray-900">{customer.totalDeals}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Total Revenue</dt>
                        <dd className="text-sm font-medium text-gray-900">{formatCurrency(customer.totalRevenue)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Average Deal Size</dt>
                        <dd className="text-sm font-medium text-gray-900">{formatCurrency(customer.avgDealSize)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Customer Since</dt>
                        <dd className="text-sm font-medium text-gray-900">{formatDate(customer.createdAt)}</dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {customer.activities?.slice(0, 3).map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-3">
                          <div className={`flex-shrink-0 w-2 h-2 rounded-full ${
                            activity.status === 'COMPLETED' ? 'bg-green-400' : 'bg-yellow-400'
                          }`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900">{activity.subject}</p>
                            <p className="text-xs text-gray-500">
                              {activity.completedAt 
                                ? `Completed ${formatDate(activity.completedAt)}`
                                : `Scheduled ${formatDate(activity.scheduledAt!)}`
                              }
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'deals' && (
              <motion.div
                key="deals"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Deals</h3>
                  <button
                    onClick={onAddDeal}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Deal
                  </button>
                </div>
                
                <div className="space-y-4">
                  {customer.deals?.map((deal) => (
                    <div key={deal.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-md font-medium text-gray-900">{deal.title}</h4>
                          <p className="text-sm text-gray-500 mt-1">Stage: {deal.stage}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">{formatCurrency(deal.value)}</p>
                          <p className="text-sm text-gray-500">{deal.probability}% probability</p>
                        </div>
                      </div>
                      {deal.expectedCloseDate && (
                        <div className="mt-3 flex items-center text-sm text-gray-500">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          Expected close: {formatDate(deal.expectedCloseDate)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'activities' && (
              <motion.div
                key="activities"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Activities</h3>
                  <button
                    onClick={onAddActivity}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Activity
                  </button>
                </div>
                
                <div className="space-y-4">
                  {customer.activities?.map((activity) => (
                    <div key={activity.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-md font-medium text-gray-900">{activity.subject}</h4>
                          <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                          <div className="flex items-center mt-2 text-xs text-gray-400">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              activity.status === 'COMPLETED' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {activity.status === 'COMPLETED' ? 'Completed' : 'Pending'}
                            </span>
                            {activity.assignee && (
                              <span className="ml-3">Assigned to {activity.assignee.name}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {activity.completedAt 
                            ? formatDate(activity.completedAt)
                            : formatDate(activity.scheduledAt!)
                          }
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'contacts' && (
              <motion.div
                key="contacts"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Contacts</h3>
                  <button
                    onClick={onAddContact}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Contact
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {customer.contacts?.map((contact) => (
                    <div key={contact.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center">
                            <h4 className="text-md font-medium text-gray-900">
                              {contact.firstName} {contact.lastName}
                            </h4>
                            {contact.isPrimary && (
                              <StarIconSolid className="h-4 w-4 text-yellow-400 ml-2" />
                            )}
                          </div>
                          {contact.title && (
                            <p className="text-sm text-gray-500">{contact.title}</p>
                          )}
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          contact.contactType === 'BUSINESS' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {contact.contactType}
                        </span>
                      </div>
                      <div className="mt-3 space-y-1">
                        {contact.email && (
                          <div className="flex items-center text-sm text-gray-500">
                            <EnvelopeIcon className="h-4 w-4 mr-2" />
                            {contact.email}
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center text-sm text-gray-500">
                            <PhoneIcon className="h-4 w-4 mr-2" />
                            {contact.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}