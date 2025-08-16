/**
 * CoreFlow360 - Team Widget
 * Displays team activity and performance
 */

'use client'

import { X, Users } from 'lucide-react'

interface TeamWidgetProps {
  onRemove: () => void
  layout: 'grid' | 'list' | 'kanban'
}

export function TeamWidget({ onRemove, layout }: TeamWidgetProps) {
  const containerClass = layout === 'list' 
    ? 'bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'
    : 'bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 h-full'

  return (
    <div className={containerClass}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Team Activity
          </h3>
        </div>
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Active Now</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">8/12</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Tasks Completed Today</span>
          <span className="text-lg font-semibold text-green-600">24</span>
        </div>
      </div>
    </div>
  )
}