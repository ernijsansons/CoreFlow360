/**
 * CoreFlow360 - Organization Settings Component
 * General organization configuration
 */

'use client'

import { Settings, Globe, Mail, Bell } from 'lucide-react'

export function OrganizationSettings() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Organization Settings
        </h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">General Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Organization Name
                </label>
                <input
                  type="text"
                  defaultValue="Acme Corporation"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Industry
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option>Technology</option>
                  <option>Healthcare</option>
                  <option>Manufacturing</option>
                </select>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Preferences</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Enable AI recommendations</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Automatic backups</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </label>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}