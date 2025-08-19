/**
 * CoreFlow360 - Organization Settings Component
 * General organization configuration
 */

'use client'

import { Settings, Globe, Mail, Bell } from 'lucide-react'

export function OrganizationSettings() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          Organization Settings
        </h2>

        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              General Information
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Organization Name
                </label>
                <input
                  type="text"
                  defaultValue="Acme Corporation"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Industry
                </label>
                <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                  <option>Technology</option>
                  <option>Healthcare</option>
                  <option>Manufacturing</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              Preferences
            </h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Enable AI recommendations
                </span>
                <input type="checkbox" defaultChecked className="rounded" />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Automatic backups</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
