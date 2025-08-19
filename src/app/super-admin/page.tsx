/**
 * CoreFlow360 - Super Admin Dashboard
 * Multi-tenant management and global system control
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'

// Build-time check to prevent prerendering issues
const isBuildTime = () => {
  return typeof window === 'undefined' && process.env.NODE_ENV === 'production'
}
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { UserRole } from '@/types/auth'
import {
  Globe,
  Shield,
  Server,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  Activity,
  Settings,
  Database,
  Zap,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Cloud,
  Key,
  Bell,
  Terminal,
  GitBranch,
  Cpu,
  HardDrive,
  Network,
  Clock,
} from 'lucide-react'

const tabs = [
  { id: 'overview', label: 'Global Overview', icon: Globe },
  { id: 'tenants', label: 'Tenant Management', icon: Users },
  { id: 'infrastructure', label: 'Infrastructure', icon: Server },
  { id: 'revenue', label: 'Revenue Analytics', icon: DollarSign },
  { id: 'features', label: 'Feature Flags', icon: GitBranch },
  { id: 'security', label: 'Security Center', icon: Shield },
  { id: 'settings', label: 'Global Settings', icon: Settings },
]

export default function SuperAdminPage() {
  // Return a simple loading state during build time
  if (isBuildTime()) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="h-8 animate-pulse rounded bg-gray-200"></div>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute requiredRole={UserRole.SUPER_ADMIN}>
      <SuperAdminDashboard />
    </ProtectedRoute>
  )
}

function SuperAdminDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="flex items-center space-x-3 text-3xl font-bold">
                <Globe className="h-8 w-8" />
                <span>Super Admin Dashboard</span>
              </h1>
              <p className="mt-2 text-purple-100">
                Global system control and multi-tenant management
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-purple-100">Logged in as</p>
                <p className="font-semibold">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white shadow-sm dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 border-b-2 px-1 py-4 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && <GlobalOverview />}
          {activeTab === 'tenants' && <TenantManagement />}
          {activeTab === 'infrastructure' && <Infrastructure />}
          {activeTab === 'revenue' && <RevenueAnalytics />}
          {activeTab === 'features' && <FeatureFlags />}
          {activeTab === 'security' && <SecurityCenter />}
          {activeTab === 'settings' && <GlobalSettings />}
        </motion.div>
      </div>
    </div>
  )
}

// Global Overview Component
function GlobalOverview() {
  const stats = [
    {
      label: 'Total Tenants',
      value: '127',
      change: '+8 this month',
      icon: Users,
      color: 'blue',
      trend: 'up',
    },
    {
      label: 'System Revenue',
      value: '$1.24M',
      change: '+23% MoM',
      icon: DollarSign,
      color: 'green',
      trend: 'up',
    },
    {
      label: 'Active Users',
      value: '4,832',
      change: '+342 this week',
      icon: Activity,
      color: 'purple',
      trend: 'up',
    },
    {
      label: 'System Uptime',
      value: '99.98%',
      change: 'Last 30 days',
      icon: Zap,
      color: 'emerald',
      trend: 'stable',
    },
  ]

  const topTenants = [
    { name: 'TechCorp Industries', users: 142, revenue: 8540, growth: 15 },
    { name: 'Global Solutions Ltd', users: 89, revenue: 5340, growth: 23 },
    { name: 'Innovation Hub', users: 76, revenue: 4560, growth: -5 },
    { name: 'Enterprise Systems', users: 64, revenue: 3840, growth: 12 },
    { name: 'Digital Dynamics', users: 52, revenue: 3120, growth: 8 },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.02 }}
            className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className={`rounded-lg p-3 bg-${stat.color}-50 dark:bg-${stat.color}-900/20`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
              <span
                className={`text-sm font-medium ${
                  stat.trend === 'up'
                    ? 'text-green-600'
                    : stat.trend === 'down'
                      ? 'text-red-600'
                      : 'text-gray-600'
                }`}
              >
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* System Health */}
      <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">System Health</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="text-center">
            <div className="relative inline-flex">
              <Cpu className="h-16 w-16 text-green-600" />
              <span className="absolute -top-1 -right-1 h-3 w-3 animate-pulse rounded-full bg-green-600"></span>
            </div>
            <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">CPU: 42%</p>
            <p className="text-xs text-gray-500">Healthy</p>
          </div>

          <div className="text-center">
            <div className="relative inline-flex">
              <HardDrive className="h-16 w-16 text-green-600" />
              <span className="absolute -top-1 -right-1 h-3 w-3 animate-pulse rounded-full bg-green-600"></span>
            </div>
            <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Memory: 68%</p>
            <p className="text-xs text-gray-500">Optimal</p>
          </div>

          <div className="text-center">
            <div className="relative inline-flex">
              <Database className="h-16 w-16 text-yellow-600" />
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-yellow-600"></span>
            </div>
            <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Storage: 82%</p>
            <p className="text-xs text-gray-500">Monitor</p>
          </div>

          <div className="text-center">
            <div className="relative inline-flex">
              <Network className="h-16 w-16 text-green-600" />
              <span className="absolute -top-1 -right-1 h-3 w-3 animate-pulse rounded-full bg-green-600"></span>
            </div>
            <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Network: 12ms</p>
            <p className="text-xs text-gray-500">Excellent</p>
          </div>
        </div>
      </div>

      {/* Top Tenants */}
      <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Top Tenants by Revenue
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                <th className="pb-3">Tenant</th>
                <th className="pb-3">Users</th>
                <th className="pb-3">Monthly Revenue</th>
                <th className="pb-3">Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {topTenants.map((tenant, idx) => (
                <tr key={idx}>
                  <td className="py-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {tenant.name}
                    </p>
                  </td>
                  <td className="py-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{tenant.users}</p>
                  </td>
                  <td className="py-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      ${tenant.revenue}
                    </p>
                  </td>
                  <td className="py-3">
                    <span
                      className={`text-sm font-medium ${
                        tenant.growth > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {tenant.growth > 0 ? '+' : ''}
                      {tenant.growth}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Tenant Management Component
function TenantManagement() {
  const tenants = [
    {
      id: '1',
      name: 'TechCorp Industries',
      domain: 'techcorp.coreflow360.com',
      status: 'active',
      plan: 'Enterprise',
      users: 142,
      modules: ['crm', 'accounting', 'hr', 'projects', 'ai_insights'],
      created: new Date('2023-01-15'),
      mrr: 8540,
    },
    {
      id: '2',
      name: 'Global Solutions Ltd',
      domain: 'globalsolutions.coreflow360.com',
      status: 'active',
      plan: 'Professional',
      users: 89,
      modules: ['crm', 'accounting', 'projects'],
      created: new Date('2023-03-22'),
      mrr: 5340,
    },
    {
      id: '3',
      name: 'Innovation Hub',
      domain: 'innovationhub.coreflow360.com',
      status: 'trial',
      plan: 'Trial',
      users: 76,
      modules: ['crm', 'projects'],
      created: new Date('2023-12-01'),
      mrr: 0,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tenant Management</h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage all organizations on the platform
          </p>
        </div>
        <button className="flex items-center space-x-2 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700">
          <Users className="h-4 w-4" />
          <span>Add Tenant</span>
        </button>
      </div>

      {/* Tenants List */}
      <div className="overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-800">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Organization
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Users
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                MRR
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {tenants.map((tenant) => (
              <tr key={tenant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {tenant.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{tenant.domain}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      tenant.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {tenant.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{tenant.plan}</td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{tenant.users}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                  ${tenant.mrr}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {tenant.created.toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-sm font-medium text-purple-600 hover:text-purple-900">
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Other component stubs
function Infrastructure() {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
      <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
        Infrastructure Management
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 p-4 text-center dark:border-gray-700">
          <Server className="mx-auto mb-2 h-12 w-12 text-blue-600" />
          <p className="font-medium">8 Servers</p>
          <p className="text-sm text-gray-500">All operational</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-4 text-center dark:border-gray-700">
          <Database className="mx-auto mb-2 h-12 w-12 text-purple-600" />
          <p className="font-medium">4 Databases</p>
          <p className="text-sm text-gray-500">82% capacity</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-4 text-center dark:border-gray-700">
          <Cloud className="mx-auto mb-2 h-12 w-12 text-green-600" />
          <p className="font-medium">CDN Active</p>
          <p className="text-sm text-gray-500">12ms latency</p>
        </div>
      </div>
    </div>
  )
}

function RevenueAnalytics() {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
      <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
        Platform Revenue Analytics
      </h2>
      <div className="py-8 text-center">
        <TrendingUp className="mx-auto mb-4 h-16 w-16 text-green-600" />
        <p className="text-3xl font-bold text-gray-900 dark:text-white">$1.24M MRR</p>
        <p className="text-gray-600 dark:text-gray-400">+23% growth month-over-month</p>
      </div>
    </div>
  )
}

function FeatureFlags() {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
      <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
        Feature Flag Management
      </h2>
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
          <div>
            <p className="font-medium">AI Autonomous Mode</p>
            <p className="text-sm text-gray-500">Enable full AI automation</p>
          </div>
          <input type="checkbox" className="toggle" />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
          <div>
            <p className="font-medium">IoT Integration</p>
            <p className="text-sm text-gray-500">Enable IoT device connections</p>
          </div>
          <input type="checkbox" defaultChecked className="toggle" />
        </div>
      </div>
    </div>
  )
}

function SecurityCenter() {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
      <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
        Global Security Center
      </h2>
      <div className="space-y-4">
        <div className="flex items-center space-x-3 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">All Systems Secure</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No threats detected in the last 24 hours
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function GlobalSettings() {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
      <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
        Global Platform Settings
      </h2>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Platform Name
          </label>
          <input
            type="text"
            defaultValue="CoreFlow360"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600"
          />
        </div>
        <button className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700">
          Save Global Settings
        </button>
      </div>
    </div>
  )
}
