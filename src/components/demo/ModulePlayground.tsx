/**
 * CoreFlow360 - Module Playground Component
 * Interactive sandbox for testing module combinations
 */

'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { updateActiveModules, useModuleAccess } from '@/hooks/useModuleAccess'

interface ModuleConfig {
  key: string
  name: string
  description: string
  icon: string
  color: string
  dependencies?: string[]
  features: string[]
}

interface ScenarioPreset {
  id: string
  name: string
  description: string
  modules: string[]
  icon: string
}

const ModulePlayground: React.FC = () => {
  const { activeModules, hasModule } = useModuleAccess()
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null)
  const [showFeatures, setShowFeatures] = useState(false)

  const moduleConfigs: ModuleConfig[] = [
    {
      key: 'crm',
      name: 'CRM',
      description: 'Customer Relationship Management',
      icon: '👥',
      color: 'blue',
      features: ['Lead Management', 'Deal Pipeline', 'Customer Analytics', 'AI Lead Scoring'],
    },
    {
      key: 'accounting',
      name: 'Accounting',
      description: 'Financial Management',
      icon: '💰',
      color: 'green',
      features: ['Invoicing', 'Expense Tracking', 'Financial Reports', 'AI Cash Flow Prediction'],
    },
    {
      key: 'hr',
      name: 'HR',
      description: 'Human Resources',
      icon: '👔',
      color: 'purple',
      features: [
        'Employee Records',
        'Leave Management',
        'Performance Reviews',
        'AI Talent Analytics',
      ],
    },
    {
      key: 'inventory',
      name: 'Inventory',
      description: 'Stock Management',
      icon: '📦',
      color: 'orange',
      features: [
        'Stock Tracking',
        'Warehouse Management',
        'Purchase Orders',
        'AI Demand Forecasting',
      ],
    },
    {
      key: 'projects',
      name: 'Projects',
      description: 'Project Management',
      icon: '📋',
      color: 'indigo',
      features: [
        'Task Management',
        'Gantt Charts',
        'Resource Planning',
        'AI Timeline Optimization',
      ],
    },
    {
      key: 'marketing',
      name: 'Marketing',
      description: 'Marketing Automation',
      icon: '📢',
      color: 'pink',
      features: [
        'Campaign Management',
        'Email Marketing',
        'Lead Nurturing',
        'AI Content Generation',
      ],
    },
  ]

  const scenarioPresets: ScenarioPreset[] = [
    {
      id: 'startup',
      name: 'Startup Essentials',
      description: 'Perfect for new businesses',
      modules: ['crm', 'accounting'],
      icon: '🚀',
    },
    {
      id: 'sales-team',
      name: 'Sales Powerhouse',
      description: 'Maximize sales efficiency',
      modules: ['crm', 'marketing'],
      icon: '💼',
    },
    {
      id: 'operations',
      name: 'Operations Hub',
      description: 'Streamline operations',
      modules: ['inventory', 'projects', 'hr'],
      icon: '⚙️',
    },
    {
      id: 'enterprise',
      name: 'Enterprise Suite',
      description: 'Full business management',
      modules: ['crm', 'accounting', 'hr', 'inventory', 'projects', 'marketing'],
      icon: '🏢',
    },
  ]

  const toggleModule = (moduleKey: string) => {
    const newModules = hasModule(moduleKey)
      ? activeModules.filter((m) => m !== moduleKey)
      : [...activeModules, moduleKey]

    updateActiveModules(newModules)
  }

  const applyScenario = (scenario: ScenarioPreset) => {
    setSelectedScenario(scenario.id)
    updateActiveModules(scenario.modules)
  }

  const getColorClasses = (color: string, active: boolean) => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      blue: {
        bg: active ? 'bg-blue-500' : 'bg-gray-100',
        border: active ? 'border-blue-500' : 'border-gray-300',
        text: active ? 'text-white' : 'text-gray-700',
      },
      green: {
        bg: active ? 'bg-green-500' : 'bg-gray-100',
        border: active ? 'border-green-500' : 'border-gray-300',
        text: active ? 'text-white' : 'text-gray-700',
      },
      purple: {
        bg: active ? 'bg-purple-500' : 'bg-gray-100',
        border: active ? 'border-purple-500' : 'border-gray-300',
        text: active ? 'text-white' : 'text-gray-700',
      },
      orange: {
        bg: active ? 'bg-orange-500' : 'bg-gray-100',
        border: active ? 'border-orange-500' : 'border-gray-300',
        text: active ? 'text-white' : 'text-gray-700',
      },
      indigo: {
        bg: active ? 'bg-indigo-500' : 'bg-gray-100',
        border: active ? 'border-indigo-500' : 'border-gray-300',
        text: active ? 'text-white' : 'text-gray-700',
      },
      pink: {
        bg: active ? 'bg-pink-500' : 'bg-gray-100',
        border: active ? 'border-pink-500' : 'border-gray-300',
        text: active ? 'text-white' : 'text-gray-700',
      },
    }

    return colors[color] || colors.blue
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Module Playground</h2>
        <p className="text-gray-600">
          Experiment with different module combinations to see how they work together
        </p>
      </div>

      {/* Scenario Presets */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Quick Scenarios</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {scenarioPresets.map((scenario) => (
            <motion.button
              key={scenario.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => applyScenario(scenario)}
              className={`rounded-xl border-2 p-4 transition-all ${
                selectedScenario === scenario.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="mb-2 text-2xl">{scenario.icon}</div>
              <h4 className="font-medium text-gray-900">{scenario.name}</h4>
              <p className="mt-1 text-sm text-gray-600">{scenario.description}</p>
              <div className="mt-2 text-xs text-gray-500">{scenario.modules.length} modules</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Module Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Available Modules</h3>
          <button
            onClick={() => setShowFeatures(!showFeatures)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {showFeatures ? 'Hide' : 'Show'} Features
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {moduleConfigs.map((module) => {
            const isActive = hasModule(module.key)
            const colors = getColorClasses(module.color, isActive)

            return (
              <motion.div
                key={module.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleModule(module.key)}
                className={`cursor-pointer rounded-xl border-2 transition-all ${colors.border}`}
              >
                <div className={`rounded-t-lg p-6 ${colors.bg}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{module.icon}</span>
                      <div>
                        <h4 className={`font-bold ${colors.text}`}>{module.name}</h4>
                        <p className={`text-sm opacity-90 ${colors.text}`}>{module.description}</p>
                      </div>
                    </div>
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                        isActive ? 'border-white bg-white' : 'border-gray-400'
                      }`}
                    >
                      {isActive && (
                        <svg
                          className={`h-4 w-4 ${module.color === 'green' ? 'text-green-500' : `text-${module.color}-500`}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {showFeatures && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2 bg-gray-50 p-4">
                        {module.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-600">
                            <span className="mr-2 h-2 w-2 rounded-full bg-gray-400"></span>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Active Modules Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 p-6"
      >
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Active Configuration</h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-3 text-sm font-medium text-gray-700">
              Active Modules ({activeModules.length})
            </h4>
            {activeModules.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {activeModules.map((moduleKey) => {
                  const module = moduleConfigs.find((m) => m.key === moduleKey)
                  return module ? (
                    <span
                      key={moduleKey}
                      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-${module.color}-100 text-${module.color}-800`}
                    >
                      {module.icon} {module.name}
                    </span>
                  ) : null
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No modules selected</p>
            )}
          </div>

          <div>
            <h4 className="mb-3 text-sm font-medium text-gray-700">Unlocked Capabilities</h4>
            <div className="space-y-2">
              {activeModules.length === 0 && (
                <p className="text-sm text-gray-500">Select modules to see capabilities</p>
              )}
              {activeModules.length === 1 && (
                <div className="text-sm text-gray-600">✓ Single-module AI features</div>
              )}
              {activeModules.length > 1 && (
                <>
                  <div className="text-sm text-green-600">✓ Cross-module AI insights</div>
                  <div className="text-sm text-green-600">✓ Automated workflows</div>
                </>
              )}
              {activeModules.length >= 4 && (
                <div className="text-sm font-medium text-purple-600">
                  ✓ Full AI orchestration unlocked!
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-blue-200 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly cost estimate for 10 users:</p>
              <p className="text-2xl font-bold text-gray-900">${activeModules.length * 70}</p>
            </div>
            <button
              onClick={() => updateActiveModules([])}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Clear All
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ModulePlayground
