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
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Security Settings
        </h2>
        
        <div className="space-y-4">
          {/* Two-Factor Authentication */}
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
          
          {/* Password Policy */}
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
          
          {/* API Key Management */}
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <Key className="w-6 h-6 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">API Key Management</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isSuperAdmin ? 'Manage third-party vendor API keys' : 'Requires Super Admin access'}
                </p>
              </div>
            </div>
            <button 
              onClick={handleManageKeys}
              className={`px-4 py-2 text-sm rounded-lg ${
                isSuperAdmin 
                  ? 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              disabled={!isSuperAdmin}
            >
              {isSuperAdmin ? 'Manage Keys' : 'Super Admin Only'}
            </button>
          </div>

          {/* Security Monitoring */}
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Security Monitoring</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Real-time threat detection and alerts</p>
              </div>
            </div>
            <button className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              View Logs
            </button>
          </div>

          {/* Access Control */}
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Access Control</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Role-based permissions and IP restrictions</p>
              </div>
            </div>
            <button className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              Configure
            </button>
          </div>
        </div>
      </div>

      {/* Security Status Overview */}
      {isSuperAdmin && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Security Status Overview
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-200">Secure</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                All security policies are active
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800 dark:text-blue-200">Protected</span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Advanced threat protection enabled
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-800 dark:text-gray-200">Monitored</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                API keys and access tracked
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}