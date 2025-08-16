/**
 * CoreFlow360 - Module Control Component
 * Manage and configure ERP modules
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Package,
  Power,
  PowerOff,
  Settings,
  DollarSign,
  Users,
  BarChart3,
  Brain,
  ShoppingCart,
  Factory,
  Shield,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  TrendingUp,
  ArrowUpRight,
  Database,
  Globe
} from 'lucide-react'

interface Module {
  id: string
  name: string
  description: string
  icon: any
  status: 'active' | 'inactive' | 'trial' | 'expired'
  price: number
  users: number
  maxUsers?: number
  dataUsage: number // GB
  lastActivated?: Date
  dependencies: string[]
  features: string[]
  aiCapabilities: string[]
}

export function ModuleControl() {
  const [modules, setModules] = useState<Module[]>([
    {
      id: 'crm',
      name: 'CRM',
      description: 'Customer relationship management with AI-powered insights',
      icon: Users,
      status: 'active',
      price: 7,
      users: 45,
      dataUsage: 12.5,
      lastActivated: new Date('2023-06-15'),
      dependencies: [],
      features: ['Lead Management', 'Deal Pipeline', 'Customer Analytics', 'Email Integration'],
      aiCapabilities: ['Lead Scoring', 'Churn Prediction', 'Next Best Action']
    },
    {
      id: 'accounting',
      name: 'Accounting',
      description: 'Financial management with automated reconciliation',
      icon: DollarSign,
      status: 'active',
      price: 12,
      users: 12,
      dataUsage: 8.3,
      lastActivated: new Date('2023-06-15'),
      dependencies: [],
      features: ['Invoicing', 'Expense Tracking', 'Financial Reports', 'Tax Compliance'],
      aiCapabilities: ['Anomaly Detection', 'Cash Flow Prediction', 'Expense Categorization']
    },
    {
      id: 'hr',
      name: 'Human Resources',
      description: 'Employee management and performance tracking',
      icon: Users,
      status: 'active',
      price: 10,
      users: 8,
      dataUsage: 4.2,
      lastActivated: new Date('2023-08-20'),
      dependencies: [],
      features: ['Employee Records', 'Leave Management', 'Performance Reviews', 'Recruiting'],
      aiCapabilities: ['Resume Screening', 'Performance Prediction', 'Attrition Risk']
    },
    {
      id: 'projects',
      name: 'Project Management',
      description: 'Task management and resource allocation',
      icon: BarChart3,
      status: 'trial',
      price: 9,
      users: 22,
      dataUsage: 6.7,
      dependencies: ['crm'],
      features: ['Task Management', 'Gantt Charts', 'Resource Planning', 'Time Tracking'],
      aiCapabilities: ['Project Risk Analysis', 'Resource Optimization', 'Timeline Prediction']
    },
    {
      id: 'inventory',
      name: 'Inventory',
      description: 'Stock management and supply chain optimization',
      icon: Package,
      status: 'inactive',
      price: 8,
      users: 0,
      dataUsage: 0,
      dependencies: ['accounting'],
      features: ['Stock Tracking', 'Warehouse Management', 'Purchase Orders', 'Barcode Scanning'],
      aiCapabilities: ['Demand Forecasting', 'Reorder Optimization', 'Supply Chain Analytics']
    },
    {
      id: 'ai_insights',
      name: 'AI Insights',
      description: 'Advanced analytics and predictive intelligence',
      icon: Brain,
      status: 'active',
      price: 20,
      users: 45,
      dataUsage: 15.8,
      lastActivated: new Date('2023-09-01'),
      dependencies: ['crm', 'accounting'],
      features: ['Predictive Analytics', 'Custom Reports', 'AI Dashboards', 'Data Mining'],
      aiCapabilities: ['Cross-Module Intelligence', 'Autonomous Recommendations', 'Pattern Recognition']
    },
    {
      id: 'ecommerce',
      name: 'E-commerce',
      description: 'Online store and order management',
      icon: ShoppingCart,
      status: 'inactive',
      price: 15,
      users: 0,
      dataUsage: 0,
      dependencies: ['inventory', 'accounting'],
      features: ['Online Store', 'Order Processing', 'Payment Gateway', 'Shipping Integration'],
      aiCapabilities: ['Product Recommendations', 'Price Optimization', 'Customer Segmentation']
    },
    {
      id: 'manufacturing',
      name: 'Manufacturing',
      description: 'Production planning and quality control',
      icon: Factory,
      status: 'expired',
      price: 25,
      users: 0,
      dataUsage: 0,
      dependencies: ['inventory', 'projects'],
      features: ['Production Planning', 'Quality Control', 'BOM Management', 'Equipment Tracking'],
      aiCapabilities: ['Predictive Maintenance', 'Quality Prediction', 'Production Optimization']
    }
  ])

  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [showDependencyWarning, setShowDependencyWarning] = useState(false)

  const getStatusBadge = (status: Module['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </span>
        )
      case 'inactive':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <PowerOff className="w-3 h-3 mr-1" />
            Inactive
          </span>
        )
      case 'trial':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 mr-1" />
            Trial (14 days left)
          </span>
        )
      case 'expired':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Expired
          </span>
        )
    }
  }

  const toggleModule = (module: Module) => {
    // Check dependencies
    if (module.status === 'inactive' && module.dependencies.length > 0) {
      const inactiveDeps = module.dependencies.filter(dep => 
        modules.find(m => m.id === dep)?.status !== 'active'
      )
      if (inactiveDeps.length > 0) {
        setShowDependencyWarning(true)
        return
      }
    }

    setModules(modules.map(m => 
      m.id === module.id 
        ? { ...m, status: m.status === 'active' ? 'inactive' : 'active' }
        : m
    ))
  }

  const totalCost = modules
    .filter(m => m.status === 'active' || m.status === 'trial')
    .reduce((sum, m) => sum + (m.price * m.users), 0)

  const activeModules = modules.filter(m => m.status === 'active' || m.status === 'trial').length
  const totalUsers = modules.reduce((sum, m) => sum + m.users, 0)
  const totalDataUsage = modules.reduce((sum, m) => sum + m.dataUsage, 0)

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 text-purple-600" />
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {activeModules} / {modules.length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Active Modules</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-600" />
            <span className="text-xs text-green-600">+12%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {totalUsers}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Module Users</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <Database className="w-8 h-8 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {totalDataUsage.toFixed(1)} GB
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Data Usage</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${totalCost}/mo
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Cost</p>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <motion.div
            key={module.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-2 ${
              module.status === 'active' ? 'border-green-200 dark:border-green-800' :
              module.status === 'trial' ? 'border-blue-200 dark:border-blue-800' :
              'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg ${
                  module.status === 'active' ? 'bg-green-50 dark:bg-green-900/20' :
                  module.status === 'trial' ? 'bg-blue-50 dark:bg-blue-900/20' :
                  'bg-gray-50 dark:bg-gray-700'
                }`}>
                  <module.icon className={`w-6 h-6 ${
                    module.status === 'active' ? 'text-green-600' :
                    module.status === 'trial' ? 'text-blue-600' :
                    'text-gray-400'
                  }`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {module.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ${module.price}/user/month
                  </p>
                </div>
              </div>
              {getStatusBadge(module.status)}
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {module.description}
            </p>

            {(module.status === 'active' || module.status === 'trial') && (
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Users</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {module.users}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Data Usage</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {module.dataUsage} GB
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Monthly Cost</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${module.price * module.users}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <button
                onClick={() => toggleModule(module)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                  module.status === 'active' 
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {module.status === 'active' ? (
                  <>
                    <PowerOff className="w-4 h-4" />
                    <span>Deactivate</span>
                  </>
                ) : (
                  <>
                    <Power className="w-4 h-4" />
                    <span>Activate</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setSelectedModule(module)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {module.dependencies.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Requires: {module.dependencies.join(', ')}
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Module Details Modal */}
      {selectedModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <selectedModule.icon className="w-8 h-8 text-purple-600" />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedModule.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Module Configuration
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedModule(null)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Features */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Features
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {selectedModule.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Capabilities */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  AI Capabilities
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {selectedModule.aiCapabilities.map((capability, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <Brain className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {capability}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Usage Limits */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Usage & Limits
                </h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Maximum Users
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedModule.maxUsers || 'Unlimited'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Data Storage
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      100 GB included
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      API Calls
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      1M/month
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  View Documentation
                </button>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2">
                  <span>Configure Settings</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Dependency Warning Modal */}
      {showDependencyWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full m-4"
          >
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Dependency Required
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This module requires other modules to be active first. Please activate the required dependencies before enabling this module.
            </p>
            <button
              onClick={() => setShowDependencyWarning(false)}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Understood
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}