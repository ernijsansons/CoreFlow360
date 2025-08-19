/**
 * CoreFlow360 - Revenue Widget
 * Displays financial metrics and revenue trends
 */

'use client'

import { X, DollarSign, TrendingUp } from 'lucide-react'

interface RevenueWidgetProps {
  onRemove: () => void
  layout: 'grid' | 'list' | 'kanban'
}

export function RevenueWidget({ onRemove, layout }: RevenueWidgetProps) {
  const containerClass =
    layout === 'list'
      ? 'bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'
      : 'bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 h-full'

  return (
    <div className={containerClass}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Overview</h3>
        </div>
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Revenue</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">$124,560</p>
          <p className="mt-1 flex items-center text-sm text-green-600">
            <TrendingUp className="mr-1 h-4 w-4" />
            +12.5% from last month
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">MRR</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">$85,230</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">ARR</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">$1.02M</p>
          </div>
        </div>
      </div>
    </div>
  )
}
