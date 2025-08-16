'use client'

/**
 * Partner Training Academy
 * 
 * Comprehensive training platform for consciousness transformation consultants
 * with interactive courses, live sessions, and certification pathways.
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, Box, Text3D } from '@react-three/drei'
import * as THREE from 'three'

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
    color: '#10B981'
  },
  {
    id: 'intelligence-multiplication',
    name: 'Intelligence Multiplication',
    description: 'Learn to multiply business intelligence exponentially',
    courses: ['multiplication-theory', 'synergy-creation', 'roi-optimization'],
    duration: '8 weeks',
    certification: 'Advanced',
    icon: '⚡',
    color: '#3B82F6'
  },
  {
    id: 'enterprise-transformation',
    name: 'Enterprise Transformation',
    description: 'Architect consciousness for complex organizations',
    courses: ['enterprise-strategy', 'change-management', 'executive-coaching'],
    duration: '12 weeks',
    certification: 'Master',
    icon: '🎯',
    color: '#8B5CF6'
  },
  {
    id: 'consciousness-mastery',
    name: 'Consciousness Mastery',
    description: 'Achieve transcendent business transformation capabilities',
    courses: ['reality-shaping', 'field-creation', 'organism-design'],
    duration: '16 weeks',
    certification: 'Transcendent',
    icon: '✨',
    color: '#EC4899'
  }
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
    skills: ['Consciousness assessment', 'Linear vs exponential thinking', 'Basic transformation planning'],
    prerequisites: [],
    certificateAwarded: true,
    price: 497,
    status: 'completed',
    progress: 100,
    consciousnessLevel: 1
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
    consciousnessLevel: 3
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
    consciousnessLevel: 5
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
    consciousnessLevel: 8
  }
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
    registrationOpen: true
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
    registrationOpen: true
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
    registrationOpen: true
  }
]

// 3D Course Visualization
const CourseVisualization: React.FC<{ progress: number; level: string }> = ({ progress, level }) => {
  const meshRef = React.useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.05)
    }
  })

  const getColor = () => {
    switch (level) {
      case 'beginner': return '#10B981'
      case 'intermediate': return '#3B82F6'
      case 'advanced': return '#8B5CF6'
      case 'master': return '#EC4899'
      default: return '#6B7280'
    }
  }

  return (
    <group>
      <mesh ref={meshRef}>
        <torusGeometry args={[1, 0.4, 16, 32]} />
        <meshStandardMaterial
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      {/* Progress Ring */}
      <mesh rotation-x={Math.PI / 2}>
        <ringGeometry args={[1.2, 1.4, 32, 1, 0, (progress / 100) * Math.PI * 2]} />
        <meshStandardMaterial
          color="#06B6D4"
          emissive="#06B6D4"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  )
}

