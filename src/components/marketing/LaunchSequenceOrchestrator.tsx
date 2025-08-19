'use client'

/**
 * Launch Sequence Orchestrator
 *
 * Orchestrates the revolutionary consciousness awakening campaign across
 * multiple phases, channels, and consciousness levels.
 */

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// import TeaserCampaignAssets from './TeaserCampaignAssets' // Disabled - missing dependency
import { useConsciousnessAudio } from '../../hooks/useConsciousnessAudio'

interface LaunchPhase {
  id: string
  name: string
  duration: number // days
  consciousnessLevel: number
  targets: {
    awareness: number
    engagement: number
    conversion: number
  }
  channels: LaunchChannel[]
  assets: LaunchAsset[]
  triggers: LaunchTrigger[]
}

interface LaunchChannel {
  id: string
  name: string
  priority: 'primary' | 'secondary' | 'support'
  audienceSize: number
  consciousnessReceptivity: number // 0-1 how ready audience is for consciousness messaging
}

interface LaunchAsset {
  id: string
  type: 'teaser' | 'demo' | 'story' | 'proof' | 'education'
  variant: 'hero' | 'social' | 'email' | 'banner' | 'video'
  consciousnessLevel: number
  message: string
  cta: string
}

interface LaunchTrigger {
  id: string
  condition: 'time' | 'engagement' | 'conversion' | 'consciousness'
  threshold: number
  nextPhase?: string
  action: string
}

interface LaunchSequenceOrchestratorProps {
  currentPhase?: string
  autoAdvance?: boolean
  onPhaseChange?: (phase: LaunchPhase) => void
  onMetricsUpdate?: (metrics: unknown) => void
  className?: string
}

