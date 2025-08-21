'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamic imports for performance
const BusinessIntelligenceAwakening = dynamic(
  () => import('@/components/business-intelligence/awakening/BusinessIntelligenceAwakening'),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-white">Loading business intelligence experience...</div>
      </div>
    ),
  }
)

const BusinessEvolutionDashboard = dynamic(
  () => import('@/components/business-intelligence/dashboard/BusinessEvolutionDashboard'),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-white">Loading quantum dashboard...</div>
      </div>
    ),
  }
)

export default function BusinessIntelligenceDemoPage() {
  const [activeDemo, setActiveDemo] = useState<'menu' | 'awakening' | 'dashboard'>('menu')

  if (activeDemo === 'awakening') {
    return (
      <div className="relative">
        <BusinessIntelligenceAwakening />
        <button
          onClick={() => setActiveDemo('menu')}
          className="absolute top-4 left-4 z-50 rounded-lg bg-white/10 px-4 py-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
        >
          Back to Menu
        </button>
      </div>
    )
  }

  if (activeDemo === 'dashboard') {
    return (
      <div className="relative">
        <BusinessEvolutionDashboard />
        <button
          onClick={() => setActiveDemo('menu')}
          className="absolute top-4 left-4 z-50 rounded-lg bg-white/10 px-4 py-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
        >
          Back to Menu
        </button>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-black">
      <div className="flex min-h-screen flex-col items-center justify-center text-white">
        <h1 className="from-cyan-400 to-purple-400 mb-8 bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent">
          Business Intelligence Components Demo
        </h1>

        <div className="mx-auto max-w-2xl space-y-8 px-4 text-center">
          <div className="border-cyan-400/20 rounded-lg border bg-white/5 p-8 backdrop-blur-sm">
            <h2 className="text-cyan-400 mb-4 text-2xl font-semibold">
              Components Ready!
            </h2>
            <p className="mb-4 text-gray-400">
              Click on any component below to experience the business intelligence evolution.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <button
              onClick={() => setActiveDemo('awakening')}
              className="bg-cyan-400/10 border-cyan-400/30 animate-pulse hover:bg-cyan-400/20 cursor-pointer rounded-lg border p-6 text-left transition-all"
            >
              <h3 className="mb-2 text-lg font-medium">Business Intelligence Awakening</h3>
              <p className="text-sm text-gray-400">
                Interactive 3D particle system - Move your mouse to awaken business intelligence
              </p>
            </button>

            <button
              onClick={() => setActiveDemo('dashboard')}
              className="bg-purple-400/10 border-purple-400/30 animate-bounce hover:bg-purple-400/20 cursor-pointer rounded-lg border p-6 text-left transition-all"
            >
              <h3 className="mb-2 text-lg font-medium">Business Evolution Dashboard</h3>
              <p className="text-sm text-gray-400">
                Real-time business intelligence with AI evolution visualization
              </p>
            </button>

            <div className="bg-green-400/10 border-green-400/30 rounded-lg border p-6 opacity-50">
              <h3 className="mb-2 text-lg font-medium">Intelligent Command Center</h3>
              <p className="text-sm text-gray-400">Coming soon...</p>
            </div>

            <div className="from-cyan-400/10 to-purple-400/10 rounded-lg border border-white/20 bg-gradient-to-br p-6 opacity-50">
              <h3 className="mb-2 text-lg font-medium">AI Genesis Tree</h3>
              <p className="text-sm text-gray-400">Coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
