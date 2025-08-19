'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamic imports for performance
const ConsciousnessAwakening = dynamic(
  () => import('@/components/consciousness/awakening/ConsciousnessAwakeningSimple'),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-white">Loading consciousness experience...</div>
      </div>
    ),
  }
)

const QuantumEvolutionDashboard = dynamic(
  () => import('@/components/consciousness/dashboard/QuantumEvolutionDashboard'),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-white">Loading quantum dashboard...</div>
      </div>
    ),
  }
)

export default function ConsciousnessDemoPage() {
  const [activeDemo, setActiveDemo] = useState<'menu' | 'awakening' | 'dashboard'>('menu')

  if (activeDemo === 'awakening') {
    return (
      <div className="relative">
        <ConsciousnessAwakening />
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
        <QuantumEvolutionDashboard />
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
        <h1 className="from-consciousness-neural to-consciousness-synaptic mb-8 bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent">
          Consciousness Components Demo
        </h1>

        <div className="mx-auto max-w-2xl space-y-8 px-4 text-center">
          <div className="border-consciousness-synaptic/20 rounded-lg border bg-white/5 p-8 backdrop-blur-sm">
            <h2 className="text-consciousness-neural mb-4 text-2xl font-semibold">
              Components Ready!
            </h2>
            <p className="mb-4 text-gray-400">
              Click on any component below to experience the consciousness evolution.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <button
              onClick={() => setActiveDemo('awakening')}
              className="bg-consciousness-neural/10 border-consciousness-neural/30 animate-consciousness-pulse hover:bg-consciousness-neural/20 cursor-pointer rounded-lg border p-6 text-left transition-all"
            >
              <h3 className="mb-2 text-lg font-medium">Consciousness Awakening</h3>
              <p className="text-sm text-gray-400">
                Interactive 3D particle system - Move your mouse to awaken business consciousness
              </p>
            </button>

            <button
              onClick={() => setActiveDemo('dashboard')}
              className="bg-consciousness-synaptic/10 border-consciousness-synaptic/30 animate-consciousness-glow hover:bg-consciousness-synaptic/20 cursor-pointer rounded-lg border p-6 text-left transition-all"
            >
              <h3 className="mb-2 text-lg font-medium">Quantum Dashboard</h3>
              <p className="text-sm text-gray-400">
                Real-time business intelligence with AI evolution visualization
              </p>
            </button>

            <div className="bg-consciousness-autonomous/10 border-consciousness-autonomous/30 rounded-lg border p-6 opacity-50">
              <h3 className="mb-2 text-lg font-medium">Neural Command Center</h3>
              <p className="text-sm text-gray-400">Coming soon...</p>
            </div>

            <div className="from-consciousness-neural/10 to-consciousness-synaptic/10 rounded-lg border border-white/20 bg-gradient-to-br p-6 opacity-50">
              <h3 className="mb-2 text-lg font-medium">AI Genesis Tree</h3>
              <p className="text-sm text-gray-400">Coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
