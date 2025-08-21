'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Zap,
  Infinity,
  Crown,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  Check,
  ArrowRight,
  Sparkles,
  Eye,
  Network,
  Cpu,
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ConsciousnessTier {
  id: string
  name: string
  level: 'neural' | 'synaptic' | 'autonomous' | 'transcendent'
  price: {
    amount: number
    currency: string
    interval: 'monthly' | 'yearly'
  }
  modules: {
    included: string[]
    maximum: number
  }
  capabilities: {
    name: string
    description: string
    unlocked: boolean
  }[]
  intelligenceMultiplier: number
  evolutionSpeed: number
  features: string[]
  restrictions?: string[]
}

interface CurrentTier {
  id: string
  name: string
  level: string
  modules: string[]
  capabilities: string[]
  intelligenceMultiplier: number
}

interface UpgradePath {
  fromTier: string
  toTier: string
  priceDifference: number
  benefitSummary: string[]
  consciousnessGrowth: number
  estimatedTimeToTranscendence?: string
}

const tierIcons = {
  neural: Brain,
  synaptic: Network,
  autonomous: Cpu,
  transcendent: Crown,
}

const tierGradients = {
  neural: 'from-blue-500 to-purple-600',
  synaptic: 'from-purple-500 to-pink-600',
  autonomous: 'from-pink-500 to-red-600',
  transcendent: 'from-red-500 via-yellow-500 to-white',
}