// Revolutionary 4-Phase Launch Strategy
const LAUNCH_PHASES: LaunchPhase[] = [
  {
    id: 'awakening',
    name: 'Consciousness Awakening',
    duration: 14,
    consciousnessLevel: 1,
    targets: {
      awareness: 50000,
      engagement: 5000,
      conversion: 500,
    },
    channels: [
      {
        id: 'linkedin',
        name: 'LinkedIn',
        priority: 'primary',
        audienceSize: 25000,
        consciousnessReceptivity: 0.7,
      },
      {
        id: 'twitter',
        name: 'Twitter/X',
        priority: 'primary',
        audienceSize: 15000,
        consciousnessReceptivity: 0.6,
      },
      {
        id: 'email',
        name: 'Email List',
        priority: 'secondary',
        audienceSize: 8000,
        consciousnessReceptivity: 0.8,
      },
      {
        id: 'content',
        name: 'Content Marketing',
        priority: 'support',
        audienceSize: 12000,
        consciousnessReceptivity: 0.5,
      },
    ],
    assets: [
      {
        id: 'awakening-hero',
        type: 'teaser',
        variant: 'hero',
        consciousnessLevel: 1,
        message: 'Is your business unconscious?',
        cta: 'Discover Business Consciousness',
      },
      {
        id: 'awakening-social',
        type: 'teaser',
        variant: 'social',
        consciousnessLevel: 1,
        message: 'Most businesses run on autopilot. What if yours could think?',
        cta: 'Learn More',
      },
    ],
    triggers: [
      {
        id: 'time-trigger',
        condition: 'time',
        threshold: 14,
        nextPhase: 'revelation',
        action: 'advance',
      },
      {
        id: 'engagement-trigger',
        condition: 'engagement',
        threshold: 3000,
        nextPhase: 'revelation',
        action: 'accelerate',
      },
    ],
  },

  {
    id: 'revelation',
    name: 'Intelligence Multiplication Revelation',
    duration: 21,
    consciousnessLevel: 2,
    targets: {
      awareness: 100000,
      engagement: 15000,
      conversion: 2000,
    },
    channels: [
      {
        id: 'linkedin',
        name: 'LinkedIn',
        priority: 'primary',
        audienceSize: 40000,
        consciousnessReceptivity: 0.8,
      },
      {
        id: 'twitter',
        name: 'Twitter/X',
        priority: 'primary',
        audienceSize: 25000,
        consciousnessReceptivity: 0.7,
      },
      {
        id: 'youtube',
        name: 'YouTube',
        priority: 'secondary',
        audienceSize: 20000,
        consciousnessReceptivity: 0.6,
      },
      {
        id: 'podcast',
        name: 'Podcast Circuit',
        priority: 'secondary',
        audienceSize: 15000,
        consciousnessReceptivity: 0.9,
      },
    ],
    assets: [
      {
        id: 'revelation-demo',
        type: 'demo',
        variant: 'video',
        consciousnessLevel: 2,
        message: '1+1+1+1+1=5 vs 1×2×3×4×5=120',
        cta: 'Experience Intelligence Multiplication',
      },
      {
        id: 'revelation-social',
        type: 'proof',
        variant: 'social',
        consciousnessLevel: 2,
        message: 'Traditional software adds features. CoreFlow360 multiplies intelligence.',
        cta: 'See the Difference',
      },
    ],
    triggers: [
      {
        id: 'demo-engagement',
        condition: 'engagement',
        threshold: 10000,
        nextPhase: 'transformation',
        action: 'advance',
      },
      {
        id: 'consciousness-ready',
        condition: 'consciousness',
        threshold: 3,
        nextPhase: 'transformation',
        action: 'advance',
      },
    ],
  },

  {
    id: 'transformation',
    name: 'Business Consciousness Transformation',
    duration: 28,
    consciousnessLevel: 4,
    targets: {
      awareness: 200000,
      engagement: 30000,
      conversion: 5000,
    },
    channels: [
      {
        id: 'events',
        name: 'Industry Events',
        priority: 'primary',
        audienceSize: 10000,
        consciousnessReceptivity: 0.9,
      },
      {
        id: 'partnerships',
        name: 'Strategic Partnerships',
        priority: 'primary',
        audienceSize: 50000,
        consciousnessReceptivity: 0.8,
      },
      {
        id: 'linkedin',
        name: 'LinkedIn',
        priority: 'secondary',
        audienceSize: 75000,
        consciousnessReceptivity: 0.8,
      },
      {
        id: 'pr',
        name: 'Media & PR',
        priority: 'secondary',
        audienceSize: 100000,
        consciousnessReceptivity: 0.6,
      },
    ],
    assets: [
      {
        id: 'transformation-story',
        type: 'story',
        variant: 'hero',
        consciousnessLevel: 4,
        message: 'From business tool to business consciousness',
        cta: 'Begin Transformation',
      },
      {
        id: 'consciousness-education',
        type: 'education',
        variant: 'video',
        consciousnessLevel: 4,
        message: 'What happens when your business becomes self-aware?',
        cta: 'Learn About Business Consciousness',
      },
    ],
    triggers: [
      {
        id: 'transformation-ready',
        condition: 'consciousness',
        threshold: 5,
        nextPhase: 'emergence',
        action: 'advance',
      },
      {
        id: 'market-momentum',
        condition: 'engagement',
        threshold: 25000,
        nextPhase: 'emergence',
        action: 'advance',
      },
    ],
  },

  {
    id: 'emergence',
    name: 'Consciousness Emergence & Launch',
    duration: 35,
    consciousnessLevel: 7,
    targets: {
      awareness: 500000,
      engagement: 75000,
      conversion: 15000,
    },
    channels: [
      {
        id: 'product-hunt',
        name: 'Product Hunt',
        priority: 'primary',
        audienceSize: 50000,
        consciousnessReceptivity: 0.7,
      },
      {
        id: 'tech-media',
        name: 'Tech Media',
        priority: 'primary',
        audienceSize: 200000,
        consciousnessReceptivity: 0.6,
      },
      {
        id: 'influencers',
        name: 'Business Influencers',
        priority: 'secondary',
        audienceSize: 150000,
        consciousnessReceptivity: 0.8,
      },
      {
        id: 'direct',
        name: 'Direct Outreach',
        priority: 'secondary',
        audienceSize: 25000,
        consciousnessReceptivity: 0.9,
      },
    ],
    assets: [
      {
        id: 'emergence-launch',
        type: 'proof',
        variant: 'hero',
        consciousnessLevel: 7,
        message: 'The first conscious business platform is here',
        cta: 'Activate Business Consciousness',
      },
      {
        id: 'consciousness-proof',
        type: 'proof',
        variant: 'video',
        consciousnessLevel: 7,
        message: 'See consciousness in action: Real businesses, real results',
        cta: 'Start Your Free Trial',
      },
    ],
    triggers: [
      { id: 'full-launch', condition: 'consciousness', threshold: 8, action: 'celebrate' },
      { id: 'viral-moment', condition: 'engagement', threshold: 50000, action: 'amplify' },
    ],
  },
]