const PartnerTrainingAcademy: React.FC<PartnerTrainingAcademyProps> = ({
  partnerId = 'demo-partner',
  certificationLevel = 'advanced',
  onCourseEnroll,
  onSessionRegister,
  className = ''
}) => {
  const [activeView, setActiveView] = useState<'dashboard' | 'courses' | 'paths' | 'live'>('dashboard')
  const [selectedPath, setSelectedPath] = useState<TrainingPath | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [learningStats, setLearningStats] = useState({
    coursesCompleted: 12,
    hoursLearned: 156,
    certificatesEarned: 3,
    currentStreak: 7
  })

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return '#10B981'
      case 'intermediate': return '#3B82F6'
      case 'advanced': return '#8B5CF6'
      case 'master': return '#EC4899'
      default: return '#6B7280'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10B981'
      case 'enrolled': return '#3B82F6'
      case 'available': return '#6B7280'
      case 'locked': return '#EF4444'
      default: return '#6B7280'
    }
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-thin text-white">
          🎓 Partner Training Academy
        </h2>
        <p className="text-xl text-gray-300 max-w-4xl mx-auto">
          Master the art and science of consciousness transformation through 
          interactive courses, live sessions, and expert guidance
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center space-x-2">
        {[
          { id: 'dashboard', name: 'Dashboard', icon: '📊' },
          { id: 'paths', name: 'Learning Paths', icon: '🛤️' },
          { id: 'courses', name: 'All Courses', icon: '📚' },
          { id: 'live', name: 'Live Sessions', icon: '🔴' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as any)}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
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
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { label: 'Courses Completed', value: learningStats.coursesCompleted, icon: '✅', color: 'from-green-600 to-emerald-600' },
                { label: 'Hours Learned', value: learningStats.hoursLearned, icon: '⏱️', color: 'from-blue-600 to-cyan-600' },
                { label: 'Certificates', value: learningStats.certificatesEarned, icon: '🏆', color: 'from-purple-600 to-pink-600' },
                { label: 'Learning Streak', value: `${learningStats.currentStreak} days`, icon: '🔥', color: 'from-orange-600 to-red-600' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-900 border border-gray-700 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl">{stat.icon}</div>
                    <div className={`px-3 py-1 rounded-lg bg-gradient-to-r ${stat.color} text-white text-xs font-medium`}>
                      Active
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Current Courses */}
            <div className="bg-gradient-to-r from-gray-900 to-black border border-gray-700 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">📖 Continue Learning</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {SAMPLE_COURSES.filter(c => c.status === 'enrolled').map((course) => (
                  <div
                    key={course.id}
                    className="bg-black/30 rounded-xl p-6 border border-gray-700"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-24 w-24">
                        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                          <ambientLight intensity={0.5} />
                          <pointLight position={[10, 10, 10]} />
                          <CourseVisualization progress={course.progress || 0} level={course.level} />
                        </Canvas>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-cyan-400">{course.progress}%</div>
                        <div className="text-xs text-gray-400">Complete</div>
                      </div>
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">{course.title}</h4>
                    <p className="text-sm text-gray-400 mb-4">Instructor: {course.instructor}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {course.modules} modules • {course.duration}
                      </div>
                      <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-all">
                        Continue →
                      </button>
                    </div>
                    {/* Progress Bar */}
                    <div className="mt-4 w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Live Sessions */}
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">🔴 Upcoming Live Sessions</h3>
                <button
                  onClick={() => setActiveView('live')}
                  className="text-cyan-400 hover:text-cyan-300 text-sm"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-4">
                {LIVE_SESSIONS.slice(0, 2).map((session) => (
                  <div
                    key={session.id}
                    className="bg-black/30 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-white">{session.title}</h4>
                        <p className="text-sm text-gray-400">
                          {session.instructor} • {session.date.toLocaleDateString()} at {session.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <button
                        onClick={() => onSessionRegister?.(session)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-all"
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
            <div className="grid md:grid-cols-2 gap-8">
              {TRAINING_PATHS.map((path) => (
                <motion.div
                  key={path.id}
                  className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-2xl p-8 cursor-pointer hover:border-gray-600 transition-all"
                  onClick={() => setSelectedPath(path)}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="text-5xl">{path.icon}</div>
                    <div 
                      className="px-3 py-1 rounded-full text-sm font-medium text-white"
                      style={{ backgroundColor: path.color }}
                    >
                      {path.certification}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{path.name}</h3>
                  <p className="text-gray-300 mb-6">{path.description}</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Duration</span>
                      <span className="text-white font-semibold">{path.duration}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Courses</span>
                      <span className="text-white font-semibold">{path.courses.length} courses</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Certification</span>
                      <span className="text-white font-semibold">{path.certification} Level</span>
                    </div>
                  </div>
                  <motion.button
                    className="w-full mt-6 py-3 rounded-lg font-semibold text-white transition-all"
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
                className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-700 rounded-2xl p-8"
              >
                <h3 className="text-2xl font-bold text-white mb-6">
                  {selectedPath.icon} {selectedPath.name} - Course Sequence
                </h3>
                <div className="space-y-4">
                  {selectedPath.courses.map((courseId, index) => {
                    const course = SAMPLE_COURSES.find(c => c.id === courseId)
                    if (!course) return null
                    return (
                      <div
                        key={courseId}
                        className="flex items-center space-x-4 bg-black/30 rounded-lg p-4"
                      >
                        <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">{course.title}</h4>
                          <p className="text-sm text-gray-400">{course.duration} • {course.modules} modules</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          course.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          course.status === 'enrolled' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-700 text-gray-400'
                        }`}>
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
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SAMPLE_COURSES.filter(c => selectedCategory === 'all' || c.category === selectedCategory).map((course) => (
                <motion.div
                  key={course.id}
                  className="bg-gray-900 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getLevelColor(course.level) }}
                      />
                      <span className="text-xs text-gray-400 uppercase">{course.level}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-400">★</span>
                      <span className="text-white font-semibold">{course.rating}</span>
                    </div>
                  </div>

                  <h4 className="text-lg font-semibold text-white mb-2">{course.title}</h4>
                  <p className="text-sm text-gray-400 mb-1">By {course.instructor}</p>
                  <p className="text-sm text-gray-300 mb-4">{course.description}</p>

                  <div className="space-y-2 mb-4">
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
                    <div className="bg-green-500/20 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-green-400 text-sm font-medium">✓ Completed</span>
                        <span className="text-green-400 text-sm">Certificate Available</span>
                      </div>
                    </div>
                  )}

                  {course.status === 'enrolled' && course.progress && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-cyan-400 font-semibold">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => onCourseEnroll?.(course)}
                    disabled={course.status === 'locked'}
                    className={`w-full py-3 rounded-lg font-semibold transition-all ${
                      course.status === 'locked'
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : course.status === 'enrolled'
                          ? 'bg-cyan-600 text-white hover:bg-cyan-500'
                          : course.status === 'completed'
                            ? 'bg-gray-700 text-white hover:bg-gray-600'
                            : 'bg-purple-600 text-white hover:bg-purple-500'
                    }`}
                  >
                    {course.status === 'locked' ? '🔒 Locked' :
                     course.status === 'enrolled' ? 'Continue Learning' :
                     course.status === 'completed' ? 'Review Course' :
                     `Enroll - $${course.price}`}
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
            <div className="bg-gradient-to-r from-red-900/30 to-pink-900/30 border border-red-700 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-2">🔴 Live Now</h3>
              <p className="text-gray-300">Join ongoing sessions or register for upcoming events</p>
            </div>

            <div className="space-y-6">
              {LIVE_SESSIONS.map((session) => (
                <motion.div
                  key={session.id}
                  className="bg-gray-900 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          session.type === 'workshop' ? 'bg-blue-500/20 text-blue-400' :
                          session.type === 'masterclass' ? 'bg-purple-500/20 text-purple-400' :
                          session.type === 'q&a' ? 'bg-green-500/20 text-green-400' :
                          'bg-orange-500/20 text-orange-400'
                        }`}>
                          {session.type.toUpperCase()}
                        </div>
                        <span className="text-gray-400 text-sm">{session.level}</span>
                      </div>
                      
                      <h4 className="text-xl font-semibold text-white mb-2">{session.title}</h4>
                      <p className="text-gray-300 mb-4">{session.description}</p>
                      
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
                          <span className="text-white">{session.attendees}/{session.maxAttendees}</span>
                        </div>
                      </div>
                    </div>

                    <div className="ml-6">
                      <div className="text-center mb-3">
                        <div className="text-2xl font-bold text-cyan-400">
                          {session.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-xs text-gray-400">
                          {session.date > new Date() ? 'Starts in' : 'Started'} {Math.abs(session.date.getTime() - new Date().getTime()) / 60000 | 0} min
                        </div>
                      </div>
                      <button
                        onClick={() => onSessionRegister?.(session)}
                        disabled={!session.registrationOpen || session.attendees >= session.maxAttendees}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                          !session.registrationOpen || session.attendees >= session.maxAttendees
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
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
      <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-700 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">📚 Quick Learning Resources</h3>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { name: 'Consciousness Glossary', icon: '📖', time: '5 min read' },
            { name: 'Multiplication Formulas', icon: '🧮', time: '10 min guide' },
            { name: 'Client Success Templates', icon: '📋', time: 'Download pack' },
            { name: 'Community Forum', icon: '💬', time: '24/7 support' }
          ].map((resource, index) => (
            <motion.button
              key={index}
              className="bg-black/30 rounded-lg p-4 text-left hover:bg-black/50 transition-all"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-2xl mb-2">{resource.icon}</div>
              <div className="text-white font-medium text-sm">{resource.name}</div>
              <div className="text-xs text-gray-400 mt-1">{resource.time}</div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PartnerTrainingAcademy