/**
 * CoreFlow360 - Deals Widget
 * Displays active deals and pipeline
 */

'use client'

import { X, TrendingUp } from 'lucide-react'

interface DealsWidgetProps {
  onRemove: () => void
  layout: 'grid' | 'list' | 'kanban'
}

export function DealsWidget({ onRemove, layout }: DealsWidgetProps) {
  const containerClass =
    layout === 'list'
      ? 'bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'
      : 'bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 h-full'

  return (
    <div className={containerClass}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Deals</h3>
        </div>
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Deals</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">$450K</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pipeline Value</p>
          </div>
        </div>
      </div>
    </div>
  )
}
