/**
 * CoreFlow360 - Performance Widget
 * System performance metrics
 */

'use client'

import { X, Zap } from 'lucide-react'

interface PerformanceWidgetProps {
  onRemove: () => void
  layout: 'grid' | 'list' | 'kanban'
}

export function PerformanceWidget({ onRemove, layout }: PerformanceWidgetProps) {
  const containerClass =
    layout === 'list'
      ? 'bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'
      : 'bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 h-full'

  return (
    <div className={containerClass}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            System Performance
          </h3>
        </div>
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">API Response Time</span>
            <span className="text-green-600">92ms</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div className="h-2 rounded-full bg-green-600" style={{ width: '92%' }}></div>
          </div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Uptime</span>
            <span className="text-green-600">99.9%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
