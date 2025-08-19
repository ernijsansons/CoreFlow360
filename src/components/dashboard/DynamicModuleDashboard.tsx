/**
 * CoreFlow360 - Dynamic Module Dashboard
 * Renders dashboard components based on active module subscriptions
 */

'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ModuleGatedFeature from '@/components/ui/ModuleGatedFeature'

interface ModuleWidget {
  id: string
  module: string
  title: string
  description: string
  component: React.ComponentType<unknown>
  size: 'small' | 'medium' | 'large'
  priority: number
}

interface DynamicModuleDashboardProps {
  tenantId?: string
  userRole?: string
}

// Mock widget components for demo
const CRMWidget: React.FC = () => (
  <div className="rounded-xl bg-white p-6 shadow-lg">
    <h3 className="mb-4 text-lg font-bold text-gray-900">CRM Overview</h3>
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center">
        <div className="text-3xl font-bold text-blue-600">152</div>
        <div className="text-sm text-gray-600">Active Leads</div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-green-600">$1.2M</div>
        <div className="text-sm text-gray-600">Pipeline Value</div>
      </div>
    </div>
  </div>
)

const AccountingWidget: React.FC = () => (
  <div className="rounded-xl bg-white p-6 shadow-lg">
    <h3 className="mb-4 text-lg font-bold text-gray-900">Financial Summary</h3>
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-gray-600">Revenue (MTD)</span>
        <span className="font-bold text-green-600">$85,420</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-600">Expenses</span>
        <span className="font-bold text-red-600">$32,150</span>
      </div>
      <div className="flex items-center justify-between border-t pt-2">
        <span className="text-gray-600">Net Profit</span>
        <span className="font-bold text-gray-900">$53,270</span>
      </div>
    </div>
  </div>
)

const HRWidget: React.FC = () => (
  <div className="rounded-xl bg-white p-6 shadow-lg">
    <h3 className="mb-4 text-lg font-bold text-gray-900">Team Overview</h3>
    <div className="grid grid-cols-3 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-purple-600">87</div>
        <div className="text-sm text-gray-600">Employees</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-yellow-600">12</div>
        <div className="text-sm text-gray-600">On Leave</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">95%</div>
        <div className="text-sm text-gray-600">Attendance</div>
      </div>
    </div>
  </div>
)

const InventoryWidget: React.FC = () => (
  <div className="rounded-xl bg-white p-6 shadow-lg">
    <h3 className="mb-4 text-lg font-bold text-gray-900">Inventory Status</h3>
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Low Stock Items</span>
        <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
          23
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Pending Orders</span>
        <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
          45
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Total SKUs</span>
        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
          1,342
        </span>
      </div>
    </div>
  </div>
)

