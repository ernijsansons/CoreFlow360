/**
 * CoreFlow360 - Admin Analytics Component
 * Organization-wide analytics and insights
 */

'use client'

import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react'

export function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          Organization Analytics
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="text-center">
            <BarChart3 className="mx-auto mb-2 h-12 w-12 text-purple-600" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">85%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Feature Adoption</p>
          </div>
          <div className="text-center">
            <TrendingUp className="mx-auto mb-2 h-12 w-12 text-green-600" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">+23%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Growth Rate</p>
          </div>
          <div className="text-center">
            <Users className="mx-auto mb-2 h-12 w-12 text-blue-600" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">342</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
          </div>
          <div className="text-center">
            <DollarSign className="mx-auto mb-2 h-12 w-12 text-emerald-600" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">$124K</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">MRR</p>
          </div>
        </div>

        <div className="mt-8 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Advanced analytics charts would be integrated here using Chart.js or Recharts
          </p>
        </div>
      </div>
    </div>
  )
}
