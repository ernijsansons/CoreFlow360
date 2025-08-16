'use client'

/**
 * Marketing Campaign Dashboard
 * 
 * Central hub for managing consciousness-based marketing campaigns,
 * launch sequences, and teaser assets.
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  // TeaserCampaignAssets, // Disabled - missing dependency
  LaunchSequenceOrchestrator,
  ConsciousnessMarketingFramework,
  type CampaignPhase
} from '../../components/marketing'

const MarketingPage: React.FC = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'teaser' | 'launch' | 'framework'>('dashboard')
  const [selectedPhase, setSelectedPhase] = useState<'awakening' | 'revelation' | 'transformation' | 'emergence'>('awakening')
  const [campaignMetrics, setCampaignMetrics] = useState({
    totalAwareness: 0,
    totalEngagement: 0,
    totalConversions: 0,
    consciousnessLevel: 1
  })

  const handlePhaseChange = (phase: CampaignPhase) => {
    console.log('Phase changed to:', phase)
  }

  const handleMetricsUpdate = (metrics: any) => {
    setCampaignMetrics(prev => ({
      ...prev,
      ...metrics
    }))
  }

  const menuItems = [
    { id: 'dashboard', name: 'Campaign Dashboard', icon: '📊', description: 'Overview and metrics' },
    { id: 'teaser', name: 'Teaser Assets', icon: '🎬', description: 'Campaign creative assets' },
    { id: 'launch', name: 'Launch Sequence', icon: '🚀', description: '4-phase launch orchestration' },
    { id: 'framework', name: 'Consciousness Framework', icon: '🧠', description: 'Marketing methodology' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black">
      {/* Header */}
      <div className="border-b border-gray-700 bg-black/30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-thin text-white">Marketing Command Center</h1>
              <p className="text-gray-400">Consciousness-awakening campaign orchestration</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">
                  {campaignMetrics.totalAwareness.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">Total Awareness</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {campaignMetrics.totalEngagement.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">Engagement</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {campaignMetrics.totalConversions.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">Conversions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-400">
                  {campaignMetrics.consciousnessLevel.toFixed(1)}
                </div>
                <div className="text-xs text-gray-400">Consciousness Level</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-700 bg-black/20">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex space-x-2 overflow-x-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as any)}
                className={`flex items-center space-x-3 px-6 py-3 rounded-lg transition-all ${
                  activeView === item.id
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/50 text-cyan-400'
                    : 'bg-gray-800/50 border border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <div className="text-left">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs opacity-70">{item.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <AnimatePresence mode="wait">
          {activeView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CampaignDashboard 
                metrics={campaignMetrics}
                onViewChange={setActiveView}
                onPhaseSelect={setSelectedPhase}
              />
            </motion.div>
          )}

          {activeView === 'teaser' && (
            <motion.div
              key="teaser"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Campaign Asset Library</h2>
                    <p className="text-gray-400">Revolutionary teaser assets for consciousness awakening</p>
                  </div>
                  <div className="flex space-x-2">
                    {(['awakening', 'revelation', 'transformation', 'emergence'] as const).map((phase) => (
                      <button
                        key={phase}
                        onClick={() => setSelectedPhase(phase)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedPhase === phase
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {phase.charAt(0).toUpperCase() + phase.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Asset Variants Grid */}
                <div className="grid lg:grid-cols-2 gap-8">
                  {(['hero', 'social', 'email', 'banner'] as const).map((variant) => (
                    <div key={variant} className="space-y-4">
                      <h3 className="text-lg font-semibold text-cyan-400">
                        {variant.charAt(0).toUpperCase() + variant.slice(1)} Variant
                      </h3>
                      {/* <TeaserCampaignAssets
                        phase={selectedPhase}
                        variant={variant}
                        showInteractive={true}
                        onCTAClick={() => console.log(`CTA clicked for ${variant} ${selectedPhase}`)}
                        className="border border-gray-700 rounded-xl overflow-hidden"
                      /> */}
                      <div className="border border-gray-700 rounded-xl overflow-hidden p-8 bg-gray-800">
                        <p className="text-gray-400 text-center">Teaser Campaign Assets temporarily disabled</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeView === 'launch' && (
            <motion.div
              key="launch"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <LaunchSequenceOrchestrator
                autoAdvance={true}
                onPhaseChange={handlePhaseChange}
                onMetricsUpdate={handleMetricsUpdate}
              />
            </motion.div>
          )}

          {activeView === 'framework' && (
            <motion.div
              key="framework"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ConsciousnessMarketingFramework
                showAnalytics={true}
                interactiveDemo={true}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Campaign Dashboard Component
const CampaignDashboard: React.FC<{
  metrics: any
  onViewChange: (view: string) => void
  onPhaseSelect: (phase: any) => void
}> = ({ metrics, onViewChange, onPhaseSelect }) => {
  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        {[
          { title: 'Campaign Status', value: 'Phase 2: Revelation', color: 'text-cyan-400', icon: '🚀' },
          { title: 'Consciousness Level', value: '2.4', color: 'text-purple-400', icon: '🧠' },
          { title: 'Market Readiness', value: '73%', color: 'text-green-400', icon: '📈' },
          { title: 'Launch Timeline', value: '42 days', color: 'text-indigo-400', icon: '📅' }
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">{stat.icon}</div>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
            </div>
            <div className="text-white font-medium">{stat.title}</div>
          </motion.div>
        ))}
      </div>

      {/* Campaign Phase Overview */}
      <div className="bg-gradient-to-r from-gray-900 to-black border border-gray-700 rounded-2xl p-6">
        <h3 className="text-2xl font-bold text-white mb-6">Campaign Phase Timeline</h3>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { phase: 'awakening', name: 'Consciousness Awakening', status: 'completed', icon: '😴', color: 'text-green-400' },
            { phase: 'revelation', name: 'Intelligence Multiplication', status: 'active', icon: '💡', color: 'text-cyan-400' },
            { phase: 'transformation', name: 'Business Consciousness', status: 'upcoming', icon: '🚀', color: 'text-purple-400' },
            { phase: 'emergence', name: 'Consciousness Emergence', status: 'planned', icon: '✨', color: 'text-indigo-400' }
          ].map((phase, index) => (
            <div
              key={phase.phase}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                phase.status === 'active' ? 'border-cyan-400 bg-cyan-400/10' :
                phase.status === 'completed' ? 'border-green-400 bg-green-400/10' :
                'border-gray-600 bg-gray-800/50 hover:border-gray-500'
              }`}
              onClick={() => onPhaseSelect(phase.phase)}
            >
              <div className="text-center space-y-2">
                <div className="text-3xl">{phase.icon}</div>
                <div className="text-sm font-semibold text-white">{phase.name}</div>
                <div className={`text-xs font-medium ${phase.color}`}>
                  {phase.status.toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { 
            title: 'Launch Asset Generator', 
            description: 'Create consciousness-awakening campaign assets',
            action: () => onViewChange('teaser'),
            icon: '🎬',
            color: 'from-cyan-600 to-blue-600'
          },
          { 
            title: 'Sequence Orchestrator', 
            description: 'Manage 4-phase launch progression',
            action: () => onViewChange('launch'),
            icon: '🚀',
            color: 'from-purple-600 to-indigo-600'
          },
          { 
            title: 'Consciousness Framework', 
            description: 'Apply revolutionary marketing methodology',
            action: () => onViewChange('framework'),
            icon: '🧠',
            color: 'from-indigo-600 to-purple-600'
          }
        ].map((action, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + index * 0.1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 cursor-pointer hover:bg-white/10 transition-all"
            onClick={action.action}
          >
            <div className="text-3xl mb-4">{action.icon}</div>
            <h4 className="text-lg font-semibold text-white mb-2">{action.title}</h4>
            <p className="text-gray-400 text-sm mb-4">{action.description}</p>
            <div className={`inline-flex px-4 py-2 rounded-lg bg-gradient-to-r ${action.color} text-white font-medium text-sm`}>
              Launch Tool →
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default MarketingPage