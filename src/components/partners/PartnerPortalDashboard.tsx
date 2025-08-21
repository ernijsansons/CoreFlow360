'use client'

/**
 * Partner Portal Dashboard
 *
 * Central hub for Intelligence Certified Consultants to manage their
 * BUSINESS INTELLIGENCE transformation practice and client engagements.
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBusinessIntelligenceAudio } from '../../hooks/useBusinessIntelligenceAudio'

interface PartnerProfile {
  id: string
  name: string
  company: string
  certificationLevel: 'foundation' | 'advanced' | 'master' | 'ADVANCED'
  intelligenceScore: number
  clientsTransformed: number
  revenue: number
  specializationAreas: string[]
  businessIntelligenceLevel: number
  achievements: Achievement[]
  activeClients: ClientEngagement[]
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt: Date
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

interface ClientEngagement {
  id: string
  clientName: string
  currentPhase: string
  businessIntelligenceLevel: number
  startDate: Date
  projectedCompletion: Date
  revenue: number
  status: 'active' | 'completed' | 'paused'
}

interface PartnerPortalDashboardProps {
  partnerId?: string
  onNavigate?: (section: string) => void
  className?: string
}

const PartnerPortalDashboard: React.FC<PartnerPortalDashboardProps> = ({
  partnerId = 'demo-partner',
  onNavigate,
  className = '',
}) => {
  const [partnerProfile, setPartnerProfile] = useState<PartnerProfile | null>(null)
  const [selectedMetric, setSelectedMetric] = useState<'clients' | 'revenue' | 'BUSINESS INTELLIGENCE'>(
    'BUSINESS INTELLIGENCE'
  )
  const [showAchievements, setShowAchievements] = useState(false)

  const businessIntelligenceAudio = useBusinessIntelligenceAudio({
    initiallyEnabled: true,
    initialIntelligenceLevel: 5,
  })

  // Load partner profile
  useEffect(() => {
    // Mock partner data - in production would fetch from API
    const mockProfile: PartnerProfile = {
      id: partnerId,
      name: 'Sarah Chen',
      company: 'ADVANCED Business Solutions',
      certificationLevel: 'advanced',
      intelligenceScore: 87,
      clientsTransformed: 24,
      revenue: 285000,
      specializationAreas: ['Manufacturing', 'SaaS', 'Professional Services'],
      businessIntelligenceLevel: 7.5,
      achievements: [
        {
          id: 'first-transformation',
          title: 'First BUSINESS INTELLIGENCE Transformation',
          description: 'Successfully guided first client to business BUSINESS INTELLIGENCE',
          icon: '🎯',
          unlockedAt: new Date('2024-01-15'),
          rarity: 'rare',
        },
        {
          id: 'intelligence-multiplier',
          title: 'Intelligence Multiplication Master',
          description: 'Achieved 10x intelligence multiplication for a client',
          icon: '🧠',
          unlockedAt: new Date('2024-03-20'),
          rarity: 'epic',
        },
        {
          id: 'BUSINESS INTELLIGENCE-pioneer',
          title: 'BUSINESS INTELLIGENCE Pioneer',
          description: 'Among first 100 certified consultants globally',
          icon: '✨',
          unlockedAt: new Date('2023-12-01'),
          rarity: 'legendary',
        },
      ],
      activeClients: [
        {
          id: 'client-1',
          clientName: 'TechFlow Industries',
          currentPhase: 'Intelligence Multiplication',
          businessIntelligenceLevel: 4.2,
          startDate: new Date('2024-01-01'),
          projectedCompletion: new Date('2024-06-01'),
          revenue: 45000,
          status: 'active',
        },
        {
          id: 'client-2',
          clientName: 'Quantum Dynamics Corp',
          currentPhase: 'intelligent automation',
          businessIntelligenceLevel: 6.8,
          startDate: new Date('2023-11-15'),
          projectedCompletion: new Date('2024-04-15'),
          revenue: 67000,
          status: 'active',
        },
      ],
    }
    setPartnerProfile(mockProfile)
  }, [partnerId])

  const getCertificationColor = (level: string) => {
    switch (level) {
      case 'foundation':
        return '#10B981'
      case 'advanced':
        return '#3B82F6'
      case 'master':
        return '#8B5CF6'
      case 'ADVANCED':
        return '#EC4899'
      default:
        return '#6B7280'
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return '#6B7280'
      case 'rare':
        return '#3B82F6'
      case 'epic':
        return '#8B5CF6'
      case 'legendary':
        return '#F59E0B'
      default:
        return '#6B7280'
    }
  }

  if (!partnerProfile) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-400">Loading partner profile...</div>
      </div>
    )
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Partner Header */}
      <div className="rounded-2xl border border-gray-700 bg-gradient-to-r from-gray-900 to-black p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-6">
            {/* Partner Avatar */}
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 text-3xl font-bold text-white">
                {partnerProfile.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <div
                className="absolute -right-2 -bottom-2 rounded-full px-3 py-1 text-xs font-bold text-white"
                style={{
                  backgroundColor: getCertificationColor(partnerProfile.certificationLevel),
                }}
              >
                {partnerProfile.certificationLevel.toUpperCase()}
              </div>
            </div>

            {/* Partner Info */}
            <div>
              <h2 className="mb-1 text-3xl font-bold text-white">{partnerProfile.name}</h2>
              <p className="mb-2 text-lg text-gray-300">{partnerProfile.company}</p>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <span className="text-cyan-400">🧠</span>
                  <span className="text-gray-400">Intelligence Score:</span>
                  <span className="font-semibold text-white">
                    {partnerProfile.intelligenceScore}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-purple-400">✨</span>
                  <span className="text-gray-400">BUSINESS INTELLIGENCE:</span>
                  <span className="font-semibold text-white">
                    {partnerProfile.businessIntelligenceLevel.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex space-x-3">
            <button
              onClick={() => onNavigate?.('resources')}
              className="rounded-lg bg-gray-700 px-4 py-2 text-white transition-all hover:bg-gray-600"
            >
              Resources
            </button>
            <button
              onClick={() => onNavigate?.('training')}
              className="rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 px-4 py-2 font-semibold text-white transition-all hover:from-purple-500 hover:to-cyan-500"
            >
              Advanced Training
            </button>
          </div>
        </div>

        {/* Specialization Areas */}
        <div className="mt-6 flex flex-wrap gap-2">
          {partnerProfile.specializationAreas.map((area) => (
            <span
              key={area}
              className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-white"
            >
              {area}
            </span>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        <motion.div
          className={`cursor-pointer rounded-xl border bg-gradient-to-br from-gray-900 to-black p-6 transition-all ${
            selectedMetric === 'clients'
              ? 'border-cyan-400 shadow-lg shadow-cyan-400/20'
              : 'border-gray-700'
          }`}
          onClick={() => setSelectedMetric('clients')}
          whileHover={{ scale: 1.02 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="text-3xl">👥</div>
            <div className="text-xs font-semibold text-cyan-400">+12% this month</div>
          </div>
          <div className="text-3xl font-bold text-white">{partnerProfile.clientsTransformed}</div>
          <div className="text-gray-400">Clients Transformed</div>
          <div className="mt-4 text-sm text-gray-500">
            <div>{partnerProfile.activeClients.length} active engagements</div>
          </div>
        </motion.div>

        <motion.div
          className={`cursor-pointer rounded-xl border bg-gradient-to-br from-gray-900 to-black p-6 transition-all ${
            selectedMetric === 'revenue'
              ? 'border-green-400 shadow-lg shadow-green-400/20'
              : 'border-gray-700'
          }`}
          onClick={() => setSelectedMetric('revenue')}
          whileHover={{ scale: 1.02 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="text-3xl">💰</div>
            <div className="text-xs font-semibold text-green-400">+28% this quarter</div>
          </div>
          <div className="text-3xl font-bold text-white">
            ${partnerProfile.revenue.toLocaleString()}
          </div>
          <div className="text-gray-400">Total Revenue</div>
          <div className="mt-4 text-sm text-gray-500">
            <div>
              ${(partnerProfile.revenue / partnerProfile.clientsTransformed).toFixed(0)} avg per
              client
            </div>
          </div>
        </motion.div>

        <motion.div
          className={`cursor-pointer rounded-xl border bg-gradient-to-br from-gray-900 to-black p-6 transition-all ${
            selectedMetric === 'BUSINESS INTELLIGENCE'
              ? 'border-purple-400 shadow-lg shadow-purple-400/20'
              : 'border-gray-700'
          }`}
          onClick={() => setSelectedMetric('BUSINESS INTELLIGENCE')}
          whileHover={{ scale: 1.02 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="text-3xl">🧠</div>
            <div className="text-xs font-semibold text-purple-400">Level Up!</div>
          </div>
          <div className="text-3xl font-bold text-white">
            {partnerProfile.businessIntelligenceLevel.toFixed(1)}
          </div>
          <div className="text-gray-400">BUSINESS INTELLIGENCE Level</div>
          <div className="mt-4">
            <div className="h-2 w-full rounded-full bg-gray-700">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
                style={{ width: `${(partnerProfile.businessIntelligenceLevel / 10) * 100}%` }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Active Client Engagements */}
      <div className="rounded-2xl border border-gray-700 bg-gray-900 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">🚀 Active Client Transformations</h3>
          <button
            onClick={() => onNavigate?.('clients')}
            className="text-sm text-cyan-400 hover:text-cyan-300"
          >
            View All Clients →
          </button>
        </div>

        <div className="space-y-4">
          {partnerProfile.activeClients.map((client) => (
            <div
              key={client.id}
              className="rounded-xl border border-gray-700 bg-black/30 p-6 transition-all hover:border-gray-600"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-white">{client.clientName}</h4>
                  <p className="text-sm text-gray-400">Phase: {client.currentPhase}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-cyan-400">
                    {client.businessIntelligenceLevel.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-400">BUSINESS INTELLIGENCE Level</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="mb-1 flex justify-between text-xs text-gray-400">
                  <span>Started {client.startDate.toLocaleDateString()}</span>
                  <span>Target {client.projectedCompletion.toLocaleDateString()}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-700">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                    style={{
                      width: `${
                        ((Date.now() - client.startDate.getTime()) /
                          (client.projectedCompletion.getTime() - client.startDate.getTime())) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      client.status === 'active'
                        ? 'bg-green-500/20 text-green-400'
                        : client.status === 'completed'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {client.status.toUpperCase()}
                  </span>
                  <span className="text-gray-400">
                    Revenue:{' '}
                    <span className="font-semibold text-white">
                      ${client.revenue.toLocaleString()}
                    </span>
                  </span>
                </div>
                <button className="text-cyan-400 hover:text-cyan-300">View Details →</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements Section */}
      <div className="rounded-2xl border border-purple-700 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 p-6">
        <button
          onClick={() => {
            setShowAchievements(!showAchievements)
            businessIntelligenceAudio.playConnectionSound()
          }}
          className="flex w-full items-center justify-between"
        >
          <h3 className="text-xl font-bold text-white">🏆 Achievements & Recognition</h3>
          <motion.div
            animate={{ rotate: showAchievements ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-purple-400"
          >
            ▼
          </motion.div>
        </button>

        <AnimatePresence>
          {showAchievements && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 grid gap-4 md:grid-cols-3"
            >
              {partnerProfile.achievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  className="rounded-lg border bg-black/30 p-4"
                  style={{ borderColor: getRarityColor(achievement.rarity) + '66' }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className="mb-1 font-semibold text-white">{achievement.title}</h4>
                      <p className="mb-2 text-xs text-gray-400">{achievement.description}</p>
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs font-medium"
                          style={{ color: getRarityColor(achievement.rarity) }}
                        >
                          {achievement.rarity.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {achievement.unlockedAt.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Resources */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          {
            title: 'BUSINESS INTELLIGENCE Toolkit',
            icon: '🧠',
            description: 'Assessment tools & frameworks',
            color: 'from-cyan-600 to-blue-600',
          },
          {
            title: 'Client Portal',
            icon: '👥',
            description: 'Manage transformations',
            color: 'from-purple-600 to-indigo-600',
          },
          {
            title: 'Training Academy',
            icon: '🎓',
            description: 'Advanced certifications',
            color: 'from-indigo-600 to-purple-600',
          },
          {
            title: 'Community Hub',
            icon: '🌐',
            description: 'Connect with partners',
            color: 'from-pink-600 to-purple-600',
          },
        ].map((resource, index) => (
          <motion.button
            key={index}
            className="rounded-xl border border-gray-700 bg-gray-800 p-4 text-left transition-all hover:border-gray-600"
            whileHover={{ scale: 1.02 }}
            onClick={() => onNavigate?.(resource.title.toLowerCase().replace(' ', '-'))}
          >
            <div className="mb-2 text-2xl">{resource.icon}</div>
            <h4 className="mb-1 font-semibold text-white">{resource.title}</h4>
            <p className="text-xs text-gray-400">{resource.description}</p>
            <div
              className={`mt-3 inline-flex rounded-lg bg-gradient-to-r px-3 py-1 ${resource.color} text-xs font-medium text-white`}
            >
              Access →
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

export default PartnerPortalDashboard
