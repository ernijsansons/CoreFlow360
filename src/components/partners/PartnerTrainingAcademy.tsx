'use client'

/**
 * Partner Training Academy
 *
 * Comprehensive training platform for consciousness transformation consultants
 * with interactive courses, live sessions, and certification pathways.
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// TODO: Re-enable Three.js when peer dependencies are resolved
// import { Canvas, useFrame } from '@react-three/fiber'
// import { Sphere, Box, Text3D } from '@react-three/drei'
// import * as THREE from 'three'

interface Course {
  id: string
  title: string
  instructor: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'master'
  duration: string
  modules: number
  enrolledCount: number
  rating: number
  category: string
  description: string
  skills: string[]
  prerequisites: string[]
  certificateAwarded: boolean
  price: number
  status: 'available' | 'enrolled' | 'completed' | 'locked'
  progress?: number
  nextSession?: Date
  consciousnessLevel: number
}

interface TrainingPath {
  id: string
  name: string
  description: string
  courses: string[]
  duration: string
  certification: string
  icon: string
  color: string
}

interface LiveSession {
  id: string
  title: string
  instructor: string
  date: Date
  duration: string
  attendees: number
  maxAttendees: number
  type: 'workshop' | 'masterclass' | 'q&a' | 'case-review'
  level: string
  description: string
  registrationOpen: boolean
}

interface PartnerTrainingAcademyProps {
  partnerId?: string
  certificationLevel?: 'foundation' | 'advanced' | 'master' | 'transcendent'
  onCourseEnroll?: (course: Course) => void
  onSessionRegister?: (session: LiveSession) => void
  className?: string
}

// Training Paths
const TRAINING_PATHS: TrainingPath[] = [
  {
    id: 'consciousness-fundamentals',
    name: 'Consciousness Fundamentals',
    description: 'Master the basics of business consciousness transformation',
    courses: ['intro-consciousness', 'assessment-basics', 'first-transformation'],
    duration: '4 weeks',
    certification: 'Foundation',
    icon: '🌱',
    color: '#10B981',
  },
  {
    id: 'intelligence-multiplication',
    name: 'Intelligence Multiplication',
    description: 'Learn to multiply business intelligence exponentially',
    courses: ['multiplication-theory', 'synergy-creation', 'roi-optimization'],
    duration: '8 weeks',
    certification: 'Advanced',
    icon: '⚡',
    color: '#3B82F6',
  },
  {
    id: 'enterprise-transformation',
    name: 'Enterprise Transformation',
    description: 'Architect consciousness for complex organizations',
    courses: ['enterprise-strategy', 'change-management', 'executive-coaching'],
    duration: '12 weeks',
    certification: 'Master',
    icon: '🎯',
    color: '#8B5CF6',
  },
  {
    id: 'consciousness-mastery',
    name: 'Consciousness Mastery',
    description: 'Achieve transcendent business transformation capabilities',
    courses: ['reality-shaping', 'field-creation', 'organism-design'],
    duration: '16 weeks',
    certification: 'Transcendent',
    icon: '✨',
    color: '#EC4899',
  },
]

// Sample Courses
const SAMPLE_COURSES: Course[] = [
  {
    id: 'intro-consciousness',
    title: 'Introduction to Business Consciousness',
    instructor: 'Dr. Sarah Chen',
    level: 'beginner',
    duration: '6 hours',
    modules: 8,
    enrolledCount: 1247,
    rating: 4.8,
    category: 'fundamentals',
    description: 'Understand the revolutionary principles of business consciousness transformation',
    skills: [
      'Consciousness assessment',
      'Linear vs exponential thinking',
      'Basic transformation planning',
    ],
    prerequisites: [],
    certificateAwarded: true,
    price: 497,
    status: 'completed',
    progress: 100,
    consciousnessLevel: 1,
  },
  {
    id: 'multiplication-theory',
    title: 'Intelligence Multiplication Theory & Practice',
    instructor: 'Marcus Williams',
    level: 'intermediate',
    duration: '12 hours',
    modules: 15,
    enrolledCount: 892,
    rating: 4.9,
    category: 'advanced',
    description: 'Master the mathematics and methodology of intelligence multiplication',
    skills: ['Multiplication formulas', 'Synergy identification', 'Department integration'],
    prerequisites: ['Introduction to Business Consciousness'],
    certificateAwarded: true,
    price: 997,
    status: 'enrolled',
    progress: 65,
    consciousnessLevel: 3,
  },
  {
    id: 'enterprise-strategy',
    title: 'Enterprise Consciousness Architecture',
    instructor: 'Alexandra Kumar',
    level: 'advanced',
    duration: '20 hours',
    modules: 25,
    enrolledCount: 324,
    rating: 5.0,
    category: 'enterprise',
    description: 'Design and implement consciousness transformation for large organizations',
    skills: ['Enterprise assessment', 'Multi-department orchestration', 'Executive alignment'],
    prerequisites: ['Intelligence Multiplication Theory', 'Advanced Assessment'],
    certificateAwarded: true,
    price: 1997,
    status: 'available',
    consciousnessLevel: 5,
  },
  {
    id: 'reality-shaping',
    title: 'Reality-Shaping Business Methodologies',
    instructor: 'Dr. James Foster',
    level: 'master',
    duration: '30 hours',
    modules: 35,
    enrolledCount: 87,
    rating: 5.0,
    category: 'transcendent',
    description: 'Transcendent techniques for reshaping business reality',
    skills: ['Consciousness field creation', 'Reality modification', 'Transcendent leadership'],
    prerequisites: ['Master certification', '50+ transformations'],
    certificateAwarded: true,
    price: 4997,
    status: 'locked',
    consciousnessLevel: 8,
  },
]

// Live Sessions
const LIVE_SESSIONS: LiveSession[] = [
  {
    id: 'weekly-consciousness-clinic',
    title: 'Weekly Consciousness Clinic',
    instructor: 'Dr. Sarah Chen',
    date: new Date('2024-02-15T18:00:00'),
    duration: '90 min',
    attendees: 47,
    maxAttendees: 100,
    type: 'q&a',
    level: 'All Levels',
    description: 'Bring your client challenges for expert guidance',
    registrationOpen: true,
  },
  {
    id: 'multiplication-masterclass',
    title: 'Advanced Multiplication Strategies',
    instructor: 'Marcus Williams',
    date: new Date('2024-02-20T19:00:00'),
    duration: '2 hours',
    attendees: 28,
    maxAttendees: 50,
    type: 'masterclass',
    level: 'Advanced',
    description: 'Deep dive into complex multiplication scenarios',
    registrationOpen: true,
  },
  {
    id: 'transformation-workshop',
    title: 'Transformation Planning Workshop',
    instructor: 'Alexandra Kumar',
    date: new Date('2024-02-18T16:00:00'),
    duration: '3 hours',
    attendees: 35,
    maxAttendees: 40,
    type: 'workshop',
    level: 'Intermediate',
    description: 'Hands-on workshop for transformation roadmapping',
    registrationOpen: true,
  },
]

// Simplified Course Visualization (CSS-based)
const CourseVisualization: React.FC<{ progress: number; level: string }> = ({
  progress,
  level,
}) => {
  // TODO: Re-enable 3D when Three.js is available
  // const meshRef = React.useRef<THREE.Mesh>(null)

  // useFrame((state) => {
  //   if (meshRef.current) {
  //     meshRef.current.rotation.y += 0.01
  //     meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.05)
  //   }
  // })

  const getColor = () => {
    switch (level) {
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
    <div className="relative mx-auto h-24 w-24">
      <motion.div
        className="flex h-full w-full items-center justify-center rounded-full border-4 text-xl font-bold text-white"
        style={{ backgroundColor: getColor(), borderColor: getColor() }}
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      >
        {Math.round(progress)}%
      </motion.div>
      {/* Progress Ring */}
      <div
        className="absolute inset-0 rounded-full border-4 border-cyan-400"
        style={{
          background: `conic-gradient(from 0deg, #06B6D4 ${progress * 3.6}deg, transparent ${progress * 3.6}deg)`,
          borderImage: `conic-gradient(from 0deg, #06B6D4 ${progress * 3.6}deg, transparent ${progress * 3.6}deg) 1`,
        }}
      />
    </div>
  )
}

