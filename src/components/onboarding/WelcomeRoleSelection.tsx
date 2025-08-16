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
  Sparkles
} from 'lucide-react'
import { GlowingButton } from '@/components/ui/GlowingButton'

export type UserRole = 'admin' | 'manager' | 'user'

interface RoleOption {
  id: UserRole
  title: string
  subtitle: string
  description: string
  icon: any
  features: string[]
  color: string
  gradient: string
}

const roleOptions: RoleOption[] = [
  {
    id: 'admin',
    title: 'System Administrator',
    subtitle: 'Full Control & Configuration',
    description: 'You manage the entire CoreFlow360 system, configure modules, and oversee all operations with AI-powered insights.',
    icon: Shield,
    features: [
      'Complete system configuration',
      'AI module orchestration',
      'User & permission management',
      'Advanced analytics & reporting',
      'Security & compliance controls',
      'Integration & API management'
    ],
    color: 'text-violet-400',
    gradient: 'from-violet-500 to-purple-600'
  },
  {
    id: 'manager',
    title: 'Department Manager',
    subtitle: 'Team Leadership & Oversight',
    description: 'You lead a team or department with AI-assisted decision making, performance tracking, and workflow optimization.',
    icon: Users,
    features: [
      'Team performance dashboards',
      'AI-powered insights & predictions',
      'Workflow automation setup',
      'Resource allocation tools',
      'Goal setting & KPI tracking',
      'Cross-department coordination'
    ],
    color: 'text-emerald-400',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'user',
    title: 'Team Member',
    subtitle: 'Daily Operations & Tasks',
    description: 'You focus on day-to-day tasks with AI assistance for productivity, automation, and intelligent recommendations.',
    icon: User,
    features: [
      'Personalized AI assistant',
      'Task automation & reminders',
      'Smart workflow suggestions',
      'Performance insights',
      'Collaboration tools',
      'Mobile-optimized interface'
    ],
    color: 'text-cyan-400',
    gradient: 'from-cyan-500 to-blue-600'
  }
]

interface WelcomeRoleSelectionProps {
  onRoleSelected: (role: UserRole) => void
  userEmail?: string
  companyName?: string
}

export function WelcomeRoleSelection({ 
  onRoleSelected, 
  userEmail,
  companyName 
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
          roleTitle: roleOptions.find(r => r.id === role)?.title,
          userEmail,
          companyName,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save role selection')
      }

      const data = await response.json()
      console.log('Role selection saved:', data)
      
      // Small delay for visual feedback before proceeding
      setTimeout(() => {
        onRoleSelected(role)
      }, 300)
      
    } catch (saveError) {
      console.error('Failed to save role selection:', saveError)
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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-7xl mx-auto">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-violet-900/30 border border-violet-500/50 px-6 py-3 rounded-full mb-8">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <span className="text-violet-300 font-semibold">Welcome to CoreFlow360</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Welcome{companyName && ` to ${companyName}`}
            <span className="block mt-4 bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Let's Get You Started
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {userEmail && (
              <span className="text-violet-400 font-semibold">{userEmail}</span>
            )}, to provide you with the most personalized AI-powered experience, 
            please select your role. This helps our AI agents understand your needs and customize your workflow.
          </p>
        </motion.div>

        {/* Role Selection Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
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
            className="bg-red-900/30 border border-red-500/50 rounded-xl p-4 mb-8 text-center"
          >
            <p className="text-red-400">{error}</p>
            <p className="text-red-300/70 text-sm mt-2">Don't worry, your selection was still processed</p>
          </motion.div>
        )}

        {/* AI Personalization Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-8 text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 rounded-2xl">
              <Brain className="w-8 h-8 text-violet-400" />
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-4">
            AI-Powered Personalization
          </h3>
          
          <p className="text-gray-300 mb-6 max-w-3xl mx-auto">
            Based on your role selection, our AI will customize your dashboard, workflows, and recommendations. 
            Your experience will be optimized for maximum productivity and efficiency from day one.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <Target className="w-6 h-6 text-emerald-400 mx-auto mb-3" />
              <h4 className="font-semibold text-white mb-2">Smart Setup</h4>
              <p className="text-sm text-gray-400">
                AI recommends the best modules and configurations for your role
              </p>
            </div>
            
            <div className="text-center">
              <TrendingUp className="w-6 h-6 text-blue-400 mx-auto mb-3" />
              <h4 className="font-semibold text-white mb-2">Adaptive Interface</h4>
              <p className="text-sm text-gray-400">
                Dashboard and workflows adjust based on your usage patterns
              </p>
            </div>
            
            <div className="text-center">
              <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-3" />
              <h4 className="font-semibold text-white mb-2">Intelligent Automation</h4>
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
  disabled = false
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
      className={`relative group ${disabled ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
    >
      {/* Glow Effect */}
      <div className={`absolute inset-0 bg-gradient-to-r ${role.gradient} opacity-0 group-hover:opacity-20 ${
        isSelected ? 'opacity-30' : ''
      } rounded-3xl blur-xl transition-all duration-500`} />
      
      {/* Card Background */}
      <div className={`relative bg-gray-900/60 backdrop-blur-sm border-2 rounded-3xl p-8 transition-all duration-300 ${
        isSelected 
          ? `border-transparent bg-gradient-to-br ${role.gradient} bg-opacity-20` 
          : 'border-gray-800/50 group-hover:border-gray-700/50'
      }`}>
        
        {/* Selection Indicator */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute -top-4 -right-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full p-2"
            >
              <CheckCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Role Icon */}
        <div className={`p-4 bg-gradient-to-r ${role.gradient} bg-opacity-20 rounded-2xl mb-6 w-fit`}>
          <IconComponent className={`w-8 h-8 ${role.color}`} />
        </div>

        {/* Role Title & Subtitle */}
        <h3 className="text-2xl font-bold text-white mb-2">
          {role.title}
        </h3>
        
        <p className={`text-base font-semibold mb-4 ${role.color}`}>
          {role.subtitle}
        </p>

        {/* Role Description */}
        <p className="text-gray-300 leading-relaxed mb-6">
          {role.description}
        </p>

        {/* Key Features */}
        <div className="space-y-3 mb-8">
          {role.features.map((feature, index) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: delay + (index * 0.05) }}
              className="flex items-center gap-3"
            >
              <div className={`w-2 h-2 bg-gradient-to-r ${role.gradient} rounded-full`} />
              <span className="text-sm text-gray-400">{feature}</span>
            </motion.div>
          ))}
        </div>

        {/* Select Button */}
        <div className="pt-4 border-t border-gray-800/50">
          <GlowingButton
            onClick={() => !disabled && onSelect(role.id)}
            className="w-full"
            variant={isSelected ? 'primary' : 'outline'}
            disabled={disabled}
          >
            {loading && isSelected ? (
              <>
                Saving...
                <div className="ml-2 w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </>
            ) : isSelected ? (
              <>
                Selected
                <CheckCircle className="ml-2 w-5 h-5" />
              </>
            ) : (
              <>
                Choose This Role
                <ArrowRight className="ml-2 w-5 h-5" />
              </>
            )}
          </GlowingButton>
        </div>
      </div>
    </motion.div>
  )
}