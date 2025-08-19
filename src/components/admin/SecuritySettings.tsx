/**
 * CoreFlow360 - Security Settings Component
 * Security configuration and monitoring with API key management
 */

'use client'

import { useState } from 'react'
import { Shield, Lock, Key, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { APIKeyManagement } from './APIKeyManagement'

type SecurityView = 'overview' | 'api-keys'

export function SecuritySettings() {
  const { data: session } = useSession()
  const [currentView, setCurrentView] = useState<SecurityView>('overview')

  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN'

  const handleManageKeys = () => {
    if (isSuperAdmin) {
      setCurrentView('api-keys')
    } else {
      alert('API key management requires Super Admin privileges.')
    }
  }

  if (currentView === 'api-keys') {
    return (
      <div className="space-y-6">
        {/* Back Navigation */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCurrentView('overview')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Security Settings</span>
          </button>
        </div>

        {/* API Key Management Component */}
        <APIKeyManagement />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Security Settings</h2>

        <div className="space-y-4">
          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Two-Factor Authentication
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enabled for all admin users
                </p>
              </div>
            </div>
            <button className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700">
              Configure
            </button>
          </div>

          {/* Password Policy */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Lock className="h-6 w-6 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Password Policy</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Minimum 12 characters, complexity required
                </p>
              </div>
            </div>
            <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
              Edit Policy
            </button>
          </div>

          {/* API Key Management */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Key className="h-6 w-6 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">API Key Management</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isSuperAdmin
                    ? 'Manage third-party vendor API keys'
                    : 'Requires Super Admin access'}
                </p>
              </div>
            </div>
            <button
              onClick={handleManageKeys}
              className={`rounded-lg px-4 py-2 text-sm ${
                isSuperAdmin
                  ? 'border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700'
                  : 'cursor-not-allowed bg-gray-100 text-gray-400'
              }`}
              disabled={!isSuperAdmin}
            >
              {isSuperAdmin ? 'Manage Keys' : 'Super Admin Only'}
            </button>
          </div>

          {/* Security Monitoring */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Security Monitoring</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Real-time threat detection and alerts
                </p>
              </div>
            </div>
            <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
              View Logs
            </button>
          </div>

          {/* Access Control */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Access Control</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Role-based permissions and IP restrictions
                </p>
              </div>
            </div>
            <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
              Configure
            </button>
          </div>
        </div>
      </div>

      {/* Security Status Overview */}
      {isSuperAdmin && (
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Security Status Overview
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-200">Secure</span>
              </div>
              <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                All security policies are active
              </p>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800 dark:text-blue-200">Protected</span>
              </div>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                Advanced threat protection enabled
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
              <div className="flex items-center space-x-2">
                <Key className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-800 dark:text-gray-200">Monitored</span>
              </div>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                API keys and access tracked
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
