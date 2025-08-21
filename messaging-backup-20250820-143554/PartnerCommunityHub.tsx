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
    lastActive: new Date(),
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
    lastActive: new Date(Date.now() - 1000 * 60 * 5),
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
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
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
    isPinned: true,
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
    tags: ['manufacturing', 'resistance', 'change-management'],
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
    tags: ['assessment', 'framework', 'tools'],
  },
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
    isVirtual: true,
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
    isVirtual: true,
  },
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
    progress: 65,
  },
  {
    id: 'challenge-2',
    title: '10x Multiplication Master',
    description: 'Achieve 10x intelligence multiplication for any client',
    difficulty: 'advanced',
    participants: 34,
    deadline: new Date('2024-03-15'),
    reward: 'Master Badge + 2000 Points',
    progress: 30,
  },
]

const PartnerCommunityHub: React.FC<PartnerCommunityHubProps> = ({
  partnerId = 'demo-partner',
  certificationLevel = 'advanced',
  onMemberConnect,
  onDiscussionOpen,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<
    'feed' | 'members' | 'discussions' | 'events' | 'challenges'
  >('feed')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showNewPost, setShowNewPost] = useState(false)

  const consciousnessAudio = useConsciousnessAudio({
    initiallyEnabled: true,
    initialConsciousnessLevel: 5,
  })

  const getCertificationColor = (level: string) => {
    switch (level) {
      case 'foundation':
        return '#10B981'
      case 'advanced':
        return '#3B82F6'
      case 'master':
        return '#8B5CF6'
      case 'transcendent':
        return '#EC4899'
      default:
        return '#6B7280'
    }
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meetup':
        return '#10B981'
      case 'workshop':
        return '#3B82F6'
      case 'networking':
        return '#8B5CF6'
      case 'celebration':
        return '#EC4899'
      default:
        return '#6B7280'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '#10B981'
      case 'intermediate':
        return '#3B82F6'
      case 'advanced':
        return '#8B5CF6'
      case 'master':
        return '#EC4899'
      default:
        return '#6B7280'
    }
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="space-y-4 text-center">
        <h2 className="text-4xl font-thin text-white">🌐 Partner Community Hub</h2>
        <p className="mx-auto max-w-4xl text-xl text-gray-300">
          Connect with fellow consciousness transformation pioneers, share insights, and accelerate
          your journey together
        </p>
      </div>

      {/* Community Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        {[
          {
            label: 'Active Partners',
            value: '1,247',
            icon: '👥',
            color: 'from-cyan-600 to-blue-600',
          },
          {
            label: 'Discussions',
            value: '3,892',
            icon: '💬',
            color: 'from-purple-600 to-pink-600',
          },
          {
            label: 'Success Stories',
            value: '524',
            icon: '🏆',
            color: 'from-green-600 to-emerald-600',
          },
          { label: 'Online Now', value: '87', icon: '🟢', color: 'from-indigo-600 to-purple-600' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-xl border border-gray-700 bg-gradient-to-br from-gray-900 to-black p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="text-3xl">{stat.icon}</div>
              <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${stat.color}`}></div>
            </div>
            <div className="text-3xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-gray-400">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap justify-center space-x-2">
        {[
          { id: 'feed', name: 'Activity Feed', icon: '📰' },
          { id: 'members', name: 'Members', icon: '👥' },
          { id: 'discussions', name: 'Discussions', icon: '💬' },
          { id: 'events', name: 'Events', icon: '📅' },
          { id: 'challenges', name: 'Challenges', icon: '🎯' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as unknown)}
            className={`rounded-lg px-4 py-2 font-medium transition-all ${
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
            <div className="rounded-xl border border-gray-700 bg-gradient-to-r from-gray-900 to-black p-6">
              <button
                onClick={() => {
                  setShowNewPost(!showNewPost)
                  consciousnessAudio.playConnectionSound()
                }}
                className="w-full text-left"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 font-bold text-white">
                    YO
                  </div>
                  <div className="flex-1">
                    <div className="rounded-lg bg-gray-800 px-4 py-3 text-gray-400">
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
                className="rounded-xl border border-gray-700 bg-gray-900 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 font-bold text-white">
                    AK
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 flex items-center space-x-2">
                      <span className="font-semibold text-white">Alexandra Kumar</span>
                      <span
                        className="rounded-full px-2 py-0.5 text-xs text-white"
                        style={{ backgroundColor: getCertificationColor('transcendent') }}
                      >
                        TRANSCENDENT
                      </span>
                      <span className="text-sm text-gray-400">• 3h ago</span>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-white">
                      🎉 Breakthrough: Achieved 15x Intelligence Multiplication!
                    </h3>
                    <p className="mb-4 text-gray-300">
                      Just completed a 6-month transformation with GlobalTech Industries. Started at
                      consciousness level 2.1, now operating at 8.7! The key was integrating their
                      fragmented departments into a unified consciousness field. ROI exceeded $2.3M
                      in operational efficiency alone.
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
                className="rounded-xl border border-gray-700 bg-gray-900 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 font-bold text-white">
                    MW
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 flex items-center space-x-2">
                      <span className="font-semibold text-white">Marcus Williams</span>
                      <span
                        className="rounded-full px-2 py-0.5 text-xs text-white"
                        style={{ backgroundColor: getCertificationColor('advanced') }}
                      >
                        ADVANCED
                      </span>
                      <span className="text-sm text-gray-400">• 5h ago</span>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-white">
                      📚 New Resource: Consciousness Assessment Framework v2.0
                    </h3>
                    <p className="mb-4 text-gray-300">
                      I've updated the assessment framework based on insights from 50+
                      transformations. New features include department-specific consciousness
                      metrics and predictive multiplication potential scoring. Available in the
                      resource library!
                    </p>
                    <div className="mb-4 rounded-lg bg-black/30 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-white">
                            Consciousness Assessment Framework v2.0
                          </div>
                          <div className="text-sm text-gray-400">Comprehensive toolkit • 45 MB</div>
                        </div>
                        <button className="rounded-lg bg-cyan-600 px-4 py-2 text-white transition-all hover:bg-cyan-500">
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
                className="rounded-xl border border-purple-700 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-3 flex items-center space-x-3">
                      <span className="text-2xl">📅</span>
                      <span className="rounded-full bg-purple-600 px-3 py-1 text-sm font-medium text-white">
                        EVENT
                      </span>
                      <span className="text-sm text-gray-400">in 4 days</span>
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-white">
                      Intelligence Multiplication Workshop
                    </h3>
                    <p className="mb-4 text-gray-300">
                      Join Sarah Chen for an intensive 4-hour workshop on advanced multiplication
                      techniques. Learn proven strategies for achieving 10x+ intelligence growth in
                      any organization.
                    </p>
                    <div className="flex items-center space-x-6 text-sm">
                      <span className="text-gray-400">🗓️ Feb 20, 2024 • 2:00 PM EST</span>
                      <span className="text-gray-400">👥 32/50 registered</span>
                      <span className="text-gray-400">🌐 Virtual</span>
                    </div>
                  </div>
                  <button className="rounded-lg bg-purple-600 px-6 py-3 text-white transition-all hover:bg-purple-500">
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
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
              <div className="flex flex-col gap-4 md:flex-row">
                <input
                  type="text"
                  placeholder="Search partners by name, company, or specialization..."
                  className="flex-1 rounded-lg border border-gray-600 bg-black/50 px-4 py-3 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                />
                <select className="rounded-lg border border-gray-600 bg-black/50 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none">
                  <option value="all">All Levels</option>
                  <option value="foundation">Foundation</option>
                  <option value="advanced">Advanced</option>
                  <option value="master">Master</option>
                  <option value="transcendent">Transcendent</option>
                </select>
                <select className="rounded-lg border border-gray-600 bg-black/50 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none">
                  <option value="all">All Specializations</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="saas">SaaS</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>

            {/* Online Members */}
            <div className="rounded-xl border border-green-700 bg-gradient-to-r from-green-900/30 to-emerald-900/30 p-6">
              <h3 className="mb-4 text-lg font-bold text-white">
                🟢 Online Now ({SAMPLE_MEMBERS.filter((m) => m.isOnline).length})
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {SAMPLE_MEMBERS.filter((m) => m.isOnline).map((member) => (
                  <motion.div
                    key={member.id}
                    className="cursor-pointer rounded-lg bg-black/30 p-4 transition-all hover:bg-black/50"
                    onClick={() => onMemberConnect?.(member)}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 font-bold text-white">
                          {member.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div className="absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 border-gray-900 bg-green-400"></div>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white">{member.name}</div>
                        <div className="text-xs text-gray-400">{member.company}</div>
                        <div className="mt-1 flex items-center space-x-2">
                          <span
                            className="rounded-full px-2 py-0.5 text-xs text-white"
                            style={{
                              backgroundColor: getCertificationColor(member.certificationLevel),
                            }}
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {SAMPLE_MEMBERS.map((member) => (
                <motion.div
                  key={member.id}
                  className="cursor-pointer rounded-xl border border-gray-700 bg-gray-900 p-6 transition-all hover:border-gray-600"
                  onClick={() => onMemberConnect?.(member)}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 text-xl font-bold text-white">
                      {member.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div className="text-right">
                      <div
                        className={`h-3 w-3 rounded-full ${member.isOnline ? 'bg-green-400' : 'bg-gray-500'}`}
                      ></div>
                      <div className="mt-1 text-xs text-gray-500">
                        {member.isOnline
                          ? 'Online'
                          : `${Math.floor((Date.now() - member.lastActive.getTime()) / 1000 / 60 / 60)}h ago`}
                      </div>
                    </div>
                  </div>

                  <h4 className="text-lg font-semibold text-white">{member.name}</h4>
                  <p className="mb-3 text-sm text-gray-400">{member.company}</p>

                  <div className="mb-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Level</span>
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                        style={{
                          backgroundColor: getCertificationColor(member.certificationLevel),
                        }}
                      >
                        {member.certificationLevel}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Consciousness</span>
                      <span className="font-semibold text-cyan-400">
                        {member.consciousnessLevel}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Clients</span>
                      <span className="text-white">{member.clientsTransformed}</span>
                    </div>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2">
                    {member.specializationAreas.slice(0, 2).map((area) => (
                      <span
                        key={area}
                        className="rounded-full bg-gray-800 px-2 py-1 text-xs text-gray-300"
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
            <div className="flex flex-wrap justify-center space-x-2">
              {['all', 'success-stories', 'challenges', 'resources', 'questions'].map(
                (category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? 'bg-cyan-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {category
                      .split('-')
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(' ')}
                  </button>
                )
              )}
            </div>

            {/* Discussion List */}
            <div className="space-y-4">
              {SAMPLE_DISCUSSIONS.filter(
                (d) => selectedCategory === 'all' || d.category === selectedCategory
              ).map((discussion) => (
                <motion.div
                  key={discussion.id}
                  className={`cursor-pointer rounded-xl border bg-gray-900 p-6 transition-all hover:border-gray-600 ${
                    discussion.isPinned ? 'border-purple-700' : 'border-gray-700'
                  }`}
                  onClick={() => onDiscussionOpen?.(discussion)}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center space-x-3">
                        {discussion.isPinned && <span className="text-purple-400">📌</span>}
                        <h4 className="text-lg font-semibold text-white transition-colors hover:text-cyan-400">
                          {discussion.title}
                        </h4>
                        {discussion.isResolved && (
                          <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400">
                            ✓ Resolved
                          </span>
                        )}
                      </div>

                      <div className="mb-3 flex items-center space-x-4 text-sm text-gray-400">
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
                            className="rounded-full bg-gray-800 px-2 py-1 text-xs text-gray-300"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="ml-6 text-center">
                      <div className="text-2xl font-bold text-cyan-400">{discussion.replies}</div>
                      <div className="text-xs text-gray-400">replies</div>
                      <div className="mt-2 text-xs text-gray-500">
                        Last:{' '}
                        {Math.floor((Date.now() - discussion.lastReply.getTime()) / 1000 / 60)} min
                        ago
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
            <div className="rounded-xl border border-purple-700 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 p-6">
              <h3 className="mb-2 text-xl font-bold text-white">📅 Upcoming Events</h3>
              <p className="text-gray-300">
                Connect, learn, and grow with the consciousness community
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {UPCOMING_EVENTS.map((event) => (
                <motion.div
                  key={event.id}
                  className="rounded-xl border border-gray-700 bg-gray-900 p-6 transition-all hover:border-gray-600"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div
                      className="rounded-full px-3 py-1 text-xs font-medium text-white"
                      style={{ backgroundColor: getEventTypeColor(event.type) }}
                    >
                      {event.type.toUpperCase()}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">{event.date.getDate()}</div>
                      <div className="text-xs text-gray-400">
                        {event.date.toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                    </div>
                  </div>

                  <h4 className="mb-2 text-xl font-semibold text-white">{event.title}</h4>
                  <p className="mb-4 text-gray-300">{event.description}</p>

                  <div className="mb-6 space-y-2">
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
                        <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-xs text-cyan-400">
                          Virtual
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-400">👥 Attendees:</span>
                      <span className="text-white">
                        {event.attendeeCount}/{event.maxAttendees}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      {event.date.toLocaleDateString()} •{' '}
                      {event.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <button className="rounded-lg bg-purple-600 px-4 py-2 text-white transition-all hover:bg-purple-500">
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
            <div className="rounded-xl border border-orange-700 bg-gradient-to-r from-orange-900/30 to-red-900/30 p-6">
              <h3 className="mb-2 text-xl font-bold text-white">🎯 Consciousness Challenges</h3>
              <p className="text-gray-300">
                Push your limits and earn recognition in the community
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {ACTIVE_CHALLENGES.map((challenge) => (
                <motion.div
                  key={challenge.id}
                  className="rounded-xl border border-gray-700 bg-gray-900 p-6 transition-all hover:border-gray-600"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div
                      className="rounded-full px-3 py-1 text-xs font-medium text-white"
                      style={{ backgroundColor: getDifficultyColor(challenge.difficulty) }}
                    >
                      {challenge.difficulty.toUpperCase()}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Deadline</div>
                      <div className="font-semibold text-white">
                        {challenge.deadline.toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <h4 className="mb-2 text-xl font-semibold text-white">{challenge.title}</h4>
                  <p className="mb-4 text-gray-300">{challenge.description}</p>

                  <div className="mb-4 rounded-lg bg-black/30 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-gray-400">Community Progress</span>
                      <span className="font-semibold text-cyan-400">{challenge.progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-700">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all"
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
                      <span className="font-semibold text-yellow-400">{challenge.reward}</span>
                    </div>
                    <button className="rounded-lg bg-orange-600 px-4 py-2 text-white transition-all hover:bg-orange-500">
                      Join Challenge
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Leaderboard Preview */}
            <div className="rounded-xl border border-yellow-700 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 p-6">
              <h3 className="mb-4 text-xl font-bold text-white">🏆 Challenge Leaderboard</h3>
              <div className="space-y-3">
                {[
                  { rank: 1, name: 'Alexandra Kumar', points: 12450, badge: '👑' },
                  { rank: 2, name: 'Marcus Williams', points: 9820, badge: '🥈' },
                  { rank: 3, name: 'Sarah Chen', points: 8750, badge: '🥉' },
                ].map((leader) => (
                  <div
                    key={leader.rank}
                    className="flex items-center justify-between rounded-lg bg-black/30 p-3"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{leader.badge}</div>
                      <div>
                        <div className="font-semibold text-white">{leader.name}</div>
                        <div className="text-xs text-gray-400">Rank #{leader.rank}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-yellow-400">
                        {leader.points.toLocaleString()}
                      </div>
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
      <div className="rounded-xl border border-gray-700 bg-gradient-to-r from-gray-900 to-black p-6">
        <h3 className="mb-4 text-lg font-bold text-white">🤝 Community Guidelines</h3>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { title: 'Share Knowledge', icon: '📚', description: 'Help others grow' },
            { title: 'Respect Privacy', icon: '🔒', description: 'Protect client data' },
            { title: 'Stay Professional', icon: '💼', description: 'Maintain high standards' },
            { title: 'Celebrate Success', icon: '🎉', description: 'Support achievements' },
          ].map((guideline, index) => (
            <div key={index} className="text-center">
              <div className="mb-2 text-3xl">{guideline.icon}</div>
              <div className="text-sm font-semibold text-white">{guideline.title}</div>
              <div className="mt-1 text-xs text-gray-400">{guideline.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PartnerCommunityHub
