'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamic imports for performance
const ConsciousnessAwakening = dynamic(
  () => import('@/components/consciousness/awakening/ConsciousnessAwakeningSimple'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading consciousness experience...</div>
      </div>
    )
  }
)

const QuantumEvolutionDashboard = dynamic(
  () => import('@/components/consciousness/dashboard/QuantumEvolutionDashboard'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading quantum dashboard...</div>
      </div>
    )
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
          className="absolute top-4 left-4 z-50 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-colors"
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
          className="absolute top-4 left-4 z-50 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-colors"
        >
          Back to Menu
        </button>
      </div>
    )
  }
  
  return (
    <main className="min-h-screen bg-black">
      <div className="flex flex-col items-center justify-center min-h-screen text-white">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-consciousness-neural to-consciousness-synaptic bg-clip-text text-transparent">
          Consciousness Components Demo
        </h1>
        
        <div className="space-y-8 text-center max-w-2xl mx-auto px-4">
          <div className="p-8 rounded-lg bg-white/5 backdrop-blur-sm border border-consciousness-synaptic/20">
            <h2 className="text-2xl font-semibold mb-4 text-consciousness-neural">
              Components Ready!
            </h2>
            <p className="text-gray-400 mb-4">
              Click on any component below to experience the consciousness evolution.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setActiveDemo('awakening')}
              className="p-6 rounded-lg bg-consciousness-neural/10 border border-consciousness-neural/30 animate-consciousness-pulse hover:bg-consciousness-neural/20 transition-all cursor-pointer text-left"
            >
              <h3 className="text-lg font-medium mb-2">Consciousness Awakening</h3>
              <p className="text-sm text-gray-400">Interactive 3D particle system - Move your mouse to awaken business consciousness</p>
            </button>
            
            <button
              onClick={() => setActiveDemo('dashboard')}
              className="p-6 rounded-lg bg-consciousness-synaptic/10 border border-consciousness-synaptic/30 animate-consciousness-glow hover:bg-consciousness-synaptic/20 transition-all cursor-pointer text-left"
            >
              <h3 className="text-lg font-medium mb-2">Quantum Dashboard</h3>
              <p className="text-sm text-gray-400">Real-time business intelligence with AI evolution visualization</p>
            </button>
            
            <div className="p-6 rounded-lg bg-consciousness-autonomous/10 border border-consciousness-autonomous/30 opacity-50">
              <h3 className="text-lg font-medium mb-2">Neural Command Center</h3>
              <p className="text-sm text-gray-400">Coming soon...</p>
            </div>
            
            <div className="p-6 rounded-lg bg-gradient-to-br from-consciousness-neural/10 to-consciousness-synaptic/10 border border-white/20 opacity-50">
              <h3 className="text-lg font-medium mb-2">AI Genesis Tree</h3>
              <p className="text-sm text-gray-400">Coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}