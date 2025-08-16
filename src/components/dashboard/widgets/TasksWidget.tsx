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
  const containerClass = layout === 'list' 
    ? 'bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'
    : 'bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 h-full'

  const tasks = [
    { id: 1, title: 'Review Q4 sales report', status: 'pending', priority: 'high' },
    { id: 2, title: 'Call client about renewal', status: 'pending', priority: 'medium' },
    { id: 3, title: 'Update project timeline', status: 'completed', priority: 'low' }
  ]

  return (
    <div className={containerClass}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            My Tasks
          </h3>
        </div>
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        {tasks.map(task => (
          <div
            key={task.id}
            className={`p-3 rounded-lg border ${
              task.status === 'completed' 
                ? 'bg-gray-50 border-gray-200 opacity-60' 
                : 'bg-white border-gray-200 hover:border-blue-300'
            } dark:bg-gray-700 dark:border-gray-600`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {task.status === 'completed' ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Clock className="w-4 h-4 text-gray-400" />
                )}
                <span className={`text-sm ${
                  task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
                } dark:text-gray-300`}>
                  {task.title}
                </span>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${
                task.priority === 'high' ? 'bg-red-100 text-red-600' :
                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                'bg-gray-100 text-gray-600'
              }`}>
                {task.priority}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}