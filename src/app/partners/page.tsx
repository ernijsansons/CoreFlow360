'use client'

/**
 * Partner Portal Page
 * 
 * Central hub for Intelligence Certified Consultants with dashboard,
 * certification programs, resources, training, and community features.
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PartnerPortalDashboard,
  IntelligenceCertificationProgram,
  // PartnerResourceLibrary, // Disabled - missing dependency
  // PartnerTrainingAcademy, // Disabled - missing dependency
  PartnerCommunityHub
} from '../../components/partners'

const PartnerPortalPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'dashboard' | 'certification' | 'resources' | 'training' | 'community'>('dashboard')
  const [partnerData] = useState({
    id: 'partner-123',
    name: 'Sarah Chen',
    certificationLevel: 'advanced' as const,
    consciousnessLevel: 7.5
  })

  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: '🏠', description: 'Your partner hub' },
    { id: 'certification', name: 'Certification', icon: '🎓', description: 'Level up your expertise' },
    { id: 'resources', name: 'Resources', icon: '📚', description: 'Tools & materials' },
    { id: 'training', name: 'Training', icon: '🎯', description: 'Courses & workshops' },
    { id: 'community', name: 'Community', icon: '🌐', description: 'Connect & collaborate' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black">
      {/* Header */}
      <div className="border-b border-gray-700 bg-black/30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-thin text-white">Partner Portal</h1>
              <p className="text-gray-400">Intelligence Certified Consultant Hub</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">
                  {partnerData.certificationLevel.toUpperCase()}
                </div>
                <div className="text-xs text-gray-400">Certification Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {partnerData.consciousnessLevel}
                </div>
                <div className="text-xs text-gray-400">Consciousness Level</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold">
                SC
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-700 bg-black/20">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex space-x-2 overflow-x-auto">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as any)}
                className={`flex items-center space-x-3 px-6 py-3 rounded-lg transition-all whitespace-nowrap ${
                  activeSection === item.id
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
          {activeSection === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <PartnerPortalDashboard
                partnerId={partnerData.id}
                onNavigate={(section) => {
                  // Map navigation targets to sections
                  if (section === 'resources') setActiveSection('resources')
                  else if (section === 'training') setActiveSection('training')
                  else if (section === 'community-hub') setActiveSection('community')
                  else if (section === 'consciousness-toolkit') setActiveSection('resources')
                  else if (section === 'client-portal') setActiveSection('dashboard')
                  else if (section === 'training-academy') setActiveSection('training')
                }}
              />
            </motion.div>
          )}

          {activeSection === 'certification' && (
            <motion.div
              key="certification"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <IntelligenceCertificationProgram
                partnerId={partnerData.id}
                currentLevel={partnerData.certificationLevel}
                onEnroll={(level) => {
                  console.log('Enrolling in:', level)
                  // Handle enrollment
                }}
                onModuleStart={(module) => {
                  console.log('Starting module:', module)
                  // Handle module start
                }}
              />
            </motion.div>
          )}

          {activeSection === 'resources' && (
            <motion.div
              key="resources"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* <PartnerResourceLibrary
                partnerId={partnerData.id}
                certificationLevel={partnerData.certificationLevel}
                onResourceOpen={(resource) => {
                  console.log('Opening resource:', resource)
                  // Handle resource open
                }}
              /> */}
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-12 text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Resource Library</h2>
                <p className="text-gray-400">Resource library temporarily disabled - missing dependencies</p>
              </div>
            </motion.div>
          )}

          {activeSection === 'training' && (
            <motion.div
              key="training"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* <PartnerTrainingAcademy
                partnerId={partnerData.id}
                certificationLevel={partnerData.certificationLevel}
                onCourseEnroll={(course) => {
                  console.log('Enrolling in course:', course)
                  // Handle course enrollment
                }}
                onSessionRegister={(session) => {
                  console.log('Registering for session:', session)
                  // Handle session registration
                }}
              /> */}
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-12 text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Training Academy</h2>
                <p className="text-gray-400">Training academy temporarily disabled - missing dependencies</p>
              </div>
            </motion.div>
          )}

          {activeSection === 'community' && (
            <motion.div
              key="community"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <PartnerCommunityHub
                partnerId={partnerData.id}
                certificationLevel={partnerData.certificationLevel}
                onMemberConnect={(member) => {
                  console.log('Connecting with member:', member)
                  // Handle member connection
                }}
                onDiscussionOpen={(discussion) => {
                  console.log('Opening discussion:', discussion)
                  // Handle discussion open
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Stats Footer */}
      <div className="border-t border-gray-700 bg-black/30 backdrop-blur-xl mt-12">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-cyan-400">1,247</div>
              <div className="text-sm text-gray-400">Active Partners</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">24,892</div>
              <div className="text-sm text-gray-400">Businesses Transformed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">$127M</div>
              <div className="text-sm text-gray-400">Total Partner Revenue</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-400">8.4</div>
              <div className="text-sm text-gray-400">Avg Consciousness Level</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PartnerPortalPage