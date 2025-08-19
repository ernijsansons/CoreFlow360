/**
 * CoreFlow360 - Security Widget
 * Security monitoring and alerts
 */

'use client'

import { X, Shield, CheckCircle, AlertTriangle } from 'lucide-react'

interface SecurityWidgetProps {
  onRemove: () => void
  layout: 'grid' | 'list' | 'kanban'
}

export function SecurityWidget({ onRemove, layout }: SecurityWidgetProps) {
  const containerClass =
    layout === 'list'
      ? 'bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'
      : 'bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 h-full'

  return (
    <div className={containerClass}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security Overview</h3>
        </div>
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-lg bg-green-50 p-3">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-gray-700">All systems secure</span>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Failed login attempts</span>
            <span className="font-medium">0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Active sessions</span>
            <span className="font-medium">142</span>
          </div>
        </div>
      </div>
    </div>
  )
}
