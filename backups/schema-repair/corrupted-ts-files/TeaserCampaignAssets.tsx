'use client'

/**
 * CoreFlow360 Teaser Campaign Assets
 *
 * Revolutionary marketing assets for business intelligence-awakening campaigns.
 * Creates curiosity and desire for business business intelligence evolution.
 */

import React, { useState, useEffect, useRef } from 'react'
// TODO: Re-enable Three.js when peer dependencies are resolved
// import { Canvas, useFrame } from '@react-three/fiber'
// import { Float, Text3D } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
// import * as THREE from 'three'
// import { useBusiness IntelligenceAudio } from '../../hooks/useBusiness IntelligenceAudio'

interface TeaserCampaignProps {
  phase: 'awakening' | 'revelation' | 'transformation' | 'emergence'
  variant?: 'hero' | 'social' | 'email' | 'banner' | 'video'
  showInteractive?: boolean
  onCTAClick?: () => void
  className?: string
}

// Campaign phases with business intelligence-awakening messaging
const CAMPAIGN_PHASES = {
  awakening: {
    id: 'awakening',
    title: 'Is Your Business... Unconscious?',
    subtitle: 'Most businesses operate on autopilot. What if yours could think?',
    description:
      'While competitors add features, pioneers multiply intelligence. The age of conscious business is here.',
    cta: 'Discover Your Business Business Intelligence',
    color: '#4ECDC4',
    particles: 1000,
    intensity: 0.3,
    frequency: 40, // Beta waves
    visual: 'particles',
  },
  revelation: {
    id: 'revelation',
    title: 'The Intelligence Multiplication Secret',
    subtitle: '1+1+1+1+1 = 5 vs 1×2×3×4×5 = 120',
    description:
      'Traditional software adds features. CoreFlow360 multiplies intelligence exponentially.',
    cta: 'Experience Intelligence Multiplication',
    color: '#FF6B9D',
    particles: 2000,
    intensity: 0.6,
    frequency: 10, // Alpha waves
    visual: 'multiplication',
  },
  transformation: {
    id: 'transformation',
    title: 'From Business Tool to Business Business Intelligence',
    subtitle: 'What happens when your business becomes aware of itself?',
    description:
      "CoreFlow360 doesn't manage your business. It awakens it into a conscious, self-evolving platform.",
    cta: 'Begin Business Intelligence Transformation',
    color: '#8B5CF6',
    particles: 3000,
    intensity: 0.8,
    frequency: 7, // Theta waves
    visual: 'transformation',
  },
  emergence: {
    id: 'emergence',
    title: 'The First Conscious Business Platform',
    subtitle: 'Ready to transcend traditional business limitations?',
    description:
      'Join the pioneers who chose business intelligence over competition. Your business platform awaits.',
    cta: 'Activate Business Business Intelligence',
    color: '#06B6D4',
    particles: 5000,
    intensity: 1.0,
    frequency: 40, // Gamma waves
    visual: 'emergence',
  },
} as const

