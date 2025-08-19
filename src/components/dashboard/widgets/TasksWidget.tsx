/**
 * CoreFlow360 - Tasks Widget
 * Displays user tasks and to-dos
 */

'use client'

import { X, Target, Clock, CheckCircle } from 'lucide-react'

interface TasksWidgetProps {
  onRemove: () => void
  layout: 'grid' | 'list' | 'kanban'
}

export function TasksWidget({ onRemove, layout }: TasksWidgetProps) {
  const containerClass =
    layout === 'list'
      ? 'bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'
      : 'bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 h-full'

  const tasks = [
    { id: 1, title: 'Review Q4 sales report', status: 'pending', priority: 'high' },
    { id: 2, title: 'Call client about renewal', status: 'pending', priority: 'medium' },
    { id: 3, title: 'Update project timeline', status: 'completed', priority: 'low' },
  ]

  return (
    <div className={containerClass}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Tasks</h3>
        </div>
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`rounded-lg border p-3 ${
              task.status === 'completed'
                ? 'border-gray-200 bg-gray-50 opacity-60'
                : 'border-gray-200 bg-white hover:border-blue-300'
            } dark:border-gray-600 dark:bg-gray-700`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {task.status === 'completed' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Clock className="h-4 w-4 text-gray-400" />
                )}
                <span
                  className={`text-sm ${
                    task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'
                  } dark:text-gray-300`}
                >
                  {task.title}
                </span>
              </div>
              <span
                className={`rounded px-2 py-1 text-xs ${
                  task.priority === 'high'
                    ? 'bg-red-100 text-red-600'
                    : task.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-gray-100 text-gray-600'
                }`}
              >
                {task.priority}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