const PartnerTrainingAcademy: React.FC<PartnerTrainingAcademyProps> = ({
  partnerId = 'demo-partner',
  certificationLevel = 'advanced',
  onCourseEnroll,
  onSessionRegister,
  className = '',
}) => {
  const [activeView, setActiveView] = useState<'dashboard' | 'courses' | 'paths' | 'live'>(
    'dashboard'
  )
  const [selectedPath, setSelectedPath] = useState<TrainingPath | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [learningStats, setLearningStats] = useState({
    coursesCompleted: 12,
    hoursLearned: 156,
    certificatesEarned: 3,
    currentStreak: 7,
  })

  const getLevelColor = (level: string) => {
    switch (level) {
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

  const getStatusColor = (_status: string) => {
    switch (status) {
      case 'completed':
        return '#10B981'
      case 'enrolled':
        return '#3B82F6'
      case 'available':
        return '#6B7280'
      case 'locked':
        return '#EF4444'
      default:
        return '#6B7280'
    }
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="space-y-4 text-center">
        <h2 className="text-4xl font-thin text-white">🎓 Partner Training Academy</h2>
        <p className="mx-auto max-w-4xl text-xl text-gray-300">
          Master the art and science of consciousness transformation through interactive courses,
          live sessions, and expert guidance
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center space-x-2">
        {[
          { id: 'dashboard', name: 'Dashboard', icon: '📊' },
          { id: 'paths', name: 'Learning Paths', icon: '🛤️' },
          { id: 'courses', name: 'All Courses', icon: '📚' },
          { id: 'live', name: 'Live Sessions', icon: '🔴' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as unknown)}
            className={`rounded-lg px-6 py-3 font-medium transition-all ${
              activeView === tab.id
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {tab.icon} {tab.name}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Learning Stats */}
            <div className="grid gap-6 md:grid-cols-4">
              {[
                {
                  label: 'Courses Completed',
                  value: learningStats.coursesCompleted,
                  icon: '✅',
                  color: 'from-green-600 to-emerald-600',
                },
                {
                  label: 'Hours Learned',
                  value: learningStats.hoursLearned,
                  icon: '⏱️',
                  color: 'from-blue-600 to-cyan-600',
                },
                {
                  label: 'Certificates',
                  value: learningStats.certificatesEarned,
                  icon: '🏆',
                  color: 'from-purple-600 to-pink-600',
                },
                {
                  label: 'Learning Streak',
                  value: `${learningStats.currentStreak} days`,
                  icon: '🔥',
                  color: 'from-orange-600 to-red-600',
                },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-xl border border-gray-700 bg-gray-900 p-6"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="text-3xl">{stat.icon}</div>
                    <div
                      className={`rounded-lg bg-gradient-to-r px-3 py-1 ${stat.color} text-xs font-medium text-white`}
                    >
                      Active
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Current Courses */}
            <div className="rounded-2xl border border-gray-700 bg-gradient-to-r from-gray-900 to-black p-6">
              <h3 className="mb-6 text-xl font-bold text-white">📖 Continue Learning</h3>
              <div className="grid gap-6 md:grid-cols-2">
                {SAMPLE_COURSES.filter((c) => c.status === 'enrolled').map((course) => (
                  <div
                    key={course.id}
                    className="rounded-xl border border-gray-700 bg-black/30 p-6"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="h-24 w-24">
                        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                          <ambientLight intensity={0.5} />
                          <pointLight position={[10, 10, 10]} />
                          <CourseVisualization
                            progress={course.progress || 0}
                            level={course.level}
                          />
                        </Canvas>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-cyan-400">{course.progress}%</div>
                        <div className="text-xs text-gray-400">Complete</div>
                      </div>
                    </div>
                    <h4 className="mb-2 text-lg font-semibold text-white">{course.title}</h4>
                    <p className="mb-4 text-sm text-gray-400">Instructor: {course.instructor}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {course.modules} modules • {course.duration}
                      </div>
                      <button className="rounded-lg bg-cyan-600 px-4 py-2 text-white transition-all hover:bg-cyan-500">
                        Continue →
                      </button>
                    </div>
                    {/* Progress Bar */}
                    <div className="mt-4 h-2 w-full rounded-full bg-gray-700">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Live Sessions */}
            <div className="rounded-2xl border border-gray-700 bg-gray-900 p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">🔴 Upcoming Live Sessions</h3>
                <button
                  onClick={() => setActiveView('live')}
                  className="text-sm text-cyan-400 hover:text-cyan-300"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-4">
                {LIVE_SESSIONS.slice(0, 2).map((session) => (
                  <div
                    key={session.id}
                    className="rounded-lg border border-gray-700 bg-black/30 p-4 transition-all hover:border-gray-600"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-white">{session.title}</h4>
                        <p className="text-sm text-gray-400">
                          {session.instructor} • {session.date.toLocaleDateString()} at{' '}
                          {session.date.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => onSessionRegister?.(session)}
                        className="rounded-lg bg-purple-600 px-4 py-2 text-white transition-all hover:bg-purple-500"
                      >
                        Register
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Learning Paths View */}
        {activeView === 'paths' && (
          <motion.div
            key="paths"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="grid gap-8 md:grid-cols-2">
              {TRAINING_PATHS.map((path) => (
                <motion.div
                  key={path.id}
                  className="cursor-pointer rounded-2xl border border-gray-700 bg-gradient-to-br from-gray-900 to-black p-8 transition-all hover:border-gray-600"
                  onClick={() => setSelectedPath(path)}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="mb-6 flex items-start justify-between">
                    <div className="text-5xl">{path.icon}</div>
                    <div
                      className="rounded-full px-3 py-1 text-sm font-medium text-white"
                      style={{ backgroundColor: path.color }}
                    >
                      {path.certification}
                    </div>
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-white">{path.name}</h3>
                  <p className="mb-6 text-gray-300">{path.description}</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Duration</span>
                      <span className="font-semibold text-white">{path.duration}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Courses</span>
                      <span className="font-semibold text-white">
                        {path.courses.length} courses
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Certification</span>
                      <span className="font-semibold text-white">{path.certification} Level</span>
                    </div>
                  </div>
                  <motion.button
                    className="mt-6 w-full rounded-lg py-3 font-semibold text-white transition-all"
                    style={{ backgroundColor: path.color }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Explore Path →
                  </motion.button>
                </motion.div>
              ))}
            </div>

            {/* Selected Path Details */}
            {selectedPath && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-purple-700 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 p-8"
              >
                <h3 className="mb-6 text-2xl font-bold text-white">
                  {selectedPath.icon} {selectedPath.name} - Course Sequence
                </h3>
                <div className="space-y-4">
                  {selectedPath.courses.map((courseId, index) => {
                    const course = SAMPLE_COURSES.find((c) => c.id === courseId)
                    if (!course) return null
                    return (
                      <div
                        key={courseId}
                        className="flex items-center space-x-4 rounded-lg bg-black/30 p-4"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-600 font-bold text-white">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">{course.title}</h4>
                          <p className="text-sm text-gray-400">
                            {course.duration} • {course.modules} modules
                          </p>
                        </div>
                        <div
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            course.status === 'completed'
                              ? 'bg-green-500/20 text-green-400'
                              : course.status === 'enrolled'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-gray-700 text-gray-400'
                          }`}
                        >
                          {course.status}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* All Courses View */}
        {activeView === 'courses' && (
          <motion.div
            key="courses"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Category Filter */}
            <div className="flex justify-center space-x-2">
              {['all', 'fundamentals', 'advanced', 'enterprise', 'transcendent'].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>

            {/* Courses Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {SAMPLE_COURSES.filter(
                (c) => selectedCategory === 'all' || c.category === selectedCategory
              ).map((course) => (
                <motion.div
                  key={course.id}
                  className="rounded-xl border border-gray-700 bg-gray-900 p-6 transition-all hover:border-gray-600"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: getLevelColor(course.level) }}
                      />
                      <span className="text-xs text-gray-400 uppercase">{course.level}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-400">★</span>
                      <span className="font-semibold text-white">{course.rating}</span>
                    </div>
                  </div>

                  <h4 className="mb-2 text-lg font-semibold text-white">{course.title}</h4>
                  <p className="mb-1 text-sm text-gray-400">By {course.instructor}</p>
                  <p className="mb-4 text-sm text-gray-300">{course.description}</p>

                  <div className="mb-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Duration</span>
                      <span className="text-white">{course.duration}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Modules</span>
                      <span className="text-white">{course.modules}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Enrolled</span>
                      <span className="text-white">{course.enrolledCount.toLocaleString()}</span>
                    </div>
                  </div>

                  {course.status === 'completed' && (
                    <div className="mb-4 rounded-lg bg-green-500/20 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-400">✓ Completed</span>
                        <span className="text-sm text-green-400">Certificate Available</span>
                      </div>
                    </div>
                  )}

                  {course.status === 'enrolled' && course.progress && (
                    <div className="mb-4">
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-gray-400">Progress</span>
                        <span className="font-semibold text-cyan-400">{course.progress}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-700">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => onCourseEnroll?.(course)}
                    disabled={course.status === 'locked'}
                    className={`w-full rounded-lg py-3 font-semibold transition-all ${
                      course.status === 'locked'
                        ? 'cursor-not-allowed bg-gray-700 text-gray-500'
                        : course.status === 'enrolled'
                          ? 'bg-cyan-600 text-white hover:bg-cyan-500'
                          : course.status === 'completed'
                            ? 'bg-gray-700 text-white hover:bg-gray-600'
                            : 'bg-purple-600 text-white hover:bg-purple-500'
                    }`}
                  >
                    {course.status === 'locked'
                      ? '🔒 Locked'
                      : course.status === 'enrolled'
                        ? 'Continue Learning'
                        : course.status === 'completed'
                          ? 'Review Course'
                          : `Enroll - $${course.price}`}
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Live Sessions View */}
        {activeView === 'live' && (
          <motion.div
            key="live"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="rounded-2xl border border-red-700 bg-gradient-to-r from-red-900/30 to-pink-900/30 p-6">
              <h3 className="mb-2 text-xl font-bold text-white">🔴 Live Now</h3>
              <p className="text-gray-300">Join ongoing sessions or register for upcoming events</p>
            </div>

            <div className="space-y-6">
              {LIVE_SESSIONS.map((session) => (
                <motion.div
                  key={session.id}
                  className="rounded-xl border border-gray-700 bg-gray-900 p-6 transition-all hover:border-gray-600"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-3 flex items-center space-x-3">
                        <div
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            session.type === 'workshop'
                              ? 'bg-blue-500/20 text-blue-400'
                              : session.type === 'masterclass'
                                ? 'bg-purple-500/20 text-purple-400'
                                : session.type === 'q&a'
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-orange-500/20 text-orange-400'
                          }`}
                        >
                          {session.type.toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-400">{session.level}</span>
                      </div>

                      <h4 className="mb-2 text-xl font-semibold text-white">{session.title}</h4>
                      <p className="mb-4 text-gray-300">{session.description}</p>

                      <div className="flex items-center space-x-6 text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">👤</span>
                          <span className="text-white">{session.instructor}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">📅</span>
                          <span className="text-white">{session.date.toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">⏱️</span>
                          <span className="text-white">{session.duration}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">👥</span>
                          <span className="text-white">
                            {session.attendees}/{session.maxAttendees}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="ml-6">
                      <div className="mb-3 text-center">
                        <div className="text-2xl font-bold text-cyan-400">
                          {session.date.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        <div className="text-xs text-gray-400">
                          {session.date > new Date() ? 'Starts in' : 'Started'}{' '}
                          {(Math.abs(session.date.getTime() - new Date().getTime()) / 60000) | 0}{' '}
                          min
                        </div>
                      </div>
                      <button
                        onClick={() => onSessionRegister?.(session)}
                        disabled={
                          !session.registrationOpen || session.attendees >= session.maxAttendees
                        }
                        className={`rounded-lg px-6 py-3 font-semibold transition-all ${
                          !session.registrationOpen || session.attendees >= session.maxAttendees
                            ? 'cursor-not-allowed bg-gray-700 text-gray-500'
                            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500'
                        }`}
                      >
                        {session.attendees >= session.maxAttendees ? 'Full' : 'Register'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Learning Resources Quick Access */}
      <div className="rounded-2xl border border-indigo-700 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 p-6">
        <h3 className="mb-4 text-xl font-bold text-white">📚 Quick Learning Resources</h3>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { name: 'Consciousness Glossary', icon: '📖', time: '5 min read' },
            { name: 'Multiplication Formulas', icon: '🧮', time: '10 min guide' },
            { name: 'Client Success Templates', icon: '📋', time: 'Download pack' },
            { name: 'Community Forum', icon: '💬', time: '24/7 support' },
          ].map((resource, index) => (
            <motion.button
              key={index}
              className="rounded-lg bg-black/30 p-4 text-left transition-all hover:bg-black/50"
              whileHover={{ scale: 1.02 }}
            >
              <div className="mb-2 text-2xl">{resource.icon}</div>
              <div className="text-sm font-medium text-white">{resource.name}</div>
              <div className="mt-1 text-xs text-gray-400">{resource.time}</div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PartnerTrainingAcademy
