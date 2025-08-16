/**
 * CoreFlow360 - Security Settings Component
 * Security configuration and monitoring
 */

'use client'

import { Shield, Lock, Key, AlertTriangle, CheckCircle } from 'lucide-react'

export function SecuritySettings() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Security Settings
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Enabled for all admin users</p>
              </div>
            </div>
            <button className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
              Configure
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <Lock className="w-6 h-6 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Password Policy</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Minimum 12 characters, complexity required</p>
              </div>
            </div>
            <button className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              Edit Policy
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <Key className="w-6 h-6 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">API Key Management</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">12 active keys</p>
              </div>
            </div>
            <button className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              Manage Keys
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}