const ProjectsWidget: React.FC = () => (
  <div className="rounded-xl bg-white p-6 shadow-lg">
    <h3 className="mb-4 text-lg font-bold text-gray-900">Active Projects</h3>
    <div className="space-y-3">
      {[
        { name: 'Website Redesign', progress: 75, status: 'on-track' },
        { name: 'Mobile App v2.0', progress: 45, status: 'at-risk' },
        { name: 'Data Migration', progress: 90, status: 'on-track' },
      ].map((project) => (
        <div key={project.name} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">{project.name}</span>
            <span
              className={`rounded-full px-2 py-1 text-xs ${
                project.status === 'on-track'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {project.progress}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className={`h-2 rounded-full ${
                project.status === 'on-track' ? 'bg-green-500' : 'bg-yellow-500'
              }`}
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
)

const MarketingWidget: React.FC = () => (
  <div className="rounded-xl bg-white p-6 shadow-lg">
    <h3 className="mb-4 text-lg font-bold text-gray-900">Campaign Performance</h3>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <div className="text-2xl font-bold text-indigo-600">3.2K</div>
        <div className="text-sm text-gray-600">Email Opens</div>
        <div className="mt-1 text-xs text-green-600">↑ 12% vs last week</div>
      </div>
      <div>
        <div className="text-2xl font-bold text-pink-600">18.5%</div>
        <div className="text-sm text-gray-600">Conversion Rate</div>
        <div className="mt-1 text-xs text-green-600">↑ 3.2% vs last week</div>
      </div>
    </div>
  </div>
)

const DynamicModuleDashboard: React.FC<DynamicModuleDashboardProps> = ({
  tenantId,
  userRole = 'admin',
}) => {
  const [activeModules, setActiveModules] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Define all available widgets
  const allWidgets: ModuleWidget[] = [
    {
      id: 'crm-overview',
      module: 'crm',
      title: 'CRM Overview',
      description: 'Sales pipeline and leads',
      component: CRMWidget,
      size: 'medium',
      priority: 1,
    },
    {
      id: 'accounting-summary',
      module: 'accounting',
      title: 'Financial Summary',
      description: 'Revenue and expenses',
      component: AccountingWidget,
      size: 'medium',
      priority: 2,
    },
    {
      id: 'hr-team',
      module: 'hr',
      title: 'Team Overview',
      description: 'Employee statistics',
      component: HRWidget,
      size: 'small',
      priority: 3,
    },
    {
      id: 'inventory-status',
      module: 'inventory',
      title: 'Inventory Status',
      description: 'Stock levels and orders',
      component: InventoryWidget,
      size: 'small',
      priority: 4,
    },
    {
      id: 'projects-active',
      module: 'projects',
      title: 'Active Projects',
      description: 'Project progress tracking',
      component: ProjectsWidget,
      size: 'large',
      priority: 5,
    },
    {
      id: 'marketing-campaigns',
      module: 'marketing',
      title: 'Campaign Performance',
      description: 'Marketing metrics',
      component: MarketingWidget,
      size: 'medium',
      priority: 6,
    },
  ]

  useEffect(() => {
    const loadActiveModules = async () => {
      try {
        // In production, fetch from API
        const mockModules = localStorage.getItem('activeModules')
        if (mockModules) {
          setActiveModules(JSON.parse(mockModules))
        } else {
          // Demo default
          setActiveModules(['crm', 'accounting'])
        }
      } catch (error) {
        setActiveModules(['crm'])
      } finally {
        setLoading(false)
      }
    }

    loadActiveModules()
  }, [tenantId])

  // Filter widgets based on active modules
  const activeWidgets = allWidgets
    .filter((widget) => activeModules.includes(widget.module))
    .sort((a, b) => a.priority - b.priority)

  const getGridCols = (size: string) => {
    switch (size) {
      case 'small':
        return 'col-span-1'
      case 'medium':
        return 'col-span-2'
      case 'large':
        return 'col-span-3'
      default:
        return 'col-span-1'
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/4 rounded bg-gray-200"></div>
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 rounded-xl bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            {activeModules.length} active module{activeModules.length !== 1 ? 's' : ''}
          </p>
        </div>

        <button
          onClick={() => (window.location.href = '/pricing')}
          className="flex items-center space-x-2 rounded-lg bg-gray-100 px-4 py-2 transition-colors hover:bg-gray-200"
        >
          <svg
            className="h-5 w-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <span className="font-medium text-gray-700">Add Modules</span>
        </button>
      </div>

      {/* Dynamic Widget Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {activeWidgets.map((widget, index) => {
            const WidgetComponent = widget.component

            return (
              <motion.div
                key={widget.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={getGridCols(widget.size)}
              >
                <WidgetComponent />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Cross-Module Insights (if multiple modules active) */}
      {activeModules.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 p-6"
        >
          <h2 className="mb-4 text-xl font-bold text-gray-900">🤖 AI Cross-Module Insights</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeModules.includes('crm') && activeModules.includes('accounting') && (
              <div className="rounded-lg bg-white p-4">
                <div className="mb-2 flex items-center space-x-2">
                  <span className="text-green-500">💰</span>
                  <span className="font-medium text-gray-900">Revenue Forecast</span>
                </div>
                <p className="text-sm text-gray-600">
                  Based on pipeline:{' '}
                  <span className="font-bold text-green-600">+23% next quarter</span>
                </p>
              </div>
            )}

            {activeModules.includes('hr') && activeModules.includes('projects') && (
              <div className="rounded-lg bg-white p-4">
                <div className="mb-2 flex items-center space-x-2">
                  <span className="text-yellow-500">⚡</span>
                  <span className="font-medium text-gray-900">Resource Alert</span>
                </div>
                <p className="text-sm text-gray-600">
                  3 projects need{' '}
                  <span className="font-bold text-yellow-600">additional developers</span>
                </p>
              </div>
            )}

            {activeModules.includes('inventory') && activeModules.includes('crm') && (
              <div className="rounded-lg bg-white p-4">
                <div className="mb-2 flex items-center space-x-2">
                  <span className="text-red-500">📦</span>
                  <span className="font-medium text-gray-900">Stock Prediction</span>
                </div>
                <p className="text-sm text-gray-600">
                  Order more SKU-1234:{' '}
                  <span className="font-bold text-red-600">high demand detected</span>
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {activeWidgets.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 text-center">
          <div className="mb-4 text-6xl">📊</div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">No Active Modules</h2>
          <p className="mb-6 text-gray-600">
            Subscribe to modules to see your personalized dashboard
          </p>
          <button
            onClick={() => (window.location.href = '/pricing')}
            className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-medium text-white transition-all hover:from-blue-700 hover:to-purple-700"
          >
            Explore Modules
          </button>
        </motion.div>
      )}
    </div>
  )
}

export default DynamicModuleDashboard
