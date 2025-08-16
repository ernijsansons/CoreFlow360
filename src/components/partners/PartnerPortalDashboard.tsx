'use client'

/**
 * Partner Portal Dashboard
 * 
 * Central hub for Intelligence Certified Consultants to manage their
 * consciousness transformation practice and client engagements.
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useConsciousnessAudio } from '../../hooks/useConsciousnessAudio'

interface PartnerProfile {
  id: string
  name: string
  company: string
  certificationLevel: 'foundation' | 'advanced' | 'master' | 'transcendent'
  intelligenceScore: number
  clientsTransformed: number
  revenue: number
  specializationAreas: string[]
  consciousnessLevel: number
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
  consciousnessLevel: number
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
  className = ''
}) => {
  const [partnerProfile, setPartnerProfile] = useState<PartnerProfile | null>(null)
  const [selectedMetric, setSelectedMetric] = useState<'clients' | 'revenue' | 'consciousness'>('consciousness')
  const [showAchievements, setShowAchievements] = useState(false)

  const consciousnessAudio = useConsciousnessAudio({
    initiallyEnabled: true,
    initialConsciousnessLevel: 5
  })

  // Load partner profile
  useEffect(() => {
    // Mock partner data - in production would fetch from API
    const mockProfile: PartnerProfile = {
      id: partnerId,
      name: 'Sarah Chen',
      company: 'Transcendent Business Solutions',
      certificationLevel: 'advanced',
      intelligenceScore: 87,
      clientsTransformed: 24,
      revenue: 285000,
      specializationAreas: ['Manufacturing', 'SaaS', 'Professional Services'],
      consciousnessLevel: 7.5,
      achievements: [
        {
          id: 'first-transformation',
          title: 'First Consciousness Transformation',
          description: 'Successfully guided first client to business consciousness',
          icon: '🎯',
          unlockedAt: new Date('2024-01-15'),
          rarity: 'rare'
        },
        {
          id: 'intelligence-multiplier',
          title: 'Intelligence Multiplication Master',
          description: 'Achieved 10x intelligence multiplication for a client',
          icon: '🧠',
          unlockedAt: new Date('2024-03-20'),
          rarity: 'epic'
        },
        {
          id: 'consciousness-pioneer',
          title: 'Consciousness Pioneer',
          description: 'Among first 100 certified consultants globally',
          icon: '✨',
          unlockedAt: new Date('2023-12-01'),
          rarity: 'legendary'
        }
      ],
      activeClients: [
        {
          id: 'client-1',
          clientName: 'TechFlow Industries',
          currentPhase: 'Intelligence Multiplication',
          consciousnessLevel: 4.2,
          startDate: new Date('2024-01-01'),
          projectedCompletion: new Date('2024-06-01'),
          revenue: 45000,
          status: 'active'
        },
        {
          id: 'client-2',
          clientName: 'Quantum Dynamics Corp',
          currentPhase: 'Consciousness Emergence',
          consciousnessLevel: 6.8,
          startDate: new Date('2023-11-15'),
          projectedCompletion: new Date('2024-04-15'),
          revenue: 67000,
          status: 'active'
        }
      ]
    }
    setPartnerProfile(mockProfile)
  }, [partnerId])

  const getCertificationColor = (level: string) => {
    switch (level) {
      case 'foundation': return '#10B981'
      case 'advanced': return '#3B82F6'
      case 'master': return '#8B5CF6'
      case 'transcendent': return '#EC4899'
      default: return '#6B7280'
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#6B7280'
      case 'rare': return '#3B82F6'
      case 'epic': return '#8B5CF6'
      case 'legendary': return '#F59E0B'
      default: return '#6B7280'
    }
  }

  if (!partnerProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading partner profile...</div>
      </div>
    )
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Partner Header */}
      <div className="bg-gradient-to-r from-gray-900 to-black border border-gray-700 rounded-2xl p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-6">
            {/* Partner Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-3xl font-bold text-white">
                {partnerProfile.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div 
                className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: getCertificationColor(partnerProfile.certificationLevel) }}
              >
                {partnerProfile.certificationLevel.toUpperCase()}
              </div>
            </div>

            {/* Partner Info */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">{partnerProfile.name}</h2>
              <p className="text-lg text-gray-300 mb-2">{partnerProfile.company}</p>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <span className="text-cyan-400">🧠</span>
                  <span className="text-gray-400">Intelligence Score:</span>
                  <span className="text-white font-semibold">{partnerProfile.intelligenceScore}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-purple-400">✨</span>
                  <span className="text-gray-400">Consciousness:</span>
                  <span className="text-white font-semibold">{partnerProfile.consciousnessLevel.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex space-x-3">
            <button
              onClick={() => onNavigate?.('resources')}
              className="px-4 py-2 bg-gray-700 rounded-lg text-white hover:bg-gray-600 transition-all"
            >
              Resources
            </button>
            <button
              onClick={() => onNavigate?.('training')}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg text-white font-semibold hover:from-purple-500 hover:to-cyan-500 transition-all"
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
              className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-sm text-white"
            >
              {area}
            </span>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div
          className={`bg-gradient-to-br from-gray-900 to-black border rounded-xl p-6 cursor-pointer transition-all ${
            selectedMetric === 'clients' ? 'border-cyan-400 shadow-lg shadow-cyan-400/20' : 'border-gray-700'
          }`}
          onClick={() => setSelectedMetric('clients')}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">👥</div>
            <div className="text-xs text-cyan-400 font-semibold">+12% this month</div>
          </div>
          <div className="text-3xl font-bold text-white">{partnerProfile.clientsTransformed}</div>
          <div className="text-gray-400">Clients Transformed</div>
          <div className="mt-4 text-sm text-gray-500">
            <div>{partnerProfile.activeClients.length} active engagements</div>
          </div>
        </motion.div>

        <motion.div
          className={`bg-gradient-to-br from-gray-900 to-black border rounded-xl p-6 cursor-pointer transition-all ${
            selectedMetric === 'revenue' ? 'border-green-400 shadow-lg shadow-green-400/20' : 'border-gray-700'
          }`}
          onClick={() => setSelectedMetric('revenue')}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">💰</div>
            <div className="text-xs text-green-400 font-semibold">+28% this quarter</div>
          </div>
          <div className="text-3xl font-bold text-white">${partnerProfile.revenue.toLocaleString()}</div>
          <div className="text-gray-400">Total Revenue</div>
          <div className="mt-4 text-sm text-gray-500">
            <div>${(partnerProfile.revenue / partnerProfile.clientsTransformed).toFixed(0)} avg per client</div>
          </div>
        </motion.div>

        <motion.div
          className={`bg-gradient-to-br from-gray-900 to-black border rounded-xl p-6 cursor-pointer transition-all ${
            selectedMetric === 'consciousness' ? 'border-purple-400 shadow-lg shadow-purple-400/20' : 'border-gray-700'
          }`}
          onClick={() => setSelectedMetric('consciousness')}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">🧠</div>
            <div className="text-xs text-purple-400 font-semibold">Level Up!</div>
          </div>
          <div className="text-3xl font-bold text-white">{partnerProfile.consciousnessLevel.toFixed(1)}</div>
          <div className="text-gray-400">Consciousness Level</div>
          <div className="mt-4">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full"
                style={{ width: `${(partnerProfile.consciousnessLevel / 10) * 100}%` }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Active Client Engagements */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">🚀 Active Client Transformations</h3>
          <button
            onClick={() => onNavigate?.('clients')}
            className="text-cyan-400 hover:text-cyan-300 text-sm"
          >
            View All Clients →
          </button>
        </div>

        <div className="space-y-4">
          {partnerProfile.activeClients.map((client) => (
            <div
              key={client.id}
              className="bg-black/30 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-white">{client.clientName}</h4>
                  <p className="text-sm text-gray-400">Phase: {client.currentPhase}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-cyan-400">
                    {client.consciousnessLevel.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-400">Consciousness Level</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Started {client.startDate.toLocaleDateString()}</span>
                  <span>Target {client.projectedCompletion.toLocaleDateString()}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full"
                    style={{ 
                      width: `${((Date.now() - client.startDate.getTime()) / 
                        (client.projectedCompletion.getTime() - client.startDate.getTime())) * 100}%` 
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    client.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    client.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {client.status.toUpperCase()}
                  </span>
                  <span className="text-gray-400">
                    Revenue: <span className="text-white font-semibold">${client.revenue.toLocaleString()}</span>
                  </span>
                </div>
                <button className="text-cyan-400 hover:text-cyan-300">
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements Section */}
      <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-700 rounded-2xl p-6">
        <button
          onClick={() => {
            setShowAchievements(!showAchievements)
            consciousnessAudio.playConnectionSound()
          }}
          className="flex items-center justify-between w-full"
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
              className="mt-6 grid md:grid-cols-3 gap-4"
            >
              {partnerProfile.achievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  className="bg-black/30 rounded-lg p-4 border"
                  style={{ borderColor: getRarityColor(achievement.rarity) + '66' }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">{achievement.title}</h4>
                      <p className="text-xs text-gray-400 mb-2">{achievement.description}</p>
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
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { 
            title: 'Consciousness Toolkit', 
            icon: '🧠', 
            description: 'Assessment tools & frameworks',
            color: 'from-cyan-600 to-blue-600' 
          },
          { 
            title: 'Client Portal', 
            icon: '👥', 
            description: 'Manage transformations',
            color: 'from-purple-600 to-indigo-600' 
          },
          { 
            title: 'Training Academy', 
            icon: '🎓', 
            description: 'Advanced certifications',
            color: 'from-indigo-600 to-purple-600' 
          },
          { 
            title: 'Community Hub', 
            icon: '🌐', 
            description: 'Connect with partners',
            color: 'from-pink-600 to-purple-600' 
          }
        ].map((resource, index) => (
          <motion.button
            key={index}
            className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-left hover:border-gray-600 transition-all"
            whileHover={{ scale: 1.02 }}
            onClick={() => onNavigate?.(resource.title.toLowerCase().replace(' ', '-'))}
          >
            <div className="text-2xl mb-2">{resource.icon}</div>
            <h4 className="font-semibold text-white mb-1">{resource.title}</h4>
            <p className="text-xs text-gray-400">{resource.description}</p>
            <div className={`mt-3 inline-flex px-3 py-1 rounded-lg bg-gradient-to-r ${resource.color} text-white text-xs font-medium`}>
              Access →
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

export default PartnerPortalDashboard