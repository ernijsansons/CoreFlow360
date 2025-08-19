/**
 * CoreFlow360 - Welcome & Role Selection Component
 * First step in user onboarding - role selection with personalized experience
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  Users,
  User,
  Building2,
  Target,
  TrendingUp,
  Zap,
  Brain,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { GlowingButton } from '@/components/ui/GlowingButton'

export type UserRole = 'admin' | 'manager' | 'user'

interface RoleOption {
  id: UserRole
  title: string
  subtitle: string
  description: string
  icon: unknown
  features: string[]
  color: string
  gradient: string
}

const roleOptions: RoleOption[] = [
  {
    id: 'admin',
    title: 'System Administrator',
    subtitle: 'Full Control & Configuration',
    description:
      'You manage the entire CoreFlow360 system, configure modules, and oversee all operations with AI-powered insights.',
    icon: Shield,
    features: [
      'Complete system configuration',
      'AI module orchestration',
      'User & permission management',
      'Advanced analytics & reporting',
      'Security & compliance controls',
      'Integration & API management',
    ],
    color: 'text-violet-400',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    id: 'manager',
    title: 'Department Manager',
    subtitle: 'Team Leadership & Oversight',
    description:
      'You lead a team or department with AI-assisted decision making, performance tracking, and workflow optimization.',
    icon: Users,
    features: [
      'Team performance dashboards',
      'AI-powered insights & predictions',
      'Workflow automation setup',
      'Resource allocation tools',
      'Goal setting & KPI tracking',
      'Cross-department coordination',
    ],
    color: 'text-emerald-400',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'user',
    title: 'Team Member',
    subtitle: 'Daily Operations & Tasks',
    description:
      'You focus on day-to-day tasks with AI assistance for productivity, automation, and intelligent recommendations.',
    icon: User,
    features: [
      'Personalized AI assistant',
      'Task automation & reminders',
      'Smart workflow suggestions',
      'Performance insights',
      'Collaboration tools',
      'Mobile-optimized interface',
    ],
    color: 'text-cyan-400',
    gradient: 'from-cyan-500 to-blue-600',
  },
]

interface WelcomeRoleSelectionProps {
  onRoleSelected: (role: UserRole) => void
  userEmail?: string
  companyName?: string
}

export function WelcomeRoleSelection({
  onRoleSelected,
  userEmail,
  companyName,
}: WelcomeRoleSelectionProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [hoveredRole, setHoveredRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRoleSelect = async (role: UserRole) => {
    setSelectedRole(role)
    setLoading(true)
    setError(null)

    try {
      // Track role selection via API
      const response = await fetch('/api/onboarding/role-selection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedRole: role,
          roleTitle: roleOptions.find((r) => r.id === role)?.title,
          userEmail,
          companyName,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save role selection')
      }

      const data = await response.json()

      // Small delay for visual feedback before proceeding
      setTimeout(() => {
        onRoleSelected(role)
      }, 300)
    } catch (saveError) {
      setError('Failed to save role selection')

      // Still proceed with role selection even if API fails
      setTimeout(() => {
        onRoleSelected(role)
      }, 300)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black p-4">
      <div className="mx-auto w-full max-w-7xl">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-500/50 bg-violet-900/30 px-6 py-3">
            <Sparkles className="h-5 w-5 text-violet-400" />
            <span className="font-semibold text-violet-300">Welcome to CoreFlow360</span>
          </div>

          <h1 className="mb-6 text-5xl font-bold text-white md:text-6xl">
            Welcome{companyName && ` to ${companyName}`}
            <span className="mt-4 block bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Let's Get You Started
            </span>
          </h1>

          <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-300">
            {userEmail && <span className="font-semibold text-violet-400">{userEmail}</span>}, to
            provide you with the most personalized AI-powered experience, please select your role.
            This helps our AI agents understand your needs and customize your workflow.
          </p>
        </motion.div>

        {/* Role Selection Grid */}
        <div className="mb-12 grid gap-8 md:grid-cols-3">
          {roleOptions.map((role, index) => (
            <RoleCard
              key={role.id}
              role={role}
              isSelected={selectedRole === role.id}
              isHovered={hoveredRole === role.id}
              onSelect={handleRoleSelect}
              onHover={setHoveredRole}
              delay={index * 0.1}
              loading={loading}
              disabled={loading}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-xl border border-red-500/50 bg-red-900/30 p-4 text-center"
          >
            <p className="text-red-400">{error}</p>
            <p className="mt-2 text-sm text-red-300/70">
              Don't worry, your selection was still processed
            </p>
          </motion.div>
        )}

        {/* AI Personalization Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="rounded-2xl border border-gray-800/50 bg-gray-900/50 p-8 text-center backdrop-blur-sm"
        >
          <div className="mb-6 flex justify-center">
            <div className="rounded-2xl bg-gradient-to-r from-violet-500/20 to-cyan-500/20 p-4">
              <Brain className="h-8 w-8 text-violet-400" />
            </div>
          </div>

          <h3 className="mb-4 text-2xl font-bold text-white">AI-Powered Personalization</h3>

          <p className="mx-auto mb-6 max-w-3xl text-gray-300">
            Based on your role selection, our AI will customize your dashboard, workflows, and
            recommendations. Your experience will be optimized for maximum productivity and
            efficiency from day one.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <Target className="mx-auto mb-3 h-6 w-6 text-emerald-400" />
              <h4 className="mb-2 font-semibold text-white">Smart Setup</h4>
              <p className="text-sm text-gray-400">
                AI recommends the best modules and configurations for your role
              </p>
            </div>

            <div className="text-center">
              <TrendingUp className="mx-auto mb-3 h-6 w-6 text-blue-400" />
              <h4 className="mb-2 font-semibold text-white">Adaptive Interface</h4>
              <p className="text-sm text-gray-400">
                Dashboard and workflows adjust based on your usage patterns
              </p>
            </div>

            <div className="text-center">
              <Zap className="mx-auto mb-3 h-6 w-6 text-yellow-400" />
              <h4 className="mb-2 font-semibold text-white">Intelligent Automation</h4>
              <p className="text-sm text-gray-400">
                AI automates routine tasks specific to your role and responsibilities
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

interface RoleCardProps {
  role: RoleOption
  isSelected: boolean
  isHovered: boolean
  onSelect: (role: UserRole) => void
  onHover: (role: UserRole | null) => void
  delay: number
  loading?: boolean
  disabled?: boolean
}

function RoleCard({
  role,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  delay,
  loading = false,
  disabled = false,
}: RoleCardProps) {
  const IconComponent = role.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => !disabled && onHover(role.id)}
      onHoverEnd={() => onHover(null)}
      onClick={() => !disabled && onSelect(role.id)}
      className={`group relative ${disabled ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
    >
      {/* Glow Effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${role.gradient} opacity-0 group-hover:opacity-20 ${
          isSelected ? 'opacity-30' : ''
        } rounded-3xl blur-xl transition-all duration-500`}
      />

      {/* Card Background */}
      <div
        className={`relative rounded-3xl border-2 bg-gray-900/60 p-8 backdrop-blur-sm transition-all duration-300 ${
          isSelected
            ? `border-transparent bg-gradient-to-br ${role.gradient} bg-opacity-20`
            : 'border-gray-800/50 group-hover:border-gray-700/50'
        }`}
      >
        {/* Selection Indicator */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute -top-4 -right-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 p-2 text-white"
            >
              <CheckCircle className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Role Icon */}
        <div
          className={`bg-gradient-to-r p-4 ${role.gradient} bg-opacity-20 mb-6 w-fit rounded-2xl`}
        >
          <IconComponent className={`h-8 w-8 ${role.color}`} />
        </div>

        {/* Role Title & Subtitle */}
        <h3 className="mb-2 text-2xl font-bold text-white">{role.title}</h3>

        <p className={`mb-4 text-base font-semibold ${role.color}`}>{role.subtitle}</p>

        {/* Role Description */}
        <p className="mb-6 leading-relaxed text-gray-300">{role.description}</p>

        {/* Key Features */}
        <div className="mb-8 space-y-3">
          {role.features.map((feature, index) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: delay + index * 0.05 }}
              className="flex items-center gap-3"
            >
              <div className={`h-2 w-2 bg-gradient-to-r ${role.gradient} rounded-full`} />
              <span className="text-sm text-gray-400">{feature}</span>
            </motion.div>
          ))}
        </div>

        {/* Select Button */}
        <div className="border-t border-gray-800/50 pt-4">
          <GlowingButton
            onClick={() => !disabled && onSelect(role.id)}
            className="w-full"
            variant={isSelected ? 'primary' : 'outline'}
            disabled={disabled}
          >
            {loading && isSelected ? (
              <>
                Saving...
                <div className="ml-2 h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              </>
            ) : isSelected ? (
              <>
                Selected
                <CheckCircle className="ml-2 h-5 w-5" />
              </>
            ) : (
              <>
                Choose This Role
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </GlowingButton>
        </div>
      </div>
    </motion.div>
  )
}
