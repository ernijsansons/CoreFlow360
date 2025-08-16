/**
 * CoreFlow360 - Admin Portal
 * Comprehensive admin interface with user management, module control, and analytics
 */

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Users,
  Shield,
  Package,
  BarChart3,
  Settings,
  Search,
  Plus,
  Filter,
  Download,
  RefreshCw,
  ChevronRight,
  Activity,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react'

// Import admin components
import { UserManagement } from '@/components/admin/UserManagement'
import { ModuleControl } from '@/components/admin/ModuleControl'
import { AdminAnalytics } from '@/components/admin/AdminAnalytics'
import { SecuritySettings } from '@/components/admin/SecuritySettings'
import { OrganizationSettings } from '@/components/admin/OrganizationSettings'

const adminTabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'modules', label: 'Module Control', icon: Package },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'settings', label: 'Settings', icon: Settings }
]

export default function AdminPage() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')

  // Loading state
  if (status === 'loading') {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-pulse text-gray-600">Loading...</div>
    </div>
  }

  // Not authenticated
  if (!session) {
    redirect('/login')
  }

  const user = session.user as any

  // Check if user has admin permissions
  if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    redirect('/dashboard')
  }

  // Permission checks based on role
  const canManageUsers = ['ADMIN', 'SUPER_ADMIN'].includes(user.role)
  const canManageModules = ['ADMIN', 'SUPER_ADMIN'].includes(user.role)
  const canViewAnalytics = ['ADMIN', 'SUPER_ADMIN'].includes(user.role)
  const canManageSecurity = ['SUPER_ADMIN'].includes(user.role)

  // Filter tabs based on permissions
  const availableTabs = adminTabs.filter(tab => {
    switch (tab.id) {
      case 'users': return canManageUsers
      case 'modules': return canManageModules
      case 'analytics': return canViewAnalytics
      case 'security': return canManageSecurity
      default: return true
    }
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-purple-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Admin Portal
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users, settings..."
                  className="pl-10 pr-4 py-2 w-64 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              {/* Quick Actions */}
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <RefreshCw className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {availableTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && <AdminOverview />}
          {activeTab === 'users' && <UserManagement searchQuery={searchQuery} />}
          {activeTab === 'modules' && <ModuleControl />}
          {activeTab === 'analytics' && <AdminAnalytics />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'settings' && <OrganizationSettings />}
        </motion.div>
      </div>
    </div>
  )
}

// Admin Overview Component
function AdminOverview() {
  const stats = [
    {
      label: 'Total Users',
      value: '342',
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'blue'
    },
    {
      label: 'Active Modules',
      value: '8 / 10',
      change: '+2 this month',
      trend: 'up',
      icon: Package,
      color: 'purple'
    },
    {
      label: 'Monthly Revenue',
      value: '$124,560',
      change: '+23%',
      trend: 'up',
      icon: DollarSign,
      color: 'green'
    },
    {
      label: 'System Health',
      value: '99.9%',
      change: 'Stable',
      trend: 'stable',
      icon: Activity,
      color: 'emerald'
    }
  ]

  const recentActivity = [
    {
      id: 1,
      user: 'John Doe',
      action: 'Added new user',
      target: 'jane.smith@company.com',
      time: '5 minutes ago',
      type: 'user'
    },
    {
      id: 2,
      user: 'System',
      action: 'Module activated',
      target: 'Advanced Analytics',
      time: '1 hour ago',
      type: 'module'
    },
    {
      id: 3,
      user: 'Sarah Johnson',
      action: 'Updated security settings',
      target: 'MFA enabled for all users',
      time: '3 hours ago',
      type: 'security'
    },
    {
      id: 4,
      user: 'AI System',
      action: 'Performance optimization',
      target: 'Database queries optimized',
      time: '5 hours ago',
      type: 'system'
    }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return Users
      case 'module': return Package
      case 'security': return Shield
      case 'system': return Activity
      default: return Activity
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user': return 'text-blue-600 bg-blue-50'
      case 'module': return 'text-purple-600 bg-purple-50'
      case 'security': return 'text-green-600 bg-green-50'
      case 'system': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-${stat.color}-50 dark:bg-${stat.color}-900/20`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
              <span className={`text-sm font-medium ${
                stat.trend === 'up' ? 'text-green-600' : 
                stat.trend === 'down' ? 'text-red-600' : 
                'text-gray-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => {
              const Icon = getActivityIcon(activity.type)
              const colorClass = getActivityColor(activity.type)
              
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className="font-medium">{activity.user}</span>
                      {' '}{activity.action}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {activity.target}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center space-x-3">
                <Plus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Add New User
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
            
            <button className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center space-x-3">
                <Package className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Activate Module
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
            
            <button className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Security Audit
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
            
            <button className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center space-x-3">
                <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Export Reports
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          System Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                All Systems Operational
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Last checked 1 minute ago
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                99.9% Uptime
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Last 30 days
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Activity className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                92ms Response Time
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Average API latency
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}