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
  const containerClass = layout === 'list' 
    ? 'bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'
    : 'bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 h-full'

  return (
    <div className={containerClass}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            System Performance
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
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-400">API Response Time</span>
            <span className="text-green-600">92ms</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full" style={{width: '92%'}}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-400">Uptime</span>
            <span className="text-green-600">99.9%</span>
          </div>
        </div>
      </div>
    </div>
  )
}