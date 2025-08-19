'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import ModulePlayground from '@/components/demo/ModulePlayground'
import AIWorkflowVisualizer from '@/components/demo/AIWorkflowVisualizer'
import { updateActiveModules } from '@/hooks/useModuleAccess'

interface DemoSection {
  id: string
  title: string
  icon: string
  description: string
  component?: React.ReactNode
  link?: string
}

export default function DemoPage() {
  const router = useRouter()
  const [selectedSection, setSelectedSection] = useState<string>('subscription-simulator')

  const demoSections: DemoSection[] = [
    {
      id: 'subscription-simulator',
      title: 'Module Subscription',
      icon: '💎',
      description: 'Experience our modular pricing and dynamic module activation',
      component: <ModulePlayground />,
    },
    {
      id: 'ai-workflows',
      title: 'AI Workflows',
      icon: '⚡',
      description: 'Visualize how AI orchestrates cross-module workflows',
      component: <AIWorkflowVisualizer />,
    },
    {
      id: 'interactive-demo',
      title: 'Interactive Demo',
      icon: '🚀',
      description: 'Full platform walkthrough with guided tour',
      link: '/demo/subscription-simulator',
    },
    {
      id: 'industry-demos',
      title: 'Industry Demos',
      icon: '🏭',
      description: 'See CoreFlow360 tailored for your industry',
      link: '/industries',
    },
  ]

  const currentSection = demoSections.find((s) => s.id === selectedSection)

  const handleSectionClick = (section: DemoSection) => {
    if (section.link) {
      router.push(section.link)
    } else {
      setSelectedSection(section.id)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent">
              Experience CoreFlow360
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-gray-600">
              Explore our modular ERP platform with AI-powered features. See how different module
              combinations unlock powerful cross-department capabilities.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Demo Navigation */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto py-4">
            {demoSections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleSectionClick(section)}
                className={`flex items-center space-x-3 rounded-lg px-4 py-2 whitespace-nowrap transition-all ${
                  selectedSection === section.id && !section.link
                    ? 'bg-blue-50 font-medium text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-2xl">{section.icon}</span>
                <span>{section.title}</span>
                {section.link && (
                  <svg
                    className="h-4 w-4 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Section Description */}
        <motion.div
          key={selectedSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h2 className="mb-2 text-2xl font-bold text-gray-900">{currentSection?.title}</h2>
          <p className="text-gray-600">{currentSection?.description}</p>
        </motion.div>

        {/* Demo Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {currentSection?.component}
          </motion.div>
        </AnimatePresence>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 text-3xl text-blue-600">📊</div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">See Live Dashboard</h3>
            <p className="mb-4 text-sm text-gray-600">
              Experience how the dashboard adapts to your active modules
            </p>
            <button
              onClick={() => router.push('/demo/subscription-simulator')}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Launch Dashboard →
            </button>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 text-3xl text-purple-600">💬</div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Talk to Sales</h3>
            <p className="mb-4 text-sm text-gray-600">
              Get personalized recommendations for your business needs
            </p>
            <button
              onClick={() => router.push('/contact')}
              className="text-sm font-medium text-purple-600 hover:text-purple-700"
            >
              Schedule Call →
            </button>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 text-3xl text-green-600">🚀</div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Start Free Trial</h3>
            <p className="mb-4 text-sm text-gray-600">
              Try CoreFlow360 with your team for 14 days, no credit card required
            </p>
            <button
              onClick={() => router.push('/auth/signup')}
              className="text-sm font-medium text-green-600 hover:text-green-700"
            >
              Start Trial →
            </button>
          </div>
        </motion.div>

        {/* Demo Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-6"
        >
          <h3 className="mb-3 text-lg font-semibold text-blue-900">💡 Demo Tips</h3>
          <div className="grid grid-cols-1 gap-4 text-sm text-blue-700 md:grid-cols-2">
            <div className="flex items-start space-x-2">
              <span className="text-blue-500">•</span>
              <span>Try different module combinations to see AI capabilities change</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-500">•</span>
              <span>Activate 2+ modules to unlock cross-module workflows</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-500">•</span>
              <span>Use scenario presets for industry-specific configurations</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-500">•</span>
              <span>Watch the pricing update in real-time as you add modules</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Reset Demo Button */}
      <button
        onClick={() => {
          updateActiveModules([])
          window.location.reload()
        }}
        className="fixed right-6 bottom-6 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-colors hover:bg-red-700"
      >
        Reset Demo
      </button>
    </div>
  )
}
