/**
 * CoreFlow360 - SaaS Subscription Manager
 * Comprehensive subscription management with billing, health scoring, and customer success
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CreditCardIcon,
  UsersIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  TrendingDownIcon,
  StarIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  BellIcon,
  EnvelopeIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline'
import { MetricCard } from '@/components/ui/MetricCard'

interface SaaSSubscription {
  id: string
  subscriptionKey: string
  customerEmail: string
  customerName?: string
  companyName?: string
  planName: string
  status: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED'
  subscriptionType: 'TRIAL' | 'STANDARD' | 'ENTERPRISE' | 'CUSTOM'
  startDate: string
  trialEndDate?: string
  currentPeriodStart: string
  currentPeriodEnd: string
  totalAmount: number
  userCount: number
  healthScore: number
  engagementScore: number
  churnRisk: number
  lastActivityDate?: string
  onboardingCompleted: boolean
  onboardingProgress: number
  featuresUsed: string[]
  featureAdoption: Record<string, number>
  mrr: number
  ltv?: number
}

interface SubscriptionMetrics {
  totalSubscriptions: number
  activeSubscriptions: number
  trialSubscriptions: number
  monthlyRevenue: number
  annualRevenue: number
  averageHealthScore: number
  churnRateMonth: number
  conversionRate: number
  averageLTV: number
}

interface SubscriptionManagerProps {
  onSubscriptionSelect?: (subscription: SaaSSubscription) => void
  onCreateSubscription?: () => void
  onUpgradeSubscription?: (subscription: SaaSSubscription) => void
  onCancelSubscription?: (subscription: SaaSSubscription) => void
}

const statusColors = {
  TRIAL: 'text-blue-700 bg-blue-100',
  ACTIVE: 'text-green-700 bg-green-100',
  PAST_DUE: 'text-orange-700 bg-orange-100',
  CANCELLED: 'text-gray-700 bg-gray-100',
  EXPIRED: 'text-red-700 bg-red-100',
}

const getHealthColor = (score: number) => {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

const getChurnRiskColor = (risk: number) => {
  if (risk <= 0.3) return 'text-green-600'
  if (risk <= 0.6) return 'text-yellow-600'
  return 'text-red-600'
}

export default function SubscriptionManager({
  onSubscriptionSelect,
  onCreateSubscription,
  onUpgradeSubscription,
  onCancelSubscription,
}: SubscriptionManagerProps) {
  const [subscriptions, setSubscriptions] = useState<SaaSSubscription[]>([])
  const [metrics, setMetrics] = useState<SubscriptionMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedPlan, setSelectedPlan] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('healthScore')
  const [showRiskAlert, setShowRiskAlert] = useState(true)

  useEffect(() => {
    loadSubscriptions()
  }, [selectedStatus, selectedPlan, sortBy])

  const loadSubscriptions = async () => {
    try {
      setLoading(true)

      // Mock data for demonstration
      const mockSubscriptions: SaaSSubscription[] = [
        {
          id: 'sub-1',
          subscriptionKey: 'ACME-001',
          customerEmail: 'john@acmecorp.com',
          customerName: 'John Smith',
          companyName: 'ACME Corp',
          planName: 'Professional',
          status: 'ACTIVE',
          subscriptionType: 'STANDARD',
          startDate: '2024-01-15',
          currentPeriodStart: '2024-08-01',
          currentPeriodEnd: '2024-09-01',
          totalAmount: 299,
          userCount: 15,
          healthScore: 85,
          engagementScore: 78,
          churnRisk: 0.15,
          lastActivityDate: '2024-08-08',
          onboardingCompleted: true,
          onboardingProgress: 1.0,
          featuresUsed: ['dashboard', 'reports', 'integrations', 'automation'],
          featureAdoption: {
            dashboard: 0.95,
            reports: 0.78,
            integrations: 0.65,
            automation: 0.45,
          },
          mrr: 299,
          ltv: 3588,
        },
        {
          id: 'sub-2',
          subscriptionKey: 'TECH-002',
          customerEmail: 'sarah@techstartup.io',
          customerName: 'Sarah Johnson',
          companyName: 'Tech Startup Inc',
          planName: 'Enterprise',
          status: 'ACTIVE',
          subscriptionType: 'ENTERPRISE',
          startDate: '2024-03-01',
          currentPeriodStart: '2024-08-01',
          currentPeriodEnd: '2024-09-01',
          totalAmount: 999,
          userCount: 50,
          healthScore: 92,
          engagementScore: 88,
          churnRisk: 0.08,
          lastActivityDate: '2024-08-09',
          onboardingCompleted: true,
          onboardingProgress: 1.0,
          featuresUsed: ['dashboard', 'reports', 'integrations', 'automation', 'api', 'sso'],
          featureAdoption: {
            dashboard: 0.98,
            reports: 0.85,
            integrations: 0.92,
            automation: 0.78,
            api: 0.65,
            sso: 0.88,
          },
          mrr: 999,
          ltv: 11988,
        },
        {
          id: 'sub-3',
          subscriptionKey: 'TRIAL-003',
          customerEmail: 'mike@newcompany.com',
          customerName: 'Mike Wilson',
          companyName: 'New Company LLC',
          planName: 'Basic',
          status: 'TRIAL',
          subscriptionType: 'TRIAL',
          startDate: '2024-08-01',
          trialEndDate: '2024-08-15',
          currentPeriodStart: '2024-08-01',
          currentPeriodEnd: '2024-08-15',
          totalAmount: 0,
          userCount: 3,
          healthScore: 45,
          engagementScore: 32,
          churnRisk: 0.75,
          lastActivityDate: '2024-08-05',
          onboardingCompleted: false,
          onboardingProgress: 0.3,
          featuresUsed: ['dashboard'],
          featureAdoption: {
            dashboard: 0.25,
            reports: 0.05,
            integrations: 0.0,
            automation: 0.0,
          },
          mrr: 0,
        },
        {
          id: 'sub-4',
          subscriptionKey: 'RETAIL-004',
          customerEmail: 'lisa@retailstore.com',
          customerName: 'Lisa Chen',
          companyName: 'Retail Store Co',
          planName: 'Professional',
          status: 'PAST_DUE',
          subscriptionType: 'STANDARD',
          startDate: '2023-12-01',
          currentPeriodStart: '2024-07-01',
          currentPeriodEnd: '2024-08-01',
          totalAmount: 299,
          userCount: 12,
          healthScore: 35,
          engagementScore: 28,
          churnRisk: 0.85,
          lastActivityDate: '2024-07-25',
          onboardingCompleted: true,
          onboardingProgress: 1.0,
          featuresUsed: ['dashboard', 'reports'],
          featureAdoption: {
            dashboard: 0.45,
            reports: 0.25,
            integrations: 0.0,
            automation: 0.0,
          },
          mrr: 299,
        },
      ]

      const mockMetrics: SubscriptionMetrics = {
        totalSubscriptions: mockSubscriptions.length,
        activeSubscriptions: mockSubscriptions.filter((s) => s.status === 'ACTIVE').length,
        trialSubscriptions: mockSubscriptions.filter((s) => s.status === 'TRIAL').length,
        monthlyRevenue: mockSubscriptions.reduce((sum, s) => sum + s.mrr, 0),
        annualRevenue: mockSubscriptions.reduce((sum, s) => sum + s.mrr * 12, 0),
        averageHealthScore:
          mockSubscriptions.reduce((sum, s) => sum + s.healthScore, 0) / mockSubscriptions.length,
        churnRateMonth: 5.2,
        conversionRate: 24.8,
        averageLTV: 5000,
      }

      setSubscriptions(mockSubscriptions)
      setMetrics(mockMetrics)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch =
      searchTerm === '' ||
      sub.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.subscriptionKey.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = selectedStatus === 'all' || sub.status === selectedStatus
    const matchesPlan = selectedPlan === 'all' || sub.planName === selectedPlan

    return matchesSearch && matchesStatus && matchesPlan
  })

  const highRiskSubscriptions = subscriptions.filter((s) => s.churnRisk > 0.7)
  const trialEndingSoon = subscriptions.filter(
    (s) =>
      s.status === 'TRIAL' &&
      s.trialEndDate &&
      new Date(s.trialEndDate).getTime() - new Date().getTime() <= 7 * 24 * 60 * 60 * 1000
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
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
          <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
          <p className="mt-1 text-gray-600">Monitor and manage SaaS customer subscriptions</p>
        </div>
        <button
          onClick={onCreateSubscription}
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Subscription
        </button>
      </div>

      {/* Alerts */}
      {showRiskAlert && (highRiskSubscriptions.length > 0 || trialEndingSoon.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-red-200 bg-red-50 p-4"
        >
          <div className="flex items-start">
            <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 text-red-400" />
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">Action Required</h3>
              <div className="mt-2 text-sm text-red-700">
                {highRiskSubscriptions.length > 0 && (
                  <p className="mb-1">
                    {highRiskSubscriptions.length} subscription
                    {highRiskSubscriptions.length > 1 ? 's' : ''} at high churn risk
                  </p>
                )}
                {trialEndingSoon.length > 0 && (
                  <p>
                    {trialEndingSoon.length} trial{trialEndingSoon.length > 1 ? 's' : ''} ending
                    within 7 days
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowRiskAlert(false)}
              className="text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            value={formatCurrency(metrics.monthlyRevenue)}
            label="Monthly Recurring Revenue"
            icon={CurrencyDollarIcon}
            gradient="emerald"
            trend={15.2}
          />
          <MetricCard
            value={metrics.activeSubscriptions.toString()}
            label="Active Subscriptions"
            icon={CheckCircleIcon}
            gradient="blue"
            trend={8.7}
          />
          <MetricCard
            value={`${metrics.averageHealthScore.toFixed(0)}%`}
            label="Average Health Score"
            icon={ChartBarIcon}
            gradient="violet"
            trend={3.4}
          />
          <MetricCard
            value={`${metrics.conversionRate}%`}
            label="Trial Conversion Rate"
            icon={TrendingUpIcon}
            gradient="orange"
            trend={2.1}
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
              placeholder="Search subscriptions..."
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
            <option value="TRIAL">Trial</option>
            <option value="ACTIVE">Active</option>
            <option value="PAST_DUE">Past Due</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
            className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Plans</option>
            <option value="Basic">Basic</option>
            <option value="Professional">Professional</option>
            <option value="Enterprise">Enterprise</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="healthScore">Health Score</option>
            <option value="churnRisk">Churn Risk</option>
            <option value="mrr">MRR</option>
            <option value="startDate">Start Date</option>
          </select>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredSubscriptions.map((subscription, index) => (
            <motion.li
              key={subscription.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => onSubscriptionSelect?.(subscription)}
            >
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                        <CreditCardIcon className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">
                          {subscription.companyName || subscription.customerName}
                        </p>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[subscription.status]}`}
                        >
                          {subscription.status}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                          {subscription.planName}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center">
                        <p className="text-sm text-gray-500">
                          {subscription.customerEmail} • {subscription.userCount} users
                        </p>
                      </div>
                      <div className="mt-2 flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500">Health:</span>
                          <span
                            className={`text-xs font-medium ${getHealthColor(subscription.healthScore)}`}
                          >
                            {subscription.healthScore}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500">Churn Risk:</span>
                          <span
                            className={`text-xs font-medium ${getChurnRiskColor(subscription.churnRisk)}`}
                          >
                            {(subscription.churnRisk * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500">Onboarding:</span>
                          <span className="text-xs font-medium text-gray-700">
                            {(subscription.onboardingProgress * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(subscription.mrr)}/mo
                      </p>
                      <p className="text-sm text-gray-500">
                        {subscription.ltv
                          ? `${formatCurrency(subscription.ltv)} LTV`
                          : 'New customer'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      {subscription.churnRisk > 0.7 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            // Handle intervention
                          }}
                          className="rounded-md p-2 text-red-400 hover:bg-red-50 hover:text-red-600"
                          title="High Churn Risk - Take Action"
                        >
                          <ExclamationTriangleIcon className="h-4 w-4" />
                        </button>
                      )}
                      {subscription.status === 'TRIAL' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onUpgradeSubscription?.(subscription)
                          }}
                          className="rounded-md p-2 text-green-400 hover:bg-green-50 hover:text-green-600"
                          title="Convert Trial"
                        >
                          <TrendingUpIcon className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        className="rounded-md p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                        title="Contact Customer"
                      >
                        <EnvelopeIcon className="h-4 w-4" />
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
      {filteredSubscriptions.length === 0 && (
        <div className="py-12 text-center">
          <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No subscriptions found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first customer subscription
          </p>
          <div className="mt-6">
            <button
              onClick={onCreateSubscription}
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Subscription
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