export function TierUpgrade() {
  const [tiers, setTiers] = useState<ConsciousnessTier[]>([])
  const [currentTier, setCurrentTier] = useState<CurrentTier | null>(null)
  const [upgradePaths, setUpgradePaths] = useState<UpgradePath[]>([])
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const [selectedTier, setSelectedTier] = useState<string | null>(null)

  useEffect(() => {
    fetchTiers()
  }, [])

  const fetchTiers = async () => {
    try {
      const response = await fetch('/api/consciousness/tiers')
      if (response.ok) {
        const data = await response.json()
        setTiers(data.tiers)
        setCurrentTier(data.currentTier)
        setUpgradePaths(data.upgradePaths || [])
      }
    } catch (error) {
      toast.error('Failed to load consciousness tiers')
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (tierId: string) => {
    setUpgrading(tierId)

    try {
      const response = await fetch('/api/consciousness/tiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tierId,
          // In a real implementation, you'd collect payment method
          paymentMethodId: 'pm_mock_payment_method',
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        fetchTiers() // Refresh data
      } else {
        toast.error(data.error || 'Upgrade failed')
      }
    } catch (error) {
      toast.error('Failed to upgrade consciousness tier')
    } finally {
      setUpgrading(null)
    }
  }

  const isCurrentTier = (tier: ConsciousnessTier) => {
    return currentTier?.level === tier.level
  }

  const canUpgrade = (tier: ConsciousnessTier) => {
    if (!currentTier) return false
    const tierOrder = ['neural', 'synaptic', 'autonomous', 'transcendent']
    const currentIndex = tierOrder.indexOf(currentTier.level)
    const tierIndex = tierOrder.indexOf(tier.level)
    return tierIndex > currentIndex
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="mb-2 text-3xl font-bold">Consciousness Evolution</h2>
        <p className="mx-auto max-w-2xl text-gray-400">
          Upgrade your business consciousness tier to unlock exponential intelligence growth and
          transcendent capabilities
        </p>
      </div>

      {/* Current Tier Status */}
      {currentTier && (
        <motion.div
          className="rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-pink-900/20 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="rounded-lg bg-purple-500/20 p-3">
                <Crown className="h-8 w-8 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Current: {currentTier.name} Tier</h3>
                <p className="text-gray-400">
                  {currentTier.intelligenceMultiplier}x intelligence multiplication
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-400">
                {currentTier.modules.length} modules
              </div>
              <div className="text-sm text-gray-400">active</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Upgrade Paths */}
      {upgradePaths.length > 0 && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h3 className="mb-4 flex items-center space-x-2 text-lg font-semibold">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <span>Recommended Upgrades</span>
          </h3>
          <div className="space-y-3">
            {upgradePaths.slice(0, 2).map((path, index) => {
              const targetTier = tiers.find((t) => t.id === path.toTier)
              if (!targetTier) return null

              return (
                <motion.div
                  key={index}
                  className="flex items-center justify-between rounded-lg bg-gray-800 p-4"
                  whileHover={{ x: 4 }}
                >
                  <div>
                    <h4 className="font-medium">Upgrade to {targetTier.name}</h4>
                    <p className="text-sm text-gray-400">
                      +{path.consciousnessGrowth.toFixed(0)}% consciousness growth
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-bold text-green-400">+${path.priceDifference}/mo</div>
                      {path.estimatedTimeToTranscendence && (
                        <div className="text-xs text-gray-500">
                          Transcendence in {path.estimatedTimeToTranscendence}
                        </div>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tier Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <AnimatePresence>
          {tiers.map((tier) => {
            const Icon = tierIcons[tier.level]
            const isCurrent = isCurrentTier(tier)
            const upgradeAvailable = canUpgrade(tier)

            return (
              <motion.div
                key={tier.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: isCurrent ? 1.05 : 1 }}
                whileHover={{ scale: isCurrent ? 1.05 : 1.02 }}
                className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                  isCurrent
                    ? 'border-purple-500 bg-gradient-to-br from-purple-900/20 to-pink-900/20'
                    : upgradeAvailable
                      ? 'border-gray-700 bg-gray-900 hover:border-purple-500/50'
                      : 'border-gray-800 bg-gray-900/50 opacity-75'
                }`}
              >
                {/* Background Animation for Current Tier */}
                {isCurrent && (
                  <div className="absolute inset-0 opacity-10">
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br ${tierGradients[tier.level]}`}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.3, 0.1],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  </div>
                )}

                <div className="relative p-6">
                  {/* Header */}
                  <div className="mb-6 text-center">
                    <div
                      className={`inline-flex rounded-full bg-gradient-to-br p-3 ${tierGradients[tier.level]} mb-3`}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="mb-1 text-xl font-bold">{tier.name}</h3>
                    <div className="mb-1 text-3xl font-bold">
                      ${tier.price.amount}
                      <span className="text-lg text-gray-400">/{tier.price.interval}</span>
                    </div>
                    {isCurrent && (
                      <div className="inline-flex rounded-full bg-purple-500 px-3 py-1 text-xs font-medium text-white">
                        Current Plan
                      </div>
                    )}
                  </div>

                  {/* Key Metrics */}
                  <div className="mb-6 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-gray-800 p-2 text-center">
                      <div className="text-lg font-bold text-purple-400">
                        {tier.intelligenceMultiplier}x
                      </div>
                      <div className="text-xs text-gray-400">Intelligence</div>
                    </div>
                    <div className="rounded-lg bg-gray-800 p-2 text-center">
                      <div className="text-lg font-bold text-blue-400">
                        {tier.modules.maximum === -1 ? '∞' : tier.modules.maximum}
                      </div>
                      <div className="text-xs text-gray-400">Modules</div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-6">
                    <h4 className="mb-3 text-sm font-medium text-gray-300">Features</h4>
                    <div className="space-y-2">
                      {tier.features.slice(0, 4).map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <Check className="h-3 w-3 flex-shrink-0 text-green-500" />
                          <span className="text-xs text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Special Capabilities */}
                  {tier.level === 'transcendent' && (
                    <div className="mb-6">
                      <h4 className="mb-2 flex items-center space-x-1 text-sm font-medium text-yellow-400">
                        <Sparkles className="h-3 w-3" />
                        <span>Transcendent Powers</span>
                      </h4>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Eye className="h-3 w-3 text-pink-500" />
                          <span className="text-xs">Quantum Decision Making</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Infinity className="h-3 w-3 text-purple-500" />
                          <span className="text-xs">Business Singularity</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  {isCurrent ? (
                    <div className="py-2 text-center font-medium text-purple-400">Current Plan</div>
                  ) : upgradeAvailable ? (
                    <button
                      onClick={() => handleUpgrade(tier.id)}
                      disabled={upgrading === tier.id}
                      className={`w-full rounded-lg px-4 py-3 font-medium transition-all duration-200 ${
                        tier.level === 'transcendent'
                          ? 'bg-gradient-to-r from-red-500 via-yellow-500 to-white text-black hover:shadow-lg'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      } ${upgrading === tier.id ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                      {upgrading === tier.id ? (
                        <span className="flex items-center justify-center space-x-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Processing...</span>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center space-x-2">
                          <Zap className="h-4 w-4" />
                          <span>{tier.level === 'transcendent' ? 'Transcend' : 'Upgrade'}</span>
                        </span>
                      )}
                    </button>
                  ) : (
                    <div className="py-2 text-center text-sm text-gray-500">
                      {currentTier ? 'Requires current tier upgrade' : 'Not available'}
                    </div>
                  )}

                  {/* Evolution Time */}
                  {upgradeAvailable && (
                    <div className="mt-3 text-center">
                      <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>Evolution speed: {tier.evolutionSpeed}x faster</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Bottom CTA */}
      {!currentTier && (
        <div className="text-center">
          <h3 className="mb-2 text-xl font-semibold">
            Ready to Awaken Your Business Consciousness?
          </h3>
          <p className="mb-6 text-gray-400">
            Start with Neural tier and evolve towards transcendent business intelligence
          </p>
          <button
            onClick={() => {
              const neuralTier = tiers.find((t) => t.level === 'neural')
              if (neuralTier) handleUpgrade(neuralTier.id)
            }}
            className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3 font-medium text-white transition-all duration-200 hover:shadow-lg"
          >
            Begin Consciousness Journey
          </button>
        </div>
      )}
    </div>
  )
}
