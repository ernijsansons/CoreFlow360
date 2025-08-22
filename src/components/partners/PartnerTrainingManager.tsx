'use client'

/**
 * Partner Training Manager
 * 
 * Comprehensive training system for CoreFlow360 partners with certification tracking,
 * progress monitoring, and interactive learning modules.
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TrainingModule {
  id: string
  title: string
  description: string
  category: string
  level: 'FOUNDATION' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
  duration: number // minutes
  prerequisites: string[]
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CERTIFIED'
  progress: number // 0-100
  score: number | null // 0-100
  completedAt: Date | null
  certificationRequired: boolean
  videoUrl?: string
  documentUrl?: string
  quizQuestions: number
  practicalAssignments: number
}

interface Certification {
  id: string
  name: string
  level: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND'
  requiredModules: string[]
  minimumScore: number
  validityPeriod: number // months
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'EARNED' | 'EXPIRED'
  earnedAt: Date | null
  expiresAt: Date | null
  benefits: string[]
  commissionRate: number
}

interface PartnerTrainingManagerProps {
  partnerId?: string
  onModuleComplete?: (moduleId: string, score: number) => void
  onCertificationEarned?: (certificationId: string) => void
  className?: string
}

const PartnerTrainingManager: React.FC<PartnerTrainingManagerProps> = ({
  partnerId = 'demo-partner',
  onModuleComplete,
  onCertificationEarned,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'modules' | 'certifications' | 'progress'>('modules')
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null)
  const [trainingModules, setTrainingModules] = useState<TrainingModule[]>([])
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [learningProgress, setLearningProgress] = useState({
    totalModules: 0,
    completedModules: 0,
    totalHours: 0,
    completedHours: 0,
    currentStreak: 0,
    averageScore: 0
  })

  // Load training data
  useEffect(() => {
    // Mock training modules - in production, fetch from API
    const mockModules: TrainingModule[] = [
      {
        id: 'foundation-001',
        title: 'CoreFlow360 Platform Fundamentals',
        description: 'Master the core concepts of multi-business portfolio management and intelligent automation',
        category: 'Platform Basics',
        level: 'FOUNDATION',
        duration: 45,
        prerequisites: [],
        status: 'COMPLETED',
        progress: 100,
        score: 92,
        completedAt: new Date('2024-02-15'),
        certificationRequired: true,
        videoUrl: '/training/foundation-fundamentals.mp4',
        documentUrl: '/docs/platform-guide.pdf',
        quizQuestions: 15,
        practicalAssignments: 2
      },
      {
        id: 'foundation-002',
        title: 'Progressive Pricing Strategy',
        description: 'Learn how to present and implement progressive pricing for maximum client value',
        category: 'Sales Strategy',
        level: 'FOUNDATION',
        duration: 30,
        prerequisites: ['foundation-001'],
        status: 'COMPLETED',
        progress: 100,
        score: 87,
        completedAt: new Date('2024-02-18'),
        certificationRequired: true,
        quizQuestions: 10,
        practicalAssignments: 1
      },
      {
        id: 'intermediate-001',
        title: 'Cross-Business Intelligence Implementation',
        description: 'Advanced techniques for implementing intelligent connections across client businesses',
        category: 'Implementation',
        level: 'INTERMEDIATE',
        duration: 75,
        prerequisites: ['foundation-001', 'foundation-002'],
        status: 'IN_PROGRESS',
        progress: 65,
        score: null,
        completedAt: null,
        certificationRequired: true,
        quizQuestions: 20,
        practicalAssignments: 3
      },
      {
        id: 'intermediate-002',
        title: 'Client Success & Retention Strategies',
        description: 'Proven methodologies for ensuring client success and building long-term partnerships',
        category: 'Client Management',
        level: 'INTERMEDIATE',
        duration: 60,
        prerequisites: ['foundation-001'],
        status: 'NOT_STARTED',
        progress: 0,
        score: null,
        completedAt: null,
        certificationRequired: false,
        quizQuestions: 15,
        practicalAssignments: 2
      },
      {
        id: 'advanced-001',
        title: 'Enterprise Portfolio Optimization',
        description: 'Master advanced portfolio analysis and optimization techniques for enterprise clients',
        category: 'Advanced Implementation',
        level: 'ADVANCED',
        duration: 120,
        prerequisites: ['intermediate-001', 'intermediate-002'],
        status: 'NOT_STARTED',
        progress: 0,
        score: null,
        completedAt: null,
        certificationRequired: true,
        quizQuestions: 25,
        practicalAssignments: 5
      },
      {
        id: 'expert-001',
        title: 'AI-Powered Business Intelligence Mastery',
        description: 'Expert-level training on leveraging AI capabilities for maximum client transformation',
        category: 'AI & Intelligence',
        level: 'EXPERT',
        duration: 180,
        prerequisites: ['advanced-001'],
        status: 'NOT_STARTED',
        progress: 0,
        score: null,
        completedAt: null,
        certificationRequired: true,
        quizQuestions: 30,
        practicalAssignments: 8
      }
    ]

    const mockCertifications: Certification[] = [
      {
        id: 'cert-bronze',
        name: 'CoreFlow360 Certified Consultant',
        level: 'BRONZE',
        requiredModules: ['foundation-001', 'foundation-002'],
        minimumScore: 80,
        validityPeriod: 12,
        status: 'EARNED',
        earnedAt: new Date('2024-02-20'),
        expiresAt: new Date('2025-02-20'),
        benefits: ['10% commission rate', 'Basic support priority', 'Marketing materials access'],
        commissionRate: 10
      },
      {
        id: 'cert-silver',
        name: 'CoreFlow360 Advanced Partner',
        level: 'SILVER',
        requiredModules: ['foundation-001', 'foundation-002', 'intermediate-001', 'intermediate-002'],
        minimumScore: 85,
        validityPeriod: 12,
        status: 'IN_PROGRESS',
        earnedAt: null,
        expiresAt: null,
        benefits: ['15% commission rate', 'Priority support', 'Co-marketing opportunities', 'Advanced sales tools'],
        commissionRate: 15
      },
      {
        id: 'cert-gold',
        name: 'CoreFlow360 Expert Partner',
        level: 'GOLD',
        requiredModules: ['foundation-001', 'foundation-002', 'intermediate-001', 'intermediate-002', 'advanced-001'],
        minimumScore: 90,
        validityPeriod: 18,
        status: 'NOT_STARTED',
        earnedAt: null,
        expiresAt: null,
        benefits: ['20% commission rate', 'Dedicated partner manager', 'Early access to features', 'Training delivery rights'],
        commissionRate: 20
      },
      {
        id: 'cert-platinum',
        name: 'CoreFlow360 Master Partner',
        level: 'PLATINUM',
        requiredModules: ['foundation-001', 'foundation-002', 'intermediate-001', 'intermediate-002', 'advanced-001', 'expert-001'],
        minimumScore: 95,
        validityPeriod: 24,
        status: 'NOT_STARTED',
        earnedAt: null,
        expiresAt: null,
        benefits: ['25% commission rate', 'Strategic partnership tier', 'Product roadmap input', 'White-label options'],
        commissionRate: 25
      }
    ]

    setTrainingModules(mockModules)
    setCertifications(mockCertifications)

    // Calculate progress
    const totalModules = mockModules.length
    const completedModules = mockModules.filter(m => m.status === 'COMPLETED').length
    const totalHours = mockModules.reduce((acc, m) => acc + m.duration, 0) / 60
    const completedHours = mockModules
      .filter(m => m.status === 'COMPLETED')
      .reduce((acc, m) => acc + m.duration, 0) / 60
    const avgScore = mockModules
      .filter(m => m.score !== null)
      .reduce((acc, m) => acc + (m.score || 0), 0) / 
      mockModules.filter(m => m.score !== null).length || 0

    setLearningProgress({
      totalModules,
      completedModules,
      totalHours,
      completedHours,
      currentStreak: 7,
      averageScore: Math.round(avgScore)
    })
  }, [partnerId])

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'FOUNDATION': return 'bg-green-500/20 text-green-400 border-green-400/50'
      case 'INTERMEDIATE': return 'bg-blue-500/20 text-blue-400 border-blue-400/50'
      case 'ADVANCED': return 'bg-purple-500/20 text-purple-400 border-purple-400/50'
      case 'EXPERT': return 'bg-orange-500/20 text-orange-400 border-orange-400/50'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/50'
    }
  }

  const getCertificationColor = (level: string) => {
    switch (level) {
      case 'BRONZE': return 'from-amber-600 to-orange-600'
      case 'SILVER': return 'from-gray-400 to-gray-600'
      case 'GOLD': return 'from-yellow-400 to-amber-500'
      case 'PLATINUM': return 'from-blue-400 to-indigo-500'
      case 'DIAMOND': return 'from-purple-400 to-pink-500'
      default: return 'from-gray-600 to-gray-700'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'EARNED': return 'text-green-400'
      case 'IN_PROGRESS': return 'text-blue-400'
      case 'NOT_STARTED': return 'text-gray-400'
      case 'EXPIRED': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const canAccessModule = (module: TrainingModule) => {
    if (module.prerequisites.length === 0) return true
    return module.prerequisites.every(prereqId => 
      trainingModules.find(m => m.id === prereqId)?.status === 'COMPLETED'
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Training Header */}
      <div className="rounded-2xl border border-gray-700 bg-gradient-to-r from-gray-900 to-black p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Partner Training Academy</h2>
            <p className="text-gray-400">Master CoreFlow360 and advance your partner certification level</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">{learningProgress.averageScore}%</div>
              <div className="text-xs text-gray-400">Avg Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{learningProgress.currentStreak}</div>
              <div className="text-xs text-gray-400">Day Streak</div>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-xl font-bold text-white">
              {learningProgress.completedModules}/{learningProgress.totalModules}
            </div>
            <div className="text-sm text-gray-400">Modules Complete</div>
            <div className="mt-2 h-2 bg-gray-700 rounded-full">
              <div 
                className="h-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                style={{ width: `${(learningProgress.completedModules / learningProgress.totalModules) * 100}%` }}
              />
            </div>
          </div>
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-xl font-bold text-white">
              {learningProgress.completedHours.toFixed(1)}h
            </div>
            <div className="text-sm text-gray-400">Training Hours</div>
            <div className="text-xs text-gray-500 mt-1">
              of {learningProgress.totalHours.toFixed(1)}h total
            </div>
          </div>
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-xl font-bold text-white">
              {certifications.filter(c => c.status === 'EARNED').length}
            </div>
            <div className="text-sm text-gray-400">Certifications</div>
            <div className="text-xs text-gray-500 mt-1">
              of {certifications.length} available
            </div>
          </div>
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-xl font-bold text-white">
              {Math.max(...certifications.filter(c => c.status === 'EARNED').map(c => c.commissionRate), 0)}%
            </div>
            <div className="text-sm text-gray-400">Commission Rate</div>
            <div className="text-xs text-gray-500 mt-1">Current tier</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
        {[
          { id: 'modules', label: 'Training Modules', icon: '📚' },
          { id: 'certifications', label: 'Certifications', icon: '🏆' },
          { id: 'progress', label: 'Learning Progress', icon: '📊' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Training Modules Tab */}
      {activeTab === 'modules' && (
        <div className="space-y-4">
          {['FOUNDATION', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'].map((level) => {
            const levelModules = trainingModules.filter(m => m.level === level)
            if (levelModules.length === 0) return null

            return (
              <div key={level} className="rounded-xl border border-gray-700 bg-gray-900 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getLevelColor(level)}`}>
                    {level}
                  </span>
                  <span>{level} Level Training</span>
                </h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  {levelModules.map((module) => (
                    <motion.div
                      key={module.id}
                      className={`rounded-lg border p-4 cursor-pointer transition-all ${
                        canAccessModule(module)
                          ? 'border-gray-600 bg-black/30 hover:border-gray-500'
                          : 'border-gray-700 bg-gray-800/50 opacity-60'
                      }`}
                      onClick={() => canAccessModule(module) && setSelectedModule(module)}
                      whileHover={canAccessModule(module) ? { scale: 1.02 } : {}}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-1">{module.title}</h4>
                          <p className="text-sm text-gray-400 mb-2">{module.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>⏱️ {module.duration}min</span>
                            <span>❓ {module.quizQuestions} questions</span>
                            <span>📝 {module.practicalAssignments} assignments</span>
                          </div>
                        </div>
                        <div className={`text-2xl ${getStatusColor(module.status)}`}>
                          {module.status === 'COMPLETED' ? '✅' : 
                           module.status === 'IN_PROGRESS' ? '🔄' : '⭕'}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {module.status !== 'NOT_STARTED' && (
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>{module.progress}%</span>
                          </div>
                          <div className="h-2 bg-gray-700 rounded-full">
                            <div 
                              className="h-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                              style={{ width: `${module.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Score Display */}
                      {module.score && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Score:</span>
                          <span className={`font-medium ${
                            module.score >= 90 ? 'text-green-400' : 
                            module.score >= 80 ? 'text-blue-400' : 
                            module.score >= 70 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {module.score}%
                          </span>
                        </div>
                      )}

                      {/* Prerequisites */}
                      {module.prerequisites.length > 0 && !canAccessModule(module) && (
                        <div className="mt-3 text-xs text-gray-500">
                          🔒 Requires: {module.prerequisites.length} prerequisite module(s)
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Certifications Tab */}
      {activeTab === 'certifications' && (
        <div className="grid gap-6 md:grid-cols-2">
          {certifications.map((cert) => (
            <motion.div
              key={cert.id}
              className="rounded-xl border border-gray-700 bg-gray-900 p-6"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`px-4 py-2 rounded-lg bg-gradient-to-r ${getCertificationColor(cert.level)} text-white font-bold`}>
                  {cert.level}
                </div>
                <div className={`text-2xl ${getStatusColor(cert.status)}`}>
                  {cert.status === 'EARNED' ? '🏆' : 
                   cert.status === 'IN_PROGRESS' ? '🔄' : 
                   cert.status === 'EXPIRED' ? '❌' : '⭕'}
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">{cert.name}</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Commission Rate:</span>
                  <span className="font-medium text-green-400">{cert.commissionRate}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Required Modules:</span>
                  <span className="font-medium text-white">{cert.requiredModules.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Minimum Score:</span>
                  <span className="font-medium text-white">{cert.minimumScore}%</span>
                </div>
                {cert.earnedAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Earned:</span>
                    <span className="font-medium text-white">{cert.earnedAt.toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <h4 className="text-sm font-medium text-white">Benefits:</h4>
                <ul className="space-y-1">
                  {cert.benefits.map((benefit, index) => (
                    <li key={index} className="text-xs text-gray-400 flex items-center space-x-2">
                      <span className="text-cyan-400">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {cert.status !== 'EARNED' && (
                <button className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-500 hover:to-cyan-500 transition-all">
                  {cert.status === 'IN_PROGRESS' ? 'Continue Progress' : 'Start Certification Path'}
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Learning Progress Tab */}
      {activeTab === 'progress' && (
        <div className="space-y-6">
          {/* Learning Statistics */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
              <h3 className="text-lg font-bold text-white mb-4">📈 Learning Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Study Time:</span>
                  <span className="text-white font-medium">{learningProgress.completedHours.toFixed(1)}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Average Score:</span>
                  <span className="text-white font-medium">{learningProgress.averageScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Learning Streak:</span>
                  <span className="text-white font-medium">{learningProgress.currentStreak} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Completion Rate:</span>
                  <span className="text-white font-medium">
                    {Math.round((learningProgress.completedModules / learningProgress.totalModules) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
              <h3 className="text-lg font-bold text-white mb-4">🎯 Next Milestones</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-gray-400">Complete Intermediate Training</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                  <span className="text-sm text-gray-400">Earn Silver Certification</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                  <span className="text-sm text-gray-400">Achieve 95% Average Score</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                  <span className="text-sm text-gray-400">Complete Advanced Training</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
              <h3 className="text-lg font-bold text-white mb-4">🚀 Recommendations</h3>
              <div className="space-y-3">
                <div className="bg-black/30 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Focus Area</p>
                  <p className="text-sm text-white">Complete Cross-Business Implementation module</p>
                </div>
                <div className="bg-black/30 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Study Tip</p>
                  <p className="text-sm text-white">Practice with real client scenarios</p>
                </div>
                <div className="bg-black/30 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Goal</p>
                  <p className="text-sm text-white">Aim for Silver certification this month</p>
                </div>
              </div>
            </div>
          </div>

          {/* Module Progress Details */}
          <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
            <h3 className="text-lg font-bold text-white mb-4">📚 Detailed Module Progress</h3>
            <div className="space-y-3">
              {trainingModules.map((module) => (
                <div key={module.id} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className={`text-xl ${getStatusColor(module.status)}`}>
                        {module.status === 'COMPLETED' ? '✅' : 
                         module.status === 'IN_PROGRESS' ? '🔄' : '⭕'}
                      </span>
                      <div>
                        <h4 className="text-sm font-medium text-white">{module.title}</h4>
                        <p className="text-xs text-gray-400">{module.category} • {module.duration}min</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">{module.progress}%</div>
                      {module.score && (
                        <div className="text-xs text-gray-400">Score: {module.score}%</div>
                      )}
                    </div>
                    <div className="w-16 h-2 bg-gray-700 rounded-full">
                      <div 
                        className="h-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                        style={{ width: `${module.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Module Detail Modal */}
      <AnimatePresence>
        {selectedModule && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedModule(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{selectedModule.title}</h3>
                  <p className="text-gray-400">{selectedModule.description}</p>
                </div>
                <button
                  onClick={() => setSelectedModule(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Level:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getLevelColor(selectedModule.level)}`}>
                      {selectedModule.level}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white">{selectedModule.duration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Quiz Questions:</span>
                    <span className="text-white">{selectedModule.quizQuestions}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className={`font-medium ${getStatusColor(selectedModule.status)}`}>
                      {selectedModule.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Progress:</span>
                    <span className="text-white">{selectedModule.progress}%</span>
                  </div>
                  {selectedModule.score && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Score:</span>
                      <span className="text-white">{selectedModule.score}%</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedModule.prerequisites.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-white mb-2">Prerequisites:</h4>
                  <div className="space-y-1">
                    {selectedModule.prerequisites.map((prereqId) => {
                      const prereqModule = trainingModules.find(m => m.id === prereqId)
                      const isCompleted = prereqModule?.status === 'COMPLETED'
                      return (
                        <div key={prereqId} className="flex items-center space-x-2 text-sm">
                          <span className={isCompleted ? 'text-green-400' : 'text-red-400'}>
                            {isCompleted ? '✅' : '❌'}
                          </span>
                          <span className="text-gray-400">{prereqModule?.title || prereqId}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                {selectedModule.status === 'NOT_STARTED' && canAccessModule(selectedModule) && (
                  <button className="flex-1 bg-gradient-to-r from-purple-600 to-cyan-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-500 hover:to-cyan-500 transition-all">
                    Start Module
                  </button>
                )}
                {selectedModule.status === 'IN_PROGRESS' && (
                  <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-500 hover:to-purple-500 transition-all">
                    Continue Learning
                  </button>
                )}
                {selectedModule.status === 'COMPLETED' && (
                  <button className="flex-1 bg-gray-700 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600 transition-all">
                    Review Module
                  </button>
                )}
                {selectedModule.documentUrl && (
                  <button className="bg-gray-700 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600 transition-all">
                    📄 Resources
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PartnerTrainingManager