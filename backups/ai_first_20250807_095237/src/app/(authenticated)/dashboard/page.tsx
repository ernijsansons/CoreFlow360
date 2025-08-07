"use client"

import { useEffect, useState } from "react"
import DashboardLayout from "@/components/layouts/DashboardLayout"
import { 
  UsersIcon, 
  BriefcaseIcon, 
  CurrencyDollarIcon,
  ChartBarSquareIcon 
} from "@heroicons/react/24/outline"

interface DashboardStats {
  totalCustomers: number
  activeJobs: number
  revenue: number
  growth: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    activeJobs: 0,
    revenue: 0,
    growth: 0
  })

  useEffect(() => {
    // Mock data for now - will be replaced with real API calls
    setStats({
      totalCustomers: 157,
      activeJobs: 23,
      revenue: 48250,
      growth: 12.5
    })
  }, [])

  const statCards = [
    {
      name: "Total Customers",
      value: stats.totalCustomers.toLocaleString(),
      icon: UsersIcon,
      color: "bg-blue-500"
    },
    {
      name: "Active Jobs",
      value: stats.activeJobs.toLocaleString(),
      icon: BriefcaseIcon,
      color: "bg-green-500"
    },
    {
      name: "Monthly Revenue",
      value: `$${stats.revenue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: "bg-yellow-500"
    },
    {
      name: "Growth Rate",
      value: `${stats.growth}%`,
      icon: ChartBarSquareIcon,
      color: "bg-purple-500"
    }
  ]

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Dashboard
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Welcome back! Here&apos;s what&apos;s happening with your business.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <div key={stat.name} className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt className="flex items-center text-sm font-medium text-gray-500 truncate">
                <div className={`p-2 rounded-md ${stat.color} mr-3`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                {stat.name}
              </dt>
              <dd className="mt-3 text-3xl font-semibold text-gray-900">
                {stat.value}
              </dd>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Recent Customers */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-6">
              <h3 className="text-base font-semibold leading-6 text-gray-900">Recent Customers</h3>
              <div className="mt-6 flow-root">
                <ul role="list" className="-my-5 divide-y divide-gray-200">
                  {[1, 2, 3].map((i) => (
                    <li key={i} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">
                            Customer {i}
                          </p>
                          <p className="truncate text-sm text-gray-500">
                            example{i}@email.com
                          </p>
                        </div>
                        <div>
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
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
              <h3 className="text-base font-semibold leading-6 text-gray-900">Recent Jobs</h3>
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
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
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