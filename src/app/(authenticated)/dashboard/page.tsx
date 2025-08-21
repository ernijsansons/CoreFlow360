'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { MultiBusinessCommandCenter } from '@/components/multi-business/MultiBusinessCommandCenter'
import {
  UsersIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  ChartBarSquareIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { useDashboardInsights } from '@/hooks/useDashboardInsights'

interface DashboardStats {
  totalCustomers: number
  activeJobs: number
  revenue: number
  growth: number
}

export default function Dashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    activeJobs: 0,
    revenue: 0,
    growth: 0,
  })
  const [userBusinesses, setUserBusinesses] = useState<unknown[]>([])
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(true)

  // Get AI-powered insights
  const { insights, isLoading, error } = useDashboardInsights({
    timeRange: '30d',
  })

  // Check if user has multiple businesses
  useEffect(() => {
    const checkMultipleBusinesses = async () => {
      try {
        if (!session?.user?.tenantId) return
        
        // Mock check for multiple businesses - in production, this would be a real API call
        // For now, simulate based on user email or other criteria
        const mockBusinesses = [
          { id: 1, name: 'Phoenix HVAC Services', active: true },
          { id: 2, name: 'Desert Air Solutions', active: true },
          { id: 3, name: 'Valley Maintenance Co', active: true }
        ]
        
        setUserBusinesses(mockBusinesses)
        setIsLoadingBusinesses(false)
      } catch (error) {
        console.error('Error checking businesses:', error)
        setIsLoadingBusinesses(false)
      }
    }

    checkMultipleBusinesses()
  }, [session?.user?.tenantId])

  useEffect(() => {
    if (insights) {
      // Extract stats from AI insights
      const revenueMetric = insights.metrics.find(m => m.id === 'revenue')
      const dealsMetric = insights.metrics.find(m => m.id === 'deals')
      const customersMetric = insights.metrics.find(m => m.id === 'customers')
      
      setStats({
        totalCustomers: typeof customersMetric?.value === 'number' ? customersMetric.value : 157,
        activeJobs: typeof dealsMetric?.value === 'number' ? dealsMetric.value : 23,
        revenue: typeof revenueMetric?.value === 'number' ? revenueMetric.value : 48250,
        growth: revenueMetric?.change || 12.5,
      })
    } else {
      // Fallback to mock data
      setStats({
        totalCustomers: 157,
        activeJobs: 23,
        revenue: 48250,
        growth: 12.5,
      })
    }
  }, [insights])

  const statCards = [
    {
      name: 'Total Customers',
      value: stats.totalCustomers.toLocaleString(),
      icon: UsersIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Active Jobs',
      value: stats.activeJobs.toLocaleString(),
      icon: BriefcaseIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Monthly Revenue',
      value: `$${stats.revenue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500',
    },
    {
      name: 'Growth Rate',
      value: `${stats.growth}%`,
      icon: ChartBarSquareIcon,
      color: 'bg-purple-500',
    },
  ]

  // Show loading state while checking businesses
  if (isLoadingBusinesses) {
    return (
      <DashboardLayout>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your business portfolio...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // If user has multiple businesses, show portfolio dashboard
  if (userBusinesses.length > 1) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50">
          {/* Breadcrumb Navigation */}
          <div className="bg-white border-b border-gray-200">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="py-4">
                <nav className="flex" aria-label="Breadcrumb">
                  <ol className="flex items-center space-x-4">
                    <li>
                      <div className="flex">
                        <a href="/dashboard" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                          Portfolio Overview
                        </a>
                      </div>
                    </li>
                  </ol>
                </nav>
              </div>
            </div>
          </div>
          
          <MultiBusinessCommandCenter />
        </div>
      </DashboardLayout>
    )
  }

  // Single business dashboard
  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation for Single Business */}
        <div className="mb-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <div className="flex">
                  <a href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                    Single Business Dashboard
                  </a>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl leading-7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Dashboard
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back! Here&apos;s what&apos;s happening with your business.
            </p>
            {/* Hint for multi-business users */}
            <div className="mt-2">
              <a href="/add-business" className="text-sm text-blue-600 hover:text-blue-500">
                Add another business to unlock progressive pricing savings →
              </a>
            </div>
          </div>
          {insights && (
            <div className="mt-4 flex items-center space-x-2 md:mt-0">
              <SparklesIcon className="h-5 w-5 text-purple-500" />
              <span className="text-sm text-purple-600">AI-Powered Insights</span>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <div
              key={stat.name}
              className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
            >
              <dt className="flex items-center truncate text-sm font-medium text-gray-500">
                <div className={`rounded-md p-2 ${stat.color} mr-3`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                {stat.name}
              </dt>
              <dd className="mt-3 text-3xl font-semibold text-gray-900">{stat.value}</dd>
            </div>
          ))}
        </div>

        {/* AI Insights Section */}
        {insights && (
          <div className="mt-8 overflow-hidden rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 shadow">
            <div className="p-6">
              <h3 className="text-base leading-6 font-semibold text-gray-900 mb-4">AI Recommendations</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium text-purple-700 mb-2">Immediate Actions</h4>
                  <ul className="space-y-2">
                    {insights.recommendations.immediate.map((rec, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start">
                        <span className="text-purple-500 mr-2">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-purple-700 mb-2">Predictions</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Revenue Next Period</p>
                      <p className="text-lg font-semibold text-purple-700">
                        ${insights.predictions.revenue.value.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Expected Deals</p>
                      <p className="text-lg font-semibold text-purple-700">
                        {insights.predictions.deals.value}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Recent Customers */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-6">
              <h3 className="text-base leading-6 font-semibold text-gray-900">Recent Customers</h3>
              <div className="mt-6 flow-root">
                <ul role="list" className="-my-5 divide-y divide-gray-200">
                  {[1, 2, 3].map((i) => (
                    <li key={i} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">Customer {i}</p>
                          <p className="truncate text-sm text-gray-500">example{i}@email.com</p>
                        </div>
                        <div>
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset">
                            Active
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Recent Jobs */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-6">
              <h3 className="text-base leading-6 font-semibold text-gray-900">Recent Jobs</h3>
              <div className="mt-6 flow-root">
                <ul role="list" className="-my-5 divide-y divide-gray-200">
                  {[1, 2, 3].map((i) => (
                    <li key={i} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">
                            HVAC Service Call #{1000 + i}
                          </p>
                          <p className="truncate text-sm text-gray-500">
                            Customer {i} - Scheduled for today
                          </p>
                        </div>
                        <div>
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-600/20 ring-inset">
                            Scheduled
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
