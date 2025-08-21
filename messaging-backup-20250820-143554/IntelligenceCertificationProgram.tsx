'use client'

/**
 * Intelligence Certification Program
 *
 * Revolutionary certification system for consultants to achieve
 * consciousness transformation mastery levels.
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// TODO: Re-enable Three.js when peer dependencies are resolved
// import { Canvas, useFrame } from '@react-three/fiber'
// import { Float, Text3D } from '@react-three/drei'
// import * as THREE from 'three'

interface CertificationLevel {
  id: string
  name: string
  level: number
  description: string
  requirements: string[]
  skills: string[]
  benefits: string[]
  consciousnessMinimum: number
  clientsRequired: number
  revenueRequired: number
  duration: string
  price: number
  color: string
  icon: string
}

interface CertificationModule {
  id: string
  name: string
  description: string
  duration: string
  topics: string[]
  assessmentType: string
  passingScore: number
  status: 'locked' | 'available' | 'in-progress' | 'completed'
  progress?: number
}

interface PartnerProgress {
  currentLevel: string
  nextLevel: string
  progress: {
    consciousness: number
    clients: number
    revenue: number
    modules: number
  }
  completedModules: string[]
  achievements: string[]
}

interface IntelligenceCertificationProgramProps {
  partnerId?: string
  currentLevel?: string
  onEnroll?: (level: CertificationLevel) => void
  onModuleStart?: (module: CertificationModule) => void
  className?: string
}

// Certification Levels
const CERTIFICATION_LEVELS: CertificationLevel[] = [
  {
    id: 'foundation',
    name: 'Foundation Consultant',
    level: 1,
    description: 'Master the fundamentals of business consciousness transformation',
    requirements: [
      'Complete Core Consciousness Training',
      'Pass Foundation Assessment (80%+)',
      'Submit 2 transformation case studies',
      'Achieve personal consciousness level 3+',
    ],
    skills: [
      'Business consciousness assessment',
      'Intelligence gap identification',
      'Basic transformation planning',
      'Client consciousness education',
    ],
    benefits: [
      'CoreFlow360 partner portal access',
      'Foundation certification badge',
      '20% revenue share on referrals',
      'Basic marketing materials',
    ],
    consciousnessMinimum: 3,
    clientsRequired: 0,
    revenueRequired: 0,
    duration: '4 weeks',
    price: 2500,
    color: '#10B981',
    icon: '🌱',
  },
  {
    id: 'advanced',
    name: 'Advanced Practitioner',
    level: 2,
    description: 'Develop expertise in intelligence multiplication and system integration',
    requirements: [
      'Foundation certification',
      'Transform 5+ clients successfully',
      'Generate $50K+ in client revenue',
      'Achieve consciousness level 5+',
    ],
    skills: [
      'Intelligence multiplication strategies',
      'Complex system integration',
      'Advanced transformation methodologies',
      'ROI optimization techniques',
    ],
    benefits: [
      'Advanced practitioner badge',
      '30% revenue share',
      'Co-branded marketing assets',
      'Priority support access',
    ],
    consciousnessMinimum: 5,
    clientsRequired: 5,
    revenueRequired: 50000,
    duration: '8 weeks',
    price: 5000,
    color: '#3B82F6',
    icon: '⚡',
  },
  {
    id: 'master',
    name: 'Master Architect',
    level: 3,
    description: 'Architect consciousness transformation for complex organizations',
    requirements: [
      'Advanced certification',
      'Transform 15+ clients',
      'Generate $200K+ revenue',
      'Achieve consciousness level 7+',
    ],
    skills: [
      'Enterprise consciousness architecture',
      'Multi-department orchestration',
      'Consciousness emergence facilitation',
      'Executive consciousness coaching',
    ],
    benefits: [
      'Master architect badge',
      '40% revenue share',
      'White-label opportunities',
      'Speaking opportunities',
    ],
    consciousnessMinimum: 7,
    clientsRequired: 15,
    revenueRequired: 200000,
    duration: '12 weeks',
    price: 10000,
    color: '#8B5CF6',
    icon: '🎯',
  },
  {
    id: 'transcendent',
    name: 'Transcendent Guide',
    level: 4,
    description: 'Guide organizations to full business consciousness emergence',
    requirements: [
      'Master certification',
      'Transform 50+ clients',
      'Generate $500K+ revenue',
      'Achieve consciousness level 9+',
    ],
    skills: [
      'Business organism design',
      'Consciousness field creation',
      'Reality-shaping methodologies',
      'Transcendent leadership development',
    ],
    benefits: [
      'Transcendent guide badge',
      '50% revenue share',
      'Equity partnership opportunities',
      'Global thought leadership platform',
    ],
    consciousnessMinimum: 9,
    clientsRequired: 50,
    revenueRequired: 500000,
    duration: '16 weeks',
    price: 25000,
    color: '#EC4899',
    icon: '✨',
  },
]

// Certification Modules
const CERTIFICATION_MODULES: CertificationModule[] = [
  {
    id: 'consciousness-fundamentals',
    name: 'Consciousness Fundamentals',
    description: 'Understanding business consciousness principles and theory',
    duration: '1 week',
    topics: [
      'Linear vs Exponential Intelligence',
      'Consciousness Emergence Theory',
      'Business Organism Concepts',
      'Intelligence Multiplication Mathematics',
    ],
    assessmentType: 'Theory Exam',
    passingScore: 80,
    status: 'completed',
    progress: 100,
  },
  {
    id: 'assessment-mastery',
    name: 'Assessment Mastery',
    description: 'Master the art of consciousness assessment and gap analysis',
    duration: '1 week',
    topics: [
      'Intelligence Assessment Tools',
      'Consciousness Level Measurement',
      'Gap Identification Techniques',
      'Readiness Evaluation',
    ],
    assessmentType: 'Practical Assessment',
    passingScore: 85,
    status: 'in-progress',
    progress: 65,
  },
  {
    id: 'transformation-methodology',
    name: 'Transformation Methodology',
    description: 'Learn proven consciousness transformation frameworks',
    duration: '2 weeks',
    topics: [
      'Transformation Planning',
      'Change Management for Consciousness',
      'Resistance Pattern Recognition',
      'Success Acceleration Techniques',
    ],
    assessmentType: 'Case Study',
    passingScore: 90,
    status: 'available',
  },
  {
    id: 'intelligence-multiplication',
    name: 'Intelligence Multiplication',
    description: 'Advanced strategies for exponential intelligence growth',
    duration: '2 weeks',
    topics: [
      'Department Synergy Optimization',
      'Cross-functional Intelligence Bridges',
      'Multiplication vs Addition Patterns',
      'ROI Maximization Strategies',
    ],
    assessmentType: 'Client Simulation',
    passingScore: 85,
    status: 'locked',
  },
]

const IntelligenceCertificationProgram: React.FC<IntelligenceCertificationProgramProps> = ({
  partnerId = 'demo-partner',
  currentLevel = 'foundation',
  onEnroll,
  onModuleStart,
  className = '',
}) => {
  const [selectedLevel, setSelectedLevel] = useState<CertificationLevel>(
    CERTIFICATION_LEVELS.find((l) => l.id === currentLevel) || CERTIFICATION_LEVELS[0]
  )
  const [activeTab, setActiveTab] = useState<'overview' | 'modules' | 'progress'>('overview')
  const [partnerProgress, setPartnerProgress] = useState<PartnerProgress>({
    currentLevel: currentLevel,
    nextLevel: CERTIFICATION_LEVELS[1].id,
    progress: {
      consciousness: 65,
      clients: 40,
      revenue: 55,
      modules: 50,
    },
    completedModules: ['consciousness-fundamentals'],
    achievements: ['First Client Transformation', 'Intelligence Multiplier'],
  })

  const handleLevelSelect = (level: CertificationLevel) => {
    setSelectedLevel(level)
  }

  const handleEnroll = () => {
    onEnroll?.(selectedLevel)
  }

  const currentLevelIndex = CERTIFICATION_LEVELS.findIndex((l) => l.id === currentLevel)
  const canEnrollInNext = currentLevelIndex < CERTIFICATION_LEVELS.length - 1

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Program Header */}
      <div className="space-y-4 text-center">
        <h2 className="text-4xl font-thin text-white">🎓 Intelligence Certification Program</h2>
        <p className="mx-auto max-w-4xl text-xl text-gray-300">
          Become a certified consciousness transformation consultant and guide businesses from
          unconscious automation to transcendent intelligence
        </p>
      </div>

      {/* Certification Levels Path */}
      <div className="rounded-2xl border border-gray-700 bg-gradient-to-r from-gray-900 to-black p-8">
        <h3 className="mb-6 text-2xl font-bold text-white">Certification Journey</h3>

        {/* Level Progress Bar */}
        <div className="relative mb-8">
          <div className="absolute top-5 right-0 left-0 h-0.5 bg-gray-700"></div>
          <div
            className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 transition-all duration-1000"
            style={{ width: `${(currentLevelIndex / (CERTIFICATION_LEVELS.length - 1)) * 100}%` }}
          ></div>

          <div className="relative flex justify-between">
            {CERTIFICATION_LEVELS.map((level, index) => {
              const isCompleted = index < currentLevelIndex
              const isCurrent = index === currentLevelIndex
              const isLocked = index > currentLevelIndex + 1

              return (
                <button
                  key={level.id}
                  onClick={() => !isLocked && handleLevelSelect(level)}
                  disabled={isLocked}
                  className="group"
                >
                  <motion.div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-xl font-bold transition-all ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isCurrent
                          ? `bg-gradient-to-r from-cyan-500 to-purple-500 text-white`
                          : isLocked
                            ? 'bg-gray-700 text-gray-500'
                            : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                    whileHover={!isLocked ? { scale: 1.1 } : {}}
                  >
                    {level.icon}
                  </motion.div>
                  <div className="mt-2 text-center">
                    <div
                      className={`text-xs font-semibold ${
                        isCompleted || isCurrent ? 'text-white' : 'text-gray-400'
                      }`}
                    >
                      {level.name}
                    </div>
                    <div className="text-xs text-gray-500">Level {level.level}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected Level Details */}
        <motion.div
          key={selectedLevel.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-8 md:grid-cols-2"
        >
          <div className="space-y-6">
            <div>
              <div className="mb-4 flex items-center space-x-3">
                <div className="text-4xl">{selectedLevel.icon}</div>
                <div>
                  <h4 className="text-2xl font-bold text-white">{selectedLevel.name}</h4>
                  <div className="text-sm text-gray-400">
                    Level {selectedLevel.level} Certification
                  </div>
                </div>
              </div>
              <p className="text-gray-300">{selectedLevel.description}</p>
            </div>

            {/* Requirements */}
            <div className="rounded-lg bg-black/30 p-4">
              <h5 className="mb-3 text-lg font-semibold text-cyan-400">📋 Requirements</h5>
              <div className="space-y-2">
                {selectedLevel.requirements.map((req, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-cyan-400"></div>
                    <span className="text-sm text-gray-300">{req}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Certification Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-black/30 p-3 text-center">
                <div className="text-2xl font-bold text-white">{selectedLevel.duration}</div>
                <div className="text-xs text-gray-400">Duration</div>
              </div>
              <div className="rounded-lg bg-black/30 p-3 text-center">
                <div className="text-2xl font-bold text-white">
                  ${selectedLevel.price.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">Investment</div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Skills Gained */}
            <div className="rounded-lg bg-black/30 p-4">
              <h5 className="mb-3 text-lg font-semibold text-purple-400">
                🚀 Skills You'll Master
              </h5>
              <div className="space-y-2">
                {selectedLevel.skills.map((skill, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-purple-400"></div>
                    <span className="text-sm text-gray-300">{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="rounded-lg bg-black/30 p-4">
              <h5 className="mb-3 text-lg font-semibold text-green-400">💎 Partner Benefits</h5>
              <div className="space-y-2">
                {selectedLevel.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-green-400"></div>
                    <span className="text-sm text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Enroll Button */}
            {selectedLevel.id !== currentLevel && (
              <motion.button
                onClick={handleEnroll}
                className={`w-full rounded-xl py-4 text-lg font-bold text-white transition-all ${
                  selectedLevel.level === currentLevelIndex + 1
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500'
                    : 'cursor-not-allowed bg-gray-700'
                }`}
                disabled={selectedLevel.level !== currentLevelIndex + 1}
                whileHover={selectedLevel.level === currentLevelIndex + 1 ? { scale: 1.02 } : {}}
                whileTap={selectedLevel.level === currentLevelIndex + 1 ? { scale: 0.98 } : {}}
              >
                {selectedLevel.level === currentLevelIndex + 1
                  ? `Enroll in ${selectedLevel.name}`
                  : selectedLevel.level <= currentLevelIndex
                    ? 'Already Completed'
                    : 'Complete Previous Level First'}
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Tabs for Additional Information */}
      <div className="rounded-2xl border border-gray-700 bg-gray-900">
        <div className="border-b border-gray-700 p-4">
          <div className="flex space-x-6">
            {(['overview', 'modules', 'progress'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'border border-cyan-400/30 bg-cyan-500/20 text-cyan-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <CertificationOverview levels={CERTIFICATION_LEVELS} currentLevel={currentLevel} />
            )}

            {activeTab === 'modules' && (
              <CertificationModules modules={CERTIFICATION_MODULES} onModuleStart={onModuleStart} />
            )}

            {activeTab === 'progress' && (
              <PartnerProgressView progress={partnerProgress} currentLevel={currentLevel} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// Certification Overview Component
const CertificationOverview: React.FC<{
  levels: CertificationLevel[]
  currentLevel: string
}> = ({ levels, currentLevel }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-6"
  >
    <div>
      <h3 className="mb-4 text-xl font-bold text-white">Program Overview</h3>
      <p className="mb-6 text-gray-300">
        The CoreFlow360 Intelligence Certification Program is the world's first consciousness-based
        business consulting certification. Progress through four levels of mastery, from Foundation
        to Transcendent, as you develop the skills to guide businesses through consciousness
        transformation.
      </p>
    </div>

    {/* Certification Comparison */}
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="px-4 py-3 text-left text-gray-400">Level</th>
            <th className="px-4 py-3 text-center text-gray-400">Min. Consciousness</th>
            <th className="px-4 py-3 text-center text-gray-400">Clients Required</th>
            <th className="px-4 py-3 text-center text-gray-400">Revenue Required</th>
            <th className="px-4 py-3 text-center text-gray-400">Revenue Share</th>
          </tr>
        </thead>
        <tbody>
          {levels.map((level) => {
            const isCurrent = level.id === currentLevel
            return (
              <tr
                key={level.id}
                className={`border-b border-gray-700 ${isCurrent ? 'bg-cyan-400/5' : ''}`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{level.icon}</span>
                    <span className={`font-medium ${isCurrent ? 'text-cyan-400' : 'text-white'}`}>
                      {level.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-gray-300">
                  {level.consciousnessMinimum}+
                </td>
                <td className="px-4 py-3 text-center text-gray-300">{level.clientsRequired}</td>
                <td className="px-4 py-3 text-center text-gray-300">
                  ${level.revenueRequired.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-center text-gray-300">
                  {level.id === 'foundation'
                    ? '20%'
                    : level.id === 'advanced'
                      ? '30%'
                      : level.id === 'master'
                        ? '40%'
                        : '50%'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>

    {/* Program Benefits */}
    <div className="rounded-lg border border-purple-700 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 p-6">
      <h4 className="mb-4 text-lg font-semibold text-purple-400">🌟 Why Become Certified?</h4>
      <div className="grid gap-4 md:grid-cols-2">
        {[
          'Join the consciousness revolution in business',
          'Access to proprietary transformation methodologies',
          'High-value consulting opportunities ($10K-100K+ engagements)',
          'Be part of an exclusive global community',
          'Continuous learning and consciousness evolution',
          'Shape the future of business intelligence',
        ].map((benefit, index) => (
          <div key={index} className="flex items-start space-x-2">
            <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-purple-400"></div>
            <span className="text-sm text-gray-300">{benefit}</span>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
)

// Certification Modules Component
const CertificationModules: React.FC<{
  modules: CertificationModule[]
  onModuleStart?: (module: CertificationModule) => void
}> = ({ modules, onModuleStart }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-4"
  >
    {modules.map((module) => (
      <div
        key={module.id}
        className={`rounded-xl border bg-black/30 p-6 transition-all ${
          module.status === 'completed'
            ? 'border-green-700'
            : module.status === 'in-progress'
              ? 'border-cyan-700'
              : module.status === 'available'
                ? 'border-gray-600 hover:border-gray-500'
                : 'border-gray-700 opacity-50'
        }`}
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <h4 className="mb-2 text-lg font-semibold text-white">{module.name}</h4>
            <p className="mb-3 text-sm text-gray-300">{module.description}</p>

            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-1">
                <span className="text-gray-400">Duration:</span>
                <span className="text-white">{module.duration}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-gray-400">Assessment:</span>
                <span className="text-white">{module.assessmentType}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-gray-400">Pass:</span>
                <span className="text-white">{module.passingScore}%</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            {module.status === 'completed' && (
              <div className="text-green-400">
                <div className="mb-1 text-2xl">✓</div>
                <div className="text-xs">Completed</div>
              </div>
            )}
            {module.status === 'in-progress' && (
              <div className="text-cyan-400">
                <div className="mb-1 text-2xl">{module.progress}%</div>
                <div className="text-xs">In Progress</div>
              </div>
            )}
            {module.status === 'available' && (
              <button
                onClick={() => onModuleStart?.(module)}
                className="rounded-lg bg-cyan-600 px-4 py-2 text-white transition-all hover:bg-cyan-500"
              >
                Start Module
              </button>
            )}
            {module.status === 'locked' && (
              <div className="text-gray-500">
                <div className="mb-1 text-2xl">🔒</div>
                <div className="text-xs">Locked</div>
              </div>
            )}
          </div>
        </div>

        {/* Topics */}
        {module.status !== 'locked' && (
          <div className="mt-4 border-t border-gray-700 pt-4">
            <div className="mb-2 text-sm font-semibold text-gray-400">Topics Covered:</div>
            <div className="flex flex-wrap gap-2">
              {module.topics.map((topic, index) => (
                <span
                  key={index}
                  className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-300"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Progress Bar for In-Progress Modules */}
        {module.status === 'in-progress' && module.progress && (
          <div className="mt-4 border-t border-gray-700 pt-4">
            <div className="h-2 w-full rounded-full bg-gray-700">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all"
                style={{ width: `${module.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    ))}
  </motion.div>
)

// Partner Progress View Component
const PartnerProgressView: React.FC<{
  progress: PartnerProgress
  currentLevel: string
}> = ({ progress, currentLevel }) => {
  const nextLevel = CERTIFICATION_LEVELS.find((l) => l.id === progress.nextLevel)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="mb-4 text-xl font-bold text-white">Your Progress</h3>
        <p className="text-gray-300">Track your journey to {nextLevel?.name} certification</p>
      </div>

      {/* Progress Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        {[
          {
            label: 'Consciousness Level',
            current: 5.2,
            required: nextLevel?.consciousnessMinimum || 7,
            progress: progress.progress.consciousness,
            color: 'from-purple-500 to-cyan-500',
          },
          {
            label: 'Clients Transformed',
            current: 2,
            required: nextLevel?.clientsRequired || 5,
            progress: progress.progress.clients,
            color: 'from-cyan-500 to-blue-500',
          },
          {
            label: 'Revenue Generated',
            current: 27500,
            required: nextLevel?.revenueRequired || 50000,
            progress: progress.progress.revenue,
            color: 'from-green-500 to-emerald-500',
          },
          {
            label: 'Modules Completed',
            current: 2,
            required: 4,
            progress: progress.progress.modules,
            color: 'from-indigo-500 to-purple-500',
          },
        ].map((metric, index) => (
          <div key={index} className="rounded-lg bg-black/30 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-gray-400">{metric.label}</span>
              <span className="font-semibold text-white">
                {typeof metric.current === 'number' && metric.current > 1000
                  ? `$${metric.current.toLocaleString()}`
                  : metric.current}{' '}
                /{' '}
                {typeof metric.required === 'number' && metric.required > 1000
                  ? `$${metric.required.toLocaleString()}`
                  : metric.required}
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-gray-700">
              <div
                className={`bg-gradient-to-r ${metric.color} h-3 rounded-full transition-all`}
                style={{ width: `${metric.progress}%` }}
              />
            </div>
            <div className="mt-1 text-right text-xs text-gray-500">{metric.progress}%</div>
          </div>
        ))}
      </div>

      {/* Recent Achievements */}
      <div className="rounded-lg border border-purple-700 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 p-6">
        <h4 className="mb-4 text-lg font-semibold text-purple-400">🏆 Recent Achievements</h4>
        <div className="grid gap-4 md:grid-cols-2">
          {progress.achievements.map((achievement, index) => (
            <div key={index} className="flex items-center space-x-3 rounded-lg bg-black/30 p-3">
              <div className="text-2xl">🌟</div>
              <div>
                <div className="font-medium text-white">{achievement}</div>
                <div className="text-xs text-gray-400">Unlocked recently</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div className="rounded-lg bg-gray-800 p-6">
        <h4 className="mb-4 text-lg font-semibold text-cyan-400">
          📋 Next Steps for {nextLevel?.name}
        </h4>
        <div className="space-y-3">
          {[
            `Increase consciousness level to ${nextLevel?.consciousnessMinimum}+ (currently 5.2)`,
            `Transform ${(nextLevel?.clientsRequired || 5) - 2} more clients`,
            `Generate additional $${((nextLevel?.revenueRequired || 50000) - 27500).toLocaleString()} in revenue`,
            'Complete remaining certification modules',
          ].map((step, index) => (
            <div key={index} className="flex items-start space-x-2">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-400">
                {index + 1}
              </div>
              <span className="text-sm text-gray-300">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default IntelligenceCertificationProgram