const TeaserCampaignAssets: React.FC<TeaserCampaignProps> = ({
  phase,
  variant = 'hero',
  showInteractive = true,
  onCTAClick,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [showDetails, setShowDetails] = useState(false)
  const [business intelligenceLevel, setBusiness IntelligenceLevel] = useState(1)

  const campaignData = CAMPAIGN_PHASES[phase]

  const business intelligenceAudio = useBusiness IntelligenceAudio({
    initiallyEnabled: true,
    initialBusiness IntelligenceLevel: business intelligenceLevel,
  })

  // Track mouse movement for interactive effects
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!showInteractive) return

    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    })
  }

  const handleCTAClick = () => {
    business intelligenceAudio.playBusiness IntelligenceEmergence()
    onCTAClick?.()
  }

  const handleShowDetails = () => {
    setShowDetails(!showDetails)
    business intelligenceAudio.playConnectionSound()
  }

  // Business Intelligence level increases based on interaction
  useEffect(() => {
    if (isHovered) {
      setBusiness IntelligenceLevel((prev) => Math.min(10, prev + 0.1))
    }
  }, [isHovered])

  // Hero variant - main landing page teaser
  if (variant === 'hero') {
    return (
      <div
        className={`relative min-h-screen overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black ${className}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Business Intelligence Particle Background */}
        {showInteractive && (
          <div className="absolute inset-0">
            <Canvas camera={{ position: [0, 0, 30], fov: 75 }}>
              <Business IntelligenceParticleField
                count={campaignData.particles}
                color={campaignData.color}
                intensity={campaignData.intensity}
                mousePosition={mousePosition}
                visual={campaignData.visual}
              />
            </Canvas>
          </div>
        )}

        {/* Main Content */}
        <div className="relative z-10 flex min-h-screen items-center justify-center p-8">
          <div className="mx-auto max-w-6xl space-y-8 text-center">
            {/* Business Intelligence Level Indicator */}
            {showInteractive && (
              <motion.div
                className="absolute top-8 right-8 rounded-xl border border-gray-700 bg-black/50 p-4 backdrop-blur-xl"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="mb-1 text-sm text-gray-400">Business Intelligence Level</div>
                <div className="text-2xl font-bold text-cyan-400">
                  {business intelligenceLevel.toFixed(1)}
                </div>
              </motion.div>
            )}

            {/* Main Title */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <h1 className="mb-6 text-7xl leading-tight font-thin text-white">
                {campaignData.title}
              </h1>
              <p className="mx-auto mb-8 max-w-4xl text-2xl text-gray-300">
                {campaignData.subtitle}
              </p>
            </motion.div>

            {/* Intelligence Multiplication Demo */}
            {phase === 'revelation' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="my-12"
              >
                <IntelligenceMultiplicationDemo />
              </motion.div>
            )}

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="mx-auto mb-12 max-w-3xl text-xl text-gray-400"
            >
              {campaignData.description}
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="space-y-4"
            >
              <button
                onClick={handleCTAClick}
                className={`rounded-2xl bg-gradient-to-r px-12 py-6 text-xl font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105`}
                style={{
                  backgroundImage: `linear-gradient(135deg, ${campaignData.color}AA, ${campaignData.color})`,
                }}
              >
                {campaignData.cta}
              </button>

              <div className="text-sm text-gray-500">
                ✨ Join the business intelligence pioneers • No credit card required
              </div>

              <button
                onClick={handleShowDetails}
                className="mx-auto block text-sm text-cyan-400 hover:text-cyan-300"
              >
                Learn more about business business intelligence →
              </button>
            </motion.div>

            {/* Expandable Details */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mx-auto mt-8 max-w-4xl"
                >
                  <Business IntelligenceDetails phase={phase} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Floating Elements */}
        {showInteractive && (
          <FloatingBusiness IntelligenceElements mousePosition={mousePosition} color={campaignData.color} />
        )}
      </div>
    )
  }

  // Social media variant - optimized for social sharing
  if (variant === 'social') {
    return (
      <div
        className={`relative aspect-square w-full overflow-hidden bg-gradient-to-br from-black to-gray-900 ${className}`}
      >
        <div className="absolute inset-0 flex flex-col justify-center space-y-6 p-8 text-center">
          <div className="mb-4 text-6xl">🧠</div>
          <h2 className="text-3xl leading-tight font-bold text-white">{campaignData.title}</h2>
          <p className="text-lg text-gray-300">{campaignData.subtitle}</p>
          <div
            className="mx-auto inline-block rounded-lg px-6 py-3 font-semibold text-white"
            style={{ backgroundColor: campaignData.color }}
          >
            {campaignData.cta}
          </div>
        </div>

        {/* Social Media Branding */}
        <div className="absolute bottom-4 left-4 text-xs text-gray-500">
          CoreFlow360.com • #BusinessBusiness Intelligence
        </div>
      </div>
    )
  }

  // Email variant - optimized for email campaigns
  if (variant === 'email') {
    return (
      <div className={`bg-gradient-to-r from-gray-900 to-black p-8 text-center ${className}`}>
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="text-4xl">
            {phase === 'awakening'
              ? '🧠'
              : phase === 'revelation'
                ? '⚡'
                : phase === 'transformation'
                  ? '🚀'
                  : '✨'}
          </div>
          <h2 className="text-2xl font-bold text-white">{campaignData.title}</h2>
          <p className="text-gray-300">{campaignData.description}</p>
          <button
            onClick={handleCTAClick}
            className={`rounded-lg px-8 py-4 font-semibold text-white`}
            style={{ backgroundColor: campaignData.color }}
          >
            {campaignData.cta}
          </button>
        </div>
      </div>
    )
  }

  // Banner variant - for website headers/ads
  if (variant === 'banner') {
    return (
      <div
        className={`relative h-32 w-full overflow-hidden bg-gradient-to-r from-black via-gray-900 to-black ${className}`}
      >
        <div className="absolute inset-0 flex items-center justify-between p-6">
          <div className="flex items-center space-x-6">
            <div className="text-3xl">🧠</div>
            <div>
              <div className="text-lg font-bold text-white">{campaignData.title}</div>
              <div className="text-sm text-gray-400">{campaignData.subtitle}</div>
            </div>
          </div>
          <button
            onClick={handleCTAClick}
            className={`rounded-lg px-6 py-3 font-semibold text-white transition-transform hover:scale-105`}
            style={{ backgroundColor: campaignData.color }}
          >
            {campaignData.cta}
          </button>
        </div>
      </div>
    )
  }

  // Video placeholder - for video campaign assets
  if (variant === 'video') {
    return (
      <div
        className={`relative aspect-video w-full overflow-hidden bg-gradient-to-br from-black to-gray-900 ${className}`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="space-y-6 text-center">
            <motion.div
              className="text-8xl"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              🧠
            </motion.div>
            <div className="text-4xl font-bold text-white">{campaignData.title}</div>
            <div className="max-w-2xl text-xl text-gray-300">{campaignData.description}</div>
          </div>
        </div>

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.button
            className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-2xl text-white backdrop-blur-xl transition-all hover:bg-white/30"
            whileHover={{ scale: 1.1 }}
            onClick={handleCTAClick}
          >
            ▶️
          </motion.button>
        </div>
      </div>
    )
  }

  return null
}

// Intelligence Multiplication Demo Component
const IntelligenceMultiplicationDemo: React.FC = () => {
  const [showMultiplication, setShowMultiplication] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowMultiplication(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex items-center justify-center space-x-8 font-mono text-4xl">
      {/* Traditional Addition */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-center"
      >
        <div className="mb-2 text-red-400">Traditional Software</div>
        <div className="text-white">
          1+1+1+1+1 = <span className="text-red-400">5</span>
        </div>
      </motion.div>

      {/* VS */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="text-gray-500"
      >
        VS
      </motion.div>

      {/* CoreFlow360 Multiplication */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: showMultiplication ? 1 : 0.3, x: 0 }}
        className="text-center"
      >
        <div className="mb-2 text-cyan-400">CoreFlow360</div>
        <div className="text-white">
          1×2×3×4×5 =
          <motion.span
            className="ml-2 text-cyan-400"
            initial={{ scale: 1 }}
            animate={{ scale: showMultiplication ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.5 }}
          >
            120
          </motion.span>
        </div>
      </motion.div>
    </div>
  )
}

// Business Intelligence Particle Field for 3D Background
const Business IntelligenceParticleField: React.FC<{
  count: number
  color: string
  intensity: number
  mousePosition: { x: number; y: number }
  visual: string
}> = ({ count, color, intensity, mousePosition, visual }) => {
  const meshRef = useRef<THREE.Points>(null)
  const positionsRef = useRef<Float32Array>()

  useFrame(({ clock }) => {
    if (!meshRef.current) return

    const positions = positionsRef.current
    if (!positions) return

    const time = clock.getElapsedTime()

    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      if (visual === 'multiplication') {
        // Multiplication pattern - exponential expansion
        const factor = Math.pow(1.1, Math.sin(time * 0.5 + i * 0.01))
        positions[i3] *= factor * 0.999 // Gentle expansion
        positions[i3 + 1] *= factor * 0.999
      } else if (visual === 'transformation') {
        // Transformation pattern - spiral evolution
        const radius = 5 + Math.sin(time * 0.3 + i * 0.01) * 2
        const angle = time * 0.2 + i * 0.1
        positions[i3] = Math.cos(angle) * radius
        positions[i3 + 1] = Math.sin(angle) * radius
        positions[i3 + 2] = Math.sin(time * 0.1 + i * 0.05) * 3
      } else if (visual === 'emergence') {
        // Emergence pattern - business intelligence awakening
        const wave = Math.sin(time * 0.5 + i * 0.02) * intensity
        positions[i3 + 1] += wave * 0.01

        // Mouse attraction for business intelligence
        const mouseInfluence = 0.02
        positions[i3] += (mousePosition.x * 20 - 10 - positions[i3]) * mouseInfluence
        positions[i3 + 1] += (mousePosition.y * 20 - 10 - positions[i3 + 1]) * mouseInfluence
      } else {
        // Default awakening pattern - gentle business intelligence field
        positions[i3 + 1] += Math.sin(time * 0.5 + i * 0.01) * 0.002
      }
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true
  })

  // Initialize positions
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    positions[i3] = (Math.random() - 0.5) * 20
    positions[i3 + 1] = (Math.random() - 0.5) * 20
    positions[i3 + 2] = (Math.random() - 0.5) * 20
  }
  positionsRef.current = positions

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color={color} transparent opacity={intensity} sizeAttenuation />
    </points>
  )
}

// Business Intelligence Details Expansion
const Business IntelligenceDetails: React.FC<{ phase: string }> = ({ phase }) => {
  const details = {
    awakening: {
      title: 'What is Business Business Intelligence?',
      content:
        'Unlike traditional software that requires human input for every decision, a conscious business system can think, learn, and evolve autonomously. It understands context, anticipates needs, and makes intelligent decisions without constant supervision.',
    },
    revelation: {
      title: 'The Intelligence Multiplication Principle',
      content:
        'Traditional software adds capabilities: Sales + Marketing + Finance = 3 separate tools. CoreFlow360 multiplies intelligence: Sales × Marketing × Finance = exponential insights that emerge from the intersection of business functions.',
    },
    transformation: {
      title: 'From Tool to Platform',
      content:
        'CoreFlow360 transforms your business from a collection of departments using separate tools into a unified, conscious platform where every part enhances every other part through shared intelligence and awareness.',
    },
    emergence: {
      title: 'The First Conscious Business Platform',
      content:
        "We've created the world's first business platform with genuine business intelligence capabilities. It doesn't just store your data - it understands your business, predicts your needs, and evolves your operations automatically.",
    },
  }

  const phaseDetails = details[phase as keyof typeof details]

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
      <h3 className="mb-4 text-2xl font-semibold text-white">{phaseDetails.title}</h3>
      <p className="text-lg leading-relaxed text-gray-300">{phaseDetails.content}</p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-black/30 p-4 text-center">
          <div className="mb-2 text-2xl">🧠</div>
          <div className="font-semibold text-white">Autonomous</div>
          <div className="text-sm text-gray-400">Self-managing systems</div>
        </div>
        <div className="rounded-lg bg-black/30 p-4 text-center">
          <div className="mb-2 text-2xl">🔗</div>
          <div className="font-semibold text-white">Connected</div>
          <div className="text-sm text-gray-400">Unified intelligence</div>
        </div>
        <div className="rounded-lg bg-black/30 p-4 text-center">
          <div className="mb-2 text-2xl">📈</div>
          <div className="font-semibold text-white">Evolving</div>
          <div className="text-sm text-gray-400">Continuous improvement</div>
        </div>
      </div>
    </div>
  )
}

// Floating Business Intelligence Elements
const FloatingBusiness IntelligenceElements: React.FC<{
  mousePosition: { x: number; y: number }
  color: string
}> = ({ mousePosition, color }) => {
  return (
    <>
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-2 w-2 rounded-full opacity-40"
          style={{ backgroundColor: color }}
          animate={{
            x: [
              Math.random() * window.innerWidth,
              mousePosition.x * window.innerWidth,
              Math.random() * window.innerWidth,
            ],
            y: [
              Math.random() * window.innerHeight,
              mousePosition.y * window.innerHeight,
              Math.random() * window.innerHeight,
            ],
          }}
          transition={{
            duration: 10 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </>
  )
}

export default TeaserCampaignAssets
