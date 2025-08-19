/**
 * CoreFlow360 - Subscription Simulator Demo
 * Interactive demo showcasing module activation and AI capabilities
 */

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ModuleSelectionDashboard from '@/components/subscription/ModuleSelectionDashboard'
import DynamicModuleDashboard from '@/components/dashboard/DynamicModuleDashboard'
import DynamicNavigation from '@/components/navigation/DynamicNavigation'
import { updateActiveModules, useModuleAccess } from '@/hooks/useModuleAccess'

interface DemoStep {
  id: string
  title: string
  description: string
  action?: () => void
  highlight?: string[]
}

const SubscriptionSimulatorPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<'pricing' | 'dashboard' | 'ai-demo'>('pricing')
  const [demoMode, setDemoMode] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [showTour, setShowTour] = useState(true)
  const { activeModules, hasModule } = useModuleAccess()

  const demoSteps: DemoStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to CoreFlow360 Demo',
      description:
        'Experience our modular ERP system with AI-powered features. This demo simulates the subscription and module activation process.',
      action: () => setCurrentView('pricing'),
    },
    {
      id: 'select-modules',
      title: 'Choose Your Modules',
      description:
        'Select from individual modules or choose a bundle. Each module unlocks specific features and AI capabilities.',
      highlight: ['module-selection'],
    },
    {
      id: 'activate-crm',
      title: 'Activate CRM Module',
      description: 'Click on the CRM module to see how it transforms your dashboard.',
      action: () => updateActiveModules(['crm']),
    },
    {
      id: 'view-dashboard',
      title: 'Dynamic Dashboard',
      description: 'Notice how the dashboard adapts to show only CRM-related widgets and features.',
      action: () => setCurrentView('dashboard'),
      highlight: ['dashboard'],
    },
    {
      id: 'add-accounting',
      title: 'Add Accounting Module',
      description: 'Now add the Accounting module to unlock cross-module AI insights.',
      action: () => {
        updateActiveModules(['crm', 'accounting'])
        setCurrentView('pricing')
      },
    },
    {
      id: 'cross-module-ai',
      title: 'Cross-Module AI Features',
      description:
        'With multiple modules active, AI can provide insights across your business operations.',
      action: () => setCurrentView('ai-demo'),
      highlight: ['ai-insights'],
    },
    {
      id: 'try-bundle',
      title: 'Try a Bundle',
      description:
        'Select the "Professional Bundle" to see how bundles provide better value with pre-selected modules.',
      action: () => {
        updateActiveModules(['crm', 'accounting', 'hr', 'projects'])
        setCurrentView('pricing')
      },
    },
    {
      id: 'explore',
      title: 'Explore the Platform',
      description:
        'You can now freely explore the platform. Try different module combinations to see how the UI adapts!',
      action: () => setShowTour(false),
    },
  ]

  const handleModuleSelection = (selection: unknown) => {
    if (demoMode) {
      // Simulate module activation
      updateActiveModules(selection.modules)

      // Show success message
      setTimeout(() => {
        setCurrentView('dashboard')
      }, 1500)
    }
  }

  const handleNextStep = () => {
    if (currentStep < demoSteps.length - 1) {
      const nextStep = demoSteps[currentStep + 1]
      if (nextStep.action) {
        nextStep.action()
      }
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderAIDemo = () => (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold text-gray-900">AI-Powered Insights Demo</h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Single Module AI */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-white p-6 shadow-lg"
        >
          <h3 className="mb-4 text-lg font-bold text-gray-900">Single Module AI (CRM Only)</h3>
          <div className="space-y-3">
            <div className="rounded-lg bg-blue-50 p-3">
              <div className="mb-1 flex items-center space-x-2">
                <span className="text-blue-500">🎯</span>
                <span className="font-medium text-blue-900">Lead Scoring</span>
              </div>
              <p className="text-sm text-blue-700">
                AI analyzes lead behavior and assigns scores based on conversion probability
              </p>
            </div>
            <div className="rounded-lg bg-green-50 p-3">
              <div className="mb-1 flex items-center space-x-2">
                <span className="text-green-500">📈</span>
                <span className="font-medium text-green-900">Sales Forecasting</span>
              </div>
              <p className="text-sm text-green-700">
                Predicts monthly sales based on pipeline and historical data
              </p>
            </div>
          </div>
        </motion.div>

        {/* Cross-Module AI */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6 shadow-lg"
        >
          <h3 className="mb-4 text-lg font-bold text-gray-900">
            Cross-Module AI (CRM + Accounting)
          </h3>
          <div className="space-y-3">
            <div className="rounded-lg bg-white p-3">
              <div className="mb-1 flex items-center space-x-2">
                <span className="text-purple-500">💡</span>
                <span className="font-medium text-purple-900">Revenue Intelligence</span>
              </div>
              <p className="text-sm text-purple-700">
                Correlates sales pipeline with cash flow to predict revenue timing
              </p>
            </div>
            <div className="rounded-lg bg-white p-3">
              <div className="mb-1 flex items-center space-x-2">
                <span className="text-pink-500">🔄</span>
                <span className="font-medium text-pink-900">Customer Lifetime Value</span>
              </div>
              <p className="text-sm text-pink-700">
                Combines CRM interactions with payment history for accurate CLV
              </p>
            </div>
            <div className="rounded-lg bg-white p-3">
              <div className="mb-1 flex items-center space-x-2">
                <span className="text-indigo-500">⚡</span>
                <span className="font-medium text-indigo-900">Automated Workflows</span>
              </div>
              <p className="text-sm text-indigo-700">
                Triggers invoice creation when deals close, updates payment status
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* AI Capabilities Matrix */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="overflow-hidden rounded-xl bg-white shadow-lg"
      >
        <div className="p-6">
          <h3 className="mb-4 text-lg font-bold text-gray-900">
            AI Capabilities by Module Combination
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-y bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Module Combination
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  AI Features Unlocked
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Business Impact
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              <tr className={hasModule('crm') && !hasModule('accounting') ? 'bg-blue-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                    CRM Only
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  Lead scoring, sales forecasting, customer segmentation
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">+15% conversion rate</td>
              </tr>

              <tr className={hasModule('crm') && hasModule('accounting') ? 'bg-purple-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
                    CRM + Accounting
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  Revenue forecasting, CLV analysis, payment predictions
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">+25% cash flow accuracy</td>
              </tr>

              <tr
                className={
                  activeModules.length >= 4 ? 'bg-gradient-to-r from-blue-50 to-purple-50' : ''
                }
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
                    Professional Bundle
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  Full AI orchestration, predictive analytics, automated workflows
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">+40% operational efficiency</td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">CoreFlow360 Demo</h1>
            <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
              Simulation Mode
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Active Modules:{' '}
              <span className="font-medium">{activeModules.join(', ') || 'None'}</span>
            </div>
            <button
              onClick={() => updateActiveModules([])}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Reset Demo
            </button>
          </div>
        </div>
      </div>

      {/* Demo Tour */}
      <AnimatePresence>
        {showTour && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-blue-600 px-6 py-4 text-white"
          >
            <div className="mx-auto flex max-w-7xl items-center justify-between">
              <div className="flex-1">
                <h3 className="mb-1 font-medium">
                  Step {currentStep + 1} of {demoSteps.length}: {demoSteps[currentStep].title}
                </h3>
                <p className="text-sm text-blue-100">{demoSteps[currentStep].description}</p>
              </div>

              <div className="ml-6 flex items-center space-x-3">
                <button
                  onClick={handlePrevStep}
                  disabled={currentStep === 0}
                  className="rounded bg-blue-700 px-3 py-1 hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={currentStep === demoSteps.length - 1}
                  className="rounded bg-blue-700 px-3 py-1 hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
                <button
                  onClick={() => setShowTour(false)}
                  className="rounded bg-blue-700 px-3 py-1 hover:bg-blue-800"
                >
                  Skip Tour
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex h-[calc(100vh-8rem)]">
        {/* Navigation */}
        <DynamicNavigation variant="sidebar" />

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* View Tabs */}
          <div className="border-b border-gray-200 bg-white px-6 py-3">
            <div className="flex space-x-6">
              <button
                onClick={() => setCurrentView('pricing')}
                className={`border-b-2 px-1 pb-2 text-sm font-medium transition-colors ${
                  currentView === 'pricing'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Module Selection
              </button>
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`border-b-2 px-1 pb-2 text-sm font-medium transition-colors ${
                  currentView === 'dashboard'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Dynamic Dashboard
              </button>
              <button
                onClick={() => setCurrentView('ai-demo')}
                className={`border-b-2 px-1 pb-2 text-sm font-medium transition-colors ${
                  currentView === 'ai-demo'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                AI Capabilities
              </button>
            </div>
          </div>

          {/* View Content */}
          <AnimatePresence mode="wait">
            {currentView === 'pricing' && (
              <motion.div
                key="pricing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ModuleSelectionDashboard
                  tenantId="demo-tenant"
                  currentModules={activeModules}
                  userCount={10}
                  onCheckout={handleModuleSelection}
                />
              </motion.div>
            )}

            {currentView === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <DynamicModuleDashboard tenantId="demo-tenant" />
              </motion.div>
            )}

            {currentView === 'ai-demo' && (
              <motion.div
                key="ai-demo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {renderAIDemo()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Help Button */}
      <button
        onClick={() => setShowTour(true)}
        className="fixed right-6 bottom-6 rounded-full bg-blue-600 p-3 text-white shadow-lg transition-colors hover:bg-blue-700"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>
    </div>
  )
}

export default SubscriptionSimulatorPage
