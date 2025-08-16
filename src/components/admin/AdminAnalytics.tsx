/**
 * CoreFlow360 - Admin Analytics Component
 * Organization-wide analytics and insights
 */

'use client'

import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react'

export function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Organization Analytics
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">85%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Feature Adoption</p>
          </div>
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">+23%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Growth Rate</p>
          </div>
          <div className="text-center">
            <Users className="w-12 h-12 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">342</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
          </div>
          <div className="text-center">
            <DollarSign className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">$124K</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">MRR</p>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Advanced analytics charts would be integrated here using Chart.js or Recharts
          </p>
        </div>
      </div>
    </div>
  )
}