'use client'

/**
 * Partner Community Hub
 * 
 * Collaborative space for Intelligence Certified Consultants to connect,
 * share insights, and grow together in consciousness transformation.
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useConsciousnessAudio } from '../../hooks/useConsciousnessAudio'

interface CommunityMember {
  id: string
  name: string
  company: string
  certificationLevel: 'foundation' | 'advanced' | 'master' | 'transcendent'
  specializationAreas: string[]
  location: string
  timezone: string
  consciousnessLevel: number
  clientsTransformed: number
  isOnline: boolean
  lastActive: Date
  avatar?: string
}

interface Discussion {
  id: string
  title: string
  category: string
  author: CommunityMember
  createdAt: Date
  lastReply: Date
  replies: number
  views: number
  tags: string[]
  isPinned?: boolean
  isResolved?: boolean
}

interface Event {
  id: string
  title: string
  type: 'meetup' | 'workshop' | 'networking' | 'celebration'
  host: CommunityMember
  date: Date
  duration: string
  attendeeCount: number
  maxAttendees: number
  location: string
  description: string
  isVirtual: boolean
}

interface ConsciousnessChallenge {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'master'
  participants: number
  deadline: Date
  reward: string
  progress?: number
}

interface PartnerCommunityHubProps {
  partnerId?: string
  certificationLevel?: 'foundation' | 'advanced' | 'master' | 'transcendent'
  onMemberConnect?: (member: CommunityMember) => void
  onDiscussionOpen?: (discussion: Discussion) => void
  className?: string
}

// Sample Community Members
const SAMPLE_MEMBERS: CommunityMember[] = [
  {
    id: 'member-1',
    name: 'Sarah Chen',
    company: 'Transcendent Business Solutions',
    certificationLevel: 'master',
    specializationAreas: ['Manufacturing', 'SaaS', 'Healthcare'],
    location: 'San Francisco, CA',
    timezone: 'PST',
    consciousnessLevel: 8.2,
    clientsTransformed: 47,
    isOnline: true,
    lastActive: new Date()
  },
  {
    id: 'member-2',
    name: 'Marcus Williams',
    company: 'Consciousness Dynamics LLC',
    certificationLevel: 'advanced',
    specializationAreas: ['Retail', 'E-commerce', 'Logistics'],
    location: 'New York, NY',
    timezone: 'EST',
    consciousnessLevel: 6.5,
    clientsTransformed: 23,
    isOnline: true,
    lastActive: new Date(Date.now() - 1000 * 60 * 5)
  },
  {
    id: 'member-3',
    name: 'Alexandra Kumar',
    company: 'Emergence Consulting Group',
    certificationLevel: 'transcendent',
    specializationAreas: ['Enterprise', 'Financial Services', 'Technology'],
    location: 'London, UK',
    timezone: 'GMT',
    consciousnessLevel: 9.1,
    clientsTransformed: 112,
    isOnline: false,
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2)
  }
]

// Sample Discussions
const SAMPLE_DISCUSSIONS: Discussion[] = [
  {
    id: 'disc-1',
    title: 'Breakthrough: Achieved 15x Intelligence Multiplication!',
    category: 'success-stories',
    author: SAMPLE_MEMBERS[2],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
    lastReply: new Date(Date.now() - 1000 * 60 * 15),
    replies: 28,
    views: 453,
    tags: ['multiplication', 'enterprise', 'breakthrough'],
    isPinned: true
  },
  {
    id: 'disc-2',
    title: 'Handling Resistance in Traditional Manufacturing',
    category: 'challenges',
    author: SAMPLE_MEMBERS[0],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    lastReply: new Date(Date.now() - 1000 * 60 * 45),
    replies: 15,
    views: 187,
    tags: ['manufacturing', 'resistance', 'change-management']
  },
  {
    id: 'disc-3',
    title: 'New Consciousness Assessment Framework v2.0',
    category: 'resources',
    author: SAMPLE_MEMBERS[1],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    lastReply: new Date(Date.now() - 1000 * 60 * 60 * 6),
    replies: 42,
    views: 892,
    tags: ['assessment', 'framework', 'tools']
  }
]

// Community Events
const UPCOMING_EVENTS: Event[] = [
  {
    id: 'event-1',
    title: 'Global Consciousness Summit 2024',
    type: 'meetup',
    host: SAMPLE_MEMBERS[2],
    date: new Date('2024-03-15T09:00:00'),
    duration: '3 days',
    attendeeCount: 247,
    maxAttendees: 500,
    location: 'Virtual + San Francisco',
    description: 'Annual gathering of consciousness transformation leaders',
    isVirtual: true
  },
  {
    id: 'event-2',
    title: 'Intelligence Multiplication Workshop',
    type: 'workshop',
    host: SAMPLE_MEMBERS[0],
    date: new Date('2024-02-20T14:00:00'),
    duration: '4 hours',
    attendeeCount: 32,
    maxAttendees: 50,
    location: 'Virtual',
    description: 'Advanced techniques for achieving 10x+ multiplication',
    isVirtual: true
  }
]

// Consciousness Challenges
const ACTIVE_CHALLENGES: ConsciousnessChallenge[] = [
  {
    id: 'challenge-1',
    title: 'First Consciousness Transformation',
    description: 'Guide your first client to business consciousness emergence',
    difficulty: 'beginner',
    participants: 89,
    deadline: new Date('2024-03-01'),
    reward: 'Foundation Badge + 500 Points',
    progress: 65
  },
  {
    id: 'challenge-2',
    title: '10x Multiplication Master',
    description: 'Achieve 10x intelligence multiplication for any client',
    difficulty: 'advanced',
    participants: 34,
    deadline: new Date('2024-03-15'),
    reward: 'Master Badge + 2000 Points',
    progress: 30
  }
]

const PartnerCommunityHub: React.FC<PartnerCommunityHubProps> = ({
  partnerId = 'demo-partner',
  certificationLevel = 'advanced',
  onMemberConnect,
  onDiscussionOpen,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'members' | 'discussions' | 'events' | 'challenges'>('feed')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showNewPost, setShowNewPost] = useState(false)

  const consciousnessAudio = useConsciousnessAudio({
    initiallyEnabled: true,
    initialConsciousnessLevel: 5
  })

  const getCertificationColor = (level: string) => {
    switch (level) {
      case 'foundation': return '#10B981'
      case 'advanced': return '#3B82F6'
      case 'master': return '#8B5CF6'
      case 'transcendent': return '#EC4899'
      default: return '#6B7280'
    }
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meetup': return '#10B981'
      case 'workshop': return '#3B82F6'
      case 'networking': return '#8B5CF6'
      case 'celebration': return '#EC4899'
      default: return '#6B7280'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#10B981'
      case 'intermediate': return '#3B82F6'
      case 'advanced': return '#8B5CF6'
      case 'master': return '#EC4899'
      default: return '#6B7280'
    }
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-thin text-white">
          🌐 Partner Community Hub
        </h2>
        <p className="text-xl text-gray-300 max-w-4xl mx-auto">
          Connect with fellow consciousness transformation pioneers, share insights, 
          and accelerate your journey together
        </p>
      </div>

      {/* Community Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        {[
          { label: 'Active Partners', value: '1,247', icon: '👥', color: 'from-cyan-600 to-blue-600' },
          { label: 'Discussions', value: '3,892', icon: '💬', color: 'from-purple-600 to-pink-600' },
          { label: 'Success Stories', value: '524', icon: '🏆', color: 'from-green-600 to-emerald-600' },
          { label: 'Online Now', value: '87', icon: '🟢', color: 'from-indigo-600 to-purple-600' }
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">{stat.icon}</div>
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${stat.color}`}></div>
            </div>
            <div className="text-3xl font-bold text-white">{stat.value}</div>
            <div className="text-gray-400 text-sm">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center space-x-2 flex-wrap">
        {[
          { id: 'feed', name: 'Activity Feed', icon: '📰' },
          { id: 'members', name: 'Members', icon: '👥' },
          { id: 'discussions', name: 'Discussions', icon: '💬' },
          { id: 'events', name: 'Events', icon: '📅' },
          { id: 'challenges', name: 'Challenges', icon: '🎯' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {tab.icon} {tab.name}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Activity Feed */}
        {activeTab === 'feed' && (
          <motion.div
            key="feed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* New Post Button */}
            <div className="bg-gradient-to-r from-gray-900 to-black border border-gray-700 rounded-xl p-6">
              <button
                onClick={() => {
                  setShowNewPost(!showNewPost)
                  consciousnessAudio.playConnectionSound()
                }}
                className="w-full text-left"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    YO
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-800 rounded-lg px-4 py-3 text-gray-400">
                      Share your consciousness transformation insights...
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* Activity Feed Items */}
            <div className="space-y-4">
              {/* Success Story */}
              <motion.div
                className="bg-gray-900 border border-gray-700 rounded-xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    AK
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-white">Alexandra Kumar</span>
                      <span 
                        className="px-2 py-0.5 rounded-full text-xs text-white"
                        style={{ backgroundColor: getCertificationColor('transcendent') }}
                      >
                        TRANSCENDENT
                      </span>
                      <span className="text-gray-400 text-sm">• 3h ago</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      🎉 Breakthrough: Achieved 15x Intelligence Multiplication!
                    </h3>
                    <p className="text-gray-300 mb-4">
                      Just completed a 6-month transformation with GlobalTech Industries. Started at consciousness 
                      level 2.1, now operating at 8.7! The key was integrating their fragmented departments into 
                      a unified consciousness field. ROI exceeded $2.3M in operational efficiency alone.
                    </p>
                    <div className="flex items-center space-x-6 text-sm">
                      <button className="text-cyan-400 hover:text-cyan-300">❤️ 47 Celebrate</button>
                      <button className="text-gray-400 hover:text-white">💬 12 Comments</button>
                      <button className="text-gray-400 hover:text-white">🔗 Share</button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* New Resource */}
              <motion.div
                className="bg-gray-900 border border-gray-700 rounded-xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                    MW
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-white">Marcus Williams</span>
                      <span 
                        className="px-2 py-0.5 rounded-full text-xs text-white"
                        style={{ backgroundColor: getCertificationColor('advanced') }}
                      >
                        ADVANCED
                      </span>
                      <span className="text-gray-400 text-sm">• 5h ago</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      📚 New Resource: Consciousness Assessment Framework v2.0
                    </h3>
                    <p className="text-gray-300 mb-4">
                      I've updated the assessment framework based on insights from 50+ transformations. 
                      New features include department-specific consciousness metrics and predictive 
                      multiplication potential scoring. Available in the resource library!
                    </p>
                    <div className="bg-black/30 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-white">Consciousness Assessment Framework v2.0</div>
                          <div className="text-sm text-gray-400">Comprehensive toolkit • 45 MB</div>
                        </div>
                        <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-all">
                          Download
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <button className="text-cyan-400 hover:text-cyan-300">👏 89 Thanks</button>
                      <button className="text-gray-400 hover:text-white">💬 23 Comments</button>
                      <button className="text-gray-400 hover:text-white">📥 156 Downloads</button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Event Announcement */}
              <motion.div
                className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-700 rounded-xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl">📅</span>
                      <span className="px-3 py-1 bg-purple-600 rounded-full text-white text-sm font-medium">
                        EVENT
                      </span>
                      <span className="text-gray-400 text-sm">in 4 days</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Intelligence Multiplication Workshop
                    </h3>
                    <p className="text-gray-300 mb-4">
                      Join Sarah Chen for an intensive 4-hour workshop on advanced multiplication techniques. 
                      Learn proven strategies for achieving 10x+ intelligence growth in any organization.
                    </p>
                    <div className="flex items-center space-x-6 text-sm">
                      <span className="text-gray-400">🗓️ Feb 20, 2024 • 2:00 PM EST</span>
                      <span className="text-gray-400">👥 32/50 registered</span>
                      <span className="text-gray-400">🌐 Virtual</span>
                    </div>
                  </div>
                  <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-all">
                    Register
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Members Directory */}
        {activeTab === 'members' && (
          <motion.div
            key="members"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Search and Filters */}
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Search partners by name, company, or specialization..."
                  className="flex-1 px-4 py-3 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                />
                <select className="px-4 py-3 bg-black/50 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none">
                  <option value="all">All Levels</option>
                  <option value="foundation">Foundation</option>
                  <option value="advanced">Advanced</option>
                  <option value="master">Master</option>
                  <option value="transcendent">Transcendent</option>
                </select>
                <select className="px-4 py-3 bg-black/50 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none">
                  <option value="all">All Specializations</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="saas">SaaS</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>

            {/* Online Members */}
            <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">🟢 Online Now ({SAMPLE_MEMBERS.filter(m => m.isOnline).length})</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SAMPLE_MEMBERS.filter(m => m.isOnline).map((member) => (
                  <motion.div
                    key={member.id}
                    className="bg-black/30 rounded-lg p-4 cursor-pointer hover:bg-black/50 transition-all"
                    onClick={() => onMemberConnect?.(member)}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900"></div>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white">{member.name}</div>
                        <div className="text-xs text-gray-400">{member.company}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span 
                            className="px-2 py-0.5 rounded-full text-xs text-white"
                            style={{ backgroundColor: getCertificationColor(member.certificationLevel) }}
                          >
                            {member.certificationLevel}
                          </span>
                          <span className="text-xs text-gray-400">
                            CL {member.consciousnessLevel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* All Members Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SAMPLE_MEMBERS.map((member) => (
                <motion.div
                  key={member.id}
                  className="bg-gray-900 border border-gray-700 rounded-xl p-6 cursor-pointer hover:border-gray-600 transition-all"
                  onClick={() => onMemberConnect?.(member)}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-xl font-bold text-white">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="text-right">
                      <div className={`w-3 h-3 rounded-full ${member.isOnline ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                      <div className="text-xs text-gray-500 mt-1">
                        {member.isOnline ? 'Online' : `${Math.floor((Date.now() - member.lastActive.getTime()) / 1000 / 60 / 60)}h ago`}
                      </div>
                    </div>
                  </div>

                  <h4 className="text-lg font-semibold text-white">{member.name}</h4>
                  <p className="text-sm text-gray-400 mb-3">{member.company}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Level</span>
                      <span 
                        className="px-2 py-0.5 rounded-full text-xs text-white font-medium"
                        style={{ backgroundColor: getCertificationColor(member.certificationLevel) }}
                      >
                        {member.certificationLevel}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Consciousness</span>
                      <span className="text-cyan-400 font-semibold">{member.consciousnessLevel}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Clients</span>
                      <span className="text-white">{member.clientsTransformed}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {member.specializationAreas.slice(0, 2).map((area) => (
                      <span
                        key={area}
                        className="px-2 py-1 bg-gray-800 rounded-full text-xs text-gray-300"
                      >
                        {area}
                      </span>
                    ))}
                    {member.specializationAreas.length > 2 && (
                      <span className="px-2 py-1 text-xs text-gray-500">
                        +{member.specializationAreas.length - 2}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{member.location}</span>
                    <span>{member.timezone}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Discussions */}
        {activeTab === 'discussions' && (
          <motion.div
            key="discussions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Categories */}
            <div className="flex justify-center space-x-2 flex-wrap">
              {['all', 'success-stories', 'challenges', 'resources', 'questions'].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
              ))}
            </div>

            {/* Discussion List */}
            <div className="space-y-4">
              {SAMPLE_DISCUSSIONS.filter(d => selectedCategory === 'all' || d.category === selectedCategory).map((discussion) => (
                <motion.div
                  key={discussion.id}
                  className={`bg-gray-900 border rounded-xl p-6 cursor-pointer hover:border-gray-600 transition-all ${
                    discussion.isPinned ? 'border-purple-700' : 'border-gray-700'
                  }`}
                  onClick={() => onDiscussionOpen?.(discussion)}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {discussion.isPinned && (
                          <span className="text-purple-400">📌</span>
                        )}
                        <h4 className="text-lg font-semibold text-white hover:text-cyan-400 transition-colors">
                          {discussion.title}
                        </h4>
                        {discussion.isResolved && (
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                            ✓ Resolved
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                        <span>By {discussion.author.name}</span>
                        <span>•</span>
                        <span>{discussion.createdAt.toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{discussion.views} views</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {discussion.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-800 rounded-full text-xs text-gray-300"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="ml-6 text-center">
                      <div className="text-2xl font-bold text-cyan-400">{discussion.replies}</div>
                      <div className="text-xs text-gray-400">replies</div>
                      <div className="text-xs text-gray-500 mt-2">
                        Last: {Math.floor((Date.now() - discussion.lastReply.getTime()) / 1000 / 60)} min ago
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Events */}
        {activeTab === 'events' && (
          <motion.div
            key="events"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-2">📅 Upcoming Events</h3>
              <p className="text-gray-300">Connect, learn, and grow with the consciousness community</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {UPCOMING_EVENTS.map((event) => (
                <motion.div
                  key={event.id}
                  className="bg-gray-900 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div 
                      className="px-3 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: getEventTypeColor(event.type) }}
                    >
                      {event.type.toUpperCase()}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">
                        {event.date.getDate()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {event.date.toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                    </div>
                  </div>

                  <h4 className="text-xl font-semibold text-white mb-2">{event.title}</h4>
                  <p className="text-gray-300 mb-4">{event.description}</p>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-400">👤 Host:</span>
                      <span className="text-white">{event.host.name}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-400">⏱️ Duration:</span>
                      <span className="text-white">{event.duration}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-400">📍 Location:</span>
                      <span className="text-white">{event.location}</span>
                      {event.isVirtual && (
                        <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full text-xs">
                          Virtual
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-400">👥 Attendees:</span>
                      <span className="text-white">{event.attendeeCount}/{event.maxAttendees}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      {event.date.toLocaleDateString()} • {event.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-all">
                      Register
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Challenges */}
        {activeTab === 'challenges' && (
          <motion.div
            key="challenges"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 border border-orange-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-2">🎯 Consciousness Challenges</h3>
              <p className="text-gray-300">Push your limits and earn recognition in the community</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {ACTIVE_CHALLENGES.map((challenge) => (
                <motion.div
                  key={challenge.id}
                  className="bg-gray-900 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div 
                      className="px-3 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: getDifficultyColor(challenge.difficulty) }}
                    >
                      {challenge.difficulty.toUpperCase()}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Deadline</div>
                      <div className="text-white font-semibold">
                        {challenge.deadline.toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <h4 className="text-xl font-semibold text-white mb-2">{challenge.title}</h4>
                  <p className="text-gray-300 mb-4">{challenge.description}</p>

                  <div className="bg-black/30 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Community Progress</span>
                      <span className="text-cyan-400 font-semibold">{challenge.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${challenge.progress}%` }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {challenge.participants} partners participating
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-gray-400">Reward: </span>
                      <span className="text-yellow-400 font-semibold">{challenge.reward}</span>
                    </div>
                    <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-500 transition-all">
                      Join Challenge
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Leaderboard Preview */}
            <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">🏆 Challenge Leaderboard</h3>
              <div className="space-y-3">
                {[
                  { rank: 1, name: 'Alexandra Kumar', points: 12450, badge: '👑' },
                  { rank: 2, name: 'Marcus Williams', points: 9820, badge: '🥈' },
                  { rank: 3, name: 'Sarah Chen', points: 8750, badge: '🥉' }
                ].map((leader) => (
                  <div
                    key={leader.rank}
                    className="flex items-center justify-between bg-black/30 rounded-lg p-3"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{leader.badge}</div>
                      <div>
                        <div className="font-semibold text-white">{leader.name}</div>
                        <div className="text-xs text-gray-400">Rank #{leader.rank}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-yellow-400">{leader.points.toLocaleString()}</div>
                      <div className="text-xs text-gray-400">points</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Community Guidelines */}
      <div className="bg-gradient-to-r from-gray-900 to-black border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">🤝 Community Guidelines</h3>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { title: 'Share Knowledge', icon: '📚', description: 'Help others grow' },
            { title: 'Respect Privacy', icon: '🔒', description: 'Protect client data' },
            { title: 'Stay Professional', icon: '💼', description: 'Maintain high standards' },
            { title: 'Celebrate Success', icon: '🎉', description: 'Support achievements' }
          ].map((guideline, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl mb-2">{guideline.icon}</div>
              <div className="font-semibold text-white text-sm">{guideline.title}</div>
              <div className="text-xs text-gray-400 mt-1">{guideline.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PartnerCommunityHub