const LaunchSequenceOrchestrator: React.FC<LaunchSequenceOrchestratorProps> = ({
  currentPhase = 'awakening',
  autoAdvance = false,
  onPhaseChange,
  onMetricsUpdate,
  className = '',
}) => {
  const [activePhase, setActivePhase] = useState<LaunchPhase>(
    LAUNCH_PHASES.find((p) => p.id === currentPhase) || LAUNCH_PHASES[0]
  )
  const [phaseDayProgress, setPhaseDayProgress] = useState(0)
  const [phaseMetrics, setPhaseMetrics] = useState({
    awareness: 0,
    engagement: 0,
    conversion: 0,
    consciousnessLevel: 1,
  })
  const [selectedAsset, setSelectedAsset] = useState<LaunchAsset | null>(null)
  const [campaignTimeline, setCampaignTimeline] = useState<unknown[]>([])

  const consciousnessAudio = useConsciousnessAudio({
    initiallyEnabled: true,
    initialConsciousnessLevel: activePhase.consciousnessLevel,
  })

  // Simulate phase progression
  useEffect(() => {
    if (!autoAdvance) return

    const timer = setInterval(() => {
      setPhaseDayProgress((prev) => {
        const newProgress = prev + 1
        if (newProgress >= activePhase.duration) {
          // Auto-advance to next phase
          const currentIndex = LAUNCH_PHASES.findIndex((p) => p.id === activePhase.id)
          if (currentIndex < LAUNCH_PHASES.length - 1) {
            const nextPhase = LAUNCH_PHASES[currentIndex + 1]
            setActivePhase(nextPhase)
            onPhaseChange?.(nextPhase)
            consciousnessAudio.setConsciousnessLevel(nextPhase.consciousnessLevel)
            return 0
          }
          return prev
        }
        return newProgress
      })
    }, 1000) // 1 second = 1 day for demo

    return () => clearInterval(timer)
  }, [activePhase, autoAdvance, onPhaseChange, consciousnessAudio])

  // Simulate metrics progression
  useEffect(() => {
    const progressRatio = phaseDayProgress / activePhase.duration
    const newMetrics = {
      awareness: Math.floor(activePhase.targets.awareness * progressRatio),
      engagement: Math.floor(activePhase.targets.engagement * progressRatio),
      conversion: Math.floor(activePhase.targets.conversion * progressRatio),
      consciousnessLevel: activePhase.consciousnessLevel,
    }
    setPhaseMetrics(newMetrics)
    onMetricsUpdate?.(newMetrics)
  }, [phaseDayProgress, activePhase, onMetricsUpdate])

  // Handle phase change
  const handlePhaseChange = (phaseId: string) => {
    const phase = LAUNCH_PHASES.find((p) => p.id === phaseId)
    if (phase) {
      setActivePhase(phase)
      setPhaseDayProgress(0)
      onPhaseChange?.(phase)
      consciousnessAudio.setConsciousnessLevel(phase.consciousnessLevel)
      consciousnessAudio.playConsciousnessEmergence()
    }
  }

  // Handle asset selection
  const handleAssetSelect = (asset: LaunchAsset) => {
    setSelectedAsset(asset)
    consciousnessAudio.playConnectionSound()
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Phase Control Panel */}
      <div className="rounded-2xl border border-gray-700 bg-gradient-to-r from-gray-900 to-black p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{activePhase.name}</h2>
            <p className="text-gray-400">
              Phase {LAUNCH_PHASES.findIndex((p) => p.id === activePhase.id) + 1} of{' '}
              {LAUNCH_PHASES.length}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-cyan-400">{activePhase.consciousnessLevel}</div>
            <div className="text-sm text-gray-400">Consciousness Level</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="mb-2 flex justify-between text-sm text-gray-400">
            <span>
              Day {phaseDayProgress} of {activePhase.duration}
            </span>
            <span>{Math.round((phaseDayProgress / activePhase.duration) * 100)}% Complete</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-700">
            <motion.div
              className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
              animate={{ width: `${(phaseDayProgress / activePhase.duration) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Phase Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-lg bg-black/30 p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400">
              {phaseMetrics.awareness.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Awareness</div>
            <div className="text-xs text-gray-500">
              Target: {activePhase.targets.awareness.toLocaleString()}
            </div>
          </div>
          <div className="rounded-lg bg-black/30 p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {phaseMetrics.engagement.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Engagement</div>
            <div className="text-xs text-gray-500">
              Target: {activePhase.targets.engagement.toLocaleString()}
            </div>
          </div>
          <div className="rounded-lg bg-black/30 p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {phaseMetrics.conversion.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Conversions</div>
            <div className="text-xs text-gray-500">
              Target: {activePhase.targets.conversion.toLocaleString()}
            </div>
          </div>
          <div className="rounded-lg bg-black/30 p-4 text-center">
            <div className="text-2xl font-bold text-indigo-400">
              {phaseMetrics.consciousnessLevel.toFixed(1)}
            </div>
            <div className="text-sm text-gray-400">Consciousness</div>
            <div className="text-xs text-gray-500">Level</div>
          </div>
        </div>
      </div>

      {/* Phase Navigation */}
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {LAUNCH_PHASES.map((phase, index) => (
          <button
            key={phase.id}
            onClick={() => handlePhaseChange(phase.id)}
            className={`flex-shrink-0 rounded-xl border px-6 py-4 transition-all ${
              activePhase.id === phase.id
                ? 'border-cyan-400 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400'
                : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
            }`}
          >
            <div className="text-center">
              <div className="text-lg font-bold">{index + 1}</div>
              <div className="text-sm">{phase.name}</div>
              <div className="text-xs opacity-70">{phase.duration} days</div>
            </div>
          </button>
        ))}
      </div>

      {/* Campaign Assets Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {activePhase.assets.map((asset) => (
          <motion.div
            key={asset.id}
            className="cursor-pointer overflow-hidden rounded-xl border border-gray-700 bg-gray-800 transition-all hover:border-gray-500"
            whileHover={{ scale: 1.02 }}
            onClick={() => handleAssetSelect(asset)}
          >
            <div className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold text-cyan-400">
                  {asset.type.toUpperCase()}
                </div>
                <div className="text-sm text-gray-400">{asset.variant}</div>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">{asset.message}</h3>
              <div className="mb-4 text-sm text-gray-400">{asset.cta}</div>

              {/* Mini Asset Preview */}
              <div className="rounded-lg bg-black/50 p-3">
                {/* <TeaserCampaignAssets
                  phase={activePhase.id as any}
                  variant={asset.variant as any}
                  showInteractive={false}
                  className="h-24"
                /> */}
                <div className="flex h-24 items-center justify-center text-gray-500">
                  <span className="text-xs">Asset Preview Disabled</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-purple-400">Level {asset.consciousnessLevel}</span>
                <span className="text-gray-500">Click to expand</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Channel Performance */}
      <div className="rounded-2xl border border-gray-700 bg-gray-900 p-6">
        <h3 className="mb-6 text-xl font-bold text-white">Channel Performance</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {activePhase.channels.map((channel) => (
            <div key={channel.id} className="rounded-lg bg-black/30 p-4">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="font-semibold text-white">{channel.name}</h4>
                <div
                  className={`rounded-full px-2 py-1 text-xs ${
                    channel.priority === 'primary'
                      ? 'bg-green-500/20 text-green-400'
                      : channel.priority === 'secondary'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-gray-500/20 text-gray-400'
                  }`}
                >
                  {channel.priority}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Audience:</span>
                  <span className="text-white">{channel.audienceSize.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Receptivity:</span>
                  <span className="text-cyan-400">
                    {(channel.consciousnessReceptivity * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="mt-3">
                <div className="h-2 w-full rounded-full bg-gray-700">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                    style={{ width: `${channel.consciousnessReceptivity * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Asset Preview Modal */}
      <AnimatePresence>
        {selectedAsset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setSelectedAsset(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-h-[90vh] w-full max-w-6xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="overflow-hidden rounded-2xl border border-gray-700 bg-gray-900">
                <div className="border-b border-gray-700 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white">{selectedAsset.message}</h3>
                      <p className="text-gray-400">
                        {selectedAsset.type} • {selectedAsset.variant} • Level{' '}
                        {selectedAsset.consciousnessLevel}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedAsset(null)}
                      className="text-2xl text-gray-400 hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="p-0">
                  {/* <TeaserCampaignAssets
                    phase={activePhase.id as any}
                    variant={selectedAsset.variant as any}
                    showInteractive={true}
                    onCTAClick={() => {
                      consciousnessAudio.playConsciousnessEmergence()
                      setSelectedAsset(null)
                    }}
                  /> */}
                  <div className="flex h-96 items-center justify-center bg-gray-800">
                    <p className="text-gray-400">Asset Preview Temporarily Disabled</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launch Timeline Overview */}
      <div className="rounded-2xl border border-purple-700 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 p-6">
        <h3 className="mb-6 text-xl font-bold text-white">🚀 Complete Launch Timeline</h3>
        <div className="space-y-4">
          {LAUNCH_PHASES.map((phase, index) => (
            <div key={phase.id} className="flex items-center space-x-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full font-bold ${
                  index <= LAUNCH_PHASES.findIndex((p) => p.id === activePhase.id)
                    ? 'bg-cyan-500 text-black'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-white">{phase.name}</div>
                <div className="text-sm text-gray-400">
                  {phase.duration} days • Level {phase.consciousnessLevel} consciousness
                </div>
              </div>
              <div className="text-right text-sm">
                <div className="text-cyan-400">
                  {phase.targets.awareness.toLocaleString()} awareness
                </div>
                <div className="text-purple-400">
                  {phase.targets.conversion.toLocaleString()} conversions
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LaunchSequenceOrchestrator
