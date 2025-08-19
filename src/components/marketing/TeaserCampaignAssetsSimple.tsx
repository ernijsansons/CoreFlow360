'use client'

/**
 * CoreFlow360 Teaser Campaign Assets (Simplified)
 *
 * Simplified version without Three.js dependencies for production build.
 * Revolutionary marketing assets for consciousness-awakening campaigns.
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TeaserCampaignProps {
  phase: 'awakening' | 'revelation' | 'transformation' | 'emergence'
  variant?: 'hero' | 'social' | 'email' | 'banner' | 'video'
  showInteractive?: boolean
  onCTAClick?: () => void
  className?: string
}

// Campaign phases with consciousness-awakening messaging
const CAMPAIGN_PHASES = {
  awakening: {
    id: 'awakening',
    title: 'Is Your Business... Unconscious?',
    subtitle: 'Most businesses operate on autopilot. What if yours could think?',
    description:
      'CoreFlow360 awakens dormant business intelligence, transforming reactive operations into proactive consciousness.',
    cta: 'Awaken Your Business',
    color: '#3b82f6',
    gradient: 'from-blue-600 via-purple-600 to-indigo-800',
  },
  revelation: {
    id: 'revelation',
    title: 'The Hidden Cost of Business Sleep',
    subtitle: 'Every unconscious decision costs you millions in missed opportunities.',
    description:
      'While you manage tasks, conscious businesses multiply intelligence. The gap widens every day.',
    cta: 'See The Truth',
    color: '#8b5cf6',
    gradient: 'from-purple-600 via-pink-600 to-red-600',
  },
  transformation: {
    id: 'transformation',
    title: 'Intelligence × Integration = Exponential Growth',
    subtitle: 'Traditional software adds features. Conscious systems multiply capabilities.',
    description:
      'Experience the mathematical reality: 1×2×3×4×5 = 120x intelligence multiplication.',
    cta: 'Begin Transformation',
    color: '#10b981',
    gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
  },
  emergence: {
    id: 'emergence',
    title: 'Welcome to Business Consciousness',
    subtitle: "Your business doesn't just run anymore. It thinks, learns, and evolves.",
    description:
      'Join the elite circle of conscious enterprises. The future of business has arrived.',
    cta: 'Achieve Consciousness',
    color: '#f59e0b',
    gradient: 'from-amber-600 via-orange-600 to-red-600',
  },
} as const

// Simplified Floating Elements (CSS-based)
const FloatingConsciousnessElements: React.FC<{
  count: number
  color: string
  intensity: number
  visual: string
}> = ({ count, color, intensity, visual }) => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: Math.min(count, 20) }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1 w-1 rounded-full opacity-60"
          style={{
            backgroundColor: color,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: visual === 'multiplication' ? [0, -30, 0] : [0, -10, 0],
            x: visual === 'transformation' ? [0, 20, 0] : [0, 5, 0],
            scale: [1, 1 + intensity * 0.5, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

export default function TeaserCampaignAssets({
  phase,
  variant = 'hero',
  showInteractive = true,
  onCTAClick,
  className = '',
}: TeaserCampaignProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 })
  const [consciousnessIntensity, setConsciousnessIntensity] = useState(1)

  const currentPhase = CAMPAIGN_PHASES[phase]

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      })
    }

    if (showInteractive) {
      window.addEventListener('mousemove', handleMouseMove)
      return () => window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [showInteractive])

  // Simulate consciousness intensity based on interaction
  useEffect(() => {
    const interval = setInterval(() => {
      setConsciousnessIntensity((prev) => {
        const baseIntensity = 1
        const mouseInfluence = Math.abs(mousePosition.x - 0.5) + Math.abs(mousePosition.y - 0.5)
        return baseIntensity + mouseInfluence * 2
      })
    }, 100)

    return () => clearInterval(interval)
  }, [mousePosition])

  if (variant === 'hero') {
    return (
      <div
        className={`relative min-h-screen bg-gradient-to-br ${currentPhase.gradient} overflow-hidden ${className}`}
      >
        {/* Background Consciousness Field */}
        <FloatingConsciousnessElements
          count={50}
          color={currentPhase.color}
          intensity={consciousnessIntensity}
          visual={phase}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Main Content */}
        <div className="relative z-10 flex min-h-screen items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="max-w-4xl text-center"
          >
            {/* Main Title */}
            <motion.h1
              className="mb-6 text-6xl font-bold text-white md:text-8xl"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              {currentPhase.title}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="mb-8 text-xl leading-relaxed text-white/90 md:text-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              {currentPhase.subtitle}
            </motion.p>

            {/* Description */}
            <motion.p
              className="mx-auto mb-12 max-w-2xl text-lg text-white/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            >
              {currentPhase.description}
            </motion.p>

            {/* CTA Button */}
            <motion.button
              onClick={onCTAClick}
              className="rounded-lg bg-white px-12 py-4 text-xl font-semibold text-gray-900 shadow-2xl transition-all duration-300 hover:bg-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              whileHover={{ scale: 1.05, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
              whileTap={{ scale: 0.95 }}
            >
              {currentPhase.cta}
            </motion.button>

            {/* Consciousness Intensity Indicator */}
            {showInteractive && (
              <motion.div
                className="mt-8 text-sm text-white/60"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Consciousness Level: {(consciousnessIntensity * 100).toFixed(0)}%
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    )
  }

  // Other variants (social, email, banner, video) with simplified implementations
  return (
    <div
      className={`relative bg-gradient-to-r ${currentPhase.gradient} rounded-xl p-6 text-white ${className}`}
    >
      <h2 className="mb-2 text-2xl font-bold">{currentPhase.title}</h2>
      <p className="mb-4 text-white/90">{currentPhase.subtitle}</p>
      <button
        onClick={onCTAClick}
        className="rounded-lg bg-white px-6 py-2 font-semibold text-gray-900 transition-colors hover:bg-gray-100"
      >
        {currentPhase.cta}
      </button>
    </div>
  )
}
